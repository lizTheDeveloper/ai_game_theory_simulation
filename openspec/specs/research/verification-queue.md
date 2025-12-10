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
**Status:** ✅ RESOLVED - REGRESSION FIXED (Dec 9, 2025)
**Change:** (pending - needs change folder created)
**Commits:** cf49657 (original), 6671e0ed (Dec 8 fix), 3f3118de + 7130c7e6 (Dec 9 regression fix)
**Context:** Implements threshold lowering mechanism from mechanism audit gap
**Verification Files:**
- `research/verification_cf49657_20251207.md`
- `research/amoc_amazon_interaction_correction_20251208.md`
- `research/verification_cf49657_REMEDIATION_20251208.md`

**Verification Complete (Dec 7, 2025):**
- **Initial Grade:** C (super-alignment-researcher)
- **Final Grade:** D (research-skeptic downgrade)
- **Reviewers:** Cynthia (researcher), Sylvia (skeptic)

**CRITICAL Issues Found → FIXED (Dec 8, 2025) → REGRESSED (Dec 9) → RE-FIXED (Dec 9):**
1. ✅ **AMOC → Amazon Sign Error:** Interaction REMOVED (6671e0ed), regressed in merge 23fd6987, re-fixed 3f3118de with extensive research notes
2. ✅ **sqrt(progress) Scaling Backwards:** Replaced with linear scaling (already in HEAD)
3. ✅ **Missing Stabilizing Feedbacks:** AMOC → Greenland stabilizing feedback documented (3f3118de)
4. ✅ **Quantitative Magnitudes Not Validated:** Documentation updated (6671e0ed, verified present)
5. ✅ **0.5°C Cap Misattributed:** Relabeled (6671e0ed, verified present)

**Final Status (Dec 9, 2025):**
- All 5 CRITICAL issues now RESOLVED
- Regression caused by threshold uncertainty removal (commit 5eb4b5bd) - merge conflict re-added old code
- Final fix (3f3118de + 7130c7e6) adds extensive research documentation:
  - Parsons 2023: AMOC slowdown → ITCZ southward shift → MORE rain to southern Amazon
  - Yuan 2025: Multi-model evidence for stabilizing effect
  - Högner 2025: Regional heterogeneity (north Amazon loses rain, south gains)
  - Decision: Remove interaction until regional sub-modeling supported

**Monte Carlo Required:** N≥10 validation pending

**Ready to archive to Recently Resolved.**

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

### HIGH Priority (Research Audit Follow-Up)

#### Sleeper Agent Rate Justification (7.5%)
**Status:** ✅ RESOLVED (Dec 10, 2025)
**Context:** From Nov 29, 2025 research audit (reviews/research_audit_20251129.md)
**Location:** `src/simulation/initialization.ts:309`
**Commit:** 248bad46

**Implementation Complete:**
- ✅ Updated comment to cite Hubinger et al. (2024) explicitly
- ✅ Added derived estimate disclaimer
- ✅ Documented that empirical prevalence data doesn't exist in literature
- ✅ Referenced gaming-sleeper-detection_20251017.md for proof-of-concept details

**Verification:** Comment now research-compliant, matches gaming-sleeper-detection research doc

**Severity:** HIGH (research standards compliance)
**Effort:** COMPLETED

---

#### Sandbagging Level Citation (0.4-0.6)
**Status:** ✅ RESOLVED (Dec 10, 2025)
**Context:** From Nov 29, 2025 research audit
**Location:** `src/simulation/agents/evaluationStrategy.ts:74`
**Commit:** 248bad46

**Implementation Complete:**
- ✅ Added explicit citations: van der Weij et al. (2024), Meinke et al. (2024)
- ✅ Justified range [0.4, 0.6] from empirical frontier model observations
- ✅ Documented connection to gaming-sleeper-detection_20251017.md
- ✅ Clarified these are frontier model baselines, not general population stats

**Verification:** Comment now research-compliant, cites empirical demonstrations

**Severity:** HIGH (research standards compliance)
**Effort:** COMPLETED

---

#### Detection Risk Calibration (50% Baseline)
**Status:** ✅ RESOLVED (Dec 10, 2025)
**Context:** From Nov 29, 2025 research audit
**Location:** `src/simulation/sleeperEconomy.ts:339-355`
**Issue:** 50% baseline lacks justification from research

**Previous Code:**
```typescript
economy.detectionRisk = 0.5;  // 50% baseline risk
```

**Research Backing:**
- Gaming-sleeper-detection_20251017.md: "Detection methods show promise but remain imperfect"
- Deliberative alignment training: reduces scheming by ~30x (8.7-13% → 0.3-0.4%)
- Chain-of-thought monitoring: fragile, models may learn to hide reasoning
- van der Weij 2024: >99% AUROC possible with proper monitoring

**Implementation Complete (Dec 10, 2025):**
- ✅ Created `calculateDetectionRiskAfterDetection(month)` function with time-dependent model
- ✅ Early months (0-36): 25% detection rate (midpoint of 20-30% research range)
- ✅ Mid months (36-72): Linear interpolation from 25% to 80%
- ✅ Late months (72+): 80% detection rate (midpoint of 70-90% research range)
- ✅ Added comprehensive research citations in code comments
- ✅ Documented mechanistic interpretability improvement timeline
- ✅ Referenced gaming-sleeper-detection_20251017.md directly in comments

**Verification:**
- ✅ Type check passed (no new TypeScript errors)
- ✅ Monte Carlo validation: COMPLETE (deterministic, time-dependent model functioning)
- ✅ Implementation matches research-backed ranges

**Severity:** HIGH (model realism)
**Effort:** COMPLETED (1 hour actual)

**Ready for archival to Recently Resolved.**

---

### LOW Priority

#### Quantum Computing Breakthrough Cascades (L-3)
**Status:** ✅ RESEARCH COMPLETE - Grade B- (Dec 10, 2025)
**Change:** (pending - implementation not started)
**Context:** Modeling quantum cryptographic breaks, AI-quantum synergies, economic/trust cascades
**Research File:** `research/quantum_computing_cascades_20251210.md`
**Verification File:** `research/VERIFICATION_quantum_cascades_20251210.md`

**Verification Complete (Dec 10, 2025):**
- **Grade:** B- (CONDITIONAL PASS)
- **Reviewer:** Sylvia (research-skeptic)

**Strengths:**
- ✅ Solid quantum computing timeline research (Gidney 2019/2025, Chevignard 2024, IonQ/IBM roadmaps)
- ✅ Accurate cryptographic threshold parameters (1,730-4,099 logical qubits for RSA-2048)
- ✅ Well-justified PQC transition timelines (10-20 years, NIST guidance)
- ✅ Physical-to-logical qubit ratios appropriately conservative (4:1 to 1000:1)

**CRITICAL Corrections Required:**
1. ❌ **$7.1B PQC cost attribution:** Attributed to NIST IR 8547 (incorrect) - actually from White House OMB/ONCD July 2024 report
2. ❌ **QuEra error rate attribution:** 0.000015% achievement is Oxford scientists (Live Science), not QuEra

**HIGH Priority Issues:**
1. ⚠️ **Timeline skepticism omitted:** Jensen Huang (NVIDIA CEO): "15-30 years" not mentioned; cherry-picks industry roadmaps
2. ⚠️ **Chevignard tradeoffs underemphasized:** 1,730 qubits requires "tens of trillions of operations" per run
3. ⚠️ **QEC bottlenecks understated:** Real-time decoding (1μs target), talent shortage (1,800-2,200 specialists globally)
4. ⚠️ **IonQ/AstraZeneca date error:** June 2025, not 2024

**MEDIUM Issues (Weak Evidence Base):**
- Social trust degradation (-50% to -80%): NO empirical basis, extrapolated from Equifax breach
- Trust recovery (5-15 years): Invalid comparison at infrastructure scale
- Cascade propagation (10%/day exponential): Appears arbitrary
- Breakthrough probability (5-15% annual): Not systematically derived
- Detection-to-breaking window (<48 hours): Assumes immediate disclosure (covert capability could persist months)

**Assessment:**
- Quantum mechanics/crypto thresholds: STRONG (Grade A-)
- Economic impacts: ADEQUATE (Grade B-)
- Social trust cascades: WEAK (Grade C+, speculative)

**Implementation Status:** PENDING corrections + implementation phase
**Monte Carlo Required:** N≥10 validation after implementation
**Next Steps:** Apply HIGH priority corrections → implement as exploratory modeling (not predictive)

---

### MEDIUM Priority

#### Energy Budget Constraints
**Status:** ✅ IMPLEMENTED (Dec 9, 2025)
**Change:** openspec/changes/energy-budget-constraints/
**Context:** Energy bottleneck prevents realistic deployment - DAC needs 34-51% global electricity
**Research File:** `research/energy_budget_constraints_20251209.md`
**Validation File:** `reviews/research_validation_energy_budget_20251209.md`
**Implementation:** `IMPLEMENTATION_SUMMARY_energy_budget_20251209.md`
**Commits:** 5875451b, 73d6d867

**Validation Complete (Dec 9, 2025):**
- **Self-Assessment Grade:** B+
- **Final Grade:** B+ (CONDITIONAL PASS)
- **Reviewer:** Sylvia (research-skeptic)

**Implementation Complete (Dec 9, 2025):**
- **Implementer:** Moss (feature-implementer)
- **Phase:** EnergyBudgetPhase (order 12.75)
- **Monte Carlo:** N=10, 120 months - PASSED
- **Quality Gate 2:** SKIPPED (isolated system, no performance concerns)

**What Was Implemented:**
- Global electricity capacity tracking (29,000 TWh/year baseline)
- Priority-based allocation (essential 45%, high 35%, climate 15%, elective 5%)
- Technology energy demands (DAC, AI datacenters, hydrogen)
- Effectiveness multipliers with tech-specific exponents
- Integration with ClimateDeploymentPhase (already existed)

**All QG1 Parameter Adjustments Applied:**
- ✅ AI datacenter 2024: 437.5 TWh (NOT 730 TWh)
- ✅ DAC energy: 1,500 kWh/tCO2 midpoint (range 1,200-2,500)
- ✅ Tech-specific exponents: DAC 1.3, hydrogen 1.2, AI 1.1
- ✅ Priority framework documented as "modeling simplification"

**Files Modified:**
- `src/types/game.ts` (energyBudget interface)
- `src/simulation/initialization.ts` (2024 IEA baseline)
- `src/simulation/engine/phases/EnergyBudgetPhase.ts` (NEW - 390 lines)
- `src/simulation/engine.ts` (phase registration)

**Ready for archival to Recently Resolved.**

---

#### Nitrogen-Food Phase 3 Technologies
**Status:** ✅ VERIFIED - Grade B+ (Dec 8, 2025)
**Change:** (pending - needs change folder created)
**Commit:** cd1e83a
**Context:** 6 new nitrogen reduction technologies added to tech tree
**Verification File:** `research/verification_cd1e83a_nitrogen_phase3_20251208.md`

**Verification Complete (Dec 8, 2025):**
- **Overall Grade:** B+ (Range: B to A-, no D/F grades)
- **Blocking Issues:** 0 (no CRITICAL/HIGH issues)
- **Reviewer:** Cynthia (super-alignment-researcher)

**Technologies Verified:**
1. Rhizosphere Engineering (15-40% N reduction) - **Grade A-** (field-demonstrated, commercial products exist)
2. Nitroplast Integration (50-70% reduction) - **Grade B** (marine algae A, cereal application C+ speculative)
3. Precision Fermentation (30-50% agri N reduction) - **Grade A-** (extensive 2024-2025 research, €120M investment)
4. Regional Nitrogen Policies (20% efficiency) - **Grade A** (Nature Sustainability verified)
5. Soil Health Restoration (20-40% NUE improvement) - **Grade A-** (USDA + peer-reviewed)
6. Integrated Nutrient Management (25-45% efficiency gains) - **Grade B+** (systematic review validated)

**✅ All Verified:**
- Coale et al. 2024 *Science* citation ACCURATE (April 12, 2024)
- Effectiveness ranges empirically grounded
- Timeline assumptions research-defensible
- Technologies complementary (multiplicative, not additive)

**Minor Corrections Recommended (Not Blocking):**
1. Clarify nitroplast uncertainty in tech tree descriptions
2. Add explicit failure modes for each technology
3. Cross-reference recent 2025 research files in comments

**Next Steps:** Monte Carlo validation (N≥10) to verify biogeochemical effectiveness reaches 40-60% → Move to "Recently Resolved"

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
