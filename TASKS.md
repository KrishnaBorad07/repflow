# RepFlow — Phase 1 Task Breakdown

> **What's done:** Full frontend (React + Vite + Tailwind), routing, Zustand stores, mock data, mock service layer, PWA config, project structure, backend scaffolding (FastAPI app, folder structure, docker-compose).
>
> **Phase 1 scope:** Spec Sections 1, 2, 3 — Onboarding/Profile, AI Plan Generation, Computer Vision.

---

## Team Split

| Group | Members | Spec Sections |
|-------|---------|---------------|
| **Group 1** | Jash + Deep | Section 1.1, 1.2 + Section 2 (all) |
| **Group 2** | Friend 3 + Friend 4 | Section 1.3 + Section 3 (all) |

---

## Shared Prerequisites

Both groups need these done first. Coordinate on who picks up what — recommended owner shown.

### P1. Database Setup (Group 2 owns, Group 1 contributes models)
- [ ] Set up async SQLAlchemy with `asyncpg` driver
- [ ] Environment config with `pydantic-settings` (DB URL, JWT secret, Redis URL, API keys)
- [ ] Set up Alembic with async support
- [ ] Create shared models both groups need:
  - `User` — id, name, email, hashed_password, avatar_url, goal, level, equipment (JSONB), preferences (JSONB), member_since, plan_tier, created_at, updated_at
  - `Exercise` — id, name, description, muscle_primary, muscles_secondary (JSONB), difficulty, equipment, sets_default, reps_default, rest_seconds, demo_video_url, tutorial_url, movement_pattern
- [ ] Create initial Alembic migration
- [ ] Seed exercise library (22 exercises from mockData, expand to 40-60)

### P2. Core Infrastructure (Group 2 owns)
- [ ] CORS middleware configuration (Spec 10.2) — already stubbed in `main.py`, finalize allowed origins
- [ ] Health check endpoint: `GET /health` (already stubbed)
- [ ] Redis setup for caching (docker-compose service exists)
- [ ] Structured logging with `structlog` or `loguru` (Spec 10.5)
- [ ] Rate limiting with `slowapi` (Spec 10.1)

---

## Group 1 — Jash + Deep

**Scope:** Onboarding quiz, user profile/preferences, AI plan generation, exercise library API, quick workouts, exercise substitution, active workout screen with video demos.

### 1.1 Smart Onboarding Quiz (Spec 1.1)
- [ ] Pydantic schemas: `OnboardingRequest` (goal, experience, body metrics, equipment, schedule, injuries)
- [ ] API route:
  - `POST /api/users/onboarding` — save quiz results to user profile, trigger initial plan generation
- [ ] Connect frontend `OnboardingPage.jsx` flow to real endpoint
- [ ] Validate that onboarding data flows into the AI plan prompt (Section 2.1 dependency)

### 1.2 User Profile & Preferences (Spec 1.2)
- [ ] Pydantic schemas: `UserProfileResponse`, `UpdateProfileRequest`, `UpdatePreferencesRequest`
- [ ] API routes:
  - `GET /api/users/profile` — full profile with preferences, equipment inventory, workout style prefs
  - `PUT /api/users/profile` — update name, avatar, etc.
  - `PUT /api/users/preferences` — update equipment list, preferred styles, priority muscles, rest day prefs, notification settings
  - `GET /api/users/stats` — total workouts, hours, streak, volume (basic counters for now)
- [ ] Connect frontend `userService.js` and `ProfilePage.jsx` to real endpoints
- [ ] Connect frontend `SettingsPage.jsx` to preferences endpoint

### 2.1 Exercise Library API (Spec 5.1)
- [ ] Pydantic schemas: `ExerciseResponse`, `ExerciseListResponse`, `ExerciseFilter`
- [ ] API routes:
  - `GET /api/exercises` — list all, filterable by muscle group, equipment, difficulty, movement pattern, search query
  - `GET /api/exercises/{id}` — single exercise with full details
- [ ] Connect frontend `exerciseService.js` to real endpoints
- [ ] Source/record 40-60 exercise demo video clips (10-15 sec MP4s, silent, looping)
- [ ] Set up cloud storage (S3 / Cloudflare R2) for video hosting with CDN
- [ ] Populate `demo_video_url` and `tutorial_url` fields in exercise records
- [ ] Update `VideoPlayer` component to play real self-hosted videos

### 2.2 AI Plan Generation (Spec 2.1, 2.2)
- [ ] Set up LangChain or direct Claude/OpenAI SDK integration in FastAPI
- [ ] Design system prompt for plan generation including:
  - User profile (goal, level, equipment, schedule, injuries from onboarding)
  - Exercise library reference
  - Periodization principles
  - Educational explanations for exercise choices (spec requirement: "Goblet squats are included because...")
- [ ] Create structured output parser for plan JSON:
  - Weekly split (which muscle groups on which days)
  - Exercises per session with sets, reps, rest, tempo
  - Warm-up and cool-down routines
  - Estimated session duration and difficulty rating
- [ ] DB models:
  - `WorkoutPlan` — id, user_id (FK), week_number, total_weeks, program_name, created_at, is_active
  - `PlanDay` — id, plan_id (FK), day_of_week, label, muscles, duration_est, exercise_count, status, date
  - `PlanDayExercise` — id, plan_day_id (FK), exercise_id (FK), order, sets, reps, weight, rest_seconds, tempo, ai_rationale
- [ ] API routes:
  - `POST /api/plans/generate` — generate new multi-week plan from user profile
  - `GET /api/plans/current` — get user's active plan with all days and exercises
  - `GET /api/plans/{plan_id}/days/{day_id}` — single day detail
  - `POST /api/plans/regenerate` — regenerate with optional tweaks
- [ ] LLM response caching in Redis (Spec 10.1)
- [ ] Connect frontend `planService.js` and `planStore.js` to real endpoints

### 2.3 Adaptive Plan Progression (Spec 2.2)
- [ ] After each workout completion, analyze performance:
  - Did user complete all sets/reps?
  - Weight increases/decreases?
  - Form score trends (once CV is integrated)?
  - User-reported RPE?
- [ ] LLM prompt to suggest adjustments: progressive overload, deload week, exercise swaps
- [ ] API route: `POST /api/plans/adapt` — trigger post-workout plan adaptation

### 2.4 Quick Workout Generator (Spec 2.3)
- [ ] API route: `POST /api/plans/quick` — generate single session
  - Input: available_time (15/30/45/60 min), equipment, target_muscles, intensity, workout_style
  - Output: complete workout with exercises, sets, reps, rest
- [ ] Connect frontend `QuickWorkoutPage.jsx` to real endpoint

### 2.5 Exercise Substitution Engine (Spec 2.4)
- [ ] API route: `POST /api/exercises/{id}/substitute`
  - Input: reason (no equipment, injury, preference), available_equipment
  - Output: list of substitute exercises with explanation of differences and form focus
- [ ] Add swap button to `ExerciseCard` component in frontend

### 2.6 Active Workout Screen — Video Integration (Spec 2.5)
- [ ] Update `ActiveWorkoutPage.jsx` to show looping demo video at top of each exercise card
- [ ] Implement "Watch Full Tutorial" button opening curated YouTube link
- [ ] Auto-replay demo video during rest timer between sets
- [ ] Previous performance display ("Last time: 3×10 @ 60kg") from workout history
- [ ] PWA service worker caching for video clips (offline playback)

---

## Group 2 — Friend 3 + Friend 4

**Scope:** Authentication system, and the entire real-time computer vision pipeline (pose estimation, form analysis, rep counting, exercise recognition).

### 1.3 Authentication & Account (Spec 1.3)
- [ ] Pydantic schemas: `UserCreate`, `UserLogin`, `UserResponse`, `TokenResponse`
- [ ] Password hashing with `passlib[bcrypt]`
- [ ] JWT token creation & verification with `python-jose`
- [ ] FastAPI dependency: `get_current_user` auth guard
- [ ] API routes:
  - `POST /api/auth/signup` — create user, return JWT
  - `POST /api/auth/login` — verify credentials, return JWT
  - `POST /api/auth/google` — OAuth with Google
  - `GET /api/auth/me` — return current user profile
  - `POST /api/auth/forgot-password` — send reset email (stub initially)
- [ ] Optional guest mode: let users try a single generated workout before signup (conversion hook)
- [ ] Connect frontend `authService.js` to real endpoints
- [ ] Update `authStore.js`: replace `isAuthenticated: true` + `mockUser` with real JWT flow (localStorage)
- [ ] Update `ProtectedRoute` / `PublicRoute` to work with real auth state

### 3.1 Pose Estimation & Form Analysis (Spec 3.1)
- [ ] Integrate TensorFlow.js with MoveNet or BlazePose model (runs entirely in browser)
- [ ] Implement `CameraView.jsx` (currently a Phase 2 placeholder):
  - Camera access with permissions handling
  - Guided setup: "Prop your phone 6-8 feet away, landscape, full body visible" (Spec 9.4)
  - Silhouette overlay for positioning
  - Model loading with progress indicator
- [ ] Joint angle calculations from keypoints:
  - Knee flexion (squats), elbow angle (curls), hip hinge (deadlifts)
  - Body alignment (spinal neutrality, knee tracking, shoulder position)
  - Range of motion (squat depth, press lockout)
  - Left/right symmetry
- [ ] All processing on-device — no video uploaded to server (privacy-critical, communicate to users)

### 3.2 Real-Time Corrective Cues (Spec 3.2)
- [ ] Implement `PoseOverlay.jsx`:
  - Green skeleton overlay = good form
  - Yellow highlights on specific joints = attention needed
  - Red highlights + text cue = stop and correct
- [ ] Corrective cue library:
  - "Knees are caving inward — push them out over your toes"
  - "Your back is rounding — engage your core and keep chest up"
  - "You're not hitting full depth — try to get thighs parallel"
  - "Great lockout — full extension at the top!"
- [ ] Cues must be concise and actionable (short coaching prompts processable mid-rep)

### 3.3 Automatic Rep Counter (Spec 3.3)
- [ ] Implement `RepCounter.jsx`:
  - Track cyclical motion patterns (descent/ascent phases)
  - Distinguish complete reps (full ROM) vs partial reps
  - Flag reps where form broke down
- [ ] Post-set summary with coaching tip:
  - "8 reps completed, 7 with good form, 1 partial — try to maintain depth on your last reps"
  - Identify specific form breakdown, give targeted suggestion for next set
- [ ] Form score calculation (0-10 scale) based on joint angles and ROM

### 3.4 Exercise Recognition (Spec 3.4)
- [ ] Identify exercise from movement pattern when CV is active
- [ ] Enables automatic logging without manual selection
- [ ] Start with 15-20 common exercises, expand over time

### 3.5 Set & Rest Timer Integration (Spec 3.5)
- [ ] Auto-detect set completion (user stands up, stops movement pattern)
- [ ] Automatically start prescribed rest timer on set completion
- [ ] Visual and audio cue when rest is over
- [ ] Connect CV set detection to `workoutStore` set logging

### 3.6 Basic Workout Logging (needed for CV data to persist)
- [ ] DB models:
  - `WorkoutSession` — id, user_id (FK), plan_day_id (FK nullable), started_at, ended_at, duration, total_volume, form_score_avg, calories, rpe
  - `SetLog` — id, session_id (FK), exercise_id (FK), set_number, reps_completed, reps_good_form, weight, form_score, is_partial, notes
- [ ] API routes:
  - `POST /api/workouts/start` — create a new session
  - `POST /api/workouts/{session_id}/sets` — log a completed set (reps, weight, form_score, is_partial)
  - `POST /api/workouts/{session_id}/end` — finalize session, compute summary stats
  - `GET /api/workouts/history` — paginated workout history
  - `GET /api/workouts/{session_id}` — single session detail with all sets
- [ ] Auto-calculate: total volume, avg form score, calories estimate, duration
- [ ] Connect frontend `workoutService.js` and `workoutStore.js` to real endpoints

---

## Dependency Order

```
Shared Prerequisites (DB + Infrastructure)
     │
     ├── Group 2: Auth (1.3) ──► Group 1 needs auth guards for all protected endpoints
     │
     ├── Group 1: Onboarding (1.1) + Profile (1.2) ──► feeds into plan generation
     │        │
     │        └── Group 1: Exercise Library (2.1) ──► needed by plan generation
     │                 │
     │                 └── Group 1: AI Plan Gen (2.2) ──► core feature
     │                          │
     │                          ├── Group 1: Adaptive Progression (2.3)
     │                          ├── Group 1: Quick Workout (2.4)
     │                          ├── Group 1: Substitution Engine (2.5)
     │                          └── Group 1: Video Integration (2.6)
     │
     └── Group 2: Workout Logging (3.6) ──► CV needs somewhere to store data
              │
              ├── Group 2: Pose Estimation (3.1) ──► can start in parallel (client-side)
              ├── Group 2: Corrective Cues (3.2)
              ├── Group 2: Rep Counter (3.3)
              ├── Group 2: Exercise Recognition (3.4)
              └── Group 2: Set/Rest Timer (3.5)
```

## Recommended Sprint Plan

| Week | Group 1 (Jash + Deep) | Group 2 (Friend 3 + Friend 4) |
|------|----------------------|-------------------------------|
| **1** | DB models for exercises/plans, Exercise Library API (2.1), start sourcing videos | DB models for users/sessions/sets, Auth system (1.3), Alembic migrations |
| **2** | Onboarding API (1.1), Profile API (1.2), LLM SDK setup | Connect auth to frontend, start TensorFlow.js integration (3.1), CameraView |
| **3** | AI Plan Generation (2.2), Quick Workout (2.4) | PoseOverlay (3.2), Rep Counter (3.3), Workout Logging API (3.6) |
| **4** | Adaptive Progression (2.3), Substitution Engine (2.5), Video Integration (2.6) | Exercise Recognition (3.4), Set/Rest Timer (3.5), CV ↔ workout store integration |
| **5** | Frontend integration, plan flow testing, video CDN setup | Frontend integration, CV accuracy tuning, end-to-end workout flow testing |

---

## Future Phases (Not in Scope Now)

| Phase | Sections | Covers |
|-------|----------|--------|
| **Phase 2** | Sections 4, 5 | Progress analytics, body metrics, AI weekly summary, content recommendations |
| **Phase 3** | Sections 6, 7 | AI coaching chat, gamification (badges, streaks, challenges) |
| **Phase 4** | Sections 8, 9, 10 | Social features, PWA production (offline, push notifs), admin dashboard |
