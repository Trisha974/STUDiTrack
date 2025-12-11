# Hostinger VPS Deployment Checklist

Use this checklist to ensure you complete all steps for deploying your backend to Hostinger VPS.

## Pre-Deployment

- [ ] Hostinger VPS account activated
- [ ] VPS IP address noted
- [ ] SSH access credentials ready
- [ ] MySQL database credentials from Hostinger
- [ ] Domain/subdomain ready (optional but recommended)
- [ ] Backend code ready and tested locally

## VPS Setup

- [ ] Connected to VPS via SSH
- [ ] System updated (`apt-get update && apt-get upgrade`)
- [ ] Node.js 18.x installed and verified
- [ ] Git installed (if using Git deployment)
- [ ] MySQL client installed (if importing database)

## Backend Deployment

- [ ] Backend files uploaded to VPS (via Git, SFTP, or SCP)
- [ ] Navigated to server directory
- [ ] Dependencies installed (`npm install --production`)
- [ ] `.env` file created with correct values:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=5000`
  - [ ] `DB_HOST` (localhost or Hostinger MySQL hostname)
  - [ ] `DB_USER` (MySQL username)
  - [ ] `DB_PASSWORD` (MySQL password)
  - [ ] `DB_NAME=student_itrack`
  - [ ] `FRONTEND_URL` (your domain)
  - [ ] Firebase credentials (if using Firebase)
- [ ] Database imported (if needed)
- [ ] Logs directory created (`mkdir -p logs`)

## PM2 Setup

- [ ] PM2 installed globally (`npm install -g pm2`)
- [ ] Backend started with PM2 (`pm2 start ecosystem.config.js`)
- [ ] PM2 configuration saved (`pm2 save`)
- [ ] PM2 startup configured (`pm2 startup` - follow instructions)
- [ ] Backend status verified (`pm2 status`)
- [ ] Logs checked (`pm2 logs student-itrack-api`)

## Firewall Configuration

- [ ] UFW firewall installed
- [ ] SSH port allowed (`ufw allow 22/tcp`)
- [ ] Backend port allowed (`ufw allow 5000/tcp`)
- [ ] HTTP port allowed (`ufw allow 80/tcp`)
- [ ] HTTPS port allowed (`ufw allow 443/tcp`)
- [ ] Firewall enabled (`ufw enable`)

## Nginx Reverse Proxy (Recommended)

- [ ] Nginx installed
- [ ] Nginx configuration file created (`/etc/nginx/sites-available/student-itrack-api`)
- [ ] Configuration file enabled (`ln -s` to sites-enabled)
- [ ] Nginx configuration tested (`nginx -t`)
- [ ] Nginx restarted (`systemctl restart nginx`)
- [ ] Nginx enabled on boot (`systemctl enable nginx`)

## SSL Certificate (HTTPS)

- [ ] Certbot installed
- [ ] Domain DNS configured (A record pointing to VPS IP)
- [ ] SSL certificate obtained (`certbot --nginx -d api.yourdomain.com`)
- [ ] SSL auto-renewal tested (`certbot renew --dry-run`)

## Testing

- [ ] Backend responds locally (`curl http://localhost:5000/api/health`)
- [ ] Backend responds via IP (`curl http://your-vps-ip:5000/api/health`)
- [ ] Backend responds via domain (`curl https://api.yourdomain.com/api/health`)
- [ ] All API endpoints tested
- [ ] Database connections working
- [ ] CORS configured correctly

## Frontend Update

- [ ] Frontend `.env.production` updated with new backend URL
- [ ] Frontend rebuilt (`npm run build`)
- [ ] New `dist` folder uploaded to Hostinger shared hosting
- [ ] Frontend tested with new backend

## Security

- [ ] `.env` file not committed to Git
- [ ] SSH key authentication set up (recommended)
- [ ] Firewall properly configured
- [ ] SSL certificate installed
- [ ] Regular backups configured (optional but recommended)

## Monitoring & Maintenance

- [ ] PM2 monitoring set up
- [ ] Log rotation configured (optional)
- [ ] Backup strategy planned
- [ ] Update schedule planned

## Troubleshooting Reference

If something doesn't work, check:

- [ ] PM2 logs: `pm2 logs student-itrack-api`
- [ ] Nginx logs: `tail -f /var/log/nginx/error.log`
- [ ] System logs: `journalctl -u nginx`
- [ ] Port availability: `netstat -tulpn | grep 5000`
- [ ] Firewall status: `ufw status`
- [ ] PM2 status: `pm2 status`
- [ ] Database connection: `node scripts/test-db-connection.js`

---

## Quick Commands Reference

```bash
# Navigate to server
cd /var/www/server

# PM2 Commands
pm2 status
pm2 logs student-itrack-api
pm2 restart student-itrack-api
pm2 stop student-itrack-api

# Nginx Commands
systemctl status nginx
systemctl restart nginx
nginx -t

# Test Backend
curl http://localhost:5000/api/health
curl https://api.yourdomain.com/api/health
```

---

**Once all items are checked, your backend should be fully deployed and running on Hostinger VPS! 🚀**


