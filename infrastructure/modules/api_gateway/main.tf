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
    aws_api_gateway_integration.process_lambda_integration,
    aws_api_gateway_integration.results_lambda_integration,
    aws_api_gateway_integration.summarize_lambda_integration,
    aws_api_gateway_integration.flashcards_lambda_integration,
    aws_api_gateway_integration.quiz_lambda_integration,
    aws_api_gateway_integration.assist_lambda_integration
  ]
  rest_api_id = aws_api_gateway_rest_api.api.id

  triggers = {
    redeployment = sha1(jsonencode({
      test_resource_id          = aws_api_gateway_resource.test.id
      test_method_id            = aws_api_gateway_method.test_get.id
      test_integration_id       = aws_api_gateway_integration.test_lambda_integration.id
      upload_resource_id        = aws_api_gateway_resource.upload_url.id
      upload_method_id          = aws_api_gateway_method.upload_url_get.id
      upload_integration_id     = aws_api_gateway_integration.upload_lambda_integration.id
      process_resource_id       = aws_api_gateway_resource.process_document.id
      process_method_id         = aws_api_gateway_method.process_document_post.id
      process_integration_id    = aws_api_gateway_integration.process_lambda_integration.id
      results_resource_id       = aws_api_gateway_resource.results.id
      results_method_id         = aws_api_gateway_method.results_get.id
      results_integration_id    = aws_api_gateway_integration.results_lambda_integration.id
      summarize_resource_id     = aws_api_gateway_resource.summarize.id
      summarize_method_id       = aws_api_gateway_method.summarize_post.id
      summarize_integration_id  = aws_api_gateway_integration.summarize_lambda_integration.id
      flashcards_resource_id    = aws_api_gateway_resource.flashcards.id
      flashcards_method_id      = aws_api_gateway_method.flashcards_post.id
      flashcards_integration_id = aws_api_gateway_integration.flashcards_lambda_integration.id
      quiz_resource_id          = aws_api_gateway_resource.quiz.id
      quiz_method_id            = aws_api_gateway_method.quiz_post.id
      quiz_integration_id       = aws_api_gateway_integration.quiz_lambda_integration.id
      assist_resource_id        = aws_api_gateway_resource.assist.id
      assist_method_id          = aws_api_gateway_method.assist_post.id
      assist_integration_id     = aws_api_gateway_integration.assist_lambda_integration.id
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
# ----------------------
# /results
# ----------------------
resource "aws_api_gateway_resource" "results" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "results"
}

resource "aws_api_gateway_method" "results_get" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.results.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "results_lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.results.id
  http_method = aws_api_gateway_method.results_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"

  uri = var.results_lambda_invoke_arn
}
output "results_url" {
  value = "https://${aws_api_gateway_rest_api.api.id}.execute-api.${var.region}.amazonaws.com/dev/results"
}
# ----------------------
# /summarize
# ----------------------
resource "aws_api_gateway_resource" "summarize" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "summarize"
}

resource "aws_api_gateway_method" "summarize_post" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.summarize.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "summarize_lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.summarize.id
  http_method = aws_api_gateway_method.summarize_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"

  uri = var.summarize_lambda_invoke_arn
}
output "summarize_url" {
  value = "https://${aws_api_gateway_rest_api.api.id}.execute-api.${var.region}.amazonaws.com/dev/summarize"
}
# ----------------------
# /flashcards
# ----------------------
resource "aws_api_gateway_resource" "flashcards" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "flashcards"
}

resource "aws_api_gateway_method" "flashcards_post" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.flashcards.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "flashcards_lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.flashcards.id
  http_method = aws_api_gateway_method.flashcards_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"

  uri = var.flashcards_lambda_invoke_arn
}
output "flashcards_url" {
  value = "https://${aws_api_gateway_rest_api.api.id}.execute-api.${var.region}.amazonaws.com/dev/flashcards"
}
# ----------------------
# /quiz
# ----------------------
resource "aws_api_gateway_resource" "quiz" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "quiz"
}

resource "aws_api_gateway_method" "quiz_post" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.quiz.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "quiz_lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.quiz.id
  http_method = aws_api_gateway_method.quiz_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"

  uri = var.quiz_lambda_invoke_arn
}
output "quiz_url" {
  value = "https://${aws_api_gateway_rest_api.api.id}.execute-api.${var.region}.amazonaws.com/dev/quiz"
}
# ----------------------
# /assist
# ----------------------
resource "aws_api_gateway_resource" "assist" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "assist"
}

resource "aws_api_gateway_method" "assist_post" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.assist.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "assist_lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.assist.id
  http_method = aws_api_gateway_method.assist_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"

  uri = var.assist_lambda_invoke_arn
}
output "assist_url" {
  value = "https://${aws_api_gateway_rest_api.api.id}.execute-api.${var.region}.amazonaws.com/dev/assist"
}