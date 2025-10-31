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
    
    # Ensure we are on main
    echo "📍 Switching to main branch..."
    git checkout main 2>&1 || echo "⚠️  Already on main"
    
    # Check if there are uncommitted changes before pull
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        echo "⚠️  Uncommitted changes detected on main branch"
        echo "💾 Committing local changes before pull..."
        git add -A
        git commit -m "chore: Auto-commit before pull (worker $TIMESTAMP)" 2>&1 || echo "Nothing to commit"
    fi
    
    # Pull latest changes from main
    echo "📥 Pulling latest from main..."
    if ! git pull origin main 2>&1; then
        echo "❌ Pull failed - likely merge conflict"
        echo "🤖 Invoking Claude to resolve merge conflicts..."
        
        # Create conflict resolution task
        cat > /tmp/conflict_resolution_$TIMESTAMP.txt << "CONFLICT_EOF"
There is a merge conflict when pulling from main. Please:
1. Review the conflicts using git status and git diff
2. Resolve all conflicts appropriately
3. Stage the resolved files with git add
4. Complete the merge with git commit
5. Verify the merge was successful

Do NOT use git stash - resolve conflicts properly by editing files.
CONFLICT_EOF
        
        # Activate Python environment for Claude
        source .venv/bin/activate
        
        # Run Claude to resolve conflicts
        claude --dangerously-skip-permissions < /tmp/conflict_resolution_$TIMESTAMP.txt 2>&1
        
        rm -f /tmp/conflict_resolution_$TIMESTAMP.txt
        
        echo "✅ Conflicts resolved, continuing..."
    else
        echo "✅ Pull successful, no conflicts"
    fi
    
    # Create new branch for this work session
    echo "🌿 Creating branch: $BRANCH_NAME"
    git checkout -b "$BRANCH_NAME" 2>&1
    
    # Activate Python environment
    source .venv/bin/activate
    
    # Run Claude Code with comprehensive workflow
    echo "🤖 Starting Claude Code with full orchestrator workflow..."
    
    # Create comprehensive task prompt
    cat > /tmp/claude_task_$TIMESTAMP.txt << "TASK_EOF"
Read plans/MASTER_IMPLEMENTATION_ROADMAP.md and identify work to do.

## PRIMARY WORKFLOW: Roadmap Implementation

If there are CRITICAL or HIGH priority items not yet complete:

Use the orchestrator agent to coordinate the full workflow:
1. Research & Validation (Quality Gate 1): super-alignment-researcher + research-skeptic review
2. Implementation & Testing: feature-implementer + test writers + Monte Carlo validation
3. Architecture Review (Quality Gate 2): architecture-skeptic review (MUST address CRITICAL/HIGH issues)
4. Documentation & Archival: wiki-documentation-updater + architect
5. Senior Dev Review: Run final quality check on completed work

Commit all completed work to the current branch.

## FALLBACK WORKFLOWS: If roadmap is complete or no CRITICAL/HIGH items

Execute these maintenance tasks in order:

### 1. Architecture Integration Review
Use architecture-skeptic to:
- Scan recent commits (last 30 days) for integration issues
- Check for missing cross-system connections
- Identify state propagation problems
- Flag performance bottlenecks or O(n²) issues
- Review for complexity creep

### 2. Research Source Validation
Use super-alignment-researcher + research-skeptic to:
- Audit research/ directory for outdated sources (>1 year old)
- Cross-check parameter citations in simulation code
- Find contradictory evidence for key assumptions
- Validate Monte Carlo parameters against latest research

### 3. Research Debate Session
Spawn research-skeptic and super-alignment-researcher to debate:
- Current simulation assumptions
- Roadmap priorities (are we working on the right things?)
- Parameter calibration (are values research-backed?)
- Missing critical systems (what are we not modeling?)
- Save debate summary to reviews/ directory

### 4. Roadmap Gardening
Use architect agent to:
- Clean up completed items in roadmap
- Archive finished tasks to plans/completed/
- Update priority levels based on recent learnings
- Cross-reference roadmap with git history
- Ensure roadmap reflects current state
- Remove stale/outdated items

### 5. Documentation Sync
Use wiki-documentation-updater to:
- Check if docs/wiki/README.md reflects recent changes
- Update system documentation for new features
- Ensure all simulation mechanics are documented
- Cross-reference code comments with wiki

Commit all improvements to the current branch with descriptive messages.
TASK_EOF
    
    # Run Claude Code
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
