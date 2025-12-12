# STUDiTrack - Smart Academic Monitoring System

A comprehensive academic monitoring system for University of Mindanao Tagum College - Visayan Campus, built with React (Vite) frontend and Express.js backend.

## Project Structure

```
STUDiTrack1/
├── client/                 # React frontend application
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services and business logic
│   │   ├── utils/        # Utility functions
│   │   └── hooks/        # Custom React hooks
│   ├── package.json
│   └── vite.config.js
│
├── server/                # Express.js backend API
│   ├── src/
│   │   ├── professor/    # Professor-related routes, controllers, models
│   │   ├── student/       # Student-related routes, controllers, models
│   │   └── shared/       # Shared middleware, utilities, models
│   ├── scripts/          # Database and utility scripts
│   └── package.json
│
├── docs/                  # Documentation
│   ├── deployment/       # Deployment guides and configs
│   └── *.md             # Various documentation files
│
├── scripts/               # Root-level utility scripts
│
├── sql/                   # SQL database files
│   ├── schema.sql        # Database schema (CREATE TABLE statements)
│   └── database-export.sql  # Full database export (schema + data)
│
└── .gitignore           # Git ignore rules
```

## Quick Start

### Prerequisites
- Node.js >= 18.0.0
- MySQL database
- Firebase project (for authentication)

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

### Backend Setup

```bash
cd server
npm install
cp env.production.template .env
# Edit .env with your configuration
npm start
```

## Features

- **Authentication**: Firebase-based authentication with role-based access (Professor/Student)
- **Student Dashboard**: View grades, attendance, courses, and notifications
- **Professor Dashboard**: Manage courses, students, grades, attendance, and generate reports
- **Security**: Comprehensive security measures including rate limiting, CSRF protection, input sanitization
- **Responsive Design**: Mobile-friendly interface with dark/light theme support

## Documentation

- [Security Documentation](docs/AUTHENTICATION_SECURITY_FIX.md)
- [Deployment Guides](docs/deployment/)
- [Server Setup](server/env.production.template)

## Development

### Running in Development Mode

**Frontend:**
```bash
cd client
npm run dev
```

**Backend:**
```bash
cd server
npm run dev
```

### Building for Production

**Frontend:**
```bash
cd client
npm run build
```

**Backend:**
```bash
cd server
npm start
```

## Security

The application includes comprehensive security measures:
- Rate limiting
- CSRF protection
- Input sanitization
- SQL injection prevention
- XSS protection
- Security headers (Helmet.js)

See [Security Documentation](docs/AUTHENTICATION_SECURITY_FIX.md) for details.

## License

ISC

