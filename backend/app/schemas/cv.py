"""Schemas for the computer-vision form coach (Spec 3.2)."""
from typing import Any, Optional

from pydantic import BaseModel, Field  # noqa: F401


class FrameAnalysisRequest(BaseModel):
    """One or more keyframes sent for form analysis."""
    # Legacy single-frame field — kept for back-compat; populated when frames is empty.
    image_b64: Optional[str] = Field(None, description="JPEG-encoded frame, base64 (no data URL prefix)")
    # New: multiple frames spanning the rep so the LLM can see motion.
    # Each entry: {"image_b64": "...", "t_offset_ms": 0|400|800|...}
    frames: Optional[list[dict[str, Any]]] = None
    exercise_name: str
    set_number: Optional[int] = None
    rep_number: Optional[int] = None
    metrics: Optional[dict[str, Any]] = None
    metrics_history: Optional[list[dict[str, Any]]] = None
    recent_cues: Optional[list[str]] = None


class FrameAnalysisResponse(BaseModel):
    form_quality: str  # "good" | "needs_work" | "bad"
    issue: Optional[str] = None
    suggestion: Optional[str] = None
    should_count_rep: bool = True
    depth: str = "unknown"  # "good" | "shallow" | "unknown"
    view_quality: str = "good"  # "good" | "limited" | "bad"


class SpeakRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=300)
    voice: Optional[str] = "nova"
    speed: Optional[float] = 1.05
