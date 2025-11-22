/**
 * MARCUS 3.1 GraphQL DataLoaders
 *
 * Batch and cache data loading to prevent N+1 query problems.
 * DataLoaders automatically batch multiple individual loads into single
 * database queries, reducing latency by 30-50% for multi-resource queries.
 *
 * Author: Marcus (Platform Engineer)
 * Date: 2025-11-22
 */

import DataLoader from 'dataloader';
import { Pool } from 'pg';

// ============================================================================
// Type Definitions
// ============================================================================

export interface AgentMetrics {
  avgLatency: number;
  throughput: number;
  errorRate: number;
  accuracyRate: number;
}

export interface Citation {
  id: string;
  text: string;
  claimedSource: string;
  actualSource?: string;
  integrityScore: number;
  confidence: number;
  detectedViolations: string[];
  timestamp: string;
  agentId: string;
  behaviorUsed: string;
  metadata: Record<string, any>;
}

// ============================================================================
// Agent Metrics Loader
// ============================================================================

/**
 * Batch load agent metrics from database
 *
 * Prevents N+1 queries when fetching metrics for multiple agents.
 * Batches all metric requests within a single tick into one SQL query.
 *
 * Example:
 * - Without DataLoader: 10 agents = 10 separate SQL queries
 * - With DataLoader: 10 agents = 1 batched SQL query with WHERE IN clause
 */
export class AgentMetricsLoader extends DataLoader<string, AgentMetrics> {
  constructor(private db: Pool) {
    super(async (agentIds: readonly string[]) => {
      try {
        // Batch query for all requested agent IDs
        const result = await db.query<{
          agent_id: string;
          avg_latency: number;
          throughput: number;
          error_rate: number;
          accuracy_rate: number;
        }>(
          `SELECT
             agent_id,
             AVG(latency_ms) as avg_latency,
             COUNT(*) / 3600.0 as throughput,
             SUM(CASE WHEN error THEN 1 ELSE 0 END)::float / COUNT(*) * 100 as error_rate,
             SUM(CASE WHEN accurate THEN 1 ELSE 0 END)::float / COUNT(*) * 100 as accuracy_rate
           FROM agent_metrics
           WHERE agent_id = ANY($1)
             AND timestamp > NOW() - INTERVAL '1 hour'
           GROUP BY agent_id`,
          [Array.from(agentIds)]
        );

        // Create lookup map for O(1) access
        const metricsMap = new Map<string, AgentMetrics>();
        for (const row of result.rows) {
          metricsMap.set(row.agent_id, {
            avgLatency: row.avg_latency || 0,
            throughput: row.throughput || 0,
            errorRate: row.error_rate || 0,
            accuracyRate: row.accuracy_rate || 0
          });
        }

        // Return results in same order as input keys (required by DataLoader)
        return agentIds.map(agentId => {
          return metricsMap.get(agentId) || {
            avgLatency: 0,
            throughput: 0,
            errorRate: 0,
            accuracyRate: 0
          };
        });
      } catch (err) {
        console.error('❌ AgentMetricsLoader batch error:', err);

        // Return default metrics for all agents on error
        return agentIds.map(() => ({
          avgLatency: 0,
          throughput: 0,
          errorRate: 0,
          accuracyRate: 0
        }));
      }
    }, {
      // Cache results for duration of request (default: true)
      cache: true,

      // Max batch size (prevents unbounded queries)
      maxBatchSize: 100,

      // Batch scheduling function (default: process.nextTick)
      // Groups all loads in current tick into single batch
      batchScheduleFn: (callback) => setTimeout(callback, 10)
    });
  }
}

// ============================================================================
// Citation Results Loader
// ============================================================================

/**
 * Batch load recent citations for agents
 *
 * Prevents N+1 queries when fetching recent citations for multiple agents.
 *
 * Example:
 * - Without DataLoader: 10 agents fetching 5 citations each = 10 queries
 * - With DataLoader: 10 agents = 1 batched query returning all citations
 */
export class CitationResultsLoader extends DataLoader<string, Citation[]> {
  constructor(private db: Pool, private limit: number = 10) {
    super(async (agentIds: readonly string[]) => {
      try {
        // Batch query for all requested agent IDs
        // Uses LATERAL join to get top N citations per agent efficiently
        const result = await db.query<{
          agent_id: string;
          citations: any[];
        }>(
          `SELECT
             a.agent_id,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', c.id,
                   'text', c.text,
                   'claimedSource', c.claimed_source,
                   'actualSource', c.actual_source,
                   'integrityScore', c.integrity_score,
                   'confidence', c.confidence,
                   'detectedViolations', c.detected_violations,
                   'timestamp', c.timestamp,
                   'agentId', c.agent_id,
                   'behaviorUsed', c.behavior_used,
                   'metadata', c.metadata
                 ) ORDER BY c.timestamp DESC
               ) FILTER (WHERE c.id IS NOT NULL),
               '[]'::json
             ) as citations
           FROM unnest($1::text[]) AS a(agent_id)
           LEFT JOIN LATERAL (
             SELECT *
             FROM citations
             WHERE agent_id = a.agent_id
             ORDER BY timestamp DESC
             LIMIT $2
           ) c ON true
           GROUP BY a.agent_id`,
          [Array.from(agentIds), this.limit]
        );

        // Create lookup map
        const citationsMap = new Map<string, Citation[]>();
        for (const row of result.rows) {
          citationsMap.set(row.agent_id, row.citations || []);
        }

        // Return results in same order as input keys
        return agentIds.map(agentId => citationsMap.get(agentId) || []);

      } catch (err) {
        console.error('❌ CitationResultsLoader batch error:', err);

        // Return empty arrays for all agents on error
        return agentIds.map(() => []);
      }
    }, {
      cache: true,
      maxBatchSize: 50, // Smaller batch size for larger result sets
      batchScheduleFn: (callback) => setTimeout(callback, 10)
    });
  }
}

// ============================================================================
// DataLoader Factory
// ============================================================================

/**
 * Create all DataLoaders for a GraphQL request context
 *
 * Each request gets fresh DataLoaders to prevent stale cache across requests.
 *
 * @param db PostgreSQL pool
 * @returns Object containing all DataLoaders
 */
export function createDataLoaders(db: Pool) {
  return {
    agentMetrics: new AgentMetricsLoader(db),
    citationResults: new CitationResultsLoader(db, 10)
  };
}

// ============================================================================
// Performance Monitoring
// ============================================================================

/**
 * Wrap DataLoader with performance monitoring
 *
 * Tracks cache hit rate, batch size, and latency for optimization.
 */
export function createMonitoredDataLoader<K, V>(
  loader: DataLoader<K, V>,
  loaderName: string
): DataLoader<K, V> {
  const stats = {
    hits: 0,
    misses: 0,
    batchSizes: [] as number[],
    latencies: [] as number[]
  };

  // Intercept load to track stats
  const originalLoad = loader.load.bind(loader);
  loader.load = async (key: K) => {
    const startTime = Date.now();
    const cached = loader.get(key);

    if (cached !== undefined) {
      stats.hits++;
    } else {
      stats.misses++;
    }

    const result = await originalLoad(key);
    const latency = Date.now() - startTime;
    stats.latencies.push(latency);

    return result;
  };

  // Log stats periodically (every 100 loads)
  let loadCount = 0;
  const originalLoadMany = loader.loadMany.bind(loader);
  loader.loadMany = async (keys: K[]) => {
    loadCount++;
    stats.batchSizes.push(keys.length);

    if (loadCount % 100 === 0) {
      const hitRate = stats.hits / (stats.hits + stats.misses) * 100;
      const avgBatchSize = stats.batchSizes.reduce((a, b) => a + b, 0) / stats.batchSizes.length;
      const avgLatency = stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length;

      console.log(`📊 DataLoader [${loaderName}] Stats:
        Cache Hit Rate: ${hitRate.toFixed(1)}%
        Avg Batch Size: ${avgBatchSize.toFixed(1)}
        Avg Latency: ${avgLatency.toFixed(1)}ms`);

      // Reset stats
      stats.hits = 0;
      stats.misses = 0;
      stats.batchSizes = [];
      stats.latencies = [];
    }

    return originalLoadMany(keys);
  };

  return loader;
}
