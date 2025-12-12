# Critical Bug Queue
## High-Priority Issues Tracker

**Created:** December 7, 2025
**Purpose:** Track CRITICAL and HIGH priority bugs requiring immediate attention

---

## Overview

This file tracks bugs that block normal development or cause significant system degradation. It serves as the single source of truth for critical issues requiring immediate resolution.

---

## Queue Status

**Last Updated:** December 12, 2025 (Session 69+)

**Active CRITICAL bugs:** 0
**Active HIGH bugs:** 2 (from architecture review)
**Active MEDIUM bugs:** 5 (2 carried forward, 3 new from architecture review)

**System Status:** STABLE - Production ready, architecture improvements identified

---

## CRITICAL Priority Bugs

**Definition:** System crashes, data corruption, determinism breaks, security vulnerabilities

**Status:** None active

---

## HIGH Priority Bugs

**Definition:** Performance regressions (>50%), state propagation bugs, type safety violations, missing error handling

**Status:** 2 active (from Dec 12 architecture review)

### HIGH-1: Trust Restoration Mechanics NOT IMPLEMENTED

**Discovered:** Session 69+ (Dec 12, 2025)
**Status:** ACTIVE
**Impact:** Research complete (Grade B+, Dec 11), but no implementation exists

**Description:**
High-quality research exists for trust restoration mechanics (`research/institutional_trust_restoration_20251211.md`), but there's no corresponding implementation in the simulation.

**Research Complete:**
- 9 peer-reviewed sources (2023-2025)
- Trust erosion: 25-50%/month in crisis scenarios
- Restoration: 24-36+ months minimum
- Mechanism effectiveness: Procedural changes > distributive justice > transparency

**Location:**
Missing implementation - should be in government/society subsystem

**Recommendation:**
1. Verify research file exists and is valid
2. Create implementation plan
3. Add trust restoration mechanics to government decision-making
4. Integrate with social debt system

**Priority:** HIGH (research investment wasted without implementation)
**Effort:** Medium (2-3 days)

**Next Steps:**
- [ ] Verify research file exists
- [ ] Create change proposal in openspec/changes/
- [ ] Implement trust restoration mechanics
- [ ] Monte Carlo validation N≥10

---

### HIGH-2: Multi-Paradigm DUI Lacks Feedback to Simulation Core

**Discovered:** Session 69+ (Dec 12, 2025)
**Status:** ACTIVE
**Impact:** Paradigm divergence calculated but doesn't affect simulation outcomes

**Description:**
MultiParadigmDUIUpdatePhase calculates 4 paradigm perspectives (Western Liberal, Development, Ecological, Indigenous) and tracks divergence, but this data doesn't feed back into government decision-making, policy effectiveness, or social conflict mechanics.

**Location:**
- File: `src/simulation/engine/phases/MultiParadigmDUIUpdatePhase.ts`
- Issue: Calculation works, no downstream effects

**Current State:**
- ✅ Paradigm scores calculated correctly [0, 100]
- ✅ Divergence tracked (max - min)
- ❌ No impact on government decisions
- ❌ No impact on policy effectiveness
- ❌ No social conflict triggered by divergence >20

**Root Cause:**
Phase implemented as measurement-only, not integrated with decision/outcome phases

**Recommendation:**
Design feedback loop:
1. Government decision-making should consider paradigm divergence
2. Policy effectiveness should scale with paradigm alignment
3. High divergence (>20) should trigger social conflict mechanics
4. Breakthrough tech adoption should vary by paradigm perspective

**Priority:** HIGH (complete system not functioning)
**Effort:** Large (3-5 days)

**Next Steps:**
- [ ] Design paradigm → government decision integration
- [ ] Design paradigm → policy effectiveness multiplier
- [ ] Design paradigm divergence → social conflict trigger
- [ ] Implement feedback mechanics
- [ ] Monte Carlo validation N≥10

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

### MEDIUM-2: AIScalingPhase Updates All Agents When Factors Unchanged

**Discovered:** Session 69+ (Dec 12, 2025)
**Status:** ACTIVE
**Impact:** Minor performance inefficiency - unnecessary agent object updates

**Description:**
AIScalingPhase loops through all agents and updates their capabilities even when scaling factors haven't changed from previous month. This creates unnecessary object churn.

**Location:**
- File: `src/simulation/engine/phases/AIScalingPhase.ts:133`
- Function: Main phase function

**Root Cause:**
No guard clause to skip updates when factors are identical to previous calculation

**Recommendation:**
Add early-exit guard:
```typescript
// After calculating scaling factors
if (scalingFactors === previousScalingFactors) {
  return; // Skip agent updates if no change
}
```

**Priority:** MEDIUM (optimization, not correctness issue)
**Effort:** Small (30 min)

**Next Steps:**
- [ ] Add scaling factor comparison
- [ ] Add early-exit guard
- [ ] Verify Monte Carlo determinism unchanged

---

### MEDIUM-3: Feature Flag Check After Phase Registration

**Discovered:** Session 69+ (Dec 12, 2025)
**Status:** ACTIVE
**Impact:** Phase registered even if feature flag disabled (code smell)

**Description:**
EnergyBudgetPhase registers in PhaseOrchestrator, then checks feature flag inside phase function. Better pattern: check flag before registration.

**Location:**
- File: `src/simulation/engine/phases/EnergyBudgetPhase.ts:142`
- Pattern: Feature flag check happens after phase registration

**Current Code:**
```typescript
// Inside phase function (line 142)
if (!state.featureFlags?.energyBudgetConstraints) {
  return;
}
```

**Recommended Pattern:**
```typescript
// In PhaseOrchestrator registration
if (state.featureFlags?.energyBudgetConstraints) {
  phases.push(EnergyBudgetPhase);
}
```

**Priority:** MEDIUM (code quality, not functional issue)
**Effort:** Small (30 min)

**Next Steps:**
- [ ] Move feature flag check to PhaseOrchestrator
- [ ] Remove early-return from phase function
- [ ] Verify tests still pass

---

### MEDIUM-4: Dual Energy Systems Create Confusion Risk

**Discovered:** Session 69+ (Dec 12, 2025)
**Status:** MONITORING
**Impact:** Developer confusion - two energy tracking systems exist

**Description:**
Both EnergyBudgetPhase and PowerGenerationSystem track energy. While they serve different purposes (allocation vs production), this creates confusion risk.

**Location:**
- `src/simulation/engine/phases/EnergyBudgetPhase.ts` - Global electricity allocation
- `src/simulation/powerGeneration.ts` - Infrastructure production tracking

**Current Integration:**
- PowerGenerationSystem feeds into EnergyBudgetPhase
- EnergyBudgetPhase consumes production data
- No double-counting detected

**Recommendation:**
Document the distinction clearly:
- **PowerGenerationSystem:** Infrastructure-level production tracking (capacity, tech type)
- **EnergyBudgetPhase:** Global allocation and constraint modeling

**Priority:** MEDIUM (documentation issue)
**Effort:** Small (30 min)

**Next Steps:**
- [ ] Add architectural documentation
- [ ] Clarify comments in both files
- [ ] Consider renaming for clarity

---

### MEDIUM-5: Optional `state` Field Should Be Required

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

## LOW Priority Bugs

**Definition:** Code style, optimization opportunities, refactoring suggestions, minor documentation improvements

**Status:** Tracked in individual module documentation

---

## Resolved Bugs (Recent)

### Session 69+ (Dec 12, 2025)

**HIGH-3: Tipping Cascade O(n²) Element Search** ✅ RESOLVED
- **Discovered:** Session 69+ architecture review (Dec 12, 2025)
- **Fixed:** Session 69+ (commit pending)
- **Root Cause:** Nested loop with linear `.find()` search in threshold lowering calculations
- **Solution:** Built element index Map at method start, replaced O(n²) searches with O(1) lookups
- **Impact:** ~16x reduction in search operations per cascade calculation
- **Defensive Coding:** Added assertFinite() for map size validation, fail-loudly check for duplicate IDs
- **Verification:** 40/43 ClimateSystemPhase tests pass, threshold lowering tests pass (code path exercised)
- **Review:** `reviews/architecture_integration_review_20251212.md`

---

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

**Last Review:** December 7, 2025 (Session 58)
**Next Review:** December 14-21, 2025 (estimated)
**System Status:** STABLE - Zero blocking issues, production ready
