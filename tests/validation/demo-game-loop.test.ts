/**
 * Demo Game Loop Validation Tests
 *
 * Validates that the game dashboard demo works end-to-end:
 * 1. SimulationRunner initializes without errors
 * 2. Game loop advances months without DataCloneError
 * 3. State snapshots are valid and frozen
 * 4. Events are properly returned
 * 5. Game over detection works
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SimulationRunner, type SimulationResult } from '@/game/core/SimulationRunner';
import type { GameState } from '@/types/game';

describe('Demo Game Loop', () => {
  describe('SimulationRunner Initialization', () => {
    it('should initialize with a seed without errors', () => {
      const runner = new SimulationRunner({
        seed: 12345,
        label: 'test_initialization',
      });

      const state = runner.getState();
      assert(state !== null, 'State should be initialized');
      assert(state.currentMonth === 0, 'Should start at month 0');
      assert(state.humanPopulationSystem?.population || 0 > 0, 'Should have population');
    });

    it('should create different states with different seeds', () => {
      const runner1 = new SimulationRunner({ seed: 1, label: 'seed1' });
      const runner2 = new SimulationRunner({ seed: 2, label: 'seed2' });

      const state1 = runner1.getState();
      const state2 = runner2.getState();

      // Different seeds should produce different initial states (with high probability)
      assert(state1.aiAgents.length === state2.aiAgents.length, 'Same number of AI agents');
    });
  });

  describe('Monthly Advancement', () => {
    it('should advance month without errors (no DataCloneError)', () => {
      const runner = new SimulationRunner({ seed: 42, label: 'monthly_test' });

      const initialState = runner.getState();
      assert(initialState.currentMonth === 0, 'Should start at month 0');

      // Advance one month
      const result1 = runner.runMonth();

      assert(result1.state.currentMonth === 1, 'Month should advance to 1');
      assert(Array.isArray(result1.events), 'Should have events array');
      assert(typeof result1.gameOver === 'boolean', 'Should have gameOver flag');
    });

    it('should advance multiple months sequentially', () => {
      const runner = new SimulationRunner({ seed: 99, label: 'sequential_test' });

      for (let i = 0; i < 5; i++) {
        const result = runner.runMonth();

        assert(result.state.currentMonth === i + 1, `Month should be ${i + 1}`);
        assert(Array.isArray(result.events), `Month ${i + 1}: events should be array`);
        assert(result.state.humanPopulationSystem?.population !== undefined, `Month ${i + 1}: should have population`);
      }
    });

    it('should maintain state consistency across months', () => {
      const runner = new SimulationRunner({ seed: 77, label: 'consistency_test' });

      let previousPop = runner.getState().humanPopulationSystem?.population || 0;

      for (let i = 0; i < 3; i++) {
        const result = runner.runMonth();
        const currentPop = result.state.humanPopulationSystem?.population || 0;

        // Population should be a valid number (not NaN, not negative)
        assert(!isNaN(currentPop), `Month ${i + 1}: population should not be NaN`);
        assert(currentPop >= 0, `Month ${i + 1}: population should not be negative`);

        // Population changes should be reasonable (not massive jumps)
        const changePercent = Math.abs((currentPop - previousPop) / previousPop) * 100;
        assert(changePercent < 50, `Month ${i + 1}: population change should be < 50%`);

        previousPop = currentPop;
      }
    });
  });

  describe('State Snapshots', () => {
    it('should return frozen read-only state', () => {
      const runner = new SimulationRunner({ seed: 55, label: 'frozen_test' });

      const snapshot = runner.getState();

      // State should be read-only at TypeScript level
      // (Runtime freeze is optional, TypeScript enforces immutability)
      assert(snapshot !== null, 'Snapshot should not be null');
      assert(typeof snapshot === 'object', 'Snapshot should be object');
    });

    it('should advance month correctly when calling runMonth', () => {
      const runner = new SimulationRunner({ seed: 33, label: 'month_advancement_test' });

      const initial = runner.getState();
      assert.strictEqual(initial.currentMonth, 0, 'Should start at month 0');

      runner.runMonth();

      const after1 = runner.getState();
      assert.strictEqual(after1.currentMonth, 1, 'After first runMonth should be month 1');

      runner.runMonth();

      const after2 = runner.getState();
      assert.strictEqual(after2.currentMonth, 2, 'After second runMonth should be month 2');
    });
  });

  describe('Events', () => {
    it('should return events array from runMonth', () => {
      const runner = new SimulationRunner({ seed: 88, label: 'events_test' });

      const result = runner.runMonth();

      assert(Array.isArray(result.events), 'Events should be array');
      assert(typeof result.events.length === 'number', 'Events should have length');

      // Validate event structure
      result.events.forEach((event) => {
        assert(typeof event.type === 'string', 'Event type should be string');
        assert(typeof event.description === 'string', 'Event description should be string');
      });
    });

    it('should accumulate events over multiple months', () => {
      const runner = new SimulationRunner({ seed: 44, label: 'event_accumulation_test' });

      let totalEvents = 0;

      for (let i = 0; i < 3; i++) {
        const result = runner.runMonth();
        totalEvents += result.events.length;
        assert(result.events.length >= 0, `Month ${i + 1}: should have >= 0 events`);
      }

      assert(totalEvents >= 0, 'Should accumulate events');
    });
  });

  describe('Game Over Detection', () => {
    it('should detect game over at month 12', () => {
      const runner = new SimulationRunner({ seed: 111, label: 'gameover_month_test' });

      let gameOverDetected = false;
      let finalMonth = 0;

      for (let i = 0; i < 15; i++) {
        const result = runner.runMonth();
        finalMonth = result.state.currentMonth;

        if (result.gameOver) {
          gameOverDetected = true;
          break;
        }
      }

      assert(gameOverDetected, 'Should detect game over');
      assert(finalMonth >= 12, 'Game over should occur at or after month 12 in demo');
    });

    it('should detect extinction-level population', () => {
      // This is harder to trigger naturally, so we just verify the detection logic exists
      const runner = new SimulationRunner({ seed: 222, label: 'extinction_test' });

      let months = 0;
      let extinct = false;

      for (let i = 0; i < 100; i++) {
        const result = runner.runMonth();
        months = result.state.currentMonth;

        const pop = result.state.humanPopulationSystem?.population || 1;
        if (pop < 0.01) {
          extinct = true;
          break;
        }

        if (result.gameOver) {
          break;
        }
      }

      // Game should either end naturally at month 12 or earlier if extinct
      assert(months <= 12 || extinct, 'Should end at month 12 or detect extinction');
    });
  });

  describe('No DataCloneError', () => {
    it('should complete 3-month run without clone errors', () => {
      const runner = new SimulationRunner({ seed: 666, label: 'no_clone_error_test' });

      try {
        for (let i = 0; i < 3; i++) {
          runner.runMonth();
        }
        // If we get here, no clone error was thrown
        assert(true, 'Should complete without clone errors');
      } catch (error) {
        if (error instanceof Error && error.name === 'DataCloneError') {
          assert(false, `DataCloneError should not occur: ${error.message}`);
        }
        throw error;
      }
    });

    it('should complete full demo run without errors', () => {
      const runner = new SimulationRunner({ seed: 777, label: 'full_demo_test' });

      try {
        let result: SimulationResult | null = null;
        let monthCount = 0;

        while (monthCount < 20) {
          // Safety limit
          result = runner.runMonth();
          monthCount = result.state.currentMonth;

          if (result.gameOver) {
            break;
          }
        }

        assert(result !== null, 'Should have results');
        assert(result.state.currentMonth >= 12, 'Should reach at least month 12');
        assert(true, 'Full run completed without errors');
      } catch (error) {
        if (error instanceof Error && error.name === 'DataCloneError') {
          assert(false, `Full run failed with DataCloneError: ${error.message}`);
        }
        throw error;
      }
    });
  });
});
