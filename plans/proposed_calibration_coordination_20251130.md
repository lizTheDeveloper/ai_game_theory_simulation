# Calibration Coordination Protocol

**Date:** November 30, 2025
**Status:** Proposed
**Priority:** MEDIUM (prevents divergence, improves research integrity)
**Effort:** 2-3 hours (documentation + workflow updates)

## Problem Statement

Session 21 architecture review discovered calibration divergence in `oceanAcidification.ts`:
- Two competing calibration approaches existed simultaneously
- "Updated upstream" (70% reduction, pH=8.0) vs "Stashed changes" (50% reduction, pH=7.95)
- Suggests multiple autonomous workers calibrating same parameters independently

**Impact:**
- Wasted effort (duplicate calibration work)
- Research inconsistency (which calibration is "correct"?)
- Merge conflicts requiring manual resolution
- Loss of calibration rationale (which research backing applies?)

## Root Cause

**Multi-worker git architecture enables parallel work, but lacks coordination for calibration:**
- Multiple workers can independently decide to "improve calibration"
- No central registry of "who owns what calibration"
- No mechanism to detect conflicting calibration efforts
- No protocol for resolving calibration disagreements

## Proposed Solution

### 1. Calibration Ownership Registry

**File:** `docs/CALIBRATION_OWNERSHIP.md`

```markdown
# Calibration Ownership Registry

This file tracks which parameter calibrations are actively being worked on to prevent conflicts.

## Active Calibrations

| Parameter | File | Owner | Status | Started | Research Backing |
|-----------|------|-------|--------|---------|------------------|
| Ocean pH decline | oceanAcidification.ts | [none] | STABLE | Nov 28 | IPCC AR6 WG1 Ch5 |

## Calibration Protocol

Before modifying any calibration:
1. Check this file for active work
2. If STABLE, claim ownership by updating table
3. Document research backing
4. Complete calibration and return to STABLE state
5. Update wiki with final values and justification

## Recently Completed

| Parameter | Date | Final Value | Research | Commit |
|-----------|------|-------------|----------|--------|
| Ocean pH decline rate | Nov 28 | 70% reduction | IPCC AR6 | [commit-hash] |
```

### 2. Pre-Calibration Check in Autonomous Worker

**Update worker scripts to check ownership before calibration work:**

```bash
# Before starting calibration work
grep -i "ocean.*pH.*ACTIVE" docs/CALIBRATION_OWNERSHIP.md
if [ $? -eq 0 ]; then
  echo "⚠️ Warning: Ocean pH calibration already in progress"
  echo "See docs/CALIBRATION_OWNERSHIP.md for ownership"
  exit 1
fi
```

### 3. Calibration Documentation Template

**File:** `research/calibration_template.md`

```markdown
# [Parameter Name] Calibration - [Date]

## Motivation
Why this calibration is needed (hindcast error, Monte Carlo anomaly, research update)

## Research Backing
- Source 1: [citation] - [key finding]
- Source 2: [citation] - [key finding]

## Current Value
- Value: [current]
- Source: [where it came from]
- Date: [when it was set]

## Proposed Value
- Value: [proposed]
- Justification: [why this value]
- Uncertainty: [range or confidence]

## Validation
- Hindcast performance: [metric]
- Monte Carlo impact: [N runs]
- Peer review: [who validated]

## Implementation
- Files modified: [list]
- Commits: [hashes]
- Tests updated: [list]
```

## Benefits

1. **Prevent duplicate work** - Workers see calibration is in progress
2. **Research traceability** - Know why each value was chosen
3. **Conflict resolution** - Clear ownership when disagreements arise
4. **Knowledge preservation** - Calibration rationale persists beyond git commits

## Implementation Steps

1. Create `docs/CALIBRATION_OWNERSHIP.md` with current stable calibrations (30 min)
2. Create `research/calibration_template.md` (15 min)
3. Update autonomous worker scripts to check ownership (30 min)
4. Document protocol in `docs/DEVELOPMENT_WORKFLOW.md` (30 min)
5. Backfill ocean pH calibration rationale (45 min)

## Alternative Approaches

1. **Git branch strategy** - Separate branches for calibration work
   - Pros: Git-native coordination
   - Cons: Merge overhead, harder to track "who's working on what"

2. **Message-based coordination** - Post to coordination channel before calibration
   - Pros: Real-time visibility
   - Cons: Requires monitoring channels, messages scroll away

3. **Centralized calibration ownership** - Single "calibration czar" agent
   - Pros: No conflicts possible
   - Cons: Bottleneck, slows parallel work

## Success Criteria

1. Zero calibration conflicts in next 30 days
2. All calibrations have documented research backing
3. Workers successfully coordinate via ownership registry
4. Calibration rationale survives in git history

## Research Backing

This is workflow engineering, not scientific modeling. Best practices:
- Configuration management (IT infrastructure)
- Concurrent version control (software engineering)
- Scientific reproducibility (research methods)

## Related Work

- **Session 21:** Ocean pH calibration divergence discovered
- **HIGH-3:** VM multi-worker infrastructure
- **DevOps:** Multi-worker git architecture
- **Research integrity:** Parameter justification (Grade A-)

## Notes

**Why MEDIUM priority:**
- Prevents future wasted effort
- Improves research quality/traceability
- Not urgent (only 1 conflict discovered so far)
- Blocks parallel calibration improvements until resolved

**When to implement:**
- After current roadmap clear (all CRITICAL/HIGH complete)
- Before next major calibration effort
- When research quality is prioritized over feature velocity
