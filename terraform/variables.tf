variable "project_id" {
  description = "The GCP project ID."
  type        = string
  default     = "clean-sylph-483415-q7"
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
  default     = "pitpass-app-vm"
}

variable "machine_type" {
  description = "Machine type for the GCE instance."
  type        = string
  default     = "e2-micro" # Specified in requirements for Free Tier
}

variable "gcs_bucket_name" {
  description = "Name of the GCS bucket for Terraform state."
  type        = string
  default     = "pitpass-tf-state"
  # IMPORTANT: This must be globally unique. Choose a unique name before running `terraform init`.
  # Example: "pitpass-app-tfstate-youruniqueid"
}

variable "github_repo_url" {
  description = "URL of the GitHub repository to clone and run docker compose from."
  type        = string
  # Update this with the actual URL of your application's repository.
  default = "https://github.com/MerrillFraz/pitpass"
}

variable "database_url" {
  description = "The connection string for the database."
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "The password for the database."
  type        = string
  sensitive   = true
}

variable "db_user" {
  description = "The username for the database."
  type        = string
  sensitive   = true
}