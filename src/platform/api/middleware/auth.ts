/**
 * Authentication & Authorization Middleware
 *
 * OWASP A01: Broken Access Control
 * OWASP A07: Identification and Authentication Failures
 *
 * Implements:
 * - JWT token verification
 * - Role-Based Access Control (RBAC)
 * - Request context enrichment
 */

import { FastifyRequest, FastifyReply, preHandlerHookHandler } from 'fastify';
import { AuthPayload, UserRole } from '../types/api';

/**
 * Authenticate request (verify JWT token)
 *
 * Attaches user payload to request.user
 */
export const authenticate: preHandlerHookHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // OWASP A07: Verify JWT token
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or missing authentication token',
      },
    });
  }
};

/**
 * Authorize request based on user role (RBAC)
 *
 * @param allowedRoles - Array of roles that can access this endpoint
 */
export function authorize(allowedRoles: UserRole[]): preHandlerHookHandler {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as AuthPayload;

    if (!user) {
      return reply.status(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    // OWASP A01: Check role-based access
    if (!allowedRoles.includes(user.role)) {
      request.log.warn({
        userId: user.userId,
        role: user.role,
        allowedRoles,
        path: request.url,
      }, 'Access denied: insufficient permissions');

      return reply.status(403).send({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions for this operation',
          details: {
            required: allowedRoles,
            actual: user.role,
          },
        },
      });
    }
  };
}

/**
 * Optional authentication (doesn't fail if no token)
 *
 * Useful for endpoints with different behavior for authenticated vs anonymous users
 */
export const optionalAuth: preHandlerHookHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    // Ignore error, continue without authentication
    request.log.debug('Optional auth: No valid token provided');
  }
};

/**
 * Generate JWT token for user
 *
 * @param payload - User authentication payload
 * @param secret - JWT secret
 * @returns Signed JWT token
 */
export async function generateToken(
  payload: Omit<AuthPayload, 'exp' | 'iat'>,
  secret: string
): Promise<string> {
  const { default: jwt } = await import('jsonwebtoken');

  // OWASP A02: Use strong signing algorithm
  return jwt.sign(payload, secret, {
    algorithm: 'HS256', // Use RS256 in production
    expiresIn: '1h',
  });
}

/**
 * Verify JWT token
 *
 * @param token - JWT token
 * @param secret - JWT secret
 * @returns Decoded payload
 */
export async function verifyToken(
  token: string,
  secret: string
): Promise<AuthPayload> {
  const { default: jwt } = await import('jsonwebtoken');

  try {
    const payload = jwt.verify(token, secret, {
      algorithms: ['HS256'], // Use RS256 in production
    }) as AuthPayload;

    return payload;
  } catch (err) {
    throw new Error('Invalid token');
  }
}

/**
 * Hash password (for user registration)
 *
 * OWASP A02: Use bcrypt for password hashing
 */
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcrypt');
  const saltRounds = 12; // OWASP recommendation
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify password
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const bcrypt = await import('bcrypt');
  return bcrypt.compare(password, hash);
}
