/**
 * MARCUS 3.1 - Error Classifier Unit Tests
 *
 * Tests error classification logic for comprehensive error recovery.
 */

import { ErrorClassifier, ErrorCategory, ErrorSeverity } from '../../utils/errorClassifier';

describe('ErrorClassifier', () => {
  describe('Network Errors', () => {
    test('classifies ECONNREFUSED as transient', () => {
      const error = { code: 'ECONNREFUSED', message: 'Connection refused' };
      const classification = ErrorClassifier.classify(error, 'database');

      expect(classification.category).toBe(ErrorCategory.TRANSIENT);
      expect(classification.retryable).toBe(true);
      expect(classification.errorType).toBe('network_connection_refused');
    });

    test('classifies ETIMEDOUT as transient', () => {
      const error = { code: 'ETIMEDOUT', message: 'Timeout' };
      const classification = ErrorClassifier.classify(error, 'redis');

      expect(classification.category).toBe(ErrorCategory.TRANSIENT);
      expect(classification.retryable).toBe(true);
    });

    test('classifies ENETUNREACH as circuit breaker trigger', () => {
      const error = { code: 'ENETUNREACH', message: 'Network unreachable' };
      const classification = ErrorClassifier.classify(error, 'agent');

      expect(classification.category).toBe(ErrorCategory.CIRCUIT_BREAKER);
      expect(classification.severity).toBe(ErrorSeverity.HIGH);
    });
  });

  describe('Database Errors', () => {
    test('classifies connection pool exhaustion as circuit breaker', () => {
      const error = { code: '53300', message: 'Too many connections' };
      const classification = ErrorClassifier.classify(error, 'database');

      expect(classification.category).toBe(ErrorCategory.CIRCUIT_BREAKER);
      expect(classification.severity).toBe(ErrorSeverity.CRITICAL);
      expect(classification.errorType).toBe('database_connection_pool_exhausted');
    });

    test('classifies unique constraint violation as permanent', () => {
      const error = { code: '23505', message: 'Duplicate key' };
      const classification = ErrorClassifier.classify(error, 'database');

      expect(classification.category).toBe(ErrorCategory.PERMANENT);
      expect(classification.retryable).toBe(false);
    });

    test('classifies serialization failure as transient', () => {
      const error = { code: '40001', message: 'Could not serialize' };
      const classification = ErrorClassifier.classify(error, 'database');

      expect(classification.category).toBe(ErrorCategory.TRANSIENT);
      expect(classification.retryable).toBe(true);
    });
  });

  describe('HTTP Status Codes', () => {
    test('classifies 404 as permanent', () => {
      const error = { statusCode: 404, message: 'Not found' };
      const classification = ErrorClassifier.classify(error, 'http');

      expect(classification.category).toBe(ErrorCategory.PERMANENT);
      expect(classification.retryable).toBe(false);
      expect(classification.errorType).toBe('resource_not_found');
    });

    test('classifies 503 as circuit breaker trigger', () => {
      const error = { statusCode: 503, message: 'Service unavailable' };
      const classification = ErrorClassifier.classify(error, 'http');

      expect(classification.category).toBe(ErrorCategory.CIRCUIT_BREAKER);
      expect(classification.errorType).toBe('service_unavailable');
    });

    test('classifies 429 as transient (rate limit)', () => {
      const error = { statusCode: 429, message: 'Too many requests' };
      const classification = ErrorClassifier.classify(error, 'http');

      expect(classification.category).toBe(ErrorCategory.TRANSIENT);
      expect(classification.retryable).toBe(true);
    });

    test('classifies 500 as transient', () => {
      const error = { statusCode: 500, message: 'Internal server error' };
      const classification = ErrorClassifier.classify(error, 'http');

      expect(classification.category).toBe(ErrorCategory.TRANSIENT);
      expect(classification.retryable).toBe(true);
    });

    test('classifies 401 as permanent', () => {
      const error = { statusCode: 401, message: 'Unauthorized' };
      const classification = ErrorClassifier.classify(error, 'http');

      expect(classification.category).toBe(ErrorCategory.PERMANENT);
      expect(classification.errorType).toBe('auth_unauthorized');
    });
  });

  describe('Redis Errors', () => {
    test('classifies MaxRetriesPerRequestError as circuit breaker', () => {
      const error = { code: 'MaxRetriesPerRequestError', message: 'Max retries exceeded' };
      const classification = ErrorClassifier.classify(error, 'redis');

      expect(classification.category).toBe(ErrorCategory.CIRCUIT_BREAKER);
      expect(classification.errorType).toBe('redis_max_retries');
    });

    test('classifies READONLY as fallback', () => {
      const error = { code: 'READONLY', message: 'Redis in read-only mode' };
      const classification = ErrorClassifier.classify(error, 'redis');

      expect(classification.category).toBe(ErrorCategory.FALLBACK);
      expect(classification.suggestedAction).toContain('fallback');
    });

    test('classifies LOADING as transient', () => {
      const error = { code: 'LOADING', message: 'Redis loading dataset' };
      const classification = ErrorClassifier.classify(error, 'redis');

      expect(classification.category).toBe(ErrorCategory.TRANSIENT);
    });
  });

  describe('Message Pattern Matching', () => {
    test('classifies timeout messages as transient', () => {
      const error = { message: 'Operation timed out after 5000ms' };
      const classification = ErrorClassifier.classify(error, 'agent');

      expect(classification.category).toBe(ErrorCategory.TRANSIENT);
      expect(classification.errorType).toBe('timeout');
    });

    test('classifies validation messages as permanent', () => {
      const error = { message: 'Validation error: field required' };
      const classification = ErrorClassifier.classify(error, 'api');

      expect(classification.category).toBe(ErrorCategory.PERMANENT);
      expect(classification.errorType).toBe('validation_error');
    });

    test('classifies version conflict as transient', () => {
      const error = { message: 'Version conflict for agent agent_001' };
      const classification = ErrorClassifier.classify(error, 'database');

      expect(classification.category).toBe(ErrorCategory.TRANSIENT);
      expect(classification.errorType).toBe('version_conflict');
    });

    test('classifies circuit breaker open as circuit breaker', () => {
      const error = { message: 'Circuit breaker database_query is OPEN' };
      const classification = ErrorClassifier.classify(error, 'database');

      expect(classification.category).toBe(ErrorCategory.CIRCUIT_BREAKER);
    });
  });

  describe('Helper Methods', () => {
    test('isRetryable returns true for transient errors', () => {
      const error = { code: 'ETIMEDOUT' };
      expect(ErrorClassifier.isRetryable(error)).toBe(true);
    });

    test('isRetryable returns false for permanent errors', () => {
      const error = { statusCode: 404 };
      expect(ErrorClassifier.isRetryable(error)).toBe(false);
    });

    test('shouldTriggerCircuitBreaker returns true for appropriate errors', () => {
      const error = { statusCode: 503 };
      expect(ErrorClassifier.shouldTriggerCircuitBreaker(error)).toBe(true);
    });

    test('shouldUseFallback returns true for fallback errors', () => {
      const error = { code: 'READONLY' };
      expect(ErrorClassifier.shouldUseFallback(error)).toBe(true);
    });
  });
});
