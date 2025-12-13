# Debug: Firebase JSON File Not Loading

## Current Status

**Everything is in place:**
- ✅ JSON file exists: `/var/www/studentitrack/server/serviceAccountKey.json`
- ✅ File permissions correct: `-rw-------`
- ✅ .env file exists: `/var/www/studentitrack/server/.env`
- ✅ DB_PASSWORD set: `Crbphy@88`

**But still seeing errors:**
- ❌ Firebase: "Failed to parse private key" (still using env vars)
- ❌ MySQL: "Access denied"

---

## Issue: Code Still Using Environment Variables

**The Firebase error suggests the code is still trying to use environment variables, not the JSON file.**

**This means either:**
1. The code path to load JSON file isn't working
2. The JSON file path is wrong
3. The code changes weren't actually pulled

---

## Step 1: Verify Code Was Updated

**Check if the auth.js file has the JSON loading code:**

```bash
cat /var/www/studentitrack/server/src/shared/middleware/auth.js | head -30
```

**Should show code that checks for `serviceAccountKey.json` file.**

**If it doesn't show JSON loading code, the code wasn't updated.**

---

## Step 2: Check JSON File Path

**The code looks for the file at:**
```
/var/www/studentitrack/server/serviceAccountKey.json
```

**Verify the file is exactly there:**
```bash
ls -la /var/www/studentitrack/server/serviceAccountKey.json
```

**Check the actual path the code is using:**
```bash
cd /var/www/studentitrack/server
node -e "const path = require('path'); console.log(path.join(__dirname, '../../../serviceAccountKey.json'))"
```

**This will show the exact path the code is looking for.**

---

## Step 3: Test JSON File Loading Manually

**Test if Node.js can load the JSON file:**
```bash
cd /var/www/studentitrack/server
node -e "try { const sa = require('./serviceAccountKey.json'); console.log('✅ JSON file loaded:', sa.project_id); } catch(e) { console.error('❌ Error:', e.message); }"
```

**If this works, the file is valid. If it fails, there's an issue with the file.**

---

## Step 4: Check Actual Error in Code

**The code might be catching the error and falling back. Let's check the actual error:**

**Look at the auth.js file to see the exact code:**
```bash
cat /var/www/studentitrack/server/src/shared/middleware/auth.js | grep -A 20 "if (!admin.apps.length)"
```

**This will show the initialization code.**

---

## Step 5: Fix JSON File Path Issue

**If the path is wrong, the code might be looking in the wrong place.**

**The code uses:**
```javascript
path.join(__dirname, '../../../serviceAccountKey.json')
```

**From `server/src/shared/middleware/auth.js`, this resolves to:**
- `__dirname` = `/var/www/studentitrack/server/src/shared/middleware`
- `../../../` = `/var/www/studentitrack/`
- Final path = `/var/www/studentitrack/serviceAccountKey.json`

**But the file is at:**
- `/var/www/studentitrack/server/serviceAccountKey.json`

**The path is wrong!** The code is looking one level up from where the file actually is.

---

## Fix: Update Code to Use Correct Path

**The code should look for the file in the `server/` directory, not the root.**

**Option 1: Move JSON file to root (quick fix):**
```bash
cp /var/www/studentitrack/server/serviceAccountKey.json /var/www/studentitrack/serviceAccountKey.json
```

**Option 2: Fix the code path (better fix):**
Update the code to look in the correct location.

---

## Quick Fix: Move JSON File

**Move the JSON file to where the code expects it:**

```bash
cp /var/www/studentitrack/server/serviceAccountKey.json /var/www/studentitrack/serviceAccountKey.json
chmod 600 /var/www/studentitrack/serviceAccountKey.json
```

**Then restart:**
```bash
pm2 restart student-itrack-api --update-env
```

---

## Check MySQL Connection

**For the MySQL error, test the connection manually:**

```bash
mysql -u root -p -h localhost student_itrack
```

**Enter password:** `Crbphy@88`

**If this works but backend doesn't, the issue is in how the backend reads the .env file.**

---

**The JSON file path is likely wrong. Move it to `/var/www/studentitrack/serviceAccountKey.json` (one level up)!**

