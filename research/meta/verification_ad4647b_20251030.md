# Research Verification: Crisis Mitigation Mechanics (Commit ad4647b)

**Date:** October 30, 2025
**Commit:** ad4647b2b2f54682b55e25e16bddc4f633cda6d2
**Systems:** Crisis Mitigation Mechanics (3 new mechanisms)
**Status:** ⏳ AWAITING VERIFICATION (Layer 1 + Layer 2)

---

## Verification Requirements

This file documents research citations that require **TWO-LAYER VERIFICATION**:

**Layer 1 - Citation Existence:**
- Does the paper actually exist?
- Are author names, years, and titles accurate?
- Is the paper accessible (not phantom)?

**Layer 2 - CLAIM VERIFICATION (CRITICAL):**
- Does the paper ACTUALLY support the specific claim made in the code?
- Quote the exact passage from the paper that backs the claim
- If claim is not supported: Mark as UNVERIFIED with explanation
- Common issues to watch for:
  - Paper discusses topic but doesn't provide the specific value cited
  - Value extrapolated beyond paper's scope
  - Misinterpretation of findings
  - Cherry-picking without context

---

## Mechanic 1: Automatic Stabilizers (5% Unemployment Variance Reduction)

**Location:** `src/simulation/calculations.ts` lines 487-514

**Claim in Code:**
```typescript
// Research: GAO 2025 - Countercyclical fiscal policy framework validated
// Effect: 5% unemployment variance reduction (conservative estimate)
// TODO: Replace with CBO fiscal multiplier variance data when available
// Mechanism: Progressive tax + UI + SNAP + Medicaid auto-adjust with economic conditions
```

**Specific Claims Requiring Verification:**

### Citation 1: GAO 2025 - Countercyclical Fiscal Policy Framework

**LAYER 1 - Existence Check:**
- [ ] Paper exists and is accessible
- [ ] Authors, year, title accurate
- [ ] Not a phantom citation

**LAYER 2 - Claim Verification:**

**Claim:** "GAO 2025 validates countercyclical mechanism framework (progressive tax + UI + SNAP + Medicaid)"

**Verification Requirements:**
1. Does GAO 2025 report actually discuss countercyclical fiscal policy?
2. Does it specifically mention progressive taxation + UI + SNAP + Medicaid as automatic stabilizers?
3. Does it provide a framework for how these mechanisms work?

**Expected Evidence:**
- Quote from GAO 2025 report describing the countercyclical mechanism
- Page numbers and section references
- Context: Is this a primary claim or tangential mention?

**Claim:** "5% unemployment variance reduction (conservative estimate)"

**Verification Requirements:**
1. Does GAO 2025 (or ANY cited source) provide a quantitative estimate of variance reduction?
2. If not, what is the BASIS for the 5% figure?
3. Is this extrapolated, assumed, or empirically grounded?

**Expected Evidence:**
- Quote from source providing variance reduction estimate
- OR: Explicit acknowledgment that 5% is a placeholder/assumption
- If assumption: Document the reasoning and mark as TODO for empirical data

**Verification Status:**
- [ ] Layer 1 Complete
- [ ] Layer 2 Complete
- [ ] VERIFIED / UNVERIFIED / PARTIALLY VERIFIED

---

## Mechanic 2: Participatory Governance (5% Resentment Reduction + 15% Backfire)

**Location:**
- `src/simulation/resentmentRecovery.ts`
- `src/simulation/engine/phases/ResentmentRecoveryPhase.ts`

**Claim in Code:**
```typescript
// Research: Cambridge Core 2024 (minipublics), PMC 2022 (participatory budgeting), vTaiwan
// Effect: Democratic tech governance reduces alienation OR backfires if tokenistic
// TODO: Need national-scale participatory governance studies for empirical calibration
// Scale: 1,000,000× extrapolation from municipal (thousands) to global (billions)
// NOTE: Hypothesis to test - scaling local evidence to national/global context
```

**Specific Claims Requiring Verification:**

### Citation 2: Cambridge Core 2024 - Minipublics

**LAYER 1 - Existence Check:**
- [ ] Paper exists and is accessible
- [ ] Authors, year, title accurate
- [ ] Cambridge Core 2024 is a PUBLISHER, not a paper - need specific paper title/authors

**LAYER 2 - Claim Verification:**

**Claim:** "Minipublics reduce alienation at municipal scale"

**Verification Requirements:**
1. What is the SPECIFIC paper from Cambridge Core 2024?
2. Does it study minipublics and alienation/resentment?
3. What scale was studied (municipal, regional, national)?
4. What effect size was observed?

**Expected Evidence:**
- Full citation: Authors, Year, Title, Journal, DOI
- Quote describing effect on alienation/resentment
- Sample size, study design, effect magnitude
- Scale of implementation studied

**Verification Status:**
- [ ] Layer 1 Complete (need specific paper, not just publisher)
- [ ] Layer 2 Complete
- [ ] VERIFIED / UNVERIFIED / PARTIALLY VERIFIED

---

### Citation 3: PMC 2022 - Participatory Budgeting

**LAYER 1 - Existence Check:**
- [ ] Paper exists and is accessible
- [ ] Authors, year, title accurate
- [ ] PMC 2022 is PubMed Central (database), not a paper - need specific paper title/authors

**LAYER 2 - Claim Verification:**

**Claim:** "Participatory budgeting reduces resentment at municipal scale"

**Verification Requirements:**
1. What is the SPECIFIC paper from PMC 2022?
2. Does it study participatory budgeting and resentment/alienation?
3. What scale was studied?
4. What effect size was observed?
5. Does it discuss backfire effects (tokenistic participation)?

**Expected Evidence:**
- Full citation: Authors, Year, Title, Journal, DOI
- Quote describing effect on resentment
- Sample size, study design, effect magnitude
- Any discussion of backfire/negative effects

**Verification Status:**
- [ ] Layer 1 Complete (need specific paper, not just database)
- [ ] Layer 2 Complete
- [ ] VERIFIED / UNVERIFIED / PARTIALLY VERIFIED

---

### Citation 4: vTaiwan - National-Scale Digital Democracy

**LAYER 1 - Existence Check:**
- [ ] vTaiwan is a real system (not a research paper)
- [ ] Need research papers ABOUT vTaiwan, not just the platform itself
- [ ] Identify specific academic studies evaluating vTaiwan outcomes

**LAYER 2 - Claim Verification:**

**Claim:** "vTaiwan demonstrates national-scale participatory governance (26M population)"

**Verification Requirements:**
1. What academic papers study vTaiwan's effectiveness?
2. Do they measure effects on alienation, resentment, or trust?
3. What were the observed effects?
4. Does any research discuss backfire effects or failures?

**Expected Evidence:**
- Academic papers studying vTaiwan (authors, year, title, journal)
- Empirical data on participation rates, outcomes, public sentiment
- Any discussion of limitations, failures, or negative effects

**Claim:** "15% backfire effect when governance quality < 0.4 (tokenistic participation)"

**Verification Requirements:**
1. Does ANY cited source provide quantitative backfire effect?
2. Is the 15% figure empirically grounded or assumed?
3. Is the 0.4 threshold (governance quality) empirically grounded?

**Expected Evidence:**
- Quote from source providing backfire magnitude
- OR: Explicit acknowledgment that 15% and 0.4 are assumptions
- If assumptions: Document reasoning and mark as TODO

**Verification Status:**
- [ ] Layer 1 Complete (identify specific academic papers)
- [ ] Layer 2 Complete
- [ ] VERIFIED / UNVERIFIED / PARTIALLY VERIFIED

---

## Mechanic 3: Homeostatic Bounds (2.75 pp/year Unemployment Recovery)

**Location:** `src/simulation/calculations.ts` lines 516-546

**Claim in Code:**
```typescript
// Research: New Deal 1933-1937 - Unemployment fell from 25% → 14% over 4 years
// Effect: Prevents 95% unemployment edge cases via historical recovery rates
// Monthly rate: 2.75 / 12 = 0.229 percentage points per month
// NOTE: "Plausible bounds from historical precedent," NOT calibrated mechanism
```

**Specific Claims Requiring Verification:**

### Citation 5: New Deal Historical Data (1933-1937)

**LAYER 1 - Existence Check:**
- [ ] Historical unemployment data for 1933-1937 exists
- [ ] Data source identified (BLS, Census, academic analysis)
- [ ] Data is reliable and widely accepted

**LAYER 2 - Claim Verification:**

**Claim:** "New Deal unemployment fell from 25% → 14% over 4 years (1933-1937)"

**Verification Requirements:**
1. What is the SOURCE of this historical data?
2. Are the 25% and 14% figures accurate for 1933 and 1937?
3. Is the 4-year timeframe correct?
4. Does source account for methodological changes in unemployment measurement?

**Expected Evidence:**
- Citation: BLS, U.S. Census, or peer-reviewed historical analysis
- Exact unemployment figures for 1933 and 1937
- Context: Was recovery linear or non-linear?
- Any caveats about measurement methodology

**Claim:** "Recovery rate applies to prevent 95% unemployment edge cases"

**Verification Requirements:**
1. Is New Deal recovery rate (11 pp / 4 years) applicable to modern scenarios?
2. Are there structural differences that would affect recovery speed?
3. Is this a defensible upper bound for recovery, or optimistic?

**Expected Evidence:**
- Comparison to other historical recoveries (2008, COVID)
- Discussion of structural factors affecting recovery speed
- Acknowledgment of limitations in applying 1930s data to 2025+ scenarios

**Verification Status:**
- [ ] Layer 1 Complete
- [ ] Layer 2 Complete
- [ ] VERIFIED / UNVERIFIED / PARTIALLY VERIFIED

---

## Summary of Verification Needs

**Total Citations:** 5
- GAO 2025 (countercyclical fiscal policy)
- Cambridge Core 2024 (minipublics) - **INCOMPLETE: need specific paper**
- PMC 2022 (participatory budgeting) - **INCOMPLETE: need specific paper**
- vTaiwan research - **INCOMPLETE: need academic studies**
- New Deal historical data (1933-1937)

**Quantitative Claims Needing Verification:**
1. 5% unemployment variance reduction (automatic stabilizers)
2. 5% resentment reduction (participatory governance success)
3. 15% resentment increase (participatory governance backfire)
4. 0.4 governance quality threshold
5. 2.75 pp/year unemployment recovery rate (New Deal)

**Known Issues:**
- "Cambridge Core 2024" and "PMC 2022" are publishers/databases, not papers
- Need specific paper titles, authors, and DOIs for these citations
- vTaiwan needs academic studies (not just platform description)
- Backfire effect (15%) and threshold (0.4) may be assumptions, not empirical

---

## Next Steps for Orchestrator

**Phase 1: Research-Skeptic Validation** (this file is the input)
1. Verify Layer 1 (citation existence) for all 5 citations
2. Obtain full papers for review
3. Verify Layer 2 (claim accuracy) - quote specific passages
4. Identify any fabrications, misinterpretations, or unjustified extrapolations
5. Document which claims are VERIFIED vs UNVERIFIED

**Phase 2: Implementation Updates** (if needed)
- If claims are UNVERIFIED: Add TODO comments to code
- If values are assumptions: Document reasoning and mark for future calibration
- If citations are incomplete: Get full citations and update code comments

**Phase 3: Documentation**
- Update research files with verified citations
- Create parameter justification document if needed
- Add to wiki with verification status

---

**Created:** October 30, 2025
**Agent:** historian (wiki-documentation-updater)
**Ready for:** research-skeptic validation (Layer 1 + 2)
