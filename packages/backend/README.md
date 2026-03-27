# Backend

Node.js + Express + TypeScript API for PitPass. Uses Prisma (PostgreSQL) for persistence, JWT for auth, and Zod for request validation.

## API Endpoints

All data routes require `Authorization: Bearer <token>`.

### Auth

- `POST /api/auth/register` — `{ firstName, lastName, email, password }`
- `POST /api/auth/login` — `{ email, password }` → `{ token, user }`
- `POST /api/auth/logout`

### Teams

- `GET /api/teams` — all teams for the authenticated user
- `POST /api/teams` — `{ name }`
- `GET /api/teams/:teamId`
- `PUT /api/teams/:teamId` — `{ name }` *(OWNER only)*
- `DELETE /api/teams/:teamId` *(OWNER only)*

### Roster

- `GET /api/teams/:teamId/members`
- `POST /api/teams/:teamId/members` — `{ email, role }` *(OWNER only)*
- `PUT /api/teams/:teamId/members/:membershipId` — `{ role }` *(OWNER only)*
- `DELETE /api/teams/:teamId/members/:membershipId` *(OWNER only)*

### Trips

- `GET /api/trips`
- `GET /api/trips/:id`
- `POST /api/trips` — `{ name, date, location, teamId }`
- `PUT /api/trips/:id`
- `DELETE /api/trips/:id`

### Nested Trip Resources

- `GET|POST /api/trips/:tripId/expenses`
- `PUT|DELETE /api/trips/:tripId/expenses/:id`
- `GET|POST /api/trips/:tripId/notes`
- `PUT|DELETE /api/trips/:tripId/notes/:id`
- `GET|POST /api/trips/:tripId/stops`
- `PUT|DELETE /api/trips/:tripId/stops/:id`
- `GET|POST /api/trips/:tripId/stops/:stopId/results`
- `PUT|DELETE /api/trips/:tripId/stops/:stopId/results/:id`

## Running Locally

The recommended way is via Docker Compose from the repo root:

```sh
docker compose up --build
```

This starts the DB, backend, and frontend together. The DB is wiped and reseeded on every backend container start. Seed credentials: `merrill@vortex.com` / `password`.

To run the backend in isolation, create `packages/backend/.env`:

```
DATABASE_URL="postgresql://user:password@localhost:5432/pitpass_db"
JWT_SECRET="your-secret-here"
CORS_ORIGIN="http://localhost:5173"
```

Then:

```sh
npm install
npx prisma migrate dev
npm run dev
```

## Testing

```sh
npm test -w packages/backend
```
