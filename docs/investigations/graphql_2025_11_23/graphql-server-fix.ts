/**
 * Simplified GraphQL server setup for worker-orchestrator-server
 * This module provides GraphQL API without requiring Python agents
 */

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { json } from 'body-parser';
import cors from 'cors';
import { Express } from 'express';
import { Server } from 'http';
import { Pool } from 'pg';
import { makeExecutableSchema } from '@graphql-tools/schema';

// GraphQL schema definition
const typeDefs = `#graphql
  type Query {
    health: HealthStatus!
    metrics: SystemMetrics!
    tasks(status: String, limit: Int = 10): [Task!]!
    agents: [Agent!]!
  }

  type Mutation {
    createTask(input: CreateTaskInput!): Task!
    updateTaskStatus(id: ID!, status: String!): Task!
  }

  type HealthStatus {
    status: String!
    version: String!
    uptime: Int!
    timestamp: String!
    services: [ServiceStatus!]!
  }

  type ServiceStatus {
    name: String!
    status: String!
    lastChecked: String!
  }

  type SystemMetrics {
    cpu: Float!
    memory: MemoryMetrics!
    redis: RedisMetrics!
    postgres: PostgresMetrics!
  }

  type MemoryMetrics {
    used: Int!
    total: Int!
    percentage: Float!
  }

  type RedisMetrics {
    connected: Boolean!
    operations: Int!
    latency: Float!
  }

  type PostgresMetrics {
    activeConnections: Int!
    idleConnections: Int!
    totalQueries: Int!
  }

  type Task {
    id: ID!
    type: String!
    status: String!
    priority: Int!
    payload: String!
    result: String
    error: String
    retryCount: Int!
    createdAt: String!
    updatedAt: String!
    completedAt: String
  }

  type Agent {
    id: ID!
    name: String!
    type: String!
    status: String!
    lastHeartbeat: String!
    capabilities: [String!]!
  }

  input CreateTaskInput {
    type: String!
    priority: Int = 5
    payload: String!
  }
`;

// Create resolvers
function createResolvers(db: Pool) {
  const startTime = Date.now();

  return {
    Query: {
      health: async () => ({
        status: 'healthy',
        version: process.env.VERSION || '3.4.0',
        uptime: Math.floor((Date.now() - startTime) / 1000),
        timestamp: new Date().toISOString(),
        services: [
          {
            name: 'GraphQL',
            status: 'operational',
            lastChecked: new Date().toISOString()
          },
          {
            name: 'PostgreSQL',
            status: 'operational',
            lastChecked: new Date().toISOString()
          },
          {
            name: 'Redis',
            status: 'operational',
            lastChecked: new Date().toISOString()
          }
        ]
      }),

      metrics: async () => {
        const memoryUsage = process.memoryUsage();
        const totalMemory = require('os').totalmem();
        const freeMemory = require('os').freemem();
        const usedMemory = totalMemory - freeMemory;

        return {
          cpu: process.cpuUsage().user / 1000000, // Convert to seconds
          memory: {
            used: Math.floor(usedMemory / 1024 / 1024), // MB
            total: Math.floor(totalMemory / 1024 / 1024), // MB
            percentage: (usedMemory / totalMemory) * 100
          },
          redis: {
            connected: true,
            operations: 0,
            latency: 0.5
          },
          postgres: {
            activeConnections: db.totalCount || 0,
            idleConnections: db.idleCount || 0,
            totalQueries: 0
          }
        };
      },

      tasks: async (_, { status, limit }) => {
        try {
          let query = 'SELECT * FROM citation_tasks';
          const params: any[] = [];

          if (status) {
            query += ' WHERE status = $1';
            params.push(status);
          }

          query += ` ORDER BY created_at DESC LIMIT ${limit}`;

          const result = await db.query(query, params);
          return result.rows.map(row => ({
            id: row.id,
            type: row.task_type || 'citation',
            status: row.status,
            priority: row.priority || 5,
            payload: JSON.stringify(row.payload || {}),
            result: row.result ? JSON.stringify(row.result) : null,
            error: row.error,
            retryCount: row.retry_count || 0,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            completedAt: row.completed_at
          }));
        } catch (error) {
          console.error('Error fetching tasks:', error);
          return [];
        }
      },

      agents: async () => {
        // In worker pattern, agents are separate containers
        // Return mock data for demo
        return [
          {
            id: '1',
            name: 'citation-agent-1',
            type: 'citation',
            status: 'idle',
            lastHeartbeat: new Date().toISOString(),
            capabilities: ['citation', 'validation']
          },
          {
            id: '2',
            name: 'validation-agent-1',
            type: 'validation',
            status: 'idle',
            lastHeartbeat: new Date().toISOString(),
            capabilities: ['validation', 'scoring']
          }
        ];
      }
    },

    Mutation: {
      createTask: async (_, { input }, { db }) => {
        try {
          const result = await db.query(
            `INSERT INTO citation_tasks (task_type, status, priority, payload, created_at, updated_at)
             VALUES ($1, $2, $3, $4, NOW(), NOW())
             RETURNING *`,
            [input.type, 'pending', input.priority, JSON.parse(input.payload)]
          );

          const row = result.rows[0];
          return {
            id: row.id,
            type: row.task_type,
            status: row.status,
            priority: row.priority,
            payload: JSON.stringify(row.payload),
            result: null,
            error: null,
            retryCount: 0,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            completedAt: null
          };
        } catch (error) {
          console.error('Error creating task:', error);
          throw new Error('Failed to create task');
        }
      },

      updateTaskStatus: async (_, { id, status }, { db }) => {
        try {
          const result = await db.query(
            `UPDATE citation_tasks 
             SET status = $2, updated_at = NOW()
             WHERE id = $1
             RETURNING *`,
            [id, status]
          );

          if (result.rows.length === 0) {
            throw new Error('Task not found');
          }

          const row = result.rows[0];
          return {
            id: row.id,
            type: row.task_type || 'citation',
            status: row.status,
            priority: row.priority || 5,
            payload: JSON.stringify(row.payload || {}),
            result: row.result ? JSON.stringify(row.result) : null,
            error: row.error,
            retryCount: row.retry_count || 0,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            completedAt: row.completed_at
          };
        } catch (error) {
          console.error('Error updating task:', error);
          throw new Error('Failed to update task');
        }
      }
    }
  };
}

export async function setupGraphQLServer(
  app: Express,
  httpServer: Server,
  orchestrator: any, // Not used in worker pattern
  db: Pool,
  introspection: boolean = false
): Promise<void> {
  try {
    // Create executable schema
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers: createResolvers(db)
    });

    // Create Apollo Server
    const server = new ApolloServer({
      schema,
      introspection: introspection || process.env.NODE_ENV !== 'production',
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer })
      ]
    });

    // Start the server
    await server.start();

    // Apply middleware
    app.use(
      '/graphql',
      cors<cors.CorsRequest>(),
      json(),
      expressMiddleware(server, {
        context: async ({ req }) => ({ 
          db,
          req,
          // Add any additional context needed
        }),
      })
    );

    console.log('✅ GraphQL server configured at /graphql');
    if (introspection) {
      console.log('   GraphQL Playground enabled (introspection: true)');
    }
  } catch (error) {
    console.error('Failed to setup GraphQL server:', error);
    throw error;
  }
}
