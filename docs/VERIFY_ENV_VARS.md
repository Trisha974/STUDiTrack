# Verify Environment Variables Are Working

## The Problem

Even after adding environment variables in Vercel, you're still seeing:
- "Firebase: Error (auth/api-key-not-valid)"
- Configuration errors

This usually means the deployment hasn't picked up the new variables yet.

## Solution: Verify and Redeploy

### Step 1: Verify Variables Are Saved

1. Go to Vercel → Settings → Environment Variables
2. Check that all 6 variables are listed:
   - ✅ VITE_FIREBASE_API_KEY
   - ✅ VITE_FIREBASE_AUTH_DOMAIN
   - ✅ VITE_FIREBASE_PROJECT_ID
   - ✅ VITE_FIREBASE_STORAGE_BUCKET
   - ✅ VITE_FIREBASE_MESSAGING_SENDER_ID
   - ✅ VITE_FIREBASE_APP_ID

3. For each variable, click the eye icon or edit to verify:
   - Value has NO quotes
   - Value has NO spaces
   - Value is complete (not truncated)

### Step 2: Verify API Key Specifically

1. Click on `VITE_FIREBASE_API_KEY` → Edit or View
2. Check the value:
   - ✅ Starts with `AIzaSy`
   - ✅ About 39 characters long
   - ✅ NO quotes: `"AIzaSy..."` ❌ vs `AIzaSy...` ✅
   - ✅ NO spaces before/after
   - ✅ Matches the value from Firebase Console exactly

3. If it has quotes or spaces:
   - Edit the value
   - Remove quotes/spaces
   - Save
   - **Redeploy**

### Step 3: Verify All Values Match Firebase

1. Go to Firebase Console → Project Settings → Your apps → Web app
2. Compare each value:

   | Vercel Variable | Firebase Config | Should Match? |
   |----------------|-----------------|---------------|
   | VITE_FIREBASE_API_KEY | `apiKey` | ✅ Exactly |
   | VITE_FIREBASE_AUTH_DOMAIN | `authDomain` | ✅ Exactly |
   | VITE_FIREBASE_PROJECT_ID | `projectId` | ✅ Exactly |
   | VITE_FIREBASE_STORAGE_BUCKET | `storageBucket` | ✅ Exactly |
   | VITE_FIREBASE_MESSAGING_SENDER_ID | `messagingSenderId` | ✅ Exactly |
   | VITE_FIREBASE_APP_ID | `appId` | ✅ Exactly |

### Step 4: Redeploy (CRITICAL)

**Important:** Environment variables are only used during the BUILD process. You MUST redeploy:

**Option A: Redeploy Latest**
1. Go to **Deployments** tab
2. Find the **most recent** deployment (should be at the top)
3. Click **⋯** (three dots) → **Redeploy**
4. Select **Production** environment
5. Click **Redeploy**
6. Wait for deployment to complete (watch the build logs)

**Option B: Trigger New Deployment**
1. Make a small change to any file (or just add a comment)
2. Commit and push:
   ```bash
   git add .
   git commit -m "Trigger redeploy with environment variables"
   git push studentitrack main
   ```
3. Vercel will automatically deploy with new variables

### Step 5: Verify Deployment Used Variables

After redeployment:

1. Go to **Deployments** → Click on the new deployment
2. Click **Build Logs** or **View Build**
3. Look for:
   - ✅ Build completed successfully
   - ✅ No errors about missing environment variables
   - ✅ Firebase initialized (if logged)

### Step 6: Test the Website

1. Open your website: `studentitrack.vercel.app`
2. Press **F12** → **Console** tab
3. Look for:
   - ✅ `✅ Firebase initialized successfully`
   - ❌ `❌ Missing Firebase environment variables` (should NOT see this)
   - ❌ `auth/api-key-not-valid` (should NOT see this)

4. If you still see errors:
   - Check the console for specific error messages
   - Verify the API key value again
   - Make sure you redeployed AFTER adding variables

## Common Issues

### Issue 1: "Still seeing API key error after redeploy"

**Possible causes:**
- API key has quotes: `"AIzaSy..."` → Remove quotes
- API key has spaces: ` AIzaSy... ` → Remove spaces
- Wrong API key (from different Firebase project)
- Didn't actually redeploy (just saved variables)

**Fix:**
1. Edit `VITE_FIREBASE_API_KEY` in Vercel
2. Copy the EXACT value from Firebase Console (no quotes, no spaces)
3. Paste and save
4. **Redeploy** (this is critical!)

### Issue 2: "Variables saved but not working"

**Cause:** Variables are saved but deployment hasn't run yet.

**Fix:**
- You MUST redeploy after adding/changing variables
- Variables are embedded at build time, not runtime
- Saving variables doesn't automatically redeploy

### Issue 3: "Different error after redeploy"

**Check browser console (F12):**
- What's the exact error message?
- Is Firebase initializing?
- Are all variables being read?

## Quick Checklist

Before redeploying, verify:
- [ ] All 6 Firebase variables are saved in Vercel
- [ ] Each variable has NO quotes around the value
- [ ] Each variable has NO spaces before/after
- [ ] All variables set for Production environment (at minimum)
- [ ] Values match Firebase Console exactly
- [ ] You're about to redeploy (not just saved variables)

After redeploying, verify:
- [ ] Deployment completed successfully
- [ ] Website loads without configuration error
- [ ] Browser console shows "✅ Firebase initialized successfully"
- [ ] Can attempt to login (even if credentials are wrong, the error should be different)

## Still Not Working?

If after redeploying you still see the API key error:

1. **Double-check the API key value:**
   - Go to Firebase Console
   - Copy the `apiKey` value fresh
   - Edit `VITE_FIREBASE_API_KEY` in Vercel
   - Paste the value (no quotes, no spaces)
   - Save

2. **Verify it's the correct Firebase project:**
   - Make sure `VITE_FIREBASE_PROJECT_ID` matches the project you're copying from
   - All 6 values should be from the SAME Firebase project

3. **Check build logs:**
   - Go to Deployments → Latest deployment → Build Logs
   - Look for any errors during build
   - Check if environment variables are being read

4. **Try a fresh deployment:**
   - Make a small code change
   - Commit and push
   - This forces a completely new build with fresh environment variables

