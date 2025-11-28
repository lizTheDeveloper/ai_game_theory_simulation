/**
 * Example Integration: Resilient Citation Analysis Platform
 *
 * Demonstrates how all resilience components work together
 * in the MARCUS 3.0 Citation Integrity Platform.
 *
 * @module platform/resilience/example-integration
 */

import { circuitBreakerManager } from './circuitBreaker';
import { retryWithBackoff } from './retryHandler';
import { DeadLetterQueue } from './deadLetterQueue';
import { createDatabasePool, DatabasePool } from '../database/pool';
import { gracefulShutdown } from './gracefulShutdown';
import { sanitizeForLog } from '../utils/logSanitizer';
import Redis from 'ioredis';
import express from 'express';

// ============================================================================
// Configuration
// ============================================================================

const config = {
  database: {
    host: process.env.DATABASE_HOST || process.env.PGHOST || process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || process.env.PGPORT || process.env.DB_PORT || '5432'),
    database: process.env.POSTGRES_DB || process.env.PGDATABASE || process.env.DB_NAME || 'marcus',
    user: process.env.POSTGRES_USER || process.env.PGUSER || process.env.DB_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD || process.env.DB_PASSWORD || '',
    min: 10,
    max: 50,
    healthCheckInterval: 30000,
    slowQueryThreshold: 1000
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    db: 0
  },
  circuitBreaker: {
    database: {
      failureThreshold: 5,
      timeout: 60000,
      successThreshold: 3
    },
    redis: {
      failureThreshold: 3,
      timeout: 30000,
      successThreshold: 2
    }
  },
  retry: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    jitter: true
  },
  dlq: {
    maxRetries: 5,
    retryDelays: [
      60 * 1000,          // 1 minute
      5 * 60 * 1000,      // 5 minutes
      30 * 60 * 1000,     // 30 minutes
      2 * 60 * 60 * 1000, // 2 hours
      6 * 60 * 60 * 1000  // 6 hours
    ],
    pollingInterval: 10000,
    alertThreshold: 100
  }
};

// ============================================================================
// Initialize Resources
// ============================================================================

// Database pool
const dbPool = createDatabasePool(config.database);

// Redis client
const redisClient = new Redis(config.redis);

// Circuit breakers
const dbCircuitBreaker = circuitBreakerManager.getBreaker({
  name: 'postgresql',
  ...config.circuitBreaker.database,
  onStateChange: (from, to) => {
    console.log(`🔌 Database circuit breaker: ${from} → ${to}`);
    if (to === 'OPEN') {
      // Alert: Database circuit breaker opened!
      console.log('🚨 ALERT: Database circuit breaker OPEN');
    }
  }
});

const redisCircuitBreaker = circuitBreakerManager.getBreaker({
  name: 'redis',
  ...config.circuitBreaker.redis,
  fallback: () => null,  // Fallback to DB on Redis failure
  onStateChange: (from, to) => {
    console.log(`🔌 Redis circuit breaker: ${from} → ${to}`);
  }
});

// Dead Letter Queue
const citationDLQ = new DeadLetterQueue({
  redis: redisClient,
  queueName: 'citation-analysis',
  ...config.dlq
});

// Alert on high DLQ depth
citationDLQ.on('alert', ({ depth, threshold }) => {
  console.log(`🚨 ALERT: DLQ depth ${depth} exceeds threshold ${threshold}`);
});

// ============================================================================
// Register Resources for Graceful Shutdown
// ============================================================================

gracefulShutdown.registerDatabasePool(dbPool);
gracefulShutdown.registerRedisClient(redisClient);
gracefulShutdown.registerDLQWorker(citationDLQ);

// ============================================================================
// Business Logic: Citation Analysis
// ============================================================================

interface CitationAnalysisRequest {
  documentId: string;
  text: string;
  userId: string;
}

interface CitationAnalysisResult {
  documentId: string;
  integrityScore: number;
  violations: string[];
  recommendations: string[];
  cached: boolean;
}

/**
 * Analyze citation with full resilience stack
 */
async function analyzeCitation(
  request: CitationAnalysisRequest
): Promise<CitationAnalysisResult> {
  const { documentId, text, userId } = request;

  // Step 1: Try cache (with circuit breaker)
  const cacheKey = `citation:${documentId}`;
  let cachedResult: CitationAnalysisResult | null = null;

  try {
    cachedResult = await redisCircuitBreaker.execute(async () => {
      const cached = await redisClient.get(cacheKey);
      return cached ? JSON.parse(cached) : null;
    });

    if (cachedResult) {
      console.log(`✅ Cache hit for document ${sanitizeForLog(documentId)}`); // lgtm[js/log-injection] - sanitized
      return { ...cachedResult, cached: true };
    }
  } catch (error) {
    console.log(`⚠️ Cache miss (circuit open or error), proceeding to DB`);
  }

  // Step 2: Perform analysis (with circuit breaker + retry + DLQ)
  try {
    const result = await dbCircuitBreaker.execute(async () => {
      return await retryWithBackoff(
        async () => {
          // Simulate citation analysis
          const analysis = await performCitationAnalysis(text);

          // Save to database
          await dbPool.transaction(async (client) => {
            await client.query(
              `INSERT INTO citation_analyses (document_id, user_id, integrity_score, violations, recommendations, timestamp)
               VALUES ($1, $2, $3, $4, $5, NOW())`,
              [
                documentId,
                userId,
                analysis.integrityScore,
                JSON.stringify(analysis.violations),
                JSON.stringify(analysis.recommendations)
              ]
            );
          });

          return analysis;
        },
        {
          ...config.retry,
          onRetry: (attempt, delay, error) => {
            // lgtm[js/log-injection] - sanitized via sanitizeForLog
            console.log(
              `⚠️ Retry ${attempt}/${config.retry.maxRetries} for document ${sanitizeForLog(documentId)} ` +
              `after ${delay}ms (error: ${sanitizeForLog(error.message)})`
            );
          }
        },
        'citation-analysis'
      );
    });

    // Step 3: Update cache (fire-and-forget)
    redisCircuitBreaker.execute(async () => {
      await redisClient.set(cacheKey, JSON.stringify(result), 'EX', 3600);
    }).catch(err => {
      console.log(`⚠️ Failed to update cache: ${sanitizeForLog(err.message)}`);
    });

    return { ...result, cached: false };
  } catch (error: any) {
    console.error(`❌ Citation analysis failed for document ${sanitizeForLog(documentId)}: ${sanitizeForLog(error.message)}`); // lgtm[js/log-injection] - sanitized

    // Step 4: Add to Dead Letter Queue for retry
    await citationDLQ.add({
      operation: 'citation-analysis',
      payload: request,
      error: error.message,
      retryCount: 0,
      maxRetries: config.dlq.maxRetries,
      metadata: { userId, documentId }
    });

    throw error;
  }
}

/**
 * Simulate citation analysis (placeholder)
 */
async function performCitationAnalysis(text: string): Promise<Omit<CitationAnalysisResult, 'documentId' | 'cached'>> {
  // In real implementation, this would:
  // 1. Spawn Python agents
  // 2. Aggregate results
  // 3. Calculate consensus

  return {
    integrityScore: Math.random(),
    violations: [],
    recommendations: []
  };
}

// ============================================================================
// Start DLQ Worker
// ============================================================================

citationDLQ.startWorker(async (payload: CitationAnalysisRequest) => {
  console.log(`🔄 Retrying citation analysis from DLQ: ${sanitizeForLog(payload.documentId)}`);

  // Retry the analysis
  await analyzeCitation(payload);
});

// ============================================================================
// HTTP API
// ============================================================================

const app = express();
app.use(express.json());

/**
 * POST /api/citations/analyze
 */
app.post('/api/citations/analyze', async (req, res) => {
  try {
    const request: CitationAnalysisRequest = req.body;

    const result = await analyzeCitation(request);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(503).json({
      success: false,
      error: error.message,
      message: 'Analysis failed, added to retry queue'
    });
  }
});

/**
 * GET /health
 */
app.get('/health', async (req, res) => {
  const shutdownStatus = gracefulShutdown.getHealthStatus();

  if (shutdownStatus.shutting_down) {
    res.status(503)
      .header('Connection', 'close')
      .json({
        status: 'shutting_down',
        message: 'Server is shutting down gracefully'
      });
    return;
  }

  const dbHealthy = dbPool.isHealthy();
  const circuitBreakers = circuitBreakerManager.getHealthStatus();

  const healthy = dbHealthy && circuitBreakers.every(cb => cb.healthy);

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    database: {
      healthy: dbHealthy,
      metrics: dbPool.getMetrics()
    },
    circuitBreakers: circuitBreakers,
    dlq: {
      depth: await citationDLQ.getDepth(),
      stats: await citationDLQ.getStats()
    }
  });
});

/**
 * GET /metrics
 */
app.get('/metrics', async (req, res) => {
  // In production, this would return Prometheus metrics
  res.set('Content-Type', 'text/plain');
  res.send('# Prometheus metrics endpoint');
});

/**
 * GET /api/admin/dlq
 */
app.get('/api/admin/dlq', async (req, res) => {
  const offset = parseInt(req.query.offset as string) || 0;
  const limit = parseInt(req.query.limit as string) || 50;

  const items = await citationDLQ.getAllItems(offset, limit);
  const stats = await citationDLQ.getStats();

  res.json({
    items,
    stats,
    pagination: { offset, limit }
  });
});

/**
 * POST /api/admin/dlq/:id/retry
 */
app.post('/api/admin/dlq/:id/retry', async (req, res) => {
  const { id } = req.params;

  const items = await citationDLQ.getAllItems();
  const item = items.find(i => i.id === id);

  if (!item) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  const success = await citationDLQ.retry(item, async (payload) => {
    await analyzeCitation(payload);
  });

  res.json({ success, id });
});

// ============================================================================
// Start Server
// ============================================================================

const PORT = parseInt(process.env.PORT || '3000');

const server = app.listen(PORT, () => {
  console.log(`\n🚀 MARCUS 3.0 Citation Integrity Platform`);
  console.log(`📡 Server listening on port ${PORT}`);
  console.log(`\nEndpoints:`);
  console.log(`  POST /api/citations/analyze - Analyze citation`);
  console.log(`  GET  /health                - Health check`);
  console.log(`  GET  /metrics               - Prometheus metrics`);
  console.log(`  GET  /api/admin/dlq         - View DLQ items`);
  console.log(`\nResilience components:`);
  console.log(`  ✅ Circuit breakers (DB, Redis)`);
  console.log(`  ✅ Retry logic (exponential backoff)`);
  console.log(`  ✅ Dead letter queue (5 retries)`);
  console.log(`  ✅ Database connection pool (10-50 connections)`);
  console.log(`  ✅ Graceful shutdown (SIGTERM/SIGINT)`);
  console.log(`\nPress Ctrl+C to shutdown gracefully\n`);
});

// Register HTTP server for graceful shutdown
gracefulShutdown.registerHttpServer(server);

// ============================================================================
// Example Usage
// ============================================================================

/**
 * Example: Analyze a citation
 */
async function exampleUsage() {
  const request: CitationAnalysisRequest = {
    documentId: 'doc-123',
    text: 'According to Smith et al. (2024), citation integrity is critical...',
    userId: 'user-456'
  };

  try {
    const result = await analyzeCitation(request);
    console.log('Analysis result:', result);
  } catch (error) {
    console.error('Analysis failed:', error);
  }
}

// Uncomment to test:
// exampleUsage();
