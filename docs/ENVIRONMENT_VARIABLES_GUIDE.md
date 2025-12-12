# Environment Variables Guide - Complete Explanation

## What Are Environment Variables?

Environment variables are configuration values that are stored outside of your code. They allow you to:

- **Keep sensitive data secure** (API keys, secrets) - not committed to git
- **Configure different settings** for development, staging, and production
- **Change settings without modifying code** - no need to rebuild for config changes
- **Share the same codebase** across different environments

Think of them as "settings" that your application reads when it starts.

## Why Do We Need Environment Variables?

### Security Reasons

Your Firebase configuration contains sensitive information:
- **API Keys**: Used to authenticate with Firebase services
- **Project IDs**: Identifies your Firebase project
- **Storage Buckets**: Points to your file storage location

If these were hardcoded in your source code:
- ❌ They would be visible in GitHub (anyone could see them)
- ❌ They could be stolen and used maliciously
- ❌ You couldn't use different configs for dev/prod

### Flexibility Reasons

- **Development**: Use a test Firebase project
- **Production**: Use your real Firebase project
- **Different developers**: Each can use their own Firebase config
- **Easy updates**: Change config without touching code

## How Environment Variables Work in Vite

### Naming Convention

Vite **only exposes** environment variables that start with `VITE_`:

✅ **Works:**
```
VITE_FIREBASE_API_KEY=abc123
VITE_API_URL=https://api.example.com
```

❌ **Won't work:**
```
FIREBASE_API_KEY=abc123  (missing VITE_ prefix)
API_URL=https://api.example.com  (missing VITE_ prefix)
```

### How to Access in Code

In your JavaScript/React code:
```javascript
// ✅ Correct way
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
const apiUrl = import.meta.env.VITE_API_URL

// ❌ Wrong way (won't work)
const apiKey = process.env.VITE_FIREBASE_API_KEY  // process.env is for Node.js, not browser
```

### Build-Time vs Runtime

**Important**: Vite environment variables are **embedded at build time**, not runtime:

1. When you run `npm run build`, Vite reads your `.env` file
2. It replaces `import.meta.env.VITE_*` with actual values
3. The values are "baked into" the JavaScript bundle
4. After build, you can't change them without rebuilding

This is why you need to **redeploy** after changing environment variables in Vercel.

## Setting Up Environment Variables in Vercel

### Step-by-Step Instructions

#### 1. Access Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Sign in with your account
3. You'll see a list of your projects

#### 2. Select Your Project

1. Find and click on **studentitrack** project
2. You'll be taken to the project overview page

#### 3. Navigate to Settings

1. Click on **Settings** tab (top navigation bar)
2. In the left sidebar, click **Environment Variables**

#### 4. Understanding Environment Scopes

Vercel allows you to set variables for different environments:

- **Production**: Used when deploying to your main domain (studentitrack.vercel.app)
- **Preview**: Used for pull request previews and branch deployments
- **Development**: Used when running `vercel dev` locally

**Recommendation**: Set variables for **all three environments** so your app works everywhere.

#### 5. Adding Environment Variables

For each variable, follow these steps:

**Example: Adding VITE_FIREBASE_API_KEY**

1. Click **Add New** button
2. In the **Key** field, enter: `VITE_FIREBASE_API_KEY`
3. In the **Value** field, paste your actual Firebase API key
4. Select the environments:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
5. Click **Save**

**Repeat for all required variables:**

| Key | Description | Example Value |
|-----|-------------|---------------|
| `VITE_FIREBASE_API_KEY` | Firebase API key for authentication | `AIzaSyAbc123...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase authentication domain | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Your Firebase project identifier | `studentitrack-12345` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket URL | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | `123456789012` |
| `VITE_FIREBASE_APP_ID` | Firebase application ID | `1:123456789012:web:abc123def456` |
| `VITE_FIREBASE_MEASUREMENT_ID` | Google Analytics measurement ID (optional) | `G-XXXXXXXXXX` |
| `VITE_API_URL` | Your backend API URL | `https://api.yourdomain.com/api` |

#### 6. Verifying Variables Are Set

After adding all variables, you should see them listed:

```
VITE_FIREBASE_API_KEY          [Production, Preview, Development]
VITE_FIREBASE_AUTH_DOMAIN      [Production, Preview, Development]
VITE_FIREBASE_PROJECT_ID       [Production, Preview, Development]
...
```

#### 7. Redeploying Your Application

**Critical Step**: Environment variables are only used during the build process. After adding/changing them, you MUST redeploy:

**Option 1: Redeploy Latest**
1. Go to **Deployments** tab
2. Find your latest deployment
3. Click the three dots (⋯) menu
4. Click **Redeploy**
5. Confirm the redeployment

**Option 2: Trigger New Deployment**
1. Make a small change to your code (or just add a comment)
2. Commit and push to GitHub
3. Vercel will automatically deploy with new environment variables

## Finding Your Firebase Configuration Values

### Step-by-Step Guide

#### 1. Access Firebase Console

1. Go to https://console.firebase.google.com/
2. Sign in with your Google account
3. You'll see a list of your Firebase projects

#### 2. Select Your Project

1. Click on your Firebase project (or create a new one if needed)
2. Wait for the project dashboard to load

#### 3. Access Project Settings

1. Look for the **gear icon (⚙️)** in the left sidebar
2. Click on it
3. Select **Project settings** from the dropdown

#### 4. Find Your Web App Configuration

1. Scroll down to the **Your apps** section
2. Look for a web app (indicated by `</>` icon)
3. If you don't have one:
   - Click **Add app** button
   - Select **Web** (the `</>` icon)
   - Register your app with a nickname (e.g., "STUDiTrack Web")
   - Click **Register app**

#### 5. Copy Configuration Values

You'll see a code snippet like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAbc123def456ghi789jkl012mno345pq",
  authDomain: "studentitrack-12345.firebaseapp.com",
  projectId: "studentitrack-12345",
  storageBucket: "studentitrack-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789",
  measurementId: "G-XXXXXXXXXX"
};
```

**Map these to Vercel environment variables:**

| Firebase Config | Vercel Variable Name |
|----------------|---------------------|
| `apiKey` | `VITE_FIREBASE_API_KEY` |
| `authDomain` | `VITE_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `VITE_FIREBASE_PROJECT_ID` |
| `storageBucket` | `VITE_FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `VITE_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `VITE_FIREBASE_APP_ID` |
| `measurementId` | `VITE_FIREBASE_MEASUREMENT_ID` (optional) |

**Important Notes:**
- Copy the **values only** (the text inside quotes), not the keys
- Don't include quotes when pasting into Vercel
- The `measurementId` is optional (only needed if using Google Analytics)

## Backend API URL Configuration

### What is VITE_API_URL?

This tells your frontend where to send API requests (to your backend server).

### Setting It Up

**If your backend is deployed separately:**
```
VITE_API_URL=https://your-backend-domain.com/api
```

**If your backend is on the same domain:**
```
VITE_API_URL=https://yourdomain.com/api
```

**For development (local):**
```
VITE_API_URL=http://localhost:5000/api
```

**Example:**
If your backend is at `https://api.studentitrack.com`, set:
```
VITE_API_URL=https://api.studentitrack.com/api
```

## Troubleshooting Common Issues

### Issue 1: Blank Page After Deployment

**Symptoms:**
- Page loads but shows white/blank screen
- No errors visible on the page

**Causes:**
- Missing environment variables
- Variables not set for the correct environment
- Application failed to initialize Firebase

**Solution:**
1. Open browser console (F12 → Console tab)
2. Look for errors like:
   - "❌ Missing Firebase environment variables"
   - "Firebase initialization failed"
3. Check Vercel environment variables are set correctly
4. Verify variable names start with `VITE_`
5. Redeploy after adding variables

### Issue 2: Variables Not Working

**Symptoms:**
- Variables are set in Vercel but app still shows errors
- `import.meta.env.VITE_*` returns `undefined`

**Causes:**
- Variable name doesn't start with `VITE_`
- Didn't redeploy after adding variables
- Variables set for wrong environment

**Solution:**
1. Check variable names start with `VITE_`
2. Verify variables are set for Production environment
3. Redeploy the application
4. Check build logs in Vercel for any errors

### Issue 3: Different Behavior in Dev vs Production

**Symptoms:**
- App works locally but not in production
- Different Firebase projects being used

**Causes:**
- Different environment variables in different environments
- Local `.env` file has different values

**Solution:**
1. Check Vercel environment variables are set for all environments
2. Compare local `.env` file with Vercel settings
3. Ensure Production environment has correct values

### Issue 4: "Cannot read property of undefined"

**Symptoms:**
- JavaScript errors in console
- App crashes on load

**Causes:**
- Environment variable is missing
- Variable name typo
- Variable not accessible in code

**Solution:**
1. Check all required variables are set
2. Verify variable names match exactly (case-sensitive)
3. Check code uses `import.meta.env.VITE_*` (not `process.env`)

## Best Practices

### 1. Never Commit .env Files

Your `.env` file should be in `.gitignore`:
```
.env
.env.local
.env.production
```

### 2. Use Different Projects for Dev/Prod

- **Development**: Use a test Firebase project
- **Production**: Use your real Firebase project
- This prevents test data from affecting production

### 3. Document Required Variables

Keep a template file (like `env.production.template`) that lists all required variables without actual values.

### 4. Regular Security Audits

- Review who has access to your Vercel project
- Rotate API keys periodically
- Remove unused environment variables

### 5. Use Vercel's Environment Variable UI

- Don't hardcode values in your code
- Always use Vercel's environment variable interface
- This keeps secrets out of your repository

## Quick Reference Checklist

Before deploying, ensure:

- [ ] All Firebase variables are set in Vercel
- [ ] Variable names start with `VITE_`
- [ ] Variables are set for Production environment
- [ ] `VITE_API_URL` points to your backend
- [ ] You've redeployed after adding/changing variables
- [ ] No sensitive data is hardcoded in source code
- [ ] `.env` files are in `.gitignore`

## Additional Resources

- [Vercel Environment Variables Documentation](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vite Environment Variables Guide](https://vitejs.dev/guide/env-and-mode.html)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Documentation](https://firebase.google.com/docs)

## Summary

Environment variables are essential for:
- ✅ Security (keeping secrets out of code)
- ✅ Flexibility (different configs for different environments)
- ✅ Maintainability (change config without code changes)

**Remember:**
1. All Vite variables must start with `VITE_`
2. Variables are embedded at build time
3. Always redeploy after changing variables
4. Set variables for the correct environment (Production/Preview/Development)

