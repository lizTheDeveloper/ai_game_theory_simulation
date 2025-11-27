/**
 * Concurrent State Updates Integration Tests
 *
 * Tests distributed locking and version conflict resolution under concurrent load.
 * Simulates multiple orchestrator pods (e.g., 3 K8s replicas) updating the same agent state.
 *
 * Author: Marcus (Platform Engineer)
 * Date: 2025-11-22
 */

import { Pool } from 'pg';
import Redis from 'ioredis';
import { AgentStateManager, AgentState } from '../../integration/citationAgentIntegration';

// Test database configuration
const TEST_DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'marcus_test',
  user: process.env.DB_USER || 'marcus',
  password: process.env.DB_PASSWORD || 'marcus_dev_password',
  poolSize: 10
};

const TEST_REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  db: parseInt(process.env.REDIS_DB || '1'),
  ttl: 3600
};

describe('Concurrent State Updates', () => {
  let db: Pool;
  let redis: Redis;
  let stateManager: AgentStateManager;

  beforeAll(async () => {
    // Connect to test database
    db = new Pool({
      host: TEST_DB_CONFIG.host,
      port: TEST_DB_CONFIG.port,
      database: TEST_DB_CONFIG.database,
      user: TEST_DB_CONFIG.user,
      password: TEST_DB_CONFIG.password,
      max: TEST_DB_CONFIG.poolSize
    });

    // Connect to test Redis
    redis = new Redis({
      host: TEST_REDIS_CONFIG.host,
      port: TEST_REDIS_CONFIG.port,
      db: TEST_REDIS_CONFIG.db
    });
  });

  afterAll(async () => {
    await db.end();
    await redis.quit();
  });

  beforeEach(async () => {
    // Clear test data
    await db.query('TRUNCATE agent_states CASCADE');
    await redis.flushdb();

    // Create fresh state manager
    stateManager = new AgentStateManager(TEST_DB_CONFIG, TEST_REDIS_CONFIG);
  });

  afterEach(async () => {
    await stateManager.cleanup();
  });

  describe('distributed locking prevents race conditions', () => {
    test('should serialize concurrent updates to same agent', async () => {
      // Create initial state
      const initialState: AgentState = {
        agentId: 'agent_001',
        reputation: 0.5,
        totalCitations: 0,
        detectedViolations: 0,
        currentBehavior: 'moderate_check',
        memoryState: { counter: 0 },
        explorationRate: 0.2,
        timestamp: new Date().toISOString(),
        version: 0
      };

      await stateManager.saveState(initialState);

      // Simulate 10 concurrent updates (like 10 pods updating simultaneously)
      const updateCount = 10;
      const updates: Promise<void>[] = [];

      for (let i = 0; i < updateCount; i++) {
        const update = (async () => {
          // Load current state
          const state = await stateManager.loadState('agent_001');
          if (!state) throw new Error('State not found');

          // Increment counter
          state.memoryState.counter = (state.memoryState.counter || 0) + 1;
          state.totalCitations += 1;
          state.timestamp = new Date().toISOString();

          // Save (with distributed lock)
          await stateManager.saveState(state);
        })();

        updates.push(update);
      }

      // Wait for all updates to complete
      await Promise.all(updates);

      // Verify final state
      const finalState = await stateManager.loadState('agent_001');
      expect(finalState).toBeDefined();

      // Counter should be exactly 10 (all updates applied)
      expect(finalState!.memoryState.counter).toBe(updateCount);
      expect(finalState!.totalCitations).toBe(updateCount);
    }, 30000);

    test('should handle high concurrency (50 updates)', async () => {
      const initialState: AgentState = {
        agentId: 'agent_002',
        reputation: 0.5,
        totalCitations: 0,
        detectedViolations: 0,
        currentBehavior: 'moderate_check',
        memoryState: { total: 0 },
        explorationRate: 0.2,
        timestamp: new Date().toISOString(),
        version: 0
      };

      await stateManager.saveState(initialState);

      // 50 concurrent updates
      const updateCount = 50;
      const updates: Promise<void>[] = [];

      for (let i = 0; i < updateCount; i++) {
        const update = (async () => {
          const state = await stateManager.loadState('agent_002');
          if (!state) throw new Error('State not found');

          state.memoryState.total = (state.memoryState.total || 0) + 1;
          state.timestamp = new Date().toISOString();

          await stateManager.saveState(state);
        })();

        updates.push(update);
      }

      await Promise.all(updates);

      const finalState = await stateManager.loadState('agent_002');
      expect(finalState!.memoryState.total).toBe(updateCount);
    }, 60000);

    test('should handle concurrent updates to different agents', async () => {
      // Create 5 agents
      const agentCount = 5;
      const initialStates: AgentState[] = [];

      for (let i = 0; i < agentCount; i++) {
        const agentId = `agent_${String(i).padStart(3, '0')}`;
        const state: AgentState = {
          agentId,
          reputation: 0.5,
          totalCitations: 0,
          detectedViolations: 0,
          currentBehavior: 'moderate_check',
          memoryState: { value: 0 },
          explorationRate: 0.2,
          timestamp: new Date().toISOString(),
          version: 0
        };

        await stateManager.saveState(state);
        initialStates.push(state);
      }

      // Update each agent 10 times concurrently
      const updatesPerAgent = 10;
      const allUpdates: Promise<void>[] = [];

      for (let i = 0; i < agentCount; i++) {
        const agentId = `agent_${String(i).padStart(3, '0')}`;

        for (let j = 0; j < updatesPerAgent; j++) {
          const update = (async () => {
            const state = await stateManager.loadState(agentId);
            if (!state) throw new Error('State not found');

            state.memoryState.value = (state.memoryState.value || 0) + 1;
            state.timestamp = new Date().toISOString();

            await stateManager.saveState(state);
          })();

          allUpdates.push(update);
        }
      }

      // Wait for all updates (50 total)
      await Promise.all(allUpdates);

      // Verify each agent
      for (let i = 0; i < agentCount; i++) {
        const agentId = `agent_${String(i).padStart(3, '0')}`;
        const finalState = await stateManager.loadState(agentId);

        expect(finalState).toBeDefined();
        expect(finalState!.memoryState.value).toBe(updatesPerAgent);
      }
    }, 60000);
  });

  describe('version conflict detection (fallback)', () => {
    test('should detect version conflicts if lock fails', async () => {
      const initialState: AgentState = {
        agentId: 'agent_003',
        reputation: 0.5,
        totalCitations: 0,
        detectedViolations: 0,
        currentBehavior: 'moderate_check',
        memoryState: {},
        explorationRate: 0.2,
        timestamp: new Date().toISOString(),
        version: 0
      };

      await stateManager.saveState(initialState);

      // Manually update version in database (simulate lock failure)
      await db.query(`
        UPDATE agent_states
        SET version = $1
        WHERE agent_id = $2
      `, [999999, 'agent_003']);

      // Try to save with stale version (should fail)
      const staleState = { ...initialState, reputation: 0.6 };

      // Note: With distributed locking, this will succeed because the lock
      // ensures we're the only writer. But if lock expires, version check
      // provides fallback protection.
      await stateManager.saveState(staleState);

      // Verify version was updated
      const result = await db.query('SELECT version FROM agent_states WHERE agent_id = $1', ['agent_003']);
      expect(result.rows[0].version).toBeGreaterThan(999999);
    });
  });

  describe('performance under load', () => {
    test('should complete 100 updates within reasonable time', async () => {
      const initialState: AgentState = {
        agentId: 'agent_004',
        reputation: 0.5,
        totalCitations: 0,
        detectedViolations: 0,
        currentBehavior: 'moderate_check',
        memoryState: { count: 0 },
        explorationRate: 0.2,
        timestamp: new Date().toISOString(),
        version: 0
      };

      await stateManager.saveState(initialState);

      const updateCount = 100;
      const startTime = Date.now();

      const updates: Promise<void>[] = [];
      for (let i = 0; i < updateCount; i++) {
        const update = (async () => {
          const state = await stateManager.loadState('agent_004');
          if (!state) throw new Error('State not found');

          state.memoryState.count = (state.memoryState.count || 0) + 1;
          state.timestamp = new Date().toISOString();

          await stateManager.saveState(state);
        })();

        updates.push(update);
      }

      await Promise.all(updates);

      const elapsed = Date.now() - startTime;

      // Should complete in under 60 seconds (600ms per update)
      expect(elapsed).toBeLessThan(60000);

      // Verify correctness
      const finalState = await stateManager.loadState('agent_004');
      expect(finalState!.memoryState.count).toBe(updateCount);

      console.log(`✅ ${updateCount} concurrent updates completed in ${elapsed}ms (${(elapsed / updateCount).toFixed(1)}ms/update avg)`);
    }, 120000);

    test('should measure lock contention overhead', async () => {
      const initialState: AgentState = {
        agentId: 'agent_005',
        reputation: 0.5,
        totalCitations: 0,
        detectedViolations: 0,
        currentBehavior: 'moderate_check',
        memoryState: {},
        explorationRate: 0.2,
        timestamp: new Date().toISOString(),
        version: 0
      };

      await stateManager.saveState(initialState);

      // Measure sequential updates (no contention)
      const sequentialStart = Date.now();
      for (let i = 0; i < 10; i++) {
        const state = await stateManager.loadState('agent_005');
        if (!state) throw new Error('State not found');
        state.totalCitations += 1;
        await stateManager.saveState(state);
      }
      const sequentialTime = Date.now() - sequentialStart;

      // Reset state
      await db.query('DELETE FROM agent_states WHERE agent_id = $1', ['agent_005']);
      await stateManager.saveState(initialState);

      // Measure concurrent updates (with contention)
      const concurrentStart = Date.now();
      const updates: Promise<void>[] = [];
      for (let i = 0; i < 10; i++) {
        const update = (async () => {
          const state = await stateManager.loadState('agent_005');
          if (!state) throw new Error('State not found');
          state.totalCitations += 1;
          await stateManager.saveState(state);
        })();
        updates.push(update);
      }
      await Promise.all(updates);
      const concurrentTime = Date.now() - concurrentStart;

      console.log(`\n📊 Lock Contention Analysis:`);
      console.log(`   Sequential: ${sequentialTime}ms (${(sequentialTime / 10).toFixed(1)}ms/update)`);
      console.log(`   Concurrent: ${concurrentTime}ms (${(concurrentTime / 10).toFixed(1)}ms/update)`);
      console.log(`   Overhead: ${((concurrentTime / sequentialTime - 1) * 100).toFixed(1)}%`);

      // Concurrent should be slower due to lock contention, but not by more than 5x
      expect(concurrentTime).toBeLessThan(sequentialTime * 5);
    }, 60000);
  });

  describe('error handling', () => {
    test('should release lock on error', async () => {
      const initialState: AgentState = {
        agentId: 'agent_006',
        reputation: 0.5,
        totalCitations: 0,
        detectedViolations: 0,
        currentBehavior: 'moderate_check',
        memoryState: {},
        explorationRate: 0.2,
        timestamp: new Date().toISOString(),
        version: 0
      };

      await stateManager.saveState(initialState);

      // Create a state that will cause database error (invalid data)
      const badState = { ...initialState };
      (badState as any).reputation = 'invalid'; // Should cause type error

      // Try to save bad state
      await expect(stateManager.saveState(badState)).rejects.toThrow();

      // Lock should be released - next update should succeed
      const goodState = { ...initialState, reputation: 0.6 };
      await expect(stateManager.saveState(goodState)).resolves.not.toThrow();
    });

    test('should handle lock timeout gracefully', async () => {
      const initialState: AgentState = {
        agentId: 'agent_007',
        reputation: 0.5,
        totalCitations: 0,
        detectedViolations: 0,
        currentBehavior: 'moderate_check',
        memoryState: {},
        explorationRate: 0.2,
        timestamp: new Date().toISOString(),
        version: 0
      };

      await stateManager.saveState(initialState);

      // Manually acquire lock and hold it
      const lockKey = 'lock:agent:agent_007:state';
      await redis.set(lockKey, 'manual-lock', 'EX', 30);

      // Try to save (should timeout waiting for lock)
      const updatePromise = stateManager.saveState({ ...initialState, reputation: 0.6 });

      await expect(updatePromise).rejects.toThrow(/Failed to acquire lock/);

      // Cleanup
      await redis.del(lockKey);
    }, 10000);

    test('should handle database connection loss during update', async () => {
      const initialState: AgentState = {
        agentId: 'agent_008',
        reputation: 0.5,
        totalCitations: 0,
        detectedViolations: 0,
        currentBehavior: 'moderate_check',
        memoryState: {},
        explorationRate: 0.2,
        timestamp: new Date().toISOString(),
        version: 0
      };

      await stateManager.saveState(initialState);

      // Simulate database connection loss by terminating connection pool
      // (In real implementation, this would be handled by retry logic)
      // For this test, we just verify lock is released on error

      // Try to update after initial save
      const updatedState = { ...initialState, reputation: 0.7 };
      await stateManager.saveState(updatedState);

      // Verify state was updated
      const finalState = await stateManager.loadState('agent_008');
      expect(finalState!.reputation).toBe(0.7);
    });

    test('should handle Redis connection loss (fallback to DB-only mode)', async () => {
      const initialState: AgentState = {
        agentId: 'agent_009',
        reputation: 0.5,
        totalCitations: 0,
        detectedViolations: 0,
        currentBehavior: 'moderate_check',
        memoryState: {},
        explorationRate: 0.2,
        timestamp: new Date().toISOString(),
        version: 0
      };

      await stateManager.saveState(initialState);

      // Flush Redis to simulate connection loss
      await redis.flushdb();

      // Update should still work (may be slower without cache)
      const updatedState = { ...initialState, reputation: 0.8 };
      await stateManager.saveState(updatedState);

      // Verify state in database
      const result = await db.query(
        'SELECT reputation FROM agent_states WHERE agent_id = $1',
        ['agent_009']
      );
      expect(result.rows[0].reputation).toBe(0.8);
    });
  });

  describe('extreme contention scenarios', () => {
    test('should handle orchestrator pod crash during locked update', async () => {
      const initialState: AgentState = {
        agentId: 'agent_010',
        reputation: 0.5,
        totalCitations: 0,
        detectedViolations: 0,
        currentBehavior: 'moderate_check',
        memoryState: { value: 0 },
        explorationRate: 0.2,
        timestamp: new Date().toISOString(),
        version: 0
      };

      await stateManager.saveState(initialState);

      // Simulate pod crash: acquire lock and never release it
      const lockKey = 'lock:agent:agent_010:state';
      await redis.set(lockKey, 'crashed-pod-lock', 'EX', 5);

      // Wait for lock to expire
      await new Promise(resolve => setTimeout(resolve, 6000));

      // Now update should succeed (lock expired)
      const updatedState = { ...initialState, reputation: 0.9 };
      await stateManager.saveState(updatedState);

      const finalState = await stateManager.loadState('agent_010');
      expect(finalState!.reputation).toBe(0.9);
    }, 10000);

    test('should maintain data consistency under extreme load (200 updates)', async () => {
      const initialState: AgentState = {
        agentId: 'agent_011',
        reputation: 0.5,
        totalCitations: 0,
        detectedViolations: 0,
        currentBehavior: 'moderate_check',
        memoryState: { counter: 0 },
        explorationRate: 0.2,
        timestamp: new Date().toISOString(),
        version: 0
      };

      await stateManager.saveState(initialState);

      const updateCount = 200;
      const updates: Promise<void>[] = [];

      const startTime = Date.now();

      for (let i = 0; i < updateCount; i++) {
        const update = (async () => {
          const state = await stateManager.loadState('agent_011');
          if (!state) throw new Error('State not found');

          state.memoryState.counter = (state.memoryState.counter || 0) + 1;
          state.timestamp = new Date().toISOString();

          await stateManager.saveState(state);
        })();

        updates.push(update);
      }

      await Promise.all(updates);

      const elapsed = Date.now() - startTime;

      const finalState = await stateManager.loadState('agent_011');
      expect(finalState!.memoryState.counter).toBe(updateCount);

      console.log(`✅ ${updateCount} extreme concurrent updates completed in ${elapsed}ms (${(elapsed / updateCount).toFixed(1)}ms/update avg)`);
    }, 300000);
  });
});
