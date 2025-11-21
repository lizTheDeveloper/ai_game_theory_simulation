#!/bin/bash
#
# MARCUS 3.0 - Database Performance Analysis
#
# Analyzes PostgreSQL slow query logs and generates performance report
#
# What it analyzes:
# - Slow queries (>100ms)
# - Most frequent queries
# - Missing indexes
# - Connection pool usage
# - Table statistics
#
# Usage:
#   sudo ./scripts/benchmark/analyze-database-performance.sh [output-file]

set -euo pipefail

echo "🔍 MARCUS 3.0 - Database Performance Analysis"
echo "=============================================="
echo ""

# Output file
OUTPUT_FILE="${1:-benchmarks/database_performance_$(date +%Y%m%d).md}"
TEMP_DIR=$(mktemp -d)

# Find PostgreSQL data directory
PG_DATA=$(sudo -u postgres psql -tAc "SHOW data_directory;")
LOG_DIR="$PG_DATA/pg_log"

echo "📁 PostgreSQL data directory: $PG_DATA"
echo "📁 Log directory: $LOG_DIR"
echo ""

# Check if logs exist
if [ ! -d "$LOG_DIR" ]; then
  echo "❌ Error: Log directory not found. Run setup-slow-query-logging.sh first."
  exit 1
fi

# Find latest log files (last 24 hours)
echo "🔍 Finding recent log files..."
LATEST_LOGS=$(find "$LOG_DIR" -name "postgresql-*.log" -mtime -1)

if [ -z "$LATEST_LOGS" ]; then
  echo "⚠️ Warning: No recent log files found"
  echo "   Run some benchmarks first to generate query logs"
  exit 1
fi

echo "📊 Analyzing $(echo "$LATEST_LOGS" | wc -l) log file(s)..."
echo ""

# Extract slow queries
echo "⏱️  Extracting slow queries (>100ms)..."
sudo grep -h 'duration:' $LATEST_LOGS 2>/dev/null > "$TEMP_DIR/slow_queries.txt" || true

SLOW_QUERY_COUNT=$(wc -l < "$TEMP_DIR/slow_queries.txt" || echo "0")
echo "   Found $SLOW_QUERY_COUNT slow queries"
echo ""

# Get database statistics
echo "📈 Collecting database statistics..."

# Table sizes
sudo -u postgres psql -d marcus_test -c "
  SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    n_live_tup AS row_count,
    n_tup_ins AS inserts,
    n_tup_upd AS updates,
    n_tup_del AS deletes
  FROM pg_stat_user_tables
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
" > "$TEMP_DIR/table_stats.txt"

# Index usage
sudo -u postgres psql -d marcus_test -c "
  SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan AS scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched
  FROM pg_stat_user_indexes
  ORDER BY idx_scan DESC;
" > "$TEMP_DIR/index_stats.txt"

# Missing indexes (tables with sequential scans)
sudo -u postgres psql -d marcus_test -c "
  SELECT
    schemaname,
    tablename,
    seq_scan AS sequential_scans,
    seq_tup_read AS rows_scanned,
    idx_scan AS index_scans,
    n_live_tup AS row_count,
    CASE WHEN seq_scan > 0 THEN
      ROUND((100.0 * idx_scan) / (seq_scan + idx_scan), 2)
    ELSE 100.0
    END AS index_usage_pct
  FROM pg_stat_user_tables
  WHERE n_live_tup > 100  -- Only tables with >100 rows
  ORDER BY seq_scan DESC;
" > "$TEMP_DIR/missing_indexes.txt"

# Connection pool statistics
sudo -u postgres psql -c "
  SELECT
    datname,
    numbackends AS connections,
    xact_commit AS commits,
    xact_rollback AS rollbacks,
    blks_read AS disk_reads,
    blks_hit AS cache_hits,
    CASE WHEN (blks_read + blks_hit) > 0 THEN
      ROUND((100.0 * blks_hit) / (blks_read + blks_hit), 2)
    ELSE 0.0
    END AS cache_hit_ratio
  FROM pg_stat_database
  WHERE datname = 'marcus_test';
" > "$TEMP_DIR/connection_stats.txt"

echo "✅ Statistics collected"
echo ""

# Generate markdown report
echo "📄 Generating report..."

cat > "$OUTPUT_FILE" <<EOF
# MARCUS 3.0 - Database Performance Analysis

**Date:** $(date +%Y-%m-%d)
**Timestamp:** $(date --iso-8601=seconds)
**Database:** marcus_test
**Log Files Analyzed:** $(echo "$LATEST_LOGS" | wc -l)

---

## 📊 Executive Summary

**Slow Queries:** $SLOW_QUERY_COUNT queries >100ms in last 24 hours

$(
if [ "$SLOW_QUERY_COUNT" -eq 0 ]; then
  echo "✅ No slow queries detected! Database performance is excellent."
else
  echo "⚠️ Found $SLOW_QUERY_COUNT slow queries. Review and optimize below."
fi
)

---

## ⏱️ Slowest Queries

\`\`\`
$(
if [ "$SLOW_QUERY_COUNT" -gt 0 ]; then
  # Parse and sort by duration
  awk -F'duration: ' '{print $2}' "$TEMP_DIR/slow_queries.txt" | \
  awk '{duration=$1; $1=""; print duration "ms -" $0}' | \
  sort -n -r | head -20
else
  echo "No slow queries found"
fi
)
\`\`\`

---

## 📈 Table Statistics

\`\`\`
$(cat "$TEMP_DIR/table_stats.txt")
\`\`\`

---

## 🔍 Index Usage

\`\`\`
$(cat "$TEMP_DIR/index_stats.txt")
\`\`\`

---

## ⚠️ Potential Missing Indexes

Tables with high sequential scan ratios may benefit from indexes:

\`\`\`
$(cat "$TEMP_DIR/missing_indexes.txt")
\`\`\`

**Recommendations:**
- Tables with <80% index usage and >1000 rows should have indexes reviewed
- Sequential scans on large tables (>10k rows) are expensive
- Add indexes on frequently filtered/joined columns

---

## 🔌 Connection Pool Statistics

\`\`\`
$(cat "$TEMP_DIR/connection_stats.txt")
\`\`\`

**Cache Hit Ratio:** Should be >95% for good performance
- If <90%, consider increasing shared_buffers
- Monitor disk_reads - high values indicate cache misses

---

## 💡 Recommendations

$(
if [ "$SLOW_QUERY_COUNT" -gt 10 ]; then
  echo "1. **Critical:** Review and optimize top 10 slowest queries"
  echo "2. Add indexes for frequently filtered columns"
  echo "3. Consider query rewriting (e.g., avoid SELECT *, use specific columns)"
  echo "4. Review N+1 query patterns (many small queries instead of JOINs)"
fi

# Check cache hit ratio
CACHE_HIT_RATIO=$(sudo -u postgres psql -tAc "
  SELECT CASE WHEN (blks_read + blks_hit) > 0 THEN
    ROUND((100.0 * blks_hit) / (blks_read + blks_hit), 2)
  ELSE 0.0 END
  FROM pg_stat_database WHERE datname = 'marcus_test';
" || echo "0")

if (( $(echo "$CACHE_HIT_RATIO < 90" | bc -l) )); then
  echo "5. **Cache Hit Ratio Low ($CACHE_HIT_RATIO%):** Increase shared_buffers in postgresql.conf"
fi

echo ""
echo "**Performance Tuning:**"
echo "- Run \`VACUUM ANALYZE\` regularly to update table statistics"
echo "- Review connection pool size (current: $(sudo -u postgres psql -tAc 'SHOW max_connections;'))"
echo "- Monitor with \`pg_stat_statements\` extension for query-level insights"
)

---

## 🔍 Next Steps

1. Review slow queries and add missing indexes
2. Run \`EXPLAIN ANALYZE\` on slow queries to understand execution plans
3. Re-run benchmark after optimizations: \`npx tsx scripts/benchmark/citation-throughput.ts\`
4. Set up continuous monitoring with Prometheus + pg_stat_statements

---

**Generated:** $(date --iso-8601=seconds)
EOF

# Create output directory if needed
mkdir -p "$(dirname "$OUTPUT_FILE")"

echo "✅ Report saved: $OUTPUT_FILE"
echo ""

# Cleanup
rm -rf "$TEMP_DIR"

# Show summary
echo "📊 Summary:"
echo "   Slow queries: $SLOW_QUERY_COUNT"
echo "   Cache hit ratio: $CACHE_HIT_RATIO%"
echo ""

if [ "$SLOW_QUERY_COUNT" -gt 0 ]; then
  echo "⚠️ Action required: Review slow queries in $OUTPUT_FILE"
else
  echo "✅ Database performance looks good!"
fi

echo ""
