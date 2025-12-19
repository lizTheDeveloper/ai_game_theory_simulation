/**
 * Prometheus Metrics Endpoint
 *
 * Exposes platform metrics in Prometheus format for monitoring
 *
 * Metrics exposed:
 * - HTTP request duration histogram
 * - HTTP request count counter
 * - Active connections gauge
 * - Python agent status gauge
 * - Database connection pool metrics
 * - Circuit breaker state metrics
 *
 * @module monitoring/metricsEndpoint
 */

import { Request, Response, Express } from 'express';
import promClient from 'prom-client';
import {
  normalizeRoute,
  bucketStatusCode,
  normalizeAgentId,
  classifyError,
  normalizeLockName,
  normalizeQueueName,
  normalizeComponent,
  normalizeSeverity
} from './metricsHelpers';

// Create a Registry to register metrics
const register = new promClient.Registry();

// Add default Node.js metrics (memory, CPU, event loop, etc.)
promClient.collectDefaultMetrics({ register });

/**
 * HTTP request duration histogram
 */
export const httpRequestDuration = new promClient.Histogram({
  name: 'marcus_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.015, 0.05, 0.1, 0.5, 1, 5],
  registers: [register]
});

/**
 * HTTP request counter
 */
export const httpRequestCounter = new promClient.Counter({
  name: 'marcus_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

/**
 * Active HTTP connections gauge
 */
export const activeConnections = new promClient.Gauge({
  name: 'marcus_http_active_connections',
  help: 'Number of active HTTP connections',
  registers: [register]
});

/**
 * Python agent status gauge (1 = healthy, 0 = unhealthy)
 */
export const agentStatus = new promClient.Gauge({
  name: 'marcus_agent_status',
  help: 'Status of Python agents (1 = healthy, 0 = unhealthy)',
  labelNames: ['agent_id'],
  registers: [register]
});

/**
 * Python agent request duration histogram
 */
export const agentRequestDuration = new promClient.Histogram({
  name: 'marcus_agent_request_duration_seconds',
  help: 'Duration of Python agent requests in seconds',
  labelNames: ['agent_id', 'method'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5, 10, 30],
  registers: [register]
});

/**
 * Database connection pool metrics
 */
export const dbPoolSize = new promClient.Gauge({
  name: 'marcus_db_pool_size',
  help: 'Current size of database connection pool',
  labelNames: ['pool_type'],
  registers: [register]
});

export const dbPoolWaiting = new promClient.Gauge({
  name: 'marcus_db_pool_waiting',
  help: 'Number of clients waiting for a connection',
  registers: [register]
});

/**
 * Circuit breaker state gauge (0 = CLOSED, 1 = HALF_OPEN, 2 = OPEN)
 */
export const circuitBreakerState = new promClient.Gauge({
  name: 'marcus_circuit_breaker_state',
  help: 'Circuit breaker state (0 = CLOSED, 1 = HALF_OPEN, 2 = OPEN)',
  labelNames: ['breaker_name'],
  registers: [register]
});

/**
 * Circuit breaker failure counter
 */
export const circuitBreakerFailures = new promClient.Counter({
  name: 'marcus_circuit_breaker_failures_total',
  help: 'Total number of circuit breaker failures',
  labelNames: ['breaker_name'],
  registers: [register]
});

/**
 * Citation analysis metrics
 */
export const citationAnalysisCounter = new promClient.Counter({
  name: 'marcus_citation_analysis_total',
  help: 'Total number of citation analyses performed',
  labelNames: ['agent_id', 'result'],
  registers: [register]
});

export const citationAnalysisDuration = new promClient.Histogram({
  name: 'marcus_citation_analysis_duration_seconds',
  help: 'Duration of citation analysis in seconds',
  labelNames: ['agent_id'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
  registers: [register]
});

/**
 * Authentication metrics
 */
export const authAttempts = new promClient.Counter({
  name: 'marcus_auth_attempts_total',
  help: 'Total number of authentication attempts',
  labelNames: ['result'], // success, failure, locked
  registers: [register]
});

export const activeTokens = new promClient.Gauge({
  name: 'marcus_active_tokens',
  help: 'Number of active JWT tokens',
  labelNames: ['token_type'], // access, refresh
  registers: [register]
});

/**
 * Redis metrics
 */
export const redisMemoryUsage = new promClient.Gauge({
  name: 'marcus_redis_memory_bytes',
  help: 'Redis memory usage in bytes',
  labelNames: ['type'], // used, peak, rss
  registers: [register]
});

export const redisConnectedClients = new promClient.Gauge({
  name: 'marcus_redis_connected_clients',
  help: 'Number of clients connected to Redis',
  registers: [register]
});

export const redisCommandsDuration = new promClient.Histogram({
  name: 'marcus_redis_command_duration_seconds',
  help: 'Redis command execution duration',
  labelNames: ['command'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1], // 1ms to 1s
  registers: [register]
});

export const redisKeyspaceHits = new promClient.Counter({
  name: 'marcus_redis_keyspace_hits_total',
  help: 'Total number of successful key lookups',
  registers: [register]
});

export const redisKeyspaceMisses = new promClient.Counter({
  name: 'marcus_redis_keyspace_misses_total',
  help: 'Total number of failed key lookups',
  registers: [register]
});

/**
 * MARCUS 3.1 - Enhanced Monitoring Metrics (M3)
 *
 * Added missing metrics:
 * - Error classification (by error type)
 * - Queue processing metrics (depth, lag, throughput)
 * - State synchronization metrics (delay, lock contention)
 * - P95/P99 latency tracking (via histogram buckets)
 */

/**
 * Error classification counter - track errors by type
 */
export const errorsByType = new promClient.Counter({
  name: 'marcus_errors_total',
  help: 'Total number of errors by type',
  labelNames: ['error_type', 'component', 'severity'],
  registers: [register]
});

/**
 * Error rate gauge - percentage of requests that error
 */
export const errorRate = new promClient.Gauge({
  name: 'marcus_error_rate',
  help: 'Current error rate (errors per second)',
  labelNames: ['component'],
  registers: [register]
});

/**
 * Queue metrics - message queue depth and processing
 */
export const queueDepth = new promClient.Gauge({
  name: 'marcus_queue_depth',
  help: 'Current number of items in queue',
  labelNames: ['queue_name'],
  registers: [register]
});

export const queueProcessingLag = new promClient.Gauge({
  name: 'marcus_queue_processing_lag_seconds',
  help: 'Age of oldest item in queue (seconds)',
  labelNames: ['queue_name'],
  registers: [register]
});

export const queueThroughput = new promClient.Gauge({
  name: 'marcus_queue_throughput_items_per_second',
  help: 'Queue processing throughput (items/second)',
  labelNames: ['queue_name'],
  registers: [register]
});

export const queueProcessingDuration = new promClient.Histogram({
  name: 'marcus_queue_processing_duration_seconds',
  help: 'Time to process queue items',
  labelNames: ['queue_name'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5, 10, 30],
  registers: [register]
});

/**
 * State synchronization metrics
 */
export const stateSyncDelay = new promClient.Histogram({
  name: 'marcus_state_sync_delay_seconds',
  help: 'Delay between orchestrator state update and database persistence',
  labelNames: ['sync_type'], // agent_state, analysis_result
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register]
});

export const cacheHitRatio = new promClient.Gauge({
  name: 'marcus_cache_hit_ratio',
  help: 'Cache hit ratio (0-1)',
  labelNames: ['cache_type'], // redis, memory
  registers: [register]
});

export const lockContentionCounter = new promClient.Counter({
  name: 'marcus_lock_contention_total',
  help: 'Total number of lock acquisition failures or waits',
  labelNames: ['lock_name', 'result'], // acquired, timeout, failed
  registers: [register]
});

export const lockAcquisitionDuration = new promClient.Histogram({
  name: 'marcus_lock_acquisition_duration_seconds',
  help: 'Time spent acquiring distributed locks',
  labelNames: ['lock_name'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register]
});

export const lockHoldDuration = new promClient.Histogram({
  name: 'marcus_lock_hold_duration_seconds',
  help: 'Time locks are held',
  labelNames: ['lock_name'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register]
});

/**
 * Cardinality monitoring metric
 * Tracks number of time series per metric to detect cardinality explosion
 */
export const metricCardinality = new promClient.Gauge({
  name: 'marcus_metric_cardinality',
  help: 'Number of unique time series per metric',
  labelNames: ['metric_name'],
  registers: [register]
});

/**
 * DEPRECATED: Use normalizeRoute() from metricsHelpers instead
 * This function is kept for backward compatibility but delegates to the helper.
 */
function normalizeRoutePath(path: string): string {
  return normalizeRoute(path);
}

/**
 * Express middleware to track HTTP request metrics
 */
export function metricsMiddleware(req: Request, res: Response, next: Function): void {
  const start = Date.now();

  // Track active connections
  activeConnections.inc();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000; // Convert to seconds

    // Normalize the route path for better metric grouping (with cardinality control)
    const route = normalizeRoute(req.path);

    // Bucket status codes into ranges (2xx, 3xx, 4xx, 5xx) to reduce cardinality
    const statusBucket = bucketStatusCode(res.statusCode);

    httpRequestDuration.observe({
      method: req.method,
      route,
      status_code: statusBucket
    }, duration);

    httpRequestCounter.inc({
      method: req.method,
      route,
      status_code: statusBucket
    });

    activeConnections.dec();
  });

  next();
}

/**
 * Metrics endpoint handler
 */
export async function metricsHandler(req: Request, res: Response): Promise<void> {
  try {
    res.setHeader('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.status(200).send(metrics);
  } catch (err: any) {
    res.status(500).send(`Error generating metrics: ${err.message}`);
  }
}

/**
 * Setup metrics endpoint on Express app
 *
 * Usage:
 * ```typescript
 * import { setupMetricsEndpoint } from './monitoring/metricsEndpoint';
 * setupMetricsEndpoint(app);
 * ```
 */
export function setupMetricsEndpoint(app: Express): void {
  // Apply metrics middleware to all routes
  app.use(metricsMiddleware);

  // Expose /metrics endpoint
  app.get('/metrics', metricsHandler);

  console.log('✅ Prometheus metrics endpoint configured at /metrics');
}

/**
 * Health check endpoint
 */
export function healthCheckHandler(req: Request, res: Response): void {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '0.0.0'
  });
}

/**
 * Setup health check endpoint
 */
export function setupHealthCheck(app: Express): void {
  app.get('/health', healthCheckHandler);
  console.log('✅ Health check endpoint configured at /health');
}

/**
 * Calculate and update cardinality metrics
 *
 * Call periodically (e.g., every 60 seconds) to track metric cardinality growth.
 * Alerts if any metric exceeds 1,000 time series.
 */
export async function updateCardinalityMetrics(): Promise<void> {
  try {
    const metrics = await register.getMetricsAsJSON();

    for (const metric of metrics) {
      // Count unique time series (each value is a unique label combination)
      const cardinality = metric.values.length;

      // Update cardinality metric
      metricCardinality.set({ metric_name: metric.name }, cardinality);

      // Alert on high cardinality (>1,000 time series)
      if (cardinality > 1000) {
        console.warn(
          `⚠️ HIGH CARDINALITY: ${metric.name} has ${cardinality} time series (threshold: 1,000)`
        );
      }
    }
  } catch (err) {
    console.error('❌ Failed to update cardinality metrics:', err);
  }
}

/**
 * Start periodic cardinality monitoring
 *
 * Call once at application startup to begin monitoring.
 * Checks every 60 seconds.
 */
export function startCardinalityMonitoring(): NodeJS.Timeout {
  console.log('✅ Starting cardinality monitoring (interval: 60s)');

  // Update immediately
  updateCardinalityMetrics().catch(console.error);

  // Then update every 60 seconds
  return setInterval(() => {
    updateCardinalityMetrics().catch(console.error);
  }, 60000);
}

// Export the registry for testing
export { register };
