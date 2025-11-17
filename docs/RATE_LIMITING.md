# Rate Limiting

The MARCUS platform implements comprehensive rate limiting to prevent DoS attacks and abuse.

## Overview

**Key Features:**
- IP-based and user-based rate limiting
- Distributed rate limiting using Redis (sliding window algorithm)
- Configurable limits per endpoint
- Automatic IP blocking after repeated violations
- Rate limit headers in all responses
- Prometheus metrics for monitoring

## Rate Limit Policies

### Analysis Endpoint

**Endpoint:** `POST /api/citations/analyze`

**Limits:**
- IP-based: 100 requests per minute
- User-based: 500 requests per minute (authenticated users)

**Rationale:** Analysis operations are resource-intensive. IP-based limiting prevents abuse from unauthenticated sources, while authenticated users get higher limits for legitimate use cases.

### Login Endpoint

**Endpoint:** `POST /auth/login`

**Limits:**
- 5 requests per minute per IP
- Automatic blocking after 5 violations within 5 minutes (1 hour block)

**Rationale:** Strict limiting prevents brute force attacks. The low limit is sufficient for legitimate login attempts while blocking automated attacks.

### Health Check Endpoint

**Endpoint:** `GET /health`

**Limits:**
- 1000 requests per minute per IP

**Rationale:** High limit allows frequent health checks from monitoring systems and load balancers without interference.

### Metrics Endpoint

**Endpoint:** `GET /api/metrics`

**Limits:**
- 500 requests per minute per IP

**Rationale:** Metrics are read-only and relatively cheap, but should still be rate-limited to prevent excessive scraping.

### Admin Endpoints

**Endpoints:** `POST /api/admin/*`

**Limits:**
- 200 requests per minute per authenticated user

**Rationale:** Admin operations are sensitive but legitimate use cases may require multiple operations. User-based limiting ensures fair distribution.

## Rate Limit Headers

All responses include the following headers:

```
X-RateLimit-Limit: 100        # Maximum requests allowed in window
X-RateLimit-Remaining: 87     # Requests remaining in current window
X-RateLimit-Reset: 1704067260 # Unix timestamp when window resets
```

When rate limit is exceeded, additional header:

```
Retry-After: 60               # Seconds to wait before retrying
```

## HTTP 429 Response

When rate limit is exceeded, the server returns HTTP 429 (Too Many Requests):

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Maximum 100 requests per 60s",
  "retryAfter": 60,
  "resetTime": 1704067260
}
```

## Handling Rate Limits in Clients

### Exponential Backoff

Recommended retry strategy for 429 responses:

```typescript
async function callAPIWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  let retries = 0;

  while (retries < maxRetries) {
    const response = await fetch(url, options);

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const waitSeconds = retryAfter
        ? parseInt(retryAfter, 10)
        : Math.pow(2, retries); // Exponential backoff

      console.warn(`Rate limited. Retrying after ${waitSeconds}s...`);
      await sleep(waitSeconds * 1000);

      retries++;
      continue;
    }

    return response;
  }

  throw new Error('Max retries exceeded');
}
```

### Respecting Rate Limit Headers

Proactive rate limiting using headers:

```typescript
class RateLimitedClient {
  private remaining: number = Infinity;
  private resetTime: number = 0;

  async request(url: string, options: RequestInit): Promise<Response> {
    // Wait if rate limit exhausted
    if (this.remaining <= 0 && Date.now() < this.resetTime * 1000) {
      const waitMs = this.resetTime * 1000 - Date.now();
      console.warn(`Rate limit exhausted. Waiting ${waitMs}ms...`);
      await sleep(waitMs);
    }

    const response = await fetch(url, options);

    // Update rate limit state from headers
    this.remaining = parseInt(
      response.headers.get('X-RateLimit-Remaining') || '0',
      10
    );
    this.resetTime = parseInt(
      response.headers.get('X-RateLimit-Reset') || '0',
      10
    );

    return response;
  }
}
```

## IP Blocking

IPs that violate rate limits repeatedly are automatically blocked.

**Block Triggers:**
- 10 violations within 1 hour window
- Block duration: 1 hour

**Manual Unblocking:**
```typescript
// Admin API (requires admin role)
POST /api/admin/unblock-ip
{
  "ip": "203.0.113.1"
}
```

## Configuration

### Environment Variables

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=your_redis_password
REDIS_MAX_RETRIES=3

# Rate Limiting
RATE_LIMITING_ENABLED=true
TRUSTED_PROXIES=10.0.0.1,10.0.0.2  # IPs to skip rate limiting
```

### Disabling Rate Limiting

For development/testing only:

```bash
RATE_LIMITING_ENABLED=false
```

**Warning:** Never disable rate limiting in production.

### Trusted Proxies

If your platform is behind a load balancer or reverse proxy, configure trusted proxy IPs to skip rate limiting for health checks:

```bash
TRUSTED_PROXIES=10.0.0.1,192.168.1.1
```

**Security Warning:** Only add IPs of load balancers you control. X-Forwarded-For headers from untrusted sources can be spoofed.

## Monitoring

### Prometheus Metrics

Rate limiting metrics are exposed at `/api/metrics`:

```
# Total requests by endpoint
ratelimit_requests_total{endpoint="/api/citations/analyze"} 1523

# Allowed requests
ratelimit_requests_allowed{endpoint="/api/citations/analyze"} 1498

# Blocked requests (rate limit exceeded)
ratelimit_requests_blocked{endpoint="/api/citations/analyze"} 25

# Total violations
ratelimit_violations{endpoint="/api/citations/analyze"} 25

# Currently blocked IPs
ratelimit_blocked_ips{endpoint="/api/citations/analyze"} 3
```

### Grafana Dashboard

Recommended visualizations:

1. **Rate Limit Hit Rate** - `ratelimit_requests_blocked / ratelimit_requests_total`
2. **Violations Over Time** - `rate(ratelimit_violations[5m])`
3. **Blocked IPs** - `ratelimit_blocked_ips`

### Alerting

Recommended alerts:

```yaml
# High violation rate (potential DDoS)
- alert: HighRateLimitViolations
  expr: rate(ratelimit_violations[5m]) > 10
  for: 5m
  annotations:
    summary: "High rate limit violation rate"
    description: "{{ $value }} violations/sec on {{ $labels.endpoint }}"

# Many blocked IPs (potential DDoS)
- alert: ManyBlockedIPs
  expr: ratelimit_blocked_ips > 50
  for: 5m
  annotations:
    summary: "Many IPs blocked by rate limiter"
    description: "{{ $value }} IPs currently blocked"
```

## Requesting Rate Limit Increases

If you have legitimate use cases requiring higher rate limits:

1. **Contact Platform Team:**
   - Email: platform@example.com
   - Include: Use case description, expected request volume, business justification

2. **Temporary Increase:**
   - Admin can whitelist specific IPs via `TRUSTED_PROXIES`

3. **Permanent Increase:**
   - Requires code change to `RateLimitPresets` in `src/platform/middleware/rateLimiter.ts`
   - Must be reviewed and approved by security team

## Security Considerations

### IP Spoofing

The rate limiter uses the client IP address from:
1. `X-Forwarded-For` header (first IP) - only trusted if from known proxy
2. Direct connection IP - fallback

**Mitigation:**
- Only trust `X-Forwarded-For` from configured `TRUSTED_PROXIES`
- Validate proxy IPs are your load balancers
- Never expose platform directly to internet - always use load balancer

### IPv6 Support

Rate limiter handles both IPv4 and IPv6 addresses correctly. No special configuration needed.

### Distributed Limiting

Redis-based sliding window ensures rate limits work correctly across multiple server instances:
- All servers share same Redis instance
- Rate limit state is synchronized automatically
- No coordination needed between servers

### Sliding Window Algorithm

The implementation uses Redis sorted sets with timestamps:
1. Each request adds timestamp to sorted set
2. Expired timestamps are removed atomically
3. Current count determines if request is allowed
4. Prevents burst abuse at window boundaries

**Example:**
```
Window: 60 seconds, Limit: 5 requests

Timeline:
  0s: Request 1-5 (allowed)
  1s: Request 6 (blocked)
 30s: Request 7 (blocked)
 60s: Request 8 (allowed - window reset)
```

## Testing

### Unit Tests

```bash
npm test src/platform/tests/rateLimiter.test.ts
```

### Manual Testing

Test rate limiting with curl:

```bash
# Test basic rate limiting
for i in {1..10}; do
  curl -i http://localhost:3000/api/citations/analyze \
    -H "Content-Type: application/json" \
    -d '{"text": "test", "claimedSource": "test"}'
done

# Check for 429 after limit exceeded

# Test with authentication
TOKEN="your_jwt_token"
for i in {1..10}; do
  curl -i http://localhost:3000/api/admin/users \
    -H "Authorization: Bearer $TOKEN"
done
```

### Load Testing

Test distributed rate limiting with multiple clients:

```bash
# Use Apache Bench
ab -n 1000 -c 10 http://localhost:3000/health

# Use wrk
wrk -t10 -c100 -d30s http://localhost:3000/health
```

Verify:
- Rate limits enforced correctly
- No race conditions in distributed scenario
- Metrics accurate

## Troubleshooting

### Rate Limit Not Working

Check:
1. Redis connectivity: `redis-cli ping`
2. Environment variables: `RATE_LIMITING_ENABLED=true`
3. Server logs for rate limiter initialization
4. IP not in `TRUSTED_PROXIES` whitelist

### False Positives

If legitimate users are blocked:

1. Check if IP is shared (NAT, corporate proxy)
2. Increase rate limits for affected endpoint
3. Use user-based limiting instead of IP-based
4. Whitelist specific IPs via `TRUSTED_PROXIES`

### Redis Connection Issues

If Redis is unavailable:
- Rate limiter fails open (allows requests)
- Error logged but no 500 error to client
- Monitor Redis health via `/health` endpoint

### IP Extraction Issues

If rate limiting not working behind proxy:

1. Verify `X-Forwarded-For` header is set by load balancer
2. Add load balancer IP to `TRUSTED_PROXIES`
3. Check server logs for extracted IP address

---

**Last Updated:** 2025-01-17
**Author:** Marcus (Platform Engineer)
**Version:** 1.0
