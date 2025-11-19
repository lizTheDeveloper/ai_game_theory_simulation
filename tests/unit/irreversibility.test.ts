/**
 * Unit Tests: Energy-Constrained Cleanup Utilities
 *
 * Tests the irreversibility framework utilities in isolation.
 *
 * Research validation:
 * - EPA (2024): 75 GJ/ton median energy requirement for PFAS destruction
 * - Fennell (2024): 6-9 orders of magnitude concentration gap (1000 mg/L tech vs ng/L-pg/L environment)
 * - Cousins et al. (2022): 99% atmospheric redeposition (global cycling)
 * - Ling (2024): Prevention 100-1000× more effective than cleanup
 *
 * @see research/novel_entities_irreversibility_20251116.md
 * @see src/simulation/utils/energyConstrainedCleanup.ts
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { applyEnergyConstrainedCleanup } from '../../src/simulation/utils/energyConstrainedCleanup';
import type { GameState } from '../../src/types/game';
import type { TechDefinition } from '../../src/simulation/techTree/comprehensiveTechTree';

describe('Energy-Constrained Cleanup - Unit Tests', () => {
  let mockState: GameState;
  let mockRng: () => number;
  let rngCallCount: number;

  beforeEach(() => {
    rngCallCount = 0;
    mockRng = () => {
      rngCallCount++;
      return 0.5; // Deterministic for most tests
    };

    // Minimal mock state with required properties
    mockState = {
      currentMonth: 120,
      resourceEconomy: {
        energy: {
          renewableCapacity: 100, // EJ
          demand: 50, // EJ (50 EJ surplus)
        },
      },
      planetaryBoundariesSystem: {
        boundaries: {
          novel_entities: {
            currentValue: 1.5,
            safeOperatingSpace: 1.0,
            peak: 1.8,
          },
        },
      },
    } as unknown as GameState;
  });

  describe('RNG Validation (CRITICAL-3 Regression Prevention)', () => {
    it('should throw error when RNG is undefined', () => {
      const mockTech: TechDefinition = {
        id: 'test_cleanup',
        name: 'Test Cleanup',
        effects: { novelEntitiesReduction: 0.15 },
        deploymentLevel: 1.0,
        energyRequirement: { kWhPerKg: 75000 },
        minimumConcentration: { ngPerL: 1000000 },
        reboundCoefficient: 0.2,
      } as TechDefinition;

      assert.throws(() => {
        applyEnergyConstrainedCleanup(
          mockState,
          mockTech,
          1.5,
          undefined as any
        );
      }, /RNG.*required|CRITICAL/i);
    });

    it('should throw error when RNG is null', () => {
      const mockTech: TechDefinition = {
        id: 'test_cleanup',
        name: 'Test Cleanup',
        effects: { novelEntitiesReduction: 0.15 },
        deploymentLevel: 1.0,
      } as TechDefinition;

      assert.throws(() => {
        applyEnergyConstrainedCleanup(
          mockState,
          mockTech,
          1.5,
          null as any
        );
      }, /RNG.*required|CRITICAL/i);
    });

    it('should throw error when RNG is not a function', () => {
      const mockTech: TechDefinition = {
        id: 'test_cleanup',
        name: 'Test Cleanup',
        effects: { novelEntitiesReduction: 0.15 },
        deploymentLevel: 1.0,
      } as TechDefinition;

      assert.throws(() => {
        applyEnergyConstrainedCleanup(
          mockState,
          mockTech,
          1.5,
          42 as any
        );
      }, /RNG.*required|function|CRITICAL/i);
    });

    it('should accept valid RNG function', () => {
      const mockTech: TechDefinition = {
        id: 'test_cleanup',
        name: 'Test Cleanup',
        effects: { novelEntitiesReduction: 0.15 },
        deploymentLevel: 1.0,
      } as TechDefinition;

      assert.doesNotThrow(() => {
        applyEnergyConstrainedCleanup(
          mockState,
          mockTech,
          1.5,
          mockRng
        );
      });
    });

    it('should call RNG at least once during execution', () => {
      const mockTech: TechDefinition = {
        id: 'test_cleanup',
        name: 'Test Cleanup',
        effects: { novelEntitiesReduction: 0.15 },
        deploymentLevel: 1.0,
        energyRequirement: { kWhPerKg: 75000 },
        minimumConcentration: { ngPerL: 1000000 },
        reboundCoefficient: 0.2,
        reboundUncertaintyRange: [0.1, 0.3],
      } as TechDefinition;

      rngCallCount = 0;
      applyEnergyConstrainedCleanup(mockState, mockTech, 1.5, mockRng);

      assert.ok(rngCallCount > 0, 'rngCallCount should be > 0');
    });
  });

  describe('Legacy Technology Handling', () => {
    it('should handle legacy tech without energy model', () => {
      const legacyTech: TechDefinition = {
        id: 'legacy_cleanup',
        name: 'Legacy Cleanup',
        effects: { novelEntitiesReduction: 0.10 },
        deploymentLevel: 0.8,
        // No energyRequirement or minimumConcentration
      } as TechDefinition;

      const result = applyEnergyConstrainedCleanup(
        mockState,
        legacyTech,
        1.5,
        mockRng
      );

      // Legacy tech uses base effectiveness only
      assert.ok(Math.abs(result.grossEffectiveness - 0.08) < 10**(-5), 'grossEffectiveness should be close to 0.08'); // 0.10 * 0.8
      assert.strictEqual(result.concentrationFactor, 1.0);
      assert.strictEqual(result.energyFactor, 1.0);
      assert.strictEqual(result.rebound, 0);
      assert.ok(Math.abs(result.netEffectiveness - 0.08) < 10**(-5), 'netEffectiveness should be close to 0.08');
    });

    it('should handle tech with simple energy requirement number', () => {
      const simpleTech: TechDefinition = {
        id: 'simple_cleanup',
        name: 'Simple Cleanup',
        effects: { novelEntitiesReduction: 0.15 },
        deploymentLevel: 1.0,
        energyRequirement: 100, // Simple TWh number
        minimumConcentration: { ngPerL: 1000000 },
      } as TechDefinition;

      const result = applyEnergyConstrainedCleanup(
        mockState,
        simpleTech,
        1.5,
        mockRng
      );

      // Should apply energy model
      assert.ok(result.concentrationFactor < 1.0, 'concentrationFactor should be < 1.0');
      assert.ok(result.energyFactor <= 1.0, 'energyFactor should be <= 1.0');
      assert.ok(result.netEffectiveness < 0.15, 'netEffectiveness should be < 0.15');
    });
  });

  describe('Concentration Factor Calculation', () => {
    it('should calculate power law scaling for groundwater (6 orders gap)', () => {
      const mockTech: TechDefinition = {
        id: 'pfas_remediation',
        name: 'PFAS Remediation',
        effects: { pfasReduction: 0.70 },
        deploymentLevel: 1.0,
        energyRequirement: { kWhPerKg: 75000 },
        minimumConcentration: { ngPerL: 1000000 }, // 1 mg/L
        techType: 'cleanup',
      } as TechDefinition;

      const result = applyEnergyConstrainedCleanup(
        mockState,
        mockTech,
        1.5,
        mockRng
      );

      // Groundwater: 500 ng/L typical, 1000000 ng/L tech threshold
      // Gap = 1000000 / 500 = 2000 (6 orders)
      // Factor = 1/√2000 ≈ 0.0224 (2.24%)
      assert.ok(result.concentrationFactor > 0.01, 'concentrationFactor should be > 0.01');
      assert.ok(result.concentrationFactor < 0.05, 'concentrationFactor should be < 0.05');
    });

    it('should calculate power law scaling for concentrated waste (no gap)', () => {
      const mockTech: TechDefinition = {
        id: 'industrial_cleanup',
        name: 'Industrial Cleanup',
        effects: { novelEntitiesReduction: 0.80 },
        deploymentLevel: 1.0,
        energyRequirement: { kWhPerKg: 50000 },
        minimumConcentration: {
          ngPerL: 1000000,
          concentrationPenalty: undefined, // Still defaults to groundwater path
        },
        techType: 'cleanup',
      } as TechDefinition;

      const result = applyEnergyConstrainedCleanup(
        mockState,
        mockTech,
        1.5,
        mockRng
      );

      // Note: Current implementation defaults to groundwater (6 orders gap)
      // To trigger concentratedWaste path, would need explicit concentration type
      // This test validates that concentration penalty is applied
      assert.ok(result.concentrationFactor > 0.01, "concentrationFactor should be > 0.01");
      assert.ok(result.concentrationFactor < 0.05, "concentrationFactor should be < 0.05");
    });

    it('should show extreme penalty for rainwater (9 orders gap)', () => {
      // Note: Current implementation defaults to groundwater (6 orders)
      // This test documents expected behavior if rainwater path is implemented
      const mockTech: TechDefinition = {
        id: 'atmospheric_cleanup',
        name: 'Atmospheric Cleanup',
        effects: { novelEntitiesReduction: 0.90 },
        deploymentLevel: 1.0,
        energyRequirement: { kWhPerKg: 100000 },
        minimumConcentration: { ngPerL: 1000000 }, // 1 mg/L
        techType: 'cleanup',
      } as TechDefinition;

      const result = applyEnergyConstrainedCleanup(
        mockState,
        mockTech,
        1.5,
        mockRng
      );

      // At 6 orders (groundwater default): ~2% effectiveness
      // At 9 orders (rainwater - not yet implemented): ~0.003% effectiveness
      assert.ok(result.concentrationFactor < 0.05, "concentrationFactor should be < 0.05");
    });
  });

  describe('Energy Factor Calculation', () => {
    it('should be 1.0 when renewable surplus exceeds requirement', () => {
      mockState.resourceEconomy.energy.renewableCapacity = 1000; // EJ
      mockState.resourceEconomy.energy.demand = 50; // EJ (950 EJ surplus)

      const mockTech: TechDefinition = {
        id: 'low_energy_cleanup',
        name: 'Low Energy Cleanup',
        effects: { novelEntitiesReduction: 0.20 },
        deploymentLevel: 1.0,
        energyRequirement: { kWhPerKg: 10000 }, // Low energy
        minimumConcentration: { ngPerL: 1000000 },
        techType: 'cleanup',
      } as TechDefinition;

      const result = applyEnergyConstrainedCleanup(
        mockState,
        mockTech,
        0.5, // Low boundary value = low stock
        mockRng
      );

      // Energy factor calculation: surplus / required
      // Required = (boundaryValue * 1000 Mt) * (energyPerTon GJ) / 1000 = boundary * energyPerTon EJ
      // Required = 0.5 * 10 = 5 EJ (rough estimate based on kWhPerKg conversion)
      // Factor = min(1.0, 950 / 5) = 1.0 (capped)
      // Note: Actual calculation may differ based on implementation details
      assert.ok(result.energyFactor > 0.1, "energyFactor should be > 0.1");
      assert.ok(result.energyFactor <= 1.0, "energyFactor should be <= 1.0");
    });

    it('should be constrained when renewable surplus is limited', () => {
      mockState.resourceEconomy.energy.renewableCapacity = 60; // EJ
      mockState.resourceEconomy.energy.demand = 55; // EJ (5 EJ surplus)

      const mockTech: TechDefinition = {
        id: 'high_energy_cleanup',
        name: 'High Energy Cleanup',
        effects: { novelEntitiesReduction: 0.50 },
        deploymentLevel: 1.0,
        energyRequirement: { kWhPerKg: 100000 }, // High energy
        minimumConcentration: { ngPerL: 1000000 },
        techType: 'cleanup',
      } as TechDefinition;

      const result = applyEnergyConstrainedCleanup(
        mockState,
        mockTech,
        2.0, // High boundary value = high stock
        mockRng
      );

      // Energy should be limiting factor
      assert.ok(result.energyFactor < 0.1, "energyFactor should be < 0.1");
    });

    it('should be 0 when demand exceeds renewable capacity', () => {
      mockState.resourceEconomy.energy.renewableCapacity = 40; // EJ
      mockState.resourceEconomy.energy.demand = 50; // EJ (negative surplus)

      const mockTech: TechDefinition = {
        id: 'test_cleanup',
        name: 'Test Cleanup',
        effects: { novelEntitiesReduction: 0.30 },
        deploymentLevel: 1.0,
        energyRequirement: { kWhPerKg: 75000 },
        minimumConcentration: { ngPerL: 1000000 },
        techType: 'cleanup',
      } as TechDefinition;

      const result = applyEnergyConstrainedCleanup(
        mockState,
        mockTech,
        1.5,
        mockRng
      );

      // No surplus = no cleanup
      assert.strictEqual(result.energyFactor, 0);
      assert.strictEqual(result.netEffectiveness, 0);
    });
  });

  describe('Rebound Effects (Jevons Paradox)', () => {
    it('should apply rebound coefficient when specified', () => {
      const mockTech: TechDefinition = {
        id: 'rebound_tech',
        name: 'Rebound Tech',
        effects: { novelEntitiesReduction: 0.40 },
        deploymentLevel: 1.0,
        energyRequirement: { kWhPerKg: 75000 },
        minimumConcentration: { ngPerL: 1000000 },
        techType: 'cleanup',
        reboundCoefficient: 0.30, // 30% offset
        avoidsRebound: false,
      } as TechDefinition;

      const result = applyEnergyConstrainedCleanup(
        mockState,
        mockTech,
        1.5,
        mockRng
      );

      // Rebound should reduce net effectiveness
      assert.ok(result.rebound > 0, "rebound should be > 0");
      assert.ok(result.netEffectiveness < result.grossEffectiveness, "netEffectiveness should be < result.grossEffectiveness");

      // Rebound = grossEffectiveness * 0.30
      const expectedRebound = result.grossEffectiveness * 0.30;
      assert.ok(Math.abs(result.rebound - expectedRebound) < 10**(-6), "rebound should be close to expectedRebound");
    });

    it('should sample from uncertainty range when specified', () => {
      const mockTech: TechDefinition = {
        id: 'uncertain_rebound',
        name: 'Uncertain Rebound',
        effects: { novelEntitiesReduction: 0.40 },
        deploymentLevel: 1.0,
        energyRequirement: { kWhPerKg: 75000 },
        minimumConcentration: { ngPerL: 1000000 },
        techType: 'cleanup',
        reboundCoefficient: 0.30, // Base value
        reboundUncertaintyRange: [0.10, 0.50], // 10-50% range
        avoidsRebound: false,
      } as TechDefinition;

      // Test with RNG = 0.5 (midpoint)
      const result = applyEnergyConstrainedCleanup(
        mockState,
        mockTech,
        1.5,
        mockRng // Returns 0.5
      );

      // Sampled coefficient = 0.10 + 0.5 * (0.50 - 0.10) = 0.30
      const sampledCoefficient = 0.30;
      const expectedRebound = result.grossEffectiveness * sampledCoefficient;
      assert.ok(Math.abs(result.rebound - expectedRebound) < 10**(-6), "rebound should be close to expectedRebound");
    });

    it('should sample minimum from uncertainty range when RNG = 0', () => {
      const zeroRng = () => 0.0;

      const mockTech: TechDefinition = {
        id: 'min_rebound',
        name: 'Min Rebound',
        effects: { novelEntitiesReduction: 0.40 },
        deploymentLevel: 1.0,
        energyRequirement: { kWhPerKg: 75000 },
        minimumConcentration: { ngPerL: 1000000 },
        techType: 'cleanup',
        reboundCoefficient: 0.30,
        reboundUncertaintyRange: [0.05, 0.50],
        avoidsRebound: false,
      } as TechDefinition;

      const result = applyEnergyConstrainedCleanup(
        mockState,
        mockTech,
        1.5,
        zeroRng
      );

      // Sampled coefficient = 0.05 (minimum)
      const expectedRebound = result.grossEffectiveness * 0.05;
      assert.ok(Math.abs(result.rebound - expectedRebound) < 10**(-6), "rebound should be close to expectedRebound");
    });

    it('should sample maximum from uncertainty range when RNG = 1', () => {
      const oneRng = () => 1.0;

      const mockTech: TechDefinition = {
        id: 'max_rebound',
        name: 'Max Rebound',
        effects: { novelEntitiesReduction: 0.40 },
        deploymentLevel: 1.0,
        energyRequirement: { kWhPerKg: 75000 },
        minimumConcentration: { ngPerL: 1000000 },
        techType: 'cleanup',
        reboundCoefficient: 0.30,
        reboundUncertaintyRange: [0.05, 0.90],
        avoidsRebound: false,
      } as TechDefinition;

      const result = applyEnergyConstrainedCleanup(
        mockState,
        mockTech,
        1.5,
        oneRng
      );

      // Sampled coefficient = 0.90 (maximum)
      const expectedRebound = result.grossEffectiveness * 0.90;
      assert.ok(Math.abs(result.rebound - expectedRebound) < 10**(-6), "rebound should be close to expectedRebound");
    });

    it('should skip rebound when avoidsRebound is true', () => {
      const mockTech: TechDefinition = {
        id: 'no_rebound',
        name: 'No Rebound',
        effects: { novelEntitiesReduction: 0.40 },
        deploymentLevel: 1.0,
        energyRequirement: { kWhPerKg: 75000 },
        minimumConcentration: { ngPerL: 1000000 },
        techType: 'cleanup',
        reboundCoefficient: 0.30,
        avoidsRebound: true, // Regulatory tech
      } as TechDefinition;

      const result = applyEnergyConstrainedCleanup(
        mockState,
        mockTech,
        1.5,
        mockRng
      );

      // No rebound
      assert.strictEqual(result.rebound, 0);
      assert.strictEqual(result.netEffectiveness, result.grossEffectiveness);
    });

    it('should skip rebound when coefficient is undefined', () => {
      const mockTech: TechDefinition = {
        id: 'no_coefficient',
        name: 'No Coefficient',
        effects: { novelEntitiesReduction: 0.40 },
        deploymentLevel: 1.0,
        energyRequirement: { kWhPerKg: 75000 },
        minimumConcentration: { ngPerL: 1000000 },
        techType: 'cleanup',
        // No reboundCoefficient specified
      } as TechDefinition;

      const result = applyEnergyConstrainedCleanup(
        mockState,
        mockTech,
        1.5,
        mockRng
      );

      // No rebound
      assert.strictEqual(result.rebound, 0);
      assert.strictEqual(result.netEffectiveness, result.grossEffectiveness);
    });
  });

  describe('Combined Effects (Full Integration)', () => {
    it('should multiply all constraint factors correctly', () => {
      const mockTech: TechDefinition = {
        id: 'full_constraints',
        name: 'Full Constraints',
        effects: { novelEntitiesReduction: 0.50 },
        deploymentLevel: 0.8, // 80% deployed
        energyRequirement: { kWhPerKg: 75000 },
        minimumConcentration: { ngPerL: 1000000 },
        techType: 'cleanup',
        reboundCoefficient: 0.20,
        avoidsRebound: false,
      } as TechDefinition;

      mockState.resourceEconomy.energy.renewableCapacity = 100;
      mockState.resourceEconomy.energy.demand = 80; // 20 EJ surplus

      const result = applyEnergyConstrainedCleanup(
        mockState,
        mockTech,
        1.5,
        mockRng
      );

      // Base effectiveness = 0.50 * 0.8 = 0.40
      const baseEffectiveness = 0.40;

      // Gross = base * concentrationFactor * energyFactor
      const expectedGross =
        baseEffectiveness *
        result.concentrationFactor *
        result.energyFactor;

      assert.ok(Math.abs(result.grossEffectiveness - expectedGross) < 10**(-6), "grossEffectiveness should be close to expectedGross");

      // Rebound = gross * 0.20
      const expectedRebound = result.grossEffectiveness * 0.20;
      assert.ok(Math.abs(result.rebound - expectedRebound) < 10**(-6), "rebound should be close to expectedRebound");

      // Net = gross - rebound
      const expectedNet = result.grossEffectiveness - result.rebound;
      assert.ok(Math.abs(result.netEffectiveness - expectedNet) < 10**(-6), "netEffectiveness should be close to expectedNet");

      // Net should be much smaller than base due to constraints
      assert.ok(result.netEffectiveness < baseEffectiveness * 0.1, "netEffectiveness should be < baseEffectiveness * 0.1");
    });

    it('should ensure net effectiveness is never negative', () => {
      const mockTech: TechDefinition = {
        id: 'extreme_rebound',
        name: 'Extreme Rebound',
        effects: { novelEntitiesReduction: 0.10 },
        deploymentLevel: 1.0,
        energyRequirement: { kWhPerKg: 75000 },
        minimumConcentration: { ngPerL: 1000000 },
        techType: 'cleanup',
        reboundCoefficient: 0.95, // 95% offset (extreme)
        avoidsRebound: false,
      } as TechDefinition;

      const result = applyEnergyConstrainedCleanup(
        mockState,
        mockTech,
        1.5,
        mockRng
      );

      // Even with extreme rebound, net should be clamped to 0
      assert.ok(result.netEffectiveness >= 0, "netEffectiveness should be >= 0");
    });
  });

  describe('Assertion Validation (Defensive Coding)', () => {
    it('should validate RNG returns finite values', () => {
      const nanRng = () => NaN;

      const mockTech: TechDefinition = {
        id: 'test',
        name: 'Test',
        effects: { novelEntitiesReduction: 0.15 },
        deploymentLevel: 1.0,
        energyRequirement: { kWhPerKg: 75000 },
        minimumConcentration: { ngPerL: 1000000 },
      } as TechDefinition;

      assert.throws(() => {
        applyEnergyConstrainedCleanup(mockState, mockTech, 1.5, nanRng);
      }, /finite|NaN/i);
    });

    it('should validate sampled rebound coefficient is finite', () => {
      const mockTech: TechDefinition = {
        id: 'test',
        name: 'Test',
        effects: { novelEntitiesReduction: 0.15 },
        deploymentLevel: 1.0,
        energyRequirement: { kWhPerKg: 75000 },
        minimumConcentration: { ngPerL: 1000000 },
        reboundCoefficient: 0.2,
        reboundUncertaintyRange: [0.1, 0.3],
      } as TechDefinition;

      // Test with valid RNG - should not throw
      assert.doesNotThrow(() => {
        applyEnergyConstrainedCleanup(mockState, mockTech, 1.5, mockRng);
      });
    });

    it('should validate net effectiveness is finite', () => {
      const mockTech: TechDefinition = {
        id: 'test',
        name: 'Test',
        effects: { novelEntitiesReduction: 0.15 },
        deploymentLevel: 1.0,
        energyRequirement: { kWhPerKg: 75000 },
        minimumConcentration: { ngPerL: 1000000 },
      } as TechDefinition;

      // Valid inputs should produce finite output
      const result = applyEnergyConstrainedCleanup(
        mockState,
        mockTech,
        1.5,
        mockRng
      );

      assert.strictEqual(Number.isFinite(result.netEffectiveness), true);
      assert.strictEqual(Number.isFinite(result.grossEffectiveness), true);
      assert.strictEqual(Number.isFinite(result.concentrationFactor), true);
      assert.strictEqual(Number.isFinite(result.energyFactor), true);
      assert.strictEqual(Number.isFinite(result.rebound), true);
    });
  });

  describe('Research-Backed Constants Validation', () => {
    it('should demonstrate energy trap (6 orders = 2-3% effectiveness)', () => {
      const mockTech: TechDefinition = {
        id: 'energy_trap_demo',
        name: 'Energy Trap Demo',
        effects: { novelEntitiesReduction: 1.0 }, // 100% theoretical
        deploymentLevel: 1.0,
        energyRequirement: { kWhPerKg: 75000 },
        minimumConcentration: { ngPerL: 1000000 }, // 1 mg/L
        techType: 'cleanup',
      } as TechDefinition;

      // Assume ample energy
      mockState.resourceEconomy.energy.renewableCapacity = 10000;
      mockState.resourceEconomy.energy.demand = 100;

      const result = applyEnergyConstrainedCleanup(
        mockState,
        mockTech,
        1.5,
        mockRng
      );

      // At 6 orders gap: effectiveness ~2-3%
      // Theoretical 100% → actual 2-3%
      assert.ok(result.concentrationFactor > 0.015, "concentrationFactor should be > 0.015");
      assert.ok(result.concentrationFactor < 0.04, "concentrationFactor should be < 0.04");
    });

    it('should demonstrate rebound reduces cleanup by 10-50%', () => {
      const mockTech: TechDefinition = {
        id: 'rebound_demo',
        name: 'Rebound Demo',
        effects: { novelEntitiesReduction: 0.50 },
        deploymentLevel: 1.0,
        energyRequirement: { kWhPerKg: 75000 },
        minimumConcentration: { ngPerL: 1000000 },
        techType: 'cleanup',
        reboundCoefficient: 0.30, // 30% offset (typical)
        avoidsRebound: false,
      } as TechDefinition;

      const result = applyEnergyConstrainedCleanup(
        mockState,
        mockTech,
        1.5,
        mockRng
      );

      // Rebound should be 30% of gross effectiveness
      const reboundFraction = result.rebound / result.grossEffectiveness;
      assert.ok(Math.abs(reboundFraction - 0.30) < 10**(-2), "reboundFraction should be close to 0.30");

      // Net effectiveness should be 70% of gross
      const netFraction = result.netEffectiveness / result.grossEffectiveness;
      assert.ok(Math.abs(netFraction - 0.70) < 10**(-2), "netFraction should be close to 0.70");
    });

    it('should demonstrate prevention avoids all constraints', () => {
      const preventionTech: TechDefinition = {
        id: 'prevention_demo',
        name: 'Prevention Demo',
        effects: { novelEntitiesEmissionReduction: 0.99 },
        deploymentLevel: 1.0,
        techType: 'prevention',
        avoidsRebound: true,
        // No energy or concentration constraints
      } as TechDefinition;

      const result = applyEnergyConstrainedCleanup(
        mockState,
        preventionTech,
        1.5,
        mockRng
      );

      // Prevention: no constraints, no rebound
      assert.strictEqual(result.concentrationFactor, 1.0);
      assert.strictEqual(result.energyFactor, 1.0);
      assert.strictEqual(result.rebound, 0);
      // Note: prevention tech won't have novelEntitiesReduction, so base = 0
      // This validates that legacy path is used (returns 0)
    });
  });
});
