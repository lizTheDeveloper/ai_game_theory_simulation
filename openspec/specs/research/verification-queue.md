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
**Status:** ✅ VERIFIED (Dec 7, 2025)
**Grade:** B+ (Cynthia) / B- (Sylvia downgrade)
**Change:** (pending - needs change folder created)
**Commit:** cd1e83a
**Context:** 6 new nitrogen reduction technologies added to tech tree
**Verification File:** `research/verification_cd1e83a_nitrogen_technologies_20251207.md`

**Verification Complete (Dec 7, 2025):**
- **Researcher Grade:** B+ (good evidence, some optimism)
- **Skeptic Grade:** B- (systematic optimism bias detected)
- **Reviewers:** Cynthia (super-alignment-researcher), Sylvia (research-skeptic)

**Technology Grades:**
1. Regional N Policies: A (55% South Asia overuse validated by *Nature Sustainability* 2024)
2. Rhizosphere Engineering: B+ → B- (40% upper bound requires ideal conditions <20% of land)
3. Soil Health Restoration: B+ → B (20-40% range validated, 3-10 year lag)
4. Integrated Nutrient Mgmt: B+ → B (25-35% validated, 45% too high)
5. Nitroplast Integration: B → **D** (CRITICAL: timeline off by 4-8x, needs minMonth: 300+)
6. Precision Fermentation: B- → C+ (30-50% conservative but adoption barriers)

**CRITICAL Issue Found:**
- **Nitroplast Timeline:** Simulation has minMonth: 60 (5 years) but research shows 2050+ deployment (marine algae only, no crops yet). Must move to TIER 4 with minMonth: 300+ and successProbability: 0.4

**Implementation Recommendations:**
1. Move Nitroplast to far-future tier (CRITICAL)
2. Add diminishing returns formula: `totalEffect = 1 - product(1 - individualEffect)`
3. Cap combined nitrogen efficiency at 60% (not 85% additive)
4. Lower Integrated Mgmt upper bound from 45% to 35-40%

**Next Steps:** Parameter adjustments → Re-implementation → Monte Carlo validation

---

#### Carbon Capture Deployment Parameters
**Status:** ✅ VERIFIED (Dec 7, 2025)
**Grade:** B+ (CONDITIONAL PASS)
**Change:** (pending - needs change folder created)
**Commit:** c52826e
**Context:** Comprehensive DAC research (625 lines, 12 sources, A+ quality)
**Research File:** `research/carbon_capture_deployment_timelines_2025.md`
**Critique File:** `reviews/carbon_capture_research_critique_20251207.md`

**Verification Complete (Dec 7, 2025):**
- **Research Quality:** A+ (excellent sources, comprehensive)
- **Skeptic Grade:** B+ (solid but three significant issues)
- **Reviewer:** Sylvia (research-skeptic)

**✅ Validated Claims:**
- Required scale by 2050 (4.2 Gt/yr): VALIDATED
- Energy requirements (4-10 TWh per Gt/yr): VALIDATED
- Water requirements (15 km³/yr for 4 Gt/yr): VALIDATED
- 20-40 year timeline to gigatonne: VALIDATED (pessimistic end more defensible)
- TIER 2 classification (not TIER 3/4): VALIDATED

**Issues Found:**

**1. Current Capacity Overstated (SIGNIFICANT)**
- Research claims 0.00005 Gt/yr operational capacity
- Reality: Mammoth captured only 105 tonnes in all of 2024 (0.3% of nameplate)
- Real-world operational capacity is 10-50x lower than research suggests

**2. $100/tonne Cost Floor Disputed (MEDIUM)**
- Research claims $100/tonne thermodynamic floor
- Multiple sources (Belfer Center, Mission Zero, PNAS) dispute this
- More realistic floor: $150-200/tonne with practical engineering losses

**3. Scale-Up CAGR Optimistic (MEDIUM)**
- 33% CAGR requires replicating solar's growth trajectory
- DAC differs: no private market demand, irreducible operational costs
- More defensible: 20-25% CAGR base case

**Implementation Recommendations:**
1. Increase T_50 from 30 to 35-40 years (account for deployment friction)
2. Add capacity factor multiplier (0.2-0.6) to effectiveness calculations
3. Update documentation: cost floor is $150-200/tonne, not $100

**Next Steps:** Parameter adjustments → Monte Carlo validation → Documentation updates

---

#### AI Infrastructure Resources 2025 Update
**Status:** ✅ VERIFIED (Dec 7, 2025)
**Grade:** B+ (85/100 - One minor error found)
**Change:** (pending - needs change folder created)
**Commit:** dbf1438
**Context:** 2025 peer-reviewed sources for AI data center resource consumption
**Research File:** `research/ai-infrastructure-resources_20251019.md` (updated)
**Verification File:** `research/verification_dbf1438_ai_infrastructure_20251207.md`

**Verification Complete (Dec 7, 2025):**
- **Overall Grade:** B+ (trustworthy, cutting-edge sources, one numerical error)
- **Reviewer:** Cynthia (super-alignment-researcher)

**✅ Verified and Accurate:**

**1. Cornell/Nature Sustainability (2025) - VERIFIED ✅**
- Authors: Tianqi Xiao, Fengqi You (Cornell PEESE lab)
- DOI: 10.1038/s41893-025-01681-y
- Water projection: 731-1,125M m³/year by 2030 ✅ CORRECT
- Carbon projection: 24-44M tons CO₂/year by 2030 ✅ CORRECT
- Published November 10, 2025 in *Nature Sustainability*
- Credibility: **A+ (VERY HIGH)** - Top-tier peer-reviewed journal

**2. IEA (2025) - VERIFIED ✅**
- Current baseline: 560 billion liters/year ✅ CORRECT
- 2030 projection: 1,200 billion liters/year ✅ CORRECT
- Source: IEA April 2025 report on energy and AI
- Credibility: **A (VERY HIGH)** - Authoritative international body

**3. MIT/Lawrence Berkeley Lab (2025) - VERIFIED WITH ONE ERROR ⚠️**
- Energy multiplier: 7-8× for generative AI training ✅ CORRECT
- U.S. data center consumption: Claimed **183 TWh (2024)** ❌ **INCORRECT**
  - **Actual:** 176 TWh in 2023 (per Berkeley Lab report)
  - This is a 4% error - likely misreading or rounding
- Credibility: **A- (HIGH)** - Credible sources but one numerical error

**Error Correction Needed:**
- Update line 307 of research file to: "U.S. data center share: 176 TWh (2023) = 4.4% of national electricity consumption"

**Next Steps:** Minor correction to research file → Parameters approved for implementation

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
