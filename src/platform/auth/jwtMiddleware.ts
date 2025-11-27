/**
 * MARCUS 3.0 Citation Integrity Platform
 * JWT Middleware
 *
 * Express middleware for JWT token validation
 *
 * @module jwtMiddleware
 * @author Marcus (Platform Engineer)
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService, JWTPayload, UserRole } from './authService';

// ============================================================================
// Extend Express Request type to include user
// ============================================================================

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// ============================================================================
// JWT Middleware
// ============================================================================

export class JWTMiddleware {
  private authService: AuthService;

  constructor(authService: AuthService) {
    if (!authService) {
      throw new Error(
        '❌ CRITICAL: AuthService required for JWTMiddleware'
      );
    }
    this.authService = authService;
  }

  /**
   * Middleware to verify JWT access token
   * Extracts token from Authorization header and validates it
   */
  authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;

      // lgtm[js/user-controlled-bypass] Intentional: missing auth header results in 401 rejection, not bypass
      if (!authHeader) { // NOSONAR
        res.status(401).json({
          error: 'Unauthorized',
          message: 'No authorization header provided',
        });
        return;
      }

      // Expect format: "Bearer <token>"
      const parts = authHeader.split(' ');

      // lgtm[js/user-controlled-bypass] Intentional: invalid format results in 401 rejection, not bypass
      if (parts.length !== 2 || parts[0] !== 'Bearer') { // NOSONAR
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid authorization header format. Expected: "Bearer <token>"',
        });
        return;
      }

      const token = parts[1];

      // Verify token
      try {
        const payload = this.authService.verifyAccessToken(token);

        // Attach user to request
        req.user = payload;

        // Continue to next middleware
        next();

      } catch (err) {
        // Token verification failed
        const message = (err as Error).message;

        if (message.includes('expired')) {
          res.status(401).json({
            error: 'Unauthorized',
            message: 'Access token has expired. Use refresh token to obtain new access token.',
            code: 'TOKEN_EXPIRED',
          });
          return;
        }

        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid access token',
        });
        return;
      }

    } catch (err) {
      console.error('❌ JWT middleware error:', err);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Authentication check failed',
      });
    }
  };

  /**
   * Optional authentication - sets req.user if token is valid, but doesn't block request
   * Useful for endpoints that provide different data based on authentication status
   */
  optionalAuthenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;

      // lgtm[js/user-controlled-bypass] Intentional: optional auth allows unauthenticated access by design
      if (!authHeader) { // NOSONAR
        // No auth header - continue without user
        next();
        return;
      }

      const parts = authHeader.split(' ');

      // lgtm[js/user-controlled-bypass] Intentional: optional auth allows invalid format to pass by design
      if (parts.length !== 2 || parts[0] !== 'Bearer') { // NOSONAR
        // Invalid format - continue without user
        next();
        return;
      }

      const token = parts[1];

      try {
        const payload = this.authService.verifyAccessToken(token);
        req.user = payload;
      } catch (err) {
        // Token invalid - continue without user (don't block request)
        console.log('⚠️ Optional auth: invalid token, continuing without user');
      }

      next();

    } catch (err) {
      console.error('❌ Optional JWT middleware error:', err);
      // Don't block on error for optional auth
      next();
    }
  };
}

// ============================================================================
// Convenience Factory Functions
// ============================================================================

/**
 * Create JWT middleware instance
 */
export function createJWTMiddleware(authService: AuthService): JWTMiddleware {
  return new JWTMiddleware(authService);
}

/**
 * Create middleware function that requires authentication
 */
export function requireAuth(authService: AuthService) {
  const middleware = new JWTMiddleware(authService);
  return middleware.authenticate;
}

/**
 * Create middleware function for optional authentication
 */
export function optionalAuth(authService: AuthService) {
  const middleware = new JWTMiddleware(authService);
  return middleware.optionalAuthenticate;
}
