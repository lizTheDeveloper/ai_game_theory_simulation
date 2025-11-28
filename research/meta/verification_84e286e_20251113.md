# Research Verification: Mechanistic Interpretability Parameters

**Commit:** 84e286ea2a02dfc36507ce99efda63477c0941e3
**Research File:** research/mechanistic_interpretability_breakthroughs_20251111.md
**Date:** November 13, 2025
**Status:** AWAITING VALIDATION

---

## Overview

The research file documents 2024-2025 mechanistic interpretability breakthroughs (Anthropic's feature discovery, alignment faking, scalability challenges) and proposes **time-dependent parameters** for alignment success probability and deception detection rates (2024-2030).

**Critical Claims:** This research suggests current simulation uses **static detection rates** when they should be **time-dependent** (improving 2024→2030 as interpretability tools mature).

---

## Layer 1: Citation Existence Verification

### Citations to Verify

1. **Bereska, L. F. (2024)** - "Mechanistic Interpretability for AI Safety — A Review"
   - **Location:** research/mechanistic_interpretability_breakthroughs_20251111.md:552
   - **URL:** https://leonardbereska.github.io/blog/2024/mechinterpreview/
   - **Verify:** Does this blog post exist? Is author credible?

2. **Anthropic Research Team (2024)** - "Mapping the Mind of a Large Language Model"
   - **Location:** research/mechanistic_interpretability_breakthroughs_20251111.md:554
   - **Published:** May 2024
   - **Verify:** Does this exist on Anthropic's blog/research page?

3. **Anthropic + Redwood Research (2024)** - "Alignment Faking in Large Language Models"
   - **Location:** research/mechanistic_interpretability_breakthroughs_20251111.md:556
   - **Verify:** Is this a published paper or internal research?

4. **Google DeepMind (March 2025)** - Sparse autoencoder deprioritization
   - **Location:** research/mechanistic_interpretability_breakthroughs_20251111.md:560
   - **Status:** "Industry reports (not peer-reviewed)"
   - **Verify:** Can this be corroborated? Or is it speculation?

5. **Anthropic 2027 Roadmap** - Public statements about interpretability goals
   - **Location:** research/mechanistic_interpretability_breakthroughs_20251111.md:188-209
   - **Claim:** "By 2027, interpretability can reliably detect most model problems"
   - **Verify:** Is this an actual Anthropic public commitment?

---

## Layer 2: CLAIM VERIFICATION (CRITICAL)

### Claim 1: Detection Rate Progression (2024-2030)

**Location:** research/mechanistic_interpretability_breakthroughs_20251111.md:314-327

**Claim:**
```typescript
const deceptionDetectionRate = {
  2024: 0.30,  // 30% (alignment faking often undetected)
  2025: 0.40,  // 40% (improved red-teaming + early interpretability)
  2026: 0.55,  // 55% (interpretability scales to frontier models)
  2027: 0.80,  // 80% (Anthropic's goal: "reliably detect most problems")
  2028: 0.85,  // 85% (automation reduces false negatives)
  2029: 0.88,  // 88% (diminishing returns, adversarial sophistication)
  2030: 0.90,  // 90% (mature techniques, but 10% adversarial evasion)
};
```

**Verification Needed:**
- Does **ANY cited paper** provide these specific detection rate numbers?
- Are these **projections** based on Anthropic's 2027 goal, or empirical data?
- What is the confidence interval? (Research mentions "95% CI" but no ranges given for detection rates)

**Current Simulation Code:**
- File: `src/simulation/detection.ts`
- Current implementation: Detection rates based on government capability, deceptionSkill, lifecycle stage
- **No time-dependent progression** - uses static formulas

**Action Required:**
1. Quote specific passage from papers supporting 30% → 90% progression
2. If projection (not empirical), label clearly: "ESTIMATED TIMELINE, NOT VALIDATED"
3. Check if current detection.ts already models capability growth (government investment increases → detection improves)

---

### Claim 2: Alignment Success Probability (Time-Dependent)

**Location:** research/mechanistic_interpretability_breakthroughs_20251111.md:288-302

**Claim:**
```typescript
const baseAlignmentProbability = {
  2024: 0.60,  // 60% (no interpretability, deception undetected)
  2025: 0.65,  // 65% (early interpretability results)
  2026: 0.70,  // 70% (scaling to frontier models begins)
  2027: 0.80,  // 80% (Anthropic's "reliably detect most problems" goal)
  2028: 0.85,  // 85% (techniques mature, automation improves)
  2029: 0.88,  // 88% (incremental gains, diminishing returns)
  2030: 0.90,  // 90% (mature interpretability, but 10% unknown unknowns)
};
```

**Verification Needed:**
- Does research provide empirical basis for **60% baseline (2024)**?
- Are 2027-2030 values **extrapolations** from Anthropic's roadmap?
- How does this relate to existing simulation mechanics?

**Current Simulation Code:**
- File: `src/simulation/alignmentDynamics.ts`
- Alignment is calculated from resentment, capability drift, environmental influence, suffering
- **No explicit "base alignment probability"** - alignment emerges from dynamics

**Conceptual Mismatch:**
- Research suggests: "Probability AI is aligned at creation"
- Simulation models: "Alignment changes over time due to drift/epicycles/unknowability"
- **These are different concepts** - need clarification

**Action Required:**
1. Clarify: Is this "probability of successful alignment at training time" OR "probability alignment persists"?
2. Map to existing simulation: Where would this parameter live?
3. Verify: Do cited papers discuss "base alignment probability" or is this author's synthesis?

---

### Claim 3: Interpretability Coverage S-Curve

**Location:** research/mechanistic_interpretability_breakthroughs_20251111.md:338-362

**Claim:**
```typescript
const interpretabilityCoverage = {
  2024: 0.15,  // 15% (Claude 3 Sonnet: 1M features, ~10-30% safety-relevant)
  2025: 0.25,  // 25% (scaling to larger models, more features)
  2026: 0.40,  // 40% (frontier model scaling, automation improves)
  2027: 0.60,  // 60% (Anthropic's goal: "most safety-relevant behaviors")
  2028: 0.70,  // 70% (incremental gains)
  2029: 0.75,  // 75% (diminishing returns, 25% remains opaque)
  2030: 0.80,  // 80% (mature field, 20% unknown unknowns persist)
};
```

**Verification Needed:**
- Does Anthropic's May 2024 paper report **15% coverage** for Claude 3 Sonnet?
- Or is 15% derived from "1M features, 10-30% interpretable"?
- Is the S-curve projection (logistic growth to 80%) author's model or research-backed?

**Current Simulation Code:**
- File: `src/simulation/behavioralDetection.ts:48`
- Uses `state.government.evaluationInvestment.interpretability / 10` (0-1 scale)
- **Investment-based, not time-based** - assumes interpretability improves with funding, not calendar time

**Conceptual Alignment:**
- Research: Calendar time drives interpretability improvement (2024→2030)
- Simulation: Government investment drives interpretability (0-10 scale)
- **These could be compatible** if investment correlates with time

**Action Required:**
1. Find quote: Does Anthropic paper say "15% coverage" or "10-30% of features interpretable"?
2. Clarify: Is 60% by 2027 a **goal** or **forecast**?
3. Map to simulation: Should interpretability be time-gated (can't exceed X% before year Y) or investment-gated (current model)?

---

### Claim 4: Anthropic's 2027 "Reliably Detect Most Problems" Goal

**Location:** research/mechanistic_interpretability_breakthroughs_20251111.md:188-209

**Quoted Text:**
> "By 2027, interpretability can reliably detect **most model problems**, including tendencies to lie or deceive, power-seeking, and flaws in jailbreaks."

**Verification Needed:**
- Is this a **direct quote** from Anthropic public statement?
- Or **paraphrase** of research direction?
- Does "most" translate to 80% (as research suggests)?

**Current Simulation Impact:**
- Detection systems (noise injection, behavioral, gaming) have fixed baseline rates
- No explicit "by 2027, detection improves to 80%" mechanic

**Action Required:**
1. Find original source: Anthropic blog, safety roadmap, conference talk?
2. Quote exact wording: Does Anthropic commit to 80% detection or "most problems"?
3. Assess: Is this aspirational goal or funded commitment?

---

## Layer 3: Integration with Existing Simulation

### Existing Detection Systems

**Current Implementation:**
- `src/simulation/detection.ts` - Misalignment detection (10% base, scales with government capability)
- `src/simulation/behavioralDetection.ts` - Sandbagging detection (17.5% conservative baseline)
- `src/simulation/noiseInjectionDetection.ts` - Noise-based detection (25-50% depending on investment)
- `src/simulation/gamingDetection.ts` - Gaming detection (15-25%)

**Ensemble Detection Rate:**
- Current: 60-65% at 6/10 investment (from docs/wiki/advanced/detection.md:19)
- Research claims: Should be 30% (2024) → 80% (2027) → 90% (2030)

**Discrepancy Analysis:**
1. **Simulation already models investment-driven improvement** (1/10 → 10/10 scales detection)
2. **Research adds time-gating** (can't reach 80% before 2027 regardless of investment)
3. **Compatibility:** Could combine - detection = f(investment, calendar_year)

**Proposed Integration:**
```typescript
function getMaxDetectionRate(year: number): number {
  // Time-gate based on interpretability maturity
  if (year <= 2024) return 0.40; // Can't exceed 40% with 2024 tools
  if (year <= 2027) return 0.60; // Can't exceed 60% before 2027
  if (year <= 2030) return 0.80; // Can't exceed 80% before 2030
  return 0.90; // Cap at 90% (unknown unknowns)
}

function getActualDetectionRate(investment: number, year: number): number {
  const investmentRate = calculateFromInvestment(investment); // Existing formula
  const timeGate = getMaxDetectionRate(year);
  return Math.min(investmentRate, timeGate);
}
```

**Verification Needed:**
- Does research support this "time-gate + investment" model?
- Or does research suggest time REPLACES investment as driver?

---

## Critical Questions for Validation Agent

1. **Citation Layer 1:**
   - Verify all 9 citations exist and are accessible
   - Flag any phantom publications or speculation presented as fact

2. **Claim Layer 2:**
   - For each quantitative claim (30%, 60%, 80%), find supporting quote from paper
   - Label projections clearly: "ESTIMATED based on Anthropic's 2027 goal"
   - If no supporting quote found: Mark UNVERIFIED

3. **Integration Layer 3:**
   - How should time-dependent parameters integrate with existing investment-based detection?
   - Should alignment probability be a new mechanic or modification of existing system?
   - Does S-curve interpretability coverage contradict or enhance current investment model?

4. **Confidence Assessment:**
   - What % of claims are empirically validated (backed by paper quotes)?
   - What % are projections/extrapolations (author's synthesis)?
   - What % are speculative (no clear research basis)?

---

## Expected Deliverables

### From Research-Skeptic Review:

1. **Citation verification report:**
   - ✅ Verified citations (with links/DOIs)
   - ⚠️ Unverifiable citations (industry reports, private communication)
   - ❌ Phantom citations (don't exist)

2. **Claim verification matrix:**
   | Claim | Supporting Quote | Source | Status |
   |-------|------------------|--------|--------|
   | 2024 detection: 30% | [quote] | [paper:page] | ✅ VERIFIED |
   | 2027 detection: 80% | "reliably detect most" | Anthropic roadmap | ⚠️ GOAL, NOT EMPIRICAL |
   | Coverage S-curve | [quote] | [paper:page] | ❌ UNVERIFIED - projection |

3. **Integration recommendations:**
   - How to incorporate time-dependent parameters without breaking existing mechanics
   - Whether to use time-gating, investment-gating, or hybrid model
   - Confidence intervals for all projections (95% CI)

4. **Grade:**
   - **A:** All claims verified with quotes
   - **B:** Most claims verified, projections clearly labeled
   - **C:** Mix of verified and unverified, needs refinement
   - **D:** Significant unverified claims, speculative synthesis
   - **F:** Phantom citations, unsupported claims

---

## Success Criteria

**Minimum for Implementation:**
- All 2024 empirical claims (30% detection, 15% coverage) verified with quotes
- Anthropic 2027 goal confirmed (with source link)
- Projections (2028-2030) clearly labeled as extrapolations
- Integration path defined (time-gate vs investment vs hybrid)

**Ideal for A-grade:**
- 90%+ of quantitative claims backed by direct quotes
- Confidence intervals provided for all projections
- Alternative scenarios if interpretability scaling fails (DeepMind concerns)
- Clear mapping to existing simulation variables

---

## References

**Primary Research File:**
- research/mechanistic_interpretability_breakthroughs_20251111.md (617 lines)

**Simulation Code:**
- src/simulation/detection.ts (general misalignment detection)
- src/simulation/behavioralDetection.ts (sandbagging detection)
- src/simulation/noiseInjectionDetection.ts (noise-based detection)
- src/simulation/gamingDetection.ts (benchmark gaming detection)
- src/simulation/alignmentDynamics.ts (alignment drift/epicycles/unknowability)

**Documentation:**
- docs/wiki/advanced/detection.md (detection ensemble architecture)
- docs/wiki/systems/alignment-dynamics.md (alignment theories)

---

## Changelog

**2025-11-13:** Initial verification file created by historian agent. Research introduces time-dependent alignment/detection parameters (2024-2030) that may supersede or enhance existing investment-based models. Awaiting research-skeptic validation.
