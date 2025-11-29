# Blue-Green Deployment - Quick Reference

**One-page cheat sheet for common operations.**

## Setup (Once)

```bash
# 1. Generate secret
export GITHUB_WEBHOOK_SECRET=$(openssl rand -hex 32)
echo "Save this: $GITHUB_WEBHOOK_SECRET"

# 2. Deploy webhook listener
./scripts/deploy-webhook-listener.sh

# 3. Deploy blue and green services
./scripts/initial-blue-green-setup.sh

# 4. Configure GitHub webhook
# Repo → Settings → Webhooks → Add webhook
# URL: https://satu-webhook-*.run.app/webhook
# Secret: <your GITHUB_WEBHOOK_SECRET>
# Events: Just push event
```

## Daily Operations

### Deploy to Production

```bash
git checkout production
git merge main
git push origin production

# Monitor deployment
gcloud run services logs tail satu-webhook --region europe-west1
```

### Check Status

```bash
./scripts/check-deployment-status.sh
```

### Rollback (Instant)

```bash
# Rollback to blue
./scripts/rollback.sh satu-blue

# Rollback to green
./scripts/rollback.sh satu-green
```

### View Logs

```bash
# Webhook deployment logs
gcloud run services logs tail satu-webhook --region europe-west1

# Blue application logs
gcloud run services logs tail satu-blue --region europe-west1

# Green application logs
gcloud run services logs tail satu-green --region europe-west1
```

## Architecture

```
GitHub push to production
  ↓
Webhook listener (satu-webhook)
  ↓
Deploy to standby service
  ↓
Health check
  ↓
Switch LIVE tag (zero downtime)
```

**Services:**
- `satu-blue` - Production environment A
- `satu-green` - Production environment B
- `satu-webhook` - Webhook listener

**Tags:**
- `LIVE` - Receives 100% traffic
- `staging` - Standby (no traffic)

## Troubleshooting

**Deployment not triggering?**
```bash
# Check webhook health
curl https://satu-webhook-*.run.app/health

# Check GitHub webhook deliveries
# Repo → Settings → Webhooks → Recent Deliveries
```

**Deployment failed?**
```bash
# Check logs
gcloud run services logs read satu-webhook --region europe-west1 --limit 100

# Manual override
gcloud run deploy satu-green --source . --region europe-west1
./scripts/rollback.sh satu-green
```

**Wrong service is LIVE?**
```bash
# Check current state
./scripts/check-deployment-status.sh

# Switch to correct service
./scripts/rollback.sh satu-blue  # or satu-green
```

## URLs

**Get current LIVE URL:**
```bash
./scripts/check-deployment-status.sh | grep "Public URL"
```

**Get all service URLs:**
```bash
gcloud run services describe satu-blue --region europe-west1 --format="value(status.url)"
gcloud run services describe satu-green --region europe-west1 --format="value(status.url)"
gcloud run services describe satu-webhook --region europe-west1 --format="value(status.url)"
```

## Emergency Recovery

**Both services down?**
```bash
./scripts/initial-blue-green-setup.sh
```

**Webhook listener down?**
```bash
export GITHUB_WEBHOOK_SECRET='your-secret-here'
./scripts/deploy-webhook-listener.sh
```

**Nuclear option (full reset):**
```bash
# Delete everything
gcloud run services delete satu-blue --region europe-west1 --quiet
gcloud run services delete satu-green --region europe-west1 --quiet
gcloud run services delete satu-webhook --region europe-west1 --quiet

# Redeploy from scratch
./scripts/deploy-webhook-listener.sh
./scripts/initial-blue-green-setup.sh
```

## Configuration

**Environment variables (webhook listener):**
- `GITHUB_WEBHOOK_SECRET` - HMAC secret for webhook validation
- `GCP_PROJECT_ID` - GCP project (default: multiverseschool)
- `GCP_REGION` - GCP region (default: europe-west1)

**Service configuration (blue/green):**
- Memory: 2Gi
- CPU: 1 vCPU
- Max instances: 10
- Min instances: 0 (scales to zero)
- Port: 3333
- Timeout: 300s

## Cost

**Typical monthly costs:**
- Blue service: $6-15
- Green service: $6-15 (mostly idle)
- Webhook listener: $1-2 (mostly idle)
- **Total: $12-30/month**

**Cost vs single service:** ~20-30% increase (worth it for zero downtime)

## Security

**Webhook signature validation:** All webhook requests validated with HMAC SHA-256

**Service account permissions:**
- `roles/run.admin` - Deploy Cloud Run services
- `roles/cloudbuild.builds.editor` - Build images
- `roles/iam.serviceAccountUser` - Act as service accounts

**Public access:** Services allow unauthenticated access (public dashboard)

## Documentation

- **Full guide:** [`docs/BLUE_GREEN_DEPLOYMENT.md`](./BLUE_GREEN_DEPLOYMENT.md)
- **General deployment:** [`docs/DEPLOYMENT.md`](./DEPLOYMENT.md)

---

**Built by Devon** - "Rollback time: <5 seconds. Your manager's panic: also <5 seconds."
