# Secret Rotation Procedures

**MARCUS 3.1 - Automated Security Operations**

This document describes the automated secret rotation system and manual procedures for emergency rotation.

## Overview

MARCUS 3.1 implements automated rotation for three critical secret types:

1. **JWT Signing Secrets** - Rotate every 30 days (7-day grace period)
2. **Database Passwords** - Rotate every 90 days (zero-downtime)
3. **Redis Passwords** - Rotate every 90 days (zero-downtime)

**Architecture:** Dual-secret pattern enables zero-downtime rotation. Old secrets remain valid during grace period while new secrets are distributed.

---

## Automated Rotation (Default)

### Kubernetes CronJob

The `secret-rotation` CronJob runs daily at 2 AM UTC:

```bash
# Check status
kubectl get cronjob secret-rotation -n marcus

# View recent jobs
kubectl get jobs -n marcus -l component=secret-rotation --sort-by=.status.startTime

# View logs from last run
LAST_JOB=$(kubectl get jobs -n marcus -l component=secret-rotation --sort-by=.status.startTime -o jsonpath='{.items[-1].metadata.name}')
kubectl logs job/${LAST_JOB} -n marcus
```

### Rotation Schedule

| Secret Type | Interval | Grace Period | Next Check |
|------------|----------|--------------|------------|
| JWT        | 30 days  | 7 days       | Daily @ 2 AM UTC |
| Database   | 90 days  | N/A (instant) | Daily @ 2 AM UTC |
| Redis      | 90 days  | N/A (instant) | Daily @ 2 AM UTC |

### Alerts

Prometheus monitors secret age and rotation job status:

```bash
# View alert rules
kubectl get configmap secret-expiration-alerts -n marcus -o yaml

# Check active alerts
curl http://prometheus:9090/api/v1/alerts | jq '.data.alerts[] | select(.labels.component=="security")'
```

**Alert Thresholds:**
- **WARNING:** JWT secrets > 35 days old
- **CRITICAL:** JWT secrets > 60 days old
- **CRITICAL:** Rotation job failed

---

## JWT Secret Rotation

### How It Works

**Dual-Secret Pattern:**

```
Time T+0:  Sign with SECRET_A, verify against [SECRET_A]
Time T+30: ROTATION → Sign with SECRET_B, verify against [SECRET_B, SECRET_A]
Time T+37: Grace period ends → Verify against [SECRET_B] only
```

**Benefits:**
- Zero downtime (no 401 errors during rotation)
- In-flight tokens remain valid
- Clients automatically transition to new secret
- Old secret expires after grace period

### Verification

```typescript
// TypeScript example - DualSecretJwtManager
import { DualSecretJwtManager } from '@/platform/auth/dualSecretJwt';

const jwtManager = new DualSecretJwtManager();

// Sign token (always uses current secret)
const token = jwtManager.sign({ sub: 'user123', role: 'admin' });

// Verify token (checks current, then previous if needed)
const result = jwtManager.verify(token);

if (result.valid && result.usedPreviousSecret) {
  console.warn('⚠️ Client using old token - suggest refresh');
}
```

### Monitoring

```bash
# Get rotation metadata
kubectl get secret jwt-secrets -n marcus -o jsonpath='{.data.rotation-timestamp}' | base64 -d

# Check days since rotation
ROTATION_TS=$(kubectl get secret jwt-secrets -n marcus -o jsonpath='{.data.rotation-timestamp}' | base64 -d)
CURRENT_TS=$(date +%s)
ROTATION_TS_EPOCH=$(date -d "${ROTATION_TS}" +%s)
DAYS_SINCE=$(( ($CURRENT_TS - $ROTATION_TS_EPOCH) / 86400 ))
echo "Days since rotation: ${DAYS_SINCE}"
```

### Manual Rotation (Emergency)

```bash
# Trigger rotation immediately
kubectl create job --from=cronjob/secret-rotation manual-rotation-$(date +%s) -n marcus

# Watch progress
kubectl logs -f job/manual-rotation-TIMESTAMP -n marcus

# Verify new secret deployed
kubectl get secret jwt-secrets -n marcus -o jsonpath='{.data.rotation-timestamp}' | base64 -d
```

---

## Database Password Rotation

### How It Works

**Zero-Downtime Pattern:**

1. Generate new password
2. Update Cloud SQL instance password
3. Update Kubernetes secret
4. Rolling restart of database StatefulSet
5. Pods pick up new password on restart

**Connection Pool Handling:**
- Existing connections drain gracefully
- New connections use new password
- No query interruptions

### Manual Rotation

```bash
# Generate new password
NEW_PASSWORD=$(openssl rand -base64 32)

# Update Cloud SQL password
gcloud sql users set-password postgres \
  --instance=marcus-postgres \
  --password="${NEW_PASSWORD}"

# Update Kubernetes secret
kubectl patch secret postgres-credentials -n marcus --type=json -p="[
  {\"op\": \"replace\", \"path\": \"/data/password\", \"value\": \"$(echo -n ${NEW_PASSWORD} | base64 -w0)\"}
]"

# Trigger rolling restart
kubectl rollout restart statefulset/postgres -n marcus

# Verify rollout
kubectl rollout status statefulset/postgres -n marcus
```

### Verification

```bash
# Test database connection with new password
kubectl run -it --rm postgres-test --image=postgres:14 --restart=Never -n marcus -- \
  psql -h postgres -U postgres -d citations -c "SELECT version();"
```

---

## Redis Password Rotation

### How It Works

**Live Config Update Pattern:**

1. Generate new password
2. Update Redis config (`CONFIG SET requirepass`)
3. Update Kubernetes secret
4. Rolling restart of Redis StatefulSet
5. Clients reconnect with new password

**Important:** Redis supports live password changes without restart, but we restart anyway for consistency.

### Manual Rotation

```bash
# Generate new password
NEW_PASSWORD=$(openssl rand -base64 32)

# Update Redis config (live)
kubectl exec statefulset/redis -n marcus -- redis-cli CONFIG SET requirepass "${NEW_PASSWORD}"

# Update Kubernetes secret
kubectl patch secret redis-credentials -n marcus --type=json -p="[
  {\"op\": \"replace\", \"path\": \"/data/password\", \"value\": \"$(echo -n ${NEW_PASSWORD} | base64 -w0)\"}
]"

# Trigger rolling restart
kubectl rollout restart statefulset/redis -n marcus

# Verify rollout
kubectl rollout status statefulset/redis -n marcus
```

### Verification

```bash
# Test Redis connection with new password
PASSWORD=$(kubectl get secret redis-credentials -n marcus -o jsonpath='{.data.password}' | base64 -d)
kubectl run -it --rm redis-test --image=redis:7 --restart=Never -n marcus -- \
  redis-cli -h redis -a "${PASSWORD}" PING
```

---

## Troubleshooting

### Rotation Job Failed

**Symptoms:** Alert `SecretRotationJobFailed` fires, job pod in Error state

**Diagnosis:**

```bash
# Find failed job
kubectl get jobs -n marcus -l component=secret-rotation

# Check logs
kubectl logs job/secret-rotation-TIMESTAMP -n marcus

# Describe job for events
kubectl describe job secret-rotation-TIMESTAMP -n marcus
```

**Common Causes:**

1. **RBAC Permissions:** Service account can't read/write secrets
   ```bash
   # Verify role binding
   kubectl get rolebinding secret-rotation-binding -n marcus -o yaml
   ```

2. **Cloud SQL API Error:** Can't update database password
   ```bash
   # Check Cloud SQL instance status
   gcloud sql instances describe marcus-postgres
   ```

3. **Network Error:** Can't reach Slack webhook for notifications
   ```bash
   # Test webhook manually
   kubectl run -it --rm curl-test --image=curlimages/curl --restart=Never -n marcus -- \
     curl -X POST ${SLACK_WEBHOOK_URL} -H 'Content-Type: application/json' -d '{"text":"Test"}'
   ```

**Resolution:**

```bash
# Fix RBAC
kubectl apply -f k8s/cronjob-secret-rotation.yaml

# Retry rotation manually
kubectl create job --from=cronjob/secret-rotation retry-rotation-$(date +%s) -n marcus
```

---

### JWT Verification Failures After Rotation

**Symptoms:** 401 Unauthorized errors spike after rotation

**Diagnosis:**

```bash
# Check if grace period expired
kubectl get secret jwt-secrets -n marcus -o jsonpath='{.data.rotation-timestamp}' | base64 -d

# Check Prometheus for 401 rate
curl http://prometheus:9090/api/v1/query --data-urlencode 'query=rate(http_requests_total{status="401"}[5m])'
```

**Common Causes:**

1. **Grace Period Too Short:** Clients haven't refreshed tokens yet
   - Increase `JWT_GRACE_PERIOD_DAYS` to 14 days

2. **Previous Secret Missing:** Rotation deleted old secret prematurely
   ```bash
   # Verify previous secret exists
   kubectl get secret jwt-secrets -n marcus -o jsonpath='{.data.previous-secret}' | base64 -d
   ```

3. **Client Not Handling Refresh:** Clients ignoring `X-Token-Refresh-Suggested` header
   - Check client logs for refresh errors

**Resolution:**

```bash
# Extend grace period (emergency)
kubectl patch configmap rotation-scripts -n marcus --type=json -p='[
  {"op": "replace", "path": "/data/JWT_GRACE_PERIOD_DAYS", "value": "14"}
]'

# Rollback to previous secret (emergency only)
PREVIOUS_SECRET=$(kubectl get secret jwt-secrets -n marcus -o jsonpath='{.data.previous-secret}')
kubectl patch secret jwt-secrets -n marcus --type=json -p="[
  {\"op\": \"replace\", \"path\": \"/data/current-secret\", \"value\": \"${PREVIOUS_SECRET}\"}
]"
```

---

### Database Connection Failures After Rotation

**Symptoms:** Database query errors, connection pool exhausted

**Diagnosis:**

```bash
# Check database pod status
kubectl get pods -n marcus -l app=postgres

# Check connection pool metrics
curl http://prometheus:9090/api/v1/query --data-urlencode 'query=pg_pool_connections_active'
```

**Common Causes:**

1. **Password Mismatch:** Kubernetes secret updated but Cloud SQL password didn't
   ```bash
   # Test Cloud SQL password manually
   gcloud sql connect marcus-postgres --user=postgres
   ```

2. **Connection Pool Not Drained:** Old connections still using old password
   ```bash
   # Force restart of all pods using database
   kubectl rollout restart deployment/orchestrator -n marcus
   ```

**Resolution:**

```bash
# Sync passwords (emergency)
K8S_PASSWORD=$(kubectl get secret postgres-credentials -n marcus -o jsonpath='{.data.password}' | base64 -d)

gcloud sql users set-password postgres \
  --instance=marcus-postgres \
  --password="${K8S_PASSWORD}"

# Restart all database clients
kubectl rollout restart deployment/orchestrator -n marcus
```

---

## Security Best Practices

### Secret Storage

**DO:**
- ✅ Store secrets in Kubernetes Secrets (encrypted at rest via KMS)
- ✅ Use separate secrets for each service
- ✅ Rotate regularly (30-90 day intervals)
- ✅ Audit all secret access
- ✅ Use RBAC to limit secret access

**DON'T:**
- ❌ Commit secrets to Git
- ❌ Log secret values
- ❌ Share secrets between environments (dev/staging/prod)
- ❌ Use default passwords
- ❌ Disable rotation

### Audit Trail

All secret rotations are logged:

```bash
# View rotation audit logs
kubectl logs -l component=secret-rotation -n marcus --since=7d | grep AUDIT

# Example output:
# 📝 [AUDIT] JWT Secret Rotation:
#   Old Rotation ID: rot_1700000000000_abc123
#   New Rotation ID: rot_1700000001000_def456
#   Timestamp: 2025-11-22T02:00:00Z
```

### Incident Response

**If secret compromised:**

1. **Immediate Rotation:**
   ```bash
   kubectl create job --from=cronjob/secret-rotation emergency-rotation-$(date +%s) -n marcus
   ```

2. **Invalidate Old Tokens:**
   ```bash
   # For JWT: Set grace period to 0 (force immediate refresh)
   kubectl patch secret jwt-secrets -n marcus --type=json -p='[
     {"op": "replace", "path": "/data/previous-secret", "value": ""}
   ]'
   ```

3. **Audit Access:**
   ```bash
   # Check who accessed the secret
   kubectl get events -n marcus --field-selector involvedObject.name=jwt-secrets
   ```

4. **Notify Team:**
   - Alert security team
   - Post incident report
   - Update runbooks

---

## References

- **Dual-Secret JWT Implementation:** `src/platform/auth/dualSecretJwt.ts`
- **Rotation Scripts:** `k8s/cronjob-secret-rotation.yaml`
- **Alert Rules:** `k8s/cronjob-secret-rotation.yaml` (Prometheus section)
- **GKE Secrets Documentation:** https://cloud.google.com/kubernetes-engine/docs/concepts/secret
- **Cloud SQL Password Management:** https://cloud.google.com/sql/docs/postgres/users

---

**Last Updated:** 2025-11-22
**Maintained by:** Platform Engineering (Marcus)
