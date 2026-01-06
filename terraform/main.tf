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

# --- Cloud-init Configuration (User Data) ---

# Use the templatefile function to render the cloud-config.yaml with variables
data "template_file" "cloud_init_config" {
  template = file("${path.module}/cloud-config.yaml")
  vars = {
    github_repo_url = var.github_repo_url
  }
}

# --- Compute Engine Instance (Optimized for 2026) ---

resource "google_compute_instance" "racing_app_vm" {
  project      = var.project_id
  zone         = var.zone
  name         = var.instance_name
  machine_type = var.machine_type
  tags         = ["pitpass-app-vm"]

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
    # 1. Install Docker from official Ubuntu Repos (Standard for 2026)
    apt-get update
    apt-get install -y docker.io docker-buildx-plugin docker-compose-plugin
    
    # 2. Start and enable Docker
    systemctl enable docker
    systemctl start docker

    # 3. Authenticate to your specific us-east1 Registry
    # Use the 'quiet' flag to prevent script hanging
    gcloud auth configure-docker us-east1-docker.pkg.dev --quiet

    # 4. Setup app directory
    mkdir -p /opt/pitpass
    cd /opt/pitpass

    # 5. Create the docker-compose.yml on the VM
    cat <<DOCKER_COMPOSE > docker-compose.yml
    services:
      db:
        image: postgres:15-alpine
        restart: always
        environment:
          POSTGRES_DB: pitpass_db
          POSTGRES_PASSWORD: your_secure_password
        volumes:
          - pitpass_data:/var/lib/postgresql/data

      backend:
        image: us-east1-docker.pkg.dev/${var.project_id}/pitpass-app/backend:latest
        restart: always
        depends_on:
          - db
        environment:
          DB_HOST: db

      frontend:
        image: us-east1-docker.pkg.dev/${var.project_id}/pitpass-app/frontend:latest
        restart: always
        ports:
          - "80:80"
    volumes:
      pitpass_data:
    DOCKER_COMPOSE

    # 6. Launch the app using the modern command
    docker compose up -d
  EOF

  service_account {
    email = "default"
    # This is the exact URL Google needs to authorize the VM
    scopes = ["https://www.googleapis.com/auth/cloud-platform"]
  }

  deletion_protection = false
}

