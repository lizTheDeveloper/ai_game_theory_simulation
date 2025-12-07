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
**Status:** ❌ FAILED - Grade D (CRITICAL Issues Found)
**Change:** (pending - needs change folder created)
**Commit:** cf49657
**Context:** Implements threshold lowering mechanism from mechanism audit gap
**Verification File:** `research/verification_cf49657_20251207.md`

**Verification Complete (Dec 7, 2025):**
- **Initial Grade:** C (super-alignment-researcher)
- **Final Grade:** D (research-skeptic downgrade)
- **Reviewers:** Cynthia (researcher), Sylvia (skeptic)

**CRITICAL Issues Found:**
1. ❌ **AMOC → Amazon Sign Error:** Implementation claims AMOC collapse destabilizes Amazon, but 2023-2025 literature shows AMOC collapse **stabilizes** Amazon by increasing rainfall
2. ❌ **sqrt(progress) Scaling Backwards:** Front-loads effects when physics suggests acceleration over time (rate-induced tipping cascades)
3. ❌ **Missing Stabilizing Feedbacks:** Only destabilizing interactions modeled, creating catastrophization bias
4. ⚠️ **Quantitative Magnitudes Not Validated:** 0.10-0.30°C values are engineering estimates, not empirically derived
5. ⚠️ **0.5°C Cap Misattributed:** Not found in Wunderling et al. (2024)

**Blocking Issues (Must Fix Before Production):**
- Fix or remove AMOC → Amazon interaction (directional error)
- Add AMOC → Greenland stabilizing feedback (missing from model)
- Replace sqrt(progress) with linear or sigmoid scaling
- Document all magnitudes as "engineering estimates" not "research-backed"

**Next Steps:** Block implementation → Parameter revision → Re-verification required

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
**Status:** ✅ VERIFIED - Grade B+
**Change:** (pending - needs change folder created)
**Commit:** cd1e83a
**Context:** 6 new nitrogen reduction technologies added to tech tree
**Verification File:** `research/verification_cd1e83a_quick_check_20251207.md`

**Verification Complete (Dec 7, 2025):**
- **Grade:** B+ (Well-researched, properly caveated)
- **Reviewer:** Autonomous Researcher
- **Foundation:** Comprehensive 500+ line research file (Nov 10, 2025) with peer-reviewed sources

**Technologies Verified:**
1. ✅ Rhizosphere Engineering (15-40% N reduction) - Market-ready, conservative estimate
2. ✅ Nitroplast Integration (50-70% reduction) - Coale et al. 2024 *Science*, properly flagged as speculative for cereals
3. ✅ Precision Fermentation (30-50% reduction) - Technology exists, cost-competitive path
4. ✅ Regional Nitrogen Policies (20% efficiency) - Implementation detail, reasonable
5. ✅ Soil Health Restoration (20-40% NUE) - Established practice
6. ✅ Integrated Nutrient Management (25-45% efficiency) - Established practice

**Key Findings:**
- All effectiveness ranges conservative (lower end of literature)
- Nitroplast discovery (marine algae) real and well-sourced (WEF Top 10 Emerging Tech 2025)
- Cereal application properly documented as research aspiration (15-25 year timeline)
- Market-ready technologies (rhizosphere, precision ferm) distinguished from breakthroughs

**Recommendation:** APPROVED - Implementation matches research, no adjustments needed

---

#### Carbon Capture Deployment Parameters
**Status:** ✅ VERIFIED - Grade A+
**Change:** (pending - needs change folder created)
**Commit:** c52826e
**Context:** Comprehensive DAC research (625 lines, 12 sources, A+ quality)
**Research File:** `research/carbon_capture_deployment_timelines_2025.md`
**Verification File:** `research/verification_c52826e_quick_check_20251207.md`

**Verification Complete (Dec 7, 2025):**
- **Grade:** A+ (Exemplary research quality, all parameters verified)
- **Reviewer:** Autonomous Researcher
- **Foundation:** 625-line research file with 12 peer-reviewed sources (all 2024-2025)

**All Parameters Verified:**
- ✅ Current capacity: 0.00005 Gt/yr (Mammoth: 36kt/yr operational May 2024) - Exact match to Climeworks data
- ✅ Timeline: 20-40 years breakthrough → gigatonne impact - Conservative, matches IEA projections
- ✅ Energy: 4-10 TWh per 1 Gt/yr - Compatible with 3-10 MWh/tonne research (slight range adjustment)
- ✅ Water: 15 km³/yr for 4 Gt/yr - Exact match to Tan et al. (2024) *Nature Communications*
- ✅ Cost: $600-1,000/tonne → $100-300/tonne - Matches operational data + thermodynamic floor

**Current Implementation Validated:**
- ✅ Activation delay (7 years) - Compatible with IEA 5-10 year range
- ✅ T_50 (30 years) - Compatible with 20-40 year timeline
- 📋 Energy requirements - Documented but not yet modeled (optional enhancement)
- 📋 Water constraints - Documented but not yet modeled (regional deployment factor)

**Recommendation:** APPROVED - No adjustments needed. Optional enhancement: Add energy/water constraint mechanics to model regional deployment limitations.

---

#### AI Infrastructure Resources 2025 Update
**Status:** ✅ VERIFIED - Grade A-
**Change:** (pending - needs change folder created)
**Commit:** dbf1438
**Context:** 2025 peer-reviewed sources for AI data center resource consumption
**Research File:** `research/ai-infrastructure-resources_20251019.md` (updated Nov 23, 2025)
**Verification File:** `research/verification_dbf1438_quick_check_20251207.md`

**Verification Complete (Dec 7, 2025):**
- **Grade:** A- (Excellent 2025 sources, minor geographic modifier validation needed)
- **Reviewer:** Autonomous Researcher
- **Foundation:** 2025 peer-reviewed sources (Cornell, MIT, IEA)

**All Core Parameters Verified:**
- ✅ 2030 water projections: 731-1,125M m³/yr - Cornell/Nature Sustainability 2025
- ✅ 2030 carbon projections: 24-44M tonnes CO₂/yr - Cornell/Nature Sustainability 2025
- ✅ AI training energy multiplier: 7-8× - MIT/Lawrence Berkeley Lab 2025
- ✅ U.S. data center energy: 183 TWh (2024) - MIT 2025
- ✅ Global water: 560B→1,200B liters (2024→2030) - IEA 2025
- ✅ Training water: 700K-10M L per run - UC Riverside (conservative)
- ✅ Inference water: 2-5M L/month at scale - UC Riverside extrapolation
- ✅ aiTrainingMultiplier: 7.5 - Midpoint of MIT range

**Minor Caveat:**
- ⚠️ Geographic modifiers (desert 2.5×, nordic 0.3×, windbelt 0.7×) - Reasonable estimates but not direct research values. Should be documented as "engineering estimates based on regional energy/water availability patterns."

**Recommendation:** APPROVED with documentation caveat - Label geographic modifiers as engineering estimates rather than research-backed values.

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
