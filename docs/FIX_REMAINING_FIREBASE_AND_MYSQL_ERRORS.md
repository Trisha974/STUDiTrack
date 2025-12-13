# Fix: Firebase and MySQL Errors Still Present

## Current Errors

1. **Firebase Admin SDK:** `Failed to parse private key: Error: Invalid PEM formatted message`
2. **MySQL:** `Access denied for user 'root'@'localhost'`

---

## Issue 1: Firebase Error

**The error suggests the code is still using environment variables, not the JSON file.**

### Check 1: Verify JSON File Was Uploaded

**On VPS, check if file exists:**

```bash
ls -la /var/www/studentitrack/server/serviceAccountKey.json
```

**If file doesn't exist:**
- Upload it again using `scp`
- Make sure it's in the correct location

**If file exists but has wrong permissions:**
```bash
chmod 600 /var/www/studentitrack/server/serviceAccountKey.json
```

### Check 2: Verify Code Changes Were Pulled

**The code needs to be updated to use the JSON file. Check if changes were pulled:**

```bash
cd /var/www/studentitrack
git status
git pull
```

**If there are uncommitted changes, commit them first:**
```bash
git add .
git commit -m "Update Firebase initialization"
git push
```

**Then pull on VPS:**
```bash
git pull
```

### Check 3: Verify Code is Using JSON File

**Check the auth.js file on VPS:**

```bash
cat /var/www/studentitrack/server/src/shared/middleware/auth.js | head -30
```

**Should show code that tries to load `serviceAccountKey.json` first.**

---

## Issue 2: MySQL Error

**The backend can't connect to MySQL.**

### Check 1: Verify .env File Location

**The `.env` file must be in the server directory:**

```bash
ls -la /var/www/studentitrack/server/.env
```

**If it doesn't exist, copy it:**
```bash
cp /var/www/studentitrack/.env /var/www/studentitrack/server/.env
```

### Check 2: Verify MySQL Credentials in .env

**Check the database credentials:**

```bash
cat /var/www/studentitrack/server/.env | grep DB_
```

**Should show:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Crbphy@88
DB_NAME=student_itrack
```

**If `DB_PASSWORD` is empty or wrong:**
```bash
nano /var/www/studentitrack/server/.env
```

**Find `DB_PASSWORD=` and set it to:**
```env
DB_PASSWORD=Crbphy@88
```

**Save:** `Ctrl + X`, then `Y`, then `Enter`

### Check 3: Test MySQL Connection Manually

**Test if MySQL credentials are correct:**

```bash
mysql -u root -p -h localhost student_itrack
```

**Enter password:** `Crbphy@88`

**If connection succeeds:**
- ✅ MySQL credentials are correct
- ✅ Problem is in `.env` file or backend not reading it

**If connection fails:**
- ❌ Password is wrong
- ❌ Need to reset MySQL password

---

## Step-by-Step Fix

### Step 1: Pull Latest Code Changes

```bash
cd /var/www/studentitrack
git pull
```

**If there are conflicts or uncommitted changes, handle them first.**

### Step 2: Verify JSON File Exists

```bash
ls -la /var/www/studentitrack/server/serviceAccountKey.json
```

**If missing, upload it:**
```bash
# From your local machine
cd C:\Users\Angeli1\Documents\STUDiTrack1
scp server\serviceAccountKey.json root@72.61.215.20:/var/www/studentitrack/server/
```

**Then on VPS:**
```bash
chmod 600 /var/www/studentitrack/server/serviceAccountKey.json
```

### Step 3: Verify .env File Location

```bash
ls -la /var/www/studentitrack/server/.env
```

**If missing, copy it:**
```bash
cp /var/www/studentitrack/.env /var/www/studentitrack/server/.env
```

### Step 4: Verify .env File Content

```bash
cat /var/www/studentitrack/server/.env | grep -E "^(DB_|FIREBASE_)"
```

**Should show all database and Firebase variables.**

### Step 5: Restart Backend

```bash
cd /var/www/studentitrack/server
pm2 restart student-itrack-api --update-env
```

### Step 6: Check Logs

```bash
pm2 logs student-itrack-api --err --lines 30
```

**Should show:**
- ✅ `Firebase Admin SDK initialized successfully from serviceAccountKey.json`
- ✅ No MySQL connection errors

---

## Quick Checklist

- [ ] Code changes pulled: `git pull`
- [ ] JSON file exists: `ls -la /var/www/studentitrack/server/serviceAccountKey.json`
- [ ] JSON file permissions: `chmod 600 serviceAccountKey.json`
- [ ] .env file in server directory: `ls -la /var/www/studentitrack/server/.env`
- [ ] MySQL password correct: `grep DB_PASSWORD /var/www/studentitrack/server/.env`
- [ ] MySQL connection works: `mysql -u root -p -h localhost student_itrack`
- [ ] Backend restarted: `pm2 restart student-itrack-api --update-env`
- [ ] No errors in logs: `pm2 logs student-itrack-api --err`

---

## Common Issues

### Issue 1: Code Not Updated on VPS

**Error:** Still using old code that doesn't check for JSON file

**Solution:**
```bash
cd /var/www/studentitrack
git pull
pm2 restart student-itrack-api
```

### Issue 2: JSON File Not Found

**Error:** `Cannot find module 'serviceAccountKey.json'`

**Solution:**
- Upload file: `scp server\serviceAccountKey.json root@72.61.215.20:/var/www/studentitrack/server/`
- Set permissions: `chmod 600 serviceAccountKey.json`
- Verify: `ls -la /var/www/studentitrack/server/serviceAccountKey.json`

### Issue 3: .env File in Wrong Location

**Error:** Backend can't find `.env` file

**Solution:**
- Copy to server directory: `cp /var/www/studentitrack/.env /var/www/studentitrack/server/.env`
- Verify: `ls -la /var/www/studentitrack/server/.env`

### Issue 4: MySQL Password Wrong

**Error:** `Access denied for user 'root'@'localhost'`

**Solution:**
- Test connection: `mysql -u root -p -h localhost student_itrack`
- Update `.env`: `DB_PASSWORD=Crbphy@88`
- Restart: `pm2 restart student-itrack-api --update-env`

---

**Start by pulling the latest code changes and verifying the JSON file exists!**

