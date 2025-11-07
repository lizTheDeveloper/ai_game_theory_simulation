# Autonomous Worker Setup Guide

This system enables Claude Code to autonomously work on the project hourly during business hours (8am-8pm UTC), tackling roadmap items and performing reviews without user intervention.

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
<<<<<<< HEAD:docs/AUTONOMOUS_SETUP.md

**Implementation Worker** (`autonomous-worker.sh`):
- Runs hourly at `:00` past each hour
- Handles roadmap implementation tasks
- 45-minute timeout for complex features

**Research Worker** (`researcher-worker.sh`):
- Runs hourly at `:30` past each hour
- Monitors Matrix `research` channel for questions from Sylvia/Cynthia
- Updates research files with current 2024-2025 sources
- 30-minute timeout (less intensive than implementation)
- Runs research age audit to prioritize CRITICAL/HIGH items

**Health Watcher** (`autonomous-worker-watcher.sh`):
- Runs at `:15` to monitor all autonomous systems
- Auto-remediates issues including researcher-worker health

**Merge Orchestrator** (`merge-orchestrator.sh`):
- Runs at `:45` to process branches from both workers
- Processes up to 15 branches per run
- Merges auto/* branches created by workers and researcher
- Auto-cleans up merged branches

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

- **45-minute timeout per session** (increased from 25min as of Nov 5, 2025)
  - Main session: 45 minutes (2700s) for task execution
  - Worker now runs hourly (not every 30min) so we have more time
  - Reduces incomplete work due to timeout
- **Post-timeout cleanup workflow** (new as of Nov 5, 2025)
  - Cleanup session: 5 minutes (300s) to commit partial work if timeout occurs
  - After timeout, spawns a 5-minute Claude session to review and commit partial work
  - Prevents loss of valuable progress when tasks exceed timeout
  - Cleanup session reviews changes and commits with "WIP" prefix if needed
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
  - Issues include timestamp, duration, branch, exit code, log path, and cleanup status
  - Graceful fallback if `gh` CLI unavailable
  - No silent failures - every problem creates actionable GitHub issue
  - PR includes run metrics, timing, and commit history
  - Graceful fallback if `gh` CLI not authenticated
  - PR title prefixed with `[Autonomous]` for easy filtering

### Log Retention Policy

**All autonomous worker logs are backed up to Google Cloud Storage.**

**Benefits:**
- Complete audit trail of all autonomous work
- Forensic analysis of worker decisions and actions
- Historical tracking of roadmap progress
- Accountability and transparency
- Reproducibility of past autonomous runs
- No git merge conflicts from log files

**Storage:**
- Logs live in `logs/autonomous/` directory locally
- Each run creates a timestamped log file (e.g., `worker_20251030_210000.log`)
- **All logs backed up to GCS:** `gs://multiverseschool-logs/archives/`
- **Logs NOT committed to git** (prevents merge conflicts)
- Local logs compressed after 7 days, deleted after 30 days (GCS backup retained)

**Access historical logs:**
```bash
# View current local logs
ls -lt logs/autonomous/

# Access GCS backups (requires gsutil)
gsutil ls gs://multiverseschool-logs/archives/

# Download specific backup
gsutil -m rsync -r gs://multiverseschool-logs/archives/20251106_224900/ ./logs/restore/

# Run cleanup/backup manually
./scripts/cleanup-and-backup.sh
```

**GCS Backup Details:**
- Automatic upload via `scripts/cleanup-and-backup.sh`
- Timestamped archives preserve all logs
- Local compression (>7 days) and deletion (>30 days) after GCS backup
- All logs accessible indefinitely in cloud storage

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

### Health Monitoring & Auto-Remediation

**Proactive health checking** (as of Nov 5, 2025):

The autonomous worker system now includes automated health monitoring with self-healing capabilities.

**How it works:**
- **`autonomous-worker-watcher.sh`** runs at `:15` past each hour (15 minutes after worker runs)
- Monitors last 90 minutes for worker execution, errors, timeouts
- Automatically diagnoses and fixes common issues
- Creates GitHub issues if manual intervention needed

**Recommended Cron Schedule:**
```bash
# :00 - Autonomous worker runs (main implementation work)
0 * * * * cd ~/ai_game_theory_simulation && ./autonomous-worker.sh >> logs/cron_worker.log 2>&1

# :15 - Health check & auto-fix (monitors all autonomous systems)
15 * * * * cd ~/ai_game_theory_simulation && ./scripts/autonomous-worker-watcher.sh >> logs/cron_watcher.log 2>&1

# :30 - Research worker (research updates, paper verification)
30 * * * * cd ~/ai_game_theory_simulation && ./researcher-worker.sh >> logs/cron_researcher.log 2>&1

# :45 - Merge orchestrator (processes pending branches)
45 * * * * cd ~/ai_game_theory_simulation && ./scripts/merge-orchestrator.sh >> logs/cron_merge.log 2>&1
```

**What it monitors:**
- Worker execution frequency (detects stuck/stopped workers)
- Error patterns in recent logs
- Timeout detection (45-minute limit, with 5-minute cleanup)
- Worker branch accumulation
- **Researcher worker health** (script existence, execution, cron job status)
- Merge orchestrator health
- Cron service status (VM only)

**Auto-remediation capabilities:**
- Restarts cron if stopped
- Kills hung worker processes
- Cleans up lock files
- Diagnoses API key issues
- Spawns Claude Code to fix complex problems

**View watcher logs:**
```bash
# Recent health checks
ls -lt ~/ai_game_theory_simulation/logs/worker_watcher/

# Latest health report
tail -100 ~/ai_game_theory_simulation/logs/worker_watcher/watcher_*.log | tail -1
```

**See:** `scripts/CRON_SETUP.md` for complete cron setup guide and troubleshooting.

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
**Duration:** 42m 15s
**Claude Time:** 39m 30s

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

**Current Schedule (hourly, business hours 8am-8pm UTC):**
- 13 runs per day
- Each run: ~10-25 minutes
- Token usage per run: ~50k-100k input, ~50k-100k output (Sonnet 4.5)
- Cost per run: $0.83-5.64 depending on task complexity
- Daily cost: ~$10.79-73.32
- Monthly cost: ~$324-2,200

**Daily Codebase Review (separate from autonomous worker):**
- Schedule: Daily at 6:00 UTC
- 3 Opus calls per day:
  1. Architecture-skeptic (systemic issues)
  2. Research-skeptic/Sylvia (quality & research integrity)
  3. Architect (updates roadmap with findings)
- Token usage: ~20k-50k input, ~5k-10k output per call
- Cost per call: ~$0.41-1.13
- Daily cost: ~$1.23-3.38
- Monthly cost: ~$37-101

**Combined System Costs:**
- Autonomous worker: ~$324-2,200/month
- Daily codebase review: ~$37-101/month
- Merge orchestrator (hourly): ~$5-25/month
- **Total: ~$366-2,326/month**

**Cost Optimization History:**
- **Nov 2025 optimization:**
  - Autonomous worker: Every 30 min (48 runs/day) → Hourly business hours (13 runs/day)
  - Savings: 72.9% cost reduction (~$871-5,922/month saved)
  - Agent reviews: Per-branch Opus reviews → Daily batched review
  - Savings: 99.3% reduction (~$8,139/month saved)
  - **Combined savings: ~$9,010-13,861/month** (96.4-82% total reduction)

**To further reduce costs:**
1. Narrow business hours window (e.g., `OnCalendar=*-*-* 09..17:00:00` for 9am-5pm)
2. Weekdays only (e.g., `OnCalendar=Mon-Fri 08..20:00:00`)
3. Set daily budget limits in your Anthropic account
4. Only enable during active development periods

## Troubleshooting

### Worker not running?

**CRITICAL: Check crontab has `cd` command** (Nov 7, 2025 incident)

The most common silent failure is a missing `cd` command in crontab entries. Cron doesn't inherit your shell's working directory.

```bash
# ❌ WRONG - Will fail silently (script not found)
0 * * * * ./autonomous-worker.sh >> logs/cron_worker.log 2>&1

# ✅ CORRECT - Always use cd to working directory
0 * * * * cd /home/username/ai_game_theory_simulation && ./autonomous-worker.sh >> logs/cron_worker.log 2>&1

# Or use absolute paths everywhere
0 * * * * /home/username/ai_game_theory_simulation/autonomous-worker.sh >> /home/username/ai_game_theory_simulation/logs/cron_worker.log 2>&1
```

**Verify crontab entries:**
```bash
# View current crontab
crontab -l

# Check ALL cron jobs have cd or absolute paths
crontab -l | grep -E "(autonomous|researcher|watcher|merge)"
```

**Symptoms of missing `cd`:**
- No error messages (complete silence)
- No logs in `logs/cron_worker.log`
- Health watcher reports worker hasn't run
- systemctl shows timer is active but no execution

**Other checks:**
```bash
# Check timer is active
sudo systemctl list-timers claude-worker.timer

# Check service logs
sudo journalctl -u claude-worker.service -n 100

# Verify script exists and is executable
ls -la ~/ai_game_theory_simulation/autonomous-worker.sh

# Test manual run from correct directory
cd ~/ai_game_theory_simulation && ./autonomous-worker.sh
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
