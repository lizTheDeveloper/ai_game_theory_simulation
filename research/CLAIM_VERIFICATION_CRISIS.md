# Claim Verification Crisis

**Date:** October 29, 2025
**Status:** 🔴 CRITICAL - Newly Discovered
**Severity:** Research Integrity Failure (Layer 2)

## The Crisis

While verifying citations, we discovered **Layer 2 contamination**:
- **Layer 1 (Citation Existence):** Papers are real, authors correct, years accurate ✅
- **Layer 2 (Claim Accuracy):** Papers DON'T actually support the claims made ❌

**Estimated contamination rate:** ~50% of real citations have misattributed claims.

## What This Means

Even with "real" citations, the simulation may be:
- Using parameters the papers don't actually provide
- Claiming research backing that doesn't exist
- Extrapolating beyond papers' scope
- Misinterpreting findings

## Examples of Layer 2 Failures

### Type 1: Paper discusses topic but doesn't provide the value
```typescript
// Code claims:
const WATER_PER_INFERENCE = 1.0; // Li et al. (2023)

// Reality:
// Li et al. (2023) discusses water usage but doesn't provide this specific value
// We extrapolated from aggregate data
```

### Type 2: Value extrapolated beyond paper's scope
```typescript
// Code claims:
const MORTALITY_RATE = 0.05; // Based on Richards et al. (2023)

// Reality:
// Richards et al. projects 6B deaths over 75 years (global)
// We compressed to 30 years (2.5× faster)
// Our rate is extrapolated, not from the paper
```

### Type 3: Methodology paper cited as validation
```typescript
// Code claims:
const THRESHOLD = 0.7; // Validated by Smith et al. (2024)

// Reality:
// Smith et al. describes a methodology
// We applied it and chose 0.7 ourselves
// Paper doesn't validate our specific value
```

### Type 4: Context mismatch
```typescript
// Code claims:
const AI_CAPABILITY_GROWTH = 0.15; // Based on historical trends (Jones 2023)

// Reality:
// Jones (2023) analyzed 2010-2020 data
// We're projecting 2025-2055
// Different context, different constraints
```

### Type 5: Cherry-picking without uncertainty
```typescript
// Code claims:
const EFFICIENCY_GAIN = 0.5; // Patterson et al. (2022)

// Reality:
// Patterson et al. reports range: 0.2-0.8 depending on context
// We picked midpoint without noting ±60% variance
```

## Why This Matters More Than Layer 1

**Layer 1 failures (fake citations):**
- Obvious when checked
- Can be mechanically verified
- Fixed by finding real papers

**Layer 2 failures (misattributed claims):**
- Subtle - requires reading papers
- Requires domain expertise
- Can't be automated
- Undermines entire research foundation even with "real" citations

## The Fix: Two-Layer Verification Protocol

### Updated Post-Commit Workflow

Every commit now triggers:

1. **Documentation update** (as before)
2. **Research verification file** (enhanced):
   - List ALL claims made
   - Map each claim to specific citation
   - Flag what needs verification (existence + claim)
3. **Orchestrator validation:**
   - research-skeptic MUST verify claims match papers
   - Direct quotes required
   - Context verification mandatory
   - Extrapolations marked explicitly

### Template Changes

`research/RESEARCH_VERIFICATION_TEMPLATE.md` now includes:
- **Claim verification checklist**
- **Direct quote requirements**
- **Common failure patterns**
- **Verification status tracking** (Layer 1 + Layer 2)

### Hook Changes

`.git/hooks/post-commit` now instructs historian:
- Document SPECIFIC CLAIMS made about research
- Not just "needs citation" but "claims paper says X"
- Track both citation existence AND claim accuracy

## Systematic Review Needed

**Scope:** All existing research files with citations (87 files)

**Process:**
1. For each citation in code/research:
   - Verify paper exists ✅ (Layer 1 - mostly done)
   - **NEW:** Verify claim matches paper (Layer 2 - NOT DONE)
2. Extract direct quotes supporting claims
3. Mark extrapolations explicitly
4. Document uncertainties

**Estimated effort:** 40-60 hours (2-3× citation existence verification)

## Immediate Actions

1. ✅ Updated post-commit hook with Layer 2 requirements
2. ✅ Updated research verification template
3. ⏳ Add to roadmap as CRITICAL priority
4. ⏳ Create systematic review plan
5. ⏳ Begin claim verification starting with most-used parameters

## Prevention: New Standards

Going forward, ALL research-backed claims must include:

```typescript
// ✅ GOOD - Explicit quote and context
const MORTALITY_RATE = 0.05;
// Richards et al. (2023): "6 billion deaths projected over 75 years"
// Our value: 6B / 75y / global_pop = 0.05/year (baseline scenario)
// NOTE: Compressed to 30y simulation (2.5× acceleration) - labeled as "accelerated scenario"

// ❌ BAD - Vague attribution
const MORTALITY_RATE = 0.05; // Based on Richards et al. (2023)
```

## Related Documents

- `/research/RESEARCH_VERIFICATION_TEMPLATE.md` - Updated template
- `/.git/hooks/post-commit` - Updated hook with Layer 2 verification
- `/docs/POST_COMMIT_WORKFLOW.md` - Workflow documentation
- `/research/COMMONLY_HALLUCINATED_CITATIONS.md` - Layer 1 failure patterns

## Success Criteria

- [ ] All parameters have direct quotes from papers
- [ ] Extrapolations marked explicitly with methodology
- [ ] Uncertainties documented (not hidden with point estimates)
- [ ] Context verified (paper's scope matches our usage)
- [ ] No "based on" without specific claim and quote
