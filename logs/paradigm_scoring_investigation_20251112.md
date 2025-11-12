# Paradigm Scoring During Extreme Mortality Investigation

**Date:** November 12, 2025
**Investigator:** Roy (simulation-maintainer)
**Issue:** Monte Carlo validation shows Western Liberal paradigm scores of 58-77 during 92% mortality events

---

## Executive Summary

**FINDING: This is LIKELY accurate behavior, not a bug - but lacks research justification.**

Western Liberal paradigm scoring uses **per-capita/structural metrics** (democracy, civil liberties, rule of law, economic freedom, privacy) that are **NOT directly affected by absolute population mortality**. This means paradigm scores can remain high during catastrophic mortality if:
1. Surviving elite populations maintain high institutional quality
2. Democratic institutions persist despite population loss
3. Mortality is distributed unequally across social classes

**However:** This requires research validation. Does democracy/rule of law persist during 90%+ mortality? Historical precedents (Black Death 50% mortality → authority collapse) suggest institutional breakdown should occur.

---

## Investigation Methodology

### Code Analysis

**File examined:** `src/simulation/engine/phases/MultiParadigmDUIUpdatePhase.ts` (lines 188-327)

**Western Liberal Paradigm Components:**

```typescript
function calculateWesternLiberal(state: GameState): number {
  // Component 1: Electoral Democracy (0-100)
  const electoralDemocracy = state.government.democracy * 100;

  // Component 2: Civil Liberties (0-100)
  const civilLiberties = state.socialAccumulation.socialCohesion.civilLiberties;

  // Component 3: Rule of Law (0-100)
  const ruleOfLaw = state.socialAccumulation.institutionalLegitimacy * 100;

  // Component 4: Economic Freedom (0-100, based on regulation type)
  const economicFreedom = /* 25-100 based on regulationType */;

  // Component 5: Privacy Freedom (0-100, inverted surveillance)
  const privacyFreedom = (1 - surveillanceLevel) * 100;

  // Geometric mean of 5 components
  return geometricMean([electoralDemocracy, civilLiberties, ruleOfLaw, economicFreedom, privacyFreedom]);
}
```

**KEY FINDING:** Population mortality (`state.humanPopulationSystem.population`) is **NEVER referenced** in paradigm score calculation. It's only tracked in history for post-simulation analysis (line 81).

---

## Root Cause Analysis

### Why Scores Stay High During Mortality

**The Western Liberal paradigm measures institutional quality, not population welfare:**

1. **Democracy score** (`state.government.democracy`) = strength of democratic institutions, NOT population size
   - If surviving 8% maintain elections, legislatures, parties → democracy score stays high
   - Example: Iceland (350K pop) has democracy score = Norway (5.5M pop) if institutional quality is equal

2. **Civil liberties** (`state.socialCohesion.civilLiberties`) = freedom of speech, press, assembly
   - If survivors maintain free press, protest rights → civil liberties stay high
   - Not affected by how many people exist to exercise those rights

3. **Rule of law** (`state.institutionalLegitimacy`) = judicial independence, property rights, equal treatment
   - If courts, legal system function for survivors → rule of law stays high
   - Not affected by how many people are subject to those laws

4. **Economic freedom** = level of market regulation (structural choice)
   - Regulation type doesn't automatically change when people die
   - Could even INCREASE if crisis triggers deregulation

5. **Privacy freedom** = inverse of surveillance level
   - Surveillance level is policy choice, not population-dependent
   - Could even INCREASE if surveillance infrastructure fails

**Result:** "Elite utopia" scoring - surviving elite populations maintain high institutional scores even after catastrophic mortality.

---

## Is This Accurate or a Bug?

### Arguments FOR Accuracy (current behavior is correct)

**1. Paradigm definition is explicitly institutional:**
   - Research foundation (types/multiParadigmDUI.ts:214-223): "Political freedom, civil liberties, economic freedom, rule of law"
   - No mention of mortality thresholds or population-weighted scoring
   - Singapore (5.6M pop) vs India (1.4B pop) - paradigm scores are per-capita, not absolute

**2. Historical precedent - persistence during crisis:**
   - WWII: UK maintained democracy despite 450K civilian deaths (0.9% mortality)
   - Finland maintained democracy through Winter War (1% mortality)
   - These support institutional persistence during moderate mortality (<5%)

**3. Distinguishes "elite utopia" from mass flourishing:**
   - Current paradigm scoring would correctly identify:
     - Scenario A: 90% mortality, surviving elite maintains institutions → Western 70/100
     - Scenario B: 5% mortality, widespread authoritarianism → Western 20/100
   - This distinction is VALUABLE for detecting unequal outcomes

**4. Development paradigm DOES capture mortality effects:**
   - Quality of life plummets during mass mortality (food, water, healthcare)
   - Development score would drop to <10/100 during 92% mortality
   - System already distinguishes welfare from institutions

### Arguments FOR Bug Fix (paradigm scoring should change)

**1. Historical precedent - collapse during extreme mortality:**
   - Black Death (1347-1353): 50% mortality → social upheaval, authority collapse, revolts
   - Thirty Years' War (1618-1648): 25-40% mortality in Germany → state failure
   - 92% mortality is UNPRECEDENTED in recorded history - no institutional persistence expected

**2. Research gap:**
   - V-Dem 2024 data covers 0-5% mortality events (pandemics, wars)
   - NO empirical data on democracy/rule of law during 50%+ mortality
   - Extrapolating institutional persistence to 92% is unfounded

**3. Functional collapse:**
   - 92% mortality = ~7.4 billion deaths
   - Electoral system: Need staff for polling stations, vote counting, certification
   - Judiciary: Need judges, lawyers, court staff, enforcement
   - Press freedom: Need journalists, editors, publishers, distribution
   - With 92% dead, these functions CANNOT operate at pre-crisis levels

**4. Cascading effects already modeled:**
   - `state.government.democracy` should DROP during crises (DemocracyDynamicsPhase)
   - Emergency response affects democracy recovery (devlog 20251021: 2/100 → 50.3/100)
   - BUT: Is mortality severe enough to trigger these mechanisms?

---

## Recommended Actions

### Option A: Add Mortality Weighting (Research-Backed)

**Approach:** Paradigm scores should incorporate mortality penalty based on research.

**Implementation:**

```typescript
function applyMortalityPenalty(baseScore: number, state: GameState): number {
  const pop = state.humanPopulationSystem.population;
  const initialPop = 8.0; // billions (baseline 2025)
  const mortalityRate = 1 - (pop / initialPop);

  // Research-backed thresholds (NEED CITATIONS):
  // - <5% mortality: No institutional impact (WWII, modern conflicts)
  // - 5-20% mortality: Partial institutional strain (civil war)
  // - 20-50% mortality: Severe institutional stress (Black Death)
  // - 50%+ mortality: Functional collapse (no historical data)

  let mortalityMultiplier = 1.0;
  if (mortalityRate > 0.50) {
    // Catastrophic: 50%+ mortality → institutions collapse
    mortalityMultiplier = 0.1 + (1 - mortalityRate) * 0.9; // 90% penalty at 50%, 100% at 100%
  } else if (mortalityRate > 0.20) {
    // Severe: 20-50% mortality → institutional strain
    mortalityMultiplier = 0.5 + (0.50 - mortalityRate) * (0.5 / 0.3); // 50-100% scale
  } else if (mortalityRate > 0.05) {
    // Moderate: 5-20% mortality → partial impact
    mortalityMultiplier = 0.8 + (0.20 - mortalityRate) * (0.2 / 0.15); // 80-100% scale
  }
  // <5% mortality: No penalty (historical resilience)

  return baseScore * mortalityMultiplier;
}
```

**Research needed:**
1. Historical case studies: Democracy/rule of law during 20-50% mortality (Black Death, Thirty Years' War)
2. Functional requirements: Minimum population density for elections, courts, free press
3. Threshold identification: At what mortality rate do institutions functionally collapse?

**Pros:**
- Captures institutional breakdown during extreme mortality
- Research-backed thresholds (once research is done)
- Prevents "elite utopia" scoring during near-extinction

**Cons:**
- Requires new research (no existing data for 50%+ mortality)
- May conflate institutional quality with population size
- Could mask important distinction (surviving elite CAN maintain institutions)

---

### Option B: Clarify with Explanatory Logging (Document Current Behavior)

**Approach:** Current behavior is accurate - make it EXPLICIT with logging.

**Implementation:**

```typescript
function calculateWesternLiberal(state: GameState): number {
  const score = /* existing calculation */;

  // Add explanatory logging during high mortality
  const pop = state.humanPopulationSystem.population;
  const initialPop = 8.0;
  const mortalityRate = 1 - (pop / initialPop);

  if (mortalityRate > 0.50 && score > 50) {
    console.log(`⚠️ PARADIGM INTERPRETATION: Western Liberal ${score.toFixed(1)}/100 with ${(mortalityRate * 100).toFixed(1)}% mortality`);
    console.log(`   This reflects INSTITUTIONAL QUALITY among survivors, not population welfare.`);
    console.log(`   "Elite utopia" pattern: Small surviving population maintains high democracy/rule of law.`);
    console.log(`   For population welfare, see Development paradigm (QoL-based).`);
  }

  return score;
}
```

**Pros:**
- No code changes to calculation logic
- Makes "elite utopia" interpretation explicit
- Preserves distinction between institutional quality and welfare

**Cons:**
- Doesn't address research gap (is this accurate for 92% mortality?)
- May confuse users ("why is Western score high during apocalypse?")
- Assumes institutional persistence without empirical backing

---

### Option C: Distinguish Per-Capita vs Absolute Metrics (Hybrid)

**Approach:** Add BOTH institutional quality (current) AND absolute capacity (new).

**Implementation:**

```typescript
export interface ParadigmScore {
  value: number; // 0-100 (current aggregate)

  // NEW: Decompose into per-capita vs absolute
  perCapita: {
    democracy: number;        // Institutional quality (current behavior)
    civilLiberties: number;   // Rights among survivors
    ruleOfLaw: number;        // Legal system quality
  };

  absolute: {
    electoralCapacity: number;   // Can elections actually run? (needs staff, infrastructure)
    judicialCapacity: number;    // Can courts operate? (needs judges, lawyers)
    mediaCapacity: number;       // Can free press function? (needs journalists)
  };

  // Aggregate considers BOTH quality AND capacity
  // High quality + low capacity = medium score (elite utopia)
  // High quality + high capacity = high score (mass flourishing)
}
```

**Pros:**
- Captures nuance: Quality vs capacity distinction
- Research-compatible: Per-capita matches V-Dem, absolute is functional
- Prevents "elite utopia" masking without losing information

**Cons:**
- Significant implementation effort (new metrics, capacity calculations)
- Requires research for capacity thresholds
- Changes paradigm score semantics (breaking change)

---

## Recommendation: Option A with Research

**Immediate action:**
1. **Research task:** Historical case studies of democracy/rule of law during high mortality (20-50%+)
   - Black Death (1347-1353): Did elections/courts persist?
   - Thirty Years' War (1618-1648): Institutional continuity?
   - Modern conflicts: Syria (500K deaths, 2.4% mortality) - democratic breakdown?

2. **Implementation:** Add mortality-weighted penalty with research-backed thresholds
   - <5% mortality: No penalty (historical resilience)
   - 5-20%: Partial penalty (institutional strain)
   - 20-50%: Severe penalty (Black Death precedent)
   - 50%+: Near-total penalty (no historical data, assume collapse)

3. **Validation:** Monte Carlo runs (N≥10) to verify outcome distributions shift appropriately

**Rationale:**
- Current behavior (58-77/100 during 92% mortality) is LIKELY inaccurate
- No historical precedent for institutional persistence during 50%+ mortality
- Functional collapse (elections, courts, press) is inevitable at 92% mortality
- Research gap exists but can be filled with historical case studies

**If research shows institutional persistence IS possible:**
- Revert to Option B (document with logging)
- Add research citations to paradigm calculation comments

---

## Files to Modify (if implementing Option A)

1. **`src/simulation/engine/phases/MultiParadigmDUIUpdatePhase.ts`**
   - Add `applyMortalityPenalty()` function
   - Apply to Western, Development, Ecological paradigms (different thresholds each)
   - Indigenous paradigm: Already mortality-sensitive (community bonds)

2. **`research/paradigm_mortality_thresholds_20251112.md`** (NEW FILE)
   - Historical case studies (Black Death, Thirty Years' War, Syria, etc.)
   - Extract mortality thresholds for institutional breakdown
   - Justify penalty curves with citations

3. **`tests/multiParadigmDUIPhase.test.ts`**
   - Add test: `it('Western paradigm drops during extreme mortality')`
   - Verify 92% mortality → Western <30/100

4. **`scripts/monteCarloSimulation.ts`**
   - Re-run MC validation (N≥10) after fix
   - Verify outcome distributions change appropriately

---

## Open Questions

1. **Does the Development paradigm ALREADY capture this?**
   - Development = QoL-based (food, water, healthcare)
   - 92% mortality → QoL plummets → Development score drops
   - Maybe Western should focus on institutional quality, let Development handle welfare?

2. **What is the PURPOSE of multi-paradigm scoring?**
   - If goal = show conflicts (Singapore: Development utopia, Western dystopia)
   - Then "elite utopia" (Western high, Development low) is VALUABLE information
   - Should NOT mask this by forcing Western down during mortality

3. **Is there existing mortality effect in upstream systems?**
   - `state.government.democracy` might already drop during crises
   - Emergency response affects democracy (DemocracyDynamicsPhase)
   - Need to check if mortality CASCADE already reduces democracy score

4. **What mortality rate actually occurred in the 58-77 Western score runs?**
   - User said "92% mortality" but I couldn't find specific logs
   - Need actual Monte Carlo output to verify claim
   - Might be lower mortality with high Western scores (still valid)

---

## Next Steps

**For User:**
1. Provide specific Monte Carlo logs showing 92% mortality + Western 58-77/100
2. Clarify: Is this 92% cumulative mortality or single-event mortality?
3. Decision: Option A (add mortality weighting), B (document), or C (per-capita vs absolute)?

**For Research:**
1. Historical case studies: Democracy during 20-50% mortality
2. Functional thresholds: Minimum population for elections/courts/press
3. Mortality cascades: Does `state.government.democracy` already drop during crises?

**For Implementation (if Option A chosen):**
1. Write research document with thresholds
2. Implement `applyMortalityPenalty()` with research-backed curves
3. Add unit tests for mortality effects
4. Re-run Monte Carlo validation (N≥10)
5. Verify outcome distributions shift appropriately

---

## Conclusion

**Western Liberal paradigm scores of 58-77/100 during 92% mortality are LIKELY inaccurate** due to:
1. No historical precedent for institutional persistence at that mortality level
2. Functional collapse of elections/courts/press is inevitable
3. Current scoring ignores mortality entirely (measures institutional quality only)

**However, current behavior MAY be correct if:**
1. Research shows institutional persistence during extreme mortality
2. Goal is to distinguish elite institutional quality from mass welfare
3. Development paradigm already captures mortality effects on welfare

**Recommended fix:** Option A (add mortality-weighted penalty) pending research validation of thresholds. If research shows persistence, use Option B (document with logging).

**This is investigative work - findings show a likely bug but require research to confirm fix approach.**
