"""
Seed script — inserts a test user so the app works without auth.
Run: python -m app.seed
"""
import asyncio
from sqlalchemy import select
from app.core.database import async_session, engine
from app.models import Base, User


async def seed():
    # Create tables if they don't exist (safe to run multiple times)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        # Check if test user already exists
        result = await db.execute(select(User).where(User.email == "jash@example.com"))
        existing = result.scalar_one_or_none()

        if existing:
            print(f"Test user already exists (id={existing.id}). Skipping seed.")
            return

        # Create test user (simulates what auth signup would do)
        user = User(
            name="Jash Patel",
            email="jash@example.com",
            hashed_password="fake_not_real_auth_yet",
            auth_provider="email",
            is_guest=False,
            onboarding_completed=False,
            plan_tier="free",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        print(f"Seeded test user: id={user.id}, name={user.name}, email={user.email}")


if __name__ == "__main__":
    asyncio.run(seed())
