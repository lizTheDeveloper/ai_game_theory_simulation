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
**Priority 2 (P2):** 4 medium improvements - environmental calibration, breakthroughs, org diversification, heterogeneous populations (✅ 4/5 complete)

**All details:** See `/plans/completed/` directory

---

---

### Critical Fixes (~8-12 hours)

**Priority 2 Remaining:**

- [x] **P2.3: Heterogeneous Population Segments** ✅ (8-10h) **COMPLETE**
  5 social segments with differential mortality, political power, and crisis vulnerability
  → See: `plans/p2-3-heterogeneous-population.md`
  → Tests: `tests/p2-3-heterogeneous-population.test.ts`

- [ ] **P2.4: Simulation Features for Validation** (2-4h) **BLOCKS P2.5**
  **Status:** Required to unblock P2.5 empirical validation framework
  → Plan: `plans/simulation-features-for-validation.md`
  → **Feature 1: Event Trigger System** (1-1.5h)
    - Add optional event triggers (pandemic, economic crisis, environmental shock)
    - Enable historical scenario testing (COVID-19, 2008 crisis, Black Death)
    - Files: New phase `processEventTriggers.ts`, update `initialization.ts`
  → **Feature 2: Fix Organizational Bankruptcy** (0.5-1h)
    - Calibrate bankruptcy rates to historical data (currently 100%, should be 8-30%)
    - Add government bailout mechanics, recovery pathways
    - Validate: Normal ~8-10%, 2008 ~15-20%, COVID ~25-30%
  → **Feature 3: Recovery Tracking** (0.5-1h)
    - Add economic stage tracking (expansion, peak, contraction, trough, recovery)
    - Calculate time-to-recovery metrics for validation tests
    - Files: New phase `updateEconomicStage.ts`, new utils `recoveryCalculations.ts`
  → **Research:** TRL 9 (NBER business cycle dating, historical crisis data)
  → **Impact:** Enables empirical validation against COVID-19, 2008 crisis, Black Death

- [x] **P2.5: Empirical Validation** ✅ FRAMEWORK COMPLETE (Oct 16, 2025) ⏸️ BLOCKED
  **Status:** Framework complete (4h), awaiting simulation features (2-4h remaining)
  → Framework: `tests/validation/` (historicalStates.ts + 20 tests)
  → Documentation: `tests/validation/README.md`
  → Blocking Issues:
    1. Need event trigger system (pandemic, economic crisis)
    2. Fix organizational bankruptcy (currently 100%, should be 10-30%)
    3. Add recovery tracking (economic stage history, time-to-recovery)
  → Plan: `plans/completed/p2-5-empirical-validation-FRAMEWORK-COMPLETE.md`

---

### Medium Priority Features (~19-22 hours)

**New Outcome Spaces:**

- [ ] **TIER 4.6: Human Enhancement & Merger Pathways** ⚠️ NEEDS RECONCEPTUALIZATION (7h)
  ~~BCI adoption, human-AI hybrids, cognitive apartheid outcomes~~ ← Rejected by research skeptic (TRL 0-2, science fiction)
  → Existing `bionicSkills.ts` already models realistic AI-assisted cognition (TRL 8-9)
  → See: `plans/tier4-6-human-enhancement.md` (needs rewrite)
  → Research critique: `reviews/` (skeptic identified BCI/merger as ungrounded)

**Research-Backed Enhancements:**

- [ ] **P2.6: Memetic Evolution & Polarization Dynamics** (12-15h)
  Agent-based belief systems, meme transmission, societal fragmentation
  → See: `plans/p2-6-memetic-polarization-dynamics.md`
  → Research: TRL 6-7, validated against 2024-2025 peer-reviewed studies
  → Impact: Critical for modeling societal response to AI development

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

**Phase 3: Long-Term Research (6-12+ months) - LOW PRIORITY**

- [ ] **Black Mirror Phase 3: Long-Term Research** (6-12+ months, research-dependent)
  3 systems requiring substantial external research
  → See: `plans/black-mirror-phase3-longterm.md`
  → Systems: Digital Consciousness Governance Preparedness, Performative Behavior Modeling, Autonomous Weapon Degradation
  → Prerequisites: Published peer-reviewed research, operational definitions, expert review
  → Status: Deferred pending research maturity

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

**Completed:** P0 (7/7), P1 (5/5), P2 (3/6), Monte Carlo Bug Fixes (15/15)
**Active:** 2 critical fixes (P2.4, P2.5) + 2 medium features + 6 AI skills phases + 14 low-priority enhancements + 3 Black Mirror phases
**Total Remaining Effort:** ~220-252 hours (includes 2-4h validation features + 78h AI skills + 37-49 weeks Black Mirror phased integration)

**Recent Completions (Oct 16, 2025):**
- ✅ P2.3: Heterogeneous Population Segments - 5 social segments with differential crisis vulnerability
- ✅ **Monte Carlo Bug Fixes (15/15)** - All critical, significant, and minor bugs fixed
  - Critical: Fixed crashes, undefined variables, data corruption (7 bugs)
  - Significant: Fixed statistical accuracy, division errors, scenario splits (5 bugs)
  - Minor: Optimized performance, documented memory management (3 bugs)
  - Files: `monteCarloSimulation.ts`, `engine.ts`, verified `population.ts`
  - Report archived: `plans/completed/monte_carlo_reporting_bugs_FIXED_20251016.md`

**New from Visionary Ideas Review (Oct 16, 2025):**
- Added P2.6: Memetic Evolution & Polarization Dynamics (12-15h) - High-value, TRL 6-7
- Added P3.6: Ensemble AI Alignment Verification (8-10h) - Research prototype
- Rejected: Quantum capability prediction, liquid software, retroactive temporal modeling (see `/plans/completed/visionary-ideas-reviewed.md`)

**New from Black Mirror Integration Review (Oct 16, 2025):**
- ✅ **3 implementation phases created** - Dialectic review process (researcher + skeptic)
- Phase 1 (HIGH): 5 strongly validated systems (9-12 weeks) - Attention Economy, Surveillance, Notification Addiction
- Phase 2 (MEDIUM): 4 conditionally approved systems (12-16 weeks) - Social Credit, Parasocial AI, Memetic Contagion
- Phase 3 (LOW): 3 research-dependent systems (6-12+ months) - Governance preparedness, Performative behavior
- Approval: ~40% strongly validated, ~25% conditional, ~35% rejected

**New from AI-Assisted Skills Review (Oct 16, 2025):**
- ✅ **Dialectic review completed** - Skeptic critique + researcher rebuttal
- Verdict: Core system VALIDATED (TRL 8-9, 22 peer-reviewed studies)
- Skeptic correct: BCI/merger is science fiction (TRL 0-2, should be cut)
- Researcher correct: Digital tools (Copilot, ChatGPT) are real and validated
- Critical gaps identified: Phase transition, skill retention, wage decoupling (78h plan created)
- Impact: Model currently too optimistic - missing displacement, deskilling, capital capture
- Documentation: 3 detailed phase plans + comprehensive research report

**Publication Readiness:** ~80-85% complete (Monte Carlo bugs fixed)
**Next Milestone:** Complete P2.4 (Simulation Features) to unblock P2.5 (Empirical Validation), then AI skills phases

---

**Last Updated:** October 16, 2025
**Related Docs:** `/docs/wiki/`, `/devlogs/`, `IMPLEMENTATION_PLAN_20251015.md`, `utopian-dynamics-spec.md`
