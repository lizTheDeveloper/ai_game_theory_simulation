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
**Status:** ✅ VERIFIED - Grade B+ (Conditional Pass)
**Change:** (pending - needs change folder created)
**Commit:** cd1e83a
**Context:** 6 new nitrogen reduction technologies added to tech tree
**Verification File:** `research/verification_cd1e83a_20251208.md`

**Verification Complete (Dec 8, 2025):**
- **Grade:** B+ (85% confidence in parameters)
- **Fully Verified:** 3/6 technologies (50%) - Rhizosphere Engineering, Nitroplast Integration, Precision Fermentation
- **Partially Verified:** 3/6 technologies (50%) - Regional Nitrogen Policies, Soil Health Restoration, Integrated Nutrient Management
- **Reviewer:** Cynthia (autonomous-researcher)

**✅ Fully Verified Technologies:**
1. **Rhizosphere Engineering (15-40% N reduction)** - Ali et al. 2025 *Frontiers Plant Sci*, mycorrhizal field trials confirm 15%
2. **Nitroplast Integration (50-70% reduction)** - Coale et al. 2024 *Science*, AAAS Newcomb Cleveland Prize 2025
3. **Precision Fermentation (30-50% agri N reduction)** - Annual Reviews 2024, WRI 2024 (63% crops to animal feed)

**⚠️ Partially Verified Technologies:**
4. **Regional Nitrogen Policies (20% efficiency)** - Bhattarai 2024 shows 11-49% range, 20% is reasonable weighted average
5. **Soil Health Restoration (20-40% NUE improvement)** - Gu 2023 shows 10-80% range, but "soil health" term vague
6. **Integrated Nutrient Management (25-45% efficiency)** - Gu 2023 11-measure package supports range

**CRITICAL Issue Found:**
- ❌ **Nitroplast Timeline Error:** Tech tree shows `minMonth: 60` (5 years) but research consensus is 2040s-2050s deployment (15-25 years minimum)
- **Required Fix:** Change `minMonth: 60` → `minMonth: 180` to match research timeline

**Recommended Actions:**
1. Fix nitroplast timeline (CRITICAL - blocks Monte Carlo)
2. Add research citations to tech tree comments
3. Clarify vague terms ("Soil Health" → "Precision Agriculture NUE" or add explicit sources)
4. Proceed with Monte Carlo validation after timeline fix

**Next Steps:** Timeline fix required before implementation → Monte Carlo N≥10

---

#### Carbon Capture Deployment Parameters
**Status:** ✅ VERIFIED - Grade A (Full Verification - 100%)
**Change:** (pending - needs change folder created)
**Commit:** c52826e
**Context:** Comprehensive DAC research (625 lines, 12 sources, A+ quality)
**Research File:** `research/carbon_capture_deployment_timelines_2025.md`
**Verification File:** `research/verification_c52826e_20251208.md`

**Verification Complete (Dec 8, 2025):**
- **Grade:** A (100% verification - all parameters verified)
- **Reviewer:** Cynthia (autonomous-researcher)
- **Status:** APPROVED FOR IMMEDIATE USE

**✅ All Implementation Parameters VERIFIED (5/5):**
1. **activationDelay = 7 years** - IEA 2024, mid-range of 5-10 year estimate
2. **T_50 = 30 years** - Matches 2050 low-gigatonne projection (0.1-1 Gt = 50% of multi-Gt target)
3. **tau = 20 years** - Biogeosciences 2024-2025 atmospheric mixing timescale
4. **E_max = 1.0 Gt CO2/yr** - Conservative mature deployment estimate
5. **effectType = 'co2_removal'** - Correct classification

**✅ All Research Claims VERIFIED:**
- **Current capacity:** 0.00005 Gt/yr (Mammoth 36kt/yr, Climeworks May 8 2024 press release)
- **Timeline:** 20-40 year lag to gigatonne scale (IEA 2024 projections)
- **Energy:** 4-10 TWh per 1 Gt/yr (Frontiers in Climate 2024, Tan et al. 2024)
- **Water:** 15 km³/yr for 4 Gt/yr (Tan et al. 2024 *Nature Commun*, DOI: 10.1038/s41467-024-50637-2)
- **Cost:** $600-1,000/tonne → $100-300/tonne by 2040s (Climeworks, Canary Media 2024)

**Key Sources Verified:**
- Tan, S., et al. (2024). *Nature Communications*, 15, Article 6380 [Energy-water-land nexus]
- Climeworks (2024, May 8). Mammoth press release [Primary industry source]
- IEA (2024). "CCUS projects around the world are reaching new milestones" [Authoritative]
- Frontiers in Climate (2024-2025). Technical energy analysis [Peer-reviewed]
- Canary Media (2024). Gen 3 technology cost reduction [Industry coverage]

**Enhancement Opportunities (Optional - Not Blocking):**
- ⚠️ Energy coupling - Model effectiveness reduction if clean energy unavailable
- ⚠️ Water constraints - Regional deployment penalties in water-stressed solar belts
- ⚠️ Cost dynamics - Accelerate deployment if carbon price > $200/tonne

**Recommendation:** ✅ APPROVED - Proceed with Monte Carlo N≥10

**Next Steps:** Monte Carlo validation (no parameter fixes needed)

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
