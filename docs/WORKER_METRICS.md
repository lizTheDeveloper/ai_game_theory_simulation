# Citation Worker Metrics - Implementation Guide

**Status:** ✅ Implemented (2025-11-22)
**Port:** 9300
**Pattern:** Aggregator (connection pooling)

## Overview

The Citation Worker Metrics system provides Prometheus-compatible metrics aggregation for all 9 Python citation workers using a connection pooling pattern. Instead of each worker exposing its own port (9200-9208), all workers report to a shared registry exposed on a single endpoint (port 9300).

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                 Prometheus (9090)                    │
│              Single scrape every 30s                 │
└──────────────────────┬──────────────────────────────┘
                       │
                       │ scrapes http://localhost:9300/metrics
                       │
            ┌──────────▼──────────┐
            │  Metrics Aggregator  │  Port 9300
            │  (HTTP Server)       │  worker_metrics_server.py
            └──────────┬──────────┘
                       │
                       │ reads METRICS_REGISTRY
                       │
     ┌─────────────────┴─────────────────┐
     │      Shared Prometheus Registry    │
     │         (METRICS_REGISTRY)         │
     └─────────────────┬─────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
    ┌────▼───┐   ┌────▼───┐   ┌────▼───┐
    │Worker 0│   │Worker 1│...│Worker 8│
    │citation│   │citation│   │citation│
    │_worker │   │_worker │   │_worker │
    └────────┘   └────────┘   └────────┘
```

**Benefits of Aggregator Pattern:**
- **Single endpoint** - Prometheus scrapes once, gets all worker metrics
- **Reduced overhead** - 1 HTTP request instead of 9
- **Simplified configuration** - One scrape job instead of 9 targets
- **Shared registry** - Like database connection pooling
- **Easier port management** - Only 9300 to manage

## Exposed Metrics

### Task Processing
```promql
# Total tasks processed by status (success/failure)
citation_tasks_processed_total{agent_id="agent_0", status="success"}

# Task processing duration histogram
citation_task_duration_seconds_bucket{agent_id="agent_0", le="0.1"}
citation_task_duration_seconds_sum{agent_id="agent_0"}
citation_task_duration_seconds_count{agent_id="agent_0"}
```

### Agent Health
```promql
# Agent reputation score (0-1)
citation_agent_reputation{agent_id="agent_0"}

# Number of active workers
citation_workers_active

# Queue depth
citation_queue_depth
```

### Citation Quality
```promql
# Distribution of integrity scores
citation_integrity_score_bucket{agent_id="agent_0", le="0.5"}
citation_integrity_score_sum{agent_id="agent_0"}
citation_integrity_score_count{agent_id="agent_0"}
```

## Installation

### 1. Install Dependencies
```bash
pip install prometheus-client>=0.19.0
```

### 2. Start Metrics Aggregator
```bash
# Using startup script
./scripts/start_worker_metrics.sh

# Or manually
python3 src/platform/metrics/worker_metrics_server.py
```

### 3. Verify Endpoints
```bash
# Health check
curl http://localhost:9300/health
# Expected: {"status": "ok", "service": "worker-metrics-aggregator", ...}

# Metrics endpoint
curl http://localhost:9300/metrics
# Expected: Prometheus-format metrics
```

### 4. Configure Prometheus

Add to `/etc/prometheus/prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'citation-workers'
    static_configs:
      - targets: ['localhost:9300']
        labels:
          service: 'citation-workers'
          component: 'agents'
          pattern: 'aggregator'
    metrics_path: '/metrics'
    scrape_interval: 30s
    scrape_timeout: 10s
```

Reload Prometheus:
```bash
sudo systemctl reload prometheus
```

### 5. Verify Prometheus Scraping
```bash
# Check targets
curl 'http://localhost:9090/api/v1/targets' | \
  jq '.data.activeTargets[] | select(.job=="citation-workers")'

# Query metrics
curl 'http://localhost:9090/api/v1/query?query=citation_workers_active'
```

## Production Deployment

### Systemd Service

Install service file:
```bash
sudo cp deployment/systemd/worker-metrics-aggregator.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable worker-metrics-aggregator
sudo systemctl start worker-metrics-aggregator
```

Check status:
```bash
sudo systemctl status worker-metrics-aggregator
```

View logs:
```bash
sudo journalctl -u worker-metrics-aggregator -f
```

## Grafana Dashboards

### Panel Examples

**Tasks Processed Rate:**
```promql
rate(citation_tasks_processed_total[5m])
```

**Task Duration P95:**
```promql
histogram_quantile(0.95, rate(citation_task_duration_seconds_bucket[5m]))
```

**Agent Reputation Heatmap:**
```promql
citation_agent_reputation
```

**Queue Depth Over Time:**
```promql
citation_queue_depth
```

**Success Rate:**
```promql
rate(citation_tasks_processed_total{status="success"}[5m]) /
rate(citation_tasks_processed_total[5m])
```

## Troubleshooting

### Metrics Server Won't Start

**Check port availability:**
```bash
sudo ss -tlnp | grep :9300
```

**Check logs:**
```bash
tail -f logs/worker_metrics_server.log
```

**Verify Python dependencies:**
```bash
pip show prometheus-client
```

### Prometheus Not Scraping

**Check target health:**
```bash
curl http://localhost:9090/api/v1/targets | \
  jq '.data.activeTargets[] | select(.job=="citation-workers") | .health'
```

**Check Prometheus config:**
```bash
promtool check config /etc/prometheus/prometheus.yml
```

**Check firewall:**
```bash
sudo ufw status | grep 9300
```

### No Metrics Appearing

**Verify workers are running:**
```bash
citation_workers_active  # Should be > 0
```

**Check shared registry import:**
```bash
python3 -c "from citation_worker import METRICS_REGISTRY; print('OK')"
```

**Restart metrics server:**
```bash
kill $(cat /tmp/worker_metrics_server.pid)
./scripts/start_worker_metrics.sh
```

## Performance Considerations

### Scrape Interval
- **30s** - Recommended for worker metrics (default)
- **15s** - For more frequent updates
- **60s** - For reduced load on low-activity systems

### Memory Usage
- Metrics registry: ~1-5 MB per worker
- HTTP server overhead: ~10 MB
- Total: ~20-50 MB typical

### Network Impact
- Single scrape: ~5-10 KB per worker
- At 30s interval: ~1 KB/s total

## References

- **Port Mapping:** `docs/PORT_MAPPING.md` (port 9300 documented)
- **Prometheus Config:** `/etc/prometheus/prometheus.yml`
- **Worker Code:** `src/platform/agents/citation_worker.py`
- **Aggregator Server:** `src/platform/metrics/worker_metrics_server.py`
- **Startup Script:** `scripts/start_worker_metrics.sh`
- **Systemd Service:** `deployment/systemd/worker-metrics-aggregator.service`

---

**Implementation Date:** 2025-11-22
**Author:** Marcus (Platform Engineer)
**Pattern:** Connection pooling aggregator (similar to database query pooling)
