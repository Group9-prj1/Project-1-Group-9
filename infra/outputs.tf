# URL công khai của Frontend (Vercel)
output "frontend_url" {
  description = "URL triển khai của Frontend (Vercel)."
  value       = vercel_project.frontend.link 
}

# URL công khai của Backend (Render)
output "backend_url" {
  description = "URL triển khai của Backend (Render)."
  value       = "https://${render_service.backend.host}"
}

# Chuỗi kết nối Database (chỉ hiển thị cho mục đích debug/quản trị, cẩn thận khi sử dụng)
output "database_url_full" {
  description = "Chuỗi kết nối đầy đủ của Neon Database."
  value       = data.neon_connection_string.db_conn.value
  sensitive   = true
}
