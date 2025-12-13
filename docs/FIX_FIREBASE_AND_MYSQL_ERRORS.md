# Fix: Firebase and MySQL Errors

## Critical Errors Found

1. **Firebase Admin SDK Error:** `Failed to parse private key: Error: Invalid PEM formatted message`
2. **MySQL Connection Error:** `Access denied for user 'root'@'localhost'`

---

## Error 1: Firebase Private Key Invalid

**Error:** `Failed to parse private key: Error: Invalid PEM formatted message`

**This means:** The Firebase private key in `.env` is either:
- ❌ Incomplete (truncated)
- ❌ Missing quotes
- ❌ Missing `\n` characters
- ❌ Incorrectly formatted

---

### Fix: Get Complete Firebase Private Key

**Step 1: Get the complete key from Firebase Console**

1. **Go to:** https://console.firebase.google.com
2. **Select project:** `studentitrack-54f69`
3. **Go to:** Project Settings (gear icon) → Service Accounts tab
4. **Click:** "Generate new private key"
5. **Download the JSON file**
6. **Open the JSON file** and find the `private_key` field

**Step 2: Copy the complete private key**

**The key should:**
- Start with: `-----BEGIN PRIVATE KEY-----\n`
- Be very long (2000+ characters)
- End with: `\n-----END PRIVATE KEY-----\n`

**Example format:**
```
"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n...very long string...\n-----END PRIVATE KEY-----\n"
```

**Step 3: Update .env file**

```bash
cd /var/www/studentitrack
nano .env
```

**Find the line:**
```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEVQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC..\n-----END PRIVATE KEY-----\n"
```

**Replace with the complete key from the JSON file:**
```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[PASTE COMPLETE KEY HERE]\n-----END PRIVATE KEY-----\n"
```

**Important:**
- ✅ Keep the quotes around the entire value
- ✅ Keep the `\n` characters (they represent newlines)
- ✅ Copy the ENTIRE key (it's very long, don't truncate it)

**Save:** `Ctrl + X`, then `Y`, then `Enter`

---

## Error 2: MySQL Access Denied

**Error:** `Access denied for user 'root'@'localhost'`

**This means:** MySQL credentials are incorrect or MySQL doesn't allow root login without a password.

---

### Fix: Test MySQL Connection

**Step 1: Test MySQL connection manually**

```bash
mysql -u root -p -h localhost student_itrack
```

**Enter password:** `Crbphy@88` (when prompted)

**If connection succeeds:**
- ✅ MySQL credentials are correct
- ✅ Problem is in `.env` file formatting

**If connection fails:**
- ❌ Password is wrong
- ❌ Need to reset MySQL root password

---

### Fix: Check .env File Formatting

**Check if `.env` file has correct MySQL values:**

```bash
cat .env | grep DB_
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
nano .env
```

**Find:**
```env
DB_PASSWORD=
```

**Replace with:**
```env
DB_PASSWORD=Crbphy@88
```

**Save:** `Ctrl + X`, then `Y`, then `Enter`

---

### Alternative: Reset MySQL Root Password

**If password is wrong, reset it:**

**Step 1: Stop MySQL**
```bash
systemctl stop mysql
```

**Step 2: Start MySQL in safe mode**
```bash
mysqld_safe --skip-grant-tables &
```

**Step 3: Connect without password**
```bash
mysql -u root
```

**Step 4: Reset password**
```sql
USE mysql;
UPDATE user SET authentication_string=PASSWORD('Crbphy@88') WHERE User='root';
FLUSH PRIVILEGES;
EXIT;
```

**Step 5: Restart MySQL**
```bash
systemctl restart mysql
```

**Step 6: Test connection**
```bash
mysql -u root -p -h localhost student_itrack
```

**Enter password:** `Crbphy@88`

---

## Step 3: Restart Backend After Fixes

**After fixing both issues:**

```bash
cd /var/www/studentitrack
pm2 restart student-itrack-api
```

**Check logs:**
```bash
pm2 logs student-itrack-api --err
```

**Should show:**
- ✅ No Firebase errors
- ✅ No MySQL errors
- ✅ Server started successfully

---

## Step 4: Verify Fixes

**Test backend health:**
```bash
curl http://localhost:5000/api/health
```

**Expected response:**
```json
{"status":"ok","message":"Server is running"}
```

**If successful:**
- ✅ Firebase Admin SDK initialized
- ✅ MySQL connection works
- ✅ Backend is running

---

## Quick Fix Summary

1. **Fix Firebase Private Key:**
   - Get complete key from Firebase Console
   - Update `.env` file with complete key (keep quotes and `\n`)

2. **Fix MySQL Connection:**
   - Test connection: `mysql -u root -p -h localhost student_itrack`
   - Update `.env` file: `DB_PASSWORD=Crbphy@88`
   - Or reset MySQL password if needed

3. **Restart backend:**
   - `pm2 restart student-itrack-api`
   - `pm2 logs student-itrack-api --err`

4. **Test:**
   - `curl http://localhost:5000/api/health`

---

**Start by fixing the Firebase private key (get the complete key from Firebase Console), then fix the MySQL password in `.env`!**

