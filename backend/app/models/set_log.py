from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import relationship
from app.models.base import Base


class SetLog(Base):
    """One completed set within a workout session."""
    __tablename__ = "set_logs"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(
        Integer,
        ForeignKey("workout_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Same denormalization rationale as plan_day_id on WorkoutSession.
    exercise_id = Column(String(50), nullable=False, index=True)
    exercise_name = Column(String(100))

    set_number = Column(Integer, nullable=False)
    reps_completed = Column(Integer, nullable=False)
    reps_good_form = Column(Integer, nullable=True)  # null if no CV
    weight_kg = Column(Float, default=0.0, nullable=False)
    form_score = Column(Float, nullable=True)  # 0-10, null if manual
    is_partial = Column(Boolean, default=False, nullable=False)
    notes = Column(Text, nullable=True)

    logged_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    session = relationship("WorkoutSession", back_populates="sets")

    def __repr__(self):
        return f"<SetLog id={self.id} ex={self.exercise_id} set={self.set_number} reps={self.reps_completed}>"
