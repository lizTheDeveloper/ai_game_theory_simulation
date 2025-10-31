#!/bin/bash
set -e

PROJECT_DIR="/home/lizthedeveloper_gmail_com/ai_game_theory_simulation"

# Source .env file to get API key
if [ -f "$PROJECT_DIR/.env" ]; then
    source "$PROJECT_DIR/.env"
fi

# Export API key explicitly
export ANTHROPIC_API_KEY

LOG_DIR="$PROJECT_DIR/logs/autonomous"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/worker_$TIMESTAMP.log"

mkdir -p "$LOG_DIR"
cd "$PROJECT_DIR"

{
    echo "=== Autonomous Worker - $TIMESTAMP ==="
    
    # Verify API key is set
    if [ -z "$ANTHROPIC_API_KEY" ]; then
        echo "❌ ANTHROPIC_API_KEY not set!"
        exit 1
    fi
    echo "✅ API key loaded (${ANTHROPIC_API_KEY:0:15}...)"
    
    # Pull latest changes
    echo "📥 Pulling latest changes..."
    git pull origin main 2>&1 || echo "⚠️  Pull failed or no changes"
    
    # Activate Python environment
    source .venv/bin/activate
    
    # Run Claude Code with dangerous skip permissions
    echo "🤖 Starting Claude Code autonomous session..."
    echo "Reading roadmap and tackling next task..."
    
    # Create task prompt
    cat > /tmp/claude_task_$TIMESTAMP.txt << "TASK_EOF"
Read plans/MASTER_IMPLEMENTATION_ROADMAP.md and work on the highest priority CRITICAL or HIGH item that is not yet complete. If no critical items remain, run architecture reviews on recent changes. Commit and push all completed work.
TASK_EOF
    
    # Run Claude Code
    claude --dangerously-skip-permissions < /tmp/claude_task_$TIMESTAMP.txt 2>&1
    
    # Clean up temp file
    rm -f /tmp/claude_task_$TIMESTAMP.txt
    
    # Clean up old logs (keep last 30 days)
    find "$LOG_DIR" -name "worker_*.log" -mtime +30 -delete 2>/dev/null || true
    
    echo "✅ Worker cycle complete"
} 2>&1 | tee -a "$LOG_FILE"
