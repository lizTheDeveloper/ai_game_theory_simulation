# CoordinatedDeploymentPhase Implementation Specification

**Date:** 2025-11-20
**Status:** READY FOR IMPLEMENTATION (Quality Gate 1 Passed - Grade A-)
**Implementer:** feature-implementer (Moss) or simulation-maintainer (Roy)
**Estimated Effort:** 4-6 hours

---

## Context

God mode testing shows 30% population mortality when deploying all technologies instantly. Research validation confirms this represents **absolute chaos scenario** (uncoordinated deployment, zero support systems). Historical analogues (Great Leap Forward, USSR collectivization, Post-Soviet shock therapy) show 3.5-12.8% mortality during rapid uncoordinated transitions.

**Solution:** Implement AI-coordinated technology deployment system that reduces mortality from 30% (chaos) to <5% (coordinated) through phased rollout, support systems, and regional capacity assessment.

**Research Grade:** A- (12+ peer-reviewed sources, 2015-2025)

---

## Implementation Tasks

### Task 1: CoordinatedDeploymentPhase (CRITICAL)

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/phases/coordinatedDeploymentPhase.ts`

**Purpose:** Manage AI-coordinated technology rollout with transition mortality mitigation

#### Phase Architecture

```typescript
import { PhaseFunction } from '../engine/PhaseOrchestrator';
import { assertFinite, assertInRange, assertProbability } from '../utils/assertions';
import type { GameState } from '@/types/game';

/**
 * CoordinatedDeploymentPhase - AI-managed technology rollout
 *
 * Models the difference between:
 * - Chaos mode: Instant tech deployment, no coordination → 30% mortality
 * - Coordinated mode: Phased rollout with support systems → <5% mortality
 *
 * Research foundation: Historical transition mortality analysis
 * - Great Leap Forward (chaos): 3.5-4.6% mortality over 4 years
 * - Green Revolution (coordinated): Mortality REDUCTION
 * - Post-Soviet shock therapy: 12.8% mortality increase
 *
 * Research file: research/transition_mortality_coordination_effectiveness_20251115.md
 * Validation: reviews/ai_coordination_validation_summary_20251120.md (Grade A-)
 */
export const coordinatedDeploymentPhase: PhaseFunction = (state, rng, context) => {
  // Only run if technologies are being deployed
  const deploying Technologies = state.technologies.some(t => t.active && t.monthsActive === 0);
  if (!deployingTechnologies) {
    return; // No new deployments this month
  }

  // 1. Assess regional capacity
  const regionalReadiness = assessRegionalCapacity(state);

  // 2. Calculate deployment rate based on AI coordination quality
  const deploymentRate = calculateDeploymentRate(state, regionalReadiness);

  // 3. Activate support systems if needed
  const supportQuality = activateSupportSystems(state, deploymentRate);

  // 4. Calculate transition mortality
  const mortalityRate = calculateTransitionMortality(
    deploymentRate,
    state.aiCoordination.coordinationCapacity,
    supportQuality,
    regionalReadiness
  );

  // 5. Apply mortality to population
  applyTransitionMortality(state, mortalityRate);

  // 6. Log coordination status
  logCoordinationStatus(state, deploymentRate, supportQuality, mortalityRate);
};

/**
 * Assess regional capacity to absorb technology deployment
 *
 * Research: Green Revolution showed 3x effectiveness in South Asia vs sub-Saharan Africa
 * due to infrastructure, governance, and economic capacity differences.
 */
function assessRegionalCapacity(state: GameState): number {
  // Infrastructure quality: Energy, transport, communication
  const infrastructure = (
    state.energySystem.renewablePercentage +
    (state.globalMetrics.infrastructure ?? 0.5)
  ) / 2;

  // Governance effectiveness: Coordination capability
  const governance = state.governanceQuality ?? 0.5;

  // Economic resilience: GDP per capita proxy
  const economicCapacity = Math.min(
    state.economicMetrics.gdpPerCapita / 50000, // $50k = 1.0
    1.0
  );

  // Composite readiness (geometric mean to penalize weak links)
  const readiness = Math.pow(
    infrastructure * governance * economicCapacity,
    1/3
  );

  return assertInRange(readiness, 0, 1, {
    location: 'assessRegionalCapacity',
    valueName: 'regional readiness',
    month: state.currentMonth
  });
}

/**
 * Calculate optimal deployment rate
 *
 * Research: Coordinated transitions use 5-15%/month deployment vs 100%/month instant chaos
 *
 * @returns deploymentRate in range [0.05, 1.0]
 *   - 1.0 = instant/chaos mode (god mode testing)
 *   - 0.05-0.15 = coordinated mode (phased rollout)
 */
function calculateDeploymentRate(
  state: GameState,
  regionalReadiness: number
): number {
  // Check if in god mode (instant deployment)
  if (state.godMode?.instantDeployment) {
    return 1.0; // Chaos mode
  }

  // AI coordination quality determines pacing
  const baseRate = 0.10; // 10%/month baseline coordinated deployment

  // Scale by AI coordination capacity
  const coordCapacity = state.aiCoordination?.coordinationCapacity ?? 0.5;
  const coordinatedRate = baseRate * (0.5 + coordCapacity * 0.5); // 5-15%/month range

  // Adjust for regional capacity (low capacity = slower deployment)
  const capacityAdjusted = coordinatedRate * (0.5 + regionalReadiness * 0.5);

  return assertInRange(capacityAdjusted, 0.05, 1.0, {
    location: 'calculateDeploymentRate',
    valueName: 'deployment rate',
    month: state.currentMonth
  });
}

/**
 * Activate transition support systems
 *
 * Research: Safety nets reduce transition mortality by 65-85%
 * - Food assistance: +1.2yr life expectancy
 * - Medicaid: Mortality reduction + $0.58-$2.00 ROI
 * - Social capital: High organization → reduced mortality
 */
function activateSupportSystems(
  state: GameState,
  deploymentRate: number
): number {
  // Support system quality components
  const components = {
    ubi: 0,
    healthcare: 0,
    foodSecurity: 0,
    retraining: 0
  };

  // Activate UBI if available and deployment rate high
  if (state.economicMetrics.hasUBI && deploymentRate > 0.15) {
    components.ubi = 0.3; // 30% of support quality from UBI
  }

  // Healthcare access (universal healthcare)
  if (state.healthcareSystem?.coverage > 0.8) {
    components.healthcare = 0.25; // 25% from healthcare
  }

  // Food security buffers
  const foodSecure = (state.foodProduction ?? 0) > (state.foodDemand ?? 0) * 1.2;
  if (foodSecure) {
    components.foodSecurity = 0.25; // 25% from food security
  }

  // Retraining programs (if education investment high)
  if ((state.educationSystem?.quality ?? 0) > 0.7) {
    components.retraining = 0.20; // 20% from retraining
  }

  // Composite support quality
  const supportQuality = Object.values(components).reduce((sum, val) => sum + val, 0);

  return assertInRange(supportQuality, 0, 1, {
    location: 'activateSupportSystems',
    valueName: 'support quality',
    month: state.currentMonth
  });
}

/**
 * Calculate transition mortality rate
 *
 * Research-backed mortality function:
 * - Chaos mode (deploymentRate=1.0, coord=0, support=0): ~30% mortality
 * - Coordinated (deploymentRate=0.10, coord=0.8, support=0.8): <5% mortality
 *
 * Sources:
 * - Great Leap Forward: 3.5-4.6% mortality (chaos)
 * - Green Revolution: NEGATIVE mortality (coordinated)
 * - Post-Soviet shock therapy: 12.8% mortality increase
 *
 * @returns mortalityRate as fraction of population (0-0.30)
 */
function calculateTransitionMortality(
  deploymentRate: number,
  coordinationCapacity: number,
  supportQuality: number,
  regionalReadiness: number
): number {
  // Base chaotic mortality (30% at instant deployment)
  const chaoticMortality = deploymentRate * 0.30;

  // Coordination mitigation (70-85% reduction)
  // Research: Coordinated transitions show 85-95% mortality reduction vs chaos
  const coordMitigation = coordinationCapacity * 0.75; // 75% reduction at full coordination

  // Support system mitigation (65-85% reduction)
  // Research: Safety nets reduce poverty gap 45%, food stamps +1.2yr life expectancy
  const supportMitigation = supportQuality * 0.75; // 75% reduction at full support

  // Regional capacity penalty (low capacity doubles mortality)
  // Research: Green Revolution 3x more effective in high-capacity regions
  const capacityPenalty = (1 - regionalReadiness) * 1.5; // Up to 2.5x penalty

  // Final transition mortality
  const mortality = chaoticMortality *
    (1 - coordMitigation) *
    (1 - supportMitigation) *
    (1 + capacityPenalty);

  // Validate: Mortality should be ≤30% (chaos upper bound)
  return assertInRange(mortality, 0, 0.30, {
    location: 'calculateTransitionMortality',
    valueName: 'transition mortality',
    month: state.currentMonth,
    additionalInfo: {
      deploymentRate,
      coordinationCapacity,
      supportQuality,
      regionalReadiness
    }
  });
}

/**
 * Apply transition mortality to population
 */
function applyTransitionMortality(state: GameState, mortalityRate: number): void {
  if (mortalityRate === 0) return;

  const currentPopulation = state.humanPopulationSystem.population;
  const deaths = currentPopulation * mortalityRate;

  // Update population
  state.humanPopulationSystem.population -= deaths;
  state.humanPopulationSystem.totalDeaths += deaths;

  // Track transition-specific deaths
  if (!state.transitionMetrics) {
    state.transitionMetrics = {
      totalTransitionDeaths: 0,
      monthlyTransitionDeaths: []
    };
  }
  state.transitionMetrics.totalTransitionDeaths += deaths;
  state.transitionMetrics.monthlyTransitionDeaths.push({
    month: state.currentMonth,
    deaths,
    mortalityRate
  });
}

/**
 * Log coordination status for debugging
 */
function logCoordinationStatus(
  state: GameState,
  deploymentRate: number,
  supportQuality: number,
  mortalityRate: number
): void {
  console.log(`\n🤝 COORDINATED DEPLOYMENT - Month ${state.currentMonth}`);
  console.log(`  Deployment Rate: ${(deploymentRate * 100).toFixed(1)}%/month`);
  console.log(`  Support Quality: ${(supportQuality * 100).toFixed(1)}%`);
  console.log(`  Coordination: ${(state.aiCoordination?.coordinationCapacity * 100 ?? 0).toFixed(1)}%`);
  console.log(`  Transition Mortality: ${(mortalityRate * 100).toFixed(2)}%`);

  if (mortalityRate > 0.05) {
    console.log(`  ⚠️ WARNING: High transition mortality (>${(0.05 * 100).toFixed(0)}%)`);
  }
}
```

---

### Task 2: Update GameState Interface

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/types/game.ts`

**Add to GameState interface:**

```typescript
// AI Coordination System
aiCoordination?: {
  coordinationCapacity: number;  // 0-1, quality of AI coordination
  deploymentPacing: boolean;     // Is coordinated deployment active?
  supportSystemsActive: boolean; // Are transition support systems deployed?
};

// Transition Metrics Tracking
transitionMetrics?: {
  totalTransitionDeaths: number;
  monthlyTransitionDeaths: Array<{
    month: number;
    deaths: number;
    mortalityRate: number;
  }>;
};

// God Mode Configuration (expand existing)
godMode?: {
  instantDeployment?: boolean;   // True = chaos mode (30% mortality)
  coordinatedDeployment?: boolean; // True = AI-managed (<5% mortality)
  // ... existing god mode properties
};
```

---

### Task 3: Initialize AI Coordination

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/initialization/initializeGame.ts`

**Add to initial state:**

```typescript
// AI Coordination System (after AI alignment achieved)
aiCoordination: {
  coordinationCapacity: 0.5, // Start at moderate coordination
  deploymentPacing: true,    // Enable coordinated deployment
  supportSystemsActive: false // Support systems activate as needed
},

// Transition Metrics
transitionMetrics: {
  totalTransitionDeaths: 0,
  monthlyTransitionDeaths: []
},
```

---

### Task 4: Integrate into PhaseOrchestrator

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/engine/PhaseOrchestrator.ts`

**Add phase to execution order** (after technology deployment, before population dynamics):

```typescript
import { coordinatedDeploymentPhase } from '../phases/coordinatedDeploymentPhase';

// In phase execution order (around line 50-100)
const phases = [
  // ... existing phases
  technologyDeploymentPhase,
  coordinatedDeploymentPhase, // NEW: Manage transition mortality
  populationDynamicsPhase,
  // ... remaining phases
];
```

---

### Task 5: God Mode Test Variants

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/scripts/godModeComparison.ts` (NEW)

**Create test comparing chaos vs coordinated modes:**

```typescript
/**
 * God Mode Comparison: Chaos vs Coordinated Deployment
 *
 * Tests the mortality difference between:
 * 1. Chaos mode: Instant tech deployment, no coordination (expected: ~30% mortality)
 * 2. Coordinated mode: AI-managed phased rollout (expected: <5% mortality)
 *
 * Research: reviews/ai_coordination_validation_summary_20251120.md
 */

import { initializeGame } from '../src/simulation/initialization/initializeGame';
import { runSimulation } from '../src/simulation/engine/simulationEngine';

async function runGodModeComparison() {
  const scenarios = [
    {
      name: 'Chaos Mode (Instant Deployment)',
      config: {
        godMode: {
          instantDeployment: true,
          coordinatedDeployment: false,
          deployAllTech: true
        },
        aiCoordination: {
          coordinationCapacity: 0,
          deploymentPacing: false,
          supportSystemsActive: false
        }
      },
      expectedMortality: 0.30 // 30%
    },
    {
      name: 'Coordinated Mode (AI-Managed)',
      config: {
        godMode: {
          instantDeployment: false,
          coordinatedDeployment: true,
          deployAllTech: true
        },
        aiCoordination: {
          coordinationCapacity: 0.8,
          deploymentPacing: true,
          supportSystemsActive: true
        }
      },
      expectedMortality: 0.05 // <5%
    },
    {
      name: 'Partial Coordination',
      config: {
        godMode: {
          instantDeployment: false,
          coordinatedDeployment: true,
          deployAllTech: true
        },
        aiCoordination: {
          coordinationCapacity: 0.5,
          deploymentPacing: true,
          supportSystemsActive: true
        }
      },
      expectedMortality: 0.12 // 10-15%
    }
  ];

  for (const scenario of scenarios) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 Testing: ${scenario.name}`);
    console.log(`${'='.repeat(60)}`);

    const state = initializeGame({
      seed: 12345,
      ...scenario.config
    });

    const startPop = state.humanPopulationSystem.population;

    // Run for 12 months
    for (let month = 0; month < 12; month++) {
      runSimulation(state);
    }

    const endPop = state.humanPopulationSystem.population;
    const actualMortality = (startPop - endPop) / startPop;
    const transitionDeaths = state.transitionMetrics?.totalTransitionDeaths ?? 0;

    console.log(`\n📊 Results:`);
    console.log(`  Start Population: ${(startPop / 1e9).toFixed(2)}B`);
    console.log(`  End Population: ${(endPop / 1e9).toFixed(2)}B`);
    console.log(`  Total Mortality: ${(actualMortality * 100).toFixed(2)}%`);
    console.log(`  Transition Deaths: ${(transitionDeaths / 1e9).toFixed(2)}B`);
    console.log(`  Expected Mortality: ${(scenario.expectedMortality * 100).toFixed(2)}%`);

    const withinRange = Math.abs(actualMortality - scenario.expectedMortality) < 0.05;
    console.log(`  ✅ Validation: ${withinRange ? 'PASS' : 'FAIL'}`);
  }
}

runGodModeComparison();
```

---

### Task 6: Unit Tests

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/tests/coordinatedDeployment.test.ts` (NEW)

```typescript
import { describe, it, expect } from 'vitest';
import { initializeGame } from '../src/simulation/initialization/initializeGame';
import { coordinatedDeploymentPhase } from '../src/simulation/phases/coordinatedDeploymentPhase';
import { createTestRNG } from './helpers/testRNG';

describe('CoordinatedDeploymentPhase', () => {
  it('should calculate zero mortality when no deployments active', () => {
    const state = initializeGame({ seed: 12345 });
    const rng = createTestRNG(12345);

    const startPop = state.humanPopulationSystem.population;
    coordinatedDeploymentPhase(state, rng, {});
    const endPop = state.humanPopulationSystem.population;

    expect(endPop).toBe(startPop); // No mortality if no deployments
  });

  it('should apply ~30% mortality in chaos mode (instant deployment)', () => {
    const state = initializeGame({
      seed: 12345,
      godMode: { instantDeployment: true, deployAllTech: true },
      aiCoordination: { coordinationCapacity: 0, deploymentPacing: false }
    });

    const rng = createTestRNG(12345);
    const startPop = state.humanPopulationSystem.population;

    coordinatedDeploymentPhase(state, rng, {});

    const mortality = (startPop - state.humanPopulationSystem.population) / startPop;
    expect(mortality).toBeGreaterThan(0.25); // >25%
    expect(mortality).toBeLessThan(0.35);    // <35%
  });

  it('should apply <5% mortality in coordinated mode', () => {
    const state = initializeGame({
      seed: 12345,
      godMode: { coordinatedDeployment: true, deployAllTech: true },
      aiCoordination: { coordinationCapacity: 0.8, deploymentPacing: true }
    });

    const rng = createTestRNG(12345);
    const startPop = state.humanPopulationSystem.population;

    coordinatedDeploymentPhase(state, rng, {});

    const mortality = (startPop - state.humanPopulationSystem.population) / startPop;
    expect(mortality).toBeLessThan(0.05); // <5%
  });

  it('should show mortality reduction with better support systems', () => {
    const rng = createTestRNG(12345);

    // Low support
    const state1 = initializeGame({
      seed: 12345,
      aiCoordination: { coordinationCapacity: 0.5, supportSystemsActive: false },
      economicMetrics: { hasUBI: false }
    });
    coordinatedDeploymentPhase(state1, rng, {});
    const mortality1 = state1.transitionMetrics?.totalTransitionDeaths ?? 0;

    // High support
    const state2 = initializeGame({
      seed: 12345,
      aiCoordination: { coordinationCapacity: 0.5, supportSystemsActive: true },
      economicMetrics: { hasUBI: true },
      healthcareSystem: { coverage: 0.9 }
    });
    coordinatedDeploymentPhase(state2, rng, {});
    const mortality2 = state2.transitionMetrics?.totalTransitionDeaths ?? 0;

    expect(mortality2).toBeLessThan(mortality1); // Better support → less mortality
  });
});
```

---

## Validation Criteria

### Unit Tests
- ✅ Zero mortality when no deployments
- ✅ ~30% mortality in chaos mode
- ✅ <5% mortality in coordinated mode
- ✅ Mortality inversely proportional to support quality

### God Mode Comparison
- ✅ Chaos mode: 25-35% mortality
- ✅ Coordinated mode: <5% mortality
- ✅ Partial coordination: 10-15% mortality

### Monte Carlo (N=10 runs)
- ✅ Coefficient of variation (CV) < 1% (determinism check)
- ✅ Mean mortality within ±5% of expected values
- ✅ No NaN/Infinity in transition metrics

---

## Implementation Checklist

- [ ] Create `/src/simulation/phases/coordinatedDeploymentPhase.ts`
- [ ] Update `/src/types/game.ts` (add aiCoordination, transitionMetrics)
- [ ] Update `/src/simulation/initialization/initializeGame.ts` (initialize new fields)
- [ ] Update `/src/simulation/engine/PhaseOrchestrator.ts` (add phase to execution order)
- [ ] Create `/scripts/godModeComparison.ts`
- [ ] Create `/tests/coordinatedDeployment.test.ts`
- [ ] Run unit tests: `npm test coordinatedDeployment.test.ts`
- [ ] Run god mode comparison: `npx tsx scripts/godModeComparison.ts`
- [ ] Run type check: `npx tsc --noEmit`
- [ ] Fix any TypeScript errors

---

## Next Steps After Implementation

1. **Architecture Review (Quality Gate 2)** - architecture-skeptic reviews integration
2. **Monte Carlo Validation** - Priya runs N=10 validation comparing modes
3. **Wiki Documentation** - Historian updates docs/wiki/README.md
4. **Plan Archival** - Architect moves plan to /plans/completed/

---

**Status:** READY FOR IMPLEMENTATION
**Research Validated:** ✅ Grade A-
**Implementer:** Awaiting assignment (Moss or Roy)
**Estimated Time:** 4-6 hours
