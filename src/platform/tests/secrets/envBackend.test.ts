/**
 * MARCUS 3.0 Citation Integrity Platform
 * Environment Variable Backend Tests
 *
 * @author Marcus (Platform Engineer)
 */

import * as fs from 'fs';
import * as path from 'path';
import { EnvBackend } from '../../secrets/backends/envBackend';

describe('EnvBackend', () => {
  let backend: EnvBackend;
  const testEnvFile = path.join(__dirname, '.env.test.secrets');

  beforeEach(() => {
    // Clear environment
    Object.keys(process.env)
      .filter(k => k.startsWith('TEST_SECRET_'))
      .forEach(k => delete process.env[k]);

    // Clean up test file
    if (fs.existsSync(testEnvFile)) {
      fs.unlinkSync(testEnvFile);
    }
  });

  afterEach(async () => {
    if (backend) {
      await backend.close();
    }

    if (fs.existsSync(testEnvFile)) {
      fs.unlinkSync(testEnvFile);
    }
  });

  describe('initialization', () => {
    it('should initialize in development environment', async () => {
      process.env.NODE_ENV = 'development';

      backend = new EnvBackend({
        prefix: 'TEST_SECRET_',
        allowProduction: false,
      });

      await expect(backend.initialize()).resolves.not.toThrow();
    });

    it('should fail in production environment by default', async () => {
      process.env.NODE_ENV = 'production';

      backend = new EnvBackend({
        prefix: 'TEST_SECRET_',
        allowProduction: false,
      });

      await expect(backend.initialize()).rejects.toThrow(
        'Environment variable backend is NOT safe for production'
      );
    });

    it('should allow production if explicitly configured', async () => {
      process.env.NODE_ENV = 'production';

      backend = new EnvBackend({
        prefix: 'TEST_SECRET_',
        allowProduction: true,
      });

      await expect(backend.initialize()).resolves.not.toThrow();
    });

    it('should load secrets from .env file', async () => {
      // Create test .env file
      fs.writeFileSync(
        testEnvFile,
        [
          '# Test secrets',
          'TEST_SECRET_KEY1=value1',
          'TEST_SECRET_KEY2=value2',
          '',
          '# Comment',
          'TEST_SECRET_KEY3=value3',
        ].join('\n')
      );

      backend = new EnvBackend({
        prefix: 'TEST_SECRET_',
        envFile: testEnvFile,
        allowProduction: false,
        validateSecrets: false,
      });

      await backend.initialize();

      const secret1 = await backend.getSecret('key1');
      expect(secret1.value).toBe('value1');

      const secret2 = await backend.getSecret('key2');
      expect(secret2.value).toBe('value2');

      const secret3 = await backend.getSecret('key3');
      expect(secret3.value).toBe('value3');
    });

    it('should load secrets from environment variables', async () => {
      process.env.TEST_SECRET_ENV_KEY = 'env-value';

      backend = new EnvBackend({
        prefix: 'TEST_SECRET_',
        allowProduction: false,
        validateSecrets: false,
      });

      await backend.initialize();

      const secret = await backend.getSecret('env_key');
      expect(secret.value).toBe('env-value');
    });

    it('should prioritize environment variables over .env file', async () => {
      // .env file value
      fs.writeFileSync(testEnvFile, 'TEST_SECRET_PRIORITY=file-value');

      // Environment variable
      process.env.TEST_SECRET_PRIORITY = 'env-value';

      backend = new EnvBackend({
        prefix: 'TEST_SECRET_',
        envFile: testEnvFile,
        allowProduction: false,
        validateSecrets: false,
      });

      await backend.initialize();

      const secret = await backend.getSecret('priority');
      expect(secret.value).toBe('env-value');
    });
  });

  describe('path normalization', () => {
    beforeEach(async () => {
      process.env.TEST_SECRET_MARCUS_PLATFORM_JWT_SECRET = 'jwt-value';

      backend = new EnvBackend({
        prefix: 'TEST_SECRET_',
        allowProduction: false,
        validateSecrets: false,
      });

      await backend.initialize();
    });

    it('should convert path to environment variable format', async () => {
      const secret = await backend.getSecret('marcus/platform/jwt-secret');
      expect(secret.value).toBe('jwt-value');
    });

    it('should convert underscores and slashes', async () => {
      const secret = await backend.getSecret('marcus_platform_jwt_secret');
      expect(secret.value).toBe('jwt-value');
    });
  });

  describe('getSecret', () => {
    beforeEach(async () => {
      process.env.TEST_SECRET_VALID = 'valid-secret-value-12345678901234567890';

      backend = new EnvBackend({
        prefix: 'TEST_SECRET_',
        allowProduction: false,
        validateSecrets: false,
      });

      await backend.initialize();
    });

    it('should return secret value', async () => {
      const secret = await backend.getSecret('valid');
      expect(secret.value).toBe('valid-secret-value-12345678901234567890');
      expect(secret.metadata.path).toBe('valid');
    });

    it('should throw for non-existent secret', async () => {
      await expect(backend.getSecret('nonexistent')).rejects.toThrow(
        'Secret not found: nonexistent'
      );
    });
  });

  describe('setSecret', () => {
    beforeEach(async () => {
      backend = new EnvBackend({
        prefix: 'TEST_SECRET_',
        allowProduction: false,
        validateSecrets: false,
      });

      await backend.initialize();
    });

    it('should set secret in memory', async () => {
      await backend.setSecret('new-key', 'new-value');

      const secret = await backend.getSecret('new-key');
      expect(secret.value).toBe('new-value');
    });

    it('should warn about in-memory only storage', async () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation();

      await backend.setSecret('new-key', 'new-value');

      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('updated in-memory only')
      );

      spy.mockRestore();
    });

    it('should update existing secret', async () => {
      process.env.TEST_SECRET_EXISTING = 'old-value';
      await backend.initialize();

      await backend.setSecret('existing', 'new-value');

      const secret = await backend.getSecret('existing');
      expect(secret.value).toBe('new-value');
    });
  });

  describe('deleteSecret', () => {
    beforeEach(async () => {
      process.env.TEST_SECRET_DELETE_ME = 'value';

      backend = new EnvBackend({
        prefix: 'TEST_SECRET_',
        allowProduction: false,
        validateSecrets: false,
      });

      await backend.initialize();
    });

    it('should delete secret from memory', async () => {
      await backend.deleteSecret('delete_me');

      await expect(backend.getSecret('delete_me')).rejects.toThrow(
        'Secret not found'
      );
    });

    it('should warn about in-memory only deletion', async () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation();

      await backend.deleteSecret('delete_me');

      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('deleted from memory')
      );

      spy.mockRestore();
    });
  });

  describe('listSecrets', () => {
    beforeEach(async () => {
      process.env.TEST_SECRET_MARCUS_PLATFORM_JWT_SECRET = 'jwt';
      process.env.TEST_SECRET_MARCUS_PLATFORM_DB_PASSWORD = 'dbpass';
      process.env.TEST_SECRET_MARCUS_REDIS_PASSWORD = 'redispass';

      backend = new EnvBackend({
        prefix: 'TEST_SECRET_',
        allowProduction: false,
        validateSecrets: false,
      });

      await backend.initialize();
    });

    it('should list secrets with prefix', async () => {
      const secrets = await backend.listSecrets('marcus/platform');
      expect(secrets).toHaveLength(2);
      expect(secrets).toContain('marcus/platform/jwt/secret');
      expect(secrets).toContain('marcus/platform/db/password');
    });

    it('should return empty array for non-matching prefix', async () => {
      const secrets = await backend.listSecrets('nonexistent');
      expect(secrets).toHaveLength(0);
    });
  });

  describe('secret validation', () => {
    it('should warn about short secrets', async () => {
      process.env.TEST_SECRET_SHORT = 'short'; // Less than 16 chars

      const spy = jest.spyOn(console, 'warn').mockImplementation();

      backend = new EnvBackend({
        prefix: 'TEST_SECRET_',
        allowProduction: false,
        validateSecrets: true,
      });

      await backend.initialize();

      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('validation warnings')
      );
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('too short')
      );

      spy.mockRestore();
    });

    it('should warn about weak patterns', async () => {
      process.env.TEST_SECRET_WEAK = 'password123password'; // Contains "password"

      const spy = jest.spyOn(console, 'warn').mockImplementation();

      backend = new EnvBackend({
        prefix: 'TEST_SECRET_',
        allowProduction: false,
        validateSecrets: true,
      });

      await backend.initialize();

      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('weak pattern')
      );

      spy.mockRestore();
    });

    it('should warn about low entropy', async () => {
      process.env.TEST_SECRET_LOWENT = 'aaaaaaaaaaaaaaaa'; // Low entropy

      const spy = jest.spyOn(console, 'warn').mockImplementation();

      backend = new EnvBackend({
        prefix: 'TEST_SECRET_',
        allowProduction: false,
        validateSecrets: true,
      });

      await backend.initialize();

      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('low entropy')
      );

      spy.mockRestore();
    });

    it('should not warn for strong secrets', async () => {
      process.env.TEST_SECRET_STRONG = 'ab7d9f2e4c6a1b8f3e5d7c9a2b4f6e8d'; // 32-char hex

      const spy = jest.spyOn(console, 'warn').mockImplementation();

      backend = new EnvBackend({
        prefix: 'TEST_SECRET_',
        allowProduction: false,
        validateSecrets: true,
      });

      await backend.initialize();

      // Should not have validation warnings
      const calls = spy.mock.calls.map(c => c[0]);
      const hasValidationWarnings = calls.some(c =>
        typeof c === 'string' && c.includes('validation warnings')
      );

      expect(hasValidationWarnings).toBe(false);

      spy.mockRestore();
    });
  });

  describe('exportToEnvFile', () => {
    beforeEach(async () => {
      process.env.TEST_SECRET_KEY1 = 'value1';
      process.env.TEST_SECRET_KEY2 = 'value2';

      backend = new EnvBackend({
        prefix: 'TEST_SECRET_',
        allowProduction: false,
        validateSecrets: false,
      });

      await backend.initialize();
    });

    it('should export secrets to .env file', async () => {
      await backend.exportToEnvFile(testEnvFile);

      expect(fs.existsSync(testEnvFile)).toBe(true);

      const content = fs.readFileSync(testEnvFile, 'utf-8');
      expect(content).toContain('TEST_SECRET_KEY1=value1');
      expect(content).toContain('TEST_SECRET_KEY2=value2');
    });
  });

  describe('healthCheck', () => {
    beforeEach(async () => {
      backend = new EnvBackend({
        prefix: 'TEST_SECRET_',
        allowProduction: false,
        validateSecrets: false,
      });

      await backend.initialize();
    });

    it('should always return healthy', async () => {
      const health = await backend.healthCheck();
      expect(health.healthy).toBe(true);
      expect(health.backend).toBe('environment-variables');
      expect(health.latency).toBe(0);
    });
  });
});
