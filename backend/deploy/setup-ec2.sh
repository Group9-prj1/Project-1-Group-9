#!/bin/bash

# EC2 Initial Setup Script
# Run this script once on a fresh EC2 Ubuntu instance

set -e  # Exit on any error

echo "=========================================="
echo "Starting EC2 Instance Setup"
echo "=========================================="

# Update system
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    sudo apt-get install -y \
        ca-certificates \
        curl \
        gnupg \
        lsb-release

    # Add Docker's official GPG key
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

    # Set up the repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Install Docker Engine
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    echo "✅ Docker installed successfully"
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose (standalone)
echo "🐳 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed successfully"
else
    echo "✅ Docker Compose already installed"
fi

# Install Git
echo "📦 Installing Git..."
sudo apt-get install -y git

# Install Nginx
echo "🌐 Installing Nginx..."
sudo apt-get install -y nginx

# Install UFW (firewall)
echo "🔥 Configuring firewall..."
sudo apt-get install -y ufw
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 8000/tcp    # FastAPI (for testing, can remove later)
sudo ufw --force enable

# Install useful tools
echo "🛠️ Installing useful tools..."
sudo apt-get install -y \
    htop \
    vim \
    wget \
    net-tools \
    certbot \
    python3-certbot-nginx

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /opt/backend
sudo chown -R $USER:$USER /opt/backend

# Create logs directory
sudo mkdir -p /var/log/backend
sudo chown -R $USER:$USER /var/log/backend

# Enable Docker to start on boot
sudo systemctl enable docker
sudo systemctl start docker

# Print versions
echo ""
echo "=========================================="
echo "✅ Installation Complete!"
echo "=========================================="
echo "Docker version: $(docker --version)"
echo "Docker Compose version: $(docker-compose --version)"
echo "Git version: $(git --version)"
echo "Nginx version: $(nginx -v 2>&1)"
echo ""
echo "📝 Next Steps:"
echo "1. Log out and log back in for Docker group changes to take effect"
echo "2. Clone your repository: git clone <YOUR_REPO_URL> /opt/backend"
echo "3. Configure environment variables in /opt/backend/.env"
echo "4. Run the deployment script: bash /opt/backend/deploy/deploy.sh"
echo ""
