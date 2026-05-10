"""
OTP helpers — generate a 6-digit code and hash/verify it via passlib.

We hash OTPs the same way we hash passwords so a DB dump still doesn't
leak in-flight verification codes.
"""
import secrets

from app.core.security import hash_password, verify_password


def generate_otp() -> str:
    """Cryptographically random 6-digit code, e.g. '042918'."""
    return f"{secrets.randbelow(1_000_000):06d}"


def hash_otp(otp: str) -> str:
    return hash_password(otp)


def verify_otp(plain_otp: str, hashed_otp: str) -> bool:
    return verify_password(plain_otp, hashed_otp)
