#!/bin/bash
#
# MARCUS 3.0 Citation Integrity Platform
# Certificate Expiry Checker
#
# Check certificate expiry dates and alert if renewal is needed.
# Can be run as a cron job for automated monitoring.
#
# Usage:
#   ./scripts/check-cert-expiry.sh [--cert-name NAME] [--warn-days N]
#
# Exit Codes:
#   0 - Certificate valid and not expiring soon
#   1 - Certificate expiring soon (within warning threshold)
#   2 - Certificate expired or invalid
#
# Author: Marcus (Platform Engineer)
#

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================

CERT_NAME=""
WARN_DAYS=30
CHECK_REMOTE=false
REMOTE_HOST=""
REMOTE_PORT=443

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
  --cert-name NAME          Check specific certificate (default: all)
  --warn-days N             Alert if expiring within N days (default: 30)
  --remote HOST             Check remote certificate (via TLS connection)
  --port PORT               Remote port (default: 443)
  -h, --help                Show this help message

Examples:
  # Check all local certificates
  $0

  # Check specific certificate
  $0 --cert-name example.com

  # Check with custom warning threshold
  $0 --warn-days 14

  # Check remote certificate
  $0 --remote example.com --port 443

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
      --cert-name)
        CERT_NAME="$2"
        shift 2
        ;;
      --warn-days)
        WARN_DAYS="$2"
        shift 2
        ;;
      --remote)
        CHECK_REMOTE=true
        REMOTE_HOST="$2"
        shift 2
        ;;
      --port)
        REMOTE_PORT="$2"
        shift 2
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
# Certificate Expiry Checking
# ============================================================================

check_local_certificate() {
  local cert_name="$1"
  local cert_path="/etc/letsencrypt/live/$cert_name/fullchain.pem"

  if [ ! -f "$cert_path" ]; then
    log_error "Certificate not found: $cert_path"
    return 2
  fi

  # Get certificate expiry date
  local expiry_date=$(openssl x509 -in "$cert_path" -noout -enddate | cut -d= -f2)
  local expiry_epoch=$(date -d "$expiry_date" +%s)
  local current_epoch=$(date +%s)
  local days_remaining=$(( ($expiry_epoch - $current_epoch) / 86400 ))

  echo ""
  log_info "Certificate: $cert_name"
  echo "  Path: $cert_path"
  echo "  Expiry Date: $expiry_date"
  echo "  Days Remaining: $days_remaining"

  # Check expiry status
  if [ $days_remaining -lt 0 ]; then
    log_error "EXPIRED ($days_remaining days ago)"
    return 2
  elif [ $days_remaining -le $WARN_DAYS ]; then
    log_warn "EXPIRING SOON ($days_remaining days remaining)"
    return 1
  else
    log_info "VALID ($days_remaining days remaining)"
    return 0
  fi
}

check_remote_certificate() {
  local host="$1"
  local port="$2"

  log_info "Checking remote certificate: $host:$port"

  # Get certificate expiry date via OpenSSL
  local expiry_date=$(echo | openssl s_client -servername "$host" -connect "$host:$port" 2>/dev/null | \
    openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)

  if [ -z "$expiry_date" ]; then
    log_error "Failed to retrieve certificate from $host:$port"
    return 2
  fi

  local expiry_epoch=$(date -d "$expiry_date" +%s)
  local current_epoch=$(date +%s)
  local days_remaining=$(( ($expiry_epoch - $current_epoch) / 86400 ))

  echo ""
  log_info "Remote Certificate: $host:$port"
  echo "  Expiry Date: $expiry_date"
  echo "  Days Remaining: $days_remaining"

  # Get certificate details
  local subject=$(echo | openssl s_client -servername "$host" -connect "$host:$port" 2>/dev/null | \
    openssl x509 -noout -subject 2>/dev/null | sed 's/^subject=//')
  local issuer=$(echo | openssl s_client -servername "$host" -connect "$host:$port" 2>/dev/null | \
    openssl x509 -noout -issuer 2>/dev/null | sed 's/^issuer=//')

  echo "  Subject: $subject"
  echo "  Issuer: $issuer"

  # Check expiry status
  if [ $days_remaining -lt 0 ]; then
    log_error "EXPIRED ($days_remaining days ago)"
    return 2
  elif [ $days_remaining -le $WARN_DAYS ]; then
    log_warn "EXPIRING SOON ($days_remaining days remaining)"
    return 1
  else
    log_info "VALID ($days_remaining days remaining)"
    return 0
  fi
}

check_all_certificates() {
  log_info "Checking all Let's Encrypt certificates..."

  local cert_dir="/etc/letsencrypt/live"

  if [ ! -d "$cert_dir" ]; then
    log_error "Let's Encrypt directory not found: $cert_dir"
    return 2
  fi

  local exit_code=0

  # Check each certificate
  for cert_path in "$cert_dir"/*; do
    if [ -d "$cert_path" ]; then
      local cert_name=$(basename "$cert_path")
      check_local_certificate "$cert_name" || exit_code=$?
    fi
  done

  return $exit_code
}

send_alert() {
  local cert_name="$1"
  local days_remaining="$2"

  # TODO: Implement alert notifications
  # - Email via sendmail/mailx
  # - Slack webhook
  # - Discord webhook
  # - PagerDuty
  # - Custom webhook

  log_warn "Alert: Certificate '$cert_name' expires in $days_remaining days"
  log_warn "Please renew the certificate soon!"
}

# ============================================================================
# Main
# ============================================================================

main() {
  echo "=========================================="
  echo "MARCUS Platform - Certificate Expiry Check"
  echo "=========================================="
  echo ""

  # Parse command line arguments
  parse_args "$@"

  # Check requirements
  check_command openssl

  local exit_code=0

  # Check remote certificate
  if [ "$CHECK_REMOTE" = true ]; then
    if [ -z "$REMOTE_HOST" ]; then
      log_error "Remote host required (--remote)"
      exit 1
    fi

    check_remote_certificate "$REMOTE_HOST" "$REMOTE_PORT" || exit_code=$?

  # Check specific certificate
  elif [ -n "$CERT_NAME" ]; then
    check_command certbot
    check_local_certificate "$CERT_NAME" || exit_code=$?

  # Check all certificates
  else
    check_command certbot
    check_all_certificates || exit_code=$?
  fi

  echo ""

  # Display summary
  case $exit_code in
    0)
      log_info "All certificates valid and not expiring soon"
      ;;
    1)
      log_warn "One or more certificates expiring within $WARN_DAYS days"
      log_warn "Run renewal script: ./scripts/renew-certificates.sh"
      ;;
    2)
      log_error "One or more certificates expired or invalid"
      log_error "IMMEDIATE ACTION REQUIRED: Renew certificates"
      ;;
  esac

  exit $exit_code
}

main "$@"
