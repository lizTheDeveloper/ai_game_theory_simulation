/**
 * MARCUS 3.0 Initial Database Schema
 * Migration 001: Foundation schema for citation integrity platform
 *
 * This migration establishes the base tables for MARCUS platform:
 * - users: Authentication and authorization
 * - agent_states: Python agent learning state persistence
 * - citation_analyses: Citation integrity analysis results
 * - Basic indexes for performance
 *
 * Created: 2025-11-22
 * Author: Marcus (Platform Engineer)
 *
 * Note: This is a consolidation migration for new deployments.
 * Existing deployments with tables already created should skip this
 * by manually recording it in schema_migrations.
 */

-- ============================================================================
-- Users Table (Authentication + Authorization)
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'viewer' CHECK (role IN ('viewer', 'operator', 'admin')),

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,

    -- Email verification
    email_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    verification_token_expires TIMESTAMP,

    -- Account status
    is_active BOOLEAN DEFAULT true,

    -- Refresh tokens
    refresh_token TEXT,
    refresh_token_expires TIMESTAMP,

    -- Security (rate limiting, brute force protection)
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP,
    locked_until TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- ============================================================================
-- Agent States Table (Python Agent System)
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_states (
    agent_id VARCHAR(50) PRIMARY KEY,
    reputation FLOAT NOT NULL DEFAULT 0.5,
    total_citations INTEGER NOT NULL DEFAULT 0,
    detected_violations INTEGER NOT NULL DEFAULT 0,
    current_behavior VARCHAR(50),
    memory_state JSONB NOT NULL DEFAULT '{}'::jsonb,
    exploration_rate FLOAT NOT NULL DEFAULT 0.2,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0,  -- Optimistic locking

    CONSTRAINT reputation_range CHECK (reputation >= 0 AND reputation <= 1),
    CONSTRAINT exploration_range CHECK (exploration_rate >= 0 AND exploration_rate <= 1)
);

-- Basic indexes (performance indexes added in migration 002)
CREATE INDEX IF NOT EXISTS idx_agent_states_timestamp ON agent_states(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_agent_states_reputation ON agent_states(reputation DESC);
CREATE INDEX IF NOT EXISTS idx_agent_states_behavior ON agent_states(current_behavior);

-- ============================================================================
-- Citation Analyses Table (Analysis Results)
-- ============================================================================

CREATE TABLE IF NOT EXISTS citation_analyses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

    -- Citation content
    document_text TEXT NOT NULL,
    source VARCHAR(255) DEFAULT 'platform',
    claimed_source VARCHAR(500),
    actual_source VARCHAR(500),

    -- Analysis results (from multi-agent consensus)
    mean_integrity FLOAT,  -- Average integrity score from all agents (0-1)
    consensus FLOAT,       -- Agreement level between agents (0-1)
    integrity_score DECIMAL(5,2),  -- Legacy field (0-100 scale)

    -- Detailed results
    behavior_distribution JSONB DEFAULT '{}'::jsonb,  -- Count of each behavior detected
    recommendations JSONB DEFAULT '[]'::jsonb,        -- Actionable recommendations
    consensus_data JSONB,      -- Legacy field
    agent_results JSONB,       -- Individual agent results
    metadata JSONB,            -- Additional metadata

    -- Performance tracking
    num_agents INTEGER,        -- Number of agents that analyzed this citation
    latency_ms INTEGER,        -- Analysis duration in milliseconds
    analysis_duration_ms INTEGER,  -- Legacy field

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Duplicate for compatibility
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Status tracking
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),

    -- Constraints
    CONSTRAINT mean_integrity_range CHECK (mean_integrity IS NULL OR (mean_integrity >= 0 AND mean_integrity <= 1)),
    CONSTRAINT consensus_range CHECK (consensus IS NULL OR (consensus >= 0 AND consensus <= 1))
);

-- Basic indexes (performance indexes added in migration 002)
CREATE INDEX IF NOT EXISTS idx_citation_analyses_user ON citation_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_citation_analyses_timestamp ON citation_analyses(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_citation_analyses_source ON citation_analyses(source);
CREATE INDEX IF NOT EXISTS idx_citation_analyses_status ON citation_analyses(status);

-- ============================================================================
-- Auth Audit Log (Security Events)
-- ============================================================================

CREATE TABLE IF NOT EXISTS auth_audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,  -- login, logout, failed_login, password_change, etc.
    ip_address VARCHAR(45),            -- IPv4 or IPv6
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason TEXT,
    metadata JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auth_audit_user ON auth_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_timestamp ON auth_audit_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_auth_audit_event ON auth_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_auth_audit_ip ON auth_audit_log(ip_address);

-- ============================================================================
-- Verification
-- ============================================================================

-- Verify tables exist
DO $$
DECLARE
    missing_tables TEXT[];
BEGIN
    SELECT array_agg(table_name)
    INTO missing_tables
    FROM unnest(ARRAY['users', 'agent_states', 'citation_analyses', 'auth_audit_log']) AS table_name
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = table_name
    );

    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Migration 001 incomplete: Missing tables: %', array_to_string(missing_tables, ', ');
    END IF;

    RAISE NOTICE '✅ Migration 001 complete: All base tables created successfully';
END $$;

-- Show table sizes (for monitoring schema growth)
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'agent_states', 'citation_analyses', 'auth_audit_log')
ORDER BY tablename;
