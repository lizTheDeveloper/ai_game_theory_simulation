#!/bin/bash
# MARCUS 3.1 Infrastructure Verification Script
# Verifies all components of the existing GCP deployment

set -e

echo "======================================"
echo "MARCUS Platform Infrastructure Check"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="project-6d921a00-c010-437c-990"
REGION="us-central1"
CLUSTER_NAME="marcus-platform"
NAMESPACE="marcus-platform"

echo "1. Verifying GCP Project..."
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ "$CURRENT_PROJECT" = "$PROJECT_ID" ]; then
    echo -e "${GREEN}✓${NC} Project: $PROJECT_ID"
else
    echo -e "${YELLOW}⚠${NC} Setting project to $PROJECT_ID"
    gcloud config set project "$PROJECT_ID"
fi
echo ""

echo "2. Verifying GKE Cluster..."
CLUSTER_STATUS=$(gcloud container clusters describe "$CLUSTER_NAME" --region="$REGION" --format="value(status)" 2>/dev/null || echo "NOT_FOUND")
if [ "$CLUSTER_STATUS" = "RUNNING" ]; then
    echo -e "${GREEN}✓${NC} Cluster: $CLUSTER_NAME (RUNNING)"
    NODE_COUNT=$(gcloud container clusters describe "$CLUSTER_NAME" --region="$REGION" --format="value(currentNodeCount)")
    echo "  Nodes: $NODE_COUNT"
else
    echo -e "${RED}✗${NC} Cluster not running: $CLUSTER_STATUS"
    exit 1
fi
echo ""

echo "3. Connecting to cluster..."
gcloud container clusters get-credentials "$CLUSTER_NAME" --region="$REGION" --quiet
echo -e "${GREEN}✓${NC} Connected"
echo ""

echo "4. Checking namespace..."
if kubectl get namespace "$NAMESPACE" &>/dev/null; then
    echo -e "${GREEN}✓${NC} Namespace: $NAMESPACE exists"
else
    echo -e "${RED}✗${NC} Namespace $NAMESPACE not found"
    exit 1
fi
echo ""

echo "5. Checking PostgreSQL..."
PG_PRIMARY=$(kubectl get statefulset postgres-primary -n "$NAMESPACE" -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
PG_REPLICAS=$(kubectl get statefulset postgres-replica -n "$NAMESPACE" -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
if [ "$PG_PRIMARY" -ge 1 ] && [ "$PG_REPLICAS" -ge 1 ]; then
    echo -e "${GREEN}✓${NC} PostgreSQL: $PG_PRIMARY primary, $PG_REPLICAS replicas"
else
    echo -e "${RED}✗${NC} PostgreSQL not ready (primary: $PG_PRIMARY, replicas: $PG_REPLICAS)"
fi

# Check database schema
echo "  Checking database schema..."
TABLE_COUNT=$(kubectl exec -n "$NAMESPACE" postgres-primary-0 -- psql -U marcus_app -d citation_integrity -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
if [ "$TABLE_COUNT" -eq 5 ]; then
    echo -e "  ${GREEN}✓${NC} Database schema: 5 tables"
else
    echo -e "  ${YELLOW}⚠${NC} Database schema: $TABLE_COUNT tables (expected 5)"
fi
echo ""

echo "6. Checking Redis Cluster..."
REDIS_READY=$(kubectl get statefulset redis -n "$NAMESPACE" -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
if [ "$REDIS_READY" -eq 6 ]; then
    echo -e "${GREEN}✓${NC} Redis Cluster: $REDIS_READY/6 nodes ready"
else
    echo -e "${YELLOW}⚠${NC} Redis Cluster: $REDIS_READY/6 nodes ready"
fi
echo ""

echo "7. Checking Citation Agents..."
AGENT_READY=$(kubectl get deployment citation-agent -n "$NAMESPACE" -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
AGENT_DESIRED=$(kubectl get deployment citation-agent -n "$NAMESPACE" -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "0")
if [ "$AGENT_READY" -eq "$AGENT_DESIRED" ] && [ "$AGENT_READY" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Citation Agents: $AGENT_READY/$AGENT_DESIRED ready"
else
    echo -e "${YELLOW}⚠${NC} Citation Agents: $AGENT_READY/$AGENT_DESIRED ready"
fi
echo ""

echo "8. Checking Orchestrator..."
ORCH_READY=$(kubectl get deployment orchestrator -n "$NAMESPACE" -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
ORCH_DESIRED=$(kubectl get deployment orchestrator -n "$NAMESPACE" -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "0")
if [ "$ORCH_READY" -eq "$ORCH_DESIRED" ] && [ "$ORCH_READY" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Orchestrator: $ORCH_READY/$ORCH_DESIRED ready"
else
    echo -e "${YELLOW}⚠${NC} Orchestrator: $ORCH_READY/$ORCH_DESIRED ready"
fi
echo ""

echo "9. Checking Persistent Storage..."
PVC_COUNT=$(kubectl get pvc -n "$NAMESPACE" --no-headers 2>/dev/null | wc -l)
PVC_BOUND=$(kubectl get pvc -n "$NAMESPACE" --no-headers 2>/dev/null | grep -c "Bound" || echo "0")
if [ "$PVC_BOUND" -eq "$PVC_COUNT" ] && [ "$PVC_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Persistent Volumes: $PVC_BOUND/$PVC_COUNT bound"
    TOTAL_STORAGE=$(kubectl get pvc -n "$NAMESPACE" -o json 2>/dev/null | jq -r '[.items[].spec.resources.requests.storage | sub("Gi";"") | tonumber] | add')
    echo "  Total Storage: ${TOTAL_STORAGE}Gi"
else
    echo -e "${YELLOW}⚠${NC} Persistent Volumes: $PVC_BOUND/$PVC_COUNT bound"
fi
echo ""

echo "10. Checking ConfigMaps & Secrets..."
if kubectl get configmap marcus-config -n "$NAMESPACE" &>/dev/null; then
    CONFIG_KEYS=$(kubectl get configmap marcus-config -n "$NAMESPACE" -o json | jq '.data | length')
    echo -e "${GREEN}✓${NC} ConfigMap: marcus-config ($CONFIG_KEYS keys)"
else
    echo -e "${RED}✗${NC} ConfigMap: marcus-config not found"
fi

if kubectl get secret marcus-secrets -n "$NAMESPACE" &>/dev/null; then
    SECRET_KEYS=$(kubectl get secret marcus-secrets -n "$NAMESPACE" -o json | jq '.data | length')
    echo -e "${GREEN}✓${NC} Secret: marcus-secrets ($SECRET_KEYS keys)"
else
    echo -e "${RED}✗${NC} Secret: marcus-secrets not found"
fi
echo ""

echo "11. Testing Orchestrator Health..."
ORCH_POD=$(kubectl get pod -n "$NAMESPACE" -l app=orchestrator -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$ORCH_POD" ]; then
    # Port-forward in background
    kubectl port-forward -n "$NAMESPACE" "$ORCH_POD" 13000:3000 &>/dev/null &
    PF_PID=$!
    sleep 2

    HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:13000/health 2>/dev/null || echo "000")
    READY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:13000/ready 2>/dev/null || echo "000")

    kill $PF_PID 2>/dev/null || true

    if [ "$HEALTH_STATUS" = "200" ] && [ "$READY_STATUS" = "200" ]; then
        echo -e "${GREEN}✓${NC} Orchestrator Health: OK (200)"
    else
        echo -e "${YELLOW}⚠${NC} Orchestrator Health: $HEALTH_STATUS (health), $READY_STATUS (ready)"
    fi
else
    echo -e "${RED}✗${NC} No orchestrator pod found"
fi
echo ""

echo "======================================"
echo "Summary"
echo "======================================"
echo ""

# Overall status
ISSUES=0

if [ "$CLUSTER_STATUS" != "RUNNING" ]; then ISSUES=$((ISSUES+1)); fi
if [ "$PG_PRIMARY" -lt 1 ] || [ "$PG_REPLICAS" -lt 1 ]; then ISSUES=$((ISSUES+1)); fi
if [ "$REDIS_READY" -ne 6 ]; then ISSUES=$((ISSUES+1)); fi
if [ "$AGENT_READY" -ne "$AGENT_DESIRED" ]; then ISSUES=$((ISSUES+1)); fi
if [ "$ORCH_READY" -ne "$ORCH_DESIRED" ]; then ISSUES=$((ISSUES+1)); fi

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ Infrastructure is HEALTHY${NC}"
    echo ""
    echo "Platform Status: READY FOR MARCUS 3.1 DEPLOYMENT"
    echo ""
    echo "Next Steps:"
    echo "  1. Review INFRASTRUCTURE_ASSESSMENT.md for details"
    echo "  2. Create .env file from .env.template"
    echo "  3. Deploy MARCUS 3.1 components"
    echo ""
    exit 0
else
    echo -e "${YELLOW}⚠ Infrastructure has $ISSUES issue(s)${NC}"
    echo ""
    echo "Please review the output above and address any issues before deploying."
    echo ""
    exit 1
fi
