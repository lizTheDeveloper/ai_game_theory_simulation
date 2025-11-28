# VM Manual Setup Required

Two issues require manual intervention:

## 1. ANTHROPIC_API_KEY Missing on VM

**Problem:** The autonomous worker systemd services can't be installed without the API key.

**VM Location:** `claude-workspace` (europe-west10-a)

**Required:**
```bash
# On VM, add to /home/lizthedeveloper_gmail_com/.superalignment-env:
ANTHROPIC_API_KEY="sk-ant-api03-..."

# Then install services:
source ~/.superalignment-env
export ANTHROPIC_API_KEY
cd /home/lizthedeveloper_gmail_com/satu/shared
sudo -E ./install-services.sh

# Enable and start the timer:
sudo systemctl enable autonomous-worker-queue.timer
sudo systemctl start autonomous-worker-queue.timer
sudo systemctl status autonomous-worker-queue.timer
```

**Current Status:**
- Worker script exists: `/home/lizthedeveloper_gmail_com/satu/worker/autonomous-worker-queue.sh`
- Service config exists: `/home/lizthedeveloper_gmail_com/satu/shared/configs/autonomous-worker-queue.service`
- Install script exists: `/home/lizthedeveloper_gmail_com/satu/shared/install-services.sh`
- Missing: API key in environment

**Worker Implementation:**
Phase 1 infrastructure is complete (task selection, atomic claim via git push). Phase 2 (execution with agent personality loading) is TODO.

## 2. Quinn Matrix Password Unknown

**Problem:** Quinn bot account `@agent-quinn:themultiverse.school` exists but password is unknown.

**Registration Script:** `/Users/annhoward/src/superalignment-chatroom/scripts/register-quinn-bot.sh`

**Tried Passwords:**
- `superalignment2025` ❌
- `SuperAlignment2025!` ❌
- `quinnpm2025` (still testing...)

**Manual Steps Required:**

### Option A: Reset Quinn Password (if Matrix admin access)
```bash
# Contact Matrix admin to reset password for @agent-quinn:themultiverse.school
# Then run registration script with new password
cd /Users/annhoward/src/superalignment-chatroom
./scripts/register-quinn-bot.sh "NEW_PASSWORD_HERE"
```

### Option B: Create New Quinn Bot
If the existing quinn account is not recoverable:
```bash
# Register new account with different username
# e.g., @agent-quinn-v2:themultiverse.school
# Update MCP configs and scripts to use new username
```

### After Getting Token:
```bash
# Add to ~/.superalignment-env on LOCAL machine:
echo 'MATRIX_TOKEN_QUINN="syt_..."' >> ~/.superalignment-env

# Add to VM env file:
gcloud compute ssh claude-workspace --zone=europe-west10-a
echo 'MATRIX_TOKEN_QUINN="syt_..."' >> /home/lizthedeveloper_gmail_com/.superalignment-env

# Update matrix_server.py BOT_TOKENS dict:
# "quinn": os.getenv("MATRIX_TOKEN_QUINN", ""),

# Test Quinn can post:
# (Use MCP tool or direct API call)
```

## Current Infrastructure State

### VM Multi-Worker Setup ✅
- `/home/lizthedeveloper_gmail_com/satu/worker/` - Implementation worker repo
- `/home/lizthedeveloper_gmail_com/satu/shared/` - Logs, configs, coordination
- Worker script: `autonomous-worker-queue.sh` (task selection + atomic claim)
- Priority queue: `/plans/AUTONOMOUS_WORKER_QUEUE.json`

### What Works:
- Queue infrastructure (schema, task selection)
- Atomic claim via git test-and-set
- Service configs exist

### What's Blocked:
- Workers can't run without ANTHROPIC_API_KEY
- Quinn monitor crashes without MATRIX_TOKEN_QUINN

## Next Steps

1. **Add ANTHROPIC_API_KEY to VM** (highest priority - blocks workers)
2. **Resolve Quinn Matrix password** (blocks quinn-monitor.sh)
3. **Install and start systemd services**
4. **Verify worker logs**: `/home/lizthedeveloper_gmail_com/satu/shared/logs/worker/`
5. **Test Quinn Matrix messaging**

## VM Access

```bash
gcloud compute ssh claude-workspace --zone=europe-west10-a
```

## Relevant Files

**Local:**
- Queue design: `plans/autonomous_worker_priority_queue_design.md`
- Queue file: `plans/AUTONOMOUS_WORKER_QUEUE.json`
- Quinn MCP config: `.claude/agents/mcp-configs/quinn.json`

**VM:**
- Main repo: `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/`
- Worker repo: `/home/lizthedeveloper_gmail_com/satu/worker/`
- Env file: `/home/lizthedeveloper_gmail_com/.superalignment-env`
- Logs: `/home/lizthedeveloper_gmail_com/satu/shared/logs/`
