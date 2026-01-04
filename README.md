# PitPass

The PitPass application is designed to help a race team track their expenses throughout a racing season. It allows logging trips, various types of expenses, notes, and receipts.

## Architecture

The application is built using a monorepo architecture, containing a React frontend and a Node.js backend. The entire application is containerized using Docker for easy deployment and development.

- **Frontend**: A React application built with Vite and TypeScript. It uses React Router for navigation and Bootstrap for styling.
- **Backend**: A Node.js application built with Express and TypeScript. It uses Prisma as an ORM to interact with the PostgreSQL database.
- **Database**: A PostgreSQL database to store all the application data.

For more detailed information, please refer to the specific README files for each package:

- [Frontend README](./packages/frontend/README.md)
- [Backend README](./packages/backend/README.md)

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Running the Application

1.  Clone the repository:
    ```sh
    git clone <repository-url>
    ```
2.  Navigate to the project directory:
    ```sh
    cd pitpass
    ```
3.  Start the application using Docker Compose:
    ```sh
    docker-compose up -d
    ```
    This will start the following services:
    -   **frontend**: on port `8080`
    -   **backend**: on port `3000`
    -   **db**: a PostgreSQL database

4.  Access the application by navigating to `http://localhost:8080` in your web browser.

### Database Migration

To create the necessary tables in the database, run the following command after starting the application:

```sh
docker-compose exec backend npx prisma migrate dev --name init
```

## For Developers

To run the frontend and backend services locally for development, please refer to the README files in their respective packages.
