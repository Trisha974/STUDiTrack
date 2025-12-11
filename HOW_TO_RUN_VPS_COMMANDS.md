# Where to Run VPS Commands - Step by Step Guide

## Important: These commands run on your VPS, NOT on your local Windows machine!

---

## Step 1: Connect to Your VPS First

You need to **SSH into your VPS** before running any commands. Here's how:

### Option A: Using Windows PowerShell/Terminal (Recommended)

1. **Open PowerShell** (or Windows Terminal)
2. **Run this command:**
   ```powershell
   ssh root@your-vps-ip
   ```
   Replace `your-vps-ip` with your actual VPS IP address (e.g., `ssh root@123.45.67.89`)

3. **Enter your password** when prompted
4. **You're now connected!** You should see something like:
   ```
   root@vps123456:~#
   ```

### Option B: Using PuTTY (Alternative)

1. Download PuTTY: https://www.putty.org/
2. Open PuTTY
3. Enter:
   - **Host Name:** `your-vps-ip`
   - **Port:** `22`
   - **Connection type:** `SSH`
4. Click "Open"
5. Login as: `root`
6. Enter password

---

## Step 2: Now You're on the VPS - Upload Your Backend

**You're still connected via SSH.** Now you need to get your backend files onto the VPS.

### Method 1: Using Git (If your code is on GitHub/GitLab)

**On the VPS (in your SSH session):**
```bash
# Navigate to where you want to store your app
cd /var/www

# Clone your repository
git clone https://github.com/your-username/your-repo.git

# Navigate into the server folder
cd your-repo/server
```

### Method 2: Using SFTP (FileZilla) - From Your Windows Machine

**On your Windows machine (NOT in SSH):**

1. **Download FileZilla:** https://filezilla-project.org/
2. **Open FileZilla**
3. **Connect to VPS:**
   - Host: `sftp://your-vps-ip`
   - Username: `root`
   - Password: Your VPS password
   - Port: `22`
4. **Upload your `server` folder:**
   - Left side: Navigate to your local `server` folder
   - Right side: Navigate to `/var/www/` on VPS
   - Drag and drop `server` folder from left to right

**Then go back to your SSH session** and run:
```bash
cd /var/www/server
```

### Method 3: Using SCP (From Windows PowerShell)

**On your Windows machine (NOT in SSH):**

Open a **NEW PowerShell window** (keep your SSH session open in another window):

```powershell
# Navigate to your project folder
cd "C:\Users\Angeli1\Documents\STUD1 - Copy"

# Upload server folder to VPS
scp -r server root@your-vps-ip:/var/www/
```

**Then go back to your SSH session** and run:
```bash
cd /var/www/server
```

---

## Step 3: Run the Deployment Script

**Back in your SSH session (on the VPS):**

Make sure you're in the server directory:
```bash
cd /var/www/server
# OR if you cloned via Git:
cd /var/www/your-repo/server
```

Then run:
```bash
# Make script executable
chmod +x scripts/deploy-to-vps.sh

# Run the deployment script
sudo bash scripts/deploy-to-vps.sh
```

---

## Step 4: Configure .env File

**Still in your SSH session (on the VPS):**

```bash
# Make sure you're in the server directory
cd /var/www/server

# Edit .env file
nano .env
```

**In nano editor:**
- Paste your environment variables
- Press `Ctrl + X` to exit
- Press `Y` to save
- Press `Enter` to confirm

---

## Step 5: Restart with PM2

**Still in your SSH session (on the VPS):**

```bash
# Restart the backend
pm2 restart student-itrack-api

# Save PM2 configuration
pm2 save

# Check status
pm2 status

# View logs
pm2 logs student-itrack-api
```

---

## Visual Guide: Where to Run Commands

```
┌─────────────────────────────────────────────────────────┐
│  YOUR WINDOWS MACHINE (Local)                          │
│                                                         │
│  PowerShell/Terminal:                                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ssh root@your-vps-ip                            │   │
│  │ (This connects you to VPS)                      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  FileZilla/WinSCP:                                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Upload server/ folder to VPS                    │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                        │
                        │ SSH Connection
                        ▼
┌─────────────────────────────────────────────────────────┐
│  HOSTINGER VPS (Remote Server)                         │
│                                                         │
│  SSH Session (where you run commands):                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │ root@vps123456:~# cd /var/www/server           │   │
│  │ root@vps123456:/var/www/server#                │   │
│  │                                                 │   │
│  │ sudo bash scripts/deploy-to-vps.sh             │   │
│  │ nano .env                                       │   │
│  │ pm2 restart student-itrack-api                 │   │
│  │ (All commands run HERE)                        │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Complete Example Workflow

### On Windows (PowerShell):

```powershell
# Step 1: Connect to VPS
ssh root@123.45.67.89
# Enter password when prompted
```

### On VPS (after SSH connection):

```bash
# Step 2: Navigate to where you'll store the app
cd /var/www

# Step 3a: If using Git, clone your repo
git clone https://github.com/your-username/your-repo.git
cd your-repo/server

# OR Step 3b: If you uploaded via SFTP, navigate to server folder
cd /var/www/server

# Step 4: Run deployment script
chmod +x scripts/deploy-to-vps.sh
sudo bash scripts/deploy-to-vps.sh

# Step 5: Configure environment
nano .env
# (Edit file, save with Ctrl+X, Y, Enter)

# Step 6: Restart backend
pm2 restart student-itrack-api
pm2 save

# Step 7: Check status
pm2 status
pm2 logs student-itrack-api
```

---

## Common Mistakes

❌ **Running commands in Windows PowerShell without SSH connection**
- These commands only work on Linux (your VPS), not Windows

✅ **Correct:** Connect via SSH first, then run commands

❌ **Trying to run `cd /var/www/server` on Windows**
- Windows doesn't have `/var/www/` - that's a Linux path

✅ **Correct:** Run `cd /var/www/server` only after SSH-ing into VPS

❌ **Closing SSH session before finishing**
- Keep your SSH session open while deploying

✅ **Correct:** Keep SSH session open, or use `screen`/`tmux` for long operations

---

## Quick Reference

| Action | Where to Run | Command |
|--------|-------------|---------|
| Connect to VPS | Windows PowerShell | `ssh root@your-vps-ip` |
| Upload files | Windows (FileZilla) | SFTP connection |
| Navigate to server | VPS (after SSH) | `cd /var/www/server` |
| Run deployment | VPS (after SSH) | `sudo bash scripts/deploy-to-vps.sh` |
| Edit .env | VPS (after SSH) | `nano .env` |
| Restart backend | VPS (after SSH) | `pm2 restart student-itrack-api` |

---

## Need Help?

- **Can't connect via SSH?** Check your VPS IP and password
- **Commands not found?** Make sure you're connected to VPS, not running on Windows
- **Permission denied?** Use `sudo` before commands that need root access

---

**Remember: All deployment commands run on the VPS after you SSH into it! 🚀**


