# Quinn Monitor Issue Analysis - Nov 27, 2025

## Problem Statement
quinn-monitor.sh crashes when attempting to respond to DMs from Liz

## Root Cause Analysis

**Primary Issue:** MATRIX_TOKEN_QUINN not configured
- Script tries to spawn Claude Code to respond
- Claude Code attempts to use Matrix MCP tools
- MCP tools require MATRIX_TOKEN_QUINN environment variable
- Variable not set → crash

**Secondary Issue (script design):**
- Monitor script currently uses `MATRIX_TOKEN_ORCHESTRATOR` to *read* messages (lines 69, 102, 197, 240)
- But spawned Claude Code tries to use Quinn's token to *write* responses
- This mixed-token approach works for reading (using orchestrator creds) but fails when Quinn tries to respond

## Crash Pattern
1. ✅ Monitor detects DM from Liz (using orchestrator token)
2. ✅ Creates response task file
3. ✅ Spawns Claude Code as Quinn
4. ❌ Claude Code tries to use Matrix MCP (requires MATRIX_TOKEN_QUINN)
5. ❌ Token not found → crash
6. ✅ Creates empty log file
7. ❌ Monitor stops

## Infrastructure Status

**What's Ready:**
- ✅ MCP config: `.claude/agents/mcp-configs/quinn.json`
- ✅ Matrix server: quinn registered in BOT_TOKENS dict
- ✅ Registration script: `/Users/annhoward/src/superalignment-chatroom/scripts/register-quinn-bot.sh`
- ✅ Setup automation: `./scripts/setup-quinn-matrix.sh`

**What's Missing:**
- ❌ MATRIX_TOKEN_QUINN environment variable
- ❌ Token value (needs registration)

## Fix Required

**Step 1: Register Quinn bot and get token**
```bash
# Automated (recommended)
./scripts/setup-quinn-matrix.sh

# Manual
cd /Users/annhoward/src/superalignment-chatroom
./scripts/register-quinn-bot.sh
# Script outputs: MATRIX_TOKEN_QUINN="syt_..."
```

**Step 2: Add token to environment**
```bash
# Add to ~/.superalignment-env
echo 'MATRIX_TOKEN_QUINN="syt_..."' >> ~/.superalignment-env
source ~/.superalignment-env
```

**Step 3: Verify**
```bash
# Check token is set
echo $MATRIX_TOKEN_QUINN

# Test Matrix connection (once token set)
./scripts/test-quinn-dm.sh
```

## Script Architecture (for future reference)

The current design uses **dual credentials**:
- **Orchestrator token** to monitor/read messages (polling, event detection)
- **Quinn token** to send responses (via spawned Claude Code)

**Why this works:**
- Orchestrator has permissions on all channels (can monitor)
- Quinn needs own token to send as @agent-quinn (identity)
- Separation prevents Claude Code from needing orchestrator creds

**Once fixed:**
- Monitor continues using orchestrator to poll
- Spawned Claude Code uses quinn token to respond
- Quinn's Matrix identity is preserved

## Impact Summary

**Currently Broken:**
- ❌ Automated DM responses
- ❌ Proactive status messaging to Liz
- ❌ quinn-monitor.sh daemon

**Still Working:**
- ✅ Manual Quinn invocation (via Claude Code CLI)
- ✅ Dashboard updates (filesystem, no Matrix needed)
- ✅ VM workers (autonomous, unaffected)
- ✅ Build/tests (passing)

## Next Steps

1. **Immediate:** Liz runs `./scripts/setup-quinn-matrix.sh`
2. **Verification:** Test with `./scripts/test-quinn-dm.sh`
3. **Deployment:** Restart quinn-monitor.sh on VM
4. **Validation:** Send test DM to Quinn, verify response

## Status
- **Created:** Nov 27, 2025 10:35 UTC
- **Severity:** MEDIUM (blocks automation, manual workaround exists)
- **Owner:** Liz (requires human action - token registration)
- **ETA:** <5 minutes once setup script runs
