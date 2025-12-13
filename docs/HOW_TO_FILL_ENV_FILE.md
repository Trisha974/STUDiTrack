# How to Fill Out .env File

## Current Status

**You're in nano editing `.env` file**
- File is empty (new file)
- Need to add all environment variables

---

## Step-by-Step: Fill Out .env File

**Copy and paste this template into nano, then replace the placeholder values:**

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=student_itrack

# Frontend URL (Vercel)
FRONTEND_URL=https://studentitrack.vercel.app
PRODUCTION_FRONTEND_URL=https://studentitrack.vercel.app

# Firebase Admin SDK (for authentication)
FIREBASE_PROJECT_ID=studentitrack-12345
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@studentitrack-12345.iam.gserviceaccount.com

# CSRF Protection (REQUIRED - generate a random string, min 32 chars)
CSRF_SECRET=your-random-csrf-secret-here-min-32-characters
```

---

## Values to Replace

### 1. MySQL Configuration (You Already Know These)

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=student_itrack
```

**These are correct if:**
- ✅ You connected with: `mysql -u root -h localhost`
- ✅ You didn't use a password
- ✅ Database name is `student_itrack`

**If you set a MySQL password:**
- Change `DB_PASSWORD=` to `DB_PASSWORD=Crbphy@88` (or your password)

---

### 2. Frontend URL (Vercel)

```env
FRONTEND_URL=https://studentitrack.vercel.app
PRODUCTION_FRONTEND_URL=https://studentitrack.vercel.app
```

**These should be correct** (your Vercel frontend URL)

---

### 3. Firebase Credentials (Get from Firebase Console)

**You need to get these from Firebase Console:**

1. **Go to:** https://console.firebase.google.com
2. **Select your project:** `studentitrack-12345` (or your project name)
3. **Go to:** Project Settings → Service Accounts
4. **Click:** "Generate new private key"
5. **Download the JSON file**

**From the JSON file, copy:**
- `project_id` → `FIREBASE_PROJECT_ID`
- `private_key` → `FIREBASE_PRIVATE_KEY` (keep the quotes and `\n`)
- `client_email` → `FIREBASE_CLIENT_EMAIL`

**Example:**
```env
FIREBASE_PROJECT_ID=studentitrack-12345
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@studentitrack-12345.iam.gserviceaccount.com
```

**Important:** 
- Keep the quotes around `FIREBASE_PRIVATE_KEY`
- Keep the `\n` characters (they represent newlines)
- Copy the ENTIRE private key (it's long!)

---

### 4. CSRF Secret (Generate Now)

**Generate a random secret:**

**In a NEW terminal window (not in nano), run:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Copy the output** (it will be a long random string like `a1b2c3d4e5f6...`)

**Paste it into `.env`:**
```env
CSRF_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

---

## Complete Example .env File

**After filling in all values, your `.env` should look like this:**

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=student_itrack

# Frontend URL (Vercel)
FRONTEND_URL=https://studentitrack.vercel.app
PRODUCTION_FRONTEND_URL=https://studentitrack.vercel.app

# Firebase Admin SDK
FIREBASE_PROJECT_ID=studentitrack-12345
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@studentitrack-12345.iam.gserviceaccount.com

# CSRF Protection
CSRF_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

---

## How to Fill in Nano

### Step 1: Paste Template

1. **Copy the template above** (starting from `# Server Configuration`)
2. **In nano, paste it:** Right-click or `Shift + Insert`

### Step 2: Replace Placeholder Values

**For each placeholder:**
1. Use `Ctrl + W` to search
2. Type the placeholder (e.g., `your-random-csrf-secret`)
3. Press `Enter`
4. Replace with actual value

### Step 3: Save and Exit

1. **Save:** `Ctrl + O`, then `Enter`
2. **Exit:** `Ctrl + X`

---

## Quick Checklist

- [ ] `NODE_ENV=production`
- [ ] `PORT=5000`
- [ ] `DB_HOST=localhost`
- [ ] `DB_USER=root`
- [ ] `DB_PASSWORD=` (empty if no password)
- [ ] `DB_NAME=student_itrack`
- [ ] `FRONTEND_URL=https://studentitrack.vercel.app`
- [ ] `PRODUCTION_FRONTEND_URL=https://studentitrack.vercel.app`
- [ ] `FIREBASE_PROJECT_ID=` (from Firebase Console)
- [ ] `FIREBASE_PRIVATE_KEY=` (from Firebase JSON file, with quotes)
- [ ] `FIREBASE_CLIENT_EMAIL=` (from Firebase JSON file)
- [ ] `CSRF_SECRET=` (generated random string)

---

## If You Don't Have Firebase Credentials Yet

**You can save the file with placeholders and update later:**

1. **Fill in MySQL and Frontend URLs** (you know these)
2. **Leave Firebase placeholders** for now
3. **Generate CSRF secret** (do this now)
4. **Save the file**
5. **Get Firebase credentials later** and update

**The backend won't start without Firebase, but you can save the file structure first.**

---

## After Saving .env File

1. **Verify file was saved:**
   ```bash
   cat .env
   ```

2. **Check for syntax errors:**
   - Make sure all values are on one line
   - Make sure quotes are correct
   - Make sure no extra spaces

3. **Restart backend:**
   ```bash
   pm2 restart student-itrack-api
   ```

4. **Check logs:**
   ```bash
   pm2 logs student-itrack-api --err
   ```

---

**Start by pasting the template, then replace the placeholder values one by one!**

