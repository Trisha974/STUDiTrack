# URGENT: Replace Placeholder API Key with Real Firebase Key

## The Problem

Your error shows the API key being used is:
```
AIzaSyAbc123def456ghi789jkl012mno345pq
```

This is a **PLACEHOLDER/EXAMPLE** value, not a real Firebase API key!

## Why This Happened

You likely copied an example value from documentation instead of getting the actual value from your Firebase project.

## Solution: Get Your REAL Firebase API Key

### Step 1: Go to Firebase Console

1. Go to: https://console.firebase.google.com/
2. Sign in with your Google account
3. **Select your Firebase project** (or create one if you don't have one)

### Step 2: Get Your Real API Key

1. In Firebase Console, click the **⚙️ gear icon** (top left)
2. Select **Project settings**
3. Scroll down to **"Your apps"** section
4. Look for a **Web app** (indicated by `</>` icon)
5. If you don't have a web app:
   - Click **"Add app"** button
   - Select **Web** (`</>` icon)
   - Register your app with nickname: "STUDiTrack Web"
   - Click **Register app**

6. You'll see a code snippet like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-real-project.firebaseapp.com",
  projectId: "your-real-project-id",
  storageBucket: "your-real-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-XXXXXXXXXX"
};
```

### Step 3: Copy the REAL Values

**Important:** Copy the ACTUAL values from YOUR Firebase project, not examples!

The `apiKey` should be a long string that:
- Starts with `AIzaSy`
- Is about 39 characters long
- Is unique to YOUR Firebase project
- Will be DIFFERENT from `AIzaSyAbc123def456ghi789jkl012mno345pq`

### Step 4: Update Vercel Environment Variables

1. Go to **Vercel** → Your project → **Settings** → **Environment Variables**

2. For **EACH** of the 6 variables, click **Edit**:

   **VITE_FIREBASE_API_KEY:**
   - Delete the placeholder value: `AIzaSyAbc123def456ghi789jkl012mno345pq`
   - Paste your REAL API key from Firebase Console
   - Make sure NO quotes, NO spaces
   - Save

   **VITE_FIREBASE_AUTH_DOMAIN:**
   - Should be: `your-real-project.firebaseapp.com`
   - NOT: `studentitrack-12345.firebaseapp.com` (unless that's your real project)

   **VITE_FIREBASE_PROJECT_ID:**
   - Should be your REAL project ID from Firebase
   - NOT: `studentitrack-12345` (unless that's your real project)

   **VITE_FIREBASE_STORAGE_BUCKET:**
   - Should be: `your-real-project.appspot.com`
   - NOT: `studentitrack-12345.appspot.com` (unless that's your real project)

   **VITE_FIREBASE_MESSAGING_SENDER_ID:**
   - Should be your REAL sender ID (12-digit number)
   - NOT: `123456789012` (that's an example)

   **VITE_FIREBASE_APP_ID:**
   - Should be your REAL app ID
   - Format: `1:numbers:web:alphanumeric`
   - NOT: `1:123456789012:web:abc123def456ghi789` (that's an example)

### Step 5: Verify All Values Are Real

**Check each value:**
- ✅ Does it come from YOUR Firebase Console?
- ✅ Is it different from example/placeholder values?
- ✅ Does it match the values in your Firebase project settings?

**Common placeholders to avoid:**
- ❌ `AIzaSyAbc123def456ghi789jkl012mno345pq` (example API key)
- ❌ `studentitrack-12345` (example project ID)
- ❌ `123456789012` (example sender ID)
- ❌ `1:123456789012:web:abc123def456ghi789` (example app ID)

### Step 6: Redeploy

**CRITICAL:** After updating all values:

1. Go to **Deployments** tab
2. Find **latest deployment**
3. Click **⋯** → **Redeploy**
4. Wait for deployment to complete
5. Test your website

## How to Know If You Have the Right Values

### Real API Key:
- ✅ Unique to your Firebase project
- ✅ About 39 characters
- ✅ Starts with `AIzaSy`
- ✅ Different from any examples you've seen

### Real Project ID:
- ✅ Matches your Firebase project name
- ✅ Usually lowercase with hyphens
- ✅ You can see it in Firebase Console URL

### Real App ID:
- ✅ Format: `1:numbers:web:longalphanumericstring`
- ✅ Unique to your web app
- ✅ Different from examples

## Still Getting Errors?

If after updating with real values you still get errors:

1. **Verify you're using the correct Firebase project:**
   - All 6 values must be from the SAME Firebase project
   - Check Firebase Console → Project Settings → Your apps → Web app

2. **Check for typos:**
   - Copy values directly from Firebase Console
   - Don't type them manually
   - Double-check each value

3. **Verify no extra characters:**
   - No quotes around values
   - No spaces before/after
   - No line breaks

4. **Check Firebase project status:**
   - Make sure your Firebase project is active
   - Check if there are any billing/quota issues
   - Verify the project has Firebase Authentication enabled

## Summary

**The issue:** You're using placeholder/example values instead of real Firebase values.

**The fix:**
1. Get REAL values from YOUR Firebase Console
2. Replace ALL placeholder values in Vercel
3. Redeploy
4. Test

Your API key should be unique to your Firebase project, not an example value!

