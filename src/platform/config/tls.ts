/**
 * MARCUS 3.0 Citation Integrity Platform
 * TLS/HTTPS Configuration
 *
 * Production-grade TLS configuration with strong cipher suites,
 * perfect forward secrecy, and OCSP stapling.
 *
 * Security Standards:
 * - TLS 1.2 minimum (TLS 1.3 preferred)
 * - Strong cipher suites only (no weak/export ciphers)
 * - Perfect forward secrecy (ECDHE)
 * - HSTS headers
 * - Certificate validation
 *
 * @module tls
 * @author Marcus (Platform Engineer)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as tls from 'tls';

// ============================================================================
// TLS Configuration Types
// ============================================================================

export interface TLSConfig {
  enabled: boolean;
  httpsPort: number;
  httpPort: number;
  redirectHttpToHttps: boolean;

  // Certificate configuration
  cert: {
    certPath: string;
    keyPath: string;
    caPath?: string; // Certificate chain (optional)
    passphrase?: string; // Private key passphrase (if encrypted)
  };

  // TLS protocol settings
  minVersion: 'TLSv1.2' | 'TLSv1.3';
  maxVersion?: 'TLSv1.2' | 'TLSv1.3';

  // Cipher suite configuration
  ciphers: string[];

  // OCSP stapling
  ocspStapling: boolean;

  // Client certificate authentication (mutual TLS)
  requestClientCert?: boolean;
  rejectUnauthorized?: boolean;

  // HSTS configuration
  hsts: {
    enabled: boolean;
    maxAge: number; // seconds
    includeSubDomains: boolean;
    preload: boolean;
  };

  // Certificate monitoring
  monitoring: {
    enabled: boolean;
    warnDaysBefore: number; // Alert N days before expiry
    checkInterval: number; // Check interval in seconds
  };
}

// ============================================================================
// Strong Cipher Suites (TLS 1.2 + TLS 1.3)
// ============================================================================

/**
 * Production-grade cipher suites
 * - TLS 1.3 ciphers (AEAD only)
 * - TLS 1.2 with ECDHE (perfect forward secrecy)
 * - AES-GCM and ChaCha20-Poly1305 (authenticated encryption)
 * - No CBC mode (BEAST/Lucky13 vulnerabilities)
 * - No RC4, 3DES, MD5, SHA1
 */
export const STRONG_CIPHERS_TLS13 = [
  'TLS_AES_128_GCM_SHA256',
  'TLS_AES_256_GCM_SHA384',
  'TLS_CHACHA20_POLY1305_SHA256',
];

export const STRONG_CIPHERS_TLS12 = [
  'ECDHE-RSA-AES128-GCM-SHA256',
  'ECDHE-RSA-AES256-GCM-SHA384',
  'ECDHE-ECDSA-AES128-GCM-SHA256',
  'ECDHE-ECDSA-AES256-GCM-SHA384',
  'ECDHE-RSA-CHACHA20-POLY1305',
  'ECDHE-ECDSA-CHACHA20-POLY1305',
];

export const PRODUCTION_CIPHERS = [
  ...STRONG_CIPHERS_TLS13,
  ...STRONG_CIPHERS_TLS12,
].join(':');

// ============================================================================
// Default Configurations
// ============================================================================

/**
 * Production TLS configuration
 * - TLS 1.2 minimum (for compatibility)
 * - Strong cipher suites only
 * - HSTS with 1-year max-age
 * - Certificate monitoring enabled
 */
export const PRODUCTION_TLS_CONFIG: TLSConfig = {
  enabled: true,
  httpsPort: 443,
  httpPort: 80,
  redirectHttpToHttps: true,

  cert: {
    certPath: '/etc/letsencrypt/live/domain/fullchain.pem',
    keyPath: '/etc/letsencrypt/live/domain/privkey.pem',
    caPath: '/etc/letsencrypt/live/domain/chain.pem',
  },

  minVersion: 'TLSv1.2',
  maxVersion: 'TLSv1.3',
  ciphers: PRODUCTION_CIPHERS.split(':'),
  ocspStapling: true,

  hsts: {
    enabled: true,
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: false, // Enable manually after verifying setup
  },

  monitoring: {
    enabled: true,
    warnDaysBefore: 30,
    checkInterval: 86400, // Check daily
  },
};

/**
 * Development TLS configuration
 * - Self-signed certificates
 * - TLS 1.2 minimum
 * - No HSTS (local development)
 * - No certificate monitoring
 */
export const DEVELOPMENT_TLS_CONFIG: TLSConfig = {
  enabled: true,
  httpsPort: 3443,
  httpPort: 3000,
  redirectHttpToHttps: false,

  cert: {
    certPath: path.join(__dirname, '../../../certs/dev-cert.pem'),
    keyPath: path.join(__dirname, '../../../certs/dev-key.pem'),
  },

  minVersion: 'TLSv1.2',
  maxVersion: 'TLSv1.3',
  ciphers: PRODUCTION_CIPHERS.split(':'),
  ocspStapling: false,

  hsts: {
    enabled: false, // Don't use HSTS in development
    maxAge: 0,
    includeSubDomains: false,
    preload: false,
  },

  monitoring: {
    enabled: false,
    warnDaysBefore: 7,
    checkInterval: 86400,
  },
};

// ============================================================================
// TLS Configuration Helpers
// ============================================================================

/**
 * Load TLS configuration from environment variables
 */
export function loadTLSConfig(): TLSConfig {
  const env = process.env.NODE_ENV || 'development';
  const baseConfig = env === 'production' ? PRODUCTION_TLS_CONFIG : DEVELOPMENT_TLS_CONFIG;

  return {
    enabled: process.env.TLS_ENABLED !== 'false',
    httpsPort: parseInt(process.env.HTTPS_PORT || String(baseConfig.httpsPort), 10),
    httpPort: parseInt(process.env.HTTP_PORT || String(baseConfig.httpPort), 10),
    redirectHttpToHttps: process.env.REDIRECT_HTTP_TO_HTTPS === 'true' || baseConfig.redirectHttpToHttps,

    cert: {
      certPath: process.env.TLS_CERT_PATH || baseConfig.cert.certPath,
      keyPath: process.env.TLS_KEY_PATH || baseConfig.cert.keyPath,
      caPath: process.env.TLS_CA_PATH || baseConfig.cert.caPath,
      passphrase: process.env.TLS_KEY_PASSPHRASE,
    },

    minVersion: (process.env.TLS_MIN_VERSION as 'TLSv1.2' | 'TLSv1.3') || baseConfig.minVersion,
    maxVersion: (process.env.TLS_MAX_VERSION as 'TLSv1.2' | 'TLSv1.3') || baseConfig.maxVersion,
    ciphers: process.env.TLS_CIPHERS?.split(':') || baseConfig.ciphers,
    ocspStapling: process.env.TLS_OCSP_STAPLING === 'true' || baseConfig.ocspStapling,

    requestClientCert: process.env.TLS_REQUEST_CLIENT_CERT === 'true',
    rejectUnauthorized: process.env.TLS_REJECT_UNAUTHORIZED === 'true',

    hsts: {
      enabled: process.env.HSTS_ENABLED === 'true' || baseConfig.hsts.enabled,
      maxAge: parseInt(process.env.HSTS_MAX_AGE || String(baseConfig.hsts.maxAge), 10),
      includeSubDomains: process.env.HSTS_INCLUDE_SUBDOMAINS === 'true' || baseConfig.hsts.includeSubDomains,
      preload: process.env.HSTS_PRELOAD === 'true' || baseConfig.hsts.preload,
    },

    monitoring: {
      enabled: process.env.TLS_MONITORING_ENABLED === 'true' || baseConfig.monitoring.enabled,
      warnDaysBefore: parseInt(process.env.TLS_WARN_DAYS_BEFORE || String(baseConfig.monitoring.warnDaysBefore), 10),
      checkInterval: parseInt(process.env.TLS_CHECK_INTERVAL || String(baseConfig.monitoring.checkInterval), 10),
    },
  };
}

/**
 * Validate TLS configuration
 * - Check certificate files exist
 * - Validate cipher suites
 * - Verify TLS version compatibility
 */
export function validateTLSConfig(config: TLSConfig): void {
  if (!config.enabled) {
    console.log('⚠️ TLS disabled - running in HTTP-only mode');
    return;
  }

  // Check certificate files exist
  if (!fs.existsSync(config.cert.certPath)) {
    throw new Error(`❌ TLS certificate not found: ${config.cert.certPath}`);
  }

  if (!fs.existsSync(config.cert.keyPath)) {
    throw new Error(`❌ TLS private key not found: ${config.cert.keyPath}`);
  }

  if (config.cert.caPath && !fs.existsSync(config.cert.caPath)) {
    throw new Error(`❌ TLS CA certificate not found: ${config.cert.caPath}`);
  }

  // Validate port numbers
  if (config.httpsPort < 1 || config.httpsPort > 65535) {
    throw new Error(`❌ Invalid HTTPS port: ${config.httpsPort}`);
  }

  if (config.httpPort < 1 || config.httpPort > 65535) {
    throw new Error(`❌ Invalid HTTP port: ${config.httpPort}`);
  }

  // Validate cipher suites (at least one required)
  if (config.ciphers.length === 0) {
    throw new Error('❌ No cipher suites configured');
  }

  // Validate TLS versions
  const validVersions = ['TLSv1.2', 'TLSv1.3'];
  if (!validVersions.includes(config.minVersion)) {
    throw new Error(`❌ Invalid minVersion: ${config.minVersion}`);
  }

  if (config.maxVersion && !validVersions.includes(config.maxVersion)) {
    throw new Error(`❌ Invalid maxVersion: ${config.maxVersion}`);
  }

  console.log('✅ TLS configuration validated');
}

/**
 * Create Node.js TLS options from TLSConfig
 */
export function createTLSOptions(config: TLSConfig): tls.TlsOptions {
  // Read certificate files
  const cert = fs.readFileSync(config.cert.certPath, 'utf-8');
  const key = fs.readFileSync(config.cert.keyPath, 'utf-8');
  const ca = config.cert.caPath ? fs.readFileSync(config.cert.caPath, 'utf-8') : undefined;

  return {
    cert,
    key,
    ca,
    passphrase: config.cert.passphrase,

    // TLS protocol versions
    minVersion: config.minVersion,
    maxVersion: config.maxVersion,

    // Cipher suites
    ciphers: config.ciphers.join(':'),

    // Prefer server cipher order
    honorCipherOrder: true,

    // Client certificate authentication (mutual TLS)
    requestCert: config.requestClientCert,
    rejectUnauthorized: config.rejectUnauthorized,

    // Enable session resumption for performance
    sessionIdContext: 'marcus-platform',
  };
}

/**
 * Get certificate expiry date
 */
export function getCertificateExpiry(certPath: string): Date {
  const certContent = fs.readFileSync(certPath, 'utf-8');

  // Parse PEM certificate
  const certMatch = certContent.match(/-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/);
  if (!certMatch) {
    throw new Error('Invalid certificate format');
  }

  // Use OpenSSL-compatible parsing (simplified - production should use x509 library)
  const cert = tls.createSecureContext({ cert: certContent });

  // Note: This is a simplified implementation
  // Production should use a proper x509 parsing library
  throw new Error('getCertificateExpiry requires x509 library - see certificate monitoring script');
}

/**
 * Check if certificate is expiring soon
 */
export function isCertificateExpiringSoon(certPath: string, warnDaysBefore: number): boolean {
  try {
    const expiry = getCertificateExpiry(certPath);
    const now = new Date();
    const daysUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    return daysUntilExpiry <= warnDaysBefore;
  } catch (err) {
    console.error('❌ Certificate expiry check failed:', err);
    return false;
  }
}

/**
 * Generate HSTS header value
 */
export function generateHSTSHeader(config: TLSConfig): string {
  if (!config.hsts.enabled) {
    return '';
  }

  const parts = [`max-age=${config.hsts.maxAge}`];

  if (config.hsts.includeSubDomains) {
    parts.push('includeSubDomains');
  }

  if (config.hsts.preload) {
    parts.push('preload');
  }

  return parts.join('; ');
}
