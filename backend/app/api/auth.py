"""
Authentication endpoints — Spec 1.3.

POST /api/auth/signup           → start OTP flow (sends email, no account yet)
POST /api/auth/verify-otp       → confirm OTP, create user, return JWT
POST /api/auth/resend-otp       → re-issue an OTP for a pending signup
POST /api/auth/login            → verify credentials, return JWT
POST /api/auth/google           → real Google OAuth (id_token verification)
GET  /api/auth/me               → return current user
POST /api/auth/forgot-password  → send reset email (stub)
POST /api/auth/guest            → optional one-shot guest account
"""
import logging
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.models.pending_signup import PendingSignup
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    GoogleAuthRequest,
    MessageResponse,
    OtpVerifyRequest,
    ResendOtpRequest,
    TokenResponse,
    UserCreate,
    UserLogin,
)
from app.schemas.user import UserResponse
from app.services.email import send_otp_email
from app.services.otp import generate_otp, hash_otp, verify_otp

logger = logging.getLogger(__name__)

router = APIRouter()


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


async def _create_pending_signup(
    db: AsyncSession, *, name: str, email: str, password: str
) -> str:
    """
    Insert (or replace) a pending_signups row and return the plaintext OTP
    so the caller can email it.
    """
    # Drop any existing pending row for this email — user is starting over.
    existing = await db.execute(select(PendingSignup).where(PendingSignup.email == email))
    old = existing.scalar_one_or_none()
    if old:
        await db.delete(old)
        await db.flush()

    otp = generate_otp()
    pending = PendingSignup(
        email=email,
        name=name.strip(),
        hashed_password=hash_password(password),
        otp_hash=hash_otp(otp),
        expires_at=_utcnow() + timedelta(minutes=settings.OTP_EXPIRY_MINUTES),
        attempts=0,
    )
    db.add(pending)
    await db.commit()
    return otp


# ──── Signup (step 1) — request OTP ────

@router.post("/signup", response_model=MessageResponse, status_code=status.HTTP_202_ACCEPTED)
async def signup(data: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Step 1 of signup. Stores name/email/password in `pending_signups`,
    generates a 6-digit OTP, and emails it. The real `users` row is only
    created once the OTP is verified.
    """
    email = data.email.lower()

    # If a real account already exists, refuse.
    existing_user = await db.execute(select(User).where(User.email == email))
    if existing_user.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    otp = await _create_pending_signup(db, name=data.name, email=email, password=data.password)

    try:
        await send_otp_email(email, name=data.name.strip(), otp=otp)
    except Exception:
        # Email send failed — surface a 500 but keep the pending row so the
        # user can hit /resend-otp to retry without re-entering the form.
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not send verification email. Please try again or use /resend-otp.",
        )

    return MessageResponse(
        message=f"Verification code sent to {email}. It expires in {settings.OTP_EXPIRY_MINUTES} minutes."
    )


# ──── Signup (step 2) — verify OTP, create user ────

@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp_route(data: OtpVerifyRequest, db: AsyncSession = Depends(get_db)):
    """Confirm the OTP, create the real user row, return a JWT."""
    email = data.email.lower()
    result = await db.execute(select(PendingSignup).where(PendingSignup.email == email))
    pending = result.scalar_one_or_none()

    if not pending:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No pending signup for that email. Please sign up again.",
        )

    # Expired? Discard and ask the user to start over.
    expires_at = pending.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < _utcnow():
        await db.delete(pending)
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="That verification code has expired. Please sign up again.",
        )

    # Too many wrong attempts? Burn the pending row to prevent brute-force.
    if pending.attempts >= settings.OTP_MAX_ATTEMPTS:
        await db.delete(pending)
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed attempts. Please sign up again to get a new code.",
        )

    if not verify_otp(data.otp, pending.otp_hash):
        pending.attempts += 1
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect verification code.",
        )

    # All good — promote pending → real user.
    user = User(
        name=pending.name,
        email=pending.email,
        hashed_password=pending.hashed_password,
        auth_provider="email",
        email_verified=True,
        is_guest=False,
        onboarding_completed=False,
        plan_tier="free",
    )
    db.add(user)
    await db.delete(pending)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


# ──── Resend OTP ────

@router.post("/resend-otp", response_model=MessageResponse)
async def resend_otp(data: ResendOtpRequest, db: AsyncSession = Depends(get_db)):
    """
    Re-issue an OTP for a pending signup. We require an existing pending row
    (so a stranger can't trigger emails to arbitrary addresses).
    """
    email = data.email.lower()
    result = await db.execute(select(PendingSignup).where(PendingSignup.email == email))
    pending = result.scalar_one_or_none()
    if not pending:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No pending signup for that email. Please sign up first.",
        )

    otp = generate_otp()
    pending.otp_hash = hash_otp(otp)
    pending.expires_at = _utcnow() + timedelta(minutes=settings.OTP_EXPIRY_MINUTES)
    pending.attempts = 0
    await db.commit()

    try:
        await send_otp_email(email, name=pending.name, otp=otp)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not send verification email. Please try again.",
        )

    return MessageResponse(
        message=f"A new code was sent to {email}. It expires in {settings.OTP_EXPIRY_MINUTES} minutes."
    )


# ──── Login ────

@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    """Verify email + password and return a JWT."""
    email = data.email.lower()
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    # Same error for "no such user" and "wrong password" — don't leak which.
    if not user or not user.hashed_password or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


# ──── Google OAuth ────

@router.post("/google", response_model=TokenResponse)
async def google_auth(data: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    """
    Verify a Google id_token and either log in an existing user (matched by
    email) or create a new one with auth_provider='google'.
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google sign-in is not configured on the server.",
        )

    try:
        # google-auth fetches Google's public keys, checks signature, expiry,
        # and that aud == our client id. Raises ValueError on any failure.
        info = google_id_token.verify_oauth2_token(
            data.id_token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except ValueError as exc:
        logger.warning("Google id_token verification failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google credential.",
        )

    email = (info.get("email") or "").lower()
    if not email or not info.get("email_verified", False):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google account has no verified email.",
        )

    name = info.get("name") or email.split("@")[0]
    picture = info.get("picture")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user is None:
        # First-time Google login → create a user. We still set a random
        # hashed_password so the column constraint is satisfied; this user
        # cannot log in via /login until they set a real password.
        user = User(
            name=name,
            email=email,
            hashed_password=hash_password(secrets.token_urlsafe(32)),
            avatar_url=picture,
            auth_provider="google",
            email_verified=True,
            is_guest=False,
            onboarding_completed=False,
            plan_tier="free",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        # Existing user — keep their original auth_provider but mark verified.
        if not user.email_verified:
            user.email_verified = True
            await db.commit()
            await db.refresh(user)

    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


# ──── Me ────

@router.get("/me", response_model=UserResponse)
async def me(user: User = Depends(get_current_user)):
    """Return the user described by the request's JWT."""
    return user


# ──── Forgot password (stub) ────

@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(data: ForgotPasswordRequest):
    """
    STUB — always returns success regardless of whether the email exists,
    so attackers can't enumerate accounts. A real implementation would
    enqueue a reset-link email if the user exists.
    """
    return MessageResponse(
        message="If an account exists for that email, a reset link has been sent."
    )


# ──── Guest mode (optional conversion hook) ────

@router.post("/guest", response_model=TokenResponse)
async def create_guest(db: AsyncSession = Depends(get_db)):
    """
    Create a throwaway guest account so a visitor can try one workout
    before signing up. The returned JWT works exactly like a real user's.
    """
    suffix = secrets.token_hex(4)
    guest = User(
        name=f"Guest {suffix}",
        email=f"guest_{suffix}@guest.repflow.local",
        hashed_password=hash_password(secrets.token_urlsafe(16)),
        auth_provider="guest",
        email_verified=True,
        is_guest=True,
        onboarding_completed=False,
        plan_tier="free",
    )
    db.add(guest)
    await db.commit()
    await db.refresh(guest)

    token = create_access_token(subject=guest.id)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(guest))
