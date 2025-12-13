# Fix: MySQL Server Not Running

## The Error

```
ERROR 2002 (HY000): Can't connect to local server through socket '/run/mysqld/mysqld.sock' (2)
```

**This means:** MySQL server is not running.

---

## Also Notice: Typo in Command

**You typed:** `mysql -u rott -p`
**Should be:** `mysql -u root -p` (with "root", not "rott")

---

## Fix: Start MySQL Server

### Step 1: Check if MySQL is Installed

```bash
systemctl status mysql
```

**If you see:** "Unit mysql.service could not be found"
- MySQL is not installed
- You need to install it

### Step 2: Install MySQL (If Not Installed)

```bash
apt-get update
apt-get install -y mysql-server
```

**After installation, start it:**
```bash
systemctl start mysql
systemctl enable mysql
```

### Step 3: Start MySQL (If Installed But Not Running)

```bash
# Start MySQL
systemctl start mysql

# Enable MySQL to start on boot
systemctl enable mysql

# Check status
systemctl status mysql
```

**Should show:** "active (running)"

---

## Step 4: Test Connection (With Correct Command)

**Use the correct command (with "root", not "rott"):**
```bash
mysql -u root -p -h localhost student_itrack
```

**Enter password:** `Crbphy@88` (when prompted)

**If connection succeeds:**
- ✅ MySQL is working
- ✅ Credentials are correct

---

## Alternative: Use Hostinger MySQL (If Local MySQL Not Available)

**If you can't install/start local MySQL, use Hostinger's MySQL:**

**Check your Hostinger cPanel for:**
- MySQL hostname (might be `mysql.hostinger.com` or similar)
- MySQL username
- MySQL password

**Update `.env` file:**
```bash
nano .env
```

**Change:**
```env
DB_HOST=mysql.hostinger.com
DB_USER=your_hostinger_mysql_username
DB_PASSWORD=your_hostinger_mysql_password
DB_NAME=student_itrack
```

**Save:** `Ctrl + X`, then `Y`, then `Enter`

**Restart backend:**
```bash
pm2 restart student-itrack-api
```

---

## Quick Fix Commands

```bash
# Check MySQL status
systemctl status mysql

# If not running, start it
systemctl start mysql
systemctl enable mysql

# Check status again
systemctl status mysql

# Test connection (with correct spelling: "root")
mysql -u root -p -h localhost student_itrack
# Enter password: Crbphy@88
```

---

## Common Issues

### Issue 1: MySQL Not Installed

**Solution:** Install MySQL server
```bash
apt-get update
apt-get install -y mysql-server
systemctl start mysql
systemctl enable mysql
```

### Issue 2: MySQL Not Running

**Solution:** Start MySQL
```bash
systemctl start mysql
systemctl enable mysql
```

### Issue 3: Using Hostinger MySQL

**Solution:** Update `.env` with Hostinger MySQL credentials
- Get from Hostinger cPanel → MySQL Databases
- Update `DB_HOST`, `DB_USER`, `DB_PASSWORD` in `.env`

---

## Summary

1. ✅ **Fix typo:** Use `root` (not `rott`)
2. ✅ **Check MySQL:** `systemctl status mysql`
3. ✅ **Start MySQL:** `systemctl start mysql` (if not running)
4. ✅ **Install MySQL:** `apt-get install -y mysql-server` (if not installed)
5. ✅ **Test:** `mysql -u root -p -h localhost student_itrack`

**OR use Hostinger MySQL by updating `.env` with Hostinger credentials.**

---

**Start MySQL server first, then test the connection with the correct command!**

