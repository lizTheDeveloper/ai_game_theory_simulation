# MARCUS 3.0 - Database Setup Fix

**Issue:** The `users` table doesn't exist because database migrations haven't been run.

**Date:** November 20, 2025

---

## 🔍 Problem Analysis

**Error from admin password script:**
```
ERROR:  relation "users" does not exist
```

**Root Cause:**
1. Database migrations in `src/platform/database/migrations/` haven't been applied
2. The `users` table hasn't been created yet
3. Email mismatch: Script looks for `admin@marcus-platform.local`, but migration creates `admin@marcus.local`

---

## ✅ Solution: Run Migrations

### Step 1: Apply Complete Schema Migration

**On your VM, run:**
```bash
cd /home/g7throwawayplz/ai_game_theory_simulation

# Apply the complete schema migration (creates users table + initial data)
sudo -u postgres psql -d marcus_test -f src/platform/database/migrations/005_complete_schema.sql
```

**What this does:**
- Drops and recreates: `users`, `citation_analyses`, `agent_behaviors`, `audit_logs` tables
- Creates all necessary indices
- Creates default admin user: `admin@marcus.local` (password: `SecurePassword123!`)
- Creates test user: `test@example.com`

**Expected output:**
```
DROP TABLE
DROP TABLE
DROP TABLE
DROP TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE INDEX
CREATE INDEX
...
INSERT 0 1
INSERT 0 1

 tablename
-----------------
 agent_behaviors
 audit_logs
 citation_analyses
 users
(4 rows)

 user_count
------------
          2
(1 row)
```

---

### Step 2: Apply Agent System Schema Migration

**Run:**
```bash
sudo -u postgres psql -d marcus_test -f src/platform/database/migrations/006_agent_system_schema.sql
```

**What this does:**
- Creates additional tables for agent system (if not already present)
- Extends agent functionality tables

---

### Step 3: Verify Tables Created

**Check that tables exist:**
```bash
sudo -u postgres psql -d marcus_test -c "\dt"
```

**Expected output:**
```
                  List of relations
 Schema |       Name        | Type  |  Owner
--------+-------------------+-------+----------
 public | agent_behaviors   | table | postgres
 public | audit_logs        | table | postgres
 public | citation_analyses | table | postgres
 public | users             | table | postgres
(4 rows)
```

**Check admin user exists:**
```bash
sudo -u postgres psql -d marcus_test -c "SELECT email, role, is_active FROM users;"
```

**Expected output:**
```
        email         | role     | is_active
----------------------+----------+-----------
 admin@marcus.local   | admin    | t
 test@example.com     | operator | t
(2 rows)
```

---

## 🔐 Step 4: Fix Admin Password Script

The script is looking for the wrong email address. We have two options:

### Option A: Update the Script (Recommended)

**Edit the script:**
```bash
nano scripts/change_admin_password.sh
```

**Change line 22:**
```bash
# Before:
ADMIN_EMAIL="admin@marcus-platform.local"

# After:
ADMIN_EMAIL="admin@marcus.local"
```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

---

### Option B: Update Database Email (Alternative)

**Change admin email in database to match script:**
```bash
sudo -u postgres psql -d marcus_test -c "
UPDATE users
SET email = 'admin@marcus-platform.local'
WHERE email = 'admin@marcus.local';
"
```

---

## 🔄 Step 5: Run Admin Password Script Again

**After fixing the email mismatch:**
```bash
sudo ./scripts/change_admin_password.sh
```

**Expected output:**
```
🔐 MARCUS 3.0 - Admin Password Reset
====================================

📝 Generating secure random password...
🔒 Hashing password with bcrypt (12 rounds)...
💾 Updating admin user in database...
UPDATE 1

✅ Admin password updated successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔑 NEW ADMIN CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Email:    admin@marcus.local
  Password: [24 random characters]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Credentials also saved to: /tmp/marcus_admin_credentials.txt
```

**⚠️ SAVE CREDENTIALS IMMEDIATELY to password manager!**

---

## 🧪 Step 6: Run Integration Tests

**Restart platform first:**
```bash
# If running in foreground, Ctrl+C then:
NODE_ENV=development npx tsx src/platform/startup.ts

# Or restart systemd service:
sudo systemctl restart marcus-platform
```

**In a NEW terminal, run tests:**
```bash
cd /home/g7throwawayplz/ai_game_theory_simulation
npm test
```

**Expected results:**
```
Test Suites: 4 passed, 4 total
Tests:       28 passed, 28 total

✅ Authentication Flow Tests: 18 passing
✅ Agent Integration Tests: 10 passing
```

---

## 🔍 Troubleshooting

### Issue: Migration fails with "permission denied"

**Solution:**
```bash
# Run as postgres user
sudo -u postgres psql -d marcus_test -f src/platform/database/migrations/005_complete_schema.sql
```

---

### Issue: "database marcus_test does not exist"

**Solution: Create the database first:**
```bash
sudo -u postgres createdb marcus_test
sudo -u postgres psql -d marcus_test -c "GRANT ALL PRIVILEGES ON DATABASE marcus_test TO marcus;"
```

---

### Issue: "role marcus does not exist"

**Solution: Create the marcus user:**
```bash
sudo -u postgres psql -c "CREATE USER marcus WITH PASSWORD 'IWRdNzwzMtOcUosr79rrWL7fPr7ZsoQ6';"
sudo -u postgres psql -c "ALTER USER marcus WITH SUPERUSER;"
```

---

### Issue: Tests fail with authentication errors

**Check JWT secrets are set:**
```bash
grep JWT_SECRET .env
# Should show both JWT_SECRET and JWT_REFRESH_SECRET with 64 hex characters each
```

**Check admin user can authenticate:**
```bash
# Try logging in via API (after platform is running)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@marcus.local",
    "password": "SecurePassword123!"
  }'

# Should return JWT token (before password change) or error (after password change)
```

---

## 📋 Complete Checklist

### Database Setup:
- [ ] Run migration 005 (complete schema)
- [ ] Run migration 006 (agent system)
- [ ] Verify tables created (`\dt` in psql)
- [ ] Verify admin user exists

### Admin Password:
- [ ] Fix email mismatch (script or database)
- [ ] Run admin password script
- [ ] Save new credentials to password manager
- [ ] Delete `/tmp/marcus_admin_credentials.txt`

### Platform Verification:
- [ ] Restart platform
- [ ] Run integration tests (28 passing)
- [ ] Test health endpoint
- [ ] Test admin login with new password

---

## 🎯 Quick Command Summary

**Complete database setup:**
```bash
cd /home/g7throwawayplz/ai_game_theory_simulation

# 1. Run migrations
sudo -u postgres psql -d marcus_test -f src/platform/database/migrations/005_complete_schema.sql
sudo -u postgres psql -d marcus_test -f src/platform/database/migrations/006_agent_system_schema.sql

# 2. Verify tables
sudo -u postgres psql -d marcus_test -c "\dt"

# 3. Fix script email (Option A - edit script)
sed -i 's/admin@marcus-platform.local/admin@marcus.local/' scripts/change_admin_password.sh

# 4. Run admin password script
sudo ./scripts/change_admin_password.sh

# 5. Restart platform
sudo systemctl restart marcus-platform

# 6. Run tests
npm test
```

---

## ✅ Success Criteria

**Database setup complete when:**
- `users` table exists with 2 users (admin + test)
- `citation_analyses`, `agent_behaviors`, `audit_logs` tables exist
- Admin password successfully changed
- Integration tests pass (28 tests)

---

**Next:** After completing these steps, proceed to `PHASE_2_NEXT_STEPS.md` Step 5 (Verify Health Endpoint)
