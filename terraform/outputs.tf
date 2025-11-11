output "backend_url" {
  value = render_web_service.backend.deploy_url
}

output "frontend_project_name" {
  value = vercel_project.frontend.name
}
