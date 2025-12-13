# Fix: SSL Certificate Error (ERR_CERT_AUTHORITY_INVALID)

## Problem

**Error:** `ERR_CERT_AUTHORITY_INVALID`

**This means:**
- Frontend is trying to connect to `https://studentitrack.org/api`
- SSL certificate is invalid, self-signed, or not trusted
- Browser is blocking the connection for security

---

## Solution Options

### Option 1: Use HTTP Instead of HTTPS (Quick Fix)

**If SSL certificate isn't set up yet, use HTTP:**

**Step 1: Check if backend is accessible via HTTP:**

```bash
curl http://studentitrack.org/api/health
```

**Or test with your VPS IP:**
```bash
curl http://YOUR_VPS_IP:5000/api/health
```

**If it works, update frontend to use HTTP.**

**Step 2: Update Vercel Environment Variable:**

1. **Go to Vercel Dashboard**
2. **Select your project:** `studentitrack`
3. **Go to:** Settings → Environment Variables
4. **Find:** `VITE_API_URL`
5. **Change from:** `https://studentitrack.org/api`
6. **Change to:** `http://studentitrack.org/api` (or `http://YOUR_VPS_IP:5000/api`)

**Step 3: Redeploy Frontend:**

- Vercel will automatically redeploy when you save the environment variable
- Or manually trigger a redeploy

---

### Option 2: Set Up SSL Certificate (Proper Fix)

**If you want to use HTTPS, you need a valid SSL certificate.**

**Option A: Use Let's Encrypt (Free SSL):**

```bash
# Install certbot
apt-get update
apt-get install -y certbot

# Get SSL certificate
certbot certonly --standalone -d studentitrack.org

# This will create certificates in /etc/letsencrypt/live/studentitrack.org/
```

**Then configure your web server (Nginx/Apache) to use the certificates.**

**Option B: Use Hostinger SSL (If Available):**

- Check Hostinger cPanel for SSL certificate options
- They might provide free SSL certificates

---

### Option 3: Configure Reverse Proxy with SSL

**If you're using Nginx or Apache as reverse proxy:**

**Example Nginx configuration:**

```nginx
server {
    listen 443 ssl;
    server_name studentitrack.org;

    ssl_certificate /etc/letsencrypt/live/studentitrack.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/studentitrack.org/privkey.pem;

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

---

## Quick Fix: Use HTTP for Now

**Since SSL isn't set up, use HTTP:**

### Step 1: Test Backend with HTTP

```bash
# Test with domain
curl http://studentitrack.org/api/health

# Or test with VPS IP
curl http://YOUR_VPS_IP:5000/api/health
```

**If it works, you'll see:**
```json
{"status":"ok","message":"Server is running"}
```

### Step 2: Update Vercel Environment Variable

1. **Go to:** https://vercel.com/dashboard
2. **Select project:** `studentitrack`
3. **Go to:** Settings → Environment Variables
4. **Find:** `VITE_API_URL`
5. **Update to:** `http://studentitrack.org/api` (change `https` to `http`)

**OR if domain isn't working, use VPS IP:**
- `http://YOUR_VPS_IP:5000/api`

### Step 3: Redeploy

- Vercel will auto-redeploy when you save
- Or manually trigger: Deployments → Redeploy

---

## Check Backend is Running

**Before fixing SSL, make sure backend is running:**

```bash
# On VPS, check PM2 status
pm2 status

# Check if backend is listening on port 5000
netstat -tlnp | grep 5000

# Or check with curl
curl http://localhost:5000/api/health
```

**Should show:**
```json
{"status":"ok","message":"Server is running"}
```

---

## Check Domain Configuration

**If using `studentitrack.org` domain:**

1. **Check DNS settings:**
   - Domain should point to your VPS IP
   - A record: `studentitrack.org` → `YOUR_VPS_IP`

2. **Check if domain is accessible:**
   ```bash
   curl http://studentitrack.org/api/health
   ```

3. **If domain doesn't work, use VPS IP:**
   - Update `VITE_API_URL` to `http://YOUR_VPS_IP:5000/api`

---

## Common Issues

### Issue 1: Domain Not Pointing to VPS

**Error:** Can't connect to `http://studentitrack.org`

**Solution:**
- Check DNS settings in domain registrar
- Make sure A record points to VPS IP
- Or use VPS IP directly: `http://YOUR_VPS_IP:5000/api`

### Issue 2: Port 5000 Not Accessible

**Error:** Connection refused

**Solution:**
- Check firewall: `ufw allow 5000`
- Check if backend is running: `pm2 status`
- Check if port is listening: `netstat -tlnp | grep 5000`

### Issue 3: Backend Not Running

**Error:** Cannot connect to server

**Solution:**
- Start backend: `pm2 start student-itrack-api`
- Check logs: `pm2 logs student-itrack-api --err`

---

## Quick Fix Checklist

1. ✅ **Test backend with HTTP:** `curl http://studentitrack.org/api/health`
2. ✅ **If domain doesn't work, use VPS IP:** `curl http://YOUR_VPS_IP:5000/api/health`
3. ✅ **Update Vercel `VITE_API_URL`:** Change `https` to `http`
4. ✅ **Redeploy frontend on Vercel**
5. ✅ **Test login from frontend**

---

## For Production (Later)

**Once everything works with HTTP, you can set up SSL:**

1. **Install Let's Encrypt:**
   ```bash
   apt-get install -y certbot
   certbot certonly --standalone -d studentitrack.org
   ```

2. **Configure reverse proxy (Nginx/Apache) with SSL**

3. **Update `VITE_API_URL` back to `https://studentitrack.org/api`**

---

**For now, use HTTP instead of HTTPS to fix the SSL error!**

