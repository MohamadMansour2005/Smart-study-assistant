resource "aws_api_gateway_rest_api" "api" {
  name = "${var.project_name}-api"
}

# ----------------------
# /test
# ----------------------
resource "aws_api_gateway_resource" "test" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "test"
}

resource "aws_api_gateway_method" "test_get" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.test.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "test_lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.test.id
  http_method = aws_api_gateway_method.test_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"

  uri = var.lambda_invoke_arn
}

# ----------------------
# /upload-url
# ----------------------
resource "aws_api_gateway_resource" "upload_url" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "upload-url"
}

resource "aws_api_gateway_method" "upload_url_get" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.upload_url.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "upload_lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.upload_url.id
  http_method = aws_api_gateway_method.upload_url_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"

  uri = var.upload_lambda_invoke_arn
}

# ----------------------
# /process-document
# ----------------------
resource "aws_api_gateway_resource" "process_document" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "process-document"
}

resource "aws_api_gateway_method" "process_document_post" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.process_document.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "process_lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.process_document.id
  http_method = aws_api_gateway_method.process_document_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"

  uri = var.process_lambda_invoke_arn
}

resource "aws_api_gateway_deployment" "deploy" {
  depends_on = [
    aws_api_gateway_integration.test_lambda_integration,
    aws_api_gateway_integration.upload_lambda_integration,
    aws_api_gateway_integration.process_lambda_integration
  ]

  rest_api_id = aws_api_gateway_rest_api.api.id

  triggers = {
    redeployment = sha1(jsonencode({
      test_resource_id       = aws_api_gateway_resource.test.id
      test_method_id         = aws_api_gateway_method.test_get.id
      test_integration_id    = aws_api_gateway_integration.test_lambda_integration.id
      upload_resource_id     = aws_api_gateway_resource.upload_url.id
      upload_method_id       = aws_api_gateway_method.upload_url_get.id
      upload_integration_id  = aws_api_gateway_integration.upload_lambda_integration.id
      process_resource_id    = aws_api_gateway_resource.process_document.id
      process_method_id      = aws_api_gateway_method.process_document_post.id
      process_integration_id = aws_api_gateway_integration.process_lambda_integration.id
    }))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "dev" {
  stage_name    = "dev"
  rest_api_id   = aws_api_gateway_rest_api.api.id
  deployment_id = aws_api_gateway_deployment.deploy.id
}

output "api_url" {
  value = "https://${aws_api_gateway_rest_api.api.id}.execute-api.${var.region}.amazonaws.com/dev"
}

output "test_url" {
  value = "https://${aws_api_gateway_rest_api.api.id}.execute-api.${var.region}.amazonaws.com/dev/test"
}

output "upload_url_endpoint" {
  value = "https://${aws_api_gateway_rest_api.api.id}.execute-api.${var.region}.amazonaws.com/dev/upload-url"
}

output "process_document_url" {
  value = "https://${aws_api_gateway_rest_api.api.id}.execute-api.${var.region}.amazonaws.com/dev/process-document"
}