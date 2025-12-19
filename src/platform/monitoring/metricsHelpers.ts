/**
 * MARCUS 3.1: Metrics Helpers for Cardinality Control
 *
 * Provides label value normalization to prevent metrics cardinality explosion.
 *
 * Problem:
 * - Unbounded label values (dynamic routes, error messages, agent IDs) cause
 *   metrics storage explosion in Prometheus
 * - Can exhaust storage, degrade query performance, cause scrape timeouts
 *
 * Solution:
 * - Whitelist known label values
 * - Bucket/classify dynamic values
 * - Use "other" for unknown values
 * - Validate all metric labels before recording
 *
 * Target: <1,000 time series per metric
 *
 * Author: Marcus (Platform Engineer)
 * Date: 2025-11-22
 */

/**
 * Validate and normalize agent_id to prevent ID proliferation
 *
 * Valid pattern: agent_001, agent_002, ..., agent_999
 * Invalid values are mapped to 'unknown'
 *
 * @param agentId Agent identifier
 * @returns Normalized agent ID or 'unknown'
 */
export function normalizeAgentId(agentId: string | undefined): string {
  if (!agentId) {
    return 'unknown';
  }

  // Validate format: agent_NNN (3 digits)
  if (!/^agent_\d{3}$/.test(agentId)) {
    console.warn(`⚠️ Invalid agent_id format: ${agentId}, using 'unknown'`);
    return 'unknown';
  }

  return agentId;
}

/**
 * Normalize HTTP route to known whitelist
 *
 * Unknown routes are mapped to 'other' to prevent cardinality explosion
 * from 404s, attacks, or malformed requests.
 *
 * @param path Request path
 * @returns Normalized route or 'other'
 */
export function normalizeRoute(path: string): string {
  // Known routes (whitelist)
  const knownRoutes = [
    '/health',
    '/metrics',
    '/ready',
    '/api/citations',
    '/api/citations/:id',
    '/api/citations/:id/verify',
    '/api/agents',
    '/api/agents/:id',
    '/api/agents/:id/status',
    '/api/auth/login',
    '/api/auth/logout',
    '/api/auth/refresh',
    '/api/auth/register',
    '/api/users',
    '/api/users/:id',
    '/api/platform/status',
    '/api/platform/health'
  ];

  // Normalize path (remove query params, trailing slashes)
  const normalized = normalizePath(path);

  // Check against whitelist
  if (knownRoutes.includes(normalized)) {
    return normalized;
  }

  // Default to 'other' for unknown routes
  return 'other';
}

/**
 * Normalize URL path for metrics (group similar paths together)
 *
 * Examples:
 *   /api/citations/123 -> /api/citations/:id
 *   /api/agents/agent_001/status -> /api/agents/:id/status
 *   /health -> /health
 *
 * @param path URL path
 * @returns Normalized path with :id placeholders
 */
function normalizePath(path: string): string {
  // Remove query parameters
  const pathWithoutQuery = path.split('?')[0];

  // Remove trailing slash
  const trimmed = pathWithoutQuery.replace(/\/$/, '') || '/';

  // Common route patterns (ID replacement)
  const patterns = [
    { regex: /^\/api\/citations\/[^\/]+\/verify$/, replacement: '/api/citations/:id/verify' },
    { regex: /^\/api\/citations\/[^\/]+$/, replacement: '/api/citations/:id' },
    { regex: /^\/api\/agents\/[^\/]+\/status$/, replacement: '/api/agents/:id/status' },
    { regex: /^\/api\/agents\/[^\/]+$/, replacement: '/api/agents/:id' },
    { regex: /^\/api\/users\/[^\/]+$/, replacement: '/api/users/:id' },
  ];

  for (const pattern of patterns) {
    if (pattern.regex.test(trimmed)) {
      return pattern.replacement;
    }
  }

  return trimmed;
}

/**
 * Bucket HTTP status codes into ranges to reduce cardinality
 *
 * Instead of tracking 40-50 individual status codes, use ranges:
 * 2xx, 3xx, 4xx, 5xx
 *
 * @param statusCode HTTP status code
 * @returns Status code range (2xx, 3xx, 4xx, 5xx, unknown)
 */
export function bucketStatusCode(statusCode: number): string {
  if (statusCode >= 200 && statusCode < 300) return '2xx';
  if (statusCode >= 300 && statusCode < 400) return '3xx';
  if (statusCode >= 400 && statusCode < 500) return '4xx';
  if (statusCode >= 500 && statusCode < 600) return '5xx';
  return 'unknown';
}

/**
 * Classify error into fixed taxonomy
 *
 * Maps arbitrary error messages/types into ~10 fixed categories
 * to prevent cardinality explosion from unique error messages.
 *
 * Error taxonomy:
 * - timeout_error: Operation timeouts
 * - connection_error: Network/connection failures
 * - authentication_error: Auth failures (401)
 * - authorization_error: Permission failures (403)
 * - database_error: PostgreSQL errors
 * - redis_error: Redis connection/operation errors
 * - agent_error: Python agent failures
 * - circuit_breaker_error: Circuit breaker trips
 * - rate_limit_error: Rate limiting
 * - validation_error: Input validation failures
 * - unknown_error: Catch-all
 *
 * @param error Error object
 * @returns Error type from taxonomy
 */
export function classifyError(error: Error): string {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  // Timeout errors
  if (message.includes('timeout') || name.includes('timeout')) {
    return 'timeout_error';
  }

  // Connection errors
  if (
    message.includes('connection') ||
    message.includes('econnreset') ||
    message.includes('econnrefused') ||
    message.includes('etimedout') ||
    message.includes('enotfound')
  ) {
    return 'connection_error';
  }

  // Authentication errors
  if (
    message.includes('authentication') ||
    message.includes('unauthorized') ||
    message.includes('invalid credentials') ||
    name === 'unauthorizederror'
  ) {
    return 'authentication_error';
  }

  // Authorization errors
  if (
    message.includes('authorization') ||
    message.includes('forbidden') ||
    message.includes('permission denied') ||
    name === 'forbiddenerror'
  ) {
    return 'authorization_error';
  }

  // Database errors
  if (
    message.includes('database') ||
    message.includes('postgres') ||
    message.includes('pg') ||
    message.includes('sql') ||
    name.includes('databaseerror')
  ) {
    return 'database_error';
  }

  // Redis errors
  if (message.includes('redis') || name.includes('rediserror')) {
    return 'redis_error';
  }

  // Agent errors
  if (message.includes('agent') || message.includes('python')) {
    return 'agent_error';
  }

  // Circuit breaker errors
  if (message.includes('circuit breaker') || message.includes('circuit open')) {
    return 'circuit_breaker_error';
  }

  // Rate limit errors
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'rate_limit_error';
  }

  // Validation errors
  if (
    message.includes('validation') ||
    message.includes('invalid') ||
    name === 'validationerror'
  ) {
    return 'validation_error';
  }

  // Catch-all
  return 'unknown_error';
}

/**
 * Normalize lock name to type prefix only
 *
 * Distributed locks include dynamic IDs (agent IDs, timestamps).
 * Extract only the lock type to reduce cardinality.
 *
 * Examples:
 *   agent:agent_001:state -> agent_state
 *   analysis:1234567890 -> analysis
 *   sync:database -> sync
 *
 * @param lockName Full lock name with dynamic parts
 * @returns Lock type prefix
 */
export function normalizeLockName(lockName: string): string {
  if (lockName.startsWith('agent:')) return 'agent_state';
  if (lockName.startsWith('analysis:')) return 'analysis';
  if (lockName.startsWith('sync:')) return 'sync';
  if (lockName.startsWith('cache:')) return 'cache';
  if (lockName.startsWith('queue:')) return 'queue';

  console.warn(`⚠️ Unknown lock name pattern: ${lockName}, using 'other'`);
  return 'other';
}

/**
 * Normalize queue name to known set
 *
 * Queue names should be application-defined, not dynamic.
 * Unknown queues are rejected to prevent cardinality explosion.
 *
 * @param queueName Queue identifier
 * @returns Normalized queue name or 'other'
 */
export function normalizeQueueName(queueName: string): string {
  const knownQueues = [
    'citation_analysis',
    'state_sync',
    'dead_letter',
    'health_check',
    'metrics_collection',
    'agent_requests',
    'analysis_results'
  ];

  if (knownQueues.includes(queueName)) {
    return queueName;
  }

  console.warn(`⚠️ Unknown queue name: ${queueName}, using 'other'`);
  return 'other';
}

/**
 * Normalize Redis command to common set
 *
 * Redis has 200+ commands. Track only the most common ones
 * to reduce cardinality. Less common commands -> 'other'.
 *
 * @param command Redis command name
 * @returns Normalized command or 'other'
 */
export function normalizeRedisCommand(command: string): string {
  const commonCommands = [
    'get',
    'set',
    'setex',
    'expire',
    'del',
    'exists',
    'ping',
    'incr',
    'decr',
    'hget',
    'hset',
    'lpush',
    'rpush',
    'lpop',
    'rpop',
    'zadd',
    'zrange',
    'publish',
    'subscribe'
  ];

  const normalized = command.toLowerCase();
  if (commonCommands.includes(normalized)) {
    return normalized;
  }

  return 'other';
}

/**
 * Normalize component name to known set
 *
 * Components are major subsystems. Should be bounded and known.
 *
 * @param component Component identifier
 * @returns Normalized component name or 'other'
 */
export function normalizeComponent(component: string): string {
  const knownComponents = [
    'orchestrator',
    'database',
    'redis',
    'agent',
    'api',
    'auth',
    'circuit_breaker',
    'state_manager',
    'metrics',
    'health_check',
    'process_registry',
    'lock_manager',
    'queue_manager'
  ];

  const normalized = component.toLowerCase();
  if (knownComponents.includes(normalized)) {
    return normalized;
  }

  console.warn(`⚠️ Unknown component: ${component}, using 'other'`);
  return 'other';
}

/**
 * Normalize severity level to fixed set
 *
 * @param severity Severity level
 * @returns Normalized severity (critical, high, medium, low)
 */
export function normalizeSeverity(severity: string): string {
  const normalized = severity.toLowerCase();

  if (['critical', 'high', 'medium', 'low'].includes(normalized)) {
    return normalized;
  }

  console.warn(`⚠️ Unknown severity: ${severity}, using 'medium'`);
  return 'medium';
}

/**
 * Normalize circuit breaker name to known set
 *
 * @param breakerName Circuit breaker identifier
 * @returns Normalized breaker name or 'other'
 */
export function normalizeBreakerName(breakerName: string): string {
  const knownBreakers = [
    'database',
    'redis',
    'agent_pool',
    'external_api',
    'auth_service',
    'state_sync',
    'metrics_collector'
  ];

  if (knownBreakers.includes(breakerName)) {
    return breakerName;
  }

  console.warn(`⚠️ Unknown circuit breaker: ${breakerName}, using 'other'`);
  return 'other';
}

/**
 * Get cardinality statistics for debugging
 *
 * Returns unique value counts for each label dimension.
 * Useful for monitoring cardinality growth.
 */
export interface CardinalityStats {
  totalTimeSeries: number;
  labelCardinality: Record<string, number>;
  topLabels: Array<{ label: string; cardinality: number }>;
}

/**
 * Example usage guard
 *
 * Shows how to use normalization functions when recording metrics:
 *
 * ```typescript
 * // Before (unbounded):
 * httpRequestDuration.observe({ route: req.path }, duration);
 *
 * // After (bounded):
 * httpRequestDuration.observe({ route: normalizeRoute(req.path) }, duration);
 *
 * // Before (unbounded):
 * errorsByType.inc({ error_type: error.message });
 *
 * // After (bounded):
 * errorsByType.inc({ error_type: classifyError(error) });
 * ```
 */
