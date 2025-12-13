# Install MySQL Client to Test Connection

## The Problem

You tried: `mysql -u root -p -h localhost student_itrack`

**Error:** `Command 'mysql' not found`

**Solution:** Install MySQL client

---

## Install MySQL Client

**Run this command:**
```bash
apt-get update
apt-get install -y mysql-client-core-8.0
```

**OR if that doesn't work:**
```bash
apt-get install -y mariadb-client-core
```

---

## After Installation

**Test MySQL connection:**
```bash
mysql -u root -p -h localhost student_itrack
```

**Enter password:** `Crbphy@88` (when prompted)

**If connection succeeds:**
- ✅ MySQL is working
- ✅ Credentials are correct
- ✅ Database exists

**If connection fails:**
- Check if MySQL server is running: `systemctl status mysql`
- Verify password is correct
- Check if database exists: `mysql -u root -p -e "SHOW DATABASES;"`

---

## Alternative: Test Without MySQL Client

**If you don't want to install MySQL client, you can test by:**
1. **Check if MySQL server is running:**
   ```bash
   systemctl status mysql
   ```

2. **Check backend logs:**
   ```bash
   pm2 logs student-itrack-api --err --lines 20
   ```
   - If you see "MySQL connected successfully" → MySQL is working
   - If you see "MySQL Connection error" → Check credentials in `.env`

---

## Quick Install and Test

```bash
# Install MySQL client
apt-get update
apt-get install -y mysql-client-core-8.0

# Test connection
mysql -u root -p -h localhost student_itrack
# Enter password: Crbphy@88
```

---

**Install MySQL client, then test the connection!**

