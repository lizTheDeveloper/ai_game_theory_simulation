#!/bin/bash
# Architecture Skeptic Quality Gate
# Spawns architecture-skeptic agent to review merge branch for performance issues, state propagation, complexity

set -e

BRANCH=$1
TIMESTAMP=$2
LOG_FILE=$3

if [ -z "$BRANCH" ] || [ -z "$TIMESTAMP" ] || [ -z "$LOG_FILE" ]; then
  echo "Usage: $0 <branch_name> <timestamp> <log_file>"
  exit 1
fi
# Sanitize branch name for use in file paths (replace special chars with underscores)BRANCH_SAFE="$(echo "$BRANCH" | sed "s|[+ /]|_|g")"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REVIEW_OUTPUT="$PROJECT_ROOT/logs/merge_orchestrator/architecture_review_${BRANCH_SAFE}_${TIMESTAMP}.txt"

cd "$PROJECT_ROOT"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🔍 Spawning architecture-skeptic agent..." | tee -a "$LOG_FILE"

# Create prompt for architecture-skeptic
PROMPT="Review merge branch merge/${BRANCH}_${TIMESTAMP} for:

## Quality Gate: Architecture Review

**Task:** Evaluate this merge branch for architectural issues before merging to main.

**Review Focus:**
1. **Performance Issues:**
   - O(n²) or worse algorithms
   - Deep cloning in hot paths
   - Unnecessary iterations
   - Memory leaks

2. **State Propagation:**
   - Circular dependencies
   - Silent fallbacks (defensive anti-patterns)
   - NaN/undefined handling
   - State mutation safety

3. **Complexity Creep:**
   - Over-engineering
   - Unnecessary abstractions
   - Code duplication
   - Maintainability issues

4. **Integration:**
   - Breaking changes
   - API contract violations
   - Phase ordering issues (simulation-specific)
   - Cross-module dependencies

**Output Format:**
Report issues with severity levels:
- 🚨 CRITICAL: Blocks merge (must fix)
- ⚠️ HIGH: Strongly recommend fixing before merge
- 📋 MEDIUM: Should address soon
- 💡 LOW: Nice to have

**Decision:**
- If any CRITICAL issues → BLOCK merge
- Otherwise → APPROVE with recommendations

End your review with:
VERDICT: [APPROVE|BLOCK]
CRITICAL_ISSUES: [count]
HIGH_ISSUES: [count]
MEDIUM_ISSUES: [count]
LOW_ISSUES: [count]
"

# Spawn architecture-skeptic agent (uses Opus per agent config)
claude --dangerously-skip-permissions \
  --model sonnet \
  --print "$PROMPT" > "$REVIEW_OUTPUT" 2>&1

# Parse verdict from output
if grep -q "VERDICT: BLOCK" "$REVIEW_OUTPUT"; then
  VERDICT="BLOCK"
elif grep -q "VERDICT: APPROVE" "$REVIEW_OUTPUT"; then
  VERDICT="APPROVE"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  WARNING: Could not parse verdict, defaulting to BLOCK" | tee -a "$LOG_FILE"
  VERDICT="BLOCK"
fi

# Extract issue counts
CRITICAL_COUNT=$(grep "CRITICAL_ISSUES:" "$REVIEW_OUTPUT" | grep -oE '[0-9]+' || echo "0")
HIGH_COUNT=$(grep "HIGH_ISSUES:" "$REVIEW_OUTPUT" | grep -oE '[0-9]+' || echo "0")
MEDIUM_COUNT=$(grep "MEDIUM_ISSUES:" "$REVIEW_OUTPUT" | grep -oE '[0-9]+' || echo "0")
LOW_COUNT=$(grep "LOW_ISSUES:" "$REVIEW_OUTPUT" | grep -oE '[0-9]+' || echo "0")

# Log results
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 📊 Architecture Review Results:" | tee -a "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')]    VERDICT: $VERDICT" | tee -a "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')]    🚨 CRITICAL: $CRITICAL_COUNT" | tee -a "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')]    ⚠️  HIGH: $HIGH_COUNT" | tee -a "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')]    📋 MEDIUM: $MEDIUM_COUNT" | tee -a "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')]    💡 LOW: $LOW_COUNT" | tee -a "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 📄 Full review: $REVIEW_OUTPUT" | tee -a "$LOG_FILE"

# Exit with status based on verdict
if [ "$VERDICT" = "BLOCK" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ Architecture review BLOCKED merge (CRITICAL issues found)" | tee -a "$LOG_FILE"

  # Trigger auto-remediation if enabled
  ENABLE_AUTO_REMEDIATION="${MERGE_ORCHESTRATOR_ENABLE_AUTO_REMEDIATION:-true}"
  if [ "$ENABLE_AUTO_REMEDIATION" = "true" ] && [ "$CRITICAL_COUNT" -gt 0 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🔧 Triggering auto-remediation for $CRITICAL_COUNT CRITICAL issues..." | tee -a "$LOG_FILE"
    if "$SCRIPT_DIR/merge-auto-remediate.sh" "$BRANCH" "$TIMESTAMP" "$LOG_FILE" "architecture" "$REVIEW_OUTPUT"; then
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Auto-remediation completed - branch will be retried on next run" | tee -a "$LOG_FILE"
    else
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  Auto-remediation failed or max attempts reached" | tee -a "$LOG_FILE"
    fi
  fi

  exit 1
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Architecture review APPROVED merge" | tee -a "$LOG_FILE"
  exit 0
fi
