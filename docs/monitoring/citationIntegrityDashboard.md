# Citation Integrity Platform - Monitoring Dashboard

**Status**: Production Ready
**Owner**: Platform Engineering (Marcus)
**Last Updated**: 2025-11-16

---

## Overview

Comprehensive monitoring dashboard for the citation integrity platform. Tracks Nested Learning metrics, LSS signals, verification pipeline performance, and system health.

**Key Metrics**:
- **Nested Learning**: 4-level state hierarchy, update frequency validation
- **LSS Monitoring**: Parameter drift, claim deviation, memory staleness
- **Performance**: Throughput, latency, cache hit rate
- **Quality**: Fabrication detection rate, grade consistency, inter-rater reliability

---

## Dashboard Sections

### 1. Nested Learning Architecture Health

**Purpose**: Validate 4-level memory hierarchy is functioning correctly

#### Metrics

| Metric | Target | Alert Threshold | Description |
|--------|--------|----------------|-------------|
| **Update Frequency Hierarchy** | f_L0 > f_L1 > f_L2 > f_L3 | Hierarchy violated | Ensures proper multi-timescale learning |
| **Level 0 (Fast) Update Rate** | 1.0 (every operation) | < 0.9 | Immediate context updates |
| **Level 1 (Medium) Update Rate** | 0.1 (every ~10 ops) | < 0.05 or > 0.15 | Active processing updates |
| **Level 2 (Slow) Update Rate** | 0.01 (every ~100 ops) | < 0.005 or > 0.015 | Pattern learning updates |
| **Level 3 (Core) Update Rate** | 0.001 (every ~1000 ops) | < 0.0005 or > 0.0015 | Core knowledge updates |
| **Consolidation Flow Active** | 100% | < 90% | L0 → L1 → L2 → L3 working |

#### Visualization

```
┌─────────────────────────────────────────────────┐
│ Nested Learning Hierarchy                      │
├─────────────────────────────────────────────────┤
│ Level 0 (Fast):    ████████████████  1.00      │
│ Level 1 (Medium):  ████              0.10      │
│ Level 2 (Slow):    ██                0.01      │
│ Level 3 (Core):    █                 0.001     │
│                                                 │
│ ✓ Hierarchy Valid: f_L0 > f_L1 > f_L2 > f_L3  │
│ ✓ Consolidation Flow Active                   │
└─────────────────────────────────────────────────┘
```

#### Queries (Prometheus)

```promql
# Update frequency by level
rate(nl_level_updates_total{level="0"}[1m])
rate(nl_level_updates_total{level="1"}[1m])
rate(nl_level_updates_total{level="2"}[1m])
rate(nl_level_updates_total{level="3"}[1m])

# Hierarchy validation
(nl_level_frequency{level="0"} > nl_level_frequency{level="1"}) and
(nl_level_frequency{level="1"} > nl_level_frequency{level="2"}) and
(nl_level_frequency{level="2"} > nl_level_frequency{level="3"})

# Consolidation flow rate
rate(nl_consolidation_total{from="0",to="1"}[5m])
rate(nl_consolidation_total{from="1",to="2"}[5m])
rate(nl_consolidation_total{from="2",to="3"}[5m])
```

---

### 2. LSS (Local Surprise Signal) Monitoring

**Purpose**: Track deviation signals that trigger learning and alerts

#### Metrics

| Metric | Formula | Target | Alert Threshold | Description |
|--------|---------|--------|----------------|-------------|
| **Parameter Drift LSS** | \|current - cited\| / cited | 0 (no drift) | > 0.2 (20% drift) | Parameter divergence from research |
| **Claim Deviation LSS** | 1 - semantic_similarity | < 0.1 | > 0.4 | Claim vs source mismatch |
| **Memory Staleness LSS** | elapsed / expected_interval | < 1.0 | > 4.0 | Memory save delays |
| **Verification Failure LSS** | 1.0 if not found, else 0 | 0 (verified) | 1.0 (fabricated) | Claim verification status |
| **High LSS Alerts (24h)** | Count of LSS > 0.5 | 0 | > 10 | Number of significant deviations |

#### Visualization

```
┌─────────────────────────────────────────────────┐
│ LSS Signals (Last 24h)                         │
├─────────────────────────────────────────────────┤
│ Parameter Drift:    ██░░░░░░░░  0.15  ✓       │
│ Claim Deviation:    ████░░░░░░  0.32  ⚠       │
│ Memory Staleness:   ░░░░░░░░░░  0.02  ✓       │
│ Verification Fail:  ██████████  1.00  🚨       │
│                                                 │
│ Total Alerts: 3                                │
│   CRITICAL: 1 (fabricated citation)            │
│   WARNING:  2 (claim deviation)                │
└─────────────────────────────────────────────────┘
```

#### Queries (Prometheus)

```promql
# Parameter drift LSS
lss_parameter_drift{type="VERIFIED"}

# Claims with high deviation
count(lss_claim_deviation > 0.4)

# Memory staleness (agents not saving)
lss_memory_staleness{agent=~".*"}

# Verification failures
count(lss_verification_failure == 1.0)

# High LSS events (requiring consolidation)
count(lss_total > 0.5)
```

---

### 3. Verification Pipeline Performance

**Purpose**: Track citation verification throughput and latency

#### Metrics

| Metric | Target | Alert Threshold | Description |
|--------|--------|----------------|-------------|
| **Throughput** | 100+ citations/hour | < 50/hour | Verification processing rate |
| **Latency p50** | < 2s | > 5s | Median verification time |
| **Latency p95** | < 10s | > 15s | 95th percentile latency |
| **Latency p99** | < 20s | > 30s | 99th percentile latency |
| **Queue Depth** | < 100 | > 500 | Pending verifications |
| **Processing Concurrency** | 5-10 | < 2 | Parallel verification workers |
| **MCP Server Uptime** | 99.9% | < 95% | Citation-verifier availability |

#### Visualization

```
┌─────────────────────────────────────────────────┐
│ Verification Pipeline (Last Hour)              │
├─────────────────────────────────────────────────┤
│ Throughput:  142 citations/hour     ✓          │
│ Latency p50: 1.8s                   ✓          │
│ Latency p95: 8.2s                   ✓          │
│ Queue Depth: 42 pending             ✓          │
│                                                 │
│ ┌───────────────────────────────────┐          │
│ │ 150├──────────────────────────────│          │
│ │ 100├────█────█────█───────────────│          │
│ │  50├──█─█──█─█──█─█───────────────│          │
│ │   0└──────────────────────────────│          │
│ │    0h  15m  30m  45m  60m         │          │
│ └───────────────────────────────────┘          │
└─────────────────────────────────────────────────┘
```

#### Queries (Prometheus)

```promql
# Throughput (citations per hour)
rate(verification_requests_total[1h]) * 3600

# Latency percentiles
histogram_quantile(0.50, verification_duration_seconds)
histogram_quantile(0.95, verification_duration_seconds)
histogram_quantile(0.99, verification_duration_seconds)

# Queue depth
verification_queue_depth

# Concurrency
verification_workers_active
```

---

### 4. Cache Performance

**Purpose**: Monitor caching effectiveness for reducing MCP server load

#### Metrics

| Metric | Target | Alert Threshold | Description |
|--------|--------|----------------|-------------|
| **Cache Hit Rate** | 80%+ | < 60% | Percentage of cached responses |
| **Cache Size** | < 10,000 entries | > 50,000 | Current cache entries |
| **Cache Memory** | < 100 MB | > 500 MB | Memory consumed by cache |
| **Cache Eviction Rate** | < 10/min | > 100/min | Entries evicted (LRU) |
| **TTL Expiration Rate** | < 5/min | > 50/min | Entries expired |

#### Visualization

```
┌─────────────────────────────────────────────────┐
│ Cache Performance                              │
├─────────────────────────────────────────────────┤
│ Hit Rate: 84.2% ████████▓░  (Target: 80%+)    │
│ Size:     8,234 entries                        │
│ Memory:   67 MB                                │
│                                                 │
│ Last Hour:                                     │
│   Hits:   3,421                                │
│   Misses:   642                                │
│   Evicted:   42                                │
│   Expired:   18                                │
└─────────────────────────────────────────────────┘
```

#### Queries (Prometheus)

```promql
# Cache hit rate
rate(cache_hits_total[5m]) / (rate(cache_hits_total[5m]) + rate(cache_misses_total[5m]))

# Cache size
cache_entries_current

# Memory usage
cache_memory_bytes

# Eviction/expiration rates
rate(cache_evictions_total[1m])
rate(cache_expirations_total[1m])
```

---

### 5. Grading Quality

**Purpose**: Track automated grading accuracy and consistency

#### Metrics

| Metric | Target | Alert Threshold | Description |
|--------|--------|----------------|-------------|
| **Fabrication Detection Rate** | 100% | < 95% | % of fabrications caught |
| **False Positive Rate** | < 5% | > 10% | Valid claims flagged as invalid |
| **Inter-Rater Reliability** | ≥ 0.9 (Cohen's kappa) | < 0.8 | Human vs auto grading agreement |
| **Grade Drift** | < 5% from baseline | > 10% | Deviation from historical avg |
| **Grading Time (p95)** | < 5 min | > 10 min | Time to grade assignment |

#### Visualization

```
┌─────────────────────────────────────────────────┐
│ Grading Quality Metrics                        │
├─────────────────────────────────────────────────┤
│ Fabrication Detection: 98.7%  ✓               │
│ False Positives:        3.2%  ✓               │
│ Inter-Rater (κ):        0.92  ✓               │
│ Grade Drift:           +2.1%  ✓               │
│                                                 │
│ Grade Distribution (vs Baseline):              │
│   A: 18% ████░ (Baseline: 20%)                │
│   B: 35% ███████░ (Baseline: 33%)             │
│   C: 30% ██████ (Baseline: 28%)               │
│   D: 12% ███ (Baseline: 13%)                  │
│   F:  5% ██ (Baseline: 6%)                    │
└─────────────────────────────────────────────────┘
```

#### Queries (Prometheus)

```promql
# Fabrication detection rate
grading_fabrications_caught_total / grading_fabrications_total

# False positive rate
grading_false_positives_total / grading_claims_total

# Inter-rater reliability (Cohen's kappa)
grading_inter_rater_kappa

# Grade drift from baseline
(grading_avg_grade - grading_baseline_avg) / grading_baseline_avg

# Grading time
histogram_quantile(0.95, grading_duration_seconds)
```

---

### 6. Memory Discipline

**Purpose**: Track agent memory saving and consolidation

#### Metrics

| Metric | Target | Alert Threshold | Description |
|--------|--------|----------------|-------------|
| **Tool Use Logging Rate** | 100% | < 90% | % of tool uses logged |
| **Task Detection Rate** | 100% | < 80% | % of tasks detected |
| **Session Summarization Rate** | 100% | < 95% | % of sessions summarized |
| **Amnesia Incidents (30d)** | 0 | > 1 | Repeated work due to memory loss |
| **Memory Staleness (avg)** | < 24h | > 72h | Time since last save |

#### Visualization

```
┌─────────────────────────────────────────────────┐
│ Memory Discipline (Agent: test-agent)          │
├─────────────────────────────────────────────────┤
│ Tool Logging:     100% ██████████  ✓           │
│ Task Detection:    98% █████████▓  ✓           │
│ Summarization:    100% ██████████  ✓           │
│ Amnesia Events:     0               ✓           │
│ Staleness:       18h                ✓           │
│                                                 │
│ Last 24h Activity:                             │
│   Tool Uses:  142                              │
│   Tasks:       12                              │
│   Sessions:     3                              │
│   Learnings:    8                              │
└─────────────────────────────────────────────────┘
```

#### Queries (Prometheus)

```promql
# Tool use logging rate
memory_tool_uses_logged_total / memory_tool_uses_total

# Task detection rate
memory_tasks_detected_total / memory_task_signals_total

# Session summarization rate
memory_sessions_summarized_total / memory_sessions_total

# Amnesia incidents
memory_amnesia_incidents_total

# Memory staleness (average time since last save)
avg(time() - memory_last_save_timestamp)
```

---

## Alert Rules

### Critical Alerts (PagerDuty)

```yaml
alerts:
  - alert: ParameterDriftCritical
    expr: lss_parameter_drift{type="VERIFIED"} > 0.5
    for: 5m
    severity: critical
    annotations:
      summary: "Parameter drift >50% from citation"
      description: "Parameter {{ $labels.parameter }} has drifted {{ $value }} from cited value"

  - alert: FabricationDetected
    expr: lss_verification_failure == 1.0
    for: 1m
    severity: critical
    annotations:
      summary: "Fabricated citation detected"
      description: "Citation {{ $labels.citation }} could not be verified"

  - alert: FrequencyHierarchyViolated
    expr: |
      (nl_level_frequency{level="0"} <= nl_level_frequency{level="1"}) or
      (nl_level_frequency{level="1"} <= nl_level_frequency{level="2"}) or
      (nl_level_frequency{level="2"} <= nl_level_frequency{level="3"})
    for: 5m
    severity: critical
    annotations:
      summary: "Nested Learning hierarchy violated"
      description: "Update frequency ordering broken: f_L0 > f_L1 > f_L2 > f_L3"
```

### Warning Alerts (Slack)

```yaml
alerts:
  - alert: ParameterDriftWarning
    expr: lss_parameter_drift{type="VERIFIED"} > 0.2
    for: 15m
    severity: warning
    annotations:
      summary: "Parameter drift >20% from citation"
      description: "Parameter {{ $labels.parameter }} should be re-validated"

  - alert: CacheHitRateLow
    expr: rate(cache_hits_total[5m]) / (rate(cache_hits_total[5m]) + rate(cache_misses_total[5m])) < 0.6
    for: 30m
    severity: warning
    annotations:
      summary: "Cache hit rate below 60%"
      description: "Consider increasing cache size or TTL"

  - alert: VerificationThroughputLow
    expr: rate(verification_requests_total[1h]) * 3600 < 50
    for: 1h
    severity: warning
    annotations:
      summary: "Verification throughput below 50/hour"
      description: "Check queue health and MCP server connectivity"
```

---

## Dashboard Setup

### Grafana Dashboard

**Import Template**: `dashboards/citation-integrity.json`

**Panels**:
1. Nested Learning Hierarchy (gauge + graph)
2. LSS Signals (heatmap)
3. Verification Pipeline (throughput + latency)
4. Cache Performance (hit rate + size)
5. Grading Quality (detection rate + drift)
6. Memory Discipline (logging rate + staleness)

**Refresh Rate**: 30s

### Prometheus Configuration

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'citation-integrity'
    scrape_interval: 15s
    static_configs:
      - targets:
          - 'localhost:9090'  # Citation integrity metrics endpoint
    metric_relabel_configs:
      - source_labels: [__name__]
        regex: '(nl|lss|verification|cache|grading|memory)_.*'
        action: keep
```

---

## Runbook Integration

**See Also**:
- [Troubleshooting Guide](./troubleshooting.md) - Common issues and resolutions
- [Deployment Guide](./deployment.md) - Deployment procedures
- [Incident Response](./incident-response.md) - On-call procedures

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2025-11-16 | Initial dashboard design | Marcus (Platform Engineer) |
| 2025-11-16 | Added Nested Learning metrics | Marcus |
| 2025-11-16 | Added LSS monitoring section | Marcus |
