/**
 * MARCUS 3.0 Citation Integrity Platform
 * Role-Based Access Control (RBAC) Middleware
 *
 * Implements permission checks based on user roles:
 * - admin: Full access to all endpoints
 * - operator: Read/write citations, read metrics
 * - viewer: Read-only access
 *
 * @module rbacMiddleware
 * @author Marcus (Platform Engineer)
 */

import { Request, Response, NextFunction } from 'express';
import { UserRole } from './authService';

// ============================================================================
// Types
// ============================================================================

export type Permission =
  // Citation operations
  | 'citations:read'
  | 'citations:write'
  | 'citations:analyze'

  // Metrics operations
  | 'metrics:read'
  | 'metrics:write'

  // Agent operations
  | 'agents:read'
  | 'agents:write'
  | 'agents:control'

  // User management
  | 'users:read'
  | 'users:write'

  // Admin operations
  | 'admin:all';

// ============================================================================
// RBAC Configuration
// ============================================================================

/**
 * Role permission mapping
 * Defines what each role is allowed to do
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // Viewers can only read data
  viewer: [
    'citations:read',
    'metrics:read',
    'agents:read',
  ],

  // Operators can read/write citations and agents, read metrics
  operator: [
    'citations:read',
    'citations:write',
    'citations:analyze',
    'metrics:read',
    'agents:read',
    'agents:write',
  ],

  // Admins have full access
  admin: [
    'citations:read',
    'citations:write',
    'citations:analyze',
    'metrics:read',
    'metrics:write',
    'agents:read',
    'agents:write',
    'agents:control',
    'users:read',
    'users:write',
    'admin:all',
  ],
};

// ============================================================================
// RBAC Middleware
// ============================================================================

export class RBACMiddleware {
  /**
   * Check if user has required permission
   */
  private static hasPermission(userRole: UserRole, requiredPermission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[userRole];

    if (!permissions) {
      throw new Error(
        `❌ CRITICAL: Unknown user role: ${userRole}`
      );
    }

    // Check for specific permission or admin wildcard
    return permissions.includes(requiredPermission) || permissions.includes('admin:all');
  }

  /**
   * Check if user has ANY of the required permissions
   */
  private static hasAnyPermission(userRole: UserRole, requiredPermissions: Permission[]): boolean {
    return requiredPermissions.some(permission =>
      RBACMiddleware.hasPermission(userRole, permission)
    );
  }

  /**
   * Check if user has ALL of the required permissions
   */
  private static hasAllPermissions(userRole: UserRole, requiredPermissions: Permission[]): boolean {
    return requiredPermissions.every(permission =>
      RBACMiddleware.hasPermission(userRole, permission)
    );
  }

  /**
   * Middleware factory: require specific permission
   */
  static requirePermission(permission: Permission) {
    return (req: Request, res: Response, next: NextFunction): void => {
      // Check if user is authenticated (should be set by JWT middleware)
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const userRole = req.user.role;

      // Check permission
      if (!RBACMiddleware.hasPermission(userRole, permission)) {
        res.status(403).json({
          error: 'Forbidden',
          message: `Insufficient permissions. Required: ${permission}`,
          userRole,
          requiredPermission: permission,
        });
        return;
      }

      // Permission granted
      next();
    };
  }

  /**
   * Middleware factory: require ANY of the specified permissions
   */
  static requireAnyPermission(...permissions: Permission[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const userRole = req.user.role;

      if (!RBACMiddleware.hasAnyPermission(userRole, permissions)) {
        res.status(403).json({
          error: 'Forbidden',
          message: `Insufficient permissions. Required any of: ${permissions.join(', ')}`,
          userRole,
          requiredPermissions: permissions,
        });
        return;
      }

      next();
    };
  }

  /**
   * Middleware factory: require ALL of the specified permissions
   */
  static requireAllPermissions(...permissions: Permission[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const userRole = req.user.role;

      if (!RBACMiddleware.hasAllPermissions(userRole, permissions)) {
        res.status(403).json({
          error: 'Forbidden',
          message: `Insufficient permissions. Required all of: ${permissions.join(', ')}`,
          userRole,
          requiredPermissions: permissions,
        });
        return;
      }

      next();
    };
  }

  /**
   * Middleware factory: require specific role
   */
  static requireRole(role: UserRole) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      if (req.user.role !== role) {
        res.status(403).json({
          error: 'Forbidden',
          message: `Insufficient permissions. Required role: ${role}`,
          userRole: req.user.role,
          requiredRole: role,
        });
        return;
      }

      next();
    };
  }

  /**
   * Middleware factory: require ANY of the specified roles
   */
  static requireAnyRole(...roles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      if (!roles.includes(req.user.role)) {
        res.status(403).json({
          error: 'Forbidden',
          message: `Insufficient permissions. Required any of roles: ${roles.join(', ')}`,
          userRole: req.user.role,
          requiredRoles: roles,
        });
        return;
      }

      next();
    };
  }

  /**
   * Middleware: require admin role (convenience shorthand)
   */
  static requireAdmin = RBACMiddleware.requireRole('admin');

  /**
   * Middleware: require operator or admin role
   */
  static requireOperator = RBACMiddleware.requireAnyRole('operator', 'admin');
}

// ============================================================================
// Convenience Exports
// ============================================================================

export const requirePermission = RBACMiddleware.requirePermission;
export const requireAnyPermission = RBACMiddleware.requireAnyPermission;
export const requireAllPermissions = RBACMiddleware.requireAllPermissions;
export const requireRole = RBACMiddleware.requireRole;
export const requireAnyRole = RBACMiddleware.requireAnyRole;
export const requireAdmin = RBACMiddleware.requireAdmin;
export const requireOperator = RBACMiddleware.requireOperator;
