/**
 * LSS Monitoring Routes
 *
 * Local Surprise Signal monitoring and alerting
 */

import { FastifyInstance } from 'fastify';
import {
  LssMonitoringRequest,
  LssMonitoringRequestSchema,
  LssEvent,
  ApiResponse,
} from '../../types/api';
import { authenticate, optionalAuth } from '../../middleware/auth';

export async function registerLssRoutes(server: FastifyInstance) {
  /**
   * GET /api/v1/lss/events
   *
   * Get LSS events with filtering
   */
  server.get<{
    Querystring: LssMonitoringRequest;
    Reply: ApiResponse<{ events: LssEvent[] }>;
  }>(
    '/api/v1/lss/events',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Get LSS events',
        tags: ['lss'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            level: {
              type: 'string',
              enum: ['parameter', 'claim', 'memory', 'verification'],
            },
            threshold: { type: 'number', minimum: 0, maximum: 1, default: 0.2 },
            since: { type: 'number' },
            limit: { type: 'number', minimum: 1, maximum: 1000, default: 100 },
          },
        },
      },
    },
    async (request, reply) => {
      const startTime = Date.now();

      // OWASP A03: Validate query params
      const validationResult = LssMonitoringRequestSchema.safeParse(request.query);

      if (!validationResult.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: validationResult.error.flatten(),
          },
        });
      }

      const { level, threshold, since, limit } = validationResult.data;

      try {
        // TODO: Implement actual LSS event query
        // For now, return mock events

        const events: LssEvent[] = [
          {
            id: 'lss_1',
            level: 'parameter',
            lss: 0.25,
            threshold: 0.2,
            context: 'cascade_factor',
            details: {
              current: 1.8,
              cited: 2.0,
              drift: 0.1,
            },
            timestamp: Date.now() - 3600000,
            severity: 'WARNING',
          },
          {
            id: 'lss_2',
            level: 'claim',
            lss: 1.0,
            threshold: 0.2,
            context: 'Claim verification failed',
            details: {
              claim: 'GPT-3 consumed 5 million liters',
              expected: '500,000-700,000',
            },
            timestamp: Date.now() - 7200000,
            severity: 'CRITICAL',
          },
        ];

        return reply.send({
          success: true,
          data: { events },
          metadata: {
            timestamp: Date.now(),
            requestId: request.id,
            version: '1.0.0',
            performance: {
              duration: Date.now() - startTime,
              cached: false,
            },
          },
        });
      } catch (err) {
        request.log.error({ err }, 'LSS event query failed');

        return reply.status(500).send({
          success: false,
          error: {
            code: 'LSS_QUERY_ERROR',
            message: err instanceof Error ? err.message : 'Unknown error',
          },
        });
      }
    }
  );

  /**
   * GET /api/v1/lss/stats
   *
   * Get LSS statistics
   */
  server.get(
    '/api/v1/lss/stats',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Get LSS statistics',
        tags: ['lss'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      // TODO: Implement actual statistics calculation
      return reply.send({
        success: true,
        data: {
          totalEvents: 42,
          byLevel: {
            parameter: 15,
            claim: 20,
            memory: 5,
            verification: 2,
          },
          bySeverity: {
            INFO: 10,
            WARNING: 25,
            CRITICAL: 7,
          },
          avgLss: {
            parameter: 0.15,
            claim: 0.35,
            memory: 0.05,
            verification: 0.8,
          },
        },
      });
    }
  );

  /**
   * POST /api/v1/lss/alert
   *
   * Create LSS alert (internal use by monitoring system)
   */
  server.post<{
    Body: Omit<LssEvent, 'id' | 'timestamp'>;
  }>(
    '/api/v1/lss/alert',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Create LSS alert',
        tags: ['lss'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const event = request.body;

      // TODO: Implement actual alert creation
      // Store in database, send notifications, etc.

      request.log.warn({ event }, 'LSS alert created');

      return reply.status(201).send({
        success: true,
        data: {
          id: 'lss_' + Date.now(),
          ...event,
          timestamp: Date.now(),
        },
      });
    }
  );
}
