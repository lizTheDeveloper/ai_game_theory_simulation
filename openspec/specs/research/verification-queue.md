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
**Status:** ❌ FAILED - Grade D (BLOCKS IMPLEMENTATION)
**Change:** (pending - needs change folder created)
**Commit:** cf49657
**Context:** Implements threshold lowering mechanism from mechanism audit gap
**Verification File:** `research/verification_cf49657_threshold_lowering_VALIDATED_20251207.md`

**CRITICAL FINDING:** Specific magnitude estimates (0.10-0.30°C, 0.5°C cap) claimed to be from Wunderling et al. (2024) are **NOT SUPPORTED** by the cited paper. Wunderling 2024 provides qualitative confirmation of threshold lowering but **NO quantitative magnitude estimates**.

**Sources Verified:**
- ✅ Armstrong McKay et al. (2022) Science - Network of 16 tipping elements CONFIRMED
- ❌ Wunderling et al. (2024) ESD - Qualitative concept supported, **specific ranges (0.2-0.4°C, 0.1-0.2°C) NOT FOUND**
- ⚠️ Van Westen et al. (2024) - Greenland→AMOC mechanism confirmed, magnitude unverified (also: paper is Science Advances 2024, not JGR 2024)

**Key Issues:**
- ❌ All 9 threshold reduction values (0.10-0.30°C) lack research sources - **FABRICATED PARAMETERS**
- ❌ 0.5°C cap falsely attributed to Wunderling 2024 - **NOT IN PAPER**
- ❌ "Conservative estimates" claim cannot be verified without source ranges
- ⚠️ sqrt(progress) scaling function has no research justification

**Implementation:**
- calculateThresholdLowering() in ClimateSystemPhase.ts
- TIPPING_INTERACTIONS constant in src/types/tipping-points.ts
- effectiveThresholdReduction field on TippingElement interface

**Required Action:** Choose one:
1. **Option 1 (RECOMMENDED):** Revert commit until proper sources found
2. **Option 2:** Downgrade to speculative feature with ±75-100% uncertainty bounds, mark as "MODELING ASSUMPTION"
3. **Option 3:** Conduct 2-4 week literature review to find quantitative sources

**Next Steps:** BLOCKED until parameter sourcing resolved. Do NOT run Monte Carlo validation.

---

#### AI Governance 2025 Proposals
**Status:** ✅ VERIFIED (Partial) - Grade B- (Technical parameters verified, risk estimates unverified)
**Change:** (pending - needs change folder created)
**Commit:** ff6ff02
**Context:** Global moratorium + US-China bilateral frameworks from arXiv 2025
**Verification File:** `research/verification_ff6ff02_ai_governance_2025_VALIDATED_20251207.md`

**Sources Verified:**
- ✅ arXiv:2505.04592 (May 2025) - Barnett & Scher, MIRI - Global moratorium framework CONFIRMED
- ✅ arXiv:2511.10783 (Nov 2025) - Scher et al. - US-China bilateral agreement with technical specs CONFIRMED

**Technical Parameters: ✅ ALL VERIFIED (100%)**
- ✅ Compute thresholds: 10²⁴ FLOP hard prohibition, 10²³ FLOP post-training, 10²² FLOP monitored
- ✅ Chip cluster definitions: >16 H100-equivalents (~$500k), 990 TFLOP/s FP16 per H100
- ✅ Consolidation timeline: Day 1 (>10k H100s), Day 10 (>1k), Day 100 (>100), Year 2 (all)
- ✅ Verification mechanisms: On-chip monitoring, satellite surveillance, whistleblowers, supply chain tracking, power monitoring, physical access, training checkpoints

**Risk Estimates: ❌ UNVERIFIED (0%)**
- ❌ Catastrophic risk estimates (10-25% Amodei, 20% Bengio, 38% survey) NOT FOUND in cited arXiv papers
- ⚠️ Papers confirm "high catastrophic risk" qualitatively but don't provide specific probabilities
- ⚠️ Values likely from separate interviews/surveys - need additional sourcing OR removal

**Recommendation:** CONDITIONAL PASS
- ✅ **Implement:** All technical parameters (FLOP thresholds, chip tracking, consolidation, verification)
- ❌ **Remove:** Specific risk probability estimates until sources found
- ✅ **Use:** Qualitative risk framing ("high catastrophic risk concern among experts")
- ✅ **Model:** Bilateral vs global moratorium scenarios, verification mechanism effectiveness

**Integration Answers:**
1. **Global vs bilateral:** Model as SPECTRUM (unilateral → bilateral → coalition → global). Bilateral has most concrete parameters.
2. **Compute threshold enforcement:** YES - well-specified, implementation-ready
3. **Chip cluster tracking:** YES - exceptionally detailed 4-phase consolidation over 2 years

**Next Steps:** Implement technical parameters (N≥10 Monte Carlo). Defer/remove risk probabilities OR conduct 2-4hr literature search for sources.

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
**Status:** ⚠️ READY FOR VALIDATION
**Change:** (pending - needs change folder created)
**Commit:** c52826e
**Context:** Comprehensive DAC research (625 lines, 12 sources, A+ quality)
**Research File:** `research/carbon_capture_deployment_timelines_2025.md`
**Verification File:** `research/verification_c52826e_20251121.md`

**Sources to Verify:**
- Tan et al. (2024) *Nature Communications* - gigatonne requirements, energy/water nexus
- Climeworks (2024) - Mammoth plant operational data (36,000 tonnes/yr)
- IEA (2024) - CCUS project milestones, 5-10 year activation delay
- Frontiers in Climate (2024-2025) - technical analysis, energy requirements
- Canary Media (2024) - Gen 3 technology cost reduction claims

**Key Claims:**
- Current capacity: 0.00005 Gt/yr (Mammoth: 36kt/yr operational May 2024)
- Timeline: 20-40 years breakthrough → gigatonne impact
- Energy: 4-10 TWh per 1 Gt/yr (must couple with clean energy)
- Water: 15 km³/yr for 4 Gt/yr (3.8% global industrial use)
- Cost: $600-1,000/tonne (current) → $100-300/tonne (2040s)

**Current Implementation:**
- ClimateDeploymentDelayPhase.ts:67-73 - DAC parameters

**Parameter Validation:**
- ✅ Activation delay (7 years) - compatible with 5-10 range
- ✅ T_50 (30 years) - compatible with 20-40 year timeline
- ⚠️ Energy requirements - NOT MODELED (enhancement opportunity)
- ⚠️ Water constraints - NOT MODELED (regional deployment factor)

**Next Steps:** Two-layer verification → Parameter validation → Enhancement implementation (energy/water constraints) → Monte Carlo N≥10

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
