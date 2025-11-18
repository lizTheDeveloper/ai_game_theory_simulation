/**
 * Unit tests for Logger Utilities
 *
 * Tests structured logging with Winston, correlation IDs, and performance timing
 *
 * @group unit
 */

import {
  setCorrelationId,
  getCorrelationId,
  generateCorrelationId,
  createChildLogger,
  correlationMiddleware,
  requestLogger,
  PerformanceTimer,
  startTimer,
  logger
} from '../../utils/logger';

describe('logger', () => {
  describe('Correlation ID Management', () => {
    afterEach(() => {
      // Clear correlation ID after each test
      setCorrelationId('');
    });

    it('should set and get correlation ID', () => {
      const testId = 'test-correlation-123';
      setCorrelationId(testId);
      expect(getCorrelationId()).toBe(testId);
    });

    it('should return null or empty when no correlation ID is set', () => {
      const id = getCorrelationId();
      expect(id === null || id === '').toBe(true);
    });

    it('should generate unique correlation IDs', () => {
      const id1 = generateCorrelationId();
      const id2 = generateCorrelationId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it('should generate correlation ID with timestamp and random part', () => {
      const id = generateCorrelationId();

      // Format: {timestamp}-{random alphanumeric}
      expect(id).toContain('-');
      const parts = id.split('-');
      expect(parts.length).toBeGreaterThanOrEqual(2);
      expect(parseInt(parts[0])).toBeGreaterThan(0);
    });

    it('should allow clearing correlation ID', () => {
      setCorrelationId('test-123');
      expect(getCorrelationId()).toBe('test-123');

      setCorrelationId('');
      expect(getCorrelationId()).toBe('');
    });
  });

  describe('Winston Logger Instance', () => {
    it('should have logger instance defined', () => {
      expect(logger).toBeDefined();
      expect(logger.log).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.error).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.debug).toBeDefined();
    });

    it('should have default metadata', () => {
      expect(logger.defaultMeta).toBeDefined();
      expect(logger.defaultMeta.service).toBe('marcus-platform');
      expect(logger.defaultMeta.hostname).toBeDefined();
      expect(logger.defaultMeta.pid).toBeDefined();
    });

    it('should log at different levels', () => {
      const infoSpy = jest.spyOn(logger, 'info').mockImplementation();
      const errorSpy = jest.spyOn(logger, 'error').mockImplementation();
      const warnSpy = jest.spyOn(logger, 'warn').mockImplementation();
      const debugSpy = jest.spyOn(logger, 'debug').mockImplementation();

      logger.info('test info');
      logger.error('test error');
      logger.warn('test warn');
      logger.debug('test debug');

      expect(infoSpy).toHaveBeenCalledWith('test info');
      expect(errorSpy).toHaveBeenCalledWith('test error');
      expect(warnSpy).toHaveBeenCalledWith('test warn');
      expect(debugSpy).toHaveBeenCalledWith('test debug');

      infoSpy.mockRestore();
      errorSpy.mockRestore();
      warnSpy.mockRestore();
      debugSpy.mockRestore();
    });

    it('should log with metadata', () => {
      const spy = jest.spyOn(logger, 'info').mockImplementation();

      logger.info('User action', { userId: 123, action: 'login' });

      expect(spy).toHaveBeenCalledWith('User action', {
        userId: 123,
        action: 'login'
      });

      spy.mockRestore();
    });
  });

  describe('createChildLogger', () => {
    it('should create child logger instance', () => {
      const childLogger = createChildLogger({ module: 'test-module' });

      expect(childLogger).toBeDefined();
      expect(typeof childLogger.info).toBe('function');
      expect(typeof childLogger.error).toBe('function');
    });

    it('should create child logger with metadata param', () => {
      const childLogger = createChildLogger({ component: 'auth', module: 'authentication' });

      expect(childLogger).toBeDefined();
      // Verify it's a Winston logger instance
      expect(childLogger.log).toBeDefined();
    });

    it('should allow logging with child logger', () => {
      const childLogger = createChildLogger({ module: 'test' });
      const spy = jest.spyOn(childLogger, 'info').mockImplementation();

      childLogger.info('Test message');

      expect(spy).toHaveBeenCalledWith('Test message');
      spy.mockRestore();
    });
  });

  describe('correlationMiddleware', () => {
    it('should generate correlation ID if not provided in header', () => {
      const req: any = {
        headers: {}
      };
      const res: any = {
        setHeader: jest.fn(),
        on: jest.fn()
      };
      const next = jest.fn();

      correlationMiddleware(req, res, next);

      expect(req.correlationId).toBeDefined();
      expect(res.setHeader).toHaveBeenCalledWith('X-Correlation-ID', req.correlationId);
      expect(next).toHaveBeenCalled();
    });

    it('should use correlation ID from request header if provided', () => {
      const testId = 'request-correlation-456';
      const req: any = {
        headers: {
          'x-correlation-id': testId
        }
      };
      const res: any = {
        setHeader: jest.fn(),
        on: jest.fn()
      };
      const next = jest.fn();

      correlationMiddleware(req, res, next);

      expect(req.correlationId).toBe(testId);
      expect(res.setHeader).toHaveBeenCalledWith('X-Correlation-ID', testId);
      expect(getCorrelationId()).toBe(testId);
    });

    it('should clear correlation ID on response finish', () => {
      const req: any = {
        headers: {}
      };
      const res: any = {
        setHeader: jest.fn(),
        on: jest.fn((event, callback) => {
          if (event === 'finish') {
            // Simulate finish event
            setImmediate(callback);
          }
        })
      };
      const next = jest.fn();

      correlationMiddleware(req, res, next);

      // Wait for finish event to fire
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(getCorrelationId()).toBe('');
          resolve(undefined);
        }, 10);
      });
    });
  });

  describe('requestLogger', () => {
    it('should log incoming request', () => {
      const spy = jest.spyOn(logger, 'info').mockImplementation();

      const req: any = {
        method: 'GET',
        url: '/api/users',
        ip: '127.0.0.1',
        headers: {
          'user-agent': 'jest-test'
        }
      };
      const res: any = {
        on: jest.fn(),
        statusCode: 200
      };
      const next = jest.fn();

      requestLogger(req, res, next);

      expect(spy).toHaveBeenCalledWith('Incoming request', expect.objectContaining({
        method: 'GET',
        url: '/api/users',
        ip: '127.0.0.1',
        userAgent: 'jest-test'
      }));
      expect(next).toHaveBeenCalled();

      spy.mockRestore();
    });

    it('should log request completion with duration', () => {
      const spy = jest.spyOn(logger, 'info').mockImplementation();

      const req: any = {
        method: 'POST',
        url: '/api/auth/login',
        ip: '192.168.1.1',
        headers: {}
      };

      let finishCallback: Function | null = null;
      const res: any = {
        on: jest.fn((event, callback) => {
          if (event === 'finish') {
            finishCallback = callback;
          }
        }),
        statusCode: 200
      };
      const next = jest.fn();

      requestLogger(req, res, next);

      // Clear first call (incoming request)
      spy.mockClear();

      // Simulate response finish
      if (finishCallback) {
        finishCallback();
      }

      expect(spy).toHaveBeenCalledWith('Request completed', expect.objectContaining({
        method: 'POST',
        url: '/api/auth/login',
        statusCode: 200,
        duration: expect.any(Number)
      }));

      spy.mockRestore();
    });
  });

  describe('PerformanceTimer', () => {
    it('should create performance timer', () => {
      const timer = new PerformanceTimer('test-operation');
      expect(timer).toBeInstanceOf(PerformanceTimer);
    });

    it('should measure duration and log', () => {
      const spy = jest.spyOn(logger, 'info').mockImplementation();

      const timer = new PerformanceTimer('database-query');

      // Simulate some delay
      const start = Date.now();
      while (Date.now() - start < 10) {
        // Busy wait for ~10ms
      }

      timer.end();

      expect(spy).toHaveBeenCalledWith(
        'Performance: database-query',
        expect.objectContaining({
          duration: expect.any(Number),
          durationMs: expect.any(Number)
        })
      );

      const duration = spy.mock.calls[0][1].duration;
      expect(duration).toBeGreaterThanOrEqual(10);

      spy.mockRestore();
    });

    it('should include additional metadata in performance log', () => {
      const spy = jest.spyOn(logger, 'info').mockImplementation();

      const timer = new PerformanceTimer('api-call');
      timer.end({ endpoint: '/api/users', recordCount: 150 });

      expect(spy).toHaveBeenCalledWith(
        'Performance: api-call',
        expect.objectContaining({
          endpoint: '/api/users',
          recordCount: 150,
          duration: expect.any(Number),
          durationMs: expect.any(Number)
        })
      );

      spy.mockRestore();
    });
  });

  describe('startTimer', () => {
    it('should create and return PerformanceTimer instance', () => {
      const timer = startTimer('test-timer');
      expect(timer).toBeInstanceOf(PerformanceTimer);
    });

    it('should work with end() method', () => {
      const spy = jest.spyOn(logger, 'info').mockImplementation();

      const timer = startTimer('file-processing');
      timer.end({ fileSize: 1024 });

      expect(spy).toHaveBeenCalledWith(
        'Performance: file-processing',
        expect.objectContaining({
          fileSize: 1024,
          duration: expect.any(Number)
        })
      );

      spy.mockRestore();
    });
  });
});
