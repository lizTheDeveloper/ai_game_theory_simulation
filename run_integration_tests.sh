#!/bin/bash
# Run integration tests with automatic database setup

set -e

echo "🧪 Running MARCUS Integration Tests"
echo "===================================="

# Setup test database
./setup_test_db.sh

# Run integration tests
echo ""
echo "🏃 Running integration tests..."
npm test -- authFlow.test.ts --detectOpenHandles

echo ""
echo "✅ Integration tests complete!"
