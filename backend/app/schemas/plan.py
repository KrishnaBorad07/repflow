from pydantic import BaseModel
from typing import Optional


class GeneratePlanRequest(BaseModel):
    goal: str = "Build Muscle"
    level: str = "Intermediate"
    daysPerWeek: int = 4
    sessionLength: int = 45
    equipment: str = "full-gym"
    priorityMuscles: list[str] = ["Chest", "Back"]
    injuries: str = "None"
    workoutStyles: list[str] = ["strength"]


class RegeneratePlanRequest(BaseModel):
    feedback: Optional[str] = None
    goal: Optional[str] = None
    level: Optional[str] = None
    daysPerWeek: Optional[int] = None
    sessionLength: Optional[int] = None
    equipment: Optional[str] = None
    priorityMuscles: Optional[list[str]] = None
    injuries: Optional[str] = None
    workoutStyles: Optional[list[str]] = None


class ExerciseInPlan(BaseModel):
    id: str
    exerciseId: str
    name: str
    muscle: str
    equipment: str
    description: Optional[str] = None
    order: int
    sets: int
    reps: int
    weight: float
    restSeconds: int
    tempo: Optional[str] = None
    aiRationale: Optional[str] = None

    class Config:
        from_attributes = True


class PlanDayResponse(BaseModel):
    id: str
    dayName: str
    date: Optional[str] = None
    label: str
    muscles: str
    duration: str
    exerciseCount: int
    status: str
    exercises: list[ExerciseInPlan] = []

    class Config:
        from_attributes = True


class WeeklyPlanResponse(BaseModel):
    weekNumber: int
    totalWeeks: int
    programName: str
    days: list[PlanDayResponse]

    class Config:
        from_attributes = True
