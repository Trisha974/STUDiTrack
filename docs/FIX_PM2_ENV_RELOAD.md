# Fix: PM2 Not Reloading Environment Variables

## Problem

**PM2 hint:** "Use --update-env to update environment variables"

**Errors still showing:**
- ❌ Firebase Admin SDK initialization failed
- ❌ MySQL connection error

**This means:** PM2 didn't reload the updated `.env` file.

---

## Solution: Restart with --update-env Flag

**PM2 needs to reload environment variables from `.env` file.**

---

## Step 1: Verify .env File Has Correct Values

**Check Firebase key:**
```bash
cd /var/www/studentitrack
grep FIREBASE_PRIVATE_KEY .env
```

**Should show the complete key (very long line starting with `"-----BEGIN PRIVATE KEY-----\n`).**

**Check MySQL password:**
```bash
grep DB_PASSWORD .env
```

**Should show:**
```env
DB_PASSWORD=Crbphy@88
```

**If either is wrong or missing, fix it:**
```bash
nano .env
```

---

## Step 2: Restart PM2 with --update-env Flag

**This tells PM2 to reload environment variables:**

```bash
pm2 restart student-itrack-api --update-env
```

**Or use:**
```bash
pm2 delete student-itrack-api
pm2 start ecosystem.config.js
```

**Or manually reload env:**
```bash
pm2 restart student-itrack-api --update-env
```

---

## Step 3: Check Logs Again

**Wait a few seconds, then check logs:**
```bash
pm2 logs student-itrack-api --err
```

**Should show:**
- ✅ No Firebase errors (or different error if key is still wrong)
- ✅ No MySQL errors (or different error if password is still wrong)

---

## Step 4: Verify Firebase Key Format

**If Firebase error persists, check the key format:**

```bash
grep FIREBASE_PRIVATE_KEY .env | head -c 100
```

**Should start with:**
```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n
```

**Common issues:**
- ❌ Missing quotes `"` at the beginning/end
- ❌ Missing `\n` characters
- ❌ Key is truncated (ends with `..`)

**If key is wrong, fix it:**
```bash
nano .env
```

**Use `Ctrl + W` to search for `FIREBASE_PRIVATE_KEY` and fix it.**

---

## Step 5: Verify MySQL Connection

**Test MySQL connection manually:**
```bash
mysql -u root -p -h localhost student_itrack
```

**Enter password:** `Crbphy@88`

**If connection succeeds:**
- ✅ MySQL credentials are correct
- ✅ Problem is in `.env` file or PM2 not reloading

**If connection fails:**
- ❌ Password is wrong
- ❌ Update `.env` file: `DB_PASSWORD=Crbphy@88`

---

## Step 6: Alternative: Restart PM2 Completely

**If `--update-env` doesn't work:**

```bash
# Stop PM2
pm2 stop student-itrack-api

# Delete the process
pm2 delete student-itrack-api

# Start fresh with ecosystem config
cd /var/www/studentitrack
pm2 start ecosystem.config.js

# Or start directly
pm2 start server/src/server.js --name student-itrack-api
```

**This forces PM2 to reload everything, including environment variables.**

---

## Quick Fix Commands

```bash
# 1. Verify .env file
cd /var/www/studentitrack
grep FIREBASE_PRIVATE_KEY .env
grep DB_PASSWORD .env

# 2. Restart with --update-env
pm2 restart student-itrack-api --update-env

# 3. Check logs
pm2 logs student-itrack-api --err

# 4. Test health
curl http://localhost:5000/api/health
```

---

## Common Issues

### Issue 1: Firebase Key Still Invalid

**Error:** `Invalid PEM formatted message`

**Solution:**
- Check key has quotes: `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`
- Check key is complete (not truncated)
- Check all `\n` characters are present
- Restart with `--update-env`

### Issue 2: MySQL Still Access Denied

**Error:** `Access denied for user 'root'@'localhost'`

**Solution:**
- Test connection: `mysql -u root -p -h localhost student_itrack`
- Verify password: `Crbphy@88`
- Update `.env`: `DB_PASSWORD=Crbphy@88`
- Restart with `--update-env`

### Issue 3: PM2 Not Reloading Env

**Solution:**
- Use `--update-env` flag: `pm2 restart student-itrack-api --update-env`
- Or restart completely: `pm2 delete student-itrack-api && pm2 start ecosystem.config.js`

---

**Try restarting with `--update-env` flag first, then check the logs again!**

