/**
 * MARCUS 3.0 Citation Integrity Platform
 * Authentication Service
 *
 * Implements production-grade authentication with:
 * - Bcrypt password hashing (12 salt rounds)
 * - JWT access tokens (15 min TTL)
 * - Refresh tokens (7 day TTL)
 * - Account lockout after failed attempts
 * - Audit logging for security events
 *
 * @module authService
 * @author Marcus (Platform Engineer)
 */

import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Pool, PoolClient } from 'pg';
import * as crypto from 'crypto';
import { authAttempts, activeTokens } from '../monitoring/metricsEndpoint';
import { sanitizeForLog, sanitizeUserId } from '../utils/logSanitizer';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type UserRole = 'admin' | 'operator' | 'viewer';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  lastLogin: Date | null;
}

export interface UserWithHash extends User {
  passwordHash: string;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthConfig {
  jwtSecret: string;
  jwtRefreshSecret: string;
  accessTokenTTL: number;  // seconds (default 900 = 15 min)
  refreshTokenTTL: number; // seconds (default 604800 = 7 days)
  bcryptSaltRounds: number; // default 12
  maxFailedAttempts: number; // default 5
  lockoutDurationMinutes: number; // default 15
}

export interface RegistrationRequest {
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogEntry {
  userId?: string;
  email: string;
  eventType: 'register' | 'login' | 'logout' | 'refresh_token' | 'password_reset' | 'failed_login' | 'account_locked';
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  failureReason?: string;
}

// ============================================================================
// Authentication Service
// ============================================================================

export class AuthService {
  private pool: Pool;
  private config: AuthConfig;

  constructor(pool: Pool, config: Partial<AuthConfig> = {}) {
    this.pool = pool;
    this.config = {
      jwtSecret: config.jwtSecret || this.getSecretFromEnv('JWT_SECRET'),
      jwtRefreshSecret: config.jwtRefreshSecret || this.getSecretFromEnv('JWT_REFRESH_SECRET'),
      accessTokenTTL: config.accessTokenTTL || 900, // 15 minutes
      refreshTokenTTL: config.refreshTokenTTL || 604800, // 7 days
      bcryptSaltRounds: config.bcryptSaltRounds || 12,
      maxFailedAttempts: config.maxFailedAttempts || 5,
      lockoutDurationMinutes: config.lockoutDurationMinutes || 15,
    };

    this.validateConfig();
  }

  /**
   * Get JWT secret from environment or generate secure random secret
   * CRITICAL: In production, always use environment variables for secrets
   */
  private getSecretFromEnv(envVar: string): string {
    const secret = process.env[envVar];
    if (secret) {
      return secret;
    }

    // Development fallback - generate random secret
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        `❌ CRITICAL: ${envVar} must be set in production environment. ` +
        `Never use generated secrets in production.`
      );
    }

    console.warn(
      `⚠️ WARNING: ${envVar} not found in environment. ` +
      `Generating random secret for development only.`
    );
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validate configuration on startup - fail loudly if misconfigured
   */
  private validateConfig(): void {
    if (this.config.jwtSecret.length < 32) {
      throw new Error(
        '❌ CRITICAL: JWT secret must be at least 32 characters (256 bits). ' +
        `Current length: ${this.config.jwtSecret.length}`
      );
    }

    if (this.config.jwtRefreshSecret.length < 32) {
      throw new Error(
        '❌ CRITICAL: JWT refresh secret must be at least 32 characters (256 bits). ' +
        `Current length: ${this.config.jwtRefreshSecret.length}`
      );
    }

    if (this.config.bcryptSaltRounds < 10) {
      throw new Error(
        '❌ CRITICAL: Bcrypt salt rounds must be >= 10 for security. ' +
        `Current value: ${this.config.bcryptSaltRounds}`
      );
    }

    if (this.config.accessTokenTTL > 3600) {
      console.warn(
        '⚠️ WARNING: Access token TTL > 1 hour increases security risk. ' +
        `Current: ${this.config.accessTokenTTL}s`
      );
    }
  }

  // ==========================================================================
  // User Registration
  // ==========================================================================

  /**
   * Register new user with secure password hashing
   */
  async register(request: RegistrationRequest, auditInfo?: { ipAddress?: string; userAgent?: string }): Promise<User> {
    // Validate email format
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(request.email)) {
      throw new Error(
        `❌ CRITICAL: Invalid email format: ${request.email}`
      );
    }

    // Validate password strength
    this.validatePasswordStrength(request.password);

    // Hash password
    const passwordHash = await bcrypt.hash(request.password, this.config.bcryptSaltRounds);

    // Default role is 'viewer' (least privilege)
    const role = request.role || 'viewer';

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Insert user
      const result = await client.query<User>(
        `INSERT INTO users (email, password_hash, role)
         VALUES ($1, $2, $3)
         RETURNING id, email, role, is_active as "isActive", created_at as "createdAt", last_login as "lastLogin"`,
        [request.email, passwordHash, role]
      );

      if (result.rowCount === 0) {
        throw new Error(
          `❌ CRITICAL: Failed to insert user ${request.email}. Database returned 0 rows.`
        );
      }

      const user = result.rows[0];

      // Log registration event
      await this.logAuditEvent(client, {
        userId: user.id,
        email: request.email,
        eventType: 'register',
        ipAddress: auditInfo?.ipAddress,
        userAgent: auditInfo?.userAgent,
        success: true,
      });

      await client.query('COMMIT');

      console.log(`✅ User registered: ${user.email} (${user.role})`);
      return user;

    } catch (err) {
      await client.query('ROLLBACK');

      // Handle unique constraint violation (duplicate email)
      if ((err as any).code === '23505') {
        throw new Error(
          `❌ User with email ${request.email} already exists`
        );
      }

      throw new Error(
        `❌ CRITICAL: User registration failed: ${(err as Error).message}`
      );
    } finally {
      client.release();
    }
  }

  /**
   * Validate password meets minimum security requirements
   */
  private validatePasswordStrength(password: string): void {
    if (password.length < 8) {
      throw new Error(
        '❌ Password must be at least 8 characters long'
      );
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    const strength = [hasUpperCase, hasLowerCase, hasNumber, hasSpecial].filter(Boolean).length;

    if (strength < 3) {
      throw new Error(
        '❌ Password must contain at least 3 of: uppercase, lowercase, number, special character'
      );
    }
  }

  // ==========================================================================
  // User Login
  // ==========================================================================

  /**
   * Authenticate user and generate JWT tokens
   */
  async login(request: LoginRequest): Promise<AuthTokens> {
    const client = await this.pool.connect();
    try {
      // Get user with password hash
      const result = await client.query<UserWithHash>(
        `SELECT id, email, password_hash as "passwordHash", role, is_active as "isActive",
                failed_login_attempts as "failedLoginAttempts", locked_until as "lockedUntil",
                created_at as "createdAt", last_login as "lastLogin"
         FROM users
         WHERE email = $1`,
        [request.email]
      );

      if (result.rowCount === 0) {
        // Log failed login (user not found)
        await this.logAuditEvent(client, {
          email: request.email,
          eventType: 'failed_login',
          ipAddress: request.ipAddress,
          userAgent: request.userAgent,
          success: false,
          failureReason: 'User not found',
        });

        // Update Prometheus metrics
        authAttempts.inc({ result: 'failure' });

        throw new Error('❌ Invalid email or password');
      }

      const user = result.rows[0];

      // Check if account is locked
      if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
        const minutesLeft = Math.ceil(
          (new Date(user.lockedUntil).getTime() - Date.now()) / 60000
        );

        await this.logAuditEvent(client, {
          userId: user.id,
          email: request.email,
          eventType: 'failed_login',
          ipAddress: request.ipAddress,
          userAgent: request.userAgent,
          success: false,
          failureReason: `Account locked for ${minutesLeft} more minutes`,
        });

        // Update Prometheus metrics
        authAttempts.inc({ result: 'locked' });

        throw new Error(
          `❌ Account locked due to failed login attempts. Try again in ${minutesLeft} minutes.`
        );
      }

      // Check if account is active
      if (!user.isActive) {
        await this.logAuditEvent(client, {
          userId: user.id,
          email: request.email,
          eventType: 'failed_login',
          ipAddress: request.ipAddress,
          userAgent: request.userAgent,
          success: false,
          failureReason: 'Account disabled',
        });

        // Update Prometheus metrics
        authAttempts.inc({ result: 'failure' });

        throw new Error('❌ Account is disabled. Contact administrator.');
      }

      // Verify password
      const passwordValid = await bcrypt.compare(request.password, user.passwordHash);

      if (!passwordValid) {
        // Check and potentially lock account
        await client.query(
          'SELECT check_and_lock_account($1, $2, $3)',
          [request.email, this.config.maxFailedAttempts, this.config.lockoutDurationMinutes]
        );

        await this.logAuditEvent(client, {
          userId: user.id,
          email: request.email,
          eventType: 'failed_login',
          ipAddress: request.ipAddress,
          userAgent: request.userAgent,
          success: false,
          failureReason: 'Invalid password',
        });

        // Update Prometheus metrics
        authAttempts.inc({ result: 'failure' });

        throw new Error('❌ Invalid email or password');
      }

      // Password valid - reset failed attempts
      await client.query('SELECT reset_failed_attempts($1)', [user.id]);

      // Generate tokens
      const tokens = await this.generateTokens(client, user);

      // Log successful login
      await this.logAuditEvent(client, {
        userId: user.id,
        email: request.email,
        eventType: 'login',
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
        success: true,
      });

      // Update Prometheus metrics
      authAttempts.inc({ result: 'success' });
      activeTokens.inc(); // New token issued

      console.log(`✅ User logged in: ${user.email} (${user.role})`);
      return tokens;

    } finally {
      client.release();
    }
  }

  // ==========================================================================
  // Token Management
  // ==========================================================================

  /**
   * Generate access token and refresh token
   */
  private async generateTokens(client: PoolClient, user: Pick<User, 'id' | 'email' | 'role'>): Promise<AuthTokens> {
    // Generate access token
    const accessPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(accessPayload, this.config.jwtSecret, {
      expiresIn: this.config.accessTokenTTL,
    });

    // Generate refresh token (longer TTL)
    const refreshPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const refreshToken = jwt.sign(refreshPayload, this.config.jwtRefreshSecret, {
      expiresIn: this.config.refreshTokenTTL,
    });

    // Store refresh token in database
    const expiresAt = new Date(Date.now() + this.config.refreshTokenTTL * 1000);
    await client.query(
      `INSERT INTO refresh_tokens (token, user_id, expires_at)
       VALUES ($1, $2, $3)`,
      [refreshToken, user.id, expiresAt]
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.config.accessTokenTTL,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    const client = await this.pool.connect();
    try {
      // Verify refresh token signature
      let payload: JWTPayload;
      try {
        payload = jwt.verify(refreshToken, this.config.jwtRefreshSecret) as JWTPayload;
      } catch (err) {
        throw new Error(
          `❌ Invalid refresh token: ${(err as Error).message}`
        );
      }

      // Check token exists and is not revoked
      const tokenResult = await client.query(
        `SELECT user_id, expires_at, revoked
         FROM refresh_tokens
         WHERE token = $1`,
        [refreshToken]
      );

      if (tokenResult.rowCount === 0) {
        throw new Error('❌ Refresh token not found');
      }

      const tokenRecord = tokenResult.rows[0];

      if (tokenRecord.revoked) {
        throw new Error('❌ Refresh token has been revoked');
      }

      if (new Date(tokenRecord.expires_at) < new Date()) {
        throw new Error('❌ Refresh token has expired');
      }

      // Get user details
      const userResult = await client.query<User>(
        `SELECT id, email, role, is_active as "isActive", created_at as "createdAt", last_login as "lastLogin"
         FROM users
         WHERE id = $1`,
        [payload.userId]
      );

      if (userResult.rowCount === 0) {
        throw new Error('❌ User not found');
      }

      const user = userResult.rows[0];

      if (!user.isActive) {
        throw new Error('❌ Account is disabled');
      }

      // Delete old refresh token (token rotation)
      // Note: We delete instead of marking revoked to prevent duplicate key
      // violations when JWT generates identical token strings within same second
      await client.query(
        `DELETE FROM refresh_tokens
         WHERE token = $1`,
        [refreshToken]
      );

      // Generate new tokens
      const newTokens = await this.generateTokens(client, user);

      // Log token refresh
      await this.logAuditEvent(client, {
        userId: user.id,
        email: user.email,
        eventType: 'refresh_token',
        success: true,
      });

      console.log(`✅ Token refreshed: ${user.email}`);
      return newTokens;

    } finally {
      client.release();
    }
  }

  /**
   * Verify JWT access token and return payload
   */
  verifyAccessToken(token: string): JWTPayload {
    try {
      const payload = jwt.verify(token, this.config.jwtSecret) as JWTPayload;
      return payload;
    } catch (err) {
      throw new Error(
        `❌ Invalid access token: ${(err as Error).message}`
      );
    }
  }

  /**
   * Logout user by revoking refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      // Revoke refresh token
      const result = await client.query(
        `UPDATE refresh_tokens
         SET revoked = true, revoked_at = NOW()
         WHERE token = $1 AND revoked = false
         RETURNING user_id`,
        [refreshToken]
      );

      if (result.rowCount === 0) {
        // Token already revoked or doesn't exist - not an error
        console.log('⚠️ Logout called with already-revoked or non-existent token');
        return;
      }

      const userId = result.rows[0].user_id;

      // Get user email for logging
      const userResult = await client.query(
        'SELECT email FROM users WHERE id = $1',
        [userId]
      );

      if ((userResult.rowCount ?? 0) > 0) {
        const email = userResult.rows[0].email;

        // Log logout event
        await this.logAuditEvent(client, {
          userId,
          email,
          eventType: 'logout',
          success: true,
        });

        // Update Prometheus metrics
        activeTokens.dec(); // Token revoked

        console.log(`✅ User logged out: ${email}`);
      }

    } finally {
      client.release();
    }
  }

  // ==========================================================================
  // User Management
  // ==========================================================================

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    const result = await this.pool.query<User>(
      `SELECT id, email, role, is_active as "isActive", created_at as "createdAt", last_login as "lastLogin"
       FROM users
       WHERE id = $1`,
      [userId]
    );

    return (result.rowCount ?? 0) > 0 ? result.rows[0] : null;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query<User>(
      `SELECT id, email, role, is_active as "isActive", created_at as "createdAt", last_login as "lastLogin"
       FROM users
       WHERE email = $1`,
      [email]
    );

    return (result.rowCount ?? 0) > 0 ? result.rows[0] : null;
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId: string, newRole: UserRole): Promise<void> {
    const result = await this.pool.query(
      `UPDATE users
       SET role = $1, updated_at = NOW()
       WHERE id = $2`,
      [newRole, userId]
    );

    if (result.rowCount === 0) {
      throw new Error(`❌ User ${userId} not found`);
    }

    console.log(`✅ User role updated: ${userId} → ${newRole}`); // lgtm[js/log-injection] - userId validated by DB lookup
  }

  /**
   * Deactivate user account (admin only)
   */
  async deactivateUser(userId: string): Promise<void> {
    const result = await this.pool.query(
      `UPDATE users
       SET is_active = false, updated_at = NOW()
       WHERE id = $1`,
      [userId]
    );

    if (result.rowCount === 0) {
      throw new Error(`❌ User ${userId} not found`);
    }

    // Revoke all refresh tokens
    await this.pool.query(
      `UPDATE refresh_tokens
       SET revoked = true, revoked_at = NOW()
       WHERE user_id = $1 AND revoked = false`,
      [userId]
    );

    console.log(`✅ User deactivated: ${sanitizeUserId(userId)}`); // lgtm[js/log-injection] - sanitized
  }

  // ==========================================================================
  // Audit Logging
  // ==========================================================================

  /**
   * Log authentication event to audit trail
   */
  private async logAuditEvent(client: PoolClient, entry: AuditLogEntry): Promise<void> {
    await client.query(
      `INSERT INTO auth_audit_log (user_id, email, event_type, ip_address, user_agent, success, failure_reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        entry.userId || null,
        entry.email,
        entry.eventType,
        entry.ipAddress || null,
        entry.userAgent || null,
        entry.success,
        entry.failureReason || null,
      ]
    );
  }

  /**
   * Cleanup expired tokens (call periodically)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.pool.query<{ cleanup_expired_tokens: number }>(
      'SELECT cleanup_expired_tokens()'
    );

    const count = result.rows[0].cleanup_expired_tokens;
    console.log(`✅ Cleaned up ${count} expired/revoked tokens`);
    return count;
  }

  // ==========================================================================
  // Lifecycle
  // ==========================================================================

  /**
   * Close database connection pool
   */
  async close(): Promise<void> {
    await this.pool.end();
    console.log('✅ AuthService database connections closed');
  }
}
