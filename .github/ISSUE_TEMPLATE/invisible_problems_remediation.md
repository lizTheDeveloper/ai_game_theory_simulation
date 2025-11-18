---
name: 🔍 Invisible Problems Remediation
about: Track remediation of silent fallbacks and anti-patterns found in audit
title: "🔍 Invisible Problems: Silent Fallbacks Migration"
labels: technical-debt, critical, simulation-maintainer
assignees: ''
---

# Invisible Problems Remediation Tracking

**Audit Document**: `reviews/invisible_problems_audit_20251118.md`
**Branch**: `claude/find-hidden-issues-017qVAowFRzgsieXRmaJXUDV`
**Estimated Effort**: 3-4 days total

## 🚨 CRITICAL: Silent Fallback Patterns (2-3 days)

**Assignee**: @simulation-maintainer agent
**Priority**: CRITICAL
**Impact**: Research simulation producing wrong results silently

### High-Priority Files (Fix These First)

- [ ] `src/simulation/behavioralDetection.ts:162` - Fallback renders assertFinite useless
- [ ] `src/simulation/engine/phases/IrreversibilityTrackingPhase.ts` - 8 violations of fallback → assertion
- [ ] `src/simulation/utils/energyConstrainedCleanup.ts:95,162` - Silent cleanup effectiveness fallbacks
- [ ] `src/simulation/updateNovelEntitiesBoundary.ts:73` - Tech effects fallback chain

### Medium-Priority Files

- [ ] `src/simulation/engine/phases/TransitionMortalityPhase.ts` - 5 violations
- [ ] `src/simulation/utils/consciousnessGovernanceUtils.ts` - 4 violations
- [ ] `src/simulation/organizationManagement.ts` - 3 violations
- [ ] `src/simulation/techTree/effectsEngine.ts` - 4 violations

### Regression Investigation

- [ ] **INVESTIGATE**: Why did `aiSuffering.ts` revert from assertions to fallbacks?
- [ ] **INVESTIGATE**: Version control issue? Multiple branches overwriting fixes?

### Prevention

- [ ] Create pre-commit hook blocking new `??` in `src/simulation/` (with exceptions list)
- [ ] Document acceptable `??` patterns in CLAUDE.md
- [ ] Add linter rule to catch violations

## ⚠️ HIGH: Defensive Script Fallbacks (1 day)

**Priority**: HIGH
**Impact**: Hidden failures in automation

### Critical Scripts

- [ ] `autonomous-worker.sh` - 17 violations, audit worker metrics logic
- [ ] `researcher-worker.sh` - 10 violations, audit research worker logic
- [ ] `scripts/cleanup-disk-space.sh` - 14 violations, audit cleanup error handling
- [ ] `scripts/daily-codebase-review.sh` - 6 violations, audit review parsing

### Strategy

1. Distinguish **required** (should fail) vs **optional** (fallback OK) error handling
2. Document which `|| echo` patterns are intentional
3. Refactor critical paths to fail loudly

## 📂 MEDIUM: /tmp Usage (0.5 days)

**Priority**: MEDIUM

- [ ] `autonomous-worker.sh` - Move task files to `/logs/tasks/`
- [ ] `researcher-worker.sh` - Move task files to `/logs/tasks/`
- [ ] `research/youtube-channels/auto-sync.sh` - Evaluate if metadata needs persistence

## 🔍 MEDIUM: Deep Import Paths (0.5 days)

**Priority**: MEDIUM

- [ ] `src/simulation/llm/client.ts` - Review import structure
- [ ] `src/simulation/engine/phases/HumanSurvivalSystemPhase.ts` - Consider path aliases
- [ ] `src/simulation/engine/phases/GovernmentResponsePhase.ts` - Consider path aliases
- [ ] `src/simulation/engine/phases/FamineSystemPhase.ts` - Consider path aliases

## Acceptance Criteria

### For Silent Fallbacks
- [ ] All CRITICAL files use assertions instead of `??` fallbacks
- [ ] Pre-commit hook blocks new violations
- [ ] Monte Carlo runs show no behavior changes (CV < 0.01% on same seeds)
- [ ] Documentation updated with acceptable exceptions list

### For Script Fallbacks
- [ ] Critical worker scripts fail loudly on required value errors
- [ ] Optional fallbacks are documented as intentional
- [ ] No silent metric failures in review/monitoring scripts

### For /tmp Usage
- [ ] All permanent logs go to `/logs/`
- [ ] Temporary working files policy documented

## Testing Strategy

1. **Before changes**: Run Monte Carlo baseline (N=10, record distributions)
2. **After each file fix**: Run unit tests + god mode test
3. **After all changes**: Run Monte Carlo validation (same seeds, CV < 0.01%)
4. **Script testing**: Inject failures, verify loud failure vs silent fallback

## References

- **CLAUDE.md**: "NaN and Invalid Value Handling" section
- **CLAUDE.md**: "Defensive Programming Anti-Patterns" section
- **Historical context**: `reviews/defensive_fallback_architecture_review_20251116.md`
- **Root cause analysis**: Oct 2025 ecology NaN bug (hidden by `?? 50` for months)

## Notes

> "Partial migration creates 'split-brain' error handling where some paths fail loudly while similar paths fail silently. This is worse than either pure approach."
> — `reviews/defensive_fallback_architecture_review_20251116.md`

**Known regressions**: dystopiaProgression.ts, aiSuffering.ts - need to investigate why fixes reverted.
