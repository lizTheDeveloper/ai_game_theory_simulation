#!/bin/bash
# Research Skeptic (Sylvia) Quality Gate
# Final review before merge: check for bugs, regressions, defensive coding violations

set -e

BRANCH=$1
TIMESTAMP=$2
LOG_FILE=$3

if [ -z "$BRANCH" ] || [ -z "$TIMESTAMP" ] || [ -z "$LOG_FILE" ]; then
  echo "Usage: $0 <branch_name> <timestamp> <log_file>"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REVIEW_OUTPUT="$PROJECT_ROOT/logs/merge_orchestrator/sylvia_review_${BRANCH}_${TIMESTAMP}.txt"

cd "$PROJECT_ROOT"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🔬 Spawning research-skeptic (Sylvia) agent..." | tee -a "$LOG_FILE"

# Create prompt for research-skeptic (Sylvia)
PROMPT="Final review of merge branch merge/${BRANCH}_${TIMESTAMP} before merging to main.

## Quality Gate: Sylvia Final Review

**Task:** As the research skeptic (Sylvia), perform a final critical review of this merge branch.

**Review Focus:**
1. **Bug Detection:**
   - New bugs introduced
   - Edge cases not handled
   - Logic errors
   - Type safety issues

2. **Regression Prevention:**
   - Breaking changes to existing functionality
   - Test failures introduced
   - Performance regressions
   - API changes without updates

3. **Defensive Coding Violations:**
   - Silent fallbacks (e.g., \`?? defaultValue\` in calculations)
   - NaN/undefined handling without assertions
   - Missing error detection
   - Fallback patterns that hide bugs

4. **Research Integrity (if research-related):**
   - Citation accuracy
   - Parameter justification
   - Source quality
   - Methodological soundness

5. **Simulation Standards (if simulation code):**
   - Deterministic RNG usage (no Math.random())
   - Emoji convention compliance
   - Assertion utility usage
   - Phase-based architecture compliance

**Decision Criteria:**
- BLOCK if any critical bugs, regressions, or defensive anti-patterns found
- APPROVE if changes are sound, tested, and follow project standards

**Output Format:**
Provide specific findings with file locations and recommendations.

End your review with:
VERDICT: [APPROVE|BLOCK]
REASON: [brief explanation]
CRITICAL_FINDINGS: [count]
RECOMMENDATIONS: [brief summary]
"

# Spawn research-skeptic (Sylvia) agent (uses Opus per agent config)
claude --dangerously-skip-permissions \
  --model sonnet \
  --print "$PROMPT" > "$REVIEW_OUTPUT" 2>&1

# Parse verdict from output
if grep -q "VERDICT: BLOCK" "$REVIEW_OUTPUT"; then
  VERDICT="BLOCK"
  REASON=$(grep "REASON:" "$REVIEW_OUTPUT" | sed 's/REASON: //' || echo "Unknown")
elif grep -q "VERDICT: APPROVE" "$REVIEW_OUTPUT"; then
  VERDICT="APPROVE"
  REASON=$(grep "REASON:" "$REVIEW_OUTPUT" | sed 's/REASON: //' || echo "No critical issues")
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  WARNING: Could not parse verdict, defaulting to BLOCK" | tee -a "$LOG_FILE"
  VERDICT="BLOCK"
  REASON="Could not parse review output"
fi

# Extract findings count
CRITICAL_FINDINGS=$(grep "CRITICAL_FINDINGS:" "$REVIEW_OUTPUT" | grep -oE '[0-9]+' || echo "0")

# Log results
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 📊 Sylvia Review Results:" | tee -a "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')]    VERDICT: $VERDICT" | tee -a "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')]    REASON: $REASON" | tee -a "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')]    🚨 CRITICAL FINDINGS: $CRITICAL_FINDINGS" | tee -a "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 📄 Full review: $REVIEW_OUTPUT" | tee -a "$LOG_FILE"

# Exit with status based on verdict
if [ "$VERDICT" = "BLOCK" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ Sylvia review BLOCKED merge: $REASON" | tee -a "$LOG_FILE"

  # Trigger auto-remediation if enabled
  ENABLE_AUTO_REMEDIATION="${MERGE_ORCHESTRATOR_ENABLE_AUTO_REMEDIATION:-true}"
  if [ "$ENABLE_AUTO_REMEDIATION" = "true" ] && [ "$CRITICAL_FINDINGS" -gt 0 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🔧 Triggering auto-remediation for $CRITICAL_FINDINGS CRITICAL findings..." | tee -a "$LOG_FILE"
    if "$SCRIPT_DIR/merge-auto-remediate.sh" "$BRANCH" "$TIMESTAMP" "$LOG_FILE" "sylvia" "$REVIEW_OUTPUT"; then
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Auto-remediation completed - branch will be retried on next run" | tee -a "$LOG_FILE"
    else
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  Auto-remediation failed or max attempts reached" | tee -a "$LOG_FILE"
    fi
  fi

  exit 1
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Sylvia review APPROVED merge" | tee -a "$LOG_FILE"
  exit 0
fi
