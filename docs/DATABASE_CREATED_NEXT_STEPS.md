# Database Created - Next Steps

## ✅ Current Status

**Database created successfully!**
- ✅ `student_itrack` database exists
- ✅ MySQL response: `Query OK, 1 row affected`

---

## Step 1: Verify Database Exists

**While still in MySQL (`mysql>`), verify the database:**

```sql
SHOW DATABASES;
```

**Should show:** `student_itrack` in the list

---

## Step 2: Exit MySQL

**Exit MySQL monitor:**

```sql
EXIT;
```

**You should return to:** `root@srv1189265:~#`

---

## Step 3: Update `.env` File

**Update your backend `.env` file to use local MySQL:**

```bash
cd /var/www/studentitrack
nano .env
```

**Find and update these lines:**

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=student_itrack
```

**Important:**
- `DB_HOST=localhost` (since MySQL is on the same VPS)
- `DB_USER=root` (the user you connected with)
- `DB_PASSWORD=` (leave empty if you didn't use a password)
- `DB_NAME=student_itrack` (the database you just created)

**If you set a MySQL root password during installation:**
- Set `DB_PASSWORD=Crbphy@88` (or your actual password)

**Save:** `Ctrl + X`, then `Y`, then `Enter`

---

## Step 4: Test Backend Connection to MySQL

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
      password: '',
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
- Verify database exists: `mysql -u root -h localhost -e "SHOW DATABASES;"`
- Check if password is needed

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

**If you see MySQL errors:**
- Check `.env` file values
- Verify database exists
- Check if password is needed

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

## Quick Commands Summary

```bash
# 1. In MySQL, verify database:
SHOW DATABASES;
EXIT;

# 2. Update .env file:
cd /var/www/studentitrack
nano .env
# Set: DB_HOST=localhost, DB_USER=root, DB_PASSWORD=, DB_NAME=student_itrack

# 3. Test backend connection:
node -e "const mysql = require('mysql2/promise'); (async () => { try { const conn = await mysql.createConnection({host:'localhost',user:'root',password:'',database:'student_itrack'}); console.log('✅ Connected!'); await conn.end(); } catch(e) { console.error('❌', e.message); } })();"

# 4. Restart backend:
pm2 restart student-itrack-api

# 5. Check logs:
pm2 logs student-itrack-api --err

# 6. Test health:
curl http://localhost:5000/api/health
```

---

## Common Issues

### Issue 1: Backend Can't Connect to MySQL

**Error:** `Access denied for user 'root'@'localhost'`

**Solution:**
- You might need a password
- Check if you set a password during MySQL installation
- Update `.env` with the password: `DB_PASSWORD=your_password`

### Issue 2: Database Not Found

**Error:** `Unknown database 'student_itrack'`

**Solution:**
- Verify database exists: `mysql -u root -h localhost -e "SHOW DATABASES;"`
- If missing, create it: `mysql -u root -h localhost -e "CREATE DATABASE student_itrack;"`

### Issue 3: Backend Still Can't Connect

**Error:** `Cannot connect to MySQL`

**Solution:**
- Verify `.env` file values
- Test connection manually: `mysql -u root -h localhost student_itrack`
- Check MySQL is running: `systemctl status mysql`
- Restart backend: `pm2 restart student-itrack-api`

---

**Next:** Verify the database, exit MySQL, then update `.env` and restart the backend!

