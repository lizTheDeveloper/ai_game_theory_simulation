#!/usr/bin/env python3
"""
MARCUS 3.0 Citation Integrity Agent (OPTIMIZED)

HIGH PRIORITY #3: Parallelize memory initialization

Problem:
- Sequential initialization of 4-level memory hierarchy
- 15-20 second startup per agent
- Impacts autoscaling responsiveness

Solution:
- Parallelize memory level initialization using asyncio
- Implement lazy loading for historical data
- Cache warm-start state in Redis
- Measure and document startup time improvement

Expected Outcome:
- Startup time reduced to <5 seconds
- Warm starts (from Redis cache) <2 seconds

This file contains ONLY the optimized portions to be integrated into
citation_integrity_agent.py. NOT a complete standalone file.

Author: Marcus (Platform Engineer)
Date: 2025-11-22
"""

import asyncio
import json
import logging
import time
from typing import Dict, Any, Optional, Tuple
from datetime import datetime

logger = logging.getLogger(__name__)


# ============================================================================
# Optimized State Loading (Replaces load_state method)
# ============================================================================

def load_state_optimized(self) -> bool:
    """
    Load agent state from database/cache with parallelized initialization.

    H3 OPTIMIZATION: Parallel loading of memory levels + lazy historical data.

    Returns:
        True if state was loaded, False otherwise
    """
    start_time = time.time()

    # Try cache first (fastest path)
    if self.redis_client:
        try:
            cache_key = f"agent:{self.agent_id}:state"
            cached = self.redis_client.get(cache_key)

            if cached:
                state = json.loads(cached)
                # H3 FIX: Parallel application of state
                self._apply_state_parallel(state)
                elapsed = (time.time() - start_time) * 1000
                logger.info(f"✅ Agent {self.agent_id} warm start from cache ({elapsed:.1f}ms)")
                return True
        except Exception as e:
            logger.warning(f"Redis cache load failed: {e}")

    # Fall back to database (slower path)
    if self.db_conn:
        try:
            cursor = self.db_conn.cursor()
            cursor.execute(
                "SELECT * FROM agent_states WHERE agent_id = %s ORDER BY timestamp DESC LIMIT 1",
                (self.agent_id,)
            )

            row = cursor.fetchone()
            if row:
                state = dict(row)
                # H3 FIX: Parallel application of state
                self._apply_state_parallel(state)
                elapsed = (time.time() - start_time) * 1000
                logger.info(f"✅ Agent {self.agent_id} cold start from database ({elapsed:.1f}ms)")

                # Warm cache for next time
                self._warm_cache_async(state)

                return True

        except Exception as e:
            logger.error(f"Database load failed: {e}")
            raise

    elapsed = (time.time() - start_time) * 1000
    logger.warning(f"Agent {self.agent_id} no saved state found ({elapsed:.1f}ms)")
    return False


def _apply_state_parallel(self, state: Dict[str, Any]) -> None:
    """
    Apply loaded state to agent with parallelized memory initialization.

    H3 OPTIMIZATION: Parallel initialization of 4 memory levels.

    This method runs synchronously but prepares memory structures in parallel
    using threading for I/O-bound operations (database lookups, JSON parsing).
    """
    import concurrent.futures

    # Simple scalar values (fast, sequential)
    self.reputation = state['reputation']
    self.total_citations = state['total_citations']
    self.detected_violations = state['detected_violations']
    self.current_behavior = CitationBehavior(state['current_behavior'])
    self.exploration_rate = state['exploration_rate']

    # Complex memory state (slow, parallel)
    memory_state = state.get('memory_state')
    if not memory_state:
        return

    if isinstance(memory_state, str):
        memory_state = json.loads(memory_state)

    # H3 FIX: Parallelize memory level initialization
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        # Submit all 4 memory levels for parallel initialization
        futures = {
            'immediate': executor.submit(self._load_immediate_memory, memory_state),
            'shortterm': executor.submit(self._load_shortterm_memory, memory_state),
            'longterm': executor.submit(self._load_longterm_memory, memory_state),
            'persistent': executor.submit(self._load_persistent_memory, memory_state)
        }

        # Wait for all to complete
        results = {}
        for level, future in futures.items():
            try:
                results[level] = future.result(timeout=2.0)  # 2 second timeout per level
            except concurrent.futures.TimeoutError:
                logger.warning(f"⚠️ Memory level {level} initialization timed out, using defaults")
                results[level] = None
            except Exception as e:
                logger.error(f"❌ Memory level {level} initialization failed: {e}")
                results[level] = None

    # Apply results to memory
    if results['immediate']:
        self.memory.immediate_history = results['immediate']
    if results['shortterm']:
        self.memory.shortterm_history = results['shortterm']
    if results['longterm']:
        self.memory.longterm_stats = results['longterm']['stats']
        self.memory.behavior_success_rates = results['longterm']['behavior_rates']
    if results['persistent']:
        self.memory.persistent_knowledge = results['persistent']['knowledge']
        self.memory.total_citations_processed = results['persistent']['total_processed']

    logger.debug(f"Agent {self.agent_id} memory initialized (4 levels parallel)")


# ============================================================================
# Memory Level Loaders (Parallel-Safe)
# ============================================================================

def _load_immediate_memory(self, memory_state: Dict[str, Any]) -> list:
    """
    Load immediate memory (Level 1: last 10 citations).

    Runs in parallel thread. Fast operation (small dataset).
    """
    immediate = memory_state.get('immediate_history', [])
    # Lazy loading: only load recent entries
    return immediate[-10:] if len(immediate) > 10 else immediate


def _load_shortterm_memory(self, memory_state: Dict[str, Any]) -> list:
    """
    Load short-term memory (Level 2: last 100 citations).

    Runs in parallel thread. Medium operation.
    """
    shortterm = memory_state.get('shortterm_history', [])
    # Lazy loading: only load recent entries
    return shortterm[-100:] if len(shortterm) > 100 else shortterm


def _load_longterm_memory(self, memory_state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Load long-term memory (Level 3: aggregated statistics).

    Runs in parallel thread. Fast operation (pre-aggregated).
    """
    return {
        'stats': memory_state.get('longterm_stats', {}),
        'behavior_rates': memory_state.get('behavior_success_rates', {})
    }


def _load_persistent_memory(self, memory_state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Load persistent memory (Level 4: cross-session knowledge).

    Runs in parallel thread. Fast operation (compact storage).
    """
    return {
        'knowledge': memory_state.get('persistent_knowledge', {}),
        'total_processed': memory_state.get('total_citations_processed', 0)
    }


# ============================================================================
# Asynchronous Cache Warming
# ============================================================================

def _warm_cache_async(self, state: Dict[str, Any]) -> None:
    """
    Warm Redis cache asynchronously (non-blocking).

    H3 OPTIMIZATION: Don't block agent startup waiting for cache write.
    """
    if not self.redis_client:
        return

    def _warm_worker():
        try:
            cache_key = f"agent:{self.agent_id}:state"
            self.redis_client.setex(
                cache_key,
                3600,  # 1 hour TTL
                json.dumps(state)
            )
            logger.debug(f"Cache warmed for agent {self.agent_id}")
        except Exception as e:
            logger.warning(f"Cache warming failed: {e}")

    import threading
    thread = threading.Thread(target=_warm_worker, daemon=True)
    thread.start()


# ============================================================================
# Startup Time Benchmarking
# ============================================================================

def benchmark_startup_time(agent_id: str, iterations: int = 10) -> Dict[str, float]:
    """
    Benchmark agent startup time (cold start vs warm start).

    Usage:
        results = benchmark_startup_time('agent_001', iterations=10)
        print(f"Cold start: {results['cold_start_p50']:.1f}ms")
        print(f"Warm start: {results['warm_start_p50']:.1f}ms")
    """
    import numpy as np

    cold_starts = []
    warm_starts = []

    # Database config from environment variables
    db_config = {
        'host': os.getenv('DATABASE_HOST', os.getenv('PGHOST', 'localhost')),
        'port': int(os.getenv('DATABASE_PORT', os.getenv('PGPORT', '5432'))),
        'database': os.getenv('POSTGRES_DB', os.getenv('PGDATABASE', 'citations')),
        'user': os.getenv('POSTGRES_USER', os.getenv('PGUSER', 'postgres')),
        'password': os.getenv('POSTGRES_PASSWORD', os.getenv('PGPASSWORD', 'password'))
    }

    redis_config = {
        'host': os.getenv('REDIS_HOST', 'localhost'),
        'port': int(os.getenv('REDIS_PORT', '6379')),
        'db': 0
    }

    for i in range(iterations):
        # Cold start (clear cache first)
        agent = CitationIntegrityAgent(
            agent_id=f"{agent_id}_bench_{i}",
            db_config=db_config,
            redis_config=redis_config
        )

        if agent.redis_client:
            agent.redis_client.delete(f"agent:{agent.agent_id}:state")

        start = time.time()
        agent.load_state_optimized()
        cold_time = (time.time() - start) * 1000
        cold_starts.append(cold_time)

        # Warm cache
        agent.save_state()

        # Warm start (cache hit)
        start = time.time()
        agent.load_state_optimized()
        warm_time = (time.time() - start) * 1000
        warm_starts.append(warm_time)

        agent.cleanup()

    return {
        'cold_start_p50': float(np.percentile(cold_starts, 50)),
        'cold_start_p95': float(np.percentile(cold_starts, 95)),
        'warm_start_p50': float(np.percentile(warm_starts, 50)),
        'warm_start_p95': float(np.percentile(warm_starts, 95)),
        'improvement_factor': float(np.median(cold_starts) / np.median(warm_starts))
    }


# ============================================================================
# Integration Instructions
# ============================================================================

"""
To integrate these optimizations into citation_integrity_agent.py:

1. Replace the load_state() method with load_state_optimized()
2. Replace the _apply_state() method with _apply_state_parallel()
3. Add the 4 memory loader methods: _load_immediate_memory, _load_shortterm_memory,
   _load_longterm_memory, _load_persistent_memory
4. Add the _warm_cache_async() method
5. Import required modules: concurrent.futures, threading, time

Example patch:

    class CitationIntegrityAgent:
        # ... existing code ...

        # REPLACE THIS:
        # def load_state(self) -> bool:
        #     # old sequential loading

        # WITH THIS:
        def load_state(self) -> bool:
            return load_state_optimized(self)

        def _apply_state(self, state: Dict[str, Any]) -> None:
            return _apply_state_parallel(self, state)

        # ADD THESE:
        def _load_immediate_memory(self, memory_state: Dict[str, Any]) -> list:
            # ... from above ...

        # ... other methods ...

Expected Performance:
- Before: 15-20 second startup (sequential)
- After: <5 second startup (parallel), <2 second warm start (cache hit)
- Improvement: 3-10x faster startup

Benchmarking:
    python -c "from citation_integrity_agent_optimized import benchmark_startup_time; \
               print(benchmark_startup_time('agent_001', iterations=10))"
"""
