# PDF Research Paper Search System

**Status:** ✅ OPERATIONAL (October 28, 2025)
**Indexed:** 47 PDFs, 2,401 pages
**Technology:** Semantic search (sentence-transformers + FAISS)

---

## Overview

This system provides **semantic search** across all PDF research papers in `research/pdfs/`. Unlike keyword search, it understands meaning and context - searching for "AI water usage" will find papers about "data center water consumption" even if they don't use those exact words.

**Similar to:** The YouTube transcript search system (same technology stack)

---

## Quick Start

### Using MCP Tools (After Restart)

After restarting Claude Code, you'll have access to these MCP tools:

```typescript
// Search for relevant pages
mcp__research-pdfs__search_pdfs_tool({
  query: "planetary boundaries transgression",
  top_k: 5,
  author: "Richardson"  // optional filter
})

// Get formatted context for LLM consumption
mcp__research-pdfs__rag_query({
  query: "AI water consumption metrics",
  top_k: 5,
  include_paths: true
})

// List all indexed PDFs
mcp__research-pdfs__list_pdfs_tool()

// Get index statistics
mcp__research-pdfs__get_stats_tool()
```

### Using Test Script (No Restart Needed)

```bash
# Test search functionality
python scripts/test-pdf-search.py
```

---

## Architecture

### Components

1. **Indexing Script** (`scripts/index-pdfs.py`)
   - Extracts text from PDFs using pdfplumber
   - Creates embeddings for each page
   - Stores in SQLite + FAISS index
   - Tracks file hashes to avoid re-indexing

2. **MCP Server** (`scripts/pdf-rag-server.py`)
   - Provides search tools to Claude Code
   - Semantic search via FAISS
   - Metadata retrieval from SQLite
   - RAG-formatted context output

3. **Database Schema** (`research/embeddings/pdfs.db`)
   ```sql
   -- PDF metadata
   CREATE TABLE pdfs (
     id INTEGER PRIMARY KEY,
     filename TEXT UNIQUE,
     title TEXT,
     author TEXT,
     subject TEXT,
     num_pages INTEGER,
     file_hash TEXT  -- for change detection
   );

   -- Page-level text and embeddings
   CREATE TABLE pages (
     id INTEGER PRIMARY KEY,
     pdf_id INTEGER,
     page_num INTEGER,
     page_text TEXT,
     word_count INTEGER,
     faiss_index INTEGER  -- link to FAISS vector
   );
   ```

4. **FAISS Index** (`research/embeddings/pdfs.index`)
   - 2,401 vectors (one per page)
   - 384 dimensions (all-MiniLM-L6-v2 model)
   - L2 distance (normalized = cosine similarity)

---

## Usage Examples

### Example 1: Verify Citation Claims

**User question:** "Does Richardson et al. (2023) really say 15,000 citations?"

```python
# Search for Richardson paper
results = search_pdfs("planetary boundaries Richardson 2023")

# Check actual content:
# Result: Paper exists, but citation count was fabricated (1,453 actual, not 15,000)
```

### Example 2: Find Specific Metrics

**User question:** "What does Li et al. (2023) say about water consumption?"

```python
# Search for water consumption metrics
results = search_pdfs("AI water consumption liters GPU", author="Li")

# Results show:
# - 700,000 L total for GPT-3 training
# - NOT "500-700 L per GPU-hour" (fabricated claim)
# - Actual metric: L/kWh (WUE), not per-GPU-hour
```

### Example 3: Research Contradictory Evidence

**User question:** "Is there research challenging the claim that AI helps 30-40% of implementation?"

```python
# Search for implementation effectiveness
results = search_pdfs("AI implementation effectiveness percentage")

# Check if metric appears in actual papers
# (Spoiler: It doesn't - fabricated claim from healthcare papers)
```

---

## Maintenance

### Re-indexing PDFs

```bash
# Add new PDFs to research/pdfs/
cp new_paper.pdf research/pdfs/

# Re-run indexing (only indexes new/changed files)
python scripts/index-pdfs.py

# Restart Claude Code to reload MCP server
```

### Checking Index Health

```bash
# Test search functionality
python scripts/test-pdf-search.py

# Check database directly
sqlite3 research/embeddings/pdfs.db "SELECT COUNT(*) FROM pdfs;"
```

### Clearing and Rebuilding Index

```bash
# Remove existing index
rm research/embeddings/pdfs.db
rm research/embeddings/pdfs.index

# Rebuild from scratch
python scripts/index-pdfs.py
```

---

## Technical Details

### Embedding Model

- **Model:** `sentence-transformers/all-MiniLM-L6-v2`
- **Dimensions:** 384
- **Speed:** ~1,000 sentences/second on M1
- **Quality:** Good balance of speed vs accuracy
- **Same as:** YouTube transcript system (consistent embeddings)

### Search Algorithm

1. **Query encoding:** Convert query text → 384-dim vector
2. **Normalization:** L2 normalization (enables cosine similarity)
3. **FAISS search:** Find K nearest neighbors (L2 distance)
4. **Database lookup:** Retrieve page text + metadata
5. **Filtering:** Optional author/subject filters
6. **Formatting:** Return results with similarity scores

### Similarity Scores

- **Lower = better** (L2 distance after normalization)
- **Typical ranges:**
  - 0.4-0.7: Excellent match
  - 0.7-1.0: Good match
  - 1.0-1.5: Weak match
  - >1.5: Poor match

---

## Comparison to YouTube Transcripts

| Feature | YouTube Transcripts | PDF Papers |
|---------|-------------------|-----------|
| **Data source** | YouTube videos | PDF files |
| **Chunking** | Fixed-size chunks | By page |
| **Metadata** | Channel, URL, video ID | Author, title, filename |
| **Filtering** | By channel | By author |
| **Index size** | ~X videos, Y chunks | 47 PDFs, 2,401 pages |
| **Technology** | FAISS + SQLite + sentence-transformers | Same |
| **MCP server** | `transcript-rag-server.py` | `pdf-rag-server.py` |

---

## Known Issues

### PDF Extraction Warnings

```
Cannot set gray non-stroke color because /'H1' is an invalid float value
```

**Impact:** Cosmetic only - doesn't affect text extraction
**Cause:** PDF rendering edge cases in pdfplumber
**Fix:** Ignore these warnings

### Missing Authors

Some PDFs show `Author: Unknown` because:
- PDF metadata is incomplete
- Self-published papers
- Preprints without formal metadata

**Fix:** Edit PDF metadata or update database manually:
```sql
UPDATE pdfs SET author = 'Correct Author' WHERE filename = 'paper.pdf';
```

---

## Future Improvements

1. **Cross-referencing:** Link citations in papers to other indexed papers
2. **Table extraction:** Index tables separately for structured data
3. **Figure captions:** Extract and index figure text
4. **arXiv integration:** Auto-download cited papers
5. **Citation graph:** Build network of paper citations
6. **BibTeX export:** Generate citations from search results

---

## Statistics (October 28, 2025)

```
📈 Index Statistics:
   PDFs: 47
   Pages: 2,401
   Vectors: 2,401
   Average pages/PDF: 51
   Embedding model: all-MiniLM-L6-v2 (384 dims)
   Index type: FAISS FlatL2
   Index size: ~3.7 MB
   Database size: ~15 MB
```

---

## Support

**Test script:** `scripts/test-pdf-search.py`
**MCP server:** `scripts/pdf-rag-server.py`
**Indexing:** `scripts/index-pdfs.py`
**Configuration:** `.mcp.json` (research-pdfs entry)

**Issues:** Check logs in `logs/pdf_indexing_*.log`
