# MARCUS 3.0 - Production Deployment Guide

**Status:** Ready for final security configuration
**Branch:** `claude/build-marcus-agent-016LTPXuAb6A3hYDwTvMjyof`
**Date:** 2025-11-20

---

## 🎯 Quick Start (Complete Deployment in 5 Minutes)

On your production VM at `/home/g7throwawayplz/ai_game_theory_simulation`:

```bash
# 1. Pull latest changes (includes security scripts)
git pull origin claude/build-marcus-agent-016LTPXuAb6A3hYDwTvMjyof

# 2. Generate production JWT secrets
./scripts/generate_jwt_secrets.sh

# 3. Change default admin password
sudo ./scripts/change_admin_password.sh

# 4. Run deployment checklist (verify everything)
./scripts/final_deployment_checklist.sh

# 5. Restart MARCUS service
sudo systemctl restart marcus-platform

# 6. Verify service is running
sudo systemctl status marcus-platform
```

**Expected result:** All checks pass, service running without warnings ✅

---

## 📋 Detailed Steps

### **Step 1: Pull Latest Code**

```bash
cd /home/g7throwawayplz/ai_game_theory_simulation
git pull origin claude/build-marcus-agent-016LTPXuAb6A3hYDwTvMjyof
```

**What this includes:**
- ✅ Integration test fixes (18/18 passing)
- ✅ Next.js standalone optimization
- ✅ **NEW:** Security configuration scripts

---

### **Step 2: Generate Production JWT Secrets** 🔐

```bash
./scripts/generate_jwt_secrets.sh
```

**What this does:**
- Generates two 256-bit cryptographically secure secrets
- Updates `.env` file automatically
- Creates backup of previous `.env`
- Displays secrets for verification

**Output example:**
```
✅ JWT SECRETS CONFIGURED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  JWT_SECRET:         a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8
  JWT_REFRESH_SECRET: z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4b3c2

📝 Secrets saved to: .env
```

**⚠️ Important:**
- This will **invalidate all existing JWT tokens**
- All users will need to log in again
- Only run this once during initial deployment

---

### **Step 3: Change Default Admin Password** 🔑

```bash
sudo ./scripts/change_admin_password.sh
```

**What this does:**
- Generates secure 24-character random password
- Hashes with bcrypt (12 rounds) - same as production code
- Updates admin user in database
- Saves credentials to `/tmp/marcus_admin_credentials.txt`

**Output example:**
```
✅ Admin password updated successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔑 NEW ADMIN CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Email:    admin@marcus-platform.local
  Password: Abc123XyZ789!@#DefGhi

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  IMPORTANT: Save these credentials securely!
   - Store in a password manager
   - Do not commit to version control
   - Do not share via unencrypted channels

📝 Credentials also saved to: /tmp/marcus_admin_credentials.txt
   (This file will be deleted on reboot)
```

**⚠️ Important:**
1. **Save credentials immediately** to password manager
2. **Delete temp file** after saving: `rm /tmp/marcus_admin_credentials.txt`
3. **Test login** after deployment to verify credentials work

---

### **Step 4: Run Deployment Checklist** ✅

```bash
./scripts/final_deployment_checklist.sh
```

**What this checks:**

**1️⃣ Security Configuration**
- ✅ JWT_SECRET configured (256-bit)
- ✅ JWT_REFRESH_SECRET configured (256-bit)
- ✅ Default admin password changed
- ✅ REDIS_PASSWORD configured

**2️⃣ Infrastructure**
- ✅ PostgreSQL service running
- ✅ Redis service running
- ✅ MARCUS systemd service exists
- ✅ Service uses standalone build
- ✅ Service auto-start enabled

**3️⃣ Build Artifacts**
- ✅ Next.js standalone build exists
- ✅ Dependencies installed

**4️⃣ Database Schema**
- ✅ users table exists
- ✅ refresh_tokens table exists
- ✅ auth_audit_log table exists
- ✅ reset_failed_attempts() function exists
- ✅ check_and_lock_account() function exists

**5️⃣ Testing**
- ✅ Test configuration exists
- ✅ Integration test runner exists

**Expected output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✅ Passed:   18
  ⚠️  Warnings: 0
  ❌ Failed:   0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ DEPLOYMENT CHECKLIST PASSED!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 MARCUS 3.0 is ready for production!
```

**If checks fail:**
The script will suggest fixes for each failed check.

---

### **Step 5: Restart MARCUS Service** 🚀

```bash
sudo systemctl restart marcus-platform
```

**Why restart?**
- Load new JWT secrets from `.env`
- Apply any systemd service updates
- Clear any cached configurations

---

### **Step 6: Verify Service Status** 🔍

```bash
# Check service is running
sudo systemctl status marcus-platform

# Check logs for errors
sudo journalctl -u marcus-platform -n 50 --no-pager

# Test API endpoint
curl http://localhost:3000/health
```

**Expected results:**

**Service status:**
```
● marcus-platform.service - MARCUS 3.0 Citation Integrity Platform
   Loaded: loaded (/etc/systemd/system/marcus-platform.service; enabled)
   Active: active (running) since Wed 2025-11-20 12:00:00 UTC; 30s ago
```

**Service logs:**
```
✅ Ready in 1000ms
✅ Database connected
✅ Redis connected
```

**API response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-20T12:00:00.000Z"
}
```

---

## 🧪 Testing After Deployment

### **Test 1: Admin Login**

```bash
# Test admin login with new credentials
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@marcus-platform.local",
    "password": "YOUR_NEW_PASSWORD_HERE"
  }'
```

**Expected:** `200 OK` with access token and refresh token

---

### **Test 2: Integration Tests**

```bash
./scripts/run_integration_tests.sh
```

**Expected:** `18/18 tests passing`

---

### **Test 3: Service Restart**

```bash
# Test service auto-restart
sudo systemctl restart marcus-platform
sleep 3
sudo systemctl status marcus-platform
```

**Expected:** Service comes back up automatically

---

## 🔒 Security Best Practices

### **1. Secure .env File**

```bash
# Verify .env file permissions
ls -la .env

# Should be: -rw------- (600) - owner read/write only
# If not, fix:
chmod 600 .env
```

### **2. Backup .env File**

```bash
# Create encrypted backup
gpg -c .env
# Output: .env.gpg (encrypted with password)

# Store .env.gpg in secure location
# DO NOT commit .env to git
```

### **3. Verify .gitignore**

```bash
# Ensure .env is ignored
grep "^.env$" .gitignore
```

**Expected:** `.env` should be in `.gitignore`

---

## 📊 Deployment Checklist Summary

| Step | Description | Status |
|------|-------------|--------|
| 1 | Pull latest code | ⏳ Run on VM |
| 2 | Generate JWT secrets | ⏳ Run script |
| 3 | Change admin password | ⏳ Run script |
| 4 | Run deployment checklist | ⏳ Verify |
| 5 | Restart service | ⏳ Apply changes |
| 6 | Verify service | ⏳ Test |
| 7 | Test admin login | ⏳ Validate |
| 8 | Run integration tests | ⏳ Confirm |

---

## 🚨 If Something Goes Wrong

### **Service Won't Start**

```bash
# Check logs
sudo journalctl -u marcus-platform -n 100 --no-pager

# Common issues:
# - Missing .env file → Create from .env.example
# - Wrong file permissions → chmod 600 .env
# - Database not running → sudo systemctl start postgresql
# - Redis not running → sudo systemctl start redis-server
```

### **Can't Login with New Admin Password**

```bash
# Verify admin user exists
sudo -u postgres psql marcus -c "SELECT email, role FROM users WHERE email = 'admin@marcus-platform.local';"

# If password incorrect, run script again:
sudo ./scripts/change_admin_password.sh
```

### **JWT Token Errors**

```bash
# Verify secrets are set
grep JWT_SECRET .env
grep JWT_REFRESH_SECRET .env

# If missing or invalid:
./scripts/generate_jwt_secrets.sh
sudo systemctl restart marcus-platform
```

---

## 📖 Additional Resources

- **Full Documentation:** `docs/MINOR_ISSUES_RESOLUTION.md`
- **API Reference:** `src/platform/docs/AUTHENTICATION.md`
- **Security Guide:** `src/platform/docs/SECURITY_CONFIGURATION_GUIDE.md`
- **Troubleshooting:** `FINAL_DEPLOYMENT_STEPS.md`

---

## ✅ Deployment Complete!

After completing all steps:

1. ✅ JWT secrets configured (256-bit)
2. ✅ Admin password changed (secure random)
3. ✅ All checks passing
4. ✅ Service running without warnings
5. ✅ Integration tests passing (18/18)
6. ✅ Admin login working

**🎉 MARCUS 3.0 is now production-ready!**

---

**Last Updated:** 2025-11-20
**Branch:** `claude/build-marcus-agent-016LTPXuAb6A3hYDwTvMjyof`
**Status:** ✅ Ready for deployment
