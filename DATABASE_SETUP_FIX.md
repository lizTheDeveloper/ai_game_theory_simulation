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

### Step 1: Apply All Migrations (RECOMMENDED)

**On your VM, run:**
```bash
cd /home/g7throwawayplz/ai_game_theory_simulation

# Pull the latest migration script
git pull origin claude/build-marcus-agent-016LTPXuAb6A3hYDwTvMjyof

# Run the comprehensive migration script
./scripts/apply_all_migrations.sh
```

**What this does:**
- Copies migration files to /tmp (where postgres user can access them)
- Applies migrations 003, 004, 005, 006 in order
- Creates tables in BOTH `marcus_test` and `marcus` databases
- Verifies tables and users after each database
- Shows summary and next steps

**Migrations applied:**
- **003:** CSP violations tracking table
- **004:** Password reset tokens table
- **005:** Complete schema (users, citation_analyses, agent_behaviors, audit_logs)
- **006:** Agent system schema

**Expected output:**
```
🔄 MARCUS 3.0 - Database Migration Script
==========================================

📁 Copying migration files to /tmp...
✅ Available migrations:
003_csp_violations.sql
004_password_reset_tokens.sql
005_complete_schema.sql
006_agent_system_schema.sql

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Applying migrations to database: marcus_test
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Applying migration 003 (CSP violations)...
✅ Migration 003 applied

📋 Applying migration 004 (password reset tokens)...
✅ Migration 004 applied

📋 Applying migration 005 (complete schema - users, citations, agents, audit)...
✅ Migration 005 applied

📋 Applying migration 006 (agent system)...
✅ Migration 006 applied

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ All migrations applied to marcus_test
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Tables in marcus_test:
 agent_behaviors
 agent_states
 audit_logs
 citation_analyses
 csp_violations
 password_reset_tokens
 users

✅ Users table exists

👥 Users in marcus_test:
        email         | role     | is_active
----------------------+----------+-----------
 admin@marcus.local   | admin    | t
 test@example.com     | operator | t

[Same output for marcus database...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ DATABASE MIGRATIONS COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### Step 2: Verify Migration Success (Optional)

**The migration script already shows verification, but you can double-check:**

```bash
# Check tables in marcus_test
sudo -u postgres psql -d marcus_test -c "\dt"

# Check admin user exists
sudo -u postgres psql -d marcus_test -c "SELECT email, role, is_active FROM users;"
```

**Expected tables:**
- agent_behaviors
- agent_states (existing)
- audit_logs
- citation_analyses
- csp_violations
- password_reset_tokens
- users

**Expected users:**
- admin@marcus.local (admin role, active)
- test@example.com (operator role, active)

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

**Complete database setup (RECOMMENDED - use the migration script):**
```bash
cd /home/g7throwawayplz/ai_game_theory_simulation

# 1. Pull latest code (includes migration script)
git pull origin claude/build-marcus-agent-016LTPXuAb6A3hYDwTvMjyof

# 2. Run comprehensive migration script
./scripts/apply_all_migrations.sh

# 3. Run admin password change script (already fixed)
sudo ./scripts/change_admin_password.sh

# 4. Save credentials to password manager!

# 5. Restart platform
sudo systemctl restart marcus-platform

# 6. Run tests
npm test
```

**Alternative: Manual migration (if script fails):**
```bash
cd /tmp
cp ~/ai_game_theory_simulation/src/platform/database/migrations/*.sql .
sudo -u postgres psql -d marcus_test -f 003_csp_violations.sql
sudo -u postgres psql -d marcus_test -f 004_password_reset_tokens.sql
sudo -u postgres psql -d marcus_test -f 005_complete_schema.sql
sudo -u postgres psql -d marcus_test -f 006_agent_system_schema.sql
sudo -u postgres psql -d marcus_test -c "\dt"
rm *.sql
cd ~/ai_game_theory_simulation
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
