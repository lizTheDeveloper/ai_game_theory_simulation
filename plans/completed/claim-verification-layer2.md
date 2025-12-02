# Systematic Claim Verification Crisis (Layer 2)

**Date:** October 29, 2025
**Status:** 🔴 CRITICAL - Newly Discovered
**Priority:** CRITICAL - Research Integrity Failure
**Estimated Effort:** 40-60 hours
**Complexity:** 2 systems (research verification, simulation parameters)

---

## Executive Summary

While completing Layer 1 citation verification (verifying papers exist), we discovered **Layer 2 contamination**: approximately **50% of real citations don't actually support the claims made** in the simulation code.

This is more insidious than fabricated citations because:
- Papers exist (Layer 1 ✅)
- Authors are correct (Layer 1 ✅)
- Years are accurate (Layer 1 ✅)
- **BUT claims are misattributed, extrapolated beyond scope, or misinterpreted (Layer 2 ❌)**

This undermines the research foundation even with "real" citations.

---

## The Problem

### Layer 1 vs Layer 2 Verification

**Layer 1 (Citation Existence) - COMPLETE ✅**
- Do papers exist?
- Are authors correct?
- Are years accurate?
- Can be mechanically verified
- Fixed by finding real papers

**Layer 2 (Claim Accuracy) - CRITICAL ❌**
- Do papers actually support the claims?
- Are parameters directly from papers or extrapolated?
- Is context appropriate (scope, timeline, domain)?
- Requires reading papers and domain expertise
- Cannot be automated
- **Undermines research foundation even with real citations**

### Contamination Examples

**Type 1: Value Extrapolation Beyond Scope**
```typescript
// Code claims:
const MORTALITY_RATE = 0.05; // Based on Richards et al. (2023)

// Reality:
// Richards et al. (2023): "6 billion deaths projected over 75 years" (global baseline scenario)
// Our value: 6B / 75y / global_pop ≈ 0.05/year
// BUT: We compress to 30-year simulation (2.5× acceleration)
// Our actual rate is EXTRAPOLATED, not directly from paper
```

**Type 2: Cherry-Picking Without Uncertainty**
```typescript
// Code claims:
const EFFICIENCY_GAIN = 0.5; // Patterson et al. (2022)

// Reality:
// Patterson et al. (2022) reports range: 0.2-0.8 depending on hardware/workload
// We picked midpoint (0.5) without noting ±60% variance
// Paper provides range, we use point estimate
```

**Type 3: Context Mismatch (Temporal)**
```typescript
// Code claims:
const AI_CAPABILITY_GROWTH = 0.15; // Based on historical trends (Jones 2023)

// Reality:
// Jones (2023) analyzed 2010-2020 data (pre-transformer era)
// We're projecting 2025-2055 (post-GPT-4, different constraints)
// Different technological context, different growth drivers
```

**Type 4: Context Mismatch (Scale)**
```typescript
// Code claims:
const PARTICIPATION_BOOST = 0.3; // Cambridge Core (2024)

// Reality:
// Cambridge Core (2024) studied municipal participatory budgeting (city-level)
// We apply to national/global governance
// Scale extrapolation unjustified (local ≠ national ≠ global)
```

**Type 5: Methodology Cited as Validation**
```typescript
// Code claims:
const THRESHOLD = 0.7; // Validated by Smith et al. (2024)

// Reality:
// Smith et al. (2024) describes a methodology for threshold selection
// We applied methodology and chose 0.7 ourselves
// Paper doesn't validate our specific value, just the approach
```

**Type 6: Paper Discusses Topic But Doesn't Provide Value**
```typescript
// Code claims:
const WATER_PER_INFERENCE = 1.0; // Li et al. (2023)

// Reality:
// Li et al. (2023) discusses AI water consumption at datacenter level
// Doesn't provide per-inference value
// We calculated from aggregate data (our derivation, not theirs)
```

---

## Why This is CRITICAL

### Severity Assessment

**Layer 1 Failures (Fake Citations):**
- Obvious when checked (paper doesn't exist)
- Easy to detect (Google Scholar, arXiv search)
- Clear remediation (find real paper)
- Mechanically verifiable (automated tools)
- **Estimated contamination:** 15.6% (fixed)

**Layer 2 Failures (Misattributed Claims):**
- Subtle (paper exists, seems legitimate)
- Requires reading entire papers (time-intensive)
- Requires domain expertise (understanding context)
- Cannot be automated (judgment required)
- **Estimated contamination:** ~50% (newly discovered)

### Research Integrity Impact

Even with "real" citations, the simulation may be:
1. **Using parameters papers don't provide** - Derived/extrapolated values
2. **Claiming research backing that doesn't exist** - "Based on X" without specific support
3. **Extrapolating beyond papers' scope** - Temporal, scale, or domain mismatch
4. **Misinterpreting findings** - Cherry-picking, ignoring uncertainty
5. **Hiding uncertainty** - Point estimates when papers provide ranges

This undermines the entire research-backed philosophy of the simulation.

---

## Systematic Review Needed

### Scope

**87 research files with 815 real citations** (from Layer 1 verification)

**File categories:**
- Core mechanics: `research/ai-*.md`, `research/environmental-*.md`, `research/social-*.md`
- Technology effects: `research/tech-*.md`
- Crisis systems: `research/catastrophic-*.md`, `research/mortality-*.md`
- Policy interventions: `research/policy-*.md`, `research/ubi-*.md`

### Process (Per Citation)

1. **Read the paper** (or relevant sections)
2. **Extract direct quote** supporting the claim
3. **Verify context match:**
   - Temporal: Does paper's timeframe match our usage?
   - Scale: Does paper's scope (local/national/global) match ours?
   - Domain: Does paper's context match our application?
4. **Identify extrapolations:**
   - Are we deriving values from paper data?
   - Are we scaling beyond paper scope?
   - Are we extending temporal range?
5. **Document uncertainty:**
   - If paper provides range, document range (not just point estimate)
   - If extrapolating, document methodology and assumptions
   - If context differs, document limitations

### Deliverables

**For each research file:**
1. **Claim verification table:**
   ```markdown
   | Code Location | Claim | Citation | Direct Quote | Context Match | Extrapolation | Status |
   |---------------|-------|----------|--------------|---------------|---------------|--------|
   | ai-water.ts:45 | WATER_PER_INFERENCE=1.0 | Li et al. 2023 | "Datacenter water: 500L/hr" | ❌ Temporal | Derived from aggregate | EXTRAPOLATED |
   ```

2. **Updated code comments:**
   ```typescript
   // ✅ VERIFIED - Direct quote
   const MORTALITY_BASELINE = 0.05;
   // Richards et al. (2023): "6 billion deaths projected over 75 years"
   // Calculation: 6B / 75y / 8B pop = 0.01/year baseline
   // NOTE: Simulation uses 30y timeline (2.5× compression) - labeled as "accelerated scenario"
   // Uncertainty: ±30% (Richards reports 4.2B-7.8B range)

   // ⚠️ EXTRAPOLATED - Derived with methodology
   const WATER_PER_INFERENCE = 1.0;
   // Derived from Li et al. (2023): "Datacenter water usage: 500L/hr for 1000 inferences"
   // Calculation: 500L / 1000 = 0.5L/inference × 2 (cooling overhead) = 1.0L
   // Context: 2023 hardware (A100 GPUs), may not apply to future systems
   // Uncertainty: ±100% (geographic variation, cooling efficiency)
   ```

3. **Research verification notes:**
   - Summary of Layer 2 findings
   - List of extrapolations with justification
   - Uncertainty documentation
   - Recommendations for improvement

---

## Enhanced Post-Commit Workflow

### Updated Template

`research/RESEARCH_VERIFICATION_TEMPLATE.md` now includes:

**Layer 2 Verification Checklist:**
- [ ] Direct quotes extracted for all claims
- [ ] Context verified (temporal, scale, domain)
- [ ] Extrapolations marked explicitly with methodology
- [ ] Uncertainties documented (ranges, confidence intervals)
- [ ] No "based on" without specific claim and quote

**Common Layer 2 Failure Patterns:**
1. Value extrapolation (paper data → derived value)
2. Cherry-picking (range → point estimate)
3. Context mismatch (temporal/scale/domain)
4. Methodology cited as validation
5. Topic discussion without specific value
6. Scope mismatch (local → national → global)

### Updated Hook

`.git/hooks/post-commit` now instructs historian:
- Document **SPECIFIC CLAIMS** made about research (not just "needs citation")
- Track **both citation existence (Layer 1) AND claim accuracy (Layer 2)**
- Flag extrapolations, context mismatches, and uncertainty hiding

### Orchestrator Integration

When research verification file created:
1. **Historian** lists specific claims made
2. **Super-alignment-researcher** reads papers and extracts quotes
3. **Research-skeptic** verifies context match and identifies extrapolations
4. **Architecture-skeptic** ensures changes don't break existing systems

---

## Prevention Standards (NEW)

Going forward, ALL research-backed claims must include:

### Code Comment Format

```typescript
// ✅ GOOD - Explicit verification
const PARAMETER = value;
// Direct Quote: "Author et al. (YEAR): 'exact quote from paper'"
// Context: [temporal/scale/domain match notes]
// Calculation: [if derived, show methodology]
// Uncertainty: [range, confidence interval, variance]
// Limitations: [any caveats or scope differences]

// ❌ BAD - Vague attribution
const PARAMETER = value; // Based on Author et al. (YEAR)
```

### Research File Format

**Section 1: Direct Quotes**
```markdown
> "Exact quote from paper supporting claim"
> — Author et al. (YEAR), Page X

**Context:** Paper studied X in context Y during timeframe Z
**Our usage:** We apply to A in context B during timeframe C
**Match:** ✅ Direct / ⚠️ Extrapolated / ❌ Mismatch
```

**Section 2: Derivations**
```markdown
**Source:** Author et al. (YEAR) reports "aggregate metric: X"
**Derivation:** X / Y × Z = parameter_value
**Assumptions:**
- Y is constant (validated by Paper2 et al.)
- Z applies in our context (assumption, not validated)
**Uncertainty:** ±N% (propagated from source uncertainty)
```

**Section 3: Extrapolations**
```markdown
**Base:** Author et al. (YEAR) studied X in 2010-2020
**Extrapolation:** We extend to 2025-2055
**Justification:** Trend continues because [reasons]
**Limitations:** May not hold if [conditions change]
**Alternative scenarios:** If trend breaks, [consequences]
```

---

## Success Criteria

**Quantitative Goals:**
- [ ] 100% of citations have direct quotes or explicit derivation
- [ ] 0 "based on" or "from" without specific claim
- [ ] All extrapolations marked with `[EXTRAPOLATED]` tag
- [ ] All uncertainties documented (ranges, not point estimates)
- [ ] All context mismatches flagged and justified

**Qualitative Goals:**
- [ ] Future readers can verify claims against papers
- [ ] Extrapolations are transparent and justified
- [ ] Uncertainties are visible (not hidden in defaults)
- [ ] Context limitations are documented
- [ ] Research foundation is trustworthy

---

## Phased Approach

### Phase 1: High-Impact Parameters (12-18h)
**Priority:** Parameters used in multiple systems or affecting outcome classification

**Files:**
- `research/mortality-*.md` (affects extinction outcomes)
- `research/ai-capability-growth.md` (affects all AI systems)
- `research/climate-mortality.md` (affects environmental collapse)
- `research/ubi-*.md` (affects economic outcomes)

**Deliverable:** Most-used parameters verified with direct quotes

---

### Phase 2: Core Mechanics (15-20h)
**Priority:** Foundation systems that other mechanics depend on

**Files:**
- `research/ai-water-consumption.md`
- `research/social-cohesion.md`
- `research/environmental-accumulation.md`
- `research/technological-unemployment.md`

**Deliverable:** Core system parameters verified and uncertainty documented

---

### Phase 3: Technology Effects (10-15h)
**Priority:** 71 breakthrough technologies and their effects

**Files:**
- `research/tech-tier*.md`
- `research/fusion-*.md`
- `research/carbon-capture.md`

**Deliverable:** Technology parameter verification and deployment timeline validation

---

### Phase 4: Policy & Interventions (8-12h)
**Priority:** Policy effectiveness and intervention mechanisms

**Files:**
- `research/policy-*.md`
- `research/cooperative-ai-ownership.md`
- `research/crisis-mitigation.md`

**Deliverable:** Policy parameter verification and effectiveness ranges documented

---

## Related Documents

**Crisis Documentation:**
- `/research/CLAIM_VERIFICATION_CRISIS.md` - Crisis overview
- `/research/COMMONLY_HALLUCINATED_CITATIONS.md` - Layer 1 failure patterns

**Workflow Documentation:**
- `/research/RESEARCH_VERIFICATION_TEMPLATE.md` - Updated template
- `/.git/hooks/post-commit` - Enhanced hook with Layer 2 verification
- `/docs/POST_COMMIT_WORKFLOW.md` - Complete workflow (302 lines)

**Research Standards:**
- `/docs/RESEARCH_STANDARDS.md` - Citation methodology, derived metrics policy

**Completed Work:**
- `/plans/completed/citation-verification-crisis_20251029.md` - Layer 1 verification complete

---

## Implementation Strategy

### Recommended Approach

**Use orchestrator agent** for coordinated multi-agent workflow:

```typescript
Task({
  subagent_type: "orchestrator",
  description: "Systematic Layer 2 claim verification - Phase 1: High-impact parameters",
  prompt: `
Execute Layer 2 claim verification for high-impact parameters (mortality, AI capability growth, climate, UBI).

Workflow:
1. super-alignment-researcher: Read papers, extract direct quotes for each claim
2. research-skeptic: Verify context match, identify extrapolations, flag mismatches
3. simulation-maintainer: Update code comments with verified quotes and uncertainty
4. wiki-documentation-updater: Update research files with verification notes
5. project-plan-manager: Archive Phase 1 completion, update roadmap

Success criteria:
- All claims have direct quotes or explicit derivation
- Extrapolations marked and justified
- Uncertainties documented (ranges, confidence intervals)
- Context verified (temporal, scale, domain)

See: /plans/claim-verification-layer2.md for complete plan
  `
})
```

**Rationale:**
- Research-intensive (need super-alignment-researcher for paper reading)
- Requires validation (research-skeptic for context verification)
- Code changes (simulation-maintainer for comment updates)
- Documentation updates (wiki-documentation-updater for research files)

### Quality Gates

**Quality Gate 1: Research Validation**
- research-skeptic MUST verify context match for all claims
- No extrapolations without explicit methodology
- No point estimates without uncertainty ranges

**Quality Gate 2: Implementation Review**
- architecture-skeptic ensures code changes don't break systems
- simulation-maintainer verifies all code comments updated
- No merge until all CRITICAL/HIGH issues addressed

---

## Timeline & Effort

**Total Estimated Effort:** 40-60 hours

**Phase Breakdown:**
1. High-Impact Parameters: 12-18h (IMMEDIATE)
2. Core Mechanics: 15-20h (WEEK 2)
3. Technology Effects: 10-15h (WEEK 3)
4. Policy & Interventions: 8-12h (WEEK 4)

**Complexity Factors:**
- 87 research files to review
- 815 real citations to verify
- Requires reading papers (not just abstracts)
- Requires domain expertise (can't just pattern-match)
- Cannot be automated (judgment required)

**Parallelization:**
- Can work on independent research files in parallel
- But each file requires sequential: read paper → extract quote → verify context → update code/docs

---

## Risk Mitigation

**Risk 1: Overwhelming Scope (815 citations)**
- **Mitigation:** Phased approach starting with high-impact parameters
- **Fallback:** Focus on parameters used in multiple systems first

**Risk 2: Papers Behind Paywalls**
- **Mitigation:** Use institutional access, preprints, author-provided versions
- **Fallback:** Contact authors for copies, use Sci-Hub as last resort

**Risk 3: Domain Expertise Requirements**
- **Mitigation:** Use research-skeptic agent for validation
- **Fallback:** Flag uncertain verifications for human review

**Risk 4: Time Overrun (60+ hours)**
- **Mitigation:** Strict prioritization (high-impact first)
- **Fallback:** Document remaining work for future phases

---

## Expected Outcomes

**After Phase 1 (High-Impact Parameters):**
- Mortality parameters verified with direct quotes
- AI capability growth uncertainty documented
- Climate mortality extrapolations marked
- UBI effectiveness ranges documented
- Outcome classification trustworthy

**After All Phases Complete:**
- 100% citations verified (Layer 1 + Layer 2)
- All extrapolations explicit and justified
- All uncertainties visible (ranges, not point estimates)
- Research foundation restored to credibility
- Future citations prevented by enhanced post-commit workflow

---

**Status:** Ready for orchestrator invocation
**Next Steps:** Invoke orchestrator for Phase 1 (high-impact parameters)
**Blocking Issues:** None
**Dependencies:** Completed Layer 1 verification (✅ COMPLETE)
