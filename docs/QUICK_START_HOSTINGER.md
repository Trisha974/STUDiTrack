# Quick Start: Deploy to Hostinger - Step by Step

## 🚀 Complete Deployment in 10 Steps

---

## STEP 1: Connect to VPS

```bash
ssh root@72.61.215.20
```

---

## STEP 2: Clone Repository

```bash
cd /var/www
git clone https://github.com/Trisha974/studentitrack.git studentitrack
cd studentitrack
```

---

## STEP 3: Install Backend Dependencies

```bash
cd server
npm install
```

---

## STEP 4: Create Backend .env File

```bash
nano .env
```

**Paste this (replace placeholders):**

```env
NODE_ENV=production
PORT=5000

DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=student_itrack

FRONTEND_URL=https://studentitrack.org
PRODUCTION_FRONTEND_URL=https://studentitrack.org

FIREBASE_PROJECT_ID=studitrack-54f69
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@studitrack-54f69.iam.gserviceaccount.com

CSRF_SECRET=$(openssl rand -hex 32)
```

**Save:** `Ctrl + X`, `Y`, `Enter`

---

## STEP 5: Upload Firebase Key (From Local Machine)

**In PowerShell on your local machine:**

```powershell
cd C:\Users\Angeli1\Documents\STUDiTrack1\server
scp serviceAccountKey.json root@72.61.215.20:/var/www/studentitrack/server/
```

**Back on VPS:**

```bash
chmod 600 /var/www/studentitrack/server/serviceAccountKey.json
```

---

## STEP 6: Set Up MySQL Database

```bash
mysql -u root -p
```

**In MySQL:**

```sql
CREATE DATABASE IF NOT EXISTS student_itrack;
USE student_itrack;
source /var/www/studentitrack/sql/schema.sql;
exit;
```

---

## STEP 7: Start Backend

```bash
cd /var/www/studentitrack/server
pm2 start src/server.js --name student-itrack-api
pm2 save
pm2 startup
```

**Test:**

```bash
curl http://localhost:5000/api/health
```

---

## STEP 8: Build Frontend (On Local Machine)

**In PowerShell:**

```powershell
cd C:\Users\Angeli1\Documents\STUDiTrack1\client

# Create .env.production
"VITE_API_URL=https://studentitrack.org/api" | Out-File -FilePath .env.production -Encoding utf8

# Build
npm install
npm run build
```

---

## STEP 9: Upload Frontend

**In PowerShell:**

```powershell
cd C:\Users\Angeli1\Documents\STUDiTrack1\client
scp -r dist root@72.61.215.20:/var/www/studentitrack/frontend/
```

**Back on VPS:**

```bash
chmod -R 755 /var/www/studentitrack/frontend
```

---

## STEP 10: Configure Nginx

**On VPS:**

```bash
# Install Nginx
apt-get update
apt-get install -y nginx

# Create config
nano /etc/nginx/sites-available/studentitrack
```

**Paste this:**

```nginx
server {
    listen 80;
    server_name studentitrack.org www.studentitrack.org;

    location / {
        root /var/www/studentitrack/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Save and enable:**

```bash
ln -s /etc/nginx/sites-available/studentitrack /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

**Set up SSL:**

```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d studentitrack.org -d www.studentitrack.org
```

---

## ✅ Done!

**Test your site:**

1. Visit: `https://studentitrack.org`
2. Try to log in
3. Check browser console for errors

---

## 🔄 Update Commands

### Update Backend:

```bash
cd /var/www/studentitrack
git pull origin main
cd server
npm install  # If packages changed
pm2 restart student-itrack-api --update-env
```

### Update Frontend:

```powershell
# On local machine
cd C:\Users\Angeli1\Documents\STUDiTrack1\client
npm run build
scp -r dist root@72.61.215.20:/var/www/studentitrack/frontend/
```

---

**That's it! Your app is now on Hostinger! 🎉**

