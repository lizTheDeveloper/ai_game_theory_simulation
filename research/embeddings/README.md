# YouTube Transcript Embeddings & Search

**Status:** FAISS vector database for semantic search across all YouTube transcripts
**Embedding Model:** Sentence-Transformers (all-MiniLM-L6-v2) - 384 dimensions
**Framework:** FAISS-CPU + Python
**Metadata Storage:** SQLite database (recommended) or Pickle files

---

## Quick Start

### Build Index (First Time or After Adding Transcripts)

**Option 1: SQLite (Recommended)**
```bash
# Activate virtual environment
source .venv/bin/activate

# Build FAISS index with SQLite metadata
python scripts/build-transcript-embeddings-sqlite.py
```

**Option 2: Pickle (Original)**
```bash
# Build FAISS index with pickle metadata
python scripts/build-transcript-embeddings.py
```

**This will:**
- Scan all `research/*/transcripts/*.vtt` files
- Extract clean text from WebVTT format
- Chunk into 512-word segments with 128-word overlap
- Generate embeddings using local model
- Build FAISS index for fast similarity search
- Save index + metadata (SQLite DB or pickle files)
- Create per-channel sub-indexes

**Time:** ~3-5 minutes for 115 transcripts (3 channels)

---

### Search Transcripts

**SQLite Version (Recommended):**
```bash
source .venv/bin/activate

# Interactive mode
python scripts/search-transcripts-sqlite.py

# Command-line search
python scripts/search-transcripts-sqlite.py "mesa-optimization"
python scripts/search-transcripts-sqlite.py "deceptive alignment and sandbagging"

# Search specific channel only
python scripts/search-transcripts-sqlite.py "channel:robert-miles-ai-safety mesa-optimization"
```

**Pickle Version (Original):**
```bash
# Interactive mode
python scripts/search-transcripts.py

# Command-line search
python scripts/search-transcripts.py "AI capability growth timelines"
```

---

## Files

**SQLite Version:**
```
research/embeddings/
├── README.md                           # This file
├── transcripts.db                      # SQLite database (metadata)
├── youtube_transcripts.index           # Master FAISS index (binary)
├── robert-miles-ai-safety.index        # Per-channel FAISS index
├── species-agi-youtube.index           # Per-channel FAISS index
├── -aispecies.index                    # Per-channel FAISS index
└── index_stats.json                    # Index statistics
```

**Pickle Version (Original):**
```
research/embeddings/
├── README.md                           # This file
├── youtube_transcripts.index           # Master FAISS index (binary)
├── youtube_transcripts_metadata.pkl    # Master chunk metadata (pickle)
├── robert-miles-ai-safety.index        # Per-channel FAISS index
├── robert-miles-ai-safety_metadata.pkl # Per-channel metadata
├── species-agi-youtube.index           # Per-channel FAISS index
├── species-agi-youtube_metadata.pkl    # Per-channel metadata
└── index_stats.json                    # Index statistics
```

---

## How It Works

### 1. Text Extraction

VTT transcripts are parsed to remove:
- WebVTT headers and metadata
- Timestamps
- HTML-like tags
- Alignment markers

Clean text is extracted for embedding.

### 2. Chunking

Text is split into overlapping chunks:
- **Chunk size:** 512 words
- **Overlap:** 128 words
- **Why overlap?** Prevents context loss at chunk boundaries

### 3. Embeddings

Each chunk is embedded using **Sentence-Transformers**:
- Model: `all-MiniLM-L6-v2`
- Dimension: 384
- Fast local inference (~1000 chunks/minute on Apple Silicon)

**Future:** Can switch to Qwen3-Embedding-0.6B-4bit with MLX for 10x faster embedding on M3

### 4. FAISS Index

Embeddings are stored in FAISS (Facebook AI Similarity Search):
- IndexFlatIP: Inner product search (cosine similarity)
- Normalized vectors for accurate similarity scores
- Fast k-NN search (<1ms for top-k retrieval)

### 5. Search

Query → Embed → FAISS search → Return top-k similar chunks with metadata

---

## Index Statistics

**Current Index (as of build):**
- **Videos:** 80 (from 3 channels)
- **Total chunks:** 2,299
- **Embedding dimension:** 384
- **Channels:**
  - Robert Miles AI Safety: 44 videos
  - AI Species: 18 videos
  - Duplicates due to folder naming: 18 videos
- **Index size:** ~3.5 MB (master) + ~2 MB (per-channel indexes)
- **Database size:** ~1.5 MB (SQLite)

**Expected after AI Explained completes (130+ videos):**
- **Videos:** 210+
- **Total chunks:** ~4,000-5,000
- **Index size:** ~20-25 MB total

---

## Usage Examples

### Find Videos on Specific Topics

```python
# Search for mesa-optimization discussions
python scripts/search-transcripts.py "mesa optimization inner alignment"

# Find deceptive AI behavior examples
python scripts/search-transcripts.py "AI lying deception hiding capabilities"

# Timeline predictions
python scripts/search-transcripts.py "AGI 2027 2029 timeline predictions"
```

### Interactive Exploration

```bash
python scripts/search-transcripts.py

Search> mesa-optimization
# Returns top 5 most relevant chunks with video titles and URLs

Search> stats
# Shows index statistics

Search> quit
```

---

## Maintenance

### Rebuild Index After Adding Channels

Whenever you add new channels or sync new videos:

```bash
# Sync channels first
cd research/youtube-channels
bash auto-sync.sh

# Rebuild embeddings
cd ../..
source .venv/bin/activate
python scripts/build-transcript-embeddings.py
```

The script automatically:
- Detects all transcript files
- Only re-embeds if needed (checks file modification times)
- Updates metadata and stats

---

## Performance

**Embedding generation:**
- **Current (Sentence-Transformers):** ~1000 chunks/minute
- **With MLX Qwen3:** ~5000-10000 chunks/minute (10x faster)

**Search:**
- **Query encoding:** <100ms
- **FAISS search:** <1ms
- **Total latency:** ~100ms per query

**Memory:**
- **Index loaded:** ~50 MB RAM
- **Model loaded:** ~300 MB RAM (Sentence-Transformers)
- **Total:** ~350 MB RAM

---

## Future Improvements

### 1. Switch to MLX-Optimized Embeddings

Current implementation uses sentence-transformers as fallback. To use MLX with Qwen3:

```bash
# Install MLX embeddings
pip install mlx mlx-lm

# Model will automatically use MLX if available
# Edit build-transcript-embeddings.py to force MLX usage
```

**Benefits:**
- 10x faster embedding generation
- Lower memory usage
- Better Apple Silicon utilization

### 2. Add Metadata Filtering

Search by channel, date range, or video title:

```python
# Example: Only search Robert Miles videos
python scripts/search-transcripts.py "mesa-optimization" --channel="robert-miles-ai-safety"
```

### 3. Hybrid Search

Combine vector similarity with keyword matching:
- Dense retrieval (current FAISS)
- + Sparse retrieval (BM25)
- = Better recall for specific terms

### 4. Context Window Expansion

When a chunk is returned, show:
- Previous chunk (context before)
- Next chunk (context after)
- Full transcript link

---

## Troubleshooting

### Index not found

```
❌ Index not found at research/embeddings/youtube_transcripts.index
   Run build-transcript-embeddings.py first
```

**Solution:**
```bash
python scripts/build-transcript-embeddings.py
```

### No transcripts found

```
❌ No transcripts found. Run sync-all-channels.sh first.
```

**Solution:**
```bash
cd research/youtube-channels
bash auto-sync.sh
```

### Model download fails

```
❌ Error loading model
```

**Solution:**
The script will automatically fall back to sentence-transformers. First run downloads the model (~120 MB) from Hugging Face.

---

## Integration with Simulation

### Use Cases for Simulation Research

**1. Validate Mechanics**
```python
# Find research backing for deceptive alignment
python scripts/search-transcripts.py "deceptive alignment empirical evidence"
```

**2. Parameter Discovery**
```python
# Find timeline estimates
python scripts/search-transcripts.py "AGI capability growth rate compute scaling"
```

**3. Mechanism Exploration**
```python
# Understand mesa-optimization
python scripts/search-transcripts.py "mesa optimizer goal misgeneralization"
```

**4. Research Question Matching**
Cross-reference with `docs/wiki/RESEARCH_QUESTIONS.md`:
- Extract research questions from wiki
- Search transcripts for answers
- Link to primary sources in video descriptions

---

## Technical Details

### Embedding Model

**Current: Sentence-Transformers (all-MiniLM-L6-v2)**
- Architecture: DistilBERT-based
- Parameters: ~23M
- Embedding dimension: 384
- Training: Contrastive learning on 1B+ sentence pairs
- Speed: ~1000 sentences/sec on Apple Silicon

**Target: MLX Qwen3-Embedding-0.6B-4bit**
- Architecture: Qwen3-based transformer
- Parameters: 600M (4-bit quantized)
- Embedding dimension: 768
- Training: Multilingual contrastive learning
- Speed: ~5000-10000 sentences/sec on Apple Silicon (MLX-optimized)

### FAISS Index Type

**IndexFlatIP (Flat Inner Product)**
- Exact search (no approximation)
- Best for small-medium datasets (<1M vectors)
- Fast on modern hardware
- Memory: O(n × d) where n=vectors, d=dimension

**For larger datasets (>1M vectors):**
- Use IndexIVFFlat (inverted file index)
- 10-100x faster search with 99%+ recall
- Requires training on sample data

---

## Related Documentation

- `research/youtube-channels/README.md` - Channel tracking system
- `docs/wiki/RESEARCH_QUESTIONS.md` - Research questions catalog
- `.venv/` - Python virtual environment

---

## SQLite vs Pickle

**Why SQLite is recommended:**

1. **Queryable Metadata:** Can query videos by channel, title, date without loading entire index
2. **Efficient Updates:** Update individual records without rewriting entire file
3. **Relational Queries:** Join chunks with videos for complex searches
4. **Standard Format:** SQLite is universal, pickle is Python-specific
5. **Debugging:** Can inspect database with any SQLite tool (DB Browser, CLI)
6. **Channel Filtering:** Fast channel-specific searches using SQL WHERE clauses

**When to use Pickle:**
- Legacy compatibility
- Slightly faster read performance for full-index operations
- Simpler deployment (single .pkl file)

---

## History

- **2025-10-28:** Initial embeddings system created
  - AI Species + Robert Miles transcripts indexed (62 videos)
  - Sentence-Transformers fallback implemented
  - FAISS index with pickle metadata
  - Per-channel sub-indexes added
  - SQLite version created with full metadata storage (80 videos, 2299 chunks)
  - Channel-filtered search capability added
