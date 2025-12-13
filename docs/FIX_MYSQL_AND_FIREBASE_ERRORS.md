# Fix: MySQL and Firebase Errors

## Errors Found

1. **MySQL Connection Error** - Can't connect to database
2. **Firebase Private Key Error** - "Invalid PEM formatted message"

---

## Fix 1: MySQL Connection Error

### Check MySQL Credentials

**On your VPS:**
```bash
# Check .env file
cat .env | grep DB_
```

**Should show:**
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Crbphy@88
DB_NAME=student_itrack
```

### Test MySQL Connection

**Test if you can connect:**
```bash
mysql -u root -p -h localhost student_itrack
```

**Enter password:** `Crbphy@88` (when prompted)

**If connection fails:**
- Check if MySQL is running: `systemctl status mysql`
- Verify database exists: `mysql -u root -p -e "SHOW DATABASES;"`
- Check if password is correct

### Fix MySQL Credentials (If Wrong)

**If connection fails, update .env:**
```bash
nano .env
```

**Fix:**
- `DB_USER` - Should be `root` or your MySQL username
- `DB_PASSWORD` - Should be your actual MySQL password
- `DB_NAME` - Should be `student_itrack`

**Save:** `Ctrl + X`, then `Y`, then `Enter`

---

## Fix 2: Firebase Private Key Error

**Error:** "Invalid PEM formatted message"

**This means:** Your Firebase private key is not formatted correctly.

### Get Correct Private Key

1. **Go to Firebase Console:**
   - https://console.firebase.google.com/
   - Select your project: `studentitrack-54f69`
   - Click ⚙️ → Project settings → Service accounts
   - Click "Generate new private key"
   - Download the JSON file

2. **Open the JSON file** and copy the `private_key` value

3. **The key should look like:**
   ```
   "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...very long string...\n-----END PRIVATE KEY-----\n"
   ```

### Fix in .env File

**Edit .env:**
```bash
nano .env
```

**Find:**
```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

**Replace with the COMPLETE key from Firebase JSON:**
```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...complete key here...\n-----END PRIVATE KEY-----\n"
```

**Important:**
- ✅ Keep the quotes (`"..."`)
- ✅ Keep the `\n` characters (don't replace with actual line breaks)
- ✅ Include the FULL key (very long, not truncated)
- ✅ Must have `-----BEGIN PRIVATE KEY-----` at start
- ✅ Must have `-----END PRIVATE KEY-----` at end

**Save:** `Ctrl + X`, then `Y`, then `Enter`

---

## Fix 3: ExpressSlowDown Warning (Optional)

**This is just a warning, not critical.** But you can fix it:

**Edit security.js:**
```bash
nano /var/www/studentitrack/server/src/shared/middleware/security.js
```

**Find:**
```javascript
delayMs: 100,
```

**Change to:**
```javascript
delayMs: () => 100,
```

**Save and restart:** `pm2 restart student-itrack-api`

---

## After Fixing

### Step 1: Restart Backend

```bash
pm2 restart student-itrack-api
pm2 status
```

### Step 2: Check Logs

```bash
pm2 logs student-itrack-api --lines 30
```

**Should see:**
- ✅ `✅ MySQL connected successfully`
- ✅ No Firebase errors
- ❌ **Should NOT see:** "MySQL Connection error"
- ❌ **Should NOT see:** "Invalid PEM formatted message"

### Step 3: Test Backend

```bash
curl http://localhost:5000/api/health
```

**Expected:**
```json
{"status":"ok","message":"Server is running"}
```

---

## Quick Fix Commands

```bash
# 1. Test MySQL connection
mysql -u root -p -h localhost student_itrack
# Enter password: Crbphy@88

# 2. If MySQL fails, check if running
systemctl status mysql

# 3. Fix Firebase key in .env
nano .env
# Replace FIREBASE_PRIVATE_KEY with complete key from Firebase JSON
# Save: Ctrl + X, Y, Enter

# 4. Restart backend
pm2 restart student-itrack-api

# 5. Check logs
pm2 logs student-itrack-api --lines 30

# 6. Test
curl http://localhost:5000/api/health
```

---

## Most Likely Issues

1. **MySQL:** Password might be wrong, or MySQL not running
2. **Firebase:** Private key is truncated or has wrong format

**Fix both, restart, and test!**

---

## Summary

1. ✅ **Test MySQL connection:** `mysql -u root -p -h localhost student_itrack`
2. ✅ **Get complete Firebase private key** from Firebase Console
3. ✅ **Fix both in .env file**
4. ✅ **Restart backend:** `pm2 restart student-itrack-api`
5. ✅ **Test:** `curl http://localhost:5000/api/health`

**The Firebase private key must be complete and properly formatted!**

