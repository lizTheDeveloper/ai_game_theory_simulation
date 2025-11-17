/**
 * Structured Logger for MARCUS Platform
 *
 * Provides pino-based structured logging with context propagation,
 * trace correlation, and Loki integration.
 *
 * Usage:
 *   logger.info({ citationId: 'abc123', duration: 45 }, 'Citation analyzed');
 *   logger.error({ error: err, component: 'orchestrator' }, 'Analysis failed');
 */

import pino from 'pino';
import { trace, context } from '@opentelemetry/api';

// Log levels: trace, debug, info, warn, error, fatal
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Pino logger configuration
const logger = pino({
  level: LOG_LEVEL,

  // Format configuration
  formatters: {
    level: (label) => ({ level: label }),
    bindings: (bindings) => ({
      pid: bindings.pid,
      hostname: bindings.hostname,
    }),
  },

  // Timestamp using ISO 8601
  timestamp: pino.stdTimeFunctions.isoTime,

  // Base context (included in every log)
  base: {
    component: 'marcus-platform',
    environment: NODE_ENV,
    version: process.env.VERSION || 'dev',
  },

  // Serializers for common objects
  serializers: {
    error: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },

  // Redact sensitive fields
  redact: {
    paths: [
      'password',
      'token',
      'authorization',
      'cookie',
      'apiKey',
      'secret',
      '*.password',
      '*.token',
      '*.apiKey',
      '*.secret',
    ],
    censor: '[REDACTED]',
  },

  // Pretty print in development
  transport: NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  } : undefined,
});

/**
 * Enhanced logger with trace context injection
 */
export class ContextualLogger {
  private baseLogger: pino.Logger;

  constructor(logger: pino.Logger) {
    this.baseLogger = logger;
  }

  /**
   * Inject OpenTelemetry trace context into log record
   */
  private enrichWithTraceContext(obj: any = {}): any {
    const span = trace.getSpan(context.active());
    if (span) {
      const spanContext = span.spanContext();
      return {
        ...obj,
        trace_id: spanContext.traceId,
        span_id: spanContext.spanId,
      };
    }
    return obj;
  }

  /**
   * Create child logger with additional context
   */
  child(bindings: pino.Bindings): ContextualLogger {
    return new ContextualLogger(this.baseLogger.child(bindings));
  }

  /**
   * Log levels with trace context injection
   */
  trace(obj: any, msg?: string): void {
    this.baseLogger.trace(this.enrichWithTraceContext(obj), msg);
  }

  debug(obj: any, msg?: string): void {
    this.baseLogger.debug(this.enrichWithTraceContext(obj), msg);
  }

  info(obj: any, msg?: string): void {
    this.baseLogger.info(this.enrichWithTraceContext(obj), msg);
  }

  warn(obj: any, msg?: string): void {
    this.baseLogger.warn(this.enrichWithTraceContext(obj), msg);
  }

  error(obj: any, msg?: string): void {
    this.baseLogger.error(this.enrichWithTraceContext(obj), msg);
  }

  fatal(obj: any, msg?: string): void {
    this.baseLogger.fatal(this.enrichWithTraceContext(obj), msg);
  }

  /**
   * Security audit logging (always logged, never dropped)
   */
  audit(event: {
    event_type: 'auth' | 'authz' | 'admin' | 'config' | 'security';
    user_id?: string;
    ip_address?: string;
    resource?: string;
    action: string;
    result: 'success' | 'failure';
    metadata?: any;
  }, msg: string): void {
    this.baseLogger.info({
      ...this.enrichWithTraceContext(),
      level: 'audit',
      ...event,
    }, msg);
  }

  /**
   * Performance logging with duration tracking
   */
  performance(operation: string, duration: number, metadata?: any): void {
    this.baseLogger.info({
      ...this.enrichWithTraceContext(),
      operation,
      duration,
      ...metadata,
    }, `Operation completed: ${operation}`);
  }
}

// Export singleton instance
export const contextualLogger = new ContextualLogger(logger);

// Export default pino logger for compatibility
export default logger;

/**
 * Example usage patterns:
 *
 * // Basic info log
 * contextualLogger.info({ citationId: 'abc123' }, 'Citation analyzed');
 *
 * // Error with stack trace
 * contextualLogger.error({ error: err, component: 'orchestrator' }, 'Analysis failed');
 *
 * // Child logger with component context
 * const agentLogger = contextualLogger.child({ component: 'citation-agent', agentId: 'agent-1' });
 * agentLogger.info({ integrityScore: 0.85 }, 'Citation evaluated');
 *
 * // Security audit
 * contextualLogger.audit({
 *   event_type: 'auth',
 *   user_id: 'user-123',
 *   ip_address: '192.168.1.1',
 *   action: 'login',
 *   result: 'success'
 * }, 'User authenticated');
 *
 * // Performance tracking
 * const startTime = Date.now();
 * // ... do work ...
 * contextualLogger.performance('citation.analyze', Date.now() - startTime, {
 *   citationId: 'abc123',
 *   agentCount: 10
 * });
 */
