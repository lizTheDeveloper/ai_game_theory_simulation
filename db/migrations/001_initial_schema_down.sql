-- Migration Rollback: 001_initial_schema
-- Description: Rollback initial schema
-- Author: Marcus (platform-eng-001)
-- Date: 2025-11-16

-- Down Migration
\echo 'Rolling back migration: 001_initial_schema'

-- Drop views first
DROP VIEW IF EXISTS memory_health_dashboard;
DROP VIEW IF EXISTS claims_pending_review;
DROP VIEW IF EXISTS parameter_provenance_health;
DROP VIEW IF EXISTS active_lss_alerts;

-- Drop functions
DROP FUNCTION IF EXISTS get_lss_alerts(TEXT);
DROP FUNCTION IF EXISTS get_unverified_claims(TEXT);
DROP FUNCTION IF EXISTS calculate_parameter_drift(UUID);
DROP FUNCTION IF EXISTS check_task_consolidation();
DROP FUNCTION IF EXISTS track_parameter_change();

-- Drop tables (in reverse dependency order)
DROP TABLE IF EXISTS guidelines CASCADE;
DROP TABLE IF EXISTS learnings CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS tool_calls CASCADE;
DROP TABLE IF EXISTS memory_health CASCADE;
DROP TABLE IF EXISTS grading_results CASCADE;
DROP TABLE IF EXISTS lss_events CASCADE;
DROP TABLE IF EXISTS claim_revisions CASCADE;
DROP TABLE IF EXISTS claims CASCADE;
DROP TABLE IF EXISTS parameter_history CASCADE;
DROP TABLE IF EXISTS parameters CASCADE;
DROP TABLE IF EXISTS citations CASCADE;

-- Drop extensions
DROP EXTENSION IF EXISTS "btree_gin";
DROP EXTENSION IF EXISTS "pg_trgm";
DROP EXTENSION IF EXISTS "uuid-ossp";

\echo 'Migration 001_initial_schema rolled back successfully'
