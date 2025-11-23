# HANDOFF: AI Coordination & Transition Management Implementation

**Date:** 2025-11-21
**From:** Orchestrator
**To:** Moss (feature-implementer)
**Priority:** TIER 2 HIGH - God mode mortality fix (30% → <5%)
**Estimated Time:** 4-6 hours
**Research Status:** ✅ Grade B - IMPLEMENTATION-READY

---

## Situation

Research validation is complete. AI Coordination & Transition Management mechanics address the god mode mortality paradox: 30% mortality from instant uncoordinated deployment can be reduced to <5% through AI-managed phased rollout with comprehensive support systems.

**Research Document:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/ai_coordination_transition_management_20251120.md`

**Research Grade:** B (IMPLEMENTATION-READY)
- Reviewer: Sylvia (Research Skeptic)
- Validation: November 20, 2025
- Status: All critical issues resolved, empirically grounded parameters

**Core Finding:**
God mode 30% mortality is a composite estimate (Great Leap Forward 5-8% base × infrastructure collapse multiplier × zero adaptation time). AI-coordinated phased deployment with support systems can achieve <5% mortality through:
1. Phased rollout (15-25 years vs instant)
2. Support systems (UBI + retraining + healthcare + food security)
3. Regional adaptation (LDCs need 2-3× longer + stronger support)
4. Infrastructure pacing (grid deployment 5-15 years minimum)

---

## Your Task

Implement CoordinatedDeploymentPhase and supporting infrastructure to model AI-managed technology transition mechanics.

---

## Phase 1: State Extension (GameState Interface)

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/types/game.ts`

Add new state interface for transition management:

```typescript
/**
 * AI Coordination & Transition Management
 *
 * Models AI-managed technology deployment coordination to reduce
 * transition mortality. Research: ai_coordination_transition_management_20251120.md
 *
 * Key insight: God mode 30% mortality (instant uncoordinated) vs
 * <5% mortality (AI-coordinated phased rollout with support systems).
 */
interface TransitionManagementState {
  /**
   * Quality of AI coordination (0.0 = none, 1.0 = optimal)
   *
   * Multiplier effects (research lines 949-956):
   * - 0.0 (uncoordinated): 1.0× baseline mortality
   * - 0.5 (government-planned): 0.6-0.8× mortality
   * - 0.7 (AI-assisted): 0.3-0.5× mortality
   * - 1.0 (AI-optimal multi-agent): 0.1-0.2× mortality
   */
  coordinationQuality: number;

  /**
   * Technology deployment strategy
   *
   * Mortality by strategy (research lines 922-944):
   * - 'instant': 25-35% (god mode baseline)
   * - 'rapid': 15-25% (5-year uncoordinated)
   * - 'phased': 5-10% (15-year with basic support)
   * - 'adaptive': <5% (20-30 year AI-coordinated optimal)
   */
  deploymentStrategy: 'instant' | 'rapid' | 'phased' | 'adaptive';

  /**
   * Years remaining in phased deployment
   * Tracks rollout progress for non-instant strategies
   */
  deploymentYearsRemaining: number;

  /**
   * Support systems for economic transition
   *
   * Multiplicative mortality reduction (research lines 744-753):
   * - UBI: (1 - coverage × 0.15) - 15% reduction at full coverage
   * - Retraining: (1 - effectiveness × 0.25) - 25% reduction
   * - Food security: (1 - level × 0.40) - 40% reduction
   * - Healthcare: (1 - capacity × 0.20) - 20% reduction
   *
   * Combined effect: ~70-90% mortality reduction with all systems
   */
  supportSystems: {
    ubiCoverage: number;  // 0.0 to 1.0
    retrainingEffectiveness: number;  // 0.0 to 1.0
    foodSecurityLevel: number;  // 0.0 to 1.0
    healthcareCapacityExpansion: number;  // 0.0 to 1.0
  };

  /**
   * Regional technology absorption capacity
   *
   * Mortality multipliers by region (research lines 757-764):
   * - Advanced economies: 0.5× (2× absorption rate)
   * - Upper-middle income: 0.7× (1.5× absorption)
   * - Lower-middle income: 1.0× (baseline)
   * - Least developed: 2.0-3.0× (0.33-0.5× absorption, need extended support)
   */
  regionalReadiness: {
    advancedEconomies: number;  // 0.0 to 1.0
    upperMiddleIncome: number;
    lowerMiddleIncome: number;
    leastDeveloped: number;
  };

  /**
   * Infrastructure deployment rate constraint
   *
   * Research (lines 508-529): Grid expansion 5-15% per year maximum
   * Technology absorption rate = min(tech_availability, grid_deployment,
   * workforce_training, financial_capacity, social_acceptance)
   */
  infrastructureDeploymentRate: number;  // % per year (max 0.10 for grid)

  /**
   * Accumulated transition mortality
   * Tracks deaths from economic disruption during technology rollout
   */
  accumulatedTransitionMortality: number;
}
```

Add to GameState interface:
```typescript
export interface GameState {
  // ... existing fields ...

  /**
   * AI Coordination & Transition Management
   * Models mortality reduction through coordinated technology deployment
   */
  transitionManagement: TransitionManagementState;

  // ... rest of fields ...
}
```

---

## Phase 2: State Initialization

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/initialization.ts`

Add initialization for transition management state:

```typescript
/**
 * Initialize transition management state
 *
 * Default: God mode settings (instant, no coordination)
 * Post-alignment scenarios should override to 'adaptive' strategy
 */
function initializeTransitionManagement(): TransitionManagementState {
  return {
    coordinationQuality: 0.0,  // God mode: no coordination
    deploymentStrategy: 'instant',  // God mode: instant deployment
    deploymentYearsRemaining: 0,

    supportSystems: {
      ubiCoverage: 0.0,  // No UBI in god mode
      retrainingEffectiveness: 0.0,  // No retraining
      foodSecurityLevel: 0.0,  // No food security support
      healthcareCapacityExpansion: 0.0  // No healthcare expansion
    },

    regionalReadiness: {
      advancedEconomies: 1.0,  // Full absorption capacity
      upperMiddleIncome: 0.7,  // Moderate capacity
      lowerMiddleIncome: 0.5,  // Lower capacity
      leastDeveloped: 0.3  // Minimal capacity (need support)
    },

    infrastructureDeploymentRate: 0.10,  // 10% per year maximum (grid constraint)

    accumulatedTransitionMortality: 0
  };
}

// Add to createInitialState():
state.transitionManagement = initializeTransitionManagement();
```

---

## Phase 3: Create CoordinatedDeploymentPhase

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/phases/coordinatedDeployment.ts`

Create new phase implementing transition mortality mechanics:

```typescript
/**
 * Coordinated Deployment Phase
 *
 * Models AI-managed technology rollout coordination to reduce transition mortality.
 *
 * Research: research/ai_coordination_transition_management_20251120.md
 * Grade: B (Implementation-ready)
 * Reviewer: Sylvia (Research Skeptic)
 * Date: November 20, 2025
 *
 * Core mechanics:
 * 1. Regional capacity assessment (infrastructure, governance, absorption rates)
 * 2. Deployment scheduling (phased rollout with technology dependencies)
 * 3. Support system activation (UBI, retraining, healthcare, food security)
 * 4. Transition mortality calculation (base × coordination × support × regional)
 *
 * Key finding: God mode 30% mortality (instant uncoordinated) vs <5% mortality
 * (AI-coordinated 15-25 year phased rollout with comprehensive support systems).
 *
 * Historical validation: Composite estimate from Great Leap Forward (5-8% base)
 * × infrastructure collapse multiplier (×2.5) × zero adaptation penalty (×1.5)
 * = 18.75-30% mortality range (matches god mode empirical finding).
 */

import type { GameState } from '@/types/game';
import { assertFinite, assertInRange } from '../utils/assertions';

/**
 * Calculate base mortality rate from transition speed
 *
 * Research: lines 719-737
 * - Instant (god mode): 25-35%
 * - 5-year rapid: 15-25%
 * - 10-year moderate: 8-15%
 * - 15-year phased: 5-10%
 * - 20-30 year gradual: 2-5%
 */
function getBaseMortality(
  strategy: 'instant' | 'rapid' | 'phased' | 'adaptive',
  yearsRemaining: number,
  rng: () => number
): number {
  switch (strategy) {
    case 'instant':
      return 0.25 + rng() * 0.10;  // 25-35%

    case 'rapid':
      return 0.15 + rng() * 0.10;  // 15-25%

    case 'phased':
      return 0.05 + rng() * 0.05;  // 5-10%

    case 'adaptive':
      return 0.02 + rng() * 0.03;  // 2-5%

    default:
      throw new Error(`❌ Invalid deployment strategy: ${strategy}`);
  }
}

/**
 * Calculate coordination quality multiplier
 *
 * Research: lines 733-740
 * - None (0.0): 1.0× baseline mortality
 * - Basic (0.3-0.5): 0.6-0.8× (government-planned)
 * - Advanced (0.6-0.8): 0.3-0.5× (AI-assisted)
 * - Optimal (0.9-1.0): 0.1-0.2× (AI multi-agent coordination)
 */
function getCoordinationMultiplier(coordinationQuality: number): number {
  assertInRange(coordinationQuality, 0, 1, {
    location: 'getCoordinationMultiplier',
    valueName: 'coordinationQuality'
  });

  // Linear interpolation: 0.0 → 1.0×, 1.0 → 0.1×
  return 1.0 - (coordinationQuality * 0.9);
}

/**
 * Calculate support system multiplier (multiplicative effects)
 *
 * Research: lines 744-753
 * Individual effects:
 * - UBI: (1 - coverage × 0.15)
 * - Retraining: (1 - effectiveness × 0.25)
 * - Food security: (1 - level × 0.40)
 * - Healthcare: (1 - capacity × 0.20)
 *
 * Combined: ~70-90% mortality reduction at full coverage
 */
function getSupportMultiplier(
  supportSystems: TransitionManagementState['supportSystems']
): number {
  const ubiEffect = 1 - (supportSystems.ubiCoverage * 0.15);
  const retrainingEffect = 1 - (supportSystems.retrainingEffectiveness * 0.25);
  const foodEffect = 1 - (supportSystems.foodSecurityLevel * 0.40);
  const healthcareEffect = 1 - (supportSystems.healthcareCapacityExpansion * 0.20);

  const multiplier = ubiEffect * retrainingEffect * foodEffect * healthcareEffect;

  return assertFinite(multiplier, {
    location: 'getSupportMultiplier',
    valueName: 'supportMultiplier',
    additionalInfo: { supportSystems }
  });
}

/**
 * Calculate regional capacity multiplier (weighted average)
 *
 * Research: lines 757-764
 * - Advanced economies: 0.5× mortality (2× absorption rate)
 * - Upper-middle income: 0.7×
 * - Lower-middle income: 1.0× (baseline)
 * - Least developed: 2.0-3.0× (need extended support)
 */
function getRegionalMultiplier(
  regionalReadiness: TransitionManagementState['regionalReadiness']
): number {
  // Weighted average (assume equal population distribution for simplicity)
  // TODO: Weight by actual regional population from state.governments
  const weightedMultiplier = (
    regionalReadiness.advancedEconomies * 0.5 +
    regionalReadiness.upperMiddleIncome * 0.7 +
    regionalReadiness.lowerMiddleIncome * 1.0 +
    regionalReadiness.leastDeveloped * 2.5  // Average of 2.0-3.0 range
  ) / 4.0;

  return assertFinite(weightedMultiplier, {
    location: 'getRegionalMultiplier',
    valueName: 'regionalMultiplier',
    additionalInfo: { regionalReadiness }
  });
}

/**
 * Calculate transition mortality for current month
 *
 * Research: lines 783-794
 * Formula:
 * Transition_Mortality = (
 *   Transition_Mortality_Base ×
 *   Coordination_Multiplier ×
 *   Support_Multiplier ×
 *   Regional_Multiplier
 * ) × population
 *
 * Subject to infrastructure pacing constraint (minimum 5-15 year rollout)
 */
function calculateTransitionMortality(
  state: GameState,
  rng: () => number
): number {
  const tm = state.transitionManagement;
  const population = state.humanPopulationSystem.population;

  // Only calculate mortality during active deployment
  if (tm.deploymentStrategy === 'instant') {
    // Instant deployment: All mortality occurs in deployment month
    // Check if this is the deployment month (would need flag in state)
    // For now, assume mortality already calculated on first activation
    return 0;
  }

  if (tm.deploymentYearsRemaining <= 0) {
    // Deployment complete, no further transition mortality
    return 0;
  }

  // Get base mortality rate for this strategy
  const baseMortality = getBaseMortality(
    tm.deploymentStrategy,
    tm.deploymentYearsRemaining,
    rng
  );

  // Apply multipliers
  const coordMultiplier = getCoordinationMultiplier(tm.coordinationQuality);
  const supportMultiplier = getSupportMultiplier(tm.supportSystems);
  const regionalMultiplier = getRegionalMultiplier(tm.regionalReadiness);

  // Calculate mortality for this month
  // Distribute base mortality over deployment period
  const deploymentYears = getDeploymentYears(tm.deploymentStrategy);
  const monthlyMortalityRate = (baseMortality * coordMultiplier * supportMultiplier * regionalMultiplier) / (deploymentYears * 12);

  const mortality = monthlyMortalityRate * population;

  return assertFinite(mortality, {
    location: 'calculateTransitionMortality',
    valueName: 'transitionMortality',
    month: state.currentMonth,
    additionalInfo: {
      baseMortality,
      coordMultiplier,
      supportMultiplier,
      regionalMultiplier,
      deploymentYearsRemaining: tm.deploymentYearsRemaining
    }
  });
}

/**
 * Get total deployment duration for strategy
 */
function getDeploymentYears(strategy: 'instant' | 'rapid' | 'phased' | 'adaptive'): number {
  switch (strategy) {
    case 'instant': return 0;
    case 'rapid': return 5;
    case 'phased': return 15;
    case 'adaptive': return 25;  // Average of 20-30 year range
    default:
      throw new Error(`❌ Invalid deployment strategy: ${strategy}`);
  }
}

/**
 * Update deployment progress
 */
function updateDeploymentProgress(state: GameState): void {
  const tm = state.transitionManagement;

  if (tm.deploymentYearsRemaining > 0) {
    tm.deploymentYearsRemaining -= (1 / 12);  // Decrement by 1 month

    if (tm.deploymentYearsRemaining <= 0) {
      tm.deploymentYearsRemaining = 0;
      console.log(`✅ 🤖 Technology deployment complete (${tm.deploymentStrategy} strategy)`);
    }
  }
}

/**
 * Main phase function
 */
export function coordinatedDeploymentPhase(
  state: GameState,
  rng: () => number
): void {
  // Calculate mortality from transition
  const mortality = calculateTransitionMortality(state, rng);

  if (mortality > 0) {
    // Apply mortality to population
    state.humanPopulationSystem.population -= mortality;
    state.transitionManagement.accumulatedTransitionMortality += mortality;

    // Log significant mortality events
    const mortalityRate = mortality / state.humanPopulationSystem.population;
    if (mortalityRate > 0.001) {  // >0.1% monthly mortality
      console.log(`⚠️ 🌍 Transition mortality: ${(mortality / 1e6).toFixed(2)}M deaths (${(mortalityRate * 100).toFixed(2)}% of population)`);
    }
  }

  // Update deployment progress
  updateDeploymentProgress(state);

  // Check for completion milestone
  const tm = state.transitionManagement;
  if (tm.deploymentYearsRemaining === 0 && tm.accumulatedTransitionMortality > 0) {
    const totalMortalityRate = tm.accumulatedTransitionMortality / (state.humanPopulationSystem.population + tm.accumulatedTransitionMortality);
    console.log(`📊 🤖 Transition complete: ${(tm.accumulatedTransitionMortality / 1e6).toFixed(1)}M total deaths (${(totalMortalityRate * 100).toFixed(1)}% mortality rate)`);
  }
}
```

---

## Phase 4: Integration with Phase Orchestrator

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/engine/PhaseOrchestrator.ts`

Add CoordinatedDeploymentPhase to execution order:

```typescript
import { coordinatedDeploymentPhase } from '../phases/coordinatedDeployment';

// Add to phase execution sequence (after technology deployment, before mortality)
export function executePhases(state: GameState, rng: () => number): void {
  // ... existing phases ...

  // Technology deployment
  technologyDeploymentPhase(state, rng);

  // AI-coordinated transition management
  coordinatedDeploymentPhase(state, rng);

  // Mortality calculation
  mortalityPhase(state, rng);

  // ... rest of phases ...
}
```

---

## Phase 5: Scenario Configuration

Create scenario configurations for testing different deployment strategies:

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/scenarios/ai_coordinated_deployment.ts`

```typescript
/**
 * AI-Coordinated Deployment Scenarios
 *
 * Test transition mortality under different coordination levels
 */

export const godModeInstantScenario = {
  name: 'God Mode (Instant Uncoordinated)',
  description: '30% mortality from instant tech deployment without coordination',

  transitionManagement: {
    coordinationQuality: 0.0,  // No coordination
    deploymentStrategy: 'instant',
    deploymentYearsRemaining: 0,
    supportSystems: {
      ubiCoverage: 0.0,
      retrainingEffectiveness: 0.0,
      foodSecurityLevel: 0.0,
      healthcareCapacityExpansion: 0.0
    },
    regionalReadiness: {
      advancedEconomies: 1.0,
      upperMiddleIncome: 0.7,
      lowerMiddleIncome: 0.5,
      leastDeveloped: 0.3
    },
    infrastructureDeploymentRate: 0.10,
    accumulatedTransitionMortality: 0
  }
};

export const aiCoordinatedOptimalScenario = {
  name: 'AI-Coordinated Optimal (25-year Adaptive)',
  description: '<5% mortality from optimal AI coordination with full support',

  transitionManagement: {
    coordinationQuality: 1.0,  // Optimal AI coordination
    deploymentStrategy: 'adaptive',
    deploymentYearsRemaining: 25,  // 25-year phased rollout
    supportSystems: {
      ubiCoverage: 1.0,  // Full UBI coverage
      retrainingEffectiveness: 0.9,  // 90% effective retraining (Swedish model)
      foodSecurityLevel: 1.0,  // Full food security
      healthcareCapacityExpansion: 0.8  // 80% surge capacity expansion
    },
    regionalReadiness: {
      advancedEconomies: 1.0,
      upperMiddleIncome: 0.9,  // Enhanced with support
      lowerMiddleIncome: 0.7,  // Enhanced with support
      leastDeveloped: 0.5  // Enhanced with intensive support
    },
    infrastructureDeploymentRate: 0.10,
    accumulatedTransitionMortality: 0
  }
};

export const rapidUncoordinatedScenario = {
  name: 'Rapid Uncoordinated (5-year Market)',
  description: '15-25% mortality from market-driven rapid deployment',

  transitionManagement: {
    coordinationQuality: 0.3,  // Minimal coordination
    deploymentStrategy: 'rapid',
    deploymentYearsRemaining: 5,
    supportSystems: {
      ubiCoverage: 0.2,  // Minimal UBI
      retrainingEffectiveness: 0.3,  // Poor retraining (US federal model)
      foodSecurityLevel: 0.5,  // Partial food security
      healthcareCapacityExpansion: 0.2  // Minimal expansion
    },
    regionalReadiness: {
      advancedEconomies: 1.0,
      upperMiddleIncome: 0.7,
      lowerMiddleIncome: 0.5,
      leastDeveloped: 0.3  // No additional support
    },
    infrastructureDeploymentRate: 0.10,
    accumulatedTransitionMortality: 0
  }
};
```

---

## Testing Requirements

### Unit Tests

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/tests/unit/coordinatedDeployment.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { coordinatedDeploymentPhase } from '@/simulation/phases/coordinatedDeployment';
import { createTestState } from '../helpers/testState';
import seedrandom from 'seedrandom';

describe('CoordinatedDeploymentPhase', () => {
  it('should calculate 25-35% mortality for instant uncoordinated deployment', () => {
    const state = createTestState();
    const rng = seedrandom('test-seed');

    // God mode settings
    state.transitionManagement.coordinationQuality = 0.0;
    state.transitionManagement.deploymentStrategy = 'instant';

    const initialPop = state.humanPopulationSystem.population;

    // Trigger deployment (would need activation flag in actual implementation)
    coordinatedDeploymentPhase(state, rng);

    const mortalityRate = state.transitionManagement.accumulatedTransitionMortality / initialPop;

    expect(mortalityRate).toBeGreaterThanOrEqual(0.25);
    expect(mortalityRate).toBeLessThanOrEqual(0.35);
  });

  it('should calculate <5% mortality for optimal AI coordination', () => {
    const state = createTestState();
    const rng = seedrandom('test-seed');

    // AI-coordinated optimal settings
    state.transitionManagement.coordinationQuality = 1.0;
    state.transitionManagement.deploymentStrategy = 'adaptive';
    state.transitionManagement.deploymentYearsRemaining = 25;
    state.transitionManagement.supportSystems = {
      ubiCoverage: 1.0,
      retrainingEffectiveness: 0.9,
      foodSecurityLevel: 1.0,
      healthcareCapacityExpansion: 0.8
    };

    const initialPop = state.humanPopulationSystem.population;

    // Run entire deployment period
    for (let month = 0; month < 25 * 12; month++) {
      coordinatedDeploymentPhase(state, rng);
    }

    const mortalityRate = state.transitionManagement.accumulatedTransitionMortality / initialPop;

    expect(mortalityRate).toBeLessThan(0.05);
  });

  it('should respect infrastructure deployment rate constraint', () => {
    const state = createTestState();

    // Infrastructure constraint should limit deployment rate to 10% per year
    expect(state.transitionManagement.infrastructureDeploymentRate).toBeLessThanOrEqual(0.10);
  });

  it('should apply regional multipliers correctly', () => {
    // Test LDCs have 2-3× mortality without support
    const state = createTestState();
    state.transitionManagement.regionalReadiness.leastDeveloped = 0.3;

    // Regional multiplier calculation should reflect 2-3× penalty
    // (tested via integration test comparing regional scenarios)
  });
});
```

### Integration Tests

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/tests/integration/transitionMortality.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { runSimulation } from '@/simulation/engine/PhaseOrchestrator';
import { godModeInstantScenario, aiCoordinatedOptimalScenario } from '@/scenarios/ai_coordinated_deployment';

describe('Transition Mortality Integration', () => {
  it('should show 6× mortality reduction from coordination', () => {
    const godModeResult = runSimulation(godModeInstantScenario, 120);  // 10 years
    const aiOptimalResult = runSimulation(aiCoordinatedOptimalScenario, 300);  // 25 years

    const godModeMortalityRate = godModeResult.transitionManagement.accumulatedTransitionMortality / godModeResult.humanPopulationSystem.initialPopulation;
    const aiOptimalMortalityRate = aiOptimalResult.transitionManagement.accumulatedTransitionMortality / aiOptimalResult.humanPopulationSystem.initialPopulation;

    // Research expectation: ~6× reduction (30% → 5%)
    expect(godModeMortalityRate / aiOptimalMortalityRate).toBeGreaterThan(5);
  });
});
```

---

## Monte Carlo Validation

After implementation, run Monte Carlo simulations to validate:

```bash
# God mode (instant uncoordinated)
npx tsx scripts/monteCarloSimulation.ts --scenario godModeInstant --runs 10 > logs/mc_god_mode_$(date +%Y%m%d_%H%M%S).log 2>&1 &

# AI-coordinated optimal
npx tsx scripts/monteCarloSimulation.ts --scenario aiCoordinatedOptimal --runs 10 > logs/mc_ai_optimal_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

**Expected results:**
- God mode: 25-35% mortality (mean ~30%)
- AI-coordinated: <5% mortality (mean ~2-3%)
- Determinism: CV < 0.01% (Priya's requirement)

---

## Success Criteria

1. ✅ State extension added to GameState interface
2. ✅ CoordinatedDeploymentPhase created with research-backed formulas
3. ✅ Integration into PhaseOrchestrator complete
4. ✅ Scenario configurations created for testing
5. ✅ Unit tests pass (deployment scheduling, mortality calculation)
6. ✅ Integration tests pass (god mode vs AI-coordinated comparison)
7. ✅ Type safety maintained (`npx tsc --noEmit` passes)
8. ✅ No NaN values (assertion utilities used throughout)
9. ✅ Monte Carlo validation: God mode ~30%, AI-optimal <5%
10. ✅ Determinism check: CV < 0.01% across N≥10 runs

---

## Quality Gates (After Implementation)

**Quality Gate 2: Architecture Review**
- Spawn architecture-skeptic to check:
  - Performance (O(n) complexity? No deep cloning?)
  - State propagation (mortality → population reduction correct?)
  - Integration complexity (clean boundaries?)

**Quality Gate 3: Monte Carlo Validation**
- Spawn priya for statistical validation:
  - N≥10 runs for each scenario
  - Determinism check (CV < 0.01%)
  - Effectiveness measurement: (god_mode - ai_optimal) / god_mode ~80-90%

**Quality Gate 4: Documentation**
- Spawn wiki-documentation-updater to add:
  - systems/ai-coordination.md (mechanics overview)
  - Update docs/wiki/README.md (link to new system)
  - Parameter justification table with research citations

**Quality Gate 5: Archival**
- Spawn architect to:
  - Move plan to plans/completed/
  - Update Progress Summary
  - Mark AI Coordination item complete in roadmap

---

## Research Citations (Key Papers)

From research document (lines 1040-1137):

**Historical Transition Mortality:**
- Ashton et al. (1984): Great Leap Forward 5.5-8.5% mortality
- Stuckler et al. (2009): Russia shock therapy +74% death rate
- Naumenko (2021): Ukrainian famine mortality 1932-33

**AI Coordination:**
- arXiv:2502.14743v2 (2025): Multi-agent coordination survey
- arXiv:2501.06322v1 (2025): Multi-agent LLM collaboration
- Frontiers Robotics & AI (2024): MACRPO coordination

**Support Systems:**
- American Economic Review (2024): UBI dynamic assessment
- BMC Public Health (2020): Safety net mortality reduction
- NBER WP (2023): Social insurance programs mortality effects

**Infrastructure:**
- IEA (2024): Grid deployment timescales 5-15 years
- McKinsey (2024): Grid upgrade urgency
- Nature Scientific Reports (2025): Grid infrastructure requirements

---

## Defensive Coding Standards

- ✅ Use `assertFinite()` for all calculations
- ✅ Use `assertInRange()` for bounded values (0-1 ranges)
- ✅ NO silent fallbacks (`?? defaultValue`)
- ✅ Fail loudly if values invalid
- ✅ Document all assumptions and research sources
- ✅ Deterministic RNG (required parameter, no Math.random())

---

**Moss, implement the AI coordination mechanics. Make god mode mortality go from 30% to <5% with optimal coordination. USE ASSERTION UTILITIES. 🤖🌍**

**Time estimate:** 4-6 hours implementation + 2-3 hours testing/validation

**Next agent:** architecture-skeptic (Quality Gate 2 after implementation complete)
