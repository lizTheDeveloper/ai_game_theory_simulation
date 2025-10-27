# Master Implementation Roadmap
## AI Alignment Game Theory Simulation

**Date:** October 26, 2025
**Purpose:** Active work items only - completed work in `/plans/completed/` and documented in wiki
**Philosophy:** Research-backed realism, mechanism-driven emergence

**📊 FRONTEND/DASHBOARD WORK:** See `/plans/FRONTEND_ROADMAP.md` for Next.js UI implementation

**⚠️ NOTE ON ESTIMATES:** Use **complexity** for new work (number of interacting systems). Hour estimates are historical records of AI agent completion times.

---

## 📊 PROGRESS SUMMARY

**Last Update:** October 26, 2025 (Session: Automated workflows + Phase 1 implementation)

**Recently Completed (Oct 26, 2025):**

### ✅ Threshold Uncertainty Modeling Phase 1 - COMPLETE
All 4 sub-phases implemented, tested, and committed:
- **Phase 1A** (Issue #7): Distribution sampling library (379 lines + 500 lines tests, 28/28 passing)
  - Implemented: Normal, Beta, Log-Normal, Triangular distributions
  - Commit: d23ea76
- **Phase 1B** (Issue #8): Tier 1 threshold integration (5 research-backed thresholds)
  - Created: thresholdInventory.ts, tier1Config.ts
  - Integrated: ThresholdConfig in GameState, initialization sampling
  - Commit: a762d2c
- **Phase 1C** (Issue #9): Nested Monte Carlo architecture
  - Implemented: Epistemic/aleatory separation, `--nested` CLI flag
  - Commit: 83ef1e3
- **Phase 1D** (Issue #10): Validation & documentation
  - Created: devlog, validation results, wiki updates
  - Commit: a762d2c

**Archived:** `/plans/completed/threshold-uncertainty-scenario-spec_20251026.md`

**Issues closed:** #6 (split into sub-issues), #7, #8, #9, #10

### ✅ GitHub Actions Workflow Improvements - COMPLETE
- Fixed branch name sanitization (handles special characters: `:?*[]~^\`)
- Made test script optional (handles repos without npm test)
- Validated workflow triggering and execution
- Commits: 06eca58, 23a1790, d0f1e14

### ✅ Additional Systems - COMPLETE
- **Event logging system**: eventDatabase.ts, eventLogger.ts, testEventLogging.ts
- **Famine mortality seasonal patterns**: Seasonal variation, research-backed mortality rates
- **Timeline dashboard updates**: Event tracking integration

**Total commits this session:** 8 commits (06eca58, 23a1790, d0f1e14, d23ea76, 83ef1e3, a762d2c, 13d616e, 9c278ff)

**Effort saved:** ~34-52 hours (Phase 1 complete, Phases 2-4 deferred to enrichment)

### ✅ Bug Fixes - COMPLETE
- **Organizations-to-countries linkage bug** (Commit: 13d616e)
  - Fixed: Missing `bankruptcyRisk` initialization in all 6 organizations
  - Validated: 5/5 tests passing, multi-country operations working correctly
  - Devlog: `devlogs/organization_country_linkage_fix_20251026.md`
- **Nuclear winter cascades bug** (Commit: 9c278ff)
  - Fixed: Missing `monthlyDeathsApplied` and `monthlyDeathCapReached` initialization
  - Validated: Test scenarios (100-warhead, 1000-warhead) match research parameters
  - Devlog: `devlogs/nuclear_winter_initialization_fix_20251026.md`

---

**🚧 Currently In Progress (Oct 26, 2025):**
- None

**Next Priorities:**
1. **HIGH:** Simulation state persistence & management (11-16h, builds on event persistence)
2. **MEDIUM:** AI Deception Detection Phase 2C (12-20h, multi-method ensemble)
3. **MEDIUM:** Technology tree refactoring (enables Phase 2 threshold work)
4. **LOW:** AI-Assisted Skills Enhancement (78h, 6 phases remaining)

---

## 🎯 UNCOMPLETED WORK

---

### Threshold Uncertainty Modeling - Phases 2-4 (DEFERRED)

**Status:** Phase 1 COMPLETE (Oct 26, 2025), Phases 2-4 deferred
**Phase 1 Deliverables:**
- ✅ Distribution sampling library (Normal, Beta, Log-Normal, Triangular)
- ✅ 5 Tier 1 thresholds integrated (social critical mass, trust recovery, climate sensitivity, legitimacy crisis, automation)
- ✅ Nested Monte Carlo architecture (epistemic/aleatory separation)
- ✅ Validation complete

**Remaining Work (Phases 2-4):**
- **Phase 2:** Tier 2 bounded thresholds (6-10h) - Historical ranges
- **Phase 3:** Tier 3 speculative scenarios (8-12h) - Named scenarios (Doom/Utopia)
- **Phase 4:** Scenario builder CLI (10-15h) - Multi-dimensional sliders

**Total Remaining:** 24-37 hours
**Priority:** DEFERRED - Phase 1 provides core functionality, Phases 2-4 are enrichment

**Files:**
- Archived Plan: `/plans/completed/threshold-uncertainty-scenario-spec_20251026.md`
- Implementation: `src/simulation/thresholds/` (distributions, tier1Config, thresholdInventory)

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

### Simulation State Persistence & Management (11-16 hours)

**Status:** Foundation ready (event persistence working), full state persistence planned
**Complexity:** 4 phases - Core persistence → Resume UX → Version control → Export/Import
**Priority:** MEDIUM - UX enhancement for research workflow

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

**Design:**
- Complete UI/UX specifications included in plan (grid/list views, modals, accessibility)
- Visual aesthetic: Far-future dark mode with cyan glow effects
- Keyboard shortcuts, screen reader support, motion preferences

---

## 📊 LOW PRIORITY - ENRICHMENT FEATURES

### Priority 3 Enhancements (39-51h)

**Total Effort:** 39-51h (was 33-43h)

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

**P3.7: Regional-First Population Architecture (6-8h)**
- Refactor population calculations to be regional-first with cached global aggregates
- Single source of truth (regional level), global metrics are pure sums
- Benefits: Eliminates double-counting bugs, performance improvements (O(1) cached lookups vs O(n) array scans)
- Requirements: Must include toJson serialization method for backward compatibility
- Architecture: Calculate at regional level → aggregate to global as cached values
- Status: Deferred from Oct 26, 2025 bug fix session

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

**Total Remaining Effort:** ~140-215 hours across 10 feature groups

**By Priority:**
- 🟢 DEFERRED: Threshold Uncertainty Phases 2-4 (24-37h) - Phase 1 complete, enrichment deferred
- 🟡 MEDIUM: Simulation State Persistence & Management (11-16h) - **NEW** - UX enhancement for research workflow
- 🟡 MEDIUM: AI Deception Detection Phase 2C or 2D (12-74h)
- 🟡 MEDIUM: AI-Assisted Skills (78h)
- 🟡 MEDIUM: LLM Policy Optimization Phase 5 (6-8h) - Testing only
- 🟢 LOW: P3 Enhancements (39-51h)
- 🟢 LOW: Policy Improvements (35-42h)
- 🟢 LOW: TIER 5 Features (46h)
- 🟢 LOW: Black Mirror Phase 1-2 (21-28 weeks, phased)

**Recent Completions:**
- ✅ Threshold Uncertainty Phase 1 (Oct 26, 2025) - 34-52h saved

**Related Docs:**
- `/docs/wiki/README.md` - System documentation
- `/devlogs/` - Development diary
- `/research/` - Research findings archive
- `/reviews/` - Critical research evaluations
- `/plans/completed/` - Archived completed plans

---

**Last Updated:** October 26, 2025
