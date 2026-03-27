# Frontend

React + Vite + TypeScript SPA for PitPass. Uses React Router for navigation, Bootstrap for styling, and axios for API requests (JWT attached globally via `AuthContext`).

## Components

| Component | Description |
|---|---|
| `LoginPage` | Login / register toggle |
| `ProtectedRoute` | Redirects to `/login` if not authenticated |
| `TripList` | Lists all trips; includes `AddTripForm` |
| `TripDetails` | Single trip view with expenses and notes |
| `TripReport` | Aggregate report across all trips |
| `AddTripForm` | Create a trip |
| `AddExpenseForm` | Add an expense to a trip |
| `AddNoteForm` | Add a note to a trip |
| `TeamsPage` | List, create, and delete teams |
| `TeamRoster` | View and manage team members (add by email, change role, remove) |

## Routes

| Path | Component |
|---|---|
| `/login` | `LoginPage` |
| `/` | `TripList` |
| `/trip/:id` | `TripDetails` |
| `/reports` | `TripReport` |
| `/teams` | `TeamsPage` |
| `/teams/:teamId/roster` | `TeamRoster` |

## Running Locally

The recommended way is via Docker Compose from the repo root:

```sh
docker compose up --build
```

Frontend is served at `http://localhost:5173`. The nginx container reverse-proxies `/api/*` to the backend.

To run standalone (requires a running backend at port 3000):

```sh
npm install
npm run dev -w packages/frontend
```

## Testing

```sh
npm test -w packages/frontend
```
