#!/bin/bash

# MARCUS 3.0 - Generate Production JWT Secrets
# This script generates cryptographically secure JWT secrets for production use

set -euo pipefail

echo "🔐 MARCUS 3.0 - JWT Secrets Generator"
echo "====================================="
echo ""

# Check if .env file exists
ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Error: .env file not found"
  echo "   Expected location: $ENV_FILE"
  echo ""
  echo "💡 Creating .env file from template..."

  # Check if .env.example exists
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "✅ Created .env from .env.example"
  else
    echo "❌ No .env.example found. Please create .env manually."
    exit 1
  fi
fi

# Generate secure random secrets (256-bit = 32 bytes = 64 hex characters)
echo "🔑 Generating cryptographically secure JWT secrets..."
echo "   Using: openssl rand -hex 32 (256-bit)"
echo ""

JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)

echo "✅ Secrets generated successfully!"
echo ""

# Check if secrets are already set in .env
if grep -q "^JWT_SECRET=" "$ENV_FILE" 2>/dev/null; then
  echo "⚠️  JWT_SECRET already exists in .env"
  read -p "   Overwrite with new secret? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted. Keeping existing JWT_SECRET."
    exit 0
  fi
  # Remove existing JWT_SECRET
  sed -i.bak '/^JWT_SECRET=/d' "$ENV_FILE"
fi

if grep -q "^JWT_REFRESH_SECRET=" "$ENV_FILE" 2>/dev/null; then
  echo "⚠️  JWT_REFRESH_SECRET already exists in .env"
  read -p "   Overwrite with new secret? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted. Keeping existing JWT_REFRESH_SECRET."
    exit 0
  fi
  # Remove existing JWT_REFRESH_SECRET
  sed -i.bak '/^JWT_REFRESH_SECRET=/d' "$ENV_FILE"
fi

# Add new secrets to .env
echo "" >> "$ENV_FILE"
echo "# JWT Secrets (Generated: $(date))" >> "$ENV_FILE"
echo "JWT_SECRET=$JWT_SECRET" >> "$ENV_FILE"
echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET" >> "$ENV_FILE"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ JWT SECRETS CONFIGURED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  JWT_SECRET:         $JWT_SECRET"
echo "  JWT_REFRESH_SECRET: $JWT_REFRESH_SECRET"
echo ""
echo "📝 Secrets saved to: $ENV_FILE"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANT SECURITY NOTES:"
echo ""
echo "  1. ✅ Secrets are 256-bit (64 hex characters)"
echo "  2. ✅ Cryptographically secure random generation"
echo "  3. ⚠️  .env file should NOT be committed to git"
echo "  4. ⚠️  Backup .env file securely (encrypted)"
echo "  5. ⚠️  Restart MARCUS service for changes to take effect:"
echo ""
echo "     sudo systemctl restart marcus-platform"
echo ""
echo "  6. 🔒 Changing these secrets will:"
echo "     - Invalidate all existing JWT tokens"
echo "     - Force all users to log in again"
echo "     - Clear all active sessions"
echo ""

# Check if backup was created
if [ -f "${ENV_FILE}.bak" ]; then
  echo "📦 Backup created: ${ENV_FILE}.bak"
  echo ""
fi

echo "✅ JWT secrets generation complete!"
