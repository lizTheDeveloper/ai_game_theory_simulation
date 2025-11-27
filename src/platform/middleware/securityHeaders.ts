/**
 * MARCUS 3.0 Citation Integrity Platform
 * Security Headers Middleware
 *
 * Implements OWASP security headers:
 * - Content-Security-Policy (CSP) - Prevent XSS, injection attacks
 * - Strict-Transport-Security (HSTS) - Force HTTPS
 * - X-Frame-Options - Prevent clickjacking
 * - X-Content-Type-Options - Prevent MIME sniffing
 * - X-XSS-Protection - Legacy browser XSS protection
 * - Referrer-Policy - Control referrer information
 * - Permissions-Policy - Disable unused browser features
 *
 * @module securityHeaders
 * @author Marcus (Platform Engineer)
 */

import { Request, Response, NextFunction } from 'express';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface SecurityHeadersConfig {
  /**
   * Content Security Policy directives
   * Default: Strict policy with self and specific CDNs
   */
  csp?: {
    defaultSrc?: string[];
    scriptSrc?: string[];
    styleSrc?: string[];
    imgSrc?: string[];
    fontSrc?: string[];
    connectSrc?: string[];
    frameSrc?: string[];
    objectSrc?: string[];
    upgradeInsecureRequests?: boolean;
  };

  /**
   * HTTP Strict Transport Security (HSTS)
   * Default: 1 year, includeSubDomains, preload
   */
  hsts?: {
    maxAge?: number; // seconds
    includeSubDomains?: boolean;
    preload?: boolean;
  };

  /**
   * X-Frame-Options
   * Default: DENY (prevent all framing)
   */
  frameOptions?: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';

  /**
   * Referrer-Policy
   * Default: strict-origin-when-cross-origin
   */
  referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';

  /**
   * Permissions-Policy (formerly Feature-Policy)
   * Default: Disable geolocation, microphone, camera
   */
  permissionsPolicy?: {
    geolocation?: string[];
    microphone?: string[];
    camera?: string[];
    payment?: string[];
    usb?: string[];
    magnetometer?: string[];
    gyroscope?: string[];
    accelerometer?: string[];
  };

  /**
   * Enable X-XSS-Protection (legacy browsers)
   * Default: true (1; mode=block)
   */
  xssProtection?: boolean;

  /**
   * Enable X-Content-Type-Options: nosniff
   * Default: true
   */
  noSniff?: boolean;

  /**
   * Custom headers to add
   */
  customHeaders?: Record<string, string>;
}

// ============================================================================
// Security Headers Middleware Factory
// ============================================================================

/**
 * Create security headers middleware
 */
export function createSecurityHeadersMiddleware(config: SecurityHeadersConfig = {}) {
  // Default CSP configuration (strict)
  const cspConfig = config.csp || {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline needed for some CSS-in-JS
    imgSrc: ["'self'", 'data:', 'https:'],
    fontSrc: ["'self'", 'data:'],
    connectSrc: ["'self'"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: true,
  };

  // Default HSTS configuration
  const hstsConfig = config.hsts || {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  };

  // Default Permissions-Policy configuration (disable everything not needed)
  const permissionsConfig = config.permissionsPolicy || {
    geolocation: [],
    microphone: [],
    camera: [],
    payment: [],
    usb: [],
    magnetometer: [],
    gyroscope: [],
    accelerometer: [],
  };

  /**
   * Build Content-Security-Policy header value
   */
  function buildCSP(): string {
    const directives: string[] = [];

    // Add each directive
    if (cspConfig.defaultSrc) {
      directives.push(`default-src ${cspConfig.defaultSrc.join(' ')}`);
    }
    if (cspConfig.scriptSrc) {
      directives.push(`script-src ${cspConfig.scriptSrc.join(' ')}`);
    }
    if (cspConfig.styleSrc) {
      directives.push(`style-src ${cspConfig.styleSrc.join(' ')}`);
    }
    if (cspConfig.imgSrc) {
      directives.push(`img-src ${cspConfig.imgSrc.join(' ')}`);
    }
    if (cspConfig.fontSrc) {
      directives.push(`font-src ${cspConfig.fontSrc.join(' ')}`);
    }
    if (cspConfig.connectSrc) {
      directives.push(`connect-src ${cspConfig.connectSrc.join(' ')}`);
    }
    if (cspConfig.frameSrc) {
      directives.push(`frame-src ${cspConfig.frameSrc.join(' ')}`);
    }
    if (cspConfig.objectSrc) {
      directives.push(`object-src ${cspConfig.objectSrc.join(' ')}`);
    }
    if (cspConfig.upgradeInsecureRequests) {
      directives.push('upgrade-insecure-requests');
    }

    return directives.join('; ');
  }

  /**
   * Build Strict-Transport-Security header value
   */
  function buildHSTS(): string {
    const parts = [`max-age=${hstsConfig.maxAge}`];

    if (hstsConfig.includeSubDomains) {
      parts.push('includeSubDomains');
    }
    if (hstsConfig.preload) {
      parts.push('preload');
    }

    return parts.join('; ');
  }

  /**
   * Build Permissions-Policy header value
   */
  function buildPermissionsPolicy(): string {
    const policies: string[] = [];

    for (const [feature, allowlist] of Object.entries(permissionsConfig)) {
      if (allowlist.length === 0) {
        // Disable feature completely
        policies.push(`${feature}=()`);
      } else {
        // Allow specific origins
        policies.push(`${feature}=(${allowlist.join(' ')})`);
      }
    }

    return policies.join(', ');
  }

  /**
   * Security headers middleware function
   */
  return function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction): void {
    // 1. Content-Security-Policy
    res.setHeader('Content-Security-Policy', buildCSP());

    // 2. Strict-Transport-Security (HSTS)
    // Only set HSTS on HTTPS connections
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
      res.setHeader('Strict-Transport-Security', buildHSTS());
    }

    // 3. X-Frame-Options (prevent clickjacking)
    const frameOptions = config.frameOptions || 'DENY';
    res.setHeader('X-Frame-Options', frameOptions);

    // 4. X-Content-Type-Options (prevent MIME sniffing)
    if (config.noSniff !== false) {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }

    // 5. X-XSS-Protection (legacy browser support)
    if (config.xssProtection !== false) {
      res.setHeader('X-XSS-Protection', '1; mode=block');
    }

    // 6. Referrer-Policy
    const referrerPolicy = config.referrerPolicy || 'strict-origin-when-cross-origin';
    res.setHeader('Referrer-Policy', referrerPolicy);

    // 7. Permissions-Policy (formerly Feature-Policy)
    res.setHeader('Permissions-Policy', buildPermissionsPolicy());

    // 8. Custom headers
    if (config.customHeaders) {
      for (const [header, value] of Object.entries(config.customHeaders)) {
        res.setHeader(header, value);
      }
    }

    next();
  };
}

// ============================================================================
// Default Production Configuration
// ============================================================================

/**
 * Get default security headers configuration for production
 */
export function getDefaultSecurityHeadersConfig(): SecurityHeadersConfig {
  return {
    csp: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Needed for CSS-in-JS (Tailwind, styled-components)
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: true,
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    frameOptions: 'DENY',
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: {
      geolocation: [],
      microphone: [],
      camera: [],
      payment: [],
      usb: [],
      magnetometer: [],
      gyroscope: [],
      accelerometer: [],
    },
    xssProtection: true,
    noSniff: true,
  };
}

// ============================================================================
// Development Configuration (More Permissive)
// ============================================================================

/**
 * Get development security headers configuration
 * More permissive for local development
 */
export function getDevelopmentSecurityHeadersConfig(): SecurityHeadersConfig {
  return {
    csp: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Needed for hot reload
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'http:', 'https:'],
      fontSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", 'ws:', 'wss:'], // WebSocket for hot reload
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: false, // Allow HTTP in dev
    },
    hsts: {
      maxAge: 0, // Disable HSTS in dev
      includeSubDomains: false,
      preload: false,
    },
    frameOptions: 'SAMEORIGIN',
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: {
      geolocation: [],
      microphone: [],
      camera: [],
      payment: [],
      usb: [],
      magnetometer: [],
      gyroscope: [],
      accelerometer: [],
    },
    xssProtection: true,
    noSniff: true,
  };
}

// ============================================================================
// Helper: CSP Violation Reporting Endpoint
// ============================================================================

/**
 * Create CSP violation reporting endpoint
 *
 * Add to your CSP: report-uri /api/csp-report
 *
 * @example
 * app.post('/api/csp-report', cspViolationHandler);
 */
export async function cspViolationHandler(req: Request, res: Response): Promise<void> {
  const violation = req.body;

  console.warn('🚨 CSP VIOLATION DETECTED:', {
    documentUri: violation['document-uri'],
    violatedDirective: violation['violated-directive'],
    blockedUri: violation['blocked-uri'],
    originalPolicy: violation['original-policy'],
  });

  // Store violations in database for analysis
  try {
    const { pool } = await import('../database/pool');
    await pool.query(
      `INSERT INTO csp_violations (document_uri, violated_directive, blocked_uri, original_policy, user_agent, ip_address, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT DO NOTHING`,
      [
        violation['document-uri'],
        violation['violated-directive'],
        violation['blocked-uri'],
        violation['original-policy'],
        req.headers['user-agent'] || 'unknown',
        req.ip || req.socket.remoteAddress || 'unknown'
      ]
    );
  } catch (error) {
    console.error('❌ Failed to store CSP violation:', error);
    // Don't fail the request if database is down
  }

  res.status(204).end();
}
