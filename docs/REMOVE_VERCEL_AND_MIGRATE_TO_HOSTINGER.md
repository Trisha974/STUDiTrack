# Remove Vercel and Migrate to Hostinger - Complete Guide

## Overview

**This guide helps you:**
1. ✅ Remove all Vercel references from the project
2. ✅ Deploy frontend to Hostinger
3. ✅ Configure everything to work together

---

## What Was Changed

### Files Removed:
- ✅ `vercel.json` - Deleted

### Files Updated:
- ✅ `server/src/server.js` - Removed Vercel URL from CORS, added Hostinger domain
- ✅ `server/env.production.template` - Updated to use Hostinger domain
- ✅ `client/env.production.template` - Updated to use Hostinger backend URL

---

## Step 1: Update Backend .env File

**On your VPS, update the `.env` file:**

```bash
cd /var/www/studentitrack/server
nano .env
```

**Update these values:**

```env
FRONTEND_URL=https://studentitrack.org
PRODUCTION_FRONTEND_URL=https://studentitrack.org
```

**Save:** `Ctrl + X`, then `Y`, then `Enter`

**Restart backend:**

```bash
pm2 restart student-itrack-api --update-env
```

---

## Step 2: Build Frontend for Hostinger

**On your local machine:**

```bash
cd client

# Create .env.production file
cat > .env.production << 'EOF'
VITE_API_URL=https://studentitrack.org/api
EOF

# Install dependencies (if needed)
npm install

# Build frontend
npm run build
```

**This creates `client/dist/` folder with your built frontend.**

---

## Step 3: Deploy Frontend to Hostinger VPS

### Option A: Same VPS (Recommended)

**Upload frontend to the same VPS:**

```powershell
# From your local machine (PowerShell)
cd C:\Users\Angeli1\Documents\STUDiTrack1\client
scp -r dist root@72.61.215.20:/var/www/studentitrack/frontend/
```

**On VPS, set permissions:**

```bash
chmod -R 755 /var/www/studentitrack/frontend
```

### Option B: Hostinger Shared Hosting

**If you have separate Hostinger shared hosting:**

1. **Login to Hostinger cPanel**
2. **Go to:** File Manager
3. **Navigate to:** `public_html`
4. **Upload:** All files from `client/dist/` folder
5. **Create `.htaccess` file:**

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## Step 4: Configure Web Server

### If Using OpenLiteSpeed (Hostinger VPS)

1. **Access OpenLiteSpeed Admin:**
   ```bash
   # On VPS, get password
   sudo cat /home/ubuntu/.litespeed_password
   ```

2. **Access:** `http://YOUR_VPS_IP:7080`

3. **Configure Virtual Host:**
   - **Domain:** `studentitrack.org`
   - **Document Root:** `/var/www/studentitrack/frontend/dist`
   - **Index Files:** `index.html`

4. **Set up SSL** (Let's Encrypt or Hostinger SSL)

### If Using Nginx

**Install Nginx:**

```bash
apt-get update
apt-get install -y nginx
```

**Create configuration:**

```bash
nano /etc/nginx/sites-available/studentitrack
```

**Add:**

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
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Enable and restart:**

```bash
ln -s /etc/nginx/sites-available/studentitrack /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

**Set up SSL:**

```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d studentitrack.org -d www.studentitrack.org
```

---

## Step 5: Update DNS (If Needed)

**Make sure your domain points to Hostinger:**

1. **Go to your domain registrar**
2. **Check DNS settings:**
   - **A record:** `studentitrack.org` → `72.61.215.20` (your VPS IP)
   - **A record:** `www.studentitrack.org` → `72.61.215.20`

**Wait for DNS propagation (can take a few minutes to 24 hours).**

---

## Step 6: Test Everything

### Test Frontend

1. **Visit:** `https://studentitrack.org`
2. **Should see:** Your frontend loads
3. **Check browser console (F12):** No errors

### Test Backend Connection

**From browser console:**

```javascript
fetch('https://studentitrack.org/api/health')
  .then(r => r.json())
  .then(console.log)
```

**Should return:** `{status: "ok", message: "Server is running"}`

### Test Login

1. **Go to:** `https://studentitrack.org/login`
2. **Try to log in**
3. **Should work** without CORS errors

---

## Quick Checklist

- [ ] Removed `vercel.json` file
- [ ] Updated `server/src/server.js` (removed Vercel URL from CORS)
- [ ] Updated backend `.env` file (`FRONTEND_URL=https://studentitrack.org`)
- [ ] Restarted backend: `pm2 restart student-itrack-api --update-env`
- [ ] Created `client/.env.production` with `VITE_API_URL=https://studentitrack.org/api`
- [ ] Built frontend: `cd client && npm run build`
- [ ] Uploaded `dist/` folder to Hostinger
- [ ] Configured web server (OpenLiteSpeed/Nginx)
- [ ] Set up SSL certificate
- [ ] Updated DNS (if needed)
- [ ] Tested frontend: `https://studentitrack.org`
- [ ] Tested backend connection
- [ ] Tested login functionality

---

## Architecture After Migration

**Before (Vercel):**
```
Frontend: Vercel (https://studentitrack.vercel.app)
    ↓
Backend: Hostinger VPS (https://studentitrack.org/api)
    ↓
Database: MySQL on VPS
```

**After (Hostinger):**
```
Frontend: Hostinger (https://studentitrack.org)
    ↓
Backend: Hostinger VPS (https://studentitrack.org/api)
    ↓
Database: MySQL on VPS
```

**Everything on Hostinger!**

---

## Benefits of Hostinger-Only Setup

1. ✅ **Single Infrastructure:** Everything in one place
2. ✅ **Easier Management:** One control panel
3. ✅ **No CORS Issues:** Same domain for frontend and backend
4. ✅ **Cost Effective:** One hosting plan
5. ✅ **Better Performance:** No cross-origin requests
6. ✅ **Simpler Configuration:** One domain, one SSL certificate

---

## Troubleshooting

### Issue 1: Frontend Not Loading

**Check:**
- Files uploaded to correct directory
- Web server configured correctly
- DNS pointing to correct IP
- SSL certificate installed

### Issue 2: API Calls Fail

**Check:**
- `VITE_API_URL` in frontend build
- Backend is running: `pm2 status`
- CORS allows `https://studentitrack.org`
- Reverse proxy configured (if using Nginx)

### Issue 3: 404 on Routes

**Check:**
- SPA routing configured (`.htaccess` or Nginx `try_files`)
- `index.html` is the fallback

---

**Follow these steps to migrate from Vercel to Hostinger!**

