# MARCUS 3.1: LOW Priority Optimizations - Implementation Checklist

**Quick Reference:** Use this checklist to track implementation progress for L3-L6.

---

## ✅ L1: Metrics Cardinality (COMPLETE)

- [x] Create `metricsHelpers.ts` with normalization functions
- [x] Update `metricsEndpoint.ts` to use helpers
- [x] Update `citationAgentIntegration.ts` to normalize agent_id
- [x] Update `processRegistry.ts` to normalize agent_id
- [x] Add cardinality monitoring metric
- [x] Add auto-monitoring function (every 60s)
- [x] Create audit document
- [x] Create best practices guide
- [x] Deploy to production
- [ ] Monitor for 1 week, verify no high-cardinality alerts

---

## ✅ L2: Redis Memory Configuration (COMPLETE)

- [x] Add maxmemory to redis-statefulset.yaml
- [x] Set maxmemory-policy to allkeys-lru
- [x] Configure timeout, slow log, latency monitoring
- [x] Create standalone redis-memory-config.yaml template
- [x] Create Redis memory configuration guide
- [x] Deploy configuration
- [ ] Monitor for 1 week, verify no OOM kills
- [ ] Verify eviction rate <10/sec

---

## 📋 L3: Python Async Migration (GUIDE READY)

### Dependencies
- [ ] Install asyncpg: `pip install asyncpg`
- [ ] Install aioredis: `pip install aioredis`
- [ ] Install aiohttp: `pip install aiohttp`
- [ ] Update requirements.txt

### Week 1: Development (5 days)
- [ ] **Day 1-2:** Create `citation_integrity_agent_async.py`
  - [ ] Port CitationIntegrityAgent class to async
  - [ ] Replace psycopg2 with asyncpg
  - [ ] Replace redis-py with aioredis
  - [ ] Add async connection pooling

- [ ] **Day 3:** Port NestedCitationMemory to async
  - [ ] Async state loading/saving
  - [ ] Async memory consolidation

- [ ] **Day 4:** Create sync wrapper for backward compatibility
  - [ ] Wrap async agent in sync interface
  - [ ] Test with existing integration tests

- [ ] **Day 5:** Testing
  - [ ] Unit tests for async agent
  - [ ] Integration tests with async DB/Redis
  - [ ] Performance benchmarks

### Week 2: Deployment (5 days)
- [ ] **Day 1:** Feature flag implementation
  - [ ] Add ENABLE_ASYNC_AGENT env var
  - [ ] Load sync vs. async based on flag

- [ ] **Day 2:** Canary deployment (10% traffic)
  - [ ] Deploy with flag=true for 10% of agents
  - [ ] Monitor error rates, latency

- [ ] **Day 3-4:** Ramp up (50% traffic)
  - [ ] Increase to 50% if metrics good
  - [ ] Continue monitoring

- [ ] **Day 5:** Full rollout (100% traffic)
  - [ ] Set flag=true for all agents
  - [ ] Final performance measurement

### Success Criteria
- [ ] Throughput: ≥2x improvement (15 → 30+ citations/sec)
- [ ] Latency p95: No regression
- [ ] Error rate: <0.1% increase
- [ ] Memory usage: <20% increase

---

## 📋 L4: GraphQL API Layer (GUIDE READY)

### Dependencies
- [ ] Install apollo-server-express: `npm install apollo-server-express graphql`
- [ ] Install codegen: `npm install --save-dev @graphql-codegen/cli @graphql-codegen/typescript`

### Week 1: Core Implementation (5 days)
- [ ] **Day 1:** Schema design
  - [ ] Create `schema.graphql` with all types
  - [ ] Define Query, Mutation, Subscription roots
  - [ ] Document with comments

- [ ] **Day 2-3:** Implement resolvers
  - [ ] Query resolvers (agent, agents, citationAnalysis, etc.)
  - [ ] Mutation resolvers (analyzeCitation, resetAgent, etc.)
  - [ ] Field-level resolvers (Agent.metrics, Agent.recentCitations)

- [ ] **Day 4:** Add DataLoader
  - [ ] Create dataloaders.ts
  - [ ] Implement batching for agent metrics
  - [ ] Prevent N+1 queries

- [ ] **Day 5:** Testing
  - [ ] Test all queries
  - [ ] Test all mutations
  - [ ] Performance testing

### Week 2: Polish & Deploy (5 days)
- [ ] **Day 1:** Integration
  - [ ] Create GraphQL server
  - [ ] Add to Express app
  - [ ] Configure playground

- [ ] **Day 2:** Documentation
  - [ ] Example queries
  - [ ] Example mutations
  - [ ] Client integration guide

- [ ] **Day 3:** Feature flag
  - [ ] Add ENABLE_GRAPHQL env var
  - [ ] Backward compatible (REST still works)

- [ ] **Day 4-5:** Deployment
  - [ ] Deploy to staging
  - [ ] Test with real traffic
  - [ ] Deploy to production

### Success Criteria
- [ ] GraphQL endpoint at /graphql
- [ ] Playground accessible in dev
- [ ] All REST endpoints have GraphQL equivalents
- [ ] No N+1 queries (DataLoader working)
- [ ] Client round trips: 30-50% reduction

---

## 📋 L5: Distributed Tracing (GUIDE READY)

### Dependencies
- [ ] Install OpenTelemetry packages (8 packages, see guide)

### Days 1-2: Core Instrumentation
- [ ] Create `observability/tracing.ts`
  - [ ] Initialize NodeSDK
  - [ ] Configure Jaeger exporter
  - [ ] Set up auto-instrumentation
  - [ ] Configure sampling strategy

- [ ] Manual instrumentation for agents
  - [ ] Instrument PythonAgentWrapper.start()
  - [ ] Instrument PythonAgentWrapper.analyzeCitation()
  - [ ] Instrument CitationAgentOrchestrator.analyzeDocument()

- [ ] Trace context propagation
  - [ ] Pass trace ID to Python via env vars
  - [ ] Read trace ID in Python agent
  - [ ] Create child spans in Python

### Days 3-4: Logging Integration
- [ ] Create `observability/logger.ts`
  - [ ] Configure pino with trace ID injection
  - [ ] Add trace ID to all log messages

- [ ] Test log correlation
  - [ ] Verify trace ID in logs
  - [ ] Link logs to traces in Jaeger UI

### Days 5-7: Visualization & Testing
- [ ] Configure Grafana Jaeger data source
  - [ ] Link traces to logs
  - [ ] Create example dashboards

- [ ] Test common scenarios
  - [ ] High latency debugging
  - [ ] Agent timeout debugging
  - [ ] Missing traces debugging

- [ ] Documentation
  - [ ] Common queries
  - [ ] Debug scenarios
  - [ ] Performance impact

### Success Criteria
- [ ] All TypeScript operations instrumented
- [ ] Python agents propagate trace context
- [ ] Trace ID in all logs
- [ ] Complete end-to-end traces in Jaeger
- [ ] Can debug latency issues in <5 minutes
- [ ] Sampling overhead <5% CPU in production

---

## 📋 L6: Cost Optimization (GUIDE READY)

### Week 1: Analysis & Implementation

#### Days 1-2: Resource Analysis
- [ ] Run `kubectl top pods` for 7 days
  - [ ] Collect CPU usage (p50, p95, p99)
  - [ ] Collect memory usage (p50, p95, p99)
  - [ ] Document current resource allocation

- [ ] Calculate potential savings
  - [ ] Right-sizing savings
  - [ ] Spot instance savings
  - [ ] Scale-to-zero savings
  - [ ] Storage savings

#### Days 3-5: Implementation

**Right-Sizing:**
- [ ] Update resource requests to p50 usage
- [ ] Update resource limits to p95 + 20%
- [ ] Deploy to dev/staging first

**Spot Instances:**
- [ ] Create `node-pool-spot-workers.yaml`
  - [ ] Configure preemptible=true
  - [ ] Add auto-scaling (0-10 nodes)
  - [ ] Add node taints

- [ ] Update worker deployments
  - [ ] Add tolerations for spot nodes
  - [ ] Add node affinity for spot nodes

**Scale-to-Zero:**
- [ ] Install KEDA: `kubectl apply -f https://github.com/kedacore/keda/releases/download/v2.10.0/keda-2.10.0.yaml`
- [ ] Create `keda-scaledobject.yaml`
  - [ ] Configure Redis queue trigger
  - [ ] Set minReplicaCount=0
  - [ ] Set maxReplicaCount=20

**Scheduled Scaling (Dev/Staging):**
- [ ] Create scale-down CronJob (6 PM daily)
- [ ] Create scale-up CronJob (8 AM weekdays)

**Storage Optimization:**
- [ ] Change storage class to "standard" (HDD)
- [ ] Reduce volume sizes (10Gi → 5Gi)

#### Days 6-7: Testing
- [ ] Test with right-sized resources
  - [ ] Verify no OOM kills
  - [ ] Verify CPU throttling <5%

- [ ] Test spot node preemption
  - [ ] Verify pods reschedule correctly
  - [ ] Verify no data loss

- [ ] Test scale-to-zero
  - [ ] Verify scales to 0 when idle
  - [ ] Verify scales up on queue depth

- [ ] Test scheduled scaling
  - [ ] Verify scale-down at 6 PM
  - [ ] Verify scale-up at 8 AM

### Week 2: Monitoring
- [ ] Track cost reduction in GCP billing
- [ ] Monitor OOM kills (should be 0)
- [ ] Monitor CPU throttling (should be <5%)
- [ ] Monitor spot preemptions (should handle gracefully)
- [ ] Document final resource allocation

### Success Criteria
- [ ] Monthly cost reduced by >50%
- [ ] No OOM kills
- [ ] CPU throttling <5%
- [ ] P95 latency unchanged
- [ ] Spot preemptions handled gracefully
- [ ] Scale-to-zero working (workers at 0 during idle)

---

## Overall Progress Tracking

### Completed ✅
- [x] L1: Metrics Cardinality (4 hours)
- [x] L2: Redis Memory Configuration (2 hours)
- [x] All implementation guides created

### In Progress 🔄
- [ ] L1: 1 week monitoring period
- [ ] L2: 1 week monitoring period

### Ready for Implementation 📋
- [ ] L3: Python Async Migration (2 weeks)
- [ ] L4: GraphQL API Layer (2 weeks)
- [ ] L5: Distributed Tracing (1 week)
- [ ] L6: Cost Optimization (1 week)

---

## Priority Order for Implementation

1. **L3 - Python Async** (2 weeks)
   - Highest performance impact (2-3x throughput)
   - Foundation for future scaling

2. **L6 - Cost Optimization** (1 week)
   - Immediate $ savings (~$75/month)
   - Low risk, high reward

3. **L5 - Distributed Tracing** (1 week)
   - Improves debugging significantly
   - Foundation for future observability

4. **L4 - GraphQL API** (2 weeks)
   - Better developer experience
   - Lower priority (REST works fine)

---

## Quick Reference: Where to Find Documentation

| Task | Implementation Guide | Location |
|------|---------------------|----------|
| L1 | Metrics Cardinality Audit | `docs/METRICS_CARDINALITY_AUDIT.md` |
| L1 | Metrics Best Practices | `docs/METRICS_CARDINALITY_GUIDE.md` |
| L2 | Redis Memory Config | `docs/REDIS_MEMORY_CONFIGURATION.md` |
| L3 | Python Async Migration | `docs/L3_ASYNC_PYTHON_MIGRATION_GUIDE.md` |
| L4 | GraphQL API | `docs/L4_GRAPHQL_API_GUIDE.md` |
| L5 | Distributed Tracing | `docs/L5_DISTRIBUTED_TRACING_GUIDE.md` |
| L6 | Cost Optimization | `docs/L6_COST_OPTIMIZATION_GUIDE.md` |
| All | Summary Document | `docs/MARCUS_3.1_LOW_PRIORITY_OPTIMIZATIONS_SUMMARY.md` |

---

**Last Updated:** 2025-11-22
**Author:** Marcus (Platform Engineer)
**Status:** Ready for sequential implementation of L3-L6
