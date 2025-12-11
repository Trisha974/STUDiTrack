# Complete Guide: Deploy Backend to Hostinger VPS

This guide will walk you through deploying your Node.js backend server to Hostinger VPS step by step.

---

## Prerequisites

- ✅ Hostinger VPS account (upgraded from shared hosting)
- ✅ SSH access to your VPS
- ✅ Your backend code ready to deploy
- ✅ MySQL database credentials from Hostinger

---

## Step 1: Get VPS Access Information

1. **Login to Hostinger hPanel**
2. **Go to VPS Management**
3. **Note down:**
   - VPS IP Address: `xxx.xxx.xxx.xxx`
   - Root password (or SSH key)
   - SSH Port (usually `22`)

---

## Step 2: Connect to VPS via SSH

### Windows (PowerShell or Windows Terminal):

```powershell
ssh root@your-vps-ip
# Enter password when prompted
```

### Windows (PuTTY):
1. Download PuTTY: https://www.putty.org/
2. Enter VPS IP address
3. Port: `22`
4. Connection type: `SSH`
5. Click "Open"
6. Login: `root`
7. Enter password

### Mac/Linux Terminal:

```bash
ssh root@your-vps-ip
# Enter password when prompted
```

---

## Step 3: Update System & Install Node.js

Once connected to VPS, run these commands:

```bash
# Update system packages
apt-get update && apt-get upgrade -y

# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher

# Install Git (for cloning repo)
apt-get install -y git

# Install MySQL client (if you need to import database)
apt-get install -y mysql-client
```

---

## Step 4: Upload Backend Files to VPS

You have **3 options** to upload your backend:

### Option A: Using Git (Recommended if your code is on GitHub/GitLab)

```bash
# Clone your repository
cd /home
git clone https://github.com/your-username/your-repo.git
cd your-repo/server

# OR if you want to clone to a specific location:
cd /var/www
git clone https://github.com/your-username/your-repo.git
cd your-repo/server
```

### Option B: Using SFTP (FileZilla, WinSCP)

**Windows - FileZilla:**
1. Download FileZilla: https://filezilla-project.org/
2. File → Site Manager → New Site
3. **Host:** `sftp://your-vps-ip`
4. **Port:** `22`
5. **Protocol:** `SFTP`
6. **Logon Type:** `Normal`
7. **User:** `root`
8. **Password:** Your VPS password
9. Connect
10. Upload `server/` folder to `/var/www/` or `/home/`

**Windows - WinSCP:**
1. Download WinSCP: https://winscp.net/
2. Enter VPS IP, username `root`, password
3. Connect
4. Upload `server/` folder

### Option C: Using SCP (Command Line)

From your **local machine** (Windows PowerShell):

```powershell
# Navigate to your project root
cd "C:\Users\Angeli1\Documents\STUD1 - Copy"

# Upload server folder to VPS
scp -r server root@your-vps-ip:/var/www/
```

---

## Step 5: Install Backend Dependencies

On your VPS:

```bash
# Navigate to server directory
cd /var/www/server
# OR if you cloned via Git:
cd /home/your-repo/server

# Install production dependencies
npm install --production

# Verify installation
ls node_modules  # Should show installed packages
```

---

## Step 6: Configure Environment Variables

```bash
# Create .env file
nano .env
```

**Copy and paste this template**, then fill in your actual values:

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# MySQL Database Configuration
# If MySQL is on same VPS:
DB_HOST=localhost
# OR if MySQL is on Hostinger shared hosting:
# DB_HOST=your-mysql-hostname.hostinger.com

DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=student_itrack

# Frontend URL (Your domain)
FRONTEND_URL=https://yourdomain.com

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-firebase-client-email@your-project.iam.gserviceaccount.com

# CSRF Protection (optional)
CSRF_SECRET=your-random-secret-string-here
```

**To save in nano:**
- Press `Ctrl + X`
- Press `Y` to confirm
- Press `Enter` to save

**Get MySQL credentials from Hostinger:**
1. Login to Hostinger hPanel
2. Go to **"MySQL Databases"**
3. Copy: Hostname, Username, Password, Database name

---

## Step 7: Import Database (If Needed)

If you need to import your database:

```bash
# Option 1: Import from SQL file
mysql -u your_mysql_username -p student_itrack < scripts/database-export.sql

# Option 2: Import from local machine (from your Windows machine)
# First, export database locally:
# Then upload SQL file via SFTP
# Then import on VPS:
mysql -u your_mysql_username -p student_itrack < /path/to/database-export.sql
```

---

## Step 8: Install PM2 (Process Manager)

PM2 keeps your Node.js app running even after you disconnect:

```bash
# Install PM2 globally
npm install -g pm2

# Verify installation
pm2 --version
```

---

## Step 9: Create Logs Directory

```bash
# Create logs directory for PM2
mkdir -p logs
```

---

## Step 10: Start Backend with PM2

```bash
# Start backend using ecosystem.config.js
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs student-itrack-api

# Save PM2 configuration (so it persists after reboot)
pm2 save

# Set PM2 to start on system boot
pm2 startup
# Follow the instructions it gives you (usually run a sudo command)
```

**PM2 Commands:**
```bash
pm2 status              # Check app status
pm2 logs                # View logs
pm2 restart student-itrack-api  # Restart app
pm2 stop student-itrack-api     # Stop app
pm2 delete student-itrack-api   # Remove app from PM2
```

---

## Step 11: Configure Firewall

Allow incoming connections on port 5000 (or your chosen port):

```bash
# Install UFW (if not installed)
apt-get install -y ufw

# Allow SSH (important - don't lock yourself out!)
ufw allow 22/tcp

# Allow your backend port
ufw allow 5000/tcp

# Allow HTTP and HTTPS (for Nginx)
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

---

## Step 12: Set Up Nginx Reverse Proxy (Recommended)

Nginx will route traffic from port 80/443 to your Node.js app on port 5000:

```bash
# Install Nginx
apt-get install -y nginx

# Create Nginx configuration
nano /etc/nginx/sites-available/student-itrack-api
```

**Add this configuration:**

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;  # Change to your subdomain or domain

    # Logging
    access_log /var/log/nginx/student-itrack-api-access.log;
    error_log /var/log/nginx/student-itrack-api-error.log;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeout for long-running requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**Enable the site:**

```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/student-itrack-api /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# If test passes, restart Nginx
systemctl restart nginx

# Enable Nginx to start on boot
systemctl enable nginx
```

---

## Step 13: Set Up SSL Certificate (HTTPS)

```bash
# Install Certbot
apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
certbot --nginx -d api.yourdomain.com

# Follow the prompts:
# - Enter your email
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)

# Certbot will automatically update your Nginx config

# Test auto-renewal
certbot renew --dry-run
```

**SSL will auto-renew** - Certbot sets up a cron job automatically.

---

## Step 14: Configure Domain DNS

In your domain registrar (or Hostinger DNS settings):

1. **For subdomain (api.yourdomain.com):**
   - Type: `A`
   - Name: `api`
   - Value: `your-vps-ip`
   - TTL: `3600`

2. **For main domain (yourdomain.com):**
   - Type: `A`
   - Name: `@` (or leave blank)
   - Value: `your-vps-ip`
   - TTL: `3600`

**Wait 5-30 minutes** for DNS to propagate.

---

## Step 15: Test Your Backend

```bash
# Test locally on VPS
curl http://localhost:5000/api/health

# Test from your local machine
curl http://your-vps-ip:5000/api/health

# Test via domain (after DNS propagates)
curl https://api.yourdomain.com/api/health
```

**Expected response:**
```json
{"status":"ok","message":"Server is running"}
```

---

## Step 16: Update Frontend to Use New Backend URL

On your **local machine**:

1. **Edit `client/.env.production`:**
   ```env
   VITE_API_URL=https://api.yourdomain.com/api
   # OR if using IP:
   # VITE_API_URL=http://your-vps-ip:5000/api
   ```

2. **Rebuild frontend:**
   ```powershell
   cd client
   npm run build
   ```

3. **Upload `dist` folder** to Hostinger shared hosting

---

## Troubleshooting

### Backend Not Starting

```bash
# Check PM2 logs
pm2 logs student-itrack-api

# Check if port is in use
netstat -tulpn | grep 5000

# Test database connection
cd /var/www/server
node scripts/test-db-connection.js
```

### Nginx Not Working

```bash
# Check Nginx status
systemctl status nginx

# Check Nginx error logs
tail -f /var/log/nginx/error.log

# Test Nginx config
nginx -t

# Restart Nginx
systemctl restart nginx
```

### Database Connection Failed

```bash
# Test MySQL connection
mysql -u your_username -p -h your_host

# Check if MySQL is running (if on same VPS)
systemctl status mysql

# Check firewall allows MySQL port (usually 3306)
ufw status
```

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000
# OR
netstat -tulpn | grep 5000

# Kill the process
kill -9 <PID>
```

### PM2 App Keeps Crashing

```bash
# Check detailed logs
pm2 logs student-itrack-api --lines 100

# Check app status
pm2 describe student-itrack-api

# Restart app
pm2 restart student-itrack-api
```

---

## Quick Reference Commands

```bash
# Navigate to server
cd /var/www/server

# View PM2 status
pm2 status

# View logs
pm2 logs student-itrack-api

# Restart backend
pm2 restart student-itrack-api

# Stop backend
pm2 stop student-itrack-api

# Check Nginx status
systemctl status nginx

# Restart Nginx
systemctl restart nginx

# View Nginx logs
tail -f /var/log/nginx/error.log

# Test backend locally
curl http://localhost:5000/api/health
```

---

## Security Checklist

- ✅ Firewall configured (UFW)
- ✅ SSH key authentication (recommended over password)
- ✅ SSL certificate installed (HTTPS)
- ✅ Environment variables in `.env` (not committed to Git)
- ✅ PM2 running as non-root user (optional but recommended)
- ✅ Regular system updates: `apt-get update && apt-get upgrade`

---

## Next Steps

1. ✅ Backend is running on VPS
2. ✅ Frontend updated to use new backend URL
3. ✅ Test all API endpoints
4. ✅ Monitor logs: `pm2 logs student-itrack-api`
5. ✅ Set up automated backups
6. ✅ Configure monitoring (optional)

---

## Need Help?

Common issues:
- **Can't SSH:** Check firewall, verify IP and password
- **Port 5000 not accessible:** Check firewall rules, verify PM2 is running
- **Database connection failed:** Verify credentials, check MySQL hostname
- **Nginx 502 error:** Check if backend is running: `pm2 status`

---

**Your backend should now be live on Hostinger VPS! 🚀**


