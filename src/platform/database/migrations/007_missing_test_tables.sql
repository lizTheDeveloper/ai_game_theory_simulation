-- Migration: Missing Tables for Test Suite
-- Date: 2025-11-21
-- Purpose: Create tables expected by test_marcus_complete.sh
--
-- The test suite expects:
-- 1. refresh_tokens table (currently refresh tokens are stored in users table)
-- 2. auth_audit_log table (currently using audit_logs table)

-- ============================================================================
-- Refresh Tokens Table (Separate from Users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,  -- SHA-256 hash of the refresh token
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Device/session tracking
    user_agent TEXT,
    ip_address INET,

    -- Security
    is_revoked BOOLEAN DEFAULT false,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_reason TEXT,

    -- Ensure one active token per user per device
    UNIQUE(user_id, user_agent)
);

-- Indices for refresh tokens
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_is_revoked ON refresh_tokens(is_revoked);

-- Automatic cleanup of expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_refresh_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM refresh_tokens WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE refresh_tokens IS 'JWT refresh tokens for secure session management';
COMMENT ON COLUMN refresh_tokens.token_hash IS 'SHA-256 hash of refresh token (never store plain token)';
COMMENT ON COLUMN refresh_tokens.is_revoked IS 'Whether token has been manually revoked';

-- ============================================================================
-- Auth Audit Log Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS auth_audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

    -- Authentication event
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'login_success', 'login_failed', 'logout',
        'token_refresh', 'token_revoked',
        'password_change', 'password_reset_request', 'password_reset_complete',
        'account_locked', 'account_unlocked',
        'email_verification', 'role_change'
    )),

    -- Request context
    ip_address INET,
    user_agent TEXT,

    -- Additional details
    details JSONB,

    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices for auth audit log
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_user_id ON auth_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_event_type ON auth_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_created_at ON auth_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_ip_address ON auth_audit_log(ip_address);

-- GIN index for JSONB details
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_details_gin ON auth_audit_log USING gin(details);

-- Automatic cleanup: delete logs older than 1 year
CREATE OR REPLACE FUNCTION cleanup_old_auth_audit_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM auth_audit_log WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE auth_audit_log IS 'Authentication and authorization audit trail for security monitoring';
COMMENT ON COLUMN auth_audit_log.event_type IS 'Type of authentication event';
COMMENT ON COLUMN auth_audit_log.details IS 'Additional event-specific information';

-- ============================================================================
-- Verification
-- ============================================================================

SELECT 'refresh_tokens' as table_name, COUNT(*) as row_count FROM refresh_tokens
UNION ALL
SELECT 'auth_audit_log' as table_name, COUNT(*) as row_count FROM auth_audit_log;
