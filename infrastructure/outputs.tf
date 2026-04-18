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