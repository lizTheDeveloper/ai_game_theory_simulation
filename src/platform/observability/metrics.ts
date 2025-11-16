/**
 * Prometheus Metrics
 *
 * Custom application metrics for Citation Integrity Platform
 *
 * Metric types:
 * - Counter: Monotonically increasing (requests, errors)
 * - Gauge: Value that can go up/down (active connections, queue size)
 * - Histogram: Distribution of values (latency, sizes)
 * - Summary: Similar to histogram (quantiles)
 */

import { Registry, Counter, Gauge, Histogram, Summary } from 'prom-client';

// Create registry
export const register = new Registry();

// ============================================================================
// HTTP Metrics
// ============================================================================

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [register],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5, 10],
  registers: [register],
});

export const httpActiveConnections = new Gauge({
  name: 'http_active_connections',
  help: 'Number of active HTTP connections',
  registers: [register],
});

// ============================================================================
// Database Metrics
// ============================================================================

export const dbQueriesTotal = new Counter({
  name: 'db_queries_total',
  help: 'Total database queries',
  labelNames: ['operation', 'table', 'status'],
  registers: [register],
});

export const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Database query duration in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  registers: [register],
});

export const dbPoolSize = new Gauge({
  name: 'db_pool_size',
  help: 'Number of connections in pool',
  labelNames: ['state'],
  registers: [register],
});

export const dbSlowQueriesTotal = new Counter({
  name: 'db_slow_queries_total',
  help: 'Total slow database queries (>1s)',
  labelNames: ['operation', 'table'],
  registers: [register],
});

// ============================================================================
// Cache Metrics
// ============================================================================

export const cacheHitsTotal = new Counter({
  name: 'cache_hits_total',
  help: 'Total cache hits',
  labelNames: ['cache_type'],
  registers: [register],
});

export const cacheMissesTotal = new Counter({
  name: 'cache_misses_total',
  help: 'Total cache misses',
  labelNames: ['cache_type'],
  registers: [register],
});

export const cacheHitRate = new Gauge({
  name: 'cache_hit_rate',
  help: 'Cache hit rate (0-1)',
  labelNames: ['cache_type'],
  registers: [register],
});

export const cacheLatency = new Histogram({
  name: 'cache_latency_seconds',
  help: 'Cache operation latency',
  labelNames: ['cache_type', 'operation'],
  buckets: [0.0001, 0.0005, 0.001, 0.005, 0.01, 0.05],
  registers: [register],
});

// ============================================================================
// Citation Verification Metrics
// ============================================================================

export const citationVerificationsTotal = new Counter({
  name: 'citation_verifications_total',
  help: 'Total citation verifications',
  labelNames: ['source', 'status'],
  registers: [register],
});

export const citationVerificationDuration = new Histogram({
  name: 'citation_verification_duration_seconds',
  help: 'Citation verification duration',
  labelNames: ['source'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  registers: [register],
});

export const citationVerificationConfidence = new Histogram({
  name: 'citation_verification_confidence',
  help: 'Citation verification confidence score',
  labelNames: ['source'],
  buckets: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
  registers: [register],
});

export const unverifiedCitations = new Gauge({
  name: 'unverified_citations',
  help: 'Number of unverified citations',
  registers: [register],
});

// ============================================================================
// LSS (Learning Surprise Signal) Metrics
// ============================================================================

export const lssAlertsTotal = new Counter({
  name: 'lss_alerts_total',
  help: 'Total LSS alerts',
  labelNames: ['event_type', 'severity'],
  registers: [register],
});

export const lssValue = new Histogram({
  name: 'lss_value',
  help: 'LSS value distribution',
  labelNames: ['event_type'],
  buckets: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
  registers: [register],
});

export const activeLSSAlerts = new Gauge({
  name: 'active_lss_alerts',
  help: 'Number of active LSS alerts',
  labelNames: ['severity'],
  registers: [register],
});

// ============================================================================
// Parameter Drift Metrics
// ============================================================================

export const parameterDriftTotal = new Counter({
  name: 'parameter_drift_total',
  help: 'Total parameter drift events',
  labelNames: ['parameter_name', 'severity'],
  registers: [register],
});

export const parameterDriftRatio = new Histogram({
  name: 'parameter_drift_ratio',
  help: 'Parameter drift ratio distribution',
  labelNames: ['parameter_name'],
  buckets: [0.05, 0.1, 0.2, 0.3, 0.5, 1.0],
  registers: [register],
});

export const parametersWithoutCitation = new Gauge({
  name: 'parameters_without_citation',
  help: 'Number of parameters without citation',
  registers: [register],
});

// ============================================================================
// Claim Analysis Metrics
// ============================================================================

export const claimsDetectedTotal = new Counter({
  name: 'claims_detected_total',
  help: 'Total claims detected',
  labelNames: ['severity', 'agent'],
  registers: [register],
});

export const claimVerificationLatency = new Histogram({
  name: 'claim_verification_latency_seconds',
  help: 'Claim verification latency',
  labelNames: ['severity'],
  buckets: [0.5, 1, 2, 5, 10, 30, 60],
  registers: [register],
});

export const pendingClaimsReview = new Gauge({
  name: 'pending_claims_review',
  help: 'Number of claims pending review',
  labelNames: ['severity'],
  registers: [register],
});

// ============================================================================
// Grading Metrics
// ============================================================================

export const gradingRequestsTotal = new Counter({
  name: 'grading_requests_total',
  help: 'Total grading requests',
  labelNames: ['status'],
  registers: [register],
});

export const gradingScore = new Histogram({
  name: 'grading_score',
  help: 'Grading score distribution',
  buckets: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
  registers: [register],
});

export const humanReviewRequired = new Gauge({
  name: 'human_review_required',
  help: 'Number of submissions requiring human review',
  registers: [register],
});

// ============================================================================
// Memory Health Metrics
// ============================================================================

export const memoryHealthScore = new Gauge({
  name: 'memory_health_score',
  help: 'Memory health score by level',
  labelNames: ['level', 'metric_type'],
  registers: [register],
});

export const updateFrequency = new Gauge({
  name: 'update_frequency',
  help: 'Update frequency by nested learning level',
  labelNames: ['level'],
  registers: [register],
});

export const memoryStaleness = new Gauge({
  name: 'memory_staleness',
  help: 'Memory staleness by level',
  labelNames: ['level'],
  registers: [register],
});

// ============================================================================
// Queue Metrics
// ============================================================================

export const queueSize = new Gauge({
  name: 'queue_size',
  help: 'Number of items in queue',
  labelNames: ['queue_name'],
  registers: [register],
});

export const queueProcessingTime = new Histogram({
  name: 'queue_processing_time_seconds',
  help: 'Queue item processing time',
  labelNames: ['queue_name'],
  buckets: [0.1, 0.5, 1, 5, 10, 30, 60],
  registers: [register],
});

// ============================================================================
// Rate Limiting Metrics
// ============================================================================

export const rateLimitExceeded = new Counter({
  name: 'rate_limit_exceeded_total',
  help: 'Total rate limit violations',
  labelNames: ['endpoint', 'client'],
  registers: [register],
});

// ============================================================================
// Error Metrics
// ============================================================================

export const errorsTotal = new Counter({
  name: 'errors_total',
  help: 'Total errors',
  labelNames: ['type', 'component'],
  registers: [register],
});

export const criticalErrorsTotal = new Counter({
  name: 'critical_errors_total',
  help: 'Total critical errors requiring immediate attention',
  labelNames: ['component'],
  registers: [register],
});

// ============================================================================
// Business Metrics
// ============================================================================

export const fabricationRate = new Gauge({
  name: 'fabrication_rate',
  help: 'Estimated fabrication rate (0-1)',
  registers: [register],
});

export const provenanceCoverage = new Gauge({
  name: 'provenance_coverage',
  help: 'Percentage of parameters with provenance (0-1)',
  registers: [register],
});

export const interRaterReliability = new Gauge({
  name: 'inter_rater_reliability',
  help: 'Inter-rater reliability for severity classification (0-1)',
  registers: [register],
});

// ============================================================================
// Metrics Export Handler
// ============================================================================

/**
 * Metrics endpoint handler (for Express/Fastify)
 */
export async function metricsHandler(
  req: any,
  res: any
): Promise<void> {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.send(metrics);
  } catch (error) {
    res.status(500).send('Error collecting metrics');
  }
}

/**
 * Update database pool metrics
 */
export function updateDBPoolMetrics(metrics: {
  poolSize: number;
  idleConnections: number;
  waitingClients: number;
}): void {
  dbPoolSize.set({ state: 'total' }, metrics.poolSize);
  dbPoolSize.set({ state: 'idle' }, metrics.idleConnections);
  dbPoolSize.set({ state: 'waiting' }, metrics.waitingClients);
}

/**
 * Update cache metrics
 */
export function updateCacheMetrics(
  cacheType: string,
  metrics: {
    hits: number;
    misses: number;
    hitRate: number;
  }
): void {
  cacheHitsTotal.inc({ cache_type: cacheType }, metrics.hits);
  cacheMissesTotal.inc({ cache_type: cacheType }, metrics.misses);
  cacheHitRate.set({ cache_type: cacheType }, metrics.hitRate);
}

/**
 * Record HTTP request
 */
export function recordHTTPRequest(
  method: string,
  path: string,
  status: number,
  durationSeconds: number
): void {
  httpRequestsTotal.inc({ method, path, status });
  httpRequestDuration.observe({ method, path, status: String(status) }, durationSeconds);
}

/**
 * Record database query
 */
export function recordDBQuery(
  operation: string,
  table: string,
  durationSeconds: number,
  success: boolean
): void {
  dbQueriesTotal.inc({ operation, table, status: success ? 'success' : 'error' });
  dbQueryDuration.observe({ operation, table }, durationSeconds);

  if (durationSeconds > 1) {
    dbSlowQueriesTotal.inc({ operation, table });
  }
}

/**
 * Record LSS alert
 */
export function recordLSSAlert(
  eventType: string,
  severity: string,
  lssValueNum: number
): void {
  lssAlertsTotal.inc({ event_type: eventType, severity });
  lssValue.observe({ event_type: eventType }, lssValueNum);
  activeLSSAlerts.inc({ severity });
}
