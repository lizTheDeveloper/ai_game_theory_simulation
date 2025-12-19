/**
 * OpenTelemetry Distributed Tracing Setup
 *
 * Provides trace instrumentation for the MARCUS platform with automatic
 * context propagation, span creation, and Jaeger integration.
 *
 * Usage:
 *   import { tracer } from '@/platform/tracing/tracer';
 *
 *   const span = tracer.startSpan('operation.name');
 *   try {
 *     // ... work ...
 *     span.setAttribute('custom.attribute', 'value');
 *   } finally {
 *     span.end();
 *   }
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { BatchSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { trace, SpanStatusCode, context, propagation } from '@opentelemetry/api';
import { W3CTraceContextPropagator } from '@opentelemetry/core';

// Environment configuration
const SERVICE_NAME = process.env.SERVICE_NAME || 'marcus-platform';
const SERVICE_VERSION = process.env.VERSION || 'dev';
const JAEGER_ENDPOINT = process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize OpenTelemetry SDK
const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: SERVICE_NAME,
    [SemanticResourceAttributes.SERVICE_VERSION]: SERVICE_VERSION,
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: NODE_ENV,
  }),

  // Jaeger exporter for distributed tracing
  traceExporter: new JaegerExporter({
    endpoint: JAEGER_ENDPOINT,
    // Agent configuration (if using Jaeger agent instead of collector)
    // host: 'localhost',
    // port: 6832,
  }),

  // Automatic instrumentation for common libraries
  instrumentations: [
    getNodeAutoInstrumentations({
      // Disable filesystem instrumentation (too noisy)
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },

      // HTTP instrumentation with custom config
      '@opentelemetry/instrumentation-http': {
        enabled: true,
        // Ignore health/metrics endpoints
        ignoreIncomingPaths: ['/health', '/metrics', '/favicon.ico'],
        // Add custom attributes to HTTP spans
        requestHook: (span, request) => {
          span.setAttribute('http.user_agent', request.headers['user-agent'] || 'unknown');
        },
        responseHook: (span, response) => {
          span.setAttribute('http.status_code', response.statusCode);
        },
      },

      // PostgreSQL instrumentation
      '@opentelemetry/instrumentation-pg': {
        enabled: true,
        // Capture SQL queries (careful: may contain sensitive data)
        enhancedDatabaseReporting: true,
      },

      // Redis instrumentation
      '@opentelemetry/instrumentation-redis': {
        enabled: true,
      },

      // Express instrumentation
      '@opentelemetry/instrumentation-express': {
        enabled: true,
      },
    }),
  ],

  // Add console exporter in development for debugging
  spanProcessor: NODE_ENV === 'development'
    ? new BatchSpanProcessor(new ConsoleSpanExporter())
    : undefined,
});

// Start the SDK
sdk.start();

// Configure trace context propagation (W3C Trace Context standard)
propagation.setGlobalPropagator(new W3CTraceContextPropagator());

// Graceful shutdown on process termination
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('🔍 Tracing terminated'))
    .catch((error) => console.error('❌ Error terminating tracing', error))
    .finally(() => process.exit(0));
});

/**
 * Get the configured tracer instance
 */
export const tracer = trace.getTracer(SERVICE_NAME, SERVICE_VERSION);

/**
 * Helper: Create and execute a traced operation
 *
 * @example
 * const result = await tracedOperation('citation.analyze', async (span) => {
 *   span.setAttribute('citation.id', citationId);
 *   return await analyzeCitation(citationId);
 * });
 */
export async function tracedOperation<T>(
  operationName: string,
  fn: (span: ReturnType<typeof tracer.startSpan>) => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  const span = tracer.startSpan(operationName, {
    attributes: attributes || {},
  });

  try {
    const result = await context.with(trace.setSpan(context.active(), span), () => fn(span));
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    span.recordException(error as Error);
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: (error as Error).message,
    });
    throw error;
  } finally {
    span.end();
  }
}

/**
 * Helper: Add custom span to current trace
 *
 * @example
 * await addSpan('database.query', async (span) => {
 *   span.setAttribute('query.type', 'SELECT');
 *   return await db.query(sql);
 * });
 */
export async function addSpan<T>(
  spanName: string,
  fn: (span: ReturnType<typeof tracer.startSpan>) => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  const span = tracer.startSpan(spanName, {
    attributes: attributes || {},
  });

  try {
    const result = await context.with(trace.setSpan(context.active(), span), () => fn(span));
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    span.recordException(error as Error);
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: (error as Error).message,
    });
    throw error;
  } finally {
    span.end();
  }
}

/**
 * Helper: Get current trace and span IDs for log correlation
 *
 * @example
 * const { traceId, spanId } = getTraceContext();
 * logger.info({ traceId, spanId }, 'Operation completed');
 */
export function getTraceContext(): { traceId: string; spanId: string } | null {
  const span = trace.getSpan(context.active());
  if (!span) return null;

  const spanContext = span.spanContext();
  return {
    traceId: spanContext.traceId,
    spanId: spanContext.spanId,
  };
}

/**
 * Helper: Add event to current span
 *
 * @example
 * addSpanEvent('cache.hit', { key: 'citation:abc123' });
 */
export function addSpanEvent(name: string, attributes?: Record<string, string | number | boolean>): void {
  const span = trace.getSpan(context.active());
  if (span) {
    span.addEvent(name, attributes);
  }
}

/**
 * Helper: Set attribute on current span
 *
 * @example
 * setSpanAttribute('agent.id', 'agent-1');
 */
export function setSpanAttribute(key: string, value: string | number | boolean): void {
  const span = trace.getSpan(context.active());
  if (span) {
    span.setAttribute(key, value);
  }
}

// Export SDK for manual shutdown if needed
export { sdk };

/**
 * Example usage patterns:
 *
 * // 1. Traced operation (recommended)
 * const result = await tracedOperation('citation.analyze', async (span) => {
 *   span.setAttribute('citation.id', citationId);
 *   span.setAttribute('agent.count', 10);
 *
 *   const analysis = await orchestrator.analyze(citation);
 *   span.setAttribute('citation.behavior', analysis.behavior);
 *   span.setAttribute('citation.integrity', analysis.integrity);
 *
 *   return analysis;
 * });
 *
 * // 2. Manual span creation
 * const span = tracer.startSpan('database.save');
 * try {
 *   span.setAttribute('table', 'citations');
 *   await db.save(data);
 *   span.setStatus({ code: SpanStatusCode.OK });
 * } catch (error) {
 *   span.recordException(error);
 *   span.setStatus({ code: SpanStatusCode.ERROR });
 *   throw error;
 * } finally {
 *   span.end();
 * }
 *
 * // 3. Nested spans
 * await tracedOperation('citation.workflow', async (parentSpan) => {
 *   await addSpan('validate.input', async (span) => {
 *     // validation logic
 *   });
 *
 *   await addSpan('orchestrator.distribute', async (span) => {
 *     // distribution logic
 *   });
 *
 *   await addSpan('aggregator.consensus', async (span) => {
 *     // consensus logic
 *   });
 * });
 *
 * // 4. Adding events to spans
 * addSpanEvent('cache.miss', { key: 'citation:abc123' });
 * addSpanEvent('retry.attempt', { attempt: 2, maxRetries: 3 });
 *
 * // 5. Getting trace context for logs
 * const traceContext = getTraceContext();
 * if (traceContext) {
 *   logger.info({
 *     traceId: traceContext.traceId,
 *     spanId: traceContext.spanId
 *   }, 'Operation completed');
 * }
 */
