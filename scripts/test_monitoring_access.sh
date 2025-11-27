#!/bin/bash
#
# MARCUS 3.0 - Monitoring Access Test
# Quick verification that monitoring stack is accessible
#
# Usage:
#   ./scripts/test_monitoring_access.sh

set -euo pipefail

echo "🔍 MARCUS Monitoring Access Test"
echo "================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass() { echo -e "${GREEN}✅ PASS${NC}: $1"; }
fail() { echo -e "${RED}❌ FAIL${NC}: $1"; }
warn() { echo -e "${YELLOW}⚠️ WARN${NC}: $1"; }
info() { echo -e "ℹ️  INFO: $1"; }

# ============================================================================
# Test 1: Service Status
# ============================================================================

echo "Test 1: Service Status"
echo "----------------------"

if systemctl is-active --quiet prometheus 2>/dev/null; then
    pass "Prometheus running"
else
    fail "Prometheus not running"
fi

if systemctl is-active --quiet grafana-server 2>/dev/null; then
    pass "Grafana running"
else
    fail "Grafana not running"
fi

if systemctl is-active --quiet prometheus-node-exporter 2>/dev/null; then
    pass "Node Exporter running"
else
    fail "Node Exporter not running"
fi

if systemctl is-active --quiet prometheus-postgres-exporter 2>/dev/null; then
    pass "PostgreSQL Exporter running"
else
    warn "PostgreSQL Exporter not running (may need configuration)"
fi

if systemctl is-active --quiet redis-exporter 2>/dev/null; then
    pass "Redis Exporter running"
else
    warn "Redis Exporter not running (may need configuration)"
fi

echo ""

# ============================================================================
# Test 2: Port Accessibility
# ============================================================================

echo "Test 2: Port Accessibility"
echo "--------------------------"

if curl -s http://localhost:9090/-/healthy > /dev/null 2>&1; then
    pass "Prometheus API accessible (port 9090)"
else
    fail "Prometheus API not accessible"
fi

if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    pass "Grafana API accessible (port 3000)"
else
    fail "Grafana API not accessible"
fi

if curl -s http://localhost:9100/metrics > /dev/null 2>&1; then
    pass "Node Exporter accessible (port 9100)"
else
    fail "Node Exporter not accessible"
fi

echo ""

# ============================================================================
# Test 3: Prometheus Targets
# ============================================================================

echo "Test 3: Prometheus Targets"
echo "---------------------------"

TARGETS=$(curl -s http://localhost:9090/api/v1/targets 2>/dev/null || echo "{}")

if echo "$TARGETS" | grep -q "\"health\":\"up\""; then
    UP_COUNT=$(echo "$TARGETS" | grep -o "\"health\":\"up\"" | wc -l)
    pass "Prometheus has $UP_COUNT healthy targets"
else
    warn "No healthy Prometheus targets found"
fi

echo ""

# ============================================================================
# Test 4: Grafana Dashboards
# ============================================================================

echo "Test 4: Grafana Dashboards"
echo "--------------------------"

if [ -d "/var/lib/grafana/dashboards" ]; then
    DASHBOARD_COUNT=$(ls -1 /var/lib/grafana/dashboards/*.json 2>/dev/null | wc -l)
    if [ "$DASHBOARD_COUNT" -eq 5 ]; then
        pass "All 5 dashboards present in /var/lib/grafana/dashboards/"
    else
        warn "Expected 5 dashboards, found $DASHBOARD_COUNT"
    fi
else
    warn "Dashboard directory not found"
fi

echo ""

# ============================================================================
# Test 5: Metrics Collection
# ============================================================================

echo "Test 5: Metrics Collection"
echo "--------------------------"

# Check if Prometheus is collecting metrics
METRIC_COUNT=$(curl -s "http://localhost:9090/api/v1/label/__name__/values" 2>/dev/null | grep -o "\"[^\"]*\"" | wc -l)

if [ "$METRIC_COUNT" -gt 100 ]; then
    pass "Prometheus collecting metrics ($METRIC_COUNT unique metrics)"
else
    warn "Low metric count: $METRIC_COUNT (may need time to collect)"
fi

echo ""

# ============================================================================
# Summary & Next Steps
# ============================================================================

echo "📊 Summary"
echo "=========="
echo ""
info "To view dashboards from your local machine, use SSH port forwarding:"
echo ""
echo "  ssh -L 3000:localhost:3000 -L 9090:localhost:9090 g7throwawayplz@<VM_IP>"
echo ""
info "Then open in your browser:"
echo "  - Grafana:    http://localhost:3000 (admin/admin)"
echo "  - Prometheus: http://localhost:9090"
echo ""
info "Grafana setup:"
echo "  1. Login with admin/admin"
echo "  2. Add Prometheus data source (http://localhost:9090)"
echo "  3. View dashboards: Dashboards → Browse"
echo ""
