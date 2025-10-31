# How to Import 305 PDFs to Zotero

## Found Papers
- **Total**: 305 PDF files
- **Location**: `/Users/annhoward/src/superalignmenttoutopia/research/papers`

## ✅ Option 1: Drag-and-Drop (Easiest)

I just opened:
- **Zotero** (desktop app)
- **Finder** with your papers folder

**Steps:**
1. In Finder, select all PDFs (Cmd+A)
2. Drag them into Zotero's main library
3. Zotero will automatically extract metadata and organize them

**Tips:**
- Zotero will recognize arXiv papers automatically
- You can create collections afterwards to organize them
- Zotero will attempt to retrieve metadata from DOIs/arXiv IDs

## Option 2: Use Zotero's Import Feature

1. In Zotero, click **File → Import**
2. Navigate to: `/Users/annhoward/src/superalignmenttoutopia/research/papers`
3. Select all PDF files
4. Click **Open**

## Option 3: Programmatic Import (Advanced)

I created a Python script, but you'll need your Zotero API credentials:

```bash
# Get your API key from: https://www.zotero.org/settings/keys
python scripts/bulk-import-to-zotero.py
```

## Option 4: Using ZotFile Plugin (Batch Processing)

If you have ZotFile plugin installed:

1. In Zotero: Tools → ZotFile Preferences
2. Set "Source Folder" to your papers directory
3. Tools → ZotFile → "Attach New File"
4. It will batch process all PDFs and extract metadata

## Recommended: Organize After Import

After importing, create collections:

```
📁 AI Safety & Alignment
  - AI Alignment Problems
  - Adversarial AI
  - Safety Frameworks

📁 Climate & Environment
  - Climate Impact
  - Nuclear Winter
  - Environmental Models

📁 Economics & Social
  - Economic Models
  - Social Systems
  - Inequality

📁 Technical Papers
  - Simulation Methods
  - Monte Carlo Analysis
  - Mathematical Models
```

## Paper Breakdown (from filenames)

**arXiv Papers**: ~15-20 papers (identifiable by arxiv IDs like 2404.09932)
**Named Papers**: ~285 papers with author/topic names

**Sample papers found:**
- `ai_alignment_open_problems.pdf`
- `nuclear_winter.pdf`
- `how_hungry_is_ai.pdf` (AI energy consumption)
- `water_footprint.pdf`
- `cfir_framework.pdf` (implementation research)

## After Import: Update Metadata

Zotero can automatically retrieve metadata:

1. Select all imported items
2. Right-click → "Retrieve Metadata for PDF"
3. Zotero will query CrossRef, arXiv, Google Scholar

## Enable Zotero MCP Integration

Once imported, you can use them with Claude Code:

```bash
# Update semantic search database
zotero-mcp update-db

# This indexes all 305 papers for AI-powered search
```

## Next Steps

1. ✅ **Import papers** (drag-and-drop is fastest)
2. ✅ **Organize into collections**
3. ✅ **Run metadata retrieval**
4. ✅ **Update Zotero MCP database**
5. ✅ **Use semantic search** in Claude Code

---

**Estimated time to import**: 5-10 minutes for 305 PDFs (Zotero processes them in batches)
