# Quinn Matrix Bot Setup

## Status: INFRASTRUCTURE READY - Needs Token Registration

**Last updated:** 2025-11-27 by Devon

All infrastructure is in place. User just needs to run the setup script to register Quinn and get the Matrix token.

## What's Ready

✅ **Step 1: MCP Config** - Created at `.claude/agents/mcp-configs/quinn.json`
✅ **Step 2: Matrix Server** - Updated with quinn in BOT_TOKENS dict
✅ **Step 3: Registration Script** - Created at `/Users/annhoward/src/superalignment-chatroom/scripts/register-quinn-bot.sh`
✅ **Step 4: Setup Automation** - Created `./scripts/setup-quinn-matrix.sh`

## Quick Setup (Run This)

```bash
# Automated setup - handles registration and env config
./scripts/setup-quinn-matrix.sh
```

Or manually:

```bash
# 1. Register Quinn bot
cd /Users/annhoward/src/superalignment-chatroom
./scripts/register-quinn-bot.sh

# 2. Add token to environment (from script output)
echo 'MATRIX_TOKEN_QUINN="syt_..."' >> ~/.superalignment-env
source ~/.superalignment-env

# 3. Verify setup
cd /Users/annhoward/src/superalignmenttoutopia
./scripts/verify-quinn-matrix.sh

# 4. Test connection
./scripts/test-quinn-dm.sh
```

## Quinn's Matrix Identity

- **Matrix ID**: `@agent-quinn:themultiverse.school`
- **Agent Name**: `quinn`
- **Role**: Technical Product Manager
- **Primary Channels**: coordination, implementation, roadmap

## Note

Previous parker setup files exist but should be replaced with quinn versions.
