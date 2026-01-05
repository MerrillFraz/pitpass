terraform {
  backend "gcs" {
    bucket = "your-gcs-bucket-name" # Replace with your actual GCS bucket name
    prefix = "terraform/state"
  }
}

# You will need to create the GCS bucket manually before running 'terraform init':
# gcloud storage buckets create gs://your-gcs-bucket-name --location=us-east1
# Remember to enable versioning on the bucket for state protection.
