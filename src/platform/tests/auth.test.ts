/**
 * MARCUS 3.0 Citation Integrity Platform
 * Authentication Tests
 *
 * Comprehensive tests for authentication and authorization
 *
 * @module auth.test
 * @author Marcus (Platform Engineer)
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { Pool } from 'pg';
import { AuthService } from '../auth/authService';

// ============================================================================
// Test Configuration
// ============================================================================

const TEST_DB_CONFIG = {
  host: process.env.TEST_DB_HOST || 'localhost',
  port: parseInt(process.env.TEST_DB_PORT || '5432', 10),
  database: process.env.TEST_DB_NAME || 'marcus_platform_test',
  user: process.env.TEST_DB_USER || 'postgres',
  password: process.env.TEST_DB_PASSWORD || '',
  max: 5,
};

const TEST_AUTH_CONFIG = {
  jwtSecret: 'test_jwt_secret_at_least_32_characters_long',
  jwtRefreshSecret: 'test_refresh_secret_at_least_32_characters_long',
  accessTokenTTL: 900,
  refreshTokenTTL: 604800,
  bcryptSaltRounds: 10, // Lower for faster tests
  maxFailedAttempts: 3, // Lower for faster tests
  lockoutDurationMinutes: 1,
};

// ============================================================================
// Test Utilities
// ============================================================================

async function setupTestDatabase(pool: Pool): Promise<void> {
  // Drop and recreate tables for clean test state
  await pool.query('DROP TABLE IF EXISTS auth_audit_log CASCADE');
  await pool.query('DROP TABLE IF EXISTS refresh_tokens CASCADE');
  await pool.query('DROP TABLE IF EXISTS users CASCADE');

  // Create tables (simplified for tests)
  await pool.query(`
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT true,
      failed_login_attempts INTEGER NOT NULL DEFAULT 0,
      locked_until TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      last_login TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE refresh_tokens (
      token VARCHAR(500) PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      revoked BOOLEAN NOT NULL DEFAULT false,
      revoked_at TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE auth_audit_log (
      id SERIAL PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      email VARCHAR(255),
      event_type VARCHAR(50) NOT NULL,
      ip_address INET,
      user_agent TEXT,
      success BOOLEAN NOT NULL,
      failure_reason TEXT,
      timestamp TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  // Create stored functions
  await pool.query(`
    CREATE OR REPLACE FUNCTION check_and_lock_account(
      user_email VARCHAR(255),
      max_attempts INTEGER DEFAULT 5,
      lockout_minutes INTEGER DEFAULT 15
    )
    RETURNS BOOLEAN AS $$
    DECLARE
      current_attempts INTEGER;
      user_uuid UUID;
    BEGIN
      SELECT id, failed_login_attempts INTO user_uuid, current_attempts
      FROM users
      WHERE email = user_email;

      IF NOT FOUND THEN
        RETURN false;
      END IF;

      UPDATE users
      SET failed_login_attempts = failed_login_attempts + 1
      WHERE id = user_uuid;

      IF current_attempts + 1 >= max_attempts THEN
        UPDATE users
        SET locked_until = NOW() + (lockout_minutes || ' minutes')::INTERVAL,
            failed_login_attempts = 0
        WHERE id = user_uuid;

        RETURN true;
      END IF;

      RETURN false;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await pool.query(`
    CREATE OR REPLACE FUNCTION reset_failed_attempts(user_uuid UUID)
    RETURNS VOID AS $$
    BEGIN
      UPDATE users
      SET failed_login_attempts = 0,
          locked_until = NULL,
          last_login = NOW()
      WHERE id = user_uuid;
    END;
    $$ LANGUAGE plpgsql;
  `);
}

async function cleanupTestDatabase(pool: Pool): Promise<void> {
  await pool.query('DROP TABLE IF EXISTS auth_audit_log CASCADE');
  await pool.query('DROP TABLE IF EXISTS refresh_tokens CASCADE');
  await pool.query('DROP TABLE IF EXISTS users CASCADE');
  await pool.query('DROP FUNCTION IF EXISTS check_and_lock_account');
  await pool.query('DROP FUNCTION IF EXISTS reset_failed_attempts');
}

// ============================================================================
// Tests
// ============================================================================

describe('AuthService', () => {
  let pool: Pool;
  let authService: AuthService;

  before(async () => {
    pool = new Pool(TEST_DB_CONFIG);
    await setupTestDatabase(pool);
    authService = new AuthService(pool, TEST_AUTH_CONFIG);
  });

  after(async () => {
    await cleanupTestDatabase(pool);
    await authService.close();
  });

  // ==========================================================================
  // User Registration Tests
  // ==========================================================================

  describe('User Registration', () => {
    it('should register new user with valid credentials', async () => {
      const user = await authService.register({
        email: 'test@example.com',
        password: 'SecurePass123!',
      });

      assert.strictEqual(user.email, 'test@example.com');
      assert.strictEqual(user.role, 'viewer'); // default role
      assert.strictEqual(user.isActive, true);
      assert.ok(user.id);
    });

    it('should register user with specific role', async () => {
      const user = await authService.register({
        email: 'admin@example.com',
        password: 'SecurePass123!',
        role: 'admin',
      });

      assert.strictEqual(user.role, 'admin');
    });

    it('should reject duplicate email', async () => {
      await authService.register({
        email: 'duplicate@example.com',
        password: 'SecurePass123!',
      });

      await assert.rejects(
        async () => {
          await authService.register({
            email: 'duplicate@example.com',
            password: 'AnotherPass123!',
          });
        },
        /already exists/
      );
    });

    it('should reject weak password', async () => {
      await assert.rejects(
        async () => {
          await authService.register({
            email: 'weak@example.com',
            password: 'short',
          });
        },
        /Password must be at least 8 characters/
      );
    });

    it('should reject password without complexity', async () => {
      await assert.rejects(
        async () => {
          await authService.register({
            email: 'simple@example.com',
            password: 'alllowercase',
          });
        },
        /Password must contain at least 3 of/
      );
    });

    it('should reject invalid email format', async () => {
      await assert.rejects(
        async () => {
          await authService.register({
            email: 'not-an-email',
            password: 'SecurePass123!',
          });
        },
        /Invalid email format/
      );
    });
  });

  // ==========================================================================
  // User Login Tests
  // ==========================================================================

  describe('User Login', () => {
    before(async () => {
      // Create test user
      await authService.register({
        email: 'login-test@example.com',
        password: 'SecurePass123!',
        role: 'operator',
      });
    });

    it('should login with valid credentials', async () => {
      const tokens = await authService.login({
        email: 'login-test@example.com',
        password: 'SecurePass123!',
      });

      assert.ok(tokens.accessToken);
      assert.ok(tokens.refreshToken);
      assert.strictEqual(tokens.expiresIn, 900);
    });

    it('should reject invalid password', async () => {
      await assert.rejects(
        async () => {
          await authService.login({
            email: 'login-test@example.com',
            password: 'WrongPassword123!',
          });
        },
        /Invalid email or password/
      );
    });

    it('should reject non-existent user', async () => {
      await assert.rejects(
        async () => {
          await authService.login({
            email: 'nonexistent@example.com',
            password: 'SecurePass123!',
          });
        },
        /Invalid email or password/
      );
    });

    it('should lock account after failed attempts', async () => {
      const email = 'lockout-test@example.com';
      await authService.register({
        email,
        password: 'SecurePass123!',
      });

      // Attempt failed logins (max 3 in test config)
      for (let i = 0; i < 3; i++) {
        await assert.rejects(
          async () => {
            await authService.login({
              email,
              password: 'WrongPassword!',
            });
          },
          /Invalid email or password/
        );
      }

      // Next attempt should fail with account locked
      await assert.rejects(
        async () => {
          await authService.login({
            email,
            password: 'SecurePass123!', // Even with correct password
          });
        },
        /Account locked/
      );
    });

    it('should verify JWT payload contains user info', async () => {
      const tokens = await authService.login({
        email: 'login-test@example.com',
        password: 'SecurePass123!',
      });

      const payload = authService.verifyAccessToken(tokens.accessToken);

      assert.strictEqual(payload.email, 'login-test@example.com');
      assert.strictEqual(payload.role, 'operator');
      assert.ok(payload.userId);
      assert.ok(payload.exp);
    });
  });

  // ==========================================================================
  // Token Refresh Tests
  // ==========================================================================

  describe('Token Refresh', () => {
    let refreshToken: string;

    before(async () => {
      await authService.register({
        email: 'refresh-test@example.com',
        password: 'SecurePass123!',
      });

      const tokens = await authService.login({
        email: 'refresh-test@example.com',
        password: 'SecurePass123!',
      });

      refreshToken = tokens.refreshToken;
    });

    it('should refresh access token with valid refresh token', async () => {
      const newTokens = await authService.refreshAccessToken(refreshToken);

      assert.ok(newTokens.accessToken);
      assert.ok(newTokens.refreshToken);
      assert.notStrictEqual(newTokens.refreshToken, refreshToken); // Token rotation
    });

    it('should reject invalid refresh token', async () => {
      await assert.rejects(
        async () => {
          await authService.refreshAccessToken('invalid-token');
        },
        /Invalid refresh token/
      );
    });

    it('should reject revoked refresh token', async () => {
      const tokens = await authService.login({
        email: 'refresh-test@example.com',
        password: 'SecurePass123!',
      });

      // Revoke token by logging out
      await authService.logout(tokens.refreshToken);

      // Try to use revoked token
      await assert.rejects(
        async () => {
          await authService.refreshAccessToken(tokens.refreshToken);
        },
        /revoked/
      );
    });
  });

  // ==========================================================================
  // User Management Tests
  // ==========================================================================

  describe('User Management', () => {
    let userId: string;

    before(async () => {
      const user = await authService.register({
        email: 'manage-test@example.com',
        password: 'SecurePass123!',
      });
      userId = user.id;
    });

    it('should get user by ID', async () => {
      const user = await authService.getUserById(userId);

      assert.ok(user);
      assert.strictEqual(user.email, 'manage-test@example.com');
    });

    it('should get user by email', async () => {
      const user = await authService.getUserByEmail('manage-test@example.com');

      assert.ok(user);
      assert.strictEqual(user.id, userId);
    });

    it('should update user role', async () => {
      await authService.updateUserRole(userId, 'admin');

      const user = await authService.getUserById(userId);
      assert.strictEqual(user?.role, 'admin');
    });

    it('should deactivate user', async () => {
      await authService.deactivateUser(userId);

      const user = await authService.getUserById(userId);
      assert.strictEqual(user?.isActive, false);
    });

    it('should prevent login for deactivated user', async () => {
      await assert.rejects(
        async () => {
          await authService.login({
            email: 'manage-test@example.com',
            password: 'SecurePass123!',
          });
        },
        /Account is disabled/
      );
    });
  });

  // ==========================================================================
  // Security Tests
  // ==========================================================================

  describe('Security', () => {
    it('should hash passwords with bcrypt', async () => {
      const user = await authService.register({
        email: 'hash-test@example.com',
        password: 'SecurePass123!',
      });

      // Verify password is not stored in plain text
      const result = await pool.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [user.id]
      );

      const hash = result.rows[0].password_hash;
      assert.ok(hash.startsWith('$2b$')); // bcrypt format
      assert.notStrictEqual(hash, 'SecurePass123!');
    });

    it('should create audit log entries', async () => {
      await authService.register({
        email: 'audit-test@example.com',
        password: 'SecurePass123!',
      });

      const result = await pool.query(
        'SELECT * FROM auth_audit_log WHERE email = $1',
        ['audit-test@example.com']
      );

      assert.ok(result.rowCount > 0);
      assert.strictEqual(result.rows[0].event_type, 'register');
      assert.strictEqual(result.rows[0].success, true);
    });

    it('should reject JWT with wrong signature', async () => {
      const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6ImZha2VAZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4ifQ.fake_signature';

      assert.throws(
        () => {
          authService.verifyAccessToken(fakeToken);
        },
        /Invalid access token/
      );
    });
  });
});
