# Server Scripts

This directory contains utility scripts for the STUDiTrack server.

## Directory Structure

```
scripts/
├── migrations/      # Database migration scripts
├── tests/          # Test and debugging scripts
├── setup/          # Database setup and initialization scripts
├── utilities/      # General utility scripts
└── deployment/      # Deployment-related scripts
```

## Scripts by Category

### Migrations (`migrations/`)
- `migrate-firestore-to-mysql.js` - Migrate data from Firestore to MySQL
- `migrate-professor-enrolls-to-mysql.js` - Migrate professor enrollments
- `check-migration-stats.js` - Check migration statistics

### Tests (`tests/`)
- `test-db-connection.js` - Test database connection
- `test-notifications-flow.js` - Test notifications flow
- `test-professor-create.js` - Test professor creation
- `test-student-25-notifications.js` - Test student notifications
- `test-student-notifications-api.js` - Test notifications API
- `debug-student-notifications.js` - Debug student notifications
- `debug-student-notifications-display.js` - Debug notification display
- `check-course-terms.js` - Check course terms
- `check-notifications-table.js` - Check notifications table

### Setup (`setup/`)
- `setup-database.js` - Initialize database schema
- `create-tables-simple.js` - Create database tables
- `create-missing-tables.js` - Create missing tables
- `add-term-to-courses.js` - Add term to courses

### Utilities (`utilities/`)
- `export-database.js` - Export database
- `export-full-database.js` - Export full database
- `database-export.sql` - Database export SQL file
- `free-port.ps1` - Free up a port (PowerShell)
- `start-server.ps1` - Start server script (PowerShell)

### Deployment (`deployment/`)
- `deploy-to-vps.sh` - Deploy to VPS
- `setup-domain-connection.sh` - Setup domain connection
- `quick-domain-check.sh` - Quick domain check

## Usage

### Running Migrations
```bash
npm run migrate
```

### Testing Database Connection
```bash
npm run test-db
```

### Setting Up Database
```bash
npm run setup-db
```

### Running Individual Scripts
```bash
# Migration script
node scripts/migrations/migrate-firestore-to-mysql.js

# Test script
node scripts/tests/test-db-connection.js

# Setup script
node scripts/setup/setup-database.js
```

## Notes

- Always backup your database before running migration scripts
- Test scripts are for development and debugging purposes
- Deployment scripts may require specific environment configurations

