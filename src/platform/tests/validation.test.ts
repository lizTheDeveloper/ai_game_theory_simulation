/**
 * MARCUS 3.0 Citation Integrity Platform
 * Input Validation Tests
 *
 * Tests for Zod schema validation and sanitization
 *
 * @author Marcus (Platform Engineer)
 */

import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import {
  emailSchema,
  passwordSchema,
  uuidSchema,
  userRoleSchema,
  citationTextSchema,
  sanitizedStringSchema,
  urlSchema,
  filePathSchema,
  fileUploadSchema,
} from '../middleware/validation';

// ============================================================================
// Email Validation Tests
// ============================================================================

describe('Email Validation', () => {
  it('should accept valid email addresses', () => {
    const validEmails = [
      'user@example.com',
      'test.user@domain.co.uk',
      'user+tag@example.com',
      'admin@marcus.platform',
    ];

    for (const email of validEmails) {
      const result = emailSchema.safeParse(email);
      assert.ok(result.success, `Email ${email} should be valid`);
    }
  });

  it('should reject invalid email addresses', () => {
    const invalidEmails = [
      'not-an-email',
      '@example.com',
      'user@',
      'user @example.com',
      'user..name@example.com',
    ];

    for (const email of invalidEmails) {
      const result = emailSchema.safeParse(email);
      assert.ok(!result.success, `Email ${email} should be invalid`);
    }
  });

  it('should normalize email to lowercase', () => {
    const result = emailSchema.parse('USER@EXAMPLE.COM');
    assert.equal(result, 'user@example.com');
  });

  it('should trim whitespace from email', () => {
    const result = emailSchema.parse('  user@example.com  ');
    assert.equal(result, 'user@example.com');
  });

  it('should reject emails exceeding 255 characters', () => {
    const longEmail = 'a'.repeat(256) + '@example.com';
    const result = emailSchema.safeParse(longEmail);
    assert.ok(!result.success);
  });
});

// ============================================================================
// Password Validation Tests
// ============================================================================

describe('Password Validation', () => {
  it('should accept strong passwords', () => {
    const strongPasswords = [
      'Passw0rd!',
      'MyStr0ng#Pass',
      'C0mpl3x$Passw0rd',
      'Secur3_Passwor d123!', // spaces are allowed
    ];

    for (const password of strongPasswords) {
      const result = passwordSchema.safeParse(password);
      assert.ok(result.success, `Password should be valid: ${password}`);
    }
  });

  it('should reject weak passwords (too short)', () => {
    const result = passwordSchema.safeParse('Pass1!');
    assert.ok(!result.success);
    if (!result.success) {
      assert.match(
        (result.error as any).issues[0].message,
        /at least 8 characters/i
      );
    }
  });

  it('should reject passwords without uppercase', () => {
    const result = passwordSchema.safeParse('passw0rd!');
    assert.ok(!result.success);
    if (!result.success) {
      assert.match(
        (result.error as any).issues[0].message,
        /uppercase letter/i
      );
    }
  });

  it('should reject passwords without lowercase', () => {
    const result = passwordSchema.safeParse('PASSW0RD!');
    assert.ok(!result.success);
    if (!result.success) {
      assert.match(
        (result.error as any).issues[0].message,
        /lowercase letter/i
      );
    }
  });

  it('should reject passwords without numbers', () => {
    const result = passwordSchema.safeParse('Password!');
    assert.ok(!result.success);
    if (!result.success) {
      assert.match(
        (result.error as any).issues[0].message,
        /number/i
      );
    }
  });

  it('should reject passwords without special characters', () => {
    const result = passwordSchema.safeParse('Passw0rd');
    assert.ok(!result.success);
    if (!result.success) {
      assert.match(
        (result.error as any).issues[0].message,
        /special character/i
      );
    }
  });

  it('should reject passwords exceeding 128 characters', () => {
    const longPassword = 'A1!' + 'a'.repeat(126);
    const result = passwordSchema.safeParse(longPassword);
    assert.ok(!result.success);
  });
});

// ============================================================================
// UUID Validation Tests
// ============================================================================

describe('UUID Validation', () => {
  it('should accept valid UUID v4', () => {
    const validUuids = [
      '550e8400-e29b-41d4-a716-446655440000',
      '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      '123e4567-e89b-12d3-a456-426614174000',
    ];

    for (const uuid of validUuids) {
      const result = uuidSchema.safeParse(uuid);
      assert.ok(result.success, `UUID ${uuid} should be valid`);
    }
  });

  it('should reject invalid UUIDs', () => {
    const invalidUuids = [
      'not-a-uuid',
      '550e8400-e29b-41d4-a716', // too short
      '550e8400-e29b-41d4-a716-44665544000g', // invalid character
    ];

    for (const uuid of invalidUuids) {
      const result = uuidSchema.safeParse(uuid);
      assert.ok(!result.success, `UUID ${uuid} should be invalid`);
    }
  });
});

// ============================================================================
// User Role Validation Tests
// ============================================================================

describe('User Role Validation', () => {
  it('should accept valid roles', () => {
    const validRoles = ['admin', 'operator', 'viewer'];

    for (const role of validRoles) {
      const result = userRoleSchema.safeParse(role);
      assert.ok(result.success, `Role ${role} should be valid`);
    }
  });

  it('should reject invalid roles', () => {
    const invalidRoles = ['user', 'moderator', 'superadmin', ''];

    for (const role of invalidRoles) {
      const result = userRoleSchema.safeParse(role);
      assert.ok(!result.success, `Role ${role} should be invalid`);
    }
  });
});

// ============================================================================
// Citation Text Validation Tests
// ============================================================================

describe('Citation Text Validation', () => {
  it('should accept valid citation text', () => {
    const validTexts = [
      'According to Smith et al. (2024), climate change is accelerating.',
      'The study found a correlation of r=0.85 (p<0.001).',
    ];

    for (const text of validTexts) {
      const result = citationTextSchema.safeParse(text);
      assert.ok(result.success, `Text should be valid`);
    }
  });

  it('should sanitize HTML entities', () => {
    const input = '<script>alert("xss")</script>';
    const result = citationTextSchema.parse(input);
    assert.match(result, /&lt;script&gt;/);
    assert.doesNotMatch(result, /<script>/i);
  });

  it('should reject empty strings', () => {
    const result = citationTextSchema.safeParse('');
    assert.ok(!result.success);
  });

  it('should reject text exceeding 50,000 characters', () => {
    const longText = 'a'.repeat(50001);
    const result = citationTextSchema.safeParse(longText);
    assert.ok(!result.success);
  });

  it('should trim whitespace', () => {
    const result = citationTextSchema.parse('  Some citation text  ');
    assert.equal(result.startsWith(' '), false);
    assert.equal(result.endsWith(' '), false);
  });
});

// ============================================================================
// Sanitized String Validation Tests
// ============================================================================

describe('Sanitized String Validation', () => {
  it('should sanitize HTML entities', () => {
    const schema = sanitizedStringSchema(1, 100);
    const input = 'Hello <b>World</b>';
    const result = schema.parse(input);
    assert.match(result, /&lt;b&gt;/);
    assert.doesNotMatch(result, /<b>/i);
  });

  it('should respect min/max length', () => {
    const schema = sanitizedStringSchema(5, 10);

    // Too short
    const shortResult = schema.safeParse('abc');
    assert.ok(!shortResult.success);

    // Too long
    const longResult = schema.safeParse('a'.repeat(11));
    assert.ok(!longResult.success);

    // Just right
    const validResult = schema.safeParse('hello');
    assert.ok(validResult.success);
  });

  it('should escape dangerous characters', () => {
    const schema = sanitizedStringSchema(1, 100);
    const result = schema.parse('Test & "quotes" <tags> /slashes/');
    assert.match(result, /&amp;/);
    assert.match(result, /&quot;/);
    assert.match(result, /&lt;/);
    assert.match(result, /&#x2F;/);
  });
});

// ============================================================================
// URL Validation Tests
// ============================================================================

describe('URL Validation', () => {
  it('should accept valid HTTP/HTTPS URLs', () => {
    const validUrls = [
      'http://example.com',
      'https://www.example.com',
      'https://example.com/path/to/resource',
      'https://example.com:8080/api',
    ];

    for (const url of validUrls) {
      const result = urlSchema.safeParse(url);
      assert.ok(result.success, `URL ${url} should be valid`);
    }
  });

  it('should reject non-HTTP/HTTPS protocols', () => {
    const invalidUrls = [
      'ftp://example.com',
      'file:///etc/passwd',
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
    ];

    for (const url of invalidUrls) {
      const result = urlSchema.safeParse(url);
      assert.ok(!result.success, `URL ${url} should be invalid`);
    }
  });

  it('should reject URLs exceeding 2048 characters', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(2048);
    const result = urlSchema.safeParse(longUrl);
    assert.ok(!result.success);
  });
});

// ============================================================================
// File Path Validation Tests
// ============================================================================

describe('File Path Validation', () => {
  it('should accept valid relative paths', () => {
    const validPaths = [
      'documents/report.pdf',
      'uploads/citations/file.txt',
      'data.json',
    ];

    for (const path of validPaths) {
      const result = filePathSchema.safeParse(path);
      assert.ok(result.success, `Path ${path} should be valid`);
    }
  });

  it('should reject directory traversal', () => {
    const dangerousPaths = [
      '../etc/passwd',
      'uploads/../../etc/passwd',
      '..\\windows\\system32',
    ];

    for (const path of dangerousPaths) {
      const result = filePathSchema.safeParse(path);
      assert.ok(!result.success, `Path ${path} should be invalid`);
    }
  });

  it('should reject absolute paths', () => {
    const absolutePaths = [
      '/etc/passwd',
      '/var/www/html/index.html',
    ];

    for (const path of absolutePaths) {
      const result = filePathSchema.safeParse(path);
      assert.ok(!result.success, `Path ${path} should be invalid`);
    }
  });

  it('should reject paths with invalid characters', () => {
    const invalidPaths = [
      'file<name>.txt',
      'document|pipe.pdf',
      'file:name.txt',
    ];

    for (const path of invalidPaths) {
      const result = filePathSchema.safeParse(path);
      assert.ok(!result.success, `Path ${path} should be invalid`);
    }
  });
});

// ============================================================================
// File Upload Validation Tests
// ============================================================================

describe('File Upload Validation', () => {
  it('should accept valid file uploads', () => {
    const validUploads = [
      { filename: 'document.pdf', mimeType: 'application/pdf', size: 1024 * 1024 },
      { filename: 'data.json', mimeType: 'application/json', size: 500 },
      { filename: 'report.txt', mimeType: 'text/plain', size: 2048 },
    ];

    for (const upload of validUploads) {
      const result = fileUploadSchema.safeParse(upload);
      assert.ok(result.success, `Upload should be valid: ${upload.filename}`);
    }
  });

  it('should reject disallowed file extensions', () => {
    const upload = {
      filename: 'malicious.exe',
      mimeType: 'application/x-msdownload',
      size: 1024,
    };
    const result = fileUploadSchema.safeParse(upload);
    assert.ok(!result.success);
  });

  it('should reject files exceeding size limit', () => {
    const upload = {
      filename: 'huge.pdf',
      mimeType: 'application/pdf',
      size: 11 * 1024 * 1024, // 11MB
    };
    const result = fileUploadSchema.safeParse(upload);
    assert.ok(!result.success);
  });

  it('should reject empty files', () => {
    const upload = {
      filename: 'empty.txt',
      mimeType: 'text/plain',
      size: 0,
    };
    const result = fileUploadSchema.safeParse(upload);
    assert.ok(!result.success);
  });

  it('should reject directory traversal in filenames', () => {
    const upload = {
      filename: '../../../etc/passwd',
      mimeType: 'text/plain',
      size: 1024,
    };
    const result = fileUploadSchema.safeParse(upload);
    assert.ok(!result.success);
  });
});

// ============================================================================
// XSS Prevention Tests
// ============================================================================

describe('XSS Prevention', () => {
  it('should sanitize script tags', () => {
    const input = '<script>alert("xss")</script>';
    const result = citationTextSchema.parse(input);
    assert.doesNotMatch(result, /<script>/i);
    assert.match(result, /&lt;script&gt;/);
  });

  it('should sanitize event handlers', () => {
    const input = '<img src=x onerror="alert(1)">';
    const result = citationTextSchema.parse(input);
    assert.match(result, /&lt;img/);
    assert.match(result, /&quot;/); // Quotes should be escaped
  });

  it('should sanitize javascript: URLs', () => {
    const input = '<a href="javascript:alert(1)">Click</a>';
    const result = citationTextSchema.parse(input);
    assert.match(result, /&lt;a/);
    assert.match(result, /&quot;/); // Quotes should be escaped
  });

  it('should sanitize data: URLs', () => {
    const input = '<img src="data:text/html,<script>alert(1)</script>">';
    const result = citationTextSchema.parse(input);
    assert.doesNotMatch(result, /<img src=/);
    assert.match(result, /&lt;img/);
  });
});

console.log('✅ All validation tests defined');
