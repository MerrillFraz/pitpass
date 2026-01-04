# Backend

This is the backend for the PitPass application. It's a Node.js application built with Express and TypeScript, and it uses Prisma as an ORM to interact with the PostgreSQL database.

## API Endpoints

### Trips

-   `GET /api/trips`: Get all trips.
-   `GET /api/trips/:id`: Get a single trip by ID.
-   `POST /api/trips`: Create a new trip.
    -   Body: `{ "name": "string", "date": "DateTime", "location": "string" }`
-   `PUT /api/trips/:id`: Update a trip.
    -   Body: `{ "name": "string", "date": "DateTime", "location": "string" }`
-   `DELETE /api/trips/:id`: Delete a trip.

### Expenses

-   `GET /api/:tripId/expenses`: Get all expenses for a trip.
-   `POST /api/:tripId/expenses`: Create a new expense for a trip.
    -   Body: `{ "type": "ExpenseType", "amount": "float", "date": "DateTime" }`
-   `DELETE /api/expenses/:id`: Delete an expense.

### Notes

-   `GET /api/:tripId/notes`: Get all notes for a trip.
-   `POST /api/:tripId/notes`: Create a new note for a trip.
    -   Body: `{ "content": "string", "date": "DateTime" }`
-   `DELETE /api/notes/:id`: Delete a note.

## Database Schema

The database schema is defined in the `prisma/schema.prisma` file. It consists of the following models:

-   `Trip`
-   `Expense`
-   `Note`
-   `Receipt`

And an `enum` for `ExpenseType`.

## Running Locally

1.  Navigate to the backend package:
    ```sh
    cd packages/backend
    ```
2.  Install dependencies:
    ```sh
    npm install
    ```
3.  Set up the `.env` file with the `DATABASE_URL`.
4.  Run the database migrations:
    ```sh
    npx prisma migrate dev
    ```
5.  Start the development server:
    ```sh
    npm run dev
    ```
    The server will be running on `http://localhost:3000`.
