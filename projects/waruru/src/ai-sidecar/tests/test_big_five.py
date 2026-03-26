"""
Tests for the Big Five compatibility scoring engine.

Run with:
    uv run pytest tests/test_big_five.py -v
"""

from __future__ import annotations

import math

import numpy as np
import pytest

from matching.big_five import (
    BigFiveVector,
    CompatibilityResult,
    DIMENSIONS,
    compute_compatibility_score,
    cosine_similarity,
    weighted_cosine_similarity,
    VARIANT_WEIGHTS,
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def identical_vector() -> BigFiveVector:
    return BigFiveVector(
        openness=0.7,
        conscientiousness=0.6,
        extraversion=0.5,
        agreeableness=0.8,
        neuroticism=0.3,
    )


@pytest.fixture
def low_vector() -> BigFiveVector:
    """Near-opposite of identical_vector for edge-case testing."""
    return BigFiveVector(
        openness=0.1,
        conscientiousness=0.1,
        extraversion=0.1,
        agreeableness=0.1,
        neuroticism=0.9,
    )


@pytest.fixture
def high_vector() -> BigFiveVector:
    return BigFiveVector(
        openness=0.9,
        conscientiousness=0.9,
        extraversion=0.9,
        agreeableness=0.9,
        neuroticism=0.1,
    )


# ---------------------------------------------------------------------------
# cosine_similarity unit tests
# ---------------------------------------------------------------------------


class TestCosineSimilarity:
    def test_identical_vectors_score_one(self) -> None:
        v = np.array([0.5, 0.6, 0.7, 0.8, 0.3])
        assert cosine_similarity(v, v) == pytest.approx(1.0, abs=1e-6)

    def test_orthogonal_vectors_score_zero(self) -> None:
        a = np.array([1.0, 0.0, 0.0, 0.0, 0.0])
        b = np.array([0.0, 1.0, 0.0, 0.0, 0.0])
        assert cosine_similarity(a, b) == pytest.approx(0.0, abs=1e-6)

    def test_both_zero_vectors_return_one(self) -> None:
        """Two users with all-zero traits are treated as identically empty."""
        z = np.zeros(5)
        assert cosine_similarity(z, z) == pytest.approx(1.0)

    def test_one_zero_vector_returns_zero(self) -> None:
        a = np.zeros(5)
        b = np.array([0.5, 0.5, 0.5, 0.5, 0.5])
        assert cosine_similarity(a, b) == pytest.approx(0.0)

    def test_result_clamped_to_unit_range(self) -> None:
        a = np.array([0.9, 0.9, 0.9, 0.9, 0.9])
        b = np.array([0.1, 0.1, 0.1, 0.1, 0.1])
        score = cosine_similarity(a, b)
        assert 0.0 <= score <= 1.0


# ---------------------------------------------------------------------------
# weighted_cosine_similarity unit tests
# ---------------------------------------------------------------------------


class TestWeightedCosineSimilarity:
    def test_uniform_weights_equal_to_unweighted(self) -> None:
        a = np.array([0.6, 0.7, 0.5, 0.8, 0.3])
        b = np.array([0.5, 0.6, 0.4, 0.7, 0.4])
        uniform = np.ones(5)
        assert weighted_cosine_similarity(a, b, uniform) == pytest.approx(
            cosine_similarity(a, b), abs=1e-6
        )

    def test_zero_weight_zeroes_dimension(self) -> None:
        """Setting a dimension weight to 0 removes its contribution."""
        a = np.array([0.9, 0.5, 0.5, 0.5, 0.5])
        b = np.array([0.1, 0.5, 0.5, 0.5, 0.5])
        # Weight openness to 0 — only remaining identical dims survive
        weights_no_openness = np.array([0.0, 1.0, 1.0, 1.0, 1.0])
        score = weighted_cosine_similarity(a, b, weights_no_openness)
        assert score == pytest.approx(1.0, abs=1e-6)


# ---------------------------------------------------------------------------
# compute_compatibility_score — control vs v2_weighted
# ---------------------------------------------------------------------------


class TestComputeCompatibilityScore:
    def test_returns_compatibility_result(self, identical_vector: BigFiveVector) -> None:
        result = compute_compatibility_score(
            identical_vector, identical_vector, variant="control"
        )
        assert isinstance(result, CompatibilityResult)
        assert isinstance(result.score, float)
        assert isinstance(result.breakdown, dict)

    def test_identical_users_score_one_control(
        self, identical_vector: BigFiveVector
    ) -> None:
        result = compute_compatibility_score(
            identical_vector, identical_vector, variant="control"
        )
        assert result.score == pytest.approx(1.0, abs=1e-4)

    def test_identical_users_score_one_v2_weighted(
        self, identical_vector: BigFiveVector
    ) -> None:
        """Identical vectors stay cosine-1 regardless of weights."""
        result = compute_compatibility_score(
            identical_vector, identical_vector, variant="v2_weighted"
        )
        assert result.score == pytest.approx(1.0, abs=1e-4)

    def test_control_and_v2_weighted_differ_for_asymmetric_pairs(
        self,
        low_vector: BigFiveVector,
        high_vector: BigFiveVector,
    ) -> None:
        """
        For a pair where Agreeableness and Neuroticism diverge, the two
        variants must produce different scores because their weight vectors
        are not uniform.
        """
        control_result = compute_compatibility_score(
            low_vector, high_vector, variant="control"
        )
        v2_result = compute_compatibility_score(
            low_vector, high_vector, variant="v2_weighted"
        )
        assert control_result.score != v2_result.score, (
            "control and v2_weighted should differ for asymmetric Big Five pairs"
        )

    def test_breakdown_contains_all_dimensions(
        self, identical_vector: BigFiveVector, low_vector: BigFiveVector
    ) -> None:
        result = compute_compatibility_score(
            identical_vector, low_vector, variant="control"
        )
        assert set(result.breakdown.keys()) == set(DIMENSIONS)

    def test_breakdown_zero_for_identical_vectors(
        self, identical_vector: BigFiveVector
    ) -> None:
        result = compute_compatibility_score(
            identical_vector, identical_vector, variant="control"
        )
        for dim in DIMENSIONS:
            assert result.breakdown[dim] == pytest.approx(0.0, abs=1e-6)

    def test_breakdown_nonzero_for_different_vectors(
        self, low_vector: BigFiveVector, high_vector: BigFiveVector
    ) -> None:
        result = compute_compatibility_score(
            low_vector, high_vector, variant="control"
        )
        total_delta = sum(result.breakdown.values())
        assert total_delta > 0.0

    def test_score_in_unit_range(
        self, low_vector: BigFiveVector, high_vector: BigFiveVector
    ) -> None:
        for variant in ("control", "v2_weighted"):
            result = compute_compatibility_score(low_vector, high_vector, variant=variant)  # type: ignore[arg-type]
            assert 0.0 <= result.score <= 1.0, f"score out of range for variant={variant}"

    def test_unknown_variant_falls_back_to_control(
        self, identical_vector: BigFiveVector
    ) -> None:
        """An unrecognised variant must not raise — it silently uses control."""
        result = compute_compatibility_score(
            identical_vector, identical_vector, variant="nonexistent_variant"  # type: ignore[arg-type]
        )
        assert result.score == pytest.approx(1.0, abs=1e-4)


# ---------------------------------------------------------------------------
# BigFiveVector validation
# ---------------------------------------------------------------------------


class TestBigFiveVectorValidation:
    def test_valid_construction(self) -> None:
        v = BigFiveVector(0.0, 0.5, 1.0, 0.3, 0.7)
        assert v.openness == 0.0
        assert v.neuroticism == 0.7

    def test_out_of_range_raises_value_error(self) -> None:
        with pytest.raises(ValueError, match="out of range"):
            BigFiveVector(
                openness=1.1,
                conscientiousness=0.5,
                extraversion=0.5,
                agreeableness=0.5,
                neuroticism=0.5,
            )

    def test_negative_value_raises_value_error(self) -> None:
        with pytest.raises(ValueError, match="out of range"):
            BigFiveVector(
                openness=-0.1,
                conscientiousness=0.5,
                extraversion=0.5,
                agreeableness=0.5,
                neuroticism=0.5,
            )

    def test_non_numeric_raises_type_error(self) -> None:
        with pytest.raises(TypeError):
            BigFiveVector(
                openness="high",  # type: ignore[arg-type]
                conscientiousness=0.5,
                extraversion=0.5,
                agreeableness=0.5,
                neuroticism=0.5,
            )

    def test_integer_inputs_coerced_to_float(self) -> None:
        v = BigFiveVector(
            openness=1,
            conscientiousness=0,
            extraversion=1,
            agreeableness=0,
            neuroticism=1,
        )
        assert isinstance(v.openness, float)

    def test_to_array_returns_correct_shape(self) -> None:
        v = BigFiveVector(0.1, 0.2, 0.3, 0.4, 0.5)
        arr = v.to_array()
        assert arr.shape == (5,)
        assert arr[0] == pytest.approx(0.1)
        assert arr[4] == pytest.approx(0.5)


# ---------------------------------------------------------------------------
# Edge cases — opposite vectors
# ---------------------------------------------------------------------------


class TestEdgeCases:
    def test_all_zeros_vs_all_ones(self) -> None:
        """
        All-zero vector vs all-one vector.
        Zero vector is an edge case — cosine is undefined (handled as 0).
        """
        zero = BigFiveVector(0.0, 0.0, 0.0, 0.0, 0.0)
        one = BigFiveVector(1.0, 1.0, 1.0, 1.0, 1.0)
        result = compute_compatibility_score(zero, one, variant="control")
        assert result.score == pytest.approx(0.0, abs=1e-6)

    def test_both_all_zeros(self) -> None:
        """Two users with no discernible traits are treated as compatible."""
        zero = BigFiveVector(0.0, 0.0, 0.0, 0.0, 0.0)
        result = compute_compatibility_score(zero, zero, variant="control")
        assert result.score == pytest.approx(1.0, abs=1e-6)

    def test_score_symmetry(
        self, low_vector: BigFiveVector, high_vector: BigFiveVector
    ) -> None:
        """Compatibility must be symmetric: score(A, B) == score(B, A)."""
        ab = compute_compatibility_score(low_vector, high_vector, variant="control")
        ba = compute_compatibility_score(high_vector, low_vector, variant="control")
        assert ab.score == pytest.approx(ba.score, abs=1e-6)

    def test_v2_weights_agreeableness_amplified(self) -> None:
        """
        Two users identical except in Agreeableness.
        v2_weighted amplifies that dimension (x1.5) so the score should be
        *lower* than control (more weight on the differing dimension).
        """
        base = dict(openness=0.5, conscientiousness=0.5, extraversion=0.5, neuroticism=0.5)
        user_a = BigFiveVector(**base, agreeableness=0.9)
        user_b = BigFiveVector(**base, agreeableness=0.1)

        ctrl = compute_compatibility_score(user_a, user_b, variant="control")
        v2 = compute_compatibility_score(user_a, user_b, variant="v2_weighted")

        # Higher Agreeableness weight means larger angle penalty → lower score
        assert v2.score < ctrl.score

    def test_v2_weights_neuroticism_dampened(self) -> None:
        """
        Two users identical except in Neuroticism.
        v2_weighted dampens that dimension (x0.8) so the score should be
        *higher* than control (less weight on the differing dimension).
        """
        base = dict(openness=0.5, conscientiousness=0.5, extraversion=0.5, agreeableness=0.5)
        user_a = BigFiveVector(**base, neuroticism=0.9)
        user_b = BigFiveVector(**base, neuroticism=0.1)

        ctrl = compute_compatibility_score(user_a, user_b, variant="control")
        v2 = compute_compatibility_score(user_a, user_b, variant="v2_weighted")

        # Lower Neuroticism weight means smaller angle penalty → higher score
        assert v2.score > ctrl.score
