from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5433/repflow"
    JWT_SECRET: str = "dev-secret-change-in-production"

    model_config = {"env_file": Path(__file__).resolve().parents[2] / ".env"}


settings = Settings()
