# Why Backend Doesn't Work on Hostinger Shared Hosting

## The Problem

**Hostinger Shared Hosting** only supports:
- ✅ PHP scripts
- ✅ Static files (HTML, CSS, JavaScript)
- ✅ MySQL databases

**It does NOT support:**
- ❌ Node.js runtime
- ❌ Express.js servers
- ❌ Any server-side JavaScript

**This is why:**
- ✅ Your frontend works (it's just static files)
- ❌ Your backend doesn't work (needs Node.js)

---

## Solutions (Choose One)

### 🚀 Solution 1: Deploy Backend to Render.com (FREE - Recommended)

**Best for:** Quick setup, no extra cost, keeps your current Hostinger plan

#### Steps:

1. **Sign up at Render.com** (free, no credit card)
   - Go to: https://render.com
   - Click "Get Started" → Sign up

2. **Create Web Service:**
   - Click **"New +"** → **"Web Service"**
   - Choose **"Manual Deploy"** (or connect GitHub if you have it)
   - Upload your `server` folder (zip it first)

3. **Configure:**
   - **Name:** `student-itrack-api`
   - **Root Directory:** `server` (or leave empty)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** `Free`

4. **Add Environment Variables** (in Render dashboard):
   ```
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

5. **Get Backend URL:**
   - Render gives you: `https://student-itrack-api.onrender.com`
   - Your API will be at: `https://student-itrack-api.onrender.com/api`

6. **Update Frontend:**
   ```bash
   cd client
   # Create .env.production file
   echo "VITE_API_URL=https://student-itrack-api.onrender.com/api" > .env.production
   npm run build
   ```

7. **Upload new `dist` folder** to Hostinger

**Done!** Your backend will now work! 🎉

---

### 💰 Solution 2: Upgrade to Hostinger VPS

**Best for:** Everything in one place, better performance

**Cost:** ~$4-10/month

**Steps:**
1. Upgrade to Hostinger VPS
2. SSH into VPS
3. Install Node.js
4. Upload backend files
5. Start with PM2

See `BACKEND_DEPLOYMENT_SOLUTIONS.md` for detailed VPS setup.

---

## Quick Setup: Render.com (5 Minutes)

### Step 1: Prepare Server Folder

1. **Zip your `server` folder:**
   - Right-click `server` folder → "Send to" → "Compressed (zipped) folder"
   - You'll get `server.zip`

### Step 2: Create Render Account

1. Go to https://render.com
2. Sign up (free, email verification required)

### Step 3: Deploy

1. **New +** → **Web Service**
2. **Manual Deploy** → Upload `server.zip`
3. **Settings:**
   - Name: `student-itrack-api`
   - Root Directory: `server`
   - Build: `npm install`
   - Start: `npm start`
4. **Environment** tab → Add all variables from above
5. **Create Web Service**

### Step 4: Wait & Get URL

- Wait 2-5 minutes for deployment
- Copy your URL: `https://student-itrack-api.onrender.com`

### Step 5: Update Frontend

```bash
cd client
# Edit .env.production
VITE_API_URL=https://student-itrack-api.onrender.com/api

# Rebuild
npm run build

# Upload new dist folder to Hostinger
```

---

## Architecture After Deployment

```
┌─────────────────────┐
│  Hostinger Shared   │
│  (Frontend)          │
│  yourdomain.org      │
└──────────┬──────────┘
           │ API Calls
           ▼
┌─────────────────────┐
│  Render.com          │
│  (Backend)           │
│  api.onrender.com    │
└──────────┬──────────┘
           │ Database
           ▼
┌─────────────────────┐
│  Hostinger MySQL    │
│  (Database)          │
│  student_itrack      │
└─────────────────────┘
```

---

## Cost Comparison

| Solution | Monthly Cost | Setup Time | Best For |
|----------|-------------|------------|----------|
| Render.com (Free) | $0 | 5 min | Testing/Small projects |
| Hostinger VPS | $4-10 | 30 min | Production |

---

## After Deployment

1. ✅ Backend will be accessible at Render URL
2. ✅ Frontend will call backend API
3. ✅ Database stays on Hostinger
4. ✅ Everything works together!

---

## Need Help?

If you choose Render.com, I can help you:
- Set up the deployment
- Configure environment variables
- Troubleshoot connection issues

Just let me know! 🚀



