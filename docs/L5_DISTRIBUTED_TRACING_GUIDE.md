# MARCUS 3.1: Distributed Tracing Implementation Guide

**Priority:** LOW (L5)
**Effort:** 1 week
**Status:** Partially Implemented - Jaeger configured but incomplete instrumentation

## Current State

✅ **Already Configured:**
- Jaeger server running
- Basic OpenTelemetry setup
- Some HTTP tracing

❌ **Missing Instrumentation:**
- Agent process spawning/lifecycle
- Redis operations
- Database queries
- Inter-service calls
- Trace context propagation to Python agents

## Goal

Complete end-to-end distributed tracing to debug latency and failures across:
- TypeScript orchestrator → Python agents → PostgreSQL/Redis

## Implementation Plan

### Phase 1: Add Missing Instrumentation (Days 1-2)

#### 1. Install OpenTelemetry Instrumentation

```bash
npm install --save \
  @opentelemetry/api \
  @opentelemetry/sdk-node \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/exporter-jaeger \
  @opentelemetry/instrumentation-http \
  @opentelemetry/instrumentation-express \
  @opentelemetry/instrumentation-pg \
  @opentelemetry/instrumentation-redis-4
```

#### 2. Initialize Tracing

```typescript
// src/platform/observability/tracing.ts

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export function initializeTracing() {
  const jaegerExporter = new JaegerExporter({
    endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
  });

  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'marcus-platform',
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '0.0.0'
    }),
    traceExporter: jaegerExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        // Auto-instrument HTTP, Express, pg, redis
        '@opentelemetry/instrumentation-http': {},
        '@opentelemetry/instrumentation-express': {},
        '@opentelemetry/instrumentation-pg': {},
        '@opentelemetry/instrumentation-redis-4': {}
      })
    ],
    // Sampling strategy
    sampler: {
      shouldSample: (context, traceId, spanName, spanKind, attributes, links) => {
        // Sample 100% in development, 10% in production
        const samplingRate = process.env.NODE_ENV === 'production' ? 0.1 : 1.0;

        // Always sample errors
        if (attributes['error']) {
          return { decision: SamplingDecision.RECORD_AND_SAMPLED };
        }

        return Math.random() < samplingRate
          ? { decision: SamplingDecision.RECORD_AND_SAMPLED }
          : { decision: SamplingDecision.NOT_RECORD };
      }
    }
  });

  sdk.start();

  console.log('✅ OpenTelemetry tracing initialized');

  // Graceful shutdown
  process.on('SIGTERM', () => {
    sdk.shutdown().then(() => console.log('✅ Tracing terminated'));
  });

  return sdk;
}
```

#### 3. Manual Instrumentation for Agent Lifecycle

```typescript
// src/platform/integration/citationAgentIntegration.ts

import { trace, SpanStatusCode, context } from '@opentelemetry/api';

const tracer = trace.getTracer('marcus-platform', '1.0.0');

export class PythonAgentWrapper extends EventEmitter {
  async start(): Promise<void> {
    const span = tracer.startSpan('agent.start', {
      attributes: {
        'agent.id': this.agentId,
        'agent.script': this.scriptPath
      }
    });

    try {
      // ... existing start logic ...

      span.setStatus({ code: SpanStatusCode.OK });
    } catch (err) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: err.message
      });
      span.recordException(err);
      throw err;
    } finally {
      span.end();
    }
  }

  async analyzeCitation(document: CitationDocument): Promise<CitationAnalysisResult> {
    const span = tracer.startSpan('agent.analyze_citation', {
      attributes: {
        'agent.id': this.agentId,
        'citation.source': document.claimedSource
      }
    });

    try {
      const result = await this.invoke('analyze_citation', { document });

      span.setAttribute('citation.integrity_score', result.integrityScore);
      span.setAttribute('citation.behavior', result.behaviorUsed);
      span.setStatus({ code: SpanStatusCode.OK });

      return result;
    } catch (err) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: err.message
      });
      span.recordException(err);
      throw err;
    } finally {
      span.end();
    }
  }
}
```

#### 4. Trace Context Propagation to Python

**Problem:** Python agents don't receive trace context from orchestrator.

**Solution:** Pass trace context via environment variables or stdin.

```typescript
// TypeScript orchestrator
async start(): Promise<void> {
  const span = tracer.startSpan('agent.start');
  const traceId = span.spanContext().traceId;
  const spanId = span.spanContext().spanId;

  this.process = spawn('python3', [this.scriptPath, this.agentId], {
    env: {
      ...process.env,
      OTEL_TRACE_ID: traceId,
      OTEL_SPAN_ID: spanId,
      OTEL_SERVICE_NAME: 'citation-agent'
    }
  });

  span.end();
}
```

**Python agent:**
```python
# citation_integrity_agent.py

import os
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.jaeger.thrift import JaegerExporter

# Initialize tracing
trace.set_tracer_provider(TracerProvider())
jaeger_exporter = JaegerExporter(
    agent_host_name='localhost',
    agent_port=6831,
)
trace.get_tracer_provider().add_span_processor(
    BatchSpanProcessor(jaeger_exporter)
)

tracer = trace.get_tracer(__name__)

class CitationIntegrityAgent:
    def analyze_citation(self, doc):
        # Read parent trace context from environment
        parent_trace_id = os.getenv('OTEL_TRACE_ID')
        parent_span_id = os.getenv('OTEL_SPAN_ID')

        # Create child span
        with tracer.start_as_current_span(
            'citation.analyze',
            attributes={
                'agent.id': self.agent_id,
                'citation.source': doc['claimedSource']
            }
        ) as span:
            # Analysis logic
            result = self._perform_analysis(doc)

            span.set_attribute('citation.integrity_score', result['integrityScore'])

            return result
```

### Phase 2: Logging Integration (Days 3-4)

#### 5. Add Trace ID to Logs

```typescript
// src/platform/observability/logger.ts

import pino from 'pino';
import { context, trace } from '@opentelemetry/api';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    log: (obj) => {
      const span = trace.getSpan(context.active());
      if (span) {
        const spanContext = span.spanContext();
        obj.traceId = spanContext.traceId;
        obj.spanId = spanContext.spanId;
      }
      return obj;
    }
  }
});

// Usage:
logger.info({ agentId: 'agent_001' }, 'Agent started');
// Output: {"level":"info","traceId":"abc123","spanId":"def456","agentId":"agent_001","msg":"Agent started"}
```

#### 6. Correlation in Logs

```bash
# Find all logs for a trace
kubectl logs -l app=marcus-orchestrator | jq 'select(.traceId == "abc123")'

# Or in Jaeger UI → click trace → "Logs" tab
```

### Phase 3: Visualization & Alerts (Days 5-7)

#### 7. Jaeger Dashboard Setup

```yaml
# k8s/jaeger-deployment.yaml (already exists, just verify)

apiVersion: apps/v1
kind: Deployment
metadata:
  name: jaeger
  namespace: marcus
spec:
  replicas: 1
  selector:
    matchLabels:
      app: jaeger
  template:
    metadata:
      labels:
        app: jaeger
    spec:
      containers:
      - name: jaeger
        image: jaegertracing/all-in-one:latest
        ports:
        - containerPort: 16686  # UI
        - containerPort: 14268  # Collector
        - containerPort: 6831   # Agent (UDP)
        env:
        - name: COLLECTOR_ZIPKIN_HTTP_PORT
          value: "9411"
```

#### 8. Grafana Integration

Add Jaeger data source to Grafana:
```yaml
# Grafana data source config
apiVersion: 1
datasources:
  - name: Jaeger
    type: jaeger
    access: proxy
    url: http://jaeger:16686
    jsonData:
      tracesToLogs:
        datasourceUid: loki  # Link traces to logs
```

#### 9. Common Queries

**Find slow traces:**
```
service=marcus-platform
minDuration=500ms
```

**Find errors:**
```
service=marcus-platform
tags: error=true
```

**Agent lifecycle traces:**
```
service=marcus-platform
operation=agent.start
```

### Phase 4: Performance Optimization (Continuous)

#### 10. Reduce Overhead

```typescript
// Use sampling to reduce overhead
const samplingRate = process.env.TRACE_SAMPLING_RATE || 0.1;

// Sample 10% of requests in production
// Sample 100% of errors
```

#### 11. Async Span Processing

```typescript
// Use batch exporter to reduce network calls
const spanProcessor = new BatchSpanProcessor(jaegerExporter, {
  maxQueueSize: 2048,
  scheduledDelayMillis: 5000,
  exportTimeoutMillis: 30000,
  maxExportBatchSize: 512
});
```

## Expected Traces

### Full Citation Analysis Trace

```
marcus-platform: citation.analyze_document (150ms)
├─ agent_001: citation.analyze (50ms)
│  ├─ postgres: SELECT agent_states (5ms)
│  └─ redis: GET agent:agent_001:state (2ms)
├─ agent_002: citation.analyze (45ms)
│  ├─ postgres: SELECT agent_states (4ms)
│  └─ redis: GET agent:agent_002:state (3ms)
└─ postgres: INSERT citation_analyses (10ms)
```

### Agent Startup Trace

```
marcus-platform: agent.start (2.5s)
├─ spawn_process (100ms)
├─ agent_001: initialize (2s)
│  ├─ postgres: CONNECT (500ms)
│  ├─ redis: CONNECT (200ms)
│  └─ load_state (300ms)
└─ health_check (100ms)
```

## Debugging Scenarios

### Scenario 1: High Latency

**Symptom:** Citation analysis taking >1s (expected: 100-200ms)

**Debug Steps:**
1. Open Jaeger UI: http://localhost:16686
2. Search: `service=marcus-platform operation=citation.analyze_document minDuration=1s`
3. Identify bottleneck span (e.g., postgres query taking 800ms)
4. Fix: Add index, optimize query, cache result

### Scenario 2: Agent Timeout

**Symptom:** Agent not responding, timeout after 30s

**Debug Steps:**
1. Search: `service=marcus-platform operation=agent.analyze_citation tags: error=true`
2. View trace → see where it got stuck (e.g., Redis lock acquisition)
3. Check logs with traceId: `kubectl logs -l app=marcus | jq 'select(.traceId == "abc123")'`
4. Fix: Reduce lock timeout, add retry logic

### Scenario 3: Missing Traces

**Symptom:** Some requests not appearing in Jaeger

**Debug Steps:**
1. Check sampling rate: `echo $TRACE_SAMPLING_RATE` (should be 1.0 in dev)
2. Verify exporter connectivity: `curl http://jaeger:14268/api/traces`
3. Check agent logs for export errors
4. Increase batch export timeout

## Success Criteria

- [ ] All TypeScript operations instrumented
- [ ] Python agents propagate trace context
- [ ] Trace ID in all logs
- [ ] Jaeger UI shows complete end-to-end traces
- [ ] Can debug latency issues in <5 minutes
- [ ] Sampling overhead: <5% CPU/memory in production

## Performance Impact

**Development (100% sampling):**
- CPU overhead: ~2-5%
- Memory overhead: ~10MB per 1000 spans
- Network: ~1Mbps to Jaeger

**Production (10% sampling):**
- CPU overhead: <1%
- Memory overhead: <2MB
- Network: ~100Kbps to Jaeger

## Rollout

- Days 1-3: Implement instrumentation
- Days 4-5: Test in staging
- Days 6-7: Deploy to production with 10% sampling
- Week 2: Monitor, tune, document

## References

- [OpenTelemetry Node.js](https://opentelemetry.io/docs/instrumentation/js/)
- [Jaeger Documentation](https://www.jaegertracing.io/docs/)
- [Distributed Tracing Best Practices](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces)
