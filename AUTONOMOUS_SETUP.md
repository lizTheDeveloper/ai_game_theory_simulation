# Autonomous Worker Setup Guide

This system enables Claude Code to autonomously work on the project every 30 minutes, tackling roadmap items and performing reviews without user intervention.

## Quick Start

### 1. Install Claude Code CLI on VM

```bash
# SSH into the VM
remote-claude

# Install Claude Code globally (if not already installed)
sudo npm install -g @anthropic-ai/claude-code
```

### 2. Set Up API Key

You need an Anthropic API key for Claude Code to run autonomously.

**Option A: Environment Variable (Recommended)**

Add to `~/.bashrc`:
```bash
echo 'export ANTHROPIC_API_KEY="sk-ant-YOUR-KEY-HERE"' >> ~/.bashrc
source ~/.bashrc
```

**Option B: System-wide (For systemd service)**

```bash
sudo mkdir -p /etc/systemd/system/claude-worker.service.d
sudo cat > /etc/systemd/system/claude-worker.service.d/override.conf << EOF
[Service]
Environment="ANTHROPIC_API_KEY=sk-ant-YOUR-KEY-HERE"
EOF
```

### 3. Activate the Autonomous Worker

```bash
# Copy systemd files
sudo cp /tmp/claude-worker.service /etc/systemd/system/
sudo cp /tmp/claude-worker.timer /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable and start the timer
sudo systemctl enable claude-worker.timer
sudo systemctl start claude-worker.timer

# Verify it's running
sudo systemctl status claude-worker.timer
```

### 4. Test Manual Run

Before enabling the timer, test manually:

```bash
cd ~/ai_game_theory_simulation
./autonomous-worker.sh
```

## How It Works

### Schedule
- Runs every 30 minutes automatically
- Can be changed in `/etc/systemd/system/claude-worker.timer`
- Edit `OnCalendar=*:0/30` to adjust frequency

### Task Selection Priority

**Research-First Workflow:**
Every autonomous run begins by posting research requests to the research channel. This allows research to run in parallel with implementation work.

1. **Post research requests** (STEP 0 - always first)
   - Scan roadmap for CRITICAL/HIGH items
   - Post specific research needs to research channel
   - Research monitor spawns super-alignment-researcher
   - Research runs in parallel with implementation
2. **CRITICAL** roadmap items
3. **HIGH** priority tasks
4. Research verification tasks (using parallel research results)
5. Code reviews
6. Documentation updates

### Safety Features

- 30-minute timeout per session
- Logs all actions to `logs/autonomous/`
- **Complete audit trail:** All logs preserved in git history forever (no cleanup)
- Git operations with full audit trail
- Pulls latest changes before starting work
- Each run commits its log file to the feature branch
- **Automatic Claude Code updates:** Worker updates to latest Claude Code version before each run
  - Removes old version and installs latest from npm
  - Continues with existing version if update fails
  - Logs version after update attempt
  - Ensures worker always uses latest features and bug fixes
- **Chatroom monitor check:** Ensures multi-agent coordination is operational
  - Checks if `channel-monitor.ts` is running in pre-flight checks (active orchestrator spawning)
  - Auto-starts monitor if not running (self-healing)
  - Verifies monitor process started successfully
  - Logs monitor status to `logs/monitor_TIMESTAMP.log`
  - Prevents coordination failures from stopped monitors
  - **Active coordination:** Monitor automatically spawns orchestrator when work detected (not just passive notifications)
- **Automatic PR creation:** Worker creates pull requests after pushing feature branches
- **GitHub issue alerts:** Automatic issue creation when Claude execution fails
  - Timeout detection (exit 124) creates issue with `timeout` label
  - Any non-zero exit code creates issue with `failure` label
  - Issues include timestamp, duration, branch, exit code, and log path
  - Graceful fallback if `gh` CLI unavailable
  - No silent failures - every problem creates actionable GitHub issue
  - PR includes run metrics, timing, and commit history
  - Graceful fallback if `gh` CLI not authenticated
  - PR title prefixed with `[Autonomous]` for easy filtering

### Log Retention Policy

**All autonomous worker logs are preserved in git history forever.**

**Benefits:**
- Complete audit trail of all autonomous work
- Forensic analysis of worker decisions and actions
- Historical tracking of roadmap progress
- Accountability and transparency
- Reproducibility of past autonomous runs

**Storage:**
- Logs live in `logs/autonomous/` directory
- Each run creates a timestamped log file (e.g., `worker_20251030_210000.log`)
- Worker commits log file to feature branch before merging
- All logs tracked in git history (`.gitignore` allows `logs/autonomous/*.log`)

**Access historical logs:**
```bash
# View all autonomous logs in current branch
ls -lt logs/autonomous/

# Search for specific autonomous runs
git log --all --source --grep="autonomous"

# Extract log from specific commit
git show <commit>:logs/autonomous/worker_<timestamp>.log

# View log history for a specific file
git log --follow -- logs/autonomous/worker_20251030_210000.log
```

### Monitoring

View recent activity:
```bash
# Check timer status
sudo systemctl status claude-worker.timer

# View recent logs
ls -lt ~/ai_game_theory_simulation/logs/autonomous/

# Tail live log
tail -f ~/ai_game_theory_simulation/logs/autonomous/worker_*.log
```

View systemd logs:
```bash
# Recent runs
sudo journalctl -u claude-worker.service -n 50

# Follow live
sudo journalctl -u claude-worker.service -f
```

### Pull Request Workflow

**Automatic PR creation** (as of Oct 30, 2025):

When the worker completes a task and pushes a feature branch, it automatically creates a pull request with detailed metrics.

**PR Contents:**
- **Title**: `[Autonomous] <first commit message>`
- **Body includes**:
  - Run timestamp and branch name
  - Total duration and Claude API time
  - Files changed and commits made
  - Complete commit history
  - Memory and disk usage
  - Exit code
  - Links to log files and metrics

**Example PR body:**
```markdown
## 🤖 Autonomous Worker Run

**Run:** 20251030_210000
**Branch:** `autonomous/20251030_210000`
**Duration:** 25m 12s
**Claude Time:** 22m 45s

### Changes
- **Files Changed:** 8
- **Commits:** 3

### Commit History
a1b2c3d feat: Implement nuclear winter cascades
e4f5g6h test: Add Monte Carlo validation
i7j8k9l docs: Update wiki with new feature

### Metrics
- **Memory Used:** 2.3GB
- **Disk Used:** 450MB
- **Exit Code:** 0
```

**Viewing autonomous PRs:**
```bash
# List all autonomous PRs
gh pr list --search "is:pr [Autonomous]"

# View specific PR
gh pr view <number>
```

**Metrics tracking:**
Each run creates `logs/autonomous/metrics_<timestamp>.json` with:
- Run metadata (timestamp, branch, duration)
- Claude API usage (time, exit code)
- Git operations (files changed, commits made, push success)
- **PR creation status** (`pr_created: true/false`)
- Resource usage (memory, disk)

## Management Commands

```bash
# Stop autonomous worker
sudo systemctl stop claude-worker.timer

# Start autonomous worker  
sudo systemctl start claude-worker.timer

# Disable (prevent auto-start on reboot)
sudo systemctl disable claude-worker.timer

# Enable (auto-start on reboot)
sudo systemctl enable claude-worker.timer

# Trigger immediate run
sudo systemctl start claude-worker.service
```

## Configuration Options

### Change Frequency

Edit `/etc/systemd/system/claude-worker.timer`:

```ini
# Every hour
OnCalendar=hourly

# Every 15 minutes
OnCalendar=*:0/15

# Daily at 2 AM
OnCalendar=daily
OnCalendar=02:00

# Weekdays at 9 AM
OnCalendar=Mon-Fri 09:00
```

After changes:
```bash
sudo systemctl daemon-reload
sudo systemctl restart claude-worker.timer
```

### Adjust Timeout

Edit `/etc/systemd/system/claude-worker.service`:

```ini
[Service]
TimeoutStartSec=1h  # Increase to 1 hour
```

## Cost Considerations

**Autonomous runs cost money!**

- Each 30-min run might use $0.10-$0.50 in API calls
- Daily cost: ~$5-$25 depending on task complexity
- Monthly cost: ~$150-$750

**To reduce costs:**
1. Increase interval (hourly instead of 30min)
2. Set daily budget limits in your Anthropic account
3. Only enable during active development periods
4. Use `OnCalendar=Mon-Fri 09:00-17:00` for business hours only

## Troubleshooting

### Worker not running?

```bash
# Check timer is active
sudo systemctl list-timers claude-worker.timer

# Check service logs
sudo journalctl -u claude-worker.service -n 100
```

### API key issues?

```bash
# Verify key is set
echo $ANTHROPIC_API_KEY

# Test key manually
claude --version
```

### Permission errors?

```bash
# Ensure script is executable
chmod +x ~/ai_game_theory_simulation/autonomous-worker.sh

# Check file ownership
ls -la ~/ai_game_theory_simulation/autonomous-worker.sh
```

## Security Notes

- API key gives full access to your Anthropic account
- Worker can commit and push to repository
- Review commits regularly: `git log --author="Remote Claude"`
- Monitor API usage in Anthropic dashboard
- Consider using a separate API key with lower rate limits

## Disabling Autonomous Worker

Temporary:
```bash
sudo systemctl stop claude-worker.timer
```

Permanent:
```bash
sudo systemctl stop claude-worker.timer
sudo systemctl disable claude-worker.timer
```

Complete removal:
```bash
sudo systemctl stop claude-worker.timer
sudo systemctl disable claude-worker.timer
sudo rm /etc/systemd/system/claude-worker.*
sudo systemctl daemon-reload
```

---

**Created:** $(date)  
**Location:** remote-claude VM (europe-west10-a)
