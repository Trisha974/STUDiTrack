# How to Connect Backend to Vercel

## Overview

Your **frontend** is on Vercel, and your **backend** is on Hostinger VPS. You need to tell Vercel where your backend is located.

---

## Step 1: Find Your Backend URL

**Your backend URL depends on your configuration:**

### Option A: If Domain is Configured
```
https://studentitrack.org/api
```

### Option B: If Domain is NOT Configured
```
http://your-vps-ip:5000/api
```

**To find out which one:**
```bash
# On your VPS, test:
curl https://studentitrack.org/api/health
```

- ✅ **If it works:** Use `https://studentitrack.org/api`
- ❌ **If it fails:** Use `http://your-vps-ip:5000/api` (get IP with `hostname -I`)

---

## Step 2: Add Backend URL to Vercel

### 2.1: Go to Vercel Dashboard

1. **Open browser:** https://vercel.com/dashboard
2. **Sign in** with your account
3. **Select your project:** `studentitrack` (or your project name)

### 2.2: Go to Environment Variables

1. **Click "Settings"** (top menu)
2. **Click "Environment Variables"** (left sidebar)

### 2.3: Add VITE_API_URL

1. **Click "Add New"** button
2. **Fill in:**
   - **Key:** `VITE_API_URL`
   - **Value:** Your backend URL
     - If domain works: `https://studentitrack.org/api`
     - If domain doesn't work: `http://your-vps-ip:5000/api`
   - **Environment:** 
     - Select **Production** (required)
     - Select **Preview** (optional, for testing)
     - Select **Development** (optional, for local dev)
3. **Click "Save"**

---

## Step 3: Verify It's Added

**You should see:**
```
VITE_API_URL = https://studentitrack.org/api
```

**In the environment variables list.**

---

## Step 4: Redeploy Vercel

**⚠️ IMPORTANT:** Environment variables are only used during build. You MUST redeploy!

1. **Go to "Deployments" tab** (top menu)
2. **Find the latest deployment** (top of list)
3. **Click the three dots (⋯)** next to it
4. **Click "Redeploy"**
5. **Select "Use existing Build Cache"** (optional)
6. **Click "Redeploy"**
7. **Wait for deployment to complete** (watch the progress)

---

## Step 5: Test Connection

### 5.1: Test Backend Directly

**On your VPS:**
```bash
curl http://localhost:5000/api/health
```

**Expected:**
```json
{"status":"ok","message":"Server is running"}
```

### 5.2: Test from Browser

1. **Open your Vercel site:** `https://studentitrack.vercel.app`
2. **Open browser console:** Press `F12` → Console tab
3. **Try to log in**
4. **Check console for API calls:**
   - ✅ **Should see:** API calls to your backend URL
   - ❌ **Should NOT see:** `localhost:5000` errors
   - ❌ **Should NOT see:** CORS errors

---

## Visual Guide

### Vercel Dashboard Flow:

```
Vercel Dashboard
  └─ Your Project (studentitrack)
      └─ Settings
          └─ Environment Variables
              └─ Add New
                  └─ Key: VITE_API_URL
                  └─ Value: https://studentitrack.org/api
                  └─ Environment: Production
                  └─ Save
      └─ Deployments
          └─ Latest Deployment
              └─ ⋯ → Redeploy
```

---

## Troubleshooting

### Issue 1: Still Seeing localhost:5000 Errors

**Problem:** Frontend still trying to connect to localhost

**Fix:**
1. Verify `VITE_API_URL` is set in Vercel
2. Make sure it's set for **Production** environment
3. **Redeploy** (environment variables only work after redeploy)

### Issue 2: CORS Errors

**Problem:** Browser shows CORS error

**Fix:**
1. Check backend `.env` has:
   ```
   FRONTEND_URL=https://studentitrack.vercel.app
   PRODUCTION_FRONTEND_URL=https://studentitrack.vercel.app
   ```
2. Restart backend:
   ```bash
   pm2 restart student-itrack-api
   ```

### Issue 3: Connection Refused

**Problem:** Can't connect to backend

**Fix:**
1. Check backend is running: `pm2 status`
2. Test backend: `curl http://localhost:5000/api/health`
3. If using domain, test: `curl https://studentitrack.org/api/health`
4. If domain doesn't work, configure OpenLiteSpeed

### Issue 4: Wrong Backend URL

**Problem:** Using wrong URL in Vercel

**Fix:**
1. Test which URL works:
   - `curl https://studentitrack.org/api/health`
   - `curl http://your-vps-ip:5000/api/health`
2. Update `VITE_API_URL` in Vercel with the working URL
3. Redeploy

---

## Quick Checklist

- [ ] Backend is running on VPS (`pm2 status` shows "online")
- [ ] Backend responds: `curl http://localhost:5000/api/health` works
- [ ] Domain works (if using): `curl https://studentitrack.org/api/health` works
- [ ] `VITE_API_URL` added to Vercel
- [ ] `VITE_API_URL` set for Production environment
- [ ] Vercel frontend redeployed
- [ ] Frontend can connect (no CORS errors, no localhost errors)

---

## Summary

1. ✅ **Find backend URL:**
   - Domain: `https://studentitrack.org/api`
   - OR IP: `http://your-vps-ip:5000/api`

2. ✅ **Add to Vercel:**
   - Settings → Environment Variables
   - Add: `VITE_API_URL` = your backend URL
   - Set for Production

3. ✅ **Redeploy:**
   - Deployments → Latest → Redeploy

4. ✅ **Test:**
   - Open your site
   - Check browser console
   - Try to log in

---

## Example Configuration

**In Vercel Environment Variables:**

```
Key: VITE_API_URL
Value: https://studentitrack.org/api
Environment: Production, Preview
```

**After redeploy, your frontend will use this URL to connect to your backend!**

---

**That's it! Your frontend on Vercel will now connect to your backend on Hostinger VPS!**

