variable "project_name" {
  description = "Project name prefix"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
}

variable "lambda_source_dir" {
  description = "Path to Lambda source code"
  type        = string
}

variable "function_name" {
  description = "Lambda function name"
  type        = string
}

variable "environment_variables" {
  description = "Environment variables for the Lambda"
  type        = map(string)
  default     = {}
}

variable "s3_bucket_arn" {
  description = "Optional S3 bucket ARN for Lambda access"
  type        = string
  default     = ""
}

variable "invoke_lambda_name" {
  description = "Optional Lambda function name this Lambda can invoke"
  type        = string
  default     = ""
}
variable "dynamodb_table_name" {
  description = "DynamoDB table name for document storage"
  type        = string
  default     = ""
}

variable "dynamodb_table_arn" {
  description = "DynamoDB table ARN for document storage"
  type        = string
  default     = ""
}