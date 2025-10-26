# Master Implementation Roadmap
## AI Alignment Game Theory Simulation

**Date:** October 25, 2025
**Purpose:** Active work items only - completed work in `/plans/completed/` and documented in wiki
**Philosophy:** Research-backed realism, mechanism-driven emergence

**📊 FRONTEND/DASHBOARD WORK:** See `/plans/FRONTEND_ROADMAP.md` for Next.js UI implementation

**⚠️ NOTE ON ESTIMATES:** Use **complexity** for new work (number of interacting systems). Hour estimates are historical records of AI agent completion times.

---

## 🎯 UNCOMPLETED WORK

---

### Threshold Uncertainty Modeling (HIGH PRIORITY) - 34-52 hours

**Status:** NEW (Oct 21, 2025) - Design complete, implementation pending
**Complexity:** 3-tier classification system, nested Monte Carlo, scenario builder
**Priority:** HIGH - Preserves genuine uncertainty, enables scenario exploration

**Problem Identified:**
- Current thresholds hard-coded as constants (e.g., trust >0.5, capability <3.5)
- Represents **epistemic uncertainty** about unknown true values
- Single-point estimates hide genuine uncertainty in research
- No way to explore "what if AI alignment is easy vs hard?" scenarios

**Research Foundation:**
- Climate tipping point uncertainty: AMOC 4°C ± [1.4-8°C] (Romanou et al. 2025)
- Social critical mass: 25% ± [21-29%] (Centola et al. 2018)
- IPCC AR6: Climate sensitivity N(3.0, 0.75²)
- Sheffield SHELF protocol for expert elicitation
- Nested Monte Carlo: Epistemic (outer) + aleatory (inner) sampling

**Three-Tier System:**

**Tier 1 (Empirical - 10-15h):**
- Well-researched thresholds with probability distributions
- Examples: Social critical mass N(0.25, 0.02²), climate sensitivity, trust recovery β(2,5)
- Method: Sample from distributions (Normal, Beta, Log-Normal, Triangular)
- 5-7 thresholds with strong peer-reviewed grounding

**Tier 2 (Bounded - 6-10h):**
- Historical ranges with Uniform/Triangular sampling
- Examples: Government legitimacy crisis [0.25-0.40], surveillance dystopia [0.65-0.80]
- Method: Expert consensus ranges, historical case studies
- 10-15 thresholds with historical precedent

**Tier 3 (Speculative - 8-12h):**
- Design choices with named scenarios (NOT distributions)
- Examples: AI rights bootstrap timing, superintelligence alignment difficulty
- Method: 5 named scenarios (Doom, Cautious, Baseline, Progressive, Utopia)
- 8-12 thresholds with no empirical grounding

**Multi-Dimensional Sliders:**
- Social Dynamics Optimism [0-1]: Trust, cooperation, institutions
- Technological Optimism [0-1]: Breakthrough success, deployment speed
- Government Competence [0-1]: Response time, policy effectiveness
- AI Alignment Difficulty [0-1]: Detection, deception sophistication
- Environmental Resilience [0-1]: Tipping points, recovery rates

**Phase 1: Tier 1 Implementation (10-15h) - IMMEDIATE**
- Threshold audit (inventory all thresholds, classify by evidence)
- Distribution library (sampling functions)
- Nested Monte Carlo (epistemic + aleatory loops)
- Integration with initialization
- Validation (compare to baseline, verify slider effects)

**Phase 2: Tier 2 Implementation (6-10h) - SHORT-TERM**
- Historical research (document cases)
- Range parameterization (min/max/mode)
- Uniform/Triangular sampling
- Integration with balance, upward spirals, rights actions

**Phase 3: Tier 3 Implementation (8-12h) - MEDIUM-TERM**
- 5 named scenarios (Doom to Utopia)
- Threshold mapping per scenario
- CLI scenario selection interface
- Narrative documentation

**Phase 4: Integration & Validation (10-15h) - FINAL**
- Unified threshold system (all 3 tiers)
- Scenario builder CLI (slider interface)
- Comprehensive testing (500 runs: 5 scenarios × 100 each)
- Documentation (wiki, devlog, research archive)

**Expected Impact:**
- Preserves uncertainty instead of laundering it with fake precision
- Enables "what if alignment is easy?" vs "what if alignment is hard?" exploration
- Matches climate science best practices (IPCC, planetary boundaries)
- Tier 1: Shifts outcome distributions with research-backed uncertainty
- Tier 2: Historical plausibility checks (government collapses, automation crises)
- Tier 3: Coherent narratives for genuine unknowns (AGI alignment, post-scarcity)

**Validation Success:**
- Doom scenario: >90% dystopia/extinction
- Cautious scenario: 70-80% dystopia
- Baseline scenario: 50-60% dystopia (current)
- Progressive scenario: 20-30% dystopia
- Utopia scenario: <10% dystopia

**Files:**
- Plan: `/plans/threshold-uncertainty-scenario-spec.md` (COMPLETE - 22,000 words)
- Research: `/research/threshold_uncertainty_modeling_20251021.md` (22,000 words, 18 citations)
- Review: `/reviews/threshold_uncertainty_critique_20251021.md` (Critical evaluation)
- Implementation: `src/simulation/thresholds/` (NEW directory)
- Scripts: `scripts/nestedMonteCarloSimulation.ts`, `scripts/scenarioBuilder.ts`

---

### TIER 2 AI Deception Detection (12-74 hours)

**Status:** Infrastructure complete, Phase 2C or 2D remaining
**Complexity:** Multi-method ensemble or competitive equilibrium model

**Phase 2C: Multi-Method Ensemble (12-20h)**
- 5 detection methods (noise injection + behavioral anomaly + internal consistency + adversarial probing + cross-model comparison)
- Investment scaling: $1B (20%) → $10B (40%) → $50B (60% max)
- Expected: Maintain 100% neutralization at lower investment levels (6/10 or 4/10)
- Objectives: Test ensemble synergies, identify minimal sufficient investment
- Trade-off: 40% compute overhead ($400B-$600B/year)

**Phase 2D: Alternative - Competitive Equilibrium Model (30-50h) - DEFERRED**
- Alternative to detection: cooperation emerges from game theory + market dynamics
- Research: Axelrod 1984, Ostrom 2009, Bostrom 2014, Critch & Krueger 2020
- Core: AI-to-AI competition, heterogeneous values, market equilibria
- Reduces resentment 0.73 → 0.2-0.4 through autonomy
- Files: New `competitiveAlignment.ts` system

**Total Effort:** 12-74h (12-20h for Phase 2C, 30-50h for Phase 2D if pursued)

**Files:**
- Plans: `/plans/tier2-ai-deception-detection.md`
- Research: `/research/gaming-sleeper-detection_20251017.md`

---

### AI-Assisted Skills Enhancement (78 hours)

**Status:** Core system validated, critical gaps remaining
**Complexity:** 6 phases, 7 interacting systems (bionicSkills, unemployment, policy, QoL, inequality)

**Phase 1: Terminology & Documentation (8h)**
- Remove "bionic" terminology (too sci-fi), use "AI-assisted skills"
- Add research citations (JSDoc with study references)
- Document TRL levels for each mechanic
- Update TIER 4.6 plan to remove BCI language

**Phase 2: Phase Transition Mechanics (12h)**
- Model complementarity → transition → substitution timeline (5-10 year phases)
- Add displacement tracking by population segment
- Implement policy interventions (retraining, job guarantee, UBI)
- Research: Acemoglu & Restrepo 2022 (50-70% wage inequality from automation)

**Phase 3: Performance vs Competence Tracking (8h)**
- Separate AI-assisted performance from true skill retention
- Add scaffolding quality tracking (education, mentorship by segment)
- Model retention mechanics (scaffolding × reliance → retention rate)
- Add competence crisis events (30% gap = warning, 50% = crisis)
- Research: Cognitive Research 2024 ("illusion of understanding")

**Phase 4: Economic Distribution & Wage Decoupling (6h)**
- Add labor share tracking (currently 0.62, declining with AI)
- Model capital vs labor capture (70/30 default, policy-adjustable)
- Implement policy levers (union strength, minimum wage, worker ownership, UBI)
- Research: Brookings 2024 (65pp productivity-wage gap since 1973)

**Phase 5: Validation & Testing (16h)**
- Historical comparison (ATMs, Excel, self-checkout timelines)
- Sensitivity analysis (parameter ranges, policy interventions)
- Literature comparison (run scenarios matching published studies)
- Edge case testing (extreme AI capability, zero/max policy)

**Phase 6: Policy Testing (16h)**
- Implement policy levers (retraining, UBI, worker ownership, teaching support, job guarantee)
- Run scenario comparisons (baseline vs single vs combined interventions)
- Document effectiveness (which policies reduce inequality? preserve employment?)
- Cost-benefit analysis and recommendations

**Total Effort:** 78h (8h + 12h + 8h + 6h + 16h + 16h + 12h integration/testing)

**Files:**
- Plans: `/plans/bionic-skills-research-grounding.md`, `/plans/bionic-skills-phase-transition.md`, `/plans/bionic-skills-competence-tracking.md`, `/plans/bionic-skills-economic-distribution.md`

---

## 📊 LOW PRIORITY - ENRICHMENT FEATURES

### Priority 3 Enhancements (33-43h)

**P3.1: Variable Timesteps (10-12h)**
- Event-driven architecture, 3-5x performance gain
- Plan: `/plans/p3-1-variable-timesteps.md`

**P3.2: Unknown Unknowns (4-6h)**
- Black swan events, true uncertainty
- Plan: `/plans/p3-2-unknown-unknowns.md`

**P3.3: Alignment Specificity (2-3h)**
- RLHF, Constitutional AI, mech interp as distinct techniques
- Plan: `/plans/p3-3-alignment-model-specificity.md`

**P3.5: Parameter Uncertainty (6-8h)**
- Continuous uncertainty quantification, sensitivity analysis
- Plan: `/plans/p3-5-parameter-uncertainty.md`

**P3.6: Ensemble AI Alignment Verification (8-10h)**
- Multi-model voting for safety-critical decisions
- Plan: `/plans/p3-6-ensemble-alignment-verification.md`
- Note: Prototype only (40% overhead, collusion risk)

---

### LLM Policy Optimization System - Phase 5 Testing (6-8h)

**Status:** Infrastructure complete (Phases 1-4), testing remaining
**Remaining Work:**
- Test with Qwen3-32B (localhost:1234)
- Run comparative Monte Carlo (LLM policy vs hardcoded weights)
- Validate weights make sense (aligned agents prioritize beneficial contributions?)
- Analyze token budget exhaustion patterns
- Compare utopia/dystopia/extinction rates

**Design Documents:**
- Full architecture: `docs/design/llm-policy-optimization-system.md` (968 lines)
- Action space reference: `docs/design/ai-agent-action-space.md`
- Turn-by-turn context: `scripts/generateTurnByTurnContext.ts` (550 lines)

---

### Policy System Improvements (35-42h)

**Unemployment Penalty Calibration (2-3h) - MEDIUM**
- Issue: Current multiplier (-0.3) may be too weak
- Research: Meta-analysis suggests -0.5 to -0.8
- Action: Recalibrate, validate with historical data
- Files: `qualityOfLife.ts`

**Variance Analysis (3-4h) - MEDIUM**
- Issue: ±40% variance in policy outcomes (high sensitivity)
- Action: Plot distributions, identify bimodal vs uniform patterns
- Files: New `scripts/policyVarianceAnalysis.ts`

**Cooperative AI Ownership Model (10-12h) - LOW**
- Research: Mondragon cooperatives 4% bankruptcy vs 10% capitalist
- Action: Model worker-owned AI systems with profit-sharing
- Files: New `cooperativeOwnership.ts`

**Reduced Work Hours + UBI Combination (6-8h) - LOW**
- Research: Reduced hours alone insufficient, needs UBI + safety net
- Action: Model 4-day workweek policies with UBI
- Files: Extend `bionicSkills.ts`

**Universal Basic Services (UBS) (8-10h) - LOW**
- Alternative to UBI: Guaranteed housing, healthcare, education
- Research: UK UCL study (UBS more cost-effective in some contexts)
- Files: New `universalBasicServices.ts`

**Meaning Economy Expansion (6-8h) - LOW**
- Finding: Teaching-meaning synergy successful (+25% crisis reduction)
- Extension: Expand to care work, arts, community building
- Files: Extend `upwardSpirals.ts`

---

### TIER 5 Features (46h)

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

### Black Mirror Integration (37-49 weeks, phased)

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

**Phase 3: Long-Term Research (Decomposed Oct 16, 2025)**
- **APPROVED:** Digital Consciousness Governance (12-16h) ✅ COMPLETE (Oct 18)
- **DEFERRED:** Performative Behavior Modeling (18-24 months)
- **REJECTED:** Autonomous Weapon Degradation Curves (research 2-4 years obsolete)

---

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

**Total Remaining Effort:** ~147-228 hours across 9 feature groups

**By Priority:**
- 🟡 HIGH: Threshold Uncertainty Modeling (34-52h)
- 🟡 MEDIUM: AI Deception Detection Phase 2C or 2D (12-74h)
- 🟡 MEDIUM: AI-Assisted Skills (78h)
- 🟡 MEDIUM: LLM Policy Optimization Phase 5 (6-8h) - Testing only
- 🟢 LOW: P3 Enhancements (33-43h)
- 🟢 LOW: Policy Improvements (35-42h)
- 🟢 LOW: TIER 5 Features (46h)
- 🟢 LOW: Black Mirror Phase 1-2 (21-28 weeks, phased)

**Related Docs:**
- `/docs/wiki/README.md` - System documentation
- `/devlogs/` - Development diary
- `/research/` - Research findings archive
- `/reviews/` - Critical research evaluations
- `/plans/completed/` - Archived completed plans

---

**Last Updated:** October 25, 2025
