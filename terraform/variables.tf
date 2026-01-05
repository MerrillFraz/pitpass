variable "project_id" {
  description = "The GCP project ID."
  type        = string
}

variable "region" {
  description = "The GCP region for resources."
  type        = string
  default     = "us-east1" # Specified in requirements
}

variable "zone" {
  description = "The GCP zone for the Compute Engine instance."
  type        = string
  default     = "us-east1-b" # A default zone within us-east1
}

variable "instance_name" {
  description = "Name for the GCE instance."
  type        = string
  default     = "racing-app-vm"
}

variable "machine_type" {
  description = "Machine type for the GCE instance."
  type        = string
  default     = "e2-micro" # Specified in requirements for Free Tier
}

variable "gcs_bucket_name" {
  description = "Name of the GCS bucket for Terraform state."
  type        = string
  # IMPORTANT: This must be globally unique. Choose a unique name before running `terraform init`.
  # Example: "racing-app-tfstate-youruniqueid"
}

variable "github_repo_url" {
  description = "URL of the GitHub repository to clone and run docker compose from."
  type        = string
  # Update this with the actual URL of your application's repository.
  default     = "https://github.com/your-username/racing-expenses-app.git" 
}
