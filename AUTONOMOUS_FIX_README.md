# Autonomous Worker Fix - Nov 20, 2025

## Issues Fixed

1. **Wrong PROJECT_DIR paths** - Scripts were configured for `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation` but the current environment is `/home/user/ai_game_theory_simulation`

2. **No scheduling system** - Cron is not available in this environment, but systemd is

3. **"Automatic fixer" not working** - The health monitor (`autonomous-worker-watcher.sh`) had wrong paths

## Changes Made

### Path Updates
- ✅ `autonomous-worker.sh` - Updated PROJECT_DIR to `/home/user/ai_game_theory_simulation`
- ✅ `researcher-worker.sh` - Updated PROJECT_DIR to `/home/user/ai_game_theory_simulation`
- ✅ `scripts/research-agent.sh` - Updated PROJECT_DIR
- ✅ `scripts/autonomous-worker-watcher.sh` - Added fallback for current environment
- ✅ `scripts/setup-vm-cron.sh` - Added detection for current environment
- ✅ `scripts/merge-orchestrator.sh` - Updated HOME path to `/root`

### Systemd Service Files Created
Created systemd service and timer files in `/systemd/` directory:
- `autonomous-worker.service` + `autonomous-worker.timer` (runs at :00)
- `researcher-worker.service` + `researcher-worker.timer` (runs at :30)
- `worker-watcher.service` + `worker-watcher.timer` (runs at :15)
- `merge-orchestrator.service` + `merge-orchestrator.timer` (runs at :45)

## Installation

### Quick Start

```bash
# 1. Install the systemd services
sudo ./systemd/install-services.sh

# 2. Verify timers are running
systemctl list-timers --no-pager

# 3. Check status
systemctl status autonomous-worker.timer
```

### Manual Installation

If you prefer to install manually:

```bash
# Copy service files
sudo cp systemd/*.service /etc/systemd/system/
sudo cp systemd/*.timer /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable and start timers
sudo systemctl enable autonomous-worker.timer
sudo systemctl start autonomous-worker.timer

sudo systemctl enable researcher-worker.timer
sudo systemctl start researcher-worker.timer

sudo systemctl enable worker-watcher.timer
sudo systemctl start worker-watcher.timer

sudo systemctl enable merge-orchestrator.timer
sudo systemctl start merge-orchestrator.timer
```

## Testing

### Test Autonomous Worker Manually

```bash
# Run the worker script directly
./autonomous-worker.sh

# Check logs
tail -f logs/autonomous/worker_*.log
```

### Test Researcher Worker

```bash
# Run the researcher script directly
./researcher-worker.sh

# Check logs
tail -f logs/autonomous/researcher/researcher_*.log
```

### Monitor Systemd Timers

```bash
# List all timers and next run times
systemctl list-timers --no-pager

# Watch specific timer
systemctl status autonomous-worker.timer

# View service logs
journalctl -u autonomous-worker.service -f
```

## Hourly Schedule

- **:00** - Autonomous Worker (main implementation work, 45-minute timeout)
- **:15** - Worker Watcher (health monitor & auto-remediation)
- **:30** - Researcher Worker (research updates, 30-minute timeout)
- **:45** - Merge Orchestrator (process pending branches)

## Prerequisites

1. **Claude Code CLI** must be installed:
   ```bash
   sudo npm install -g @anthropic-ai/claude-code
   claude --version
   ```

2. **Authentication** - Claude Code must be authenticated with your account

3. **Git configured** - User name and email should be set:
   ```bash
   git config user.name "Your Name"
   git config user.email "your.email@example.com"
   ```

## Management Commands

```bash
# Stop all autonomous workers
sudo systemctl stop autonomous-worker.timer
sudo systemctl stop researcher-worker.timer
sudo systemctl stop worker-watcher.timer
sudo systemctl stop merge-orchestrator.timer

# Start all autonomous workers
sudo systemctl start autonomous-worker.timer
sudo systemctl start researcher-worker.timer
sudo systemctl start worker-watcher.timer
sudo systemctl start merge-orchestrator.timer

# Disable (prevent auto-start on reboot)
sudo systemctl disable autonomous-worker.timer

# Enable (auto-start on reboot)
sudo systemctl enable autonomous-worker.timer

# View logs
journalctl -u autonomous-worker.service -n 100
journalctl -u researcher-worker.service -n 100
journalctl -u worker-watcher.service -n 100
journalctl -u merge-orchestrator.service -n 100
```

## Troubleshooting

### Timers not running?

```bash
# Check if timers are active
systemctl list-timers

# Check service status
systemctl status autonomous-worker.timer
systemctl status autonomous-worker.service

# View recent logs
journalctl -u autonomous-worker.service -n 50
```

### Claude Code authentication issues?

```bash
# Test Claude Code
claude --version

# Re-authenticate if needed
claude auth login
```

### Permission errors?

```bash
# Ensure scripts are executable
chmod +x autonomous-worker.sh
chmod +x researcher-worker.sh
chmod +x scripts/autonomous-worker-watcher.sh
chmod +x scripts/merge-orchestrator.sh
```

## What the Automatic Fixer Does

The **Worker Watcher** (`autonomous-worker-watcher.sh`) runs at :15 past each hour and:

1. ✅ Checks if autonomous workers ran successfully
2. ✅ Detects timeouts, errors, or stuck processes
3. ✅ Auto-remediates common issues:
   - Restarts cron/systemd if stopped
   - Kills hung worker processes
   - Cleans up lock files
   - Diagnoses API key issues
   - Spawns Claude Code to fix complex problems
4. ✅ Creates GitHub issues if manual intervention needed
5. ✅ Monitors all autonomous systems (worker, researcher, merge orchestrator)

## Log Files

All autonomous operations are logged:
- Worker logs: `logs/autonomous/worker_YYYYMMDD_HHMMSS.log`
- Researcher logs: `logs/autonomous/researcher/researcher_YYYYMMDD_HHMMSS.log`
- Watcher logs: `logs/worker_watcher/watcher_YYYYMMDD_HHMMSS.log`
- Merge logs: `logs/merge_orchestrator/*.log`
- Systemd logs: `journalctl -u <service-name>`

## Next Steps

1. Run the installation script: `sudo ./systemd/install-services.sh`
2. Verify timers are active: `systemctl list-timers`
3. Monitor the first run: `journalctl -u autonomous-worker.service -f`
4. Check GitHub for auto-created PRs from autonomous work

---

**Created:** 2025-11-20
**Branch:** claude/fix-autonomous-worker-015z876KzQ5T9prLSVH5CVhY
