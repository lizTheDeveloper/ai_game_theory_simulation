# MARCUS 3.1: GraphQL API Layer Implementation Guide

**Priority:** LOW (L4)
**Effort:** 2 weeks
**Status:** Planning Complete, Implementation Ready

## Executive Summary

Add GraphQL API alongside existing REST API to reduce client round trips and improve developer experience.

**Problem:** REST requires multiple requests for related data
**Solution:** GraphQL allows clients to request exactly what they need in one query

## Benefits

### Reduced Round Trips

**REST (Current):**
```typescript
// 3 separate requests
const agent = await fetch('/api/agents/agent_001');
const status = await fetch('/api/agents/agent_001/status');
const metrics = await fetch('/api/agents/agent_001/metrics');
const citations = await fetch('/api/citations?agent_id=agent_001');

// Total latency: 4 × 50ms = 200ms
```

**GraphQL (New):**
```graphql
query {
  agent(id: "agent_001") {
    id
    status {
      reputation
      isHealthy
    }
    metrics {
      totalCitations
      violationRate
    }
    recentCitations(limit: 10) {
      integrityScore
      timestamp
    }
  }
}
# Total latency: 1 × 60ms = 60ms (3.3x faster)
```

### Type Safety

GraphQL schema provides:
- Auto-generated TypeScript types
- Client-side validation
- IDE autocomplete
- API documentation

## Implementation Plan

### Week 1: Schema Design & Core Resolvers

#### 1. Install Dependencies

```bash
npm install apollo-server-express graphql
npm install --save-dev @graphql-codegen/cli @graphql-codegen/typescript
```

#### 2. Define GraphQL Schema

```graphql
# src/platform/graphql/schema.graphql

"""
MARCUS 3.1 GraphQL API Schema
"""

scalar DateTime
scalar JSON

# ============================================================================
# Agent Types
# ============================================================================

type Agent {
  """Agent identifier"""
  id: ID!

  """Current agent status and health"""
  status: AgentStatus!

  """Performance metrics"""
  metrics: AgentMetrics!

  """Recent citation analyses"""
  recentCitations(limit: Int = 10): [CitationAnalysis!]!

  """Agent configuration"""
  config: AgentConfig!
}

type AgentStatus {
  """Reputation score (0-1)"""
  reputation: Float!

  """Total citations analyzed"""
  totalCitations: Int!

  """Number of violations detected"""
  detectedViolations: Int!

  """Violation rate (0-1)"""
  violationRate: Float!

  """Current behavior"""
  currentBehavior: String!

  """Exploration rate"""
  explorationRate: Float!

  """Memory state"""
  memoryState: MemoryState!

  """Is agent healthy?"""
  isHealthy: Boolean!

  """Last health check timestamp"""
  lastHealthCheck: DateTime!
}

type AgentMetrics {
  """Average integrity score"""
  avgIntegrityScore: Float!

  """Total processing time (seconds)"""
  totalProcessingTime: Float!

  """Average latency (ms)"""
  avgLatency: Float!

  """P95 latency (ms)"""
  p95Latency: Float!

  """P99 latency (ms)"""
  p99Latency: Float!
}

type MemoryState {
  """Immediate memory size"""
  immediate: Int!

  """Short-term memory size"""
  shortterm: Int!

  """Long-term stats count"""
  longtermStats: Int!

  """Behavior reputations"""
  behaviorReputations: JSON!
}

type AgentConfig {
  """Maximum restarts allowed"""
  maxRestarts: Int!

  """Request timeout (ms)"""
  timeout: Int!

  """Exploration strategy"""
  explorationStrategy: String!
}

# ============================================================================
# Citation Types
# ============================================================================

type CitationAnalysis {
  """Analysis ID"""
  id: ID!

  """Source document"""
  source: String!

  """Claimed citation"""
  claimedSource: String!

  """Integrity score (0-1)"""
  integrityScore: Float!

  """Consensus among agents"""
  consensus: Float!

  """Number of agents analyzed"""
  numAgents: Int!

  """Behavior distribution"""
  behaviorDistribution: JSON!

  """Recommendations"""
  recommendations: [String!]!

  """Individual agent results"""
  individualResults: [AgentResult!]!

  """Analysis latency (ms)"""
  latencyMs: Int!

  """Timestamp"""
  timestamp: DateTime!
}

type AgentResult {
  """Agent ID"""
  agentId: String!

  """Integrity score from this agent"""
  integrityScore: Float!

  """Behavior used"""
  behaviorUsed: String!

  """Agent reputation"""
  agentReputation: Float!

  """Detected violations"""
  violations: [String!]!
}

# ============================================================================
# Platform Types
# ============================================================================

type PlatformStatus {
  """Platform health status"""
  status: HealthStatus!

  """Total agents"""
  totalAgents: Int!

  """Healthy agents"""
  healthyAgents: Int!

  """Degraded agents"""
  degradedAgents: Int!

  """Database status"""
  database: DatabaseStatus!

  """Redis status"""
  redis: RedisStatus!

  """System uptime (seconds)"""
  uptime: Float!

  """Version"""
  version: String!
}

enum HealthStatus {
  HEALTHY
  DEGRADED
  ERROR
}

type DatabaseStatus {
  """Is database connected?"""
  connected: Boolean!

  """Total connections"""
  totalConnections: Int!

  """Idle connections"""
  idleConnections: Int!

  """Waiting clients"""
  waitingClients: Int!
}

type RedisStatus {
  """Is Redis connected?"""
  connected: Boolean!

  """Memory usage (bytes)"""
  memoryUsage: Float!

  """Connected clients"""
  connectedClients: Int!

  """Keyspace hits"""
  keyspaceHits: Int!

  """Keyspace misses"""
  keyspaceMisses: Int!

  """Cache hit ratio (0-1)"""
  cacheHitRatio: Float!
}

# ============================================================================
# Query Root
# ============================================================================

type Query {
  """Get agent by ID"""
  agent(id: ID!): Agent

  """List all agents"""
  agents(
    """Filter by health status"""
    isHealthy: Boolean
    """Limit number of results"""
    limit: Int = 100
    """Offset for pagination"""
    offset: Int = 0
  ): [Agent!]!

  """Get citation analysis by ID"""
  citationAnalysis(id: ID!): CitationAnalysis

  """List citation analyses"""
  citationAnalyses(
    """Filter by source"""
    source: String
    """Filter by minimum integrity score"""
    minIntegrity: Float
    """Limit number of results"""
    limit: Int = 100
    """Offset for pagination"""
    offset: Int = 0
  ): [CitationAnalysis!]!

  """Get platform status"""
  platformStatus: PlatformStatus!

  """Search citations by text"""
  searchCitations(query: String!, limit: Int = 20): [CitationAnalysis!]!
}

# ============================================================================
# Mutation Root
# ============================================================================

input CitationInput {
  """Citation text"""
  text: String!

  """Claimed source"""
  claimedSource: String!

  """Actual source (optional, for validation)"""
  actualSource: String

  """Additional metadata"""
  metadata: JSON
}

type Mutation {
  """Submit citation for analysis"""
  analyzeCitation(input: CitationInput!): CitationAnalysis!

  """Reset agent state"""
  resetAgent(agentId: ID!): Agent!

  """Update agent configuration"""
  updateAgentConfig(agentId: ID!, config: JSON!): Agent!
}

# ============================================================================
# Subscription Root (Future Enhancement)
# ============================================================================

type Subscription {
  """Subscribe to agent status updates"""
  agentStatusUpdates(agentId: ID!): AgentStatus!

  """Subscribe to new citation analyses"""
  citationAnalysisStream: CitationAnalysis!
}
```

#### 3. Implement Resolvers

```typescript
// src/platform/graphql/resolvers.ts

import { CitationAgentOrchestrator } from '../integration/citationAgentIntegration';
import { Pool } from 'pg';
import Redis from 'ioredis';

export const resolvers = {
  Query: {
    agent: async (
      _parent: any,
      { id }: { id: string },
      context: GraphQLContext
    ) => {
      const { orchestrator, db } = context;

      // Fetch agent from orchestrator
      const statuses = await orchestrator.getAgentStatuses();
      const agent = statuses.find(s => s.agentId === id);

      if (!agent) {
        throw new Error(`Agent ${id} not found`);
      }

      return {
        id: agent.agentId,
        status: agent,
        // Lazy loading - resolved by Agent.metrics resolver
        metrics: agent,
        recentCitations: null,
        config: null
      };
    },

    agents: async (
      _parent: any,
      { isHealthy, limit, offset }: { isHealthy?: boolean; limit: number; offset: number },
      context: GraphQLContext
    ) => {
      const { orchestrator } = context;

      let statuses = await orchestrator.getAgentStatuses();

      // Filter by health
      if (isHealthy !== undefined) {
        statuses = statuses.filter(s => s.isHealthy === isHealthy);
      }

      // Pagination
      statuses = statuses.slice(offset, offset + limit);

      return statuses.map(s => ({
        id: s.agentId,
        status: s,
        metrics: s,
        recentCitations: null,
        config: null
      }));
    },

    citationAnalysis: async (
      _parent: any,
      { id }: { id: string },
      context: GraphQLContext
    ) => {
      const { db } = context;

      const result = await db.query(
        'SELECT * FROM citation_analyses WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        throw new Error(`Citation analysis ${id} not found`);
      }

      return mapCitationAnalysis(result.rows[0]);
    },

    citationAnalyses: async (
      _parent: any,
      { source, minIntegrity, limit, offset }: any,
      context: GraphQLContext
    ) => {
      const { db } = context;

      let query = 'SELECT * FROM citation_analyses WHERE 1=1';
      const params: any[] = [];

      if (source) {
        params.push(source);
        query += ` AND source = $${params.length}`;
      }

      if (minIntegrity !== undefined) {
        params.push(minIntegrity);
        query += ` AND mean_integrity >= $${params.length}`;
      }

      query += ` ORDER BY timestamp DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await db.query(query, params);

      return result.rows.map(mapCitationAnalysis);
    },

    platformStatus: async (
      _parent: any,
      _args: any,
      context: GraphQLContext
    ) => {
      const { orchestrator, db, redis } = context;

      const totalAgents = await orchestrator.getAgentCount();
      const healthyAgents = await orchestrator.getHealthyAgentCount();

      // Database stats
      const dbStats = {
        connected: true,
        totalConnections: db.totalCount,
        idleConnections: db.idleCount,
        waitingClients: db.waitingCount
      };

      // Redis stats
      const redisInfo = await redis.info('memory');
      const redisStats = await redis.info('stats');

      return {
        status: healthyAgents === 0 ? 'ERROR' : (healthyAgents < totalAgents * 0.5 ? 'DEGRADED' : 'HEALTHY'),
        totalAgents,
        healthyAgents,
        degradedAgents: totalAgents - healthyAgents,
        database: dbStats,
        redis: parseRedisInfo(redisInfo, redisStats),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '0.0.0'
      };
    }
  },

  Mutation: {
    analyzeCitation: async (
      _parent: any,
      { input }: { input: CitationInput },
      context: GraphQLContext
    ) => {
      const { orchestrator } = context;

      const result = await orchestrator.analyzeDocument({
        text: input.text,
        claimedSource: input.claimedSource,
        actualSource: input.actualSource,
        metadata: input.metadata
      });

      return {
        id: `analysis_${Date.now()}`,
        ...result
      };
    },

    resetAgent: async (
      _parent: any,
      { agentId }: { agentId: string },
      context: GraphQLContext
    ) => {
      // Implementation: reset agent state in database
      throw new Error('Not implemented yet');
    }
  },

  // Nested resolvers (field-level)
  Agent: {
    metrics: async (agent: any, _args: any, context: GraphQLContext) => {
      // Load metrics from database
      const { db } = context;

      const result = await db.query(
        'SELECT AVG(metric_value) as avg_value FROM agent_metrics WHERE agent_id = $1 AND metric_name = $2',
        [agent.id, 'integrity_score']
      );

      return {
        avgIntegrityScore: result.rows[0]?.avg_value || 0,
        totalProcessingTime: 0,
        avgLatency: 0,
        p95Latency: 0,
        p99Latency: 0
      };
    },

    recentCitations: async (agent: any, { limit }: { limit: number }, context: GraphQLContext) => {
      const { db } = context;

      // Find citations analyzed by this agent
      const result = await db.query(
        `SELECT * FROM citation_analyses
         WHERE behavior_distribution ? $1
         ORDER BY timestamp DESC
         LIMIT $2`,
        [agent.id, limit]
      );

      return result.rows.map(mapCitationAnalysis);
    }
  }
};

interface GraphQLContext {
  orchestrator: CitationAgentOrchestrator;
  db: Pool;
  redis: Redis;
}

function mapCitationAnalysis(row: any): any {
  return {
    id: row.id,
    source: row.source,
    claimedSource: row.source,
    integrityScore: row.mean_integrity,
    consensus: row.consensus,
    numAgents: row.num_agents,
    behaviorDistribution: row.behavior_distribution,
    recommendations: row.recommendations,
    individualResults: [],
    latencyMs: row.latency_ms,
    timestamp: row.timestamp
  };
}
```

### Week 2: DataLoader, Playground, Deployment

#### 4. Add DataLoader for N+1 Prevention

```typescript
// src/platform/graphql/dataloaders.ts

import DataLoader from 'dataloader';
import { Pool } from 'pg';

export function createDataLoaders(db: Pool) {
  return {
    agentMetrics: new DataLoader(async (agentIds: readonly string[]) => {
      const result = await db.query(
        'SELECT agent_id, AVG(metric_value) as avg_value FROM agent_metrics WHERE agent_id = ANY($1) GROUP BY agent_id',
        [agentIds]
      );

      const metricsByAgent = new Map(
        result.rows.map(r => [r.agent_id, { avgIntegrityScore: r.avg_value }])
      );

      return agentIds.map(id => metricsByAgent.get(id) || null);
    })
  };
}
```

#### 5. Setup GraphQL Server

```typescript
// src/platform/graphql/server.ts

import { ApolloServer } from 'apollo-server-express';
import { readFileSync } from 'fs';
import { join } from 'path';
import { resolvers } from './resolvers';
import { createDataLoaders } from './dataloaders';

const typeDefs = readFileSync(
  join(__dirname, 'schema.graphql'),
  'utf-8'
);

export function createGraphQLServer(context: any) {
  return new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({
      ...context,
      dataloaders: createDataLoaders(context.db)
    }),
    playground: process.env.NODE_ENV !== 'production',
    introspection: true
  });
}

// Integration with Express
export function setupGraphQL(app: Express, context: any) {
  const server = createGraphQLServer(context);

  server.applyMiddleware({
    app,
    path: '/graphql',
    cors: true
  });

  console.log('✅ GraphQL endpoint configured at /graphql');
}
```

## Testing

```graphql
# Example queries for testing

# 1. Get agent with all details
query GetAgent {
  agent(id: "agent_001") {
    id
    status {
      reputation
      totalCitations
      isHealthy
    }
    metrics {
      avgIntegrityScore
      p95Latency
    }
    recentCitations(limit: 5) {
      integrityScore
      timestamp
    }
  }
}

# 2. List all healthy agents
query ListHealthyAgents {
  agents(isHealthy: true, limit: 10) {
    id
    status {
      reputation
      totalCitations
    }
  }
}

# 3. Analyze citation
mutation AnalyzeCitation {
  analyzeCitation(input: {
    text: "According to Smith et al. (2024), AI alignment is critical."
    claimedSource: "Smith et al. 2024"
  }) {
    integrityScore
    consensus
    recommendations
  }
}
```

## Rollout Plan

- Week 1: Development
- Week 2: Testing + deployment
- Feature flag: `ENABLE_GRAPHQL=true`
- Backward compatible (REST remains)

## Success Criteria

- [ ] GraphQL endpoint at /graphql
- [ ] Playground accessible in dev
- [ ] All REST endpoints have GraphQL equivalents
- [ ] Performance: No N+1 queries (DataLoader)
- [ ] Latency reduction: 30-50%
- [ ] Client round trips reduced: 2-4x
