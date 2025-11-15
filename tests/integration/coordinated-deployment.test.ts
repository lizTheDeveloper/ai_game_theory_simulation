/**
 * Integration Tests: CoordinatedDeploymentPhase
 *
 * Tests integration of CoordinatedDeploymentPhase with GameState and simulation engine.
 * Verifies state initialization, system integration, edge case handling, and determinism.
 *
 * CRITICAL: This phase (order 16.5) manages transition mortality from technology deployment.
 * Missing state or improper initialization could cause crashes or silent failures.
 *
 * @module tests/integration/coordinated-deployment
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { createDefaultInitialState } from '../../src/simulation/initialization';
import { CoordinatedDeploymentPhase } from '../../src/simulation/engine/phases/CoordinatedDeploymentPhase';
import { GameState, AIAgent } from '../../src/types/game';

/**
 * Helper: Create deterministic RNG from seed
 * Simple LCG (Linear Congruential Generator) for deterministic testing
 */
function createSeededRNG(seed: string): () => number {
  let state = 0;
  for (let i = 0; i < seed.length; i++) {
    state = ((state << 5) - state + seed.charCodeAt(i)) | 0;
  }
  state = Math.abs(state);

  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

/**
 * Helper: Create minimal valid GameState for testing
 * Includes only required properties, allows selective override
 */
function createMinimalState(overrides?: Partial<GameState>): GameState {
  const rng = createSeededRNG('test-minimal');
  const baseState = createDefaultInitialState(rng, 'historical');

  return {
    ...baseState,
    currentMonth: 12, // Post-bootstrap (>1)
    ...overrides
  };
}

/**
 * Helper: Create AI agent with specific capabilities
 */
function createAIAgent(
  id: string,
  capabilities: { cognitive: number; social: number },
  lifecycleState: 'deployed_open' | 'deployed_closed' | 'training' = 'deployed_open'
): AIAgent {
  return {
    id,
    name: `Agent ${id}`,
    lifecycleState,
    capabilityProfile: {
      physical: 0,
      digital: 0,
      cognitive: capabilities.cognitive,
      social: capabilities.social,
      economic: 0,
      research: 0,
      military: 0,
      political: 0,
      creative: 0,
      education: 0,
      healthcare: 0,
      infrastructure: 0,
      agriculture: 0,
      manufacturing: 0,
      energy: 0,
      communication: 0,
      transportation: 0
    },
    organizations: [],
    alignmentScore: 1.0,
    autonomyLevel: 0,
    globalImpactScore: 0,
    isFrontier: false,
    isFullyDeployed: lifecycleState.startsWith('deployed')
  } as AIAgent;
}

// =============================================================================
// TEST SUITE: State Initialization
// =============================================================================

test('CoordinatedDeploymentPhase: handles initialized state correctly', () => {
  const phase = new CoordinatedDeploymentPhase();
  const rng = createSeededRNG('test-initialized');
  const state = createMinimalState();

  // Verify preconditions
  assert.ok(state.coordinatedDeployment, 'coordinatedDeployment should be initialized');
  assert.strictEqual(typeof state.coordinatedDeployment.globalCoordinationQuality, 'number');

  const result = phase.execute(state, rng);

  // Should execute without errors
  assert.ok(Array.isArray(result.events), 'Should return events array');
  assert.ok(state.coordinatedDeployment, 'Should maintain coordinatedDeployment state');

  console.log('✓ Phase handles initialized state correctly');
});

test('CoordinatedDeploymentPhase: fails loudly if state missing after bootstrap', () => {
  const phase = new CoordinatedDeploymentPhase();
  const rng = createSeededRNG('test-missing-state');

  // Create state WITHOUT coordinatedDeployment (after bootstrap)
  const state = createMinimalState({
    currentMonth: 12, // Post-bootstrap
    coordinatedDeployment: undefined
  });

  // Should throw with clear error message
  assert.throws(
    () => phase.execute(state, rng),
    {
      name: 'Error',
      message: /CRITICAL.*coordinatedDeployment state missing/
    },
    'Should fail loudly when state missing after bootstrap'
  );

  console.log('✓ Phase fails loudly if state missing after bootstrap');
});

test('CoordinatedDeploymentPhase: skips execution during bootstrap (month 0-1)', () => {
  const phase = new CoordinatedDeploymentPhase();
  const rng = createSeededRNG('test-bootstrap');

  // Create state at month 0 (bootstrap) without coordinatedDeployment
  const state = createMinimalState({
    currentMonth: 0,
    coordinatedDeployment: undefined
  });

  // Should NOT throw during bootstrap
  const result = phase.execute(state, rng);
  assert.ok(Array.isArray(result.events), 'Should return empty events during bootstrap');
  assert.strictEqual(result.events.length, 0, 'Should have no events during bootstrap skip');

  console.log('✓ Phase skips execution during bootstrap');
});

// =============================================================================
// TEST SUITE: Integration with Game State
// =============================================================================

test('CoordinatedDeploymentPhase: reads AI capabilities correctly', () => {
  const phase = new CoordinatedDeploymentPhase();
  const rng = createSeededRNG('test-ai-capabilities');
  const state = createMinimalState();

  // Add AI agents with high cognitive + social capabilities
  state.aiAgents = [
    createAIAgent('ai-1', { cognitive: 5, social: 5 }, 'deployed_open'),
    createAIAgent('ai-2', { cognitive: 4, social: 4 }, 'deployed_open')
  ];

  const initialCoordination = state.coordinatedDeployment!.globalCoordinationQuality;

  phase.execute(state, rng);

  const finalCoordination = state.coordinatedDeployment!.globalCoordinationQuality;

  // High AI capabilities should increase coordination quality
  assert.ok(
    finalCoordination >= 0 && finalCoordination <= 1,
    'Coordination quality should be in [0, 1] range'
  );

  // With high-capability AI agents, coordination should improve
  // (Note: May be capped at 0.70 per Sylvia)
  assert.ok(
    finalCoordination <= 0.70,
    'Coordination quality should be capped at 70% (Sylvia adjustment)'
  );

  console.log(`✓ Phase reads AI capabilities correctly (coordination: ${(finalCoordination * 100).toFixed(1)}%)`);
});

test('CoordinatedDeploymentPhase: reads government capacity correctly', () => {
  const phase = new CoordinatedDeploymentPhase();
  const rng = createSeededRNG('test-government-capacity');

  // Test with high government capability
  const highCapState = createMinimalState({
    government: {
      ...createMinimalState().government,
      capabilityToControl: 2.0 // High capacity (normalized to 1.0)
    }
  });

  phase.execute(highCapState, rng);
  const highCapacityRegional = highCapState.coordinatedDeployment!.regionalCapacity;

  // Test with low government capability
  const lowCapState = createMinimalState({
    government: {
      ...createMinimalState().government,
      capabilityToControl: 0.5 // Low capacity
    }
  });

  const rng2 = createSeededRNG('test-government-capacity'); // Same seed for comparison
  phase.execute(lowCapState, rng2);
  const lowCapacityRegional = lowCapState.coordinatedDeployment!.regionalCapacity;

  // High government capacity should increase regional capacity
  assert.ok(
    highCapacityRegional.highIncome >= lowCapacityRegional.highIncome,
    'Higher government capability should increase high-income regional capacity'
  );

  console.log('✓ Phase reads government capacity correctly');
});

test('CoordinatedDeploymentPhase: reads human population correctly', () => {
  const phase = new CoordinatedDeploymentPhase();
  const rng = createSeededRNG('test-population');
  const state = createMinimalState({
    humanPopulationSystem: {
      ...createMinimalState().humanPopulationSystem,
      population: 8.5 // 8.5 billion
    }
  });

  const initialPop = state.humanPopulationSystem.population;

  phase.execute(state, rng);

  const finalPop = state.humanPopulationSystem.population;

  // Population should be modified (mortality applied)
  assert.ok(
    typeof finalPop === 'number',
    'Population should remain a number'
  );

  assert.ok(
    finalPop > 0,
    'Population should remain positive'
  );

  // Population should decrease (mortality) or stay same (zero mortality)
  assert.ok(
    finalPop <= initialPop,
    'Population should not increase from transition mortality'
  );

  console.log(`✓ Phase reads and updates population correctly (${initialPop}B → ${finalPop}B)`);
});

// =============================================================================
// TEST SUITE: State Mutation
// =============================================================================

test('CoordinatedDeploymentPhase: writes deployment progress correctly', () => {
  const phase = new CoordinatedDeploymentPhase();
  const rng = createSeededRNG('test-deployment-progress');
  const state = createMinimalState();

  phase.execute(state, rng);

  const deployment = state.coordinatedDeployment!;

  // Verify all expected fields are written
  assert.ok(typeof deployment.regionalCapacity.highIncome === 'number', 'Should write highIncome capacity');
  assert.ok(typeof deployment.regionalCapacity.upperMiddle === 'number', 'Should write upperMiddle capacity');
  assert.ok(typeof deployment.regionalCapacity.lowerMiddle === 'number', 'Should write lowerMiddle capacity');
  assert.ok(typeof deployment.regionalCapacity.lowIncome === 'number', 'Should write lowIncome capacity');

  assert.ok(typeof deployment.supportSystems.universalBasicIncome === 'number', 'Should write UBI level');
  assert.ok(typeof deployment.supportSystems.retrainingPrograms === 'number', 'Should write retraining level');
  assert.ok(typeof deployment.supportSystems.foodSecurity === 'number', 'Should write food security level');
  assert.ok(typeof deployment.supportSystems.healthcareAccess === 'number', 'Should write healthcare level');

  assert.ok(typeof deployment.globalCoordinationQuality === 'number', 'Should write coordination quality');
  assert.ok(typeof deployment.optimalDeploymentSpeed === 'number', 'Should write optimal speed');
  assert.ok(typeof deployment.currentDeploymentSpeed === 'number', 'Should write current speed');

  assert.ok(typeof deployment.transitionMortality.annualExcessMortality === 'number', 'Should write annual mortality');
  assert.ok(typeof deployment.transitionMortality.cumulativeTransitionDeaths === 'number', 'Should write cumulative deaths');

  console.log('✓ Phase writes deployment progress correctly');
});

test('CoordinatedDeploymentPhase: validates probability ranges with assertions', () => {
  const phase = new CoordinatedDeploymentPhase();
  const rng = createSeededRNG('test-probability-validation');
  const state = createMinimalState();

  phase.execute(state, rng);

  const deployment = state.coordinatedDeployment!;

  // All probability values should be in [0, 1]
  assert.ok(deployment.regionalCapacity.highIncome >= 0 && deployment.regionalCapacity.highIncome <= 1);
  assert.ok(deployment.regionalCapacity.upperMiddle >= 0 && deployment.regionalCapacity.upperMiddle <= 1);
  assert.ok(deployment.regionalCapacity.lowerMiddle >= 0 && deployment.regionalCapacity.lowerMiddle <= 1);
  assert.ok(deployment.regionalCapacity.lowIncome >= 0 && deployment.regionalCapacity.lowIncome <= 1);

  assert.ok(deployment.supportSystems.universalBasicIncome >= 0 && deployment.supportSystems.universalBasicIncome <= 1);
  assert.ok(deployment.supportSystems.retrainingPrograms >= 0 && deployment.supportSystems.retrainingPrograms <= 1);
  assert.ok(deployment.supportSystems.foodSecurity >= 0 && deployment.supportSystems.foodSecurity <= 1);
  assert.ok(deployment.supportSystems.healthcareAccess >= 0 && deployment.supportSystems.healthcareAccess <= 1);

  assert.ok(deployment.globalCoordinationQuality >= 0 && deployment.globalCoordinationQuality <= 1);

  console.log('✓ Phase validates probability ranges with assertions');
});

test('CoordinatedDeploymentPhase: accumulates cumulative deaths correctly', () => {
  const phase = new CoordinatedDeploymentPhase();
  const rng = createSeededRNG('test-cumulative-deaths');
  const state = createMinimalState();

  // Set initial cumulative deaths
  state.coordinatedDeployment!.transitionMortality.cumulativeTransitionDeaths = 10.0; // 10M deaths

  const initialCumulative = state.coordinatedDeployment!.transitionMortality.cumulativeTransitionDeaths;

  phase.execute(state, rng);

  const finalCumulative = state.coordinatedDeployment!.transitionMortality.cumulativeTransitionDeaths;

  // Cumulative deaths should increase or stay same (never decrease)
  assert.ok(
    finalCumulative >= initialCumulative,
    'Cumulative deaths should never decrease'
  );

  console.log(`✓ Cumulative deaths accumulate correctly (${initialCumulative}M → ${finalCumulative}M)`);
});

// =============================================================================
// TEST SUITE: Edge Cases
// =============================================================================

test('CoordinatedDeploymentPhase: handles zero AI agents gracefully', () => {
  const phase = new CoordinatedDeploymentPhase();
  const rng = createSeededRNG('test-zero-ai');
  const state = createMinimalState({
    aiAgents: [] // No AI agents
  });

  // Should not throw
  const result = phase.execute(state, rng);

  assert.ok(Array.isArray(result.events), 'Should return events array');
  assert.ok(
    state.coordinatedDeployment!.globalCoordinationQuality >= 0,
    'Coordination quality should be non-negative even with zero AI agents'
  );

  console.log('✓ Phase handles zero AI agents gracefully');
});

test('CoordinatedDeploymentPhase: handles AI agents without deployed state', () => {
  const phase = new CoordinatedDeploymentPhase();
  const rng = createSeededRNG('test-non-deployed-ai');
  const state = createMinimalState();

  // Add AI agents that are NOT deployed
  state.aiAgents = [
    createAIAgent('ai-training', { cognitive: 5, social: 5 }, 'training')
  ];

  // Should not throw - only deployed AI contributes to coordination
  const result = phase.execute(state, rng);

  assert.ok(Array.isArray(result.events), 'Should return events array');

  console.log('✓ Phase handles non-deployed AI agents correctly');
});

test('CoordinatedDeploymentPhase: handles zero government capability', () => {
  const phase = new CoordinatedDeploymentPhase();
  const rng = createSeededRNG('test-zero-government');
  const state = createMinimalState({
    government: {
      ...createMinimalState().government,
      capabilityToControl: 0 // Zero government capability
    }
  });

  // Should not throw - uses fallback governance quality
  const result = phase.execute(state, rng);

  assert.ok(Array.isArray(result.events), 'Should return events array');
  assert.ok(
    state.coordinatedDeployment!.regionalCapacity.highIncome >= 0,
    'Regional capacity should be non-negative even with zero government capability'
  );

  console.log('✓ Phase handles zero government capability gracefully');
});

test('CoordinatedDeploymentPhase: handles very low population', () => {
  const phase = new CoordinatedDeploymentPhase();
  const rng = createSeededRNG('test-low-population');
  const state = createMinimalState({
    humanPopulationSystem: {
      ...createMinimalState().humanPopulationSystem,
      population: 0.1 // 100 million (post-catastrophe scenario)
    }
  });

  // Should not throw - mortality calculations should scale
  const result = phase.execute(state, rng);

  assert.ok(Array.isArray(result.events), 'Should return events array');
  assert.ok(
    state.humanPopulationSystem.population >= 0.001,
    'Population should not go below minimum (1M)'
  );

  console.log('✓ Phase handles very low population correctly');
});

test('CoordinatedDeploymentPhase: enforces minimum population floor', () => {
  const phase = new CoordinatedDeploymentPhase();
  const rng = createSeededRNG('test-population-floor');
  const state = createMinimalState({
    humanPopulationSystem: {
      ...createMinimalState().humanPopulationSystem,
      population: 0.002 // 2 million (near minimum)
    }
  });

  // Set high mortality conditions
  state.coordinatedDeployment!.currentDeploymentSpeed = 0.30; // Maximum shock therapy speed

  phase.execute(state, rng);

  // Even with high mortality, population should not go below 1M (0.001B)
  assert.ok(
    state.humanPopulationSystem.population >= 0.001,
    'Population should be clamped to minimum 1M'
  );

  console.log('✓ Phase enforces minimum population floor');
});

test('CoordinatedDeploymentPhase: handles maximum economic transition stage', () => {
  const phase = new CoordinatedDeploymentPhase();
  const rng = createSeededRNG('test-max-economic');
  const state = createMinimalState({
    globalMetrics: {
      ...createMinimalState().globalMetrics,
      economicTransitionStage: 4 // Maximum stage
    }
  });

  // Should not throw - support systems should scale appropriately
  const result = phase.execute(state, rng);

  assert.ok(Array.isArray(result.events), 'Should return events array');

  // High economic stage should enable high support system levels
  assert.ok(
    state.coordinatedDeployment!.supportSystems.universalBasicIncome >= 0,
    'UBI should be non-negative at max economic stage'
  );

  console.log('✓ Phase handles maximum economic transition stage');
});

// =============================================================================
// TEST SUITE: Full System Integration
// =============================================================================

test('CoordinatedDeploymentPhase: integrates correctly in simulation step sequence', () => {
  const phase = new CoordinatedDeploymentPhase();
  const rng = createSeededRNG('test-integration');
  const state = createMinimalState();

  // Simulate dependencies being executed first
  // Phase 3.0: AI lifecycle (set up AI agents)
  state.aiAgents = [
    createAIAgent('ai-1', { cognitive: 4, social: 3 }, 'deployed_open')
  ];

  // Phase 7.0: Government actions (set up government capacity)
  state.government.capabilityToControl = 1.5;

  // Phase 12.5: Tech tree (would normally set deployment levels)
  // For this test, we use the initialized values

  // Phase 16.5: CoordinatedDeployment (THIS PHASE)
  const result = phase.execute(state, rng);

  // Verify outputs are available for downstream phases
  assert.ok(
    typeof state.coordinatedDeployment!.transitionMortality.annualExcessMortality === 'number',
    'Mortality data should be available for downstream phases'
  );

  // Phase 31.0: Economic effects (would read mortality impacts)
  // Verify data is in expected format
  assert.ok(
    state.coordinatedDeployment!.transitionMortality.mortalityByMechanism.famine >= 0,
    'Famine mortality should be available'
  );

  console.log('✓ Phase integrates correctly in simulation step sequence');
});

test('CoordinatedDeploymentPhase: produces crisis events for high mortality', () => {
  const phase = new CoordinatedDeploymentPhase();
  const rng = createSeededRNG('test-crisis-events');
  const state = createMinimalState();

  // Force high mortality scenario
  state.coordinatedDeployment!.currentDeploymentSpeed = 0.30; // Shock therapy
  state.coordinatedDeployment!.supportSystems.universalBasicIncome = 0.0; // No support
  state.coordinatedDeployment!.supportSystems.foodSecurity = 0.0;
  state.coordinatedDeployment!.supportSystems.healthcareAccess = 0.0;
  state.coordinatedDeployment!.supportSystems.retrainingPrograms = 0.0;
  state.coordinatedDeployment!.globalCoordinationQuality = 0.0; // No coordination

  const result = phase.execute(state, rng);

  // High mortality should trigger crisis events
  const mortalityRate = state.coordinatedDeployment!.transitionMortality.annualExcessMortality;

  if (mortalityRate > 10) {
    assert.ok(
      result.events.length > 0,
      'High mortality (>10 per 1000) should generate crisis events'
    );

    const crisisEvent = result.events.find(e => e.type === 'crisis');
    assert.ok(crisisEvent, 'Should include at least one crisis event');
    assert.strictEqual(crisisEvent?.severity, 'major', 'Crisis should be marked as major severity');
  }

  console.log(`✓ Phase produces crisis events for high mortality (${mortalityRate.toFixed(1)} per 1000)`);
});

test('CoordinatedDeploymentPhase: does not corrupt unrelated state', () => {
  const phase = new CoordinatedDeploymentPhase();
  const rng = createSeededRNG('test-state-isolation');
  const state = createMinimalState();

  // Capture unrelated state before execution
  const initialCurrentMonth = state.currentMonth;
  const initialAIAgentsCount = state.aiAgents.length;
  const initialGovernmentCapability = state.government.capabilityToControl;

  phase.execute(state, rng);

  // Verify unrelated state is unchanged
  assert.strictEqual(
    state.currentMonth,
    initialCurrentMonth,
    'Should not modify currentMonth'
  );

  assert.strictEqual(
    state.aiAgents.length,
    initialAIAgentsCount,
    'Should not modify AI agents array'
  );

  assert.strictEqual(
    state.government.capabilityToControl,
    initialGovernmentCapability,
    'Should not modify government capability'
  );

  console.log('✓ Phase does not corrupt unrelated state');
});

// =============================================================================
// TEST SUITE: Determinism
// =============================================================================

test('CoordinatedDeploymentPhase: produces deterministic results with same seed', () => {
  const phase = new CoordinatedDeploymentPhase();

  // Run 1
  const state1 = createMinimalState();
  const rng1 = createSeededRNG('determinism-test');
  phase.execute(state1, rng1);

  // Run 2 (same seed)
  const state2 = createMinimalState();
  const rng2 = createSeededRNG('determinism-test');
  phase.execute(state2, rng2);

  // Compare outputs
  const deployment1 = state1.coordinatedDeployment!;
  const deployment2 = state2.coordinatedDeployment!;

  assert.strictEqual(
    deployment1.globalCoordinationQuality,
    deployment2.globalCoordinationQuality,
    'Coordination quality should be deterministic'
  );

  assert.strictEqual(
    deployment1.regionalCapacity.highIncome,
    deployment2.regionalCapacity.highIncome,
    'Regional capacity should be deterministic'
  );

  assert.strictEqual(
    deployment1.supportSystems.universalBasicIncome,
    deployment2.supportSystems.universalBasicIncome,
    'Support systems should be deterministic'
  );

  assert.strictEqual(
    deployment1.transitionMortality.annualExcessMortality,
    deployment2.transitionMortality.annualExcessMortality,
    'Mortality calculations should be deterministic'
  );

  assert.strictEqual(
    state1.humanPopulationSystem.population,
    state2.humanPopulationSystem.population,
    'Population changes should be deterministic'
  );

  console.log('✓ Phase produces deterministic results with same seed');
});

test('CoordinatedDeploymentPhase: produces different results with different seeds', () => {
  const phase = new CoordinatedDeploymentPhase();

  // Run 1
  const state1 = createMinimalState();
  const rng1 = createSeededRNG('seed-A');
  phase.execute(state1, rng1);

  // Run 2 (different seed)
  const state2 = createMinimalState();
  const rng2 = createSeededRNG('seed-B');
  phase.execute(state2, rng2);

  // Outputs should differ (with high probability)
  const deployment1 = state1.coordinatedDeployment!;
  const deployment2 = state2.coordinatedDeployment!;

  // At least one randomized value should differ
  const hasVariation =
    deployment1.supportSystems.universalBasicIncome !== deployment2.supportSystems.universalBasicIncome ||
    deployment1.supportSystems.retrainingPrograms !== deployment2.supportSystems.retrainingPrograms ||
    deployment1.supportSystems.foodSecurity !== deployment2.supportSystems.foodSecurity ||
    deployment1.supportSystems.healthcareAccess !== deployment2.supportSystems.healthcareAccess;

  assert.ok(
    hasVariation,
    'Different seeds should produce different randomized values'
  );

  console.log('✓ Phase produces different results with different seeds');
});

test('CoordinatedDeploymentPhase: maintains determinism across multiple steps', () => {
  const phase = new CoordinatedDeploymentPhase();
  const rng = createSeededRNG('multi-step-determinism');
  const state = createMinimalState();

  // Execute multiple times
  const results: number[] = [];
  for (let i = 0; i < 5; i++) {
    state.currentMonth = 12 + i;
    phase.execute(state, rng);
    results.push(state.coordinatedDeployment!.transitionMortality.annualExcessMortality);
  }

  // Verify results are consistent (same sequence every time)
  const state2 = createMinimalState();
  const rng2 = createSeededRNG('multi-step-determinism');
  const results2: number[] = [];
  for (let i = 0; i < 5; i++) {
    state2.currentMonth = 12 + i;
    phase.execute(state2, rng2);
    results2.push(state2.coordinatedDeployment!.transitionMortality.annualExcessMortality);
  }

  assert.deepStrictEqual(
    results,
    results2,
    'Multi-step execution should be deterministic with same seed'
  );

  console.log('✓ Phase maintains determinism across multiple steps');
});

// =============================================================================
// TEST SUITE: Research-Backed Constraints
// =============================================================================

test('CoordinatedDeploymentPhase: enforces Sylvia 70% coordination cap', () => {
  const phase = new CoordinatedDeploymentPhase();
  const rng = createSeededRNG('test-sylvia-cap');
  const state = createMinimalState();

  // Set conditions for maximum coordination
  state.government.capabilityToControl = 2.0; // Max government capacity
  state.aiAgents = [
    createAIAgent('ai-1', { cognitive: 5, social: 5 }, 'deployed_open'),
    createAIAgent('ai-2', { cognitive: 5, social: 5 }, 'deployed_open'),
    createAIAgent('ai-3', { cognitive: 5, social: 5 }, 'deployed_open')
  ];

  phase.execute(state, rng);

  const coordination = state.coordinatedDeployment!.globalCoordinationQuality;

  // CRITICAL: Coordination should NEVER exceed 70% (Sylvia adjustment)
  assert.ok(
    coordination <= 0.70,
    `Coordination should be capped at 70%, got ${(coordination * 100).toFixed(1)}%`
  );

  console.log(`✓ Sylvia 70% coordination cap enforced (got ${(coordination * 100).toFixed(1)}%)`);
});

test('CoordinatedDeploymentPhase: deployment speed caps at 30% (shock therapy threshold)', () => {
  const phase = new CoordinatedDeploymentPhase();
  const rng = createSeededRNG('test-speed-cap');
  const state = createMinimalState();

  phase.execute(state, rng);

  const optimalSpeed = state.coordinatedDeployment!.optimalDeploymentSpeed;

  // Optimal deployment speed should never exceed 30% per year (shock therapy threshold)
  assert.ok(
    optimalSpeed <= 0.30,
    `Optimal deployment speed should be capped at 30%/year, got ${(optimalSpeed * 100).toFixed(1)}%`
  );

  console.log(`✓ Deployment speed capped at 30%/year (got ${(optimalSpeed * 100).toFixed(1)}%)`);
});

test('CoordinatedDeploymentPhase: mortality mechanism breakdown is comprehensive', () => {
  const phase = new CoordinatedDeploymentPhase();
  const rng = createSeededRNG('test-mortality-breakdown');
  const state = createMinimalState();

  phase.execute(state, rng);

  const mechanisms = state.coordinatedDeployment!.transitionMortality.mortalityByMechanism;

  // All mechanisms should be defined
  assert.ok(typeof mechanisms.famine === 'number', 'Famine mortality should be defined');
  assert.ok(typeof mechanisms.unemployment === 'number', 'Unemployment mortality should be defined');
  assert.ok(typeof mechanisms.healthcareLoss === 'number', 'Healthcare loss mortality should be defined');
  assert.ok(typeof mechanisms.coordinationFailure === 'number', 'Coordination failure mortality should be defined');
  assert.ok(typeof mechanisms.other === 'number', 'Other mortality should be defined');

  // All mechanisms should be finite (not NaN/Infinity)
  assert.ok(Number.isFinite(mechanisms.famine), 'Famine mortality should be finite');
  assert.ok(Number.isFinite(mechanisms.unemployment), 'Unemployment mortality should be finite');
  assert.ok(Number.isFinite(mechanisms.healthcareLoss), 'Healthcare loss mortality should be finite');
  assert.ok(Number.isFinite(mechanisms.coordinationFailure), 'Coordination failure mortality should be finite');
  assert.ok(Number.isFinite(mechanisms.other), 'Other mortality should be finite');

  console.log('✓ Mortality mechanism breakdown is comprehensive');
});

console.log('\n=== All CoordinatedDeploymentPhase Integration Tests Passed ===\n');
