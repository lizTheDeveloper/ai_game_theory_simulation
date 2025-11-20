/**
 * MARCUS 3.0 Platform Configuration
 *
 * Complete configuration with validation and defaults
 * Addresses missing configuration parameters found during debugging
 *
 * @module config/platformConfig
 */

import * as path from 'path';

export interface PlatformConfiguration {
  // Server configuration
  server: {
    port: number;
    host: string;
    corsOrigins: string[];
  };

  // Database configuration
  database: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    max: number;
    min?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
  };

  // Redis configuration
  redis: {
    host: string;
    port: number;
    db: number;
    password?: string;
    maxRetriesPerRequest?: number;
  };

  // Authentication configuration
  auth: {
    jwtSecret: string;
    jwtRefreshSecret?: string;
    accessTokenTTL: number;    // seconds
    refreshTokenTTL: number;   // seconds
  };

  // Agent orchestrator configuration
  agents: {
    enabled: boolean;
    numAgents: number;
    pythonPath: string;
    agentScriptPath: string;
    anthropicApiKey?: string;
    maxRestarts: number;
    agentTimeout: number;
  };

  // Performance configuration
  performance: {
    requestTimeout: number;
    healthCheckInterval: number;
    maxConcurrentRequests: number;
    cacheTTL: number;
  };

  // Rate limiting configuration
  rateLimiting: {
    enabled: boolean;
    trustedProxies?: string[];
  };

  // Monitoring configuration
  monitoring: {
    metricsPort: number;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
}

/**
 * Load configuration from environment variables with validation
 */
export function loadConfiguration(): PlatformConfiguration {
  // Validate required environment variables
  const required = [
    'DATABASE_HOST',
    'DATABASE_NAME',
    'DATABASE_USER',
    'DATABASE_PASSWORD',
    'REDIS_HOST',
    'JWT_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Build configuration
  const config: PlatformConfiguration = {
    server: {
      port: parseInt(process.env.PORT || '3000', 10),
      host: process.env.HOST || '0.0.0.0',
      corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3333']
    },

    database: {
      host: process.env.DATABASE_HOST!,
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      database: process.env.DATABASE_NAME!,
      user: process.env.DATABASE_USER!,
      password: process.env.DATABASE_PASSWORD!,
      max: parseInt(process.env.DATABASE_POOL_MAX || '20', 10),
      min: parseInt(process.env.DATABASE_POOL_MIN || '2', 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    },

    redis: {
      host: process.env.REDIS_HOST!,
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      db: parseInt(process.env.REDIS_DB || '0', 10),
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: 3
    },

    auth: {
      jwtSecret: process.env.JWT_SECRET!,
      jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!,
      accessTokenTTL: parseInt(process.env.ACCESS_TOKEN_TTL || '900', 10),      // 15 minutes
      refreshTokenTTL: parseInt(process.env.REFRESH_TOKEN_TTL || '604800', 10)  // 7 days
    },

    agents: {
      enabled: process.env.ENABLE_AGENTS !== 'false',
      numAgents: parseInt(process.env.NUM_AGENTS || '9', 10),
      pythonPath: process.env.PYTHON_PATH || 'python3',
      agentScriptPath: process.env.AGENT_SCRIPT_PATH || path.join(__dirname, '../agents/citation_integrity_agent.py'),
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      maxRestarts: parseInt(process.env.AGENT_MAX_RESTARTS || '3', 10),
      agentTimeout: parseInt(process.env.AGENT_TIMEOUT || '30000', 10)
    },

    performance: {
      requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10),
      healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '5000', 10),
      maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS || '100', 10),
      cacheTTL: parseInt(process.env.CACHE_TTL || '3600', 10)
    },

    rateLimiting: {
      enabled: process.env.RATE_LIMITING_ENABLED !== 'false',
      trustedProxies: process.env.TRUSTED_PROXIES?.split(',')
    },

    monitoring: {
      metricsPort: parseInt(process.env.METRICS_PORT || '9090', 10),
      logLevel: (process.env.LOG_LEVEL as any) || 'info'
    }
  };

  // Validate configuration
  validateConfiguration(config);

  return config;
}

/**
 * Validate configuration values
 */
function validateConfiguration(config: PlatformConfiguration): void {
  const errors: string[] = [];

  // Server validation
  if (config.server.port < 1 || config.server.port > 65535) {
    errors.push(`Invalid server port: ${config.server.port}`);
  }

  // Database validation
  if (config.database.max < 1) {
    errors.push(`Invalid database pool max: ${config.database.max}`);
  }

  if (config.database.min && config.database.min > config.database.max) {
    errors.push(`Database pool min (${config.database.min}) cannot exceed max (${config.database.max})`);
  }

  // Auth validation
  if (config.auth.jwtSecret.length < 32) {
    errors.push('JWT secret must be at least 32 characters for security');
  }

  if (config.auth.accessTokenTTL < 60) {
    errors.push('Access token TTL must be at least 60 seconds');
  }

  // Agent validation
  if (config.agents.enabled) {
    if (!config.agents.anthropicApiKey) {
      console.warn('⚠️ WARNING: ANTHROPIC_API_KEY not set - agents will fail to initialize');
    }

    if (config.agents.numAgents < 1 || config.agents.numAgents > 100) {
      errors.push(`Invalid number of agents: ${config.agents.numAgents} (must be 1-100)`);
    }
  }

  // Performance validation
  if (config.performance.requestTimeout < 1000) {
    errors.push('Request timeout must be at least 1000ms');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

/**
 * Get default configuration for testing
 */
export function getTestConfiguration(): PlatformConfiguration {
  return {
    server: {
      port: 3001,
      host: 'localhost',
      corsOrigins: ['http://localhost:3333']
    },

    database: {
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || process.env.TEST_DB_PORT || '5432', 10),
      database: process.env.DATABASE_NAME || 'marcus_test',
      user: process.env.DATABASE_USER || 'marcus',
      password: process.env.DATABASE_PASSWORD || 'marcus_dev_password',
      max: 5,
      min: 1
    },

    redis: {
      host: 'localhost',
      port: 6379,
      db: 1,  // Use different DB for tests
      password: process.env.REDIS_PASSWORD  // Read from environment
    },

    auth: {
      jwtSecret: 'test-secret-key-do-not-use-in-production-at-least-32-chars',
      accessTokenTTL: 900,
      refreshTokenTTL: 604800
    },

    agents: {
      enabled: false,  // Disable agents in tests
      numAgents: 3,
      pythonPath: 'python3',
      agentScriptPath: './src/platform/agents/citation_integrity_agent.py',
      maxRestarts: 1,
      agentTimeout: 10000
    },

    performance: {
      requestTimeout: 5000,
      healthCheckInterval: 10000,
      maxConcurrentRequests: 10,
      cacheTTL: 300
    },

    rateLimiting: {
      enabled: false  // Disable rate limiting in tests
    },

    monitoring: {
      metricsPort: 9091,
      logLevel: 'error'  // Only show errors in tests
    }
  };
}

/**
 * Print configuration summary (with secrets masked)
 */
export function printConfigurationSummary(config: PlatformConfiguration): void {
  console.log('\n📋 MARCUS 3.0 Configuration Summary:');
  console.log('=====================================');
  console.log(`Server: ${config.server.host}:${config.server.port}`);
  console.log(`Database: ${config.database.user}@${config.database.host}:${config.database.port}/${config.database.database}`);
  console.log(`Redis: ${config.redis.host}:${config.redis.port}/${config.redis.db}`);
  console.log(`JWT Secret: ${'*'.repeat(config.auth.jwtSecret.length)} (${config.auth.jwtSecret.length} chars)`);
  console.log(`Agents: ${config.agents.enabled ? `Enabled (${config.agents.numAgents} agents)` : 'Disabled'}`);
  console.log(`Rate Limiting: ${config.rateLimiting.enabled ? 'Enabled' : 'Disabled'}`);
  console.log(`Log Level: ${config.monitoring.logLevel}`);
  console.log('=====================================\n');
}
