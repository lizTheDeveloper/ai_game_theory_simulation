# Citation Verification Protocol

**Established:** October 28, 2025
**Last Updated:** October 28, 2025
**Status:** MANDATORY for all new research citations

---

## Purpose

This protocol was established after discovering a 100% fabrication rate in checked citations during the October 2025 research audit (6/6 citations were fabricated, wrong, or misleading). This protocol ensures all future research citations meet rigorous verification standards.

---

## Red Flags: Round Number Syndrome

**CRITICAL HEURISTIC:** Any range following the pattern "X00-Y00" is PRESUMED FABRICATED until verified.

**Examples that triggered this protocol:**
- ❌ "500-700 liters per GPU-hour" → FABRICATED (real: 0.86-6.6 L/GPU-hr)
- ❌ "300-400 kWh per run" → FABRICATED (real: model-specific MWh)
- ❌ "30-40% AI helps" → FABRICATED (real: 26% success, 74% fail)

**100% of checked "X00-Y00" ranges were fabricated.**

---

## Verification Requirements

### 1. Primary Source Verification (MANDATORY)

**Before adding any citation to wiki/code:**

✅ **MUST:** Access the actual paper (PDF, HTML, or official source)
✅ **MUST:** Verify the specific claim appears in the paper
✅ **MUST:** Verify the authors are correctly attributed
✅ **MUST:** Verify the publication year is correct
✅ **MUST:** Screenshot or quote the exact passage for reference

❌ **NEVER:** Cite based on secondary sources without primary verification
❌ **NEVER:** Use "round number ranges" without explicit paper support
❌ **NEVER:** Attribute quantitative claims to papers older than the technology (anachronistic claims)

### 2. Quantitative Claims

**For any numeric metric:**

✅ Quote the EXACT value from the paper (not rounded)
✅ Document the units exactly as stated
✅ Document the scope/context (e.g., "scope-1 vs scope-2", "per-hour vs total")
✅ If deriving a metric (e.g., calculating per-hour from totals), SHOW YOUR MATH in comments

**Example - CORRECT:**
```typescript
// Li et al. (2023) "Making AI Less 'Thirsty'" arXiv:2304.03271:
// GPT-3 training = 700,000 liters total over 14 days
// Estimated 10,000 GPUs × 336 hours = 3,360,000 GPU-hours
// Derived: 700,000 / 3,360,000 = 0.208 L/GPU-hr (on-site only)
// Paper also provides: 6.6 L/GPU-hr (scope-2, including electricity)
const waterPerGpuHour = 6.6;  // Use scope-2 for full impact
```

**Example - WRONG:**
```typescript
// Ren et al. (2024): 500-700 L/GPU-hour
const waterPerGpuHour = 650;  // ❌ FABRICATED - not in paper
```

### 3. Pre-2015 Papers Claiming AI-Specific Impacts

**CRITICAL:** Papers published before 2015 making AI-specific claims are PRESUMED ANACHRONISTIC.

❌ Damschroder (2009) claiming "AI helps 30-40%" → IMPOSSIBLE (pre-LLM era)
❌ Fixsen (2005) claiming "AI accelerates implementation" → IMPOSSIBLE (pre-deep learning)

**Rule:** If citing pre-2015 papers, only cite GENERAL principles, NOT AI-specific quantitative impacts.

### 4. Citation Count Verification

**When citing paper influence:**

✅ Use Google Scholar citation count (verifiable)
✅ Specify date checked: "~15,000 citations (Google Scholar, Oct 2025)"
✅ Do NOT inflate or round to impressive numbers

❌ "15,000+ citations" when actual count is 1,450 (10× exaggeration)

---

## Verification Workflow

### Step 1: Initial Citation Proposal

When proposing a new citation, provide:

1. **Full citation** (APA format)
2. **Direct quote** from paper supporting the claim
3. **Page number** or section reference
4. **URL** to paper (arXiv, DOI, or official source)
5. **Verification screenshot** (optional but encouraged)

### Step 2: Peer Review

**MANDATORY:** All citations must be reviewed by a second person before merging.

**Reviewer checklist:**
- [ ] Accessed the actual paper (not just abstract)
- [ ] Found the specific claim in the paper
- [ ] Verified authors match citation
- [ ] Verified year matches publication
- [ ] Checked for "round number syndrome" (X00-Y00 patterns)
- [ ] Verified no anachronistic claims (pre-2015 papers claiming AI impacts)

### Step 3: Documentation

**In code comments:**
```typescript
/**
 * Research Foundation:
 * - Li et al. (2023) "Making AI Less 'Thirsty'" arXiv:2304.03271
 *   GPT-3 training = 700,000 liters total (verified page 3)
 *   Per-GPU-hour: 0.86 L (scope-1), 6.6 L (scope-2) - see paper Table 2
 */
```

**In wiki/BIBLIOGRAPHY.md:**
```markdown
**Li, P., Yang, J., Islam, M. A., & Ren, S. (2023).** Making AI Less "Thirsty": Uncovering and Addressing the Secret Water Footprint of AI Models. *arXiv preprint arXiv:2304.03271*.
- **Used for**: AI water consumption (0.86 L/GPU-hr scope-1, 6.6 L/GPU-hr scope-2)
- **Confidence**: HIGH (empirical measurements from UC Riverside + UT Austin)
- **Verified**: Oct 28, 2025 - Primary source accessed, claim found on page 3, Table 2
```

---

## Tools for Verification

**Recommended resources:**

1. **arXiv.org** - Pre-prints with full text
2. **Google Scholar** - Citation counts, PDF links
3. **Semantic Scholar** - Alternative PDF access, citation graphs
4. **Connected Papers** - Find related work, verify influence
5. **MCP Playwright** - Bypass paywalls when needed (use responsibly)

**Verification checklist tool:**

```bash
# Run before committing citation changes
scripts/verifyCitations.sh --check-new-citations
```

(Tool to be created - tracks new citations in git diff and prompts verification)

---

## What to Do When You Find a Fabrication

**Immediate actions:**

1. **DO NOT DELETE** - Use strikethrough to show history
2. **Document the error** in comments/notes
3. **Find the correct source** or remove claim entirely
4. **Update ALL locations** (code, wiki, chatroom notes)
5. **Add verification note** with date and correction

**Example:**
```markdown
- Water consumption: ~~500-700 liters per GPU-hour (Ren et al. 2024)~~
  → **CORRECTED:** 0.86-6.6 L/GPU-hr depending on scope (Li et al. 2023 - arXiv:2304.03271)
  - **Note**: Previous value was 100× too high, fabricated metric not found in any source
  - **Corrected**: Oct 29, 2025 after systematic audit
```

---

## Exception: Derived Metrics

**When simulation needs granularity not provided in papers:**

✅ **ALLOWED:** Calculate derived metrics IF you show your work
✅ **REQUIRED:** Document all assumptions
✅ **REQUIRED:** Link to primary source for base values

**Example:**
```typescript
// DERIVED METRIC (not directly in paper)
// Li et al. (2023): GPT-3 training = 700K liters total, 14 days, ~10,000 GPUs
//
// ASSUMPTIONS (document these):
// - 14 days × 24 hours = 336 hours training time
// - 10,000 GPUs running continuously
// - Total GPU-hours: 10,000 × 336 = 3,360,000 GPU-hours
//
// CALCULATION:
// 700,000 liters / 3,360,000 GPU-hours = 0.208 L/GPU-hr (on-site only)
//
// Paper also provides scope-2 value: 6.6 L/GPU-hr (including electricity)
// Using scope-2 for full environmental impact
const waterConsumptionPerGpuHour = 6.6;
```

---

## Consequences of Fabrication

**Why this matters:**

1. **Research integrity** - We're building a research tool, not a game
2. **Academic credibility** - False citations undermine the entire project
3. **Simulation accuracy** - Fabricated values (100× off) produce meaningless results
4. **Trust** - Collaborators and users depend on our rigor

**The October 2025 audit revealed:**
- 6/6 checked citations had errors (100% failure rate)
- Some metrics were 100-1000× off (water consumption)
- Some citations attributed to wrong authors entirely
- Some claims were anachronistic (pre-2015 papers claiming AI impacts)

**This protocol prevents future fabrications.**

---

## Summary

**Three rules to prevent fabrications:**

1. ✅ **VERIFY PRIMARY SOURCE** - Always access the actual paper
2. ❌ **REJECT "X00-Y00" RANGES** - Presumed fabricated until proven
3. 📝 **SHOW YOUR WORK** - Document calculations, assumptions, derivations

**Zero tolerance for fabricated citations.**

---

**Questions or clarifications:** See `.claude/chatroom/channels/research.md` or research consensus file `.claude/chatroom/research-consensus-20251028_211620.txt`
