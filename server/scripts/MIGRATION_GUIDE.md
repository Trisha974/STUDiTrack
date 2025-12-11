# Firestore to MySQL Migration Guide

This guide explains how to migrate heavy academic data from Firestore to MySQL.

## Prerequisites

1. **Firebase Admin SDK configured** in `server/.env`:
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   ```

2. **MySQL database created** and schema applied:
   ```bash
   mysql -u root -p < server/src/models/schema.sql
   ```

3. **MySQL credentials** in `server/.env`:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=student_itrack
   ```

## What Gets Migrated

The migration script moves the following data from Firestore to MySQL:

1. **Students** - Student profiles with Firebase UID mapping
2. **Professors** - Professor profiles with Firebase UID mapping
3. **Courses** - Course/subject data with professor relationships
4. **Enrollments** - Student-course enrollments
5. **Grades** - Grade records with notifications for students
6. **Attendance** - Attendance records with notifications for students

## What Stays in Firestore

- User authentication (Firebase Auth)
- Lightweight notifications (if using Firestore for real-time notifications)
- Activity logs (if using Firestore)
- Configuration/tokens

## Running the Migration

### Step 1: Navigate to Server Directory
```powershell
cd server
```

### Step 2: Run the Migration Script
```powershell
node scripts/migrate-firestore-to-mysql.js
```

### Step 3: Monitor Progress
The script will:
- Show progress for each collection
- Skip existing records (won't overwrite)
- Create notifications for migrated grades and attendance
- Display summary statistics

## Migration Behavior

### Safe Migration
- **Existing records are skipped** - The script checks if records already exist before inserting
- **No data loss** - Original Firestore data remains untouched
- **Idempotent** - Can be run multiple times safely

### Data Mapping
- **Firebase UIDs** → MySQL IDs (mapped automatically)
- **Course codes** → MySQL course IDs (mapped automatically)
- **Foreign keys** → Properly linked (students, courses, etc.)

### Notifications
- **Grades** → Creates notifications for all students when grades are migrated
- **Attendance** → Creates notifications for non-present attendance records
- **Enrollments** → Notifications created when new enrollments are added (not during migration)

## After Migration

### Verify Data
1. Check MySQL database:
   ```sql
   SELECT COUNT(*) FROM students;
   SELECT COUNT(*) FROM professors;
   SELECT COUNT(*) FROM courses;
   SELECT COUNT(*) FROM enrollments;
   SELECT COUNT(*) FROM grades;
   SELECT COUNT(*) FROM attendance;
   SELECT COUNT(*) FROM notifications;
   ```

2. Test the application:
   - Login as a student - verify grades and attendance appear
   - Login as a professor - verify courses and data appear
   - Check notifications - verify migrated data has notifications

### Update Frontend
The frontend should already be using the API endpoints, but verify:
- Student dashboard shows grades and attendance from MySQL
- Professor dashboard shows courses and data from MySQL
- Notifications appear correctly

## Troubleshooting

### Firebase Admin Not Initialized
```
❌ Firebase Admin initialization failed
```
**Solution**: Check `.env` file has correct Firebase Admin credentials

### MySQL Connection Failed
```
❌ MySQL connection error
```
**Solution**: 
1. Verify MySQL is running
2. Check `.env` has correct database credentials
3. Ensure database exists: `CREATE DATABASE student_itrack;`

### Foreign Key Errors
```
❌ Error: Cannot add or update a child row
```
**Solution**: Ensure migration runs in order:
1. Students
2. Professors
3. Courses
4. Enrollments
5. Grades
6. Attendance

### Missing Data
If some data doesn't migrate:
- Check Firestore collection names match expected names
- Verify Firebase UIDs exist in students/professors collections
- Check console logs for specific error messages

## Rollback

If you need to rollback:
1. **Don't delete Firestore data** - It's still there
2. **Clear MySQL tables** (if needed):
   ```sql
   DELETE FROM notifications;
   DELETE FROM attendance;
   DELETE FROM grades;
   DELETE FROM enrollments;
   DELETE FROM courses;
   DELETE FROM students;
   DELETE FROM professors;
   ```
3. **Re-run migration** after fixing issues

## Next Steps

After successful migration:
1. ✅ Verify all data migrated correctly
2. ✅ Test student dashboard shows grades/attendance
3. ✅ Test professor dashboard shows courses/data
4. ✅ Verify notifications work
5. ✅ Test new professor inputs reflect on student dashboards
6. ✅ Monitor for any issues

## Support

If you encounter issues:
1. Check the console output for specific errors
2. Verify all prerequisites are met
3. Check MySQL and Firebase Admin configurations
4. Review the migration logs for skipped records


