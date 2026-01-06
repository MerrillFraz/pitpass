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

When running the application locally using `docker-compose`, you need to manually run the database migrations to create the necessary tables. You can do this by running the following command after starting the application:

```sh
docker-compose exec backend npx prisma migrate dev --name init
```

When the application is deployed to the cloud, database migrations are automatically run by the backend container on startup.

## For Developers

For faster iteration during development, you can run the frontend and backend services in development mode using a `docker-compose.override.yml` file. This setup enables hot-reloading for the frontend and automatic restarts for the backend on code changes.

1.  **Create `.env` file for the Backend:**
    The backend service requires an `.env` file for database connection. Create a file named `.env` inside `packages/backend/` with the following content:

    ```
    DATABASE_URL="postgresql://user:password@db:5432/pitpass_db"
    ```
    **Important**: This `.env` file is for local development only and should **NOT** be committed to version control. It is already ignored by `.gitignore`. The generic `user` and `password` credentials used here are specific to your local Docker Compose setup and **do not affect how your application behaves in production environments**. Production deployments typically use secure environment variables or dedicated secret management services for database credentials.

2.  **Create `docker-compose.override.yml`:**
    Place the following content in a file named `docker-compose.override.yml` in the root directory of the project, alongside `docker-compose.yml`:

    ```yaml
    version: '3.8'

    services:
      backend:
        build:
          context: .
          dockerfile: ./packages/backend/Dockerfile
        volumes:
          - ./packages/backend/src:/usr/src/app/packages/backend/src
          - ./packages/backend/package.json:/usr/src/app/packages/backend/package.json
          - ./packages/backend/tsconfig.json:/usr/src/app/packages/backend/tsconfig.json
          - backend_node_modules:/usr/src/app/node_modules # Named volume to persist node_modules
        command: npm run dev -w backend
        environment:
          # Ensure development server binds to 0.0.0.0 inside container
          HOST: 0.0.0.0

      frontend:
        build:
          context: .
          dockerfile: ./packages/frontend/Dockerfile
          target: builder # Use the builder stage for local development
        volumes:
          - ./packages/frontend/src:/usr/src/app/packages/frontend/src
          - ./packages/frontend/public:/usr/src/app/packages/frontend/public
          - ./packages/frontend/index.html:/usr/src/app/packages/frontend/index.html
          - ./packages/frontend/vite.config.ts:/usr/src/app/packages/frontend/vite.config.ts
          - ./packages/frontend/tsconfig.json:/usr/src/app/packages/frontend/tsconfig.json
          - ./packages/frontend/tsconfig.app.json:/usr/src/app/packages/frontend/tsconfig.app.json
          - ./packages/frontend/tsconfig.node.json:/usr/src/app/packages/frontend/tsconfig.node.json
          - ./packages/frontend/package.json:/usr/src/app/packages/frontend/package.json
          - frontend_node_modules:/usr/src/app/node_modules # Named volume to persist node_modules
        command: npm run dev -w frontend -- --host 0.0.0.0
        ports:
          - "5173:5173" # Vite's default dev server port
        environment:
          # Point frontend to local backend for development
          VITE_API_BASE_URL: http://backend:3000

    volumes:
      backend_node_modules:
      frontend_node_modules:
    ```

2.  **Start the local development environment:**
    Ensure you are in the root directory of the project and run the following command. The `--build` flag is important to ensure the new development-oriented commands and volume mounts are applied.

    ```bash
    docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build
    ```
    *(If you are using Docker Compose V2, use `docker compose` instead of `docker-compose`.)*

3.  **Accessing the services:**
    *   **Frontend (with hot-reloading):** `http://localhost:5173`
    *   **Backend (with automatic restarts):** `http://localhost:3000`

    Any changes you make to the source code (e.g., in `packages/frontend/src` or `packages/backend/src`) on your local machine will be reflected in the running Docker containers, providing a fast development loop.

To run the frontend and backend services locally for development, please refer to the README files in their respective packages.

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
