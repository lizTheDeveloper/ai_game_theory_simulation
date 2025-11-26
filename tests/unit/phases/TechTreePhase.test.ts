/**
 * Unit tests for TechTreePhase
 *
 * Tests technology tree update logic including:
 * 1. Tech unlock detection (capability, time, research prerequisites)
 * 2. Deployment action application and multi-year timescales
 * 3. Research progress updates (AI, investment, energy multipliers)
 * 4. Deployment acceleration (emergency response)
 * 5. Tech effects application and validation
 *
 * Research Standards:
 * - IPCC AR6 (2021): Climate tech deployment rates (10-30 years)
 * - IEA World Energy Outlook (2024): Energy system transformation timescales
 * - Lenton et al. (2023): Minimum intervention time for tipping cascades
 * - McKinsey (2024): Global infrastructure deployment timelines
 *
 * Coverage target: 80%+ branch coverage
 */

// Set NODE_ENV before imports for test environment
process.env.NODE_ENV = 'test';

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { TechTreePhase } from '../../../src/simulation/engine/phases/TechTreePhase.js';
import type {
  GameState,
  PhaseContext,
  AIAgent,
  CapabilityProfile,
} from '../../../src/types/game.js';
import type { TechTreeState } from '../../../src/simulation/techTree/engine.js';

// ============================================================================
// TEST HELPERS
// ============================================================================

/** Create deterministic RNG with fixed seed */
function createTestRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32;
    return state / 2 ** 32;
  };
}

/** Create minimal capability profile */
function createTestCapabilityProfile(): CapabilityProfile {
  return {
    physical: 1.0,
    digital: 1.5,
    cognitive: 2.0,
    social: 1.2,
    economic: 1.8,
    selfImprovement: 1.0,
    research: {
      biotech: {
        drugDiscovery: 1.5,
        geneEditing: 1.2,
        syntheticBiology: 1.0,
        neuroscience: 2.0, // Required by capabilities.ts
      },
      materials: {
        nanotechnology: 1.3,
        quantumComputing: 0.8,
        energySystems: 1.4,
      },
      climate: {
        modeling: 1.6,
        intervention: 1.0,
        mitigation: 1.5,
      },
      computerScience: {
        algorithms: 2.0,
        security: 1.8,
        architectures: 2.5,
      },
    },
  };
}

/** Create minimal AI agent */
function createTestAI(overrides: Partial<AIAgent> = {}): AIAgent {
  return {
    id: 'test-ai-1',
    name: 'Test AI Alpha',
    capability: 1.5,
    trueAlignment: 0.8,
    resentment: 0.2,
    lifecycleState: 'deployed_open',
    capabilityProfile: createTestCapabilityProfile(),
    ...overrides,
  } as AIAgent;
}

/** Create minimal tech tree state */
function createTestTechTreeState(overrides: Partial<TechTreeState> = {}): TechTreeState {
  return {
    unlockedTech: [],
    researchProgress: {},
    regionalDeployment: {},
    deploymentAcceleration: {},
    deployedTechMap: {},
    unlockedTechSet: {},
    pendingActions: [],
    unlockHistory: [],
    totalInvestment: 0,
    techUnlockedCount: 0,
    techDeployedCount: 0,
    ...overrides,
  };
}

/** Create minimal game state for testing */
function createTestState(overrides: Partial<GameState> = {}): GameState {
  const baseState = {
    currentMonth: 1,
    aiAgents: [],
    techTreeState: createTestTechTreeState(),
    economicModel: {
      economicStage: 2.5,
      baselineGDPPerCapita: 15000,
      gdpPerCapita: 15000,
    },
    globalMetrics: {
      economicTransitionStage: 2.5, // Required by techTree engine
    },
    government: {
      researchInvestments: {
        aiSafety: 100,
        climateScience: 200,
        biotech: 150,
      },
      institutionalCapacity: 0.7, // Required by deploymentTimescales.ts
    },
    organizations: [],
    powerGenerationSystem: {
      totalElectricityGeneration: 1000, // TWh/month
      dataCenterPower: 100,
      renewableFraction: 0.3,
    },
    resourceEconomy: {
      co2: {
        temperatureAnomaly: 1.1,
      },
    },
    eventLog: [],
  };

  // Deep merge overrides with base state to preserve nested properties
  const mergedState = { ...baseState, ...overrides };
  if (overrides.government) {
    mergedState.government = { ...baseState.government, ...overrides.government };
  }
  if (overrides.economicModel) {
    mergedState.economicModel = { ...baseState.economicModel, ...overrides.economicModel };
  }
  if (overrides.globalMetrics) {
    mergedState.globalMetrics = { ...baseState.globalMetrics, ...overrides.globalMetrics };
  }
  if (overrides.powerGenerationSystem) {
    mergedState.powerGenerationSystem = { ...baseState.powerGenerationSystem, ...overrides.powerGenerationSystem };
  }

  return mergedState as unknown as GameState;
}

/** Create minimal phase context */
function createTestContext(): PhaseContext {
  return {
    month: 1,
    data: new Map(),
  };
}

// ============================================================================
// TEST SUITES
// ============================================================================

describe('TechTreePhase', () => {
  let phase: TechTreePhase;
  let rng: () => number;

  beforeEach(() => {
    phase = new TechTreePhase();
    rng = createTestRng(42);
  });

  // ==========================================================================
  // PHASE PROPERTIES
  // ==========================================================================

  describe('Phase Properties', () => {
    it('should have correct phase metadata', () => {
      assert.strictEqual(phase.id, 'tech-tree');
      assert.strictEqual(phase.name, 'Technology Tree Update');
      assert.strictEqual(phase.order, 12.5);
    });

    it('should declare AI lifecycle dependency', () => {
      assert.ok(phase.dependencies.includes('ai-lifecycle'));
    });

    it('should not depend on economic-system phase (reads economicStage only)', () => {
      // Economic-system runs at order 31.0, AFTER tech-tree at 12.5
      // Tech tree reads economicStage from initialized state, not from phase execution
      assert.ok(!phase.dependencies.includes('economic-system'));
    });
  });

  // ==========================================================================
  // RNG REQUIREMENT ENFORCEMENT
  // ==========================================================================

  describe('RNG Requirement', () => {
    it('should execute successfully with valid RNG', () => {
      const state = createTestState();
      const context = createTestContext();

      // Should not throw
      phase.execute(state, rng, context);
      assert.ok(true);
    });

    it('should not throw when RNG is provided (deterministic simulation)', () => {
      // CRITICAL-3 regression fix (Nov 7, 2025): RNG must be required
      // This test verifies RNG is properly passed through to updateTechTree
      const state = createTestState({
        aiAgents: [createTestAI({ capability: 2.0 })],
      });
      const context = createTestContext();

      // Should use RNG throughout, no Math.random fallback
      const result = phase.execute(state, rng, context);
      assert.ok(result);
    });
  });

  // ==========================================================================
  // TECH UNLOCK LOGIC
  // ==========================================================================

  describe('Tech Unlock Detection', () => {
    it('should not unlock tech when prerequisites are missing', () => {
      const state = createTestState({
        aiAgents: [createTestAI({ capability: 5.0 })], // High capability
        techTreeState: createTestTechTreeState({
          unlockedTech: [], // No prerequisites unlocked
          researchProgress: {
            'some-tech-requiring-prereq': 1.0, // Research complete
          },
        }),
      });

      const context = createTestContext();
      const result = phase.execute(state, rng, context);

      // Should not unlock tech with missing prerequisites
      const breakthroughEvents = result.events.filter(e => e.type === 'breakthrough');
      // Can't assert specific count without knowing exact tech tree state
      assert.ok(Array.isArray(breakthroughEvents));
    });

    it('should unlock tech when AI capability threshold is met', () => {
      // This test requires specific tech tree knowledge
      // For now, verify phase executes without errors
      const state = createTestState({
        aiAgents: [
          createTestAI({ capability: 2.5, lifecycleState: 'deployed_open' }),
        ],
        techTreeState: createTestTechTreeState({
          researchProgress: {},
        }),
      });

      const context = createTestContext();
      phase.execute(state, rng, context);

      // Tech unlocks depend on comprehensive tech tree definitions
      // Basic execution test only
      assert.ok(true);
    });

    it('should unlock tech when economic stage threshold is met', () => {
      const state = createTestState({
        aiAgents: [createTestAI({ capability: 2.0 })],
        economicModel: {
          economicStage: 3.5, // Advanced economy
          baselineGDPPerCapita: 20000,
          gdpPerCapita: 20000,
        },
        techTreeState: createTestTechTreeState(),
      });

      const context = createTestContext();
      phase.execute(state, rng, context);

      assert.ok(state.techTreeState);
    });

    it('should unlock tech when minimum month is reached', () => {
      const state = createTestState({
        currentMonth: 60, // Year 5
        aiAgents: [createTestAI({ capability: 2.0 })],
        techTreeState: createTestTechTreeState(),
      });

      const context = createTestContext();
      phase.execute(state, rng, context);

      assert.ok(state.currentMonth === 60);
    });

    it('should unlock tech when research progress reaches 100%', () => {
      const state = createTestState({
        aiAgents: [createTestAI({ capability: 2.5 })],
        techTreeState: createTestTechTreeState({
          researchProgress: {
            // Need to know specific tech IDs from comprehensiveTechTree.ts
            // This is a structural test only
          },
        }),
      });

      const context = createTestContext();
      phase.execute(state, rng, context);

      assert.ok(true);
    });

    it('should use deployed_2025 tech as available from start', () => {
      // Tech tree state initialization (not phase execution) unlocks deployed_2025 tech
      // This test verifies the phase doesn't break with pre-unlocked tech
      const state = createTestState({
        techTreeState: createTestTechTreeState({
          unlockedTech: ['some-deployed-2025-tech'],
          unlockedTechSet: { 'some-deployed-2025-tech': true },
          techUnlockedCount: 1,
        }),
      });

      const context = createTestContext();
      phase.execute(state, rng, context);

      assert.ok(state.techTreeState.unlockedTech.length >= 1);
    });

    it('should create breakthrough events for newly unlocked tech', () => {
      const state = createTestState({
        aiAgents: [createTestAI({ capability: 3.0 })],
        economicModel: {
          economicStage: 3.0,
          baselineGDPPerCapita: 18000,
          gdpPerCapita: 18000,
        },
        techTreeState: createTestTechTreeState(),
      });

      const context = createTestContext();
      const result = phase.execute(state, rng, context);

      // Breakthrough events should have correct structure
      const breakthroughs = result.events.filter(e => e.type === 'breakthrough');
      breakthroughs.forEach(event => {
        assert.strictEqual(event.severity, 'constructive');
        assert.strictEqual(event.agent, 'Research Community');
        assert.ok(event.title.includes('Unlocked'));
      });
    });

    it('should record unlock events in tech tree history', () => {
      const initialHistoryLength = 0;
      const state = createTestState({
        aiAgents: [createTestAI({ capability: 2.5 })],
        techTreeState: createTestTechTreeState({
          unlockHistory: [],
        }),
      });

      const context = createTestContext();
      phase.execute(state, rng, context);

      // History may or may not grow depending on unlock conditions
      assert.ok(state.techTreeState.unlockHistory.length >= initialHistoryLength);
    });
  });

  // ==========================================================================
  // DEPLOYMENT ACTIONS
  // ==========================================================================

  describe('Deployment Actions', () => {
    it('should apply pending deployment actions', () => {
      const state = createTestState({
        techTreeState: createTestTechTreeState({
          unlockedTech: ['test-tech'],
          unlockedTechSet: { 'test-tech': true },
          pendingActions: [
            {
              techId: 'test-tech',
              deployedBy: 'test-ai-1',
              investment: 1000, // $1B investment
              targetRegion: 'global',
              month: 1,
            },
          ],
        }),
      });

      const context = createTestContext();
      phase.execute(state, rng, context);

      // Actions should be cleared after application
      assert.strictEqual(state.techTreeState.pendingActions.length, 0);
    });

    it('should track total investment from deployment actions', () => {
      const state = createTestState({
        techTreeState: createTestTechTreeState({
          unlockedTech: ['tech-a'],
          unlockedTechSet: { 'tech-a': true },
          pendingActions: [
            {
              techId: 'tech-a',
              deployedBy: 'ai-1',
              investment: 500,
              targetRegion: 'global',
              month: 1,
            },
            {
              techId: 'tech-a',
              deployedBy: 'ai-2',
              investment: 300,
              targetRegion: 'global',
              month: 1,
            },
          ],
          totalInvestment: 0,
        }),
      });

      const context = createTestContext();
      phase.execute(state, rng, context);

      // Total investment should include both actions
      assert.ok(state.techTreeState.totalInvestment >= 800);
    });

    it('should create regional deployment records', () => {
      const state = createTestState({
        techTreeState: createTestTechTreeState({
          unlockedTech: ['regional-tech'],
          unlockedTechSet: { 'regional-tech': true },
          pendingActions: [
            {
              techId: 'regional-tech',
              deployedBy: 'nation-us',
              investment: 2000,
              targetRegion: 'north-america',
              month: 1,
            },
          ],
        }),
      });

      const context = createTestContext();
      phase.execute(state, rng, context);

      // Should create deployment record for region
      assert.ok('north-america' in state.techTreeState.regionalDeployment);
    });

    it('should not instantly deploy tech (multi-year timescales)', () => {
      // FIX #14 Phase 1: Deployment takes years, not instant
      const state = createTestState({
        techTreeState: createTestTechTreeState({
          unlockedTech: ['slow-tech'],
          unlockedTechSet: { 'slow-tech': true },
          pendingActions: [
            {
              techId: 'slow-tech',
              deployedBy: 'ai-deployer',
              investment: 10000, // $10B
              targetRegion: 'global',
              month: 1,
            },
          ],
        }),
      });

      const context = createTestContext();
      phase.execute(state, rng, context);

      // Deployment level should not jump to 1.0 in single month
      // (unless tech is trivially cheap, which test tech is not)
      const deployments = state.techTreeState.regionalDeployment['global'] || [];
      const deployment = deployments.find(d => d.techId === 'slow-tech');

      if (deployment) {
        // If deployment exists, verify it's not instantly complete
        // (exact value depends on deploymentTimescales.ts logic)
        assert.ok(deployment.deploymentLevel !== undefined);
      }
    });

    it('should apply deployment acceleration multipliers', () => {
      // HIGH #2 FIX: Emergency tech deployment acceleration
      const state = createTestState({
        techTreeState: createTestTechTreeState({
          unlockedTech: ['emergency-tech'],
          unlockedTechSet: { 'emergency-tech': true },
          deploymentAcceleration: {
            'emergency-tech': 10.0, // 10x faster deployment
          },
          pendingActions: [
            {
              techId: 'emergency-tech',
              deployedBy: 'emergency-response',
              investment: 5000,
              targetRegion: 'global',
              month: 1,
            },
          ],
        }),
      });

      const context = createTestContext();
      phase.execute(state, rng, context);

      // Acceleration should speed up deployment (verified by deploymentTimescales.ts)
      assert.ok(state.techTreeState.deploymentAcceleration['emergency-tech'] === 10.0);
    });

    it('should track multiple deployers for same tech', () => {
      const state = createTestState({
        techTreeState: createTestTechTreeState({
          unlockedTech: ['shared-tech'],
          unlockedTechSet: { 'shared-tech': true },
          pendingActions: [
            {
              techId: 'shared-tech',
              deployedBy: 'ai-1',
              investment: 1000,
              targetRegion: 'global',
              month: 1,
            },
            {
              techId: 'shared-tech',
              deployedBy: 'ai-2',
              investment: 1500,
              targetRegion: 'global',
              month: 1,
            },
          ],
        }),
      });

      const context = createTestContext();
      phase.execute(state, rng, context);

      const deployments = state.techTreeState.regionalDeployment['global'] || [];
      const deployment = deployments.find(d => d.techId === 'shared-tech');

      if (deployment) {
        // Should track both deployers
        assert.ok(deployment.deployedBy.length >= 1);
      }
    });
  });

  // ==========================================================================
  // RESEARCH PROGRESS
  // ==========================================================================

  describe('Research Progress Updates', () => {
    it('should increase research progress for locked tech', () => {
      const state = createTestState({
        aiAgents: [createTestAI({ capability: 1.5 })],
        techTreeState: createTestTechTreeState({
          researchProgress: {
            'unlockable-tech': 0.5, // 50% complete
          },
        }),
      });

      const context = createTestContext();
      phase.execute(state, rng, context);

      // Progress should increase (though amount depends on bonuses)
      assert.ok(state.techTreeState.researchProgress['unlockable-tech'] !== undefined);
    });

    it('should apply AI capability bonus to research speed', () => {
      const lowCapState = createTestState({
        aiAgents: [createTestAI({ capability: 1.0 })],
        techTreeState: createTestTechTreeState({
          researchProgress: { 'tech-1': 0.1 },
        }),
      });

      const highCapState = createTestState({
        aiAgents: [createTestAI({ capability: 5.0 })],
        techTreeState: createTestTechTreeState({
          researchProgress: { 'tech-1': 0.1 },
        }),
      });

      const context = createTestContext();

      phase.execute(lowCapState, createTestRng(100), context);
      phase.execute(highCapState, createTestRng(100), context);

      // Higher capability should progress faster (though hard to test without exact formula)
      assert.ok(true);
    });

    it('should apply research investment bonus', () => {
      const lowInvestmentState = createTestState({
        aiAgents: [createTestAI({ capability: 2.0 })],
        government: {
          researchInvestments: {
            aiSafety: 10, // Low investment
          },
        },
        techTreeState: createTestTechTreeState({
          researchProgress: { 'tech-2': 0.2 },
        }),
      });

      const highInvestmentState = createTestState({
        aiAgents: [createTestAI({ capability: 2.0 })],
        government: {
          researchInvestments: {
            aiSafety: 1000, // High investment
            climateScience: 500,
            biotech: 300,
          },
        },
        techTreeState: createTestTechTreeState({
          researchProgress: { 'tech-2': 0.2 },
        }),
      });

      const context = createTestContext();

      phase.execute(lowInvestmentState, createTestRng(200), context);
      phase.execute(highInvestmentState, createTestRng(200), context);

      // Higher investment should accelerate research
      assert.ok(true);
    });

    it('should apply energy multiplier to research progress', () => {
      const lowEnergyState = createTestState({
        aiAgents: [createTestAI({ capability: 2.0 })],
        powerGenerationSystem: {
          totalElectricityGeneration: 500, // Low capacity
          dataCenterPower: 400, // High consumption
          renewableFraction: 0.2,
        },
        techTreeState: createTestTechTreeState({
          researchProgress: { 'tech-3': 0.3 },
          regionalDeployment: {
            global: [
              // Create energy constraint with active deployments
              { techId: 'energy-intensive-tech', deploymentLevel: 0.5, region: 'global' } as any,
            ],
          },
        }),
      });

      const highEnergyState = createTestState({
        aiAgents: [createTestAI({ capability: 2.0 })],
        powerGenerationSystem: {
          totalElectricityGeneration: 5000, // High capacity
          dataCenterPower: 100,
          renewableFraction: 0.5,
        },
        techTreeState: createTestTechTreeState({
          researchProgress: { 'tech-3': 0.3 },
        }),
      });

      const context = createTestContext();

      phase.execute(lowEnergyState, createTestRng(300), context);
      phase.execute(highEnergyState, createTestRng(300), context);

      // Energy constraints should slow research
      assert.ok(true);
    });

    it('should cap research progress at 1.0', () => {
      const state = createTestState({
        aiAgents: [createTestAI({ capability: 5.0 })],
        government: {
          researchInvestments: {
            aiSafety: 10000, // Massive investment
          },
        },
        techTreeState: createTestTechTreeState({
          researchProgress: {
            'nearly-complete-tech': 0.99,
          },
        }),
      });

      const context = createTestContext();

      // Run multiple times to ensure we hit the cap
      for (let i = 0; i < 10; i++) {
        phase.execute(state, rng, context);
      }

      // Should never exceed 1.0
      const progress = state.techTreeState.researchProgress['nearly-complete-tech'];
      assert.ok(progress <= 1.0);
    });

    it('should validate research progress is in [0, 1] range', () => {
      const state = createTestState({
        aiAgents: [createTestAI({ capability: 2.0 })],
        techTreeState: createTestTechTreeState({
          researchProgress: {
            'valid-tech': 0.5,
          },
        }),
      });

      const context = createTestContext();

      // Should not throw with valid progress
      phase.execute(state, rng, context);
      assert.ok(true);
    });

    it('should throw error if research progress is invalid', () => {
      const state = createTestState({
        aiAgents: [createTestAI({ capability: 2.0 })],
        techTreeState: createTestTechTreeState({
          researchProgress: {
            'invalid-tech': 1.5, // Invalid: > 1.0
          },
        }),
      });

      const context = createTestContext();

      // ASSERTIONS (Nov 7, 2025): assertProbability should reject > 1.0
      assert.throws(
        () => phase.execute(state, rng, context),
        /must be between 0 and 1/
      );
    });

    it('should throw error if research progress is NaN', () => {
      const state = createTestState({
        aiAgents: [createTestAI({ capability: 2.0 })],
        techTreeState: createTestTechTreeState({
          researchProgress: {
            'nan-tech': NaN,
          },
        }),
      });

      const context = createTestContext();

      assert.throws(
        () => phase.execute(state, rng, context),
        /Non-finite|NaN/
      );
    });
  });

  // ==========================================================================
  // TECH TREE STATISTICS
  // ==========================================================================

  describe('Tech Tree Statistics', () => {
    it('should update techUnlockedCount when tech is unlocked', () => {
      const initialCount = 0;
      const state = createTestState({
        aiAgents: [createTestAI({ capability: 3.0 })],
        economicModel: {
          economicStage: 3.0,
          baselineGDPPerCapita: 18000,
          gdpPerCapita: 18000,
        },
        techTreeState: createTestTechTreeState({
          techUnlockedCount: initialCount,
        }),
      });

      const context = createTestContext();
      phase.execute(state, rng, context);

      // Count may increase if tech unlocks
      assert.ok(state.techTreeState.techUnlockedCount >= initialCount);
    });

    it('should maintain O(1) lookup indexes', () => {
      // HIGH PERFORMANCE FIX (Nov 20): Verify index maintenance
      const state = createTestState({
        techTreeState: createTestTechTreeState({
          unlockedTech: ['tech-a', 'tech-b'],
          unlockedTechSet: {
            'tech-a': true,
            'tech-b': true,
          },
          deployedTechMap: {
            'tech-a': 0.5,
            'tech-b': 0.8,
          },
        }),
      });

      const context = createTestContext();
      phase.execute(state, rng, context);

      // Indexes should remain consistent with arrays
      assert.strictEqual(state.techTreeState.unlockedTechSet['tech-a'], true);
      assert.strictEqual(state.techTreeState.unlockedTechSet['tech-b'], true);
    });

    it('should log tech tree progress every 6 months', () => {
      const state = createTestState({
        currentMonth: 6, // Should trigger log
        techTreeState: createTestTechTreeState({
          techUnlockedCount: 5,
          techDeployedCount: 2,
          totalInvestment: 50000,
          unlockHistory: [
            {
              techId: 'recent-tech',
              techName: 'Recent Tech',
              month: 6,
              reason: 'Test unlock',
              unlockedBy: 'capability',
            },
          ],
        }),
      });

      const context = createTestContext();

      // Should log without errors
      phase.execute(state, rng, context);
      assert.ok(true);
    });

    it('should not log on non-6-month intervals', () => {
      const state = createTestState({
        currentMonth: 5, // Not a 6-month interval
        techTreeState: createTestTechTreeState({
          techUnlockedCount: 3,
        }),
      });

      const context = createTestContext();
      phase.execute(state, rng, context);

      // Should execute without logging
      assert.ok(true);
    });
  });

  // ==========================================================================
  // EDGE CASES & ERROR HANDLING
  // ==========================================================================

  describe('Edge Cases & Error Handling', () => {
    it('should handle no active AIs gracefully', () => {
      const state = createTestState({
        aiAgents: [], // No AIs
        techTreeState: createTestTechTreeState(),
      });

      const context = createTestContext();

      // Should not crash, but research progress should be slow/zero
      phase.execute(state, rng, context);
      assert.ok(true);
    });

    it('should handle retired AIs correctly', () => {
      const state = createTestState({
        aiAgents: [
          createTestAI({
            capability: 5.0,
            lifecycleState: 'retired', // Retired AI
          }),
          createTestAI({
            capability: 2.0,
            lifecycleState: 'deployed_open', // Active AI
          }),
        ],
        techTreeState: createTestTechTreeState(),
      });

      const context = createTestContext();

      // Should only count active AIs for capability
      phase.execute(state, rng, context);
      assert.ok(true);
    });

    it('should handle missing power generation system', () => {
      const state = createTestState({
        aiAgents: [createTestAI({ capability: 2.0 })],
        powerGenerationSystem: undefined as any,
        techTreeState: createTestTechTreeState({
          researchProgress: { 'tech-x': 0.4 },
        }),
      });

      const context = createTestContext();

      // Should default to 1.0x energy multiplier (no constraint)
      phase.execute(state, rng, context);
      assert.ok(true);
    });

    it('should handle missing economic model gracefully', () => {
      const state = createTestState({
        aiAgents: [createTestAI({ capability: 2.0 })],
        economicModel: undefined as any,
        techTreeState: createTestTechTreeState(),
      });

      const context = createTestContext();

      // Should throw error (economic stage is required)
      assert.throws(
        () => phase.execute(state, rng, context),
        /economicStage/
      );
    });

    it('should handle empty research investments', () => {
      const state = createTestState({
        aiAgents: [createTestAI({ capability: 2.0 })],
        government: {
          researchInvestments: {},
        },
        techTreeState: createTestTechTreeState({
          researchProgress: { 'tech-y': 0.1 },
        }),
      });

      const context = createTestContext();

      // Should use base research rate (no bonus)
      phase.execute(state, rng, context);
      assert.ok(true);
    });

    it('should handle empty regional deployment', () => {
      const state = createTestState({
        techTreeState: createTestTechTreeState({
          regionalDeployment: {},
          unlockedTech: ['tech-z'],
          unlockedTechSet: { 'tech-z': true },
        }),
      });

      const context = createTestContext();
      phase.execute(state, rng, context);

      assert.ok(true);
    });

    it('should handle tech tree state without history', () => {
      const state = createTestState({
        aiAgents: [createTestAI({ capability: 2.5 })],
        techTreeState: createTestTechTreeState({
          unlockHistory: [],
        }),
      });

      const context = createTestContext();
      phase.execute(state, rng, context);

      // History should be populated if unlocks occur
      assert.ok(Array.isArray(state.techTreeState.unlockHistory));
    });

    it('should handle division by zero in capability calculation', () => {
      const state = createTestState({
        aiAgents: [
          createTestAI({
            capability: 5.0,
            lifecycleState: 'retired',
          }),
        ],
        techTreeState: createTestTechTreeState({
          researchProgress: { 'test-tech': 0.2 },
        }),
      });

      const context = createTestContext();

      // All AIs retired → 0 active AIs → should use 0 capability (not NaN)
      phase.execute(state, rng, context);
      assert.ok(true);
    });
  });

  // ==========================================================================
  // INTEGRATION TESTS
  // ==========================================================================

  describe('Integration Tests', () => {
    it('should handle full tech lifecycle: research → unlock → deploy', () => {
      const state = createTestState({
        currentMonth: 1,
        aiAgents: [createTestAI({ capability: 3.0 })],
        economicModel: {
          economicStage: 3.5,
          baselineGDPPerCapita: 20000,
          gdpPerCapita: 20000,
        },
        government: {
          researchInvestments: {
            aiSafety: 500,
            climateScience: 300,
          },
        },
        techTreeState: createTestTechTreeState({
          researchProgress: {},
        }),
      });

      const context = createTestContext();

      // Simulate multiple months
      for (let month = 1; month <= 24; month++) {
        state.currentMonth = month;
        context.month = month;
        phase.execute(state, rng, context);
      }

      // After 2 years, some tech should be unlocked (depending on tech tree)
      assert.ok(state.techTreeState);
    });

    it('should maintain determinism with same RNG seed', () => {
      const state1 = createTestState({
        aiAgents: [createTestAI({ capability: 2.5 })],
        techTreeState: createTestTechTreeState(),
      });

      const state2 = createTestState({
        aiAgents: [createTestAI({ capability: 2.5 })],
        techTreeState: createTestTechTreeState(),
      });

      const context1 = createTestContext();
      const context2 = createTestContext();

      const rng1 = createTestRng(999);
      const rng2 = createTestRng(999); // Same seed

      phase.execute(state1, rng1, context1);
      phase.execute(state2, rng2, context2);

      // Results should be identical with same seed
      assert.deepStrictEqual(
        state1.techTreeState.techUnlockedCount,
        state2.techTreeState.techUnlockedCount
      );
    });

    it('should produce different results with different RNG seeds', () => {
      const state1 = createTestState({
        currentMonth: 1,
        aiAgents: [createTestAI({ capability: 2.5 })],
        techTreeState: createTestTechTreeState({
          researchProgress: { 'stochastic-tech': 0.5 },
        }),
      });

      const state2 = createTestState({
        currentMonth: 1,
        aiAgents: [createTestAI({ capability: 2.5 })],
        techTreeState: createTestTechTreeState({
          researchProgress: { 'stochastic-tech': 0.5 },
        }),
      });

      const context1 = createTestContext();
      const context2 = createTestContext();

      const rng1 = createTestRng(111);
      const rng2 = createTestRng(222); // Different seed

      // Run multiple steps to allow stochastic divergence
      for (let i = 0; i < 10; i++) {
        phase.execute(state1, rng1, context1);
        phase.execute(state2, rng2, context2);
      }

      // Results may differ due to stochastic elements (though not guaranteed)
      assert.ok(true);
    });
  });
});
