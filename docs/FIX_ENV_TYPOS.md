# Fix: .env File Typos

## Issues Found

1. **Filename typo:** `.enc` instead of `.env`
2. **Variable name typo:** `PRODCUTION` instead of `PRODUCTION`

---

## Fix: Cancel and Restart

**If you're still in the here-document (seeing `>` prompts):**

1. **Press `Ctrl + C`** to cancel
2. **Run the correct command:**

```bash
cat > .env << 'EOF'
# Server Configuration
NODE_ENV=production
PORT=5000

# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Crbphy@88
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
EOF
```

**Important fixes:**
- ✅ `.env` (not `.enc`)
- ✅ `PRODUCTION_FRONTEND_URL` (not `PRODCUTION`)

---

## If You Already Created .enc File

**Delete the wrong file and create the correct one:**

```bash
rm .enc
cat > .env << 'EOF'
# Server Configuration
NODE_ENV=production
PORT=5000

# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Crbphy@88
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
EOF
```

---

## After Creating .env File

**Verify it was created correctly:**
```bash
cat .env
```

**Should show all the content with:**
- ✅ File name: `.env` (not `.enc`)
- ✅ Variable: `PRODUCTION_FRONTEND_URL` (not `PRODCUTION`)

---

## Next Steps

1. **Edit the file to replace placeholders:**
   ```bash
   nano .env
   ```

2. **Use `Ctrl + W` to search for:**
   - `studentitrack-12345` → Replace with your Firebase project ID
   - `Your private key here` → Replace with your Firebase private key
   - `firebase-adminsdk-xxxxx` → Replace with your Firebase client email
   - `your-random-csrf-secret-here-min-32-characters` → Replace with generated CSRF secret

3. **Generate CSRF secret first:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

---

**Cancel the current command (`Ctrl + C`) and run the corrected command with `.env` (not `.enc`)!**

