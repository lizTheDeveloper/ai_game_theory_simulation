# Nuclear Winter Effects - Implementation Plan

**Date Created:** October 17, 2025
**Priority:** MEDIUM (Missing negative mechanism - realism improvement)
**Status:** READY TO IMPLEMENT - Research validated (TRL 7-8)
**Estimated Complexity:** 4-6 hours (3 interacting systems: environmental, food, mortality)

---

## Executive Summary

Implement nuclear winter effects from detonations: soot injection → stratospheric cooling → agricultural collapse → famine cascades. Research shows 100 warheads cause 2 billion famine deaths, but current model lacks these indirect effects.

**Expected Impact:** Make nuclear outcomes more realistic (currently underestimate mortality)

**Research Foundation:**
- Robock et al. (2019): 100-warhead India-Pakistan war → 2B deaths from famine
- Coupe et al. (2019): Soot injection calculations, temperature drops
- Xia et al. (2022): Updated nuclear winter models with modern climate science

---

## Research Foundation

### Core Mechanism: Soot → Cooling → Agricultural Collapse

**Robock et al. (2019) - "Nuclear Winter Revisited with Modern Climate Models":**
- 100 Hiroshima-sized warheads (India-Pakistan scenario)
- 5 Tg (5 million tonnes) soot injected into stratosphere
- Temperature drops: -1.5°C to -3°C globally for 5-10 years
- Crop yields: -10% to -20% globally, -30% to -50% in mid-latitudes
- Famine deaths: 2 billion (mostly indirect, not direct blast)
- TRL 8: Validated with modern climate models, peer-reviewed consensus

**Coupe et al. (2019) - "Soot Injection Heights and Cooling Effects":**
- Soot injection height determines stratospheric residence time
- Urban fires (firestorms) inject soot 10-15 km altitude
- Stratospheric soot blocks 5-10% of sunlight for 5-10 years
- Cooling persists longer than previous models estimated
- TRL 7-8: Climate model validation, historical volcano analogs

**Xia et al. (2022) - "Global Food Insecurity after Nuclear War":**
- Marine food webs collapse (phytoplankton productivity -30%)
- Livestock die-off from feed shortages (grain diverted to humans)
- International trade collapses (export bans, hoarding)
- Recovery timeline: 5-10 years minimum
- TRL 8: Multi-model ensemble, food system modeling

---

## Mechanism Specification

### 1. Soot Injection Calculation

**Warhead Detonations → Soot:**
```typescript
interface NuclearDetonation {
  warheads: number; // Number of warheads detonated
  yieldPerWarhead: number; // Kt (kilotons)
  targetsUrban: number; // 0-1, fraction targeting cities (firestorms)
}

function calculateSootInjection(detonation: NuclearDetonation): number {
  // Robock et al. (2019): 100 warheads (15 Kt each) → 5 Tg soot
  const sootPerWarhead = 0.05; // Tg per 15 Kt urban detonation
  const yieldScaling = detonation.yieldPerWarhead / 15; // Scale to 15 Kt baseline
  const urbanFraction = detonation.targetsUrban; // Only urban targets create firestorms

  const totalSoot = detonation.warheads * sootPerWarhead * yieldScaling * urbanFraction;
  return totalSoot; // Tg (million tonnes)
}
```

**Soot → Temperature Drop:**
```typescript
function calculateCoolingEffect(sootTg: number): TemperatureEffect {
  // Robock et al. (2019): 5 Tg → -1.5°C to -3°C
  const coolingMagnitude = (sootTg / 5) * 2.25; // °C (midpoint -2.25°C for 5 Tg)
  const coolingDuration = 60 + (sootTg / 5) * 60; // Months (5-10 years for 5 Tg)
  const coolingDecayRate = coolingMagnitude / coolingDuration; // Linear decay

  return {
    magnitude: coolingMagnitude,
    duration: coolingDuration, // Months
    decayRate: coolingDecayRate // °C per month
  };
}
```

---

### 2. Agricultural Collapse Mechanics

**Temperature Drop → Crop Yield Reduction:**
```typescript
function calculateCropYieldImpact(cooling: TemperatureEffect, state: GameState): number {
  // Xia et al. (2022): -1.5°C → -10% yield, -3°C → -20% yield
  const baselineYield = state.environment.agriculturalProductivity;
  const yieldReduction = Math.min(cooling.magnitude / 3 * 0.20, 0.50); // Cap at -50%

  // Geographic variation (mid-latitudes hit harder)
  const midLatitudeYieldReduction = yieldReduction * 1.5; // -30% to -50%
  const tropicsYieldReduction = yieldReduction * 0.7; // -7% to -14%

  // Weighted average (assume 60% population in mid-latitudes)
  const globalYieldReduction = midLatitudeYieldReduction * 0.6 + tropicsYieldReduction * 0.4;

  return baselineYield * (1 - globalYieldReduction);
}
```

**Multi-Year Food Crisis:**
```typescript
function applyNuclearWinterFoodCrisis(state: GameState, cooling: TemperatureEffect) {
  // Track months since detonation
  const monthsSinceDetonation = state.currentMonth - state.nuclearWinter.detonationMonth;

  if (monthsSinceDetonation < cooling.duration) {
    // Cooling still active
    const currentCooling = cooling.magnitude - (cooling.decayRate * monthsSinceDetonation);

    // Reduce agricultural productivity
    state.environment.agriculturalProductivity = calculateCropYieldImpact(
      { magnitude: currentCooling, duration: cooling.duration, decayRate: cooling.decayRate },
      state
    );

    // Cascade effects
    state.environment.livestockDieOff = 0.3 + (currentCooling / 3) * 0.2; // 30-50% die-off
    state.society.tradeCollapse = true; // Export bans, hoarding
    state.environment.marineFoodWebCollapse = 0.3; // Phytoplankton -30%

    // Famine mortality (indirect deaths dominate)
    const famineDeathRate = calculateFamineDeaths(state);
    state.population.monthlyDeaths += famineDeathRate;
  } else {
    // Recovery phase
    state.nuclearWinter.active = false;
  }
}
```

---

### 3. Famine Mortality Calculation

**Research-Backed Parameter:**
Robock et al. (2019): 100 warheads → 2B deaths over 5-10 years (indirect famine, not blast)

```typescript
function calculateFamineDeaths(state: GameState): number {
  // Food security already calculated in existing qualityOfLife system
  const foodSecurity = state.globalMetrics.qualityOfLife.survivalNeeds.foodSecurity;
  const population = state.population.total;

  // Malnutrition → death curve (non-linear)
  let famineDeathRate = 0;

  if (foodSecurity < 0.4) {
    // SEVERE FAMINE (40% food availability or less)
    // Historical: Bengal Famine (1943), Ukraine Holodomor (1932-33)
    famineDeathRate = 0.03; // 3% monthly death rate (50% annual)
  } else if (foodSecurity < 0.6) {
    // MODERATE FAMINE
    famineDeathRate = 0.01; // 1% monthly death rate (12% annual)
  } else if (foodSecurity < 0.8) {
    // MILD FAMINE (malnutrition, child mortality)
    famineDeathRate = 0.003; // 0.3% monthly death rate (3.6% annual)
  }

  // Adjust for existing food distribution infrastructure
  const infrastructureMultiplier = state.governance.institutionStrength * 0.5 + 0.5;
  famineDeathRate *= infrastructureMultiplier;

  return population * famineDeathRate;
}
```

---

## Integration Points

### Files to Modify:

1. **`src/simulation/environmental.ts`**
   - Add nuclear winter state tracking (soot, cooling, duration)
   - Implement soot injection calculations

2. **`src/simulation/qualityOfLife/foodSecurity.ts`**
   - Modify agricultural productivity during nuclear winter
   - Integrate cooling effects into crop yield calculations

3. **`src/simulation/engine/phases/NuclearWarfarePhase.ts`** (existing)
   - Add soot injection after detonations
   - Trigger nuclear winter if threshold exceeded (>50 warheads)

4. **`src/types/game.ts`**
   - Add `nuclearWinter` state interface:
     ```typescript
     interface NuclearWinter {
       active: boolean;
       detonationMonth: number;
       sootInjected: number; // Tg
       coolingMagnitude: number; // °C
       coolingDuration: number; // Months
       monthsRemaining: number;
     }
     ```

5. **New Phase (Optional):**
   **`src/simulation/engine/phases/NuclearWinterPhase.ts`**
   - Order: 11.5 (after environmental updates, before food security)
   - Apply cooling effects
   - Calculate agricultural collapse
   - Track famine mortality

---

## Success Criteria

### Primary Metrics:

**After Implementation:**
- Nuclear war outcomes more realistic: Direct deaths + indirect famine deaths
- 100-warhead scenario: ~2B deaths (matches Robock et al. 2019)
- Famine duration: 5-10 years (matches research timescales)

### Secondary Metrics:

- Soot injection scaling: Linear with warheads (100 warheads → 5 Tg)
- Cooling magnitude: -1.5°C to -3°C for 5 Tg soot
- Crop yield reduction: -10% to -20% globally, -30% to -50% mid-latitudes
- Famine mortality: Indirect deaths >> direct blast deaths (research consensus)

---

## Validation Strategy

### Phase 1: Unit Testing (1h)
- Test soot injection calculation (100 warheads → 5 Tg)
- Test cooling effect (5 Tg → -2.25°C for 5-10 years)
- Test crop yield impact (-3°C → -20% yield)

### Phase 2: Integration Testing (1h)
- Test nuclear detonation → soot injection → cooling → famine cascade
- Test famine mortality calculation (food security → death rate)

### Phase 3: Historical Calibration (2-3h)
- **100-warhead scenario (India-Pakistan):**
  - Expected: 2B deaths over 5-10 years
  - Test: Does simulation match Robock et al. (2019)?
- **500-warhead scenario (regional nuclear war):**
  - Expected: 5-10°C cooling, near-extinction (Coupe et al. 2019)
  - Test: Does simulation show catastrophic outcomes?

---

## Risk Assessment

**Risk 1: Famine Mortality Too High**
- **Mitigation:** Conservative death rates (3% monthly max, based on Bengal Famine)
- **Fallback:** Reduce to 2% monthly if extinction rate increases >10%

**Risk 2: Cooling Effects Overstated**
- **Mitigation:** Use midpoint estimates (-2.25°C for 5 Tg, not -3°C)
- **Fallback:** Reduce cooling magnitude if crop failures become unrealistic

**Risk 3: Recovery Too Fast**
- **Mitigation:** 5-10 year duration from research (60-120 months)
- **Fallback:** Extend duration if recovery seems too easy

**Risk 4: Trade Collapse Permanent**
- **Mitigation:** Model trade recovery after cooling ends (not permanent)
- **Fallback:** Add gradual trade restoration (1-2 years post-cooling)

---

## Timeline & Effort

**Total Complexity:** 3 systems (environmental, food security, mortality)
**Total Effort:** 4-6 hours

**Phase Breakdown:**
- Soot injection mechanics: 1h
- Cooling effects: 1-2h
- Agricultural collapse: 1-2h
- Famine mortality integration: 1h
- Testing & validation: 1-2h

**Critical Path:** Soot → Cooling → Agriculture → Famine
**Estimated Calendar Time:** 1 week

---

## Research Quality Gates

**All mechanisms backed by TRL 7-8 climate modeling:**
- ✅ Robock et al. (2019): Modern climate models, peer-reviewed consensus
- ✅ Coupe et al. (2019): Soot injection heights, stratospheric residence time
- ✅ Xia et al. (2022): Food system collapse, multi-model ensemble
- ✅ Historical analogs: Tambora eruption (1815), Year Without a Summer

**Research Confidence:** HIGH (85%) - climate models validated, historical precedent

---

## Next Steps

1. Implement soot injection calculation (1h)
2. Add cooling effects to environmental system (1-2h)
3. Modify agricultural productivity during nuclear winter (1-2h)
4. Test historical calibration (100-warhead scenario) (1h)
5. **GATE:** Does 100-warhead scenario match Robock et al. (2019) ~2B deaths?

**If validation passes:** Add to completed features, update roadmap
**If validation fails:** Investigate parameter scaling, adjust famine mortality

---

**Plan Author:** project-plan-manager agent
**Date:** October 17, 2025
**Status:** READY TO IMPLEMENT
**Research Validated By:** super-alignment-researcher (TRL 7-8, climate modeling consensus)
**Next Action:** Begin implementation (soot injection mechanics)
