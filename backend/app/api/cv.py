"""
Computer-vision endpoints — LLM form coach (Spec 3.2).

Two endpoints:
  POST /api/cv/analyze-frame  — frame + metrics → JSON form verdict
  POST /api/cv/speak          — short coaching text → mp3 audio
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response

from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.cv import (
    FrameAnalysisRequest,
    FrameAnalysisResponse,
    SpeakRequest,
)
from app.services.form_coach import analyze_frame
from app.services.voice_coach import synthesize

router = APIRouter()


@router.post("/analyze-frame", response_model=FrameAnalysisResponse)
async def analyze_frame_endpoint(
    payload: FrameAnalysisRequest,
    user: User = Depends(get_current_user),
):
    result = await analyze_frame(
        image_b64=payload.image_b64,
        frames=payload.frames,
        exercise_name=payload.exercise_name,
        set_number=payload.set_number,
        rep_number=payload.rep_number,
        metrics=payload.metrics,
        metrics_history=payload.metrics_history,
        recent_cues=payload.recent_cues,
    )
    return FrameAnalysisResponse(**{k: v for k, v in result.items() if not k.startswith("_")})


@router.post(
    "/speak",
    response_class=Response,
    responses={200: {"content": {"audio/mpeg": {}}}},
)
async def speak_endpoint(
    payload: SpeakRequest,
    user: User = Depends(get_current_user),
):
    """Return mp3 audio for a coaching cue. Frontend plays it via <audio>."""
    audio = await synthesize(payload.text, voice=payload.voice or "nova", speed=payload.speed or 1.05)
    if audio is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Voice coach unavailable",
        )
    return Response(
        content=audio,
        media_type="audio/mpeg",
        headers={"Cache-Control": "no-store"},
    )
