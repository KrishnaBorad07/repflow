import uuid
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, JSON, Float
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base


def gen_id():
    return str(uuid.uuid4())


class WorkoutPlan(Base):
    __tablename__ = "workout_plans"

    id = Column(String, primary_key=True, default=gen_id)
    user_id = Column(String, nullable=False, index=True)
    program_name = Column(String, nullable=False)
    total_weeks = Column(Integer, default=4)
    week_number = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    days = relationship("PlanDay", back_populates="plan", cascade="all, delete-orphan", lazy="noload")


class PlanDay(Base):
    __tablename__ = "plan_days"

    id = Column(String, primary_key=True, default=gen_id)
    plan_id = Column(String, ForeignKey("workout_plans.id"), nullable=False)
    day_of_week = Column(Integer, nullable=False)
    label = Column(String, nullable=False)
    muscles = Column(String, nullable=False)
    duration_est = Column(Integer, default=0)
    exercise_count = Column(Integer, default=0)
    status = Column(String, default="plan")
    date = Column(String, nullable=True)

    plan = relationship("WorkoutPlan", back_populates="days")
    exercises = relationship("PlanDayExercise", back_populates="day", cascade="all, delete-orphan", lazy="noload")


class PlanDayExercise(Base):
    __tablename__ = "plan_day_exercises"

    id = Column(String, primary_key=True, default=gen_id)
    plan_day_id = Column(String, ForeignKey("plan_days.id"), nullable=False)
    exercise_id = Column(String, ForeignKey("exercises.id"), nullable=False)
    order = Column(Integer, nullable=False)
    sets = Column(Integer, default=3)
    reps = Column(Integer, default=10)
    weight = Column(Float, default=0)
    rest_seconds = Column(Integer, default=60)
    tempo = Column(String, nullable=True)
    ai_rationale = Column(Text, nullable=True)

    day = relationship("PlanDay", back_populates="exercises")
    exercise = relationship("Exercise", lazy="noload")
