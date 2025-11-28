/**
 * MARCUS 3.0 - Worker Service Orchestrator API Server
 *
 * Minimal TypeScript API server for the worker service architecture pattern.
 * This orchestrator does NOT spawn Python processes - it submits tasks to Redis
 * queue for independent worker containers to process.
 *
 * Architecture:
 * - Client → POST /api/citations/analyze → Redis queue
 * - Worker pulls task → Processes → Stores result in Redis
 * - Client → GET /api/citations/:task_id → Retrieve result
 *
 * Benefits:
 * - Loosely coupled (workers independent from orchestrator)
 * - Horizontally scalable (scale workers without restarting orchestrator)
 * - Failure isolated (worker crash doesn't affect orchestrator)
 * - Cloud-ready (Kubernetes-native pattern)
 *
 * @module worker-orchestrator-server
 * @author Marcus (Platform Engineer)
 * @date 2025-11-22
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Pool as PostgresPool } from 'pg';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { register as promRegister } from 'prom-client';
import {
  CircuitBreaker,
  CircuitBreakerFactory,
  CircuitBreakerOpenError,
  CircuitBreakerTimeoutError
} from '../utils/circuit-breaker';

// ============================================================================
// Type Definitions
// ============================================================================

interface CitationDocument {
  text: string;
  claimedSource: string;
  actualSource?: string;
  metadata?: Record<string, any>;
}

interface CitationTask {
  task_id: string;
  document: CitationDocument;
  submitted_at: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  priority?: number;
}

interface TaskResult {
  task_id: string;
  status: 'pending' | 'completed' | 'failed';
  result?: {
    integrity_score: number;
    behavior_used: string;
    confidence: number;
    detected_violations: string[];
    metadata: Record<string, any>;
    agent_id: string;
    agent_reputation: number;
  };
  error?: string;
  submitted_at?: number;
  completed_at?: number;
}

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  port: parseInt(process.env.API_PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    db: parseInt(process.env.REDIS_DB || '0', 10),
    password: process.env.REDIS_PASSWORD,
    clusterMode: process.env.REDIS_CLUSTER_MODE === 'true',
  },

  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    database: process.env.DATABASE_NAME || 'citation_integrity',
    user: process.env.DATABASE_USER || 'marcus',
    password: process.env.DATABASE_PASSWORD || '',
    max: parseInt(process.env.DB_POOL_SIZE || '10', 10),
  },

  queue: {
    taskQueue: 'citations:tasks',
    resultPrefix: 'citations:results:',
    resultTTL: 3600, // 1 hour
  },

  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3333'],
  },
};

// ============================================================================
// Worker Orchestrator Server
// ============================================================================

class WorkerOrchestratorServer {
  private app: Express;
  private redis: Redis;
  private db: PostgresPool;
  private server: any;
  private dbCircuitBreaker: CircuitBreaker;
  private redisCircuitBreaker: CircuitBreaker;

  constructor() {
    this.app = express();

    // Initialize circuit breakers
    this.dbCircuitBreaker = CircuitBreakerFactory.forDatabase('PostgreSQL');
    this.redisCircuitBreaker = CircuitBreakerFactory.forCache('Redis');

    console.log('✅ Circuit breakers initialized');

    // Initialize Redis client (cluster or standalone)
    if (CONFIG.redis.clusterMode) {
      this.redis = new Redis.Cluster([
        {
          host: CONFIG.redis.host,
          port: CONFIG.redis.port,
        },
      ], {
        redisOptions: {
          password: CONFIG.redis.password,
        },
        enableReadyCheck: true,
        maxRedirections: 16,
      });
    } else {
      this.redis = new Redis({
        host: CONFIG.redis.host,
        port: CONFIG.redis.port,
        db: CONFIG.redis.db,
        password: CONFIG.redis.password,
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 100, 3000);
          return delay;
        },
      });
    }

    // Initialize PostgreSQL pool
    this.db = new PostgresPool({
      host: CONFIG.database.host,
      port: CONFIG.database.port,
      database: CONFIG.database.database,
      user: CONFIG.database.user,
      password: CONFIG.database.password,
      max: CONFIG.database.max,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Execute database query with circuit breaker protection
   */
  private async dbQuery<T = any>(
    query: string,
    params?: any[]
  ): Promise<{ rows: T[]; rowCount: number }> {
    return this.dbCircuitBreaker.execute(async () => {
      return this.db.query(query, params);
    });
  }

  /**
   * Execute Redis command with circuit breaker protection
   */
  private async redisExec<T = any>(
    fn: () => Promise<T>
  ): Promise<T> {
    return this.redisCircuitBreaker.execute(fn);
  }

  private setupMiddleware(): void {
    // CORS
    this.app.use(cors({
      origin: CONFIG.cors.origins,
      credentials: true,
    }));

    // JSON parsing
    this.app.use(express.json());

    // Request logging
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        // lgtm[js/log-injection] - req.method and req.path are standard Express properties
        console.log(
          `${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
        );
      });
      next();
    });
  }

  private setupRoutes(): void {
    // ========================================================================
    // Health Check Endpoints
    // ========================================================================

    this.app.get('/health', async (req: Request, res: Response) => {
      try {
        const components: Record<string, string> = {};
        let queueDepth = 0;

        // Check Redis with circuit breaker
        try {
          await this.redisExec(() => this.redis.ping());
          queueDepth = await this.redisExec(() => this.redis.llen(CONFIG.queue.taskQueue));
          components.redis = 'healthy';
        } catch (err) {
          if (err instanceof CircuitBreakerOpenError) {
            components.redis = 'circuit_open';
          } else {
            components.redis = 'unhealthy';
          }
        }

        // Check PostgreSQL with circuit breaker
        try {
          await this.dbQuery('SELECT 1');
          components.database = 'healthy';
        } catch (err) {
          if (err instanceof CircuitBreakerOpenError) {
            components.database = 'circuit_open';
          } else {
            components.database = 'unhealthy';
          }
        }

        // Include circuit breaker metrics
        const circuitMetrics = {
          redis: this.redisCircuitBreaker.getMetrics(),
          database: this.dbCircuitBreaker.getMetrics()
        };

        const allHealthy = Object.values(components).every(status => status === 'healthy');

        res.status(allHealthy ? 200 : 503).json({
          status: allHealthy ? 'healthy' : 'degraded',
          timestamp: new Date().toISOString(),
          components,
          queue: {
            depth: queueDepth,
          },
          circuitBreakers: circuitMetrics
        });
      } catch (err) {
        console.error('❌ Health check failed:', err);
        res.status(503).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: (err as Error).message,
        });
      }
    });

    // ========================================================================
    // Citation Analysis Endpoints
    // ========================================================================

    // POST /api/citations/analyze - Submit task to queue
    this.app.post(
      '/api/citations/analyze',
      async (req: Request, res: Response) => {
        try {
          const { document } = req.body;

          if (!document || !document.text || !document.claimedSource) {
            res.status(400).json({
              error: 'Bad Request',
              message: 'document.text and document.claimedSource are required',
            });
            return;
          }

          // Generate task ID
          const task_id = uuidv4();

          // Create task
          const task: CitationTask = {
            task_id,
            document,
            submitted_at: Date.now(),
            status: 'queued',
          };

          // Store task metadata in PostgreSQL (with circuit breaker)
          await this.dbQuery(
            `INSERT INTO citation_tasks (task_id, document, created_at, status)
             VALUES ($1, $2, $3, $4)`,
            [task_id, JSON.stringify(document), new Date(), 'pending']
          );

          // Push task to Redis queue (with circuit breaker)
          await this.redisExec(() =>
            this.redis.lpush(
              CONFIG.queue.taskQueue,
              JSON.stringify(task)
            )
          );

          console.log(`📤 Task ${task_id} queued for processing`);

          res.status(202).json({
            task_id,
            status: 'queued',
            message: 'Task submitted successfully',
          });

        } catch (err) {
          console.error('❌ Failed to submit task:', err);

          // Check if circuit breaker is open
          if (err instanceof CircuitBreakerOpenError) {
            res.status(503).json({
              error: 'Service Unavailable',
              message: 'System is experiencing high load - circuit breaker open',
              retryAfter: 30
            });
            return;
          }

          res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to submit citation analysis task',
          });
        }
      }
    );

    // GET /api/citations/:task_id - Check task status and retrieve result
    this.app.get(
      '/api/citations/:task_id',
      async (req: Request, res: Response) => {
        try {
          const { task_id } = req.params;

          // Check if result exists in Redis (workers store results here) - with circuit breaker
          const resultKey = `${CONFIG.queue.resultPrefix}${task_id}`;
          let resultJson: string | null = null;

          try {
            resultJson = await this.redisExec(() => this.redis.get(resultKey));
          } catch (err) {
            // If Redis circuit is open, fall back to database
            if (err instanceof CircuitBreakerOpenError) {
              console.log('⚠️ Redis circuit open - falling back to database for task result');
            }
          }

          if (resultJson) {
            // Result available
            const result = JSON.parse(resultJson);

            // Update task status in database (with circuit breaker)
            try {
              await this.dbQuery(
                `UPDATE citation_tasks
                 SET status = $1, completed_at = $2, result = $3
                 WHERE task_id = $4`,
                ['completed', new Date(), JSON.stringify(result), task_id]
              );
            } catch (err) {
              // Non-critical - result already available
              console.warn('⚠️ Failed to update task status in database:', err);
            }

            res.status(200).json({
              task_id,
              status: 'completed',
              result: result.result,
              stats: result.stats,
              agent_id: result.agent_id,
              agent_reputation: result.agent_reputation,
              submitted_at: result.submitted_at,
              completed_at: Date.now(),
            } as TaskResult);

            return;
          }

          // Check database for task metadata (with circuit breaker)
          const taskResult = await this.dbQuery(
            `SELECT task_id, status, created_at, completed_at, result
             FROM citation_tasks
             WHERE task_id = $1`,
            [task_id]
          );

          if (taskResult.rows.length === 0) {
            res.status(404).json({
              error: 'Not Found',
              message: `Task ${task_id} not found`,
            });
            return;
          }

          const task = taskResult.rows[0];

          // Task exists but not completed yet
          res.status(200).json({
            task_id,
            status: task.status,
            submitted_at: task.created_at.getTime(),
            message: 'Task is still processing',
          } as TaskResult);

        } catch (err) {
          console.error('❌ Failed to retrieve task:', err);

          // Check if circuit breaker is open
          if (err instanceof CircuitBreakerOpenError) {
            res.status(503).json({
              error: 'Service Unavailable',
              message: 'Database temporarily unavailable - circuit breaker open',
              retryAfter: 30
            });
            return;
          }

          res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to retrieve task status',
          });
        }
      }
    );

    // GET /api/queue/stats - Queue statistics
    this.app.get('/api/queue/stats', async (req: Request, res: Response) => {
      try {
        const queueDepth = await this.redisExec(() => this.redis.llen(CONFIG.queue.taskQueue));

        // Count tasks by status (with circuit breaker)
        const statusCounts = await this.dbQuery(`
          SELECT status, COUNT(*) as count
          FROM citation_tasks
          WHERE created_at > NOW() - INTERVAL '1 hour'
          GROUP BY status
        `);

        const stats: Record<string, number> = {};
        for (const row of statusCounts.rows) {
          stats[row.status] = parseInt(row.count, 10);
        }

        res.status(200).json({
          queue_depth: queueDepth,
          recent_tasks: stats,
          timestamp: new Date().toISOString(),
        });

      } catch (err) {
        console.error('❌ Failed to get queue stats:', err);

        if (err instanceof CircuitBreakerOpenError) {
          res.status(503).json({
            error: 'Service Unavailable',
            message: 'Queue statistics temporarily unavailable - circuit breaker open',
          });
          return;
        }

        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to retrieve queue statistics',
        });
      }
    });

    // GET /api/metrics - Prometheus metrics
    this.app.get('/api/metrics', async (req: Request, res: Response) => {
      try {
        res.set('Content-Type', promRegister.contentType);
        res.end(await promRegister.metrics());
      } catch (err) {
        console.error('❌ Metrics error:', err);
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to retrieve metrics',
        });
      }
    });

    // GET /ready - Kubernetes readiness probe
    this.app.get('/ready', async (req: Request, res: Response) => {
      try {
        // Check Redis connection (with circuit breaker)
        await this.redisExec(() => this.redis.ping());

        // Check database connection (with circuit breaker)
        await this.dbQuery('SELECT 1');

        res.status(200).json({
          status: 'ready',
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error('❌ Readiness check failed:', err);

        // Return 503 if circuit breaker is open
        if (err instanceof CircuitBreakerOpenError) {
          res.status(503).json({
            status: 'not ready',
            reason: 'circuit_breaker_open',
            error: err.message,
          });
          return;
        }

        res.status(503).json({
          status: 'not ready',
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    });

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
      });
    });
  }

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

  async start(): Promise<void> {
    try {
      // Test Redis connection (with circuit breaker)
      await this.redisExec(() => this.redis.ping());
      console.log('✅ Redis connection established');

      // Test database connection (with circuit breaker)
      await this.dbQuery('SELECT 1');
      console.log('✅ Database connection established');

      // Ensure citation_tasks table exists
      await this.ensureTasksTable();

      // Start server
      this.server = this.app.listen(CONFIG.port, CONFIG.host, () => {
        console.log(`\n✅ MARCUS Worker Orchestrator started`);
        console.log(`   Architecture: Worker Service Pattern`);
        console.log(`   Host: ${CONFIG.host}`);
        console.log(`   Port: ${CONFIG.port}`);
        console.log(`   Task Queue: ${CONFIG.queue.taskQueue}`);
        console.log(`   Health: http://${CONFIG.host}:${CONFIG.port}/health\n`);
      });

      // Setup graceful shutdown
      this.setupGracefulShutdown();

    } catch (err) {
      console.error('❌ Failed to start server:', err);
      throw err;
    }
  }

  private async ensureTasksTable(): Promise<void> {
    try {
      await this.dbQuery(`
        CREATE TABLE IF NOT EXISTS citation_tasks (
          task_id VARCHAR(50) PRIMARY KEY,
          document JSONB NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          started_at TIMESTAMP,
          completed_at TIMESTAMP,
          status VARCHAR(20) NOT NULL DEFAULT 'pending',
          result JSONB,
          error TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_tasks_status ON citation_tasks(status);
        CREATE INDEX IF NOT EXISTS idx_tasks_created ON citation_tasks(created_at DESC);
      `);

      console.log('✅ citation_tasks table ready');
    } catch (err) {
      console.error('❌ Failed to create citation_tasks table:', err);
      throw err;
    }
  }

  private setupGracefulShutdown(): void {
    let shuttingDown = false;

    const shutdown = async (signal: string) => {
      if (shuttingDown) {
        console.log(`⚠️ Shutdown already in progress, ignoring ${signal}`);
        return;
      }
      shuttingDown = true;

      console.log(`\n⚠️ Received ${signal}, shutting down gracefully...`);

      try {
        // Stop accepting new connections
        if (this.server) {
          await new Promise<void>((resolve, reject) => {
            this.server.close((err) => {
              if (err) {
                console.error('❌ Error closing HTTP server:', err);
                reject(err);
              } else {
                console.log('✅ HTTP server closed');
                resolve();
              }
            });
          });
        }

        // Close database pool
        await this.db.end();
        console.log('✅ Database connections closed');

        // Close Redis connection
        await this.redis.quit();
        console.log('✅ Redis connection closed');

        console.log('\n✅ Graceful shutdown complete');
        process.exit(0);

      } catch (err) {
        console.error('\n❌ Error during shutdown:', err);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    console.log('✅ Graceful shutdown handlers registered');
  }
}

// ============================================================================
// Main Entry Point
// ============================================================================

if (require.main === module) {
  const server = new WorkerOrchestratorServer();

  server.start().catch(err => {
    console.error('❌ CRITICAL: Server startup failed:', err);
    process.exit(1);
  });
}

export { WorkerOrchestratorServer };
