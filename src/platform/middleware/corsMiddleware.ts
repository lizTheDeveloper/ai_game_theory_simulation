/**
 * MARCUS 3.0 Citation Integrity Platform
 * Enhanced CORS Middleware
 *
 * Production-grade CORS with:
 * - Whitelist approach (explicit allowed origins)
 * - Dynamic origin validation
 * - Credentials support (cookies, auth headers)
 * - Preflight request handling
 * - Per-route CORS configuration
 *
 * @module corsMiddleware
 * @author Marcus (Platform Engineer)
 */

import { Request, Response, NextFunction } from 'express';
import { sanitizeForLog } from '../utils/logSanitizer';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface CORSConfig {
  /**
   * Allowed origins (exact match or regex patterns)
   * Examples:
   * - ['https://app.example.com']
   * - ['https://*.example.com'] (wildcard subdomain)
   * - [/^https:\/\/.*\.example\.com$/] (regex pattern)
   */
  allowedOrigins: (string | RegExp)[];

  /**
   * Allow credentials (cookies, authorization headers)
   * Default: true
   */
  credentials?: boolean;

  /**
   * Allowed HTTP methods
   * Default: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
   */
  allowedMethods?: string[];

  /**
   * Allowed request headers
   * Default: ['Content-Type', 'Authorization', 'X-Requested-With']
   */
  allowedHeaders?: string[];

  /**
   * Headers to expose to client
   * Default: ['Content-Length', 'Content-Type']
   */
  exposedHeaders?: string[];

  /**
   * Preflight cache duration (seconds)
   * Default: 86400 (24 hours)
   */
  maxAge?: number;

  /**
   * Enable CORS for all routes
   * Default: true
   */
  enableForAll?: boolean;
}

// ============================================================================
// CORS Middleware Factory
// ============================================================================

/**
 * Create CORS middleware with enhanced security
 */
export function createCORSMiddleware(config: CORSConfig) {
  // Normalize configuration with defaults
  const corsConfig = {
    allowedOrigins: config.allowedOrigins,
    credentials: config.credentials !== false, // Default true
    allowedMethods: config.allowedMethods || ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: config.allowedHeaders || ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: config.exposedHeaders || ['Content-Length', 'Content-Type'],
    maxAge: config.maxAge || 86400, // 24 hours
    enableForAll: config.enableForAll !== false, // Default true
  };

  // Validate configuration
  if (!corsConfig.allowedOrigins || corsConfig.allowedOrigins.length === 0) {
    throw new Error(
      '❌ CRITICAL: CORS allowedOrigins must contain at least one origin. ' +
      'Never use wildcard (*) in production.'
    );
  }

  /**
   * Check if origin is allowed
   */
  function isOriginAllowed(origin: string | undefined): boolean {
    if (!origin) {
      // No origin header (same-origin request or non-browser client)
      return false;
    }

    // Check against allowed origins
    return corsConfig.allowedOrigins.some((allowedOrigin) => {
      if (typeof allowedOrigin === 'string') {
        // Exact match
        if (allowedOrigin === origin) {
          return true;
        }

        // Wildcard subdomain pattern (e.g., https://*.example.com)
        if (allowedOrigin.includes('*')) {
          const pattern = allowedOrigin
            .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special chars
            .replace(/\*/g, '.*'); // Convert * to .*
          const regex = new RegExp(`^${pattern}$`);
          return regex.test(origin);
        }

        return false;
      } else if (allowedOrigin instanceof RegExp) {
        // Regex pattern
        return allowedOrigin.test(origin);
      }

      return false;
    });
  }

  /**
   * CORS middleware function
   */
  return function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
    const origin = req.headers.origin;

    // Check if origin is allowed
    if (origin && isOriginAllowed(origin)) {
      // Set CORS headers for allowed origin
      res.setHeader('Access-Control-Allow-Origin', origin);

      if (corsConfig.credentials) {
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }

      // Expose headers
      if (corsConfig.exposedHeaders.length > 0) {
        res.setHeader('Access-Control-Expose-Headers', corsConfig.exposedHeaders.join(', '));
      }

      // Handle preflight request (OPTIONS)
      if (req.method === 'OPTIONS') {
        // Set preflight headers
        res.setHeader('Access-Control-Allow-Methods', corsConfig.allowedMethods.join(', '));
        res.setHeader('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
        res.setHeader('Access-Control-Max-Age', String(corsConfig.maxAge));

        // Preflight requests don't need a body
        res.status(204).end();
        return;
      }
    } else if (origin) {
      // Origin provided but not allowed - log and reject
      console.warn(`⚠️ CORS: Rejected request from unauthorized origin: ${sanitizeForLog(origin)}`); // lgtm[js/log-injection] - sanitized

      // For strict security, reject cross-origin requests from unauthorized origins
      // This prevents CORS errors in browsers while protecting the API
      if (req.method === 'OPTIONS') {
        // Reject preflight
        res.status(403).json({
          error: 'Forbidden',
          message: 'Origin not allowed by CORS policy',
        });
        return;
      }
      // For non-preflight, let it through but without CORS headers
      // (browser will block the response)
    }

    // Continue to next middleware
    next();
  };
}

// ============================================================================
// Per-Route CORS Configuration
// ============================================================================

/**
 * Create route-specific CORS middleware
 *
 * Use for endpoints that need different CORS settings than the global policy
 *
 * @example
 * app.get('/api/public', routeSpecificCORS({ allowedOrigins: ['*'] }), handler);
 */
export function routeSpecificCORS(config: CORSConfig) {
  return createCORSMiddleware({ ...config, enableForAll: false });
}

// ============================================================================
// Environment-based Configuration Helper
// ============================================================================

/**
 * Parse CORS origins from environment variable
 *
 * @example
 * CORS_ORIGINS=https://app.example.com,https://admin.example.com
 * CORS_ORIGINS=https://*.example.com  # Wildcard subdomain
 */
export function parseCORSOrigins(envVar: string = 'CORS_ORIGINS'): (string | RegExp)[] {
  const originsStr = process.env[envVar];

  if (!originsStr) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        `❌ CRITICAL: ${envVar} must be set in production. ` +
        'Never use wildcard (*) origins in production.'
      );
    }

    // Development fallback
    console.warn(
      `⚠️ WARNING: ${envVar} not set. Using development default: http://localhost:3333`
    );
    return ['http://localhost:3333'];
  }

  // Parse comma-separated origins
  const origins = originsStr
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  if (origins.length === 0) {
    throw new Error(
      `❌ CRITICAL: ${envVar} contains no valid origins`
    );
  }

  // Validate no wildcard (*) in production
  if (process.env.NODE_ENV === 'production' && origins.includes('*')) {
    throw new Error(
      `❌ CRITICAL: Wildcard (*) CORS origin is not allowed in production. ` +
      'Specify explicit allowed origins.'
    );
  }

  return origins;
}

// ============================================================================
// Default Production Configuration
// ============================================================================

/**
 * Get default CORS configuration for production
 */
export function getDefaultCORSConfig(): CORSConfig {
  return {
    allowedOrigins: parseCORSOrigins(),
    credentials: true, // Support cookies and auth headers
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-CSRF-Token', // CSRF protection
    ],
    exposedHeaders: [
      'Content-Length',
      'Content-Type',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
    ],
    maxAge: 86400, // 24 hours
    enableForAll: true,
  };
}
