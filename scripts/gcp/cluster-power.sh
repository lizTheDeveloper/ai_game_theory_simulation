#!/bin/bash
set -e

PROJECT_ID="project-6d921a00-c010-437c-990"
CLUSTER_NAME="marcus-platform"
REGION="us-central1"
NAMESPACE="marcus-platform"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function print_usage() {
    echo "════════════════════════════════════════════════════════════════"
    echo "   GKE Cluster Power Management"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "Usage: $0 [on|off|sleep|status]"
    echo ""
    echo "Commands:"
    echo "  on      - Full power mode (normal operations)"
    echo "  off     - Hibernate mode (scale to minimum, disable logging)"
    echo "  sleep   - Sleep mode (scale to zero where possible)"
    echo "  status  - Show current cluster status"
    echo ""
    echo "Examples:"
    echo "  $0 off     # Minimize costs when not using cluster"
    echo "  $0 on      # Resume normal operations"
    echo "  $0 status  # Check current state"
    echo ""
}

function cluster_status() {
    echo -e "${YELLOW}Checking cluster status...${NC}"
    echo ""

    # Check deployments
    echo "📊 Deployment Status:"
    kubectl get deployments -n $NAMESPACE -o custom-columns=NAME:.metadata.name,REPLICAS:.spec.replicas,AVAILABLE:.status.availableReplicas
    echo ""

    # Check nodes
    echo "🖥️ Node Pool Status:"
    gcloud container clusters describe $CLUSTER_NAME --zone $REGION --format="value(currentNodeCount)" 2>/dev/null || echo "Unable to get node count"
    echo ""

    # Check logging status
    echo "📝 Logging Status:"
    gcloud container clusters describe $CLUSTER_NAME --zone $REGION --format="value(loggingConfig.componentConfig.enableComponents[])" 2>/dev/null || echo "Unable to get logging status"
    echo ""

    # Show current costs estimate
    echo "💰 Estimated Daily Cost:"
    NODES=$(gcloud container clusters describe $CLUSTER_NAME --zone $REGION --format="value(currentNodeCount)" 2>/dev/null || echo "3")
    PODS=$(kubectl get pods -n $NAMESPACE --no-headers | wc -l)
    echo "  - Nodes: $NODES × ~\$1.50/day = ~\$$(echo "$NODES * 1.5" | bc -l | cut -d. -f1-2)/day"
    echo "  - Active Pods: $PODS"
    echo ""
}

function cluster_off() {
    echo -e "${YELLOW}🔌 Powering OFF cluster (hibernate mode)...${NC}"
    echo ""

    # 1. Scale down all non-essential deployments
    echo "1️⃣ Scaling down deployments to zero..."
    kubectl scale deployment orchestrator --replicas=0 -n $NAMESPACE
    kubectl scale deployment jaeger --replicas=0 -n $NAMESPACE
    kubectl scale deployment prometheus --replicas=0 -n $NAMESPACE
    kubectl scale deployment prometheus-adapter --replicas=0 -n $NAMESPACE
    kubectl scale deployment redis-queue-exporter --replicas=0 -n $NAMESPACE
    echo "   ✅ Deployments scaled to zero"
    echo ""

    # 2. Disable logging completely
    echo "2️⃣ Disabling all logging..."
    gcloud container clusters update $CLUSTER_NAME \
        --logging=NONE \
        --zone $REGION \
        --quiet
    echo "   ✅ Logging disabled"
    echo ""

    # 3. Scale node pool to minimum (1 node)
    echo "3️⃣ Scaling node pool to minimum..."
    gcloud container node-pools update default-pool \
        --cluster=$CLUSTER_NAME \
        --zone=$REGION \
        --enable-autoscaling \
        --min-nodes=1 \
        --max-nodes=1 \
        --quiet
    echo "   ✅ Node pool scaled to 1 node"
    echo ""

    # 4. Create a marker ConfigMap to track state
    kubectl create configmap cluster-power-state \
        --from-literal=state=off \
        --from-literal=timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        -n $NAMESPACE \
        --dry-run=client -o yaml | kubectl apply -f -

    echo -e "${GREEN}✅ Cluster is now in HIBERNATE mode${NC}"
    echo ""
    echo "💰 Cost Savings:"
    echo "  - Compute: ~90% reduction (1 node instead of 3)"
    echo "  - Logging: 100% reduction (disabled)"
    echo "  - Estimated: ~\$1.50/day instead of ~\$35/day"
    echo ""
    echo "⚠️  Note: Databases (PostgreSQL, Redis) remain running for data persistence"
}

function cluster_on() {
    echo -e "${YELLOW}⚡ Powering ON cluster (normal mode)...${NC}"
    echo ""

    # 1. Scale node pool back to normal
    echo "1️⃣ Scaling node pool to normal..."
    gcloud container node-pools update default-pool \
        --cluster=$CLUSTER_NAME \
        --zone=$REGION \
        --enable-autoscaling \
        --min-nodes=2 \
        --max-nodes=10 \
        --quiet
    echo "   ✅ Node pool autoscaling restored (2-10 nodes)"
    echo ""

    # 2. Re-enable logging (system only, not workloads)
    echo "2️⃣ Re-enabling system logging..."
    gcloud container clusters update $CLUSTER_NAME \
        --logging=SYSTEM \
        --zone $REGION \
        --quiet
    echo "   ✅ System logging enabled (workload logging still off for cost)"
    echo ""

    # 3. Scale deployments back up
    echo "3️⃣ Scaling up essential services..."
    kubectl scale deployment orchestrator --replicas=2 -n $NAMESPACE
    kubectl scale deployment prometheus --replicas=1 -n $NAMESPACE
    kubectl scale deployment prometheus-adapter --replicas=1 -n $NAMESPACE
    kubectl scale deployment jaeger --replicas=1 -n $NAMESPACE
    kubectl scale deployment redis-queue-exporter --replicas=1 -n $NAMESPACE
    echo "   ✅ Services scaled up"
    echo ""

    # 4. Update state marker
    kubectl create configmap cluster-power-state \
        --from-literal=state=on \
        --from-literal=timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        -n $NAMESPACE \
        --dry-run=client -o yaml | kubectl apply -f -

    # 5. Apply KEDA autoscaling
    echo "4️⃣ Configuring autoscaling..."
    if [ -f "/home/g7throwawayplz/ai_game_theory_simulation/k8s/marcus-platform/orchestrator-scale-to-zero.yaml" ]; then
        kubectl apply -f /home/g7throwawayplz/ai_game_theory_simulation/k8s/marcus-platform/orchestrator-scale-to-zero.yaml 2>/dev/null || true
    fi
    echo "   ✅ Autoscaling configured"
    echo ""

    echo -e "${GREEN}✅ Cluster is now in NORMAL mode${NC}"
    echo ""
    echo "📊 Services will auto-scale based on traffic"
}

function cluster_sleep() {
    echo -e "${YELLOW}😴 Setting cluster to SLEEP mode...${NC}"
    echo ""

    # Like OFF but keeps minimal logging for debugging
    echo "1️⃣ Scaling deployments to minimum..."
    kubectl scale deployment orchestrator --replicas=0 -n $NAMESPACE
    kubectl scale deployment jaeger --replicas=0 -n $NAMESPACE
    kubectl scale deployment prometheus --replicas=1 -n $NAMESPACE  # Keep 1 for monitoring
    kubectl scale deployment prometheus-adapter --replicas=0 -n $NAMESPACE
    kubectl scale deployment redis-queue-exporter --replicas=0 -n $NAMESPACE
    echo "   ✅ Deployments minimized"
    echo ""

    # Keep system logging but not workload logging
    echo "2️⃣ Reducing logging to system only..."
    gcloud container clusters update $CLUSTER_NAME \
        --logging=SYSTEM \
        --zone $REGION \
        --quiet
    echo "   ✅ Workload logging disabled"
    echo ""

    # Scale nodes but not as aggressive as OFF
    echo "3️⃣ Scaling node pool..."
    gcloud container node-pools update default-pool \
        --cluster=$CLUSTER_NAME \
        --zone=$REGION \
        --enable-autoscaling \
        --min-nodes=1 \
        --max-nodes=3 \
        --quiet
    echo "   ✅ Node pool set to 1-3 nodes"
    echo ""

    kubectl create configmap cluster-power-state \
        --from-literal=state=sleep \
        --from-literal=timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        -n $NAMESPACE \
        --dry-run=client -o yaml | kubectl apply -f -

    echo -e "${GREEN}✅ Cluster is now in SLEEP mode${NC}"
    echo "  - Minimal resources running"
    echo "  - Can wake up quickly when needed"
}

# Main script logic
case "$1" in
    on)
        cluster_on
        ;;
    off)
        cluster_off
        ;;
    sleep)
        cluster_sleep
        ;;
    status)
        cluster_status
        ;;
    *)
        print_usage
        exit 1
        ;;
esac