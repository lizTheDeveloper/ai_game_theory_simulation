# MARCUS Platform Authentication & Authorization

**Engineer:** Marcus
**Created:** 2025-11-17
**Version:** 1.0

## Overview

Production-grade authentication and authorization system for the MARCUS Citation Integrity Platform. Implements OAuth2-style JWT authentication with role-based access control (RBAC).

## Security Features

- ✅ **Bcrypt password hashing** (12 salt rounds)
- ✅ **JWT access tokens** (15 minute TTL)
- ✅ **Refresh tokens** (7 day TTL with rotation)
- ✅ **Account lockout** (5 failed attempts → 15 min lockout)
- ✅ **Audit logging** (all authentication events tracked)
- ✅ **Role-based permissions** (admin, operator, viewer)
- ✅ **CORS protection**
- ✅ **SQL injection prevention** (parameterized queries)

## User Roles & Permissions

| Role | Permissions |
|------|------------|
| **viewer** | Read-only access to citations, metrics, and agent status |
| **operator** | Read/write citations, analyze documents, manage agents |
| **admin** | Full access including user management and system configuration |

### Permission Matrix

| Endpoint | viewer | operator | admin |
|----------|--------|----------|-------|
| GET /api/metrics | ✅ | ✅ | ✅ |
| GET /api/citations | ✅ | ✅ | ✅ |
| POST /api/citations/analyze | ❌ | ✅ | ✅ |
| POST /api/admin/agents | ❌ | ❌ | ✅ |
| GET /api/admin/users | ❌ | ❌ | ✅ |
| PUT /api/admin/users/:id/role | ❌ | ❌ | ✅ |

## API Endpoints

### Base URL

```
http://localhost:3000
```

### Authentication Endpoints (Public)

#### 1. User Registration

**POST** `/auth/register`

Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "role": "viewer"  // optional: "admin", "operator", "viewer" (default: viewer)
}
```

**Password Requirements:**
- Minimum 8 characters
- Must contain at least 3 of:
  - Uppercase letter
  - Lowercase letter
  - Number
  - Special character

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "role": "viewer",
    "createdAt": "2025-11-17T10:00:00Z"
  }
}
```

**Errors:**
- `400` - Invalid email or weak password
- `409` - Email already exists
- `500` - Server error

---

#### 2. User Login

**POST** `/auth/login`

Authenticate user and receive JWT tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900,
  "tokenType": "Bearer"
}
```

**Errors:**
- `401` - Invalid email or password
- `403` - Account locked or disabled
- `500` - Server error

**Account Lockout:**
- After 5 failed login attempts, account is locked for 15 minutes
- Lockout prevents login even with correct password
- Counter resets on successful login

---

#### 3. Refresh Access Token

**POST** `/auth/refresh`

Get new access token using refresh token. Old refresh token is revoked (token rotation).

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900,
  "tokenType": "Bearer"
}
```

**Errors:**
- `401` - Invalid, expired, or revoked refresh token
- `403` - Account disabled
- `500` - Server error

---

#### 4. User Logout

**POST** `/auth/logout`

Revoke refresh token to end session.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

#### 5. Get Current User

**GET** `/auth/me`

Get information about currently authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "role": "operator",
    "isActive": true,
    "createdAt": "2025-11-17T10:00:00Z",
    "lastLogin": "2025-11-17T12:30:00Z"
  }
}
```

**Errors:**
- `401` - Invalid or expired access token
- `404` - User not found
- `500` - Server error

---

### Protected Platform Endpoints

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

#### 1. Analyze Citation

**POST** `/api/citations/analyze`

Analyze citation integrity using multi-agent system.

**Required Permission:** `citations:analyze` (operator or admin)

**Request:**
```json
{
  "text": "Smith et al. (2024). AI Alignment. Nature, 123, 45-67.",
  "claimedSource": "Smith et al. 2024"
}
```

**Response (200):**
```json
{
  "meanIntegrity": 0.92,
  "consensus": 0.85,
  "numAgents": 10,
  "behaviorDistribution": {
    "VALID": 8,
    "INCOMPLETE": 2
  },
  "recommendations": ["Citation appears valid but could include page numbers"]
}
```

---

#### 2. Get Platform Metrics

**GET** `/api/metrics`

Retrieve platform performance metrics.

**Required Permission:** `metrics:read` (viewer, operator, or admin)

**Response (200):**
```json
{
  "accuracy": 0.87,
  "throughput": 245.3,
  "latencyP95": 102,
  "consensus": 0.82
}
```

---

#### 3. Manage Agents (Admin Only)

**POST** `/api/admin/agents`

Start, stop, or configure agents.

**Required Permission:** `admin:all` (admin only)

**Request:**
```json
{
  "action": "start",
  "numAgents": 10
}
```

---

#### 4. List Users (Admin Only)

**GET** `/api/admin/users`

Get list of all users.

**Required Permission:** `users:read` (admin only)

**Response (200):**
```json
{
  "users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "role": "operator",
      "isActive": true,
      "createdAt": "2025-11-17T10:00:00Z",
      "lastLogin": "2025-11-17T12:30:00Z"
    }
  ],
  "count": 1
}
```

---

#### 5. Update User Role (Admin Only)

**PUT** `/api/admin/users/:userId/role`

Update user's role.

**Required Permission:** `users:write` (admin only)

**Request:**
```json
{
  "role": "admin"
}
```

**Response (200):**
```json
{
  "message": "User role updated successfully",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "newRole": "admin"
}
```

---

#### 6. Deactivate User (Admin Only)

**DELETE** `/api/admin/users/:userId`

Deactivate user account and revoke all tokens.

**Required Permission:** `users:write` (admin only)

**Response (200):**
```json
{
  "message": "User deactivated successfully",
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

### Health Check (Public)

**GET** `/health`

Check API and database health.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-17T12:30:00Z",
  "uptime": 3600,
  "database": "connected"
}
```

---

## Authentication Flow

### Initial Login

```
1. POST /auth/login
   → Receive accessToken + refreshToken

2. Store both tokens securely
   - accessToken: In memory (15 min TTL)
   - refreshToken: HttpOnly cookie or secure storage (7 day TTL)

3. Include accessToken in all API requests:
   Authorization: Bearer <accessToken>
```

### Token Refresh

```
1. When accessToken expires (15 min), use refreshToken:
   POST /auth/refresh
   → Receive new accessToken + new refreshToken

2. Old refreshToken is revoked (token rotation)

3. Continue using new accessToken
```

### Logout

```
1. POST /auth/logout with refreshToken
   → Refresh token is revoked

2. Clear stored tokens from client
```

---

## Error Responses

All errors follow consistent format:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "code": "ERROR_CODE"  // optional
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created (registration)
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate email)
- `500` - Internal Server Error
- `503` - Service Unavailable (database down)

---

## Database Setup

### 1. Create Database

```sql
CREATE DATABASE marcus_platform;
```

### 2. Run Schema

```bash
psql -U postgres -d marcus_platform -f src/platform/database/auth-schema.sql
```

### 3. Verify Tables

```sql
\dt
-- Should show: users, refresh_tokens, auth_audit_log
```

### 4. Default Admin User

The schema creates a default admin account:

- **Email:** `admin@marcus-platform.local`
- **Password:** `changeme123!`

**⚠️ CRITICAL:** Change this password immediately in production!

```bash
# Login as admin
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@marcus-platform.local","password":"changeme123!"}'

# Then change password via password reset endpoint (TODO)
```

---

## Environment Variables

Create `.env` file:

```bash
# Server Configuration
PORT=3000
HOST=0.0.0.0
CORS_ORIGINS=http://localhost:3333,https://app.example.com

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=marcus_platform
DB_USER=postgres
DB_PASSWORD=your_db_password
DB_POOL_SIZE=20

# JWT Configuration
JWT_SECRET=your_256_bit_secret_key_here
JWT_REFRESH_SECRET=your_256_bit_refresh_secret_key_here
ACCESS_TOKEN_TTL=900     # 15 minutes
REFRESH_TOKEN_TTL=604800 # 7 days
```

**⚠️ Generate secure secrets:**
```bash
# Generate 256-bit (32-byte) random secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Running the Server

### Development

```bash
npx tsx src/platform/api/server.ts
```

### Production

```bash
# Build
npx tsc

# Run
NODE_ENV=production node dist/platform/api/server.js
```

---

## Testing

### Run All Tests

```bash
npm test
```

### Run Auth Tests Only

```bash
npx tsx --test src/platform/tests/auth.test.ts
```

### Test Coverage

```bash
npx tsx --test --experimental-test-coverage src/platform/tests/auth.test.ts
```

---

## Security Best Practices

### 1. Secrets Management

- ✅ Use environment variables for all secrets
- ✅ Never commit secrets to version control
- ✅ Use secrets manager in production (AWS Secrets Manager, HashiCorp Vault)
- ✅ Rotate secrets regularly

### 2. HTTPS Only in Production

```javascript
// Add to production middleware
app.use((req, res, next) => {
  if (!req.secure && process.env.NODE_ENV === 'production') {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});
```

### 3. Rate Limiting

```javascript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
});

app.use('/auth', authLimiter);
```

### 4. Helmet Security Headers

```javascript
import helmet from 'helmet';

app.use(helmet());
```

### 5. Token Storage

**Client-side:**
- ✅ Access tokens: In-memory only (never localStorage)
- ✅ Refresh tokens: HttpOnly cookies with SameSite=Strict
- ❌ NEVER store tokens in localStorage (XSS vulnerable)

---

## Troubleshooting

### "Invalid access token" Error

**Cause:** Token expired (15 min TTL)
**Solution:** Use refresh token to get new access token

### "Account locked" Error

**Cause:** 5 failed login attempts
**Solution:** Wait 15 minutes or contact admin to unlock

### "Database connection failed" Error

**Cause:** PostgreSQL not running or wrong credentials
**Solution:** Check `DB_*` environment variables and database status

### "JWT secret must be at least 32 characters" Error

**Cause:** Weak JWT secret
**Solution:** Generate proper 256-bit secret (see Environment Variables section)

---

## Audit Logs

All authentication events are logged in `auth_audit_log` table:

```sql
SELECT event_type, email, success, failure_reason, timestamp
FROM auth_audit_log
WHERE email = 'user@example.com'
ORDER BY timestamp DESC;
```

**Event Types:**
- `register` - User registration
- `login` - Successful login
- `failed_login` - Failed login attempt
- `account_locked` - Account locked after failed attempts
- `logout` - User logout
- `refresh_token` - Token refresh
- `password_reset` - Password reset

---

## Production Deployment Checklist

- [ ] Change default admin password
- [ ] Set strong JWT secrets (256-bit minimum)
- [ ] Enable HTTPS only
- [ ] Configure CORS for production domains
- [ ] Set up secrets manager (not .env files)
- [ ] Enable rate limiting
- [ ] Add Helmet security headers
- [ ] Configure database connection pooling
- [ ] Set up monitoring (Prometheus metrics)
- [ ] Configure logging (structured JSON logs)
- [ ] Set up backup strategy for database
- [ ] Test graceful shutdown (SIGTERM handling)
- [ ] Review audit logs regularly
- [ ] Set up alerts for failed login spikes

---

## Support

**Platform Engineer:** Marcus
**Issues:** Create GitHub issue or contact platform team

"Build platforms that make agent developers productive. If it works in dev but fails in production, it doesn't work."

— Marcus, Platform Engineer
