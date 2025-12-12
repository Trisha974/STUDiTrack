# Project Structure Documentation

## Clean Folder Structure

This document describes the cleaned and organized folder structure of the STUDiTrack project.

## Root Directory

```
STUDiTrack1/
├── client/              # Frontend React application
├── server/             # Backend Express.js API
├── docs/               # All documentation
├── scripts/            # Root-level utility scripts
├── sql/                # SQL database files
│   ├── schema.sql      # Database schema (CREATE TABLE statements)
│   └── database-export.sql  # Full database export (schema + data)
├── .gitignore         # Git ignore rules
└── README.md          # Main project documentation
```

## Client Structure (`client/`)

```
client/
├── public/            # Static assets (images, icons, logos)
│   └── assets/
├── src/
│   ├── components/    # Reusable React components
│   │   ├── Navbar/
│   │   ├── ProtectedRoute.jsx
│   │   └── ThemeToggle/
│   ├── pages/         # Page components
│   │   ├── Dev/       # Development utilities
│   │   ├── Login/     # Authentication page
│   │   ├── Prof/      # Professor dashboard
│   │   └── Student/   # Student dashboard
│   ├── services/      # API services and business logic
│   │   ├── api/       # API client functions
│   │   └── *.js       # Service modules
│   ├── utils/         # Utility functions
│   ├── hooks/         # Custom React hooks
│   ├── App.jsx        # Main app component
│   ├── App.css        # Global styles
│   ├── main.jsx       # Entry point
│   └── firebase.js    # Firebase configuration
├── dist/              # Build output (gitignored)
├── package.json
├── vite.config.js
└── README.md
```

## Server Structure (`server/`)

```
server/
├── src/
│   ├── professor/     # Professor-related functionality
│   │   ├── controllers/
│   │   ├── models/
│   │   └── routes/
│   ├── student/       # Student-related functionality
│   │   ├── controllers/
│   │   ├── models/
│   │   └── routes/
│   ├── shared/        # Shared functionality
│   │   ├── config/    # Configuration files
│   │   ├── controllers/
│   │   ├── middleware/ # Security, auth, validation
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   └── server.js      # Main server file
├── scripts/           # Database and utility scripts
│   ├── setup-database.js
│   ├── migrate-*.js
│   ├── test-*.js
│   └── *.ps1         # PowerShell utility scripts
├── package.json
└── env.production.template
```

## Documentation Structure (`docs/`)

```
docs/
├── deployment/        # Deployment-related files
│   └── nginx-config-example.conf
├── AUTHENTICATION_SECURITY_FIX.md
├── FIX_SSL_CERTIFICATE_ERROR.md
├── HOSTINGER_OPENLITESPEED_QUICK_SETUP.md
└── *.md, *.txt, *.sh  # Various documentation files
```

## Scripts Structure (`scripts/`)

```
scripts/
├── export-database.ps1
└── quick-nav.ps1
```

## SQL Files Structure (`sql/`)

```
sql/
├── schema.sql              # Database schema (CREATE TABLE statements only)
└── database-export.sql     # Full database export (schema + data)
```

**Note**: All SQL files are centralized in the `sql/` folder at the project root. Scripts reference these files using relative paths from their location.

## Files Removed During Cleanup

### Backup/Temp Files
- `client/src/pages/Prof/Prof.jsx.backup`
- `client/src/pages/Prof/Prof.jsx.temp`
- `client/src/pages/Prof/auto-restore-prof.ps1`
- `client/src/pages/Prof/restore-prof.ps1`

### Empty Directories
- `client/src/api/` (empty)
- `client/src/firebase/` (empty)
- `database/` (empty)
- `firebase/` (empty)

### Root Directory Cleanup
- `package-lock.json` (empty, unnecessary)
- `quick-nav.ps1` (moved to `scripts/`)
- `export-database.ps1` (moved to `scripts/`)
- `nginx-config-example.conf` (moved to `docs/deployment/`)
- `AUTHENTICATION_SECURITY_FIX.md` (moved to `docs/`)

## Files Fixed

- `client/src/pages/Prof/subject-icon.png.png` → `subject-icon.png` (fixed double extension)

## Git Ignore Rules

The `.gitignore` file now properly excludes:
- `node_modules/`
- `dist/` build outputs
- `.env` files
- Backup files (`*.backup`, `*.temp`, `*.bak`, `*.old`)
- Log files
- IDE files
- OS files

## Best Practices

1. **Source Code**: Only production code in `src/` directories
2. **Scripts**: Utility scripts in `scripts/` folders
3. **Documentation**: All docs in `docs/` folder
4. **Configuration**: Config files at appropriate levels
5. **Build Outputs**: Excluded via `.gitignore`
6. **No Backup Files**: Use version control instead

## Maintenance

- Regularly check for backup/temp files
- Keep documentation updated
- Maintain clean folder structure
- Use `.gitignore` to prevent committing unnecessary files

