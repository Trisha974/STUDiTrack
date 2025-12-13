# Fix: MySQL Command Issues

## The Problems

1. **Typo:** `DATABSE` should be `DATABASE`
2. **Missing semicolon:** MySQL commands must end with `;`
3. **Incomplete command:** You're in continuation mode (`->`)

---

## Fix: Cancel Current Command

**You're in continuation mode (`->`). Cancel it first:**

Press `Ctrl + C` or type:
```
\c
```

**This will cancel the current command and return you to `mysql>` prompt.**

---

## Correct Commands

**After canceling, run these commands one at a time:**

### Step 1: Create Database (with semicolon)

```sql
CREATE DATABASE IF NOT EXISTS student_itrack;
```

**Important:** 
- ✅ `DATABASE` (not `DATABSE`)
- ✅ End with `;` (semicolon)

### Step 2: Show Databases

```sql
SHOW DATABASES;
```

**Should show:** `student_itrack` in the list

### Step 3: Exit MySQL

```sql
EXIT;
```

---

## Quick Reference

**All MySQL commands must:**
- ✅ End with `;` (semicolon)
- ✅ Be spelled correctly
- ✅ Be on one line (or use `->` continuation properly)

**Common mistakes:**
- ❌ `DATABSE` → ✅ `DATABASE`
- ❌ Missing `;` → ✅ Always end with `;`
- ❌ `SHOW` alone → ✅ `SHOW DATABASES;`

---

## Step-by-Step Fix

1. **Cancel current command:**
   - Press `Ctrl + C` or type `\c`
   - You should see `mysql>` prompt

2. **Create database:**
   ```sql
   CREATE DATABASE IF NOT EXISTS student_itrack;
   ```

3. **Verify database exists:**
   ```sql
   SHOW DATABASES;
   ```

4. **Exit:**
   ```sql
   EXIT;
   ```

---

**Cancel the current command first (`Ctrl + C` or `\c`), then run the correct commands with semicolons!**

