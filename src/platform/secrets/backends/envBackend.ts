/**
 * MARCUS 3.0 Citation Integrity Platform
 * Environment Variable Backend for Secrets Management
 *
 * **DEVELOPMENT ONLY**
 *
 * Features:
 * - Loads secrets from environment variables
 * - dotenv file support
 * - Validation and warnings
 * - NEVER use in production
 *
 * Security:
 * - Fails loudly if used in production (unless explicitly allowed)
 * - Validates secret strength
 * - Logs warnings for insecure configuration
 *
 * @module envBackend
 * @author Marcus (Platform Engineer)
 */

import * as fs from 'fs';
import * as path from 'path';
import { ISecretsBackend, Secret, SecretMetadata, BackendHealth } from '../secretsManager';

// ============================================================================
// Types
// ============================================================================

export interface EnvBackendConfig {
  prefix?: string; // Environment variable prefix (e.g., 'MARCUS_SECRET_')
  envFile?: string; // Path to .env file
  allowProduction: boolean; // Allow in production (DANGEROUS)
  validateSecrets?: boolean; // Validate secret strength
}

// ============================================================================
// Environment Variable Backend
// ============================================================================

/**
 * Environment variable secrets backend
 *
 * **WARNING: DEVELOPMENT ONLY**
 *
 * This backend reads secrets from environment variables and .env files.
 * It is NOT suitable for production use due to:
 * - No encryption at rest
 * - No audit trail
 * - No rotation support
 * - Secrets exposed in process memory
 * - Risk of accidental logging/exposure
 *
 * Usage:
 * ```typescript
 * const env = new EnvBackend({
 *   prefix: 'MARCUS_SECRET_',
 *   envFile: '.env.secrets',
 *   allowProduction: false,
 * });
 *
 * await env.initialize();
 * const secret = await env.getSecret('jwt-secret'); // Reads MARCUS_SECRET_JWT_SECRET
 * ```
 */
export class EnvBackend implements ISecretsBackend {
  readonly name = 'environment-variables';
  private config: EnvBackendConfig;
  private secrets: Map<string, string>;

  constructor(config: EnvBackendConfig) {
    this.config = {
      prefix: 'MARCUS_SECRET_',
      validateSecrets: true,
      ...config,
    };

    this.secrets = new Map();
  }

  /**
   * Initialize environment variable backend
   */
  async initialize(): Promise<void> {
    // Check if production
    if (process.env.NODE_ENV === 'production' && !this.config.allowProduction) {
      throw new Error(
        '❌ CRITICAL: Environment variable backend is NOT safe for production. ' +
        'Use HashiCorp Vault or AWS Secrets Manager instead. ' +
        'Set allowProduction: true to bypass this check (NOT RECOMMENDED).'
      );
    }

    if (process.env.NODE_ENV === 'production' && this.config.allowProduction) {
      console.warn(
        '🚨 WARNING: Using environment variables for secrets in production. ' +
        'This is INSECURE. Migrate to Vault or AWS Secrets Manager immediately.'
      );
    }

    // Load .env file if specified
    if (this.config.envFile) {
      this.loadEnvFile(this.config.envFile);
    }

    // Load secrets from environment
    this.loadFromEnvironment();

    // Validate secrets if enabled
    if (this.config.validateSecrets) {
      this.validateSecrets();
    }

    console.log(`✅ Environment variable backend initialized (${this.secrets.size} secrets loaded)`);
  }

  /**
   * Load secrets from .env file
   */
  private loadEnvFile(filePath: string): void {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ .env file not found: ${filePath}`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    for (const line of lines) {
      // Skip comments and empty lines
      if (line.trim().startsWith('#') || !line.trim()) {
        continue;
      }

      // Parse KEY=value
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match) {
        const [, key, value] = match;

        // Check if key matches prefix
        if (key.startsWith(this.config.prefix!)) {
          const secretName = key.substring(this.config.prefix!.length);
          this.secrets.set(secretName, value);
        }
      }
    }

    console.log(`✅ Loaded ${this.secrets.size} secrets from ${filePath}`);
  }

  /**
   * Load secrets from process environment
   */
  private loadFromEnvironment(): void {
    for (const [key, value] of Object.entries(process.env)) {
      if (key.startsWith(this.config.prefix!) && value) {
        const secretName = key.substring(this.config.prefix!.length);
        this.secrets.set(secretName, value);
      }
    }
  }

  /**
   * Validate secret strength
   */
  private validateSecrets(): void {
    const warnings: string[] = [];

    for (const [name, value] of this.secrets.entries()) {
      // Check minimum length
      if (value.length < 16) {
        warnings.push(`Secret '${name}' is too short (${value.length} chars, minimum 16)`);
      }

      // Check for common weak values
      const weakValues = ['password', 'secret', '123456', 'changeme', 'admin'];
      if (weakValues.some(weak => value.toLowerCase().includes(weak))) {
        warnings.push(`Secret '${name}' contains weak pattern`);
      }

      // Check entropy (basic)
      const uniqueChars = new Set(value).size;
      if (uniqueChars < 8) {
        warnings.push(`Secret '${name}' has low entropy (${uniqueChars} unique characters)`);
      }
    }

    if (warnings.length > 0) {
      console.warn('⚠️ Secret validation warnings:');
      warnings.forEach(w => console.warn(`  - ${w}`));
    }
  }

  /**
   * Get secret by name
   *
   * @param path Secret name (e.g., 'jwt-secret' → MARCUS_SECRET_JWT_SECRET)
   */
  async getSecret(path: string): Promise<Secret> {
    // Normalize path to environment variable format
    const envKey = this.pathToEnvKey(path);

    const value = this.secrets.get(envKey);
    if (!value) {
      throw new Error(
        `Secret not found: ${path} (expected env var: ${this.config.prefix}${envKey})`
      );
    }

    return {
      value,
      metadata: {
        path,
        createdAt: new Date(), // Not tracked for env vars
      },
    };
  }

  /**
   * Set secret (updates in-memory only, NOT persisted)
   */
  async setSecret(path: string, value: string, metadata?: Partial<SecretMetadata>): Promise<void> {
    const envKey = this.pathToEnvKey(path);

    this.secrets.set(envKey, value);

    console.warn(
      `⚠️ Environment backend: Secret '${path}' updated in-memory only. ` +
      `Changes will be lost on restart. Update .env file manually to persist.`
    );
  }

  /**
   * Delete secret (removes from in-memory map only)
   */
  async deleteSecret(path: string): Promise<void> {
    const envKey = this.pathToEnvKey(path);

    if (!this.secrets.has(envKey)) {
      console.warn(`⚠️ Secret '${path}' not found (already deleted?)`);
      return;
    }

    this.secrets.delete(envKey);

    console.warn(
      `⚠️ Environment backend: Secret '${path}' deleted from memory. ` +
      `Update .env file manually to persist deletion.`
    );
  }

  /**
   * List secrets with path prefix
   */
  async listSecrets(pathPrefix: string): Promise<string[]> {
    const prefix = this.pathToEnvKey(pathPrefix);

    return Array.from(this.secrets.keys())
      .filter(key => key.startsWith(prefix))
      .map(key => this.envKeyToPath(key));
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<BackendHealth> {
    return {
      healthy: true,
      backend: 'environment-variables',
      latency: 0, // Instant (in-memory)
    };
  }

  /**
   * Convert path to environment variable key
   * Example: 'marcus/platform/jwt-secret' → 'MARCUS_PLATFORM_JWT_SECRET'
   */
  private pathToEnvKey(path: string): string {
    return path
      .replace(/\//g, '_')
      .replace(/-/g, '_')
      .toUpperCase();
  }

  /**
   * Convert environment variable key to path
   * Example: 'MARCUS_PLATFORM_JWT_SECRET' → 'marcus/platform/jwt-secret'
   */
  private envKeyToPath(envKey: string): string {
    return envKey.toLowerCase().replace(/_/g, '/');
  }

  /**
   * Export secrets to .env file (for backup/migration)
   */
  async exportToEnvFile(filePath: string): Promise<void> {
    const lines: string[] = [
      '# Marcus Platform Secrets',
      `# Generated: ${new Date().toISOString()}`,
      '# WARNING: Keep this file secure and never commit to version control',
      '',
    ];

    for (const [key, value] of this.secrets.entries()) {
      lines.push(`${this.config.prefix}${key}=${value}`);
    }

    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
    console.log(`✅ Exported ${this.secrets.size} secrets to ${filePath}`);
  }

  /**
   * Close (no-op for environment backend)
   */
  async close(): Promise<void> {
    this.secrets.clear();
  }
}
