# 🚀 Quick Start Guide - EC2 Deployment

Hướng dẫn nhanh deploy trong 10 phút.

## Prerequisites

- [x] AWS account
- [x] EC2 instance: Ubuntu 22.04, t3.large, với ports 22, 80, 443, 8000 open
- [x] SSH key để connect
- [x] Code đã push lên GitHub

---

## 🎯 Deployment trong 5 Lệnh

### 1️⃣ SSH vào EC2

```bash
ssh -i your-key.pem ubuntu@<YOUR_EC2_IP>
```

### 2️⃣ Setup Server (chạy 1 lần duy nhất)

```bash
curl -fsSL https://raw.githubusercontent.com/<YOUR_REPO>/main/deploy/setup-ec2.sh | bash
# Sau đó logout và login lại
exit
ssh -i your-key.pem ubuntu@<YOUR_EC2_IP>
```

### 3️⃣ Clone Code

```bash
git clone https://github.com/<YOUR_REPO>.git /opt/backend
cd /opt/backend
```

### 4️⃣ Configure Environment

```bash
cp .env.production.example .env
vim .env  # Cập nhật các biến cần thiết
```

**Minimum required changes:**

```bash
SECRET_KEY=$(openssl rand -hex 32)  # Generate và paste vào .env
GOOGLE_REDIRECT_URI=http://<YOUR_EC2_IP>/auth/google/callback
GITHUB_REDIRECT_URI=http://<YOUR_EC2_IP>/auth/github/callback
BACKEND_URL=http://<YOUR_EC2_IP>
FRONTEND_ORIGIN=http://<YOUR_FRONTEND_URL>
```

### 5️⃣ Deploy!

```bash
chmod +x deploy/deploy.sh
bash deploy/deploy.sh
```

---

## ✅ Verify Deployment

```bash
# Test local
curl http://localhost:8000/test-db

# Test from outside (from your computer)
curl http://<YOUR_EC2_IP>/test-db
```

Expected response:
```json
{"status":"ok","result":1}
```

---

## 🌐 Setup Nginx (Optional but Recommended)

```bash
sudo cp /opt/backend/deploy/nginx.conf /etc/nginx/sites-available/backend
sudo rm /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/backend /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 🔐 Setup HTTPS (if you have domain)

```bash
cd /opt/backend/deploy
chmod +x setup-ssl.sh
bash setup-ssl.sh your-domain.com your-email@example.com
```

Then update OAuth callbacks in Google/GitHub consoles!

---

## 📊 Useful Commands

```bash
# View logs
docker-compose logs -f

# Restart app
docker-compose restart

# Update app
cd /opt/backend && git pull && bash deploy/deploy.sh

# Stop app
docker-compose down

# Check status
docker-compose ps
```

---

## ❌ Problems?

Read full guide: [deploy/README.md](./README.md)

Common issues:
- Out of memory → Use t3.large or add swap
- Model download failed → Check logs, may need to wait
- OAuth not working → Update redirect URIs in Google/GitHub
