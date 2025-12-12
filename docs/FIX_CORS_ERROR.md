# Fix: CORS Error - Cannot Connect to Backend

## The Problem

You're seeing errors like:
```
Access to fetch at 'http://localhost:5000/api/...' from origin 'https://studentitrack.vercel.app' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**What this means:**
- Your frontend (deployed on Vercel) is trying to connect to `http://localhost:5000`
- `localhost:5000` only works on your local computer, not in production
- The browser blocks this connection for security reasons (CORS)

## Root Cause

The app is using the default API URL (`http://localhost:5000`) because `VITE_API_URL` is not set in Vercel environment variables.

## Solution: Set Backend API URL in Vercel

### Step 1: Find Your Backend URL

You need to know where your backend server is hosted:

**Option A: Backend on Hostinger/VPS**
- Your backend URL might be: `https://your-domain.com` or `https://api.your-domain.com`
- The API endpoint would be: `https://your-domain.com/api` or `https://api.your-domain.com/api`

**Option B: Backend on Railway/Render/Heroku**
- Your backend URL would be something like: `https://your-app.railway.app` or `https://your-app.onrender.com`
- The API endpoint would be: `https://your-app.railway.app/api`

**Option C: Backend on Same Domain**
- If your backend is on the same domain as frontend: `https://studentitrack.vercel.app/api`
- (Note: Vercel doesn't support backend servers directly - you'd need a separate service)

### Step 2: Add VITE_API_URL to Vercel

1. Go to **Vercel Dashboard** → Your project → **Settings** → **Environment Variables**

2. Click **Add New**

3. Enter:
   - **Key**: `VITE_API_URL`
   - **Value**: Your backend API URL (e.g., `https://api.studentitrack.com/api`)
   - **Environment**: Select **Production** (and **Preview** if you want)

4. Click **Save**

**Important:** 
- The value should be the **full URL** including `https://` and `/api` at the end
- No trailing slash after `/api`
- No quotes around the value

**Examples:**
```
✅ CORRECT:
VITE_API_URL=https://api.studentitrack.com/api

❌ WRONG:
VITE_API_URL="https://api.studentitrack.com/api"  (no quotes)
VITE_API_URL=https://api.studentitrack.com/api/  (no trailing slash)
VITE_API_URL=api.studentitrack.com/api            (missing https://)
```

### Step 3: Update Backend CORS Configuration

Your backend server needs to allow requests from your Vercel frontend.

**If your backend is on Hostinger/VPS:**

1. SSH into your server or access your backend code
2. Find the CORS configuration (usually in `server/src/server.js`)
3. Make sure it includes your Vercel URL:

```javascript
const allowedOrigins = [
  'https://studentitrack.vercel.app',
  'https://your-custom-domain.com',  // if you have one
  // ... other origins
]
```

**If your backend is on Railway/Render:**

1. Go to your backend project settings
2. Add environment variable:
   ```
   PRODUCTION_FRONTEND_URL=https://studentitrack.vercel.app
   ```
3. Restart your backend server

### Step 4: Redeploy

**CRITICAL:** After adding `VITE_API_URL` in Vercel:

1. Go to **Deployments** tab
2. Find **latest deployment**
3. Click **⋯** → **Redeploy**
4. Wait for deployment to complete
5. Test your website

### Step 5: Verify It's Working

1. Open your website: `https://studentitrack.vercel.app`
2. Press **F12** → **Console** tab
3. Try to log in
4. Check for errors:
   - ✅ **Should see**: API calls to your backend URL (not localhost)
   - ❌ **Should NOT see**: CORS errors or `localhost:5000` in the console

## Troubleshooting

### Still Seeing CORS Errors?

1. **Verify `VITE_API_URL` is set correctly:**
   - Go to Vercel → Settings → Environment Variables
   - Check that `VITE_API_URL` exists and has the correct value
   - Make sure it's set for **Production** environment

2. **Check backend CORS configuration:**
   - Make sure your backend allows `https://studentitrack.vercel.app`
   - Check backend logs for CORS errors

3. **Verify backend is accessible:**
   - Try opening `https://your-backend-url.com/api/health` (or similar endpoint) in a browser
   - Should return a response (not 404 or connection error)

4. **Check network tab:**
   - Press F12 → Network tab
   - Try to log in
   - Look at the failed requests:
     - If it's still trying `localhost:5000` → `VITE_API_URL` not set or not redeployed
     - If it's trying your backend URL but getting CORS → Backend CORS not configured
     - If it's getting 404 → Backend URL is wrong

### Backend Not Deployed Yet?

If you don't have a backend server deployed yet, you have two options:

**Option 1: Deploy Backend First**
1. Deploy your backend to Hostinger, Railway, Render, or similar
2. Get the backend URL
3. Set `VITE_API_URL` in Vercel to point to that URL
4. Redeploy frontend

**Option 2: Use Local Backend (Development Only)**
- This only works for local development
- For production, you MUST deploy the backend separately

## Summary

**The Issue:** Frontend trying to connect to `localhost:5000` which doesn't exist in production.

**The Fix:**
1. Set `VITE_API_URL` in Vercel to your actual backend URL
2. Update backend CORS to allow Vercel frontend
3. Redeploy both frontend and backend
4. Test

**Remember:** Environment variables are embedded at build time, so you MUST redeploy after adding/changing them!

