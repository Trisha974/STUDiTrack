# Complete Hostinger Deployment Guide - Frontend & Backend

## Overview

**This guide will help you deploy both frontend and backend to Hostinger VPS.**

**Architecture:**
- ✅ **Backend:** Node.js/Express on Hostinger VPS (Port 5000)
- ✅ **Frontend:** React/Vite built files on Hostinger VPS
- ✅ **Database:** MySQL on Hostinger VPS
- ✅ **Domain:** `studentitrack.org`

---

## Prerequisites

- ✅ Hostinger VPS with SSH access
- ✅ Domain `studentitrack.org` pointing to your VPS IP
- ✅ Node.js installed on VPS
- ✅ MySQL installed and running
- ✅ PM2 installed (for backend process management)

---

## Part 1: Backend Deployment

### Step 1: Connect to VPS

**On your local machine (PowerShell):**

```powershell
ssh root@72.61.215.20
```

**Or use your VPS IP address.**

### Step 2: Clone/Pull Repository

**On VPS:**

```bash
cd /var/www
git clone https://github.com/Trisha974/studentitrack.git studentitrack
# OR if already cloned:
cd /var/www/studentitrack
git pull origin main
```

### Step 3: Install Backend Dependencies

```bash
cd /var/www/studentitrack/server
npm install
```

### Step 4: Configure Environment Variables

**Create `.env` file:**

```bash
nano /var/www/studentitrack/server/.env
```

**Add these values (replace placeholders with your actual values):**

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# MySQL Database
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=student_itrack

# Frontend URL
FRONTEND_URL=https://studentitrack.org
PRODUCTION_FRONTEND_URL=https://studentitrack.org

# Firebase Admin SDK
# Option 1: Use serviceAccountKey.json (recommended)
# Place serviceAccountKey.json in /var/www/studentitrack/server/
# Option 2: Use environment variables below
FIREBASE_PROJECT_ID=studitrack-54f69
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@studitrack-54f69.iam.gserviceaccount.com

# CSRF Protection (generate with: openssl rand -hex 32)
CSRF_SECRET=your-random-32-character-secret-here
```

**Save:** `Ctrl + X`, then `Y`, then `Enter`

### Step 5: Upload Firebase Service Account Key (Optional but Recommended)

**On your local machine:**

```powershell
# Make sure you're in the project directory
cd C:\Users\Angeli1\Documents\STUDiTrack1\server
scp serviceAccountKey.json root@72.61.215.20:/var/www/studentitrack/server/
```

**On VPS, set permissions:**

```bash
chmod 600 /var/www/studentitrack/server/serviceAccountKey.json
```

### Step 6: Set Up MySQL Database

**Create database and tables:**

```bash
# Connect to MySQL
mysql -u root -p

# In MySQL prompt:
CREATE DATABASE IF NOT EXISTS student_itrack;
USE student_itrack;

# Run schema file
source /var/www/studentitrack/sql/schema.sql;

# Exit MySQL
exit;
```

**Or use the setup script:**

```bash
cd /var/www/studentitrack/server
node scripts/setup/setup-database.js
```

### Step 7: Start Backend with PM2

```bash
cd /var/www/studentitrack/server

# Start backend
pm2 start src/server.js --name student-itrack-api

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

**Verify backend is running:**

```bash
pm2 status
pm2 logs student-itrack-api --lines 20
```

**Test backend:**

```bash
curl http://localhost:5000/api/health
```

**Should return:** `{"status":"ok","message":"Server is running"}`

---

## Part 2: Frontend Deployment

### Step 1: Build Frontend Locally

**On your local machine (PowerShell):**

```powershell
cd C:\Users\Angeli1\Documents\STUDiTrack1\client

# Create production environment file
@"
VITE_API_URL=https://studentitrack.org/api
"@ | Out-File -FilePath .env.production -Encoding utf8

# Install dependencies (if needed)
npm install

# Build frontend
npm run build
```

**This creates a `dist/` folder with your built frontend.**

### Step 2: Upload Frontend to VPS

**On your local machine:**

```powershell
# Upload dist folder to VPS
cd C:\Users\Angeli1\Documents\STUDiTrack1\client
scp -r dist root@72.61.215.20:/var/www/studentitrack/frontend/
```

**On VPS, set permissions:**

```bash
chmod -R 755 /var/www/studentitrack/frontend
```

---

## Part 3: Configure Web Server

### Option A: Using Nginx (Recommended)

#### Step 1: Install Nginx

```bash
apt-get update
apt-get install -y nginx
```

#### Step 2: Create Nginx Configuration

```bash
nano /etc/nginx/sites-available/studentitrack
```

**Add this configuration:**

```nginx
server {
    listen 80;
    server_name studentitrack.org www.studentitrack.org;

    # Frontend
    location / {
        root /var/www/studentitrack/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Save:** `Ctrl + X`, then `Y`, then `Enter`

#### Step 3: Enable Site

```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/studentitrack /etc/nginx/sites-enabled/

# Remove default site (optional)
rm /etc/nginx/sites-enabled/default

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

#### Step 4: Set Up SSL Certificate

```bash
# Install Certbot
apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d studentitrack.org -d www.studentitrack.org

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)
```

**Certbot will automatically configure Nginx for SSL.**

---

### Option B: Using OpenLiteSpeed (If Already Installed)

#### Step 1: Access OpenLiteSpeed Admin

```bash
# Get admin password
cat /home/ubuntu/.litespeed_password
# OR
cat /usr/local/lsws/admin/misc/admpass
```

#### Step 2: Access Admin Panel

**Open browser:** `http://YOUR_VPS_IP:7080`

**Login with:**
- **Username:** `admin`
- **Password:** (from step 1)

#### Step 3: Create Virtual Host

1. **Go to:** Virtual Hosts → Add
2. **Fill in:**
   - **Virtual Host Name:** `studentitrack`
   - **Domain:** `studentitrack.org`
   - **Document Root:** `/var/www/studentitrack/frontend/dist`
   - **Index Files:** `index.html`
3. **Click:** Save

#### Step 4: Configure SSL

1. **Go to:** SSL → Add
2. **Select Virtual Host:** `studentitrack`
3. **Choose:** Let's Encrypt (or upload your SSL certificate)
4. **Fill in:**
   - **Domain:** `studentitrack.org`
   - **Email:** `your-email@example.com`
5. **Click:** Save

#### Step 5: Configure API Proxy

1. **Go to:** Virtual Host → `studentitrack` → Rewrite
2. **Add Rewrite Rule:**
   - **Rewrite Rule:** `^/api/(.*)$ http://localhost:5000/api/$1 [P,L]`
3. **Click:** Save

---

## Part 4: Configure Firewall

**Allow HTTP, HTTPS, and SSH:**

```bash
# Allow HTTP
ufw allow 80/tcp

# Allow HTTPS
ufw allow 443/tcp

# Allow SSH (if not already allowed)
ufw allow 22/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

---

## Part 5: Testing

### Test Backend

**On VPS:**

```bash
# Test local backend
curl http://localhost:5000/api/health

# Test through domain (if configured)
curl https://studentitrack.org/api/health
```

**Should return:** `{"status":"ok","message":"Server is running"}`

### Test Frontend

1. **Open browser:** `https://studentitrack.org`
2. **Should see:** Your frontend loads
3. **Open browser console (F12):** Check for errors

### Test Login

1. **Go to:** `https://studentitrack.org/login`
2. **Try to log in** with valid credentials
3. **Check:**
   - ✅ No CORS errors
   - ✅ API calls work
   - ✅ Login succeeds

---

## Part 6: Update Frontend After Changes

**When you make changes to frontend:**

```powershell
# On local machine
cd C:\Users\Angeli1\Documents\STUDiTrack1\client
npm run build
scp -r dist root@72.61.215.20:/var/www/studentitrack/frontend/
```

**On VPS (if needed):**

```bash
# Restart Nginx (usually not needed)
systemctl restart nginx
```

---

## Part 7: Update Backend After Changes

**When you make changes to backend:**

```bash
# On VPS
cd /var/www/studentitrack
git pull origin main
cd server
npm install  # If package.json changed
pm2 restart student-itrack-api --update-env
pm2 logs student-itrack-api --lines 20
```

---

## Troubleshooting

### Issue 1: Backend Not Starting

**Check logs:**

```bash
pm2 logs student-itrack-api --err --lines 50
```

**Common issues:**
- ❌ MySQL connection error → Check `.env` database credentials
- ❌ Firebase Admin SDK error → Check `serviceAccountKey.json` or env vars
- ❌ Port 5000 already in use → Change PORT in `.env` or kill process

### Issue 2: Frontend Shows 404

**Check:**
- ✅ Files uploaded to `/var/www/studentitrack/frontend/dist`
- ✅ Nginx/OpenLiteSpeed configured correctly
- ✅ `try_files` directive includes `/index.html` (for SPA routing)

### Issue 3: API Calls Fail

**Check:**
- ✅ Backend is running: `pm2 status`
- ✅ CORS allows `https://studentitrack.org`
- ✅ Reverse proxy configured correctly
- ✅ `VITE_API_URL` in frontend build is correct

### Issue 4: SSL Certificate Error

**Check:**
- ✅ Domain DNS points to VPS IP
- ✅ Ports 80 and 443 are open
- ✅ Certbot ran successfully

**Renew certificate:**

```bash
certbot renew
```

---

## Quick Reference Commands

### Backend

```bash
# Check status
pm2 status

# View logs
pm2 logs student-itrack-api

# Restart
pm2 restart student-itrack-api --update-env

# Stop
pm2 stop student-itrack-api

# Delete
pm2 delete student-itrack-api
```

### Frontend

```bash
# Check files
ls -la /var/www/studentitrack/frontend/dist

# Check permissions
ls -la /var/www/studentitrack/frontend/
```

### Nginx

```bash
# Test configuration
nginx -t

# Restart
systemctl restart nginx

# Check status
systemctl status nginx

# View logs
tail -f /var/log/nginx/error.log
```

### MySQL

```bash
# Connect
mysql -u root -p

# Check database
mysql -u root -p -e "SHOW DATABASES;"

# Check tables
mysql -u root -p student_itrack -e "SHOW TABLES;"
```

---

## Complete Deployment Checklist

### Backend
- [ ] Repository cloned/pulled on VPS
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with correct values
- [ ] `serviceAccountKey.json` uploaded (optional)
- [ ] MySQL database created
- [ ] Database tables created (schema.sql)
- [ ] Backend started with PM2
- [ ] Backend responds to health check

### Frontend
- [ ] Frontend built locally (`npm run build`)
- [ ] `.env.production` created with `VITE_API_URL`
- [ ] `dist/` folder uploaded to VPS
- [ ] Permissions set correctly (755)

### Web Server
- [ ] Nginx/OpenLiteSpeed installed
- [ ] Virtual host configured
- [ ] Frontend served from `/var/www/studentitrack/frontend/dist`
- [ ] API proxy configured (`/api` → `localhost:5000`)
- [ ] SSL certificate installed
- [ ] HTTP redirects to HTTPS

### Testing
- [ ] Frontend loads at `https://studentitrack.org`
- [ ] Backend responds at `https://studentitrack.org/api/health`
- [ ] Login works without CORS errors
- [ ] All features functional

---

## Summary

**After completing all steps:**

1. ✅ **Backend:** Running on `https://studentitrack.org/api` (via reverse proxy)
2. ✅ **Frontend:** Served from `https://studentitrack.org`
3. ✅ **Database:** MySQL on VPS
4. ✅ **SSL:** HTTPS enabled
5. ✅ **Everything:** On Hostinger VPS

**Your application is now fully deployed on Hostinger!**

---

**Need help? Check the troubleshooting section or review the logs!**

