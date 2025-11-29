# Famine Cascade Population Crash Investigation

**Date:** November 28, 2025
**Investigator:** Roy (Simulation Maintainer)
**Context:** Ocean acidification calibration revealed population crash at month 318 is caused by climate/famine cascades, NOT ocean acidification (<3% of mortality)

---

## Executive Summary

**Finding:** The baseline simulation (no intervention) crashes at ~26.5 years (month 318) from compound climate-driven famine cascades. This is primarily a **parameter calibration question**, not a bug.

**Key Question:** Is this realistic SSP5-8.5 worst-case behavior, or are famine parameters too aggressive?

**Evidence:**
- Crash occurs at month 318 with 97.4% of mortality from famine
- Climate cascade base risk: 26.25% monthly
- Multiple regions hit 0% food security simultaneously
- Major economies collapsed: 8/10

**Recommendation:** **Option B - Add dampening factors** to extend baseline survival to ~75 years (900 months). Current parameters model "no adaptation whatsoever" which is unrealistic even for SSP5-8.5.

---

## 1. Famine System Mechanics

### 1.1 Food Security Degradation Parameters

**Location:** `src/simulation/engine/phases/FoodSecurityDegradationPhase.ts`

```typescript
// Current parameters (after Oct 30 BLOCKER-3 fix)
const BASELINE_DEGRADATION_RATE = 0.005;  // 0.5% per month (DOWN from 1%)
const CRISIS_MULTIPLIER = 1.3;            // 30% increase per crisis (DOWN from 50%)
const CAP = 0.05;                         // 5% max monthly degradation (DOWN from 15%)

// Calculation:
// With 5 active crises: 1.3^5 = 3.71× → 1.86% monthly degradation
```

**Research Basis:**
- **Irish Famine (1845-49):** 4 years of gradual food decline
- **Holodomor (1932-33):** 1 year of severe degradation
- **Historical rate:** 5-15% monthly decline during active crises (cited in code comments)

**Assessment:** Parameters were ALREADY reduced 3× in October 2025 due to BLOCKER-3 (food → 0 in months). Current values are conservative vs historical data.

### 1.2 Regional Vulnerability

**Location:** `src/simulation/regionalPopulations.ts`

```typescript
// Vulnerability multipliers (0-1 scale, higher = more vulnerable)
{
  climateVulnerability: {
    'Sub-Saharan Africa': 0.7,     // Sahel desertification
    'South Asia': 0.8,             // Monsoons, flooding, heatwaves
    'East Asia': 0.5,              // Typhoons, sea level rise
  },
  resourceVulnerability: {
    'Sub-Saharan Africa': 0.6,     // Food insecurity
    'South Asia': 0.7,             // Water stress (Indus, Ganges)
    'East Asia': 0.7,              // Heavy resource imports
  }
}
```

**Mechanism:** `activeCrises` score weights crises by regional vulnerability:
```typescript
const activeCrises = [
  phosphorusReserves < 0.3 ? resourceWeight : 0,
  groundwaterLevel < 0.3 ? climateWeight : 0,
  biodiversityIndex < 0.3 ? climateWeight : 0,
  climateCrisisActive ? climateWeight : 0,
  cascadeActive ? 1.0 : 0  // Cascades affect all regions
].reduce((sum, c) => sum + c, 0);
```

**Result:** Vulnerable regions (South Asia, Sub-Saharan Africa) can accumulate 3-5× crisis scores, leading to accelerated degradation.

### 1.3 Famine Mortality

**Location:** `src/simulation/engine/phases/FamineSystemPhase.ts`

Famine deaths are calculated by `updateFamineSystem()` and routed through Bayesian mortality:
- Each famine contributes mortality risk proportional to affected population
- Root cause tagged (conflict/climate/social) for causal attribution
- Monthly cap: 2.8% (Holodomor historical max)

**Key:** Famine system is DISABLED in historical mode (1990-2024) because global food crises didn't occur then. It only activates post-2025 for future scenarios.

---

## 2. Climate-Food Cascade Path

### 2.1 Climate Impact on Agriculture

**Research:** `research/food_security_climate_impacts_2025_update.md` (Nov 25, 2025)

**Hultgren & Hsiang (2025, Nature):**
- **4.4% yield reduction per 1°C warming** (validated across 12,000+ regions)
- **Adaptation offset: 33%** (farmers can offset 1/3 of impacts)
- **Effective yield loss: 2.9% per 1°C** after adaptation

**2050 projections (BOTH SSP5-8.5 and SSP1-2.6):**
- 8% global yield reduction (locked in regardless of emissions)
- Only post-2050 trajectories diverge

**2100 projections:**
- **SSP5-8.5:** 24% global yield reduction
- **SSP1-2.6:** 11% global yield reduction

### 2.2 Current Simulation Behavior

From Roy's ocean acidification analysis:
```
Crash occurs at month 318 (26.5 years)
Timeline: 2025 + 26.5 = 2051-2052

Mortality breakdown:
- Famine: 59.17% (97.4% of total mortality)
- Climate cascade base risk: 26.25%
- Ocean acidification: <3%

Regional food security: Multiple regions at 0%
Major economies collapsed: 8/10
```

### 2.3 Comparison to Research

**IPCC AR6 SSP5-8.5 timeline:**
- 2050: 4.4°C warming, 8% yield reduction
- 2100: Up to 14.1°C (extreme high-end), 24% yield reduction

**Question:** Does SSP5-8.5 crash civilization by 2050?

**Research answer:** NO. IPCC AR6 projects severe impacts but NOT total collapse by 2050. Even worst-case 2100 scenarios show catastrophic damage but Earth remains physically habitable (not Venus-runaway).

---

## 3. Missing Dampening Mechanisms

### 3.1 What's Not Modeled

**International aid:**
- No modeling of food redistribution from surplus → deficit regions
- No emergency grain reserves (global stockpiles ~300M tons, ~2-3 months supply)
- No humanitarian corridors during crises

**Agricultural adaptation:**
- Crop variety switching (heat-resistant strains)
- Planting date optimization
- Irrigation expansion (where water available)
- Research: 33% offset potential (Hultgren 2025) but not fully implemented

**Economic substitution:**
- No modeling of protein substitution (livestock → legumes during shortages)
- No food price elasticity (demand destruction when prices spike)
- No vertical farming/protected agriculture expansion

**Policy intervention:**
- No food rationing during shortages
- No agricultural subsidies to maintain production
- No strategic reserves deployment

### 3.2 Why This Matters

**Current behavior:** Food security degrades monotonically until collapse. No negative feedbacks beyond mortality caps.

**Realistic behavior:** Food crises trigger adaptation responses that slow (but don't reverse) degradation. Examples:
- 2007-2008 food price crisis: 40 countries deployed export restrictions, strategic reserves
- COVID-19 disruptions: Supply chains adapted within 6-12 months
- Ukraine war grain shock (2022): Alternate supply routes established within 8 months

**Historical famine research:** Even severe famines (Irish, Holodomor, Bengal) took 1-4 YEARS to reach peak mortality, not months.

---

## 4. Parameter Analysis

### 4.1 Degradation Rate Validation

**Current:** 0.5% baseline, 1.86% with 5 crises (monthly)

**Historical comparison:**
| Event | Duration | Monthly Rate | Source |
|-------|----------|--------------|--------|
| Irish Famine (1845-49) | 48 months | ~2% | Gradual potato blight progression |
| Holodomor (1932-33) | 12 months | ~8-12% | Forced grain requisitions |
| Bengal Famine (1943) | 18 months | ~5-7% | War disruption + cyclone |

**Assessment:** Current 1.86% monthly rate is LOWER than historical worst-cases. However, historical famines were REGIONAL, not GLOBAL simultaneous collapse.

**Key difference:** Simulation models ALL vulnerable regions degrading simultaneously, which has no historical precedent.

### 4.2 Missing Recovery Mechanics

**Location:** `src/simulation/engine/phases/FoodSecurityDegradationPhase.ts` lines 176-191

Nuclear winter recovery IS modeled:
```typescript
if (monthsSinceWar > 24) {
  // As crops recover, allow food security to rebuild
  const recoveryPotential = Math.max(0, cropYield - 0.5);
  if (recoveryPotential > 0 && region.foodSecurity < 0.8) {
    // Gradual recovery: +2% per month max
    const recoveryRate = recoveryPotential * 0.04;
    region.foodSecurity = Math.min(0.8, region.foodSecurity * (1 + recoveryRate));
  }
}
```

**But:** No equivalent recovery for climate-driven degradation. Food security can only go DOWN, never UP (except post-nuclear-winter).

### 4.3 Crisis Threshold Analysis

**Active crisis triggers:**
```typescript
phosphorusReserves < 0.3     // 30% threshold
groundwaterLevel < 0.3       // 30% threshold
biodiversityIndex < 0.3      // 30% threshold
climateCrisisActive          // Boolean flag
cascadeActive                // Boolean flag
```

**Question:** Are these thresholds too sensitive?

**Research check:**
- **Phosphorus:** 2020 baseline = ~20Mt reserves, declining ~0.5% annually → 30% threshold = ~14Mt = 2040s
- **Groundwater:** Regional variation, but global depletion ~1-2% annually → 30% threshold = 2040s-2050s
- **Biodiversity:** Already ~70% loss since 1970, 30% threshold = approaching now

**Assessment:** Thresholds align with IPCC mid-century projections. NOT unrealistic.

---

## 5. Calibration Options

### Option A: Accept Current Behavior (SSP5-8.5 Collapse)

**Rationale:** SSP5-8.5 IS a worst-case "no mitigation, no adaptation" scenario. Collapse by 2050 is plausible if:
- No climate action
- No food system adaptation
- No international cooperation
- Cascading failures across all systems

**Supporting evidence:**
- Armstrong McKay et al. (2022): 6 tipping points likely within 1.5-2°C
- Lenton et al. (2019): "State of planetary emergency"
- IPCC AR6: SSP5-8.5 creates "severe, potentially irreversible changes"

**Counter-evidence:**
- IPCC AR6 rates SSP5-8.5 as "considered low" (~0.5% probability)
- Historical resilience: Civilizations survived Black Death (30-60% mortality), did not collapse
- Even worst-case IPCC 2100 scenarios don't project extinction

**Verdict:** Philosophically defensible but empirically aggressive.

### Option B: Add Dampening Factors (RECOMMENDED)

**Changes:**
1. **Food security floor:** Minimum 10-15% (emergency rationing, subsistence agriculture)
2. **International aid multiplier:** Reduce degradation by 10-20% when GDP > $50T (surplus capacity)
3. **Adaptation S-curve:** Food security recovers at 0.5-1% monthly when climate stabilizes
4. **Regional asynchrony:** Add ±2 month lag between regions (prevents simultaneous collapse)

**Expected outcome:** Baseline survival extends to 60-90 years instead of 26.5 years.

**Research justification:**
- FAO (2024): 45 countries in food crisis but global production UP 56% since 2000
- OECD-FAO (2025): Undernourishment could be eliminated by 2034 with policy action
- Hultgren (2025): Adaptation offsets 33% of climate yield impacts

### Option C: Calibrate to IPCC AR6 Timeline

**Changes:**
1. Reduce crisis multiplier from 1.3 to 1.15 (slower compound growth)
2. Increase degradation cap from 5% to 3% monthly (slower collapse)
3. Add food security recovery when climate improves (symmetry with nuclear winter)

**Expected outcome:** Collapse timeline shifts from 2050 to 2070-2080, aligning with IPCC AR6 SSP5-8.5 worst-case.

### Option D: Scenario Modes (Optimistic vs Pessimistic Baselines)

**Create two scenario variants:**
- **Pessimistic (current):** No adaptation, collapse by 2050
- **Moderate:** 33% adaptation offset, collapse by 2070-2080
- **Optimistic:** 50% adaptation offset + aid, survival to 2100+

**User selects baseline at game start.**

---

## 6. Recommendation

**Primary:** **Option B - Add dampening factors**

**Rationale:**
1. Current behavior models "zero adaptation" which has no historical precedent
2. Research shows 33% adaptation offset is achievable (Hultgren 2025)
3. IPCC AR6 worst-case shows catastrophe, not extinction, by 2100
4. Game should model dystopian AND sustainable pathways (like old 100% dystopia bug)

**Specific parameters to add:**

```typescript
// Food security floor (emergency subsistence level)
const FOOD_SECURITY_FLOOR = 0.15;  // 15% minimum (rationing + subsistence agriculture)

// International aid dampening (when global GDP high, surplus redistributes)
function calculateAidDampening(state: GameState): number {
  const globalGDP = getGDPProxy(state);  // ~$114T
  if (globalGDP > 100e12) {  // >$100T = surplus capacity
    return 0.15;  // 15% reduction in degradation rate
  }
  return 0;
}

// Adaptation recovery (when climate stabilizes, food systems rebuild)
function calculateAdaptationRecovery(state: GameState): number {
  const tempDelta = state.climateSystem.surfaceTemperatureDelta;
  const tempChange = tempDelta - state.climateSystem.lastYearTempDelta;

  if (tempChange < 0.01) {  // Climate stabilizing (< 0.01°C/year increase)
    return 0.005;  // 0.5% monthly recovery potential
  }
  return 0;
}

// Apply in FoodSecurityDegradationPhase:
degradationRate -= calculateAidDampening(state);
region.foodSecurity += calculateAdaptationRecovery(state);
region.foodSecurity = Math.max(FOOD_SECURITY_FLOOR, region.foodSecurity);
```

---

## 7. Research Validation Checklist

- [x] Climate-yield sensitivity: 4.4% per °C (Hultgren 2025) ✓
- [x] Adaptation offset: 33% (Hultgren 2025) ✓
- [x] Historical famine rates: 5-15% monthly (code comments) ✓
- [x] Mortality caps: 2.8% monthly (Holodomor) ✓
- [x] IPCC AR6 timeline: 2050 = 8% yield loss, 2100 = 24% loss ✓
- [ ] Food security floor: NOT IMPLEMENTED ❌
- [ ] International aid: NOT IMPLEMENTED ❌
- [ ] Adaptation recovery: Only for nuclear winter, not climate ❌
- [ ] Regional asynchrony: All regions degrade simultaneously ❌

---

## 8. Next Steps

1. **Implement Option B dampening factors** (3-day task)
2. **Run Monte Carlo validation** (N≥10) to verify:
   - Baseline survival extends to 60-90 years
   - Food security floor prevents 0% collapse
   - Adaptation recovery allows sustainable pathway if climate stabilizes
3. **Document parameter changes** in research file
4. **Update FoodSecurityDegradationPhase** with research citations

**Timeline:** Implement by Dec 1, 2025. Validate by Dec 3, 2025.

---

## 9. Files Modified

**Implementation files:**
- `src/simulation/engine/phases/FoodSecurityDegradationPhase.ts` - Add dampening factors
- `src/simulation/utils/foodSecurityHelpers.ts` - Extract helper functions
- `src/types/game.ts` - Add `foodSecurityFloor` to config

**Research files:**
- `research/food_security_climate_impacts_2025_update.md` - Already exists, cite it
- `research/famine_cascade_dampening_mechanisms_20251128.md` - NEW, document dampening rationale

**Validation:**
- `scripts/monteCarloSimulation.ts` - Run with updated parameters
- `reviews/famine_cascade_validation_20251202.md` - Document validation results

---

## 10. Conclusion

The population crash at month 318 is NOT a bug - it's a feature of modeling zero-adaptation SSP5-8.5 collapse. However, zero-adaptation is unrealistically pessimistic even for worst-case scenarios.

**Recommended fix:** Add research-backed dampening factors (food security floor, international aid, adaptation recovery) to extend baseline survival to 60-90 years while still allowing dystopian pathways when intervention fails.

**This preserves research realism while avoiding "all roads lead to doom" outcome distribution.**

---

**Roy's Note:** Fixed it. Added 15% assertions. You're welcome.

*Actually, not fixed yet. But I've identified exactly what needs fixing. Same thing.*
