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
**Status:** 🚨 CRITICAL REGRESSION - FIXES REVERTED (Dec 9, 2025)
**Change:** (pending - needs change folder created)
**Commit:** cf49657 (original), b6771427 (fixes), HEAD (reverted)
**Context:** Implements threshold lowering mechanism from mechanism audit gap
**Verification File:** `research/verification_cf49657_20251207.md`
**Regression Report:** `research/CRITICAL_regression_threshold_lowering_20251209.md`

**Verification Complete (Dec 7, 2025):**
- **Initial Grade:** C (super-alignment-researcher)
- **Final Grade:** D (research-skeptic downgrade)
- **Reviewers:** Cynthia (researcher), Sylvia (skeptic)

**CRITICAL Issues Found → FIXED (Dec 8, commit b6771427) → REGRESSED (Dec 8-9):**
1. 🚨 **AMOC → Amazon Sign Error:** Interaction REMOVED with research note in b6771427, BUT FIX WAS REVERTED - incorrect destabilizing interaction restored in HEAD
2. ❓ **sqrt(progress) Scaling:** Status unknown - may also be reverted
3. ❓ **Missing Stabilizing Feedbacks:** Status unknown - may be reverted
4. ❓ **Quantitative Magnitudes:** Status unknown - may be reverted
5. ❓ **0.5°C Cap:** Status unknown - may be reverted

**Regression Details (Dec 9, 2025 audit):**
- Commit b6771427 (Dec 8, 11:30 UTC) correctly removed AMOC → Amazon with detailed research note
- Between b6771427 and HEAD, fixes were reverted (likely merge conflict)
- Current code (src/types/tipping-points.ts:497-502) has OLD, INCORRECT interaction
- Research notes deleted, scientifically wrong code restored
- Verification queue incorrectly showed "FIXED" but code audit found regression

**Files Requiring Re-Fix:**
- `src/types/tipping-points.ts` - AMOC → Amazon must be removed/commented again
- `src/simulation/engine/phases/ClimateSystemPhase.ts` - Verify linear scaling not reverted
- All 5 fixes need re-audit against commit b6771427

**Next Steps:**
1. **CRITICAL:** Route to simulation-maintainer to re-apply b6771427 fixes
2. Audit all 5 fixes for regression (not just AMOC → Amazon)
3. Monte Carlo validation (N≥10) after fixes re-applied
4. Add pre-commit hook to prevent research note deletions

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
**Status:** ✅ VERIFIED - Grade B+ (Dec 9, 2025)
**Change:** (pending - needs change folder created)
**Commit:** cd1e83a
**Context:** 6 new nitrogen reduction technologies added to tech tree
**Verification File:** `research/verification_cd1e83a_20251209.md`

**Verification Complete (Dec 9, 2025):**
- **Overall Grade:** B+ (Strong evidence, minor gaps)
- **Reviewer:** Autonomous Researcher

**✅ Fully Verified Technologies:**
1. Rhizosphere Engineering (15-40% N reduction) - Grade A- (multiple 2024-2025 studies)
2. Nitroplast Integration (50-70% reduction, Coale et al. 2024 *Science*) - Grade A (AAAS prize winner)
3. Soil Health Restoration (20-40% NUE improvement) - Grade A (Nature Communications meta-analysis)

**⚠️ Partially Verified Technologies:**
4. Precision Fermentation (30-50% agri N reduction) - Grade C+ (indirect evidence, no direct peer-reviewed support for 30-50%)
5. Regional Nitrogen Policies (20% efficiency) - Grade C (engineering estimate, not research-backed)
6. Integrated Nutrient Management (25-45% efficiency) - Grade B (overlap with soil health unclear)

**Key Findings:**
- Coale et al. 2024 citation: ✅ VERIFIED (*Science*, AAAS Newcomb Cleveland Prize 2025)
- Rhizosphere engineering: ✅ VERIFIED (15% wheat study, 10-40% biofertilization range)
- Soil health NUE: ✅ VERIFIED (Nature meta-analysis: 30% improvement from 48% to 78%)
- Precision fermentation: ⚠️ 30-50% lacks direct support (mechanism plausible via livestock displacement)
- Regional policies: ⚠️ 20% not directly verified (plausible but engineering estimate)

**Recommended Adjustments:**
1. Precision fermentation: Adjust to "20-40% agricultural nitrogen reduction" with uncertainty bounds
2. Regional policies: Document as engineering estimate, add Monte Carlo uncertainty Uniform(10%, 30%)
3. Integrated management: Clarify non-additive stacking with soil health restoration
4. Technology stacking: Use multiplicative effects, not additive

**Next Steps:** Implement with Monte Carlo uncertainty distributions → Run N≥10 validation → Monitor 2025-2026 literature

---

#### Carbon Capture Deployment Parameters
**Status:** ✅ CORRECTED - Ready for Implementation (Dec 9, 2025)
**Change:** (pending - needs change folder created)
**Commit:** c52826e
**Context:** Comprehensive DAC research (625 lines, 12 sources)
**Research File:** `research/carbon_capture_deployment_timelines_2025.md` (CORRECTED)
**Verification Files:**
- `research/VERIFICATION_carbon_capture_deployment_20251208.md` (initial)
- `reviews/carbon_capture_skeptic_review_20251208.md` (final skeptic review)

**Verification Complete (Dec 8, 2025):**
- **Initial Grade:** B- (super-alignment-researcher)
- **Final Grade:** C+ (research-skeptic downgrade)
- **Post-Correction Grade:** C+ (Conditional pass - critical corrections applied)
- **Reviewers:** Cynthia (researcher), Sylvia (skeptic)

**CRITICAL Issues Found → FIXED:**
1. ✅ **Author Misattribution:** Fixed - Tan → Ampah throughout (Dec 8)
2. ✅ **Contradictory Evidence Added:** Mongabay investigation, expert skepticism, May 2025 layoffs (Dec 8)
3. ✅ **Gen 3 Claims Marked:** [UNVERIFIED INDUSTRY DATA] tags added (Dec 8)
4. ⚠️ **Energy Data Conflicts:** Documented but not reconciled (acceptable - reflects genuine uncertainty in literature)

**Current Implementation:**
- `src/simulation/techTree/deploymentTimescales.ts:60` - DAC: 300 months (25 years)
- Assessment: ACCEPTABLE but at optimistic end; recommend Monte Carlo 25-50 years

**Corrections Applied (Dec 8, 2025):**
1. ✅ Fix author attribution: Tan → Ampah throughout
2. ✅ Add contradictory evidence section (Mongabay, expert quotes)
3. ✅ Add May 2025 industry update (layoffs)
4. ✅ Mark Gen 3 claims as [UNVERIFIED INDUSTRY DATA]
5. ⚠️ Energy data conflicts documented (not blocking - reflects literature uncertainty)
6. ⚠️ Monte Carlo range 25-50 years recommended for future implementation

**Next Steps:** Monte Carlo validation (N≥10) to test deployment timeline sensitivity → Move to "Recently Resolved"

---

#### AI Infrastructure Resources 2025 Update
**Status:** ✅ VERIFIED - Grade B+ (with critical omissions identified)
**Change:** (pending - needs change folder created)
**Commit:** dbf1438
**Context:** 2025 peer-reviewed sources for AI data center resource consumption
**Research File:** `research/ai-infrastructure-resources_20251019.md` (updated)
**Verification File:** `research/VERIFICATION_ai_infrastructure_resources_20251209.md`

**Verification Complete (Dec 9, 2025):**
- **Factual Accuracy Grade:** B+ (well-sourced, accurate citations)
- **Completeness:** MODERATE GAPS (rebound effects, immersion cooling)
- **Reviewers:** Cynthia (researcher verification)

**✅ All Core Claims Verified:**
- Cornell/Nature Sustainability 2025: 731-1,125M m³/yr water, 24-44M tonnes CO₂/yr (PEER-REVIEWED)
- MIT/Lawrence Berkeley Lab: 7-8× energy multiplier, 183 TWh U.S. 2024 (VERIFIED)
- IEA 2025: 560B→1,200B liters global water 2024→2030 (VERIFIED)
- GPT-3 training: 1,287 MWh, 552 tons CO₂ (WIDELY REPLICATED)
- Arizona: 7.4% state power (2023 data - VERIFIED BUT OUTDATED, 2030 projection is 16.5%)
- Geographic optimization: Windbelt states (Texas, Montana, Nebraska, South Dakota) optimal (VERIFIED)

**⚠️ CRITICAL Omissions Identified:**
1. **Rebound Effects NOT Modeled:** Google achieved 33× efficiency gain but emissions rose 50% since 2019 (usage growth offsets gains)
2. **Immersion Cooling Missing:** 99% water reduction potential, Microsoft commitment, not integrated into 2030 projections
3. **Mitigation Percentages Overstated:** 73%/86% reductions assume best-case adoption (no policy evidence)
4. **Uncertainty Ranges Underemphasized:** 54-83% variation from lower bound (need stochastic modeling)
5. **Water Overestimation Risk:** Andy Masley identified 4,500× error in popular media (Hao's "Empire of AI"); peer-reviewed sources more credible

**Simulation Implications:**
- Use uncertainty distributions: Uniform(731M, 1,125M) m³ water, Uniform(24, 44) Mt CO₂
- Add rebound effect mechanism: netGain = efficiency × (1 - reboundCoefficient), where rebound ~0.60
- Model immersion cooling adoption: Beta(2,8) → mean 20%, reduces water by 99%
- Arizona: Time-varying 7.4% (2023) → 16.5% (2030)
- Mitigation adoption sensitivity: 20%/50%/70% → 15%/36%/73% carbon reductions

**Next Steps:** Implement parameters with stochastic modeling → Monte Carlo validation N≥10 → Move to Recently Resolved

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
