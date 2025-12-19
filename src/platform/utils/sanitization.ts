/**
 * MARCUS 3.0 Citation Integrity Platform
 * Input Sanitization Utilities
 *
 * Prevents XSS, injection attacks, and data corruption
 *
 * @module sanitization
 * @author Marcus (Platform Engineer)
 */

import validator from 'validator';

// ============================================================================
// HTML Sanitization
// ============================================================================

/**
 * Sanitize HTML by escaping all dangerous characters
 * Prevents XSS attacks by encoding HTML entities
 *
 * @param input - Raw string input
 * @returns Sanitized string safe for HTML rendering
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Strip all HTML tags from input
 * Uses validator library for robust HTML stripping
 *
 * @param input - String potentially containing HTML
 * @returns Plain text without HTML tags
 */
export function stripHtml(input: string): string {
  if (!input) return '';
  return validator.stripLow(validator.escape(input));
}

// ============================================================================
// SQL Injection Prevention
// ============================================================================

/**
 * Sanitize SQL LIKE pattern
 * Escapes special characters: %, _, \
 *
 * NOTE: This is a defense-in-depth measure.
 * Always use parameterized queries as the primary defense.
 *
 * @param pattern - SQL LIKE pattern
 * @returns Escaped pattern
 */
export function sanitizeSqlLikePattern(pattern: string): string {
  if (!pattern) return '';

  return pattern
    .replace(/\\/g, '\\\\') // Escape backslash first
    .replace(/%/g, '\\%')   // Escape wildcard
    .replace(/_/g, '\\_');  // Escape single char wildcard
}

// ============================================================================
// Path Traversal Prevention
// ============================================================================

/**
 * Sanitize file path to prevent directory traversal
 *
 * @param path - File path
 * @returns Sanitized path or null if dangerous
 */
export function sanitizeFilePath(path: string): string | null {
  if (!path) return null;

  // Remove leading/trailing whitespace
  const sanitized = path.trim();

  // Reject absolute paths
  if (sanitized.startsWith('/') || /^[A-Za-z]:/.test(sanitized)) {
    return null;
  }

  // Reject directory traversal sequences
  if (sanitized.includes('..')) {
    return null;
  }

  // Reject null bytes
  if (sanitized.includes('\x00')) {
    return null;
  }

  // Reject invalid characters
  if (/[<>:"|?*\x00-\x1f]/.test(sanitized)) {
    return null;
  }

  return sanitized;
}

// ============================================================================
// URL Validation & Sanitization
// ============================================================================

/**
 * Validate and sanitize URL
 * Only allows HTTP/HTTPS protocols
 *
 * @param url - URL string
 * @returns Sanitized URL or null if invalid
 */
export function sanitizeUrl(url: string): string | null {
  if (!url) return null;

  const trimmed = url.trim();

  // Validate URL format
  if (!validator.isURL(trimmed, {
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true,
  })) {
    return null;
  }

  // Additional length check
  if (trimmed.length > 2048) {
    return null;
  }

  return trimmed;
}

// ============================================================================
// Email Sanitization
// ============================================================================

/**
 * Validate and normalize email address
 *
 * @param email - Email string
 * @returns Normalized email or null if invalid
 */
export function sanitizeEmail(email: string): string | null {
  if (!email) return null;

  const trimmed = email.trim().toLowerCase();

  // Validate email format
  if (!validator.isEmail(trimmed)) {
    return null;
  }

  // Length check
  if (trimmed.length > 255) {
    return null;
  }

  return validator.normalizeEmail(trimmed) || trimmed;
}

// ============================================================================
// File Upload Sanitization
// ============================================================================

/**
 * File extension whitelist
 */
const ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.json', '.csv'];

/**
 * MIME type whitelist
 */
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'text/plain',
  'application/json',
  'text/csv',
];

/**
 * Validate file extension
 *
 * @param filename - File name
 * @returns True if extension is allowed
 */
export function isAllowedFileExtension(filename: string): boolean {
  if (!filename) return false;

  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

/**
 * Validate MIME type
 *
 * @param mimeType - MIME type string
 * @returns True if MIME type is allowed
 */
export function isAllowedMimeType(mimeType: string): boolean {
  if (!mimeType) return false;
  return ALLOWED_MIME_TYPES.includes(mimeType);
}

/**
 * Sanitize filename
 * Removes dangerous characters and sequences
 *
 * @param filename - Original filename
 * @returns Sanitized filename or null if dangerous
 */
export function sanitizeFilename(filename: string): string | null {
  if (!filename) return null;

  const trimmed = filename.trim();

  // Check length
  if (trimmed.length === 0 || trimmed.length > 255) {
    return null;
  }

  // Reject directory traversal
  if (trimmed.includes('..')) {
    return null;
  }

  // Reject null bytes
  if (trimmed.includes('\x00')) {
    return null;
  }

  // Reject invalid characters
  if (/[<>:"|?*\x00-\x1f]/.test(trimmed)) {
    return null;
  }

  return trimmed;
}

/**
 * Validate file upload
 * Checks extension, MIME type, and size
 *
 * @param filename - File name
 * @param mimeType - MIME type
 * @param size - File size in bytes
 * @param maxSizeBytes - Maximum allowed size (default: 10MB)
 * @returns Validation result with sanitized values
 */
export function validateFileUpload(
  filename: string,
  mimeType: string,
  size: number,
  maxSizeBytes: number = 10 * 1024 * 1024
): {
  valid: boolean;
  error?: string;
  sanitizedFilename?: string;
} {
  // Sanitize filename
  const sanitizedFilename = sanitizeFilename(filename);
  if (!sanitizedFilename) {
    return { valid: false, error: 'Invalid filename' };
  }

  // Check extension
  if (!isAllowedFileExtension(sanitizedFilename)) {
    return {
      valid: false,
      error: `File extension not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }

  // Check MIME type
  if (!isAllowedMimeType(mimeType)) {
    return {
      valid: false,
      error: `MIME type not allowed. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
    };
  }

  // Check file size
  if (size <= 0 || size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size must be between 1 byte and ${maxSizeBytes / 1024 / 1024}MB`,
    };
  }

  return { valid: true, sanitizedFilename };
}

// ============================================================================
// Magic Number Validation (File Content)
// ============================================================================

/**
 * File magic numbers (first bytes) for validation
 */
const FILE_MAGIC_NUMBERS: Record<string, number[]> = {
  pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
  txt: [], // Text files don't have magic numbers
  json: [0x7b, 0x5b], // { or [
  csv: [], // CSV files don't have magic numbers
};

/**
 * Validate file content by checking magic numbers
 * Prevents attacks where file extension doesn't match content
 *
 * @param buffer - File content buffer (first ~10 bytes)
 * @param extension - File extension
 * @returns True if magic number matches extension
 */
export function validateFileMagicNumber(
  buffer: Buffer,
  extension: string
): boolean {
  const ext = extension.toLowerCase().replace('.', '');
  const magicNumbers = FILE_MAGIC_NUMBERS[ext];

  // No magic number for this type (text/csv) - allow
  if (!magicNumbers || magicNumbers.length === 0) {
    return true;
  }

  // Check if buffer starts with expected magic number
  for (let i = 0; i < magicNumbers.length; i++) {
    if (buffer[i] !== magicNumbers[i]) {
      return false;
    }
  }

  return true;
}

// ============================================================================
// JSON Sanitization
// ============================================================================

/**
 * Sanitize JSON object recursively
 * Escapes all string values to prevent XSS
 *
 * @param obj - JSON object
 * @returns Sanitized object
 */
export function sanitizeJsonObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeHtml(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeJsonObject);
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeJsonObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
}

// ============================================================================
// Rate Limit Key Sanitization
// ============================================================================

/**
 * Sanitize IP address for rate limit keys
 * Handles IPv4, IPv6, and X-Forwarded-For headers
 *
 * @param ip - IP address or comma-separated list
 * @returns Sanitized IP address
 */
export function sanitizeIpAddress(ip: string): string {
  if (!ip) return 'unknown';

  // Handle X-Forwarded-For (comma-separated IPs)
  const firstIp = ip.split(',')[0].trim();

  // Validate IP format
  if (validator.isIP(firstIp)) {
    return firstIp;
  }

  return 'unknown';
}
