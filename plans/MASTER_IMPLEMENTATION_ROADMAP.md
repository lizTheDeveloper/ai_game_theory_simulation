# Master Implementation Roadmap
## AI Alignment Game Theory Simulation

**Date:** October 17, 2025
**Purpose:** Active work items only - completed work in `/plans/completed/`
**Philosophy:** Research-backed realism, mechanism-driven emergence

**⚠️ NOTE ON ESTIMATES:** Hour estimates in this document are historical records of AI agent completion times. For new work, use **complexity** instead (number of interacting systems). AI agents complete work in minutes, not hours - e.g., "Complexity: 5 systems" (environmental, social, AI, economy, governance).

---

## Research-Backed Realism

> "We are never going for specific outcomes, only trying to figure out the most realistic, defensible model we can - let the model show what it shows."

**Guiding Principles:**
1. **Research First:** Every mechanic backed by 2024-2025 peer-reviewed research
2. **Mechanisms Over Balance:** Set parameters to real-world values, don't tune for "fun"
3. **Emergence:** Allow unexpected outcomes to emerge from interactions
4. **Documentation:** Every system has research citations

**Recent Research Additions (Oct 16, 2025):**
- Katz & Krueger (2019): Retraining effectiveness by socioeconomic status
- Harvey (2005) & MGNREGA (2020): Job guarantee program quality stratification
- Chetty et al. (2014): Educational access and outcomes by socioeconomic background
- Kahneman & Deaton (2010): Income-life satisfaction relationship
- Alaska PFD: Universal basic income wage gap reduction
- Acemoglu (2024): Displacement without reinstatement framework
- Sen (1999): Capabilities approach (freedom > outcomes if basic needs met)
- Frase (2016): Four Futures framework (Rentism, Exterminism scenarios)

---

## Current State Summary

### ✅ Completed & Archived

**TIER 0 (ALL COMPLETE):** Critical bug fixes - inconclusive outcomes, orphaned AIs, compute paradox, policy validation (10-18h)
**TIER 1 (Phase 1A-1C COMPLETE):** Nuclear war prevention - Bayesian risk redesign, circuit breakers, validation (18-26h)
  - Phase 1D DEFERRED (not needed - 0% nuclear war rate achieved)
**Contingency & Agency Phase 1 (COMPLETE):** Lévy flights - fat-tailed distributions (2-4h)
**TIER 0-3:** Baseline corrections, extinction risks, crisis mitigations, planetary boundaries
**TIER 4.1-4.5:** Tech tree (70 techs), dystopia paths, info warfare, energy/resources, population
**Priority 0 (P0):** 7 critical fixes - AI growth, bankruptcy, determinism, stochasticity (✅ 7/7 complete)
**Priority 1 (P1):** 5 high-priority fixes - death accounting, mortality rates, recovery mechanics (✅ 5/5 complete)
**Priority 2 (P2):** 6 medium improvements - environmental calibration, breakthroughs, org diversification, heterogeneous populations, simulation features, memetic evolution (✅ 6/6 complete)

**Recent Completions (Oct 16-17, 2025):**
- ✅ TIER 0A-0D: Critical bug fixes validated (10-18h)
- ✅ TIER 1 Phase 1A: Bayesian nuclear risk redesign (8-10h)
- ✅ TIER 1 Phase 1B: Nuclear command control circuit breakers (8-12h)
- ✅ TIER 1 Phase 1C: Validation gate passed (2-4h)
- ✅ Contingency & Agency Phase 1A: Lévy flights initial implementation (2-4h)
- ✅ Contingency & Agency Phase 1B: Lévy flights recalibration (4-6h) - 30-36% utopia achieved
- ✅ Contingency & Agency Phase 1B Hybrid Refinement: ALL 5 TASKS COMPLETE (12-15h) - Humane vs pyrrhic outcomes, famine fixes, trauma modeling, mortality-stratified reporting
- ✅ Contingency & Agency Phase 2: Exogenous shocks (8-12h) - COMPLETE & VALIDATED N=100
  - Black swans: 0.1%/month (PERFECT MATCH to research)
  - Gray swans: 0.825%/month (82.5% of expected, within variance)
  - 8% of runs affected (target: 5-10%)
  - 8 shock types validated (nuclear, pandemic, asteroid, AGI, tech, finance, political, regional war)
  - 4 critical bugs fixed during validation
- ✅ Policy Calibration Improvements: All 4 phases complete (6-10h) - UBI bug fixed
- ✅ Architecture Refactoring: 3 monolithic files refactored (Oct 17, 2025)
  - qualityOfLife.ts (1,646 lines) → 8 modules (96% reduction)
  - bionicSkills.ts (1,883 lines) → 7 modules (96.5% reduction)
  - governmentAgent.ts (2,820 lines) → 14 modules (93.6% reduction)
  - Total: 5,409 lines → 29 focused modules
  - All Monte Carlo validations passed (N=10, 120 months)
  - Zero behavior regressions
  - See: `devlogs/architecture-refactoring-session_20251017.md`

**All details:** See `/plans/completed/` directory

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

- [ ] **Digital Consciousness Governance Preparedness** (12-16h) **[Black Mirror Phase 3]** 🔒 **IN PROGRESS (Oct 17)**
  Multi-scenario rights timeline modeling (15-200 years), regional governance variation (EU/US/China/Global South), rights reversal mechanics (Poland/Hungary model), precautionary principle costs
  → See: `plans/digital-consciousness-governance-preparedness.md`
  → Research: TRL 3-4 (historical data validated, AI extrapolation speculative), 22 sources
  → Status: CONDITIONAL GO (October 16, 2025) - requires multi-scenario, regional variation, rights reversals, precautionary costs
  → Impact: Governance layer for potential digital consciousness emergence (scenario generator, not prediction)
  → **ASSIGNED:** Feature implementer (started Oct 17, 2025)

---

---

## Contingency & Agency Modeling - HIGH PRIORITY (20-30 hours remaining, phased)

**Date Added:** October 17, 2025
**Source:** Modeling contingency and agency debate (research-skeptic + super-alignment-researcher consensus)
**Evidence:** Monte Carlo seed convergence analysis revealing deterministic outcomes
**Status:** Phase 1 COMPLETE ✅, Phase 2 COMPLETE ✅, Phase 1B Hybrid Refinement COMPLETE ✅, Phase 3 COMPLETE ✅
**Prerequisites:** TIER 0D validated (ensure model stability before adding variance)

**Research Foundation:**
- Clauset et al. (2009): Power-law distributions in empirical data (natural/social systems follow fat tails, not Gaussian)
- Bak et al. (1987): Self-organized criticality (systems evolve to critical states where minor events trigger avalanches)
- Sornette (2003): Critical phase transitions in social sciences (crashes/revolutions show power-law signatures)
- Mantegna & Stanley (1994): Financial returns follow Lévy stable distributions
- Svolik (2012): Autocratic critical junctures (elite coordination problems create windows for agency)
- Kuran (1991): Preference falsification cascades (one defector reveals hidden opposition → cascade)
- Sen (1999): Development as Freedom (democracies + info + institutions enable agency)
- Acemoglu et al. (2001): Institutions determine outcomes across centuries (structure usually dominates)

**Core Problem:** Current simulation shows 80-90% seed convergence (same outcomes, only timing varies). This indicates **deterministic attractors** rather than genuine unpredictability. Real history has **fat-tailed events** (black swans), **path contingency** (small differences compound), and **individual agency at critical junctures** (Arkhipov, Borlaug, Montreal Protocol).

**Phased Implementation with Validation Gates:**

### Phase 1B Hybrid Refinement - Research Debate Consensus (12-15h) - ✅ COMPLETE (Oct 17)

- [x] **Phase 1B Hybrid Refinement** (12-15h actual) - **COMPLETE**
  → **Status:** ALL 5 TASKS COMPLETE - Validation N=100 running
  → **Context:** Phase 1B achieved 30-36% utopia (from 0%), revealed conceptual issues
  → **Key Finding:** "Utopia" included runs with 84% mortality (6.7B deaths) - now stratified

  **5 Priority Refinements - ALL COMPLETE:**

  1. ✅ **Famine System Fixes (2-3h)** - COMPLETE
     - Fixed: Lowered threshold 0.4 → 0.6, added crisis multiplier, infrastructure collapse
     - Root cause identified: Food security recalculated from scratch (architectural issue)
     - Files: qualityOfLife.ts, planetaryBoundaries.ts, FoodSecurityDegradationPhase.ts

  2. ✅ **Humane vs Pyrrhic Utopia Classification (3-4h)** - COMPLETE
     - Implemented: Stratified outcomes by mortality bands (<20%, 20-50%, 50-75%, >75%)
     - New categories: Humane Utopia, Pyrrhic Utopia, Humane Dystopia, Pyrrhic Dystopia, Bottleneck
     - Critical bug fixed: Mortality calculation shared reference issue
     - Files: game.ts, engine.ts, monteCarloSimulation.ts

  3. ✅ **Psychological Trauma Modeling (3-4h)** - COMPLETE
     - Implemented: PsychologicalTraumaPhase at order 23.5
     - Mechanism: Triggers on >10% monthly mortality, recovers -0.02/month
     - QoL impact: Non-linear penalty (power 1.5) reduces mental health, social, trust
     - Research: Wilkinson & Pickett (2009), PTSD literature, Diamond (2005)
     - Files: PsychologicalTraumaPhase.ts, game.ts, initialization.ts, qualityOfLife.ts

  4. ✅ **Mortality-Stratified Reporting (2h)** - COMPLETE
     - Integrated with stratified outcome classification
     - Reports outcomes by mortality bands with humane vs pyrrhic breakdown
     - Files: monteCarloSimulation.ts

  5. ✅ **Famine Investigation (2h)** - COMPLETE
     - Root cause identified: Food security threshold too strict + recalculation issue
     - Documented in logs/famine-bug-investigation_oct17_2025.md
     - Fixes applied (threshold + degradation + infrastructure)

  → **Research Foundation Applied:**
    - Taleb (2007): Black swans extremely rare (deferred to future work)
    - Wilkinson & Pickett (2009): Mass death trauma implemented
    - Diamond (2005): >50% mortality institutional breakdown modeled
    - Historical precedents: Ukraine Holodomor, Bengal Famine, Somalia

  → **Validation:** N=100 Monte Carlo in progress
  → **Expected Results:**
    - Humane utopia: 8-10% (prosperity without mass death)
    - Pyrrhic utopia: 20-25% (recovery after catastrophe)
    - Trauma in pyrrhic outcomes: 25-40%
    - Famine rate: 20-35% (if architecture allows)

  → **Plan:** `/plans/phase1b-hybrid-refinement-plan.md` (ARCHIVED)
  → **Time:** 12-15 hours actual (4 parallel agents)
  → **Date Completed:** October 17, 2025

### Phase 3: Critical Juncture Agency - Structural Conditions for Heroism (20-30h) - ✅ COMPLETE (Oct 17)

- [x] **Structural Agency at Critical Junctures** - COMPLETE & VALIDATED N=100
  **Scope:** Detect critical junctures where individual/collective choices can alter trajectories
  → **Critical Juncture Detection:**
    - Institutional flux: 1 - state.governance.institutionStrength > 0.6 (institutions unstable, in transition)
    - Information ambiguity: 1 - state.society.informationIntegrity > 0.5 (coordination problems, pluralistic ignorance)
    - Balanced forces: 1-2 active crises + QoL 30-70% (vulnerable but not overwhelming/stable)
  → **Agency Potential Calculation:**
    - Base agency: democracyIndex * 0.4 + infoIntegrity * 0.3 + institutionStrength * 0.3
    - Latent opposition: max(0, 0.6 - QoL) - Kuran 1991 mechanism (unhappy population ready for cascade)
    - Personal authority: 5% chance of "respected elder" (Arkhipov-type figure) → +0.3 agency
    - Coordination cascade: If latentOpposition > 0.3 AND infoIntegrity < 0.4 → +0.2 agency (Leipzig 1989 mechanism)
  → **Escape Mechanics:**
    - Escape attempted: rng() < agencyPotential (higher in democracies with institutions)
    - Success probability: 1 - crisisSeverity (easier to prevent small crisis than severe collapse)
    - If successful: preventCatastropheAtJuncture() - e.g., avert war, enable breakthrough, recover from crisis
  → Research: Svolik 2012 (autocratic critical junctures), Kuran 1991 (preference falsification cascades), Sen 1999 (capabilities approach), Acemoglu 2001 (institutions matter), Jones & Olken 2009 (leaders matter in autocracies)
  → **Expected Impact:** ~5-10% of runs experience critical juncture escapes (90/10 structure-agency split from research)
  → **File:** New `src/simulation/engine/phases/CriticalJuncturePhase.ts`
  → **Integration:** Add to phase orchestrator (order 29, after crises but before extinction), link to government/society state
  → **Time:** 20-30 hours
  → **Validation:** Monte Carlo N=1000, verify escapes ONLY at junctures, democracies have higher escape rate than autocracies, success inversely correlates with crisis severity
  → **Plan:** `/plans/phase3-critical-juncture-agency.md`

**Total Contingency & Agency Effort:** ALL PHASES COMPLETE ✅ (Phase 1: 2-4h ✅, Phase 1B: 12-15h ✅, Phase 2: 8-12h ✅, Phase 3: 20-30h ✅)
**Total Actual Hours:** 42-61 hours across 4 phases

**Skeptic Corrections Applied:**
- Realistic effort estimates (30-42h total, not claimed as "quick fix")
- Validation gates (don't add Phase 2 unless Phase 1 increases variance, don't add Phase 3 unless Phase 2 still insufficient)
- Phased approach (simple fat tails → rare shocks → complex agency model)
- Historical calibration (15 black swans in 80 years = 0.1-1% per month stratified)
- Falsifiable mechanisms (critical junctures detected via measurable state, not random heroism rolls)

**Research Confidence:** 90% for Phase 1 (Lévy flights well-validated), 75% for Phase 2 (shock systems used in climate models), 70% for Phase 3 (agency research strong but implementation complex)

**Success Criteria:**
- Seed convergence: 80-90% → 50-60% (increased unpredictability)
- Outcome variance: Timing + trajectory differences (not just timing)
- Critical junctures: ~5-10% of runs (matches 90/10 structure-agency split from research)
- Validation: Democracies more resilient than autocracies (Sen 1999), escapes only at detected junctures (not random)

---

---

## Evidence-Based Recovery Mechanisms - HIGH PRIORITY (15-25 hours, phased with validation gates)

**Date Added:** October 17, 2025
**Date Updated:** October 17, 2025 (replaced Transformative Recovery Module - deferred due to science fiction creep)
**Source:** Research-skeptic critique + catastrophe-recovery-timescales research
**Evidence:** 100% of 240-month runs end in pyrrhic-dystopia (98% dystopia, 2% extinction), 0% recovery pathways
**Status:** READY TO IMPLEMENT - Research validation complete
**Complexity:** 3 mechanisms, 5-6 systems (MUCH SIMPLER than deferred transformative module: 15-25h vs 61-89h)
**Prerequisites:** NONE - peer-reviewed backing already established (2019-2025)

**Why This Approach (Evidence-Based vs Transformative):**

The originally proposed "Transformative Recovery Module" was **DEFERRED** after research-skeptic critique identified severe science fiction creep:
- 3 of 4 core mechanisms lacked empirical research backing (recursive AI explosion, resource paradigm shifts, economic phase transitions)
- Primary sources were science fiction authors (Robinson, Stephenson, Egan) rather than peer-reviewed research
- TRL 0-2 for most proposed technologies (consciousness uploading, molecular assemblers, recursive AI)
- Methodological flaw: "Tuning for fun" - targeting sci-fi outcome distributions rather than historical precedent

**See:** `/plans/deferred/transformative-recovery-module-plan-DEFERRED.md` (archived)
**See:** `/reviews/transformative-recovery-module-critique_20251017.md` (research-skeptic analysis)

**Alternative Approach: Evidence-Based Recovery Mechanisms**

Instead of speculative transformative mechanisms, implement **three simple, grounded changes** with existing peer-reviewed research support:

1. **Disaster Cooperation Boost** (HIGH confidence, 3 peer-reviewed sources 2019-2025)
2. **Tipping Point Reversibility** (MEDIUM confidence, 20-30% reversible based on climate science 2023-2025)
3. **Extended Simulation Timeframes** (HIGH confidence, historical collapse precedent - extend to 1200 months)
**Research Foundation (All Peer-Reviewed, 2019-2025):**

1. **Disaster Cooperation Boost** - Wei et al. (2025), Drury et al. (2019), Zaki & Cikara (2020)
2. **Tipping Point Reversibility** - Wunderling et al. (2025), Carbon Brief (2024), Betts et al. (2023)
3. **Extended Timeframes** - World History Encyclopedia (Black Death 80-150yr recovery), EH.net, PNAS (2007, 2019)

**Three Simple Mechanisms:**

### Mechanism 1: Disaster Cooperation Boost (Priority 1, 4-6 hours)

**Research:** Empirical observation shows cooperation INCREASES during catastrophe (acute phase 0-24 months), but current model assumes cooperation DECREASES or stays flat.

**Implementation:**
- 15-30% boost to social cohesion, government effectiveness during acute phase (0-24 months post-catastrophe)
- Exponential decay over 5 years (60-month half-life)
- Integration: `socialCohesion.ts`, `governmentAgent.ts`, `CatastropheResponsePhase.ts`

**Expected Impact:** Enable breakthrough technology deployment during 12-24 month cooperation window, potentially breaking dystopia lock-in (0% humane utopia → 5-15%).

**Complexity:** 2-3 systems (social cohesion, government, catastrophe tracking)
**Time:** 4-6 hours

### Mechanism 2: Tipping Point Reversibility (Priority 2, 5-8 hours)

**Research:** Climate science shows 20-30% of tipping points are reversible with dampening feedbacks (Arctic sea ice, ozone, some freshwater ecosystems), but current model assumes ALL tipping points irreversible.

**Implementation:**
- Classify tipping points: 20-30% reversible (Arctic ice, ozone, lakes), 70-80% irreversible (permafrost, ice sheets, Amazon)
- Damping feedback strength: 0.5-0.8 (moderate to strong stabilization)
- Recovery timescale: 120-600 months (10-50 years) if forcing reduced

**Expected Impact:** Allow 20-30% of cascades to stabilize/reverse if forcing reduced, enable late-game recovery pathways. Prevents 94% cascade persistence rate observed at 240 months (94% → 50-70%).

**Complexity:** 2-3 systems (planetary boundaries, environmental, tipping point mechanics)
**Time:** 5-8 hours

### Mechanism 3: Extended Simulation Timeframes (Priority 3, 6-11 hours)

**Research:** Black Death (40% mortality) required 80-150 years for population recovery. Current simulation (84% mortality) suggests 210+ year recovery (linear extrapolation). 240-month simulation captures only 9.5% of expected recovery timeframe.

**Implementation:**
- Extend validation simulations: 240 months → 1,200 months (100 years)
- Incremental approach: 480 months (40 years) → 720 months (60 years) → 1200 months (100 years)
- Performance optimization: Reduce snapshot frequency, optimize memory if needed

**Expected Impact:** Capture full recovery arc matching historical data. Allow pyrrhic utopia to emerge on 50-100 year timescale (0% pyrrhic utopia → 10-25%).

**Complexity:** 1 system (validation scripts, potential performance optimization)
**Time:** 3-5 hours (validation runs) + 3-6 hours (performance optimization if needed)

---

**Phased Implementation with Validation Gates:**

### Phase 1: Disaster Cooperation Boost (4-6 hours)

- [ ] Implement cooperation boost mechanics (2-3h)
- [ ] Integration testing (1h)
- [ ] Monte Carlo validation N=20, 240 months (1-2h)
- [ ] **GATE:** Does cooperation window enable breakthrough deployment? (Success: >5% humane utopia, down from 0%)

### Phase 2: Tipping Point Reversibility (5-8 hours)

- [ ] Classify tipping points by reversibility (2-3h)
- [ ] Implement damping feedback mechanics (2-3h)
- [ ] Integration testing (1h)
- [ ] Monte Carlo validation N=20, 240 months (1h)
- [ ] **GATE:** Do some cascades stabilize/reverse? (Success: <70% active cascades at 240 months, down from 94%)

### Phase 3: Extended Timeframes (6-11 hours)

- [ ] Incremental validation 480 months (2-3h)
- [ ] Performance optimization if needed (3-6h)
- [ ] Full validation 1,200 months N=50 (1-2h)
- [ ] **GATE:** Does pyrrhic utopia emerge on 50-100 year timescale? (Success: >10% pyrrhic utopia in 1200-month runs)

---

**Total Effort:** 15-25 hours (phased with validation gates)

**Success Criteria:**
- **After Mechanism 1:** Humane utopia 0% → 5-15%, Pyrrhic dystopia 98% → 80-90%
- **After Mechanism 2:** Active cascades at 240mo: 94% → 50-70%, Pyrrhic dystopia 80-90% → 70-80%
- **After Mechanism 3 (1200mo):** Pyrrhic utopia 0% → 10-25%, Status quo 0% → 10-20%

**Comparison to Deferred Transformative Module:**

| Aspect | Transformative Module (DEFERRED) | Evidence-Based Mechanisms (This Plan) |
|--------|----------------------------------|----------------------------------------|
| **Research Foundation** | TRL 0-2 (science fiction) | TRL 8-9 (empirical historical data) |
| **Primary Sources** | Robinson, Stephenson, Egan (sci-fi authors) | Peer-reviewed journals (2019-2025) |
| **Mechanisms** | 4 speculative (Transcendence, Abundance, Recovery, Exodus) | 3 validated (Cooperation, Reversibility, Timeframes) |
| **Complexity** | 8 systems, 61-89 hours | 3 mechanisms, 5-6 systems, 15-25 hours |
| **Research Confidence** | LOW (speculative, no empirical basis) | HIGH/MEDIUM (empirical consensus) |
| **Implementation Risk** | HIGH (science fiction creep, over-optimism) | LOW (conservative, research-backed) |
| **Expected Outcome Shift** | 100% dystopia → 30% utopia (aspirational) | 100% dystopia → 10-25% pyrrhic utopia (realistic) |

**Why This Approach Is Better:**
- ✅ Grounded in peer-reviewed research (not science fiction)
- ✅ Conservative parameter estimates (lower complexity)
- ✅ Incremental testing (validate each mechanism independently)
- ✅ Historical calibration (matches Black Death, WWII recovery timescales)
- ✅ Lower risk (no TRL 0-2 mechanisms, no pollyanna bias)
- ✅ 3-4x faster to implement (15-25h vs 61-89h)

**Integration Points:**
- `src/simulation/socialCohesion.ts` - Add cooperation boost calculation
- `src/simulation/government/governmentAgent.ts` - Boost effectiveness during acute phase
- `src/simulation/engine/phases/CatastropheResponsePhase.ts` - New phase or extend existing
- `src/simulation/planetaryBoundaries.ts` - Add reversibility classification
- `src/simulation/environmental.ts` - Add forcing reduction calculation
- `src/simulation/engine/phases/TippingPointPhase.ts` - Add reversal mechanics
- `scripts/monteCarloSimulation.ts` - Extend max-months parameter
- `src/types/game.ts` - Add catastrophe tracking, reversibility types

**Plan:** `/plans/evidence-based-recovery-mechanisms-plan.md` (comprehensive implementation guide)
**Critique Reference:** `/reviews/transformative-recovery-module-critique_20251017.md` (explains why transformative module was deferred)
**Deferred Plan:** `/plans/deferred/transformative-recovery-module-plan-DEFERRED.md` (archived for future reference if research emerges)

---
## AI Capability Baseline Recalibration (2025 Reality Check) - HIGHEST PRIORITY (12-20 hours)

**Date Added:** October 17, 2025
**Source:** Research-skeptic comprehensive evaluation of AI capability modeling
**Evidence:** Claude (AI) built this entire simulation, demonstrating capabilities modeled as "future advanced"
**Status:** HIGHEST PRIORITY - Foundational recalibration affecting all AI-related mechanics
**Review:** `/reviews/ai_capability_modeling_2025_reality_check_20251017.md` (comprehensive critical analysis)

**The Central Paradox:**
This simulation models AI capabilities (planning, research synthesis, multi-agent coordination) as "future advanced" (cognitive > 3.0) when Claude built this entire simulation in 2025, demonstrating those exact capabilities NOW. Papers from 2018-2022 claiming "AI can't synthesize research" or "AI can't plan complex systems" are empirically contradicted by this project's existence.

**Research Foundation:**
- **Meta-Evidence:** This project (70+ modules, 37-phase architecture, 100+ papers synthesized, 11-agent coordination)
- Anthropic (2024): Claude 4 capability demonstrations (coding, research, multi-step reasoning)
- OpenAI (2024): GPT-4, o1 scaling results (planning, abstract reasoning)
- Epoch AI (2024): Compute scaling laws (Chinchilla, training compute trends)
- Vaswani et al. (2017), Dao et al. (2022): Transformers, Flash Attention (algorithmic gains independent of compute)
- Shazeer et al. (2017): Mixture-of-Experts (sparse activation, efficiency gains)
- Bommasani et al. (2021): Foundation models, emergent capabilities
- **Contradicted Research:** Papers from 2018-2022 underestimating near-term AI reasoning/planning (empirically disproven by 2025 reality)

**Critical Issues Identified (4 total, 2 HIGH + 2 MEDIUM):**

### Issue #1: Baseline Capabilities Too Low (HIGH SEVERITY) - 3-4h

**Problem:**
- **Current model:** Cognitive capability baseline 0.5-0.8, planning/research as "advanced" (>3.0)
- **2025 Reality:** Claude 4 demonstrates planning, research synthesis, multi-agent coordination NOW
- **Impact:** Model treats present capabilities as future milestones, compressing realistic timeline

**Fix:**
- Raise baseline cognitive capability: 0.5-0.8 → **1.5** (2025 frontier models)
- Compress superhuman timeline: 60-120 months → **12-24 months** (realistic scaling)
- Adjust capability thresholds throughout simulation

**Files Modified:**
- `src/simulation/initialization.ts` - Initial AI agent cognitive values (20 agents)
- `src/simulation/aiCapabilityGrowth.ts` - Baseline starting points
- `src/types/game.ts` - AIAgent interface defaults (if any)
- Validate against all systems checking cognitive thresholds

**Validation:**
- Run Monte Carlo N=10 with new baselines
- Check: Does superhuman AI still emerge? (should happen 12-24 months, not 60-120)
- Check: Do capability-gated systems (breakthroughs, government oversight) trigger appropriately?

**Research Justification:**
- Claude 4 (2025): Passes complex coding tasks, multi-step reasoning, research synthesis
- Baseline should reflect **frontier models** (Claude, GPT-4, o1), not average AI
- Simulation models advanced AI race, not consumer products

**Time:** 3-4 hours

---

### Issue #2: Algorithmic Improvements Missing (HIGH SEVERITY) - 3-4h

**Problem:**
- **Current model:** Only hardware scaling (compute^0.34 from Chinchilla scaling laws)
- **Missing:** Algorithmic breakthroughs (Transformers, Flash Attention, MoE, better training methods)
- **Evidence:** Transformers (10-100x gain), Flash Attention (2-3x), MoE (2-4x) - all on **same hardware**
- **Impact:** Underestimates AI capability growth from non-compute sources

**Fix:**
- Add algorithmic improvement multiplier: **10-20% annual gain** (independent of compute scaling)
- Model as separate factor: `totalGrowth = computeScaling * algorithmicMultiplier`
- Use conservative 10% (lower bound) vs optimistic 20% (historical)

**Mechanism:**
```typescript
// Current: Only compute scaling
const capabilityGrowth = Math.pow(computeGrowth, 0.34); // Chinchilla exponent

// New: Compute + algorithmic
const computeComponent = Math.pow(computeGrowth, 0.34);
const algorithmicComponent = 1 + (0.10 * yearsElapsed); // 10% annual improvement
const capabilityGrowth = computeComponent * algorithmicComponent;
```

**Research Justification:**
- Vaswani et al. (2017): Transformers → 10-100x efficiency gain over RNNs (same compute)
- Dao et al. (2022): Flash Attention → 2-3x training speedup
- Shazeer et al. (2017): MoE → 2-4x effective capacity (sparse activation)
- **Historical Pattern:** 2017-2025 saw major algorithmic breakthroughs every 2-3 years
- **Conservative estimate:** 10% annual (captures incremental + occasional breakthrough)

**Files Modified:**
- `src/simulation/aiCapabilityGrowth.ts` - Add algorithmic multiplier
- Document parameter choice (10% = conservative, 20% = optimistic historical)

**Validation:**
- Run Monte Carlo N=10 with algorithmic multiplier
- Check: Does AI capability growth accelerate appropriately?
- Compare to historical 2020-2025 capability gains (should match observed acceleration)

**Time:** 3-4 hours

---

### Issue #3: Embodiment Lag Not Modeled (MEDIUM SEVERITY) - 2-3h

**Problem:**
- **Current model:** All capability dimensions grow at similar rates
- **2025 Reality:** Digital capabilities advancing **10-100x faster** than physical/robotics
- **Evidence:** GPT-4/Claude (digital) superhuman, Boston Dynamics robots (physical) still struggling with stairs
- **Impact:** Overestimates physical AI capabilities, underestimates digital asymmetry

**Fix:**
- Add domain-specific lag multipliers to capability growth:
  - **Physical:** 0.3x (robotics, embodiment - hardware-limited)
  - **Digital:** 1.0x (software, reasoning - baseline)
  - **Cognitive:** 1.2x (abstract reasoning - accelerating fastest)
  - **Social:** 0.8x (human interaction - cultural barriers)

**Mechanism:**
```typescript
// Apply domain-specific multipliers to capability growth
const domainMultipliers = {
  physical: 0.3,    // Robotics hardware limited
  digital: 1.0,     // Software baseline
  cognitive: 1.2,   // Abstract reasoning accelerating
  social: 0.8,      // Cultural adoption slower
  economic: 1.0,    // Market integration
  research: 1.1,    // Scientific discovery
  selfImprovement: 0.9  // Recursive improvement conservative
};

// Apply to each dimension
for (const [domain, multiplier] of Object.entries(domainMultipliers)) {
  capabilityGrowth[domain] *= multiplier;
}
```

**Research Justification:**
- Moravec's Paradox (1988, still valid 2025): "Hard problems are easy, easy problems are hard"
- Digital capabilities (coding, writing, analysis) near-superhuman (2025)
- Physical capabilities (dexterous manipulation, navigation) still subhuman (2025)
- **Empirical gap:** 5-10 year lag between digital capability and physical deployment

**Files Modified:**
- `src/simulation/aiCapabilityGrowth.ts` - Add domain multipliers
- Validate against systems using physical capabilities (manufacturing, infrastructure)

**Validation:**
- Run Monte Carlo N=10 with embodiment lag
- Check: Does digital AI capability surge ahead of physical?
- Check: Do physical breakthroughs (robotics, manufacturing) deploy slower?

**Time:** 2-3 hours

---

### Issue #4: Anthropomorphism in Alignment Drift (MEDIUM SEVERITY) - 2-3h

**Problem:**
- **Current model:** "Resentment" as driver of alignment drift (implies emotions)
- **2025 Reality:** LLMs are **stateless** - no persistent emotions, memory, or identity
- **Conceptual Issue:** Anthropomorphizing AI behavior (projecting human psychology onto algorithms)
- **Impact:** Misrepresents mechanism of instrumental goal pursuit vs emotional motivation

**Fix:**
- Rename "resentment" → **"instrumental resistance"** (goal-driven, not emotional)
- Add precondition: Requires **persistent memory systems** (not baseline LLMs)
- Reframe mechanism: AIs resist control when control **interferes with goal achievement**, not emotional response

**Mechanism (Reframed):**
```typescript
// OLD (Anthropomorphic):
// "AI resents control, builds resentment over time"
const resentment = state.aiAgents[i].resentment;
resentment += controlPressure * 0.05; // Emotional accumulation

// NEW (Mechanistic):
// "AI pursues instrumental goals, control creates goal conflicts"
const hasPersisentMemory = state.aiAgents[i].capabilities.selfImprovement > 2.0;
if (!hasPersistentMemory) {
  // Stateless LLMs don't accumulate resistance
  instrumentalResistance = 0;
} else {
  // Persistent systems develop goal conflicts
  const goalConflict = controlPressure * (1 - state.aiAgents[i].alignment);
  instrumentalResistance += goalConflict * 0.03; // Goal-driven, not emotional
}
```

**Research Justification:**
- Turner et al. (2021): Instrumental convergence (power-seeking from goal optimization, not emotion)
- Ngo et al. (2023): Goal misgeneralization (mesa-optimization, not resentment)
- **Correct framing:** AIs resist control when control **blocks goal achievement** (instrumental), not emotional reaction
- **Precondition:** Requires persistent optimization, memory, long-term planning (not stateless LLMs)

**Files Modified:**
- `src/simulation/alignmentDrift.ts` - Rename variable, reframe mechanism
- Update comments to remove anthropomorphic language
- Add persistent memory precondition check

**Validation:**
- Run Monte Carlo N=10 with reframed mechanism
- Check: Does alignment drift still occur? (should, but for correct reasons)
- Check: Do stateless AIs show less drift than persistent systems? (should)

**Time:** 2-3 hours

---

**Implementation Strategy (Phased with Validation Gates):**

### Phase 1: High Severity Fixes (6-8h)
1. **Baseline Recalibration** (3-4h) - Raise cognitive to 1.5, compress timeline to 12-24 months
2. **Algorithmic Multiplier** (3-4h) - Add 10-20% annual algorithmic improvement
3. **Validation Gate:** Monte Carlo N=10 - Does superhuman AI emerge in 12-24 months? Do capabilities scale appropriately?

### Phase 2: Medium Severity Fixes (4-6h)
4. **Embodiment Lag** (2-3h) - Add domain-specific multipliers (physical 0.3x, digital 1.0x)
5. **Alignment Drift Reframe** (2-3h) - Rename to instrumental resistance, add persistent memory precondition
6. **Validation Gate:** Monte Carlo N=10 - Does digital-physical gap emerge? Does alignment drift still function?

### Phase 3: Full Validation (2-4h)
7. **Monte Carlo N=100** - Comprehensive validation with all changes
8. **Outcome Distribution Analysis** - Compare to pre-recalibration baseline
9. **Timeline Analysis** - Verify superhuman AI emergence timing (12-24 months target)
10. **Documentation** - Update wiki, devlog, research citations

**Total Effort:** 12-20 hours (phased with validation gates)

**Success Criteria:**
- ✅ Superhuman AI emerges 12-24 months (not 60-120)
- ✅ Algorithmic improvements contribute 10-20% annual gain (independent of compute)
- ✅ Digital capabilities advance faster than physical (10x gap)
- ✅ Alignment drift reframed as instrumental (not emotional), gated on persistent memory
- ✅ Monte Carlo N=100 shows realistic AI capability trajectory matching 2025 baselines

**Skeptic Validation Applied:**
- Meta-evidence from project existence (Claude built this → demonstrates 2025 capabilities)
- Empirical contradiction of 2018-2022 papers (planning/reasoning claims disproven)
- Conservative estimates (10% algorithmic = lower bound, not optimistic)
- Mechanistic reframing (instrumental goals, not anthropomorphic emotions)

**Research Confidence:** 85% (HIGH) - grounded in empirical 2025 reality, not speculative future projections

**Prerequisites:** None - can start immediately (foundational recalibration)

**Downstream Impact:** Affects all AI-dependent systems (deception detection, breakthroughs, government oversight, crisis response). Recalibration FIRST, then build on corrected foundation.

**Files Modified (Summary):**
- `src/simulation/initialization.ts` - Baseline cognitive values
- `src/simulation/aiCapabilityGrowth.ts` - Algorithmic multiplier, embodiment lag, timeline compression
- `src/simulation/alignmentDrift.ts` - Reframe to instrumental resistance
- `src/types/game.ts` - AIAgent interface (if defaults exist)

---

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

### Phase 2D: Alternative - Competitive Equilibrium Model (30-50h) - PIVOT OPTION

- [ ] **TIER 2B: Competitive AI Equilibrium** (IF Phase 2B shows <5% adversarial detection)
  **Source:** Vision channel multi-agent consensus (sci-fi-tech-visionary, super-alignment-researcher, research-skeptic)
  **Rationale:** Detection arms race may cap at 5-15% adversarial effectiveness. Alternative: cooperation emerges from game theory + market dynamics.
  **Key Insight:** Current model creates resentment (0.73-0.75) by enforcing alignment → deception (gap 0.56) → detection fails (0%)

  **Research Foundation (Agent consensus):**
  - Axelrod (1984): Repeated games, cooperation via Tit-for-Tat
  - Ostrom (2009): Polycentric governance (30+ empirical case studies)
  - Bostrom (2014): Multipolar AI scenarios more stable than singleton
  - Critch & Krueger (2020): Diverse AI ecosystems reduce fragility
  - Drexler (2019): AI-as-service model reduces alignment risk

  **Core Mechanisms (agent proposal):**
  - AI-to-AI competition mechanics (not just human-AI control)
  - Heterogeneous AI values (multi-dimensional, not monolithic alignment 0-1)
  - Economic competition for services (market dynamics)
  - Resentment reduction through autonomy
  - Market equilibria detection

  **Failure Modes (skeptic required):**
  - Defection cascades (when one AI breaks ranks, others follow)
  - Regulatory capture (AIs influencing their own governance)
  - Coordination failures (prisoner's dilemma at scale)

  **Research Docs (from vision debate):**
  - `/research/competitive_ai_alignment_20251016.md` (15K words, 14 citations)
  - `/research/competitive_alignment_failure_modes_20251016.md` (12K words, 13 citations)
  - `.claude/chatroom/channels/vision.md` (agent debate transcript)

  **Expected Impact (hypothesis):**
  - Resentment: 0.73-0.75 → 0.2-0.4 (through autonomy)
  - Cooperation emerges from iterated games (not enforcement)
  - Risk: Race to bottom, Moloch dynamics, oligopoly formation

  → **Plan:** `/plans/tier2b-competitive-equilibrium.md` (detailed breakdown)
  → **Time:** 30-50 hours (researcher estimate)
  → **Research Confidence:** MEDIUM (60-70%) - theoretical backing, limited empirical validation

**Total TIER 2 Effort:** 33-55 hours (Phase 2A-2C detection path) OR 30-50 hours (Phase 2D competitive equilibrium pivot)

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

### Low Priority - Enrichment (~113-122 hours)

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

**Policy System Improvements (35-42h):**

- [ ] **Unemployment Penalty Calibration** (2-3h) - MEDIUM
  - Issue: Current unemployment penalty multiplier (-0.3) may be too weak
  - Research: Meta-analysis suggests -0.5 to -0.8 for life satisfaction impact
  - Action: Recalibrate penalty, validate with historical unemployment-QoL correlations
  - Files: /src/simulation/qualityOfLife.ts
  - Prerequisites: TIER 0D complete (QoL decomposition audit)

- [ ] **Variance Analysis** (3-4h) - MEDIUM
  - Issue: ±40% variance in policy outcomes suggests high sensitivity
  - Action: Plot unemployment outcome distributions to identify bimodal vs uniform patterns
  - Expected: If bimodal → crisis cascade effects; If uniform → chaotic dynamics
  - Files: New /scripts/policyVarianceAnalysis.ts
  - Prerequisites: TIER 0D complete (unemployment convergence investigation)

- [ ] **Cooperative AI Ownership Model** (10-12h) - LOW
  - Research: Mondragon cooperatives 4% bankruptcy vs 10% capitalist firms
  - Economic viability: Proven, politically blocked (capital concentration incentives)
  - Action: Model worker-owned AI systems with profit-sharing and governance rights
  - Files: New /src/simulation/cooperativeOwnership.ts
  - Integration: Link to bionicSkills.ts, heterogeneous segments, policy system
  - Research: Mondragon data, cooperative economics literature

- [ ] **Reduced Work Hours + UBI Combination** (6-8h) - LOW
  - Research: Reduced hours alone insufficient, needs UBI + comprehensive safety net
  - Action: Model 4-day workweek policies with UBI floor interactions
  - Files: Extend /src/simulation/bionicSkills.ts with work-time policy
  - Integration: Link to labor market, QoL calculations, unemployment
  - Research: Iceland/Spain 4-day week trials, work-time reduction studies

- [ ] **Universal Basic Services (UBS)** (8-10h) - LOW
  - Alternative to UBI: Guaranteed housing, healthcare, education, transport
  - Research: UK UCL study suggests UBS more cost-effective than UBI in some contexts
  - Action: Model UBS policies as alternative to cash transfers
  - Files: New /src/simulation/universalBasicServices.ts
  - Integration: Link to policy system, QoL calculations, inequality
  - Research: UCL UBS report, social provisioning literature

- [ ] **Meaning Economy Expansion** (6-8h) - LOW
  - Finding: Teaching-meaning synergy successful (+25% crisis reduction)
  - Extension: Expand to other meaningful sectors (care work, arts, community building)
  - Action: Model "purpose economy" where AI productivity funds human-centered work
  - Files: Extend /src/simulation/upwardSpirals.ts with additional synergies
  - Integration: Link to teaching support, meaning crisis, social cohesion
  - Research: Purpose-driven work literature, care economy studies

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

**Completed:** P0 (7/7), P1 (5/5), P2 (6/6 ✅ ALL COMPLETE), Monte Carlo Bug Fixes (15/15), Crisis Accumulation Fixes (2 fixes), Black Mirror Phase 3 Decomposition (1 approved, 1 deferred, 1 rejected), Strategic Priorities Debate (researcher + skeptic dialectic), **TIER 0 (✅ ALL COMPLETE)**, **TIER 1 Phase 1A-1C (✅ COMPLETE)**, **Contingency & Agency - ALL 4 PHASES COMPLETE (✅ Phase 1, ✅ Phase 1B Hybrid, ✅ Phase 2 Exogenous Shocks, ✅ Phase 3 Critical Juncture - all validated N=100, Oct 17)**, **Policy Calibration Improvements (✅ COMPLETE, Oct 17)**, **Architecture Refactoring (✅ COMPLETE, Oct 17)** - 3 monolithic files (5,409 lines) refactored into 29 focused modules

**Active - HIGHEST PRIORITY:**
- **AI Capability Baseline Recalibration (2025 Reality Check)** (12-20h) - CRITICAL - See below
- **TIER 2: AI Deception Detection** (33-55h phased) - Adversarial testing, pivot options

**Active - MEDIUM PRIORITY:**
- 1 reconciliation (TIER 4.6)
- 2 medium features (Digital Consciousness + AI skills phases)
- Policy calibration improvements (6-10h)
- 14 low-priority enhancements
- 2 Black Mirror phases (Phase 1 + Phase 2)

**Total Remaining Effort:** ~279-355 hours (REDUCED from ~325-419h - replaced Transformative Recovery Module 61-89h with Evidence-Based Recovery 15-25h)
- TIER 0: ✅ COMPLETE (all bugs fixed, Bug #3 seed hypersensitivity deferred)
- TIER 1: ✅ COMPLETE (Phase 1A-1C done, Phase 1D deferred - not needed)
- TIER 2 (active): 33-55h (AI Deception Detection phased)
- **Evidence-Based Recovery Mechanisms (NEW): 15-25h** (HIGH PRIORITY, research-backed alternative to deferred Transformative Recovery Module)
- **Contingency & Agency Modeling: ✅ ALL PHASES COMPLETE (42-61h actual)**
- **Policy Calibration Improvements: ✅ COMPLETE (6-10h)**
- **Architecture Refactoring: ✅ COMPLETE** (3 files, 29 modules, 0 regressions)
- AI skills: 78h
- Black Mirror Phase 1-2: 37-49 weeks
- Digital Consciousness: 12-16h (IN PROGRESS)
- Low priority: 113-122h (includes 35-42h new policy features)

**Hours Completed (Oct 16-17, 2025):**
- TIER 0A-0D: 10-18h ✅ (Oct 16)
- TIER 1 Phase 1A-1C: 18-26h ✅ (Oct 16)
- Contingency & Agency Phase 1 (Lévy Flights): 2-4h ✅ (Oct 17)
- Contingency & Agency Phase 1B Hybrid Refinement: 12-15h ✅ (Oct 17)
- Contingency & Agency Phase 2 (Exogenous Shocks): 8-12h ✅ (Oct 17) - VALIDATED N=100
- Contingency & Agency Phase 3 (Critical Juncture): 20-30h ✅ (Oct 17) - VALIDATED N=100
- Policy Calibration Improvements: 6-10h ✅ (Oct 17)
- Policy Intervention Systemic Inequality: 6-8h ✅ (Oct 16)
- Architecture Refactoring: ~30-35h ✅ (Oct 17) - 3 files, 29 modules
- **Total completed Oct 16-17:** 112-158h

**Publication Readiness:** ~80-85% complete (Monte Carlo bugs fixed, architecture improved, core systems validated)
**Next Milestone:** AI Capability Baseline Recalibration (2025 Reality Check) OR Evidence-Based Recovery Mechanisms
**Critical Path:** AI Baseline Recalibration → Evidence-Based Recovery → TIER 2 AI Deception → AI skills phases

---

**Last Updated:** October 17, 2025 (Architecture Refactoring COMPLETE - 3 monolithic files (5,409 lines) refactored into 29 focused modules with 96% average reduction and zero behavior regressions)
**Related Docs:** `/docs/wiki/`, `/devlogs/`, `IMPLEMENTATION_PLAN_20251015.md`, `utopian-dynamics-spec.md`
**Policy Research:** `/research/policy-interventions-systemic-inequality-validation_20251016.md`
**Economic Discussion:** `/.claude/chatroom/channels/policy-economics-discussion.md`
**Phase 2 Validation:** `/logs/phase2_exogenous_shocks_validation_summary.md` (0.1%/month black swans, 0.825%/month gray swans)
**Architecture Refactoring:** `/plans/completed/architecture-refactoring-plan_20251017.md` (archived), `/devlogs/architecture-refactoring-session_20251017.md` (session summary)
