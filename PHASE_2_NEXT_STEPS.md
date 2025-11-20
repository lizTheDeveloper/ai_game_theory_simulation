# MARCUS 3.0 - Phase 2: Next Steps for User

**Date:** November 20, 2025
**Session:** claude/build-marcus-agent-016LTPXuAb6A3hYDwTvMjyof
**Status:** ✅ READY FOR USER EXECUTION

---

## 🎉 Phase 1 Complete!

Your MARCUS 3.0 platform is **fully operational** with 9 Python agents running:

```
✅ HTTP Server: http://0.0.0.0:3000
✅ Database: PostgreSQL (marcus_test on port 5433)
✅ Redis: localhost:6379 (auth disabled)
✅ Agents: 9/9 agents initialized and ready
```

**Verified from your terminal output:**
```
[Agent agent_000] ✅ Agent agent_000 initialized and ready for IPC
[Agent agent_001] ✅ Agent agent_001 initialized and ready for IPC
[Agent agent_002] ✅ Agent agent_002 initialized and ready for IPC
...
[Agent agent_008] ✅ Agent agent_008 initialized and ready for IPC
```

---

## 📋 Phase 2 Tasks - What YOU Need to Do on the VM

All scripts are ready and tested. You just need to run them on your VM (`g7throwawayplz@marcus-test-vm`).

### 🔑 Step 1: Generate JWT Secrets (5 minutes)

**SSH into your VM and run:**
```bash
cd /home/g7throwawayplz/ai_game_theory_simulation
./scripts/generate_jwt_secrets.sh
```

**What it does:**
- Generates two 256-bit cryptographically secure secrets
- Updates `.env` with `JWT_SECRET` and `JWT_REFRESH_SECRET`
- Creates backup of existing `.env` file
- Shows you the generated secrets (64 hex characters each)

**Expected output:**
```
✅ JWT SECRETS CONFIGURED

  JWT_SECRET:         [64 hex characters]
  JWT_REFRESH_SECRET: [64 hex characters]

📝 Secrets saved to: .env
```

**⚠️ Important:** All existing JWT tokens will be invalidated. Users will need to log in again.

---

### 🔐 Step 2: Change Admin Password (5 minutes)

**Run:**
```bash
sudo ./scripts/change_admin_password.sh
```

**What it does:**
- Generates a secure 24-character random password
- Hashes it with bcrypt (12 rounds, same as production)
- Updates the `admin@marcus-platform.local` user in PostgreSQL
- Shows you the new credentials

**Expected output:**
```
✅ Admin password updated successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔑 NEW ADMIN CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Email:    admin@marcus-platform.local
  Password: [24 characters]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Credentials also saved to: /tmp/marcus_admin_credentials.txt
```

**⚠️ SAVE THESE CREDENTIALS IMMEDIATELY:**
- Store in a password manager
- Delete `/tmp/marcus_admin_credentials.txt` after saving
- Do not share via unencrypted channels

---

### 🔄 Step 3: Restart Platform (1 minute)

**Stop the current platform (if running in terminal, press Ctrl+C), then restart:**
```bash
cd /home/g7throwawayplz/ai_game_theory_simulation
NODE_ENV=development npx tsx src/platform/startup.ts
```

**Verify all agents start successfully:**
```
✅ Agent agent_000 started (PID: ...)
✅ Agent agent_001 started (PID: ...)
...
✅ Agent agent_008 started (PID: ...)

✅ MARCUS 3.0 Platform OPERATIONAL
```

---

### 🧪 Step 4: Run Integration Tests (5 minutes)

**In a NEW terminal (keep platform running in the first), run:**
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

**If tests fail:**
1. Check `.env` has JWT_SECRET and JWT_REFRESH_SECRET
2. Check PostgreSQL is running: `sudo systemctl status postgresql`
3. Check Redis is running: `sudo systemctl status redis`
4. Check agent processes: `ps aux | grep citation_integrity_agent`

---

### ✅ Step 5: Verify Health Endpoint (1 minute)

**Test the health endpoint:**
```bash
curl http://localhost:3000/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected"
}
```

---

## 📊 Phase 2 Checklist

- [x] **Scripts Ready:** JWT secrets generator (`generate_jwt_secrets.sh`)
- [x] **Scripts Ready:** Admin password changer (`change_admin_password.sh`)
- [x] **Documentation:** Phase 2 instructions (`PHASE_2_SECURITY_INSTRUCTIONS.md`)
- [x] **Platform Verified:** 9 agents running successfully

### **⏳ User Actions Required:**

- [ ] **Run:** `./scripts/generate_jwt_secrets.sh`
- [ ] **Run:** `sudo ./scripts/change_admin_password.sh`
- [ ] **Save:** Admin credentials to password manager
- [ ] **Restart:** Platform with new secrets
- [ ] **Test:** `npm test` (28 tests should pass)
- [ ] **Verify:** Health endpoint returns "healthy"

---

## 🚀 After Phase 2 Complete

### Option A: Set Up Systemd Service (Recommended for Production)

**Create systemd service to run platform on boot:**

1. **Create service file:**
```bash
sudo nano /etc/systemd/system/marcus-platform.service
```

2. **Add this configuration:**
```ini
[Unit]
Description=MARCUS 3.0 Citation Integrity Platform
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=g7throwawayplz
WorkingDirectory=/home/g7throwawayplz/ai_game_theory_simulation
Environment=NODE_ENV=development
ExecStart=/usr/bin/npx tsx src/platform/startup.ts
Restart=always
RestartSec=10
StandardOutput=append:/home/g7throwawayplz/ai_game_theory_simulation/logs/marcus-platform.log
StandardError=append:/home/g7throwawayplz/ai_game_theory_simulation/logs/marcus-platform-error.log

[Install]
WantedBy=multi-user.target
```

3. **Enable and start service:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable marcus-platform
sudo systemctl start marcus-platform
sudo systemctl status marcus-platform
```

4. **Monitor logs:**
```bash
tail -f logs/marcus-platform.log
```

---

### Option B: Continue in Foreground (Development)

**Keep running platform in terminal:**
```bash
cd /home/g7throwawayplz/ai_game_theory_simulation
NODE_ENV=development npx tsx src/platform/startup.ts
```

---

## 📁 Documentation Files Created

| File | Purpose |
|------|---------|
| `PHASE_1_COMPLETE.md` | Phase 1 deployment summary (issues fixed, commits) |
| `PHASE_2_SECURITY_INSTRUCTIONS.md` | Comprehensive Phase 2 guide (all tasks detailed) |
| `PHASE_2_NEXT_STEPS.md` | This file - clear action items for user |
| `DEPLOYMENT_NOTE.md` | Quick reference (updated to Phase 2 status) |

---

## 🐛 Troubleshooting

### Issue: JWT secrets not working after generation
**Solution:**
```bash
# Verify secrets are in .env
grep JWT_SECRET .env

# Should show two lines:
# JWT_SECRET=[64 hex characters]
# JWT_REFRESH_SECRET=[64 hex characters]

# If missing or wrong, regenerate:
./scripts/generate_jwt_secrets.sh
```

---

### Issue: Admin password script fails
**Solution:**
```bash
# Check if admin user exists
sudo -u postgres psql -d marcus_test -c "SELECT email, role FROM users WHERE email LIKE '%admin%';"

# If no admin user found, create one first (or check if database is correct)
```

---

### Issue: Tests fail with "database connection error"
**Solution:**
```bash
# Verify PostgreSQL is running
sudo systemctl status postgresql

# Test connection manually
psql -h localhost -p 5433 -U marcus -d marcus_test

# Check .env has correct credentials
grep DATABASE .env
```

---

### Issue: Agents not connecting to Redis
**Solution:**
```bash
# Verify Redis is running WITHOUT authentication
sudo systemctl status redis

# Check Redis config (requirepass should be commented out)
sudo grep "^requirepass" /etc/redis/redis.conf
# Should return nothing (all lines commented)

# Test Redis connection (should work without password)
redis-cli ping
# Should return: PONG
```

---

## 🎯 Success Criteria

Phase 2 is complete when:

- [x] Platform operational with 9 agents
- [ ] JWT secrets generated (256-bit)
- [ ] Admin password changed from default
- [ ] Platform restarted with new secrets
- [ ] Integration tests passing (28 tests)
- [ ] Health endpoint returns "healthy"
- [ ] No errors in platform logs

---

## 📞 Support

If you encounter issues:

1. **Check logs:**
   ```bash
   tail -f logs/marcus-platform.log
   tail -f logs/marcus-platform-error.log
   ```

2. **Review documentation:**
   - `PHASE_2_SECURITY_INSTRUCTIONS.md` - Detailed guide
   - `PHASE_1_COMPLETE.md` - What was fixed in Phase 1

3. **Verify services:**
   ```bash
   sudo systemctl status postgresql
   sudo systemctl status redis
   ps aux | grep citation_integrity_agent
   ```

---

## ⏭️ Phase 3 Preview: Testing & Validation

After Phase 2 complete:

1. **Load Testing** - Test platform under high citation volume
2. **E2E Workflow Test** - Full citation verification pipeline
3. **Performance Benchmarking** - Measure throughput and latency
4. **Security Audit** - Review all endpoints and authentication flows

---

**Phase 2 Preparation Complete:** 2025-11-20 15:40 UTC
**All scripts tested and documented**
**Ready for user execution on marcus-test-vm**

---

**Your next action:** SSH into `marcus-test-vm` and run Step 1 (`./scripts/generate_jwt_secrets.sh`)
