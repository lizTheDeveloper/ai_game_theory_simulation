# Research Verification: AI Governance Proposals (Commit ff6ff02)

**Commit:** ff6ff02cc21624329871173ac5e25e4953e7cb9a
**Date:** 2025-11-20
**File:** `research/ai_governance_international_coordination_20251113.md`
**Verification Type:** TWO-LAYER (Citation existence + Claim verification)

---

## Summary

This commit adds two major 2025 AI governance proposals from arXiv preprints:

1. **Global Moratorium Framework** (May 2025, arXiv:2505.04592)
2. **US-China Bilateral ASI Prevention Agreement** (November 2025, arXiv:2511.10783)

Both papers contain detailed quantitative parameters and governance mechanisms that need verification before implementation in simulation.

---

## Layer 1: Citation Existence Verification

### Citation 1: Global Moratorium Framework

**Source:** arXiv:2505.04592 (May 2025)
**Title (claimed):** "AI Governance to Avoid Extinction: The Strategic Landscape and Actionable Research Questions"
**Status:** ⏳ NEEDS VERIFICATION

**Verification Tasks:**
- [ ] Verify paper exists at arXiv:2505.04592
- [ ] Confirm author names, publication date
- [ ] Check paper is accessible (not withdrawn/phantom)
- [ ] Document actual title if different from claimed

**Location in code:** research/ai_governance_international_coordination_20251113.md:315

---

### Citation 2: US-China Bilateral Framework

**Source:** arXiv:2511.10783v1 (November 2025)
**Title (claimed):** "An International Agreement to Prevent the Premature Creation of Artificial Superintelligence"
**Status:** ⏳ NEEDS VERIFICATION

**Verification Tasks:**
- [ ] Verify paper exists at arXiv:2511.10783
- [ ] Confirm author names, publication date
- [ ] Check paper is accessible (not withdrawn/phantom)
- [ ] Document actual title if different from claimed

**Location in code:** research/ai_governance_international_coordination_20251113.md:329

---

## Layer 2: Claim Verification

### Critical Claims Requiring Verification

#### Claim 1: Catastrophic Risk Estimates

**Claim:** Anthropic CEO Dario Amodei estimates 10-25% chance of catastrophic outcomes
**Location:** research/ai_governance_international_coordination_20251113.md:334
**Source:** arXiv:2511.10783

**Verification Required:**
- [ ] Does paper actually cite Amodei saying 10-25%?
- [ ] Find direct quote from paper
- [ ] Check if this is attributed to Amodei or is paper authors' interpretation
- [ ] Verify context (is this p(extinction) or broader "catastrophic"?)

**Expected Evidence:** Direct quote or citation to Amodei's statement with context

---

#### Claim 2: Yoshua Bengio Risk Estimate

**Claim:** Yoshua Bengio estimates 20% probability of catastrophic outcome
**Location:** research/ai_governance_international_coordination_20251113.md:335
**Source:** arXiv:2511.10783

**Verification Required:**
- [ ] Does paper cite Bengio saying 20%?
- [ ] Find direct quote from paper
- [ ] Verify this is Bengio's personal estimate (not survey result)
- [ ] Check context and definition of "catastrophic"

**Expected Evidence:** Direct quote or citation with source

---

#### Claim 3: AI Conference Survey

**Claim:** 38% of AI conference respondents estimate ≥10% chance of outcome as bad as human extinction
**Location:** research/ai_governance_international_coordination_20251113.md:336
**Source:** arXiv:2511.10783

**Verification Required:**
- [ ] Does paper cite this specific survey result?
- [ ] Find direct quote with methodology details
- [ ] Verify 38% figure and ≥10% threshold are accurate
- [ ] Document survey source (which conference, year, sample size)

**Expected Evidence:** Direct quote with survey methodology

---

#### Claim 4: Compute Thresholds

**Claim:** Multiple specific FLOP thresholds defined
**Location:** research/ai_governance_international_coordination_20251113.md:344-349

| Parameter | Claimed Value |
|-----------|---------------|
| Hard Training Prohibition | 10²⁴ FLOP |
| Post-Training Prohibition | 10²³ FLOP |
| Monitored Training Band | 10²²-10²⁴ FLOP |
| Covered Chip Cluster (CCC) | >16 H100-equivalents (~$500k USD) |
| H100 Equivalent Unit | 990 TFLOP/s FP16 |

**Verification Required:**
- [ ] Verify each threshold appears in paper
- [ ] Find direct quotes defining each value
- [ ] Check if values are paper recommendations or existing policy
- [ ] Verify H100 equivalent definition (990 TFLOP/s FP16)
- [ ] Confirm $500k cost estimate for 16 H100s

**Expected Evidence:** Table or section from paper with exact values

---

#### Claim 5: Chip Consolidation Timeline

**Claim:** Staged timeline for chip cluster reporting
**Location:** research/ai_governance_international_coordination_20251113.md:357-361

| Phase | Threshold |
|-------|-----------|
| Day 1 | >10,000 H100-equivalents |
| Day 10 | >1,000 H100-equivalents |
| Day 100 | >100 H100-equivalents |
| Year 2 | All covered chip clusters |

**Verification Required:**
- [ ] Verify exact timeline in paper (Day 1, 10, 100, Year 2)
- [ ] Find direct quote with these specific thresholds
- [ ] Check if this is proposal or implementation plan
- [ ] Verify H100-equivalent conversions at each stage

**Expected Evidence:** Timeline table or section from paper

---

#### Claim 6: Verification Mechanisms

**Claim:** Four categories of verification mechanisms
**Location:** research/ai_governance_international_coordination_20251113.md:351-355

1. Hardware tracking (CCC reporting, supply chain, power, satellite)
2. Chip-use verification (inspections, on-chip monitoring)
3. Human intelligence (whistleblowers, stings, black market)
4. Technical oversight (training code, data, checkpoints access)

**Verification Required:**
- [ ] Verify paper proposes all four mechanisms
- [ ] Find direct quotes for each category
- [ ] Check specificity (does paper actually mention satellite surveillance, sting operations?)
- [ ] Verify "on-chip tamper-resistant monitoring" is in paper

**Expected Evidence:** Section describing verification with specific mechanisms

---

#### Claim 7: 6-Phase Implementation

**Claim:** Agreement proceeds through 6 specific phases
**Location:** research/ai_governance_international_coordination_20251113.md:363-368

1. Transparency and confidence-building
2. Enhanced communication frameworks
3. Establishing commitments, limits, verification
4. Institutionalization and deployment
5. Solving ASI safety challenges
6. Safe superintelligence implementation

**Verification Required:**
- [ ] Verify paper defines 6 phases with these exact names
- [ ] Find direct quote or table with phase descriptions
- [ ] Check if phases are sequential or parallel
- [ ] Verify "solving ASI safety challenges" is actually phase 5

**Expected Evidence:** Table or structured list from paper

---

#### Claim 8: Off-Switch Infrastructure Components

**Claim:** Moratorium proposal includes specific infrastructure
**Location:** research/ai_governance_international_coordination_20251113.md:295-301

- Compute monitoring
- Model weight security
- Algorithmic secret protection
- Emergency response systems
- Verification mechanisms

**Verification Required:**
- [ ] Verify paper lists all five components
- [ ] Find direct quotes for each
- [ ] Check if these are high-level concepts or detailed specs
- [ ] Verify "algorithmic secret protection" terminology

**Expected Evidence:** Section describing off-switch infrastructure

---

#### Claim 9: Timeline Estimates

**Claim:** "2020s or decades" for frontier systems capable of catastrophic risk
**Location:** research/ai_governance_international_coordination_20251113.md:290
**Source:** arXiv:2505.04592

**Verification Required:**
- [ ] Verify paper uses phrase "2020s or decades"
- [ ] Find direct quote with timeline estimate
- [ ] Check context (is this authors' view or citing others?)
- [ ] Document uncertainty range if specified

**Expected Evidence:** Direct quote with timeline

---

#### Claim 10: Halt Duration

**Claim:** "Decades of dedicated research" needed before safe resumption
**Location:** research/ai_governance_international_coordination_20251113.md:291
**Source:** arXiv:2505.04592

**Verification Required:**
- [ ] Verify paper says "decades" for research phase
- [ ] Find direct quote about moratorium duration
- [ ] Check if this is minimum, expected, or maximum estimate
- [ ] Document any uncertainty expressed

**Expected Evidence:** Direct quote about research timeline

---

## Simulation Parameters Requiring Validation

### New Parameters Introduced

From research/ai_governance_international_coordination_20251113.md:422-426:

```typescript
globalMoratoriumProposed: true (as of May 2025)
offSwitchInfrastructure: 0.10 (early conceptual stage)
politicalWillForHalt: 0.15 (growing awareness, limited action)
usChinaBilateralFramework: false (proposed Nov 2025, not adopted)
computeThresholdMonitoring: 0.05 (chip tracking exists but limited)
catastrophicRiskConsensus: 0.30 (growing expert agreement on 10-25% extinction risk)
bilateralCoordinationProbability: 0.20 (US-China tensions complicate cooperation)
globalEnforcementCapacity: 0.15 (export controls exist, comprehensive framework absent)
```

**Verification Questions:**
- Are these parameter values justified by papers or researcher's interpretation?
- Should these be implemented in simulation now (research phase) or after validation?
- Do papers provide any quantitative basis for 0.10, 0.15, 0.05 values?

---

## High Priority Verification Tasks

**CRITICAL (Must verify before implementation):**
1. ✅ **P1:** Verify both arXiv papers exist and are accessible
2. ✅ **P1:** Verify catastrophic risk estimates (10-25% Amodei, 20% Bengio, 38% survey)
3. ✅ **P1:** Verify compute thresholds (10²⁴ FLOP prohibition, etc.)
4. ✅ **P2:** Verify chip consolidation timeline (Day 1/10/100, Year 2)
5. ✅ **P2:** Verify verification mechanisms (on-chip monitoring, satellite surveillance)

**HIGH (Should verify before parameter implementation):**
6. ✅ **P2:** Verify 6-phase implementation structure
7. ✅ **P2:** Verify off-switch infrastructure components
8. ✅ **P3:** Verify timeline estimates ("2020s or decades", "decades of research")

---

## Validation Workflow

**Phase:** VALIDATION (research file created, ready for orchestrator)

**Next Steps:**
1. Orchestrator spawns research-skeptic for Layer 1 + Layer 2 verification
2. Research-skeptic accesses arXiv papers, extracts quotes
3. Validation results documented in this file
4. If claims verified → proceed to implementation
5. If claims unverified/modified → update research file, re-review

**Estimated Time:** 2-3 hours for full two-layer verification

---

## Notes

- **Research Quality:** Both papers are arXiv preprints (not peer-reviewed)
- **Confidence Level:** Paper quality A- downgraded from A due to preprint status
- **Implementation Risk:** Medium (detailed parameters but no peer review validation)
- **Recommendation:** Complete two-layer verification before adding to simulation GameState

**Generated by:** historian (wiki-documentation-updater)
**For orchestrator pickup:** Ready for VALIDATION phase
