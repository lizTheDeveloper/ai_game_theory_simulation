/**
 * MARCUS 3.0 Citation Integrity Platform
 * Enhanced Session Management
 *
 * Implements OWASP session security:
 * - Session timeout (30 minutes inactivity)
 * - Absolute timeout (24 hours)
 * - Session invalidation on logout
 * - Concurrent session limits (5 max per user)
 * - Secure cookie flags (httpOnly, secure, sameSite)
 * - Session fixation prevention
 * - CSRF token generation and validation
 *
 * @module sessionManager
 * @author Marcus (Platform Engineer)
 */

import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import * as crypto from 'crypto';
import Redis from 'ioredis';
import { sanitizeForLog } from '../utils/logSanitizer';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface SessionConfig {
  /**
   * Inactivity timeout (seconds)
   * Default: 1800 (30 minutes)
   */
  inactivityTimeout?: number;

  /**
   * Absolute timeout (seconds)
   * Default: 86400 (24 hours)
   */
  absoluteTimeout?: number;

  /**
   * Maximum concurrent sessions per user
   * Default: 5
   */
  maxConcurrentSessions?: number;

  /**
   * Enable CSRF protection
   * Default: true
   */
  enableCSRF?: boolean;

  /**
   * Cookie name for CSRF token
   * Default: 'XSRF-TOKEN'
   */
  csrfCookieName?: string;

  /**
   * Header name for CSRF token
   * Default: 'X-CSRF-Token'
   */
  csrfHeaderName?: string;
}

export interface Session {
  sessionId: string;
  userId: string;
  email: string;
  role: string;
  createdAt: Date;
  lastActivityAt: Date;
  ipAddress: string;
  userAgent: string;
  csrfToken?: string;
}

// ============================================================================
// Session Manager
// ============================================================================

export class SessionManager {
  private redis: Redis;
  private pool: Pool;
  private config: Required<SessionConfig>;

  constructor(redis: Redis, pool: Pool, config: SessionConfig = {}) {
    this.redis = redis;
    this.pool = pool;
    this.config = {
      inactivityTimeout: config.inactivityTimeout || 1800, // 30 minutes
      absoluteTimeout: config.absoluteTimeout || 86400, // 24 hours
      maxConcurrentSessions: config.maxConcurrentSessions || 5,
      enableCSRF: config.enableCSRF !== false,
      csrfCookieName: config.csrfCookieName || 'XSRF-TOKEN',
      csrfHeaderName: config.csrfHeaderName || 'X-CSRF-Token',
    };
  }

  // ==========================================================================
  // Session Creation & Validation
  // ==========================================================================

  /**
   * Create new session for authenticated user
   */
  async createSession(userId: string, email: string, role: string, ipAddress: string, userAgent: string): Promise<Session> {
    // Generate unique session ID
    const sessionId = this.generateSessionId();

    // Generate CSRF token
    const csrfToken = this.config.enableCSRF ? this.generateCSRFToken() : undefined;

    const now = new Date();
    const session: Session = {
      sessionId,
      userId,
      email,
      role,
      createdAt: now,
      lastActivityAt: now,
      ipAddress,
      userAgent,
      csrfToken,
    };

    // Check concurrent session limit
    await this.enforceConcurrentSessionLimit(userId);

    // Store session in Redis
    const sessionKey = this.getSessionKey(sessionId);
    await this.redis.setex(
      sessionKey,
      this.config.absoluteTimeout,
      JSON.stringify(session)
    );

    // Add to user's active sessions set
    const userSessionsKey = this.getUserSessionsKey(userId);
    await this.redis.sadd(userSessionsKey, sessionId);
    await this.redis.expire(userSessionsKey, this.config.absoluteTimeout);

    // Persist session to database for audit trail
    await this.pool.query(
      `INSERT INTO sessions (session_id, user_id, ip_address, user_agent, created_at, last_activity_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [sessionId, userId, ipAddress, userAgent, now, now]
    );

    console.log(`✅ Session created: ${sessionId} (user: ${email})`);
    return session;
  }

  /**
   * Validate and refresh session
   */
  async validateSession(sessionId: string): Promise<Session | null> {
    const sessionKey = this.getSessionKey(sessionId);
    const sessionData = await this.redis.get(sessionKey);

    if (!sessionData) {
      // Session not found or expired
      return null;
    }

    const session: Session = JSON.parse(sessionData);
    const now = new Date();

    // Check absolute timeout
    const sessionAge = now.getTime() - new Date(session.createdAt).getTime();
    if (sessionAge > this.config.absoluteTimeout * 1000) {
      await this.destroySession(sessionId);
      console.warn(`⚠️ Session expired (absolute timeout): ${sanitizeForLog(sessionId)}`); // lgtm[js/log-injection] - sanitized
      return null;
    }

    // Check inactivity timeout
    const inactiveDuration = now.getTime() - new Date(session.lastActivityAt).getTime();
    if (inactiveDuration > this.config.inactivityTimeout * 1000) {
      await this.destroySession(sessionId);
      console.warn(`⚠️ Session expired (inactivity): ${sanitizeForLog(sessionId)}`); // lgtm[js/log-injection] - sanitized
      return null;
    }

    // Update last activity timestamp
    session.lastActivityAt = now;
    await this.redis.setex(
      sessionKey,
      this.config.absoluteTimeout,
      JSON.stringify(session)
    );

    // Update database
    await this.pool.query(
      'UPDATE sessions SET last_activity_at = $1 WHERE session_id = $2',
      [now, sessionId]
    );

    return session;
  }

  /**
   * Destroy session (logout)
   */
  async destroySession(sessionId: string): Promise<void> {
    // Get session to find user ID
    const sessionKey = this.getSessionKey(sessionId);
    const sessionData = await this.redis.get(sessionKey);

    if (sessionData) {
      const session: Session = JSON.parse(sessionData);

      // Remove from user's active sessions
      const userSessionsKey = this.getUserSessionsKey(session.userId);
      await this.redis.srem(userSessionsKey, sessionId);
    }

    // Delete session from Redis
    await this.redis.del(sessionKey);

    // Mark session as ended in database
    await this.pool.query(
      'UPDATE sessions SET ended_at = NOW() WHERE session_id = $1 AND ended_at IS NULL',
      [sessionId]
    );

    console.log(`✅ Session destroyed: ${sanitizeForLog(sessionId)}`); // lgtm[js/log-injection] - sanitized
  }

  /**
   * Destroy all sessions for a user
   */
  async destroyAllUserSessions(userId: string): Promise<number> {
    const userSessionsKey = this.getUserSessionsKey(userId);
    const sessionIds = await this.redis.smembers(userSessionsKey);

    // Destroy each session
    for (const sessionId of sessionIds) {
      await this.destroySession(sessionId);
    }

    // Clear the set
    await this.redis.del(userSessionsKey);

    console.log(`✅ Destroyed ${sessionIds.length} sessions for user ${userId}`);
    return sessionIds.length;
  }

  // ==========================================================================
  // Concurrent Session Management
  // ==========================================================================

  /**
   * Enforce concurrent session limit
   */
  private async enforceConcurrentSessionLimit(userId: string): Promise<void> {
    const userSessionsKey = this.getUserSessionsKey(userId);
    const activeSessions = await this.redis.smembers(userSessionsKey);

    // If at limit, destroy oldest session
    if (activeSessions.length >= this.config.maxConcurrentSessions) {
      // Get oldest session by checking last activity
      let oldestSessionId = activeSessions[0];
      let oldestActivity = Date.now();

      for (const sessionId of activeSessions) {
        const sessionKey = this.getSessionKey(sessionId);
        const sessionData = await this.redis.get(sessionKey);
        if (sessionData) {
          const session: Session = JSON.parse(sessionData);
          const lastActivity = new Date(session.lastActivityAt).getTime();
          if (lastActivity < oldestActivity) {
            oldestActivity = lastActivity;
            oldestSessionId = sessionId;
          }
        }
      }

      // Destroy oldest session
      console.warn(
        `⚠️ User ${userId} exceeded concurrent session limit (${this.config.maxConcurrentSessions}). ` +
        `Destroying oldest session: ${oldestSessionId}`
      );
      await this.destroySession(oldestSessionId);
    }
  }

  /**
   * Get active session count for user
   */
  async getActiveSessionCount(userId: string): Promise<number> {
    const userSessionsKey = this.getUserSessionsKey(userId);
    return await this.redis.scard(userSessionsKey);
  }

  // ==========================================================================
  // CSRF Protection
  // ==========================================================================

  /**
   * Generate CSRF token
   */
  private generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validate CSRF token
   */
  validateCSRFToken(session: Session, providedToken: string): boolean {
    if (!this.config.enableCSRF) {
      return true; // CSRF disabled
    }

    if (!session.csrfToken || !providedToken) {
      return false;
    }

    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(session.csrfToken),
      Buffer.from(providedToken)
    );
  }

  /**
   * Regenerate CSRF token (after sensitive operations)
   */
  async regenerateCSRFToken(sessionId: string): Promise<string | null> {
    const session = await this.validateSession(sessionId);
    if (!session) {
      return null;
    }

    const newCSRFToken = this.generateCSRFToken();
    session.csrfToken = newCSRFToken;

    // Update session in Redis
    const sessionKey = this.getSessionKey(sessionId);
    await this.redis.setex(
      sessionKey,
      this.config.absoluteTimeout,
      JSON.stringify(session)
    );

    return newCSRFToken;
  }

  // ==========================================================================
  // Session Fixation Prevention
  // ==========================================================================

  /**
   * Regenerate session ID (after login to prevent fixation)
   */
  async regenerateSessionId(oldSessionId: string): Promise<string | null> {
    const session = await this.validateSession(oldSessionId);
    if (!session) {
      return null;
    }

    // Generate new session ID
    const newSessionId = this.generateSessionId();

    // Delete old session
    await this.redis.del(this.getSessionKey(oldSessionId));
    await this.redis.srem(this.getUserSessionsKey(session.userId), oldSessionId);

    // Create new session with same data
    session.sessionId = newSessionId;
    session.createdAt = new Date(); // Reset creation time

    const sessionKey = this.getSessionKey(newSessionId);
    await this.redis.setex(
      sessionKey,
      this.config.absoluteTimeout,
      JSON.stringify(session)
    );

    await this.redis.sadd(this.getUserSessionsKey(session.userId), newSessionId);

    console.log(`✅ Session ID regenerated: ${oldSessionId} → ${newSessionId}`);
    return newSessionId;
  }

  // ==========================================================================
  // Helpers
  // ==========================================================================

  private generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private getSessionKey(sessionId: string): string {
    return `session:${sessionId}`;
  }

  private getUserSessionsKey(userId: string): string {
    return `user_sessions:${userId}`;
  }

  /**
   * Cleanup expired sessions from database
   */
  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.pool.query<{ deleted_count: number }>(
      `UPDATE sessions
       SET ended_at = NOW()
       WHERE ended_at IS NULL
         AND last_activity_at < NOW() - INTERVAL '${this.config.inactivityTimeout} seconds'
       RETURNING COUNT(*) as deleted_count`
    );

    const deletedCount = result.rows[0]?.deleted_count || 0;
    console.log(`✅ Cleaned up ${deletedCount} expired sessions`);
    return deletedCount;
  }
}

// ============================================================================
// Session Middleware
// ============================================================================

/**
 * Create session validation middleware
 */
export function createSessionMiddleware(sessionManager: SessionManager) {
  return async function sessionMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    const sessionId = req.cookies?.sessionId;

    if (!sessionId) {
      // No session cookie - unauthenticated request
      next();
      return;
    }

    // Validate session
    const session = await sessionManager.validateSession(sessionId);

    if (!session) {
      // Invalid or expired session
      res.clearCookie('sessionId');
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Session expired or invalid',
      });
      return;
    }

    // Attach session to request
    (req as any).session = session;

    next();
  };
}

/**
 * Create CSRF validation middleware
 */
export function createCSRFMiddleware(sessionManager: SessionManager) {
  return async function csrfMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    // Skip CSRF check for GET, HEAD, OPTIONS (idempotent methods)
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      next();
      return;
    }

    const session = (req as any).session;
    if (!session) {
      // No session - let auth middleware handle
      next();
      return;
    }

    // Get CSRF token from header or body
    const csrfToken = req.headers['x-csrf-token'] as string || req.body?._csrf;

    if (!csrfToken || !sessionManager.validateCSRFToken(session, csrfToken)) {
      console.warn(`⚠️ CSRF token validation failed for user ${session.email}`);
      res.status(403).json({
        error: 'Forbidden',
        message: 'CSRF token validation failed',
      });
      return;
    }

    next();
  };
}

// ============================================================================
// Cookie Configuration
// ============================================================================

/**
 * Get secure cookie configuration
 */
export function getSecureCookieConfig() {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true, // Prevent XSS access to cookie
    secure: isProduction, // HTTPS only in production
    sameSite: 'strict' as const, // CSRF protection
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
  };
}
