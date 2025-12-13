# Fix: Firebase Path Issue and MySQL Connection

## Problem Found

**The JSON file path was wrong!**

**Current code:** `../../../../serviceAccountKey.json` (4 levels up - WRONG)
**Correct path:** `../../../serviceAccountKey.json` (3 levels up - CORRECT)

**File structure:**
```
server/
  ├── serviceAccountKey.json  ← File location
  └── src/
      └── shared/
          └── middleware/
              └── auth.js  ← Code location (3 levels down)
```

**From `auth.js`, we need to go up 3 levels to reach `server/` directory.**

---

## Step 1: Commit and Push the Fix

**On your local machine, commit the fix:**

```bash
git add server/src/shared/middleware/auth.js
git commit -m "Fix Firebase serviceAccountKey.json path"
git push
```

---

## Step 2: Pull on VPS

**On your VPS, pull the fix:**

```bash
cd /var/www/studentitrack
git pull
```

---

## Step 3: Test JSON File Path

**On VPS, test if the path is correct:**

```bash
cd /var/www/studentitrack/server
node -e "const path = require('path'); const fs = require('fs'); const p = path.join(__dirname, 'src/shared/middleware/../../../serviceAccountKey.json'); console.log('Path:', p); console.log('Exists:', fs.existsSync(p));"
```

**Should show:**
```
Path: /var/www/studentitrack/server/serviceAccountKey.json
Exists: true
```

---

## Step 4: Fix MySQL Connection

**The MySQL error suggests the password might be wrong or MySQL doesn't allow root login.**

### Test MySQL Connection

```bash
mysql -u root -p -h localhost student_itrack
```

**Enter password:** `Crbphy@88`

**If connection succeeds:**
- ✅ Password is correct
- ✅ Problem is in backend reading `.env`

**If connection fails:**
- ❌ Password is wrong
- ❌ Need to reset MySQL password

### Reset MySQL Password (If Needed)

**If password is wrong:**

```bash
# Stop MySQL
systemctl stop mysql

# Start MySQL in safe mode
mysqld_safe --skip-grant-tables &

# Wait a few seconds, then connect
mysql -u root

# Reset password
ALTER USER 'root'@'localhost' IDENTIFIED BY 'Crbphy@88';
FLUSH PRIVILEGES;
EXIT;

# Kill the safe mode process
pkill mysqld_safe

# Restart MySQL
systemctl restart mysql

# Test connection
mysql -u root -p -h localhost student_itrack
# Enter: Crbphy@88
```

---

## Step 5: Verify .env File

**Make sure `.env` has correct values:**

```bash
cat /var/www/studentitrack/server/.env | grep -E "^(DB_|FIREBASE_)"
```

**Should show:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Crbphy@88
DB_NAME=student_itrack
FIREBASE_PROJECT_ID=studitrack-54f69
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
```

**Note:** Firebase env vars are optional now (since we're using JSON file).

---

## Step 6: Restart Backend

**After pulling the fix:**

```bash
pm2 restart student-itrack-api --update-env
```

---

## Step 7: Check Logs

**Check if errors are fixed:**

```bash
pm2 logs student-itrack-api --err --lines 30
```

**Should show:**
- ✅ `Firebase Admin SDK initialized successfully from serviceAccountKey.json`
- ✅ No MySQL connection errors

---

## Quick Fix Summary

**On your local machine:**
```bash
git add server/src/shared/middleware/auth.js
git commit -m "Fix Firebase serviceAccountKey.json path"
git push
```

**On your VPS:**
```bash
# 1. Pull fix
cd /var/www/studentitrack
git pull

# 2. Test MySQL connection
mysql -u root -p -h localhost student_itrack
# Enter: Crbphy@88

# 3. If MySQL fails, reset password (see above)

# 4. Restart backend
pm2 restart student-itrack-api --update-env

# 5. Check logs
pm2 logs student-itrack-api --err
```

---

## Why It Wasn't Working

1. **Firebase:** Path was wrong (`../../../../` instead of `../../../`), so it couldn't find the JSON file and fell back to environment variables (which had invalid private key)

2. **MySQL:** Either password is wrong, or backend isn't reading `.env` correctly

---

**Commit and push the path fix, then pull on VPS and restart!**

