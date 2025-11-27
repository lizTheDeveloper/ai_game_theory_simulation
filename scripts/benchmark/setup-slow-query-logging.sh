#!/bin/bash
#
# MARCUS 3.0 - Setup PostgreSQL Slow Query Logging
#
# Enables PostgreSQL slow query logging to identify performance bottlenecks
#
# What it configures:
# - log_min_duration_statement: Log queries taking >100ms
# - log_line_prefix: Add timestamp, database, user info
# - log_statement: Log slow DDL statements
#
# Usage:
#   sudo ./scripts/benchmark/setup-slow-query-logging.sh

set -euo pipefail

echo "🔍 MARCUS 3.0 - Setup PostgreSQL Slow Query Logging"
echo "===================================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Error: This script must be run with sudo"
  exit 1
fi

# PostgreSQL version detection
PG_VERSION=$(sudo -u postgres psql -tAc "SHOW server_version;" | cut -d. -f1)
echo "📊 PostgreSQL version: $PG_VERSION"

# Enable slow query logging
echo "📝 Enabling slow query logging..."

# Set log_min_duration_statement to 100ms (queries slower than 100ms will be logged)
sudo -u postgres psql -c "ALTER SYSTEM SET log_min_duration_statement = 100;" 2>&1

# Set log line prefix to include useful context
sudo -u postgres psql -c "ALTER SYSTEM SET log_line_prefix = '%t [%p] %u@%d ';" 2>&1

# Log all DDL statements (CREATE, DROP, ALTER)
sudo -u postgres psql -c "ALTER SYSTEM SET log_statement = 'ddl';" 2>&1

# Enable query logging to file
sudo -u postgres psql -c "ALTER SYSTEM SET logging_collector = on;" 2>&1

# Set log directory
sudo -u postgres psql -c "ALTER SYSTEM SET log_directory = 'pg_log';" 2>&1

# Set log filename pattern
sudo -u postgres psql -c "ALTER SYSTEM SET log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log';" 2>&1

# Rotate logs daily
sudo -u postgres psql -c "ALTER SYSTEM SET log_rotation_age = '1d';" 2>&1

echo "✅ Slow query logging configured"
echo ""

# Reload PostgreSQL configuration
echo "🔄 Reloading PostgreSQL configuration..."
sudo systemctl reload postgresql

echo "✅ Configuration reloaded"
echo ""

# Verify configuration
echo "🔍 Verifying configuration..."
LOG_MIN_DURATION=$(sudo -u postgres psql -tAc "SHOW log_min_duration_statement;")
LOG_LINE_PREFIX=$(sudo -u postgres psql -tAc "SHOW log_line_prefix;")
LOG_STATEMENT=$(sudo -u postgres psql -tAc "SHOW log_statement;")

echo "   log_min_duration_statement: $LOG_MIN_DURATION"
echo "   log_line_prefix: $LOG_LINE_PREFIX"
echo "   log_statement: $LOG_STATEMENT"
echo ""

# Find log directory
PG_DATA=$(sudo -u postgres psql -tAc "SHOW data_directory;")
LOG_DIR="$PG_DATA/pg_log"

echo "📁 PostgreSQL logs location: $LOG_DIR"
echo ""

# Show recent log file
if [ -d "$LOG_DIR" ]; then
  LATEST_LOG=$(ls -t "$LOG_DIR"/postgresql-*.log 2>/dev/null | head -1)
  if [ -n "$LATEST_LOG" ]; then
    echo "📄 Latest log file: $LATEST_LOG"
    echo ""
    echo "To view slow queries:"
    echo "  sudo tail -f $LATEST_LOG | grep 'duration:'"
    echo ""
  fi
fi

echo "✅ Slow query logging setup complete!"
echo ""
echo "Next steps:"
echo "1. Run benchmark: npx tsx scripts/benchmark/citation-throughput.ts"
echo "2. Analyze slow queries: sudo grep 'duration:' $LOG_DIR/postgresql-*.log | sort -t: -k2 -n"
echo "3. Create indexes for slow queries"
echo "4. Re-run benchmark to verify improvements"
echo ""
