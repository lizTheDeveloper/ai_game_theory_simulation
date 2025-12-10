# Research Verification Queue

**Created:** December 6, 2025
**Purpose:** Track research citations requiring verification before implementation

**Parent Spec:** [Research Standards](./spec.md)

---

## Purpose

This queue tracks research citations that need verification (Quality Gate 1) before implementation can proceed. Items move from "Active" to "Resolved" as verification completes.

**Quality Gate 1:** Research validation by super-alignment-researcher + research-skeptic agents.

---

## Active Verifications

### HIGH Priority

#### Threshold Lowering for Tipping Cascades
**Status:** ✅ CRITICAL FIXES APPLIED (Dec 8, 2025)
**Change:** (pending - needs change folder created)
**Commit:** cf49657 (original), [current] (fixes)
**Context:** Implements threshold lowering mechanism from mechanism audit gap
**Verification File:** `research/verification_cf49657_20251207.md`

**Verification Complete (Dec 7, 2025):**
- **Initial Grade:** C (super-alignment-researcher)
- **Final Grade:** D (research-skeptic downgrade)
- **Reviewers:** Cynthia (researcher), Sylvia (skeptic)

**CRITICAL Issues Found → FIXED (Dec 8, 2025):**
1. ✅ **AMOC → Amazon Sign Error:** Interaction REMOVED, extensive research note added explaining 2023-2025 evidence shows stabilizing effect (increased rainfall), not destabilizing
2. ✅ **sqrt(progress) Scaling Backwards:** Replaced with linear scaling reflecting rate-dependent accumulating effects (freshwater forcing, carbon release, albedo feedback compound over time)
3. ✅ **Missing Stabilizing Feedbacks:** AMOC → Greenland stabilizing feedback documented (currently commented - requires negative interaction support in cascade model)
4. ✅ **Quantitative Magnitudes Not Validated:** Documentation updated to clearly state values are "conservative engineering estimates pending empirical validation"
5. ✅ **0.5°C Cap Misattributed:** Relabeled as "simulation stability safeguard" not research-backed parameter

**Fixes Applied:**
- `src/types/tipping-points.ts` lines 601-617: AMOC → Amazon removed with detailed research note
- `src/types/tipping-points.ts` lines 585-595: AMOC → Greenland stabilizing feedback documented
- `src/types/tipping-points.ts` lines 517-543: Documentation rewritten to clarify engineering estimates
- `src/simulation/engine/phases/ClimateSystemPhase.ts` lines 226-233: sqrt scaling replaced with linear
- `src/simulation/engine/phases/ClimateSystemPhase.ts` lines 269-272: 0.5°C cap relabeled

**Next Steps:** Monte Carlo validation (N≥10) to verify fixes don't break cascade behavior → Move to "Recently Resolved"

---

#### AI Governance 2025 Proposals
**Status:** ✅ VERIFIED - Grade A (with implementation caveats)
**Change:** (pending - needs change folder created)
**Commit:** ff6ff02
**Context:** Global moratorium + US-China bilateral frameworks from arXiv 2025
**Verification File:** `research/verification_ff6ff02_20251207.md`

**Verification Complete (Dec 7, 2025):**
- **Factual Accuracy Grade:** A (all claims verified)
- **Policy Effectiveness:** CONDITIONAL (7 implementation challenges identified)
- **Reviewers:** Cynthia (researcher), Sylvia (skeptic)

**✅ All Claims Verified:**
- Expert risk estimates: 10-25% (Amodei - Axios), 20% (Bengio - interview), 38% (Grace et al. 2024 survey N=2,778)
- Compute thresholds: 10²⁴ FLOP verified (below GPT-4 at 2.2×10²⁵)
- H100 specs: 990 TFLOP/s FP16 (conservative), ~$25-30k/unit
- Staged consolidation timeline verified
- Verification mechanisms documented

**⚠️ Implementation Challenges (Sylvia's Critique):**
1. **CRITICAL:** Threshold obsolescence (30+ models already exceed 10²⁴ FLOP)
2. **CRITICAL:** Distributed training evasion (DiLoCo multi-datacenter bypass)
3. **CRITICAL:** Open-weights proliferation (Llama 3.1 405B irreversibly released)
4. **HIGH:** Algorithmic efficiency (1.28x/year hardware + post-Chinchilla methods)
5. **HIGH:** Expert calibration gap (Superforecasters: 0.38% vs experts: 3-12% extinction)
6. **HIGH:** US-China compliance verification harder than nuclear
7. **MEDIUM:** Unintended consequences (incumbent lock-in, beneficial AI blocked)

**Simulation Implications:**
- Implement as **proposed governance scenarios** (not validated interventions)
- Model effectiveness decay: `base * 0.85^years * (1 - distributed) * (1 - open_weights)`
- Include 5 failure pathways: obsolescence, distributed bypass, algorithmic leap, open-weights, defection
- Use risk distributions (log-uniform 0.3%-40%) not point estimates

**Next Steps:** Implementation approved with failure pathway modeling → Add to government phase mechanics

---

### MEDIUM Priority

#### Nitrogen-Food Phase 3 Technologies
**Status:** ✅ VERIFIED - Grade B+ (APPROVED with minor corrections)
**Change:** (pending - needs change folder created)
**Commit:** cd1e83a
**Context:** 6 new nitrogen reduction technologies added to tech tree
**Verification File:** `research/verification_cd1e83a_nitrogen_phase3_20251208.md`

**Verification Complete (Dec 8, 2025):**
- **Grade:** B+ (Range: B to A-, all technologies verified)
- **Reviewers:** Cynthia (super-alignment-researcher)
- **Blocking Issues:** 0

**✅ All 6 Technologies Verified:**
1. Rhizosphere Engineering - Grade A- (15-40% N reduction, field-demonstrated)
2. Nitroplast Integration - Grade B (50-70% reduction, Coale et al. 2024 *Science* ACCURATE, cereal application speculative)
3. Precision Fermentation - Grade A- (30-50% agri N reduction, commercial products exist)
4. Regional Nitrogen Policies - Grade A (20% efficiency, Nature Sustainability 2024)
5. Soil Health Restoration - Grade A- (20-40% NUE, USDA + peer-reviewed)
6. Integrated Nutrient Management - Grade B+ (25-45% efficiency, systematic review)

**Key Findings:**
- Coale et al. 2024 *Science* citation for nitroplasts: ✅ ACCURATE (April 12, 2024)
- Effectiveness ranges: ✅ EMPIRICALLY GROUNDED (2024-2025 sources)
- Timeline assumptions: ✅ RESEARCH-DEFENSIBLE
- Technologies complementary (multiplicative, not additive): ✅ CONFIRMED

**Optional Improvements (not blocking):**
1. Clarify nitroplast uncertainty (marine algae proven, cereal application aspirational)
2. Add explicit failure modes for each technology
3. Cross-reference recent 2025 research files

**Next Steps:** Monte Carlo validation (N≥10) → Move to "Recently Resolved"

---

#### Carbon Capture Deployment Parameters
**Status:** ✅ CORRECTIONS COMPLETE - Ready for Monte Carlo (Dec 8, 2025)
**Change:** (pending - needs change folder created)
**Commit:** c52826e
**Context:** Comprehensive DAC research (625 lines, 12 sources, corrected from A+ to B-)
**Research File:** `research/carbon_capture_deployment_timelines_2025.md`
**Verification Files:**
- `research/VERIFICATION_carbon_capture_deployment_20251208.md` (initial)
- `reviews/carbon_capture_skeptic_review_20251208.md` (final skeptic review)

**Verification Complete (Dec 8, 2025):**
- **Initial Grade:** B- (super-alignment-researcher)
- **Final Grade:** B- (after corrections applied)
- **Reviewers:** Cynthia (researcher), Sylvia (skeptic), Autonomous Researcher (corrections)

**CRITICAL Issues Found → FIXED (Dec 8, 2025):**
1. ✅ **Author Misattribution:** Fixed Tan, S. → Ampah, J.D., et al. (2 instances)
2. ✅ **DOI Corrected:** 10.1038/s41467-024-50637-2 → 10.1038/s41467-024-50594-5
3. ✅ **Contradictory Evidence Added:** Section 9 added with Mongabay investigation, expert skepticism, May 2025 layoffs, infrastructure requirements
4. ✅ **Gen 3 Claims Marked:** [UNVERIFIED INDUSTRY DATA] label added
5. ✅ **Energy Conflicts Documented:** 2-600x discrepancy noted with likely explanations (Gen 1 vs Gen 3, direct vs lifecycle, geothermal vs grid)

**Current Implementation:**
- `src/simulation/techTree/deploymentTimescales.ts:60` - DAC: 300 months (25 years)
- Assessment: ACCEPTABLE for base case; recommend Monte Carlo 25-50 years to capture uncertainty

**Remaining Tasks:**
1. ⚠️ **Monte Carlo validation** (N≥10) with deployment range 25-50 years (300-600 months)
2. ⚠️ **Optional:** Add energy requirement modeling (2-1200 GJ/tonne range based on tech generation)

**Next Steps:** Monte Carlo N≥10 → Move to "Recently Resolved"

---

#### AI Infrastructure Resources 2025 Update
**Status:** ✅ VERIFIED - Grade B+ (APPROVED for implementation)
**Change:** (pending - needs change folder created)
**Commit:** dbf1438
**Context:** 2025 peer-reviewed sources for AI data center resource consumption
**Research File:** `research/ai-infrastructure-resources_20251019.md` (updated)
**Verification File:** `research/verification_dbf1438_20251123.md`

**Verification Complete (Dec 8, 2025):**
- **Grade:** B+ (high-quality peer-reviewed sources, all claims verified)
- **Reviewers:** Cynthia (super-alignment-researcher)
- **Blocking Issues:** 0

**✅ All Sources Verified:**
- Nature Sustainability 2025 (Xiao & You, Cornell): ✅ EXISTS (DOI: 10.1038/s41893-025-01681-y)
- Water 731-1,125M m³/yr by 2030: ✅ ACCURATE
- Carbon 24-44M tonnes CO₂/yr by 2030: ✅ ACCURATE
- MIT 7-8× energy multiplier: ✅ VERIFIED
- IEA water 560B→1.2T liters: ✅ VERIFIED
- Arizona 7.4% state power: ✅ VERIFIED (actual: 7.43%)
- Mitigation 73% carbon, 86% water: ✅ VERIFIED

**Minor Discrepancies (not blocking):**
- Berkeley Lab 176 TWh (2023) vs file's 183 TWh (2024) - minor temporal difference
- GPT-3 CO2 552 vs 502 tonnes - due to grid carbon intensity assumptions

**No fabrications, no author misattributions detected.**

**Approved Parameters (research-backed):**
- trainingWaterL: 700K-10M L per training run ✅
- inferenceWaterL: 2-5M L/month at scale ✅
- aiTrainingMultiplier: 7.5 (MIT: 7-8×) ✅
- Geographic modifiers: desert 2.5×, nordic 0.3×, windbelt 0.7× carbon ✅

**Next Steps:** Implementation approved → Monte Carlo N≥10 after implementation → Move to "Recently Resolved"

---

## Recently Resolved

### CRITICAL-1: Coordinated Deployment Fabricated Parameter
**Status:** ✅ RESOLVED (Nov 26, 2025)
**Grade:** F → FIXED
**Commit:** 950ab53
**Finding:** "10% coordination failure probability" was fabricated - no source found
**Resolution:** Replaced with continuous coordination quality model (0.0-1.0) backed by 11 peer-reviewed sources
**New Parameters:** Base quality 0.60-0.90, scale penalty 0.10-0.30, time decay 0.05-0.15/yr
**Research:** `research/coordinated_deployment_verification_20251126.md`

---

### Climate Stability Self-Limiting Mechanisms
**Status:** ✅ CORRECTED (Nov 27, 2025)
**Grade:** D (Failed) → Citations removed/qualified
**Commit:** dc1d6ac
**Finding:** 60% of citations contradicted claims (cherry-picking detected)
**Resolution:** Citations removed, 5% floor documented as implementation choice (not research-backed)
**Research:** `research/climate_stability_self_limiting_critique_20251126.md`

---

## Workflow

### Adding to Queue

1. Identify citation needing verification
2. Create verification file: `research/verification_[commit]_[date].md`
3. Add to this queue under appropriate priority
4. Include: sources, key claims, affected files, next steps

### Running Verification

1. Invoke super-alignment-researcher agent (find papers)
2. Invoke research-skeptic agent (validate claims, find contradictions)
3. Wait for verification report
4. Grade: A/B/C/D/F
5. Update queue status

### Resolving Verification

**If Grade A/B (PASS):**
1. Proceed with implementation
2. Move to "Recently Resolved" section
3. Link verification report

**If Grade C (WEAK):**
1. Find stronger sources OR
2. Adjust parameters to match weak evidence OR
3. Remove feature

**If Grade D/F (FAIL):**
1. Block implementation
2. Adjust/remove parameters
3. Find new research
4. Re-verify
5. Move to "Recently Resolved" with FAILED → FIXED note

---

## Related Specifications

- [Research Standards](./spec.md) - Parent spec
- [Simulation Roadmap](../simulation/spec.md) - Implementation target
- [Quality Gates](../quality-gates/spec.md) - Quality Gate 1

---

## Contributing

To add an item to the verification queue, create a verification file and update this document with:
- Priority level (CRITICAL/HIGH/MEDIUM/LOW)
- Status (⚠️ READY / 🔄 IN PROGRESS / ✅ VERIFIED / ❌ FAILED)
- Change reference (or "pending")
- Commit hash
- Context (why this needs verification)
- Sources to verify
- Key claims to check
- Affected files
- Next steps
