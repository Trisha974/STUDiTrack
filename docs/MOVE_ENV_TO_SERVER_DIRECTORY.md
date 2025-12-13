# Fix: Move .env to Server Directory

## Problem Identified

**From PM2 info:**
- ✅ `DB_PASSWORD=Crbphy@88` is correct
- ✅ `exec cwd`: `/var/www/studentitrack/server` (backend runs from here)
- ✅ `script path`: `/var/www/studentitrack/server/src/server.js`

**This means:** The `.env` file must be in `/var/www/studentitrack/server/` directory!

**Currently:** `.env` is probably in `/var/www/studentitrack/` (wrong location)

---

## Solution: Move .env to Server Directory

### Step 1: Check Current .env Location

```bash
ls -la /var/www/studentitrack/.env
ls -la /var/www/studentitrack/server/.env
```

**If `.env` is in `/var/www/studentitrack/` but not in `/var/www/studentitrack/server/`:**
- ❌ Backend can't find it
- ✅ Need to copy it to server directory

---

### Step 2: Copy .env to Server Directory

**Copy the .env file to where the backend runs:**

```bash
cp /var/www/studentitrack/.env /var/www/studentitrack/server/.env
```

**Or if you want to keep one file and use a symlink:**

```bash
ln -s /var/www/studentitrack/.env /var/www/studentitrack/server/.env
```

**I recommend copying (not symlink) to avoid issues.**

---

### Step 3: Verify .env is in Server Directory

```bash
ls -la /var/www/studentitrack/server/.env
```

**Should show the file exists.**

---

### Step 4: Verify .env Content

**Check that the file has correct content:**

```bash
cat /var/www/studentitrack/server/.env | grep -E "^(DB_|FIREBASE_)"
```

**Should show:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Crbphy@88
DB_NAME=student_itrack
FIREBASE_PROJECT_ID=studentitrack-54f69
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@studentitrack-54f69.iam.gserviceaccount.com
```

---

### Step 5: Restart Backend

**Now restart the backend so it reads the .env file:**

```bash
pm2 restart student-itrack-api --update-env
```

---

### Step 6: Check Logs

**Check if errors are fixed:**

```bash
pm2 logs student-itrack-api --err --lines 20
```

**Should show:**
- ✅ No MySQL connection errors (backend can now read DB_PASSWORD)
- ⚠️ Firebase error might still be there (need to check key format)

---

### Step 7: Test Backend Health

**Test if backend is working:**

```bash
curl http://localhost:5000/api/health
```

**Expected response:**
```json
{"status":"ok","message":"Server is running"}
```

---

## Quick Commands

```bash
# 1. Check .env locations
ls -la /var/www/studentitrack/.env
ls -la /var/www/studentitrack/server/.env

# 2. Copy .env to server directory
cp /var/www/studentitrack/.env /var/www/studentitrack/server/.env

# 3. Verify it's there
ls -la /var/www/studentitrack/server/.env

# 4. Verify content
cat /var/www/studentitrack/server/.env | grep -E "^(DB_|FIREBASE_)"

# 5. Restart backend
pm2 restart student-itrack-api --update-env

# 6. Check logs
pm2 logs student-itrack-api --err --lines 20

# 7. Test health
curl http://localhost:5000/api/health
```

---

## Why This Fixes the Issue

**The backend code has:**
```javascript
require('dotenv').config()
```

**This reads `.env` from the current working directory.**

**Since backend runs from `/var/www/studentitrack/server/`:**
- ✅ `.env` must be in `/var/www/studentitrack/server/`
- ❌ `.env` in `/var/www/studentitrack/` won't be found

**After copying `.env` to server directory:**
- ✅ Backend can read all environment variables
- ✅ MySQL connection should work
- ✅ Firebase should work (if key format is correct)

---

## After Fixing

**Once MySQL error is fixed, you still need to fix Firebase key format if it's still showing errors.**

**Check Firebase key:**
```bash
grep FIREBASE_PRIVATE_KEY /var/www/studentitrack/server/.env | head -c 100
```

**Should start with:**
```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n
```

---

**Copy the .env file to the server directory, then restart the backend!**

