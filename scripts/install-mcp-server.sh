#!/bin/bash
#
# Install Transcript RAG MCP Server for Claude Desktop
#

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

CLAUDE_CONFIG="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
MCP_CONFIG="$SCRIPT_DIR/mcp-config.json"
SERVER_SCRIPT="$SCRIPT_DIR/transcript-rag-server.py"

echo "=========================================="
echo "Installing Transcript RAG MCP Server"
echo "=========================================="
echo ""

# Step 1: Verify files exist
echo "Step 1: Verifying files..."

if [ ! -f "$SERVER_SCRIPT" ]; then
    echo -e "${RED}❌ Error: Server script not found at $SERVER_SCRIPT${NC}"
    exit 1
fi

if [ ! -f "$MCP_CONFIG" ]; then
    echo -e "${RED}❌ Error: MCP config not found at $MCP_CONFIG${NC}"
    exit 1
fi

if [ ! -f "$PROJECT_ROOT/research/embeddings/transcripts.db" ]; then
    echo -e "${YELLOW}⚠️  Warning: Database not found${NC}"
    echo "   Run: bash scripts/sync-and-rebuild-embeddings.sh"
    echo ""
fi

echo "✓ Files verified"
echo ""

# Step 2: Check Python virtual environment
echo "Step 2: Checking Python environment..."

if [ ! -d "$PROJECT_ROOT/.venv" ]; then
    echo -e "${RED}❌ Error: Virtual environment not found${NC}"
    echo "   Create it with: python3 -m venv .venv"
    exit 1
fi

# Check if MCP is installed
if ! "$PROJECT_ROOT/.venv/bin/python" -c "import mcp" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  MCP not installed, installing...${NC}"
    "$PROJECT_ROOT/.venv/bin/pip" install mcp
fi

echo "✓ Python environment ready"
echo ""

# Step 3: Backup existing Claude config
echo "Step 3: Backing up Claude config..."

if [ -f "$CLAUDE_CONFIG" ]; then
    BACKUP="$CLAUDE_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$CLAUDE_CONFIG" "$BACKUP"
    echo "✓ Backup created: $BACKUP"
else
    echo "  No existing config found (will create new)"
    mkdir -p "$(dirname "$CLAUDE_CONFIG")"
fi

echo ""

# Step 4: Update Claude config
echo "Step 4: Updating Claude Desktop configuration..."

# Read MCP config template
MCP_SERVER_CONFIG=$(cat "$MCP_CONFIG" | jq -r '.mcpServers."transcript-rag"')

# Check if Claude config exists and has mcpServers
if [ -f "$CLAUDE_CONFIG" ]; then
    # Merge with existing config
    TEMP_CONFIG=$(mktemp)

    # Check if mcpServers exists
    if cat "$CLAUDE_CONFIG" | jq -e '.mcpServers' > /dev/null 2>&1; then
        # Add to existing mcpServers
        jq --argjson server "$MCP_SERVER_CONFIG" \
           '.mcpServers."transcript-rag" = $server' \
           "$CLAUDE_CONFIG" > "$TEMP_CONFIG"
    else
        # Create mcpServers section
        jq --argjson servers "$(cat "$MCP_CONFIG" | jq '.mcpServers')" \
           '. + {mcpServers: $servers}' \
           "$CLAUDE_CONFIG" > "$TEMP_CONFIG"
    fi

    mv "$TEMP_CONFIG" "$CLAUDE_CONFIG"
    echo "✓ Updated existing configuration"
else
    # Create new config
    cp "$MCP_CONFIG" "$CLAUDE_CONFIG"
    echo "✓ Created new configuration"
fi

echo ""

# Step 5: Verify installation
echo "Step 5: Verifying installation..."

if cat "$CLAUDE_CONFIG" | jq -e '.mcpServers."transcript-rag"' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Installation successful!${NC}"
    echo ""
    echo "Server configuration:"
    cat "$CLAUDE_CONFIG" | jq '.mcpServers."transcript-rag"'
else
    echo -e "${RED}❌ Installation verification failed${NC}"
    exit 1
fi

echo ""
echo "=========================================="
echo "Next Steps"
echo "=========================================="
echo ""
echo "1. Restart Claude Desktop to load the MCP server"
echo ""
echo "2. In Claude Desktop, ask:"
echo "   \"Can you search the transcripts for information about mesa-optimization?\""
echo ""
echo "3. Claude will use the MCP server to retrieve context"
echo ""
echo "Documentation:"
echo "  - Full guide: scripts/TRANSCRIPT_RAG_MCP.md"
echo "  - Test server: python scripts/transcript-rag-server.py"
echo ""
echo "Troubleshooting:"
echo "  - Check logs: ~/Library/Logs/Claude/mcp*.log"
echo "  - Rebuild index: bash scripts/sync-and-rebuild-embeddings.sh"
echo "  - Config location: $CLAUDE_CONFIG"
echo ""
