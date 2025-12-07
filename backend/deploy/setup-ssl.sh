#!/bin/bash

# SSL/HTTPS Setup Script using Let's Encrypt
# Run this script AFTER you have pointed your domain to the EC2 instance

set -e

echo "=========================================="
echo "SSL/HTTPS Setup with Let's Encrypt"
echo "=========================================="

# Check if domain is provided
if [ -z "$1" ]; then
    echo "❌ Error: Domain name required!"
    echo "Usage: bash setup-ssl.sh your-domain.com your-email@example.com"
    exit 1
fi

if [ -z "$2" ]; then
    echo "❌ Error: Email required!"
    echo "Usage: bash setup-ssl.sh your-domain.com your-email@example.com"
    exit 1
fi

DOMAIN=$1
EMAIL=$2

echo "🌐 Domain: $DOMAIN"
echo "📧 Email: $EMAIL"
echo ""

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "❌ Nginx is not installed. Please run setup-ec2.sh first."
    exit 1
fi

# Check if Certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing Certbot..."
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
fi

# Stop Nginx temporarily
echo "🛑 Stopping Nginx..."
sudo systemctl stop nginx

# Obtain SSL certificate
echo "🔐 Obtaining SSL certificate..."
sudo certbot certonly --standalone \
    --preferred-challenges http \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN

# Update Nginx configuration with domain
echo "📝 Updating Nginx configuration..."
NGINX_CONF="/etc/nginx/sites-available/backend"

sudo sed -i "s/server_name _;/server_name $DOMAIN;/" $NGINX_CONF

# Uncomment HTTPS server block
sudo sed -i '/# server {/,/# }/s/^# //' $NGINX_CONF
sudo sed -i "s/your-domain.com/$DOMAIN/g" $NGINX_CONF

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

# Start Nginx
echo "🚀 Starting Nginx..."
sudo systemctl start nginx
sudo systemctl enable nginx

# Setup auto-renewal
echo "🔄 Setting up auto-renewal..."
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test renewal
echo "🧪 Testing certificate renewal..."
sudo certbot renew --dry-run

echo ""
echo "=========================================="
echo "✅ SSL Setup Complete!"
echo "=========================================="
echo "🌐 Your site is now available at: https://$DOMAIN"
echo "🔐 SSL certificate will auto-renew before expiration"
echo ""
echo "📝 Next Steps:"
echo "1. Update OAuth redirect URIs in Google/GitHub console:"
echo "   - Google: https://$DOMAIN/auth/google/callback"
echo "   - GitHub: https://$DOMAIN/auth/github/callback"
echo "2. Update environment variables:"
echo "   - GOOGLE_REDIRECT_URI=https://$DOMAIN/auth/google/callback"
echo "   - GITHUB_REDIRECT_URI=https://$DOMAIN/auth/github/callback"
echo "   - BACKEND_URL=https://$DOMAIN"
echo "3. Restart application: cd /opt/backend && docker-compose restart"
echo ""
