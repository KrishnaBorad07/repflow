from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# ──── Onboarding (Spec Section 1.1) ────

class OnboardingRequest(BaseModel):
    """Data collected from the onboarding quiz."""
    goal: str = Field(..., description="fat_loss | muscle_gain | endurance | general_fitness | flexibility")
    experience_level: str = Field(..., description="never | casual | consistent | advanced")
    age: int = Field(..., ge=13, le=100)
    height_cm: float = Field(..., gt=0)
    weight_kg: float = Field(..., gt=0)
    body_fat_pct: Optional[float] = Field(None, ge=0, le=100)
    workout_environment: str = Field(..., description="home_none | home_basic | full_gym")
    available_days: int = Field(..., ge=1, le=7)
    session_duration_min: int = Field(..., ge=15, le=120)
    injuries: list[str] = Field(default=[])
    equipment_inventory: list[str] = Field(default=[])
    preferred_styles: list[str] = Field(default=[])
    priority_muscles: list[str] = Field(default=[])


# ──── Profile Update (Spec Section 1.2) ────

class UpdateProfileRequest(BaseModel):
    """Update basic profile info."""
    name: Optional[str] = None
    avatar_url: Optional[str] = None


class UpdatePreferencesRequest(BaseModel):
    """Update workout preferences — can be changed anytime from settings."""
    equipment_inventory: Optional[list[str]] = None
    preferred_styles: Optional[list[str]] = None
    priority_muscles: Optional[list[str]] = None
    rest_day_preferences: Optional[dict] = None
    notification_settings: Optional[dict] = None
    available_days: Optional[int] = Field(None, ge=1, le=7)
    session_duration_min: Optional[int] = Field(None, ge=15, le=120)
    workout_environment: Optional[str] = None


# ──── Response ────

class UserResponse(BaseModel):
    """User data returned by the API."""
    id: int
    name: str
    email: str
    avatar_url: Optional[str] = None
    goal: Optional[str] = None
    experience_level: Optional[str] = None
    age: Optional[int] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    body_fat_pct: Optional[float] = None
    workout_environment: Optional[str] = None
    available_days: Optional[int] = None
    session_duration_min: Optional[int] = None
    injuries: list[str] = []
    onboarding_completed: bool = False
    equipment_inventory: list[str] = []
    preferred_styles: list[str] = []
    priority_muscles: list[str] = []
    rest_day_preferences: dict = {}
    notification_settings: dict = {}
    plan_tier: str = "free"
    member_since: Optional[datetime] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
