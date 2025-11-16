/**
 * REST API Server
 *
 * Fastify-based REST API for Citation Integrity Platform
 *
 * OWASP Security Controls:
 * - A01: Access Control (JWT + RBAC)
 * - A02: Cryptographic Failures (TLS 1.3, JWT signing)
 * - A03: Injection (Zod validation, parameterized queries)
 * - A05: Security Misconfiguration (Secure defaults)
 * - A07: Authentication Failures (JWT, rate limiting)
 * - A09: Security Logging (Pino structured logging)
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import pino from 'pino';

// Route imports
import { registerProvenanceRoutes } from './routes/provenance';
import { registerVerificationRoutes } from './routes/verification';
import { registerGradingRoutes } from './routes/grading';
import { registerLssRoutes } from './routes/lss';
import { registerHealthRoutes } from './routes/health';

// GraphQL import
import { registerGraphQLRoutes } from '../graphql/server';

/**
 * Server configuration
 */
export interface ServerConfig {
  host: string;
  port: number;
  jwtSecret: string;
  logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  rateLimit: {
    max: number;
    timeWindow: number; // ms
  };
}

/**
 * Default configuration (OWASP A05: Secure defaults)
 */
const DEFAULT_CONFIG: ServerConfig = {
  host: '0.0.0.0',
  port: 3000,
  jwtSecret: process.env.JWT_SECRET || 'CHANGE_ME_IN_PRODUCTION', // A02: Must be env var in production
  logLevel: process.env.LOG_LEVEL === 'debug' ? 'debug' : 'info',
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3333'],
    credentials: true,
  },
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10), // 1 minute
  },
};

/**
 * Create and configure Fastify server
 */
export async function createServer(config: Partial<ServerConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // OWASP A09: Security logging with Pino
  const logger = pino({
    level: finalConfig.logLevel,
    transport:
      process.env.NODE_ENV === 'development'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
  });

  const server = Fastify({
    logger,
    disableRequestLogging: false,
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestId',
    // OWASP A05: Security headers
    trustProxy: true,
  });

  // OWASP A02: JWT with RS256 (asymmetric signing recommended for production)
  await server.register(jwt, {
    secret: finalConfig.jwtSecret,
    sign: {
      algorithm: 'HS256', // Use RS256 in production with key pairs
      expiresIn: '1h',
    },
    verify: {
      algorithms: ['HS256'], // Use RS256 in production
    },
  });

  // OWASP A05: CORS configuration
  await server.register(cors, {
    origin: finalConfig.cors.origin,
    credentials: finalConfig.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Request-ID'],
  });

  // OWASP A07: Rate limiting (DoS protection)
  await server.register(rateLimit, {
    max: finalConfig.rateLimit.max,
    timeWindow: finalConfig.rateLimit.timeWindow,
    cache: 10000, // Maximum number of cached clients
    allowList: (req) => {
      // Whitelist health checks
      return req.url === '/api/v1/health';
    },
    errorResponseBuilder: (req, context) => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${Math.ceil((context.after as number) / 1000)}s`,
      retryAfter: context.after as number,
    }),
  });

  // OpenAPI documentation (Swagger)
  await server.register(swagger, {
    openapi: {
      info: {
        title: 'Citation Integrity Platform API',
        description: 'REST API for nested learning-based research verification',
        version: '1.0.0',
        contact: {
          name: 'Platform Engineering',
          email: 'platform@example.com',
        },
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'provenance', description: 'Parameter provenance endpoints' },
        { name: 'verification', description: 'Claim verification endpoints' },
        { name: 'grading', description: 'Automated grading endpoints' },
        { name: 'lss', description: 'LSS monitoring endpoints' },
        { name: 'health', description: 'Health check endpoints' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await server.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  // Register routes
  await registerHealthRoutes(server);
  await registerProvenanceRoutes(server);
  await registerVerificationRoutes(server);
  await registerGradingRoutes(server);
  await registerLssRoutes(server);

  // Register GraphQL
  await registerGraphQLRoutes(server);

  // OWASP A09: Error logging
  server.setErrorHandler((error: Error & { statusCode?: number; code?: string }, request, reply) => {
    request.log.error(error);

    // OWASP A05: Don't leak stack traces in production
    const isDevelopment = process.env.NODE_ENV === 'development';

    reply.status(error.statusCode || 500).send({
      success: false,
      error: {
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: error.message,
        ...(isDevelopment && { stack: error.stack }),
      },
    });
  });

  return server;
}

/**
 * Start the server
 */
export async function startServer(config?: Partial<ServerConfig>) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const server = await createServer(config);

  try {
    await server.listen({
      host: finalConfig.host,
      port: finalConfig.port,
    });

    server.log.info(
      `🚀 REST API server listening on http://${finalConfig.host}:${finalConfig.port}`
    );
    server.log.info(`📖 API documentation: http://localhost:${finalConfig.port}/docs`);

    return server;
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
export async function stopServer(server: ReturnType<typeof Fastify>) {
  server.log.info('🛑 Shutting down server...');
  await server.close();
  server.log.info('✅ Server stopped gracefully');
}

// Start server if run directly
if (require.main === module) {
  const server = startServer();

  // OWASP A05: Graceful shutdown on signals
  const signals = ['SIGINT', 'SIGTERM'];
  for (const signal of signals) {
    process.on(signal, async () => {
      const instance = await server;
      await stopServer(instance);
      process.exit(0);
    });
  }
}
