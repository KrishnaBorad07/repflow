"""
User endpoints — onboarding quiz, profile, and preferences.
Spec Sections 1.1 and 1.2.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import (
    OnboardingRequest,
    UpdateProfileRequest,
    UpdatePreferencesRequest,
    UserResponse,
)

router = APIRouter()


@router.post("/onboarding", response_model=UserResponse)
async def save_onboarding(
    data: OnboardingRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Save onboarding quiz results. Updates the current user's profile
    with fitness data and marks onboarding as completed.
    """
    user.goal = data.goal
    user.experience_level = data.experience_level
    user.age = data.age
    user.height_cm = data.height_cm
    user.weight_kg = data.weight_kg
    user.body_fat_pct = data.body_fat_pct
    user.workout_environment = data.workout_environment
    user.available_days = data.available_days
    user.session_duration_min = data.session_duration_min
    user.injuries = data.injuries
    user.equipment_inventory = data.equipment_inventory
    user.preferred_styles = data.preferred_styles
    user.priority_muscles = data.priority_muscles
    user.onboarding_completed = True

    await db.commit()
    await db.refresh(user)
    return user


@router.get("/profile", response_model=UserResponse)
async def get_profile(user: User = Depends(get_current_user)):
    """Return the current user's full profile."""
    return user


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    data: UpdateProfileRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update basic profile info (name, avatar)."""
    if data.name is not None:
        user.name = data.name
    if data.avatar_url is not None:
        user.avatar_url = data.avatar_url

    await db.commit()
    await db.refresh(user)
    return user


@router.put("/preferences", response_model=UserResponse)
async def update_preferences(
    data: UpdatePreferencesRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update workout preferences — equipment, styles, muscles, schedule, etc."""
    if data.equipment_inventory is not None:
        user.equipment_inventory = data.equipment_inventory
    if data.preferred_styles is not None:
        user.preferred_styles = data.preferred_styles
    if data.priority_muscles is not None:
        user.priority_muscles = data.priority_muscles
    if data.rest_day_preferences is not None:
        user.rest_day_preferences = data.rest_day_preferences
    if data.notification_settings is not None:
        user.notification_settings = data.notification_settings
    if data.available_days is not None:
        user.available_days = data.available_days
    if data.session_duration_min is not None:
        user.session_duration_min = data.session_duration_min
    if data.workout_environment is not None:
        user.workout_environment = data.workout_environment

    await db.commit()
    await db.refresh(user)
    return user
