# Climate Phased Deployment Model - Implementation Plan

**Date:** 2025-11-13
**Plan Type:** TIER 1 CRITICAL Feature
**Research Foundation:** research/climate_deployment_timescales_20251113.md (REVISED)
**Critique:** reviews/climate_deployment_timescales_critique_20251113.md (CONDITIONAL PASS)
**Goal:** Address 5.5% climate technology effectiveness gap through realistic deployment modeling

## Executive Summary

This plan implements phased deployment timescales (2-50 years), energy budget constraints (TWh partitioning), and temperature-dependent degradation feedback loops for climate technologies. Adds 9 new breakthrough technologies (TIER 0-3) with realistic scale-up curves.

**Expected Impact:** Increase climate tech effectiveness from 5.5% to 30-50% in typical scenarios, 80%+ in optimal god mode scenarios.

## 1. State Variable Extensions

### 1.1 BreakthroughTechnology Interface Extensions

**Location:** `src/types/game.ts`

**Add deployment phase tracking:**
```typescript
interface BreakthroughTechnology {
  // Existing fields...
  deploymentPhase: 'none' | 'planning' | 'construction' | 'scaleUp' | 'maturity';
  phaseStartMonth: number;  // Month when current phase started
  phaseProgress: number;    // 0-1 progress through current phase
  baseEffectiveness: number; // Intrinsic effectiveness (0-1) before phase scaling
  effectivenessMultiplier: number; // Phase-based multiplier (0-1)

  // Energy requirements
  energyRequiredTWh: number;  // Annual energy requirement at full deployment
  energyAllocatedTWh: number; // Actual energy allocated this step

  // Temperature sensitivity (optional, only for sink technologies)
  temperatureSensitivity?: {
    type: 'ocean' | 'land';  // Determines degradation coefficient
    degradationRate: number; // 0.044 for ocean, 0.198 for land
  };

  // Deployment parameters
  phaseDurations: {
    planning: number;      // Months in planning phase
    construction: number;  // Months in construction phase
    scaleUp: number;       // Months in scale-up phase
    maturity: number;      // Months to full maturity
  };
}
```

### 1.2 Energy System Extensions

**Location:** `src/types/game.ts` - Add to energySystem interface

**Add renewable surplus tracking:**
```typescript
interface EnergySystem {
  // Existing fields...

  // Renewable surplus tracking
  renewableSurplus: number;  // TWh/year available after baseline demand
  renewableGeneration: number; // Total TWh/year from renewables
  baselineDemand: number;     // TWh/year for existing infrastructure

  // Partitioning (allocated from renewable surplus)
  partitioning: {
    adaptationTWh: number;           // Highest priority
    industryElectrificationTWh: number; // Medium priority
    climateMinatigationTWh: number;     // DAC, CCUS, etc.
    syntheticFuelsTWh: number;          // Lowest priority
  };

  // Temperature feedback
  adaptationBaselineTWh: number;  // Baseline adaptation energy (pre-warming)
  adaptationMultiplier: number;   // (1 + 0.10 × ΔT) - scales with warming
}
```

### 1.3 Climate Boundary Extensions

**Location:** `src/types/game.ts` - Add to climateBoundary interface

**Track temperature deltas for feedback:**
```typescript
interface ClimateBoundary {
  // Existing fields...

  // Temperature tracking
  temperatureDeltaC: number;  // Change from pre-industrial (°C)

  // Sink degradation tracking
  oceanSinkEffectiveness: number;  // 1.0 at 0°C, degrades 4.4%/°C
  landSinkEffectiveness: number;   // 1.0 at 0°C, degrades 19.8%/°C
}
```

## 2. Deployment Phase Logic

### 2.1 Phase Transition System

**Location:** Create `src/simulation/phases/technologyDeploymentPhase.ts`

**Phase transition logic:**
```typescript
export function updateTechnologyDeployment(
  state: GameState,
  rng: () => number
): void {
  state.breakthroughTechnologies.forEach(tech => {
    if (!tech.researched || tech.deploymentPhase === 'none') {
      return;
    }

    // Update phase progress
    tech.phaseProgress += 1 / tech.phaseDurations[tech.deploymentPhase];

    // Check for phase transitions
    if (tech.phaseProgress >= 1.0) {
      transitionToNextPhase(tech, state);
    }

    // Update effectiveness multiplier based on phase
    tech.effectivenessMultiplier = calculatePhaseEffectiveness(tech);

    // Apply temperature degradation if applicable
    if (tech.temperatureSensitivity) {
      applyTemperatureDegradation(tech, state.climateBoundary.temperatureDeltaC);
    }

    // Apply energy constraints
    applyEnergyConstraints(tech, state.energySystem);

    // Final effectiveness calculation
    tech.effectiveness = tech.baseEffectiveness
      × tech.effectivenessMultiplier
      × tech.energyMultiplier
      × tech.temperatureMultiplier;
  });
}
```

### 2.2 Phase Effectiveness Scaling

**Effectiveness curves by phase:**
```typescript
function calculatePhaseEffectiveness(tech: BreakthroughTechnology): number {
  const { deploymentPhase, phaseProgress } = tech;

  switch (deploymentPhase) {
    case 'planning':
      return 0;  // No effectiveness during planning

    case 'construction':
      // Linear 0% → 30% over construction phase
      return 0.30 * phaseProgress;

    case 'scaleUp':
      // Linear 30% → 80% over scale-up phase
      return 0.30 + (0.50 * phaseProgress);

    case 'maturity':
      // Linear 80% → 100% over maturity phase
      return 0.80 + (0.20 * phaseProgress);

    default:
      return 0;
  }
}
```

**Note:** These are stylized effectiveness curves. Real curves may vary by technology type. Mark as "simplified model - actual curves technology-specific" in documentation.

### 2.3 Phase Transition Logic

```typescript
function transitionToNextPhase(
  tech: BreakthroughTechnology,
  state: GameState
): void {
  tech.phaseProgress = 0;

  switch (tech.deploymentPhase) {
    case 'planning':
      tech.deploymentPhase = 'construction';
      logEvent(state, `🏗️ ${tech.name}: Construction phase started`);
      break;

    case 'construction':
      tech.deploymentPhase = 'scaleUp';
      logEvent(state, `📈 ${tech.name}: Scale-up phase started`);
      break;

    case 'scaleUp':
      tech.deploymentPhase = 'maturity';
      logEvent(state, `✅ ${tech.name}: Maturity phase started`);
      break;

    case 'maturity':
      // Remain in maturity (100% effectiveness)
      tech.phaseProgress = 1.0;
      break;
  }
}
```

## 3. Energy Budget System

### 3.1 Renewable Surplus Calculation

**Location:** Create `src/simulation/phases/energyPartitioningPhase.ts`

```typescript
export function calculateRenewableSurplus(state: GameState): void {
  const { energySystem } = state;

  // Calculate renewable generation (existing renewable capacity)
  energySystem.renewableGeneration = calculateRenewableGeneration(state);

  // Baseline demand grows with population and development
  energySystem.baselineDemand = calculateBaselineDemand(state);

  // Surplus is what's left for new applications
  energySystem.renewableSurplus = Math.max(
    0,
    energySystem.renewableGeneration - energySystem.baselineDemand
  );
}
```

### 3.2 Energy Partitioning Logic

**Priority-based allocation:**
```typescript
export function partitionRenewableSurplus(state: GameState): void {
  const { energySystem, climateBoundary } = state;
  let remainingSurplus = energySystem.renewableSurplus;

  // Priority 1: Adaptation (survival-critical, scales with warming)
  const adaptationDemand = energySystem.adaptationBaselineTWh
    × (1 + 0.10 × climateBoundary.temperatureDeltaC);  // MODEL ASSUMPTION

  energySystem.partitioning.adaptationTWh = Math.min(
    adaptationDemand,
    remainingSurplus
  );
  remainingSurplus -= energySystem.partitioning.adaptationTWh;

  // Priority 2: Industry electrification (decarbonization)
  const industryDemand = calculateIndustryElectrificationDemand(state);
  energySystem.partitioning.industryElectrificationTWh = Math.min(
    industryDemand,
    remainingSurplus
  );
  remainingSurplus -= energySystem.partitioning.industryElectrificationTWh;

  // Priority 3: Climate mitigation (DAC, CCUS, blue carbon)
  const mitigationDemand = calculateMitigationDemand(state);
  energySystem.partitioning.climateMinatigationTWh = Math.min(
    mitigationDemand,
    remainingSurplus
  );
  remainingSurplus -= energySystem.partitioning.climateMinatigationTWh;

  // Priority 4: Synthetic fuels (lowest priority, energy-intensive)
  const syntheticDemand = calculateSyntheticFuelDemand(state);
  energySystem.partitioning.syntheticFuelsTWh = Math.min(
    syntheticDemand,
    remainingSurplus
  );
}
```

**Caveat:** Energy partitioning priorities are policy-dependent. This model assumes rational climate policy (adaptation > mitigation > synthetic fuels). Different governments may prioritize differently. Consider adding scenario parameter for priority ordering.

### 3.3 Technology Energy Allocation

**Allocate mitigation energy to specific technologies:**
```typescript
function allocateMitigationEnergy(state: GameState): void {
  const availableEnergy = state.energySystem.partitioning.climateMinatigationTWh;

  // Collect all energy-demanding climate techs
  const energyDemandingTechs = state.breakthroughTechnologies.filter(
    tech => tech.researched
      && tech.deploymentPhase !== 'none'
      && tech.energyRequiredTWh > 0
  );

  // Total demand
  const totalDemand = energyDemandingTechs.reduce(
    (sum, tech) => sum + tech.energyRequiredTWh,
    0
  );

  // Allocate proportionally (or use priority system if needed)
  energyDemandingTechs.forEach(tech => {
    if (totalDemand > 0) {
      const allocation = availableEnergy × (tech.energyRequiredTWh / totalDemand);
      tech.energyAllocatedTWh = allocation;

      // Energy constraint multiplier
      tech.energyMultiplier = Math.min(
        1.0,
        allocation / tech.energyRequiredTWh
      );
    } else {
      tech.energyAllocatedTWh = 0;
      tech.energyMultiplier = 0;
    }
  });
}
```

**Note:** Linear energy scaling (50% energy = 50% effectiveness) is a simplification. Future enhancement: add threshold effects or diminishing returns based on technology type.

## 4. Temperature Feedback Loops

### 4.1 Carbon Sink Degradation

**Location:** `src/simulation/phases/climateFeedbackPhase.ts`

```typescript
export function updateCarbonSinkEffectiveness(state: GameState): void {
  const deltaT = state.climateBoundary.temperatureDeltaC;

  // Ocean sink degradation: 4.4% per °C
  state.climateBoundary.oceanSinkEffectiveness = Math.max(
    0,
    1.0 - (0.044 × deltaT)
  );

  // Land sink degradation: 19.8% per °C
  state.climateBoundary.landSinkEffectiveness = Math.max(
    0,
    1.0 - (0.198 × deltaT)
  );

  // Log significant degradation
  if (state.climateBoundary.oceanSinkEffectiveness < 0.8) {
    logEvent(state, `🌊⚠️ Ocean carbon sinks degraded to ${(state.climateBoundary.oceanSinkEffectiveness × 100).toFixed(1)}%`);
  }
  if (state.climateBoundary.landSinkEffectiveness < 0.6) {
    logEvent(state, `🌳⚠️ Land carbon sinks degraded to ${(state.climateBoundary.landSinkEffectiveness × 100).toFixed(1)}%`);
  }
}
```

### 4.2 Technology Temperature Degradation

```typescript
function applyTemperatureDegradation(
  tech: BreakthroughTechnology,
  deltaT: number
): void {
  if (!tech.temperatureSensitivity) {
    tech.temperatureMultiplier = 1.0;
    return;
  }

  const { type, degradationRate } = tech.temperatureSensitivity;

  // Apply appropriate degradation rate
  tech.temperatureMultiplier = Math.max(
    0,
    1.0 - (degradationRate × deltaT)
  );

  // Log severe degradation
  if (tech.temperatureMultiplier < 0.5) {
    logEvent(
      state,
      `🌡️❌ ${tech.name} severely degraded by warming (${(tech.temperatureMultiplier × 100).toFixed(1)}% effectiveness)`
    );
  }
}
```

**Note:** Linear degradation is an approximation. Consider adding tipping points (Amazon → savanna at 2-3°C, permafrost at 1.5-2°C) in future enhancement.

### 4.3 Adaptation Energy Feedback

```typescript
export function updateAdaptationDemand(state: GameState): void {
  const { energySystem, climateBoundary } = state;
  const deltaT = climateBoundary.temperatureDeltaC;

  // MODEL ASSUMPTION: +10% energy per °C for adaptation
  energySystem.adaptationMultiplier = 1.0 + (0.10 × deltaT);

  const newDemand = energySystem.adaptationBaselineTWh × energySystem.adaptationMultiplier;

  // Log significant increases
  if (energySystem.adaptationMultiplier > 1.3) {
    logEvent(
      state,
      `⚡⚠️ Adaptation energy demand increased ${((energySystem.adaptationMultiplier - 1) × 100).toFixed(1)}% due to warming`
    );
  }
}
```

**Caveat:** +10% per °C is a MODEL ASSUMPTION without peer-reviewed support. Real adaptation costs vary by region/climate. Consider making this a configurable parameter or conducting sensitivity analysis.

## 5. New Breakthrough Technologies

### 5.1 Technology Definitions

**Add to `src/data/breakthroughTechnologies.ts`:**

```typescript
// TIER 0: Institutional Automation
{
  id: 'institutional_automation',
  name: 'Institutional Automation (Permitting AI)',
  tier: 0,
  baseEffectiveness: 0.6,  // Reduces permitting from 4.5yr → 0.5-1.5yr (4-9× speedup)
  deploymentPhase: 'none',
  phaseStartMonth: 0,
  phaseProgress: 0,
  effectivenessMultiplier: 0,
  energyRequiredTWh: 0.01,  // Minimal (computational only)
  energyAllocatedTWh: 0,
  phaseDurations: {
    planning: 36,      // 3 years regulatory acceptance
    construction: 48,  // 4 years agency adoption
    scaleUp: 0,        // No scale-up (policy change)
    maturity: 0
  },
  category: 'governance',
  description: 'AI-driven NEPA reviews, environmental permitting automation',
  unlockConditions: { aiCapabilities: { governance: 0.5 } }
},

// TIER 1: Modular DAC Units
{
  id: 'modular_dac',
  name: 'Modular DAC Units',
  tier: 1,
  baseEffectiveness: 0.8,  // High effectiveness IF energy available
  deploymentPhase: 'none',
  energyRequiredTWh: 500,  // 2.5 Gt CO₂ × 200 kWh/t = 500 TWh/year at full scale
  phaseDurations: {
    planning: 60,       // 5 years R&D
    construction: 60,   // 5 years factory buildout
    scaleUp: 60,        // 5 years supply chain
    maturity: 0
  },
  temperatureSensitivity: undefined,  // Not temperature-sensitive (engineered system)
  category: 'climate',
  description: 'Factory-produced DAC modules (SpaceX Starship model)',
  unlockConditions: { aiCapabilities: { manufacturing: 0.6 } }
},

// TIER 1: Automated Construction Systems
{
  id: 'automated_construction',
  name: 'Automated Construction Systems',
  tier: 1,
  baseEffectiveness: 0.5,  // SPECULATIVE: 1.5-2× speedup (conservative)
  deploymentPhase: 'none',
  energyRequiredTWh: 10,   // Construction equipment energy
  phaseDurations: {
    planning: 36,       // 3 years pilot deployments
    construction: 48,   // 4 years industry adoption
    scaleUp: 36,        // 3 years full deployment
    maturity: 0
  },
  category: 'infrastructure',
  description: 'AI-driven robotic construction for climate infrastructure',
  unlockConditions: { aiCapabilities: { robotics: 0.6 } }
},

// TIER 1: Advanced Solar (Perovskite)
{
  id: 'perovskite_solar',
  name: 'Perovskite Solar Cells',
  tier: 1,
  baseEffectiveness: 0.7,  // 40-50% efficiency vs. 20% silicon
  deploymentPhase: 'none',
  energyRequiredTWh: -100,  // Negative (generates energy, not consumes)
  phaseDurations: {
    planning: 0,         // Already in production (GW factory 2025)
    construction: 60,    // 5 years mass production
    scaleUp: 60,         // 5 years supply chain
    maturity: 60         // 5 years full maturity
  },
  category: 'energy',
  description: 'Perovskite-silicon tandem cells (34-50% efficiency)',
  unlockConditions: { aiCapabilities: { materials: 0.4 } }
},

// TIER 1: Soil Carbon Injection (Biochar)
{
  id: 'biochar',
  name: 'Soil Carbon Injection (Biochar)',
  tier: 1,
  baseEffectiveness: 0.6,
  deploymentPhase: 'none',
  energyRequiredTWh: 50,   // Pyrolysis energy (partially offset by syngas)
  phaseDurations: {
    planning: 0,         // Small-scale deployments already exist
    construction: 120,   // 10 years industrialization
    scaleUp: 120,        // 10 years agricultural adoption
    maturity: 0
  },
  temperatureSensitivity: {
    type: 'land',
    degradationRate: 0.198  // Land sink degradation
  },
  category: 'climate',
  description: 'Pyrolysis of biomass → stable biochar injection',
  unlockConditions: { aiCapabilities: { agriculture: 0.5 } }
},

// TIER 2: Early Fusion Deployment
{
  id: 'fusion_pilots',
  name: 'Fusion Pilot Plants',
  tier: 2,
  baseEffectiveness: 0.4,  // Pilot plants, not mass deployment
  deploymentPhase: 'none',
  energyRequiredTWh: -500,  // Negative (generates unlimited clean baseload)
  phaseDurations: {
    planning: 120,       // 10 years to first plasma (2025 → 2035)
    construction: 60,    // 5 years pilot operations (2035 → 2040)
    scaleUp: 120,        // 10 years commercial scale (2040 → 2050)
    maturity: 120        // 10 years mass deployment (2050 → 2060)
  },
  category: 'energy',
  description: 'Private fusion pilots (2035-2040), mass deployment 2050+',
  unlockConditions: { aiCapabilities: { research: 0.7 } }
},

// TIER 2: Coastal Blue Carbon
{
  id: 'blue_carbon',
  name: 'Coastal Blue Carbon Restoration',
  tier: 2,
  baseEffectiveness: 0.2,  // Partial deployment already ongoing
  deploymentPhase: 'construction',  // Start partially deployed
  phaseProgress: 0.2,
  energyRequiredTWh: 5,     // Low energy (restoration labor)
  phaseDurations: {
    planning: 0,         // Already started
    construction: 120,   // 10 years coordinated programs
    scaleUp: 120,        // 10 years ecosystem establishment
    maturity: 120        // 10 years full maturity
  },
  temperatureSensitivity: {
    type: 'ocean',
    degradationRate: 0.044  // Ocean sink degradation
  },
  category: 'climate',
  description: 'Mangrove/seagrass/salt marsh restoration',
  unlockConditions: { cooperation: 0.6 }
},

// TIER 2: Carbon-Negative Materials
{
  id: 'carbon_negative_materials',
  name: 'Carbon-Negative Building Materials',
  tier: 2,
  baseEffectiveness: 0.5,
  deploymentPhase: 'none',
  energyRequiredTWh: -20,   // Negative (replaces energy-intensive cement/steel)
  phaseDurations: {
    planning: 60,        // 5 years R&D
    construction: 60,    // 5 years pilot deployments
    scaleUp: 120,        // 10 years supply chains
    maturity: 0
  },
  category: 'climate',
  description: 'Bio-concrete, hempcrete, carbon fiber composites',
  unlockConditions: { aiCapabilities: { materials: 0.6 } }
},

// TIER 3: Ocean Iron Fertilization (CONDITIONAL)
{
  id: 'ocean_iron_fertilization',
  name: 'Ocean Iron Fertilization',
  tier: 3,
  baseEffectiveness: 0.4,  // High uncertainty
  deploymentPhase: 'none',
  energyRequiredTWh: 10,
  phaseDurations: {
    planning: 60,        // 5 years regulatory approval + trials
    construction: 60,    // 5 years monitoring/verification
    scaleUp: 120,        // 10 years commercial scale (if MRV successful)
    maturity: 0
  },
  temperatureSensitivity: {
    type: 'ocean',
    degradationRate: 0.044
  },
  category: 'climate',
  description: 'CONDITIONAL: Requires legal framework changes (London Convention)',
  unlockConditions: {
    cooperation: 0.8,  // High international cooperation for legal changes
    aiCapabilities: { monitoring: 0.7 }  // MRV capability
  },
  conditional: true,  // Flag as conditional deployment
  conditionalReason: 'Legal/ecological barriers (London Convention)'
}
```

### 5.2 Technology Interactions

**Accelerator technologies (reduce phase durations):**

```typescript
function applyAcceleratorEffects(state: GameState): void {
  const institutionalAuto = state.breakthroughTechnologies.find(
    t => t.id === 'institutional_automation'
  );
  const automatedConstruction = state.breakthroughTechnologies.find(
    t => t.id === 'automated_construction'
  );

  if (institutionalAuto && institutionalAuto.deploymentPhase === 'maturity') {
    // Reduce planning phase for all technologies by 50-75%
    state.breakthroughTechnologies.forEach(tech => {
      if (tech.deploymentPhase === 'planning') {
        tech.phaseDurations.planning × (0.25 + 0.25 × (1 - institutionalAuto.effectiveness));
      }
    });
  }

  if (automatedConstruction && automatedConstruction.deploymentPhase === 'maturity') {
    // Reduce construction phase by 33-50% (1.5-2× speedup)
    state.breakthroughTechnologies.forEach(tech => {
      if (tech.deploymentPhase === 'construction') {
        tech.phaseDurations.construction × (0.50 + 0.17 × (1 - automatedConstruction.effectiveness));
      }
    });
  }
}
```

## 6. Integration Points

### 6.1 Phase Execution Order

**Update `src/simulation/engine/PhaseOrchestrator.ts`:**

```typescript
// New phases (insert in appropriate order):
// 1. Update renewable surplus (before partitioning)
calculateRenewableSurplus(state);

// 2. Update adaptation demand (temperature feedback)
updateAdaptationDemand(state);

// 3. Partition renewable energy
partitionRenewableSurplus(state);

// 4. Allocate mitigation energy to technologies
allocateMitigationEnergy(state);

// 5. Update carbon sink effectiveness (temperature feedback)
updateCarbonSinkEffectiveness(state);

// 6. Update technology deployment phases
updateTechnologyDeployment(state, rng);

// 7. Apply accelerator effects
applyAcceleratorEffects(state);
```

**Placement:** Insert after existing energy/climate phases, before end-of-step logging.

### 6.2 Initialization

**Update `src/simulation/utils/initialization.ts`:**

```typescript
function initializeEnergySystem(): EnergySystem {
  return {
    // Existing fields...

    // New renewable surplus fields
    renewableSurplus: 0,
    renewableGeneration: 25000,  // ~25,000 TWh global (2024 estimate)
    baselineDemand: 28000,       // ~28,000 TWh global electricity demand

    partitioning: {
      adaptationTWh: 0,
      industryElectrificationTWh: 0,
      climateMinatigationTWh: 0,
      syntheticFuelsTWh: 0
    },

    adaptationBaselineTWh: 100,  // Baseline adaptation energy
    adaptationMultiplier: 1.0
  };
}

function initializeClimateBoundary(): ClimateBoundary {
  return {
    // Existing fields...

    temperatureDeltaC: 1.2,  // Current warming vs. pre-industrial
    oceanSinkEffectiveness: 1.0 - (0.044 × 1.2),  // ~0.947
    landSinkEffectiveness: 1.0 - (0.198 × 1.2)    // ~0.762
  };
}
```

## 7. Testing Strategy

### 7.1 Unit Tests

**Test files to create:**
- `tests/technologyDeploymentPhase.test.ts`
- `tests/energyPartitioningPhase.test.ts`
- `tests/climateFeedbackPhase.test.ts`

**Key test cases:**
```typescript
describe('Technology Deployment Phase', () => {
  it('should transition planning → construction → scaleUp → maturity', () => {
    // Test phase transitions
  });

  it('should calculate correct effectiveness multipliers by phase', () => {
    // Test 0% → 30% → 80% → 100% scaling
  });

  it('should apply temperature degradation to ocean/land techs separately', () => {
    // Test 4.4% vs. 19.8% degradation rates
  });

  it('should constrain effectiveness by available energy', () => {
    // Test energy multiplier (50% energy = 50% effectiveness)
  });
});

describe('Energy Partitioning', () => {
  it('should prioritize adaptation > industry > mitigation > synthetic fuels', () => {
    // Test priority allocation
  });

  it('should scale adaptation energy with temperature', () => {
    // Test +10% per °C scaling
  });

  it('should handle negative energy (energy-generating techs)', () => {
    // Test perovskite solar, fusion adding to renewable surplus
  });
});

describe('Climate Feedback', () => {
  it('should degrade ocean sinks at 4.4%/°C', () => {
    // Test ocean sink degradation
  });

  it('should degrade land sinks at 19.8%/°C', () => {
    // Test land sink degradation (faster)
  });

  it('should handle tipping points gracefully', () => {
    // Test effectiveness → 0 at extreme warming
  });
});
```

### 7.2 Integration Tests

**Test full workflow:**
```typescript
describe('Climate Phased Deployment Integration', () => {
  it('should reach 30-50% effectiveness in typical scenarios', () => {
    // Run 50-step simulation, measure climate tech effectiveness
  });

  it('should reach 80%+ effectiveness in god mode scenarios', () => {
    // Deploy all techs, unlimited energy, measure effectiveness
  });

  it('should handle energy constraints realistically', () => {
    // Limited renewable surplus, verify partitioning priorities
  });

  it('should apply temperature feedback correctly', () => {
    // Warming → reduced sink effectiveness + increased adaptation demand
  });
});
```

### 7.3 Monte Carlo Validation

**Run N≥10 scenarios:**
```bash
npx tsx scripts/monteCarloSimulation.ts \
  --scenarios 10 \
  --seed-start 1000 \
  --config god-mode \
  > logs/mc_climate_deployment_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

**Validation criteria:**
- Climate tech effectiveness: 30-50% (typical), 80%+ (god mode)
- Coefficient of variation (CV): <5% (deterministic within tolerance)
- Energy partitioning: Adaptation gets priority in constrained scenarios
- Temperature feedback: Sink degradation observable at ΔT > 2°C

## 8. Documentation Updates

### 8.1 Wiki Updates

**Sections to add/update in `docs/wiki/README.md`:**
- Climate Technology Deployment Phases (new section)
- Energy Budget System (new section)
- Temperature Feedback Loops (expand existing section)
- Breakthrough Technologies (add 9 new techs)

### 8.2 DevLog Entry

**Create `devlogs/climate_phased_deployment_YYYYMMDD.md`:**
- Implementation narrative
- Design decisions (why 4 phases? why these coefficients?)
- Challenges encountered (integration with existing energy system)
- Monte Carlo results

## 9. Success Criteria

**Feature is complete when:**
- ✅ All 9 new technologies added with correct parameters
- ✅ Deployment phase system functional (planning → construction → scaleUp → maturity)
- ✅ Energy partitioning prioritizes adaptation > industry > mitigation
- ✅ Temperature feedback loops operational (sink degradation + adaptation demand)
- ✅ Unit tests pass (phase transitions, energy constraints, temperature degradation)
- ✅ Integration tests pass (30-50% typical, 80%+ god mode)
- ✅ Monte Carlo N≥10 validates determinism (CV <5%)
- ✅ Architecture review passes (no CRITICAL/HIGH issues)
- ✅ Wiki documentation updated
- ✅ Plan archived to completed/

## 10. Implementation Timeline

**Estimated effort:** 6-8 hours (complex, multi-system integration)

**Phase breakdown:**
1. **State extensions (1h):** Add deployment tracking, energy partitioning, temperature fields
2. **Deployment phase logic (2h):** Phase transitions, effectiveness scaling, accelerators
3. **Energy budget system (2h):** Renewable surplus, partitioning, allocation
4. **Temperature feedback (1h):** Sink degradation, adaptation scaling
5. **New technologies (1h):** Add 9 techs with correct parameters
6. **Testing (2-3h):** Unit tests, integration tests, Monte Carlo validation

**Total:** 9-11 hours (conservative estimate)

## 11. Known Limitations and Future Enhancements

### 11.1 Current Simplifications

**Acknowledged in this version:**
- Linear effectiveness scaling (real curves may have thresholds/diminishing returns)
- Linear energy constraints (50% energy = 50% effectiveness)
- Linear temperature degradation (may be non-linear, tipping points not modeled)
- Adaptation energy +10%/°C is MODEL ASSUMPTION (not peer-reviewed)
- Automated construction 1.5-2× speedup is SPECULATIVE (pending validation)
- Energy partitioning priorities are policy-dependent (assumes rational climate policy)

### 11.2 Future Enhancements

**For later versions:**
- Non-linear effectiveness curves (S-curves, threshold effects)
- Tipping points (Amazon → savanna at 2-3°C, permafrost at 1.5-2°C)
- Renewable efficiency degradation (solar panels in extreme heat)
- Infrastructure damage/repair costs (storms/floods damage climate tech)
- Regional variation (adaptation costs vary by climate/geography)
- Technology retirement (phase out ineffective approaches)
- Multiple energy partitioning scenarios (different government priorities)

## 12. Risks and Mitigations

**Risk 1: Integration complexity**
- Multiple systems (energy, climate, technology) interact
- **Mitigation:** Phased implementation, extensive testing, clear logging

**Risk 2: Performance impact**
- 9 new technologies + 4-phase system = O(n) calculations per step
- **Mitigation:** Profile critical paths, optimize if needed

**Risk 3: Parameter uncertainty**
- Some coefficients (adaptation energy, construction speedup) lack peer review
- **Mitigation:** Mark as MODEL ASSUMPTIONS, conduct sensitivity analysis

**Risk 4: Unexpected interactions**
- Feedback loops (energy ↔ temperature ↔ sink effectiveness) may produce emergent behavior
- **Mitigation:** Monte Carlo validation, compare to empirical trends

## 13. Next Steps

**Upon plan approval:**
1. Spawn `simulation-maintainer` agent with this plan
2. Implement in phases (state → deployment → energy → temperature → testing)
3. Run Monte Carlo N≥10 for validation
4. Spawn `architecture-skeptic` for Quality Gate 2
5. Address architectural issues (CRITICAL/HIGH must fix)
6. Spawn `wiki-documentation-updater`
7. Archive plan to `completed/`

---

**End of Implementation Plan**

**Status:** READY FOR IMPLEMENTATION (research revised, critique addressed)
**Next Phase:** Implementation (spawn simulation-maintainer)
**Quality Gate 2:** Architecture review (post-implementation, mandatory)
