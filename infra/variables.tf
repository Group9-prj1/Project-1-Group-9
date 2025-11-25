# --- API Keys/Tokens (Cần được cung cấp qua terraform.tfvars hoặc biến môi trường) ---
variable "neon_api_key" {
  description = "Neon API Key."
  type        = string
  sensitive   = true 
}

variable "render_api_key" {
  description = "Render API Key."
  type        = string
  sensitive   = true
}

variable "vercel_api_token" {
  description = "Vercel Personal Access Token."
  type        = string
  sensitive   = true
}

variable "vercel_team_id" {
  description = "Vercel Team ID (Nếu sử dụng team)."
  type        = string
  default     = "" # Có thể để trống nếu dùng tài khoản cá nhân
}

# --- Cấu hình Dự án ---
variable "github_repo" {
  description = "Tên repo GitHub (Owner/RepoName)."
  type        = string
  default     = "Group9-prj1/Project-1-Group-9" 
}

variable "backend_root_dir" {
  description = "Thư mục gốc của Backend trong Repo."
  type        = string
  default     = "backend" # Đổi nếu thư mục Backend của bạn tên khác
}

variable "frontend_root_dir" {
  description = "Thư mục gốc của Frontend trong Repo."
  type        = string
  default     = "frontend" # Đổi nếu thư mục Frontend của bạn tên khác
}
