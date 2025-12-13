# Fix: Backend Not Reading .env Correctly

## ✅ Good News: MySQL Connection Works!

**You successfully connected to MySQL:**
- ✅ MySQL credentials are correct
- ✅ Database `student_itrack` exists
- ✅ MySQL is working properly

**This means:** The backend error is because it's not reading `.env` correctly.

---

## Step 1: Exit MySQL

**First, exit MySQL:**

```sql
EXIT;
```

**You should return to:** `root@srv1189265:~#`

---

## Step 2: Check .env File Format

**Check if DB_PASSWORD is correctly formatted:**

```bash
cd /var/www/studentitrack
grep DB_PASSWORD .env
```

**Should show:**
```env
DB_PASSWORD=Crbphy@88
```

**Common issues:**
- ❌ Extra spaces: `DB_PASSWORD = Crbphy@88` (should be `DB_PASSWORD=Crbphy@88`)
- ❌ Quotes: `DB_PASSWORD="Crbphy@88"` (should be `DB_PASSWORD=Crbphy@88`)
- ❌ Missing value: `DB_PASSWORD=`

**If wrong, fix it:**
```bash
nano .env
```

**Find `DB_PASSWORD=` and make sure it's:**
```env
DB_PASSWORD=Crbphy@88
```

**Save:** `Ctrl + X`, then `Y`, then `Enter`

---

## Step 3: Check Where Backend Reads .env From

**The backend reads `.env` from the current working directory.**

**Check where PM2 is running the backend from:**

```bash
pm2 info student-itrack-api | grep "exec cwd"
```

**Or check the ecosystem config:**

```bash
cat /var/www/studentitrack/server/ecosystem.config.js
```

**The `.env` file should be in the same directory as `server.js`.**

---

## Step 4: Verify .env File Location

**Check if `.env` is in the correct location:**

```bash
ls -la /var/www/studentitrack/.env
ls -la /var/www/studentitrack/server/.env
```

**The backend code has:**
```javascript
require('dotenv').config()
```

**This reads `.env` from the current working directory.**

**If `.env` is in `/var/www/studentitrack/` but backend runs from `/var/www/studentitrack/server/`:**

**Option 1: Move .env to server directory:**
```bash
cp /var/www/studentitrack/.env /var/www/studentitrack/server/.env
```

**Option 2: Create symlink:**
```bash
ln -s /var/www/studentitrack/.env /var/www/studentitrack/server/.env
```

---

## Step 5: Check All Database Variables

**Verify all database variables are correct:**

```bash
cd /var/www/studentitrack
cat .env | grep -E "^DB_"
```

**Should show:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Crbphy@88
DB_NAME=student_itrack
```

**Make sure:**
- ✅ No extra spaces
- ✅ No quotes around values
- ✅ All values are present

---

## Step 6: Fix Firebase Private Key (Still Has Error)

**The Firebase error is still there. Check the key format:**

```bash
grep FIREBASE_PRIVATE_KEY .env | head -c 100
```

**Should start with:**
```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n
```

**If wrong, get the complete key from Firebase Console and update it.**

---

## Step 7: Restart Backend from Correct Directory

**Make sure backend reads `.env` from the correct location:**

```bash
cd /var/www/studentitrack/server
pm2 restart student-itrack-api --update-env
```

**Or if .env is in parent directory:**

```bash
cd /var/www/studentitrack
pm2 restart student-itrack-api --update-env
```

---

## Step 8: Check Logs

**Check if errors are fixed:**

```bash
pm2 logs student-itrack-api --err --lines 20
```

**Should show:**
- ✅ No MySQL connection errors (or different error)
- ⚠️ Firebase error might still be there (need to fix key format)

---

## Quick Fix Checklist

1. ✅ **Exit MySQL:** `EXIT;`
2. ✅ **Check DB_PASSWORD format:** `grep DB_PASSWORD .env`
3. ✅ **Check .env location:** `ls -la /var/www/studentitrack/.env` and `ls -la /var/www/studentitrack/server/.env`
4. ✅ **Move .env if needed:** `cp /var/www/studentitrack/.env /var/www/studentitrack/server/.env`
5. ✅ **Verify all DB variables:** `cat .env | grep -E "^DB_"`
6. ✅ **Restart backend:** `pm2 restart student-itrack-api --update-env`
7. ✅ **Check logs:** `pm2 logs student-itrack-api --err`

---

## Common Issues

### Issue 1: .env in Wrong Directory

**Error:** Backend can't find `.env` file

**Solution:**
- Move `.env` to where `server.js` is located
- Or create symlink: `ln -s /var/www/studentitrack/.env /var/www/studentitrack/server/.env`

### Issue 2: DB_PASSWORD Has Quotes

**Error:** MySQL reads password as `"Crbphy@88"` instead of `Crbphy@88`

**Solution:**
- Remove quotes: `DB_PASSWORD=Crbphy@88` (not `DB_PASSWORD="Crbphy@88"`)

### Issue 3: Extra Spaces

**Error:** `DB_PASSWORD = Crbphy@88` (with spaces)

**Solution:**
- Remove spaces: `DB_PASSWORD=Crbphy@88`

---

**Exit MySQL first, then check the .env file format and location!**

