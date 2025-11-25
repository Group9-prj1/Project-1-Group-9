# =================================================================
# Tên file: main.tf (Cấu hình Hạ tầng Hoàn chỉnh)
# =================================================================

# === 1. NEON DATABASE ===
resource "neon_project" "prj1_db_project" {
  name = "project-1-group-9-db"
}

resource "neon_database" "main_db" {
  project_id = neon_project.prj1_db_project.id
  name       = "maindb"
}

data "neon_connection_string" "db_conn" {
  project_id = neon_project.prj1_db_project.id
}


# === 2. RENDER WEB SERVICE (BACKEND - FastAPI) ===
resource "render_service" "backend" {
  name        = "prj1-backend"
  type        = "web"
  repo_url    = "https://github.com/${var.github_repo}.git"
  root_dir    = "backend" 
  env         = "python"  

  # Lệnh Build: Cài đặt -> Migration (Alembic) -> Tải Model (ensure_model.py)
  build_command = <<-EOT
    pip install -r requirements.txt
    alembic upgrade head
    python app/llm/load_model.py # Đổi tên file nếu cần
  EOT
  
  # Lệnh Start: Khởi động server Gunicorn/Uvicorn
  start_command = "gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app" 

  env_vars = {
    # Từ Neon
    DATABASE_URL = data.neon_connection_string.db_conn.value 
    
    # Từ variables.tf
    SECRET_KEY = var.app_secret_key
    
    # URL Frontend (sẽ được Render tự động lấy từ Vercel Output)
    FRONTEND_ORIGIN = "https://${vercel_project.frontend.link}" 
    
    PORT         = "10000" 
    # ... Thêm các biến môi trường khác cho OAuth/Config nếu cần ...
  }
}


# === 3. VERCEL PROJECT (FRONTEND - Vite/React) ===
resource "vercel_project" "frontend" {
  name           = "prj1-frontend"
  framework      = "vite" 
  git_repository = {
    repo = var.github_repo
    type = "github"
  }
  root_directory = "frontend"
}

# Thiết lập biến môi trường API cho Frontend (Giả định là VITE_API_URL)
resource "vercel_environment_variable" "api_url" {
  project_id = vercel_project.frontend.id
  key        = "VITE_API_URL" # KIỂM TRA LẠI TÊN BIẾN NÀY!
  
  # Giá trị là URL công khai của Backend trên Render
  value      = "https://${render_service.backend.host}" 
  target     = ["production", "preview"]
}
