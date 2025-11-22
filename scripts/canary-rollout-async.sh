#!/bin/bash
#
# MARCUS 3.1 Async Agent Canary Rollout Script
#
# Gradual rollout of async agents with validation at each stage.
# Rollout stages: 0% → 10% → 25% → 50% → 75% → 100%
#
# Safety features:
# - Automated rollback if metrics degrade
# - Manual approval gates at 25% and 75%
# - Throughput and latency validation
# - Error rate monitoring
#
# Usage:
#   ./scripts/canary-rollout-async.sh [stage]
#
# Stages: 0, 10, 25, 50, 75, 100, rollback
#
# Author: Marcus (Platform Engineer)
# Date: 2025-11-22

set -euo pipefail

# Configuration
NAMESPACE="marcus-platform"
DEPLOYMENT="citation-worker-v31"
CONFIGMAP="marcus-async-config"
PROMETHEUS_URL="${PROMETHEUS_URL:-http://prometheus.marcus-platform.svc.cluster.local:9090}"

# Rollout stages
declare -A STAGES=(
    [0]=0
    [10]=10
    [25]=25
    [50]=50
    [75]=75
    [100]=100
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  INFO:${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅ SUCCESS:${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠️  WARNING:${NC} $1"
}

log_error() {
    echo -e "${RED}❌ ERROR:${NC} $1"
}

# Get current rollout percentage
get_current_rollout() {
    kubectl get configmap $CONFIGMAP -n $NAMESPACE \
        -o jsonpath='{.data.ASYNC_AGENT_ROLLOUT_PERCENT}' 2>/dev/null || echo "0"
}

# Update rollout percentage
update_rollout() {
    local percent=$1
    log_info "Updating ASYNC_AGENT_ROLLOUT_PERCENT to ${percent}%"

    kubectl patch configmap $CONFIGMAP -n $NAMESPACE \
        --type merge \
        -p "{\"data\":{\"ASYNC_AGENT_ROLLOUT_PERCENT\":\"$percent\"}}"

    log_success "ConfigMap updated"
}

# Restart workers to pick up new config
restart_workers() {
    log_info "Restarting workers to apply new configuration"

    kubectl rollout restart deployment/$DEPLOYMENT -n $NAMESPACE
    kubectl rollout status deployment/$DEPLOYMENT -n $NAMESPACE --timeout=5m

    log_success "Workers restarted"
}

# Wait for workers to stabilize
wait_for_stabilization() {
    local wait_time=${1:-120}
    log_info "Waiting ${wait_time}s for metrics to stabilize"

    for i in $(seq $wait_time -10 0); do
        echo -ne "⏳ ${i}s remaining...\r"
        sleep 10
    done
    echo ""

    log_success "Stabilization complete"
}

# Query Prometheus for metrics
query_prometheus() {
    local query=$1
    curl -s -G "${PROMETHEUS_URL}/api/v1/query" \
        --data-urlencode "query=$query" \
        | jq -r '.data.result[0].value[1] // "0"'
}

# Get current throughput (citations/sec)
get_throughput() {
    local query='rate(citation_tasks_processed_total{status="success"}[5m])'
    query_prometheus "$query"
}

# Get average latency (milliseconds)
get_latency_p95() {
    local query='histogram_quantile(0.95, rate(citation_task_duration_seconds_bucket[5m])) * 1000'
    query_prometheus "$query"
}

# Get error rate (%)
get_error_rate() {
    local query='rate(citation_tasks_processed_total{status="error"}[5m]) / rate(citation_tasks_processed_total[5m]) * 100'
    query_prometheus "$query"
}

# Get async agent percentage from metrics
get_async_agent_percentage() {
    local query='avg(citation_agent_mode)'  # 0=sync, 1=async
    local result=$(query_prometheus "$query")
    echo "$(echo "$result * 100" | bc -l | xargs printf "%.0f")"
}

# Validate metrics against baseline
validate_metrics() {
    local baseline_throughput=$1
    local baseline_latency=$2

    log_info "Validating metrics against baseline"

    # Get current metrics
    local current_throughput=$(get_throughput)
    local current_latency=$(get_latency_p95)
    local error_rate=$(get_error_rate)
    local async_percent=$(get_async_agent_percentage)

    log_info "Current metrics:"
    echo "  Throughput: ${current_throughput} citations/sec (baseline: ${baseline_throughput})"
    echo "  Latency p95: ${current_latency} ms (baseline: ${baseline_latency})"
    echo "  Error rate: ${error_rate}%"
    echo "  Async agents: ${async_percent}%"

    # Validation thresholds
    local min_throughput=$(echo "$baseline_throughput * 0.8" | bc -l)  # Allow 20% degradation
    local max_latency=$(echo "$baseline_latency * 1.5" | bc -l)        # Allow 50% increase
    local max_error_rate=5.0

    # Check thresholds
    local valid=true

    if (( $(echo "$current_throughput < $min_throughput" | bc -l) )); then
        log_error "Throughput degraded below acceptable threshold"
        valid=false
    fi

    if (( $(echo "$current_latency > $max_latency" | bc -l) )); then
        log_error "Latency increased beyond acceptable threshold"
        valid=false
    fi

    if (( $(echo "$error_rate > $max_error_rate" | bc -l) )); then
        log_error "Error rate too high"
        valid=false
    fi

    if $valid; then
        log_success "All metrics within acceptable range"
        return 0
    else
        log_error "Metrics validation failed"
        return 1
    fi
}

# Measure baseline performance
measure_baseline() {
    log_info "Measuring baseline performance (0% async)"

    # Ensure we're at 0%
    update_rollout 0
    restart_workers
    wait_for_stabilization 120

    # Measure
    local throughput=$(get_throughput)
    local latency=$(get_latency_p95)

    log_success "Baseline measured:"
    echo "  Throughput: ${throughput} citations/sec"
    echo "  Latency p95: ${latency} ms"

    # Store baseline
    echo "$throughput" > /tmp/marcus_baseline_throughput
    echo "$latency" > /tmp/marcus_baseline_latency
}

# Rollback to previous stage
rollback() {
    log_warning "Initiating rollback to 0% async"

    update_rollout 0
    restart_workers
    wait_for_stabilization 120

    log_success "Rollback complete - all agents using sync mode"
}

# Request manual approval
request_approval() {
    local stage=$1

    echo ""
    log_warning "Manual approval required for ${stage}% rollout"
    echo "Review metrics in Grafana before proceeding."
    echo ""
    read -p "Continue to ${stage}%? (yes/no): " response

    if [[ "$response" != "yes" ]]; then
        log_error "Rollout cancelled by operator"
        exit 1
    fi

    log_success "Approval granted"
}

# Execute canary rollout to specific stage
rollout_to_stage() {
    local target_stage=$1

    log_info "=== MARCUS 3.1 Async Agent Canary Rollout ==="
    log_info "Target stage: ${target_stage}%"

    # Load baseline if exists
    if [[ -f /tmp/marcus_baseline_throughput ]]; then
        baseline_throughput=$(cat /tmp/marcus_baseline_throughput)
        baseline_latency=$(cat /tmp/marcus_baseline_latency)
        log_info "Using existing baseline: ${baseline_throughput} cit/s, ${baseline_latency}ms"
    else
        log_warning "No baseline found - measuring now"
        measure_baseline
        baseline_throughput=$(cat /tmp/marcus_baseline_throughput)
        baseline_latency=$(cat /tmp/marcus_baseline_latency)
    fi

    # Manual approval gates
    if [[ $target_stage -ge 25 ]] && [[ $target_stage -lt 50 ]]; then
        request_approval $target_stage
    elif [[ $target_stage -ge 75 ]]; then
        request_approval $target_stage
    fi

    # Update rollout percentage
    update_rollout $target_stage

    # Restart workers
    restart_workers

    # Wait for stabilization
    wait_for_stabilization 180

    # Validate metrics
    if validate_metrics $baseline_throughput $baseline_latency; then
        log_success "Stage ${target_stage}% rollout successful"

        # If we achieved target, check actual improvement
        if [[ $target_stage -eq 100 ]]; then
            local final_throughput=$(get_throughput)
            local improvement=$(echo "scale=2; ($final_throughput / $baseline_throughput - 1) * 100" | bc)
            log_success "🎉 Full rollout complete!"
            log_success "Throughput improvement: ${improvement}% (target: 100-200%)"
        fi
    else
        log_error "Stage ${target_stage}% failed validation"
        log_warning "Initiating automatic rollback"
        rollback
        exit 1
    fi
}

# Main execution
main() {
    local stage=${1:-}

    # Check prerequisites
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl not found - install kubectl first"
        exit 1
    fi

    if ! command -v jq &> /dev/null; then
        log_error "jq not found - install jq first"
        exit 1
    fi

    # Validate stage
    if [[ -z "$stage" ]]; then
        log_error "Usage: $0 [stage]"
        echo "Stages: 0, 10, 25, 50, 75, 100, rollback, measure, auto"
        exit 1
    fi

    # Special commands
    case $stage in
        rollback)
            rollback
            exit 0
            ;;
        measure)
            measure_baseline
            exit 0
            ;;
        auto)
            # Fully automated rollout with validation
            log_info "Starting fully automated canary rollout"
            for s in 0 10 25 50 75 100; do
                rollout_to_stage $s
                if [[ $s -lt 100 ]]; then
                    log_info "Stage $s complete - proceeding to next stage in 60s"
                    sleep 60
                fi
            done
            log_success "Automated rollout complete!"
            exit 0
            ;;
    esac

    # Validate stage is numeric
    if ! [[ "$stage" =~ ^[0-9]+$ ]]; then
        log_error "Stage must be a number: 0, 10, 25, 50, 75, or 100"
        exit 1
    fi

    # Execute rollout
    rollout_to_stage $stage
}

# Run main
main "$@"
