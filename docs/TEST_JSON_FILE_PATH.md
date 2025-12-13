# Test JSON File Path on VPS

## The Path Should Be Correct

**From `server/src/shared/middleware/auth.js`:**
- `__dirname` = `/var/www/studentitrack/server/src/shared/middleware`
- `../../../serviceAccountKey.json` = `/var/www/studentitrack/server/serviceAccountKey.json` ✅

**File location:**
- `/var/www/studentitrack/server/serviceAccountKey.json` ✅

**The path should be correct!**

---

## Test Path Resolution on VPS

**Run this on your VPS to test the path:**

```bash
cd /var/www/studentitrack/server
node -e "const path = require('path'); const fs = require('fs'); const testPath = path.join(__dirname, 'src/shared/middleware'); const jsonPath = path.join(testPath, '../../../serviceAccountKey.json'); console.log('Expected path:', jsonPath); console.log('File exists:', fs.existsSync(jsonPath));"
```

**This will show:**
- The exact path the code is looking for
- Whether the file exists at that path

---

## Test Loading JSON File

**Test if Node.js can actually load the file:**

```bash
cd /var/www/studentitrack/server
node -e "try { const sa = require('./serviceAccountKey.json'); console.log('✅ JSON loaded successfully'); console.log('Project ID:', sa.project_id); } catch(e) { console.error('❌ Error loading JSON:', e.message); }"
```

**If this fails, there's an issue with the JSON file format.**

---

## Check Actual Code on VPS

**Verify the code on VPS matches what we expect:**

```bash
cat /var/www/studentitrack/server/src/shared/middleware/auth.js | grep -A 5 "serviceAccountPath"
```

**Should show:**
```javascript
const serviceAccountPath = path.join(__dirname, '../../../serviceAccountKey.json')
```

---

## If Path Resolution Fails

**If the path is wrong, we can fix it by using an absolute path or moving the file.**

**Option 1: Use absolute path in code (more reliable):**
```javascript
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
  '/var/www/studentitrack/server/serviceAccountKey.json'
```

**Option 2: Move file to where code expects (if path is actually wrong):**
```bash
# If code expects it in root
cp /var/www/studentitrack/server/serviceAccountKey.json /var/www/studentitrack/serviceAccountKey.json
```

---

## Check for File Loading Errors

**The error "Failed to parse private key" suggests the file might be loading but the content is wrong.**

**Check the JSON file content:**
```bash
cat /var/www/studentitrack/server/serviceAccountKey.json | head -5
```

**Should show valid JSON starting with:**
```json
{
  "type": "service_account",
  "project_id": "studitrack-54f69",
```

---

## Debug Steps

**Run these on VPS to debug:**

```bash
# 1. Test path resolution
cd /var/www/studentitrack/server
node -e "const path = require('path'); console.log(path.join(__dirname, 'src/shared/middleware', '../../../serviceAccountKey.json'))"

# 2. Test if file exists at that path
node -e "const path = require('path'); const fs = require('fs'); const p = path.join('/var/www/studentitrack/server/src/shared/middleware', '../../../serviceAccountKey.json'); console.log('Path:', p); console.log('Exists:', fs.existsSync(p))"

# 3. Test loading the file
node -e "try { const sa = require('/var/www/studentitrack/server/serviceAccountKey.json'); console.log('✅ Loaded:', sa.project_id); } catch(e) { console.error('❌ Error:', e.message); }"
```

---

**Run the path resolution test on your VPS to see what path it's actually using!**

