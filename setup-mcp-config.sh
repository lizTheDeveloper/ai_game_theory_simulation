#!/bin/bash
set -e

echo "🔧 Setting up MCP configuration with relative paths..."

# Get the absolute path to the project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "📁 Project directory: $PROJECT_DIR"

# Create .claude directory if it doesn't exist
mkdir -p "$PROJECT_DIR/.claude"

# Generate MCP config with absolute paths (but will work for the current machine)
cat > "$PROJECT_DIR/.claude/mcp-config.json" <<EOF
{
  "mcpServers": {
    "ai-safety-transcripts": {
      "command": "$PROJECT_DIR/.venv/bin/python",
      "args": [
        "$PROJECT_DIR/scripts/transcript-rag-server.py"
      ],
      "env": {
        "PYTHONPATH": "$PROJECT_DIR"
      }
    },
    "pdf-rag": {
      "command": "$PROJECT_DIR/.venv/bin/python",
      "args": [
        "$PROJECT_DIR/scripts/pdf-rag-server.py"
      ],
      "env": {
        "PYTHONPATH": "$PROJECT_DIR"
      }
    },
    "agent-memory": {
      "command": "$PROJECT_DIR/.venv/bin/python",
      "args": [
        "$PROJECT_DIR/scripts/agent-memory-server.py"
      ],
      "env": {
        "PYTHONPATH": "$PROJECT_DIR"
      }
    },
    "chatroom": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "$PROJECT_DIR/.claude/chatroom"
      ],
      "env": {}
    },
    "playwright": {
      "command": "npx",
      "args": [
        "-y",
        "@playwright/mcp"
      ],
      "env": {}
    }
  }
}
EOF

echo "✅ MCP config created at: $PROJECT_DIR/.claude/mcp-config.json"
echo ""
echo "📋 Configured MCP servers:"
echo "  • ai-safety-transcripts (YouTube transcript RAG)"
echo "  • pdf-rag (PDF research RAG)"
echo "  • agent-memory (Agent memory system)"
echo "  • chatroom (Multi-agent coordination)"
echo "  • playwright (Browser automation)"
echo ""
echo "💡 To use this config, Claude Code will automatically detect it in .claude/"
echo "   No need to modify global settings!"
echo ""

# Also update the scripts/mcp-config.json to match
cp "$PROJECT_DIR/.claude/mcp-config.json" "$PROJECT_DIR/scripts/mcp-config.json"
echo "✅ Also updated scripts/mcp-config.json"
