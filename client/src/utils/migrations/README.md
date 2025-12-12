# Migration Utilities

This directory contains migration utilities for client-side data migrations.

## Files

- `studentIdMigration.js` - Student ID migration utilities
  - `migrateDashboardData()` - Migrate dashboard data (actively used)
  - `migrateStudents()` - Migrate students data
  - `migrateEnrollments()` - Migrate enrollments data
  - `migrateRecords()` - Migrate records data
  - `migrateGrades()` - Migrate grades data

## Usage

These utilities are used internally by the application for data migration purposes. The `migrateDashboardData()` function is actively used in `Prof.jsx` to migrate legacy student IDs to numerical IDs.

## Notes

- Migration utilities are for data migration tasks
- Always backup data before running migrations
- Test migrations in a development environment first

