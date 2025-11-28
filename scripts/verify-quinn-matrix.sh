#!/usr/bin/env bash
# Quick verification that Quinn Matrix setup is complete
# Devon 2025-11-27

echo "Quinn Matrix Setup Verification"
echo "================================"
echo ""

PASS=0
FAIL=0

# Check 1: Registration script exists
echo -n "✓ Registration script... "
if [ -f "/Users/annhoward/src/superalignment-chatroom/scripts/register-quinn-bot.sh" ]; then
    echo "PASS"
    ((PASS++))
else
    echo "FAIL"
    ((FAIL++))
fi

# Check 2: MCP config exists
echo -n "✓ MCP config... "
if [ -f "/Users/annhoward/src/superalignmenttoutopia/.claude/agents/mcp-configs/quinn.json" ]; then
    echo "PASS"
    ((PASS++))
else
    echo "FAIL"
    ((FAIL++))
fi

# Check 3: Agent definition exists
echo -n "✓ Agent definition... "
if [ -f "/Users/annhoward/src/superalignmenttoutopia/.claude/agents/quinn.md" ]; then
    echo "PASS"
    ((PASS++))
else
    echo "FAIL"
    ((FAIL++))
fi

# Check 4: matrix_server.py has quinn
echo -n "✓ matrix_server.py BOT_TOKENS... "
if grep -q '"quinn":' "/Users/annhoward/src/superalignment-chatroom/matrix-fastmcp-server/src/matrix_server.py" 2>/dev/null; then
    echo "PASS"
    ((PASS++))
else
    echo "FAIL"
    ((FAIL++))
fi

# Check 5: Environment token exists
echo -n "✓ MATRIX_TOKEN_QUINN in env... "
if grep -q "MATRIX_TOKEN_QUINN" ~/.superalignment-env 2>/dev/null; then
    source ~/.superalignment-env
    if [ -n "$MATRIX_TOKEN_QUINN" ]; then
        echo "PASS (token set)"
        ((PASS++))
    else
        echo "FAIL (token empty)"
        ((FAIL++))
    fi
else
    echo "FAIL (not in file)"
    ((FAIL++))
fi

# Check 6: Token loads in Python
echo -n "✓ Token loads in Python... "
if source ~/.superalignment-env && python3 -c "
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

env_path = Path.home() / '.superalignment-env'
load_dotenv(env_path)

token = os.getenv('MATRIX_TOKEN_QUINN', '')
if not token:
    sys.exit(1)
" 2>/dev/null; then
    echo "PASS"
    ((PASS++))
else
    echo "FAIL"
    ((FAIL++))
fi

echo ""
echo "================================"
echo "Results: $PASS passed, $FAIL failed"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "✅ Quinn Matrix setup is COMPLETE"
    echo ""
    echo "Next steps:"
    echo "1. Invite Quinn to Matrix channels (coordination, implementation, roadmap)"
    echo "2. Test DM from @lizthedeveloper:themultiverse.school"
    echo "3. Spawn Quinn: claude --agent quinn"
    exit 0
elif [ $FAIL -eq 1 ] && grep -q "MATRIX_TOKEN_QUINN" ~/.superalignment-env 2>/dev/null; then
    echo "⚠️  Setup mostly complete, just need Matrix token"
    echo ""
    echo "Run: ./scripts/setup-quinn-matrix.sh"
    exit 1
else
    echo "❌ Setup incomplete ($FAIL checks failed)"
    echo ""
    echo "Run: ./scripts/setup-quinn-matrix.sh"
    exit 1
fi
