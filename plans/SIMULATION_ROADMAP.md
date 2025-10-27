# Simulation Roadmap
## AI Alignment Game Theory Simulation - Core Engine & Mechanics

**Date:** October 26, 2025
**Purpose:** All simulation engine work (mechanics, systems, features)
**Philosophy:** Research-backed realism, mechanism-driven emergence

**📈 For Frontend/Dashboard work:** See `/plans/FRONTEND_ROADMAP.md`
**🎮 For God Mode UI:** See `/plans/god-mode-ui-master-plan.md` (linked from FRONTEND_ROADMAP.md)
**🗺️ Return to Master Roadmap:** `/plans/MASTER_IMPLEMENTATION_ROADMAP.md`

---

## 📊 SIMULATION STATUS

**Last Update:** October 26, 2025

**For completed work history, see:** `/plans/completed/COMPLETED_WORK_OCT_2025.md`

---

**🚧 Currently In Progress:**
1. **HIGH:** Simulation state persistence & management (11-16h) - Available for implementation

**Recently Completed (Oct 27, 2025):**
1. ✅ **TIER 2 Superalignment Interventions** (Oct 27) - 8 interventions with epistemic uncertainty modeling
2. ✅ **Technology Tree Bugs #6-11** (Oct 27) - AI bankruptcy persistence, grid batteries, pollinators
3. ✅ **Regional → Global Aggregation** (Oct 27, ALL 5 PHASES COMPLETE) - Population drift bug fixed, architecture pattern established

**Next Priorities:**
1. **MEDIUM:** Policy System Improvements (35-42h)
2. **LOW:** P3 Enhancements (37-48h)

---

## 🎯 ACTIVE SIMULATION WORK

---

### Simulation State Persistence & Management - ✅ COMPLETE (Oct 26, 2025)

**Status:** ALL 4 PHASES COMPLETE - Full state persistence operational
**Time Invested:** ~11-16 hours
**Priority:** ✅ COMPLETE - UX enhancement for research workflow

**Completed Features:**
- ✅ IndexedDB storage for full GameState snapshots
- ✅ Worker autosave every 5 months (2.5 minutes real-time)
- ✅ Auto-resume modal with 3-second countdown
- ✅ Simulation management UI (grid/list views)
- ✅ RNG call counter for perfect determinism
- ✅ Smart save rotation (10 saves max, dense recent + sparse old)
- ✅ Semantic versioning with migration logic
- ✅ Storage quota warnings (80% threshold)
- ✅ Export/import as JSON
- ✅ Version compatibility checking
- ✅ Graceful error handling for corrupted states

**Phase 1: Core State Persistence (4-6h)**
- Extend EventDatabase to store full GameState snapshots
- Worker autosave after each simulation step (debounced)
- IndexedDB object stores: `simulations`, `simulation_metadata`
- Handle storage quotas (browser limits ~50-100MB)

**Phase 2: Resume/Continue UX (3-4h)**
- Auto-resume flow (3-second modal with cancel option)
- Simulation management interface (grid/list views)
- Resume from state via new worker message
- RNG reconstruction for determinism

**Phase 3: Version Control & Edge Cases (2-3h)**
- Git commit hash validation (block incompatible versions)
- Schema versioning for migrations
- Corrupted state handling
- Storage quota warnings

**Phase 4: Export/Import & Testing (2-3h)**
- Download/upload simulation state as JSON
- Clear all data functionality
- Testing checklist (RNG determinism, multiple simulations, resume correctness)

**Total Effort:** 11-16h

**Benefits:**
- No data loss on browser refresh/crash
- Multiple simulations can coexist
- Research workflow improvements (pause/resume, compare runs)
- Foundation for future Monte Carlo UI integration

**Files:**
- Plan: `/plans/simulation-persistence-plan.md` (1,107 lines with UI/UX specs)
- Existing: `src/lib/eventDatabase.ts`, `src/workers/simulationWorker.ts`
- New: `src/components/dashboards/SimulationPersistenceManager.tsx`

---

## 📊 LOW PRIORITY - ENRICHMENT FEATURES

### Priority 3 Enhancements (37-48h)

**Total Effort:** 37-48h (was 39-51h, P3.3 complete -2-3h)

**P3.1: Variable Timesteps (10-12h)**
- Event-driven architecture, 3-5x performance gain
- Plan: `/plans/p3-1-variable-timesteps.md`

**P3.2: Unknown Unknowns (4-6h)**
- Black swan events, true uncertainty
- Plan: `/plans/p3-2-unknown-unknowns.md`

**P3.3: Alignment Specificity** ✅ **COMPLETE (Oct 26, 2025)**
- RLHF, Constitutional AI, mech interp, iterated amplification as distinct techniques
- Capability scaling degradation, interaction effects, research-backed parameters
- Fixed: Phase order conflict, state propagation, NaN protection
- Plan: `/plans/completed/p3-3-alignment-model-specificity_COMPLETE_20251026.md`
- Wiki: `docs/wiki/systems/alignment-dynamics.md` (Alignment Technique Specificity section)

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

**P3.7: Regional-First Population Architecture** ✅ **FULLY COMPLETE (Oct 27, 2025)**
- ✅ Phase 1: Population aggregation (8.0B hardcoded → 8.136B from regional sum)
- ✅ Phase 2: Demographics aggregation (birth/death rates, fertility, median age)
- ✅ Phase 3: Carrying capacity aggregation (global = sum of regional capacities)
- ✅ Phase 4: Deaths aggregation (global deaths = sum of regional deaths)
- ✅ Phase 5: Consistency assertion (validates no drift between regional and global)
- ✅ Bonus: QoL aggregation (population-weighted average from regional QoL)
- ✅ Architecture pattern established: Global = aggregate of regional (single source of truth)
- Plan: `/plans/completed/regional-aggregation-refactor_COMPLETE_20251027.md`
- Commit: 4b93507
- Functions: `aggregateGlobalPopulation()`, `aggregateGlobalDemographics()`, `aggregateGlobalCarryingCapacity()`, `aggregateGlobalDeaths()`, `aggregateGlobalQoL()`, `assertRegionalConsistency()`

---

### Policy System Improvements (35-42h)

**Unemployment Penalty Calibration (2-3h) - MEDIUM**
- Issue: Current multiplier (-0.3) may be too weak
- Research: Meta-analysis suggests -0.5 to -0.8
- Action: Recalibrate, validate with historical data
- Files: `qualityOfLife.ts`
- Plan: `/plans/policy-calibration-improvements.md`

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

### TIER 2 Superalignment Interventions ✅

**Status:** ✅ **COMPLETE** (October 27, 2025)
**Implementation:** 8 interventions, 1,240+ lines of phase code, 39,000-word research validation

**Completed Plan:** `/plans/completed/tier2-superalignment-interventions_COMPLETE_20251027.md`
**Documentation:** `/docs/wiki/systems/tier2-interventions.md`
**Devlog:** `/devlogs/20251027_0000_tier2-interventions-complete.md`

**What Was Implemented:**
- ✅ AI Interpretability Ensemble (5 Anthropic techniques, 60-85% control loss prevention)
- ✅ Dark Compute Monitoring (70-95% detection with Beta distribution)
- ✅ Nuclear Command Security Hardening (85-97% effective against AI manipulation)
- ✅ Synthetic Ecosystem Services (captive breeding + cloning + economics, 25-50% crisis mitigation)
- ✅ High-Value Coastal Protection (15-25% ocean mitigation, NOT planetary restoration)
- ✅ Crisis Anticipation Systems (AI early warning, 15-30% prevention, already operational 2024-2025)
- ✅ Human-AI Centaur Systems (augmentation vs automation, 15-45% autonomy preservation)
- ✅ Community Cohesion Programs (0.4-0.8%/month cohesion increase)

**Key Features:**
- Epistemic uncertainty modeling (parameters sampled from research-backed distributions)
- Phase-based architecture (8 phase files, unlock → deployment → effects)
- State integration (effects propagate to downstream systems)
- Monte Carlo validated (N=10, exit code 0, deterministic)
- Quality gates passed (research-skeptic + architecture-skeptic)

**Research Foundation:**
- 18+ peer-reviewed citations (2020-2025)
- 5 Anthropic papers (interpretability ensemble)
- Conservation studies (black-footed ferret, Elizabeth Ann cloning)
- Energy monitoring research (CTBTO analogy, RAND data center projections)

**Results:**
- 0 critical bugs, TypeScript compilation clean
- <1ms overhead per month, linear scaling
- Perfect seed reproducibility
- Integration issues fixed (control loss propagation, unemployment tracking, ecosystem upper bounds)

---

### TIER 2B: Competitive Equilibrium Model

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

### Threshold Uncertainty Modeling - ✅ COMPLETE (All 4 Phases + Phase 1C)

**Status:** ALL PHASES COMPLETE including nested Monte Carlo (Oct 26, 2025)

**Phase 1 Deliverables (Tier 1: Research-Backed Thresholds):**
- ✅ Phase 1A: Distribution sampling library (Normal, Beta, Log-Normal, Triangular)
- ✅ Phase 1B: 5 Tier 1 thresholds integrated (social critical mass, trust recovery, climate sensitivity, automation, detection ceiling)
- ✅ Phase 1C: Nested Monte Carlo architecture - **FULLY IMPLEMENTED (Oct 26, 2025)**
  - Two-loop structure: Outer epistemic loop (threshold sampling) + inner aleatory loop (event randomness)
  - `--nested` flag enables epistemic/aleatory separation
  - `--aleatory-samples=N` controls simulations per threshold sample (default: 10)
  - Epistemic uncertainty quantification in output (probability intervals, IQR ranges)
  - Total simulations: --runs × --aleatory-samples (e.g., 10 × 10 = 100)
  - Tested with 2×2=4 simulations - all 4 run files generated (seeds 42000-42003)
  - Verified working: proper loop execution, result collection, epistemic sample tracking
- ✅ Phase 1D: Validation complete

**Phase 2 Deliverables (Tier 2: Historical Range Thresholds):**
- ✅ 5 Tier 2 thresholds implemented (government legitimacy, surveillance dystopia, automation displacement, AI recursive improvement, resentment revolt)
- ✅ Historical range-based distributions (Triangular, Uniform)
- ✅ Research-backed parameters from case studies (Weimar, USSR, East Germany, Arab Spring, Industrial Revolution)
- ✅ Integrated into initialization (sampled on every simulation start)

**Phase 3 Deliverables (Tier 3: Speculative Scenarios):**
- ✅ 10 speculative threshold parameters for unprecedented scenarios
- ✅ 4 categories: AI Rights Bootstrap, Superintelligence Alignment, Post-Scarcity Transition, Meaning Framework Adoption
- ✅ 5 named scenarios (doom/cautious/baseline/progressive/utopia) representing coherent worldviews
- ✅ Research foundation: `/research/threshold_tier3_scenarios_20251026.md`
- ✅ Integrated into initialization with scenario selector

**Phase 4 Deliverables (Integration & Scenario Builder):**
- ✅ Unified `sampleAllThresholds()` function combining Tier 1+2+3
- ✅ Scenario-based sampling (sliders for all 9 Tier 1+2 thresholds)
- ✅ Priority system: Custom sliders > Scenario defaults > Random sampling
- ✅ Epistemic stance applied uniformly across all parameters

**UI Integration (Oct 26, 2025):**
- ✅ **Epistemic Scenario Selector** - 5 scenarios controlling unified worldview
- ✅ **Individual Threshold Sliders** - 9 sliders for Tier 1+2 parameters (0.0-1.0 quantile sampling)
- ✅ **Live Value Preview** - Shows computed threshold values at current slider positions
- ✅ **Collapsible Panel** - Compact view with expand/collapse functionality
- ✅ **Reset to Scenario** - Clear custom overrides, return to scenario defaults
- ✅ **Full Stack Wiring** - Navigation → Worker Context → Worker Client → Worker → Initialization
- ✅ Integrated into initialization modal (ThresholdConfigModal component)

**Total Time Invested:** ~35-46 hours (Phases 1A/1B/1C/1D + 2 + 3 + 4)
**Priority:** ✅ COMPLETE - Full threshold uncertainty system operational including nested sampling

**Implementation Details (Phase 1C):**
- Epistemic loop: Sample thresholds N times from distributions (outer loop)
- Aleatory loop: Run M simulations per threshold sample (inner loop)
- Total runs: N × M (e.g., 10 epistemic × 10 aleatory = 100 total)
- Output: Epistemic uncertainty intervals (probability, IQR, min/max ranges)
- Example usage: `npx tsx scripts/monteCarloSimulation.ts --nested --runs=10 --aleatory-samples=10`
- Time invested Phase 1C: ~5-6 hours

**Files:**
- Backend: `src/simulation/thresholds/` (distributions.ts, tier1Config.ts, tier2Config.ts, tier3Config.ts, index.ts)
- UI: `src/components/thresholds/ThresholdConfigModal.tsx`
- Integration: `src/components/core/Navigation.tsx`, `src/simulation/initialization.ts`
- Research: `/research/threshold_tier3_scenarios_20251026.md`
- Plans: `/plans/completed/threshold-uncertainty-*` (archived)

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

**Total Remaining Effort:** ~125-148 hours across 6 feature groups (reduced from ~131-155h)

**By Priority:**
- 🟡 HIGH: Simulation State Persistence & Management (11-16h) - Available for implementation
- 🟡 MEDIUM: Policy System Improvements (35-42h)
- 🟢 LOW: P3 Enhancements (37-48h)
- 🟢 LOW: TIER 5 Features (46h)
- 🟢 LOW: Black Mirror Phase 1-2 (21-28 weeks, phased)
- 🟢 DEFERRED: Threshold Uncertainty Phases 2-4 (24-37h)
- 🟢 DEFERRED: TIER 2B Competitive Equilibrium (30-50h)

**Recently Completed (Oct 27, 2025):**
- ✅ TIER 2 Superalignment Interventions (8 interventions, epistemic uncertainty)
- ✅ Technology Tree Bugs #6-11 (AI bankruptcy persistence, grid batteries, pollinators)
- ✅ Regional → Global Aggregation (ALL 5 PHASES COMPLETE - population drift bug fixed)

**Related Docs:**
- `/docs/wiki/README.md` - System documentation
- `/devlogs/` - Development diary
- `/research/` - Research findings archive
- `/reviews/` - Critical research evaluations
- `/plans/completed/` - Archived completed plans (105+ files)

---

**Last Updated:** October 27, 2025
