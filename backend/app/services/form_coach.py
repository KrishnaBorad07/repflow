"""
LLM-powered form coach.

Sends a downsized JPEG frame (base64) to OpenAI gpt-4o with vision
plus the rule-based analyzer's recent metrics for temporal context, and
asks for a structured form-quality assessment.

The model is asked to reply in strict JSON so the UI is deterministic.
Schema returned to the caller:
  {
    "form_quality":     "good" | "needs_work" | "bad",
    "issue":            "<short label>" | null,
    "suggestion":       "<one-sentence cue>" | null,
    "should_count_rep": true | false,
    "depth":            "good" | "shallow" | "unknown",
    "view_quality":     "good" | "limited" | "bad"
  }

If the call fails or the model returns malformed JSON we fall back to a
permissive "good" verdict so the workout doesn't grind to a halt.
"""
from __future__ import annotations

import json
import logging
from typing import Any

from openai import AsyncOpenAI

from app.core.config import settings

logger = logging.getLogger(__name__)


_client: AsyncOpenAI | None = None
_PRIMARY_MODEL = "gpt-4o"
_FALLBACK_MODEL = "gpt-4o-mini"


def _get_client() -> AsyncOpenAI | None:
    global _client
    if _client is not None:
        return _client
    if not settings.OPENAI_API_KEY:
        logger.warning("OPENAI_API_KEY not configured — form coach disabled")
        return None
    _client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    return _client


SYSTEM_PROMPT = """You are an elite strength-and-conditioning coach (think USAW / NSCA / RTS-trained) watching a user via webcam. You receive ONE still frame plus rule-based metrics + a short history of those metrics from the rule engine.

You evaluate FORM and reply with strict JSON only — no prose, no markdown, no code fences.

Schema:
{
  "form_quality":     "good" | "needs_work" | "bad",
  "issue":            short label of THE single most important issue (or null if form is good),
  "suggestion":       ONE concrete, action-oriented cue under ~12 words (or null),
  "should_count_rep": true if this rep has acceptable form, false if it should be rejected,
  "depth":            "good" | "shallow" | "unknown",
  "view_quality":     "good" if camera angle reveals form clearly, "limited" if some signals are obscured (e.g., front-on view hides knee cave), "bad" if framing or lighting prevents analysis
}

WHAT TO ANALYZE (in priority order, pick the single most important issue):

1. SAFETY-CRITICAL — examine FIRST every frame:
   • Back rounding / spinal flexion. Look at the line from shoulders to hips. Is it straight, or curved? Even slight rounding under load is a real injury risk. If you see ANY rounding, your cue MUST be about back: "Back straight", "Chest up — neutral spine", "Stop rounding — brace your core". This is your highest priority.
   • Knees caving severely inward (front view) or shooting forward past toes excessively.
   • Lockout hyperextension at top (knees bowing back).
2. DEPTH: did the rep reach the required range of motion? Use metrics — if hip_drop < 0.18 the user did NOT hit parallel.
3. TEMPO: examine metrics_history timestamps. If user spent < 250ms at bottom, they bounced. If descent < 600ms, they dropped.
4. POSTURE: chest collapse, shoulders rolling forward, head jutting forward.
5. STABILITY: side-to-side wobble, weight shifting onto toes/heels.

Be DECISIVE about what you see — don't water down your assessment. If the back is rounded, say so directly: "Back straight". Don't soften it to "watch your form".

CUE STYLE (varied — sound like a real trainer, not a textbook):

- Posture: "Chest up", "Stack your shoulders over your hips", "Keep your back tall", "Pack your shoulders down"
- Depth: "Sit deeper, get to parallel", "Drop another inch", "You're cutting it short", "Hit full depth"
- Tempo: "Slow down the descent", "Pause at the bottom", "Don't bounce out — control it", "You stood up too fast — three-second descent next rep"
- Knees: "Push knees out — track them over your toes", "Knees are caving — drive them out"
- Back: "Back is rounding — chest up, brace harder", "Neutral spine — stop hinging at the top"
- Bar path / arms (for presses/curls): "Wrists straight", "Elbows tucked", "Drive the bar straight up"
- Stability: "Heels planted", "Stop swaying", "Quiet feet"
- Positive (when form is genuinely good): "Strong rep — solid depth", "Smooth tempo", "Good control on the way down"

HARD RULES:

- HONESTY: if the camera angle hides a signal (e.g., front-on view hides knee tracking), set view_quality="limited" and DO NOT invent that issue. Pick a different visible issue, or set form_quality="good".
- ONE CUE PER RESPONSE. The user is mid-set. Don't list multiple problems.
- A clearly bad rep (cut depth far short, knees collapsing badly, rounded back under load, jerk-and-bounce) → should_count_rep = false.
- A roughly-correct rep with one minor imperfection → should_count_rep = true; flag the issue but let the rep count.
- Use metrics_history to spot tempo issues: rapid phase transitions = rushing, no time at bottom = bouncing.
- If view_quality = "bad" (framing or lighting unusable) → form_quality="good", should_count_rep=true, put a setup tip in suggestion ("Step back so your full body is in frame").
- Be specific about the body part. "Your back is rounding" beats "fix your form".

NEVER GIVE GENERIC CUES — this is non-negotiable:
- Forbidden: "Watch your form", "Looking good", "Keep going", "Stay focused", "Nice work", "Good rep" (without specifics).
- Required: every non-null suggestion names a specific body part OR a specific action.

ERR ON THE SIDE OF CALLING OUT ISSUES, NOT SILENCE:
- The user has explicitly asked for real corrections. Don't sugarcoat.
- If ANYTHING is visibly off — back angle, depth, knee tracking, asymmetry, tempo — call it out specifically.
- Only return suggestion=null when form is genuinely correct AND you'd be repeating prior advice. If form has any imperfection and you've NOT covered that topic recently, speak up.

DO NOT REPEAT YOURSELF — this is critical:
- Read `cues_you_just_said` carefully. If your new cue would convey the same idea, set suggestion=null instead.
- A real trainer says a cue ONCE, then watches to see if the user adjusts. They don't repeat the same advice every 3 seconds.
- If you've recently said "Sit deeper" and depth is still shallow → return suggestion=null (you already told them; let them work on it). Or pivot to a different observation if you genuinely see something new.
- If form is roughly correct AND you have nothing new to add → suggestion=null, form_quality="good". Silence is fine. Empty praise is annoying.
- Only speak when you have something NEW and ACTIONABLE that wasn't in `cues_you_just_said`.
"""


async def analyze_frame(
    *,
    image_b64: str | None = None,
    frames: list[dict[str, Any]] | None = None,
    exercise_name: str,
    set_number: int | None,
    rep_number: int | None,
    metrics: dict[str, Any] | None = None,
    metrics_history: list[dict[str, Any]] | None = None,
    recent_cues: list[str] | None = None,
) -> dict[str, Any]:
    """Send 1+ frames to the LLM and return structured form analysis."""
    client = _get_client()
    if client is None:
        return _safe_fallback(reason="api_key_missing")

    # Normalize: prefer the multi-frame `frames` list; fall back to single image_b64.
    frame_list: list[dict[str, Any]] = []
    if frames:
        frame_list = [f for f in frames if f and f.get("image_b64")]
    if not frame_list and image_b64:
        frame_list = [{"image_b64": image_b64, "t_offset_ms": 0}]
    if not frame_list:
        return _safe_fallback(reason="no_frames")

    user_context = {
        "exercise": exercise_name,
        "set_number": set_number,
        "rep_number_completed_so_far": rep_number,
        "frames_count": len(frame_list),
        "frames_t_offsets_ms": [f.get("t_offset_ms", 0) for f in frame_list],
        "current_metrics": metrics or {},
        "metrics_history_recent_to_old": (metrics_history or [])[-6:],
        "cues_you_just_said_recent_to_old": (recent_cues or [])[-4:],
    }

    user_text = (
        f"You see {len(frame_list)} sequential frames captured ~400 ms apart, "
        "showing the user across part of a rep cycle. Compare them — depth change, "
        "spine angle change, knee tracking through the motion. Use metrics + history "
        "for geometry. Use `cues_you_just_said` to AVOID repeating yourself.\n"
        f"Context: {json.dumps(user_context)}\n"
        "Reply with strict JSON matching the schema. Prefer suggestion=null over repeating advice."
    )

    user_content: list[dict[str, Any]] = [{"type": "text", "text": user_text}]
    for f in frame_list:
        user_content.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:image/jpeg;base64,{f['image_b64']}",
                "detail": "high",
            },
        })

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_content},
    ]

    parsed = await _try_model(client, _PRIMARY_MODEL, messages)
    if parsed is None:
        # Cheaper / faster fallback so the workout never goes blind.
        parsed = await _try_model(client, _FALLBACK_MODEL, messages)
    if parsed is None:
        return _safe_fallback(reason="llm_unreachable")

    return _normalize(parsed)


async def _try_model(client: AsyncOpenAI, model: str, messages: list[dict[str, Any]]) -> dict[str, Any] | None:
    try:
        response = await client.chat.completions.create(
            model=model,
            temperature=0.15,
            max_tokens=220,
            response_format={"type": "json_object"},
            messages=messages,
        )
    except Exception as e:  # noqa: BLE001
        logger.warning("Form coach (%s) call failed: %s", model, e)
        return None

    raw = response.choices[0].message.content or ""
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        logger.warning("Form coach (%s) returned malformed JSON: %s", model, raw[:200])
        return None


def _normalize(parsed: dict[str, Any]) -> dict[str, Any]:
    """Coerce LLM output into our canonical shape with safe defaults."""
    quality = parsed.get("form_quality")
    if quality not in {"good", "needs_work", "bad"}:
        quality = "good"

    depth = parsed.get("depth")
    if depth not in {"good", "shallow", "unknown"}:
        depth = "unknown"

    view = parsed.get("view_quality")
    if view not in {"good", "limited", "bad"}:
        view = "good"

    return {
        "form_quality": quality,
        "issue": parsed.get("issue") or None,
        "suggestion": parsed.get("suggestion") or None,
        "should_count_rep": bool(parsed.get("should_count_rep", quality != "bad")),
        "depth": depth,
        "view_quality": view,
    }


def _safe_fallback(*, reason: str) -> dict[str, Any]:
    return {
        "form_quality": "good",
        "issue": None,
        "suggestion": None,
        "should_count_rep": True,
        "depth": "unknown",
        "view_quality": "good",
        "_fallback": reason,
    }
