
module "lambda" {
  source = "./modules/lambda"

  project_name = var.project_name
  region       = var.region  
  
}

module "api_gateway" {
  source = "./modules/api_gateway"

  project_name       = var.project_name
  region             = var.region
  lambda_invoke_arn  = module.lambda.lambda_invoke_arn
}
