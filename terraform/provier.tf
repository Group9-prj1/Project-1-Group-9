terraform {
  required_version = ">= 1.0.0"

  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = ">= 0.7.0"
    }
    render = {
      source  = "render-oss/render"
      version = ">= 0.2.0"
    }
    neon = {
      source  = "neontech/neon"
      version = ">= 0.1.0"
    }
  }
}

provider "vercel" {
  api_token = var.vercel_token
}

provider "render" {
  api_key = var.render_api_key
}

provider "neon" {
  api_key = var.neon_api_key
}
