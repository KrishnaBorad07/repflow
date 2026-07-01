"""
Outbound email via Gmail SMTP.

Falls back to logging the body to the console when GMAIL_USER /
GMAIL_APP_PASSWORD are not set, so the OTP flow remains testable
without needing real SMTP credentials.
"""
from __future__ import annotations

import logging
from email.message import EmailMessage

import aiosmtplib

from app.core.config import settings

logger = logging.getLogger(__name__)


async def send_email(to: str, subject: str, body: str) -> None:
    """Send a plain-text email. Console-prints if SMTP isn't configured."""
    if not settings.GMAIL_USER or not settings.GMAIL_APP_PASSWORD:
        # Dev fallback — print to console so the OTP is still reachable.
        print("\n" + "=" * 60)
        print(f"[EMAIL — SMTP not configured, printing instead]")
        print(f"To:      {to}")
        print(f"Subject: {subject}")
        print("-" * 60)
        print(body)
        print("=" * 60 + "\n", flush=True)
        return

    msg = EmailMessage()
    msg["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.GMAIL_USER}>"
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(body)

    try:
        await aiosmtplib.send(
            msg,
            hostname="smtp.gmail.com",
            port=587,
            start_tls=True,
            username=settings.GMAIL_USER,
            password=settings.GMAIL_APP_PASSWORD,
            timeout=15,
        )
        logger.info("Email sent to %s (%s)", to, subject)
    except Exception:
        logger.exception("Failed to send email to %s", to)
        # SMTP failed (e.g. host blocks outbound port 587). Print to console
        # so the OTP is visible in server logs and signup still succeeds.
        print("\n" + "=" * 60)
        print("[EMAIL FALLBACK — SMTP failed, OTP printed to console]")
        print(f"To:      {to}")
        print(f"Subject: {subject}")
        print("-" * 60)
        print(body)
        print("=" * 60 + "\n", flush=True)


async def send_otp_email(to: str, name: str, otp: str) -> None:
    body = (
        f"Hi {name},\n\n"
        f"Your RepFlow verification code is: {otp}\n\n"
        f"This code expires in {settings.OTP_EXPIRY_MINUTES} minutes. "
        f"If you didn't request this, you can ignore this email.\n\n"
        f"— The RepFlow team"
    )
    await send_email(to, "Your RepFlow verification code", body)
