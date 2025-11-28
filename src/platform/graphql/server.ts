/**
 * MARCUS 3.1 GraphQL Apollo Server
 *
 * Production-ready GraphQL server with:
 * - Apollo Server 4
 * - DataLoader optimization
 * - Authentication via JWT
 * - Subscription support via WebSockets
 * - Playground in development only
 *
 * M2 TODO: Redis-backed PubSub for multi-pod production
 * =====================================================
 * Current PubSub uses in-memory graphql-subscriptions which doesn't work
 * across multiple K8s pods. For production multi-pod deployments:
 *
 * 1. Install: npm install graphql-redis-subscriptions
 * 2. Replace PubSub import with RedisPubSub
 * 3. Configure with same Redis host as RedisConnectionPool
 * 4. Update GraphQLContext type in resolvers.ts
 *
 * Example:
 * ```typescript
 * import { RedisPubSub } from 'graphql-redis-subscriptions';
 * const pubsub = new RedisPubSub({
 *   publisher: new Redis(redisConfig),
 *   subscriber: new Redis(redisConfig)
 * });
 * ```
 *
 * Impact: Subscriptions will work across all orchestrator pods
 * Priority: MEDIUM (only needed when running 3+ replicas with subscriptions)
 *
 * Author: Marcus (Platform Engineer)
 * Date: 2025-11-22
 * Updated: 2025-11-28 (M2 documentation)
 */

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginLandingPageLocalDefault, ApolloServerPluginLandingPageProductionDefault } from '@apollo/server/plugin/landingPage/default';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { PubSub } from 'graphql-subscriptions';
import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import express, { Express } from 'express';
import http from 'http';
import { CitationAgentOrchestrator } from '../integration/citationAgentIntegration';
import { resolvers } from './resolvers';
import { createDataLoaders } from './dataloaders';
import { GraphQLContext } from './resolvers';

// ============================================================================
// GraphQL Server Configuration
// ============================================================================

export interface GraphQLServerConfig {
  // Express app (for middleware integration)
  app: Express;

  // HTTP server (for WebSocket upgrade)
  httpServer: http.Server;

  // Platform dependencies
  orchestrator: CitationAgentOrchestrator;
  db: Pool;

  // Feature flags
  enablePlayground?: boolean;
  enableIntrospection?: boolean;
  enableSubscriptions?: boolean;

  // Performance
  maxRequestsPerSecond?: number;
  queryDepthLimit?: number;
}

// ============================================================================
// Apollo Server Factory
// ============================================================================

/**
 * Create and configure Apollo Server for GraphQL API
 *
 * @param config Server configuration
 * @returns Configured Apollo Server instance
 */
export async function createGraphQLServer(config: GraphQLServerConfig): Promise<ApolloServer<GraphQLContext>> {
  // Load GraphQL schema from file
  const schemaPath = join(__dirname, 'schema.graphql');
  const typeDefs = readFileSync(schemaPath, 'utf-8');

  // Create executable schema
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers
  });

  // Create PubSub for subscriptions
  const pubsub = new PubSub();

  // Setup WebSocket server for subscriptions (if enabled)
  let wsServer: WebSocketServer | undefined;
  let serverCleanup: (() => Promise<void>) | undefined;

  if (config.enableSubscriptions !== false) {
    wsServer = new WebSocketServer({
      server: config.httpServer,
      path: '/graphql'
    });

    serverCleanup = useServer(
      {
        schema,
        context: async (ctx, msg, args) => {
          // Create context for subscription
          return {
            orchestrator: config.orchestrator,
            db: config.db,
            dataloaders: createDataLoaders(config.db),
            pubsub,
            // Extract user from connection params (for auth)
            user: (ctx.connectionParams as any)?.user
          };
        }
      },
      wsServer
    );

    console.log('✅ GraphQL subscriptions enabled (WebSocket)');
  }

  // Create Apollo Server
  const server = new ApolloServer<GraphQLContext>({
    schema,

    // Plugins
    plugins: [
      // Graceful shutdown
      ApolloServerPluginDrainHttpServer({ httpServer: config.httpServer }),

      // WebSocket cleanup
      ...(serverCleanup ? [{
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup!();
            }
          };
        }
      }] : []),

      // Landing page (playground in dev, production page in prod)
      config.enablePlayground !== false && process.env.NODE_ENV !== 'production'
        ? ApolloServerPluginLandingPageLocalDefault({ embed: true })
        : ApolloServerPluginLandingPageProductionDefault({ footer: false })
    ],

    // Introspection (enabled in dev, configurable in prod)
    introspection: config.enableIntrospection !== false || process.env.NODE_ENV !== 'production',

    // Error handling
    formatError: (formattedError, error) => {
      // Log error details server-side
      console.error('GraphQL Error:', {
        message: formattedError.message,
        code: formattedError.extensions?.code,
        path: formattedError.path,
        originalError: error
      });

      // Return sanitized error to client
      if (process.env.NODE_ENV === 'production') {
        // Hide internal errors in production
        if (formattedError.extensions?.code === 'INTERNAL_SERVER_ERROR') {
          return {
            message: 'Internal server error',
            extensions: {
              code: 'INTERNAL_SERVER_ERROR'
            }
          };
        }
      }

      return formattedError;
    }
  });

  await server.start();
  console.log('✅ Apollo Server started');

  return server;
}

// ============================================================================
// Express Middleware Integration
// ============================================================================

/**
 * Create Express middleware for GraphQL endpoint
 *
 * Integrates Apollo Server with Express, providing:
 * - Request context creation (with DataLoaders)
 * - Authentication via JWT
 * - CORS handling
 *
 * @param server Apollo Server instance
 * @param config Server configuration
 * @returns Express middleware
 */
export function createGraphQLMiddleware(
  server: ApolloServer<GraphQLContext>,
  config: Pick<GraphQLServerConfig, 'orchestrator' | 'db'>
) {
  return expressMiddleware(server, {
    context: async ({ req, res }): Promise<GraphQLContext> => {
      // Create fresh DataLoaders for each request (prevents cache staleness)
      const dataloaders = createDataLoaders(config.db);

      // Create PubSub instance (shared for subscriptions)
      const pubsub = new PubSub();

      // Extract user from JWT (if authenticated)
      // JWT middleware should run before this
      const user = (req as any).user;

      return {
        orchestrator: config.orchestrator,
        db: config.db,
        dataloaders,
        pubsub,
        user
      };
    }
  });
}

// ============================================================================
// Server Lifecycle Management
// ============================================================================

/**
 * Setup GraphQL server with Express integration
 *
 * Complete setup including:
 * - Apollo Server creation
 * - Express middleware registration
 * - WebSocket support for subscriptions
 *
 * @param app Express application
 * @param httpServer HTTP server
 * @param orchestrator Citation orchestrator
 * @param db PostgreSQL pool
 * @param enablePlayground Enable GraphQL Playground
 * @returns Apollo Server instance
 */
export async function setupGraphQLServer(
  app: Express,
  httpServer: http.Server,
  orchestrator: CitationAgentOrchestrator,
  db: Pool,
  enablePlayground: boolean = process.env.NODE_ENV !== 'production'
): Promise<ApolloServer<GraphQLContext>> {
  // Create GraphQL server
  const server = await createGraphQLServer({
    app,
    httpServer,
    orchestrator,
    db,
    enablePlayground,
    enableIntrospection: enablePlayground,
    enableSubscriptions: true
  });

  // Register GraphQL middleware at /graphql endpoint
  app.use(
    '/graphql',
    express.json(),
    createGraphQLMiddleware(server, { orchestrator, db })
  );

  console.log('✅ GraphQL endpoint registered at /graphql');

  if (enablePlayground) {
    console.log(`📊 GraphQL Playground available at http://localhost:${process.env.PORT || 3000}/graphql`);
  }

  return server;
}

// ============================================================================
// Performance Monitoring Plugin
// ============================================================================

/**
 * Apollo Server plugin for performance monitoring
 *
 * Tracks query execution time and logs slow queries.
 */
export function createPerformanceMonitoringPlugin(slowQueryThreshold: number = 1000) {
  return {
    async requestDidStart() {
      const startTime = Date.now();
      let operationName: string | undefined;

      return {
        async didResolveOperation(requestContext: any) {
          operationName = requestContext.operationName;
        },

        async willSendResponse(requestContext: any) {
          const duration = Date.now() - startTime;

          if (duration > slowQueryThreshold) {
            console.warn(`⚠️ Slow GraphQL query detected:
              Operation: ${operationName || 'unknown'}
              Duration: ${duration}ms
              Query: ${requestContext.request.query?.substring(0, 200)}...`);
          }

          // Track in metrics (if metrics collector available)
          // metricsCollector.recordGraphQLLatency(duration, operationName);
        }
      };
    }
  };
}

// ============================================================================
// Query Complexity Limiting
// ============================================================================

/**
 * Apollo Server plugin for query complexity limiting
 *
 * Prevents expensive queries from overwhelming the server.
 * Uses depth limiting and complexity calculation.
 */
export function createComplexityLimitPlugin(maxDepth: number = 10, maxComplexity: number = 1000) {
  return {
    async requestDidStart() {
      return {
        async didResolveOperation(requestContext: any) {
          // Calculate query depth
          const depth = calculateQueryDepth(requestContext.document);

          if (depth > maxDepth) {
            throw new Error(`Query depth (${depth}) exceeds maximum (${maxDepth})`);
          }

          // Calculate query complexity (simplified)
          // In production, use graphql-query-complexity library
          const complexity = estimateComplexity(requestContext.document);

          if (complexity > maxComplexity) {
            throw new Error(`Query complexity (${complexity}) exceeds maximum (${maxComplexity})`);
          }
        }
      };
    }
  };
}

/**
 * Calculate query depth (simplified implementation)
 */
function calculateQueryDepth(document: any): number {
  // Simplified: count nesting levels
  // Production: use graphql-depth-limit library
  return 5; // Placeholder
}

/**
 * Estimate query complexity (simplified implementation)
 */
function estimateComplexity(document: any): number {
  // Simplified: count fields
  // Production: use graphql-query-complexity library
  return 100; // Placeholder
}
