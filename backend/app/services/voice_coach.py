"""
Text-to-speech for AI coach cues.

Uses OpenAI's `tts-1` model — fast, ~1 s for short phrases, sounds like
a human trainer at a fraction of ElevenLabs cost.

Voice choices (we use `nova` — warm and energetic, ideal for a coach):
  alloy   — neutral, balanced
  echo    — male, even-keeled
  fable   — British, warm storyteller
  onyx    — deeper male, authoritative
  nova    — warm female, energetic ← coach
  shimmer — soft female

Returns raw mp3 bytes for the FastAPI route to stream back to the client.
"""
from __future__ import annotations

import logging

from openai import AsyncOpenAI

from app.core.config import settings

logger = logging.getLogger(__name__)

_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI | None:
    global _client
    if _client is not None:
        return _client
    if not settings.OPENAI_API_KEY:
        logger.warning("OPENAI_API_KEY not configured — voice coach disabled")
        return None
    _client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    return _client


VALID_VOICES = {"alloy", "echo", "fable", "onyx", "nova", "shimmer"}


async def synthesize(text: str, voice: str = "nova", speed: float = 1.05) -> bytes | None:
    """Return mp3 audio bytes for the given coaching cue, or None on failure."""
    client = _get_client()
    if client is None or not text.strip():
        return None

    if voice not in VALID_VOICES:
        voice = "nova"
    speed = max(0.5, min(speed, 1.5))

    try:
        response = await client.audio.speech.create(
            model="tts-1",
            voice=voice,
            speed=speed,
            input=text,
            response_format="mp3",
        )
        return await response.aread()
    except Exception as e:  # noqa: BLE001
        logger.warning("Voice coach TTS failed: %s", e)
        return None
