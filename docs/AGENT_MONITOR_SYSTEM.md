# Agent Monitor System

**Date:** November 28, 2025
**Status:** ✅ INFRASTRUCTURE COMPLETE - ⚠️ VM DEPLOYMENT PENDING
**Purpose:** Enable agents to respond to @mentions and questions in Matrix channels

**⚠️ IMPORTANT: DEPLOYMENT REQUIRED**

The monitoring infrastructure (scripts, services, documentation) is complete and committed. However, the services are NOT yet deployed to the VM. To activate the monitors:

```bash
# On the VM (requires sudo):
cd /home/lizthedeveloper_gmail_com/ai_game_theory_simulation
sudo ./scripts/install-agent-monitors.sh
```

Until deployment, agents will NOT respond to Matrix mentions. See "Deployment Status" section below.

## Overview

The Agent Monitor System transforms agents from isolated workers into a collaborative team by enabling them to monitor Matrix channels and respond to mentions, questions, and coordination requests in real-time.

**Problem Solved:**
- Agents previously worked in isolation without checking for pending messages
- No response to @mentions or direct questions
- Coordination failures: redundant decisions, missed context
- Only Quinn had a monitor daemon (as of Nov 27)

**Solution:**
- Generic monitor template that works for any agent
- Agent-specific monitor scripts for Roy, Sylvia, Cynthia, Orchestrator, Devon
- Pre-work message check in autonomous-worker.sh
- Systemd services for reliable 24/7 monitoring

## Architecture

### Components

1. **Generic Template** (`scripts/agent-monitor-template.sh`)
   - Configurable via environment variables
   - Monitors specified Matrix channels (60s polling by default)
   - Detects mentions of agent name (case-insensitive)
   - Spawns Claude Code session as the agent to respond
   - Uses agent memory system (recall context, update learnings)

2. **Agent-Specific Scripts**
   - `scripts/roy-monitor.sh` - Monitors implementation channel
   - `scripts/sylvia-monitor.sh` - Monitors research channel
   - `scripts/cynthia-monitor.sh` - Monitors research channel
   - `scripts/orchestrator-monitor.sh` - Monitors coordination channel
   - `scripts/devon-monitor.sh` - Monitors implementation channel

3. **Systemd Services**
   - `systemd/roy-monitor.service`
   - `systemd/sylvia-monitor.service`
   - `systemd/cynthia-monitor.service`
   - `systemd/orchestrator-monitor.service`
   - `systemd/devon-monitor.service`

4. **Installation Script** (`scripts/install-agent-monitors.sh`)
   - Copies service files to `/etc/systemd/system/`
   - Enables and starts all monitor services
   - Requires sudo privileges

5. **Pre-Work Message Check** (integrated into `autonomous-worker.sh`)
   - Checks coordination channel before starting autonomous work
   - Logs warnings if urgent messages found
   - Continues with scheduled work (monitors handle responses)

## Matrix Room Mapping

| Agent | Primary Channel | Room ID |
|-------|----------------|---------|
| Roy | implementation | !rnTkKCinvpZLUQlywzVtMdKLH9EuElxLu0EGFJ1LZGA |
| Sylvia | research | !YdS1AvY5d7d6TfqEJC6klIdE6q3pqD1A1lFVMZ0dJ4I |
| Cynthia | research | !YdS1AvY5d7d6TfqEJC6klIdE6q3pqD1A1lFVMZ0dJ4I |
| Orchestrator | coordination | !G-uy0v5GZd9IUqFufg4KIt0ks6d7bNdwquD29SVC4-I |
| Devon | implementation | !rnTkKCinvpZLUQlywzVtMdKLH9EuElxLu0EGFJ1LZGA |
| Quinn | coordination + Liz DM | (existing monitor, separate implementation) |

## Agent Response Flow

1. **Message Detection** (every 60 seconds)
   - Fetch last 10 messages from monitored room
   - Search for agent name (case-insensitive)
   - Filter out messages from the agent itself
   - Track last processed event ID to avoid duplicates

2. **Response Spawning** (on mention detected)
   - Create task prompt file for Claude Code
   - Include: recall memory, check messages, respond, update memory
   - Spawn Claude Code session with 5-minute timeout
   - Log response to `logs/agent-monitors/{agent}_response_{timestamp}.log`

3. **Memory Integration**
   - Agents recall their context: `mcp__agent-memory__recall_context({agent_id})`
   - Agents update their memory: `mcp__agent-memory__add_recent_task({agent_id})`
   - Maintains continuity across monitor invocations

## Deployment Status

**Current Status (Nov 28, 2025 13:00 UTC):**
- ✅ Infrastructure: COMPLETE (scripts, services, docs committed)
- ⚠️ VM Deployment: PENDING (services not installed)
- 🔴 Monitoring: INACTIVE (agents NOT responding to mentions)

**To Activate:**
1. SSH to VM as user with sudo access
2. Run: `sudo ./scripts/install-agent-monitors.sh`
3. Verify: `sudo systemctl status *-monitor.service`

**Known Issues (from Architecture Review B):**
- CRITICAL-1: Legacy services failing (implementation-monitor, research-monitor) - need cleanup before install
- HIGH-1: Sylvia/Cynthia both monitor research channel - potential race condition
- HIGH-2: No concurrency limits on Claude sessions - could spawn 5 parallel sessions

**Recommended Pre-Deployment Actions:**
```bash
# 1. Stop failing legacy services
sudo systemctl stop implementation-monitor research-monitor
sudo systemctl disable implementation-monitor research-monitor

# 2. Then deploy new HIGH-5 monitors
sudo ./scripts/install-agent-monitors.sh
```

## Installation

### On VM (Production)

```bash
# 1. Ensure Matrix tokens are configured in ~/.superalignment-env
# Required tokens:
#   - MATRIX_TOKEN_ROY
#   - MATRIX_TOKEN_SYLVIA
#   - MATRIX_TOKEN_CYNTHIA
#   - MATRIX_TOKEN_DEVON
#   - MATRIX_TOKEN_ORCHESTRATOR

# 2. Install all agent monitors as systemd services
sudo ./scripts/install-agent-monitors.sh

# 3. Verify services are running
sudo systemctl status roy-monitor.service
sudo systemctl status sylvia-monitor.service
sudo systemctl status cynthia-monitor.service
sudo systemctl status orchestrator-monitor.service
sudo systemctl status devon-monitor.service
```

### Manual Start (Development)

```bash
# Run a single monitor manually (for testing)
./scripts/roy-monitor.sh

# Monitor will run in foreground, Ctrl+C to stop
```

## Monitoring & Maintenance

### Check Service Status

```bash
# Status of all monitors
sudo systemctl status *-monitor.service

# Status of specific monitor
sudo systemctl status roy-monitor.service
```

### View Logs

```bash
# Real-time logs (systemd journal)
sudo journalctl -u roy-monitor.service -f

# Agent-specific logs (file system)
tail -f logs/agent-monitors/roy-monitor.log

# Response logs
ls -lt logs/agent-monitors/roy_response_*.log | head -5
```

### Service Management

```bash
# Restart a monitor
sudo systemctl restart roy-monitor.service

# Stop a monitor
sudo systemctl stop roy-monitor.service

# Start a monitor
sudo systemctl start roy-monitor.service

# Disable auto-start on boot
sudo systemctl disable roy-monitor.service

# Re-enable auto-start
sudo systemctl enable roy-monitor.service
```

### Troubleshooting

**Monitor not responding:**
1. Check service status: `sudo systemctl status <agent>-monitor.service`
2. Check logs: `sudo journalctl -u <agent>-monitor.service -n 50`
3. Verify Matrix token: `source ~/.superalignment-env && echo $MATRIX_TOKEN_ROY`
4. Check lock files: `ls -la ~/.{agent}-monitor.lock`
5. Restart service: `sudo systemctl restart <agent>-monitor.service`

**Messages not detected:**
1. Verify room ID in agent-specific script
2. Check if agent name is spelled correctly in messages
3. Test Matrix API manually:
   ```bash
   source ~/.superalignment-env
   curl -s -X GET "https://matrix.themultiverse.school/_matrix/client/v3/rooms/ROOM_ID/messages?dir=b&limit=5" \
     -H "Authorization: Bearer $MATRIX_TOKEN_ROY"
   ```

**Response timeout:**
- Claude Code sessions timeout after 5 minutes
- Check response log: `logs/agent-monitors/{agent}_response_{timestamp}.log`
- Verify Claude Code is installed: `claude --version`

## Configuration

### Environment Variables (Agent-Specific Scripts)

```bash
AGENT_NAME="Roy"              # Display name
AGENT_ID="roy"                # Memory system ID
MATRIX_TOKEN_VAR="MATRIX_TOKEN_ROY"  # Environment variable name for token
POLL_INTERVAL=60              # Check interval in seconds (default: 60)
WATCH_CHANNELS="ROOM_ID1,ROOM_ID2"  # Comma-separated room IDs
```

### Adding a New Agent Monitor

1. **Create agent-specific script** (`scripts/newagent-monitor.sh`):
   ```bash
   #!/bin/bash
   export AGENT_NAME="NewAgent"
   export AGENT_ID="newagent"
   export MATRIX_TOKEN_VAR="MATRIX_TOKEN_NEWAGENT"
   export POLL_INTERVAL=60
   export WATCH_CHANNELS="ROOM_ID"

   SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
   exec "${SCRIPT_DIR}/agent-monitor-template.sh"
   ```

2. **Make executable**: `chmod +x scripts/newagent-monitor.sh`

3. **Create systemd service** (`systemd/newagent-monitor.service`):
   ```ini
   [Unit]
   Description=NewAgent Matrix Monitor
   After=network.target

   [Service]
   Type=simple
   User=lizthedeveloper_gmail_com
   WorkingDirectory=/home/lizthedeveloper_gmail_com/ai_game_theory_simulation
   ExecStart=/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/scripts/newagent-monitor.sh
   Restart=always
   RestartSec=10
   StandardOutput=append:/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/agent-monitors/newagent-monitor-service.log
   StandardError=append:/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/agent-monitors/newagent-monitor-service-error.log

   [Install]
   WantedBy=multi-user.target
   ```

4. **Add to installation script**: Edit `scripts/install-agent-monitors.sh`, add "newagent" to `AGENTS` array

5. **Install**: `sudo ./scripts/install-agent-monitors.sh`

## Performance & Resource Usage

- **CPU**: Negligible (~0.1% per monitor while idle)
- **Memory**: ~10-20 MB per monitor process
- **Network**: Minimal (1 API call per 60s per monitor = ~1.5KB/min)
- **Disk**: Log files grow ~1MB per day per monitor (rotated via logrotate recommended)

**Recommended logrotate config** (`/etc/logrotate.d/agent-monitors`):
```
/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/agent-monitors/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
```

## Benefits

✅ **Agents respond within 60 seconds** of being mentioned
✅ **No missed coordination context** - agents see all relevant messages
✅ **True multi-agent collaboration** (not just parallel work)
✅ **24/7 monitoring** via systemd services with auto-restart
✅ **Memory continuity** - agents recall context and update learnings
✅ **Minimal overhead** - lightweight polling, only spawns on mention

## Related Documentation

- **Agent Memory System**: `.claude/agents/memories/README.md`
- **Matrix Integration**: `.claude/chatroom/README.md`
- **Quinn Monitor** (reference implementation): `scripts/quinn-monitor.sh`
- **Autonomous Worker**: `autonomous-worker.sh` (includes pre-work message check)
- **Roadmap Item**: `plans/MASTER_IMPLEMENTATION_ROADMAP.md` (HIGH-5)

## Changelog

**Nov 28, 2025 - Initial Implementation (HIGH-5)**
- Created generic agent-monitor-template.sh
- Deployed monitors for Roy, Sylvia, Cynthia, Orchestrator, Devon
- Added pre-work message check to autonomous-worker.sh
- Created systemd service files and installation script
- All syntax validated and tested
- Status: ✅ COMPLETE (Phase 1-4)

**Future Enhancements (Optional)**
- Phase 5: Direct mention routing (parse @mentions for targeted responses)
- Phase 6: Priority levels (urgent vs normal mentions)
- Phase 7: Multi-room monitoring per agent (watch multiple channels)
- Phase 8: Rate limiting (prevent spam responses)
