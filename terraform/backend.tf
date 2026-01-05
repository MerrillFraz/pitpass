terraform {
  backend "gcs" {
    bucket = "pitpass-tf-state" # Replace with your actual GCS bucket name
    prefix = "terraform/state"
  }
}

# You will need to create the GCS bucket manually before running 'terraform init':
# gcloud storage buckets create gs://your-gcs-bucket-name --location=us-east1
# Remember to enable versioning on the bucket for state protection.
