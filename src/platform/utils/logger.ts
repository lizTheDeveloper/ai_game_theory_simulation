/**
 * Structured Logging with Winston
 *
 * Production-grade logging with:
 * - Correlation IDs for request tracking
 * - Multiple transports (console, file, syslog)
 * - Log levels (error, warn, info, debug)
 * - JSON formatting for machine parsing
 * - Automatic metadata (timestamp, hostname, PID)
 *
 * Usage:
 * ```typescript
 * import { logger, setCorrelationId } from './utils/logger';
 *
 * // Set correlation ID for request tracking
 * setCorrelationId('req-12345');
 *
 * logger.info('User logged in', { userId: 123, email: 'user@example.com' });
 * logger.error('Database connection failed', { error: err.message });
 * ```
 *
 * @module utils/logger
 * @author Marcus (Platform Engineer)
 */

import winston from 'winston';
import * as os from 'os';
import * as path from 'path';

/**
 * Correlation ID storage (AsyncLocalStorage would be better in Node 14+)
 */
const correlationStore = new Map<string, string>();
let currentCorrelationId: string | null = null;

/**
 * Set correlation ID for current execution context
 */
export function setCorrelationId(id: string): void {
  currentCorrelationId = id;
}

/**
 * Get current correlation ID
 */
export function getCorrelationId(): string | null {
  return currentCorrelationId;
}

/**
 * Generate correlation ID
 */
export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Custom log format with correlation ID
 */
const correlationFormat = winston.format((info) => {
  if (currentCorrelationId) {
    info.correlationId = currentCorrelationId;
  }
  return info;
});

/**
 * Winston logger configuration
 */
const logLevel = process.env.LOG_LEVEL || 'info';
const logDir = process.env.LOG_DIR || 'logs';

// Create custom formats
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  correlationFormat(),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, correlationId, ...metadata }) => {
    let msg = `${timestamp} [${level}]`;

    if (correlationId) {
      msg += ` [CID:${correlationId}]`;
    }

    msg += `: ${message}`;

    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }

    return msg;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  correlationFormat(),
  winston.format.json()
);

// Create transports
const transports: winston.transport[] = [
  // Console transport (for development and systemd journal)
  new winston.transports.Console({
    format: consoleFormat,
    level: logLevel,
  }),

  // File transport for all logs
  new winston.transports.File({
    filename: path.join(logDir, 'marcus-platform.log'),
    format: fileFormat,
    level: logLevel,
    maxsize: 10 * 1024 * 1024,  // 10MB
    maxFiles: 10,
    tailable: true,
  }),

  // File transport for errors only
  new winston.transports.File({
    filename: path.join(logDir, 'marcus-platform-error.log'),
    format: fileFormat,
    level: 'error',
    maxsize: 10 * 1024 * 1024,  // 10MB
    maxFiles: 10,
    tailable: true,
  }),
];

/**
 * Winston logger instance
 */
export const logger = winston.createLogger({
  level: logLevel,
  defaultMeta: {
    service: 'marcus-platform',
    hostname: os.hostname(),
    pid: process.pid,
    env: process.env.NODE_ENV || 'development',
  },
  transports,
  exitOnError: false,
});

/**
 * Create a child logger with additional default metadata
 */
export function createChildLogger(metadata: Record<string, any>): winston.Logger {
  return logger.child(metadata);
}

/**
 * Log levels:
 * - error: Error messages that require attention
 * - warn: Warning messages about potential issues
 * - info: Informational messages about normal operation
 * - debug: Detailed debugging information
 */

/**
 * Middleware to add correlation ID to Express requests
 *
 * Usage:
 * ```typescript
 * import { correlationMiddleware } from './utils/logger';
 * app.use(correlationMiddleware);
 * ```
 */
export function correlationMiddleware(req: any, res: any, next: Function): void {
  // Try to get correlation ID from header, otherwise generate new one
  const correlationId = req.headers['x-correlation-id'] || generateCorrelationId();

  // Store correlation ID
  setCorrelationId(correlationId);

  // Add to response headers
  res.setHeader('X-Correlation-ID', correlationId);

  // Add to request object
  req.correlationId = correlationId;

  // Clear correlation ID when response finishes
  res.on('finish', () => {
    setCorrelationId('');
  });

  next();
}

/**
 * Express request logger middleware
 *
 * Usage:
 * ```typescript
 * import { requestLogger } from './utils/logger';
 * app.use(requestLogger);
 * ```
 */
export function requestLogger(req: any, res: any, next: Function): void {
  const startTime = Date.now();

  // Log request
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
    });
  });

  next();
}

/**
 * Log uncaught exceptions and unhandled rejections
 */
export function setupExceptionHandlers(): void {
  process.on('uncaughtException', (err: Error) => {
    logger.error('Uncaught Exception', {
      error: err.message,
      stack: err.stack,
    });

    // Give logger time to flush before exiting
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Promise Rejection', {
      reason: reason?.message || reason,
      stack: reason?.stack,
    });
  });

  // Log when process is terminating
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
  });
}

/**
 * Performance logger for timing operations
 */
export class PerformanceTimer {
  private startTime: number;
  private name: string;

  constructor(name: string) {
    this.name = name;
    this.startTime = Date.now();
  }

  end(metadata?: Record<string, any>): void {
    const duration = Date.now() - this.startTime;

    logger.info(`Performance: ${this.name}`, {
      ...metadata,
      duration,
      durationMs: duration,
    });
  }
}

/**
 * Create a performance timer
 */
export function startTimer(name: string): PerformanceTimer {
  return new PerformanceTimer(name);
}

// Export winston instance for advanced usage
export { winston };
