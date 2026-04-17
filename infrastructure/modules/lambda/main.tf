data "archive_file" "upload_handler_zip" {
  type        = "zip"
  source_dir  = "${path.root}/../backend/lambdas/UploadHandler"
  output_path = "${path.root}/build/upload-handler.zip"
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

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "api_test" {
  function_name = "${var.project_name}-test"

  role    = aws_iam_role.lambda_role.arn
  handler = "index.handler"
  runtime = "nodejs18.x"

  filename         = data.archive_file.upload_handler_zip.output_path
  source_code_hash = data.archive_file.upload_handler_zip.output_base64sha256
}

data "aws_caller_identity" "current" {}

resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api_test.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${var.region}:${data.aws_caller_identity.current.account_id}:*/*/*/*"
}

output "lambda_invoke_arn" {
  value = aws_lambda_function.api_test.invoke_arn
}

output "lambda_name" {
  value = aws_lambda_function.api_test.function_name
}