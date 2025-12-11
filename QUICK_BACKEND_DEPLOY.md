# Quick Backend Deployment Guide

## Why Backend Doesn't Work on Shared Hosting

**Hostinger Shared Hosting** only supports:
- ✅ PHP
- ✅ Static files (HTML, CSS, JS)
- ✅ MySQL database

**It does NOT support:**
- ❌ Node.js
- ❌ Express.js
- ❌ Any server-side JavaScript

---

## Fastest Solution: Render.com (Free)

### Step 1: Sign Up
1. Go to [render.com](https://render.com)
2. Sign up (free, no credit card needed)

### Step 2: Create Web Service

1. Click **"New +"** → **"Web Service"**
2. **Manual Deploy** (or connect GitHub if you have it)
3. **Upload your `server` folder** (zip it first, then upload)
4. **Configure:**
   - **Name:** `student-itrack-api`
   - **Root Directory:** `server` (or leave empty if you uploaded server folder)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** `Free`

### Step 3: Add Environment Variables

In Render dashboard → **Environment** tab, add:

```env
NODE_ENV=production
PORT=10000
DB_HOST=your-mysql-hostname.hostinger.com
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=student_itrack
FRONTEND_URL=https://yourdomain.org
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
```

**Get MySQL credentials from Hostinger:**
1. Login to Hostinger hPanel
2. Go to **"MySQL Databases"**
3. Copy: Hostname, Username, Password, Database name

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait 2-5 minutes for deployment
3. Get your backend URL: `https://student-itrack-api.onrender.com`

### Step 5: Update Frontend

1. **Edit `client/.env.production`:**
   ```env
   VITE_API_URL=https://student-itrack-api.onrender.com/api
   ```

2. **Rebuild frontend:**
   ```bash
   cd client
   npm run build
   ```

3. **Upload new `dist` folder** to Hostinger

---

## Alternative: Hostinger VPS

If you want everything on Hostinger:

1. **Upgrade to VPS** (~$4-10/month)
2. **SSH into VPS**
3. **Install Node.js** (see `BACKEND_DEPLOYMENT_SOLUTIONS.md`)
4. **Upload backend files**
5. **Start with PM2**

---

## Test Your Backend

After deployment, test:

```bash
# Test health endpoint
curl https://your-backend-url.onrender.com/api/health

# Should return: {"status":"ok","message":"Server is running"}
```

---

## Common Issues

### Backend URL Not Working
- Check Render dashboard for deployment logs
- Verify environment variables are set
- Check that `PORT` is set (Render uses dynamic ports)

### Database Connection Failed
- Verify MySQL hostname (might be `localhost` or `mysql.hostinger.com`)
- Check username/password in Hostinger MySQL settings
- Ensure database exists and is imported

### CORS Errors
- Update `FRONTEND_URL` in backend `.env` to your actual domain
- Check backend `server.js` CORS configuration

---

## File Structure for Render

When uploading to Render, your structure should be:

```
server/
├── src/
│   └── server.js
├── package.json
├── .env (or set in Render dashboard)
└── ...
```

Render will:
1. Run `npm install` (build command)
2. Run `npm start` (start command)
3. Make it available at `https://your-app.onrender.com`

---

## Cost Summary

- **Render.com:** Free (with limitations)
- **Hostinger VPS:** ~$4-10/month
- **Hostinger Shared:** ~$2-4/month (frontend only)

**Recommended:** Use Render.com for backend (free) + Hostinger shared for frontend

---

Need help with a specific step? Let me know! 🚀



