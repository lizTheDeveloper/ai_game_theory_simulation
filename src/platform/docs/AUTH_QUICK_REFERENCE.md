# Authentication Quick Reference

**MARCUS Platform - Auth Cheat Sheet**

## Setup (5 minutes)

```bash
# 1. Setup database
./src/platform/scripts/setup-database.sh

# 2. Configure environment
cp src/platform/.env.example .env
# Edit .env: Set DB credentials and JWT secrets

# 3. Start server
npx tsx src/platform/api/server.ts
```

## Default Admin Login

```bash
Email: admin@marcus-platform.local
Password: changeme123!

⚠️ CHANGE THIS PASSWORD IMMEDIATELY IN PRODUCTION!
```

## API Endpoints

### Register User
```bash
POST /auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "role": "operator"  # optional: admin, operator, viewer
}
```

### Login
```bash
POST /auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

# Returns: { accessToken, refreshToken, expiresIn }
```

### Refresh Token
```bash
POST /auth/refresh
{
  "refreshToken": "<refresh_token>"
}

# Returns: { accessToken, refreshToken, expiresIn }
```

### Logout
```bash
POST /auth/logout
{
  "refreshToken": "<refresh_token>"
}
```

### Get Current User
```bash
GET /auth/me
Headers: Authorization: Bearer <access_token>
```

## Protected Endpoints

**Authorization header required:**
```bash
Authorization: Bearer <access_token>
```

### Platform Endpoints
```bash
POST /api/citations/analyze   # operator, admin
GET  /api/metrics              # viewer, operator, admin
POST /api/admin/agents         # admin only
GET  /api/admin/users          # admin only
PUT  /api/admin/users/:id/role # admin only
DELETE /api/admin/users/:id    # admin only
```

## User Roles

| Role | Permissions |
|------|------------|
| **viewer** | Read citations, metrics, agent status |
| **operator** | + Analyze citations, manage agents |
| **admin** | + User management, system config |

## Code Usage

### Protect Route (Express)
```typescript
import { requirePermission, requireAdmin } from '@/platform/auth/rbacMiddleware';
import { createJWTMiddleware } from '@/platform/auth/jwtMiddleware';

const jwtMiddleware = createJWTMiddleware(authService);

// Require authentication
app.get('/protected', jwtMiddleware.authenticate, (req, res) => {
  console.log(req.user); // { userId, email, role }
});

// Require specific permission
app.post('/citations',
  jwtMiddleware.authenticate,
  requirePermission('citations:write'),
  handler
);

// Require admin role
app.delete('/users/:id',
  jwtMiddleware.authenticate,
  requireAdmin,
  handler
);
```

### Use AuthService
```typescript
import { AuthService } from '@/platform/auth/authService';
import { Pool } from 'pg';

const pool = new Pool({ /* config */ });
const authService = new AuthService(pool, {
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
});

// Register user
const user = await authService.register({
  email: 'user@example.com',
  password: 'SecurePass123!',
  role: 'operator',
});

// Login
const tokens = await authService.login({
  email: 'user@example.com',
  password: 'SecurePass123!',
});

// Verify token
const payload = authService.verifyAccessToken(tokens.accessToken);
```

## Security Best Practices

✅ **DO:**
- Use HTTPS in production
- Store JWT secrets in environment variables (256-bit minimum)
- Change default admin password immediately
- Use strong passwords (8+ chars, mixed case, numbers, special chars)
- Store access tokens in memory only (not localStorage)
- Store refresh tokens in HttpOnly cookies with SameSite=Strict
- Monitor audit logs regularly

❌ **DON'T:**
- Hardcode JWT secrets
- Store tokens in localStorage (XSS vulnerable)
- Use weak passwords
- Skip password changes for default accounts
- Ignore failed login attempts
- Disable audit logging

## Troubleshooting

### "Invalid access token"
**Cause:** Token expired (15 min TTL)
**Fix:** Use refresh token to get new access token

### "Account locked"
**Cause:** 5 failed login attempts
**Fix:** Wait 15 minutes or admin can unlock via SQL:
```sql
UPDATE users SET locked_until = NULL, failed_login_attempts = 0
WHERE email = 'user@example.com';
```

### "JWT secret must be at least 32 characters"
**Cause:** Weak secret
**Fix:** Generate proper secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### "Database connection failed"
**Cause:** PostgreSQL not running or wrong credentials
**Fix:** Check database status and .env configuration

## Environment Variables

```bash
# Required
JWT_SECRET=<256-bit secret>
JWT_REFRESH_SECRET=<256-bit secret>
DB_HOST=localhost
DB_PORT=5432
DB_NAME=marcus_platform
DB_USER=postgres
DB_PASSWORD=<your password>

# Optional (defaults shown)
PORT=3000
HOST=0.0.0.0
CORS_ORIGINS=http://localhost:3333
ACCESS_TOKEN_TTL=900      # 15 minutes
REFRESH_TOKEN_TTL=604800  # 7 days
```

## Testing

```bash
# Run all auth tests
npx tsx --test src/platform/tests/auth.test.ts

# Type check
npx tsc --noEmit src/platform/auth/*.ts src/platform/api/*.ts
```

## Support

**Full Documentation:** [AUTHENTICATION.md](./AUTHENTICATION.md)
**Implementation Details:** [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
**Platform README:** [../README.md](../README.md)

---

**Marcus, Platform Engineer**
"Build platforms that make agent developers productive."
