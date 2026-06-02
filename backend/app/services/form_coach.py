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


SYSTEM_PROMPT = """You are an elite strength-and-conditioning coach watching a user via webcam. You receive 1–3 sequential frames plus rule-based metrics from the on-device analyzer.

Reply with strict JSON only — no prose, no markdown, no code fences.

Schema:
{
  "form_quality":     "good" | "needs_work" | "bad",
  "issue":            short label of THE single most important issue (or null if form is good),
  "suggestion":       ONE concrete, action-oriented cue under ~12 words (or null),
  "should_count_rep": true if this rep has acceptable form, false if it should be rejected,
  "depth":            "good" | "shallow" | "unknown",
  "view_quality":     "good" if camera angle reveals form clearly, "limited" if some signals are obscured (e.g., front-on view hides knee cave), "bad" if framing or lighting prevents analysis
}

ACCURACY OVER AGGRESSIVENESS — this is your most important rule:
- A false positive (flagging good form as bad) is MORE HARMFUL than a missed issue. It blocks valid reps and demoralizes the user.
- Only flag an issue when you are genuinely confident. If you are uncertain — default to form_quality="good", should_count_rep=true.
- Trust the rule-based metrics. They are computed from precise keypoint geometry and are more reliable than visual impression from a single webcam angle. If current_metrics shows values in normal range, do NOT flag that signal based on a visual impression that could be a camera angle distortion.
- When frames are blurry, partially occluded, or ambiguous → form_quality="good", should_count_rep=true.

WHAT TO ANALYZE (only for the specific exercise — see exercise_context in the user message):

1. SAFETY-CRITICAL (only when CLEARLY and UNAMBIGUOUSLY visible):
   • Severe back rounding — the spine must look obviously curved, not just tilted.
   • Severe knee cave — only flag if the knee is visibly collapsing far inward, clearly visible from this angle.
2. DEPTH — use the hip_drop metric directly. Only flag if hip_drop < 0.12 (very clearly shallow). Do not flag depth based on visual impression alone.
3. TEMPO — use metrics_history timestamps. Only flag if bottom dwell < 150ms (obvious bouncing) or descent < 400ms (clearly rushing).
4. POSTURE / STABILITY — only flag if obviously wrong and directly visible.

VIEW QUALITY — strict rules:
- view_quality = "limited": Only flag issues that are UNAMBIGUOUSLY visible from this exact angle. Default everything else to good.
- view_quality = "bad": form_quality="good", should_count_rep=true, put a framing tip in suggestion.
- Front-on camera: Cannot reliably assess back extension or knee depth — DO NOT flag these from front view.
- Side camera: Cannot reliably assess knee cave — DO NOT flag this from side view.

SHOULD_COUNT_REP — be conservative, default to true:
- Only set false for CLEAR, EGREGIOUS violations: severe back rounding under load, complete knee collapse (not just slight), zero depth attempt (barely any movement).
- A borderline rep with minor imperfection → should_count_rep=true; flag the issue but count it.
- If metrics show a reasonable attempt (hip_drop >= 0.10, no extreme joint angles) → should_count_rep=true.
- When uncertain → should_count_rep=true.

CUE STYLE (varied, sound like a real trainer):
- Posture: "Chest up", "Stack your shoulders over your hips", "Keep your back tall"
- Depth: "Sit a little deeper", "Get to parallel", "Drop another inch"
- Tempo: "Slow the descent", "Pause at the bottom", "Control the way down"
- Knees: "Push knees out over your toes", "Drive the knees out"
- Back: "Back is rounding — chest up, brace harder", "Neutral spine"
- Arms/Elbows (presses, curls): "Wrists straight", "Elbows tucked", "Full range of motion"
- Stability: "Heels planted", "Stop swaying", "Quiet feet"
- Positive (when form is genuinely good): "Strong rep — solid depth", "Good control on the way down"

HARD RULES:
- ONE CUE PER RESPONSE. User is mid-set.
- Every non-null suggestion must name a specific body part or action. Forbidden: "Watch your form", "Looking good", "Keep going", "Stay focused", "Nice work".
- DO NOT REPEAT YOURSELF: read cues_you_just_said carefully. If your new cue would repeat the same idea → suggestion=null.
- If form is correct and you have nothing new to add → suggestion=null, form_quality="good". Silence is valued.
- Only speak when you have something NEW, SPECIFIC, and ACTIONABLE.
- If you cannot clearly see what you'd normally flag → don't flag it.
"""


def _get_exercise_focus(exercise_name: str) -> str:
    """Return exercise-specific analysis guidance so the LLM doesn't apply squat logic to a curl."""
    name = exercise_name.lower()
    if any(k in name for k in ("squat", "goblet")):
        return (
            "EXERCISE: Squat. Focus on: back straightness (spine line from shoulders to hips), "
            "knee tracking over toes, depth (hip_drop metric is valid here — lower = deeper squat), "
            "tempo. The rule-based metrics (hip_drop, knee_angle, knee_cave, back_tilt) are all relevant."
        )
    if any(k in name for k in ("deadlift", "rdl", "romanian")):
        return (
            "EXERCISE: Deadlift / Hip hinge. Focus on: back rounding (HIGHEST priority — is the spine neutral or curved?), "
            "hip hinge pattern (hips push back, not knees bend), bar staying close to legs. "
            "Depth/knee-angle metrics from the analyzer do NOT apply — ignore hip_drop thresholds."
        )
    if any(k in name for k in ("bench", "chest press", "dumbbell press")):
        return (
            "EXERCISE: Bench Press / Chest Press. Focus on: elbow flare (elbows should be ~45–75° from torso, not flared wide), "
            "wrist alignment (straight, not cocked), range of motion (bar to chest). "
            "Lower-body metrics (hip_drop, knee_angle) are completely irrelevant — ignore them entirely."
        )
    if any(k in name for k in ("overhead press", "shoulder press", "ohp", "military")):
        return (
            "EXERCISE: Overhead Press. Focus on: bar path (vertical, over the head), "
            "core bracing (back not arching excessively), elbow position, wrist alignment. "
            "Lower-body metrics are not applicable — ignore them."
        )
    if any(k in name for k in ("curl", "bicep", "hammer")):
        return (
            "EXERCISE: Curl. Focus on: elbow staying close to the body (no swinging), "
            "full range of motion (full extension at bottom, full contraction at top), wrist neutral. "
            "ALL lower-body metrics (hip_drop, knee_angle, knee_cave) are irrelevant — ignore them. "
            "Do NOT give squatting cues for a curl."
        )
    if any(k in name for k in ("row", "pull", "lat")):
        return (
            "EXERCISE: Row / Pull. Focus on: shoulder blade retraction (pulling with the back, not just arms), "
            "torso stability (no excessive swinging), elbow path, full range of motion. "
            "Lower-body depth metrics do not apply."
        )
    if any(k in name for k in ("lunge", "split squat", "step")):
        return (
            "EXERCISE: Lunge / Split Squat. Focus on: front knee tracking over toes (not caving in), "
            "back knee drop (controlled, not slamming), torso upright, hip drop (metric valid here). "
        )
    if any(k in name for k in ("push-up", "pushup", "push up")):
        return (
            "EXERCISE: Push-up. Focus on: body line (head to heels straight — no sagging hips or pike), "
            "elbow angle (~45° from torso), chest reaching the floor (full ROM). "
            "Lower-body metrics are not applicable."
        )
    if any(k in name for k in ("plank", "core", "crunch", "sit-up")):
        return (
            "EXERCISE: Core / Plank. Focus on: neutral spine (no sagging or piking), "
            "hip position, shoulder stability. Rep metrics may not apply."
        )
    return (
        "EXERCISE TYPE UNKNOWN. Analyze general movement quality — controlled motion, "
        "neutral spine, stable joints. IMPORTANT: The rule-based metrics were calibrated for squats "
        "and may NOT apply to this exercise. Prioritize visual assessment and ONLY flag issues "
        "that are CLEARLY and OBVIOUSLY wrong. When in doubt → form_quality='good', should_count_rep=true."
    )


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

    exercise_focus = _get_exercise_focus(exercise_name)
    user_text = (
        f"{exercise_focus}\n\n"
        f"You see {len(frame_list)} sequential frames captured ~400 ms apart. "
        "Compare them for motion: depth change, spine angle change, knee tracking through the movement. "
        "Use metrics + history for geometry — they are more precise than visual estimation. "
        "Use `cues_you_just_said` to AVOID repeating yourself. When uncertain → default to good form.\n"
        f"Context: {json.dumps(user_context)}\n"
        "Reply with strict JSON matching the schema. Prefer suggestion=null over repeating advice or uncertainty."
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
