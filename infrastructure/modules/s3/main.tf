resource "aws_s3_bucket" "uploads" {
  bucket = "${var.project_name}-uploads-${var.account_id}"
}

resource "aws_s3_bucket_public_access_block" "uploads_block" {
  bucket = aws_s3_bucket.uploads.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

output "bucket_name" {
  value = aws_s3_bucket.uploads.bucket
}

output "bucket_arn" {
  value = aws_s3_bucket.uploads.arn
}
