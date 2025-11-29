#!/bin/bash
# VM Blue-Green Deployment Script
# Deploys to standby service, validates, switches Nginx traffic

set -euo pipefail

# Configuration
SATU_DIR="/home/user/satu"
DEPLOY_LOG="/var/log/satu-deployments.log"
HEALTH_RETRIES=30
HEALTH_RETRY_DELAY=2

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $*"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️${NC} $*"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌${NC} $*"
}

# Determine current LIVE and STANDBY services
get_current_service() {
    if [ -L /etc/nginx/conf.d/satu-active.conf ]; then
        readlink /etc/nginx/conf.d/satu-active.conf | grep -o 'blue\|green' || echo "blue"
    else
        echo "blue"
    fi
}

CURRENT=$(get_current_service)
STANDBY=$([ "$CURRENT" = "blue" ] && echo "green" || echo "blue")
STANDBY_PORT=$([ "$STANDBY" = "blue" ] && echo "3001" || echo "3002")

log "Current LIVE service: $CURRENT"
log "Deploying to STANDBY service: $STANDBY (port $STANDBY_PORT)"

# Navigate to standby service directory
cd "$SATU_DIR/production-$STANDBY" || {
    error "Failed to navigate to $SATU_DIR/production-$STANDBY"
    exit 1
}

# Git pull latest from production branch
log "Pulling latest code from production branch..."
git fetch origin production
git reset --hard origin/production

# Install dependencies
log "Installing dependencies (production mode)..."
npm ci --production

# Build application
log "Building Next.js application..."
npm run build

# Restart standby service
log "Restarting $STANDBY service..."
sudo systemctl restart "satu-$STANDBY"

# Wait for service to start
log "Waiting for service to initialize..."
sleep 5

# Health check loop
log "Running health checks (max $HEALTH_RETRIES attempts)..."
for i in $(seq 1 $HEALTH_RETRIES); do
    if curl -f -s "http://127.0.0.1:$STANDBY_PORT/api/health" > /dev/null 2>&1; then
        log "✅ Health check passed (attempt $i/$HEALTH_RETRIES)"
        break
    else
        if [ $i -eq $HEALTH_RETRIES ]; then
            error "Health check failed after $HEALTH_RETRIES attempts"
            error "Service logs:"
            sudo journalctl -u "satu-$STANDBY" -n 50 --no-pager
            exit 1
        fi
        warn "Health check failed (attempt $i/$HEALTH_RETRIES), retrying in ${HEALTH_RETRY_DELAY}s..."
        sleep $HEALTH_RETRY_DELAY
    fi
done

# Switch Nginx upstream (atomic symlink swap)
log "Switching Nginx traffic to $STANDBY..."
sudo ln -sf "/etc/nginx/upstreams/satu-$STANDBY.conf" /etc/nginx/conf.d/satu-active.conf

# Validate Nginx config
log "Validating Nginx configuration..."
if ! sudo nginx -t 2>&1 | grep -q "successful"; then
    error "Nginx configuration test failed"
    # Rollback symlink
    sudo ln -sf "/etc/nginx/upstreams/satu-$CURRENT.conf" /etc/nginx/conf.d/satu-active.conf
    exit 1
fi

# Reload Nginx (zero downtime)
log "Reloading Nginx..."
sudo systemctl reload nginx

# Log deployment
echo "$(date +'%Y-%m-%d %H:%M:%S'): Deployed $STANDBY (was: $CURRENT)" | sudo tee -a "$DEPLOY_LOG" > /dev/null

log "🎉 Deployment complete!"
log "  LIVE service: $STANDBY (port $STANDBY_PORT)"
log "  Standby service: $CURRENT (ready for instant rollback)"
log ""
log "Test deployment:"
log "  curl http://$(hostname -I | awk '{print $1}')/api/health"
log ""
log "Rollback if needed:"
log "  sudo /home/user/satu/deployment/rollback-vm.sh"
