# Quick Start: Deploy to Hostinger VPS

**Fastest way to get your backend running on Hostinger VPS**

---

## Prerequisites

✅ Hostinger VPS activated  
✅ SSH access to VPS  
✅ Backend code ready  

---

## Quick Deployment (5 Steps)

### 1. Connect to VPS

```bash
ssh root@your-vps-ip
```

### 2. Upload Backend Files

**Option A: Git (if code is on GitHub)**
```bash
cd /var/www
git clone https://github.com/your-username/your-repo.git
cd your-repo/server
```

**Option B: SFTP (FileZilla/WinSCP)**
- Upload `server/` folder to `/var/www/server`

### 3. Run Deployment Script

```bash
cd /var/www/server
chmod +x scripts/deploy-to-vps.sh
sudo bash scripts/deploy-to-vps.sh
```

The script will:
- ✅ Install Node.js (if needed)
- ✅ Install dependencies
- ✅ Set up PM2
- ✅ Start your backend

### 4. Configure Environment

```bash
nano .env
```

Fill in your values (see `env.production.template` for reference)

### 5. Restart Backend

```bash
pm2 restart student-itrack-api
pm2 save
```

---

## Verify It's Working

```bash
# Check status
pm2 status

# Test backend
curl http://localhost:5000/api/health

# View logs
pm2 logs student-itrack-api
```

---

## Next Steps (Optional but Recommended)

1. **Set up Nginx** (see `HOSTINGER_VPS_DEPLOYMENT.md` Step 12)
2. **Install SSL** (see `HOSTINGER_VPS_DEPLOYMENT.md` Step 13)
3. **Update frontend** to use new backend URL

---

## Full Documentation

For detailed instructions, see:
- **`HOSTINGER_VPS_DEPLOYMENT.md`** - Complete step-by-step guide
- **`server/scripts/VPS_DEPLOYMENT_CHECKLIST.md`** - Deployment checklist

---

**That's it! Your backend should now be running on Hostinger VPS 🚀**


