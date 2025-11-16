/**
 * Secrets Management
 *
 * Environment-based secret loading with support for:
 * - Development: .env files
 * - Production: HashiCorp Vault, AWS Secrets Manager, GCP Secret Manager
 *
 * Security principles:
 * - Never log secrets
 * - Fail loudly if required secrets missing
 * - Support secret rotation
 * - Encrypted at rest
 */

import * as fs from 'fs';
import * as path from 'path';

export interface SecretConfig {
  // Database
  postgresPassword: string;
  postgresUser: string;
  postgresDatabase: string;
  postgresHost: string;
  postgresPort: number;

  // Redis
  redisPassword: string;
  redisHost: string;
  redisPort: number;

  // API
  apiKey: string;
  jwtSecret: string;

  // External services (optional)
  openaiApiKey?: string;
  anthropicApiKey?: string;
  doiApiKey?: string;
}

export interface VaultConfig {
  url: string;
  token?: string;
  roleId?: string;
  secretId?: string;
  namespace?: string;
}

export interface AWSSecretsConfig {
  region: string;
  secretName: string;
}

export interface GCPSecretsConfig {
  projectId: string;
  secretName: string;
}

/**
 * Base secret provider interface
 */
export interface SecretProvider {
  getSecret(key: string): Promise<string | null>;
  getAllSecrets(): Promise<Record<string, string>>;
}

/**
 * Environment variable provider (development)
 */
export class EnvironmentSecretProvider implements SecretProvider {
  async getSecret(key: string): Promise<string | null> {
    return process.env[key] || null;
  }

  async getAllSecrets(): Promise<Record<string, string>> {
    return process.env as Record<string, string>;
  }
}

/**
 * HashiCorp Vault provider (production)
 */
export class VaultSecretProvider implements SecretProvider {
  private config: VaultConfig;
  private token: string | null = null;

  constructor(config: VaultConfig) {
    this.config = config;
  }

  async authenticate(): Promise<void> {
    if (this.config.token) {
      this.token = this.config.token;
      return;
    }

    // AppRole authentication
    if (this.config.roleId && this.config.secretId) {
      const response = await fetch(`${this.config.url}/v1/auth/approle/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role_id: this.config.roleId,
          secret_id: this.config.secretId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Vault authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.token = data.auth.client_token;
    } else {
      throw new Error('Vault authentication credentials not provided');
    }
  }

  async getSecret(key: string): Promise<string | null> {
    if (!this.token) {
      await this.authenticate();
    }

    const headers: Record<string, string> = {
      'X-Vault-Token': this.token!,
    };

    if (this.config.namespace) {
      headers['X-Vault-Namespace'] = this.config.namespace;
    }

    const response = await fetch(`${this.config.url}/v1/secret/data/citation-platform`, {
      headers,
    });

    if (!response.ok) {
      console.error(`Failed to fetch secret ${key} from Vault`);
      return null;
    }

    const data = await response.json();
    return data.data.data[key] || null;
  }

  async getAllSecrets(): Promise<Record<string, string>> {
    if (!this.token) {
      await this.authenticate();
    }

    const headers: Record<string, string> = {
      'X-Vault-Token': this.token!,
    };

    if (this.config.namespace) {
      headers['X-Vault-Namespace'] = this.config.namespace;
    }

    const response = await fetch(`${this.config.url}/v1/secret/data/citation-platform`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch secrets from Vault: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.data;
  }
}

/**
 * AWS Secrets Manager provider
 */
export class AWSSecretsProvider implements SecretProvider {
  private config: AWSSecretsConfig;

  constructor(config: AWSSecretsConfig) {
    this.config = config;
  }

  async getSecret(key: string): Promise<string | null> {
    try {
      const { SecretsManagerClient, GetSecretValueCommand } = await import(
        '@aws-sdk/client-secrets-manager'
      );

      const client = new SecretsManagerClient({ region: this.config.region });
      const command = new GetSecretValueCommand({ SecretId: this.config.secretName });
      const response = await client.send(command);

      if (response.SecretString) {
        const secrets = JSON.parse(response.SecretString);
        return secrets[key] || null;
      }

      return null;
    } catch (error) {
      console.error(`Failed to fetch secret ${key} from AWS:`, error);
      return null;
    }
  }

  async getAllSecrets(): Promise<Record<string, string>> {
    try {
      const { SecretsManagerClient, GetSecretValueCommand } = await import(
        '@aws-sdk/client-secrets-manager'
      );

      const client = new SecretsManagerClient({ region: this.config.region });
      const command = new GetSecretValueCommand({ SecretId: this.config.secretName });
      const response = await client.send(command);

      if (response.SecretString) {
        return JSON.parse(response.SecretString);
      }

      return {};
    } catch (error) {
      throw new Error(`Failed to fetch secrets from AWS: ${error}`);
    }
  }
}

/**
 * GCP Secret Manager provider
 */
export class GCPSecretsProvider implements SecretProvider {
  private config: GCPSecretsConfig;

  constructor(config: GCPSecretsConfig) {
    this.config = config;
  }

  async getSecret(key: string): Promise<string | null> {
    try {
      const { SecretManagerServiceClient } = await import('@google-cloud/secret-manager');
      const client = new SecretManagerServiceClient();

      const [version] = await client.accessSecretVersion({
        name: `projects/${this.config.projectId}/secrets/${this.config.secretName}/versions/latest`,
      });

      const payload = version.payload?.data?.toString();
      if (payload) {
        const secrets = JSON.parse(payload);
        return secrets[key] || null;
      }

      return null;
    } catch (error) {
      console.error(`Failed to fetch secret ${key} from GCP:`, error);
      return null;
    }
  }

  async getAllSecrets(): Promise<Record<string, string>> {
    try {
      const { SecretManagerServiceClient } = await import('@google-cloud/secret-manager');
      const client = new SecretManagerServiceClient();

      const [version] = await client.accessSecretVersion({
        name: `projects/${this.config.projectId}/secrets/${this.config.secretName}/versions/latest`,
      });

      const payload = version.payload?.data?.toString();
      if (payload) {
        return JSON.parse(payload);
      }

      return {};
    } catch (error) {
      throw new Error(`Failed to fetch secrets from GCP: ${error}`);
    }
  }
}

/**
 * Load secrets based on environment
 */
export async function loadSecrets(): Promise<SecretConfig> {
  const env = process.env.NODE_ENV || 'development';

  let provider: SecretProvider;

  if (env === 'production') {
    // Production: Use external secret manager
    const secretsBackend = process.env.SECRETS_BACKEND || 'vault';

    switch (secretsBackend) {
      case 'vault':
        provider = new VaultSecretProvider({
          url: process.env.VAULT_URL || 'http://vault:8200',
          token: process.env.VAULT_TOKEN,
          roleId: process.env.VAULT_ROLE_ID,
          secretId: process.env.VAULT_SECRET_ID,
          namespace: process.env.VAULT_NAMESPACE,
        });
        break;

      case 'aws':
        provider = new AWSSecretsProvider({
          region: process.env.AWS_REGION || 'us-east-1',
          secretName: process.env.AWS_SECRET_NAME || 'citation-platform',
        });
        break;

      case 'gcp':
        provider = new GCPSecretsProvider({
          projectId: process.env.GCP_PROJECT_ID!,
          secretName: process.env.GCP_SECRET_NAME || 'citation-platform',
        });
        break;

      default:
        console.warn(`⚠️  Unknown secrets backend: ${secretsBackend}, falling back to env`);
        provider = new EnvironmentSecretProvider();
    }
  } else {
    // Development: Use environment variables
    provider = new EnvironmentSecretProvider();
  }

  // Load all secrets
  const secrets = await provider.getAllSecrets();

  // Validate required secrets
  const required = [
    'PGPASSWORD',
    'PGUSER',
    'PGDATABASE',
    'REDIS_PASSWORD',
    'API_KEY',
    'JWT_SECRET',
  ];

  const missing = required.filter((key) => !secrets[key]);
  if (missing.length > 0) {
    throw new Error(
      `❌ CRITICAL: Required secrets missing: ${missing.join(', ')}\n` +
        `Set these environment variables or configure secret manager.`
    );
  }

  // Validate JWT secret length
  if (secrets.JWT_SECRET.length < 32) {
    throw new Error('❌ CRITICAL: JWT_SECRET must be at least 32 characters');
  }

  return {
    postgresPassword: secrets.PGPASSWORD,
    postgresUser: secrets.PGUSER || 'citation_platform',
    postgresDatabase: secrets.PGDATABASE || 'citation_platform',
    postgresHost: secrets.PGHOST || 'localhost',
    postgresPort: parseInt(secrets.PGPORT || '5432'),

    redisPassword: secrets.REDIS_PASSWORD,
    redisHost: secrets.REDIS_HOST || 'localhost',
    redisPort: parseInt(secrets.REDIS_PORT || '6379'),

    apiKey: secrets.API_KEY,
    jwtSecret: secrets.JWT_SECRET,

    // Optional
    openaiApiKey: secrets.OPENAI_API_KEY,
    anthropicApiKey: secrets.ANTHROPIC_API_KEY,
    doiApiKey: secrets.DOI_API_KEY,
  };
}

/**
 * Mask secret for logging (show first 4 chars only)
 */
export function maskSecret(secret: string): string {
  if (secret.length <= 4) return '****';
  return `${secret.substring(0, 4)}${'*'.repeat(secret.length - 4)}`;
}

/**
 * Validate secret rotation (check if secret was updated recently)
 */
export function isSecretStale(lastRotated: Date, maxAgedays = 90): boolean {
  const ageMs = Date.now() - lastRotated.getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  return ageDays > maxAgedays;
}
