# Fix: Firebase API Key Not Valid Error

## The Problem

Error: `Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)`

This means the Firebase API key in your Vercel environment variables is incorrect or has formatting issues.

## Common Causes

1. **Extra quotes or spaces** in the API key value
2. **Wrong API key** (from different Firebase project)
3. **Incomplete API key** (copied partially)
4. **Not redeployed** after adding variables

## Step-by-Step Fix

### Step 1: Verify Your Firebase API Key

1. Go to **Firebase Console**: https://console.firebase.google.com/
2. Select your Firebase project
3. Click **⚙️ Settings** → **Project settings**
4. Scroll to **Your apps** → **Web app** (`</>` icon)
5. Find the `apiKey` value in the config code

**Example of what you should see:**
```javascript
apiKey: "AIzaSyAbc123def456ghi789jkl012mno345pqrstuvwxyz"
```

**Important:**
- The API key should start with `AIzaSy`
- It should be about 39 characters long
- It should NOT have quotes when you copy it to Vercel

### Step 2: Check Vercel Environment Variable

1. Go to **Vercel Dashboard** → Your project → **Settings** → **Environment Variables**
2. Find `VITE_FIREBASE_API_KEY`
3. Click to edit it
4. Check the value:

**❌ WRONG (has quotes):**
```
"AIzaSyAbc123def456ghi789jkl012mno345pq"
```

**❌ WRONG (has spaces):**
```
 AIzaSyAbc123def456ghi789jkl012mno345pq 
```

**✅ CORRECT (no quotes, no spaces):**
```
AIzaSyAbc123def456ghi789jkl012mno345pq
```

### Step 3: Fix the API Key

1. **Delete the current value** in Vercel
2. **Go back to Firebase Console**
3. **Copy the `apiKey` value** (just the value, no quotes)
4. **Paste it into Vercel** (make sure no quotes or spaces)
5. **Save** the variable
6. **Verify all other variables** are also correct (no quotes)

### Step 4: Verify All Variables Are Correct

Check each variable has:
- ✅ No quotes around the value
- ✅ No leading/trailing spaces
- ✅ Correct value from Firebase Console
- ✅ Set for Production environment (at minimum)

### Step 5: Redeploy

**CRITICAL:** You MUST redeploy after fixing the API key:

1. Go to **Deployments** tab
2. Find the **latest deployment**
3. Click **⋯** (three dots) → **Redeploy**
4. Wait for deployment to complete
5. Refresh your website

### Step 6: Verify It Works

1. Open your website
2. Press **F12** → **Console** tab
3. Look for: `✅ Firebase initialized successfully`
4. Try to login
5. The error should be gone

## Still Not Working?

### Check Browser Console

1. Press **F12** → **Console** tab
2. Look for any errors
3. Check if the API key value is being read correctly

### Verify API Key Format

A valid Firebase API key:
- Starts with `AIzaSy`
- Is about 39 characters long
- Contains only letters, numbers, and some special characters
- Has NO quotes, NO spaces

### Double-Check Firebase Project

Make sure you're using the API key from the **correct Firebase project**:
- The project ID should match `VITE_FIREBASE_PROJECT_ID`
- All values should be from the same Firebase project

### Common Mistakes

1. **Copying the entire config object** instead of just the value
2. **Including quotes** when copying
3. **Using API key from wrong project**
4. **Not redeploying** after fixing
5. **Extra spaces** before/after the value

## Quick Checklist

- [ ] API key copied from Firebase Console (just the value, no quotes)
- [ ] No quotes in Vercel environment variable
- [ ] No spaces before/after the value
- [ ] API key starts with `AIzaSy`
- [ ] All 6 Firebase variables are set correctly
- [ ] Variables set for Production environment
- [ ] Redeployed after fixing
- [ ] Checked browser console for errors

## Example: Correct vs Incorrect

**❌ INCORRECT:**
```
VITE_FIREBASE_API_KEY = "AIzaSyAbc123..."
VITE_FIREBASE_API_KEY =  AIzaSyAbc123... 
VITE_FIREBASE_API_KEY = AIzaSyAbc123... 
```

**✅ CORRECT:**
```
VITE_FIREBASE_API_KEY = AIzaSyAbc123def456ghi789jkl012mno345pq
```

## Need More Help?

If the error persists:
1. Check browser console (F12) for specific error messages
2. Verify all 6 Firebase variables are from the same project
3. Try creating a new Firebase project and using those values
4. Make sure you're using the Web app config, not iOS/Android

