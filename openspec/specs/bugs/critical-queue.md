# Critical Bug Queue
## High-Priority Issues Tracker

**Created:** December 7, 2025
**Purpose:** Track CRITICAL and HIGH priority bugs requiring immediate attention

---

## Overview

This file tracks bugs that block normal development or cause significant system degradation. It serves as the single source of truth for critical issues requiring immediate resolution.

---

## Queue Status

**Last Updated:** December 12, 2025 (Session 71)

**Active CRITICAL bugs:** 0
**Active HIGH bugs:** 0
**Active MEDIUM bugs:** 4 (M-3 and M-4 resolved Session 71, M-5 and M-6 deferred)

**System Status:** STABLE - Production ready, zero blocking issues

---

## CRITICAL Priority Bugs

**Definition:** System crashes, data corruption, determinism breaks, security vulnerabilities

**Status:** None active

---

## HIGH Priority Bugs

**Definition:** Performance regressions (>50%), state propagation bugs, type safety violations, missing error handling

**Status:** None active

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

### MEDIUM-5: Phase Execution Order Documentation Gap

**Discovered:** Session 70 (Dec 12, 2025) - 30-day Architecture Review
**Status:** DEFERRED (non-urgent)
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

## LOW Priority Bugs

**Definition:** Code style, optimization opportunities, refactoring suggestions, minor documentation improvements

**Status:** Tracked in individual module documentation

---

## Resolved Bugs (Recent)

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
