/**
 * MARCUS 3.0 Citation Integrity Platform
 * Admin Management Validation Schemas
 *
 * Zod schemas for admin endpoints
 *
 * @module adminSchemas
 * @author Marcus (Platform Engineer)
 */

import { z } from 'zod';
import {
  userRoleSchema,
  uuidSchema,
} from '../middleware/validation';

// ============================================================================
// User Management Schemas
// ============================================================================

/**
 * PUT /api/admin/users/:userId/role
 */
export const updateUserRoleParamsSchema = z.object({
  userId: uuidSchema,
});

export const updateUserRoleBodySchema = z.object({
  role: userRoleSchema,
});

export type UpdateUserRoleParams = z.infer<typeof updateUserRoleParamsSchema>;
export type UpdateUserRoleBody = z.infer<typeof updateUserRoleBodySchema>;

/**
 * DELETE /api/admin/users/:userId
 */
export const deleteUserParamsSchema = z.object({
  userId: uuidSchema,
});

export type DeleteUserParams = z.infer<typeof deleteUserParamsSchema>;
