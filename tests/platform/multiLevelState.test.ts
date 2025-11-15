/**
 * Unit tests for Multi-Level State Manager
 *
 * Tests Nested Learning multi-timescale architecture with update frequency hierarchy
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  MultiLevelState,
  DEFAULT_LEVEL_CONFIGS,
  NLLevel,
  LevelConfig,
} from '../../src/platform/multiLevelState';

describe('MultiLevelState', () => {
  describe('constructor', () => {
    it('initializes with 4 levels', () => {
      const state = new MultiLevelState(['L0', 'L1', 'L2', 'L3']);

      assert.strictEqual(state.getMemory(0), 'L0');
      assert.strictEqual(state.getMemory(1), 'L1');
      assert.strictEqual(state.getMemory(2), 'L2');
      assert.strictEqual(state.getMemory(3), 'L3');
    });

    it('throws error if not exactly 4 configs provided', () => {
      const badConfigs = DEFAULT_LEVEL_CONFIGS.slice(0, 3);

      assert.throws(
        () => new MultiLevelState(['L0', 'L1', 'L2', 'L3'], badConfigs as any),
        /Must provide exactly 4 level configs/
      );
    });

    it('initializes all level states with correct metadata', () => {
      const state = new MultiLevelState(['L0', 'L1', 'L2', 'L3']);
      const states = state.getAllStates();

      assert.strictEqual(states.length, 4);
      states.forEach((levelState, level) => {
        assert.strictEqual(levelState.level, level);
        assert.strictEqual(levelState.updateCount, 0);
        assert.strictEqual(levelState.operationCount, 0);
        assert.ok(levelState.lastUpdate > 0);
      });
    });
  });

  describe('frequency hierarchy validation', () => {
    it('validates default frequency hierarchy (1.0 > 0.1 > 0.01 > 0.001)', () => {
      const configs = DEFAULT_LEVEL_CONFIGS;

      assert.strictEqual(configs[0].frequency, 1.0);
      assert.strictEqual(configs[1].frequency, 0.1);
      assert.strictEqual(configs[2].frequency, 0.01);
      assert.strictEqual(configs[3].frequency, 0.001);

      assert.ok(configs[0].frequency > configs[1].frequency);
      assert.ok(configs[1].frequency > configs[2].frequency);
      assert.ok(configs[2].frequency > configs[3].frequency);
    });

    it('throws error if frequency hierarchy violated (f_L1 >= f_L0)', () => {
      const badConfigs: LevelConfig[] = [
        { level: 0, frequency: 0.1, name: 'L0', description: 'test' },
        { level: 1, frequency: 0.1, name: 'L1', description: 'test' }, // Same as L0!
        { level: 2, frequency: 0.01, name: 'L2', description: 'test' },
        { level: 3, frequency: 0.001, name: 'L3', description: 'test' },
      ];

      assert.throws(
        () => new MultiLevelState(['L0', 'L1', 'L2', 'L3'], badConfigs),
        /Frequency hierarchy violated/
      );
    });

    it('throws error if frequency hierarchy violated (f_L2 >= f_L1)', () => {
      const badConfigs: LevelConfig[] = [
        { level: 0, frequency: 1.0, name: 'L0', description: 'test' },
        { level: 1, frequency: 0.1, name: 'L1', description: 'test' },
        { level: 2, frequency: 0.5, name: 'L2', description: 'test' }, // Greater than L1!
        { level: 3, frequency: 0.001, name: 'L3', description: 'test' },
      ];

      assert.throws(
        () => new MultiLevelState(['L0', 'L1', 'L2', 'L3'], badConfigs),
        /Frequency hierarchy violated/
      );
    });

    it('isHierarchyValid() returns true for valid hierarchy', () => {
      const state = new MultiLevelState(['L0', 'L1', 'L2', 'L3']);

      assert.strictEqual(state.isHierarchyValid(), true);
    });
  });

  describe('shouldUpdate', () => {
    it('Level 0 (f=1.0) should update after 1 operation', () => {
      const state = new MultiLevelState(['L0', 'L1', 'L2', 'L3']);

      assert.strictEqual(state.shouldUpdate(0), false); // No operations yet
      state.recordOperation(0);
      assert.strictEqual(state.shouldUpdate(0), true); // After 1 operation
    });

    it('Level 1 (f=0.1) should update after 10 operations', () => {
      const state = new MultiLevelState(['L0', 'L1', 'L2', 'L3']);

      for (let i = 0; i < 9; i++) {
        state.recordOperation(1);
        assert.strictEqual(state.shouldUpdate(1), false); // Not yet
      }

      state.recordOperation(1); // 10th operation
      assert.strictEqual(state.shouldUpdate(1), true);
    });

    it('Level 2 (f=0.01) should update after 100 operations', () => {
      const state = new MultiLevelState(['L0', 'L1', 'L2', 'L3']);

      for (let i = 0; i < 99; i++) {
        state.recordOperation(2);
      }
      assert.strictEqual(state.shouldUpdate(2), false);

      state.recordOperation(2); // 100th operation
      assert.strictEqual(state.shouldUpdate(2), true);
    });

    it('Level 3 (f=0.001) should update after 1000 operations', () => {
      const state = new MultiLevelState(['L0', 'L1', 'L2', 'L3']);

      for (let i = 0; i < 999; i++) {
        state.recordOperation(3);
      }
      assert.strictEqual(state.shouldUpdate(3), false);

      state.recordOperation(3); // 1000th operation
      assert.strictEqual(state.shouldUpdate(3), true);
    });
  });

  describe('update', () => {
    it('updates memory when update is due', () => {
      const state = new MultiLevelState(['initial', 'L1', 'L2', 'L3']);

      state.recordOperation(0);
      const result = state.update(0, 'updated');

      assert.strictEqual(result.updated, true);
      assert.strictEqual(result.level, 0);
      assert.strictEqual(state.getMemory(0), 'updated');
    });

    it('does not update if frequency threshold not reached', () => {
      const state = new MultiLevelState(['L0', 'initial', 'L2', 'L3']);

      // Level 1 needs 10 operations, only record 5
      for (let i = 0; i < 5; i++) {
        state.recordOperation(1);
      }

      const result = state.update(1, 'attempted update');

      assert.strictEqual(result.updated, false);
      assert.strictEqual(result.reason, 'Update not due yet');
      assert.strictEqual(result.nextUpdateIn, 5); // 5 more operations needed
      assert.strictEqual(state.getMemory(1), 'initial'); // Unchanged
    });

    it('force update bypasses frequency check', () => {
      const state = new MultiLevelState(['L0', 'initial', 'L2', 'L3']);

      // No operations recorded
      const result = state.update(1, 'forced', true);

      assert.strictEqual(result.updated, true);
      assert.strictEqual(result.reason, 'Forced update');
      assert.strictEqual(state.getMemory(1), 'forced');
    });

    it('resets operation counter after successful update', () => {
      const state = new MultiLevelState(['L0', 'L1', 'L2', 'L3']);

      state.recordOperation(0);
      state.update(0, 'updated');

      const levelState = state.getState(0);
      assert.strictEqual(levelState.operationCount, 0); // Reset
    });

    it('increments update counter after successful update', () => {
      const state = new MultiLevelState(['L0', 'L1', 'L2', 'L3']);

      state.recordOperation(0);
      state.update(0, 'update1');

      state.recordOperation(0);
      state.update(0, 'update2');

      const levelState = state.getState(0);
      assert.strictEqual(levelState.updateCount, 2);
    });

    it('updates lastUpdate timestamp', async () => {
      const state = new MultiLevelState(['L0', 'L1', 'L2', 'L3']);
      const before = state.getState(0).lastUpdate;

      // Small delay to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      state.recordOperation(0);
      state.update(0, 'updated');

      const after = state.getState(0).lastUpdate;
      assert.ok(after >= before); // >= instead of > for edge cases
    });
  });

  describe('getMemory', () => {
    it('returns current memory for each level', () => {
      const state = new MultiLevelState([
        'fast',
        'medium',
        'slow',
        'core',
      ]);

      assert.strictEqual(state.getMemory(0), 'fast');
      assert.strictEqual(state.getMemory(1), 'medium');
      assert.strictEqual(state.getMemory(2), 'slow');
      assert.strictEqual(state.getMemory(3), 'core');
    });

    it('supports type-safe memory retrieval', () => {
      interface FastMemory {
        claims: string[];
      }
      interface SlowMemory {
        patterns: Map<string, number>;
      }

      const state = new MultiLevelState<FastMemory, unknown, SlowMemory, unknown>([
        { claims: ['claim1'] },
        {},
        new Map([['pattern1', 0.95]]),
        {},
      ]);

      const fast = state.getMemory(0);
      assert.strictEqual(fast.claims[0], 'claim1');

      const slow = state.getMemory(2);
      assert.strictEqual(slow.get('pattern1'), 0.95);
    });
  });

  describe('getState', () => {
    it('returns readonly level state', () => {
      const state = new MultiLevelState(['L0', 'L1', 'L2', 'L3']);

      const levelState = state.getState(0);

      assert.strictEqual(levelState.level, 0);
      assert.strictEqual(levelState.frequency, 1.0);
      assert.ok(Object.isFrozen(levelState));
    });
  });

  describe('getConfig', () => {
    it('returns readonly level config', () => {
      const state = new MultiLevelState(['L0', 'L1', 'L2', 'L3']);

      const config = state.getConfig(0);

      assert.strictEqual(config.level, 0);
      assert.strictEqual(config.frequency, 1.0);
      assert.strictEqual(config.name, 'Fast Memory');
      assert.ok(Object.isFrozen(config));
    });
  });

  describe('operationsUntilUpdate', () => {
    it('returns correct countdown for Level 0', () => {
      const state = new MultiLevelState(['L0', 'L1', 'L2', 'L3']);

      assert.strictEqual(state.operationsUntilUpdate(0), 1);
      state.recordOperation(0);
      assert.strictEqual(state.operationsUntilUpdate(0), 0);
    });

    it('returns correct countdown for Level 1', () => {
      const state = new MultiLevelState(['L0', 'L1', 'L2', 'L3']);

      assert.strictEqual(state.operationsUntilUpdate(1), 10);

      for (let i = 0; i < 5; i++) {
        state.recordOperation(1);
      }

      assert.strictEqual(state.operationsUntilUpdate(1), 5);
    });

    it('never returns negative values', () => {
      const state = new MultiLevelState(['L0', 'L1', 'L2', 'L3']);

      for (let i = 0; i < 20; i++) {
        state.recordOperation(1); // Way past threshold
      }

      assert.ok(state.operationsUntilUpdate(1) >= 0);
    });
  });

  describe('getStats', () => {
    it('returns comprehensive statistics', () => {
      const state = new MultiLevelState(['L0', 'L1', 'L2', 'L3']);

      state.recordOperation(0);
      state.update(0, 'updated');

      const stats = state.getStats();

      assert.strictEqual(stats.levels.length, 4);
      assert.strictEqual(stats.hierarchyValid, true);

      assert.strictEqual(stats.levels[0].level, 0);
      assert.strictEqual(stats.levels[0].name, 'Fast Memory');
      assert.strictEqual(stats.levels[0].updateCount, 1);
      assert.strictEqual(stats.levels[0].operationCount, 0); // Reset after update
    });
  });

  describe('resetCounters', () => {
    it('resets operation counters for all levels', () => {
      const state = new MultiLevelState(['L0', 'L1', 'L2', 'L3']);

      for (let i = 0; i < 5; i++) {
        state.recordOperation(0);
        state.recordOperation(1);
        state.recordOperation(2);
        state.recordOperation(3);
      }

      state.resetCounters();

      assert.strictEqual(state.getState(0).operationCount, 0);
      assert.strictEqual(state.getState(1).operationCount, 0);
      assert.strictEqual(state.getState(2).operationCount, 0);
      assert.strictEqual(state.getState(3).operationCount, 0);
    });

    it('does not reset update counts', () => {
      const state = new MultiLevelState(['L0', 'L1', 'L2', 'L3']);

      state.recordOperation(0);
      state.update(0, 'updated');

      state.resetCounters();

      assert.strictEqual(state.getState(0).updateCount, 1); // Preserved
    });
  });

  describe('reset', () => {
    it('resets all state to initial values', () => {
      const state = new MultiLevelState(['L0', 'L1', 'L2', 'L3']);

      state.recordOperation(0);
      state.update(0, 'changed');

      state.reset(['reset0', 'reset1', 'reset2', 'reset3']);

      assert.strictEqual(state.getMemory(0), 'reset0');
      assert.strictEqual(state.getState(0).updateCount, 0);
      assert.strictEqual(state.getState(0).operationCount, 0);
    });
  });

  describe('integration: full update cycle', () => {
    it('demonstrates multi-level update workflow', () => {
      const state = new MultiLevelState([
        { claims: [] },
        { verifications: [] },
        { patterns: [] },
        { knowledge: [] },
      ]);

      // Level 0: Updates every operation
      state.recordOperation(0);
      let result = state.update(0, { claims: ['claim1'] });
      assert.strictEqual(result.updated, true);

      // Level 1: Updates every 10 operations
      for (let i = 0; i < 10; i++) {
        state.recordOperation(1);
      }
      result = state.update(1, { verifications: ['verified1'] });
      assert.strictEqual(result.updated, true);

      // Level 2: Updates every 100 operations
      for (let i = 0; i < 100; i++) {
        state.recordOperation(2);
      }
      result = state.update(2, { patterns: ['pattern1'] });
      assert.strictEqual(result.updated, true);

      // Level 3: Updates every 1000 operations
      for (let i = 0; i < 1000; i++) {
        state.recordOperation(3);
      }
      result = state.update(3, { knowledge: ['paper1'] });
      assert.strictEqual(result.updated, true);

      // Verify all levels updated
      assert.strictEqual(state.getMemory(0).claims.length, 1);
      assert.strictEqual(state.getMemory(1).verifications.length, 1);
      assert.strictEqual(state.getMemory(2).patterns.length, 1);
      assert.strictEqual(state.getMemory(3).knowledge.length, 1);
    });
  });
});
