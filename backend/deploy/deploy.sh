#!/bin/bash

# Application Deployment Script
# Run this script to deploy or update the application

set -e  # Exit on any error

APP_DIR="/opt/backend"
COMPOSE_FILE="docker-compose.yml"

echo "=========================================="
echo "Starting Application Deployment"
echo "=========================================="

# Navigate to app directory
cd $APP_DIR

# Pull latest code (if using Git)
if [ -d ".git" ]; then
    echo "📥 Pulling latest code..."
    git pull origin main || git pull origin master
else
    echo "⚠️  Not a git repository. Skipping git pull."
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with required environment variables"
    exit 1
fi

# Stop running containers
echo "🛑 Stopping existing containers..."
docker-compose down || true

# Remove old images (optional, saves disk space)
echo "🧹 Cleaning up old images..."
docker image prune -f

# Build new image
echo "🏗️ Building Docker image..."
docker-compose build --no-cache

# Start containers
echo "🚀 Starting containers..."
docker-compose up -d

# Wait for container to be healthy
echo "⏳ Waiting for application to start..."
sleep 10

# Check container status
echo ""
echo "📊 Container Status:"
docker-compose ps

# Show logs
echo ""
echo "📋 Recent logs:"
docker-compose logs --tail=50

# Test health endpoint
echo ""
echo "🏥 Testing health endpoint..."
sleep 5
if curl -f http://localhost:8000/test-db 2>/dev/null; then
    echo "✅ Application is healthy!"
else
    echo "⚠️  Health check failed. Check logs with: docker-compose logs -f"
fi

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo "📝 Useful Commands:"
echo "  View logs:    docker-compose logs -f"
echo "  Stop app:     docker-compose down"
echo "  Restart app:  docker-compose restart"
echo "  Enter shell:  docker-compose exec backend bash"
echo ""
