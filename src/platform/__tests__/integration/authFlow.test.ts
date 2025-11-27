/**
 * Integration Tests - Auth Flow
 *
 * Comprehensive tests for authentication endpoints including:
 * - User registration
 * - Login/logout
 * - JWT token generation and validation
 * - Token refresh
 * - RBAC (Role-Based Access Control)
 * - Account lockout after failed attempts
 *
 * **Requirements:**
 * - PostgreSQL server running on localhost:5432 with database 'marcus_test'
 * - Redis server running on localhost:6379
 * - Run: `sudo service postgresql start && sudo service redis-server start`
 *
 * @group integration
 */

import request from 'supertest';
import express, { Express } from 'express';
import { Pool } from 'pg';
import Redis from 'ioredis';
import { AuthService } from '../../auth/authService';
import { JWTMiddleware } from '../../auth/jwtMiddleware';
import { createAuthRoutes } from '../../api/authRoutes';
import { getTestConfiguration } from '../../config/platformConfig';

describe('Auth Flow Integration Tests', () => {
  let app: Express;
  let dbPool: Pool;
  let redisClient: Redis;
  let authService: AuthService;
  let jwtMiddleware: JWTMiddleware;

  // Test user data
  const testUser = {
    email: 'test@example.com',
    password: 'SecurePassword123!',
    role: 'operator'
  };

  const testAdmin = {
    email: 'admin@example.com',
    password: 'AdminPassword456!',
    role: 'admin'
  };

  beforeAll(async () => {
    // Get test configuration
    const config = getTestConfiguration();

    // Initialize database connection
    dbPool = new Pool({
      host: config.database.host,
      port: config.database.port,
      database: config.database.database,
      user: config.database.user,
      password: config.database.password,
      max: 5
    });

    // Initialize Redis connection
    redisClient = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      db: config.redis.db,
      password: config.redis.password,
      maxRetriesPerRequest: config.redis.maxRetriesPerRequest
    });

    // Drop existing tables (in case of previous test failures)
    await dbPool.query('DROP TABLE IF EXISTS auth_audit_log CASCADE');
    await dbPool.query('DROP TABLE IF EXISTS refresh_tokens CASCADE');
    await dbPool.query('DROP TABLE IF EXISTS users CASCADE');
    await dbPool.query('DROP FUNCTION IF EXISTS reset_failed_attempts(INTEGER) CASCADE');
    await dbPool.query('DROP FUNCTION IF EXISTS check_and_lock_account(VARCHAR, INTEGER, INTEGER) CASCADE');

    // Create database schema
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
      );

      CREATE TABLE IF NOT EXISTS refresh_tokens (
        token VARCHAR(500) PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        revoked BOOLEAN NOT NULL DEFAULT false,
        revoked_at TIMESTAMP,
        CONSTRAINT valid_expiry CHECK (expires_at > created_at)
      );

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
      );

      -- PostgreSQL functions required by AuthService
      CREATE OR REPLACE FUNCTION reset_failed_attempts(user_id_param INTEGER)
      RETURNS VOID AS $$
      BEGIN
        UPDATE users
        SET failed_login_attempts = 0,
            locked_until = NULL,
            last_login = NOW()
        WHERE id = user_id_param;
      END;
      $$ LANGUAGE plpgsql;

      CREATE OR REPLACE FUNCTION check_and_lock_account(
        user_email VARCHAR(255),
        max_attempts INTEGER DEFAULT 5,
        lockout_minutes INTEGER DEFAULT 15
      )
      RETURNS BOOLEAN AS $$
      DECLARE
        current_attempts INTEGER;
        user_id_val INTEGER;
      BEGIN
        -- Get user ID and failed attempts
        SELECT id, failed_login_attempts INTO user_id_val, current_attempts
        FROM users
        WHERE email = user_email;

        IF NOT FOUND THEN
          RETURN false;
        END IF;

        -- Increment failed attempts
        UPDATE users
        SET failed_login_attempts = failed_login_attempts + 1
        WHERE id = user_id_val;

        -- Check if we should lock the account
        IF current_attempts + 1 >= max_attempts THEN
          UPDATE users
          SET locked_until = NOW() + (lockout_minutes || ' minutes')::INTERVAL,
              failed_login_attempts = 0
          WHERE id = user_id_val;

          -- Log the lockout
          INSERT INTO auth_audit_log (user_id, email, event_type, success, failure_reason)
          VALUES (user_id_val, user_email, 'account_locked', false,
                  format('Account locked after %s failed login attempts', max_attempts));

          RETURN true;  -- Account locked
        END IF;

        RETURN false;  -- Not locked yet
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Initialize services
    authService = new AuthService(dbPool, redisClient, {
      jwtSecret: config.auth.jwtSecret,
      jwtRefreshSecret: config.auth.jwtRefreshSecret,
      accessTokenTTL: config.auth.accessTokenTTL,
      refreshTokenTTL: config.auth.refreshTokenTTL
    });

    jwtMiddleware = new JWTMiddleware(config.auth.jwtSecret);

    // Create Express app
    app = express();
    app.use(express.json());
    app.use('/auth', createAuthRoutes(authService, jwtMiddleware));
  });

  afterAll(async () => {
    // Clean up database (in reverse order of creation due to foreign keys)
    await dbPool.query('DROP TABLE IF EXISTS auth_audit_log CASCADE');
    await dbPool.query('DROP TABLE IF EXISTS refresh_tokens CASCADE');
    await dbPool.query('DROP TABLE IF EXISTS users CASCADE');
    await dbPool.query('DROP FUNCTION IF EXISTS reset_failed_attempts(INTEGER) CASCADE');
    await dbPool.query('DROP FUNCTION IF EXISTS check_and_lock_account(VARCHAR, INTEGER, INTEGER) CASCADE');

    await dbPool.end();
    await redisClient.quit();
  });

  beforeEach(async () => {
    // Clear test data before each test (in order that respects foreign keys)
    await dbPool.query('DELETE FROM auth_audit_log');
    await dbPool.query('DELETE FROM refresh_tokens');
    await dbPool.query('DELETE FROM users');
    await redisClient.flushdb();
  });

  describe('POST /auth/register', () => {
    it('should register a new user with valid data', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toMatchObject({
        message: 'User registered successfully',
        user: {
          email: testUser.email,
          role: testUser.role
        }
      });

      expect(response.body.user.id).toBeDefined();
      expect(response.body.user.createdAt).toBeDefined();
      expect(response.body.user.password).toBeUndefined(); // Password should not be returned
    });

    it('should reject registration with duplicate email', async () => {
      // Register first user
      await request(app)
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      // Try to register again with same email
      const response = await request(app)
        .post('/auth/register')
        .send(testUser)
        .expect(409);

      expect(response.body).toMatchObject({
        error: 'Conflict',
        message: expect.stringContaining('already exists')
      });
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'SecurePassword123!',
          role: 'viewer'
        })
        .expect(400);

      expect(response.body.error).toBe('Bad Request');
    });

    it('should enforce password requirements', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'weak',
          role: 'viewer'
        })
        .expect(400);

      expect(response.body.message).toContain('Password must');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Register test user before each login test
      await request(app)
        .post('/auth/register')
        .send(testUser);
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Login successful',
        tokenType: 'Bearer'
      });

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.expiresIn).toBeDefined();
    });

    it('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!'
        })
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Unauthorized',
        message: 'Invalid email or password'
      });
    });

    it('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!'
        })
        .expect(401);

      expect(response.body.message).toContain('Invalid email or password');
    });

    it('should lock account after 5 failed login attempts', async () => {
      // Attempt login 5 times with wrong password
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/auth/login')
          .send({
            email: testUser.email,
            password: 'WrongPassword123!'
          })
          .expect(401);
      }

      // 6th attempt should return account locked
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!'
        })
        .expect(403);

      expect(response.body.error).toBe('Forbidden');
      expect(response.body.message).toContain('Account locked');
    });

    it('should not allow login with correct password after account lockout', async () => {
      // Lock the account
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/auth/login')
          .send({
            email: testUser.email,
            password: 'WrongPassword123!'
          });
      }

      // Try with correct password - should still be locked
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(403);

      expect(response.body.message).toContain('Account locked');
    });
  });

  describe('JWT Token Validation', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Register and login to get token
      await request(app)
        .post('/auth/register')
        .send(testUser);

      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      accessToken = loginResponse.body.accessToken;
    });

    it('should generate valid JWT access token', () => {
      expect(accessToken).toBeDefined();
      expect(accessToken.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should decode JWT token with correct payload', () => {
      const payload = JSON.parse(
        Buffer.from(accessToken.split('.')[1], 'base64').toString()
      );

      expect(payload.email).toBe(testUser.email);
      expect(payload.role).toBe(testUser.role);
      expect(payload.exp).toBeDefined();
      expect(payload.iat).toBeDefined();
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Register and login to get refresh token
      await request(app)
        .post('/auth/register')
        .send(testUser);

      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      refreshToken = loginResponse.body.refreshToken;
    });

    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.accessToken).not.toBe(refreshToken);
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('RBAC - Role-Based Access Control', () => {
    it('should assign viewer role by default', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'viewer@example.com',
          password: 'ViewerPassword123!'
        })
        .expect(201);

      expect(response.body.user.role).toBe('viewer');
    });

    it('should allow operator role assignment', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          ...testUser,
          role: 'operator'
        })
        .expect(201);

      expect(response.body.user.role).toBe('operator');
    });

    it('should allow admin role assignment', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          ...testAdmin,
          role: 'admin'
        })
        .expect(201);

      expect(response.body.user.role).toBe('admin');
    });

    it('should include role in JWT token payload', async () => {
      // Register and login
      await request(app)
        .post('/auth/register')
        .send(testAdmin);

      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: testAdmin.email,
          password: testAdmin.password
        });

      const accessToken = loginResponse.body.accessToken;
      const payload = JSON.parse(
        Buffer.from(accessToken.split('.')[1], 'base64').toString()
      );

      expect(payload.role).toBe('admin');
    });
  });

  describe('Password Hashing', () => {
    it('should hash password with bcrypt', async () => {
      await request(app)
        .post('/auth/register')
        .send(testUser);

      // Query database directly to check hashed password
      const result = await dbPool.query(
        'SELECT password_hash FROM users WHERE email = $1',
        [testUser.email]
      );

      const passwordHash = result.rows[0].password_hash;

      // Bcrypt hash should be 60 characters
      expect(passwordHash).toBeDefined();
      expect(passwordHash.length).toBe(60);
      expect(passwordHash).toMatch(/^\$2[aby]\$/); // Bcrypt prefix
      expect(passwordHash).not.toBe(testUser.password); // Should not store plaintext
    });
  });
});
