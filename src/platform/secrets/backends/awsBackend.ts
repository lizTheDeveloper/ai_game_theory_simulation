/**
 * MARCUS 3.0 Citation Integrity Platform
 * AWS Secrets Manager Backend
 *
 * Features:
 * - IAM role-based authentication
 * - Automatic rotation support
 * - Cross-region replication
 * - Version management
 * - Resource tagging
 *
 * @module awsBackend
 * @author Marcus (Platform Engineer)
 */

import {
  SecretsManagerClient,
  GetSecretValueCommand,
  PutSecretValueCommand,
  DeleteSecretCommand,
  ListSecretsCommand,
  DescribeSecretCommand,
  CreateSecretCommand,
  UpdateSecretCommand,
  Tag,
} from '@aws-sdk/client-secrets-manager';
import { ISecretsBackend, Secret, SecretMetadata, BackendHealth } from '../secretsManager';

// ============================================================================
// Types
// ============================================================================

export interface AWSSecretsConfig {
  region: string;
  accessKeyId?: string; // Optional - use IAM role if not provided
  secretAccessKey?: string;
  sessionToken?: string;
  endpoint?: string; // Custom endpoint (LocalStack, etc.)
  timeout?: number; // Request timeout (ms)
}

// ============================================================================
// AWS Secrets Manager Backend
// ============================================================================

/**
 * AWS Secrets Manager backend
 *
 * Authentication methods:
 * 1. IAM Role (recommended for production)
 * 2. Access keys (development/testing)
 *
 * Usage:
 * ```typescript
 * const aws = new AWSSecretsBackend({
 *   region: 'us-east-1',
 *   // Credentials auto-discovered from IAM role/env vars
 * });
 *
 * await aws.initialize();
 * const secret = await aws.getSecret('marcus/platform/jwt-secret');
 * ```
 */
export class AWSSecretsBackend implements ISecretsBackend {
  readonly name = 'aws-secrets-manager';
  private config: AWSSecretsConfig;
  private client: SecretsManagerClient;

  constructor(config: AWSSecretsConfig) {
    this.config = {
      timeout: 5000,
      ...config,
    };

    // Create AWS Secrets Manager client
    this.client = new SecretsManagerClient({
      region: this.config.region,
      credentials: this.config.accessKeyId
        ? {
            accessKeyId: this.config.accessKeyId,
            secretAccessKey: this.config.secretAccessKey!,
            sessionToken: this.config.sessionToken,
          }
        : undefined, // Use default credential provider chain (IAM role)
      endpoint: this.config.endpoint,
      requestHandler: {
        requestTimeout: this.config.timeout,
      } as any,
    });
  }

  /**
   * Initialize AWS Secrets Manager connection
   */
  async initialize(): Promise<void> {
    try {
      // Verify credentials by listing secrets (with limit 1)
      await this.client.send(
        new ListSecretsCommand({
          MaxResults: 1,
        })
      );

      console.log(`✅ AWS Secrets Manager backend initialized (region: ${this.config.region})`);

    } catch (err) {
      const error = err as Error;
      throw new Error(`AWS Secrets Manager initialization failed: ${error.message}`);
    }
  }

  /**
   * Get secret from AWS Secrets Manager
   *
   * @param path Secret name/ARN
   */
  async getSecret(path: string): Promise<Secret> {
    try {
      const command = new GetSecretValueCommand({
        SecretId: path,
      });

      const response = await this.client.send(command);

      if (!response.SecretString) {
        throw new Error(`Secret ${path} has no string value (binary secrets not supported)`);
      }

      // Parse secret metadata
      const metadata: SecretMetadata = {
        path,
        version: response.VersionId ? parseInt(response.VersionId) : undefined,
        createdAt: response.CreatedDate,
      };

      // Check if secret is JSON (AWS Secrets Manager often stores as JSON)
      let value: string;
      try {
        const parsed = JSON.parse(response.SecretString);
        // Extract 'value' or 'secret' key, or use first value
        value = parsed.value || parsed.secret || Object.values(parsed)[0] as string;
      } catch {
        // Not JSON, use raw string
        value = response.SecretString;
      }

      return {
        value,
        metadata,
      };

    } catch (err) {
      const error = err as any;

      if (error.name === 'ResourceNotFoundException') {
        throw new Error(`Secret not found: ${path}`);
      }

      throw new Error(`Failed to get secret ${path}: ${error.message}`);
    }
  }

  /**
   * Set secret in AWS Secrets Manager
   */
  async setSecret(path: string, value: string, metadata?: Partial<SecretMetadata>): Promise<void> {
    try {
      // Check if secret exists
      let secretExists = false;
      try {
        await this.client.send(
          new DescribeSecretCommand({
            SecretId: path,
          })
        );
        secretExists = true;
      } catch (err) {
        // Secret doesn't exist
      }

      // Prepare secret value (store as JSON with metadata)
      const secretData: Record<string, any> = { value };
      if (metadata?.rotatedAt) {
        secretData.rotated_at = metadata.rotatedAt.toISOString();
      }
      if (metadata?.expiresAt) {
        secretData.expires_at = metadata.expiresAt.toISOString();
      }
      if (metadata?.rotationSchedule) {
        secretData.rotation_schedule = metadata.rotationSchedule;
      }

      const secretString = JSON.stringify(secretData);

      if (secretExists) {
        // Update existing secret
        await this.client.send(
          new PutSecretValueCommand({
            SecretId: path,
            SecretString: secretString,
          })
        );
      } else {
        // Create new secret
        const tags: Tag[] = [
          { Key: 'managed-by', Value: 'marcus-secrets-manager' },
          { Key: 'created-at', Value: new Date().toISOString() },
        ];

        await this.client.send(
          new CreateSecretCommand({
            Name: path,
            SecretString: secretString,
            Tags: tags,
          })
        );
      }

      console.log(`✅ AWS: Secret ${secretExists ? 'updated' : 'created'} at ${path}`);

    } catch (err) {
      const error = err as Error;
      throw new Error(`Failed to set secret ${path}: ${error.message}`);
    }
  }

  /**
   * Delete secret from AWS Secrets Manager
   */
  async deleteSecret(path: string): Promise<void> {
    try {
      // AWS Secrets Manager requires a recovery window (7-30 days)
      // Use ForceDeleteWithoutRecovery for immediate deletion (dangerous!)
      await this.client.send(
        new DeleteSecretCommand({
          SecretId: path,
          RecoveryWindowInDays: 7, // Safe default
          // ForceDeleteWithoutRecovery: true, // Uncomment for immediate deletion
        })
      );

      console.log(`✅ AWS: Secret ${path} scheduled for deletion (7 day recovery window)`);

    } catch (err) {
      const error = err as any;

      if (error.name === 'ResourceNotFoundException') {
        console.warn(`⚠️ Secret ${path} not found (already deleted?)`);
        return;
      }

      throw new Error(`Failed to delete secret ${path}: ${error.message}`);
    }
  }

  /**
   * List secrets (filter by path prefix)
   */
  async listSecrets(pathPrefix: string): Promise<string[]> {
    try {
      const secrets: string[] = [];
      let nextToken: string | undefined;

      do {
        const command = new ListSecretsCommand({
          MaxResults: 100,
          NextToken: nextToken,
        });

        const response = await this.client.send(command);

        if (response.SecretList) {
          for (const secret of response.SecretList) {
            if (secret.Name && secret.Name.startsWith(pathPrefix)) {
              secrets.push(secret.Name);
            }
          }
        }

        nextToken = response.NextToken;
      } while (nextToken);

      return secrets;

    } catch (err) {
      const error = err as Error;
      throw new Error(`Failed to list secrets with prefix ${pathPrefix}: ${error.message}`);
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<BackendHealth> {
    const start = Date.now();

    try {
      // List secrets to verify connectivity
      await this.client.send(
        new ListSecretsCommand({
          MaxResults: 1,
        })
      );

      const latency = Date.now() - start;

      return {
        healthy: true,
        backend: 'aws-secrets-manager',
        latency,
      };

    } catch (err) {
      const error = err as Error;
      const latency = Date.now() - start;

      return {
        healthy: false,
        backend: 'aws-secrets-manager',
        latency,
        error: error.message,
      };
    }
  }

  /**
   * Close AWS Secrets Manager connection
   */
  async close(): Promise<void> {
    this.client.destroy();
    console.log('✅ AWS Secrets Manager client closed');
  }
}
