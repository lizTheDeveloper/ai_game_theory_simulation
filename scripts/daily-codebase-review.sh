#!/bin/bash
# Daily Codebase Review - One Architecture + One Skeptical Review per day
# Cost-optimized: 2 Opus calls per day instead of per-branch

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR="$PROJECT_ROOT/logs/daily_reviews"
LOG_FILE="$LOG_DIR/daily_review_${TIMESTAMP}.log"

mkdir -p "$LOG_DIR"

cd "$PROJECT_ROOT"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

log_section() {
  echo "" | tee -a "$LOG_FILE"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"
  log "$1"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"
}

log_section "🔍 Daily Codebase Review - ${TIMESTAMP}"
log "Review type: Architecture + Research Skeptic (Opus)"
log "Scope: Changes in last 24 hours + overall codebase health"

# Get changes from last 24 hours
SINCE_DATE=$(date -u -d '24 hours ago' '+%Y-%m-%d %H:%M:%S')
RECENT_COMMITS=$(git log --since="$SINCE_DATE" --pretty=format:"%h - %s (%an)" --no-merges)
CHANGED_FILES=$(git log --since="$SINCE_DATE" --name-only --pretty=format:"" --no-merges | sort -u | grep -v '^$')

log "Changes since $SINCE_DATE:"
if [ -z "$RECENT_COMMITS" ]; then
  log "  No commits in last 24 hours"
else
  echo "$RECENT_COMMITS" | tee -a "$LOG_FILE"
fi

# ============================================
# Architecture Review (Opus)
# ============================================

log_section "Architecture Review (Opus)"

ARCH_OUTPUT="$LOG_DIR/architecture_${TIMESTAMP}.txt"

ARCH_PROMPT="Daily architecture review of the codebase.

## Context
Repository: AI Game Theory Simulation
Review date: $(date -u)
Changes in last 24 hours:
\`\`\`
$RECENT_COMMITS
\`\`\`

Changed files:
\`\`\`
$CHANGED_FILES
\`\`\`

## Your Task (Architecture-Skeptic)
Perform a high-level architecture review focusing on:

1. **Performance Issues:**
   - O(n²) or worse algorithms in changed files
   - Deep cloning in hot paths
   - Unnecessary iterations
   - Memory leaks

2. **State Propagation:**
   - Circular dependencies
   - Silent fallbacks (defensive anti-patterns)
   - NaN/undefined handling issues
   - State mutation safety

3. **Complexity Creep:**
   - Over-engineering
   - Unnecessary abstractions
   - Code duplication
   - Maintainability issues

4. **Recent Changes Impact:**
   - Breaking changes introduced
   - Integration issues with existing systems
   - Phase ordering problems (simulation-specific)

## Output Format:
Provide:
- Summary of changes reviewed
- CRITICAL issues (must fix)
- HIGH priority recommendations
- MEDIUM concerns
- Overall health assessment

Focus on systemic issues, not nitpicks. This is a daily health check, not a per-PR review.

End with:
CRITICAL_ISSUES: [count]
HIGH_ISSUES: [count]
OVERALL_HEALTH: [GOOD|FAIR|POOR|CRITICAL]
"

log "Spawning architecture-skeptic agent (Opus)..."
claude --dangerously-skip-permissions \
  --model opus \
  --print "$ARCH_PROMPT" > "$ARCH_OUTPUT" 2>&1

# Parse results
ARCH_CRITICAL=$(grep "CRITICAL_ISSUES:" "$ARCH_OUTPUT" | grep -oE '[0-9]+' || echo "0")
ARCH_HIGH=$(grep "HIGH_ISSUES:" "$ARCH_OUTPUT" | grep -oE '[0-9]+' || echo "0")
ARCH_HEALTH=$(grep "OVERALL_HEALTH:" "$ARCH_OUTPUT" | awk '{print $2}' || echo "UNKNOWN")

log "Architecture Review Results:"
log "  🚨 CRITICAL: $ARCH_CRITICAL"
log "  ⚠️  HIGH: $ARCH_HIGH"
log "  📊 Health: $ARCH_HEALTH"
log "  📄 Full report: $ARCH_OUTPUT"

# ============================================
# Research Skeptic Review (Opus)
# ============================================

log_section "Research Skeptic Review (Sylvia - Opus)"

SYLVIA_OUTPUT="$LOG_DIR/sylvia_${TIMESTAMP}.txt"

SYLVIA_PROMPT="Daily research skeptic review of the codebase.

## Context
Repository: AI Game Theory Simulation
Review date: $(date -u)
Changes in last 24 hours:
\`\`\`
$RECENT_COMMITS
\`\`\`

Changed files:
\`\`\`
$CHANGED_FILES
\`\`\`

## Your Task (Research Skeptic - Sylvia)
Perform a critical review focusing on:

1. **Code Quality:**
   - Bugs introduced in recent changes
   - Potential regressions
   - Edge cases not handled
   - Type safety issues

2. **Defensive Coding Violations:**
   - Silent fallbacks in calculations (e.g., \`?? defaultValue\`)
   - Missing error detection
   - NaN/undefined handling without assertions
   - Math.random() usage (should use deterministic RNG)

3. **Research Integrity (if applicable):**
   - Citation accuracy in recent changes
   - Parameter justification
   - Source quality
   - Methodological soundness

4. **Simulation Standards:**
   - Emoji convention compliance
   - Assertion utility usage
   - Phase-based architecture adherence
   - Deterministic behavior

## Output Format:
Provide:
- Summary of quality concerns
- CRITICAL findings (must address)
- Regression risks
- Defensive anti-patterns detected
- Research integrity issues

This is a daily health check for code quality and research standards.

End with:
CRITICAL_FINDINGS: [count]
REGRESSIONS_DETECTED: [count]
RESEARCH_INTEGRITY: [GOOD|CONCERNS|ISSUES]
"

log "Spawning research-skeptic agent (Sylvia - Opus)..."
claude --dangerously-skip-permissions \
  --model opus \
  --print "$SYLVIA_PROMPT" > "$SYLVIA_OUTPUT" 2>&1

# Parse results
SYLVIA_CRITICAL=$(grep "CRITICAL_FINDINGS:" "$SYLVIA_OUTPUT" | grep -oE '[0-9]+' || echo "0")
SYLVIA_REGRESSIONS=$(grep "REGRESSIONS_DETECTED:" "$SYLVIA_OUTPUT" | grep -oE '[0-9]+' || echo "0")
SYLVIA_RESEARCH=$(grep "RESEARCH_INTEGRITY:" "$SYLVIA_OUTPUT" | awk '{print $2}' || echo "UNKNOWN")

log "Research Skeptic Results:"
log "  🚨 CRITICAL: $SYLVIA_CRITICAL"
log "  ⚠️  REGRESSIONS: $SYLVIA_REGRESSIONS"
log "  📚 Research: $SYLVIA_RESEARCH"
log "  📄 Full report: $SYLVIA_OUTPUT"

# ============================================
# Summary
# ============================================

log_section "Daily Review Summary"

TOTAL_CRITICAL=$((ARCH_CRITICAL + SYLVIA_CRITICAL))

log "Architecture Health: $ARCH_HEALTH"
log "Research Integrity: $SYLVIA_RESEARCH"
log "Total CRITICAL issues: $TOTAL_CRITICAL"

if [ "$TOTAL_CRITICAL" -gt 0 ]; then
  log "⚠️  ACTION REQUIRED: $TOTAL_CRITICAL CRITICAL issues need attention"
  log "📋 Review reports:"
  log "   - Architecture: $ARCH_OUTPUT"
  log "   - Research: $SYLVIA_OUTPUT"
else
  log "✅ No CRITICAL issues detected in daily review"
fi

log_section "✅ Daily Review Complete"
log "Log file: $LOG_FILE"
