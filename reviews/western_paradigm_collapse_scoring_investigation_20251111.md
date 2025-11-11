# Western Paradigm Collapse Scoring Investigation
**Investigator:** Roy (Simulation Maintainer)
**Date:** November 11, 2025
**Issue:** Monte Carlo Issue #7 - Western Liberal scores 58-77 during 92% mortality events
**Priority:** MEDIUM (model calibration, not blocking)

---

## Executive Summary

**CLASSIFICATION: EXPECTED BEHAVIOR + MODELING CHOICE**

Western Liberal paradigm scores remain relatively high (58-77/100) during catastrophic collapse (92% mortality) because **population mortality is NOT a direct input to Western Liberal scoring**. The paradigm measures procedural democracy quality, civil liberties, rule of law, economic freedom, and privacy - institutional metrics that can persist (or even strengthen) during collapse.

**Historical analog:** Weimar Germany maintained democratic procedures during hyperinflation. UK democracy score remained high during WWII despite 450k deaths. Elections continued during COVID-19 with 7M dead.

**This is NOT a bug, but it IS a research question worth exploring:** Should catastrophic mortality lower Western Liberal scores? If so, through what mechanism?

---

## 1. Current Scoring Logic

**File:** `/src/simulation/engine/phases/MultiParadigmDUIUpdatePhase.ts`
**Function:** `calculateWesternLiberal(state)` (lines 208-327)

### Western Liberal Components (5 indicators, geometric mean)

1. **Electoral Democracy (20%):** `state.government.democracy * 100` (0-100)
2. **Civil Liberties (20%):** `state.socialAccumulation.socialCohesion.civilLiberties` (0-100)
3. **Rule of Law (20%):** `state.socialAccumulation.institutionalLegitimacy * 100` (0-100)
4. **Economic Freedom (20%):** Mapped from `state.government.structuralChoices.regulationType` (0-100)
5. **Privacy/Freedom from Surveillance (20%):** `(1 - surveillanceLevel) * 100` (0-100)

**Geometric mean:** Score = (product of 5 indicators)^(1/5) * 100

**NO DIRECT MORTALITY INPUT.** Population decline does not appear in this formula.

---

## 2. Indirect Mortality Pathways (What Actually Exists)

**File:** `/src/simulation/engine/phases/DemocracyDynamicsPhase.ts` (lines 38-459)

Western Liberal components ARE affected by mortality, but **only indirectly** through crisis pressure:

### Democracy Component Update (function `calculateCrisisPressure`, lines 208-268):

```typescript
// Economic crisis (unemployment → authoritarian demand)
pressure += unemployment * 0.3;

// Environmental crisis (scarcity → conflict)
pressure += (resourceDepletion / 100) * 0.2;

// Nuclear conflict (existential threat → emergency powers)
if (state.nuclearWinterState?.active) {
  pressure += 0.5;
}

// Refugee crisis (displacement → xenophobia → strongman appeal)
pressure += activeCrises * 0.05;

// Emergency response REDUCES pressure (shows govt competence)
pressure = pressure * (1.0 - avgEffectiveness * 0.4);
```

**CRITICAL OBSERVATION:**
- Unemployment is an input (line 216)
- Nuclear winter is an input (line 227)
- Refugee crises are inputs (line 239)
- **Population mortality is NOT an input**

### Where's the Population Connection?

**Unemployment calculation:** `/src/simulation/calculations.ts` (lines 422-514)

```typescript
let unemployment =
  baseUnemployment +
  (netAIUnemployment * stageMultiplier * policyMitigation * retrainingEffect) +
  (netBionicUnemployment * stageMultiplier);
```

**NO POPULATION TERM.** Unemployment is calculated from:
- AI displacement
- Bionic skills displacement
- Policy interventions (UBI, job guarantee, retraining)
- Automatic stabilizers (5% dampening)

**Population mortality does NOT directly increase unemployment in this model.**

---

## 3. Why Western Scores Stay High During Collapse

### Mechanism 1: Procedural Democracy Persists

**Research analog:**
- **Weimar Germany (1919-1933):** Electoral democracy index ~0.7 during hyperinflation (1923, 50% unemployment)
- **UK during WWII (1939-1945):** Democracy score high despite 450k deaths + rationing
- **COVID-19 (2020-2022):** Elections continued globally with 7M deaths

**Democracy measures procedure quality, not societal wellbeing.** You can have:
- Free and fair elections (high democracy)
- With 92% of population dead (catastrophic collapse)
- If survivors maintain procedural legitimacy

### Mechanism 2: Crisis Pressure Has Ceilings

From `calculateCrisisPressure()`:
- Max unemployment contribution: 0.3 (at 100% unemployment)
- Max resource depletion: 0.2 (at 0% reserves)
- Nuclear winter: 0.5 (binary flag)
- Refugee crises: 0.05 per crisis

**Total max crisis pressure: ~1.0 (capped)**

Even at maximum crisis, democracy decay is limited:
```typescript
change -= crisisPressure * 0.01; // Max -0.01/month
// At max pressure, democracy decays at -1%/month
// Takes 50 months to lose 50 points
```

**But Monte Carlo runs are 120 months.** If collapse happens late (month 80+), democracy might only drop 40 points from 0.7 → 0.3 (still 30/100 in Western score).

### Mechanism 3: Emergency Response REDUCES Pressure

Lines 242-265:
```typescript
// Effective emergency responses REDUCE crisis pressure
const pressureReduction = avgEffectiveness * 0.4;
pressure = Math.max(0, pressure * (1.0 - pressureReduction));
```

**If government deploys effective emergency responses during collapse, crisis pressure DECREASES.**

This creates the paradox:
- 92% mortality event
- Government emergency response is "effective" (prevents 93rd% from dying?)
- Crisis pressure reduced by up to 40%
- Democracy/civil liberties decay slows
- Western Liberal score stays relatively high

---

## 4. Historical Analogs: Is This Realistic?

### Case 1: Weimar Germany (1923 Hyperinflation)
- **Electoral Democracy:** Maintained (V-Dem index ~0.7)
- **Civil Liberties:** High (Weimar Constitution protected rights)
- **Economic Freedom:** Collapsed (hyperinflation)
- **Mortality:** Moderate (famine, unrest)
- **Western Liberal Score Estimate:** 40-60/100 (procedures intact, economy broken)

**Lesson:** Democracy can persist through economic collapse if institutional legitimacy remains.

### Case 2: Soviet Union (1932-33 Holodomor)
- **Electoral Democracy:** None (0)
- **Civil Liberties:** None (0)
- **Rule of Law:** None (0)
- **Mortality:** 3.5-7M deaths (10-20% of Ukraine)
- **Western Liberal Score:** <10/100 (already authoritarian)

**Lesson:** Low democracy before crisis → stays low during crisis. Not informative.

### Case 3: COVID-19 (2020-2022)
- **Electoral Democracy:** Maintained globally (elections continued)
- **Civil Liberties:** Temporarily restricted (lockdowns) but recovered
- **Rule of Law:** Maintained
- **Mortality:** 7M deaths (0.09% global mortality)
- **Western Liberal Score:** Dropped 5-10 points, recovered by 2023

**Lesson:** Low mortality (0.09%) → democracy resilient. But 92% mortality has NO historical precedent.

### Case 4: Black Death (1347-1353)
- **Electoral Democracy:** N/A (feudalism)
- **Mortality:** 30-60% in affected regions
- **Outcome:** Labor shortages → peasant uprisings → feudalism weakening → proto-democracy emergence

**Lesson:** Extreme mortality CAN increase freedom (survivors have bargaining power). Not just authoritarian drift.

---

## 5. The Core Question

**Is 58-77/100 Western Liberal score plausible during 92% mortality?**

### Argument FOR (Current Model is Correct):

1. **Procedural democracy is context-independent.** If survivors maintain free elections, score should be high regardless of population size.

2. **Historical precedent exists for democracy during crisis.** UK WWII, Weimar hyperinflation, COVID elections.

3. **Labor scarcity can INCREASE freedom.** Black Death → peasant revolts → feudalism decline. 92% mortality → survivors have massive bargaining power → civil liberties expand?

4. **Institutional inertia.** Constitutions, courts, electoral systems persist even when population collapses.

5. **This is a FEATURE of multi-paradigm measurement.** Western Liberal says "institutions intact" while Development/Ecological say "catastrophic collapse." That's the diagnostic value - paradigms disagree.

### Argument AGAINST (Model Needs Mortality Input):

1. **Catastrophic mortality breaks institutions.** 92% dead → who runs elections? Who enforces rule of law? Scores should collapse.

2. **No historical precedent for 92% global mortality.** Weimar/WWII/COVID are <1% mortality. Black Death was regional. We're in uncharted territory.

3. **Crisis pressure ceiling is too low.** Max -1%/month democracy decay allows 50+ points to persist over 120 months. Should be exponential decay during true collapse.

4. **Emergency response paradox.** How does "effective emergency response" happen with 92% dead? This suggests population mortality should DISABLE emergency responses, increasing crisis pressure.

5. **Population-infrastructure disconnect.** 93% dead but organizations have 75% survival, data centers at 12PF capacity. This breaks causality (Sylvia's critique, line 125-130).

---

## 6. Proposed Mechanisms (If We Decide This is a Problem)

### Option A: Direct Mortality Penalty (Simple)

Add mortality rate as 6th Western Liberal indicator:

```typescript
// Population Stability (inverted mortality rate)
const mortalityRate = 1 - (state.humanPopulationSystem.population / state.initialPopulation);
const populationStability = (1 - mortalityRate) * 100; // 92% dead → 8/100

const indicators = [
  adjustedDemocracy,
  civilLiberties,
  adjustedRuleOfLaw,
  economicFreedom,
  privacyFreedom,
  populationStability // NEW
];
```

**Effect:** 92% mortality → populationStability = 8 → geometric mean crushes Western score to <20.

**Pros:** Simple, directly addresses issue.
**Cons:** Is "population stability" a Western Liberal value? Or is it Development paradigm?

### Option B: Mortality → Unemployment (Indirect, Research-Backed)

Add population decline term to unemployment calculation:

```typescript
// Mass mortality → labor force collapse → production collapse → unemployment
const mortalityRate = 1 - (state.humanPopulationSystem.population / state.initialPopulation);
const mortalityUnemployment = mortalityRate > 0.2 ? (mortalityRate - 0.2) * 0.5 : 0;
// 92% mortality → 72% points → +36% unemployment

unemployment += mortalityUnemployment;
```

**Effect:** 92% mortality → unemployment +36% → crisis pressure +0.108 → democracy decays faster.

**Pros:** Indirect pathway (mortality → economy → politics), matches causal logic.
**Cons:** Does mass death INCREASE unemployment? Or does it DECREASE (fewer job seekers)?

**Research needed:**
- Black Death: Labor shortages → wages UP, unemployment DOWN (not what we'd model)
- WWII: Deaths → labor shortages → women/elderly recruited → unemployment DOWN
- COVID-19: Deaths → economic disruption → unemployment UP (but only 0.09% mortality)

**At 92% mortality, which dominates?**
- Fewer workers (unemployment DOWN, labor shortage)
- Economic collapse (unemployment UP, no production)

### Option C: Mortality → Crisis Pressure Multiplier (Nonlinear)

```typescript
// Catastrophic mortality overwhelms institutions
const mortalityRate = 1 - (state.humanPopulationSystem.population / state.initialPopulation);

// Catastrophic mortality multiplier (nonlinear)
// 0-20% mortality: 1.0× (historical range)
// 20-50% mortality: 1.0-2.0× (severe)
// 50-80% mortality: 2.0-5.0× (collapse)
// 80-100% mortality: 5.0-20.0× (extinction-level)
let catastrophicMultiplier = 1.0;
if (mortalityRate > 0.8) {
  catastrophicMultiplier = 5.0 + (mortalityRate - 0.8) * 75; // 80% → 5×, 100% → 20×
} else if (mortalityRate > 0.5) {
  catastrophicMultiplier = 2.0 + (mortalityRate - 0.5) * 10; // 50% → 2×, 80% → 5×
} else if (mortalityRate > 0.2) {
  catastrophicMultiplier = 1.0 + (mortalityRate - 0.2) * 3.33; // 20% → 1×, 50% → 2×
}

pressure = Math.min(10.0, pressure * catastrophicMultiplier);
```

**Effect:** 92% mortality → 14× crisis pressure → democracy decay -14%/month → collapse in 7 months.

**Pros:** Nonlinear reflects reality (90% mortality is NOT 3× worse than 30%, it's 100× worse).
**Cons:** Arbitrary breakpoints, no research justification for multiplier values.

### Option D: Mortality → Governance Collapse (Disables Recovery)

```typescript
// Calculate governance quality (protective factor)
function calculateGovernanceQuality(state: GameState): number {
  const mortalityRate = 1 - (state.humanPopulationSystem.population / state.initialPopulation);

  // Catastrophic mortality destroys state capacity
  const mortalityPenalty = mortalityRate > 0.5 ? (mortalityRate - 0.5) * 2 : 0;
  // 92% mortality → -0.84 penalty

  const legitimacy = Math.max(0, state.government.legitimacy - mortalityPenalty);
  const capacity = Math.max(0, state.government.governanceQuality.institutionalCapacity - mortalityPenalty);
  const transparency = Math.max(0, state.government.governanceQuality.transparency - mortalityPenalty);

  return (legitimacy + capacity + transparency) / 3;
}
```

**Effect:** 92% mortality → governance quality near 0 → democracy recovery mechanisms disabled → natural decay dominates.

**Pros:** Addresses "how do effective emergency responses happen with 92% dead?" paradox.
**Cons:** Still allows 58-77 scores if initial values were high (just stops recovery).

---

## 7. Recommendation

**SHORT-TERM (No Code Changes):**

**Document this as EXPECTED BEHAVIOR** in the wiki. Western Liberal paradigm measures institutional quality, not societal wellbeing. High scores during collapse are theoretically valid (see Weimar, UK WWII analogs).

**Add research question to roadmap:** "Should catastrophic mortality (>50%) lower Western Liberal scores? If so, how?"

**MEDIUM-TERM (Research Phase):**

**Commission research review:** Historical precedents for democracy during >50% mortality events.
- Black Death regional case studies
- Indigenous population collapse (1492-1600, 90% mortality in Americas)
- Theoretical work on institutional persistence thresholds

**LONG-TERM (If Research Says "Yes, This is Wrong"):**

**Implement Option C (Mortality → Crisis Pressure Multiplier) OR Option D (Mortality → Governance Collapse).**

Option B (Mortality → Unemployment) has unclear causal direction (does mass death increase or decrease unemployment?).

Option A (Direct Mortality Penalty) conflates Development paradigm (population wellbeing) with Western Liberal (institutional quality).

---

## 8. Cross-References

**Related issues:**
- Monte Carlo Issue #8 (Biosphere 47× threshold) - Population mortality attribution bugs
- Monte Carlo Issue #9 (100% dystopia outcomes) - All paradigms collapsing together
- Population-infrastructure disconnect (Sylvia critique, line 125-130)

**Files requiring attention if we implement fixes:**
- `/src/simulation/engine/phases/MultiParadigmDUIUpdatePhase.ts` (Western Liberal calculation)
- `/src/simulation/engine/phases/DemocracyDynamicsPhase.ts` (crisis pressure calculation)
- `/src/simulation/calculations.ts` (unemployment calculation, if Option B)

**Tests requiring updates:**
- `/tests/multiParadigmDUIPhase.test.ts` - Add mortality edge cases
- New test: "92% mortality should lower Western Liberal score to <X" (define X based on research)

---

## 9. Final Verdict

**CLASSIFICATION: EXPECTED BEHAVIOR (with caveats)**

Current model is theoretically defensible - procedural democracy CAN persist during societal collapse if institutional legitimacy remains. Historical analogs exist (Weimar, UK WWII).

**HOWEVER:** 92% mortality has NO historical precedent. Extrapolating from <1% mortality events (COVID) to 92% is methodologically unsound.

**MODELING CHOICE REQUIRED:** Research team must decide:
1. Is Western Liberal score intended to measure **institutional procedures** (current) or **effective governance** (requires population input)?
2. At what mortality threshold do institutions collapse regardless of initial legitimacy?
3. Should we model Black Death dynamics (labor scarcity → freedom increase) or modern state collapse (mortality → institutional failure)?

**Priority: MEDIUM** - This affects model interpretation but doesn't block development. Document current behavior, add research question to roadmap, revisit after historical mortality research.

---

**Investigation complete.** Ready for research team discussion.

**Next steps:**
1. Add "Western Paradigm Mortality Response" research question to roadmap
2. Document current behavior in wiki (`docs/wiki/mechanics/multi-paradigm-dui.md`)
3. Create test case: "Western Liberal score response to mortality spectrum (0%, 10%, 30%, 50%, 90%)"
4. Commission historical research on institutional persistence during >50% mortality events

---

**Signed:** Roy (Simulation Maintainer)
**Date:** November 11, 2025
**Status:** Investigation complete, awaiting research team input
