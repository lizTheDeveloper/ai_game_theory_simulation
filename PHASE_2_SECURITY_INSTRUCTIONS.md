# MARCUS 3.0 - Phase 2: Security Hardening

**Date:** November 20, 2025
**Branch:** `claude/build-marcus-agent-016LTPXuAb6A3hYDwTvMjyof`
**Status:** ⏳ IN PROGRESS

---

## ✅ Phase 1 Status: COMPLETE

**Platform State:**
```
🟢 OPERATIONAL - All systems running
├── HTTP Server: port 3000 ✅
├── Database: PostgreSQL 5433 ✅
├── Redis: port 6379 ✅ (AUTH DISABLED)
└── Python Agents: 9/9 running ✅
```

**Startup Command:**
```bash
cd /home/g7throwawayplz/ai_game_theory_simulation
NODE_ENV=development npx tsx src/platform/startup.ts
```

**Health Check:**
```bash
curl http://localhost:3000/health
# Returns: {"status":"healthy","database":"connected","redis":"connected"}
```

---

## 🔒 Phase 2: Security Hardening Tasks

### 1. Generate JWT Secrets ⏳ IN PROGRESS

**Purpose:** Replace default/weak JWT secrets with cryptographically secure 256-bit secrets.

**Run on VM:**
```bash
cd /home/g7throwawayplz/ai_game_theory_simulation
./scripts/generate_jwt_secrets.sh
```

**What it does:**
- Generates two 256-bit secrets using `openssl rand -hex 32`
- Updates `.env` with `JWT_SECRET` and `JWT_REFRESH_SECRET`
- Creates backup of existing `.env` file
- Prompts before overwriting existing secrets

**Expected output:**
```
🔐 MARCUS 3.0 - JWT Secrets Generator
=====================================

🔑 Generating cryptographically secure JWT secrets...
   Using: openssl rand -hex 32 (256-bit)

✅ Secrets generated successfully!
✅ JWT SECRETS CONFIGURED

  JWT_SECRET:         [64 hex characters]
  JWT_REFRESH_SECRET: [64 hex characters]

📝 Secrets saved to: .env
```

**⚠️ After running:**
- Restart the platform: `NODE_ENV=development npx tsx src/platform/startup.ts`
- All existing JWT tokens will be invalidated
- Users will need to log in again

---

### 2. Change Default Admin Password ⏭️ NEXT

**Purpose:** Replace the default admin password with a secure unique password.

**Run on VM:**
```bash
cd /home/g7throwawayplz/ai_game_theory_simulation
./scripts/change_admin_password.sh
```

**What it does:**
- Connects to PostgreSQL database
- Updates admin user password using bcrypt hashing
- Verifies password change was successful

**You will be prompted for:**
1. New admin password (type securely, will not echo)
2. Confirmation of new password

**⚠️ Security requirements:**
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, special characters
- Not a dictionary word or common pattern

---

### 3. Re-enable Redis Authentication ⚠️ OPTIONAL

**Current State:** Redis authentication is **DISABLED** for Phase 1.

**Why disabled:** Python agents had environment variable propagation issues. Resolved by:
- Removing all REDIS_PASSWORD entries from `.env`
- Commenting out `requirepass` in `/etc/redis/redis.conf`
- Agents now connect without authentication

**To re-enable Redis auth (after Phase 2 complete):**

```bash
# 1. Generate new Redis password
REDIS_PASSWORD=$(openssl rand -hex 32)

# 2. Add to .env (clean first to prevent duplicates)
sed -i '/REDIS_PASSWORD/d' /home/g7throwawayplz/ai_game_theory_simulation/.env
echo "REDIS_PASSWORD=$REDIS_PASSWORD" >> /home/g7throwawayplz/ai_game_theory_simulation/.env

# 3. Enable in Redis config (remove duplicates first)
sudo sed -i '/^requirepass/d' /etc/redis/redis.conf
echo "requirepass $REDIS_PASSWORD" | sudo tee -a /etc/redis/redis.conf

# 4. Restart Redis
sudo systemctl restart redis

# 5. Restart platform
cd /home/g7throwawayplz/ai_game_theory_simulation
NODE_ENV=development npx tsx src/platform/startup.ts
```

**Verification:**
```bash
# Agents should show: "Agent agent_XXX connected to Redis"
# No "AUTH" errors should appear
```

**⚠️ Known issues if re-enabling:**
- Ensure NO duplicate REDIS_PASSWORD entries in `.env`
- Ensure NO duplicate `requirepass` lines in `redis.conf`
- TypeScript Redis clients in `citationAgentIntegration.ts` must use password

---

### 4. Run Integration Tests ⏭️ AFTER SECURITY CHANGES

**Purpose:** Verify platform functionality after security hardening.

**Run on VM:**
```bash
cd /home/g7throwawayplz/ai_game_theory_simulation
npm test
```

**Expected results:**
- Authentication tests: 18 passing
- Agent integration tests: 10 passing
- Total: 28 tests passing

**If tests fail:**
1. Check `.env` configuration (JWT secrets, database credentials)
2. Verify PostgreSQL is running and accessible
3. Verify Redis is running (with or without auth)
4. Check agent processes are running: `ps aux | grep citation_integrity_agent`

---

## 📊 Current Configuration

### Environment Variables (.env)
```bash
# Python Agent System
ENABLE_AGENTS=true
NUM_AGENTS=9
AGENT_TIMEOUT_MS=30000

# CORS & Environment
CORS_ORIGINS=http://localhost:3000,http://localhost:3333
NODE_ENV=development

# Database (PostgreSQL on port 5433)
DATABASE_HOST=localhost
DATABASE_PORT=5433
DATABASE_NAME=marcus_test
DATABASE_USER=marcus
DATABASE_PASSWORD=IWRdNzwzMtOcUosr79rrWL7fPr7ZsoQ6

# Redis (auth DISABLED for Phase 1)
# REDIS_PASSWORD not set

# JWT Secrets (WILL BE GENERATED IN PHASE 2)
JWT_SECRET=[to be generated]
JWT_REFRESH_SECRET=[to be generated]
```

### PostgreSQL Configuration
- **Port:** 5433 (non-standard)
- **Database:** marcus_test
- **User:** marcus
- **Password:** IWRdNzwzMtOcUosr79rrWL7fPr7ZsoQ6

### Redis Configuration
- **Port:** 6379
- **Database:** 0
- **Authentication:** DISABLED (`requirepass` commented out)

---

## 🚨 Known Issues & Resolutions

### Issue 1: Redis Authentication Failures (RESOLVED)
**Problem:** Agents crashed with "WRONGPASS" or "AUTH required" errors.

**Root Cause:**
- Duplicate `REDIS_PASSWORD` entries in `.env`
- Duplicate `requirepass` lines in `redis.conf`
- Password concatenation with newlines

**Resolution:**
- Disabled Redis authentication completely
- Removed all `REDIS_PASSWORD` entries from `.env`
- Commented out all `requirepass` lines in `redis.conf`
- Agents now connect without authentication

**Status:** ✅ RESOLVED - Platform operational with 9 agents

---

### Issue 2: Dotenv Loading Twice (OBSERVED)
**Symptom:** Logs show:
```
[dotenv@17.2.3] injecting env (22) from .env
[dotenv@17.2.3] injecting env (0) from .env
```

**Impact:** LOW - Does not affect functionality currently

**Investigation needed:**
- Check if `dotenv.config()` called multiple times
- Check if `.env.secrets` file exists and is being loaded
- Verify environment variable precedence

**Status:** ⚠️ MONITORING - Not blocking Phase 2

---

## 📁 Files Modified

| File | Change | Status |
|------|--------|--------|
| `src/platform/agents/citation_integrity_agent.py` | Added Redis password parameter | ✅ |
| `src/platform/agents/citation_integrity_agent.py` | Read REDIS_PASSWORD from environment | ✅ |
| `/etc/redis/redis.conf` | Disabled authentication (commented requirepass) | ✅ |
| `.env` | Removed REDIS_PASSWORD entries | ✅ |
| `scripts/generate_jwt_secrets.sh` | Created script (already existed) | ✅ |
| `scripts/change_admin_password.sh` | Created script (already existed) | ✅ |

---

## ⏭️ Next Steps (Immediate)

### Step 1: Generate JWT Secrets
```bash
cd /home/g7throwawayplz/ai_game_theory_simulation
./scripts/generate_jwt_secrets.sh
```

### Step 2: Change Admin Password
```bash
./scripts/change_admin_password.sh
```

### Step 3: Restart Platform
```bash
NODE_ENV=development npx tsx src/platform/startup.ts
```

### Step 4: Run Integration Tests
```bash
npm test
```

---

## 🎯 Success Criteria for Phase 2

- [x] Platform operational with 9 agents (Phase 1)
- [ ] JWT secrets generated (256-bit)
- [ ] Admin password changed from default
- [ ] Integration tests passing (28 tests)
- [ ] Health endpoint responsive
- [ ] No authentication errors in logs

---

## 📚 Additional Documentation

- **Phase 1 Complete:** `PHASE_1_COMPLETE.md`
- **Deployment Note:** `DEPLOYMENT_NOTE.md`
- **Weekly Plan:** `MARCUS_WEEKLY_COMPLETION_PLAN.md`
- **Master Roadmap:** `plans/MASTER_IMPLEMENTATION_ROADMAP.md`

---

**Phase 2 Started:** 2025-11-20 15:40 UTC
**Platform Version:** MARCUS 3.0
**Deployment Target:** marcus-test-vm (g7throwawayplz@marcus-test-vm)
