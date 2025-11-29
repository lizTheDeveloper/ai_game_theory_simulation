# Blue-Green Deployment - Testing Guide

**How to validate your blue-green deployment setup works correctly.**

## Prerequisites

Before testing, ensure initial setup is complete:

```bash
# 1. Check webhook listener is deployed
gcloud run services describe satu-webhook --region europe-west1 2>/dev/null || echo "❌ Webhook not deployed"

# 2. Check blue service is deployed
gcloud run services describe satu-blue --region europe-west1 2>/dev/null || echo "❌ Blue not deployed"

# 3. Check green service is deployed
gcloud run services describe satu-green --region europe-west1 2>/dev/null || echo "❌ Green not deployed"

# 4. Check current status
./scripts/check-deployment-status.sh
```

**If any service is missing, run initial setup:**
```bash
export GITHUB_WEBHOOK_SECRET='your-secret-here'
./scripts/deploy-webhook-listener.sh
./scripts/initial-blue-green-setup.sh
```

## Test 1: Webhook Listener Health

**Verify webhook listener is running and responsive.**

```bash
# Get webhook URL
WEBHOOK_URL=$(gcloud run services describe satu-webhook \
  --region europe-west1 \
  --format="value(status.url)")

# Test health endpoint
curl "${WEBHOOK_URL}/health"
```

**Expected output:** `OK`

**If failed:**
```bash
# Check webhook logs
gcloud run services logs read satu-webhook --region europe-west1 --limit 50

# Redeploy if needed
export GITHUB_WEBHOOK_SECRET='your-secret-here'
./scripts/deploy-webhook-listener.sh
```

## Test 2: Manual Traffic Switch

**Verify LIVE tag switching works without deployment.**

```bash
# 1. Check current LIVE service
./scripts/check-deployment-status.sh | grep "LIVE:"

# 2. Switch to other service
# If blue is LIVE, switch to green (or vice versa)
./scripts/rollback.sh satu-green

# 3. Verify switch succeeded
./scripts/check-deployment-status.sh | grep "LIVE:"

# 4. Test service is accessible
LIVE_URL=$(./scripts/check-deployment-status.sh | grep "Public URL:" | awk '{print $3}')
curl -I "$LIVE_URL"

# 5. Switch back
./scripts/rollback.sh satu-blue
```

**Expected behavior:**
- Rollback completes in <10 seconds
- HTTP response from LIVE URL is 200 OK
- No errors in service logs

## Test 3: GitHub Webhook Delivery

**Verify GitHub can reach your webhook endpoint.**

**Method 1: GitHub UI Test**

1. Go to your repo → Settings → Webhooks
2. Click on your webhook
3. Scroll to "Recent Deliveries"
4. Click "Redeliver" on any past delivery (or "Test" to send a ping)

**Expected result:**
- Response code: 200 (for ping) or 202 (for push)
- Response body: `{"status": "ignored"}` (if not production branch)

**Method 2: Manual curl Test**

```bash
# Get webhook URL
WEBHOOK_URL=$(gcloud run services describe satu-webhook \
  --region europe-west1 \
  --format="value(status.url)")

# Send test payload (no signature - should fail)
curl -X POST "${WEBHOOK_URL}/webhook" \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: ping" \
  -d '{"zen": "test"}'
```

**Expected output:** `Unauthorized` (signature validation working)

## Test 4: Mock Deployment

**Simulate a deployment without actually pushing to production.**

```bash
# 1. Identify current standby service
STANDBY=$(./scripts/check-deployment-status.sh | grep "STANDBY:" | awk '{print $2}')

# 2. Manually deploy to standby
gcloud run deploy "$STANDBY" \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0 \
  --port 3333 \
  --timeout 300 \
  --no-traffic \
  --tag staging

# 3. Health check
STANDBY_URL=$(gcloud run services describe "$STANDBY" \
  --region europe-west1 \
  --format="value(status.url)")

curl -I "$STANDBY_URL"

# 4. Switch traffic
./scripts/rollback.sh "$STANDBY"

# 5. Verify
./scripts/check-deployment-status.sh
```

**Expected behavior:**
- Deploy succeeds (5-10 minutes)
- Health check returns 200 OK
- Traffic switch is instant
- Old LIVE becomes new standby

## Test 5: Full End-to-End Deployment

**Trigger actual deployment via GitHub webhook.**

**Prerequisites:**
- GitHub webhook configured
- Webhook secret matches deployment
- On `production` branch

**Steps:**

```bash
# 1. Create test branch
git checkout -b test-blue-green-deployment
echo "Test deployment $(date)" >> TEST_DEPLOYMENT.txt
git add TEST_DEPLOYMENT.txt
git commit -m "Test: Blue-green deployment validation"

# 2. Merge to main
git checkout main
git merge test-blue-green-deployment

# 3. Run tests locally
npm run build
npm test

# 4. Push to production (triggers webhook)
git checkout production
git merge main
git push origin production

# 5. Monitor webhook logs in real-time
gcloud run services logs tail satu-webhook --region europe-west1
```

**Expected output in webhook logs:**
```
📨 Received push event
✅ Valid production push detected
🚀 Deploying to satu-green (commit abc1234)...
✅ Deployment output: ...
🏥 Running health check on satu-green...
✅ Health check passed
🔄 Switching LIVE traffic to satu-green...
✅ Traffic switched successfully
✅ DEPLOYMENT SUCCESSFUL
```

**Verify deployment:**
```bash
# 1. Check status
./scripts/check-deployment-status.sh

# 2. Test live URL
LIVE_URL=$(./scripts/check-deployment-status.sh | grep "Public URL:" | awk '{print $3}')
curl -I "$LIVE_URL"

# 3. Check for TEST_DEPLOYMENT.txt marker
curl "$LIVE_URL/TEST_DEPLOYMENT.txt"
```

**Cleanup:**
```bash
# Remove test file
git checkout main
git rm TEST_DEPLOYMENT.txt
git commit -m "Cleanup: Remove deployment test file"
git checkout production
git merge main
git push origin production
```

## Test 6: Rollback Under Pressure

**Simulate deploying broken code and rolling back quickly.**

```bash
# 1. Note current LIVE service
ORIGINAL_LIVE=$(./scripts/check-deployment-status.sh | grep "LIVE:" | awk '{print $2}')

# 2. Create intentionally broken deployment
git checkout -b test-broken-deployment
echo "export function broken() { throw new Error('TEST'); }" > src/broken-test.ts
git add src/broken-test.ts
git commit -m "Test: Intentionally broken deployment"

# 3. Deploy (via GitHub or manually)
git checkout production
git merge test-broken-deployment
git push origin production

# 4. Once deployment completes, immediately rollback
./scripts/rollback.sh "$ORIGINAL_LIVE"

# 5. Measure rollback time
time ./scripts/rollback.sh "$ORIGINAL_LIVE"
```

**Expected results:**
- Rollback completes in <5 seconds
- Service immediately returns to working state
- No 500 errors visible to users

**Cleanup:**
```bash
git checkout main
git rm src/broken-test.ts
git commit -m "Cleanup: Remove broken test code"
git checkout production
git merge main
git push origin production
```

## Test 7: Concurrent Deployment Protection

**Verify that simultaneous deployments don't cause issues.**

This test requires two developers/terminals pushing at nearly the same time.

**Terminal 1:**
```bash
echo "Change from terminal 1 $(date)" >> change1.txt
git add change1.txt
git commit -m "Concurrent test 1"
git push origin production
```

**Terminal 2 (within 10 seconds):**
```bash
echo "Change from terminal 2 $(date)" >> change2.txt
git add change2.txt
git commit -m "Concurrent test 2"
git push origin production
```

**Expected behavior:**
- One deployment processes normally
- Second deployment either:
  - Queues behind first (ideal)
  - Fails gracefully with clear error (acceptable)
  - Processes after first completes (acceptable)

**Current implementation:** No explicit queuing. Second webhook may fail if first is still deploying. This is acceptable - retry the push.

**Future improvement:** Add deployment queue/lock to serialize webhook requests.

## Test 8: Service Account Permissions

**Verify webhook listener has required permissions.**

```bash
# Check service account
SA_EMAIL="satu-deployer@multiverseschool.iam.gserviceaccount.com"

# List roles
gcloud projects get-iam-policy multiverseschool \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:$SA_EMAIL" \
  --format="table(bindings.role)"
```

**Expected roles:**
- `roles/run.admin`
- `roles/cloudbuild.builds.editor`
- `roles/iam.serviceAccountUser`

**If missing:**
```bash
./scripts/deploy-webhook-listener.sh  # Re-run setup to grant permissions
```

## Test 9: Security Validation

**Verify webhook signature validation is working.**

```bash
WEBHOOK_URL=$(gcloud run services describe satu-webhook \
  --region europe-west1 \
  --format="value(status.url)")

# Test 1: No signature (should fail)
curl -X POST "${WEBHOOK_URL}/webhook" \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d '{"ref": "refs/heads/production", "after": "abc123"}'

# Expected: 401 Unauthorized

# Test 2: Wrong signature (should fail)
curl -X POST "${WEBHOOK_URL}/webhook" \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -H "X-Hub-Signature-256: sha256=wrong" \
  -d '{"ref": "refs/heads/production", "after": "abc123"}'

# Expected: 401 Unauthorized

# Test 3: Valid signature (requires actual webhook secret)
# This can only be tested via GitHub webhook delivery
```

## Test 10: Disaster Recovery

**Verify you can recover from total failure.**

**Scenario:** All three services are deleted accidentally.

```bash
# 1. Simulate disaster (don't actually run this unless testing)
# gcloud run services delete satu-blue --region europe-west1 --quiet
# gcloud run services delete satu-green --region europe-west1 --quiet
# gcloud run services delete satu-webhook --region europe-west1 --quiet

# 2. Recover from disaster
export GITHUB_WEBHOOK_SECRET='your-secret-here'
./scripts/deploy-webhook-listener.sh
./scripts/initial-blue-green-setup.sh

# 3. Verify recovery
./scripts/check-deployment-status.sh
```

**Expected behavior:**
- Scripts are idempotent (safe to re-run)
- All services recreated successfully
- LIVE tag properly assigned
- Webhook configured and working

## Troubleshooting Test Failures

### Webhook Health Check Fails

**Symptoms:** `curl ${WEBHOOK_URL}/health` returns error or timeout

**Diagnosis:**
```bash
# Check service logs
gcloud run services logs read satu-webhook --region europe-west1 --limit 50

# Check service status
gcloud run services describe satu-webhook --region europe-west1
```

**Fix:** Redeploy webhook listener

### Manual Traffic Switch Fails

**Symptoms:** `./scripts/rollback.sh` fails or takes too long

**Diagnosis:**
```bash
# Check gcloud authentication
gcloud auth list

# Check permissions
gcloud projects get-iam-policy multiverseschool
```

**Fix:**
```bash
# Re-authenticate
gcloud auth login

# Check project is set
gcloud config set project multiverseschool
```

### GitHub Webhook Not Triggering

**Symptoms:** Push to production doesn't trigger deployment

**Diagnosis:**
1. GitHub repo → Settings → Webhooks → Recent Deliveries
2. Check delivery response codes and errors

**Common causes:**
- Wrong webhook URL (redeploy webhook listener, update GitHub)
- Wrong secret (redeploy with correct secret, update GitHub)
- Firewall blocking GitHub IPs (Cloud Run is public, shouldn't happen)

**Fix:** Reconfigure webhook in GitHub with correct URL and secret

### Deployment Fails Health Check

**Symptoms:** Deployment completes but traffic doesn't switch

**Diagnosis:**
```bash
# Check standby service logs
gcloud run services logs read satu-green --region europe-west1 --limit 100

# Test URL directly
GREEN_URL=$(gcloud run services describe satu-green \
  --region europe-west1 \
  --format="value(status.url)")

curl -v "$GREEN_URL"
```

**Common causes:**
- Service crashes on startup (check logs for errors)
- Port mismatch (should be 3333)
- Build succeeded but runtime fails (missing dependencies)

**Fix:** Fix code errors, push again

## Success Criteria

All tests should pass with:

- ✅ Webhook health endpoint returns 200 OK
- ✅ Manual traffic switch completes in <10 seconds
- ✅ GitHub webhook delivery succeeds (200/202 response)
- ✅ Mock deployment switches traffic successfully
- ✅ Full deployment via webhook completes with zero downtime
- ✅ Rollback completes in <5 seconds
- ✅ Service account has all required permissions
- ✅ Signature validation rejects unsigned requests
- ✅ Disaster recovery scripts restore full functionality

## Monitoring Checklist

After testing, set up ongoing monitoring:

```bash
# 1. Create budget alert (if not already done)
gcloud billing budgets create \
  --billing-account YOUR_BILLING_ACCOUNT_ID \
  --display-name 'SATU Blue-Green Budget' \
  --budget-amount 50 \
  --threshold-rule percent=50 \
  --threshold-rule percent=90

# 2. Set up log-based alerts (optional)
# Monitor for deployment failures, health check failures, etc.

# 3. Bookmark status dashboard
echo "Bookmark this command: ./scripts/check-deployment-status.sh"

# 4. Schedule regular health checks (optional)
# Add to crontab: */5 * * * * curl -f https://satu-webhook-*.run.app/health || notify-admin
```

---

**Testing completed by:** Devon
**Philosophy:** "If you haven't tested it, it's broken. If you have tested it, it's probably still broken, but at least you know how."
