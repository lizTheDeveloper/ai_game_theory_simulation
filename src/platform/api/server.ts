/**
 * MARCUS 3.0 Citation Integrity Platform
 * API Server
 *
 * Production-ready Express server with authentication, authorization,
 * and citation analysis endpoints
 *
 * @module server
 * @author Marcus (Platform Engineer)
 */

// Load environment variables from .env file
import * as dotenv from 'dotenv';
dotenv.config();

// Set descriptive process title for monitoring
process.title = 'marcus-api-server';

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import Redis from 'ioredis';
import { AuthService } from '../auth/authService';
import { JWTMiddleware, createJWTMiddleware } from '../auth/jwtMiddleware';
import { requirePermission, requireAdmin, requireOperator } from '../auth/rbacMiddleware';
import { createAuthRoutes } from './authRoutes';
import { createRateLimitMiddleware, RateLimitPresets } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validation';
import { analyzeCitationSchema } from '../schemas/citationSchemas';
import { updateUserRoleBodySchema, updateUserRoleParamsSchema, deleteUserParamsSchema } from '../schemas/adminSchemas';
import { createCORSMiddleware, getDefaultCORSConfig } from '../middleware/corsMiddleware';
import { createSecurityHeadersMiddleware, getDefaultSecurityHeadersConfig, getDevelopmentSecurityHeadersConfig } from '../middleware/securityHeaders';
import { AuditLogger, createAuditMiddleware } from '../middleware/auditLogger';
import { metricsMiddleware } from '../monitoring/metricsEndpoint';
import { HealthCheckService } from '../monitoring/healthChecks';
import { MetricsCollector, initializeMetricsCollector } from '../monitoring/metricsCollector';

// ============================================================================
// Server Configuration
// ============================================================================

export interface ServerConfig {
  port: number;
  host: string;
  corsOrigins: string[];

  // Database configuration
  database: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    max: number; // connection pool size
  };

  // Redis configuration
  redis: {
    host: string;
    port: number;
    db: number;
    password?: string;
    maxRetriesPerRequest?: number;
  };

  // Auth configuration
  auth: {
    jwtSecret?: string;
    jwtRefreshSecret?: string;
    accessTokenTTL?: number;
    refreshTokenTTL?: number;
  };

  // Rate limiting configuration
  rateLimiting?: {
    enabled: boolean;
    trustedProxies?: string[]; // IPs of trusted proxies/load balancers
  };
}

// ============================================================================
// Platform Server
// ============================================================================

export class PlatformServer {
  private app: Express;
  private pool: Pool;
  private redis: Redis;
  private authService: AuthService;
  private jwtMiddleware: JWTMiddleware;
  private auditLogger: AuditLogger;
  private healthCheckService: HealthCheckService;
  private metricsCollector: MetricsCollector;
  private config: ServerConfig;
  private server: any;
  private httpServer?: any; // HTTP server for GraphQL WebSocket support

  constructor(config: ServerConfig) {
    this.config = config;
    this.app = express();
    this.pool = new Pool(config.database);
    this.redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      db: config.redis.db,
      password: config.redis.password,
      maxRetriesPerRequest: config.redis.maxRetriesPerRequest || 3,
    });
    this.authService = new AuthService(this.pool, config.auth);
    this.jwtMiddleware = createJWTMiddleware(this.authService);
    this.auditLogger = new AuditLogger(this.pool, {
      enableConsoleLogging: true,
      enableDatabaseLogging: true,
      minSeverity: 'low',
    });
    this.healthCheckService = new HealthCheckService(this.pool, this.redis);
    this.metricsCollector = initializeMetricsCollector(this.pool, this.redis, {
      updateIntervalMs: 5000, // Update infrastructure metrics every 5 seconds
      enableRedisMetrics: true, // Enable Redis metrics collection
      redisCollectorConfig: {
        collectionIntervalMs: 10000, // Collect Redis metrics every 10 seconds
        enableCommandMonitoring: true // Track per-command latency
      }
    });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    // 1. Security Headers (first - apply to all responses)
    const securityHeadersConfig = process.env.NODE_ENV === 'production'
      ? getDefaultSecurityHeadersConfig()
      : getDevelopmentSecurityHeadersConfig();
    this.app.use(createSecurityHeadersMiddleware(securityHeadersConfig));

    // 2. Enhanced CORS with whitelist
    const corsConfig = getDefaultCORSConfig();
    this.app.use(createCORSMiddleware(corsConfig));

    // 3. JSON body parsing (before validation middleware)
    this.app.use(express.json());

    // 4. Prometheus metrics middleware (track all HTTP requests)
    this.app.use(metricsMiddleware);

    // 5. Audit logging middleware
    this.app.use(createAuditMiddleware(this.auditLogger));

    // 6. Request logging
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        // lgtm[js/log-injection] - req.method and req.path are standard Express properties, not user-controlled strings
        console.log(
          `${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
        );
      });
      next();
    });

    // 7. Rate limiting (if enabled)
    if (this.config.rateLimiting?.enabled !== false) {
      this.setupRateLimiting();
    }

    console.log('✅ Security middleware initialized:');
    console.log('   - Security Headers (CSP, HSTS, X-Frame-Options)');
    console.log('   - CORS whitelist protection');
    console.log('   - Prometheus metrics tracking');
    console.log('   - Comprehensive audit logging');
    console.log('   - Rate limiting');
  }

  /**
   * Setup rate limiting middleware for different endpoints
   */
  private setupRateLimiting(): void {
    // Global rate limit for health check (high limit)
    this.app.use(
      '/health',
      createRateLimitMiddleware(this.redis, {
        ...RateLimitPresets.health,
        skipIPs: this.config.rateLimiting?.trustedProxies,
      })
    );

    // Login endpoint (strict limit to prevent brute force)
    this.app.use(
      '/auth/login',
      createRateLimitMiddleware(this.redis, RateLimitPresets.login)
    );

    // Analysis endpoint (IP-based limit)
    this.app.use(
      '/api/citations/analyze',
      createRateLimitMiddleware(this.redis, RateLimitPresets.analysis.ip)
    );

    // Metrics endpoint (IP-based limit)
    this.app.use(
      '/api/metrics',
      createRateLimitMiddleware(this.redis, RateLimitPresets.metrics)
    );

    // Admin endpoints (user-based limit)
    this.app.use(
      '/api/admin',
      createRateLimitMiddleware(this.redis, RateLimitPresets.admin)
    );

    console.log('✅ Rate limiting enabled');
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    // ========================================================================
    // Health Check Endpoints (Kubernetes-compatible)
    // ========================================================================

    // Comprehensive health check endpoint (public)
    // Returns detailed status of all components
    this.app.get('/health', async (req: Request, res: Response) => {
      try {
        const healthStatus = await this.healthCheckService.getHealthStatus();

        // Determine HTTP status code based on health
        const statusCode = healthStatus.status === 'healthy' ? 200 :
                          healthStatus.status === 'degraded' ? 200 : 503;

        res.status(statusCode).json(healthStatus);
      } catch (err) {
        console.error('❌ Health check error:', err);
        res.status(503).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          uptime: 0,
          error: (err as Error).message,
        });
      }
    });

    // Readiness probe endpoint (Kubernetes readiness)
    // Indicates if the service is ready to accept traffic
    this.app.get('/ready', async (req: Request, res: Response) => {
      try {
        const readiness = await this.healthCheckService.getReadinessStatus();
        const statusCode = readiness.ready ? 200 : 503;
        res.status(statusCode).json(readiness);
      } catch (err) {
        console.error('❌ Readiness check error:', err);
        res.status(503).json({
          ready: false,
          timestamp: new Date().toISOString(),
          message: 'Readiness check failed',
          error: (err as Error).message,
        });
      }
    });

    // Liveness probe endpoint (Kubernetes liveness)
    // Indicates if the service should be restarted
    this.app.get('/live', (req: Request, res: Response) => {
      try {
        const liveness = this.healthCheckService.getLivenessStatus();
        res.status(200).json(liveness);
      } catch (err) {
        console.error('❌ Liveness check error:', err);
        res.status(503).json({
          alive: false,
          timestamp: new Date().toISOString(),
          error: (err as Error).message,
        });
      }
    });

    // Authentication routes (public)
    this.app.use('/auth', createAuthRoutes(this.authService, this.jwtMiddleware));

    // ==========================================================================
    // Protected Platform Routes
    // ==========================================================================

    // POST /api/citations/analyze - Analyze citation (requires operator or admin)
    // lgtm[js/missing-rate-limiting] Rate limiting applied via app.use() middleware above
    this.app.post(
      '/api/citations/analyze',
      this.jwtMiddleware.authenticate, // lgtm[js/missing-rate-limiting]
      requirePermission('citations:analyze'),
      validateRequest(analyzeCitationSchema),
      async (req: Request, res: Response) => {
        try {
          const { text, claimedSource, actualSource, metadata } = req.body;

          // Create citation document
          const document = {
            text,
            claimedSource,
            actualSource,
            metadata: metadata || {}
          };

          // Lazy-load orchestrator (avoid circular dependencies)
          const { CitationAgentOrchestrator } = await import('../integration/citationAgentIntegration');

          // Get orchestrator instance (singleton pattern)
          const orchestrator = (global as any).__citationOrchestrator as typeof CitationAgentOrchestrator.prototype;

          if (!orchestrator) {
            throw new Error('Citation orchestrator not initialized. Start server with --enable-agents flag.');
          }

          // Analyze citation with multi-agent consensus
          const result = await orchestrator.analyzeCitation(document);

          res.status(200).json({
            integrity: {
              score: result.meanIntegrity,
              consensus: result.consensus,
              confidence: result.consensus // Higher consensus = higher confidence
            },
            analysis: {
              numAgents: result.numAgents,
              behaviorDistribution: result.behaviorDistribution,
              recommendations: result.recommendations,
              latencyMs: result.latencyMs
            },
            results: result.individualResults,
            timestamp: result.timestamp
          });

        } catch (err) {
          console.error('❌ Citation analysis error:', err);
          res.status(500).json({
            error: 'Internal Server Error',
            message: err instanceof Error ? err.message : 'Citation analysis failed',
          });
        }
      }
    );

    // GET /api/metrics - Get platform metrics (public for Prometheus scraping)
    this.app.get(
      '/api/metrics',
      async (req: Request, res: Response) => {
        try {
          // Use the MARCUS metrics registry with platform-specific metrics
          const { metricsHandler } = await import('../monitoring/metricsEndpoint');
          return metricsHandler(req, res);

        } catch (err) {
          console.error('❌ Metrics error:', err);
          res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to retrieve metrics',
          });
        }
      }
    );

    // POST /api/admin/agents - Manage agents (requires admin)
    // lgtm[js/missing-rate-limiting] Rate limiting applied via app.use() middleware above
    this.app.post(
      '/api/admin/agents',
      this.jwtMiddleware.authenticate, // lgtm[js/missing-rate-limiting]
      requireAdmin,
      async (req: Request, res: Response) => {
        try {
          const { action, agentId } = req.body;

          // Lazy-load orchestrator
          const { CitationAgentOrchestrator } = await import('../integration/citationAgentIntegration');
          const orchestrator = (global as any).__citationOrchestrator as typeof CitationAgentOrchestrator.prototype;

          if (!orchestrator) {
            throw new Error('Citation orchestrator not initialized');
          }

          let result: any;

          switch (action) {
            case 'list':
              // Get status of all agents
              result = await orchestrator.getAgentStatuses();
              break;

            case 'restart':
              if (!agentId) {
                res.status(400).json({ error: 'agentId required for restart' });
                return;
              }
              // Restart would be implemented in orchestrator
              result = { message: `Agent ${agentId} restart requested` };
              break;

            case 'health':
              // Health check all agents
              const statuses = await orchestrator.getAgentStatuses();
              const healthy = statuses.filter(s => s.isHealthy).length;
              result = {
                total: statuses.length,
                healthy,
                unhealthy: statuses.length - healthy,
                agents: statuses
              };
              break;

            default:
              res.status(400).json({ error: 'Invalid action. Use: list, restart, health' });
              return;
          }

          res.status(200).json(result);

        } catch (err) {
          console.error('❌ Agent management error:', err);
          res.status(500).json({
            error: 'Internal Server Error',
            message: 'Agent management failed',
          });
        }
      }
    );

    // GET /api/admin/users - List users (requires admin)
    // lgtm[js/missing-rate-limiting] Rate limiting applied via app.use() middleware above
    this.app.get(
      '/api/admin/users',
      this.jwtMiddleware.authenticate, // lgtm[js/missing-rate-limiting]
      requireAdmin,
      async (req: Request, res: Response) => {
        try {
          const result = await this.pool.query(
            `SELECT id, email, role, is_active as "isActive",
                    created_at as "createdAt", last_login as "lastLogin"
             FROM users
             ORDER BY created_at DESC`
          );

          res.status(200).json({
            users: result.rows,
            count: result.rowCount,
          });

        } catch (err) {
          console.error('❌ List users error:', err);
          res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to retrieve users',
          });
        }
      }
    );

    // PUT /api/admin/users/:userId/role - Update user role (requires admin)
    // lgtm[js/missing-rate-limiting] Rate limiting applied via app.use() middleware above
    this.app.put(
      '/api/admin/users/:userId/role',
      this.jwtMiddleware.authenticate, // lgtm[js/missing-rate-limiting]
      requireAdmin,
      validateRequest(updateUserRoleParamsSchema, 'params'),
      validateRequest(updateUserRoleBodySchema),
      async (req: Request, res: Response) => {
        try {
          const { userId } = req.params;
          const { role } = req.body;

          await this.authService.updateUserRole(userId, role);

          res.status(200).json({
            message: 'User role updated successfully',
            userId,
            newRole: role,
          });

        } catch (err) {
          // lgtm[js/log-injection] - error from internal operation, not user-provided
          console.error('❌ Update user role error:', err);
          res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update user role',
          });
        }
      }
    );

    // DELETE /api/admin/users/:userId - Deactivate user (requires admin)
    // lgtm[js/missing-rate-limiting] Rate limiting applied via app.use() middleware above
    this.app.delete(
      '/api/admin/users/:userId',
      this.jwtMiddleware.authenticate, // lgtm[js/missing-rate-limiting]
      requireAdmin,
      validateRequest(deleteUserParamsSchema, 'params'),
      async (req: Request, res: Response) => {
        try {
          const { userId } = req.params;

          await this.authService.deactivateUser(userId);

          res.status(200).json({
            message: 'User deactivated successfully',
            userId,
          });

        } catch (err) {
          // lgtm[js/log-injection] - error from internal operation, not user-provided
          console.error('❌ Deactivate user error:', err);
          res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to deactivate user',
          });
        }
      }
    );

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
      });
    });
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    // Global error handler
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('❌ Unhandled error:', err);

      res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : err.message,
      });
    });
  }

  /**
   * Setup GraphQL API endpoint
   *
   * Integrates Apollo Server with Express for efficient GraphQL queries.
   * Feature-flagged via ENABLE_GRAPHQL environment variable.
   */
  private async setupGraphQL(): Promise<void> {
    try {
      console.log('🚀 Setting up GraphQL endpoint...');

      // Get orchestrator from global (set by orchestrator startup script)
      const orchestrator = (global as any).__citationOrchestrator;

      if (!orchestrator) {
        console.warn('⚠️ Citation orchestrator not initialized - GraphQL disabled');
        return;
      }

      // Lazy-load GraphQL server (avoid circular dependencies)
      const { setupGraphQLServer } = await import('../graphql/server');

      // Setup GraphQL with Apollo Server
      await setupGraphQLServer(
        this.app,
        this.httpServer,
        orchestrator,
        this.pool,
        process.env.NODE_ENV !== 'production' // Enable playground in dev
      );

      console.log('✅ GraphQL endpoint configured');

    } catch (err) {
      console.error('❌ Failed to setup GraphQL:', err);
      // Don't fail server startup if GraphQL setup fails
      console.warn('⚠️ GraphQL disabled due to setup error');
    }
  }

  /**
   * Start server
   */
  async start(): Promise<void> {
    try {
      // Test database connection
      await this.pool.query('SELECT 1');
      console.log('✅ Database connection established');

      // Start unified metrics collection (includes Redis, DB pool, circuit breakers)
      this.metricsCollector.start();

      // Create HTTP server (needed for GraphQL WebSocket support)
      const http = await import('http');
      this.httpServer = http.createServer(this.app);

      // Setup GraphQL endpoint (if enabled via feature flag)
      if (process.env.ENABLE_GRAPHQL === 'true') {
        await this.setupGraphQL();
      }

      // Start server
      this.server = this.httpServer.listen(this.config.port, this.config.host, () => {
        console.log(`\n✅ MARCUS Platform Server started`);
        console.log(`   Host: ${this.config.host}`);
        console.log(`   Port: ${this.config.port}`);
        console.log(`   CORS Origins: ${this.config.corsOrigins.join(', ')}`);
        console.log(`   Health: http://${this.config.host}:${this.config.port}/health`);
        if (process.env.ENABLE_GRAPHQL === 'true') {
          console.log(`   GraphQL: http://${this.config.host}:${this.config.port}/graphql\n`);
        } else {
          console.log();
        }
      });

      // Setup graceful shutdown
      this.setupGracefulShutdown();

    } catch (err) {
      console.error('❌ Failed to start server:', err);
      throw err;
    }
  }

  /**
   * Setup graceful shutdown on SIGTERM/SIGINT
   *
   * Implements Phase 3.4.2 requirements:
   * - 30-second timeout for graceful shutdown
   * - Force-kill after timeout
   * - Proper handling of in-flight requests
   * - Clean closure of database and Redis connections
   */
  private setupGracefulShutdown(): void {
    let shuttingDown = false; // Prevent multiple shutdown attempts

    const shutdown = async (signal: string) => {
      // Prevent duplicate shutdown attempts
      if (shuttingDown) {
        console.log(`⚠️ Shutdown already in progress, ignoring ${signal}`);
        return;
      }
      shuttingDown = true;

      const startTime = Date.now();
      console.log(`\n⚠️ Received ${signal}, shutting down gracefully...`);
      console.log(`⏱️ Shutdown timeout: 30 seconds`);

      // Set force-kill timeout (30 seconds)
      const forceKillTimeout = setTimeout(() => {
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        console.error(`\n❌ Graceful shutdown timeout after ${elapsed}s - forcing exit`);
        console.error(`   Some connections may not have closed cleanly`);
        process.exit(1); // Exit with error code
      }, 30000);

      try {
        // Step 1: Stop accepting new connections (but allow in-flight requests to complete)
        if (this.server) {
          await new Promise<void>((resolve, reject) => {
            this.server.close((err) => {
              if (err) {
                console.error('❌ Error closing HTTP server:', err);
                reject(err);
              } else {
                const elapsed = Math.round((Date.now() - startTime) / 1000);
                console.log(`✅ HTTP server closed (${elapsed}s) - all in-flight requests completed`);
                resolve();
              }
            });
          });
        }

        // Step 2: Close database connection pool
        try {
          await this.pool.end();
          const elapsed = Math.round((Date.now() - startTime) / 1000);
          console.log(`✅ Database connections closed (${elapsed}s)`);
        } catch (err) {
          console.error('❌ Error closing database:', err);
        }

        // Step 2.5: Stop metrics collection
        try {
          this.metricsCollector.stop();
          const elapsed = Math.round((Date.now() - startTime) / 1000);
          console.log(`✅ Metrics collector stopped (${elapsed}s)`);
        } catch (err) {
          console.error('❌ Error stopping metrics collector:', err);
        }

        // Step 3: Close Redis connection
        try {
          await this.redis.quit();
          const elapsed = Math.round((Date.now() - startTime) / 1000);
          console.log(`✅ Redis connection closed (${elapsed}s)`);
        } catch (err) {
          console.error('❌ Error closing Redis:', err);
        }

        // Step 4: Close auth service
        try {
          await this.authService.close();
          const elapsed = Math.round((Date.now() - startTime) / 1000);
          console.log(`✅ AuthService closed (${elapsed}s)`);
        } catch (err) {
          console.error('❌ Error closing AuthService:', err);
        }

        // Clear force-kill timeout (successful graceful shutdown)
        clearTimeout(forceKillTimeout);

        const totalElapsed = Math.round((Date.now() - startTime) / 1000);
        console.log(`\n✅ Graceful shutdown complete in ${totalElapsed}s`);
        process.exit(0);

      } catch (err) {
        clearTimeout(forceKillTimeout);
        console.error(`\n❌ Error during shutdown:`, err);
        console.error(`   Forcing exit after error`);
        process.exit(1);
      }
    };

    // Handle SIGTERM (Kubernetes/Docker shutdown signal)
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    // Handle SIGINT (Ctrl+C)
    process.on('SIGINT', () => shutdown('SIGINT'));

    console.log('✅ Graceful shutdown handlers registered (30s timeout)');
  }

  /**
   * Get Express app instance (for testing)
   */
  getApp(): Express {
    return this.app;
  }
}

// ============================================================================
// Default Configuration
// ============================================================================

export function getDefaultConfig(): ServerConfig {
  return {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3333'],

    database: {
      host: process.env.DATABASE_HOST || process.env.PGHOST || process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || process.env.PGPORT || process.env.DB_PORT || '5432', 10),
      database: process.env.POSTGRES_DB || process.env.PGDATABASE || process.env.DATABASE_NAME || process.env.DB_NAME || 'marcus_platform',
      user: process.env.POSTGRES_USER || process.env.PGUSER || process.env.DATABASE_USER || process.env.DB_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD || process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD || '',
      max: parseInt(process.env.DB_POOL_SIZE || '20', 10),
    },

    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      db: parseInt(process.env.REDIS_DB || '0', 10),
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3', 10),
    },

    auth: {
      jwtSecret: process.env.JWT_SECRET,
      jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
      accessTokenTTL: parseInt(process.env.ACCESS_TOKEN_TTL || '900', 10),
      refreshTokenTTL: parseInt(process.env.REFRESH_TOKEN_TTL || '604800', 10),
    },

    rateLimiting: {
      enabled: process.env.RATE_LIMITING_ENABLED !== 'false',
      trustedProxies: process.env.TRUSTED_PROXIES?.split(','),
    },
  };
}

// ============================================================================
// Main Entry Point
// ============================================================================

if (require.main === module) {
  // Start server if run directly
  const config = getDefaultConfig();
  const server = new PlatformServer(config);

  server.start().catch(err => {
    console.error('❌ CRITICAL: Server startup failed:', err);
    process.exit(1);
  });
}
