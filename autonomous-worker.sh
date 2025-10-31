#!/bin/bash
# Autonomous Claude Code Worker
# Wakes up periodically to work on roadmap items and reviews

set -e

PROJECT_DIR="/home/lizthedeveloper_gmail_com/ai_game_theory_simulation"
LOG_DIR="$PROJECT_DIR/logs/autonomous"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/worker_$TIMESTAMP.log"

mkdir -p "$LOG_DIR"

echo "=== Autonomous Worker Started: $(date) ===" | tee -a "$LOG_FILE"

cd "$PROJECT_DIR"

# Pull latest changes
echo "📥 Pulling latest changes..." | tee -a "$LOG_FILE"
git pull origin main 2>&1 | tee -a "$LOG_FILE"

# Activate Python environment
source .venv/bin/activate

# Read roadmap and determine next task
echo "📋 Checking roadmap for tasks..." | tee -a "$LOG_FILE"

# Create a simple task prompt for Claude Code
cat > /tmp/claude_task.txt << "TASKEOF"
You are an autonomous worker agent checking in on the project.

Your mission:
1. Read plans/MASTER_IMPLEMENTATION_ROADMAP.md
2. Find the highest priority uncompleted task
3. If you can complete it autonomously, do so
4. If not, perform a code review or research task
5. Commit and push your work

Priorities (in order):
- CRITICAL tasks first
- HIGH tasks second  
- Research verification tasks
- Code reviews in reviews/ directory
- Documentation updates

Work autonomously but safely:
- Only make well-understood changes
- Add detailed commit messages
- Run validation where possible
- Document your work

After completing work, create a brief report in logs/autonomous/
TASKEOF

echo "🤖 Launching Claude Code autonomous session..." | tee -a "$LOG_FILE"

# Check if ANTHROPIC_API_KEY is set
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "⚠️  ANTHROPIC_API_KEY not set. Please configure API key to enable autonomous operation." | tee -a "$LOG_FILE"
    echo "   Set it in ~/.bashrc or /etc/environment" | tee -a "$LOG_FILE"
    echo "   Example: export ANTHROPIC_API_KEY=sk-ant-..." | tee -a "$LOG_FILE"
    exit 1
fi

# Run Claude Code with the task (if API key is available)
# Note: This requires Claude Code CLI to be installed and authenticated
claude --dangerously-skip-permissions < /tmp/claude_task.txt 2>&1 | tee -a "$LOG_FILE"

echo "=== Autonomous Worker Completed: $(date) ===" | tee -a "$LOG_FILE"

# Clean up old logs (keep last 30 days)
find "$LOG_DIR" -name "worker_*.log" -mtime +30 -delete

