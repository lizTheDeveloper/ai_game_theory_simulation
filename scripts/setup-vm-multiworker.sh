#!/bin/bash
# VM Multi-Worker Infrastructure Setup
#
# Creates isolated git repos for parallel autonomous execution.
# Prevents git contention by giving each worker their own workspace.
#
# Structure:
#   /home/user/satu/
#     ├── worker/           ← Implementation worker's isolated repo
#     ├── researcher/       ← Research worker's isolated repo
#     ├── orchestrator/     ← Clean repo just for merging
#     └── shared/           ← Logs, configs, coordination files
#
# Usage:
#   ./scripts/setup-vm-multiworker.sh
#
# Requirements:
#   - Run as user with git access
#   - GitHub SSH key configured
#   - ANTHROPIC_API_KEY in environment

set -e

# ============================================
# Configuration
# ============================================

SCRIPT_NAME="setup-vm-multiworker.sh"
BASE_DIR="/home/user/satu"
REPO_URL="git@github.com:annhoward/superalignmenttoutopia.git"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Worker types
WORKERS=("worker" "researcher" "orchestrator")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# Logging
# ============================================

log() {
  echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $*"
}

log_warn() {
  echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  $*${NC}"
}

log_error() {
  echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ❌ $*${NC}"
}

log_section() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  log "$1"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# ============================================
# Pre-flight Checks
# ============================================

log_section "🔍 Pre-flight Checks"

# Check if running on VM
if [ ! -d "/home/user" ]; then
  log_error "This script must be run on the VM (expected /home/user directory)"
  exit 1
fi

log "✅ Running on VM"

# Check for git
if ! command -v git &> /dev/null; then
  log_error "git not found - install with: sudo apt-get install git"
  exit 1
fi

log "✅ git installed"

# Check for GitHub SSH access
if ! ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
  log_error "GitHub SSH key not configured"
  log_error "Configure with: ssh-keygen && cat ~/.ssh/id_rsa.pub"
  exit 1
fi

log "✅ GitHub SSH access configured"

# Check for ANTHROPIC_API_KEY
if [ -z "$ANTHROPIC_API_KEY" ]; then
  log_warn "ANTHROPIC_API_KEY not set in environment"
  log_warn "Workers will fail without API key"
  log_warn "Set with: export ANTHROPIC_API_KEY=sk-..."
fi

# ============================================
# Create Base Directory Structure
# ============================================

log_section "📁 Creating Base Directory Structure"

# Create base directory
if [ -d "$BASE_DIR" ]; then
  log_warn "Directory $BASE_DIR already exists"
  read -p "Remove and recreate? (y/N): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    log "Removing existing directory..."
    rm -rf "$BASE_DIR"
  else
    log_error "Aborted - cannot proceed with existing directory"
    exit 1
  fi
fi

mkdir -p "$BASE_DIR"
log "✅ Created $BASE_DIR"

# Create shared directory
mkdir -p "$BASE_DIR/shared/logs"
mkdir -p "$BASE_DIR/shared/configs"
mkdir -p "$BASE_DIR/shared/coordination"
log "✅ Created shared directories"

# ============================================
# Clone Repositories
# ============================================

log_section "📦 Cloning Repositories"

for worker in "${WORKERS[@]}"; do
  log "Cloning repository for $worker..."

  WORKER_DIR="$BASE_DIR/$worker"

  # Clone repo
  git clone "$REPO_URL" "$WORKER_DIR"

  # Configure git user (prevents commit errors)
  cd "$WORKER_DIR"
  git config user.name "SATU Autonomous Worker ($worker)"
  git config user.email "autonomous-$worker@themultiverse.school"

  log "✅ Cloned and configured $worker repository"
done

# ============================================
# Configure Worker Scripts
# ============================================

log_section "⚙️  Configuring Worker Scripts"

# Worker script (implementation)
cat > "$BASE_DIR/worker/autonomous-worker-queue.sh" << 'WORKER_EOF'
#!/bin/bash
# Autonomous Worker - Queue-based execution
# This worker selects tasks from the priority queue

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR="$SCRIPT_DIR/../shared/logs/worker"
LOG_FILE="$LOG_DIR/worker_${TIMESTAMP}.log"
WORKER_ID="worker-vm-$(hostname)"

mkdir -p "$LOG_DIR"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

log "🚀 Starting autonomous worker (queue-based)"
log "   Worker ID: $WORKER_ID"

cd "$SCRIPT_DIR"

# Pull latest queue from main
log "⬇️  Pulling latest queue from main..."
git pull origin main

# Select task from queue
log "📋 Selecting task from queue..."
TASK_JSON=$(npx tsx scripts/autonomousWorkerSelectTask.ts 2>&1)

if [ $? -ne 0 ]; then
  log "⏸️  No tasks available - exiting gracefully"
  exit 0
fi

# Parse task details
TASK_ID=$(echo "$TASK_JSON" | jq -r '.id')
TASK_TITLE=$(echo "$TASK_JSON" | jq -r '.title')
AGENT_PERSONALITY=$(echo "$TASK_JSON" | jq -r '.agentPersonality')

log "✅ Selected task:"
log "   ID: $TASK_ID"
log "   Title: $TASK_TITLE"
log "   Agent: $AGENT_PERSONALITY"

# Claim task atomically
log "🔒 Claiming task..."
npx tsx scripts/autonomousWorkerClaimTask.ts "$TASK_ID" "$WORKER_ID"

# Commit claim to main (atomic test-and-set)
git add plans/AUTONOMOUS_WORKER_QUEUE.json
git commit -m "claim: $WORKER_ID claimed $TASK_ID"

if ! git push origin main; then
  log "❌ Push failed - another worker claimed this task"
  log "   Resetting and trying again..."
  git reset --hard origin/main
  exec "$0"  # Retry
fi

log "✅ Task claimed successfully"

# Map agent personality to agent file
declare -A AGENT_MAP=(
  ["roy"]="simulation-maintainer"
  ["devon"]="devops"
  ["cynthia"]="super-alignment-researcher"
  ["sylvia"]="research-skeptic"
  ["moss"]="feature-implementer"
  ["tessa"]="far-future-ux-designer"
  ["historian"]="wiki-documentation-updater"
  ["architect"]="architect"
  ["orchestrator"]="orchestrator"
  ["priya"]="quantitative-validator"
)

AGENT_FILE="${AGENT_MAP[$AGENT_PERSONALITY]}"
if [ -z "$AGENT_FILE" ]; then
  log "❌ Unknown agent personality: $AGENT_PERSONALITY"
  npx tsx scripts/autonomousWorkerReleaseTask.ts "$TASK_ID" "ABANDONED" "Unknown agent personality"
  exit 1
fi

AGENT_PATH=".claude/agents/${AGENT_FILE}.md"
if [ ! -f "$AGENT_PATH" ]; then
  log "❌ Agent file not found: $AGENT_PATH"
  npx tsx scripts/autonomousWorkerReleaseTask.ts "$TASK_ID" "ABANDONED" "Agent file missing"
  exit 1
fi

log "📄 Loading agent context: $AGENT_PATH"

# Create work branch
BRANCH_NAME="auto/queue-${TASK_ID}-${TIMESTAMP}"
git checkout -b "$BRANCH_NAME"

# Execute task with Claude Code
log "🤖 Executing task as $AGENT_PERSONALITY..."

PROMPT_FILE="/tmp/worker_prompt_${TIMESTAMP}.txt"

# Build prompt with agent identity injection
cat > "$PROMPT_FILE" << PROMPT_EOF
You are working on task $TASK_ID from the autonomous worker queue.

You are operating as **$AGENT_PERSONALITY** - adopt this agent's expertise and personality.

## Your Agent Identity

Read your agent definition:
$(cat "$AGENT_PATH")

## Task Details
ID: $TASK_ID
Title: $TASK_TITLE
Assigned Agent: $AGENT_PERSONALITY

## Instructions
1. Recall your memory: mcp__agent-memory__recall_context({agent_id: "$AGENT_PERSONALITY"})
2. Review task specification: Read plans/AUTONOMOUS_WORKER_QUEUE.json, find task $TASK_ID
3. Complete work per acceptance criteria
4. Add progress notes: npx tsx scripts/autonomousWorkerGetProgress.ts "$TASK_ID" --add-note "your note"
5. Commit changes with descriptive messages
6. Stay within token budget

## Completion Workflow
- **If complete:** Work will be auto-validated. If validation passes, task marked COMPLETED.
- **If blocked:** Add diagnostic notes explaining blocker
- **If failed:** Add notes with failure reason

## Critical Constraints
- Token conservation mode is ACTIVE - be brutally efficient
- Grep before reading files
- No optional docs unless task-critical
- Exit when task complete, don't explore

Work now.
PROMPT_EOF

# Run Claude Code with timeout (45 minutes max)
set +e
timeout 2700 claude --model sonnet --dangerously-skip-permissions < "$PROMPT_FILE" >> "$LOG_FILE" 2>&1
CLAUDE_EXIT=$?
set -e

rm -f "$PROMPT_FILE"

if [ $CLAUDE_EXIT -eq 124 ]; then
  log "⏱️  Claude execution timed out after 45 minutes"
  npx tsx scripts/autonomousWorkerReleaseTask.ts "$TASK_ID" "ABANDONED" "Timeout after 45min"
  exit 1
elif [ $CLAUDE_EXIT -ne 0 ]; then
  log "❌ Claude execution failed with exit code $CLAUDE_EXIT"
  npx tsx scripts/autonomousWorkerReleaseTask.ts "$TASK_ID" "ABANDONED" "Claude exit code $CLAUDE_EXIT"
  exit 1
fi

log "✅ Task execution complete"

# Validate task completion
log "🔍 Validating task completion..."
VALIDATION_RESULT=$(npx tsx scripts/autonomousWorkerValidateTask.ts "$TASK_ID" 2>&1)
VALIDATION_EXIT=$?

if [ $VALIDATION_EXIT -eq 0 ]; then
  log "✅ Task validation passed"
  npx tsx scripts/autonomousWorkerCompleteTask.ts "$TASK_ID" "$WORKER_ID"
else
  log "⚠️  Task validation failed:"
  log "$VALIDATION_RESULT"
  npx tsx scripts/autonomousWorkerReleaseTask.ts "$TASK_ID" "AVAILABLE" "Validation failed"
fi

# Push work branch
log "⬆️  Pushing work branch..."
git push origin "$BRANCH_NAME"

log "🏁 Worker execution complete"

WORKER_EOF

chmod +x "$BASE_DIR/worker/autonomous-worker-queue.sh"
log "✅ Created worker script"

# Researcher script (placeholder for now)
cat > "$BASE_DIR/researcher/researcher-worker-queue.sh" << 'RESEARCHER_EOF'
#!/bin/bash
# Autonomous Researcher - Queue-based execution
# This worker handles research-intensive tasks

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR="$SCRIPT_DIR/../shared/logs/researcher"
LOG_FILE="$LOG_DIR/researcher_${TIMESTAMP}.log"
WORKER_ID="researcher-vm-$(hostname)"

mkdir -p "$LOG_DIR"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

log "🔬 Starting autonomous researcher (queue-based)"
log "   Worker ID: $WORKER_ID"

# Same queue-based logic as worker
# But filters to research-only tasks (assignedAgent = super-alignment-researcher)

log "⚠️  Researcher implementation incomplete"
log "   Phase 1 (infrastructure) - Phase 2 will add execution"

RESEARCHER_EOF

chmod +x "$BASE_DIR/researcher/researcher-worker-queue.sh"
log "✅ Created researcher script"

# ============================================
# Create Systemd Services
# ============================================

log_section "🔧 Creating Systemd Services"

# Worker service
cat > "$BASE_DIR/shared/configs/autonomous-worker-queue.service" << 'SERVICE_EOF'
[Unit]
Description=Autonomous Worker - Queue-based (Implementation)
After=network.target

[Service]
Type=oneshot
User=user
WorkingDirectory=/home/user/satu/worker
ExecStart=/home/user/satu/worker/autonomous-worker-queue.sh
StandardOutput=append:/home/user/satu/shared/logs/systemd_worker.log
StandardError=append:/home/user/satu/shared/logs/systemd_worker.log
TimeoutStartSec=3000
Environment="ANTHROPIC_API_KEY=%ANTHROPIC_API_KEY%"

[Install]
WantedBy=multi-user.target
SERVICE_EOF

# Worker timer
cat > "$BASE_DIR/shared/configs/autonomous-worker-queue.timer" << 'TIMER_EOF'
[Unit]
Description=Autonomous Worker Timer - Hourly execution

[Timer]
OnCalendar=hourly
Persistent=true

[Install]
WantedBy=timers.target
TIMER_EOF

log "✅ Created systemd service and timer files"
log "   Location: $BASE_DIR/shared/configs/"
log ""
log "💡 To install services:"
log "   1. Replace %ANTHROPIC_API_KEY% in service file"
log "   2. sudo cp $BASE_DIR/shared/configs/*.service /etc/systemd/system/"
log "   3. sudo cp $BASE_DIR/shared/configs/*.timer /etc/systemd/system/"
log "   4. sudo systemctl daemon-reload"
log "   5. sudo systemctl enable autonomous-worker-queue.timer"
log "   6. sudo systemctl start autonomous-worker-queue.timer"

# ============================================
# Create Installation Helper
# ============================================

cat > "$BASE_DIR/shared/install-services.sh" << 'INSTALL_EOF'
#!/bin/bash
# Install systemd services for multi-worker setup

set -e

if [ "$EUID" -ne 0 ]; then
  echo "❌ This script must be run as root (use sudo)"
  exit 1
fi

CONFIG_DIR="/home/user/satu/shared/configs"

if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "❌ ANTHROPIC_API_KEY not set"
  echo "   Export it before running: export ANTHROPIC_API_KEY=sk-..."
  exit 1
fi

echo "🔧 Installing systemd services..."

# Replace API key placeholder in service files
for service_file in "$CONFIG_DIR"/*.service; do
  sed "s|%ANTHROPIC_API_KEY%|$ANTHROPIC_API_KEY|g" "$service_file" > "/etc/systemd/system/$(basename "$service_file")"
done

# Copy timer files
cp "$CONFIG_DIR"/*.timer /etc/systemd/system/

# Reload systemd
systemctl daemon-reload

echo "✅ Services installed"
echo ""
echo "💡 Next steps:"
echo "   sudo systemctl enable autonomous-worker-queue.timer"
echo "   sudo systemctl start autonomous-worker-queue.timer"
echo "   sudo systemctl status autonomous-worker-queue.timer"

INSTALL_EOF

chmod +x "$BASE_DIR/shared/install-services.sh"
log "✅ Created service installation helper"

# ============================================
# Create README
# ============================================

log_section "📖 Creating Documentation"

cat > "$BASE_DIR/README.md" << 'README_EOF'
# SATU Multi-Worker Infrastructure

This directory contains isolated git repositories for parallel autonomous execution.

## Structure

```
/home/user/satu/
  ├── worker/           ← Implementation worker's isolated repo
  ├── researcher/       ← Research worker's isolated repo
  ├── orchestrator/     ← Clean repo just for merging
  └── shared/           ← Logs, configs, coordination files
```

## How It Works

**Problem:** Multiple workers sharing a single repo causes git contention (merge conflicts, race conditions).

**Solution:** Each worker gets their own isolated repo clone. They coordinate via:
1. **Priority queue** (plans/AUTONOMOUS_WORKER_QUEUE.json)
2. **Atomic claims** (git commit + push = test-and-set)
3. **Shared logs** (shared/logs/)

## Queue-Based Execution

Workers select tasks from the priority queue:

1. **Pull latest queue** from main
2. **Select task** (highest priority within token budget)
3. **Claim task** (atomic via git push)
4. **Execute work** (load agent personality, run Claude)
5. **Release task** (mark COMPLETED or ABANDONED)

## Installation

1. **Install systemd services:**
   ```bash
   export ANTHROPIC_API_KEY=sk-...
   sudo ./shared/install-services.sh
   ```

2. **Enable timer:**
   ```bash
   sudo systemctl enable autonomous-worker-queue.timer
   sudo systemctl start autonomous-worker-queue.timer
   ```

3. **Check status:**
   ```bash
   sudo systemctl status autonomous-worker-queue.timer
   journalctl -u autonomous-worker-queue.service -f
   ```

## Manual Testing

Test worker manually:
```bash
cd /home/user/satu/worker
./autonomous-worker-queue.sh
```

Check logs:
```bash
tail -f /home/user/satu/shared/logs/worker/worker_*.log
```

## Coordination Files

- **Queue:** `/home/user/satu/worker/plans/AUTONOMOUS_WORKER_QUEUE.json`
- **Logs:** `/home/user/satu/shared/logs/`
- **Configs:** `/home/user/satu/shared/configs/`

## Debugging

**Worker not running?**
```bash
sudo systemctl status autonomous-worker-queue.timer
journalctl -u autonomous-worker-queue.service --since "1 hour ago"
```

**No tasks available?**
```bash
cat /home/user/satu/worker/plans/AUTONOMOUS_WORKER_QUEUE.json | jq '.queue[] | select(.status == "AVAILABLE")'
```

**Regenerate queue:**
```bash
cd /home/user/satu/worker
npx tsx scripts/generateAutonomousWorkerQueue.ts
git add plans/AUTONOMOUS_WORKER_QUEUE.json
git commit -m "chore: Regenerate worker queue"
git push origin main
```

## Maintenance

**Clean up old logs:**
```bash
find /home/user/satu/shared/logs -name "*.log" -mtime +7 -delete
```

**Reset claimed tasks:**
```bash
cd /home/user/satu/worker
npx tsx scripts/generateAutonomousWorkerQueue.ts  # No --preserve-claims
```

**Check queue status:**
```bash
cd /home/user/satu/worker
npx tsx scripts/autonomousWorkerSelectTask.ts
```

README_EOF

log "✅ Created README.md"

# ============================================
# Final Summary
# ============================================

log_section "✅ Setup Complete"

log "Multi-worker infrastructure created at: $BASE_DIR"
log ""
log "📁 Directory structure:"
tree -L 2 "$BASE_DIR" 2>/dev/null || find "$BASE_DIR" -maxdepth 2 -type d
log ""
log "🚀 Next steps:"
log "   1. Review setup: cat $BASE_DIR/README.md"
log "   2. Test worker: cd $BASE_DIR/worker && ./autonomous-worker-queue.sh"
log "   3. Install services: export ANTHROPIC_API_KEY=sk-... && sudo $BASE_DIR/shared/install-services.sh"
log "   4. Enable timer: sudo systemctl enable autonomous-worker-queue.timer"
log "   5. Start timer: sudo systemctl start autonomous-worker-queue.timer"
log ""
log "📊 Queue status:"
cd "$BASE_DIR/worker"
npx tsx scripts/autonomousWorkerSelectTask.ts 2>&1 | head -5 || log "   (Queue selection test)"
log ""
log "💡 Monitor with:"
log "   tail -f $BASE_DIR/shared/logs/worker/worker_*.log"
log "   journalctl -u autonomous-worker-queue.service -f"

