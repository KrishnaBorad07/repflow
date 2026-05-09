# RepFlow — Remaining Task Breakdown (4 Team Members)

> **What's done:** Full frontend (React + Vite + Tailwind), routing, Zustand stores, mock data, mock service layer, PWA config, project structure.
>
> **What's left:** Backend API, database, AI/LLM integration, computer vision, connecting frontend to real APIs, and production features.

---

## Person 1 — Auth, Database & Core Backend Infrastructure

**Focus:** Build the foundational backend that everyone else depends on. Database schema, migrations, auth system, and core API plumbing.

### Tasks

#### 1.1 Database Schema & Models (Spec Section 1, Appendix A)
- [ ] Set up async SQLAlchemy with `asyncpg` driver
- [ ] Create all SQLAlchemy models:
  - `User` — id, name, email, hashed_password, avatar_url, goal, level, member_since, plan_tier, preferences (JSONB), created_at, updated_at
  - `Exercise` — id, name, description, muscle_primary, muscles_secondary (JSONB), difficulty, equipment, sets_default, reps_default, rest_seconds, demo_video_url, tutorial_url, movement_pattern (push/pull/hinge/squat/carry/rotation)
  - `WorkoutPlan` — id, user_id (FK), week_number, total_weeks, program_name, created_at, is_active
  - `PlanDay` — id, plan_id (FK), day_of_week, label, muscles, duration_est, exercise_count, status, date
  - `PlanDayExercise` — id, plan_day_id (FK), exercise_id (FK), order, sets, reps, weight, rest_seconds
  - `WorkoutSession` — id, user_id (FK), plan_day_id (FK nullable), started_at, ended_at, duration, total_volume, form_score_avg, calories, rpe
  - `SetLog` — id, session_id (FK), exercise_id (FK), set_number, reps_completed, reps_good_form, weight, form_score, is_partial, notes
  - `Achievement` — id, name, icon, description, criteria (JSONB)
  - `UserAchievement` — id, user_id (FK), achievement_id (FK), earned_at
  - `ChatMessage` — id, user_id (FK), role (user/assistant), content, suggestion (JSONB nullable), created_at
  - `BodyMetric` — id, user_id (FK), date, weight_kg, body_fat_pct, measurements (JSONB)
- [ ] Set up Alembic with async support and create initial migration
- [ ] Seed the exercise library (22 exercises from mockData + expand to 40-60)

#### 1.2 Authentication System (Spec Section 1.3)
- [ ] Pydantic schemas: `UserCreate`, `UserLogin`, `UserResponse`, `TokenResponse`
- [ ] Password hashing with `passlib[bcrypt]`
- [ ] JWT token creation & verification with `python-jose`
- [ ] FastAPI dependency: `get_current_user` auth guard
- [ ] API routes:
  - `POST /api/auth/signup` — create user, return JWT
  - `POST /api/auth/login` — verify credentials, return JWT
  - `POST /api/auth/google` — OAuth with Google
  - `GET /api/auth/me` — return current user profile
  - `POST /api/auth/forgot-password` — send reset email (stub)
- [ ] Connect frontend `authService.js` to real endpoints
- [ ] Update `authStore.js` to use real login/signup flows with JWT in localStorage

#### 1.3 User Profile & Settings API (Spec Section 1.2)
- [ ] API routes:
  - `GET /api/users/profile` — full profile with preferences
  - `PUT /api/users/profile` — update name, avatar, etc.
  - `PUT /api/users/preferences` — update workout preferences (JSONB)
  - `POST /api/users/onboarding` — save onboarding quiz results
  - `GET /api/users/stats` — total workouts, hours, streak, volume
- [ ] Connect frontend `userService.js` to real endpoints

#### 1.4 Core Infrastructure (Spec Section 10)
- [ ] Redis setup for caching and rate limiting
- [ ] CORS middleware configuration (Spec Section 10.2) — already stubbed in `main.py`
- [ ] Rate limiting with `slowapi` (Spec Section 10.1)
- [ ] Structured logging with `structlog` or `loguru` (Spec Section 10.5)
- [ ] Health check endpoint: `GET /health`
- [ ] Sentry error tracking integration (Spec Section 10.5)
- [ ] Environment config with `pydantic-settings` (database URL, JWT secret, Redis URL, API keys)
- [ ] Docker Compose: add Redis service, finalize Postgres + backend + frontend services

---

## Person 2 — AI Plan Generation & Exercise Library API

**Focus:** The core intelligence — LLM-powered workout plan generation, exercise management, and the quick workout feature.

### Tasks

#### 2.1 Exercise Library API (Spec Section 5.1)
- [ ] Pydantic schemas: `ExerciseResponse`, `ExerciseListResponse`, `ExerciseFilter`
- [ ] API routes:
  - `GET /api/exercises` — list all, with filters (muscle, equipment, difficulty, movement_pattern, search query)
  - `GET /api/exercises/{id}` — single exercise with full details
- [ ] Connect frontend `exerciseService.js` to real endpoints
- [ ] Source/record 40-60 exercise demo video clips (10-15 sec MP4s)
- [ ] Set up cloud storage (S3/Cloudflare R2) for video hosting with CDN
- [ ] Add `demo_video_url` and `tutorial_url` fields, update `VideoPlayer` component to play real videos

#### 2.2 AI Plan Generation (Spec Section 2.1, 2.2)
- [ ] Set up LangChain or direct Claude/OpenAI SDK integration
- [ ] Design system prompt for plan generation that includes:
  - User profile (goal, level, equipment, schedule, injuries)
  - Exercise library reference
  - Periodization principles
- [ ] Create structured output parser for plan JSON (weekly split with exercises, sets, reps, rest, tempo)
- [ ] API routes:
  - `POST /api/plans/generate` — generate a new multi-week plan from user profile
  - `GET /api/plans/current` — get the user's active plan with all days and exercises
  - `GET /api/plans/{plan_id}/days/{day_id}` — single day detail
  - `POST /api/plans/regenerate` — regenerate plan with optional tweaks
- [ ] LLM response caching in Redis (Spec Section 10.1) to avoid regenerating identical plans
- [ ] Connect frontend `planService.js` and `planStore.js` to real endpoints

#### 2.3 Adaptive Plan Progression (Spec Section 2.2)
- [ ] After each workout completion, analyze performance data:
  - Did user complete all sets/reps?
  - Weight increases/decreases?
  - Form score trends?
  - User-reported RPE?
- [ ] LLM prompt to suggest adjustments: progressive overload, deload, exercise swaps
- [ ] API route: `POST /api/plans/adapt` — trigger post-workout plan adaptation

#### 2.4 Quick Workout Generator (Spec Section 2.3)
- [ ] API route: `POST /api/plans/quick` — generate single session
  - Input: available_time, equipment, target_muscles, intensity, style
  - Output: complete workout with exercises, sets, reps, rest
- [ ] Connect frontend `QuickWorkoutPage.jsx` to real endpoint (currently navigates to `/workout/quick`)

#### 2.5 Exercise Substitution Engine (Spec Section 2.4)
- [ ] API route: `POST /api/exercises/{id}/substitute` — get alternatives
  - Input: reason (no equipment, injury, preference), available_equipment
  - Output: list of substitute exercises with explanation
- [ ] Add swap button to `ExerciseCard` component in frontend

#### 2.6 AI Content Recommendations (Spec Section 5.2, 5.3)
- [ ] API route: `GET /api/exercises/{id}/learn-more` — technique deep dive
- [ ] API route: `GET /api/recommendations` — contextual exercise/content recommendations
- [ ] Fitness knowledge base content (Spec Section 5.4) — store as searchable entries in DB

---

## Person 3 — Workout Tracking, Progress Analytics & Gamification

**Focus:** The data pipeline — logging workouts, computing analytics, generating progress insights, and the gamification system.

### Tasks

#### 3.1 Workout Session API (Spec Section 4.1)
- [ ] Pydantic schemas: `StartWorkoutRequest`, `LogSetRequest`, `EndWorkoutRequest`, `WorkoutSessionResponse`
- [ ] API routes:
  - `POST /api/workouts/start` — create a new session (from plan day or quick workout)
  - `POST /api/workouts/{session_id}/sets` — log a completed set (reps, weight, form_score, is_partial)
  - `POST /api/workouts/{session_id}/end` — finalize session, compute summary stats
  - `GET /api/workouts/history` — paginated workout history with filters
  - `GET /api/workouts/{session_id}` — single session detail with all sets
- [ ] Auto-calculate: total volume (sets x reps x weight), avg form score, calories estimate, duration
- [ ] Connect frontend `workoutService.js` to real endpoints
- [ ] Update `workoutStore.js` to POST set data as user completes each set

#### 3.2 Progress Analytics API (Spec Section 4.2)
- [ ] API routes:
  - `GET /api/progress/strength` — weight per exercise over time (for StrengthChart)
  - `GET /api/progress/volume` — weekly volume per muscle group (for VolumeChart)
  - `GET /api/progress/consistency` — heatmap data for StreakCalendar
  - `GET /api/progress/form` — form score trends per exercise
  - `GET /api/progress/records` — personal records with dates
  - `GET /api/progress/weekly-stats` — this week's summary stats (volume, workouts, form avg, time)
  - `GET /api/progress/muscle-balance` — radar chart data (for MuscleGroupRadar)
- [ ] Streak calculation logic with grace period (Spec Section 7.2) — missing 1 day doesn't break streak
- [ ] Connect frontend `progressService.js` and all Progress components to real endpoints

#### 3.3 Body Metrics Tracking (Spec Section 4.4)
- [ ] API routes:
  - `POST /api/metrics` — log weight, body fat, measurements
  - `GET /api/metrics` — metrics timeline with trends
- [ ] Progress photo handling — store locally on device (never on server), metadata only in DB
- [ ] Add Body Metrics UI to the Progress page "Body" tab (currently empty)

#### 3.4 AI Weekly Summary (Spec Section 4.3)
- [ ] Scheduled task (Celery or APScheduler) that runs weekly per user
- [ ] LLM prompt that receives: week's workout data, plan adherence, form scores, volume changes
- [ ] Output: natural language summary (see spec example in Section 4.3)
- [ ] API route: `GET /api/progress/weekly-summary` — latest summary
- [ ] Push notification trigger when summary is ready (Spec Section 9.3)

#### 3.5 Data Export (Spec Section 10.3)
- [ ] API routes:
  - `GET /api/export/csv` — full workout history as CSV
  - `GET /api/export/json` — full workout history as JSON
- [ ] Include: exercises, sets, reps, weights, form scores, dates, session durations

#### 3.6 Gamification System (Spec Section 7)
- [ ] Achievement evaluation engine — check after each workout:
  - Streak milestones (7-day, 30-day) (Spec Section 7.1)
  - First PR, first workout, 100 workouts
  - Perfect form session, tried 10 exercises
  - Completed a full program
- [ ] API routes:
  - `GET /api/achievements` — all achievements with earned status
  - `GET /api/achievements/recent` — newly earned badges
- [ ] Progressive challenges (Spec Section 7.3):
  - Weekly optional challenges generated by AI
  - `GET /api/challenges/current` — this week's challenge
  - `POST /api/challenges/{id}/complete` — mark challenge done
- [ ] Progress milestones with personalized messages (Spec Section 7.4)
- [ ] Connect frontend `AchievementGallery` and `ProfilePage` to real data
- [ ] Add celebration UI for newly earned achievements (toast/modal)

---

## Person 4 — Computer Vision, AI Chat & PWA/Real-Time Features

**Focus:** The differentiating features — real-time pose tracking, AI coaching chat, and production PWA features.

### Tasks

#### 4.1 Computer Vision — Pose Estimation (Spec Section 3.1)
- [ ] Integrate TensorFlow.js with MoveNet or BlazePose model in the browser
- [ ] Implement `CameraView.jsx` (currently a Phase 2 placeholder):
  - Camera access with guided setup ("prop your phone 6-8 feet away")
  - Silhouette overlay for positioning (Spec Section 9.4)
  - Model loading with progress indicator
- [ ] Implement `PoseOverlay.jsx`:
  - Green skeleton overlay = good form
  - Yellow highlights = attention needed
  - Red highlights + text cue = stop and correct
- [ ] Joint angle calculations from keypoints:
  - Knee flexion (squats), elbow angle (curls), hip hinge (deadlifts)
  - Body alignment, range of motion, left/right symmetry

#### 4.2 Computer Vision — Rep Counter & Form Scoring (Spec Section 3.2, 3.3)
- [ ] Implement `RepCounter.jsx`:
  - Track cyclical motion patterns (descent/ascent phases)
  - Distinguish complete vs partial reps
  - Count reps automatically
- [ ] Real-time corrective cues system:
  - "Knees are caving inward — push them out"
  - "Back is rounding — engage your core"
  - "Not hitting full depth — thighs parallel"
  - "Great lockout — full extension!"
- [ ] Post-set summary with coaching tip (Spec Section 3.3):
  - "8 reps completed, 7 good form, 1 partial — maintain depth on last reps"
- [ ] Form score calculation (0-10 scale) based on joint angles and ROM
- [ ] Exercise recognition from movement patterns (Spec Section 3.4) — start with 15-20 exercises
- [ ] Auto-detect set completion and trigger rest timer (Spec Section 3.5)

#### 4.3 AI Coaching Chat (Spec Section 6)
- [ ] System prompt design that includes:
  - User profile, recent workout history, current plan, form score trends
  - Personality: "knowledgeable training partner, not a search engine"
- [ ] API routes:
  - `POST /api/chat/message` — send message, get AI response
  - `GET /api/chat/history` — conversation history
  - `DELETE /api/chat/history` — clear chat
- [ ] Streaming responses via FastAPI `StreamingResponse` for real-time typing feel
- [ ] Update frontend `ChatPage.jsx` to use SSE/streaming instead of simulated delay
- [ ] Connect frontend `chatService.js` to real endpoints
- [ ] Suggestion cards: AI can return structured suggestions (exercise swaps, plan changes) that have action buttons
- [ ] Pre-workout briefing (Spec Section 6.2):
  - `GET /api/chat/briefing/{day_id}` — what today targets, what to focus on, warm-up tips
- [ ] Post-workout analysis (Spec Section 6.3):
  - `POST /api/chat/post-workout/{session_id}` — what went well, form attention areas, comparison to previous sessions

#### 4.4 PWA Production Features (Spec Section 9)
- [ ] Offline mode (Spec Section 9.1):
  - Cache current plan, exercise library, recent workout data via service worker
  - Queue workout logs when offline, sync when back online
  - Background sync API for deferred uploads
- [ ] Smart install prompt (Spec Section 9.2):
  - Show after 2-3 completed workouts, not on first visit
  - Track workout count in localStorage
- [ ] Push notifications (Spec Section 9.3):
  - Workout reminders at user-configured times
  - Rest day suggestions
  - Weekly summary alerts
  - Streak-at-risk warnings
  - PR celebration notifications
  - Backend: integrate with Web Push API (VAPID keys)
  - `POST /api/notifications/subscribe` — save push subscription
  - `POST /api/notifications/send` — trigger notification (internal)
- [ ] Camera optimization for mobile (Spec Section 9.4):
  - Guided setup flow with silhouette overlay
  - TensorFlow.js GPU acceleration settings
  - Landscape mode detection and guidance

#### 4.5 Admin Dashboard (Spec Section 10.4)
- [ ] Set up SQLAdmin for auto-generated CRUD from SQLAlchemy models
- [ ] Or build lightweight admin route at `/admin` in React frontend:
  - Active users count
  - Workout completion rates
  - Most popular exercises
  - Average form scores
  - API usage / LLM costs

---

## Cross-Cutting Concerns (Everyone)

These tasks touch multiple areas — coordinate as a team:

| Task | Owner | Spec Section |
|------|-------|-------------|
| Frontend-backend integration testing | All | — |
| Environment variables & secrets management | Person 1 | 10 |
| CI/CD pipeline (GitHub Actions) | Person 1 | — |
| Exercise video content creation/sourcing | Person 2 | 2.5, 5.1 |
| Workout sharing cards for social media | Person 4 | 8.1 (Future) |
| Unit & integration tests | All | — |
| API documentation (auto-generated via FastAPI) | Person 1 | — |
| Production deployment (Vercel/Railway/Fly.io) | Person 1 | — |

---

## Dependency Order

```
Person 1 (DB + Auth) ──► Everyone else depends on this being done first
     │
     ├── Person 2 (Plans + Exercises) ──► needs DB models + auth
     ├── Person 3 (Tracking + Progress) ──► needs DB models + auth + workout sessions
     └── Person 4 (CV + Chat + PWA) ──► needs auth + chat models, can start CV in parallel
```

**Recommended sprint plan:**
- **Week 1:** Person 1 builds DB + Auth. Others review spec, design their APIs, set up dev environments.
- **Week 2:** Person 1 finishes auth, shares models. Persons 2, 3, 4 start building their API routes.
- **Week 3-4:** Everyone builds their features in parallel, frontend integration begins.
- **Week 5:** Integration testing, bug fixes, polish.
