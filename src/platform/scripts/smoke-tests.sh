#!/bin/bash
# MARCUS 3.0 - Smoke Tests

set -e

ORCHESTRATOR_URL="${1:-http://localhost:3000}"

echo "🧪 Running smoke tests for MARCUS 3.0..."

# Test 1: Health check
echo "Test 1: Health check..."
curl -f -s "${ORCHESTRATOR_URL}/health" | jq . || exit 1

# Test 2: Metrics endpoint
echo "Test 2: Metrics endpoint..."
curl -f -s "${ORCHESTRATOR_URL}/metrics" | grep -q "citation_accuracy" || exit 1

# Test 3: Simple citation analysis
echo "Test 3: Citation analysis..."
RESPONSE=$(curl -s -X POST "${ORCHESTRATOR_URL}/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "Test Paper",
    "citation": "According to Smith et al. (2024), the sky is blue.",
    "context": "Test context"
  }')

echo "$RESPONSE" | jq -e '.integrityScore' > /dev/null || exit 1
echo "✅ Citation analysis working"

# Test 4: Agent coordination
echo "Test 4: Agent coordination..."
CONSENSUS=$(echo "$RESPONSE" | jq -r '.consensus')
if (( $(echo "$CONSENSUS < 0 || $CONSENSUS > 1" | bc -l) )); then
    echo "❌ Invalid consensus value: $CONSENSUS"
    exit 1
fi
echo "✅ Agent coordination working"

echo "✅ All smoke tests passed"
