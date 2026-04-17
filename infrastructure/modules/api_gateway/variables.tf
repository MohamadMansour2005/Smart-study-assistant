variable "project_name" {
  description = "Project name"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
}

variable "lambda_invoke_arn" {
  description = "Invoke ARN for the test lambda"
  type        = string
}

variable "upload_lambda_invoke_arn" {
  description = "Invoke ARN for the upload-url lambda"
  type        = string
}
variable "process_lambda_invoke_arn" {
  description = "Invoke ARN for the process-document lambda"
  type        = string
}