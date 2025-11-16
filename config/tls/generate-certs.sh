#!/bin/bash
# ============================================================================
# TLS Certificate Generation Script
# ============================================================================
# Generates self-signed certificates for development
# For production, use Let's Encrypt or a proper CA
#
# Usage: ./generate-certs.sh
# ============================================================================

set -euo pipefail

CERT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOMAIN="${DOMAIN:-api.citation-platform.local}"
DAYS_VALID="${DAYS_VALID:-365}"

echo "🔐 Generating TLS certificates for ${DOMAIN}"

# Create directory if it doesn't exist
mkdir -p "${CERT_DIR}"

# Generate private key
openssl genrsa -out "${CERT_DIR}/server.key" 2048

# Generate certificate signing request
openssl req -new -key "${CERT_DIR}/server.key" -out "${CERT_DIR}/server.csr" -subj "/C=US/ST=CA/L=SF/O=CitationPlatform/CN=${DOMAIN}"

# Generate self-signed certificate
openssl x509 -req -days "${DAYS_VALID}" -in "${CERT_DIR}/server.csr" -signkey "${CERT_DIR}/server.key" -out "${CERT_DIR}/server.crt"

# Generate DH params (for stronger security)
openssl dhparam -out "${CERT_DIR}/dhparam.pem" 2048

# Set proper permissions
chmod 600 "${CERT_DIR}/server.key"
chmod 644 "${CERT_DIR}/server.crt"

echo "✅ Certificates generated successfully:"
echo "   Private key: ${CERT_DIR}/server.key"
echo "   Certificate: ${CERT_DIR}/server.crt"
echo "   CSR: ${CERT_DIR}/server.csr"
echo "   DH params: ${CERT_DIR}/dhparam.pem"
echo ""
echo "⚠️  WARNING: These are self-signed certificates for DEVELOPMENT ONLY"
echo "   For production, use Let's Encrypt or a trusted CA"
