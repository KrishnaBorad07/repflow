"""
Auth-specific request/response schemas.

The full user shape lives in `schemas/user.py::UserResponse` and is reused
here for /me and login/signup responses.
"""
from pydantic import BaseModel, EmailStr, Field

from app.schemas.user import UserResponse


# ──── Requests ────

class UserCreate(BaseModel):
    """POST /api/auth/signup body — kicks off the OTP flow (does NOT create the user yet)."""
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class UserLogin(BaseModel):
    """POST /api/auth/login body."""
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)


class OtpVerifyRequest(BaseModel):
    """POST /api/auth/verify-otp body — finalises a pending signup."""
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")


class ResendOtpRequest(BaseModel):
    """POST /api/auth/resend-otp body."""
    email: EmailStr


class GoogleAuthRequest(BaseModel):
    """POST /api/auth/google body — id_token from Google Identity Services."""
    id_token: str


class ForgotPasswordRequest(BaseModel):
    """POST /api/auth/forgot-password body."""
    email: EmailStr


# ──── Responses ────

class TokenResponse(BaseModel):
    """Returned by login / verify-otp / google. `user` mirrors GET /api/auth/me."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class MessageResponse(BaseModel):
    """Generic success message — used by signup-pending, resend-otp, forgot-password."""
    message: str
