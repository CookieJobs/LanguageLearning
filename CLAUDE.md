# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Backend (`backend/`)

```bash
cd backend && npm run dev        # Start dev server on port 5500
cd backend && npm run build      # TypeScript compilation
cd backend && npm run start      # Run compiled JS
cd backend && npm run seed:vocab # Manually seed vocab from data/vocab/words.json
```

### Frontend (`frontend/`)

```bash
cd frontend && npm run dev       # Vite dev server (port ~3000, auto-adjusts)
cd frontend && npm run build     # Production build
cd frontend && npx vitest        # Run tests (LearningSession, MultipleChoiceQuestion)
```

### Docker Compose (root)

```bash
docker-compose up -d             # Start mongo + redis + backend + frontend
```

## Architecture

### Stack

- **Backend**: NestJS (CommonJS) + Mongoose (MongoDB) + Redis
- **Frontend**: React 19 + Vite + Tailwind CSS 3.4 + React Router v6
- **AI**: DeepSeek API (`deepseek-chat` model) for sentence evaluation and story generation

### Backend Project Layout (`backend/src/`)

```
main.ts                         # Bootstrap: /api prefix, CORS, ValidationPipe, port 5500
app.module.ts                   # Root module — imports all 8 feature modules
common/
  jwt.guard.ts                  # Custom JWT guard (extracts Bearer token, attaches req.user)
  admin.guard.ts                # Admin guard + @AdminAuth() composite decorator
modules/
  auth/                         # Register (email+code), login, refresh-token rotation
  learning/                     # Core SRS learning, vocab picking, question generation, DeepSeek
  user/                         # User + UserProfile (education level, textbook preference)
  stats/                        # Streak tracking, daily check-in, activity calendar
  pet/                          # Gamified pet companion (exp/level, hunger, energy)
  wallet/                       # In-app coin economy (earn/spend, transaction history)
  admin/                        # Admin dashboard: user management, leaderboard
  debug/                        # Dev-only: reset progress, tweak pet stats
```

Auth uses raw `jsonwebtoken` and `argon2` — **no Passport.js**. Guards are custom `CanActivate` implementations.

### Frontend Project Layout (`frontend/`)

```
App.tsx                         # React.lazy routes + Shell (header/footer visibility) + context providers
index.tsx                       # ReactDOM entry
types.ts                        # All shared TypeScript types
contexts/
  AppContext.tsx                 # Central state: auth, session, progress, streak
  PetContext.tsx                 # Pet + wallet state
services/
  apiClient.ts                  # fetch wrapper: auto-adds Bearer token, fires session-expired on 401
  geminiService.ts              # All learning/progress/story API calls (misnamed, wraps backend)
  petService.ts / walletService.ts / adminService.ts
router/
  AuthGuard.tsx                 # Redirects to /login if no token
pages/                          # LoginPage, HomePage, LearnPage, ReviewPage, LevelSelectPage, etc.
components/                     # LearningSession, PetDisplay, Auth, Header, DashboardProgress, modals, etc.
```

State management is **Context-only** (no Redux/Zustand). Token and mastered items are persisted to `localStorage`.

### Key Architectural Decisions

- **Dynamic vocab-textbook system**: No static "Lesson 1 / Lesson 2" hardcoded curriculum. Words are tagged with `textbooks[]` and `levels[]`. A learning session dynamically picks words from a textbook/level pool, weighted by user progress and spaced repetition (SRS) stage.
- **Session structure**: Each session is 10 questions — 4 review (old words) + 6 new words. Questions are choice, quiz (fill-blank), or sentence types.
- **Vite dev proxy**: `frontend/vite.config.ts` proxies `/api` → `http://localhost:5500`, so the frontend dev server talks to the backend without CORS issues in development.
- **401 handling**: `apiClient.ts` dispatches a `session-expired` custom DOM event on any 401 response. `AppContext` listens and shows `SessionExpiredModal`. There's also a `force-logout` event for manual logout propagation.
- **Auto-seed on startup**: Backend seeds `data/vocab/words.json` into MongoDB on first run (if vocab collection is empty). Also imports textbooks from XLSX files in a `book/` directory if present.
- **Refresh token rotation**: Refresh tokens are hashed with argon2 before storage. On refresh, the old token is revoked and a new one issued. Logout revokes all tokens for the user.
