from sqlalchemy import Column, String, Integer, Text, JSON
from app.models.base import Base


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    muscle_primary = Column(String, nullable=False)
    muscles_secondary = Column(JSON, default=[])
    difficulty = Column(String, nullable=False)
    equipment = Column(String, nullable=False)
    sets_default = Column(Integer, default=3)
    reps_default = Column(Integer, default=10)
    rest_seconds = Column(Integer, default=60)
    demo_video_url = Column(String, nullable=True)
    tutorial_url = Column(String, nullable=True)
    movement_pattern = Column(String, nullable=True)
