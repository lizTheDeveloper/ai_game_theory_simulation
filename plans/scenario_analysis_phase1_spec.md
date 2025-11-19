# Scenario Analysis Framework - Phase 1 Specification

**Date:** November 10, 2025
**Coordinated by:** Orchestrator
**Context:** God mode analysis revealed all 73 technologies still result in catastrophic failure
**Hypothesis:** Technology alone doesn't trigger spirals - specific governance/social/political conditions required

---

## Phase 1.1: Enhanced Spiral Activation Diagnostics

**Objective:** Understand WHY god mode failed by logging detailed spiral activation conditions

**Owner:** simulation-maintainer + priya

### Current State Analysis

**Existing spiral systems:**
1. **Upward Spirals** (`src/simulation/upwardSpirals.ts`)
   - 6 spirals: abundance, cognitive, democratic, scientific, meaning, ecological
   - Already has basic logging every 12 months (line 96-98)
   - Need: WHY each spiral is inactive (which threshold failed)

2. **Cooperative Spirals** (`src/simulation/cooperativeSpirals.ts`)
   - Alignment success → trust cascade
   - Has logging when cascades trigger (line 118-122)
   - Need: Track alignment milestones and collective action potential

3. **Positive Tipping Points** (`src/simulation/positiveTippingPoints.ts`)
   - 5 technology adoption S-curves (solar, EV, wind, heat pumps, batteries)
   - Cascade triggers when market share crosses 5-20% thresholds
   - Need: Track adoption rates, cost reductions, cascade status

### Implementation Tasks

#### Task 1: Enhanced Upward Spiral Diagnostics
**File:** `src/simulation/upwardSpirals.ts`

**Add diagnostic logging function:**
```typescript
function logSpiralActivationDiagnostics(state: GameState, currentMonth: number): void {
  const spirals = state.upwardSpirals;

  console.log(`\n=== SPIRAL ACTIVATION DIAGNOSTICS (Month ${currentMonth}) ===`);

  // For each spiral, log:
  // 1. Active/inactive status
  // 2. Strength (if active)
  // 3. Months active (if active)
  // 4. WHY inactive (which thresholds failed)

  // Example for abundance spiral:
  const qol = state.qualityOfLifeSystems;
  const materialAbundant = qol.materialAbundance > 1.5;
  const energyAbundant = qol.energyAvailability > 1.5;
  const timeLiberated = state.society.unemploymentLevel > 0.6 &&
                       state.globalMetrics.economicTransitionStage >= 3;

  console.log(`\n  🌟 Abundance Spiral: ${spirals.abundance.active ? '✅ ACTIVE' : '❌ INACTIVE'}`);
  if (spirals.abundance.active) {
    console.log(`     Strength: ${spirals.abundance.strength.toFixed(2)}`);
    console.log(`     Months active: ${spirals.abundance.monthsActive}`);
  } else {
    console.log(`     Material abundant (>1.5): ${materialAbundant ? '✅' : '❌'} (${qol.materialAbundance.toFixed(2)})`);
    console.log(`     Energy abundant (>1.5): ${energyAbundant ? '✅' : '❌'} (${qol.energyAvailability.toFixed(2)})`);
    console.log(`     Time liberated (unemp >0.6 + stage >=3): ${timeLiberated ? '✅' : '❌'} (${state.society.unemploymentLevel.toFixed(2)}, stage ${state.globalMetrics.economicTransitionStage})`);
  }

  // Repeat for all 6 spirals
  // ...

  // Log cascade state
  console.log(`\n  🌊 Virtuous Cascade: ${spirals.cascadeActive ? '✅ ACTIVE' : '❌ INACTIVE'}`);
  if (spirals.cascadeActive) {
    console.log(`     Cascade strength: ${spirals.cascadeStrength.toFixed(2)}x`);
    console.log(`     Cascade months: ${spirals.cascadeMonths}`);
  } else {
    const activeCount = [
      spirals.abundance, spirals.cognitive, spirals.democratic,
      spirals.scientific, spirals.meaning, spirals.ecological
    ].filter(s => s.active).length;
    console.log(`     Active spirals: ${activeCount}/6 (need 4+ for cascade)`);
  }
}
```

**Call from god mode test:**
- Add logging every 12 months during simulation
- Add summary at end showing spiral activation history

#### Task 2: Cooperative Spiral Diagnostics
**File:** `src/simulation/cooperativeSpirals.ts`

**Add diagnostic function:**
```typescript
export function logCooperativeSpiralDiagnostics(state: GameState): void {
  console.log(`\n=== COOPERATIVE SPIRAL DIAGNOSTICS ===`);

  // Check alignment milestones
  const milestones = {
    noMisalignedDeployments: /* ... existing logic ... */,
    transparencySuccess: /* ... */,
    alignmentGap: /* ... */,
    crisisAvoided: /* ... */
  };

  console.log(`\n  📊 Alignment Milestones:`);
  console.log(`     No misaligned deployments: ${milestones.noMisalignedDeployments ? '✅' : '❌'}`);
  console.log(`     Transparency success: ${milestones.transparencySuccess ? '✅' : '❌'}`);
  console.log(`     Low alignment gap: ${milestones.alignmentGap ? '✅' : '❌'}`);
  console.log(`     Crisis avoided: ${milestones.crisisAvoided ? '✅' : '❌'}`);

  const milestonesAchieved = Object.values(milestones).filter(Boolean).length;
  console.log(`     Total: ${milestonesAchieved}/4 (need 2+ for trust cascade)`);

  // Check collective action potential
  const potential = calculateCollectiveActionPotential(state);
  console.log(`\n  🤝 Collective Action Potential: ${potential.toFixed(2)}`);
  console.log(`     Trust: ${(state.society.collectiveActionWillingness || 0.5).toFixed(2)} (40% weight)`);
  console.log(`     Institutions: ${state.government.governanceQuality.institutionalCapacity.toFixed(2)} (35% weight)`);
  console.log(`     Monitoring: ${state.government.governanceQuality.transparency.toFixed(2)} (25% weight)`);
  console.log(`     Threshold for high effectiveness: >0.6`);

  // Check cascade history
  const cascades = state.history.cooperativeSpirals || [];
  console.log(`\n  📜 Trust Cascades Triggered: ${cascades.length}`);
  cascades.forEach(c => {
    console.log(`     Month ${c.month}: ${c.type} (+${(c.trustBoost * 100).toFixed(0)}% trust)`);
  });
}
```

#### Task 3: Positive Tipping Point Diagnostics
**File:** `src/simulation/positiveTippingPoints.ts`

**Add diagnostic function:**
```typescript
export function logPositiveTippingPointDiagnostics(state: GameState): void {
  const ptp = state.positiveTippingPoints;

  console.log(`\n=== POSITIVE TIPPING POINT DIAGNOSTICS ===`);

  // For each technology
  const techs = [
    'solarPV', 'electricVehicles', 'windPower', 'heatPumps', 'batteryStorage'
  ] as const;

  techs.forEach(tech => {
    const adoption = ptp.adoptionTracking[tech];
    console.log(`\n  ⚡ ${tech}:`);
    console.log(`     Market share: ${(adoption.marketShare * 100).toFixed(2)}%`);
    console.log(`     Adoption rate: ${(adoption.adoptionRate * 100).toFixed(2)}% per month`);
    console.log(`     Cost vs conventional: ${(adoption.costPerUnit / adoption.conventionalCost).toFixed(2)}x`);
    console.log(`     Price parity: ${adoption.priceParityAchieved ? '✅' : '❌'}`);
    console.log(`     Cascade active: ${adoption.cascadeActive ? '✅' : '❌'}`);

    if (adoption.cascadeActive) {
      console.log(`     Cascade strength: ${adoption.cascadeStrength.toFixed(2)}x`);
    } else {
      const threshold = ptp.parameters.cascadeThresholdMin * 100;
      console.log(`     Threshold: ${threshold}% market share (not reached)`);
    }
  });

  console.log(`\n  🌊 Active Cascades: ${ptp.activeCascades}`);
  console.log(`  📈 Adoption Acceleration: ${ptp.adoptionAcceleration.toFixed(2)}x`);
}
```

#### Task 4: Integrate Diagnostics into God Mode Test
**File:** `scripts/godModeTest.ts`

**Add periodic logging during simulation:**
```typescript
// After line 84 (before engine.run):
// Wrap engine.run to add periodic diagnostic logging

// Store original state reference
const diagnosticInterval = 12; // Log every 12 months

// Run simulation with periodic diagnostics
let month = 0;
while (month < maxMonths) {
  // Run one step
  engine.step(state);
  month = state.currentMonth;

  // Log diagnostics every 12 months
  if (month % diagnosticInterval === 0 && month > 0) {
    console.log(`\n\n${'='.repeat(80)}`);
    console.log(`DIAGNOSTIC CHECKPOINT: Month ${month}`);
    console.log('='.repeat(80));

    // Import and call diagnostic functions
    logSpiralActivationDiagnostics(state, month);
    logCooperativeSpiralDiagnostics(state);
    logPositiveTippingPointDiagnostics(state);
  }

  // Check for early termination
  if (state.outcome) break;
}
```

**Add summary at end:**
```typescript
// After line 253 (after gap analysis):
console.log('\n' + '='.repeat(80));
console.log('🔍 SPIRAL ACTIVATION SUMMARY');
console.log('='.repeat(80));

// Summarize which spirals NEVER activated
const spiralNames = ['abundance', 'cognitive', 'democratic', 'scientific', 'meaning', 'ecological'];
spiralNames.forEach(name => {
  const spiral = result.finalState.upwardSpirals[name];
  if (spiral.monthsActive === 0) {
    console.log(`  ❌ ${name} spiral: NEVER activated`);
  } else {
    console.log(`  ✅ ${name} spiral: Active for ${spiral.monthsActive} months (last: month ${spiral.lastActivatedMonth})`);
  }
});

console.log(`\n  Virtuous cascade: ${result.finalState.upwardSpirals.cascadeActive ? 'ACTIVE' : 'NEVER ACTIVATED'}`);
console.log(`  Trust cascades: ${(result.finalState.history.cooperativeSpirals || []).length} triggered`);
console.log(`  Tech cascades: ${result.finalState.positiveTippingPoints.activeCascades} active`);
```

### Expected Outputs

**During simulation:**
- Diagnostic logs every 12 months showing:
  - Which spirals are active/inactive
  - WHY inactive spirals aren't activating (failed thresholds)
  - Collective action potential
  - Technology adoption rates and cascade status

**At end:**
- Summary showing which spirals never activated
- Identification of bottlenecks (e.g., "abundance spiral failed because time liberation never achieved")

### Success Criteria

1. God mode test produces detailed diagnostic logs
2. Logs clearly identify WHY spirals aren't activating
3. Logs reveal which thresholds are systematically failing
4. Summary identifies the critical bottleneck(s)

---

## Phase 1.2: Scenario Definition System

**Objective:** Create infrastructure to test governance scenarios systematically

**Owner:** simulation-maintainer

### Requirements

**1. Scenario Definition Interface**
```typescript
interface ScenarioDefinition {
  name: string;
  description: string;

  // Government priority overrides
  governmentPriorities?: {
    climateSpending?: number;      // 0-1
    redistributionLevel?: number;  // 0-1 (target Gini)
    alignmentResearch?: number;    // 0-1
    democraticParticipation?: number; // 0-1
    scientificResearch?: number;   // 0-1
  };

  // Starting condition modifications
  startingConditions?: {
    trustInAI?: number;           // 0-1
    institutionalTrust?: number;  // 0-1
    gini?: number;                // 0.2-0.6
    governanceQuality?: number;   // 0-1
  };

  // Technology deployment strategy
  techDeployment?: {
    strategy: 'immediate' | 'sequenced' | 'adaptive';
    priority?: 'energy' | 'carbon-removal' | 'dependency-ordered';
    techList?: string[];          // Specific tech IDs to deploy
    deploymentLevel?: number;     // 0-1
  };
}
```

**2. Scenario Application Function**
```typescript
function applyScenario(state: GameState, scenario: ScenarioDefinition): void {
  // Apply government priority overrides
  if (scenario.governmentPriorities) {
    // Override decision-making functions
    // E.g., force climate spending to specified level
  }

  // Apply starting condition modifications
  if (scenario.startingConditions) {
    if (scenario.startingConditions.trustInAI !== undefined) {
      // Set trust in AI
    }
    // ... other starting conditions
  }

  // Apply tech deployment strategy
  if (scenario.techDeployment) {
    if (scenario.techDeployment.strategy === 'immediate') {
      // Deploy all tech at month 0
    } else if (scenario.techDeployment.strategy === 'sequenced') {
      // Set up sequenced deployment
    }
  }
}
```

**3. Pre-defined Scenarios**
```typescript
const SCENARIOS = {
  // Government priority scenarios
  climateFirst: { ... },
  equalityFirst: { ... },
  aiAlignmentFirst: { ... },
  democraticParticipation: { ... },
  scientificAcceleration: { ... },
  authoritarianEfficiency: { ... },

  // Starting condition scenarios
  highTrustStart: { ... },
  lowInequalityStart: { ... },
  strongInstitutionsStart: { ... },

  // Tech deployment scenarios
  renewableEnergyFirst: { ... },
  carbonRemovalFirst: { ... },
  foundationsFirst: { ... },
  adaptiveDeployment: { ... },
};
```

**4. Scenario Runner Script**
```typescript
// scripts/scenarioTest.ts
// Run a single scenario (or god mode with diagnostics)
// Usage: npx tsx scripts/scenarioTest.ts [scenarioName] [seed] [maxMonths]
```

### Implementation Files

1. `src/simulation/scenarios/types.ts` - Interface definitions
2. `src/simulation/scenarios/definitions.ts` - Pre-defined scenarios
3. `src/simulation/scenarios/apply.ts` - Application logic
4. `scripts/scenarioTest.ts` - Test runner

### Success Criteria

1. Can define scenarios declaratively
2. Can override government priorities
3. Can modify starting conditions
4. Can specify tech deployment strategies
5. Scenario test script runs successfully

---

## Validation Plan

**Phase 1.1 Validation:**
1. Run god mode test with enhanced diagnostics
2. Verify logs show WHY spirals aren't activating
3. Identify critical bottleneck (hypothesis: time liberation, governance quality, or institutional capacity)

**Phase 1.2 Validation:**
1. Test each pre-defined scenario
2. Verify government priorities are being applied
3. Verify starting conditions are modified correctly
4. Verify tech deployment strategies work

**Coordination:**
- Simulation-maintainer: Implementation
- Priya: Analysis of diagnostic outputs, identification of patterns

---

## Research Standards Compliance

✅ **Builds on existing research:**
- God mode analysis (reviews/god_mode_gaps_research_roadmap_20251109.md)
- Skeptical analysis (research/SKEPTICAL_ANALYSIS_doom_predictions_20251110.md)
- Model mechanisms verification (research/GOD_MODE_ANALYSIS_model_mechanisms_20251110.md)

✅ **Defensive coding:**
- Use assertion utilities for all value access
- No silent fallbacks
- Fail loudly if state is invalid

✅ **Deterministic:**
- No changes to RNG usage
- Diagnostic logging only (no behavior changes)

✅ **Token efficient:**
- Focused implementation (diagnostic logging only)
- Clear, concise code
- No redundant explanations

---

**Next Steps After Phase 1:**
1. Analyze diagnostic outputs (priya)
2. Implement Phase 2 core scenarios
3. Run Monte Carlo N=10 for each scenario
4. Comparative analysis (Phase 4)
