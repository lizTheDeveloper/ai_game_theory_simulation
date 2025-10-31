# Zotero MCP with MLX Embeddings Setup Guide

## Overview

This guide explains how to use local MLX-based Qwen embeddings with Zotero MCP instead of the default sentence-transformers model.

## Current Status

✅ **Installed**: Zotero MCP is configured in both Claude Desktop and Claude Code
✅ **Working**: Default embedding model (sentence-transformers, all-MiniLM-L6-v2)
🚧 **Optional**: MLX-based embeddings (Qwen 0.6B) - requires setup

## Architecture

```
┌─────────────────┐
│ Zotero MCP      │
│ (expects OpenAI │
│  API format)    │
└────────┬────────┘
         │
         ↓
┌─────────────────────┐      ┌──────────────────────┐
│ OpenAI Wrapper      │ ───→ │ qwen3-embeddings-mlx │
│ (Port 8001)         │      │ (Port 8000)          │
│ Translates API      │      │ MLX-native Qwen      │
└─────────────────────┘      └──────────────────────┘
```

## Why MLX?

**Advantages:**
- 🚀 **Fast**: 44,000+ tokens/sec on Apple Silicon (0.6B model)
- 🔒 **Private**: 100% local, no data sent to cloud
- 💰 **Free**: No API costs
- 🎯 **Modern**: Qwen3-Embedding-0.6B (June 2025, top MTEB scores)

**Default (sentence-transformers) Comparison:**
- Model: all-MiniLM-L6-v2 (2020, 384-dim vectors)
- Speed: ~1,000 tokens/sec
- Quality: Good for general use

**MLX (Qwen 0.6B):**
- Model: Qwen3-Embedding-0.6B (2025, 1024-dim vectors)
- Speed: ~44,000 tokens/sec
- Quality: State-of-the-art multilingual embeddings

## Setup Options

### Option 1: Use Default (Current - No Setup Needed)

Already working! Uses sentence-transformers (all-MiniLM-L6-v2).

**Configuration (already set):**
```json
{
  "zotero": {
    "command": "/Users/annhoward/.local/bin/zotero-mcp",
    "env": {
      "ZOTERO_LOCAL": "true",
      "ZOTERO_EMBEDDING_MODEL": "default"
    }
  }
}
```

### Option 2: Use MLX via OpenAI-Compatible Wrapper (Recommended)

Uses the OpenAI-compatible wrapper to proxy requests to the MLX server.

#### Setup Steps

1. **Install qwen3-embeddings-mlx:**
   ```bash
   ./scripts/setup-mlx-embeddings.sh
   ```

2. **Start the MLX embedding server:**
   ```bash
   cd ~/src/qwen3-embeddings-mlx
   source .venv/bin/activate
   python server.py  # Runs on port 8000
   ```

3. **Start the OpenAI wrapper:**
   ```bash
   python scripts/mlx-openai-wrapper.py  # Runs on port 8001
   ```

4. **Update Zotero config to use MLX:**

   **For Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
   ```json
   {
     "zotero": {
       "command": "/Users/annhoward/.local/bin/zotero-mcp",
       "env": {
         "ZOTERO_LOCAL": "true",
         "ZOTERO_EMBEDDING_MODEL": "openai",
         "OPENAI_BASE_URL": "http://localhost:8001/v1",
         "OPENAI_API_KEY": "dummy",
         "OPENAI_EMBEDDING_MODEL": "small"
       }
     }
   }
   ```

   **For Claude Code** (`.mcp.json` in project):
   ```json
   {
     "zotero": {
       "command": "/Users/annhoward/.local/bin/zotero-mcp",
       "env": {
         "ZOTERO_LOCAL": "true",
         "ZOTERO_EMBEDDING_MODEL": "openai",
         "OPENAI_BASE_URL": "http://localhost:8001/v1",
         "OPENAI_API_KEY": "dummy",
         "OPENAI_EMBEDDING_MODEL": "small"
       }
     }
   }
   ```

5. **Restart Claude Desktop or Claude Code**

#### Model Selection

The wrapper supports three Qwen3 model sizes:

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| `small` (0.6B) | 900MB | 44K tok/s | Good | General use, fast responses |
| `medium` (4B) | ~6GB | 18K tok/s | Better | Balanced quality/speed |
| `large` (8B) | ~12GB | 11K tok/s | Best | Maximum quality |

Set via `OPENAI_EMBEDDING_MODEL` env var (default: `small`).

### Option 3: Fork Zotero-MCP for Native MLX Support (Advanced)

For native MLX support without a wrapper, you'd need to:
1. Fork https://github.com/54yyyu/zotero-mcp
2. Add MLX backend to `embedding_model.py`
3. Use `mlx-lm` package directly

**Example addition:**
```python
elif embedding_model == "mlx":
    from mlx_lm import load_model
    model = load_model("Qwen/Qwen3-Embedding-0.6B")
    # Implement embedding generation with MLX
```

## Configuration Files Reference

### Current Configurations

**Claude Desktop**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- ✅ Zotero configured (default embeddings)

**Claude Code (project)**: `/Users/annhoward/src/superalignmenttoutopia/.mcp.json`
- ✅ Zotero configured (default embeddings)

**Claude Code (user)**: `~/.claude.json`
- Not configured (21MB file, many other servers)

**Zotero MCP Settings**: `~/.config/zotero-mcp/config.json`
```json
{
  "semantic_search": {
    "embedding_model": "default",
    "update_config": {
      "auto_update": true,
      "update_frequency": "daily"
    },
    "extraction": {
      "pdf_max_pages": 100
    }
  }
}
```

## Troubleshooting

### MLX server won't start
- **Check Apple Silicon**: `uname -m` should return `arm64`
- **Install mlx-lm**: `uv pip install mlx-lm`
- **Check port**: Make sure port 8000 is available

### Wrapper errors
- **Check MLX server**: Visit http://localhost:8000/health
- **Check logs**: Wrapper logs requests/responses
- **Test directly**:
  ```bash
  curl -X POST http://localhost:8000/embed \
    -H "Content-Type: application/json" \
    -d '{"text": "test", "model": "small"}'
  ```

### Zotero can't connect
- **Check OPENAI_BASE_URL**: Must end with `/v1` (e.g., `http://localhost:8001/v1`)
- **Check API key**: Set any value (not validated for local server)
- **Restart Claude**: Required after config changes

## Performance Comparison

### Embedding Speed (Apple M2 Max)

| Backend | Model | Tokens/sec | Startup |
|---------|-------|------------|---------|
| Default | all-MiniLM-L6-v2 | ~1,000 | Instant |
| MLX | Qwen3-0.6B | ~44,000 | ~2s |
| MLX | Qwen3-4B | ~18,000 | ~5s |
| MLX | Qwen3-8B | ~11,000 | ~10s |
| OpenAI | text-embedding-3-small | N/A (cloud) | N/A |

### Embedding Quality (MTEB Benchmark)

| Model | Year | Dimensions | MTEB Score |
|-------|------|------------|------------|
| all-MiniLM-L6-v2 | 2020 | 384 | ~54 |
| Qwen3-Embedding-0.6B | 2025 | 1024 | ~64 |
| Qwen3-Embedding-8B | 2025 | 1024 | ~71 (SOTA) |
| OpenAI text-embedding-3-small | 2024 | 1536 | ~62 |

## References

- **Zotero MCP**: https://github.com/54yyyu/zotero-mcp
- **qwen3-embeddings-mlx**: https://github.com/jakedahn/qwen3-embeddings-mlx
- **Qwen3-Embedding**: https://github.com/QwenLM/Qwen3-Embedding
- **MLX**: https://github.com/ml-explore/mlx

## Next Steps

1. **Test default setup**: Verify Zotero works in Claude Code/Desktop
2. **Optional**: Run `./scripts/setup-mlx-embeddings.sh` to install MLX
3. **Benchmark**: Compare default vs MLX performance on your library
4. **Decide**: Keep default (simple) or use MLX (faster, better quality)
