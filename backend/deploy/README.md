# 🚀 AWS EC2 Deployment Guide

Hướng dẫn chi tiết deploy FastAPI Backend với ML Model lên AWS EC2.

## 📋 Mục Lục

1. [Yêu Cầu Trước Khi Deploy](#yêu-cầu-trước-khi-deploy)
2. [Bước 1: Tạo EC2 Instance](#bước-1-tạo-ec2-instance)
3. [Bước 2: Setup Server](#bước-2-setup-server)
4. [Bước 3: Deploy Application](#bước-3-deploy-application)
5. [Bước 4: Cấu Hình Nginx](#bước-4-cấu-hình-nginx)
6. [Bước 5: Setup SSL/HTTPS](#bước-5-setup-sslhttps-optional)
7. [Bước 6: Cập Nhật OAuth](#bước-6-cập-nhật-oauth-callbacks)
8. [Monitoring & Debugging](#monitoring--debugging)
9. [Troubleshooting](#troubleshooting)

---

## Yêu Cầu Trước Khi Deploy

### ✅ Checklist

- [ ] Tài khoản AWS đã kích hoạt
- [ ] SSH key pair đã tạo (hoặc sẽ tạo khi launch EC2)
- [ ] Code đã push lên Git repository (GitHub/GitLab)
- [ ] Database PostgreSQL đã sẵn sàng (Neon DB trong trường hợp này)
- [ ] Domain name (tùy chọn, nhưng khuyên dùng cho HTTPS)

### 💰 Chi Phí Ước Tính

- **t3.medium** (2 vCPU, 4GB RAM): ~$30/tháng
- **t3.large** (2 vCPU, 8GB RAM): ~$60/tháng ⭐ **Khuyên dùng**
- **Storage**: ~$5/tháng (30GB SSD)
- **Data transfer**: ~$1-5/tháng
- **Total**: ~$36-70/tháng

---

## Bước 1: Tạo EC2 Instance

### 1.1. Đăng Nhập AWS Console

1. Truy cập [AWS Console](https://console.aws.amazon.com/)
2. Chọn region gần nhất (ví dụ: **ap-southeast-1** - Singapore)

### 1.2. Launch EC2 Instance

1. Vào **EC2 Dashboard** → **Launch Instance**

2. **Cấu hình instance:**

   | Setting | Value |
   |---------|-------|
   | **Name** | `text-summarizer-backend` |
   | **AMI** | Ubuntu Server 22.04 LTS |
   | **Instance type** | `t3.large` (8GB RAM) |
   | **Key pair** | Tạo mới hoặc chọn key có sẵn |
   | **Storage** | 30 GB gp3 SSD |

3. **Network Settings:**
   - Tạo mới Security Group hoặc dùng có sẵn
   - **Inbound rules:**
     - SSH (22) - Source: My IP
     - HTTP (80) - Source: Anywhere (0.0.0.0/0)
     - HTTPS (443) - Source: Anywhere (0.0.0.0/0)
     - Custom TCP (8000) - Source: Anywhere (0.0.0.0/0) [Tạm thời, để test]

4. Click **Launch Instance**

### 1.3. Allocate Elastic IP (Khuyên Dùng)

1. Vào **EC2** → **Elastic IPs** → **Allocate Elastic IP address**
2. **Associate** Elastic IP với instance vừa tạo
3. Ghi lại **Public IP** này để dùng sau

> **Lý do:** Elastic IP giữ nguyên IP khi restart instance, tránh phải update DNS

---

## Bước 2: Setup Server

### 2.1. SSH vào Server

```bash
# Download SSH key về (nếu mới tạo)
chmod 400 your-key.pem

# SSH vào EC2
ssh -i your-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
```

### 2.2. Chạy Setup Script

```bash
# Download setup script
wget https://raw.githubusercontent.com/<YOUR_REPO>/main/deploy/setup-ec2.sh

# Hoặc nếu đã clone repo:
git clone https://github.com/<YOUR_REPO>.git /opt/backend
cd /opt/backend/deploy

# Make executable và chạy
chmod +x setup-ec2.sh
bash setup-ec2.sh
```

Script này sẽ cài đặt:
- ✅ Docker & Docker Compose
- ✅ Nginx
- ✅ Git
- ✅ UFW Firewall
- ✅ Certbot (cho SSL)
- ✅ Các tools hữu ích (htop, vim, etc.)

### 2.3. Logout và Login Lại

```bash
exit
ssh -i your-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
```

> **Lý do:** Để Docker group permission có hiệu lực

### 2.4. Verify Installation

```bash
docker --version
docker-compose --version
nginx -v
```

---

## Bước 3: Deploy Application

### 3.1. Clone Repository

```bash
# Nếu chưa clone
cd /opt
sudo chown -R $USER:$USER backend
git clone https://github.com/<YOUR_REPO>.git backend
cd backend
```

### 3.2. Cấu Hình Environment Variables

```bash
# Copy template
cp .env.production.example .env

# Edit file .env
vim .env
# Hoặc: nano .env
```

**Cập nhật các biến sau:**

```bash
# Database (giữ nguyên nếu dùng Neon DB)
DATABASE_URL=postgresql://...your-db-url...

# Generate secret key mới
SECRET_KEY=$(openssl rand -hex 32)

# OAuth - IMPORTANT: Thay YOUR_DOMAIN bằng IP hoặc domain thật
GOOGLE_REDIRECT_URI=http://<YOUR_EC2_IP>/auth/google/callback
GITHUB_REDIRECT_URI=http://<YOUR_EC2_IP>/auth/github/callback

# Backend & Frontend URLs
BACKEND_URL=http://<YOUR_EC2_IP>
FRONTEND_ORIGIN=http://<YOUR_FRONTEND_URL>

# Hugging Face (nếu có)
HF_TOKEN=your-hf-token
```

### 3.3. Deploy Application

```bash
# Make deploy script executable
chmod +x deploy/deploy.sh

# Run deployment
bash deploy/deploy.sh
```

**Script sẽ:**
1. ✅ Build Docker image
2. ✅ Download ML model (~400MB) vào container
3. ✅ Start containers
4. ✅ Run health checks

**Xem logs:**

```bash
docker-compose logs -f
```

Bạn sẽ thấy:
```
⬇️ Đang tải model từ GitHub: https://...
100%|██████████| 400MB/400MB
✅ Model tải hoàn tất!
INFO: Application startup complete.
```

### 3.4. Test Application

```bash
# Test health endpoint
curl http://localhost:8000/test-db

# Expected output:
# {"status":"ok","result":1}
```

---

## Bước 4: Cấu Hình Nginx

### 4.1. Copy Nginx Config

```bash
sudo cp /opt/backend/deploy/nginx.conf /etc/nginx/sites-available/backend
```

### 4.2. Enable Site

```bash
# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Enable backend
sudo ln -s /etc/nginx/sites-available/backend /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 4.3. Test từ Bên Ngoài

```bash
# Từ máy local của bạn
curl http://<YOUR_EC2_IP>/test-db
```

---

## Bước 5: Setup SSL/HTTPS (Optional)

> **Bỏ qua nếu chưa có domain.** Dùng IP tạm thời được.

### 5.1. Point Domain to EC2

1. Vào DNS provider của bạn (Namecheap, Cloudflare, GoDaddy, etc.)
2. Tạo **A Record**:
   - Name: `@` (hoặc `api` nếu muốn subdomain)
   - Value: `<YOUR_EC2_ELASTIC_IP>`
   - TTL: 300

3. Đợi DNS propagate (5-30 phút)

**Kiểm tra:**

```bash
nslookup your-domain.com
```

### 5.2. Run SSL Setup Script

```bash
cd /opt/backend/deploy
chmod +x setup-ssl.sh

# Run with your domain and email
bash setup-ssl.sh your-domain.com your-email@example.com
```

Script sẽ:
1. ✅ Install Certbot
2. ✅ Generate SSL certificate
3. ✅ Update Nginx config
4. ✅ Setup auto-renewal

### 5.3. Verify HTTPS

```bash
# Test HTTPS
curl https://your-domain.com/test-db
```

---

## Bước 6: Cập Nhật OAuth Callbacks

### 6.1. Google Cloud Console

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Chọn OAuth 2.0 Client ID của bạn
3. **Authorized redirect URIs** → Add:
   ```
   https://your-domain.com/auth/google/callback
   ```
4. Save

### 6.2. GitHub Settings

1. Truy cập [GitHub OAuth Apps](https://github.com/settings/developers)
2. Chọn OAuth App của bạn
3. **Authorization callback URL**:
   ```
   https://your-domain.com/auth/github/callback
   ```
4. Update application

### 6.3. Update Environment Variables

```bash
cd /opt/backend
vim .env
```

Cập nhật:

```bash
GOOGLE_REDIRECT_URI=https://your-domain.com/auth/google/callback
GITHUB_REDIRECT_URI=https://your-domain.com/auth/github/callback
BACKEND_URL=https://your-domain.com
```

### 6.4. Restart Application

```bash
docker-compose restart
```

---

## Monitoring & Debugging

### Useful Commands

```bash
# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend

# Check container status
docker-compose ps

# Restart application
docker-compose restart

# Stop application
docker-compose down

# Enter container shell
docker-compose exec backend bash

# Check memory usage
docker stats

# System resources
htop
```

### Log Files

```bash
# Nginx access logs
sudo tail -f /var/log/nginx/backend_access.log

# Nginx error logs
sudo tail -f /var/log/nginx/backend_error.log

# Application logs (inside container)
docker-compose exec backend tail -f /app/logs/app.log
```

### Health Checks

```bash
# Application health
curl http://localhost:8000/test-db

# Docker health
docker inspect text-summarizer-backend | grep Health -A 10
```

---

## Troubleshooting

### ❌ Container Failed to Start

**Check logs:**

```bash
docker-compose logs backend
```

**Common issues:**

1. **Environment variables missing:**
   ```bash
   # Make sure .env exists
   ls -la .env
   # Check content
   cat .env
   ```

2. **Port already in use:**
   ```bash
   sudo lsof -i :8000
   # Kill process if needed
   sudo kill <PID>
   ```

### ❌ Model Download Failed

**Error:** `Failed to download model`

**Solution:**

```bash
# Download manually inside container
docker-compose exec backend bash
cd /app
python scripts/fetch_model.py

# Or download on host and copy
wget https://github.com/Group9-prj1/Project-1-Group-9/releases/download/v1.0-model/phobertsum_lightweight.pt
docker cp phobertsum_lightweight.pt text-summarizer-backend:/app/app/llm/models/
```

### ❌ Out of Memory

**Symptoms:** Container crashes, `Killed` in logs

**Solution:**

1. **Upgrade to larger instance:**
   - Stop instance
   - Change instance type to `t3.large` or `t3.xlarge`

2. add swap space:**
   ```bash
   sudo fallocate -l 4G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

### ❌ OAuth Redirect Not Working

**Check:**

1. Redirect URIs match exactly (no trailing slash)
2. HTTPS if using SSL
3. Domain resolves correctly
4. Environment variables updated and container restarted

### ❌ Database Connection Failed

**Check:**

1. Database URL is correct
2. Database allows connections from EC2 IP
3. SSL mode is correct (`sslmode=require`)

**Test connection:**

```bash
docker-compose exec backend python -c "
from app.db.session import SessionLocal
db = SessionLocal()
print('✅ Database connected!')
"
```

---

## Maintenance

### Update Application

```bash
cd /opt/backend
git pull origin main
bash deploy/deploy.sh
```

### Monitor Disk Space

```bash
df -h
docker system df

# Cleanup old images/containers
docker system prune -a
```

### Backup Important Data

```bash
# Backup environment file
cp .env .env.backup

# Backup Docker volumes
docker run --rm -v backend_model_cache:/data -v $(pwd):/backup ubuntu tar czf /backup/model_cache.tar.gz /data
```

---

## 🎉 Deployment Complete!

Your backend is now running at:
- **HTTP**: `http://your-domain.com` or `http://<EC2_IP>`
- **HTTPS**: `https://your-domain.com` (if SSL configured)

### Next Steps

1. ✅ Test all API endpoints
2. ✅ Monitor logs for first 24 hours
3. ✅ Setup CloudWatch for monitoring (optional)
4. ✅ Configure backup strategy
5. ✅ Setup Auto Scaling (if needed)

---

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra logs: `docker-compose logs -f`
2. Xem [Troubleshooting](#troubleshooting) section
3. Check GitHub Issues của repo
