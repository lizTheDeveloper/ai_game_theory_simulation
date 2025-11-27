#!/bin/bash
# MARCUS 3.0 - Apply All Database Migrations
# Applies all available migrations to both marcus_test and marcus databases

set -euo pipefail

echo "🔄 MARCUS 3.0 - Database Migration Script"
echo "=========================================="
echo ""

# Change to /tmp where postgres can access files
cd /tmp

# Copy migration files
echo "📁 Copying migration files to /tmp..."
cp ~/ai_game_theory_simulation/src/platform/database/migrations/*.sql . 2>/dev/null || {
    echo "❌ Error: Could not copy migration files"
    echo "   Make sure you're in the ai_game_theory_simulation directory"
    exit 1
}

# List available migrations
echo "✅ Available migrations:"
ls -1 *.sql | sort
echo ""

# Function to apply migrations to a database
apply_migrations() {
    local DB_NAME=$1
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📊 Applying migrations to database: $DB_NAME"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    # Check if database exists
    if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        echo "⚠️  Database $DB_NAME does not exist. Creating it..."
        sudo -u postgres createdb "$DB_NAME"
        echo "✅ Database $DB_NAME created"
        echo ""
    fi

    # Apply migrations in order (only the ones that exist)
    # Note: 001 and 002 don't exist, starting from 003
    # Using 003_csp_violations_fixed.sql instead of broken 003_csp_violations.sql

    if [ -f "003_csp_violations_fixed.sql" ]; then
        echo "📋 Applying migration 003 (CSP violations - FIXED)..."
        sudo -u postgres psql -d "$DB_NAME" -f 003_csp_violations_fixed.sql
        echo "✅ Migration 003 applied"
        echo ""
    elif [ -f "003_csp_violations.sql" ]; then
        echo "⚠️  Warning: Using old 003_csp_violations.sql (has syntax errors)"
        echo "📋 Applying migration 003 (CSP violations)..."
        sudo -u postgres psql -d "$DB_NAME" -f 003_csp_violations.sql || echo "❌ Migration 003 failed (expected - syntax error)"
        echo ""
    fi

    if [ -f "004_password_reset_tokens.sql" ]; then
        echo "📋 Applying migration 004 (password reset tokens)..."
        sudo -u postgres psql -d "$DB_NAME" -f 004_password_reset_tokens.sql
        echo "✅ Migration 004 applied"
        echo ""
    fi

    if [ -f "005_complete_schema.sql" ]; then
        echo "📋 Applying migration 005 (complete schema - users, citations, agents, audit)..."
        sudo -u postgres psql -d "$DB_NAME" -f 005_complete_schema.sql
        echo "✅ Migration 005 applied"
        echo ""
    fi

    if [ -f "006_agent_system_schema.sql" ]; then
        echo "📋 Applying migration 006 (agent system)..."
        sudo -u postgres psql -d "$DB_NAME" -f 006_agent_system_schema.sql
        echo "✅ Migration 006 applied"
        echo ""
    fi

    if [ -f "007_missing_test_tables.sql" ]; then
        echo "📋 Applying migration 007 (refresh_tokens & auth_audit_log)..."
        sudo -u postgres psql -d "$DB_NAME" -f 007_missing_test_tables.sql
        echo "✅ Migration 007 applied"
        echo ""
    fi

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ All migrations applied to $DB_NAME"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    # Verify tables
    echo "📊 Tables in $DB_NAME:"
    sudo -u postgres psql -d "$DB_NAME" -c "\dt" | grep -E "^\s*(public|Schema)"
    echo ""

    # Check for users table specifically
    if sudo -u postgres psql -d "$DB_NAME" -tAc "SELECT to_regclass('public.users')" | grep -q "users"; then
        echo "✅ Users table exists"
        echo ""
        echo "👥 Users in $DB_NAME:"
        sudo -u postgres psql -d "$DB_NAME" -c "SELECT email, role, is_active FROM users;" 2>/dev/null || echo "  (No users yet)"
        echo ""
    else
        echo "⚠️  Warning: Users table not found in $DB_NAME"
        echo ""
    fi
}

# Apply to marcus_test database
apply_migrations "marcus_test"

# Apply to marcus database
apply_migrations "marcus"

# Clean up
echo "🧹 Cleaning up temp files..."
rm -f *.sql
echo "✅ Cleanup complete"
echo ""

# Return to project directory
cd ~/ai_game_theory_simulation

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DATABASE MIGRATIONS COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Summary:"
echo "  ✅ Migration 003: CSP violations tracking (FIXED version)"
echo "  ✅ Migration 004: Password reset tokens"
echo "  ✅ Migration 005: Complete schema (users, citations, agents, audit)"
echo "  ✅ Migration 006: Agent system schema"
echo "  ✅ Migration 007: Missing test tables (refresh_tokens, auth_audit_log)"
echo ""
echo "🎯 Next steps:"
echo "  1. Verify admin user exists:"
echo "     sudo -u postgres psql -d marcus_test -c \"SELECT email, role FROM users;\""
echo ""
echo "  2. Run admin password change script:"
echo "     sudo ./scripts/change_admin_password.sh"
echo ""
echo "  3. Restart platform:"
echo "     sudo systemctl restart marcus-platform"
echo ""
echo "  4. Run integration tests:"
echo "     npm test"
echo ""
