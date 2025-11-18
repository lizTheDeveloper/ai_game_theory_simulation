#!/bin/bash
# MARCUS 3.0 Zero-to-Production VM Automation
# Complete deployment automation with all debugging fixes applied
# Usage: ./setup_marcus_vm.sh [GCP_PROJECT_ID] [ANTHROPIC_API_KEY] [ZONE] [MACHINE_TYPE]
#
# Examples:
#   ./setup_marcus_vm.sh my-project sk-ant-api03-xxx
#   ./setup_marcus_vm.sh my-project sk-ant-api03-xxx us-east1-b
#   ./setup_marcus_vm.sh my-project sk-ant-api03-xxx europe-west1-b e2-standard-4

set -e

# Configuration
GCP_PROJECT_ID="${1:-}"
ANTHROPIC_API_KEY="${2:-}"
ZONE="${3:-us-central1-a}"
MACHINE_TYPE="${4:-e2-standard-2}"
VM_NAME="marcus-vm-$(date +%Y%m%d-%H%M%S)"
DISK_SIZE="20GB"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Validate inputs
if [ -z "$GCP_PROJECT_ID" ]; then
    print_error "Missing GCP_PROJECT_ID"
    echo ""
    echo "Usage: $0 [GCP_PROJECT_ID] [ANTHROPIC_API_KEY] [ZONE] [MACHINE_TYPE]"
    echo ""
    echo "Examples:"
    echo "  $0 my-project sk-ant-api03-xxx"
    echo "  $0 my-project sk-ant-api03-xxx us-east1-b"
    echo "  $0 my-project sk-ant-api03-xxx europe-west1-b e2-standard-4"
    echo ""
    echo "Common zones:"
    echo "  us-central1-a       (Iowa, USA)"
    echo "  us-east1-b          (South Carolina, USA)"
    echo "  us-west1-a          (Oregon, USA)"
    echo "  europe-west1-b      (Belgium, Europe)"
    echo "  asia-southeast1-a   (Singapore, Asia)"
    echo ""
    echo "Common machine types:"
    echo "  e2-micro            (0.25 vCPU, 1 GB - dev only)"
    echo "  e2-small            (2 vCPU, 2 GB - testing)"
    echo "  e2-medium           (2 vCPU, 4 GB - light production)"
    echo "  e2-standard-2       (2 vCPU, 8 GB - production)"
    echo "  e2-standard-4       (4 vCPU, 16 GB - high load)"
    exit 1
fi

if [ -z "$ANTHROPIC_API_KEY" ]; then
    print_error "Missing ANTHROPIC_API_KEY"
    echo ""
    echo "Usage: $0 [GCP_PROJECT_ID] [ANTHROPIC_API_KEY] [ZONE] [MACHINE_TYPE]"
    echo ""
    echo "Get your API key from: https://console.anthropic.com/"
    exit 1
fi

print_header "MARCUS 3.0 Zero-to-Production Deployment"
echo "Project: $GCP_PROJECT_ID"
echo "VM Name: $VM_NAME"
echo "Zone: $ZONE"
echo "Machine Type: $MACHINE_TYPE"
echo ""
echo "Note: Zone and machine type can be customized:"
echo "  Zone defaults to: us-central1-a"
echo "  Machine type defaults to: e2-standard-2 (2 vCPU, 8 GB)"
echo ""

# Generate secure passwords
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
JWT_SECRET=$(openssl rand -base64 48 | tr -d "=+/" | cut -c1-64)
JWT_REFRESH_SECRET=$(openssl rand -base64 48 | tr -d "=+/" | cut -c1-64)

print_step "Generating secure passwords..."
print_success "Database password: [generated]"
print_success "JWT secrets: [generated]"

# Create startup script
cat > /tmp/marcus_startup.sh << 'STARTUP_EOF'
#!/bin/bash
# MARCUS 3.0 VM Initialization Script
# Runs on first boot to set up everything

set -e

# Update system
apt-get update
apt-get upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PostgreSQL 14
apt-get install -y postgresql postgresql-contrib

# Install Redis
apt-get install -y redis-server

# Install Python 3 and pip
apt-get install -y python3 python3-pip python3-venv

# Install build tools
apt-get install -y build-essential git curl

# Configure PostgreSQL
sudo -u postgres psql << 'PSQL_EOF'
CREATE USER marcus WITH PASSWORD 'DB_PASSWORD_PLACEHOLDER';
CREATE DATABASE marcus_production OWNER marcus;
GRANT ALL PRIVILEGES ON DATABASE marcus_production TO marcus;
PSQL_EOF

# Configure Redis
sed -i 's/^bind 127.0.0.1/bind 0.0.0.0/' /etc/redis/redis.conf
systemctl restart redis-server

# Clone repository
cd /opt
git clone https://github.com/404GeneNotFound/ai_game_theory_simulation.git marcus
cd marcus
git checkout main

# Create environment file
cat > .env << 'ENV_EOF'
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=marcus_production
DATABASE_USER=marcus
DATABASE_PASSWORD=DB_PASSWORD_PLACEHOLDER
DATABASE_POOL_SIZE=10

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# JWT
JWT_SECRET=JWT_SECRET_PLACEHOLDER
JWT_REFRESH_SECRET=JWT_REFRESH_SECRET_PLACEHOLDER

# Anthropic
ANTHROPIC_API_KEY=ANTHROPIC_API_KEY_PLACEHOLDER

# Logging
LOG_LEVEL=info
LOG_DIR=/var/log/marcus
ENV_EOF

# Create log directory
mkdir -p /var/log/marcus
mkdir -p logs/pm2
chown -R ubuntu:ubuntu /var/log/marcus
chown -R ubuntu:ubuntu logs

# Install Node dependencies
sudo -u ubuntu npm install

# Build TypeScript
sudo -u ubuntu npm run build

# Security: Fix npm vulnerabilities
print_step "Fixing npm security vulnerabilities..."
sudo -u ubuntu npm audit fix

# Security: Upgrade vulnerable Python packages
print_step "Upgrading Python security packages..."
python3 -m pip install --upgrade setuptools>=78.1.1 cryptography>=43.0.1

# Install Python dependencies
python3 -m pip install anthropic psycopg2-binary redis

# Run database migrations
PGPASSWORD=DB_PASSWORD_PLACEHOLDER psql -h localhost -U marcus -d marcus_production << 'MIGRATION_EOF'
-- Complete schema from 005_complete_schema.sql

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create citation_analyses table
CREATE TABLE IF NOT EXISTS citation_analyses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    document_text TEXT NOT NULL,
    integrity_score DECIMAL(5,2),
    consensus_data JSONB,
    agent_results JSONB,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Create agent_behaviors table
CREATE TABLE IF NOT EXISTS agent_behaviors (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(50) NOT NULL,
    behavior_type VARCHAR(50) NOT NULL,
    reputation_score DECIMAL(3,2) DEFAULT 0.50,
    total_analyses INTEGER DEFAULT 0,
    detected_violations INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW()
);

-- Create refresh_tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT false,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create auth_audit_log table
CREATE TABLE IF NOT EXISTS auth_audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    email VARCHAR(255),
    event_type VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indices
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_citation_analyses_user_id ON citation_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_user_id ON auth_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_created_at ON auth_audit_log(created_at);

-- Create functions
CREATE OR REPLACE FUNCTION check_and_lock_account(
    p_email VARCHAR(255),
    p_max_attempts INTEGER,
    p_lockout_minutes INTEGER
) RETURNS void AS $$
BEGIN
    UPDATE users
    SET failed_login_attempts = failed_login_attempts + 1,
        locked_until = CASE
            WHEN failed_login_attempts + 1 >= p_max_attempts
            THEN NOW() + (p_lockout_minutes || ' minutes')::INTERVAL
            ELSE locked_until
        END
    WHERE email = p_email;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION reset_failed_attempts(p_user_id INTEGER) RETURNS void AS $$
BEGIN
    UPDATE users
    SET failed_login_attempts = 0,
        locked_until = NULL,
        last_login = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_expired_tokens() RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM refresh_tokens
    WHERE expires_at < NOW() OR revoked = true;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: SecurePassword123!)
INSERT INTO users (email, password_hash, role, email_verified, is_active)
VALUES ('admin@marcus.local', '$2b$12$cloTZR1VaBlZ5lGDrg/TfOOvXk4660MCSU.SvzJljZnutD7OJGrpe', 'admin', true, true)
ON CONFLICT (email) DO NOTHING;

MIGRATION_EOF

# Install PM2 globally
npm install -g pm2

# Copy systemd service
cp marcus-platform.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable marcus-platform
systemctl start marcus-platform

# Setup log rotation
cat > /etc/logrotate.d/marcus << 'LOGROTATE_EOF'
/var/log/marcus/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    create 0644 ubuntu ubuntu
}
LOGROTATE_EOF

# Setup firewall
ufw allow 22/tcp
ufw allow 3000/tcp
ufw --force enable

print_success "MARCUS 3.0 setup complete!"
print_success "Service status:"
systemctl status marcus-platform --no-pager

print_success "Test endpoints:"
echo "Health: curl http://localhost:3000/health"
echo "Login: curl -X POST http://localhost:3000/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@marcus.local\",\"password\":\"SecurePassword123!\"}'"

STARTUP_EOF

# Replace placeholders in startup script
sed -i "s/DB_PASSWORD_PLACEHOLDER/$DB_PASSWORD/g" /tmp/marcus_startup.sh
sed -i "s/JWT_SECRET_PLACEHOLDER/$JWT_SECRET/g" /tmp/marcus_startup.sh
sed -i "s/JWT_REFRESH_SECRET_PLACEHOLDER/$JWT_REFRESH_SECRET/g" /tmp/marcus_startup.sh
sed -i "s/ANTHROPIC_API_KEY_PLACEHOLDER/$ANTHROPIC_API_KEY/g" /tmp/marcus_startup.sh

print_step "Creating GCP VM instance..."

gcloud compute instances create $VM_NAME \
    --project=$GCP_PROJECT_ID \
    --zone=$ZONE \
    --machine-type=$MACHINE_TYPE \
    --boot-disk-size=$DISK_SIZE \
    --boot-disk-type=pd-standard \
    --image-family=ubuntu-2004-lts \
    --image-project=ubuntu-os-cloud \
    --tags=marcus-server,http-server \
    --metadata-from-file startup-script=/tmp/marcus_startup.sh \
    --scopes=cloud-platform

print_success "VM instance created: $VM_NAME"

# Create firewall rules
print_step "Creating firewall rules..."

gcloud compute firewall-rules create marcus-allow-http \
    --project=$GCP_PROJECT_ID \
    --allow=tcp:3000 \
    --target-tags=marcus-server \
    --description="Allow HTTP traffic to MARCUS platform" \
    --direction=INGRESS || true

print_success "Firewall rules configured"

# Get external IP
EXTERNAL_IP=$(gcloud compute instances describe $VM_NAME \
    --project=$GCP_PROJECT_ID \
    --zone=$ZONE \
    --format='get(networkInterfaces[0].accessConfigs[0].natIP)')

print_header "Deployment Complete!"

echo ""
echo -e "${GREEN}VM Name:${NC} $VM_NAME"
echo -e "${GREEN}External IP:${NC} $EXTERNAL_IP"
echo -e "${GREEN}Zone:${NC} $ZONE"
echo ""
echo -e "${BLUE}Access Information:${NC}"
echo -e "SSH: gcloud compute ssh $VM_NAME --project=$GCP_PROJECT_ID --zone=$ZONE"
echo -e "Health Endpoint: http://$EXTERNAL_IP:3000/health"
echo -e "API Base URL: http://$EXTERNAL_IP:3000"
echo ""
echo -e "${BLUE}Credentials:${NC}"
echo -e "Admin Email: admin@marcus.local"
echo -e "Admin Password: SecurePassword123!"
echo -e "Database Password: $DB_PASSWORD"
echo ""
echo -e "${YELLOW}Setup Progress:${NC}"
echo "The VM is still initializing. Monitor progress:"
echo "gcloud compute ssh $VM_NAME --project=$GCP_PROJECT_ID --zone=$ZONE --command='tail -f /var/log/syslog'"
echo ""
echo -e "${YELLOW}Wait 5-10 minutes for complete setup, then test:${NC}"
echo "curl http://$EXTERNAL_IP:3000/health"
echo ""

# Save credentials to file
cat > marcus_deployment_info.txt << INFO_EOF
MARCUS 3.0 Deployment Information
=================================

VM Name: $VM_NAME
External IP: $EXTERNAL_IP
Zone: $ZONE
Project: $GCP_PROJECT_ID

Access:
-------
SSH: gcloud compute ssh $VM_NAME --project=$GCP_PROJECT_ID --zone=$ZONE
Health: http://$EXTERNAL_IP:3000/health
API: http://$EXTERNAL_IP:3000

Credentials:
------------
Admin Email: admin@marcus.local
Admin Password: SecurePassword123!
Database User: marcus
Database Password: $DB_PASSWORD
Database Name: marcus_production

JWT Secrets:
------------
JWT_SECRET: $JWT_SECRET
JWT_REFRESH_SECRET: $JWT_REFRESH_SECRET

Service Management:
------------------
Status: systemctl status marcus-platform
Logs: tail -f /var/log/marcus/app.log
Restart: systemctl restart marcus-platform

Cleanup:
--------
Delete VM: gcloud compute instances delete $VM_NAME --project=$GCP_PROJECT_ID --zone=$ZONE
Delete Firewall: gcloud compute firewall-rules delete marcus-allow-http --project=$GCP_PROJECT_ID

Deployed: $(date)
INFO_EOF

print_success "Deployment info saved to: marcus_deployment_info.txt"

