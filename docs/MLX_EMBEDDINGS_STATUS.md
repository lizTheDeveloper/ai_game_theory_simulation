# MLX Embeddings Status

## ✅ Installation Complete (Local Mac)

**Date**: October 31, 2025

### What's Been Set Up

1. **MLX Embedding Server** (`qwen3-embeddings-mlx`)
   - Location: `~/src/qwen3-embeddings-mlx`
   - Model: Qwen3-Embedding-0.6B-4bit-DWQ (1024 dimensions)
   - Port: 8000
   - Status: ✅ Running (PID: 77121)
   - Performance: 44,000+ tokens/sec on Apple Silicon

2. **OpenAI-Compatible Wrapper**
   - Location: `scripts/mlx-openai-wrapper.py`
   - Port: 8001
   - Status: ✅ Running (PID: 85726)
   - Purpose: Translates OpenAI API format → MLX native format

3. **Zotero MCP Configuration**
   - Claude Code: ✅ Updated (`.mcp.json`)
   - Claude Desktop: ✅ Updated (`claude_desktop_config.json`)
   - Backend: MLX (via OpenAI-compatible wrapper)

### Current Configuration

Both Claude Code and Claude Desktop are configured to use:
```json
{
  "ZOTERO_EMBEDDING_MODEL": "openai",
  "OPENAI_BASE_URL": "http://localhost:8001/v1",
  "OPENAI_API_KEY": "dummy",
  "OPENAI_EMBEDDING_MODEL": "small"
}
```

### How to Use

**Start servers** (if not running):
```bash
./scripts/start-mlx-embeddings.sh
```

**Stop servers**:
```bash
./scripts/stop-mlx-embeddings.sh
```

**Monitor logs**:
```bash
tail -f /tmp/mlx-server.log    # MLX server
tail -f /tmp/mlx-wrapper.log   # OpenAI wrapper
```

**Check status**:
```bash
curl http://localhost:8000/health  # MLX server
curl http://localhost:8001/health  # Wrapper
```

### Performance Comparison

| Backend | Speed | Dimensions | Quality | Privacy |
|---------|-------|------------|---------|---------|
| **Default** | ~1K tok/s | 384 | Good | ✅ Local |
| **MLX** (current) | ~44K tok/s | 1024 | Better | ✅ Local |

### Architecture

```
Zotero MCP
    ↓
OpenAI Wrapper (port 8001)
    ↓ [translates API format]
MLX Server (port 8000)
    ↓
Qwen3-Embedding-0.6B (Apple MLX)
```

### Next Steps

1. **Restart Claude Desktop or Claude Code** to load new config
2. **Test Zotero MCP** - semantic search will use MLX embeddings
3. **Optional**: Try larger models:
   - Edit configs: `OPENAI_EMBEDDING_MODEL=medium` (4B, 18K tok/s)
   - Or: `OPENAI_EMBEDDING_MODEL=large` (8B, 11K tok/s)

### Files Created

- `docs/ZOTERO_MLX_SETUP.md` - Complete setup guide
- `scripts/setup-mlx-embeddings.sh` - Initial installation
- `scripts/mlx-openai-wrapper.py` - API translator
- `scripts/start-mlx-embeddings.sh` - Start servers
- `scripts/stop-mlx-embeddings.sh` - Stop servers
- `MLX_EMBEDDINGS_STATUS.md` - This file

### Troubleshooting

**Servers not starting?**
- Check Apple Silicon: `uname -m` → should be `arm64`
- Check ports: `lsof -i :8000` and `lsof -i :8001`

**Zotero not using MLX?**
- Verify servers running: `curl http://localhost:8001/health`
- Restart Claude after config changes
- Check logs: `/tmp/mlx-wrapper.log`

**Switch back to default?**
- Stop servers: `./scripts/stop-mlx-embeddings.sh`
- Edit configs: Change `ZOTERO_EMBEDDING_MODEL` to `"default"`
- Restart Claude

## ✅ Remote VM Deployment Complete

**Remote VM**: claude-workspace (europe-west10-a, x86_64)

Since the remote VM uses x86_64 architecture (not Apple Silicon), it's configured with **default embeddings** instead of MLX:

- ✅ **Zotero MCP v0.1.2** installed
- ✅ **Configuration**: `~/.claude.json` on remote
- ✅ **Embeddings**: Default (sentence-transformers, ~1,000 tok/s)
- ✅ **Ready to use**: Just SSH to remote and start Claude Code

**See**: `REMOTE_ZOTERO_SETUP.md` for complete remote setup details.

## Summary

Your local Mac is now configured with:
- ✅ Zotero MCP in both Claude Code and Claude Desktop
- ✅ MLX-powered embeddings (44x faster than default)
- ✅ Automatic startup scripts
- ✅ Complete documentation

**To use**: Just restart Claude Desktop or Claude Code. The servers are already running in the background.
