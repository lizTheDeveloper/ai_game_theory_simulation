-- MARCUS 3.0 Citation Integrity Platform
-- Authentication & Authorization Schema
-- Created: 2025-11-17
-- Engineer: Marcus

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table with role-based access control
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_login TIMESTAMP,

    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_role CHECK (role IN ('admin', 'operator', 'viewer'))
);

-- Index for login queries (email lookup)
CREATE INDEX idx_users_email ON users(email);

-- Index for active users
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;

-- Refresh tokens table
CREATE TABLE refresh_tokens (
    token VARCHAR(500) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    revoked BOOLEAN NOT NULL DEFAULT false,
    revoked_at TIMESTAMP,

    CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Index for token cleanup (expired tokens)
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- Index for user token lookup
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);

-- Audit log for authentication events
CREATE TABLE auth_audit_log (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255),
    event_type VARCHAR(50) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_event_type CHECK (event_type IN (
        'register', 'login', 'logout', 'refresh_token',
        'password_reset', 'failed_login', 'account_locked'
    ))
);

-- Index for audit queries (by user, by event type, by timestamp)
CREATE INDEX idx_audit_user ON auth_audit_log(user_id, timestamp DESC);
CREATE INDEX idx_audit_email ON auth_audit_log(email, timestamp DESC);
CREATE INDEX idx_audit_event ON auth_audit_log(event_type, timestamp DESC);
CREATE INDEX idx_audit_timestamp ON auth_audit_log(timestamp DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired tokens (call periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM refresh_tokens
    WHERE expires_at < NOW() OR revoked = true;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to lock user account after failed login attempts
CREATE OR REPLACE FUNCTION check_and_lock_account(
    user_email VARCHAR(255),
    max_attempts INTEGER DEFAULT 5,
    lockout_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN AS $$
DECLARE
    current_attempts INTEGER;
    user_uuid UUID;
BEGIN
    -- Get user ID and failed attempts
    SELECT id, failed_login_attempts INTO user_uuid, current_attempts
    FROM users
    WHERE email = user_email;

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    -- Increment failed attempts
    UPDATE users
    SET failed_login_attempts = failed_login_attempts + 1
    WHERE id = user_uuid;

    -- Check if we should lock the account
    IF current_attempts + 1 >= max_attempts THEN
        UPDATE users
        SET locked_until = NOW() + (lockout_minutes || ' minutes')::INTERVAL,
            failed_login_attempts = 0
        WHERE id = user_uuid;

        -- Log the lockout
        INSERT INTO auth_audit_log (user_id, email, event_type, success, failure_reason)
        VALUES (user_uuid, user_email, 'account_locked', false,
                format('Account locked after %s failed login attempts', max_attempts));

        RETURN true;  -- Account locked
    END IF;

    RETURN false;  -- Not locked yet
END;
$$ LANGUAGE plpgsql;

-- Function to reset failed login attempts on successful login
CREATE OR REPLACE FUNCTION reset_failed_attempts(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE users
    SET failed_login_attempts = 0,
        locked_until = NULL,
        last_login = NOW()
    WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create default admin user (password: changeme123!)
-- IMPORTANT: Change this password immediately in production!
INSERT INTO users (email, password_hash, role)
VALUES (
    'admin@marcus-platform.local',
    -- bcrypt hash of 'changeme123!' with salt rounds 12
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMeshwkZK64L3oD0BX/rkJP6Hy',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Grant appropriate permissions (adjust based on your PostgreSQL user)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO marcus_platform_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO marcus_platform_user;

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts with role-based access control';
COMMENT ON TABLE refresh_tokens IS 'JWT refresh tokens for session management';
COMMENT ON TABLE auth_audit_log IS 'Audit trail for all authentication events';
COMMENT ON FUNCTION cleanup_expired_tokens() IS 'Removes expired and revoked refresh tokens';
COMMENT ON FUNCTION check_and_lock_account(VARCHAR, INTEGER, INTEGER) IS 'Locks account after N failed login attempts';
COMMENT ON FUNCTION reset_failed_attempts(UUID) IS 'Resets failed login counter on successful authentication';
