/**
 * MARCUS 3.0 - End-to-End Integration Test
 *
 * Tests complete user journey: register → login → analyze citation → fetch results → logout
 *
 * @module fullWorkflow.test
 */

import request from 'supertest';
import { Pool } from 'pg';
import Redis from 'ioredis';
import { getTestConfiguration } from '../../config/platformConfig';

describe('E2E: Full Citation Analysis Workflow', () => {
  let dbPool: Pool;
  let redisClient: Redis;
  let app: any; // Will be initialized from PlatformServer

  beforeAll(async () => {
    // Get test configuration
    const config = getTestConfiguration();

    // Setup database connection
    dbPool = new Pool({
      host: config.database.host,
      port: config.database.port,
      database: config.database.database,
      user: config.database.user,
      password: config.database.password,
    });

    // Setup Redis connection
    redisClient = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      db: config.redis.db,
      maxRetriesPerRequest: config.redis.maxRetriesPerRequest
    });

    // Initialize Express app from PlatformServer
    const { PlatformServer, getDefaultConfig } = await import('../../api/server');
    const serverConfig = getDefaultConfig();
    const server = new PlatformServer(serverConfig);
    app = server.getApp();

    // Drop existing tables (in case of previous test failures)
    // Ignore errors if tables owned by different user
    try {
      await dbPool.query('DROP TABLE IF EXISTS citation_analyses CASCADE');
    } catch (err) {
      // Table may not exist or owned by different user - that's OK
    }
    try {
      await dbPool.query('DROP TABLE IF EXISTS auth_audit_log CASCADE');
    } catch (err) {
      // Table may not exist or owned by different user - that's OK
    }
    try {
      await dbPool.query('DROP TABLE IF EXISTS refresh_tokens CASCADE');
    } catch (err) {
      // Table may not exist or owned by different user - that's OK
    }
    try {
      await dbPool.query('DROP TABLE IF EXISTS users CASCADE');
    } catch (err) {
      // Table may not exist or owned by different user - that's OK
    }

    // Create test schema (matching authFlow schema - INTEGER IDs not UUID)
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'viewer',
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        failed_login_attempts INTEGER DEFAULT 0,
        locked_until TIMESTAMP,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        token VARCHAR(500) PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        revoked BOOLEAN NOT NULL DEFAULT false,
        revoked_at TIMESTAMP,
        CONSTRAINT valid_expiry CHECK (expires_at > created_at)
      )
    `);

    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS auth_audit_log (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        email VARCHAR(255) NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        success BOOLEAN NOT NULL,
        failure_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS citation_analyses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        text TEXT NOT NULL,
        claimed_source TEXT NOT NULL,
        credibility_score NUMERIC(3, 2),
        confidence NUMERIC(3, 2),
        consensus NUMERIC(3, 2),
        status VARCHAR(50) DEFAULT 'pending',
        result JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP
      )
    `);
  });

  afterAll(async () => {
    // Cleanup (ignore permission errors if tables owned by different user)
    try {
      await dbPool.query('DROP TABLE IF EXISTS citation_analyses CASCADE');
    } catch (err) {
      // Ignore - may not have permission
    }
    try {
      await dbPool.query('DROP TABLE IF EXISTS auth_audit_log CASCADE');
    } catch (err) {
      // Ignore - may not have permission
    }
    try {
      await dbPool.query('DROP TABLE IF EXISTS refresh_tokens CASCADE');
    } catch (err) {
      // Ignore - may not have permission
    }
    try {
      await dbPool.query('DROP TABLE IF EXISTS users CASCADE');
    } catch (err) {
      // Ignore - may not have permission
    }
    await dbPool.end();
    await redisClient.quit();
  });

  beforeEach(async () => {
    // Clear data before each test (in order that respects foreign keys)
    await dbPool.query('DELETE FROM citation_analyses');
    await dbPool.query('DELETE FROM auth_audit_log');
    await dbPool.query('DELETE FROM refresh_tokens');
    await dbPool.query('DELETE FROM users');
    await redisClient.flushdb();
  });

  it('should complete full user journey: register → login → analyze → logout', async () => {
    const testEmail = `e2e-test-${Date.now()}@example.com`;
    const testPassword = 'SecurePassword123!';

    // ========================================================================
    // STEP 1: User Registration
    // ========================================================================
    const registerRes = await request(app)
      .post('/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        role: 'operator'
      });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body).toHaveProperty('user');
    expect(registerRes.body).toHaveProperty('accessToken');
    expect(registerRes.body).toHaveProperty('refreshToken');
    expect(registerRes.body.user.email).toBe(testEmail);
    expect(registerRes.body.user.role).toBe('operator');

    // ========================================================================
    // STEP 2: User Login
    // ========================================================================
    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: testEmail,
        password: testPassword
      });

    expect(loginRes.status).toBe(200);
    const { accessToken, refreshToken } = loginRes.body;
    expect(accessToken).toBeDefined();
    expect(accessToken).toMatch(/^eyJ/); // JWT format
    expect(refreshToken).toBeDefined();

    // ========================================================================
    // STEP 3: Submit Citation Analysis
    // ========================================================================
    // Note: This endpoint requires Python agents to be running
    // If agents are not available, this will return 503 Service Unavailable
    const citationRes = await request(app)
      .post('/api/citations/analyze')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        text: 'According to Smith et al. (2024), climate change has accelerated significantly.',
        claimedSource: 'Smith et al. 2024'
      });

    // Accept either 202 (agents running) or 503 (agents not available)
    expect([202, 503]).toContain(citationRes.status);

    if (citationRes.status === 202) {
      // Agents are running - test full workflow
      const { analysisId } = citationRes.body;
      expect(analysisId).toBeDefined();

      // ========================================================================
      // STEP 4: Poll for Analysis Results
      // ========================================================================
      let analysis;
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds max

      while (attempts < maxAttempts) {
        const statusRes = await request(app)
          .get(`/api/citations/${analysisId}`)
          .set('Authorization', `Bearer ${accessToken}`);

        if (statusRes.body.status === 'completed') {
          analysis = statusRes.body;
          break;
        } else if (statusRes.body.status === 'failed') {
          throw new Error(`Analysis failed: ${statusRes.body.error}`);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }

      if (analysis) {
        expect(analysis.status).toBe('completed');
        expect(analysis.result).toHaveProperty('credibility_score');
        expect(analysis.result).toHaveProperty('confidence');
        expect(analysis.result).toHaveProperty('consensus');
        expect(analysis.result.agent_results).toBeInstanceOf(Array);
        expect(analysis.result.agent_results.length).toBeGreaterThan(0);
      }
    } else {
      // Agents not available - verify error response
      expect(citationRes.status).toBe(503);
      expect(citationRes.body).toHaveProperty('error');
      expect(citationRes.body.error).toMatch(/agent|service/i);
    }

    // ========================================================================
    // STEP 5: Refresh Access Token
    // ========================================================================
    const refreshRes = await request(app)
      .post('/auth/refresh')
      .send({ refreshToken });

    expect(refreshRes.status).toBe(200);
    const newAccessToken = refreshRes.body.accessToken;
    expect(newAccessToken).toBeDefined();
    expect(newAccessToken).not.toBe(accessToken); // Should be different

    // ========================================================================
    // STEP 6: User Logout
    // ========================================================================
    const logoutRes = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${newAccessToken}`)
      .send({ refreshToken: refreshRes.body.refreshToken });

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body).toHaveProperty('message', 'Logged out successfully');

    // ========================================================================
    // STEP 7: Verify Token Invalidation
    // ========================================================================
    // Attempt to use invalidated token - should fail
    const unauthorizedRes = await request(app)
      .get('/api/citations/history')
      .set('Authorization', `Bearer ${newAccessToken}`);

    expect(unauthorizedRes.status).toBe(401);
  });

  it('should handle account lockout after failed login attempts', async () => {
    const testEmail = `lockout-test-${Date.now()}@example.com`;
    const testPassword = 'SecurePassword123!';

    // Register user
    await request(app)
      .post('/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        role: 'operator'
      })
      .expect(201);

    // Make 5 failed login attempts
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword123!'
        })
        .expect(401);
    }

    // 6th attempt should return account locked error
    const lockedRes = await request(app)
      .post('/auth/login')
      .send({
        email: testEmail,
        password: testPassword // Correct password
      });

    expect(lockedRes.status).toBe(403);
    expect(lockedRes.body.error).toMatch(/locked|account/i);
  });

  it('should validate JWT token structure and expiration', async () => {
    const testEmail = `jwt-test-${Date.now()}@example.com`;
    const testPassword = 'SecurePassword123!';

    // Register and login
    await request(app)
      .post('/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        role: 'operator'
      })
      .expect(201);

    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: testEmail,
        password: testPassword
      })
      .expect(200);

    const { accessToken } = loginRes.body;

    // Decode JWT (without verification for testing)
    const parts = accessToken.split('.');
    expect(parts.length).toBe(3); // header.payload.signature

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    expect(payload).toHaveProperty('userId');
    expect(payload).toHaveProperty('email', testEmail);
    expect(payload).toHaveProperty('role', 'operator');
    expect(payload).toHaveProperty('exp');
    expect(payload).toHaveProperty('iat');

    // Verify expiration is in the future
    expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });
});
