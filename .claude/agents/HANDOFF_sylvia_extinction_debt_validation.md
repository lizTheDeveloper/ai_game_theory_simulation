# Handoff to Sylvia (Research Skeptic): Extinction Debt Validation

**From:** Orchestrator
**To:** Sylvia (research-skeptic)
**Date:** December 9, 2025
**Priority:** MEDIUM (Quality Gate 1 - blocks implementation)

---

## Task

Validate the research foundation for **Extinction Debt Modeling** before implementation proceeds.

This is a MEDIUM priority feature (3-5 days) that will add extinction debt state tracking to model delayed biodiversity loss continuing 50-400 years after habitat degradation.

---

## Context

**Current Problem:** The simulation treats biodiversity loss as instantaneous when thresholds are crossed. In reality, extinction debt means species loss continues for decades to centuries after habitat degradation even if conditions improve.

**Proposal Location:** `openspec/changes/extinction-debt-modeling/`

**What This Feature Will Do:**
- Queue extinctions when habitat degrades (instead of instant loss)
- Realize queued extinctions gradually over 50-400 years (ecosystem-specific)
- Track committed vs realized extinctions separately
- Link extinction debt to pollination services → food production impacts
- Make biodiversity recovery appropriately slow (no instant bounce-back)

---

## Files to Review

**Primary:**
- `openspec/changes/extinction-debt-modeling/proposal.md`
- `openspec/changes/extinction-debt-modeling/specs/simulation/spec.md`
- `openspec/changes/extinction-debt-modeling/tasks.md`

**Supporting:**
- `research/biodiversity_extinction_rates_20251113.md` (existing research)
- `reviews/research_debate_session_20251125.md` (extinction debt identified as missing critical system)

---

## Sources Cited (Need Verification)

**Foundational:**
1. **Tilman et al. (1994)** - "Habitat destruction and the extinction debt" (foundational paper)
2. **Kuussaari et al. (2009)** - European grasslands 50-200yr debt
3. **Dullinger et al. (2013)** - Alpine plants 300-400yr debt from warming
4. **Isbell et al. (2011)** - Trophic cascade delays

**Need to find:** Recent 2024-2025 updates

---

## Key Claims to Verify

1. **Lag Times:** Extinction debt causes 50-400 year lag in species loss after habitat degradation
2. **Four Mechanisms:**
   - Population viability lag - Small populations persist but non-viable long-term
   - Trophic cascade delays - Predator/prey imbalances take decades to manifest
   - Mutualism collapse - Pollinator networks fail gradually
   - Climate velocity mismatch - Species can't migrate fast enough
3. **Ecosystem-Specific Lag Times:**
   - Grasslands: 50-200 years
   - Alpine plants: 300-400 years
   - Marine ecosystems: (need timescale)
   - Tropical forests: (need timescale)
4. **Pollination Impact:** Pollinator extinction debt should affect food production
5. **Recovery Impossibility:** Biodiversity can't recover instantly when conditions improve

---

## Your Mission (Quality Gate 1)

**Validate the research foundation using your standard criteria:**

1. **Verify Citations:**
   - Are these papers real and correctly cited?
   - Do they actually support the claims made?
   - Are there more recent 2024-2025 sources?

2. **Check Parameter Justification:**
   - Why 50-200 years for grasslands? (Data-backed?)
   - Why 300-400 years for alpine? (Actual measurements?)
   - Are these ranges conservative or optimistic?
   - What about marine/tropical ecosystems?

3. **Find Contradictory Evidence:**
   - Are there papers showing FASTER debt repayment?
   - Are there cases where biodiversity DID bounce back quickly?
   - What conditions allow recovery vs irreversibility?

4. **Assess Mechanisms:**
   - Are the four mechanisms well-established science?
   - Are they independent or overlapping?
   - Which is dominant in different ecosystems?

5. **Check for Cherry-Picking:**
   - Are we citing only papers that support long lags?
   - What's the full range of estimates in literature?
   - Any systematic reviews or meta-analyses?

---

## Quality Gate 1 Criteria

**Grade the research foundation (A/B/C/D/F):**

- **A (Excellent):** 2+ peer-reviewed sources per ecosystem, clear mechanisms, recent sources, contradictory evidence addressed
- **B (Good):** Core claims verified, minor gaps in recent sources or specific ecosystems
- **C (Weak):** Foundational work solid but needs strengthening (more sources, better justification)
- **D (Poor):** Major gaps in evidence, unclear mechanisms, cherry-picking detected
- **F (Fail):** Fabricated citations, contradictory evidence ignored, implementation should be blocked

**Critical Issues to Flag:**
- Any fabricated or misattributed citations (BLOCKING)
- Missing major contradictory evidence (BLOCKING)
- Parameter ranges unjustified (BLOCKING)
- Ecosystem coverage gaps (HIGH priority)

---

## Deliverable

Create verification report at: **`reviews/extinction_debt_validation_20251209.md`**

**Report Structure:**
1. Executive Summary (grade, pass/fail, critical issues)
2. Citation Verification (each source checked)
3. Parameter Justification Assessment (lag times per ecosystem)
4. Contradictory Evidence Search (what we might be missing)
5. Mechanism Validation (four mechanisms verified)
6. Recommendations (strengthen/proceed/block)

---

## Next Steps After Your Report

**If Grade A/B (PASS):**
- Proceed to implementation (feature-implementer)
- Address minor recommendations during implementation

**If Grade C (WEAK):**
- Invoke super-alignment-researcher to find stronger sources
- Adjust parameters to match weak evidence
- Re-validate with you

**If Grade D/F (FAIL):**
- Block implementation
- Either find new research or pivot feature
- This would be added to verification queue as failed

---

## Research Standards Reminder

From project research standards:
- 2+ peer-reviewed sources (2024-2025 preferred)
- Parameter justification (why this number?)
- Mechanism description (how it works)
- Interaction map (what affects/is affected)
- Expected timeline (when does it matter)
- Failure modes (what can go wrong)

---

## Notes

- This feature was identified in your Nov 25 research debate session as a "missing critical system"
- The proposal already exists (created by autonomous-worker based on your recommendation)
- Implementation affects: BiosphereTippingPhase, new ExtinctionDebtPhase, GameState, food security
- Success criteria include Monte Carlo validation N≥10, CV < 0.01% determinism

---

**Your call, Sylvia. Does the research foundation support implementation, or do we need to dig deeper first?**
