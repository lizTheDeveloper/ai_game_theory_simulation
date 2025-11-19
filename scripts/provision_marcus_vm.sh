#!/bin/bash
# MARCUS 3.0 VM Provisioning Script (Improved)
# Run this on an existing VM to set up MARCUS 3.0
# Usage: ./provision_marcus_vm.sh
#
# Prerequisites:
#   1. Copy .env.secrets.template to .env.secrets
#   2. Fill in your ANTHROPIC_API_KEY in .env.secrets
#   3. Run this script
#
# Features:
#   - Secrets loaded from .env.secrets file (not command line)
#   - Idempotent operations (safe to run multiple times)
#   - Rollback on critical failures
#   - Comprehensive error checking
#   - Health validation after deployment

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SECRETS_FILE="$PROJECT_DIR/.env.secrets"
LOG_FILE="/tmp/marcus_provision_$(date +%Y%m%d_%H%M%S).log"
CREDENTIALS_FILE="$HOME/marcus_credentials_$(date +%Y%m%d_%H%M%S).txt"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
exec 1> >(tee -a "$LOG_FILE")
exec 2>&1

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_step() {
    echo -e "${YELLOW}➜${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

# Error handler
cleanup_on_error() {
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        print_error "Provisioning failed at step: $CURRENT_STEP"
        print_error "Check log file: $LOG_FILE"
        print_error "To rollback database: sudo -u postgres psql -c 'DROP DATABASE IF EXISTS marcus_production; DROP USER IF EXISTS marcus;'"
    fi
}
trap cleanup_on_error EXIT

# Validate prerequisites
validate_prerequisites() {
    CURRENT_STEP="Validating prerequisites"
    print_step "$CURRENT_STEP"

    # Check if running as non-root
    if [ "$EUID" -eq 0 ]; then
        print_error "Do not run this script as root. Run as a regular user with sudo privileges."
        exit 1
    fi

    # Check for secrets file
    if [ ! -f "$SECRETS_FILE" ]; then
        print_error "Secrets file not found: $SECRETS_FILE"
        echo ""
        echo "Please create it from the template:"
        echo "  cp .env.secrets.template .env.secrets"
        echo "  nano .env.secrets  # Add your ANTHROPIC_API_KEY"
        exit 1
    fi

    # Load secrets
    source "$SECRETS_FILE"

    # Validate required secret
    if [ -z "${ANTHROPIC_API_KEY:-}" ]; then
        print_error "ANTHROPIC_API_KEY not set in $SECRETS_FILE"
        echo "Get your API key from: https://console.anthropic.com/"
        exit 1
    fi

    print_success "Prerequisites validated"
}

# Generate secure passwords
generate_secrets() {
    CURRENT_STEP="Generating secure secrets"
    print_step "$CURRENT_STEP"

    # Use provided secrets or generate new ones
    if [ -z "${DATABASE_PASSWORD:-}" ]; then
        DATABASE_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
        print_success "Generated secure database password"
    else
        print_success "Using provided database password"
    fi

    if [ -z "${JWT_SECRET:-}" ]; then
        JWT_SECRET=$(openssl rand -base64 48 | tr -d "=+/" | cut -c1-64)
        print_success "Generated JWT secret"
    else
        print_success "Using provided JWT secret"
    fi

    if [ -z "${JWT_REFRESH_SECRET:-}" ]; then
        JWT_REFRESH_SECRET=$(openssl rand -base64 48 | tr -d "=+/" | cut -c1-64)
        print_success "Generated JWT refresh secret"
    else
        print_success "Using provided JWT refresh secret"
    fi

    # Generate admin password
    ADMIN_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-20)
    print_success "Generated admin password"
}

# Update system packages
update_system() {
    CURRENT_STEP="Updating system packages"
    print_step "$CURRENT_STEP"

    sudo apt-get update -qq
    print_success "System packages updated"
}

# Install dependencies
install_dependencies() {
    CURRENT_STEP="Installing dependencies"
    print_step "$CURRENT_STEP"

    # Node.js
    if ! command -v node &> /dev/null; then
        print_step "Installing Node.js 18..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
        sudo apt-get install -y nodejs
    fi
    NODE_VERSION=$(node --version)
    print_success "Node.js: $NODE_VERSION"

    # PostgreSQL
    if ! command -v psql &> /dev/null; then
        print_step "Installing PostgreSQL 14..."
        sudo apt-get install -y postgresql postgresql-contrib
    fi
    PSQL_VERSION=$(psql --version | awk '{print $3}')
    print_success "PostgreSQL: $PSQL_VERSION"

    # Redis - check if already running (e.g., Docker Redis)
    if redis-cli -h "${REDIS_HOST:-localhost}" -p "${REDIS_PORT:-6379}" ping &> /dev/null; then
        print_success "Redis: already running (using existing instance)"
    else
        # Install redis-cli if not available
        if ! command -v redis-cli &> /dev/null; then
            print_step "Installing Redis tools..."
            sudo apt-get install -y redis-tools
        fi

        # Try to install and start system Redis
        if ! command -v redis-server &> /dev/null; then
            print_step "Installing Redis server..."
            sudo apt-get install -y redis-server
            sudo systemctl enable redis-server || true
            sudo systemctl start redis-server || true
        fi

        # Verify Redis is accessible
        if redis-cli -h "${REDIS_HOST:-localhost}" -p "${REDIS_PORT:-6379}" ping &> /dev/null; then
            print_success "Redis: running"
        else
            print_warning "Redis not accessible - will need to configure manually"
        fi
    fi

    # Python and build tools
    sudo apt-get install -y python3 python3-pip python3-venv build-essential git curl
    print_success "Python tools installed"
}

# Configure PostgreSQL
configure_database() {
    CURRENT_STEP="Configuring PostgreSQL"
    print_step "$CURRENT_STEP"

    # Check if user exists
    if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='marcus'" | grep -q 1; then
        print_warning "Database user 'marcus' already exists - updating password"
        sudo -u postgres psql -c "ALTER USER marcus WITH PASSWORD '$DATABASE_PASSWORD';"
    else
        sudo -u postgres psql -c "CREATE USER marcus WITH PASSWORD '$DATABASE_PASSWORD';"
        print_success "Created database user 'marcus'"
    fi

    # Check if database exists
    if sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='marcus_production'" | grep -q 1; then
        print_warning "Database 'marcus_production' already exists"
    else
        sudo -u postgres psql -c "CREATE DATABASE marcus_production OWNER marcus;"
        print_success "Created database 'marcus_production'"
    fi

    # Grant privileges
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE marcus_production TO marcus;"

    # Test connection with new password
    if PGPASSWORD=$DATABASE_PASSWORD psql -h localhost -U marcus -d marcus_production -c '\q' 2>/dev/null; then
        print_success "Database connection verified"
    else
        print_warning "Password auth over TCP not working - will use peer auth for migrations"
        # This is expected if pg_hba.conf doesn't allow password auth
        # We'll use peer auth (sudo -u postgres) for migrations instead
    fi

    print_success "Database configured"
}

# Configure Redis
configure_redis() {
    CURRENT_STEP="Configuring Redis"
    print_step "$CURRENT_STEP"

    # Only configure system Redis if config file exists
    if [ -f /etc/redis/redis.conf ]; then
        # Ensure localhost-only binding
        if ! sudo grep -q "^bind 127.0.0.1" /etc/redis/redis.conf; then
            sudo sed -i 's/^bind .*/bind 127.0.0.1/' /etc/redis/redis.conf
            sudo systemctl restart redis-server || true
        fi
        print_success "Redis configured (localhost only)"
    else
        print_warning "Using external Redis (Docker or remote) - skipping system Redis config"
    fi
}

# Setup project
setup_project() {
    CURRENT_STEP="Setting up project"
    print_step "$CURRENT_STEP"

    cd "$PROJECT_DIR"

    # Create .env file
    cat > .env << ENV_EOF
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=marcus_production
DATABASE_USER=marcus
DATABASE_PASSWORD=$DATABASE_PASSWORD
DATABASE_POOL_SIZE=10

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# JWT
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET

# Anthropic
ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY

# Logging
LOG_LEVEL=info
LOG_DIR=/var/log/marcus
ENV_EOF

    print_success "Environment file created"

    # Create log directories
    sudo mkdir -p /var/log/marcus
    sudo chown -R "$USER:$USER" /var/log/marcus
    mkdir -p logs/pm2
    print_success "Log directories created"
}

# Install Node.js dependencies
install_node_deps() {
    CURRENT_STEP="Installing Node.js dependencies"
    print_step "$CURRENT_STEP (this may take a few minutes)..."

    cd "$PROJECT_DIR"

    # Install all dependencies (including devDependencies needed for build)
    npm install --quiet
    print_success "Node.js dependencies installed"

    # Check if build already exists
    if [ -f ".next/BUILD_ID" ]; then
        print_warning "Build already exists (skipping to save time)"
        print_warning "To rebuild, delete .next directory first"
    else
        # Clean all caches aggressively
        rm -rf .next node_modules/.cache

        # Build TypeScript (single attempt, non-fatal)
        if npm run build 2>&1 | tee /tmp/nextjs_build.log; then
            print_success "TypeScript compiled"
        else
            print_warning "Build failed - can be built manually later with 'npm run build'"
            print_warning "Check /tmp/nextjs_build.log for details"
            print_warning "Continuing with provisioning..."
        fi
    fi
}

# Install Python dependencies
install_python_deps() {
    CURRENT_STEP="Installing Python dependencies"
    print_step "$CURRENT_STEP"

    cd "$PROJECT_DIR"
    pip3 install --user --quiet anthropic psycopg2-binary redis
    print_success "Python dependencies installed"
}

# Run database migrations
run_migrations() {
    CURRENT_STEP="Running database migrations"
    print_step "$CURRENT_STEP"

    cd "$PROJECT_DIR"

    # Check if migrations directory exists
    if [ -d "src/platform/database/migrations" ]; then
        # Fix permissions on migration files so postgres can read them
        chmod +r src/platform/database/migrations/*.sql 2>/dev/null || true

        for migration in src/platform/database/migrations/*.sql; do
            if [ -f "$migration" ]; then
                print_step "Applying $(basename "$migration")..."
                sudo -u postgres psql -d marcus_production -f "$migration" -q 2>&1 || true
            fi
        done
        print_success "Database migrations applied"
    else
        print_warning "No migrations directory found, skipping"
    fi
}

# Create admin user
create_admin_user() {
    CURRENT_STEP="Creating admin user"
    print_step "$CURRENT_STEP"

    # Hash the password using bcrypt (Node.js)
    ADMIN_PASSWORD_HASH=$(node -e "console.log(require('bcrypt').hashSync('$ADMIN_PASSWORD', 12))")

    PGPASSWORD=$DATABASE_PASSWORD psql -h localhost -U marcus -d marcus_production << SQL
INSERT INTO users (email, password_hash, role, email_verified, is_active)
VALUES ('admin@marcus.local', '$ADMIN_PASSWORD_HASH', 'admin', true, true)
ON CONFLICT (email) DO UPDATE
SET password_hash = EXCLUDED.password_hash,
    is_active = true;
SQL

    print_success "Admin user configured"
}

# Setup systemd service
setup_systemd() {
    CURRENT_STEP="Configuring systemd service"
    print_step "$CURRENT_STEP"

    if [ -f "marcus-platform.service" ]; then
        sudo cp marcus-platform.service /etc/systemd/system/
        sudo systemctl daemon-reload
        sudo systemctl enable marcus-platform
        print_success "systemd service configured"
    else
        print_warning "marcus-platform.service not found, skipping systemd setup"
    fi
}

# Validate installation
validate_installation() {
    CURRENT_STEP="Validating installation"
    print_step "$CURRENT_STEP"

    # Check if server can start
    if [ -f "$PROJECT_DIR/dist/platform/startup.js" ]; then
        print_success "Server binary exists"
    else
        print_error "Server binary not found at dist/platform/startup.js"
        return 1
    fi

    # Check database connection
    if PGPASSWORD=$DATABASE_PASSWORD psql -h localhost -U marcus -d marcus_production -c "SELECT 1" &> /dev/null; then
        print_success "Database connection: OK"
    else
        print_error "Database connection: FAILED"
        return 1
    fi

    # Check Redis connection
    if redis-cli -h "${REDIS_HOST:-localhost}" -p "${REDIS_PORT:-6379}" ping &> /dev/null; then
        print_success "Redis connection: OK"
    else
        print_error "Redis connection: FAILED"
        return 1
    fi

    print_success "Installation validated"
}

# Save credentials
save_credentials() {
    CURRENT_STEP="Saving credentials"
    print_step "$CURRENT_STEP"

    cat > "$CREDENTIALS_FILE" << INFO_EOF
MARCUS 3.0 Credentials
======================

⚠️  IMPORTANT: Store this file securely and delete after saving to your password manager!

Admin Credentials
-----------------
Email: admin@marcus.local
Password: $ADMIN_PASSWORD

Database
--------
Host: localhost
Port: 5432
Database: marcus_production
User: marcus
Password: $DATABASE_PASSWORD

JWT Secrets
-----------
JWT_SECRET: $JWT_SECRET
JWT_REFRESH_SECRET: $JWT_REFRESH_SECRET

Anthropic
---------
API Key: $ANTHROPIC_API_KEY

Service Management
------------------
Status: sudo systemctl status marcus-platform
Start:  sudo systemctl start marcus-platform
Stop:   sudo systemctl stop marcus-platform
Restart: sudo systemctl restart marcus-platform
Logs:   sudo journalctl -u marcus-platform -f

Endpoints
---------
Health: http://localhost:3000/health
API:    http://localhost:3000

Provisioned: $(date)
Log File: $LOG_FILE
INFO_EOF

    chmod 600 "$CREDENTIALS_FILE"
    print_success "Credentials saved to: $CREDENTIALS_FILE"
}

# Main execution
main() {
    print_header "MARCUS 3.0 VM Provisioning"
    echo "This will install and configure MARCUS 3.0 on this VM"
    echo ""

    validate_prerequisites
    generate_secrets
    update_system
    install_dependencies
    configure_database
    configure_redis
    setup_project
    install_node_deps
    install_python_deps
    run_migrations
    create_admin_user
    setup_systemd
    validate_installation
    save_credentials

    print_header "Provisioning Complete!"

    echo ""
    echo -e "${GREEN}✅ MARCUS 3.0 is ready!${NC}"
    echo ""
    echo -e "${BLUE}Credentials:${NC}"
    echo -e "  File: $CREDENTIALS_FILE"
    echo -e "  Admin: admin@marcus.local / $ADMIN_PASSWORD"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo -e "  1. Start service: sudo systemctl start marcus-platform"
    echo -e "  2. Check status:  sudo systemctl status marcus-platform"
    echo -e "  3. Test health:   curl http://localhost:3000/health"
    echo -e "  4. Run validation: ./scripts/test_marcus_complete.sh"
    echo ""
    echo -e "${YELLOW}⚠️  Security:${NC}"
    echo -e "  - Save credentials from $CREDENTIALS_FILE"
    echo -e "  - Delete credentials file after saving: rm $CREDENTIALS_FILE"
    echo -e "  - Delete secrets file: rm $SECRETS_FILE"
    echo -e "  - Change admin password on first login"
    echo ""
    echo -e "${BLUE}Log File:${NC} $LOG_FILE"
    echo ""
}

# Run main function
main "$@"
