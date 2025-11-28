/**
 * MARCUS 3.0 Citation Integrity Platform
 * Secrets Management System
 *
 * Production-grade secrets management with:
 * - Multiple backend support (Vault, AWS Secrets Manager, Environment)
 * - Secret caching with TTL
 * - Automatic rotation support
 * - Type-safe secret access
 * - Audit logging
 * - Graceful degradation
 *
 * Security Standards:
 * - OWASP Secret Management Cheat Sheet
 * - Principle of least privilege
 * - Short-lived secrets when possible
 * - Encrypted at rest and in transit
 * - Regular rotation (90 days max)
 *
 * @module secretsManager
 * @author Marcus (Platform Engineer)
 */

import { EventEmitter } from 'events';

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Secret metadata
 */
export interface SecretMetadata {
  path: string;
  version?: number;
  createdAt?: Date;
  expiresAt?: Date;
  rotatedAt?: Date;
  rotationSchedule?: number; // seconds
}

/**
 * Secret value with metadata
 */
export interface Secret {
  value: string;
  metadata: SecretMetadata;
}

/**
 * Secret rotation result
 */
export interface RotationResult {
  success: boolean;
  oldVersion?: number;
  newVersion?: number;
  error?: string;
}

/**
 * Backend health status
 */
export interface BackendHealth {
  healthy: boolean;
  backend: string;
  latency?: number;
  error?: string;
}

/**
 * Secret cache entry
 */
interface CacheEntry {
  secret: Secret;
  fetchedAt: Date;
  ttl: number;
}

/**
 * Secrets backend interface
 */
export interface ISecretsBackend {
  /**
   * Backend name (for logging)
   */
  readonly name: string;

  /**
   * Initialize backend connection
   */
  initialize(): Promise<void>;

  /**
   * Get secret by path
   */
  getSecret(path: string): Promise<Secret>;

  /**
   * Set secret (for rotation)
   */
  setSecret(path: string, value: string, metadata?: Partial<SecretMetadata>): Promise<void>;

  /**
   * Delete secret
   */
  deleteSecret(path: string): Promise<void>;

  /**
   * List secrets at path
   */
  listSecrets(path: string): Promise<string[]>;

  /**
   * Health check
   */
  healthCheck(): Promise<BackendHealth>;

  /**
   * Close connections
   */
  close(): Promise<void>;
}

/**
 * Secrets manager configuration
 */
export interface SecretsManagerConfig {
  backend: 'vault' | 'aws' | 'env';

  // Caching configuration
  cache: {
    enabled: boolean;
    defaultTTL: number; // seconds
    maxSize: number; // max entries
  };

  // Rotation configuration
  rotation: {
    enabled: boolean;
    checkInterval: number; // seconds
    defaultSchedule: number; // seconds (default 90 days)
  };

  // Audit logging
  audit: {
    enabled: boolean;
    logSecretAccess: boolean;
    logRotations: boolean;
  };

  // Backend-specific configuration
  vaultConfig?: {
    address: string;
    token?: string;
    roleId?: string;
    secretId?: string;
    namespace?: string;
    mountPath: string;
  };

  awsConfig?: {
    region: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    sessionToken?: string;
  };

  envConfig?: {
    prefix?: string;
    allowProduction: boolean;
  };
}

// ============================================================================
// Secrets Manager
// ============================================================================

/**
 * Centralized secrets management
 *
 * Features:
 * - Multiple backend support
 * - Automatic caching with TTL
 * - Secret rotation
 * - Audit logging
 * - Type-safe access
 * - Graceful degradation
 *
 * Usage:
 * ```typescript
 * const secretsManager = new SecretsManager(config);
 * await secretsManager.initialize();
 *
 * const jwtSecret = await secretsManager.getSecret('marcus/platform/jwt-secret');
 * const dbPassword = await secretsManager.getSecret('marcus/platform/db/password');
 * ```
 */
export class SecretsManager extends EventEmitter {
  private backend: ISecretsBackend;
  private config: SecretsManagerConfig;
  private cache: Map<string, CacheEntry>;
  private rotationTimer?: NodeJS.Timeout;
  private initialized: boolean = false;

  constructor(backend: ISecretsBackend, config: SecretsManagerConfig) {
    super();
    this.backend = backend;
    this.config = config;
    this.cache = new Map();
  }

  /**
   * Initialize secrets manager
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('⚠️ SecretsManager already initialized');
      return;
    }

    try {
      // Initialize backend
      await this.backend.initialize();
      console.log(`✅ SecretsManager initialized with backend: ${this.backend.name}`);

      // Start rotation monitoring if enabled
      if (this.config.rotation.enabled) {
        this.startRotationMonitoring();
      }

      this.initialized = true;
      this.emit('initialized', { backend: this.backend.name });

    } catch (err) {
      const error = err as Error;
      console.error(`❌ SecretsManager initialization failed: ${error.message}`);
      throw new Error(`Failed to initialize secrets manager: ${error.message}`);
    }
  }

  /**
   * Get secret by path
   *
   * @param path Secret path (e.g., 'marcus/platform/jwt-secret')
   * @param bypassCache Force fresh fetch
   */
  async getSecret(path: string, bypassCache: boolean = false): Promise<string> {
    this.assertInitialized();

    // Check cache first (if enabled and not bypassed)
    if (this.config.cache.enabled && !bypassCache) {
      const cached = this.getCachedSecret(path);
      if (cached) {
        if (this.config.audit.logSecretAccess) {
          console.log(`🔐 Secret accessed from cache: ${path}`);
        }
        return cached.value;
      }
    }

    // Fetch from backend
    try {
      const secret = await this.backend.getSecret(path);

      // Cache if enabled
      if (this.config.cache.enabled) {
        this.cacheSecret(path, secret);
      }

      // Audit log
      if (this.config.audit.logSecretAccess) {
        console.log(`🔐 Secret fetched: ${path}`);
      }

      this.emit('secret_accessed', { path, cached: false });
      return secret.value;

    } catch (err) {
      const error = err as Error;
      console.error(`❌ Failed to get secret ${path}: ${error.message}`);
      throw new Error(`Failed to get secret ${path}: ${error.message}`);
    }
  }

  /**
   * Set secret (for rotation or updates)
   */
  async setSecret(path: string, value: string, metadata?: Partial<SecretMetadata>): Promise<void> {
    this.assertInitialized();

    try {
      await this.backend.setSecret(path, value, metadata);

      // Invalidate cache
      this.cache.delete(path);

      // Audit log
      if (this.config.audit.enabled) {
        console.log(`🔐 Secret updated: ${path}`);
      }

      this.emit('secret_updated', { path });

    } catch (err) {
      const error = err as Error;
      console.error(`❌ Failed to set secret ${path}: ${error.message}`);
      throw new Error(`Failed to set secret ${path}: ${error.message}`);
    }
  }

  /**
   * Rotate secret
   *
   * @param path Secret path
   * @param generator Function to generate new secret value
   */
  async rotateSecret(path: string, generator: () => string | Promise<string>): Promise<RotationResult> {
    this.assertInitialized();

    try {
      // Get current secret for versioning
      const currentSecret = await this.backend.getSecret(path);
      const oldVersion = currentSecret.metadata.version || 1;

      // Generate new value
      const newValue = await generator();

      // Set new secret
      await this.backend.setSecret(path, newValue, {
        version: oldVersion + 1,
        rotatedAt: new Date(),
        rotationSchedule: this.config.rotation.defaultSchedule,
      });

      // Invalidate cache
      this.cache.delete(path);

      // Audit log
      if (this.config.audit.logRotations) {
        console.log(`🔄 Secret rotated: ${path} (v${oldVersion} → v${oldVersion + 1})`);
      }

      this.emit('secret_rotated', { path, oldVersion, newVersion: oldVersion + 1 });

      return {
        success: true,
        oldVersion,
        newVersion: oldVersion + 1,
      };

    } catch (err) {
      const error = err as Error;
      console.error(`❌ Secret rotation failed for ${path}: ${error.message}`);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete secret
   */
  async deleteSecret(path: string): Promise<void> {
    this.assertInitialized();

    try {
      await this.backend.deleteSecret(path);
      this.cache.delete(path);

      console.log(`🗑️ Secret deleted: ${path}`);
      this.emit('secret_deleted', { path });

    } catch (err) {
      const error = err as Error;
      throw new Error(`Failed to delete secret ${path}: ${error.message}`);
    }
  }

  /**
   * List secrets at path
   */
  async listSecrets(path: string): Promise<string[]> {
    this.assertInitialized();
    return this.backend.listSecrets(path);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<BackendHealth> {
    return this.backend.healthCheck();
  }

  /**
   * Get secret from cache (if valid)
   */
  private getCachedSecret(path: string): Secret | null {
    const entry = this.cache.get(path);
    if (!entry) {
      return null;
    }

    // Check if expired
    const age = (Date.now() - entry.fetchedAt.getTime()) / 1000;
    if (age > entry.ttl) {
      this.cache.delete(path);
      return null;
    }

    return entry.secret;
  }

  /**
   * Cache secret
   */
  private cacheSecret(path: string, secret: Secret): void {
    // Check cache size limit
    if (this.cache.size >= this.config.cache.maxSize) {
      // Evict oldest entry (LRU)
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(path, {
      secret,
      fetchedAt: new Date(),
      ttl: this.config.cache.defaultTTL,
    });
  }

  /**
   * Start rotation monitoring
   */
  private startRotationMonitoring(): void {
    this.rotationTimer = setInterval(
      () => this.checkRotationSchedules(),
      this.config.rotation.checkInterval * 1000
    );

    console.log(`🔄 Secret rotation monitoring started (check every ${this.config.rotation.checkInterval}s)`);
  }

  /**
   * Check rotation schedules
   */
  private async checkRotationSchedules(): Promise<void> {
    // Emit event for external rotation handlers
    this.emit('rotation_check');

    // Note: Actual rotation logic depends on backend capabilities
    // Vault and AWS Secrets Manager support automatic rotation
    // This is a hook for custom rotation logic
  }

  /**
   * Assert manager is initialized
   */
  private assertInitialized(): void {
    if (!this.initialized) {
      throw new Error(
        '❌ CRITICAL: SecretsManager not initialized. Call initialize() first.'
      );
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Secret cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number; hitRate?: number } {
    return {
      size: this.cache.size,
      maxSize: this.config.cache.maxSize,
    };
  }

  /**
   * Close secrets manager
   */
  async close(): Promise<void> {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
    }

    await this.backend.close();
    this.cache.clear();
    this.initialized = false;

    console.log('✅ SecretsManager closed');
  }
}

// ============================================================================
// Secret Scrubbing Utilities
// ============================================================================

/**
 * Redact secrets from strings (for logging/error messages)
 */
export function redactSecret(text: string, secretPatterns: string[] = []): string {
  let redacted = text;

  // Default patterns
  const defaultPatterns = [
    /password["\s:=]+([^\s"',}]+)/gi,
    /secret["\s:=]+([^\s"',}]+)/gi,
    /token["\s:=]+([^\s"',}]+)/gi,
    /api[_-]?key["\s:=]+([^\s"',}]+)/gi,
    /bearer\s+([^\s"',}]+)/gi,
  ];

  // Custom patterns
  const customPatterns = secretPatterns.map(p => new RegExp(p, 'gi'));

  const allPatterns = [...defaultPatterns, ...customPatterns];

  for (const pattern of allPatterns) {
    redacted = redacted.replace(pattern, (match, secret) => {
      if (secret && secret.length > 4) {
        return match.replace(secret, `${secret.substring(0, 2)}***${secret.substring(secret.length - 2)}`);
      }
      return match.replace(secret, '***');
    });
  }

  return redacted;
}

/**
 * Scrub secrets from object (for logging)
 */
export function scrubSecrets<T>(obj: T, secretKeys: string[] = []): T {
  const defaultSecretKeys = [
    'password',
    'secret',
    'token',
    'api_key',
    'apiKey',
    'accessToken',
    'refreshToken',
    'privateKey',
    'passphrase',
  ];

  const allSecretKeys = [...defaultSecretKeys, ...secretKeys];

  const scrub = (value: any, isSecret: boolean = false): any => {
    if (value === null || value === undefined) {
      return value;
    }

    // Only redact strings if marked as secret
    if (typeof value === 'string' && isSecret) {
      return '***REDACTED***';
    }

    if (typeof value === 'string' && !isSecret) {
      return value; // Keep non-secret strings
    }

    if (Array.isArray(value)) {
      return value.map(v => scrub(v, isSecret));
    }

    if (typeof value === 'object') {
      const scrubbed: any = {};
      for (const [key, val] of Object.entries(value)) {
        // Check if this key is a secret key
        const keyIsSecret = allSecretKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()));

        if (keyIsSecret) {
          scrubbed[key] = '***REDACTED***';
        } else {
          scrubbed[key] = scrub(val, false);
        }
      }
      return scrubbed;
    }

    return value;
  };

  return scrub(obj, false);
}
