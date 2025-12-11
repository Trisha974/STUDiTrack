# Simple Guide: Connect VPS to studentitrack.org

**The easiest way - just 3 steps!**

---

## What You Need

- ✅ Your VPS IP address
- ✅ Access to Hostinger DNS settings
- ✅ SSH access to your VPS

---

## Step 1: Get Your VPS IP Address

**On your VPS (via SSH):**

```bash
hostname -I
```

**Write down this number** (looks like: `123.45.67.89`)

---

## Step 2: Point Domain to VPS (In Hostinger)

1. **Login:** https://hpanel.hostinger.com

2. **Go to:** Domains → `studentitrack.org` → **DNS**

3. **Add 2 records:**

   **Record 1:**
   ```
   Type: A
   Name: @
   Value: YOUR-VPS-IP
   ```

   **Record 2:**
   ```
   Type: A
   Name: www
   Value: YOUR-VPS-IP
   ```

4. **Click Save**

5. **Wait 10-30 minutes** for DNS to update

---

## Step 3: Test It Works

**On your VPS:**

```bash
# Check if DNS is working
dig studentitrack.org +short
# Should show your VPS IP

# Test if domain works
curl http://studentitrack.org
```

**In your browser:**
- Go to: `http://studentitrack.org`
- Should show something (even if it's an error page, that means it's connected!)

---

## That's It! 🎉

Your domain is now connected to your VPS!

---

## Next Steps (Optional)

### If you want HTTPS (SSL):

```bash
# On your VPS
certbot --nginx -d studentitrack.org -d www.studentitrack.org
```

### If you want to serve your backend:

Make sure your backend is running on port 5000, then configure OpenLiteSpeed to proxy to it (see other guides for details).

---

## Troubleshooting

**Domain not working?**
- Wait longer (DNS can take up to 30 minutes)
- Check DNS: `dig studentitrack.org +short` (should show your VPS IP)
- Make sure you saved DNS changes in Hostinger

**Still not working?**
- Double-check the VPS IP address
- Make sure DNS records are saved correctly
- Wait a bit longer and try again

---

**That's all you need! Just 3 simple steps.** ✨


