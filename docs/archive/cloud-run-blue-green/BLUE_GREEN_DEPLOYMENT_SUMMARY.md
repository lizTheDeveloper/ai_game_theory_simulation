# Blue-Green Webhook Deployment - Implementation Summary

**Completed:** 2025-11-28
**Implemented by:** Devon (DevOps)

## What Was Built

A **zero-downtime blue-green deployment system** for Google Cloud Run, triggered by GitHub webhooks.

**Replaces:** GitHub Actions deployment (which had downtime and slow rollback)

**Advantages:**
- ✅ Zero downtime during deployments
- ✅ Instant rollback (<5 seconds)
- ✅ No dependency on GitHub Actions
- ✅ Health checks before traffic switch
- ✅ HMAC signature validation for security

## Architecture

### Three Cloud Run Services

1. **satu-blue** - Production environment A
2. **satu-green** - Production environment B
3. **satu-webhook** - Webhook listener (orchestrates deployments)

### Deployment Flow

```
git push origin production
  ↓
GitHub sends webhook to satu-webhook
  ↓
Webhook validates HMAC signature
  ↓
Determines current LIVE service (e.g., blue)
  ↓
Deploys to STANDBY service (e.g., green)
  ↓
Health check on green
  ↓
Switch LIVE tag to green (instant, zero downtime)
  ↓
Blue becomes new standby
```

### Rollback Flow

```
./scripts/rollback.sh satu-blue
  ↓
Switch LIVE tag back to blue (<5 seconds)
```

No rebuild, no redeploy - just tag reassignment.

## Files Created

### Webhook Listener Service

**Location:** `/webhook-listener/`

- `index.js` - Node.js webhook listener server
  - Validates GitHub webhook signatures (HMAC SHA-256)
  - Determines current LIVE service
  - Deploys to standby service
  - Runs health checks
  - Switches traffic
  - Logs full deployment status

- `package.json` - Node.js package metadata
- `Dockerfile` - Container image (includes gcloud CLI)
- `.dockerignore` - Build exclusions

**Key features:**
- HMAC signature validation (prevents unauthorized deployments)
- Health check before traffic switch (prevents deploying broken code)
- Async deployment (responds immediately to webhook, deploys in background)
- Graceful shutdown (SIGTERM handling)

### Deployment Scripts

**Location:** `/scripts/`

1. **deploy-webhook-listener.sh** - Deploy webhook listener to Cloud Run
   - Creates service account with deployment permissions
   - Deploys webhook service
   - Outputs webhook URL for GitHub configuration

2. **initial-blue-green-setup.sh** - Initial setup (run once)
   - Deploys satu-blue service (tagged LIVE)
   - Deploys satu-green service (tagged staging)
   - Verifies both services are healthy

3. **rollback.sh** - Instant rollback
   - Switches LIVE tag to specified service
   - Confirmation prompt (prevents accidents)
   - Sub-5-second execution

4. **check-deployment-status.sh** - Status dashboard
   - Shows which service is LIVE
   - Shows which service is standby
   - Service URLs and revision info
   - Recent webhook activity
   - Quick action commands

### Documentation

**Location:** `/docs/`

1. **BLUE_GREEN_DEPLOYMENT.md** - Complete guide (comprehensive)
   - Architecture explanation
   - Initial setup instructions
   - Usage patterns
   - Troubleshooting
   - Security details
   - Cost analysis
   - Advanced usage

2. **BLUE_GREEN_QUICK_REFERENCE.md** - One-page cheat sheet
   - Common commands
   - Troubleshooting quick fixes
   - Emergency recovery
   - URL lookups

3. **DEPLOYMENT.md** - Updated with blue-green as primary method

## Setup Instructions

### One-Time Setup

```bash
# 1. Generate webhook secret
export GITHUB_WEBHOOK_SECRET=$(openssl rand -hex 32)
echo "Save this: $GITHUB_WEBHOOK_SECRET"

# 2. Deploy webhook listener
./scripts/deploy-webhook-listener.sh

# 3. Deploy blue and green services
./scripts/initial-blue-green-setup.sh

# 4. Configure GitHub webhook
# Go to repo → Settings → Webhooks → Add webhook
# - URL: https://satu-webhook-*.run.app/webhook
# - Secret: <your GITHUB_WEBHOOK_SECRET>
# - Content type: application/json
# - Events: Just the push event
# - Active: ✅
```

### Daily Usage

```bash
# Deploy to production
git push origin production

# Check status
./scripts/check-deployment-status.sh

# Rollback if needed
./scripts/rollback.sh satu-blue  # or satu-green

# View logs
gcloud run services logs tail satu-webhook --region europe-west1
```

## Security Features

### Webhook Signature Validation

**All webhook requests are validated using HMAC SHA-256.**

```javascript
const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
const digest = 'sha256=' + hmac.update(payload).digest('hex');
const valid = crypto.timingSafeEqual(signature, digest);
```

**Without validation:** Anyone could trigger deployments by sending POST to webhook URL.
**With validation:** Only requests signed by GitHub (using shared secret) are accepted.

### Service Account Permissions

**Webhook listener service account has minimum required permissions:**
- `roles/run.admin` - Deploy Cloud Run services
- `roles/cloudbuild.builds.editor` - Build container images
- `roles/iam.serviceAccountUser` - Act as service accounts

**Principle of least privilege:** Cannot access other GCP resources.

## Cost Analysis

**Blue-green cost comparison:**

| Item | Single Service | Blue-Green |
|------|---------------|------------|
| Primary service | $10-25/month | $6-15/month (blue) |
| Standby service | N/A | $6-15/month (green, mostly idle) |
| Webhook listener | N/A | $1-2/month (mostly idle) |
| **Total** | **$10-25/month** | **$12-30/month** |

**Cost increase:** ~20-30% (worth it for zero downtime + instant rollback)

**Why standby is cheap:** Min instances = 0, scales to zero when idle. Only uses resources during deployments and occasional health checks.

## Technical Details

### Cloud Run Revision Tags

**How instant rollback works:**

Cloud Run services can have multiple revisions (versions). Each revision can be tagged.

- `LIVE` tag → Receives 100% of traffic (main production URL)
- `staging` tag → Receives 0% traffic (standby)

**Switching traffic:**
```bash
# Remove LIVE from old service
gcloud run services update-traffic satu-blue --remove-tags LIVE

# Add LIVE to new service
gcloud run services update-traffic satu-green --to-latest --tag LIVE
```

**Why it's instant:** Cloud Run handles cutover gracefully. No redeploy needed.

### Health Check Implementation

**Before switching traffic, webhook listener validates new deployment:**

```javascript
const response = await fetch(`${serviceUrl}/`);
if (response.status === 200) {
  switchTraffic(newService);  // Safe to proceed
} else {
  throw new Error('Health check failed - deployment aborted');
}
```

**If health check fails:** Deployment aborts, traffic stays on old service.

### Deterministic Deployment

**Git commit SHA ensures reproducibility:**

```javascript
const commitSha = payload.after;  // From GitHub webhook

// Clone specific commit
git clone ${REPO_URL} .
git checkout ${commitSha}

// Deploy exact commit (not floating "latest")
gcloud run deploy ${serviceName} --source .
```

**Why this matters:** Can deploy any historical commit, not just HEAD.

## Advantages Over GitHub Actions

| Feature | GitHub Actions | Blue-Green Webhook |
|---------|---------------|-------------------|
| Downtime | ~30 seconds | 0 seconds |
| Rollback time | 5-10 minutes (redeploy) | <5 seconds (tag switch) |
| Reliability | Depends on GitHub | Self-hosted on GCP |
| Control | Limited (YAML workflow) | Full control (custom code) |
| Health checks | Limited | Custom validation |
| Deployment logs | GitHub UI only | Cloud Run logs + custom |
| Cost | Free (Actions minutes) | $12-30/month |

## Operational Runbook

### Normal Deployment

```bash
# 1. Merge to main
git checkout main
git pull origin main

# 2. Run tests locally
npm test
npm run build

# 3. Deploy to production
git checkout production
git merge main
git push origin production

# 4. Monitor deployment
gcloud run services logs tail satu-webhook --region europe-west1

# 5. Verify new service is LIVE
./scripts/check-deployment-status.sh
```

### Rollback Procedure

**Symptoms:** New deployment has bugs, errors, performance issues

**Action:**
```bash
# 1. Check current state
./scripts/check-deployment-status.sh

# 2. Identify standby service (the one that was LIVE before)
# Output shows: "LIVE: satu-green, STANDBY: satu-blue"

# 3. Rollback to standby
./scripts/rollback.sh satu-blue

# 4. Verify rollback succeeded
./scripts/check-deployment-status.sh

# 5. Investigate issue
gcloud run services logs tail satu-green --region europe-west1
```

**Time to rollback:** <30 seconds (including confirmation prompt)

### Emergency Recovery

**Scenario:** Both blue and green services are down.

**Recovery:**
```bash
# 1. Redeploy both services
./scripts/initial-blue-green-setup.sh

# 2. Verify health
./scripts/check-deployment-status.sh

# 3. If still broken, check logs
gcloud run services logs read satu-blue --region europe-west1 --limit 100
```

## Monitoring

### Deployment Monitoring

```bash
# Real-time webhook logs
gcloud run services logs tail satu-webhook --region europe-west1

# Recent deployments
gcloud run services logs read satu-webhook --region europe-west1 --limit 50 | grep "DEPLOYMENT"
```

### Application Monitoring

```bash
# LIVE service logs
LIVE_SERVICE=$(./scripts/check-deployment-status.sh | grep "LIVE:" | awk '{print $2}')
gcloud run services logs tail $LIVE_SERVICE --region europe-west1

# Error logs only
gcloud run services logs read $LIVE_SERVICE --region europe-west1 | grep "ERROR"
```

### Health Checks

```bash
# Webhook listener health
curl https://satu-webhook-*.run.app/health

# Blue service health
BLUE_URL=$(gcloud run services describe satu-blue --region europe-west1 --format="value(status.url)")
curl -I $BLUE_URL

# Green service health
GREEN_URL=$(gcloud run services describe satu-green --region europe-west1 --format="value(status.url)")
curl -I $GREEN_URL
```

## Future Improvements

**Potential enhancements (not implemented):**

1. **Gradual traffic migration** - Shift traffic 10% → 50% → 100% instead of instant cutover
2. **Automated rollback** - Auto-rollback if error rate spikes after deployment
3. **Slack/Discord notifications** - Send deployment status to team chat
4. **Deployment metrics** - Track deployment frequency, success rate, rollback rate
5. **Pre-deployment testing** - Run integration tests against staging tag before switching
6. **Canary deployments** - Send 5% traffic to new version, monitor, then full cutover

## Migration from Legacy Deployment

**If you have existing single-service deployment:**

```bash
# 1. Set up blue-green (parallel to existing)
export GITHUB_WEBHOOK_SECRET=$(openssl rand -hex 32)
./scripts/deploy-webhook-listener.sh
./scripts/initial-blue-green-setup.sh

# 2. Configure GitHub webhook

# 3. Test deployment
git push origin production

# 4. Verify blue-green works
./scripts/check-deployment-status.sh

# 5. Delete old service (once confident)
gcloud run services delete superalignment-simulation --region europe-west1
```

## Lessons Learned

1. **Cloud Run tags are powerful** - Enable instant traffic switching without redeploy
2. **HMAC validation is critical** - Webhook endpoints without signature validation are a security risk
3. **Health checks prevent bad deploys** - Always validate before switching traffic
4. **Standby cost is negligible** - Min instances = 0 means standby is nearly free
5. **Rollback should be instant** - 5-second rollback vs 5-minute redeploy is game-changing

## References

- **Full documentation:** [`docs/BLUE_GREEN_DEPLOYMENT.md`](./docs/BLUE_GREEN_DEPLOYMENT.md)
- **Quick reference:** [`docs/BLUE_GREEN_QUICK_REFERENCE.md`](./docs/BLUE_GREEN_QUICK_REFERENCE.md)
- **Deployment guide:** [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)
- **Webhook listener code:** [`webhook-listener/index.js`](./webhook-listener/index.js)

---

**Built by Devon** - "Blue-green deployment: because production outages are for people who don't plan ahead."

**Status:** ✅ Ready for production use
**Setup time:** ~15 minutes (one-time)
**Deployment time:** 5-10 minutes (zero downtime)
**Rollback time:** <5 seconds
