# TLS/SSL Configuration

## Development (Self-Signed)

Generate self-signed certificates for local development:

```bash
cd config/tls
chmod +x generate-certs.sh
./generate-certs.sh
```

This creates:
- `server.key` - Private key (keep secret!)
- `server.crt` - Certificate
- `server.csr` - Certificate signing request
- `dhparam.pem` - Diffie-Hellman parameters

Add to your hosts file:
```
127.0.0.1 api.citation-platform.local
```

Test:
```bash
curl --cacert config/tls/server.crt https://api.citation-platform.local:4000/health
```

## Production (Let's Encrypt)

### Using cert-manager (Kubernetes)

1. Install cert-manager:
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

2. Create ClusterIssuer (see `k8s/base/ingress.yaml`)

3. Annotate Ingress with:
```yaml
metadata:
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
```

Cert-manager will automatically:
- Request certificate from Let's Encrypt
- Validate domain ownership (HTTP-01 challenge)
- Store certificate in Kubernetes Secret
- Auto-renew before expiration

### Using certbot (Manual)

```bash
# Install certbot
sudo apt-get install certbot

# Request certificate
sudo certbot certonly --standalone -d api.citation-platform.com

# Certificates stored in:
# /etc/letsencrypt/live/api.citation-platform.com/fullchain.pem
# /etc/letsencrypt/live/api.citation-platform.com/privkey.pem

# Auto-renewal (add to cron)
0 0 * * * certbot renew --quiet --post-hook "systemctl reload nginx"
```

## TLS Best Practices

1. **Use TLS 1.2+ only** (disable SSLv3, TLS 1.0, TLS 1.1)
2. **Strong cipher suites** (prefer ECDHE, disable RC4, DES)
3. **Enable HSTS** (HTTP Strict Transport Security)
4. **Perfect Forward Secrecy** (ECDHE ciphers)
5. **Certificate pinning** (optional, for high security)
6. **Auto-renewal** (certificates expire every 90 days)
7. **Monitor expiration** (alert 30 days before)

## NGINX Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name api.citation-platform.com;

    # Certificates
    ssl_certificate /etc/letsencrypt/live/api.citation-platform.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.citation-platform.com/privkey.pem;
    ssl_dhparam /etc/ssl/certs/dhparam.pem;

    # TLS version
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    # Cipher suites
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;

    # Proxy to Node.js
    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.citation-platform.com;
    return 301 https://$server_name$request_uri;
}
```

## Node.js HTTPS Server

```typescript
import * as https from 'https';
import * as fs from 'fs';
import express from 'express';

const app = express();

const options = {
  key: fs.readFileSync('config/tls/server.key'),
  cert: fs.readFileSync('config/tls/server.crt'),
  dhparam: fs.readFileSync('config/tls/dhparam.pem'),

  // TLS options
  minVersion: 'TLSv1.2',
  ciphers: 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256',
  honorCipherOrder: true,
};

https.createServer(options, app).listen(4000, () => {
  console.log('HTTPS server running on port 4000');
});
```

## Certificate Rotation

### Automated (Kubernetes + cert-manager)

Cert-manager handles rotation automatically:
- Monitors certificate expiration
- Requests renewal 30 days before expiry
- Updates Kubernetes Secret
- Pods automatically pick up new certificate (if configured)

### Manual

1. Generate new certificate
2. Update server configuration
3. Reload/restart server (zero-downtime reload)
4. Verify new certificate:
```bash
openssl s_client -connect api.citation-platform.com:443 -servername api.citation-platform.com
```

## Monitoring

Check certificate expiration:

```bash
# Command line
echo | openssl s_client -servername api.citation-platform.com -connect api.citation-platform.com:443 2>/dev/null | openssl x509 -noout -dates

# Prometheus alert (see monitoring/prometheus/alerts.yml)
- alert: CertificateExpiringSoon
  expr: probe_ssl_earliest_cert_expiry - time() < 30 * 24 * 3600
  for: 1h
  annotations:
    summary: "TLS certificate expiring in 30 days"
```

## Security Checklist

- [ ] TLS 1.2+ only (no SSLv3, TLS 1.0/1.1)
- [ ] Strong cipher suites (no RC4, DES, 3DES)
- [ ] Valid certificate (not expired, trusted CA)
- [ ] Certificate matches domain
- [ ] HSTS enabled
- [ ] Auto-renewal configured
- [ ] Expiration monitoring active
- [ ] Private key permissions correct (600)
- [ ] No certificate warnings in browser
