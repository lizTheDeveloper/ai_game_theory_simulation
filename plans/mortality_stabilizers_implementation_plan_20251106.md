# Mortality Stabilizers Implementation Plan

**Date:** November 6, 2025
**Priority:** WEEK 1 CRITICAL (Blocks Monte Carlo validation)
**Estimated Timeline:** 19-29 hours (2-4 days with agent parallelization)
**Complexity:** HIGH (4 interacting systems, time-dependent dynamics, failure cascades)

---

## Executive Summary

**Problem:** Simulation shows 98% mortality vs 75% research worst-case (23% unexplained gap)
**Goal:** Reduce mortality to 30-50% through research-backed stabilizing mechanisms
**Research Quality:** A-grade (Lancet 2025, Nature Medicine 2024, IOM 2024)
**Critical Concern:** "Mortality stabilizers assume impossible conditions (aid during global collapse)" - Sylvia

**This plan coordinates:**
- Research verification & validation (Quality Gate 1)
- Implementation with defensive coding (Phase-based architecture)
- Architecture review (Quality Gate 2)
- Monte Carlo validation (N=10 runs)
- Documentation & archival

---

## Research Sources (Existing)

1. **Primary Research Document** (760 lines, Oct 30, 2025):
   `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/mortality_stabilizing_mechanisms_20251030.md`

   **Key Findings:**
   - International aid: 15-44% mortality reduction (Cavalcanti 2025, Lancet - 133 countries, 21 years)
   - Adaptation: 40-80% heat mortality reduction (Ballester 2024, Nature Medicine - 35 countries)
   - Migration: 85% success rate, <1% mortality (IOM 2024 - 26.4M displaced in 2023)
   - Emergency response: 20-40% reduction (weak evidence, GAO 2025)

2. **Implementation-Focused Document** (232 lines, Nov 2, 2025):
   `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/monte_carlo_issue4_mortality_stabilizing_20251102.md`

   **Key Implementation Guidance:**
   - Regional vs global crisis distinction critical
   - Historical mortality maxima: 30-60% regional (Black Death), <20% global
   - Timeline for mechanisms: 1-3 months (emergency) → 6-18 months (adaptation)
   - Priority mechanisms: Aid flows, emergency response, agricultural adaptation

---

## Critical Research Gap (Sylvia's Challenge)

**Assumption to Validate:** "International aid, adaptation, and migration reduce mortality even during global collapse"

**Sylvia's Concerns:**
1. **Aid during collapse:** If donor countries are also collapsing, where does aid come from?
2. **Adaptation limits:** What happens when physiological/economic limits are exceeded?
3. **Migration saturation:** Where do people go when crisis is global?
4. **Emergency response breakdown:** How fast do systems degrade under cascading stress?

**Research Needed:**
- Failure conditions for each mechanism (quantified thresholds)
- Conditional application logic (when to apply, when mechanisms fail)
- Global vs regional crisis distinction (parameter breakpoints)
- Failure cascade sequences (which fails first?)

---

## Implementation Workflow

### Phase 1: Research & Validation (Quality Gate 1)
**Duration:** 4-6 hours
**Status:** PENDING

#### Step 1.1: Research Verification (super-alignment-researcher / Cynthia)
**Task:** Verify and extend existing research with failure condition details

**Research Questions:**
1. **International Aid - When Does It Fail?**
   - Multi-country simultaneous crises - does aid still flow?
   - What % of donor countries affected = aid failure threshold?
   - Logistics breakdown scenarios (ports/airports destroyed)

2. **Adaptation - What Are The Limits?**
   - Wet bulb temperature >35°C - does adaptation still work?
   - GDP per capita minimum for infrastructure adaptation?
   - State capacity threshold for policy adaptation?

3. **Migration - When Does Capacity Exhaust?**
   - Multi-region crisis - where do people migrate TO?
   - Destination saturation point (max absorptive capacity)?
   - Border closure dynamics during global crises?

4. **Emergency Response - How Fast Does It Degrade?**
   - Concurrent disasters - how many before system overwhelmed?
   - Workforce depletion rate (FEMA 4% workforce available example)?
   - Resource stockpile exhaustion timelines?

**Output:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/mortality_stabilizers_failure_conditions_20251106.md`

**Search Strategy:**
- 2024-2025 peer-reviewed sources preferred
- Humanitarian response during concurrent crises
- Adaptation limits under extreme stress
- Migration capacity constraints in multi-region scenarios
- Emergency management breaking points

#### Step 1.2: Research Critique (research-skeptic / Sylvia)
**Task:** MANDATORY VALIDATION before implementation

**Critique Focus:**
- Challenge "aid during global collapse" assumption
- Find contradictory evidence for each mechanism
- Identify methodological flaws in optimistic studies
- Propose conservative parameter bounds

**Output:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/mortality_stabilizers_critique_20251106.md`

**Quality Gate Decision:**
- ✅ **PASS:** Sylvia approves conditional logic → Proceed to implementation
- ⚠️ **CONDITIONAL:** Sylvia identifies critical assumptions → Add safeguards, then proceed
- ❌ **FAIL:** Sylvia finds fatal methodological flaws → Loop back to research or pivot approach

---

### Phase 2: Implementation & Testing
**Duration:** 8-12 hours
**Status:** PENDING (blocked on Quality Gate 1)

#### Step 2.1: Phase Implementation (simulation-maintainer / Roy)
**Task:** Create `MortalityStabilizersPhase.ts` with validated conditional logic

**Requirements:**
1. **Defensive Coding (MANDATORY):**
   - Use assertion utilities from `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/utils/assertions.ts`
   - NO silent fallbacks (`?? defaultValue` forbidden in calculations)
   - Fail loudly with context if NaN/undefined encountered

2. **Deterministic RNG:**
   - Use RNG function passed to phase (never `Math.random()`)
   - Ensure reproducibility with seeds

3. **Emoji Conventions:**
   - Register new emojis in `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/docs/EMOJI_EVENT_MAP.txt`
   - Follow pictographic event language standards
   - Max 2 emojis per log message

4. **Conditional Logic (from Sylvia's validation):**
   - Aid effectiveness: Function of collapse severity, donor capacity, logistics intact
   - Adaptation: Function of time exposed, GDP per capita, state capacity, physiological limits
   - Migration: Function of destination capacity, crisis scope, distance
   - Emergency response: Function of workforce available, concurrent crisis count, resource stockpiles

**Mechanism Implementation:**

```typescript
/**
 * International Aid Effectiveness
 * Based on: Cavalcanti et al. (2025), validated by Sylvia
 *
 * Conditional Application:
 * - Regional crisis (< 30% world affected): HIGH effectiveness (15-44% reduction)
 * - Multi-region crisis (30-70% world affected): MEDIUM effectiveness (5-15% reduction)
 * - Global crisis (> 70% world affected): LOW/NONE effectiveness (0-5% reduction)
 */
function calculateAidEffectiveness(state: GameState, rng: () => number): number {
  const worldAffectedPct = calculateGlobalCrisisScope(state);

  // Donor capacity check
  const majorDonorsCollapsed = countCollapsedEconomies(state, MAJOR_DONORS);
  if (majorDonorsCollapsed > 2) {
    return 0; // No aid if top donors collapsed
  }

  // Logistics check
  const logisticsIntact = state.globalInfrastructure.ports > 0.3 &&
                          state.globalInfrastructure.airports > 0.3;
  if (!logisticsIntact) {
    return 0; // Cannot distribute aid if logistics broken
  }

  // Conditional effectiveness based on crisis scope
  let baseReduction: number;
  if (worldAffectedPct < 0.30) {
    // Regional crisis: full effectiveness
    baseReduction = 0.15 + rng() * 0.29; // 15-44% range from Cavalcanti 2025
  } else if (worldAffectedPct < 0.70) {
    // Multi-region crisis: degraded effectiveness
    baseReduction = 0.05 + rng() * 0.10; // 5-15% range (degraded)
  } else {
    // Global crisis: minimal effectiveness
    baseReduction = 0.00 + rng() * 0.05; // 0-5% range (nearly failed)
  }

  return assertProbability(baseReduction, {
    location: 'calculateAidEffectiveness',
    valueName: 'mortalityReduction',
    month: state.currentMonth
  });
}
```

**Integration Points:**
- Phase order in `PhaseOrchestrator.ts`: After mortality calculation phases, before outcome evaluation
- State modifications: Reduce `state.mortality.current` by calculated effectiveness
- Logging: Structured format with emoji conventions

#### Step 2.2: Unit Tests (unit-test-writer)
**Task:** Comprehensive test coverage for all mechanisms

**Test Cases Required:**
1. **Aid Effectiveness:**
   - Regional crisis (< 30% affected) → 15-44% reduction
   - Multi-region crisis (30-70% affected) → 5-15% reduction
   - Global crisis (> 70% affected) → 0-5% reduction
   - Donor collapse → 0% reduction
   - Logistics breakdown → 0% reduction

2. **Adaptation Mechanisms:**
   - 0 months exposure → minimal adaptation
   - 6 months exposure → 20-50% reduction
   - 18+ months exposure → 40-80% reduction (if resources available)
   - GDP < $10k → infrastructure adaptation disabled
   - Wet bulb > 35°C → physiological adaptation fails

3. **Migration:**
   - Destination capacity 100% → 85% success
   - Destination capacity 0% → 0% success (nowhere to go)
   - Crisis severity 100% → mortality during migration increases

4. **Failure Cascades:**
   - Emergency response fails first (concurrent disasters)
   - Aid fails second (donor collapse)
   - Migration fails third (destination saturation)
   - Adaptation lasts longest (behavioral/physiological)

**Output:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/tests/simulation/phases/MortalityStabilizersPhase.test.ts`

---

### Phase 3: Architecture Review (Quality Gate 2)
**Duration:** 3-4 hours
**Status:** PENDING (blocked on implementation completion)

#### Step 3.1: Architecture Review (architecture-skeptic)
**Task:** MANDATORY review for performance, state propagation, integration issues

**Review Checklist:**
1. **State Propagation:**
   - Are we reading state correctly (no stale data)?
   - Are we writing state correctly (no circular dependencies)?
   - Do mutations propagate to dependent systems?

2. **Performance:**
   - Any O(n²) loops?
   - Deep cloning issues?
   - Unnecessary computation in hot paths?

3. **Cross-System Integration:**
   - Does this interact with ClimatePhase? FoodSecurityPhase?
   - Are there race conditions with other mortality-affecting phases?
   - Is phase order correct in orchestrator?

4. **Complexity Creep:**
   - Is this adding too many parameters?
   - Should any logic be consolidated?
   - Are we duplicating existing functionality?

**Output:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/mortality_stabilizers_architecture_review_20251106.md`

**Quality Gate Decision:**
- ✅ **APPROVE:** No CRITICAL/HIGH issues → Proceed to Monte Carlo validation
- ⚠️ **APPROVE WITH CONDITIONS:** HIGH issues identified → Fix strongly recommended, but can proceed
- ❌ **REJECT:** CRITICAL issues found → MUST fix before proceeding

---

### Phase 4: Monte Carlo Validation
**Duration:** 2-4 hours (including 30-60 min run time)
**Status:** PENDING (blocked on architecture review pass)

#### Step 4.1: Baseline Run (simulation-maintainer / Roy)
**Task:** Run N=10 Monte Carlo BEFORE implementing stabilizers (comparison baseline)

**Command:**
```bash
npx tsx scripts/monteCarloSimulation.ts > /home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/mc_baseline_mortality_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

**Capture:**
- Mortality rates (global avg, regional max)
- Outcome distribution (dystopia %, status quo %, positive %)
- Variance metrics
- Any NaN errors

#### Step 4.2: Stabilizers Run (simulation-maintainer / Roy)
**Task:** Run N=10 Monte Carlo AFTER implementing stabilizers

**Command:**
```bash
npx tsx scripts/monteCarloSimulation.ts > /home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/mc_stabilizers_mortality_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

**Expected Results:**
- **Mortality reduction:** 74-81% → 30-50%
- **Outcome variance:** ~0% → >20%
- **No NaN errors:** 100% clean runs
- **Outcome distribution:**
  - Dystopia: 100% → 30-40%
  - Status quo: 0% → 30-40%
  - Positive: 0% → 20-30%

#### Step 4.3: Comparison Report (simulation-maintainer / Roy)
**Task:** Generate before/after comparison analysis

**Output:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/mortality_stabilizers_validation_report_20251106.md`

**Include:**
- Mortality rate distributions (box plots)
- Outcome classification changes
- Mechanism effectiveness statistics (which stabilizer had most impact?)
- Historical validation (compare to Black Death 30-60%, COVID <1%)
- Failure cascade observations (when/how mechanisms failed)

**Quality Gate Decision:**
- ✅ **VALIDATED:** Mortality 30-50%, variance >20%, no NaN → Proceed to documentation
- ⚠️ **PARTIAL:** Mortality 50-60%, some variance → Investigate, may proceed with caveats
- ❌ **FAILED:** Mortality >60%, NaN errors, no variance → Debug, do not proceed

---

### Phase 5: Documentation & Archival
**Duration:** 2-3 hours
**Status:** PENDING (blocked on validation pass)

#### Step 5.1: Wiki Update (wiki-documentation-updater / historian)
**Task:** Document mortality stabilizer mechanics in main wiki

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/docs/wiki/README.md`

**Add Section: "Mortality Stabilizing Mechanisms"**

**Content:**
1. **Overview:**
   - Purpose: Prevent unrealistic >90% mortality
   - Research basis: Lancet 2025, Nature Medicine 2024, IOM 2024
   - Historical validation: Black Death 30-60%, COVID <1%

2. **Mechanisms:**
   - International Aid (15-44% reduction, conditional on collapse severity)
   - Adaptation (40-80% reduction, time-dependent, resource-dependent)
   - Migration (85% success rate, capacity-limited)
   - Emergency Response (20-40% reduction, degrades under concurrent stress)

3. **Conditional Application:**
   - Regional crisis (< 30% world affected): All mechanisms active
   - Multi-region crisis (30-70% affected): Degraded effectiveness
   - Global crisis (> 70% affected): Minimal effectiveness

4. **Failure Cascades:**
   - Emergency response fails first (concurrent disasters overwhelm)
   - Aid fails second (donor collapse, logistics breakdown)
   - Migration fails third (destination saturation, border closures)
   - Adaptation lasts longest (behavioral/physiological, no external dependency)

5. **Cross-References:**
   - Research: `/research/mortality_stabilizing_mechanisms_20251030.md`
   - Implementation: `/src/simulation/phases/MortalityStabilizersPhase.ts`
   - Validation: `/logs/mortality_stabilizers_validation_report_20251106.md`

#### Step 5.2: Roadmap Update (architect)
**Task:** Mark Week 1 Critical item as COMPLETE

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/plans/MASTER_IMPLEMENTATION_ROADMAP.md`

**Changes:**
1. **Week 1 Critical Section:**
   - ~~1. Mortality Stabilizers (3 days) - 74-81% → 30-50%~~ → ✅ **COMPLETE (Nov 6, 2025)**

2. **Progress Summary:**
   - Add: "Mortality Stabilizers implemented (Nov 6) - reduced 98% mortality to 30-50% realistic levels"
   - Update: "Research Validity: Mortality rate: 98% → 30-50% ✅"

#### Step 5.3: Plan Archival (architect)
**Task:** Move this plan to `/plans/completed/` with summary

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/plans/completed/mortality_stabilizers_implementation_complete_20251106.md`

**Include:**
- Full workflow summary
- Research sources used
- Implementation details
- Monte Carlo validation results
- Lessons learned
- Future improvements identified

---

## Success Criteria

**Research Validity:**
- ✅ All mechanisms have 2024-2025 peer-reviewed sources
- ✅ Failure conditions quantified (not just qualitative)
- ✅ Sylvia's critique addressed (conditional logic implemented)

**Implementation Quality:**
- ✅ Assertion utilities used (no silent fallbacks)
- ✅ Deterministic RNG (reproducible)
- ✅ Emoji conventions followed
- ✅ Unit tests pass (>90% coverage)

**Architecture Health:**
- ✅ No CRITICAL issues (must fix)
- ✅ HIGH issues addressed or documented
- ✅ No performance bottlenecks introduced

**Monte Carlo Validation:**
- ✅ Mortality: 74-81% → 30-50%
- ✅ Outcome variance: ~0% → >20%
- ✅ No NaN errors
- ✅ Historical precedents matched

**Documentation:**
- ✅ Wiki updated with mechanism descriptions
- ✅ Roadmap marked complete
- ✅ Plan archived with results

---

## Risk Mitigation

**Risk 1: Research validation fails (Sylvia rejects)**
- **Mitigation:** Conservative parameter bounds, explicit uncertainty ranges
- **Fallback:** Implement with caveats, flag for future research

**Risk 2: Implementation introduces NaN errors**
- **Mitigation:** Assertion utilities mandatory, test-driven development
- **Detection:** Unit tests catch before Monte Carlo

**Risk 3: Monte Carlo still shows >60% mortality**
- **Mitigation:** Debug mechanism application, check conditional logic
- **Investigation:** Trace mortality calculation paths, identify missing stabilizers

**Risk 4: Architecture review finds CRITICAL issues**
- **Mitigation:** Fix before proceeding (non-negotiable)
- **Timeline:** Add 4-8 hours for remediation

**Risk 5: Outcome variance remains near 0%**
- **Investigation:** May be bifurcation formula issue (separate from this work)
- **Action:** Document, recommend for Week 2 investigation

---

## Timeline & Dependencies

```
Day 1 (6 hours):
├─ Research verification (Cynthia): 2-3 hours
├─ Research critique (Sylvia): 2-3 hours
└─ Quality Gate 1 decision: 1 hour

Day 2 (10 hours):
├─ Phase implementation (Roy): 6-8 hours
├─ Unit tests: 2-3 hours
└─ Integration testing: 1 hour

Day 3 (8 hours):
├─ Architecture review: 3-4 hours
├─ Quality Gate 2 remediation: 2-3 hours
├─ Baseline Monte Carlo: 1 hour
└─ Stabilizers Monte Carlo: 1 hour

Day 4 (4 hours):
├─ Validation analysis: 1-2 hours
├─ Wiki documentation: 1-2 hours
└─ Roadmap update & archival: 1 hour
```

**Critical Path:** Research validation → Implementation → Architecture review → Monte Carlo validation

**Parallelization Opportunities:**
- Unit tests can be written in parallel with implementation (if spec is clear)
- Wiki documentation can start during Monte Carlo runs (while waiting)

---

## Post-Implementation

**Future Improvements (Deferred):**
1. **Empirical calibration:** Compare simulation mortality to historical events (2010-2024)
2. **Sensitivity analysis:** Which stabilizer has most variance impact?
3. **Regional heterogeneity:** Different stabilizer effectiveness by country income/governance
4. **Dynamic thresholds:** Failure conditions that evolve over time (resource depletion)

**Related Work (Dependencies):**
- **Week 2:** Bifurcation variance formula validation (may interact with outcome variance)
- **Week 2:** Research parameter updates (may improve stabilizer accuracy)
- **Week 3:** State validation framework (will catch stabilizer state propagation issues)

---

## Appendix: Key Citations

**International Aid:**
- Cavalcanti, D., et al. (2025). Evaluating the impact of two decades of USAID interventions. *The Lancet*, PIIS0140-6736(25)01186-9.

**Adaptation:**
- Ballester, J., et al. (2024). Heat-related mortality in Europe during 2023 and the role of adaptation. *Nature Medicine*.
- Vicedo-Cabrera, A.M., et al. (2022). Future temperature-related mortality considering adaptation. *The Lancet Planetary Health*, 6(10), e784-e792.

**Migration:**
- International Organization for Migration (IOM). (2024). *World Migration Report 2024*.

**Emergency Response:**
- U.S. GAO. (2025). Disaster Assistance High-Risk Series: Federal Response Workforce Readiness. GAO-25-108598.

---

**Plan Status:** ACTIVE
**Owner:** Orchestrator (with agent coordination)
**Next Action:** Begin Phase 1.1 (Research verification)
