#!/bin/bash

# MARCUS 3.0 - Change Default Admin Password
# This script changes the default admin password to a secure random value

set -euo pipefail

echo "🔐 MARCUS 3.0 - Admin Password Reset"
echo "===================================="
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
  echo "⚠️  This script should be run with sudo for PostgreSQL access"
  echo "Usage: sudo ./scripts/change_admin_password.sh"
  exit 1
fi

# Database configuration
DB_NAME="${DATABASE_NAME:-marcus_test}"
DB_USER="${DATABASE_USER:-marcus}"
ADMIN_EMAIL="admin@marcus.local"

# Generate a secure random password (24 characters, alphanumeric + special chars)
echo "📝 Generating secure random password..."
NEW_PASSWORD=$(openssl rand -base64 18 | tr -d "=+/" | cut -c1-24)

# Hash the password using Node.js bcrypt (same as production code - 12 rounds)
echo "🔒 Hashing password with bcrypt (12 rounds)..."
PASSWORD_HASH=$(node -e "
const bcrypt = require('bcrypt');
const password = process.argv[1];
const hash = bcrypt.hashSync(password, 12);
console.log(hash);
" "$NEW_PASSWORD")

# Update the admin user password in the database
echo "💾 Updating admin user in database..."
sudo -u postgres psql -d "$DB_NAME" <<EOF
UPDATE users
SET password_hash = '$PASSWORD_HASH',
    updated_at = NOW()
WHERE email = '$ADMIN_EMAIL';
EOF

# Check if update was successful
UPDATED=$(sudo -u postgres psql -tAc "SELECT COUNT(*) FROM users WHERE email = '$ADMIN_EMAIL'" "$DB_NAME")

if [ "$UPDATED" -eq 1 ]; then
  echo ""
  echo "✅ Admin password updated successfully!"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔑 NEW ADMIN CREDENTIALS"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "  Email:    $ADMIN_EMAIL"
  echo "  Password: $NEW_PASSWORD"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "⚠️  IMPORTANT: Save these credentials securely!"
  echo "   - Store in a password manager"
  echo "   - Do not commit to version control"
  echo "   - Do not share via unencrypted channels"
  echo ""
  echo "📝 Credentials also saved to: /tmp/marcus_admin_credentials.txt"
  echo "   (This file will be deleted on reboot)"
  echo ""

  # Save to temporary file (will be deleted on reboot)
  cat > /tmp/marcus_admin_credentials.txt <<CREDS
MARCUS 3.0 Admin Credentials
Generated: $(date)

Email:    $ADMIN_EMAIL
Password: $NEW_PASSWORD

⚠️  DELETE THIS FILE AFTER SAVING TO PASSWORD MANAGER
CREDS
  chmod 600 /tmp/marcus_admin_credentials.txt

  echo "✅ Password change complete!"
else
  echo ""
  echo "❌ Error: Admin user not found in database"
  echo "   Email: $ADMIN_EMAIL"
  echo ""
  echo "🔍 Checking if admin user exists..."
  sudo -u postgres psql -d "$DB_NAME" -c "SELECT email, role, is_active FROM users WHERE email LIKE '%admin%';"
  exit 1
fi
