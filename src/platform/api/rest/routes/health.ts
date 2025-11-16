/**
 * Health Check Routes
 *
 * Provides API health status and service availability monitoring
 */

import { FastifyInstance } from 'fastify';
import { HealthCheckResponse } from '../../types/api';

export async function registerHealthRoutes(server: FastifyInstance) {
  /**
   * GET /api/v1/health
   *
   * Health check endpoint (no authentication required)
   */
  server.get<{
    Reply: HealthCheckResponse;
  }>(
    '/api/v1/health',
    {
      schema: {
        description: 'Check API health status',
        tags: ['health'],
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
              version: { type: 'string' },
              uptime: { type: 'number' },
              services: {
                type: 'object',
                properties: {
                  api: { type: 'object' },
                  database: { type: 'object' },
                  cache: { type: 'object' },
                  queue: { type: 'object' },
                  mcp: { type: 'object' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const startTime = Date.now();

      // Check service health
      const [apiHealth, dbHealth, cacheHealth, queueHealth, mcpHealth] = await Promise.all([
        checkApiHealth(),
        checkDatabaseHealth(),
        checkCacheHealth(),
        checkQueueHealth(),
        checkMcpHealth(),
      ]);

      const allHealthy =
        apiHealth.status === 'up' &&
        dbHealth.status === 'up' &&
        cacheHealth.status === 'up' &&
        queueHealth.status === 'up' &&
        mcpHealth.status !== 'down';

      const anyDown =
        apiHealth.status === 'down' ||
        dbHealth.status === 'down' ||
        cacheHealth.status === 'down' ||
        queueHealth.status === 'down' ||
        mcpHealth.status === 'down';

      const overallStatus = allHealthy ? 'healthy' : anyDown ? 'unhealthy' : 'degraded';

      const response: HealthCheckResponse = {
        status: overallStatus,
        version: '1.0.0',
        uptime: process.uptime(),
        services: {
          api: apiHealth,
          database: dbHealth,
          cache: cacheHealth,
          queue: queueHealth,
          mcp: mcpHealth,
        },
      };

      const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

      return reply.status(statusCode).send(response);
    }
  );

  /**
   * GET /api/v1/health/live
   *
   * Liveness probe (Kubernetes-style)
   */
  server.get('/api/v1/health/live', async (request, reply) => {
    return reply.status(200).send({ status: 'alive' });
  });

  /**
   * GET /api/v1/health/ready
   *
   * Readiness probe (Kubernetes-style)
   */
  server.get('/api/v1/health/ready', async (request, reply) => {
    // Check if server can accept traffic
    const dbHealth = await checkDatabaseHealth();
    const cacheHealth = await checkCacheHealth();

    if (dbHealth.status === 'down' || cacheHealth.status === 'down') {
      return reply.status(503).send({ status: 'not_ready' });
    }

    return reply.status(200).send({ status: 'ready' });
  });
}

/**
 * Check API health (always up if we can respond)
 */
async function checkApiHealth() {
  return {
    status: 'up' as const,
    latency: 0,
  };
}

/**
 * Check database health
 */
async function checkDatabaseHealth() {
  try {
    // TODO: Implement actual database health check
    // For now, simulate with placeholder
    const startTime = Date.now();

    // Simulate database ping
    await new Promise((resolve) => setTimeout(resolve, 1));

    return {
      status: 'up' as const,
      latency: Date.now() - startTime,
    };
  } catch (err) {
    return {
      status: 'down' as const,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Check cache health (Redis/LRU)
 */
async function checkCacheHealth() {
  try {
    // TODO: Implement actual cache health check
    const startTime = Date.now();

    // For now, return up
    return {
      status: 'up' as const,
      latency: Date.now() - startTime,
    };
  } catch (err) {
    return {
      status: 'down' as const,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Check queue health (BullMQ)
 */
async function checkQueueHealth() {
  try {
    // TODO: Implement actual queue health check
    const startTime = Date.now();

    return {
      status: 'up' as const,
      latency: Date.now() - startTime,
    };
  } catch (err) {
    return {
      status: 'down' as const,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Check MCP server health
 */
async function checkMcpHealth() {
  try {
    // TODO: Implement actual MCP health check
    const startTime = Date.now();

    return {
      status: 'up' as const,
      latency: Date.now() - startTime,
    };
  } catch (err) {
    return {
      status: 'degraded' as const,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
