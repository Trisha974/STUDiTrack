# URGENT: Fix CORS Error - Step by Step

## The Problem

Your frontend at `https://studentitrack.vercel.app` can't connect to backend at `https://studentitrack.org/api` because of CORS error.

---

## Quick Fix (Do This Now)

### Step 1: Pull the Fix

**On your VPS:**
```bash
cd /var/www/studentitrack/server
git pull origin main
```

---

### Step 2: Verify .env File

**Check your `.env` file has the Vercel URL:**
```bash
cat .env | grep FRONTEND_URL
```

**Should show:**
```
FRONTEND_URL=https://studentitrack.vercel.app
PRODUCTION_FRONTEND_URL=https://studentitrack.vercel.app
```

**If missing, add it:**
```bash
nano .env
```

**Add these lines:**
```env
FRONTEND_URL=https://studentitrack.vercel.app
PRODUCTION_FRONTEND_URL=https://studentitrack.vercel.app
```

**Save:** `Ctrl + X`, then `Y`, then `Enter`

---

### Step 3: Restart Backend

```bash
pm2 restart student-itrack-api
pm2 status
```

---

### Step 4: Check Backend Logs

**View logs to see if CORS is working:**
```bash
pm2 logs student-itrack-api --lines 20
```

**You should see:**
```
✅ CORS: Allowing origin: https://studentitrack.vercel.app
```

**If you see:**
```
🚨 CORS blocked origin: https://studentitrack.vercel.app
```

**Then check the allowed origins list in the logs.**

---

### Step 5: Test Your Site

1. **Open:** `https://studentitrack.vercel.app`
2. **Open console:** F12 → Console tab
3. **Try to log in**
4. **Check:** CORS errors should be gone!

---

## Complete Command Sequence

```bash
# 1. Pull the fix
cd /var/www/studentitrack/server
git pull origin main

# 2. Check .env
cat .env | grep FRONTEND_URL

# 3. If missing, add it
nano .env
# Add: PRODUCTION_FRONTEND_URL=https://studentitrack.vercel.app
# Save: Ctrl + X, Y, Enter

# 4. Restart
pm2 restart student-itrack-api

# 5. Check logs
pm2 logs student-itrack-api --lines 20

# 6. Test backend
curl http://localhost:5000/api/health
```

---

## What Was Fixed

1. ✅ Added `https://studentitrack.vercel.app` hardcoded to allowed origins
2. ✅ Improved CORS logging to show what origins are allowed
3. ✅ Made sure CORS checks work correctly

---

## After Fixing

**Test your site:**
- Open: `https://studentitrack.vercel.app`
- Try to log in
- Should work without CORS errors!

---

**Pull the fix, verify .env, restart backend, and test!**

