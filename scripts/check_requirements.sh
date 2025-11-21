#!/bin/bash
# MARCUS 3.0 - Requirements Checker
# Purpose: Verify all system requirements are met
# Usage: ./scripts/check_requirements.sh
#        Or source in other scripts: source scripts/check_requirements.sh
#
# Returns: 0 if all requirements met, 1 otherwise
# Sets: REQUIREMENTS_MET=true/false

set -euo pipefail

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Print functions
print_check() {
    echo -ne "${BLUE}[CHECK]${NC} $1... "
}

print_pass() {
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASSED++)) || true
}

print_fail() {
    echo -e "${RED}❌ FAIL${NC} - $1"
    ((FAILED++)) || true
}

print_warn() {
    echo -e "${YELLOW}⚠️  WARN${NC} - $1"
    ((WARNINGS++)) || true
}

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Check command exists
check_command() {
    local cmd=$1
    local required=${2:-true}

    print_check "$cmd"
    if command -v "$cmd" &> /dev/null; then
        local version
        case "$cmd" in
            node) version=$(node --version) ;;
            python3) version=$(python3 --version | awk '{print $2}') ;;
            docker) version=$(docker --version | awk '{print $3}' | tr -d ',') ;;
            k6) version=$(k6 version | head -1 | awk '{print $2}') ;;
            trivy) version=$(trivy --version | head -1 | awk '{print $2}') ;;
            kubectl) version=$(kubectl version --client 2>&1 | head -1 | grep -oP 'v\d+\.\d+\.\d+' || echo "unknown") ;;
            *) version="" ;;
        esac

        if [ -n "$version" ]; then
            echo -ne "${GREEN}✅ ${version}${NC}\n"
        else
            print_pass
        fi
    else
        if [ "$required" == "true" ]; then
            print_fail "Not installed"
        else
            print_warn "Not installed (optional)"
        fi
    fi
}

# Check service running
check_service() {
    local service=$1
    local required=${2:-true}

    print_check "$service service"
    if systemctl is-active --quiet "$service"; then
        print_pass
    else
        if [ "$required" == "true" ]; then
            print_fail "Not running"
        else
            print_warn "Not running (optional)"
        fi
    fi
}

# Check Python package
check_python_package() {
    local package=$1
    local required=${2:-true}

    print_check "Python: $package"
    if python3 -c "import $package" 2>/dev/null; then
        print_pass
    else
        if [ "$required" == "true" ]; then
            print_fail "Not installed (pip3 install $package)"
        else
            print_warn "Not installed (optional)"
        fi
    fi
}

# Check environment variable
check_env_var() {
    local var=$1
    local required=${2:-true}

    print_check "ENV: $var"
    if [ -n "${!var:-}" ]; then
        echo -e "${GREEN}✅ Set${NC}"
        ((PASSED++)) || true
    else
        if [ "$required" == "true" ]; then
            print_fail "Not set"
        else
            print_warn "Not set (optional)"
        fi
    fi
}

# Check port availability
check_port() {
    local port=$1
    local service=$2

    print_check "Port $port ($service)"
    if ss -tlnp 2>/dev/null | grep -q ":$port "; then
        echo -e "${GREEN}✅ In use${NC}"
        ((PASSED++)) || true
    else
        print_warn "Not in use"
    fi
}

# Main checks
print_header "MARCUS 3.0 - System Requirements Check"

# System info
echo ""
echo -e "${BLUE}System Information:${NC}"
echo "  OS: $(lsb_release -ds 2>/dev/null || cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "  Kernel: $(uname -r)"
echo "  Architecture: $(uname -m)"
echo "  CPUs: $(nproc)"
echo "  Memory: $(free -h | awk '/^Mem:/ {print $2}')"
echo "  Disk: $(df -h / | awk 'NR==2 {print $4}') available"

# Core Commands
print_header "Core Commands"
check_command "curl"
check_command "git"
check_command "wget"
check_command "jq" false

# Runtime Environments
print_header "Runtime Environments"
check_command "node"
check_command "npm"
check_command "python3"
check_command "pip3"

# Container & Orchestration
print_header "Container & Orchestration"
check_command "docker"
if command -v docker &> /dev/null; then
    print_check "docker compose"
    if docker compose version &> /dev/null; then
        version=$(docker compose version | awk '{print $4}')
        echo -e "${GREEN}✅ ${version}${NC}"
        ((PASSED++)) || true
    else
        print_fail "Docker Compose plugin not installed"
    fi
fi
check_command "kubectl" false

# Testing & Security Tools
print_header "Testing & Security Tools"
check_command "k6"
check_command "trivy"

# Check OWASP ZAP (Docker image)
if command -v docker &> /dev/null; then
    print_check "OWASP ZAP (Docker)"
    if docker images | grep -q "owasp/zap2docker-stable"; then
        print_pass
    else
        print_warn "Not pulled (docker pull owasp/zap2docker-stable)"
    fi
fi

# Services
print_header "Services"
check_service "postgresql@14-main" true
check_service "redis-server" true
check_service "prometheus" false
check_service "grafana-server" false

# Python Packages
print_header "Python Packages"
check_python_package "numpy"
check_python_package "pandas"
check_python_package "anthropic"
check_python_package "dotenv" false
check_python_package "psycopg2" false
check_python_package "redis" false

# Environment Variables (if .env exists)
if [ -f ".env" ] || [ -f ".env.secrets" ]; then
    print_header "Environment Variables"

    # Load .env if exists
    if [ -f ".env" ]; then
        set -a
        source .env 2>/dev/null || true
        set +a
    fi

    # Load .env.secrets if exists
    if [ -f ".env.secrets" ]; then
        set -a
        source .env.secrets 2>/dev/null || true
        set +a
    fi

    check_env_var "NODE_ENV" false
    check_env_var "DATABASE_URL" true
    check_env_var "ANTHROPIC_API_KEY" false
    check_env_var "JWT_SECRET" false
    check_env_var "REDIS_PASSWORD" false
fi

# Ports (if services are running)
print_header "Service Ports"
check_port "3000" "Dashboard"
check_port "3001" "API"
check_port "5432" "PostgreSQL"
check_port "6379" "Redis"
check_port "9090" "Prometheus"
check_port "9091" "Metrics"

# NPM packages (if package.json exists)
if [ -f "package.json" ]; then
    print_header "NPM Packages"
    print_check "node_modules"
    if [ -d "node_modules" ]; then
        echo -e "${GREEN}✅ Installed ($(du -sh node_modules 2>/dev/null | awk '{print $1}'))${NC}"
        ((PASSED++)) || true
    else
        print_fail "Not installed (run: npm install)"
    fi
fi

# Summary
print_header "Summary"
echo ""
echo -e "${GREEN}Passed:${NC}   $PASSED checks"
echo -e "${RED}Failed:${NC}   $FAILED checks"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS checks"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All required checks passed!${NC}"
    echo ""
    export REQUIREMENTS_MET=true
    exit 0
else
    echo -e "${RED}❌ $FAILED required checks failed.${NC}"
    echo ""
    echo "Fix missing requirements:"
    echo "  1. Install missing tools: ./scripts/provision_marcus_vm.sh"
    echo "  2. Start services: sudo systemctl start <service>"
    echo "  3. Install Python packages: pip3 install -r requirements.txt"
    echo "  4. Install NPM packages: npm install"
    echo "  5. Set environment variables: cp .env.template .env && nano .env"
    echo ""
    echo "See REQUIREMENTS.md for detailed installation instructions."
    echo ""
    export REQUIREMENTS_MET=false
    exit 1
fi
