# Fix: CORS Error - Vercel Frontend Can't Connect to Backend

## The Error

```
Access to fetch at 'https://studentitrack.org/api/...' from origin 'https://studentitrack.vercel.app' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

**This means:** Your backend is not allowing requests from your Vercel frontend.

---

## The Fix

### Step 1: Check Backend .env File

**On your VPS, check your `.env` file:**

```bash
cat /var/www/studentitrack/server/.env | grep FRONTEND_URL
```

**You should see:**
```
FRONTEND_URL=https://studentitrack.vercel.app
PRODUCTION_FRONTEND_URL=https://studentitrack.vercel.app
```

**If these are missing or wrong, fix them:**

```bash
nano /var/www/studentitrack/server/.env
```

**Make sure you have:**
```env
FRONTEND_URL=https://studentitrack.vercel.app
PRODUCTION_FRONTEND_URL=https://studentitrack.vercel.app
```

**Save:** `Ctrl + X`, then `Y`, then `Enter`

---

### Step 2: Restart Backend

**After fixing `.env`, restart the backend:**

```bash
pm2 restart student-itrack-api
```

**Verify it's running:**
```bash
pm2 status
```

---

### Step 3: Verify CORS Configuration

**The backend code already includes `https://studentitrack.vercel.app` in allowed origins, but it also uses `PRODUCTION_FRONTEND_URL` from `.env`.**

**Make sure both are set correctly in `.env`.**

---

### Step 4: Test Backend CORS

**Test if backend allows CORS:**

```bash
# Test with curl (simulating Vercel origin)
curl -H "Origin: https://studentitrack.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://studentitrack.org/api/health \
     -v
```

**You should see:**
```
Access-Control-Allow-Origin: https://studentitrack.vercel.app
```

**If you don't see this, CORS is not configured correctly.**

---

## Quick Fix Commands

**On your VPS:**

```bash
# 1. Check current .env values
cat /var/www/studentitrack/server/.env | grep FRONTEND_URL

# 2. Edit .env if needed
nano /var/www/studentitrack/server/.env
# Make sure you have:
# FRONTEND_URL=https://studentitrack.vercel.app
# PRODUCTION_FRONTEND_URL=https://studentitrack.vercel.app
# Save: Ctrl + X, Y, Enter

# 3. Restart backend
pm2 restart student-itrack-api

# 4. Check status
pm2 status

# 5. Test CORS
curl -H "Origin: https://studentitrack.vercel.app" \
     -X OPTIONS \
     https://studentitrack.org/api/health \
     -v
```

---

## Verify It's Fixed

**After fixing:**

1. **Open your Vercel site:** `https://studentitrack.vercel.app`
2. **Open browser console:** F12 → Console tab
3. **Try to log in**
4. **Check console:**
   - ✅ **Should NOT see:** CORS errors
   - ✅ **Should see:** API calls succeeding
   - ✅ **Should see:** Login working

---

## Common Issues

### Issue 1: .env Not Updated

**Problem:** `PRODUCTION_FRONTEND_URL` not set in `.env`

**Fix:** Add it to `.env` and restart backend

### Issue 2: Backend Not Restarted

**Problem:** Changed `.env` but didn't restart

**Fix:** `pm2 restart student-itrack-api`

### Issue 3: Wrong URL Format

**Problem:** URL has trailing slash or wrong format

**Fix:** Make sure it's exactly: `https://studentitrack.vercel.app` (no trailing slash)

### Issue 4: Domain Not Configured

**Problem:** Backend domain `https://studentitrack.org/api` not working

**Fix:** Configure OpenLiteSpeed reverse proxy (see hosting guides)

---

## Summary

1. ✅ **Check `.env` has:**
   ```
   FRONTEND_URL=https://studentitrack.vercel.app
   PRODUCTION_FRONTEND_URL=https://studentitrack.vercel.app
   ```

2. ✅ **Restart backend:**
   ```bash
   pm2 restart student-itrack-api
   ```

3. ✅ **Test your Vercel site** - CORS error should be gone!

---

**The most common issue is that `PRODUCTION_FRONTEND_URL` is not set in `.env` or the backend wasn't restarted after setting it!**

