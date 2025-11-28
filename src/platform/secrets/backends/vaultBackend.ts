/**
 * MARCUS 3.0 Citation Integrity Platform
 * HashiCorp Vault Backend for Secrets Management
 *
 * Features:
 * - KV v2 engine support
 * - AppRole authentication
 * - Secret versioning
 * - Dynamic database credentials
 * - Lease management
 *
 * @module vaultBackend
 * @author Marcus (Platform Engineer)
 */

import axios, { AxiosInstance } from 'axios';
import { ISecretsBackend, Secret, SecretMetadata, BackendHealth } from '../secretsManager';

// ============================================================================
// Types
// ============================================================================

export interface VaultConfig {
  address: string;
  token?: string; // Root token (dev only)
  roleId?: string; // AppRole role ID
  secretId?: string; // AppRole secret ID
  namespace?: string; // Vault namespace (enterprise)
  mountPath: string; // KV v2 mount path (e.g., 'secret')
  timeout?: number; // Request timeout (ms)
}

interface VaultAuthResponse {
  auth: {
    client_token: string;
    accessor: string;
    policies: string[];
    lease_duration: number;
    renewable: boolean;
  };
}

interface VaultKVResponse {
  data: {
    data: Record<string, string>;
    metadata: {
      created_time: string;
      deletion_time: string;
      destroyed: boolean;
      version: number;
    };
  };
}

interface VaultListResponse {
  data: {
    keys: string[];
  };
}

// ============================================================================
// Vault Backend
// ============================================================================

/**
 * HashiCorp Vault secrets backend
 *
 * Authentication methods:
 * 1. Root token (development only)
 * 2. AppRole (production recommended)
 *
 * Usage:
 * ```typescript
 * const vault = new VaultBackend({
 *   address: 'https://vault.example.com:8200',
 *   roleId: process.env.VAULT_ROLE_ID,
 *   secretId: process.env.VAULT_SECRET_ID,
 *   mountPath: 'secret',
 * });
 *
 * await vault.initialize();
 * const secret = await vault.getSecret('marcus/platform/jwt-secret');
 * ```
 */
export class VaultBackend implements ISecretsBackend {
  readonly name = 'vault';
  private config: VaultConfig;
  private client: AxiosInstance;
  private token?: string;
  private tokenExpiry?: Date;

  constructor(config: VaultConfig) {
    this.config = {
      timeout: 5000,
      ...config,
    };

    // Create axios client
    this.client = axios.create({
      baseURL: this.config.address,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add namespace header if configured (Vault Enterprise)
    if (this.config.namespace) {
      this.client.defaults.headers.common['X-Vault-Namespace'] = this.config.namespace;
    }
  }

  /**
   * Initialize Vault connection and authenticate
   */
  async initialize(): Promise<void> {
    try {
      // Use provided token or authenticate with AppRole
      if (this.config.token) {
        this.token = this.config.token;
        console.log('✅ Vault: Using provided token');
      } else if (this.config.roleId && this.config.secretId) {
        await this.authenticateAppRole();
      } else {
        throw new Error(
          'Vault authentication required: provide either token or (roleId + secretId)'
        );
      }

      // Verify token is valid
      await this.verifyToken();

      console.log(`✅ Vault backend initialized: ${this.config.address}`);

    } catch (err) {
      const error = err as Error;
      throw new Error(`Vault initialization failed: ${error.message}`);
    }
  }

  /**
   * Authenticate using AppRole
   */
  private async authenticateAppRole(): Promise<void> {
    try {
      const response = await this.client.post<VaultAuthResponse>('/v1/auth/approle/login', {
        role_id: this.config.roleId,
        secret_id: this.config.secretId,
      });

      this.token = response.data.auth.client_token;
      this.tokenExpiry = new Date(Date.now() + response.data.auth.lease_duration * 1000);

      console.log(
        `✅ Vault AppRole authentication successful (expires in ${response.data.auth.lease_duration}s)`
      );

    } catch (err) {
      const error = err as any;
      const message = error.response?.data?.errors?.join(', ') || error.message;
      throw new Error(`AppRole authentication failed: ${message}`);
    }
  }

  /**
   * Verify token is valid
   */
  private async verifyToken(): Promise<void> {
    try {
      await this.client.get('/v1/auth/token/lookup-self', {
        headers: { 'X-Vault-Token': this.token },
      });
    } catch (err) {
      throw new Error('Token verification failed - token may be invalid or expired');
    }
  }

  /**
   * Get secret from Vault KV v2
   *
   * @param path Secret path (e.g., 'marcus/platform/jwt-secret')
   */
  async getSecret(path: string): Promise<Secret> {
    this.assertAuthenticated();

    try {
      // KV v2 API: /v1/{mount}/data/{path}
      const apiPath = `/v1/${this.config.mountPath}/data/${path}`;

      const response = await this.client.get<VaultKVResponse>(apiPath, {
        headers: { 'X-Vault-Token': this.token },
      });

      const data = response.data.data.data;
      const metadata = response.data.data.metadata;

      // Extract value (support 'value' or 'secret' key)
      const value = data.value || data.secret || Object.values(data)[0];

      if (!value) {
        throw new Error(`No value found at ${path}`);
      }

      return {
        value,
        metadata: {
          path,
          version: metadata.version,
          createdAt: new Date(metadata.created_time),
        },
      };

    } catch (err) {
      const error = err as any;
      if (error.response?.status === 404) {
        throw new Error(`Secret not found: ${path}`);
      }

      const message = error.response?.data?.errors?.join(', ') || error.message;
      throw new Error(`Failed to get secret ${path}: ${message}`);
    }
  }

  /**
   * Set secret in Vault KV v2
   */
  async setSecret(path: string, value: string, metadata?: Partial<SecretMetadata>): Promise<void> {
    this.assertAuthenticated();

    try {
      // KV v2 API: /v1/{mount}/data/{path}
      const apiPath = `/v1/${this.config.mountPath}/data/${path}`;

      const data: Record<string, string> = { value };

      // Add metadata as additional keys
      if (metadata?.rotatedAt) {
        data.rotated_at = metadata.rotatedAt.toISOString();
      }
      if (metadata?.expiresAt) {
        data.expires_at = metadata.expiresAt.toISOString();
      }
      if (metadata?.rotationSchedule) {
        data.rotation_schedule = String(metadata.rotationSchedule);
      }

      await this.client.post(
        apiPath,
        { data },
        {
          headers: { 'X-Vault-Token': this.token },
        }
      );

      console.log(`✅ Vault: Secret set at ${path}`);

    } catch (err) {
      const error = err as any;
      const message = error.response?.data?.errors?.join(', ') || error.message;
      throw new Error(`Failed to set secret ${path}: ${message}`);
    }
  }

  /**
   * Delete secret from Vault KV v2
   */
  async deleteSecret(path: string): Promise<void> {
    this.assertAuthenticated();

    try {
      // KV v2 API: /v1/{mount}/metadata/{path} (deletes all versions)
      const apiPath = `/v1/${this.config.mountPath}/metadata/${path}`;

      await this.client.delete(apiPath, {
        headers: { 'X-Vault-Token': this.token },
      });

      console.log(`✅ Vault: Secret deleted at ${path}`);

    } catch (err) {
      const error = err as any;
      const message = error.response?.data?.errors?.join(', ') || error.message;
      throw new Error(`Failed to delete secret ${path}: ${message}`);
    }
  }

  /**
   * List secrets at path
   */
  async listSecrets(path: string): Promise<string[]> {
    this.assertAuthenticated();

    try {
      // KV v2 API: /v1/{mount}/metadata/{path}?list=true
      const apiPath = `/v1/${this.config.mountPath}/metadata/${path}`;

      const response = await this.client.request<VaultListResponse>({
        method: 'LIST',
        url: apiPath,
        headers: { 'X-Vault-Token': this.token },
      });

      return response.data.data.keys || [];

    } catch (err) {
      const error = err as any;
      if (error.response?.status === 404) {
        return []; // Path doesn't exist
      }

      const message = error.response?.data?.errors?.join(', ') || error.message;
      throw new Error(`Failed to list secrets at ${path}: ${message}`);
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<BackendHealth> {
    const start = Date.now();

    try {
      // Check Vault health endpoint
      const response = await this.client.get('/v1/sys/health');
      const latency = Date.now() - start;

      // Vault health endpoint returns:
      // - 200: initialized, unsealed, active
      // - 429: unsealed, standby
      // - 472: DR secondary, active
      // - 473: performance standby
      // - 501: not initialized
      // - 503: sealed

      const healthy = response.status === 200 || response.status === 429;

      return {
        healthy,
        backend: 'vault',
        latency,
      };

    } catch (err) {
      const error = err as any;
      const latency = Date.now() - start;

      return {
        healthy: false,
        backend: 'vault',
        latency,
        error: error.message,
      };
    }
  }

  /**
   * Assert authenticated
   */
  private assertAuthenticated(): void {
    if (!this.token) {
      throw new Error('❌ CRITICAL: Vault not authenticated. Call initialize() first.');
    }

    // Check token expiry (if known)
    if (this.tokenExpiry && this.tokenExpiry < new Date()) {
      throw new Error('❌ CRITICAL: Vault token expired. Re-authenticate required.');
    }
  }

  /**
   * Close Vault connection
   */
  async close(): Promise<void> {
    // Revoke token if using AppRole (not root token)
    if (this.token && this.config.roleId) {
      try {
        await this.client.post(
          '/v1/auth/token/revoke-self',
          {},
          {
            headers: { 'X-Vault-Token': this.token },
          }
        );
        console.log('✅ Vault token revoked');
      } catch (err) {
        console.warn('⚠️ Failed to revoke Vault token:', (err as Error).message);
      }
    }

    this.token = undefined;
    this.tokenExpiry = undefined;
  }
}
