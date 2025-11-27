/**
 * MARCUS 3.1 Distributed Tracing
 *
 * OpenTelemetry instrumentation for end-to-end request tracing.
 * Exports traces to Jaeger for visualization and debugging.
 *
 * Features:
 * - Automatic instrumentation (HTTP, Express, PostgreSQL, Redis)
 * - Manual spans for agent lifecycle
 * - Trace context propagation to Python agents
 * - Sampling (100% dev, 10% production, always sample errors)
 *
 * Author: Marcus (Platform Engineer)
 * Date: 2025-11-22
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { AlwaysOnSampler, TraceIdRatioBasedSampler, ParentBasedSampler } from '@opentelemetry/sdk-trace-base';
import * as api from '@opentelemetry/api';

// ============================================================================
// Tracing Configuration
// ============================================================================

export interface TracingConfig {
  // Service identification
  serviceName: string;
  serviceVersion: string;
  environment: 'development' | 'staging' | 'production';

  // Jaeger configuration
  jaegerEndpoint: string;
  jaegerAgentHost?: string;
  jaegerAgentPort?: number;

  // Sampling configuration
  samplingRate: number; // 0.0 to 1.0 (1.0 = 100%)
  alwaysSampleErrors: boolean;

  // Feature flags
  enableAutoInstrumentation: boolean;
  enableConsoleExporter: boolean; // For debugging
}

// ============================================================================
// Default Configuration
// ============================================================================

export function getDefaultTracingConfig(): TracingConfig {
  const env = (process.env.NODE_ENV || 'development') as 'development' | 'staging' | 'production';

  return {
    serviceName: process.env.OTEL_SERVICE_NAME || 'marcus-platform',
    serviceVersion: process.env.SERVICE_VERSION || '3.1.0',
    environment: env,

    // Jaeger endpoint (HTTP or UDP)
    jaegerEndpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
    jaegerAgentHost: process.env.JAEGER_AGENT_HOST || 'localhost',
    jaegerAgentPort: parseInt(process.env.JAEGER_AGENT_PORT || '6832', 10),

    // Sampling: 100% dev, 10% prod, always sample errors
    samplingRate: env === 'production' ? 0.1 : 1.0,
    alwaysSampleErrors: true,

    // Auto-instrumentation enabled by default
    enableAutoInstrumentation: process.env.OTEL_AUTO_INSTRUMENTATION !== 'false',
    enableConsoleExporter: env === 'development'
  };
}

// ============================================================================
// SDK Initialization
// ============================================================================

let sdk: NodeSDK | undefined;

/**
 * Initialize OpenTelemetry SDK with Jaeger exporter
 *
 * Must be called BEFORE any instrumented libraries are imported.
 * Typically called at the very start of the application.
 *
 * @param config Tracing configuration
 */
export function initializeTracing(config: TracingConfig = getDefaultTracingConfig()): void {
  if (sdk) {
    console.warn('⚠️ Tracing already initialized, skipping...');
    return;
  }

  console.log('🔍 Initializing distributed tracing...');
  console.log(`   Service: ${config.serviceName}`);
  console.log(`   Environment: ${config.environment}`);
  console.log(`   Sampling: ${config.samplingRate * 100}%`);
  console.log(`   Jaeger: ${config.jaegerEndpoint}`);

  // Create Jaeger exporter
  const jaegerExporter = new JaegerExporter({
    endpoint: config.jaegerEndpoint,
    // Alternative: UDP agent (comment out endpoint above)
    // host: config.jaegerAgentHost,
    // port: config.jaegerAgentPort,
  });

  // Create resource (service metadata)
  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: config.serviceName,
    [SemanticResourceAttributes.SERVICE_VERSION]: config.serviceVersion,
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: config.environment,
  });

  // Create sampler
  let sampler: api.Sampler;
  if (config.samplingRate >= 1.0) {
    // Always sample (dev/staging)
    sampler = new AlwaysOnSampler();
  } else {
    // Rate-based sampling with parent context (production)
    sampler = new ParentBasedSampler({
      root: new TraceIdRatioBasedSampler(config.samplingRate)
    });
  }

  // Create SDK
  sdk = new NodeSDK({
    resource,
    traceExporter: jaegerExporter,
    spanProcessor: new BatchSpanProcessor(jaegerExporter, {
      maxQueueSize: 2048,
      maxExportBatchSize: 512,
      scheduledDelayMillis: 5000, // Export every 5 seconds
    }),
    sampler,
    instrumentations: config.enableAutoInstrumentation
      ? [
          getNodeAutoInstrumentations({
            // Automatic instrumentation for common libraries
            '@opentelemetry/instrumentation-http': {
              enabled: true,
              ignoreIncomingPaths: ['/health', '/ready', '/live'], // Don't trace health checks
            },
            '@opentelemetry/instrumentation-express': {
              enabled: true,
            },
            '@opentelemetry/instrumentation-pg': {
              enabled: true,
              enhancedDatabaseReporting: true, // Include SQL queries (sanitized)
            },
            '@opentelemetry/instrumentation-redis-4': {
              enabled: true,
            },
          }),
        ]
      : [],
  });

  // Start SDK
  sdk.start();

  console.log('✅ Distributed tracing initialized');

  // Graceful shutdown on process exit
  process.on('SIGTERM', async () => {
    console.log('🔍 Shutting down tracing...');
    await sdk?.shutdown();
    console.log('✅ Tracing shutdown complete');
  });
}

// ============================================================================
// Manual Instrumentation Helpers
// ============================================================================

/**
 * Get active tracer for manual instrumentation
 *
 * @param name Tracer name (typically module name)
 * @returns Tracer instance
 */
export function getTracer(name: string = 'marcus-platform'): api.Tracer {
  return api.trace.getTracer(name);
}

/**
 * Create a new span and execute function within span context
 *
 * @param name Span name
 * @param fn Function to execute within span
 * @param attributes Optional span attributes
 * @returns Result of function
 */
export async function withSpan<T>(
  name: string,
  fn: (span: api.Span) => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  const tracer = getTracer();

  return tracer.startActiveSpan(name, async (span) => {
    try {
      // Set attributes
      if (attributes) {
        for (const [key, value] of Object.entries(attributes)) {
          span.setAttribute(key, value);
        }
      }

      // Execute function
      const result = await fn(span);

      // Mark as successful
      span.setStatus({ code: api.SpanStatusCode.OK });

      return result;
    } catch (err) {
      // Record error
      span.recordException(err as Error);
      span.setStatus({
        code: api.SpanStatusCode.ERROR,
        message: (err as Error).message
      });

      throw err;
    } finally {
      span.end();
    }
  });
}

/**
 * Get current trace ID (for log correlation)
 *
 * @returns Current trace ID or undefined
 */
export function getCurrentTraceId(): string | undefined {
  const span = api.trace.getActiveSpan();
  if (!span) {
    return undefined;
  }

  const spanContext = span.spanContext();
  return spanContext.traceId;
}

/**
 * Get current span ID (for log correlation)
 *
 * @returns Current span ID or undefined
 */
export function getCurrentSpanId(): string | undefined {
  const span = api.trace.getActiveSpan();
  if (!span) {
    return undefined;
  }

  const spanContext = span.spanContext();
  return spanContext.spanId;
}

/**
 * Inject trace context into carrier for propagation
 *
 * Used to propagate trace context to Python agents via environment variables.
 *
 * @returns Object with TRACEPARENT header
 */
export function injectTraceContext(): { traceparent?: string } {
  const span = api.trace.getActiveSpan();
  if (!span) {
    return {};
  }

  const spanContext = span.spanContext();

  // W3C Trace Context format: version-traceId-spanId-traceFlags
  const traceparent = `00-${spanContext.traceId}-${spanContext.spanId}-${spanContext.traceFlags.toString(16).padStart(2, '0')}`;

  return { traceparent };
}

/**
 * Extract trace context from carrier
 *
 * Used to continue trace from upstream service.
 *
 * @param traceparent W3C traceparent header
 */
export function extractTraceContext(traceparent: string): void {
  // Parse traceparent: 00-traceId-spanId-traceFlags
  const parts = traceparent.split('-');
  if (parts.length !== 4) {
    console.warn('⚠️ Invalid traceparent format:', traceparent);
    return;
  }

  const [version, traceId, spanId, traceFlags] = parts;

  // Set as remote context (creates child span)
  const spanContext: api.SpanContext = {
    traceId,
    spanId,
    traceFlags: parseInt(traceFlags, 16),
    isRemote: true
  };

  const context = api.trace.setSpanContext(api.context.active(), api.trace.wrapSpanContext(spanContext));
  api.context.with(context, () => {
    // Context is now active
  });
}

// ============================================================================
// Performance Monitoring
// ============================================================================

/**
 * Record span event (useful for marking milestones within a span)
 *
 * @param name Event name
 * @param attributes Event attributes
 */
export function recordEvent(name: string, attributes?: Record<string, any>): void {
  const span = api.trace.getActiveSpan();
  if (span) {
    span.addEvent(name, attributes);
  }
}

/**
 * Set span attribute (adds metadata to current span)
 *
 * @param key Attribute key
 * @param value Attribute value
 */
export function setAttribute(key: string, value: string | number | boolean): void {
  const span = api.trace.getActiveSpan();
  if (span) {
    span.setAttribute(key, value);
  }
}
