# Deploy Frontend to Hostinger

## Overview

**This guide shows you how to deploy your React/Vite frontend to Hostinger instead of Vercel.**

**Architecture:**
- ✅ **Frontend:** Hostinger (same VPS or separate hosting)
- ✅ **Backend:** Hostinger VPS (already deployed)
- ✅ **Database:** MySQL on Hostinger VPS

---

## Option 1: Deploy Frontend to Same VPS (Recommended)

**Deploy frontend to the same VPS where your backend is running.**

### Step 1: Build Frontend

**On your local machine:**

```bash
cd client
npm install
npm run build
```

**This creates a `dist/` folder with your built frontend.**

### Step 2: Upload Frontend to VPS

**Upload the `dist/` folder to your VPS:**

```bash
# From your local machine (PowerShell)
cd C:\Users\Angeli1\Documents\STUDiTrack1\client
scp -r dist root@72.61.215.20:/var/www/studentitrack/frontend/
```

**Or use SFTP client like FileZilla to upload the `dist/` folder.**

### Step 3: Configure Web Server (OpenLiteSpeed/Nginx)

**Since you have OpenLiteSpeed on Hostinger, configure it to serve the frontend:**

#### Option A: Configure OpenLiteSpeed

1. **Access OpenLiteSpeed Admin Panel:**
   ```bash
   # On VPS, get admin password
   sudo cat /home/ubuntu/.litespeed_password
   ```

2. **Access:** `http://YOUR_VPS_IP:7080` (or your domain:7080)

3. **Create Virtual Host:**
   - Go to: Virtual Hosts → Add
   - **Name:** `studentitrack`
   - **Domain:** `studentitrack.org`
   - **Document Root:** `/var/www/studentitrack/frontend/dist`
   - **Index Files:** `index.html`

4. **Configure SSL:**
   - Use Let's Encrypt SSL certificate
   - Enable HTTPS

#### Option B: Use Nginx (If Available)

**Create Nginx configuration:**

```nginx
server {
    listen 80;
    server_name studentitrack.org www.studentitrack.org;

    root /var/www/studentitrack/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Then enable SSL with Let's Encrypt.**

---

## Option 2: Deploy Frontend to Hostinger Shared Hosting

**If you have Hostinger shared hosting (separate from VPS):**

### Step 1: Build Frontend

```bash
cd client
npm install
npm run build
```

### Step 2: Upload to Hostinger

1. **Login to Hostinger cPanel**
2. **Go to:** File Manager
3. **Navigate to:** `public_html` (or your domain folder)
4. **Upload:** All files from `client/dist/` folder
5. **Create `.htaccess` file** (for SPA routing):

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

### Step 3: Configure Environment Variables

**Create `.env.production` file in `client/` directory:**

```env
VITE_API_URL=https://studentitrack.org/api
```

**Then rebuild:**

```bash
npm run build
```

**Upload the new `dist/` folder.**

---

## Option 3: Use Hostinger VPS with Nginx Reverse Proxy

**Deploy frontend and backend on same VPS with Nginx as reverse proxy.**

### Step 1: Install Nginx

```bash
# On VPS
apt-get update
apt-get install -y nginx
```

### Step 2: Build and Upload Frontend

**On local machine:**
```bash
cd client
npm run build
scp -r dist root@72.61.215.20:/var/www/studentitrack/frontend/
```

### Step 3: Configure Nginx

**Create Nginx config:**

```bash
nano /etc/nginx/sites-available/studentitrack
```

**Add configuration:**

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

**Enable site:**

```bash
ln -s /etc/nginx/sites-available/studentitrack /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 4: Set Up SSL

```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d studentitrack.org -d www.studentitrack.org
```

---

## Update Environment Variables

### Frontend (.env.production)

**Create `client/.env.production`:**

```env
VITE_API_URL=https://studentitrack.org/api
```

**Or if backend is on subdomain:**

```env
VITE_API_URL=https://api.studentitrack.org/api
```

### Backend (.env)

**Update `server/.env`:**

```env
FRONTEND_URL=https://studentitrack.org
PRODUCTION_FRONTEND_URL=https://studentitrack.org
```

---

## Update CORS Configuration

**The backend already allows `https://studentitrack.org` in CORS (we just updated it).**

**Verify in `server/src/server.js`:**
- Should include: `'https://studentitrack.org'` in `allowedOrigins`

---

## Quick Setup Summary

### Recommended: Same VPS with Nginx

1. **Build frontend:** `cd client && npm run build`
2. **Upload to VPS:** `scp -r dist root@VPS_IP:/var/www/studentitrack/frontend/`
3. **Install Nginx:** `apt-get install -y nginx`
4. **Configure Nginx:** Create config file (see above)
5. **Set up SSL:** `certbot --nginx -d studentitrack.org`
6. **Update .env:** Set `VITE_API_URL=https://studentitrack.org/api`
7. **Rebuild frontend:** `npm run build` (with new .env)
8. **Upload again:** `scp -r dist root@VPS_IP:/var/www/studentitrack/frontend/`

---

## Testing

**After deployment:**

1. **Visit:** `https://studentitrack.org`
2. **Should see:** Your frontend
3. **Try to log in:** Should connect to backend at `https://studentitrack.org/api`
4. **Check browser console:** No CORS errors

---

## Troubleshooting

### Issue 1: 404 on Routes

**Problem:** Direct URL access shows 404

**Solution:** Configure web server for SPA routing (see `.htaccess` or Nginx config above)

### Issue 2: API Calls Fail

**Problem:** Frontend can't reach backend

**Solution:**
- Check `VITE_API_URL` in frontend build
- Check CORS allows `https://studentitrack.org`
- Check backend is running: `pm2 status`

### Issue 3: SSL Certificate Error

**Problem:** Browser shows SSL warning

**Solution:**
- Set up Let's Encrypt SSL: `certbot --nginx -d studentitrack.org`
- Or use Hostinger's SSL certificate from cPanel

---

**Deploy frontend to Hostinger and everything will be on the same infrastructure!**

