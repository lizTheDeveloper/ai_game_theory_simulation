# Invisible Problems Audit Results

**Branch**: `claude/find-hidden-issues-017qVAowFRzgsieXRmaJXUDV`
**Date**: 2025-11-18
**Auditor**: Claude Code systematic codebase scan

## Executive Summary

Found **150+ violations** of documented standards in CLAUDE.md that don't cause immediate failures but create technical debt and mask bugs. The most critical issue is the incomplete migration to assertion utilities, creating the exact "split-brain" architecture that CLAUDE.md warns about.

---

## 🚨 CRITICAL: Silent Fallback Patterns in Simulation Code

**Status**: 35 files, ~50+ individual violations
**Priority**: CRITICAL
**Documentation**: CLAUDE.md "NaN and Invalid Value Handling" section

### The Problem

CLAUDE.md explicitly states:
> "CRITICAL: Never use silent fallback values for NaN/undefined in simulation calculations."
> "Partial migration to assertion utilities creates 'split-brain' error handling where some paths fail loudly while similar paths fail silently. This is worse than either pure approach."

The Oct 2025 ecology NaN bug was hidden by a `?? 50` fallback. Two CRITICAL regressions (dystopiaProgression.ts, aiSuffering.ts) were found where fixed code reverted to fallbacks.

### High-Priority Violations

#### 1. `src/simulation/updateNovelEntitiesBoundary.ts:73`
```typescript
const reduction = (tech.effects.novelEntitiesEmissionReduction ?? tech.effects.pollutionReduction ?? 0);
```
**Impact**: Missing tech effects silently produce wrong results
**Should be**: `assertStateProperty` to fail loudly

#### 2. `src/simulation/behavioralDetection.ts:162`
```typescript
const safeVal = trueVal ?? 0;
return assertFinite(Math.abs(safeVal - revealed), {...});
```
**Impact**: Fallback renders assertion pointless - always validates that 0 is finite
**Should be**: Remove fallback, let assertion catch actual undefined

#### 3. `src/simulation/engine/phases/IrreversibilityTrackingPhase.ts` (8 violations)
```typescript
const tempAnomaly = state.resourceEconomy?.co2?.temperatureAnomaly ?? 0;
assertFinite(tempAnomaly, {...});
```
**Impact**: Pattern appears 5+ times - assertion is useless, just validates 0
**Should be**: `assertStateProperty(state, 'resourceEconomy.co2.temperatureAnomaly', {...})`

#### 4. `src/simulation/utils/energyConstrainedCleanup.ts:95,162`
```typescript
const baseEffect = (tech.effects.novelEntitiesReduction ?? 0) * (tech.deploymentLevel ?? 0);
```
**Impact**: Silent fallback in cleanup effectiveness calculations

### Files With Multiple Violations

| File | Count | Type |
|------|-------|------|
| `IrreversibilityTrackingPhase.ts` | 8 | Temperature, pH, boundary access |
| `TransitionMortalityPhase.ts` | 5 | AI capability, cooperation, retraining |
| `consciousnessGovernanceUtils.ts` | 4 | Regional preparedness access |
| `organizationManagement.ts` | 3 | Workforce/budget multipliers |
| `techTree/effectsEngine.ts` | 4 | Effect aggregation |
| `updateNovelEntitiesBoundary.ts` | 2 | Tech effect calculations |
| `utils/energyConstrainedCleanup.ts` | 2 | Cleanup effectiveness |

### Complete List of Affected Files

35 files with ?? fallbacks:

- `src/simulation/utils/stateValidation.ts`
- `src/simulation/utils/energyConstrainedCleanup.ts`
- `src/simulation/techTree/effectsEngine.ts`
- `src/simulation/updateNovelEntitiesBoundary.ts`
- `src/simulation/techTree/deploymentTimescales.ts`
- `src/simulation/scenarios/apply.ts`
- `src/simulation/organizationManagement.ts`
- `src/simulation/llm/integration.ts`
- `src/simulation/nitrogenFoodCoupling.ts`
- `src/simulation/llm/client.ts`
- `src/simulation/engine/phases/TransitionMortalityPhase.ts`
- `src/simulation/engine/phases/ResourceSoilPhase.ts`
- `src/simulation/engine/phases/PlanetaryBoundariesPhase.ts`
- `src/simulation/engine/phases/IrreversibilityTrackingPhase.ts`
- `src/simulation/engine/phases/EvolutionarySelectionPhase.ts`
- `src/simulation/engine.ts`
- `src/simulation/endGame.ts`
- `src/simulation/alignmentDynamics.ts`
- `src/simulation/aiSuffering.ts` (REGRESSION - previously fixed)
- `src/simulation/behavioralDetection.ts`
- `src/simulation/catastrophicScenarios.ts`
- `src/simulation/engine/phases/AIAlignmentEvolutionPhase.ts`
- `src/simulation/engine/phases/AISufferingPhase.ts`
- `src/simulation/engine/phases/AlignmentDynamicsPhase.ts`
- `src/simulation/engine/phases/CriticalJuncturePhase.ts`
- `src/simulation/government/actions/environmentalActions.ts`
- `src/simulation/government/actions/internationalActions.ts`
- `src/simulation/government/actions/safetyActions.ts`
- `src/simulation/qualityOfLife/mortality.ts`
- `src/simulation/resentmentRecovery.ts`
- `src/simulation/techTree/engine.ts`
- `src/simulation/thresholds/config.ts`
- `src/simulation/utils/assertions.ts` (documentation only)
- `src/simulation/utils/consciousnessGovernanceUtils.ts`
- `src/simulation/utils/populationUnits.ts`

### Acceptable Uses (Not Violations)

Per CLAUDE.md, these are legitimate:
- `src/simulation/engine.ts:485-490` - Config initialization defaults ✅
- `src/simulation/llm/client.ts:443` - External API token estimation ✅
- `src/simulation/utils/stateValidation.ts:239-242` - Validation/display context ✅
- `src/simulation/techTree/engine.ts:275` - Progress initialization from map ✅

---

## ⚠️ HIGH: Defensive Fallbacks in Shell Scripts

**Status**: 100+ instances across 20+ scripts
**Priority**: HIGH
**Documentation**: CLAUDE.md "Defensive Programming Anti-Patterns"

CLAUDE.md explicitly states:
> "In bash/CI scripts, NEVER use silent fallbacks like `|| 0` or `|| echo ""`. These hide errors. If a required value is missing, the workflow should FAIL LOUDLY."

### Most Problematic Scripts

#### 1. `autonomous-worker.sh` (17 violations)
```bash
CLAUDE_VERSION=$(claude --version 2>&1 || echo "unknown")
COMMITS_MADE=$(git rev-list --count main..HEAD 2>/dev/null || echo "0")
```
**Impact**: Critical worker metrics silently default to wrong values

#### 2. `scripts/cleanup-disk-space.sh` (14 violations)
```bash
OLD_LOGS=$(find logs/ -name "*.log" -type f -mtime +30 2>/dev/null | wc -l || echo "0")
find logs/ -name "*.log" -type f -mtime +30 -delete 2>/dev/null || echo "Failed to delete some files"
```
**Impact**: Cleanup failures are silenced, disk issues undetected

#### 3. `scripts/daily-codebase-review.sh` (6 violations)
```bash
ARCH_CRITICAL=$(grep "CRITICAL_ISSUES:" "$ARCH_OUTPUT" | grep -oE '[0-9]+' || echo "0")
SYLVIA_CRITICAL=$(grep "CRITICAL_FINDINGS:" "$SYLVIA_OUTPUT" | grep -oE '[0-9]+' || echo "0")
```
**Impact**: Review failures report 0 issues instead of failing

#### Other Scripts with Violations
- `scripts/viewAutonomousRuns.sh` (11)
- `scripts/merge-orchestrator.sh` (11)
- `researcher-worker.sh` (10)
- `scripts/merge-gate-architecture.sh` (4)
- `scripts/merge-gate-sylvia.sh` (3)
- `scripts/setup-vm-cron.sh` (3)
- Many others...

**Pattern**: Most violations are `|| echo "0"` when parsing metrics - if parsing fails, silently reports 0 instead of alerting.

---

## ✅ GOOD: No Determinism Violations

**Confirmed clean:**
- ✅ Zero `Math.random()` usage in simulation code
- ✅ Zero optional RNG parameters (`rng?:`) - CRITICAL-3 fix from Nov 7 is holding
- ✅ Zero wrong population access patterns (`state.population` vs `state.humanPopulationSystem.population`)

The determinism fixes are working and being maintained.

---

## 📂 MEDIUM: /tmp Usage in Scripts

**Status**: 3 scripts use `/tmp/` instead of `/logs/`
**Priority**: MEDIUM
**Documentation**: CLAUDE.md "What NOT to Do #3"

CLAUDE.md says: "Don't save logs to `/tmp/` - use `/logs/` (tmp gets cleared)"

**Scripts:**
- `autonomous-worker.sh` - Task files, conflict resolution
- `researcher-worker.sh` - Task files, audit output
- `research/youtube-channels/auto-sync.sh` - Temporary metadata

**Note**: These are temporary working files (not permanent logs), so less critical.

---

## 🔍 MEDIUM: Deep Import Paths

**Status**: 4 files with `../../../` imports
**Priority**: MEDIUM

Could indicate import structure issues:
- `src/simulation/llm/client.ts`
- `src/simulation/engine/phases/HumanSurvivalSystemPhase.ts`
- `src/simulation/engine/phases/GovernmentResponsePhase.ts`
- `src/simulation/engine/phases/FamineSystemPhase.ts`

**Impact**: Makes refactoring harder, suggests module boundaries might need attention.

---

## 📝 MINOR: Intentionally Skipped Test

**Status**: 1 test with `.skip()`
**Priority**: LOW (acceptable)

- `tests/lib/gcsExport.test.ts:223` - Integration test requiring GCS credentials
- **Status**: ACCEPTABLE - Documented as intentional, requires external setup

---

## Recommended Actions

### Immediate (CRITICAL)
1. **Complete silent fallback migration** (CLAUDE.md estimates 2-3 day effort)
   - Prioritize the ~15 most problematic calculation fallbacks
   - Focus on IrreversibilityTrackingPhase.ts, behavioralDetection.ts, energyConstrainedCleanup.ts
2. **Add pre-commit hook** to prevent new `??` in `src/simulation/` (except documented exceptions)
3. **Assign to**: `simulation-maintainer` agent (has deep context on assertion utilities)

### Short-term (HIGH)
1. **Audit bash scripts** for required vs optional `||` fallbacks
   - Worker scripts are highest priority (autonomous-worker.sh, researcher-worker.sh)
   - Review/gate scripts next (daily-codebase-review.sh, merge-gate-*.sh)
2. **Document** which fallbacks are intentional vs which should fail loudly

### Long-term (MEDIUM)
1. **Standardize /tmp vs /logs** usage policy for working files
2. **Review import structure** to reduce deep paths (consider path aliases)
3. **Monitor** for regressions where assertion code reverts to fallbacks

---

## Historical Context

From `reviews/defensive_fallback_architecture_review_20251116.md`:
> "Partial migration creates 'split-brain' error handling... This is worse than either pure approach."

**Known regressions:**
- **dystopiaProgression.ts** - Fixed code reverted to fallbacks
- **aiSuffering.ts** - Fixed code reverted to fallbacks

**Root cause of Oct 2025 ecology NaN bug**: Hidden by `?? 50` fallback for months

---

## Next Steps

1. **Route to simulation-maintainer**: Complete fallback migration with full assertion context
2. **Create linter rule**: Block new `??` in simulation code (with documented exceptions)
3. **Audit bash scripts**: Distinguish required vs optional error handling
4. **Track regressions**: Why is fixed code reverting? Version control issue?

**Estimated effort**: 2-3 days for simulation code, 1 day for script audit
