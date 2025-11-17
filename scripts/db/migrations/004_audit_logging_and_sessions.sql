-- ============================================================================
-- MARCUS 3.0 Citation Integrity Platform
-- Migration 004: Comprehensive Audit Logging and Session Management
--
-- Creates tables for:
-- 1. audit_log - Comprehensive security event logging
-- 2. sessions - Session management with timeouts and tracking
--
-- @author Marcus (Platform Engineer)
-- ============================================================================

-- ============================================================================
-- Audit Log Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,

    -- Event identification
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),

    -- User context
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255),

    -- Request context
    ip_address VARCHAR(45), -- IPv6 max length
    user_agent TEXT,

    -- Resource and action
    resource VARCHAR(255), -- API endpoint or resource path
    action VARCHAR(50), -- HTTP method or action type

    -- Result
    result VARCHAR(20) NOT NULL CHECK (result IN ('success', 'failure')),
    failure_reason TEXT,

    -- Additional context (JSON)
    metadata JSONB,

    -- Timestamp (indexed for queries)
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Environment
    environment VARCHAR(50) DEFAULT 'production'
);

-- Indexes for common queries
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp DESC);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_log_event_type ON audit_log(event_type);
CREATE INDEX idx_audit_log_severity ON audit_log(severity);
CREATE INDEX idx_audit_log_result ON audit_log(result);
CREATE INDEX idx_audit_log_resource ON audit_log(resource);

-- GIN index for metadata JSONB queries
CREATE INDEX idx_audit_log_metadata ON audit_log USING gin(metadata);

-- Composite index for time-range queries with filtering
CREATE INDEX idx_audit_log_timestamp_severity ON audit_log(timestamp DESC, severity);

-- ============================================================================
-- Sessions Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS sessions (
    id BIGSERIAL PRIMARY KEY,

    -- Session identification
    session_id VARCHAR(64) NOT NULL UNIQUE,

    -- User reference
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Session tracking
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_activity_at TIMESTAMP NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMP, -- NULL if active, set on logout/expiry

    -- CSRF token (if using session-based CSRF)
    csrf_token VARCHAR(64),

    CONSTRAINT check_ended_after_created CHECK (ended_at IS NULL OR ended_at >= created_at)
);

-- Indexes for session lookup and management
CREATE INDEX idx_sessions_session_id ON sessions(session_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_active ON sessions(user_id, ended_at) WHERE ended_at IS NULL;
CREATE INDEX idx_sessions_last_activity ON sessions(last_activity_at DESC) WHERE ended_at IS NULL;

-- ============================================================================
-- Audit Log Helper Functions
-- ============================================================================

/**
 * Function to log security event
 *
 * Example usage:
 *   SELECT log_audit_event(
 *     'auth.login.failure',
 *     'medium',
 *     NULL,
 *     'user@example.com',
 *     '192.168.1.1',
 *     'Mozilla/5.0...',
 *     '/auth/login',
 *     'POST',
 *     'failure',
 *     'Invalid password',
 *     '{"attempts": 3}'::jsonb
 *   );
 */
CREATE OR REPLACE FUNCTION log_audit_event(
    p_event_type VARCHAR,
    p_severity VARCHAR,
    p_user_id UUID,
    p_email VARCHAR,
    p_ip_address VARCHAR,
    p_user_agent TEXT,
    p_resource VARCHAR,
    p_action VARCHAR,
    p_result VARCHAR,
    p_failure_reason TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_log_id BIGINT;
BEGIN
    INSERT INTO audit_log (
        event_type, severity, user_id, email, ip_address, user_agent,
        resource, action, result, failure_reason, metadata
    )
    VALUES (
        p_event_type, p_severity, p_user_id, p_email, p_ip_address, p_user_agent,
        p_resource, p_action, p_result, p_failure_reason, p_metadata
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$;

/**
 * Function to query recent high-severity events
 */
CREATE OR REPLACE FUNCTION get_recent_security_events(
    p_hours INTEGER DEFAULT 24,
    p_min_severity VARCHAR DEFAULT 'high'
)
RETURNS TABLE (
    id BIGINT,
    event_type VARCHAR,
    severity VARCHAR,
    email VARCHAR,
    resource VARCHAR,
    timestamp TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id, a.event_type, a.severity, a.email, a.resource, a.timestamp
    FROM audit_log a
    WHERE a.timestamp >= NOW() - (p_hours || ' hours')::INTERVAL
      AND (
        (p_min_severity = 'low') OR
        (p_min_severity = 'medium' AND a.severity IN ('medium', 'high', 'critical')) OR
        (p_min_severity = 'high' AND a.severity IN ('high', 'critical')) OR
        (p_min_severity = 'critical' AND a.severity = 'critical')
      )
    ORDER BY a.timestamp DESC;
END;
$$;

-- ============================================================================
-- Session Management Helper Functions
-- ============================================================================

/**
 * Function to clean up expired sessions
 */
CREATE OR REPLACE FUNCTION cleanup_expired_sessions(
    p_inactivity_timeout_seconds INTEGER DEFAULT 1800  -- 30 minutes
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    -- Mark sessions as ended if inactive beyond timeout
    UPDATE sessions
    SET ended_at = NOW()
    WHERE ended_at IS NULL
      AND last_activity_at < NOW() - (p_inactivity_timeout_seconds || ' seconds')::INTERVAL;

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    RETURN v_deleted_count;
END;
$$;

/**
 * Function to get active session count for user
 */
CREATE OR REPLACE FUNCTION get_active_session_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO v_count
    FROM sessions
    WHERE user_id = p_user_id
      AND ended_at IS NULL;

    RETURN v_count;
END;
$$;

-- ============================================================================
-- Cleanup Jobs (Run Periodically)
-- ============================================================================

/**
 * Cleanup old audit logs (retain for 1 year by default)
 */
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(
    p_retention_days INTEGER DEFAULT 365
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM audit_log
    WHERE timestamp < NOW() - (p_retention_days || ' days')::INTERVAL;

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    RETURN v_deleted_count;
END;
$$;

-- ============================================================================
-- Sample Data (Development Only)
-- ============================================================================

-- Uncomment for development environment to test audit logging
-- INSERT INTO audit_log (event_type, severity, email, ip_address, resource, action, result)
-- VALUES
--   ('auth.login.success', 'low', 'admin@example.com', '127.0.0.1', '/auth/login', 'POST', 'success'),
--   ('auth.login.failure', 'medium', 'hacker@evil.com', '1.2.3.4', '/auth/login', 'POST', 'failure'),
--   ('authz.permission.denied', 'high', 'viewer@example.com', '127.0.0.1', '/api/admin/users', 'GET', 'failure');

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Log migration
INSERT INTO audit_log (event_type, severity, resource, action, result)
VALUES ('migration.004.completed', 'low', 'database', 'MIGRATION', 'success');

COMMENT ON TABLE audit_log IS 'Comprehensive security audit log for MARCUS platform (OWASP Task 1.11)';
COMMENT ON TABLE sessions IS 'Session management with timeouts and tracking (OWASP Task 1.12)';
