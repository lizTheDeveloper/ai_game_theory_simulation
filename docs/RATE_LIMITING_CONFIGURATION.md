# MARCUS Platform Rate Limiting Configuration

**Last Updated:** November 22, 2025
**Author:** Marcus (Platform Engineer)

---

## Table of Contents

1. [Overview](#overview)
2. [Rate Limiting Strategy](#rate-limiting-strategy)
3. [Configuration](#configuration)
4. [Testing](#testing)
5. [Monitoring](#monitoring)
6. [Troubleshooting](#troubleshooting)

---

## Overview

MARCUS Platform implements **multi-layer rate limiting** for DDoS protection and resource management:

1. **Ingress Layer** (NGINX/GKE) - First line of defense
2. **Application Layer** (Express middleware) - Fine-grained control
3. **Cloud Armor** (GCP only) - Advanced WAF + DDoS protection

This document focuses on **ingress-level rate limiting**.

---

## Rate Limiting Strategy

### Design Goals

1. **Prevent abuse** - Block malicious actors without affecting legitimate users
2. **Resource protection** - Prevent resource exhaustion from traffic spikes
3. **Fair usage** - Distribute capacity across clients
4. **Graceful degradation** - Return 429 instead of 503/timeout

### Rate Limit Targets

| Endpoint Pattern | Limit | Burst | Reasoning |
|-----------------|-------|-------|-----------|
| Global (all endpoints) | 100 req/min per IP | 150 | Average user workload |
| `/api/citations/analyze` | 30 req/min per IP | 50 | Expensive operation (multi-agent consensus) |
| `/health`, `/metrics` | No limit | - | Monitoring endpoints |

### Why These Numbers?

**100 req/min global limit:**
- Average user: ~1-2 req/sec (60-120 req/min)
- Burst allowance: 150 requests (1.5x base rate)
- Typical workflow: UI polling + manual actions
- Research: [Google Cloud - Best Practices for API Rate Limiting](https://cloud.google.com/solutions/rate-limiting-strategies-for-cloud-run)

**30 req/min for /analyze:**
- Each request: 10 agents × ~500ms = ~5s total
- At 30 req/min: ~2.5 concurrent requests per IP
- Prevents single IP from monopolizing agent pool
- Aligned with worker pool capacity (100 workers = 3-4 IPs at max rate)

---

## Configuration

### NGINX Ingress (Default)

**File:** `k8s/ingress.yaml`

```yaml
metadata:
  annotations:
    # Rate limiting (per IP address)
    nginx.ingress.kubernetes.io/limit-rps: "2"  # ~100/min
    nginx.ingress.kubernetes.io/limit-burst-multiplier: "75"  # 2 * 75 = 150 burst
    nginx.ingress.kubernetes.io/limit-connections: "20"  # Max concurrent per IP
    nginx.ingress.kubernetes.io/limit-rpm: "100"  # Explicit requests per minute
```

**How it works:**
- `limit-rps: "2"` → ~120 req/min base rate (allows small bursts)
- `limit-burst-multiplier: "75"` → 150 burst capacity (2 × 75)
- `limit-connections: "20"` → Max 20 concurrent connections per IP
- `limit-rpm: "100"` → Enforces 100 req/min hard limit

**NGINX rate limiting algorithm:**
- Token bucket algorithm
- Tokens refill at `limit-rps` rate
- Bucket size = `limit-rps × limit-burst-multiplier`
- Requests consume tokens; reject if bucket empty

### GKE Ingress with Cloud Armor (Advanced)

**File:** `k8s/gke-ingress-with-cloudarmor.yaml`

```yaml
metadata:
  annotations:
    kubernetes.io/ingress.class: "gce"
    cloud.google.com/armor-config: '{"marcus-platform":"marcus-security-policy"}'
```

**Cloud Armor rate limiting:**
- Configured via `gcloud` CLI (see `k8s/cloudarmor-policy.yaml`)
- Rule 1000: Global rate limit (150 req/min per IP)
- Rule 5000: API endpoint limit (30 req/min for /analyze)
- 10-minute ban on exceed

**Setup:**
```bash
# Create security policy
gcloud compute security-policies create marcus-security-policy \
  --description "MARCUS Platform WAF + DDoS Protection"

# Add rate limiting rule
gcloud compute security-policies rules create 1000 \
  --security-policy=marcus-security-policy \
  --expression="true" \
  --action=rate-based-ban \
  --rate-limit-threshold-count=150 \
  --rate-limit-threshold-interval-sec=60 \
  --ban-duration-sec=600 \
  --conform-action=allow \
  --exceed-action=deny-429 \
  --enforce-on-key=IP
```

---

## Testing

### Manual Testing

**Test basic rate limiting:**
```bash
# Send 10 requests quickly
for i in {1..10}; do
  curl -w "%{http_code}\n" https://marcus.example.com/health
done

# Expected: First ~10 succeed (200), rest rate limited (429)
```

**Test burst capacity:**
```bash
# Send 150 requests immediately
seq 1 150 | xargs -n1 -P150 -I{} curl -w "%{http_code}\n" -s https://marcus.example.com/health

# Expected: All 150 succeed (within burst capacity)

# Send 151st request
curl -w "%{http_code}\n" https://marcus.example.com/health

# Expected: 429 (burst capacity exhausted)
```

### Automated Load Test

**Run load test script:**
```bash
# Test at 5 req/sec for 60 seconds (300 total requests)
./k8s/test-rate-limiting.sh https://marcus.example.com 5 60
```

**Expected results:**
- Success rate: ~33% (100 allowed out of 300)
- Rate limited: ~67% (200 rejected)
- Error rate: <5%

**Interpreting results:**
- If success rate > 50%: Rate limiting not strict enough
- If success rate < 20%: Rate limiting too aggressive
- If error rate > 5%: Infrastructure issues (not rate limiting)

### Load Testing with k6

**Install k6:**
```bash
# macOS
brew install k6

# Linux
sudo apt-get install k6
```

**Load test script:**
```javascript
// k6-rate-limit-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 VUs
    { duration: '1m', target: 10 },   // Stay at 10 VUs
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'],  // 95% of requests < 500ms
    'http_req_failed{status:429}': ['rate<0.7'],  // <70% rate limited
  },
};

export default function () {
  let res = http.get('https://marcus.example.com/health');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'status is 429': (r) => r.status === 429,
  });

  sleep(1);  // 1 request per second per VU
}
```

**Run:**
```bash
k6 run k6-rate-limit-test.js
```

---

## Monitoring

### Prometheus Metrics

**Rate limiting metrics:**
```promql
# Requests by status code
sum(rate(http_requests_total{status="429"}[5m])) by (endpoint)

# Rate limit rejection rate
sum(rate(http_requests_total{status="429"}[5m])) / sum(rate(http_requests_total[5m]))

# Top rate-limited IPs
topk(10, sum(rate(http_requests_total{status="429"}[1h])) by (client_ip))
```

### Grafana Dashboard

**Panel 1: Request Rate by Status**
```promql
sum(rate(http_requests_total[5m])) by (status)
```

**Panel 2: Rate Limited Requests (429s)**
```promql
sum(rate(http_requests_total{status="429"}[5m]))
```

**Panel 3: Rate Limit Rejection Percentage**
```promql
(sum(rate(http_requests_total{status="429"}[5m])) / sum(rate(http_requests_total[5m]))) * 100
```

**Panel 4: Top Rate-Limited IPs**
```promql
topk(10, sum(increase(http_requests_total{status="429"}[1h])) by (client_ip))
```

### Cloud Armor Logs (GCP)

**View rate-limited requests:**
```
resource.type="http_load_balancer"
jsonPayload.enforcedSecurityPolicy.name="marcus-security-policy"
jsonPayload.enforcedSecurityPolicy.outcome="DENY"
httpRequest.status=429
```

**View banned IPs:**
```
resource.type="http_load_balancer"
jsonPayload.enforcedSecurityPolicy.name="marcus-security-policy"
jsonPayload.enforcedSecurityPolicy.configuredAction="RATE_BASED_BAN"
```

---

## Troubleshooting

### Legitimate Users Getting Rate Limited

**Symptoms:**
- Valid API clients receiving 429 errors
- Complaints from users about service unavailable

**Diagnosis:**
```bash
# Check current rate limits
kubectl get ingress marcus-ingress -n marcus-platform -o yaml | grep limit

# Check Cloud Armor policy (GCP)
gcloud compute security-policies describe marcus-security-policy
```

**Solutions:**

1. **Increase rate limits** (if traffic is legitimate):
   ```yaml
   # k8s/ingress.yaml
   nginx.ingress.kubernetes.io/limit-rpm: "200"  # Was 100
   ```

2. **Add IP whitelist** (for known good IPs):
   ```yaml
   nginx.ingress.kubernetes.io/limit-whitelist: "1.2.3.4,5.6.7.8"
   ```

3. **Implement API key-based limits** (instead of IP-based):
   - Move to application-layer rate limiting
   - Use Redis-based token bucket per API key
   - See `src/platform/middleware/rateLimiter.ts`

### Rate Limiting Not Working

**Symptoms:**
- Load tests show no 429 responses
- Metrics show 0% rate-limited requests
- Attackers not being blocked

**Diagnosis:**
```bash
# Check ingress controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller

# Verify annotations applied
kubectl describe ingress marcus-ingress -n marcus-platform | grep limit
```

**Solutions:**

1. **Verify NGINX rate limit module enabled:**
   ```bash
   kubectl exec -n ingress-nginx <nginx-pod> -- nginx -V 2>&1 | grep limit_req
   # Should show: --with-http_limit_req_module
   ```

2. **Check NGINX config generation:**
   ```bash
   kubectl exec -n ingress-nginx <nginx-pod> -- cat /etc/nginx/nginx.conf | grep limit
   # Should show limit_req_zone and limit_req directives
   ```

3. **Recreate ingress:**
   ```bash
   kubectl delete ingress marcus-ingress -n marcus-platform
   kubectl apply -f k8s/ingress.yaml
   ```

### Cloud Armor Not Blocking Requests

**Symptoms (GCP):**
- Cloud Armor policy created but not enforcing
- No denied requests in Cloud Logging

**Diagnosis:**
```bash
# Check if policy is attached to backend service
gcloud compute backend-services describe <backend-service> --global | grep securityPolicy
```

**Solutions:**

1. **Attach policy to backend service:**
   ```bash
   # Get backend service name
   gcloud compute backend-services list

   # Attach policy
   gcloud compute backend-services update <backend-service> \
     --security-policy=marcus-security-policy \
     --global
   ```

2. **Verify rules are active:**
   ```bash
   gcloud compute security-policies rules list marcus-security-policy
   # All rules should show as "ACTIVE"
   ```

3. **Check rule priority:**
   - Lower priority numbers = higher precedence
   - Ensure allow rules don't override deny rules

### High Burst Leading to Resource Exhaustion

**Symptoms:**
- 150 burst capacity allows brief resource exhaustion
- Workers queue depth spikes to 100+
- P95 latency spikes during bursts

**Diagnosis:**
```bash
# Check worker queue metrics
kubectl port-forward -n marcus-platform svc/prometheus 9090:9090
# Query: citations_queue_depth
```

**Solutions:**

1. **Reduce burst capacity:**
   ```yaml
   nginx.ingress.kubernetes.io/limit-burst-multiplier: "50"  # Was 75 (150 → 100 burst)
   ```

2. **Add queue-based backpressure:**
   - Return 503 if queue depth > 50
   - See `src/platform/api/worker-orchestrator-server.ts`

3. **Scale workers proactively:**
   - Lower HPA threshold (queue depth > 5 instead of > 10)
   - See `k8s/hpa-citation-workers.yaml`

---

## Best Practices

1. **Start conservative, tune based on metrics**
   - Begin with strict limits (100 req/min)
   - Monitor rejection rate (target <10% for legitimate traffic)
   - Gradually increase if needed

2. **Layer defenses**
   - Ingress rate limiting (first line)
   - Application rate limiting (fine-grained)
   - Cloud Armor (advanced protection)

3. **Monitor continuously**
   - Set up alerts for high rejection rates
   - Track top rate-limited IPs (may indicate attackers)
   - Review logs weekly

4. **Communicate limits to users**
   - Document rate limits in API docs
   - Return `Retry-After` header with 429 responses
   - Provide status page showing current limits

5. **Test regularly**
   - Run load tests monthly
   - Verify rate limiting during deployments
   - Simulate attack scenarios

---

## References

- [NGINX Rate Limiting](https://www.nginx.com/blog/rate-limiting-nginx/)
- [Google Cloud Armor Best Practices](https://cloud.google.com/armor/docs/security-policy-concepts)
- [OWASP Rate Limiting Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html)
- [RFC 6585 - 429 Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)

---

**Last Updated:** November 22, 2025
**Contact:** marcus@platform.engineering
