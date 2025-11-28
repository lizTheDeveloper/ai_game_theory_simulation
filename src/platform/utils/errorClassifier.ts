/**
 * MARCUS 3.1 - Error Classification System (M1)
 *
 * Classifies errors into categories to determine appropriate handling strategy:
 * - TRANSIENT: Retryable errors (network, timeout, 503)
 * - PERMANENT: Non-retryable errors (validation, 404, auth)
 * - CIRCUIT_BREAKER: Errors that should trigger circuit breaker
 * - FALLBACK: Errors that should use fallback/cached data
 *
 * Critical for intelligent error recovery - don't retry permanent failures.
 *
 * Author: Marcus (Platform Engineer)
 * Date: 2025-11-22
 */

import { errorsByType } from '../monitoring/metricsEndpoint';

// ============================================================================
// Error Categories
// ============================================================================

export enum ErrorCategory {
  TRANSIENT = 'transient',           // Retry with backoff
  PERMANENT = 'permanent',           // Fail immediately
  CIRCUIT_BREAKER = 'circuit_breaker', // Trigger circuit breaker
  FALLBACK = 'fallback'              // Use fallback/cache
}

export enum ErrorSeverity {
  LOW = 'low',          // Recoverable, informational
  MEDIUM = 'medium',    // Degraded service, warrants investigation
  HIGH = 'high',        // Critical path failure, requires immediate attention
  CRITICAL = 'critical'  // System integrity at risk
}

export interface ErrorClassification {
  category: ErrorCategory;
  severity: ErrorSeverity;
  retryable: boolean;
  suggestedAction: string;
  errorType: string;
  component: string;
}

// ============================================================================
// Error Type Definitions
// ============================================================================

interface ErrorPattern {
  category: ErrorCategory;
  severity: ErrorSeverity;
  suggestedAction: string;
  errorType: string;
}

// Network and connection errors (transient)
const NETWORK_ERRORS: Record<string, ErrorPattern> = {
  'ECONNREFUSED': {
    category: ErrorCategory.TRANSIENT,
    severity: ErrorSeverity.MEDIUM,
    suggestedAction: 'Retry with exponential backoff',
    errorType: 'network_connection_refused'
  },
  'ETIMEDOUT': {
    category: ErrorCategory.TRANSIENT,
    severity: ErrorSeverity.MEDIUM,
    suggestedAction: 'Retry with exponential backoff',
    errorType: 'network_timeout'
  },
  'ENOTFOUND': {
    category: ErrorCategory.TRANSIENT,
    severity: ErrorSeverity.HIGH,
    suggestedAction: 'Check DNS configuration, retry after delay',
    errorType: 'network_dns_failure'
  },
  'ECONNRESET': {
    category: ErrorCategory.TRANSIENT,
    severity: ErrorSeverity.MEDIUM,
    suggestedAction: 'Retry with exponential backoff',
    errorType: 'network_connection_reset'
  },
  'ENETUNREACH': {
    category: ErrorCategory.CIRCUIT_BREAKER,
    severity: ErrorSeverity.HIGH,
    suggestedAction: 'Open circuit breaker, network unreachable',
    errorType: 'network_unreachable'
  }
};

// Database errors
const DATABASE_ERRORS: Record<string, ErrorPattern> = {
  '57P03': { // PostgreSQL: cannot connect now
    category: ErrorCategory.TRANSIENT,
    severity: ErrorSeverity.HIGH,
    suggestedAction: 'Retry after short delay (database restarting)',
    errorType: 'database_cannot_connect'
  },
  '53300': { // PostgreSQL: too many connections
    category: ErrorCategory.CIRCUIT_BREAKER,
    severity: ErrorSeverity.CRITICAL,
    suggestedAction: 'Open circuit breaker, increase connection pool',
    errorType: 'database_connection_pool_exhausted'
  },
  '08006': { // PostgreSQL: connection failure
    category: ErrorCategory.TRANSIENT,
    severity: ErrorSeverity.HIGH,
    suggestedAction: 'Retry with exponential backoff',
    errorType: 'database_connection_failure'
  },
  '40001': { // PostgreSQL: serialization failure
    category: ErrorCategory.TRANSIENT,
    severity: ErrorSeverity.MEDIUM,
    suggestedAction: 'Retry transaction (optimistic locking conflict)',
    errorType: 'database_serialization_failure'
  },
  '23505': { // PostgreSQL: unique constraint violation
    category: ErrorCategory.PERMANENT,
    severity: ErrorSeverity.LOW,
    suggestedAction: 'Do not retry - duplicate key',
    errorType: 'database_unique_violation'
  },
  '23503': { // PostgreSQL: foreign key violation
    category: ErrorCategory.PERMANENT,
    severity: ErrorSeverity.MEDIUM,
    suggestedAction: 'Do not retry - invalid reference',
    errorType: 'database_foreign_key_violation'
  }
};

// Redis errors
const REDIS_ERRORS: Record<string, ErrorPattern> = {
  'MaxRetriesPerRequestError': {
    category: ErrorCategory.CIRCUIT_BREAKER,
    severity: ErrorSeverity.HIGH,
    suggestedAction: 'Open circuit breaker, Redis overloaded',
    errorType: 'redis_max_retries'
  },
  'READONLY': {
    category: ErrorCategory.FALLBACK,
    severity: ErrorSeverity.HIGH,
    suggestedAction: 'Use fallback (Redis in read-only mode during failover)',
    errorType: 'redis_readonly'
  },
  'LOADING': {
    category: ErrorCategory.TRANSIENT,
    severity: ErrorSeverity.MEDIUM,
    suggestedAction: 'Retry after delay (Redis loading data)',
    errorType: 'redis_loading'
  }
};

// ============================================================================
// Error Classifier
// ============================================================================

export class ErrorClassifier {
  /**
   * Classify error and determine handling strategy.
   *
   * @param error Error object to classify
   * @param component Component that generated error
   * @returns Error classification with suggested action
   */
  static classify(error: any, component: string = 'unknown'): ErrorClassification {
    // Default classification
    let classification: ErrorClassification = {
      category: ErrorCategory.PERMANENT,
      severity: ErrorSeverity.MEDIUM,
      retryable: false,
      suggestedAction: 'Log error and fail',
      errorType: 'unknown',
      component
    };

    // Classify by error code
    if (error.code) {
      const pattern = this.classifyByCode(error.code);
      if (pattern) {
        classification = {
          ...pattern,
          retryable: pattern.category === ErrorCategory.TRANSIENT,
          component
        };
      }
    }

    // Classify by HTTP status code
    if (error.statusCode || error.status) {
      const statusCode = error.statusCode || error.status;
      const pattern = this.classifyByStatusCode(statusCode);
      if (pattern) {
        classification = {
          ...pattern,
          retryable: pattern.category === ErrorCategory.TRANSIENT,
          component
        };
      }
    }

    // Classify by error message
    if (error.message) {
      const pattern = this.classifyByMessage(error.message);
      if (pattern) {
        classification = {
          ...pattern,
          retryable: pattern.category === ErrorCategory.TRANSIENT,
          component
        };
      }
    }

    // Record metrics
    errorsByType.inc({
      error_type: classification.errorType,
      component: classification.component,
      severity: classification.severity
    });

    return classification;
  }

  /**
   * Classify by error code (network, database, Redis).
   */
  private static classifyByCode(code: string): ErrorPattern | null {
    // Network errors
    if (NETWORK_ERRORS[code]) {
      return NETWORK_ERRORS[code];
    }

    // Database errors
    if (DATABASE_ERRORS[code]) {
      return DATABASE_ERRORS[code];
    }

    // Redis errors
    if (REDIS_ERRORS[code]) {
      return REDIS_ERRORS[code];
    }

    return null;
  }

  /**
   * Classify by HTTP status code.
   */
  private static classifyByStatusCode(statusCode: number): ErrorPattern | null {
    // 4xx Client Errors - Permanent
    if (statusCode >= 400 && statusCode < 500) {
      if (statusCode === 401) {
        return {
          category: ErrorCategory.PERMANENT,
          severity: ErrorSeverity.MEDIUM,
          suggestedAction: 'Refresh authentication token',
          errorType: 'auth_unauthorized'
        };
      }
      if (statusCode === 403) {
        return {
          category: ErrorCategory.PERMANENT,
          severity: ErrorSeverity.MEDIUM,
          suggestedAction: 'Check permissions',
          errorType: 'auth_forbidden'
        };
      }
      if (statusCode === 404) {
        return {
          category: ErrorCategory.PERMANENT,
          severity: ErrorSeverity.LOW,
          suggestedAction: 'Resource not found - do not retry',
          errorType: 'resource_not_found'
        };
      }
      if (statusCode === 422) {
        return {
          category: ErrorCategory.PERMANENT,
          severity: ErrorSeverity.LOW,
          suggestedAction: 'Validation error - fix input data',
          errorType: 'validation_error'
        };
      }
      if (statusCode === 429) {
        return {
          category: ErrorCategory.TRANSIENT,
          severity: ErrorSeverity.MEDIUM,
          suggestedAction: 'Retry after rate limit reset',
          errorType: 'rate_limit_exceeded'
        };
      }

      // Generic 4xx
      return {
        category: ErrorCategory.PERMANENT,
        severity: ErrorSeverity.LOW,
        suggestedAction: 'Client error - do not retry',
        errorType: 'client_error'
      };
    }

    // 5xx Server Errors - Transient or Circuit Breaker
    if (statusCode >= 500 && statusCode < 600) {
      if (statusCode === 503) {
        return {
          category: ErrorCategory.CIRCUIT_BREAKER,
          severity: ErrorSeverity.HIGH,
          suggestedAction: 'Service unavailable - open circuit breaker',
          errorType: 'service_unavailable'
        };
      }
      if (statusCode === 504) {
        return {
          category: ErrorCategory.TRANSIENT,
          severity: ErrorSeverity.HIGH,
          suggestedAction: 'Gateway timeout - retry with backoff',
          errorType: 'gateway_timeout'
        };
      }

      // Generic 5xx - retryable
      return {
        category: ErrorCategory.TRANSIENT,
        severity: ErrorSeverity.HIGH,
        suggestedAction: 'Server error - retry with backoff',
        errorType: 'server_error'
      };
    }

    return null;
  }

  /**
   * Classify by error message (pattern matching).
   */
  private static classifyByMessage(message: string): ErrorPattern | null {
    const lowerMessage = message.toLowerCase();

    // Timeout patterns
    if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
      return {
        category: ErrorCategory.TRANSIENT,
        severity: ErrorSeverity.MEDIUM,
        suggestedAction: 'Retry with increased timeout',
        errorType: 'timeout'
      };
    }

    // Connection patterns
    if (lowerMessage.includes('connection refused') || lowerMessage.includes('cannot connect')) {
      return {
        category: ErrorCategory.TRANSIENT,
        severity: ErrorSeverity.HIGH,
        suggestedAction: 'Retry with exponential backoff',
        errorType: 'connection_refused'
      };
    }

    // Validation patterns
    if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) {
      return {
        category: ErrorCategory.PERMANENT,
        severity: ErrorSeverity.LOW,
        suggestedAction: 'Validation error - fix input',
        errorType: 'validation_error'
      };
    }

    // Circuit breaker patterns
    if (lowerMessage.includes('circuit breaker') && lowerMessage.includes('open')) {
      return {
        category: ErrorCategory.CIRCUIT_BREAKER,
        severity: ErrorSeverity.HIGH,
        suggestedAction: 'Circuit open - use fallback',
        errorType: 'circuit_breaker_open'
      };
    }

    // Lock contention patterns
    if (lowerMessage.includes('lock') && (lowerMessage.includes('timeout') || lowerMessage.includes('failed'))) {
      return {
        category: ErrorCategory.TRANSIENT,
        severity: ErrorSeverity.MEDIUM,
        suggestedAction: 'Retry lock acquisition',
        errorType: 'lock_contention'
      };
    }

    // Version conflict patterns (optimistic locking)
    if (lowerMessage.includes('version conflict') || lowerMessage.includes('concurrent update')) {
      return {
        category: ErrorCategory.TRANSIENT,
        severity: ErrorSeverity.MEDIUM,
        suggestedAction: 'Retry transaction with fresh state',
        errorType: 'version_conflict'
      };
    }

    return null;
  }

  /**
   * Determine if error should be retried.
   *
   * @param error Error to check
   * @returns True if error is retryable
   */
  static isRetryable(error: any): boolean {
    const classification = this.classify(error);
    return classification.retryable;
  }

  /**
   * Determine if error should trigger circuit breaker.
   *
   * @param error Error to check
   * @returns True if should trigger circuit breaker
   */
  static shouldTriggerCircuitBreaker(error: any): boolean {
    const classification = this.classify(error);
    return classification.category === ErrorCategory.CIRCUIT_BREAKER;
  }

  /**
   * Determine if error should use fallback.
   *
   * @param error Error to check
   * @returns True if should use fallback
   */
  static shouldUseFallback(error: any): boolean {
    const classification = this.classify(error);
    return classification.category === ErrorCategory.FALLBACK;
  }
}
