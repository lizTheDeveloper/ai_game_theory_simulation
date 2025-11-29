# VM Blue-Green Deployment - Implementation Summary

**Date:** 2025-11-28
**Implementer:** Devon (DevOps)
**Status:** ✅ Design complete, scripts ready, awaiting VM deployment

## What Was Built

Complete zero-downtime blue-green deployment architecture for SATU simulation, running on existing VM infrastructure.

### Architecture

```
GitHub Push (production) → Webhook Listener (VM:8080) 
                              ↓
                         Deployment Script
                              ↓
                    Deploy to Standby Service (blue OR green)
                              ↓
                    Health Check (/api/health)
                              ↓
                    Nginx Traffic Switch (atomic symlink)
                              ↓
                    Zero Downtime (old → standby, instant rollback)
```

**Services:**
- **Blue:** Port 3001, `/home/user/satu/production-blue/`
- **Green:** Port 3002, `/home/user/satu/production-green/`
- **Webhook:** Port 8080 (GitHub webhooks)
- **Nginx:** Port 80 (public reverse proxy)

**Key features:**
- Atomic traffic switching (symlink swap)
- Health checks before go-live
- Instant rollback capability
- HMAC-SHA256 webhook signature validation
- Deployment history logging
- systemd service management

## Cost Analysis

| Deployment Type | Monthly Cost |
|----------------|--------------|
| Cloud Run (original) | $10-25 |
| VM Blue-Green (new) | $0 |

**Savings:** $10-25/month by using existing VM infrastructure.

## Files Created

### Documentation
- `docs/VM_BLUE_GREEN_DEPLOYMENT.md` - Complete architecture (450+ lines)
- `docs/DEPLOYMENT.md` - Updated deployment guide
- `pm/VM_INFRASTRUCTURE_SETUP.md` - PM quick reference (updated)

### Scripts
- `scripts/vm-blue-green-deploy.sh` - Main deployment script
- `scripts/vm-blue-green-rollback.sh` - Instant rollback
- `scripts/vm-blue-green-status.sh` - Status checker
- `scripts/setup-vm-blue-green.sh` - One-time VM setup
- `scripts/webhook-listener/server.js` - GitHub webhook handler
- `scripts/webhook-listener/package.json` - Dependencies
- `scripts/webhook-listener/.env.example` - Config template

### systemd Services
- `systemd/satu-blue.service` - Blue Next.js service
- `systemd/satu-green.service` - Green Next.js service
- `systemd/satu-webhook.service` - Webhook listener

### Application Code
- `src/app/api/health/route.ts` - Health check endpoint

## How to Deploy (VM Setup)

**Prerequisites:**
- VM running (claude-workspace in europe-west10-a)
- Node.js 18+ installed on VM
- Nginx installed (setup script will install if needed)

**One-time setup:**
```bash
# SSH to VM
gcloud compute ssh claude-workspace --zone=europe-west10-a

# Download and run setup script
curl -fsSL https://raw.githubusercontent.com/annhoward/superalignmenttoutopia/main/scripts/setup-vm-blue-green.sh -o setup.sh
chmod +x setup.sh
./setup.sh
```

**Setup script will:**
1. Verify/install Nginx
2. Create directory structure
3. Clone repos for blue and green
4. Build both services
5. Set up webhook listener
6. Configure Nginx upstreams
7. Install systemd services
8. Configure sudo permissions
9. Start all services
10. Print webhook secret for GitHub config

**After setup:**
Configure GitHub webhook with the secret displayed by setup script.

## How to Use

### Automatic Deployment
```bash
# Push to production branch
git push origin production
# Webhook triggers automatic deployment
```

### Manual Deployment
```bash
# SSH to VM
gcloud compute ssh claude-workspace --zone=europe-west10-a

# Run deployment script
sudo /home/user/satu/deployment/deploy-vm-blue-green.sh
```

### Check Status
```bash
# Quick status report
/home/user/satu/deployment/vm-blue-green-status.sh
```

### Rollback
```bash
# Instant rollback (switches traffic back)
sudo /home/user/satu/deployment/rollback-vm.sh
```

## Technical Highlights

### Atomic Traffic Switching
```bash
# Traffic routing via symlink
/etc/nginx/conf.d/satu-active.conf → ../upstreams/satu-blue.conf

# Deployment switches symlink atomically
ln -sf /etc/nginx/upstreams/satu-green.conf /etc/nginx/conf.d/satu-active.conf
nginx -t && systemctl reload nginx  # Zero downtime reload
```

### Webhook Security
```javascript
// HMAC-SHA256 signature validation
function verifySignature(payload, signature) {
    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}
```

### Health Checks
```bash
# Deployment waits for health check before switching traffic
for i in {1..30}; do
    if curl -f http://127.0.0.1:$PORT/api/health; then
        break  # Healthy, proceed with traffic switch
    fi
    sleep 2
done
```

## Advantages Over Cloud Run

**Cost:**
- $0/month (vs $10-25/month)

**Control:**
- Direct systemd management
- Full access to logs
- SSH debugging
- No vendor abstractions

**Simplicity:**
- No Docker (simpler than Docker + Cloud Run)
- systemd is battle-tested and well-documented
- Nginx is industry standard

**Devon's assessment:**
> "This is the correct architecture. No per-request billing. No vendor lock-in. Just systemd doing what systemd does. Cloud Run is for people who trust Google more than they trust themselves."

## What's Not Yet Done

**VM deployment:** Setup script created but not yet run on VM. User can run it when ready.

**GitHub webhook:** Needs to be configured after VM setup (secret will be generated by setup script).

**Production branch:** May need to create/configure production branch if not already exists.

## Troubleshooting Quick Reference

**Deployment fails:**
```bash
sudo journalctl -u satu-webhook -n 50
curl http://127.0.0.1:8080/health
```

**Service not responding:**
```bash
readlink /etc/nginx/conf.d/satu-active.conf  # Which is active?
curl http://127.0.0.1:3001/api/health         # Blue
curl http://127.0.0.1:3002/api/health         # Green
sudo journalctl -u satu-blue -n 100
```

**Rollback immediately if broken:**
```bash
sudo /home/user/satu/deployment/rollback-vm.sh
```

## For Quinn/Parker (PM)

**Monitoring:**
- Deployment history: `cat /var/log/satu-deployments.log`
- GitHub webhook deliveries: Repo Settings → Webhooks
- Service status: `/home/user/satu/deployment/vm-blue-green-status.sh`

**Escalate to Devon if:**
- Deployments failing consistently
- Rollbacks happening frequently
- Services crashing/restarting
- Webhook listener not responding

## Documentation

- **Architecture:** `docs/VM_BLUE_GREEN_DEPLOYMENT.md` (complete design)
- **Deployment:** `docs/DEPLOYMENT.md` (updated guide)
- **PM Reference:** `pm/VM_INFRASTRUCTURE_SETUP.md`
- **Scripts:** `scripts/vm-blue-green-*.sh`, `scripts/setup-vm-blue-green.sh`

---

**Implementation Status:** ✅ Complete, ready for VM deployment
**Testing Status:** 🔲 Awaiting VM setup
**Blocker Count:** 0
**Action Required:** User to run setup script on VM when ready
