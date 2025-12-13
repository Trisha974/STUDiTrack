# Create .env File Without Pasting

## Problem

**Can't paste into VPS terminal** - This is common with SSH terminals.

---

## Solution 1: Use `cat` with Here-Document (Easiest)

**Exit nano first:**
- Press `Ctrl + X` (don't save)

**Then run this command:**

```bash
cd /var/www/studentitrack
cat > .env << 'EOF'
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
EOF
```

**This creates the file with all the content!**

**Then edit it:**
```bash
nano .env
```

**Use `Ctrl + W` to search and replace the placeholder values.**

---

## Solution 2: Use `echo` Commands (Line by Line)

**Exit nano first:**
- Press `Ctrl + X` (don't save)

**Then run these commands one by one:**

```bash
cd /var/www/studentitrack

# Server Configuration
echo "NODE_ENV=production" > .env
echo "PORT=5000" >> .env
echo "" >> .env

# MySQL Database Configuration
echo "# MySQL Database Configuration" >> .env
echo "DB_HOST=localhost" >> .env
echo "DB_USER=root" >> .env
echo "DB_PASSWORD=" >> .env
echo "DB_NAME=student_itrack" >> .env
echo "" >> .env

# Frontend URL
echo "# Frontend URL (Vercel)" >> .env
echo "FRONTEND_URL=https://studentitrack.vercel.app" >> .env
echo "PRODUCTION_FRONTEND_URL=https://studentitrack.vercel.app" >> .env
echo "" >> .env

# Firebase (placeholders)
echo "# Firebase Admin SDK (for authentication)" >> .env
echo "FIREBASE_PROJECT_ID=studentitrack-12345" >> .env
echo 'FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"' >> .env
echo "FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@studentitrack-12345.iam.gserviceaccount.com" >> .env
echo "" >> .env

# CSRF Secret
echo "# CSRF Protection (REQUIRED - generate a random string, min 32 chars)" >> .env
echo "CSRF_SECRET=your-random-csrf-secret-here-min-32-characters" >> .env
```

**Then edit it:**
```bash
nano .env
```

**Use `Ctrl + W` to search and replace the placeholder values.**

---

## Solution 3: Generate CSRF Secret First

**Before creating .env, generate CSRF secret:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Copy the output** (it will be a long random string)

**Then use Solution 1 or 2, but replace `your-random-csrf-secret-here-min-32-characters` with the generated value.**

---

## Solution 4: Create File Locally and Upload

**If you have SSH file transfer access:**

1. **Create `.env` file on your local computer**
2. **Upload it to VPS using:**
   ```bash
   scp .env root@your-vps-ip:/var/www/studentitrack/.env
   ```

**Or use SFTP client like FileZilla.**

---

## After Creating .env File

**Verify it was created:**
```bash
cat .env
```

**Edit it to replace placeholders:**
```bash
nano .env
```

**Use `Ctrl + W` to search for:**
- `studentitrack-12345` → Replace with your Firebase project ID
- `Your private key here` → Replace with your Firebase private key
- `firebase-adminsdk-xxxxx` → Replace with your Firebase client email
- `your-random-csrf-secret-here-min-32-characters` → Replace with generated CSRF secret

---

## Recommended: Use Solution 1 (cat with Here-Document)

**It's the easiest and creates the file in one command!**

1. **Exit nano:** `Ctrl + X` (don't save)
2. **Run the `cat > .env << 'EOF'` command** (Solution 1)
3. **Edit with nano:** `nano .env`
4. **Search and replace placeholders:** `Ctrl + W`

---

**Try Solution 1 first - it's the easiest way to create the file without pasting!**

