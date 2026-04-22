output "api_base_url" {
  value = module.api_gateway.api_url
}

output "test_url" {
  value = module.api_gateway.test_url
}

output "upload_url_endpoint" {
  value = module.api_gateway.upload_url_endpoint
}
output "process_document_url" {
  value = module.api_gateway.process_document_url
}
output "results_url" {
  value = module.api_gateway.results_url
}
output "summarize_url" {
  value = module.api_gateway.summarize_url
}
output "flashcards_url" {
  value = module.api_gateway.flashcards_url
}
output "quiz_url" {
  value = module.api_gateway.quiz_url
}
output "assist_url" {
  value = module.api_gateway.assist_url
}
output "documents_table_name" {
  value = aws_dynamodb_table.documents.name
}