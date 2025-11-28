/**
 * MARCUS 3.0 Citation Integrity Platform
 * Input Validation Middleware
 *
 * Zod-based schema validation for all API requests
 * Prevents injection attacks, XSS, and data corruption
 *
 * @module validation
 * @author Marcus (Platform Engineer)
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';

// ============================================================================
// Validation Error Response Types
// ============================================================================

export interface ValidationErrorDetail {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationErrorResponse {
  error: 'Bad Request';
  message: string;
  details: ValidationErrorDetail[];
}

// ============================================================================
// Validation Middleware Factory
// ============================================================================

/**
 * Create validation middleware for a Zod schema
 *
 * @param schema - Zod schema to validate against
 * @param source - Request property to validate ('body', 'query', 'params')
 * @returns Express middleware function
 */
export function validateRequest(
  schema: ZodSchema,
  source: 'body' | 'query' | 'params' = 'body'
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate and sanitize the request data
      const validated = schema.parse(req[source]);

      // Replace the request data with validated/sanitized version
      req[source] = validated;

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        // Format Zod errors into user-friendly field-level messages
        const issues = (err as any).issues || [];
        const details: ValidationErrorDetail[] = issues.map((error: any) => ({
          field: error.path.join('.'),
          message: error.message,
          code: error.code,
        }));

        // Create summary message from first error
        const message = details.length > 0
          ? details[0].message
          : 'Request validation failed';

        const response: ValidationErrorResponse = {
          error: 'Bad Request',
          message,
          details,
        };

        res.status(400).json(response);
        return;
      }

      // Unexpected validation error
      console.error('❌ Validation error:', err);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Validation failed unexpectedly',
      });
    }
  };
}

// ============================================================================
// Common Validation Helpers
// ============================================================================

/**
 * Email validation (RFC 5322 compliant)
 */
export const emailSchema = z
  .string()
  .trim()
  .email('Invalid email format')
  .max(255, 'Email must not exceed 255 characters')
  .toLowerCase();

/**
 * Password validation
 * - 8-128 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[^A-Za-z0-9]/,
    'Password must contain at least one special character'
  );

/**
 * UUID v4 validation
 */
export const uuidSchema = z
  .string()
  .uuid('Invalid UUID format')
  .trim();

/**
 * User role validation
 */
export const userRoleSchema = z.enum(['admin', 'operator', 'viewer'], {
  message: 'Role must be admin, operator, or viewer',
});

/**
 * Agent ID validation (UUID v4 format)
 */
export const agentIdSchema = z
  .string()
  .uuid('Invalid agent ID format')
  .trim();

/**
 * Sanitized string validation
 * Trims whitespace and removes dangerous HTML
 */
export const sanitizedStringSchema = (minLength = 1, maxLength = 10000) =>
  z
    .string()
    .min(minLength, `Must be at least ${minLength} characters`)
    .max(maxLength, `Must not exceed ${maxLength} characters`)
    .trim()
    .transform(val => {
      // Basic HTML entity encoding
      return val
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    });

/**
 * URL validation (HTTP/HTTPS only)
 */
export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .refine(
    url => url.startsWith('http://') || url.startsWith('https://'),
    'URL must use HTTP or HTTPS protocol'
  )
  .refine(
    url => url.length <= 2048,
    'URL must not exceed 2048 characters'
  );

/**
 * Citation text validation
 * - 1-50,000 characters
 * - HTML sanitized
 */
export const citationTextSchema = z
  .string()
  .min(1, 'Citation text must not be empty')
  .max(50000, 'Citation text must not exceed 50,000 characters')
  .trim()
  .transform(val => {
    // Sanitize HTML to prevent XSS
    return val
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  });

/**
 * File path validation (prevent directory traversal)
 */
export const filePathSchema = z
  .string()
  .trim()
  .refine(
    path => !path.includes('..'),
    'File path must not contain directory traversal sequences'
  )
  .refine(
    path => !path.startsWith('/'),
    'File path must not be absolute'
  )
  .refine(
    path => !/[<>:"|?*\x00-\x1f]/.test(path),
    'File path contains invalid characters'
  );

/**
 * Pagination validation
 */
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(val => parseInt(val, 10))
    .refine(val => val >= 1, 'Page must be >= 1'),
  limit: z
    .string()
    .optional()
    .default('20')
    .transform(val => parseInt(val, 10))
    .refine(val => val >= 1 && val <= 100, 'Limit must be between 1 and 100'),
});

/**
 * Date range validation
 */
export const dateRangeSchema = z
  .object({
    startDate: z.string().datetime('Invalid start date format'),
    endDate: z.string().datetime('Invalid end date format'),
  })
  .refine(
    data => new Date(data.startDate) <= new Date(data.endDate),
    'Start date must be before or equal to end date'
  );

// ============================================================================
// File Upload Validation
// ============================================================================

/**
 * Allowed file extensions for uploads
 */
export const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.txt', '.json', '.csv'] as const;

/**
 * Allowed MIME types for uploads
 */
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'text/plain',
  'application/json',
  'text/csv',
] as const;

/**
 * Maximum file size (10MB)
 */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Validate file upload metadata
 */
export const fileUploadSchema = z.object({
  filename: z
    .string()
    .min(1, 'Filename must not be empty')
    .max(255, 'Filename must not exceed 255 characters')
    .refine(
      filename => {
        const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
        return ALLOWED_FILE_EXTENSIONS.includes(ext as any);
      },
      `File extension must be one of: ${ALLOWED_FILE_EXTENSIONS.join(', ')}`
    )
    .refine(
      filename => !filename.includes('..'),
      'Filename must not contain directory traversal sequences'
    )
    .refine(
      filename => !/[<>:"|?*\x00-\x1f]/.test(filename),
      'Filename contains invalid characters'
    ),
  mimeType: z
    .string()
    .refine(
      mimeType => ALLOWED_MIME_TYPES.includes(mimeType as any),
      `MIME type must be one of: ${ALLOWED_MIME_TYPES.join(', ')}`
    ),
  size: z
    .number()
    .int('File size must be an integer')
    .min(1, 'File must not be empty')
    .max(MAX_FILE_SIZE_BYTES, `File must not exceed ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`),
});
