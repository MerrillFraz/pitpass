# Frontend

This is the frontend for the PitPass application. It's a React application built with Vite and TypeScript. It uses React Router for navigation and Bootstrap for styling.

## UI Components

The application is built using a component-based architecture. The main components are:

-   `TripList`: Displays a list of all trips and includes a form to add new trips.
-   `TripDetails`: Displays the details of a single trip, including its expenses and notes.
-   `AddTripForm`: A form to add a new trip.
-   `AddExpenseForm`: A form to add a new expense to a trip.
-   `AddNoteForm`: A form to add a new note to a trip.

## Available Routes

The application has the following routes:

-   `/`: The home page, which displays the `TripList` component.
-   `/trip/:id`: The trip details page, which displays the `TripDetails` component.

## Running Locally

1.  Navigate to the frontend package:
    ```sh
    cd packages/frontend
    ```
2.  Install dependencies:
    ```sh
    npm install
    ```
3.  Start the development server:
    ```sh
    npm run dev
    ```
    The server will be running on `http://localhost:5173` (or another port if 5173 is in use).

The frontend is configured to proxy API requests to the backend server running on `http://localhost:3000`.