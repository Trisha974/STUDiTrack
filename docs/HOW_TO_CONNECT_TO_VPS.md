# How to Connect to VPS Terminal

## Problem: Cannot Open VPS Terminal

**This usually means you can't connect via SSH.**

---

## Method 1: Using PowerShell (Windows)

**Open PowerShell and run:**

```powershell
ssh root@72.61.215.20
```

**If this is your first time connecting, you'll see:**
```
The authenticity of host '72.61.215.20' can't be established.
Are you sure you want to continue connecting (yes/no)?
```

**Type:** `yes` and press Enter

**Then enter your password when prompted.**

---

## Method 2: Using PuTTY (Windows)

**If PowerShell SSH doesn't work:**

1. **Download PuTTY:** https://www.putty.org/
2. **Open PuTTY**
3. **Enter:**
   - **Host Name:** `72.61.215.20`
   - **Port:** `22`
   - **Connection Type:** SSH
4. **Click:** "Open"
5. **Enter username:** `root`
6. **Enter password:** (your VPS password)

---

## Method 3: Using Windows Terminal

**If you have Windows Terminal:**

1. **Open Windows Terminal**
2. **Click the dropdown arrow** (next to the + tab)
3. **Select:** "Command Prompt" or "PowerShell"
4. **Run:**
   ```powershell
   ssh root@72.61.215.20
   ```

---

## Method 4: Using Hostinger Control Panel

**If SSH doesn't work, use Hostinger's web terminal:**

1. **Go to:** https://hpanel.hostinger.com
2. **Login** with your Hostinger account
3. **Go to:** VPS → Your VPS Server
4. **Click:** "Web Terminal" or "SSH Access"
5. **This opens a browser-based terminal**

---

## Common SSH Connection Issues

### Issue 1: "Connection Refused" or "Connection Timed Out"

**Possible causes:**
- VPS is down
- Firewall blocking port 22
- Wrong IP address
- Network issues

**Solutions:**
- Check if VPS is running in Hostinger control panel
- Verify IP address: `72.61.215.20`
- Try using Hostinger web terminal instead

### Issue 2: "Permission Denied"

**Possible causes:**
- Wrong username (should be `root`)
- Wrong password
- SSH key authentication required

**Solutions:**
- Make sure username is `root`
- Double-check password
- Try resetting password in Hostinger control panel

### Issue 3: "Host Key Verification Failed"

**Solution:**
```powershell
# Remove old host key
ssh-keygen -R 72.61.215.20

# Try connecting again
ssh root@72.61.215.20
```

### Issue 4: SSH Not Installed on Windows

**Solution:**
- Windows 10/11 should have SSH built-in
- If not, install OpenSSH:
  - Settings → Apps → Optional Features → Add Feature → OpenSSH Client

---

## Alternative: Use Hostinger Web Terminal

**If SSH doesn't work, use Hostinger's web-based terminal:**

1. **Go to:** https://hpanel.hostinger.com
2. **Login** with your Hostinger account
3. **Go to:** VPS → Your VPS Server
4. **Look for:** "Web Terminal", "SSH Access", or "Terminal" button
5. **Click it** to open browser-based terminal

**This doesn't require SSH and works directly in your browser.**

---

## Quick Test: Check if VPS is Accessible

**Test if you can reach the VPS:**

```powershell
# Test connection
ping 72.61.215.20
```

**If ping works, VPS is online. If not, VPS might be down.**

---

## Step-by-Step: Connect via SSH

### Step 1: Open PowerShell

**Press `Win + X` and select "Windows PowerShell" or "Terminal"**

### Step 2: Connect to VPS

```powershell
ssh root@72.61.215.20
```

### Step 3: Enter Password

**When prompted, enter your VPS root password**

**Note:** Password won't show as you type (for security)

### Step 4: You're Connected!

**You should see:**
```
Welcome to Ubuntu...
root@srv1189265:~#
```

**Now you can run commands on your VPS!**

---

## If Nothing Works

**Use Hostinger Web Terminal:**
- Go to Hostinger control panel
- Find "Web Terminal" or "SSH Access"
- Use browser-based terminal (no SSH needed)

---

## Quick Commands Reference

**Once connected to VPS:**

```bash
# Navigate to project
cd /var/www/studentitrack

# Pull latest code
git pull

# Check backend status
pm2 status

# View logs
pm2 logs student-itrack-api --err

# Restart backend
pm2 restart student-itrack-api --update-env
```

---

**Try connecting with: `ssh root@72.61.215.20` in PowerShell, or use Hostinger's web terminal!**

