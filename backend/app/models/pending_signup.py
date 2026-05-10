"""
PendingSignup — temporary holding row for users who have started signup
but not yet entered their OTP. Once verified, this row is deleted and
a real `users` row is created.
"""
from sqlalchemy import Column, DateTime, Integer, String, func

from app.models.base import Base


class PendingSignup(Base):
    __tablename__ = "pending_signups"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)

    # Hashed OTP (bcrypt). We never store the plaintext code.
    otp_hash = Column(String(255), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    attempts = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
