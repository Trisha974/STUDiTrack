# MySQL Server Not Installed - Fix Guide

## The Problem

**Error:** `Unit mysql.service could not be found`

**This means:** MySQL server is **NOT installed** on your VPS.

**What you have:**
- ✅ MariaDB client (for connecting to MySQL)
- ❌ MySQL server (the actual database server)

---

## Solution: Two Options

### Option 1: Use Hostinger MySQL (Recommended - Easier)

**Why:** Hostinger provides MySQL databases through cPanel. This is easier and more reliable.

#### Step 1: Get MySQL Credentials from Hostinger

1. **Login to Hostinger cPanel**
2. **Go to:** `MySQL Databases` or `Databases` → `MySQL Databases`
3. **Find your database:** `student_itrack` (or create it if it doesn't exist)
4. **Note these details:**
   - **MySQL Hostname:** Usually `mysql.hostinger.com` or `localhost` or an IP address
   - **MySQL Username:** Your database username
   - **MySQL Password:** Your database password
   - **Database Name:** `student_itrack`

#### Step 2: Update `.env` File

```bash
cd /var/www/studentitrack
nano .env
```

**Find and update these lines:**
```env
DB_HOST=mysql.hostinger.com  (or the hostname from Hostinger)
DB_USER=your_hostinger_mysql_username
DB_PASSWORD=your_hostinger_mysql_password
DB_NAME=student_itrack
```

**Save:** `Ctrl + X`, then `Y`, then `Enter`

#### Step 3: Test Connection

```bash
mysql -u your_hostinger_mysql_username -p -h mysql.hostinger.com student_itrack
```

**Enter password:** (the Hostinger MySQL password)

**If connection succeeds:**
- ✅ MySQL connection works
- ✅ You can use Hostinger MySQL

#### Step 4: Restart Backend

```bash
pm2 restart student-itrack-api
pm2 logs student-itrack-api --err
```

---

### Option 2: Install MySQL Server on VPS

**Why:** If you want to run MySQL directly on your VPS.

#### Step 1: Install MySQL Server

```bash
# Update package list
apt-get update

# Install MySQL server
apt-get install -y mysql-server

# Start MySQL
systemctl start mysql

# Enable MySQL to start on boot
systemctl enable mysql

# Check status
systemctl status mysql
```

**Should show:** `active (running)`

#### Step 2: Secure MySQL Installation

```bash
mysql_secure_installation
```

**Follow prompts:**
- Set root password: `Crbphy@88` (or your preferred password)
- Remove anonymous users: `Y`
- Disallow root login remotely: `Y` (or `N` if you need remote access)
- Remove test database: `Y`
- Reload privilege tables: `Y`

#### Step 3: Create Database and User

```bash
mysql -u root -p
```

**Enter password:** `Crbphy@88` (or the password you set)

**Run these SQL commands:**
```sql
CREATE DATABASE IF NOT EXISTS student_itrack;
CREATE USER IF NOT EXISTS 'your_mysql_username'@'localhost' IDENTIFIED BY 'Crbphy@88';
GRANT ALL PRIVILEGES ON student_itrack.* TO 'your_mysql_username'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Step 4: Update `.env` File

```bash
cd /var/www/studentitrack
nano .env
```

**Update:**
```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=Crbphy@88
DB_NAME=student_itrack
```

**Save:** `Ctrl + X`, then `Y`, then `Enter`

#### Step 5: Test Connection

```bash
mysql -u your_mysql_username -p -h localhost student_itrack
```

**Enter password:** `Crbphy@88`

#### Step 6: Restart Backend

```bash
pm2 restart student-itrack-api
pm2 logs student-itrack-api --err
```

---

## Which Option to Choose?

### Choose Option 1 (Hostinger MySQL) if:
- ✅ You already have MySQL in Hostinger cPanel
- ✅ You want easier setup
- ✅ You want Hostinger to manage MySQL
- ✅ You don't need full MySQL server control

### Choose Option 2 (Install MySQL) if:
- ✅ You want full control over MySQL
- ✅ You want MySQL running directly on VPS
- ✅ You don't have Hostinger MySQL access
- ✅ You need custom MySQL configuration

---

## Quick Commands Summary

### Option 1: Use Hostinger MySQL
```bash
# 1. Get credentials from Hostinger cPanel
# 2. Update .env with Hostinger MySQL credentials
nano .env

# 3. Test connection
mysql -u your_hostinger_username -p -h mysql.hostinger.com student_itrack

# 4. Restart backend
pm2 restart student-itrack-api
```

### Option 2: Install MySQL on VPS
```bash
# 1. Install MySQL
apt-get update
apt-get install -y mysql-server
systemctl start mysql
systemctl enable mysql

# 2. Secure installation
mysql_secure_installation

# 3. Create database and user
mysql -u root -p
# (Run SQL commands to create database and user)

# 4. Update .env
nano .env

# 5. Restart backend
pm2 restart student-itrack-api
```

---

## After Setup: Verify Backend Works

```bash
# Check backend logs
pm2 logs student-itrack-api --err

# Test health endpoint
curl http://localhost:5000/api/health

# Should return: {"status":"ok","message":"Server is running"}
```

---

**Recommendation:** Use **Option 1 (Hostinger MySQL)** - it's easier and Hostinger manages it for you!

