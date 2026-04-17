variable "project_name" {
  description = "Project name"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
}

variable "lambda_source_dir" {
  description = "Path to lambda source directory"
  type        = string
}

variable "function_name" {
  description = "Lambda function name"
  type        = string
}

variable "environment_variables" {
  description = "Lambda environment variables"
  type        = map(string)
  default     = {}
}

variable "s3_bucket_arn" {
  description = "Optional S3 bucket ARN for lambda access"
  type        = string
  default     = ""
}