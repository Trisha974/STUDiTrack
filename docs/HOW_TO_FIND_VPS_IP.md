# How to Find Your VPS IP Address

## Quick Methods to Find VPS IP

---

## Method 1: From VPS Terminal (Easiest)

**If you're already connected to your VPS via SSH:**

```bash
curl ifconfig.me
```

**This will show your public IP address.**

**OR:**

```bash
hostname -I
```

**This shows all IP addresses assigned to your VPS.**

**OR:**

```bash
ip addr show
```

**This shows detailed network information, look for `inet` addresses.**

---

## Method 2: From Hostinger Control Panel

1. **Login to Hostinger:**
   - Go to: https://hpanel.hostinger.com
   - Login with your Hostinger account

2. **Go to VPS Management:**
   - Click on "VPS" in the main menu
   - Select your VPS server

3. **View VPS Details:**
   - You should see your VPS IP address displayed
   - It might be labeled as "IP Address" or "IPv4 Address"

---

## Method 3: From SSH Connection Info

**When you connect via SSH, the connection string shows the IP:**

**Example:**
```bash
ssh root@YOUR_VPS_IP
```

**The IP address is the part after `@`.**

**Or check your SSH connection:**
```bash
# On VPS
echo $SSH_CONNECTION
```

**This shows the connection details including IP.**

---

## Method 4: Check Network Configuration

**On your VPS, run:**

```bash
ip addr show | grep "inet "
```

**This shows all IP addresses. Look for the one that's not `127.0.0.1` (localhost).**

**OR:**

```bash
ifconfig | grep "inet "
```

**Shows network interfaces and their IP addresses.**

---

## Method 5: From Hostinger Email

**Check your Hostinger welcome email:**
- When you purchased the VPS, Hostinger sent an email
- The email contains your VPS IP address
- Look for "VPS Details" or "Server Information"

---

## Quick Command Summary

**Run these on your VPS to find the IP:**

```bash
# Method 1: Get public IP
curl ifconfig.me

# Method 2: Get all IPs
hostname -I

# Method 3: Detailed network info
ip addr show | grep "inet "

# Method 4: Check SSH connection
echo $SSH_CONNECTION
```

---

## What to Look For

**Your VPS IP address will look like:**
- `123.456.789.012` (IPv4 address)
- Or `2001:0db8:85a3:0000:0000:8a2e:0370:7334` (IPv6 address)

**Common formats:**
- `xxx.xxx.xxx.xxx` (4 numbers separated by dots)
- Usually starts with numbers like `72.`, `185.`, `104.`, etc.

---

## After Finding Your VPS IP

**Once you have your VPS IP (e.g., `123.456.789.012`):**

1. **Test if backend is accessible:**
   ```bash
   curl http://123.456.789.012:5000/api/health
   ```

2. **Update Vercel `VITE_API_URL`:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Find `VITE_API_URL`
   - Set to: `http://123.456.789.012:5000/api`
   - (Replace `123.456.789.012` with your actual IP)

3. **Make sure port 5000 is open:**
   ```bash
   # On VPS
   ufw allow 5000
   ```

---

## Common Issues

### Issue 1: Can't Access Backend via IP

**Error:** Connection refused or timeout

**Solution:**
- Check firewall: `ufw allow 5000`
- Check if backend is running: `pm2 status`
- Check if port is listening: `netstat -tlnp | grep 5000`

### Issue 2: Multiple IP Addresses

**If you see multiple IPs:**
- Use the public IP (the one that's not `127.0.0.1` or `10.x.x.x` or `192.168.x.x`)
- Usually the first one shown by `hostname -I`

### Issue 3: IP Changed

**If your VPS IP changed:**
- Check Hostinger control panel for current IP
- Update Vercel environment variable with new IP

---

## Quick Steps

1. **Connect to VPS via SSH**
2. **Run:** `curl ifconfig.me`
3. **Copy the IP address shown**
4. **Update Vercel `VITE_API_URL`:** `http://YOUR_IP:5000/api`
5. **Test:** `curl http://YOUR_IP:5000/api/health`

---

**Run `curl ifconfig.me` on your VPS to get your IP address!**

