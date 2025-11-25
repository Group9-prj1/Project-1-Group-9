terraform {
  required_providers {
    # 1. Neon Database Provider
    neon = {
      source  = "neondatabase/neon"
      version = "~> 0.5" # Luôn kiểm tra phiên bản mới nhất trên Registry
    }
    # 2. Render Deployment Provider
    render = {
      source  = "hashicorp/render"
      version = "~> 0.1" # Luôn kiểm tra phiên bản mới nhất trên Registry
    }
    # 3. Vercel Frontend Provider
    vercel = {
      source  = "vercel/vercel"
      version = "~> 0.5" # Luôn kiểm tra phiên bản mới nhất trên Registry
    }
  }
}

# Cấu hình các Providers sử dụng biến được khai báo trong variables.tf
provider "neon" {
  api_key = var.neon_api_key
}

provider "render" {
  api_key = var.render_api_key
}

provider "vercel" {
  api_token = var.vercel_api_token
  team_id   = var.vercel_team_id
}
