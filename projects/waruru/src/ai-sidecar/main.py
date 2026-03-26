"""
Waruru AI Sidecar — FastAPI application entry point.

Endpoints
---------
POST /score            Big Five compatibility scoring
POST /generate-figurine  Figurine description + DALL-E image generation
GET  /health           Service health check

Architecture notes
------------------
- This service is intentionally stateless for scoring; Redis is used only for
  optional response caching of /score to avoid redundant computation when
  NestJS retries on transient errors.
- All request/response schemas use strict Pydantic v2 models.
- A/B variant routing is delegated to the caller (NestJS reads GrowthBook and
  passes the resolved variant in the request body — the sidecar just executes
  the correct algorithm branch).
- OPENAI_API_KEY absence is a graceful degradation path, not an error.

Token cost estimate
-------------------
POST /score            : 0 tokens (pure maths)
POST /generate-figurine: ~$0.040 per call (DALL-E 3 + embedding)
GET  /health           : 0 tokens
"""

from __future__ import annotations

import logging
import os
import time
from contextlib import asynccontextmanager
from typing import Annotated, Any, AsyncGenerator, Literal

import redis.asyncio as aioredis
import uvicorn
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator, model_validator

from figurine.generator import FigurineGenerator, FigurineResult
from matching.big_five import BigFiveVector, compute_compatibility_score

# ---------------------------------------------------------------------------
# Bootstrap
# ---------------------------------------------------------------------------

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("waruru.ai-sidecar")

# ---------------------------------------------------------------------------
# Application state (initialised at startup)
# ---------------------------------------------------------------------------

_redis_client: aioredis.Redis | None = None
_figurine_generator: FigurineGenerator | None = None


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    global _redis_client, _figurine_generator

    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
    try:
        _redis_client = aioredis.from_url(redis_url, decode_responses=True)
        await _redis_client.ping()
        logger.info("Redis connected: %s", redis_url)
    except Exception as exc:
        logger.warning("Redis unavailable (%s) — caching disabled", exc)
        _redis_client = None

    _figurine_generator = FigurineGenerator()
    openai_configured = bool(os.getenv("OPENAI_API_KEY"))
    logger.info(
        "FigurineGenerator ready (DALL-E 3 %s)",
        "enabled" if openai_configured else "disabled — placeholder URLs",
    )

    yield

    if _redis_client:
        await _redis_client.aclose()
        logger.info("Redis connection closed")


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Waruru AI Sidecar",
    version="0.1.0",
    description="Big Five matching and figurine generation service",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # NestJS dev origin
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)


# ---------------------------------------------------------------------------
# Dependency injection
# ---------------------------------------------------------------------------


async def get_redis() -> aioredis.Redis | None:
    return _redis_client


async def get_figurine_generator() -> FigurineGenerator:
    if _figurine_generator is None:  # pragma: no cover
        raise HTTPException(status_code=503, detail="FigurineGenerator not initialised")
    return _figurine_generator


RedisDepend = Annotated[aioredis.Redis | None, Depends(get_redis)]
FigurineDepend = Annotated[FigurineGenerator, Depends(get_figurine_generator)]


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

_TRAIT_FIELD = Field(ge=0.0, le=1.0, description="Big Five trait score [0.0, 1.0]")


class BigFivePayload(BaseModel):
    """Reusable Big Five score block embedded in request bodies."""

    openness: float = _TRAIT_FIELD
    conscientiousness: float = _TRAIT_FIELD
    extraversion: float = _TRAIT_FIELD
    agreeableness: float = _TRAIT_FIELD
    neuroticism: float = _TRAIT_FIELD

    def to_big_five_vector(self) -> BigFiveVector:
        return BigFiveVector(
            openness=self.openness,
            conscientiousness=self.conscientiousness,
            extraversion=self.extraversion,
            agreeableness=self.agreeableness,
            neuroticism=self.neuroticism,
        )

    def to_dict(self) -> dict[str, float]:
        return {
            "openness": self.openness,
            "conscientiousness": self.conscientiousness,
            "extraversion": self.extraversion,
            "agreeableness": self.agreeableness,
            "neuroticism": self.neuroticism,
        }


class ScoreRequest(BaseModel):
    user_a: BigFivePayload
    user_b: BigFivePayload
    variant: Literal["control", "v2_weighted"] = "control"


class ScoreBreakdown(BaseModel):
    openness: float
    conscientiousness: float
    extraversion: float
    agreeableness: float
    neuroticism: float


class ScoreResponse(BaseModel):
    score: float = Field(ge=0.0, le=1.0, description="Compatibility score [0.0, 1.0]")
    breakdown: dict[str, float] = Field(description="Per-dimension absolute delta")
    rationale: str = Field(description="Korean sentence explaining compatibility")


class FigurineRequest(BaseModel):
    match_id: str = Field(min_length=1, max_length=128)
    user_a_traits: BigFivePayload
    rolling_paper_message: str = Field(
        min_length=0,
        max_length=400,
        description="User-authored rolling paper message (sanitised server-side)",
    )

    @field_validator("match_id")
    @classmethod
    def _validate_match_id(cls, v: str) -> str:
        # Guard prompt injection: only allow alphanumeric + dash + underscore
        import re
        if not re.match(r"^[a-zA-Z0-9_\-]+$", v):
            raise ValueError("match_id must contain only alphanumeric, dash, or underscore chars")
        return v


class FigurineResponse(BaseModel):
    figurine_url: str
    description: str
    style_tags: list[str]


class HealthResponse(BaseModel):
    status: str
    redis: str
    openai_configured: bool
    uptime_seconds: float


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_START_TIME = time.time()

# Cached Korean rationale templates keyed by rounded score bucket
_RATIONALE_TEMPLATES: dict[str, str] = {
    "high": "두 분은 성격적으로 매우 잘 맞아요! 서로를 자연스럽게 이해할 수 있을 거예요.",
    "mid": "두 분은 몇 가지 공통점이 있고, 서로 다른 점에서 시너지가 날 수 있어요.",
    "low": "두 분은 성격 차이가 있지만, 다양성이 새로운 자극이 될 수 있어요.",
}


def _build_rationale(score: float) -> str:
    if score >= 0.75:
        return _RATIONALE_TEMPLATES["high"]
    if score >= 0.50:
        return _RATIONALE_TEMPLATES["mid"]
    return _RATIONALE_TEMPLATES["low"]


def _score_cache_key(req: ScoreRequest) -> str:
    """Deterministic Redis key for a scoring request."""
    a = req.user_a
    b = req.user_b
    parts = [
        f"{a.openness:.3f}",
        f"{a.conscientiousness:.3f}",
        f"{a.extraversion:.3f}",
        f"{a.agreeableness:.3f}",
        f"{a.neuroticism:.3f}",
        f"{b.openness:.3f}",
        f"{b.conscientiousness:.3f}",
        f"{b.extraversion:.3f}",
        f"{b.agreeableness:.3f}",
        f"{b.neuroticism:.3f}",
        req.variant,
    ]
    return "score:" + "|".join(parts)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@app.get("/health", response_model=HealthResponse, tags=["ops"])
async def health_check(redis: RedisDepend) -> HealthResponse:
    """Liveness + dependency check. Called by NestJS health module."""
    redis_status = "disconnected"
    if redis is not None:
        try:
            await redis.ping()
            redis_status = "connected"
        except Exception:
            redis_status = "error"

    return HealthResponse(
        status="ok",
        redis=redis_status,
        openai_configured=bool(os.getenv("OPENAI_API_KEY")),
        uptime_seconds=round(time.time() - _START_TIME, 1),
    )


@app.post(
    "/score",
    response_model=ScoreResponse,
    tags=["matching"],
    summary="Compute Big Five compatibility between two users",
)
async def score_compatibility(
    req: ScoreRequest,
    redis: RedisDepend,
) -> ScoreResponse:
    """
    Computes a [0.0, 1.0] compatibility score for two Big Five profiles.

    Variant routing
    ---------------
    - "control"     : standard cosine similarity
    - "v2_weighted" : Agreeableness weight x1.5, Neuroticism weight x0.8

    Caching
    -------
    Results are cached in Redis for 5 minutes (TTL=300). Cache miss silently
    falls back to direct computation — no error is raised on Redis failure.

    Token cost: 0 (pure numpy maths).
    """
    # --- Cache read ---
    cache_key = _score_cache_key(req)
    if redis is not None:
        try:
            cached = await redis.get(cache_key)
            if cached:
                import json
                data = json.loads(cached)
                logger.debug("Cache hit: %s", cache_key)
                return ScoreResponse(**data)
        except Exception as exc:
            logger.warning("Redis read error (continuing without cache): %s", exc)

    # --- Compute ---
    try:
        vec_a = req.user_a.to_big_five_vector()
        vec_b = req.user_b.to_big_five_vector()
        result = compute_compatibility_score(vec_a, vec_b, variant=req.variant)
    except (ValueError, TypeError) as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))

    rationale = _build_rationale(result.score)
    response = ScoreResponse(
        score=result.score,
        breakdown=result.breakdown,
        rationale=rationale,
    )

    # --- Cache write ---
    if redis is not None:
        try:
            import json
            await redis.setex(cache_key, 300, json.dumps(response.model_dump()))
        except Exception as exc:
            logger.warning("Redis write error (result not cached): %s", exc)

    return response


@app.post(
    "/generate-figurine",
    response_model=FigurineResponse,
    tags=["figurine"],
    summary="Generate a figurine description and image for a match",
)
async def generate_figurine(
    req: FigurineRequest,
    generator: FigurineDepend,
) -> FigurineResponse:
    """
    Generates a personality-driven figurine for a matched pair.

    - Derives visual style tags from Big Five trait scores (no LLM).
    - Embeds the rolling paper message with text-embedding-3-small.
    - Calls DALL-E 3 to generate an image (if OPENAI_API_KEY is set).
    - Returns a deterministic placeholder URL when OPENAI_API_KEY is absent.

    PII handling
    ------------
    The rolling_paper_message is sanitised (control chars stripped, truncated
    to 400 chars) before being passed to any external API.

    Token cost: ~$0.040 per call (DALL-E 3 + embedding), $0.000 without key.
    """
    try:
        result: FigurineResult = await generator.generate(
            match_id=req.match_id,
            traits=req.user_a_traits.to_dict(),
            rolling_paper_message=req.rolling_paper_message,
        )
    except Exception as exc:
        logger.exception("Figurine generation failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Figurine generation failed. Please retry.",
        )

    return FigurineResponse(
        figurine_url=result.figurine_url,
        description=result.description,
        style_tags=result.style_tags,
    )


# ---------------------------------------------------------------------------
# Global exception handler — never leak stack traces to callers
# ---------------------------------------------------------------------------


@app.exception_handler(Exception)
async def _global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        log_level="info",
    )
