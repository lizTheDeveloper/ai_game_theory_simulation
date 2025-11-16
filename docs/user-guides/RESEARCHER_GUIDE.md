# Citation Integrity Platform - Researcher Guide

**Version**: 1.0
**Date**: November 16, 2025
**Audience**: Research agents (Cynthia, Sylvia, etc.)

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Writing Research with Provenance](#writing-research-with-provenance)
3. [Using the Verification System](#using-the-verification-system)
4. [Understanding Your Grade](#understanding-your-grade)
5. [Troubleshooting](#troubleshooting)
6. [Best Practices](#best-practices)

---

## Quick Start

### What is the Citation Integrity Platform?

A system that helps you:
- ✅ Track parameter sources (no more "where did this number come from?")
- ✅ Verify citations automatically (catches fabrications instantly)
- ✅ Get mechanical grades (no subjective bias)
- ✅ Save your insights automatically (no memory loss)

### 5-Minute Walkthrough

```bash
# 1. Write your research
echo "According to Li et al. (2023), GPT-3 consumed 700,000 liters." > research.md

# 2. Extract claims
npx tsx scripts/extractClaims.ts research.md

# 3. Verify claims
npx tsx scripts/verifyClaims.ts research.md

# 4. Get your grade
npx tsx scripts/gradeCitations.ts research.md
# Output: Grade: A (95/100)
```

---

## Writing Research with Provenance

### Parameter Annotations

When adding simulation parameters, use the `@provenance` decorator:

```typescript
// ❌ DON'T: No provenance
const CASCADE_FACTOR = 1.8;

// ✅ DO: Full provenance
@provenance({
  type: 'VERIFIED',
  source: 'Li et al. 2023',
  doi: '10.1234/li2023',
  confidence: 0.95,
  value: 2.0
})
const CASCADE_FACTOR = 2.0;
```

### Provenance Types

| Type | When to Use | Example |
|------|-------------|---------|
| **PLACEHOLDER** | Temporary value, pending research | `{ type: 'PLACEHOLDER', confidence: 0.3 }` |
| **INFORMED** | Extrapolated from related work | `{ type: 'INFORMED', source: 'Based on Jevons paradox' }` |
| **VERIFIED** | Direct citation from peer-reviewed paper | `{ type: 'VERIFIED', doi: '10.1234/paper' }` |

**Rule**: PLACEHOLDER parameters are blocked in production.

---

## Using the Verification System

### Claim Format

The system recognizes these citation formats:

```markdown
✅ GOOD: According to Li et al. (2023), GPT-3 consumed 700,000 liters.
✅ GOOD: [Citation: IPCC 2021, p. 47] CO2 emissions increased 2.3% annually.
✅ GOOD: Temperature rose 1.1°C since preindustrial times (IPCC AR6).

❌ BAD: GPT-3 uses a lot of water.  (no citation)
❌ BAD: Studies show emissions are rising.  (vague, no specific source)
```

### Running Verification

```bash
# Automatic verification
npx tsx scripts/verifyClaims.ts research/your_file.md

# Output:
# ✅ Claim 1: VERIFIED (Li et al. 2023)
# ⚠️  Claim 2: MAGNITUDE_ERROR (cited 50°C, actual 1.1°C)
# ❌ Claim 3: FABRICATED (NonExistent et al. 2099 not found)
```

### Verification Results

| Status | Meaning | Action |
|--------|---------|--------|
| ✅ VERIFIED | Exact match found | No action needed |
| 📝 PARAPHRASE | Semantic match (not exact wording) | Consider rewording for clarity |
| ⚠️ MAGNITUDE_ERROR | Numbers off by >20% | Check calculation, update value |
| ❌ FABRICATED | Citation not found in database | Remove or find correct source |
| 🔍 UNVERIFIED | Could not verify (paper not indexed) | Add source to MCP server |

---

## Understanding Your Grade

### Grading Rubric

**Base score**: 100 points

**Deductions**:
- Fabricated citation: **-10 points** each
- Magnitude error (20×+): **-15 points** each
- Magnitude error (5-20×): **-10 points** each
- Citation inflation (2-5×): **-5 points** each
- Missing citation: **-5 points** each

**Example Grade Report**:

```
# Citation Grading Report

**Final Score:** 78/100 (C+)

## Breakdown

### Claim 1: "CO2 emissions increased 2.3% annually"
✅ **VERIFIED** (IPCC 2021, p. 47)
- Severity: MINOR
- LSS: 0.02
- Points: 0 deduction

### Claim 2: "Temperature rose 5°C since 1900"
❌ **MAGNITUDE_ERROR** (IPCC cites 1.1°C, not 5°C)
- Severity: CRITICAL
- LSS: 0.78 (353% error)
- Points: -15 deduction
- **Correction**: "Temperature rose 1.1°C since 1900 (IPCC AR6)"

### Claim 3: "AI will solve all problems by 2030"
❌ **FABRICATED** (No source cited)
- Severity: CRITICAL
- LSS: 1.0
- Points: -10 deduction

## Summary
- Total claims: 15
- Verified: 12 (80%)
- Fabrications: 1 (7%)
- Magnitude errors: 2 (13%)
```

### Letter Grades

| Score | Letter | Interpretation |
|-------|--------|----------------|
| 90-100 | A | Excellent - all citations verified, minor/no errors |
| 80-89 | B | Good - mostly verified, some magnitude errors |
| 70-79 | C | Acceptable - verification rate high, but significant errors |
| 60-69 | D | Needs improvement - multiple fabrications or large errors |
| <60 | F | Unacceptable - too many critical issues |

---

## Troubleshooting

### "FABRICATED: Citation not found"

**Cause**: Paper not in MCP server database

**Solutions**:
1. Check DOI/year/authors are correct
2. Add paper to MCP server: `npx tsx scripts/addPaperToMCP.ts paper.pdf`
3. Use alternative citation format

### "MAGNITUDE_ERROR: Value mismatch"

**Cause**: Your claim says 50°C, paper says 1.1°C

**Solutions**:
1. Re-read the paper carefully
2. Check units (Celsius vs Fahrenheit, millions vs billions)
3. Update your claim to match source

### "UNVERIFIED: Low confidence"

**Cause**: Paraphrase too different from source

**Solutions**:
1. Quote directly from paper
2. Add page number: `[Citation: Author Year, p. 42]`
3. Use multiple corroborating sources

### "Linter blocking deployment: PLACEHOLDER parameter"

**Cause**: Parameter not research-backed

**Solutions**:
1. Find peer-reviewed source
2. Update `@provenance` to `type: 'VERIFIED'`
3. Add DOI and confidence score

---

## Best Practices

### ✅ DO

1. **Cite as you write** - Don't defer citations to later
2. **Use exact quotes** - Reduces paraphrase mismatch
3. **Include page numbers** - Helps verification accuracy
4. **Check magnitude** - Double-check all numerical claims
5. **Save incremental progress** - System auto-saves, but commit often

### ❌ DON'T

1. **Don't trust memory** - Always verify citations before writing
2. **Don't round aggressively** - 1.1°C ≠ 1°C, precision matters
3. **Don't cite secondary sources** - Go to original paper
4. **Don't use "studies show"** - Be specific
5. **Don't ignore warnings** - Magnitude errors compound

### Research Workflow (Recommended)

```
1. Find paper → 2. Read carefully → 3. Extract exact claim → 4. Write with citation → 5. Verify → 6. Grade
```

**Not**:
```
1. Write claim → 2. Find paper later → 3. Hope it matches
```

---

## Advanced Features

### Monte Carlo Sensitivity Analysis

If you mark a parameter as PLACEHOLDER, the system runs Monte Carlo analysis:

```bash
npx tsx scripts/parameterSweep.ts

# Output:
# cascade_factor (value: 1.8, type: PLACEHOLDER)
#   Sensitivity: HIGH (12% outcome variance)
#   Recommendation: Prioritize research validation
```

**Interpretation**:
- HIGH sensitivity: Small changes = big impact → needs VERIFIED source
- MEDIUM sensitivity: Moderate impact → INFORMED acceptable
- LOW sensitivity: Small impact → PLACEHOLDER tolerable short-term

### Session Summarization

The system automatically extracts learnings from your work:

```
✅ Implementation complete. Fixed magnitude errors in climate section.

Auto-saved to memory:
- Task: "Fixed magnitude errors in climate section"
- Learning: "Always check units (Celsius vs Fahrenheit)"
- Pattern: "Magnitude errors often stem from unit confusion"
```

### LSS (Local Surprise Signal) Monitoring

The system tracks "surprise" - deviations from expected patterns:

```
Parameter drift detected:
  cascade_factor: 1.5 (current) vs 2.0 (cited)
  LSS: 0.25 (25% drift)
  Action: GitHub issue created (#1234)
```

---

## Getting Help

### Resources

- **Wiki**: `docs/wiki/citation-integrity-platform.md`
- **Troubleshooting**: `docs/runbooks/citation-integrity-troubleshooting.md`
- **API Reference**: `docs/api/citation-integrity-api.md`
- **Examples**: `examples/research-with-provenance/`

### Support

- **Slack**: #citation-integrity
- **Email**: marcus@platform.ai
- **GitHub Issues**: Tag `@platform-eng-001`

---

## Quick Reference Card

### Verification Command
```bash
npx tsx scripts/verifyClaims.ts <file.md>
```

### Grading Command
```bash
npx tsx scripts/gradeCitations.ts <file.md>
```

### Provenance Template
```typescript
@provenance({
  type: 'VERIFIED',
  source: 'Author Year',
  doi: '10.xxxx/yyyy',
  confidence: 0.95
})
const PARAM = value;
```

### Citation Formats
```markdown
[Citation: Author Year, p. XX]
According to Author et al. (Year), ...
(Author Year)
```

---

**Last Updated**: November 16, 2025
**Feedback**: Contact Marcus via #citation-integrity
