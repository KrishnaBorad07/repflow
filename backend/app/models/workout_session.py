from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.models.base import Base


class WorkoutSession(Base):
    """A single workout session — created when user taps Start, finalized on Done."""
    __tablename__ = "workout_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Loose link to a plan day. Stored as string because the Exercise/PlanDay
    # tables don't exist yet (Group 1 will own those). When they're added, we
    # can migrate this to a real FK.
    plan_day_id = Column(String(50), nullable=True)
    workout_name = Column(String(100))  # "Push Day", "Quick Workout", etc.

    started_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    ended_at = Column(DateTime(timezone=True), nullable=True)

    duration_seconds = Column(Integer, default=0, nullable=False)
    total_volume_kg = Column(Float, default=0.0, nullable=False)
    form_score_avg = Column(Float, nullable=True)
    calories = Column(Integer, default=0, nullable=False)
    rpe = Column(Integer, nullable=True)  # rate of perceived exertion 1-10

    is_completed = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    sets = relationship("SetLog", back_populates="session", cascade="all, delete-orphan", lazy="selectin")

    def __repr__(self):
        return f"<WorkoutSession id={self.id} user={self.user_id} name={self.workout_name}>"
