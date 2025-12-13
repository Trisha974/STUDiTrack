# Debug: Firebase and MySQL Errors - Final Fix

## Current Status

✅ **JSON file exists:** `/var/www/studentitrack/server/serviceAccountKey.json`
✅ **.env file exists:** `/var/www/studentitrack/server/.env`
✅ **DB_PASSWORD set:** `Crbphy@88`
❌ **Firebase error:** Still trying to use environment variables
❌ **MySQL error:** Access denied

---

## Issue 1: Firebase Still Using Environment Variables

**The error suggests the code is falling back to environment variables, meaning the JSON file load failed.**

### Check 1: Verify Code Has JSON File Logic

**Check if the code actually tries to load the JSON file:**

```bash
cat /var/www/studentitrack/server/src/shared/middleware/auth.js | head -30
```

**Should show code that checks for `serviceAccountKey.json`.**

### Check 2: Test JSON File Load Manually

**Test if the JSON file can be loaded:**

```bash
cd /var/www/studentitrack/server
node -e "try { const sa = require('./serviceAccountKey.json'); console.log('✅ JSON file loaded successfully'); console.log('Project ID:', sa.project_id); } catch(e) { console.error('❌ Error loading JSON:', e.message); }"
```

**If this fails, the JSON file might be corrupted or invalid.**

### Check 3: Verify JSON File Path

**The code looks for the file at:**
```
/var/www/studentitrack/server/serviceAccountKey.json
```

**Verify it exists:**
```bash
ls -la /var/www/studentitrack/server/serviceAccountKey.json
cat /var/www/studentitrack/server/serviceAccountKey.json | head -5
```

**Should show valid JSON starting with `{`.**

---

## Issue 2: MySQL Access Denied

**The password might be wrong, or MySQL doesn't allow root login.**

### Test 1: Test MySQL Connection Manually

**Test if the password works:**

```bash
mysql -u root -p -h localhost student_itrack
```

**Enter password:** `Crbphy@88`

**If connection succeeds:**
- ✅ Password is correct
- ✅ Problem is in how backend reads `.env`

**If connection fails:**
- ❌ Password is wrong
- ❌ Need to reset MySQL password

### Test 2: Check if MySQL Root User Exists

```bash
mysql -u root -p -e "SELECT user, host FROM mysql.user WHERE user='root';"
```

**Enter password:** `Crbphy@88`

**Should show root user with localhost access.**

### Test 3: Reset MySQL Password (If Needed)

**If password is wrong, reset it:**

```bash
# Stop MySQL
systemctl stop mysql

# Start MySQL in safe mode
mysqld_safe --skip-grant-tables &

# Connect without password
mysql -u root

# Reset password
ALTER USER 'root'@'localhost' IDENTIFIED BY 'Crbphy@88';
FLUSH PRIVILEGES;
EXIT;

# Restart MySQL
systemctl restart mysql

# Test connection
mysql -u root -p -h localhost student_itrack
# Enter: Crbphy@88
```

---

## Step-by-Step Debugging

### Step 1: Test JSON File Load

```bash
cd /var/www/studentitrack/server
node -e "try { const sa = require('./serviceAccountKey.json'); console.log('✅ JSON loaded'); } catch(e) { console.error('❌ Error:', e.message); }"
```

### Step 2: Test MySQL Connection

```bash
mysql -u root -p -h localhost student_itrack
# Enter: Crbphy@88
```

### Step 3: Check Backend Logs for More Details

```bash
pm2 logs student-itrack-api --err --lines 50
```

**Look for:**
- Any error messages about loading JSON file
- Any error messages about MySQL connection

### Step 4: Check if Code is Using JSON File

**Add temporary logging to see what's happening:**

```bash
# Check the auth.js file
grep -A 10 "serviceAccountKey.json" /var/www/studentitrack/server/src/shared/middleware/auth.js
```

**Should show code that tries to load the JSON file.**

---

## Quick Fix Commands

```bash
# 1. Test JSON file load
cd /var/www/studentitrack/server
node -e "try { const sa = require('./serviceAccountKey.json'); console.log('✅ JSON loaded, Project:', sa.project_id); } catch(e) { console.error('❌', e.message); }"

# 2. Test MySQL connection
mysql -u root -p -h localhost student_itrack
# Enter: Crbphy@88

# 3. Check backend logs
pm2 logs student-itrack-api --err --lines 50

# 4. Verify JSON file content
cat /var/www/studentitrack/server/serviceAccountKey.json | head -3

# 5. Verify .env file
cat /var/www/studentitrack/server/.env | grep -E "^(DB_|FIREBASE_)"
```

---

## Expected Results

**After fixes:**

1. **JSON file test:**
   ```
   ✅ JSON loaded, Project: studitrack-54f69
   ```

2. **MySQL connection:**
   ```
   Welcome to the MySQL monitor...
   mysql>
   ```

3. **Backend logs:**
   ```
   ✅ Firebase Admin SDK initialized successfully from serviceAccountKey.json
   ✅ No MySQL connection errors
   ```

---

**Start by testing the JSON file load and MySQL connection manually!**

