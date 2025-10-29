# Citation Verification System

**Problem:** AI assistants hallucinate citations ~23% of the time, citing papers that don't exist or misattributing findings.

**Solution:** Automated citation verification system that checks all citations against a verified database and auto-researches unverified ones.

---

## System Overview

The citation verification system consists of 4 standalone scripts that work together:

1. **`citationChecker.py`** - Extract and verify citations against database
2. **`autoSearchCitations.py`** - Auto-search academic databases for unverified citations
3. **`matchPaperWithHaiku.py`** - Use Claude Haiku to intelligently match papers
4. **`verifyCitationWithAutoResearch.py`** - Complete workflow integrating all components

Plus a Claude Code hook for automatic checking:

5. **`.claude/hooks/citation-check.sh`** - Post-response hook for Claude Code

---

## Quick Start

### Basic Citation Checking

```bash
# Check text for citations
python scripts/citationChecker.py --text "According to Li et al. (2023)..."

# Check file
python scripts/citationChecker.py --file response.txt

# Check from stdin
echo "Smith et al. (2024)" | python scripts/citationChecker.py --stdin

# JSON output
python scripts/citationChecker.py --text "..." --json
```

### Auto-Research Unverified Citations

```bash
# Complete workflow: check + research + download
export ANTHROPIC_API_KEY="your-key-here"
python scripts/verifyCitationWithAutoResearch.py --text "Li et al. (2023) showed..."

# Check only (no auto-research)
python scripts/verifyCitationWithAutoResearch.py --text "..." --no-research

# Skip PDF downloads
python scripts/verifyCitationWithAutoResearch.py --text "..." --no-download
```

### Search for Specific Citation

```bash
# Search arXiv, Semantic Scholar, CrossRef
python scripts/autoSearchCitations.py --citation "Smith et al. (2024)"

# With PDF downloads
python scripts/autoSearchCitations.py --citation "Smith et al. (2024)" --download
```

### Match Papers with Haiku

```bash
# Get candidates first
python scripts/autoSearchCitations.py --citation "Li et al. (2023)" --json > candidates.json

# Match with context
export ANTHROPIC_API_KEY="your-key-here"
python scripts/matchPaperWithHaiku.py \
  --citation-context "Li et al. (2023) showed that GPT-3 training consumed 700,000 liters of water" \
  --candidates candidates.json
```

---

## Installation

### Dependencies

**Zero dependencies for basic checking!** The citation checker uses only Python standard library.

For advanced features:

```bash
# Haiku matching requires API key
export ANTHROPIC_API_KEY="your-key-here"

# Optional: For Playwright fallback (not yet implemented)
# pip install playwright
# playwright install
```

### Claude Code Hook Setup

1. Copy hook to `.claude/hooks/`:
   ```bash
   # Already in place - just make executable
   chmod +x .claude/hooks/citation-check.sh
   ```

2. Configure Claude Code to use the hook (check docs at https://docs.claude.com/claude-code)

3. Test the hook:
   ```bash
   echo "Smith et al. (2024) found..." | .claude/hooks/citation-check.sh
   ```

---

## How It Works

### 1. Citation Extraction

Uses regex patterns to detect citations in multiple formats:
- `Author et al. (YYYY)`
- `Author (YYYY)`
- `(Author et al., YYYY)`
- `Author & Author (YYYY)`

### 2. Verification Database

Checks against multiple sources:
- **Citation corrections:** `research/CITATION_CORRECTIONS_APPLIED_*.md`
- **Bibliography:** `docs/wiki/BIBLIOGRAPHY.md`
- **PDF reviews:** `research/pdf_review_*.md` (only ✅ VERIFIED papers)
- **Research consensus:** `.claude/chatroom/research-consensus-*.txt`
- **Suspicious list:** `research/suspicious_citations_20251029.json`

### 3. Auto-Search (for unverified citations)

Searches 3 academic databases in parallel:

**arXiv** (free, no key required)
- Physics, CS, math papers
- Direct PDF downloads available
- Fast and reliable

**Semantic Scholar** (free, no key required)
- Broad coverage across disciplines
- Open access PDF detection
- Rate limits apply

**CrossRef** (free, no key required)
- DOI-based lookup
- Publisher metadata
- No direct PDF links (DOI only)

### 4. Haiku Paper Matching

Claude Haiku evaluates candidates based on:
- Topic relevance to citation context
- Author name matching
- Year matching
- Title relevance

Returns ranked list with relevance scores (0-100).

### 5. PDF Download

- Attempts direct download from arXiv/Semantic Scholar
- Saves to `research/papers/`
- Rate limiting to avoid API bans
- **TODO:** Playwright fallback for 403 errors

---

## Workflow Example

```
User: "According to Li et al. (2023), GPT-3 training consumed 700,000 liters of water"

1. Citation Checker extracts: "Li et al. (2023)"
2. Checks database: ❓ UNVERIFIED
3. Auto-search finds 20 candidate papers:
   - "On generalized Li-Yau inequalities" (math)
   - "Real Monopole Floer Homology" (topology)
   - ... (mostly wrong "Li" papers)
4. Haiku matches based on context "water consumption":
   - Ranks by relevance to water/AI/training
   - Identifies correct paper (if in results)
5. Downloads top match PDF to research/papers/
6. Returns: ✅ FOUND or ❌ NOT FOUND

Result: Automated paper discovery + download + verification
```

---

## Output Formats

### Citation Checker

```
⚠️  CITATION VERIFICATION REPORT
============================================================
Citations found: 3
✅ Verified: 2
❓ Unverified: 1
❌ Suspicious: 0

DETAILS:
1. Patterson et al. (2022)
   Status: ✅ VERIFIED

2. Li et al. (2023)
   Status: ✅ VERIFIED

3. Smith et al. (2024)
   Status: ❓ UNVERIFIED
   ⚠️  Not found in verified database - possible hallucination
```

### Auto-Research Results

```
📊 CITATION VERIFICATION + AUTO-RESEARCH REPORT
============================================================
Citations found: 1
❓ Unverified: 1

AUTO-RESEARCH RESULTS:
1. Smith et al. (2024)
   Status: found

   🎯 TOP MATCH:
      Title: AI Sustainability Framework
      Authors: John Smith, Jane Doe, Bob Lee
      Year: 2024
      Source: arXiv
      Relevance: 85/100
      📥 Downloaded: research/papers/ai_sustainability_framework.pdf
      URL: http://arxiv.org/abs/2404.12345
```

---

## Configuration

### Search Limits

Edit `autoSearchCitations.py`:

```python
# Number of results per database
max_results = 10  # Default: 10

# Rate limiting
min_request_interval = 1.0  # Seconds between requests
```

### Output Directory

```bash
# Default: research/papers/
python scripts/autoSearchCitations.py --output-dir /custom/path/
```

---

## Integration Points

### 1. Claude Code Hook (Implemented)

Automatic checking of all AI responses:
- Post-response hook intercepts output
- Checks citations silently
- Shows warning if unverified citations detected
- Non-blocking (warns but doesn't fail)

### 2. Papers RAG MCP Server (TODO)

Auto-populate RAG database with verified papers:
- Download PDF → Extract text → Index for semantic search
- Link citations to paper content
- Enable "cite with evidence" workflow

### 3. Research Consensus Process (TODO)

Integration with multi-agent research workflow:
- Auto-verify citations in research debates
- Flag hallucinated references before consensus
- Require verified sources for implementation

---

## Troubleshooting

### "No citations detected"

Check citation format - must match one of:
- `Author et al. (YYYY)`
- `Author (YYYY)`
- `(Author et al., YYYY)`
- `Author & Author (YYYY)`

### "HTTP 429 error" (Rate limit)

Increase `min_request_interval` in `autoSearchCitations.py`:
```python
self.min_request_interval = 2.0  # Wait 2 seconds between requests
```

### "Haiku matching failed"

Check API key:
```bash
echo $ANTHROPIC_API_KEY
# Should print: sk-ant-...

# Set if missing:
export ANTHROPIC_API_KEY="sk-ant-..."
```

### Wrong paper matched

Haiku matching depends on citation context. Provide more context:
```bash
# ❌ BAD - no context
--citation-context "Li et al. (2023)"

# ✅ GOOD - full sentence
--citation-context "Li et al. (2023) found that GPT-3 training consumed 700,000 liters of fresh water for cooling data centers"
```

---

## Limitations

### Current Limitations

1. **No Google Scholar** - No free API available (would require paid Serpapi or fragile scraping)
2. **No Playwright fallback** - 403 errors not yet handled (TODO)
3. **Regex-based extraction** - May miss unusual citation formats
4. **Author name only** - Searches by first author + year (may find wrong "Smith 2024")
5. **No PDF parsing** - Doesn't verify claims against paper content (yet)

### Future Enhancements

- [ ] Playwright fallback for 403 errors
- [ ] Integration with papers RAG MCP server
- [ ] PDF text extraction and claim verification
- [ ] Google Scholar integration (if API becomes available)
- [ ] Citation context expansion (paragraph vs sentence)
- [ ] Multi-paper comparison (find contradictory evidence)

---

## Files

**Scripts:**
- `scripts/citationChecker.py` - Core verification logic (262 lines)
- `scripts/autoSearchCitations.py` - Academic database search (350 lines)
- `scripts/matchPaperWithHaiku.py` - AI-powered paper matching (250 lines)
- `scripts/verifyCitationWithAutoResearch.py` - Complete workflow (280 lines)

**Hook:**
- `.claude/hooks/citation-check.sh` - Claude Code integration (77 lines)

**Databases:**
- `research/CITATION_CORRECTIONS_APPLIED_*.md` - Verified citations
- `research/suspicious_citations_20251029.json` - Flagged citations
- `docs/wiki/BIBLIOGRAPHY.md` - Project bibliography

**Output:**
- `research/papers/` - Downloaded PDFs
- `logs/` - Citation check logs (when run via hook)

---

## Testing

### Unit Tests

```bash
# Test citation extraction
python -c "
from scripts.citationChecker import CitationChecker
checker = CitationChecker()
citations = checker.extract_citations('According to Smith et al. (2024)...')
print(citations)
"

# Test verification
python scripts/citationChecker.py --text "Patterson et al. (2022)"
# Should show: ✅ VERIFIED
```

### Integration Tests

```bash
# Create test file
cat > /tmp/test.txt << EOF
Patterson et al. (2022) found that GPT-3 used 1,287 MWh.
Li et al. (2023) showed 700,000 liters of water consumption.
Smith et al. (2024) disagrees with these findings.
EOF

# Full workflow
python scripts/verifyCitationWithAutoResearch.py --file /tmp/test.txt
```

### Hook Tests

```bash
# Test hook directly
echo "Smith et al. (2024) claims..." | .claude/hooks/citation-check.sh

# Should show warning if unverified
```

---

## API Usage

### Anthropic API (Haiku)

Cost: ~$0.00025 per citation match (very cheap)

Rate limits:
- Free tier: 50 requests/minute
- Paid tier: 1000 requests/minute

### Academic APIs

All free with rate limits:
- **arXiv:** ~1 request/second (self-enforced)
- **Semantic Scholar:** 100 requests/5 minutes
- **CrossRef:** No official limit (be polite)

---

## License

Part of the Super Alignment to Utopia research simulation project.
All scripts use Python standard library where possible (zero external dependencies for core functionality).

---

## Support

**Issues:** Report at https://github.com/anthropics/claude-code/issues
**Questions:** Check Claude Code docs at https://docs.claude.com/claude-code

**Project-specific:**
- See `docs/wiki/README.md` for simulation details
- See `research/` for verified papers
- See `.claude/chatroom/` for multi-agent coordination
