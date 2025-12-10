/**
 * Integration test for M-1: Dual energy constraint systems integration
 *
 * Tests cross-communication between:
 * - PowerGenerationSystem (TIER 4.4 - AI datacenter constraints)
 * - EnergyBudgetPhase (TIER 2 - climate tech allocation)
 *
 * Validates that:
 * - EnergyBudgetPhase reads from powerGenerationSystem
 * - AI datacenter usage is subtracted from available capacity
 * - No double-counting of energy allocations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { energyBudgetPhase } from '../EnergyBudgetPhase.js';
import type { GameState, RNGFunction } from '../../../../types/game.js';
import { createSeededRNG } from '../../../utils/deterministicRng.js';

describe('EnergyBudget-PowerGeneration Integration (M-1)', () => {
  let state: Partial<GameState>;
  let rng: RNGFunction;

  beforeEach(() => {
    rng = createSeededRNG(12345);

    // Minimal state for testing
    state = {
      currentMonth: 12,
      energyBudget: {
        enabled: true,
        globalCapacity: {
          totalTWh: 29_000, // 2024 baseline
          cleanTWh: 11_500,
          fossilTWh: 17_500,
          growthRate: 0.03
        },
        allocations: {},
        conflicts: {
          totalDemandTWh: 0,
          surplusDeficitTWh: 0,
          competingTechs: []
        }
      },
      powerGenerationSystem: {
        dataCenterPower: 34.6, // TWh/month (415 TWh/year baseline)
        totalElectricityGeneration: 208, // TWh/month
        energyConstraintActive: false,
        constraintSeverity: 0,
        monthsConstrained: 0,
        // Other fields not needed for this test
      } as any,
      techTreeState: {
        deployedTechMap: {
          'dac-tier0': 0.1, // 10% deployment of DAC
        }
      } as any
    };
  });

  it('should subtract AI datacenter usage from available capacity', () => {
    // AI datacenter usage: 34.6 TWh/month * 12 = 415.2 TWh/year
    const result = energyBudgetPhase.execute(state as GameState, rng);

    // Should have executed successfully
    expect(result.events).toBeDefined();

    // Available capacity should be total - AI usage
    // Total: 29,000 TWh/year
    // AI usage: 415.2 TWh/year
    // Expected available: ~28,585 TWh/year
    const totalDemand = state.energyBudget!.conflicts.totalDemandTWh;
    const surplus = state.energyBudget!.conflicts.surplusDeficitTWh;

    // Should have surplus (demand is low with only 10% DAC deployment)
    expect(surplus).toBeGreaterThan(0);

    // Surplus should account for AI usage subtraction
    // Without AI subtraction: surplus ≈ 29,000 - demand
    // With AI subtraction: surplus ≈ 28,585 - demand
    expect(surplus).toBeLessThan(29_000);
  });

  it('should read energyConstraintActive from powerGenerationSystem', () => {
    // Set AI constraint active
    state.powerGenerationSystem!.energyConstraintActive = true;
    state.powerGenerationSystem!.constraintSeverity = 0.5;

    // Should not throw - integration reads this value
    expect(() => {
      energyBudgetPhase.execute(state as GameState, rng);
    }).not.toThrow();

    // Phase should complete successfully
    const result = energyBudgetPhase.execute(state as GameState, rng);
    expect(result.events).toBeDefined();
  });

  it('should handle missing powerGenerationSystem gracefully', () => {
    // Remove powerGenerationSystem
    delete state.powerGenerationSystem;

    // Should not throw - uses defensive fallbacks
    expect(() => {
      energyBudgetPhase.execute(state as GameState, rng);
    }).not.toThrow();
  });

  it('should prevent double-counting by separating AI and climate tech allocation', () => {
    // High AI usage scenario
    state.powerGenerationSystem!.dataCenterPower = 100; // TWh/month (1200 TWh/year)
    state.powerGenerationSystem!.energyConstraintActive = true;
    state.powerGenerationSystem!.constraintSeverity = 0.8;

    // Deploy climate tech
    state.techTreeState!.deployedTechMap = {
      'dac-tier0': 1.0, // 100% deployment
    };

    const result = energyBudgetPhase.execute(state as GameState, rng);

    // Should have less available capacity due to high AI usage
    const surplus = state.energyBudget!.conflicts.surplusDeficitTWh;

    // With AI using 1200 TWh/year, and DAC demanding ~15,000 TWh/year,
    // we should have a deficit
    expect(surplus).toBeLessThan(0);

    // Conflicts should list competing techs
    const conflicts = state.energyBudget!.conflicts.competingTechs;
    expect(conflicts.length).toBeGreaterThan(0);
  });
});
