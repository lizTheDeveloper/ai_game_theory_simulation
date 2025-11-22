/**
 * MARCUS 3.1 Structured Logging with Trace Correlation
 *
 * Pino-based logger with automatic trace ID injection for log-trace correlation.
 * Enables jumping from logs to traces in Grafana/Jaeger.
 *
 * Author: Marcus (Platform Engineer)
 * Date: 2025-11-22
 */

import pino from 'pino';
import { getCurrentTraceId, getCurrentSpanId } from './tracing';

// ============================================================================
// Logger Configuration
// ============================================================================

export interface LoggerConfig {
  level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  prettyPrint: boolean;
  serviceName: string;
}

// ============================================================================
// Logger Factory
// ============================================================================

/**
 * Create Pino logger with trace correlation
 *
 * Automatically injects traceId and spanId into all log messages.
 *
 * @param config Logger configuration
 * @returns Configured Pino logger
 */
export function createLogger(config: LoggerConfig) {
  return pino({
    level: config.level,
    base: {
      service: config.serviceName,
      env: process.env.NODE_ENV || 'development'
    },

    // Inject trace context into every log
    mixin() {
      const traceId = getCurrentTraceId();
      const spanId = getCurrentSpanId();

      return {
        ...(traceId && { traceId }),
        ...(spanId && { spanId })
      };
    },

    // Pretty print in development
    transport: config.prettyPrint
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname'
          }
        }
      : undefined
  });
}

// ============================================================================
// Global Logger Instance
// ============================================================================

export const logger = createLogger({
  level: (process.env.LOG_LEVEL as any) || 'info',
  prettyPrint: process.env.NODE_ENV !== 'production',
  serviceName: process.env.OTEL_SERVICE_NAME || 'marcus-platform'
});
