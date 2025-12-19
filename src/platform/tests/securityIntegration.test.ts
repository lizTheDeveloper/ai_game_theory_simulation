/**
 * MARCUS 3.0 Citation Integrity Platform
 * Comprehensive Security Integration Tests
 *
 * Tests OWASP security features:
 * - Task 1.7: CORS Configuration
 * - Task 1.8: Security Headers
 * - Task 1.9: Dependency Scanning (tested via CI)
 * - Task 1.10: SAST Analysis (tested via CI)
 * - Task 1.11: Audit Logging
 * - Task 1.12: Session Management
 *
 * @author Marcus (Platform Engineer)
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { Pool } from 'pg';
import Redis from 'ioredis';
import { PlatformServer, getDefaultConfig } from '../api/server';
import express, { Request, Response } from 'express';
import { createCORSMiddleware } from '../middleware/corsMiddleware';
import { createSecurityHeadersMiddleware, getDefaultSecurityHeadersConfig } from '../middleware/securityHeaders';
import { AuditLogger } from '../middleware/auditLogger';
import { SessionManager } from '../middleware/sessionManager';

// ============================================================================
// Test Setup
// ============================================================================

describe('Security Integration Tests', () => {
  let pool: Pool;
  let redis: Redis;
  let server: PlatformServer;

  before(async () => {
    // Setup test database
    pool = new Pool({
      host: process.env.TEST_DB_HOST || 'localhost',
      port: parseInt(process.env.TEST_DB_PORT || '5432'),
      database: process.env.TEST_DB_NAME || 'marcus_test',
      user: process.env.TEST_DB_USER || 'postgres',
      password: process.env.TEST_DB_PASSWORD || '',
    });

    // Setup test Redis
    redis = new Redis({
      host: process.env.TEST_REDIS_HOST || 'localhost',
      port: parseInt(process.env.TEST_REDIS_PORT || '6379'),
      db: parseInt(process.env.TEST_REDIS_DB || '1'), // Use separate DB for tests
    });

    // Flush test Redis
    await redis.flushdb();
  });

  after(async () => {
    await pool.end();
    await redis.quit();
  });

  // ==========================================================================
  // Task 1.7: CORS Configuration Tests
  // ==========================================================================

  describe('Task 1.7: CORS Configuration', () => {
    it('should allow requests from whitelisted origins', async () => {
      const app = express();
      const corsMiddleware = createCORSMiddleware({
        allowedOrigins: ['https://app.example.com'],
        credentials: true,
      });
      app.use(corsMiddleware);
      app.get('/test', (req: Request, res: Response) => {
        res.json({ success: true });
      });

      // Simulate request from allowed origin
      const mockReq = {
        method: 'GET',
        headers: { origin: 'https://app.example.com' },
        path: '/test',
      } as any;

      const mockRes = {
        setHeader: function(key: string, value: string) {
          (this as any)[key] = value;
        },
      } as any;

      const mockNext = () => {};

      corsMiddleware(mockReq, mockRes, mockNext);

      assert.strictEqual(
        mockRes['Access-Control-Allow-Origin'],
        'https://app.example.com',
        'Should set CORS header for allowed origin'
      );
      assert.strictEqual(
        mockRes['Access-Control-Allow-Credentials'],
        'true',
        'Should allow credentials'
      );
    });

    it('should reject requests from non-whitelisted origins', async () => {
      const app = express();
      const corsMiddleware = createCORSMiddleware({
        allowedOrigins: ['https://app.example.com'],
        credentials: true,
      });
      app.use(corsMiddleware);

      const mockReq = {
        method: 'GET',
        headers: { origin: 'https://evil.com' },
        path: '/test',
      } as any;

      const mockRes = {
        setHeader: function(key: string, value: string) {
          (this as any)[key] = value;
        },
      } as any;

      const mockNext = () => {};

      corsMiddleware(mockReq, mockRes, mockNext);

      assert.strictEqual(
        mockRes['Access-Control-Allow-Origin'],
        undefined,
        'Should NOT set CORS header for disallowed origin'
      );
    });

    it('should handle wildcard subdomain patterns', async () => {
      const corsMiddleware = createCORSMiddleware({
        allowedOrigins: ['https://*.example.com'],
      });

      const mockReq = {
        method: 'GET',
        headers: { origin: 'https://app.example.com' },
        path: '/test',
      } as any;

      const mockRes = {
        setHeader: function(key: string, value: string) {
          (this as any)[key] = value;
        },
      } as any;

      const mockNext = () => {};

      corsMiddleware(mockReq, mockRes, mockNext);

      assert.strictEqual(
        mockRes['Access-Control-Allow-Origin'],
        'https://app.example.com',
        'Should match wildcard subdomain pattern'
      );
    });
  });

  // ==========================================================================
  // Task 1.8: Security Headers Tests
  // ==========================================================================

  describe('Task 1.8: Security Headers', () => {
    it('should set all required security headers', async () => {
      const middleware = createSecurityHeadersMiddleware(getDefaultSecurityHeadersConfig());

      const mockReq = {
        secure: true,
        headers: {},
      } as any;

      const mockRes = {
        headers: {} as Record<string, string>,
        setHeader: function(key: string, value: string) {
          this.headers[key] = value;
        },
      } as any;

      const mockNext = () => {};

      middleware(mockReq, mockRes, mockNext);

      // Verify required headers
      assert.ok(
        mockRes.headers['Content-Security-Policy'],
        'Should set Content-Security-Policy'
      );
      assert.ok(
        mockRes.headers['Strict-Transport-Security'],
        'Should set HSTS header on HTTPS'
      );
      assert.strictEqual(
        mockRes.headers['X-Frame-Options'],
        'DENY',
        'Should set X-Frame-Options to DENY'
      );
      assert.strictEqual(
        mockRes.headers['X-Content-Type-Options'],
        'nosniff',
        'Should set X-Content-Type-Options to nosniff'
      );
      assert.strictEqual(
        mockRes.headers['X-XSS-Protection'],
        '1; mode=block',
        'Should set X-XSS-Protection'
      );
      assert.ok(
        mockRes.headers['Referrer-Policy'],
        'Should set Referrer-Policy'
      );
      assert.ok(
        mockRes.headers['Permissions-Policy'],
        'Should set Permissions-Policy'
      );
    });

    it('should not set HSTS on HTTP connections', async () => {
      const middleware = createSecurityHeadersMiddleware(getDefaultSecurityHeadersConfig());

      const mockReq = {
        secure: false, // HTTP
        headers: {},
      } as any;

      const mockRes = {
        headers: {} as Record<string, string>,
        setHeader: function(key: string, value: string) {
          this.headers[key] = value;
        },
      } as any;

      const mockNext = () => {};

      middleware(mockReq, mockRes, mockNext);

      assert.strictEqual(
        mockRes.headers['Strict-Transport-Security'],
        undefined,
        'Should NOT set HSTS on HTTP'
      );
    });
  });

  // ==========================================================================
  // Task 1.11: Audit Logging Tests
  // ==========================================================================

  describe('Task 1.11: Audit Logging', () => {
    it('should log authentication events to database', async () => {
      const auditLogger = new AuditLogger(pool, {
        enableDatabaseLogging: true,
        enableConsoleLogging: false,
      });

      await auditLogger.log({
        eventType: 'auth.login.success',
        severity: 'low',
        userId: 'test-user-id',
        email: 'test@example.com',
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
        resource: '/auth/login',
        action: 'POST',
        result: 'success',
      });

      // Verify log was persisted
      const result = await pool.query(
        `SELECT * FROM audit_log WHERE email = $1 AND event_type = $2`,
        ['test@example.com', 'auth.login.success']
      );

      assert.strictEqual(result.rowCount, 1, 'Should persist audit log to database');
      assert.strictEqual(result.rows[0].severity, 'low');
      assert.strictEqual(result.rows[0].result, 'success');
    });

    it('should filter logs by severity threshold', async () => {
      const auditLogger = new AuditLogger(pool, {
        minSeverity: 'high',
        enableDatabaseLogging: false,
      });

      // Low severity should be ignored
      let loggedToConsole = false;
      const originalLog = console.log;
      console.log = () => { loggedToConsole = true; };

      await auditLogger.log({
        eventType: 'auth.login.success',
        severity: 'low',
        result: 'success',
      });

      console.log = originalLog;

      assert.strictEqual(loggedToConsole, false, 'Should NOT log events below severity threshold');
    });

    it('should handle metadata as JSONB', async () => {
      const auditLogger = new AuditLogger(pool, {
        enableDatabaseLogging: true,
        enableConsoleLogging: false,
      });

      const metadata = {
        attemptCount: 3,
        userAgent: 'Mozilla/5.0',
        customField: 'test-value',
      };

      await auditLogger.log({
        eventType: 'auth.login.failure',
        severity: 'medium',
        email: 'test-metadata@example.com',
        result: 'failure',
        metadata,
      });

      const result = await pool.query(
        `SELECT metadata FROM audit_log WHERE email = $1`,
        ['test-metadata@example.com']
      );

      assert.deepStrictEqual(
        result.rows[0].metadata,
        metadata,
        'Should store and retrieve metadata as JSONB'
      );
    });
  });

  // ==========================================================================
  // Task 1.12: Session Management Tests
  // ==========================================================================

  describe('Task 1.12: Session Management', () => {
    let sessionManager: SessionManager;

    before(() => {
      sessionManager = new SessionManager(redis, pool, {
        inactivityTimeout: 1800, // 30 minutes
        absoluteTimeout: 86400, // 24 hours
        maxConcurrentSessions: 5,
        enableCSRF: true,
      });
    });

    it('should create session with CSRF token', async () => {
      const session = await sessionManager.createSession(
        'test-user-123',
        'test@example.com',
        'admin',
        '127.0.0.1',
        'test-agent'
      );

      assert.ok(session.sessionId, 'Should generate session ID');
      assert.ok(session.csrfToken, 'Should generate CSRF token');
      assert.strictEqual(session.userId, 'test-user-123');
      assert.strictEqual(session.email, 'test@example.com');
    });

    it('should validate and refresh active session', async () => {
      const session1 = await sessionManager.createSession(
        'test-user-456',
        'user@example.com',
        'viewer',
        '127.0.0.1',
        'test-agent'
      );

      // Wait briefly
      await new Promise(resolve => setTimeout(resolve, 100));

      // Validate session
      const session2 = await sessionManager.validateSession(session1.sessionId);

      assert.ok(session2, 'Should validate active session');
      assert.strictEqual(session2!.sessionId, session1.sessionId);
      assert.ok(
        new Date(session2!.lastActivityAt).getTime() > new Date(session1.lastActivityAt).getTime(),
        'Should update last activity timestamp'
      );
    });

    it('should enforce concurrent session limit', async () => {
      const userId = 'test-user-many-sessions';
      const email = 'many@example.com';

      // Create max sessions + 1
      for (let i = 0; i < 6; i++) {
        await sessionManager.createSession(
          userId,
          email,
          'viewer',
          '127.0.0.1',
          `agent-${i}`
        );
      }

      // Should have limited to max (5)
      const count = await sessionManager.getActiveSessionCount(userId);
      assert.strictEqual(count, 5, 'Should enforce concurrent session limit');
    });

    it('should validate CSRF token', async () => {
      const session = await sessionManager.createSession(
        'csrf-test-user',
        'csrf@example.com',
        'admin',
        '127.0.0.1',
        'test-agent'
      );

      // Valid CSRF token
      const validResult = sessionManager.validateCSRFToken(session, session.csrfToken!);
      assert.strictEqual(validResult, true, 'Should validate correct CSRF token');

      // Invalid CSRF token
      const invalidResult = sessionManager.validateCSRFToken(session, 'wrong-token');
      assert.strictEqual(invalidResult, false, 'Should reject incorrect CSRF token');
    });

    it('should destroy session on logout', async () => {
      const session = await sessionManager.createSession(
        'logout-test-user',
        'logout@example.com',
        'viewer',
        '127.0.0.1',
        'test-agent'
      );

      // Destroy session
      await sessionManager.destroySession(session.sessionId);

      // Validate should return null
      const validatedSession = await sessionManager.validateSession(session.sessionId);
      assert.strictEqual(validatedSession, null, 'Should invalidate destroyed session');
    });
  });

  // ==========================================================================
  // Integration Test: Full Request Lifecycle
  // ==========================================================================

  describe('Full Request Lifecycle with All Security Features', () => {
    it('should apply all security middleware to HTTP requests', async () => {
      const config = getDefaultConfig();
      config.database.database = 'marcus_test';
      config.server.port = 0; // Use random available port

      // Create and start server
      const testServer = new PlatformServer(config);
      const server = await testServer.start();
      const address = server.address();
      const port = typeof address === 'object' && address !== null ? address.port : 3000;
      const baseUrl = `http://localhost:${port}`;

      try {
        // Test 1: Health endpoint should return 200
        const healthResponse = await fetch(`${baseUrl}/health`);
        assert.strictEqual(healthResponse.status, 200, 'Health endpoint should return 200');

        // Test 2: Security headers should be present
        assert.ok(healthResponse.headers.get('x-frame-options'), 'Should have X-Frame-Options');
        assert.ok(healthResponse.headers.get('x-content-type-options'), 'Should have X-Content-Type-Options');
        assert.ok(healthResponse.headers.get('strict-transport-security'), 'Should have HSTS');

        // Test 3: Rate limiting should work
        const loginAttempts = [];
        for (let i = 0; i < 10; i++) {
          loginAttempts.push(
            fetch(`${baseUrl}/auth/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: 'test', password: 'wrong' })
            })
          );
        }
        const responses = await Promise.all(loginAttempts);
        const rateLimited = responses.some(r => r.status === 429);
        assert.ok(rateLimited, 'Should rate limit excessive login attempts');

        // Test 4: CORS headers on OPTIONS request
        const corsResponse = await fetch(`${baseUrl}/api/citations/analyze`, {
          method: 'OPTIONS',
          headers: { 'Origin': 'https://example.com' }
        });
        assert.ok(corsResponse.headers.get('access-control-allow-origin'), 'Should have CORS headers');

      } finally {
        // Clean up: stop server
        await testServer.stop();
      }
    });
  });
});
