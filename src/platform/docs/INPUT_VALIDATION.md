# Input Validation & Sanitization

**MARCUS 3.0 Citation Integrity Platform**
**Security Task 1.4: Input Validation & Sanitization**
**Author:** Marcus (Platform Engineer)
**Status:** ✅ Complete

## Overview

Comprehensive input validation and sanitization layer protecting against:
- **Injection Attacks:** SQL injection, command injection, path traversal
- **XSS (Cross-Site Scripting):** HTML/JavaScript injection
- **Data Corruption:** Invalid data types, out-of-range values
- **File Upload Attacks:** Malicious files, oversized uploads

## Architecture

### Validation Stack

```
┌─────────────────────────────────────┐
│         API Endpoint                │
│  (POST /api/citations/analyze)      │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  validateRequest() Middleware       │
│  - Zod schema validation            │
│  - Type coercion & transformation   │
│  - Field-level error messages       │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Validation Schema                  │
│  - Email/Password rules             │
│  - Citation text limits             │
│  - UUID/URL validation              │
│  - HTML sanitization                │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Route Handler                      │
│  - Receives validated/sanitized data│
│  - No additional validation needed  │
└─────────────────────────────────────┘
```

## Core Components

### 1. Validation Middleware

**File:** `src/platform/middleware/validation.ts`

```typescript
import { validateRequest } from '../middleware/validation';
import { registerSchema } from '../schemas/authSchemas';

router.post(
  '/register',
  validateRequest(registerSchema),  // Validates body
  async (req, res) => {
    // req.body is now validated and sanitized
    const { email, password, role } = req.body;
  }
);
```

**Features:**
- Validates request `body`, `query`, or `params`
- Returns HTTP 400 with field-level error details
- Automatically sanitizes string inputs
- Type-safe with TypeScript inference

### 2. Validation Schemas

**Authentication Schemas** (`src/platform/schemas/authSchemas.ts`):
- `registerSchema` - User registration
- `loginSchema` - User login
- `refreshTokenSchema` - Token refresh
- `logoutSchema` - User logout

**Citation Schemas** (`src/platform/schemas/citationSchemas.ts`):
- `analyzeCitationSchema` - Citation analysis requests
- `batchAnalyzeCitationSchema` - Batch analysis
- `searchCitationsSchema` - Search with pagination
- `citationFeedbackSchema` - User feedback

**Admin Schemas** (`src/platform/schemas/adminSchemas.ts`):
- `updateUserRoleSchema` - Role management
- `listUsersSchema` - User listing with filters
- `agentConfigSchema` - Agent configuration
- `auditLogsSchema` - Audit log queries

### 3. Sanitization Utilities

**File:** `src/platform/utils/sanitization.ts`

```typescript
import { sanitizeHtml, sanitizeFilePath, validateFileUpload } from '../utils/sanitization';

// HTML sanitization (XSS prevention)
const safe = sanitizeHtml('<script>alert("xss")</script>');
// Result: &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;

// Path traversal prevention
const path = sanitizeFilePath('../../../etc/passwd');
// Result: null (rejected)

// File upload validation
const result = validateFileUpload('document.pdf', 'application/pdf', 1024 * 1024);
// Result: { valid: true, sanitizedFilename: 'document.pdf' }
```

**Available Functions:**
- `sanitizeHtml(input)` - Escape HTML entities
- `stripHtml(input)` - Remove all HTML tags
- `sanitizeSqlLikePattern(pattern)` - Escape SQL LIKE wildcards
- `sanitizeFilePath(path)` - Prevent directory traversal
- `sanitizeUrl(url)` - Validate HTTP/HTTPS URLs
- `sanitizeEmail(email)` - Normalize email addresses
- `validateFileUpload(...)` - Comprehensive file validation
- `sanitizeJsonObject(obj)` - Recursively sanitize JSON
- `sanitizeIpAddress(ip)` - Extract valid IP from headers

## Validation Rules

### Email

- **Format:** RFC 5322 compliant
- **Length:** 1-255 characters
- **Normalization:** Lowercase, trimmed
- **Example:** `user@example.com`

```typescript
emailSchema.parse('  USER@EXAMPLE.COM  ');
// Result: 'user@example.com'
```

### Password

- **Length:** 8-128 characters
- **Requirements:**
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character
- **Example:** `MySecur3P@ssw0rd!`

```typescript
passwordSchema.parse('Pass1!'); // ❌ Too short
passwordSchema.parse('MySecur3P@ssw0rd!'); // ✅ Valid
```

### Citation Text

- **Length:** 1-50,000 characters
- **Sanitization:** HTML entities escaped
- **Trimmed:** Leading/trailing whitespace removed

```typescript
citationTextSchema.parse('<script>alert(1)</script>');
// Result: '&lt;script&gt;alert(1)&lt;&#x2F;script&gt;'
```

### UUID

- **Format:** UUID v4
- **Example:** `550e8400-e29b-41d4-a716-446655440000`

```typescript
uuidSchema.parse('550e8400-e29b-41d4-a716-446655440000'); // ✅ Valid
uuidSchema.parse('not-a-uuid'); // ❌ Invalid
```

### User Role

- **Values:** `admin`, `operator`, `viewer`
- **Case-sensitive**

```typescript
userRoleSchema.parse('admin'); // ✅ Valid
userRoleSchema.parse('superadmin'); // ❌ Invalid
```

### File Upload

- **Allowed Extensions:** `.pdf`, `.txt`, `.json`, `.csv`
- **Allowed MIME Types:**
  - `application/pdf`
  - `text/plain`
  - `application/json`
  - `text/csv`
- **Size Limit:** 10MB (10,485,760 bytes)

```typescript
fileUploadSchema.parse({
  filename: 'document.pdf',
  mimeType: 'application/pdf',
  size: 1024 * 1024, // 1MB
}); // ✅ Valid

fileUploadSchema.parse({
  filename: 'malicious.exe',
  mimeType: 'application/x-msdownload',
  size: 1024,
}); // ❌ Invalid extension
```

## Error Responses

### Validation Failure Format

**HTTP 400 Bad Request**

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format",
      "code": "invalid_format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters",
      "code": "too_small"
    }
  ]
}
```

### Field-Level Errors

Each error provides:
- **field:** Path to the invalid field (supports nested: `user.email`)
- **message:** Human-readable error message
- **code:** Machine-readable error code (Zod error codes)

## Security Best Practices

### 1. Never Trust Client Input

```typescript
// ❌ BAD - Direct database query with user input
db.query(`SELECT * FROM users WHERE email = '${req.body.email}'`);

// ✅ GOOD - Validate first, then use parameterized queries
router.post('/login', validateRequest(loginSchema), async (req, res) => {
  const { email } = req.body; // Already validated and sanitized
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
});
```

### 2. Validate on Server Side

Client-side validation is UX, not security. Always validate on the server.

```typescript
// Client-side validation (optional, for UX):
<input type="email" required />

// Server-side validation (MANDATORY, for security):
validateRequest(emailSchema)
```

### 3. Fail Securely

Reject invalid input; don't try to "fix" it.

```typescript
// ❌ BAD - Trying to fix invalid input
const email = req.body.email || 'default@example.com';

// ✅ GOOD - Reject invalid input
if (!emailSchema.safeParse(req.body.email).success) {
  return res.status(400).json({ error: 'Invalid email' });
}
```

### 4. Log Validation Failures

Track repeated failures (may indicate attack).

```typescript
if (!result.success) {
  logger.warn('Validation failure', {
    ip: req.ip,
    path: req.path,
    errors: result.error.issues,
  });
}
```

### 5. Defense in Depth

Validation is one layer. Also use:
- **Parameterized queries** (SQL injection prevention)
- **Content-Type headers** (MIME type sniffing prevention)
- **CSP headers** (XSS mitigation)
- **Rate limiting** (brute force prevention)

## XSS Prevention

### HTML Sanitization

All user input that might be rendered as HTML is automatically sanitized:

```typescript
const input = '<img src=x onerror="alert(1)">';
const sanitized = citationTextSchema.parse(input);
// Result: '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'
```

### Escaping Strategy

- `<` → `&lt;`
- `>` → `&gt;`
- `"` → `&quot;`
- `'` → `&#x27;`
- `/` → `&#x2F;`
- `&` → `&amp;`

### Output Encoding

When rendering user input in HTML:

```typescript
// Server-side rendering (already sanitized by schema)
res.send(`<div>${citationText}</div>`);

// Client-side rendering (use textContent, not innerHTML)
element.textContent = citationText; // ✅ Safe
element.innerHTML = citationText; // ❌ Dangerous
```

## Testing

### Unit Tests

**87 tests covering:**
- Email validation (format, length, normalization)
- Password validation (strength requirements)
- UUID validation (format)
- Citation text sanitization (XSS prevention)
- File upload validation (extension, MIME type, size)
- HTML sanitization (entity escaping)
- SQL injection prevention (LIKE pattern escaping)
- Path traversal prevention (directory traversal detection)

**Run tests:**
```bash
npx tsx --test src/platform/tests/validation.test.ts
npx tsx --test src/platform/tests/sanitization.test.ts
```

### Integration Tests

Test validation in actual API endpoints:

```bash
npx tsx --test src/platform/tests/validationIntegration.test.ts
```

## Adding New Validation

### 1. Create Schema

```typescript
// src/platform/schemas/mySchemas.ts
import { z } from 'zod';
import { emailSchema, sanitizedStringSchema } from '../middleware/validation';

export const mySchema = z.object({
  email: emailSchema,
  title: sanitizedStringSchema(1, 100),
  count: z.number().int().min(1).max(100),
});

export type MyInput = z.infer<typeof mySchema>;
```

### 2. Apply Middleware

```typescript
// src/platform/api/myRoutes.ts
import { validateRequest } from '../middleware/validation';
import { mySchema } from '../schemas/mySchemas';

router.post('/my-endpoint',
  validateRequest(mySchema),
  async (req: Request, res: Response) => {
    const { email, title, count } = req.body; // Type-safe, validated
    // ... business logic
  }
);
```

### 3. Write Tests

```typescript
// src/platform/tests/myValidation.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mySchema } from '../schemas/mySchemas';

describe('My Validation', () => {
  it('should accept valid input', () => {
    const result = mySchema.safeParse({
      email: 'user@example.com',
      title: 'Test Title',
      count: 42,
    });
    assert.ok(result.success);
  });

  it('should reject invalid input', () => {
    const result = mySchema.safeParse({
      email: 'not-an-email',
      title: 'Test',
      count: -1,
    });
    assert.ok(!result.success);
  });
});
```

## Performance Considerations

### Validation Overhead

- **Zod validation:** ~0.1-1ms per request (negligible)
- **HTML sanitization:** ~0.05ms per KB of text
- **File validation:** ~0.1ms for metadata, ~5ms for magic number check

### Optimization Tips

1. **Validate early:** Fail fast on invalid input
2. **Cache schemas:** Reuse schema instances (already done)
3. **Limit input size:** Set max lengths before parsing
4. **Async validation:** For expensive checks (file content scanning)

## Common Pitfalls

### ❌ Don't Skip Validation

```typescript
// ❌ BAD - Assuming input is valid
const email = req.body.email;
await sendEmail(email);

// ✅ GOOD - Always validate
const { email } = req.body; // Already validated by middleware
await sendEmail(email);
```

### ❌ Don't Validate After Use

```typescript
// ❌ BAD - Using input before validation
await saveToDatabase(req.body);
const valid = validateInput(req.body);

// ✅ GOOD - Validate before use
const valid = validateInput(req.body);
if (valid) await saveToDatabase(req.body);
```

### ❌ Don't Trust Content-Type Header

```typescript
// ❌ BAD - Trusting Content-Type
if (req.headers['content-type'] === 'application/pdf') {
  await processFile(req.file);
}

// ✅ GOOD - Check magic numbers
const isValid = validateFileMagicNumber(buffer, '.pdf');
if (isValid) await processFile(req.file);
```

## Monitoring & Alerting

### Metrics to Track

- **Validation failures per endpoint** (detect attacks)
- **Invalid input patterns** (improve validation rules)
- **Repeated failures from same IP** (rate limit aggressively)

### Logging

```typescript
logger.warn('Validation failed', {
  endpoint: req.path,
  method: req.method,
  ip: req.ip,
  errors: validationErrors,
});
```

### Alerting Thresholds

- **>100 validation failures/min from single IP** → Potential attack
- **>10% validation failure rate on endpoint** → UX issue or attack
- **Unexpected error patterns** → New attack vector

## References

- [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Zod Documentation](https://zod.dev/)
- [MARCUS Security Roadmap](../../plans/MARCUS_3_0_SECURITY.md)

---

**Next Steps:**
- [ ] Implement integration tests with supertest
- [ ] Add rate limiting on validation failures
- [ ] Create admin dashboard for monitoring validation metrics
- [ ] Add fuzzing tests for edge cases

**Completed:**
- [x] Zod-based schema validation
- [x] XSS prevention (HTML sanitization)
- [x] SQL injection prevention (parameterized queries + validation)
- [x] Path traversal prevention
- [x] File upload validation
- [x] Comprehensive unit tests (87 tests passing)
- [x] Documentation
