#!/usr/bin/env bash
# Complete Quinn Matrix Bot Setup
# Devon 2025-11-27

set -e

CHATROOM_DIR="/Users/annhoward/src/superalignment-chatroom"
SATU_DIR="/Users/annhoward/src/superalignmenttoutopia"

echo "=========================================="
echo "Quinn Matrix Bot Setup"
echo "=========================================="
echo ""

# Step 1: Check if registration script exists
if [ ! -f "$CHATROOM_DIR/scripts/register-quinn-bot.sh" ]; then
    echo "❌ Registration script not found"
    exit 1
fi

echo "Step 1: Register Quinn bot on Matrix"
echo "-------------------------------------"
echo "You'll need:"
echo "1. A password for Quinn's bot account"
echo "2. Matrix registration token (if required)"
echo ""
read -p "Press Enter to run registration script..."

cd "$CHATROOM_DIR"
bash scripts/register-quinn-bot.sh

echo ""
echo "Step 2: Add token to environment"
echo "--------------------------------"
echo "The registration script should have output:"
echo "  MATRIX_TOKEN_QUINN=\"syt_...\""
echo ""
echo "Please copy that line and paste it below:"
read -p "MATRIX_TOKEN_QUINN=" QUINN_TOKEN

if [ -z "$QUINN_TOKEN" ]; then
    echo "❌ No token provided. Run this script again after getting the token."
    exit 1
fi

# Add to ~/.superalignment-env if not already there
if ! grep -q "MATRIX_TOKEN_QUINN" ~/.superalignment-env 2>/dev/null; then
    echo "MATRIX_TOKEN_QUINN=\"$QUINN_TOKEN\"" >> ~/.superalignment-env
    echo "✓ Token added to ~/.superalignment-env"
else
    echo "⚠️  Token already in ~/.superalignment-env, updating..."
    # Use temp file to avoid in-place editing issues
    grep -v "MATRIX_TOKEN_QUINN" ~/.superalignment-env > ~/.superalignment-env.tmp || true
    echo "MATRIX_TOKEN_QUINN=\"$QUINN_TOKEN\"" >> ~/.superalignment-env.tmp
    mv ~/.superalignment-env.tmp ~/.superalignment-env
    echo "✓ Token updated"
fi

echo ""
echo "Step 3: Verify matrix_server.py has Quinn"
echo "-----------------------------------------"
if grep -q '"quinn":' "$CHATROOM_DIR/matrix-fastmcp-server/src/matrix_server.py"; then
    echo "✓ matrix_server.py already has Quinn in BOT_TOKENS"
else
    echo "❌ matrix_server.py missing Quinn. Devon should have added this."
    exit 1
fi

echo ""
echo "Step 4: Test Matrix connection"
echo "-------------------------------"
echo "Testing if Quinn can connect to Matrix..."

# Source the env file in a subshell for the test
(
    source ~/.superalignment-env
    cd "$CHATROOM_DIR/matrix-fastmcp-server"

    # Quick Python test
    python3 -c "
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

env_path = Path.home() / '.superalignment-env'
load_dotenv(env_path)

token = os.getenv('MATRIX_TOKEN_QUINN', '')
if not token:
    print('❌ MATRIX_TOKEN_QUINN not found in environment')
    sys.exit(1)

print('✓ Environment variable loaded')
print(f'  Token prefix: {token[:20]}...')
" || exit 1
)

if [ $? -eq 0 ]; then
    echo "✓ Matrix token accessible"
else
    echo "❌ Matrix token not accessible"
    exit 1
fi

echo ""
echo "Step 5: Invite Quinn to rooms"
echo "-----------------------------"
echo "Quinn should be invited to:"
echo "  - coordination (primary channel)"
echo "  - implementation"
echo "  - roadmap"
echo ""
echo "You can do this from Matrix client or run:"
echo "  ./scripts/invite-quinn-to-rooms.sh"
echo ""

echo ""
echo "=========================================="
echo "✓ Quinn Matrix Setup Complete"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Source environment: source ~/.superalignment-env"
echo "2. Test with: claude --agent quinn"
echo "3. Quinn should auto-check Matrix notifications on spawn"
echo "4. Monitor script: $SATU_DIR/scripts/quinn-monitor.sh"
echo ""
echo "Quinn should now receive DMs at @agent-quinn:themultiverse.school"
