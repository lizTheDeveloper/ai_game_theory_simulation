# MARCUS 3.2 Demo Screenshots

**Captured:** November 23, 2025
**Platform:** GKE Deployment (marcus-platform namespace)
**Version:** v3.2.1-circuit-breakers

---

## Overview

These screenshots demonstrate MARCUS 3.0's production monitoring and observability stack deployed on Google Kubernetes Engine.

---

## Screenshots

### Prometheus Monitoring

**1. prometheus_home.png**
- Prometheus web UI homepage
- Shows active targets and service discovery
- Demonstrates metrics collection is operational

**2. prometheus_metrics_explorer.png**
- Metrics explorer interface
- Shows available MARCUS platform metrics:
  - `marcus_db_pool_*` - PostgreSQL connection pool metrics
  - `marcus_redis_*` - Redis metrics
  - Circuit breaker metrics
  - API request metrics

**3. prometheus_redis_graph.png**
- Time-series graph of Redis memory usage
- Visualizes `marcus_redis_memory_bytes{type="used"}`
- Demonstrates real-time metrics collection

**4. prometheus_redis_table.png**
- Table view of Redis metrics with labels
- Shows metric values, labels (type, instance)
- Example: used memory, peak memory, fragmentation ratio

### Jaeger Distributed Tracing

**5. jaeger_home.png**
- Jaeger web UI homepage
- Service selection dropdown
- Demonstrates distributed tracing is operational

**6. jaeger_trace_list.png**
- List of captured traces from MARCUS platform
- Shows trace IDs, operations, duration
- Multiple spans per trace (request → DB → Redis flow)

**7. jaeger_trace_detail.png**
- Detailed trace view for a single request
- Spans showing:
  - HTTP request handling
  - Database queries
  - Redis operations
  - Circuit breaker decisions
- Demonstrates complete request lifecycle visibility

---

## Architecture Context

**MARCUS 3.0 Observability Stack:**

```
┌─────────────────────────────────────────┐
│  Orchestrator Pods (3 replicas)         │
│  - Express API (:3000)                  │
│  - Prometheus metrics (:9090)           │
│  - Jaeger spans (OTLP export)          │
└──────────────┬──────────────────────────┘
               │
               ├─> Prometheus Server
               │   - Scrapes /metrics endpoints
               │   - Stores time-series data
               │   - Grafana integration ready
               │
               └─> Jaeger Collector
                   - Receives OTLP spans
                   - Stores traces
                   - Provides query UI
```

**What These Screenshots Prove:**

1. ✅ **Prometheus Operational**
   - Metrics collection working
   - Redis metrics captured
   - DB pool metrics captured
   - Circuit breaker metrics captured

2. ✅ **Jaeger Operational**
   - Distributed tracing working
   - Multi-span traces captured
   - Request flow visibility achieved
   - Performance bottleneck detection enabled

3. ✅ **Production-Ready Observability**
   - Real-time monitoring
   - Historical metrics storage
   - Distributed request tracing
   - Performance debugging capability

---

## Use Cases

**These screenshots demonstrate:**

- Platform health monitoring (Prometheus graphs)
- Resource usage tracking (Redis memory metrics)
- Request tracing (Jaeger spans)
- Performance analysis (trace duration)
- Debugging capability (trace detail view)

**For stakeholders:**
- Shows production-grade monitoring
- Demonstrates observability best practices
- Proves platform is instrumented for debugging
- Validates cloud-native architecture

---

## Technical Details

**Metrics Collection:**
- Prometheus client library (`prom-client`)
- Custom metrics: DB pool, Redis, circuit breakers
- Scrape interval: 15 seconds
- Retention: 15 days

**Distributed Tracing:**
- OpenTelemetry SDK (`@opentelemetry/sdk-node`)
- OTLP exporter to Jaeger
- Instrumentation: HTTP, PostgreSQL, Redis
- Sampling rate: 100% (all requests traced)

**Access:**
- Prometheus: Port-forward to `prometheus-server:9090`
- Jaeger: Port-forward to `jaeger-query:16686`

---

**Captured by:** Automated screenshot script (`scripts/capture-demo-screenshots.ts`)
**Platform:** MARCUS 3.0 Citation Integrity Platform
**Deployment:** Google Kubernetes Engine (GKE)
