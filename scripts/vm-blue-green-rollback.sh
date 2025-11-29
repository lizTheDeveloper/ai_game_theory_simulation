#!/bin/bash
# VM Blue-Green Rollback Script
# Instantly switches Nginx traffic back to previous service

set -euo pipefail

# Configuration
DEPLOY_LOG="/var/log/satu-deployments.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Determine current LIVE service
get_current_service() {
    if [ -L /etc/nginx/conf.d/satu-active.conf ]; then
        readlink /etc/nginx/conf.d/satu-active.conf | grep -o 'blue\|green' || echo "blue"
    else
        echo "blue"
    fi
}

CURRENT=$(get_current_service)
PREVIOUS=$([ "$CURRENT" = "blue" ] && echo "green" || echo "blue")
PREVIOUS_PORT=$([ "$PREVIOUS" = "blue" ] && echo "3001" || echo "3002")

warn "Current LIVE service: $CURRENT"
warn "Rolling back to: $PREVIOUS (port $PREVIOUS_PORT)"

# Health check previous service
log "Checking health of $PREVIOUS service..."
if ! curl -f -s "http://127.0.0.1:$PREVIOUS_PORT/api/health" > /dev/null 2>&1; then
    error "Previous service ($PREVIOUS) is not healthy"
    error "Cannot rollback to unhealthy service"
    log "Service logs:"
    sudo journalctl -u "satu-$PREVIOUS" -n 50 --no-pager
    exit 1
fi

log "✅ $PREVIOUS service is healthy"

# Confirm rollback (if interactive)
if [ -t 0 ]; then
    read -p "Confirm rollback to $PREVIOUS? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Rollback cancelled"
        exit 0
    fi
fi

# Switch Nginx upstream
log "Switching Nginx traffic to $PREVIOUS..."
sudo ln -sf "/etc/nginx/upstreams/satu-$PREVIOUS.conf" /etc/nginx/conf.d/satu-active.conf

# Validate Nginx config
if ! sudo nginx -t 2>&1 | grep -q "successful"; then
    error "Nginx configuration test failed"
    # Rollback the rollback (restore current)
    sudo ln -sf "/etc/nginx/upstreams/satu-$CURRENT.conf" /etc/nginx/conf.d/satu-active.conf
    exit 1
fi

# Reload Nginx
log "Reloading Nginx..."
sudo systemctl reload nginx

# Log rollback
echo "$(date +'%Y-%m-%d %H:%M:%S'): Rollback to $PREVIOUS (was: $CURRENT)" | sudo tee -a "$DEPLOY_LOG" > /dev/null

log "🔄 Rollback complete!"
log "  LIVE service: $PREVIOUS (port $PREVIOUS_PORT)"
log "  Standby service: $CURRENT"
