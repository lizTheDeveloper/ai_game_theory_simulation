# Citation Verification Scripts

Quick reference for citation verification system.

**Full documentation:** See `docs/CITATION_VERIFICATION_SYSTEM.md`

---

## Scripts

### 1. `citationChecker.py` (Standalone, zero dependencies)

Extract and verify citations against database.

```bash
# Basic usage
python citationChecker.py --text "According to Smith et al. (2024)..."
python citationChecker.py --file response.txt
echo "Li et al. (2023)" | python citationChecker.py --stdin

# JSON output
python citationChecker.py --text "..." --json

# Quiet mode (exit code only)
python citationChecker.py --text "..." --quiet
```

**Returns:**
- ✅ VERIFIED - In verified database
- ⚠️ VERIFIED BUT FLAGGED - Verified but suspicious
- ❌ SUSPICIOUS - In suspicious list
- ❓ UNVERIFIED - Not found (possible hallucination)

---

### 2. `autoSearchCitations.py` (Standalone, zero dependencies)

Auto-search academic databases for citations.

```bash
# Search single citation
python autoSearchCitations.py --citation "Smith et al. (2024)"

# Search with PDF download
python autoSearchCitations.py --citation "Smith et al. (2024)" --download

# Search multiple (from file)
python autoSearchCitations.py --file citations.txt --download

# JSON output
python autoSearchCitations.py --citation "..." --json
```

**Searches:**
- arXiv (physics, CS, math)
- Semantic Scholar (broad coverage)
- CrossRef (DOI lookup)

**Output:** Candidate papers with titles, authors, year, URLs, PDFs

---

### 3. `matchPaperWithHaiku.py` (Requires ANTHROPIC_API_KEY)

Use Claude Haiku to intelligently match papers based on context.

```bash
# Set API key
export ANTHROPIC_API_KEY="sk-ant-..."

# Match papers
python autoSearchCitations.py --citation "Li et al. (2023)" --json > candidates.json

python matchPaperWithHaiku.py \
  --citation-context "Li et al. (2023) showed that GPT-3 training consumed 700,000 liters of water" \
  --candidates candidates.json

# Interactive mode
python matchPaperWithHaiku.py --interactive
```

**Returns:** Ranked candidates with relevance scores (0-100)

---

### 4. `verifyCitationWithAutoResearch.py` (Complete workflow)

Full pipeline: check → search → match → download

```bash
# Set API key (optional but recommended)
export ANTHROPIC_API_KEY="sk-ant-..."

# Complete workflow
python verifyCitationWithAutoResearch.py --text "According to Li et al. (2023)..."

# From file
python verifyCitationWithAutoResearch.py --file response.txt

# Options
python verifyCitationWithAutoResearch.py --text "..." --no-research    # Skip auto-search
python verifyCitationWithAutoResearch.py --text "..." --no-download   # Skip PDFs
python verifyCitationWithAutoResearch.py --text "..." --json          # JSON output
```

**Workflow:**
1. Check against verified database
2. Auto-search unverified citations
3. Use Haiku to rank matches
4. Download PDFs
5. Report results

---

## Claude Code Hook

### `.claude/hooks/citation-check.sh`

Automatic citation checking for Claude Code responses.

**Setup:**
```bash
chmod +x .claude/hooks/citation-check.sh
# Configure in Claude Code settings (see docs)
```

**Test:**
```bash
echo "Smith et al. (2024) claims..." | .claude/hooks/citation-check.sh
```

**Behavior:**
- Runs automatically on Claude responses
- Shows warning for unverified citations
- Non-blocking (warns but doesn't fail)

---

## Quick Examples

### Example 1: Check a response for hallucinations

```bash
cat > /tmp/response.txt << EOF
According to Patterson et al. (2022), GPT-3 used 1,287 MWh.
Li et al. (2023) showed 700,000 liters of water consumption.
Smith et al. (2024) disagrees with these findings.
EOF

python citationChecker.py --file /tmp/response.txt
```

### Example 2: Research an unverified citation

```bash
python autoSearchCitations.py --citation "Smith et al. (2024)" --json > candidates.json

export ANTHROPIC_API_KEY="sk-ant-..."

python matchPaperWithHaiku.py \
  --citation-context "Smith et al. (2024) disagrees with water consumption estimates" \
  --candidates candidates.json
```

### Example 3: Full auto-research workflow

```bash
export ANTHROPIC_API_KEY="sk-ant-..."

python verifyCitationWithAutoResearch.py \
  --text "According to Zhang et al. (2025), transformer efficiency improved 10x" \
  --json
```

---

## Environment Variables

```bash
# Required for Haiku matching
export ANTHROPIC_API_KEY="sk-ant-..."

# Optional: Custom output directory
export CITATION_OUTPUT_DIR="/path/to/papers"
```

---

## Exit Codes

All scripts return:
- **0** - All citations verified
- **1** - Unverified or suspicious citations detected

Use in CI/CD:
```bash
if ! python citationChecker.py --file response.txt --quiet; then
  echo "❌ Unverified citations detected"
  exit 1
fi
```

---

## Files Created

**Verified citations saved to:**
- `research/papers/*.pdf` - Downloaded PDFs
- `logs/citation_check_*.log` - Check logs (when via hook)

**Database sources:**
- `research/CITATION_CORRECTIONS_APPLIED_*.md`
- `docs/wiki/BIBLIOGRAPHY.md`
- `research/pdf_review_*.md`
- `.claude/chatroom/research-consensus-*.txt`
- `research/suspicious_citations_20251029.json`

---

## Troubleshooting

**"No citations detected"**
→ Check format: Must be "Author et al. (YYYY)" or "Author (YYYY)"

**"HTTP 429 error"**
→ Rate limited. Wait 1 minute and retry.

**"Haiku matching failed"**
→ Check: `echo $ANTHROPIC_API_KEY`

**Wrong paper matched**
→ Provide more context in `--citation-context`

---

## Cost Estimates

**Free:**
- Citation checking (zero dependencies)
- arXiv search
- Semantic Scholar search
- CrossRef search
- PDF downloads (where available)

**Paid:**
- Haiku matching: ~$0.00025 per citation (~400 citations per $0.10)

---

## Next Steps

**TODO:**
- [ ] Playwright fallback for 403 errors
- [ ] Integration with papers RAG MCP server
- [ ] PDF text extraction and claim verification

**See:** `docs/CITATION_VERIFICATION_SYSTEM.md` for full documentation
