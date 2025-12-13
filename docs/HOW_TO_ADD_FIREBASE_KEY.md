# How to Add Firebase Private Key to .env

## ✅ Yes, Copy the ENTIRE Key!

**The key you showed is complete:**
- ✅ Starts with: `-----BEGIN PRIVATE KEY-----\n`
- ✅ Ends with: `\n-----END PRIVATE KEY-----\n`
- ✅ Contains the full key in between

**Copy ALL of it!**

---

## Step 1: Copy the Complete Key

**Copy this entire string (including the quotes and \n):**

```
"-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC5JphiJ3up+LNM\nN5FY83eoC2hDVta6CKfKyntBE8S59TStqT/jqUp0mbh99knfFVPowxpwMCOas2A6\nL0zzsy/SmXQ1FabEiuKe3dzZqsyro8ZAbePCEAq6xE/uNW8FUGMun8bb5BIGV8Qv\nqY/iRB+XFfr0emCXCdrailL+FoI6b8mKcRg8DLNJZg+DX+aMrNOrjcSKD8gP7ZLs\nsNBbyorYVvcR6CaCmtcO9tWtRVcoIHjKN60yvFKYy2ZVmlXSU8nALDN22ysewmsg\nJ8wCyl/cC0j2jATcGbkYwEyB4Zw6FI5lJwEX7EX+sUNz+8q3h5/h/EjHKRCt6Gnp\n+H383WPPAgMBAAECggEAEOWK9N4vOhjrspzEQ26zRfSF4dYBcj3K+PCXOfOmDuW9\nQSHtJjIeDNu1y1etcHyKSUzQ01nZTfYTuzZI2q6eF8/lm9iWJ7aYWDDdcEcsNs0T\nO8WrijDGQeVwzpzgElyT3ek6j85Vr3AqrmzWKCsuX4Pj1el7JMgt9FFjod4yU/HA\nSUEdyd293o8/bw6f923k2M8YYR2Wkr8tzNJT+Z0MCe6M7OP6UHMxAfv0Rj9tETt0\ndvKod7b+Qx+WLvplLXWt81JilDnBWrRXEe/Sca9Es6iiiEiwWOd4tzlonXVXfSdp\nd19GHhpWRppcXdbWQMdV4vDtXdczbVaKmlwHdTpQUQKBgQDex2uGqnteST/K37lF\n8kauWwDLj2jT1nIGCeGW+HF5k1E4ECA/p2B9GJ+ct4JFnJTrspuUbQCh+d1uRCGz\nNj1ImMs9NZZ0F3pG/Nwzo8ZuUphwt0r36cWDQBTmplDEj0VnU7j+wIM/URbuZzu1\nt9WwfUIMj4lyGIz6rmpBiSUEHwKBgQDUwrgbXicDOAuzpq4nEVO8UP0CcaPOl9if\n05K3S/nwAVFixnlI2ceN9CjMW/B71VvPTl1D1orUsSRJpEFGz00Y0gr+3F+mLg2o\n87z6uAQXTpC0x+Mpr2KSqDtuWktTKY+6IrKfmWpATRxrkfIfVLS5fCnGXGVYbyKU\ncK7o+0YqUQKBgCnOzOwR1GMmZfVhtPhedktEQsrw1+BhbzaY5iAZ8dm5/tUBmbu4\nYpA3bcTQX39G2l+9PhtFtYewR5Do8lYaiLe2DPYot1qECWuHCqAaTSPpFjiY/VW3\nJlzySrnaXm/03zZ77MzKPhdE1YPaFceNf2nGp/2JdmbWGqb00nYIEc1LAoGBAKUN\nHbgVdVxY6TMIFkg2d+g6R9zSfcoyIBn1DvdlWFKpIxLmd4ZddCKai9/lXw0h+mQ7\nHb0XvYG8njMG2qDtBpk/sMn/+a+4QF6WHz+862eNSlMEUiSva1/sZJZ6M78jGd3D\nNyD66eNSLr8AbH2Dv+O4/8tjODe/l2ric75H2CnRAoGBALFlKCVLkrGFq+hWIzKQ\nQBXlB4DYRdPcTEhiXd1V+J9vePW23ZKMXli0JUdU7FwxmMJpkGI7jGm57j0MSVGB\nDTClQyVL8UBetb/SP1sKuzqymGqNMUcajYJw6TI0ND9EudUez0W13tihl58mleuY\ncJA9bJA+ZjkgjiX8dqrtEjEt\n-----END PRIVATE KEY-----\n"
```

**Important:** Copy the ENTIRE string, including:
- ✅ The opening quote `"`
- ✅ `-----BEGIN PRIVATE KEY-----\n`
- ✅ All the lines in between
- ✅ `\n-----END PRIVATE KEY-----\n`
- ✅ The closing quote `"`

---

## Step 2: Edit .env File

```bash
cd /var/www/studentitrack
nano .env
```

---

## Step 3: Find and Replace FIREBASE_PRIVATE_KEY

**Use `Ctrl + W` to search for:**
```
FIREBASE_PRIVATE_KEY
```

**You should find a line like:**
```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEVQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC..\n-----END PRIVATE KEY-----\n"
```

**Replace the ENTIRE value (keep `FIREBASE_PRIVATE_KEY=` part):**

**Delete the old value and paste the complete key:**

```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC5JphiJ3up+LNM\nN5FY83eoC2hDVta6CKfKyntBE8S59TStqT/jqUp0mbh99knfFVPowxpwMCOas2A6\nL0zzsy/SmXQ1FabEiuKe3dzZqsyro8ZAbePCEAq6xE/uNW8FUGMun8bb5BIGV8Qv\nqY/iRB+XFfr0emCXCdrailL+FoI6b8mKcRg8DLNJZg+DX+aMrNOrjcSKD8gP7ZLs\nsNBbyorYVvcR6CaCmtcO9tWtRVcoIHjKN60yvFKYy2ZVmlXSU8nALDN22ysewmsg\nJ8wCyl/cC0j2jATcGbkYwEyB4Zw6FI5lJwEX7EX+sUNz+8q3h5/h/EjHKRCt6Gnp\n+H383WPPAgMBAAECggEAEOWK9N4vOhjrspzEQ26zRfSF4dYBcj3K+PCXOfOmDuW9\nQSHtJjIeDNu1y1etcHyKSUzQ01nZTfYTuzZI2q6eF8/lm9iWJ7aYWDDdcEcsNs0T\nO8WrijDGQeVwzpzgElyT3ek6j85Vr3AqrmzWKCsuX4Pj1el7JMgt9FFjod4yU/HA\nSUEdyd293o8/bw6f923k2M8YYR2Wkr8tzNJT+Z0MCe6M7OP6UHMxAfv0Rj9tETt0\ndvKod7b+Qx+WLvplLXWt81JilDnBWrRXEe/Sca9Es6iiiEiwWOd4tzlonXVXfSdp\nd19GHhpWRppcXdbWQMdV4vDtXdczbVaKmlwHdTpQUQKBgQDex2uGqnteST/K37lF\n8kauWwDLj2jT1nIGCeGW+HF5k1E4ECA/p2B9GJ+ct4JFnJTrspuUbQCh+d1uRCGz\nNj1ImMs9NZZ0F3pG/Nwzo8ZuUphwt0r36cWDQBTmplDEj0VnU7j+wIM/URbuZzu1\nt9WwfUIMj4lyGIz6rmpBiSUEHwKBgQDUwrgbXicDOAuzpq4nEVO8UP0CcaPOl9if\n05K3S/nwAVFixnlI2ceN9CjMW/B71VvPTl1D1orUsSRJpEFGz00Y0gr+3F+mLg2o\n87z6uAQXTpC0x+Mpr2KSqDtuWktTKY+6IrKfmWpATRxrkfIfVLS5fCnGXGVYbyKU\ncK7o+0YqUQKBgCnOzOwR1GMmZfVhtPhedktEQsrw1+BhbzaY5iAZ8dm5/tUBmbu4\nYpA3bcTQX39G2l+9PhtFtYewR5Do8lYaiLe2DPYot1qECWuHCqAaTSPpFjiY/VW3\nJlzySrnaXm/03zZ77MzKPhdE1YPaFceNf2nGp/2JdmbWGqb00nYIEc1LAoGBAKUN\nHbgVdVxY6TMIFkg2d+g6R9zSfcoyIBn1DvdlWFKpIxLmd4ZddCKai9/lXw0h+mQ7\nHb0XvYG8njMG2qDtBpk/sMn/+a+4QF6WHz+862eNSlMEUiSva1/sZJZ6M78jGd3D\nNyD66eNSLr8AbH2Dv+O4/8tjODe/l2ric75H2CnRAoGBALFlKCVLkrGFq+hWIzKQ\nQBXlB4DYRdPcTEhiXd1V+J9vePW23ZKMXli0JUdU7FwxmMJpkGI7jGm57j0MSVGB\nDTClQyVL8UBetb/SP1sKuzqymGqNMUcajYJw6TI0ND9EudUez0W13tihl58mleuY\ncJA9bJA+ZjkgjiX8dqrtEjEt\n-----END PRIVATE KEY-----\n"
```

**Important:**
- ✅ Keep the quotes `"` at the beginning and end
- ✅ Keep all the `\n` characters (they represent newlines)
- ✅ The entire key should be on ONE line in the .env file

---

## Step 4: Save and Exit

**Save:** `Ctrl + O`, then `Enter`  
**Exit:** `Ctrl + X`

---

## Step 5: Verify the Key Was Added

**Check the file:**
```bash
grep FIREBASE_PRIVATE_KEY .env
```

**Should show the complete key (very long line)**

---

## Step 6: Restart Backend

```bash
pm2 restart student-itrack-api
```

**Check logs:**
```bash
pm2 logs student-itrack-api --err
```

**Should show:**
- ✅ No Firebase errors
- ✅ Firebase Admin SDK initialized successfully

---

## Step 7: Test Backend

```bash
curl http://localhost:5000/api/health
```

**Expected response:**
```json
{"status":"ok","message":"Server is running"}
```

---

## Important Notes

1. **Copy the ENTIRE key** - Don't truncate it
2. **Keep the quotes** - The value must be in quotes
3. **Keep the `\n` characters** - They represent newlines in the key
4. **One line in .env** - Even though the key has multiple lines, it should be on one line in .env with `\n` characters

---

**Yes, copy the ENTIRE key and paste it into the .env file!**

