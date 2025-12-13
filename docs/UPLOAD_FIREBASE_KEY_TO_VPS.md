# Upload Firebase serviceAccountKey.json to VPS

## Problem

**Error:** `No such file or directory`

**Cause:** You're running `scp` from the wrong directory (`C:\WINDOWS\system32>`)

---

## Solution: Change to Project Directory First

### Step 1: Navigate to Your Project Directory

**Open PowerShell and navigate to your project:**

```powershell
cd C:\Users\Angeli1\Documents\STUDiTrack1
```

**Verify the file exists:**
```powershell
ls server\serviceAccountKey.json
```

**Should show the file.**

---

### Step 2: Upload Using SCP

**From your project directory, run:**

```powershell
scp server\serviceAccountKey.json root@72.61.215.20:/var/www/studentitrack/server/
```

**Note:** Use backslash `\` for Windows paths in PowerShell.

---

## Alternative: Use Full Path

**If you want to stay in `C:\WINDOWS\system32>`, use the full path:**

```powershell
scp C:\Users\Angeli1\Documents\STUDiTrack1\server\serviceAccountKey.json root@72.61.215.20:/var/www/studentitrack/server/
```

---

## After Uploading

**On your VPS, verify the file was uploaded:**

```bash
# SSH into VPS
ssh root@72.61.215.20

# Check if file exists
ls -la /var/www/studentitrack/server/serviceAccountKey.json

# Set permissions (important for security)
chmod 600 /var/www/studentitrack/server/serviceAccountKey.json

# Verify permissions
ls -la /var/www/studentitrack/server/serviceAccountKey.json
```

**Should show:**
```
-rw------- 1 root root 1234 Dec 13 07:00 serviceAccountKey.json
```

**The `-rw-------` means only owner (root) can read/write.**

---

## Restart Backend

**After uploading the file:**

```bash
# On VPS
cd /var/www/studentitrack
pm2 restart student-itrack-api

# Check logs
pm2 logs student-itrack-api --err
```

**Should show:**
```
✅ Firebase Admin SDK initialized successfully from serviceAccountKey.json
```

---

## Quick Commands Summary

**On your local machine (PowerShell):**
```powershell
# Navigate to project
cd C:\Users\Angeli1\Documents\STUDiTrack1

# Upload file
scp server\serviceAccountKey.json root@72.61.215.20:/var/www/studentitrack/server/
```

**On VPS (SSH):**
```bash
# Verify file
ls -la /var/www/studentitrack/server/serviceAccountKey.json

# Set permissions
chmod 600 /var/www/studentitrack/server/serviceAccountKey.json

# Restart backend
pm2 restart student-itrack-api

# Check logs
pm2 logs student-itrack-api --err
```

---

**Change to your project directory first, then run the scp command!**

