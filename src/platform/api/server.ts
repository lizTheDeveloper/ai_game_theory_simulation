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

import express = require('express');
import { Express, Request, Response, NextFunction } from 'express';
import cors = require('cors');
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
  private config: ServerConfig;
  private server: any;

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

    // 4. Audit logging middleware
    this.app.use(createAuditMiddleware(this.auditLogger));

    // 5. Request logging
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(
          `${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
        );
      });
      next();
    });

    // 6. Rate limiting (if enabled)
    if (this.config.rateLimiting?.enabled !== false) {
      this.setupRateLimiting();
    }

    console.log('✅ Security middleware initialized:');
    console.log('   - Security Headers (CSP, HSTS, X-Frame-Options)');
    console.log('   - CORS whitelist protection');
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
    // Health check endpoint (public)
    this.app.get('/health', async (req: Request, res: Response) => {
      try {
        // Check database connectivity
        await this.pool.query('SELECT 1');

        // Check Redis connectivity
        await this.redis.ping();

        res.status(200).json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          database: 'connected',
          redis: 'connected',
        });
      } catch (err) {
        res.status(503).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          database: 'error',
          redis: 'error',
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
    this.app.post(
      '/api/citations/analyze',
      this.jwtMiddleware.authenticate,
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

    // GET /api/metrics - Get platform metrics (requires viewer, operator, or admin)
    this.app.get(
      '/api/metrics',
      this.jwtMiddleware.authenticate,
      requirePermission('metrics:read'),
      async (req: Request, res: Response) => {
        try {
          // Return Prometheus metrics in text format
          const { register } = await import('prom-client');

          const metrics = await register.metrics();
          res.set('Content-Type', register.contentType);
          res.send(metrics);

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
    this.app.post(
      '/api/admin/agents',
      this.jwtMiddleware.authenticate,
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
    this.app.get(
      '/api/admin/users',
      this.jwtMiddleware.authenticate,
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
    this.app.put(
      '/api/admin/users/:userId/role',
      this.jwtMiddleware.authenticate,
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
          console.error('❌ Update user role error:', err);
          res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update user role',
          });
        }
      }
    );

    // DELETE /api/admin/users/:userId - Deactivate user (requires admin)
    this.app.delete(
      '/api/admin/users/:userId',
      this.jwtMiddleware.authenticate,
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
   * Start server
   */
  async start(): Promise<void> {
    try {
      // Test database connection
      await this.pool.query('SELECT 1');
      console.log('✅ Database connection established');

      // Start server
      this.server = this.app.listen(this.config.port, this.config.host, () => {
        console.log(`\n✅ MARCUS Platform Server started`);
        console.log(`   Host: ${this.config.host}`);
        console.log(`   Port: ${this.config.port}`);
        console.log(`   CORS Origins: ${this.config.corsOrigins.join(', ')}`);
        console.log(`   Health: http://${this.config.host}:${this.config.port}/health\n`);
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
   */
  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      console.log(`\n⚠️ Received ${signal}, shutting down gracefully...`);

      // Stop accepting new connections
      if (this.server) {
        this.server.close(() => {
          console.log('✅ HTTP server closed');
        });
      }

      // Close database connections
      try {
        await this.pool.end();
        console.log('✅ Database connections closed');
      } catch (err) {
        console.error('❌ Error closing database:', err);
      }

      // Close Redis connection
      try {
        await this.redis.quit();
        console.log('✅ Redis connection closed');
      } catch (err) {
        console.error('❌ Error closing Redis:', err);
      }

      // Close auth service
      try {
        await this.authService.close();
        console.log('✅ AuthService closed');
      } catch (err) {
        console.error('❌ Error closing AuthService:', err);
      }

      console.log('✅ Shutdown complete');
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
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
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'marcus_platform',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
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
