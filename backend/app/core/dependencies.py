"""
Shared FastAPI dependencies.

get_current_user is a STUB that returns a hardcoded test user.
Group 2 will replace this with real JWT auth later — no other code changes needed.
"""
from fastapi import Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.user import User


async def get_current_user(db: AsyncSession = Depends(get_db)) -> User:
    """
    TEMPORARY: Returns user with id=1 (the seeded test user).
    When Group 2 implements auth, this will decode a JWT token
    and return the real authenticated user. All endpoints using
    Depends(get_current_user) will work without any changes.
    """
    result = await db.execute(select(User).where(User.id == 1))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=500,
            detail="No test user found. Run: python -m app.seed",
        )
    return user
