/**
 * MARCUS 3.0 Citation Integrity Platform
 * HTTPS Server with HTTP → HTTPS Redirect
 *
 * Production-ready HTTPS server with:
 * - TLS 1.2/1.3 support
 * - Strong cipher suites
 * - HSTS headers
 * - Automatic HTTP → HTTPS redirect
 * - Certificate monitoring
 * - Graceful shutdown
 *
 * @module httpsServer
 * @author Marcus (Platform Engineer)
 */

import * as https from 'https';
import * as http from 'http';
import { Express, Request, Response, NextFunction } from 'express';
import {
  TLSConfig,
  loadTLSConfig,
  validateTLSConfig,
  createTLSOptions,
  generateHSTSHeader,
} from '../config/tls';

// ============================================================================
// HTTPS Server Wrapper
// ============================================================================

export class HTTPSServer {
  private app: Express;
  private tlsConfig: TLSConfig;
  private httpsServer?: https.Server;
  private httpServer?: http.Server;
  private certificateMonitorInterval?: NodeJS.Timeout;

  constructor(app: Express, tlsConfig?: TLSConfig) {
    this.app = app;
    this.tlsConfig = tlsConfig || loadTLSConfig();

    // Validate configuration
    validateTLSConfig(this.tlsConfig);

    // Add HSTS middleware if enabled
    if (this.tlsConfig.enabled && this.tlsConfig.hsts.enabled) {
      this.setupHSTSMiddleware();
    }
  }

  /**
   * Setup HSTS (HTTP Strict Transport Security) middleware
   */
  private setupHSTSMiddleware(): void {
    const hstsHeader = generateHSTSHeader(this.tlsConfig);

    if (hstsHeader) {
      this.app.use((req: Request, res: Response, next: NextFunction) => {
        // Only set HSTS on HTTPS connections
        if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
          res.setHeader('Strict-Transport-Security', hstsHeader);
        }
        next();
      });

      console.log(`✅ HSTS enabled: ${hstsHeader}`);
    }
  }

  /**
   * Start HTTPS server (and optional HTTP redirect server)
   */
  async start(host: string = '0.0.0.0'): Promise<void> {
    if (!this.tlsConfig.enabled) {
      console.log('⚠️ TLS disabled - skipping HTTPS server');
      return;
    }

    try {
      // Create TLS options
      const tlsOptions = createTLSOptions(this.tlsConfig);

      // Start HTTPS server
      await this.startHTTPSServer(host, tlsOptions);

      // Start HTTP redirect server (if enabled)
      if (this.tlsConfig.redirectHttpToHttps) {
        await this.startHTTPRedirectServer(host);
      }

      // Start certificate monitoring (if enabled)
      if (this.tlsConfig.monitoring.enabled) {
        this.startCertificateMonitoring();
      }

      // Setup graceful shutdown
      this.setupGracefulShutdown();

    } catch (err) {
      console.error('❌ Failed to start HTTPS server:', err);
      throw err;
    }
  }

  /**
   * Start HTTPS server
   */
  private startHTTPSServer(host: string, tlsOptions: https.ServerOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      this.httpsServer = https.createServer(tlsOptions, this.app);

      this.httpsServer.on('error', (err) => {
        console.error('❌ HTTPS server error:', err);
        reject(err);
      });

      this.httpsServer.on('tlsClientError', (err, tlsSocket) => {
        console.error('❌ TLS client error:', {
          error: err.message,
          address: tlsSocket.remoteAddress,
        });
      });

      this.httpsServer.listen(this.tlsConfig.httpsPort, host, () => {
        console.log(`\n✅ HTTPS Server started`);
        console.log(`   Host: ${host}`);
        console.log(`   Port: ${this.tlsConfig.httpsPort}`);
        console.log(`   TLS Version: ${this.tlsConfig.minVersion} - ${this.tlsConfig.maxVersion || 'latest'}`);
        console.log(`   Cipher Suites: ${this.tlsConfig.ciphers.length} configured`);
        console.log(`   HSTS: ${this.tlsConfig.hsts.enabled ? 'enabled' : 'disabled'}`);
        console.log(`   URL: https://${host}:${this.tlsConfig.httpsPort}/health\n`);
        resolve();
      });
    });
  }

  /**
   * Start HTTP redirect server (redirects all HTTP → HTTPS)
   */
  private startHTTPRedirectServer(host: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Create simple redirect server
      this.httpServer = http.createServer((req, res) => {
        const httpsHost = req.headers.host?.replace(/:\d+$/, '') || host;
        const httpsPort = this.tlsConfig.httpsPort === 443 ? '' : `:${this.tlsConfig.httpsPort}`;
        const httpsUrl = `https://${httpsHost}${httpsPort}${req.url}`;

        res.writeHead(301, {
          'Location': httpsUrl,
          'Content-Type': 'text/plain',
        });
        res.end(`Redirecting to ${httpsUrl}`);
      });

      this.httpServer.on('error', (err) => {
        console.error('❌ HTTP redirect server error:', err);
        reject(err);
      });

      this.httpServer.listen(this.tlsConfig.httpPort, host, () => {
        console.log(`✅ HTTP Redirect Server started`);
        console.log(`   Port: ${this.tlsConfig.httpPort} → ${this.tlsConfig.httpsPort} (HTTPS)`);
        resolve();
      });
    });
  }

  /**
   * Start certificate monitoring
   * - Check certificate expiry periodically
   * - Alert if certificate expires soon
   */
  private startCertificateMonitoring(): void {
    const checkCertificate = () => {
      try {
        console.log(`🔍 Certificate monitoring check (every ${this.tlsConfig.monitoring.checkInterval}s)`);

        // Check certificate expiry
        if (!this.tlsConfig.cert || !this.tlsConfig.key) {
          console.warn('⚠️ No certificate configured for monitoring');
          return;
        }

        // Read certificate file
        const fs = require('fs');
        const crypto = require('crypto');

        let certPath: string;
        if (typeof this.tlsConfig.cert === 'string' && !this.tlsConfig.cert.startsWith('-----BEGIN')) {
          certPath = this.tlsConfig.cert;
        } else {
          // Certificate is inline PEM, skip monitoring
          return;
        }

        if (!fs.existsSync(certPath)) {
          console.warn(`⚠️ Certificate file not found: ${certPath}`);
          return;
        }

        const certPem = fs.readFileSync(certPath, 'utf8');
        const cert = crypto.X509Certificate ? new crypto.X509Certificate(certPem) : null;

        if (!cert) {
          console.warn('⚠️ crypto.X509Certificate not available (Node.js < 15.6)');
          return;
        }

        // Parse certificate validity dates
        const validTo = new Date(cert.validTo);
        const now = new Date();
        const daysUntilExpiry = Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        console.log(`📜 Certificate expires: ${validTo.toISOString()} (${daysUntilExpiry} days)`);

        // Alert if expiring soon
        if (daysUntilExpiry < 0) {
          console.error(`🚨 CRITICAL: Certificate EXPIRED ${Math.abs(daysUntilExpiry)} days ago!`);
        } else if (daysUntilExpiry <= this.tlsConfig.monitoring.warnDaysBefore) {
          console.warn(`⚠️ WARNING: Certificate expires in ${daysUntilExpiry} days! Renew soon.`);
        }

      } catch (err) {
        console.error('❌ Certificate monitoring error:', err);
      }
    };

    // Check immediately
    checkCertificate();

    // Schedule periodic checks
    this.certificateMonitorInterval = setInterval(
      checkCertificate,
      this.tlsConfig.monitoring.checkInterval * 1000
    );

    console.log(`✅ Certificate monitoring enabled (warn ${this.tlsConfig.monitoring.warnDaysBefore} days before expiry)`);
  }

  /**
   * Stop certificate monitoring
   */
  private stopCertificateMonitoring(): void {
    if (this.certificateMonitorInterval) {
      clearInterval(this.certificateMonitorInterval);
      this.certificateMonitorInterval = undefined;
      console.log('✅ Certificate monitoring stopped');
    }
  }

  /**
   * Setup graceful shutdown on SIGTERM/SIGINT
   */
  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      console.log(`\n⚠️ Received ${signal}, shutting down HTTPS server...`);

      // Stop certificate monitoring
      this.stopCertificateMonitoring();

      // Close HTTPS server
      if (this.httpsServer) {
        await new Promise<void>((resolve) => {
          this.httpsServer!.close(() => {
            console.log('✅ HTTPS server closed');
            resolve();
          });
        });
      }

      // Close HTTP redirect server
      if (this.httpServer) {
        await new Promise<void>((resolve) => {
          this.httpServer!.close(() => {
            console.log('✅ HTTP redirect server closed');
            resolve();
          });
        });
      }

      console.log('✅ HTTPS shutdown complete');
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  /**
   * Get HTTPS server instance (for testing)
   */
  getHTTPSServer(): https.Server | undefined {
    return this.httpsServer;
  }

  /**
   * Get HTTP redirect server instance (for testing)
   */
  getHTTPServer(): http.Server | undefined {
    return this.httpServer;
  }

  /**
   * Get TLS configuration
   */
  getTLSConfig(): TLSConfig {
    return this.tlsConfig;
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Create and start HTTPS server with default configuration
 */
export async function startHTTPSServer(
  app: Express,
  host: string = '0.0.0.0',
  tlsConfig?: TLSConfig
): Promise<HTTPSServer> {
  const server = new HTTPSServer(app, tlsConfig);
  await server.start(host);
  return server;
}

/**
 * Test TLS connection (for diagnostics)
 */
export async function testTLSConnection(
  host: string,
  port: number
): Promise<{ success: boolean; protocol?: string; cipher?: string; error?: string }> {
  return new Promise((resolve) => {
    const socket = https.request({
      host,
      port,
      method: 'GET',
      path: '/health',
      // lgtm[js/disabling-certificate-validation] - Intentionally disabled for TLS testing function
      // This function is ONLY used to test self-signed certificates in development/testing environments
      // Production deployments use proper certificate validation
      rejectUnauthorized: false, // NOSONAR - Allow self-signed for testing only
    }, (res) => {
      const protocol = (res.socket as any).getProtocol?.();
      const cipher = (res.socket as any).getCipher?.();

      resolve({
        success: true,
        protocol,
        cipher: cipher?.name,
      });

      res.resume(); // Drain response
    });

    socket.on('error', (err) => {
      resolve({
        success: false,
        error: err.message,
      });
    });

    socket.end();
  });
}
