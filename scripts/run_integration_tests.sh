#!/bin/bash
# MARCUS 3.0 - Integration Test Runner
# Sets up environment and runs integration tests

set -e

echo "🧪 MARCUS 3.0 Integration Test Runner"
echo "======================================"
echo ""

# Get PostgreSQL port
PG_PORT=$(sudo -u postgres psql -tAc "SHOW port;" 2>/dev/null || echo "5433")
echo "📋 Detected PostgreSQL port: $PG_PORT"

# Get Redis password from .env if it exists
if [ -f ".env" ]; then
    REDIS_PASSWORD=$(grep "^REDIS_PASSWORD=" .env | cut -d= -f2 || echo "")
    if [ -n "$REDIS_PASSWORD" ]; then
        echo "📋 Redis password loaded from .env"
    else
        echo "⚠️  No Redis password in .env (using no auth)"
    fi
else
    REDIS_PASSWORD=""
    echo "⚠️  No .env file found (using no auth)"
fi

# Set test environment variables
export TEST_DB_PORT="$PG_PORT"
export DATABASE_HOST=localhost
export DATABASE_PORT="$PG_PORT"
export DATABASE_NAME=marcus_test
export DATABASE_USER=marcus
export DATABASE_PASSWORD=marcus_dev_password
export REDIS_HOST=localhost
export REDIS_PORT=6379
export REDIS_PASSWORD="$REDIS_PASSWORD"
export JWT_SECRET=test_jwt_secret_minimum_32_chars_long_for_testing
export JWT_REFRESH_SECRET=test_jwt_refresh_secret_minimum_32_chars_long_for_testing

echo "📋 Test environment configured"
echo "   PostgreSQL: localhost:$PG_PORT/marcus_test"
echo "   Redis: localhost:6379 (auth: ${REDIS_PASSWORD:+enabled}${REDIS_PASSWORD:-disabled})"
echo ""

# Run tests
echo "🧪 Running integration tests..."
echo ""
npm test -- authFlow.test.ts

echo ""
echo "✅ Tests complete!"
