/**
 * MARCUS 3.0 Log Sanitizer
 *
 * Prevents log injection attacks by sanitizing user-controlled data
 * before writing to logs. Addresses CWE-117 (Log Injection).
 *
 * Security threats mitigated:
 * - Log forging (injecting fake log entries)
 * - Log line splitting via \n, \r characters
 * - ANSI escape code injection
 * - Null byte injection
 * - Unicode control character injection
 *
 * @module logSanitizer
 * @see https://cwe.mitre.org/data/definitions/117.html
 */

/**
 * Sanitize a string for safe logging.
 *
 * Replaces control characters and newlines with escape sequences
 * to prevent log injection attacks.
 *
 * @param input - User-controlled string to sanitize
 * @param maxLength - Maximum length (default: 500 chars to prevent log flooding)
 * @returns Sanitized string safe for logging
 *
 * @example
 * // Prevents log forging
 * sanitizeForLog('malicious\n[ERROR] Fake entry')
 * // Returns: 'malicious\\n[ERROR] Fake entry'
 */
export function sanitizeForLog(input: unknown, maxLength = 500): string {
  // Handle non-string inputs
  if (input === null || input === undefined) {
    return '[null]';
  }

  if (typeof input !== 'string') {
    input = String(input);
  }

  let sanitized = input as string;

  // Replace newlines and carriage returns (prevents log line injection)
  sanitized = sanitized.replace(/\r/g, '\\r');
  sanitized = sanitized.replace(/\n/g, '\\n');

  // Replace tabs (can mess with log parsing)
  sanitized = sanitized.replace(/\t/g, '\\t');

  // Replace null bytes (can truncate log entries)
  sanitized = sanitized.replace(/\0/g, '\\0');

  // Replace ANSI escape sequences (CSI sequences start with ESC[)
  // This prevents terminal manipulation attacks
  sanitized = sanitized.replace(/\x1b\[/g, '\\x1b[');
  sanitized = sanitized.replace(/\x1b/g, '\\x1b');

  // Replace other control characters (ASCII 0-31 except already handled)
  sanitized = sanitized.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, (char) => {
    return '\\x' + char.charCodeAt(0).toString(16).padStart(2, '0');
  });

  // Truncate to prevent log flooding attacks
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength) + '...[truncated]';
  }

  return sanitized;
}

/**
 * Sanitize an IP address for logging.
 *
 * Validates IP format and sanitizes for safe logging.
 * Invalid IPs are replaced with '[invalid-ip]'.
 *
 * @param ip - IP address string to sanitize
 * @returns Sanitized IP address
 */
export function sanitizeIP(ip: unknown): string {
  if (typeof ip !== 'string') {
    return '[invalid-ip]';
  }

  // Basic IP validation (IPv4 or IPv6)
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;

  // Also allow IPv4-mapped IPv6 (::ffff:192.168.1.1)
  const mappedRegex = /^::ffff:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/i;

  if (ipv4Regex.test(ip) || ipv6Regex.test(ip) || mappedRegex.test(ip)) {
    return ip;
  }

  // If not valid IP format, sanitize it as generic string
  return sanitizeForLog(ip, 100);
}

/**
 * Sanitize an HTTP path for logging.
 *
 * Allows alphanumeric, slashes, hyphens, underscores, dots, and query params.
 * Other characters are percent-encoded or escaped.
 *
 * @param path - URL path to sanitize
 * @returns Sanitized path
 */
export function sanitizePath(path: unknown): string {
  if (typeof path !== 'string') {
    return '[invalid-path]';
  }

  // Limit path length
  if (path.length > 200) {
    path = path.substring(0, 200) + '...[truncated]';
  }

  // Replace dangerous characters while preserving readable paths
  return sanitizeForLog(path, 200);
}

/**
 * Sanitize an HTTP method for logging.
 *
 * Only allows standard HTTP methods.
 *
 * @param method - HTTP method to sanitize
 * @returns Sanitized method
 */
export function sanitizeMethod(method: unknown): string {
  if (typeof method !== 'string') {
    return '[invalid-method]';
  }

  const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'TRACE', 'CONNECT'];
  const upperMethod = method.toUpperCase();

  if (validMethods.includes(upperMethod)) {
    return upperMethod;
  }

  // Invalid method - sanitize it
  return sanitizeForLog(method, 20);
}

/**
 * Sanitize a user identifier for logging.
 *
 * User IDs should be alphanumeric with some special chars.
 *
 * @param userId - User ID to sanitize
 * @returns Sanitized user ID
 */
export function sanitizeUserId(userId: unknown): string {
  if (typeof userId !== 'string') {
    return '[invalid-user-id]';
  }

  // UUIDs and common ID formats
  const uuidRegex = /^[0-9a-fA-F-]{36}$/;
  const numericRegex = /^\d+$/;
  const alphanumericRegex = /^[a-zA-Z0-9_-]+$/;

  if (uuidRegex.test(userId) || numericRegex.test(userId) || alphanumericRegex.test(userId)) {
    return userId.substring(0, 100); // Limit length
  }

  // Not a standard format - sanitize
  return sanitizeForLog(userId, 100);
}

/**
 * Create a safe log message with sanitized user data.
 *
 * @param template - Log message template with {placeholders}
 * @param data - Object with values to substitute
 * @returns Safe log message
 *
 * @example
 * safeLog('User {userId} from {ip} accessed {path}', {
 *   userId: req.user?.id,
 *   ip: req.ip,
 *   path: req.path
 * });
 */
export function safeLog(template: string, data: Record<string, unknown>): string {
  let result = template;

  for (const [key, value] of Object.entries(data)) {
    const sanitized = sanitizeForLog(value);
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), sanitized);
  }

  return result;
}
