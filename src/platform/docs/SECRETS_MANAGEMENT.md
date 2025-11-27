# Marcus Platform Secrets Management

**Production-grade secrets management for the MARCUS 3.0 Citation Integrity Platform.**

## Overview

The Marcus Platform Secrets Manager provides secure, production-ready secrets management with:

- **Multiple backend support** - HashiCorp Vault, AWS Secrets Manager, Environment Variables
- **Secret caching with TTL** - Reduce API calls, configurable expiration
- **Automatic rotation** - Zero-downtime secret rotation with dual-secret support
- **Type-safe access** - TypeScript interfaces for all secret operations
- **Audit logging** - Track secret access and rotation events
- **Graceful degradation** - Handle backend failures without crashing

## Architecture

```
┌─────────────────────────────────────┐
│       SecretsManager (Core)         │
│  - Caching (TTL-based)              │
│  - Rotation scheduling              │
│  - Audit logging                    │
│  - Type-safe API                    │
└───────────┬─────────────────────────┘
            │
    ┌───────┴────────┬────────────┐
    │                │            │
┌───▼────┐   ┌──────▼─────┐  ┌──▼──────┐
│ Vault  │   │    AWS     │  │  Env    │
│Backend │   │  Backend   │  │ Backend │
└────────┘   └────────────┘  └─────────┘
```

### Supported Backends

| Backend              | Use Case        | Features                                      |
|----------------------|-----------------|-----------------------------------------------|
| **HashiCorp Vault**  | Production      | KV v2, AppRole auth, versioning, lease mgmt   |
| **AWS Secrets Manager** | AWS deployments | IAM roles, automatic rotation, replication |
| **Environment Variables** | Development | .env file support, validation, **NEVER use in production** |

## Quick Start

### Development (Environment Variables)

```bash
# 1. Create .env.secrets file
cat > .env.secrets << EOF
MARCUS_SECRET_JWT_SECRET=your-jwt-secret-here-min-32-chars
MARCUS_SECRET_JWT_REFRESH_SECRET=your-refresh-secret-here-min-32-chars
MARCUS_SECRET_DB_PASSWORD=your-db-password-here
MARCUS_SECRET_REDIS_PASSWORD=your-redis-password-here
EOF

# 2. Load in your app
```

```typescript
import { createSecretsManager } from '@/platform/secrets/config';

const secretsManager = await createSecretsManager();

// Get secrets
const jwtSecret = await secretsManager.getSecret('marcus/platform/jwt-secret');
const dbPassword = await secretsManager.getSecret('marcus/platform/db/password');
```

### Production (HashiCorp Vault)

```bash
# 1. Set environment variables
export SECRETS_BACKEND=vault
export VAULT_ADDR=https://vault.example.com:8200
export VAULT_ROLE_ID=your-role-id
export VAULT_SECRET_ID=your-secret-id
export VAULT_MOUNT_PATH=secret

# 2. Initialize secrets
npm run secrets:init vault

# 3. Use in app (same API as development)
```

```typescript
const secretsManager = await createSecretsManager(); // Auto-detects Vault backend
```

## Configuration

### Environment Variables

| Variable               | Description                        | Required | Default              |
|------------------------|------------------------------------|----------|----------------------|
| `SECRETS_BACKEND`      | Backend to use (vault/aws/env)     | No       | `env`                |
| `VAULT_ADDR`           | Vault server address               | Vault    | -                    |
| `VAULT_ROLE_ID`        | AppRole role ID                    | Vault    | -                    |
| `VAULT_SECRET_ID`      | AppRole secret ID                  | Vault    | -                    |
| `VAULT_NAMESPACE`      | Vault namespace (Enterprise)       | No       | -                    |
| `VAULT_MOUNT_PATH`     | KV v2 mount path                   | No       | `secret`             |
| `AWS_REGION`           | AWS region                         | AWS      | `us-east-1`          |
| `MARCUS_SECRET_*`      | Environment variable secrets       | Env      | -                    |

### Programmatic Configuration

```typescript
import { SecretsManager } from '@/platform/secrets/secretsManager';
import { VaultBackend } from '@/platform/secrets/backends/vaultBackend';

const backend = new VaultBackend({
  address: 'https://vault.example.com:8200',
  roleId: process.env.VAULT_ROLE_ID,
  secretId: process.env.VAULT_SECRET_ID,
  mountPath: 'secret',
});

const secretsManager = new SecretsManager(backend, {
  backend: 'vault',
  cache: {
    enabled: true,
    defaultTTL: 300, // 5 minutes
    maxSize: 100,
  },
  rotation: {
    enabled: true,
    checkInterval: 3600, // 1 hour
    defaultSchedule: 7776000, // 90 days
  },
  audit: {
    enabled: true,
    logSecretAccess: false, // Too verbose
    logRotations: true,
  },
});

await secretsManager.initialize();
```

## Secret Paths

The platform uses standardized secret paths:

```typescript
import { SECRET_PATHS } from '@/platform/secrets/config';

// JWT secrets
SECRET_PATHS.JWT_SECRET              // marcus/platform/jwt-secret
SECRET_PATHS.JWT_REFRESH_SECRET      // marcus/platform/jwt-refresh-secret

// Database credentials
SECRET_PATHS.DB_USER                 // marcus/platform/db/user
SECRET_PATHS.DB_PASSWORD             // marcus/platform/db/password
SECRET_PATHS.DB_HOST                 // marcus/platform/db/host

// Redis credentials
SECRET_PATHS.REDIS_PASSWORD          // marcus/platform/redis/password

// TLS certificates
SECRET_PATHS.TLS_KEY_PASSPHRASE      // marcus/platform/tls/key-passphrase

// API keys
SECRET_PATHS.OPENAI_API_KEY          // marcus/platform/api-keys/openai

// Encryption keys
SECRET_PATHS.ENCRYPTION_KEY          // marcus/platform/encryption/master-key
```

## CLI Tools

### Initialize Secrets

```bash
# Initialize secrets in Vault
npm run secrets:init vault

# Initialize in AWS Secrets Manager
npm run secrets:init aws

# Force overwrite existing secrets
npm run secrets:init vault --force
```

### Validate Secrets

```bash
# Validate all secrets are accessible and valid
npm run secrets:validate

# Check for:
# - Accessibility (can fetch from backend)
# - Length (minimum 32 characters)
# - Entropy (sufficient randomness)
# - Weak patterns (no "password", "secret", etc.)
```

### Rotate Secrets

```bash
# Rotate single secret
npm run secrets:rotate JWT_SECRET

# Rotate all secrets
npm run secrets:rotate all

# Verify-only (no changes)
npm run secrets:rotate all --verify-only
```

### Migrate Secrets

```bash
# Migrate from .env to Vault
npm run secrets:migrate vault

# Dry run (preview changes)
npm run secrets:migrate vault --dry-run

# Migrate to AWS Secrets Manager
npm run secrets:migrate aws
```

## Usage Examples

### Basic Usage

```typescript
import { createSecretsManager, SECRET_PATHS } from '@/platform/secrets/config';

const secretsManager = await createSecretsManager();

// Get secret
const jwtSecret = await secretsManager.getSecret(SECRET_PATHS.JWT_SECRET);

// Set secret (for rotation)
await secretsManager.setSecret(SECRET_PATHS.JWT_SECRET, 'new-secret-value');

// Delete secret
await secretsManager.deleteSecret('marcus/platform/old-key');

// List secrets
const secrets = await secretsManager.listSecrets('marcus/platform/');
```

### Secret Rotation

```typescript
import * as crypto from 'crypto';

// Rotate secret with custom generator
await secretsManager.rotateSecret(
  SECRET_PATHS.JWT_SECRET,
  () => crypto.randomBytes(32).toString('hex')
);

// Async generator
await secretsManager.rotateSecret(
  SECRET_PATHS.DB_PASSWORD,
  async () => {
    // Generate complex password
    return generateSecurePassword();
  }
);
```

### Event Handling

```typescript
secretsManager.on('secret_accessed', ({ path, cached }) => {
  console.log(`Secret accessed: ${path} (cached: ${cached})`);
});

secretsManager.on('secret_rotated', ({ path, oldVersion, newVersion }) => {
  console.log(`Secret rotated: ${path} (v${oldVersion} → v${newVersion})`);
});

secretsManager.on('rotation_check', () => {
  // Perform custom rotation logic
});
```

### Secret Scrubbing (Logging)

```typescript
import { redactSecret, scrubSecrets } from '@/platform/secrets/secretsManager';

// Redact secrets in strings
const logMessage = 'User logged in with token=abc123def456';
console.log(redactSecret(logMessage));
// Output: User logged in with token=ab***56

// Scrub secrets from objects
const userObj = {
  email: 'user@example.com',
  password: 'secret123',
  token: 'xyz789',
};

console.log(scrubSecrets(userObj));
// Output: { email: 'user@example.com', password: '***REDACTED***', token: '***REDACTED***' }
```

## Production Deployment

### HashiCorp Vault Setup

```bash
# 1. Enable KV v2 engine
vault secrets enable -version=2 -path=secret kv

# 2. Create AppRole
vault auth enable approle
vault write auth/approle/role/marcus-platform \
  secret_id_ttl=24h \
  token_ttl=1h \
  token_max_ttl=4h \
  policies="marcus-platform-policy"

# 3. Create policy
vault policy write marcus-platform-policy - <<EOF
path "secret/data/marcus/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}
path "secret/metadata/marcus/*" {
  capabilities = ["list", "read", "delete"]
}
EOF

# 4. Get credentials
vault read auth/approle/role/marcus-platform/role-id
vault write -f auth/approle/role/marcus-platform/secret-id

# 5. Set environment variables
export VAULT_ROLE_ID=<role-id>
export VAULT_SECRET_ID=<secret-id>
```

### AWS Secrets Manager Setup

```bash
# 1. Create IAM policy
aws iam create-policy --policy-name MarcusPlatformSecretsAccess --policy-document '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:PutSecretValue",
        "secretsmanager:CreateSecret",
        "secretsmanager:UpdateSecret",
        "secretsmanager:DeleteSecret",
        "secretsmanager:ListSecrets"
      ],
      "Resource": "arn:aws:secretsmanager:*:*:secret:marcus/*"
    }
  ]
}'

# 2. Attach to IAM role (EC2/ECS/Lambda)
aws iam attach-role-policy \
  --role-name your-role-name \
  --policy-arn arn:aws:iam::ACCOUNT:policy/MarcusPlatformSecretsAccess

# 3. Use IAM role (no access keys needed)
export SECRETS_BACKEND=aws
export AWS_REGION=us-east-1
```

### Docker Deployment

```dockerfile
# Use build args for backend configuration
FROM node:20-alpine

ENV SECRETS_BACKEND=vault
ENV VAULT_ADDR=https://vault.example.com:8200

# Use secrets at runtime (not build time!)
CMD ["node", "server.js"]
```

```bash
# Pass secrets via environment (Vault/AWS credentials)
docker run -e VAULT_ROLE_ID=xxx -e VAULT_SECRET_ID=yyy marcus-platform
```

### Kubernetes Deployment

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: marcus-vault-credentials
type: Opaque
stringData:
  vault-role-id: "your-role-id"
  vault-secret-id: "your-secret-id"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: marcus-platform
spec:
  template:
    spec:
      containers:
      - name: marcus-platform
        image: marcus-platform:latest
        env:
        - name: SECRETS_BACKEND
          value: "vault"
        - name: VAULT_ADDR
          value: "https://vault.example.com:8200"
        - name: VAULT_ROLE_ID
          valueFrom:
            secretKeyRef:
              name: marcus-vault-credentials
              key: vault-role-id
        - name: VAULT_SECRET_ID
          valueFrom:
            secretKeyRef:
              name: marcus-vault-credentials
              key: vault-secret-id
```

## Security Best Practices

### 1. Never Commit Secrets

```bash
# .gitignore
.env.secrets
.env.local
config/secrets-*.json
```

### 2. Use Short-Lived Secrets

- Access tokens: 15 minutes
- Refresh tokens: 7 days
- Database passwords: Rotate every 90 days
- API keys: Rotate on compromise

### 3. Principle of Least Privilege

- Grant only required permissions
- Use separate roles for different environments
- Limit secret access by path prefix

### 4. Audit Logging

```typescript
const secretsManager = new SecretsManager(backend, {
  audit: {
    enabled: true,
    logSecretAccess: process.env.NODE_ENV !== 'production', // Verbose in dev
    logRotations: true, // Always log rotations
  },
});
```

### 5. Regular Rotation

```bash
# Cron job for automatic rotation (every 90 days)
0 0 1 */3 * cd /app && npm run secrets:rotate all
```

### 6. Emergency Access

Document emergency access procedures:
- Vault root token location (sealed, offline storage)
- AWS root account credentials
- Break-glass procedures for production incidents

## Monitoring & Alerts

### Health Checks

```typescript
// Add to /health endpoint
const health = await secretsManager.healthCheck();
if (!health.healthy) {
  // Alert: Secrets backend unhealthy
  console.error(`Secrets backend unhealthy: ${health.error}`);
}
```

### Metrics (Prometheus)

```typescript
import { Counter, Histogram } from 'prom-client';

const secretAccessCounter = new Counter({
  name: 'secrets_accessed_total',
  help: 'Total number of secret accesses',
  labelNames: ['path', 'cached'],
});

const secretRotationCounter = new Counter({
  name: 'secrets_rotated_total',
  help: 'Total number of secret rotations',
  labelNames: ['path', 'success'],
});

secretsManager.on('secret_accessed', ({ path, cached }) => {
  secretAccessCounter.inc({ path, cached: String(cached) });
});

secretsManager.on('secret_rotated', ({ path }) => {
  secretRotationCounter.inc({ path, success: 'true' });
});
```

## Troubleshooting

### Secret Not Found

```typescript
// Check if secret exists
try {
  await secretsManager.getSecret('nonexistent');
} catch (err) {
  console.error(err.message); // "Secret not found: nonexistent"
}

// List secrets to find correct path
const secrets = await secretsManager.listSecrets('marcus/platform/');
console.log('Available secrets:', secrets);
```

### Backend Unhealthy

```bash
# Check backend connectivity
npm run secrets:validate

# Vault: Verify token
vault token lookup

# AWS: Verify credentials
aws sts get-caller-identity
```

### Cache Issues

```typescript
// Clear cache to force fresh fetch
secretsManager.clearCache();

// Bypass cache for single fetch
const secret = await secretsManager.getSecret('path', true);
```

### Rotation Failures

```bash
# Verify-only mode (no changes)
npm run secrets:rotate all --verify-only

# Check rotation logs
grep "Secret rotated" /var/log/marcus-platform.log
```

## Migration Guide

### From Environment Variables to Vault

1. **Audit current secrets**
   ```bash
   npm run secrets:validate
   ```

2. **Dry run migration**
   ```bash
   npm run secrets:migrate vault --dry-run
   ```

3. **Perform migration**
   ```bash
   npm run secrets:migrate vault
   ```

4. **Update configuration**
   ```bash
   export SECRETS_BACKEND=vault
   export VAULT_ADDR=https://vault.example.com:8200
   # ... other Vault env vars
   ```

5. **Restart application**
   ```bash
   pm2 restart marcus-platform
   ```

6. **Verify**
   ```bash
   npm run secrets:validate
   ```

7. **Remove .env.secrets**
   ```bash
   rm .env.secrets
   ```

## API Reference

See source files for complete API documentation:
- `/src/platform/secrets/secretsManager.ts` - Core SecretsManager
- `/src/platform/secrets/backends/vaultBackend.ts` - Vault backend
- `/src/platform/secrets/backends/awsBackend.ts` - AWS backend
- `/src/platform/secrets/backends/envBackend.ts` - Environment backend
- `/src/platform/secrets/config.ts` - Configuration helpers

---

**Security Notice:** This secrets management system follows OWASP Secret Management Cheat Sheet guidelines. For production deployments, always use HashiCorp Vault or AWS Secrets Manager. Never use environment variables for production secrets.
