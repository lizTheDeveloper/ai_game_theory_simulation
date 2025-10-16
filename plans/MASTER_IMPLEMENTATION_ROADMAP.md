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

## 🔥 Active Work Items

### 🚨 Urgent Bug Fixes - Monte Carlo Reporting (~16-20 hours)

**Architecture Review Found 15 Bugs (Oct 16, 2025):**

**Critical Bugs (4-6h):**

- [ ] **BUG-1: Undefined property access** - `deathsByCategory.cascade` missing from type definition
  → File: `monteCarloSimulation.ts`, causes crashes

- [ ] **BUG-2: Undefined variable** - `runIndex` should be `i` in loop
  → File: `monteCarloSimulation.ts`, runtime error

- [ ] **BUG-3: Missing EventAggregator initialization** - Silent data loss possible
  → File: `monteCarloSimulation.ts`, data integrity

- [ ] **BUG-4: Duplicate imports** - Compilation errors
  → File: `monteCarloSimulation.ts`

- [ ] **BUG-5: Negative death counts** - Arithmetic error when population grows
  → File: `diagnostics.ts`, invalid statistics

- [ ] **BUG-6: Race condition** - Reading files before fully written
  → File: `monteCarloSimulation.ts`, data corruption

- [ ] **BUG-7: Double counting** - Organization bankruptcy tracked twice
  → File: `diagnostics.ts`, inflated statistics

**Significant Bugs (6-8h):**

- [ ] **BUG-8: Misleading variable names** - Confusion between rates and totals
- [ ] **BUG-9: Division protection too permissive** - Allows NaN/Infinity
- [ ] **BUG-10: Natural death rate underestimation** - Missing baseline mortality
- [ ] **BUG-11: Missing cascade death data** - Always reports 0 or NaN
- [ ] **BUG-12: Uneven scenario splits** - Odd run counts misallocated

**Minor Issues (6-8h):**

- [ ] **BUG-13: Synchronous file writes** - Performance bottleneck
- [ ] **BUG-14: Unbounded memory growth** - History array grows indefinitely
- [ ] **BUG-15: Inefficient outcome classification** - Multiple iterations over same data

→ **Full Report:** `reviews/monte_carlo_reporting_bugs_20251016.md`
→ **Impact:** Cascade deaths missing, statistics unreliable, crashes on edge cases
→ **Priority:** Fix critical bugs before P2.5 empirical validation

---

### Critical Fixes (~6-8 hours)

**Priority 2 Remaining:**

- [x] **P2.3: Heterogeneous Population Segments** ✅ (8-10h) **COMPLETE**
  5 social segments with differential mortality, political power, and crisis vulnerability
  → See: `plans/p2-3-heterogeneous-population.md`
  → Tests: `tests/p2-3-heterogeneous-population.test.ts`

- [ ] **P2.5: Empirical Validation** (6-8h)
  Validate against COVID-19, 2008 crisis, Black Death
  → See: `plans/p2-5-empirical-validation.md`

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
**Full Research:** `reviews/bionic-skills-hopeful-research-foundation-20251016.md`

**What's Correct (Keep):**
- ✅ AI amplification via digital tools (Copilot, ChatGPT) - NOT BCIs
- ✅ Differential benefits by skill level (novices gain MORE)
- ✅ Digital divide & access inequality
- ✅ Task-specific effects

**Critical Gaps (Must Add):**

- [ ] **Phase 1: Terminology & Documentation** (Week 1, 8h)
  Remove BCI/science fiction framing, add research citations, TRL assessments
  → See: `plans/bionic-skills-research-grounding.md` (Section: Phase 1)

- [ ] **Phase 2: Phase Transition Mechanics** (Weeks 2-4, 12h)
  Model complementarity → substitution (5-10 years), employment displacement tracking
  → See: `plans/bionic-skills-phase-transition.md`
  → Research: Acemoglu & Restrepo (2022), historical automation patterns (ATMs, Excel)
  → Impact: CRITICAL - model currently assumes permanent amplification, ignores displacement

- [ ] **Phase 3: Performance vs Competence Tracking** (Weeks 5-6, 8h)
  Separate AI-assisted performance from true skill retention, scaffolding effects
  → See: `plans/bionic-skills-competence-tracking.md`
  → Research: Cognitive Research (2024) "illusion of understanding", MDPI (2023) deskilling
  → Impact: CRITICAL - model doesn't capture skill erosion from over-reliance

- [ ] **Phase 4: Economic Distribution & Wage Decoupling** (Weeks 7-8, 6h)
  Model productivity-wage gap, labor vs capital capture, policy interventions
  → See: `plans/bionic-skills-economic-distribution.md`
  → Research: Brookings (2024), EPI (productivity +77%, wages +12% since 1973)
  → Impact: CRITICAL - model overly optimistic about worker benefits

- [ ] **Phase 5: Validation & Testing** (Month 2, 16h)
  Historical comparisons (ATMs, Excel), sensitivity analysis, literature validation
  → See: `plans/bionic-skills-research-grounding.md` (Section: Phase 5)

- [ ] **Phase 6: Policy Testing** (Month 3, 16h)
  Implement policy levers (retraining, UBI, worker ownership), scenario comparisons
  → See: `plans/bionic-skills-research-grounding.md` (Section: Phase 6)

**Total:** 78 hours over 3 months
**Priority:** Medium (after bugs and empirical validation, before enrichment)
**Research TRL:** 8-9 (extensively validated, deployed at scale)

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

**Completed:** P0 (7/7), P1 (5/5), P2 (4/5)
**Active:** 15 urgent bug fixes + 1 critical fix + 2 medium features + 6 AI skills phases + 14 low-priority enhancements + 3 Black Mirror phases
**Total Remaining Effort:** ~234-268 hours (includes 78h AI skills + 37-49 weeks Black Mirror phased integration)

**Recent Completions (Oct 16, 2025):**
- ✅ P2.3: Heterogeneous Population Segments - 5 social segments with differential crisis vulnerability

**New from Architecture Review (Oct 16, 2025):**
- 🚨 **15 Monte Carlo reporting bugs identified** (16-20h total, 4-6h critical)
- Impact: Missing cascade death data, statistics unreliable, crashes on edge cases
- Priority: Fix critical bugs before empirical validation (P2.5)

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

**Publication Readiness:** ~70-80% complete (reduced due to bug discovery)
**Next Milestone:** Fix critical Monte Carlo bugs, then complete P2.5 (Empirical Validation)

---

**Last Updated:** October 16, 2025
**Related Docs:** `/docs/wiki/`, `/devlogs/`, `IMPLEMENTATION_PLAN_20251015.md`, `utopian-dynamics-spec.md`
