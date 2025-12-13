# Fix: studentitrack.org SSL Certificate Error

## Current Configuration

**Your VITE_API_URL:** `https://studentitrack.org/api`

**Problem:** SSL certificate is invalid or not set up, causing `ERR_CERT_AUTHORITY_INVALID` error.

---

## Solution: Change to HTTP (Quick Fix)

**Since SSL isn't set up yet, change from `https` to `http`.**

---

## Step 1: Test Backend with HTTP

**First, test if your backend is accessible via HTTP:**

```bash
# On your VPS
curl http://studentitrack.org/api/health
```

**If it works, you'll see:**
```json
{"status":"ok","message":"Server is running"}
```

**If it doesn't work, test with your VPS IP:**
```bash
# Get your VPS IP
curl ifconfig.me

# Test with IP
curl http://YOUR_VPS_IP:5000/api/health
```

---

## Step 2: Update Vercel Environment Variable

**Change `VITE_API_URL` from `https` to `http`:**

1. **Go to:** https://vercel.com/dashboard
2. **Select project:** `studentitrack`
3. **Go to:** Settings → Environment Variables
4. **Find:** `VITE_API_URL`
5. **Current value:** `https://studentitrack.org/api`
6. **Change to:** `http://studentitrack.org/api` (change `https` to `http`)
7. **Save** the environment variable
8. **Vercel will automatically redeploy**

---

## Step 3: Verify Domain Points to VPS

**Make sure `studentitrack.org` domain points to your VPS:**

**Check DNS settings:**
- Go to your domain registrar (where you bought `studentitrack.org`)
- Check DNS records
- Make sure there's an **A record** pointing to your VPS IP:
  - **Type:** A
  - **Name:** `@` or `studentitrack.org`
  - **Value:** `YOUR_VPS_IP` (e.g., `123.456.789.012`)

**If domain doesn't point to VPS:**
- Update DNS A record to point to your VPS IP
- Wait for DNS propagation (can take a few minutes to 24 hours)

---

## Step 4: Check Backend is Running

**Make sure backend is running and accessible:**

```bash
# On VPS, check PM2 status
pm2 status

# Check if port 5000 is listening
netstat -tlnp | grep 5000

# Test locally
curl http://localhost:5000/api/health
```

**Should show:**
```json
{"status":"ok","message":"Server is running"}
```

---

## Step 5: Check Firewall

**Make sure port 5000 is open:**

```bash
# On VPS
ufw allow 5000

# Or check firewall status
ufw status
```

**If using Hostinger firewall:**
- Go to Hostinger control panel
- Check firewall settings
- Allow port 5000

---

## Step 6: Test from Frontend

**After Vercel redeploys:**

1. **Go to:** `https://studentitrack.vercel.app/login`
2. **Try logging in**
3. **Check browser console (F12)** for errors
4. **Should no longer see SSL certificate error**

---

## If Domain Doesn't Work

**If `http://studentitrack.org/api` doesn't work:**

**Option 1: Use VPS IP directly:**
1. **Get your VPS IP:**
   ```bash
   curl ifconfig.me
   ```
2. **Update Vercel `VITE_API_URL` to:**
   - `http://YOUR_VPS_IP:5000/api`
   - Example: `http://123.456.789.012:5000/api`

**Option 2: Fix DNS:**
- Make sure DNS A record points to your VPS IP
- Wait for DNS propagation

---

## For Production (Set Up SSL Later)

**Once everything works with HTTP, you can set up SSL:**

### Option 1: Use Let's Encrypt (Free SSL)

```bash
# On VPS
apt-get update
apt-get install -y certbot

# Get SSL certificate
certbot certonly --standalone -d studentitrack.org

# This creates certificates in /etc/letsencrypt/live/studentitrack.org/
```

**Then configure reverse proxy (Nginx/Apache) to use SSL.**

### Option 2: Use Hostinger SSL

- Check Hostinger control panel for SSL certificate options
- They might provide free SSL certificates

### Option 3: Use Cloudflare (Free SSL)

- Add your domain to Cloudflare
- Enable SSL/TLS
- Cloudflare provides free SSL certificates

**After SSL is set up:**
- Update `VITE_API_URL` back to `https://studentitrack.org/api`

---

## Quick Fix Checklist

1. ✅ **Test backend:** `curl http://studentitrack.org/api/health`
2. ✅ **If domain doesn't work, test with IP:** `curl http://YOUR_VPS_IP:5000/api/health`
3. ✅ **Update Vercel `VITE_API_URL`:** Change `https://studentitrack.org/api` to `http://studentitrack.org/api`
4. ✅ **Check DNS:** Make sure domain points to VPS IP
5. ✅ **Check firewall:** `ufw allow 5000`
6. ✅ **Check backend is running:** `pm2 status`
7. ✅ **Redeploy frontend** (automatic when saving env var)
8. ✅ **Test login from frontend**

---

## Common Issues

### Issue 1: Domain Not Resolving

**Error:** Can't connect to `http://studentitrack.org`

**Solution:**
- Check DNS A record points to VPS IP
- Wait for DNS propagation
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

**Change `VITE_API_URL` from `https://studentitrack.org/api` to `http://studentitrack.org/api` in Vercel!**

