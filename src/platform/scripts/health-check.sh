#!/bin/bash
# MARCUS 3.0 - Health Check Script

set -e

ORCHESTRATOR_URL="${ORCHESTRATOR_URL:-http://localhost:3000}"
TIMEOUT="${TIMEOUT:-60}"

echo "🔍 Running health checks for MARCUS 3.0..."

# Check orchestrator
echo "Checking orchestrator..."
if ! curl -f -s "${ORCHESTRATOR_URL}/health" > /dev/null; then
    echo "❌ Orchestrator health check failed"
    exit 1
fi
echo "✅ Orchestrator healthy"

# Check metrics endpoint
echo "Checking metrics..."
if ! curl -f -s "${ORCHESTRATOR_URL}/metrics" > /dev/null; then
    echo "❌ Metrics endpoint failed"
    exit 1
fi
echo "✅ Metrics endpoint healthy"

# Check agent status
echo "Checking agent status..."
AGENT_STATUS=$(curl -s "${ORCHESTRATOR_URL}/api/agents/status" | jq -r '.healthy')
if [ "$AGENT_STATUS" != "true" ]; then
    echo "❌ Agents unhealthy"
    exit 1
fi
echo "✅ Agents healthy"

echo "✅ All health checks passed"
