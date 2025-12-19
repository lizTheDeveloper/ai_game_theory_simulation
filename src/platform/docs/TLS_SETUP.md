# MARCUS Platform - TLS/HTTPS Setup Guide

**Author:** Marcus (Platform Engineer)
**Last Updated:** November 2025

## Overview

This guide covers production-grade TLS/HTTPS configuration for the MARCUS Citation Integrity Platform, including:

- **TLS 1.2/1.3 support** with strong cipher suites
- **Let's Encrypt** automated certificate management
- **HSTS headers** for enhanced security
- **Certificate monitoring** with expiry alerts
- **HTTP → HTTPS redirect** (automatic)
- **Development certificates** (self-signed)

## Quick Start

### Development Setup

```bash
# 1. Generate self-signed certificates
./scripts/generate-dev-certs.sh

# 2. Enable TLS in .env
TLS_ENABLED=true
TLS_CERT_PATH=./certs/dev-cert.pem
TLS_KEY_PATH=./certs/dev-key.pem

# 3. Start server
npm run dev
```

Your server will be available at:
- **HTTPS:** `https://localhost:3443`
- **HTTP:** `http://localhost:3000` (no redirect in dev)

### Production Setup

```bash
# 1. Generate Let's Encrypt certificate
sudo ./scripts/setup-letsencrypt.sh \
  -d yourdomain.com \
  -d www.yourdomain.com \
  -e admin@yourdomain.com

# 2. Configure production TLS (.env)
NODE_ENV=production
TLS_ENABLED=true
HTTPS_PORT=443
HTTP_PORT=80
REDIRECT_HTTP_TO_HTTPS=true
HSTS_ENABLED=true

TLS_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
TLS_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem
TLS_CA_PATH=/etc/letsencrypt/live/yourdomain.com/chain.pem

TLS_MONITORING_ENABLED=true
TLS_WARN_DAYS_BEFORE=30

# 3. Start server
npm start
```

Your server will be available at:
- **HTTPS:** `https://yourdomain.com` (port 443)
- **HTTP:** `http://yourdomain.com` (redirects to HTTPS)

---

## Certificate Management

### Development Certificates (Self-Signed)

**Option 1: OpenSSL (works everywhere)**

```bash
./scripts/generate-dev-certs.sh
```

Generated files:
- `./certs/dev-cert.pem` - Certificate
- `./certs/dev-key.pem` - Private key

**Caveat:** Browsers will show security warnings (expected for self-signed certs).

**Option 2: mkcert (trusted local certificates)**

Install [mkcert](https://github.com/FiloSottile/mkcert):

```bash
# macOS
brew install mkcert

# Linux
wget -O mkcert https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64
chmod +x mkcert
sudo mv mkcert /usr/local/bin/

# Run certificate generation script
./scripts/generate-dev-certs.sh
# Choose 'Y' when prompted to use mkcert
```

**Benefit:** No browser warnings, fully trusted locally.

### Production Certificates (Let's Encrypt)

**Prerequisites:**
- Domain name pointing to your server
- Port 80 accessible (for HTTP-01 challenge) OR DNS provider credentials (for DNS-01)
- Certbot installed: `sudo apt install certbot` (Ubuntu/Debian) or `brew install certbot` (macOS)

**HTTP-01 Challenge (Standard)**

```bash
sudo ./scripts/setup-letsencrypt.sh \
  -d example.com \
  -e admin@example.com
```

**HTTP-01 Challenge (Multiple Domains)**

```bash
sudo ./scripts/setup-letsencrypt.sh \
  -d example.com \
  -d www.example.com \
  -d api.example.com \
  -e admin@example.com
```

**DNS-01 Challenge (Wildcard Certificates)**

```bash
sudo ./scripts/setup-letsencrypt.sh \
  -d example.com \
  -d "*.example.com" \
  -e admin@example.com \
  --dns
```

**Dry Run (Test Configuration)**

```bash
sudo ./scripts/setup-letsencrypt.sh \
  -d example.com \
  -e admin@example.com \
  --dry-run
```

### Certificate Renewal

**Automatic Renewal (Recommended)**

Let's Encrypt certificates expire after 90 days. Certbot sets up automatic renewal via systemd timer:

```bash
# Check renewal timer status
sudo systemctl status certbot.timer

# Test renewal process
sudo certbot renew --dry-run
```

**Manual Renewal**

```bash
# Renew all certificates due for renewal
./scripts/renew-certificates.sh

# Force renewal (testing)
./scripts/renew-certificates.sh --force

# Renew specific certificate
./scripts/renew-certificates.sh --cert-name example.com
```

**Post-Renewal Hook**

Automatically reload services after renewal:

```bash
# Edit /etc/letsencrypt/renewal-hooks/post/reload-services.sh
#!/bin/bash
systemctl reload marcus-platform
systemctl reload nginx  # If using reverse proxy
```

### Certificate Monitoring

**Check Certificate Expiry**

```bash
# Check all certificates
./scripts/check-cert-expiry.sh

# Check specific certificate
./scripts/check-cert-expiry.sh --cert-name example.com

# Check with custom warning threshold (14 days)
./scripts/check-cert-expiry.sh --warn-days 14

# Check remote certificate
./scripts/check-cert-expiry.sh --remote example.com --port 443
```

**Exit Codes:**
- `0` - Certificate valid, not expiring soon
- `1` - Certificate expiring within warning threshold
- `2` - Certificate expired or invalid

**Cron Job for Automated Monitoring**

```bash
# Add to crontab (check daily at 2 AM)
0 2 * * * /path/to/scripts/check-cert-expiry.sh || echo "Certificate expiring soon!" | mail -s "TLS Alert" admin@example.com
```

---

## TLS Configuration

### Environment Variables

See `.env.example` for complete configuration options.

**Core TLS Settings:**

```bash
# Enable HTTPS
TLS_ENABLED=true

# Ports
HTTPS_PORT=443
HTTP_PORT=80

# Certificate paths
TLS_CERT_PATH=/etc/letsencrypt/live/domain/fullchain.pem
TLS_KEY_PATH=/etc/letsencrypt/live/domain/privkey.pem
TLS_CA_PATH=/etc/letsencrypt/live/domain/chain.pem

# TLS versions
TLS_MIN_VERSION=TLSv1.2
TLS_MAX_VERSION=TLSv1.3

# Redirect HTTP to HTTPS
REDIRECT_HTTP_TO_HTTPS=true
```

**HSTS Configuration:**

```bash
HSTS_ENABLED=true
HSTS_MAX_AGE=31536000          # 1 year
HSTS_INCLUDE_SUBDOMAINS=true
HSTS_PRELOAD=false             # Enable after testing
```

**Certificate Monitoring:**

```bash
TLS_MONITORING_ENABLED=true
TLS_WARN_DAYS_BEFORE=30
TLS_CHECK_INTERVAL=86400       # Daily
```

### Configuration Files

**Production:** `config/tls-production.json`
```json
{
  "enabled": true,
  "httpsPort": 443,
  "httpPort": 80,
  "redirectHttpToHttps": true,
  "minVersion": "TLSv1.2",
  "hsts": {
    "enabled": true,
    "maxAge": 31536000
  }
}
```

**Development:** `config/tls-development.json`
```json
{
  "enabled": true,
  "httpsPort": 3443,
  "httpPort": 3000,
  "redirectHttpToHttps": false,
  "hsts": {
    "enabled": false
  }
}
```

### Cipher Suites

**Default Configuration (Strong Ciphers Only):**

**TLS 1.3:**
- `TLS_AES_128_GCM_SHA256`
- `TLS_AES_256_GCM_SHA384`
- `TLS_CHACHA20_POLY1305_SHA256`

**TLS 1.2 (with Perfect Forward Secrecy):**
- `ECDHE-RSA-AES128-GCM-SHA256`
- `ECDHE-RSA-AES256-GCM-SHA384`
- `ECDHE-ECDSA-AES128-GCM-SHA256`
- `ECDHE-ECDSA-AES256-GCM-SHA384`
- `ECDHE-RSA-CHACHA20-POLY1305`
- `ECDHE-ECDSA-CHACHA20-POLY1305`

**Security Properties:**
- **AEAD only** (authenticated encryption) - No CBC mode
- **Perfect forward secrecy** (ECDHE key exchange)
- **No weak ciphers** - RC4, 3DES, MD5, SHA1 excluded
- **Server cipher preference** - Server chooses strongest cipher

**Custom Cipher Configuration:**

```bash
# Override in .env (colon-separated)
TLS_CIPHERS=TLS_AES_256_GCM_SHA384:ECDHE-RSA-AES256-GCM-SHA384
```

---

## Security Best Practices

### HSTS (HTTP Strict Transport Security)

**What is HSTS?**
- Forces browsers to always use HTTPS (even if user types `http://`)
- Prevents SSL stripping attacks
- Protects against downgrade attacks

**Deployment Strategy:**

1. **Test with short max-age:**
   ```bash
   HSTS_ENABLED=true
   HSTS_MAX_AGE=300  # 5 minutes (testing)
   ```

2. **Increase max-age gradually:**
   ```bash
   HSTS_MAX_AGE=86400      # 1 day
   HSTS_MAX_AGE=604800     # 1 week
   HSTS_MAX_AGE=31536000   # 1 year (production)
   ```

3. **Enable subdomains (if applicable):**
   ```bash
   HSTS_INCLUDE_SUBDOMAINS=true
   ```

4. **Submit to preload list (optional):**
   - Verify HSTS works correctly for 3+ months
   - Enable `HSTS_PRELOAD=true`
   - Submit to: https://hstspreload.org/

**HSTS Removal (Emergency):**
- Set `max-age=0` and keep HSTS enabled
- Wait for browsers to receive new header
- Then disable HSTS

### Certificate Pinning (Advanced)

For high-security environments, implement certificate pinning:

```typescript
// Example: Pin public key hash
const expectedHash = 'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';
res.setHeader('Public-Key-Pins', `pin-sha256="${expectedHash}"; max-age=5184000`);
```

**Caution:** Incorrect pinning can lock users out. Only use if you understand the risks.

### OCSP Stapling

OCSP stapling reduces latency by bundling certificate validity proof with TLS handshake.

```bash
TLS_OCSP_STAPLING=true
```

Nginx configuration (if using reverse proxy):
```nginx
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /etc/letsencrypt/live/domain/chain.pem;
```

---

## Reverse Proxy Integration

### Nginx

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com www.example.com;

    # TLS certificates
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # TLS configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers on;

    # OCSP stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/example.com/chain.pem;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Proxy to Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Caddy (Automatic HTTPS)

```
example.com www.example.com {
    # Caddy automatically handles Let's Encrypt and TLS
    reverse_proxy localhost:3000
}
```

Caddy provides automatic HTTPS with Let's Encrypt - no manual configuration needed!

---

## Testing & Verification

### SSL Labs Test

Test your TLS configuration for vulnerabilities:

```bash
# Visit SSL Labs
https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com
```

**Target Grade:** **A+**

**Checklist:**
- ✅ TLS 1.2+ only (no TLS 1.0/1.1, SSL 2/3)
- ✅ Strong cipher suites
- ✅ Perfect forward secrecy
- ✅ HSTS enabled
- ✅ Certificate valid and trusted

### Manual Testing

**Test HTTPS Connection:**

```bash
# Basic connection test
curl -I https://example.com/health

# Verify TLS version
openssl s_client -connect example.com:443 -tls1_2
openssl s_client -connect example.com:443 -tls1_3

# Check certificate details
openssl s_client -connect example.com:443 -showcerts

# Verify HSTS header
curl -I https://example.com | grep -i strict
```

**Test HTTP Redirect:**

```bash
# Should return 301 redirect to HTTPS
curl -I http://example.com
```

**Test Certificate Expiry:**

```bash
./scripts/check-cert-expiry.sh --remote example.com
```

### Security Headers Verification

```bash
# Check all security headers
curl -I https://example.com | grep -E "(Strict-Transport|X-Content|X-Frame)"
```

Expected headers:
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`

---

## Troubleshooting

### Certificate Not Found

**Error:** `❌ TLS certificate not found: /path/to/cert.pem`

**Solution:**
1. Verify certificate path in `.env`
2. Check file permissions: `ls -l /etc/letsencrypt/live/domain/`
3. Ensure certificates generated: `sudo certbot certificates`

### Permission Denied

**Error:** `EACCES: permission denied, open '/etc/letsencrypt/...'`

**Solution:**
```bash
# Run server with sudo (not recommended)
sudo npm start

# OR copy certificates to accessible location
sudo cp /etc/letsencrypt/live/domain/* /opt/marcus/certs/
sudo chown marcus:marcus /opt/marcus/certs/*

# Update .env
TLS_CERT_PATH=/opt/marcus/certs/fullchain.pem
TLS_KEY_PATH=/opt/marcus/certs/privkey.pem
```

### Port 80/443 Already in Use

**Error:** `EADDRINUSE: address already in use :::443`

**Solution:**
```bash
# Find process using port
sudo lsof -i :443
sudo lsof -i :80

# Stop conflicting service
sudo systemctl stop nginx
sudo systemctl stop apache2

# OR use different ports
HTTPS_PORT=8443
HTTP_PORT=8080
```

### Browser Security Warnings

**Issue:** "Your connection is not private" warning

**Causes:**
1. **Self-signed certificate** (development) - Expected, click "Advanced" → "Proceed"
2. **Expired certificate** - Run `./scripts/renew-certificates.sh`
3. **Wrong domain** - Certificate issued for `example.com` but accessing `www.example.com`
4. **Incomplete chain** - Missing intermediate CA certificate

**Solutions:**
```bash
# Check certificate details
openssl x509 -in /path/to/cert.pem -noout -text

# Verify certificate chain
openssl verify -CAfile /path/to/chain.pem /path/to/cert.pem

# Regenerate with correct domains
sudo ./scripts/setup-letsencrypt.sh -d example.com -d www.example.com -e admin@example.com
```

### HSTS Issues

**Issue:** Can't access site after disabling HTTPS

**Cause:** Browser enforcing HSTS policy

**Solution:**
```bash
# Clear HSTS in browser
# Chrome: chrome://net-internals/#hsts → Delete domain
# Firefox: Delete ~/Library/Application Support/Firefox/Profiles/.../SiteSecurityServiceState.txt

# OR wait for max-age to expire
# OR send max-age=0 header while HTTPS still works
```

---

## Production Deployment

### Systemd Service

```ini
# /etc/systemd/system/marcus-platform.service
[Unit]
Description=MARCUS Citation Integrity Platform
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=marcus
WorkingDirectory=/opt/marcus-platform
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Certificate Renewal Automation

```ini
# /etc/systemd/system/certbot-renew.timer
[Unit]
Description=Certbot Renewal Timer

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
```

```ini
# /etc/systemd/system/certbot-renew.service
[Unit]
Description=Certbot Renewal Service

[Service]
Type=oneshot
ExecStart=/usr/bin/certbot renew --quiet --post-hook "systemctl reload marcus-platform"
```

Enable timer:
```bash
sudo systemctl enable certbot-renew.timer
sudo systemctl start certbot-renew.timer
```

### Monitoring & Alerts

**Prometheus Metrics:**

The platform exposes TLS metrics at `/metrics`:

```
# Certificate expiry (days remaining)
tls_certificate_expiry_days{domain="example.com"} 45

# TLS handshake errors
tls_handshake_errors_total 0

# Active TLS version distribution
tls_version{version="TLSv1.3"} 95
tls_version{version="TLSv1.2"} 5
```

**Alertmanager Rules:**

```yaml
groups:
  - name: tls
    rules:
      - alert: CertificateExpiringSoon
        expr: tls_certificate_expiry_days < 30
        annotations:
          summary: "Certificate expires in {{ $value }} days"

      - alert: TLSHandshakeErrors
        expr: rate(tls_handshake_errors_total[5m]) > 0.1
        annotations:
          summary: "High TLS handshake error rate"
```

---

## References

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [OWASP Transport Layer Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html)
- [SSL Labs Best Practices](https://github.com/ssllabs/research/wiki/SSL-and-TLS-Deployment-Best-Practices)
- [HSTS Preload Submission](https://hstspreload.org/)
