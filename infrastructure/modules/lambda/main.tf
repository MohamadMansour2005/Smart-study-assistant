data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = var.lambda_source_dir
  output_path = "${path.root}/build/${var.function_name}.zip"
}

resource "aws_iam_role" "lambda_role" {
  name = "${var.function_name}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "s3_access" {
  count = var.s3_bucket_arn != "" ? 1 : 0

  name = "${var.function_name}-s3-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "s3:PutObject",
          "s3:GetObject"
        ],
        Resource = "${var.s3_bucket_arn}/*"
      }
    ]
  })
}

resource "aws_iam_role_policy" "textract_access" {
  name = "${var.function_name}-textract-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "textract:StartDocumentAnalysis",
          "textract:GetDocumentAnalysis"
        ],
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy" "bedrock_access" {
  name = "${var.function_name}-bedrock-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "bedrock:InvokeModel"
        ],
        Resource = [
          "arn:aws:bedrock:${var.region}::foundation-model/amazon.nova-micro-v1:0"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy" "lambda_invoke_access" {
  count = var.invoke_lambda_name != "" ? 1 : 0

  name = "${var.function_name}-invoke-lambda-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "lambda:InvokeFunction"
        ],
        Resource = "arn:aws:lambda:${var.region}:${data.aws_caller_identity.current.account_id}:function:${var.invoke_lambda_name}"
      }
    ]
  })
}
resource "aws_lambda_function" "this" {
  function_name = var.function_name

  role    = aws_iam_role.lambda_role.arn
  handler = "index.handler"
  runtime = "nodejs16.x"
  timeout = 30

  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  environment {
    variables = merge(
      var.environment_variables,
      var.dynamodb_table_name != "" ? {
        TABLE_NAME = var.dynamodb_table_name
      } : {}
    )
  }
}

data "aws_caller_identity" "current" {}

resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.this.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${var.region}:${data.aws_caller_identity.current.account_id}:*/*/*/*"
}

output "lambda_invoke_arn" {
  value = aws_lambda_function.this.invoke_arn
}

output "lambda_name" {
  value = aws_lambda_function.this.function_name
}
resource "aws_iam_role_policy" "dynamodb_access" {
  count = var.dynamodb_table_arn != "" ? 1 : 0

  name = "${var.function_name}-dynamodb-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:Query"
        ],
        Resource = var.dynamodb_table_arn
      }
    ]
  })
}