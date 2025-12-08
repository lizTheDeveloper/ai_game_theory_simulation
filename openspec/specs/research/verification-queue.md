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
**Status:** ⚠️ CONDITIONAL APPROVE - Grade B- (Parameter Adjustments Required)
**Change:** (pending - needs change folder created)
**Commit:** cd1e83a
**Context:** 6 new nitrogen reduction technologies added to tech tree
**Verification File:** `research/verification_cd1e83a_nitrogen_tech_20251208.md`
**Skeptic Review:** `reviews/nitrogen_tech_skeptic_review_20251208.md`

**Verification Complete (Dec 8, 2025):**
- **Initial Grade:** B+ (super-alignment-researcher)
- **Final Grade:** B- (research-skeptic downgrade)
- **Reviewers:** Cynthia (researcher), Sylvia (skeptic)

**Technologies Verified:**
1. ✅ Rhizosphere Engineering - **Adjust upper bound 40% → 20%**
2. ⚠️ Nitroplast Integration - **Timeline 2030s → 2044+, add failure mode**
3. ⚠️ Precision Fermentation - **Add energy dependency modeling**
4. ⚠️ Regional Nitrogen Policies - **Reduce effectiveness 20% → 10%**
5. ✅ Soil Health Restoration - Validated (30% NUE)
6. ✅ Integrated Nutrient Management - Validated (35% efficiency)

**CRITICAL Issues Found:**
1. ❌ **Nitroplast Timeline:** Claim 2030s, evidence requires 2044+ (20 years minimum, decades of failed attempts)
2. ❌ **Mycorrhizal Inoculant Crisis:** Commercial products 84% non-viable, 9% colonization vs 39% field soil

**Required Parameter Adjustments:**
- Nitroplast: minMonth: 240 (20yr), successProbability: 0.15, add failure pathway
- Rhizosphere: max effectiveness 0.20 (not 0.40)
- All techs: add reboundEffects multiplier 0.6
- Regional policies: 10% effectiveness (not 20%), extend timeline

**Next Steps:** Parameter revision → Re-verification → Monte Carlo validation

---

#### Carbon Capture Deployment Parameters
**Status:** ⚠️ CONDITIONAL APPROVE - Grade B- (Parameter Adjustments Required)
**Change:** (pending - needs change folder created)
**Commit:** c52826e
**Context:** Comprehensive DAC research (625 lines, 12 sources, A+ quality)
**Research File:** `research/carbon_capture_deployment_timelines_2025.md`
**Verification File:** `research/verification_c52826e_DAC_20251208.md`
**Skeptic Review:** `reviews/DAC_verification_skeptic_review_20251208.md`

**Verification Complete (Dec 8, 2025):**
- **Initial Grade:** B+ (super-alignment-researcher)
- **Final Grade:** B- (research-skeptic downgrade)
- **Reviewers:** Cynthia (researcher), Sylvia (skeptic)

**Parameters Verified:**
- ✅ activationDelay (7 years) - IEA 2024 validated, but add uncertainty (7-15yr range)
- ✅ T_50 (30 years) - Research-backed, but add uncertainty (30-50yr range)
- ❌ tau (20 years) - **Citation error:** Biogeosciences 2025 doesn't exist in research
- ❌ E_max (1.0 Gt/yr) - **4x too conservative** vs 4.2 Gt/yr climate requirement

**CRITICAL Issues Found:**
1. ❌ **Cost Floor Disputed:** Claim $100/tonne, ETH Zurich 2024 says $230-540/tonne realistic
2. ❌ **Moral Hazard Not Modeled:** 48% of CDR experts say CDR expectations reduce mitigation
3. ❌ **Scaling Rate Optimistic:** Requires 50% faster CAGR than solar PV peak (unprecedented)
4. ❌ **Missing Energy/Water Coupling:** Allows fossil-powered DAC (negative climate impact)

**Required Parameter Adjustments:**
- Cost floor: $200-250/tonne (not $100)
- Add moral hazard feedback: DAC deployment reduces mitigation pressure
- T_50 uncertainty: 30-50 years (not point estimate)
- Add rebound coefficient: ~0.2
- Add energy coupling: requires clean energy or increases emissions
- Add water constraints: regional deployment limits

**Next Steps:** Parameter revision → Re-verification → Monte Carlo validation

**Next Steps:** Two-layer verification → Parameter validation → Enhancement implementation (energy/water constraints) → Monte Carlo N≥10

---

#### AI Infrastructure Resources 2025 Update
**Status:** ✅ CONDITIONAL APPROVE - Grade B+ (Rebound Effects Required)
**Change:** (pending - needs change folder created)
**Commit:** dbf1438
**Context:** 2025 peer-reviewed sources for AI data center resource consumption
**Research File:** `research/ai-infrastructure-resources_20251019.md` (updated Nov 23, 2025)
**Verification File:** `research/verification_dbf1438_AI_infrastructure_20251208.md`
**Skeptic Review:** `reviews/ai_infrastructure_skeptic_review_20251208.md`

**Verification Complete (Dec 8, 2025):**
- **Initial Grade:** A- (super-alignment-researcher)
- **Final Grade:** B+ (research-skeptic downgrade)
- **Reviewers:** Cynthia (researcher), Sylvia (skeptic)

**Sources Verified:**
- ✅ Cornell/Nature Sustainability 2025 - All claims EXACT MATCH (Nov 10, 2025 publication)
- ✅ MIT 2025 - 7-8× multiplier confirmed (Jan 17, 2025)
- ✅ IEA 2025 - Water projections confirmed
- ⚠️ Minor misattribution: 183 TWh from IEA/Pew, not MIT

**Parameters Validated:**
- ✅ trainingWaterL: 700K-10M L per run
- ✅ inferenceWaterL: 2-5M L/month
- ✅ aiTrainingMultiplier: 7.5 (7-8× range)
- ✅ Geographic modifiers: desert 2.5×, nordic 0.3×, windbelt 0.7×

**CRITICAL Issues Found:**
1. ❌ **Jevons Paradox Unmodeled:** ACM FAccT 2025 - efficiency gains enable expansion, not reduction
2. ⚠️ **Liquid Cooling Disruption:** NVIDIA 300x water efficiency, Microsoft zero-water datacenters (2026-2027)
3. ⚠️ **Grid Constraints Bind First:** Morgan Stanley warns 45GW shortage by 2028, 7-year connection delays

**Required Adjustments:**
- Add rebound factor: effectiveMitigation = potentialMitigation * (1 - reboundFactor)
- Add technology adoption scenarios (slow/medium/fast liquid cooling)
- Add uncertainty ranges to 2030 projections
- Document constant-demand assumption explicitly
- Consider grid capacity as binding constraint

**Next Steps:** Parameter enhancement → Re-verification → Monte Carlo validation

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
