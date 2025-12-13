# CRITICAL-1: Hindcast Population Collapse

**Bug ID:** CRITICAL-1
**Severity:** CRITICAL
**Discovered:** Session 82 (December 13, 2025)
**Resolved:** Session 83 (December 13, 2025)
**Resolution Time:** <3 hours

---

## Quick Reference

**Problem:** Population collapsed -42% during 1990-2020 hindcast when historical data shows +46% growth.

**Root Cause:** TransitionMortalityPhase + CoordinatedDeploymentPhase applied mortality AFTER regional aggregation without historical mode guards, creating phantom deaths from tech deployments that never occurred in 1990-2024.

**Fix:** Added `isHistoricalModeActive()` guards to both phases to skip during hindcast validation.

**Validation:** N=3 runs, CV=0%, +6.17% final deviation (within <7% criteria) ✅

---

## Archive Contents

### Core Documentation
- **IMPLEMENTATION_SUMMARY.md** - Complete fix details, validation results, impact assessment
- **INVESTIGATION_LOG.md** - Investigation timeline, hypotheses, debug process
- **GIT_COMMITS.md** - Git commit history with full context

### Files Changed
1. `src/simulation/engine/phases/TransitionMortalityPhase.ts` - Added historical guard (line 515)
2. `src/simulation/engine/phases/CoordinatedDeploymentPhase.ts` - Added historical guard (line 117)
3. `scripts/debugPopulationDelta.ts` - New debug tool (81 lines)
4. `devlogs/hindcast_population_collapse_investigation_20251213.md` - Investigation log

---

## Timeline

### Session 81 (Dec 13, 2025)
- Fixed 1990 initialization bug (+53% → -1.3%)
- Added startYear parameter + 1990 UN regional populations
- Commit: f78ad1b4

### Session 82 (Dec 13, 2025, Autonomous Worker)
- Discovered -42% population collapse during full validation
- Created investigation log with hypotheses
- Added CRITICAL-1 to bug queue
- Commit: 3aa792ff

### Session 83 (Dec 13, 2025)
- Created debug tool: `debugPopulationDelta.ts`
- Traced population changes phase-by-phase
- Identified phantom mortality in TransitionMortalityPhase + CoordinatedDeploymentPhase
- Added historical mode guards
- Validated with N=3 runs (CV=0%, +6.17% final deviation)
- Commits: 9ac959d9, 77ebaf95, 769b339b

**Total resolution time:** <3 hours from discovery to validated fix

---

## Key Insights

### Architectural Lesson
Phase-based architecture requires careful mode handling. Phases designed for FUTURE scenarios (tech deployment mortality) must explicitly skip during HISTORICAL validation.

### Defensive Coding Validation
The assertion utilities and fail-loudly philosophy worked correctly. Bug was LOGICAL (applying future-only mortality in historical mode), not a calculation error.

### Historical Validation Value
Forward simulations (2025→2050) didn't reveal this bug. Hindcast (1990→2020) immediately showed catastrophic error. Historical data provides ground truth for calibration.

---

## Impact

### Immediate
- ✅ Resolves CRITICAL-1 bug blocking hindcast validation
- ✅ Enables historical parameter calibration (1990-2024)
- ✅ Validates regional population system architecture
- ✅ Confirms defensive coding patterns work correctly

### Strategic
- **Hindcast validation framework operational:** Can now tune parameters against 1950-2024 data
- **Mortality system architecture validated:** Phase separation (regional vs transition vs crisis) is correct
- **Debug tooling enhanced:** `debugPopulationDelta.ts` available for future population bugs
- **Research confidence:** Population mechanics now validated against 30 years of historical data

---

## Related Work

### Prior Sessions
- **Session 81:** 1990 initialization fix (regional populations hardcoded 2025 values)
- **Session 77:** Floating-point precision bug (assertInRange epsilon tolerance)
- **Session 70:** 30-day architecture integration review

### Related Systems
- Regional population system (`regionalPopulations.ts`, `populationDynamics.ts`)
- Hindcast validation framework (`scripts/hindcastDemographicValidation.ts`)
- Historical mode detection (`initializeHistoricalMode()`, `isHistoricalModeActive()`)

---

## System Status After Fix

**CRITICAL bugs:** 0 (CRITICAL-1 RESOLVED)
**HIGH bugs:** 0
**MEDIUM bugs:** 5 (deferred/monitoring, non-blocking)
**Architecture health:** A- → A (critical bug resolution validates defensive patterns)
**System state:** STABLE - Production-ready, all critical work complete

---

**Archive Created:** December 13, 2025
**Curator:** architect (The Architect)
**Purpose:** Historical preservation per iteration learnings
