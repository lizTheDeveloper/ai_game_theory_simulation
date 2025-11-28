# MARCUS Platform Security Configuration Guide

**Author:** Marcus (Platform Engineer)
**Date:** November 2025
**Version:** 2.0 (OWASP Phase 1 Complete)

---

## Table of Contents

1. [Overview](#overview)
2. [Security Features](#security-features)
3. [Configuration](#configuration)
4. [Deployment Checklist](#deployment-checklist)
5. [Monitoring & Auditing](#monitoring--auditing)
6. [Incident Response](#incident-response)
7. [Appendix](#appendix)

---

## Overview

The MARCUS Citation Integrity Platform implements comprehensive OWASP security controls across 12 categories. This guide covers configuration, deployment, and ongoing maintenance of production security features.

**Security Architecture:**
```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS/TLS 1.2+
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  Security Middleware Layer                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  CORS    │ │ Headers  │ │  CSRF    │ │ Rate     │      │
│  │ Whitelist│ │ (CSP,    │ │ Token    │ │ Limiting │      │
│  │          │ │  HSTS)   │ │ Validate │ │          │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │  Input   │ │  Audit   │ │ Session  │                    │
│  │ Validate │ │ Logging  │ │ Mgmt     │                    │
│  └──────────┘ └──────────┘ └──────────┘                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ JWT Authentication
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  Application Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Citation     │  │ Agent        │  │ Metrics      │      │
│  │ Analysis API │  │ Orchestration│  │ Collection   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Parameterized Queries
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  Data Layer                                  │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │ PostgreSQL   │  │ Redis Cache  │                         │
│  │ (Encrypted)  │  │ (Sessions)   │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Security Features

### Task 1.1-1.3: Input Validation & SQL Injection Prevention

**Implementation:** Zod schema validation + Parameterized queries

**Configuration:**
```typescript
// Schema validation on all endpoints
import { validateRequest } from '@/platform/middleware/validation';
import { mySchema } from '@/platform/schemas/mySchemas';

app.post('/api/endpoint',
  validateRequest(mySchema),
  handler
);
```

**Validation Rules:**
- Email format validation (RFC 5322)
- Password strength (8+ chars, 3/4 character types)
- UUID format validation
- SQL injection pattern blocking
- XSS prevention (DOMPurify sanitization)

### Task 1.4: Secrets Management

**Backends Supported:**
1. **Environment Variables** (development only)
2. **HashiCorp Vault** (recommended for production)
3. **AWS Secrets Manager** (AWS deployments)

**Configuration:**
```bash
# Vault backend
SECRETS_BACKEND=vault
VAULT_ADDR=https://vault.example.com:8200
VAULT_TOKEN=hvs.CAESIxxx
VAULT_PATH=secret/marcus

# AWS backend
SECRETS_BACKEND=aws
AWS_REGION=us-west-2
AWS_SECRET_NAME=marcus/production
```

**Secret Rotation:**
```bash
# Rotate JWT secrets
npm run secrets:rotate -- --secret jwt_secret

# Migrate to new backend
npm run secrets:migrate -- --from env --to vault
```

### Task 1.5: Rate Limiting

**Presets:**
- **Login:** 5 requests/5 minutes per IP
- **Analysis:** 100 requests/hour per user, 1000/hour per IP
- **Admin:** 50 requests/5 minutes per user
- **Health:** 1000 requests/5 minutes per IP

**Custom Configuration:**
```typescript
import { createRateLimitMiddleware } from '@/platform/middleware/rateLimiter';

app.use('/api/custom',
  createRateLimitMiddleware(redis, {
    windowMs: 60000,        // 1 minute
    maxRequests: 10,        // 10 requests
    keyPrefix: 'custom:',
    message: 'Too many requests'
  })
);
```

### Task 1.6: TLS/HTTPS Configuration

**Minimum Requirements:**
- TLS 1.2+ (TLS 1.3 recommended)
- Strong cipher suites only
- Valid certificates from trusted CA
- HSTS enabled with preload

**Configuration:**
```bash
HTTPS_ENABLED=true
TLS_CERT_PATH=/etc/ssl/certs/marcus.crt
TLS_KEY_PATH=/etc/ssl/private/marcus.key
TLS_MIN_VERSION=TLSv1.2
TLS_CIPHERS=ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384
```

**Testing:**
```bash
# Test TLS configuration
openssl s_client -connect your-domain.com:443 -tls1_2

# Scan with SSL Labs
# Visit: https://www.ssllabs.com/ssltest/
```

### Task 1.7: CORS Configuration

**Whitelist Approach:**
```bash
# Production (exact domains only)
CORS_ORIGINS=https://app.example.com,https://admin.example.com

# Wildcard subdomains (use sparingly)
CORS_ORIGINS=https://*.example.com

# Development
CORS_ORIGINS=http://localhost:3333,http://localhost:3000
```

**Features:**
- Origin whitelist validation
- Preflight request handling
- Credentials support (cookies, auth headers)
- Per-route CORS configuration

### Task 1.8: Security Headers

**Headers Configured:**
1. **Content-Security-Policy (CSP)** - Prevent XSS, injection attacks
2. **Strict-Transport-Security (HSTS)** - Force HTTPS
3. **X-Frame-Options** - Prevent clickjacking
4. **X-Content-Type-Options** - Prevent MIME sniffing
5. **X-XSS-Protection** - Legacy browser XSS protection
6. **Referrer-Policy** - Control referrer information
7. **Permissions-Policy** - Disable unused browser features

**Default CSP:**
```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self' data:;
connect-src 'self';
frame-src 'none';
object-src 'none';
upgrade-insecure-requests;
```

**Customization:**
```typescript
import { createSecurityHeadersMiddleware } from '@/platform/middleware/securityHeaders';

app.use(createSecurityHeadersMiddleware({
  csp: {
    scriptSrc: ["'self'", 'https://cdn.example.com'],
    connectSrc: ["'self'", 'https://api.example.com'],
  }
}));
```

### Task 1.9: Dependency Scanning

**Tools Integrated:**
1. **npm audit** - Built-in vulnerability scanning
2. **Snyk** - Advanced vulnerability detection
3. **Dependabot** - Automated dependency updates
4. **GitHub CodeQL** - Code analysis

**Running Scans:**
```bash
# Manual scan
npx tsx scripts/security/audit-dependencies.ts

# Auto-fix (use with caution)
npx tsx scripts/security/audit-dependencies.ts --fix

# CI/CD integration (automatic on PR)
# See .github/workflows/security-scan.yml
```

**Thresholds:**
- Build fails on: HIGH or CRITICAL vulnerabilities
- Warns on: MODERATE vulnerabilities
- Ignores: LOW (unless security-critical package)

### Task 1.10: SAST Analysis

**Tools:**
1. **ESLint Security Plugin** - TypeScript/JavaScript
2. **CodeQL** - Advanced semantic analysis
3. **Gitleaks** - Secret scanning

**Running SAST:**
```bash
# ESLint security scan
npm run lint

# Full security scan (CI/CD)
# Runs on every PR automatically

# Local testing
npx eslint . --ext .ts,.tsx --plugin security
```

**Rules Enforced:**
- No `eval()` or `new Function()`
- No prototype pollution
- Proper error handling
- Regex DoS prevention
- No hardcoded secrets

### Task 1.11: Audit Logging

**Events Logged:**
- Authentication (login, logout, failures)
- Authorization (permission denials)
- Administrative actions (user management)
- Secret access (key retrieval, rotation)
- API security (rate limits, CORS violations)
- Data access (sensitive queries, exports)

**Storage:**
- **Database:** PostgreSQL (append-only, 1 year retention)
- **Console:** Structured JSON logs

**Querying Logs:**
```sql
-- Recent high-severity events
SELECT * FROM get_recent_security_events(24, 'high');

-- Failed login attempts
SELECT * FROM audit_log
WHERE event_type = 'auth.login.failure'
  AND timestamp > NOW() - INTERVAL '1 hour'
ORDER BY timestamp DESC;

-- Permission denials by user
SELECT email, COUNT(*) as denials
FROM audit_log
WHERE event_type = 'authz.permission.denied'
  AND timestamp > NOW() - INTERVAL '7 days'
GROUP BY email
ORDER BY denials DESC;
```

### Task 1.12: Session Management

**Features:**
- **Inactivity timeout:** 30 minutes (configurable)
- **Absolute timeout:** 24 hours (configurable)
- **Concurrent session limits:** 5 per user (configurable)
- **CSRF protection:** Token-based validation
- **Session fixation prevention:** ID regeneration on login
- **Secure cookies:** httpOnly, secure, sameSite=strict

**Configuration:**
```bash
SESSION_INACTIVITY_TIMEOUT=1800   # 30 minutes
SESSION_ABSOLUTE_TIMEOUT=86400    # 24 hours
MAX_CONCURRENT_SESSIONS=5
CSRF_PROTECTION_ENABLED=true
```

**Management:**
```typescript
// Create session (after login)
const session = await sessionManager.createSession(
  userId, email, role, ipAddress, userAgent
);

// Validate session (on request)
const session = await sessionManager.validateSession(sessionId);

// Destroy session (logout)
await sessionManager.destroySession(sessionId);

// Destroy all user sessions (security event)
await sessionManager.destroyAllUserSessions(userId);
```

---

## Configuration

### Environment Setup

1. **Copy template:**
   ```bash
   cp .env.example.platform .env
   ```

2. **Generate secrets:**
   ```bash
   # JWT secrets (min 32 characters)
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Configure database:**
   ```bash
   # Run migrations
   psql -U postgres -d marcus_platform -f scripts/db/migrations/001_initial_schema.sql
   psql -U postgres -d marcus_platform -f scripts/db/migrations/002_rbac_and_rate_limiting.sql
   psql -U postgres -d marcus_platform -f scripts/db/migrations/003_secrets_and_tls.sql
   psql -U postgres -d marcus_platform -f scripts/db/migrations/004_audit_logging_and_sessions.sql
   ```

4. **Verify configuration:**
   ```bash
   # Test database connection
   npm run test:backend

   # Validate secrets
   npm run secrets:validate
   ```

### Production Deployment Checklist

**Pre-Deployment:**
- [ ] All environment variables set in `.env`
- [ ] JWT secrets generated (min 32 chars)
- [ ] Database migrations applied
- [ ] TLS certificates installed and valid
- [ ] CORS origins configured (no wildcards)
- [ ] Secrets backend configured (Vault/AWS)
- [ ] Rate limiting enabled
- [ ] Audit logging to database enabled

**Security Hardening:**
- [ ] HTTPS enforced (HTTPS_ENABLED=true)
- [ ] HSTS enabled with preload
- [ ] Security headers configured
- [ ] CSP policy customized for your domains
- [ ] Session timeouts configured
- [ ] Concurrent session limits set
- [ ] CSRF protection enabled
- [ ] Input validation schemas on all endpoints

**Monitoring:**
- [ ] Prometheus metrics endpoint configured
- [ ] Audit log monitoring set up
- [ ] Rate limit alerts configured
- [ ] Failed login alerts configured
- [ ] Permission denial alerts configured
- [ ] Dependency scan in CI/CD
- [ ] SAST analysis in CI/CD

**Testing:**
- [ ] All security integration tests pass
- [ ] TLS configuration tested (SSL Labs A+)
- [ ] CORS policy tested
- [ ] Rate limiting tested
- [ ] Session management tested
- [ ] CSRF protection tested
- [ ] Penetration testing completed

---

## Monitoring & Auditing

### Metrics to Track

**Authentication:**
- Login success/failure rate
- Failed login attempts per user
- Account lockouts per day
- Password reset requests

**Authorization:**
- Permission denials per endpoint
- Role escalation attempts
- Unauthorized access attempts

**API Security:**
- Rate limit hits per endpoint
- CORS violations
- CSRF failures
- Input validation failures

**Sessions:**
- Active sessions per user
- Session timeouts (inactivity vs absolute)
- Concurrent session limit hits

### Alerting Rules

**Critical (Immediate Response):**
- 5+ failed logins for same user in 5 minutes
- Permission denial for admin endpoint
- Rate limit exceeded by 10x
- CSRF validation failures

**High (1-hour Response):**
- 10+ CORS violations in 1 hour
- 50+ rate limit hits for same IP
- Unusual admin activity patterns

**Medium (24-hour Response):**
- HIGH/CRITICAL npm audit vulnerabilities
- TLS certificate expiring in < 30 days
- Audit log retention policy violations

### Audit Log Cleanup

**Automated:**
```sql
-- Run daily via cron
SELECT cleanup_old_audit_logs(365); -- 1 year retention
SELECT cleanup_expired_sessions(1800); -- 30 minute timeout
```

**Manual Review:**
```bash
# Weekly security review
npm run reports:security-weekly

# Monthly compliance audit
npm run reports:security-monthly
```

---

## Incident Response

### Suspected Breach

1. **Immediate Actions:**
   - Revoke all active refresh tokens
   - Force password resets for affected users
   - Enable enhanced audit logging
   - Notify security team

2. **Investigation:**
   ```sql
   -- Recent failed logins
   SELECT * FROM audit_log
   WHERE event_type LIKE 'auth.%failure'
     AND timestamp > NOW() - INTERVAL '24 hours'
   ORDER BY timestamp DESC;

   -- Suspicious admin activity
   SELECT * FROM audit_log
   WHERE resource LIKE '/api/admin%'
     AND result = 'failure'
   ORDER BY timestamp DESC
   LIMIT 100;
   ```

3. **Remediation:**
   - Rotate JWT secrets (`npm run secrets:rotate`)
   - Update TLS certificates if compromised
   - Review and update CORS whitelist
   - Patch vulnerabilities immediately

### Rate Limit Abuse

```bash
# Identify abuser
redis-cli --scan --pattern "ratelimit:*" | xargs redis-cli GET

# Block IP temporarily (add to firewall)
iptables -A INPUT -s <ABUSER_IP> -j DROP

# Permanent ban (add to rate limiter blocklist)
# Update TRUSTED_PROXIES or implement IP blocklist
```

### Dependency Vulnerability

```bash
# Scan for vulnerabilities
npm audit

# Auto-fix (test first!)
npm audit fix

# Manual update
npm update <package-name>

# Force major version update
npm install <package-name>@latest
```

---

## Appendix

### A. Security Checklist Template

Use this for periodic security reviews:

```
[ ] JWT secrets rotated in last 90 days
[ ] TLS certificates valid for >30 days
[ ] Dependencies scanned in last 7 days
[ ] Audit logs reviewed in last 7 days
[ ] Rate limiting functioning correctly
[ ] CORS policy up to date
[ ] Security headers configured
[ ] Session timeouts appropriate
[ ] Backup/restore procedures tested
[ ] Incident response plan reviewed
```

### B. Useful Commands

```bash
# Security audit
npm run audit:dependencies

# Test TLS
curl -I https://your-domain.com

# Check CORS
curl -H "Origin: https://app.example.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS https://api.example.com/api/endpoint

# View active sessions
redis-cli --scan --pattern "session:*"

# Monitor audit log
tail -f logs/audit.log

# Test rate limiting
for i in {1..10}; do curl https://api.example.com/api/endpoint; done
```

### C. Additional Resources

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

**Last Updated:** November 2025
**Review Frequency:** Quarterly
**Next Review:** February 2026
