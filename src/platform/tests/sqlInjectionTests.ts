/**
 * SQL Injection Security Tests for MARCUS Platform
 *
 * These tests verify that the platform is protected against SQL injection
 * attacks by attempting various injection payloads and confirming they
 * are safely escaped.
 *
 * Security Test Coverage:
 * - Classic SQL injection ('; DROP TABLE)
 * - Boolean-based blind injection
 * - Time-based blind injection
 * - UNION-based injection
 * - Comment-based injection
 * - Parameterized query verification
 *
 * Author: Marcus (Platform Engineer)
 * Date: 2025-11-17
 */

import { Pool as PostgresPool } from 'pg';
import Redis from 'ioredis';
import { AgentStateManager, AgentState, PlatformConfig } from '../integration/citationAgentIntegration';

// ============================================================================
// Test Configuration
// ============================================================================

const TEST_DB_CONFIG: PlatformConfig['database'] = {
  host: process.env.TEST_DB_HOST || 'localhost',
  port: parseInt(process.env.TEST_DB_PORT || '5432'),
  database: process.env.TEST_DB_NAME || 'citations_test',
  user: process.env.TEST_DB_USER || 'postgres',
  password: process.env.TEST_DB_PASSWORD || 'password',
  poolSize: 5
};

const TEST_REDIS_CONFIG: PlatformConfig['redis'] = {
  host: process.env.TEST_REDIS_HOST || 'localhost',
  port: parseInt(process.env.TEST_REDIS_PORT || '6379'),
  db: parseInt(process.env.TEST_REDIS_DB || '1'),
  ttl: 3600
};

// ============================================================================
// SQL Injection Attack Payloads
// ============================================================================

/**
 * Common SQL injection attack patterns.
 *
 * These should all be safely escaped by parameterized queries.
 */
const SQL_INJECTION_PAYLOADS = [
  // Classic injection
  "'; DROP TABLE agent_states; --",
  "' OR '1'='1",
  "' OR 1=1--",
  "admin'--",
  "admin' #",

  // Boolean-based blind
  "' AND 1=1--",
  "' AND 'x'='x",
  "') OR ('x'='x",

  // UNION-based
  "' UNION SELECT NULL, NULL, NULL--",
  "' UNION SELECT username, password FROM users--",

  // Stacked queries
  "'; DELETE FROM agent_states WHERE '1'='1",
  "'; INSERT INTO agent_states VALUES ('hacked', 1.0, 0, 0, 'bad', '{}', 0.5, NOW(), 0)--",

  // Comment-based
  "admin'/*",
  "admin'-- -",

  // Time-based blind
  "'; WAITFOR DELAY '00:00:05'--",
  "'; SELECT pg_sleep(5)--",

  // Special characters
  "\\'; DROP TABLE agent_states; --",
  "'; \\x27; DROP TABLE agent_states; --",

  // Second-order injection (data stored, executed later)
  "test\\'; DROP TABLE agent_states; --",

  // PostgreSQL-specific
  "'; SELECT version(); --",
  "'; SELECT * FROM pg_tables; --"
];

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Create test database schema.
 */
async function setupTestDatabase(pool: PostgresPool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS agent_states (
      agent_id VARCHAR(50) PRIMARY KEY,
      reputation FLOAT NOT NULL DEFAULT 0.5,
      total_citations INTEGER NOT NULL DEFAULT 0,
      detected_violations INTEGER NOT NULL DEFAULT 0,
      current_behavior VARCHAR(50),
      memory_state JSONB NOT NULL,
      exploration_rate FLOAT NOT NULL DEFAULT 0.2,
      timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
      version BIGINT NOT NULL DEFAULT 0,

      CONSTRAINT reputation_range CHECK (reputation >= 0 AND reputation <= 1),
      CONSTRAINT exploration_range CHECK (exploration_rate >= 0 AND exploration_rate <= 1)
    );

    CREATE INDEX IF NOT EXISTS idx_agent_reputation ON agent_states(reputation DESC);
    CREATE INDEX IF NOT EXISTS idx_agent_timestamp ON agent_states(timestamp DESC);
  `);
}

/**
 * Clean test data.
 */
async function cleanupTestDatabase(pool: PostgresPool): Promise<void> {
  await pool.query('DELETE FROM agent_states WHERE agent_id LIKE $1', ['test_%']);
}

/**
 * Verify table integrity after injection attempt.
 */
async function verifyTableIntegrity(pool: PostgresPool): Promise<boolean> {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) as count FROM agent_states
    `);
    return result.rows[0].count >= 0;
  } catch (err) {
    console.error('Table integrity check failed:', err);
    return false;
  }
}

// ============================================================================
// Test Cases
// ============================================================================

describe('SQL Injection Security Tests', () => {
  let stateManager: AgentStateManager;
  let pool: PostgresPool;
  let redis: Redis;

  beforeAll(async () => {
    // Initialize database pool
    pool = new PostgresPool(TEST_DB_CONFIG);

    // Initialize Redis
    redis = new Redis(TEST_REDIS_CONFIG);

    // Set up test schema
    await setupTestDatabase(pool);

    // Initialize state manager
    stateManager = new AgentStateManager(TEST_DB_CONFIG, TEST_REDIS_CONFIG);
  });

  afterAll(async () => {
    await cleanupTestDatabase(pool);
    await pool.end();
    await redis.quit();
  });

  beforeEach(async () => {
    // Clear test data before each test
    await pool.query('DELETE FROM agent_states WHERE agent_id LIKE $1', ['test_%']);
    await redis.flushdb();
  });

  // ==========================================================================
  // Test 1: Classic SQL Injection Payloads
  // ==========================================================================

  test('CRITICAL: SQL injection in agentId should be safely escaped', async () => {
    for (const payload of SQL_INJECTION_PAYLOADS) {
      const state: AgentState = {
        agentId: payload,  // INJECTION ATTEMPT
        reputation: 0.5,
        totalCitations: 0,
        detectedViolations: 0,
        currentBehavior: 'moderate_check',
        memoryState: {},
        explorationRate: 0.2,
        timestamp: new Date().toISOString(),
        version: 0
      };

      // Attempt to save malicious payload
      try {
        await stateManager.saveState(state);

        // Verify table still exists
        const integrityOk = await verifyTableIntegrity(pool);
        expect(integrityOk).toBe(true);

        // Verify payload was stored as literal string (not executed)
        const loaded = await stateManager.loadState(payload);
        expect(loaded).toBeTruthy();
        expect(loaded?.agentId).toBe(payload);  // Stored as-is

      } catch (err) {
        // Even if save fails (constraints, etc.), table should still exist
        const integrityOk = await verifyTableIntegrity(pool);
        expect(integrityOk).toBe(true);
      }
    }
  });

  // ==========================================================================
  // Test 2: Injection in String Fields
  // ==========================================================================

  test('CRITICAL: SQL injection in currentBehavior should be safely escaped', async () => {
    const maliciousBehavior = "'; DROP TABLE agent_states; --";

    const state: AgentState = {
      agentId: 'test_behavior_injection',
      reputation: 0.5,
      totalCitations: 0,
      detectedViolations: 0,
      currentBehavior: maliciousBehavior,  // INJECTION ATTEMPT
      memoryState: {},
      explorationRate: 0.2,
      timestamp: new Date().toISOString(),
      version: 0
    };

    await stateManager.saveState(state);

    // Verify table intact
    const integrityOk = await verifyTableIntegrity(pool);
    expect(integrityOk).toBe(true);

    // Verify behavior stored as literal
    const loaded = await stateManager.loadState('test_behavior_injection');
    expect(loaded?.currentBehavior).toBe(maliciousBehavior);
  });

  // ==========================================================================
  // Test 3: Injection in JSONB Fields
  // ==========================================================================

  test('CRITICAL: SQL injection in JSONB memoryState should be safely escaped', async () => {
    const maliciousJson = {
      key: "'; DROP TABLE agent_states; --",
      nested: {
        attack: "' OR 1=1--"
      }
    };

    const state: AgentState = {
      agentId: 'test_jsonb_injection',
      reputation: 0.5,
      totalCitations: 0,
      detectedViolations: 0,
      currentBehavior: 'moderate_check',
      memoryState: maliciousJson,  // INJECTION ATTEMPT
      explorationRate: 0.2,
      timestamp: new Date().toISOString(),
      version: 0
    };

    await stateManager.saveState(state);

    // Verify table intact
    const integrityOk = await verifyTableIntegrity(pool);
    expect(integrityOk).toBe(true);

    // Verify JSONB stored correctly
    const loaded = await stateManager.loadState('test_jsonb_injection');
    expect(loaded?.memoryState).toEqual(maliciousJson);
  });

  // ==========================================================================
  // Test 4: Second-Order Injection
  // ==========================================================================

  test('HIGH: Second-order injection (store malicious data, load it later)', async () => {
    const maliciousId = "test'; DROP TABLE agent_states; --";

    // Step 1: Store malicious data
    const state: AgentState = {
      agentId: maliciousId,
      reputation: 0.5,
      totalCitations: 0,
      detectedViolations: 0,
      currentBehavior: 'moderate_check',
      memoryState: {},
      explorationRate: 0.2,
      timestamp: new Date().toISOString(),
      version: 0
    };

    await stateManager.saveState(state);

    // Step 2: Load it back (this is where second-order injection would trigger)
    const loaded = await stateManager.loadState(maliciousId);

    // Verify table still intact
    const integrityOk = await verifyTableIntegrity(pool);
    expect(integrityOk).toBe(true);

    // Verify data loaded correctly
    expect(loaded?.agentId).toBe(maliciousId);
  });

  // ==========================================================================
  // Test 5: Unicode and Encoding Attacks
  // ==========================================================================

  test('MEDIUM: Unicode/encoding-based SQL injection attempts', async () => {
    const unicodePayloads = [
      "test\u0027 OR 1=1--",  // Unicode single quote
      "test\u0022 OR 1=1--",  // Unicode double quote
      "test\u005c\u0027 OR 1=1--",  // Unicode backslash + quote
    ];

    for (const payload of unicodePayloads) {
      const state: AgentState = {
        agentId: payload,
        reputation: 0.5,
        totalCitations: 0,
        detectedViolations: 0,
        currentBehavior: 'moderate_check',
        memoryState: {},
        explorationRate: 0.2,
        timestamp: new Date().toISOString(),
        version: 0
      };

      await stateManager.saveState(state);

      const integrityOk = await verifyTableIntegrity(pool);
      expect(integrityOk).toBe(true);
    }
  });

  // ==========================================================================
  // Test 6: Verify Parameterized Queries Work Correctly
  // ==========================================================================

  test('Parameterized queries work correctly with normal data', async () => {
    const normalState: AgentState = {
      agentId: 'test_normal_agent',
      reputation: 0.75,
      totalCitations: 100,
      detectedViolations: 5,
      currentBehavior: 'strict_match',
      memoryState: {
        immediate_history: [],
        longterm_stats: { mean_integrity: 0.8 }
      },
      explorationRate: 0.15,
      timestamp: new Date().toISOString(),
      version: 0
    };

    await stateManager.saveState(normalState);

    const loaded = await stateManager.loadState('test_normal_agent');

    expect(loaded).toBeTruthy();
    expect(loaded?.reputation).toBe(0.75);
    expect(loaded?.totalCitations).toBe(100);
    expect(loaded?.detectedViolations).toBe(5);
    expect(loaded?.currentBehavior).toBe('strict_match');
    expect(loaded?.explorationRate).toBe(0.15);
  });

  // ==========================================================================
  // Test 7: Concurrent Injection Attempts
  // ==========================================================================

  test('MEDIUM: Concurrent SQL injection attempts should not cause race conditions', async () => {
    const promises = SQL_INJECTION_PAYLOADS.slice(0, 5).map(async (payload, idx) => {
      const state: AgentState = {
        agentId: `test_concurrent_${idx}_${payload.slice(0, 10)}`,
        reputation: 0.5,
        totalCitations: 0,
        detectedViolations: 0,
        currentBehavior: 'moderate_check',
        memoryState: {},
        explorationRate: 0.2,
        timestamp: new Date().toISOString(),
        version: 0
      };

      try {
        await stateManager.saveState(state);
      } catch (err) {
        // Some may fail due to constraints, that's ok
      }
    });

    await Promise.all(promises);

    // Verify table integrity after concurrent attempts
    const integrityOk = await verifyTableIntegrity(pool);
    expect(integrityOk).toBe(true);
  });

  // ==========================================================================
  // Test 8: Version-Based Conflict Resolution Security
  // ==========================================================================

  test('HIGH: Version-based conflict resolution does not introduce injection vectors', async () => {
    const maliciousVersion = "1; DROP TABLE agent_states; --";

    const state: AgentState = {
      agentId: 'test_version_injection',
      reputation: 0.5,
      totalCitations: 0,
      detectedViolations: 0,
      currentBehavior: 'moderate_check',
      memoryState: {},
      explorationRate: 0.2,
      timestamp: new Date().toISOString(),
      version: 1  // Version is a number, but test type coercion
    };

    // Save initial state
    await stateManager.saveState(state);

    // Attempt to exploit version field
    // (Note: TypeScript should prevent this, but test runtime behavior)
    const maliciousState = { ...state };
    (maliciousState as any).version = maliciousVersion;  // Force type bypass

    try {
      // This should either fail type validation or safely escape
      await stateManager.saveState(maliciousState);
    } catch (err) {
      // Expected to fail - that's good
    }

    // Verify table intact
    const integrityOk = await verifyTableIntegrity(pool);
    expect(integrityOk).toBe(true);
  });
});

// ============================================================================
// Performance Test: Verify Parameterization Doesn't Impact Performance
// ============================================================================

describe('SQL Injection Prevention Performance Tests', () => {
  let stateManager: AgentStateManager;
  let pool: PostgresPool;
  let redis: Redis;

  beforeAll(async () => {
    pool = new PostgresPool(TEST_DB_CONFIG);
    redis = new Redis(TEST_REDIS_CONFIG);
    await setupTestDatabase(pool);
    stateManager = new AgentStateManager(TEST_DB_CONFIG, TEST_REDIS_CONFIG);
  });

  afterAll(async () => {
    await cleanupTestDatabase(pool);
    await pool.end();
    await redis.quit();
  });

  test('Parameterized queries maintain acceptable performance', async () => {
    const numIterations = 100;
    const startTime = Date.now();

    for (let i = 0; i < numIterations; i++) {
      const state: AgentState = {
        agentId: `test_perf_${i}`,
        reputation: Math.random(),
        totalCitations: Math.floor(Math.random() * 1000),
        detectedViolations: Math.floor(Math.random() * 100),
        currentBehavior: 'moderate_check',
        memoryState: { iteration: i },
        explorationRate: Math.random(),
        timestamp: new Date().toISOString(),
        version: i
      };

      await stateManager.saveState(state);
    }

    const elapsed = Date.now() - startTime;
    const avgLatency = elapsed / numIterations;

    console.log(`\n📊 Performance Stats:`);
    console.log(`  Iterations: ${numIterations}`);
    console.log(`  Total time: ${elapsed}ms`);
    console.log(`  Avg latency: ${avgLatency.toFixed(2)}ms`);

    // Verify performance is acceptable (< 50ms avg)
    expect(avgLatency).toBeLessThan(50);
  });
});

// ============================================================================
// Export Test Utilities
// ============================================================================

export {
  SQL_INJECTION_PAYLOADS,
  setupTestDatabase,
  cleanupTestDatabase,
  verifyTableIntegrity
};
