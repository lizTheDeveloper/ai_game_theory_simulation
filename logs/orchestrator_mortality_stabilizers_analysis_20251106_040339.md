# Mortality Stabilizers Investigation - Orchestrator Analysis
**Date:** 2025-11-06
**Priority:** WEEK 1 CRITICAL (4-week consensus plan)
**Orchestrator:** workflow-orchestrator

## Problem Statement

Roadmap indicates mortality still at 74-81% when target is 30-50% with stabilizers. User requested implementation, but investigation reveals:

**Stabilizers ARE fully implemented** (447 lines, 7 mechanisms, integrated into bayesianMortality.ts).

The issue is likely **parameter tuning or global catastrophe flags disabling them prematurely**.

## Code Analysis

### Implementation Status: ✅ COMPLETE

1. **MortalityStabilizersPhase.ts** (447 lines)
   - Order: 20.8 (BEFORE BayesianMortalityResolutionPhase at 35.0)
   - 7 mechanisms: aid, adaptation, migration, emergency response, cascades
   - Registered in engine.ts line 549
   - Uses assertion utilities (no defensive fallbacks)

2. **Integration: ✅ CONNECTED**
   - bayesianMortality.ts lines 298-312: Applies `combinedReduction`
   - Formula: `deathProb *= (1 - avgReduction)`
   - Population-weighted across regions

3. **Initialization: ✅ PRESENT**
   - mortalityStabilizersInit.ts: Creates stabilizer structures
   - populationDynamics.ts imports and uses initialization

### Likely Root Cause: Global Catastrophe Logic

**Line 174 (MortalityStabilizersPhase.ts):**
```typescript
if (globalIndicators.globalCrisisActive) {
  // GLOBAL CATASTROPHE: No donors exist
  aid.effectivenessLevel = 'none';
  aid.donorAvailability = 0.0;
  aid.mortalityReduction = 0.0;
  aid.donorFatigue = 1.0; // Complete exhaustion
  return;
}
```

**Global crisis threshold (line 136):**
```typescript
const globalCrisisActive = (collapsed / totalMajorEconomies) > 0.5;
```

If >5 of 10 major economies collapse, aid = 0%. This is **research-accurate** (Sylvia's critique: "aid requires donors"), but we need to verify:

1. Are major economies collapsing too fast?
2. Are the other stabilizers (adaptation, migration, emergency) still functional?
3. Is the regional vs global branching logic correct?

## Hypothesis

**74-81% mortality suggests stabilizers are mostly inactive.** Possible causes:

1. **Global crisis flag triggers Month 1-3** → aid goes to zero immediately
2. **Heat adaptation never develops** → `climateCrisisActive` flag not set
3. **Migration effectiveness near zero** → food security already catastrophic
4. **Emergency response overwhelmed** → workforce/resources depleted

## Required Actions

### Phase 1: Diagnostic Logging (2-4 hours)

Add comprehensive logging to MortalityStabilizersPhase to track:
- Which regions have stabilizers initialized
- Aid effectiveness level by region
- Adaptation development progress (months exposed, types active)
- Migration success rates
- Emergency response effectiveness
- Combined reduction values
- Global crisis indicators (major economies collapsed)

### Phase 2: Parameter Validation (2-3 hours)

Check:
- Major economy collapse thresholds (currently >50%)
- Climate crisis activation logic
- Food security decline rates (affecting migration)
- Emergency response workforce availability

### Phase 3: Targeted Fixes (2-4 hours)

Based on diagnostics:
- Adjust global crisis threshold if triggering too early
- Ensure adaptation develops even without specific crisis flags
- Tune migration/emergency response parameters
- Validate cascade failure logic

### Phase 4: Monte Carlo Validation (4-6 hours)

Run N=10 with:
- Diagnostic logging enabled
- Per-region mortality tracking
- Stabilizer effectiveness analysis
- Outcome distribution comparison (74-81% → 30-50%)

## Research Validation

**Sylvia's Quality Gate 1 (Oct 30):** CONDITIONAL PASS
- Aid data: ✅ VERIFIED (Cavalcanti et al. 2025, Lancet)
- Adaptation data: ✅ PARTIALLY VERIFIED (Ballester et al. 2024, Nature Medicine)
- Migration data: ✅ VERIFIED (IOM 2024)
- Emergency response: ⚠️ WEAK EVIDENCE (acknowledged)

**Critical caveat:** All data from REGIONAL crises. Global catastrophe scenarios SHOULD disable most mechanisms (research-accurate).

**Therefore:** 74-81% mortality is CORRECT for true global catastrophes, but 30-50% should be achievable for regional/medium crises.

## Success Criteria

1. **Diagnostic clarity:** Can trace which stabilizers active/inactive each month
2. **Parameter validation:** Global crisis doesn't trigger before Month 6-12
3. **Regional variance:** Some regions show <50% mortality (stabilizers working)
4. **Monte Carlo distribution:** Not 100% dystopia (some runs with functional stabilizers)
5. **Documentation:** Clear parameter justification for all thresholds

## Recommended Workflow

**Assign to:** Roy (simulation-maintainer)
- Deep context on defensive coding, assertions, emoji conventions
- Familiar with phase execution order and state mutation patterns
- Can add diagnostic logging without introducing defensive fallbacks

**Timeline:** 8-12 hours (within 3-day Week 1 target)

**Quality Gates:**
- ✅ Gate 1: Research validated (DONE - Sylvia CONDITIONAL PASS)
- ⏩ Gate 2: Architecture review after fixes (ensure assertions, no fallbacks)

## Next Steps

1. Invoke Roy with this analysis
2. Add diagnostic logging to MortalityStabilizersPhase
3. Run single simulation with detailed logging
4. Analyze why stabilizers inactive
5. Adjust parameters or thresholds as needed
6. Monte Carlo N=10 validation
7. Architecture review (ensure no defensive patterns introduced)
8. Documentation update

---

**Orchestrator Notes:**

This is NOT a "missing implementation" issue. The code exists and is sophisticated. This is a **parameter tuning and diagnostics** issue - exactly Roy's domain. The stabilizers may be working correctly (global catastrophe logic is research-accurate), but we need visibility into WHY mortality is so high.

