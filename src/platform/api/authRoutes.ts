/**
 * MARCUS 3.0 Citation Integrity Platform
 * Authentication API Routes
 *
 * Implements REST endpoints for authentication and user management
 *
 * @module authRoutes
 * @author Marcus (Platform Engineer)
 */

import express = require('express');
import { Request, Response } from 'express';
import { AuthService } from '../auth/authService';
import { JWTMiddleware } from '../auth/jwtMiddleware';
import { validateRequest } from '../middleware/validation';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
} from '../schemas/authSchemas';

// ============================================================================
// Auth Routes
// ============================================================================

export function createAuthRoutes(authService: AuthService, jwtMiddleware: JWTMiddleware): express.Router {
  const router = express.Router();

  // ==========================================================================
  // POST /auth/register - User Registration
  // ==========================================================================

  router.post(
    '/register',
    validateRequest(registerSchema),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const body = req.body;

      // Get client IP and user agent for audit logging
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      // Register user
      const user = await authService.register(
        {
          email: body.email,
          password: body.password,
          role: body.role,
        },
        {
          ipAddress,
          userAgent,
        }
      );

        res.status(201).json({
          message: 'User registered successfully',
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
          },
        });

      } catch (err) {
      const message = (err as Error).message;

      // Check for specific error types
      if (message.includes('already exists')) {
        res.status(409).json({
          error: 'Conflict',
          message: 'User with this email already exists',
        });
        return;
      }

      if (message.includes('Password must')) {
        res.status(400).json({
          error: 'Bad Request',
          message: message.replace('❌ ', ''),
        });
        return;
      }

      if (message.includes('Invalid email')) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid email format',
        });
        return;
      }

        console.error('❌ Registration error:', err);
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Registration failed',
        });
      }
    }
  );

  // ==========================================================================
  // POST /auth/login - User Login
  // ==========================================================================

  router.post(
    '/login',
    validateRequest(loginSchema),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const body = req.body;

      // Get client IP and user agent for audit logging
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      // Login user
      const tokens = await authService.login({
        email: body.email,
        password: body.password,
        ipAddress,
        userAgent,
      });

        res.status(200).json({
          message: 'Login successful',
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
          tokenType: 'Bearer',
        });

      } catch (err) {
      const message = (err as Error).message;

      // Check for specific error types
      if (message.includes('Invalid email or password')) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid email or password',
        });
        return;
      }

      if (message.includes('Account locked')) {
        res.status(403).json({
          error: 'Forbidden',
          message: message.replace('❌ ', ''),
        });
        return;
      }

      if (message.includes('Account is disabled')) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Account is disabled. Contact administrator.',
        });
        return;
      }

        console.error('❌ Login error:', err);
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Login failed',
        });
      }
    }
  );

  // ==========================================================================
  // POST /auth/refresh - Refresh Access Token
  // ==========================================================================

  router.post(
    '/refresh',
    validateRequest(refreshTokenSchema),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const body = req.body;

      // Refresh tokens
      const tokens = await authService.refreshAccessToken(body.refreshToken);

        res.status(200).json({
          message: 'Token refreshed successfully',
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
          tokenType: 'Bearer',
        });

      } catch (err) {
      const message = (err as Error).message;

      // Check for specific error types
      if (message.includes('Invalid refresh token') ||
          message.includes('not found') ||
          message.includes('revoked') ||
          message.includes('expired')) {
        res.status(401).json({
          error: 'Unauthorized',
          message: message.replace('❌ ', ''),
        });
        return;
      }

      if (message.includes('Account is disabled')) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Account is disabled. Contact administrator.',
        });
        return;
      }

        console.error('❌ Token refresh error:', err);
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Token refresh failed',
        });
      }
    }
  );

  // ==========================================================================
  // POST /auth/logout - User Logout
  // ==========================================================================

  router.post(
    '/logout',
    validateRequest(logoutSchema),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const body = req.body;

      // Logout (revoke refresh token)
      await authService.logout(body.refreshToken);

        res.status(200).json({
          message: 'Logout successful',
        });

      } catch (err) {
        console.error('❌ Logout error:', err);
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Logout failed',
        });
      }
    }
  );

  // ==========================================================================
  // GET /auth/me - Get Current User Info (Protected)
  // ==========================================================================

  router.get('/me', jwtMiddleware.authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
      // User is guaranteed to exist (set by JWT middleware)
      if (!req.user) {
        throw new Error('❌ CRITICAL: User not set by JWT middleware');
      }

      // Get full user details from database
      const user = await authService.getUserById(req.user.userId);

      if (!user) {
        res.status(404).json({
          error: 'Not Found',
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        },
      });

    } catch (err) {
      console.error('❌ Get user error:', err);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve user information',
      });
    }
  });

  // ==========================================================================
  // POST /auth/reset-password - Password Reset (Placeholder)
  // ==========================================================================

  router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
    // TODO: Implement password reset flow
    // This would typically involve:
    // 1. Generate password reset token
    // 2. Send email with reset link
    // 3. Verify token and allow password update

    res.status(501).json({
      error: 'Not Implemented',
      message: 'Password reset not yet implemented',
    });
  });

  return router;
}
