# How to Get Firebase Private Key

## Where to Find Your Firebase Private Key

**The Firebase private key is in the Firebase Console, in the Service Accounts section.**

---

## Step-by-Step Instructions

### Step 1: Go to Firebase Console

1. **Open your browser**
2. **Go to:** https://console.firebase.google.com
3. **Login** with your Google account (if not already logged in)

---

### Step 2: Select Your Project

1. **Click on your project:** `studentitrack-54f69` (or your project name)
2. **You should see the project dashboard**

---

### Step 3: Go to Project Settings

1. **Click the gear icon** (⚙️) in the top left corner
2. **Select:** "Project settings"

**OR**

1. **Click on your project name** in the top left
2. **Select:** "Project settings"

---

### Step 4: Go to Service Accounts Tab

1. **Click on the "Service Accounts" tab** at the top
2. **You should see:**
   - Firebase Admin SDK
   - Code samples
   - "Generate new private key" button

---

### Step 5: Generate/Download Private Key

**Option A: If you already have a key:**
- Look for a download link or "Generate new private key" button
- Click "Generate new private key"
- A JSON file will download

**Option B: If you need to create a new one:**
1. **Click:** "Generate new private key"
2. **A warning popup will appear:** "Are you sure you want to generate a new private key?"
3. **Click:** "Generate key"
4. **A JSON file will download** (e.g., `studentitrack-54f69-firebase-adminsdk-xxxxx.json`)

---

### Step 6: Open the JSON File

1. **Open the downloaded JSON file** in a text editor
2. **You should see something like:**

```json
{
  "type": "service_account",
  "project_id": "studentitrack-54f69",
  "private_key_id": "xxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC5JphiJ3up+LNM\n...very long string...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@studentitrack-54f69.iam.gserviceaccount.com",
  "client_id": "xxxxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "xxxxx"
}
```

---

### Step 7: Copy the Private Key

**Find the `private_key` field in the JSON file:**

```json
"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC5JphiJ3up+LNM\nN5FY83eoC2hDVta6CKfKyntBE8S59TStqT/jqUp0mbh99knfFVPowxpwMCOas2A6\n...all the lines...\ncJA9bJA+ZjkgjiX8dqrtEjEt\n-----END PRIVATE KEY-----\n"
```

**Copy the ENTIRE value** (including the quotes and all the content between them).

**Important:**
- ✅ Copy the ENTIRE string (it's very long, 2000+ characters)
- ✅ Include the quotes `"` at the beginning and end
- ✅ Include all the `\n` characters
- ✅ Don't truncate it!

---

## Visual Guide

**Firebase Console Navigation:**
```
Firebase Console
  └─ Select Project (studentitrack-54f69)
      └─ Project Settings (gear icon ⚙️)
          └─ Service Accounts tab
              └─ Generate new private key (button)
                  └─ Download JSON file
                      └─ Open JSON file
                          └─ Find "private_key" field
                              └─ Copy the entire value
```

---

## Alternative: Direct Link

**If you know your project ID, you can go directly to:**

```
https://console.firebase.google.com/project/studentitrack-54f69/settings/serviceaccounts/adminsdk
```

**Replace `studentitrack-54f69` with your actual project ID.**

---

## What the Private Key Looks Like

**The private key should:**
- Start with: `"-----BEGIN PRIVATE KEY-----\n`
- Be very long (2000+ characters)
- Contain many lines separated by `\n`
- End with: `\n-----END PRIVATE KEY-----\n"`
- Be in quotes: `"..."`

**Example format:**
```
"-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC5JphiJ3up+LNM\nN5FY83eoC2hDVta6CKfKyntBE8S59TStqT/jqUp0mbh99knfFVPowxpwMCOas2A6\n...many more lines...\ncJA9bJA+ZjkgjiX8dqrtEjEt\n-----END PRIVATE KEY-----\n"
```

---

## After Getting the Key

1. **Copy the entire `private_key` value from the JSON file**
2. **Update your `.env` file:**
   ```bash
   cd /var/www/studentitrack
   nano .env
   ```
3. **Find `FIREBASE_PRIVATE_KEY=` and replace the value with the complete key**
4. **Save:** `Ctrl + X`, then `Y`, then `Enter`
5. **Restart backend:** `pm2 restart student-itrack-api --update-env`

---

## Security Note

⚠️ **Important:** 
- The private key is sensitive - don't share it publicly
- Don't commit it to Git
- Keep it secure
- If you lose it, you can generate a new one (but the old one will stop working)

---

**Go to Firebase Console → Project Settings → Service Accounts → Generate new private key → Download JSON file → Copy the `private_key` value!**

