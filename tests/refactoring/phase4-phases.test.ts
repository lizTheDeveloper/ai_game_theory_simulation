/**
 * Phase 4: Engine Orchestration - Phase Implementation Tests
 *
 * Tests that individual phase implementations work correctly and the
 * PhaseOrchestrator executes them in the right order.
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { PhaseOrchestrator } from '../../src/simulation/engine/PhaseOrchestrator';
import {
  UnemploymentPhase,
  EconomicTransitionPhase,
  ParanoiaPhase,
  SocialStabilityPhase,
  QualityOfLifePhase,
  OutcomeProbabilitiesPhase,
  CrisisDetectionPhase,
  GovernanceQualityPhase,
  UpwardSpiralsPhase,
  MeaningRenaissancePhase,
  ConflictResolutionPhase,
  DiplomaticAIPhase,
  NationalAIPhase,
  MADDeterrencePhase,
  ResourceEconomyPhase,
  ResourceTechnologyPhase,
  GeoengineringPhase,
  DefensiveAIPhase,
  DystopiaProgressionPhase,
  BenchmarkEvaluationsPhase,
  CrisisPointsPhase
} from '../../src/simulation/engine/phases';
import { GameState } from '../../src/types/game';
import { createMockGameState } from '../helpers/mockGameState';

describe('Phase 4: PhaseOrchestrator', () => {
  let orchestrator: PhaseOrchestrator;

  beforeEach(() => {
    orchestrator = new PhaseOrchestrator();
  });

  describe('Phase Registration', () => {
    test('should register phases and sort by order', () => {
      // Register out of order
      orchestrator.registerPhase(new ParanoiaPhase());
      orchestrator.registerPhase(new UnemploymentPhase());
      orchestrator.registerPhase(new GovernanceQualityPhase());

      const executionOrder = orchestrator.getExecutionOrder();

      // Should be sorted: Governance (10.0), Unemployment (30.0), Paranoia (32.0)
      expect(executionOrder).toEqual([
        'governance-quality (10.0)',
        'unemployment (30.0)',
        'paranoia (32.0)'
      ]);
    });

    test('should handle all 21 phases in correct order', () => {
      // Register all phases
      orchestrator.registerPhase(new UnemploymentPhase());
      orchestrator.registerPhase(new EconomicTransitionPhase());
      orchestrator.registerPhase(new ParanoiaPhase());
      orchestrator.registerPhase(new SocialStabilityPhase());
      orchestrator.registerPhase(new QualityOfLifePhase());
      orchestrator.registerPhase(new OutcomeProbabilitiesPhase());
      orchestrator.registerPhase(new CrisisDetectionPhase());
      orchestrator.registerPhase(new GovernanceQualityPhase());
      orchestrator.registerPhase(new UpwardSpiralsPhase());
      orchestrator.registerPhase(new MeaningRenaissancePhase());
      orchestrator.registerPhase(new ConflictResolutionPhase());
      orchestrator.registerPhase(new DiplomaticAIPhase());
      orchestrator.registerPhase(new NationalAIPhase());
      orchestrator.registerPhase(new MADDeterrencePhase());
      orchestrator.registerPhase(new ResourceEconomyPhase());
      orchestrator.registerPhase(new ResourceTechnologyPhase());
      orchestrator.registerPhase(new GeoengineringPhase());
      orchestrator.registerPhase(new DefensiveAIPhase());
      orchestrator.registerPhase(new DystopiaProgressionPhase());
      orchestrator.registerPhase(new BenchmarkEvaluationsPhase());
      orchestrator.registerPhase(new CrisisPointsPhase());

      const executionOrder = orchestrator.getExecutionOrder();

      // Should have 21 phases
      expect(executionOrder.length).toBe(21);

      // First phase should be GovernanceQuality (10.0)
      expect(executionOrder[0]).toContain('governance-quality (10.0)');

      // Last phase should be CrisisPoints (23.0)
      expect(executionOrder[20]).toContain('crisis-points (23.0)');

      // Unemployment should be before Paranoia (30.0 < 32.0)
      const unemploymentIndex = executionOrder.findIndex(s => s.includes('unemployment'));
      const paranoiaIndex = executionOrder.findIndex(s => s.includes('paranoia'));
      expect(unemploymentIndex).toBeLessThan(paranoiaIndex);
    });
  });

  describe('Phase Execution', () => {
    test('should execute phases and collect events', () => {
      const mockState = createMockGameState();
      const mockRng = () => 0.5;

      orchestrator.registerPhase(new UnemploymentPhase());
      orchestrator.registerPhase(new ParanoiaPhase());

      const events = orchestrator.executeAll(mockState, mockRng);

      // Events should be an array (may be empty)
      expect(Array.isArray(events)).toBe(true);
    });

    test('should pass context to phases that need it', () => {
      const mockState = createMockGameState();
      const mockRng = () => 0.5;
      const context = { month: 42, data: new Map() };

      orchestrator.registerPhase(new UpwardSpiralsPhase());

      const events = orchestrator.executeAll(mockState, mockRng, context);

      // Should execute without error
      expect(Array.isArray(events)).toBe(true);
    });
  });
});

describe('Phase 4: Individual Phase Tests', () => {
  let mockState: GameState;
  let mockRng: () => number;

  beforeEach(() => {
    mockState = createMockGameState();
    mockRng = () => 0.5;
  });

  describe('Batch 1: Simple Calculations', () => {
    test('UnemploymentPhase should update unemployment', () => {
      const phase = new UnemploymentPhase();
      const initialUnemployment = mockState.society.unemploymentLevel;

      phase.execute(mockState, mockRng);

      // Unemployment may have changed (or stayed same if 0 AIs)
      expect(typeof mockState.society.unemploymentLevel).toBe('number');
    });

    test('EconomicTransitionPhase should update economic metrics', () => {
      const phase = new EconomicTransitionPhase();

      phase.execute(mockState, mockRng);

      expect(typeof mockState.globalMetrics.economicTransitionStage).toBe('number');
      expect(typeof mockState.globalMetrics.wealthDistribution).toBe('number');
    });

    test('ParanoiaPhase should update paranoia metrics', () => {
      const phase = new ParanoiaPhase();

      phase.execute(mockState, mockRng);

      expect(typeof mockState.globalMetrics.paranoia).toBe('number');
    });

    test('SocialStabilityPhase should update stability', () => {
      const phase = new SocialStabilityPhase();

      phase.execute(mockState, mockRng);

      expect(typeof mockState.globalMetrics.socialStability).toBe('number');
    });

    test('QualityOfLifePhase should update QoL systems and aggregate', () => {
      const phase = new QualityOfLifePhase();

      phase.execute(mockState, mockRng);

      expect(mockState.qualityOfLifeSystems).toBeDefined();
      expect(typeof mockState.globalMetrics.qualityOfLife).toBe('number');
    });

    test('OutcomeProbabilitiesPhase should calculate probabilities', () => {
      const phase = new OutcomeProbabilitiesPhase();

      phase.execute(mockState, mockRng);

      expect(mockState.outcomeMetrics).toBeDefined();
      expect(typeof mockState.outcomeMetrics.utopiaProbability).toBe('number');
      expect(typeof mockState.outcomeMetrics.dystopiaProbability).toBe('number');
      expect(typeof mockState.outcomeMetrics.extinctionProbability).toBe('number');
    });

    test('CrisisDetectionPhase should detect crisis state', () => {
      const phase = new CrisisDetectionPhase();

      const result = phase.execute(mockState, mockRng);

      // Should return empty events (crisis info is in metrics)
      expect(result.events).toBeDefined();
      expect(Array.isArray(result.events)).toBe(true);
    });
  });

  describe('Batch 2: System Updates', () => {
    test('GovernanceQualityPhase should execute without error', () => {
      const phase = new GovernanceQualityPhase();

      expect(() => phase.execute(mockState, mockRng)).not.toThrow();
    });

    test('UpwardSpiralsPhase should execute with context', () => {
      const phase = new UpwardSpiralsPhase();
      const context = { month: 10, data: new Map() };

      expect(() => phase.execute(mockState, mockRng, context)).not.toThrow();
    });

    test('NationalAIPhase should execute before MADDeterrencePhase', () => {
      // Verify order numbers
      const nationalAI = new NationalAIPhase();
      const madDeterrence = new MADDeterrencePhase();

      expect(nationalAI.order).toBeLessThan(madDeterrence.order);
      expect(nationalAI.order).toBe(15.0);
      expect(madDeterrence.order).toBe(16.0);
    });

    test('ResourceEconomyPhase should execute before ResourceTechnologyPhase', () => {
      const resourceEcon = new ResourceEconomyPhase();
      const resourceTech = new ResourceTechnologyPhase();

      expect(resourceEcon.order).toBeLessThan(resourceTech.order);
      expect(resourceEcon.order).toBe(17.0);
      expect(resourceTech.order).toBe(18.0);
    });
  });

  describe('Batch 3: Special Phases', () => {
    test('BenchmarkEvaluationsPhase should return events', () => {
      const phase = new BenchmarkEvaluationsPhase();

      const result = phase.execute(mockState, mockRng);

      expect(result.events).toBeDefined();
      expect(Array.isArray(result.events)).toBe(true);
    });

    test('CrisisPointsPhase should handle crisis triggers', () => {
      const phase = new CrisisPointsPhase();

      const result = phase.execute(mockState, mockRng);

      expect(result.events).toBeDefined();
      expect(Array.isArray(result.events)).toBe(true);
    });
  });
});

describe('Phase 4: Order Validation', () => {
  test('all phases should have correct order numbers', () => {
    const phases = [
      { phase: new GovernanceQualityPhase(), expected: 10.0 },
      { phase: new UpwardSpiralsPhase(), expected: 11.0 },
      { phase: new MeaningRenaissancePhase(), expected: 12.0 },
      { phase: new ConflictResolutionPhase(), expected: 13.0 },
      { phase: new DiplomaticAIPhase(), expected: 14.0 },
      { phase: new NationalAIPhase(), expected: 15.0 },
      { phase: new MADDeterrencePhase(), expected: 16.0 },
      { phase: new ResourceEconomyPhase(), expected: 17.0 },
      { phase: new ResourceTechnologyPhase(), expected: 18.0 },
      { phase: new GeoengineringPhase(), expected: 19.0 },
      { phase: new DefensiveAIPhase(), expected: 20.0 },
      { phase: new DystopiaProgressionPhase(), expected: 21.0 },
      { phase: new BenchmarkEvaluationsPhase(), expected: 22.0 },
      { phase: new CrisisPointsPhase(), expected: 23.0 },
      { phase: new UnemploymentPhase(), expected: 30.0 },
      { phase: new EconomicTransitionPhase(), expected: 31.0 },
      { phase: new ParanoiaPhase(), expected: 32.0 },
      { phase: new SocialStabilityPhase(), expected: 33.0 },
      { phase: new QualityOfLifePhase(), expected: 34.0 },
      { phase: new OutcomeProbabilitiesPhase(), expected: 35.0 },
      { phase: new CrisisDetectionPhase(), expected: 36.0 }
    ];

    phases.forEach(({ phase, expected }) => {
      expect(phase.order).toBe(expected);
    });
  });

  test('system update phases execute before calculations', () => {
    const governance = new GovernanceQualityPhase();
    const unemployment = new UnemploymentPhase();

    // System updates (10.x) should come before calculations (30.x)
    expect(governance.order).toBeLessThan(unemployment.order);
  });

  test('special phases execute after system updates', () => {
    const dystopia = new DystopiaProgressionPhase();
    const benchmark = new BenchmarkEvaluationsPhase();

    // Dystopia (21.0) before Benchmark (22.0)
    expect(dystopia.order).toBeLessThan(benchmark.order);
  });
});
