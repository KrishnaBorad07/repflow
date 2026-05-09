# CLAUDE.md — RepFlow Project Guide

## Project Overview
RepFlow is an AI-powered fitness assistant SaaS (PWA). Users get personalized workout plans, real-time form feedback via computer vision, and an AI coaching chat. The frontend is complete with mock data; the backend (FastAPI) is scaffolded but unimplemented.

## Tech Stack
- **Frontend:** React 19 + Vite 8, Tailwind CSS v3 (`darkMode: 'class'`), Zustand, Framer Motion, Recharts, Lucide React, Axios, vite-plugin-pwa
- **Backend (planned):** Python + FastAPI, PostgreSQL, Redis, SQLAlchemy (async) + Alembic, JWT auth, LangChain/LLM SDK
- **CV (planned):** TensorFlow.js (client-side pose estimation)
- **Fonts:** Inter Tight (sans), JetBrains Mono (mono)

## Repository Structure
```
RepFlow/
├── frontend/                   # React PWA (complete)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── common/         # Button, Card, Input, Modal, Badge, Chip, etc.
│   │   │   ├── layout/         # AppLayout, Sidebar, BottomNav, TopBar
│   │   │   ├── onboarding/     # GoalSelector, ExperienceSelector, etc.
│   │   │   ├── workout/        # ExerciseCard, RestTimer, VideoPlayer, WorkoutComplete
│   │   │   ├── plan/           # DayCard, WeeklyView, ExerciseList
│   │   │   ├── progress/       # StatCard, StreakCalendar, StrengthChart, VolumeChart
│   │   │   ├── profile/        # ProfileHeader, AchievementBadge, AchievementGallery
│   │   │   ├── chat/           # ChatBubble, ChatInput, SuggestedPrompts
│   │   │   ├── library/        # ExerciseFilter, ExerciseGrid, BodyMap, ProgressionPath
│   │   │   └── cv/             # CameraView, PoseOverlay, RepCounter (Phase 2 stubs)
│   │   ├── pages/              # 17 page components
│   │   ├── store/              # Zustand: authStore, workoutStore, planStore, profileStore, themeStore
│   │   ├── services/           # Mock API layer (TODO: swap to real endpoints)
│   │   ├── hooks/              # useAuth, useWorkout, useTheme, useMediaQuery, usePoseDetection
│   │   ├── utils/              # constants, formatters, validators, mockData
│   │   ├── styles/globals.css  # Tailwind directives, CSS variables, component classes
│   │   ├── Router.jsx          # React Router v6 with ProtectedRoute/PublicRoute
│   │   └── App.jsx             # BrowserRouter wrapper
│   ├── tailwind.config.js      # v3 config with design system colors
│   └── vite.config.js          # PWA manifest, /api proxy to :8000
├── backend/                    # FastAPI (scaffolded, not implemented)
│   ├── app/
│   │   ├── main.py             # FastAPI app with CORS, health check
│   │   ├── api/                # Route handlers (empty)
│   │   ├── models/             # SQLAlchemy models (empty)
│   │   ├── schemas/            # Pydantic schemas (empty)
│   │   ├── services/           # Business logic (empty)
│   │   └── core/               # Config, auth, dependencies (empty)
│   ├── requirements.txt
│   └── alembic.ini
├── docker-compose.yml          # Postgres + backend + frontend
├── TASKS.md                    # 4-person task breakdown with spec references
└── .gitignore
```

## Commands
```bash
# Frontend dev server
cd frontend && npm run dev        # starts on :5173

# Frontend build
cd frontend && npm run build      # outputs to frontend/dist/

# Frontend lint
cd frontend && npm run lint

# Backend (once implemented)
cd backend && uvicorn app.main:app --reload --port 8000
```

## Design System
- **Dark mode default**, light mode via `.light` class on `<html>`
- **Accent color:** `#C8FF3D` (acid lime) — used for CTAs, active states, highlights
- **Background:** `#0A0B0D` | **Surface:** `#13151A` | **Elevated:** `#1B1E25`
- **Border:** `#262932` (hairline) | **Text:** `#F4F5F7` | **Muted:** `#8B8F9A`
- **Semantic:** good `#7BD88F`, warn `#E8C454`, bad `#E96A6A`, info `#7AA9FF`
- **Border radius:** card `14px`, btn `10px`, pill `999px`
- CSS custom properties defined in `globals.css`, Tailwind tokens in `tailwind.config.js`
- Custom component classes: `.card`, `.chip`, `.chip-active`, `.kicker` (in `@layer components`)

## Architecture Patterns

### Frontend Service Layer
All services in `src/services/` return `Promise.resolve({ data })` with mock data and have `// TODO: Replace with actual API call` comments. The commented-out real API calls use the axios instance from `api.js`. To connect to the real backend, uncomment the API call and remove the mock return.

### State Management (Zustand)
- `authStore` — user, isAuthenticated, login/signup/logout
- `workoutStore` — active workout state machine (exercise index, set index, rest timer, elapsed)
- `planStore` — currentPlan, selectedDay, week navigation
- `profileStore` — profile data, achievements
- `themeStore` — isDark, toggleTheme (manages `<html>` classList)

### Routing
- Public: `/` (landing), `/login`, `/signup`, `/forgot-password`, `/onboarding`
- Protected (inside `AppLayout` with sidebar/bottom nav): `/dashboard`, `/plan`, `/plan/:dayId`, `/progress`, `/library`, `/library/:exerciseId`, `/chat`, `/profile`, `/settings`, `/quick-workout`
- Full-screen (no layout): `/workout/:sessionId`
- `ProtectedRoute` checks `authStore.isAuthenticated`, redirects to `/login`
- `PublicRoute` redirects authenticated users to `/dashboard`

### Layout
- **Desktop (>=1024px):** 240px Sidebar + scrollable content area
- **Mobile:** TopBar + content + fixed BottomNav (84px bottom padding)
- `AppLayout` uses `useMediaQuery('(min-width: 1024px)')` to switch
- `ActiveWorkoutPage` is immersive — renders outside `AppLayout`

## Key Conventions
- All pages use `lg:mx-auto` with max-width constraints to center content on desktop
- Framer Motion `AnimatePresence` wraps route transitions in `AppLayout`
- `Button` component has 4 variants: primary, secondary, ghost, danger — with `whileTap` animation
- Icons use Lucide React exclusively (no custom icon set)
- Font sizes: headings `text-2xl`–`text-[32px]`, body `text-sm` (14px), labels `text-xs` (12px), kickers `11px`
- Monospace (`font-mono`) for numbers, stats, timers
- Mock data in `mockData.js` has 22 exercises, 7-day plan, 10 workout history entries, 9 achievements, 5 chat messages

## Backend API Contract (Planned)
The frontend services define the expected API shape:
```
POST   /api/auth/signup          → { token, user }
POST   /api/auth/login           → { token, user }
GET    /api/auth/me              → { user }
GET    /api/plans/current        → { plan with days and exercises }
POST   /api/plans/generate       → { plan }
POST   /api/plans/quick          → { workout }
GET    /api/exercises             → { exercises[] } (filterable)
GET    /api/exercises/:id         → { exercise }
POST   /api/workouts/start       → { sessionId }
POST   /api/workouts/:id/sets    → { success }
POST   /api/workouts/:id/end     → { summary stats }
GET    /api/workouts/history      → { sessions[] }
GET    /api/progress/weekly-stats → { volume, workouts, formAvg, time }
POST   /api/chat/message          → { response } (or SSE stream)
GET    /api/chat/history          → { messages[] }
GET    /api/users/profile         → { user with preferences }
PUT    /api/users/profile         → { updated user }
```

## Common Pitfalls
- Tailwind is v3 (JS config), NOT v4 (CSS config) — do not use `@theme` or CSS-based config
- `globals.css` must have `@import` before `@tailwind` directives (CSS spec requirement)
- The Vite proxy forwards `/api` → `localhost:8000` — backend must run on port 8000
- `authStore` starts with `isAuthenticated: true` and `mockUser` for dev — set to `false` for real auth
- CV components (`CameraView`, `PoseOverlay`, `RepCounter`) are placeholder stubs returning empty divs
- `workoutStore` has timer logic via `useEffect` in `useWorkout` hook — not in the store itself
