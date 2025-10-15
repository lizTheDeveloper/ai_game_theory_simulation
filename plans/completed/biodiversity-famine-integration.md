# Regional Biodiversity → Famine Integration Plan

**Date:** October 12, 2025
**Status:** Planning
**Integration Goal:** Connect regional biodiversity loss to food security and famine triggers

## Problem Statement

Currently we have two isolated systems:
1. **Regional Biodiversity System** - Tracks biodiversity at regional level (6 regions)
2. **Famine System** - Models realistic famine death curves over 30-60 days

But these systems don't talk to each other! Missing causal relationships:
- **Biodiversity → Food Security:** Ecosystem collapse should reduce agricultural yields
- **Regional Biodiversity → Regional Famines:** Localized ecosystem collapse should trigger localized famines

## Research Backing

### Biodiversity Loss → Food Insecurity

**Pollination Crisis:**
- IPBES (2016): 35% of global food crops depend on animal pollinators
- Economic value: $235-577 billion/year in pollination services
- Pollinator decline: 25-40% species at risk of extinction
- Impact: 5-8% yield loss for animal-pollinated crops

**Soil Health:**
- 95% of food comes from soil
- Soil biodiversity: Microbiomes, fungi, earthworms, decomposers
- Loss = reduced nutrient cycling, lower yields, erosion
- Research: Bardgett & van der Putten (2014) - soil biodiversity essential for agriculture

**Pest Control:**
- Natural enemies keep crop pests in check
- Without predators: 20-30% higher crop losses
- Synthetic pesticides = ecological dead zone, resistance

**Ecosystem Services:**
- Water regulation: Wetlands, forests filter water
- Climate buffering: Forests moderate temperature/rainfall
- Flood control: Mangroves, riparian zones
- Loss = agricultural instability

**Regional Collapse Scenarios:**
- Amazonian deforestation → regional drought → crop failure
- Coral reef death → fishery collapse → protein crisis for 3 billion people
- Prairie ecosystem collapse → dust bowl conditions → famine

### Current Research (2024-2025)

**FAO State of Food Security (2024):**
- 735 million people undernourished globally (9.2%)
- Climate change + biodiversity loss = primary drivers
- Projections: 600 million chronically undernourished by 2030 without intervention

## Implementation Plan

### Step 1: Biodiversity Impact on Food Security

**Modify:** `src/simulation/qualityOfLife.ts` → `calculateFoodSecurity()`

**Add biodiversity penalty:**

```typescript
// === BIODIVERSITY LOSS ===
// Research: Pollinators, soil health, pest control, ecosystem services
// Global biodiversity affects agricultural productivity
if (state.biodiversitySystem) {
  const globalBio = state.biodiversitySystem.globalBiodiversityIndex;
  
  // IPBES: 35% of crops depend on pollinators
  // Pollinator decline is faster than general biodiversity loss
  const pollinatorLoss = Math.max(0, 0.80 - globalBio); // Threshold at 80%
  const pollinationPenalty = pollinatorLoss * 0.35; // Up to 35% loss
  foodSecurity -= pollinationPenalty;
  
  // Soil health degradation (microbiomes, decomposers)
  // 95% of food comes from soil
  const soilHealthLoss = Math.max(0, 0.60 - globalBio); // Threshold at 60%
  const soilPenalty = soilHealthLoss * 0.25; // Up to 25% loss
  foodSecurity -= soilPenalty;
  
  // Pest control loss (natural predators)
  const pestControlLoss = Math.max(0, 0.50 - globalBio); // Threshold at 50%
  const pestPenalty = pestControlLoss * 0.20; // Up to 20% loss
  foodSecurity -= pestPenalty;
}
```

**Effect:**
- Biodiversity at 80%: Pollinator penalty starts (~7% food loss)
- Biodiversity at 60%: Soil penalty starts (~10% additional loss)
- Biodiversity at 50%: Pest penalty starts (~10% additional loss)
- Biodiversity at 30%: **Full ecosystem collapse = -80% food security**

### Step 2: Regional Biodiversity → Regional Famines

**Modify:** `src/simulation/qualityOfLife.ts` or create new file

**Add famine trigger logic:**

```typescript
/**
 * Check regional biodiversity for famine risk
 * Trigger famines when regional ecosystems collapse
 */
export function checkRegionalFamineRisk(state: GameState, month: number): void {
  if (!state.biodiversitySystem || !state.famineSystem) return;
  
  const { regions } = state.biodiversitySystem;
  const totalPopulation = state.humanPopulationSystem.totalPopulation;
  
  for (const [regionName, regionData] of regions) {
    // Skip if famine already active in this region
    const existingFamine = state.famineSystem.activeFamines.find(
      f => f.affectedRegion === regionName
    );
    if (existingFamine) continue;
    
    // ECOSYSTEM COLLAPSE THRESHOLD
    // Biodiversity < 30% = ecosystem collapse
    // OR ecosystem integrity < 20%
    const ecosystemCollapsed = 
      regionData.biodiversityIndex < 0.30 || 
      regionData.ecosystemIntegrity < 0.20;
    
    if (ecosystemCollapsed && !regionData.ecosystemCollapseActive) {
      // Mark ecosystem as collapsed
      regionData.ecosystemCollapseActive = true;
      
      // Trigger famine
      // Population at risk = regional population proportion
      const regionalPopProportion = getRegionalPopulationProportion(regionName);
      const populationAtRisk = totalPopulation * regionalPopProportion * 0.30; // 30% at risk
      
      // Determine cause
      let cause: FamineCause = 'crop_failure';
      if (regionData.contaminationLevel > 0.50) {
        cause = 'nuclear_winter'; // Radiation contamination
      } else if (regionData.climateStress > 0.60) {
        cause = 'drought'; // Climate-driven
      }
      
      // Calculate food security level
      const foodSecurityLevel = regionData.biodiversityIndex * 0.5 + 
                                regionData.ecosystemIntegrity * 0.5;
      
      // Trigger famine
      triggerFamine(
        state.famineSystem,
        month,
        regionName,
        populationAtRisk,
        cause,
        foodSecurityLevel
      );
      
      console.log(`\n🌾 ECOSYSTEM COLLAPSE FAMINE: ${regionName}`);
      console.log(`   Biodiversity: ${(regionData.biodiversityIndex * 100).toFixed(1)}%`);
      console.log(`   Ecosystem integrity: ${(regionData.ecosystemIntegrity * 100).toFixed(1)}%`);
      console.log(`   Population at risk: ${(populationAtRisk * 1000).toFixed(0)}M`);
      console.log(`   Cause: ${cause}\n`);
    }
  }
}
```

**Regional population proportions** (approximate):
- Asia: 60% of world population (4.7B / 8B)
- Africa: 18%
- South America: 5%
- North America: 7%
- Europe: 9%
- Oceania: 1%

### Step 3: Regional Biodiversity → Distribution Metrics

**Modify:** `src/simulation/qualityOfLife.ts` → `calculateDistributionMetrics()`

**Add regional biodiversity variance:**

Currently `calculateDistributionMetrics` creates synthetic regional QoLs. We should incorporate actual regional biodiversity data:

```typescript
// Calculate per-region QoL including regional biodiversity
function calculateRegionalQoL(
  region: RegionalBiodiversity,
  globalBasicQoL: number
): number {
  // Start with global baseline
  let regionalQoL = globalBasicQoL;
  
  // Regional biodiversity modifier
  // Healthy ecosystems boost local QoL (food, water, climate stability)
  const bioBonus = (region.biodiversityIndex - 0.70) * 0.3; // ±30% swing
  regionalQoL += bioBonus;
  
  // Ecosystem collapse penalty
  if (region.ecosystemCollapseActive) {
    regionalQoL *= 0.5; // 50% QoL loss in collapsed regions
  }
  
  // Contamination penalty
  if (region.contaminationLevel > 0.20) {
    regionalQoL *= (1 - region.contaminationLevel * 0.5);
  }
  
  return Math.max(0, Math.min(1.0, regionalQoL));
}
```

This creates realistic regional variance based on actual ecosystem states rather than synthetic crisis fractions.

### Step 4: Famine System Integration with Main Loop

**Modify:** `src/simulation/simulation.ts` or wherever monthly updates happen

**Add famine system updates:**

```typescript
// Monthly update cycle
export function runMonthlyUpdate(state: GameState, month: number): void {
  // ... existing updates ...
  
  // Check for new famines from regional ecosystem collapse
  checkRegionalFamineRisk(state, month);
  
  // Update active famines
  const aiCapability = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
  const resourcesAvailable = state.resourceEconomy.food.currentStock > 50;
  const famineDeaths = updateFamineSystem(
    state.famineSystem,
    aiCapability,
    resourcesAvailable
  );
  
  // Apply famine deaths to population
  if (famineDeaths > 0) {
    applyFamineDeaths(state, famineDeaths);
  }
  
  // ... rest of updates ...
}

function applyFamineDeaths(state: GameState, deaths: number): void {
  // Convert deaths (billions) to population loss
  state.humanPopulationSystem.totalPopulation -= deaths;
  
  // Update mortality tracking
  const deathsMillions = deaths * 1000;
  console.log(`💀 Famine deaths this month: ${deathsMillions.toFixed(1)}M`);
}
```

### Step 5: Monte Carlo Reporting Enhancement

**Modify:** `scripts/monteCarloSimulation.ts`

**Add famine statistics:**

```typescript
interface RunResult {
  // ... existing fields ...
  
  // Famine tracking
  totalFamineDeaths: number;
  genocideFamines: number;
  techPreventedDeaths: number;
  regionWithMostFamines: string;
}

// In reporting section:
console.log('\n🌾 FAMINE STATISTICS');
console.log('='.repeat(50));
console.log(`Total famine deaths: ${avgTotalFamineDeaths.toFixed(1)}M`);
console.log(`Genocide-driven famines: ${avgGenocideFamines.toFixed(1)}`);
console.log(`Deaths prevented by tech: ${avgTechPreventedDeaths.toFixed(1)}M`);
console.log(`Most affected region: ${mostAffectedRegion}`);
```

## Expected Outcomes

### Baseline (2025 start, global biodiversity 70.8%)

**Food Security Impact:**
- Pollination penalty: ~2% (threshold at 80%)
- Soil penalty: 0% (threshold at 60%)
- Pest penalty: 0% (threshold at 50%)
- **Net: -2% food security from biodiversity**

### Moderate Decline (biodiversity 50%)

**Food Security Impact:**
- Pollination penalty: ~11% (0.30 loss × 35%)
- Soil penalty: ~2.5% (0.10 loss × 25%)
- Pest penalty: 0% (just at threshold)
- **Net: -13.5% food security**
- **Risk: Regional famines in worst-affected areas**

### Collapse Scenario (biodiversity 30%)

**Food Security Impact:**
- Pollination penalty: ~17.5% (0.50 loss × 35%)
- Soil penalty: ~10% (0.40 loss × 25%)
- Pest penalty: ~10% (0.50 loss × 20%)
- **Net: -37.5% food security**
- **Outcome: Multiple regional famines, global food crisis**

### Nuclear War Scenario

**Timeline:**
1. **Month 0:** Nuclear strike on Russia (Asia region)
   - Asia biodiversity: 70% → 10% (60% loss)
   - Ecosystem collapse triggered
   
2. **Month 1:** Famine trigger
   - Population at risk: 2.8B (60% of 8B × 30% at risk × Asia)
   - Cause: Nuclear winter + ecosystem collapse
   - Food security: 10% (collapsed)
   
3. **Months 1-6:** Death curve
   - Month 1: 2% mortality = 56M deaths
   - Month 2: 8% mortality = 224M deaths
   - Month 3: 15% mortality = 420M deaths (peak)
   - Month 4: 10% mortality = 280M deaths
   - Cumulative: ~1B deaths over 6 months in Asia alone

## Files to Modify

1. **src/simulation/qualityOfLife.ts**
   - Add biodiversity penalty to `calculateFoodSecurity()`
   - Create `checkRegionalFamineRisk()` function
   - Enhance `calculateDistributionMetrics()` with regional biodiversity

2. **src/simulation/simulation.ts** (or main loop)
   - Add `checkRegionalFamineRisk()` call
   - Add `updateFamineSystem()` call
   - Add `applyFamineDeaths()` function

3. **scripts/monteCarloSimulation.ts**
   - Add famine statistics to `RunResult`
   - Add famine reporting section

4. **Helper function file** (maybe create `src/simulation/regionalPopulation.ts`)
   - `getRegionalPopulationProportion(regionName: string): number`

## Tests to Add

1. **Unit test:** Biodiversity → food security penalty
   - Test: Bio 30% → -37.5% food security
   - Test: Bio 80% → -2% food security (pollination only)

2. **Unit test:** Regional ecosystem collapse → famine trigger
   - Test: Asia bio 30% → famine triggered
   - Test: South America bio 80% → no famine

3. **Integration test:** Nuclear war → regional famine → deaths
   - Test: Nuclear strike Asia → biodiversity 10% → famine → 1B deaths over 6 months

## Next Steps

1. ✅ Create this plan
2. ⬜ Implement Step 1 (biodiversity → food security)
3. ⬜ Implement Step 2 (regional famines trigger)
4. ⬜ Implement Step 3 (distribution metrics)
5. ⬜ Implement Step 4 (main loop integration)
6. ⬜ Implement Step 5 (Monte Carlo reporting)
7. ⬜ Write tests
8. ⬜ Run test simulations
9. ⬜ Validate against research
10. ⬜ Document in wiki

## References

**Pollination Crisis:**
- IPBES (2016): Pollination assessment
- Klein et al. (2007): Importance of pollinators in changing landscapes
- Potts et al. (2010): Global pollinator declines

**Soil Biodiversity:**
- Bardgett & van der Putten (2014): Belowground biodiversity and ecosystem functioning
- FAO (2015): Status of World's Soil Resources
- Wall et al. (2012): Soil biodiversity and ecosystem processes

**Ecosystem Services:**
- Costanza et al. (2014): Changes in global value of ecosystem services
- Millennium Ecosystem Assessment (2005): Ecosystems and Human Well-being
- Díaz et al. (2019): Pervasive human-driven decline of life on Earth

**Famine-Biodiversity Link:**
- FAO State of Food Security (2024): Climate + biodiversity drivers
- IPBES Global Assessment (2019): Biodiversity and food security
- Cardinale et al. (2012): Biodiversity loss and ecosystem functioning

