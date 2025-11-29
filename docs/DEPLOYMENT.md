# Deployment Guide

## Current Deployment Status

**Service:** SATU Simulation
**Platform:** VM-based Blue-Green Deployment (systemd + Nginx)
**VM:** claude-workspace (europe-west10-a)
**URL:** http://satu.themultiverse.school (or VM external IP)
**Last Updated:** 2025-11-28

## Deployment Methods

### Method 1: VM Blue-Green Webhook Deployment (Recommended)

**Zero-downtime deployments with instant rollback on existing VM infrastructure.**

Automatic deployment when pushing to `production` branch:

```bash
# Ensure main branch is ready
git checkout main
git pull origin main

# Verify build passes locally
npm run build
npm test

# Push to production branch (triggers deploy)
git checkout production
git merge main
git push origin production
```

**What happens:**
1. GitHub webhook triggers webhook listener on VM (port 8080)
2. Webhook listener validates signature, executes deployment script
3. Script deploys to standby service (blue or green)
4. Health check validates new deployment (/api/health)
5. Nginx traffic switches to new service (zero downtime, atomic symlink swap)
6. Old service becomes standby (instant rollback available)

**Architecture:** See [`VM_BLUE_GREEN_DEPLOYMENT.md`](./VM_BLUE_GREEN_DEPLOYMENT.md) for complete design

**Quick commands:**
```bash
# Check deployment status (SSH to VM first)
/home/user/satu/deployment/vm-blue-green-status.sh

# Instant rollback
sudo /home/user/satu/deployment/rollback-vm.sh

# View deployment logs
sudo journalctl -u satu-webhook -f
sudo journalctl -u satu-blue -f
sudo journalctl -u satu-green -f
```

### Method 2: Manual VM Deployment

SSH to VM and run deployment script directly:

```bash
# SSH to VM
gcloud compute ssh claude-workspace --zone=europe-west10-a

# Run deployment script
sudo /home/user/satu/deployment/deploy-vm-blue-green.sh
```

**Requirements:**
- VM infrastructure already set up (see setup section below)
- Both blue and green services running
- Nginx configured and running

## Service Configuration

**Blue Service:**
- Port: 3001
- Memory limit: 2Gi (systemd)
- CPU limit: 100%
- Service: satu-blue.service
- Log: /var/log/satu-blue.log

**Green Service:**
- Port: 3002
- Memory limit: 2Gi (systemd)
- CPU limit: 100%
- Service: satu-green.service
- Log: /var/log/satu-green.log

**Webhook Listener:**
- Port: 8080
- Memory limit: 512M (systemd)
- CPU limit: 50%
- Service: satu-webhook.service
- Log: /var/log/satu-webhook.log

**Nginx:**
- Public port: 80 (HTTP)
- Reverse proxy to active service (blue or green)
- Zero-downtime reload on traffic switch

## Cost Analysis

**VM-based deployment costs:**
- VM infrastructure: Already paid for (shared with autonomous workers)
- Additional services: ~500MB RAM total (negligible)
- Nginx: ~10MB RAM (negligible)
- Webhook listener: ~50MB RAM (negligible)

**Total additional cost:** $0/month (uses existing VM infrastructure)

**Compare to Cloud Run:**
- Cloud Run blue-green: $10-25/month
- VM blue-green: $0/month (infrastructure already exists)

**Devon's assessment:** This is the correct architecture. No per-request billing. No vendor lock-in. Just systemd doing what systemd does.

## Initial Setup (One-Time)

**Run this on the VM to set up blue-green infrastructure:**

```bash
# SSH to VM
gcloud compute ssh claude-workspace --zone=europe-west10-a

# Download and run setup script
curl -fsSL https://raw.githubusercontent.com/annhoward/superalignmenttoutopia/main/scripts/setup-vm-blue-green.sh -o setup.sh
chmod +x setup.sh
./setup.sh
```

**What the setup script does:**
1. Installs/verifies prerequisites (Nginx, Node.js)
2. Creates directory structure
3. Clones repos for blue and green services
4. Builds both applications
5. Sets up webhook listener
6. Configures Nginx with upstream routing
7. Installs systemd services
8. Configures sudo permissions for deployment
9. Enables and starts all services
10. Creates GCP firewall rule for webhook port

**After setup, configure GitHub webhook:**
- URL: `http://YOUR_VM_IP:8080/webhook`
- Secret: Displayed at end of setup (also in `/home/user/satu/webhook-listener/.env`)
- Content type: `application/json`
- Events: Just push events
- Branch filter: `production`

## Updating Deployment

**Automatic (recommended):**
```bash
# Push to production branch triggers webhook
git push origin production
```

**Manual (if webhook fails):**
```bash
# SSH to VM
gcloud compute ssh claude-workspace --zone=europe-west10-a

# Run deployment script
sudo /home/user/satu/deployment/deploy-vm-blue-green.sh
```

## Stopping Services (No Additional Cost)

**VM-based deployment has no per-request charges. Services can stay running.**

If you need to stop services temporarily:

```bash
# SSH to VM
gcloud compute ssh claude-workspace --zone=europe-west10-a

# Stop services (but don't disable - easy to restart)
sudo systemctl stop satu-blue satu-green satu-webhook

# Restart when needed
sudo systemctl start satu-blue satu-green satu-webhook
```

**To completely remove deployment:**
```bash
# SSH to VM
gcloud compute ssh claude-workspace --zone=europe-west10-a

# Stop and disable services
sudo systemctl stop satu-blue satu-green satu-webhook
sudo systemctl disable satu-blue satu-green satu-webhook

# Remove service files
sudo rm /etc/systemd/system/satu-*.service
sudo systemctl daemon-reload

# Remove deployment directories (optional - preserves for reinstall)
# rm -rf /home/user/satu/production-{blue,green}
# rm -rf /home/user/satu/webhook-listener
# rm -rf /home/user/satu/deployment
```

## Troubleshooting

### Deployment Fails

**Check webhook listener:**
```bash
sudo journalctl -u satu-webhook -n 50 --no-pager
curl http://127.0.0.1:8080/health
```

**Check service health:**
```bash
curl http://127.0.0.1:3001/api/health  # Blue
curl http://127.0.0.1:3002/api/health  # Green
```

**Check service status:**
```bash
sudo systemctl status satu-blue satu-green satu-webhook
```

**Check service logs:**
```bash
sudo journalctl -u satu-blue -n 100 --no-pager
sudo journalctl -u satu-green -n 100 --no-pager
```

### Service Not Responding

**Check Nginx:**
```bash
sudo systemctl status nginx
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

**Check which service is active:**
```bash
readlink /etc/nginx/conf.d/satu-active.conf
```

**Test services directly:**
```bash
# Test blue service
curl http://127.0.0.1:3001/

# Test green service
curl http://127.0.0.1:3002/

# Test via Nginx
curl http://localhost/
```

### Webhook Not Triggering

**Verify webhook secret matches:**
```bash
cat /home/user/satu/webhook-listener/.env | grep WEBHOOK_SECRET
```

**Check GitHub webhook deliveries:**
- Go to repo settings → Webhooks
- Click on webhook
- Check "Recent Deliveries" tab
- Look for response codes (200 = success, 401 = bad signature)

**Test webhook manually:**
```bash
# Generate test signature
echo -n '{"ref":"refs/heads/production"}' | openssl dgst -sha256 -hmac "YOUR_SECRET"

# Send test webhook
curl -X POST http://YOUR_VM_IP:8080/webhook \
  -H "X-Hub-Signature-256: sha256=YOUR_SIGNATURE" \
  -H "X-GitHub-Event: push" \
  -H "Content-Type: application/json" \
  -d '{"ref":"refs/heads/production","commits":[]}'
```

## Production Branch Strategy

**Main branch:** Development and testing
**Production branch:** Live deployment trigger

Workflow:
1. Develop/fix on feature branches
2. Merge to `main` when ready
3. Test on main
4. Merge main → production when stable
5. Push production branch to deploy

This prevents accidental deployments from WIP commits.

## Environment Variables

Cloud Run service doesn't require environment variables for basic operation. If needed in future:

```bash
gcloud run services update superalignment-simulation \
  --region europe-west1 \
  --set-env-vars KEY=value
```

## Monitoring Service Health

**Quick status check:**
```bash
/home/user/satu/deployment/vm-blue-green-status.sh
```

**Service logs:**
```bash
# Real-time logs
sudo journalctl -u satu-blue -f
sudo journalctl -u satu-green -f
sudo journalctl -u satu-webhook -f

# Recent logs
sudo journalctl -u satu-blue -n 100 --no-pager
sudo journalctl -u satu-green -n 100 --no-pager

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

**Deployment history:**
```bash
cat /var/log/satu-deployments.log
```

**Resource usage:**
```bash
# Memory usage
free -h

# Disk usage
df -h /home/user/satu

# Process list
ps aux | grep -E 'node|nginx'
```

## Public Access

**URL options:**

1. **Direct IP (immediate):**
   ```bash
   # Get VM external IP
   gcloud compute instances describe claude-workspace \
     --zone=europe-west10-a \
     --format="get(networkInterfaces[0].accessConfigs[0].natIP)"
   ```
   Share: `http://YOUR_VM_IP/`

2. **Custom domain (recommended):**
   - Point DNS A record to VM external IP
   - Example: `satu.themultiverse.school` → `34.32.105.178`
   - Update Nginx config with `server_name satu.themultiverse.school;`

3. **SSL/TLS (optional):**
   ```bash
   # Install certbot
   sudo apt-get install certbot python3-certbot-nginx

   # Get certificate
   sudo certbot --nginx -d satu.themultiverse.school
   ```

**Firewall note:** Port 80 (HTTP) already open. Port 443 (HTTPS) also open if using SSL.
