/**
 * GraphQL Server
 *
 * Apollo Server with Fastify integration and WebSocket subscriptions
 */

import { ApolloServer } from '@apollo/server';
import fastifyApollo from '@as-integrations/fastify';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { useServer } from 'graphql-ws/lib/use/ws';
import { WebSocketServer } from 'ws';
import { FastifyInstance } from 'fastify';

import { typeDefs } from './schema';
import { resolvers } from './resolvers';

/**
 * Create GraphQL schema
 */
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

/**
 * Create Apollo Server instance
 */
export async function createApolloServer() {
  const server = new ApolloServer({
    schema,
    introspection: process.env.NODE_ENV !== 'production',
    plugins: [
      // Logging plugin
      {
        async requestDidStart() {
          return {
            async didEncounterErrors(ctx) {
              console.error('GraphQL Errors:', ctx.errors);
            },
          };
        },
      },
    ],
  });

  await server.start();

  return server;
}

/**
 * Register GraphQL routes with Fastify
 *
 * @param fastify - Fastify instance
 */
export async function registerGraphQLRoutes(fastify: FastifyInstance) {
  const apolloServer = await createApolloServer();

  await fastify.register(fastifyApollo(apolloServer), {
    path: '/graphql',
  });

  fastify.log.info('📊 GraphQL endpoint registered at /graphql');
}

/**
 * Setup WebSocket server for GraphQL subscriptions
 *
 * @param server - HTTP server
 */
export function setupGraphQLSubscriptions(server: any) {
  const wsServer = new WebSocketServer({
    server,
    path: '/graphql',
  });

  useServer(
    {
      schema,
      context: async (ctx) => {
        // Add connection context
        return {
          connectionParams: ctx.connectionParams,
        };
      },
      onConnect: async (ctx) => {
        console.log('🔌 GraphQL WebSocket client connected');
      },
      onDisconnect: (ctx) => {
        console.log('🔌 GraphQL WebSocket client disconnected');
      },
    },
    wsServer
  );

  return wsServer;
}
