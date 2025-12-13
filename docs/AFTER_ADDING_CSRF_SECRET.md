# What to Do After Adding CSRF_SECRET

## Step 1: Save the .env File

**If you're still in nano:**
1. **Press `Ctrl + X`** to exit
2. **Press `Y`** to confirm save
3. **Press `Enter`** to confirm filename

**You should see:** `[ Wrote 123 lines ]` or similar

---

## Step 2: Verify .env File is Complete

**Check all required variables are filled:**
```bash
cat .env | grep -E "DB_USER|DB_PASSWORD|FIREBASE_PROJECT_ID|FIREBASE_CLIENT_EMAIL|CSRF_SECRET|PRODUCTION_FRONTEND_URL"
```

**Should show:**
- ✅ `DB_USER=root` (or your username)
- ✅ `DB_PASSWORD=...` (your password)
- ✅ `FIREBASE_PROJECT_ID=studentitrack-54f69`
- ✅ `FIREBASE_CLIENT_EMAIL=...`
- ✅ `CSRF_SECRET=...` (64-character string)
- ✅ `PRODUCTION_FRONTEND_URL=https://studentitrack.vercel.app`

---

## Step 3: Restart Backend

**Restart the backend to load new environment variables:**
```bash
pm2 restart student-itrack-api
```

**Check status:**
```bash
pm2 status
```

**Should show:**
```
│ 0   │ student-itrack-api  │ online  │ 0       │ 10s      │
```

---

## Step 4: Check Backend Logs

**View logs to see if backend started correctly:**
```bash
pm2 logs student-itrack-api --lines 30
```

**Look for:**
- ✅ `✅ MySQL connected successfully`
- ✅ `✅ CORS: Allowing origin: https://studentitrack.vercel.app`
- ❌ **Should NOT see:** Database connection errors
- ❌ **Should NOT see:** Firebase errors
- ❌ **Should NOT see:** Missing CSRF_SECRET errors

**Press `Ctrl + C` to exit logs view.**

---

## Step 5: Test Backend Health Endpoint

**Test if backend is working:**
```bash
curl http://localhost:5000/api/health
```

**Expected response:**
```json
{"status":"ok","message":"Server is running","timestamp":"...","environment":"production"}
```

**If you get an error, check logs:**
```bash
pm2 logs student-itrack-api --err --lines 20
```

---

## Step 6: Test Domain (If Configured)

**If you configured OpenLiteSpeed:**
```bash
curl https://studentitrack.org/api/health
```

**Expected:** Same JSON response as above

**If this fails:** Domain is not configured yet (see hosting guides)

---

## Step 7: Test Your Vercel Frontend

1. **Open:** `https://studentitrack.vercel.app`
2. **Open browser console:** Press `F12` → Console tab
3. **Try to log in**
4. **Check console:**
   - ✅ **Should see:** API calls to `https://studentitrack.org/api`
   - ✅ **Should NOT see:** CORS errors
   - ✅ **Should NOT see:** `localhost:5000` errors
   - ✅ **Should see:** Login working!

---

## Troubleshooting

### Backend Not Starting

**Check logs:**
```bash
pm2 logs student-itrack-api --err --lines 50
```

**Common issues:**
- Database connection error → Check MySQL credentials
- Firebase error → Check Firebase credentials
- Missing variable → Check `.env` file

### Health Endpoint Returns Error

**Check what error:**
```bash
curl http://localhost:5000/api/health
```

**View logs:**
```bash
pm2 logs student-itrack-api --lines 20
```

### CORS Still Not Working

**Verify .env has:**
```bash
cat .env | grep PRODUCTION_FRONTEND_URL
```

**Should show:**
```
PRODUCTION_FRONTEND_URL=https://studentitrack.vercel.app
```

**Restart backend:**
```bash
pm2 restart student-itrack-api
```

---

## Complete Checklist

After adding CSRF_SECRET:

- [ ] Saved `.env` file (`Ctrl + X`, `Y`, `Enter`)
- [ ] Verified all variables are filled
- [ ] Restarted backend (`pm2 restart student-itrack-api`)
- [ ] Checked backend status (`pm2 status` shows "online")
- [ ] Checked logs (no errors)
- [ ] Tested health endpoint (`curl http://localhost:5000/api/health`)
- [ ] Tested Vercel frontend (login works, no CORS errors)

---

## Quick Command Sequence

```bash
# 1. Save .env (if still in nano: Ctrl + X, Y, Enter)

# 2. Verify .env
cat .env | grep -E "CSRF_SECRET|PRODUCTION_FRONTEND_URL"

# 3. Restart backend
pm2 restart student-itrack-api

# 4. Check status
pm2 status

# 5. Check logs
pm2 logs student-itrack-api --lines 20

# 6. Test backend
curl http://localhost:5000/api/health

# 7. Test domain (if configured)
curl https://studentitrack.org/api/health
```

---

## Summary

1. ✅ **Save .env file**
2. ✅ **Restart backend:** `pm2 restart student-itrack-api`
3. ✅ **Test backend:** `curl http://localhost:5000/api/health`
4. ✅ **Test frontend:** Open Vercel site and try to log in

**After restarting, your backend should be fully working!**

