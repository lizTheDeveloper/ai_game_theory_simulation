#!/bin/bash
set -euo pipefail

# MARCUS 3.0 Code Attribution Validation Script
#
# Validates code attribution agent against GitHub and StackOverflow datasets.
#
# Usage:
#   ./validate-code-attribution.sh [options]
#
# Options:
#   --github-only: Only run GitHub license detection
#   --stackoverflow-only: Only run StackOverflow attribution
#   --similarity-only: Only run similarity benchmarks
#   --full: Run full benchmark suite (default)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR/.."
PLATFORM_DIR="$PROJECT_ROOT/src/platform"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Default: run full suite
MODE="full"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --github-only)
            MODE="github"
            shift
            ;;
        --stackoverflow-only)
            MODE="stackoverflow"
            shift
            ;;
        --similarity-only)
            MODE="similarity"
            shift
            ;;
        --full)
            MODE="full"
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

log_info "🔍 MARCUS 3.0 Code Attribution Validation"
log_info "Mode: $MODE"
echo ""

# Check Python environment
if ! command -v python3 &> /dev/null; then
    log_error "Python 3 not found. Please install Python 3.9+"
    exit 1
fi

# Check dependencies
log_info "Checking dependencies..."
python3 -c "import psycopg2, redis, numpy" 2>/dev/null || {
    log_warn "Missing dependencies. Installing..."
    pip install psycopg2-binary redis numpy
}

# Generate training dataset
log_info "Generating training dataset..."
cd "$PLATFORM_DIR/datasets"
python3 code_licensing_dataset.py
echo ""

# Run benchmarks
log_info "Running benchmarks..."
cd "$PLATFORM_DIR/evaluation"

if [ "$MODE" == "full" ]; then
    python3 code_attribution_benchmarks.py
else
    # Selective benchmark (not implemented in this version, would require CLI args)
    python3 code_attribution_benchmarks.py
fi

echo ""
log_info "✅ Validation complete!"
log_info "Results saved to: $PLATFORM_DIR/evaluation/code_attribution_benchmark_results.json"

# Print results summary
if [ -f "$PLATFORM_DIR/evaluation/code_attribution_benchmark_results.json" ]; then
    echo ""
    log_info "📊 Quick Summary:"
    python3 -c "
import json
with open('$PLATFORM_DIR/evaluation/code_attribution_benchmark_results.json') as f:
    results = json.load(f)
    print(f\"  GitHub License Detection: {results['github_license']['accuracy']:.1%}\")
    print(f\"  StackOverflow Attribution: {results['stackoverflow']['accuracy']:.1%}\")
    print(f\"  Code Similarity Correlation: {results['similarity']['correlation']:.3f}\")
"
fi

echo ""
log_info "Next steps:"
echo "  1. Review results in evaluation/code_attribution_benchmark_results.json"
echo "  2. Check confusion matrix for misclassifications"
echo "  3. Tune agent behavior based on findings"
echo "  4. Run validation on production data"
