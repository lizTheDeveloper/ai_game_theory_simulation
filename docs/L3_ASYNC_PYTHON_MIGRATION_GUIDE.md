# MARCUS 3.1: Python Async/Await Migration Guide

**Priority:** LOW (L3)
**Effort:** 2 weeks
**Status:** Planning Complete, Implementation Ready

## Executive Summary

Migrate Python citation agents from synchronous I/O to async/await for 2-3x throughput improvement.

**Current:** Blocking PostgreSQL and Redis calls limit concurrency
**Target:** Async I/O enables concurrent task processing per agent

## Performance Gains

### Synchronous (Current)

```python
# Blocking I/O - processes one citation at a time
def analyze_citation(doc):
    conn = psycopg2.connect(...)  # Blocks
    result = conn.execute(...)     # Blocks
    state = redis_client.get(...)  # Blocks
    return result

# Throughput: ~10-20 citations/sec/agent (I/O bound)
```

### Asynchronous (Target)

```python
# Non-blocking I/O - processes multiple citations concurrently
async def analyze_citation(doc):
    async with pool.acquire() as conn:  # Non-blocking
        result = await conn.fetch(...)   # Concurrent
        state = await redis.get(...)     # Concurrent
        return result

# Throughput: ~30-60 citations/sec/agent (2-3x improvement)
```

## Migration Strategy

### Phase 1: Async Database Drivers (Week 1)

Replace synchronous drivers with async equivalents:

| Component | Current | Async | Benefit |
|-----------|---------|-------|---------|
| PostgreSQL | psycopg2 | asyncpg | 3-5x faster, native async |
| Redis | redis-py | aioredis | Non-blocking, connection pooling |
| HTTP calls | requests | aiohttp | Concurrent API calls |

### Phase 2: Agent Code Migration (Week 1)

Convert agent methods to async/await:

**Pattern 1: Convert Functions**
```python
# Before
def get_agent_state(agent_id: str) -> Dict:
    result = psycopg2_conn.execute(
        "SELECT * FROM agent_states WHERE agent_id = %s",
        (agent_id,)
    )
    return result[0]

# After
async def get_agent_state(agent_id: str) -> Dict:
    result = await asyncpg_pool.fetchrow(
        "SELECT * FROM agent_states WHERE agent_id = $1",
        agent_id
    )
    return dict(result)
```

**Pattern 2: Concurrent Operations**
```python
# Before (sequential - 3x latency)
state = get_agent_state(agent_id)        # 10ms
cached = redis_get(f"agent:{agent_id}")  # 5ms
metrics = get_metrics(agent_id)          # 15ms
# Total: 30ms

# After (parallel - 1x latency)
state, cached, metrics = await asyncio.gather(
    get_agent_state(agent_id),           # 10ms
    redis_get(f"agent:{agent_id}"),      # 5ms
    get_metrics(agent_id)                # 15ms
)
# Total: 15ms (max of all)
```

### Phase 3: Backward Compatibility (Week 2)

Maintain sync wrapper for existing code:

```python
# citation_integrity_agent_async.py - New async implementation
class AsyncCitationIntegrityAgent:
    async def analyze_citation(self, doc: CitationDocument):
        # Full async implementation
        pass

# citation_integrity_agent.py - Sync wrapper (backward compatible)
class CitationIntegrityAgent:
    def __init__(self):
        self._async_agent = AsyncCitationIntegrityAgent()
        self._loop = asyncio.new_event_loop()

    def analyze_citation(self, doc: CitationDocument):
        # Sync wrapper around async method
        return self._loop.run_until_complete(
            self._async_agent.analyze_citation(doc)
        )
```

### Phase 4: Performance Testing (Week 2)

Benchmark before/after:

```python
# Benchmark script
import asyncio
import time

async def benchmark_async_agent(num_citations=1000):
    agent = AsyncCitationIntegrityAgent()
    start = time.time()

    # Process citations concurrently
    tasks = [
        agent.analyze_citation(doc)
        for doc in test_citations[:num_citations]
    ]
    results = await asyncio.gather(*tasks)

    elapsed = time.time() - start
    throughput = num_citations / elapsed

    print(f"Async: {throughput:.1f} citations/sec")
    return throughput

def benchmark_sync_agent(num_citations=1000):
    agent = CitationIntegrityAgent()
    start = time.time()

    results = [
        agent.analyze_citation(doc)
        for doc in test_citations[:num_citations]
    ]

    elapsed = time.time() - start
    throughput = num_citations / elapsed

    print(f"Sync: {throughput:.1f} citations/sec")
    return throughput

# Expected results:
# Sync: ~15 citations/sec
# Async: ~40 citations/sec (2.7x improvement)
```

## Implementation Checklist

### Dependencies
- [ ] Install asyncpg: `pip install asyncpg`
- [ ] Install aioredis: `pip install aioredis`
- [ ] Install aiohttp: `pip install aiohttp`
- [ ] Update requirements.txt

### Code Migration
- [ ] Create `citation_integrity_agent_async.py`
- [ ] Port CitationIntegrityAgent class to async
- [ ] Port NestedCitationMemory to async
- [ ] Port database operations to asyncpg
- [ ] Port Redis operations to aioredis
- [ ] Add async connection pooling

### Backward Compatibility
- [ ] Create sync wrapper in `citation_integrity_agent.py`
- [ ] Test wrapper with existing integration tests
- [ ] Document migration path

### Testing
- [ ] Unit tests for async agent
- [ ] Integration tests with async DB/Redis
- [ ] Performance benchmarks (before/after)
- [ ] Load testing (100+ concurrent citations)

### Deployment
- [ ] Feature flag for async vs. sync mode
- [ ] Gradual rollout (10% → 50% → 100%)
- [ ] Monitor error rates and latency
- [ ] Rollback plan if issues detected

## Code Samples

### Async Agent Skeleton

```python
# src/platform/agents/citation_integrity_agent_async.py

import asyncio
import asyncpg
import aioredis
from typing import Dict, Optional

class AsyncCitationIntegrityAgent:
    def __init__(
        self,
        agent_id: str,
        db_config: Dict,
        redis_config: Dict
    ):
        self.agent_id = agent_id
        self.db_pool: Optional[asyncpg.Pool] = None
        self.redis: Optional[aioredis.Redis] = None
        self.db_config = db_config
        self.redis_config = redis_config

    async def initialize(self):
        """Initialize async connections"""
        # PostgreSQL connection pool
        self.db_pool = await asyncpg.create_pool(
            host=self.db_config['host'],
            port=self.db_config['port'],
            database=self.db_config['database'],
            user=self.db_config['user'],
            password=self.db_config['password'],
            min_size=2,
            max_size=10
        )

        # Redis connection
        self.redis = await aioredis.from_url(
            f"redis://{self.redis_config['host']}:{self.redis_config['port']}",
            db=self.redis_config['db'],
            encoding="utf-8",
            decode_responses=True
        )

        logger.info(f"✅ Agent {self.agent_id} initialized (async mode)")

    async def load_state(self) -> Dict:
        """Load agent state from database"""
        # Try cache first
        cached = await self.redis.get(f"agent:{self.agent_id}:state")
        if cached:
            return json.loads(cached)

        # Fall back to database
        row = await self.db_pool.fetchrow(
            """
            SELECT reputation, total_citations, detected_violations,
                   current_behavior, memory_state, exploration_rate
            FROM agent_states
            WHERE agent_id = $1
            """,
            self.agent_id
        )

        if row:
            state = dict(row)
            # Cache for 1 hour
            await self.redis.setex(
                f"agent:{self.agent_id}:state",
                3600,
                json.dumps(state)
            )
            return state

        return self._default_state()

    async def save_state(self, state: Dict):
        """Save agent state to database + cache"""
        # Update cache
        await self.redis.setex(
            f"agent:{self.agent_id}:state",
            3600,
            json.dumps(state)
        )

        # Persist to database
        await self.db_pool.execute(
            """
            INSERT INTO agent_states (
                agent_id, reputation, total_citations,
                detected_violations, current_behavior,
                memory_state, exploration_rate, timestamp
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
            ON CONFLICT (agent_id) DO UPDATE SET
                reputation = EXCLUDED.reputation,
                total_citations = EXCLUDED.total_citations,
                detected_violations = EXCLUDED.detected_violations,
                current_behavior = EXCLUDED.current_behavior,
                memory_state = EXCLUDED.memory_state,
                exploration_rate = EXCLUDED.exploration_rate,
                timestamp = EXCLUDED.timestamp
            """,
            self.agent_id,
            state['reputation'],
            state['total_citations'],
            state['detected_violations'],
            state['current_behavior'],
            json.dumps(state['memory']),
            state['exploration_rate']
        )

    async def analyze_citation(self, doc: CitationDocument) -> Dict:
        """Analyze citation integrity (async)"""
        # Load state concurrently with citation processing
        state_task = asyncio.create_task(self.load_state())

        # Pre-process citation
        features = self._extract_features(doc)

        # Wait for state
        state = await state_task

        # Select behavior
        behavior = self._select_behavior(state)

        # Analyze
        integrity_score = self._calculate_integrity(doc, behavior, features)

        # Update state
        state['total_citations'] += 1
        if integrity_score < 0.5:
            state['detected_violations'] += 1

        # Save state (fire and forget - don't wait)
        asyncio.create_task(self.save_state(state))

        return {
            'integrity_score': integrity_score,
            'behavior_used': behavior.value,
            'agent_id': self.agent_id,
            'confidence': state['reputation']
        }

    async def shutdown(self):
        """Clean shutdown"""
        if self.db_pool:
            await self.db_pool.close()
        if self.redis:
            await self.redis.close()

        logger.info(f"✅ Agent {self.agent_id} shutdown complete")
```

### Performance Comparison

```python
# benchmarks/async_vs_sync_benchmark.py

import asyncio
import time
from citation_integrity_agent import CitationIntegrityAgent
from citation_integrity_agent_async import AsyncCitationIntegrityAgent

async def benchmark_async(num_citations=1000):
    agent = AsyncCitationIntegrityAgent(...)
    await agent.initialize()

    citations = generate_test_citations(num_citations)

    start = time.time()
    tasks = [agent.analyze_citation(c) for c in citations]
    results = await asyncio.gather(*tasks)
    elapsed = time.time() - start

    await agent.shutdown()

    throughput = num_citations / elapsed
    avg_latency = (elapsed / num_citations) * 1000  # ms

    return {
        'throughput': throughput,
        'avg_latency_ms': avg_latency,
        'total_time_sec': elapsed
    }

def benchmark_sync(num_citations=1000):
    agent = CitationIntegrityAgent(...)
    citations = generate_test_citations(num_citations)

    start = time.time()
    results = [agent.analyze_citation(c) for c in citations]
    elapsed = time.time() - start

    throughput = num_citations / elapsed
    avg_latency = (elapsed / num_citations) * 1000  # ms

    return {
        'throughput': throughput,
        'avg_latency_ms': avg_latency,
        'total_time_sec': elapsed
    }

if __name__ == '__main__':
    print("Sync Agent Benchmark:")
    sync_results = benchmark_sync(1000)
    print(f"  Throughput: {sync_results['throughput']:.1f} citations/sec")
    print(f"  Avg Latency: {sync_results['avg_latency_ms']:.1f}ms")

    print("\nAsync Agent Benchmark:")
    async_results = asyncio.run(benchmark_async(1000))
    print(f"  Throughput: {async_results['throughput']:.1f} citations/sec")
    print(f"  Avg Latency: {async_results['avg_latency_ms']:.1f}ms")

    speedup = async_results['throughput'] / sync_results['throughput']
    print(f"\nSpeedup: {speedup:.2f}x")
```

## Rollout Plan

### Week 1: Development
- Days 1-3: Implement async agent
- Days 4-5: Testing and bug fixes

### Week 2: Deployment
- Days 1-2: Canary deployment (10% traffic)
- Days 3-4: Ramp up (50% traffic)
- Day 5: Full rollout (100% traffic)

## Success Criteria

- [ ] Throughput improvement: ≥2x
- [ ] Latency p95: No regression
- [ ] Error rate: <0.1% increase
- [ ] Memory usage: <20% increase
- [ ] CPU usage: 10-30% reduction (less I/O blocking)

## Rollback Plan

If metrics degrade:
1. Feature flag → 0% (revert to sync)
2. Investigate logs/metrics
3. Fix issues
4. Re-deploy canary

## References

- [asyncpg Documentation](https://magicstack.github.io/asyncpg/)
- [aioredis Documentation](https://aioredis.readthedocs.io/)
- [asyncio Best Practices](https://docs.python.org/3/library/asyncio.html)
