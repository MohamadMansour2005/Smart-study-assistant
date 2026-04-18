
module "lambda" {
  source       = "./modules/lambda"
  project_name = var.project_name
  region       = var.region

  lambda_source_dir = "${path.root}/../backend/lambdas/UploadHandler"
  function_name     = "${var.project_name}-test"

  environment_variables = {}
  s3_bucket_arn         = ""
}
module "api_gateway" {
  source = "./modules/api_gateway"

  project_name              = var.project_name
  region                    = var.region
  lambda_invoke_arn         = module.lambda.lambda_invoke_arn
  upload_lambda_invoke_arn  = module.get_upload_url_lambda.lambda_invoke_arn
  process_lambda_invoke_arn = module.process_document_lambda.lambda_invoke_arn
  results_lambda_invoke_arn = module.get_results_lambda.lambda_invoke_arn
}
data "aws_caller_identity" "current" {}

module "s3" {
  source       = "./modules/s3"
  project_name = var.project_name
  account_id   = data.aws_caller_identity.current.account_id
}
module "get_upload_url_lambda" {
  source       = "./modules/lambda"
  project_name = "${var.project_name}-get-upload-url"
  region       = var.region

  lambda_source_dir = "${path.root}/../backend/lambdas/getUploadUrl"
  function_name     = "${var.project_name}-get-upload-url"

  environment_variables = {
    UPLOADS_BUCKET_NAME = module.s3.bucket_name
  }

  s3_bucket_arn = module.s3.bucket_arn
}
module "process_document_lambda" {
  source       = "./modules/lambda"
  project_name = "${var.project_name}-process-document"
  region       = var.region

  lambda_source_dir = "${path.root}/../backend/lambdas/processDocument"
  function_name     = "${var.project_name}-process-document"

  environment_variables = {}
  s3_bucket_arn         = module.s3.bucket_arn
}
module "get_results_lambda" {
  source       = "./modules/lambda"
  project_name = "${var.project_name}-get-results"
  region       = var.region

  lambda_source_dir = "${path.root}/../backend/lambdas/getResults"
  function_name     = "${var.project_name}-get-results"

  environment_variables = {}
  s3_bucket_arn         = ""
}