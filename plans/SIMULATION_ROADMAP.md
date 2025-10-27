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
1. **HIGH:** Simulation state persistence & management (11-16h) - 🚧 Currently being worked on by another agent
2. **MEDIUM:** Regional → Global Aggregation Refactor (5-8h) - 🚧 Currently being worked on by another agent

**Next Priorities:**
1. **MEDIUM:** TIER 2 Superalignment Interventions (TBD)

---

## 🎯 ACTIVE SIMULATION WORK

---

### Simulation State Persistence & Management (11-16 hours)

🚧 **Currently being worked on by another agent**

**Status:** Foundation ready (event persistence working), full state persistence planned
**Complexity:** 4 phases - Core persistence → Resume UX → Version control → Export/Import
**Priority:** HIGH - UX enhancement for research workflow

**Context:**
- ✅ Timeline bug fixed (Oct 26, 2025) - IndexedDB event storage working
- ✅ Event database infrastructure exists (eventDatabase.ts)
- ❌ Simulation state not persisted - lost on page refresh
- ❌ No simulation management UI

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

**P3.7: Regional-First Population Architecture (6-8h)** 🚧 **Currently being worked on by another agent**
- Refactor population calculations to be regional-first with cached global aggregates
- Single source of truth (regional level), global metrics are pure sums
- Benefits: Eliminates double-counting bugs, performance improvements (O(1) cached lookups vs O(n) array scans)
- Requirements: Must include toJson serialization method for backward compatibility
- Architecture: Calculate at regional level → aggregate to global as cached values
- Status: Deferred from Oct 26, 2025 bug fix session
- Plan: `/plans/regional-aggregation-refactor.md`

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

### TIER 2 Superalignment Interventions

**Status:** Not yet implemented
**Priority:** MEDIUM - After simulation persistence
**Plan:** `/plans/tier2-superalignment-interventions.md`

**Overview:**
Enable at least one Utopia outcome by implementing interventions that activate the four failing spirals (Cognitive, Meaning, Democratic, Ecological).

**Success Metrics:**
- Cognitive Spiral activates (meaning crisis <30%)
- Meaning Spiral activates (community >70%, cultural adaptation >70%)
- Democratic Spiral activates (participation >60%)
- Ecological Spiral activates (biodiversity >70%)
- Virtuous Cascade triggers (4+ spirals sustained)
- At least 1/10 runs reach Utopia (vs current 0/10)

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

### Threshold Uncertainty Modeling - COMPLETE (Phases 1-2), UI Integrated

**Status:** Phases 1-2 COMPLETE (Oct 26, 2025), UI integration COMPLETE (Oct 26, 2025)

**Phase 1 Deliverables (Backend):**
- ✅ Distribution sampling library (Normal, Beta, Log-Normal, Triangular)
- ✅ 5 Tier 1 thresholds integrated (social critical mass, trust recovery, climate sensitivity, automation, detection ceiling)
- ✅ Nested Monte Carlo architecture (epistemic/aleatory separation)
- ✅ Validation complete

**Phase 2 Deliverables (Backend):**
- ✅ 5 Tier 2 thresholds implemented (government legitimacy, surveillance dystopia, automation displacement, AI recursive improvement, resentment revolt)
- ✅ Historical range-based distributions (Triangular, Uniform)
- ✅ Research-backed parameters from case studies (Weimar, USSR, East Germany, Arab Spring, Industrial Revolution)
- ✅ Integrated into initialization (sampled on every simulation start)

**UI Integration (Oct 26, 2025):**
- ✅ ThresholdConfigSection component - Collapsible display of all 10 thresholds
- ✅ DistributionVisualizer component - Sparkline visualizations for distribution shapes
- ✅ Integrated into ControlsTab - Visible during simulation configuration
- ✅ Research citations and impact descriptions for each threshold
- ✅ Grouped by tier (Tier 1: Empirical, Tier 2: Historical)

**Remaining Work (Optional Enhancements):**
- **Phase 3:** Tier 3 speculative scenarios (8-12h) - Named scenarios (Doom/Utopia)
- **Phase 4:** Scenario builder CLI (10-15h) - Multi-dimensional sliders
- **UI Phase 2:** Custom distribution override (2-3h) - User-editable ranges

**Total Remaining:** 12-18 hours (UI custom override) + 18-27 hours (Phase 3-4)
**Priority:** DEFERRED - Phases 1-2 + UI provide core functionality, remaining work is enrichment

**Files:**
- Plan: `/plans/threshold-uncertainty-ui-plan.md`
- Archived Plan: `/plans/completed/threshold-uncertainty-scenario-spec_20251026.md`
- Backend: `src/simulation/thresholds/` (distributions.ts, tier1Config.ts, tier2Config.ts, index.ts)
- UI: `src/components/thresholds/` (ThresholdConfigSection.tsx, DistributionVisualizer.tsx)
- Integration: `src/components/tabs/ControlsTab.tsx` (line 446)

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

**Total Remaining Effort:** ~131-155 hours across 7 feature groups

**By Priority:**
- 🟡 HIGH: Simulation State Persistence & Management (11-16h)
- 🟡 MEDIUM: TIER 2 Superalignment Interventions (TBD)
- 🟡 MEDIUM: Policy System Improvements (35-42h)
- 🟢 LOW: P3 Enhancements (39-51h)
- 🟢 LOW: TIER 5 Features (46h)
- 🟢 LOW: Black Mirror Phase 1-2 (21-28 weeks, phased)
- 🟢 DEFERRED: Threshold Uncertainty Phases 2-4 (24-37h)
- 🟢 DEFERRED: TIER 2B Competitive Equilibrium (30-50h)

**Related Docs:**
- `/docs/wiki/README.md` - System documentation
- `/devlogs/` - Development diary
- `/research/` - Research findings archive
- `/reviews/` - Critical research evaluations
- `/plans/completed/` - Archived completed plans

---

**Last Updated:** October 26, 2025
