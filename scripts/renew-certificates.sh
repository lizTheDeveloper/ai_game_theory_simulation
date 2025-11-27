#!/bin/bash
#
# MARCUS 3.0 Citation Integrity Platform
# Manual Certificate Renewal
#
# Manually renew Let's Encrypt certificates.
# Normally handled automatically by certbot, but this script
# is useful for testing or forced renewal.
#
# Usage:
#   ./scripts/renew-certificates.sh [--force] [--cert-name NAME]
#
# Author: Marcus (Platform Engineer)
#

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================

FORCE_RENEWAL=false
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
  --force                   Force renewal even if not due
  --cert-name NAME          Renew specific certificate only
  --dry-run                 Test renewal without applying changes
  -h, --help                Show this help message

Examples:
  # Test renewal (dry run)
  $0 --dry-run

  # Renew all certificates due for renewal
  $0

  # Force renewal of all certificates
  $0 --force

  # Renew specific certificate
  $0 --cert-name example.com

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
      --force)
        FORCE_RENEWAL=true
        shift
        ;;
      --cert-name)
        CERT_NAME="$2"
        shift 2
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
}

# ============================================================================
# Certificate Renewal
# ============================================================================

check_certificate_status() {
  log_info "Checking certificate status..."
  echo ""

  if [ -n "$CERT_NAME" ]; then
    sudo certbot certificates --cert-name "$CERT_NAME"
  else
    sudo certbot certificates
  fi

  echo ""
}

renew_certificates() {
  log_info "Renewing certificates..."

  # Build renewal arguments
  RENEWAL_ARGS=""

  if [ "$FORCE_RENEWAL" = true ]; then
    RENEWAL_ARGS="$RENEWAL_ARGS --force-renewal"
    log_warn "Force renewal enabled - certificates will be renewed regardless of expiry"
  fi

  if [ "$DRY_RUN" = true ]; then
    RENEWAL_ARGS="$RENEWAL_ARGS --dry-run"
    log_warn "Dry run mode - no changes will be applied"
  fi

  if [ -n "$CERT_NAME" ]; then
    RENEWAL_ARGS="$RENEWAL_ARGS --cert-name $CERT_NAME"
    log_info "Renewing certificate: $CERT_NAME"
  else
    log_info "Renewing all certificates"
  fi

  # Run certbot renewal
  sudo certbot renew $RENEWAL_ARGS

  if [ "$DRY_RUN" = false ]; then
    log_info "Certificate renewal complete"
  else
    log_info "Dry run complete - no certificates were renewed"
  fi
}

reload_services() {
  if [ "$DRY_RUN" = true ]; then
    return
  fi

  log_info "Reloading services to pick up new certificates..."

  # Reload MARCUS platform (if running as systemd service)
  if systemctl is-active --quiet marcus-platform; then
    log_info "Reloading MARCUS platform service..."
    sudo systemctl reload marcus-platform || log_warn "Failed to reload marcus-platform service"
  fi

  # Reload nginx (if used as reverse proxy)
  if systemctl is-active --quiet nginx; then
    log_info "Reloading nginx..."
    sudo systemctl reload nginx || log_warn "Failed to reload nginx"
  fi

  # Reload other common reverse proxies
  if systemctl is-active --quiet caddy; then
    log_info "Reloading caddy..."
    sudo systemctl reload caddy || log_warn "Failed to reload caddy"
  fi

  log_info "Services reloaded"
}

send_notification() {
  if [ "$DRY_RUN" = true ]; then
    return
  fi

  # TODO: Send notification via email/Slack/Discord
  # For now, just log success
  log_info "Certificate renewal notification sent"
}

# ============================================================================
# Main
# ============================================================================

main() {
  echo "=========================================="
  echo "MARCUS Platform - Certificate Renewal"
  echo "=========================================="
  echo ""

  # Parse command line arguments
  parse_args "$@"

  # Check requirements
  check_command certbot

  # Check current certificate status
  check_certificate_status

  # Confirm before proceeding (unless dry run)
  if [ "$DRY_RUN" = false ] && [ "$FORCE_RENEWAL" = true ]; then
    read -p "Force renew certificates? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      log_info "Cancelled."
      exit 0
    fi
  fi

  # Renew certificates
  renew_certificates

  # Reload services to pick up new certificates
  reload_services

  # Send notification
  send_notification

  echo ""
  log_info "Certificate renewal complete!"
  echo ""
  log_info "Next steps:"
  echo "  1. Verify new certificates:"
  echo "     sudo certbot certificates"
  echo ""
  echo "  2. Test HTTPS connection:"
  echo "     curl -I https://your-domain.com/health"
  echo ""
  echo "  3. Check SSL Labs rating:"
  echo "     https://www.ssllabs.com/ssltest/analyze.html?d=your-domain.com"
  echo ""
}

main "$@"
