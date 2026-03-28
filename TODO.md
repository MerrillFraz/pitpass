# PitPass Project Roadmap

The goal of PitPass is to be the one-stop place for a racing team or owner to consolidate all of their racing events, expenses, and data to get a big-picture understanding of their racing operations.

## Milestone 1: Core Data Model & API Foundation (Complete)

This milestone focuses on establishing a strong, relational database schema and a clean API structure that can support future growth.

-   [x] **Design Relational Schema:**
    -   [x] Define core models in `schema.prisma`: `Team`, `User`, `TeamMembership`, `Role`, `Car`, `Track`, `Trip`, `TripStop`, `Expense`, `Note`, `RaceResult`.
    -   [x] Establish relationships:
        -   `User` can be in many `Teams` through `TeamMembership`.
        -   `TeamMembership` has one or more `Roles`. One role should be primary.
        -   `Team` has a one-to-many relationship with `Cars`.
        -   `Trip` is composed of one or more `TripStops`. Each `TripStop` points to a `Track`, allowing for multi-leg journeys.
        -   `Trip` has many `Expenses` and `Notes`.
        -   `Car` has related maintenance and setup models.
        -   `RaceResult` is linked to a `TripStop` and a `Car`.
-   [x] **API Refactoring:**
    -   [x] Restructure all Express routes to be RESTful and nested logically (e.g., `/api/trips/:tripId/stops/:stopId/expenses`).
    -   [x] Implement robust input validation (e.g., using `zod`) on all API endpoints.
    -   [x] Create a centralized error-handling middleware.
-   [x] **Configuration Management:**
    -   [x] Externalize all secrets and configuration (database URL, API keys, JWT secret) using environment variables (`.env` file).

## Milestone 2: Team and User Management (Complete)

-   [x] **Authentication:**
    -   [x] Implement JWT-based authentication (`login`, `register`, `logout`). *(backend routes exist)*
    -   [x] Auth middleware (`protect`) securing all data routes.
    -   [x] RBAC middleware (`hasRole`) for owner-only team actions.
    -   [x] **BUG FIXED:** Broken named import in `middleware/auth.ts` (`{ prisma }` → default import).
    -   [x] **BUG FIXED:** `register` route and all test mocks updated to use `firstName`/`lastName` instead of non-existent `name` field.
    -   [x] **BUG FIXED:** Seed user password now hashed with bcrypt. Login with `merrill@vortex.com` / `password` works.
    -   [x] **BUG FIXED:** `JWT_SECRET` added to `packages/backend/.env` for local dev.
    -   [x] **BUG FIXED:** Frontend production build now excludes test files (`tsconfig.app.json`).
    -   [x] Frontend: Build login/register pages and auth context (JWT storage, attach token to all API requests).
    -   [x] Track the `User` making each data entry. *(backend scopes trips to `req.user.id`; frontend now sends JWT on all requests)*
-   [x] **Team Functionality:**
    -   [x] API endpoints for creating and managing a `Team` (CRUD). *(backend complete)*
    -   [x] Frontend: Build team creation/management UI (`TeamsPage` — list, create, delete).
    -   [ ] Implement a system for inviting new `Users` to a `Team`. *(deferred — currently add-by-email requires user to already exist)*
-   [x] **Roles and Rosters:**
    -   [x] Define a default set of `Roles` (OWNER, DRIVER, PIT_BOSS, CREW, GUEST enum in schema).
    -   [x] API endpoints for roster management: `GET/POST /api/teams/:teamId/members`, `PUT/DELETE /api/teams/:teamId/members/:membershipId`.
    -   [x] Frontend UI for viewing and managing the team roster (`TeamRoster` — add by email, change role, remove; primary owner protected).

## Milestone 3: Car, Maintenance, and Performance Tracking (Complete)

-   [x] **Car Management:**
    -   [x] API and UI to add/edit/remove `Cars` associated with a `Team`.
-   [x] **Maintenance Tracking:**
    -   [x] Create models for `MaintenanceEvent` (e.g., oil change, valve spring change, motor refresh).
    -   [x] API and UI to log maintenance events with date and notes.
    -   [x] Track "laps completed under power" for each `RaceResult`.
    -   [x] Develop logic to calculate and display laps on motor/components since the last maintenance event.
-   [x] **Car Setup Metrics:**
    -   [x] Create a `CarSetup` model linked to a `Car` and a `RaceResult`/`TripStop`.
    -   [x] API and UI to record setup details: tire compound/sizes, offset, spring rates, ride heights, shock rates, gear ratio.
    -   [ ] Per-corner data model deferred — see Milestone 4.
-   [x] **Race Results:**
    -   [x] API and UI to log detailed race results:
        -   Hot Laps: laps, time, notes on changes.
        -   Qualifying: laps, time, position, notes on changes.
        -   Heat Race(s): start/end position, laps (support for multiple heats).
        -   Feature Race: laps, best lap, position, notes on damage/behavior.

## Milestone 4: Car Setup & Results Enhancements + Trip Logistics

### Car & Results Improvements (Deferred from M3)

-   [ ] **Car Setup — Per-Corner Data Model:**
    -   [ ] Replace current flat Front/Rear `CarSetup` fields with a normalized `CarCornerSetup` child model (4 rows per setup: LF, RF, LR, RR).
    -   [ ] Per-corner fields: ride height, tire size, tire compound, wheel backspacing/offset, tire pressure (cold/baseline), spring rate, spring length.
    -   [ ] Add `carWeight` (baseline build weight) to `CarSetup`.
    -   [ ] Add `requiredWeight` and `actualWeight` to `RaceResult` (varies by track/scale — "almost light at one track means in danger at another").
    -   [ ] Add per-corner `tirePressureLF/RF/LR/RR` to `RaceResult` for tracking hot pressures mid-session (distinct from cold baseline on setup sheet).
    -   [ ] Update backend routes, Zod schemas, seed data, and frontend form to match new model.
    -   [ ] **Note:** Data model was intentionally kept simple in M3. Schema redesign here is a breaking migration — plan accordingly.
-   [ ] **Race Results — Session Sort Order:**
    -   [ ] Sort results on the TripStopDetail page by session type in race-day order: Hot Laps → Qualifying → Heat Race → Feature.
    -   [ ] Apply consistent sort order on both the frontend display and the backend `GET /results` query.
-   [ ] **App Title:**
    -   [ ] Replace the "Racing Expenses" heading (leftover from early prototype) with "PitPass" or appropriate page-level titles throughout the app.

### Trip & Event Logistics

-   [ ] **Track Management:**
    -   [ ] API and UI for creating and managing a list of `Tracks` including their location.
    -   [ ] Store a "home shop" location for each `Team`.
-   [ ] **Trip Management:**
    -   [ ] Full CRUD API and UI for `Trips`, which are containers for one or more `TripStops`.
    -   [ ] Associate a roster of `TeamMembers` who were on a specific `Trip`.
    -   [ ] Implement logic to calculate trip distance from "home shop" to `Track` (requires maps integration).
-   [ ] **Expense Management:**
    -   [ ] CRUD API and UI for expenses.
    -   [ ] Ability to upload photos of receipts when creating an expense entry.
-   [ ] **Notes and Lists:**
    -   [ ] Use the `Note` model for trip-specific "Repairs Made".
    -   [ ] Create a separate `ShoppingListItem` model and associate it with a `Team` for a persistent shopping list.

## Milestone 5: Advanced Integrations & Reporting

-   [ ] **External API Integrations:**
    -   [ ] Integrate with the **MyRacePass API** to automate fetching race results.
    -   [ ] Integrate with a weather service (e.g., OpenWeatherMap) to fetch and store weather conditions for a `Track` on race day.
    -   [ ] Integrate with a mapping service (e.g., Google Maps API) for distance calculations.
-   [ ] **Reporting Engine:**
    -   [ ] Develop dedicated backend endpoints for data aggregation.
    -   [ ] Simple reports: What tracks has the team been to? When?
    -   [ ] Advanced reports: Correlate car setup, weather, and results.
    -   [ ] Expense reporting by trip, by month, by category.

## Milestone 6: Frontend Implementation

-   [ ] **Mobile App Scaffolding:**
    -   [ ] Create the initial mobile app project (e.g., using React Native or Flutter).
    -   [ ] Establish design system/framework and boilerplate structure.
-   [ ] **Mobile-First Data Entry:**
    -   [ ] Design and build simple, fast UI for entering data on a mobile device (expenses, maintenance, setups, results).
-   [ ] **Web-Based Reporting Dashboard:**
    -   [ ] Design and build a comprehensive dashboard for desktop viewing, focusing on rich data visualization for reports.
    -   [ ] Provide web views for managing team rosters, cars, and the master schedule.

## Milestone 7: Business & Product Strategy

-   [ ] **Go-to-Market Research:**
    -   [ ] Research and document Google Play Store & Apple App Store publishing requirements.
-   [ ] **Financial Planning:**
    -   [ ] Estimate monthly operational costs (GCE, Vercel, API fees, data storage, etc.).
    -   [ ] Develop a subscription-based pricing scheme to ensure profitability.

## Cross-Cutting Concerns

-   [x] **Testing:**
    -   [x] Set up testing frameworks for frontend (Vitest) and backend (Jest).
    -   [x] Integrated into CI/CD pipeline.
    -   [ ] Write unit and integration tests for all new features.
-   [ ] **CI/CD:**
    -   [x] Enhance `deploy.yml` to run tests and linting on every commit.
    -   [ ] Automate database migrations in the deployment process.
    -   [ ] Wire `JWT_SECRET` into production deployment: add as a GitHub Actions secret, pass as `TF_VAR_jwt_secret` in `deploy.yml`, and declare it as a Terraform variable so it reaches the running container as an env var.
    -   [ ] **GCE production deployment blocked:** The target GCE zone has no available VM resources (`ZONE_RESOURCE_POOL_EXHAUSTED`). Production deployment is deferred until capacity is available or a different zone/region is chosen. Running locally only for now.
-   [ ] **Dependency security:** Runtime vulnerabilities (axios, qs) resolved via `npm audit fix`. Remaining ~41 reported vulns are all Prisma CLI tooling or Jest/ESLint devDependencies — none run in production. The Prisma-related highs require a breaking Prisma version bump; address when doing a deliberate Prisma upgrade.
-   [ ] **Rate limiting:** No rate limiter on any API routes (CodeQL alerts #4, #5). Add `express-rate-limit` — strict limiter on `/api/auth` (brute-force risk) and a general limiter on all other routes.
-   [ ] **Pagination:**
    -   [ ] Implement pagination on all API endpoints that return lists.
-   [x] **Date Input Enhancement:** Implement a "today" button or a calendar picker for date input fields to improve user experience and reduce manual typing.

## Tech Debt

Bugs and quality issues discovered during audit (2026-03-26). Items marked 🔴 are breaking the app right now.

### 🔴 Critical Bugs

-   [x] **FIXED: `middleware/auth.ts` broken import** — changed to default import.
-   [x] **FIXED: `auth.ts` register / test mocks `name` field** — aligned to `firstName`/`lastName` throughout.
-   [x] **FIXED: Seed user password** — now hashed with bcrypt.
-   [x] **FIXED: `JWT_SECRET` missing** — added to `packages/backend/.env`.
-   [x] **FIXED: Frontend tsconfig including test files** — excluded via `tsconfig.app.json`.
-   [x] **FIXED: Zod schemas missing `body:` wrapper** — `expenseSchemas.ts`, `noteSchemas.ts`, `tripStopSchemas.ts`, and `raceResultSchemas.ts` now wrap fields in `body: z.object({...})`. Schema tests updated to match.
-   [x] **FIXED: `AddExpenseForm.tsx` wrong API URL** — Changed from `/api/${tripId}/expenses` to `/api/trips/${tripId}/expenses`.
-   [x] **FIXED: `AddNoteForm.tsx` wrong API URL** — Changed from `/api/${tripId}/notes` to `/api/trips/${tripId}/notes`.
-   [x] **FIXED: `AddTripForm.tsx` missing `teamId`** — Form now fetches user's teams on mount and auto-selects (shows dropdown if multiple teams).
-   [x] **FIXED: Date format in forms** — All three forms now send `new Date(date).toISOString()` instead of bare `YYYY-MM-DD`, matching Zod's `.datetime()` validator.

### 🟡 Correctness Issues

-   [x] **FIXED: `res.status(204).json(...)` on DELETE endpoints** — all DELETE handlers in `trips.ts`, `expenses.ts`, `notes.ts`, `tripStops.ts`, `raceResults.ts` now use `res.status(204).end()`.
-   [x] **FIXED: `GET /api/teams/:teamId` returns `null` instead of 404** — now returns 404 when team not found or user not a member.
-   [x] **FIXED: `trips.ts` route handlers missing try/catch** — all five handlers now wrapped; `GET /:id` also returns 404 on null.

### 🟢 Quality / Code Hygiene

-   [x] **FIXED: `TripReport.tsx` debug `console.log` statements** — removed all debug logs; also fixed to use `axios` instead of `fetch` (was causing 401 in production builds).
-   [x] **FIXED: CORS origin hardcoded** — now reads from `CORS_ORIGIN` env var with `localhost:5173` fallback.
-   [x] **FIXED: No `JWT_SECRET` validation on startup** — server now exits with a clear error if `JWT_SECRET` is not set.
-   [ ] **Missing route tests (M2-era):** `expenses.ts`, `notes.ts`, and `roster.ts` have no route-level test files. Low risk since these are simpler routes and the core auth/RBAC patterns are covered elsewhere, but worth closing the gap.
-   [ ] **Duplicate Zod error handling:** `validate.ts` catches `ZodError` and returns a response directly. The `ZodError` branch in `errorHandler.ts` is therefore dead code — `validate` never calls `next(zodError)`. Consider removing it from `errorHandler.ts` or unifying the approach.
-   [x] **FIXED: `window.location.reload()` in form submit handlers** — `AddTripForm.tsx`, `AddExpenseForm.tsx`, and `AddNoteForm.tsx` now call an `onSuccess` callback and reset form state instead of reloading the page.