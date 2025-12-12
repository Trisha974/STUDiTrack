# Troubleshooting Blank Page Issue

## Quick Diagnosis Steps

### Step 1: Check Browser Console

1. Open your deployed website
2. Press **F12** (or right-click → Inspect)
3. Go to **Console** tab
4. Look for errors

**Common Errors You Might See:**

#### Error: "❌ Missing Firebase environment variables"
**Solution:** Add Firebase environment variables in Vercel (see below)

#### Error: "Firebase initialization failed"
**Solution:** Check Firebase config values are correct

#### Error: "Cannot read property of undefined"
**Solution:** Missing environment variable or incorrect value

#### Error: "Failed to fetch" or Network errors
**Solution:** Backend API URL might be incorrect

### Step 2: Check Network Tab

1. Press **F12** → **Network** tab
2. Refresh the page
3. Look for failed requests (red status codes)

**What to Check:**
- Are JavaScript files loading? (should be status 200)
- Are there 404 errors? (missing files)
- Are there 500 errors? (server issues)

### Step 3: Verify Environment Variables in Vercel

**Critical:** The blank page is almost always caused by missing Firebase environment variables.

## Complete Fix: Add Environment Variables

### Required Variables (ALL MUST BE SET):

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID (optional)
VITE_API_URL (your backend URL)
```

### Step-by-Step Fix:

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select **studentitrack** project

2. **Add Environment Variables:**
   - Click **Settings** → **Environment Variables**
   - Click **Add New** for each variable below

3. **Get Firebase Values:**
   - Go to https://console.firebase.google.com/
   - Select your project
   - Click ⚙️ → **Project settings**
   - Scroll to **Your apps** → Web app
   - Copy values from the config code

4. **Add Each Variable:**

   **Variable 1:**
   - Key: `VITE_FIREBASE_API_KEY`
   - Value: Copy `apiKey` value from Firebase
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Save

   **Variable 2:**
   - Key: `VITE_FIREBASE_AUTH_DOMAIN`
   - Value: Copy `authDomain` value from Firebase
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Save

   **Variable 3:**
   - Key: `VITE_FIREBASE_PROJECT_ID`
   - Value: Copy `projectId` value from Firebase
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Save

   **Variable 4:**
   - Key: `VITE_FIREBASE_STORAGE_BUCKET`
   - Value: Copy `storageBucket` value from Firebase
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Save

   **Variable 5:**
   - Key: `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - Value: Copy `messagingSenderId` value from Firebase
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Save

   **Variable 6:**
   - Key: `VITE_FIREBASE_APP_ID`
   - Value: Copy `appId` value from Firebase
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Save

   **Variable 7 (Optional):**
   - Key: `VITE_FIREBASE_MEASUREMENT_ID`
   - Value: Copy `measurementId` value from Firebase (if available)
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Save

   **Variable 8:**
   - Key: `VITE_API_URL`
   - Value: Your backend API URL (e.g., `https://api.yourdomain.com/api` or `http://localhost:5000/api` for dev)
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Save

5. **Redeploy (CRITICAL):**
   - Go to **Deployments** tab
   - Click three dots (⋯) on latest deployment
   - Click **Redeploy**
   - Wait for deployment to complete

6. **Verify:**
   - Open your website
   - Press F12 → Console
   - Should see: "✅ Firebase initialized successfully"
   - Page should load normally

## Alternative: Quick Test Without Backend

If you just want to test if the frontend works, you can temporarily set:

```
VITE_API_URL=http://localhost:5000/api
```

This will allow the frontend to load (though API calls will fail until backend is set up).

## Still Not Working?

### Check These:

1. **All variables start with `VITE_`?**
   - ✅ Correct: `VITE_FIREBASE_API_KEY`
   - ❌ Wrong: `FIREBASE_API_KEY`

2. **Variables set for Production environment?**
   - Check the environment dropdown when adding variables
   - Must select at least "Production"

3. **Did you redeploy after adding variables?**
   - Variables are only used during build
   - Must redeploy for changes to take effect

4. **Check build logs in Vercel:**
   - Go to Deployments → Click on deployment → View build logs
   - Look for any errors during build

5. **Check browser console for specific errors:**
   - F12 → Console tab
   - Copy any error messages
   - These will tell you exactly what's missing

## Emergency Fallback: Add Error Display

If you want to see what's wrong on the page itself, we can add error display code. But the most likely issue is missing environment variables.

## Summary

**99% of blank page issues are caused by:**
1. Missing Firebase environment variables in Vercel
2. Not redeploying after adding variables
3. Variables set for wrong environment

**Fix:**
1. Add all 7-8 Firebase variables in Vercel
2. Set them for Production environment
3. Redeploy the application
4. Check browser console for "✅ Firebase initialized successfully"

