/**
 * MARCUS 3.0 Performance Optimization Migration
 * Migration 002: Add strategic indexes for query performance
 *
 * HIGH PRIORITY #2: Fix O(n) table scans on agent_states and citation_analyses
 *
 * Problem:
 * - Missing indexes on frequently queried columns (agent_id, timestamp)
 * - O(n) table scans degrade as data grows
 * - Will impact performance at scale (1M+ rows)
 *
 * Solution:
 * - Compound index on (agent_id, timestamp DESC) for agent state queries
 * - Index on version column for optimistic locking conflict detection
 * - Indexes on analysis query patterns (source, timestamp, integrity)
 *
 * Expected Impact:
 * - Query time reduced from O(n) to O(log n)
 * - 10-100x speedup on agent state lookups
 * - Faster conflict detection during concurrent updates
 *
 * Date: 2025-11-22
 * Author: Marcus (Platform Engineer)
 */

-- ============================================================================
-- Agent States Performance Indexes
-- ============================================================================

-- Compound index for agent state queries (most common pattern)
-- Covers: SELECT ... WHERE agent_id = ? ORDER BY timestamp DESC LIMIT 1
CREATE INDEX IF NOT EXISTS idx_agent_states_agent_time
    ON agent_states(agent_id, timestamp DESC);

-- Version index for optimistic locking conflict detection
-- Covers: WHERE agent_states.version < EXCLUDED.version
CREATE INDEX IF NOT EXISTS idx_agent_states_version_lookup
    ON agent_states(version);

-- Reputation-based queries (leaderboard, filtering)
-- Already exists from migration 006, but verify
CREATE INDEX IF NOT EXISTS idx_agent_states_reputation
    ON agent_states(reputation DESC);

-- Behavior analysis queries
-- Already exists from migration 006, but verify
CREATE INDEX IF NOT EXISTS idx_agent_states_behavior
    ON agent_states(current_behavior);

-- ============================================================================
-- Citation Analyses Performance Indexes
-- ============================================================================

-- Timestamp-based queries (most recent analyses)
-- Covers: ORDER BY timestamp DESC
CREATE INDEX IF NOT EXISTS idx_citation_analyses_timestamp
    ON citation_analyses(timestamp DESC);

-- Source + timestamp compound (filtered recent queries)
-- Covers: WHERE source = ? ORDER BY timestamp DESC
CREATE INDEX IF NOT EXISTS idx_citation_analyses_source_time
    ON citation_analyses(source, timestamp DESC);

-- Integrity-based filtering (low integrity citations)
-- Covers: WHERE mean_integrity < 0.5
CREATE INDEX IF NOT EXISTS idx_citation_analyses_integrity_filter
    ON citation_analyses(mean_integrity)
    WHERE mean_integrity < 0.5;

-- Consensus-based filtering (low consensus = disagreement)
-- Covers: WHERE consensus < 0.5
CREATE INDEX IF NOT EXISTS idx_citation_analyses_consensus_filter
    ON citation_analyses(consensus)
    WHERE consensus < 0.5;

-- Latency analysis (performance monitoring)
-- Covers: WHERE latency_ms > ?
CREATE INDEX IF NOT EXISTS idx_citation_analyses_latency_perf
    ON citation_analyses(latency_ms DESC);

-- ============================================================================
-- EXPLAIN ANALYZE Verification Queries
-- ============================================================================

-- These queries verify that indexes are being used correctly.
-- Run these after migration to confirm performance improvement.

-- Query 1: Load agent state (most common pattern)
EXPLAIN (ANALYZE, BUFFERS)
SELECT
    agent_id, reputation, total_citations, detected_violations,
    current_behavior, memory_state, exploration_rate, timestamp, version
FROM agent_states
WHERE agent_id = 'agent_001'
ORDER BY timestamp DESC
LIMIT 1;

-- Query 2: Version conflict check (optimistic locking)
EXPLAIN (ANALYZE, BUFFERS)
SELECT version
FROM agent_states
WHERE agent_id = 'agent_001';

-- Query 3: Recent analyses by source
EXPLAIN (ANALYZE, BUFFERS)
SELECT source, mean_integrity, consensus, timestamp
FROM citation_analyses
WHERE source = 'platform'
ORDER BY timestamp DESC
LIMIT 10;

-- Query 4: Low integrity citations (for review)
EXPLAIN (ANALYZE, BUFFERS)
SELECT source, mean_integrity, consensus, recommendations
FROM citation_analyses
WHERE mean_integrity < 0.5
ORDER BY mean_integrity ASC
LIMIT 20;

-- Query 5: High latency analyses (performance monitoring)
EXPLAIN (ANALYZE, BUFFERS)
SELECT source, latency_ms, num_agents, timestamp
FROM citation_analyses
WHERE latency_ms > 1000
ORDER BY latency_ms DESC
LIMIT 10;

-- ============================================================================
-- Index Statistics
-- ============================================================================

-- Show all indexes on agent_states and citation_analyses
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('agent_states', 'citation_analyses')
ORDER BY tablename, indexname;

-- Show index sizes (to monitor bloat)
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid::regclass)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename IN ('agent_states', 'citation_analyses')
ORDER BY pg_relation_size(indexrelid::regclass) DESC;

-- ============================================================================
-- Performance Notes
-- ============================================================================

/*
Index Strategy:

1. Compound Indexes:
   - (agent_id, timestamp DESC): Covers single-agent state lookups
   - (source, timestamp DESC): Covers filtered analysis queries
   - Order matters: most selective column first

2. Partial Indexes:
   - mean_integrity < 0.5: Only index problematic citations
   - consensus < 0.5: Only index low-agreement analyses
   - Saves space, faster updates on high-quality data

3. Index Maintenance:
   - PostgreSQL auto-vacuums handle bloat
   - Monitor pg_stat_user_indexes for unused indexes
   - Consider REINDEX if fragmentation occurs

4. Query Optimization Tips:
   - Always include WHERE agent_id = ? for agent state queries
   - Use ORDER BY timestamp DESC LIMIT N for recent data
   - Avoid SELECT * - specify needed columns
   - Use EXPLAIN ANALYZE to verify index usage

5. When to Rebuild:
   - If pg_relation_size(index) > 2x expected
   - If seq_scan count > index_scan count in pg_stat_user_indexes
   - After bulk data loads

Expected Query Performance:
- Agent state lookup: <1ms (was 10-100ms at 10k agents)
- Recent analyses: <5ms (was 50-500ms at 100k analyses)
- Filtered queries: <10ms (was 100ms-1s)

Benchmarking:
Run EXPLAIN ANALYZE before/after migration to measure improvement.
Use scripts/benchmark_db_performance.ts for automated testing.
*/
