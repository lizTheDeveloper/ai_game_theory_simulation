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
BRANCH_NAME="auto/worker-$TIMESTAMP"

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
    
    # Pull latest changes from main
    echo "📥 Pulling latest from main..."
    git checkout main 2>&1 || echo "⚠️  Already on main"
    git pull origin main 2>&1 || echo "⚠️  Pull failed or no changes"
    
    # Create new branch for this work session
    echo "🌿 Creating branch: $BRANCH_NAME"
    git checkout -b "$BRANCH_NAME" 2>&1
    
    # Activate Python environment
    source .venv/bin/activate
    
    # Run Claude Code with orchestrator
    echo "🤖 Starting Claude Code with full orchestrator workflow..."
    echo "📋 Reading roadmap for next priority item..."
    
    # Create task prompt for orchestrator
    cat > /tmp/claude_task_$TIMESTAMP.txt << "TASK_EOF"
Read plans/MASTER_IMPLEMENTATION_ROADMAP.md and identify the highest priority CRITICAL or HIGH item that is not yet complete.

Use the orchestrator agent to coordinate the full workflow:
1. Research & Validation (Quality Gate 1): super-alignment-researcher + research-skeptic review
2. Implementation & Testing: feature-implementer + test writers + Monte Carlo validation
3. Architecture Review (Quality Gate 2): architecture-skeptic review (MUST address CRITICAL/HIGH issues)
4. Documentation & Archival: wiki-documentation-updater + architect

Commit all completed work to the current branch when done.

If no CRITICAL/HIGH items remain, run the architecture-skeptic agent on recent changes to identify technical debt or performance issues.
TASK_EOF
    
    # Run Claude Code with orchestrator
    claude --dangerously-skip-permissions < /tmp/claude_task_$TIMESTAMP.txt 2>&1
    
    # Clean up temp file
    rm -f /tmp/claude_task_$TIMESTAMP.txt
    
    # Push branch to remote
    echo ""
    echo "📤 Pushing branch to remote..."
    git push -u origin "$BRANCH_NAME" 2>&1 || echo "⚠️  Push failed or no changes to push"
    
    # Return to main branch
    echo "🔄 Returning to main branch..."
    git checkout main 2>&1
    
    # Clean up old logs (keep last 30 days)
    find "$LOG_DIR" -name "worker_*.log" -mtime +30 -delete 2>/dev/null || true
    
    echo ""
    echo "✅ Worker cycle complete"
    echo "📋 Branch created: $BRANCH_NAME"
    echo "💡 Review and merge via GitHub when ready"
} 2>&1 | tee -a "$LOG_FILE"
