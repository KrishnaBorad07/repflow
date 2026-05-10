from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, users

app = FastAPI(
    title="RepFlow API",
    description="AI-powered fitness assistant backend",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "repflow-api"}


# ──── Routers ────
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])

# TODO: Uncomment as each module is built
# from app.api import plans, workouts, exercises, progress, chat
# app.include_router(plans.router, prefix="/api/plans", tags=["plans"])
# app.include_router(workouts.router, prefix="/api/workouts", tags=["workouts"])
# app.include_router(exercises.router, prefix="/api/exercises", tags=["exercises"])
# app.include_router(progress.router, prefix="/api/progress", tags=["progress"])
# app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
