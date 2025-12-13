# After Creating .env File - Next Steps

## ✅ Current Status

**You've created the `.env` file with all environment variables.**

---

## Step 1: Verify .env File

**Check that the file was created correctly:**

```bash
cat .env
```

**Should show:**
- ✅ All variables with correct formatting
- ✅ All underscores in place (`NODE_ENV`, `DB_HOST`, `DB_USER`, `CSRF_SECRET`)
- ✅ All equals signs in place
- ✅ Correct spelling (`PRODUCTION_FRONTEND_URL`)

---

## Step 2: Verify Firebase Private Key is Complete

**Check if your Firebase Private Key is complete:**

```bash
grep FIREBASE_PRIVATE_KEY .env
```

**The key should be very long (2000+ characters).**

**If it's truncated (ends with `..`):**
1. **Get complete key from Firebase Console:**
   - Go to: https://console.firebase.google.com
   - Select project: `studentitrack-54f69`
   - Go to: Project Settings → Service Accounts
   - Click: "Generate new private key"
   - Download the JSON file
   - Copy the complete `private_key` value

2. **Update in .env:**
   ```bash
   nano .env
   ```
   - Use `Ctrl + W` to search for `FIREBASE_PRIVATE_KEY`
   - Replace the truncated key with the complete one
   - Save: `Ctrl + X`, then `Y`, then `Enter`

---

## Step 3: Restart Backend

**Restart the backend with PM2 to load the new .env file:**

```bash
cd /var/www/studentitrack
pm2 restart student-itrack-api
```

**Check status:**
```bash
pm2 status
```

**Should show:** `online` (green)

---

## Step 4: Check Backend Logs

**Check for errors:**

```bash
pm2 logs student-itrack-api --err
```

**Look for:**
- ✅ No MySQL connection errors
- ✅ No Firebase errors
- ✅ Server started successfully

**Common errors to watch for:**
- ❌ `MySQL connection error` → Check `DB_HOST`, `DB_USER`, `DB_PASSWORD` in `.env`
- ❌ `Firebase Admin SDK initialization failed` → Check `FIREBASE_PRIVATE_KEY` is complete
- ❌ `CSRF_SECRET is required` → Check `CSRF_SECRET` is set in `.env`

---

## Step 5: Test Backend Health Endpoint

**Test if backend is responding:**

```bash
curl http://localhost:5000/api/health
```

**Expected response:**
```json
{"status":"ok","message":"Server is running"}
```

**If successful:**
- ✅ Backend is running
- ✅ MySQL connection works
- ✅ Environment variables loaded correctly
- ✅ Ready to test from frontend

**If failed:**
- Check PM2 logs: `pm2 logs student-itrack-api --err`
- Check if backend is running: `pm2 status`
- Verify `.env` file: `cat .env`

---

## Step 6: Test MySQL Connection

**Test if backend can connect to MySQL:**

```bash
cd /var/www/studentitrack
node -e "
const mysql = require('mysql2/promise');
require('dotenv').config();
(async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    console.log('✅ MySQL connection successful!');
    await connection.end();
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
  }
})();
"
```

**If successful:**
- ✅ Backend can connect to MySQL
- ✅ Database credentials are correct

**If failed:**
- Check `.env` file values
- Verify database exists: `mysql -u root -p -h localhost -e "SHOW DATABASES;"`
- Check MySQL is running: `systemctl status mysql`

---

## Step 7: Test from Frontend

**Once backend is working:**

1. **Make sure `VITE_API_URL` in Vercel is set to your backend URL:**
   - Example: `https://studentitrack.org/api` or `http://your-vps-ip:5000/api`

2. **Test login from frontend:**
   - Go to: `https://studentitrack.vercel.app/login`
   - Try logging in with a test account

3. **Check browser console for errors:**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

---

## Quick Checklist

- [ ] `.env` file created correctly (`cat .env`)
- [ ] Firebase Private Key is complete (not truncated)
- [ ] Backend restarted (`pm2 restart student-itrack-api`)
- [ ] Backend status is `online` (`pm2 status`)
- [ ] No errors in logs (`pm2 logs student-itrack-api --err`)
- [ ] Health endpoint works (`curl http://localhost:5000/api/health`)
- [ ] MySQL connection works (test script)
- [ ] Frontend can connect to backend (test login)

---

## Common Issues and Fixes

### Issue 1: Backend Won't Start

**Error:** `Error: Cannot find module 'dotenv'`

**Solution:**
```bash
cd /var/www/studentitrack
npm install
pm2 restart student-itrack-api
```

### Issue 2: MySQL Connection Failed

**Error:** `Access denied for user 'root'@'localhost'`

**Solution:**
- Check `.env` file: `DB_USER=root` and `DB_PASSWORD=Crbphy@88`
- Test connection: `mysql -u root -p -h localhost student_itrack`
- Verify password is correct

### Issue 3: Firebase Initialization Failed

**Error:** `Failed to parse private key`

**Solution:**
- Get complete private key from Firebase Console
- Make sure it includes `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Keep the quotes and `\n` characters in `.env`

### Issue 4: CORS Errors from Frontend

**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution:**
- Check `.env` file: `FRONTEND_URL=https://studentitrack.vercel.app`
- Check `PRODUCTION_FRONTEND_URL=https://studentitrack.vercel.app`
- Restart backend: `pm2 restart student-itrack-api`

---

## Summary

**After creating `.env` file:**

1. ✅ **Verify file:** `cat .env`
2. ✅ **Check Firebase key is complete**
3. ✅ **Restart backend:** `pm2 restart student-itrack-api`
4. ✅ **Check logs:** `pm2 logs student-itrack-api --err`
5. ✅ **Test health:** `curl http://localhost:5000/api/health`
6. ✅ **Test MySQL connection**
7. ✅ **Test from frontend**

---

**Start by verifying the `.env` file, then restart the backend!**

