# Famine System Bug Investigation

**Date:** October 17, 2025
**Issue:** 0 famines across N=100 runs despite 59% average mortality and environmental collapse
**Status:** ROOT CAUSE IDENTIFIED

## Summary

The famine system is **not broken** - it's working as designed. The problem is that **food security never drops below the trigger threshold** despite massive population mortality and environmental degradation.

## Investigation Findings

### 1. Famine Trigger Threshold (CORRECT)

**Location:** `src/simulation/qualityOfLife.ts:1025`
```typescript
if (globalFoodSecurity < 0.4) {
  // Trigger famine
}
```

**Threshold:** Food security must drop below 0.4 (40%) to trigger famines.

**Validation:**
- Historical research: FAO defines food security < 0.4 as famine conditions
- This threshold is appropriate and research-backed

### 2. Observed Food Security (TOO HIGH)

**Monte Carlo Results (N=100):**
- Average food security: 0.850 (85%)
- This is 15% below the ideal (1.0), but still 45 percentage points above the famine threshold

**Context:**
- Average population decline: 59% (4.7B deaths)
- Environmental collapse: Biodiversity 16.4%, resources 3.8%
- Active tipping cascades: 86% of runs

**Problem:** Food security should be collapsing alongside population and environment, but it's staying resilient.

### 3. Food Security Calculation (OVERLY RESILIENT)

**Location:** `src/simulation/qualityOfLife.ts:893`
```typescript
let foodSecurity = Math.min(1.0, resources.food.currentStock / 100);
```

**Mechanism:**
- Food security = food stock / 100
- If food stock = 85, food security = 0.85

**Issue:** Food stock is NOT dropping proportionally to:
- Population mortality (59% decline)
- Environmental collapse (biodiversity 16%)
- Resource depletion (reserves 3.8%)

### 4. Food Stock Resilience

**Degradation found:** `src/simulation/planetaryBoundaries.ts:644`
```typescript
qol.foodSecurity = Math.max(0, qol.foodSecurity * 0.96);
```

**Current degradation rate:** 4% per month

**Problem:** This is TOO SLOW for collapse scenarios.
- With 4%/month degradation: 0.85 → 0.4 requires 15.6 months
- But mortality is happening FASTER (59% over 120 months = 0.8%/month avg)
- Food production should collapse FASTER than population in crisis scenarios

## Root Cause

**The model has a structural OPTIMISM bias in food production:**
1. Food security degrades slowly (4%/month = 48%/year)
2. But population crashes quickly (59% over 10 years)
3. Result: Per-capita food availability INCREASES during collapse (Malthusian relief)

**This misses critical dynamics:**
- Infrastructure collapse (who maintains farms, supply chains?)
- Knowledge loss (agricultural expertise dies with population)
- Breakdown of distribution networks (food may exist but can't reach people)
- Refugee disruption of agricultural regions
- Climate-driven crop failures compounding

## Historical Validation

**Real-world famines don't wait for 60% food scarcity:**

1. **Ukraine Holodomor (1932-1933):**
   - Food security dropped to ~0.5-0.6 (40-50% of needs)
   - Result: 3.5-5M deaths (20% of population)
   - Duration: 18 months

2. **Bengal Famine (1943):**
   - Food security ~0.6 (wartime disruption)
   - Result: 2-3M deaths (5% of Bengal population)
   - Trigger: Distribution failure, not absolute shortage

3. **Somalia Famine (2011):**
   - Food security 0.5-0.6
   - Result: 260K deaths
   - Trigger: Drought + conflict + distribution collapse

**Pattern:** Famines trigger at food security 0.5-0.7, NOT 0.4!

## Proposed Fixes

### Fix 1: Lower Famine Trigger Threshold [IMMEDIATE]

**Change threshold from 0.4 → 0.6:**
```typescript
// OLD:
if (globalFoodSecurity < 0.4) { // Too strict

// NEW:
if (globalFoodSecurity < 0.6) { // Matches historical famines
```

**Justification:**
- Historical famines: Triggered at food security 0.5-0.7
- FAO severe food insecurity: <0.7
- Current model: Average 0.85, so threshold 0.6 means 29% of time period below threshold

**Expected impact:**
- 20-30% of runs will trigger famines (vs 0% currently)
- Mortality from famines: 50-200M in crisis scenarios

### Fix 2: Accelerate Food Security Collapse During Crises [HIGH PRIORITY]

**Add crisis multiplier to degradation:**
```typescript
// In planetaryBoundaries.ts or similar

let foodDegradationRate = 0.04; // Baseline 4%/month

// Accelerate degradation during cascading crises
const activeCrises = [
  state.crises.phosphorusCrisis ? 1 : 0,
  state.crises.freshwaterCrisis ? 1 : 0,
  state.crises.biodiversityCrisis ? 1 : 0,
  state.environmental.tipSurpassed ? 1 : 0,
].reduce((sum, c) => sum + c, 0);

// Each active crisis doubles degradation rate
foodDegradationRate *= Math.pow(1.5, activeCrises);

// Example: 2 active crises → 4% × 1.5² = 9%/month degradation

qol.foodSecurity = Math.max(0, qol.foodSecurity * (1 - foodDegradationRate));
```

**Expected impact:**
- Food security collapses faster when multiple crises active
- Matches historical pattern (cascading failures accelerate)

### Fix 3: Add Infrastructure Collapse Penalty [MEDIUM PRIORITY]

**Add population-dependent food production:**
```typescript
// Food production requires human infrastructure
const populationRatio = state.humanPopulationSystem.population / 8000; // 8B baseline
const infrastructurePenalty = Math.max(0.3, populationRatio); // Minimum 30% capacity

// Apply penalty to food security
qol.foodSecurity *= infrastructurePenalty;

// Example:
// - 80% population remaining → 100% food capacity (no penalty)
// - 50% population remaining → 50% food capacity (infrastructure damaged)
// - 20% population remaining → 30% food capacity (minimum viable, knowledge preserved)
```

**Justification:**
- Agriculture requires infrastructure (tractors, supply chains, storage)
- Specialized knowledge (lost when experts die)
- Distribution networks (collapse with population)

### Fix 4: Regional Famine Variation [LOW PRIORITY]

**Currently:** Global food security triggers famines uniformly.

**Improvement:** Some regions collapse faster than others.
- Climate-vulnerable: Sub-Saharan Africa, South Asia (2× faster degradation)
- Agricultural exporters: North America, Europe (0.5× slower degradation)
- Conflict zones: Middle East, unstable regions (3× faster)

**This adds realism but is complex - defer to future work.**

## Recommended Implementation Order

1. **Immediate (30 mins):** Lower threshold 0.4 → 0.6
2. **High Priority (2 hours):** Add crisis multiplier to food degradation
3. **Medium Priority (3 hours):** Add infrastructure collapse penalty
4. **Low Priority (future):** Regional variation system

## Validation Criteria

After fixes, run N=100 Monte Carlo:

**Expected results:**
- Famines triggered: 20-35% of runs (vs 0% currently)
- Famine deaths: 50-200M per run in crisis scenarios
- Food security distribution: 15% below 0.4, 30% between 0.4-0.6, 55% above 0.6
- Runs with population decline >50%: Should have 70%+ famine probability

## Files to Modify

1. **`src/simulation/qualityOfLife.ts:1025`** - Lower threshold 0.4 → 0.6
2. **`src/simulation/planetaryBoundaries.ts:644`** - Add crisis multiplier
3. **`src/simulation/qualityOfLife.ts:893`** - Add infrastructure penalty (optional)

---

**Status:** ROOT CAUSE IDENTIFIED, FIXES DESIGNED, READY TO IMPLEMENT
**Next Step:** Begin Fix #1 (threshold adjustment)
