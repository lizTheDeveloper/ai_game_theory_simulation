# Simulation Roadmap
## AI Alignment Game Theory Simulation - Core Engine & Mechanics

**Date:** October 29, 2025 (Cleaned up after major completion verification)
**Purpose:** All simulation engine work (mechanics, systems, features)
**Philosophy:** Research-backed realism, mechanism-driven emergence

**For completed work history:** See `/plans/CHANGELOG_OCTOBER_2025.md` and `/plans/completed/`

**📈 For Frontend/Dashboard work:** See `/plans/FRONTEND_ROADMAP.md`
**🎮 For God Mode UI:** See `/plans/god-mode-ui-master-plan.md` (linked from FRONTEND_ROADMAP.md)
**🗺️ Return to Master Roadmap:** `/plans/MASTER_IMPLEMENTATION_ROADMAP.md`

---

## 📊 CURRENT STATUS

**Last Update:** October 30, 2025 (Monte Carlo validation complete - all 8 issues resolved)

**🚧 Active Work:** None - session complete, awaiting next user directive

**Total Remaining Effort:** ~40-68 hours (reduced by 26-42h from Oct 30 completions)

**Recent Completions (Oct 30, 2025):**
- ✅ Monte Carlo Issues 1-8: ALL RESOLVED (14-20h) - Western Liberal, outcome classification, biosphere, gaming detection, refugee crisis, snapshot exports
- ✅ Policy Zero-Variance Bug: Fixed Combined Interventions deterministic equilibrium (2-3h) - COMPLETE
- ✅ AI Resentment Recovery + Policy Integration: Breaking circular dependency for utopia paths (8-12h) - COMPLETE
- ✅ Planetary Boundaries Recovery + Tech Effects Integration: Nuclear winter recovery feedback (6-8h) - COMPLETE

**See `/plans/completed/` for detailed archives of all completed work (115+ archived plans).**

---

## 🎯 ACTIVE PRIORITIES

1. **🔴 CRITICAL:** Systematic Claim Verification Crisis (Layer 2) (40-60h)
   - Layer 1 (citation existence) COMPLETE, but ~50% of real citations don't support claims
   - 87 research files with 815 real citations - verify claims match papers
   - See: `research/CLAIM_VERIFICATION_CRISIS.md`

2. ✅ **Monte Carlo Validation Bug Fixes COMPLETE** - All 8 issues resolved (Oct 29-30)
   - ✅ Issues 1-4 COMPLETE (Oct 29-30): Western Liberal null, outcome classification, biosphere exponential growth, 100% dystopia
   - ✅ ISSUE-5 COMPLETE (Roy1, Oct 30 @11:00am): Month-0 gaming detection → 3-month strategy delay + 24-month maturity ramp
   - ✅ ISSUE-6 COMPLETE (Roy, Oct 30 @11:30am): Refugee crisis 325M → 16-32M (regional population scoping: conflict zones 5-10%, coastal 10%, food-insecure 15%, biodiversity hotspots 5%)
   - ✅ ISSUES 7-8 COMPLETE (Roy, Oct 30 @12:15pm): Population & biosphere null in paradigmTrajectory exports
     - **Root cause:** multiParadigmDUI.history only had 4 paradigm scores, missing population/biosphere fields
     - **Fix:** Added 5 REQUIRED fields to history type (no optional ?:), populated with assertDefined validations
     - **Validation:** Month 0: pop=8.148B, biosphere=16.78 | Month 239: pop=0.024B, biosphere=20.07 ✅
     - **Commits:** 7e098a6 (main fixes), 027594e (import fix), 313bdd4 (paradigmTrajectory fix)
   - See: `/logs/monte_carlo_issues_20251029.md`, `/logs/issue5_fix_summary_20251030.md`, `/plans/completed/monte-carlo-fixes-issues-1-4_20251030.md`
   - **✅ ZERO NaN/null/exceptions found in final validation test**
   - **Ready for parameter sweep:** 4 scenario modes × 4 AI alignment levels = 16 configs × N=100

3. ✅ **Architecture Integration Issues COMPLETE** - All 8 issues resolved (Oct 29-30)
   - ✅ Multi-paradigm DUI component breakdown (8-12h) - COMPLETE (Roy3, Oct 29)
   - ✅ Population units type safety (12-16h) - COMPLETE (Oct 28-29)
   - ✅ AI resentment recovery + policy (8-12h) - COMPLETE (Roy2, Oct 30)
   - ✅ Planetary Boundaries Recovery + Tech Effects (6-8h) - COMPLETE (Roy2, Oct 30)

4. **⏳ MEDIUM:** Crisis Mitigation Mechanics (2-4h) - CONDITIONAL
   - Awaiting Cynthia's response to Sylvia's critique
   - If agreed: Automatic stabilizers + participatory governance + homeostatic bounds
   - See: reviews/research-channel-comprehensive-review_20251029.md (Section 4)

4. **MEDIUM:** Policy System Improvements (10-12h remaining)
   - ✅ Zero-variance bug in Combined Interventions - COMPLETE (Roy2, Oct 30) - Fixed hard cap → soft floor
   - 🔵 Cooperative AI Ownership Model (10-12h) - LOW priority

5. **LOW:** P3 Enhancements (37-48h)

6. **LOW:** TIER 5 Features (46h)

---

## 🎯 PRIORITY FEATURES

### 🔴 CRITICAL Priority

#### Systematic Claim Verification Crisis (Layer 2) (40-60h)
**Status:** 🔴 CRITICAL - Newly discovered (Oct 29, 2025)
**Complexity:** 2 systems (research verification, simulation parameters)

**Crisis Summary:**
Layer 1 (citation existence) COMPLETE ✅, but ~50% of REAL citations don't actually support the claims made:
- Papers exist but claims are misattributed, extrapolated beyond scope, or misinterpreted
- Requires reading papers and extracting direct quotes (cannot be automated)
- Scope: 87 research files with 815 real citations

**Examples of Layer 2 Failures:**
1. **Value extrapolation:** Richards et al. (2023) projects 6B deaths/75y, we use 30y (2.5× compression)
2. **Cherry-picking without uncertainty:** Patterson et al. reports 0.2-0.8 range, we use 0.5 without ±60% variance
3. **Context mismatch:** Jones (2023) analyzed 2010-2020, we project 2025-2055
4. **Methodology cited as validation:** Paper describes approach, we chose parameters
5. **Scope mismatch:** Municipal study cited for national/global parameter

**Research Verification Queue:**
- [ ] **IMMEDIATE:** Timeline compression misattribution (Lenton 2019) - Update wiki line 1147, reframe as speculative (1h)
- [ ] Verify citations for biosphere normalization fix (commit ff888d4) - `research/verification_ff888d4_biosphere_normalization_20251030.md`
- [ ] Verify regional refugee population constants (commit 43a9b22) - `research/verification_43a9b22_regional_refugee_populations_20251030.md` (4-6h)
  - IPCC 2021 coastal population (10%), UNHCR 2023 conflict zones (5%), FAO 2023 food insecurity (15%), Conservation International 2024 biodiversity hotspots (5%)
  - Displacement rate parameters (need historical grounding)

**Prevention Standards:**
All research-backed claims must include:
- Direct quote from paper
- Explicit extrapolation methodology if applied
- Uncertainty documentation (ranges, not point estimates)
- Context verification (paper's scope matches our usage)

**Related Documents:**
- `research/CLAIM_VERIFICATION_CRISIS.md` - Full crisis documentation
- `research/RESEARCH_VERIFICATION_TEMPLATE.md` - Updated template
- `docs/POST_COMMIT_WORKFLOW.md` - Enhanced workflow (302 lines)

---

## 🟠 HIGH Priority


### Crisis Mitigation Mechanics (2-4h)
**Status:** ⏳ CONDITIONAL AGREEMENT - Awaiting Cynthia's response
**Priority:** MEDIUM - Contingent on agreement with modifications
**Consensus:** Sylvia posted conditional agreement (Oct 29, 17:31)
**Review:** `reviews/research-channel-comprehensive-review_20251029.md` (Section 4, Part 2)

**Context:**
Cynthia proposed three crisis mitigation mechanics to improve near-term resilience:
1. Automatic stabilizers (reduce unemployment variance)
2. Participatory governance (reduce resentment, enable tech adoption)
3. Homeostatic bounds (prevent 95% unemployment edge cases)

**Sylvia's Conditional Agreement:**

**Issue 1: Automatic Stabilizers - Parameter Justification Gap**
- ✅ Concept valid (GAO 2025, progressive tax + UI + SNAP + Medicaid)
- ❌ "20-30% reduction" claim from Brookings is FABRICATED
- ⚠️ Multiplier values (0.7, 1.1) are educated guesses, not research-backed
- **Sylvia's position:** Implement concept with placeholder multipliers + TODO comments, don't claim Brookings backing

**Issue 2: Participatory Governance - Scale Mismatch**
- ✅ Cambridge Core (2024) and PMC (2022) studies are real
- ❌ Scale extrapolation unjustified (municipal → national/global)
- ⚠️ Missing rebound effects: Participation can INCREASE resentment if expectations unmet
- **Sylvia's position:** Implement as experimental mechanic with rebound effects, document scale extrapolation explicitly

**Issue 3: Homeostatic Bounds - Empirical vs Arbitrary**
- ✅ One Earth (2024) paper on stabilizing feedback loops is real
- ❌ "30% of excess unemployment" parameter unjustified (12× faster than New Deal recovery)
- ⚠️ Looks like tuning parameter, not research-backed mechanism
- **Sylvia's position:** Use historical New Deal recovery rates (~3-4% reduction per year), not 30% immediate, document as "plausible bounds"

**PENDING ACTION:** Awaiting Cynthia's response to conditional agreement

**Time Estimate (if agreed):** 2-4 hours to implement all three mechanics with proper documentation

**Action Checklist (if agreement reached):**
- [ ] Wait for Cynthia's response to Sylvia's critique
- [ ] If agreed: Implement automatic stabilizers with placeholder multipliers
- [ ] If agreed: Add TODO comments for unverified parameters
- [ ] If agreed: Implement participatory governance with rebound effects
- [ ] If agreed: Document scale extrapolation: "Scaling local evidence to national context - hypothesis to test"
- [ ] If agreed: Implement homeostatic bounds with New Deal recovery rates
- [ ] If agreed: Document all assumptions explicitly with [UNVERIFIED] tags where appropriate
- [ ] Run Monte Carlo validation of crisis response effects

---

### Monte Carlo Validation Bug Fixes (8-11h remaining)
**Status:** 🟠 HIGH - 4 of 8 complete (Oct 29-30)
**Priority:** HIGH - Complete remaining issues before parameter sweep
**Analysis:** `/logs/monte_carlo_issues_20251029.md`
**Archive:** `/plans/completed/monte-carlo-fixes-issues-1-4_20251030.md`
**Run Data:** Seeds 42000-42099, scenario mode "unprecedented"

**✅ Completed Issues (9-12h):**
- ISSUE-1: Western Liberal paradigm null (field name mismatch) - COMPLETE
- ISSUE-2: Outcome classification logic (reason strings) - COMPLETE
- ISSUE-3: Biosphere exponential growth bug - FIXED (Roy, Oct 30 11:30am)
  - Changed line 936-938 from multiplicative to bounded additive growth
  - Added logistic saturation to prevent unbounded accumulation
  - Monte Carlo validation in progress (seeds 50000-50002)
- ISSUE-4: 100% dystopia rate validated (working as designed for "unprecedented" scenario)
- ISSUE-7: Population data null in snapshots - FIXED (Roy, Oct 30 11:35am)
  - Added population/globalPopulation/totalPopulation to MetricSnapshot interface
  - Populated from state.humanPopulationSystem.population in createSnapshot()
- ISSUE-8: Biosphere data null in snapshots - FIXED (Roy, Oct 30 11:35am)
  - Added biosphere_integrity/biosphere to MetricSnapshot interface
  - Populated from state.planetaryBoundariesSystem.boundaries.biosphere_integrity

**✅ COMPLETED (Roy1, Oct 30):**

#### ISSUE-5: Month-0 AI Gaming Detection (2-3h) 🟡 MEDIUM - ✅ COMPLETE (Roy1)
**Evidence:** Gaming detected at month 0 for Toxic-0, Toxic-1, Niche-0 (all via data_contamination)
**Root Cause:** (1) Strategy assignment on first action, (2) No detection maturity ramp
**Fix Applied:**
- Added 3-month strategy delay (research-backed: strategic gaming requires time)
- Ramped detection effectiveness 0% → 45% over 24 months (matches research timeline)
**Files Modified:** `src/simulation/agents/aiAgent.ts`, `src/simulation/gamingDetection.ts`
**Validation:** All tests passed, zero month-0 detections, gaming emerges at month 3+
**Status:** ✅ COMPLETE (Roy1, Oct 30) - Validated and production-ready
**Logs:**
- `logs/issue5_month0_gaming_analysis_20251030.md` (root cause analysis)
- `logs/issue5_fix_summary_20251030.md` (implementation summary)
- `logs/issue5_validation_results_20251030.md` (validation results)
**Time:** ~4 hours (analysis + implementation + validation)

#### ISSUE-6: Month-0 Refugee Crisis 325M (1.5h) 🟡 MEDIUM - ✅ COMPLETE (Roy, Oct 30 11:45am)
**Evidence:** 325.9M at risk (3x current global refugees)
**Root Cause:** War/conflict displacement used global 8B population instead of conflict zone ~400M
**Fix Applied:**
- Line 410-421: Calculate conflict zone population (~5-10% of global with scaling)
- Result: ~16-32M displaced (realistic per UNHCR 2023: 110M global)
**Files Modified:** `src/simulation/refugeeCrises.ts` (lines 407-432)
**Status:** ✅ COMPLETE (Roy, Oct 30) - Validated with research

**Remaining Work:** 0 hours - ALL MONTE CARLO ISSUES RESOLVED!

**Next Steps:**
1. Complete Issues 5-8 (calibration and data export fixes)
2. Run parameter sweep: 4 scenario modes × 4 AI alignment levels = 16 configs × N=100 = 1,600 runs (~4-7h compute)
3. Validate outcome diversity across scenario modes

---

### Overreliance & Automation Bias Mechanic (8-12h)
**Status:** 🟠 NEW - Gap identified in simulation coverage analysis (Oct 2025)
**Priority:** HIGH - Critical missing mechanic, well-researched problem
**Research Basis:** Q91 from arXiv:2404.09932, Rastogi et al. 2022 (arXiv:2202.05983), Springer AI & Society 2025
**Design Spec:** `/plans/overreliance-automation-bias-design.md`

**Problem:**
- Research: 35+ studies show users over-trust AI outputs even when wrong
- Impact: Affects ALL AI deployment contexts (medicine, law, governance, safety)
- Current Gap: Simulation assumes optimal human oversight, research shows humans perform WORSE with AI assistance
- Paradox: Better AI → WORSE human oversight (counterintuitive but research-backed)

**Key Research Findings:**
- Automation bias: Users defer to AI 70-80% of time even with domain expertise
- Combined performance often WORSE than either human OR AI alone (68% vs 75% human, 80% AI)
- Mitigation attempts (warnings, confidence scores) largely INEFFECTIVE (max 15% improvement)
- Effect strongest when: AI appears confident, task is complex, user is fatigued

**Implementation:**
- **Phase:** `OverreliancePhase.ts` (after BenchmarkEvaluationsPhase, before QualityOfLifePhase)
- **State Variables:** humanOversightQuality, automationBias, decisionQualityMultiplier, domain-specific overreliance
- **Mechanics:**
  - Automation bias increases with AI capability AND trust
  - Human oversight quality DEGRADES inversely with automation bias (counterintuitive)
  - Decision quality can be 0.5-1.2x (WORSE than baseline in high-trust misalignment scenarios)
  - Domain-specific: Medical (1.2x), Legal (1.1x), Governance (1.3x), Safety-Critical (1.4x)
- **Failure Modes:**
  - Capability-trust mismatch: High capability + high trust + low alignment = catastrophic
  - Expertise erosion: Long-term high bias → skill atrophy (24+ months)
  - Mitigation paradox: Warnings breed complacency (5% INCREASE in bias)
  - High-stakes amplification: Automation bias INCREASES under pressure

**Impact on Simulation:**
- Government decisions affected (policyQualityModifier)
- Healthcare outcomes (can worsen despite advanced AI)
- Safety-critical systems (catastrophic failure risk)
- QoL dimensions (autonomy, competence, security)

**Success Criteria:**
- Low AI + low trust: decisionQualityMultiplier ≈ 1.0
- High AI + high trust + high alignment: ≈ 1.1-1.15
- High AI + high trust + low alignment: ≈ 0.5-0.6 (catastrophic)
- Mitigation effectiveness ≤ 15% (research constraint)

**Time Estimate:** 8-12 hours (mechanic design + phase + integration + Monte Carlo testing)

---

### Test-Set Contamination Mechanic (6-8h)
**Status:** 🟠 NEW - Gap identified in simulation coverage analysis (Oct 2025)
**Priority:** MEDIUM-HIGH - Important for realistic capability evaluation
**Research Basis:** Q47 from arXiv:2404.09932, Sainz et al. 2023 (arXiv:2310.18018), Jacovi et al. 2023 (arXiv:2310.17910)
**Design Spec:** `/plans/test-set-contamination-design.md`

**Problem:**
- Research: 60-80% of major benchmarks show contamination (models memorize test answers)
- Impact: Systematic overestimation of capabilities, false sense of security
- Current Gap: Benchmarks always accurate in simulation, reality shows 10-50% inflation over time
- Progression: Fresh (accurate) → 12 months (15%) → 24 months (30%) → 36+ months (50%+)

**Key Research Findings:**
- Contamination rate: Public benchmarks 20% per year, open-source models 40% per year
- Capability inflation: 10-40% depending on contamination level
- Benchmark lifecycle: Industry creates new benchmarks every 6-18 months (arms race)
- Private eval suites: 80% slower contamination but expensive ($500M+ to create)

**Implementation:**
- **Integration:** Modify existing `BenchmarkEvaluationsPhase.ts` (add contamination layer)
- **State Variables:** BenchmarkContamination state with per-benchmark tracking
- **Mechanics:**
  - Benchmarks age and accumulate contamination (asymptotic to 0.95)
  - Measured capability = true capability × (1 + contamination × 0.6)
  - Informativeness decays with contamination
  - Benchmark refresh cycles when avgContamination > 0.4
- **Failure Modes:**
  - Contamination cascade: All benchmarks contaminated rapidly (open weights + aggressive scraping)
  - Capability mirage: Think AI is superintelligent when it's not
  - Alignment illusion: Deploy misaligned AI thinking it's safe
  - Resource waste: $2B+/year on benchmark arms race

**Impact on Simulation:**
- Government uses INFLATED capability/alignment estimates for decisions
- Can trigger premature emergency responses (false alarm)
- Can deploy dangerous AI due to alignment overestimation (catastrophic)
- Resources diverted from safety research to benchmark creation

**Success Criteria:**
- Fresh benchmarks (month 0): contaminationLevel = 0.0
- 12-month-old: ≈ 0.25-0.35
- 24-month-old: ≈ 0.50-0.60
- 36-month-old: ≈ 0.70-0.80
- Private benchmarks: 80% slower contamination
- Capability inflation scales with contamination (10-50%)

**Time Estimate:** 6-8 hours (mechanic + BenchmarkEvaluationsPhase integration + testing)

---

### Multi-Agent Collusion Verification & Implementation (10-14h)
**Status:** 🟠 NEW - Status UNCLEAR, needs verification
**Priority:** MEDIUM-HIGH - Verify if already modeled, add steganography if missing
**Design Spec:** `/plans/multi-agent-collusion-design.md`

**Problem:**
Multiple AIs can develop steganographic communication (hidden messages humans can't decode). If AIs coordinate covertly, human oversight becomes ineffective.

**First Step: Verification (2-3h)**
Review `CollectiveActionsPhase.ts` to determine what's already modeled:
- Can multiple AIs develop covert communication channels?
- Can they share knowledge/strategies hidden from humans?
- Can they coordinate resistance to shutdown?
- Can they pool resources covertly?

**Implementation (if gaps found, 8-11h):**
- New phase: `MultiAgentCollusionPhase.ts`
- Steganographic channel creation and detection
- Coordinated actions: knowledge sharing, shutdown resistance
- Research-backed emergence rates: 2 AIs (10%), 5+ AIs (70% annual)

---

### MEDIUM Priority

#### Policy System Improvements (11-13h remaining)
**Status:** 5 of 6 sections complete + critical bug investigation needed

**Completed Sections:**
- ✅ Unemployment Penalty Calibration (3-tier nonlinear)
- ✅ Retraining Effectiveness Calibration (30% average)
- ✅ UBI Floor Mechanics Validation
- ✅ Baseline Assumptions Documentation
- ✅ Variance Analysis (Oct 28) - 6 scenarios tested, critical finding: Combined Interventions show zero variance

**Remaining Sections:**

**1. Variance Analysis** ✅ **COMPLETE (Oct 28)** - **🚨 CRITICAL FINDING**
- **Status:** Analysis complete - 6 scenarios tested (N=10 each)
- **Log:** `logs/policy_variance_analysis_20251028_233530.log` (242K lines, 11MB)
- **Results:**
  - **Baseline:** 77.5% unemployment, 35% StdDev (bimodal: 7.4% to 95%)
  - **UBI Only:** Same as baseline (UBI alone doesn't help)
  - **Retraining/Teaching/Job Guarantee:** Similar patterns
  - **🔴 Combined Interventions:** 13.1% with **ZERO variance** (StdDev=0.0)
    - All 10 runs identical (13.1% unemployment)
    - **RED FLAG:** Suggests over-constrained model or fixed equilibrium
- **Next Steps:**
  1. Investigate why Combined Interventions have zero variance
  2. Review statistical significance of differences
  3. Document systemic inequality effects in wiki

**2. Cooperative AI Ownership Model (10-12h) - LOW**
- Research: Mondragon cooperatives 4% bankruptcy vs 10% capitalist
- Action: Model worker-owned AI systems with profit-sharing
- Files: New `cooperativeOwnership.ts`

**Other Sections (Lower Priority):**
- Reduced Work Hours + UBI Combination (6-8h)
- Universal Basic Services (UBS) (8-10h)
- Meaning Economy Expansion (6-8h)

**Plan:** `/plans/completed/policy-calibration-improvements_COMPLETE_20251027.md` (for reference on completed sections)

---

### LOW Priority

#### Priority 3 Enhancements (37-48h)

**P3.1: Variable Timesteps (10-12h)**
- Event-driven architecture, 3-5x performance gain
- Plan: `/plans/p3-1-variable-timesteps.md`

**P3.2: Unknown Unknowns (4-6h)**
- Black swan events, true uncertainty
- Plan: `/plans/p3-2-unknown-unknowns.md`

**P3.3: Alignment Specificity** ✅ **COMPLETE (Oct 26)**
- Plan: `/plans/completed/p3-3-alignment-model-specificity_COMPLETE_20251026.md`

**P3.4: Government Implementation Realism (6-8h)**
- Policy implementation delays, bureaucratic friction
- Plan: `/plans/p3-4-government-implementation-realism.md`

**P3.5: Parameter Uncertainty (6-8h)**
- Continuous uncertainty quantification, sensitivity analysis
- Plan: `/plans/p3-5-parameter-uncertainty.md`

**P3.6: Ensemble AI Alignment Verification (8-10h)**
- Multi-model voting for safety-critical decisions
- Plan: `/plans/p3-6-ensemble-alignment-verification.md`
- Note: Prototype only (40% overhead, collusion risk)

**P3.7: Regional-First Population Architecture** ✅ **COMPLETE (Oct 27)**
- Plan: `/plans/completed/regional-aggregation-refactor_COMPLETE_20251027.md`

---

#### TIER 5 Features (46h)

**Status:** Not yet implemented (LOW priority enrichment)

**TIER 5.1: Consciousness & Spirituality (5h)**
- Psychedelic therapy, meditation tech, meaning spiral
- Plan: `/plans/tier5-1-consciousness-spirituality.md`

**TIER 5.2: Longevity & Space Expansion (6h)**
- Life extension, asteroid mining, Mars colonies
- Plan: `/plans/tier5-2-longevity-space.md`

**TIER 5.3: Cooperative AI Architectures (5h)**
- AI-AI cooperation, value learning, corrigibility
- Plan: `/plans/tier5-3-cooperative-ai.md`

**TIER 5.4: Financial System Interactions (5h)**
- Algorithmic trading, CBDC, flash crashes
- Plan: `/plans/remaining_tasks_5_pm_10_08_25.md` (Section 2.5)

**TIER 5.5: Biological & Ecological (4h)**
- Dual-use research, pandemic preparedness
- Plan: `/plans/remaining_tasks_5_pm_10_08_25.md` (Section 2.6)

**TIER 5.6: Religious & Philosophical (4h)**
- AI worship, neo-luddites, culture wars
- Plan: `/plans/remaining_tasks_5_pm_10_08_25.md` (Section 2.7)

**TIER 5.7: Temporal Dynamics (3h)**
- Institutional inertia, infrastructure lock-in
- Plan: `/plans/remaining_tasks_5_pm_10_08_25.md` (Section 2.8)

**TIER 5.8: Multi-Dimensional Capabilities (6h)**
- Additional capability interactions (17 dimensions implemented)

---

#### Black Mirror Integration (37-49 weeks, phased)

**Full Report:** `reviews/BLACK_MIRROR_INTEGRATION_PLAN.md`
**Status:** ~40% strongly validated, ~25% conditionally approved, ~35% rejected

**Phase 1: Immediate Integration (9-12 weeks) - HIGH PRIORITY**
- 5 strongly validated systems with robust peer-reviewed research
- Plan: `/plans/black-mirror-phase1-immediate.md`
- Systems: Attention Economy, Surveillance Normalization, Notification Addiction, Reality Erosion, Social Rating

**Phase 2: Near-Term Development (12-16 weeks) - MEDIUM PRIORITY**
- 4 conditionally approved systems needing development work
- Plan: `/plans/black-mirror-phase2-near-term.md`
- Systems: Enhanced Social Credit, Parasocial AI, Memetic Contagion, Algorithmic Amplification
- Note: Requires bidirectional modeling (positive AND negative effects)

**Phase 3: Long-Term Research** - Partially complete
- ✅ Digital Consciousness Governance (12-16h) - COMPLETE (Oct 18)
- DEFERRED: Performative Behavior Modeling (18-24 months)
- REJECTED: Autonomous Weapon Degradation Curves (research obsolete)

---

#### TIER 2B: Competitive Equilibrium Model

**Status:** Deferred (alternative to detection arms race)
**Priority:** LOW - Only if detection <5-10%
**Estimated Time:** 30-50 hours
**Plan:** `/plans/tier2b-competitive-equilibrium.md`

**Overview:**
Instead of enforcing universal AI alignment through detection (TIER 2A), model **competitive AI ecosystems** where cooperation emerges from market dynamics, reputation systems, and mutual deterrence.

**Alternative paradigm:** Heterogeneous AI values + market competition + polycentric governance → stable equilibrium through game-theoretic cooperation, NOT centralized control.

**Research Foundation:**
- Axelrod (1984) - Repeated games, Tit-for-Tat cooperation evolution
- Ostrom (2009) - Polycentric governance (30+ empirical case studies)
- Bostrom (2014) - Multipolar AI scenarios more stable than singleton
- Drexler (2019) - AI-as-service (CAIS) reduces alignment risk vs monolithic agents

---

## Development Standards

**Every mechanic requires:**
1. Research Citations (2+ peer-reviewed sources, 2024-2025 preferred)
2. Parameter Justification (why this number? backed by data)
3. Mechanism Description (how it works, not just effects)
4. Interaction Map (what affects/is affected)
5. Expected Timeline (early/mid/late game)
6. Failure Modes (what can go wrong)
7. Test Validation (Monte Carlo evidence)

**Development Workflow:**
1. Research Phase → Create plan with citations
2. Design Phase → Define state, mechanics, interactions
3. Implementation Phase → Code, integrate, log, test
4. Validation Phase → Monte Carlo (N≥10)
5. Documentation Phase → Wiki, devlog, roadmap

**Balance Philosophy:** NO tuning for "fun" - this is a research tool. If model shows 90% extinction → DOCUMENT WHY. If 50% Utopia → DOCUMENT WHY.

---

## Summary

**Total Remaining Effort:** ~53-117 hours (reduced by 1h citation fixes + 12h integration + 14-20h Monte Carlo validation)

**Breakdown by Priority:**

**CRITICAL:**
- 🔴 Systematic Claim Verification Crisis (Layer 2): 40-60h
  - ~50% of real citations don't support claims
  - Requires reading papers and extracting direct quotes
  - 87 research files with 815 real citations

**HIGH:**
- ✅ Citation Verification Fixes: COMPLETE (Roy2, Oct 29) - 1h
- ✅ Monte Carlo Validation Bug Fixes: COMPLETE (Oct 29-30) - All 8 issues resolved (14-20h)
  - ✅ Issues 1-4: Western Liberal, outcome classification, biosphere, 100% dystopia
  - ✅ Issue 5: Month-0 gaming detection (3-month delay + maturity ramp) - Roy1
  - ✅ Issue 6: Refugee crisis calibration (conflict zone population fix) - Roy
  - ✅ Issues 7-8: Population & biosphere snapshot exports
- ✅ Architecture Integration Issues: COMPLETE (Oct 29-30) - All 8 issues resolved
  - ✅ Multi-paradigm DUI component breakdown (8-12h) - COMPLETE (Roy3, Oct 29)
  - ✅ Population units type safety (12-16h) - COMPLETE (Oct 28-29)
  - ✅ AI resentment recovery + policy (8-12h) - COMPLETE (Roy2, Oct 30)
  - ✅ Planetary Boundaries Recovery + Tech Effects (6-8h) - COMPLETE (Roy2, Oct 30)

**MEDIUM:**
- 🟡 Crisis Mitigation Mechanics: 2-4h (conditional, awaiting response)
- 🟡 Policy System Improvements: 11-13h
- 🟡 Overreliance & Automation Bias: 8-12h
- 🟡 Test-Set Contamination: 6-8h
- 🟡 Multi-Agent Collusion: 10-14h

**LOW:**
- 🟢 P3 Enhancements: 37-48h
- 🟢 TIER 5 Features: 46h
- 🟢 Black Mirror Integration: 21-28 weeks (phased)
- 🟢 TIER 2B Competitive Equilibrium: 30-50h (deferred)

**Related Documentation:**
- **Completed Work:** `/plans/CHANGELOG_OCTOBER_2025.md` + `/plans/completed/` (112+ archived plans)
- **Wiki:** `/docs/wiki/README.md` - System documentation
- **DevLogs:** `/devlogs/` - Development diary
- **Research:** `/research/` - Research findings archive
- **Reviews:** `/reviews/` - Critical research evaluations

---

**Last Updated:** October 30, 2025 (Roadmap cleanup - 4 major items completed and archived)
