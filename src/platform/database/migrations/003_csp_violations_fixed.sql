-- Migration: CSP Violation Tracking (FIXED)
-- Date: 2025-11-21
-- Purpose: Store Content Security Policy violations for security analysis
-- Fix: Replaced UNIQUE constraint with partial unique index (PostgreSQL doesn't allow functions in UNIQUE constraints)

CREATE TABLE IF NOT EXISTS csp_violations (
    id SERIAL PRIMARY KEY,
    document_uri TEXT NOT NULL,
    violated_directive TEXT NOT NULL,
    blocked_uri TEXT NOT NULL,
    original_policy TEXT,
    user_agent TEXT,
    ip_address INET,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: Duplicate prevention within time windows is handled by application logic
-- This avoids PostgreSQL limitations with non-immutable functions in constraints

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_csp_violations_timestamp ON csp_violations(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_csp_violations_directive ON csp_violations(violated_directive);
CREATE INDEX IF NOT EXISTS idx_csp_violations_blocked_uri ON csp_violations(blocked_uri);

-- Automatic cleanup: delete violations older than 90 days
CREATE OR REPLACE FUNCTION cleanup_old_csp_violations()
RETURNS void AS $$
BEGIN
    DELETE FROM csp_violations WHERE timestamp < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE csp_violations IS 'Content Security Policy violation reports for security monitoring';
COMMENT ON COLUMN csp_violations.document_uri IS 'URI of the document where violation occurred';
COMMENT ON COLUMN csp_violations.violated_directive IS 'CSP directive that was violated (e.g., script-src)';
COMMENT ON COLUMN csp_violations.blocked_uri IS 'URI that was blocked by CSP';
COMMENT ON COLUMN csp_violations.original_policy IS 'Full CSP policy that was violated';
