# Research Consensus Action Items - Status Check
**Date:** October 28, 2025
**Checked by:** Main Claude assistant

---

## 1. AI Water Consumption Fix (HIGH Priority)

**Consensus:** `research-consensus-20251028_220455.txt`
**Status:** ❌ **NOT DONE** (0 of 3 required changes implemented)

### Required Changes

**File:** `src/simulation/aiInfrastructureResources.ts`

#### Change 1: Training Water Parameter ❌
- **Current:** `WATER_TRAINING_PER_CAPABILITY = 10.0` (line 41)
- **Required:** `2.0` (2-5× too high)
- **Justification:** GPT-3 (5.4M L) ÷ 3.0 capability = 1.8M, round to 2.0M
- **Status:** NOT CHANGED

#### Change 2: Inference Water Parameter ❌
- **Current:** `WATER_INFERENCE_BASE = 2.0` (line 33)
- **Required:** `1.0` (2× too high)
- **Justification:** Better matches 2025 ChatGPT scale (~80M L/year = 6.7M L/month)
- **Status:** NOT CHANGED

#### Change 3: Demand Elasticity (Jevons Paradox) ❌
- **Current:** No elasticity modeling present
- **Required:** Add demand multiplier (lines 88-92 area)
```typescript
const demandElasticity = totalCapability < 5.0 ? 1.3 : 1.1;
const inferenceWater = (WATER_INFERENCE_BASE + logarithmicTerm) * demandElasticity;
```
- **Justification:** 2015-2020 AI saw 10× efficiency gains but 100× usage growth = 10× MORE resources
- **Status:** NOT IMPLEMENTED

#### Change 4: WUE Improvement Rate (Optional) ⚠️
- **Current:** `WUE_IMPROVEMENT_RATE_YEARLY = 0.05` (line 62)
- **Suggested:** `0.10` (5%/year → 10%/year)
- **Justification:** Microsoft 2021-2024 trajectory shows 17%/year (0.49 → 0.30 L/kWh)
- **Status:** NOT CHANGED (but optional)

### Time Estimate: 1-2 hours

### Consensus Agreement
- ✅ Sylvia (skeptic) + Cynthia (optimist) AGREED
- ✅ Existing infrastructure is sound (just parameter recalibration needed)
- ✅ Research grounded in Li et al. (2023), Patterson et al. (2022), Lei et al. (2025)

---

## 2. Mortality Documentation Checklist (MEDIUM Priority)

**Consensus:** `research-consensus-20251028_215926.txt`
**Status:** ⚠️ **PARTIAL** (2 of 8 items done)

### 8-Item Checklist

#### ✅ Item 3: Cite Lenton et al. (2019) - DONE
- **Location:** `src/simulation/specificTippingPoints.ts:12`
- **Citation:** "Lenton et al. 2019, Nature Climate Change: 'Climate tipping points'"
- **Wiki:** Also in BIBLIOGRAPHY.md
- **Status:** COMPLETE

#### ✅ Item 7: Scenario Framing - PARTIAL
- **Found:** "Realistic Timeline Recalibration" framing in specificTippingPoints.ts
- **Missing:** Not labeled as "Compressed Tipping Cascade" or "Accelerated Worst-Case"
- **Status:** PARTIAL - needs explicit caveat language

#### ❌ Item 1: Cite Richards et al. (2023) - NOT DONE
- **Required:** Document 6 billion deaths from 8-12°C runaway warming (magnitude precedent)
- **Search result:** NOT FOUND in code or wiki bibliography
- **Note:** Found "Richardson et al. 2023" (planetary boundaries) but NOT "Richards et al. 2023" (mortality)
- **Status:** MISSING - citation may not exist or needs verification

#### ❌ Item 2: Document Timeline Compression - NOT DONE
- **Required:** "75 years → 30 years compression" caveat in code comments and wiki
- **Search result:** No mentions of "timeline compression", "75 year", or explicit acceleration caveats
- **Status:** NOT DOCUMENTED

#### ❌ Item 4: Cite Kemp et al. (2022) - NOT DONE
- **Required:** Heat exposure framework (2 billion at risk, NOT 2B deaths)
- **Search result:** NOT FOUND in code or wiki bibliography
- **Status:** MISSING

#### ❌ Item 5: Add Uncertainty Ranges - NOT DONE
- **Required:** Best/expected/worst-case scenarios in Monte Carlo outputs
- **Search result:** No uncertainty bounds in monteCarloSimulation.ts
- **Status:** NOT IMPLEMENTED

#### ❌ Item 6: Add Sensitivity Analysis - NOT DONE
- **Required:** Test cascades 2× slower, synergies 50% less multiplicative
- **Search result:** No sensitivity analysis code found
- **Status:** NOT IMPLEMENTED

#### ❌ Item 8: Acknowledge Exploratory Modeling - NOT DONE
- **Required:** Explicit statement in documentation about modeling at edge of literature
- **Search result:** No "exploratory modeling" language found
- **Status:** NOT DOCUMENTED

### Time Estimate: 2-3 hours

### Consensus Agreement
- ✅ Sylvia (skeptic) + Cynthia (optimist) AGREED
- ✅ Model architecture is sound (documentation only, no code changes)
- ✅ Framework validity confirmed (planetary boundaries, tipping cascades are peer-reviewed)
- ⚠️ Timeline compression acknowledged (2.5× faster than Richards et al.)
- ⚠️ Ecosystem → mortality conversion factors are derived, need validation

---

## 3. Research Citation Verification (CRITICAL Priority)

**Consensus:** `research-consensus-20251028_230150.txt`
**Status:** 🔄 **IN PROGRESS** (Cynthia working on this)

### Issue
- **23% fabrication rate** in verified sample (5/22 citations)
- **242 total citations** need systematic audit
- **Root cause:** LLM hallucination (real papers with fake authors, or completely invented papers)

### Immediate Actions (Per Consensus)
1. ✅ Flag ALL unverified citations with warnings - ONGOING
2. ✅ Prioritize verification for critical mechanics (mortality, AI capabilities, tipping points) - ONGOING
3. ✅ Use conservative defaults where research is unverified - ONGOING

### Trust Recovery Standard
- DOI verification + PDF retrieval + author name verification
- "Et al." citations require full author list check
- Recent papers (2024-2025) require extra scrutiny
- **Assume fake until proven real** (given 23% base rate)

### Status
- **Lead:** Cynthia (researcher) actively working
- **Progress:** Some citations verified (e.g., wiki water consumption error found and corrected)
- **Remaining:** Large corpus of 242 citations still needs systematic audit

---

## SUMMARY: What Needs to Be Done

### Immediate (1-2 hours) - HIGH Priority
**AI Water Consumption Fix:**
- Change 2 constants (10.0 → 2.0, 2.0 → 1.0)
- Add 3 lines for demand elasticity
- Optionally change WUE rate (0.05 → 0.10)
- File: `src/simulation/aiInfrastructureResources.ts`

### Short-term (2-3 hours) - MEDIUM Priority
**Mortality Documentation:**
- Add 2 missing citations to bibliography (Richards, Kemp)
- Add timeline compression caveats to code comments
- Add "Compressed Tipping Cascade" scenario framing
- Add uncertainty ranges to Monte Carlo outputs
- Add sensitivity analysis code
- Document exploratory modeling stance

### Ongoing - CRITICAL Priority
**Citation Verification:**
- Continue systematic audit (Cynthia leading)
- 242 citations, 23% fabrication rate
- Prioritize critical mechanics first

---

## FILES TO UPDATE

### Water Consumption (1-2h)
- `src/simulation/aiInfrastructureResources.ts` (lines 33, 41, 88-92, optionally 62)

### Mortality Documentation (2-3h)
- `docs/wiki/BIBLIOGRAPHY.md` (add 2 citations)
- `src/simulation/specificTippingPoints.ts` (add timeline caveat)
- `src/simulation/environmental.ts` (add exploratory modeling note)
- `scripts/monteCarloSimulation.ts` (add uncertainty ranges, sensitivity analysis)
- `docs/wiki/mechanics/mortality-system.md` (create if doesn't exist, document caveats)

---

**Total Immediate Work:** 3-5 hours
**Status:** 2 of 11 required items complete (18% done)
