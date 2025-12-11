# Upload Database to Hostinger - Step by Step Guide

## Database Export File

✅ **File Created:** `server/scripts/database-export.sql`  
✅ **Size:** 500.83 KB  
✅ **Contains:** All tables and data (12 tables, including professors, students, courses, grades, attendance, notifications, etc.)

---

## Step-by-Step Upload Instructions

### Step 1: Access Hostinger phpMyAdmin

1. **Login to Hostinger hPanel**
2. Go to **"Databases"** section
3. Click **"phpMyAdmin"** (or find it in the control panel)

### Step 2: Create Database (If Not Already Created)

1. In phpMyAdmin, click **"New"** in the left sidebar
2. Enter database name: `student_itrack` (or your preferred name)
3. Choose collation: `utf8mb4_unicode_ci`
4. Click **"Create"**

### Step 3: Select Your Database

1. Click on your database name in the left sidebar
2. Make sure you're viewing the database (you'll see an empty database or existing tables)

### Step 4: Import the SQL File

1. Click the **"Import"** tab at the top
2. Click **"Choose File"** button
3. Navigate to: `server/scripts/database-export.sql`
4. Select the file
5. **Important Settings:**
   - **Format:** SQL (should be auto-detected)
   - **Partial import:** Leave unchecked
   - **Character set:** utf8mb4 (or auto-detect)
6. Click **"Go"** button at the bottom

### Step 5: Wait for Import

- The import may take 30 seconds to a few minutes depending on file size
- You'll see a progress bar
- When complete, you'll see: **"Import has been successfully finished"**

### Step 6: Verify Import

1. Check the left sidebar - you should see all tables:
   - ✅ professors
   - ✅ students
   - ✅ courses
   - ✅ enrollments
   - ✅ grades
   - ✅ attendance
   - ✅ notifications
   - (and others)

2. Click on a table (e.g., `professors`) to verify data was imported

---

## Alternative: Using MySQL Command Line

If you have SSH access to Hostinger VPS:

```bash
# Upload the SQL file to your server first (using FTP/SFTP)
# Then run:

mysql -u your_username -p your_database_name < database-export.sql
```

---

## After Import

### Update Your Backend Configuration

Update your `server/.env` file with Hostinger database credentials:

```env
DB_HOST=your-mysql-hostname.hostinger.com
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=student_itrack
```

**Where to find these:**
- Login to Hostinger hPanel
- Go to **"MySQL Databases"**
- You'll see:
  - **Hostname:** Usually `localhost` or `mysql.hostinger.com`
  - **Username:** Your MySQL username
  - **Database name:** Your database name

---

## Troubleshooting

### Error: "File too large"
**Solution:** Increase upload limit in phpMyAdmin:
1. In phpMyAdmin, go to **"Settings"** → **"Import"**
2. Increase **"Maximum upload size"** (or ask Hostinger support)

**OR** Split the file:
```bash
# Use a text editor to split the SQL file into smaller chunks
# Or use command line tools to split it
```

### Error: "SQL syntax error"
**Solution:** 
- Make sure you selected the correct database before importing
- Check that the file wasn't corrupted during upload
- Try importing again

### Error: "Table already exists"
**Solution:**
- If you want to replace existing data, drop tables first:
  1. Select all tables
  2. Choose **"Drop"** from dropdown
  3. Confirm deletion
  4. Then import again

### Error: "Access denied"
**Solution:**
- Verify your MySQL username and password
- Make sure the user has permissions on the database
- Check database name matches

---

## File Location

Your database export file is here:
```
server/scripts/database-export.sql
```

**Total Size:** 500.83 KB  
**Contains:** All 12 tables with data

---

## What's Included

The export includes:
- ✅ **professors** - 7 records
- ✅ **students** - 18 records  
- ✅ **courses** - 13 records
- ✅ **enrollments** - 36 records
- ✅ **grades** - 59 records
- ✅ **attendance** - 83 records
- ✅ **notifications** - 344 records
- ✅ Plus other tables (attendance_records, audit_trail, class_sections, enrollment, subjects)

---

## Next Steps After Import

1. ✅ Verify all tables imported correctly
2. ✅ Update backend `.env` with Hostinger database credentials
3. ✅ Test database connection from your backend
4. ✅ Deploy your backend to Hostinger VPS (or use external hosting)
5. ✅ Update frontend API URL to point to your backend

Good luck with your deployment! 🚀



