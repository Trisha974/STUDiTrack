# Correct Command to Generate CSRF Secret

## The Error

You typed:
```bash
node -e "console.log(require('crypto').randomly(32).toString('hex'))"
```

**Error:** `TypeError: require(...).randomly is not a function`

**Problem:** You typed `randomly` instead of `randomBytes`

---

## Correct Command

**Use this (copy-paste exactly):**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Notice:** `randomBytes` (not `randomly`)

---

## Step-by-Step

1. **Run the correct command:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **You'll get output like:**
   ```
   a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
   ```

3. **Copy the entire output** (64 characters)

4. **Edit .env file:**
   ```bash
   nano .env
   ```

5. **Find:**
   ```
   CSRF_SECRET=your-random-csrf-secret-here-min-32-characters
   ```

6. **Replace with:**
   ```
   CSRF_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
   ```
   (Use your actual generated value)

7. **Save:** `Ctrl + X`, then `Y`, then `Enter`

---

## Common Typos

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| `randomly` | `randomBytes` |
| `randombytes` | `randomBytes` |
| `random_bytes` | `randomBytes` |

---

## Quick Copy-Paste

**Just copy and paste this entire command:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Then copy the output and add it to `.env` as `CSRF_SECRET=...`**

---

**Use `randomBytes` (not `randomly`)!**

