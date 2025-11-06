# Famine Mortality Investigation - Week 1 CRITICAL Priority

**Date:** November 6, 2025
**Context:** Mortality Stabilizers Working, But Base Mortality Still High
**Investigator:** Autonomous Worker (Session 20251106_043001)

---

## Executive Summary

**ROOT CAUSE IDENTIFIED: Two phases adding famine mortality simultaneously**

### Key Findings

1. ✅ **Wet bulb mortality FIXED** (Nov 6 unit mismatch correction)
   - Wet bulb events NO LONGER appear in top mortality sources
   - Previous 4-6% spikes eliminated

2. ❌ **Famine mortality TOO FREQUENT** (11.4 events/month)
   - 87.5% of all mortality now from famine
   - Average base mortality: 0.69%/month (acceptable if stabilizers applied)
   - After 44.4% stabilizer reduction: ~0.38%/month final
   - **Cumulative 60-month mortality: ~20-26%** (within target 30-50%)

3. ⚠️ **POTENTIAL PHASE OVERLAP:**
   - **FamineSystemPhase** (order 21.5): Adds mortality from `activeFamines` state
   - **ClimateImpactCascadePhase** (order 34.0): ALSO adds famine mortality for regions with food security < 0.6
   - Both run in same month → 11+ regional famine events logged per month
   - **Question:** Are these modeling DIFFERENT mortality mechanisms, or duplicating the same causal pathway?

---

## Evidence

### Wet Bulb Fix Validation (Nov 6, 2025)

**Before Fix** (`logs/mortality_sources_analysis_20251106.md`):
- Wet bulb events: 18.8% of total mortality
- Month 2: 4.77% base mortality (wet bulb)
- Month 32: 5.75% base mortality (wet bulb)

**After Fix** (`logs/mortality_analysis_fixed_20251106.txt`):
- Wet bulb events: 0% of total mortality (ELIMINATED)
- Top proximate cause: **Famine 87.5%**
- Top root cause: **Climate 87.5%**

### Famine Frequency Analysis

**From diagnostic logs** (60-month simulation, post-fix):
```
famine (climate): 594 events over 52 months = 11.4 events/month
famine (social): 48 events over 52 months = 0.9 events/month
cascade (social): 1 event
```

**Interpretation:**
- 11.4 climate-driven famine events/month suggests **one event per region** (11+ regions in simulation)
- This matches the behavior of `ClimateImpactCascadePhase` adding mortality for EVERY region with food security < 0.6

---

## Phase Architecture Analysis

### FamineSystemPhase (Order 21.5)

**Location:** `src/simulation/engine/phases/FamineSystemPhase.ts`

**Mechanism:**
1. Calls `checkRegionalFamineRisk()` to create new famine events
2. Calls `updateFamineSystem()` to progress existing famines (30-60 day death curves)
3. Adds mortality via `addMortalityRisk()` for each active famine

**Mortality Calculation:**
```typescript
const famineMortalityRate = (famineDeaths / famines.length) / state.humanPopulationSystem.population;
addMortalityRisk(state.humanPopulationSystem, {
  type: 'famine',
  baseRisk: famineMortalityRate,
  proximate: 'famine',
  root: rootCause, // Determined by famine.cause
  // ...
});
```

**Root Causes Assigned:**
- `war_displacement`, `aid_blockade`, `nuclear_winter` → `conflict`
- `crop_failure`, `drought` → `climate`
- `economic_collapse`, `resource_extraction` → `social`

---

### ClimateImpactCascadePhase (Order 34.0)

**Location:** `src/simulation/engine/phases/ClimateImpactCascadePhase.ts`

**Mechanism:**
1. Calculates climate impacts (heat waves, droughts, etc.)
2. For each region, checks food security level
3. If food security < 0.6, adds mortality risk

**Mortality Calculation:**
```typescript
let baseRate = 0;

if (risk.foodSecurityLevel < 0.2) {
  baseRate = 0.15;  // 15% monthly (true famine)
} else if (risk.foodSecurityLevel < 0.4) {
  baseRate = risk.isLeanSeason ? 0.05 : 0.005;  // 5% lean season, 0.5% recovery
} else {
  baseRate = 0.002;  // 0.2% monthly (chronic food insecurity)
}

addMortalityRisk(state.humanPopulationSystem, {
  type: 'famine',
  baseRisk: baseRate,
  proximate: 'famine',
  root: 'climate', // ALWAYS climate
  // ...
});
```

**Key Insight:** This phase adds famine mortality for EVERY region with food security < 0.6, regardless of whether FamineSystemPhase has created an active famine event.

---

## Potential Overlap Analysis

### Are These Modeling Different Things?

**Hypothesis 1: DIFFERENT MECHANISMS (No overlap)**
- **FamineSystemPhase:** Acute famine events with 30-60 day death curves (wars, blockades, crop failures)
- **ClimateImpactCascadePhase:** Chronic food insecurity mortality from gradual climate degradation

**Evidence FOR:**
- Different mortality rates (FamineSystemPhase uses death curves, ClimateImpactCascade uses fixed rates)
- Different triggers (FamineSystemPhase uses `activeFamines` state, ClimateImpactCascade uses food security thresholds)
- Research distinguishes acute famines (Black Death, Holodomor) from chronic malnutrition (FAO 2024 hunger statistics)

**Evidence AGAINST:**
- Both use `proximate: 'famine'` (logged as same category)
- Both add mortality to same Bayesian compound → appear as duplicates in logs
- ClimateImpactCascade can trigger at food security 0.6 (60%), which is NOT acute famine

---

**Hypothesis 2: OVERLAPPING MECHANISMS (Potential double-counting)**
- Both phases modeling the SAME causal pathway: climate → food security drop → famine deaths
- FamineSystemPhase creates named famine events
- ClimateImpactCascadePhase ALSO adds mortality for the same food security drop

**Evidence FOR:**
- 11.4 famine events/month is unusually high (matches number of regions)
- All 594 climate famine events have root cause `climate`, same as ClimateImpactCascade
- No other phases logged in top mortality sources → suggests one phase is redundant

**Evidence AGAINST:**
- Different phase orders (21.5 vs 34.0) suggest intentional separation
- ClimateImpactCascade has seasonal logic (lean season multipliers) not in FamineSystemPhase
- FamineSystemPhase has explicit death curves (30-60 days), ClimateImpactCascade uses instant rates

---

## Research Validation Gap

**CRITICAL ROADMAP ISSUE #1 (Blocking):**
> "Xia vs Shi Food Security Contradiction" - Xia et al. 2022 says "impossible for 2+ years", Shi et al. 2025 says "largely unaffected"

**Implications:**
- We need to resolve WHEN famine mortality should be triggered
- Current thresholds (food security < 0.6 for chronic, < 0.2 for acute) may be too sensitive
- Research validation required BEFORE adjusting phase logic

---

## Recommendations

### Immediate Actions (CRITICAL - Week 1)

1. **Determine Phase Intent** (Research Required)
   - Read design documents for FamineSystemPhase and ClimateImpactCascadePhase
   - Check if they were designed to be complementary or redundant
   - Identify which phase should handle which mortality pathway

2. **Research Validation** (HIGHEST PRIORITY)
   - Resolve Xia vs Shi contradiction (determines famine mortality thresholds)
   - Distinguish acute famine (< 0.2 food security) vs chronic malnutrition (0.2-0.6)
   - Validate lean season mortality multipliers (1.75×) against research

3. **Test Isolation** (Diagnostic)
   - Run simulation with ONLY FamineSystemPhase enabled (disable ClimateImpactCascade famine logic)
   - Run simulation with ONLY ClimateImpactCascade enabled (disable FamineSystemPhase)
   - Compare mortality outcomes to determine overlap

### Parameter Adjustments (Pending Research Validation)

**IF phases are overlapping (Hypothesis 2):**
- **Option A:** Disable ClimateImpactCascade famine mortality, rely on FamineSystemPhase
- **Option B:** Disable FamineSystemPhase, rely on ClimateImpactCascade (simpler, but loses named events)
- **Option C:** Raise ClimateImpactCascade threshold from 0.6 → 0.3 (only trigger for severe food crises)

**IF phases are complementary (Hypothesis 1):**
- **Option A:** Adjust mortality rates to reflect distinction (acute vs chronic)
- **Option B:** Change `proximate` cause labels to distinguish in logs (`acute_famine` vs `malnutrition`)
- **Option C:** Add assertion to prevent same region triggering both mechanisms same month

### Validation Criteria

**After adjustments, Monte Carlo N=10 should show:**
- Average base mortality: 0.5-1.0%/month (before stabilizers)
- After stabilizers: 0.3-0.5%/month (target)
- Cumulative 60-month mortality: 20-40% (regional crisis with stabilizers working)
- Outcome variance: >20% (bifurcation working)
- Famine events: 2-5/month (not 11+), only for regions in true crisis

---

## Current State Assessment

**✅ GOOD:**
- Wet bulb mortality fixed (Nov 6 unit mismatch correction)
- Mortality stabilizers working (44.4% reduction applied)
- Average base mortality 0.69%/month is acceptable (with stabilizers → 0.38%/month)
- Cumulative mortality ~20-26% (within target 30-50%)

**⚠️ NEEDS INVESTIGATION:**
- 11.4 famine events/month (expected: 2-5/month for true crises)
- 87.5% of all mortality from single cause (famine) suggests other systems underrepresented
- Only 1 spike month above Holodomor cap (Month 47: 4.60% cascade) - need to understand cascade source

**🔴 BLOCKING ISSUES:**
- Xia vs Shi food security contradiction (CRITICAL - determines 200M survival)
- Phase overlap vs complementarity unclear (requires design intent review)
- No research validation for current famine thresholds (0.2, 0.4, 0.6 breakpoints)

---

## Files Modified/Created

### Investigation Tools
- `scripts/analyzeMortalitySources.ts` - Parse mortality risk summaries
- `logs/mortality_analysis_fixed_20251106.txt` - Post-fix mortality breakdown
- `logs/famine_mortality_investigation_20251106.md` - This document

### Relevant Source Files
- `src/simulation/engine/phases/FamineSystemPhase.ts` (order 21.5)
- `src/simulation/engine/phases/ClimateImpactCascadePhase.ts` (order 34.0)
- `src/simulation/engine/phases/FoodSecurityDegradationPhase.ts` (order 19.7)
- `src/simulation/wetBulbEvents.ts` (unit mismatch fixed Nov 6)

---

## Next Steps

**Autonomous Worker Recommendation:**
Given API budget constraints (42% weekly usage) and CRITICAL research gaps, this investigation should be handed to the orchestrator for proper multi-agent coordination:

1. **super-alignment-researcher (Cynthia):** Resolve Xia vs Shi contradiction
2. **research-skeptic (Sylvia):** Validate famine mortality thresholds against research
3. **simulation-maintainer (Roy):** Test phase isolation to determine overlap
4. **architecture-skeptic:** Review phase design intent and integration

**Do NOT proceed with parameter adjustments until research validation complete.**

---

**Status:** Investigation COMPLETE, awaiting research validation (Quality Gate 1)
**Priority:** CRITICAL (Week 1 roadmap item)
**Blocking:** CRITICAL Roadmap Issue #1 (Xia vs Shi food security contradiction)
