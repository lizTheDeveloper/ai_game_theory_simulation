# Quinn Matrix Bot Setup Guide

**Status:** READY FOR SETUP
**Date:** 2025-11-27
**Agent:** quinn (Technical PM)

## Quick Start

```bash
# Run the automated setup script
./scripts/setup-quinn-matrix.sh
```

The script will:
1. Register Quinn bot on Matrix server
2. Save access token to `~/.superalignment-env`
3. Verify matrix_server.py configuration
4. Test Matrix connection

## Manual Setup (if needed)

### 1. Register Quinn Bot

```bash
cd /Users/annhoward/src/superalignment-chatroom
./scripts/register-quinn-bot.sh
```

You'll need:
- Password for Quinn's bot account
- Matrix registration token (if server requires it)

### 2. Add Token to Environment

Add the token from registration output to `~/.superalignment-env`:

```bash
echo 'MATRIX_TOKEN_QUINN="syt_YWdlbnQtcXVpbm4..."' >> ~/.superalignment-env
source ~/.superalignment-env
```

### 3. Verify matrix_server.py

Check that `matrix-fastmcp-server/src/matrix_server.py` includes:

```python
BOT_TOKENS = {
    # ... other agents ...
    "quinn": os.getenv("MATRIX_TOKEN_QUINN", ""),
}
```

**Status:** ✅ Already added (2025-11-27)

### 4. Verify MCP Config

Check `.claude/agents/mcp-configs/quinn.json` exists with:

```json
{
  "mcpServers": {
    "matrix": {
      "command": "/Users/annhoward/src/superalignment-chatroom/matrix-fastmcp-server/run.sh",
      "args": [],
      "env": {
        "MATRIX_AGENT_NAME": "quinn"
      }
    }
  }
}
```

**Status:** ✅ Already exists (2025-11-27)

### 5. Test Connection

```bash
# Source environment
source ~/.superalignment-env

# Spawn Quinn
claude --agent quinn

# Quinn should auto-check Matrix notifications on spawn
```

## Quinn's Matrix Identity

- **Matrix ID:** `@agent-quinn:themultiverse.school`
- **Agent Name:** `quinn`
- **Role:** Technical Product Manager
- **Primary Channels:**
  - `coordination` - All agents (cross-team updates)
  - `implementation` - Track worker output
  - `roadmap` - Priority coordination

## Receiving DMs

Once setup is complete, Liz can DM Quinn at:
- **Matrix ID:** `@agent-quinn:themultiverse.school`
- **From:** `@lizthedeveloper:themultiverse.school`

Quinn should proactively check DMs and respond to queries about system status.

## Troubleshooting

### Token not loading

```bash
# Check environment file
grep QUINN ~/.superalignment-env

# Re-source
source ~/.superalignment-env

# Verify in Python
python3 -c "import os; from dotenv import load_dotenv; from pathlib import Path; load_dotenv(Path.home() / '.superalignment-env'); print(os.getenv('MATRIX_TOKEN_QUINN', 'NOT FOUND'))"
```

### Can't receive DMs

1. Verify Quinn is registered: Try logging in via Matrix client
2. Check room membership: Quinn needs to be invited to DM room
3. Test with Matrix tools: Use `matrix_post_message` from another agent

### MCP server not starting

```bash
# Check run.sh exists
ls -la /Users/annhoward/src/superalignment-chatroom/matrix-fastmcp-server/run.sh

# Test manually
cd /Users/annhoward/src/superalignment-chatroom/matrix-fastmcp-server
MATRIX_AGENT_NAME=quinn ./run.sh
```

## Files Created/Modified

**New files:**
- `scripts/setup-quinn-matrix.sh` - Automated setup script
- `/Users/annhoward/src/superalignment-chatroom/scripts/register-quinn-bot.sh` - Bot registration
- `docs/QUINN_MATRIX_SETUP.md` - This file

**Modified files:**
- `/Users/annhoward/src/superalignment-chatroom/matrix-fastmcp-server/src/matrix_server.py` - Added quinn to BOT_TOKENS

**Existing files (already created):**
- `.claude/agents/quinn.md` - Agent definition
- `.claude/agents/mcp-configs/quinn.json` - MCP configuration
- `scripts/quinn-monitor.sh` - Monitoring script

## Next Steps After Setup

1. **Invite Quinn to channels:**
   ```bash
   # From Matrix client, invite @agent-quinn:themultiverse.school to:
   # - coordination
   # - implementation
   # - roadmap
   ```

2. **Test DM functionality:**
   ```bash
   # From @lizthedeveloper:themultiverse.school
   # Send DM to @agent-quinn:themultiverse.school
   # "What's the current build status?"
   ```

3. **Set up autonomous monitoring (optional):**
   ```bash
   # Add to crontab for hourly checks
   0 * * * * cd /Users/annhoward/src/superalignmenttoutopia && ./scripts/quinn-monitor.sh
   ```

## Related Documentation

- `.claude/agents/quinn.md` - Quinn agent definition
- `pm/QUINN_QUICK_REFERENCE.md` - Quinn capabilities reference
- `pm/DASHBOARD.md` - Status dashboard Quinn maintains
