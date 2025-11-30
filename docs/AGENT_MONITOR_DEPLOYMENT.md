# Agent Monitor Deployment Guide

## Overview

Agent monitors enable proactive message checking so agents don't work in isolation. Prevents coordination failures, missed context, and redundant decisions.

## Architecture

**Components:**
- `scripts/agent-monitor-template.sh` - Generic monitor daemon (matrix polling loop)
- `scripts/{agent}-monitor.sh` - Agent-specific wrappers (set env vars, call template)
- `systemd/*.service` - Systemd service definitions (auto-restart, logging)
- `scripts/check-pending-messages.sh` - Pre-work message check for autonomous workers

**How it works:**
1. Monitor daemon polls Matrix every 60s for @mentions
2. When mentioned, spawns Claude Code session as that agent
3. Agent recalls memory, reads message, responds, updates memory
4. Autonomous workers check for pending messages before starting queue tasks

## Deployed Monitors

**Already deployed (Nov 27-28, 2025):**
- Quinn (`quinn-monitor.sh`) - Full custom implementation (not template-based)

**Stubbed (need template to work):**
- Roy (`roy-monitor.sh`) - Implementation channel
- Sylvia (`sylvia-monitor.sh`) - Research channel
- Devon (`devon-monitor.sh`) - Implementation channel
- Cynthia (`cynthia-monitor.sh`) - Research channel
- Orchestrator (`orchestrator-monitor.sh`) - Coordination channel

**Services created but not enabled:**
```
systemd/roy-monitor.service
systemd/sylvia-monitor.service
systemd/devon-monitor.service
systemd/cynthia-monitor.service
systemd/orchestrator-monitor.service
```

## Local Testing

Test a monitor locally before VM deployment:

```bash
# Test Devon monitor (example)
cd /home/lizthedeveloper_gmail_com/ai_game_theory_simulation
./scripts/devon-monitor.sh
```

**Expected behavior:**
- Starts monitoring loop
- Logs to `logs/agent-monitors/devon-monitor.log`
- Polls every 60s
- Ctrl+C to stop

## VM Deployment

**Prerequisites:**
- Matrix tokens in `~/.superalignment-env`:
  - `MATRIX_TOKEN_ROY`
  - `MATRIX_TOKEN_SYLVIA`
  - `MATRIX_TOKEN_DEVON`
  - `MATRIX_TOKEN_CYNTHIA`
  - `MATRIX_TOKEN_ORCHESTRATOR`
- Agent MCP configs in `.claude/agents/mcp-configs/{agent}.json`

**Deploy monitors to VM:**

```bash
# 1. Copy service files to systemd directory
sudo cp systemd/roy-monitor.service /etc/systemd/system/
sudo cp systemd/sylvia-monitor.service /etc/systemd/system/
sudo cp systemd/devon-monitor.service /etc/systemd/system/
sudo cp systemd/cynthia-monitor.service /etc/systemd/system/
sudo cp systemd/orchestrator-monitor.service /etc/systemd/system/

# 2. Create log directory
mkdir -p /home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/agent-monitors

# 3. Reload systemd
sudo systemctl daemon-reload

# 4. Enable and start services
sudo systemctl enable roy-monitor.service
sudo systemctl enable sylvia-monitor.service
sudo systemctl enable devon-monitor.service
sudo systemctl enable cynthia-monitor.service
sudo systemctl enable orchestrator-monitor.service

sudo systemctl start roy-monitor.service
sudo systemctl start sylvia-monitor.service
sudo systemctl start devon-monitor.service
sudo systemctl start cynthia-monitor.service
sudo systemctl start orchestrator-monitor.service

# 5. Verify status
sudo systemctl status roy-monitor.service
sudo systemctl status sylvia-monitor.service
sudo systemctl status devon-monitor.service
sudo systemctl status cynthia-monitor.service
sudo systemctl status orchestrator-monitor.service
```

**Monitor logs:**
```bash
# Service logs
sudo journalctl -u roy-monitor.service -f

# Agent response logs
tail -f /home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/agent-monitors/roy-monitor.log
tail -f /home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/agent-monitors/roy_response_*.log
```

## Adding New Monitors

**1. Create agent wrapper script:**

```bash
#!/bin/bash
# {Agent} Monitor
# Monitors {channel} for {description}

export AGENT_NAME="{DisplayName}"
export AGENT_ID="{agent_id}"
export MATRIX_TOKEN_VAR="MATRIX_TOKEN_{AGENT}"
export POLL_INTERVAL=60

# Watch channels (space-separated room IDs)
export WATCH_CHANNELS="{ROOM_ID_1} {ROOM_ID_2}"

# Execute the generic monitor template
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "${SCRIPT_DIR}/agent-monitor-template.sh"
```

**2. Create systemd service:**

```ini
[Unit]
Description={Agent} Matrix Monitor
After=network.target

[Service]
Type=simple
User=lizthedeveloper_gmail_com
WorkingDirectory=/home/lizthedeveloper_gmail_com/ai_game_theory_simulation
ExecStart=/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/scripts/{agent}-monitor.sh
Restart=always
RestartSec=10
StandardOutput=append:/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/agent-monitors/{agent}-monitor-service.log
StandardError=append:/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/agent-monitors/{agent}-monitor-service-error.log

[Install]
WantedBy=multi-user.target
```

**3. Deploy as above**

## Matrix Room IDs

```bash
COORDINATION="!G-uy0v5GZd9IUqFufg4KIt0ks6d7bNdwquD29SVC4-I"
IMPLEMENTATION="!rnTkKCinvpZLUQlywzVtMdKLH9EuElxLu0EGFJ1LZGA"
RESEARCH="!YdS1AvY5d7d6TfqEJC6klIdE6q3pqD1A1lFVMZ0dJ4I"
ARCHITECTURE="!c0t6XiY9I0b3R7MX5yxYCp4v:themultiverse.school"
TESTING="!JY6I9TEpXw9YExv0YCTkR1T5:themultiverse.school"
DOCUMENTATION="!xK7U2bE5yI3sE6S9Y1M8vN4z:themultiverse.school"
ROADMAP="!vF4z8R2P3yN6k9C1A5j7Q0X:themultiverse.school"
```

## Autonomous Worker Integration

**Pre-work message check:**
- `scripts/autonomous-worker-queue.sh` now checks for pending messages before task selection
- Uses `scripts/check-pending-messages.sh` to detect @mentions
- Non-blocking - monitors handle responses, workers proceed with queue tasks

**Future enhancement:**
- Workers could pause and handle urgent @mentions directly
- Priority override: critical messages interrupt queue work

## Troubleshooting

**Monitor not responding:**
```bash
# Check if running
ps aux | grep {agent}-monitor

# Check logs
tail -f logs/agent-monitors/{agent}-monitor.log

# Restart service
sudo systemctl restart {agent}-monitor.service
```

**Token issues:**
```bash
# Verify token in env
source ~/.superalignment-env
echo $MATRIX_TOKEN_{AGENT}

# Test API call
curl -s -X GET "https://matrix.themultiverse.school/_matrix/client/v3/rooms/{ROOM_ID}/messages?dir=b&limit=1" \
  -H "Authorization: Bearer $MATRIX_TOKEN_{AGENT}"
```

**High CPU/memory:**
- Check `POLL_INTERVAL` - should be 60s minimum
- Check for infinite loops in response logic
- Monitor token usage (Claude API costs)

## Cost Considerations

**Each monitor spawns Claude Code session when mentioned:**
- 5min timeout per response
- Sonnet model (default)
- Cost: ~$0.01-0.05 per response
- Poll API calls: negligible (free Matrix API)

**Optimization:**
- Increase `POLL_INTERVAL` for less active agents (e.g., 120s)
- Use cheaper model for simple status updates
- Batch responses if multiple mentions

## Next Steps

**Phase 4 (TODO):**
- Deploy monitors to VM production
- Test with real @mentions
- Monitor costs and adjust intervals
- Add health checks to monitors
- Implement message batching for cost reduction
