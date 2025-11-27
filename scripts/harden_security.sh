#!/bin/bash
# MARCUS 3.0 - Security Hardening Script
# Configures Redis authentication and PostgreSQL SSL

set -e

echo "🔒 MARCUS 3.0 Security Hardening"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_step() { echo -e "\n📋 $1"; }

# ============================================================================
# 1. Redis Authentication
# ============================================================================

print_step "Configuring Redis Authentication"

# Generate strong Redis password
REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d '/+=' | head -c 32)

# Find Redis configuration file
REDIS_CONF=$(sudo find /etc/redis -name "redis.conf" 2>/dev/null | head -1)

if [ -z "$REDIS_CONF" ]; then
    print_error "Redis configuration file not found"
    exit 1
fi

print_success "Found Redis config: $REDIS_CONF"

# Backup original Redis config
sudo cp "$REDIS_CONF" "$REDIS_CONF.backup.$(date +%Y%m%d_%H%M%S)"
print_success "Backed up Redis configuration"

# Add requirepass if not already present
if sudo grep -q "^requirepass" "$REDIS_CONF"; then
    print_warning "Redis password already set, updating..."
    sudo sed -i "s/^requirepass.*/requirepass $REDIS_PASSWORD/" "$REDIS_CONF"
else
    print_success "Adding Redis password..."
    echo "requirepass $REDIS_PASSWORD" | sudo tee -a "$REDIS_CONF" > /dev/null
fi

# Restart Redis
print_step "Restarting Redis..."
sudo systemctl restart redis-server || sudo systemctl restart redis
sleep 2

# Test Redis authentication
if redis-cli -a "$REDIS_PASSWORD" PING 2>/dev/null | grep -q "PONG"; then
    print_success "Redis authentication working"
else
    print_error "Redis authentication test failed"
    exit 1
fi

# ============================================================================
# 2. Update .env File
# ============================================================================

print_step "Updating environment configuration"

ENV_FILE="$HOME/ai_game_theory_simulation/.env"

if [ -f "$ENV_FILE" ]; then
    # Backup .env
    cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    print_success "Backed up .env file"
    
    # Update or add REDIS_PASSWORD
    if grep -q "^REDIS_PASSWORD=" "$ENV_FILE"; then
        sed -i "s/^REDIS_PASSWORD=.*/REDIS_PASSWORD=$REDIS_PASSWORD/" "$ENV_FILE"
    else
        echo "" >> "$ENV_FILE"
        echo "# Redis Authentication (added $(date +%Y-%m-%d))" >> "$ENV_FILE"
        echo "REDIS_PASSWORD=$REDIS_PASSWORD" >> "$ENV_FILE"
    fi
    
    print_success "Updated .env with Redis password"
else
    print_warning ".env file not found, skipping update"
fi

# ============================================================================
# 3. PostgreSQL SSL Preparation
# ============================================================================

print_step "Preparing PostgreSQL for SSL"

PG_VERSION=$(sudo -u postgres psql -tAc "SHOW server_version;" | cut -d. -f1)
PG_CONF_DIR="/etc/postgresql/$PG_VERSION/main"

if [ ! -d "$PG_CONF_DIR" ]; then
    print_warning "PostgreSQL config directory not found: $PG_CONF_DIR"
else
    print_success "Found PostgreSQL $PG_VERSION config: $PG_CONF_DIR"
    
    # Check if SSL certificates exist
    if [ -f "/etc/ssl/certs/ssl-cert-snakeoil.pem" ]; then
        print_success "Self-signed SSL certificates available"
        print_warning "For production, generate proper SSL certificates"
        print_warning "See: https://www.postgresql.org/docs/current/ssl-tcp.html"
    else
        print_warning "No SSL certificates found"
        print_warning "SSL configuration requires certificates"
    fi
    
    # Enable SSL in postgresql.conf (commented out for safety)
    print_warning "SSL configuration requires manual setup:"
    echo "  1. Generate SSL certificates"
    echo "  2. Edit $PG_CONF_DIR/postgresql.conf"
    echo "  3. Set: ssl = on"
    echo "  4. Set: ssl_cert_file = '/path/to/server.crt'"
    echo "  5. Set: ssl_key_file = '/path/to/server.key'"
    echo "  6. Restart PostgreSQL: sudo systemctl restart postgresql"
fi

# ============================================================================
# 4. Security Summary
# ============================================================================

print_step "Security Configuration Summary"

# Save credentials to secure file
CREDS_FILE="$HOME/marcus_security_$(date +%Y%m%d_%H%M%S).txt"
cat > "$CREDS_FILE" << CREDS
MARCUS 3.0 Security Configuration
Generated: $(date)

===========================================
Redis Authentication
===========================================
Password: $REDIS_PASSWORD

Location: $ENV_FILE
Config: $REDIS_CONF

Test connection:
  redis-cli -a '$REDIS_PASSWORD' PING

===========================================
PostgreSQL SSL
===========================================
Status: Requires manual configuration
Version: PostgreSQL $PG_VERSION
Config: $PG_CONF_DIR/postgresql.conf

Steps to enable:
1. Generate SSL certificates
2. Update postgresql.conf (ssl = on)
3. Restart PostgreSQL

===========================================
Next Steps
===========================================
1. Restart MARCUS service:
   sudo systemctl restart marcus-platform

2. Verify Redis connection:
   redis-cli -a '$REDIS_PASSWORD' INFO

3. Check application logs:
   sudo journalctl -u marcus-platform -f

===========================================
CREDS

chmod 600 "$CREDS_FILE"
print_success "Credentials saved to: $CREDS_FILE"

echo ""
print_success "Security hardening complete!"
echo ""
echo "📝 Important:"
echo "  - Redis password has been set and saved to .env"
echo "  - Restart MARCUS service: sudo systemctl restart marcus-platform"
echo "  - PostgreSQL SSL requires manual configuration"
echo "  - Keep credentials file secure: $CREDS_FILE"
echo ""
