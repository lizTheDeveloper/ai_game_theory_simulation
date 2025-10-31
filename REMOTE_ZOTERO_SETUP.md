# Remote Zotero Setup Complete

**Date**: October 31, 2025
**Remote VM**: claude-workspace (europe-west10-a)

## ✅ Installation Complete

### What Was Installed

1. **uv Package Manager** - Installed to `~/.local/bin/uv`
2. **Zotero MCP v0.1.2** - Installed via uv tool
3. **168 Python Packages** - Including PyTorch, sentence-transformers, chromadb
4. **Configuration** - Added to `~/.claude.json`

### Remote System Details

- **OS**: Ubuntu 22.04 LTS (Linux 6.8.0-1042-gcp)
- **Architecture**: x86_64 (Intel/AMD, not Apple Silicon)
- **Python**: 3.11.14
- **Location**: `lizthedeveloper_gmail_com@claude-workspace`

### Configuration

**File**: `~/.claude.json` (on remote)

```json
{
  "mcpServers": {
    "zotero": {
      "command": "/home/lizthedeveloper_gmail_com/.local/bin/zotero-mcp",
      "env": {
        "ZOTERO_LOCAL": "true",
        "ZOTERO_EMBEDDING_MODEL": "default"
      }
    }
  }
}
```

**Embedding Backend**: Default (sentence-transformers, all-MiniLM-L6-v2)

### Why Default Embeddings?

The remote VM uses x86_64 architecture (standard Intel/AMD). **MLX only works on Apple Silicon** (M1/M2/M3/M4), so we configured it with the default sentence-transformers backend instead.

**Performance on x86_64:**
- Speed: ~1,000 tokens/sec (good for most use cases)
- Model: all-MiniLM-L6-v2 (384 dimensions)
- Memory: ~500MB
- Privacy: ✅ 100% local processing

## How to Use

### 1. Connect to Remote VM

```bash
gcloud compute ssh claude-workspace --zone=europe-west10-a
```

### 2. Start Claude Code

```bash
claude
```

### 3. Verify Zotero MCP

In Claude Code, check available MCP servers:
```bash
/mcp
```

You should see Zotero MCP listed.

### 4. Test Zotero

Try using Zotero tools:
- `zotero_search` - Search your library
- `zotero_semantic_search` - AI-powered semantic search
- `zotero_get_item` - Get item details

## Syncing Your Zotero Library

**Option 1: Use Zotero Web API** (Recommended for remote)

1. Get your Zotero API key:
   - Visit https://www.zotero.org/settings/keys
   - Create a new key with read access

2. Update remote config:
   ```bash
   # On remote VM
   ~/.local/bin/zotero-mcp setup
   # Choose "web" instead of "local"
   # Enter your API key and library ID
   ```

**Option 2: Sync Zotero Data Directory**

If you want to use local Zotero data on the remote:

```bash
# From local machine
rsync -av ~/Zotero/ claude-workspace:~/Zotero/

# Then on remote, update zotero.sqlite path if needed
```

## Commands Reference

### On Remote VM

```bash
# Check zotero-mcp version
~/.local/bin/zotero-mcp version

# Update semantic search database
~/.local/bin/zotero-mcp update-db

# Check database status
~/.local/bin/zotero-mcp db-status

# Re-run setup (if needed)
~/.local/bin/zotero-mcp setup
```

### From Local Machine

```bash
# SSH to remote
gcloud compute ssh claude-workspace --zone=europe-west10-a

# Copy files to remote
gcloud compute scp local-file.txt claude-workspace:~/

# Copy files from remote
gcloud compute scp claude-workspace:~/remote-file.txt ./
```

## Troubleshooting

### Zotero MCP Not Working

1. **Check if installed**:
   ```bash
   ~/.local/bin/zotero-mcp version
   ```

2. **Check config**:
   ```bash
   python3 -c "import json; print(json.dumps(json.load(open('~/.claude.json'))['mcpServers'], indent=2))"
   ```

3. **Restart Claude Code** after any config changes

### Semantic Search Issues

The embedding model (~500MB) downloads on first use:
```bash
# Update database (triggers model download)
~/.local/bin/zotero-mcp update-db
```

### Connection to Zotero

Make sure you're using the correct mode:
- **Local mode**: Requires Zotero desktop app running + local API enabled
- **Web mode**: Requires API key from https://www.zotero.org/settings/keys

## Files Created

**On Remote**:
- `~/.local/bin/zotero-mcp` - Main executable
- `~/.local/share/uv/tools/zotero-mcp/` - Installation directory
- `~/.claude.json` - Configuration file (updated)
- `~/.claude.json.backup` - Backup of original config
- `~/.config/zotero-mcp/config.json` - Zotero-specific settings
- `~/setup-zotero.sh` - Setup script
- `~/add-zotero-to-claude-json.sh` - Config update script

**On Local**:
- `/tmp/setup-zotero-remote.sh` - Setup script (temp)
- `/tmp/add-zotero-to-claude-json.sh` - Config script (temp)

## Comparison: Local vs Remote

| Feature | Local Mac | Remote VM |
|---------|-----------|-----------|
| **Architecture** | Apple Silicon (arm64) | x86_64 (Intel/AMD) |
| **Zotero MCP** | ✅ v0.1.2 | ✅ v0.1.2 |
| **Embeddings** | MLX (Qwen 0.6B) | Default (sentence-transformers) |
| **Speed** | 44,000 tok/s | ~1,000 tok/s |
| **Dimensions** | 1024 | 384 |
| **Memory** | ~900 MB | ~500 MB |
| **Privacy** | ✅ Local | ✅ Local |

Both setups provide full Zotero integration with Claude Code!

## Next Steps

1. **Sync your Zotero library** to the remote VM (web API or data sync)
2. **Test Zotero MCP** in Claude Code on the remote
3. **Optional**: Set up web API mode for easier remote access

## Support

- **Zotero MCP Docs**: https://github.com/54yyyu/zotero-mcp
- **Claude Code Docs**: https://docs.claude.com/en/docs/claude-code
- **Zotero API Docs**: https://www.zotero.org/support/dev/web_api/v3/start

---

**Summary**: Remote claude-workspace VM now has Zotero MCP configured with default embeddings. Ready to use with Claude Code on the remote!
