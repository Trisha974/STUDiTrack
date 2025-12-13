# Firebase Admin SDK: Using JSON File or Environment Variables

## Updated: Now Supports Both Methods!

**The Firebase Admin SDK initialization now supports:**
1. ✅ **JSON File** (serviceAccountKey.json) - Recommended for easier setup
2. ✅ **Environment Variables** (.env file) - Fallback option

---

## Option 1: Using JSON File (Recommended)

### Step 1: Download Service Account Key from Firebase

1. **Go to:** https://console.firebase.google.com
2. **Select project:** `studentitrack-54f69`
3. **Go to:** Project Settings (gear icon) → Service Accounts tab
4. **Click:** "Generate new private key"
5. **Download the JSON file** (e.g., `studentitrack-54f69-firebase-adminsdk-xxxxx.json`)

### Step 2: Rename and Place the File

**Rename the file to:** `serviceAccountKey.json`

**Place it in:** `server/` directory

**File structure:**
```
server/
  ├── serviceAccountKey.json  ← Place here
  ├── src/
  ├── package.json
  └── ...
```

### Step 3: Update .env File (Optional)

**You can now remove these from `.env` (if using JSON file):**
```env
# These are optional if using JSON file
# FIREBASE_PROJECT_ID=studentitrack-54f69
# FIREBASE_PRIVATE_KEY="..."
# FIREBASE_CLIENT_EMAIL=...
```

**OR keep them as fallback** (recommended for flexibility)

### Step 4: Restart Backend

```bash
# On VPS
cd /var/www/studentitrack/server
pm2 restart student-itrack-api
```

**The backend will automatically use the JSON file if it exists!**

---

## Option 2: Using Environment Variables (Fallback)

**If JSON file doesn't exist, it will use environment variables from `.env`:**

```env
FIREBASE_PROJECT_ID=studentitrack-54f69
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@studentitrack-54f69.iam.gserviceaccount.com
```

**This is the fallback method if JSON file is not found.**

---

## How It Works

**The initialization logic:**
1. ✅ **First:** Tries to load `serviceAccountKey.json` from `server/` directory
2. ✅ **If found:** Uses JSON file to initialize Firebase Admin SDK
3. ✅ **If not found:** Falls back to environment variables from `.env`
4. ✅ **If neither:** Shows warning message

---

## Custom JSON File Path

**If you want to use a different path for the JSON file:**

**Set in `.env`:**
```env
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/your/serviceAccountKey.json
```

**Default path:** `server/serviceAccountKey.json`

---

## Security Notes

### ⚠️ Important Security Considerations:

1. **Don't commit JSON file to Git:**
   - Add to `.gitignore`: `serviceAccountKey.json`
   - Never commit sensitive credentials

2. **File Permissions (on VPS):**
   ```bash
   # Make sure only owner can read
   chmod 600 /var/www/studentitrack/server/serviceAccountKey.json
   ```

3. **Environment Variables vs JSON File:**
   - **JSON File:** Easier to set up, but file must be secured
   - **Environment Variables:** More secure, but harder to format (private key with `\n`)

---

## Troubleshooting

### Issue 1: JSON File Not Found

**Error:** `Cannot find module 'serviceAccountKey.json'`

**Solution:**
- Make sure file is named exactly: `serviceAccountKey.json`
- Make sure file is in `server/` directory
- Check file path: `ls -la /var/www/studentitrack/server/serviceAccountKey.json`

### Issue 2: JSON File Invalid

**Error:** `Failed to parse private key`

**Solution:**
- Make sure you downloaded the complete JSON file from Firebase Console
- Don't edit the JSON file manually
- Re-download from Firebase Console if needed

### Issue 3: Falls Back to Environment Variables

**If JSON file doesn't work, it will automatically use `.env` variables.**

**Check logs:**
```bash
pm2 logs student-itrack-api --err
```

**Should show:**
- `✅ Firebase Admin SDK initialized successfully from serviceAccountKey.json` (if using JSON)
- `✅ Firebase Admin SDK initialized successfully from environment variables` (if using .env)

---

## Quick Setup Guide

### For VPS Deployment:

1. **Download JSON file from Firebase Console**
2. **Upload to VPS:**
   ```bash
   # Using SCP (from your local machine)
   scp serviceAccountKey.json root@YOUR_VPS_IP:/var/www/studentitrack/server/
   ```
3. **Set permissions:**
   ```bash
   # On VPS
   chmod 600 /var/www/studentitrack/server/serviceAccountKey.json
   ```
4. **Restart backend:**
   ```bash
   pm2 restart student-itrack-api
   ```

---

## File Structure

```
server/
  ├── serviceAccountKey.json  ← Firebase credentials (JSON file)
  ├── .env                    ← Environment variables (fallback)
  ├── src/
  │   └── shared/
  │       └── middleware/
  │           └── auth.js    ← Firebase initialization code
  └── ...
```

---

## Summary

**Now you have two options:**

1. **JSON File (Easier):**
   - Download from Firebase Console
   - Place in `server/serviceAccountKey.json`
   - Restart backend
   - ✅ Done!

2. **Environment Variables (Fallback):**
   - Set in `.env` file
   - Format private key correctly
   - Restart backend
   - ✅ Done!

**The code automatically tries JSON file first, then falls back to environment variables!**

---

**Download the JSON file from Firebase Console and place it in `server/serviceAccountKey.json`!**

