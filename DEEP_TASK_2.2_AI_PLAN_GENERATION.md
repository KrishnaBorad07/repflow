# Task 2.2 — AI Plan Generation (Deep's Handoff)

> **Your job:** Build the AI-powered workout plan generation system. When a user completes the onboarding quiz, the backend should use their profile data + a Grok API call to generate a personalized multi-week workout plan, store it in the DB, and serve it to the frontend.

---

## 1. Local Dev Setup (Do This First)

You need Docker Desktop installed and running.

```bash
# 1. Clone the repo (you already have this)
git pull origin main

# 2. Start PostgreSQL via Docker
docker compose up -d

# 3. Install Python dependencies
cd backend
pip install -r requirements.txt

# 4. Run database migrations (creates the users table)
python -m alembic upgrade head

# 5. Seed a test user (so the app works without auth)
python -m app.seed

# 6. Start the backend
uvicorn app.main:app --reload --port 8000

# 7. (Optional) Start the frontend in another terminal
cd frontend && npm install && npm run dev
```

### Verify it works
- `http://localhost:8000/health` should return `{"status":"ok","service":"repflow-api"}`
- `http://localhost:8000/api/users/profile` should return the seeded test user's data

### Database connection (if you want to inspect with pgAdmin or DBeaver)
- Host: `localhost`
- Port: `5433` (NOT 5432 — mapped to avoid conflicts)
- User: `postgres`
- Password: `postgres`
- Database: `repflow`

### Environment file
`backend/.env` already exists with:
```
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5433/repflow
JWT_SECRET=dev-secret-change-in-production
```
You'll need to add your Grok API key here (see Section 4).

---

## 2. What Already Exists

### Database
- **PostgreSQL 16** running in Docker (via `docker-compose.yml`)
- **Async SQLAlchemy** with `asyncpg` driver (`backend/app/core/database.py`)
- **Alembic** for migrations (`backend/alembic/`)
- **Pydantic Settings** loading from `.env` (`backend/app/core/config.py`)

### Users Table (already migrated)
The `users` table has all the onboarding data you need for plan generation:

```
users table columns:
├── id (Integer, PK)
├── name, email, hashed_password, avatar_url, auth_provider, is_guest
├── goal                 (String) → "fat_loss" | "muscle_gain" | "endurance" | "general_fitness" | "flexibility"
├── experience_level     (String) → "never" | "casual" | "consistent" | "advanced"
├── age                  (Integer)
├── height_cm            (Float)
├── weight_kg            (Float)
├── body_fat_pct         (Float, nullable)
├── workout_environment  (String) → "home_none" | "home_basic" | "full_gym"
├── available_days       (Integer) → 1-7
├── session_duration_min (Integer) → 15-120
├── injuries             (JSONB)  → ["lower back", "right knee", ...]
├── onboarding_completed (Boolean)
├── equipment_inventory  (JSONB)  → ["barbell", "dumbbells", "bench", ...]
├── preferred_styles     (JSONB)  → ["strength", "hiit", "calisthenics", ...]
├── priority_muscles     (JSONB)  → ["chest", "back", ...]
├── rest_day_preferences (JSONB)
├── notification_settings (JSONB)
├── plan_tier, member_since, created_at, updated_at
```

The User model is at `backend/app/models/user.py`.

### Auth Stub
There is **no real auth yet** (Group 2 is building it later). We use a stub:

```python
# backend/app/core/dependencies.py
async def get_current_user(db) -> User:
    # Returns user with id=1 (the seeded test user)
    result = await db.execute(select(User).where(User.id == 1))
    return result.scalar_one_or_none()
```

All your endpoints should use `Depends(get_current_user)` — when auth is added later, nothing changes.

### Existing API
- `POST /api/users/onboarding` — saves quiz results (already working)
- `GET /api/users/profile` — returns user data (already working)
- `PUT /api/users/profile` — update name/avatar
- `PUT /api/users/preferences` — update workout preferences

### Frontend Expectations
The frontend Plan page (`frontend/src/pages/PlanPage.jsx`) expects this data shape from the API:

```json
{
  "id": 1,
  "program_name": "Strength Building",
  "week_number": 1,
  "total_weeks": 8,
  "is_active": true,
  "days": [
    {
      "id": 1,
      "day_of_week": 1,
      "day_name": "Mon",
      "date": "2026-05-12",
      "label": "Push Day",
      "muscles": "Chest · Shoulders · Triceps",
      "duration_est": "45 min",
      "exercise_count": 6,
      "status": "plan",
      "exercises": [
        {
          "id": 1,
          "exercise_name": "Barbell Bench Press",
          "muscle": "Chest",
          "order": 1,
          "sets": 4,
          "reps": "8-10",
          "weight": null,
          "rest_seconds": 90,
          "tempo": "3-1-2-0",
          "ai_rationale": "Compound press for chest mass — matches your muscle_gain goal"
        }
      ]
    }
  ]
}
```

The `status` field per day should be one of: `"done"`, `"today"`, `"plan"`, `"rest"`.

---

## 3. What You Need to Build

### 3a. New DB Models

Create `backend/app/models/plan.py` with these SQLAlchemy models:

**WorkoutPlan**
- `id` — Integer, PK
- `user_id` — Integer, FK → users.id
- `program_name` — String (e.g., "Strength Building", "Fat Loss Circuit")
- `week_number` — Integer (current week)
- `total_weeks` — Integer (e.g., 8)
- `is_active` — Boolean, default True
- `created_at` — DateTime

**PlanDay**
- `id` — Integer, PK
- `plan_id` — Integer, FK → workout_plans.id
- `day_of_week` — Integer (1=Mon, 7=Sun)
- `label` — String (e.g., "Push Day", "Legs", "Rest")
- `muscles` — String (e.g., "Chest · Shoulders · Triceps")
- `duration_est` — String (e.g., "45 min")
- `exercise_count` — Integer
- `status` — String, default "plan" → "plan" | "today" | "done" | "rest"

**PlanDayExercise**
- `id` — Integer, PK
- `plan_day_id` — Integer, FK → plan_days.id
- `exercise_name` — String (store the name directly — no Exercise table yet)
- `muscle` — String (primary muscle group)
- `order` — Integer
- `sets` — Integer
- `reps` — String (e.g., "8-10", "12", "AMRAP")
- `weight` — Float, nullable (suggested starting weight in kg)
- `rest_seconds` — Integer
- `tempo` — String, nullable (e.g., "3-1-2-0")
- `ai_rationale` — String (why this exercise was chosen — spec requirement)

### 3b. Alembic Migration

After creating the models:
```bash
cd backend
python -m alembic revision --autogenerate -m "create plan tables"
python -m alembic upgrade head
```

Remember to:
1. Import your new models in `backend/app/models/__init__.py` so Alembic can see them
2. The current `__init__.py` is:
```python
from app.models.base import Base
from app.models.user import User
```
Add your new imports there.

### 3c. Pydantic Schemas

Create `backend/app/schemas/plan.py`:
- `PlanDayExerciseResponse` — exercise in a day
- `PlanDayResponse` — day with nested exercises
- `PlanResponse` — full plan with nested days
- `GeneratePlanRequest` — optional overrides (or empty — just use user profile)

### 3d. Grok API Integration

Create `backend/app/services/plan_generator.py`.

Add your Grok API key to `backend/.env`:
```
GROK_API_KEY=xai-your-key-here
```

Add it to `backend/app/core/config.py`:
```python
class Settings(BaseSettings):
    DATABASE_URL: str = "..."
    JWT_SECRET: str = "..."
    GROK_API_KEY: str = ""  # Add this
```

**Grok uses the OpenAI-compatible API**, so install the openai package:
```bash
pip install openai
```
And add `openai>=1.30.0` to `requirements.txt`.

Use it like:
```python
from openai import AsyncOpenAI

client = AsyncOpenAI(
    api_key=settings.GROK_API_KEY,
    base_url="https://api.x.ai/v1",
)

response = await client.chat.completions.create(
    model="grok-3-mini-fast",      # or whichever model you have access to
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ],
    response_format={"type": "json_object"},  # Force JSON output
    temperature=0.7,
)

plan_json = json.loads(response.choices[0].message.content)
```

### 3e. The LLM Prompts

Build two prompts in `plan_generator.py`:

**System prompt** — tells the LLM it's a fitness coach AI that generates structured workout plans. Include:
- It must output valid JSON matching a specific schema
- It should follow periodization principles (progressive overload, deload weeks)
- It must respect injury limitations (never program exercises that stress injured areas)
- It must match exercises to available equipment
- It must include an `ai_rationale` for every exercise explaining why it was chosen
- Session duration must stay within the user's `session_duration_min`

**User prompt** — built dynamically from the user's profile:
```python
def build_user_prompt(user: User) -> str:
    return f"""
Generate a {user.available_days}-day weekly workout plan for this user:

- Goal: {user.goal}
- Experience: {user.experience_level}
- Age: {user.age}, Height: {user.height_cm}cm, Weight: {user.weight_kg}kg
- Body fat: {user.body_fat_pct or 'unknown'}%
- Equipment: {user.workout_environment}
- Available equipment: {', '.join(user.equipment_inventory or [])}
- Session length: {user.session_duration_min} minutes
- Injuries/limitations: {', '.join(user.injuries or []) or 'none'}
- Preferred styles: {', '.join(user.preferred_styles or [])}
- Priority muscles: {', '.join(user.priority_muscles or []) or 'no specific priority'}

Return a JSON object with this exact structure:
{{
  "program_name": "string — creative name for the program",
  "total_weeks": 8,
  "days": [
    {{
      "day_of_week": 1,
      "label": "Push Day",
      "muscles": "Chest · Shoulders · Triceps",
      "is_rest_day": false,
      "exercises": [
        {{
          "exercise_name": "Barbell Bench Press",
          "muscle": "Chest",
          "sets": 4,
          "reps": "8-10",
          "rest_seconds": 90,
          "tempo": "3-1-2-0",
          "ai_rationale": "Compound press targeting chest — ideal for your muscle_gain goal with full_gym access"
        }}
      ]
    }}
  ]
}}

Rules:
- Generate exactly 7 days (day_of_week 1-7, Mon-Sun)
- {user.available_days} days should have workouts, the rest should be rest days (is_rest_day: true, empty exercises)
- Each workout day should have 4-8 exercises
- Include warm-up movements at the start of each session
- Respect injuries: NEVER include exercises that stress {', '.join(user.injuries or ['N/A'])}
- Only use exercises possible with: {user.workout_environment} setup
- Keep estimated session time within {user.session_duration_min} minutes
- Every exercise MUST have an ai_rationale explaining why it's included
"""
```

### 3f. API Routes

Create `backend/app/api/plans.py`:

```
POST /api/plans/generate  — Generate a new plan (calls Grok API, saves to DB)
GET  /api/plans/current   — Get the user's active plan with all days and exercises
```

**POST /api/plans/generate flow:**
1. Get the current user from `Depends(get_current_user)`
2. Build the prompt from user profile data
3. Call Grok API with `response_format={"type": "json_object"}`
4. Parse the JSON response
5. Deactivate any existing active plan (`is_active = False`)
6. Create `WorkoutPlan`, `PlanDay`, and `PlanDayExercise` rows in the DB
7. Calculate `duration_est` and `exercise_count` for each day
8. Set today's day's status to `"today"`, past days to `"done"`, future to `"plan"`, rest days to `"rest"`
9. Return the full plan

**GET /api/plans/current flow:**
1. Get the current user
2. Query the active plan (`is_active=True`) with eager-loaded days and exercises
3. Update day statuses based on current date (today/done/plan)
4. Return it

### 3g. Register the Router

In `backend/app/main.py`, add:
```python
from app.api import users, plans  # add plans

app.include_router(plans.router, prefix="/api/plans", tags=["plans"])
```

### 3h. Connect Frontend (Optional — Jash can do this)

If you want to connect the frontend too, update these files:

**`frontend/src/services/planService.js`** — replace mock calls:
```javascript
import api from './api';

export const generatePlan = async () => {
  return api.post('/plans/generate');
};

export const getCurrentPlan = async () => {
  return api.get('/plans/current');
};

export const getDayDetail = async (dayId) => {
  return api.get(`/plans/days/${dayId}`);
};
```

**`frontend/src/store/planStore.js`** — fetch real data:
```javascript
import { create } from 'zustand';
import { getCurrentPlan, generatePlan } from '../services/planService';

const usePlanStore = create((set) => ({
  currentPlan: null,
  isLoading: false,

  fetchPlan: async () => {
    set({ isLoading: true });
    try {
      const res = await getCurrentPlan();
      set({ currentPlan: res.data, isLoading: false });
    } catch (err) {
      console.error('Failed to fetch plan:', err);
      set({ isLoading: false });
    }
  },

  regeneratePlan: async () => {
    set({ isLoading: true });
    try {
      const res = await generatePlan();
      set({ currentPlan: res.data, isLoading: false });
    } catch (err) {
      console.error('Failed to generate plan:', err);
      set({ isLoading: false });
    }
  },
}));

export default usePlanStore;
```

---

## 4. File Checklist

Files you need to **create**:
- [ ] `backend/app/models/plan.py` — WorkoutPlan, PlanDay, PlanDayExercise models
- [ ] `backend/app/schemas/plan.py` — Pydantic request/response schemas
- [ ] `backend/app/services/plan_generator.py` — Grok API integration + prompt engineering
- [ ] `backend/app/api/plans.py` — FastAPI route handlers

Files you need to **edit**:
- [ ] `backend/app/models/__init__.py` — import new models
- [ ] `backend/app/main.py` — register plans router
- [ ] `backend/app/core/config.py` — add GROK_API_KEY setting
- [ ] `backend/.env` — add your Grok API key
- [ ] `backend/requirements.txt` — add `openai>=1.30.0`
- [ ] Run `python -m alembic revision --autogenerate -m "create plan tables"` then `python -m alembic upgrade head`

Files you **optionally** update (or leave for Jash):
- [ ] `frontend/src/services/planService.js`
- [ ] `frontend/src/store/planStore.js`

---

## 5. Testing

Once everything is built:

```bash
# 1. Make sure the test user has onboarding data
#    Go to http://localhost:5173/onboarding and fill it out
#    OR check via: http://localhost:8000/api/users/profile
#    The user should have goal, experience_level, available_days etc. filled in

# 2. Generate a plan
curl -X POST http://localhost:8000/api/plans/generate

# 3. Fetch the active plan
curl http://localhost:8000/api/plans/current
```

The generate endpoint will take a few seconds (LLM API call). The response should be a full plan with 7 days and exercises.

---

## 6. Key Patterns to Follow

- **Async everything**: use `async def` for all route handlers and service functions
- **Dependency injection**: `user: User = Depends(get_current_user)` and `db: AsyncSession = Depends(get_db)`
- **Error handling**: wrap the Grok API call in try/except, return a clear error if it fails
- **JSON parsing**: the LLM might return malformed JSON — add retry logic or fallback
- **Don't hardcode the model name**: put it in config/settings so it's easy to swap

Good luck! Ping Jash if you have questions about the DB setup or frontend data shapes.
