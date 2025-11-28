#!/usr/bin/env node
/**
 * MARCUS 3.0 Platform Startup Script
 *
 * Complete initialization script that:
 * - Loads and validates configuration
 * - Initializes database pool singleton
 * - Initializes agent orchestrator (if enabled)
 * - Starts HTTP server
 * - Sets up graceful shutdown
 *
 * Addresses all issues found during debugging session.
 *
 * @module startup
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { loadConfiguration, printConfigurationSummary, PlatformConfiguration } from './config/platformConfig';
import { initializePool } from './database/pool';
import { PlatformServer } from './api/server';

// Load environment variables
dotenv.config();

console.log('🚀 MARCUS 3.0 Citation Integrity Platform');
console.log('==========================================\n');

/**
 * Initialize the Citation Agent Orchestrator
 */
async function initializeOrchestrator(config: PlatformConfiguration): Promise<void> {
  if (!config.agents.enabled) {
    console.log('ℹ️ Agent orchestrator disabled by configuration');
    return;
  }

  console.log('🤖 Initializing Citation Agent Orchestrator...');

  try {
    // Dynamic import to avoid circular dependencies
    const { CitationAgentOrchestrator } = await import('./integration/citationAgentIntegration');
    const { AgentStateManager } = await import('./integration/citationAgentIntegration');
    const { MetricsCollector } = await import('./integration/citationAgentIntegration');

    // Create orchestrator configuration
    const orchestratorConfig = {
      numAgents: config.agents.numAgents,
      agentScriptPath: config.agents.agentScriptPath,
      agentTimeout: config.agents.agentTimeout,
      maxRestarts: config.agents.maxRestarts,

      database: {
        host: config.database.host,
        port: config.database.port,
        database: config.database.database,
        user: config.database.user,
        password: config.database.password,
        poolSize: config.database.max
      },

      redis: {
        host: config.redis.host,
        port: config.redis.port,
        db: config.redis.db,
        ttl: config.performance.cacheTTL
      },

      performance: {
        maxConcurrentRequests: config.performance.maxConcurrentRequests,
        requestTimeout: config.performance.requestTimeout,
        cacheTTL: config.performance.cacheTTL
      },

      monitoring: {
        metricsPort: config.monitoring.metricsPort,
        logLevel: config.monitoring.logLevel,
        healthCheckInterval: config.performance.healthCheckInterval
      }
    };

    // Create components
    const stateManager = new AgentStateManager(
      orchestratorConfig.database,
      orchestratorConfig.redis
    );

    const metricsCollector = new MetricsCollector();

    // Create orchestrator
    const orchestrator = new CitationAgentOrchestrator(
      orchestratorConfig,
      stateManager,
      metricsCollector
    );

    // Initialize agents
    await orchestrator.initialize();

    // Store in global for access by API endpoints
    (global as any).__citationOrchestrator = orchestrator;

    console.log(`✅ Orchestrator initialized with ${config.agents.numAgents} agents`);

  } catch (error) {
    console.error('❌ Failed to initialize orchestrator:', error);

    if (config.agents.anthropicApiKey) {
      console.error('\n⚠️ Agent initialization failed despite API key being set.');
      console.error('   This may indicate issues with Python agent script or dependencies.');
    } else {
      console.error('\n⚠️ ANTHROPIC_API_KEY not set - agents cannot function.');
      console.error('   Set the environment variable to enable agent orchestration.');
    }

    // Don't fail startup if agents can't initialize in non-production
    if (process.env.NODE_ENV === 'production') {
      throw error;
    } else {
      console.error('\n⚠️ Continuing without agents (non-production mode)');
    }
  }
}

/**
 * Initialize the database pool
 */
function initializeDatabasePool(config: PlatformConfiguration): void {
  console.log('💾 Initializing database connection pool...');

  try {
    initializePool({
      host: config.database.host,
      port: config.database.port,
      database: config.database.database,
      user: config.database.user,
      password: config.database.password,
      max: config.database.max,
      min: config.database.min,
      idleTimeoutMillis: config.database.idleTimeoutMillis,
      connectionTimeoutMillis: config.database.connectionTimeoutMillis,
      healthCheckInterval: config.performance.healthCheckInterval,
      slowQueryThreshold: 1000,
      poolExhaustionThreshold: 0.9
    });

    console.log('✅ Database pool initialized');
  } catch (error) {
    console.error('❌ Failed to initialize database pool:', error);
    throw error;
  }
}

/**
 * Start the HTTP server
 */
async function startServer(config: PlatformConfiguration): Promise<void> {
  console.log('🌐 Starting HTTP server...');

  try {
    const serverConfig = {
      port: config.server.port,
      host: config.server.host,
      corsOrigins: config.server.corsOrigins,
      database: config.database,
      redis: config.redis,
      auth: config.auth,
      rateLimiting: config.rateLimiting
    };

    const server = new PlatformServer(serverConfig);
    await server.start();

    console.log('\n✅ MARCUS 3.0 Platform OPERATIONAL');
    console.log(`📍 Server: http://${config.server.host}:${config.server.port}`);
    console.log(`📊 Metrics: http://${config.server.host}:${config.monitoring.metricsPort}/metrics`);
    console.log(`📝 Health: http://${config.server.host}:${config.server.port}/health`);
    console.log('\nPress Ctrl+C to shutdown gracefully.\n');

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    throw error;
  }
}

/**
 * Main startup sequence
 */
async function main(): Promise<void> {
  try {
    // 1. Load and validate configuration
    console.log('📝 Loading configuration...');
    const config = loadConfiguration();
    printConfigurationSummary(config);

    // 2. Initialize database pool (singleton)
    initializeDatabasePool(config);

    // 3. Initialize agent orchestrator (if enabled)
    await initializeOrchestrator(config);

    // 4. Start HTTP server
    await startServer(config);

  } catch (error) {
    console.error('\n❌ CRITICAL: Platform startup failed:');
    console.error(error);
    console.error('\n📋 Troubleshooting:');
    console.error('1. Check .env file exists with all required variables');
    console.error('2. Verify PostgreSQL is running and accessible');
    console.error('3. Verify Redis is running and accessible');
    console.error('4. Run database migrations: psql < src/platform/database/migrations/005_complete_schema.sql');
    console.error('5. Check logs above for specific error messages\n');
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('\n❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the platform
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { main };
