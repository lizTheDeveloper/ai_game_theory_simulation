# Food Security Regionalization Progress - October 25, 2025

## Completed ✅

1. **Added `foodSecurity` field to `RegionalPopulation` interface** (src/types/population.ts)
   - Added after line 249 with research citation

2. **Initialized regional food security for all 7 regions** (src/simulation/regionalPopulations.ts)
   - Sub-Saharan Africa: 0.70 (high vulnerability)
   - East Asia: 0.90 (advanced economy, imports)
   - South Asia: 0.75 (water stress, high density)
   - Europe: 0.92 (advanced economy, CAP subsidies)
   - North America: 0.95 (resource-rich breadbasket)
   - Latin America: 0.85 (self-sufficient)
   - MENA: 0.65 (import-dependent, water scarcity)
   - **Population-weighted average: ~75%** (more realistic than 85% global)

3. **Created `calculateRegionalFoodSecurity()` function** (src/simulation/qualityOfLife/dimensions.ts:60-166)
   - Uses region-specific infrastructure scaling (not global 8B baseline)
   - Weights crises by regional vulnerability (climate, resource)
   - Import-dependent regions hit harder by price shocks
   - Vulnerable regions hit harder by climate/water stress

## Remaining Work 📋

### Task 4: Update Regional Population Calculations
**File:** `src/simulation/regionalPopulations.ts`
**Function:** `updateRegionalPopulations()` (line 286+)

**Current bug (line 402-404):**
```typescript
const foodStock = state.resourceEconomy.food.reserves;  // GLOBAL food stock
const foodAvailability = Math.min(1.0, foodStock / 100);
const resourceModifier = Math.min(foodAvailability, waterAvailability);
```

**Fix needed:**
```typescript
// BEFORE calculating carrying capacity (insert around line 395)
import { calculateRegionalFoodSecurity } from './qualityOfLife/dimensions';

for (const region of pop.regionalPopulations) {
  // Calculate regional food security
  region.foodSecurity = calculateRegionalFoodSecurity(state, region);

  // Use regional food security for carrying capacity
  const foodAvailability = region.foodSecurity; // Use regional, not global
  const resourceModifier = Math.min(foodAvailability, waterStock / 100);

  // ... rest of carrying capacity calculation
}
```

### Task 5: Update QoL Phase for Global Aggregation
**File:** `src/simulation/qualityOfLife/core.ts`
**Function:** `updateQualityOfLifeSystems()` (line 50+)

**Current (line 338):**
```typescript
const survivalFundamentals = calculateSurvivalFundamentals(state);
```

**Fix needed:**
```typescript
// Calculate global food security as population-weighted average of regional values
let globalFoodSecurity = 0.85; // Fallback if no regions
if (state.humanPopulationSystem.regionalPopulations && state.humanPopulationSystem.regionalPopulations.length > 0) {
  const regions = state.humanPopulationSystem.regionalPopulations;
  const totalPop = regions.reduce((sum, r) => sum + r.population, 0);
  globalFoodSecurity = regions.reduce((sum, r) => sum + (r.foodSecurity * r.population), 0) / totalPop;
}

// Calculate other survival fundamentals (water, thermal, shelter)
const calculated = calculateSurvivalFundamentals(state);
const survivalFundamentals = {
  foodSecurity: globalFoodSecurity,  // Use regional aggregation
  waterSecurity: calculated.waterSecurity,
  thermalHabitability: calculated.thermalHabitability,
  shelterSecurity: calculated.shelterSecurity,
};
```

### Task 6: Update FoodSecurityDegradationPhase for Regional Degradation
**File:** `src/simulation/engine/phases/FoodSecurityDegradationPhase.ts`
**Function:** `execute()` (line 25+)

**Current:** Applies crisis degradation to GLOBAL food security only

**Fix needed:**
```typescript
// Apply crisis degradation to EACH REGION
const pop = state.humanPopulationSystem;
if (pop.regionalPopulations && pop.regionalPopulations.length > 0) {
  for (const region of pop.regionalPopulations) {
    // Count crises affecting THIS REGION (weight by regional vulnerability)
    const climateWeight = region.climateVulnerability;
    const resourceWeight = region.resourceVulnerability;

    const activeCrises = [
      state.phosphorusSystem.reserves < 0.3 ? resourceWeight : 0,
      state.freshwaterSystem.blueWater.groundwater < 0.3 ? climateWeight : 0,
      state.biodiversitySystem.globalBiodiversityIndex < 0.3 ? climateWeight : 0,
      state.environmentalAccumulation?.climateCrisisActive ? climateWeight : 0,
      state.planetaryBoundariesSystem?.cascadeActive ? 1.0 : 0,
    ].reduce((sum, c) => sum + c, 0);

    // Regional degradation rate (vulnerable regions degrade faster)
    let degradationRate = 0.01; // Baseline
    if (activeCrises > 0) {
      degradationRate *= Math.pow(1.5, activeCrises);
    }
    degradationRate = Math.min(0.15, degradationRate);

    // Apply to regional food security
    const currentFood = region.foodSecurity;
    region.foodSecurity = Math.max(0, currentFood * (1 - degradationRate));
  }
}
```

### Task 7: Type Safety & Exports
**File:** `src/simulation/qualityOfLife/dimensions.ts`

**Add export:**
```typescript
export { calculateRegionalFoodSecurity };
```

**File:** `src/simulation/regionalPopulations.ts`

**Add import:**
```typescript
import { calculateRegionalFoodSecurity } from './qualityOfLife/dimensions';
```

### Task 8: Validation Test
Run Monte Carlo to verify:
- Population doesn't collapse from 8B → 7B in month 0 anymore
- Regional food security varies (not all 85%)
- Death spiral is eliminated (population uses regional food, not global mismatch)

Expected outcome:
- Month 0: All regions should have stable food security (no immediate deaths)
- Vulnerable regions (MENA, Sub-Saharan Africa) should decline faster than resilient ones (North America, Europe)
- Global food security should be population-weighted average of regional values

## Research Citations

- FAO (2023): Regional food systems vary by trade integration
- IPCC AR6 (2022): Climate impacts vary by region
- Tainter (1988): Infrastructure complexity scales with population
- WHO (2024): Minimum viable population for infrastructure maintenance

## Architecture Summary

**Before:**
- GLOBAL food security calculated once
- REGIONAL populations using GLOBAL `foodStock` directly
- Mismatch: Food security at 83% but population dying because `foodStock / 100` was low
- Death spiral: Population drop → infrastructure drop → food drop → more population drop

**After:**
- REGIONAL food security calculated per region
- Each region uses its OWN food security for carrying capacity
- Global food security = population-weighted average of regions
- No mismatch: Regional populations use regional food metrics
- Realistic: Vulnerable regions suffer more, breadbasket regions stay stable

## Token Budget Remaining
~91,000 tokens - sufficient to complete remaining tasks

## Next Immediate Steps
1. Update `updateRegionalPopulations()` to calculate & use regional food security
2. Update `updateQualityOfLifeSystems()` to aggregate global from regional
3. Update `FoodSecurityDegradationPhase` to apply regional crisis degradation
4. Run validation test
