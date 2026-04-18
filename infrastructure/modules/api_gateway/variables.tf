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
variable "results_lambda_invoke_arn" {
  description = "Invoke ARN for the get-results lambda"
  type        = string
}
variable "summarize_lambda_invoke_arn" {
  description = "Invoke ARN for the summarize-document lambda"
  type        = string
}