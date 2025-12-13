# CRITICAL-1 Git Commit History

## Primary Fix Commit

**Commit:** 9ac959d98eeb92e87ef6bdfc7aeb9d780d707042
**Author:** SATU Worker (orchestrator)
**Date:** December 13, 2025 02:10 UTC
**Session:** 83

### Commit Message
```
fix: CRITICAL-1 hindcast population collapse (-42% → +6% deviation)

Root cause: TransitionMortalityPhase and CoordinatedDeploymentPhase applying
mortality in historical mode when regional populations already include deaths.

Architecture mismatch:
- Regional populations correctly applied deaths (births - deaths in historical)
- After aggregation, TWO phases subtracted ADDITIONAL deaths from global
- Created phantom mortality that never occurred in 1990-2024

Fix: Add isHistoricalModeActive() guards to skip both phases in hindcast.
Historical demographic data (UN CDR) already includes all mortality sources.

Validation (N=3, CV=0%):
- Before: 2020 = 4.508B (-42% from 1990) ❌
- After: 2020 = 8.276B (+6.17% vs UN target) ✅
- Progression: -1.3% → 0% → +1.7% → +3.3% → +4.5% → +5.4% → +6.2%

Files:
- TransitionMortalityPhase.ts: Skip in historical mode (line 515)
- CoordinatedDeploymentPhase.ts: Skip in historical mode (line 117)
- devlogs/: Document root cause and resolution
- scripts/: Add debugPopulationDelta.ts debug tool
```

### Files Changed
```
devlogs/hindcast_population_collapse_investigation_20251213.md | 65 ++++++
scripts/debugPopulationDelta.ts                                | 81 +++++++
src/simulation/engine/phases/CoordinatedDeploymentPhase.ts     | 10 +
src/simulation/engine/phases/TransitionMortalityPhase.ts       | 10 +
4 files changed, 164 insertions(+), 2 deletions(-)
```

---

## Documentation Commits

### Bug Queue Update
**Commit:** 77ebaf95
**Message:** docs: Mark CRITICAL-1 as RESOLVED in bug queue
**File:** `openspec/specs/bugs/critical-queue.md`

### Project Spec Update
**Commit:** 769b339b
**Message:** docs: Update project spec with Session 83 summary
**File:** `openspec/specs/project/spec.md`

---

## Related Commits (Investigation Context)

### Session 81 - 1990 Initialization Fix
**Commit:** f78ad1b4
**Message:** fix: Hindcast 1990 population initialization bug
**Context:** Fixed +53% overshoot in 1990 initialization (regional init hardcoded 2025 values)

### Session 82 - Bug Discovery
**Commit:** 3aa792ff
**Message:** feat: Add CRITICAL-1 to bug queue - Hindcast population collapse
**Context:** Autonomous worker discovered -42% population collapse during validation

---

## Code Changes Detail

### TransitionMortalityPhase.ts (line 515)
```typescript
// Skip transition mortality during historical validation
if (isHistoricalModeActive(state)) {
  return { events: [] };
}
```

### CoordinatedDeploymentPhase.ts (line 117)
```typescript
// Skip AI deployment mortality during historical validation
if (isHistoricalModeActive(state)) {
  return { events: [] };
}
```

### New Debug Tool: debugPopulationDelta.ts
- 81 lines of diagnostic code
- Traces population changes month-by-month
- Shows births, deaths, net change with phase attribution
- Essential for future population debugging

---

## Validation Results (Git Log Evidence)

**Validation runs:** N=3, seed=1
**Coefficient of variation:** 0.000000% (perfect determinism)
**Final deviation:** +6.17% (within <7% success criteria)

**Evidence:**
- Commit message includes validation progression
- Investigation log updated with resolution section
- Bug queue marked RESOLVED with validation data
- Project spec updated with Session 83 completion
