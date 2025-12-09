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
**Status:** ⚠️ CONDITIONAL PASS - PARAMETER REVISIONS REQUIRED (Dec 9, 2025)
**Change:** (pending - needs change folder created)
**Commit:** cd1e83a
**Context:** 6 new nitrogen reduction technologies added to tech tree
**Verification Files:**
- `research/verification_cd1e83a_nitrogen_phase3_20251208.md` (Cynthia: B+)
- `reviews/nitrogen_phase3_skeptic_review_20251209.md` (Sylvia: B-)

**Verification Complete (Dec 9, 2025):**
- **Initial Grade:** B+ (Cynthia - Super-Alignment Researcher)
- **Final Grade:** B- (Sylvia - Research Skeptic downgrade)
- **Reviewers:** Cynthia (verification), Sylvia (skeptic critique)

**CRITICAL Issues Found:**
1. **Rhizosphere Engineering:** 80%+ commercial inoculant failure rate (Koziol et al. 2025 *New Phytologist*)
2. **Rebound Effects NOT Modeled:** Jevons paradox - efficiency ≠ absolute reduction (20-40% overestimation)
3. **Consumer Acceptance Underestimated:** 68% find precision fermentation "unnatural"
4. **No-Till Mixed Evidence:** Context-dependent, not universal benefits
5. **Nitroplast Timeline Optimistic:** 50+ years realistic (oxygen sensitivity barrier)

**Required Parameter Revisions:**
1. Rhizosphere: 15-40% → **10-25%** (commercial deployment reality)
2. Nitroplast: 15-25 years → **30-50 years minimum**, add "may be infeasible" flag
3. Precision Fermentation: 30-50% → **15-30%** (consumer resistance)
4. Regional Policies: 20% gross → **10-15% net** (rebound effects)
5. Soil Health: 20-40% → **15-30%** (context-dependent)
6. Integrated Systems: 25-45% → **15-35%** (deployment complexity)

**Additional Modeling Required:**
- Deployment failure rates (mycorrhizal products: 80% fail)
- Rebound effects mechanism (Jevons paradox)
- Consumer behavior dynamics (precision ferm acceptance)

**Next Steps:** Apply parameter revisions → Monte Carlo validation N≥10 → Move to Recently Resolved

---

#### Carbon Capture Deployment Parameters
**Status:** ❌ CONDITIONAL PASS - CORRECTIONS REQUIRED (Dec 8, 2025)
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
- **Reviewers:** Cynthia (researcher), Sylvia (skeptic)

**CRITICAL Issues Found:**
1. **Author Misattribution (BLOCKING):** "Tan, S., et al." cited 5x - actual author is Ampah, J.D., et al. (verified via PMC)
2. **Systematic Optimism Bias:** Zero skeptical perspectives, all counterevidence omitted
3. **Gen 3 Claims Unverified:** Canary Media explicitly states "not independently confirmed"
4. **Energy Data Conflicts:** 2-3 TWh vs 4-10 TWh vs 1,200 TWh per Gt/yr (2-600x disagreement)

**Missing Contradictory Evidence (Dec 2024 - May 2025):**
- Mongabay investigation: Mammoth actual removal 805 tonnes (96.7% below capacity)
- Expert skepticism: Jacobson (Stanford): "greenwashing technology"
- May 2025 Climeworks layoffs: 22% workforce cut
- Infrastructure: 96,000km pipeline needed for 1 Gt/yr

**Current Implementation:**
- `src/simulation/techTree/deploymentTimescales.ts:60` - DAC: 300 months (25 years)
- Assessment: ACCEPTABLE but at optimistic end; recommend Monte Carlo 25-50 years

**Corrections Required Before Production:**
1. ✅ Fix author attribution: Tan → Ampah throughout
2. ✅ Add contradictory evidence section (Mongabay, expert quotes)
3. ✅ Add May 2025 industry update (layoffs)
4. ✅ Mark Gen 3 claims as [UNVERIFIED INDUSTRY DATA]
5. ⚠️ Reconcile energy requirement data
6. ⚠️ Update Monte Carlo range to 25-50 years

**Next Steps:** Corrections by original researcher → Re-verification → Monte Carlo N≥10

---

#### AI Infrastructure Resources 2025 Update
**Status:** ⚠️ VERIFIED (B+) - IMPLEMENTATION PENDING
**Change:** (pending - needs change folder created)
**Commit:** dbf1438
**Context:** 2025 peer-reviewed sources for AI data center resource consumption
**Research File:** `research/ai-infrastructure-resources_20251019.md` (updated)
**Verification File:** `research/VERIFICATION_ai_infrastructure_resources_20251209.md`

**Verification Complete (Dec 9, 2025):**
- **Factual Accuracy Grade:** B+ (well-sourced, accurate citations)
- **Completeness:** MODERATE GAPS (rebound effects, immersion cooling)
- **Reviewers:** Cynthia (researcher verification)
- **Status:** Research validated, implementation deferred to next sprint

**✅ All Core Claims Verified:**
- Cornell/Nature Sustainability 2025: 731-1,125M m³/yr water, 24-44M tonnes CO₂/yr (PEER-REVIEWED)
- MIT/Lawrence Berkeley Lab: 7-8× energy multiplier, 183 TWh U.S. 2024 (VERIFIED)
- IEA 2025: 560B→1,200B liters global water 2024→2030 (VERIFIED)
- GPT-3 training: 1,287 MWh, 552 tons CO₂ (WIDELY REPLICATED)
- Arizona: 7.4% state power (2023 data - VERIFIED BUT OUTDATED, 2030 projection is 16.5%)
- Geographic optimization: Windbelt states (Texas, Montana, Nebraska, South Dakota) optimal (VERIFIED)

**⚠️ CRITICAL Omissions Identified (documented, not blocking):**
1. **Rebound Effects NOT Modeled:** Google achieved 33× efficiency gain but emissions rose 50% since 2019 (usage growth offsets gains)
2. **Immersion Cooling Missing:** 99% water reduction potential, Microsoft commitment, not integrated into 2030 projections
3. **Mitigation Percentages Overstated:** 73%/86% reductions assume best-case adoption (no policy evidence)
4. **Uncertainty Ranges Underemphasized:** 54-83% variation from lower bound (need stochastic modeling)
5. **Water Overestimation Risk:** Andy Masley identified 4,500× error in popular media (Hao's "Empire of AI"); peer-reviewed sources more credible

**Simulation Implications (for future implementation):**
- Use uncertainty distributions: Uniform(731M, 1,125M) m³ water, Uniform(24, 44) Mt CO₂
- Add rebound effect mechanism: netGain = efficiency × (1 - reboundCoefficient), where rebound ~0.60
- Model immersion cooling adoption: Beta(2,8) → mean 20%, reduces water by 99%
- Arizona: Time-varying 7.4% (2023) → 16.5% (2030)
- Mitigation adoption sensitivity: 20%/50%/70% → 15%/36%/73% carbon reductions

**Next Steps:** Implementation deferred (MEDIUM priority) → Await next sprint allocation

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
