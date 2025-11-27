/**
 * MARCUS 3.0 Agent System Schema
 * Migration 006: Add agent_states table and update citation_analyses structure
 *
 * This migration adds the tables required by the Python Agent System:
 * - agent_states: Per-agent learning state and reputation tracking
 * - Updates citation_analyses to match orchestrator expectations
 *
 * Date: 2025-11-20
 * Author: Marcus (Platform Engineer)
 */

-- ============================================================================
-- Drop existing tables if structure needs to change
-- ============================================================================

-- Keep existing tables but add new agent_states table
-- The citation_analyses table will be modified to add missing columns

-- ============================================================================
-- Agent States Table
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
    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT reputation_range CHECK (reputation >= 0 AND reputation <= 1),
    CONSTRAINT exploration_range CHECK (exploration_rate >= 0 AND exploration_rate <= 1)
);

-- ============================================================================
-- Update Citation Analyses Table
-- ============================================================================

-- Add columns needed by orchestrator if they don't exist
DO $$
BEGIN
    -- Add source column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='citation_analyses' AND column_name='source') THEN
        ALTER TABLE citation_analyses ADD COLUMN source VARCHAR(255) DEFAULT 'platform';
    END IF;

    -- Add mean_integrity column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='citation_analyses' AND column_name='mean_integrity') THEN
        ALTER TABLE citation_analyses ADD COLUMN mean_integrity FLOAT;
    END IF;

    -- Add consensus column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='citation_analyses' AND column_name='consensus') THEN
        ALTER TABLE citation_analyses ADD COLUMN consensus FLOAT;
    END IF;

    -- Add behavior_distribution column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='citation_analyses' AND column_name='behavior_distribution') THEN
        ALTER TABLE citation_analyses ADD COLUMN behavior_distribution JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- Add recommendations column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='citation_analyses' AND column_name='recommendations') THEN
        ALTER TABLE citation_analyses ADD COLUMN recommendations JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Add num_agents column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='citation_analyses' AND column_name='num_agents') THEN
        ALTER TABLE citation_analyses ADD COLUMN num_agents INTEGER;
    END IF;

    -- Add latency_ms column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='citation_analyses' AND column_name='latency_ms') THEN
        ALTER TABLE citation_analyses ADD COLUMN latency_ms INTEGER;
    END IF;

    -- Add timestamp column if missing (used by orchestrator for analysis records)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='citation_analyses' AND column_name='timestamp') THEN
        ALTER TABLE citation_analyses ADD COLUMN timestamp TIMESTAMP NOT NULL DEFAULT NOW();
    END IF;
END $$;

-- Add constraints to new columns
DO $$
BEGIN
    -- Add integrity range check if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage
                   WHERE constraint_name='mean_integrity_range') THEN
        ALTER TABLE citation_analyses ADD CONSTRAINT mean_integrity_range
            CHECK (mean_integrity IS NULL OR (mean_integrity >= 0 AND mean_integrity <= 1));
    END IF;

    -- Add consensus range check if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage
                   WHERE constraint_name='consensus_range') THEN
        ALTER TABLE citation_analyses ADD CONSTRAINT consensus_range
            CHECK (consensus IS NULL OR (consensus >= 0 AND consensus <= 1));
    END IF;
END $$;

-- ============================================================================
-- Performance Indices for Agent States
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_agent_states_reputation ON agent_states(reputation DESC);
CREATE INDEX IF NOT EXISTS idx_agent_states_timestamp ON agent_states(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_agent_states_behavior ON agent_states(current_behavior);
CREATE INDEX IF NOT EXISTS idx_agent_states_version ON agent_states(version);

-- GIN index for JSONB memory_state queries
CREATE INDEX IF NOT EXISTS idx_agent_states_memory_gin ON agent_states USING gin(memory_state);

-- ============================================================================
-- Additional Indices for Citation Analyses
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_citation_analyses_source ON citation_analyses(source);
CREATE INDEX IF NOT EXISTS idx_citation_analyses_mean_integrity ON citation_analyses(mean_integrity);
CREATE INDEX IF NOT EXISTS idx_citation_analyses_consensus ON citation_analyses(consensus);
CREATE INDEX IF NOT EXISTS idx_citation_analyses_num_agents ON citation_analyses(num_agents);
CREATE INDEX IF NOT EXISTS idx_citation_analyses_latency ON citation_analyses(latency_ms);
CREATE INDEX IF NOT EXISTS idx_citation_analyses_timestamp ON citation_analyses(timestamp DESC);

-- ============================================================================
-- Updated At Trigger for Agent States
-- ============================================================================

-- Agent_states uses 'timestamp' column instead of 'updated_at', so needs custom function
CREATE OR REPLACE FUNCTION update_agent_states_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.timestamp = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists, then create with correct function
DROP TRIGGER IF EXISTS update_agent_states_timestamp ON agent_states;
CREATE TRIGGER update_agent_states_timestamp
    BEFORE UPDATE ON agent_states
    FOR EACH ROW
    EXECUTE FUNCTION update_agent_states_timestamp_column();

-- ============================================================================
-- Verification
-- ============================================================================

-- Show agent_states structure
SELECT
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'agent_states'
ORDER BY ordinal_position;

-- Show updated citation_analyses structure
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'citation_analyses'
ORDER BY ordinal_position;

-- Count existing rows
SELECT 'agent_states' as table_name, COUNT(*) as row_count FROM agent_states
UNION ALL
SELECT 'citation_analyses' as table_name, COUNT(*) as row_count FROM citation_analyses;
