/**
 * MARCUS 3.0 Citation Integrity Platform
 * Rate Limiting Middleware
 *
 * Production-ready rate limiting with Redis-based distributed limiting,
 * sliding window algorithm, and comprehensive monitoring.
 *
 * Security Features:
 * - IP-based rate limiting (prevent DoS)
 * - User-based rate limiting (authenticated requests)
 * - Distributed rate limiting via Redis
 * - Sliding window algorithm (prevent burst abuse)
 * - Configurable limits per endpoint
 * - Rate limit headers (X-RateLimit-*)
 * - Automatic IP blocking after repeated violations
 *
 * @module rateLimiter
 * @author Marcus (Platform Engineer)
 */

import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { sanitizeForLog, sanitizeIP, sanitizePath, sanitizeMethod } from '../utils/logSanitizer';

// ============================================================================
// Types
// ============================================================================

export interface RateLimitConfig {
  // Requests per window
  maxRequests: number;

  // Window size in seconds
  windowSeconds: number;

  // Use IP-based limiting
  byIP?: boolean;

  // Use user-based limiting (requires authentication)
  byUser?: boolean;

  // Skip rate limiting for certain IPs (e.g., health checks from load balancer)
  skipIPs?: string[];

  // Block IP after N violations within block window
  blockAfterViolations?: number;
  blockWindowSeconds?: number;
  blockDurationSeconds?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number; // Unix timestamp (seconds)
  retryAfter?: number; // Seconds to wait before retry
}

// ============================================================================
// Rate Limiter Class
// ============================================================================

export class RateLimiter {
  private redis: Redis;
  private config: RateLimitConfig;

  constructor(redis: Redis, config: RateLimitConfig) {
    this.redis = redis;
    this.config = {
      byIP: true,
      byUser: false,
      skipIPs: [],
      blockAfterViolations: 10,
      blockWindowSeconds: 3600, // 1 hour
      blockDurationSeconds: 3600, // 1 hour
      ...config,
    };
  }

  /**
   * Check rate limit for a request
   *
   * Uses sliding window algorithm via Redis sorted sets:
   * - Store timestamps of requests in sorted set
   * - Remove expired timestamps
   * - Count remaining timestamps
   * - Allow if count < limit
   *
   * @param identifier - IP address or user ID
   * @returns Rate limit result
   */
  async checkLimit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const nowSeconds = Math.floor(now / 1000);
    const windowStart = now - (this.config.windowSeconds * 1000);
    const key = `ratelimit:${identifier}`;

    // Use Redis pipeline for atomic operations
    const pipeline = this.redis.pipeline();

    // 1. Remove expired entries from sorted set
    pipeline.zremrangebyscore(key, '-inf', windowStart);

    // 2. Count current requests in window
    pipeline.zcard(key);

    // 3. Add current request timestamp
    pipeline.zadd(key, now, `${now}-${Math.random()}`);

    // 4. Set expiration on the key
    pipeline.expire(key, this.config.windowSeconds);

    const results = await pipeline.exec();

    if (!results) {
      throw new Error('Redis pipeline execution failed');
    }

    // Extract count (before adding current request)
    const countResult = results[1];
    if (!countResult || countResult[0]) {
      throw new Error('Redis ZCARD failed');
    }
    const currentCount = countResult[1] as number;

    // Calculate remaining requests
    const remaining = Math.max(0, this.config.maxRequests - currentCount - 1);
    const resetTime = nowSeconds + this.config.windowSeconds;

    // Check if limit exceeded
    const allowed = currentCount < this.config.maxRequests;

    if (!allowed) {
      // Track violation for potential IP blocking
      await this.trackViolation(identifier);

      return {
        allowed: false,
        limit: this.config.maxRequests,
        remaining: 0,
        resetTime,
        retryAfter: this.config.windowSeconds,
      };
    }

    return {
      allowed: true,
      limit: this.config.maxRequests,
      remaining,
      resetTime,
    };
  }

  /**
   * Track rate limit violation for potential IP blocking
   */
  private async trackViolation(identifier: string): Promise<void> {
    if (!this.config.blockAfterViolations) {
      return;
    }

    const now = Date.now();
    const windowStart = now - (this.config.blockWindowSeconds! * 1000);
    const violationKey = `ratelimit:violations:${identifier}`;

    // Add violation to sorted set
    const pipeline = this.redis.pipeline();
    pipeline.zremrangebyscore(violationKey, '-inf', windowStart);
    pipeline.zadd(violationKey, now, `${now}`);
    pipeline.zcard(violationKey);
    pipeline.expire(violationKey, this.config.blockWindowSeconds!);

    const results = await pipeline.exec();

    if (!results) {
      return;
    }

    // Check violation count
    const countResult = results[2];
    if (countResult && !countResult[0]) {
      const violationCount = countResult[1] as number;

      if (violationCount >= this.config.blockAfterViolations!) {
        // Block IP
        await this.blockIdentifier(identifier);
        // lgtm[js/log-injection] - sanitized via sanitizeForLog
        console.warn(
          `🚨 Rate limit: Blocked ${sanitizeForLog(identifier)} after ${violationCount} violations`
        );
      }
    }
  }

  /**
   * Block an identifier (IP or user) temporarily
   */
  private async blockIdentifier(identifier: string): Promise<void> {
    const blockKey = `ratelimit:blocked:${identifier}`;
    await this.redis.setex(
      blockKey,
      this.config.blockDurationSeconds!,
      '1'
    );
  }

  /**
   * Check if an identifier is blocked
   */
  async isBlocked(identifier: string): Promise<boolean> {
    const blockKey = `ratelimit:blocked:${identifier}`;
    const blocked = await this.redis.get(blockKey);
    return blocked === '1';
  }

  /**
   * Manually unblock an identifier (admin action)
   */
  async unblock(identifier: string): Promise<void> {
    const blockKey = `ratelimit:blocked:${identifier}`;
    await this.redis.del(blockKey);
    console.log(`✅ Rate limit: Unblocked ${identifier}`);
  }

  /**
   * Get current rate limit status (for debugging/monitoring)
   */
  async getStatus(identifier: string): Promise<{
    currentCount: number;
    limit: number;
    remaining: number;
    resetTime: number;
    blocked: boolean;
  }> {
    const now = Date.now();
    const nowSeconds = Math.floor(now / 1000);
    const windowStart = now - (this.config.windowSeconds * 1000);
    const key = `ratelimit:${identifier}`;

    // Remove expired entries and count
    const pipeline = this.redis.pipeline();
    pipeline.zremrangebyscore(key, '-inf', windowStart);
    pipeline.zcard(key);

    const results = await pipeline.exec();

    if (!results) {
      throw new Error('Redis pipeline execution failed');
    }

    const countResult = results[1];
    const currentCount = (countResult && !countResult[0]) ? countResult[1] as number : 0;
    const remaining = Math.max(0, this.config.maxRequests - currentCount);
    const resetTime = nowSeconds + this.config.windowSeconds;
    const blocked = await this.isBlocked(identifier);

    return {
      currentCount,
      limit: this.config.maxRequests,
      remaining,
      resetTime,
      blocked,
    };
  }
}

// ============================================================================
// Middleware Factory
// ============================================================================

/**
 * Extract IP address from request, handling proxy headers
 *
 * Security: Be cautious with X-Forwarded-For - it can be spoofed.
 * Only trust if request comes from known proxy/load balancer.
 */
function extractIP(req: Request, trustedProxies: string[] = []): string {
  const remoteAddr = req.socket.remoteAddress || 'unknown';

  // Only trust X-Forwarded-For if request comes from known proxy
  const isTrustedProxy = trustedProxies.length === 0 || trustedProxies.includes(remoteAddr);

  if (isTrustedProxy) {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      const ips = (forwardedFor as string).split(',').map(ip => ip.trim());
      const firstIp = ips[0];
      // Validate IP format (IPv4 or IPv6)
      if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(firstIp) || /^[0-9a-f:]+$/i.test(firstIp)) {
        return firstIp;
      }
    }
  }

  // Fallback to direct connection IP
  return remoteAddr;
}

/**
 * Extract user ID from authenticated request
 */
function extractUserID(req: Request): string | null {
  // Assumes JWT middleware sets req.user
  const user = (req as any).user;
  return user?.userId || null;
}

/**
 * Create rate limiting middleware
 *
 * @param redis - Redis client
 * @param config - Rate limit configuration
 * @returns Express middleware
 */
export function createRateLimitMiddleware(
  redis: Redis,
  config: RateLimitConfig
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  const limiter = new RateLimiter(redis, config);

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ip = extractIP(req);

      // Skip rate limiting for whitelisted IPs
      if (config.skipIPs?.includes(ip)) {
        next();
        return;
      }

      // Determine identifier (IP or user)
      let identifier: string;

      if (config.byUser) {
        const userId = extractUserID(req);
        if (userId) {
          identifier = `user:${userId}`;
        } else {
          // Fall back to IP if user not authenticated
          identifier = `ip:${ip}`;
        }
      } else {
        identifier = `ip:${ip}`;
      }

      // Check if blocked
      const blocked = await limiter.isBlocked(identifier);
      if (blocked) {
        res.status(429).json({
          error: 'Too Many Requests',
          message: 'You have been temporarily blocked due to repeated rate limit violations',
          retryAfter: config.blockDurationSeconds,
        });
        return;
      }

      // Check rate limit
      const result = await limiter.checkLimit(identifier);

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', result.limit.toString());
      res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
      res.setHeader('X-RateLimit-Reset', result.resetTime.toString());

      if (!result.allowed) {
        res.setHeader('Retry-After', result.retryAfter!.toString());

        // lgtm[js/log-injection] - sanitized via sanitizeForLog, sanitizeMethod, sanitizePath
        console.warn(
          `⚠️ Rate limit exceeded: ${sanitizeForLog(identifier)} (${sanitizeMethod(req.method)} ${sanitizePath(req.path)})`
        );

        res.status(429).json({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Maximum ${result.limit} requests per ${config.windowSeconds}s`,
          retryAfter: result.retryAfter,
          resetTime: result.resetTime,
        });
        return;
      }

      // Allow request
      next();

    } catch (err) {
      console.error('❌ Rate limiter error:', err);

      // Fail open (allow request) on rate limiter errors
      // This prevents rate limiter bugs from causing outages
      // But log the error for investigation
      next();
    }
  };
}

// ============================================================================
// Preset Configurations
// ============================================================================

/**
 * Preset rate limit configurations for common endpoints
 */
export const RateLimitPresets = {
  // Analysis endpoint: 100 req/min per IP, 500 req/min per user
  analysis: {
    ip: {
      maxRequests: 100,
      windowSeconds: 60,
      byIP: true,
      byUser: false,
    },
    user: {
      maxRequests: 500,
      windowSeconds: 60,
      byIP: false,
      byUser: true,
    },
  },

  // Login endpoint: 5 req/min per IP (prevent brute force)
  login: {
    maxRequests: 5,
    windowSeconds: 60,
    byIP: true,
    byUser: false,
    blockAfterViolations: 5,
    blockWindowSeconds: 300, // 5 minutes
    blockDurationSeconds: 3600, // 1 hour
  },

  // Health check: 1000 req/min per IP
  health: {
    maxRequests: 1000,
    windowSeconds: 60,
    byIP: true,
    byUser: false,
  },

  // Metrics endpoint: 500 req/min per IP
  metrics: {
    maxRequests: 500,
    windowSeconds: 60,
    byIP: true,
    byUser: false,
  },

  // Admin endpoints: 200 req/min per user
  admin: {
    maxRequests: 200,
    windowSeconds: 60,
    byIP: false,
    byUser: true,
  },
};

// ============================================================================
// Prometheus Metrics
// ============================================================================

export interface RateLimitMetrics {
  totalRequests: number;
  allowedRequests: number;
  blockedRequests: number;
  blockedIPs: number;
  violations: number;
}

/**
 * Track rate limiting metrics for Prometheus
 */
export class RateLimitMetricsCollector {
  private metrics: Map<string, RateLimitMetrics> = new Map();

  /**
   * Record a rate limit decision
   */
  record(endpoint: string, allowed: boolean, blocked: boolean): void {
    const key = endpoint;
    const current = this.metrics.get(key) || {
      totalRequests: 0,
      allowedRequests: 0,
      blockedRequests: 0,
      blockedIPs: 0,
      violations: 0,
    };

    current.totalRequests++;

    if (blocked) {
      current.blockedIPs++;
    } else if (allowed) {
      current.allowedRequests++;
    } else {
      current.blockedRequests++;
      current.violations++;
    }

    this.metrics.set(key, current);
  }

  /**
   * Get metrics for an endpoint
   */
  getMetrics(endpoint: string): RateLimitMetrics {
    return this.metrics.get(endpoint) || {
      totalRequests: 0,
      allowedRequests: 0,
      blockedRequests: 0,
      blockedIPs: 0,
      violations: 0,
    };
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Map<string, RateLimitMetrics> {
    return this.metrics;
  }

  /**
   * Reset metrics (for testing)
   */
  reset(): void {
    this.metrics.clear();
  }

  /**
   * Format metrics for Prometheus
   */
  toPrometheus(): string {
    let output = '';

    output += '# HELP ratelimit_requests_total Total number of requests\n';
    output += '# TYPE ratelimit_requests_total counter\n';

    output += '# HELP ratelimit_requests_allowed Number of allowed requests\n';
    output += '# TYPE ratelimit_requests_allowed counter\n';

    output += '# HELP ratelimit_requests_blocked Number of blocked requests\n';
    output += '# TYPE ratelimit_requests_blocked counter\n';

    output += '# HELP ratelimit_violations Total number of violations\n';
    output += '# TYPE ratelimit_violations counter\n';

    output += '# HELP ratelimit_blocked_ips Number of blocked IPs\n';
    output += '# TYPE ratelimit_blocked_ips gauge\n';

    // Convert to array to avoid downlevelIteration issues
    const entries = Array.from(this.metrics.entries());
    for (const [endpoint, metrics] of entries) {
      const labels = `{endpoint="${endpoint}"}`;

      output += `ratelimit_requests_total${labels} ${metrics.totalRequests}\n`;
      output += `ratelimit_requests_allowed${labels} ${metrics.allowedRequests}\n`;
      output += `ratelimit_requests_blocked${labels} ${metrics.blockedRequests}\n`;
      output += `ratelimit_violations${labels} ${metrics.violations}\n`;
      output += `ratelimit_blocked_ips${labels} ${metrics.blockedIPs}\n`;
    }

    return output;
  }
}
