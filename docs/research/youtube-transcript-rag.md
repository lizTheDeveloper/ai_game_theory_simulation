# YouTube Transcript RAG System

**Status:** ✅ Production (October 28, 2025)
**Type:** Research Tool
**Integration:** MCP Server + CLI + Daily Automation

---

## Overview

An automated **Retrieval-Augmented Generation (RAG) system** for AI safety research that provides semantic search across YouTube transcripts from AI safety researchers. The system combines FAISS vector embeddings, SQLite metadata storage, automated daily updates, and integration with Claude Desktop via MCP server.

**Purpose:** Validate simulation parameters, discover research findings, and cross-reference expert commentary with implementation decisions.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   YouTube Channels                          │
│  (AI Species, Robert Miles, AI Explained, ...)             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓ (Daily at 2:00 AM)
┌─────────────────────────────────────────────────────────────┐
│              Automated Sync (Launchd)                       │
│  - Check for new videos                                     │
│  - Download transcripts (yt-dlp, rate-limited 8-12s)       │
│  - Skip existing files                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│           Embedding Pipeline (Python)                       │
│  1. Extract text from VTT (remove timestamps)              │
│  2. Chunk into 512-word segments (128-word overlap)        │
│  3. Generate 384-dim embeddings (Sentence-Transformers)    │
│  4. Build FAISS indexes (master + per-channel)             │
│  5. Store metadata in SQLite database                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│               Storage Layer                                 │
│  - transcripts.db (SQLite) - 12 MB metadata                │
│  - youtube_transcripts.index (FAISS) - 3.4 MB              │
│  - Per-channel indexes - ~2 MB total                       │
│  - Raw .vtt files - preserved for reference                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                  ┌────┴────┐
                  │         │
                  ↓         ↓
┌─────────────────────┐  ┌──────────────────────┐
│  MCP Server         │  │  CLI Search          │
│  (Claude Desktop)   │  │  (Direct queries)    │
│                     │  │                      │
│  Tools:             │  │  Commands:           │
│  - rag_query        │  │  - search            │
│  - search           │  │  - channel filter    │
│  - list_channels    │  │  - stats             │
│  - get_stats        │  │                      │
└─────────────────────┘  └──────────────────────┘
```

---

## Components

### 1. Automated Daily Sync

**Script:** `scripts/sync-and-rebuild-embeddings.sh`
**Scheduler:** `~/Library/LaunchAgents/com.superalignment.transcripts.plist`
**Schedule:** Daily at 2:00 AM
**Duration:** 5-15 minutes (depending on new videos)

**What it does:**
1. Reads channel list from `research/youtube-channels/channels.txt`
2. Checks each channel for new videos using yt-dlp
3. Downloads transcripts only (no video files) with rate limiting
4. Extracts and chunks text from VTT files
5. Generates embeddings using Sentence-Transformers
6. Builds FAISS indexes (master + per-channel)
7. Updates SQLite database with metadata
8. Logs everything to `logs/sync-embeddings_YYYYMMDD_HHMMSS.log`

**Installation:**
```bash
bash scripts/install-transcript-scheduler.sh install
```

**Commands:**
```bash
# Check status
bash scripts/install-transcript-scheduler.sh status

# Run immediately (test)
bash scripts/install-transcript-scheduler.sh run-now

# Uninstall
bash scripts/install-transcript-scheduler.sh uninstall
```

---

### 2. FAISS Vector Embeddings

**Model:** Sentence-Transformers (all-MiniLM-L6-v2)
**Dimensions:** 384
**Index Type:** IndexFlatIP (inner product for cosine similarity)
**Chunking:** 512 words with 128-word overlap

**Why FAISS:**
- Fast k-NN search (<1ms for top-k retrieval)
- Cosine similarity for semantic search
- Efficient memory usage (~3.5 MB for 2000+ chunks)
- Apple Silicon optimized via native libraries

**Index Files:**
- `research/embeddings/youtube_transcripts.index` - Master index (all channels)
- `research/embeddings/robert-miles-ai-safety.index` - Per-channel index
- `research/embeddings/species-agi-youtube.index` - Per-channel index
- `research/embeddings/-aiexplained-official.index` - Per-channel index

**Why overlapping chunks:**
- Prevents context loss at chunk boundaries
- Ensures semantic concepts span multiple chunks
- Improves recall for queries that match boundary text

---

### 3. SQLite Metadata Database

**Database:** `research/embeddings/transcripts.db` (12 MB)
**Schema:**

```sql
-- Videos table (80+ records)
CREATE TABLE videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    video_id TEXT UNIQUE,              -- YouTube video ID
    title TEXT NOT NULL,               -- Video title
    channel TEXT NOT NULL,             -- Channel name
    url TEXT,                          -- YouTube URL
    file_path TEXT NOT NULL,           -- Path to .vtt file
    full_transcript TEXT,              -- Complete transcript text
    word_count INTEGER,                -- Total words
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chunks table (2000+ records)
CREATE TABLE chunks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    video_id INTEGER NOT NULL,         -- Foreign key to videos
    chunk_index INTEGER NOT NULL,      -- Position in video
    chunk_text TEXT NOT NULL,          -- Chunk content
    word_count INTEGER,                -- Words in chunk
    faiss_index INTEGER NOT NULL,      -- FAISS vector index
    FOREIGN KEY (video_id) REFERENCES videos(id)
);

-- Indexes for fast queries
CREATE INDEX idx_video_id ON videos(video_id);
CREATE INDEX idx_channel ON videos(channel);
CREATE INDEX idx_chunks_video ON chunks(video_id);
CREATE INDEX idx_chunks_faiss ON chunks(faiss_index);
```

**Why SQLite:**
- Queryable metadata without loading entire index
- Efficient updates (don't rewrite entire file)
- Relational queries (join chunks with videos)
- Standard format (not Python-specific like pickle)
- Debuggable with any SQLite tool

---

### 4. MCP Server (RAG Integration)

**Server:** `scripts/transcript-rag-server.py`
**Protocol:** MCP (Model Context Protocol)
**Integration:** Claude Desktop
**Port:** stdio (no network port required)

**Tools provided:**

1. **`rag_query`** - RAG query with formatted context
   - Input: query string, top_k, optional channel filter
   - Output: Markdown-formatted context with citations
   - Use: Get research context for questions

2. **`search_transcripts`** - Semantic search with JSON results
   - Input: query string, top_k, optional channel filter
   - Output: JSON array of results with metadata
   - Use: Find specific mentions or topics

3. **`list_channels`** - List all indexed channels
   - Output: JSON array of channels with video counts
   - Use: Discover available channels

4. **`get_stats`** - Index statistics
   - Output: Videos, chunks, channels, FAISS vectors
   - Use: Verify index state

**Installation:**
```bash
bash scripts/install-mcp-server.sh
# Restart Claude Desktop
```

**Usage in Claude Desktop:**
```
User: "What does Robert Miles say about mesa-optimization?"

Claude: [Uses rag_query tool to retrieve context]
        [Synthesizes answer from retrieved chunks]
        [Provides video URLs for citations]
```

---

### 5. CLI Search Interface

**Script:** `scripts/search-transcripts-sqlite.py`
**Mode:** Interactive or command-line
**Database:** SQLite (queryable metadata)

**Commands:**
```bash
# Activate environment
source .venv/bin/activate

# Interactive mode
python scripts/search-transcripts-sqlite.py

# Command-line search
python scripts/search-transcripts-sqlite.py "mesa-optimization"

# Channel-specific search
python scripts/search-transcripts-sqlite.py "channel:robert-miles-ai-safety alignment"

# Example queries
python scripts/search-transcripts-sqlite.py "deceptive alignment"
python scripts/search-transcripts-sqlite.py "AGI timeline 2027"
python scripts/search-transcripts-sqlite.py "instrumental convergence"
```

**Interactive commands:**
- `stats` - Show index statistics
- `channels` - List all channels
- `quit` / `exit` - Exit interactive mode
- `<query>` - Search transcripts

---

## Current Status

**As of October 28, 2025:**

- **Videos indexed:** 80+ (growing daily)
- **Total chunks:** 2,299
- **Channels:**
  - Robert Miles AI Safety: 44 videos
  - AI Species: 18 videos
  - AI Explained: Growing (130+ videos syncing)
- **Embedding dimension:** 384
- **Index size:** ~6.5 MB total
- **Database size:** 12 MB
- **Query latency:** <200ms (100ms encode + <1ms FAISS + ~50ms SQLite)

---

## Use Cases for Simulation

### 1. Parameter Discovery

**Problem:** Need realistic values for AI capability growth rate.

**Solution:**
```bash
python scripts/search-transcripts-sqlite.py "compute scaling doubling time"
```

Returns expert commentary on compute growth trends, which informs `capabilityGrowthRate` parameter.

---

### 2. Mechanism Validation

**Problem:** Implementing deceptive alignment mechanics.

**Solution:**
```
# In Claude Desktop
"What does Robert Miles say about deceptive alignment and sandbagging?"
```

Claude uses RAG to retrieve context, providing:
- Expert definitions
- Empirical evidence
- Mechanism descriptions
- Video URLs for full context

---

### 3. Citation Finding

**Problem:** Need source for mesa-optimizer claim.

**Solution:**
```bash
python scripts/search-transcripts-sqlite.py "channel:robert-miles-ai-safety mesa-optimizer"
```

Returns video title and URL for citation in research documentation.

---

### 4. Cross-Reference Research

**Problem:** Compare perspectives on AI alignment difficulty.

**Solution:**
```
# In Claude Desktop
"Compare what Robert Miles and AI Species say about alignment difficulty"
```

Claude queries both channels and synthesizes comparison.

---

### 5. Literature Review

**Problem:** Understand all discussions of instrumental convergence.

**Solution:**
```bash
python scripts/search-transcripts-sqlite.py "instrumental convergence" | tee instrumental-convergence-review.txt
```

Creates comprehensive review of all mentions across channels.

---

## Adding New Channels

**To add a YouTube channel to automatic tracking:**

1. Edit `research/youtube-channels/channels.txt`
2. Add line: `URL | Display Name | Description`
3. Next sync (2:00 AM or manual) automatically:
   - Creates channel folder
   - Downloads transcripts
   - Adds to embeddings index
   - Updates SQLite database

**Example:**
```
https://www.youtube.com/@someAIChannel | Some AI Channel | AI ethics research
```

**No code changes needed!**

---

## Performance

### Sync Performance

- **No new videos:** 30-60 seconds
- **5 new videos:** 2-5 minutes (rate-limited)
- **100 new videos:** 15-25 minutes (rate-limited)
- **Embedding generation:** ~1000 chunks/minute
- **FAISS index build:** <5 seconds

### Search Performance

- **Query encoding:** <100ms
- **FAISS search:** <1ms
- **SQLite retrieval:** ~50ms
- **Total latency:** ~150ms per query

### Resource Usage

- **Memory:** ~400 MB (model + index loaded)
- **Disk:** ~20 MB per 100 videos
- **CPU:** High during embedding (2-3 minutes), idle otherwise
- **Network:** Minimal (transcripts only, not videos)

---

## Troubleshooting

### Scheduler not running

```bash
# Check status
bash scripts/install-transcript-scheduler.sh status

# View launchd logs
cat ~/Library/Logs/Claude/mcp*.log

# Test manually
bash scripts/install-transcript-scheduler.sh run-now
```

### MCP server not working

```bash
# Test server directly
source .venv/bin/activate
python scripts/transcript-rag-server.py

# Check Claude Desktop config
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq '.mcpServers."transcript-rag"'

# Reinstall
bash scripts/install-mcp-server.sh
```

### Database missing or corrupted

```bash
# Rebuild from scratch
bash scripts/sync-and-rebuild-embeddings.sh
```

### Embeddings out of date

The daily scheduler automatically rebuilds embeddings. To force update:

```bash
bash scripts/install-transcript-scheduler.sh run-now
```

---

## Documentation

### Complete Guides

- **[`scripts/TRANSCRIPT_AUTOMATION.md`](../../scripts/TRANSCRIPT_AUTOMATION.md)** - Daily scheduler system (550+ lines)
- **[`scripts/TRANSCRIPT_RAG_MCP.md`](../../scripts/TRANSCRIPT_RAG_MCP.md)** - MCP server usage (650+ lines)
- **[`research/embeddings/README.md`](../../research/embeddings/README.md)** - Technical details (350+ lines)
- **[`research/youtube-channels/README.md`](../../research/youtube-channels/README.md)** - Channel management (200+ lines)

### Quick References

- **Installation:** `bash scripts/install-transcript-scheduler.sh install`
- **MCP Setup:** `bash scripts/install-mcp-server.sh`
- **Search:** `python scripts/search-transcripts-sqlite.py "query"`
- **Status:** `bash scripts/install-transcript-scheduler.sh status`

---

## Integration with Research Workflow

### Typical Workflow

1. **Discover research question** from simulation design discussion
2. **Search transcripts** via MCP server in Claude Desktop
3. **Review video segments** from returned URLs
4. **Extract parameters** from expert commentary
5. **Cite sources** in implementation documentation
6. **Validate mechanics** against research findings

### Example: Implementing Sandbagging Detection

1. **Question:** "How effective is sandbagging detection?"
2. **RAG Query:** "What does research say about detecting AI sandbagging?"
3. **Results:** Robert Miles video on interpretability limits
4. **Parameter:** Set detection ceiling at 70% (mechanistic interpretability)
5. **Citation:** Robert Miles video URL in code comments
6. **Validation:** Monte Carlo runs confirm detection rate matches expectations

---

## Future Improvements

### Planned Features

1. **Timestamp extraction** - Link to exact video moments
2. **Hybrid search** - Combine dense (FAISS) + sparse (BM25) retrieval
3. **Context expansion** - Show surrounding chunks for fuller context
4. **Multi-channel queries** - Compare perspectives across channels
5. **Citation formatting** - Structured references with timestamps
6. **Streaming responses** - Real-time results for large queries

### Model Upgrades

- **MLX-optimized embeddings** - 10x faster on Apple Silicon
- **Larger embedding models** - Better semantic understanding
- **Fine-tuned models** - AI safety domain-specific embeddings

---

## Technical Details

### Dependencies

- **Python 3.x** - Runtime
- **yt-dlp** - YouTube transcript download
- **FAISS-CPU** - Vector similarity search
- **Sentence-Transformers** - Embedding generation
- **SQLite3** - Metadata storage
- **MCP Python SDK** - MCP server framework

### File Locations

```
research/
├── youtube-channels/
│   ├── channels.txt                    # Channel list
│   ├── auto-sync.sh                    # Master sync script
│   └── */sync-channel.sh               # Per-channel scripts
├── embeddings/
│   ├── transcripts.db                  # SQLite database
│   ├── youtube_transcripts.index       # Master FAISS index
│   ├── *_metadata.pkl                  # Metadata (pickle version)
│   └── index_stats.json                # Statistics
└── */transcripts/
    └── *.vtt                           # Raw transcript files

scripts/
├── build-transcript-embeddings-sqlite.py   # Build script
├── search-transcripts-sqlite.py            # CLI search
├── transcript-rag-server.py                # MCP server
├── sync-and-rebuild-embeddings.sh          # Master sync
├── install-transcript-scheduler.sh         # Scheduler installer
└── install-mcp-server.sh                   # MCP installer

logs/
├── sync-embeddings_*.log               # Sync logs
├── launchd-transcripts-stdout.log      # Launchd stdout
└── launchd-transcripts-stderr.log      # Launchd stderr
```

---

## History

- **October 28, 2025:** Complete system created
  - Automated daily sync via launchd
  - FAISS embeddings with SQLite metadata
  - MCP server for Claude Desktop integration
  - CLI search interface
  - 80+ videos indexed from 3 channels
  - Production-ready automation

---

## Related Systems

- **[Research Questions](./RESEARCH_QUESTIONS.md)** - 256 questions extracted from conversations
- **[Bibliography](./BIBLIOGRAPHY.md)** - 156+ peer-reviewed sources
- **Research Foundation** - This system complements manual research with automated transcript mining

---

## Contact & Support

For issues or improvements:
- Check documentation in `scripts/TRANSCRIPT_*.md`
- Review logs in `logs/sync-embeddings_*.log`
- Test components manually with provided scripts
- All systems are open-source and self-contained
