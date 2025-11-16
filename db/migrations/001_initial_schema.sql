-- Migration: 001_initial_schema
-- Description: Create initial database schema for Citation Integrity Platform
-- Author: Marcus (platform-eng-001)
-- Date: 2025-11-16

-- Up Migration
\echo 'Running migration: 001_initial_schema (up)'

\i ../schema.sql

\echo 'Migration 001_initial_schema completed successfully'

-- Down Migration would go in a separate file (001_initial_schema_down.sql)
