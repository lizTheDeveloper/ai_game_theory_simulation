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
**Status:** ✅ VERIFIED - READY FOR IMPLEMENTATION (Dec 8, 2025)
**Change:** (pending - needs change folder created)
**Commit:** cd1e83a → 98d2f9eb (verification complete)
**Context:** 6 new nitrogen reduction technologies added to tech tree
**Verification Files:**
- `research/nitrogen_food_phase3_verification_20251208.md` (Cynthia - Grade B+)
- `reviews/nitrogen_food_phase3_critique_20251208.md` (Sylvia - Grade B+ CONFIRMED)

**Verification Complete (Dec 8, 2025):**
- **Grade:** B+ (VERIFIED with parameter adjustments)
- **Reviewers:** Cynthia (researcher), Sylvia (skeptic)

**Key Adjustments Applied:**
1. ✅ **Nitroplast Split:** Separated into 2 pathways (indirect 5-10yr @ 5-10%, direct 20-40+yr @ 50-70%)
2. ✅ **Rhizosphere Conservative:** Adjusted to 20% (field-verified, avoiding optimistic high-end)
3. ✅ **Precision Fermentation:** 40% retained (model-based derivation validated)
4. ✅ **INM Double-Counting:** Protection added (0.25 + interaction check)
5. ✅ **Regional Policies:** 20% efficiency validated
6. ✅ **Soil Health:** 20-40% NUE improvement confirmed

**Next Steps:** Implementation approved → Monte Carlo validation (N≥10) → Move to "Recently Resolved"

---

#### Carbon Capture Deployment Parameters
**Status:** ✅ CORRECTED - READY FOR IMPLEMENTATION (Dec 8, 2025)
**Change:** (pending - needs change folder created)
**Commit:** c52826e
**Context:** Comprehensive DAC research (625 lines, 12 sources, claimed A+ quality)
**Research File:** `research/carbon_capture_deployment_timelines_2025.md`
**Verification Files:**
- `research/VERIFICATION_carbon_capture_deployment_20251208.md` (initial)
- `reviews/carbon_capture_skeptic_review_20251208.md` (final skeptic review)

**Verification Complete (Dec 8, 2025):**
- **Initial Grade:** B- (super-alignment-researcher)
- **Final Grade:** C+ (research-skeptic downgrade)
- **Post-Correction Grade:** B (acceptable for production)
- **Reviewers:** Cynthia (researcher), Sylvia (skeptic), Autonomous Researcher (corrections)

**CRITICAL Issues Found → FIXED:**
1. ✅ **Author Misattribution:** All "Tan, S., et al." replaced with "Ampah, J.D., et al." (PMC11283554 verified)
2. ✅ **Systematic Optimism Bias:** Added "Critical Counterevidence and Skeptical Perspectives" section (60+ lines)
3. ✅ **Gen 3 Claims:** Marked as [UNVERIFIED INDUSTRY DATA] with Canary Media disclaimer
4. ✅ **May 2025 Industry Update:** Added Climeworks 22% layoffs, policy risk documentation
5. ✅ **Expert Skepticism:** Added Jacobson (Stanford), Foley quotes
6. ✅ **Actual Performance Data:** Added Mongabay investigation (805 tonnes vs 36,000 nameplate)
7. ✅ **Infrastructure Requirements:** Added 96,000km pipeline requirement, energy competition with AI

**Corrections Applied (Dec 8, 2025):**
- Frontmatter updated: research_quality A+ → B, last_verified → 2025-12-08
- New section added: "Critical Counterevidence and Skeptical Perspectives"
- 4 new references added (Mongabay, Bloomberg, CNN, Sifted)
- Simulation implications updated: "wide uncertainty bands (25-50 years)"

**Current Implementation:**
- `src/simulation/techTree/deploymentTimescales.ts:60` - DAC: 300 months (25 years)
- Assessment: ACCEPTABLE at optimistic end; recommend Monte Carlo 25-50 years for future update

**Next Steps:** Monte Carlo validation N≥10 to verify deployment parameters → Move to "Recently Resolved"

---

#### AI Infrastructure Resources 2025 Update
**Status:** ✅ VERIFIED - READY FOR IMPLEMENTATION (Dec 8, 2025)
**Change:** (pending - needs change folder created)
**Commit:** dbf1438
**Context:** 2025 peer-reviewed sources for AI data center resource consumption
**Research File:** `research/ai-infrastructure-resources_20251019.md` (updated)
**Verification Files:**
- `research/meta/verification_dbf1438_20251123.md` (protocol)
- `research/ai_infrastructure_verification_20251208.md` (complete verification)

**Verification Complete (Dec 8, 2025):**
- **Grade:** A- (HIGH QUALITY)
- **Verifier:** Autonomous Researcher
- **Status:** All major claims VERIFIED

**Citations Verified:**
1. ✅ **Cornell/Nature Sustainability (2025):** DOI 10.1038/s41893-025-01681-y confirmed
   - Authors: Tianqi Xiao, Fengqi You (Cornell PEESE lab) ✅
   - 2030 water: 731-1,125M m³/yr ✅ EXACT MATCH
   - 2030 carbon: 24-44M tonnes CO₂/yr ✅ EXACT MATCH
   - Mitigation: 73% carbon, 86% water reduction ✅ EXACT MATCH
   - Geographic: Midwest "windbelt" optimal ✅ EXACT MATCH

2. ✅ **MIT/Berkeley Lab (2025):** MIT News article verified
   - Authors: Noman Bashir, Elsa A. Olivetti ✅
   - 7-8× energy multiplier ✅ DIRECT QUOTE
   - North America: 2,688 MW (2022) → 5,341 MW (2023) ✅ EXACT MATCH
   - Global: 460 TWh (2022) → 1,050 TWh (2026) ✅ EXACT MATCH
   - GPT-3 training: 1,287 MWh, 552 tonnes CO₂ ✅ EXACT MATCH

3. ✅ **IEA/Pew Research (2025):** Pew article verified (IEA secondary source)
   - U.S. 2024: 183 TWh = 4% national electricity ✅ EXACT MATCH
   - 2028 projection: 12% national electricity ✅ EXACT MATCH
   - Water: 560B-1,200B liters range ✅ CONFIRMED

**Parameter Justification:**
- `trainingWaterL: 700K-10M L` - ✅ JUSTIFIED (GPT-3: 700K L, UC Riverside)
- `aiTrainingMultiplier: 7.5` - ✅ JUSTIFIED (MIT: "7 or 8 times")
- `inferenceWaterL: 2-5M L/month` - ✅ JUSTIFIED (resolves 50M L/month 100-1000× error)
- Geographic multipliers (2.5×, 0.3×, 0.7×) - ⚠️ NEEDS QUANTIFICATION (qualitative findings only)

**Minor Issues:**
- IEA data via Pew (secondary source) - acceptable but direct IEA report preferred
- Geographic multipliers need quantification OR document as engineering estimates

**Next Steps:** Ready for implementation → Document geographic multipliers as estimates if used → Monte Carlo validation

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
