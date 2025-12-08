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
**Status:** ❌ CONDITIONAL BLOCK - Grade C+
**Change:** (pending - needs change folder created)
**Commit:** cd1e83a
**Context:** 6 new nitrogen reduction technologies added to tech tree
**Verification File:** `research/nitrogen_tech_verification_20251208.md`
**Critique File:** `reviews/nitrogen_tech_verification_critique_20251208.md`

**Verification Complete (Dec 8, 2025):**
- **Research Grade:** B- (super-alignment-researcher)
- **Final Grade:** C+ (research-skeptic downgrade)
- **Reviewers:** Cynthia (researcher), Sylvia (skeptic)

**CRITICAL Issues Found:**
1. ❌ **Nitroplast Integration (Grade D):** Coale et al. 2024 is MARINE ALGAE research with ZERO crop application. Claims of 50-70% reduction by 2030s are science fiction. **REMOVE or move to TIER 4 speculative (2060s+)**
2. ❌ **Regional Nitrogen Policies (Grade D):** No global 20% efficiency claim found. EU study shows 20% fertilizer reduction → only 10-16% surplus reduction. **REMOVE or substantially reframe**
3. ⚠️ **Integrated Nutrient Management (Grade C):** Claims 25-45% but research shows 12-21%. **Correct to 15-25%**
4. ⚠️ **Soil Health Restoration (Grade C+):** Conflates cover crops (+22% NUE) with no-till (-1% to -9% NUE). **Split into separate technologies**

**Technologies Approved (with adjustments):**
- ✅ Rhizosphere Engineering (Grade B+): 15-40% range supported, narrow to 15-25% (40% is hydroponic lettuce, not field crops)
- ✅ Precision Fermentation (Grade B-): Environmental benefits excellent, 30-50% nitrogen reduction is reasonable inference from dietary shift

**Blocking Issues:**
- Remove Nitroplast Integration (marine biology ≠ crop application)
- Remove or reframe Regional Policies (no global evidence)
- Correct INM effectiveness (25-45% → 15-25%)
- Split Soil Health into Cover Crops (positive) + Conservation Tillage (separate)

**Next Steps:** Block implementation → Parameter revision → Re-verification required

---

#### Carbon Capture Deployment Parameters
**Status:** ✅ VERIFIED - Grade B+ (with critical corrections required)
**Change:** (pending - needs change folder created)
**Commit:** c52826e
**Context:** Comprehensive DAC research (625 lines, 12 sources, claimed A+ quality)
**Research File:** `research/carbon_capture_deployment_timelines_2025.md`
**Verification File:** `research/VERIFICATION_carbon_capture_deployment_20251208.md`
**Critique File:** `reviews/DAC_verification_critical_review_20251208.md`

**Verification Complete (Dec 8, 2025):**
- **Initial Grade:** A- (super-alignment-researcher, downgraded from claimed A+)
- **Final Grade:** B+ (research-skeptic downgrade)
- **Reviewers:** Cynthia (researcher), Sylvia (skeptic)

**CRITICAL Errors Found:**
1. ❌ **1000x Energy Calculation Error:** Summary claims "4-10 TWh per 1 Gt/yr" but correct value is **1,400-4,200 TWh per 1 Gt/yr** (body has correct data, summary has error). At 10 Gt/yr, DAC would require >40% of global electricity.
2. ❌ **Attribution Error:** Paper is by **Ampah et al. (2024)** *Nature Communications*, NOT "Tan et al."
3. ⚠️ **Overly Optimistic Cost Floor:** $100/tonne challenged by multiple 2024 sources as "thermodynamically unrealistic" → Use $200-300/tonne floor
4. ⚠️ **Missing Uncertainty Framing:** MIT (Nov 2024): "Likelihood of deploying DAC at gigatonne scale is **highly uncertain**" - not reflected in research

**Verified Claims:**
- ✅ Mammoth operational: 36,000 tonnes/year (May 2024)
- ✅ Global DAC capacity: ~0.00005 Gt/yr
- ✅ Water consumption: 15 km³/year for 4 Gt/yr
- ✅ Current costs: $600-1,000/tonne
- ✅ Timeline range: 20-40 years to gigatonne scale (but uncertain)

**Implementation Parameters:**
- ✅ `activationDelay: 7 years` - Reasonable (though IEA source unclear)
- ✅ `T_50: 30 years` - Well-justified (middle of 20-40 year range)
- ⚠️ **Add uncertainty:** T_50 should use Monte Carlo variance: triangular(25, 40, 60)
- ⚠️ **Add grid constraint:** <100 gCO2/kWh for net-negative capture
- ⚠️ **Energy coupling:** Must model 1,400-4,200 TWh requirement

**Required Corrections:**
1. Fix attribution (Tan → Ampah)
2. Fix energy summary (1,400-4,200 TWh, not 4-10 TWh)
3. Add uncertainty framing ("highly uncertain" per MIT)
4. Revise cost floor to $200-300/tonne
5. Add T_50 variance for Monte Carlo runs
6. Add grid carbon intensity constraint

**Next Steps:** Apply corrections → Add uncertainty modeling → Proceed with implementation

---

#### AI Infrastructure Resources 2025 Update
**Status:** ✅ VERIFIED - Grade B- (with attribution corrections required)
**Change:** (pending - needs change folder created)
**Commit:** dbf1438
**Context:** 2025 peer-reviewed sources for AI data center resource consumption
**Research File:** `research/ai-infrastructure-resources_20251019.md` (updated)
**Verification File:** `research/VERIFICATION_ai-infrastructure-resources_20251208.md`
**Critique File:** `reviews/ai_infrastructure_resources_critique_20251208.md`

**Verification Complete (Dec 8, 2025):**
- **Initial Grade:** B+ (super-alignment-researcher, downgraded from claimed A+)
- **Final Grade:** B- (research-skeptic downgrade)
- **Reviewers:** Cynthia (researcher), Sylvia (skeptic)

**Attribution Errors Found:**
1. ❌ **MIT/Berkeley Lab Conflation:** File attributes "183 TWh" to "MIT/Lawrence Berkeley Lab" but it's actually from **IEA 2025**. Berkeley Lab's 2023 figure was 176 TWh (different year, different number).
2. ❌ **Arizona 7.4% Misattribution:** Appears under "Cornell/Nature Sustainability (2025)" section but actually from Arizona utility reports (separate source).
3. ⚠️ **Geographic Multipliers:** Desert 2.5×, Nordic 0.3×, Windbelt 0.7× are **model parameters**, not direct measurements from research.
4. ⚠️ **Windbelt Math Error:** 73% carbon reduction = 0.27× multiplier, NOT 0.7×

**Verified Claims:**
- ✅ Cornell/Nature Sustainability (2025): Water 731-1,125M m³/yr, carbon 24-44M tonnes (2030)
- ✅ MIT (2024-2025): 7-8× energy multiplier for **training** (not inference)
- ✅ IEA (2025): 560B→1,200B liters water (2024→2030), 183 TWh U.S. data centers
- ✅ Mitigation: 73% carbon, 86% water (Cornell paper)
- ✅ Windbelt optimization (TX, MT, NE, SD optimal locations)

**Implementation Issues:**
1. ⚠️ **7-8× multiplier is training only:** Inference is ~2-3×, not 7-8×. Generic application will overestimate ongoing costs.
2. ⚠️ **Missing efficiency improvements:** Historical data shows energy grew 6× slower than traffic due to efficiency gains. 2030 projections may be high.
3. ⚠️ **Geographic multipliers need sensitivity analysis:** They're informed estimates, not validated measurements.

**Required Corrections:**
1. Fix MIT/IEA attribution (183 TWh → IEA, not Berkeley Lab)
2. Move Arizona 7.4% to separate section (not Cornell)
3. Split energy multiplier: training 7.5× / inference 2.5×
4. Fix Windbelt multiplier (0.7× → 0.27×)
5. Flag geographic multipliers as "model parameters, not measurements"
6. Add efficiency improvement factor (0.5-0.8× on 2030 projections)
7. Use projection ranges, not point estimates

**Approved Parameters (with corrections):**
- ✅ trainingWaterL: 700K-10M L per training run (UC Riverside measured)
- ✅ inferenceWaterL: base + scaling × log2(capability + 1) (efficiency gains)
- ⚠️ aiTrainingMultiplier: 7.5 (training) / 2.5 (inference) - split required
- ⚠️ Geographic: desert 2.5×, nordic 0.3×, windbelt 0.27× (not 0.7×) - flag as estimates

**Next Steps:** Apply attribution corrections → Split training/inference multipliers → Add uncertainty modeling → Proceed with implementation

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
