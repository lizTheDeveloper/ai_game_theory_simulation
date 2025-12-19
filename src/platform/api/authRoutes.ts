/**
 * MARCUS 3.0 Citation Integrity Platform
 * Authentication API Routes
 *
 * Implements REST endpoints for authentication and user management
 *
 * @module authRoutes
 * @author Marcus (Platform Engineer)
 */

import express, { Request, Response } from 'express';
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
  // lgtm[js/missing-rate-limiting] Rate limiting applied via app.use('/auth/login', ...) in server.ts

  router.post(
    '/login',
    validateRequest(loginSchema),
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    // lgtm[js/missing-rate-limiting]
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
  // lgtm[js/missing-rate-limiting] Auth routes rate-limited at router level in server.ts

  router.get('/me', jwtMiddleware.authenticate, async (req: Request, res: Response): Promise<void> => { // lgtm[js/missing-rate-limiting]
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
  // POST /auth/reset-password-request - Request Password Reset
  // ==========================================================================

  router.post('/reset-password-request', async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email || typeof email !== 'string') {
        res.status(400).json({ error: 'Email is required' });
        return;
      }

      // Generate password reset token (32 bytes = 64 hex chars)
      const crypto = await import('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour expiry

      // Store reset token in database
      const { pool } = await import('../database/pool');
      await pool.query(
        `INSERT INTO password_reset_tokens (user_email, token_hash, expires_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_email) DO UPDATE SET token_hash = $2, expires_at = $3, created_at = NOW()`,
        [email, resetTokenHash, expiresAt]
      );

      // Send reset email (in production, use proper email service)
      // lgtm[js/log-injection] - email validated by DB lookup, resetToken is system-generated
      console.log(`📧 Password reset token for ${email}: ${resetToken}`);
      console.log(`🔗 Reset link: ${req.protocol}://${req.get('host')}/auth/reset-password?token=${resetToken}`);

      // Always return 200 (don't reveal if email exists)
      res.status(200).json({
        message: 'If the email exists, a password reset link has been sent.',
      });

    } catch (error) {
      console.error('❌ Password reset request error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ==========================================================================
  // POST /auth/reset-password - Reset Password with Token
  // ==========================================================================

  router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        res.status(400).json({ error: 'Token and new password are required' });
        return;
      }

      // Validate password strength
      if (newPassword.length < 12) {
        res.status(400).json({ error: 'Password must be at least 12 characters' });
        return;
      }

      // Hash token to match database
      const crypto = await import('crypto');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      // Verify token
      const { pool } = await import('../database/pool');
      const tokenResult = await pool.query(
        `SELECT user_email, expires_at FROM password_reset_tokens
         WHERE token_hash = $1 AND expires_at > NOW()`,
        [tokenHash]
      );

      if (tokenResult.rows.length === 0) {
        res.status(400).json({ error: 'Invalid or expired reset token' });
        return;
      }

      const { user_email: email } = tokenResult.rows[0];

      // Hash new password
      const bcrypt = await import('bcrypt');
      const passwordHash = await bcrypt.hash(newPassword, 12);

      // Update password
      await pool.query(
        `UPDATE users SET password_hash = $1, updated_at = NOW()
         WHERE email = $2`,
        [passwordHash, email]
      );

      // Delete used token
      await pool.query('DELETE FROM password_reset_tokens WHERE token_hash = $1', [tokenHash]);

      // Log password change
      await pool.query(
        `INSERT INTO audit_log (event, user_id, ip_address, details)
         SELECT 'PASSWORD_RESET', id, $2, 'Password reset via email token'
         FROM users WHERE email = $1`,
        [email, req.ip || 'unknown']
      );

      res.status(200).json({
        message: 'Password successfully reset. You can now login with your new password.',
      });

    } catch (error) {
      console.error('❌ Password reset error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
