output "instance_external_ip" {
  description = "The external IP address of the GCE instance."
  value       = google_compute_instance.racing_app_vm.network_interface[0].access_config[0].nat_ip
}

# Explanation for cloning:
# To create an identical environment in a different GCP project or region,
# simply copy the entire 'terraform' directory to your new location.
# Then, update the following in 'terraform/variables.tf' (or use a .tfvars file or CLI arguments):
# - `project_id`: To the new GCP project ID.
# - `gcs_bucket_name`: To a new, globally unique GCS bucket name for state storage.
# - `github_repo_url`: (if your repository changes)
# After updating, run `terraform init`, `terraform plan`, and `terraform apply`
# from within the copied 'terraform' directory.
# The cloud-init script will automatically provision Docker, Docker Compose,
# clone your specified repository, and start your application containers.
