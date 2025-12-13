# Fix Issues in .env File

## Issue 1: Search Not Found

**You searched for:** `your msql password`
**But the file has:** `your_mysql_password`

**Fix:**
- Search for: `your_mysql_password` (with underscore and correct spelling)
- Or just search for: `mysql_password`

---

## Issue 2: Typo in FRONTEND_URL

**You have:**
```
FRONTEND_URL=hhtps://studentitrack.vercel.app
```

**Should be:**
```
FRONTEND_URL=https://studentitrack.vercel.app
```

**Fix:**
1. Find the line with `hhtps`
2. Change `hhtps` to `https`

---

## Issue 3: Truncated Firebase Values

**Your Firebase values appear to be cut off:**
- `FIREBASE_PRIVATE_KEY` - ends with `...`
- `FIREBASE_CLIENT_EMAIL` - appears truncated

**Fix:**
1. Get the complete values from your Firebase JSON file
2. Make sure the private key includes the full key (very long)
3. Make sure the client email is complete

---

## Quick Fixes

### Fix MySQL Password:

1. **Press `Ctrl + W`** (search)
2. **Type:** `mysql_password` (or `your_mysql_password`)
3. **Press `Enter`**
4. **Find the line:** `DB_PASSWORD=your_mysql_password`
5. **Replace** `your_mysql_password` with your actual password

### Fix URL Typo:

1. **Press `Ctrl + W`** (search)
2. **Type:** `hhtps`
3. **Press `Enter`**
4. **Change** `hhtps` to `https`

### Fix Firebase Values:

1. **Get complete values** from Firebase JSON file
2. **Replace truncated values** with complete ones

---

## Complete Checklist

Before saving, verify:

- [ ] `DB_PASSWORD` - Has your actual MySQL password (not placeholder)
- [ ] `FRONTEND_URL` - Has `https://` (not `hhtps://`)
- [ ] `FIREBASE_PRIVATE_KEY` - Complete key (not truncated)
- [ ] `FIREBASE_CLIENT_EMAIL` - Complete email (not truncated)
- [ ] All other values are filled in

---

## Save and Restart

1. **Save:** `Ctrl + X`, then `Y`, then `Enter`
2. **Restart backend:**
   ```bash
   pm2 restart student-itrack-api
   ```
3. **Test:**
   ```bash
   curl http://localhost:5000/api/health
   ```

---

**Fix the typo and complete the Firebase values, then save!**

