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
