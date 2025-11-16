/**
 * OpenTelemetry Instrumentation
 *
 * Distributed tracing and metrics for Citation Integrity Platform
 *
 * Features:
 * - Automatic HTTP/gRPC instrumentation
 * - Custom spans for business logic
 * - Metrics export to Prometheus
 * - Trace export to Jaeger
 * - Context propagation (W3C Trace Context)
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { trace, context, SpanStatusCode, Span } from '@opentelemetry/api';
import { W3CTraceContextPropagator } from '@opentelemetry/core';

let sdk: NodeSDK | null = null;

export interface TelemetryConfig {
  serviceName: string;
  serviceVersion: string;
  environment: string;
  otlpEndpoint?: string;
  enableTracing?: boolean;
  enableMetrics?: boolean;
}

/**
 * Initialize OpenTelemetry SDK
 */
export function initializeTelemetry(config: TelemetryConfig): void {
  if (sdk) {
    console.warn('⚠️  Telemetry already initialized');
    return;
  }

  const {
    serviceName,
    serviceVersion,
    environment,
    otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318',
    enableTracing = true,
    enableMetrics = true,
  } = config;

  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    [SemanticResourceAttributes.SERVICE_VERSION]: serviceVersion,
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: environment,
  });

  const traceExporter = enableTracing
    ? new OTLPTraceExporter({
        url: `${otlpEndpoint}/v1/traces`,
      })
    : undefined;

  const metricReader = enableMetrics
    ? new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: `${otlpEndpoint}/v1/metrics`,
        }),
        exportIntervalMillis: 60000, // 1 minute
      })
    : undefined;

  sdk = new NodeSDK({
    resource,
    traceExporter,
    metricReader,
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-http': {
          ignoreIncomingPaths: ['/health', '/metrics'],
        },
        '@opentelemetry/instrumentation-pg': {
          enhancedDatabaseReporting: true,
        },
        '@opentelemetry/instrumentation-redis': {
          dbStatementSerializer: (cmdName, cmdArgs) => `${cmdName} ${cmdArgs[0] || ''}`,
        },
      }),
    ],
    textMapPropagator: new W3CTraceContextPropagator(),
  });

  sdk.start();

  console.log('✅ OpenTelemetry initialized', {
    service: serviceName,
    version: serviceVersion,
    environment,
    otlpEndpoint,
    tracing: enableTracing,
    metrics: enableMetrics,
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    await shutdownTelemetry();
    process.exit(0);
  });
}

/**
 * Shutdown telemetry (flush pending data)
 */
export async function shutdownTelemetry(): Promise<void> {
  if (!sdk) return;

  try {
    await sdk.shutdown();
    console.log('✅ Telemetry shut down gracefully');
  } catch (error) {
    console.error('❌ Error shutting down telemetry:', error);
  }
}

/**
 * Get tracer for creating custom spans
 */
export function getTracer(name: string) {
  return trace.getTracer(name);
}

/**
 * Create a span for a function execution
 */
export async function traceFunction<T>(
  spanName: string,
  fn: (span: Span) => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  const tracer = trace.getTracer('citation-platform');
  return tracer.startActiveSpan(spanName, async (span) => {
    try {
      if (attributes) {
        span.setAttributes(attributes);
      }

      const result = await fn(span);

      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error),
      });

      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Add event to current span
 */
export function addSpanEvent(
  name: string,
  attributes?: Record<string, string | number | boolean>
): void {
  const span = trace.getActiveSpan();
  if (span) {
    span.addEvent(name, attributes);
  }
}

/**
 * Set attribute on current span
 */
export function setSpanAttribute(key: string, value: string | number | boolean): void {
  const span = trace.getActiveSpan();
  if (span) {
    span.setAttribute(key, value);
  }
}

/**
 * Trace decorator for methods
 */
export function Trace(spanName?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const traceName = spanName || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      return traceFunction(traceName, async (span) => {
        span.setAttribute('method', propertyKey);
        span.setAttribute('class', target.constructor.name);
        return originalMethod.apply(this, args);
      });
    };

    return descriptor;
  };
}

/**
 * Trace citation verification
 */
export async function traceCitationVerification<T>(
  citationId: string,
  fn: () => Promise<T>
): Promise<T> {
  return traceFunction(
    'citation.verify',
    async (span) => {
      span.setAttribute('citation.id', citationId);
      const result = await fn();
      span.setAttribute('citation.verified', true);
      return result;
    },
    { 'citation.id': citationId }
  );
}

/**
 * Trace database query
 */
export async function traceQuery<T>(
  queryName: string,
  sql: string,
  fn: () => Promise<T>
): Promise<T> {
  return traceFunction(
    `db.query.${queryName}`,
    async (span) => {
      span.setAttribute('db.statement', sql.substring(0, 500));
      span.setAttribute('db.operation', sql.split(' ')[0]);
      return await fn();
    },
    { 'db.system': 'postgresql' }
  );
}

/**
 * Trace cache operation
 */
export async function traceCacheOperation<T>(
  operation: 'get' | 'set' | 'delete',
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  return traceFunction(
    `cache.${operation}`,
    async (span) => {
      span.setAttribute('cache.key', key);
      span.setAttribute('cache.operation', operation);
      const result = await fn();
      span.setAttribute('cache.hit', result !== null);
      return result;
    },
    { 'cache.system': 'redis' }
  );
}

/**
 * Trace LSS calculation
 */
export async function traceLSSCalculation<T>(
  eventType: string,
  fn: () => Promise<T>
): Promise<T> {
  return traceFunction(
    'lss.calculate',
    async (span) => {
      span.setAttribute('lss.event_type', eventType);
      const result = await fn();
      span.setAttribute('lss.calculated', true);
      return result;
    },
    { 'component': 'learning-surprise-signal' }
  );
}

/**
 * Example usage:
 *
 * ```typescript
 * // Initialize in server.ts
 * initializeTelemetry({
 *   serviceName: 'citation-platform-api',
 *   serviceVersion: '1.0.0',
 *   environment: process.env.NODE_ENV || 'development',
 * });
 *
 * // Trace a function
 * const result = await traceFunction('processRequest', async (span) => {
 *   span.setAttribute('user.id', userId);
 *   return processRequest(data);
 * });
 *
 * // Trace a method
 * class MyService {
 *   @Trace('MyService.doWork')
 *   async doWork() {
 *     // Work here
 *   }
 * }
 *
 * // Trace citation verification
 * const verified = await traceCitationVerification(citationId, async () => {
 *   return await verifyWithMCP(citation);
 * });
 * ```
 */
