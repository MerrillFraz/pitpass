# PitPass — Claude Context

## What Is This?

PitPass is a racing team management app — a one-stop tool for tracking trips, expenses, car maintenance, race results, and team rosters across a racing season. Intended to become a commercial SaaS product with a mobile-first UI and web-based reporting dashboard.

## Monorepo Structure

```
pitpass/
├── packages/
│   ├── backend/          # Node.js + Express + TypeScript API
│   │   ├── prisma/       # Schema, migrations, seed script
│   │   └── src/
│   │       ├── middleware/   # errorHandler, auth, rbac, validate
│   │       ├── routes/       # Express route handlers
│   │       └── schemas/      # Zod validation schemas
│   └── frontend/         # React + Vite + TypeScript SPA
│       └── src/
│           ├── context/      # AuthContext (token, user, login/logout)
│           └── components/   # React components + tests
├── terraform/            # GCE deployment via Terraform
└── .github/workflows/    # CI/CD: test + deploy on push to main
```

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React, Vite, TypeScript, React Router, Bootstrap |
| Backend | Node.js, Express, TypeScript |
| ORM | Prisma (PostgreSQL) |
| Validation | Zod |
| Auth | JWT (`jsonwebtoken`) + bcrypt |
| Testing (FE) | Vitest + @testing-library/react |
| Testing (BE) | Jest + Supertest |
| Infra | Docker Compose (local), GCE + Terraform (prod) |
| CI/CD | GitHub Actions → Google Artifact Registry → GCE |

## Database Schema (Key Models)

- **User** — authenticated user; fields are `firstName`, `lastName`, `email`, `password` (hashed)
- **Team** — a racing team; has Cars and Trips
- **TeamMembership** — joins User ↔ Team with a `Role` enum (OWNER, DRIVER, PIT_BOSS, CREW, GUEST) and an `isPrimary` flag
- **Car** — belongs to a Team; linked to RaceResults
- **Track** — a racing venue; referenced by TripStops
- **Trip** — a racing event container; belongs to User + Team; has Expenses, Notes, TripStops
- **TripStop** — one leg of a Trip pointing to a Track; has RaceResults
- **RaceResult** — tied to a TripStop + Car; stores laps, bestLapTime, position
- **Expense** — tied to a Trip; typed by ExpenseType enum (DIESEL, TOLLS, PIT_PASSES, RACE_GAS, REPAIRS, FOOD_BEVERAGE, OTHER); optionally has a Receipt
- **Note** — tied to a Trip; free-text content + date

## Architecture

All three services run as Docker containers, both locally and in production. nginx inside the frontend container serves the React SPA and reverse-proxies `/api/*` to the backend container. The backend is never directly exposed to the internet.

**Local:** `docker compose up --build` → frontend at `http://localhost:5173`

**Production:** Push to `main` → GitHub Actions builds images → pushes to Google Artifact Registry → Terraform provisions/updates a single GCE VM → VM startup script pulls images and runs `docker-compose up -d`.

The `terraform/` Terraform config is the source of truth for production infra. `JWT_SECRET` is not yet wired into the production Terraform config — needs to be added as a `TF_VAR` secret before auth can work in prod.

## Local Development

`packages/backend/.env` is required (gitignored). It currently contains:
```
DATABASE_URL="postgresql://user:password@db:5432/pitpass_db"
JWT_SECRET="pitpass-local-dev-secret"
```

DB is **wiped and reseeded on every backend container start** via `docker-entrypoint.sh` + `prisma/seed.cjs`. Disable by commenting out `npx prisma db seed` in the entrypoint if you need persistent data.

## Running Tests

```sh
npm test -w packages/backend
npm test -w packages/frontend
```

Tests run automatically in GitHub Actions on every push/PR to `main`.

## API Route Structure

```
/api/auth                                    register, login, logout
/api/teams                                   team CRUD
/api/teams/:teamId/roster                    roster management (not yet implemented)
/api/teams/:teamId/members/:userId           member management (not yet implemented)
/api/trips                                   trip CRUD (auth-protected, user-scoped)
/api/trips/:tripId/stops                     TripStop CRUD
/api/trips/:tripId/expenses                  Expense CRUD
/api/trips/:tripId/notes                     Note CRUD
/api/trips/:tripId/stops/:stopId/results     RaceResult CRUD
```

## Work Tracking

See **[TODO.md](TODO.md)** — it is the single source of truth for the roadmap, milestone status, and tech debt.

**Current status (as of 2026-03-27):** Milestone 2 is complete. Auth, team CRUD, roster management API (`GET/POST/PUT/DELETE /api/teams/:teamId/members`), and team/roster frontend UI are all working end-to-end. All 🔴 critical and 🟡 correctness bugs from the audit are resolved; most 🟢 quality issues are fixed (one Zod dedup item remains). Seeded users: `merrill@vortex.com` / `password` (OWNER) and `driver@vortex.com` / `password` (unassigned). Ready to PR to `main`. See TODO.md for Milestone 3 scope.
