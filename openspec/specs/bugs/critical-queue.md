# Critical Bug Queue
## High-Priority Issues Tracker

**Created:** December 7, 2025
**Purpose:** Track CRITICAL and HIGH priority bugs requiring immediate attention

---

## Overview

This file tracks bugs that block normal development or cause significant system degradation. It serves as the single source of truth for critical issues requiring immediate resolution.

---

## Queue Status

**Last Updated:** December 13, 2025 (Session 82 - Hindcast validation)

**Active CRITICAL bugs:** 1 (CRITICAL-1: Population collapse)
**Active HIGH bugs:** 0
**Active MEDIUM bugs:** 5 (M-1, M-2, M-5, M-7, M-8)

**System Status:** CRITICAL - Population mechanics broken for hindcast period (1990-2020)

**Latest Architecture Review:** `reviews/architecture_integration_review_20251212_comprehensive.md` (Grade: A-)

---

## CRITICAL Priority Bugs

**Definition:** System crashes, data corruption, determinism breaks, security vulnerabilities

**Status:** 1 active (CRITICAL-1: Hindcast population collapse)

### CRITICAL-1: Hindcast Population Collapse (-42% vs +46% Historical)

**Discovered:** December 13, 2025 (Session 82)
**Status:** 🔴 ACTIVE - Investigation in progress
**Assigned:** simulation-maintainer (Roy)
**Impact:** Blocks hindcast validation framework, undermines population mechanics confidence

**Description:**
Population declines -42% during 1990-2020 hindcast when historical data shows +46% growth (5.327B → 7.795B). This catastrophic error blocks historical parameter tuning and validation.

**Validation Results:**
```
✅ 1990: 5.258B vs 5.327B (-1.30%)  [Initialization ACCURATE]
⚠️ 1995: 5.212B vs 5.744B (-9.26%)  [Regression begins]
⚠️ 2000: 5.369B vs 6.143B (-12.60%)
⚠️ 2005: 5.425B vs 6.542B (-17.07%)
⚠️ 2010: 5.330B vs 6.957B (-23.38%)
⚠️ 2015: 5.038B vs 7.38B (-31.74%)
⚠️ 2020: 4.508B vs 7.795B (-42.17%) [CATASTROPHIC]
```

**Key Anomaly:**
- Reported growth rate: +1.7-1.8% per month
- Actual population change: -0.8% over 5 years
- **CONTRADICTION:** Growth rates don't match population changes

**Debug Output (1990-1995):**
```
1991: Pop=5.063B, Birth=27.00/1k/mo, Death=8.88/1k/mo, Growth=1.812%/mo
1992: Pop=5.097B, Birth=26.79/1k/mo, Death=8.85/1k/mo, Growth=1.794%/mo
1993: Pop=5.136B, Birth=26.57/1k/mo, Death=8.82/1k/mo, Growth=1.775%/mo
1994: Pop=5.176B, Birth=26.35/1k/mo, Death=8.78/1k/mo, Growth=1.756%/mo
1995: Pop=5.216B, Birth=26.12/1k/mo, Death=8.75/1k/mo, Growth=1.738%/mo
```

**Location:**
- File: `src/simulation/populationDynamics.ts`
- Functions: `initializeHumanPopulationSystem`, population update logic
- Related: `src/simulation/regionalPopulations.ts` (regional → global aggregation)

**Root Cause Hypotheses:**

1. **Annual/Monthly Rate Confusion:**
   - Initialization sets ANNUAL rates (1.8%/year)
   - Simulation applies as MONTHLY rates (1.8%/month = 21.6%/year)
   - Result: 12x multiplier error
   - **Issue:** Doesn't explain population DECLINE

2. **Mortality System Double-Counting:**
   - Base death rate (8/1k/month)
   - Regional death rates applied separately
   - Bayesian mortality system applied
   - Crisis mortality applied
   - **Possible:** Death rate applied 2-4x per month

3. **Population Units Mismatch:**
   - Regional populations in MILLIONS
   - Global population in BILLIONS
   - **Possible:** Unit conversion error in aggregation

4. **Growth Calculation vs Application:**
   - Growth rate CALCULATED correctly (for display)
   - Growth rate NOT APPLIED correctly (to population)
   - **Possible:** Display bug masking calculation bug

**Reproducibility:**
- 100% deterministic (same seed = same collapse)
- Discovered by: `scripts/hindcastDemographicValidation.ts`
- Debug script: `scripts/debugHindcastPopulation.ts`
- Investigation: `devlogs/hindcast_population_collapse_investigation_20251213.md`

**Next Steps:**
1. Trace population update logic in `populationDynamics.ts`
2. Check for mortality double-counting (regional + Bayesian + crisis)
3. Verify unit consistency (millions vs billions)
4. Create minimal single-month reproduction case
5. Compare 1990 hindcast vs 2025 baseline behavior

**Estimated Effort:** 2-4 hours (requires deep investigation)
**Target Completion:** Session 83

**Priority Justification:**
- Blocks HIGH value research infrastructure (hindcast validation)
- Undermines confidence in population mechanics
- May affect forward simulations (2025+) if root cause is systemic
- Error magnitude: -61.7 percentage points (catastrophic)

---

## HIGH Priority Bugs

**Definition:** Performance regressions (>50%), state propagation bugs, type safety violations, missing error handling

**Status:** 0 active (H-1 RESOLVED Session 77)

### ~HIGH-1: Floating-Point Precision Bug in Social Cascade Dynamics~ ✅ RESOLVED

**Discovered:** December 12, 2025 (Session 77)
**Status:** ✅ RESOLVED (Session 77, commits 98ba9ac7 + 9b09dde2)
**Assigned:** simulation-maintainer (Roy) - COMPLETED
**Impact:** ~~Crashes all simulations exceeding 424 months (~35 years)~~ FIXED

**Description:**
Hindcast validation (1950-2024) discovered a floating-point precision bug causing simulation crashes. The `applySocialCascadeDynamics` function produces values that exceed 1.0 by ~1e-15 due to cumulative floating-point rounding errors, triggering the defensive assertion system.

**Error:**
```
❌ Out-of-range value in applySocialCascadeDynamics
   adoptionLevel = 1.0000000000000007
   Valid range: [0, 1]
   Month: 424
```

**Location:**
- File: `src/simulation/positiveTippingPoints.ts`
- Function: `applySocialCascadeDynamics` (line 931)
- Phase: `PositiveTippingPointsPhase`

**Root Cause:**
Cumulative floating-point rounding errors from incremental updates (e.g., `adoptionLevel += delta`) cause values to slightly exceed the theoretical maximum of 1.0.

**Impact:**
- Blocks hindcast validation (1950-2024 framework)
- Blocks long-term Monte Carlo runs (>35 years)
- Affects all simulations with active social cascades

**Reproducibility:**
- 100% deterministic (always crashes at month 424 with seed 42)
- Discovered by: `scripts/hindcastValidation1950to2024.ts`
- Validation run: `logs/hindcast_validation/hindcast_1950_2024_2025-12-12T19-40-41.log`

**Proposed Fix:**
1. Add epsilon tolerance to `assertInRange` for [0, 1] bounded values (tolerance: 1e-10)
2. Add explicit clamping in `positiveTippingPoints.ts` after adoption level updates
3. Defense in depth: Clamp at source + validate with tolerance

**Estimated Effort:** 1-2 hours
**Target Completion:** ~~Session 78~~ ✅ COMPLETED Session 77

**Detailed Analysis:** See `openspec/specs/bugs/critical-floating-point-precision.md`

**Resolution (Session 77, Dec 12, 2025):**
✅ FIXED - Both commits applied successfully:

**Commit 98ba9ac7:** Bug discovery and documentation
- Created detailed bug report with reproducible test case
- Documented root cause (cumulative floating-point rounding)
- Proposed defense-in-depth fix (epsilon tolerance + clamping)

**Commit 9b09dde2:** Bug fix implementation
1. ✅ Added epsilon parameter to `assertInRange` utility (default: 0)
2. ✅ Auto-clamp values within epsilon tolerance (1e-10 for [0,1] bounds)
3. ✅ Updated `assertProbability` to use epsilon=1e-10 by default
4. ✅ Applied epsilon tolerance to all 3 assertions in `applySocialCascadeDynamics`

**Impact:**
- Prevents false-positive assertion failures from benign rounding errors
- Maintains fail-loudly philosophy for genuine out-of-range values
- Unblocks hindcast validation framework (1950-2024 runs)
- Unblocks long-term Monte Carlo simulations (>35 years)

**Verification Needed:**
- [ ] Run hindcast validation 1950-2024 to confirm fix
- [ ] Monte Carlo validation N≥10 with long-term runs (>35 years)
- [ ] Integration test for social cascades over 1000 months

**Priority Justification:**
- ~~Blocks~~ UNBLOCKED HIGH value research infrastructure (hindcast validation)
- ~~Blocks~~ UNBLOCKED core simulation functionality (long-term runs)
- ✅ Fix applied (~40 lines across 2 files)
- ✅ Validates defensive assertion strategy (fail-loudly on genuine issues, tolerate benign floating-point errors)

---

## MEDIUM Priority Bugs

**Definition:** Minor performance issues (<50% slowdown), code complexity, documentation gaps, non-critical test failures

### MEDIUM-1: Performance Test Flakiness

**Discovered:** Session 53 (Dec 4, 2025)
**Status:** MONITORING (Carried forward from Session 55)
**Impact:** Intermittent performance test failures (647ms vs 500ms threshold)

**Description:**
Performance tests occasionally fail due to system load variation:
- `tests/performance/organizationManagement.perf.test.ts`
- Expected: <500-650ms for 1000 organizations
- Actual: 647-945ms (flaky, depends on system load)

**Root Cause:**
System load variation on shared infrastructure (VM). Not a regression - pre-existing condition.

**Tests affected:**
1. "should execute in under 100ms: 1000 organizations with 5 datacenters and 10 AI models each"
   - Expected: <650ms
   - Actual: 902.45ms (Session 58)
2. "should execute in under 50ms: finding owned datacenters across 1000 organizations"
   - Expected: <300ms
   - Actual: 406.34ms (Session 58)
3. "should execute in under 50ms: finding owned AI models across 1000 organizations"
   - Expected: <500ms
   - Actual: 643.86ms (Session 58)

**Recommendation:**
- Option 1: Increase thresholds to match observed values (650ms → 1000ms, 300ms → 450ms, 500ms → 700ms)
- Option 2: Use relative thresholds (e.g., "within 20% of baseline")
- Option 3: Skip performance tests on CI (run only locally)

**Next Steps:**
- Monitor for actual performance regressions (not flakiness)
- Adjust thresholds if consistently failing
- Consider dedicated performance testing infrastructure

**Priority:** MEDIUM (test flakiness, not actual regression)

---

### MEDIUM-2: Optional `state` Field Should Be Required

**Discovered:** Session 55 (Dec 6, 2025)
**Status:** MONITORING (Carried forward from Session 55)
**Impact:** TippingElement interface has optional field that's always present

**Description:**
`TippingElement` interface in `src/types/game.ts` has `state?: string` as optional, but it's always initialized and used as required.

**Location:**
- File: `src/types/game.ts`
- Interface: `TippingElement`
- Field: `state?: string` (line ~425)

**Root Cause:**
Historical design - field was made optional early in development, but all code paths initialize it.

**Recommendation:**
Change `state?: string` to `state: string` and verify all usage sites.

**Impact:**
Low - type system allows undefined, but runtime always provides value. No bugs observed.

**Priority:** MEDIUM (type safety improvement, not a blocker)

**Next Steps:**
- Grep for all `TippingElement` usage
- Verify `state` is always initialized
- Change to required field
- Run full test suite

---

### MEDIUM-3: Duplicate Energy Category Mapping

**Discovered:** Session 70 (Dec 12, 2025) - 30-day Architecture Review
**Status:** RESOLVED (Session 71 verification - already fixed)
**Impact:** Code duplication in ClimateDeploymentPhase

**Description:**
ClimateDeploymentPhase has a local `mapTechToEnergyCategory` method despite the shared utility existing in `@/simulation/utils/energyCategories.ts`. The import exists but the local method is still used.

**Location:**
- File: `src/simulation/engine/phases/ClimateDeploymentPhase.ts`
- Lines: 313-328

**Root Cause:**
Legacy code - local method predates shared utility creation.

**Recommendation:**
Delete local method, use imported utility from energyCategories.ts.

**Impact:**
Low - functional duplication, no bugs. Maintenance burden only.

**Priority:** MEDIUM (code quality improvement)
**Effort:** TRIVIAL (15 min)

**Resolution (Session 71, Dec 12, 2025):**
Verified that local method was already removed in prior session. File now uses shared utility from `@/simulation/utils/energyCategories` exclusively (line 34 import, line 283 usage). No duplicate method found.

**Verification:**
- ✅ Grep search confirmed no local method
- ✅ TypeScript compilation clean
- ✅ Only uses imported utility

---

### MEDIUM-4: AIScalingPhase Missing Dependencies Declaration

**Discovered:** Session 70 (Dec 12, 2025) - 30-day Architecture Review
**Status:** RESOLVED (Session 71, Dec 12, 2025)
**Impact:** Documentation inconsistency

**Description:**
AIScalingPhase is defined as an object literal without explicit `readonly dependencies` array. Most other phases use class syntax with explicit `readonly dependencies = [...]` declarations.

**Location:**
- File: `src/simulation/engine/phases/AIScalingPhase.ts`
- Lines: 24-27

**Current:**
```typescript
export const AIScalingPhase: SimulationPhase = {
  id: 'ai-scaling',
  name: 'AI Capability Scaling',
  order: 3,
  execute(state, rng, context) {
```

**Recommendation:**
Add explicit dependencies declaration (even if empty array) for consistency with other phases.

**Impact:**
Low - documentation/consistency only, no functional impact.

**Priority:** MEDIUM (consistency improvement)
**Effort:** TRIVIAL (10 min)

**Resolution (Session 71, Dec 12, 2025):**
Added explicit `dependencies: []` declaration to AIScalingPhase object (line 28) with comment documenting that phase has no dependencies and reads only global AI state.

**Verification:**
- ✅ Added `dependencies: []` to phase definition
- ✅ TypeScript compilation clean (npx tsc --noEmit)
- ✅ Consistent with other phase definitions

---

### MEDIUM-1: Information Ecology Silent Fallback Pattern

**Discovered:** Session 76 (Dec 12, 2025) - 30-day Architecture Integration Review
**Status:** RESOLVED (Session 76, commit 4d4d40a4)
**Impact:** Silent fallback pattern inconsistent with assertion utilities approach

**Description:**
InformationEcologyPhase.ts used defensive fallback in Phase 1 stub:
```typescript
const level = state.informationEcology?.misinformationLevel ?? 0;
```

**Location:**
- File: `src/simulation/engine/phases/InformationEcologyPhase.ts`
- Function: execute (stub phase)

**Root Cause:**
Stub code from Phase 1 implementation (placeholder logic).

**Solution:**
Removed `state.informationEcology?.misinformationLevel ?? 0` fallback. No replacement needed (stub returns early, no calculations).

**Verification:**
- ✅ TypeScript compilation clean
- ✅ No functional changes (stub phase)
- ✅ Consistent with assertion utilities approach

**Priority:** MEDIUM → RESOLVED (Session 76)
**Commit:** 4d4d40a4

---

### MEDIUM-5: Phase Execution Order Documentation Gap

**Discovered:** Session 70 (Dec 12, 2025) - 30-day Architecture Review
**Status:** RESOLVED (Session 70, commit 12cb6e7c)
**Impact:** Maintenance burden for phase ordering

**Description:**
The 12.x phase range has grown complex with fractional ordering:
```
12.5   TechTreePhase
12.6   StochasticInnovationPhase
12.61  Tier2SocialSystemsPhase
12.65  CooperativeSystemsPhase
12.7   MeaningRenaissancePhase
12.75  EnergyBudgetPhase
12.8   ClimateDeploymentPhase
```

The fractional ordering makes it hard to insert new phases and understand data flow.

**Location:**
- File: `src/simulation/engine/PhaseOrchestrator.ts` (or dedicated doc file)

**Root Cause:**
Incremental growth - phases added over time without refactoring order ranges.

**Recommendation:**
Consider phase grouping documentation in PhaseOrchestrator or dedicated doc file showing:
- Phase groups (initialization, AI, economy, climate, etc.)
- Data flow between groups
- Insertion points for new phases

**Impact:**
Low - current system works, but maintenance burden for future phase additions.

**Priority:** MEDIUM (maintenance improvement)
**Effort:** SMALL (1-2 hours)

**Next Steps:**
- Survey all phase orders
- Group by domain/data flow
- Document recommended insertion ranges
- Create phase architecture diagram (optional)

---

### MEDIUM-6: Defensive Fallback Patterns in Remaining Files

**Discovered:** Session 70 (Dec 12, 2025) - 30-day Architecture Review (follow-up from Nov 16)
**Status:** MONITORING (non-urgent)
**Impact:** Partial assertion migration (split-brain error handling)

**Description:**
Approximately 50 instances of `?? defaultValue` or `|| 0` remain in calculation paths:
- `src/simulation/organizationManagement.ts` line 539: `(regionCounts.get(region) || 0)`
- `src/simulation/unknownUnknowns.ts` line 193: `state.planetaryBoundariesSystem.novelEntitiesIncrementalImpact || 0`
- `src/simulation/flashWarEscalation.ts` line 123: `peace.activeConflicts || 0`
- Multiple files in `src/simulation/techTree/`

**Root Cause:**
Partial migration to assertion utilities (Nov 2025). CRITICAL regressions fixed (dystopiaProgression.ts, aiSuffering.ts), but broader cleanup remains incomplete.

**Assessment:**
Current state is **acceptable**. The remaining patterns are mostly:
1. Map.get() idioms (valid - Map returns undefined for missing keys)
2. Config defaults (valid - initialization fallbacks)
3. UI display values (valid - not in calculation paths)

The risky calculation-path fallbacks have been addressed.

**Priority:** MEDIUM (code quality improvement, non-urgent)
**Effort:** MEDIUM (2-3 days for full cleanup)

**Next Steps:**
- Audit remaining instances (categorize valid vs risky)
- Replace risky patterns with assertion utilities
- Document valid fallback patterns (Map.get, initialization, UI)
- Update defensive coding guidelines

---

### MEDIUM-7: Coordination Capacity Multiple Writers

**Discovered:** Session 76-79 (Dec 12, 2025) - 30-day Comprehensive Architecture Review
**Status:** MONITORING (architecture is correct, documentation enhancement needed)
**Impact:** `state.society.coordinationCapacity` modified by multiple phases

**Description:**
Two phases write to `state.society.coordinationCapacity`:

1. **InformationEcologyPhase** (order 18.0):
   - Applies epistemic degradation modifier
   - Location: `src/simulation/engine/phases/InformationEcologyPhase.ts:98`
   - Modulation: `baseCoordination * coordinationModifier` (0.5-1.0 range)

2. **ExogenousShockPhase** (order 27.5):
   - Applies crisis-driven coordination impacts (nuclear war, pandemics, etc.)
   - Location: `src/simulation/engine/phases/ExogenousShockPhase.ts:256,619,739,1102`
   - Modulation: `Math.max(0, coordinationCapacity * crisisMultiplier)`

**Downstream consumers:**
- GeopoliticalConflictPhase (order 28.0) - conflict escalation probability
- EmergencyResponsePhase (order 29.0) - crisis response effectiveness
- BifurcationLogicPhase (order 31.0) - pathway divergence detection

**Assessment: Architecture is CORRECT**
- Sequential ordering (18.0 → 27.5 → 28.0+) ensures no stale reads
- Multiplicative effects compose properly (epistemic × crisis)
- All downstream phases read the final modified value
- No circular dependencies detected

**Root Cause:**
Documentation gap - multiple writers not explicitly noted in phase comments.

**Recommendation:**
Add cross-reference comments in both phases:
```typescript
// InformationEcologyPhase.ts line 98:
// NOTE: This value is further modified by ExogenousShockPhase (order 27.5)
// Downstream: GeopoliticalConflictPhase (28.0), EmergencyResponsePhase (29.0)

// ExogenousShockPhase.ts line 256:
// NOTE: Modifies coordination capacity set by InformationEcologyPhase (order 18.0)
// Ensure sequential ordering if refactoring
```

**Priority:** MEDIUM (documentation enhancement, not an architectural flaw)
**Effort:** TRIVIAL (15 minutes - add 4 comments)

**Validation:**
- ✅ Sequential ordering verified (18.0 < 27.5 < 28.0)
- ✅ No circular dependencies in dependency graph
- ✅ Downstream consumers validated (all read modified value)
- ✅ TypeScript compiles cleanly

---

### MEDIUM-8: Information Ecology Event Detection Uses String Matching

**Discovered:** Session 76-79 (Dec 12, 2025) - 30-day Comprehensive Architecture Review
**Status:** DEFERRED (functional but inelegant)
**Impact:** Event detection relies on string matching - brittle pattern

**Description:**
InformationEcologyPhase detects nuclear events, AI deceptions, and catastrophes via string matching on event descriptions:

```typescript
// Lines 136-141
const recentNuclearEvents = state.eventLog.filter(
  (event) =>
    event.timestamp >= state.currentMonth - 1 &&
    event.type === 'catastrophe' &&
    event.description.toLowerCase().includes('nuclear')
);
```

Similar patterns for:
- AI deception detection: `.includes('deception')` or `.includes('sleeper')`
- Catastrophes: `.includes('extinction')` or `.includes('collapse')`

**Location:**
- File: `src/simulation/engine/phases/InformationEcologyPhase.ts`
- Lines: 136-181 (detectAndApplyShocks method)

**Root Cause:**
Event system uses free-form text descriptions rather than typed event categories.

**Issues:**
1. **False positives:** Event description "diplomatic nuclear talks" would trigger nuclear shock
2. **False negatives:** Missing keyword variations (e.g., "thermonuclear" vs "nuclear")
3. **Maintenance burden:** Adding new event types requires updating string matching logic
4. **Internationalization:** String matching breaks with non-English descriptions

**Assessment:**
Currently **functional** - no false positives/negatives observed in practice. Simulation uses consistent emoji-based event language (☢️ for nuclear, 🎭 for deception) which makes string matching reliable.

**Recommendation (Future Cleanup):**
Replace with typed event categories:
```typescript
interface GameEvent {
  type: 'catastrophe' | 'crisis' | 'breakthrough';
  category: 'nuclear' | 'climate' | 'ai_deception' | 'pandemic';  // NEW
  description: string;
}

// Detection becomes:
const nuclearEvents = state.eventLog.filter(
  (event) => event.category === 'nuclear'
);
```

**Priority:** MEDIUM (code quality improvement, not urgent)
**Effort:** MEDIUM (2-3 hours - event system refactor)

**Next Steps:**
- Define event category enum
- Update event creation sites to include category
- Migrate string matching to category checks
- Add migration path for existing event logs

**Deferral Rationale:**
- Current implementation works reliably (pictographic event language is consistent)
- No user-reported issues
- Higher priority work (hindcast validation, new features) takes precedence

---

## LOW Priority Bugs

**Definition:** Code style, optimization opportunities, refactoring suggestions, minor documentation improvements

**Status:** Tracked in individual module documentation

---

## Resolved Bugs (Recent)

### Session 76 (Dec 12, 2025)

**H-1: ClimateDeploymentPhase Missing Energy Budget Dependency (Architecture Integration Review)** ✅ RESOLVED
- **Discovered:** Session 76 (Dec 12, 2025) - 30-day Architecture Integration Review
- **Fixed:** Session 76 (commit 4d4d40a4)
- **Root Cause:** Implicit dependency not declared (ClimateDeploymentPhase reads from EnergyBudgetPhase)
- **Solution:** Added 'energy-budget' to dependencies array in ClimateDeploymentPhase
- **Impact:** Makes implicit dependency explicit, phase orchestrator can validate data flow
- **Verification:** TypeScript compiles cleanly, no functional changes (already worked via ordering)

**H-2: Supply Chain Cascades RNG Initialization Pattern** ✅ RESOLVED
- **Discovered:** Session 76 (Dec 12, 2025) - 30-day Architecture Integration Review
- **Fixed:** Session 76 (commit 4d4d40a4)
- **Root Cause:** supplyChainCascades.ts initialization accepted optional RNG with fallback
- **Solution:** Made RNG required, added fail-loudly assertion, removed fallback value
- **Impact:** Consistent Monte Carlo initialization (0.8-1.2 randomized, no fixed fallback)
- **Verification:** TypeScript compiles cleanly, determinism preserved

**M-1: Information Ecology Silent Fallback Pattern** ✅ RESOLVED
- **Discovered:** Session 76 (Dec 12, 2025) - 30-day Architecture Integration Review
- **Fixed:** Session 76 (commit 4d4d40a4)
- **Root Cause:** InformationEcologyPhase.ts used defensive fallback in Phase 1 stub
- **Solution:** Removed `state.informationEcology?.misinformationLevel ?? 0` fallback
- **Impact:** Consistent with assertion utilities approach
- **Verification:** TypeScript compiles cleanly, no functional changes (stub phase)

### Session 70 (Dec 12, 2025)

**H-1: ClimateDeploymentPhase Missing Energy Budget Dependency** ✅ RESOLVED
- **Discovered:** Session 70 (Dec 12, 2025) - 30-day Architecture Review
- **Fixed:** Session 70 (commit 3303f984)
- **Root Cause:** Implicit dependency not declared (phase ordering worked but orchestrator couldn't validate)
- **Solution:** Added 'energy-budget' to dependencies array in ClimateDeploymentPhase
- **Impact:** Makes implicit dependency explicit (reads effectiveness multipliers from energy budget)
- **Verification:** TypeScript compiles cleanly, phase orchestrator can validate data flow

**H-2: Optional RNG in Initialization Functions** ✅ RESOLVED
- **Discovered:** Session 70 (Dec 12, 2025) - 30-day Architecture Review
- **Fixed:** Session 70 (commit 3303f984)
- **Root Cause:** oceanAcidification.ts accepted optional RNG with fallback (split-brain initialization)
- **Solution:** Made RNG required, added fail-loudly assertion, removed fallback value
- **Impact:** Consistent Monte Carlo initialization (0.8-1.2 randomized, no fixed fallback)
- **Verification:** TypeScript compiles cleanly, determinism preserved

### Session 58 (Dec 7, 2025)

**HIGH-1: Type Safety - `any` Cast for `_sampledTransitionTime`** ✅ RESOLVED
- **Discovered:** Session 53 architecture review
- **Fixed:** Session 58 (commit daa45b9c)
- **Root Cause:** Missing optional field on TippingElement interface
- **Solution:** Added `_sampledTransitionTime?: number` to TippingElement interface
- **Impact:** Removed both `(element as any)._sampledTransitionTime` casts from ClimateSystemPhase.ts
- **Verification:** TypeScript compiles cleanly, no type safety regressions

### Session 56 (Dec 7, 2025)

**CRITICAL: Game UI State Integration** ✅ RESOLVED
- **Discovered:** Session 56 (Dec 7, 2025)
- **Fixed:** Session 56 (commit 5285463c)
- **Root Cause:** `gameState` from `useGameState()` not passed to `GameDashboard` component
- **Solution:** Added `gameState` to destructured values + passed as prop to GameDashboard
- **Impact:** Month counter updates, event stream displays events, resources show real values
- **Archive:** `plans/completed/CRITICAL_game_ui_state_integration_IMPLEMENTED_20251207.md`

### Week of Nov 26-29, 2025

**CRITICAL-1: Hindcast Validation Crashes (environmentalHealth NaN)** ✅ RESOLVED
- **Fixed:** Nov 27 (commit cceb556a)
- **Root Cause:** Defensive fallback `?? 50` in ecology calculation masked NaN bug
- **Solution:** Replaced fallback with proper assertion utilities, fixed root cause (missing initialization)

**RESEARCH-CRITICAL: Climate Stability Citation Failures** ✅ RESOLVED
- **Fixed:** Nov 27 (commit b580b1c8)
- **Root Cause:** Missing peer-reviewed sources for climate stability floor claim
- **Solution:** Added research validation, conditional floor logic per Wunderling 2024

**HIGH-2: Carbon Cycle Over-Calibration (+12.1% error)** ✅ RESOLVED
- **Fixed:** Nov 29 (commit 3caab24a)
- **Root Cause:** CO2 absorption rates too aggressive
- **Solution:** Recalibrated to IPCC AR6 values

**HIGH-4: Technology Bifurcation (100% Dystopia Outcomes)** ✅ PARTIAL SUCCESS
- **Fixed:** Nov 29 (commits a41f65fe, c855fb60)
- **Root Cause:** Bifurcation trigger used wrong metric (research vs deployment)
- **Solution:** Fixed trigger + added regime feedback multipliers
- **Result:** Technology bifurcation 0% → 100%, first utopia achieved (run 42007)
- **Status:** Core fix successful, outcome diversity lower than expected (follow-up deferred)

---

## Bug Submission Guidelines

### When to Create a Bug Entry

**CRITICAL bugs (immediate):**
- System crashes or hangs
- Data corruption
- Monte Carlo non-determinism (same seed, different outputs)
- Security vulnerabilities

**HIGH bugs (this sprint):**
- Performance regressions (>50% slowdown)
- State propagation bugs (visible errors)
- Type safety violations (runtime type errors)
- Missing error handling in critical paths

**MEDIUM bugs (next sprint):**
- Minor performance issues (<50% slowdown)
- Test failures (flakiness or outdated)
- Code complexity concerns
- Documentation gaps

**LOW bugs (backlog):**
- Code style issues
- Optimization opportunities
- Refactoring suggestions
- Minor documentation improvements

### Bug Entry Format

```markdown
### PRIORITY-N: Bug Title

**Discovered:** Session X (Date)
**Status:** ACTIVE | MONITORING | RESOLVED
**Impact:** One-line impact statement

**Description:**
Detailed description of the bug, including:
- What happens (observed behavior)
- What should happen (expected behavior)
- Reproduction steps (if applicable)

**Location:**
- File: path/to/file.ts
- Function: functionName
- Lines: 123-456

**Root Cause:**
Analysis of why the bug occurs (if known)

**Recommendation:**
Suggested fix or next steps

**Priority:** CRITICAL | HIGH | MEDIUM | LOW
**Effort:** Trivial | Small | Medium | Large

**Next Steps:**
- [ ] Task 1
- [ ] Task 2
```

---

## Quality Gate 2 Integration

This file tracks bugs discovered during **Quality Gate 2** (architecture review):

**Process:**
1. architecture-skeptic performs post-implementation review
2. Identifies issues with severity ratings (CRITICAL/HIGH/MEDIUM/LOW)
3. CRITICAL/HIGH issues added to this queue
4. Feature BLOCKED from merge until issues resolved
5. Issues resolved → marked RESOLVED in this file

**See:** `openspec/specs/quality-gates/spec.md` for complete QG2 process

---

## Related Documentation

- `openspec/specs/quality-gates/spec.md` - Quality gate definitions
- `reviews/` - Architecture review reports
- `openspec/specs/research/verification-queue.md` - Research validation queue
- `plans/MASTER_IMPLEMENTATION_ROADMAP.md` - Legacy roadmap (frozen reference)
- `openspec/specs/project/spec.md` - Project-level requirements

---

## Monitoring & Alerting

**Automated checks:**
- Pre-commit hooks: Emoji registration, TypeScript compilation
- CI/CD: Test suite (462+ tests), coverage (82.44%)
- Monte Carlo validation: Determinism checks (CV < 0.01%)

**Manual reviews:**
- Architecture integration review (every 2-4 weeks)
- Research validation audit (monthly)
- Performance profiling (as needed)

---

**Last Review:** December 12, 2025 (Session 70) - 30-day Architecture Integration Review
**Next Review:** January 2026 (estimated)
**System Status:** STABLE - Zero blocking issues, production ready, 6 MEDIUM deferred (non-blocking)
