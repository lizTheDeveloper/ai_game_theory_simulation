/**
 * MARCUS 3.0 Citation Integrity Platform
 * Sanitization Utilities Tests
 *
 * Tests for XSS prevention, SQL injection prevention, and path traversal
 *
 * @author Marcus (Platform Engineer)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeHtml,
  stripHtml,
  sanitizeSqlLikePattern,
  sanitizeFilePath,
  sanitizeUrl,
  sanitizeEmail,
  isAllowedFileExtension,
  isAllowedMimeType,
  sanitizeFilename,
  validateFileUpload,
  sanitizeJsonObject,
  sanitizeIpAddress,
} from '../utils/sanitization';

// ============================================================================
// HTML Sanitization Tests
// ============================================================================

describe('HTML Sanitization', () => {
  it('should escape HTML entities', () => {
    const input = '<script>alert("xss")</script>';
    const result = sanitizeHtml(input);
    assert.match(result, /&lt;script&gt;/);
    assert.doesNotMatch(result, /<script>/i);
  });

  it('should escape quotes', () => {
    const input = 'Test "double" and \'single\' quotes';
    const result = sanitizeHtml(input);
    assert.match(result, /&quot;/);
    assert.match(result, /&#x27;/);
  });

  it('should escape slashes', () => {
    const input = 'Path: /usr/bin/test';
    const result = sanitizeHtml(input);
    assert.match(result, /&#x2F;/);
  });

  it('should handle empty strings', () => {
    const result = sanitizeHtml('');
    assert.equal(result, '');
  });
});

describe('Strip HTML', () => {
  it('should remove all HTML tags', () => {
    const input = '<p>Hello <b>World</b></p>';
    const result = stripHtml(input);
    assert.doesNotMatch(result, /<[^>]+>/);
  });

  it('should escape remaining content', () => {
    const input = '<script>alert("xss")</script>';
    const result = stripHtml(input);
    assert.doesNotMatch(result, /<script>/i);
  });
});

// ============================================================================
// SQL Injection Prevention Tests
// ============================================================================

describe('SQL LIKE Pattern Sanitization', () => {
  it('should escape percent signs', () => {
    const input = 'test%pattern';
    const result = sanitizeSqlLikePattern(input);
    assert.equal(result, 'test\\%pattern');
  });

  it('should escape underscores', () => {
    const input = 'test_pattern';
    const result = sanitizeSqlLikePattern(input);
    assert.equal(result, 'test\\_pattern');
  });

  it('should escape backslashes', () => {
    const input = 'test\\pattern';
    const result = sanitizeSqlLikePattern(input);
    assert.equal(result, 'test\\\\pattern');
  });

  it('should escape multiple special characters', () => {
    const input = 'test%_\\pattern';
    const result = sanitizeSqlLikePattern(input);
    assert.equal(result, 'test\\%\\_\\\\pattern');
  });
});

// ============================================================================
// File Path Sanitization Tests
// ============================================================================

describe('File Path Sanitization', () => {
  it('should accept valid relative paths', () => {
    const validPaths = [
      'uploads/file.pdf',
      'documents/reports/2024/report.txt',
      'data.json',
    ];

    for (const path of validPaths) {
      const result = sanitizeFilePath(path);
      assert.equal(result, path.trim(), `Path ${path} should be accepted`);
    }
  });

  it('should reject absolute paths', () => {
    const absolutePaths = [
      '/etc/passwd',
      '/var/www/html/index.html',
    ];

    for (const path of absolutePaths) {
      const result = sanitizeFilePath(path);
      assert.equal(result, null, `Path ${path} should be rejected`);
    }
  });

  it('should reject directory traversal', () => {
    const dangerousPaths = [
      '../etc/passwd',
      'uploads/../../etc/passwd',
      'data/../../../etc/passwd',
    ];

    for (const path of dangerousPaths) {
      const result = sanitizeFilePath(path);
      assert.equal(result, null, `Path ${path} should be rejected`);
    }
  });

  it('should reject null bytes', () => {
    const result = sanitizeFilePath('file\x00.txt');
    assert.equal(result, null);
  });

  it('should reject invalid characters', () => {
    const invalidPaths = [
      'file<name>.txt',
      'file|name.txt',
      'file:name.txt',
      'file*name.txt',
    ];

    for (const path of invalidPaths) {
      const result = sanitizeFilePath(path);
      assert.equal(result, null, `Path ${path} should be rejected`);
    }
  });

  it('should trim whitespace', () => {
    const result = sanitizeFilePath('  uploads/file.pdf  ');
    assert.equal(result, 'uploads/file.pdf');
  });
});

// ============================================================================
// URL Sanitization Tests
// ============================================================================

describe('URL Sanitization', () => {
  it('should accept valid HTTP/HTTPS URLs', () => {
    const validUrls = [
      'http://example.com',
      'https://www.example.com',
      'https://example.com/path/to/resource',
    ];

    for (const url of validUrls) {
      const result = sanitizeUrl(url);
      assert.ok(result, `URL ${url} should be accepted`);
    }
  });

  it('should reject non-HTTP/HTTPS protocols', () => {
    const invalidUrls = [
      'ftp://example.com',
      'file:///etc/passwd',
      'javascript:alert(1)',
    ];

    for (const url of invalidUrls) {
      const result = sanitizeUrl(url);
      assert.equal(result, null, `URL ${url} should be rejected`);
    }
  });

  it('should reject URLs exceeding 2048 characters', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(2048);
    const result = sanitizeUrl(longUrl);
    assert.equal(result, null);
  });

  it('should trim whitespace', () => {
    const result = sanitizeUrl('  https://example.com  ');
    assert.equal(result, 'https://example.com');
  });
});

// ============================================================================
// Email Sanitization Tests
// ============================================================================

describe('Email Sanitization', () => {
  it('should accept and normalize valid emails', () => {
    const result = sanitizeEmail('USER@EXAMPLE.COM');
    assert.ok(result);
    assert.equal(result, 'user@example.com');
  });

  it('should reject invalid email formats', () => {
    const invalidEmails = [
      'not-an-email',
      '@example.com',
      'user@',
      'user name@example.com',
    ];

    for (const email of invalidEmails) {
      const result = sanitizeEmail(email);
      assert.equal(result, null, `Email ${email} should be rejected`);
    }
  });

  it('should reject emails exceeding 255 characters', () => {
    const longEmail = 'a'.repeat(256) + '@example.com';
    const result = sanitizeEmail(longEmail);
    assert.equal(result, null);
  });

  it('should trim whitespace', () => {
    const result = sanitizeEmail('  user@example.com  ');
    assert.equal(result, 'user@example.com');
  });
});

// ============================================================================
// File Upload Validation Tests
// ============================================================================

describe('File Extension Validation', () => {
  it('should accept allowed extensions', () => {
    const allowedFiles = [
      'document.pdf',
      'data.json',
      'report.txt',
      'data.csv',
    ];

    for (const filename of allowedFiles) {
      const result = isAllowedFileExtension(filename);
      assert.ok(result, `File ${filename} should be allowed`);
    }
  });

  it('should reject disallowed extensions', () => {
    const disallowedFiles = [
      'malicious.exe',
      'script.sh',
      'webpage.html',
      'archive.zip',
    ];

    for (const filename of disallowedFiles) {
      const result = isAllowedFileExtension(filename);
      assert.ok(!result, `File ${filename} should be disallowed`);
    }
  });

  it('should be case-insensitive', () => {
    assert.ok(isAllowedFileExtension('DOCUMENT.PDF'));
    assert.ok(isAllowedFileExtension('Data.JSON'));
  });
});

describe('MIME Type Validation', () => {
  it('should accept allowed MIME types', () => {
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/json',
      'text/csv',
    ];

    for (const mimeType of allowedTypes) {
      const result = isAllowedMimeType(mimeType);
      assert.ok(result, `MIME type ${mimeType} should be allowed`);
    }
  });

  it('should reject disallowed MIME types', () => {
    const disallowedTypes = [
      'application/x-msdownload',
      'application/x-sh',
      'text/html',
      'application/zip',
    ];

    for (const mimeType of disallowedTypes) {
      const result = isAllowedMimeType(mimeType);
      assert.ok(!result, `MIME type ${mimeType} should be disallowed`);
    }
  });
});

describe('Filename Sanitization', () => {
  it('should accept safe filenames', () => {
    const safeNames = [
      'document.pdf',
      'report-2024.txt',
      'data_file.json',
    ];

    for (const filename of safeNames) {
      const result = sanitizeFilename(filename);
      assert.equal(result, filename, `Filename ${filename} should be safe`);
    }
  });

  it('should reject directory traversal', () => {
    const dangerousNames = [
      '../../../etc/passwd',
      '..\\windows\\system32',
    ];

    for (const filename of dangerousNames) {
      const result = sanitizeFilename(filename);
      assert.equal(result, null, `Filename ${filename} should be rejected`);
    }
  });

  it('should reject filenames exceeding 255 characters', () => {
    const longName = 'a'.repeat(256) + '.txt';
    const result = sanitizeFilename(longName);
    assert.equal(result, null);
  });

  it('should reject filenames with invalid characters', () => {
    const invalidNames = [
      'file<name>.txt',
      'file|name.txt',
      'file:name.txt',
    ];

    for (const filename of invalidNames) {
      const result = sanitizeFilename(filename);
      assert.equal(result, null, `Filename ${filename} should be rejected`);
    }
  });
});

describe('File Upload Validation', () => {
  it('should accept valid uploads', () => {
    const result = validateFileUpload('document.pdf', 'application/pdf', 1024 * 1024);
    assert.ok(result.valid);
    assert.equal(result.sanitizedFilename, 'document.pdf');
  });

  it('should reject disallowed extensions', () => {
    const result = validateFileUpload('malicious.exe', 'application/x-msdownload', 1024);
    assert.ok(!result.valid);
    assert.match(result.error!, /extension/i);
  });

  it('should reject disallowed MIME types', () => {
    const result = validateFileUpload('file.pdf', 'text/html', 1024);
    assert.ok(!result.valid);
    assert.match(result.error!, /MIME type/i);
  });

  it('should reject files exceeding size limit', () => {
    const result = validateFileUpload(
      'huge.pdf',
      'application/pdf',
      11 * 1024 * 1024
    );
    assert.ok(!result.valid);
    assert.match(result.error!, /size/i);
  });

  it('should reject empty files', () => {
    const result = validateFileUpload('empty.txt', 'text/plain', 0);
    assert.ok(!result.valid);
    assert.match(result.error!, /size/i);
  });
});

// ============================================================================
// JSON Sanitization Tests
// ============================================================================

describe('JSON Object Sanitization', () => {
  it('should sanitize string values', () => {
    const input = {
      name: 'Test <script>alert(1)</script>',
      description: 'Value with "quotes"',
    };
    const result = sanitizeJsonObject(input);
    assert.match(result.name, /&lt;script&gt;/);
    assert.doesNotMatch(result.name, /<script>/i);
    assert.match(result.description, /&quot;/);
  });

  it('should recursively sanitize nested objects', () => {
    const input = {
      user: {
        name: '<b>Bob</b>',
        details: {
          bio: '<script>alert(1)</script>',
        },
      },
    };
    const result = sanitizeJsonObject(input);
    assert.match(result.user.name, /&lt;b&gt;/);
    assert.match(result.user.details.bio, /&lt;script&gt;/);
  });

  it('should sanitize arrays', () => {
    const input = {
      tags: ['<script>alert(1)</script>', 'normal', '<b>bold</b>'],
    };
    const result = sanitizeJsonObject(input);
    for (const tag of result.tags) {
      assert.doesNotMatch(tag, /<[^>]+>/i);
    }
  });

  it('should preserve non-string values', () => {
    const input = {
      count: 42,
      active: true,
      value: null,
    };
    const result = sanitizeJsonObject(input);
    assert.equal(result.count, 42);
    assert.equal(result.active, true);
    assert.equal(result.value, null);
  });
});

// ============================================================================
// IP Address Sanitization Tests
// ============================================================================

describe('IP Address Sanitization', () => {
  it('should accept valid IPv4 addresses', () => {
    const result = sanitizeIpAddress('192.168.1.1');
    assert.equal(result, '192.168.1.1');
  });

  it('should accept valid IPv6 addresses', () => {
    const result = sanitizeIpAddress('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
    assert.equal(result, '2001:0db8:85a3:0000:0000:8a2e:0370:7334');
  });

  it('should handle X-Forwarded-For format', () => {
    const result = sanitizeIpAddress('192.168.1.1, 10.0.0.1, 172.16.0.1');
    assert.equal(result, '192.168.1.1');
  });

  it('should return "unknown" for invalid IPs', () => {
    const result = sanitizeIpAddress('not-an-ip');
    assert.equal(result, 'unknown');
  });

  it('should handle empty strings', () => {
    const result = sanitizeIpAddress('');
    assert.equal(result, 'unknown');
  });
});

console.log('✅ All sanitization tests defined');
