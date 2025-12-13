# Debug: Firebase and MySQL Errors Still Persisting

## Current Status

**Errors still showing:**
- ❌ Firebase Admin SDK: `Failed to parse private key: Invalid PEM formatted message`
- ❌ MySQL: `Access denied for user 'root'@'localhost'`

**Even after:**
- ✅ Firebase key retrieved from `.env`
- ✅ DB_PASSWORD set to `Crbphy@88`
- ✅ PM2 restarted with `--update-env`

---

## Issue 1: Firebase Private Key Format

**The key might be incorrectly formatted in `.env` file.**

### Check 1: Verify Key Format

**Check if the key has proper quotes and formatting:**

```bash
cd /var/www/studentitrack
grep FIREBASE_PRIVATE_KEY .env | head -c 50
```

**Should show:**
```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n
```

**If it shows something else, the format is wrong.**

### Check 2: Verify Key is Complete

**Check if the key ends properly:**

```bash
grep FIREBASE_PRIVATE_KEY .env | tail -c 50
```

**Should end with:**
```
\n-----END PRIVATE KEY-----\n"
```

### Check 3: Common Format Issues

**The key in `.env` should be:**
- ✅ On ONE line (even though it's long)
- ✅ In quotes: `"..."` 
- ✅ With `\n` characters (not actual newlines)
- ✅ Complete (not truncated)

**Common mistakes:**
- ❌ Missing quotes
- ❌ Actual newlines instead of `\n`
- ❌ Truncated key
- ❌ Extra spaces

### Fix: Re-add Firebase Key Correctly

**If the format is wrong:**

1. **Get the key from Firebase Console** (as shown in previous guide)
2. **Edit `.env` file:**
   ```bash
   nano .env
   ```
3. **Find the line:**
   ```
   FIREBASE_PRIVATE_KEY=...
   ```
4. **Delete the entire value** (keep `FIREBASE_PRIVATE_KEY=`)
5. **Paste the complete key from JSON file:**
   - Copy from JSON: `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`
   - Paste it after `FIREBASE_PRIVATE_KEY=`
   - Make sure it's all on ONE line
   - Make sure quotes are included

6. **Save:** `Ctrl + X`, then `Y`, then `Enter`

---

## Issue 2: MySQL Connection

**The password might be wrong, or MySQL doesn't allow root login.**

### Test 1: Test MySQL Connection Manually

```bash
mysql -u root -p -h localhost student_itrack
```

**Enter password:** `Crbphy@88`

**If connection succeeds:**
- ✅ MySQL credentials are correct
- ✅ Problem is in how backend reads `.env`

**If connection fails:**
- ❌ Password is wrong
- ❌ Need to reset MySQL password

### Test 2: Check if MySQL Root User Exists

```bash
mysql -u root -p -h localhost -e "SELECT user, host FROM mysql.user WHERE user='root';"
```

**Enter password:** `Crbphy@88`

**Should show:**
```
+------+-----------+
| user | host      |
+------+-----------+
| root | localhost |
+------+-----------+
```

### Test 3: Check .env File Format

**Check if there are any extra spaces or formatting issues:**

```bash
cat .env | grep -A 1 DB_
```

**Should show:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Crbphy@88
DB_NAME=student_itrack
```

**Common issues:**
- ❌ Extra spaces: `DB_PASSWORD = Crbphy@88` (should be `DB_PASSWORD=Crbphy@88`)
- ❌ Quotes around password: `DB_PASSWORD="Crbphy@88"` (should be `DB_PASSWORD=Crbphy@88`)
- ❌ Missing value: `DB_PASSWORD=`

### Fix: Reset MySQL Password (If Needed)

**If MySQL connection fails:**

**Option 1: Reset password using MySQL:**
```bash
mysql -u root -p
# Enter current password (or press Enter if no password)
```

**Then run:**
```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'Crbphy@88';
FLUSH PRIVILEGES;
EXIT;
```

**Option 2: Use mysql_secure_installation:**
```bash
mysql_secure_installation
```

**Follow prompts to set root password.**

---

## Issue 3: Backend Not Reading .env Correctly

**The backend might not be reading `.env` from the correct location.**

### Check: Verify .env File Location

**The `.env` file should be in the server directory:**

```bash
ls -la /var/www/studentitrack/server/.env
```

**If it doesn't exist, check:**
```bash
ls -la /var/www/studentitrack/.env
```

**The backend code reads `.env` from the current working directory.**

### Fix: Move .env to Correct Location

**If `.env` is in wrong location:**

```bash
# If .env is in /var/www/studentitrack/
mv /var/www/studentitrack/.env /var/www/studentitrack/server/.env

# Or create symlink
ln -s /var/www/studentitrack/.env /var/www/studentitrack/server/.env
```

**Then restart:**
```bash
cd /var/www/studentitrack/server
pm2 restart student-itrack-api --update-env
```

---

## Step-by-Step Debugging

### Step 1: Check Firebase Key Format

```bash
cd /var/www/studentitrack
grep FIREBASE_PRIVATE_KEY .env | head -c 100
echo ""
grep FIREBASE_PRIVATE_KEY .env | tail -c 100
```

**Should show:**
- Starts with: `FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n`
- Ends with: `\n-----END PRIVATE KEY-----\n"`

### Step 2: Test MySQL Connection

```bash
mysql -u root -p -h localhost student_itrack
# Enter: Crbphy@88
```

**If it works, type:**
```sql
EXIT;
```

### Step 3: Check .env File Location

```bash
ls -la /var/www/studentitrack/.env
ls -la /var/www/studentitrack/server/.env
```

**Note which one exists.**

### Step 4: Verify All Environment Variables

```bash
cd /var/www/studentitrack
cat .env | grep -E "^(DB_|FIREBASE_)"
```

**Should show all database and Firebase variables.**

### Step 5: Restart Backend from Server Directory

```bash
cd /var/www/studentitrack/server
pm2 restart student-itrack-api --update-env
```

### Step 6: Check Logs Again

```bash
pm2 logs student-itrack-api --err --lines 20
```

---

## Quick Fix Summary

1. **Fix Firebase Key:**
   - Get complete key from Firebase Console
   - Make sure it's on ONE line in `.env`
   - Make sure it has quotes and `\n` characters

2. **Fix MySQL:**
   - Test connection: `mysql -u root -p -h localhost student_itrack`
   - If fails, reset password or check `.env` format

3. **Check .env Location:**
   - Make sure `.env` is in the correct directory
   - Backend should read it from working directory

4. **Restart:**
   - `pm2 restart student-itrack-api --update-env`
   - Check logs: `pm2 logs student-itrack-api --err`

---

**Start by checking the Firebase key format and testing MySQL connection manually!**

