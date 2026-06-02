"""
Workout session endpoints — Spec 3.6.

Lifecycle:
  POST /api/workouts/start            → create session (status: in-progress)
  POST /api/workouts/{id}/sets        → append a SetLog
  POST /api/workouts/{id}/end         → finalize, compute summary stats
  GET  /api/workouts/history          → paginated finalized sessions
  GET  /api/workouts/{id}             → session detail with all sets
"""
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, desc, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.set_log import SetLog
from app.models.user import User
from app.models.workout_session import WorkoutSession
from app.schemas.workout import (
    SetLogRequest,
    SetLogResponse,
    WorkoutDetail,
    WorkoutEndRequest,
    WorkoutStartRequest,
    WorkoutSummary,
)

router = APIRouter()


# ──── helpers ────

async def _load_owned_session(session_id: int, user: User, db: AsyncSession) -> WorkoutSession:
    session = await db.get(WorkoutSession, session_id)
    if not session or session.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workout session not found")
    return session


def _summarize(session: WorkoutSession, sets_count: int, exercises_count: int) -> WorkoutSummary:
    """Build a WorkoutSummary, attaching counts that aren't on the model."""
    summary = WorkoutSummary.model_validate(session)
    summary.sets_count = sets_count
    summary.exercises_count = exercises_count
    return summary


# ──── routes ────

@router.post("/start", response_model=WorkoutSummary, status_code=status.HTTP_201_CREATED)
async def start_workout(
    data: WorkoutStartRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Begin a new workout session and return its server-issued id."""
    session = WorkoutSession(
        user_id=user.id,
        plan_day_id=data.plan_day_id,
        workout_name=data.workout_name,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return _summarize(session, sets_count=0, exercises_count=0)


@router.post("/{session_id}/sets", response_model=SetLogResponse, status_code=status.HTTP_201_CREATED)
async def log_set(
    session_id: int,
    data: SetLogRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Append a completed set to an in-progress session."""
    session = await _load_owned_session(session_id, user, db)
    if session.is_completed:
        raise HTTPException(status_code=400, detail="Session already finalized")

    set_log = SetLog(
        session_id=session_id,
        exercise_id=data.exercise_id,
        exercise_name=data.exercise_name,
        set_number=data.set_number,
        reps_completed=data.reps_completed,
        reps_good_form=data.reps_good_form,
        weight_kg=data.weight_kg,
        form_score=data.form_score,
        is_partial=data.is_partial,
        notes=data.notes,
    )
    db.add(set_log)

    # Running volume update so UIs reading mid-session see live totals.
    session.total_volume_kg = (session.total_volume_kg or 0.0) + (
        data.reps_completed * data.weight_kg
    )

    await db.commit()
    await db.refresh(set_log)
    return set_log


@router.post("/{session_id}/end", response_model=WorkoutSummary)
async def end_workout(
    session_id: int,
    data: WorkoutEndRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Finalize the session — compute duration, volume, avg form score, calories."""
    session = await _load_owned_session(session_id, user, db)
    if session.is_completed:
        # Idempotent finalize — return current summary without recomputing.
        sets = (await db.execute(select(SetLog).where(SetLog.session_id == session_id))).scalars().all()
        return _summarize(session, len(sets), len({s.exercise_id for s in sets}))

    sets_result = await db.execute(select(SetLog).where(SetLog.session_id == session_id))
    sets = sets_result.scalars().all()

    if sets:
        session.total_volume_kg = sum(s.reps_completed * s.weight_kg for s in sets)
        form_scores = [s.form_score for s in sets if s.form_score is not None]
        session.form_score_avg = (sum(form_scores) / len(form_scores)) if form_scores else None

    now = datetime.now(timezone.utc)
    session.ended_at = now
    if session.started_at:
        # started_at comes back from Postgres as tz-aware; if it isn't, normalize.
        started = session.started_at
        if started.tzinfo is None:
            started = started.replace(tzinfo=timezone.utc)
        session.duration_seconds = max(0, int((now - started).total_seconds()))

    # Rough calorie estimate — ~7 kcal/min of strength work. Cheap heuristic;
    # a real model would factor weight, intensity, and HR.
    session.calories = int((session.duration_seconds / 60) * 7)

    if data.rpe is not None:
        session.rpe = data.rpe

    session.is_completed = True

    await db.commit()
    await db.refresh(session)

    return _summarize(session, len(sets), len({s.exercise_id for s in sets}))


@router.get("/history", response_model=list[WorkoutSummary])
async def get_history(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """Return finalized workouts, newest first."""
    q = (
        select(WorkoutSession)
        .where(WorkoutSession.user_id == user.id, WorkoutSession.is_completed.is_(True))
        .order_by(desc(WorkoutSession.ended_at))
        .limit(limit)
        .offset(offset)
    )
    sessions = (await db.execute(q)).scalars().all()
    if not sessions:
        return []

    # One aggregate query for sets/exercises counts, keyed by session_id.
    session_ids = [s.id for s in sessions]
    counts_q = (
        select(
            SetLog.session_id,
            func.count(SetLog.id).label("sets_count"),
            func.count(func.distinct(SetLog.exercise_id)).label("exercises_count"),
        )
        .where(SetLog.session_id.in_(session_ids))
        .group_by(SetLog.session_id)
    )
    counts_rows = (await db.execute(counts_q)).all()
    counts = {row.session_id: (row.sets_count, row.exercises_count) for row in counts_rows}

    return [
        _summarize(s, *counts.get(s.id, (0, 0)))
        for s in sessions
    ]


@router.get("/{session_id}", response_model=WorkoutDetail)
async def get_session(
    session_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Single session with all sets, ordered as they were logged."""
    session = await _load_owned_session(session_id, user, db)

    sets_result = await db.execute(
        select(SetLog).where(SetLog.session_id == session_id).order_by(SetLog.id)
    )
    sets = sets_result.scalars().all()

    detail = WorkoutDetail.model_validate(session)
    detail.sets = [SetLogResponse.model_validate(s) for s in sets]
    detail.sets_count = len(sets)
    detail.exercises_count = len({s.exercise_id for s in sets})
    return detail
