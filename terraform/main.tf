# Configure the Google Cloud provider
provider "google" {
  project = var.project_id
  region  = var.region
}

# --- Network Configuration ---

resource "google_compute_network" "vpc_network" {
  name                    = "racing-app-vpc"
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
  target_tags   = ["racing-app-vm"]
  description   = "Allow SSH access to racing-app-vm"
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
  target_tags   = ["racing-app-vm"]
  description   = "Allow HTTP access to racing-app-vm"
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
  target_tags   = ["racing-app-vm"]
  description   = "Allow HTTPS access to racing-app-vm"
}

# --- Cloud-init Configuration (User Data) ---

# Use the templatefile function to render the cloud-config.yaml with variables
data "template_file" "cloud_init_config" {
  template = file("${path.module}/cloud-config.yaml")
  vars = {
    github_repo_url = var.github_repo_url
  }
}

# --- Compute Engine Instance ---

resource "google_compute_instance" "racing_app_vm" {
  project      = var.project_id
  zone         = var.zone
  name         = var.instance_name
  machine_type = var.machine_type # e2-micro for Free Tier
  tags         = ["racing-app-vm"]

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11" # A common, lightweight OS
      size  = 20                       # Default size for e2-micro is 10GB, using 20GB for safety
    }
  }

  network_interface {
    network = google_compute_network.vpc_network.name
    access_config {
      // Ephemeral public IP
    }
  }

  # Apply cloud-init script via user-data
  metadata = {
    user-data = data.template_file.cloud_init_config.rendered
  }

  service_account {
    # Grant minimal permissions required.
    # The default Compute Engine service account usually has 'Editor' or 'Owner' role,
    # which is too broad for production. For this skeleton, we'll use the default,
    # but in a real-world scenario, create a dedicated service account with specific roles.
    # Example roles: roles/logging.logWriter, roles/monitoring.metricWriter
    email  = "default" # This refers to the default Compute Engine service account
    scopes = ["cloud-platform"] # Broad scope for simplicity in a skeleton. Restrict in production.
  }

  # This block ensures that the instance is deleted when `terraform destroy` is run,
  # even if it has a non-empty `gcs_bucket_name` variable defined.
  # Remove or adjust for production environments where you might want disk persistence.
  deletion_protection = false 
  
  # For easy cloning:
  # This entire main.tf, along with variables.tf and outputs.tf,
  # is designed to be self-contained. To clone this environment,
  # simply copy the 'terraform' directory, update the 'project_id',
  # 'gcs_bucket_name', and 'github_repo_url' variables in 'variables.tf'
  # (or override them via tfvars or CLI), and run 'terraform init', 'terraform plan', 'terraform apply'.
  # The cloud-init script will automatically set up the Docker environment
  # and deploy your application from the specified GitHub repository.
}
