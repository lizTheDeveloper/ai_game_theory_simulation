/**
 * MARCUS 3.0 Complete Database Schema
 * Migration 005: Add missing tables discovered during debugging
 *
 * Creates tables for:
 * - Enhanced users table (with all auth fields)
 * - Citation analyses tracking
 * - Agent behaviors and reputation
 * - Comprehensive audit logging
 *
 * Date: 2024-11-18
 * Author: System Integration
 */

-- ============================================================================
-- Users Table (Enhanced from debugging session)
-- ============================================================================

-- Drop existing users table if it exists and recreate with full schema
DROP TABLE IF EXISTS citation_analyses CASCADE;
DROP TABLE IF EXISTS agent_behaviors CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
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

    -- Security
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP,
    locked_until TIMESTAMP
);

-- ============================================================================
-- Citation Analyses Table
-- ============================================================================

CREATE TABLE citation_analyses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

    -- Citation content (nullable for orchestrator aggregated analyses)
    document_text TEXT,
    claimed_source VARCHAR(500),
    actual_source VARCHAR(500),

    -- Analysis results
    integrity_score DECIMAL(5,2),  -- 0-100 scale
    consensus_data JSONB,           -- Agent consensus metrics
    agent_results JSONB,            -- Individual agent results
    metadata JSONB,                 -- Additional metadata

    -- Performance tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    analysis_duration_ms INTEGER,

    -- Status tracking
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- ============================================================================
-- Agent Behaviors Table
-- ============================================================================

CREATE TABLE agent_behaviors (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(50) NOT NULL,
    behavior_type VARCHAR(50) NOT NULL CHECK (behavior_type IN (
        'honest', 'sloppy', 'biased', 'fabricator', 'plagiarist',
        'citation_padding', 'selective', 'outdated', 'misattribution'
    )),

    -- Reputation tracking
    reputation_score DECIMAL(3,2) DEFAULT 0.50 CHECK (reputation_score >= 0 AND reputation_score <= 1),
    total_analyses INTEGER DEFAULT 0,
    violation_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP,

    -- Additional metadata
    metadata JSONB,

    -- Ensure unique agent_id + behavior_type combination
    UNIQUE(agent_id, behavior_type)
);

-- ============================================================================
-- Audit Logs Table
-- ============================================================================

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

    -- Action details
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(255),

    -- Request metadata
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_data JSONB,
    response_status INTEGER,

    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Additional metadata
    metadata JSONB
);

-- ============================================================================
-- Performance Indices
-- ============================================================================

-- Users table indices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_email_verified ON users(email_verified);

-- Citation analyses indices
CREATE INDEX idx_citation_analyses_user_id ON citation_analyses(user_id);
CREATE INDEX idx_citation_analyses_created_at ON citation_analyses(created_at);
CREATE INDEX idx_citation_analyses_status ON citation_analyses(status);
CREATE INDEX idx_citation_analyses_integrity_score ON citation_analyses(integrity_score);

-- Agent behaviors indices
CREATE INDEX idx_agent_behaviors_agent_id ON agent_behaviors(agent_id);
CREATE INDEX idx_agent_behaviors_behavior_type ON agent_behaviors(behavior_type);
CREATE INDEX idx_agent_behaviors_reputation ON agent_behaviors(reputation_score);
CREATE INDEX idx_agent_behaviors_last_active ON agent_behaviors(last_active);

-- Audit logs indices
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_ip_address ON audit_logs(ip_address);

-- ============================================================================
-- Updated At Trigger Function
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_citation_analyses_updated_at BEFORE UPDATE ON citation_analyses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_behaviors_updated_at BEFORE UPDATE ON agent_behaviors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Initial Data: Create Default Admin User
-- ============================================================================

-- Insert default admin user (password: SecurePassword123!)
-- Password hash generated with bcrypt, 12 rounds
INSERT INTO users (email, password_hash, role, email_verified, is_active)
VALUES (
    'admin@marcus.local',
    '$2b$12$cloTZR1VaBlZ5lGDrg/TfOOvXk4660MCSU.SvzJljZnutD7OJGrpe',
    'admin',
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- Insert test user (password: SecurePassword123!)
INSERT INTO users (email, password_hash, role, email_verified, is_active)
VALUES (
    'test@example.com',
    '$2b$12$cloTZR1VaBlZ5lGDrg/TfOOvXk4660MCSU.SvzJljZnutD7OJGrpe',
    'operator',
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- Verification
-- ============================================================================

-- Show created tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Show user count
SELECT COUNT(*) as user_count FROM users;

-- Show indices
SELECT indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY indexname;
