import traceback
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.plan import WorkoutPlan, PlanDay, PlanDayExercise
from app.schemas.plan import (
    GeneratePlanRequest,
    RegeneratePlanRequest,
    WeeklyPlanResponse,
    PlanDayResponse,
    ExerciseInPlan,
)
from app.services.ai_plan import generate_plan

router = APIRouter()

DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


async def load_full_plan(db: AsyncSession, plan_id: str) -> WorkoutPlan:
    result = await db.execute(
        select(WorkoutPlan)
        .where(WorkoutPlan.id == plan_id)
        .options(
            selectinload(WorkoutPlan.days)
            .selectinload(PlanDay.exercises)
            .selectinload(PlanDayExercise.exercise)
        )
    )
    return result.scalar_one_or_none()


async def load_active_plan(db: AsyncSession, user_id: str) -> WorkoutPlan:
    result = await db.execute(
        select(WorkoutPlan)
        .where(WorkoutPlan.user_id == user_id, WorkoutPlan.is_active == True)
        .order_by(WorkoutPlan.created_at.desc())
        .limit(1)
        .options(
            selectinload(WorkoutPlan.days)
            .selectinload(PlanDay.exercises)
            .selectinload(PlanDayExercise.exercise)
        )
    )
    return result.scalar_one_or_none()


def format_plan_response(plan: WorkoutPlan) -> WeeklyPlanResponse:
    days_sorted = sorted(plan.days, key=lambda d: d.day_of_week)
    formatted_days = []

    for day in days_sorted:
        exercises = []
        for pde in sorted(day.exercises, key=lambda e: e.order):
            ex = pde.exercise
            exercises.append(ExerciseInPlan(
                id=pde.id,
                exerciseId=pde.exercise_id,
                name=ex.name if ex else "Unknown",
                muscle=ex.muscle_primary if ex else "",
                equipment=ex.equipment if ex else "",
                description=ex.description if ex else None,
                order=pde.order,
                sets=pde.sets,
                reps=pde.reps,
                weight=pde.weight,
                restSeconds=pde.rest_seconds,
                tempo=pde.tempo,
                aiRationale=pde.ai_rationale,
            ))

        formatted_days.append(PlanDayResponse(
            id=day.id,
            dayName=DAY_NAMES[day.day_of_week - 1] if day.day_of_week <= 7 else "?",
            date=day.date,
            label=day.label,
            muscles=day.muscles,
            duration=f"{day.duration_est} min" if day.duration_est else "—",
            exerciseCount=day.exercise_count,
            status=day.status,
            exercises=exercises,
        ))

    return WeeklyPlanResponse(
        weekNumber=plan.week_number,
        totalWeeks=plan.total_weeks,
        programName=plan.program_name,
        days=formatted_days,
    )


@router.post("/generate", response_model=WeeklyPlanResponse)
async def generate_new_plan(
    request: GeneratePlanRequest,
    db: AsyncSession = Depends(get_db),
):
    user_id = "usr_001"
    user_profile = request.model_dump()
    try:
        plan_id = await generate_plan(db, user_profile, user_id)
        plan = await load_full_plan(db, plan_id)
        return format_plan_response(plan)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/current", response_model=WeeklyPlanResponse)
async def get_current_plan(
    db: AsyncSession = Depends(get_db),
):
    user_id = "usr_001"
    plan = await load_active_plan(db, user_id)
    if not plan:
        raise HTTPException(status_code=404, detail="No active plan found. Generate one first.")
    return format_plan_response(plan)


@router.get("/{plan_id}/days/{day_id}", response_model=PlanDayResponse)
async def get_plan_day(
    plan_id: str,
    day_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(PlanDay)
        .where(PlanDay.id == day_id, PlanDay.plan_id == plan_id)
        .options(
            selectinload(PlanDay.exercises)
            .selectinload(PlanDayExercise.exercise)
        )
    )
    day = result.scalar_one_or_none()

    if not day:
        raise HTTPException(status_code=404, detail="Day not found")

    exercises = []
    for pde in sorted(day.exercises, key=lambda e: e.order):
        ex = pde.exercise
        exercises.append(ExerciseInPlan(
            id=pde.id,
            exerciseId=pde.exercise_id,
            name=ex.name if ex else "Unknown",
            muscle=ex.muscle_primary if ex else "",
            equipment=ex.equipment if ex else "",
            description=ex.description if ex else None,
            order=pde.order,
            sets=pde.sets,
            reps=pde.reps,
            weight=pde.weight,
            restSeconds=pde.rest_seconds,
            tempo=pde.tempo,
            aiRationale=pde.ai_rationale,
        ))

    return PlanDayResponse(
        id=day.id,
        dayName=DAY_NAMES[day.day_of_week - 1] if day.day_of_week <= 7 else "?",
        date=day.date,
        label=day.label,
        muscles=day.muscles,
        duration=f"{day.duration_est} min" if day.duration_est else "—",
        exerciseCount=day.exercise_count,
        status=day.status,
        exercises=exercises,
    )


@router.post("/regenerate", response_model=WeeklyPlanResponse)
async def regenerate_plan_endpoint(
    request: RegeneratePlanRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    user_profile = {
        "goal": request.goal or user.goal or "Build Muscle",
        "level": request.level or user.experience_level or "Intermediate",
        "daysPerWeek": request.daysPerWeek or user.available_days or 4,
        "sessionLength": request.sessionLength or user.session_duration_min or 45,
        "equipment": request.equipment or user.workout_environment or "full-gym",
        "priorityMuscles": request.priorityMuscles or user.priority_muscles or [],
        "injuries": request.injuries or ", ".join(user.injuries or []) or "None",
        "workoutStyles": request.workoutStyles or user.preferred_styles or ["strength"],
    }

    try:
        plan_id = await generate_plan(db, user_profile, f"usr_{user.id:03d}")
        plan = await load_full_plan(db, plan_id)
        return format_plan_response(plan)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
