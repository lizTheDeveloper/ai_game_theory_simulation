/**
 * MARCUS 3.1 - Dual-Secret JWT System
 *
 * Implements zero-downtime JWT secret rotation using dual-secret pattern.
 *
 * Architecture:
 * - Always sign with CURRENT secret
 * - Verify against CURRENT or PREVIOUS secret (grace period)
 * - Rotate every 30 days automatically
 * - Fallback to previous secret for in-flight tokens
 *
 * Security Benefits:
 * - Zero downtime during rotation
 * - Automatic expiration of old secrets
 * - Audit trail of rotations
 * - Defense against secret compromise
 *
 * Author: Marcus (Platform Engineer)
 * Date: 2025-11-22
 */

import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { EventEmitter } from 'events';

// ============================================================================
// Type Definitions
// ============================================================================

export interface JwtSecretConfig {
  currentSecret: string;
  previousSecret: string | null;
  rotationTimestamp: string;
  expirationDays: number;
}

export interface JwtPayload {
  sub: string;         // Subject (user ID)
  role: string;        // User role
  iat: number;         // Issued at
  exp: number;         // Expiration
  rotationId: string;  // Track which secret was used for signing
}

export interface VerificationResult {
  valid: boolean;
  payload?: JwtPayload;
  usedPreviousSecret: boolean;
  error?: string;
}

// ============================================================================
// Dual Secret JWT Manager
// ============================================================================

export class DualSecretJwtManager extends EventEmitter {
  private currentSecret: string;
  private previousSecret: string | null = null;
  private currentRotationId: string;
  private previousRotationId: string | null = null;
  private rotationTimestamp: Date;
  private gracePeriodMs: number;
  private readonly secretRotationIntervalMs: number = 30 * 24 * 60 * 60 * 1000; // 30 days

  constructor(
    initialSecret?: string,
    gracePeriodDays: number = 7
  ) {
    super();

    // Generate initial secret if not provided
    this.currentSecret = initialSecret || this.generateSecret();
    this.currentRotationId = this.generateRotationId();
    this.rotationTimestamp = new Date();
    this.gracePeriodMs = gracePeriodDays * 24 * 60 * 60 * 1000;

    console.log(`✅ DualSecretJwtManager initialized (rotation ID: ${this.currentRotationId})`);
  }

  /**
   * Generate cryptographically secure secret (256 bits).
   */
  private generateSecret(): string {
    return crypto.randomBytes(32).toString('base64');
  }

  /**
   * Generate rotation ID (timestamp-based identifier).
   */
  private generateRotationId(): string {
    return `rot_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Sign JWT with current secret.
   *
   * @param payload JWT payload data
   * @param expiresIn Expiration time (default: 24h)
   * @returns Signed JWT token
   */
  sign(payload: Omit<JwtPayload, 'iat' | 'exp' | 'rotationId'>, expiresIn: string = '24h'): string {
    const fullPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
      ...payload,
      rotationId: this.currentRotationId
    };

    return jwt.sign(fullPayload, this.currentSecret, {
      expiresIn,
      algorithm: 'HS256'
    });
  }

  /**
   * Verify JWT against current OR previous secret (graceful rotation).
   *
   * @param token JWT token to verify
   * @returns Verification result with payload and metadata
   */
  verify(token: string): VerificationResult {
    // Try current secret first
    try {
      const payload = jwt.verify(token, this.currentSecret, {
        algorithms: ['HS256']
      }) as JwtPayload;

      return {
        valid: true,
        payload,
        usedPreviousSecret: false
      };
    } catch (currentErr) {
      // If current secret fails and previous exists, try previous
      if (this.previousSecret) {
        try {
          const payload = jwt.verify(token, this.previousSecret, {
            algorithms: ['HS256']
          }) as JwtPayload;

          // Check if we're still in grace period
          const gracePeriodExpiry = new Date(this.rotationTimestamp.getTime() + this.gracePeriodMs);
          if (new Date() > gracePeriodExpiry) {
            return {
              valid: false,
              usedPreviousSecret: true,
              error: `Token signed with expired previous secret (grace period ended: ${gracePeriodExpiry.toISOString()})`
            };
          }

          // Emit warning - client should refresh token
          this.emit('previous_secret_used', {
            rotationId: payload.rotationId,
            sub: payload.sub,
            timestamp: new Date().toISOString()
          });

          return {
            valid: true,
            payload,
            usedPreviousSecret: true
          };
        } catch (previousErr) {
          return {
            valid: false,
            usedPreviousSecret: false,
            error: `Token invalid with both current and previous secrets: ${(currentErr as Error).message}`
          };
        }
      }

      // No previous secret available
      return {
        valid: false,
        usedPreviousSecret: false,
        error: (currentErr as Error).message
      };
    }
  }

  /**
   * Rotate secrets: current → previous, generate new current.
   *
   * CRITICAL: This operation is zero-downtime. Tokens signed with old secret
   * remain valid during grace period.
   *
   * @returns New rotation ID
   */
  rotate(): string {
    const oldRotationId = this.currentRotationId;
    const oldSecret = this.currentSecret;

    // Generate new secret
    const newSecret = this.generateSecret();
    const newRotationId = this.generateRotationId();

    // Rotate: current → previous
    this.previousSecret = oldSecret;
    this.previousRotationId = oldRotationId;
    this.currentSecret = newSecret;
    this.currentRotationId = newRotationId;
    this.rotationTimestamp = new Date();

    // Emit rotation event for audit logging
    this.emit('rotated', {
      newRotationId,
      oldRotationId,
      timestamp: this.rotationTimestamp.toISOString()
    });

    console.log(`🔐 JWT secrets rotated: ${oldRotationId} → ${newRotationId}`);

    return newRotationId;
  }

  /**
   * Check if rotation is due (30 days since last rotation).
   *
   * @returns True if rotation needed
   */
  isRotationDue(): boolean {
    const timeSinceRotation = Date.now() - this.rotationTimestamp.getTime();
    return timeSinceRotation >= this.secretRotationIntervalMs;
  }

  /**
   * Get days until next rotation.
   */
  getDaysUntilRotation(): number {
    const timeSinceRotation = Date.now() - this.rotationTimestamp.getTime();
    const timeUntilRotation = this.secretRotationIntervalMs - timeSinceRotation;
    return Math.ceil(timeUntilRotation / (24 * 60 * 60 * 1000));
  }

  /**
   * Export config for persistence (e.g., to Kubernetes secrets).
   *
   * @returns Configuration for external storage
   */
  exportConfig(): JwtSecretConfig {
    return {
      currentSecret: this.currentSecret,
      previousSecret: this.previousSecret,
      rotationTimestamp: this.rotationTimestamp.toISOString(),
      expirationDays: this.secretRotationIntervalMs / (24 * 60 * 60 * 1000)
    };
  }

  /**
   * Import config from persistence (e.g., from Kubernetes secrets).
   *
   * @param config Saved configuration
   */
  importConfig(config: JwtSecretConfig): void {
    this.currentSecret = config.currentSecret;
    this.previousSecret = config.previousSecret;
    this.rotationTimestamp = new Date(config.rotationTimestamp);
    this.currentRotationId = this.generateRotationId(); // Generate new ID for tracking

    if (config.previousSecret) {
      this.previousRotationId = this.generateRotationId();
    }

    console.log(`✅ JWT config imported (rotation timestamp: ${config.rotationTimestamp})`);
  }

  /**
   * Get current rotation metadata (for debugging).
   */
  getRotationMetadata(): {
    currentRotationId: string;
    previousRotationId: string | null;
    rotationTimestamp: string;
    daysUntilRotation: number;
    gracePeriodDays: number;
  } {
    return {
      currentRotationId: this.currentRotationId,
      previousRotationId: this.previousRotationId,
      rotationTimestamp: this.rotationTimestamp.toISOString(),
      daysUntilRotation: this.getDaysUntilRotation(),
      gracePeriodDays: this.gracePeriodMs / (24 * 60 * 60 * 1000)
    };
  }
}

// ============================================================================
// Automatic Rotation Scheduler
// ============================================================================

export class JwtRotationScheduler {
  private jwtManager: DualSecretJwtManager;
  private rotationInterval: NodeJS.Timeout | null = null;
  private checkIntervalMs: number = 24 * 60 * 60 * 1000; // Check daily

  constructor(jwtManager: DualSecretJwtManager, checkIntervalHours: number = 24) {
    this.jwtManager = jwtManager;
    this.checkIntervalMs = checkIntervalHours * 60 * 60 * 1000;

    // Set up event listeners for audit trail
    this.jwtManager.on('rotated', this.handleRotation.bind(this));
    this.jwtManager.on('previous_secret_used', this.handlePreviousSecretUsed.bind(this));
  }

  /**
   * Start automatic rotation scheduler.
   */
  start(): void {
    if (this.rotationInterval) {
      console.warn('⚠️ Rotation scheduler already running');
      return;
    }

    console.log(`🕐 Starting JWT rotation scheduler (check interval: ${this.checkIntervalMs / 3600000}h)`);

    // Check immediately on start
    this.checkAndRotate();

    // Then check periodically
    this.rotationInterval = setInterval(() => {
      this.checkAndRotate();
    }, this.checkIntervalMs);
  }

  /**
   * Stop automatic rotation scheduler.
   */
  stop(): void {
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
      this.rotationInterval = null;
      console.log('🛑 JWT rotation scheduler stopped');
    }
  }

  /**
   * Check if rotation is due and perform if needed.
   */
  private checkAndRotate(): void {
    if (this.jwtManager.isRotationDue()) {
      console.log('🔐 JWT rotation is due, rotating secrets...');
      this.jwtManager.rotate();
    } else {
      const daysRemaining = this.jwtManager.getDaysUntilRotation();
      console.log(`✅ JWT secrets healthy (${daysRemaining} days until rotation)`);
    }
  }

  /**
   * Handle rotation event (audit logging).
   */
  private handleRotation(event: { newRotationId: string; oldRotationId: string; timestamp: string }): void {
    console.log(`📝 [AUDIT] JWT Secret Rotation:`);
    console.log(`  Old Rotation ID: ${event.oldRotationId}`);
    console.log(`  New Rotation ID: ${event.newRotationId}`);
    console.log(`  Timestamp: ${event.timestamp}`);

    // TODO: Send to external audit system (e.g., CloudWatch, Stackdriver)
  }

  /**
   * Handle previous secret usage (warning - client should refresh).
   */
  private handlePreviousSecretUsed(event: { rotationId: string; sub: string; timestamp: string }): void {
    console.warn(`⚠️ [AUDIT] Previous JWT secret used:`);
    console.warn(`  Subject: ${event.sub}`);
    console.warn(`  Rotation ID: ${event.rotationId}`);
    console.warn(`  Timestamp: ${event.timestamp}`);
    console.warn(`  Recommendation: Client should refresh token`);

    // TODO: Track metrics (how many clients using old tokens)
  }
}

// ============================================================================
// Express Middleware Integration
// ============================================================================

/**
 * Express middleware for JWT authentication with dual-secret support.
 *
 * @param jwtManager Dual-secret JWT manager instance
 * @returns Express middleware function
 */
export function jwtAuthMiddleware(jwtManager: DualSecretJwtManager) {
  return (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const result = jwtManager.verify(token);

    if (!result.valid) {
      return res.status(401).json({ error: result.error });
    }

    // Add payload to request
    req.user = result.payload;

    // If using previous secret, add header to suggest token refresh
    if (result.usedPreviousSecret) {
      res.setHeader('X-Token-Refresh-Suggested', 'true');
      res.setHeader('X-Token-Rotation-Id', result.payload!.rotationId);
    }

    next();
  };
}
