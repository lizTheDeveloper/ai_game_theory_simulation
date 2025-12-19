/**
 * MARCUS 3.0 Citation Integrity Platform
 * Authentication Validation Schemas
 *
 * Zod schemas for authentication endpoints
 *
 * @module authSchemas
 * @author Marcus (Platform Engineer)
 */

import { z } from 'zod';
import {
  emailSchema,
  passwordSchema,
  userRoleSchema,
  uuidSchema,
} from '../middleware/validation';

// ============================================================================
// Registration Schemas
// ============================================================================

/**
 * POST /auth/register
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  role: userRoleSchema.optional().default('viewer'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ============================================================================
// Login Schemas
// ============================================================================

/**
 * POST /auth/login
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128, 'Password must not exceed 128 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ============================================================================
// Token Refresh Schemas
// ============================================================================

/**
 * POST /auth/refresh
 */
export const refreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .min(1, 'Refresh token is required')
    .trim(),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

// ============================================================================
// Logout Schemas
// ============================================================================

/**
 * POST /auth/logout
 */
export const logoutSchema = z.object({
  refreshToken: z
    .string()
    .min(1, 'Refresh token is required')
    .trim(),
});

export type LogoutInput = z.infer<typeof logoutSchema>;

// ============================================================================
// Password Reset Schemas
// ============================================================================

/**
 * POST /auth/reset-password/request
 */
export const requestPasswordResetSchema = z.object({
  email: emailSchema,
});

export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;

/**
 * POST /auth/reset-password/verify
 */
export const verifyPasswordResetSchema = z.object({
  token: z
    .string()
    .min(1, 'Reset token is required')
    .trim(),
  newPassword: passwordSchema,
});

export type VerifyPasswordResetInput = z.infer<typeof verifyPasswordResetSchema>;

// ============================================================================
// Password Change Schemas (Authenticated)
// ============================================================================

/**
 * POST /auth/change-password
 */
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required')
    .max(128, 'Current password must not exceed 128 characters'),
  newPassword: passwordSchema,
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
