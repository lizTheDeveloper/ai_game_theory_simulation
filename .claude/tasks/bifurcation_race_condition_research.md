# Research Task: Deterministic State Aggregation in Simulation Systems

**Date:** 2025-11-14
**Agent:** super-alignment-researcher (Cynthia)
**Priority:** CRITICAL-1
**Context:** Bifurcation race condition breaking Monte Carlo determinism

## Problem Statement

The bifurcation metrics update in `BifurcationLogicPhase.ts:308-309` uses a weighted moving average:

```typescript
bifState.metrics.avgDistanceToThresholds =
  bifState.metrics.avgDistanceToThresholds * 0.95 + minDistanceValidated * 0.05;
```

**Issue:** This calculation is order-dependent and breaks determinism when:
1. Phase execution order changes
2. Multiple phases read bifurcation state
3. Monte Carlo runs execute with different scheduling

**Reader phases identified:**
- StochasticInnovationPhase (line 245) - reads `varianceAmplification`
- ClimateSystemPhase (line 511) - reads `varianceAmplification`
- ExogenousShockPhase (line 1237) - reads `varianceAmplification`

## Research Questions

### 1. Deterministic State Aggregation Patterns
**What are established patterns for deterministic state aggregation in discrete-event simulations?**

Search for:
- Accumulator-flush patterns (batch accumulation, apply at phase boundary)
- Dependency ordering guarantees (topological sort, phase dependencies)
- Immutable intermediate states (functional update patterns)
- Event-sourcing approaches (append-only state changes)

**Target sources:**
- Discrete-event simulation textbooks (Banks et al., Law & Kelton)
- Monte Carlo simulation methodology (Kroese et al. 2013)
- Agent-based modeling frameworks (MESA, NetLogo architecture docs)
- Financial modeling (deterministic pricing engine patterns)

### 2. Moving Average in Deterministic Systems
**How do deterministic simulations handle moving averages without introducing race conditions?**

Search for:
- Exponential weighted moving average (EWMA) in event-driven systems
- Kalman filter implementations in discrete-time simulations
- State estimation in deterministic agent-based models
- Time-series aggregation in reproducible research pipelines

### 3. Phase Dependency Declaration Best Practices
**What are best practices for explicit phase dependency management?**

Search for:
- Directed acyclic graph (DAG) scheduling in simulation engines
- Topological sort for phase execution order
- Read-after-write (RAW) hazard detection in parallel systems
- Dependency injection patterns in TypeScript/JavaScript

### 4. Batch Accumulation Pattern Examples
**Real-world examples of batch accumulation for deterministic aggregation:**

Search for:
- Reduce-scatter-gather patterns in MapReduce
- Event batching in stream processing (Apache Flink, Kafka Streams)
- Transaction batching in distributed systems
- Accumulator patterns in functional programming

## Deliverables

1. **Research document:** `research/deterministic_state_aggregation_20251114.md`
   - 2-3 peer-reviewed sources per research question
   - Code examples from established simulation frameworks
   - Recommended pattern for this specific issue
   - Parameter extraction (if applicable)

2. **Implementation recommendation:**
   - Which pattern best fits our phase-based architecture?
   - Minimal changes to preserve existing bifurcation behavior
   - Clear migration path from weighted average to deterministic approach

3. **Risk assessment:**
   - Does changing aggregation pattern affect bifurcation amplification research validity?
   - Can we preserve identical numeric behavior while fixing determinism?
   - Are there edge cases where batch accumulation could fail?

## Success Criteria

- [ ] 8-12 peer-reviewed sources (2024-2025 preferred)
- [ ] Clear recommendation for deterministic pattern
- [ ] Code examples from established frameworks
- [ ] Risk assessment for research validity preservation
- [ ] Ready for research-skeptic validation (Quality Gate 1)

## Timeline

**Estimated:** 4-6 hours
**Deadline:** End of day (2025-11-14)

## Handoff

After research complete:
1. Save to `research/deterministic_state_aggregation_20251114.md`
2. Post to research channel: "Research complete, ready for Sylvia validation"
3. Tag orchestrator for Quality Gate 1 coordination
