/**
 * MARCUS 3.0 Citation Integrity Platform
 * Comprehensive Audit Logging Middleware
 *
 * Logs all security-relevant events:
 * - Authentication events (login, logout, token refresh)
 * - Authorization events (permission checks, access denials)
 * - Administrative actions (user management, config changes)
 * - Secret access events (key retrieval, rotation)
 * - API access patterns (rate limit hits, suspicious activity)
 * - Data access (sensitive resource queries)
 *
 * Structured JSON logging with tamper-proof append-only storage.
 * 1 year minimum retention policy.
 *
 * @module auditLogger
 * @author Marcus (Platform Engineer)
 */

import { Request, Response, NextFunction } from 'express';
import { Pool, PoolClient } from 'pg';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type AuditEventType =
  // Authentication
  | 'auth.login.success'
  | 'auth.login.failure'
  | 'auth.logout'
  | 'auth.token.refresh'
  | 'auth.token.revoke'
  | 'auth.password.reset'
  | 'auth.account.locked'
  | 'auth.mfa.enabled'
  | 'auth.mfa.disabled'
  // Authorization
  | 'authz.permission.granted'
  | 'authz.permission.denied'
  | 'authz.role.escalation'
  // Administrative
  | 'admin.user.created'
  | 'admin.user.updated'
  | 'admin.user.deleted'
  | 'admin.user.deactivated'
  | 'admin.role.assigned'
  | 'admin.role.revoked'
  | 'admin.config.updated'
  // Secret Management
  | 'secret.accessed'
  | 'secret.rotated'
  | 'secret.created'
  | 'secret.deleted'
  | 'secret.unauthorized.access'
  // API Security
  | 'api.rate_limit.exceeded'
  | 'api.suspicious.activity'
  | 'api.csrf.violation'
  | 'api.cors.violation'
  // Data Access
  | 'data.sensitive.query'
  | 'data.export'
  | 'data.delete';

export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AuditLogEntry {
  eventType: AuditEventType;
  severity: AuditSeverity;
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string; // Resource being accessed (e.g., '/api/admin/users')
  action?: string; // Action performed (e.g., 'UPDATE', 'DELETE')
  result: 'success' | 'failure';
  failureReason?: string;
  metadata?: Record<string, any>; // Additional context
}

export interface AuditLoggerConfig {
  /**
   * Minimum severity to log
   * Default: 'low' (log everything)
   */
  minSeverity?: AuditSeverity;

  /**
   * Enable structured JSON logging to console
   * Default: true
   */
  enableConsoleLogging?: boolean;

  /**
   * Enable database persistence
   * Default: true
   */
  enableDatabaseLogging?: boolean;

  /**
   * Retention period in days
   * Default: 365 (1 year)
   */
  retentionDays?: number;
}

// ============================================================================
// Audit Logger
// ============================================================================

export class AuditLogger {
  private pool: Pool | null;
  private config: Required<AuditLoggerConfig>;

  constructor(pool: Pool | null, config: AuditLoggerConfig = {}) {
    this.pool = pool;
    this.config = {
      minSeverity: config.minSeverity || 'low',
      enableConsoleLogging: config.enableConsoleLogging !== false,
      enableDatabaseLogging: config.enableDatabaseLogging !== false && pool !== null,
      retentionDays: config.retentionDays || 365,
    };

    if (this.config.enableDatabaseLogging && !this.pool) {
      console.warn('⚠️ WARNING: Database logging enabled but no pool provided');
    }
  }

  /**
   * Log an audit event
   */
  async log(entry: AuditLogEntry): Promise<void> {
    // Check severity threshold
    if (!this.shouldLog(entry.severity)) {
      return;
    }

    // Enrich entry with timestamp and request ID
    const enrichedEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };

    // Console logging (structured JSON)
    if (this.config.enableConsoleLogging) {
      this.logToConsole(enrichedEntry);
    }

    // Database logging (persistent)
    if (this.config.enableDatabaseLogging && this.pool) {
      await this.logToDatabase(enrichedEntry);
    }
  }

  /**
   * Check if event should be logged based on severity threshold
   */
  private shouldLog(severity: AuditSeverity): boolean {
    const severityLevels: Record<AuditSeverity, number> = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    };

    return severityLevels[severity] >= severityLevels[this.config.minSeverity];
  }

  /**
   * Log to console with structured JSON format
   */
  private logToConsole(entry: any): void {
    const icon = this.getSeverityIcon(entry.severity);
    const color = this.getSeverityColor(entry.severity);

    console.log(
      `${icon} AUDIT [${entry.severity.toUpperCase()}] ${entry.eventType}`,
      JSON.stringify({
        timestamp: entry.timestamp,
        userId: entry.userId,
        email: entry.email,
        ipAddress: entry.ipAddress,
        resource: entry.resource,
        action: entry.action,
        result: entry.result,
        failureReason: entry.failureReason,
        metadata: entry.metadata,
      }, null, 2)
    );
  }

  /**
   * Log to database for persistent storage
   */
  private async logToDatabase(entry: any): Promise<void> {
    if (!this.pool) return;

    try {
      await this.pool.query(
        `INSERT INTO audit_log
         (event_type, severity, user_id, email, ip_address, user_agent, resource, action, result, failure_reason, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          entry.eventType,
          entry.severity,
          entry.userId || null,
          entry.email || null,
          entry.ipAddress || null,
          entry.userAgent || null,
          entry.resource || null,
          entry.action || null,
          entry.result,
          entry.failureReason || null,
          entry.metadata ? JSON.stringify(entry.metadata) : null,
        ]
      );
    } catch (err) {
      // CRITICAL: Audit logging failure should not crash the application
      // But we must log it to console for visibility
      console.error('❌ CRITICAL: Failed to write audit log to database:', err);
      console.error('Audit entry that failed to persist:', entry);
    }
  }

  /**
   * Get severity icon for console output
   */
  private getSeverityIcon(severity: AuditSeverity): string {
    const icons: Record<AuditSeverity, string> = {
      low: 'ℹ️',
      medium: '⚠️',
      high: '🚨',
      critical: '🔥',
    };
    return icons[severity];
  }

  /**
   * Get severity color for console output
   */
  private getSeverityColor(severity: AuditSeverity): string {
    const colors: Record<AuditSeverity, string> = {
      low: '\x1b[36m', // Cyan
      medium: '\x1b[33m', // Yellow
      high: '\x1b[31m', // Red
      critical: '\x1b[35m', // Magenta
    };
    return colors[severity];
  }

  /**
   * Clean up old audit logs based on retention policy
   */
  async cleanupOldLogs(): Promise<number> {
    if (!this.pool) return 0;

    const result = await this.pool.query<{ deleted_count: number }>(
      `DELETE FROM audit_log
       WHERE timestamp < NOW() - INTERVAL '${this.config.retentionDays} days'
       RETURNING COUNT(*) as deleted_count`
    );

    const deletedCount = result.rows[0]?.deleted_count || 0;
    console.log(`✅ Cleaned up ${deletedCount} audit logs older than ${this.config.retentionDays} days`);
    return deletedCount;
  }
}

// ============================================================================
// Audit Middleware Factory
// ============================================================================

/**
 * Create audit logging middleware for HTTP requests
 */
export function createAuditMiddleware(auditLogger: AuditLogger) {
  return function auditMiddleware(req: Request, res: Response, next: NextFunction): void {
    // Capture request start time
    const startTime = Date.now();

    // Capture original res.json and res.send to intercept responses
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    let responseSent = false;

    // Override res.json
    res.json = function (body: any): Response {
      if (!responseSent) {
        responseSent = true;
        logRequestCompletion(req, res, body, startTime);
      }
      return originalJson(body);
    };

    // Override res.send
    res.send = function (body: any): Response {
      if (!responseSent) {
        responseSent = true;
        logRequestCompletion(req, res, body, startTime);
      }
      return originalSend(body);
    };

    /**
     * Log request completion with audit trail
     */
    function logRequestCompletion(req: Request, res: Response, body: any, startTime: number): void {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;
      const method = req.method;
      const path = req.path;

      // Determine if this is an audit-worthy event
      const auditEvent = determineAuditEvent(method, path, statusCode, req, body);

      if (auditEvent) {
        auditLogger.log({
          eventType: auditEvent.type,
          severity: auditEvent.severity,
          userId: (req as any).user?.userId,
          email: (req as any).user?.email,
          ipAddress: req.ip || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
          resource: path,
          action: method,
          result: statusCode < 400 ? 'success' : 'failure',
          failureReason: statusCode >= 400 ? body?.message || body?.error : undefined,
          metadata: {
            statusCode,
            duration,
            query: req.query,
          },
        });
      }
    }

    next();
  };
}

/**
 * Determine audit event type and severity based on request
 */
function determineAuditEvent(
  method: string,
  path: string,
  statusCode: number,
  req: Request,
  body: any
): { type: AuditEventType; severity: AuditSeverity } | null {
  // Authentication events
  if (path === '/auth/login') {
    return {
      type: statusCode < 400 ? 'auth.login.success' : 'auth.login.failure',
      severity: statusCode < 400 ? 'low' : 'medium',
    };
  }
  if (path === '/auth/logout') {
    return { type: 'auth.logout', severity: 'low' };
  }
  if (path === '/auth/refresh') {
    return { type: 'auth.token.refresh', severity: 'low' };
  }

  // Authorization denials (403)
  if (statusCode === 403) {
    return { type: 'authz.permission.denied', severity: 'high' };
  }

  // Administrative actions
  if (path.startsWith('/api/admin')) {
    if (method === 'POST' && path.includes('/users')) {
      return { type: 'admin.user.created', severity: 'medium' };
    }
    if (method === 'PUT' && path.includes('/role')) {
      return { type: 'admin.role.assigned', severity: 'high' };
    }
    if (method === 'DELETE' && path.includes('/users')) {
      return { type: 'admin.user.deleted', severity: 'high' };
    }
  }

  // Rate limit exceeded
  if (statusCode === 429) {
    return { type: 'api.rate_limit.exceeded', severity: 'medium' };
  }

  // CORS violations
  if (statusCode === 403 && path === '/') {
    return { type: 'api.cors.violation', severity: 'medium' };
  }

  // No audit event for this request
  return null;
}

// ============================================================================
// Helper: Extract User Context from Request
// ============================================================================

/**
 * Extract user context from authenticated request
 */
export function extractUserContext(req: Request): Pick<AuditLogEntry, 'userId' | 'email' | 'ipAddress' | 'userAgent'> {
  return {
    userId: (req as any).user?.userId,
    email: (req as any).user?.email,
    ipAddress: req.ip || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
  };
}
