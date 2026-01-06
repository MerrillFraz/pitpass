# Configure the Google Cloud provider
provider "google" {
  project = var.project_id
  region  = var.region
}

# --- Network Configuration ---

resource "google_compute_network" "vpc_network" {
  name                    = "pitpass-app-vpc"
  auto_create_subnetworks = true # Creates a default subnet in each region
  description             = "VPC network for the Racing Expenses Application"
}

# Firewall rule to allow SSH (port 22)
resource "google_compute_firewall" "allow_ssh" {
  name    = "allow-ssh"
  network = google_compute_network.vpc_network.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }
  source_ranges = ["0.0.0.0/0"] # WARNING: Allows SSH from anywhere. Restrict in production.
  target_tags   = ["pitpass-app-vm"]
  description   = "Allow SSH access to pitpass-app-vm"
}

# Firewall rule to allow HTTP (port 80)
resource "google_compute_firewall" "allow_http" {
  name    = "allow-http"
  network = google_compute_network.vpc_network.name

  allow {
    protocol = "tcp"
    ports    = ["80"]
  }
  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["pitpass-app-vm"]
  description   = "Allow HTTP access to pitpass-app-vm"
}

# Firewall rule to allow HTTPS (port 443)
resource "google_compute_firewall" "allow_https" {
  name    = "allow-https"
  network = google_compute_network.vpc_network.name

  allow {
    protocol = "tcp"
    ports    = ["443"]
  }
  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["pitpass-app-vm"]
  description   = "Allow HTTPS access to pitpass-app-vm"
}

# --- Compute Engine Instance (Optimized for 2026) ---

resource "google_compute_instance" "racing_app_vm" {
  project                   = var.project_id
  zone                      = var.zone
  name                      = var.instance_name
  machine_type              = var.machine_type
  tags                      = ["pitpass-app-vm"]
  allow_stopping_for_update = true

  boot_disk {
    initialize_params {
      # Updated to Ubuntu 24.04 LTS (Noble Numbat)
      image = "ubuntu-os-cloud/ubuntu-2404-lts-amd64"
      size  = 20 # 20GB is well within the 30GB Free Tier limit
    }
  }

  network_interface {
    network = google_compute_network.vpc_network.name
    access_config {
      // Ephemeral public IP
    }
  }

  # Using metadata_startup_script for the most reliable bootstrap on GCP
  metadata_startup_script = <<-EOF
    #!/bin/bash
    # 1. REMOVE THE BROKEN FILE FROM PREVIOUS ATTEMPTS
    rm -f /etc/apt/sources.list.d/docker.list

    # 2. Install Docker from standard Ubuntu repos
    apt-get update
    # In Ubuntu 24.04, these are the correct package names
    apt-get install -y docker.io docker-compose
    
    # 3. Start and enable Docker
    systemctl enable docker
    systemctl start docker

    # 4. Authenticate to your registry
    gcloud auth configure-docker us-east1-docker.pkg.dev --quiet

    # 5. Setup app directory
    mkdir -p /opt/pitpass
    cd /opt/pitpass

    # 6. Create the docker-compose.yml
    cat <<DOCKER_COMPOSE > docker-compose.yml
    services:
      db:
        image: postgres:15-alpine
        restart: always
        environment:
          POSTGRES_DB: pitpass_db
          POSTGRES_USER: ${var.db_user}
          POSTGRES_PASSWORD: ${var.db_password}
        volumes:
          - pitpass_data:/var/lib/postgresql/data

      backend:
        image: us-east1-docker.pkg.dev/${var.project_id}/pitpass-app/backend:latest
        restart: always
        depends_on:
          - db
        environment:
          DATABASE_URL: "postgresql://${var.db_user}:${var.db_password}@db:5432/pitpass_db"

      frontend:
        image: us-east1-docker.pkg.dev/${var.project_id}/pitpass-app/frontend:latest
        restart: always
        ports:
          - "80:80"
    volumes:
      pitpass_data:
    DOCKER_COMPOSE

    # 7. Launch the app (Using the standard command for this package)
    docker-compose up -d
  EOF

  service_account {
    email = "default"
    # This is the exact URL Google needs to authorize the VM
    scopes = ["https://www.googleapis.com/auth/cloud-platform"]
  }

  deletion_protection = false
}

