# How to Connect VPS Backend to Vercel Frontend

## Good News: They're Already Connected!

**Your setup:**
- ✅ Frontend: Vercel (`https://studentitrack.vercel.app`)
- ✅ Backend: VPS (`https://studentitrack.org/api` or `http://YOUR_VPS_IP:5000/api`)

**They're already connected!** Your frontend calls your backend API.

---

## Current Connection

**How it works:**
1. User visits: `https://studentitrack.vercel.app`
2. Frontend loads from Vercel
3. Frontend makes API calls to: `https://studentitrack.org/api` (your VPS)
4. Backend processes requests and returns data
5. Frontend displays the data

**This is already working!** You just need to configure it properly.

---

## Step 1: Configure Environment Variables

**Set `VITE_API_URL` in Vercel:**

1. **Go to:** https://vercel.com/dashboard
2. **Select project:** `studentitrack`
3. **Go to:** Settings → Environment Variables
4. **Add/Update:**
   - **Name:** `VITE_API_URL`
   - **Value:** `http://studentitrack.org/api` (or `http://YOUR_VPS_IP:5000/api`)
   - **Environment:** Production, Preview, Development
5. **Save**

**This tells your frontend where to find the backend.**

---

## Step 2: Configure CORS on Backend

**Make sure your backend allows requests from Vercel:**

**In your backend `.env` file:**
```env
FRONTEND_URL=https://studentitrack.vercel.app
PRODUCTION_FRONTEND_URL=https://studentitrack.vercel.app
```

**In your backend `server.js`, make sure CORS is configured:**
```javascript
const allowedOrigins = [
  'https://studentitrack.vercel.app',
  'http://localhost:5173', // for local development
  // ... other origins
]

app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))
```

**This allows your Vercel frontend to call your VPS backend.**

---

## Step 3: Use Vercel Rewrites (Optional)

**You can use Vercel rewrites to proxy API requests:**

**Create `vercel.json` in your frontend root:**
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "http://studentitrack.org/api/:path*"
    }
  ]
}
```

**This makes API calls go through Vercel first, then to your VPS.**

**Pros:**
- ✅ Hides backend URL from frontend
- ✅ Can add caching, rate limiting
- ✅ Single domain (no CORS issues)

**Cons:**
- ⚠️ Adds latency (extra hop)
- ⚠️ Still has timeout limitations
- ⚠️ Not recommended for your setup

**Better to call backend directly (current setup).**

---

## Step 4: Set Up SSL for Backend (Recommended)

**To avoid SSL certificate errors, set up SSL on your VPS:**

### Option 1: Use Let's Encrypt (Free SSL)

```bash
# On VPS
apt-get update
apt-get install -y certbot

# Get SSL certificate
certbot certonly --standalone -d studentitrack.org

# This creates certificates in /etc/letsencrypt/live/studentitrack.org/
```

**Then configure Nginx/Apache as reverse proxy with SSL.**

### Option 2: Use Cloudflare (Free SSL)

1. **Add domain to Cloudflare**
2. **Enable SSL/TLS**
3. **Cloudflare provides free SSL**
4. **Update DNS to use Cloudflare**

**After SSL is set up:**
- Update `VITE_API_URL` to `https://studentitrack.org/api`
- No more SSL certificate errors!

---

## Step 5: Configure Domain (If Using Custom Domain)

**If you want to use `studentitrack.org` for both:**

1. **Frontend:** `https://studentitrack.vercel.app` (or custom domain)
2. **Backend:** `https://studentitrack.org/api` (or `https://api.studentitrack.org`)

**DNS Configuration:**
- **A record:** `studentitrack.org` → VPS IP (for backend)
- **CNAME record:** `www.studentitrack.org` → Vercel (for frontend)
- **Or use subdomain:** `api.studentitrack.org` → VPS IP (for backend)

---

## Step 6: Test the Connection

**Test if frontend can reach backend:**

1. **From browser console (F12):**
   ```javascript
   fetch('http://studentitrack.org/api/health')
     .then(r => r.json())
     .then(console.log)
   ```

2. **Should return:**
   ```json
   {"status":"ok","message":"Server is running"}
   ```

3. **If CORS error:**
   - Check backend CORS configuration
   - Make sure `https://studentitrack.vercel.app` is in allowed origins

---

## Best Practices

### 1. Use Environment Variables

**Don't hardcode backend URL in frontend code:**
```javascript
// ❌ Bad
const API_URL = 'http://studentitrack.org/api'

// ✅ Good
const API_URL = import.meta.env.VITE_API_URL
```

### 2. Handle Errors Gracefully

**In your frontend API client:**
```javascript
const apiClient = async (endpoint) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}
```

### 3. Use HTTPS for Production

**Always use HTTPS in production:**
- ✅ Frontend: `https://studentitrack.vercel.app` (Vercel provides SSL)
- ✅ Backend: `https://studentitrack.org/api` (set up SSL on VPS)

### 4. Monitor Connection

**Check if backend is accessible:**
```bash
# On VPS
curl http://localhost:5000/api/health

# From external
curl http://studentitrack.org/api/health
```

---

## Architecture Diagram

```
User Browser
    ↓
Vercel Frontend (https://studentitrack.vercel.app)
    ↓ (API calls via VITE_API_URL)
VPS Backend (http://studentitrack.org/api)
    ↓
MySQL Database (on VPS)
```

**This is your current setup and it's perfect!**

---

## Troubleshooting

### Issue 1: CORS Errors

**Error:** `Access to fetch blocked by CORS policy`

**Solution:**
- Check backend CORS configuration
- Make sure `https://studentitrack.vercel.app` is in allowed origins
- Check `FRONTEND_URL` in backend `.env`

### Issue 2: Connection Refused

**Error:** `Failed to fetch` or `Connection refused`

**Solution:**
- Check if backend is running: `pm2 status`
- Check if port 5000 is open: `ufw allow 5000`
- Check if backend is accessible: `curl http://studentitrack.org/api/health`

### Issue 3: SSL Certificate Error

**Error:** `ERR_CERT_AUTHORITY_INVALID`

**Solution:**
- Use HTTP for now: `http://studentitrack.org/api`
- Or set up SSL on VPS (Let's Encrypt)

---

## Summary

**Your VPS and Vercel are already connected!**

**What you need to do:**
1. ✅ Set `VITE_API_URL` in Vercel environment variables
2. ✅ Configure CORS on backend to allow Vercel frontend
3. ✅ Set up SSL on VPS (optional but recommended)
4. ✅ Test the connection

**Current setup is perfect:**
- Frontend on Vercel (fast, CDN, edge network)
- Backend on VPS (full control, MySQL, no limitations)
- They communicate via API calls

---

**Your VPS and Vercel are already connected! Just configure the environment variables and CORS properly.**

