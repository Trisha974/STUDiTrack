# Connect VPS to studentitrack.org - Complete Guide

This guide will help you connect your Hostinger VPS to your domain `studentitrack.org`.

---

## What We Need to Do

1. ✅ Configure DNS records in Hostinger to point to your VPS
2. ✅ Set up OpenLiteSpeed on VPS to serve your domain
3. ✅ Configure backend to work with the domain
4. ✅ Set up SSL certificate

---

## Step 1: Get Your VPS IP Address

**On your VPS (via SSH):**

```bash
# Get your VPS IP address
hostname -I
# OR
ip addr show | grep "inet " | grep -v 127.0.0.1
```

**Write down this IP address** - you'll need it for DNS configuration.

---

## Step 2: Configure DNS in Hostinger

### Option A: Using Hostinger hPanel (Recommended)

1. **Login to Hostinger:** https://hpanel.hostinger.com
2. **Go to:** Domains → `studentitrack.org` → DNS / Nameservers
3. **Add/Edit DNS Records:**

   **A Record for main domain:**
   - **Type:** `A`
   - **Name:** `@` (or leave blank/put `.`)
   - **Value:** `YOUR-VPS-IP` (the IP from Step 1)
   - **TTL:** `3600` (or default)

   **A Record for www subdomain:**
   - **Type:** `A`
   - **Name:** `www`
   - **Value:** `YOUR-VPS-IP` (same IP)
   - **TTL:** `3600`

4. **Save changes**

### Option B: Using Hostinger Domain Manager

1. Login to Hostinger
2. Go to **Domains** → **Manage**
3. Click on `studentitrack.org`
4. Go to **DNS Zone Editor** or **DNS Management**
5. Add the A records as shown above

---

## Step 3: Wait for DNS Propagation

**Check DNS propagation:**

```bash
# On your VPS or local machine
dig studentitrack.org +short
nslookup studentitrack.org
```

**Wait 5-30 minutes** for DNS to propagate. You can check periodically:
```bash
dig studentitrack.org +short
# Should show your VPS IP
```

---

## Step 4: Configure OpenLiteSpeed on VPS

**On your VPS (via SSH):**

### Step 4a: Create Web Directory Structure

```bash
# Create directory for your domain
mkdir -p /var/www/studentitrack.org/public_html

# Create a test file
echo "<h1>studentitrack.org is working!</h1>" > /var/www/studentitrack.org/public_html/index.html

# Set proper permissions
chown -R lsadm:lsadm /var/www/studentitrack.org
chmod -R 755 /var/www/studentitrack.org
```

### Step 4b: Configure Virtual Host in OpenLiteSpeed

**Get OpenLiteSpeed admin credentials:**
```bash
cat /root/.litespeed_password
```

**Access Web Admin:**
- URL: `http://YOUR-VPS-IP:7080`
- Username: `admin`
- Password: (from command above)

**In Web Admin Panel:**

1. **Go to:** Virtual Hosts → Add (or edit existing `studentitrack.org`)

2. **General Settings:**
   - **Virtual Host Name:** `studentitrack.org`
   - **Domain:** `studentitrack.org, www.studentitrack.org`
   - **Document Root:** `/var/www/studentitrack.org/public_html`

3. **Save** and click **"Graceful Restart"**

---

## Step 5: Test Domain Access

**On your VPS:**

```bash
# Test HTTP access
curl http://studentitrack.org
# Should show: <h1>studentitrack.org is working!</h1>

# Test from your local browser
# Go to: http://studentitrack.org
```

---

## Step 6: Set Up SSL Certificate

**On your VPS:**

```bash
# Install Certbot (if not already installed)
apt-get update
apt-get install -y certbot

# Get SSL certificate using webroot method
certbot certonly --webroot \
  -w /var/www/studentitrack.org/public_html \
  -d studentitrack.org \
  -d www.studentitrack.org \
  --email a.pancho.142177.tc@umindanao.edu.ph \
  --agree-tos \
  --non-interactive
```

**If webroot method fails, use standalone:**
```bash
systemctl stop lsws
certbot certonly --standalone \
  -d studentitrack.org \
  -d www.studentitrack.org \
  --email a.pancho.142177.tc@umindanao.edu.ph \
  --agree-tos \
  --non-interactive
systemctl start lsws
```

---

## Step 7: Configure OpenLiteSpeed SSL

**In OpenLiteSpeed Web Admin:**

1. **Go to:** Virtual Hosts → `studentitrack.org` → SSL
2. **Enable SSL:** Yes
3. **Private Key File:** `/etc/letsencrypt/live/studentitrack.org/privkey.pem`
4. **Certificate File:** `/etc/letsencrypt/live/studentitrack.org/fullchain.pem`
5. **Save** and **Graceful Restart**

**Or use Hostinger's SSL setup script:**
```bash
# If Hostinger provides a script for SSL setup
# Follow their instructions
```

---

## Step 8: Configure Backend to Work with Domain

**On your VPS:**

```bash
# Navigate to server directory
cd /var/www/server
# OR wherever your backend is located

# Edit .env file
nano .env
```

**Update these values:**
```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://studentitrack.org
```

**Restart backend:**
```bash
pm2 restart student-itrack-api
```

---

## Step 9: Configure Reverse Proxy (Backend API)

**In OpenLiteSpeed Web Admin:**

1. **Go to:** Virtual Hosts → `studentitrack.org` → Script Handler

2. **Add Script Handler:**
   - **Suffixes:** `*`
   - **Type:** `Proxy`
   - **Handler:** `http://127.0.0.1:5000`
   - Click **Save**

3. **Go to:** Rewrite tab

4. **Enable Rewrite:** Yes

5. **Add Rewrite Rule:**
   - **Rewrite Rule:** `^(.*)$`
   - **Action:** `http://127.0.0.1:5000$1`
   - **Flag:** `P,L`
   - Click **Save**

6. **Graceful Restart**

---

## Step 10: Test Everything

**On your VPS:**

```bash
# Test backend directly
curl http://localhost:5000/api/health

# Test via domain (HTTP)
curl http://studentitrack.org/api/health

# Test via domain (HTTPS)
curl https://studentitrack.org/api/health
```

**Expected response:**
```json
{"status":"ok","message":"Server is running"}
```

**In your browser:**
- Go to: `https://studentitrack.org/api/health`
- Should see the JSON response

---

## Step 11: Update Frontend Configuration

**On your local Windows machine:**

1. **Edit `client/.env.production`:**
   ```env
   VITE_API_URL=https://studentitrack.org/api
   ```

2. **Rebuild frontend:**
   ```powershell
   cd client
   npm run build
   ```

3. **Upload `dist` folder** to Hostinger shared hosting (if using shared hosting for frontend)

---

## Complete Setup Checklist

- [ ] VPS IP address noted
- [ ] DNS A records added in Hostinger (main domain + www)
- [ ] DNS propagated (checked with `dig`)
- [ ] Web directory created on VPS
- [ ] OpenLiteSpeed virtual host configured
- [ ] Domain accessible via HTTP
- [ ] SSL certificate obtained
- [ ] SSL configured in OpenLiteSpeed
- [ ] Backend .env updated with domain
- [ ] Reverse proxy configured in OpenLiteSpeed
- [ ] Backend tested via domain
- [ ] Frontend updated with new API URL

---

## Troubleshooting

### Domain Not Resolving

```bash
# Check DNS
dig studentitrack.org +short
# Should show your VPS IP

# If not, wait longer or check DNS settings in Hostinger
```

### 502 Bad Gateway

- **Check:** Is backend running? `pm2 status`
- **Check:** Is backend on port 5000? `netstat -tulpn | grep 5000`
- **Check:** Reverse proxy configuration in OpenLiteSpeed

### SSL Not Working

- **Check:** Certificate exists? `ls -la /etc/letsencrypt/live/studentitrack.org/`
- **Check:** OpenLiteSpeed SSL configuration
- **Check:** Port 443 is open: `ufw allow 443/tcp`

### Backend Not Accessible

- **Check:** Backend logs: `pm2 logs student-itrack-api`
- **Check:** CORS configuration in backend
- **Check:** `FRONTEND_URL` in `.env` matches domain

---

## Quick Reference Commands

```bash
# Check DNS
dig studentitrack.org +short

# Check backend status
pm2 status
pm2 logs student-itrack-api

# Test backend
curl http://localhost:5000/api/health
curl https://studentitrack.org/api/health

# Restart services
pm2 restart student-itrack-api
systemctl restart lsws

# Check OpenLiteSpeed status
systemctl status lsws
```

---

**Follow these steps in order, and your domain will be connected to your VPS! 🚀**


