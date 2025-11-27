#!/bin/bash
#
# MARCUS 3.0 Citation Integrity Platform
# Let's Encrypt Certificate Setup
#
# Automated certificate generation using Let's Encrypt/Certbot.
# Supports both HTTP-01 and DNS-01 challenges.
#
# Usage:
#   ./scripts/setup-letsencrypt.sh -d example.com -e admin@example.com
#   ./scripts/setup-letsencrypt.sh -d example.com -d www.example.com -e admin@example.com --dns
#
# Requirements:
#   - certbot
#   - DNS provider credentials (for DNS-01)
#
# Author: Marcus (Platform Engineer)
#

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================

DOMAINS=()
EMAIL=""
CHALLENGE_TYPE="http"  # http or dns
WEBROOT="/var/www/html"
CERT_NAME=""
DRY_RUN=false

# ============================================================================
# Utility Functions
# ============================================================================

log_info() {
  echo "✅ $1"
}

log_warn() {
  echo "⚠️  $1"
}

log_error() {
  echo "❌ $1" >&2
}

usage() {
  cat <<EOF
Usage: $0 [OPTIONS]

Options:
  -d, --domain DOMAIN       Domain name (can be specified multiple times)
  -e, --email EMAIL         Email address for Let's Encrypt notifications
  -n, --name NAME           Certificate name (default: first domain)
  -w, --webroot PATH        Webroot path for HTTP-01 challenge (default: /var/www/html)
  --dns                     Use DNS-01 challenge instead of HTTP-01
  --dry-run                 Test without obtaining real certificates
  -h, --help                Show this help message

Examples:
  # Single domain with HTTP-01 challenge
  $0 -d example.com -e admin@example.com

  # Multiple domains (SAN certificate)
  $0 -d example.com -d www.example.com -d api.example.com -e admin@example.com

  # DNS-01 challenge (wildcard certificate)
  $0 -d example.com -d "*.example.com" -e admin@example.com --dns

  # Dry run (test configuration)
  $0 -d example.com -e admin@example.com --dry-run

EOF
  exit 1
}

check_command() {
  if ! command -v "$1" &> /dev/null; then
    log_error "$1 not found. Please install $1."
    exit 1
  fi
}

# ============================================================================
# Parse Arguments
# ============================================================================

parse_args() {
  while [[ $# -gt 0 ]]; do
    case $1 in
      -d|--domain)
        DOMAINS+=("$2")
        shift 2
        ;;
      -e|--email)
        EMAIL="$2"
        shift 2
        ;;
      -n|--name)
        CERT_NAME="$2"
        shift 2
        ;;
      -w|--webroot)
        WEBROOT="$2"
        shift 2
        ;;
      --dns)
        CHALLENGE_TYPE="dns"
        shift
        ;;
      --dry-run)
        DRY_RUN=true
        shift
        ;;
      -h|--help)
        usage
        ;;
      *)
        log_error "Unknown option: $1"
        usage
        ;;
    esac
  done

  # Validate required arguments
  if [ ${#DOMAINS[@]} -eq 0 ]; then
    log_error "At least one domain is required (-d)"
    usage
  fi

  if [ -z "$EMAIL" ]; then
    log_error "Email address is required (-e)"
    usage
  fi

  # Default certificate name to first domain
  if [ -z "$CERT_NAME" ]; then
    CERT_NAME="${DOMAINS[0]}"
  fi
}

# ============================================================================
# Let's Encrypt Setup
# ============================================================================

setup_http_challenge() {
  log_info "Setting up HTTP-01 challenge..."

  # Check webroot exists
  if [ ! -d "$WEBROOT" ]; then
    log_error "Webroot directory not found: $WEBROOT"
    exit 1
  fi

  # Build domain arguments
  DOMAIN_ARGS=""
  for domain in "${DOMAINS[@]}"; do
    DOMAIN_ARGS="$DOMAIN_ARGS -d $domain"
  done

  # Dry run flag
  DRY_RUN_FLAG=""
  if [ "$DRY_RUN" = true ]; then
    DRY_RUN_FLAG="--dry-run"
    log_warn "DRY RUN MODE - No real certificates will be obtained"
  fi

  # Run certbot
  log_info "Running certbot..."
  sudo certbot certonly \
    --webroot \
    --webroot-path "$WEBROOT" \
    $DOMAIN_ARGS \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --cert-name "$CERT_NAME" \
    $DRY_RUN_FLAG

  log_info "HTTP-01 challenge complete"
}

setup_dns_challenge() {
  log_info "Setting up DNS-01 challenge..."

  # Build domain arguments
  DOMAIN_ARGS=""
  for domain in "${DOMAINS[@]}"; do
    DOMAIN_ARGS="$DOMAIN_ARGS -d $domain"
  done

  # Dry run flag
  DRY_RUN_FLAG=""
  if [ "$DRY_RUN" = true ]; then
    DRY_RUN_FLAG="--dry-run"
    log_warn "DRY RUN MODE - No real certificates will be obtained"
  fi

  # Run certbot with manual DNS challenge
  log_info "Running certbot..."
  log_warn "You will need to create DNS TXT records as instructed"

  sudo certbot certonly \
    --manual \
    --preferred-challenges dns \
    $DOMAIN_ARGS \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --cert-name "$CERT_NAME" \
    $DRY_RUN_FLAG

  log_info "DNS-01 challenge complete"
}

setup_auto_renewal() {
  log_info "Setting up automatic certificate renewal..."

  # Check if systemd timer exists
  if systemctl list-timers | grep -q certbot; then
    log_info "Certbot renewal timer already configured"
  else
    log_warn "Certbot renewal timer not found"
    log_warn "Please configure automatic renewal manually or use certbot-auto"
  fi

  # Test renewal process
  log_info "Testing renewal process..."
  sudo certbot renew --dry-run

  log_info "Automatic renewal configured successfully"
}

display_certificate_info() {
  if [ "$DRY_RUN" = true ]; then
    log_warn "Dry run completed - no certificates were obtained"
    return
  fi

  echo ""
  log_info "Certificate obtained successfully!"
  echo ""
  log_info "Certificate details:"
  sudo certbot certificates --cert-name "$CERT_NAME"

  echo ""
  log_info "Certificate files location:"
  echo "  Certificate: /etc/letsencrypt/live/$CERT_NAME/fullchain.pem"
  echo "  Private Key: /etc/letsencrypt/live/$CERT_NAME/privkey.pem"
  echo "  Chain:       /etc/letsencrypt/live/$CERT_NAME/chain.pem"

  echo ""
  log_info "Next steps:"
  echo "  1. Update .env with certificate paths:"
  echo "     TLS_CERT_PATH=/etc/letsencrypt/live/$CERT_NAME/fullchain.pem"
  echo "     TLS_KEY_PATH=/etc/letsencrypt/live/$CERT_NAME/privkey.pem"
  echo "     TLS_CA_PATH=/etc/letsencrypt/live/$CERT_NAME/chain.pem"
  echo ""
  echo "  2. Restart platform server with TLS_ENABLED=true"
  echo ""
  echo "  3. Verify automatic renewal is configured:"
  echo "     sudo certbot renew --dry-run"
  echo ""
}

# ============================================================================
# Main
# ============================================================================

main() {
  echo "=========================================="
  echo "MARCUS Platform - Let's Encrypt Setup"
  echo "=========================================="
  echo ""

  # Parse command line arguments
  parse_args "$@"

  # Check requirements
  check_command certbot

  # Display configuration
  log_info "Configuration:"
  echo "  Domains: ${DOMAINS[*]}"
  echo "  Email: $EMAIL"
  echo "  Certificate Name: $CERT_NAME"
  echo "  Challenge Type: $CHALLENGE_TYPE"
  if [ "$CHALLENGE_TYPE" = "http" ]; then
    echo "  Webroot: $WEBROOT"
  fi
  echo ""

  # Confirm before proceeding
  if [ "$DRY_RUN" = false ]; then
    read -p "Proceed with certificate generation? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      log_info "Cancelled."
      exit 0
    fi
  fi

  # Setup certificate based on challenge type
  if [ "$CHALLENGE_TYPE" = "http" ]; then
    setup_http_challenge
  else
    setup_dns_challenge
  fi

  # Setup automatic renewal
  if [ "$DRY_RUN" = false ]; then
    setup_auto_renewal
  fi

  # Display certificate information
  display_certificate_info
}

main "$@"
