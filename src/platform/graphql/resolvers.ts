/**
 * MARCUS 3.1 GraphQL Resolvers
 *
 * Implements Query, Mutation, Field-level, and Subscription resolvers
 * for the citation platform API with DataLoader optimization.
 *
 * M1 FIX: Memory state returns null instead of empty placeholders
 * M2 FIX: Removed unimplemented mutations, added working ones
 * M3 FIX: Support for Redis-backed PubSub in production
 *
 * Author: Marcus (Platform Engineer)
 * Date: 2025-11-22
 * Updated: 2025-11-28 (M1, M2, M3 fixes)
 */

import { Pool } from 'pg';
import { GraphQLError } from 'graphql';
import { PubSub } from 'graphql-subscriptions';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { CitationAgentOrchestrator, AgentStatus, CitationDocument, AggregatedAnalysis } from '../integration/citationAgentIntegration';
import { AgentMetricsLoader, CitationResultsLoader } from './dataloaders';

// ============================================================================
// Type Definitions for GraphQL Context
// ============================================================================

export interface GraphQLContext {
  orchestrator?: CitationAgentOrchestrator; // M1 FIX: Now optional for lightweight mode
  db: Pool;
  dataloaders: {
    agentMetrics: AgentMetricsLoader;
    citationResults: CitationResultsLoader;
  };
  pubsub: PubSub | RedisPubSub; // M3 FIX: Support both in-memory and Redis-backed PubSub
  // Auth context (from JWT middleware if needed)
  user?: {
    id: string;
    role: string;
    permissions: string[];
  };
}

// ============================================================================
// Enum Mappings
// ============================================================================

const CITATION_BEHAVIORS = [
  'ALWAYS_ACCEPT',
  'LENIENT_SIMILARITY',
  'MODERATE_CHECK',
  'STRICT_MATCH',
  'ALWAYS_REJECT',
  'AUTHOR_FOCUSED',
  'YEAR_FOCUSED',
  'TITLE_FOCUSED',
  'COMBINED_HEURISTIC'
];

const AGENT_MODES = {
  SYNC: 'sync',
  ASYNC: 'async'
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if orchestrator is available
 * M1 FIX: Helper to gracefully handle missing orchestrator
 */
function requireOrchestrator(context: GraphQLContext): CitationAgentOrchestrator {
  if (!context.orchestrator) {
    throw new GraphQLError('Orchestrator not available. This operation requires the full platform with Python agents.', {
      extensions: {
        code: 'ORCHESTRATOR_UNAVAILABLE',
        hint: 'Start the platform with orchestrator enabled for this operation.'
      }
    });
  }
  return context.orchestrator;
}

/**
 * Determine agent mode based on ID or other criteria
 */
function getAgentMode(agentId: string): 'SYNC' | 'ASYNC' {
  // In real implementation, this would check a configuration or state
  // For now, default to SYNC
  return 'SYNC';
}

/**
 * Map Python behavior strings to GraphQL enum values
 */
function mapBehavior(behavior: string): string {
  const upperBehavior = behavior.toUpperCase().replace(/ /g, '_');
  return CITATION_BEHAVIORS.includes(upperBehavior) ? upperBehavior : 'MODERATE_CHECK';
}

/**
 * Calculate agent metrics from status
 */
function calculateMetrics(status: AgentStatus): {
  avgLatency: number;
  throughput: number;
  errorRate: number;
  accuracyRate: number;
} {
  // These would come from historical data in production
  // For now, compute from available data
  return {
    avgLatency: 50, // Mock: 50ms average
    throughput: status.totalCitations / 3600, // Citations per second (assuming 1 hour)
    errorRate: status.violationRate * 100, // Convert to percentage
    accuracyRate: (1 - status.violationRate) * 100 // Inverse of error rate
  };
}

// ============================================================================
// Query Resolvers
// ============================================================================

export const queryResolvers = {
  /**
   * Get single agent by ID
   * M1 FIX: Returns null for memoryState instead of empty placeholders
   */
  agent: async (
    _parent: any,
    args: { id: string },
    context: GraphQLContext
  ) => {
    try {
      // Try orchestrator first if available
      if (context.orchestrator) {
        const statuses = await context.orchestrator.getAgentStatuses();
        const status = statuses.find(s => s.agentId === args.id);

        if (status) {
          return {
            id: status.agentId,
            reputation: status.reputation,
            totalCitations: status.totalCitations,
            detectedViolations: status.detectedViolations,
            currentBehavior: mapBehavior(status.currentBehavior),
            explorationRate: status.explorationRate,
            timestamp: status.timestamp,
            // M1 FIX: Return null instead of empty placeholder
            // Memory can be populated by field resolver if needed
            memoryState: null,
            mode: getAgentMode(status.agentId)
          };
        }
      }

      // Fall back to database
      const result = await context.db.query(
        `SELECT agent_id, reputation, total_citations, detected_violations,
                current_behavior, exploration_rate, timestamp
         FROM agent_states
         WHERE agent_id = $1
         ORDER BY timestamp DESC
         LIMIT 1`,
        [args.id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.agent_id,
        reputation: row.reputation,
        totalCitations: row.total_citations,
        detectedViolations: row.detected_violations,
        currentBehavior: mapBehavior(row.current_behavior),
        explorationRate: row.exploration_rate,
        timestamp: row.timestamp,
        memoryState: null, // M1 FIX: Null by default
        mode: getAgentMode(row.agent_id)
      };
    } catch (err) {
      throw new GraphQLError('Failed to fetch agent', {
        extensions: {
          code: 'AGENT_FETCH_ERROR',
          originalError: err
        }
      });
    }
  },

  /**
   * List all agents with pagination and sorting
   * M1 FIX: Returns null for memoryState
   */
  agents: async (
    _parent: any,
    args: {
      limit?: number;
      offset?: number;
      sortBy?: 'REPUTATION' | 'TOTAL_CITATIONS' | 'DETECTED_VIOLATIONS' | 'TIMESTAMP';
      sortOrder?: 'ASC' | 'DESC';
    },
    context: GraphQLContext
  ) => {
    try {
      let statuses: AgentStatus[] = [];

      // Try orchestrator first if available
      if (context.orchestrator) {
        statuses = await context.orchestrator.getAgentStatuses();
      } else {
        // Fall back to database
        const result = await context.db.query(
          `SELECT DISTINCT ON (agent_id)
                  agent_id, reputation, total_citations, detected_violations,
                  current_behavior, exploration_rate, timestamp,
                  CASE WHEN reputation > 0.3 THEN true ELSE false END as is_healthy
           FROM agent_states
           ORDER BY agent_id, timestamp DESC`
        );

        statuses = result.rows.map(row => ({
          agentId: row.agent_id,
          reputation: row.reputation,
          totalCitations: row.total_citations,
          detectedViolations: row.detected_violations,
          violationRate: row.detected_violations / Math.max(row.total_citations, 1),
          currentBehavior: row.current_behavior,
          explorationRate: row.exploration_rate,
          memorySize: { immediate: 0, shortterm: 0, longtermStats: 0, behaviorReputations: 0 },
          isHealthy: row.is_healthy,
          timestamp: row.timestamp
        }));
      }

      // Sort agents
      const sortField = args.sortBy || 'REPUTATION';
      const sortOrder = args.sortOrder || 'DESC';

      const sorted = [...statuses].sort((a, b) => {
        let aVal: number, bVal: number;

        switch (sortField) {
          case 'REPUTATION':
            aVal = a.reputation;
            bVal = b.reputation;
            break;
          case 'TOTAL_CITATIONS':
            aVal = a.totalCitations;
            bVal = b.totalCitations;
            break;
          case 'DETECTED_VIOLATIONS':
            aVal = a.detectedViolations;
            bVal = b.detectedViolations;
            break;
          case 'TIMESTAMP':
            aVal = new Date(a.timestamp).getTime();
            bVal = new Date(b.timestamp).getTime();
            break;
          default:
            aVal = a.reputation;
            bVal = b.reputation;
        }

        return sortOrder === 'ASC' ? aVal - bVal : bVal - aVal;
      });

      // Apply pagination
      const limit = args.limit || 10;
      const offset = args.offset || 0;
      const paginated = sorted.slice(offset, offset + limit);

      // Map to GraphQL format
      return paginated.map(status => ({
        id: status.agentId,
        reputation: status.reputation,
        totalCitations: status.totalCitations,
        detectedViolations: status.detectedViolations,
        currentBehavior: mapBehavior(status.currentBehavior),
        explorationRate: status.explorationRate,
        timestamp: status.timestamp,
        memoryState: null, // M1 FIX: Null by default
        mode: getAgentMode(status.agentId)
      }));
    } catch (err) {
      throw new GraphQLError('Failed to fetch agents', {
        extensions: {
          code: 'AGENTS_FETCH_ERROR',
          originalError: err
        }
      });
    }
  },

  /**
   * Get agents by behavior
   */
  agentsByBehavior: async (
    _parent: any,
    args: { behavior: string },
    context: GraphQLContext
  ) => {
    try {
      const orchestrator = requireOrchestrator(context);
      const statuses = await orchestrator.getAgentStatuses();
      const filtered = statuses.filter(s =>
        mapBehavior(s.currentBehavior) === args.behavior
      );

      return filtered.map(status => ({
        id: status.agentId,
        reputation: status.reputation,
        totalCitations: status.totalCitations,
        detectedViolations: status.detectedViolations,
        currentBehavior: mapBehavior(status.currentBehavior),
        explorationRate: status.explorationRate,
        timestamp: status.timestamp,
        memoryState: null, // M1 FIX
        mode: getAgentMode(status.agentId)
      }));
    } catch (err) {
      if (err instanceof GraphQLError) throw err;
      throw new GraphQLError('Failed to fetch agents by behavior', {
        extensions: {
          code: 'AGENTS_BY_BEHAVIOR_ERROR',
          originalError: err
        }
      });
    }
  },

  /**
   * Get citation by ID
   */
  citation: async (
    _parent: any,
    args: { id: string },
    context: GraphQLContext
  ) => {
    try {
      // Query from database
      const result = await context.db.query(
        `SELECT id, text, claimed_source, actual_source, integrity_score,
                confidence, detected_violations, timestamp, agent_id,
                behavior_used, metadata
         FROM citations
         WHERE id = $1`,
        [args.id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        text: row.text,
        claimedSource: row.claimed_source,
        actualSource: row.actual_source,
        integrityScore: row.integrity_score,
        confidence: row.confidence,
        detectedViolations: row.detected_violations || [],
        timestamp: row.timestamp,
        agentId: row.agent_id,
        behaviorUsed: mapBehavior(row.behavior_used),
        metadata: row.metadata || {}
      };
    } catch (err) {
      throw new GraphQLError('Failed to fetch citation', {
        extensions: {
          code: 'CITATION_FETCH_ERROR',
          originalError: err
        }
      });
    }
  },

  /**
   * List citations with filters
   */
  citations: async (
    _parent: any,
    args: {
      limit?: number;
      offset?: number;
      agentId?: string;
      minIntegrity?: number;
      maxIntegrity?: number;
      startDate?: string;
      endDate?: string;
    },
    context: GraphQLContext
  ) => {
    try {
      const conditions: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (args.agentId) {
        conditions.push(`agent_id = $${paramIndex++}`);
        params.push(args.agentId);
      }

      if (args.minIntegrity !== undefined) {
        conditions.push(`integrity_score >= $${paramIndex++}`);
        params.push(args.minIntegrity);
      }

      if (args.maxIntegrity !== undefined) {
        conditions.push(`integrity_score <= $${paramIndex++}`);
        params.push(args.maxIntegrity);
      }

      if (args.startDate) {
        conditions.push(`timestamp >= $${paramIndex++}`);
        params.push(args.startDate);
      }

      if (args.endDate) {
        conditions.push(`timestamp <= $${paramIndex++}`);
        params.push(args.endDate);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const limit = args.limit || 10;
      const offset = args.offset || 0;

      params.push(limit, offset);

      const result = await context.db.query(
        `SELECT id, text, claimed_source, actual_source, integrity_score,
                confidence, detected_violations, timestamp, agent_id,
                behavior_used, metadata
         FROM citations
         ${whereClause}
         ORDER BY timestamp DESC
         LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
        params
      );

      return result.rows.map(row => ({
        id: row.id,
        text: row.text,
        claimedSource: row.claimed_source,
        actualSource: row.actual_source,
        integrityScore: row.integrity_score,
        confidence: row.confidence,
        detectedViolations: row.detected_violations || [],
        timestamp: row.timestamp,
        agentId: row.agent_id,
        behaviorUsed: mapBehavior(row.behavior_used),
        metadata: row.metadata || {}
      }));
    } catch (err) {
      throw new GraphQLError('Failed to fetch citations', {
        extensions: {
          code: 'CITATIONS_FETCH_ERROR',
          originalError: err
        }
      });
    }
  },

  /**
   * Analyze citation with consensus (Query for synchronous analysis)
   */
  analyzeCitation: async (
    _parent: any,
    args: {
      text: string;
      claimedSource: string;
      actualSource?: string;
      numAgents?: number;
    },
    context: GraphQLContext
  ) => {
    try {
      const orchestrator = requireOrchestrator(context);

      const document: CitationDocument = {
        text: args.text,
        claimedSource: args.claimedSource,
        actualSource: args.actualSource
      };

      const analysis = await orchestrator.analyzeDocument(document);

      // Publish to subscribers
      context.pubsub.publish('CITATION_ANALYZED', {
        citationAnalyzed: {
          id: `temp_${Date.now()}`,
          text: args.text,
          claimedSource: args.claimedSource,
          actualSource: args.actualSource,
          integrityScore: analysis.meanIntegrity,
          confidence: analysis.consensus,
          detectedViolations: [],
          timestamp: analysis.timestamp,
          agentId: 'consensus',
          behaviorUsed: 'COMBINED_HEURISTIC'
        }
      });

      return {
        citation: {
          id: `temp_${Date.now()}`,
          text: args.text,
          claimedSource: args.claimedSource,
          actualSource: args.actualSource,
          integrityScore: analysis.meanIntegrity,
          confidence: analysis.consensus,
          detectedViolations: [],
          timestamp: analysis.timestamp,
          agentId: 'consensus',
          behaviorUsed: 'COMBINED_HEURISTIC'
        },
        meanIntegrity: analysis.meanIntegrity,
        consensus: analysis.consensus,
        numAgents: analysis.numAgents,
        behaviorDistribution: analysis.behaviorDistribution,
        agentResults: analysis.individualResults.map(r => ({
          agentId: r.agentId,
          integrityScore: r.integrityScore,
          behaviorUsed: mapBehavior(r.behaviorUsed),
          confidence: r.confidence,
          detectedViolations: r.detectedViolations
        })),
        recommendations: analysis.recommendations
      };
    } catch (err) {
      if (err instanceof GraphQLError) throw err;
      throw new GraphQLError('Citation analysis failed', {
        extensions: {
          code: 'ANALYSIS_ERROR',
          originalError: err
        }
      });
    }
  },

  /**
   * Get platform status
   */
  platformStatus: async (
    _parent: any,
    _args: any,
    context: GraphQLContext
  ) => {
    try {
      let activeAgents = 0;
      let totalAgents = 0;
      let totalCitations = 0;

      // Try orchestrator first
      if (context.orchestrator) {
        const statuses = await context.orchestrator.getAgentStatuses();
        activeAgents = statuses.filter(s => s.isHealthy).length;
        totalAgents = statuses.length;
        totalCitations = statuses.reduce((sum, s) => sum + s.totalCitations, 0);
      } else {
        // Fall back to database
        const result = await context.db.query(
          `SELECT COUNT(DISTINCT agent_id) as total_agents,
                  SUM(total_citations) as total_citations
           FROM agent_states`
        );
        totalAgents = parseInt(result.rows[0]?.total_agents || '0', 10);
        totalCitations = parseInt(result.rows[0]?.total_citations || '0', 10);
      }

      // Get database status
      let dbHealthy = true;
      let dbMessage = 'Connected';
      try {
        await context.db.query('SELECT 1');
      } catch (err) {
        dbHealthy = false;
        dbMessage = 'Connection failed';
      }

      // Mock additional metrics (would come from Redis/metrics in production)
      const avgLatency = 50;
      const errorRate = 0.5;

      const health = activeAgents / Math.max(totalAgents, 1) * 10;

      return {
        health,
        activeAgents,
        queueDepth: 0, // Would come from Redis
        citationsLastHour: totalCitations,
        avgLatency,
        errorRate,
        databaseStatus: {
          healthy: dbHealthy,
          message: dbMessage,
          lastCheck: new Date().toISOString()
        },
        redisStatus: {
          healthy: true,
          message: 'Connected',
          lastCheck: new Date().toISOString()
        },
        asyncRolloutPercent: 0, // Would come from config
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      throw new GraphQLError('Failed to fetch platform status', {
        extensions: {
          code: 'PLATFORM_STATUS_ERROR',
          originalError: err
        }
      });
    }
  },

  /**
   * Get platform benchmarks
   */
  platformBenchmarks: async (
    _parent: any,
    args: { limit?: number },
    context: GraphQLContext
  ) => {
    try {
      const limit = args.limit || 10;

      const result = await context.db.query(
        `SELECT name, throughput, latency_p50, latency_p95, latency_p99,
                accuracy, f1_score, timestamp
         FROM platform_benchmarks
         ORDER BY timestamp DESC
         LIMIT $1`,
        [limit]
      );

      return result.rows.map(row => ({
        name: row.name,
        throughput: row.throughput,
        latencyP50: row.latency_p50,
        latencyP95: row.latency_p95,
        latencyP99: row.latency_p99,
        accuracy: row.accuracy,
        f1Score: row.f1_score,
        timestamp: row.timestamp
      }));
    } catch (err) {
      // Return empty array if table doesn't exist
      return [];
    }
  },

  /**
   * Get agent statistics summary
   */
  agentStats: async (
    _parent: any,
    _args: any,
    context: GraphQLContext
  ) => {
    try {
      let statuses: AgentStatus[] = [];

      if (context.orchestrator) {
        statuses = await context.orchestrator.getAgentStatuses();
      } else {
        // Fall back to database
        const result = await context.db.query(
          `SELECT DISTINCT ON (agent_id)
                  agent_id, reputation, total_citations, detected_violations,
                  CASE WHEN reputation > 0.3 THEN true ELSE false END as is_healthy
           FROM agent_states
           ORDER BY agent_id, timestamp DESC`
        );

        statuses = result.rows.map(row => ({
          agentId: row.agent_id,
          reputation: row.reputation,
          totalCitations: row.total_citations,
          detectedViolations: row.detected_violations,
          violationRate: row.detected_violations / Math.max(row.total_citations, 1),
          currentBehavior: 'moderate_check',
          explorationRate: 0.2,
          memorySize: { immediate: 0, shortterm: 0, longtermStats: 0, behaviorReputations: 0 },
          isHealthy: row.is_healthy,
          timestamp: new Date().toISOString()
        }));
      }

      const activeAgents = statuses.filter(s => s.isHealthy).length;
      const totalCitations = statuses.reduce((sum, s) => sum + s.totalCitations, 0);
      const totalViolations = statuses.reduce((sum, s) => sum + s.detectedViolations, 0);
      const avgReputation = statuses.reduce((sum, s) => sum + s.reputation, 0) / Math.max(statuses.length, 1);

      return {
        totalAgents: statuses.length,
        activeAgents,
        avgReputation,
        totalCitations,
        totalViolations,
        agentsByMode: {
          sync: statuses.length, // All sync for now
          async: 0
        }
      };
    } catch (err) {
      throw new GraphQLError('Failed to fetch agent stats', {
        extensions: {
          code: 'AGENT_STATS_ERROR',
          originalError: err
        }
      });
    }
  }
};

// ============================================================================
// Mutation Resolvers
// M2 FIX: Only include mutations that are actually implemented
// ============================================================================

export const mutationResolvers = {
  /**
   * Analyze citation and store (mutation variant)
   */
  analyzeCitationAndStore: async (
    _parent: any,
    args: {
      text: string;
      claimedSource: string;
      actualSource?: string;
    },
    context: GraphQLContext
  ) => {
    // Reuse query resolver
    return queryResolvers.analyzeCitation(
      _parent,
      { ...args, numAgents: 5 },
      context
    );
  },

  /**
   * Simple ping mutation (required - GraphQL needs at least one mutation)
   */
  ping: async () => {
    return new Date().toISOString();
  }
};

// ============================================================================
// Field Resolvers
// ============================================================================

export const fieldResolvers = {
  Agent: {
    /**
     * Resolve agent's recent citations (uses DataLoader)
     */
    recentCitations: async (
      parent: { id: string },
      args: { limit?: number },
      context: GraphQLContext
    ) => {
      const limit = args.limit || 10;

      try {
        // Use DataLoader to batch load citations
        const citations = await context.dataloaders.citationResults.load(parent.id);
        return citations.slice(0, limit);
      } catch (err) {
        console.error(`Failed to load citations for agent ${parent.id}:`, err);
        return [];
      }
    },

    /**
     * Resolve agent metrics (uses DataLoader)
     */
    metrics: async (
      parent: { id: string },
      _args: any,
      context: GraphQLContext
    ) => {
      try {
        // Use DataLoader to batch load metrics
        return await context.dataloaders.agentMetrics.load(parent.id);
      } catch (err) {
        console.error(`Failed to load metrics for agent ${parent.id}:`, err);
        return {
          avgLatency: 0,
          throughput: 0,
          errorRate: 0,
          accuracyRate: 0
        };
      }
    },

    /**
     * M1 FIX: Resolve memory state from database if requested
     * Returns null if not available (lightweight mode)
     */
    memoryState: async (
      parent: { id: string; memoryState?: any },
      _args: any,
      context: GraphQLContext
    ) => {
      // If already populated, return it
      if (parent.memoryState) {
        return parent.memoryState;
      }

      // Try to load from database
      try {
        const result = await context.db.query(
          `SELECT memory_state FROM agent_states
           WHERE agent_id = $1
           ORDER BY timestamp DESC
           LIMIT 1`,
          [parent.id]
        );

        if (result.rows.length === 0 || !result.rows[0].memory_state) {
          return null;
        }

        const memoryState = result.rows[0].memory_state;

        // Parse if string
        const parsed = typeof memoryState === 'string'
          ? JSON.parse(memoryState)
          : memoryState;

        return {
          immediateHistory: parsed.immediate_history || null,
          shorttermHistory: parsed.shortterm_history || null,
          longtermStats: parsed.longterm_stats || null,
          behaviorSuccessRates: parsed.behavior_success_rates || null,
          totalCitationsProcessed: parsed.total_citations_processed || null
        };
      } catch (err) {
        console.error(`Failed to load memory state for agent ${parent.id}:`, err);
        return null;
      }
    }
  },

  Citation: {
    /**
     * Resolve agent that analyzed this citation
     */
    agent: async (
      parent: { agentId: string },
      _args: any,
      context: GraphQLContext
    ) => {
      // Reuse agent query resolver
      return queryResolvers.agent(null, { id: parent.agentId }, context);
    }
  }
};

// ============================================================================
// Subscription Resolvers
// ============================================================================

export const subscriptionResolvers = {
  /**
   * Subscribe to citation analysis events
   */
  citationAnalyzed: {
    subscribe: (_parent: any, _args: any, context: GraphQLContext) => {
      return context.pubsub.asyncIterator(['CITATION_ANALYZED']);
    }
  },

  /**
   * Subscribe to platform status updates
   */
  platformStatusUpdated: {
    subscribe: (_parent: any, _args: any, context: GraphQLContext) => {
      return context.pubsub.asyncIterator(['PLATFORM_STATUS_UPDATED']);
    }
  },

  /**
   * Subscribe to agent updates (optionally filter by agentId)
   */
  agentUpdated: {
    subscribe: (_parent: any, args: { agentId?: string }, context: GraphQLContext) => {
      if (args.agentId) {
        return context.pubsub.asyncIterator([`AGENT_UPDATED_${args.agentId}`]);
      }
      return context.pubsub.asyncIterator(['AGENT_UPDATED']);
    }
  }
};

// ============================================================================
// Combined Resolvers Export
// ============================================================================

export const resolvers = {
  Query: queryResolvers,
  Mutation: mutationResolvers,
  Subscription: subscriptionResolvers,
  ...fieldResolvers
};
