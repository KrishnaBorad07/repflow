"""
Lightweight schema migration — runs at the same level of formality as seed.py.

Safe to run repeatedly. Adds `users.email_verified` if missing and creates the
`pending_signups` table. Existing users are kept (and marked verified, since
they signed up before verification was a thing).

Usage: python -m app.migrate
"""
import asyncio

from sqlalchemy import text

from app.core.database import async_session, engine
from app.models import Base


async def migrate():
    async with engine.begin() as conn:
        # Add `email_verified` column if it doesn't exist. Pre-existing users
        # default to TRUE so they're not locked out of the app.
        await conn.execute(text(
            "ALTER TABLE users "
            "ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT TRUE"
        ))
        # Backfill in case the column existed with NULLs.
        await conn.execute(text(
            "UPDATE users SET email_verified = TRUE WHERE email_verified IS NULL"
        ))
        # Create any tables defined in models that don't exist yet
        # (this picks up `pending_signups`).
        await conn.run_sync(Base.metadata.create_all)

    print("Migration complete: users.email_verified [ok], pending_signups [ok]")


if __name__ == "__main__":
    asyncio.run(migrate())
