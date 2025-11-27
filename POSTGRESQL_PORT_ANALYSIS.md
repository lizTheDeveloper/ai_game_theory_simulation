# PostgreSQL Port Inconsistency Analysis

**Date:** November 20, 2025
**Issue:** Mixed usage of ports 5432 (standard) vs 5433 (non-standard)

---

## 🔍 Current State

### **Files Using Port 5432 (Standard)**

**Environment Files:**
- `.env.test` - DATABASE_PORT=5432, DB_PORT=5432
- `.env.secrets.example` - MARCUS_SECRET_DB_PORT=5432
- `.env.secrets.template` - DATABASE_PORT=5432
- `src/platform/.env.example` - DB_PORT=5432

**VM Provisioning Scripts:**
- `scripts/provision_marcus_vm.sh` - DATABASE_PORT=5432
- `scripts/setup_marcus_vm.sh` - DATABASE_PORT=5432

**TypeScript Code (defaults when env not set):**
- `src/platform/api/server.ts` - `process.env.DATABASE_PORT || '5432'`
- `src/platform/config/platformConfig.ts` - `process.env.DATABASE_PORT || '5432'`
- `src/platform/__tests__/agentIntegration.test.ts` - `process.env.DB_PORT || '5432'`
- `src/platform/tests/auth.test.ts` - `process.env.TEST_DB_PORT || '5432'`
- `src/platform/evaluation/citationBenchmarks.ts` - port: 5432 (hardcoded)
- `src/platform/integration/citationAgentIntegration.ts` - port: 5432 (hardcoded)

**Documentation:**
- Most MARCUS setup guides reference 5432
- All example .env files show 5432

---

### **Files Using Port 5433 (Non-Standard)**

**Phase 1 Deployment:**
- `DEPLOYMENT_NOTE.md` - "Database: PostgreSQL 5433"
- `PHASE_1_COMPLETE.md` - Documents switch from 5432 to 5433
- `PHASE_2_SECURITY_INSTRUCTIONS.md` - "Port: 5433 (non-standard)"
- `SESSION_SUMMARY.md` - "Database port on non-standard 5433"

**Auto-Detection Scripts:**
- `scripts/run_integration_tests.sh` - Auto-detects actual port
- `setup_test_db_fixed.sh` - Auto-detects actual port

**Unit Tests:**
- `src/platform/__tests__/unit/platformConfig.test.ts` - Tests both 5432 and 5433

---

## 🎯 Recommendation: Standardize on Port 5432

### **Why Port 5432?**

1. **Industry Standard** - Default PostgreSQL port, universally expected
2. **Provisioning Scripts** - All VM setup scripts expect 5432
3. **Documentation** - All examples and guides use 5432
4. **Default Fallbacks** - All code defaults to 5432 when env var missing
5. **Test Environment** - `.env.test` now uses 5432
6. **Simplicity** - No need to remember non-standard port

### **Why NOT Port 5433?**

- No technical advantage (not more secure, not avoiding conflicts)
- Causes confusion (violates principle of least surprise)
- Requires remembering non-standard port in all configs
- Provisioning scripts would need updates

---

## ✅ Action Plan: Migrate to Port 5432

### **On the VM (marcus-test-vm):**

```bash
# 1. Check current PostgreSQL port
sudo -u postgres psql -tAc "SHOW port;"

# 2. If it shows 5433, change to 5432
sudo -u postgres psql -c "ALTER SYSTEM SET port = 5432;"
sudo systemctl restart postgresql

# 3. Verify change
sudo -u postgres psql -tAc "SHOW port;"
# Should show: 5432

# 4. Update firewall if needed
sudo ufw allow 5432/tcp
sudo ufw delete allow 5433/tcp  # Remove old rule if exists
```

---

### **Update Application .env Files:**

**.env (on VM):**
```bash
# Database (PostgreSQL on standard port)
DATABASE_HOST=localhost
DATABASE_PORT=5432  # ← Changed from 5433
DATABASE_NAME=marcus_test
DATABASE_USER=marcus
DATABASE_PASSWORD=IWRdNzwzMtOcUosr79rrWL7fPr7ZsoQ6
```

**.env.test (already correct):**
```bash
DATABASE_PORT=5432
DB_PORT=5432
```

---

### **Files That Need Updates:**

**Hardcoded Port 5432 (Already Correct - No Changes Needed):**
- ✅ `src/platform/evaluation/citationBenchmarks.ts`
- ✅ `src/platform/integration/citationAgentIntegration.ts`
- ✅ All test files (use env var with 5432 default)

**Documentation to Update:**
- [ ] `DEPLOYMENT_NOTE.md` - Change "5433" to "5432"
- [ ] `PHASE_1_COMPLETE.md` - Update port references
- [ ] `PHASE_2_SECURITY_INSTRUCTIONS.md` - Update port references
- [ ] `SESSION_SUMMARY.md` - Update port references

---

## 🧪 Verification Steps

After changing PostgreSQL to port 5432:

```bash
# 1. Verify PostgreSQL is on 5432
sudo -u postgres psql -tAc "SHOW port;"

# 2. Test database connection
psql -h localhost -p 5432 -U marcus -d marcus_test -c "SELECT version();"

# 3. Restart platform
sudo systemctl restart marcus-platform

# 4. Verify agents connect successfully
# Check logs for: "Agent agent_000 connected to PostgreSQL"

# 5. Run tests
cd ~/ai_game_theory_simulation
npm test

# All tests should use 5432 from .env.test
```

---

## 📊 Summary

**Current Inconsistency:**
- Provisioning scripts → 5432
- VM PostgreSQL → 5433 (current)
- Code defaults → 5432
- Test env → 5432
- Documentation → Mixed

**After Fix:**
- Provisioning scripts → 5432 ✅
- VM PostgreSQL → 5432 ✅
- Code defaults → 5432 ✅
- Test env → 5432 ✅
- Documentation → 5432 ✅

**Result:** Everything standardized on 5432 (industry standard)

---

## ⚠️ Breaking Change Notice

**If you change PostgreSQL port from 5433 to 5432:**

1. **Platform will stop working** until you update .env
2. **All active connections will be terminated**
3. **Any hardcoded scripts referencing 5433 will fail**

**Migration Steps:**
1. Stop platform
2. Change PostgreSQL port to 5432
3. Update .env file (DATABASE_PORT=5432)
4. Restart PostgreSQL
5. Restart platform
6. Verify agents connect

**Estimated Downtime:** ~2 minutes

---

## 🎯 Decision

**Should we standardize on port 5432?**

**✅ YES** - Recommended
- Aligns with industry standard
- Matches all provisioning scripts
- Simplifies configuration
- Already what .env.test uses

**❌ NO** - Keep 5433
- Requires updating all provisioning scripts
- Need to remember non-standard port
- No technical benefit

---

**Next Step:** Confirm you want to proceed with migration to port 5432, and I'll create the migration script.
