from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    # ──── Identity (Group 2 - Auth, stubbed for now) ────
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    avatar_url = Column(String(500))
    auth_provider = Column(String(20), default="email")  # "email" | "google"
    is_guest = Column(Boolean, default=False)
    email_verified = Column(Boolean, default=False, nullable=False)

    # ──── Onboarding Quiz (Spec Section 1.1) ────
    goal = Column(String(50))  # "fat_loss" | "muscle_gain" | "endurance" | "general_fitness" | "flexibility"
    experience_level = Column(String(50))  # "never" | "casual" | "consistent" | "advanced"
    age = Column(Integer)
    height_cm = Column(Float)
    weight_kg = Column(Float)
    body_fat_pct = Column(Float)  # optional
    workout_environment = Column(String(50))  # "home_none" | "home_basic" | "full_gym"
    available_days = Column(Integer)  # 1-7
    session_duration_min = Column(Integer)  # preferred session length in minutes
    injuries = Column(JSONB, default=[])  # ["lower back", "right knee", ...]
    onboarding_completed = Column(Boolean, default=False)

    # ──── Profile & Preferences (Spec Section 1.2) ────
    equipment_inventory = Column(JSONB, default=[])  # ["barbell", "dumbbells", "pull_up_bar", ...]
    preferred_styles = Column(JSONB, default=[])  # ["strength", "hiit", "calisthenics", "yoga"]
    priority_muscles = Column(JSONB, default=[])  # ["chest", "back", "legs"]
    rest_day_preferences = Column(JSONB, default={})  # {"preferred_days": ["sunday"], "active_recovery": true}
    notification_settings = Column(JSONB, default={})  # {"workout_reminders": true, "time": "08:00"}

    # ──── Metadata ────
    plan_tier = Column(String(20), default="free")  # "free" | "pro"
    member_since = Column(DateTime, server_default=func.now())
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # ──── Relationships (added as other models are created) ────
    # plans = relationship("WorkoutPlan", back_populates="user")
    # sessions = relationship("WorkoutSession", back_populates="user")
    # messages = relationship("ChatMessage", back_populates="user")

    def __repr__(self):
        return f"<User id={self.id} name={self.name} email={self.email}>"
