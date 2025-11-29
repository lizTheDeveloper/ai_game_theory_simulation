# Blue-Green Deployment Guide

**Zero-downtime deployments with instant rollback capability.**

Replaces GitHub Actions with a webhook-based blue-green deployment system on Google Cloud Run.

## Architecture

### Services

**Three Cloud Run services:**

1. **satu-blue** - Production environment A
2. **satu-green** - Production environment B
3. **satu-webhook** - Webhook listener (orchestrates deployments)

**Traffic routing:** Only ONE service has the `LIVE` tag (receives 100% traffic). The other is `staging` (standby).

**Deployment flow:**
```
GitHub push to production branch
  ↓
Webhook listener receives event
  ↓
Determines current LIVE service (e.g., blue)
  ↓
Deploys to STANDBY service (e.g., green)
  ↓
Health check on green
  ↓
Switch LIVE tag to green (instant cutover)
  ↓
Blue becomes new standby
```

**Rollback flow:**
```
./scripts/rollback.sh satu-blue
  ↓
Switch LIVE tag back to blue (instant)
```

## Initial Setup

### 1. Generate Webhook Secret

```bash
# Generate a secure random secret
openssl rand -hex 32

# Save it (you'll need it for both deployment and GitHub)
export GITHUB_WEBHOOK_SECRET='your-generated-secret-here'
```

**IMPORTANT:** Save this secret somewhere secure. You need it for:
- Deploying the webhook listener
- Configuring the GitHub webhook

### 2. Deploy Webhook Listener

```bash
# Set environment variables
export GITHUB_WEBHOOK_SECRET='your-secret-here'
export GCP_PROJECT_ID='multiverseschool'
export GCP_REGION='europe-west1'

# Deploy webhook listener service
./scripts/deploy-webhook-listener.sh
```

This creates:
- `satu-webhook` Cloud Run service
- Service account with deployment permissions
- Webhook endpoint at `https://satu-webhook-*.run.app/webhook`

**Output:** Note the webhook URL - you'll configure it in GitHub.

### 3. Initial Blue-Green Setup

```bash
# Deploy both blue and green services
./scripts/initial-blue-green-setup.sh
```

This creates:
- `satu-blue` service (tagged LIVE, receives traffic)
- `satu-green` service (tagged staging, standby)

**Only run this once.** After initial setup, deployments happen via webhook.

### 4. Configure GitHub Webhook

Go to your GitHub repo → Settings → Webhooks → Add webhook

**Webhook configuration:**
- **Payload URL:** `https://satu-webhook-*.run.app/webhook` (from step 2)
- **Content type:** `application/json`
- **Secret:** Your `GITHUB_WEBHOOK_SECRET` from step 1
- **Events:** Select "Just the push event"
- **Active:** ✅ Checked

**Test:** Click "Test" in GitHub webhook settings (should return 202 Accepted).

## Usage

### Triggering Deployment

```bash
# Merge changes to production branch
git checkout production
git merge main
git push origin production
```

**What happens:**
1. GitHub sends webhook POST to listener
2. Listener validates HMAC signature
3. Determines current LIVE service
4. Deploys to STANDBY service
5. Runs health check
6. Switches LIVE tag (zero downtime)
7. Logs full deployment status

**Monitoring deployment:**
```bash
# Watch webhook logs in real-time
gcloud run services logs tail satu-webhook --region europe-west1

# Check deployment status
./scripts/check-deployment-status.sh
```

### Checking Status

```bash
./scripts/check-deployment-status.sh
```

**Output:**
- Current LIVE service (blue or green)
- Current STANDBY service
- Service URLs
- Recent deployment activity
- Quick action commands

### Rollback (Instant)

```bash
# Roll back to blue
./scripts/rollback.sh satu-blue

# Roll back to green
./scripts/rollback.sh satu-green
```

**Rollback is instant** - just switches the LIVE tag. No rebuild, no redeploy.

**When to rollback:**
- New deployment has bugs
- Performance regression detected
- Any production issue with recent deploy

## How It Works

### Webhook Validation

**Security:** Every webhook request is validated using HMAC SHA-256 signature.

```javascript
// Listener validates GitHub's signature
const signature = request.headers['x-hub-signature-256'];
const valid = validateHMAC(payload, signature, WEBHOOK_SECRET);

if (!valid) {
  return 401 Unauthorized;  // Reject invalid requests
}
```

**Why this matters:** Without signature validation, anyone who knows your webhook URL could trigger deployments. HMAC prevents this.

### Blue-Green Switching

**Cloud Run revision tags:**
- `LIVE` tag = receives 100% traffic (main production URL)
- `staging` tag = no traffic (standby)

**Switching process:**
```bash
# Remove LIVE from old service
gcloud run services update-traffic satu-blue --remove-tags LIVE

# Add LIVE to new service (100% traffic)
gcloud run services update-traffic satu-green --to-latest --tag LIVE
```

**Zero downtime:** Cloud Run handles the cutover gracefully. Existing connections drain, new connections go to new service.

### Health Checks

**Before switching traffic, listener verifies new deployment is healthy:**

```javascript
const response = await fetch(`${serviceUrl}/`);
if (response.status === 200) {
  switchTraffic(newService);
} else {
  throw new Error('Health check failed - deployment aborted');
}
```

**If health check fails:** Deployment aborts, LIVE traffic stays on old service.

## Troubleshooting

### Webhook Not Triggering

**Check GitHub webhook delivery:**
- Go to repo → Settings → Webhooks → Recent Deliveries
- Click on delivery to see request/response
- Look for HTTP 200/202 (success) or errors

**Common issues:**
- ❌ Wrong webhook URL (check `./scripts/check-deployment-status.sh`)
- ❌ Wrong secret (redeploy webhook listener with correct secret)
- ❌ Webhook not configured for "push" events
- ❌ Pushing to wrong branch (must be `production`)

**Test webhook manually:**
```bash
# Get webhook URL
WEBHOOK_URL=$(gcloud run services describe satu-webhook \
  --region europe-west1 \
  --format="value(status.url)")

# Health check (should return "OK")
curl ${WEBHOOK_URL}/health

# Check webhook logs
gcloud run services logs tail satu-webhook --region europe-west1
```

### Deployment Fails

**Check webhook logs:**
```bash
gcloud run services logs read satu-webhook \
  --region europe-west1 \
  --limit 100
```

**Common issues:**
- ❌ Service account lacks permissions (redeploy webhook listener)
- ❌ Build timeout (increase timeout in webhook listener)
- ❌ Out of disk space during build (increase memory)
- ❌ Git clone fails (check repo URL is correct)

**Manual override:**
If webhook deployment fails, deploy manually:
```bash
# Deploy directly to blue
gcloud run deploy satu-blue --source . --region europe-west1

# Or green
gcloud run deploy satu-green --source . --region europe-west1
```

### Health Check Fails

**Symptoms:** Deployment completes but traffic doesn't switch.

**Diagnosis:**
```bash
# Check service logs
gcloud run services logs tail satu-green --region europe-west1

# Test URL directly
GREEN_URL=$(gcloud run services describe satu-green \
  --region europe-west1 \
  --format="value(status.url)")

curl -v $GREEN_URL
```

**Common causes:**
- ❌ Service not responding on port 3333
- ❌ Service crashes on startup
- ❌ Build succeeded but runtime fails
- ❌ Missing environment variables

**Fix:** Check service logs for errors, fix code, push again.

### Both Services Down

**Emergency recovery:**

```bash
# Deploy directly to blue (bypass webhook)
./scripts/initial-blue-green-setup.sh

# Or manual deploy
gcloud run deploy satu-blue \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated
```

### Wrong Service Is LIVE

**Check status:**
```bash
./scripts/check-deployment-status.sh
```

**Switch to correct service:**
```bash
# Make blue LIVE
./scripts/rollback.sh satu-blue

# Or make green LIVE
./scripts/rollback.sh satu-green
```

## Service Management

### View Logs

```bash
# Webhook listener logs (deployment activity)
gcloud run services logs tail satu-webhook --region europe-west1

# Blue service logs (application)
gcloud run services logs tail satu-blue --region europe-west1

# Green service logs (application)
gcloud run services logs tail satu-green --region europe-west1
```

### Update Service Configuration

```bash
# Increase memory on blue service
gcloud run services update satu-blue \
  --region europe-west1 \
  --memory 4Gi

# Increase max instances on green service
gcloud run services update satu-green \
  --region europe-west1 \
  --max-instances 20
```

**Note:** Configuration changes don't trigger deployment. They update the service in place.

### Delete Services (Stop All Costs)

```bash
# Delete all services
gcloud run services delete satu-blue --region europe-west1 --quiet
gcloud run services delete satu-green --region europe-west1 --quiet
gcloud run services delete satu-webhook --region europe-west1 --quiet

# Delete service account
gcloud iam service-accounts delete satu-deployer@multiverseschool.iam.gserviceaccount.com --quiet
```

## Cost Optimization

**Blue-Green cost:** Two production services (blue + green) instead of one.

**Mitigation:**
- `min-instances: 0` - Both scale to zero when idle
- Only LIVE service receives traffic (standby rarely runs)
- Webhook listener scales to zero between deployments

**Typical costs:**
- **Single service:** $10-25/month
- **Blue-green:** $12-30/month (20-30% increase)
- **Webhook listener:** $1-2/month (mostly idle)

**Why the cost increase is small:** Standby service rarely runs (zero traffic). Only uses resources during deployments and occasional health checks.

## Security

### Webhook Signature Validation

**Every webhook request is validated:**
```javascript
const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
const digest = 'sha256=' + hmac.update(payload).digest('hex');
const valid = crypto.timingSafeEqual(signature, digest);
```

**Without validation:** Anyone could send POST to `/webhook` and trigger deployments.

**With validation:** Only requests signed by GitHub (using shared secret) are accepted.

### Service Account Permissions

**Webhook listener service account has:**
- `roles/run.admin` - Deploy Cloud Run services
- `roles/cloudbuild.builds.editor` - Build container images
- `roles/iam.serviceAccountUser` - Act as service accounts

**Principle of least privilege:** Service account can ONLY deploy Cloud Run services, not access other GCP resources.

### Public vs Private Services

**Current configuration:** All services are publicly accessible (`--allow-unauthenticated`).

**Why:** Public game/dashboard - needs unauthenticated access.

**Alternative (if you need auth):**
```bash
# Deploy with authentication required
gcloud run deploy satu-blue \
  --region europe-west1 \
  --no-allow-unauthenticated
```

## Comparison: Blue-Green vs GitHub Actions

| Feature | GitHub Actions | Blue-Green Webhook |
|---------|---------------|-------------------|
| **Deployment time** | 5-10 minutes | 5-10 minutes |
| **Downtime** | ~30 seconds | 0 seconds |
| **Rollback time** | 5-10 minutes (redeploy) | <5 seconds (tag switch) |
| **Reliability** | Depends on GitHub | Self-hosted on GCP |
| **Cost** | Free (Actions minutes) | $12-30/month (2 services) |
| **Complexity** | Low (YAML config) | Medium (webhook + scripts) |
| **Control** | Limited | Full control |

**When to use GitHub Actions:**
- Simple deployments
- Downtime acceptable
- Limited budget

**When to use Blue-Green:**
- Zero downtime required
- Instant rollback needed
- Don't want GitHub dependency

## Advanced Usage

### Custom Health Checks

**Current:** Basic HTTP 200 check on `/`

**Improve:** Add dedicated health endpoint:

```typescript
// src/app/api/health/route.ts
export async function GET() {
  // Check database connection
  // Check external dependencies
  // Return 200 only if healthy
  return Response.json({ status: 'healthy' });
}
```

**Update webhook listener:**
```javascript
const response = await fetch(`${serviceUrl}/api/health`);
```

### Gradual Traffic Migration

**Current:** Instant cutover (0% → 100%)

**Alternative:** Gradual shift (0% → 10% → 50% → 100%)

```bash
# Send 10% traffic to green
gcloud run services update-traffic satu-green \
  --region europe-west1 \
  --to-latest=10

# Monitor error rates, then increase
gcloud run services update-traffic satu-green \
  --to-latest=50

# Full cutover
gcloud run services update-traffic satu-green \
  --to-latest=100
```

### Automated Rollback

**Current:** Manual rollback

**Improve:** Auto-rollback if error rate spikes:

```javascript
// In webhook listener, after deployment
const errorRate = await monitorErrors(newService, duration=5min);
if (errorRate > threshold) {
  await switchTraffic(oldService);  // Auto-rollback
}
```

### Deployment Notifications

**Add to webhook listener:**
```javascript
// After successful deployment
await notifySlack({
  message: `✅ Deployed to ${newService}`,
  url: liveUrl
});

// After failed deployment
await notifySlack({
  message: `❌ Deployment failed: ${error}`,
  priority: 'high'
});
```

## Migrating from GitHub Actions

**If you have existing GitHub Actions workflow:**

1. **Disable workflow:**
   ```bash
   # Rename to disable
   mv .github/workflows/deploy.yml .github/workflows/deploy.yml.disabled
   ```

2. **Set up blue-green:**
   ```bash
   # Follow "Initial Setup" section above
   ./scripts/deploy-webhook-listener.sh
   ./scripts/initial-blue-green-setup.sh
   ```

3. **Configure webhook:** (see step 4 in Initial Setup)

4. **Test deployment:**
   ```bash
   git push origin production
   # Watch logs to verify
   ```

5. **Delete Actions workflow:**
   ```bash
   rm .github/workflows/deploy.yml.disabled
   ```

## Reference

### Environment Variables

**Webhook listener:**
- `GITHUB_WEBHOOK_SECRET` - Webhook HMAC secret (required)
- `GCP_PROJECT_ID` - GCP project (default: multiverseschool)
- `GCP_REGION` - GCP region (default: europe-west1)
- `PORT` - HTTP port (default: 8080)
- `REPO_URL` - Git repository URL

### Service Names

- `satu-blue` - Blue production service
- `satu-green` - Green production service
- `satu-webhook` - Webhook listener service

### Cloud Run Tags

- `LIVE` - Receives 100% production traffic
- `staging` - Standby (no traffic)

### Scripts

- `scripts/deploy-webhook-listener.sh` - Deploy webhook service
- `scripts/initial-blue-green-setup.sh` - Initial blue/green setup
- `scripts/rollback.sh` - Instant rollback
- `scripts/check-deployment-status.sh` - Check current state

---

**Built by Devon (DevOps)** - "Blue-green deployment: because 'hope the deploy works' is not a strategy."
