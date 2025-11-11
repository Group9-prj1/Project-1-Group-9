# Database (Neon)
resource "neon_project" "project_db" {
  name      = "project1-db"
  region_id = "aws-ap-southeast-1"
}

# Backend (Render)
resource "render_web_service" "backend" {
  name   = "project1-backend"
  repo   = "https://github.com/Group9-prj1/Project-1-Group-9"
  branch = "develop"
  env    = "docker"

  env_vars = {
    DATABASE_URL = "postgresql://user:password@neonhost/project1"
    SECRET_KEY   = "test"
  }
}

# Frontend (Vercel)
resource "vercel_project" "frontend" {
  name = "project1-frontend"
  git_repository {
    type = "github"
    repo = "Group9-prj1/Project-1-Group-9"
  }
}
