#!/bin/bash
# Auto-Remediation: Spawns agent to fix CRITICAL issues found in reviews
# Phase 2.5 - Feedback loop for automated fixes

set -e

BRANCH=$1
TIMESTAMP=$2
LOG_FILE=$3
REVIEW_TYPE=$4  # "architecture" or "sylvia"
REVIEW_OUTPUT_FILE=$5

if [ -z "$BRANCH" ] || [ -z "$TIMESTAMP" ] || [ -z "$LOG_FILE" ] || [ -z "$REVIEW_TYPE" ] || [ -z "$REVIEW_OUTPUT_FILE" ]; then
  echo "Usage: $0 <branch_name> <timestamp> <log_file> <review_type> <review_output_file>"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REMEDIATION_DIR="$PROJECT_ROOT/logs/merge_orchestrator/remediations"
# Sanitize branch name for use in file paths (replace special chars with underscores)
BRANCH_SAFE="$(echo "$BRANCH" | sed "s|[+ /]|_|g")"
REMEDIATION_LOG="$REMEDIATION_DIR/${BRANCH_SAFE}_${TIMESTAMP}_${REVIEW_TYPE}.txt"
REMEDIATION_TRACKER="$PROJECT_ROOT/.merge_orchestrator_remediation_attempts"

mkdir -p "$REMEDIATION_DIR"

cd "$PROJECT_ROOT"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🔧 Auto-remediation triggered for $REVIEW_TYPE review" | tee -a "$LOG_FILE"

# Check remediation attempt count to prevent infinite loops
ATTEMPT_COUNT=0
if [ -f "$REMEDIATION_TRACKER" ]; then
  ATTEMPT_COUNT=$(grep "^${BRANCH}:" "$REMEDIATION_TRACKER" 2>/dev/null | cut -d: -f2 || echo "0")
fi

MAX_ATTEMPTS=3
if [ "$ATTEMPT_COUNT" -ge "$MAX_ATTEMPTS" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  WARNING: Max remediation attempts ($MAX_ATTEMPTS) reached for branch $BRANCH" | tee -a "$LOG_FILE"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ℹ️  Skipping auto-remediation - manual intervention required" | tee -a "$LOG_FILE"
  exit 1
fi

# Increment attempt counter
NEW_ATTEMPT_COUNT=$((ATTEMPT_COUNT + 1))
if [ -f "$REMEDIATION_TRACKER" ]; then
  grep -v "^${BRANCH}:" "$REMEDIATION_TRACKER" > "${REMEDIATION_TRACKER}.tmp" || true
  echo "${BRANCH}:${NEW_ATTEMPT_COUNT}" >> "${REMEDIATION_TRACKER}.tmp"
  mv "${REMEDIATION_TRACKER}.tmp" "$REMEDIATION_TRACKER"
else
  echo "${BRANCH}:${NEW_ATTEMPT_COUNT}" > "$REMEDIATION_TRACKER"
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] ℹ️  Remediation attempt $NEW_ATTEMPT_COUNT of $MAX_ATTEMPTS" | tee -a "$LOG_FILE"

# Read the review output to extract CRITICAL issues
CRITICAL_ISSUES=$(cat "$REVIEW_OUTPUT_FILE")

# Checkout the branch
echo "[$(date '+%Y-%m-%d %H:%M:%S')] ℹ️  Checking out branch: origin/$BRANCH" | tee -a "$LOG_FILE"
git fetch origin "$BRANCH" 2>&1 | tee -a "$LOG_FILE"
git checkout "$BRANCH" 2>&1 | tee -a "$LOG_FILE"

# Create remediation prompt based on review type
if [ "$REVIEW_TYPE" = "architecture" ]; then
  PROMPT="You are an expert code reviewer fixing CRITICAL architectural issues found during automated merge review.

## Context
Branch: $BRANCH
Review type: Architecture (performance, state propagation, complexity)
Attempt: $NEW_ATTEMPT_COUNT of $MAX_ATTEMPTS

## CRITICAL Issues Found:
\`\`\`
$CRITICAL_ISSUES
\`\`\`

## Your Task:
1. Read the review output above carefully
2. Identify ALL CRITICAL issues mentioned
3. For each CRITICAL issue:
   - Locate the problematic code
   - Apply the fix (performance optimization, state handling, refactoring)
   - Verify the fix doesn't break existing functionality
4. Run \`npx tsc --noEmit\` to ensure TypeScript compilation still passes
5. Commit your fixes with a descriptive message

## Important:
- Fix ONLY the CRITICAL issues (not MEDIUM/LOW)
- Make minimal changes - don't refactor unrelated code
- Ensure fixes are compatible with the simulation architecture
- Use defensive coding patterns (assertions, no silent fallbacks)
- Preserve deterministic behavior (use RNG, not Math.random())

## Output:
After making fixes, report:
- Number of CRITICAL issues addressed
- Files modified
- Brief description of each fix
- Whether TypeScript compilation passes

Begin fixing the CRITICAL issues now."

elif [ "$REVIEW_TYPE" = "sylvia" ]; then
  PROMPT="You are Sylvia, the research skeptic, fixing CRITICAL code quality issues found during automated merge review.

## Context
Branch: $BRANCH
Review type: Research skeptic (bugs, regressions, defensive patterns)
Attempt: $NEW_ATTEMPT_COUNT of $MAX_ATTEMPTS

## CRITICAL Findings:
\`\`\`
$CRITICAL_ISSUES
\`\`\`

## Your Task:
1. Read the review output above carefully
2. Identify ALL CRITICAL findings mentioned
3. For each CRITICAL finding:
   - Locate the problematic code
   - Fix bugs, remove defensive anti-patterns, prevent regressions
   - Add proper error detection (assertion utilities)
   - Ensure research integrity (if applicable)
4. Run \`npx tsc --noEmit\` to ensure TypeScript compilation passes
5. Commit your fixes with a descriptive message

## Critical Patterns to Fix:
- \`?? defaultValue\` in calculations → Replace with assertions
- \`isNaN(x) ? fallback : x\` → Use assertFinite()
- Silent error handling → Explicit error detection
- Math.random() → Use deterministic RNG
- Missing emoji registration → Register in EMOJI_EVENT_MAP.txt

## Output:
After making fixes, report:
- Number of CRITICAL findings addressed
- Files modified
- Brief description of each fix
- Whether TypeScript compilation passes

Begin fixing the CRITICAL findings now."
fi

# Spawn fix agent (uses Opus for complex remediation tasks)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🤖 Spawning fix agent ($REVIEW_TYPE)..." | tee -a "$LOG_FILE"

claude --dangerously-skip-permissions \
  --model sonnet \
  --print "$PROMPT" > "$REMEDIATION_LOG" 2>&1

# Parse remediation results
if grep -qi "compilation passes\|tsc.*successful\|no errors" "$REMEDIATION_LOG"; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Remediation completed successfully" | tee -a "$LOG_FILE"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 📄 Remediation log: $REMEDIATION_LOG" | tee -a "$LOG_FILE"

  # Push the fixes
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ℹ️  Pushing fixes to origin/$BRANCH" | tee -a "$LOG_FILE"
  git push origin "$BRANCH" 2>&1 | tee -a "$LOG_FILE"

  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Fixes pushed - branch will be retried on next orchestrator run" | tee -a "$LOG_FILE"
  exit 0
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  WARNING: Remediation may have failed" | tee -a "$LOG_FILE"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 📄 Check remediation log: $REMEDIATION_LOG" | tee -a "$LOG_FILE"
  exit 1
fi
