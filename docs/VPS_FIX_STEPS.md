# VPS Fix Steps - Pull Code and Fix Errors

## ✅ Code Changes Pushed to GitHub

**The following changes are now on GitHub:**
- ✅ Updated Firebase Admin SDK to use JSON file
- ✅ Fixed CORS for health check endpoint
- ✅ Updated .gitignore

---

## Step 1: Pull Latest Code on VPS

**On your VPS, pull the latest changes:**

```bash
cd /var/www/studentitrack
git pull
```

**This will update the code to use the JSON file method.**

---

## Step 2: Upload serviceAccountKey.json to VPS

**The JSON file is NOT in Git (for security). You need to upload it manually.**

**From your local machine (PowerShell):**

```powershell
cd C:\Users\Angeli1\Documents\STUDiTrack1
scp server\serviceAccountKey.json root@72.61.215.20:/var/www/studentitrack/server/
```

**Then on VPS, set permissions:**

```bash
chmod 600 /var/www/studentitrack/server/serviceAccountKey.json
ls -la /var/www/studentitrack/server/serviceAccountKey.json
```

**Should show:**
```
-rw------- 1 root root 1234 Dec 13 08:00 serviceAccountKey.json
```

---

## Step 3: Verify .env File Location

**Make sure `.env` is in the server directory:**

```bash
ls -la /var/www/studentitrack/server/.env
```

**If it doesn't exist, copy it:**

```bash
cp /var/www/studentitrack/.env /var/www/studentitrack/server/.env
```

---

## Step 4: Verify MySQL Password in .env

**Check the database password:**

```bash
cat /var/www/studentitrack/server/.env | grep DB_PASSWORD
```

**Should show:**
```env
DB_PASSWORD=Crbphy@88
```

**If it's empty or wrong, fix it:**

```bash
nano /var/www/studentitrack/server/.env
```

**Find `DB_PASSWORD=` and set it to:**
```env
DB_PASSWORD=Crbphy@88
```

**Save:** `Ctrl + X`, then `Y`, then `Enter`

---

## Step 5: Test MySQL Connection

**Verify MySQL credentials work:**

```bash
mysql -u root -p -h localhost student_itrack
```

**Enter password:** `Crbphy@88`

**If connection succeeds, type:**
```sql
EXIT;
```

**If connection fails, the password is wrong. Reset it or check what the correct password is.**

---

## Step 6: Restart Backend

**Restart the backend with updated code:**

```bash
cd /var/www/studentitrack/server
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
- ✅ Server started successfully

**If you still see errors, check the specific error message.**

---

## Quick Commands Summary

**On VPS, run these in order:**

```bash
# 1. Pull latest code
cd /var/www/studentitrack
git pull

# 2. Verify JSON file exists (if not, upload it from local machine)
ls -la /var/www/studentitrack/server/serviceAccountKey.json

# 3. Set permissions (if file exists)
chmod 600 /var/www/studentitrack/server/serviceAccountKey.json

# 4. Verify .env file location
ls -la /var/www/studentitrack/server/.env

# 5. Copy .env if missing
cp /var/www/studentitrack/.env /var/www/studentitrack/server/.env

# 6. Check MySQL password
cat /var/www/studentitrack/server/.env | grep DB_PASSWORD

# 7. Test MySQL connection
mysql -u root -p -h localhost student_itrack
# Enter: Crbphy@88

# 8. Restart backend
pm2 restart student-itrack-api --update-env

# 9. Check logs
pm2 logs student-itrack-api --err --lines 30
```

---

## Expected Results

**After all steps, you should see:**

1. **Firebase initialized:**
   ```
   ✅ Firebase Admin SDK initialized successfully from serviceAccountKey.json
   ```

2. **No MySQL errors:**
   - No "Access denied" errors
   - Database connection successful

3. **Server running:**
   ```
   🚀 Server running on port 5000
   📡 API available at http://localhost:5000/api
   ```

---

## If Errors Persist

### Firebase Error Still Shows

**Check:**
- JSON file exists: `ls -la /var/www/studentitrack/server/serviceAccountKey.json`
- File permissions: `chmod 600 serviceAccountKey.json`
- Code was pulled: `git log -1` (should show latest commit)

### MySQL Error Still Shows

**Check:**
- .env file location: `ls -la /var/www/studentitrack/server/.env`
- Password in .env: `grep DB_PASSWORD /var/www/studentitrack/server/.env`
- MySQL connection: `mysql -u root -p -h localhost student_itrack`

---

**Start with `git pull` on your VPS, then upload the JSON file!**

