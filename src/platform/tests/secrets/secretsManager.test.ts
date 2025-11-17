/**
 * MARCUS 3.0 Citation Integrity Platform
 * Secrets Manager Tests
 *
 * @author Marcus (Platform Engineer)
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { SecretsManager, ISecretsBackend, Secret, BackendHealth, redactSecret, scrubSecrets } from '../../secrets/secretsManager';

// ============================================================================
// Mock Backend
// ============================================================================

class MockBackend implements ISecretsBackend {
  readonly name = 'mock';
  private secrets: Map<string, Secret> = new Map();
  public initializeCalled = false;
  public closeCalled = false;

  async initialize(): Promise<void> {
    this.initializeCalled = true;
  }

  async getSecret(path: string): Promise<Secret> {
    const secret = this.secrets.get(path);
    if (!secret) {
      throw new Error(`Secret not found: ${path}`);
    }
    return secret;
  }

  async setSecret(path: string, value: string): Promise<void> {
    this.secrets.set(path, {
      value,
      metadata: { path, createdAt: new Date() },
    });
  }

  async deleteSecret(path: string): Promise<void> {
    this.secrets.delete(path);
  }

  async listSecrets(path: string): Promise<string[]> {
    return Array.from(this.secrets.keys()).filter(k => k.startsWith(path));
  }

  async healthCheck(): Promise<BackendHealth> {
    return { healthy: true, backend: 'mock', latency: 0 };
  }

  async close(): Promise<void> {
    this.closeCalled = true;
  }
}

// ============================================================================
// Tests
// ============================================================================

describe('SecretsManager', () => {
  let backend: MockBackend;
  let secretsManager: SecretsManager;

  beforeEach(() => {
    backend = new MockBackend();
    secretsManager = new SecretsManager(backend, {
      backend: 'env',
      cache: { enabled: true, defaultTTL: 60, maxSize: 10 },
      rotation: { enabled: false, checkInterval: 0, defaultSchedule: 0 },
      audit: { enabled: false, logSecretAccess: false, logRotations: false },
    });
  });

  it('should initialize backend', async () => {
    await secretsManager.initialize();
    assert.strictEqual(backend.initializeCalled, true);
  });

  it('should throw if not initialized before use', async () => {
    await assert.rejects(
      () => secretsManager.getSecret('test'),
      /SecretsManager not initialized/
    );
  });

  it('should fetch secret from backend', async () => {
    await secretsManager.initialize();
    await backend.setSecret('test/secret', 'secret-value');

    const value = await secretsManager.getSecret('test/secret');
    assert.strictEqual(value, 'secret-value');
  });

  it('should cache secret after first fetch', async () => {
    await secretsManager.initialize();
    await backend.setSecret('test/secret', 'secret-value');

    // First fetch
    await secretsManager.getSecret('test/secret');

    // Delete from backend to test cache
    await backend.deleteSecret('test/secret');

    // Should still work from cache
    const value = await secretsManager.getSecret('test/secret');
    assert.strictEqual(value, 'secret-value');
  });

  it('should bypass cache when requested', async () => {
    await secretsManager.initialize();
    await backend.setSecret('test/secret', 'secret-value');

    // First fetch (cache it)
    await secretsManager.getSecret('test/secret');

    // Update in backend
    await backend.setSecret('test/secret', 'new-value');

    // Bypass cache should get new value
    const value = await secretsManager.getSecret('test/secret', true);
    assert.strictEqual(value, 'new-value');
  });

  it('should set secret in backend', async () => {
    await secretsManager.initialize();
    await secretsManager.setSecret('test/new', 'new-value');

    const value = await secretsManager.getSecret('test/new');
    assert.strictEqual(value, 'new-value');
  });

  it('should rotate secret successfully', async () => {
    await secretsManager.initialize();
    await backend.setSecret('test/rotate', 'old-value');

    const result = await secretsManager.rotateSecret('test/rotate', () => 'new-value');

    assert.strictEqual(result.success, true);
    assert.ok(result.newVersion);
    assert.ok(result.oldVersion);
    assert.ok(result.newVersion! > result.oldVersion!);

    const value = await secretsManager.getSecret('test/rotate', true);
    assert.strictEqual(value, 'new-value');
  });

  it('should delete secret from backend', async () => {
    await secretsManager.initialize();
    await secretsManager.setSecret('test/delete', 'value');
    await secretsManager.deleteSecret('test/delete');

    await assert.rejects(
      () => secretsManager.getSecret('test/delete'),
      /Secret not found/
    );
  });

  it('should return health status', async () => {
    await secretsManager.initialize();
    const health = await secretsManager.healthCheck();

    assert.strictEqual(health.healthy, true);
    assert.strictEqual(health.backend, 'mock');
  });

  it('should close backend and clear cache', async () => {
    await secretsManager.initialize();
    await backend.setSecret('test/cached', 'value');
    await secretsManager.getSecret('test/cached');

    await secretsManager.close();

    assert.strictEqual(backend.closeCalled, true);
    const stats = secretsManager.getCacheStats();
    assert.strictEqual(stats.size, 0);
  });
});

// ============================================================================
// Secret Scrubbing Tests
// ============================================================================

describe('Secret Scrubbing', () => {
  it('should redact password patterns', () => {
    const text = 'password=secret123';
    const redacted = redactSecret(text);
    assert.ok(redacted.includes('***'));
    assert.ok(!redacted.includes('secret123'));
  });

  it('should redact bearer tokens', () => {
    const text = 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs';
    const redacted = redactSecret(text);
    assert.ok(redacted.includes('***'));
  });

  it('should scrub password fields', () => {
    const obj = {
      email: 'user@example.com',
      password: 'secret123',
    };

    const scrubbed = scrubSecrets(obj);
    assert.strictEqual(scrubbed.email, 'user@example.com');
    assert.strictEqual(scrubbed.password, '***REDACTED***');
  });

  it('should scrub nested objects', () => {
    const obj = {
      user: {
        email: 'user@example.com',
        credentials: {
          password: 'secret',
          apiKey: 'abc123',
        },
      },
    };

    const scrubbed = scrubSecrets(obj);
    assert.strictEqual(scrubbed.user.credentials.password, '***REDACTED***');
    assert.strictEqual(scrubbed.user.credentials.apiKey, '***REDACTED***');
  });
});
