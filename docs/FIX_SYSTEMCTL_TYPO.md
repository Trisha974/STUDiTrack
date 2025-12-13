# Fix: systemctl Command Typo

## The Error

```
Command 'systemct1' not found
```

**Problem:** You typed `systemct1` (with number **1**) instead of `systemctl` (with letter **l**)

---

## Correct Command

**Wrong:** `systemct1 status mysql`  
**Correct:** `systemctl status mysql`

**Note:** The last character is the letter **l** (lowercase L), not the number **1**

---

## Check MySQL Status (Correct Command)

```bash
systemctl status mysql
```

**If you see:** "Unit mysql.service could not be found"
- MySQL is not installed
- You need to install it OR use Hostinger MySQL

**If you see:** "inactive (dead)" or "failed"
- MySQL is installed but not running
- Start it with: `systemctl start mysql`

**If you see:** "active (running)"
- ✅ MySQL is running
- The socket error might be a different issue

---

## Next Steps

### Option 1: Install MySQL on VPS

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

### Option 2: Use Hostinger MySQL (Recommended)

**If you have MySQL in Hostinger cPanel, use that instead:**

1. **Get MySQL credentials from Hostinger:**
   - Login to Hostinger cPanel
   - Go to **MySQL Databases**
   - Note your MySQL hostname, username, and password

2. **Update `.env` file:**
   ```bash
   nano .env
   ```

3. **Change these values:**
   ```env
   DB_HOST=mysql.hostinger.com  (or your Hostinger MySQL hostname)
   DB_USER=your_hostinger_mysql_username
   DB_PASSWORD=your_hostinger_mysql_password
   DB_NAME=student_itrack
   ```

4. **Save:** `Ctrl + X`, then `Y`, then `Enter`

5. **Restart backend:**
   ```bash
   pm2 restart student-itrack-api
   ```

---

## Quick Fix

```bash
# Use correct command (letter L, not number 1)
systemctl status mysql

# If not installed, install it
apt-get update
apt-get install -y mysql-server
systemctl start mysql
systemctl enable mysql

# OR use Hostinger MySQL by updating .env
```

---

**Remember:** `systemctl` (with letter **l**), not `systemct1` (with number **1**)

