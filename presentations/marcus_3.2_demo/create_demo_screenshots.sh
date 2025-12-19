#!/bin/bash
#
# MARCUS 3.2 Demo Screenshot Capture Helper
#
# This script sets up port forwarding and provides guidance for capturing
# demo screenshots. You can capture screenshots manually or use the automated
# Playwright-based capture (see capture_screenshots_auto.js).
#
# Usage:
#   ./create_demo_screenshots.sh
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCREENSHOTS_DIR="$SCRIPT_DIR/screenshots"

echo "🎬 MARCUS 3.2 Demo Screenshot Capture Helper"
echo "=============================================="
echo ""

# Create screenshots directory
mkdir -p "$SCREENSHOTS_DIR"
echo "✅ Screenshots directory: $SCREENSHOTS_DIR"
echo ""

# Check if GKE cluster is accessible
echo "🔍 Checking GKE cluster access..."
if ! kubectl get pods -n marcus-platform &>/dev/null; then
    echo "❌ Cannot access GKE cluster. Please authenticate first:"
    echo "   gcloud container clusters get-credentials marcus-platform --region us-central1"
    exit 1
fi

# Check pod status
echo "📊 MARCUS Platform Status:"
kubectl get pods -n marcus-platform
echo ""

# Check if pods are running
ORCHESTRATOR_RUNNING=$(kubectl get pods -n marcus-platform -l app=orchestrator -o jsonpath='{.items[0].status.phase}' 2>/dev/null || echo "")
if [ "$ORCHESTRATOR_RUNNING" != "Running" ]; then
    echo "⚠️  Warning: Orchestrator pods not running. Start them before capturing screenshots."
    echo ""
fi

# Function to check if port is already forwarded
port_in_use() {
    lsof -i ":$1" &>/dev/null
}

# Start port forwarding
echo "🔌 Setting up port forwarding..."
echo ""

PF_PIDS=()

# GraphQL / REST API (port 4001 for GraphQL, 3000 for REST)
if port_in_use 4001; then
    echo "⚠️  Port 4001 already in use (GraphQL may already be forwarded)"
else
    echo "Starting GraphQL port forward (4001)..."
    kubectl port-forward -n marcus-platform svc/orchestrator 4001:4000 >/dev/null 2>&1 &
    PF_PIDS+=($!)
    sleep 2
    echo "✅ GraphQL: http://localhost:4001/graphql"
fi

if port_in_use 3000; then
    echo "⚠️  Port 3000 already in use (REST API may already be forwarded)"
else
    echo "Starting REST API port forward (3000)..."
    kubectl port-forward -n marcus-platform svc/orchestrator 3000:3000 >/dev/null 2>&1 &
    PF_PIDS+=($!)
    sleep 2
    echo "✅ REST API: http://localhost:3000/health"
fi

# Grafana (port 5001)
if port_in_use 5001; then
    echo "⚠️  Port 5001 already in use (Grafana may already be forwarded)"
else
    echo "Starting Grafana port forward (5001)..."
    kubectl port-forward -n marcus-platform svc/grafana 5001:3000 >/dev/null 2>&1 &
    PF_PIDS+=($!)
    sleep 2
    echo "✅ Grafana: http://localhost:5001 (login: admin/admin)"
fi

echo ""
echo "🎯 Port forwarding active! PIDs: ${PF_PIDS[*]}"
echo ""

# Save PIDs to file for cleanup
echo "${PF_PIDS[@]}" > "$SCRIPT_DIR/.port_forward_pids"

echo "📸 Screenshot Capture Instructions"
echo "===================================="
echo ""
echo "Option 1: MANUAL CAPTURE (Recommended for quality)"
echo "---------------------------------------------------"
echo ""
echo "1. GraphQL Valid Citation:"
echo "   - Open: http://localhost:4001/graphql"
echo "   - Paste query from DEMO_SCRIPT.md (Part 1, Step 1)"
echo "   - Execute and screenshot the response"
echo "   - Save as: $SCREENSHOTS_DIR/graphql_valid_citation.png"
echo ""
echo "2. GraphQL Invalid Citation:"
echo "   - Same as above, use fake citation query (Part 2, Step 2)"
echo "   - Save as: $SCREENSHOTS_DIR/graphql_invalid_citation.png"
echo ""
echo "3. Grafana Dashboards:"
echo "   - Open: http://localhost:5001"
echo "   - Login: admin/admin"
echo "   - Navigate to MARCUS dashboard"
echo "   - Capture each panel:"
echo "     • Throughput graph → grafana_throughput.png"
echo "     • Latency histogram → grafana_latency.png"
echo "     • Agent performance matrix → grafana_agents.png"
echo "     • Cost dashboard → cost_dashboard.png"
echo ""
echo "4. Jaeger Tracing (OPTIONAL):"
echo "   - Open: http://34.123.164.214"
echo "   - Capture trace visualization"
echo "   - Save as: $SCREENSHOTS_DIR/jaeger_trace.png"
echo ""
echo "Option 2: AUTOMATED CAPTURE (Experimental)"
echo "-------------------------------------------"
echo ""
echo "Run the Playwright-based automated capture:"
echo "   npx tsx presentations/marcus_3.2_demo/capture_screenshots_auto.ts"
echo ""
echo "(Note: Requires Playwright to be installed and configured)"
echo ""

# Cleanup handler
cleanup() {
    echo ""
    echo "🧹 Cleaning up port forwarding..."
    if [ -f "$SCRIPT_DIR/.port_forward_pids" ]; then
        PIDS=$(cat "$SCRIPT_DIR/.port_forward_pids")
        for pid in $PIDS; do
            kill $pid 2>/dev/null || true
        done
        rm "$SCRIPT_DIR/.port_forward_pids"
        echo "✅ Port forwarding stopped"
    fi
}

trap cleanup EXIT

echo "💡 TIP: Press Ctrl+C when done capturing screenshots to stop port forwarding"
echo ""
echo "⏳ Keeping port forwarding active... (Press Ctrl+C to stop)"
echo ""

# Wait indefinitely
wait
