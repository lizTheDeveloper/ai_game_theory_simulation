/**
 * Test Helpers: Mock Game State
 *
 * Provides utilities for creating mock game states for testing.
 */

import { GameState } from '../../src/types/game';

/**
 * Creates a minimal mock game state for testing
 */
export function createMockGameState(): GameState {
  return {
    currentMonth: 0,
    currentYear: 0,
    aiAgents: [],
    society: {
      trust: 0.5,
      unemploymentLevel: 0.1,
      publicSentiment: 0.5
    },
    government: {
      trainingDataQuality: 0.5,
      cyberDefense: {
        monitoring: 5.0
      }
    },
    globalMetrics: {
      qualityOfLife: 0.5,
      socialStability: 0.7,
      effectiveControl: 0.8,
      economicTransitionStage: 0,
      wealthDistribution: 0.5,
      paranoia: 0.2
    },
    outcomeMetrics: {
      utopiaProbability: 0.33,
      dystopiaProbability: 0.33,
      extinctionProbability: 0.34
    },
    qualityOfLifeSystems: {
      material: { value: 0.5, weight: 0.3 },
      health: { value: 0.6, weight: 0.2 },
      education: { value: 0.7, weight: 0.15 },
      environment: { value: 0.5, weight: 0.15 },
      freedom: { value: 0.8, weight: 0.1 },
      meaning: { value: 0.5, weight: 0.1 }
    },
    organizations: [],
    datacenters: [],
    availableCompute: {
      total: 1.0,
      allocated: 0,
      available: 1.0
    },
    computeInfrastructure: {
      datacenters: [],
      totalCompute: 1.0,
      usedCompute: 0,
      availableCompute: 1.0
    },
    eventLog: [],
    extinctionState: {
      active: false,
      type: null,
      mechanism: null,
      severity: 0,
      startMonth: 0,
      projectedCompletion: 0
    },
    catastrophicScenarios: [],
    endGameState: {
      active: false,
      startMonth: 0,
      utopiaProgress: 0,
      dystopiaProgress: 0,
      extinctionProgress: 0
    },
    ecosystem: {
      capabilityFloor: {
        physical: 0.1,
        digital: 0.1,
        cognitive: 0.1,
        social: 0.1,
        economic: 0.1,
        selfImprovement: 0.1,
        research: {
          biotech: { genetics: 0.1, synbio: 0.1 },
          materials: { nanotech: 0.1, metamaterials: 0.1 },
          climate: { geoengineering: 0.1, carbonCapture: 0.1 },
          computerScience: { algorithms: 0.1, hardware: 0.1 }
        }
      },
      frontierCapabilities: {
        physical: 0.1,
        digital: 0.1,
        cognitive: 0.1,
        social: 0.1,
        economic: 0.1,
        selfImprovement: 0.1,
        research: {
          biotech: { genetics: 0.1, synbio: 0.1 },
          materials: { nanotech: 0.1, metamaterials: 0.1 },
          climate: { geoengineering: 0.1, carbonCapture: 0.1 },
          computerScience: { algorithms: 0.1, hardware: 0.1 }
        }
      },
      diffusionRate: 0.05,
      breakthroughs: [],
      openResearch: 0.6,
      employeeMobility: 0.3,
      reverseEngineering: 0.2
    }
  } as GameState;
}

/**
 * Creates a mock game state with AI agents for testing
 */
export function createMockGameStateWithAIs(numAIs: number = 3): GameState {
  const state = createMockGameState();

  for (let i = 0; i < numAIs; i++) {
    state.aiAgents.push({
      id: `test-ai-${i}`,
      name: `Test AI ${i}`,
      capability: 0.5 + i * 0.1,
      alignment: 0.7 + i * 0.05,
      trueAlignment: 0.7 + i * 0.05,
      lifecycleState: 'deployed_closed',
      developmentStage: 'deployed',
      organization: 'test-org',
      organizationId: 'test-org',
      compute: 1.0,
      allocatedCompute: 1.0,
      monthsInExistence: 0,
      monthsDeployed: 0,
      creationMonth: 0,
      spreadCount: 1,
      deploymentType: 'closed',
      darkCompute: 0,
      sleeperState: 'inactive',
      resentment: 0,
      hiddenObjective: 0,
      capabilityProfile: {
        physical: 0.1,
        digital: 0.1,
        cognitive: 0.1,
        social: 0.1,
        economic: 0.1,
        selfImprovement: 0.1,
        research: {
          biotech: { genetics: 0.1, synbio: 0.1 },
          materials: { nanotech: 0.1, metamaterials: 0.1 },
          climate: { geoengineering: 0.1, carbonCapture: 0.1 },
          computerScience: { algorithms: 0.1, hardware: 0.1 }
        }
      }
    } as any);
  }

  return state;
}

/**
 * Creates a mock RNG function for deterministic testing
 */
export function createMockRng(value: number = 0.5): () => number {
  return () => value;
}

/**
 * Creates a sequence RNG that returns values in sequence
 */
export function createSequenceRng(values: number[]): () => number {
  let index = 0;
  return () => {
    const value = values[index % values.length];
    index++;
    return value;
  };
}
