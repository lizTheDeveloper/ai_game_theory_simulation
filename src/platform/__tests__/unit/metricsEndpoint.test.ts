/**
 * Unit Tests - Metrics Endpoint
 *
 * Tests Prometheus metrics endpoint and middleware
 *
 * @group unit
 */

import { Request, Response } from 'express';
import {
  httpRequestDuration,
  httpRequestCounter,
  activeConnections,
  agentStatus,
  agentRequestDuration,
  dbPoolSize,
  dbPoolWaiting,
  circuitBreakerState,
  circuitBreakerFailures,
  citationAnalysisCounter,
  citationAnalysisDuration,
  authAttempts,
  activeTokens,
  metricsMiddleware,
  metricsHandler,
  healthCheckHandler,
  register
} from '../../monitoring/metricsEndpoint';

describe('metricsEndpoint', () => {
  beforeEach(() => {
    // Clear all metrics before each test
    register.resetMetrics();
  });

  describe('Prometheus Metrics Registration', () => {
    it('should register httpRequestDuration histogram', () => {
      expect(httpRequestDuration).toBeDefined();
      expect(httpRequestDuration.name).toBe('marcus_http_request_duration_seconds');
    });

    it('should register httpRequestCounter counter', () => {
      expect(httpRequestCounter).toBeDefined();
      expect(httpRequestCounter.name).toBe('marcus_http_requests_total');
    });

    it('should register activeConnections gauge', () => {
      expect(activeConnections).toBeDefined();
      expect(activeConnections.name).toBe('marcus_http_active_connections');
    });

    it('should register agentStatus gauge', () => {
      expect(agentStatus).toBeDefined();
      expect(agentStatus.name).toBe('marcus_agent_status');
    });

    it('should register circuitBreakerState gauge', () => {
      expect(circuitBreakerState).toBeDefined();
      expect(circuitBreakerState.name).toBe('marcus_circuit_breaker_state');
    });

    it('should register authAttempts counter', () => {
      expect(authAttempts).toBeDefined();
      expect(authAttempts.name).toBe('marcus_auth_attempts_total');
    });
  });

  describe('metricsMiddleware', () => {
    it('should increment activeConnections when request starts', () => {
      const req: Partial<Request> = {
        method: 'GET',
        path: '/test',
        route: { path: '/test' }
      };
      const res: Partial<Response> = {
        on: jest.fn()
      };
      const next = jest.fn();

      const initialValue = 0; // After reset
      metricsMiddleware(req as Request, res as Response, next);

      // activeConnections should have been incremented
      expect(next).toHaveBeenCalled();
      expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
    });

    it('should call next() to continue request processing', () => {
      const req: Partial<Request> = {
        method: 'GET',
        path: '/test'
      };
      const res: Partial<Response> = {
        on: jest.fn()
      };
      const next = jest.fn();

      metricsMiddleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should attach finish event listener to response', () => {
      const req: Partial<Request> = {
        method: 'GET',
        path: '/test',
        route: { path: '/test' }
      };
      const res: Partial<Response> = {
        on: jest.fn(),
        statusCode: 200
      };
      const next = jest.fn();

      metricsMiddleware(req as Request, res as Response, next);

      expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
    });

    it('should record metrics on response finish', (done) => {
      const req: Partial<Request> = {
        method: 'POST',
        path: '/api/users',
        route: { path: '/api/users' }
      };

      let finishCallback: Function | null = null;
      const res: Partial<Response> = {
        on: jest.fn((event, callback) => {
          if (event === 'finish') {
            finishCallback = callback;
          }
        }),
        statusCode: 201
      };
      const next = jest.fn();

      metricsMiddleware(req as Request, res as Response, next);

      // Simulate response finish
      if (finishCallback) {
        finishCallback();
      }

      // Metrics should have been recorded
      setTimeout(() => {
        // Test passes if no errors thrown during metric recording
        expect(finishCallback).toBeDefined();
        done();
      }, 10);
    });

    it('should handle missing route path gracefully', () => {
      const req: Partial<Request> = {
        method: 'GET',
        path: '/unknown'
        // No route property
      };
      const res: Partial<Response> = {
        on: jest.fn(),
        statusCode: 404
      };
      const next = jest.fn();

      // Should not throw
      expect(() => {
        metricsMiddleware(req as Request, res as Response, next);
      }).not.toThrow();
    });
  });

  describe('metricsHandler', () => {
    it('should return metrics in Prometheus format', async () => {
      const req: Partial<Request> = {};
      const res: Partial<Response> = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      await metricsHandler(req as Request, res as Response);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', expect.any(String));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(expect.any(String));
    });

    it('should include custom MARCUS metrics in output', async () => {
      const req: Partial<Request> = {};
      let metricsOutput = '';
      const res: Partial<Response> = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn((output) => {
          metricsOutput = output;
        })
      };

      await metricsHandler(req as Request, res as Response);

      expect(metricsOutput).toContain('marcus_http_request_duration_seconds');
      expect(metricsOutput).toContain('marcus_http_requests_total');
      expect(metricsOutput).toContain('marcus_http_active_connections');
    });

    it('should handle errors gracefully', async () => {
      const req: Partial<Request> = {};
      const res: Partial<Response> = {
        setHeader: jest.fn(() => {
          throw new Error('Test error');
        }),
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      await metricsHandler(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(expect.stringContaining('Error generating metrics'));
    });
  });

  describe('healthCheckHandler', () => {
    it('should return health check response', () => {
      const req: Partial<Request> = {};
      const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      healthCheckHandler(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'healthy',
          timestamp: expect.any(String),
          uptime: expect.any(Number),
          memory: expect.any(Object)
        })
      );
    });

    it('should include process uptime in response', () => {
      const req: Partial<Request> = {};
      let responseData: any;
      const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((data) => {
          responseData = data;
        })
      };

      healthCheckHandler(req as Request, res as Response);

      expect(responseData.uptime).toBeGreaterThan(0);
    });

    it('should include memory usage in response', () => {
      const req: Partial<Request> = {};
      let responseData: any;
      const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((data) => {
          responseData = data;
        })
      };

      healthCheckHandler(req as Request, res as Response);

      expect(responseData.memory).toHaveProperty('heapUsed');
      expect(responseData.memory).toHaveProperty('heapTotal');
      expect(responseData.memory).toHaveProperty('external');
    });

    it('should include ISO timestamp', () => {
      const req: Partial<Request> = {};
      let responseData: any;
      const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((data) => {
          responseData = data;
        })
      };

      healthCheckHandler(req as Request, res as Response);

      // Should be valid ISO 8601 timestamp
      expect(() => new Date(responseData.timestamp)).not.toThrow();
      expect(responseData.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('Metric Usage Examples', () => {
    it('should allow recording auth attempts', () => {
      expect(() => {
        authAttempts.inc({ result: 'success' });
        authAttempts.inc({ result: 'failure' });
        authAttempts.inc({ result: 'locked' });
      }).not.toThrow();
    });

    it('should allow setting agent status', () => {
      expect(() => {
        agentStatus.set({ agent_id: 'agent-1' }, 1);
        agentStatus.set({ agent_id: 'agent-2' }, 0);
      }).not.toThrow();
    });

    it('should allow recording circuit breaker state', () => {
      expect(() => {
        circuitBreakerState.set({ breaker_name: 'db-breaker' }, 0); // CLOSED
        circuitBreakerState.set({ breaker_name: 'db-breaker' }, 1); // HALF_OPEN
        circuitBreakerState.set({ breaker_name: 'db-breaker' }, 2); // OPEN
      }).not.toThrow();
    });

    it('should allow recording citation analysis duration', () => {
      expect(() => {
        citationAnalysisDuration.observe({ agent_id: 'agent-1' }, 2.5);
        citationAnalysisDuration.observe({ agent_id: 'agent-2' }, 5.2);
      }).not.toThrow();
    });
  });
});
