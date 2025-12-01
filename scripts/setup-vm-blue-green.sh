#!/bin/bash
# VM Blue-Green Deployment Setup Script
# Run this on the VM to set up complete blue-green infrastructure

set -euo pipefail

# Configuration
# Detect actual user and their home directory (in case running with sudo)
ACTUAL_USER="${SUDO_USER:-$(whoami)}"
if [ "$ACTUAL_USER" != "root" ] && [ -n "$SUDO_USER" ]; then
    ACTUAL_HOME=$(eval echo "~$ACTUAL_USER")
else
    ACTUAL_HOME="$HOME"
fi

SATU_DIR="$ACTUAL_HOME/satu"
REPO_URL="https://github.com/lizTheDeveloper/ai_game_theory_simulation.git"
BRANCH="production"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $*"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️${NC} $*"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌${NC} $*"
}

header() {
    echo -e "\n${BLUE}=== $* ===${NC}\n"
}

# Check prerequisites
header "Checking Prerequisites"

if ! command -v nginx &> /dev/null; then
    error "Nginx not installed. Installing..."
    sudo apt-get update
    sudo apt-get install -y nginx
fi

if ! command -v node &> /dev/null; then
    error "Node.js not installed"
    error "Please install Node.js 18+ first:"
    error "  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    error "  sudo apt-get install -y nodejs"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    error "npm not installed"
    exit 1
fi

log "✅ Prerequisites satisfied"
log "   Nginx: $(nginx -v 2>&1)"
log "   Node.js: $(node --version)"
log "   npm: $(npm --version)"

# Create directory structure
header "Creating Directory Structure"

mkdir -p "$SATU_DIR"/{production-blue,production-green,webhook-listener,deployment}
mkdir -p /etc/nginx/upstreams
sudo mkdir -p /var/log

log "✅ Directories created"

# Clone repos for blue and green
header "Cloning Repositories"

if [ ! -d "$SATU_DIR/production-blue/.git" ]; then
    log "Cloning blue repository..."
    git clone -b "$BRANCH" "$REPO_URL" "$SATU_DIR/production-blue"
else
    log "Blue repository already exists, pulling latest..."
    cd "$SATU_DIR/production-blue"
    git pull origin "$BRANCH"
fi

if [ ! -d "$SATU_DIR/production-green/.git" ]; then
    log "Cloning green repository..."
    git clone -b "$BRANCH" "$REPO_URL" "$SATU_DIR/production-green"
else
    log "Green repository already exists, pulling latest..."
    cd "$SATU_DIR/production-green"
    git pull origin "$BRANCH"
fi

log "✅ Repositories cloned"

# Install dependencies and build
header "Building Applications"

log "Building as user: $ACTUAL_USER (home: $ACTUAL_HOME)"

# Install TypeScript globally first (needed for workspace builds)
log "Installing TypeScript globally..."
if [ "$ACTUAL_USER" != "root" ] && [ -n "$SUDO_USER" ]; then
    sudo -u "$ACTUAL_USER" npm install -g typescript
else
    npm install -g typescript
fi

log "Building blue service..."
cd "$SATU_DIR/production-blue"
if [ "$ACTUAL_USER" != "root" ] && [ -n "$SUDO_USER" ]; then
    sudo -u "$ACTUAL_USER" npm install --omit=dev
    sudo -u "$ACTUAL_USER" npm run build
else
    npm install --omit=dev
    npm run build
fi

log "Building green service..."
cd "$SATU_DIR/production-green"
if [ "$ACTUAL_USER" != "root" ] && [ -n "$SUDO_USER" ]; then
    sudo -u "$ACTUAL_USER" npm install --omit=dev
    sudo -u "$ACTUAL_USER" npm run build
else
    npm install --omit=dev
    npm run build
fi

log "✅ Applications built"

# Set up webhook listener
header "Setting Up Webhook Listener"

cp -r "$SATU_DIR/production-blue/scripts/webhook-listener/"* "$SATU_DIR/webhook-listener/"

if [ ! -f "$SATU_DIR/webhook-listener/.env" ]; then
    log "Creating webhook .env file..."
    cat > "$SATU_DIR/webhook-listener/.env" <<EOF
WEBHOOK_SECRET=$(openssl rand -hex 32)
PORT=8080
DEPLOY_SCRIPT=$SATU_DIR/deployment/deploy-vm-blue-green.sh
LOG_FILE=/var/log/satu-webhook.log
EOF
    chmod 600 "$SATU_DIR/webhook-listener/.env"
    warn "⚠️ IMPORTANT: Webhook secret generated in $SATU_DIR/webhook-listener/.env"
    warn "   You MUST configure this secret in GitHub webhook settings"
    warn "   Secret: $(grep WEBHOOK_SECRET "$SATU_DIR/webhook-listener/.env" | cut -d= -f2)"
else
    log "Webhook .env already exists"
fi

cd "$SATU_DIR/webhook-listener"
if [ "$ACTUAL_USER" != "root" ] && [ -n "$SUDO_USER" ]; then
    sudo -u "$ACTUAL_USER" npm install
else
    npm install
fi

log "✅ Webhook listener configured"

# Copy deployment scripts
header "Installing Deployment Scripts"

cp "$SATU_DIR/production-blue/scripts/vm-blue-green-deploy.sh" "$SATU_DIR/deployment/"
cp "$SATU_DIR/production-blue/scripts/vm-blue-green-rollback.sh" "$SATU_DIR/deployment/"
cp "$SATU_DIR/production-blue/scripts/vm-blue-green-status.sh" "$SATU_DIR/deployment/"

chmod +x "$SATU_DIR/deployment/"*.sh

log "✅ Deployment scripts installed"

# Create Nginx upstream configs
header "Configuring Nginx"

sudo tee /etc/nginx/upstreams/satu-blue.conf > /dev/null <<'EOF'
upstream satu_active {
    server 127.0.0.1:3001;
    keepalive 64;
}
EOF

sudo tee /etc/nginx/upstreams/satu-green.conf > /dev/null <<'EOF'
upstream satu_active {
    server 127.0.0.1:3002;
    keepalive 64;
}
EOF

# Create Nginx site config
sudo tee /etc/nginx/sites-available/satu > /dev/null <<'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://satu_active;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/satu /etc/nginx/sites-enabled/satu

# Set initial active service (blue)
sudo ln -sf /etc/nginx/upstreams/satu-blue.conf /etc/nginx/conf.d/satu-active.conf

# Test Nginx config
if sudo nginx -t; then
    log "✅ Nginx configuration valid"
    sudo systemctl reload nginx
else
    error "Nginx configuration invalid"
    exit 1
fi

# Install systemd services
header "Installing Systemd Services"

# Copy service files and replace placeholders
for service in satu-blue satu-green satu-webhook; do
    sudo cp "$SATU_DIR/production-blue/systemd/${service}.service" /etc/systemd/system/
    # Replace User=user with actual user
    sudo sed -i "s|^User=user|User=$ACTUAL_USER|" /etc/systemd/system/${service}.service
    # Replace /home/user with actual home
    sudo sed -i "s|/home/user|$ACTUAL_HOME|g" /etc/systemd/system/${service}.service
done

sudo systemctl daemon-reload

log "✅ Systemd services installed and configured for user $ACTUAL_USER"

# Configure sudo permissions for deployment
header "Configuring Sudo Permissions"

sudo tee /etc/sudoers.d/satu-deploy > /dev/null <<EOF
# Allow $ACTUAL_USER to run deployment commands without password
$ACTUAL_USER ALL=(ALL) NOPASSWD: /usr/sbin/nginx -t
$ACTUAL_USER ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx
$ACTUAL_USER ALL=(ALL) NOPASSWD: /bin/systemctl restart satu-blue
$ACTUAL_USER ALL=(ALL) NOPASSWD: /bin/systemctl restart satu-green
$ACTUAL_USER ALL=(ALL) NOPASSWD: /bin/systemctl status satu-blue
$ACTUAL_USER ALL=(ALL) NOPASSWD: /bin/systemctl status satu-green
$ACTUAL_USER ALL=(ALL) NOPASSWD: /bin/systemctl status satu-webhook
$ACTUAL_USER ALL=(ALL) NOPASSWD: /usr/bin/journalctl -u satu-blue*
$ACTUAL_USER ALL=(ALL) NOPASSWD: /usr/bin/journalctl -u satu-green*
$ACTUAL_USER ALL=(ALL) NOPASSWD: /usr/bin/journalctl -u satu-webhook*
$ACTUAL_USER ALL=(ALL) NOPASSWD: /usr/bin/tee -a /var/log/satu-deployments.log
EOF

sudo chmod 0440 /etc/sudoers.d/satu-deploy

log "✅ Sudo permissions configured"

# Create log files
sudo touch /var/log/satu-{blue,green,webhook,deployments}.log
sudo chown $ACTUAL_USER:$ACTUAL_USER /var/log/satu-*.log

# Enable and start services
header "Starting Services"

sudo systemctl enable satu-blue satu-green satu-webhook
sudo systemctl start satu-blue satu-green satu-webhook

log "✅ Services started"

# Wait for services to start
sleep 5

# Configure firewall
header "Configuring Firewall"

if command -v gcloud &> /dev/null; then
    log "Creating GCP firewall rule for webhook (port 8080)..."
    gcloud compute firewall-rules create allow-satu-webhook \
        --allow tcp:8080 \
        --source-ranges 0.0.0.0/0 \
        --description "Allow GitHub webhooks for SATU deployments" \
        || warn "Firewall rule may already exist"
fi

# Final status check
header "Deployment Status"

"$SATU_DIR/deployment/vm-blue-green-status.sh"

# Print next steps
header "Setup Complete!"

echo "✅ Blue-green deployment infrastructure ready"
echo ""
echo "Next steps:"
echo ""
echo "1. Configure GitHub webhook:"
echo "   URL: http://$(curl -s ifconfig.me):8080/webhook"
echo "   Secret: $(grep WEBHOOK_SECRET "$SATU_DIR/webhook-listener/.env" | cut -d= -f2)"
echo "   Content type: application/json"
echo "   Events: Just push events"
echo ""
echo "2. Test deployment:"
echo "   git push origin production"
echo ""
echo "3. Monitor deployment:"
echo "   sudo journalctl -u satu-webhook -f"
echo ""
echo "4. Check status anytime:"
echo "   $SATU_DIR/deployment/vm-blue-green-status.sh"
echo ""
echo "5. Rollback if needed:"
echo "   sudo $SATU_DIR/deployment/rollback-vm.sh"
