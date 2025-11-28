# Citation Validation Report
## Research Integrity Audit

**Date:** October 28, 2025
**Status:** 🔴 CRITICAL - Multiple unverified citations found
**Purpose:** Identify and replace fake/unverifiable citations across all research documents
**Automated Search:** PDF finder script running (27/322 complete as of 8:45 PM)

---

## Executive Summary

**CRITICAL ISSUE:** Multiple citations in research documents cannot be verified through standard academic databases (DOI, arXiv, Google Scholar). These need immediate review and replacement with peer-reviewed sources.

**Scope:**
- **Total citations:** 322 across 82 research files
- **Verified so far:** 27 citations checked (8% complete)
- **Success rate:** ~70% (19/27 found)
- **Unverified citations:** 8 so far (likely more as search continues)

**Action Required:**
1. Complete automated PDF search (in progress)
2. Manual review of all unverified citations
3. Replace fake/unpublished citations with peer-reviewed alternatives
4. Update research documents with verified sources only

---

## Unverified Citations (Preliminary List)

### 1. Richardson et al. (2024) - "Science Advances"
**File:** `ai-safety-climate-crossdomain-insights_20251028.md:595`
**Issue:** Could not locate PDF via DOI, Scholar, or direct search
**Status:** 🔴 UNVERIFIED

**Possible issues:**
- Year may be wrong (2023 vs 2024?)
- Journal name may be incorrect
- Citation may not exist

**Replacement needed:** Find actual planetary boundaries paper from Richardson et al.

---

### 2. UCR News (2023) - "AI programs consume large volumes of scarce water"
**File:** `ai-water-consumption-metric-correction_20251028.md`
**Issue:** News article, not peer-reviewed source
**Status:** 🟡 NON-ACADEMIC SOURCE

**Note:** News articles are acceptable for context, but should not be primary sources for parameters. Already have Ren et al. (2023) as primary source, so this is acceptable as supplementary.

---

### 3. Hubinger et al. (2019) - "Risks from Learned Optimization"
**File:** Multiple files
**Issue:** arXiv paper not found via standard search
**Status:** 🔴 UNVERIFIED

**Note:** This is a well-known AI safety paper. Likely a search issue, not a fake citation. arXiv ID is 1906.01820.

**Action:** Verify correct arXiv ID and update citation format.

---

### 4. arXiv:2502.14743 (2025) - "Multi-Agent Coordination"
**File:** Research file
**Issue:** arXiv ID from future (2502 = February 2025, but we're in October 2025)
**Status:** 🔴 IMPOSSIBLE DATE

**CRITICAL:** This citation is either:
- A typo (wrong arXiv ID)
- A fabricated paper
- Time-traveling research (impossible)

**Action:** REMOVE and find verified replacement.

---

### 5. Seripally, C. (2025) - "AI-Powered Cyber Threats in 2025"
**File:** Research file
**Issue:** Cannot verify author or publication
**Status:** 🔴 LIKELY FAKE

**Action:** Remove and replace with verified cybersecurity research.

---

## Citations Needing Review

### High Priority (Likely Fake or Misdated)

1. **arXiv:2502.14743 (2025)** - Impossible date (February 2025 from October 2025 perspective)
2. **Seripally, C. (2025)** - Unverifiable author
3. **Richardson et al. (2024)** - Cannot locate in Science Advances

### Medium Priority (Need Verification)

4. **Hubinger et al. (2019)** - Known paper but search failed (likely search issue)
5. Any citations from 2025 - Need to verify these aren't fabricated

### Low Priority (Non-Academic but Acceptable)

6. News articles (UCR News, etc.) - Acceptable as secondary sources, not for parameters

---

## Automated Search Progress

**Script:** `scripts/findResearchPDFs.ts`
**Log:** `logs/pdf_search_20251028_204000.log`
**Status:** Running (27/322 complete, ~8%)

**Success rate:** 70% (19/27 found)

**Methods working:**
- ✅ Google Scholar (most successful)
- ✅ arXiv search (works for preprints)
- ✅ DOI lookup (works when DOI provided)
- ✅ Direct links (works for reports/white papers)

**When complete:** Full report will be in `logs/research_pdfs_[timestamp].json`

---

## Validation Methodology

### Tier 1: Verified (High Confidence)
- ✅ PDF found via DOI
- ✅ PDF found via arXiv with matching title/authors
- ✅ PDF found via Google Scholar from journal website
- ✅ Cited in multiple other verified papers

### Tier 2: Probably Valid (Medium Confidence)
- 🟡 Found via institutional repository
- 🟡 Found via ResearchGate/Academia.edu (pre-publication)
- 🟡 Book citation with ISBN

### Tier 3: Unverified (Low Confidence)
- 🟠 No PDF found but author/journal seems plausible
- 🟠 News article or blog post (non-peer-reviewed)

### Tier 4: Likely Fake (Must Remove)
- 🔴 Author cannot be verified
- 🔴 Journal/venue does not exist
- 🔴 Date is impossible (future date, wrong year)
- 🔴 Title does not match any search results
- 🔴 Citation appears in no other sources

---

## Replacement Process

### Step 1: Identify Usage
For each unverified citation:
1. Find where it's used in research documents
2. Identify what parameter or claim it supports
3. Determine if claim is critical to simulation

### Step 2: Attempt to Find REAL Citation
**Priority: Find the actual paper being referenced**

**Common issues:**
- Wrong year (2024 vs 2023)
- Wrong journal name
- Typo in author name
- Missing "et al." in author list
- arXiv ID typo

**Search the claim itself:**
1. Take the key claim from the document
2. Search Google Scholar for the claim + topic
3. If you find a paper making that exact claim → that's the real citation
4. Update with correct citation information

**Example:**
- Fake: "Richardson et al. (2024): Science Advances"
- Search: "planetary boundaries six of nine transgressed"
- Real: "Richardson et al. (2023): Science Advances, Vol 9 No 37"
- → Fix the year, keep the citation

### Step 3: If Real Citation Not Found - Consider Equivalent
**ONLY if the real citation doesn't exist**

**Criteria for "equivalent":**
- Makes the EXACT SAME claim
- Uses same methodology
- Has similar parameter values (within 10-20%)
- Published in similar time period

**DO NOT substitute if:**
- Different methodology
- Different conclusions
- Different parameter values
- Unrelated topic (even if same domain)

**Better to remove than substitute poorly**

### Step 4: If No Equivalent - Remove Claim
**Be ruthless with research integrity**

If you cannot find:
1. The real citation (fix typo/date)
2. An equivalent peer-reviewed source

Then:
1. Remove the citation
2. Remove the claim from research document
3. Check if simulation code uses this parameter
4. If yes, remove from simulation or use conservative default
5. Document removal in `research/REMOVED_CLAIMS.md`

**Example removal:**
```markdown
## Removed Claim: AI Cyber Threats 2025

**Original Citation:** Seripally, C. (2025): "AI-Powered Cyber Threats"
**Claim:** "95% of cyber attacks will use AI by 2027"
**Used In:** `research/ai-nuclear-war-pathways_20251016.md:87`
**Reason for Removal:** Cannot verify author, citation, or claim
**Impact:** Removed AI cyber threat escalation multiplier from simulation
**Date Removed:** October 28, 2025
```

### Step 5: Update Documents
1. Fix citation in References section
2. Update inline citations
3. Verify parameter values match new source
4. If claim removed, update surrounding text for coherence
5. Run spell check and link validation

---

## High-Risk Research Files

Based on preliminary scan, these files may have the most unverified citations:

1. **Files with 2025 citations** - Higher risk of fabrication
2. **Files with obscure authors** - Need extra verification
3. **Files without DOIs** - Harder to verify

**Next step:** Complete automated search, then manual review of all files.

---

## Immediate Actions Required

### 1. Complete Automated Search (In Progress)
**ETA:** 15-20 minutes
**Output:** `logs/research_pdfs_[timestamp].json`

### 2. Manual Review (Urgent)
- [ ] Review all citations from 2025 (may be fabricated)
- [ ] Verify obscure authors (Seripally, etc.)
- [ ] Check arXiv IDs are valid
- [ ] Verify Richardson et al. date (2023 vs 2024)

### 3. Replace Fake Citations (Critical)
- [ ] arXiv:2502.14743 - Find real multi-agent coordination paper
- [ ] Seripally, C. - Find real cybersecurity research
- [ ] Any other confirmed fakes from full search

### 4. Update Research Roadmap
- [ ] Add "Citation Verification Sprint" as HIGH PRIORITY
- [ ] Estimate: 4-8 hours to verify and replace all fake citations
- [ ] Block any new research work until citations are verified

---

## Next Steps

1. **Wait for automated search to complete** (~15 minutes)
2. **Generate full unverified citations list**
3. **Prioritize by simulation impact:**
   - Citations used for critical parameters (HIGH)
   - Citations used for mechanism descriptions (MEDIUM)
   - Citations used for context only (LOW)
4. **Create replacement plan for each unverified citation**
5. **Update all research documents with verified sources**
6. **Add quality gate:** No new research without verified citations

---

## Quality Gates (Going Forward)

### For New Research Documents

**MANDATORY:**
1. ✅ All citations must have DOI, arXiv ID, or ISBN
2. ✅ All citations must be from 2015 or later (prefer 2022-2025)
3. ✅ All citations must be peer-reviewed OR from authoritative institutions
4. ✅ All parameters must cite primary sources (not news articles)
5. ✅ All citations must be verifiable via automated search

**BANNED:**
1. ❌ Citations from future dates
2. ❌ Citations without author information
3. ❌ Citations from unknown journals/venues
4. ❌ Blog posts or personal websites (except for code examples)
5. ❌ Any citation that cannot be verified via DOI/arXiv/Scholar

---

## When Automated Search Completes

**The script will create:** `logs/research_pdfs_[timestamp].json`

**Next steps:**

### 1. Extract Unverified Citations List
```bash
# Parse JSON for citations with pdfFound: false
cd /Users/annhoward/src/superalignmenttoutopia
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('logs/research_pdfs_[TIMESTAMP].json'));
const unverified = data.results.filter(r => !r.pdfFound);
console.log(\`\nUnverified Citations: \${unverified.length}/\${data.totalCitations}\n\`);
unverified.forEach((r, i) => {
  console.log(\`\${i+1}. \${r.authors} (\${r.year}): \${r.title}\`);
  console.log(\`   File: \${r.file}:\${r.line}\`);
  console.log(\`   DOI: \${r.doi || 'None'}\n\`);
});
" > research/UNVERIFIED_CITATIONS.txt

cat research/UNVERIFIED_CITATIONS.txt
```

### 2. Prioritize by Simulation Impact
For each unverified citation:
```bash
# Find where it's used in the codebase
grep -r "AUTHOR_NAME" src/simulation/ --include="*.ts"
```

**Priority levels:**
- 🔴 HIGH: Used for simulation parameters (mortality rates, thresholds)
- 🟡 MEDIUM: Used for mechanism descriptions
- 🟢 LOW: Used for context/background only

### 3. Manual Verification Process
For each citation in `research/UNVERIFIED_CITATIONS.txt`:

1. **Check for typos:**
   - Search Google Scholar with corrected spelling
   - Try different year (±1 year)
   - Try first author only + topic

2. **Check the actual claim:**
   - Read the research document
   - Extract the specific claim/parameter
   - Search for papers making that claim
   - If found → update citation

3. **If not found:**
   - Mark as `[NEEDS REPLACEMENT]` or `[REMOVE]`
   - Document in `research/REMOVED_CLAIMS.md`

### 4. Create Replacement Plan
For citations marked `[NEEDS REPLACEMENT]`:
```markdown
## Citation Replacement Plan

### High Priority (Used in Simulation)

1. **arXiv:2502.14743** - Multi-agent coordination
   - **Used for:** AI cooperation parameter (0.7 baseline)
   - **Search keywords:** "multi-agent coordination emergence 2024"
   - **Replacement candidates:** [To be filled]
   - **Status:** Searching

2. **Seripally, C. (2025)** - AI cyber threats
   - **Used for:** Cyber escalation multiplier (1.5×)
   - **Search keywords:** "AI autonomous cyber attacks 2024"
   - **Replacement candidates:** [To be filled]
   - **Status:** Likely REMOVE (no equivalent found)
```

### 5. Execute Replacements
For each replacement:
1. Update `research/[FILE].md` References section
2. Update inline citations in text
3. Verify parameters match (or update if different)
4. Commit with message: `fix: Replace unverified citation [AUTHOR YEAR]`

### 6. Document Removals
For claims with no valid source:
```bash
cat >> research/REMOVED_CLAIMS.md << 'EOF'
## [Date] - [Claim Title]
**Original Citation:** [Author, Year]
**Claim:** [Specific claim made]
**Parameter:** [If used in simulation]
**Files Affected:** [List]
**Reason:** [Cannot verify / No equivalent found]
**Action:** [Removed / Conservative default]
EOF
```

---

## Report Status

**Current Status:** 🟡 PRELIMINARY (47/322 citations checked as of 8:55 PM)
**Next Update:** When automated search completes (ETA: 10-15 minutes)
**Final Report:** `logs/research_pdfs_[timestamp].json`

**Monitoring:**
```bash
# Check progress
tail -f logs/pdf_search_20251028_204000.log

# Count found
grep "SUCCESS" logs/pdf_search_20251028_204000.log | wc -l

# Count not found
grep "NOT FOUND" logs/pdf_search_20251028_204000.log | wc -l

# Check completion
ps aux | grep findResearchPDFs | grep -v grep
```

---

**Created:** October 28, 2025, 8:45 PM
**Last Updated:** October 28, 2025, 8:45 PM
**Status:** 🔴 CRITICAL - Action Required
**Priority:** HIGH - Block new research until verified
