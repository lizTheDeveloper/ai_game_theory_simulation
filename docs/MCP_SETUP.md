# MCP Server Setup

This project uses **Model Context Protocol (MCP)** servers to provide additional capabilities to Claude Code.

## Active MCP Servers

### 1. AI Safety YouTube Transcripts ✅

**Purpose:** Semantic search over YouTube AI safety transcripts (Robert Miles, AI Explained, AI @Species)

**Configuration:** `.mcp.json` in project root
```json
{
  "mcpServers": {
    "ai-safety-transcripts": {
      "command": "/Users/annhoward/src/superalignmenttoutopia/.venv/bin/python",
      "args": [
        "/Users/annhoward/src/superalignmenttoutopia/scripts/transcript-rag-server.py"
      ]
    }
  }
}
```

**Implementation:** fastMCP with stdio transport
- **File:** `scripts/transcript-rag-server.py`
- **Framework:** fastMCP 2.13+
- **Transport:** stdio (default for Claude Code)
- **Dependencies:** sentence-transformers, FAISS, SQLite

**Available Tools:**
- `search_transcripts_tool(query, top_k, channel)` - Semantic search with metadata
- `rag_query(query, top_k, channel, include_urls)` - Formatted context for LLM
- `list_channels_tool()` - List available YouTube channels
- `get_stats_tool()` - Index statistics (videos, chunks, vectors)

**Data:**
- **Database:** `research/embeddings/transcripts.db` (40MB)
- **FAISS Index:** `research/embeddings/youtube_transcripts.index` (8.1MB)
- **Channels:** robert-miles-ai-safety, ai-explained-official, ai-species
- **Last Updated:** Oct 28, 2025

### 2. arXiv Research Papers ✅

**Purpose:** Search and retrieve AI safety research papers from arXiv

**Configuration:** `.mcp.json` in project root
```json
{
  "mcpServers": {
    "arxiv": {
      "command": "uvx",
      "args": [
        "mcp-server-arxiv",
        "--storage-path",
        "/Users/annhoward/src/superalignmenttoutopia/research/papers"
      ]
    }
  }
}
```

**Implementation:** Official arXiv MCP server via uvx
- **Storage:** `research/papers/` directory
- **Package:** `mcp-server-arxiv` (installed via uvx)

## MCP Configuration Scopes (Claude Code)

Claude Code uses a **two-part configuration system** for MCP servers:

### Part 1: Define Servers (`.mcp.json`)

Define MCP servers in project root `.mcp.json`:
```json
{
  "mcpServers": {
    "ai-safety-transcripts": {
      "command": "/path/to/python",
      "args": ["/path/to/server.py"]
    }
  }
}
```

This file is checked into version control and shared with team.

### Part 2: Enable Servers (`~/.claude.json`)

Servers defined in `.mcp.json` must be **explicitly enabled** in `~/.claude.json`:

```bash
# Add to enabledMcpjsonServers array for your project
jq '.projects["/path/to/project"].enabledMcpjsonServers += ["ai-safety-transcripts"]' ~/.claude.json
```

Or manually edit `~/.claude.json`:
```json
{
  "projects": {
    "/Users/annhoward/src/superalignmenttoutopia": {
      "enabledMcpjsonServers": ["ai-safety-transcripts", "arxiv"],
      "disabledMcpjsonServers": []
    }
  }
}
```

**Restart Claude Code after enabling** to load the server.

### Alternative: Direct Configuration

You can also define servers directly in `~/.claude.json` under project's `mcpServers` (no enable step needed):

```json
{
  "projects": {
    "/path/to/project": {
      "mcpServers": {
        "chatroom": {
          "type": "stdio",
          "command": "node",
          "args": ["/path/to/server.js"]
        }
      }
    }
  }
}
```

## MCP Server Development

### Using fastMCP (Recommended)

fastMCP is the modern, Pythonic way to build MCP servers:

```python
from fastmcp import FastMCP

mcp = FastMCP("My Server")

@mcp.tool()
def my_tool(query: str, param: int = 5) -> str:
    """
    Tool description here.

    Args:
        query: Query description
        param: Parameter description

    Returns:
        Result description
    """
    # Tool logic
    return result

if __name__ == "__main__":
    mcp.run(transport="stdio")  # stdio for Claude Code
```

**Key advantages:**
- Simple decorator-based API (`@mcp.tool()`)
- Automatic schema generation from docstrings and type hints
- Built-in stdio transport (default for Claude Code)
- Much less boilerplate than raw MCP SDK

### Testing MCP Servers

```bash
# Install MCP inspector
npm install -g @modelcontextprotocol/inspector

# Test your server
npx @modelcontextprotocol/inspector python scripts/transcript-rag-server.py
```

### Debugging

MCP servers write to stderr (stdout is used for MCP protocol):

```python
print("Debug message", file=sys.stderr)  # ✅ Visible in logs
print("Normal output")                    # ❌ Breaks MCP protocol
```

## Resources

- **MCP Documentation:** https://docs.claude.com/en/docs/claude-code/mcp
- **fastMCP GitHub:** https://github.com/jlowin/fastmcp
- **MCP Python SDK:** https://github.com/modelcontextprotocol/python-sdk
- **MCP Inspector:** https://github.com/modelcontextprotocol/inspector

## Troubleshooting

### Server Not Showing Up

1. **Check if server is enabled:** Servers in `.mcp.json` must be added to `enabledMcpjsonServers` in `~/.claude.json`
   ```bash
   # Check current enabled servers
   jq '.projects["/Users/annhoward/src/superalignmenttoutopia"].enabledMcpjsonServers' ~/.claude.json

   # Enable your server
   jq '.projects["/Users/annhoward/src/superalignmenttoutopia"].enabledMcpjsonServers += ["ai-safety-transcripts"]' ~/.claude.json > ~/.claude.json.tmp && mv ~/.claude.json.tmp ~/.claude.json
   ```
2. **Check config format:** `.mcp.json` must be valid JSON in project root
3. **Check command path:** Absolute path to Python or uv
4. **Check args:** Script path (absolute or relative to project root)
5. **Restart Claude Code:** MCP servers are loaded on startup

### Server Crashes

1. **Check stderr logs:** Look for Python tracebacks
2. **Check dependencies:** `pip list` in project venv
3. **Check data files:** Ensure embeddings/database exist
4. **Test manually:** Run server script directly to see errors

### Performance Issues

1. **Lazy loading:** Initialize models only on first use
2. **Connection pooling:** Reuse database connections
3. **Caching:** Cache expensive operations (embedding, FAISS search)
4. **Async operations:** Use async/await for I/O-bound operations

## Maintenance

### Updating Transcript Index

```bash
# Sync transcripts from YouTube channels
bash scripts/sync-and-rebuild-embeddings.sh

# Or manual steps:
python scripts/build-transcript-embeddings-sqlite.py
```

### Installing New MCP Servers

```bash
# Add to .mcp.json
{
  "mcpServers": {
    "new-server": {
      "command": "python",
      "args": ["scripts/new-server.py"]
    }
  }
}

# Restart Claude Code to load
```

## Current Status

✅ **ai-safety-transcripts** - Enabled, using fastMCP + stdio (restart Claude Code to load)
✅ **arxiv** - Enabled, using uvx (restart Claude Code to load)
✅ **Embeddings current** - Updated Oct 28, 2025
✅ **Configuration valid** - `.mcp.json` in project root + both servers enabled in `~/.claude.json`
