# Backend Deployment Solutions for Hostinger

## The Problem

**Hostinger Shared Hosting** (what you have) **does NOT support Node.js/Express.js backends**.

This is why:
- ✅ Frontend works (static files - HTML, CSS, JS)
- ❌ Backend doesn't work (needs Node.js runtime)

---

## Solutions (Choose One)

### Option 1: Upgrade to Hostinger VPS (Recommended) ✅

**Best for:** Full control, better performance, all-in-one solution

**Steps:**
1. **Upgrade to Hostinger VPS** (~$4-10/month)
2. **SSH into your VPS**
3. **Install Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
4. **Upload backend files** via SFTP or Git
5. **Install dependencies:**
   ```bash
   cd server
   npm install --production
   ```
6. **Configure environment:**
   ```bash
   nano .env
   # Add your Hostinger MySQL credentials
   ```
7. **Start backend with PM2:**
   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

**Pros:**
- Full control
- Better performance
- Everything in one place
- Professional setup

**Cons:**
- Costs more (~$4-10/month)
- Requires some server management

---

### Option 2: Use Free Backend Hosting (Budget-Friendly) 💰

**Best for:** Keeping costs low, testing, small projects

Deploy backend separately on free hosting:

#### A. Render.com (Recommended - Free Tier)

1. **Sign up:** [render.com](https://render.com) (free)
2. **Create Web Service:**
   - Connect GitHub repo OR upload manually
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
3. **Add Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   DB_HOST=your-mysql-hostname.hostinger.com
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=student_itrack
   FRONTEND_URL=https://yourdomain.org
   FIREBASE_PROJECT_ID=...
   FIREBASE_PRIVATE_KEY=...
   FIREBASE_CLIENT_EMAIL=...
   ```
4. **Get Backend URL:** `https://your-app.onrender.com`
5. **Update Frontend:** Change `VITE_API_URL` to your Render URL

**Pros:**
- ✅ Free tier available
- ✅ Easy setup
- ✅ Automatic HTTPS
- ✅ Auto-deploys from Git

**Cons:**
- ⚠️ Free tier spins down after inactivity (15 min cold start)
- ⚠️ Limited resources on free tier

#### B. Railway.app (Free Tier)

Similar to Render, also has free tier:
- Sign up at [railway.app](https://railway.app)
- Deploy from GitHub or upload files
- Free tier includes $5 credit/month

#### C. Fly.io (Free Tier)

- Sign up at [fly.io](https://fly.io)
- Deploy with `flyctl` CLI
- Free tier available

---

### Option 3: Use Hostinger VPS + Free Backend (Hybrid)

**Best for:** Database on Hostinger, backend elsewhere

1. **Keep MySQL on Hostinger** (shared hosting)
2. **Deploy backend to Render/Railway** (free)
3. **Connect backend to Hostinger MySQL**

**Configuration:**
```env
# In Render/Railway backend .env:
DB_HOST=your-mysql-hostname.hostinger.com
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=student_itrack
```

---

## Step-by-Step: Deploy Backend to Render.com (Free)

### Step 1: Prepare Your Backend

1. **Make sure `server/package.json` has:**
   ```json
   {
     "scripts": {
       "start": "node src/server.js"
     }
   }
   ```

2. **Create `server/.env` template** (don't commit actual values):
   ```env
   NODE_ENV=production
   PORT=10000
   DB_HOST=your-mysql-hostname.hostinger.com
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=student_itrack
   FRONTEND_URL=https://yourdomain.org
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY="..."
   FIREBASE_CLIENT_EMAIL=...
   ```

### Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up (free)
3. Verify email

### Step 3: Create Web Service

1. Click **"New +"** → **"Web Service"**
2. **Connect Repository** (if using Git) OR **Manual Deploy**
3. **Configure:**
   - **Name:** `student-itrack-api`
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** `Free`

### Step 4: Add Environment Variables

In Render dashboard, go to **"Environment"** tab and add:

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

**Important:** For `FIREBASE_PRIVATE_KEY`, paste the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (2-5 minutes)
3. Get your backend URL: `https://student-itrack-api.onrender.com`

### Step 6: Update Frontend

1. **Rebuild frontend** with new API URL:
   ```bash
   cd client
   # Create/update .env.production
   echo "VITE_API_URL=https://student-itrack-api.onrender.com/api" > .env.production
   npm run build
   ```

2. **Upload new `dist` folder** to Hostinger

---

## Step-by-Step: Deploy Backend to Hostinger VPS

### Step 1: Purchase VPS

1. Login to Hostinger
2. Upgrade to **VPS hosting**
3. Wait for VPS to be provisioned (usually instant)

### Step 2: SSH into VPS

**Windows:**
- Use **PuTTY** or **Windows Terminal**
- SSH command: `ssh root@your-vps-ip`

**Mac/Linux:**
```bash
ssh root@your-vps-ip
```

### Step 3: Install Node.js

```bash
# Update system
apt-get update && apt-get upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 4: Install MySQL Client (if needed)

```bash
apt-get install -y mysql-client
```

### Step 5: Upload Backend Files

**Option A: Using SFTP (FileZilla, WinSCP)**
- Connect via SFTP
- Upload `server/` folder to `/home/user/` or `/var/www/`

**Option B: Using Git**
```bash
# Install Git
apt-get install -y git

# Clone your repo (if on GitHub)
git clone https://github.com/your-username/your-repo.git
cd your-repo/server
```

### Step 6: Install Dependencies

```bash
cd server
npm install --production
```

### Step 7: Configure Environment

```bash
nano .env
```

Add your configuration:
```env
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=student_itrack
FRONTEND_URL=https://yourdomain.org
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY="..."
FIREBASE_CLIENT_EMAIL=...
```

Save: `Ctrl+X`, then `Y`, then `Enter`

### Step 8: Import Database

```bash
# Import your database
mysql -u your_username -p student_itrack < scripts/database-export.sql
```

### Step 9: Install PM2 (Process Manager)

```bash
npm install -g pm2
```

### Step 10: Start Backend

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
# Follow the instructions it gives you
```

### Step 11: Configure Nginx (Reverse Proxy)

```bash
# Install Nginx
apt-get install -y nginx

# Create config file
nano /etc/nginx/sites-available/yourdomain
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
ln -s /etc/nginx/sites-available/yourdomain /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 12: Set Up SSL (HTTPS)

```bash
# Install Certbot
apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d api.yourdomain.org
```

---

## Recommended Approach

**For Production:** Use **Option 1 (VPS)** - Full control, better performance

**For Testing/Budget:** Use **Option 2 (Render.com)** - Free, easy setup

---

## Quick Comparison

| Solution | Cost | Setup Difficulty | Performance | Best For |
|----------|------|------------------|-------------|----------|
| Hostinger VPS | $4-10/mo | Medium | ⭐⭐⭐⭐⭐ | Production |
| Render.com | Free | Easy | ⭐⭐⭐⭐ | Testing/Small |
| Railway.app | Free | Easy | ⭐⭐⭐⭐ | Testing/Small |
| Fly.io | Free | Medium | ⭐⭐⭐⭐ | Testing/Small |

---

## After Backend is Deployed

1. ✅ Update frontend `VITE_API_URL` to point to your backend
2. ✅ Rebuild frontend: `npm run build`
3. ✅ Upload new `dist` folder to Hostinger
4. ✅ Test the connection
5. ✅ Verify API endpoints work

---

## Need Help?

If you choose Render.com, I can help you:
- Set up the deployment
- Configure environment variables
- Troubleshoot connection issues

If you choose VPS, I can help you:
- Set up Node.js
- Configure PM2
- Set up Nginx
- Configure SSL

Let me know which option you prefer! 🚀



