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
**Status:** ⚠️ CONDITIONAL PASS - Revisions Required
**Change:** (pending - needs change folder created)
**Commit:** cd1e83a
**Context:** 6 new nitrogen reduction technologies added to tech tree
**Verification File:** `research/verification_cd1e83a_20251207.md`

**Verification Complete (Dec 7, 2025):**
- **Initial Grade:** B- (super-alignment-researcher)
- **Final Grade:** C+ (68/100) (research-skeptic downgrade)
- **Reviewers:** Cynthia (researcher), Sylvia (skeptic)

**Technology Grades:**
1. Rhizosphere Engineering: C+ (84% commercial failure rate, BNF ceiling 20-25%)
2. Nitroplast Integration: D+ (timeline should be 2060-2080, <50% success probability)
3. Precision Fermentation: D (central claim 30-50% N reduction has NO SOURCE - fabricated)
4. Regional Nitrogen Policies: B- (Sri Lanka 2021 yield collapse precedent)
5. Soil Health Restoration: B (standalone contribution 0.6%, not 20-40%)
6. Integrated Nutrient Management: B+ (validated)

**CRITICAL Issues Found:**
1. ❌ **Precision Fermentation 30-50% claim fabricated** - no source found
2. ❌ **Rhizosphere 84% commercial failure rate** (Koziol et al. 2024-2025)
3. ❌ **Nitroplast timeline too optimistic** - 2060-2080 not 2040
4. ⚠️ **Regional policies political risk** - Sri Lanka 2021 (30% yield collapse, president resignation)
5. ⚠️ **BNF ceiling 20-25%** not 40% (PMC 2022)

**Required Revisions Before Implementation:**
1. Remove/revise fabricated precision fermentation claim
2. Extend nitroplast timeline to 2060+
3. Add failure rate parameters (84% for commercial biofertilizers)
4. Add political feasibility constraints based on Sri Lanka precedent
5. Clarify soil health restoration scope (standalone vs integrated)
6. Add uncertainty ranges to all Monte Carlo simulations

**Next Steps:** Parameter revisions → Re-verification if major changes → Implementation with caveats

---

#### Carbon Capture Deployment Parameters
**Status:** ⚠️ CONDITIONAL APPROVE - Revise Parameters
**Change:** (pending - needs change folder created)
**Commit:** c52826e
**Context:** Comprehensive DAC research (625 lines, 12 sources, A+ quality)
**Research File:** `research/carbon_capture_deployment_timelines_2025.md`
**Verification File:** `research/verification_c52826e_20251207.md`

**Verification Complete (Dec 7, 2025):**
- **Initial Grade:** A+ (original research)
- **Verification Grade:** A (super-alignment-researcher)
- **Final Grade:** B+ (research-skeptic - significant concerns)
- **Reviewers:** Cynthia (researcher), Sylvia (skeptic)

**CRITICAL Finding - Energy Calculation Error:**
- ❌ **Original claim:** 4-10 TWh per Gt/yr
- ✅ **Corrected:** 3,000-11,000 TWh per Gt/yr (1000x error)
- **Impact:** 1 Gt/yr = 10-38% of global electricity (not 0.05-0.1%)
- **Impact:** 4 Gt/yr = 40-150% of global electricity (physically infeasible)

**Verified Accurate:**
- ✅ Mammoth: 36,000 tonnes/yr operational May 2024
- ✅ Stratos: 500,000 tonnes/yr expected late 2025
- ✅ Gen 3 tech: 50% energy/cost reduction
- ✅ Timeline: 20-40 years to gigatonne scale
- ✅ All 12 sources real, peer-reviewed, accurately cited

**Critical Concerns (Sylvia):**
1. ❌ **Energy Death Spiral:** IPCC targets (4-6 Gt) require 40-150% of global electricity - physically impossible
2. ❌ **Timeline Optimism:** Requires 1.5 plants/week for 26 years (5x faster than nuclear peak)
3. ❌ **Cost Floor Delusion:** $100/tonne unrealistic (MIT: electricity alone $67-135/tonne); realistic floor $250-450/tonne
4. ⚠️ **Water Scarcity:** Zero-sum competition with agriculture in water-stressed regions
5. ⚠️ **Opportunity Cost:** DAC removes 1 Mt per $1B, reforestation removes 20-50 Mt
6. ⚠️ **Moral Hazard:** DAC expectations enable continued fossil fuel use (mitigation deterrence)
7. ⚠️ **Stranded Infrastructure:** Risk of obsolescence before scale-up

**Required Revisions Before Simulation:**
1. ❌ Energy calculation corrected (3,000-11,000 TWh/Gt, not 4-10)
2. ❌ Adjust Monte Carlo base case: 0.5-1 Gt by 2050 (not 1-2 Gt)
3. ⚠️ Add mitigation deterrence modeling (5% emissions reduction delay per Gt DAC)
4. ⚠️ Include opportunity cost vs nature-based solutions (30x cost-effectiveness gap)
5. ⚠️ Widen cost floor uncertainty to $250-500/tonne
6. ⚠️ Add stranded asset scenarios (25% stagnation, 15% obsolescence probability)
7. ⚠️ Energy constraint cap: max 15% clean energy, 10% total electricity to DAC

**Minor Corrections:**
- Tan et al. DOI: 10.1038/s41467-024-50594-5 (not 50637-2)
- Global DAC: 0.059 Mt/yr (59 kt/yr), not 0.05 Mt/yr

**Next Steps:** Parameter revisions (energy, cost floor, opportunity cost, mitigation deterrence) → Implementation with constraints → Monte Carlo validation

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
