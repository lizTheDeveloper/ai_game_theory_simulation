# VM Blue-Green Deployment Architecture

**Zero-downtime deployments on existing VM infrastructure. No Cloud Run. No Docker. Just systemd, Nginx, and a webhook listener.**

## Architecture Overview

```
GitHub Push (production branch)
    ↓
GitHub Webhook
    ↓
Webhook Listener (systemd service on VM, port 8080)
    ↓
Deploy Script (git pull → npm install → npm build → restart standby service)
    ↓
Health Check (standby service port responds)
    ↓
Nginx Config Switch (atomic: mv active → blue/green upstream)
    ↓
Nginx Reload (zero downtime, graceful worker rotation)
    ↓
Done (old service becomes standby, instant rollback available)
```

## Components

### 1. Blue/Green Services (systemd)

Two identical Next.js services running on different ports:

- **satu-blue.service** - Port 3001
- **satu-green.service** - Port 3002

One is LIVE (serving traffic via Nginx), one is STANDBY (ready for deployment).

### 2. Nginx Reverse Proxy

Routes public traffic (port 80/443) to LIVE service:

```nginx
upstream satu_active {
    server 127.0.0.1:3001;  # Changes to 3002 during deployment
}

server {
    listen 80;
    server_name satu.themultiverse.school;

    location / {
        proxy_pass http://satu_active;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Webhook Listener (systemd)

Listens for GitHub webhooks on port 8080, validates signature, triggers deployment:

```bash
# Webhook listener service (Node.js or Python)
# - Validates GitHub webhook signature (HMAC-SHA256)
# - Checks if push is to 'production' branch
# - Executes deployment script
# - Returns 200 OK or error status
```

### 4. Deployment Script

Atomic deployment process:

```bash
#!/bin/bash
# deploy-vm-blue-green.sh

# 1. Determine current LIVE service
CURRENT=$(readlink /etc/nginx/conf.d/satu-active.conf | grep -o 'blue\|green')
STANDBY=$([ "$CURRENT" = "blue" ] && echo "green" || echo "blue")

# 2. Deploy to STANDBY service
cd /home/user/satu/production-$STANDBY
git pull origin production
npm ci --production
npm run build

# 3. Restart STANDBY service
sudo systemctl restart satu-$STANDBY

# 4. Health check (wait for service ready)
for i in {1..30}; do
    if curl -f http://127.0.0.1:300$([ "$STANDBY" = "blue" ] && echo "1" || echo "2")/api/health; then
        break
    fi
    sleep 2
done

# 5. Switch Nginx upstream (atomic symlink swap)
sudo ln -sf /etc/nginx/upstreams/satu-$STANDBY.conf /etc/nginx/conf.d/satu-active.conf

# 6. Reload Nginx (zero downtime)
sudo nginx -t && sudo systemctl reload nginx

# 7. Log deployment
echo "$(date): Deployed $STANDBY (was: $CURRENT)" >> /var/log/satu-deployments.log
```

## Directory Structure on VM

```
/home/user/satu/
├── production-blue/          # Blue service repo clone
│   ├── .git/
│   ├── src/
│   ├── .next/               # Built artifacts
│   └── package.json
├── production-green/         # Green service repo clone
│   ├── .git/
│   ├── src/
│   ├── .next/
│   └── package.json
├── webhook-listener/         # Webhook service
│   ├── server.js
│   ├── package.json
│   └── .env                 # WEBHOOK_SECRET
└── deployment/
    ├── deploy-vm-blue-green.sh
    ├── rollback-vm.sh
    └── check-status.sh

/etc/systemd/system/
├── satu-blue.service         # Blue Next.js service
├── satu-green.service        # Green Next.js service
└── satu-webhook.service      # Webhook listener

/etc/nginx/
├── upstreams/
│   ├── satu-blue.conf       # upstream { server 127.0.0.1:3001; }
│   └── satu-green.conf      # upstream { server 127.0.0.1:3002; }
└── conf.d/
    └── satu-active.conf → ../upstreams/satu-blue.conf  # Symlink
```

## Service Definitions

### satu-blue.service

```ini
[Unit]
Description=SATU Production Service (Blue)
After=network.target

[Service]
Type=simple
User=user
WorkingDirectory=/home/user/satu/production-blue
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment="NODE_ENV=production"
Environment="PORT=3001"
StandardOutput=append:/var/log/satu-blue.log
StandardError=append:/var/log/satu-blue.log

[Install]
WantedBy=multi-user.target
```

### satu-green.service

```ini
[Unit]
Description=SATU Production Service (Green)
After=network.target

[Service]
Type=simple
User=user
WorkingDirectory=/home/user/satu/production-green
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment="NODE_ENV=production"
Environment="PORT=3002"
StandardOutput=append:/var/log/satu-green.log
StandardError=append:/var/log/satu-green.log

[Install]
WantedBy=multi-user.target
```

### satu-webhook.service

```ini
[Unit]
Description=SATU Webhook Listener
After=network.target

[Service]
Type=simple
User=user
WorkingDirectory=/home/user/satu/webhook-listener
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment="PORT=8080"
EnvironmentFile=/home/user/satu/webhook-listener/.env
StandardOutput=append:/var/log/satu-webhook.log
StandardError=append:/var/log/satu-webhook.log

[Install]
WantedBy=multi-user.target
```

## Webhook Listener Implementation

```javascript
// webhook-listener/server.js
const http = require('http');
const crypto = require('crypto');
const { execSync } = require('child_process');

const PORT = process.env.PORT || 8080;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const DEPLOY_SCRIPT = '/home/user/satu/deployment/deploy-vm-blue-green.sh';

function verifySignature(payload, signature) {
    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/webhook') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                // Verify signature
                const signature = req.headers['x-hub-signature-256'];
                if (!verifySignature(body, signature)) {
                    res.writeHead(401);
                    res.end('Invalid signature');
                    return;
                }

                // Parse payload
                const payload = JSON.parse(body);

                // Check if push to production branch
                if (payload.ref !== 'refs/heads/production') {
                    res.writeHead(200);
                    res.end('Not production branch, ignoring');
                    return;
                }

                console.log(`[${new Date().toISOString()}] Production push detected, deploying...`);

                // Execute deployment script (async, don't wait)
                execSync(DEPLOY_SCRIPT, {
                    stdio: 'inherit',
                    timeout: 600000  // 10 minute timeout
                });

                res.writeHead(200);
                res.end('Deployment triggered');
            } catch (error) {
                console.error('Webhook error:', error);
                res.writeHead(500);
                res.end('Deployment failed: ' + error.message);
            }
        });
    } else if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200);
        res.end('OK');
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, () => {
    console.log(`Webhook listener running on port ${PORT}`);
});
```

## Nginx Configuration

### /etc/nginx/upstreams/satu-blue.conf

```nginx
upstream satu_active {
    server 127.0.0.1:3001;
    keepalive 64;
}
```

### /etc/nginx/upstreams/satu-green.conf

```nginx
upstream satu_active {
    server 127.0.0.1:3002;
    keepalive 64;
}
```

### /etc/nginx/sites-available/satu

```nginx
server {
    listen 80;
    server_name satu.themultiverse.school;

    # Redirect to HTTPS (if SSL configured)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://satu_active;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
    }
}
```

## Deployment Workflow

### Automatic Deployment

1. Push to production branch:
   ```bash
   git checkout main
   git pull origin main
   npm run build && npm test  # Verify locally
   git checkout production
   git merge main
   git push origin production
   ```

2. GitHub webhook triggers listener
3. Listener validates signature, executes deployment script
4. Script deploys to standby service, switches Nginx, done

### Manual Deployment

```bash
# SSH to VM
gcloud compute ssh claude-workspace --zone=europe-west10-a

# Run deployment script
sudo /home/user/satu/deployment/deploy-vm-blue-green.sh
```

### Instant Rollback

```bash
# Rollback script: switch Nginx back to previous service
sudo /home/user/satu/deployment/rollback-vm.sh
```

## Health Checks

### Application Health Endpoint

Add to Next.js app:

```typescript
// src/app/api/health/route.ts
export async function GET() {
    return Response.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: process.env.SERVICE_NAME || 'unknown'
    });
}
```

### System Health Check

```bash
# Check current LIVE service
curl http://127.0.0.1:3001/api/health  # Blue
curl http://127.0.0.1:3002/api/health  # Green

# Check which service is LIVE
CURRENT=$(readlink /etc/nginx/conf.d/satu-active.conf | grep -o 'blue\|green')
echo "LIVE: $CURRENT"

# Check service status
sudo systemctl status satu-blue satu-green satu-webhook
```

## Rollback Implementation

```bash
#!/bin/bash
# rollback-vm.sh

# Determine current LIVE service
CURRENT=$(readlink /etc/nginx/conf.d/satu-active.conf | grep -o 'blue\|green')
PREVIOUS=$([ "$CURRENT" = "blue" ] && echo "green" || echo "blue")

echo "Current LIVE: $CURRENT"
echo "Rolling back to: $PREVIOUS"

# Health check previous service
if ! curl -f http://127.0.0.1:300$([ "$PREVIOUS" = "blue" ] && echo "1" || echo "2")/api/health; then
    echo "❌ ERROR: Previous service ($PREVIOUS) not healthy, cannot rollback"
    exit 1
fi

# Switch Nginx upstream
sudo ln -sf /etc/nginx/upstreams/satu-$PREVIOUS.conf /etc/nginx/conf.d/satu-active.conf

# Reload Nginx
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Rollback complete: $PREVIOUS is now LIVE"
echo "$(date): Rollback to $PREVIOUS (was: $CURRENT)" >> /var/log/satu-deployments.log
```

## Security Considerations

1. **Webhook Secret:** Store in `/home/user/satu/webhook-listener/.env`, restrict permissions:
   ```bash
   chmod 600 /home/user/satu/webhook-listener/.env
   ```

2. **Firewall:** Only allow webhook port (8080) from GitHub IPs (or use Cloudflare tunnel)

3. **Service User:** Run services as unprivileged `user`, not root

4. **Sudo Permissions:** Deployment script needs sudo for Nginx reload:
   ```bash
   # /etc/sudoers.d/satu-deploy
   user ALL=(ALL) NOPASSWD: /usr/sbin/nginx -t, /bin/systemctl reload nginx, /bin/systemctl restart satu-blue, /bin/systemctl restart satu-green
   ```

## Cost Analysis

**VM-based deployment costs:**
- VM running costs: Same as existing (already paid for autonomous workers)
- Additional services: ~200MB RAM each (negligible)
- Nginx: ~10MB RAM (negligible)
- Webhook listener: ~50MB RAM (negligible)

**Total additional cost:** $0/month (uses existing VM infrastructure)

Compare to Cloud Run:
- Cloud Run blue-green: $10-25/month
- VM blue-green: $0/month (infrastructure already exists)

**Devon's assessment:** This is the correct architecture. Cloud Run is for people who outsource thinking to Google.

## Monitoring

```bash
# Service status
sudo systemctl status satu-blue satu-green satu-webhook

# Logs
sudo journalctl -u satu-blue -f
sudo journalctl -u satu-green -f
sudo journalctl -u satu-webhook -f

# Nginx status
sudo systemctl status nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Deployment history
cat /var/log/satu-deployments.log
```

## Setup Checklist

- [ ] Install Nginx on VM
- [ ] Create directory structure (`/home/user/satu/production-{blue,green}`)
- [ ] Clone repo twice (blue + green directories)
- [ ] Build both services (`npm ci && npm run build`)
- [ ] Create systemd service files
- [ ] Create Nginx upstream configs
- [ ] Create webhook listener
- [ ] Configure sudo permissions for deployment script
- [ ] Set up GitHub webhook (point to `http://VM_IP:8080/webhook`)
- [ ] Test deployment script manually
- [ ] Test rollback script
- [ ] Enable systemd services (`systemctl enable satu-{blue,green,webhook}`)
- [ ] Configure firewall for port 8080 (webhook)
- [ ] (Optional) Set up SSL with Let's Encrypt

## Implementation Scripts

See:
- `scripts/vm-blue-green-deploy.sh` - Deployment script
- `scripts/vm-blue-green-rollback.sh` - Rollback script
- `scripts/vm-blue-green-status.sh` - Status check
- `scripts/setup-vm-blue-green.sh` - Initial VM setup
