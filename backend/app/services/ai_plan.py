import json
from openai import AsyncOpenAI
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import get_settings
from app.models.exercise import Exercise
from app.models.plan import WorkoutPlan, PlanDay, PlanDayExercise

settings = get_settings()
client = AsyncOpenAI(
    api_key=settings.GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1",
)

SYSTEM_PROMPT = """You are an expert certified personal trainer and strength & conditioning coach with 15+ years of experience. You create personalized, science-based workout plans.

RULES:
1. Use ONLY exercises from the PROVIDED exercise library below. Never invent exercises.
2. Follow progressive overload and periodization principles.
3. Each exercise MUST include an "aiRationale" field explaining WHY it's included for THIS specific user (e.g. "Goblet squats are included because they build quad strength while teaching proper squat mechanics, ideal for your goal of building muscle with dumbbell equipment.").
4. Respect the user's available days, session duration, equipment, and injuries.
5. Include rest days to fill a 7-day week.
6. Balance push/pull/legs across the week to avoid overtraining.
7. Compound movements first, isolation exercises last in each session.
8. Warm-up (5 min) and cool-down (3 min) are assumed — plan exercise time within the remaining duration.
9. Suggest appropriate weights based on the user's level (beginner: conservative, intermediate: moderate, advanced: challenging).
10. EXERCISE COUNT PER SESSION must match the session duration. Use this guide:
    - 15-20 min session → 2-3 exercises
    - 30 min session → 3-4 exercises
    - 45 min session → 4-5 exercises
    - 60 min session → 5-7 exercises
    - 90 min session → 7-9 exercises
    Each exercise takes roughly 8-10 min (including rest between sets). NEVER default to 3 exercises for every session.
11. The "durationEst" field MUST match the user's requested session duration, NOT a fixed 45.

Respond with ONLY valid JSON, no markdown, no explanation outside the JSON."""


def build_user_prompt(user_profile: dict, exercises: list[dict]) -> str:
    exercise_list = "\n".join(
        f"- {ex['id']}: {ex['name']} | Muscle: {ex['muscle_primary']} | Equipment: {ex['equipment']} | Difficulty: {ex['difficulty']} | Default: {ex['sets_default']}x{ex['reps_default']}, {ex['rest_seconds']}s rest"
        for ex in exercises
    )

    return f"""Generate a personalized weekly workout plan for this user:

USER PROFILE:
- Goal: {user_profile.get('goal', 'Build Muscle')}
- Experience Level: {user_profile.get('level', 'Intermediate')}
- Available Days: {user_profile.get('daysPerWeek', 4)} days/week
- Session Duration: {user_profile.get('sessionLength', 45)} minutes
- Available Equipment: {user_profile.get('equipment', 'full-gym')}
- Priority Muscles: {', '.join(user_profile.get('priorityMuscles', ['Chest', 'Back']))}
- Injuries/Limitations: {user_profile.get('injuries', 'None')}
- Workout Style Preference: {', '.join(user_profile.get('workoutStyles', ['strength']))}

AVAILABLE EXERCISE LIBRARY:
{exercise_list}

OUTPUT FORMAT (strict JSON):
{{
  "programName": "string - creative program name based on user's goal",
  "totalWeeks": 4,
  "days": [
    {{
      "dayOfWeek": 1,
      "label": "string - e.g. Push Day, Pull Day, Legs, Upper, Lower, Rest",
      "muscles": "string - e.g. Chest · Shoulders · Triceps",
      "durationEst": "number - must match user's session duration",
      "exercises": [
        {{
          "exerciseId": "ex_001",
          "order": 1,
          "sets": 4,
          "reps": 10,
          "weight": 60,
          "restSeconds": 90,
          "tempo": "2-1-2",
          "aiRationale": "string - why this exercise is chosen for this user"
        }}
      ]
    }},
    {{
      "dayOfWeek": 4,
      "label": "Rest",
      "muscles": "Recovery & mobility",
      "durationEst": 0,
      "exercises": []
    }}
  ]
}}

IMPORTANT: You must return exactly 7 days (dayOfWeek 1-7, Monday=1 to Sunday=7). Training days + rest days = 7.
IMPORTANT: Each time you generate a plan, create a UNIQUE and DIFFERENT plan. Vary the exercise selection, day splits, exercise order, rep ranges, and rest periods. Avoid repeating the same plan structure. Be creative with the program name and split style (push/pull/legs, upper/lower, full body, bro split, etc.).
IMPORTANT: The user's session is {user_profile.get('sessionLength', 45)} minutes. Each training day MUST have enough exercises to fill that time (roughly 1 exercise per 8-10 min of effective training time). Do NOT default to 3 exercises for every session. Set durationEst to {user_profile.get('sessionLength', 45)} for each training day."""


async def get_exercise_list(db: AsyncSession) -> list[dict]:
    result = await db.execute(select(Exercise))
    exercises = result.scalars().all()
    return [
        {
            "id": ex.id,
            "name": ex.name,
            "muscle_primary": ex.muscle_primary,
            "equipment": ex.equipment,
            "difficulty": ex.difficulty,
            "sets_default": ex.sets_default,
            "reps_default": ex.reps_default,
            "rest_seconds": ex.rest_seconds,
        }
        for ex in exercises
    ]


async def generate_plan(db: AsyncSession, user_profile: dict, user_id: str) -> WorkoutPlan:
    exercises = await get_exercise_list(db)
    user_prompt = build_user_prompt(user_profile, exercises)

    response = await client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=1.0,
    )

    plan_data = json.loads(response.choices[0].message.content)

    from sqlalchemy import update
    await db.execute(
        update(WorkoutPlan)
        .where(WorkoutPlan.user_id == user_id, WorkoutPlan.is_active == True)
        .values(is_active=False)
    )

    day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    plan = WorkoutPlan(
        user_id=user_id,
        program_name=plan_data["programName"],
        total_weeks=plan_data.get("totalWeeks", 4),
        week_number=1,
        is_active=True,
    )
    db.add(plan)
    await db.flush()

    for day_data in plan_data["days"]:
        day_of_week = day_data["dayOfWeek"]
        exercises_data = day_data.get("exercises", [])

        day = PlanDay(
            plan_id=plan.id,
            day_of_week=day_of_week,
            label=day_data["label"],
            muscles=day_data["muscles"],
            duration_est=day_data.get("durationEst", 0),
            exercise_count=len(exercises_data),
            status="plan",
            date=day_names[day_of_week - 1] if day_of_week <= 7 else None,
        )
        db.add(day)
        await db.flush()

        for ex_data in exercises_data:
            plan_exercise = PlanDayExercise(
                plan_day_id=day.id,
                exercise_id=ex_data["exerciseId"],
                order=ex_data["order"],
                sets=ex_data.get("sets", 3),
                reps=ex_data.get("reps", 10),
                weight=ex_data.get("weight", 0),
                rest_seconds=ex_data.get("restSeconds", 60),
                tempo=ex_data.get("tempo"),
                ai_rationale=ex_data.get("aiRationale"),
            )
            db.add(plan_exercise)

    await db.commit()
    return plan.id
