"""
Security helpers — password hashing (bcrypt) and JWT tokens (python-jose).

Used by:
- app.api.auth        → signup/login routes
- app.core.dependencies.get_current_user → request auth guard
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings


# ──── Password hashing ────
# bcrypt is the standard choice — slow on purpose to resist brute-force.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """Hash a plaintext password before storing it in the DB."""
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check a login attempt against the stored hash."""
    return pwd_context.verify(plain_password, hashed_password)


# ──── JWT tokens ────

def create_access_token(
    subject: str | int,
    expires_minutes: Optional[int] = None,
) -> str:
    """
    Create a signed JWT.

    `subject` is typically the user id. It is stored in the standard `sub` claim
    (JWT spec requires `sub` to be a string, so we cast).
    """
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {
        "sub": str(subject),
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """
    Verify a JWT signature + expiry and return the payload.
    Returns None if the token is invalid or expired.
    """
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None
