/**
 * Verification Routes
 *
 * Claim extraction and verification endpoints
 */

import { FastifyInstance } from 'fastify';
import {
  ClaimExtractionRequest,
  ClaimExtractionRequestSchema,
  ClaimVerificationRequest,
  ClaimVerificationRequestSchema,
  ClaimVerificationResult,
  Claim,
  ApiResponse,
} from '../../types/api';
import { authenticate, authorize } from '../../middleware/auth';

export async function registerVerificationRoutes(server: FastifyInstance) {
  /**
   * POST /api/v1/verification/extract
   *
   * Extract claims from markdown/plain text
   */
  server.post<{
    Body: ClaimExtractionRequest;
    Reply: ApiResponse<{ claims: Claim[] }>;
  }>(
    '/api/v1/verification/extract',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Extract claims from content',
        tags: ['verification'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['content'],
          properties: {
            content: { type: 'string', minLength: 1 },
            format: { type: 'string', enum: ['markdown', 'plain'], default: 'markdown' },
          },
        },
      },
    },
    async (request, reply) => {
      const startTime = Date.now();

      // OWASP A03: Validate input
      const validationResult = ClaimExtractionRequestSchema.safeParse(request.body);

      if (!validationResult.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: validationResult.error.flatten(),
          },
        });
      }

      const { content, format } = validationResult.data;

      try {
        // TODO: Implement actual claim extraction
        // For now, return mock claims

        const claims: Claim[] = [
          {
            id: 'claim_1',
            text: 'GPT-3 consumed 700,000 liters of water',
            sourceRef: 'Li et al. 2023',
            extractedValue: 700000,
            timestamp: Date.now(),
          },
          {
            id: 'claim_2',
            text: 'Training consumed 1,287 MWh',
            sourceRef: 'Li et al. 2023',
            extractedValue: 1287,
            timestamp: Date.now(),
          },
        ];

        return reply.send({
          success: true,
          data: { claims },
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
        request.log.error({ err }, 'Claim extraction failed');

        return reply.status(500).send({
          success: false,
          error: {
            code: 'CLAIM_EXTRACTION_ERROR',
            message: err instanceof Error ? err.message : 'Unknown error',
          },
        });
      }
    }
  );

  /**
   * POST /api/v1/verification/verify
   *
   * Verify claims against research corpus
   */
  server.post<{
    Body: ClaimVerificationRequest;
    Reply: ApiResponse<{ results: ClaimVerificationResult[] }>;
  }>(
    '/api/v1/verification/verify',
    {
      preHandler: [authenticate, authorize(['researcher', 'admin'])],
      schema: {
        description: 'Verify claims against research corpus',
        tags: ['verification'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['claims'],
          properties: {
            claims: {
              type: 'array',
              items: {
                type: 'object',
                required: ['id', 'text', 'sourceRef'],
                properties: {
                  id: { type: 'string' },
                  text: { type: 'string' },
                  sourceRef: { type: 'string' },
                  extractedValue: { type: ['string', 'number'] },
                },
              },
            },
            timeout: { type: 'number', minimum: 1000, maximum: 30000, default: 10000 },
          },
        },
      },
    },
    async (request, reply) => {
      const startTime = Date.now();

      // OWASP A03: Validate input
      const validationResult = ClaimVerificationRequestSchema.safeParse(request.body);

      if (!validationResult.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: validationResult.error.flatten(),
          },
        });
      }

      const { claims, timeout } = validationResult.data;

      try {
        // TODO: Implement actual verification via MCP
        // For now, return mock results

        const results: ClaimVerificationResult[] = claims.map((claim) => ({
          id: claim.id,
          verified: true,
          confidence: 0.95,
          sourceMatch: 'Li et al. 2023',
          lss: 0,
          severity: 'VERIFIED',
          penalty: 0,
        }));

        return reply.send({
          success: true,
          data: { results },
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
        request.log.error({ err }, 'Claim verification failed');

        return reply.status(500).send({
          success: false,
          error: {
            code: 'CLAIM_VERIFICATION_ERROR',
            message: err instanceof Error ? err.message : 'Unknown error',
          },
        });
      }
    }
  );

  /**
   * POST /api/v1/verification/batch
   *
   * Batch verification for multiple documents
   */
  server.post(
    '/api/v1/verification/batch',
    {
      preHandler: [authenticate, authorize(['researcher', 'admin'])],
      schema: {
        description: 'Batch verify multiple documents',
        tags: ['verification'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      // TODO: Implement batch verification with queue
      return reply.send({
        success: true,
        data: {
          jobId: 'job_123',
          status: 'queued',
          estimatedDuration: 60000, // 1 minute
        },
      });
    }
  );

  /**
   * GET /api/v1/verification/job/:jobId
   *
   * Get batch verification job status
   */
  server.get<{
    Params: { jobId: string };
  }>(
    '/api/v1/verification/job/:jobId',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Get verification job status',
        tags: ['verification'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const { jobId } = request.params;

      // TODO: Implement actual job status lookup
      return reply.send({
        success: true,
        data: {
          jobId,
          status: 'completed',
          progress: 100,
          results: [],
        },
      });
    }
  );
}
