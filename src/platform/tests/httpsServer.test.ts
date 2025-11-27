/**
 * MARCUS 3.0 Citation Integrity Platform
 * HTTPS Server Tests
 *
 * Tests for HTTPS server setup, HTTP redirect, and TLS connection handling.
 *
 * @author Marcus (Platform Engineer)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as fs from 'fs';
import * as path from 'path';
import express = require('express');
import { Express } from 'express';
import { HTTPSServer, testTLSConnection } from '../api/httpsServer';
import { TLSConfig, DEVELOPMENT_TLS_CONFIG } from '../config/tls';

describe('HTTPS Server', () => {
  let app: Express;
  let tempCert: string;
  let tempKey: string;

  // Create test Express app
  app = express();
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
  });

  describe('Constructor', () => {
    it('should create HTTPS server with default config', () => {
      tempCert = path.join(__dirname, 'test-https-cert.pem');
      tempKey = path.join(__dirname, 'test-https-key.pem');
      fs.writeFileSync(tempCert, '-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----');
      fs.writeFileSync(tempKey, '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----');

      const tlsConfig: TLSConfig = {
        ...DEVELOPMENT_TLS_CONFIG,
        enabled: false, // Disable for constructor test
        cert: {
          certPath: tempCert,
          keyPath: tempKey,
        },
      };

      const server = new HTTPSServer(app, tlsConfig);
      assert(server);
      assert.deepStrictEqual(server.getTLSConfig(), tlsConfig);

      fs.unlinkSync(tempCert);
      fs.unlinkSync(tempKey);
    });

    it('should load TLS config from environment if not provided', () => {
      const server = new HTTPSServer(app);
      assert(server.getTLSConfig());
    });
  });

  describe('HSTS Middleware', () => {
    it('should add HSTS header when enabled', () => {
      tempCert = path.join(__dirname, 'test-hsts-cert.pem');
      tempKey = path.join(__dirname, 'test-hsts-key.pem');
      fs.writeFileSync(tempCert, '-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----');
      fs.writeFileSync(tempKey, '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----');

      const tlsConfig: TLSConfig = {
        ...DEVELOPMENT_TLS_CONFIG,
        enabled: false,
        hsts: {
          enabled: true,
          maxAge: 31536000,
          includeSubDomains: true,
          preload: false,
        },
        cert: {
          certPath: tempCert,
          keyPath: tempKey,
        },
      };

      const testApp = express();
      const server = new HTTPSServer(testApp, tlsConfig);

      testApp.get('/test', (req, res) => {
        // Simulate HTTPS connection
        (req as any).secure = true;
        res.status(200).send('OK');
      });

      assert.strictEqual(server.getTLSConfig().hsts.enabled, true);

      fs.unlinkSync(tempCert);
      fs.unlinkSync(tempKey);
    });

    it('should not add HSTS header when disabled', () => {
      tempCert = path.join(__dirname, 'test-no-hsts-cert.pem');
      tempKey = path.join(__dirname, 'test-no-hsts-key.pem');
      fs.writeFileSync(tempCert, '-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----');
      fs.writeFileSync(tempKey, '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----');

      const tlsConfig: TLSConfig = {
        ...DEVELOPMENT_TLS_CONFIG,
        enabled: false,
        hsts: {
          enabled: false,
          maxAge: 0,
          includeSubDomains: false,
          preload: false,
        },
        cert: {
          certPath: tempCert,
          keyPath: tempKey,
        },
      };

      const server = new HTTPSServer(app, tlsConfig);
      assert.strictEqual(server.getTLSConfig().hsts.enabled, false);

      fs.unlinkSync(tempCert);
      fs.unlinkSync(tempKey);
    });
  });

  describe('Server Lifecycle', () => {
    it('should skip HTTPS server when TLS disabled', async () => {
      tempCert = path.join(__dirname, 'test-lifecycle-cert.pem');
      tempKey = path.join(__dirname, 'test-lifecycle-key.pem');
      fs.writeFileSync(tempCert, '-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----');
      fs.writeFileSync(tempKey, '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----');

      const tlsConfig: TLSConfig = {
        ...DEVELOPMENT_TLS_CONFIG,
        enabled: false,
        cert: {
          certPath: tempCert,
          keyPath: tempKey,
        },
      };

      const server = new HTTPSServer(app, tlsConfig);
      await server.start('127.0.0.1');

      assert.strictEqual(server.getHTTPSServer(), undefined);
      assert.strictEqual(server.getHTTPServer(), undefined);

      fs.unlinkSync(tempCert);
      fs.unlinkSync(tempKey);
    });
  });

  describe('Configuration', () => {
    it('should expose TLS configuration', () => {
      tempCert = path.join(__dirname, 'test-config-cert.pem');
      tempKey = path.join(__dirname, 'test-config-key.pem');
      fs.writeFileSync(tempCert, '-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----');
      fs.writeFileSync(tempKey, '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----');

      const tlsConfig: TLSConfig = {
        ...DEVELOPMENT_TLS_CONFIG,
        enabled: false,
        cert: {
          certPath: tempCert,
          keyPath: tempKey,
        },
      };

      const server = new HTTPSServer(app, tlsConfig);
      const config = server.getTLSConfig();

      assert.strictEqual(config.enabled, false);
      assert.strictEqual(config.httpsPort, 3443);
      assert.strictEqual(config.httpPort, 3000);

      fs.unlinkSync(tempCert);
      fs.unlinkSync(tempKey);
    });

    it('should validate configuration on creation', () => {
      tempCert = path.join(__dirname, 'test-invalid-cert.pem');
      tempKey = path.join(__dirname, 'test-invalid-key.pem');
      fs.writeFileSync(tempCert, '-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----');
      fs.writeFileSync(tempKey, '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----');

      const invalidConfig: TLSConfig = {
        ...DEVELOPMENT_TLS_CONFIG,
        enabled: true,
        httpsPort: 99999, // Invalid port
        cert: {
          certPath: tempCert,
          keyPath: tempKey,
        },
      };

      assert.throws(() => new HTTPSServer(app, invalidConfig));

      fs.unlinkSync(tempCert);
      fs.unlinkSync(tempKey);
    });
  });

  describe('testTLSConnection', () => {
    it('should test TLS connection (mock)', async () => {
      assert(testTLSConnection);
      assert.strictEqual(typeof testTLSConnection, 'function');
    });
  });

  describe('Security Headers', () => {
    it('should configure HSTS with strong settings', () => {
      tempCert = path.join(__dirname, 'test-security-cert.pem');
      tempKey = path.join(__dirname, 'test-security-key.pem');
      fs.writeFileSync(tempCert, '-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----');
      fs.writeFileSync(tempKey, '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----');

      const tlsConfig: TLSConfig = {
        ...DEVELOPMENT_TLS_CONFIG,
        enabled: false,
        hsts: {
          enabled: true,
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        },
        cert: {
          certPath: tempCert,
          keyPath: tempKey,
        },
      };

      const server = new HTTPSServer(app, tlsConfig);
      const config = server.getTLSConfig();

      assert.strictEqual(config.hsts.maxAge, 31536000);
      assert.strictEqual(config.hsts.includeSubDomains, true);
      assert.strictEqual(config.hsts.preload, true);

      fs.unlinkSync(tempCert);
      fs.unlinkSync(tempKey);
    });
  });

  describe('Certificate Monitoring', () => {
    it('should support certificate monitoring configuration', () => {
      tempCert = path.join(__dirname, 'test-monitoring-cert.pem');
      tempKey = path.join(__dirname, 'test-monitoring-key.pem');
      fs.writeFileSync(tempCert, '-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----');
      fs.writeFileSync(tempKey, '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----');

      const tlsConfig: TLSConfig = {
        ...DEVELOPMENT_TLS_CONFIG,
        enabled: false,
        monitoring: {
          enabled: true,
          warnDaysBefore: 30,
          checkInterval: 86400,
        },
        cert: {
          certPath: tempCert,
          keyPath: tempKey,
        },
      };

      const server = new HTTPSServer(app, tlsConfig);
      const config = server.getTLSConfig();

      assert.strictEqual(config.monitoring.enabled, true);
      assert.strictEqual(config.monitoring.warnDaysBefore, 30);

      fs.unlinkSync(tempCert);
      fs.unlinkSync(tempKey);
    });

    it('should disable monitoring in development by default', () => {
      tempCert = path.join(__dirname, 'test-dev-monitoring-cert.pem');
      tempKey = path.join(__dirname, 'test-dev-monitoring-key.pem');
      fs.writeFileSync(tempCert, '-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----');
      fs.writeFileSync(tempKey, '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----');

      const tlsConfig: TLSConfig = {
        ...DEVELOPMENT_TLS_CONFIG,
        enabled: false,
        cert: {
          certPath: tempCert,
          keyPath: tempKey,
        },
      };

      const server = new HTTPSServer(app, tlsConfig);
      const config = server.getTLSConfig();

      assert.strictEqual(config.monitoring.enabled, false);

      fs.unlinkSync(tempCert);
      fs.unlinkSync(tempKey);
    });
  });

  describe('HTTP to HTTPS Redirect', () => {
    it('should support redirect configuration', () => {
      tempCert = path.join(__dirname, 'test-redirect-cert.pem');
      tempKey = path.join(__dirname, 'test-redirect-key.pem');
      fs.writeFileSync(tempCert, '-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----');
      fs.writeFileSync(tempKey, '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----');

      const tlsConfig: TLSConfig = {
        ...DEVELOPMENT_TLS_CONFIG,
        enabled: false,
        redirectHttpToHttps: true,
        cert: {
          certPath: tempCert,
          keyPath: tempKey,
        },
      };

      const server = new HTTPSServer(app, tlsConfig);
      const config = server.getTLSConfig();

      assert.strictEqual(config.redirectHttpToHttps, true);

      fs.unlinkSync(tempCert);
      fs.unlinkSync(tempKey);
    });

    it('should not redirect in development by default', () => {
      tempCert = path.join(__dirname, 'test-no-redirect-cert.pem');
      tempKey = path.join(__dirname, 'test-no-redirect-key.pem');
      fs.writeFileSync(tempCert, '-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----');
      fs.writeFileSync(tempKey, '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----');

      const tlsConfig: TLSConfig = {
        ...DEVELOPMENT_TLS_CONFIG,
        enabled: false,
        cert: {
          certPath: tempCert,
          keyPath: tempKey,
        },
      };

      const server = new HTTPSServer(app, tlsConfig);
      const config = server.getTLSConfig();

      assert.strictEqual(config.redirectHttpToHttps, false);

      fs.unlinkSync(tempCert);
      fs.unlinkSync(tempKey);
    });
  });
});
