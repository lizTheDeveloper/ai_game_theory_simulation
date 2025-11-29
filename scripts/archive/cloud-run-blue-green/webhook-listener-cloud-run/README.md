# Webhook Listener

**GitHub webhook listener for blue-green deployment to Google Cloud Run.**

This service receives webhooks from GitHub, validates signatures, and orchestrates zero-downtime blue-green deployments.

## Architecture

**Deployed as:** Cloud Run service (`satu-webhook`)

**Responsibilities:**
1. Receive webhook POST from GitHub
2. Validate HMAC SHA-256 signature
3. Determine current LIVE service (blue or green)
4. Deploy to STANDBY service
5. Run health checks
6. Switch LIVE tag to new service
7. Log deployment status

**Service account:** `satu-deployer@multiverseschool.iam.gserviceaccount.com`

**Required permissions:**
- `roles/run.admin` - Deploy Cloud Run services
- `roles/cloudbuild.builds.editor` - Build container images
- `roles/iam.serviceAccountUser` - Act as service accounts

## Files

- **`index.js`** - Main webhook listener server (Node.js)
- **`package.json`** - Package metadata
- **`Dockerfile`** - Container image (includes gcloud CLI)
- **`.dockerignore`** - Build exclusions

## Endpoints

### `GET /health`

Health check endpoint.

**Response:** `200 OK` with body `OK`

**Usage:**
```bash
curl https://satu-webhook-*.run.app/health
```

### `POST /webhook`

GitHub webhook receiver.

**Headers required:**
- `X-GitHub-Event` - Event type (must be `push`)
- `X-Hub-Signature-256` - HMAC signature for validation
- `Content-Type: application/json`

**Validation:**
- Signature must match HMAC SHA-256 of payload with `GITHUB_WEBHOOK_SECRET`
- Event must be `push`
- Ref must be `refs/heads/production`

**Response:**
- `202 Accepted` - Deployment started (async)
- `200 OK` - Event ignored (not production push)
- `401 Unauthorized` - Invalid signature
- `500 Internal Server Error` - Deployment failed

**Deployment process:**
1. Clone repo to temp directory
2. Checkout specific commit SHA
3. Deploy to standby service with `--no-traffic --tag staging`
4. Health check on `/` endpoint
5. Switch LIVE tag to new service
6. Clean up temp directory

## Environment Variables

**Required:**
- `GITHUB_WEBHOOK_SECRET` - Webhook HMAC secret (must match GitHub)

**Optional (with defaults):**
- `GCP_PROJECT_ID` - GCP project ID (default: `multiverseschool`)
- `GCP_REGION` - GCP region (default: `europe-west1`)
- `PORT` - HTTP port (default: `8080`)
- `REPO_URL` - Git repository URL (default: `https://github.com/supercyberal/SuperalignmentToUtopia.git`)

## Deployment

**Deploy webhook listener:**
```bash
export GITHUB_WEBHOOK_SECRET='your-secret-here'
./scripts/deploy-webhook-listener.sh
```

**Manual deployment:**
```bash
cd webhook-listener

gcloud run deploy satu-webhook \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 3 \
  --min-instances 0 \
  --timeout 600 \
  --service-account satu-deployer@multiverseschool.iam.gserviceaccount.com \
  --set-env-vars "GITHUB_WEBHOOK_SECRET=your-secret,GCP_PROJECT_ID=multiverseschool,GCP_REGION=europe-west1"
```

## Security

### HMAC Signature Validation

**All webhook requests are validated using HMAC SHA-256.**

```javascript
const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
const digest = 'sha256=' + hmac.update(payload).digest('hex');

// Constant-time comparison (prevents timing attacks)
const valid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
```

**Without validation:** Anyone who knows the webhook URL could trigger deployments.

**With validation:** Only requests signed by GitHub (using shared secret) are accepted.

### Secrets Management

**Webhook secret is stored as environment variable in Cloud Run.**

**To rotate secret:**
```bash
# 1. Generate new secret
NEW_SECRET=$(openssl rand -hex 32)

# 2. Update Cloud Run service
gcloud run services update satu-webhook \
  --region europe-west1 \
  --set-env-vars "GITHUB_WEBHOOK_SECRET=$NEW_SECRET"

# 3. Update GitHub webhook
# Go to repo → Settings → Webhooks → Edit webhook → Update secret
```

### Service Account Isolation

**Webhook listener service account (`satu-deployer`):**
- Can ONLY deploy Cloud Run services in `multiverseschool` project
- Cannot access other GCP resources (storage, databases, etc.)
- Cannot modify IAM policies
- Cannot delete services

**Principle of least privilege:** Minimal permissions to do its job.

## Monitoring

### View Logs

```bash
# Real-time logs
gcloud run services logs tail satu-webhook --region europe-west1

# Recent logs
gcloud run services logs read satu-webhook --region europe-west1 --limit 100

# Filter for deployments only
gcloud run services logs read satu-webhook --region europe-west1 | grep "DEPLOYMENT"

# Filter for errors
gcloud run services logs read satu-webhook --region europe-west1 | grep "ERROR"
```

### Log Format

**Deployment started:**
```
========================================
🚀 BLUE-GREEN DEPLOYMENT STARTED
========================================
Branch: production
Commit: abc1234567890
Time: 2025-11-28T12:00:00.000Z
```

**Deployment succeeded:**
```
========================================
✅ DEPLOYMENT SUCCESSFUL
========================================
LIVE service: satu-green
Standby service: satu-blue
```

**Deployment failed:**
```
========================================
❌ DEPLOYMENT FAILED
========================================
Error: Health check failed - aborting deployment
```

### Health Monitoring

**Manual health check:**
```bash
curl https://satu-webhook-*.run.app/health
```

**Automated monitoring (optional):**
```bash
# Add to crontab (every 5 minutes)
*/5 * * * * curl -f https://satu-webhook-*.run.app/health || notify-admin
```

## Troubleshooting

### Webhook Not Responding

**Check service status:**
```bash
gcloud run services describe satu-webhook --region europe-west1
```

**Check recent logs:**
```bash
gcloud run services logs read satu-webhook --region europe-west1 --limit 50
```

**Restart service (redeploy):**
```bash
export GITHUB_WEBHOOK_SECRET='your-secret-here'
./scripts/deploy-webhook-listener.sh
```

### Deployment Fails

**Common causes:**

1. **Service account lacks permissions**
   ```bash
   # Check permissions
   gcloud projects get-iam-policy multiverseschool \
     --flatten="bindings[].members" \
     --filter="bindings.members:serviceAccount:satu-deployer@multiverseschool.iam.gserviceaccount.com"

   # Re-grant permissions
   ./scripts/deploy-webhook-listener.sh
   ```

2. **Build timeout**
   - Increase timeout in `index.js` (currently 10 minutes)
   - Or increase webhook service timeout:
     ```bash
     gcloud run services update satu-webhook \
       --region europe-west1 \
       --timeout 900  # 15 minutes
     ```

3. **Git clone fails**
   - Check repo URL is correct
   - Check commit SHA exists
   - Check repo is public (or add deploy key)

4. **Health check fails**
   - Check standby service logs
   - Test URL directly: `curl https://satu-green-*.run.app`
   - Deployment aborts if health check fails (traffic stays on old service)

### Invalid Signature

**Symptoms:** GitHub webhook delivery shows 401 Unauthorized

**Causes:**
- Webhook secret mismatch
- Webhook secret not set in Cloud Run
- GitHub sending requests unsigned (shouldn't happen)

**Fix:**
```bash
# Verify secret is set
gcloud run services describe satu-webhook \
  --region europe-west1 \
  --format="value(spec.template.spec.containers[0].env[?name=='GITHUB_WEBHOOK_SECRET'].value)"

# Update if wrong
export GITHUB_WEBHOOK_SECRET='correct-secret-here'
./scripts/deploy-webhook-listener.sh
```

## Development

### Local Testing

**Run locally:**
```bash
cd webhook-listener

export GITHUB_WEBHOOK_SECRET='test-secret'
export GCP_PROJECT_ID='multiverseschool'
export GCP_REGION='europe-west1'
export PORT=8080

node index.js
```

**Test health endpoint:**
```bash
curl http://localhost:8080/health
```

**Test webhook (without signature):**
```bash
curl -X POST http://localhost:8080/webhook \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d '{"ref": "refs/heads/production", "after": "abc123"}'

# Expected: 401 Unauthorized (signature required)
```

### Dependencies

**Runtime:** Node.js 18+

**System dependencies (in Docker image):**
- `gcloud` CLI (for deploying Cloud Run services)
- `git` (for cloning repository)
- `curl` (for health checks)

**No npm dependencies** - Uses only Node.js standard library:
- `http` - HTTP server
- `crypto` - HMAC signature validation
- `child_process` - Execute gcloud commands

## Cost

**Typical monthly cost:** $1-2

**Breakdown:**
- Invocations: ~$0.10 (100 deployments/month)
- CPU time: ~$0.50 (10 minutes/deployment)
- Memory: ~$0.30 (1Gi, mostly idle)
- Networking: ~$0.10 (egress for git clone)

**Cost optimization:**
- `min-instances: 0` - Scales to zero when not deploying
- `max-instances: 3` - Prevents runaway costs
- Short timeout (10 minutes) - Prevents stuck deployments

## Future Improvements

**Potential enhancements (not implemented):**

1. **Deployment queue** - Serialize concurrent deployments
2. **Slack/Discord notifications** - Send deployment status to team chat
3. **Metrics dashboard** - Track deployment frequency, success rate, duration
4. **Automated rollback** - Detect error rate spikes and auto-rollback
5. **Gradual traffic migration** - 10% → 50% → 100% instead of instant cutover
6. **Pre-deployment testing** - Run integration tests before switching traffic
7. **Deployment history** - Store past deployments in database
8. **Multi-region support** - Deploy to multiple regions simultaneously

---

**Built by Devon** - "A webhook listener without signature validation is just a very expensive 'deploy random code' button."
