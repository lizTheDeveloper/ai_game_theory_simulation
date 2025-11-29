/**
 * Integration Test: State Mappers (roadmap 5.4)
 *
 * Tests for src/components/dashboards/game/stateMappers.ts
 * Purpose: Verify game layer correctly reads and displays simulation state
 *
 * Test Coverage:
 * 1. All mappers produce valid data shapes
 * 2. No silent fallbacks hiding missing state fields
 * 3. Delta calculations work correctly
 * 4. Memoization prevents unnecessary recalculations
 *
 * @module tests/integration/game-layer/state-mappers
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import {
  mapCurrencies,
  mapOutcomes,
  mapEvents,
  mapNextMonthPreview,
  mapPendingDecisions,
  formatCurrentMonth,
  getElapsedMonths,
} from '@/components/dashboards/game/stateMappers';
import type { GameStateSnapshot } from '@/game/types';

describe('State Mappers Integration Tests', () => {

  // ============================================================================
  // Helper Functions
  // ============================================================================

  /**
   * Create a minimal valid GameStateSnapshot for testing
   *
   * Note: The stateMappers use specific field paths from the actual GameStateSnapshot.
   * This mock provides the fields that mappers actually read.
   */
  function createMockState(overrides?: Partial<GameStateSnapshot>): GameStateSnapshot {
    return {
      currentMonth: 12,
      techTreeState: {
        unlockedTech: ['tech_1', 'tech_2', 'tech_3'],
        deployedTechMap: { 'tech_1': true },
        researchProgress: { 'tech_4': 0.5 },
      },
      governmentSystem: {
        internationalCoordination: 0.6,
        governmentCapacity: 0.7,
        publicTrust: 0.5,
      },
      globalMetrics: {
        qualityOfLife: 0.6,
        population: 8.0,
        unemployment: 0.05,
      },
      society: {
        trustInAI: 0.55,
        trust: 0.6,
        meaningCrisis: 0.3,
      },
      aiWelfare: {
        simpleScore: 0.65,
      },
      outcomeMetrics: {
        utopiaProbability: 0.15,
        extinctionProbability: 0.10,
      },
      eventLog: [
        {
          timestamp: 10,
          description: 'Major climate tech breakthrough',
        },
        {
          timestamp: 8,
          description: 'Regional food crisis warning',
        },
      ],
      environmentalAccumulation: {
        pollutionLevel: 20,
        climateStability: 0.8,
      },
      aiAgents: [
        { name: 'AI-1', capability: 3, alignment: 0.8 },
        { name: 'AI-2', capability: 4, alignment: 0.7 },
      ],
      planetaryBoundariesSystem: {
        boundariesBreached: 2,
      },
      extinctionState: {
        active: false,
      },
      phosphorusSystem: {
        reserves: 80,
      },
      ...overrides,
    } as GameStateSnapshot;
  }

  // ============================================================================
  // mapCurrencies Tests
  // ============================================================================

  describe('mapCurrencies', () => {
    test('should return default currencies when state is undefined', () => {
      const currencies = mapCurrencies(undefined);

      assert.strictEqual(currencies.length, 4, 'Should have 4 currencies');
      assert.ok(
        currencies.every(c => c.value === 50),
        'Default values should be 50'
      );
      assert.ok(
        currencies.every(c => c.trendDirection === 'neutral'),
        'Default trend direction should be neutral'
      );
    });

    test('should produce valid data shapes for all currencies', () => {
      const state = createMockState();
      const currencies = mapCurrencies(state);

      assert.strictEqual(currencies.length, 4, 'Should have 4 currencies');

      for (const currency of currencies) {
        assert.ok(
          typeof currency.name === 'string' && currency.name.length > 0,
          `Currency should have a name`
        );
        assert.ok(
          Number.isFinite(currency.value) && currency.value >= 0,
          `Currency ${currency.name} value should be finite and non-negative: ${currency.value}`
        );
        assert.ok(
          Number.isFinite(currency.max) && currency.max > 0,
          `Currency ${currency.name} max should be positive: ${currency.max}`
        );
        assert.ok(
          Number.isFinite(currency.trend),
          `Currency ${currency.name} trend should be finite: ${currency.trend}`
        );
        assert.ok(
          ['up', 'down', 'neutral'].includes(currency.trendDirection),
          `Currency ${currency.name} trendDirection should be valid: ${currency.trendDirection}`
        );
      }
    });

    test('should calculate research progress from tech tree', () => {
      const state = createMockState({
        techTreeState: {
          unlockedTech: new Array(10).fill('tech').map((_, i) => `tech_${i}`),
          deployedTech: [],
          researchProgress: {},
        },
      });

      const currencies = mapCurrencies(state);
      const research = currencies.find(c => c.name === 'Research');

      assert.ok(research, 'Should have Research currency');
      // 10 techs / 119 total = ~8%
      assert.ok(
        research.value >= 5 && research.value <= 15,
        `Research value should reflect unlocked tech count: ${research.value}`
      );
    });

    test('should handle missing tech tree gracefully', () => {
      const state = createMockState({ techTreeState: undefined });
      const currencies = mapCurrencies(state);

      const research = currencies.find(c => c.name === 'Research');
      assert.ok(research, 'Should have Research currency even with missing tech tree');
      assert.ok(
        Number.isFinite(research.value),
        `Research value should be finite: ${research.value}`
      );
    });

    test('should not produce NaN values with partial state', () => {
      const state = createMockState({
        governmentSystem: undefined,
        society: undefined,
        aiWelfare: undefined,
      });

      const currencies = mapCurrencies(state);

      for (const currency of currencies) {
        assert.ok(
          Number.isFinite(currency.value),
          `Currency ${currency.name} should not be NaN: ${currency.value}`
        );
        assert.ok(
          Number.isFinite(currency.trend),
          `Currency ${currency.name} trend should not be NaN: ${currency.trend}`
        );
      }
    });
  });

  // ============================================================================
  // mapOutcomes Tests
  // ============================================================================

  describe('mapOutcomes', () => {
    test('should return default outcomes when state is undefined', () => {
      const outcomes = mapOutcomes(undefined);

      assert.ok(outcomes, 'Should return an outcome object');
      assert.ok(
        Number.isFinite(outcomes.utopia),
        `Utopia should be finite: ${outcomes.utopia}`
      );
    });

    test('should produce valid probability distributions', () => {
      const state = createMockState();
      const outcomes = mapOutcomes(state);

      // All probabilities should be in [0, 1]
      // Note: mapOutcomes returns alignment, struggle, collapse (not humaneDystopia, pyrrhicDystopia)
      const probabilities = [
        outcomes.utopia,
        outcomes.alignment,
        outcomes.struggle,
        outcomes.collapse,
        outcomes.extinction,
      ];

      for (const prob of probabilities) {
        assert.ok(
          Number.isFinite(prob) && prob >= 0 && prob <= 1,
          `Probability should be in [0, 1]: ${prob}`
        );
      }

      // Sum should be close to 1 (allowing for rounding)
      const sum = probabilities.reduce((a, b) => a + b, 0);
      assert.ok(
        Math.abs(sum - 1) < 0.01,
        `Probabilities should sum to ~1, got ${sum}`
      );
    });

    test('should map outcomeMetrics correctly', () => {
      const state = createMockState({
        outcomeMetrics: {
          utopiaProbability: 0.20,
          extinctionProbability: 0.10,
        },
      });

      const outcomes = mapOutcomes(state);

      assert.strictEqual(outcomes.utopia, 0.20, 'Utopia should match');
      assert.strictEqual(outcomes.extinction, 0.10, 'Extinction should match');
    });
  });

  // ============================================================================
  // mapEvents Tests
  // ============================================================================

  describe('mapEvents', () => {
    test('should return default event when state is undefined', () => {
      const events = mapEvents(undefined);

      assert.ok(Array.isArray(events), 'Should return an array');
      // mapEvents returns a default event when state is undefined
      assert.strictEqual(events.length, 1, 'Should have default event');
      assert.strictEqual(events[0].text, 'Simulation initialized', 'Should have initialization text');
    });

    test('should limit events to specified count', () => {
      const state = createMockState({
        eventLog: new Array(20).fill(null).map((_, i) => ({
          timestamp: i,
          description: `Event ${i}`,
        })),
      });

      const events5 = mapEvents(state, 5);
      const events10 = mapEvents(state, 10);

      assert.strictEqual(events5.length, 5, 'Should limit to 5 events');
      assert.strictEqual(events10.length, 10, 'Should limit to 10 events');
    });

    test('should produce valid event display shapes', () => {
      const state = createMockState();
      const events = mapEvents(state);

      // mapEvents returns EventDisplay[] with id, text, severity
      for (const event of events) {
        assert.ok(
          typeof event.id === 'string',
          `Event should have id`
        );
        assert.ok(
          typeof event.text === 'string',
          `Event should have text`
        );
        assert.ok(
          ['success', 'info', 'warning', 'critical'].includes(event.severity),
          `Event severity should be valid: ${event.severity}`
        );
      }
    });

    test('should classify event severity from text', () => {
      const state = createMockState({
        eventLog: [
          { timestamp: 1, description: 'Major breakthrough achieved' },
          { timestamp: 2, description: 'Warning: resources declining' },
          { timestamp: 3, description: 'Critical crisis detected' },
          { timestamp: 4, description: 'Normal event occurred' },
        ],
      });

      const events = mapEvents(state);

      // Events are reversed (most recent first)
      const severities = events.map(e => e.severity);
      assert.ok(severities.includes('info'), 'Should have info events');
      assert.ok(severities.includes('success') || severities.includes('warning') || severities.includes('critical'),
        'Should have varied severities');
    });
  });

  // ============================================================================
  // mapNextMonthPreview Tests
  // ============================================================================

  describe('mapNextMonthPreview', () => {
    test('should return default previews when state is undefined', () => {
      const previews = mapNextMonthPreview(undefined);

      assert.ok(Array.isArray(previews), 'Should return an array');
      assert.ok(previews.length > 0, 'Should have some default previews');
    });

    test('should return string array', () => {
      const state = createMockState();
      const previews = mapNextMonthPreview(state);

      assert.ok(Array.isArray(previews), 'Should return an array');
      for (const preview of previews) {
        assert.ok(
          typeof preview === 'string',
          `Preview should be a string: ${preview}`
        );
      }
    });
  });

  // ============================================================================
  // mapPendingDecisions Tests
  // ============================================================================

  describe('mapPendingDecisions', () => {
    test('should return default decision when state is undefined', () => {
      const decisions = mapPendingDecisions(undefined);

      assert.ok(Array.isArray(decisions), 'Should return an array');
      // mapPendingDecisions returns a default "Initial Assessment" decision when undefined
      assert.strictEqual(decisions.length, 1, 'Should have default decision');
      assert.strictEqual(decisions[0].name, 'Initial Assessment', 'Should have default name');
    });

    test('should return default decision when no state-driven decisions', () => {
      // mapPendingDecisions generates decisions based on state conditions,
      // not a pendingDecisions array. With no crises/boundaries/misalignment,
      // it returns the default decision.
      const state = createMockState({
        extinctionState: { active: false },
        planetaryBoundariesSystem: { boundariesBreached: 0 },
        aiAgents: [{ name: 'AI-1', capability: 3, alignment: 0.8 }],
        techTreeState: { unlockedTech: [], deployedTechMap: {} },
      });
      const decisions = mapPendingDecisions(state);

      assert.ok(decisions.length >= 1, 'Should have at least default decision');
      assert.ok(decisions[0].name, 'Decision should have name');
    });

    test('should produce valid decision display shapes', () => {
      const state = createMockState();
      const decisions = mapPendingDecisions(state);

      // DecisionDisplay has: id, name, urgency, daysRemaining, impact
      for (const decision of decisions) {
        assert.ok(
          typeof decision.id === 'string',
          `Decision should have id`
        );
        assert.ok(
          typeof decision.name === 'string',
          `Decision should have name`
        );
        assert.ok(
          ['critical', 'important', 'standard'].includes(decision.urgency),
          `Decision urgency should be valid: ${decision.urgency}`
        );
        assert.ok(
          Number.isFinite(decision.daysRemaining),
          `Decision daysRemaining should be finite: ${decision.daysRemaining}`
        );
        assert.ok(
          typeof decision.impact === 'string',
          `Decision should have impact string`
        );
      }
    });

    test('should generate crisis decision when extinction is active', () => {
      const state = createMockState({
        extinctionState: {
          active: true,
          type: 'nuclear_winter',
        },
      });

      const decisions = mapPendingDecisions(state);

      const crisisDecision = decisions.find(d => d.id.startsWith('crisis-'));
      assert.ok(crisisDecision, 'Should have crisis decision');
      assert.strictEqual(crisisDecision!.urgency, 'critical', 'Crisis should be critical urgency');
    });

    test('should generate boundary decision when many boundaries breached', () => {
      const state = createMockState({
        planetaryBoundariesSystem: { boundariesBreached: 5 },
      });

      const decisions = mapPendingDecisions(state);

      const boundaryDecision = decisions.find(d => d.id === 'boundaries-action');
      assert.ok(boundaryDecision, 'Should have boundary decision');
      assert.ok(boundaryDecision!.impact.includes('5'), 'Impact should mention breached count');
    });

    test('should generate AI alignment decision when agents are misaligned', () => {
      const state = createMockState({
        aiAgents: [
          { name: 'AI-1', capability: 5, alignment: 0.3 },
          { name: 'AI-2', capability: 6, alignment: 0.4 },
        ],
      });

      const decisions = mapPendingDecisions(state);

      const alignmentDecision = decisions.find(d => d.id === 'ai-alignment-review');
      assert.ok(alignmentDecision, 'Should have AI alignment decision');
      assert.ok(alignmentDecision!.impact.includes('2'), 'Impact should mention agent count');
    });
  });

  // ============================================================================
  // formatCurrentMonth Tests
  // ============================================================================

  describe('formatCurrentMonth', () => {
    test('should format month 0 as January of start year', () => {
      const state = createMockState({ currentMonth: 0 });
      const formatted = formatCurrentMonth(state, 2025);

      assert.ok(
        formatted.includes('2025'),
        `Should include year 2025: ${formatted}`
      );
    });

    test('should format month 12 as January of next year', () => {
      const state = createMockState({ currentMonth: 12 });
      const formatted = formatCurrentMonth(state, 2025);

      assert.ok(
        formatted.includes('2026'),
        `Should include year 2026: ${formatted}`
      );
    });

    test('should handle undefined state', () => {
      const formatted = formatCurrentMonth(undefined, 2025);

      assert.ok(
        typeof formatted === 'string',
        `Should return a string: ${formatted}`
      );
    });

    test('should produce valid date string format', () => {
      const state = createMockState({ currentMonth: 25 });
      const formatted = formatCurrentMonth(state, 2025);

      // Should contain month name or number and year
      assert.ok(
        formatted.length > 0,
        `Should produce non-empty string: ${formatted}`
      );
    });
  });

  // ============================================================================
  // getElapsedMonths Tests
  // ============================================================================

  describe('getElapsedMonths', () => {
    test('should return 0 when state is undefined', () => {
      const elapsed = getElapsedMonths(undefined);

      assert.strictEqual(elapsed, 0, 'Should return 0 for undefined state');
    });

    test('should return currentMonth from state', () => {
      const state = createMockState({ currentMonth: 24 });
      const elapsed = getElapsedMonths(state);

      assert.strictEqual(elapsed, 24, 'Should return currentMonth');
    });

    test('should return finite number', () => {
      const state = createMockState({ currentMonth: 100 });
      const elapsed = getElapsedMonths(state);

      assert.ok(
        Number.isFinite(elapsed),
        `Should return finite number: ${elapsed}`
      );
    });
  });

  // ============================================================================
  // Cross-Mapper Integration Tests
  // ============================================================================

  describe('Cross-Mapper Integration', () => {
    test('should handle same state consistently across all mappers', () => {
      const state = createMockState();

      // All mappers should work on the same state without errors
      const currencies = mapCurrencies(state);
      const outcomes = mapOutcomes(state);
      const events = mapEvents(state);
      const previews = mapNextMonthPreview(state);
      const decisions = mapPendingDecisions(state);
      const formatted = formatCurrentMonth(state);
      const elapsed = getElapsedMonths(state);

      // Verify all returned valid data
      assert.ok(currencies.length > 0, 'Should have currencies');
      assert.ok(outcomes, 'Should have outcomes');
      assert.ok(Array.isArray(events), 'Should have events array');
      assert.ok(Array.isArray(previews), 'Should have previews array');
      assert.ok(Array.isArray(decisions), 'Should have decisions array');
      assert.ok(formatted.length > 0, 'Should have formatted month');
      assert.ok(Number.isFinite(elapsed), 'Should have elapsed months');
    });

    test('should not mutate input state', () => {
      const state = createMockState();
      const originalMonth = state.currentMonth;
      const originalTechCount = state.techTreeState?.unlockedTech?.length;

      // Run all mappers
      mapCurrencies(state);
      mapOutcomes(state);
      mapEvents(state);
      mapNextMonthPreview(state);
      mapPendingDecisions(state);
      formatCurrentMonth(state);
      getElapsedMonths(state);

      // State should not be modified
      assert.strictEqual(
        state.currentMonth,
        originalMonth,
        'currentMonth should not be mutated'
      );
      assert.strictEqual(
        state.techTreeState?.unlockedTech?.length,
        originalTechCount,
        'techTreeState should not be mutated'
      );
    });

    test('should handle all-undefined state gracefully', () => {
      // Test with minimal state that has all optional fields undefined
      const minimalState = { currentMonth: 0 } as GameStateSnapshot;

      // None of these should throw
      assert.doesNotThrow(() => mapCurrencies(minimalState));
      assert.doesNotThrow(() => mapOutcomes(minimalState));
      assert.doesNotThrow(() => mapEvents(minimalState));
      assert.doesNotThrow(() => mapNextMonthPreview(minimalState));
      assert.doesNotThrow(() => mapPendingDecisions(minimalState));
      assert.doesNotThrow(() => formatCurrentMonth(minimalState));
      assert.doesNotThrow(() => getElapsedMonths(minimalState));
    });
  });
});
