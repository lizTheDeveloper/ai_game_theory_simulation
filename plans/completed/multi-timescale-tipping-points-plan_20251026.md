# Multi-Timescale Climate Tipping Point System

**Date:** October 26, 2025
**Status:** Design phase - awaiting architecture review
**Complexity:** 8 interacting systems
**Research Validation:** PASSED (research-skeptic HIGH confidence)

## Executive Summary

Replace the current instant climate catastrophe system (climateStability 0.75→0.0 in 1 month) with a research-backed multi-timescale tipping point system. Climate tipping points operate on timescales of **decades to millennia**, not months.

**Research Foundation:**
- `research/climate_collapse_timelines_20251026.md` (23 peer-reviewed papers + IPCC AR6)
- `reviews/climate_collapse_timeline_critique_20251026.md` (PASSED validation)

**Key Finding:** Even the fastest documented climate transition (Younger Dryas) took **3-10 years minimum**. Most tipping elements take **decades to centuries** to complete their transitions.

## Current Problem

**Location:** `src/simulation/environmental.ts` lines 454-489

```typescript
// CLIMATE CATASTROPHE: Stability below 40%
if (env.climateStability < 0.4 && !env.climateCrisisActive) {
  env.climateCrisisActive = true;
  // Instant QoL drops:
  qol.physicalSafety *= 0.6;     // 40% drop (instant)
  qol.materialAbundance *= 0.5;  // 50% drop (instant)
  qol.ecosystemHealth *= 0.4;    // 60% drop (instant)
  state.globalMetrics.socialStability -= 0.5; // 50% drop (instant)
}
```

**Result:** Population crashes from 8B → 1.24B in 4 months (physically impossible).

## Research-Backed Solution

### Six Major Tipping Elements

Based on Armstrong McKay et al. (2022) *Science* and IPCC AR6:

| Tipping Element | Transition Duration | Category | Impact on climateStability |
|----------------|---------------------|----------|---------------------------|
| **AMOC Collapse** | 50-150 years | Fast | -0.25 (25% contribution) |
| **Amazon Dieback** | 30-80 years | Fast | -0.15 (15% contribution) |
| **Arctic Sea Ice Loss** | 10-30 years | Fast | -0.10 (10% contribution) |
| **Permafrost Carbon** | 50-300 years | Intermediate | -0.15 (15% contribution) |
| **West Antarctic Ice Sheet** | 500-13,000 years | Slow | -0.20 (20% contribution) |
| **Greenland Ice Sheet** | 1,000-15,000 years | Slow | -0.25 (25% contribution) |

**Total Impact:** 1.10 (overlapping effects, cascade amplification)

### Tipping Point Lifecycle

Each tipping element has three distinct phases:

```typescript
interface TippingElement {
  // 1. THRESHOLD DETECTION
  triggerThreshold: number;        // When tipping initiates (e.g., climateStability < 0.6)
  triggered: boolean;              // Has threshold been crossed?
  triggerMonth: number;            // When did it trigger?

  // 2. TRANSITION DYNAMICS (research-backed)
  transitionDurationMonths: number; // How long to complete (e.g., 600-1800 for AMOC)
  transitionProgress: number;       // 0-1, how far through transition

  // 3. IMPACT MANIFESTATION
  affectedMetric: string;           // What metric does it degrade?
  impactMagnitude: number;          // How much degradation (0-1)

  // REGIONAL VARIATION
  regionalImpacts: Map<string, number>; // Different regions affected differently
}
```

**Example:** AMOC Collapse
1. **Month 12:** climateStability drops to 0.58 → crosses threshold (0.6)
2. **Months 12-612:** AMOC transitions over 50 years (600 months)
3. **Month 612:** Full impact achieved (-0.25 climateStability)
4. **Regional:** Europe -0.4, North America -0.3, Global -0.25

## Implementation Architecture

### Phase 1: Type Definitions

**File:** `src/types/tipping-points.ts` (NEW)

```typescript
/**
 * Climate Tipping Point System (TIER 1.5)
 *
 * Research-backed multi-timescale tipping point modeling based on:
 * - Armstrong McKay et al. (2022) "Exceeding 1.5°C global warming..." Science
 * - IPCC AR6 WG1 (2021) Chapter 4, 9
 * - Global Tipping Points Report (2023)
 *
 * Key Principle: Climate tipping points operate on timescales of DECADES to MILLENNIA,
 * not months. Even the fastest transitions (Younger Dryas) took 3-10 years minimum.
 */

export interface TippingElement {
  id: string;
  name: string;

  // Threshold detection
  triggerThreshold: number;        // e.g., climateStability < 0.6
  triggerMetric: string;           // What metric triggers this? (climateStability, temperature, etc.)
  triggered: boolean;              // Has threshold been crossed?
  triggerMonth: number;            // When did it trigger? (0 = not triggered)

  // Transition dynamics (research-backed)
  transitionDurationMonths: number; // How long to complete (sampled from range)
  transitionProgress: number;       // 0-1, how far through transition

  // Impact on systems
  affectedMetric: string;           // e.g., 'climateStability', 'biodiversityIndex'
  impactMagnitude: number;          // How much does it degrade the metric (0-1)

  // Regional variation
  regionalImpacts: {
    regionName: string;
    impactMultiplier: number;      // 1.0 = global average, >1.0 = more severe
  }[];

  // Research metadata
  researchSource: string;           // Citation
  uncertaintyRange: [number, number]; // Min/max transition duration
}

export interface TippingPointSystem {
  elements: TippingElement[];
  totalProgress: number;           // Aggregate tipping point progress (0-1)
  cascadeMultiplier: number;       // Multiple tipping points amplify each other
  activeTippingCount: number;      // How many elements currently transitioning?
}

// 6 major tipping elements (research-backed)
export const TIPPING_ELEMENTS_CONFIG = {
  amoc: {
    name: 'AMOC Collapse',
    triggerThreshold: 0.60,
    triggerMetric: 'climateStability',
    transitionDurationRange: [600, 1800],  // 50-150 years (Armstrong McKay 2022)
    affectedMetric: 'climateStability',
    impactMagnitude: 0.25,
    regionalImpacts: [
      { regionName: 'Europe', impactMultiplier: 1.6 },        // -0.4 total
      { regionName: 'North America', impactMultiplier: 1.2 }, // -0.3 total
      { regionName: 'global', impactMultiplier: 1.0 },        // -0.25 baseline
    ],
    researchSource: 'Armstrong McKay et al. (2022) Science; van Westen et al. (2024) Sci Adv',
    category: 'fast'
  },

  amazon: {
    name: 'Amazon Dieback',
    triggerThreshold: 0.55,
    triggerMetric: 'climateStability',
    transitionDurationRange: [360, 960],   // 30-80 years (Flores et al. 2024 Nature)
    affectedMetric: 'biodiversityIndex',   // Primary impact
    secondaryAffectedMetric: 'climateStability', // Carbon sink loss
    impactMagnitude: 0.15,
    regionalImpacts: [
      { regionName: 'Latin America', impactMultiplier: 3.33 }, // -0.5 total
      { regionName: 'global', impactMultiplier: 1.0 },         // -0.15 baseline
    ],
    researchSource: 'Flores et al. (2024) Nature; Boulton et al. (2022) Nat Clim Change',
    category: 'fast'
  },

  arcticIce: {
    name: 'Arctic Sea Ice Loss',
    triggerThreshold: 0.65,
    triggerMetric: 'climateStability',
    transitionDurationRange: [120, 360],   // 10-30 years (IPCC AR6)
    affectedMetric: 'climateStability',
    impactMagnitude: 0.10,                 // Albedo feedback
    regionalImpacts: [
      { regionName: 'global', impactMultiplier: 1.0 },  // -0.10 global warming
    ],
    researchSource: 'Duspayev et al. (2024) GRL; IPCC AR6 WG1 Ch.9',
    category: 'fast'
  },

  permafrost: {
    name: 'Permafrost Carbon Release',
    triggerThreshold: 0.60,
    triggerMetric: 'climateStability',
    transitionDurationRange: [600, 3600],  // 50-300 years (Schuur et al. 2022)
    affectedMetric: 'climateStability',
    impactMagnitude: 0.15,                 // Carbon feedback
    regionalImpacts: [
      { regionName: 'global', impactMultiplier: 1.0 },  // -0.15 global warming
    ],
    researchSource: 'Schuur et al. (2022) Annu Rev; MacDougall et al. (2021) Nat Comm',
    category: 'intermediate'
  },

  wais: {
    name: 'West Antarctic Ice Sheet',
    triggerThreshold: 0.65,
    triggerMetric: 'climateStability',
    transitionDurationRange: [6000, 156000], // 500-13,000 years (Armstrong McKay 2022)
    affectedMetric: 'climateStability',
    impactMagnitude: 0.20,                   // Sea level + climate feedback
    regionalImpacts: [
      { regionName: 'coastal', impactMultiplier: 2.5 },  // -0.5 coastal regions
      { regionName: 'global', impactMultiplier: 1.0 },   // -0.20 baseline
    ],
    researchSource: 'Naughten et al. (2023) Nat Clim Change; DeConto & Pollard (2016) Nature',
    category: 'slow'
  },

  greenland: {
    name: 'Greenland Ice Sheet',
    triggerThreshold: 0.65,
    triggerMetric: 'climateStability',
    transitionDurationRange: [12000, 180000], // 1,000-15,000 years (Armstrong McKay 2022)
    affectedMetric: 'climateStability',
    impactMagnitude: 0.25,                    // Sea level + climate feedback
    regionalImpacts: [
      { regionName: 'coastal', impactMultiplier: 2.4 },  // -0.6 coastal regions
      { regionName: 'global', impactMultiplier: 1.0 },   // -0.25 baseline
    ],
    researchSource: 'Armstrong McKay et al. (2022) Science; IPCC AR6 WG1',
    category: 'slow'
  }
};
```

### Phase 2: State Integration

**File:** `src/types/game.ts`

```typescript
// Add to GameState interface
export interface GameState {
  // ... existing fields ...

  tippingPoints: TippingPointSystem;  // NEW: Climate tipping point tracking
}
```

### Phase 3: Initialization

**File:** `src/simulation/initialization.ts`

```typescript
import { TIPPING_ELEMENTS_CONFIG } from '@/types/tipping-points';

function initializeTippingPoints(rng: RNGFunction): TippingPointSystem {
  const elements: TippingElement[] = Object.entries(TIPPING_ELEMENTS_CONFIG).map(([id, config]) => {
    // Sample transition duration from research range
    const [minDuration, maxDuration] = config.transitionDurationRange;
    const transitionDurationMonths = minDuration + rng() * (maxDuration - minDuration);

    return {
      id,
      name: config.name,
      triggerThreshold: config.triggerThreshold,
      triggerMetric: config.triggerMetric,
      triggered: false,
      triggerMonth: 0,
      transitionDurationMonths: Math.round(transitionDurationMonths),
      transitionProgress: 0,
      affectedMetric: config.affectedMetric,
      impactMagnitude: config.impactMagnitude,
      regionalImpacts: config.regionalImpacts,
      researchSource: config.researchSource,
      uncertaintyRange: config.transitionDurationRange
    };
  });

  return {
    elements,
    totalProgress: 0,
    cascadeMultiplier: 1.0,
    activeTippingCount: 0
  };
}
```

### Phase 4: Tipping Point Phase

**File:** `src/simulation/engine/phases/TippingPointPhase.ts` (NEW)

```typescript
/**
 * Climate Tipping Point Phase (TIER 1.5)
 *
 * Manages multi-timescale climate tipping points based on research-backed transition durations.
 *
 * Each month:
 * 1. Check if any tipping elements have crossed thresholds
 * 2. Progress active tipping elements based on their transition duration
 * 3. Update affected metrics (climateStability, biodiversityIndex, etc.)
 * 4. Calculate cascade effects (multiple tipping points amplify each other)
 *
 * Research backing:
 * - Armstrong McKay et al. (2022) Science - 16 tipping elements, quantitative timescales
 * - IPCC AR6 WG1 (2021) - Physical constraints on climate system transitions
 * - Global Tipping Points Report (2023) - Comprehensive tipping point assessment
 *
 * @order 26 (Crisis Detection category - before FinalOutcomePhase)
 */

import { GameState } from '@/types/game';
import { RNGFunction } from '@/types/rng';
import { PhaseContext, PhaseResult, SimulationPhase } from '@/types/phase';

export const TippingPointPhase: SimulationPhase = {
  id: 'tipping-point',
  name: 'Climate Tipping Point Progression',
  order: 26,

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    const { tippingPoints } = state;
    const { environmentalAccumulation } = state;
    const changes: string[] = [];

    // Step 1: Check for threshold crossings
    for (const element of tippingPoints.elements) {
      if (!element.triggered) {
        const currentValue = getCurrentMetricValue(state, element.triggerMetric);

        if (currentValue < element.triggerThreshold) {
          // Tipping threshold crossed!
          element.triggered = true;
          element.triggerMonth = state.currentMonth;
          tippingPoints.activeTippingCount++;

          changes.push(`🌍 TIPPING POINT TRIGGERED: ${element.name}`);
          changes.push(`   Threshold: ${element.triggerThreshold} crossed (current: ${currentValue.toFixed(3)})`);
          changes.push(`   Transition duration: ${Math.round(element.transitionDurationMonths / 12)} years`);

          state.eventLog.push({
            id: `tipping-${element.id}-${state.currentMonth}`,
            type: 'crisis',
            title: `Tipping Point: ${element.name}`,
            timestamp: state.currentMonth,
            severity: 'high',
            agent: 'environmental',
            description: `Climate tipping point triggered: ${element.name}. Transition will occur over ${Math.round(element.transitionDurationMonths / 12)} years.`,
            effects: {
              ecosystemHealth: -element.impactMagnitude * 0.3,
              physicalSafety: -element.impactMagnitude * 0.2
            }
          });
        }
      }
    }

    // Step 2: Progress active tipping elements
    for (const element of tippingPoints.elements) {
      if (element.triggered && element.transitionProgress < 1.0) {
        // Calculate monthly progress (1 / total duration in months)
        const monthlyProgress = 1 / element.transitionDurationMonths;
        element.transitionProgress = Math.min(1.0, element.transitionProgress + monthlyProgress);

        // Use sigmoid curve for smooth non-linear transition
        // S-curve: slow start → rapid middle → slow end (realistic for tipping points)
        const sigmoidProgress = 1 / (1 + Math.exp(-10 * (element.transitionProgress - 0.5)));

        // Apply impact to affected metric
        const impactThisMonth = element.impactMagnitude * monthlyProgress * sigmoidProgress;
        applyTippingImpact(state, element, impactThisMonth);

        // Log milestone transitions
        if (element.transitionProgress >= 0.25 && element.transitionProgress < 0.25 + monthlyProgress) {
          changes.push(`   ${element.name}: 25% complete (${Math.round((state.currentMonth - element.triggerMonth) / 12)} years elapsed)`);
        } else if (element.transitionProgress >= 0.50 && element.transitionProgress < 0.50 + monthlyProgress) {
          changes.push(`   ${element.name}: 50% complete (${Math.round((state.currentMonth - element.triggerMonth) / 12)} years elapsed)`);
        } else if (element.transitionProgress >= 0.75 && element.transitionProgress < 0.75 + monthlyProgress) {
          changes.push(`   ${element.name}: 75% complete (${Math.round((state.currentMonth - element.triggerMonth) / 12)} years elapsed)`);
        } else if (element.transitionProgress >= 1.0 && element.transitionProgress < 1.0 + monthlyProgress) {
          changes.push(`🔴 ${element.name}: TRANSITION COMPLETE (${Math.round((state.currentMonth - element.triggerMonth) / 12)} years)`);
          tippingPoints.activeTippingCount--;
        }
      }
    }

    // Step 3: Calculate cascade effects
    // Multiple active tipping points amplify each other (research: Wunderling et al. 2024 ESD)
    const activeTippingCount = tippingPoints.elements.filter(e => e.triggered && e.transitionProgress < 1.0).length;

    if (activeTippingCount > 1) {
      // Cascade amplification: 1.0 (baseline) + 0.05 per additional tipping point
      // Example: 2 active = 1.05×, 3 active = 1.10×, 4 active = 1.15×
      tippingPoints.cascadeMultiplier = 1.0 + (activeTippingCount - 1) * 0.05;

      if (activeTippingCount > 2) {
        changes.push(`⚠️  CASCADE EFFECT: ${activeTippingCount} tipping points active (${(tippingPoints.cascadeMultiplier * 100 - 100).toFixed(0)}% amplification)`);
      }
    } else {
      tippingPoints.cascadeMultiplier = 1.0;
    }

    // Step 4: Update total progress metric
    tippingPoints.totalProgress = tippingPoints.elements.reduce((sum, e) => sum + e.transitionProgress, 0) / tippingPoints.elements.length;

    return {
      success: true,
      changes: changes.length > 0 ? changes : undefined
    };
  }
};

function getCurrentMetricValue(state: GameState, metricName: string): number {
  switch (metricName) {
    case 'climateStability':
      return state.environmentalAccumulation.climateStability;
    case 'biodiversityIndex':
      return state.environmentalAccumulation.biodiversityIndex;
    case 'temperature':
      // Could add temperature tracking in future
      return 1.0 - (1.0 - state.environmentalAccumulation.climateStability) * 0.5;
    default:
      return 1.0;
  }
}

function applyTippingImpact(state: GameState, element: TippingElement, impactMagnitude: number): void {
  const { environmentalAccumulation } = state;
  const { tippingPoints } = state;

  // Apply cascade multiplier
  const cascadedImpact = impactMagnitude * tippingPoints.cascadeMultiplier;

  // Apply to primary affected metric
  switch (element.affectedMetric) {
    case 'climateStability':
      environmentalAccumulation.climateStability = Math.max(0, environmentalAccumulation.climateStability - cascadedImpact);
      break;
    case 'biodiversityIndex':
      environmentalAccumulation.biodiversityIndex = Math.max(0, environmentalAccumulation.biodiversityIndex - cascadedImpact);
      // Amazon dieback also affects climate (carbon sink loss)
      environmentalAccumulation.climateStability = Math.max(0, environmentalAccumulation.climateStability - cascadedImpact * 0.5);
      break;
  }

  // Apply regional impacts (for regional population system)
  for (const regionalImpact of element.regionalImpacts) {
    const region = state.regionalPopulations.find(r => r.name === regionalImpact.regionName);
    if (region) {
      // Regional climate vulnerability amplifies local impacts
      const regionalClimateStress = cascadedImpact * regionalImpact.impactMultiplier * region.climateVulnerability;
      region.climateVulnerability = Math.min(1.0, region.climateVulnerability + regionalClimateStress * 0.1);
    }
  }
}
```

### Phase 5: Remove Instant Catastrophe

**File:** `src/simulation/environmental.ts`

**REMOVE** lines 454-489 (entire instant climate catastrophe block).

**REPLACE** with comment explaining transition to TippingPointPhase:

```typescript
// REMOVED (Oct 26, 2025): Instant climate catastrophe logic
//
// OLD BEHAVIOR:
// - climateStability < 0.4 → instant QoL drops (40-60% instant)
// - Caused unrealistic population crashes (8B → 1.24B in 4 months)
// - Violated research: no climate transition faster than 3-10 years (Younger Dryas)
//
// NEW BEHAVIOR:
// - TippingPointPhase (order 26) manages gradual tipping point transitions
// - AMOC, Amazon, ice sheets, permafrost modeled separately
// - Transitions occur over research-backed timescales (10-15,000 years)
// - Climate stress applied gradually via regional populations
//
// See: src/simulation/engine/phases/TippingPointPhase.ts
// Research: research/climate_collapse_timelines_20251026.md
```

### Phase 6: Update Regional Mortality

**File:** `src/simulation/regionalPopulations.ts` line 377

**CURRENT:**
```typescript
const climateStress = (1 - climateStability) * 0.4 * region.climateVulnerability;
```

**NEW:**
```typescript
// Climate stress now comes from gradual tipping point transitions
// (not instant collapse). As tipping points progress, climateStability
// degrades over decades/centuries, creating gradual climate stress.
const climateStress = (1 - climateStability) * 0.4 * region.climateVulnerability;

// Additional stress from active tipping point transitions
const tippingPointStress = state.tippingPoints.totalProgress * 0.2 * region.climateVulnerability;

// Total climate mortality factor
const totalClimateStress = climateStress + tippingPointStress;
```

**UPDATE** line 382:
```typescript
const crisisMultiplier = 1 + foodWaterStress + totalClimateStress + pollutionStress;
```

### Phase 7: Register Phase in Orchestrator

**File:** `src/simulation/engine/PhaseOrchestrator.ts`

Add import:
```typescript
import { TippingPointPhase } from './phases/TippingPointPhase';
```

Register phase (order 26, Crisis Detection category):
```typescript
// Crisis Detection (26-30)
TippingPointPhase,          // 26 - Climate tipping point progression (NEW)
EnvironmentalCrisisPhase,   // 27 - Environmental crisis detection (existing)
// ... rest of phases
```

## Expected Outcomes

### Before Implementation (Current Behavior)

**Month 0:**
- climateStability: 0.75 (baseline)
- population: 8.0B

**Month 1:**
- climateStability: 0.38 (drops below 0.4 threshold)
- **INSTANT CATASTROPHE TRIGGERED**
- QoL drops: 40-60% instant
- population: 7.8B → starts rapid decline

**Month 4:**
- population: 1.24B (85% mortality in 4 months - **PHYSICALLY IMPOSSIBLE**)

### After Implementation (Research-Backed Behavior)

**Month 0:**
- climateStability: 0.75 (baseline)
- population: 8.0B
- Tipping points: None triggered

**Month 12:**
- climateStability: 0.58 (degrades to below 0.6)
- **AMOC TIPPING POINT TRIGGERED**
- Transition duration: 750 months (62.5 years)
- Transition progress: 0%
- population: 8.0B (no instant impact)

**Month 100:**
- AMOC transition progress: 11.7% (7.3 years elapsed)
- climateStability: 0.56 (gradual degradation)
- Europe climate stress: +5% (gradual increase)
- population: 7.95B (natural growth + minor climate stress)

**Month 400:**
- AMOC transition progress: 51.7% (32.3 years elapsed)
- climateStability: 0.48 (gradual degradation)
- **AMAZON DIEBACK TRIGGERED** (climateStability < 0.55)
- CASCADE EFFECT: 2 active tipping points (5% amplification)
- Europe climate stress: +18%
- Latin America climate stress: +12%
- population: 7.8B (gradual climate-driven mortality)

**Month 762:**
- AMOC transition: COMPLETE (62.5 years)
- Amazon transition progress: 64% (30 years elapsed)
- climateStability: 0.35 (multiple tipping points degraded it)
- CASCADE EFFECT: 3 active tipping points (10% amplification)
- population: 7.2B (gradual decline over 63 years)

**Key Differences:**
- ✅ No instant collapses (realistic)
- ✅ Tipping points progress over decades/centuries (research-backed)
- ✅ Population decline gradual (7-10% per decade during transition)
- ✅ Regional variation (Europe hit harder by AMOC, Latin America by Amazon)
- ✅ Cascade effects amplify but don't make instant (realistic)

## Validation Criteria

After implementation, Monte Carlo runs (N≥10) should show:

1. ✅ **No month-scale climate collapses** (minimum 5 years for fastest transitions)
2. ✅ **No instant population crashes** (no 8B → 1.24B in 4 months)
3. ✅ **Gradual tipping point progression** (AMOC 50-150 years, Amazon 30-80 years)
4. ✅ **Cascade effects realistic** (2+ tipping points amplify by 5-15%, not 100×)
5. ✅ **Regional variation** (Europe more affected by AMOC, Latin America by Amazon)
6. ✅ **Climate stress gradual** (mortality increases 1-3% per decade, not 50% per month)

## Testing Strategy

### Unit Tests
- Threshold crossing detection (triggered = true when currentValue < threshold)
- Transition progress calculation (linear monthly increment)
- Sigmoid curve transformation (smooth S-curve)
- Cascade multiplier calculation (1.0 + (n-1) × 0.05)
- Regional impact application

### Integration Tests
- Run 120-month simulation with fixed seed
- Verify tipping points trigger at correct thresholds
- Verify transitions take expected duration
- Verify no instant collapses
- Compare before/after population trajectories

### Monte Carlo Validation
```bash
npx tsx scripts/monteCarloSimulation.ts --runs=10 --max-months=1200
```

**Expected results:**
- Tipping points trigger in 60-80% of runs
- Average transition duration: 50-200 years (fast elements)
- Population decline gradual: 0.5-2% per year (not 50% per month)
- No extinction from climate alone before year 100 (unrealistic in research)

## Research Citations

### Primary Sources

1. **Armstrong McKay et al. (2022)** - "Exceeding 1.5°C global warming could trigger multiple climate tipping points," *Science* 377(6611), eabn7950
   - DOI: 10.1126/science.abn7950
   - **Table 1:** Quantitative transition timescales for 16 tipping elements

2. **van Westen et al. (2024)** - "Physics-based early warning signal shows that AMOC is on tipping course," *Science Advances* 10(6), eadk1189
   - DOI: 10.1126/sciadv.adk1189
   - AMOC: 10-30°C European cooling within 100 years

3. **Flores et al. (2024)** - "Critical transitions in the Amazon forest system," *Nature* 626, 555–564
   - DOI: 10.1038/s41586-023-06970-0
   - Amazon: 10-47% at risk by 2050, dieback in decades after tipping

4. **IPCC AR6 WG1 (2021)** - Climate Change 2021: The Physical Science Basis
   - Chapter 9: Cryosphere
   - Ice sheets: 500-15,000 year transitions

5. **Global Tipping Points Report (2023)** - University of Exeter
   - 200+ scientists, comprehensive assessment
   - URL: https://global-tipping-points.org/

6. **Steffensen et al. (2008)** - "High-Resolution Greenland Ice Core Data Show Abrupt Climate Change Happens in Few Years," *Science* 321(5889), 680–684
   - DOI: 10.1126/science.1157707
   - Younger Dryas: Fastest known transition took 3+ years (not months)

### Secondary Sources

7. Boulton et al. (2022) - Amazon resilience loss, *Nature Climate Change*
8. Naughten et al. (2023) - WAIS unavoidable melting, *Nature Climate Change*
9. Schuur et al. (2022) - Permafrost carbon feedbacks, *Annual Review*
10. Wunderling et al. (2024) - Tipping point cascades, *Earth System Dynamics*

**Total:** 23 peer-reviewed papers + 3 major assessment reports

## Files Modified

1. **NEW:** `src/types/tipping-points.ts` (type definitions)
2. **NEW:** `src/simulation/engine/phases/TippingPointPhase.ts` (phase implementation)
3. **MODIFIED:** `src/types/game.ts` (add tippingPoints to GameState)
4. **MODIFIED:** `src/simulation/initialization.ts` (initialize tipping elements)
5. **MODIFIED:** `src/simulation/environmental.ts` (remove instant catastrophe, lines 454-489)
6. **MODIFIED:** `src/simulation/regionalPopulations.ts` (update climate stress calculation, line 377)
7. **MODIFIED:** `src/simulation/engine/PhaseOrchestrator.ts` (register TippingPointPhase)

## Estimated Effort

**Implementation:** 6-8 hours (8 interacting systems)
- Phase 1-3 (types, state, init): 1-2 hours
- Phase 4 (TippingPointPhase): 3-4 hours
- Phase 5-6 (remove instant, update regional): 1 hour
- Phase 7 (register phase): 0.5 hours
- Testing & validation: 1-2 hours

**Architecture Review:** 0.5-1 hour (pre-implementation)
**Monte Carlo Validation:** 1-2 hours (10-run validation)

**Total:** 8-11 hours

## Dependencies

**Prerequisite:** None (standalone feature)
**Blocks:** None (improves existing environmental system)
**Enables:** More realistic climate crisis modeling, better extinction timeline accuracy

## Next Steps

1. ✅ Create implementation plan (this document)
2. ⏳ Architecture review (invoke architecture-skeptic)
3. ⏳ Implementation (invoke feature-implementer)
4. ⏳ Monte Carlo validation (ensure no instant collapses)
5. ⏳ Wiki update (document tipping point system)
6. ⏳ Archive plan to /plans/completed/

---

**Plan Created:** October 26, 2025
**Research Validation:** PASSED (research-skeptic HIGH confidence)
**Status:** Awaiting architecture review
