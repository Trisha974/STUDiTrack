# MySQL Running - Next Steps

## ✅ Current Status

**MySQL server is now running:**
- ✅ Service: `active (running)`
- ✅ Status: "Server is operational"
- ✅ Enabled on boot

---

## Step 1: Test MySQL Connection

**Test connection with your credentials:**

```bash
mysql -u root -p -h localhost
```

**Enter password:** `Crbphy@88` (or the password you set during installation)

**If connection succeeds:**
- ✅ MySQL is working
- ✅ Credentials are correct

**If connection fails:**
- Check if you set a password during installation
- If you didn't set a password, try: `mysql -u root -h localhost` (no `-p`)

---

## Step 2: Create Database (If Not Exists)

**Connect to MySQL:**
```bash
mysql -u root -p -h localhost
```

**Enter password:** `Crbphy@88`

**Run these SQL commands:**
```sql
CREATE DATABASE IF NOT EXISTS student_itrack;
SHOW DATABASES;
EXIT;
```

**Should show:** `student_itrack` in the list

---

## Step 3: Update `.env` File

**Make sure your `.env` file uses `localhost` for MySQL:**

```bash
cd /var/www/studentitrack
nano .env
```

**Check these values:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Crbphy@88
DB_NAME=student_itrack
```

**If different, update them:**
- `DB_HOST` should be `localhost` (since MySQL is on the same VPS)
- `DB_USER` should be `root` (or your MySQL username)
- `DB_PASSWORD` should match your MySQL root password
- `DB_NAME` should be `student_itrack`

**Save:** `Ctrl + X`, then `Y`, then `Enter`

---

## Step 4: Test Database Connection from Backend

**Test if backend can connect to MySQL:**

```bash
cd /var/www/studentitrack
node -e "
const mysql = require('mysql2/promise');
(async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Crbphy@88',
      database: 'student_itrack'
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
- ✅ Ready to restart backend

**If failed:**
- Check `.env` file values
- Verify MySQL credentials
- Make sure database exists

---

## Step 5: Restart Backend

**Restart the backend with PM2:**

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

## Step 6: Check Backend Logs

**Check for errors:**
```bash
pm2 logs student-itrack-api --err
```

**Look for:**
- ✅ No MySQL connection errors
- ✅ No Firebase errors
- ✅ Server started successfully

**If you see errors:**
- MySQL connection error → Check `.env` file
- Firebase error → Check `FIREBASE_PRIVATE_KEY` in `.env`
- Other errors → Share the error message

---

## Step 7: Test Backend Health Endpoint

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
- ✅ Ready to test from frontend

**If failed:**
- Check PM2 logs: `pm2 logs student-itrack-api --err`
- Check if backend is running: `pm2 status`

---

## Step 8: Test from Frontend

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

- [ ] MySQL server is running (`systemctl status mysql`)
- [ ] MySQL connection works (`mysql -u root -p -h localhost`)
- [ ] Database `student_itrack` exists
- [ ] `.env` file has correct MySQL credentials
- [ ] Backend can connect to MySQL (test script)
- [ ] Backend restarted (`pm2 restart student-itrack-api`)
- [ ] Backend status is `online` (`pm2 status`)
- [ ] No errors in logs (`pm2 logs student-itrack-api --err`)
- [ ] Health endpoint works (`curl http://localhost:5000/api/health`)
- [ ] Frontend can connect to backend (test login)

---

## Common Issues

### Issue 1: MySQL Connection Failed

**Error:** `Access denied for user 'root'@'localhost'`

**Solution:**
- Check password in `.env` matches MySQL root password
- If you didn't set a password, try removing `-p` from connection test
- Reset MySQL root password if needed

### Issue 2: Database Not Found

**Error:** `Unknown database 'student_itrack'`

**Solution:**
- Create database: `CREATE DATABASE student_itrack;`
- Check `.env` file has correct `DB_NAME`

### Issue 3: Backend Still Can't Connect

**Error:** `Cannot connect to MySQL`

**Solution:**
- Verify `.env` file values
- Test connection manually: `mysql -u root -p -h localhost student_itrack`
- Check MySQL is running: `systemctl status mysql`
- Restart backend: `pm2 restart student-itrack-api`

---

**Next:** Test the MySQL connection, update `.env` if needed, then restart the backend!

