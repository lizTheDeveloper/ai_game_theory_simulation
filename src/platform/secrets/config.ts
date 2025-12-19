/**
 * MARCUS 3.0 Citation Integrity Platform
 * Secrets Manager Configuration and Factory
 *
 * @module secrets/config
 * @author Marcus (Platform Engineer)
 */

import { SecretsManager, SecretsManagerConfig } from './secretsManager';
import { VaultBackend, VaultConfig } from './backends/vaultBackend';
import { AWSSecretsBackend, AWSSecretsConfig } from './backends/awsBackend';
import { EnvBackend, EnvBackendConfig } from './backends/envBackend';

// ============================================================================
// Default Configurations
// ============================================================================

/**
 * Production secrets configuration (Vault)
 */
export const PRODUCTION_VAULT_CONFIG: SecretsManagerConfig = {
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
    logSecretAccess: false, // Too verbose for production
    logRotations: true,
  },

  vaultConfig: {
    address: process.env.VAULT_ADDR || 'https://vault.example.com:8200',
    roleId: process.env.VAULT_ROLE_ID,
    secretId: process.env.VAULT_SECRET_ID,
    namespace: process.env.VAULT_NAMESPACE,
    mountPath: process.env.VAULT_MOUNT_PATH || 'secret',
  },
};

/**
 * Production secrets configuration (AWS)
 */
export const PRODUCTION_AWS_CONFIG: SecretsManagerConfig = {
  backend: 'aws',

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
    logSecretAccess: false,
    logRotations: true,
  },

  awsConfig: {
    region: process.env.AWS_REGION || 'us-east-1',
    // Credentials auto-discovered from IAM role
  },
};

/**
 * Development secrets configuration (Environment Variables)
 */
export const DEVELOPMENT_ENV_CONFIG: SecretsManagerConfig = {
  backend: 'env',

  cache: {
    enabled: false, // No caching needed for env vars (instant)
    defaultTTL: 0,
    maxSize: 0,
  },

  rotation: {
    enabled: false, // No rotation for env vars
    checkInterval: 0,
    defaultSchedule: 0,
  },

  audit: {
    enabled: true,
    logSecretAccess: true, // Verbose logging for development
    logRotations: false,
  },

  envConfig: {
    prefix: 'MARCUS_SECRET_',
    allowProduction: false, // NEVER allow in production
    validateSecrets: true,
  },
};

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create secrets manager from environment configuration
 */
export async function createSecretsManager(): Promise<SecretsManager> {
  const backend = (process.env.SECRETS_BACKEND || 'env') as 'vault' | 'aws' | 'env';
  const env = process.env.NODE_ENV || 'development';

  console.log(`🔐 Initializing secrets manager (backend: ${backend}, env: ${env})`);

  let secretsManager: SecretsManager;

  switch (backend) {
    case 'vault':
      secretsManager = createVaultSecretsManager();
      break;

    case 'aws':
      secretsManager = createAWSSecretsManager();
      break;

    case 'env':
      secretsManager = createEnvSecretsManager();
      break;

    default:
      throw new Error(`Unknown secrets backend: ${backend}`);
  }

  // Initialize
  await secretsManager.initialize();

  return secretsManager;
}

/**
 * Create Vault-backed secrets manager
 */
export function createVaultSecretsManager(customConfig?: Partial<SecretsManagerConfig>): SecretsManager {
  const config = { ...PRODUCTION_VAULT_CONFIG, ...customConfig };

  if (!config.vaultConfig) {
    throw new Error('Vault configuration required');
  }

  const backend = new VaultBackend(config.vaultConfig as VaultConfig);
  return new SecretsManager(backend, config);
}

/**
 * Create AWS Secrets Manager-backed secrets manager
 */
export function createAWSSecretsManager(customConfig?: Partial<SecretsManagerConfig>): SecretsManager {
  const config = { ...PRODUCTION_AWS_CONFIG, ...customConfig };

  if (!config.awsConfig) {
    throw new Error('AWS configuration required');
  }

  const backend = new AWSSecretsBackend(config.awsConfig as AWSSecretsConfig);
  return new SecretsManager(backend, config);
}

/**
 * Create environment variable-backed secrets manager
 */
export function createEnvSecretsManager(customConfig?: Partial<SecretsManagerConfig>): SecretsManager {
  const config = { ...DEVELOPMENT_ENV_CONFIG, ...customConfig };

  if (!config.envConfig) {
    throw new Error('Environment configuration required');
  }

  const backend = new EnvBackend(config.envConfig as EnvBackendConfig);
  return new SecretsManager(backend, config);
}

// ============================================================================
// Secret Path Conventions
// ============================================================================

/**
 * Standard secret paths for Marcus platform
 */
export const SECRET_PATHS = {
  // JWT secrets
  JWT_SECRET: 'marcus/platform/jwt-secret',
  JWT_REFRESH_SECRET: 'marcus/platform/jwt-refresh-secret',

  // Database credentials
  DB_USER: 'marcus/platform/db/user',
  DB_PASSWORD: 'marcus/platform/db/password',
  DB_HOST: 'marcus/platform/db/host',
  DB_PORT: 'marcus/platform/db/port',
  DB_NAME: 'marcus/platform/db/name',

  // Redis credentials
  REDIS_PASSWORD: 'marcus/platform/redis/password',
  REDIS_HOST: 'marcus/platform/redis/host',
  REDIS_PORT: 'marcus/platform/redis/port',

  // TLS certificates
  TLS_KEY_PASSPHRASE: 'marcus/platform/tls/key-passphrase',
  TLS_CERT: 'marcus/platform/tls/cert',
  TLS_KEY: 'marcus/platform/tls/key',

  // API keys
  OPENAI_API_KEY: 'marcus/platform/api-keys/openai',
  ANTHROPIC_API_KEY: 'marcus/platform/api-keys/anthropic',

  // Encryption keys
  ENCRYPTION_KEY: 'marcus/platform/encryption/master-key',
};

/**
 * Helper to generate secret paths
 */
export function generateSecretPath(category: string, name: string): string {
  return `marcus/platform/${category}/${name}`;
}
