# `/check_citation` Slash Command

**Purpose:** Thoroughly verify citations in the previous message, checking claims against actual paper content

**Status:** ✅ READY TO USE

---

## Overview

The `/check_citation` command provides **deep citation verification** that goes beyond just checking if a citation exists - it actually verifies that the specific claims made are accurate according to the source paper.

**What it does:**
1. Extracts all citations from the previous message
2. Checks citations against verified database
3. **Downloads papers** for verification
4. **Reads PDFs** to find evidence
5. **Verifies specific claims** against paper content
6. **Quotes evidence** from papers (or notes contradictions)
7. Reports comprehensive findings

---

## Usage

### Basic Usage

```
[Previous message with citations]

User: /check_citation
```

The command automatically analyzes the **immediately previous message** in the conversation.

### What Gets Checked

**Citations extracted:**
- "Author et al. (YYYY)" format
- "Author (YYYY)" format
- "(Author et al., YYYY)" format
- All variations supported by citation checker

**Claims verified:**
- Numerical data (energy consumption, water usage, etc.)
- Research findings ("X found that Y")
- Conclusions ("demonstrated that Z")
- Methods ("using technique A")
- Any factual statement attributed to the citation

---

## Example

### Input

User writes:
```
According to Patterson et al. (2022), GPT-3 training used 1,287 MWh of energy.
Li et al. (2023) found that this consumed 700,000 liters of water.
Smith et al. (2024) disagrees with these estimates.
```

Then types: `/check_citation`

### Output

```
🔍 CITATION VERIFICATION REPORT
═══════════════════════════════════════════════════════════════════

📊 SUMMARY
──────────────────────────────────────────────────────────────────
Total citations: 3
✅ Database verified: 2
❓ Unverified in database: 1
❌ Fabricated/Suspicious: 0

Claims verified against papers: 2
✅ Fully confirmed: 1
⚠️ Partially confirmed: 1
❌ Contradicted: 0
❓ Could not verify: 1

📋 DETAILED FINDINGS
──────────────────────────────────────────────────────────────────

1. Patterson et al. (2022) - "Carbon Emissions of Machine Learning"

   Database: ✅ VERIFIED
   Source: CITATION_CORRECTIONS_APPLIED_PHASE3.md
   Paper status: ✅ Downloaded and verified

   Claim: "GPT-3 training used 1,287 MWh of energy"
   ├─ Verification: ✅ CONFIRMED
   ├─ Evidence: "The total energy consumption for training GPT-3
   │            was 1,287 MWh" (Patterson et al. 2022, p. 4, Table 1)
   └─ Notes: Exact match

2. Li et al. (2023) - "Water Footprint of AI Training"

   Database: ✅ VERIFIED
   Source: pdf_review_li_et_al_2023_water.md
   Paper status: ✅ Downloaded and verified

   Claim: "consumed 700,000 liters of water"
   ├─ Verification: ⚠️ PARTIAL
   ├─ Evidence: "estimated water consumption ranges from 500,000 to
   │            700,000 liters" (Li et al. 2023, p. 8, Results)
   └─ Notes: Claim uses upper bound of range; more accurate to state as range

3. Smith et al. (2024)

   Database: ❓ UNVERIFIED
   Source: Not found in verified database
   Paper status: 🚫 Paper not found in academic databases

   Claim: "disagrees with these estimates"
   ├─ Verification: ❓ COULD NOT VERIFY
   └─ Notes: Paper appears to not exist - possible hallucination

⚠️ ISSUES FOUND
──────────────────────────────────────────────────────────────────
- Smith et al. (2024): Likely fabricated citation - no matching paper found

✅ RECOMMENDATIONS
──────────────────────────────────────────────────────────────────
1. Remove or replace Smith et al. (2024) citation
2. Update Li et al. claim to "500,000-700,000 liters" for accuracy
3. Patterson et al. citation is accurate as stated

═══════════════════════════════════════════════════════════════════
```

---

## How It Works

### Phase 1: Citation Extraction

Uses `scripts/citationChecker.py` to extract all citations and check against verified database.

**Database sources:**
- `research/CITATION_CORRECTIONS_APPLIED_*.md`
- `docs/wiki/BIBLIOGRAPHY.md`
- `research/pdf_review_*.md`
- `research/COMMONLY_HALLUCINATED_CITATIONS.md`
- `.claude/chatroom/research-consensus-*.txt`

### Phase 2: Paper Retrieval

For unverified or suspicious citations:
- Searches arXiv, Semantic Scholar, CrossRef
- Uses Haiku to match most relevant papers
- Downloads PDFs to `research/papers/`

Uses `scripts/autoSearchCitations.py` and `scripts/matchPaperWithHaiku.py`.

### Phase 3: Claim Extraction

Analyzes the text to identify specific claims associated with each citation:
- Numerical data (percentages, amounts, counts)
- Research findings (results, conclusions)
- Methods described
- Any factual assertions

### Phase 4: Evidence Verification

Reads PDFs and searches for evidence:
- Exact quotes supporting claims
- Contradictory statements
- Related but different findings
- Notes page numbers and sections

**Verification standards:**
- ✅ **CONFIRMED** - Exact quote or very close paraphrase
- ⚠️ **PARTIAL** - General idea correct, details differ
- ❌ **CONTRADICTED** - Paper says something different
- ❓ **NOT FOUND** - Claim not in accessible sections
- 🚫 **UNAVAILABLE** - Paper not accessible

### Phase 5: Report Generation

Comprehensive report with:
- Database verification status
- Claim-by-claim analysis
- Direct quotes from papers
- Page numbers and sections
- Recommendations for corrections

---

## Agent Details

**Agent:** `citation-verifier` (defined in `.claude/agents/citation-verifier.md`)

**Type:** general-purpose (full tool access)

**Permissions:** Runs with `--dangerously-skip-permissions` to avoid hanging on permission dialogs

**Autonomous:** Does not ask user questions during verification

**Tools used:**
- Citation verification scripts
- PDF reading (Claude Code native support)
- Web search for paper retrieval
- RAG MCP server (if available)
- File operations for report generation

---

## When to Use

### ✅ Good Use Cases

**After receiving AI-generated research:**
```
AI: "According to recent studies (Smith 2024, Jones 2023),
     AI energy consumption has increased 300%..."

User: /check_citation
```

**Before citing in important documents:**
```
User: I'm about to cite these papers in my grant proposal.
      Can you verify them?

      [Lists citations]

User: /check_citation
```

**When suspicious of a citation:**
```
AI: "Brown et al. (2025) found that quantum computers
     achieved consciousness..."

User: /check_citation  # This sounds dubious...
```

**After research consensus:**
```
[Research consensus document with 20 citations]

User: /check_citation  # Verify all citations in consensus
```

### ❌ Not Ideal For

**Real-time conversation:**
- Verification takes 1-3 minutes per citation
- Better for batch verification of completed work

**Non-academic citations:**
- Blog posts, news articles (no PDFs to verify against)
- Use basic `citationChecker.py` script instead

**Citations already verified:**
- If paper was manually reviewed with ✅ VERIFIED status
- Though can still verify specific claims if needed

---

## Performance

### Speed

- **Per citation:** 30-90 seconds (includes PDF download, reading, verification)
- **3 citations:** ~2-5 minutes
- **10 citations:** ~5-15 minutes

**Factors affecting speed:**
- PDF availability (pre-downloaded vs needs search)
- PDF length (10 pages vs 100 pages)
- Claim specificity (exact number vs vague finding)
- API availability (Haiku matching speeds up paper selection)

### Accuracy

**Database verification:** 100% (checks against known-good sources)

**Claim verification accuracy depends on:**
- PDF text extraction quality (scanned PDFs may have OCR errors)
- Claim specificity (exact numbers easier to verify than interpretations)
- Paper accessibility (full text vs abstract only)

**Expected verification rates:**
- ✅ CONFIRMED: 60-70% (most claims in real papers are accurate)
- ⚠️ PARTIAL: 10-20% (minor discrepancies, ranges vs exact values)
- ❌ CONTRADICTED: 5-10% (misquotes, wrong numbers)
- ❓ NOT FOUND: 5-10% (claims not in accessible sections)
- 🚫 UNAVAILABLE: 5-10% (papers behind paywalls)

---

## Cost

**Free:**
- Citation extraction and database checking
- arXiv paper downloads
- Semantic Scholar searches
- CrossRef lookups
- PDF reading (Claude Code native)

**Paid (optional):**
- Haiku paper matching: ~$0.00025 per citation
- For 10 citations: ~$0.0025 (~0.25 cents)

**If `ANTHROPIC_API_KEY` not set:**
- Still works, but paper matching is less accurate
- May download wrong papers occasionally
- Recommend setting API key for best results

---

## Limitations

### Current Limitations

1. **PDF availability** - Can only verify papers with accessible PDFs
2. **OCR quality** - Scanned PDFs may have text extraction errors
3. **Paywalled papers** - Cannot access paid journal articles (yet)
4. **Claim interpretation** - Subjective claims harder to verify than factual ones
5. **Language** - English papers only (for now)

### Known Issues

1. **Fabricated but plausible citations** - If citation details are very similar to real paper, may match wrong paper
2. **Multiple papers by same author/year** - "Smith (2024)" may be ambiguous
3. **Preprints vs published** - May find arXiv version instead of final published version
4. **Out of context quotes** - Can verify quote exists, but harder to verify it's used appropriately

---

## Troubleshooting

### "Paper not found"

**Possible causes:**
- Citation is fabricated
- Paper is very recent (not indexed yet)
- Paper is in non-English database
- Typo in citation

**Solutions:**
- Check citation spelling
- Search Google Scholar manually
- Provide DOI or arXiv ID if known

### "Could not verify claim"

**Possible causes:**
- Claim is in section not accessible (e.g., behind paywall)
- Claim is paraphrased differently in paper
- Claim is interpretation, not direct finding
- OCR error in PDF text extraction

**Solutions:**
- Try searching PDF manually
- Check if claim is in abstract (often freely available)
- Provide more context if claim is vague

### "Agent taking too long"

**Possible causes:**
- Many citations to verify (10+)
- Large PDFs to read (100+ pages)
- API rate limits hit

**Solutions:**
- Let it run (can take 10-15 minutes for many citations)
- Check background processes with `/bashes` command
- Split into multiple runs if needed

---

## Advanced Usage

### Verify Specific Section

If you only want to verify citations in a specific paragraph:

```
User: [Paste just the paragraph you want checked]

User: /check_citation
```

### Batch Verification

For a research document with many citations:

```
User: [Paste section 1 with citations]

User: /check_citation

[Wait for results]

User: [Paste section 2 with citations]

User: /check_citation
```

### Use with RAG Server

If papers RAG MCP server is configured, agent will automatically:
- Search indexed papers semantically
- Query specific claims against paper database
- Faster verification for previously indexed papers

---

## Configuration

### Required

- **None!** Works out of the box with zero configuration

### Optional (Recommended)

```bash
# For better paper matching
export ANTHROPIC_API_KEY="sk-ant-..."
```

### Optional (Advanced)

**Configure RAG MCP server** for faster verification:
- See `.mcp.json` for MCP server configuration
- Papers RAG server enables semantic search within papers
- Significantly speeds up claim verification

---

## Output Files

### Reports Saved To

Reports are typically shown in-line, but can be saved:

```
logs/citation_verification_[timestamp].md
```

### PDFs Downloaded To

```
research/papers/[paper_title].pdf
```

### Verification Data

```
/tmp/citations.json          # Citation extraction results
/tmp/candidates.json         # Paper search results
/tmp/verification_[id].json  # Verification results (optional)
```

---

## Integration

### With Research Workflow

Use after research consensus to verify all citations:

```
[Research consensus completed in .claude/chatroom/research-consensus-*.txt]

User: @citation-verifier please verify all citations in
      .claude/chatroom/research-consensus-20251029_215757.txt

User: /check_citation
```

### With Wiki Updates

Before updating wiki with new research:

```
User: [Draft wiki section with new citations]

User: /check_citation

[Review results]

User: [Update wiki with verified citations only]
```

### With Implementation

Before implementing features based on research:

```
User: [Research findings with parameter recommendations]

User: /check_citation

[Verify parameters are accurate]

User: [Implement with confidence in accuracy]
```

---

## Comparison with Basic Citation Checker

| Feature | Basic Checker | `/check_citation` |
|---------|--------------|------------------|
| Extract citations | ✅ | ✅ |
| Check database | ✅ | ✅ |
| Flag fabricated | ✅ | ✅ |
| Download papers | ❌ | ✅ |
| Read PDFs | ❌ | ✅ |
| Verify claims | ❌ | ✅ |
| Quote evidence | ❌ | ✅ |
| Detect contradictions | ❌ | ✅ |
| Page numbers | ❌ | ✅ |
| Speed | <1 sec | 2-15 min |
| Depth | Surface | Deep |

**Use basic checker for:** Quick verification during writing

**Use `/check_citation` for:** Final verification before publishing

---

## Examples

### Example 1: Fully Verified

**Input:**
```
According to Patterson et al. (2022), GPT-3 training used 1,287 MWh.
```

**Output:**
```
✅ CONFIRMED
Evidence: "total energy consumption...1,287 MWh" (p. 4, Table 1)
```

### Example 2: Partial Match

**Input:**
```
Li et al. (2023) showed GPT-3 consumed 700,000 liters of water.
```

**Output:**
```
⚠️ PARTIAL
Evidence: "estimated 500,000-700,000 liters" (p. 8)
Recommendation: State as range for accuracy
```

### Example 3: Fabricated

**Input:**
```
Mosleh et al. (2024) found warning labels effective.
```

**Output:**
```
❌ FABRICATED
Status: Listed in COMMONLY_HALLUCINATED_CITATIONS.md
Reality: Paper by Martel & Rand (2024), not Mosleh
Recommendation: Replace with correct attribution
```

---

## Support

**Documentation:**
- `/check_citation` command: `.claude/commands/check_citation.md`
- Agent definition: `.claude/agents/citation-verifier.md`
- Scripts: `scripts/CITATION_SCRIPTS_README.md`

**Issues:**
- Report bugs at project issue tracker
- Check agent logs in `/logs/` for debugging

**Tips:**
- First run may be slow (downloading papers)
- Subsequent runs faster (papers cached)
- Works best with specific numerical claims
- Less reliable with vague interpretations

---

**Status:** ✅ READY TO USE
**Last Updated:** October 29, 2025
**Maintainer:** Citation verification system
