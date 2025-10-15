# Crisis Realism Grounding Plan

## Problem Statement

Current simulation has two major realism gaps:

1. **Famine lacks realistic timelines**
   - Current: Instant one-time mortality events
   - Reality: Gradual death curves over 30-60 days (severe malnutrition)
   - Missing: Distinction between genocidal starvation (tech can't help) vs natural disasters (tech CAN help)

2. **Nuclear effects incomplete**
   - Current: Only immediate blast/radiation deaths (60% mortality, 30% of world)
   - Missing: Regional biodiversity loss, long-term radiation, health effects

## Research Backing

### Famine Timelines (2023-2025 Active Crises)

**Gaza (Genocide Context)**
- Source: WHO, UNICEF, World Peace Foundation (2024-2025)
- 74 malnutrition deaths in 2025, 63 in July alone
- Diagnosed deaths undercount by at least 10x
- Context: Active aid blockade, resource extraction, intentional starvation
- **Key insight**: Tech can't help when it's genocide (aid prevented, infrastructure destroyed)

**Sudan (War-Driven)**
- Source: Sudan Doctors Union, UN (2024-2025)
- 522,000 children dead from malnutrition (Jan 2025 estimate)
- Famine confirmed August 2024
- 24.6 million (50% of population) in acute food insecurity
- Context: Civil war, displacement, collapsed infrastructure

**Yemen (Prolonged Crisis)**
- Source: Save the Children, UN (2016-present)
- 85,000 children dead from starvation (2015-2018)
- 17.1 million in acute food insecurity
- Context: 10 years of conflict, blockade

**Medical Timeline**:
- Severe acute malnutrition → death: **30-60 days**
- Total starvation (water only): 30-70 days
- No food or water: 8-21 days

### Nuclear Effects (Research-Backed)

**Immediate Effects** (Currently Modeled)
- ✅ Blast deaths: 60% mortality in exposed regions (30% of world)
- ✅ Immediate radiation: Included in 60% figure

**Missing Effects:**

1. **Regional Biodiversity Loss**
   - Blast zones: 100% biodiversity loss within 10km radius
   - Fallout zones: 50-90% loss within 50km
   - Nuclear winter: Global crop failure for 2-3 years
   - Source: Coupe et al. (2019), Robock et al. (2007)

2. **Long-Term Radiation Effects**
   - Acute radiation syndrome: 50-80% mortality at 4-6 Gy (weeks 1-4)
   - Cancer: +10-30% incidence over 40 years
   - Birth defects: +2-5x rate for 3 generations
   - Soil contamination: 30-300 years (Cs-137, Sr-90)
   - Source: Chernobyl studies, Hiroshima/Nagasaki long-term data

3. **Environmental Contamination**
   - Water: Iodine-131 (8 days), Cesium-137 (30 years), Strontium-90 (29 years)
   - Soil: Persistent contamination, agriculture impossible
   - Food chain: Bioaccumulation in plants, animals, humans
   - Source: Fukushima, Chernobyl exclusion zones

## Implementation Plan

### Phase 1: Regional Biodiversity System

**New Type Structure:**
```typescript
interface RegionalBiodiversity {
  region: string;  // 'North America', 'Europe', 'Asia', 'Africa', 'South America', 'Oceania'
  biodiversityIndex: number;  // 0-1, same as current global
  keySpeciesLost: string[];   // Track extinctions
  ecosystemIntegrity: number; // 0-1
  contaminationLevel: number; // 0-1 (radiation, pollution)
}

interface BiodiversitySystem {
  global: number;  // Weighted average of all regions
  regions: Map<string, RegionalBiodiversity>;
  extinctionEvents: ExtinctionEvent[];
}
```

**Regional Weights (by landmass/biodiversity hotspots):**
- Asia: 30% (largest landmass, biodiversity hotspots)
- Africa: 20% (mega-diverse)
- South America: 20% (Amazon, Andes)
- North America: 15%
- Europe: 10%
- Oceania: 5%

### Phase 2: Realistic Famine Death Curves

**New Famine State:**
```typescript
interface FamineEvent {
  id: string;
  startMonth: number;
  affectedRegion: string;
  populationAtRisk: number;        // Billions
  foodSecurityLevel: number;        // 0-1 (0 = no food)

  // Mortality curve (30-60 days to death)
  monthsSinceOnset: number;
  cumulativeDeaths: number;
  monthlyMortalityRate: number;     // Increases over time

  // Context
  isGenocide: boolean;              // If true, tech can't help
  canDeployTech: boolean;           // Hydroponics, emergency food
  resourceExtraction: boolean;      // Land grab scenario
  aidBlocked: boolean;              // Intentional blockade
}
```

**Death Curve Model:**
```
Month 0: 0% deaths
Month 1: 2% deaths (weakest die first: elderly, children, sick)
Month 2: 8% deaths (severe malnutrition sets in)
Month 3: 15% deaths (starvation peak)
Month 4: 10% deaths (remaining weak die)
Month 5+: 2% deaths (sustained low-level mortality)
```

**Tech Deployment Modifiers:**
- **Natural disaster**: Tech can reduce deaths by 50-90%
  - Hydroponics, emergency food, water purification
  - Requires: AI capability, infrastructure, resources

- **Genocide**: Tech CANNOT help (aid blocked, infrastructure destroyed)
  - Examples: Gaza (aid blockade), Holodomor (food confiscated)
  - Only diplomatic intervention or military aid can stop it

### Phase 3: Nuclear Regional Effects

**Immediate (Month 1):**
```typescript
function applyNuclearStrike(targetRegion: string, state: GameState) {
  const region = state.biodiversitySystem.regions.get(targetRegion);

  // Blast zone biodiversity loss (10km radius)
  region.biodiversityIndex *= 0.0;  // 100% loss in blast zone

  // Fallout zone (50km radius)
  region.ecosystemIntegrity *= 0.1;  // 90% ecosystem collapse

  // Contamination
  region.contaminationLevel = 1.0;  // Maximum contamination

  // Human deaths (already modeled)
  addAcuteCrisisDeaths(state, 0.60, 'Nuclear blast/radiation', 0.30, 'war');
}
```

**Long-Term (Months 2-1200 / 100 years):**
```typescript
interface RadiationHealthEffects {
  acuteRadiationSyndrome: {
    affectedPopulation: number;     // Exposed survivors
    mortalityRate: number;          // 50-80% at 4-6 Gy
    timeToDeathMonths: 1;           // Die in first month
  };

  cancerIncidence: {
    baselineRate: number;           // Normal cancer rate
    radiationBonus: number;         // +10-30% over 40 years
    latencyYears: 5;                // 5-year minimum latency
  };

  birthDefects: {
    baselineRate: number;           // Normal rate
    radiationMultiplier: number;    // 2-5x for 3 generations
    affectedGenerations: 3;
  };

  soilContamination: {
    cesium137HalfLife: 30 * 12;    // 30 years in months
    strontium90HalfLife: 29 * 12;
    agricultureImpossible: boolean;
    timeToRecoveryYears: 100;       // Optimistic
  };
}
```

## Implementation Plan (Step-by-Step)

### Phase 1: Regional Biodiversity Foundation ✅ DONE
**Files Created:**
- ✅ `src/types/regionalBiodiversity.ts` - Type definitions, initialization, nuclear effects (377 lines)

### Phase 2: Integrate Regional Biodiversity into GameState ✅ DONE
**Files Modified:**
- ✅ `src/types/game.ts` - Added `biodiversitySystem: BiodiversitySystem` (line 734)
- ✅ `src/simulation/initialization.ts` - Initialize regional biodiversity (line 358)
- ✅ `src/simulation/extinctions.ts` - Update nuclear strike to call regional effects (lines 462-473)

**Tests:**
- ✅ `tests/runRegionalBiodiversityTests.ts` - 17/17 tests passing
- ✅ `tests/regional-biodiversity.test.ts` - Jest tests (standalone runner confirmed working)

**Validation:**
- ✅ Regional weights sum to 1.0
- ✅ Nuclear strike affects only target region
- ✅ Global biodiversity = weighted average
- ✅ Asia nuclear strike doesn't affect South America

### Phase 3: Famine Death Curves System ✅ DONE
**Files Created:**
- ✅ `src/types/famine.ts` - FamineEvent type with death curves (284 lines)

**Files Modified:**
- ✅ `src/types/game.ts` - Added `famineSystem: FamineSystem` (line 737)
- ✅ `src/simulation/initialization.ts` - Initialize famine system (line 362)

**Tests:**
- ✅ `tests/runFamineTests.ts` - 23/23 tests passing

**Validation:**
- ✅ 30-60 day death curve (2% → 8% → 15% → 10% → 2%)
- ✅ Genocide blocks tech deployment (Gaza/Palestine scenarios)
- ✅ Natural disaster allows tech (50-90% reduction)
- ✅ Tech effectiveness scales with AI capability
- ✅ System tracks multiple concurrent famines

### Phase 4: Nuclear Radiation Health Effects ✅ DONE
**Files Created:**
- ✅ `src/types/radiation.ts` - RadiationHealthEffects tracking (378 lines)

**Files Modified:**
- ✅ `src/types/game.ts` - Added `radiationSystem: RadiationSystem` (line 740)
- ✅ `src/simulation/initialization.ts` - Initialize radiation system (line 366)
- ✅ `src/simulation/extinctions.ts` - Trigger radiation exposures on nuclear strike (lines 464-482)

**Tests:**
- ✅ `tests/runRadiationTests.ts` - 32/32 tests passing

**Validation:**
- ✅ Acute radiation syndrome (50-80% mortality at 4-6 Gy)
- ✅ Cancer deaths (years 5-40, peaks at year 25-30)
- ✅ Birth defects (2-5x baseline for 3 generations = ~75 years)
- ✅ Soil contamination (Cs-137 30-year half-life, 100+ years to recover)
- ✅ Hiroshima-scale validation (100k-160k acute deaths from 200k exposed)

### Phase 5: Integration Testing ✅ DONE
**Test File:** `tests/runCrisisRealismIntegration.ts` (20/20 tests passing)

**Full Scenario Validated:**
- Nuclear war (US-Russia exchange)
- Regional biodiversity loss (Asia -60%, South America untouched ✅)
- Radiation exposure (2 regions, decades-long tracking)
- Famine triggered (nuclear winter effect)

**30-Year Simulation Results:**
- Global biodiversity: 70.8% → 43.8% (27% loss)
- Contamination: 50% remaining after 30 years (1 half-life ✅)
- Famine: Gradual deaths over 6 months, then recovery
- Cancer: Peak at year 25-30 as expected ✅
- Birth defects: 3 generations tracked ✅

**System Independence Validated:**
- Regional biodiversity maintains localized damage
- Radiation system tracks long-term health effects independently
- Famine system ended naturally when food security restored
- No cross-contamination between systems ✅

## Implementation Status: COMPLETE ✅

**All 5 Phases Completed:**

1. **✅ COMPLETE**: Regional biodiversity type system (17/17 tests)
2. **✅ COMPLETE**: GameState integration (all 3 systems)
3. **✅ COMPLETE**: Famine death curves with genocide detection (23/23 tests)
4. **✅ COMPLETE**: Nuclear radiation health effects (32/32 tests)
5. **✅ COMPLETE**: Integration testing (20/20 tests)

**Final Test Results:**
- Regional Biodiversity: 17/17 ✅
- Famine Death Curves: 23/23 ✅
- Nuclear Radiation: 32/32 ✅
- Integration Tests: 20/20 ✅
- **Grand Total: 92/92 tests passing** ✅

**Production Ready:**
All crisis realism systems are fully implemented, tested, and integrated.
Nuclear strikes now trigger realistic cascade effects:
1. Immediate blast deaths (60% in exposed regions)
2. Regional biodiversity collapse (60% loss, localized)
3. Long-term radiation exposure (decades of cancer, birth defects)
4. Potential famine triggers (nuclear winter scenarios)

## Validation Tests

### Famine Validation
```typescript
// Test 1: Natural disaster famine (tech helps)
const famine1 = createFamineEvent({
  cause: 'drought',
  isGenocide: false,
  techLevel: 3.0,  // High AI capability
});
// Expected: 50-90% mortality reduction with tech

// Test 2: Genocide famine (tech can't help)
const famine2 = createFamineEvent({
  cause: 'aid_blockade',
  isGenocide: true,
  techLevel: 3.0,  // Same tech level
});
// Expected: No mortality reduction (genocide prevents deployment)
```

### Nuclear Validation
```typescript
// Test: Regional nuclear strike
applyNuclearStrike('Europe', state);
// Expected:
// - Europe biodiversity: 0% (blast zone) to 10% (region average)
// - Global biodiversity: Down by Europe's weight (10%)
// - Asia biodiversity: UNCHANGED (different region)
// - Radiation health effects accumulate over 40 years
```

## References

**Famine Data:**
- WHO (2024-2025): Gaza famine confirmation and mortality data
- Sudan Doctors Union (2025): 522,000 children dead estimate
- Save the Children (2018): Yemen starvation deaths
- World Peace Foundation: Famine mortality analysis

**Nuclear Effects:**
- Coupe et al. (2019): Nuclear winter climate modeling
- Robock et al. (2007): Regional nuclear war effects
- Chernobyl studies: Long-term radiation health effects
- Hiroshima/Nagasaki: 70-year longitudinal health data
- Fukushima exclusion zone: Environmental contamination

**Medical:**
- Clinical nutrition: Severe acute malnutrition timelines
- WHO IPC Framework: Famine phase classification
- Médecins Sans Frontières: Field mortality data
