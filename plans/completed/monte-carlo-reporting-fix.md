# Monte Carlo Reporting & QoL Reality Disconnect Fix

**Date**: Oct 12, 2025  
**Priority**: 🚨 CRITICAL  
**Est. Time**: 3-4 hours

## The Problems

### 1. **QoL Reality Disconnect** (CRITICAL BUG)

**Current State**:
```
Basic Needs: 40.057 (impossible - scale is 0-2.0)
Overall QoL: 8.735 (great!)
Final Population: 378M-575M (52-93% mortality)
```

**Root Cause**: `materialAbundance` scales with `totalAICapability * 0.15` with NO UPPER LIMIT at Economic Stage 4+.

**Example**:
- 40 AIs × 5.0 capability each = 200 total capability
- materialAbundance += 200 × 0.15 = +30 (!!!)
- System thinks: "Super-capable AIs → infinite abundance!"
- Reality: 95% of people dead, famines, nuclear wars, tipping point cascades

**Crisis Impacts DO Work** but are overwhelmed:
- Crisis reduces materialAbundance by 30% → ×0.7
- But base calculation adds +30 from AI capability
- Net result: QoL completely disconnected from human suffering

### 2. **Monte Carlo Reporting Useless**

**Missing Critical Data**:
- ❌ No population metrics (THE #1 thing!)
- ❌ No death counts (50-95% mortality not reported)
- ❌ No crisis impact summary (nuclear wars, famines buried in logs)
- ❌ No refugee counts
- ❌ "None" outcome = ??? (meaningless)
- ❌ Organization 100% survival contradicts population collapse

**Broken Data**:
- Basic Needs: 40.057 (should be 0-2.0)
- "✅ Excellent: Organizations are thriving!" (while 95% dead)

## The Fixes

### Fix 1: Scale Material Abundance with Population (30 min)

**File**: `src/simulation/qualityOfLife.ts`

**Problem**: Post-scarcity bonuses don't account for population collapse.

**Solution**: 
```typescript
// Line 144-149: Add population scaling
if (economicStage >= 4) {
  // CRITICAL: Scale abundance by population survival
  const populationFraction = state.humanPopulationSystem.population / 
                            state.humanPopulationSystem.baselinePopulation;
  const populationScaling = 0.3 + (populationFraction * 0.7); // 30-100% scaling
  
  // Full automation → material abundance explodes (BUT only for survivors)
  materialAbundance += 0.8 * populationScaling;
  // AI capability accelerates abundance (scaled by who's alive to benefit)
  materialAbundance += (totalAICapability * 0.15) * populationScaling;
  
  // Cap at reasonable post-scarcity levels
  materialAbundance = Math.min(3.0, Math.max(0, materialAbundance));
}
```

**Rationale**:
- If 95% of population dead, abundance should reflect that survivors are scattered, infrastructure collapsed
- AI making infinite goods doesn't help if distribution networks are gone
- Even with robots, 50M survivors can't maintain 8B infrastructure

### Fix 2: Add Population Metrics to Monte Carlo (1 hour)

**File**: `scripts/monteCarloSimulation.ts`

**Add to `RunResult` interface** (line 84):
```typescript
interface RunResult {
  // ... existing fields ...
  
  // === POPULATION & MORTALITY (CRITICAL MISSING DATA) ===
  initialPopulation: number;          // Starting population (8.0B)
  finalPopulation: number;            // Ending population
  peakPopulation: number;             // Highest reached
  populationDecline: number;          // % decline from baseline
  totalDeaths: number;                // Total deaths across all causes
  
  // Death breakdown by cause
  deathsNatural: number;              // Baseline mortality
  deathsCrisis: number;               // Crisis deaths (famine, disease, etc.)
  deathsNuclear: number;              // Nuclear war deaths
  deathsCascade: number;              // Tipping point cascade deaths
  deathsMeaning: number;              // Suicide epidemic deaths
  
  // Population outcome
  populationOutcome: 'growth' | 'stable' | 'decline' | 'bottleneck' | 'extinction';
  geneticBottleneck: boolean;         // < 50M people
  
  // === CRISIS IMPACT SUMMARY ===
  totalCrisisMonths: number;          // Months with active crises
  maxSimultaneousCrises: number;      // Peak crisis count
  nuclearWarsCount: number;           // Number of nuclear exchanges
  totalRefugees: number;              // Total displaced people
  refugeeCrisisCount: number;         // Number of refugee crises
  
  // === ECOLOGICAL COLLAPSE ===
  finalClimateStability: number;      // 0-1
  finalBiodiversity: number;          // 0-1
  finalResourceReserves: number;      // 0-1
  tippingPointCascadeActive: boolean;
  tippingPointCascadeMonths: number;
}
```

**Capture data** (line 280-400):
```typescript
const pop = finalState.humanPopulationSystem;
const env = finalState.environmentalAccumulation;

// Population metrics
const initialPopulation = pop.baselinePopulation;
const finalPopulation = pop.population;
const populationDecline = ((initialPopulation - finalPopulation) / initialPopulation) * 100;

// Death breakdown
const deaths = pop.deathTracking;
const deathsNatural = deaths.baseline;
const deathsCrisis = deaths.acuteCrisis + deaths.refugee;
const deathsNuclear = deaths.nuclear || 0;
const deathsCascade = deaths.cascadeEvents || 0;
const deathsMeaning = deaths.meaningCollapse || 0;
const totalDeaths = (initialPopulation - finalPopulation) * 1000; // billions to millions

// Population outcome
let populationOutcome: 'growth' | 'stable' | 'decline' | 'bottleneck' | 'extinction';
if (finalPopulation < 0.00001) populationOutcome = 'extinction';
else if (finalPopulation < 0.05) populationOutcome = 'bottleneck'; // < 50M
else if (populationDecline > 30) populationOutcome = 'decline';
else if (populationDecline > 5) populationOutcome = 'stable';
else populationOutcome = 'growth';

// Crisis impact
const nuclearWarsCount = runResult.log.events.criticalEvents.filter(e => 
  e.description.includes('Nuclear war') || e.description.includes('nuclear')).length;

const refugeeCrisisCount = runResult.log.events.criticalEvents.filter(e => 
  e.description.includes('refugee') || e.description.includes('REFUGEE')).length;

// Add to results
results.push({
  // ... existing fields ...
  initialPopulation,
  finalPopulation,
  peakPopulation: pop.peakPopulation,
  populationDecline,
  totalDeaths,
  deathsNatural,
  deathsCrisis,
  deathsNuclear,
  deathsCascade,
  deathsMeaning,
  populationOutcome,
  geneticBottleneck: pop.geneticBottleneckActive,
  nuclearWarsCount,
  refugeeCrisisCount,
  finalClimateStability: env.climateStability,
  finalBiodiversity: env.biodiversityIndex,
  finalResourceReserves: env.resourceReserves,
  tippingPointCascadeActive: finalState.planetaryBoundariesSystem?.cascadeActive || false,
  // ...
});
```

### Fix 3: Add Critical Reporting Sections (1 hour)

**Add after outcome distribution** (line ~830):

```typescript
// ============================================================================
log('\n\n' + '='.repeat(80));
log('👥 POPULATION & MORTALITY');
log('='.repeat(80));

const avgInitialPop = results.reduce((sum, r) => sum + r.initialPopulation, 0) / results.length;
const avgFinalPop = results.reduce((sum, r) => sum + r.finalPopulation, 0) / results.length;
const avgDecline = results.reduce((sum, r) => sum + r.populationDecline, 0) / results.length;
const avgTotalDeaths = results.reduce((sum, r) => sum + r.totalDeaths, 0) / results.length;

log(`\n  POPULATION TRAJECTORY:`);
log(`    Initial: ${avgInitialPop.toFixed(2)}B (start of simulation)`);
log(`    Final: ${avgFinalPop.toFixed(2)}B (after ${MAX_MONTHS} months)`);
log(`    Decline: ${avgDecline.toFixed(1)}% (${(avgInitialPop - avgFinalPop).toFixed(2)}B deaths)`);
log(`    Peak: ${(results.reduce((sum, r) => sum + r.peakPopulation, 0) / results.length).toFixed(2)}B`);

log(`\n  MORTALITY BREAKDOWN:`);
log(`    Total Deaths: ${avgTotalDeaths.toFixed(0)}M people`);
log(`    Natural: ${(results.reduce((sum, r) => sum + r.deathsNatural, 0) / results.length).toFixed(0)}M (baseline)`);
log(`    Crisis: ${(results.reduce((sum, r) => sum + r.deathsCrisis, 0) / results.length).toFixed(0)}M (famine, disease, disasters)`);
log(`    Nuclear: ${(results.reduce((sum, r) => sum + r.deathsNuclear, 0) / results.length).toFixed(0)}M (nuclear wars)`);
log(`    Cascade: ${(results.reduce((sum, r) => sum + r.deathsCascade, 0) / results.length).toFixed(0)}M (tipping point cascades)`);
log(`    Meaning: ${(results.reduce((sum, r) => sum + r.deathsMeaning, 0) / results.length).toFixed(0)}M (suicide epidemic)`);

log(`\n  POPULATION OUTCOMES:`);
const popOutcomes = {
  growth: results.filter(r => r.populationOutcome === 'growth').length,
  stable: results.filter(r => r.populationOutcome === 'stable').length,
  decline: results.filter(r => r.populationOutcome === 'decline').length,
  bottleneck: results.filter(r => r.populationOutcome === 'bottleneck').length,
  extinction: results.filter(r => r.populationOutcome === 'extinction').length
};
log(`    Growth: ${popOutcomes.growth} runs (${(popOutcomes.growth/NUM_RUNS*100).toFixed(1)}%)`);
log(`    Stable: ${popOutcomes.stable} runs (${(popOutcomes.stable/NUM_RUNS*100).toFixed(1)}%)`);
log(`    Severe Decline: ${popOutcomes.decline} runs (${(popOutcomes.decline/NUM_RUNS*100).toFixed(1)}%)`);
log(`    Genetic Bottleneck (<50M): ${popOutcomes.bottleneck} runs (${(popOutcomes.bottleneck/NUM_RUNS*100).toFixed(1)}%)`);
log(`    True Extinction (<10K): ${popOutcomes.extinction} runs (${(popOutcomes.extinction/NUM_RUNS*100).toFixed(1)}%)`);

const geneticBottlenecks = results.filter(r => r.geneticBottleneck).length;
log(`\n  ⚠️  Genetic Bottleneck Risk: ${geneticBottlenecks} runs (${(geneticBottlenecks/NUM_RUNS*100).toFixed(1)}%)`);

// ============================================================================
log('\n\n' + '='.repeat(80));
log('☢️  NUCLEAR & CATASTROPHIC EVENTS');
log('='.repeat(80));

const avgNuclearWars = results.reduce((sum, r) => sum + r.nuclearWarsCount, 0) / results.length;
const runsWithNuclear = results.filter(r => r.nuclearWarsCount > 0).length;

log(`\n  NUCLEAR WARFARE:`);
log(`    Runs with Nuclear War: ${runsWithNuclear} / ${NUM_RUNS} (${(runsWithNuclear/NUM_RUNS*100).toFixed(1)}%)`);
log(`    Avg Nuclear Exchanges: ${avgNuclearWars.toFixed(1)} per run`);
log(`    Avg Deaths (nuclear): ${(results.reduce((sum, r) => sum + r.deathsNuclear, 0) / results.length).toFixed(0)}M`);

log(`\n  REFUGEE CRISES:`);
const avgRefugeeCrises = results.reduce((sum, r) => sum + r.refugeeCrisisCount, 0) / results.length;
log(`    Avg Refugee Crises: ${avgRefugeeCrises.toFixed(1)} per run`);

log(`\n  TIPPING POINT CASCADES:`);
const cascadeRuns = results.filter(r => r.tippingPointCascadeActive).length;
log(`    Runs with Active Cascade: ${cascadeRuns} / ${NUM_RUNS} (${(cascadeRuns/NUM_RUNS*100).toFixed(1)}%)`);

// ============================================================================
log('\n\n' + '='.repeat(80));
log('🌍 ENVIRONMENTAL COLLAPSE');
log('='.repeat(80));

const avgClimate = results.reduce((sum, r) => sum + r.finalClimateStability, 0) / results.length;
const avgBiodiversity = results.reduce((sum, r) => sum + r.finalBiodiversity, 0) / results.length;
const avgResources = results.reduce((sum, r) => sum + r.finalResourceReserves, 0) / results.length;

log(`\n  PLANETARY BOUNDARIES (Final State):`);
log(`    Climate Stability: ${(avgClimate * 100).toFixed(1)}% (baseline: 60%)`);
log(`    Biodiversity: ${(avgBiodiversity * 100).toFixed(1)}% (baseline: 35%)`);
log(`    Resource Reserves: ${(avgResources * 100).toFixed(1)}% (baseline: 65%)`);

if (avgClimate < 0.4) log(`    ⚠️  Climate catastrophe threshold breached`);
if (avgBiodiversity < 0.3) log(`    ⚠️  Ecosystem collapse threshold breached`);
if (avgResources < 0.3) log(`    ⚠️  Resource crisis threshold breached`);
```

### Fix 4: Fix QoL Reporting (30 min)

**Replace lines 1190-1220**:
```typescript
// ============================================================================
log('\n\n' + '='.repeat(80));
log('❤️  QUALITY OF LIFE BREAKDOWN (REALITY CHECK)');
log('='.repeat(80));

const avgQolBasic = results.reduce((sum, r) => sum + Math.min(2.0, r.qolBasicNeeds), 0) / results.length;
// ^ Cap at 2.0 to show real values

log(`\n  QOL BY CATEGORY (0-1 baseline, up to 2.0 in post-scarcity):`);
log(`    Basic Needs: ${avgQolBasic.toFixed(3)} (food, water, shelter, energy)`);
log(`    Psychological: ${avgQolPsych.toFixed(3)} (autonomy, purpose, creativity)`);
log(`    Social: ${avgQolSocial.toFixed(3)} (community, freedom, safety)`);
log(`    Health: ${avgQolHealth.toFixed(3)} (healthcare, mental health, lifespan)`);
log(`    Environmental: ${avgQolEnviron.toFixed(3)} (climate, biodiversity, pollution)`);
log(`\n    OVERALL QOL: ${avgQoL.toFixed(3)}`);

// Reality check
const avgPopDecline = results.reduce((sum, r) => sum + r.populationDecline, 0) / results.length;
if (avgQolBasic > 1.5 && avgPopDecline > 50) {
  log(`\n  ⚠️  WARNING: High QoL (${avgQolBasic.toFixed(2)}) despite ${avgPopDecline.toFixed(0)}% mortality`);
  log(`      This suggests QoL calculation may not fully reflect human suffering.`);
}

if (avgQolBasic > 2.0) {
  log(`\n  🚨 BUG DETECTED: Basic Needs QoL = ${avgQolBasic.toFixed(2)} (max should be 2.0)`);
  log(`      Material abundance scaling is broken! Check qualityOfLife.ts line 153.`);
}
```

## Expected Impact

### Before Fix:
```
Outcome: 100% "inconclusive" (meaningless)
Basic Needs: 40.057 (broken)
Overall QoL: 8.735 (misleading)
Population: ??? (not reported!)
Deaths: ??? (not reported!)
Reality: 95% mortality, famines, nuclear wars → hidden
```

### After Fix:
```
POPULATION & MORTALITY:
  Initial: 8.00B
  Final: 0.42B (47% decline, 7.58B deaths)
  
MORTALITY BREAKDOWN:
  Nuclear: 3,420M
  Crisis: 2,150M (famine, disease)
  Cascade: 1,800M (tipping point)
  Natural: 210M (baseline)
  
POPULATION OUTCOMES:
  Severe Decline: 8 runs (80%)
  Genetic Bottleneck: 2 runs (20%)
  True Extinction: 0 runs (0%)
  
QUALITY OF LIFE (Reality Check):
  Basic Needs: 0.34 (down from 0.80 baseline)
  Overall QoL: 0.28 (severe crisis conditions)
  ⚠️  Population decline: 95% mortality
```

## Implementation Order

1. **Fix QoL population scaling** (30 min) - Most critical bug
2. **Add population/death metrics** (1 hour) - Core missing data
3. **Add critical reporting sections** (1 hour) - Make results useful
4. **Fix QoL reporting** (30 min) - Reality check

**Total**: 3 hours estimated

## Research Backing

**Population-QoL Scaling**:
- Infrastructure requires critical mass (Tainter, Collapse of Complex Societies)
- Distribution networks fail below population thresholds
- Knowledge loss accelerates with population decline
- 95% mortality = Dark Ages level collapse, not "post-scarcity abundance"

**Genetic Bottleneck**: 
- Toba: 3K-10K survivors, 70K years ago
- MVP: 10K-50K for genetic diversity
- Below 50M: Serious genetic bottleneck risk

---

**Status**: READY TO IMPLEMENT  
**Priority**: 🚨 CRITICAL (blocking accurate Monte Carlo analysis)

