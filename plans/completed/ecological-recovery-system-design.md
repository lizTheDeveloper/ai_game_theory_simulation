# Ecological Recovery System - Design Document
**Date:** October 20, 2025
**Status:** Design Phase
**Goal:** Implement empirically-grounded planetary boundary recovery mechanics

---

## Design Philosophy

**Principle:** Model reality, not wishful thinking
- Some boundaries ARE reversible (ozone, freshwater)
- Some boundaries are PARTIALLY reversible (climate, P/N, land)
- Some boundaries are IRREVERSIBLE (extinction, deep ocean, PFAS)

**Implementation:** Three-tier recovery system based on empirical evidence

---

## Tier 1: REVERSIBLE Boundaries (10-50 Years)

### Atmospheric Aerosol Loading
**Current State:** Likely already tracked, check implementation
**Recovery Mechanism:** Natural atmospheric turnover (1-5 years)

```typescript
// If emissions stop, aerosols clear rapidly
if (aerosolEmissions < 0.1 * baselineEmissions) {
  atmosphericAerosol.recoveryMonths++;
  if (atmosphericAerosol.recoveryMonths >= 12) {
    atmosphericAerosol.breached = false;
  }
} else {
  atmosphericAerosol.recoveryMonths = 0;
}
```

**Research:** Particulate matter has atmospheric residence time of days to months

### Freshwater Use
**Current State:** Tracked as `state.planetaryBoundaries.freshwater`
**Recovery Mechanism:** Aquifer recharge (10-30 years)

```typescript
// Recovery requires:
// 1. Extraction below recharge rate (waterUse < rechargeRate)
// 2. Sustained for 10-15 years
// 3. Regional variation (some aquifers recover faster than others)

if (state.planetaryBoundaries.freshwater > 0.65) {
  state.planetaryBoundariesSystem.boundaries.freshwaterUse.recoveryMonths =
    (state.planetaryBoundariesSystem.boundaries.freshwaterUse.recoveryMonths ?? 0) + 1;

  // Recovery threshold: 15 years (180 months) of sustained improvement
  if (state.planetaryBoundariesSystem.boundaries.freshwaterUse.recoveryMonths >= 180) {
    state.planetaryBoundariesSystem.boundaries.freshwaterUse.breached = false;
    // Log recovery event
  }
} else {
  state.planetaryBoundariesSystem.boundaries.freshwaterUse.recoveryMonths = 0;
}
```

**Research:**
- Ogallala Aquifer: Recharge rate 0.1-0.5 inches/year, depletion rate 6 inches/year
- Recovery requires STOPPING extraction for decades
- Not all aquifers recoverable (fossil aquifers)

---

## Tier 2: PARTIAL Reversal (30-100+ Years)

### Climate Change (Temperature)
**Current State:** Tracked as `state.climateState.globalWarming`
**Recovery Mechanism:** Massive CDR + natural carbon cycle (50-100 years)

```typescript
// Recovery requires:
// 1. Net-negative emissions (CDR > emissions)
// 2. Temperature sustained below 1.5°C for 24 months
// 3. Breakthrough CDR technologies deployed

const netEmissions = state.climateState.annualEmissions - state.climateState.annualCDR;

if (state.climateState.globalWarming < 1.5 && netEmissions < 0) {
  state.planetaryBoundariesSystem.boundaries.climateChange.recoveryMonths =
    (state.planetaryBoundariesSystem.boundaries.climateChange.recoveryMonths ?? 0) + 1;

  // Recovery threshold: 24 months sustained below 1.5°C with net-negative emissions
  if (state.planetaryBoundariesSystem.boundaries.climateChange.recoveryMonths >= 24) {
    state.planetaryBoundariesSystem.boundaries.climateChange.breached = false;
    // Log: "Climate boundary recovered - temperature stabilized below 1.5°C"
  }
} else {
  state.planetaryBoundariesSystem.boundaries.climateChange.recoveryMonths = 0;
}
```

**Research:** IPCC AR6 - overshoot scenarios require 360-680 GtCO₂ removal

**Technologies Required:**
- Direct Air Capture (TIER 3)
- Enhanced Soil Carbon (TIER 2)
- Ocean Alkalinity Enhancement (TIER 4, speculative)
- Afforestation/Reforestation (TIER 1-2)

### Biochemical Flows (Phosphorus)
**Current State:** Tracked as `state.planetaryBoundaries.phosphorus`
**Recovery Mechanism:** Input reduction + legacy cleanup (30-50 years)

```typescript
// Recovery requires:
// 1. 40% reduction in phosphorus inputs (agricultural runoff)
// 2. Legacy sediment cleanup (expensive, slow)
// 3. Sustained improvement for 5 years

const inputReduction = 1.0 - (currentInputs / baselineInputs);
const legacyCleanupActive = state.breakthroughTechnologies.some(
  tech => tech.id === 'struvite_recovery' && tech.deployed
);

if (state.planetaryBoundaries.phosphorus > 0.65 && inputReduction >= 0.4) {
  state.planetaryBoundariesSystem.boundaries.biochemicalFlows.phosphorusRecoveryMonths =
    (state.planetaryBoundariesSystem.boundaries.biochemicalFlows.phosphorusRecoveryMonths ?? 0) + 1;

  // Recovery threshold: 60 months (5 years) if legacy cleanup active
  // 120 months (10 years) without legacy cleanup (natural sedimentation)
  const recoveryThreshold = legacyCleanupActive ? 60 : 120;

  if (state.planetaryBoundariesSystem.boundaries.biochemicalFlows.phosphorusRecoveryMonths >= recoveryThreshold) {
    state.planetaryBoundariesSystem.boundaries.biochemicalFlows.phosphorusBreached = false;
    // Log: "Phosphorus boundary recovered - inputs reduced & legacy cleaned"
  }
} else {
  state.planetaryBoundariesSystem.boundaries.biochemicalFlows.phosphorusRecoveryMonths = 0;
}
```

**Research:** Lake Erie - 40% reduction goal, but legacy phosphorus complicates recovery

**Technologies Required:**
- Struvite Recovery (TIER 1) - 98% recovery from wastewater
- Precision Agriculture (TIER 1) - reduce runoff
- Sediment Dredging (expensive, not modeled as tech)

### Biochemical Flows (Nitrogen)
**Similar to phosphorus but faster recovery (no legacy sediment issue in atmosphere)**

```typescript
// Nitrogen recovers faster than phosphorus (atmospheric cycle)
// Recovery threshold: 36 months (3 years) with input reduction
```

### Land System Change (Deforestation)
**Current State:** Tracked as `state.planetaryBoundariesSystem.boundaries.landSystemChange`
**Recovery Mechanism:** Reforestation + ecosystem function restoration (30-100 years)

```typescript
// Recovery requires:
// 1. Forest cover restored above threshold
// 2. Sustained for 30-60 years (tree cover)
// 3. Sustained for 60-100 years (ecosystem function)

const forestCover = state.environmentalAccumulation.forestCover ?? 0.7;

if (forestCover > 0.75) {
  state.planetaryBoundariesSystem.boundaries.landSystemChange.recoveryMonths =
    (state.planetaryBoundariesSystem.boundaries.landSystemChange.recoveryMonths ?? 0) + 1;

  // Two-stage recovery:
  // Stage 1: Tree cover (360 months = 30 years)
  // Stage 2: Ecosystem function (1200 months = 100 years)

  if (state.planetaryBoundariesSystem.boundaries.landSystemChange.recoveryMonths >= 360) {
    state.planetaryBoundariesSystem.boundaries.landSystemChange.partialRecovery = true;
    // Boundary still technically breached, but improving
  }

  if (state.planetaryBoundariesSystem.boundaries.landSystemChange.recoveryMonths >= 1200) {
    state.planetaryBoundariesSystem.boundaries.landSystemChange.breached = false;
    // Full ecosystem function restored
  }
} else {
  state.planetaryBoundariesSystem.boundaries.landSystemChange.recoveryMonths = 0;
  state.planetaryBoundariesSystem.boundaries.landSystemChange.partialRecovery = false;
}
```

**Research:** Rewilding shows tree cover ≠ ecosystem function; full restoration 60-100 years

**Technologies Required:**
- Rewilding Programs (policy, not tech)
- Assisted Migration (TIER 2-3)
- Ecosystem Monitoring (TIER 1)

---

## Tier 3: IRREVERSIBLE or DEEP PERMANENCE

### Biosphere Integrity (Extinction)
**Current State:** Tracked as `state.planetaryBoundariesSystem.boundaries.biosphereIntegrity`
**Recovery Mechanism:** NONE (extinction is permanent)

```typescript
// Species loss is ONE-WAY
// Can slow extinction rate, cannot reverse
// Population recovery possible (Saiga antelope), but extinction permanent

// Check if extinction rate declining (not reversing)
const extinctionRate = calculateExtinctionRate(state);

if (extinctionRate < 0.1 * baselineExtinctionRate) {
  state.planetaryBoundariesSystem.boundaries.biosphereIntegrity.stabilizing = true;
  // Boundary remains breached, but hemorrhaging stopped
} else {
  state.planetaryBoundariesSystem.boundaries.biosphereIntegrity.stabilizing = false;
}

// NEVER un-breach this boundary
// Can only prevent further deterioration
```

**Research:** Extinction is irreversible; population recovery possible but takes decades

**Why No Recovery:**
- Cannot resurrect extinct species (no cloning, no de-extinction at scale)
- Ecosystem function depends on biodiversity
- Trophic cascades from megafauna loss
- Genetic diversity lost forever

**Partial Mitigation:**
- Rewilding (restore populations, not species)
- Habitat protection (prevent further loss)
- Captive breeding (limited success rate)

### Ocean Acidification
**Current State:** Tracked as `state.planetaryBoundariesSystem.boundaries.oceanAcidification`
**Recovery Mechanism:** PARTIAL (surface only, 100-300 years)

```typescript
// Surface ocean can recover, deep ocean cannot (on human timescales)

const surfaceRecovery = state.climateState.globalWarming < 1.5 && netEmissions < 0;
const deepOceanAcidification = true; // Always true once breached (300+ year lag)

if (surfaceRecovery) {
  state.planetaryBoundariesSystem.boundaries.oceanAcidification.surfaceRecoveryMonths =
    (state.planetaryBoundariesSystem.boundaries.oceanAcidification.surfaceRecoveryMonths ?? 0) + 1;

  // Surface recovery: 100 years (1200 months)
  if (state.planetaryBoundariesSystem.boundaries.oceanAcidification.surfaceRecoveryMonths >= 1200) {
    state.planetaryBoundariesSystem.boundaries.oceanAcidification.surfaceRecovered = true;
    // BUT boundary still breached due to deep ocean
  }
} else {
  state.planetaryBoundariesSystem.boundaries.oceanAcidification.surfaceRecoveryMonths = 0;
}

// Deep ocean remains acidified (15-18% more acidic than pre-industrial PERMANENTLY)
// Boundary NEVER fully un-breaches
```

**Research:** Deep ocean acidity 15-18% higher than pre-industrial even at pre-industrial atmospheric CO₂

**Why Partial Only:**
- Deep ocean circulation takes centuries
- Carbonate chemistry hysteresis
- Aragonite/calcite saturation states don't fully recover

### Novel Entities (PFAS, Microplastics)
**Current State:** Tracked as `state.planetaryBoundariesSystem.boundaries.novelEntities`
**Recovery Mechanism:** NONE (effectively permanent)

```typescript
// Once released, PFAS and microplastics persist indefinitely
// No environmental cleanup technology exists at scale

// Can only stop NEW inputs
const novelEntityInputs = calculateNovelEntityInputs(state);

if (novelEntityInputs < 0.05 * baselineInputs) {
  state.planetaryBoundariesSystem.boundaries.novelEntities.inputsStopped = true;
  // Prevents further deterioration, but doesn't reverse damage
} else {
  state.planetaryBoundariesSystem.boundaries.novelEntities.inputsStopped = false;
}

// Boundary NEVER un-breaches
// Contamination is permanent
```

**Research:** PFAS/microplastics are "forever chemicals" - no environmental removal

**Why Irreversible:**
- No natural breakdown process
- Environmental ubiquity (oceans, Arctic, human blood)
- Pyrolysis works on concentrated sources (wastewater biosolids) but not dispersed contamination
- Bioaccumulation in food chains

**Only Solution:** PREVENTION (ban production)

---

## Ecological Score Calculation Update

### Current Formula (Broken)
```typescript
// All boundaries weighted equally, instant collapse
const safeBoundaries = countSafeBoundaries();
const planetaryScore = (safeBoundaries / 9) * 100;
```

### New Formula (Realistic)
```typescript
function calculateEcologicalScore(state: GameState): number {
  const boundaries = state.planetaryBoundariesSystem.boundaries;

  // Tier 1: Reversible (full credit for recovery)
  const atmosphericAerosol = boundaries.atmosphericAerosol.breached ? 0 : 100;
  const freshwater = boundaries.freshwaterUse.breached ?
    (boundaries.freshwaterUse.recoveryMonths / 180) * 100 : 100;

  // Tier 2: Partial (credit for progress toward recovery)
  const climate = boundaries.climateChange.breached ?
    Math.min(100, (boundaries.climateChange.recoveryMonths / 24) * 50) : 100;
  const phosphorus = boundaries.biochemicalFlows.phosphorusBreached ?
    Math.min(100, (boundaries.biochemicalFlows.phosphorusRecoveryMonths / 60) * 50) : 100;
  const land = boundaries.landSystemChange.breached ?
    (boundaries.landSystemChange.partialRecovery ? 50 :
     Math.min(50, (boundaries.landSystemChange.recoveryMonths / 360) * 50)) : 100;

  // Tier 3: Irreversible (penalty is permanent, but credit for stabilization)
  const biosphere = boundaries.biosphereIntegrity.breached ?
    (boundaries.biosphereIntegrity.stabilizing ? 25 : 0) : 100;
  const oceanAcidification = boundaries.oceanAcidification.breached ?
    (boundaries.oceanAcidification.surfaceRecovered ? 40 :
     Math.min(40, (boundaries.oceanAcidification.surfaceRecoveryMonths / 1200) * 40)) : 100;
  const novelEntities = boundaries.novelEntities.breached ?
    (boundaries.novelEntities.inputsStopped ? 20 : 0) : 100;

  // Weighted score
  const scores = [
    { value: atmosphericAerosol, weight: 0.05 },
    { value: freshwater, weight: 0.10 },
    { value: climate, weight: 0.20 },
    { value: phosphorus, weight: 0.10 },
    { value: land, weight: 0.10 },
    { value: biosphere, weight: 0.20 },
    { value: oceanAcidification, weight: 0.15 },
    { value: novelEntities, weight: 0.10 }
  ];

  const weightedScore = scores.reduce((sum, s) => sum + (s.value * s.weight), 0);
  return weightedScore;
}
```

**Key Changes:**
1. **Progressive credit:** Recovery months count toward score before full un-breach
2. **Tier-based limits:** Irreversible boundaries max out at 20-40% even if "stabilized"
3. **Realistic weights:** Climate + biosphere = 40% (most important, hardest to fix)
4. **Hope for partial success:** Can achieve 50-60 score even with some permanent damage

---

## Technology Prerequisites for Recovery

### Required Breakthrough Technologies

**Tier 1 (Reversible):**
- None required (natural processes work)
- Policy enforcement sufficient

**Tier 2 (Partial):**
- **Climate:** Direct Air Capture (TIER 3), Enhanced Soil Carbon (TIER 2)
- **Phosphorus:** Struvite Recovery (TIER 1), Precision Agriculture (TIER 1)
- **Land:** Rewilding programs (policy), Assisted Migration (TIER 2-3)

**Tier 3 (Irreversible):**
- **Biosphere:** Captive Breeding (TIER 2), Habitat Protection (policy)
- **Ocean:** Ocean Alkalinity Enhancement (TIER 4, speculative)
- **Novel Entities:** PFAS Ban (policy), Pyrolysis (TIER 3, limited scope)

### Technology Deployment Timing
```typescript
// Check if CDR technologies deployed
const dacDeployed = state.breakthroughTechnologies.some(
  t => t.id === 'direct_air_capture' && t.deployed
);

const soilCarbonDeployed = state.breakthroughTechnologies.some(
  t => t.id === 'enhanced_soil_carbon' && t.deployed
);

const cdrCapacity = (dacDeployed ? 10 : 0) + (soilCarbonDeployed ? 5 : 0); // GtCO2/year

// Climate recovery only possible if CDR > emissions
if (cdrCapacity > state.climateState.annualEmissions) {
  // Start recovery counter
}
```

---

## Policy Prerequisites for Recovery

### Government Actions Required

**Enforcement:**
- Montreal Protocol-style international agreements
- Verification mechanisms
- Penalty systems for violations

**Economic Incentives:**
- Carbon pricing (climate)
- Nutrient pricing (phosphorus/nitrogen)
- Subsidies for restoration
- Payment for ecosystem services

**Agricultural Transformation:**
- Precision agriculture mandates
- Runoff regulations
- Organic/regenerative transition

**Industrial Regulation:**
- PFAS production ban
- Microplastic regulations
- Circular economy requirements

```typescript
// Check if government policies enable recovery
const enforcementCapacity = state.government.governanceQuality.enforcementCapacity ?? 0.5;
const internationalCooperation = state.government.internationalCooperation ?? 0.5;

const policyEffectiveness = (enforcementCapacity + internationalCooperation) / 2;

// Recovery requires high policy effectiveness (>0.7)
if (policyEffectiveness > 0.7) {
  // Enable recovery mechanics
} else {
  // Recovery blocked by governance failure
}
```

---

## Implementation Plan

### Phase 1: State Structure Updates
**File:** `src/types/game.ts`

Add recovery tracking to `PlanetaryBoundariesSystem`:
```typescript
export interface PlanetaryBoundary {
  breached: boolean;
  recoveryMonths?: number;       // Track sustained recovery
  partialRecovery?: boolean;     // For land system (tree cover vs function)
  stabilizing?: boolean;         // For biosphere (stopped deteriorating)
  surfaceRecovered?: boolean;    // For ocean (surface vs deep)
  inputsStopped?: boolean;       // For novel entities (prevention only)
}
```

### Phase 2: Recovery Functions
**File:** `src/simulation/planetaryBoundaryRecovery.ts` (NEW)

Create helper functions:
```typescript
export function updateBoundaryRecovery(state: GameState): void {
  updateFreshwaterRecovery(state);
  updateClimateRecovery(state);
  updatePhosphorusRecovery(state);
  updateNitrogenRecovery(state);
  updateLandSystemRecovery(state);
  updateBiosphereStabilization(state);
  updateOceanAcidificationRecovery(state);
  updateNovelEntitiesStabilization(state);
}
```

### Phase 3: Phase Integration
**File:** `src/simulation/engine/phases/PlanetaryBoundariesPhase.ts`

Call recovery updates monthly:
```typescript
export class PlanetaryBoundariesPhase implements SimulationPhase {
  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Existing boundary degradation logic
    updateBoundaryDegradation(state);

    // NEW: Recovery mechanics
    updateBoundaryRecovery(state);

    return { state, events };
  }
}
```

### Phase 4: Score Calculation Update
**File:** `src/simulation/engine/phases/MultiParadigmDUIUpdatePhase.ts`

Replace simple count with progressive scoring:
```typescript
function calculateEcological(state: GameState): number {
  // Use new progressive scoring formula
  return calculateProgressiveEcologicalScore(state);
}
```

---

## Expected Outcomes

### Baseline (No Intervention)
- **Ecological Score:** 1.3/100 (current, all boundaries breached)
- **Recovery:** None (no mechanism)

### With Recovery System (Realistic Intervention)
- **Ecological Score:** 30-50/100 (mixed outcomes)
- **Reversible boundaries:** Recover in 10-50 years if tech deployed
- **Partial boundaries:** Improve to 50% if massive CDR deployed
- **Irreversible boundaries:** Stabilize but never fully recover

### Best Case (Heroic Intervention)
- **Ecological Score:** 60-70/100 (near-utopia threshold)
- **Requirements:**
  - CDR deployed at gigatonne scale (>10 GtCO₂/year)
  - Agricultural transformation (40% P/N reduction)
  - Global cooperation (Montreal Protocol-level)
  - Sustained effort for 50-100 years
  - Still carries permanent damage (extinction, deep ocean)

---

## Validation Criteria

### Success Metrics
1. **At least 20% of runs** achieve Ecological >30 (mixed, not dystopia)
2. **At least 5% of runs** achieve Ecological >70 (utopia)
3. **Reversible boundaries recover** in 10-50 years when tech deployed
4. **Irreversible boundaries never recover** (extinction, deep ocean, PFAS)

### Failure Modes
1. **100% still dystopia:** Recovery thresholds too harsh
2. **Instant recovery:** Not realistic, thresholds too easy
3. **All boundaries recover:** Violates empirical evidence on irreversibility

---

## Next: Democracy Recovery Design

After implementing ecological recovery, design Western Liberal recovery with similar empirical grounding:
- Post-crisis institutional strengthening (real examples?)
- Emergency response → governance quality feedback
- Limits to democratic recovery (authoritarian persistence)
