"""
Big Five personality matching engine.

Variants
--------
control     : standard cosine similarity on the 5-dim vector
v2_weighted : Agreeableness weight x1.5, Neuroticism weight x0.8, then cosine similarity

Scoring approach
----------------
Compatibility is *not* raw cosine similarity — it is similarity of traits.
For traits where complementarity matters (e.g. Extraversion), cosine similarity
still captures vector direction, which works well for like-attracts-like matching.
Score is clamped to [0.0, 1.0] so the caller always gets a probability-like float.

Token cost estimate (this module): 0 tokens — pure Python maths, no LLM calls.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal

import numpy as np

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

DIMENSIONS: list[str] = [
    "openness",
    "conscientiousness",
    "extraversion",
    "agreeableness",
    "neuroticism",
]

# A/B variant weight vectors (index order matches DIMENSIONS list)
VARIANT_WEIGHTS: dict[str, np.ndarray] = {
    "control": np.array([1.0, 1.0, 1.0, 1.0, 1.0], dtype=np.float64),
    "v2_weighted": np.array([1.0, 1.0, 1.0, 1.5, 0.8], dtype=np.float64),
}

# ---------------------------------------------------------------------------
# Data types
# ---------------------------------------------------------------------------


@dataclass
class BigFiveVector:
    """Validated Big Five trait scores, each in [0.0, 1.0]."""

    openness: float
    conscientiousness: float
    extraversion: float
    agreeableness: float
    neuroticism: float

    def __post_init__(self) -> None:
        for dim in DIMENSIONS:
            value = getattr(self, dim)
            if not isinstance(value, (int, float)):
                raise TypeError(f"{dim} must be numeric, got {type(value)}")
            if not (0.0 <= float(value) <= 1.0):
                raise ValueError(f"{dim}={value} out of range [0.0, 1.0]")
            # Store as float for consistency
            object.__setattr__(self, dim, float(value))

    def to_array(self) -> np.ndarray:
        """Return trait scores as a numpy array (order matches DIMENSIONS)."""
        return np.array(
            [
                self.openness,
                self.conscientiousness,
                self.extraversion,
                self.agreeableness,
                self.neuroticism,
            ],
            dtype=np.float64,
        )


@dataclass
class CompatibilityResult:
    """Output of compute_compatibility_score."""

    score: float  # 0.0-1.0
    breakdown: dict[str, float] = field(default_factory=dict)


# ---------------------------------------------------------------------------
# Core math
# ---------------------------------------------------------------------------


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """
    Standard cosine similarity between two vectors.

    Returns float in [-1.0, 1.0]. For unit-clamped Big Five vectors this is
    always in [0.0, 1.0] in practice, but we clamp defensively.
    """
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0.0 or norm_b == 0.0:
        # Zero vector edge case — treat as identical (perfect match with nothing)
        return 1.0 if (norm_a == 0.0 and norm_b == 0.0) else 0.0
    raw = float(np.dot(a, b) / (norm_a * norm_b))
    return float(np.clip(raw, 0.0, 1.0))


def weighted_cosine_similarity(
    a: np.ndarray,
    b: np.ndarray,
    weights: np.ndarray,
) -> float:
    """
    Cosine similarity after element-wise weight scaling.

    Scaling each dimension by its weight before cosine gives dimensions with
    higher weights more influence on the angle between vectors.
    """
    a_w = a * weights
    b_w = b * weights
    return cosine_similarity(a_w, b_w)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def compute_compatibility_score(
    user_a: BigFiveVector,
    user_b: BigFiveVector,
    variant: Literal["control", "v2_weighted"] = "control",
) -> CompatibilityResult:
    """
    Compute Big Five compatibility between two users.

    Parameters
    ----------
    user_a, user_b : BigFiveVector
        Trait scores for each user.
    variant : str
        GrowthBook A/B variant key. Unknown variants fall back to "control".

    Returns
    -------
    CompatibilityResult
        score      : overall float 0.0-1.0
        breakdown  : per-dimension absolute delta (lower = more similar)
    """
    a = user_a.to_array()
    b = user_b.to_array()

    weights = VARIANT_WEIGHTS.get(variant, VARIANT_WEIGHTS["control"])
    score = weighted_cosine_similarity(a, b, weights)

    # Breakdown: raw per-dimension absolute delta (0=identical, 1=maximum diff)
    deltas = np.abs(a - b)
    breakdown = {dim: round(float(deltas[i]), 4) for i, dim in enumerate(DIMENSIONS)}

    return CompatibilityResult(score=round(score, 4), breakdown=breakdown)
