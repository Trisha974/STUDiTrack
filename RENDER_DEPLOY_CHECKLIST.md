# Render.com Deployment Checklist

## Before Deploying

- [ ] Sign up at render.com (free account)
- [ ] Have your Hostinger MySQL credentials ready
- [ ] Have your Firebase Admin SDK credentials ready
- [ ] Know your frontend domain URL

## Deployment Steps

### 1. Create Render Account
- [ ] Go to render.com
- [ ] Sign up with email
- [ ] Verify email

### 2. Create Web Service
- [ ] Click "New +" → "Web Service"
- [ ] Choose "Manual Deploy" (or GitHub)
- [ ] Upload `server` folder (or zip file)

### 3. Configure Service
- [ ] Name: `student-itrack-api`
- [ ] Root Directory: `server`
- [ ] Environment: `Node`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Plan: `Free`

### 4. Add Environment Variables
Add these in Render dashboard → Environment tab:

- [ ] `NODE_ENV=production`
- [ ] `PORT=10000` (Render uses dynamic ports, but 10000 works)
- [ ] `DB_HOST=your-mysql-hostname.hostinger.com`
- [ ] `DB_USER=your_mysql_username`
- [ ] `DB_PASSWORD=your_mysql_password`
- [ ] `DB_NAME=student_itrack`
- [ ] `FRONTEND_URL=https://yourdomain.org`
- [ ] `FIREBASE_PROJECT_ID=your-project-id`
- [ ] `FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`
- [ ] `FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com`

### 5. Deploy
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (2-5 minutes)
- [ ] Copy backend URL: `https://student-itrack-api.onrender.com`

### 6. Update Frontend
- [ ] Edit `client/.env.production`:
  ```env
  VITE_API_URL=https://student-itrack-api.onrender.com/api
  ```
- [ ] Rebuild frontend: `cd client && npm run build`
- [ ] Upload new `dist` folder to Hostinger

### 7. Test
- [ ] Visit your frontend: `https://yourdomain.org`
- [ ] Try logging in
- [ ] Check browser console for errors
- [ ] Check Render logs for backend errors

## Troubleshooting

### Backend Not Starting
- Check Render logs for errors
- Verify all environment variables are set
- Check that `npm start` command is correct

### Database Connection Failed
- Verify MySQL hostname (might be `localhost` or `mysql.hostinger.com`)
- Check username/password in Hostinger MySQL settings
- Ensure database exists and is imported

### CORS Errors
- Update `FRONTEND_URL` in Render environment variables
- Make sure it matches your actual domain

### 500 Errors
- Check Render logs for detailed error messages
- Verify Firebase Admin SDK credentials are correct
- Check database connection

## Success Indicators

✅ Backend URL responds: `https://your-app.onrender.com/api/health`  
✅ Frontend can connect to backend  
✅ No CORS errors in browser console  
✅ Login works  
✅ Data loads correctly  

---

## Quick Reference

**Backend URL Format:** `https://your-service-name.onrender.com`  
**API Endpoint:** `https://your-service-name.onrender.com/api`  
**Health Check:** `https://your-service-name.onrender.com/api/health`

**Free Tier Limits:**
- Spins down after 15 minutes of inactivity
- 512MB RAM
- 0.1 CPU
- Free SSL/HTTPS included



