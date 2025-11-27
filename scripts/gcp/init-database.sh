#!/bin/bash
#
# MARCUS 3.0 Phase 5: Database Schema Initialization
# Initialize PostgreSQL schema in GKE cluster
#
# Usage:
#   ./scripts/gcp/init-database.sh [--namespace marcus-platform]
#

set -euo pipefail

# Configuration
NAMESPACE="${1:-marcus-platform}"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}INFO:${NC} $1"; }
log_success() { echo -e "${GREEN}SUCCESS:${NC} $1"; }
log_warning() { echo -e "${YELLOW}WARNING:${NC} $1"; }
log_error() { echo -e "${RED}ERROR:${NC} $1"; }

log_info "=== MARCUS 3.0 Database Initialization ==="
log_info "Namespace: $NAMESPACE"
echo ""

# Check if PostgreSQL is running
log_info "Checking PostgreSQL status..."
if ! kubectl get pod -n "$NAMESPACE" -l app=postgres,role=primary 2>/dev/null | grep -q Running; then
  log_error "PostgreSQL pod not running in namespace $NAMESPACE"
  log_info "Deploy PostgreSQL first with: kubectl apply -f k8s/postgres-statefulset.yaml"
  exit 1
fi

POSTGRES_POD=$(kubectl get pod -n "$NAMESPACE" -l app=postgres,role=primary -o name | head -1)
log_success "PostgreSQL pod found: $POSTGRES_POD"

# Get database credentials from secret
log_info "Retrieving database credentials..."
POSTGRES_USER=$(kubectl get secret marcus-secrets -n "$NAMESPACE" -o jsonpath='{.data.POSTGRES_USER}' | base64 -d)
POSTGRES_PASSWORD=$(kubectl get secret marcus-secrets -n "$NAMESPACE" -o jsonpath='{.data.POSTGRES_PASSWORD}' | base64 -d)
POSTGRES_DB=$(kubectl get configmap marcus-config -n "$NAMESPACE" -o jsonpath='{.data.POSTGRES_DB}')

log_success "Credentials retrieved"

# Create schema SQL
SCHEMA_SQL=$(cat <<'EOF'
-- MARCUS 3.0 Citation Integrity Platform Schema

-- Agent state persistence
CREATE TABLE IF NOT EXISTS agent_states (
    agent_id VARCHAR(50) PRIMARY KEY,
    reputation FLOAT NOT NULL DEFAULT 0.5,
    total_citations INTEGER NOT NULL DEFAULT 0,
    detected_violations INTEGER NOT NULL DEFAULT 0,
    current_behavior VARCHAR(50),
    memory_state JSONB NOT NULL DEFAULT '{}',
    exploration_rate FLOAT NOT NULL DEFAULT 0.2,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT reputation_range CHECK (reputation >= 0 AND reputation <= 1),
    CONSTRAINT exploration_range CHECK (exploration_rate >= 0 AND exploration_rate <= 1)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_agent_reputation ON agent_states(reputation DESC);
CREATE INDEX IF NOT EXISTS idx_agent_timestamp ON agent_states(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_memory_gin ON agent_states USING gin(memory_state);

-- Citation analysis results
CREATE TABLE IF NOT EXISTS citation_analyses (
    id SERIAL PRIMARY KEY,
    source VARCHAR(255) NOT NULL,
    text_hash VARCHAR(64) NOT NULL,
    mean_integrity FLOAT NOT NULL,
    consensus FLOAT NOT NULL,
    behavior_distribution JSONB NOT NULL,
    recommendations JSONB NOT NULL,
    num_agents INTEGER NOT NULL,
    latency_ms INTEGER NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT integrity_range CHECK (mean_integrity >= 0 AND mean_integrity <= 1),
    CONSTRAINT consensus_range CHECK (consensus >= 0 AND consensus <= 1)
);

-- Indexes for analysis queries
CREATE INDEX IF NOT EXISTS idx_analysis_source ON citation_analyses(source);
CREATE INDEX IF NOT EXISTS idx_analysis_hash ON citation_analyses(text_hash);
CREATE INDEX IF NOT EXISTS idx_analysis_integrity ON citation_analyses(mean_integrity);
CREATE INDEX IF NOT EXISTS idx_analysis_timestamp ON citation_analyses(timestamp DESC);

-- Agent performance metrics
CREATE TABLE IF NOT EXISTS agent_metrics (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value FLOAT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),

    FOREIGN KEY (agent_id) REFERENCES agent_states(agent_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_metrics_agent_time ON agent_metrics(agent_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_name ON agent_metrics(metric_name);

-- Citation task queue
CREATE TABLE IF NOT EXISTS citation_tasks (
    id SERIAL PRIMARY KEY,
    task_id VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    document JSONB NOT NULL,
    result JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,

    CONSTRAINT status_values CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_task_status ON citation_tasks(status);
CREATE INDEX IF NOT EXISTS idx_task_created ON citation_tasks(created_at DESC);

-- Agent learning history
CREATE TABLE IF NOT EXISTS learning_history (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(50) NOT NULL,
    episode INTEGER NOT NULL,
    reward FLOAT NOT NULL,
    loss FLOAT,
    epsilon FLOAT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),

    FOREIGN KEY (agent_id) REFERENCES agent_states(agent_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_learning_agent ON learning_history(agent_id, episode);

-- Insert default agent states (9 agents)
INSERT INTO agent_states (agent_id, reputation, memory_state)
VALUES
    ('agent-0', 0.5, '{"recent_citations": [], "violation_history": []}'),
    ('agent-1', 0.5, '{"recent_citations": [], "violation_history": []}'),
    ('agent-2', 0.5, '{"recent_citations": [], "violation_history": []}'),
    ('agent-3', 0.5, '{"recent_citations": [], "violation_history": []}'),
    ('agent-4', 0.5, '{"recent_citations": [], "violation_history": []}'),
    ('agent-5', 0.5, '{"recent_citations": [], "violation_history": []}'),
    ('agent-6', 0.5, '{"recent_citations": [], "violation_history": []}'),
    ('agent-7', 0.5, '{"recent_citations": [], "violation_history": []}'),
    ('agent-8', 0.5, '{"recent_citations": [], "violation_history": []}')
ON CONFLICT (agent_id) DO NOTHING;

-- Create read-only user for reporting
DO
$$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'marcus_readonly') THEN
    CREATE ROLE marcus_readonly WITH LOGIN PASSWORD 'readonly_password';
  END IF;
END
$$;
GRANT CONNECT ON DATABASE citation_integrity TO marcus_readonly;
GRANT USAGE ON SCHEMA public TO marcus_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO marcus_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO marcus_readonly;

EOF
)

# Apply schema
log_info "Applying database schema..."
kubectl exec -n "$NAMESPACE" "$POSTGRES_POD" -- \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "$SCHEMA_SQL" 2>&1 | tee /tmp/schema-init.log

if [ ${PIPESTATUS[0]} -eq 0 ]; then
  log_success "Schema applied successfully"
else
  log_error "Schema application failed - check /tmp/schema-init.log"
  exit 1
fi

# Verify tables
log_info "Verifying tables..."
TABLES=$(kubectl exec -n "$NAMESPACE" "$POSTGRES_POD" -- \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\dt" | grep -c "public")

if [ "$TABLES" -ge 5 ]; then
  log_success "Found $TABLES tables - schema looks good"
else
  log_warning "Only found $TABLES tables - expected at least 5"
fi

# Check agent states
log_info "Checking agent states..."
AGENT_COUNT=$(kubectl exec -n "$NAMESPACE" "$POSTGRES_POD" -- \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "SELECT COUNT(*) FROM agent_states;")

log_success "Agent states table has $AGENT_COUNT rows"

# Display schema summary
log_info ""
log_info "=== Database Schema Summary ==="
kubectl exec -n "$NAMESPACE" "$POSTGRES_POD" -- \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\dt"

log_success ""
log_success "=== Database Initialization Complete ==="
log_info ""
log_info "Database is ready for MARCUS 3.0 platform"
log_info ""
log_info "To connect to database:"
log_info "  kubectl exec -n $NAMESPACE -it $POSTGRES_POD -- psql -U $POSTGRES_USER -d $POSTGRES_DB"
log_info ""
log_info "To view agent states:"
log_info "  kubectl exec -n $NAMESPACE $POSTGRES_POD -- psql -U $POSTGRES_USER -d $POSTGRES_DB -c 'SELECT * FROM agent_states;'"
