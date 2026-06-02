from pydantic_settings import BaseSettings
from functools import lru_cache
from pathlib import Path


class Settings(BaseSettings):
    # ──── Database ────
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5433/repflow"

    # ──── Groq AI ────
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # ──── Auth ────
    SECRET_KEY: str = "dev-secret-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    JWT_SECRET: str = "dev-secret-change-in-production"

    # ──── Gmail SMTP (for OTP / verification emails) ────
    GMAIL_USER: str = ""
    GMAIL_APP_PASSWORD: str = ""
    EMAIL_FROM_NAME: str = "RepFlow"

    # ──── Google OAuth ────
    GOOGLE_CLIENT_ID: str = ""

    # ──── Frontend (for links inside emails) ────
    FRONTEND_URL: str = "http://localhost:5173"

    # ──── OTP behavior ────
    OTP_EXPIRY_MINUTES: int = 10
    OTP_MAX_ATTEMPTS: int = 5

    # ──── OpenAI (form coach) ────
    OPENAI_API_KEY: str = ""

    model_config = {
        "env_file": Path(__file__).resolve().parents[2] / ".env",
        "extra": "ignore",
    }


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
