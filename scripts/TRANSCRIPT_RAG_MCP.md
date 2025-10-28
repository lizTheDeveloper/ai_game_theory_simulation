# Transcript RAG MCP Server

A lightweight **MCP (Model Context Protocol) server** that provides RAG (Retrieval-Augmented Generation) capabilities for YouTube transcript embeddings.

## What It Does

The MCP server exposes 4 tools that let Claude Desktop (or any MCP-compatible tool) search and retrieve context from YouTube transcripts:

1. **`search_transcripts`** - Semantic search that returns JSON results
2. **`rag_query`** - Returns formatted context ready for LLM consumption
3. **`list_channels`** - List all indexed channels with video counts
4. **`get_stats`** - Get index statistics (videos, chunks, etc.)

## Quick Start

### 1. Install the Server

The server is already installed with the Python virtual environment:

```bash
# Verify MCP is installed
source .venv/bin/activate
python -c "import mcp; print('MCP OK')"
```

### 2. Add to Claude Desktop

Add this to your Claude Desktop MCP configuration:

**Location:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "transcript-rag": {
      "command": "/Users/annhoward/src/superalignmenttoutopia/.venv/bin/python",
      "args": [
        "/Users/annhoward/src/superalignmenttoutopia/scripts/transcript-rag-server.py"
      ]
    }
  }
}
```

**Or copy from:** `scripts/mcp-config.json`

### 3. Restart Claude Desktop

The server will auto-start when Claude Desktop launches.

### 4. Use in Conversations

Ask Claude to search transcripts:

```
Can you search the transcripts for information about mesa-optimization?
```

Claude will use the `rag_query` tool to retrieve context and answer your question.

---

## MCP Tools Reference

### 1. `search_transcripts`

**Description:** Semantic search that returns raw JSON results.

**Parameters:**
- `query` (string, required): Search query
- `top_k` (integer, default: 5): Number of results
- `channel` (string, optional): Filter by channel

**Example:**
```json
{
  "query": "deceptive alignment",
  "top_k": 3,
  "channel": "robert-miles-ai-safety"
}
```

**Returns:** JSON array of results with:
- `chunk_text`: The transcript text
- `similarity`: Similarity score (0-1)
- `title`: Video title
- `channel`: Channel name
- `url`: Video URL
- `chunk_index`: Position in video
- `total_chunks`: Total chunks in video

---

### 2. `rag_query`

**Description:** Retrieval-Augmented Generation query. Returns formatted context for LLM.

**Parameters:**
- `query` (string, required): Question or topic
- `top_k` (integer, default: 5): Number of context chunks
- `channel` (string, optional): Filter by channel
- `include_urls` (boolean, default: true): Include video URLs

**Example:**
```json
{
  "query": "What are mesa-optimizers and how do they relate to inner alignment?",
  "top_k": 5,
  "include_urls": true
}
```

**Returns:** Formatted markdown context:

```markdown
# Context from YouTube Transcripts

Query: What are mesa-optimizers...
Found 5 relevant segments:

## Source 1: The OTHER AI Alignment Problem: Mesa-Optimizers and Inner Alignment
Channel: robert-miles-ai-safety
Video: https://www.youtube.com/watch?v=...
Chunk 35/37
Similarity: 70%

[transcript text here]

---

## Source 2: [next result]
...
```

This context is ready to be used by an LLM to answer the original question.

---

### 3. `list_channels`

**Description:** List all indexed channels.

**Parameters:** None

**Returns:** JSON array:
```json
[
  {
    "channel": "robert-miles-ai-safety",
    "video_count": 44
  },
  {
    "channel": "species-agi-youtube",
    "video_count": 18
  }
]
```

---

### 4. `get_stats`

**Description:** Get index statistics.

**Parameters:** None

**Returns:** JSON object:
```json
{
  "videos": 80,
  "chunks": 2299,
  "faiss_vectors": 2299,
  "channels": [
    {"channel": "robert-miles-ai-safety", "video_count": 44},
    {"channel": "species-agi-youtube", "video_count": 18}
  ]
}
```

---

## Usage Examples

### Example 1: Basic RAG Query

**User:** "What does Robert Miles say about deceptive alignment?"

**Claude:** Uses `rag_query` tool:
```json
{
  "query": "deceptive alignment",
  "top_k": 5,
  "channel": "robert-miles-ai-safety"
}
```

Gets formatted context and answers based on retrieved transcript segments.

---

### Example 2: Search Specific Topic

**User:** "Find all mentions of instrumental convergence in the transcripts"

**Claude:** Uses `search_transcripts` tool:
```json
{
  "query": "instrumental convergence",
  "top_k": 10
}
```

Returns JSON results showing where instrumental convergence is discussed across all videos.

---

### Example 3: Channel Exploration

**User:** "What channels do we have transcripts for?"

**Claude:** Uses `list_channels` tool to show all indexed channels.

---

### Example 4: Multi-Step Research

**User:** "Compare what Robert Miles and AI Species say about AGI timelines"

**Claude:**
1. Uses `rag_query` with `channel: robert-miles-ai-safety` and `query: AGI timelines`
2. Uses `rag_query` with `channel: species-agi-youtube` and `query: AGI timelines`
3. Compares the retrieved contexts and synthesizes an answer

---

## Technical Details

### How It Works

1. **Query Processing:** Converts text query to 384-dim embedding using Sentence-Transformers
2. **FAISS Search:** Fast similarity search across 2000+ embedded chunks
3. **SQLite Retrieval:** Fetches full chunk text and metadata from database
4. **Context Formatting:** Formats results as markdown for LLM consumption

### Performance

- **Query latency:** < 200ms (100ms encode + <1ms FAISS + ~50ms SQLite)
- **Memory usage:** ~400 MB (model + index loaded)
- **Startup time:** ~2-3 seconds (first query loads model)

### Dependencies

- **FAISS:** Fast vector similarity search
- **Sentence-Transformers:** Embedding model (all-MiniLM-L6-v2)
- **SQLite3:** Metadata storage
- **MCP Python SDK:** MCP server framework

---

## Troubleshooting

### Server Not Starting

Check Claude Desktop logs:
```bash
tail -f ~/Library/Logs/Claude/mcp*.log
```

Look for errors related to `transcript-rag` server.

### Test Server Directly

```bash
# Activate virtual environment
source .venv/bin/activate

# Test server
python scripts/transcript-rag-server.py
```

Should print: `Starting Transcript RAG MCP Server...`

Press Ctrl+C to stop (it waits for MCP stdio connections).

### Database Not Found

Ensure embeddings are built:
```bash
source .venv/bin/activate
python scripts/build-transcript-embeddings-sqlite.py
```

This creates `research/embeddings/transcripts.db`.

### Model Loading Slow

First query will be slow (~2-3 seconds) while model loads. Subsequent queries are fast.

---

## Integration with Research

### Use Cases

**1. Parameter Discovery**
```
Search transcripts for "AI capability doubling time" to find timeline estimates
```

**2. Mechanism Validation**
```
What does Robert Miles say about sandbagging and benchmark gaming?
```

**3. Citation Finding**
```
Find the video where Robert Miles explains mesa-optimizers
```

**4. Cross-Reference Research**
```
Compare perspectives on AI alignment difficulty across channels
```

**5. Literature Review**
```
Summarize all discussions of instrumental convergence in the transcripts
```

### Workflow Example

1. You're implementing a simulation mechanic for "deceptive alignment"
2. Ask Claude: "What does the research say about deceptive alignment?"
3. Claude uses `rag_query` to retrieve context from transcripts
4. Claude synthesizes answer with video URLs for citations
5. You watch the videos to get full context
6. You implement the mechanic with research-backed parameters

---

## Advanced Usage

### Custom Queries via Python

```python
import sys
sys.path.append('/Users/annhoward/src/superalignmenttoutopia')

from scripts.transcript_rag_server import search_transcripts, format_rag_context

# Search
results = search_transcripts("mesa-optimization", top_k=5)

# Get formatted context
context = format_rag_context("mesa-optimization", results)
print(context)
```

### Channel-Specific Research

Focus on specific channels:

```
# Robert Miles (technical AI safety)
python scripts/search-transcripts-sqlite.py "channel:robert-miles-ai-safety mesa-optimizer"

# AI Species (timeline scenarios)
python scripts/search-transcripts-sqlite.py "channel:species-agi-youtube AGI 2027"
```

---

## Updating the Index

When new transcripts are added (via daily scheduler or manual sync):

```bash
# Rebuild embeddings
bash scripts/sync-and-rebuild-embeddings.sh
```

The MCP server will automatically use the updated index on next query.

---

## Architecture

```
Claude Desktop
    ↓
MCP Protocol (JSON-RPC over stdio)
    ↓
transcript-rag-server.py
    ↓
┌─────────────────────────────────┐
│ 1. Encode query                 │
│    sentence-transformers        │
│    (384-dim embedding)          │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ 2. FAISS similarity search      │
│    youtube_transcripts.index    │
│    (2299 vectors)               │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ 3. Retrieve metadata            │
│    transcripts.db (SQLite)      │
│    (chunk text, video info)     │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ 4. Format context               │
│    Markdown with citations      │
└─────────────────────────────────┘
    ↓
Return to Claude Desktop
```

---

## Comparison: MCP Server vs CLI Search

### MCP Server (This)
- ✅ Integrated in Claude Desktop conversations
- ✅ RAG context automatically formatted
- ✅ Multi-step queries seamless
- ✅ No manual copy-paste

### CLI Search (`search-transcripts-sqlite.py`)
- ✅ Direct command-line access
- ✅ Scriptable for automation
- ✅ Faster for one-off searches
- ❌ Manual context extraction

**Use MCP server** for conversational research with Claude.
**Use CLI search** for quick lookups and scripting.

---

## Related Documentation

- `research/embeddings/README.md` - Embeddings system details
- `scripts/TRANSCRIPT_AUTOMATION.md` - Daily scheduler documentation
- `research/youtube-channels/README.md` - Channel management

---

## Future Improvements

### 1. Hybrid Search
Combine dense (FAISS) + sparse (BM25) retrieval for better recall.

### 2. Context Window Expansion
Return surrounding chunks for fuller context.

### 3. Multi-Query Retrieval
Ask multiple queries, merge results for comprehensive context.

### 4. Citation Formatting
Structured citations with video URLs and timestamps.

### 5. Streaming Responses
Stream results as they're found (for large queries).

---

## Security & Privacy

- **All local:** No external APIs, everything runs on your machine
- **No tracking:** No telemetry or usage logging
- **Private data:** Transcripts never leave your computer
- **MCP isolation:** Server runs in isolated process, no file system access beyond project directory

---

## MCP Server Benefits

Why use MCP instead of direct Python imports:

1. **Process Isolation:** Server runs separately from Claude Desktop
2. **Language Agnostic:** Could rewrite in Rust/Go without changing interface
3. **Versioning:** MCP protocol ensures compatibility
4. **Multiple Clients:** Same server can serve Claude Desktop, CLI tools, web apps
5. **Standard Protocol:** MCP is becoming standard for AI tool integration

---

## Support

If RAG queries aren't working:

1. Check MCP server status in Claude Desktop logs
2. Test server directly: `python scripts/transcript-rag-server.py`
3. Verify database exists: `ls -lh research/embeddings/transcripts.db`
4. Rebuild index: `bash scripts/sync-and-rebuild-embeddings.sh`
5. Check MCP config: `cat ~/Library/Application\ Support/Claude/claude_desktop_config.json`

For Python errors:
- Ensure virtual environment active: `source .venv/bin/activate`
- Check dependencies: `pip list | grep mcp`
- Reinstall if needed: `pip install --upgrade mcp`
