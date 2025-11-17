/**
 * MARCUS 3.0 Citation Integrity Platform
 * TLS Configuration Tests
 *
 * Tests for TLS/HTTPS configuration, certificate handling,
 * and security settings.
 *
 * @author Marcus (Platform Engineer)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as fs from 'fs';
import * as path from 'path';
import {
  TLSConfig,
  loadTLSConfig,
  validateTLSConfig,
  createTLSOptions,
  generateHSTSHeader,
  PRODUCTION_CIPHERS,
  STRONG_CIPHERS_TLS13,
  STRONG_CIPHERS_TLS12,
  PRODUCTION_TLS_CONFIG,
  DEVELOPMENT_TLS_CONFIG,
} from '../config/tls';

describe('TLS Configuration', () => {
  describe('Cipher Suites', () => {
    it('should define TLS 1.3 cipher suites', () => {
      assert(STRONG_CIPHERS_TLS13.includes('TLS_AES_128_GCM_SHA256'));
      assert(STRONG_CIPHERS_TLS13.includes('TLS_AES_256_GCM_SHA384'));
      assert(STRONG_CIPHERS_TLS13.includes('TLS_CHACHA20_POLY1305_SHA256'));
    });

    it('should define TLS 1.2 cipher suites with ECDHE', () => {
      assert(STRONG_CIPHERS_TLS12.includes('ECDHE-RSA-AES128-GCM-SHA256'));
      assert(STRONG_CIPHERS_TLS12.includes('ECDHE-RSA-AES256-GCM-SHA384'));
      assert(STRONG_CIPHERS_TLS12.includes('ECDHE-ECDSA-AES128-GCM-SHA256'));
    });

    it('should not include weak ciphers', () => {
      const weakCiphers = ['RC4', '3DES', 'MD5', 'SHA1', 'CBC'];
      const productionCiphers = PRODUCTION_CIPHERS;

      weakCiphers.forEach(weak => {
        assert(!productionCiphers.includes(weak));
      });
    });

    it('should combine TLS 1.3 and TLS 1.2 ciphers', () => {
      assert(PRODUCTION_CIPHERS.includes('TLS_AES_128_GCM_SHA256'));
      assert(PRODUCTION_CIPHERS.includes('ECDHE-RSA-AES128-GCM-SHA256'));
    });
  });

  describe('Production Configuration', () => {
    it('should have production defaults', () => {
      assert.strictEqual(PRODUCTION_TLS_CONFIG.enabled, true);
      assert.strictEqual(PRODUCTION_TLS_CONFIG.httpsPort, 443);
      assert.strictEqual(PRODUCTION_TLS_CONFIG.httpPort, 80);
      assert.strictEqual(PRODUCTION_TLS_CONFIG.redirectHttpToHttps, true);
    });

    it('should require TLS 1.2 minimum', () => {
      assert.strictEqual(PRODUCTION_TLS_CONFIG.minVersion, 'TLSv1.2');
    });

    it('should enable HSTS with strong settings', () => {
      assert.strictEqual(PRODUCTION_TLS_CONFIG.hsts.enabled, true);
      assert.strictEqual(PRODUCTION_TLS_CONFIG.hsts.maxAge, 31536000); // 1 year
      assert.strictEqual(PRODUCTION_TLS_CONFIG.hsts.includeSubDomains, true);
    });

    it('should enable OCSP stapling', () => {
      assert.strictEqual(PRODUCTION_TLS_CONFIG.ocspStapling, true);
    });

    it('should enable certificate monitoring', () => {
      assert.strictEqual(PRODUCTION_TLS_CONFIG.monitoring.enabled, true);
      assert.strictEqual(PRODUCTION_TLS_CONFIG.monitoring.warnDaysBefore, 30);
    });
  });

  describe('Development Configuration', () => {
    it('should have development defaults', () => {
      assert.strictEqual(DEVELOPMENT_TLS_CONFIG.enabled, true);
      assert.strictEqual(DEVELOPMENT_TLS_CONFIG.httpsPort, 3443);
      assert.strictEqual(DEVELOPMENT_TLS_CONFIG.httpPort, 3000);
      assert.strictEqual(DEVELOPMENT_TLS_CONFIG.redirectHttpToHttps, false);
    });

    it('should disable HSTS in development', () => {
      assert.strictEqual(DEVELOPMENT_TLS_CONFIG.hsts.enabled, false);
    });

    it('should disable certificate monitoring in development', () => {
      assert.strictEqual(DEVELOPMENT_TLS_CONFIG.monitoring.enabled, false);
    });

    it('should use local certificate paths', () => {
      assert(DEVELOPMENT_TLS_CONFIG.cert.certPath.includes('certs/dev-cert.pem'));
      assert(DEVELOPMENT_TLS_CONFIG.cert.keyPath.includes('certs/dev-key.pem'));
    });
  });

  describe('loadTLSConfig', () => {
    const originalEnv = process.env;

    it('should load development config by default', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      delete process.env.NODE_ENV;

      const config = loadTLSConfig();
      assert.strictEqual(config.httpsPort, 3443);

      if (originalNodeEnv) process.env.NODE_ENV = originalNodeEnv;
    });

    it('should override with environment variables', () => {
      const originalHttpsPort = process.env.HTTPS_PORT;
      const originalTlsEnabled = process.env.TLS_ENABLED;

      process.env.HTTPS_PORT = '8443';
      process.env.TLS_ENABLED = 'false';

      const config = loadTLSConfig();
      assert.strictEqual(config.httpsPort, 8443);
      assert.strictEqual(config.enabled, false);

      // Restore
      if (originalHttpsPort) process.env.HTTPS_PORT = originalHttpsPort;
      else delete process.env.HTTPS_PORT;
      if (originalTlsEnabled) process.env.TLS_ENABLED = originalTlsEnabled;
      else delete process.env.TLS_ENABLED;
    });
  });

  describe('validateTLSConfig', () => {
    it('should skip validation if TLS disabled', () => {
      const config: TLSConfig = {
        ...DEVELOPMENT_TLS_CONFIG,
        enabled: false,
      };
      assert.doesNotThrow(() => validateTLSConfig(config));
    });

    it('should throw if certificate file not found', () => {
      const config: TLSConfig = {
        ...DEVELOPMENT_TLS_CONFIG,
        cert: {
          certPath: '/nonexistent/cert.pem',
          keyPath: '/nonexistent/key.pem',
        },
      };
      assert.throws(() => validateTLSConfig(config), /TLS certificate not found/);
    });

    it('should throw if invalid HTTPS port', () => {
      const tempCert = path.join(__dirname, 'temp-cert-port-test.pem');
      const tempKey = path.join(__dirname, 'temp-key-port-test.pem');
      fs.writeFileSync(tempCert, 'dummy cert');
      fs.writeFileSync(tempKey, 'dummy key');

      const config: TLSConfig = {
        ...DEVELOPMENT_TLS_CONFIG,
        httpsPort: 99999,
        cert: {
          certPath: tempCert,
          keyPath: tempKey,
        },
      };

      assert.throws(() => validateTLSConfig(config), /Invalid HTTPS port/);

      fs.unlinkSync(tempCert);
      fs.unlinkSync(tempKey);
    });

    it('should throw if no cipher suites configured', () => {
      const tempCert = path.join(__dirname, 'temp-cert-cipher-test.pem');
      const tempKey = path.join(__dirname, 'temp-key-cipher-test.pem');
      fs.writeFileSync(tempCert, 'dummy cert');
      fs.writeFileSync(tempKey, 'dummy key');

      const config: TLSConfig = {
        ...DEVELOPMENT_TLS_CONFIG,
        ciphers: [],
        cert: {
          certPath: tempCert,
          keyPath: tempKey,
        },
      };

      assert.throws(() => validateTLSConfig(config), /No cipher suites configured/);

      fs.unlinkSync(tempCert);
      fs.unlinkSync(tempKey);
    });
  });

  describe('createTLSOptions', () => {
    let tempCert: string;
    let tempKey: string;

    it('should create valid TLS options', () => {
      tempCert = path.join(__dirname, 'test-cert.pem');
      tempKey = path.join(__dirname, 'test-key.pem');
      fs.writeFileSync(tempCert, '-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----');
      fs.writeFileSync(tempKey, '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----');

      const config: TLSConfig = {
        ...DEVELOPMENT_TLS_CONFIG,
        cert: {
          certPath: tempCert,
          keyPath: tempKey,
        },
      };

      const options = createTLSOptions(config);

      assert(options.cert);
      assert(options.key);
      assert.strictEqual(options.minVersion, 'TLSv1.2');
      assert.strictEqual(options.honorCipherOrder, true);

      fs.unlinkSync(tempCert);
      fs.unlinkSync(tempKey);
    });
  });

  describe('generateHSTSHeader', () => {
    it('should generate HSTS header with all options', () => {
      const config: TLSConfig = {
        ...PRODUCTION_TLS_CONFIG,
        hsts: {
          enabled: true,
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        },
      };

      const header = generateHSTSHeader(config);
      assert.strictEqual(header, 'max-age=31536000; includeSubDomains; preload');
    });

    it('should generate HSTS header without includeSubDomains', () => {
      const config: TLSConfig = {
        ...PRODUCTION_TLS_CONFIG,
        hsts: {
          enabled: true,
          maxAge: 31536000,
          includeSubDomains: false,
          preload: false,
        },
      };

      const header = generateHSTSHeader(config);
      assert.strictEqual(header, 'max-age=31536000');
    });

    it('should return empty string if HSTS disabled', () => {
      const config: TLSConfig = {
        ...DEVELOPMENT_TLS_CONFIG,
        hsts: {
          enabled: false,
          maxAge: 0,
          includeSubDomains: false,
          preload: false,
        },
      };

      const header = generateHSTSHeader(config);
      assert.strictEqual(header, '');
    });
  });

  describe('Security Best Practices', () => {
    it('should enforce minimum TLS 1.2', () => {
      assert.strictEqual(PRODUCTION_TLS_CONFIG.minVersion, 'TLSv1.2');
      assert.strictEqual(DEVELOPMENT_TLS_CONFIG.minVersion, 'TLSv1.2');
    });

    it('should use strong cipher suites only', () => {
      const ciphers = PRODUCTION_CIPHERS;
      assert(ciphers.includes('GCM')); // Authenticated encryption
      assert(ciphers.includes('ECDHE')); // Perfect forward secrecy
    });

    it('should enable HSTS in production', () => {
      assert.strictEqual(PRODUCTION_TLS_CONFIG.hsts.enabled, true);
      assert(PRODUCTION_TLS_CONFIG.hsts.maxAge >= 31536000);
    });

    it('should enable certificate monitoring in production', () => {
      assert.strictEqual(PRODUCTION_TLS_CONFIG.monitoring.enabled, true);
    });

    it('should redirect HTTP to HTTPS in production', () => {
      assert.strictEqual(PRODUCTION_TLS_CONFIG.redirectHttpToHttps, true);
    });
  });
});
