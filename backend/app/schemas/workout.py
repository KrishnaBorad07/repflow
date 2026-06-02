"""Pydantic schemas for workout sessions and set logging (Spec 3.6)."""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ──── Session lifecycle ────

class WorkoutStartRequest(BaseModel):
    plan_day_id: Optional[str] = None
    workout_name: Optional[str] = None


class WorkoutEndRequest(BaseModel):
    rpe: Optional[int] = Field(None, ge=1, le=10)


# ──── Set logging ────

class SetLogRequest(BaseModel):
    exercise_id: str
    exercise_name: Optional[str] = None
    set_number: int = Field(..., ge=1)
    reps_completed: int = Field(..., ge=0)
    reps_good_form: Optional[int] = Field(None, ge=0)
    weight_kg: float = Field(0.0, ge=0)
    form_score: Optional[float] = Field(None, ge=0, le=10)
    is_partial: bool = False
    notes: Optional[str] = None


class SetLogResponse(BaseModel):
    id: int
    exercise_id: str
    exercise_name: Optional[str] = None
    set_number: int
    reps_completed: int
    reps_good_form: Optional[int] = None
    weight_kg: float
    form_score: Optional[float] = None
    is_partial: bool
    notes: Optional[str] = None
    logged_at: datetime

    model_config = {"from_attributes": True}


# ──── Session views ────

class WorkoutSummary(BaseModel):
    """Used for /start response and history list — no nested sets."""
    id: int
    plan_day_id: Optional[str] = None
    workout_name: Optional[str] = None
    started_at: datetime
    ended_at: Optional[datetime] = None
    duration_seconds: int = 0
    total_volume_kg: float = 0.0
    form_score_avg: Optional[float] = None
    calories: int = 0
    rpe: Optional[int] = None
    is_completed: bool = False
    sets_count: int = 0
    exercises_count: int = 0

    model_config = {"from_attributes": True}


class WorkoutDetail(WorkoutSummary):
    """Single-session view with all sets included."""
    sets: list[SetLogResponse] = []
