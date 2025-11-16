# Load Testing

Load tests for Citation Integrity Platform using k6.

## Prerequisites

Install k6:

```bash
# macOS
brew install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Docker
docker pull grafana/k6
```

## Running Tests

### Local Testing

```bash
# Default (localhost:4000)
k6 run tests/load/k6-load-test.js

# Custom endpoint
k6 run --env BASE_URL=http://staging.citation-platform.com --env API_KEY=your_api_key tests/load/k6-load-test.js

# With Prometheus output
k6 run --out experimental-prometheus-rw tests/load/k6-load-test.js
```

### Docker

```bash
docker run --rm -v $(pwd)/tests/load:/tests grafana/k6 run /tests/k6-load-test.js
```

### Cloud (k6 Cloud)

```bash
k6 cloud tests/load/k6-load-test.js
```

## Test Scenarios

### Scenario 1: Baseline (100 req/min)

```bash
k6 run --vus 10 --duration 10m tests/load/k6-load-test.js
```

Expected results:
- p95 latency < 500ms
- Error rate < 1%
- Throughput: 100 req/min

### Scenario 2: Peak Load (1000 req/min)

```bash
k6 run --vus 100 --duration 10m tests/load/k6-load-test.js
```

Expected results:
- p95 latency < 1000ms
- Error rate < 1%
- Throughput: 1000 req/min

### Scenario 3: Stress Test (10,000 req/min)

```bash
k6 run --vus 1000 --duration 5m tests/load/k6-load-test.js
```

Expected results:
- p95 latency < 5000ms
- Error rate < 5%
- System degradation graceful (no crashes)

## Metrics

### Key Metrics

- **http_req_duration**: Request duration (p95 < 500ms target)
- **http_req_failed**: Failed request rate (< 1% target)
- **errors**: Custom error rate
- **successful_requests**: Total successful requests
- **failed_requests**: Total failed requests

### Thresholds

```javascript
thresholds: {
  'http_req_duration': ['p(95)<500'],  // 95% < 500ms
  'errors': ['rate<0.01'],             // < 1% errors
  'http_req_failed': ['rate<0.01'],    // < 1% failures
}
```

## Results Analysis

### CLI Output

```
     ✓ status is 200
     ✓ response time < 500ms

     checks.........................: 100.00% ✓ 12000      ✗ 0
     data_received..................: 24 MB   40 kB/s
     data_sent......................: 3.6 MB  6.0 kB/s
     http_req_blocked...............: avg=1.2ms   min=1µs   med=3µs    max=456ms  p(95)=5µs
     http_req_duration..............: avg=245ms   min=100ms med=200ms  max=2s     p(95)=450ms
     http_reqs......................: 12000   20/s
     iterations.....................: 12000   20/s
```

### Prometheus Integration

Export to Prometheus for long-term analysis:

```bash
k6 run --out experimental-prometheus-rw tests/load/k6-load-test.js
```

View in Grafana dashboard.

## Performance Budgets

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| p50 latency | < 200ms | > 300ms | > 500ms |
| p95 latency | < 500ms | > 800ms | > 1000ms |
| p99 latency | < 1000ms | > 2000ms | > 5000ms |
| Error rate | < 0.1% | > 0.5% | > 1% |
| Throughput | > 100 req/min | < 80 req/min | < 50 req/min |

## Optimization Tips

If tests fail:

1. **High latency**:
   - Check database connection pool size
   - Enable query caching
   - Add database indexes
   - Use CDN for static assets

2. **High error rate**:
   - Check application logs
   - Verify rate limiting not triggering
   - Check database connection limits
   - Verify API authentication

3. **Low throughput**:
   - Scale horizontally (more pods/instances)
   - Increase resource limits (CPU/memory)
   - Optimize slow queries
   - Enable caching (Redis)

## CI/CD Integration

Add to GitHub Actions:

```yaml
- name: Load Test
  run: |
    k6 run --vus 50 --duration 5m \
      --env BASE_URL=${{ secrets.STAGING_URL }} \
      --env API_KEY=${{ secrets.API_KEY }} \
      tests/load/k6-load-test.js
```

## Monitoring During Load Tests

```bash
# Watch metrics endpoint
watch -n 1 'curl -s http://localhost:4000/metrics | grep -E "http_requests_total|http_request_duration"'

# Watch database connections
watch -n 1 'psql -U citation_platform -d citation_platform -c "SELECT count(*) FROM pg_stat_activity;"'

# Watch Redis metrics
redis-cli INFO stats | grep -E "total_connections_received|total_commands_processed"
```

## Troubleshooting

### Connection Refused

```bash
# Check if server is running
curl http://localhost:4000/health

# Check port
lsof -i :4000
```

### Too Many Open Files

```bash
# Increase file descriptor limit
ulimit -n 65536
```

### Out of Memory

```bash
# Monitor memory during test
watch -n 1 'docker stats citation-api'
```
