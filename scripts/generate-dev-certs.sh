#!/bin/bash
#
# MARCUS 3.0 Citation Integrity Platform
# Generate Self-Signed Development Certificates
#
# Creates self-signed TLS certificates for local development.
# These certificates are NOT suitable for production use.
#
# Usage:
#   ./scripts/generate-dev-certs.sh
#
# Requirements:
#   - openssl
#   - (optional) mkcert for trusted local certificates
#
# Author: Marcus (Platform Engineer)
#

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================

CERTS_DIR="./certs"
CERT_FILE="$CERTS_DIR/dev-cert.pem"
KEY_FILE="$CERTS_DIR/dev-key.pem"
DAYS_VALID=365

# Certificate subject details
COUNTRY="US"
STATE="Development"
CITY="Localhost"
ORG="MARCUS Platform"
UNIT="Development"
COMMON_NAME="localhost"
SUBJECT="/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORG/OU=$UNIT/CN=$COMMON_NAME"

# Subject Alternative Names (SAN) for multi-domain support
SAN="DNS:localhost,DNS:*.localhost,IP:127.0.0.1,IP:0.0.0.0"

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

check_command() {
  if ! command -v "$1" &> /dev/null; then
    log_error "$1 not found. Please install $1."
    exit 1
  fi
}

# ============================================================================
# Certificate Generation
# ============================================================================

generate_openssl_cert() {
  log_info "Generating self-signed certificate with OpenSSL..."

  # Create OpenSSL config for SAN
  cat > "$CERTS_DIR/openssl.cnf" <<EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
C = $COUNTRY
ST = $STATE
L = $CITY
O = $ORG
OU = $UNIT
CN = $COMMON_NAME

[v3_req]
subjectAltName = $SAN
EOF

  # Generate private key
  openssl genrsa -out "$KEY_FILE" 2048 2>/dev/null

  # Generate certificate signing request (CSR)
  openssl req -new -key "$KEY_FILE" -out "$CERTS_DIR/dev-csr.pem" -config "$CERTS_DIR/openssl.cnf"

  # Generate self-signed certificate
  openssl x509 -req \
    -in "$CERTS_DIR/dev-csr.pem" \
    -signkey "$KEY_FILE" \
    -out "$CERT_FILE" \
    -days "$DAYS_VALID" \
    -extensions v3_req \
    -extfile "$CERTS_DIR/openssl.cnf" \
    2>/dev/null

  # Clean up temporary files
  rm -f "$CERTS_DIR/dev-csr.pem" "$CERTS_DIR/openssl.cnf"

  log_info "Certificate generated: $CERT_FILE"
  log_info "Private key generated: $KEY_FILE"
}

generate_mkcert() {
  log_info "Generating trusted local certificate with mkcert..."

  # Install local CA (if not already installed)
  mkcert -install

  # Generate certificate
  mkcert -cert-file "$CERT_FILE" -key-file "$KEY_FILE" localhost 127.0.0.1 ::1

  log_info "Trusted certificate generated: $CERT_FILE"
  log_info "Private key generated: $KEY_FILE"
}

verify_certificate() {
  log_info "Verifying certificate..."

  # Check certificate validity
  openssl x509 -in "$CERT_FILE" -noout -text | grep -A 2 "Validity"

  # Check SAN
  echo ""
  log_info "Subject Alternative Names:"
  openssl x509 -in "$CERT_FILE" -noout -text | grep -A 1 "Subject Alternative Name"

  echo ""
  log_info "Certificate fingerprint:"
  openssl x509 -in "$CERT_FILE" -noout -fingerprint -sha256
}

# ============================================================================
# Main
# ============================================================================

main() {
  echo "=========================================="
  echo "MARCUS Platform - Development Certificate"
  echo "=========================================="
  echo ""

  # Create certs directory
  mkdir -p "$CERTS_DIR"
  log_info "Created directory: $CERTS_DIR"

  # Check if certificates already exist
  if [ -f "$CERT_FILE" ] && [ -f "$KEY_FILE" ]; then
    log_warn "Certificates already exist:"
    log_warn "  - $CERT_FILE"
    log_warn "  - $KEY_FILE"
    echo ""
    read -p "Overwrite existing certificates? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      log_info "Skipping certificate generation."
      exit 0
    fi
  fi

  # Check if mkcert is available (preferred for trusted local certs)
  if command -v mkcert &> /dev/null; then
    echo ""
    read -p "Use mkcert for trusted local certificates? (Y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
      generate_mkcert
      verify_certificate
      exit 0
    fi
  else
    log_warn "mkcert not found. Using OpenSSL for self-signed certificate."
    log_warn "Install mkcert for trusted local certificates: https://github.com/FiloSottile/mkcert"
    echo ""
  fi

  # Generate with OpenSSL
  check_command openssl
  generate_openssl_cert
  verify_certificate

  echo ""
  log_info "Development certificates generated successfully!"
  echo ""
  log_warn "SECURITY WARNING:"
  log_warn "  - These certificates are for LOCAL DEVELOPMENT ONLY"
  log_warn "  - DO NOT use these in production"
  log_warn "  - DO NOT commit private keys to version control"
  echo ""
  log_info "Next steps:"
  log_info "  1. Add $CERTS_DIR to .gitignore"
  log_info "  2. Set TLS_CERT_PATH and TLS_KEY_PATH in .env"
  log_info "  3. Start server with TLS_ENABLED=true"
  echo ""
}

main "$@"
