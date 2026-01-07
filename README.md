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

This project uses Docker and Docker Compose to create a consistent, one-step process for building and running the entire application.

### Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Running the Application

1.  **Clone the repository.**

2.  **Create the Backend Environment File:**
    The backend service requires an `.env` file for the database connection. Create a file named `.env` inside the `packages/backend/` directory with the following content:
    ```env
    DATABASE_URL="postgresql://user:password@db:5432/pitpass_db"
    ```
    > **Note:** This `.env` file is for local development only and is already in `.gitignore`. The credentials here are for the local Docker database and do not affect production.

3.  **Build and Start the Application:**
    Navigate to the project's root directory and run the following command:
    ```sh
    docker compose up --build
    ```
    This single command will:
    - Build the Docker images for the frontend and backend.
    - Start all services (`frontend`, `backend`, `db`).
    - Automatically run database migrations.
    - **Automatically seed the database with fresh, fake data every time it starts.**

4.  **Access the Application:**
    Once all the services are running, you can access the web interface at:
    [http://localhost:5173](http://localhost:5173)

### Database Seeding

For a consistent development experience, the database is automatically cleared and re-seeded with fake data every time the `backend` container starts. This is handled by the `packages/backend/prisma/seed.cjs` script.

If you wish to work with persistent data that does not get reset on startup, you can disable this feature by commenting out the `npx prisma db seed` command in the `packages/backend/docker-entrypoint.sh` file.

## Infrastructure and Deployment

The PitPass application is deployed to a single Google Compute Engine (GCE) virtual machine using a CI/CD pipeline in GitHub Actions.

### CI/CD Pipeline

The deployment process is defined in the `.github/workflows/deploy.yml` file. It is triggered on every push to the `main` branch and consists of the following steps:

1.  **Authenticate with Google Cloud**: The workflow authenticates with Google Cloud using a service account.
2.  **Build and Push Docker Images**: The workflow builds the Docker images for the frontend and backend applications and pushes them to the Google Artifact Registry.
3.  **Deploy with Terraform**: The workflow uses Terraform to provision the GCE VM and deploy the application.

### Infrastructure

The infrastructure is defined in the `terraform` directory. The `terraform/main.tf` file is the main entry point for the Terraform configuration. It provisions a single GCE VM and uses a startup script to:

1.  Install Docker and Docker Compose.
2.  Create a `docker-compose.yml` file on the VM.
3.  Pull the latest Docker images from the Google Artifact Registry.
4.  Start the application using `docker-compose up -d`.

The backend container is configured to automatically run database migrations on startup using the `packages/backend/docker-entrypoint.sh` script.

**Note**: The `terraform/cloud-config.yaml` file is obsolete and does not reflect the actual deployment method. The `metadata_startup_script` in the `terraform/main.tf` file is the source of truth for the deployment.
