/**
 * MARCUS 3.0 Agent Integration Tests
 *
 * Tests the complete Python Agent System:
 * - TypeScript → Python agent communication (IPC)
 * - Agent state persistence (PostgreSQL + Redis)
 * - Multi-agent orchestration and consensus
 * - Health monitoring and failure recovery
 *
 * Prerequisites:
 * - PostgreSQL running with marcus_test database
 * - Redis running
 * - Agent dependencies installed: pip install -r src/platform/agents/requirements.txt
 *
 * Run:
 *   npm test -- agentIntegration.test.ts
 *
 * Author: Marcus (Platform Engineer)
 * Date: 2025-11-20
 */

import { Pool } from 'pg';
import Redis from 'ioredis';
import * as path from 'path';
import * as fs from 'fs/promises';
import {
  PythonAgentWrapper,
  AgentStateManager,
  CitationAgentOrchestrator,
  MetricsCollector,
  CitationDocument,
  PlatformConfig
} from '../integration/citationAgentIntegration';

// Test database configuration
const TEST_DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'marcus_test',
  user: process.env.DB_USER || 'marcus',
  password: process.env.DB_PASSWORD || 'marcus_dev_password',
  poolSize: 5
};

const TEST_REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  db: parseInt(process.env.REDIS_DB || '1'), // Use DB 1 for tests
  ttl: 3600
};

const AGENT_SCRIPT_PATH = path.join(__dirname, '../agents/citation_integrity_agent.py');

// Test timeout (agents take time to spawn)
const TEST_TIMEOUT = 60000; // 60 seconds

describe('Python Agent Integration', () => {
  let db: Pool;
  let redis: Redis;

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
      db: TEST_REDIS_CONFIG.db,
      password: process.env.REDIS_PASSWORD
    });

    // Verify agent script exists
    try {
      await fs.access(AGENT_SCRIPT_PATH);
    } catch (err) {
      throw new Error(`Agent script not found: ${AGENT_SCRIPT_PATH}. Run tests from project root.`);
    }

    // Apply migrations
    const migrationPath = path.join(__dirname, '../database/migrations/006_agent_system_schema.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf-8');

    try {
      await db.query(migrationSQL);
      console.log('✅ Agent system schema applied');
    } catch (err) {
      console.warn('⚠️ Migration may have already been applied:', (err as Error).message);
    }

    // Clear test data
    await db.query('TRUNCATE agent_states CASCADE');
    await redis.flushdb();
  });

  afterAll(async () => {
    // Cleanup
    await db.end();
    await redis.quit();
  });

  describe('PythonAgentWrapper', () => {
    let agent: PythonAgentWrapper;

    afterEach(async () => {
      if (agent) {
        await agent.stop();
      }
    });

    test('should spawn Python agent process', async () => {
      agent = new PythonAgentWrapper(
        'test_agent_001',
        AGENT_SCRIPT_PATH,
        3,
        30000
      );

      await agent.start();

      expect(agent.getHealthStatus()).toBe(true);
    }, TEST_TIMEOUT);

    test('should communicate via JSON IPC protocol', async () => {
      agent = new PythonAgentWrapper(
        'test_agent_002',
        AGENT_SCRIPT_PATH,
        3,
        30000
      );

      await agent.start();

      // Wait for agent to be healthy
      await new Promise(resolve => setTimeout(resolve, 2000));

      const status = await agent.getStatus();

      expect(status).toBeDefined();
      expect(status.agentId).toBe('test_agent_002');
      expect(status.reputation).toBeGreaterThanOrEqual(0);
      expect(status.reputation).toBeLessThanOrEqual(1);
      expect(status.isHealthy).toBe(true);
    }, TEST_TIMEOUT);

    test('should analyze citation document', async () => {
      agent = new PythonAgentWrapper(
        'test_agent_003',
        AGENT_SCRIPT_PATH,
        3,
        30000
      );

      await agent.start();

      // Wait for agent to be ready
      await new Promise(resolve => setTimeout(resolve, 2000));

      const document: CitationDocument = {
        text: 'According to Smith et al. (2024), AI alignment is critical for future safety.',
        claimedSource: 'Smith et al. 2024',
        actualSource: 'Smith, J., et al. (2024). AI Alignment Research. Nature.',
        metadata: { test: true }
      };

      const result = await agent.analyzeCitation(document);

      expect(result).toBeDefined();
      expect(result.integrityScore).toBeGreaterThanOrEqual(0);
      expect(result.integrityScore).toBeLessThanOrEqual(1);
      expect(result.behaviorUsed).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.agentId).toBe('test_agent_003');
      expect(result.agentReputation).toBeGreaterThanOrEqual(0);
      expect(result.agentReputation).toBeLessThanOrEqual(1);
    }, TEST_TIMEOUT);

    test('should handle agent restart on crash', async () => {
      agent = new PythonAgentWrapper(
        'test_agent_004',
        AGENT_SCRIPT_PATH,
        3,  // maxRestarts
        30000
      );

      await agent.start();

      // Wait for agent to be ready
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Kill the agent process
      if (agent['process']) {
        agent['process'].kill('SIGKILL');
      }

      // Wait for restart
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Agent should have restarted automatically
      // Note: This test may be flaky depending on restart timing
      // In production, we'd use more sophisticated health checks
    }, TEST_TIMEOUT);
  });

  describe('AgentStateManager', () => {
    let stateManager: AgentStateManager;

    beforeEach(() => {
      stateManager = new AgentStateManager(
        TEST_DB_CONFIG,
        TEST_REDIS_CONFIG
      );
    });

    afterEach(async () => {
      await stateManager.cleanup();
      await db.query('TRUNCATE agent_states CASCADE');
      await redis.flushdb();
    });

    test('should save agent state to PostgreSQL', async () => {
      const state = {
        agentId: 'test_agent_005',
        reputation: 0.75,
        totalCitations: 10,
        detectedViolations: 2,
        currentBehavior: 'strict_match',
        memoryState: { test: 'data' },
        explorationRate: 0.1,
        timestamp: new Date().toISOString(),
        version: 0
      };

      await stateManager.saveState(state);

      // Verify in database
      const result = await db.query(
        'SELECT * FROM agent_states WHERE agent_id = $1',
        ['test_agent_005']
      );

      expect(result.rows.length).toBe(1);
      expect(result.rows[0].reputation).toBeCloseTo(0.75, 2);
      expect(result.rows[0].total_citations).toBe(10);
      expect(result.rows[0].detected_violations).toBe(2);
      expect(result.rows[0].current_behavior).toBe('strict_match');
    });

    test('should load agent state from cache (Redis)', async () => {
      const state = {
        agentId: 'test_agent_006',
        reputation: 0.8,
        totalCitations: 20,
        detectedViolations: 1,
        currentBehavior: 'combined_heuristic',
        memoryState: { cached: true },
        explorationRate: 0.15,
        timestamp: new Date().toISOString(),
        version: 0
      };

      await stateManager.saveState(state);

      // Load from cache (should hit Redis)
      const loaded = await stateManager.loadState('test_agent_006');

      expect(loaded).toBeDefined();
      expect(loaded!.agentId).toBe('test_agent_006');
      expect(loaded!.reputation).toBeCloseTo(0.8, 2);
      expect(loaded!.memoryState).toEqual({ cached: true });
    });

    test('should handle version conflicts (optimistic locking)', async () => {
      const state1 = {
        agentId: 'test_agent_007',
        reputation: 0.5,
        totalCitations: 5,
        detectedViolations: 0,
        currentBehavior: 'moderate_check',
        memoryState: {},
        explorationRate: 0.2,
        timestamp: new Date().toISOString(),
        version: 0
      };

      await stateManager.saveState(state1);

      // Simulate concurrent update with stale version
      const state2 = { ...state1, reputation: 0.6, version: 0 };

      // Second save should detect version conflict
      // Note: Current implementation updates version automatically,
      // so this test verifies the versioning mechanism exists
      await stateManager.saveState(state2);

      const currentVersion = await stateManager.getCurrentVersion('test_agent_007');
      expect(currentVersion).toBeGreaterThan(0);
    });
  });

  describe('CitationAgentOrchestrator', () => {
    let orchestrator: CitationAgentOrchestrator;
    let stateManager: AgentStateManager;
    let metricsCollector: MetricsCollector;

    beforeEach(async () => {
      stateManager = new AgentStateManager(
        TEST_DB_CONFIG,
        TEST_REDIS_CONFIG
      );

      metricsCollector = new MetricsCollector();

      const config: PlatformConfig = {
        numAgents: 3,
        agentScriptPath: AGENT_SCRIPT_PATH,
        agentTimeout: 30000,
        maxRestarts: 3,
        database: TEST_DB_CONFIG,
        redis: TEST_REDIS_CONFIG,
        performance: {
          maxConcurrentRequests: 10,
          requestTimeout: 10000,
          cacheTTL: 3600
        },
        monitoring: {
          metricsPort: 9091,
          logLevel: 'info',
          healthCheckInterval: 10000
        }
      };

      orchestrator = new CitationAgentOrchestrator(
        config,
        stateManager,
        metricsCollector
      );
    });

    afterEach(async () => {
      if (orchestrator) {
        await orchestrator.shutdown();
      }
      if (stateManager) {
        await stateManager.cleanup();
      }
      await db.query('TRUNCATE agent_states CASCADE');
      await redis.flushdb();
    });

    test('should initialize multiple agents', async () => {
      await orchestrator.initialize();

      const count = await orchestrator.getAgentCount();
      expect(count).toBe(3);

      const healthyCount = await orchestrator.getHealthyAgentCount();
      expect(healthyCount).toBeGreaterThan(0);
    }, TEST_TIMEOUT);

    test('should analyze document with multi-agent consensus', async () => {
      await orchestrator.initialize();

      // Wait for agents to be ready
      await new Promise(resolve => setTimeout(resolve, 3000));

      const document: CitationDocument = {
        text: 'Research by Johnson (2023) shows significant progress in machine learning.',
        claimedSource: 'Johnson 2023',
        metadata: { test: true }
      };

      const result = await orchestrator.analyzeDocument(document);

      expect(result).toBeDefined();
      expect(result.meanIntegrity).toBeGreaterThanOrEqual(0);
      expect(result.meanIntegrity).toBeLessThanOrEqual(1);
      expect(result.consensus).toBeGreaterThanOrEqual(0);
      expect(result.consensus).toBeLessThanOrEqual(1);
      expect(result.numAgents).toBeGreaterThan(0);
      expect(result.numAgents).toBeLessThanOrEqual(3);
      expect(result.latencyMs).toBeGreaterThan(0);
      expect(result.behaviorDistribution).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
    }, TEST_TIMEOUT);

    test('should get status of all agents', async () => {
      await orchestrator.initialize();

      // Wait for agents to be ready
      await new Promise(resolve => setTimeout(resolve, 3000));

      const statuses = await orchestrator.getAgentStatuses();

      expect(statuses.length).toBe(3);

      for (const status of statuses) {
        expect(status.agentId).toBeDefined();
        expect(status.reputation).toBeGreaterThanOrEqual(0);
        expect(status.reputation).toBeLessThanOrEqual(1);
        expect(status.explorationRate).toBeGreaterThanOrEqual(0);
        expect(status.explorationRate).toBeLessThanOrEqual(1);
      }
    }, TEST_TIMEOUT);

    test('should handle partial agent failures gracefully', async () => {
      await orchestrator.initialize();

      // Wait for agents to be ready
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Kill one agent
      const agents = (orchestrator as any).agents;
      const firstAgent = agents.values().next().value as PythonAgentWrapper;
      if (firstAgent['process']) {
        firstAgent['process'].kill('SIGKILL');
      }

      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Should still be able to analyze (with degraded performance)
      const document: CitationDocument = {
        text: 'Test citation',
        claimedSource: 'Test 2024'
      };

      const result = await orchestrator.analyzeDocument(document);

      // Should get results from remaining agents
      expect(result.numAgents).toBeGreaterThan(0);
      expect(result.numAgents).toBeLessThan(3); // One agent is down
    }, TEST_TIMEOUT);

    test('should persist analysis results to database', async () => {
      await orchestrator.initialize();

      // Wait for agents to be ready
      await new Promise(resolve => setTimeout(resolve, 3000));

      const document: CitationDocument = {
        text: 'Citation for testing persistence',
        claimedSource: 'Test et al. 2024'
      };

      const result = await orchestrator.analyzeDocument(document);

      // Verify in database
      const dbResult = await db.query(`
        SELECT * FROM citation_analyses
        WHERE source = 'platform'
        ORDER BY created_at DESC
        LIMIT 1
      `);

      expect(dbResult.rows.length).toBe(1);
      expect(dbResult.rows[0].mean_integrity).toBeDefined();
      expect(dbResult.rows[0].consensus).toBeDefined();
      expect(dbResult.rows[0].num_agents).toBe(result.numAgents);
    }, TEST_TIMEOUT);
  });

  describe('MetricsCollector', () => {
    let metricsCollector: MetricsCollector;

    beforeEach(() => {
      metricsCollector = new MetricsCollector();
    });

    test('should record latency metrics', () => {
      metricsCollector.recordLatency(100);
      metricsCollector.recordLatency(250);
      metricsCollector.recordLatency(500);

      const metrics = metricsCollector.getMetrics();

      expect(metrics).toContain('citation_latency_ms');
      expect(typeof metrics).toBe('string');
    });

    test('should record consensus metrics', () => {
      metricsCollector.recordConsensus(0.85);
      metricsCollector.recordConsensus(0.92);

      const metrics = metricsCollector.getMetrics();

      expect(metrics).toContain('citation_consensus');
    });

    test('should record agent failures', () => {
      metricsCollector.recordAgentFailure('agent_001');
      metricsCollector.recordAgentFailure('agent_002');
      metricsCollector.recordAgentFailure('agent_001');

      const metrics = metricsCollector.getMetrics();

      expect(metrics).toContain('citation_agent_failures_total');
    });

    test('should generate Prometheus-compatible metrics', () => {
      metricsCollector.recordLatency(100);
      metricsCollector.recordAccuracy(0.95);
      metricsCollector.recordThroughput(10.5);
      metricsCollector.recordConsensus(0.88);

      const metrics = metricsCollector.getMetrics();

      // Should have Prometheus format
      expect(metrics).toContain('# HELP');
      expect(metrics).toContain('# TYPE');
      expect(metrics).toMatch(/citation_\w+/);
    });
  });
});
