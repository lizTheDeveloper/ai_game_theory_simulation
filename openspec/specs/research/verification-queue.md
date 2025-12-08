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
**Status:** ⚠️ READY FOR VALIDATION
**Change:** (pending - needs change folder created)
**Commit:** cd1e83a
**Context:** 6 new nitrogen reduction technologies added to tech tree
**Verification File:** `research/verification_cd1e83a_20251121.md`

**Technologies to Verify:**
1. Rhizosphere Engineering (15-40% N reduction, TIER 1, commercial)
2. Nitroplast Integration (50-70% reduction, breakthrough, Coale et al. 2024)
3. Precision Fermentation (30-50% agri N reduction, emerging)
4. Regional Nitrogen Policies (20% efficiency via redistribution)
5. Soil Health Restoration (20-40% NUE improvement)
6. Integrated Nutrient Management (25-45% efficiency gains)

**Key Claims:**
- Effectiveness ranges (15-40%, 20-45%, etc.)
- Co-benefits quantification (soil health, biodiversity, carbon)
- Timeline assumptions (R&D + deployment)
- Citation: Coale et al. 2024 *Science* for nitroplasts

**Next Steps:** Two-layer verification → Parameter adjustments if needed → Monte Carlo validation

---

#### Carbon Capture Deployment Parameters
**Status:** ✅ CORRECTIONS APPLIED (Dec 8, 2025)
**Change:** (pending - needs change folder created)
**Commit:** c52826e (original), edfb85b1 (corrections)
**Context:** Comprehensive DAC research (625 lines, 12 sources, claimed A+ quality)
**Research File:** `research/carbon_capture_deployment_timelines_2025.md`
**Verification Files:**
- `research/VERIFICATION_carbon_capture_deployment_20251208.md` (initial)
- `reviews/carbon_capture_skeptic_review_20251208.md` (final skeptic review)

**Verification Complete (Dec 8, 2025):**
- **Initial Grade:** B- (super-alignment-researcher)
- **Final Grade:** C+ (research-skeptic downgrade)
- **Reviewers:** Cynthia (researcher), Sylvia (skeptic)

**CRITICAL Issues Found → FIXED:**
1. ✅ **Author Misattribution (BLOCKING):** "Tan, S., et al." → "Ampah, J.D., et al." throughout (verified via PMC11283554)
2. ✅ **Systematic Optimism Bias:** Section 1.4 added with contradictory evidence
3. ✅ **Gen 3 Claims Unverified:** Marked [UNVERIFIED INDUSTRY DATA] throughout, Canary Media disclaimer added
4. ⚠️ **Energy Data Conflicts:** Documented as uncertainty range in research file (requires Monte Carlo)

**Contradictory Evidence ADDED (Section 1.4):**
- ✅ Mongabay investigation: Mammoth 805 tonnes actual vs 36,000 capacity (96.7% gap)
- ✅ Expert skepticism: Jacobson (Stanford), Foley (Project Drawdown) quotes
- ✅ May 2025 Climeworks layoffs: 22% workforce reduction (106 positions)
- ✅ Infrastructure bottleneck: 96,000km pipeline requirement for 1 Gt/yr
- ✅ AI energy competition context

**Current Implementation:**
- `src/simulation/techTree/deploymentTimescales.ts:60` - DAC: 300 months (25 years)
- Assessment: ACCEPTABLE but at optimistic end; recommend Monte Carlo 25-50 years

**Corrections Applied (Commit edfb85b1):**
1. ✅ Author attribution fixed: Tan → Ampah (all 5+ instances)
2. ✅ Contradictory evidence section added (Section 1.4)
3. ✅ May 2025 industry update added (Climeworks layoffs, funding challenges)
4. ✅ Gen 3 claims marked [UNVERIFIED] (lines 92-95, 199, 239, 319)
5. ✅ New references added (Mongabay, Bloomberg, CNN, Sifted)
6. ✅ Frontmatter updated (verification_status, research_quality, correction tracking)

**Remaining Tasks:**
1. ⚠️ Monte Carlo parameter sweep (25-50 years deployment range)
2. ⚠️ Energy requirement reconciliation (document as uncertainty)

**Next Steps:** Monte Carlo validation (N≥10) → Move to "Recently Resolved"

---

#### AI Infrastructure Resources 2025 Update
**Status:** ⚠️ READY FOR VALIDATION
**Change:** (pending - needs change folder created)
**Commit:** dbf1438
**Context:** 2025 peer-reviewed sources for AI data center resource consumption
**Research File:** `research/ai-infrastructure-resources_20251019.md` (updated)
**Verification File:** `research/verification_dbf1438_20251123.md`

**Sources to Verify:**
- Cornell/Nature Sustainability 2025: 2030 water (731-1,125M m³/yr), carbon (24-44M tonnes CO₂/yr)
- MIT/Lawrence Berkeley Lab 2025: 7-8× energy multiplier, 183 TWh U.S. data centers (2024)
- IEA 2025: Global water 560B→1,200B liters (2024→2030)

**Key Claims:**
- 2030 water projections: 731-1,125M cubic meters/year
- 2030 carbon projections: 24-44 million metric tons CO₂/year
- AI training clusters 7-8× energy multiplier
- Geographic optimization: Midwest "windbelt" optimal, Arizona 7.4% state power
- Mitigation potential: 73% carbon reduction, 86% water reduction

**Proposed Parameters:**
- trainingWaterL: 700K-10M L per training run
- inferenceWaterL: 2-5M L/month at scale
- aiTrainingMultiplier: 7.5 (MIT: 7-8×)
- Geographic modifiers: desert 2.5×, nordic 0.3×, windbelt 0.7× carbon

**Next Steps:** Two-layer verification → Parameter update decision → Monte Carlo if implemented

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
