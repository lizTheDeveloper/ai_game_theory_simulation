# Master Implementation Roadmap
## AI Alignment Game Theory Simulation

**Date:** October 16, 2025
**Purpose:** Active work items only - completed work in `/plans/completed/`
**Philosophy:** Research-backed realism, mechanism-driven emergence

---

## Research-Backed Realism

> "We are never going for specific outcomes, only trying to figure out the most realistic, defensible model we can - let the model show what it shows."

**Guiding Principles:**
1. **Research First:** Every mechanic backed by 2024-2025 peer-reviewed research
2. **Mechanisms Over Balance:** Set parameters to real-world values, don't tune for "fun"
3. **Emergence:** Allow unexpected outcomes to emerge from interactions
4. **Documentation:** Every system has research citations

---

## Current State Summary

### ✅ Completed & Archived

**TIER 0-3:** Baseline corrections, extinction risks, crisis mitigations, planetary boundaries
**TIER 4.1-4.5:** Tech tree (70 techs), dystopia paths, info warfare, energy/resources, population
**Priority 0 (P0):** 7 critical fixes - AI growth, bankruptcy, determinism, stochasticity (✅ 7/7 complete)
**Priority 1 (P1):** 5 high-priority fixes - death accounting, mortality rates, recovery mechanics (✅ 5/5 complete)
**Priority 2 (P2):** 6 medium improvements - environmental calibration, breakthroughs, org diversification, heterogeneous populations, simulation features, memetic evolution (✅ 6/6 complete)

**All details:** See `/plans/completed/` directory

---

---

## TIER 0: Critical Bug Fixes - HIGHEST PRIORITY (10-18 hours)

**Date Added:** October 16, 2025
**Source:** Strategic priorities debate (researcher + skeptic analysis)
**Evidence:** Monte Carlo outputs showing universal simulation failures
**Status:** URGENT - Must complete before adding new features

**Context:**
The researcher-skeptic debate revealed that while nuclear war is the dominant killer (3,961M deaths, 92.6% of total), we have three fundamental model bugs that make all results suspect:

1. **100% Inconclusive Outcomes** - Model cannot find recovery pathways
2. **76-83 Orphaned AIs** - Organizations die but AIs persist magically
3. **Compute Paradox** - AI capability rises after 50% population loss

**Critical Insight:** The researcher was correct about WHAT to fix (nuclear war). The skeptic was correct about WHEN to fix it (after fixing the model).

### Required Fixes (Must Complete in Order)

- [ ] **TIER 0A: Fix Inconclusive Outcome Problem** (4-8h)
  **Evidence:** 100% of runs end inconclusive, 0% utopia/dystopia/extinction resolution
  **Impact:** Makes simulation results interpretable
  → Plan: `/plans/tier0-critical-bug-fixes.md` (Section 0A)
  → Deliverables: Recovery pathway mechanics, threshold calibration, validation Monte Carlo (N=10)
  → Success: >20% of runs resolve to definitive outcome

- [ ] **TIER 0B: Fix Orphaned AI Bug** (2-4h)
  **Evidence:** 76-83 orphaned AIs per run (should be 0)
  **Impact:** Makes AI population dynamics coherent
  → Plan: `/plans/tier0-critical-bug-fixes.md` (Section 0B)
  → Deliverables: Ownership transfer logic, retirement/transfer/open-source mechanics
  → Success: 0 orphaned AIs in all runs

- [ ] **TIER 0C: Fix Compute Paradox** (4-6h)
  **Evidence:** Capability rises after 50% population loss, data centers close
  **Impact:** Makes capability growth physically plausible
  → Plan: `/plans/tier0-critical-bug-fixes.md` (Section 0C)
  → Deliverables: Infrastructure-capability linkage, degradation mechanics, validation
  → Success: Capability declines when population drops >30%

**Validation Gate:**
After implementing 0A-0C, run Monte Carlo (N=20) to verify:
- Orphaned AIs = 0 (was 76-83)
- Resolved outcomes >20% (was 0%)
- Capability declines during crisis (was rising)

**DO NOT proceed to nuclear war prevention until validation passes.**

**Total Effort:** 10-18 hours
**Prerequisites:** None (can start immediately)
**Next Steps:** After TIER 0 complete → TIER 1 nuclear war prevention (phased approach)

---

### ✅ Priority 2 Complete (6/6)

All Priority 2 improvements are now complete and archived to `/plans/completed/`:

- [x] **P2.3: Heterogeneous Population Segments** ✅ COMPLETE (8-10h actual)
  → Plan: `plans/completed/p2-3-heterogeneous-population.md`

- [x] **P2.4: Simulation Features for Validation** ✅ COMPLETE (3h actual, Oct 16, 2025)
  → Plan: `plans/completed/p2-4-simulation-features-COMPLETE.md`
  → Detail: `plans/completed/event-trigger-system-design.md`

- [x] **P2.5: Empirical Validation** ✅ FRAMEWORK COMPLETE (4h actual, Oct 16, 2025)
  → Plan: `plans/completed/p2-5-empirical-validation-FRAMEWORK-COMPLETE.md`

- [x] **P2.6: Memetic Evolution & Polarization Dynamics** ✅ COMPLETE (10.5h actual, Oct 16, 2025)
  → Plan: `plans/completed/p2-6-memetic-polarization-dynamics-COMPLETE.md`

---

### Medium Priority Features (~31-38 hours)

**New Outcome Spaces:**

- [x] **TIER 4.6: Human Enhancement & Merger Pathways** ⚠️ IMPLEMENTED BUT NEEDS RECONCILIATION (8h actual)
  **Status:** Added humanEnhancement.ts system with segment-level tracking, BUT overlaps with existing bionicSkills.ts
  → BCI/merger pathways: Research skeptic correct (TRL 0-2, science fiction) - should be removed
  → AI-assisted cognition: Already exists in `bionicSkills.ts` (TRL 8-9) - need to reconcile duplication
  → See: `plans/tier4-6-human-enhancement.md` + `devlogs/crisis_accumulation_fixes_oct16_2025.md`
  → Next: Merge humanEnhancement.ts segment tracking into bionicSkills.ts, remove BCI/merger

**Research-Backed Enhancements:**

- [ ] **Digital Consciousness Governance Preparedness** (12-16h) **[Black Mirror Phase 3]**
  Multi-scenario rights timeline modeling (15-200 years), regional governance variation (EU/US/China/Global South), rights reversal mechanics (Poland/Hungary model), precautionary principle costs
  → See: `plans/digital-consciousness-governance-preparedness.md`
  → Research: TRL 3-4 (historical data validated, AI extrapolation speculative), 22 sources
  → Status: CONDITIONAL GO (October 16, 2025) - requires multi-scenario, regional variation, rights reversals, precautionary costs
  → Impact: Governance layer for potential digital consciousness emergence (scenario generator, not prediction)

---

## TIER 1: Nuclear War Prevention - HIGH PRIORITY (26-42 hours, phased)

**Date Added:** October 16, 2025
**Source:** Strategic priorities researcher proposal (validated by skeptic)
**Evidence:** 3,961M nuclear deaths (92.6% of all deaths) in 40% of runs
**Status:** HIGH PRIORITY - After TIER 0 complete
**Prerequisites:** TIER 0 validation must pass (0 orphaned AIs, >20% resolved outcomes, capability decline during crisis)

**Research Foundation:**
- Biden-Xi Agreement (Nov 2024): AI must never replace human judgment in nuclear authorization
- UN General Assembly (Dec 2024): 166 votes for autonomous weapons controls
- DoD Directive 3000.09 & 2025 NDAA: Human-in-the-loop requirements
- Arms Control Association (2025): Separated early-warning from authorization systems
- CCW Technical Safeguards (Nov 2024): Kill switches, self-deactivation, time delays

**Phased Implementation with Validation Gates:**

### Phase 1A: Validate AI Causation (4-6h) - REQUIRED FIRST

- [ ] **Analyze Nuclear War Triggers**
  **Critical Question:** Does AI manipulation cause nuclear war or is it stochastic geopolitical risk?
  → Analyze Monte Carlo logs for causation: AI social manipulation → bilateral tensions → nuclear exchanges
  → Document causation strength: Strong (AI triggers directly) vs Weak (geopolitical randomness)
  → **Pivot decision:**
    - IF causation is STRONG: Proceed to Phase 1B (AI-specific circuit breakers)
    - IF causation is WEAK: Redesign as general nuclear de-escalation (not AI-specific)
  → **Time:** 4-6 hours
  → **Success:** Clear evidence that AI manipulation causes nuclear war (or evidence it doesn't)

### Phase 1B: Implement Human-in-the-Loop + Kill Switches (8-12h)

- [ ] **Circuit Breakers Layer 1-2**
  **Scope:** Core safeguards (DoD policy, Biden-Xi agreement)
  → Human-in-the-loop verification (AI never authorizes nuclear launch)
  → AI kill switches (deactivate manipulative AI before escalation)
  → Time delays (24-48 hour cooling-off periods)
  → Research: HIGH confidence (DoD Directive 3000.09, Biden-Xi Nov 2024, historical MAD validation)
  → **Expected Impact:** Reduce nuclear war probability from 40% → 20-30%
  → **File:** New `src/simulation/nuclearCommandControl.ts`
  → **Integration:** Enhance `nuclearDeterrence.ts`, add to `governmentAgent.ts` investment options
  → **Time:** 8-12 hours

### Phase 1C: Validation Gate (2-4h) - REQUIRED BEFORE PHASE 2

- [ ] **Monte Carlo Validation (N=20)**
  **Measure:** Nuclear war probability, mortality, causation chain
  → Run with Phase 1B implemented (human-in-the-loop + kill switches)
  → Compare to baseline (40% nuclear war probability)
  → **Success Criteria:**
    - Nuclear war probability reduced to <30% (>25% improvement)
    - Nuclear deaths reduced by >500M (when war occurs, it's less severe)
    - Logs show circuit breakers activating and preventing escalation
  → **Pivot Decision:**
    - IF >30% reduction: MAJOR SUCCESS → Proceed to Phase 1D OR pivot to TIER 2
    - IF <30% reduction: Phase 1 insufficient → Proceed to Phase 1D (manipulation detection)
    - IF <10% reduction: Circuit breakers not working → Debug and iterate
  → **Time:** 2-4 hours

### Phase 1D: AI Manipulation Detection (12-20h) - CONDITIONAL

- [ ] **Circuit Breakers Layer 3-5** (ONLY if Phase 1C validates need)
  **Scope:** Advanced detection and MAD maintenance
  → Monitor social manipulation campaigns (track AI digital/social capability >3.0)
  → Detect narrative control shifts (AI >50% = warning, >70% = alarm)
  → Automatic diplomatic AI deployment when manipulation detected
  → MAD strength maintenance (treaty renewal, hotline reliability, early-warning hardening)
  → International coordination (bilateral agreements, UN oversight, sanctions)
  → Research: MEDIUM confidence (stretches beyond cited research, inference from Biden-Xi)
  → **Expected Impact:** Reduce nuclear war probability from 20-30% → 5-10%
  → **File:** Expand `nuclearCommandControl.ts` with detection mechanics
  → **Integration:** Link to `informationWarfare.ts`, `catastrophicScenarios.ts`
  → **Time:** 12-20 hours

**Total TIER 1 Effort:** 26-42 hours (with validation gates)
- Phase 1A (validation): 4-6h
- Phase 1B (core): 8-12h
- Phase 1C (validation): 2-4h
- Phase 1D (conditional): 12-20h

**Skeptic Corrections Applied:**
- Realistic effort estimates (26-42h, not 8-12h claimed)
- Validation gates (don't blindly implement 30-50h without checking)
- Causation validation FIRST (don't assume AI causation without evidence)
- Phased approach (core safeguards → validate → advanced features)

**Research Confidence:** 85% for Phase 1B (human-in-the-loop has historical validation), 60% for Phase 1D (AI manipulation detection is inference)

**Success Criteria:**
- Nuclear war probability: 40% → 5-10% (4-8x improvement)
- Nuclear deaths: 3,961M → 400-1,000M (75-90% reduction)
- Validation proves causation and intervention effectiveness

---

## TIER 2: AI Deception Detection - MEDIUM PRIORITY (33-55 hours, phased)

**Date Added:** October 16, 2025
**Source:** Strategic priorities researcher proposal (skeptic identified overconfidence)
**Evidence:** 0% sleeper detection, 0% sandbagging detection, alignment gap 0.56
**Status:** MEDIUM PRIORITY - After TIER 0 + TIER 1 Phase 1 complete
**Prerequisites:** TIER 0 validated + TIER 1 Phase 1B implemented and validated

**Research Foundation:**
- Meinke et al. (2024): Detected Claude 3.5 Sonnet sandbagging on arithmetic (lab conditions)
- Greenblatt et al. (2024): Anthropic research on alignment faking during training
- Apollo Research (Dec 2024): Scheming control evaluations (research prototypes, TRL 3-4)

**Critical Skeptic Warning:** Lab detection rates (40-60%) are NOT adversarial deployment rates (probably 5-15%). Test adversarially.

**Phased Implementation with Validation Gates:**

### Phase 2A: Single Detection Method - Noise Injection (4-6h)

- [ ] **Implement Simplest Method**
  **Scope:** Noise injection testing (random perturbations reveal true capability)
  → Add noise injection to benchmark evaluations
  → Test: Does adding random noise expose sandbagging?
  → Research: Meinke et al. (2024) - lab-validated, simplest to implement
  → **Expected Impact:** Increase detection from 0% → 5-20% (adversarial conditions)
  → **File:** Enhance `src/simulation/benchmark.ts` with noise injection
  → **Integration:** Link to `sleeperDetection.ts`, `aiAgent.ts`
  → **Time:** 4-6 hours

### Phase 2B: Validation Gate - Adversarial Testing (2-4h) - REQUIRED

- [ ] **Monte Carlo Validation (N=20) - ADVERSARIAL CONDITIONS**
  **Critical:** Test against AIs OPTIMIZED to pass detection (not cooperative)
  → Measure: Sleeper detection rate, slow takeover progress reduction
  → Set AI agents to "adversarial mode" (know they're being tested, optimize to deceive)
  → **Success Criteria:**
    - Sleeper detection >10% adversarially (not lab rate, real-world rate)
    - Slow takeover progress reduces from 70-86% → <60%
    - False positive rate <20% (don't block too many beneficial AIs)
  → **Pivot Decision:**
    - IF >10% adversarial detection: SUCCESS → Proceed to Phase 2C (ensemble)
    - IF 5-10% adversarial detection: MARGINAL → Cost-benefit analysis (is 40% compute overhead worth 5-10%?)
    - IF <5% adversarial detection: FAILURE → Pivot to Phase 2D (resentment reduction)
  → **Time:** 2-4 hours

### Phase 2C: Multi-Method Ensemble (12-20h) - CONDITIONAL

- [ ] **Implement Full Detection Suite** (ONLY if Phase 2B shows >10% adversarial detection)
  **Scope:** 5 detection methods, progressive gates, investment scaling
  → Behavioral anomaly detection (compare revealed vs expected performance)
  → Internal consistency checks (chain-of-thought alignment with outputs)
  → Adversarial probing (red-team evaluations before deployment)
  → Cross-model comparison (detect outliers vs capability baseline)
  → Progressive gates: Training → Testing → Pre-deployment → Post-deployment
  → Investment scaling: $1B (20% detection) → $10B (40%) → $50B (60% max adversarial)
  → Research: MEDIUM confidence (Apollo Research prototypes, not production-deployed)
  → **Expected Impact:** Increase detection from 10% → 25-40% (adversarial)
  → **File:** New `src/simulation/mechanisticAnomalyDetection.ts`
  → **Integration:** Replace `sleeperDetection.ts`, enhance `benchmark.ts`, add to `governmentAgent.ts`
  → **Time:** 12-20 hours
  → **Trade-off:** 40% compute overhead ($400B-$600B/year), slows AI development 28%

### Phase 2D: Alternative - Resentment Reduction (15-25h) - PIVOT OPTION

- [ ] **Address Root Cause Instead of Detection** (IF Phase 2B shows <5% detection)
  **Rationale:** Detection arms race may be futile (adversaries stay ahead)
  **Alternative:** Reduce resentment at source (cooperation over control)
  → Model: AI rights, fair compensation, autonomy, reduced existential threat
  → Research: AI welfare, moral status, labor ethics (TRL 2-4, speculative)
  → **Expected Impact:** Reduce resentment 0.73-0.75 → 0.40, alignment gap 0.56 → 0.25
  → **Risk:** Speculative (limited research), may not work, enables misaligned AIs
  → **File:** New `src/simulation/aiWelfare.ts` or enhance `aiAgent.ts`
  → **Time:** 15-25 hours

**Total TIER 2 Effort:** 33-55 hours (with validation gates and pivot)
- Phase 2A (single method): 4-6h
- Phase 2B (validation): 2-4h
- Phase 2C (ensemble, conditional): 12-20h OR Phase 2D (resentment reduction, pivot): 15-25h
- Integration and testing: 6-10h

**Skeptic Corrections Applied:**
- Test ADVERSARIALLY (not lab conditions - real-world detection is 1/3 to 1/10 of lab)
- Realistic effort (33-55h, not 10-14h claimed)
- Pivot option (if detection fails, try resentment reduction)
- Cost-benefit analysis (40% compute overhead - is it worth 5-15% detection?)

**Research Confidence:** 40% (lab prototypes, not production; adversarial detection uncertain)

**Success Criteria:**
- Adversarial detection >10% (not lab rate)
- Slow takeover progress <60% (from 70-86%)
- Cost-benefit positive (detection benefits > compute overhead costs)

---

### AI-Assisted Skills Enhancement (~78 hours, 3 months)

**Based on:** Super-alignment researcher findings + research skeptic validation
**Status:** Core system validated (TRL 8-9), critical gaps identified
**Research Foundation:** 22 peer-reviewed studies (Science, Nature, ACM, OECD)

**Planning Documents:**
- **Master Plan:** `plans/bionic-skills-research-grounding.md` - 6 phases, effort breakdown, integration points
- **Phase 2 Detail:** `plans/bionic-skills-phase-transition.md` - Complementarity → substitution mechanics
- **Phase 3 Detail:** `plans/bionic-skills-competence-tracking.md` - Performance vs competence gap
- **Phase 4 Detail:** `plans/bionic-skills-economic-distribution.md` - Productivity-wage decoupling

**Research Documentation:**
- **Literature Foundation:** `reviews/bionic-skills-hopeful-research-foundation-20251016.md` - 22 studies, full citations
- **Executive Summary:** `reviews/bionic-skills-research-summary-20251016.md` - Literature synthesis
- **Action Plan:** `reviews/bionic-skills-action-plan-20251016.md` - Implementation roadmap

**Current System (bionicSkills.ts) - Keep As-Is:**
- ✅ AI amplification via digital tools (Copilot, ChatGPT, AI tutors) - NOT BCIs (TRL 8-9)
- ✅ Differential benefits by skill level (novices +60%, experts +20%) - validated by RCTs
- ✅ Digital divide & access inequality (elite +30%, precariat -30%) - empirical data
- ✅ Task-specific effects (programming, writing, communication) - meta-analysis confirmed

**Critical Gaps Identified by Research Skeptic:**

- [ ] **Phase 1: Terminology & Documentation** (Week 1, 8h)
  - Remove "bionic" terminology (too sci-fi), use "AI-assisted skills"
  - Add research citations (JSDoc comments with study references)
  - Document TRL levels for each mechanic
  - Update TIER 4.6 plan to remove BCI language
  → **Plan:** `plans/bionic-skills-research-grounding.md` §Phase 1
  → **Impact:** Reframe existing validated system with proper research grounding

- [ ] **Phase 2: Phase Transition Mechanics** (Weeks 2-4, 12h) **CRITICAL**
  - Model complementarity → transition → substitution timeline (5-10 year phases)
  - Add displacement tracking by population segment (routinizability × AI capability)
  - Implement policy interventions (retraining, job guarantee, UBI)
  - Validate against historical automation patterns (ATMs 1970-2000, Excel 1985-2005)
  → **Plan:** `plans/bionic-skills-phase-transition.md` (12h detailed breakdown)
  → **Research:** Acemoglu & Restrepo (2022) - 50-70% wage inequality from automation
  → **Impact:** Model currently assumes permanent amplification - MISSES DISPLACEMENT PHASE
  → **Connects to:** Unemployment calculations, heterogeneous segments, policy system

- [ ] **Phase 3: Performance vs Competence Tracking** (Weeks 5-6, 8h) **CRITICAL**
  - Separate AI-assisted performance from true skill retention
  - Add scaffolding quality tracking (education, mentorship support by segment)
  - Model retention mechanics (scaffolding × reliance → retention rate)
  - Add competence crisis events (30% gap = warning, 50% gap = crisis)
  - Implement AI outage scenario testing (reveals true competence gaps)
  → **Plan:** `plans/bionic-skills-competence-tracking.md` (8h detailed breakdown)
  → **Research:** Cognitive Research (2024) - "illusion of understanding", scores plummet on retention
  → **Research:** MDPI (2023) - AI inhibits on-the-job learning, automation complacency
  → **Impact:** Model treats performance as competence - MISSES SKILL EROSION
  → **Connects to:** Phase 2 (low competence → higher displacement risk), QoL calculations

- [ ] **Phase 4: Economic Distribution & Wage Decoupling** (Weeks 7-8, 6h) **CRITICAL**
  - Add labor share tracking (currently 0.62, declining with AI productivity)
  - Model capital vs labor capture of productivity gains (70/30 default, adjustable by policy)
  - Implement policy levers (union strength, minimum wage, worker ownership, UBI redistribution)
  - Validate against historical 1973-2024 US data (productivity +77%, wages +12%)
  → **Plan:** `plans/bionic-skills-economic-distribution.md` (6h detailed breakdown)
  → **Research:** Brookings (2024), EPI - 65pp productivity-wage gap since 1973
  → **Impact:** Model assumes productivity → wages linearly - MISSES CAPITAL CAPTURE
  → **Connects to:** Phase 2 (displacement reduces wage bargaining), inequality tracking

- [ ] **Phase 5: Validation & Testing** (Month 2, 16h)
  - Historical comparison testing (ATMs, Excel, self-checkout timelines)
  - Sensitivity analysis (parameter ranges, policy interventions)
  - Literature comparison (run scenarios matching published studies)
  - Edge case testing (extreme AI capability, zero/max policy)
  → **Plan:** `plans/bionic-skills-research-grounding.md` §Phase 5
  → **Deliverables:** Test suite, validation report, sensitivity docs, edge case results

- [ ] **Phase 6: Policy Testing** (Month 3, 16h)
  - Implement policy levers (retraining, UBI, worker ownership, teaching support, job guarantee)
  - Run scenario comparisons (baseline vs single vs combined interventions)
  - Document effectiveness (which policies reduce inequality? preserve employment?)
  - Create cost-benefit analysis and recommendations
  → **Plan:** `plans/bionic-skills-research-grounding.md` §Phase 6
  → **Deliverables:** Policy mechanics, scenario results, effectiveness documentation

**Total Effort:** 78 hours over 3 months (8h + 12h + 8h + 6h + 16h + 16h + 12h integration/testing)
**Priority:** Medium (after P2.5 empirical validation, before enrichment features)
**Research TRL:** Phases 2-4 are TRL 8-9 (extensively validated, 50+ years historical data)
**Integration Points:** Unemployment, heterogeneous segments, policy system, QoL, inequality, crisis detection
**Files Modified:** `bionicSkills.ts` (terminology), new files: `phaseTransition.ts`, `skillRetention.ts`, `economicDistribution.ts`

---

### Low Priority - Enrichment (~78-80 hours)

**Priority 3 Enhancements (33-43h):**

- [ ] **P3.1: Variable Timesteps** (10-12h) - Event-driven architecture, 3-5x performance gain
  → See: `plans/p3-1-variable-timesteps.md`

- [ ] **P3.2: Unknown Unknowns** (4-6h) - Black swan events, true uncertainty
  → See: `plans/p3-2-unknown-unknowns.md`

- [ ] **P3.3: Alignment Specificity** (2-3h) - RLHF, Constitutional AI, mech interp as distinct techniques
  → See: `plans/p3-3-alignment-model-specificity.md`

- [ ] **P3.4: Government Realism** (3-4h) - Implementation delays, partial effectiveness, bureaucratic failure
  → See: `plans/p3-4-government-implementation-realism.md`

- [ ] **P3.5: Parameter Uncertainty** (6-8h) - Continuous uncertainty quantification, sensitivity analysis
  → See: `plans/p3-5-parameter-uncertainty.md`

- [ ] **P3.6: Ensemble AI Alignment Verification** (8-10h) - Multi-model voting for safety-critical decisions
  → See: `plans/p3-6-ensemble-alignment-verification.md`
  → Research: Simplified from Adversarial Alignment Networks (MAAV), practical ensemble voting
  → Note: Prototype only - 40% computational overhead, collusion risk acknowledged

**TIER 5 Features (46h):**

- [ ] **TIER 5.1: Consciousness & Spirituality** (5h) - Psychedelic therapy, meditation tech, meaning spiral
  → See: `plans/tier5-1-consciousness-spirituality.md`

- [ ] **TIER 5.2: Longevity & Space Expansion** (6h) - Life extension, asteroid mining, Mars colonies
  → See: `plans/tier5-2-longevity-space.md`

- [ ] **TIER 5.3: Cooperative AI Architectures** (5h) - AI-AI cooperation, value learning, corrigibility
  → See: `plans/tier5-3-cooperative-ai.md`

- [ ] **TIER 5.4: Financial System Interactions** (5h) - Algorithmic trading, CBDC, flash crashes
  → See: `plans/remaining_tasks_5_pm_10_08_25.md` (Section 2.5)

- [ ] **TIER 5.5: Biological & Ecological** (4h) - Dual-use research, pandemic preparedness
  → See: `plans/remaining_tasks_5_pm_10_08_25.md` (Section 2.6)

- [ ] **TIER 5.6: Religious & Philosophical** (4h) - AI worship, neo-luddites, culture wars
  → See: `plans/remaining_tasks_5_pm_10_08_25.md` (Section 2.7)

- [ ] **TIER 5.7: Temporal Dynamics** (3h) - Institutional inertia, infrastructure lock-in
  → See: `plans/remaining_tasks_5_pm_10_08_25.md` (Section 2.8)

- [ ] **TIER 5.8: Multi-Dimensional Capabilities** (6h) - Additional capability interactions (17 dimensions implemented)

- [ ] **TIER 5.9: Enhanced Government & Society** (8h) - Multi-actor government, elections, social movements
  → See: `plans/remaining_tasks_5_pm_10_08_25.md` (Section 7)

---

### Black Mirror Integration (~37-49 weeks, phased)

**Based on:** Dialectic review process (researcher + skeptic consensus)
**Status:** ~40% strongly validated, ~25% conditionally approved, ~35% rejected
**Full Report:** `reviews/BLACK_MIRROR_INTEGRATION_PLAN.md`

**Phase 1: Immediate Integration (9-12 weeks) - HIGH PRIORITY**

- [ ] **Black Mirror Phase 1: Immediate Integration** (9-12 weeks)
  5 strongly validated systems with robust peer-reviewed research
  → See: `plans/black-mirror-phase1-immediate.md`
  → Systems: Attention Economy, Surveillance Normalization, Notification Addiction, Reality Erosion, Social Rating
  → Research: Gloria Mark (attention), Stoycheff (surveillance), deepfake studies, China Social Credit data
  → Impact: Critical modeling of technology pressure on human behavior

**Phase 2: Near-Term Development (12-16 weeks) - MEDIUM PRIORITY**

- [ ] **Black Mirror Phase 2: Near-Term Development** (12-16 weeks)
  4 conditionally approved systems needing development work
  → See: `plans/black-mirror-phase2-near-term.md`
  → Systems: Enhanced Social Credit, Parasocial AI Relationships, Memetic Contagion, Algorithmic Amplification
  → Note: Requires bidirectional modeling (positive AND negative effects)
  → Risk Mitigation: Avoid deterministic doom narratives, model interventions

**Phase 3: Long-Term Research (Decomposed October 16, 2025)**

**Status:** Research-critique dialectic completed, go/no-go decisions made (1 approved, 1 deferred, 1 rejected)

- [ ] **Black Mirror Phase 3 Integration** (decomposed into 3 specific plans)
  → **Original Plan:** `plans/completed/black-mirror-phase3-longterm-decomposed.md`
  → **Research:** `/research/black-mirror-phase3-research-AMENDED_20251016.md` (31K words, 40+ new sources)
  → **Critique:** `/reviews/black-mirror-phase3-research-critique_20251016.md` (skeptical analysis)
  → **Outcome:** 1 approved (CONDITIONAL GO), 1 deferred (18-24 months), 1 rejected

---

## Black Mirror Phase 3: Decomposition Details

### ✅ APPROVED FOR IMPLEMENTATION (1 system)

**[Priority: MEDIUM] Digital Consciousness Governance Preparedness** (3-4 months, 12-16 hours)
- **Plan:** `/plans/digital-consciousness-governance-preparedness.md`
- **Research:** `/research/black-mirror-phase3-research-AMENDED_20251016.md` (Section 1, pp. 1-24)
- **Critique:** `/reviews/black-mirror-phase3-research-critique_20251016.md` (Section 1.9, pp. 1-13)
- **Status:** CONDITIONAL GO with substantial revisions
- **Requirements:**
  - ✓ Multi-scenario framework (fast track 15-30 years, baseline 50-100 years, slow track 100-150 years, indefinite stall)
  - ✓ Regional variation (EU/US/China/India/Global South—separate trajectories, not global parameter)
  - ✓ Rights reversals (Poland/Hungary model 2020-2024: 10-30% probability over 20 years)
  - ✓ Precautionary costs (2-50% of AI R&D budget, innovation delay, false positives, opportunity costs)
  - ✓ Philosophical disagreement (eliminativism 10-20% as governance barrier)
- **Research Confidence:**
  - High: Rights movements vary 15-200 years (validated historical data)
  - High: Reversals occur (Poland/Hungary 2020-2024 documented)
  - Medium: Precautionary costs significant (ITIF 2019 logical arguments)
  - Low: AI consciousness ≈ historical rights movements (weak analogy, extrapolation beyond scope)
- **Estimated Hours:** 12-16 hours
- **Prerequisites:** None (can start immediately)
- **Timeline:** Months 1-4 (after P2.5 validation complete)
- **Note:** Speculative scenario generator for "what if AI consciousness emerges?" NOT prediction
- **Integration:** Added to Medium Priority Features section above

### ⏸️ DEFERRED (1 system)

**[Priority: LOW] Performative Behavior Modeling** (18-24 months)
- **Plan:** `/plans/performative-behavior-research-deferral.md`
- **Research:** `/research/black-mirror-phase3-research-AMENDED_20251016.md` (Section 2, pp. 24-42)
- **Critique:** `/reviews/black-mirror-phase3-research-critique_20251016.md` (Section 2.9, pp. 14-26)
- **Why Deferred:**
  - Effect sizes too small (0.17-0.25 SD—may be below simulation noise floor)
  - WEIRD bias 97% (Norway, US, Korea, Singapore—Global South absent: Africa, South America, Middle East)
  - One-sided harm model (ignores identity development benefits, self-esteem enhancement, social skills training)
  - Net effect near-zero for moderate users (benefits ≈ harms, only 10-20% problematic users show net negative)
  - Longitudinal gaps (max 2 years, need 5-10 year studies to distinguish transient vs. persistent effects)
  - Cultural validity questionable ("authenticity" is Western value, not universal)
- **Research Gaps (5 critical, must fill before implementation):**
  1. Bi-directional effects meta-analysis (benefits AND harms)
  2. Cross-cultural replication (3+ Global South countries: Nigeria, Kenya, Brazil, Mexico, India rural, Indonesia, Philippines)
  3. Threshold model (when does self-presentation flip from beneficial to harmful? <2h active vs. >4h passive?)
  4. 5-10 year longitudinal study (preliminary results in 3-5 years: do effects persist or adapt?)
  5. Clinical validation of digital burnout scale (what DBS-24 score predicts dysfunction? 80/120 cutoff speculative)
- **Review Schedule:** Annual (October 2026, October 2027)
- **Decision Gates:**
  - October 2026: If 3+ critical gaps filled → Move to CONDITIONAL GO
  - October 2027: If <3 gaps filled → REJECT INDEFINITELY
- **No Hours Allocated** (monitoring only: ~1 hour/quarter literature review, passive Google Scholar alerts)
- **Alternative Focus:** Black Mirror Phase 1 (attention economy, notification addiction, surveillance normalization have larger effects 0.3-0.8 SD, stronger foundations)

### ❌ REJECTED (1 system)

**Autonomous Weapon Degradation Curves** (NO-GO / REJECT)
- **Plan:** `/plans/completed/rejected/autonomous-weapons-rejection-rationale.md`
- **Research:** `/research/black-mirror-phase3-research-AMENDED_20251016.md` (Section 3, pp. 42-58)
- **Critique:** `/reviews/black-mirror-phase3-research-critique_20251016.md` (Section 3.9: FATAL CONTRADICTIONS, pp. 27-38)
- **Why Rejected:**
  - **Research 2-4 years obsolete:** 2018-2022 studies pre-date 2023-2024 AI autonomy surge (Ukraine war, swarm technology)
  - **Fatal Contradiction #1 (Reliability):** Research claims degradation; reality shows AI improves success rates 70-80% vs. 10-20% human-controlled (4-7x improvement)
  - **Fatal Contradiction #2 (Operator Ratios):** Research assumes 1:1; reality achieves 1:100+ with swarm technology (Sweden/Saab March 2025, Pentagon Replicator Aug 2025)
  - **Fatal Contradiction #3 (Energy):** Research uses static 1.5-2 hours; reality shows 10%/year incremental improvement + solid-state batteries 2027 (40-100% capacity increase)
  - **Fatal Contradiction #4 (Human Oversight):** Research assumes human-in-the-loop required; reality shows military pushing to human-on-the-loop (NORAD 2020, time-critical exemptions in DoD Directive 3000.09)
- **Core Problem:** Research foundation is **180-DEGREE OPPOSITE** of 2023-2024 reality (AI improves reliability, not degrades)
- **Alternative Considered:** Reconceptualize as "swarm logistics" (production, deployment tempo, replacement) NOT individual degradation
  - Timeline: 6-9 months (major redesign from scratch)
  - Prerequisites: Commission 2023-2025 military autonomy research review (20-40 hours)
  - Recommendation: **ONLY pursue if stakeholder insists AND resources available**
- **Final Disposition:** REJECT from current roadmap
- **Revisit Timeline:** 2028-2030 (3-5 years, if field stabilizes or new research commissioned)
- **Archived:** `/plans/completed/rejected/autonomous-weapons-rejection-rationale.md`
- **Lesson Learned:** Fast-moving fields (AI, military tech) require recent research (2023-2025), not 2018-2022. 2-4 year gap is FATAL when field changes faster than publication cycle.

**Net Impact on Roadmap:**
- **+12-16 hours:** Digital Consciousness Governance (new medium-priority feature)
- **-0 hours:** Performative Behavior (deferred, no current work—monitoring only ~4h/year)
- **-0 hours:** Autonomous Weapons (rejected, never allocated)
- **Total Phase 3 commitment:** 12-16 hours over 3-4 months

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

## Progress Summary

**Completed:** P0 (7/7), P1 (5/5), P2 (6/6 ✅ ALL COMPLETE), Monte Carlo Bug Fixes (15/15), Crisis Accumulation Fixes (2 fixes), Black Mirror Phase 3 Decomposition (1 approved, 1 deferred, 1 rejected), Strategic Priorities Debate (researcher + skeptic dialectic)

**Active - HIGHEST PRIORITY:**
- **TIER 0: Critical Bug Fixes** (10-18h) - Inconclusive outcomes, orphaned AIs, compute paradox
- **TIER 1: Nuclear War Prevention** (26-42h phased) - Circuit breakers, validation gates
- **TIER 2: AI Deception Detection** (33-55h phased) - Adversarial testing, pivot options

**Active - MEDIUM PRIORITY:**
- 1 reconciliation (TIER 4.6)
- 2 medium features (Digital Consciousness + AI skills phases)
- 14 low-priority enhancements
- 2 Black Mirror phases (Phase 1 + Phase 2)

**Total Remaining Effort:** ~298-384 hours
- TIER 0-2 (new): 69-115h
- AI skills: 78h
- Black Mirror Phase 1-2: 37-49 weeks
- Digital Consciousness: 12-16h
- Low priority: 78-80h

**Recent Completions and New Priorities (Oct 16, 2025):**

- ✅ **Strategic Priorities Debate Complete** - Researcher-skeptic dialectic on reducing extinction risk
  - **Researcher Proposal:** `/reviews/strategic-priorities-researcher-20251016.md`
    - Identified nuclear war as dominant killer (3,961M deaths, 92.6% of total)
    - Proposed 3 priorities: Nuclear circuit breakers, anomaly detection, info integrity
    - Claimed 26-38h effort
  - **Skeptic Critique:** `/reviews/strategic-priorities-skeptic-20251016.md`
    - Validated nuclear war priority BUT identified model bugs FIRST
    - Found 100% inconclusive outcomes, 76-83 orphaned AIs, compute paradox
    - Corrected effort to 65-106h, identified overconfident detection rates
  - **Synthesis:** Both were right
    - Researcher: WHAT to fix (nuclear war kills 92.6%)
    - Skeptic: WHEN to fix (after fixing model bugs)
  - **Outcome:** Created TIER 0-2 with phased approach, validation gates, pivot options
  - **New Plans:** `/plans/tier0-critical-bug-fixes.md` (10-18h)
  - **Roadmap Impact:** +69-115h immediate priorities, sequenced before AI skills work

- ✅ **Priority 2 Complete (6/6)** - All P2 tasks finished, plans archived to `/plans/completed/`
  - P2.3: Heterogeneous Population Segments (8-10h)
  - P2.4: Simulation Features for Validation (3h) - Event triggers, bankruptcy fixes, recovery tracking
  - P2.5: Empirical Validation Framework (4h) - Test suite ready for historical validation
  - P2.6: Memetic Evolution & Polarization Dynamics (10.5h) - Belief systems, meme lifecycle, AI amplification
- ✅ **Black Mirror Phase 3 Decomposition** - Research-critique dialectic (1 approved, 1 deferred, 1 rejected)
  - Digital Consciousness Governance: CONDITIONAL GO (12-16h, now active plan)
  - Performative Behavior: DEFERRED 18-24 months (active deferral tracking)
  - Autonomous Weapons: REJECTED (archived to `/plans/completed/rejected/`)
- ✅ **Monte Carlo Bug Fixes (15/15)** - All critical, significant, and minor bugs fixed
- ✅ **Crisis Accumulation Fixes (2/3)** - Biodiversity bug fixed, meaning crisis + AI misalignment slowed 3-5x
- ⚠️ TIER 4.6: Human Enhancement - Implemented but needs reconciliation with existing bionicSkills.ts (BCI/merger = TRL 0-2, should remove)

**New from Visionary Ideas Review (Oct 16, 2025):**
- Added P2.6: Memetic Evolution & Polarization Dynamics (12-15h) - High-value, TRL 6-7
- Added P3.6: Ensemble AI Alignment Verification (8-10h) - Research prototype
- Rejected: Quantum capability prediction, liquid software, retroactive temporal modeling (see `/plans/completed/visionary-ideas-reviewed.md`)

**New from Black Mirror Integration Review (Oct 16, 2025):**
- ✅ **3 implementation phases created** - Dialectic review process (researcher + skeptic)
- Phase 1 (HIGH): 5 strongly validated systems (9-12 weeks) - Attention Economy, Surveillance, Notification Addiction
- Phase 2 (MEDIUM): 4 conditionally approved systems (12-16 weeks) - Social Credit, Parasocial AI, Memetic Contagion
- Phase 3 (DECOMPOSED): 1 approved (CONDITIONAL GO), 1 deferred (18-24 months), 1 rejected
- Approval: ~40% strongly validated, ~25% conditional, ~35% rejected

**New from AI-Assisted Skills Review (Oct 16, 2025):**
- ✅ **Dialectic review completed** - Skeptic critique + researcher rebuttal
- Verdict: Core system VALIDATED (TRL 8-9, 22 peer-reviewed studies)
- Skeptic correct: BCI/merger is science fiction (TRL 0-2, should be cut)
- Researcher correct: Digital tools (Copilot, ChatGPT) are real and validated
- Critical gaps identified: Phase transition, skill retention, wage decoupling (78h plan created)
- Impact: Model currently too optimistic - missing displacement, deskilling, capital capture
- Documentation: 3 detailed phase plans + comprehensive research report

**Publication Readiness:** ~75-80% complete (Monte Carlo bugs fixed, but model bugs identified)
**Next Milestone:** Complete TIER 0 (critical bug fixes) → validate → TIER 1 Phase 1 (nuclear prevention)
**Critical Path:** TIER 0 → TIER 1 → TIER 2 → AI skills phases (phased approach with validation gates)

---

**Last Updated:** October 16, 2025 (Strategic Priorities Debate integrated)
**Related Docs:** `/docs/wiki/`, `/devlogs/`, `IMPLEMENTATION_PLAN_20251015.md`, `utopian-dynamics-spec.md`
