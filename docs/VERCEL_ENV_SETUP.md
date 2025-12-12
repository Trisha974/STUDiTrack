# Vercel Environment Variables Setup

## Required Environment Variables

For the application to work on Vercel, you need to configure the following environment variables in your Vercel project settings:

### Firebase Configuration

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id (optional)
```

### Backend API URL

```
VITE_API_URL=https://your-backend-url.com/api
```

Or if your backend is on the same domain:
```
VITE_API_URL=https://yourdomain.com/api
```

### CSRF Token (if required)

```
VITE_CSRF_TOKEN=your-csrf-token
```

## How to Add Environment Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project: **studentitrack**
3. Click on **Settings**
4. Click on **Environment Variables** in the left sidebar
5. Add each variable:
   - **Key**: The variable name (e.g., `VITE_FIREBASE_API_KEY`)
   - **Value**: The actual value
   - **Environment**: Select **Production**, **Preview**, and **Development** (or just **Production** if you only want it for production)
6. Click **Save**
7. **Important**: After adding environment variables, you need to **redeploy** your application for the changes to take effect

## Finding Your Firebase Configuration

1. Go to https://console.firebase.google.com/
2. Select your project
3. Click on the gear icon ⚙️ → **Project settings**
4. Scroll down to **Your apps** section
5. If you don't have a web app, click **Add app** → **Web** (</> icon)
6. Copy the configuration values from the `firebaseConfig` object

## Troubleshooting

### Blank Page Issue

If you see a blank page, check:

1. **Browser Console** (F12 → Console tab):
   - Look for errors mentioning "Missing Firebase environment variables"
   - Look for any JavaScript errors

2. **Network Tab** (F12 → Network tab):
   - Check if JavaScript files are loading (status 200)
   - Check if any files are failing to load (status 404, 500, etc.)

3. **Environment Variables**:
   - Verify all Firebase variables are set in Vercel
   - Make sure variable names start with `VITE_` (required for Vite)
   - Redeploy after adding/changing environment variables

### Common Issues

- **Missing `VITE_` prefix**: Vite only exposes environment variables that start with `VITE_`
- **Not redeploying**: Environment variable changes require a new deployment
- **Wrong environment**: Make sure variables are set for the correct environment (Production/Preview/Development)

