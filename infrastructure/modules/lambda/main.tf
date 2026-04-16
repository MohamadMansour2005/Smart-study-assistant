
locals {
 lambda_zip_path = "${path.root}/../backend/lambdas/uploadHandler/lambda.zip"
}

resource "aws_lambda_function" "api_test" {
  function_name = "${var.project_name}-test"

  role    = aws_iam_role.lambda_role.arn
  handler = "index.handler"
  runtime = "nodejs18.x"

  filename         = local.lambda_zip_path
source_code_hash = filebase64sha256(local.lambda_zip_path)
}
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}
data "aws_caller_identity" "current" {}
resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api_test.function_name
  principal     = "apigateway.amazonaws.com"

  # IMPORTANT: allows API Gateway to call Lambda
source_arn = "arn:aws:execute-api:${var.region}:${data.aws_caller_identity.current.account_id}:*/*/*/*"
}
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

output "lambda_invoke_arn" {
  value = aws_lambda_function.api_test.invoke_arn
}

output "lambda_name" {
  value = aws_lambda_function.api_test.function_name
}
