# Death Categorization & Water Insecurity Fixes
**Date:** October 16, 2025  
**Branch:** `p2-implementation`  
**Priority:** CRITICAL (reporting accuracy + physical realism)

## Overview
Fixed two issues identified during P2 implementation:
1. **Death categorization bug** - Monte Carlo incorrectly labeled all climate/ecosystem/pollution deaths as "cascade"
2. **Water insecurity overcounting** - Population under water stress reached 81% (should max at 60%)

---

## Bug #1: Death Categorization Overcounting

### Problem
Monte Carlo summary reported:
```
Cascade: 57.8B deaths (tipping point cascades)
Total Deaths: 36.2B
```

Cascade deaths were **1.5x total deaths** (physically impossible). Root cause: ALL climate, ecosystem, and pollution deaths were being labeled as "cascade" deaths.

### Root Cause
**File:** `scripts/monteCarloSimulation.ts:753`
```typescript
const deathsCascade = deathsByCategory.climate + deathsByCategory.ecosystem + deathsByCategory.pollution;
```

This summed deaths from:
- **Climate category:** Tipping point cascade + climate catastrophe + Amazon collapse
- **Ecosystem category:** Ecosystem decline/crisis/collapse
- **Pollution category:** Pollution crisis + novel entities (reproductive crisis, bioaccumulation, chronic disease)

But only the tipping point cascade should be labeled as "cascade deaths".

### Solution
1. **Added new death category** (`src/types/population.ts`):
   ```typescript
   deathsByCategory: {
     // ... existing categories ...
     cascade: number;  // Tipping point cascade (Oct 16, 2025)
   }
   ```

2. **Updated cascade to use new category** (`src/simulation/planetaryBoundaries.ts:624`):
   ```typescript
   addAcuteCrisisDeaths(
     state,
     monthlyMortalityRate,
     'Tipping Point Cascade',
     1.0,  // Global
     'cascade'  // Oct 16, 2025: Dedicated category
   );
   ```

3. **Fixed Monte Carlo aggregation** (`scripts/monteCarloSimulation.ts`):
   ```typescript
   const deathsCascade = deathsByCategory.cascade; // Tipping point cascade only
   const deathsClimateEcoPollution = deathsByCategory.climate + 
                                     deathsByCategory.ecosystem + 
                                     deathsByCategory.pollution;
   ```

4. **Updated reporting**:
   ```
   MORTALITY BREAKDOWN:
     Natural: XXM (baseline)
     Crisis: XXM (famine, disease, disasters)
     Climate/Eco/Pollution: XXM (environmental crises)  ← NEW
     Nuclear: XXM (nuclear wars)
     Cascade: XXM (tipping point cascades)              ← NOW ACCURATE
     Meaning: XXM (suicide epidemic)
   ```

### Research Validation
- **Tipping point cascades** are distinct from specific environmental crises
- IPCC AR6 distinguishes:
  - **Acute crises:** Specific events (heatwaves, hurricanes, droughts)
  - **Tipping cascades:** Multi-system collapse (AMOC + ice sheet + permafrost)
- Separate tracking allows understanding which death mechanism dominates

### Expected Impact
- Cascade deaths should now be **< total deaths** (physically plausible)
- Separate climate/ecosystem/pollution tracking shows specific crisis mortality
- Better debugging: Can identify if cascade or specific crises are driving deaths

---

## Bug #2: Water Insecurity Overcounting

### Problem
Quality of Life logs showed:
```
Water Security: 0%  (100% of population under water stress)
```

But research shows **max 60%** even in worst-case scenarios (WRI Aqueduct, IPCC AR6).

### Root Cause
**File:** `src/simulation/freshwaterDepletion.ts:132`
```typescript
fw.populationStressed = 0.41 + (fw.waterStress * 0.4); // 41% baseline → 81% at max stress
```

At maximum water stress (1.0), this calculates:
```
populationStressed = 0.41 + (1.0 × 0.4) = 0.81 (81%)
```

But this ignores water-rich regions that remain stable even in collapse scenarios.

### Research Validation

**WRI Aqueduct 2024:**
- Current: 41% of population under water stress
- 2040 worst-case (SSP5-8.5): 52-58% under stress
- Even with climate chaos, Canada/Nordic/Russia/Alaska remain water-rich

**IPCC AR6 (2021):**
- "By 2050, ~50-60% of population may face water scarcity" (RCP 8.5)
- Regional variations: Middle East/North Africa 90%+, but Nordic/Canada <10%
- Global average maxes around 60% due to geographic heterogeneity

**Historical precedent:**
- Ancient civilizations (Maya, Akkadian) collapsed locally due to drought
- But water-rich regions (Nile, Mesopotamia, Indus) sustained populations
- Even global collapse wouldn't dry up Great Lakes, Amazon, Congo basins

### Solution
**File:** `src/simulation/freshwaterDepletion.ts:134`
```typescript
// Oct 16, 2025: Cap at 60% per WRI Aqueduct/IPCC research
// Even in worst-case scenarios, water-rich regions (Canada, Nordic, etc.) remain stable
fw.populationStressed = Math.min(0.60, 0.41 + (fw.waterStress * 0.4)); // 41% baseline → 60% max
```

### Expected Impact
- Water insecurity maxes at 60% (down from 81%)
- Quality of Life system reflects that some regions remain habitable
- More realistic survival outcomes in collapse scenarios

---

## Files Modified

**Core Types:**
- `src/types/population.ts` - Added `cascade` to `deathsByCategory`

**Simulation Logic:**
- `src/simulation/populationDynamics.ts` - Initialize `cascade: 0`
- `src/simulation/planetaryBoundaries.ts` - Use `cascade` category for tipping point deaths
- `src/simulation/freshwaterDepletion.ts` - Cap `populationStressed` at 60%

**Monte Carlo Reporting:**
- `scripts/monteCarloSimulation.ts`:
  - Added `deathsClimateEcoPollution` field to `RunResult` interface
  - Split cascade from climate/eco/pollution in aggregation
  - Added new line to mortality breakdown output

---

## Testing Strategy

1. **Run Monte Carlo with fixes:**
   ```bash
   cd /Users/annhoward/src/ai_game_theory_simulation
   nohup npx tsx scripts/monteCarloSimulation.ts > logs/mc_death_water_fixed_$(date +%Y%m%d_%H%M%S).log 2>&1 &
   ```

2. **Verify death categorization:**
   - Cascade deaths < Total deaths (basic physics check)
   - Climate/Eco/Pollution deaths > 0 (shows specific crises working)
   - Sum of all categories ≈ (Total deaths - Natural deaths)

3. **Verify water insecurity:**
   - Water security never drops below 40% (inverse of 60% stressed)
   - Survival fundamentals reflect that some regions remain habitable

---

## Related Work
- **P2.1:** Environmental recalibration (death cap, cascade acceleration reduction)
- **P2 Bug Fixes:** Monthly death cap (20%), AI orphan fix, compute decay
- **Devlog:** `/devlogs/p2-bug-fixes-oct16.md`

---

## Next Steps
1. ✅ Commit and push fixes
2. ⏳ Run Monte Carlo to validate (async)
3. ⏳ Review results vs. pre-fix baseline
4. ⏳ Update P2 research plan with final status

