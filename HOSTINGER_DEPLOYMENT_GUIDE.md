# Hostinger Deployment Guide

## Project Overview

Your project consists of:
- **Frontend**: React + Vite (static files after build)
- **Backend**: Express.js + Node.js (requires Node.js runtime)
- **Database**: MySQL (Hostinger supports this)
- **Authentication**: Firebase (works from anywhere)

---

## Deployment Options

### Option 1: Shared Hosting (What You Have) - Frontend Only ⚠️

**What Works:**
- ✅ React frontend (static files)
- ✅ MySQL database
- ✅ Firebase authentication

**What Doesn't Work:**
- ❌ Node.js/Express backend (shared hosting doesn't support Node.js)

**Solution:** Deploy backend separately (see Option 2 or 3)

---

### Option 2: Upgrade to Hostinger VPS (Recommended) ✅

**What Works:**
- ✅ Full-stack deployment (frontend + backend)
- ✅ MySQL database
- ✅ Node.js runtime
- ✅ Complete control

**Cost:** ~$3.99-9.99/month (check Hostinger pricing)

---

### Option 3: Hybrid Approach (Budget-Friendly) 💡

**Frontend:** Hostinger Shared Hosting
**Backend:** Free/Cheap Node.js hosting:
- **Render.com** (free tier available)
- **Railway.app** (free tier)
- **Fly.io** (free tier)
- **Heroku** (paid, but reliable)

**Database:** Hostinger MySQL (works from anywhere)

---

## Step-by-Step Deployment

### PART A: Deploy Frontend to Hostinger Shared Hosting

#### Step 1: Build Your React App

```powershell
cd client
npm install
npm run build
```

This creates a `dist` folder with static files.

#### Step 2: Upload to Hostinger

1. **Login to Hostinger hPanel**
2. **Go to File Manager** (or use FTP)
3. **Navigate to `public_html` folder**
4. **Upload ALL files from `client/dist` folder**:
   - `index.html`
   - `assets/` folder (and all contents)

#### Step 3: Configure Domain

- Your domain should point to `public_html`
- Access your site: `https://yourdomain.org`

#### Step 4: Update API URL

Before building, update `client/.env.production`:

```env
VITE_API_URL=https://your-backend-url.com/api
```

Then rebuild: `npm run build`

---

### PART B: Deploy Backend (Choose One)

#### Option B1: Hostinger VPS (Full Control)

**Step 1: Set Up VPS**
1. Purchase Hostinger VPS
2. SSH into your server
3. Install Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

**Step 2: Upload Backend**
```bash
# Upload server folder to VPS
scp -r server/ user@your-vps-ip:/home/user/
```

**Step 3: Install Dependencies**
```bash
cd server
npm install --production
```

**Step 4: Configure Environment**
```bash
# Create .env file
nano .env
```

Add your configuration:
```env
NODE_ENV=production
PORT=5000

# MySQL (from Hostinger shared hosting)
DB_HOST=your-mysql-hostname.hostinger.com
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name

# Frontend URL
FRONTEND_URL=https://yourdomain.org

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
```

**Step 5: Set Up MySQL Database**

1. **In Hostinger hPanel:**
   - Go to **MySQL Databases**
   - Create new database: `student_itrack`
   - Create user and grant privileges
   - Note down: hostname, username, password

2. **Run Database Setup:**
   ```bash
   # On your VPS
   cd server
   node scripts/setup-database.js
   ```

**Step 6: Start Backend Server**

Using PM2 (recommended):
```bash
# Install PM2 globally
sudo npm install -g pm2

# Start server
cd server
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

**Step 7: Configure Nginx (Reverse Proxy)**

```bash
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/yourdomain
```

Add configuration:
```nginx
server {
    listen 80;
    server_name api.yourdomain.org;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/yourdomain /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Step 8: Set Up SSL (HTTPS)**

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.org
```

---

#### Option B2: Render.com (Free Backend Hosting)

**Step 1: Create Account**
- Go to [render.com](https://render.com)
- Sign up (free)

**Step 2: Create Web Service**
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repo (or upload manually)
3. Configure:
   - **Name**: `student-itrack-api`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

**Step 3: Add Environment Variables**
In Render dashboard, add:
```
NODE_ENV=production
PORT=10000
DB_HOST=your-mysql-hostname.hostinger.com
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
FRONTEND_URL=https://yourdomain.org
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
```

**Step 4: Get Backend URL**
- Render provides: `https://your-app.onrender.com`
- Update frontend `.env.production`: `VITE_API_URL=https://your-app.onrender.com/api`

---

### PART C: Database Setup (Hostinger MySQL)

**Step 1: Create Database**
1. Login to Hostinger hPanel
2. Go to **MySQL Databases**
3. Create database: `student_itrack`
4. Create user and grant all privileges
5. Note: hostname, username, password

**Step 2: Import Schema**
You'll need to run the database setup script. Options:

**Option 1: From VPS/Backend Server**
```bash
cd server
node scripts/setup-database.js
```

**Option 2: Using phpMyAdmin**
1. Go to **phpMyAdmin** in hPanel
2. Select your database
3. Import SQL file (if you have one)

**Option 3: Manual SQL**
Run the SQL commands from `server/scripts/create-tables-simple.js` manually in phpMyAdmin.

---

## Configuration Checklist

### Frontend (`client/.env.production`)
```env
VITE_API_URL=https://your-backend-url.com/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Backend (`server/.env`)
```env
NODE_ENV=production
PORT=5000
DB_HOST=your-mysql-hostname.hostinger.com
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=student_itrack
FRONTEND_URL=https://yourdomain.org
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
```

---

## Testing Deployment

1. **Frontend**: Visit `https://yourdomain.org`
2. **Backend**: Test API endpoint: `https://your-backend-url.com/api/health`
3. **Database**: Verify connection from backend logs
4. **Authentication**: Try logging in

---

## Troubleshooting

### Frontend Issues
- **404 Errors**: Check `.htaccess` file (see below)
- **API Errors**: Verify `VITE_API_URL` in build
- **CORS Errors**: Update backend `FRONTEND_URL`

### Backend Issues
- **Port Already in Use**: Change `PORT` in `.env`
- **Database Connection**: Verify MySQL credentials
- **Firebase Errors**: Check service account key format

### Database Issues
- **Connection Refused**: Check MySQL hostname
- **Access Denied**: Verify user permissions
- **Table Missing**: Run setup script

---

## Additional Files Needed

### `.htaccess` for Frontend (React Router)

Create `public_html/.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

This ensures React Router works correctly.

---

## Cost Summary

### Option 1: Shared Hosting + Free Backend
- Hostinger Shared: ~$2-4/month
- Render/Railway Backend: Free
- **Total: ~$2-4/month**

### Option 2: VPS (All-in-One)
- Hostinger VPS: ~$4-10/month
- **Total: ~$4-10/month**

---

## Recommended Approach

**For Production:** Use **Option 2 (VPS)** - Full control, better performance

**For Testing/Budget:** Use **Option 3 (Hybrid)** - Shared hosting + free backend

---

## Next Steps

1. ✅ Choose deployment option
2. ✅ Set up MySQL database in Hostinger
3. ✅ Build and upload frontend
4. ✅ Deploy backend (VPS or Render)
5. ✅ Configure environment variables
6. ✅ Test all functionality
7. ✅ Set up SSL/HTTPS
8. ✅ Monitor logs and performance

---

## Support

If you encounter issues:
1. Check server logs: `pm2 logs` (if using PM2)
2. Check browser console for frontend errors
3. Verify all environment variables
4. Test database connection separately
5. Check CORS configuration

Good luck with your deployment! 🚀



