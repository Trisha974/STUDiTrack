# Fix: All .env File Typos and Formatting Issues

## Issues Found

1. **Filename:** `.enc` instead of `.env` ❌
2. **NODE ENV-production** → Should be `NODE_ENV=production` (missing `_` and `=`)
3. **DB HOST=localhost** → Should be `DB_HOST=localhost` (missing `_`)
4. **DB USER=root** → Should be `DB_USER=root` (missing `_`)
5. **PRODCUTION_FRONTEND_URL** → Should be `PRODUCTION_FRONTEND_URL` (missing `U`)
6. **CSRF SECRET=** → Should be `CSRF_SECRET=` (missing `_`)
7. **genereate** → Should be `generate` (typo in comment)

---

## Good News! ✅

**You've already filled in the real values:**
- ✅ Firebase Project ID: `studentitrack-54f69`
- ✅ Firebase Private Key: `MIIEVQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC..`
- ✅ Firebase Client Email: `firebase-adminsdk-fbsvc@studentitrack-54f69.iam.gserviceaccount.com`
- ✅ CSRF Secret: `0fd73827beed58da923932b9c5cfc9775490c9644f0b222705e6596bb7f46798`
- ✅ MySQL Password: `Crbphy@88`

**We just need to fix the formatting and filename!**

---

## Fix: Delete Wrong File and Create Correct One

**Step 1: Delete the wrong file:**
```bash
rm .enc
```

**Step 2: Create the correct file with all fixes:**

```bash
cat > .env << 'EOF'
# Server Configuration
NODE_ENV=production
PORT=5000

# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Crbphy@88
DB_NAME=student_itrack

# Frontend URL (Vercel)
FRONTEND_URL=https://studentitrack.vercel.app
PRODUCTION_FRONTEND_URL=https://studentitrack.vercel.app

# Firebase Admin SDK (for authentication)
FIREBASE_PROJECT_ID=studentitrack-54f69
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEVQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC..\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@studentitrack-54f69.iam.gserviceaccount.com

# CSRF Protection (REQUIRED - generate a random string, min 32 chars)
CSRF_SECRET=0fd73827beed58da923932b9c5cfc9775490c9644f0b222705e6596bb7f46798
EOF
```

**All fixes applied:**
- ✅ `.env` (not `.enc`)
- ✅ `NODE_ENV=production` (with `_` and `=`)
- ✅ `DB_HOST=localhost` (with `_`)
- ✅ `DB_USER=root` (with `_`)
- ✅ `PRODUCTION_FRONTEND_URL` (correct spelling)
- ✅ `CSRF_SECRET=` (with `_`)
- ✅ All your real values preserved

---

## Important: Check Firebase Private Key

**Your Firebase Private Key appears truncated:**
- Current: `MIIEVQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC..`
- It should be much longer (usually 2000+ characters)

**If the key is incomplete:**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Copy the complete `private_key` value (it's very long!)
5. Replace it in `.env` file

**To edit the file:**
```bash
nano .env
```

**Use `Ctrl + W` to search for:**
- `MIIEVQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC..`
- Replace with the complete private key from Firebase JSON file

---

## Verify File Was Created Correctly

**Check the file:**
```bash
cat .env
```

**Should show:**
- ✅ All variables with correct formatting
- ✅ All underscores in place
- ✅ All equals signs in place
- ✅ Correct spelling of `PRODUCTION`

---

## Next Steps

1. **Delete wrong file:** `rm .enc`
2. **Create correct file:** Run the corrected `cat` command above
3. **Verify:** `cat .env`
4. **Check Firebase Private Key:** Make sure it's complete (not truncated)
5. **Restart backend:** `pm2 restart student-itrack-api`
6. **Check logs:** `pm2 logs student-itrack-api --err`

---

**Delete `.enc` and create `.env` with the corrected command above!**

