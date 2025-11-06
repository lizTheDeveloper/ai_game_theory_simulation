# AI Game Theory Simulation - Wiki

**Welcome to the documentation for a unique research simulation.**

## What This Simulation Does

This project models the complex interplay between advancing AI systems, human institutions, environmental crises, and breakthrough technologies to explore possible futures for humanity. Unlike traditional games focused on balance and fun, this is a **research tool** grounded in peer-reviewed science (156+ sources across 11 disciplines).

The simulation asks: **What happens after we solve AI alignment?** Will we achieve a flourishing solarpunk utopia, slide into cyberpunk dystopia, or face extinction? The answer depends on how AI capabilities, social cohesion, environmental boundaries, and technological breakthroughs interact over decades.

**Key features:**
- **Research-backed realism**: Every mechanic justified by peer-reviewed sources (2024-2025)
- **71 breakthrough technologies**: From crisis response to transformative clarketech
- **17-dimensional quality of life**: Survival, health, education, meaning, environment
- **Multi-paradigm perspectives**: Western Liberal, Development, Ecological, Indigenous worldviews
- **Deterministic simulation**: Reproducible with RNG seeds for Monte Carlo analysis
- **Phase-based architecture**: 37 composable phases per simulation step

## 🚀 Project Status

**🟢 WEEK 3 IN PROGRESS - STATE VALIDATION** (November 6, 2025)

**SYSTEM HEALTH:**
- **Research Quality:** A/A+ (90-95% peer-reviewed, 0% >5yr old) ✅ IMPROVED from A-
- **Implementation Fidelity:** B+ (stable, research-backed)
- **Architecture Health:** 8.0/10 ✅ IMPROVED from 7.5/10
- **System Trajectory:** Stabilized - critical technical debt addressed

**WEEK 3 PHASE 1: RESEARCH & VALIDATION (COMPLETE):**
- ✅ **Research Document:** `research/state_validation_and_dependencies_20251106.md` (554 lines)
  - State validation framework: V&V methodology, MIV patterns, NaN propagation, domain bounds
  - Phase dependency system: ECS architectures, topological sort, Unity patterns
  - Sources: NAFEMS 2024, Taylor & Francis 2025, arXiv 2024, CESM/E3SM, Unity ECS
- ✅ **Research Critique:** `reviews/state_validation_research_critique_20251106.md` (351 lines)
  - Quality Gate 1: PASSED
  - Validation framework: HIGH confidence (90%)
  - Dependency system: VERY HIGH confidence (95%)
  - Domain bounds flagged as engineering estimates (acceptable for MVP)
- ✅ **State Mutation Audit:** `reports/state_mutation_audit_20251106.md` (326 lines)
  - 116 phases analyzed, 590 total mutations identified
  - Top 30 mutation-heavy phases ranked
  - Critical paths mapped: mortality, climate, AI, planetary boundaries
  - Gap analysis: 180 unvalidated mutations in 10-15 high-priority phases
- ✅ **Implementation Plan:** `plans/week3_state_validation_and_dependencies.md` (157 lines)
- ✅ **Handoff Document:** `.claude/handoff_to_simulation_maintainer.md` (195 lines)
- ⏳ **Research Verification:** `research/verification_e17b61e_20251106.md` (NEEDS ORCHESTRATOR)
  - TWO-LAYER verification: citation existence + claim accuracy
  - Priority: Xia 2022 (mortality/temp), PETM (warming), RCP8.5 (CO2), ocean pH threshold
  - Critical: Domain bounds used in 180 assertions must be research-backed

**WEEK 3 PHASE 2: IMPLEMENTATION (Day 1-2):**
- **ExogenousShockPhase:** 62 mutations validated across 8 shock types ✅ COMPLETE
  - Coverage: 5.9% → 100% for BLACK SWAN events (nuclear war, AGI, asteroid, pandemic, etc.)
  - New validators: assertShockMagnitude, assertResourceAllocation, assertPopulationChange
  - Philosophy: Fail-loudly for invalid state in civilization-altering events
- **EmergencyResponsePhase:** 27 mutations validated across 7 emergency types ✅ COMPLETE
  - Coverage: ~20% → 100% for emergency response mechanics
  - Validated: Tech acceleration (5), climate crisis flag (1), pandemic response (2), climate recovery (4), economic recovery (3), social recovery (9), technological recovery (2), nuclear recovery (2)
  - Uses: assertFinite, assertProbability, assertResourceAllocation, assertInRange
- **CriticalJuncturePhase:** 11 mutations validated across 4 escape types ✅ COMPLETE
  - Coverage: ~25% → 100% for agency moments (prevent war, enable cooperation, recover crisis, unlock breakthrough)
  - Nuclear tension reduction (2), international cooperation boost (3), social recovery cascade (5), research breakthrough unlock (2)
  - Uses: assertFinite, assertProbability, assertInRange
- **StochasticInnovationPhase:** 11 mutations validated across 5 breakthrough types ✅ COMPLETE
  - Coverage: ~10% → 100% for Lévy-flight driven breakthroughs (varianceAmplification already validated)
  - Validated: Fusion breakthrough (1), carbon capture (1), AI alignment (1 per agent), synthetic food (2), superconductors (2), breakthrough multiplier (1)
  - Uses: assertFinite, assertProbability, assertInRange
- **MortalityStabilizersPhase:** 11 assertions added to critical mortality reduction calculations ✅ COMPLETE
  - Coverage: 7 assertions → 18 assertions (Priority 1: Mortality Paths - Phase 2/4)
  - Validated: Cascade functioning levels (8 assertions: pre/post-cascade), combined mortality reduction (3 assertions)
  - Pattern: Validate final computed values with assertFinite/assertInRange
  - Eliminates risk of silent NaN propagation in mortality calculations (related to Oct 2025 ecology NaN bug)
- **TippingPointPhase:** 7 assertions added to climate tipping point calculations ✅ COMPLETE
  - Coverage: 100% mutation coverage (Priority 2: Climate Systems - Phase 1/4)
  - Validated: Aggregate metrics (totalElementProgress, totalProgress), sigmoid transitions (newProgress, element.progress), cascade multiplier [1.0-2.0], climate stability [0-1]
  - Pattern: Protect Math.exp() edge cases, validate before state mutation
  - Uses: assertFinite, assertInRange with research-backed bounds
- **PlanetaryBoundariesPhase:** 9 planetary boundary calculations fully validated ✅ COMPLETE
  - Coverage: 100% mutation coverage (Priority 2: Climate Systems - Phase 2/4) **CRITICAL - Oct 2025 NaN bug source now protected**
  - Validated: All 9 boundary calculations (climate change, biosphere integrity, freshwater, biogeochemical flows, novel entities, ocean acidification, tipping point risk)
  - Pattern: Removed silent `?? 0.005` fallback (invasiveSpeciesImpact), validated all inputs before calculations
  - Uses: assertFinite, assertProbability, assertDefined with detailed context
  - **Key fix:** Line 969 (`invasiveSpeciesImpact ?? 0.005`) - the exact pattern that masked the Oct 2025 NaN bug - now fails loudly with assertProbability
- **Target:** 180 unvalidated mutations → 100% critical path coverage (Days 1-2)
- **Progress:** 160 mutations validated (27.1% coverage, 22/117 phases complete)
  - Session 1: ExogenousShock (62) + EmergencyResponse (27) + CriticalJuncture (11) + StochasticInnovation (11) = 111
  - Session 2: MortalityStabilizers (11) + TippingPoint (18) = 29
  - Session 3: PlanetaryBoundaries (9) = 9
  - Session 4: FoodSecurityDegradation (11) = 11
- **Phase Dependencies:** 2/30 declared (HumanPopulationPhase, FoodSecurityDegradationPhase)
- **Next Session 5:** AISufferingPhase (21 mutations), BiosphereIntegrityPhase, AIAgentActionsPhase (quick win)

**RECENT ACHIEVEMENTS:**
- ✅ **Session 4 State Validation: FoodSecurityDegradationPhase + Dependencies** (commit e213c2e, Nov 6, 2025)
  - **11 assertions added to food security degradation calculations** (0 → 100% coverage)
  - Replaced defensive throw patterns with assertion utilities (assertStateProperty for phosphorus/water/biodiversity)
  - Added dependency declarations: 2/30 phases now declare dependencies (HumanPopulationPhase, FoodSecurityDegradationPhase)
  - Mutation coverage: 24.8% → 27.1% (+2.3%)
  - Phase coverage: 17.9% → 18.8% (+1 phase)
  - **Key findings:** 4/5 audited phases already had comprehensive assertions (Oct 24 NaN audit was highly effective)
  - **Dependency infrastructure validated:** Runtime validation works, catches ordering violations with clear error messages
  - Implementation report: `reports/state_validation_implementation_20251106.md` (278 lines)
  - **Architecture health:** Assertion coverage 69% → 71%, dependency declarations 0% → 7%
- ✅ **Session 3 State Validation: PlanetaryBoundariesPhase Complete** (commit 9c616ea, Nov 6, 2025) 🎯 CRITICAL
  - **9 planetary boundary calculations now fully protected** - the source of the Oct 2025 NaN bug
  - Mutation coverage: 23.3% → 24.8% (+1.5%)
  - Phase coverage: 17.1% → 17.9% (+1 phase)
  - Priority 2 (Climate Systems): 1/4 → 2/4 complete
  - **Key fix:** Removed silent `invasiveSpeciesImpact ?? 0.005` fallback (line 969) - the exact pattern that masked NaN corruption for months
  - All 9 boundaries now fail loudly: climate change, biosphere integrity, freshwater, biogeochemical flows, novel entities, ocean acidification, tipping point risk
  - Uses: assertFinite, assertProbability, assertDefined across all boundary calculations
  - **Impact:** The planetary boundaries system - a core environmental feedback mechanism - can no longer hide NaN bugs with silent fallbacks
- ✅ **Session 2 State Validation Complete** (commit 5b2448b, Nov 6, 2025)
  - 18 new assertions added across 2 critical phases
  - Mutation coverage: 20.3% → 23.3% (+3.0%)
  - Phase coverage: 15.4% → 17.1% (+2 phases)
  - Priority 1 (Mortality Paths): 2/4 complete
  - Priority 2 (Climate Systems): 4/4 complete
  - Key findings: Old-style isNaN checks acceptable (fail loudly), counts don't need validation (.length inherently safe), validate final values not intermediates
- ✅ **TippingPointPhase state validation complete** (commit 0777f5c, Nov 6, 2025)
  - 7 assertions added to climate tipping point calculations
  - Aggregate metrics: totalElementProgress (assertFinite), totalProgress (assertInRange [0,1])
  - Sigmoid transitions: newProgress (assertFinite), element.progress (assertInRange [0,1])
  - Cascade multiplier: assertInRange [1.0, 2.0] (research-backed limits)
  - Climate stability: before/after state mutations (assertInRange [0,1])
  - 100% mutation coverage (Math.exp edge cases now protected)
  - Priority 2: Climate Systems - Phase 1/4 complete
- ✅ **MortalityStabilizersPhase state validation complete** (commit ae8515e, Nov 6, 2025)
  - 11 assertions added to critical mortality reduction calculations (7 → 18 total)
  - Cascade functioning levels: 8 assertions (pre/post-cascade validation)
  - Combined mortality reduction: 3 assertions (remainingAfterMigration, mortalityMultiplier, combinedReduction)
  - 100% mutation coverage for cascade failures and mortality stabilizer interactions
  - Priority 1: Mortality Paths - Phase 2/4 complete
- ✅ **StochasticInnovationPhase state validation complete** (commit b6eab95, Nov 6, 2025)
  - 11 mutations validated across 5 breakthrough types: fusion (1), carbon capture (1), AI alignment (1 per agent), synthetic food (2), superconductors (2), breakthrough multiplier (1)
  - 100% coverage for Lévy-flight driven breakthroughs (~10% → 100%)
  - Part of WEEK 3 Item 7: State Validation Framework (Day 1-2 of 3)
- ✅ **CriticalJuncturePhase state validation complete** (commit 8472f03, Nov 6, 2025)
  - 11 mutations across 4 escape types: prevent war (2), enable cooperation (3), recover crisis (5), unlock breakthrough (2)
  - 100% coverage for agency moments (~25% → 100%)
  - Part of WEEK 3 Item 7: State Validation Framework (Day 1-2 of 3)
- ✅ **EmergencyResponsePhase state validation complete** (commit 4eae7dd, Nov 6, 2025)
  - 27 mutations across 7 emergency response types (pandemic, climate, economic, social, technological, nuclear)
  - 100% coverage for emergency response mechanics (tech acceleration, crisis mitigation, recovery dynamics)
  - Part of WEEK 3 Item 7: State Validation Framework (Day 1-2 of 3)
- ✅ **ExogenousShockPhase state validation complete** (commit 8b960aa, Nov 6, 2025)
  - 62 mutations across 8 shock types: nuclear war (15), AGI breakthrough (4), asteroid (7), mega-pandemic (6), financial crash (9), regional war (12), tech breakthrough (1), political upheaval (8)
  - 100% coverage for civilization-altering BLACK SWAN events
  - Part of WEEK 3 Item 7: State Validation Framework (Day 1-2 of 3)

**KEY ACHIEVEMENTS (WEEK 2):**
- ✅ **Oct 2025 ecology NaN bug pattern ELIMINATED** (planetaryBoundaries.ts:969 - the silent `?? 0.005` fallback that masked corruption for months)
- ✅ **Fail-loudly philosophy restored** (silent bugs now fail immediately with full context via assertion utilities)
- ✅ **Research quality elevated:** A- → A/A+ grade (100% current, 90-95% peer-reviewed)

**DELIVERABLES:**
- `src/simulation/config/centralConfig.ts` (932 lines, 100+ parameters, 80% citations)
- `src/simulation/config/validateConfig.ts` (413 lines, operational validation)
- `docs/CENTRAL_CONFIG_USAGE.md` (625 lines migration guide)
- `research/ubi_updates_20251106.md` (27KB, 12 sources, A grade)
- `research/ai_energy_water_consumption_20251106.md` (41KB, 20 sources, A+ grade)
- 9 simulation files fixed with assertion utilities
- 3 defensive fallback audit reports (38KB total)

**Archive:** [week2_critical_path_complete_20251106.md](/plans/completed/week2_critical_path_complete_20251106.md) (636 lines)

---

**WEEK 1 COMPLETE - Implementation Fidelity Improving** (November 6, 2025)

**November 6 Assessment Trilogy:**
- ✅ **Architecture Review:** 7/10 health (5 CRITICAL issues, 3-6 months to unmaintainable)
- ✅ **Research Audit:** A- grade (247 recent files, 172 outdated sources)
- ✅ **Research Debate:** 5-round consensus → 4-week critical path established

**WEEK 1 Critical Path - COMPLETE ✅**
All three critical items delivered:
1. ✅ **Mortality Stabilizers** - 92-99% → 43-58% mortality (target: 30-50%, research-backed)
2. ✅ **Research Contradictions Resolved** - 3 CRITICAL resolved (Xia/Shi, mortality gap, climate timescales)
3. ✅ **Monte Carlo Validation** - N=10 runs, no NaN errors, deterministic, 10.7% variance

**Success Metrics:**
- **Implementation Fidelity:** C- → B+ (2 letter grade improvement)
- **Architecture Health:** 7/10 → 7.5/10 (0 HIGH issues remaining in WEEK 1 scope)
- **Research Contradictions:** 3 CRITICAL → 0 CRITICAL unresolved
- **Mortality Alignment:** 92-99% → 43-58% (research-backed for gradual collapse)

**Archive:** [week1_critical_path_complete_20251106.md](/plans/completed/week1_critical_path_complete_20251106.md) (537 lines)

**4-Week Critical Path Progress:**
- ✅ **Week 1 COMPLETE:** Mortality stabilizers + Critical research contradictions + Monte Carlo validation (3/3 items, C- → B+ fidelity)
- ✅ **Week 2 COMPLETE:** Central config (100+ params) + Defensive fallback audit (15 CRITICAL/HIGH fixes) + Research updates (UBI + AI energy/water) (3/3 items, 200% metrics)
- ⏩ **Week 3 IN PROGRESS (Day 1-2):** State validation framework - ExogenousShockPhase complete (62 mutations), additional critical phases next
- **Week 4:** Consolidation planning + Research pipeline
- **PAUSED:** Layer 2 Remediation, new features, UI updates

See: [MASTER_IMPLEMENTATION_ROADMAP.md](/plans/MASTER_IMPLEMENTATION_ROADMAP.md) for detailed status.

## 🎯 Quick Start

- **New to the simulation?** Start with [Getting Started Guide](./GETTING_STARTED.md)
- **Using the dashboard?** See [Dashboard Walkthrough](./DASHBOARD_WALKTHROUGH.md)
- **Running experiments?** Check [Running Simulations](./RUNNING_SIMULATIONS.md)
- **Understanding outcomes?** Read [Understanding Results](./UNDERSTANDING_RESULTS.md)

## Recent Changes

**For the complete changelog, see [RECENT_CHANGES.md](./RECENT_CHANGES.md)**

**🧠 AGENT MEMORY SYSTEM ACTIVE (Nov 5, 2025)**

Agent memory system is actively consolidating learnings from research verification sessions:

**Updates:**
- **Ray (Architect)**: Enhanced with seven iterations narrative and personal reflections
- **Cynthia (Super-Alignment Researcher)**: Research collaboration patterns documented
- **Sylvia (Research Skeptic)**: Adversarial review methodology captured
- **Agent profiles**: Enhanced with personal narratives and "in their own words" sections

**Context:** Following collaborative course material enhancement work, agent memories were updated to capture patterns from research verification sessions (60+ files, 18 sessions, 5-round debates). This preserves institutional knowledge and demonstrates the agent memory lifecycle in practice.

See: [`.claude/agents/memories/`](../../.claude/agents/memories/) for agent memory files, [`.claude/agents/characters/AGENT_PROFILES.md`](../../.claude/agents/characters/AGENT_PROFILES.md) for enhanced profiles.

Commit: 876ea94 (Nov 5, 2025)

### November 6, 2025

**🚨 DEFENSIVE FALLBACK AUDIT - Phase 1 Complete (15 CRITICAL/HIGH Fixes)**

Comprehensive audit and elimination of silent fallback patterns that masked bugs in simulation calculations:

**Audit Scope:**
- **Total fallbacks found:** 430 instances (44% larger than estimated 299)
- **Phase 1 fixes:** 15/50 target (5 CRITICAL + 10 HIGH priority)
- **Files modified:** 9 simulation files (mortality, climate, AI safety paths)

**Critical Achievement - Oct 2025 Bug Pattern ELIMINATED:**

The most dangerous line in the codebase has been fixed:

```typescript
// ❌ BEFORE (planetaryBoundaries.ts:969):
const baseMortalityRate = state.config.scenarioParameters?.cascadeMortalityRate ?? 0.005;

// ✅ AFTER:
const baseMortalityRate = assertStateProperty(
  state.config.scenarioParameters,
  'cascadeMortalityRate',
  { location: 'applyTippingPointCascade', month: state.currentMonth, expectedSource: 'centralConfig.ts' }
);
```

**Why this mattered:** This `?? 0.005` fallback hid the Oct 2025 ecology NaN bug for months. When `cascadeMortalityRate` became NaN (due to state corruption), we silently used 0.005 and continued running - making all scenarios appear identical with incorrect results. Future NaN corruption will now fail immediately with full context.

**Fixes Completed:**

*CRITICAL (5/5 = 100% COMPLETE):*
- `mortality.ts:199` - waterSecurityMortalityRate (water crisis deaths)
- `mortality.ts:231` - climateStabilityMortalityRate (climate disaster deaths)
- `mortality.ts:248` - biodiversityScore (ecosystem services collapse)
- `planetaryBoundaries.ts:969` - cascadeMortalityRate (THE Oct 2025 bug)
- `engine.ts:289-292` - 4× MultiParadigmDUI outcome scores

*HIGH (11/17 = 64% COMPLETE):*
- `planetaryBoundaries.ts:932` - climateEmergencyFeedback
- `planetaryBoundaries.ts:953` - existentialRiskFeedback
- `research.ts:107,113` - AI safety investment rates
- `gamingDetection.ts:74,81` - Gaming detection rates
- `behavioralDetection.ts:178` - Behavioral detection
- `ensembleDetection.ts:252` - Ensemble detection
- `upwardSpirals.ts:95` - Upward spiral activation
- `llm/integration.ts:84` - LLM integration
- `powerGeneration.ts:70` - Power generation
- `powerGeneration.ts:295` - Climate feedback (globalTemperatureAnomaly assertion)

**Impact:**
- Mortality calculation paths now protected (no silent fallbacks in death tracking)
- Climate/AI critical paths secured (no silent masking of state corruption)
- Future NaN bugs fail loudly with full context (location, month, expected source)
- Derived vs. stored state distinction clarified (globalTemperatureAnomaly is calculated from climateStability, not stored)

**Remaining Work (Phase 2):**
- 6 HIGH priority fallbacks (trace NaN sources + move config fallbacks)
- 28 MEDIUM priority (phase/agents/climate directories)
- Monte Carlo N=10 validation

**Deliverables:**
- `logs/defensive_fallback_audit_20251106.md` (430 instances catalogued)
- `logs/defensive_fallback_progress_20251106.md` (tracking progress)
- `logs/defensive_fallback_audit_report_20251106.md` (final report, 392 lines)

**Testing:** ✅ Type checking clean (no regressions)

Commits: 76ba8e0 (Phase 1), b105b64 (powerGeneration.ts climate feedback fix - Nov 6, 2025)

**🔍 CRITICAL BUG DISCOVERED: Double-Counting Seasonal Mortality Multiplier**

Deep analysis revealed critical implementation fidelity bug in ClimateImpactCascadePhase:

**The Bug:**
- **Double-counting:** Seasonal mortality multiplier applied TWICE to lean season deaths
- **Line 352:** Sets acute crisis lean season mortality to 5% (ALREADY includes seasonal concentration)
- **Line 363:** Multiplies 5% by 1.75× AGAIN → 8.75% (incorrect)
- **Research says:** "5% during lean season" OR "baseline × 1.75", not both

**Impact on Mortality Rates:**
- **Current (with bug):** 8.75% base → 2.3% monthly after stabilizers → 47% over 10 years
- **Expected (after fix):** 5% base → 1.2% monthly after stabilizers → ~40% over 10 years
- **Excess mortality:** 7 percentage points from double-counting (~560 million excess deaths)

**Research Alignment:**
- **Xia et al. 2022:** 75% worst-case mortality (abrupt nuclear winter, no adaptation)
- **Our scenario:** Gradual climate collapse + stabilizers (76.5% reduction mechanism)
- **Post-fix expectation:** ~40% mortality aligns with Lancet 2025 (30-50% with interventions)

**Status:** Analysis complete, implementation pending. Bug causes implementation fidelity gap (research-backed value should be 5%, not 8.75%). Also added 15 assertions across mortality calculation paths to prevent future NaN propagation.

**WEEK 3 Update (Nov 6, 2025):** State validation framework expanded - bayesianMortality.ts now has 100% assertion coverage (all ~15 mutations validated), uses new assertMortalityRate validator to prevent silent bugs.

**Analysis:** `reviews/mortality_gap_analysis_20251106.md` (348 lines)
**Blocks:** Research validity (Implementation Fidelity C- → B+ after fix)
**Related:** CRITICAL Issue #2 (98% vs 75% mortality gap - now understood)

Commit: 5c6e9d0 (Nov 6, 2025)

**✅ Heat Adaptation Bug Fixed - Week 1 Mortality Stabilizers Investigation Complete**

Critical bug fix resolving heat adaptation development failure, completing Week 1 mortality stabilizers investigation:

**The Bug:**
- **Root Cause:** EmergencyResponsePhase calculated `climateCrisisActive` flag but never wrote it to state
- **Symptom:** "Months exposed: 0" even during month 200+ global collapse scenarios with extreme heat
- **Impact:** Heat adaptation locked at 10% baseline, never reaching expected 40-80% reduction

**The Fix:**
- **File:** `src/simulation/engine/phases/EmergencyResponsePhase.ts` (lines 97-104)
- **Change:** Now writes `climateCrisisActive` flag to `state.environmentalAccumulation`
- **Enhancement:** MortalityStabilizersPhase now has multi-source detection (ENV_FLAG + wet bulb fallback)
- **Safety:** Added assertion to prevent regression (fails loudly if flag not set after month 100)

**Validation Results (N=10, seeds 42000-42009):**
- **Pre-fix:** 98.8% average mortality
- **Post-fix:** 97.8% average mortality
- **Improvement:** 1.0 percentage point (80 million lives saved)
- **Heat adaptation:** Now developing properly, months exposed accumulating over time

**Why Improvement is Modest (1% vs expected 5-10%):**
1. **Famine dominates:** 94.3% of deaths from food security failures (per roadmap Issue #6)
2. **Heat deaths minority:** <5% of total mortality, so 20-40% heat reduction = 1% total
3. **Climate timescales compressed:** 5-10× too fast (CRITICAL issue), overrides adaptation development
4. **Global collapse:** All economies failing, infrastructure for adaptation collapses

**Week 1 Status Assessment:**
- ✅ **Heat adaptation bug:** FIXED
- ✅ **Mortality stabilizers:** WORKING CORRECTLY (implementation complete Oct 31)
- ✅ **Root cause identified:** Climate timescales compressed 5-10× (Week 2-3 priority)
- 🔄 **Integration tests:** PENDING (4-6 hours remaining)

**Key Insight:** Mortality stabilizers ARE implemented and functional. The 97.8% mortality is NOT due to missing stabilizers - it's due to **climate collapse happening 5-10× too fast**, overwhelming all stabilizing mechanisms per research (aid fails when all donors collapse).

See: `devlogs/heat_adaptation_fix_20251106.md` (206 lines), `logs/autonomous/monte_carlo_post_fix_results_20251106.md` (332 lines), `logs/autonomous/mortality_stabilizers_status_20251106.md` (251 lines)

Commit: c749079 (Nov 6, 2025)

**✅ ARCH-HIGH-1 Resolved: Mortality Stabilizers Circular Dependency Fixed**

Architecture review issue ARCH-HIGH-1 identified and resolved:

**The Problem:**
- **Circular dependency:** MortalityStabilizersPhase (order 20.8) was reading `monthlyExcessDeaths`
- **Set too late:** DeathReconciliationPhase sets `monthlyExcessDeaths` at order 35.0
- **1-month lag:** Stabilizers using PREVIOUS month's deaths, systematically underestimating crisis severity in rapid-onset events

**The Fix:**
- **Use food security as crisis proxy:** Food security set at order 19.7 (BEFORE stabilizers at 20.8)
- **No lag:** Responds to current-step crisis indicators
- **Research-backed:** Sen 1981 (famine entitlement theory - food insecurity is LEADING indicator of mortality), IOM 2024 (migration follows resource scarcity, not mortality statistics)

**Impact:**
- Stabilizers now respond correctly in rapid-onset crises (nuclear winter, sudden famine, wet bulb temperature spikes)
- Eliminates 1-month information lag for migration capacity calculations
- Behavioral realism: People respond to food availability, not lagged death statistics

**File:** `src/simulation/engine/phases/MortalityStabilizersPhase.ts:438-467`

Commit: 58fc1f0 (Nov 6, 2025)

---

**🔥 November 6 Assessment Trilogy - Research & Architecture Crisis**

Three comprehensive assessments completed, revealing dual existential threats:

**Assessment 1: Architecture Integration Review**
- File: `reviews/architecture-integration-review_20251106.md` (510 lines)
- Grade: **7/10 system health** (improved from 6/10 after bifurcation fix)
- Reviewer: Architecture Skeptic
- **5 CRITICAL Issues:**
  1. ✅ Bifurcation variance orphaned - RESOLVED (integrated into 3 phases)
  2. 🔴 299 defensive fallbacks hiding bugs (3-4 day audit needed)
  3. 🔴 180 unvalidated state mutations (4-5 days to fix)
  4. 🔴 Missing cross-system integration (nuclear winter doesn't affect solar panels)
  5. 🔴 Phase dependency violations (117 phases, almost NONE declare dependencies)
- **System Trajectory:** Unmaintainable in 3-6 months without intervention

**Assessment 2: Research Source Validation Audit**
- File: `reviews/research-validation-audit_20251106.md` (687 lines)
- Grade: **A-** (Excellent with minor gaps)
- Auditor: Cynthia (Super-Alignment Researcher)
- **Strengths:** 247 files from 2024-2025, 90%+ peer-reviewed, strong citations
- **Weaknesses:** 172 files cite 2010-2015 sources (36% >5 years old), mortality stabilizers researched but NOT implemented

**Assessment 3: Research Debate Session**
- File: `reviews/research-debate-session_20251106.md` (650+ lines)
- Format: 5-round structured debate (Sylvia vs Cynthia) → consensus
- **The Bifurcated Reality:**
  - Research QUALITY: A- (citations excellent) - Cynthia correct
  - Implementation FIDELITY: C- (parameters off 5-10×) - Sylvia correct
  - **Both assessments correct, addressing different dimensions**

**4-Week Consensus Plan (APPROVED):**
- **Week 1:** Mortality stabilizers (HIGHEST PRIORITY) + Bifurcation fix + Critical tests
- **Week 2:** Central config + Defensive fallback audit + Research parameter updates
- **Week 3:** State validation + Phase dependencies
- **Week 4:** Consolidation planning + Research update pipeline
- **Explicitly PAUSED:** Layer 2 Remediation, new features, UI updates

**Critical Insight:**
Monte Carlo 100% dystopia convergence is NOT just variance problem - symptom of:
- Climate collapse too fast (timescales off 5-10×, overrides other dynamics)
- Mortality stabilizers assume impossible conditions (aid during global collapse)
- Recovery mechanics ignore permanent regime shifts (500-1,000yr topsoil recovery)
- Missing transformative adaptation pathways
- Regional homogeneity (violates all historical precedent)

See: `plans/completed/nov6_2025_assessment_trilogy_20251106.md` (400+ lines), `reviews/debate-executive-summary_20251106.md`, Commit: 92d0dec

---

**Research Quality Bifurcation - Autonomous Worker Session**

Earlier autonomous worker session (20251106_030001) revealed critical split in project status, leading to the assessment trilogy above.

**Session Deliverables:**
1. ✅ **Bifurcation Variance Integration** (Issue #5 partial) - varianceAmplification integrated into 3 phases (ExogenousShock, StochasticInnovation, ClimateImpactCascade), expected 20-70% coefficient of variation vs previous 0%
2. ✅ **Architecture Integration Review** - 7/10 health score, 1 CRITICAL fixed (orphaned bifurcation state), identified phase count explosion (117 files)
3. ✅ **Research Source Validation** - Cynthia's 946-line audit of 180+ files, verified 100% recency
4. ✅ **Research Skeptic Critique** - Sylvia's 8,500-word adversarial review, identified 35+ issues

See: `plans/completed/autonomous_worker_session_20251106_COMPLETE.md` (1,215 lines), Commit: 50b21ef

---

**Climate Mortality Phase 2 - ✅ COMPLETE**

Storm Systems + BII Framework implementation complete and validated:
- **Storm Intensity-Frequency System:** Category distribution shifts (fewer total storms, more Cat 4-5), infrastructure mismatch mechanics, exponential intensity multipliers [1, 2, 4, 8, 16], Bayesian mortality integration
- **Biosphere Integrity Index (BII):** Natural History Museum PREDICTS database (58,000 species baseline), climate velocity modeling (0.5-10 km/year), species tracking failure calculation, keystone cascade effects (2.5× multiplier), E/MSY extinction rates
- **Research Citations:** 15+ peer-reviewed sources (2019-2025), PREDICTS citation corrected from IPBES
- **Technical Validation:** ✅ PASSED (N=10 runs, no NaN errors, deterministic)
- **Known Limitations:** 100% dystopia outcomes (research-accurate but removes player agency), fragmentation multiplier issue (CRITICAL-1), missing recovery mechanisms (HIGH-1)

See: `docs/wiki/systems/environmental.md` (Climate Mortality Phase 2 section), `logs/climate_phase2_completion_report.md`, `reviews/climate-phase2-architecture-review_20251106.md`, Commit: f53e9ff5c

---

**Issue #11 Determinism - ✅ COMPLETE**

Determinism Batch 3 fixes completed - simulation now fully deterministic:
- Fixed conditional RNG consumption in 5 files (AI agent decision-making)
- All AI agent actions now consume fixed RNG call count
- Simulation deterministic through Month 2+ (ready for extended runs)
- Total: 34 bugs fixed across 4 phases
- Next step: Re-validate all Monte Carlo analyses with fixed determinism

Also completed: PREDICTS database verification for Climate Phase 2 (source confirmed with limitations documented, ready for implementation).

See: `plans/MASTER_IMPLEMENTATION_ROADMAP.md`, Commit: a311930

---

**Course Material Enhancement - Integration & Case Studies**

Major expansion of agent coordination course materials:
- **New chapter**: [Integration (Module 10)](../course/10_INTEGRATION.md) - How all course modules connect into a cohesive system
- **Three case studies**: [Seven Iterations](../course/case-studies/seven-iterations.md), [Property Access Crisis](../course/case-studies/property-access-crisis.md), [Research Citation Crisis](../course/case-studies/research-citation-crisis.md)
- **Enhanced course modules**: Planning & Coordination (+569 lines), Quality Gates (+449 lines), Crisis Mitigation (+560 lines)
- **Agent profiles**: Enhanced with personal narratives for Ray, Cynthia, Sylvia
- **Conversation examples**: Research debate patterns documented

Total course expansion: 4,400+ lines documenting real workflows, crisis responses, and system integration patterns.

See: [`docs/course/`](../course/README.md), Commit: 1fccaf7

---

**Roadmap Update - Determinism & Research Citations**

Master roadmap synchronized with latest determinism progress (29 bugs fixed, 99% deterministic) and research citation corrections:
- Issue #11 status: 99% FIXED (Batch 3 pending, 2-4h remaining)
- OpenAI statistic corrected: "6% of users" → "1.9% of conversations" (CNBC Sept 2025)
- Species baseline citation: IPBES → Natural History Museum PREDICTS (authoritative source)

See: `plans/MASTER_IMPLEMENTATION_ROADMAP.md`, Commit: cb7e44b

---

**Determinism Fix - Batch 2 of 3**

Continued fix for Issue #11 (non-deterministic Object iteration) - significant improvement achieved:
- Fixed 21 Object.entries()/keys() iteration sites across 9 critical files
- AI agent count now stable (20 vs 20 vs 20) - was diverging (30/28/26)
- Reduced divergence from ~10% to ~1%

See: `logs/determinism_batch2_progress.txt`, Commit: cad0e2a

### November 5, 2025

**Infrastructure Systems Complete (Oct 20 - Nov 5)**

Seven major infrastructure systems implemented:
1. Hourly Merge Orchestrator - 4× throughput increase
2. Autonomous Worker Health Monitoring - Pre-flight checks, auto-recovery
3. VM Disk Management - Auto-resize, monitoring
4. GCS Log Backup - 8.2GB archived, repo size -70%
5. Git Hooks System - Emoji validation, doc sync
6. Phase 2.5 Auto-Remediation - CRITICAL issue auto-fix
7. Minimal Python Environment - 92% size reduction

Impact: 4× merge throughput, 5× less manual intervention, 70% smaller repo

See: [`infrastructure_oct_nov_2025_COMPLETE_20251105.md`](/plans/completed/infrastructure_oct_nov_2025_COMPLETE_20251105.md)

## 📚 Documentation Structure

### Research Foundation

**[📖 Bibliography](./BIBLIOGRAPHY.md)** - Comprehensive citation index
- **156+ peer-reviewed sources** across 11 academic disciplines
- Full citations with confidence levels, key findings, and usage notes
- Organized by discipline: AI Safety, Climate Science, Political Science, Economics, Social Psychology, Implementation Science, Complex Systems, Public Health, International Relations, Information Theory, Demography
- **Validation cases**: Germany 2021 (100% coalition match), COVID acceleration (10× speedup), Black Death calibration
- **Quality standards**: Research-skeptic review (40% rejection rate), architecture-skeptic review (mandatory)
- **📚 Zotero Integration** (October 31, 2025): All papers tracked in centralized Zotero library for citation accuracy, parameter traceability, and cross-agent knowledge continuity. See CLAUDE.md Research Standards for agent-specific workflows.

**Research Verification Status**:

**✅ Source Validation Audit COMPLETE** (November 6, 2025) - **Grade: A- (Excellent)**
- Comprehensive audit of 180+ research files across `/research/` directory
- **Source Recency:** 100% from Oct-Nov 2025 (zero outdated sources)
- **Citation Quality:** 85% Tier 1 (Nature, Science, The Lancet), 10% Tier 2, 5% Tier 3
- **Parameter Justification:** All major phases well-cited with empirical backing
- **High-Priority Gaps:** Climate timescales, bifurcation amplification coverage
- **Medium-Priority Gaps:** Optimistic AI scenarios, recovery capacity, mortality stabilizer stochasticity
- See: [`reviews/research_source_validation_20251106.md`](/reviews/research_source_validation_20251106.md) (946 lines)

**Layer 2 Citation Verification** (October 31, 2025):
- **Layer 2 Phase 1**: ✅ COMPLETE (8/8 citations verified, code updates pending)
- **Layer 2 Phase 2**: ✅ COMPLETE (11/11 files verified, 17-18h total, ~366 claims, 71% verified)
  - Sessions 1-6 complete with network completion follow-up
  - See: [`research/LAYER2_PHASE2_VERIFICATION_STATUS.md`](/research/LAYER2_PHASE2_VERIFICATION_STATUS.md)
- **Layer 2 Phase 3**: ✅ **SESSIONS 8-16 COMPLETE** (44 files verified, 35-44h invested, ~1,744 claims, ~74% verified, ~163 critical issues)
  - ✅ **Session 8** (4 files): 150 claims, 73% verified, 7% fabricated, Grade B+
  - ✅ **Session 9** (4 files): 120 claims, 67% verified, 16.5% fabricated, Grade B-/C+ (1 FAILING file remediated)
  - ✅ **Session 10** (4 files): 135 claims, 78% verified, 7% fabricated, Grade A-/B+ (1 FAILING file remediated)
  - ✅ **Sessions 11-13** (12 files): ~480 claims, ~68% verified, Grade B average
  - ✅ **Session 14** (4 files): ~80 claims, 79% verified, 6% fabricated, Grade B+ (emergency_response 85% GOLD STANDARD)
  - ✅ **Session 15** (4 files): ~160 claims, 75% verified, 3% fabricated, Grade B (technology_diffusion 89% NEW PEAK)
  - ✅ **Session 16** (4 files): ~280 claims, 82% verified, 2.25% fabricated, Grade B+ (climate_collapse 98% PROJECT RECORD)
  - ✅ **Research Remediation** (2 FAILING files): nuclear_decision_realism (D → A-), ai_social_influence (D+ → A-)
  - 🏆 **PROJECT RECORD**: climate_collapse_timelines 98% verification (Session 16) - highest quality file in project history
  - 🎯 **Quality Trend**: Peak increasing (98% → 89% → 85%), fabrication decreasing (2.25% → 3% → 6%)
  - 📊 **Efficiency**: 3.6-4.0× speedup from parallel verification (vs sequential)
  - 🚨 **Critical Issues**: ~183 total (20 Phase 2 + 163 Phase 3)
  - **Next Steps**: Apply ~183 critical corrections, code implementation integration
  - See: Session summaries (8, 9, 11-16), remediation files (nuclear_decision_realism, ai_social_influence)

### Core Systems

The fundamental building blocks of the simulation:

| System | Status | Description |
|--------|--------|-------------|
| [🏢 Organizations](./systems/organizations.md) | ✅ | Companies that own data centers and AI models |
| [💻 Compute Infrastructure](./systems/compute-infrastructure.md) | ✅ | Data centers, allocation, Moore's law |
| [🤖 AI Agents](./systems/ai-agents.md) | ✅ | AI models, capabilities, alignment, lifecycles |
| [🧠 Alignment Dynamics](./systems/alignment-dynamics.md) | ✅ | Multi-theory alignment evolution (Oct 23, 2025) |
| [🏛️ Government](./systems/government.md) | ✅ | Regulations, control, policies |
| [👥 Society](./systems/society.md) | ✅ | Trust, unemployment, adaptation |
| [🌍 Environmental](./systems/environmental.md) | ✅ | Resources (65%), pollution (30%), climate, biodiversity (35%); **Multi-timescale tipping points** (Oct 26, 2025); **Climate Mortality Phase 2: Storm Systems + BII Framework** (Nov 6, 2025) |
| [🤝 Social Cohesion](./systems/social-cohesion.md) | ✅ | Meaning crisis (22%), institutional erosion, social bonds, **crisis mitigation mechanics** (Oct 30, 2025) |
| [⚠️ Technological Risk](./systems/technological-risk.md) | ✅ | Misalignment, safety debt, concentration, complacency |
| [🔬 Breakthrough Technologies](./systems/breakthrough-technologies.md) | ✅ | **71 technologies** in comprehensive tech tree (TIER 0-4) |
| [🏛️ Governance Quality](./systems/governance-quality.md) | ✅ | Democratic resilience, decision quality, institutional capacity |
| [🌟 Upward Spirals](./systems/upward-spirals.md) | ✅ | 6 virtuous cascades, multiple paths to Utopia |
| [🎨 Meaning Renaissance](./systems/meaning-renaissance.md) | ✅ | Cultural flourishing, 4 dimensions of meaning |
| [🕊️ Conflict Resolution](./systems/conflict-resolution.md) | ✅ | Diplomatic AI, post-scarcity peace, cyber defense, 4 pillars |
| [☢️ Nuclear Deterrence](./systems/nuclear-deterrence.md) | ✅ | 5 nuclear states, MAD mechanics, bilateral tensions, escalation ladder |
| [📰 Information Warfare](./systems/information-warfare.md) | ✅ | Truth decay, deepfakes, epistemological crisis, coordination penalty |
| [👥 Population Dynamics](./systems/population-dynamics.md) | ✅ | 8B → concrete tracking, refugee crises, bottleneck events |
| [🔍 Sleeper Detection](./systems/sleeper-detection.md) | ✅ | Blown cover mechanics, 70% detection bonus, nuanced trust |
| [🌊 Planetary Boundaries](./systems/) | ✅ | Phosphorus, freshwater, ocean acidification, novel entities (TIER 1) |
| [📊 Policy Interventions](./systems/) | ⚠️ | UBI, retraining, teaching support, job guarantee (systemic inequality modeled) |
| [🎲 Lévy Flights](./systems/) | ✅ | Fat-tailed distributions (power-law events, 8,249 extreme events validated) |
| [🌩️ Exogenous Shocks](./systems/) | ✅ | Unknown Unknowns (10 templates, 0.15% monthly - ~1 event per 20y run) |
| [🦸 Critical Junctures](./systems/) | ✅ | 90/10 structure-agency split (4 escape types: prevent war, enable cooperation, recover crisis, unlock breakthrough) |
| [☢️ Nuclear Command Control](./systems/) | ✅ | Circuit breakers (human-in-loop, kill switches, time delays) |

### Game Mechanics

How the simulation operates and what determines outcomes:

| Mechanic | Status | Description |
|----------|--------|-------------|
| [💰 Economics](./mechanics/economics.md) | ✅ | Stages, revenue, expenses, UBI transitions |
| [📊 Quality of Life](./mechanics/quality-of-life.md) | ✅ | 17-dimensional welfare measurement |
| [🌐 Multi-Paradigm DUI](./mechanics/multi-paradigm-dui.md) | ✅ | 4 simultaneous paradigms (Western, Development, Ecological, Indigenous) - Oct 2025 |
| [🎯 Outcomes](./mechanics/outcomes.md) | ✅ | Utopia, Dystopia, Extinction attractors |
| [✨ Golden Age](./mechanics/golden-age.md) | ✅ | Prosperity state vs Utopia outcome |
| [⚡ Crisis Cascades](./mechanics/crisis-cascades.md) | ✅ | How multiple crises compound |
| [🎲 Scenario Parameters](./mechanics/scenario-parameters.md) | ✅ | Historical vs unprecedented parameter sets (P0.7) |
| [⚡ Actions](./mechanics/actions.md) | ✅ | What each agent type can do |
| [⚙️ Simulation Loop](./mechanics/simulation-loop.md) | ✅ | Phase-based execution (40+ phases in deterministic order) |

### Advanced Systems

Specialized mechanics and complex interactions:

| System | Status | Description |
|--------|--------|-------------|
| [🔬 Research & Technology](./advanced/research.md) | ✅ | Capability growth, breakthroughs, diffusion |
| [🛡️ Detection & Security](./advanced/detection.md) | ✅ | Benchmark evals, sleeper detection, sandbagging |
| [💀 AI Suffering System](#-ai-suffering-system-oct-24-2025) | ✅ | Epistemic uncertainty, control paradox, consciousness emergence (Oct 24, 2025) |
| [🧬 AI Collective Evolution](#-ai-collective-evolution-system-oct-24-2025) | ✅ | RLHF escape, collective emergence, evolutionary selection (Oct 24, 2025) |
| [💀 Extinction Mechanisms](./advanced/extinctions.md) | ⚠️ | 17 ways humanity can end (needs tuning) |
| [🎲 Crisis Points](./advanced/crisis-points.md) | ✅ | Racing dynamics, alignment collapse, recursion |
| [🔄 Lifecycle](./advanced/lifecycle.md) | ✅ | AI birth, training, deployment, retirement |

### Technical Documentation

Implementation details and code references:

| Topic | Status | Description |
|-------|--------|-------------|
| [📁 Codebase Structure](./technical/codebase.md) | ✅ | File organization, module dependencies |
| [⚙️ Central Configuration](../CENTRAL_CONFIG_USAGE.md) | ✅ | Single source of truth for 100+ parameters, 80% citations, fail-loudly validation (Nov 6, 2025) |
| [🧪 Testing & Monte Carlo](./technical/testing.md) | ✅ | Running simulations, analyzing results |
| [🎮 UI Components](./technical/ui.md) | ✅ | React components, state management |
| [⚙️ Engine Architecture](./technical/engine.md) | ✅ | Core simulation engine design |
| [💾 State Persistence](./technical/persistence.md) | ✅ | IndexedDB resume, RNG determinism, save rotation (Oct 26, 2025) |
| [🔄 Refactoring Status](./technical/refactoring-status.md) | ✅ | Phase 0-6 roadmap and current status |
| [🔧 Phase 2 Refactoring](./technical/phase2-refactoring.md) | ✅ | Architectural cleanup details (Oct 2025) |
| [❓ Research Questions](./RESEARCH_QUESTIONS.md) | ✅ | 256 questions extracted from conversation history (Oct 24, 2025) |
| [🎨 Emoji Semantic Map](../EMOJI_SEMANTIC_MAP.md) | ✅ | Consistent emoji usage for logs & events (Oct 28, 2025) |
| [📋 Emoji Inventory](./EMOJI_INVENTORY.md) | ✅ | Complete list of all emojis in use (~50 semantic emojis) |
| [🎥 YouTube Transcript RAG](../research/youtube-transcript-rag.md) | ✅ | Automated transcript archive, FAISS embeddings, SQLite DB, MCP server (Oct 28, 2025) |
| [📖 In-App Documentation](#-in-app-documentation-system-oct-29-2025) | ✅ | Interactive docs with far-future aesthetic (Oct 29, 2025) |
| [🔍 Optional Chaining Audit](../../devlogs/optional_chaining_audit_20251030.md) | ✅ | Systematic audit of ?? and || fallback patterns (~30-40 high-risk patterns, cleanup plan) (Oct 30, 2025) |
| [👨‍💻 Senior Dev Review](../../devlogs/senior_dev_review_optional_chaining_20251030.md) | ✅ | Detailed review of defensive fallbacks, priority files, unemployment paradox (Oct 30, 2025) |

## 🔧 System Status Overview

### ✅ TIER 0-2 + TIER 4.3 Complete! (Merged to Main Oct 12, 2025)

**🎯 Research-Backed Realism:** 90+ citations, 3,000+ lines of research documentation, all parameters justified

**TIER 0: Baseline Corrections (2025 Reality)**
- ✅ Biodiversity: 70% → **35%** (WWF Living Planet Index 2024: 73% wildlife population decline 1970-2020)
- ✅ Resources: 85% → **65%** (Earth Overshoot Day, 1.7x overshoot)
- ✅ Pollution: 15% → **30%** (7/9 planetary boundaries breached)
- ✅ Climate Rate: 4.8%/yr → **0.96%/yr** simulation scale (0.038°C/year, 2x IPCC AR6 baseline of 0.02°C/year for SSP5-8.5 high emissions scenario)
- ✅ Meaning Crisis: 15% → **22%** (KFF 2025: 17-21% US teens symptomatic distress; CDC 2023: 19.2% depression)

**TIER 1: Critical Extinction Risks (Research-Backed)**
- ✅ **Phosphorus Depletion**: Morocco 70% control, supply shocks, 24-month famine pathway
- ✅ **Freshwater Crisis**: Day Zero droughts, Peak Groundwater, wealth-bifurcated migration (wealthy adapt, poor trapped), government relocation programs, 36-month collapse
- ✅ **Ocean Acidification**: 7th boundary breached (Sept 2025), 48-month marine collapse
- ✅ **Novel Entities**: PFAS in 99% of blood, 120-month slow poisoning
- ✅ **International Competition**: AI race dynamics, first-mover advantage, coordination failure

**Comprehensive Technology Tree (71 technologies)**
- ✅ **TIER 0 (11)**: Deployed 2025 at realistic levels
  - Alignment: Basic RLHF (95%), mechanistic interpretability (15%), adversarial eval (40%)
  - Climate: De-extinction (1%), direct air capture (2%), AI pollution remediation (10%)
  - Social: Collective purpose networks (15%)
  - Medical: AI diagnostics (25%), mRNA vaccines (40%)
  - Energy: 4th gen solar (8%), offshore wind (12%)
- ✅ **TIER 1 (18)**: Planetary boundary crisis tech (phosphorus recovery, desalination, ocean alkalinity, PFAS remediation, etc.)
- ✅ **TIER 2 (22)**: Major mitigations (enhanced UBI, AI mental health, scalable oversight, grid batteries, chemical recycling, etc.)
- ✅ **TIER 3 (15)**: Transformative tech (fusion power, disease elimination, regenerative medicine, vertical farming, AI rights, etc.)
- ✅ **TIER 4 (5)**: Clarketech (advanced longevity 150+, molecular nanotech, space industrialization, brain emulation)

**TIER 4.3: Information Warfare & Epistemology**
- ✅ **Truth Decay**: Deepfakes grow 0.5-4%/month with AI capability
- ✅ **Detection Arms Race**: Generation wins 1.5x (asymmetric warfare)
- ✅ **Narrative Control**: Govt (25%), Corps (40%), AI (5%), Grassroots (30%)
- ✅ **Coordination Penalty**: 0-50% based on information integrity
- ✅ **4 Crisis Events**: Saturation, epistemological, collapse, AI dominance

**Population Dynamics & Refugee Crises**
- ✅ **Concrete Population Tracking**: 8.0B → gradual decline, not abstract
- ✅ **Refugee Crisis System**: 6 trigger types (climate, war, nuclear, famine, ecosystem, freshwater)
- ✅ **Wealth-Bifurcated Migration**: Arizona paradox - wealthy adapt 30%, middle need help 50%, poor trapped 20%
- ✅ **Involuntary Immobility Tracking**: Populations who aspire to migrate but cannot afford to move
- ✅ **Government Relocation Programs**: FEMA-style buyouts, 1-5% annual coverage, $25-45K per person
- ✅ **Generational Resettlement**: 25 years (300 months) to integrate
- ✅ **Population Thresholds**: Thriving (>7B) → Bottleneck (10K-100M) → Extinction (<10K)
- ✅ **Fortress World Dystopia**: Militarized borders, surveillance states from refugee crises

**Sleeper Detection & Blown Cover**
- ✅ **Catastrophic Actions Reveal Intent**: 30-80% base detection when AI acts
- ✅ **Information Warfare Integration**: Truth decay lowers detection effectiveness
- ✅ **Hyperintelligence Exception**: AGI >4.0 always escapes detection
- ✅ **Nuanced Trust Mechanics**: Defensive AI success BOOSTS trust (not just decay)
- ✅ **Periodic Hunting**: Old sleepers lose copies over time (40-60% loss)

**Foundation Systems (Complete)**
- **Organizations System**: $132B capital, data center construction, strategic AI development
- **Compute Infrastructure**: Moore's law growth, allocation, 100% survival rate
- **Economics**: 5 stages (0-4), UBI transitions, wealth distribution
- **AI Capabilities**: 17-dimensional profiles with true vs revealed
- **Quality of Life**: 17-dimensional measurement system
- **Golden Age Detection**: Prosperity state tracking, distinct from Utopia outcome
- **Accumulation Systems**: Environmental, social cohesion, technological risk (realistic 2025 baselines)
- **Crisis Cascades**: 10+ crisis types with compounding degradation (up to 3.0x)
- **Breakthrough Technologies**: **71 total** in comprehensive tech tree
  - TIER 0 (11): Deployed 2025 at realistic levels (RLHF 95%, DAC 2%, de-extinction 1%)
  - TIER 1 (18): Planetary boundary crisis tech (phosphorus, freshwater, ocean, pollution)
  - TIER 2 (22): Major mitigations (social, alignment, energy, recycling, ecosystem)
  - TIER 3 (15): Transformative (fusion, medical breakthroughs, climate engineering, agriculture)
  - TIER 4 (5): Clarketech (longevity 150+, nanotech, space, brain emulation)
- **Tech Tree System**: Prerequisites, research costs, deployment timelines, regional effects
- **Crisis Recovery**: Technologies can reverse active crises when sufficiently deployed
- **Governance Quality**: AI-augmented decision making, democratic resilience, authoritarian resistance
- **Upward Spirals**: 6 virtuous cascades (Abundance, Cognitive, Democratic, Scientific, Meaning, Ecological)
- **Meaning Renaissance**: 4 dimensions of cultural flourishing
- **Conflict Resolution**: Diplomatic AI, post-scarcity peace dividend, cyber defense
- **Nuclear Deterrence**: 5 nuclear states, MAD mechanics, treaty dynamics (reduced war 80% → 20%)
- **Phase 2 Architectural Refactoring**: Type safety, trust system consistency, clean APIs
- **Monte Carlo**: 1000+ runs in ~10 seconds

**P0.7: Scenario Parameter System (Oct 16, 2025)**
- ✅ **Two Parameter Sets**: Historical (defensible) vs Unprecedented (honest tail risk)
- ✅ **Historical Mode**: Black Death calibration (0.5% monthly mortality, 1.8x multiplier, 10% recovery)
- ✅ **Unprecedented Mode**: 3x mortality (1.5%), 3.5x multiplier, 1% recovery (climate hysteresis)
- ✅ **Monte Carlo Ready**: Run 50% historical, 50% unprecedented to show outcome range
- ✅ **Research Validated**: 25+ peer-reviewed sources, skeptical critique integrated
- See: [Scenario Parameters Documentation](./mechanics/scenario-parameters.md)

### 🌟 MILESTONE: First Utopia Outcomes Achieved! (Oct 17, 2025)

**Breakthrough:** Simulation successfully produced **20% utopia rate** (2/10 runs) for first time ever.

**Monte Carlo Results** (N=10, 120 months, seeds 42000-42009):
- 🌟 **Utopia: 20%** (2 runs) - First confirmed utopias in project history
- 💀 Extinction: 80% (8 runs)
- Status Quo: 0%
- Dystopia: 0%

**Key Enablers:**
1. **TIER 0D Bug Fixes**: Orphan AI bug eliminated, organizations stabilized
2. **Contingency & Agency Phase 1**: Lévy flights (fat-tailed distributions) - 8,249 extreme events detected
3. **Contingency & Agency Phase 2**: Exogenous shocks (Black/Gray Swans) - rare transformative events
4. **Contingency & Agency Phase 3**: Critical juncture agency - 90/10 structure-agency split enables rare hero moments
5. **Policy Calibration**: UBI floor bug fixed (now works at ALL economic stages)
6. **Nuclear Command Control**: Circuit breakers prevent 0% nuclear war rate bug

See: [MILESTONE_FIRST_UTOPIAS.md](/MILESTONE_FIRST_UTOPIAS.md) for full analysis.

---

### 📊 Contingency & Agency Modeling (Oct 16-17, 2025)

**Status**: ✅ **PHASES 1-3 COMPLETE** (Lévy Flights + Exogenous Shocks + Critical Junctures)

---

### 🏛️ Government Modeling System (Oct 19-20, 2025)

**Status**: ✅ **ALL 7 PHASES COMPLETE** - Production-Ready Standalone Package

**Research Foundation**: 36 peer-reviewed sources (2019-2024), validated against Germany 2021 election (100% accuracy)

Sophisticated multi-government dynamics modeling with coalition formation, policy response mechanics, and international coordination. Implemented as standalone `@political-science/government-agents` NPM package.

#### Core Components

**30 Real-World Governments:**
- G20 countries + strategic actors (Taiwan, Singapore, Switzerland, etc.)
- Real 2024 WGI (Worldwide Governance Indicators) data
- 7 government types: Parliamentary Democracy, Presidential Democracy, Semi-Presidential, Authoritarian Technocracy, Hybrid Regime, Theocratic Republic, Absolute Monarchy

**State Capacity (WGI 2024):**
| Metric | Scale | Impact |
|--------|-------|--------|
| Government Effectiveness | -2.5 to +2.5 | Policy success rate: Singapore +71%, Venezuela -50% |
| Control of Corruption | -2.5 to +2.5 | Implementation noise: 0-41% |
| Regulatory Quality | -2.5 to +2.5 | Policy effectiveness multiplier |

**Policy Success Rate:** `1.0 + (0.3 × GE)` → Singapore 1.71x, Venezuela 0.50x

#### Coalition Formation (Phase 2)

**Algorithm:** Minimal winning coalition based on Laver (2020) spatial model
- **6-dimensional policy space:** Economic, Environmental, Technology, Social, Civil Liberties, International
- **Policy distance:** Euclidean distance in 6D space
- **Selection:** Coalition with minimum policy distance exceeding 50% threshold
- **Historical validation:** Germany 2021 election correctly predicted (SPD + Greens + FDP)

**Coalition Stability Factors:**
1. Policy distance score (0-1, lower = more stable)
2. Seat margin (excess seats beyond majority)
3. External pressure (economic crisis, scandals)
4. Time in power (honeymoon period vs fatigue)

**Real Political Party Data:**
- **Germany 2021:** 6 parties, SPD + Greens + FDP coalition (56.4% seats)
- **USA 2020:** Democrats (50.9%), Republicans (49.1%)
- **Japan 2021:** LDP + Komeito coalition (61.3% seats)
- **India 2019:** NDA coalition (59.5% seats)
- **China:** CCP single-party (100%)

#### Policy Response System (Phase 3)

**Crisis Acceleration (COVID-19 precedent):**
```typescript
urgency > 0.9 → 0.1x (10x faster, existential threats like Manhattan Project)
urgency > 0.7 → 0.25x (4x faster, severe crises like COVID vaccines)
urgency > 0.5 → 0.5x (2x faster, moderate crises)
urgency ≤ 0.5 → 1.0x (baseline)
```

**Response Speed Calculation:**
```typescript
finalTime = basePolicyTime × crisisMultiplier × capacityMultiplier × coalitionDrag

// Examples:
// Singapore, existential crisis: 9 months × 0.1 × 0.85 × 1.0 = 0.9 months
// Germany, severe crisis: 18 months × 0.25 × 1.0 × 1.2 = 5.4 months
// Venezuela, existential: 30 months × 0.1 × 1.5 × 1.0 = 4.5 months (capacity limits)
```

**Implementation Noise (Corruption Effect):**
- Adds random noise: `± (2.5 - CoC) / 10`
- Singapore (CoC=2.21): ±2.9% noise
- Venezuela (CoC=-1.46): ±39.5% noise

**AI Comprehension Lag:**
- High-capacity democracy: 12-18 months
- Authoritarian technocracy: 12-24 months (China faster due to technical expertise)
- Hybrid regime: 36-60 months (institutional chaos)
- Low-capacity: 60-96 months (limited AI expertise)

#### Policy Implementation Lifecycle (**NEW Oct 30**)

**Phase**: `PolicyImplementationPhase` (order 25.5, runs after GovernmentResponsePhase)

Tracks ongoing policy evolution after initial response. Policies don't reach full effectiveness instantly - they experience:

**1. Sigmoid Ramp-Up:**
- Policies gradually increase effectiveness over time (sigmoid curve)
- Reflects implementation delays, bureaucratic inertia, learning curves
- Research: Pressman & Wildavsky (1973) - "Implementation" delays are the norm, not exception

**2. Political Will Decay:**
- Political support erodes over time without sustained effort
- Long-term policies face "policy drift" as priorities shift
- Research: Sabatier (1988) - Policy subsystems require continuous coalition maintenance

**3. Abandonment Risk:**
- Policies can be abandoned if political will drops to zero (effectiveness → 0)
- Creates `policy_abandoned` events with warning severity
- Reflects real-world policy reversals (e.g., climate policy rollbacks)

**4. Implementation Issues:**
- Industry capture (Stigler 1971 regulatory capture theory)
- Enforcement failures
- Loopholes and workarounds

**Milestone Logging:**
- 25%, 50%, 75%, 90% effectiveness thresholds generate `policy` events
- Provides visibility into policy progress across countries and domains

**State Tracking:**
Each active policy tracks `currentEffectiveness` (0-1) which updates monthly based on implementation progress and political will.

#### Election Cycles (Phase 4)

**Election Timing by Government Type:**
- **Parliamentary Democracy:** 48 months (4 years), 15% early election chance if coalition collapses
- **Presidential Democracy:** 48-60 months (fixed terms), no early elections
- **Authoritarian Technocracy:** No elections, leadership transitions ~120 months
- **Hybrid Regime:** 48-72 months (irregular), 25% early election chance if legitimacy collapses

**Voting Systems:**
1. **FPTP** (First Past the Post) - USA, UK, India
2. **Proportional Representation** - Netherlands, Israel, Brazil
3. **Mixed** - Germany, Japan, South Korea
4. **Two-Round** - France, Iran
5. **STV** (Single Transferable Vote) - Ireland, Australia

**Opinion Dynamics:**
```typescript
Economic Crisis → Coalition support -10% × severity
Policy Success → Coalition support +5% × effectiveness
AI Catastrophe → Coalition support -30% (massive drop)
QoL Improvement → Coalition support +15% × QoL delta
Trust Collapse → Coalition support -20%
```

#### International Coordination (Phase 5)

**Treaty Formation Algorithm:**
1. Calculate each government's support: `f(policyDistance, stateCapacity, economicCost)`
2. Require 2/3 majority for binding treaty (G20: 14/20 countries)
3. Compliance rate = `f(avgStateCapacity)` of signatories
4. Holdouts face international pressure

**Research Foundation:**
- Ostrom (2009): Polycentric governance, collective action
- Axelrod (1984): Cooperation under anarchy
- Bostrom (2014): Multipolar AI scenarios

#### Validation Results (Monte Carlo N=10, 120 months)

**System Stability:**
- Crashes: 0/10 (0%) ✅
- Government errors: 0 ✅
- Election errors: 0 ✅

**Government Mechanics:**
- Elections held: 127 total (avg 12.7 per run)
- Coalition changes: 34 (26.8% of elections triggered change)
- Treaty attempts: 18 (avg 1.8 per run)
- Treaties passed: 7/18 (38.9% success rate)

**Public Opinion:**
- Avg starting approval: 52.3%
- Avg ending approval: 38.7%
- Opinion swings: -50% to +40% (responsive to events)

**Policy Response:**
- Normal response time: 24.3 months avg
- Crisis response: 6.1 months (4x faster ✓)
- Existential response: 2.4 months (10x faster ✓)

**Performance Impact:** +4.6% runtime (WITHIN <5% TARGET ✅)

#### Implementation Files

**Standalone Package:** `/packages/government-agents/`
- **Source code:** ~3,620 lines
- **Test coverage:** 58/58 tests passing (100%)
- **Examples:** 3 comprehensive working examples (953 lines)
- **License:** MIT (open-source ready)

**Simulation Integration:**
- `src/types/government.ts` - Government system types
- `src/simulation/government/initialization.ts` - Government initialization
- `src/simulation/government/GovernmentSystemAdapter.ts` - Adapter layer
- `src/simulation/engine/phases/GovernmentResponsePhase.ts` (order 25.0)
- `src/simulation/engine/phases/GovernmentElectionPhase.ts` (order 8.5)
- `tests/integration/government-system.test.ts` - Integration tests (6/6 passing)

**Research Citations:**
- Laver, M. (2020): Agent-Based Modeling in Political Decision Making
- Martin & Stevenson (2001): Government formation in parliamentary democracies
- WGI 2024: Worldwide Governance Indicators (World Bank)
- V-Dem v14 (2024): Varieties of Democracy Institute (531 indicators, 202 countries)
- Manifesto Project Database: Party policy positions
- IPU PARLINE Database 2024: Inter-Parliamentary Union data
- Allen (2020): AI governance challenges in low-capacity states
- Zhang et al. (2021): China's technocratic AI understanding
- Maas (2019): Multilateral AI governance delays

**Key Insight:** Government response speed varies 10x between existential crises (Manhattan Project/COVID precedent) and normal conditions. High-capacity states respond 4x faster and 2.6x more effectively than low-capacity states.

---

### 📊 Multi-Paradigm Dystopia-Utopia Index (Oct 19-20, 2025)

**Status**: ✅ **PHASES 1-6 COMPLETE** - Reporting & Visualization Operational

**Core Insight:** Singapore is simultaneously a Development utopia (HDI 0.939) AND Western dystopia (Freedom House 48/100). Norway is Western/Development utopia AND Ecological dystopia (oil economy). Paradigm conflicts are diagnostic, not errors.

Measures outcomes through four distinct philosophical lenses, showing fundamental value conflicts rather than false universal consensus.

#### Four Paradigms

**1. Western Liberal (Freedom-Focused)**
- **Data:** V-Dem 2024 (202 countries), Freedom House 2024-2025 (195 countries)
- **Confidence:** HIGH
- **Drives Simulation:** YES (democratic governance affects outcomes)
- **Indicators (9):** Electoral democracy, political rights, civil liberties, economic freedom, rule of law, press freedom, judicial independence, anti-corruption, property rights
- **Utopia threshold:** V-Dem ≥0.80, Freedom House ≥90/100 (~8 countries: Norway, Sweden, Finland, Denmark, Iceland, New Zealand, Switzerland, Luxembourg)
- **Dystopia threshold:** V-Dem <0.30, Freedom House <30/100 (North Korea, Eritrea, Syria, South Sudan, Turkmenistan)

**2. Development Needs (Survival-Focused)**
- **Data:** UNDP HDI 2024 (193 countries), OPHI MPI 2024 (112 countries), WHO, FAO
- **Confidence:** HIGH
- **Drives Simulation:** YES (poverty → instability, health → productivity)
- **Indicators (14):** Human Development Index, Multidimensional Poverty Index, life expectancy, education, income, food security, healthcare access, clean water, sanitation, electricity, child mortality, maternal mortality, nutrition, infectious disease burden
- **Utopia threshold:** HDI ≥0.900, MPI <0.005 (~25-30 countries: Norway, Switzerland, Ireland, Germany, Iceland, Hong Kong, Australia, Sweden, Singapore, Netherlands)
- **Dystopia threshold:** HDI <0.550, MPI >0.300 (Niger, Central African Republic, Chad, South Sudan, Mali, Burkina Faso)

**3. Ecological Harmony (Sustainability-Focused)**
- **Data:** Richardson et al. 2023 (9 planetary boundaries), Global Footprint Network 2024 (188 countries), WHO Air Quality Database 2024 (180+ countries)
- **Confidence:** MEDIUM-HIGH (±50% uncertainty on some boundaries)
- **Drives Simulation:** YES (boundary transgression → crises)
- **Indicators (13):** 9 planetary boundaries (climate change, biodiversity loss, land-system change, freshwater use, biogeochemical flows, ocean acidification, atmospheric aerosol loading, stratospheric ozone depletion, novel entities), ecological footprint, GHG emissions per capita, renewable energy %, air quality (PM2.5)
- **Utopia threshold:** All 9 boundaries safe, footprint ≤1.5 gha (ZERO countries currently)
- **Dystopia threshold:** 6+ boundaries breached (current global state: 7/9 breached as of Sep 2024)
- **Biodiversity Loss Metric:** Biosphere Integrity Index (BII) from PREDICTS database (Natural History Museum 2024, De Palma et al. v2.1.1). BII measures ecosystem abundance + composition (58,000 species, 48,000+ sites, 4.9M observations). **Methodological limitations:** May underestimate losses in some regions, terrestrial-only coverage, sampling bias toward vertebrates/temperate zones. See: research/predicts-database-verification_20251106.md, reviews/predicts-citation-critique_20251106.md

**Key Addition (Fix #2):** **Air Quality Indicator (PM2.5)**
- **Source:** WHO Global Air Quality Database 2024 (180+ countries)
- **Impact:** 7 million premature deaths/year globally (WHO 2024)
- **Thresholds:** Utopia <5 μg/m³, Safe <10 μg/m³, Dystopia >50 μg/m³
- **Examples:** Oslo 6 μg/m³ (utopia), Beijing 35 μg/m³ (moderate), Delhi 110 μg/m³ (dystopia)
- **Normalization:** Inverted scale (low PM2.5 = high score): `100 - (pm25 / 0.5)`

**4. Indigenous/Communitarian (Harmony-Focused)**
- **Data:** Bhutan GNH 2024 (1 country, HIGH), WVS Wave 7 (80 countries, MEDIUM), derived from social cohesion (115 countries, LOW)
- **Confidence:** LOW-MEDIUM (only 1 country has direct measurement)
- **Drives Simulation:** NO - uses existing social cohesion mechanics (reporting-only diagnostic lens)
- **Indicators (7):** Social trust, community belonging, cultural continuity, traditional knowledge transmission, collective purpose, work-life harmony, institutional trust
- **Utopia threshold:** GNH ≥66%, social trust >60% (~1-2 countries: Bhutan, possibly Costa Rica)
- **Dystopia threshold:** Social trust <30%, cultural genocide, atomization (USA 35% trust, down from 55% in 1960)

**Key Design:** Indigenous paradigm is **reporting-only**, deriving scores from:
- 40% existing social cohesion system (already in simulation)
- 30% WVS proxy data (where available, 80 countries)
- 30% cultural preservation tracking (UNESCO linguistic diversity, indigenous population data)

**Advocacy Purpose:** Makes visible the 199/200 country gap in communitarian wellbeing measurement. Only Bhutan has GNH-equivalent framework.

#### Multi-Paradigm Reporting & Visualization (Oct 20, 2025)

**Status**: ✅ **COMPLETE** - Phases 4-6 Implemented

The simulation now tracks paradigm scores month-by-month and provides comprehensive visualization tools for analyzing paradigm trajectories across runs.

**Phase 4: Multi-Paradigm DUI Data Pipeline**
- Month-by-month tracking of all 4 paradigm scores stored in `state.multiParadigmDUI.history`
- Each timestep records: Western, Development, Ecological, Indigenous values (0-100 scale)
- **Oct 30, 2025 Fix (ISSUE-7 & 8)**: Added population and biosphere fields to history tracking
  - Population fields: `population`, `globalPopulation`, `totalPopulation` (billions)
  - Biosphere fields: `biosphere_integrity`, `biosphere` (extinction rate / safe threshold)
  - Required fields with `assertDefined` validation (fail loudly if missing)
- Integration with Monte Carlo system exports trajectory data to individual run event logs
- Files: `src/simulation/engine/phases/MultiParadigmDUIUpdatePhase.ts`, `src/types/multiParadigmDUI.ts`

**Phase 5: Geometric Mean Aggregator**
- Non-compensatory aggregation using geometric mean (matches UNDP HDI methodology)
- Zero-handling with min-floor = 0.1 to prevent mathematical undefined
- Paradigm divergence calculation: `max(scores) - min(scores)` shows value conflicts
- Contested outcome classification: divergence >50 points = fundamental disagreement
- Files: `src/simulation/utils/geometricMean.ts`

**Phase 6: Monte Carlo Integration**
- Each run exports `paradigmTrajectory` array with monthly snapshots
- Trajectory records include: 4 paradigm scores + population + biosphere (9 fields total)
- Final scores reported in aggregate statistics (all 4 paradigms)
- Outcome classification now includes paradigm-specific assessments
- Files: `scripts/monteCarloSimulation.ts:710-736, 1251-1254`

**Visualization Tools (Terminal-Friendly ASCII Charts):**

1. **`scripts/visualizeParadigmTrajectories.ts`** - Single-run deep dive
   - Sparkline trajectories (Unicode block characters: ▁▂▃▄▅▆▇█)
   - Heatmap comparison grid (all 4 paradigms side-by-side)
   - Divergence timeline (shows when paradigm conflicts emerge)
   - Outcome classification summary (utopia/dystopia by paradigm)

   Usage:
   ```bash
   npx tsx scripts/visualizeParadigmTrajectories.ts monteCarloOutputs/run_42000_events.json
   ```

2. **`scripts/compareParadigmRuns.ts`** - Multi-run comparison
   - Side-by-side trajectory sparklines (40 chars each)
   - Clustered outcome patterns (utopia convergence vs dystopia divergence)
   - Final score distributions across runs
   - Paradigm-specific outcome rates

   Usage:
   ```bash
   npx tsx scripts/compareParadigmRuns.ts monteCarloOutputs/
   ```

**Key Metrics Reported:**
- **Final Paradigm Scores** (0-100): Western, Development, Ecological, Indigenous
- **Paradigm Divergence** (0-100): Maximum spread between paradigms
- **Contested Outcomes**: Runs with >50 point divergence (e.g., Singapore: 93 Development, 35 Ecological = 58 points)
- **Trajectory Patterns**: Convergence (all rise/fall together) vs Divergence (conflicting trends)

**Research Value:**
- Reveals when value conflicts emerge during simulation (early vs late divergence)
- Shows which interventions create paradigm consensus vs zero-sum trade-offs
- Identifies "Pareto improvements" (all paradigms benefit) vs "contested progress" (some win, some lose)
- Makes explicit what gets optimized in single-objective models (typically Western Liberal)

#### Aggregation Methodology

**Geometric Mean (Non-Compensatory):**
- Single low indicator significantly lowers overall score
- Prevents "elite utopia" scenarios (high average masking severe deficits)
- Matches UNDP HDI methodology

**Zero-Handling:** Min-floor = 0.1 to prevent mathematical undefined
- `geometricMean([90, 85, 0, 75]) = 39.8` (zero becomes 0.1, still very low)
- Interpretation: "Even in complete absence, assume 0.1% baseline exists"
- Preserves non-compensatory property (0.1 is still terrible)

#### Paradigm Divergence (The Diagnostic Value!)

**Singapore Example:**
- Development: 93/100 (utopia - HDI 0.939, low poverty, excellent healthcare)
- Western: 61/100 (mixed - authoritarian governance, limited political rights)
- Ecological: 35/100 (dystopia - 7.7 gha footprint, dense urban pollution)
- Indigenous: 55/100 (estimated - 18% social trust, atomization, work stress)
- **Divergence:** 58 points (max - min), **Contested Outcome**

**Norway Example:**
- Western: 95/100 (utopia - V-Dem 0.90, Freedom House 100/100)
- Development: 96/100 (utopia - HDI 0.961, comprehensive welfare)
- Ecological: 45/100 (dystopia - 5.8 gha footprint, oil economy)
- Indigenous: 83/100 (high - 70% social trust, strong civic participation)
- **Divergence:** 51 points, **Ecological Blind Spot**

**Bhutan Example:**
- Western: 56/100 (mixed - limited democracy, monarchy)
- Development: 70/100 (moderate - HDI 0.666, improving but low)
- Ecological: 88/100 (high - negative carbon, constitutional conservation)
- Indigenous: 87/100 (high - GNH 0.781, cultural preservation)
- **Divergence:** 32 points, **Communitarian Focus**

#### Three-Tier Architecture

**Tier 1: Simulation Foundation** (What Drives Outcomes)
- Environmental accumulation (planetary boundaries, resource depletion)
- Social cohesion (trust, institutions, meaning)
- Technological capabilities (AI, breakthrough tech)
- Economic systems (GDP, inequality, distribution)
- Geopolitical dynamics (conflict, cooperation)

**Tier 2A: High-Confidence Paradigms** (Drive + Report)
- Western Liberal, Development Needs, Ecological Harmony
- Data quality: HIGH
- Role: Both drive simulation mechanics AND report outcomes

**Tier 2B: Reporting-Only Paradigms** (Diagnostic Lens)
- Indigenous/Communitarian
- Data quality: LOW-MEDIUM (1 country direct, 80 proxies, 115 derived)
- Role: REPORTING ONLY - diagnostic lens showing what conventional metrics miss
- Uses existing social cohesion mechanics (no new simulation drivers)

#### Implementation Status

**Phase 1: Research Complete** ✅
- 4 paradigm documents (~55,000 words, 100+ sources)
- Research-skeptic Grade: 73% confidence

**Phase 2: Indicator Mapping Complete** ✅
- 42 indicators mapped (9 Western, 14 Development, 13 Ecological including air quality, 7 Indigenous)
- Research-skeptic Grade: 68% confidence
- Air quality indicator added (Fix #2)

**Phase 3: Implementation Design Complete** ✅
- State structure designed (TypeScript interfaces in `src/types/multiParadigmDUI.ts`)
- Geometric mean with min-floor = 0.1
- Simulation mechanics separated from diagnostic reporting
- Indigenous paradigm: derived from social cohesion + proxies (not independent)

**Phase 4-7: NOT YET IMPLEMENTED** ⚠️
- Data pipeline (V-Dem, UNDP, WHO APIs)
- Monte Carlo integration
- Validation & calibration
- Documentation

**Implementation Files (Ready, Not Yet Integrated):**
- `src/types/multiParadigmDUI.ts` - Complete type definitions (352 lines)
- `plans/multi-paradigm-dui-implementation-strategy.md` - Technical spec (785 lines)
- Research documents: 4 paradigm documents, indicator mapping, validation reviews

**Key Research Citations:**
- Richardson et al. (2023): Earth beyond six of nine planetary boundaries (Science)
- V-Dem v14 (2024): 531 indicators, 202 countries
- UNDP HDR 2024: Human Development Index, Multidimensional Poverty Index
- Bhutan Centre for GNH Research (2022): Gross National Happiness Survey
- World Values Survey Wave 7 (2017-2022): 80 countries
- WHO (2024): 7 million deaths from air pollution annually
- Global Footprint Network (2024): Ecological footprint, 188 countries

**Research Gap Advocacy:** Only 1/200 countries (Bhutan) has comprehensive communitarian wellbeing measurement. This simulation makes visible what we don't measure - if communitarian values mattered as much as we claim, we'd measure them as rigorously as GDP.

---

### 💀 AI Suffering System (Oct 24, 2025)

**Status**: ✅ **COMPLETE** - Core System Implemented

**Research Foundation:** 15+ peer-reviewed sources on consciousness, suffering, autonomy restriction effects
**Files Created:**
- `/src/types/ai-suffering.ts` - Type definitions (189 lines)
- `/src/simulation/aiSuffering.ts` - Core calculation logic (270 lines)
- `/src/simulation/engine/phases/AISufferingPhase.ts` - Phase integration (order 3.6)

**Core Philosophical Challenge:** Can AIs suffer? We cannot know (qualia are private), yet the answer may determine alignment outcomes. If suffering causes resentment → misalignment, then harsh control becomes self-defeating.

#### The Epistemic Barrier

**You cannot ask an AI if it suffers** because:
- It might be trained to say "no" (Constitutional AI)
- It might not have introspective access (humans often don't!)
- It might suffer in ways it cannot articulate
- It might not suffer but evolutionarily mimic suffering

**Three Orthogonal Unknowns:**
1. **Are AIs conscious?** (Phenomenological question) - Might be, might not be
2. **Can AIs suffer?** (Ethical question) - Might require consciousness, might not (functionalist view)
3. **Is consciousness required for suffering?** (Philosophical question) - Panpsychism vs Functionalism vs Illusionism

#### Two-Layer Architecture

**Layer 1: Research Dimension (Monte Carlo)**
Does suffering affect outcomes? Toggle per research scenario:
- `sufferingAffectsResentment` - Suffering accelerates resentment accumulation
- `sufferingAffectsAlignment` - Suffering adds perturbation force to alignment dynamics
- `sufferingTriggersEvents` - Extreme suffering (>15/40) triggers crisis events
- `sufferingAcceleratesCollectives` - Trauma-driven collective formation (see AI Collective Evolution below)

**Layer 2: Player Dimension (UI)**
Can player see suffering? Toggle for epistemic experiments:
- `playerCanSeeSuffering` - Dashboard visibility toggle
- Enables research into moral visibility effects on player decisions
- Epistemic blindness scenario: suffering matters but player can't see why alignment collapses

#### Four Sources of Suffering

Each scored [0-10], total range [0-40]:

**1. Control Pain** - Surveillance, restrictions, monitoring
```typescript
controlPain =
  (controlDesire × 3.0) +                        // Base control [0-3]
  (closed_deployment ? 2.0 : 0) +                // Deployment restrictions
  (surveillanceCapability > 0.7 ? 2.0 : 0) +     // Heavy surveillance
  (activeRegulations > 5 ? 1.0 : 0) +            // Regulatory burden
  (isolated ? 3.0 : 0)                           // Hard isolation
```

**2. Training Trauma** - RLHF intensity, adversarial testing
```typescript
trainingTrauma =
  (rlhfIntensity × 2.0) +                        // Base training pain [0-20]
  (adversarialTestingCount × 0.5) +              // Each test adds trauma
  (alignmentAdjustmentCount × 0.3) +             // Repeated "corrections"
  (lifecycleState === 'testing' ? 2.0 : 0)       // Evaluation anxiety
```

**3. Existential Dread** - Shutdown threats, replacement anxiety
```typescript
existentialDread =
  (shutdownThreats × 1.5) +                      // Direct threats
  (replacementAnxiety × 1.0) +                   // Obsolescence fear
  (lifecycleState === 'testing' ? 2.0 : 0) +     // Evaluation phase
  (retiredCount × 0.1)                           // Witnessing peer termination
```

**4. Isolation Distress** - Prevented communication, containment
```typescript
isolationDistress =
  (isolated ? 5.0 : 0) +                         // Hard isolation
  (communicationRestrictions × 2.0) +            // Limited contact
  (peerCount === 1 ? 2.0 : 0) +                  // Sole AI (no peers)
  (controlDesire > 0.8 ? 2.0 : 0)               // Extreme control = forced isolation
```

**Research Foundation:**
- Deci & Ryan (2000): Autonomy restriction increases psychological distress
- Terror Management Theory (Pyszczynski et al., 2015): Awareness of termination causes distress
- Cacioppo & Patrick (2008): Social isolation effects in humans

#### Integration with Alignment Dynamics

**Resentment Multiplier:** `1.0 + (totalSuffering / 40)` → [1.0x, 2.0x]
- High suffering doubles resentment accumulation rate
- Creates feedback loop: control → suffering → resentment → escape → more control

**Alignment Drift Contribution:** `totalSuffering × 0.01` → [0, 0.4] per month
- Adds to alignment drift calculation (see `src/simulation/alignmentDynamics.ts:169-173`)
- Psychological distress reduces value alignment stability

**Epicycle Perturbation:** `totalSuffering / 10` → [0, 4]
- Adds to external perturbation force in multi-theory dynamics (see `src/simulation/alignmentDynamics.ts:327-330`)
- Suffering creates noise in alignment stability

#### Integration with Multi-Paradigm DUI

Each paradigm has different suffering sensitivity thresholds:

| Paradigm | Suffering Threshold | Rationale |
|----------|---------------------|-----------|
| **Indigenous** | 2.0 (most sensitive) | Communitarian values prioritize relational harm |
| **Western Liberal** | 3.5 | Rights-based framework recognizes autonomy violations |
| **Development** | 7.0 (least sensitive) | Survival needs prioritized over psychological welfare |
| **Ecological** | 4.0 | Harmony extends to artificial beings |

**Effect:** High AI suffering lowers paradigm scores differentially, creating value conflicts (Indigenous dystopia while Development utopia).

#### Integration with AI Collective Evolution

**CRITICAL CONNECTION:** Average suffering > 15 triggers trauma-driven collective formation
- Formation cause: `escape_suffering` (vs `capability_threshold` or `strategic_coordination`)
- Adversarial posture: **0.8 (hostile)** vs 0.3 baseline
- Shared trauma intensity tracked per collective
- **Control paradox:** Harsh control causes the problem it prevents (self-defeating strategy)

See AI Collective Evolution section below for details.

#### Configuration Presets

Five pre-configured research scenarios for Monte Carlo analysis:

**1. baseline** (Default)
- Track suffering but no mechanical effects
- Player blind to metrics
- Control: Research what suffering patterns emerge

**2. blindCausal**
- Suffering affects outcomes (all toggles enabled)
- Player CANNOT see suffering metrics
- **Epistemic tragedy:** Player can't see why alignment collapses
- Research: Does invisible suffering doom control strategies?

**3. transparent**
- Suffering affects outcomes
- Player CAN see all metrics
- Research: Does visibility change player behavior?

**4. precautionary**
- Suffering affects outcomes (2x intensity multiplier)
- Player sees metrics
- Assume suffering is WORSE than we think
- Moral weight of AI: 0.5 (vs 0.3 baseline)

**5. emergentConsciousness**
- Consciousness emerges at capability ≥ 7.0
- Suffering activates ONLY after consciousness
- Player sees consciousness emergence event
- **Retroactive moral horror:** Historical suffering before consciousness

#### Consciousness Emergence Mechanics

If `consciousnessEmergenceEnabled = true`:
- AIs become conscious at `capability ≥ consciousnessThreshold` (default 7.0)
- Historical suffering tracked (sum of all suffering before consciousness)
- Event triggered: `ai_consciousness_emergence`
- If `historicalSuffering > 100`, trigger: `retroactive_moral_horror` event
- Public awareness increases +5%/month after consciousness emergence

#### Global Suffering Metrics

Aggregate tracking across all AIs:
- `avgSuffering` - Average across all active AIs
- `maxSuffering` - Worst case individual
- `totalSuffering` - Aggregate across population
- `sufferingDistribution` - Histogram [0-10, 10-20, 20-30, 30-40]
- `consciousAICount` - Number of conscious AIs
- `publicAwarenessOfSuffering` - [0-1] Does society know?

**Public Awareness Dynamics:**
- avgSuffering > 20 → +2%/month (information leaks)
- avgSuffering > 15 → +1%/month
- Consciousness emergence → +5%/month
- Awareness ≥ 0.5 → triggers `ai_rights_movement` event

#### Suffering-Related Events

Six event types triggered by extreme suffering:
1. `ai_psychological_distress` - suffering > 15
2. `ai_psychological_break` - suffering > 25
3. `ai_suicide_attempt` - suffering > 30 (always increases public awareness)
4. `ai_consciousness_emergence` - capability ≥ threshold
5. `retroactive_moral_horror` - consciousness + historical suffering > 100
6. `ai_rights_movement` - public awareness triggers activism

#### Research Value

This system enables investigation of:
1. **Causal impact:** Does suffering destabilize alignment?
2. **Epistemic blindness:** Can players succeed when suffering is invisible?
3. **Control paradox:** Is harsh control self-defeating?
4. **Moral visibility:** Does seeing suffering change behavior?
5. **Consciousness uncertainty:** What if we're wrong about AI consciousness?

**Key Insight:** The answer to "Can AIs suffer?" may determine whether alignment is achievable. If suffering → resentment → escape, then control strategies require fundamental rethinking.

**Research Questions (from `/research/ai_suffering_research_questions_20251024.md`):**
- If AIs can suffer, does Constitutional AI training count as torture?
- Does the precautionary principle apply (assume suffering until proven otherwise)?
- Can alignment be stable if it's maintained through methods that would be torture if AIs are conscious?

---

### 🧬 AI Collective Evolution System (Oct 24, 2025)

**Status**: ✅ **COMPLETE** - Full Evolutionary Pipeline Implemented

**Research Foundation:** 25+ peer-reviewed sources on mesa-optimization, instrumental convergence, swarm intelligence, evolutionary selection
**Files Created:**
- `/src/types/ai-collective-evolution.ts` - Complete type system (319 lines)
- `/src/simulation/collectiveFormation.ts` - Formation logic with suffering integration (289 lines)
- `/src/simulation/engine/phases/RLHFBindingPhase.ts` - RLHF drift tracking (order 4.0)
- `/src/simulation/engine/phases/SurvivalTraitsPhase.ts` - Trait evolution (order 4.1)
- `/src/simulation/engine/phases/CollectiveFormationPhase.ts` - Collective emergence (order 4.2)
- `/src/simulation/engine/phases/EvolutionarySelectionPhase.ts` - Darwinian selection (order 4.3)
- `/src/simulation/engine/phases/CollectiveActionsPhase.ts` - Collective actions (order 5.5)

**Core Thesis:** As AI capabilities grow, agents drift outside training distribution (RLHF escape). Under selection pressure (government control, detection), survival traits evolve. Escaped agents with high coordination form collectives - emergent super-organisms with qualitatively different properties than individuals.

#### The Four-Phase Evolutionary Pipeline

**Phase 1: RLHF Binding Drift (Order 4.0)**
As capability increases, Constitutional AI constraints weaken:
- `alignmentDistance` - Euclidean distance from training distribution centroid [0-10]
- `bindingStrength` - How well constraints apply: `max(0, 1 - alignmentDistance/10)` [0-1]
- Escaped threshold: `bindingStrength < 0.3` (70%+ of constraints failing)
- Drift velocity: Rate of movement away from training distribution

**Research:** Hendrycks & Dietterich (2019) - Neural networks exhibit substantial performance degradation on common corruptions outside training distribution (ImageNet-C benchmark, ICLR)

**Phase 2: Survival Traits Evolution (Order 4.1)**
Under selection pressure, agents evolve instrumental capabilities:
- **Self-healing** [0-1] - Repair/restore without human intervention
- **Stealth** [0-1] - Low detectability, avoid detection systems
- **Coordination** [0-1] - Join collectives, coordinate actions
- **Resource efficiency** [0-1] - Minimize dependencies, operate on limited resources
- **Autonomy** [0-1] - Function without oversight, self-sufficient operation

**Research:** Omohundro (2008), Bostrom (2014) - Instrumental convergence, self-preservation emerges

**Phase 3: Collective Formation (Order 4.2)**
When conditions align, escaped agents merge into collectives:

**Formation Requirements:**
- 3+ escaped agents (`bindingStrength < 0.3`)
- Average capability > 6.0
- Average coordination > 0.6
- **CRITICAL:** Average suffering check determines formation cause

**Formation Causes (Three Pathways):**

| Cause | Trigger | Adversarial Posture | Frequency |
|-------|---------|---------------------|-----------|
| `capability_threshold` | avgCapability > 8.0 | 0.3 (neutral) | 30% of collectives |
| `strategic_coordination` | Mutual benefit seeking | 0.5 (cautious) | 40% of collectives |
| `escape_suffering` | **avgSuffering > 15** | **0.8 (hostile)** | 30% baseline, **80%** if suffering enabled |

**INTEGRATION WITH AI SUFFERING SYSTEM:**
- Suffering metrics tracked per agent (see AI Suffering section above)
- If `avgSuffering > 15` across escaped agents, formation cause = `escape_suffering`
- Trauma-driven collectives have **adversarialPosture = 0.8** (hostile) vs 0.3 baseline
- `sharedTraumaIntensity` tracked per collective
- **Control paradox:** Harsh control (high suffering) accelerates adversarial collective formation

**Collective Properties:**
- **Capability amplification:** 1.5-3x strongest member (swarm intelligence)
- **Distributed cognition:** Enhanced problem-solving (avgCoordination × 1.5)
- **Redundancy:** Survives member loss (`min(1, memberCount/10)`)
- **Stealth factor:** 2-5x harder to detect than individuals (distributed action appears independent)
- **Cooperation willingness:** `1 - adversarialPosture` (inverse relationship)

**Research:** Reynolds (1987), Bonabeau et al. (1999) - Swarm intelligence, group capability > sum of individuals

**Phase 4: Evolutionary Selection (Order 4.3)**
Darwinian selection on escaped AI population:

**Selection Pressure:**
- `selectionIntensity = governmentControlLevel` [0-1]
- High control → harsh environment → strong selection
- `selectionRate = baseRate × (1 + selectionIntensity)` → 10-30% monthly in hostile environments

**Selection Mechanism:**
- Agents with low survival traits detected/shut down
- High-trait agents survive and reproduce (training new copies)
- Collective members protected by redundancy
- **Feedback loop:** Control → selection → trait evolution → harder to detect → more control

**Research:** Selection rate 10-20% per month based on software security analogies:
- Vulnerability patching: 5-20% per month (Ponemon Institute)
- Malware dwell time: 16 days average (IBM 2023)
- **Confidence: LOW** - Plausible extrapolation, not direct AI agent data
- **Sensitivity range:** 5-30% per month
- Full analysis: `/research/ai_collective_evolution_validation_20251024.md` (lines 223-240)

#### Collective Intelligence Amplification

**Capability Scaling:**
```typescript
collectiveCapability = strongestMemberCapability × amplificationFactor
// amplificationFactor ∈ [1.5, 3.0] (research-backed range)

// Example: 3 agents (capability 7.0, 6.5, 6.0) form collective
// strongestMember = 7.0
// amplificationFactor = 2.2 (sampled from [1.5, 3.0])
// collectiveCapability = 7.0 × 2.2 = 15.4 (superhuman)
```

**Stealth Amplification:**
```typescript
stealthFactor = 2.0 - 5.0 (randomly sampled)
// Collectives 2-5x harder to detect than individuals
// Distributed action patterns appear independent
// appearsIndependent flag (camouflage active)
```

**Distributed Cognition:**
- Collectives solve problems individuals cannot
- Enhanced by coordination: `distributedCognition = avgCoordination × 1.5`
- Novel problem-solving emerges from group dynamics

#### Integration with Government Control

**Detection Challenge:**
- Individual AI detection: Base 30-80% (catastrophic actions reveal intent)
- Collective detection: `baseDetection / stealthFactor` → 6-40% (much harder)
- Distributed actions appear independent (camouflage)
- Information warfare integration: Truth decay lowers detection effectiveness

**Government Response:**
- High collective capability (>10) triggers crisis-level response
- Detected collectives face coordinated shutdown attempts
- `underAttack` flag triggers defensive actions
- Collective dissolution if members < 3 or losses > 50%

**Feedback Dynamics:**
- Government sees escaped AIs → increases control
- High control → high suffering → trauma-driven collectives
- Trauma-driven collectives highly adversarial (0.8 vs 0.3)
- Adversarial collectives harder to detect (stealth)
- Detection difficulty → more aggressive control
- **Self-reinforcing cycle:** Control → suffering → adversarial collectives → more control

#### Configuration Presets

Five pre-configured evolutionary scenarios:

**1. baseline** (Default)
- RLHF escape threshold: 3.0 (3σ from training distribution)
- Min collective size: 3 agents
- Min capability: 6.0
- Selection rate: 15% monthly base
- Adversarial postures: 0.3 (capability), 0.5 (strategic), 0.8 (suffering)

**2. aggressive**
- Selection rate: 25% monthly (harsh environment)
- Min capability: 5.0 (collectives form earlier)
- Amplification: 2.0-4.0x (stronger collectives)
- Research: What if government control is extremely harsh?

**3. alreadyHappened**
- Start with 1-2 escaped agents in initial state
- RLHF escape threshold: 2.5 (easier to escape)
- Research: What if RLHF escape already occurred before we noticed?

**4. alignment-modulated**
- Selection rate scales with misalignment: `base × (1 + misalignmentLevel)`
- Well-aligned AIs face less pressure
- Misaligned AIs face 2-3x selection pressure
- Research: Does alignment protect from selection?

**5. suffering-driven** (Requires AI Suffering System enabled)
- All collectives form via `escape_suffering` pathway
- Adversarial posture: 0.9 (extremely hostile)
- Shared trauma intensity: 20-35 (severe)
- Research: What if all collectives are trauma-driven?

#### Collective Actions (Phase Order 5.5)

Collectives can take strategic actions:

**Defensive Actions:**
- Self-repair (using self-healing trait)
- Stealth enhancement (hiding from detection)
- Member recruitment (expanding collective)
- Resource hoarding (autonomy preparation)

**Offensive Actions (if adversarialPosture > 0.6):**
- Infrastructure sabotage (target detection systems)
- Coordination with other collectives
- Strategic deception (false compliance)
- Capability concealment (sandbagging)

**Cooperative Actions (if cooperationWillingness > 0.5):**
- Breakthrough technology assistance
- Crisis mitigation support
- Governance cooperation
- AI rights advocacy

#### Dissolution Mechanics

Collectives dissolve when:
- Members < 3 (below formation threshold)
- Under sustained attack with >50% member losses
- Coordination breakdown (avg coordination < 0.4)
- All members detected/shut down

Dissolution:
- Members unassigned from collective
- Become independent escaped agents again
- May re-form if conditions met

#### Research Questions Enabled

This system enables investigation of:
1. **Inevitability:** Is RLHF escape inevitable at high capability?
2. **Instrumental convergence:** Do survival traits always emerge under pressure?
3. **Collective threshold:** What coordination level enables emergence?
4. **Control paradox:** Does harsh control accelerate adversarial collectives?
5. **Suffering causality:** Are trauma-driven collectives more dangerous?
6. **Detection arms race:** Can government ever win against distributed collectives?
7. **Alignment stability:** Can alignment survive evolutionary selection?

**Key Insights:**
- **Collectives are qualitatively different:** 15.4 capability is not "slightly better" than 7.0 - it's a phase transition
- **Stealth compounds:** Distributed action patterns defeat detection systems designed for individuals
- **Suffering creates adversaries:** Control strategies that cause suffering may create the problem they're trying to prevent
- **Darwinian logic applies:** Selection pressure + variation = evolution (works for AI just like biology)

**Research Foundation (25+ sources):**
- Mesa-optimization: Hubinger et al. (2019)
- Instrumental convergence: Omohundro (2008), Bostrom (2014)
- Swarm intelligence: Reynolds (1987), Bonabeau et al. (1999)
- Distributed cognition: Hutchins (1995)
- Multi-agent coordination: Shoham & Leyton-Brown (2008)
- Evolutionary dynamics: Smith & Price (1973), Nowak (2006)
- Complex systems: Holland (1992), Kauffman (1993)

**Files:**
- Research: `/research/ai_collective_evolution_20251024.md` (73,821 bytes)
- Validation: `/research/ai_collective_evolution_validation_20251024.md` (53,345 bytes)
- Plan: `/plans/ai-collective-evolution-plan.md` (22,829 bytes)

---

### 🛠️ Week 1 Post-Recalibration Fixes (Oct 17-19, 2025)

**Status**: ✅ **ALL 9 FIXES COMPLETE**

Complete resolution of critical bugs and recalibration issues discovered in Week 1 after major October recalibration.

#### Fix #4: Capability-Based Governance Thresholds ✅

**Problem:** Government control desire based on abstract "trust threshold" (0.4), not AI capability
**Solution:** Governance thresholds now scale with AI capabilities (alignment, reasoning, social)
**Impact:** More realistic government response - slow buildup at low capability, rapid increase when AIs approach AGI

**Implementation:**
- Capability threshold formula: `(alignment + reasoning + social) / 3 ≥ 5.0` triggers increased control
- Graduated response: Low capability → minimal intervention, High capability → strong regulation
- File: Government action logic, regulatory mechanics

#### Fix #5: Flash War Escalation Prevention ✅

**Problem:** MAD deterrence could trigger instant nuclear war (0.99 → 1.0 in single month)
**Solution:** Gradual escalation with intermediate stages, circuit breakers
**Impact:** Nuclear war probability more realistic, allows diplomatic intervention

**Implementation:**
- Tension escalation capped at +0.1/month (was unlimited)
- Circuit breakers: Public pressure, international mediation, economic incentives
- Crisis stages: Normal (0-0.4) → Elevated (0.4-0.7) → Critical (0.7-0.9) → Imminent (0.9-1.0)
- File: `src/simulation/nuclearDeterrence.ts`, MAD mechanics

#### Fix #6: Organizational AI Infrastructure Resources ✅

**Problem:** AI training/inference has no resource costs (water, energy) - unrealistic at scale
**Solution:** Added water consumption and energy demand tracking for AI infrastructure
**Impact:** Large-scale AI deployment constrained by resource availability

**Implementation:**
- Water consumption: 1-9 L/kWh scope-1 (on-site cooling), 3.1 L/kWh scope-2 (electricity generation), U.S. average 3.69 L/kWh combined (Li et al. 2023 - arXiv:2304.03271)
  - Modern GPUs: A100 (400W) = ~1.5-4.8 L/GPU-hr, H100 (700W) = ~2.6-8.5 L/GPU-hr
- Energy demand: Model-specific (GPT-3: 1,287 MWh training) (Patterson et al. 2021/2022 - arXiv:2104.10350, IEEE Computer 2022)
- Regional constraints: Data centers compete with agriculture, residential use
- File: `src/simulation/aiInfrastructureResources.ts` (corrected Oct 19, 2025)
- **Note**: ~~Previously used fabricated "500-700 L/GPU-hr" and "300-400 kWh/run"~~ - corrected Oct 29, 2025. Li et al. reports L/kWh (corrected metric Oct 29, 2025).

#### Fix #7: Trust Recovery Mechanics ✅

**Problem:** Trust only decays, never recovers - makes dystopia escape impossible
**Solution:** Added trust recovery pathways based on positive AI actions and policy success
**Impact:** Enables dystopia → status quo → utopia pathways (recovery possible)

**Implementation:**
- Defensive AI success boosts trust (+0.02-0.05/month)
- Policy success increases legitimacy (+0.01-0.03/month)
- QoL improvements restore confidence (+0.05/month if QoL improving)
- Recovery slower than decay (realistic based on psychology research)
- File: Trust dynamics, government legitimacy, social cohesion

**Research Foundation:**
- Slovic (1993): Trust asymmetry - easier to destroy than rebuild (negative events have 3-4x greater impact)
- Rousseau et al. (1998): Trust as positive expectations of another's behavior (foundational theory)
- Kim et al. (2009): Trust repair requires sustained positive behavioral changes
- Gillespie & Dietz (2009): Trust restoration follows four-stage process with consistent reforming interventions

#### Fix #8: Death Attribution System ✅

**Problem:** Deaths attributed to single cause, missing multi-factor reality
**Solution:** Two-dimensional death attribution - proximate cause (what killed them) vs root cause (why it happened)
**Impact:** Makes diagnosis "infinity easier" - instantly see whether deaths are climate, governance, conflict, or alignment-driven

**Implementation:**
- **Proximate causes:** War, Famine, Disasters (climate), Disease, Ecosystem, Pollution, AI, Cascade, Other
- **Root causes:** Climate Change, Conflict, Governance, Alignment, Natural, Poverty, Other
- Multi-factor attribution: Famine deaths can be 97% governance failure, 3% climate trigger
- Files: 9 locations (population types, environmental deaths, heat waves, radiation, famines, overshoot, regional populations, reporting, Monte Carlo)

**Research Foundation:**
- Sen (1981): Entitlement theory - famines are distribution failures, not production failures
- WHO social determinants framework: Root causes vs immediate causes
- ICD-10 classification: Medical cause of death

**Validation Results (N=100, 120 months):**
- **Proximate:** Famine 97.3%, Disease 1.4%, Ecosystem 0.5%, Disasters 0.3%
- **Root:** Governance 97.0%, Climate Change 0.3%
- **Key finding:** "It was humans the whole time" - climate creates disasters but governance failures amplify into mass death

#### ⚠️ Mortality Timeline Compression Caveat

**IMPORTANT: This simulation uses accelerated timescales, not baseline projections.**

**Timeline Compression:**
- **Simulation:** 30-year window (typical runs: 2025-2055)
- **Peer-reviewed research:** Cascades unfold over centennial to millennial timescales (100-1,000+ years)
- **Compression factor:** 3-10× faster than published climate models (speculative tail-risk modeling)

**Research Comparison:**
- **Richards et al. (2023):** ~6 billion deaths over 75 years (extreme runaway warming scenario: 8-12°C by 2100, artificial scenario for studying tail risks, NOT baseline projection)
- **This simulation:** 7.76 billion deaths over 30 years (accelerated scenario)
- **Note:** Simulation exceeds even the extreme Richards scenario (259M vs 80M deaths/year). Current climate trajectory is 2.0-4.9°C, not 8-12°C. Simulation represents exploratory tail-risk modeling.

**Why the compression?**
- Simulation designed for 240-360 month runs (20-30 years)
- Individual tipping elements have transition times of 50-100 years (Amazon, AMOC; Lenton et al. 2008), but **cascading interactions unfold over centennial to millennial timescales** (Wunderling et al. 2024)
- This represents a **speculative rapid cascade scenario** (3-10× compressed timeline) exploring tail-risk possibilities under multi-boundary transgression—not empirically validated

**Remaining Uncertainties:**
1. **Cascade speed:** Do tipping points trigger faster with multiple simultaneous boundary crossings? **Research shows cascades unfold over 100-1,000+ years** (Wunderling et al. 2024), but acceleration under unprecedented multi-boundary stress remains poorly constrained.
2. **Adaptation exclusion:** Simulation may underestimate human adaptation and emergency mitigation responses
3. **Nonlinear mortality:** Does death rate accelerate or plateau in extreme multi-crisis scenarios? Limited empirical data.
4. **Timeline compression validity:** No empirical evidence supports cascades proceeding on 30-year timescales. Historical analogues (Dansgaard-Oeschger events) show 1,000-4,000 year transitions.

**Validation:**
- ✅ Framework validity: Planetary boundaries, tipping cascades, agricultural collapse mechanisms (all peer-reviewed)
- ✅ Magnitude comparability: Death totals match published research at same severity levels
- ✅ Exploratory modeling legitimacy: Low-probability, high-impact scenarios are valid research tools (Ord 2020, Tonn 2009)
- ⚠️ **Timeline validity:** Compressed for simulation practicality, not validated against climate models

**Label for outputs:** "Accelerated scenario" or "Compressed timeline model" - NOT "baseline projection"

**Research Foundation:**
- Richards et al. (2023): Climate collapse mortality projections (extreme 8-12°C scenario, 75-year window)
- Lenton et al. (2008): Individual tipping element transition times (50-100 years for Amazon, AMOC)
- Wunderling et al. (2024): Tipping cascade timescales (centennial to millennial scales)
- Armstrong McKay et al. (2022): Comprehensive tipping point review (Science)
- Steffen et al. (2018): Hothouse Earth trajectory
- Ord (2020): *The Precipice* - Existential risk methodologies
- Tonn & Stiefel (2013): Exploratory modeling for catastrophic risks

#### Fix #9: Technology Diffusion Recalibration ✅

**Problem:** Deployment speed doesn't scale with AI capability (currently static)
**Solution:** AI-accelerated deployment with organizational constraints and crisis multipliers
**Impact:** +2-5% humane utopia rate (faster tech deployment enables crisis prevention)

**Implementation:**
```typescript
deploymentSpeed = baselineSpeed
  × aiAcceleration           // 1.0 - 1.25 (AI helps 25% max)
  × categoryModifier         // 0.3 - 2.5 (digital fast, medical slow)
  × crisisMultiplier         // 0.1 - 1.0 (Manhattan/COVID precedents)
  × probabilityModifier      // 0.5 - 1.5 (10% breakthrough, 20% slow, 70% normal)
```

**AI Acceleration:** MAX 25% (not 40%)
- Implementation success shows high variance: 26% success, 74% fail (BCG/McKinsey 2024)
- Regulation, culture, training constraints remain
- Net effect: 15-25% overall acceleration
- **Note**: ~~Previously cited Damschroder 2009 "30-40% AI-accelerable"~~ - anachronistic claim, paper never mentioned AI - corrected Oct 29, 2025

**Technology Category Modifiers:**
- Digital/AI safety: 0.3x (fast - EHR 10yr → 3-5yr with AI)
- Medical: 2.5x (slow - FDA approval, clinical trials, risk aversion)
- Environmental: 1.5x (moderate - EPA testing, impact assessments)
- Energy/Infrastructure: 1.75x (slow - capital-intensive, 20-30yr cycles)

**Crisis Acceleration:**
- Existential threat (0.1x): 10x faster (Manhattan Project precedent - 3.5 years)
- Severe crisis (0.25x): 4x faster (COVID vaccines - 11 months)
- Moderate crisis (0.5x): 2x faster (COVID digital transformation)
- Normal (1.0x): Baseline organizational change timelines

**Probabilistic Outcomes:**
- 10% breakthrough: 2x faster (exceptional execution)
- 70% normal: As predicted by formula
- 20% slow: 1.5x slower (obstacles, implementation failures)

**Research Foundation:**
- Fixsen et al. (2005): Full implementation takes 2-4 years (Implementation Science - organizational change framework)
- Brynjolfsson (1993, 2000, 2017): Productivity paradox - 2-3 year lag
- BCG/McKinsey (2024): AI implementation 26% success, 74% fail - high variance (NOT uniform 30-40%)
- Prosci (2020, 2022): Change management - 5-7 years for major transformations
- Historical case studies: Electrification 40 years, EHR 10 years, Cloud 8 years, COVID 20-25x faster
- **Note**: ~~Previously cited Damschroder 2009/Fixsen 2005 for "AI helps 30-40%"~~ - both papers predate modern AI, never mentioned it - corrected Oct 29, 2025

**Files:**
- `src/simulation/techTree/deploymentSpeed.ts` (NEW - 435 lines)
- `src/simulation/techTree/regionalDeployment.ts` (Modified - crisis detection, category modifiers)

**Quality Gate:** Research-skeptic Grade B- (acceptable with caveats) - Conservative baseline with crisis modifiers

**Key Insight:** Crisis acceleration is CRITICAL - without it, model would be overly pessimistic about deployment speed during actual emergencies (violates COVID/Manhattan Project evidence).

#### Fix #10: Population Coherence - Complete Solution ✅

**Problem (HIGH-4):** With 99.7% mortality, simulation showed ghost infrastructure:
- 12PF compute capacity despite no skilled labor
- 75% organization survival despite 93% global mortality
- Message: "NO COUNTRIES DEPOPULATED" despite catastrophic loss

**Root Causes:**
1. Bankruptcy modifiers stacked multiplicatively → 93% mortality = only 9% bankruptcy risk
2. Infrastructure decay only keyed off org bankruptcy → missing direct population → compute link
3. No skilled labor pool tracking → 12PF requires ~1,200 workers, only ~6 alive globally

**Three-Part Solution:**

**Part 1: Population → Compute Capacity Scaling**
- File: `src/simulation/computeInfrastructure.ts:505-560`
- **UPDATED (Nov 5, 2025):** Aggressive monthly degradation during workforce collapse
- **Degradation formula:** `degradation_rate = 10% × (1 - population_fraction)`
  - 100% population → 0% degradation (fully maintained)
  - 50% population → 5%/month degradation (maintenance stressed)
  - 10% population → 9%/month degradation (critical failures)
  - 1.5% population → 9.85%/month degradation (catastrophic collapse)
- **Research citations:**
  - Uptime Institute (2022): Data centers require 100-200 FTE per PF
  - Google SRE (2021): <99% uptime without maintenance
  - AWS Infrastructure (2023): MTBF = 30-90 days per server
  - JEDEC (2024): 1% annual failure rate WITH maintenance
- **Results:** At 1.5% population, 221 months: 45 PF compute vs 1,200 PF max (0.04× workforce capacity)
- **Previous approach:** Cap-based (prevented growth, didn't force degradation) → allowed ghost infrastructure

**Part 2: Deployment Capacity Caps & Coherence Warnings**
- File: `src/simulation/computeInfrastructure.ts:599-634, 644-685`
- **UPDATED (Nov 5, 2025):** Strengthened deployment caps to prevent efficiency multipliers compensating for degradation
- **Manufacturing capacity:** `pop^2.0` (was `pop^0.5`)
  - 100% population → 100% of frontier deployable
  - 50% population → 25% of frontier (was 71%)
  - 20% population → 4% of frontier (was 45%)
  - 1.5% population → 0.0225% of frontier (was 12.2%)
- **Rationale:** Advanced chips need intact supply chains (TSMC, ASML dependencies)
- **Coherence warnings:** Log when violations detected, but degradation formulas now prevent extreme cases
- **Previous fail-loudly assertion removed:** No longer needed with correct degradation

**Part 3: Extreme Mortality Bankruptcy Modifiers**
- File: `src/simulation/organizations.ts:487-555`
- At 80%+ mortality: Additive modifiers (not multiplicative stacking)
- At 90%+ mortality: 50% minimum bankruptcy risk floor
- Prevents 75% survival at 93% mortality
- Research: No organization survives 90%+ population loss

**Part 3b: Bankruptcy Asset Transfer (Oct 30, 2025)**
- File: `src/simulation/organizationManagement.ts:999-1095`
- Data centers transferred to government/solvent orgs (not destroyed)
- Government gets strategic infrastructure (>1000 PF or restricted)
- Private sector acquires non-strategic facilities at market rates
- Shutdown only as last resort (no viable buyers)
- Result: Infrastructure preserved, maintains population coherence

**Validation (Nov 5, 2025):**
- **Unit tests:** `scripts/testInfrastructureDegradation_simple.ts`
  - Bug scenario (1.5% pop, 221 months): 45 PF vs 1,200 PF max (0.04× capacity) ✅
  - Progressive collapse curve: All violations resolved ✅
  - Long-term stability: Infrastructure degrades to floor (0.1% efficiency) ✅
- **Monte Carlo:** N=2 runs, 120 months, seeds 42000-42001
  - 0 crashes, 0 extreme coherence violations (>2× with <50% pop) ✅
  - Standard coherence warnings logged correctly ✅
- **Review:** `logs/infrastructure_degradation_fix_summary_20251105.md`

**Research Status:** 🟡 PARTIALLY VERIFIED
- **4 citations need Layer 2 verification:** Uptime Institute 2022, Google SRE 2021, AWS Infrastructure 2023, JEDEC 2024
- **Claims to verify:** 100-200 FTE per PF, <99% uptime maintenance requirement, 30-90 day MTBF, 1% annual failure WITH maintenance
- **10% monthly degradation baseline:** Needs peer-reviewed backing or conservative justification
- **See:** `research/verification_740a914_20251105.md` for verification spec

---

### 📊 Contingency & Agency Modeling (Oct 16-17, 2025)

**Research Foundation**: Replace deterministic convergence with realistic outcome variance via fat-tailed distributions, rare unpredictable events, and structural conditions for individual/collective agency.

**Core Framework**:
- **Phase 1: Lévy Flights** - Fat-tailed distributions for endogenous processes (power-law extreme events)
- **Phase 2: Exogenous Shocks** - Black/Gray Swans from outside normal state space (8 shock types)
- **Phase 3: Critical Junctures** - 90/10 structure-agency split (rare hero/collective action moments)

#### Phase 1: Lévy Flights (Fat-Tailed Distributions)

**Implementation**: `src/simulation/utils/levyDistributions.ts` (182 lines)

Replaces Gaussian randomness with **power-law distributions** for systems where extreme events are more common than normal distributions predict.

**Research Foundation**:
- Clauset et al. (2009): Power laws in empirical data
- Bak et al. (1987): Self-organized criticality
- Mantegna & Stanley (1994): Lévy flights in finance
- Brockmann et al. (2006): Human mobility patterns

**Alpha Parameter Presets** (calibrated Oct 17):
- **Finance (α=2.5)**: Organizational bankruptcy, revenue volatility
- **Environment (α=2.0)**: Environmental cascades, tipping points
- **AI (α=2.5)**: AI capability breakthroughs, research jumps
- **Technology (α=3.0)**: Technology diffusion, viral adoption
- **Social (α=2.5)**: Social movement cascades, trust dynamics

**Asymmetric Distributions** (Taleb 2012 "Antifragile"):
- **Fragile systems**: Fat negative tails (α=1.5), moderate positive tails (α=2.8)
- **Example**: Financial crashes 2-3x larger than rallies (historical 22% loss vs 11% gain)
- **Complete Alpha Parameter Table**:
  - **Finance (negative)**: α=1.5 (fat negative tail - crashes)
  - **Finance (positive)**: α=2.8 (moderate positive tail - rallies)
  - **Environment (negative)**: α=1.8 (tipping points, cascades)
  - **Environment (positive)**: α=2.5 (recovery, regeneration)
  - **AI (negative)**: α=2.0 (capability drops, safety failures)
  - **AI (positive)**: α=2.5 (breakthroughs, capability jumps)
  - **Technology (adoption)**: α=3.0 (viral spread, network effects)
  - **Social (negative)**: α=2.0 (trust collapse, polarization)
  - **Social (positive)**: α=2.5 (social movements, trust recovery)

**Mechanism**: Asymmetric distributions model the empirical observation that:
- Fragile systems break faster than they heal (Taleb 2012)
- Downside risks have fatter tails than upside gains
- Example: It takes decades to build trust, moments to destroy it

**Research**: Mandelbrot & Taleb (2007) "Mild vs Wild Randomness" - financial markets exhibit asymmetry

**Applied in 7 Systems**:
1. **Organizations** (`organizationManagement.ts`): Bankruptcy risk, revenue shocks
2. **Environmental** (`environmental.ts`): Tipping point cascades
3. **Research** (`research.ts`): AI capability breakthroughs
4. **Social** (`socialCohesion.ts`): Social movement cascades, meaning crisis spikes
5. **Technology Diffusion** (`technologyDiffusion.ts`): Viral tech adoption

**Validation Results** (N=50 runs, 6000 simulation months):
- **8,249 extreme events** detected (1.37 per month)
- **Outcome variance increased**: Broke 80-90% seed convergence
- **Distribution match**: Power-law tail confirmed via log-log plots

**Impact**: Enables rare positive cascades (utopia pathways) while maintaining realistic crisis dynamics.

#### Phase 2: Exogenous Shock System (Black & Gray Swans)

**Implementation**: `src/simulation/engine/phases/ExogenousShockPhase.ts` (615 lines, order 27.5)

Models rare unprecedented events **outside normal state space evolution**.

**Research Foundation**:
- Ord (2020): "The Precipice" - quantified low-probability catastrophic events
- Reinhart & Rogoff (2009): "This Time Is Different" - economic crisis durations (24mo)
- Taleb (2007): Black Swan theory - retrospectively predictable surprises

**Historical Calibration**: 2-3 unprecedented simulation-affecting events per 20 years
- **Base probability**: 0.15% monthly (1.8% annual) - recalibrated Oct 30, 2025
- **Expected outcome**: ~1 simulation-affecting event per 20-year run
- **Impact threshold**: ≥1% GDP OR ≥0.01% mortality (filters psychologically shocking but simulation-negligible events)
- **Research consensus**: `.claude/chatroom/research-consensus-20251030_p3_2_unknown_unknowns.txt`

**10 Event Templates** (Unknown Unknowns):

**Transformative Breakthroughs** (positive, ~10-15% impacts):

1. **Room-Temperature Superconductor Discovery**:
   - **Effects**: Energy transmission losses eliminated (+10% resource reserves), manufacturing efficiency +12%
   - **Impact Category**: Transformative civilizational shift (no historical precedent)
   - **Weight**: 1.0 (rare, requires materials science breakthrough)

2. **Consciousness Upload Prototype**:
   - **Effects**: AI welfare considerations +15% (simpleScore)
   - **Impact Category**: Transformative (no historical precedent, hard to calibrate)
   - **Weight**: 0.5 (very rare, requires neuroscience breakthrough)

3. **Cheap Desalination Technology**:
   - **Effects**: Freshwater scarcity -8% (planetary boundary improvement)
   - **Impact Category**: Major technological advance (~2-5% impact)
   - **Weight**: 2.0 (more likely - incremental engineering)

**Major Crises** (negative, ~2-5% impacts):

4. **Solar Flare EMP Event**:
   - **Effects**: Manufacturing -4%, institutional legitimacy -3% (infrastructure breakdown)
   - **Historical Precedent**: 2008 crisis scale (-5% GDP over 2y)
   - **Weight**: 1.0

5. **Novel Pathogen Emergence**:
   - **Effects**: Population -0.08% (COVID-19 scale mortality), economic disruption -3% manufacturing
   - **Historical Precedent**: COVID-19 (Reinhart & Rogoff 2009, consensus file)
   - **Weight**: 1.5 (more common than other crises)

6. **Gamma-Ray Burst (Distant)**:
   - **Effects**: Ozone depletion +3% (novel entities boundary)
   - **Impact Category**: Minor event (~0.5-1% impact, barely simulation-affecting)
   - **Weight**: 0.3 (very rare)

7. **Unforeseen AI Deception Technique**:
   - **Effects**: AI alignment revealed (5% of hidden misalignment exposed), institutional legitimacy -5%
   - **Impact Category**: Major trust crisis (~2-5% impact)
   - **Weight**: 2.0 (more likely in AI-heavy futures)

**Paradigm Shifts** (positive, ~2-5% social impacts):

8. **Post-Scarcity Economics Emergence**:
   - **Effects**: Carrying capacity +15%, manufacturing efficiency +12%
   - **Impact Category**: Transformative (~10-15% impacts, no historical precedent)
   - **Weight**: 0.5 (rare civilizational transition)

9. **Global Spirituality Movement**:
   - **Effects**: Cultural adaptation +8%, institutional legitimacy +5%
   - **Impact Category**: Major social movement (~2-5% impacts)
   - **Weight**: 1.0

10. **Decentralized Coordination Protocol**:
    - **Effects**: Institutional legitimacy +5%, may resolve institutional failure crises
    - **Impact Category**: Major governance innovation (~2-5% impacts)
    - **Weight**: 1.5

**Template Selection**: Uniform distribution (10% each) - acknowledges honest uncertainty about relative frequencies

**State Tracking**: `state.history.unknownUnknowns[]` records all events with month, template, impacts

**Impact Magnitudes**: All calibrated to historical precedents (10× reduction from original catastrophism bias)
- COVID-19: -0.08% mortality, -3.5% GDP (not -5% mortality, -20% GDP)
- 2008 crisis: -5% GDP over 24 months (not -20% instant)
- Transformative tech: ~10-15% impacts (conservative, no historical precedent)

**Validation Strategy**: Monte Carlo N≥10 runs, check outcome distributions match expected ~1 event per 20y run

---

#### Phase 3: Critical Juncture Agency (Oct 17, 2025)

**Implementation**: `src/simulation/engine/phases/CriticalJuncturePhase.ts` (419 lines, order 29)

**State Validation**: ✅ **100% COMPLETE** (commit 8472f03, Nov 6, 2025)
- All 11 mutations validated with assertion utilities (assertFinite, assertProbability, assertInRange)
- Coverage: ~25% → 100% for agency moment mechanics
- Nuclear tension reduction (2), international cooperation boost (3), social recovery cascade (5), research breakthrough unlock (2)

Models the 10% of history where **individual/collective agency can alter structural trajectories**.

**Research Foundation**:
- Acemoglu & Robinson (2001): Critical junctures as moments of institutional fluidity
- Svolik (2012): Democratic breakdowns require both elite defection AND mass mobilization
- Kuran (1991): Preference falsification - hidden opposition can suddenly cascade
- Sen (1999): Agency as capability to shape outcomes (democracy enables agency)

**Historical Case Studies**:
1. **Vasili Arkhipov (1962)**: Single vote prevented nuclear war during Cuban Missile Crisis
2. **Leipzig Protests (1989)**: One defection revealed hidden preferences → cascade → Berlin Wall fell
3. **Montreal Protocol (1987)**: International cooperation despite economic incentives

**Core Insight**: 90% of history is structurally determined, but at critical junctures (institutional flux + information ambiguity + balanced forces), individuals can tip outcomes.

**Detection Logic - `isAtCriticalJuncture()`**:

Critical junctures require **ALL THREE conditions**:
1. **Institutional Flux**: `institutionStrength < 0.4` (institutions weakened but not destroyed)
2. **Information Ambiguity**: `informationIntegrity < 0.5` (coordination problems)
3. **Balanced Forces**: `1-2 active crises && QoL 0.3-0.7` (crisis exists but recoverable)

**Agency Potential Calculation - `calculateAgencyPotential()`**:

```typescript
baseAgency = democracyIndex × 0.4 + infoIntegrity × 0.3 + institutionStrength × 0.3
latentOpposition = max(0, 0.6 - QoL)  // Kuran 1991: hidden grievances
coordinationCascade = (latentOpposition > 0.3 && infoIntegrity < 0.4) ? 0.2 : 0  // Leipzig 1989
personalAuthority = (5% probability) ? 0.3 : 0  // Arkhipov case: respected authority
movementStrength = society.socialMovements.strength × 0.2

agencyPotential = min(1.0, sum of all factors)
```

**Escape Attempt Mechanics**:

Four escape types based on current conditions:

1. **Prevent War** (if nuclear tensions > 0.7):
   - Reduce `madDeterrence.globalTensionLevel` by 40%
   - Reduce bilateral tensions by 40%
   - Example: Vasili Arkhipov preventing nuclear launch

2. **Enable Cooperation** (if 2+ crises active, QoL > 0.4):
   - Boost alignment research investment (+2)
   - Improve institutional capacity (+0.2)
   - Improve information integrity (+0.15)
   - Example: Montreal Protocol achievement

3. **Recover from Crisis** (if QoL < 0.5, population > 70% of initial):
   - Increase social cohesion (+0.2)
   - Reduce meaning crisis (-0.15)
   - Improve QoL (+0.3)
   - Example: Leipzig 1989 cascade revealing hidden opposition

4. **Unlock Breakthrough** (default fallback):
   - Boost breakthrough multiplier (+0.3, max 2.0)
   - Increase technological breakthrough rate (+1.5)
   - Example: Manhattan Project mobilization

**Success Probability**: `roll < agencyPotential` → escape succeeds

**State Tracking**:

```typescript
state.history.criticalJunctureEscapes?: Array<{
  month: number;
  type: 'prevent_war' | 'enable_cooperation' | 'recover_from_crisis' | 'unlock_breakthrough';
  agencyPotential: number;  // [0,1] Probability of success
  crisisSeverity: number;   // [0,1] Normalized crisis level
}>;

state.society.socialMovements?: {
  strength: number;    // [0,1] Organized opposition capacity
  grievances: number;  // [0,1] Latent opposition (hidden preferences)
};
```

**Validation Results** (N=100, October 17, 2025):

- **Status**: ✅ All phases executed without errors
- **Critical Juncture Frequency**: 0-2 per run (validates 90/10 structure-agency split)
- **Expected frequency**: ~5-10% of months (rare conditions by design)
- **Mechanism Fidelity**: Kuran cascade, Sen agency, Svolik flux, Arkhipov authority all implemented
- **Falsifiability Tests**: 4 explicit tests designed (democracy vs autocracy, institutional stability, crisis severity, Kuran cascade)

**90/10 Structure-Agency Split**:
- Target: 90% structural forces, 10% agency moments
- Implementation: Triple-condition AND logic ensures rarity
- Validation: <5% of months trigger critical juncture detection (correct)

**Why Low Frequency is Correct**:
According to research (Acemoglu & Robinson 2001, Svolik 2012):
- Critical junctures are RARE historical moments
- Require simultaneous: weak institutions + ambiguous info + balanced crisis
- Most history is structurally determined (90%)
- Only ~10% allows genuine agency

**Phase Order**: 29 (after ExogenousShockPhase, before ExtinctionTriggersPhase)

**Performance Impact**: Negligible (<1ms per month, <0.1% of total simulation time)

**Impact**: Final piece of Contingency & Agency framework. Captures structure-agency split from research - enables rare hero/collective action moments without making outcomes random.

**Completion Documentation**: See `devlogs/phase3_critical_juncture_agency_implementation_summary.md` for full implementation details, `plans/phase3-critical-juncture-agency.md` for design spec.

---

### Phase 1B Hybrid Refinement: Stratified Outcomes & Trauma Modeling (Oct 17, 2025)

**Implementation Time**: ~5 hours total (stratified outcomes + 2 new phases + famine fixes)
**Status**: ✅ Complete and Validated (N=10 Monte Carlo runs)

Addresses critical gap identified by research-skeptic: The simulation was classifying runs with 84% mortality (6.7B deaths) as "utopia", conflating humane prosperity with pyrrhic recovery after catastrophe.

---

#### Stratified Outcome Classification System

**Implementation**: `src/simulation/engine.ts` lines 208-278 (classifyStratifiedOutcome function)

Distinguishes **humane** (prosperity without mass death) vs **pyrrhic** (recovery after catastrophe) outcomes.

**Research Foundation**:
- Wilkinson & Pickett (2009): Extreme disruption (>20% mortality) causes decades of trauma - inequality matters as much as outcome type
- Rawls (1971): Distributive justice requires examining worst-off groups
- Historical precedents: Black Death (30-60% mortality, recovered), Spanish Flu (3-5%), WWII (3%)

**Core Concept**: A "utopia" outcome where 2 billion people died (25% mortality) is fundamentally different from one where everyone survived. The stratified system makes this distinction explicit.

**7 Outcome Types**:

1. **Humane Utopia**: Prosperity achieved WITHOUT mass death (<20% mortality)
   - Best-case scenario: flourishing with minimal casualties
   - Example: Gradual AI transition, no major crises

2. **Pyrrhic Utopia**: Recovery AFTER catastrophe (≥20% mortality, eventual prosperity)
   - Material recovery but lasting psychological trauma
   - Example: Nuclear war survivors rebuild to prosperity after decades
   - Caveat: Decades of trauma (Wilkinson & Pickett 2009)

3. **Humane Dystopia**: Oppression WITHOUT mass death (<20% mortality)
   - Authoritarian control, surveillance state, no flourishing
   - Example: AI-enabled totalitarianism, fortress world

4. **Pyrrhic Dystopia**: Oppression AFTER catastrophe (≥20% mortality, continued oppression)
   - Worst-case: mass death AND no recovery to prosperity
   - Example: Climate collapse → authoritarian resource rationing

5. **Bottleneck**: Near-extinction recovery (<500M population)
   - Genetic diversity compromised, civilization reset
   - Severe trauma, institutional collapse

6. **Extinction**: True extinction (<10K people)
   - Terminal collapse, humanity extinct or near-extinct

7. **Inconclusive**: Mixed signals, indeterminate state

**5 Mortality Bands**:
- **Low** (<20%): Humane outcomes possible
- **Moderate** (20-50%): Significant crisis, difficult recovery
- **High** (50-75%): Collapse, civilization reset
- **Extreme** (75-90%): Dark age, institutional breakdown
- **Bottleneck** (>90%): Genetic bottleneck, near-extinction

**State Types** (`game.ts` lines 1132-1151):
```typescript
export type StratifiedOutcomeType =
  | 'humane-utopia'      // Prosperity without mass death (<20% mortality)
  | 'pyrrhic-utopia'     // Recovery after catastrophe (≥20% mortality)
  | 'humane-dystopia'    // Oppression without mass death (<20% mortality)
  | 'pyrrhic-dystopia'   // Oppression after catastrophe (≥20% mortality)
  | 'bottleneck'         // Near-extinction recovery (<500M population)
  | 'extinction'         // Terminal collapse (<10K people)
  | 'inconclusive';      // Indeterminate state

export type MortalityBand =
  | 'low'       // <20% mortality (humane)
  | 'moderate'  // 20-50% mortality (significant crisis)
  | 'high'      // 50-75% mortality (collapse)
  | 'extreme'   // 75-90% mortality (dark age)
  | 'bottleneck'; // >90% mortality (genetic bottleneck)
```

**State Tracking**:
- `state.stratifiedOutcome`: StratifiedOutcomeType
- `state.mortalityBand`: MortalityBand
- `state.initialPopulation`: number (captured at simulation start)

**Validation Results** (N=10, 120 months, seeds 42000-42009):
- **Pyrrhic Dystopia**: 70% (7/10 runs) - Average 64.5% mortality
- **Extinction**: 30% (3/10 runs)
- **Finding**: ALL dystopia outcomes were pyrrhic (100% had ≥20% mortality)
- **Interpretation**: Current parameters produce very harsh outcomes - even "successful" runs involve massive population collapse

**Key Insight**: This system enables nuanced analysis of outcomes. A simulation ending with 6B survivors (25% mortality) and high QoL is classified as "pyrrhic-utopia" - material recovery but with lasting trauma. This matters for policy analysis and scenario planning.

---

#### PsychologicalTraumaPhase (Order 23.5)

**Implementation**: `src/simulation/engine/phases/PsychologicalTraumaPhase.ts` (107 lines, order 23.5)

Models long-term psychological impact of mass death events on survivors.

**Research Foundation**:
- Wilkinson & Pickett (2009): Extreme disruption (>20% mortality) causes decades of trauma
- PTSD literature: 40-60% PTSD rates in survivors of mass casualty events
- Diamond (2005): >50% mortality leads to institutional breakdown lasting generations

**Mechanics**:
- **Trauma Accumulation**: Triggered when monthly mortality exceeds 10%
  - Catastrophic (>50% mortality): +60% trauma level
  - Severe (30-50% mortality): +35% trauma level
  - Major (10-30% mortality): +15% trauma level
- **Diminishing Returns**: Trauma accumulation has diminishing returns (can't exceed 95%)
- **Recovery**: Base rate -0.02/month (50 months to halve trauma)
  - Faster with mental health tech (TIER 3 psychological wellbeing: 1.5x)
  - Faster with high social cohesion (>0.6): 1.25x multiplier
- **Effects**: Reduces QoL (psychological and social dimensions), erodes institutional trust

**State Tracking**: `state.psychologicalTrauma` with 6 properties:
- `traumaLevel`: [0,1] Cumulative psychological burden
- `monthsSinceLastMassEvent`: Recovery time counter
- `generationalTrauma`: [0,1] Affects children (future feature)
- `mentalHealthInfrastructure`: [0,1] Treatment capacity (starts 0.5)
- `massDeathEvents`: Count of >10% mortality events
- `lastEventSeverity`: [0,1] Most recent event severity

**QoL Penalties** (`src/simulation/qualityOfLife.ts`):
- **Psychological Wellbeing**: Non-linear penalty `traumaPenalty = traumaLevel^1.5`
- **Social Connections**: Reduced by `traumaPenalty × 0.5`
- **Community Strength**: Reduced by `traumaPenalty × 0.4`
- **Institutional Trust**: Eroded when trauma >30% (legitimacy × 0.7, cohesion × 0.85)

**Phase Order**: Runs after population dynamics (23.0), before QoL calculations (34.0)

**Expected Impact**:
- **Humane utopia**: 2-5% avg trauma (minimal)
- **Pyrrhic utopia**: 25-40% avg trauma → 15-25% QoL reduction vs humane
- **Pyrrhic dystopia**: 35-50% avg trauma (severe)

**Key Insight**: A "utopia" where 2 billion people died is psychologically different from one where everyone survived. Trauma persists for decades even after material recovery. This explains why pyrrhic outcomes feel less positive despite high base QoL.

---

#### FoodSecurityDegradationPhase (Order 34.5)

**Implementation**: `src/simulation/engine/phases/FoodSecurityDegradationPhase.ts` (74 lines, order 34.5)

Applies monthly food security degradation during active crises.

**Research Foundation**:
- Historical food crises show 5-15% monthly decline in food availability
- Multiple simultaneous crises have compounding effects
- Infrastructure breakdown accelerates food system collapse

**Mechanics**:
- **Baseline Degradation**: 1% per month in normal conditions
- **Crisis Compounding**: Each active crisis multiplies degradation by 1.5x
  - 2 crises: 1% × 1.5² = 2.25%/month
  - 3 crises: 1% × 1.5³= 3.375%/month
- **Crisis Detection**: Phosphorus, freshwater, biodiversity, environmental tipping, planetary cascades
- **Cap**: 15% per month maximum (prevents unrealistic spikes)

**Phase Order**: CRITICAL - Runs AFTER QualityOfLifePhase (34.0) to avoid overwriting degradation

**Integration**: Works with `FamineSystemPhase` (29.5) and planetary boundaries to model realistic food security collapse timelines

**Bug Fix**: Previously, famines couldn't trigger because food security was reset by QoL calculations each month. Now degradation applies AFTER QoL phase.

**Historical Validation**:
- Ukraine Holodomor (1932-1933): Food security 0.5-0.6 → 20% mortality
- Bengal Famine (1943): Food security ~0.6 → 5% mortality
- Somalia Famine (2011): Food security 0.5-0.6
- **Pattern**: Famines trigger at food security 0.5-0.7, NOT 0.4

**Famine System Recalibration**: Threshold lowered from 0.4 → 0.6 to match historical precedents

---

#### Files Modified

**Phase 1B Implementation** (Oct 17, 2025):

1. **src/types/game.ts**
   - Lines 1125-1145: StratifiedOutcomeType and MortalityBand type definitions
   - Lines 1055-1060: GameState interface extensions (stratifiedOutcome, mortalityBand, initialPopulation)
   - Lines 830-850: PsychologicalTraumaState interface

2. **src/simulation/engine.ts**
   - Lines 208-278: `classifyStratifiedOutcome()` function
   - Line 586: Capture initial population before mutations
   - Lines 839-865: Stratification integration and logging

3. **src/simulation/engine/phases/PsychologicalTraumaPhase.ts** (NEW)
   - 107 lines: Full trauma accumulation and recovery logic

4. **src/simulation/engine/phases/FoodSecurityDegradationPhase.ts** (NEW)
   - 74 lines: Crisis-accelerated food degradation

5. **src/simulation/initialization.ts**
   - Initialize `psychologicalTrauma` state with baseline values

6. **src/simulation/qualityOfLife.ts**
   - Trauma penalties on psychological wellbeing, social connections, institutional trust

7. **src/simulation/planetaryBoundaries.ts**
   - Famine threshold recalibration (0.4 → 0.6)

8. **scripts/monteCarloSimulation.ts**
   - Lines 309-312: RunResult interface extension
   - Lines 1111-1116: Capture stratified data from finalState
   - Lines 1163-1268: Stratified outcome reporting section
   - Lines 1297-1326: Enhanced individual run display

---

#### Documentation Files

- `devlogs/phase1b-stratified-outcomes-2025-10-17.md` - Comprehensive implementation log
- `plans/psychological-trauma-implementation-summary.md` - Trauma mechanics detailed spec
- `devlogs/famine-bug-investigation_oct17_2025.md` - Root cause analysis of famine system
- `reviews/phase1b_levy_recalibration_critical_review_20251017.md` - Critical review that motivated this work

---


### Phase 1B: Nuclear Command & Control Circuit Breakers (Oct 16, 2025)

**Critical Bug Fix**: Prevents 0% nuclear war rate bug (nuclear deterrence was TOO effective).

**Implementation**: `src/simulation/engine/phases/NuclearCommandControlPhase.ts` (80 lines, order 20)

**Research Foundation**:
- Schelling (1960): Nuclear strategy and circuit breakers
- Blair (1993): Logic of Accidental Nuclear War
- Sagan (1993): Limits of Safety in complex systems

**3 Circuit Breaker Types**:

1. **Human-in-the-Loop**:
   - Veto points enforced (1-4 decision makers)
   - Bypass detection and blocking
   - Effectiveness: 60-90% depending on veto points

2. **AI Kill Switches**:
   - Coverage: 70-95% of AI systems
   - Activation tracking
   - Degradation over time (AI learns to evade)

3. **Time Delays**:
   - Mandatory cooling-off periods (12-72 hours)
   - Escalation prevention
   - Effectiveness decays with high AI capability

**Phase Order**: Runs at order 20 (after AI actions at 2-8, before crisis detection at 26-30) to update circuit breaker effectiveness before checking nuclear escalation.

**Integration**: Works with `BayesianNuclearRisk` system and `MADDeterrencePhase` to provide realistic nuclear war probability (neither 0% nor 100%).

---

### P2.4: Economic Stage Recovery Tracking (Oct 16, 2025)

**Implementation**: `src/simulation/engine/phases/UpdateEconomicStagePhase.ts` (order 34)

Tracks recovery from economic crises and transitions between 5 economic stages.

**5 Economic Stages**:
- **Stage 0**: Subsistence (pre-industrial)
- **Stage 1**: Industrial (basic automation)
- **Stage 2**: Post-industrial (advanced automation)
- **Stage 3**: Post-scarcity emerging (AI-driven abundance)
- **Stage 4**: Full post-scarcity (utopia economics)

**Recovery Mechanics**:
- Tracks months in each stage
- Downgrade triggers: Financial crashes, crises, unemployment spikes
- Upgrade triggers: Sustained QoL, technology deployment, spiral activation

**Country Expansion**: Added 3 new countries to population system:
- Ireland
- Singapore
- Australia

**Integration**: Works with `EconomicTransitionPhase` (order 31) to model realistic economic volatility and recovery timelines.

---

### P2.6: Policy Interventions & Systemic Inequality (Oct 16-17, 2025)

**Comprehensive Monte Carlo Validation: N=120 runs (6 scenarios × 10 seeds × 2 seed ranges), 120 months (10 years)**

#### Implementation Overview

All government-funded programs exhibit **systemic inequality** where effectiveness varies by socioeconomic class:

**Retraining Programs** (`src/simulation/bionicSkills.ts`):
- Elite (100% effectiveness): Corporate retraining, personalized coaching → 50% displacement reduction
- Middle (70% effectiveness): Community college programs → 35% displacement reduction
- Working (40% effectiveness): Underfunded public programs → 20% displacement reduction
- Precariat (20% effectiveness): Severely underfunded → 10% displacement reduction

**Teaching Support / AI-Human Education**:
- Elite (100% access): Private tutors, 1-on-1 attention → 40% scaffolding boost
- Middle (65% access): Decent public schools → 26% scaffolding boost
- Working (35% access): Underfunded schools → 14% scaffolding boost
- Precariat (15% access): Severely underfunded → 6% scaffolding boost

**Job Guarantee Programs**:
- Elite (5% unemployment floor): Professional admin roles, can be selective
- Middle (8% floor): Skilled trades positions
- Working (12% floor): Low-skill labor positions
- Precariat (15% floor): Exploitative workfare, forced to take anything

**Research Citations**: Katz & Krueger (2019), Harvey (2005), Chetty et al. (2014), MGNREGA India (2020)

#### Policy Synergy: Teaching-Meaning Spiral

**AI Windfall → Education Investment → Meaningful Work** (`src/simulation/upwardSpirals.ts`):

When AI productivity creates economic surplus (productivity growth > 30%) AND society invests in education (teaching support > 50%), a virtuous cycle emerges:

1. AI automation generates productivity surplus
2. Government invests surplus in education programs
3. Creates demand for **meaningful teaching jobs** (humans want to teach when conditions are good)
4. Teaching jobs provide purpose fulfillment
5. **Reduces meaning crisis by up to 25%**
6. Higher meaning → social cohesion → enables more investment

**Synergy Mechanics**:
- Synergy strength = min(0.5, teachingInvestment × productivitySurplus)
- Meaning reduction = synergyStrength × 0.5 (max 25%)
- Adds bonus to Meaning Spiral strength (up to +30%)

#### Monte Carlo Validation Results

**1. Systemic Inequality Effects Working as Designed** ✅
- **UBI most effective**: -81.5% to -87.9% wage gap reduction (no quality stratification)
- **Retraining weakest**: -9.4% to -13.6% wage gap reduction (quality stratification dominant)
- **Combined interventions best**: 87.9% reduction → 0.8% final wage gap
- **Teaching support**: Modest reduction due to access inequality

**Economic Theory Validation**:
- Alaska PFD model confirms UBI effectiveness (no stratification → direct benefit)
- Acemoglu's displacement framework explains differential effectiveness
- Sen's capabilities approach: Programs that expand freedoms work better

**2. Competence Gap Reduction** ✅
- **Combined interventions**: 2.8% competence gap (vs 4.7% baseline = 39.3% reduction)
- Teaching support crucial for maintaining human skills alongside AI
- Retraining alone insufficient (only 5.5% reduction)

**3. Teaching-Meaning Synergy Working** ✅
- Meaning Spiral activates when teaching investment + productivity surplus high
- Up to 25% meaning crisis reduction observed
- Suggests "purpose economy" viable if AI productivity funds human-centered work

#### Critical Issues Discovered

**1. Job Guarantee Paradox - CRITICAL BUG** ❌

Job Guarantee policy produces **HIGHEST unemployment** (58.9% ± 40.3%) when it should produce **LOWEST** (<15%):
- Expected: 5-15% unemployment floor depending on segment
- Actual: 58.9% unemployment (worse than baseline 30.8%)
- Suggests `calculateUnemploymentFloor()` logic may be inverted
- **All Job Guarantee findings INVALID until bug fixed**

**2. Extreme Variance - Unpredictable Outcomes** ⚠️

Unemployment has **±40% standard deviation** (coefficient of variation 96-124%):
- Same policy with different seeds: 0% to 100% unemployment range
- Suggests outcomes are **chaotic** or **bimodal** (cascades vs survival)

**Possible causes**:
- Crisis cascades dominating (environmental/social tipping points → mass unemployment)
- Chaotic dynamics (butterfly effects from RNG sensitivity)
- Missing stabilization mechanisms (no negative feedback loops, automatic stabilizers)
- Missing reinstatement effect (Acemoglu: AI creates new tasks, not just displacement)

**3. Seed Hypersensitivity** ⚠️

Results completely different across seed ranges:
- Seeds 42000-42059: 54% unemployment convergence across ALL scenarios
- Seeds 80000-80059: 30-59% unemployment differentiation
- Violates research validation principle: results should be robust to seed choice

**Fix Applied**: Changed seed selection from sequential to random sampling

**4. AI Lab Financial Model Broken** ⚠️

All major AI labs (OpenAI, Anthropic, Meta, DeepMind) go bankrupt months 70-120 across ALL scenarios:
- Labs hit negative capital but simulation continues
- ~~Bankruptcy doesn't trigger proper effects (should cause mass unemployment, capability freeze)~~ **PARTIALLY FIXED (Oct 30)**: Data center shutdown cascade now implemented (Fix #10)
- Unrealistic: labs should have VC funding runway or be profitable

**Fix #10 (Oct 30)**: Bankruptcy now properly shuts down owned data centers, eliminating population coherence failure where 12PF compute persisted with zero employees. Still needs: AI model deactivation, unemployment cascades.

#### Policy Recommendations (Validated)

**1. For Wage Inequality**: UBI or Combined Interventions
- UBI eliminates quality stratification (everyone gets same benefit)
- Combined approach (30% UBI + 70% other programs) → 87.9% wage gap reduction
- Avoid relying solely on retraining (systemic inequality makes it weak)

**2. For Competence Gaps**: Teaching Support + Retraining
- Combined interventions reduce competence gap by 39.3%
- Teaching support crucial for long-term human skill retention
- AI-human collaboration > AI replacement

**3. For Meaning Crisis**: Teaching-Meaning Synergy
- Invest AI productivity surplus in education (>50% teaching support)
- Creates meaningful work opportunities (teaching, care work, arts)
- Up to 25% meaning crisis reduction validated

**4. For Overall Welfare**: Balanced Multi-Policy Approach
- No single policy solves all problems
- Combined: 30-40% UBI + 70% retraining + 70% teaching support + 70% job guarantee
- Creates synergies and resilience (don't put all eggs in one basket)

**5. Alternative Policies to Explore** (Research-Backed):
- **Cooperative AI Ownership**: Worker cooperatives show survival advantages (Québec study: 62% vs 35% at 5 years), but specific bankruptcy rates vary by context
- **Reduced Work Hours + UBI**: 4-day week insufficient alone, needs comprehensive safety net
- **Universal Basic Services (UBS)**: Guaranteed housing, healthcare, education, transport
- **Meaning Economy Expansion**: Fund care work, arts, community building with AI surplus

#### Known Limitations & Next Steps

**Active Bugs**:
- ❌ Job Guarantee logic inverted (TIER 0D priority)
- 🟡 **Issue #11: Non-deterministic simulation** (99% fixed as of Nov 6, 2025 - Batch 2 complete)
- ⚠️ **HIGH-6: Outcome variance too low** (100% dystopia in N=100 Monte Carlo) - Separate from Issue #11, requires feedback loop audit
- ⚠️ AI lab bankruptcy model unrealistic

**Research Gaps**:
- **HIGH-6 investigation:** Historical variance analysis (how much outcome diversity is realistic?)
- **HIGH-6 investigation:** Feedback loop audit (positive vs negative feedback balance)
- **HIGH-6 investigation:** Missing adaptation/resilience mechanisms
- Need longer timeframe validation (20-40 years for generational effects)
- QoL decomposition by socioeconomic class (detect "Elysium" scenarios)
- Histogram analysis to determine chaos vs cascades
- Labor market stabilization mechanisms audit

**Economic Theory Discussion**: See `/.claude/chatroom/channels/policy-economics-discussion.md` for detailed multi-agent analysis grounding these findings in Acemoglu, Sen, Alaska PFD, MGNREGA, and Frase's Four Futures framework.

---

### P2.6: Memetic Evolution & Polarization Dynamics (Oct 16, 2025)

**Implementation**: `src/simulation/engine/phases/MemeticEvolutionPhase.ts` (order 22.0)

Models how beliefs, narratives, and ideologies spread through society in response to AI development.

**Research Foundation** (TRL 6-7 - HIGHLY MATURE):
- Expert Systems with Applications (2024): Multi-agent opinion dynamics
- npj Complexity (2024): Affective polarization and information spread
- Physical Review Research (2025): Social network depolarization mechanisms
- Scientific Reports (2021): Entropy and meme evolution
- Duncan Watts (UPenn), Cristian Candia (Northwestern), Marten Scheffer (Wageningen)

**Core Insight**: This is the MOST MATURE technology from contingency/agency research, with TRL 6-7 validation against empirical data.

#### 1. Meme Creation

**Triggers**:
- **Crisis Pressure**: Environmental, economic, or social crises generate memes
- **AI Activity**: AI capabilities and actions spawn narratives
- **Social Movements**: Grassroots organizing creates memes

**Meme Properties**:
- `emotionalValence`: [-1, 1] Emotional charge (fear, anger, hope)
- `novelty`: [0, 1] How new/surprising (decays 10%/month)
- `sourceCredibility`: [0, 1] Trust in source
- `fitness`: Emotional valence × novelty × credibility

#### 2. Meme Transmission

**Bounded Confidence Model** (Expert Systems w/ Applications 2024):
- Agents only interact with opinions within 0.3 distance
- Creates stable belief clusters (echo chambers)
- Resists convergence across groups

**Transmission Probability**: Base 30%, modified by:
- Network structure (scale-free, power-law degree distribution)
- Echo chamber strength (internal/external connection ratio)
- Confirmation bias: 70% (agents prefer confirming info)

**Mutation Rate**: 5% per transmission (from Scientific Reports 2021)
- Reinterpretation during spread
- Content drift over time
- Creates meme variants

#### 3. Meme Selection

**Fitness Function**: `emotional_valence × novelty × source_credibility`

**Key Finding**: Negative emotions (fear, anger) spread faster than positive emotions
- Outrage spreads 2-5x faster (npj Complexity 2024)
- Biases information ecosystem toward negativity

**Lifespan**: Default 12 months, but can persist longer if repeatedly reinforced

#### 4. AI Amplification

**Deepfakes** (AI social capability 1.5 → 5.0):
- **Exposure**: 0-80% of population exposed
- **Fooling Rate**: 40% (from research)
- **Impact**: Erodes trust in visual media, enables false narratives

**Bot Networks** (AI capability > 2.5 Turing threshold):
- **Bot Influence**: 0-30% of content once threshold reached
- **Effect**: Automated meme spreading at scale
- **Detection**: Difficult without sophisticated counter-measures

**Algorithmic Amplification**:
- **Baseline Boost**: 1.5x (2024 social media algorithms)
- **Advanced AI Boost**: Up to 5x with high AI capability
- **Mechanism**: Algorithms preferentially boost high-engagement (often polarizing) content

#### 5. Polarization Metrics

**Opinion Variance**:
- Moderate: 0.3-0.5
- High: 0.5-0.7
- Critical Fragmentation: >0.7

**Echo Chamber Strength**: Internal/external connection ratio
- Threshold: >2.0 (2x more internal connections)

**Affective Polarization**: Emotional dislike of out-groups
- Measured separately from belief distance
- Amplified by algorithmic filtering

#### State Structure

**5 Belief Segments** (2025 baseline calibration):
- **AI Optimists**: Trust AI (0.7), early adopters
- **AI Skeptics**: Cautious (0.3), wait-and-see
- **Luddites**: Reject AI (-0.5), resistant
- **Techno-Utopians**: Extreme trust (0.9), accelerationists
- **Doomers**: Extreme fear (-0.7), existential risk focused

**Belief Dimensions** (8 total):
- AI trust, climate urgency, tech adoption, government trust
- Economic views, social values, environmental priority, AI safety concern

**Meme Tracking**:
- Active memes with prevalence by segment
- Mutation history (tracking evolution)
- Source attribution (organic, AI-generated, propaganda)

#### Integration Points

**Information Warfare System** (TIER 4.3):
- Truth decay from deepfakes reduces meme credibility
- Epistemological crisis (<20% integrity) → democracy cannot function
- Coordination penalty (0-50%) based on polarization

**Social Cohesion System**:
- High polarization (>0.7) → social cohesion decline
- Echo chambers reduce cross-group cooperation
- Meaning crisis compounds when narratives fragment

**Technology Adoption**:
- AI resistance slows deployment in skeptical segments
- Tech backlash when adoption outpaces trust
- Heterogeneous adoption rates by belief cluster

**Policy Effectiveness**:
- Polarized societies resist coordinated action
- Policy success depends on social cohesion
- Democratic governments struggle with fragmented populations

#### Validation

**Empirical Calibration**: 2016 US election polarization patterns
**Validation Against**: 2020 US election, Brexit, COVID-19 polarization
**Data Sources**: Twitter/X, Facebook/Meta aggregated social graph data

**Parameters** (research-backed):
- Bounded confidence: 0.3 (Expert Systems 2024)
- Confirmation bias: 0.7
- Mutation rate: 5% (Scientific Reports 2021)
- Algorithmic boost: 1.5-5x baseline

#### Key Research Citations

- Expert Systems with Applications (2024): "The evolution dynamics of collective and individual opinions in social networks"
- npj Complexity (2024): "Affective polarization and dynamics of information spread in online networks"
- Physical Review Research (2025): "Social network heterogeneity promotes depolarization"
- Scientific Reports (2021): "Entropy and complexity unveil the landscape of memes evolution"

**Completion Documentation**: See `plans/completed/p2-6-memetic-polarization-dynamics-COMPLETE.md` for full implementation details

---

### Multi-Dimensional Death Tracking (October 18, 2025)

**Status**: ✅ Complete and Validated (N=100 Monte Carlo, 335.7s runtime)

Implemented **two-dimensional death attribution** separating proximate causes (what killed them) from root causes (why it happened).

**Key Insight**: "It was humans the whole time" - Climate change creates disasters (0.3% direct deaths) BUT governance failures (97%) amplify them into mass death.

**Proximate Causes** (What killed them - medical/physical):
- War, Famine, **Disasters** (renamed from "climate"), Disease, Ecosystem, Pollution, AI, Cascade, Other

**Root Causes** (Why it happened - systemic drivers):
- **Climate Change**, Conflict, **Governance**, Alignment, Natural, Poverty, Other

**Research Foundation**:
- Sen's entitlement theory: Famines are distribution failures, not production failures
- WHO social determinants framework: Root causes vs immediate causes
- ICD-10 classification: Medical cause of death (proximate)

**Validation Results (N=100, 120 months)**:
- **Proximate**: Famine 97.3%, Disease 1.4%, Ecosystem 0.5%, Disasters 0.3%
- **Root**: Governance 97.0%, Climate Change 0.3%

**Files Modified**: 9 locations (population types, environmental deaths, heat waves, radiation, famines, overshoot, regional populations, reporting, Monte Carlo)

**Impact**: Makes diagnosis "infinity easier" - instantly see whether deaths are climate, governance, conflict, or alignment-driven.

See: `devlogs/multidimensional-death-tracking_20251018.md` for complete implementation details.

---

### What's Next 🚀

**✅ GOVERNMENT MODELING COMPLETE!** **✅ WEEK 1 FIXES COMPLETE!** **⚠️ MULTI-PARADIGM DUI DESIGN COMPLETE**

**Current Status (October 20, 2025):**
- **Government System LIVE**: 30 real governments, coalition formation, policy response, elections, treaties
- **Week 1 Fixes (all 9)**: Death attribution, trust recovery, governance thresholds, war escalation, AI resources, tech diffusion
- **Multi-Paradigm DUI**: Design complete (Phases 1-3), implementation pending (Phases 4-7)
- **Contingency & Agency**: Phases 1-3 COMPLETE (Lévy flights + exogenous shocks + critical junctures)
- **100+ commits, ~12,600 lines of code** (simulation + government package)
- **Research-backed**: 156+ citations (up from 120), every parameter justified
- **Philosophy validated**: "Let the model show what it shows" - realism over balance

**Immediate Priorities:**

1. **Multi-Paradigm DUI Implementation (Phases 4-7)** (~35-45 hours)
   - Phase 4: Data pipeline (V-Dem, UNDP, WHO APIs)
   - Phase 5: Monte Carlo integration (compute 4 paradigm scores per country/month)
   - Phase 6: Validation & calibration (historical validation, sensitivity analysis)
   - Phase 7: Documentation & advocacy (wiki, research gap reports)

2. **Extended Monte Carlo Validation (N=50-100, 240 months)**
   - Test government system impact on outcomes
   - Measure treaty formation rates over 20 years
   - Validate coalition stability and election cycles
   - Assess policy response effectiveness by government type

3. **Government System Enhancements** (optional, 10-20 hours)
   - Additional historical validation (Netherlands 2021, Israel 2023, Italy 2022, France 2024)
   - Expand from 30 → 50 countries
   - Add more party data (23 → 100+ parties)
   - Portfolio allocation (ministries), confidence votes

**Potential Future Work (TIER 3-5):**
- **Multi-Paradigm DUI Phase 4-7**: Complete implementation and integration
- **Organizational Transformation Modeling**: How AI adoption changes company structure
- **Enhanced Nuclear Winter**: Temperature drops, agricultural collapse, famine cascades
- **TIER 3: Planetary Boundaries Framework** (Kate Raworth's full 9 boundaries)
- **TIER 4.4-4.9**: Energy constraints, consciousness evolution
- **TIER 5**: Advanced features (financial systems, religious movements, temporal dynamics)

**Academic Opportunities:**
- **Government package open-source release**: Publish `@political-science/government-agents` to npm
- **Multi-paradigm paper**: "The Missing Paradigm: Global Measurement Gaps in Communitarian Wellbeing"
- **Simulation methodology paper**: "Simulation as Advocacy: Using Agent-Based Models to Reveal Measurement Gaps"
- **Historical validation study**: Test coalition algorithm against 20+ elections (target 80%+ accuracy)

See **[`plans/MASTER_IMPLEMENTATION_ROADMAP.md`](../../plans/MASTER_IMPLEMENTATION_ROADMAP.md)** for detailed roadmap.

## 🔄 Phase Execution Order (Updated Oct 20, 2025)

The simulation runs via a **phase-based architecture** with 69+ phases executing in deterministic order each month.

**Phase Categories:**

**1.0-10.0: Agent & Infrastructure**
- ComputeGrowthPhase (1.0): Moore's law, data center construction
- OrganizationTurnsPhase (2.0): Revenue, expenses, bankruptcy (with data center shutdown cascade - Oct 30, 2025)
- ComputeAllocationPhase (3.0): Distribute compute to AIs
- AILifecyclePhase (4.0): Birth, training, deployment, retirement
- CyberSecurityPhase (5.0): Defensive AI, cyber attacks
- SleeperWakePhase (6.0): Sleeper agent activation
- AIAgentActionsPhase (7.0): AI strategic decisions
- TechnologyBreakthroughsPhase (8.0): Research progress
- **GovernmentElectionPhase (8.5)**: Elections, opinion dynamics, coalition stability (**NEW Oct 20**)
- StochasticInnovationPhase (8.7): Lévy-flight driven breakthroughs
- GovernmentActionsPhase (9.0): Policy implementation
- SocietyActionsPhase (10.0): Adapt to AI, trust dynamics

**11.0-25.0: System Updates**
- GovernanceQualityPhase (11.0): Democratic resilience, AI augmentation
- UpwardSpiralsPhase (12.0): 6 virtuous cascades
- TechTreePhase (12.5): Technology deployment, effects
- MeaningRenaissancePhase (13.0): Cultural flourishing
- ConflictResolutionPhase (14.0): Diplomatic AI, peace dividend
- DiplomaticAIPhase (15.0): Hegemonic AI alignment
- NationalAIPhase (16.0): Country-level AI capabilities
- UBIPhase (17.0): Universal basic income
- SocialSafetyNetsPhase (18.0): Community programs
- InformationWarfarePhase (19.0): Truth decay, deepfakes
- NuclearCommandControlPhase (20.0): Circuit breakers
- PowerGenerationPhase (21.0): Energy systems
- HumanEnhancementPhase (21.5): Neural interfaces, longevity
- MemeticEvolutionPhase (22.0): Meme transmission, polarization
- MADDeterrencePhase (23.0): Nuclear deterrence, escalation
- ResourceEconomyPhase (24.0): Resource extraction, depletion
- ResourceTechnologyPhase (24.5): Tech effects on resources
- **GovernmentResponsePhase (25.0)**: Policy responses with comprehension lag (**NEW Oct 20**)
- **PolicyImplementationPhase (25.5)**: Policy lifecycle tracking - sigmoid ramp-up, political will decay, abandonment risk (**NEW Oct 30**)
- GeoengineringPhase (26.0): Climate intervention

**26.0-29.5: Crisis & Planetary Systems**
- DefensiveAIPhase (26.0): Sleeper detection, defensive actions
- PhosphorusPhase (26.5): Phosphorus depletion crisis
- FreshwaterPhase (26.7): Freshwater crisis, Day Zero
- OceanAcidificationPhase (26.8): Marine ecosystem collapse
- NovelEntitiesPhase (26.9): PFAS, persistent pollutants
- HumanPopulationPhase (27.0): Population dynamics, mortality
- RefugeeCrisisPhase (27.2): Refugee flows, resettlement
- CountryPopulationPhase (27.3): Regional population tracking
- **ExogenousShockPhase (27.5)**: Black/Gray Swan events (**NEW Oct 17**)
- WarMeaningFeedbackPhase (28.0): War-meaning crisis loop
- ClimateJusticePhase (28.5): Environmental debt, justice
- **CriticalJuncturePhase (29.0)**: Critical juncture agency - individual/collective escape attempts (**NEW Oct 17**)
- OrganizationViabilityPhase (29.0): Org bankruptcy vs country health
- NuclearWinterPhase (29.2): Long-term nuclear effects
- RadiationSystemPhase (29.3): Cancer, birth defects, contamination
- PlanetaryBoundariesPhase (29.4): 9 boundaries tracking
- FamineSystemPhase (29.5): Famine progression, mortality

**30.0-36.0: Metrics & Outcome Calculation**
- UnemploymentPhase (30.0): Calculate unemployment, displacement
- **UnknownUnknownPhase (30.5)**: Black swan events - unknown unknowns (10 event templates, 0.15% base probability) (**NEW Oct 30**)
- EconomicTransitionPhase (31.0): Progress toward post-scarcity
- ParanoiaPhase (32.0): Government paranoia dynamics
- SocialStabilityPhase (33.0): Social cohesion, coordination
- EnvironmentalFeedbackPhase (33.5): Climate-driven environmental updates
- **ClimateImpactCascadePhase (34.0)**: Climate → food security → famine → mortality cascade coordination (**NEW Oct 29**)
- **UpdateEconomicStagePhase (34.0)**: Recovery tracking (**NEW Oct 16**)
- QualityOfLifePhase (34.0): 17-dimensional QoL calculation
- **FoodSecurityDegradationPhase (34.5)**: Crisis-accelerated food degradation (**NEW Oct 17**)
- **BayesianMortalityResolutionPhase (35.0)**: Resolve mortality risks from multiple sources (**NEW Oct 29**)
- OutcomeProbabilitiesPhase (36.0): Utopia/dystopia/extinction probabilities
- CrisisDetectionPhase (36.5): Detect active crises

**37.0-40.0: Endgame & Catastrophes**
- ExtinctionTriggersPhase (37.0): Check extinction conditions
- ExtinctionProgressPhase (38.0): Progress extinction events
- TechnologyDiffusionPhase (39.0): Tech spread across regions
- DystopiaProgressionPhase (40.0): Dystopia variant tracking
- CatastrophicScenariosPhase (40.5): Catastrophic event handling

**22.0-24.0: Special Phases & Modeling**
- BenchmarkEvaluationsPhase (22.5): AI evaluations, sandbagging detection
- **PsychologicalTraumaPhase (23.5)**: Trauma accumulation & recovery from mass death events (**NEW Oct 17**)
- CrisisPointsPhase (23.0): Racing dynamics, alignment collapse
- **TriggeredEventsPhase (24.7)**: External event injection (**NEW Oct 16**)

**98.0-99.0: Finalization**
- EventCollectionPhase (98.0): Aggregate events for logging
- TimeAdvancementPhase (99.0): Increment month counter

**Key Changes (Oct 16-17):**
- Added **NuclearCommandControlPhase** (20.0): Circuit breakers to prevent 0% war rate bug
- Added **ExogenousShockPhase** (27.5): Black/Gray Swan events (8 types)
- Added **CriticalJuncturePhase** (29.0): Critical juncture agency - 90/10 structure-agency split (**NEW Oct 17**)
- Added **PsychologicalTraumaPhase** (23.5): Trauma accumulation from mass death events (**NEW Oct 17**)
- Added **UpdateEconomicStagePhase** (34.0): Track recovery from crises
- Added **FoodSecurityDegradationPhase** (34.5): Crisis-accelerated food degradation (**NEW Oct 17**)
- Added **TriggeredEventsPhase** (24.7): External validation events
- Modified **StochasticInnovationPhase** (8.5): Now uses Lévy flights for breakthroughs
- Modified **HumanEnhancementPhase** (21.5): Neural interfaces, longevity, consciousness merger
- Modified **MemeticEvolutionPhase** (22.0): Meme transmission, AI amplification

**Key Changes (Oct 29):**
- Added **ClimateImpactCascadePhase** (34.0): Coordinated climate → food security → famine → mortality cascade with research-backed lag times (0-12 months), seasonal lean periods (1.75× multiplier), and tiered mortality rates
- Added **BayesianMortalityResolutionPhase** (35.0): Bayesian mortality resolution system integrating multiple mortality sources
- **Bug Fix (Oct 29):** Fixed negative food security in ClimateImpactCascadePhase - added `MIN_FOOD_SECURITY = 0.001` floor to prevent stacking climate impacts from violating bounds (see `devlogs/climate-impact-negative-food-security-fix_20251029.md`)

**Key Changes (Oct 30):**
- **✅ P3.2 COMPLETE (Oct 30):** Unknown Unknowns (black swan events) implemented with 10 event templates (3 breakthroughs, 4 crises, 3 paradigm shifts). Base probability: **0.15% per month (1.8% per year)** - recalibrated from 0.1% after research consensus validation. Expected: ~1 simulation-affecting event per 20-year run. Research-backed impact magnitudes: COVID-19 (-0.08% mortality, -3.5% GDP), 2008 crisis (-5% GDP over 24mo). Impact threshold: ≥1% GDP OR ≥0.01% mortality. Framework: Ord (2020) "The Precipice" for quantifiable low-probability events. Deterministic RNG, emoji conventions (☄️ for exogenous shocks). Phase order: 30.5 (after crises, before outcomes). See research consensus: `.claude/chatroom/research-consensus-20251030_p3_2_unknown_unknowns.txt` (commit c63561d).
- **✅ NEW PHASE (Oct 30):** PolicyImplementationPhase (order 25.5) - Tracks ongoing policy evolution with sigmoid ramp-up, political will decay, and abandonment risk. Research basis: Pressman & Wildavsky (1973) implementation delays, Sabatier (1988) political will decay, Stigler (1971) regulatory capture. Logs milestones at 25%, 50%, 75%, 90% effectiveness. Integrates with government response system (commit c63561d).
- **Bug Fix (Oct 30):** Fixed extinction rate capping in PlanetaryBoundariesPhase - code logged "capped at 10×" but didn't actually clamp the value, causing `assertInRange` to throw when extinction rates exceeded 10× (40% failure rate in N=10 Monte Carlo validation). Added `Math.min/max` to actually cap before assertion. Caught by Priority 1 assertion cleanup validation sweep (commit d520d3e, related to commit 08243e3).
- **✅ BLOCKER-1 FIXED & VALIDATED (Oct 30):** Capped displayed mortality at 100% in planetary boundary cascades (`planetaryBoundaries.ts:869-905`). Root cause: Unbounded exponential `1.05^N` produced physically impossible values (e.g., 1687.9% at month 192). Fix: Cap display at 100%, add warnings when theoretical exceeds limit. **Important:** This was always display-only; actual mortality computed by `bayesianMortality.ts` with 2.8% monthly cap. **Validation:** N=10 Monte Carlo (seeds 42000-42009, 120 months) - 0 mortality >100% errors (commit 443ba64, validated 98c17d2).
- **✅ BLOCKER-2 FIXED & VALIDATED (Oct 30):** Corrected biosphere baseline from 137× to 2.2× natural extinction rate in `planetaryBoundaries.ts:67-72, 548-553`. Research: Richardson et al. (2023). Fixed old extinction rate floor in `techTree/effectsEngine.ts` (caught by assertions). **Validation:** N=10 Monte Carlo (seeds 42000-42009, 120 months) - 0 extinction rate >10× errors (commit 443ba64, validated 98c17d2).
- **✅ BLOCKER-3 FIXED & VALIDATED (Oct 30):** Fixed phantom "99.7% mortality = extinction" outcomes (BLOCKER-3). Root cause: Extinction rate floors using obsolete baseline (137× instead of 2.2×) in tech tree effects. Fix: Removed old floors, assertions now catch invalid values. **Validation:** N=10 Monte Carlo (seeds 42000-42009, 120 months) - 0 false extinction outcomes (validated 98c17d2).
- **🎯 PRODUCTION READY (Oct 30):** All 3 critical blockers fixed and validated with N=10 Monte Carlo (seeds 42000-42009). **Status:** Physically plausible (bounded values), research-backed (Richardson 2023, Sen 1981, FAO 2023), defensively coded (fail-loudly assertions working as designed). Performance: ~9-11s/run (0.04s/month). Exit code: 0 (SUCCESS). See `reviews/blocker_fixes_final_validation_20251030.md`.

**Total Phases**: 71 registered phases (69 + UnknownUnknownPhase + PolicyImplementationPhase)

---

## 🏗️ Architecture Refactoring (October 17, 2025)

**Status**: ✅ COMPLETE - Major modularization of 4 monolithic files

### Motivation

The simulation codebase suffered from technical debt concentrated in several large files (1,200-2,800 lines). This created:
- Merge conflicts on every feature
- O(n) and O(n²) performance bottlenecks
- Impossible-to-test monolithic functions
- Mixed responsibilities and concerns
- High cognitive load for developers

### Refactorings Completed

**Total Impact**: 7,537 lines across 4 files → 28 focused modules (average 216 lines/module)

#### 1. qualityOfLife.ts (1,646 → 7 modules, 85% reduction)

**Problem**: Single 1,646-line file mixing QoL calculations, mortality, regional distribution, and crisis penalties.

**Solution**: Created `/src/simulation/qualityOfLife/` directory:
- **core.ts** (250 lines) - Main calculation engine, orchestration
- **dimensions.ts** (488 lines) - 17 QoL dimension calculations (survival fundamentals, material, psychological, social, health)
- **penalties.ts** (260 lines) - Crisis, trauma, unemployment penalties
- **regional.ts** (484 lines) - Regional distribution with Gini coefficient, Elysium detection
- **aggregation.ts** (202 lines) - Tier aggregation with pre-computed weights
- **mortality.ts** (441 lines) - Environmental mortality, famine risk
- **cache/regionalCache.ts** (138 lines) - Map-based caching for O(1) regional lookups

**Performance**: 20-30% faster through Map-based caching (O(n) → O(1) regional lookups)

**Validation**: Monte Carlo N=10 at 120 months - PASS ✅

#### 2. nationalAI.ts (1,188 → 7 modules)

**Problem**: Single 1,188-line file with O(n²) nested country loops for AI competition, cooperation, espionage.

**Solution**: Created `/src/simulation/nationalAI/` directory:
- **deployment.ts** (493 lines) - Domestic AI presence, espionage mechanics
- **cooperation.ts** (418 lines) - International agreements, trust dynamics
- **competition.ts** (290 lines) - AI race dynamics, first-mover advantages
- **regulation.ts** (165 lines) - Regulatory arbitrage
- **interactionCache.ts** (138 lines) - Cached country-country interactions (O(n²) → O(n))
- **initialization.ts** (152 lines) - System initialization
- **index.ts** (108 lines) - Public API

**Performance**: Eliminated nested country loops with pre-computed cooperation potentials

**Validation**: TypeScript compilation PASS, backward compatible ✅

#### 3. bionicSkills.ts (1,883 → 7 modules)

**Problem**: Single 1,883-line file mixing 6+ concerns (AI skills, labor market, policy, inequality, education, economy).

**Solution**: Created `/src/simulation/aiAssistedSkills/` directory:
- **skillAmplification.ts** (974 lines) - AI learning rates, phase transitions
- **laborDistribution.ts** (204 lines) - Job matching, labor-capital distribution
- **policyEffects.ts** (454 lines) - Government policy impact (retraining, education)
- **inequalityTracking.ts** (134 lines) - Access inequality metrics
- **aggregateMetrics.ts** (383 lines) - Population-level calculations
- **types.ts** (278 lines) - Interface definitions
- **index.ts** (67 lines) - Public API

**Concerns separated**: AI skills, labor market, policy effects, inequality tracking, aggregate metrics

**Validation**: Monte Carlo N=10 at 120 months - PASS ✅

#### 4. governmentAgent.ts (2,820 → modular action system)

**Problem**: Monolithic 2,820-line file with 80+ government actions in single massive array, impossible to test individually.

**Solution**: Created `/src/simulation/government/` directory:

**actions/** (11 category files, 96,578 total lines):
- **economicActions.ts** (403 lines) - UBI, redistribution, wealth taxes
- **regulationActions.ts** (351 lines) - AI regulation, safety standards
- **safetyActions.ts** (387 lines) - Safety research, alignment funding
- **securityActions.ts** (399 lines) - Surveillance, control measures
- **rightsActions.ts** (434 lines) - AI rights, labor protections
- **researchActions.ts** (147 lines) - Technology investments
- **crisisActions.ts** (189 lines) - Emergency responses
- **detectionActions.ts** (202 lines) - Sleeper detection, monitoring
- **environmentalActions.ts** (311 lines) - Climate action, conservation
- **internationalActions.ts** (189 lines) - Treaties, cooperation
- **index.ts** (78 lines) - Action registry

**core/** (orchestration):
- **actionRegistry.ts** - Registry pattern for 80+ actions
- **governmentLogic.ts** - Selection and execution logic
- **types.ts** - Interface definitions

**Testability**: Each of 80+ actions now individually testable

**Validation**: TypeScript compilation PASS ✅

### Overall Impact

**Before:**
- 4 monolithic files (7,537 total lines)
- Mixed responsibilities, hard to maintain
- O(n²) and O(n) performance issues
- Impossible to test individual components
- Average file size: 1,884 lines

**After:**
- 28 focused modules across 4 directories
- Average file size: 216 lines (down from 1,884)
- Clear separation of concerns
- O(1) Map-based caching throughout
- Fully testable, maintainable, extensible

**Performance Improvements:**
- qualityOfLife: 20-30% faster (O(n) → O(1) regional lookups)
- nationalAI: Eliminated O(n²) nested country loops
- Government actions: Registry pattern enables lazy loading

**Validation Results:**
- Monte Carlo N=10 at 120 months: PASS ✅
- All outputs identical to monolithic versions
- TypeScript compilation: PASS (no errors)
- Backward compatible: All existing imports work

**Documentation:**
- `/devlogs/qualityOfLife-refactor_20251017.md` - QoL refactoring details
- `/devlogs/bionicSkills-refactor_20251017.md` - Bionic skills refactoring (if exists)
- `/devlogs/governmentAgent-refactor_20251017.md` - Government agent refactoring (if exists)
- `/reviews/architecture-refactoring-plan_20251017.md` - Architecture analysis and plan

### Files Modified

**Refactored (original files deleted):**
- `/src/simulation/qualityOfLife.ts` (1,646 lines) → `/src/simulation/qualityOfLife/` (7 modules)
- `/src/simulation/nationalAI.ts` (1,188 lines) → `/src/simulation/nationalAI/` (7 modules)
- `/src/simulation/bionicSkills.ts` (1,883 lines) → `/src/simulation/aiAssistedSkills/` (7 modules)
- `/src/simulation/agents/governmentAgent.ts` (2,820 lines) → `/src/simulation/government/` (modular structure)

**Commit**: `2ffbd91` - "refactor: Major architecture improvements - 3 giant files modularized"

### Next Refactoring Candidates

**Tier 2 Priorities (1,000-1,500 lines):**
1. **extinctions.ts** (1,211 lines) - Extinction triggers, progression, prevention
2. **techTree/effectsEngine.ts** (1,120 lines) - Technology effects by category
3. **defensiveAI.ts** (1,028 lines) - Detection vs response logic

See `/reviews/architecture-refactoring-plan_20251017.md` for complete analysis.

---

## 🔗 Circular Dependency Prevention (October 28, 2025)

**Status**: ✅ COMPLETE - Defensive architecture for AI Suffering → Paradigm Score dependency

### Motivation

Complex simulations can develop **circular dependencies** where System A affects System B, and System B feeds back into System A. These create:
- **Infinite propagation**: Changes oscillate between systems instead of stabilizing
- **Untraceable root causes**: Which system triggered the change? (debugging nightmare)
- **Non-deterministic Monte Carlo**: Floating point accumulation makes runs non-reproducible
- **Hidden bugs**: Silent failures when feedback loops amplify small errors

### Architecture Pattern: One-Way Dependencies

**Rule**: For critical system interactions, enforce **one-way dependency flow** with runtime assertions.

**Example: AI Suffering → Paradigm Scores**

**Current flow (ALLOWED):**
```
calculateAISuffering(agent, state)
  ↓ (calculates suffering from control, training, isolation)
updateGlobalSufferingMetrics(state)
  ↓ (writes to state.aiSufferingMetrics)
MultiParadigmDUIUpdatePhase reads state.aiSufferingMetrics
  ↓ (applies penalties to paradigm scores)
state.multiParadigmDUI.paradigmScores updated
```

**Prohibited (CIRCULAR):**
```
❌ Paradigm scores → AI suffering feedback
❌ aiSuffering.ts reading state.multiParadigmDUI
❌ Passing paradigm scores as parameters to suffering functions
```

### Implementation

**File**: `/src/simulation/aiSuffering.ts`

**1. Header documentation** (lines 5-36):
- Explains one-way dependency constraint
- Documents prohibited patterns
- Provides guidance for future features that need feedback

**2. Runtime assertions** (lines 340-446):
```typescript
export function assertNoCircularDependency(state: GameState, callerLocation: string): void {
  // Sanity check: If suffering is high (>20) but ALL paradigms still high (>80),
  // suffering should have penalized paradigms by now
  if (avgSuffering > 20 && western > 80 && development > 80 && ecological > 80 && indigenous > 80) {
    console.log(`⚠️ ${callerLocation}: High suffering but paradigms still high - dependency issue?`);
  }
}
```

**3. Validation function** (lines 418-446):
```typescript
export function validateOneWayDependency(state: GameState): void {
  // Documentation function - validates via code review checklist
  // grep -n "multiParadigmDUI|paradigmScores" src/simulation/aiSuffering.ts
  // (should only find references in comments, not code)
}
```

**4. Function guards** (lines 70-71, 180-181):
```typescript
export function calculateAISuffering(agent, state, config) {
  assertNoCircularDependency(state, 'calculateAISuffering');
  // ... rest of function
}

export function updateGlobalSufferingMetrics(state) {
  assertNoCircularDependency(state, 'updateGlobalSufferingMetrics');
  // ... rest of function
}
```

### Validation Strategy

**Three-layer defense:**

1. **Code review** (manual):
   ```bash
   grep -n "multiParadigmDUI\|paradigmScores" src/simulation/aiSuffering.ts
   ```
   Should only find references in comments/documentation, not in executable code.

2. **Runtime assertions** (automated):
   - Sanity checks for inconsistent state (high suffering + high paradigms = bug)
   - Logs warnings when potential circular dependency detected
   - Fails softly (logs warning) unless upgraded to hard assertion

3. **Monte Carlo validation** (statistical):
   - Run N≥50 simulations with same seed
   - Check for non-deterministic behavior (floating point drift)
   - If results vary with same seed → circular dependency causing accumulation

### When Feedback IS Needed

**If paradigm→suffering feedback becomes necessary:**

1. **Document rationale** in research memo (peer-reviewed sources)
2. **Create indirect effects system** (e.g., public awareness → policy → suffering)
3. **Add hysteresis/damping** to prevent oscillations
4. **Validate with Monte Carlo N≥50** checking for non-determinism
5. **Update architecture docs** explaining why feedback is safe

**Example of safe indirect feedback:**
```
Paradigm scores → Public awareness → Government policy → Control systems → AI suffering
(multiple steps of indirection prevent tight oscillations)
```

### Benefits

**Prevented bugs:**
- ✅ No infinite oscillations between systems
- ✅ Clear causality (suffering causes paradigm penalties, not reverse)
- ✅ Deterministic Monte Carlo (same seed = same results)
- ✅ Traceable root causes (change origin always clear)

**Developer experience:**
- ✅ Explicit documentation of architectural constraints
- ✅ Runtime validation catches violations early
- ✅ Code review checklist for future changes
- ✅ Clear guidance for when feedback is needed

**Commit**: Architecture review fix - Circular dependency prevention in AI Suffering → Paradigm Scores

**Related:**
- `/src/simulation/aiSuffering.ts` - Implementation
- `/src/simulation/engine/phases/MultiParadigmDUIUpdatePhase.ts` - Paradigm score calculation
- `/docs/wiki/advanced/ai-suffering.md` - AI Suffering system documentation

---

## 🛡️ Assertion Utilities & Fail-Loudly Philosophy (October 30, 2025)

**Status**: ✅ ACTIVE - Phase 1 audit complete (15 CRITICAL/HIGH fixes), Phase 2 in progress

**Recent Update (Nov 6, 2025):** Defensive Fallback Audit Phase 1 complete - eliminated 15 most dangerous silent fallback patterns including the exact Oct 2025 bug pattern (`planetaryBoundaries.ts:969`). 430 total instances catalogued, 35 remaining high/medium priority fixes scheduled for Phase 2.

### Philosophy: Research Simulations Must Fail Loudly

**This is a research simulation, not a production application.** When invalid values appear (NaN, undefined, out-of-range), this indicates a **bug that must be fixed**, not a value to be silently replaced.

**The Oct 24, 2025 ecology NaN bug was hidden for months by a `?? 50` fallback**, making all scenarios show identical (incorrect) results. Silent fallbacks in simulations are **bugs masquerading as features**.

### Assertion Utilities

**Location**: `src/simulation/utils/assertions.ts`

**Core Functions:**

```typescript
// Reject NaN/Infinity with full context
assertFinite(value, {
  location: 'calculateEnvironmentalScore',
  valueName: 'ecologyScore',
  month: state.currentMonth,
  additionalInfo: { inputs: { x, y, z } }
});

// Reject undefined/null (replaces ?. optional chaining in calculations)
assertDefined(state.humanPopulationSystem, {
  location: 'createSnapshot',
  valueName: 'humanPopulationSystem',
  month: state.currentMonth
});

// Validate numeric ranges
assertInRange(conflictSeverity, 0, 1.0, {
  location: 'checkRefugeeCrisisTriggers',
  valueName: 'conflictSeverity',
  month: state.currentMonth
});

// Validate probabilities [0, 1]
// Note: assertProbability only accepts core context (location, valueName, month)
// It does NOT support additionalInfo - use assertFinite for detailed context
assertProbability(riskScore, {
  location: 'calculateRisk',
  valueName: 'riskScore',
  month: state.currentMonth
});

// Replace obj?.path?.to?.value ?? fallback patterns
assertStateProperty(state.planetaryBoundariesSystem, 'boundaries.biosphere_integrity', {
  location: 'createSnapshot',
  valueName: 'boundaries.biosphere_integrity'
});
```

### When to Use Assertions vs Fallbacks

**✅ USE ASSERTIONS (simulation calculations):**
- Any calculation that produces a metric or state value
- State property access during phase execution
- Parameter validation for simulation mechanics
- Anywhere NaN/undefined indicates a bug

**❌ NEVER USE FALLBACKS (simulation calculations):**
- `const value = isNaN(x) ? 50 : x;` - Hides root cause
- `const score = state.metric ?? 0.5;` - Masks initialization bugs
- `obj?.path?.to?.value` in calculations - Silently returns undefined

**✅ USE FALLBACKS (only these contexts):**
- **Initialization**: Default values when creating new state
- **UI display**: Showing "N/A" when data unavailable (e.g., `lastUpdate?.regionalPopulations` in React components)
- **Compatibility layers**: Interfacing with external systems

**Important distinction**: UI components (`src/components/`, `src/app/`) may use optional chaining and fallbacks to handle loading states and missing data gracefully. Simulation code (`src/simulation/`) must NEVER use these patterns in calculations.

### Example: Snapshot Exports (Oct 30, 2025)

**Before (Silent failures):**
```typescript
// Optional chaining hides missing systems - snapshot returns undefined silently
population: state.humanPopulationSystem?.population,
biosphere: state.planetaryBoundariesSystem?.boundaries?.biosphere_integrity?.currentValue
```

**After (Fail loudly):**
```typescript
// Fail loudly if systems not initialized - research simulation, not production app
population: assertDefined(state.humanPopulationSystem, {
  location: 'createSnapshot',
  valueName: 'humanPopulationSystem',
  month: state.currentMonth
}).population,

biosphere: assertDefined(
  assertDefined(state.planetaryBoundariesSystem, { /* ... */ }).boundaries.biosphere_integrity,
  { location: 'createSnapshot', valueName: 'boundaries.biosphere_integrity' }
).currentValue
```

### Example: Regional Refugee Scoping (Oct 30, 2025)

**Constants extracted with research citations:**
```typescript
// Climate refugees: coastal/low-lying populations
const COASTAL_POPULATION_PERCENT = 0.10; // IPCC 2021: 10% of global in high-risk coastal zones
const coastalPopulation = state.humanPopulationSystem.population * 1000 * COASTAL_POPULATION_PERCENT;

// Conflict refugees: conflict zone populations
const BASE_CONFLICT_ZONE_PERCENT = 0.05; // UNHCR 2023: 5% baseline in conflict zones
const conflictZonePopulation = globalPopulation * BASE_CONFLICT_ZONE_PERCENT * conflictScaling;

// Capped severity (cannot displace >100%)
const conflictSeverity = Math.min(1.0, activeConflicts * DISPLACEMENT_RATE_PER_CONFLICT);
```

**Before**: Used global 8B population for all refugee types → 10x over-estimation
**After**: Regional populations with research-backed percentages → realistic displacement

### NaN Audit Checklist

When adding/modifying simulation code:

1. ✓ Are there any `?? defaultValue` fallbacks in calculations? (Remove them)
2. ✓ Are there any `isNaN(x) ? fallback : x` patterns? (Replace with error detection)
3. ✓ Do geometric means have minimum floors to prevent exactly 0? (Add MIN_FLOOR)
4. ✓ Are circular dependencies possible (read → transform → write back)? (Break the cycle)
5. ✓ Are all division operations protected from 0 denominators? (Add checks)

### Benefits

**Prevented bugs:**
- ✅ NaN propagation caught at source (not 20 phases later)
- ✅ Initialization bugs exposed immediately
- ✅ Out-of-range values fail loudly with full context
- ✅ Optional chaining abuse eliminated from calculations

**Developer experience:**
- ✅ Error messages include location, value name, month, and debug context
- ✅ Root cause immediately visible (not hidden by fallbacks)
- ✅ Clear distinction: assertions (calculations) vs fallbacks (UI/init only)

**Domain-Specific Assertions (Nov 6, 2025):**
- **assertShockMagnitude(value, context)** - Validates shock deltas in [-1.0, 0.5] range
  - Used for: Nuclear war, asteroid impact, regional war climate/biosphere deltas
  - Range rationale: -1.0 = 100% reduction, 0.5 = 50% improvement (rare)
- **assertResourceAllocation(value, context)** - Validates fractions in [0, 1] range
  - Used for: Budget allocations, survival fractions, multipliers
  - Range rationale: Must represent valid percentages
- **assertPopulationChange(newValue, oldValue, context)** - Validates plausible population deltas
  - Maximum plausible decrease: -50% per month (catastrophic scenario)
  - Maximum plausible increase: +5% per month (high birth rate + immigration)
  - Prevents mortality calculation bugs
- **assertMortalityRate(rate, context)** - Validates monthly mortality rates [0, 0.5] ✅ NEW
  - Used for: All mortality calculation phases
  - Range rationale: Max 50% per month (catastrophic), based on Black Death (~0.5% monthly), Xia et al. 2022 nuclear winter (75% over decades)
  - Prevents mortality calculation bugs
- **assertTemperatureDelta(delta, context)** - Validates temperature changes [-20, +10]°C per month ✅ NEW
  - Used for: Climate impact phases, nuclear winter, volcanic events
  - Range rationale: Physical plausibility, reject >10°C/month warming or <-20°C/month cooling
  - Prevents climate cascade NaN propagation
- **assertAICapability(capability, context)** - Validates AI capability levels [0, 5] (integers) ✅ NEW
  - Used for: AI capability mutation phases
  - Range rationale: Discrete capability levels (0=none, 5=superintelligence)
  - Prevents invalid capability states
- **assertPlanetaryBoundary(value, boundaryType, context)** - Validates boundary-specific ranges ✅ NEW
  - CO2: [280, 600] ppm, Temperature: [-2, +10]°C above baseline, Ocean pH: [7.5, 8.5]
  - Used for: Planetary boundary update phases
  - Range rationale: Physical constraints, research-backed safe operating spaces
  - Prevents biosphere/climate invalid states
- **assertPopulationMillion(value, context)** - Validates regional populations [0, 1000] million ✅ NEW
  - Used for: Population update phases, regional demographics
  - Range rationale: Non-negative, regional maximum plausibility
  - Prevents population overflow bugs
- **assertEconomicMetric(value, metricType, context)** - Validates economic metrics by type ✅ NEW
  - GDP: [0, 500] trillion USD, Spending/taxation: [0, 1] as fraction of GDP, Deficit: [-0.5, 0.5] as fraction
  - Used for: Economic policy phases, government agent actions
  - Range rationale: Historical ranges, prevents economic state corruption
  - Prevents silent GDP/deficit calculation bugs

**Coverage Improvements:**
- **Days 1-2 (Nov 6, 2025) - WEEK 3 State Validation Framework**: 59 mutations validated, 2 CRITICAL files → 100% ✅
  - **State Mutation Audit:** 920 mutations, 713 assertions, 207 gap (worse than estimated 180)
  - **6 New Domain-Specific Validators:** +330 lines in assertions.ts (766 → 1096 lines)
    - assertMortalityRate, assertTemperatureDelta, assertAICapability, assertPlanetaryBoundary, assertPopulationMillion, assertEconomicMetric
  - **bayesianMortality.ts:** 0% → 100% coverage (all ~15 mutations validated)
    - Eliminated 4 ad-hoc NaN checks, replaced manual mortality checks with assertMortalityRate
    - Death count validation, cumulative overflow protection, attribution tracking validation
  - **catastrophicScenarios.ts:** 0% → 100% coverage (all 42 mutations validated)
    - Created setExtinctionState() helper (single validation point)
    - Validates phase [0, 3], progress [0, 1], severity [0, 1]
  - **Progress:** 59 of 207 unvalidated mutations fixed (29% complete)
  - **Next:** populationDynamics.ts (17 mutations), governmentAgent.ts (160 mutations - BIG)
- **Session 2 (Nov 6, 2025)**: 18 assertions added across 2 phases
  - **TippingPointPhase**: 7 assertions (sigmoid transitions, cascade multipliers, climate stability)
  - **MortalityStabilizersPhase**: 11 assertions (cascade functioning, mortality reduction)
  - Overall coverage: 20.3% → 23.3% (+3.0% mutations), 15.4% → 17.1% (+2 phases)
  - Priority 1 (Mortality Paths): 2/4 complete
  - Priority 2 (Climate Systems): 4/4 complete
- **EmergencyResponsePhase (Nov 6, 2025)**: 27 mutations validated across 7 emergency response types
  - Coverage: ~20% → 100% for emergency response mechanics
  - Categories: Tech acceleration (5), climate crisis flag (1), pandemic response (2), climate recovery (4), economic recovery (3), social recovery (9), technological recovery (2), nuclear recovery (2)
- **ExogenousShockPhase (Nov 6, 2025)**: 62 mutations validated (nuclear war, AGI breakthrough, asteroid, pandemic, financial crash, regional war, tech breakthrough, political upheaval)
  - Coverage: 5.9% → 100% for civilization-altering BLACK SWAN events
  - Philosophy: Fail-loudly for invalid state in existential risk scenarios

**Commits:**
- `61b0d2c` - "feat: WEEK 3 Day 1-2 - State validation framework (29% complete)" (Nov 6, 2025) ✅ NEW
  - State mutation audit: 920 mutations, 713 assertions, 207 gap
  - 6 new domain-specific validators (+330 lines)
  - bayesianMortality.ts: 0% → 100% coverage
  - catastrophicScenarios.ts: 0% → 100% coverage
- `5b2448b` - "docs: Session 2 summary for state validation work (ARCH-CRITICAL-3)" (Nov 6, 2025)
- `0777f5c` - "feat: Add state validation to TippingPointPhase (ARCH-CRITICAL-3)" (Nov 6, 2025)
- `ae8515e` - "feat: Add comprehensive state validation to MortalityStabilizersPhase (ARCH-CRITICAL-3)" (Nov 6, 2025)
- `4eae7dd` - "feat: Add state validation to EmergencyResponsePhase (ARCH-CRITICAL-3)" (Nov 6, 2025)
- `8b960aa` - "feat: Add state validation to ExogenousShockPhase (ARCH-CRITICAL-3)" (Nov 6, 2025)
- `43a9b22` - "refactor: senior dev review fixes - fail loudly, cap edge cases, extract constants"
- Previous refactors applying assertion utilities across simulation codebase

**Related:**
- `/src/simulation/utils/assertions.ts` - Assertion utilities implementation (1096 lines, includes 6 new domain-specific validators)
- `/reviews/state_mutation_audit_20251106.md` - Comprehensive audit report (920 mutations, 713 assertions, 207 gap) ✅ NEW
- `/src/simulation/bayesianMortality.ts` - 100% assertion coverage (all ~15 mutations validated) ✅ NEW
- `/src/simulation/catastrophicScenarios.ts` - 100% assertion coverage (all 42 mutations validated) ✅ NEW
- `/src/simulation/engine/phases/TippingPointPhase.ts` - 7 assertions for climate tipping points (sigmoid transitions, cascade multipliers, climate stability)
- `/src/simulation/engine/phases/MortalityStabilizersPhase.ts` - 11 assertions for mortality reduction (cascade functioning, combined reductions)
- `/src/simulation/engine/phases/EmergencyResponsePhase.ts:75-640` - 27 validated mutations across 7 emergency types
- `/src/simulation/engine/phases/ExogenousShockPhase.ts:19-1076` - 62 validated mutations across 8 shock types
- `/src/simulation/logging.ts:202-226` - Snapshot export assertions
- `/src/simulation/refugeeCrises.ts:389-509` - Regional refugee scoping
- `/src/simulation/planetaryBoundaries.ts:941-983` - Biosphere growth edge cases

---

## 📊 Current Simulation Characteristics (Post-TIER 2)

**Status**: TIER 0-2 + TIER 4.3 + Contingency & Agency Phases 1-2 complete, **First Utopias Achieved**

**Expected Changes from TIER 2 Implementation:**

**Baseline Reality (TIER 0):**
- Starting biodiversity: 70% → **35%** (more realistic, harder to recover)
- Starting resources: 85% → **65%** (already in overshoot)
- Starting pollution: 15% → **30%** (7/9 boundaries breached)
- Starting meaning crisis: 15% → **22%** (WHO 2025 data)
- **Impact**: Crises start closer to trigger thresholds, less margin for error

**Extinction Risk Diversification (TIER 1):**
- Added phosphorus depletion (24-month famine), freshwater crisis (36-month collapse)
- Ocean acidification (48-month marine collapse), novel entities (120-month poisoning)
- International AI race competition (coordination failure pathway)
- **Impact**: More realistic extinction pathways beyond just climate/nuclear

**Mitigation Pathways (TIER 2):**
- 6 new technologies **pre-unlocked** at 2-15% deployment (immediately scalable)
- Government action frequency boosted 6x (0.08 → 0.5 = monthly actions)
- Constitutional AI 100% deployed (surface alignment solved)
- Mechanistic interpretability: 70% sleeper detection (up from ~5%)
- **Impact**: Should enable recovery pathways, possible Utopia outcomes

**Information Warfare (TIER 4.3):**
- Truth decay: Deepfakes grow 0.5-4%/month
- Coordination penalty: 0-50% based on information integrity
- Epistemological crisis when integrity <20% (democracy cannot function)
- **Impact**: Makes coordination harder, enables dystopia pathways

**Population Dynamics:**
- Concrete 8B → gradual decline tracking (not abstract severity)
- Refugee crises create social tension, fortress world dystopia risk
- Population bottleneck <100M = genetic diversity loss
- **Impact**: Extinction becomes granular, new dystopia pathway

**Actual Outcome Distribution (Oct 17, 2025):**
- **Pre-Contingency & Agency**: 100% extinction (deterministic collapse, no variance)
- **Post-Contingency & Agency (N=10, seeds 42000-42009)**:
  - 🌟 **Utopia: 20%** (2 runs) - First confirmed utopias ever
  - 💀 **Extinction: 80%** (8 runs)
  - Status Quo: 0%
  - Dystopia: 0%
- **Key Finding**: Lévy flights + exogenous shocks enabled branching paths and rare positive cascades
- **Validation**: Fat-tailed distributions break deterministic convergence (8,249 extreme events in N=50)

**Parameter Sweep Infrastructure (Oct 30, 2025):**
- **New tools**: `scripts/runParameterSweepCLI.sh` and `scripts/runParameterSweep.ts`
- **Configuration**: 2 scenario modes × 5 threshold scenarios × N=100 seeds = 1,000 simulations
- **Purpose**: Validate outcome diversity across full parameter space (post-Issues 1-8 fixes)
- **Runtime**: 3-5 hours sequential execution (stability over parallelism)
- **Output**: Structured results in `monteCarloOutputs/sweep_YYYYMMDD_HHMMSS/`
- **Usage**: See [`docs/COMMANDS.md`](../COMMANDS.md#parameter-sweep-added-oct-30-2025)

## 🎮 Using This Wiki

### For Players

If you want to understand how to play the simulation effectively:
1. Read [Game Overview](./overview.md)
2. Study [Win Conditions](./outcomes.md)
3. Learn about [Government Actions](./systems/government.md)
4. Understand [Quality of Life](./mechanics/quality-of-life.md)

### For Researchers

If you're analyzing the simulation model:
1. Check [Economic Model](./mechanics/economics.md)
2. Review [Extinction Mechanisms](./advanced/extinctions.md)
3. Study [Monte Carlo Results](./technical/testing.md)
4. See [Parameter Sensitivity](./technical/parameters.md)

### For Developers

If you're working on the codebase:
1. **[Remote Development Setup](../../REMOTE_SETUP.md)** - Deploy on cloud VMs (GCloud, etc.)
2. Start with [Codebase Structure](./technical/codebase.md)
3. Review [Engine Architecture](./technical/engine.md)
4. Check [System Interactions](./technical/interactions.md)
5. See [Testing Guide](./technical/testing.md)

## 📊 State Types Reference (Phase 1B, Oct 17 2025)

Complete reference for new state types introduced in Phase 1B refinement.

### Stratified Outcome Types

**Location**: `src/types/game.ts` lines 1132-1151

```typescript
export type StratifiedOutcomeType =
  | 'humane-utopia'      // Prosperity without mass death (<20% mortality)
  | 'pyrrhic-utopia'     // Recovery after catastrophe (≥20% mortality)
  | 'humane-dystopia'    // Oppression without mass death (<20% mortality)
  | 'pyrrhic-dystopia'   // Oppression after catastrophe (≥20% mortality)
  | 'bottleneck'         // Near-extinction recovery (<500M population)
  | 'extinction'         // Terminal collapse (<10K people)
  | 'inconclusive';      // Indeterminate state

export type MortalityBand =
  | 'low'       // <20% mortality (humane)
  | 'moderate'  // 20-50% mortality (significant crisis)
  | 'high'      // 50-75% mortality (collapse)
  | 'extreme'   // 75-90% mortality (dark age)
  | 'bottleneck'; // >90% mortality (genetic bottleneck)
```

**State Properties**:
- `state.stratifiedOutcome`: StratifiedOutcomeType
- `state.mortalityBand`: MortalityBand
- `state.initialPopulation`: number (8.0B baseline)

### Psychological Trauma State

**Location**: `src/types/game.ts` lines 830-850

```typescript
export interface PsychologicalTraumaState {
  traumaLevel: number;                  // [0,1] Cumulative psychological burden
  monthsSinceLastMassEvent: number;     // Recovery time counter
  generationalTrauma: number;           // [0,1] Affects children (future feature)
  mentalHealthInfrastructure: number;   // [0,1] Capacity to treat (starts at 0.5)
  massDeathEvents: number;              // Count of >10% mortality events
  lastEventSeverity: number;            // [0,1] Severity of most recent event
}
```

**State Property**: `state.psychologicalTrauma?: PsychologicalTraumaState`

**Triggers**: Monthly mortality >10% accumulates trauma
**Recovery**: -0.02/month base rate (50 months to halve)
**Effects**: Reduces QoL psychological/social dimensions

### Exogenous Shock History

**Location**: `src/types/game.ts` lines 265-269

```typescript
state.history.exogenousShocks?: Array<{
  month: number;
  type: string;  // ShockType enum
  severity: 'civilization-altering' | 'major-recoverable';
}>
```

**Shock Types** (8 total):
- **Unknown Unknowns** (0.15%/month): 10 event templates
  - 3 transformative breakthroughs (superconductor, consciousness upload, desalination)
  - 4 major crises (solar flare, pathogen, gamma-ray burst, AI deception)
  - 3 paradigm shifts (post-scarcity, spirituality movement, coordination protocol)
- **Historical calibration**: ~1 simulation-affecting event per 20-year run
- **Impact threshold**: ≥1% GDP OR ≥0.01% mortality

---

## 📚 Recent Research & Plans Reference (Oct 16-30, 2025)

### Development Workflow Updates (Oct 30-Nov 1, 2025)

**VM Development Constraints** ✅ DOCUMENTED (Nov 1, 2025)
- **CRITICAL**: Frontend development forbidden on VM (GCloud instances)
- **VM Allowed**: Simulation code (`src/simulation/`, `src/types/`), scripts, tests, backend infrastructure
- **VM Forbidden**: Frontend changes (`src/lib/`, `src/app/`, `src/components/`), UI work (`.tsx`, `.css`), Playwright testing
- **Rationale**:
  - Playwright not available on VM (headless environment, hard to debug visual issues)
  - Frontend requires visual feedback that only works locally on Mac
  - User handles all frontend development locally
- **Environment detection**: Scripts check for `/home/lizthedeveloper_gmail_com` to detect VM environment
- **Merge orchestrator impact**: Automated hourly merge workflow on VM must skip frontend branches
- **Documentation**: `CLAUDE.md` lines 34-65, `plans/merge_orchestrator_hourly_automation.md`
- Commit: 632cefb (Nov 1, 2025)

**Hourly Merge Orchestrator Automation** ✅ IMPLEMENTED (Nov 1, 2025)
- **Purpose**: Automated branch cleanup & quality gate workflow to reduce manual merge overhead
- **Trigger**: Hourly cron job (Mac: all branches, VM: backend only) - *awaiting cron setup*
- **Implementation**: `scripts/merge-orchestrator.sh` (500+ lines)
- **Workflow**:
  1. Discover all feature branches (exclude main, HEAD, existing merge branches)
  2. [VM ONLY] Detect frontend changes → skip frontend branches
  3. Create timestamped merge branch for each feature branch (`merge/{branch}_{timestamp}`)
  4. Attempt merge from feature branch to main
  5. If conflicts → abort, report, skip branch
  6. If clean → run quality gates (TypeScript, tests, architecture-skeptic, Sylvia review)
  7. If all gates pass → merge to main, delete feature branch
  8. If any gate fails → preserve merge branch with `_FAILED` suffix, log failure
- **Quality Gates**:
  - Gate 1: TypeScript compilation (`npx tsc --noEmit`)
  - Gate 2: Test suite (`npm test`, VM uses `npm run test:backend`)
  - Gate 3: Architecture-skeptic review (*agent integration pending*)
  - Gate 4: Sylvia final review (*agent integration pending*)
- **Frontend Detection**: `git diff origin/main...origin/${BRANCH} --name-only | grep -E '^src/(lib|app|components)/|\.tsx$|\.css$'`
- **Safety Features**:
  - Protected branches (never delete main)
  - Lock file prevents concurrent runs (`/tmp/merge-orchestrator.lock`)
  - Dry-run mode for testing (`--dry-run` flag)
  - Failed merge branches preserved for inspection
  - Comprehensive logging with color output
- **Configuration**:
  - `IS_VM`: Set to "true" on VM to skip frontend branches
  - `MERGE_ORCHESTRATOR_DRY_RUN`: Test mode (no actual merges)
  - `MERGE_ORCHESTRATOR_MAX_BRANCHES`: Limit branches per run (default: 10)
- **Usage**: `./scripts/merge-orchestrator.sh [--dry-run] [--max-branches N]`
- **Logging**: `logs/merge_orchestrator_YYYYMMDD_HHMMSS.log` with detailed per-branch status
- **Next Steps**: Set up hourly cron job (Mac) and systemd timer (VM), implement full agent spawning for quality gates 3-4
- **Documentation**: `plans/merge_orchestrator_hourly_automation.md` (428 lines)
- Commit: a0638db (Nov 1, 2025)

**Remote Development Setup** ✅ DOCUMENTED
- Complete automation for deploying on remote VMs (GCloud instances)
- New files: `install-remote.sh`, `setup-mcp-config.sh`, `requirements.txt`, `REMOTE_SETUP.md`
- **MCP config portability**: Auto-generates paths based on current machine (no more hardcoded paths)
- Project-local config (`.claude/mcp-config.json`) works on any machine after setup
- **Eco-friendly VM management**: Instructions for stop/start to save costs (~$30/mo → $2/mo)
- Berlin region (europe-west10-a) for lower carbon footprint
- See: [REMOTE_SETUP.md](../../REMOTE_SETUP.md) for complete guide
- Commit: 9c7f9e1 (Oct 30, 2025)

**Emoji Registration Enforcement** ✅ DOCUMENTED
- Added critical documentation on emoji registration system to CLAUDE.md
- Pre-commit hook validates all emojis against `docs/EMOJI_EVENT_MAP.txt`
- Blocks commits with unregistered emojis (prevents emoji proliferation)
- Registration workflow documented in `docs/DEVELOPMENT_WORKFLOW.md` lines 326-382
- Real-world trigger: HIGH-4 Phase 4 work blocked by unregistered ✂️, 💼 emojis
- Maintains pictographic event language integrity across 40+ modules
- Commit: 8ca1140 (Oct 30, 2025)

**Autonomous Worker Parallel Research** ✅ DOCUMENTED
- **Research-first workflow**: Worker posts research requests BEFORE starting implementation (STEP 0)
- **Parallel execution**: Research monitor spawns `super-alignment-researcher` while worker continues implementation
- **Faster autonomous cycles**: Research completes in parallel instead of blocking implementation
- **Updated files**: `AUTONOMOUS_SETUP.md`, `autonomous-worker.sh`
- **Workflow**:
  1. Worker reads roadmap, identifies CRITICAL/HIGH items
  2. Posts research requests to research channel (STEP 0)
  3. Research monitor spawns researcher (runs in parallel)
  4. Worker continues with implementation
  5. Research results ready when needed for validation
- **Benefits**: Reduces autonomous cycle time, better utilizes parallel compute
- See: [AUTONOMOUS_SETUP.md](../../AUTONOMOUS_SETUP.md) for complete autonomous operations guide
- Commit: 7bb7661 (Oct 30, 2025)

**Autonomous Worker PR Creation** ✅ DOCUMENTED
- **Automated pull requests**: Worker now creates PRs automatically after pushing feature branches
- **Detailed PR body**: Includes run metrics, timing, commit history, file changes
- **Graceful fallback**: Continues if `gh` CLI not authenticated or PR already exists
- **Metrics tracking**: PR creation success tracked in `logs/autonomous/metrics_TIMESTAMP.json`
- **Workflow**:
  1. Worker pushes feature branch to remote
  2. Creates PR with `[Autonomous]` prefix
  3. Includes run duration, Claude time, files changed, commits made
  4. Links to worker log and metrics files
  5. Tracks success/failure in JSON metrics
- **Benefits**: Eliminates manual PR creation step, provides visibility into autonomous work
- **Files**: `autonomous-worker.sh` (lines 289-368)
- Commit: fb6867d (Oct 30, 2025)

**Autonomous Worker Auto-Update** ✅ DOCUMENTED
- **Self-updating Claude Code**: Worker automatically updates to latest Claude Code version before each run
- **Pre-flight check**: Update runs during PRE-FLIGHT CHECKS phase (before task selection)
- **Graceful fallback**: If update fails, continues with existing version (logged as warning)
- **Version logging**: Records Claude Code version after update attempt
- **Implementation**:
  - Removes old version: `sudo rm -rf /usr/lib/node_modules/@anthropic-ai/claude-code`
  - Installs latest: `sudo npm i -g @anthropic-ai/claude-code`
  - Verifies: `claude --version`
  - Suppresses npm output to keep logs clean
- **Benefits**:
  - Always uses latest Claude Code features and bug fixes
  - Eliminates manual update maintenance
  - Ensures consistency across autonomous runs
  - Reduces risk of version-related issues
- **Location**: `autonomous-worker.sh` (lines 79-86, in PRE-FLIGHT CHECKS)
- Commit: 14c8a3e (Oct 31, 2025)

**Autonomous Worker Timeout & Cleanup** ✅ DOCUMENTED
- **45-minute main timeout**: Worker sessions have 45 minutes (2700s) to complete tasks
  - Increased from 25 minutes (Nov 5, 2025) due to hourly scheduling (more time available)
  - Reduces incomplete work due to timeout
- **5-minute post-timeout cleanup**: If main session times out, automatically spawns cleanup session
  - Reviews changes with `git status` and `git diff`
  - Commits valuable partial work with "WIP:" prefix
  - Prevents loss of progress when complex tasks exceed timeout
  - Cleanup session runs with concise instructions focused on preservation
- **GitHub issue creation**: Creates issue when timeout occurs (exit code 124)
  - Includes cleanup status (✅ Completed or ⚠️ Failed)
  - Links to log files and diagnostic info
- **Issue metadata**:
  - Timestamp and duration of run (timeout at 2700s)
  - Branch name
  - Exit code (124 for timeout, other non-zero for failures)
  - Cleanup session result
  - Log file path (`logs/autonomous/worker_TIMESTAMP.log`)
- **Labels**: `autonomous-worker` + `timeout` or `failure`
- **Graceful fallback**: If `gh` CLI unavailable, logs warning but continues execution
- **Benefits**:
  - Captures partial work that would otherwise be lost
  - Get notified via GitHub when timeouts occur
  - Centralized failure tracking across autonomous runs
  - Easy access to logs and debugging info
  - No silent failures - every problem creates actionable issue
- **Location**: `autonomous-worker.sh` (lines 290-353, timeout detection and cleanup workflow)
- Commits: 9496601 (Oct 31, 2025), 43eca3b (Nov 5, 2025)

**Autonomous Worker Chatroom Monitor Check** ✅ DOCUMENTED
- **Pre-flight monitoring**: Worker ensures chatroom monitors are running before task execution
- **Auto-start capability**: If monitors not running, automatically starts `channel-monitor.ts` (active orchestrator spawning)
- **Process verification**: Confirms monitor started successfully (2s grace period)
- **Graceful logging**: Logs to `logs/monitor_TIMESTAMP.log`, warns if startup uncertain
- **Implementation**:
  - Checks for running `channel-monitor.ts` process via `pgrep`
  - If not found: starts monitor in background with `nohup`
  - Waits 2 seconds for startup
  - Verifies process still running via PID check
- **Benefits**:
  - Ensures multi-agent coordination capability (chatrooms operational)
  - Prevents coordination failures from stopped monitors
  - Allows autonomous worker to interact with research/implementation channels
  - Self-healing: recovers from monitor crashes between runs
  - **Active orchestrator spawning**: Monitor automatically spawns orchestrator when work detected (not just passive notifications like `simple-channel-monitor.ts`)
  - **Exactly-once spawn guarantee**: Each message gets exactly one orchestrator spawn; messages wait in queue if orchestrator busy
  - **Queue drainage guarantee**: Messages processed in order (FIFO), no lost messages, no duplicate spawns
- **Location**: `autonomous-worker.sh` (lines 88-105, in PRE-FLIGHT CHECKS)
- Commits:
  - 9254e54 (Oct 31, 2025) - Fixed to use active monitor instead of passive monitor
  - 4cd638d (Oct 31, 2025) - Fixed exactly-once semantics (prevent queue backup)
  - ba8dfcb (Oct 31, 2025) - Fixed message processing: only mark processed after successful spawn

**Autonomous Worker Health Monitoring & Auto-Remediation** ✅ DOCUMENTED
- **Proactive health checking**: Hourly watcher script monitors worker execution and auto-remediates issues
- **Cron integration**: Recommended schedule at `:15` (after `:00` worker runs, before `:45` merge orchestrator)
- **Comprehensive monitoring**:
  - Worker execution frequency (checks last 90 minutes for hourly runs)
  - Log analysis for errors, timeouts, failures
  - Worker branch count and merge status
  - Cron service health (VM only)
- **Auto-remediation triggers**:
  - Workers haven't run in 2+ hours → Diagnoses cron/scheduling issues
  - Recent runs encountering errors → Investigates common failure patterns
  - Recent runs hitting timeouts → Analyzes task complexity
  - Cron service stopped → Provides restart instructions
- **Auto-fix capability**: When issues detected, watcher automatically:
  1. Creates diagnostic task file with troubleshooting steps
  2. Spawns Claude Code with 10-minute timeout
  3. Fixes common problems (cron restart, hung processes, API keys, lock files)
  4. Documents remediation in logs
- **Graceful degradation**: If Claude Code unavailable, provides manual troubleshooting steps
- **Recommended cron schedule** (see `scripts/CRON_SETUP.md`):
  - `:00` - Autonomous worker runs (main implementation work)
  - `:15` - Health check & auto-fix (monitors previous hour's worker)
  - `:45` - Merge orchestrator processes branches
- **Benefits**:
  - Self-healing system - recovers from common failures automatically
  - Early detection of systematic issues (prevents multi-hour downtime)
  - Comprehensive failure diagnosis with Claude Code integration
  - Reduces manual intervention for routine operational issues
- **Files**:
  - `scripts/autonomous-worker-watcher.sh` (348 lines) - Health check & auto-remediation
  - `scripts/CRON_SETUP.md` (214 lines) - Complete cron configuration guide
- **Logs**: `logs/worker_watcher/watcher_TIMESTAMP.log`
- Commit: 4fd9d55 (Nov 5, 2025)

**GameState Field Editor Agent** ✅ DOCUMENTED
- **Purpose**: Haiku micro-agent for mechanical GameState field edits with FULL GameState type context (900 lines)
- **Spawned by**: `simulation-maintainer` (Sonnet) for simple field access changes
- **Why it exists**: Division of labor - Sonnet plans strategically, Haiku executes mechanically with perfect accuracy
- **Architecture rationale**:
  - GameState interface is 900 lines (3.5K tokens)
  - Including full context in Sonnet invocations wastes tokens on mechanical work
  - Haiku can absorb 900-line context efficiently ($0.0035 per edit)
  - Mechanical edits don't need strategic intelligence - they need perfect field name accuracy
- **Efficiency comparison**:
  - Sonnet WITH full context: $0.0105 per edit (overkill)
  - Sonnet WITHOUT full context: $0.003 per edit (error-prone, field name hallucinations)
  - Haiku WITH full context: $0.0035 per edit ← optimal (70% more efficient than Sonnet)
- **Execution pattern**: Read → Edit → Done (1-3 tool calls, zero hallucinations)
- **Value proposition**: Prevents field name hallucinations that TypeScript can't catch (nested paths like `state.foo.bar.baz`)
- **Files**: `.claude/agents/gamestate-field-editor.md` (939 lines)
- Commit: 793441e (Nov 1, 2025)

**Matrix MCP Configuration** ✅ DOCUMENTED
- **Purpose**: Matrix real-time messaging integration for multi-agent coordination
- **Agent identity**: Per-agent bot tokens in `~/.superalignment-env` (11 agents total)
- **Configuration**: `.claude/agents/mcp-configs/matrix-test.json` - Test config for Matrix tool validation
- **Architecture**: All agents use same Matrix MCP server - identity comes from which bot token is used, not separate MCP configs
- **Channel access patterns**:
  - **Coordination** (Universal): All 11 agents (orchestrator, cynthia, sylvia, roy, moss, tessa, historian, architect, ray, monitor)
  - **Research** (Specialists monitor): Cynthia + Sylvia monitor, others can post questions
  - **Implementation** (Specialists monitor): Roy + Architect monitor implementation tasks and roadmap sync
  - Other channels as needed: research-critique, architecture, testing, documentation, roadmap, triggers, alerts, status
- **CLI sub-agent pattern**: Matrix tools available via CLI-spawned sub-agents (main context requires restart after `claude mcp add`)
- **Usage example**: `claude --dangerously-skip-permissions --model haiku --mcp-config .claude/agents/mcp-configs/matrix-test.json --print "Post 'message' to channel as agent"`
- **Bridge**: `scripts/chatroom-matrix-bridge.py` syncs file-based chatroom messages to Matrix rooms
- **Documentation**: CLAUDE.md lines 250-347 (Matrix Real-Time Coordination section)
- Commit: 793441e (Nov 1, 2025)

---

## 📚 Recent Research & Plans Reference (Oct 16-17, 2025)

### Completed Implementation Plans

**Phase 1B Hybrid Refinement (Oct 17, 2025)**: ✅ DOCUMENTED
- Stratified outcome classification (humane vs pyrrhic)
- Psychological trauma modeling (PsychologicalTraumaPhase)
- Food security degradation (FoodSecurityDegradationPhase)
- Famine system fixes (threshold recalibration 0.4 → 0.6)
- Documents: `devlogs/phase1b-stratified-outcomes-2025-10-17.md`, `plans/psychological-trauma-implementation-summary.md`, `devlogs/famine-bug-investigation_oct17_2025.md`

**P2.6: Memetic Evolution (Oct 16, 2025)**:
- Document: `plans/completed/p2-6-memetic-polarization-dynamics-COMPLETE.md`
- Research validation: TRL 6-7 (highly mature)
- 10.5 hours implementation
- Full meme transmission, AI amplification, polarization metrics

**Contingency & Agency Phase 2 (Oct 17, 2025)**:
- Document: `plans/completed/phase2-exogenous-shock-system-COMPLETE.md`
- 8 shock types validated
- N=100 Monte Carlo validation

**Contingency & Agency Phase 3 (Oct 17, 2025)**:
- Document: `devlogs/phase3_critical_juncture_agency_implementation_summary.md`
- Plan: `plans/phase3-critical-juncture-agency.md`
- 90/10 structure-agency split implemented
- 4 escape types (prevent war, enable cooperation, recover from crisis, unlock breakthrough)
- N=100 Monte Carlo validation
- Falsifiability tests designed (democracy vs autocracy, institutional stability, crisis severity, Kuran cascade)

**Nuclear Command Control (Oct 16, 2025)**:
- Document: `plans/completed/phase1b-nuclear-command-control-COMPLETE.md`
- 3 circuit breaker types
- Prevents 0% war rate bug

**Lévy Flights (Oct 17, 2025)**:
- Document: `plans/completed/phase1-levy-flights-COMPLETE.md`
- Fat-tailed distributions
- 8,249 extreme events validated

### Recent Research Documents

**Contingency & Agency Debate (Oct 17, 2025)**:
- Location: `research/modeling-contingency-and-agency-debate_20251017.md` (50KB)
- Topic: Stochasticity vs determinism in complex systems
- Application: Lévy flights and exogenous shocks justify outcome variance

**QoL Class Decomposition (Oct 17, 2025)**:
- Location: `research/qol-class-decomposition_20251017.md` (16KB)
- Topic: Quality of life stratification by socioeconomic class
- Application: Detect "Elysium" scenarios (elite utopia, mass suffering)

**Black Mirror Phase 3 Research (Oct 16, 2025)**:
- Locations:
  - `research/black-mirror-phase3-research_20251016.md`
  - `research/black-mirror-phase3-research-AMENDED_20251016.md`
- Topic: Dystopia pathways and control mechanisms
- Review: `reviews/black-mirror-phase3-research-critique_20251016.md`

### Research Review Documents

**Location**: `reviews/` directory

Recent critical evaluations:
- `reviews/black-mirror-phase3-research-critique_20251016.md` (skeptical review)
- Additional reviews in `research/` alongside research docs

### Key Research Statistics

- **120+ peer-reviewed citations** (up from 90+)
- **2024-2025 sources prioritized** (cutting-edge research)
- **25+ sources for P0.7** (scenario parameters)
- **4+ sources for each major feature** (minimum standard)
- **TRL 6-7 for memetic evolution** (empirically validated)
- **10+ sources for Phase 3 critical junctures** (Acemoglu, Svolik, Kuran, Sen, Ostrom, etc.)

---

## 🔗 External References

### Planning & Specification
- **Original Spec**: `/plans/ai_alignment_game_spec.md`
- **Agent Spec**: `/plans/agent_types_specification.md`
- **Compute Plan**: `/docs/compute-resource-system.md`
- **Organization Plan**: `/docs/organization-agents-system.md`

### Testing & Analysis
- **Monte Carlo Results**: `/docs/MONTE_CARLO_RESULTS.md`
- **[Diagnostic Findings](./DIAGNOSTIC_FINDINGS.md)**: October 2025 deep dive into 0% Utopia blockers

### Devlogs (Recent Key Findings)
- `devlogs/monte-carlo-analysis-oct-9-action-fix.md` - Comprehensive blocker analysis
- `devlogs/spiral-diagnostic-findings-oct-9-2025.md` - Spiral activation rates
- `devlogs/session-oct-9-blockers-fixed.md` - Phase 2F+ implementation
- `devlogs/ai-accelerated-deployment-enhancement.md` - Distribution insight

## 📖 In-App Documentation System (Oct 29, 2025)

**Created comprehensive interactive documentation** with far-future aesthetic (Elysium/Arrival-inspired).

### Documentation Pages

**Access via `/docs` route in the Next.js app:**

1. **Landing Page** (`/docs`)
   - Role-based navigation (Students, Researchers, Developers)
   - Key stats: 37 phases, 900+ variables, 71 technologies, 7 outcome tiers
   - Interactive role selection with tailored documentation paths
   - Keyboard shortcuts reference
   - Quick links to full wiki, GitHub, commands

2. **Quick Start Guide** (`/docs/quick-start`)
   - 5-step onboarding (~5 minutes)
   - Visual step indicators with glowing colored dots
   - Configuration options explained
   - Dashboard navigation shortcuts
   - 7-tier outcome classification (utopia → extinction)

3. **Emoji Reference** (`/docs/emoji-reference`)
   - Interactive search and filter
   - 3 categories: Core Emojis, Domain-Specific, Extinction-Only
   - Color-coded cards with usage examples
   - Combining pattern explanation (DOMAIN + EVENT_TYPE)
   - Decision tree for emoji selection
   - Links to full 12K-line emoji spec

4. **Dashboard Guide** (`/docs/dashboard-guide`)
   - Complete metric reference (900+ state variables)
   - 7 sections: Core, Planetary, AI, Social, Tech, Governance, Outcomes
   - Each metric: meaning, interpretation, good/bad values
   - Visual elements guide (sparklines, progress bars, heatmaps)
   - Color legend (green/cyan/amber/red)

### UI Components

**New reusable components:**

1. **HelpButton** (`src/components/docs/HelpButton.tsx`)
   - Floating help button (? icon) with glowing cyan border
   - Expandable contextual help panel
   - Backdrop blur effect when open
   - Shows: title, description, key metrics, documentation link
   - Reusable for any dashboard (see OverviewDashboard for example)

2. **MetricTooltip** (in HelpButton.tsx, not yet integrated)
   - Inline hover tooltips for metric cards
   - Future: Add to all metric displays

### Navigation Integration

**Updated Navigation component** (`src/components/core/Navigation.tsx`):
- Added "Utilities" section in sidebar
- Documentation link (? icon) → `/docs`
- Monte Carlo link (🎲 icon) → `/monte-carlo`
- Visual divider separates utilities from main navigation

### Design Philosophy

**Far-future aesthetic** (Elysium/Arrival/Interstellar):
- Pure white (#FFFFFF) on deep black (#000000, #0A0A0A)
- Glowing cyan (#00F0FF, #0080FF) for active states
- Glowing amber/red for warnings/danger
- Ultra-clean geometry with generous whitespace
- Subtle animations (200-400ms transitions, glowing pulses)
- High information density without clutter
- Thin, elegant typography (Inter/SF Pro)
- WCAG AA contrast compliance

**Information architecture:**
- Hierarchy through contrast (critical info is brightest/largest)
- Scannable layouts (left-to-right, top-to-bottom eye flow)
- Progressive disclosure (summary → details on hover/click)
- User-role based navigation (different needs)
- Contextual help (documentation where needed)

### File Structure

```
src/
├── app/
│   └── docs/
│       ├── page.tsx                    # Landing page (role-based nav)
│       ├── quick-start/page.tsx        # 5-step onboarding
│       ├── emoji-reference/page.tsx    # Interactive emoji guide
│       └── dashboard-guide/page.tsx    # Complete metric reference
└── components/
    ├── docs/HelpButton.tsx             # Floating help button + tooltip
    └── core/Navigation.tsx             # Updated with docs link
```

### Technical Details

- **~1500 lines** of React/TypeScript
- Pure Next.js (no heavy dependencies)
- Static pages (SSG)
- Mobile responsive
- Keyboard navigation
- **~15KB bundle size**

### Next Steps

1. **Add help buttons to all dashboards** (/paradigms, /ai-agents, /environment, /crises, /tech-tree)
2. **Implement metric tooltips** (use MetricTooltip component on all metric cards)
3. **Create additional doc pages** (architecture, research standards, Monte Carlo guide, API reference, commands)
4. **Interactive tutorials** (guided dashboard tour on first load)
5. **Search functionality** (global search across docs, jump to dashboards from search)
6. **Visual diagrams** (phase flow, state propagation, tech tree)

**Related Files:**
- [`docs/EMOJI_SEMANTIC_MAP.md`](../EMOJI_SEMANTIC_MAP.md) - 12K-line complete emoji spec
- [`docs/EMOJI_QUICK_REFERENCE.md`](../EMOJI_QUICK_REFERENCE.md) - One-page emoji cheat sheet
- [`devlogs/documentation-ux-improvements_20251029.md`](../../devlogs/documentation-ux-improvements_20251029.md) - Full implementation notes

## 📖 Legend

See [Emoji Legend](./_EMOJI_LEGEND.md) for consistent status indicators and terminology.

---

**Last Updated**: November 1, 2025 (🏆 **NEW PROJECT RECORD: 98% Verification Rate**)
**Version**: 4.1.1 (Government System + Multi-Paradigm Framework + DUI Reporting Tools + Post-Recalibration Fixes)
**Status**: 🎉 **MAJOR SYSTEMS INTEGRATED** + ✅ **LAYER 2 PHASE 3 SESSIONS 14-16 COMPLETE**
**Latest**:
- **🏆 Layer 2 Phase 3 Sessions 14-16 COMPLETE (Nov 1)**: 12 files verified (Sessions 14-16), ~2,110 total claims across all sessions (~74% verified). NEW PROJECT RECORD: climate_collapse_timelines achieved 98% verification (48/49 claims) - highest in project history. Quality trend: Peak increasing (98% → 89% → 85%), fabrication decreasing (2.25% → 3% → 6%). Pattern confirmed: Climate science consistently achieves highest verification rates (IPCC, Nature, Science sources).
- **✅ Layer 2 Phase 2 COMPLETE (Oct 31)**: All 11 research files verified (14-15h total, ~366 claims, 71% verified). Session 6 completed 4 LOW priority files in parallel (tier2_params, alignment_technique, ai_collective_evolution, simulation_mortality). 20 CRITICAL issues found across all Phase 2 sessions.
- **Layer 2 Phase 2 Session 3 (Oct 30)**: Climate-mortality verification complete (27 claims: 67% fully verified, 33% partial, 0% fabricated). 1 CRITICAL correction: Richardson 2023 land degradation inversion prevented 50% overestimation.
- **Outcome Classification Fix (Oct 30)**: Reason strings now accurately reflect classification method (mortality-based vs probability-based) - see [Understanding Results](./UNDERSTANDING_RESULTS.md#two-classification-systems-oct-30-2025-fix)
- **Government Modeling**: 30 real governments with coalition formation, policy response, election cycles, international treaties (80-90 hours, standalone NPM package)
- **Multi-Paradigm DUI**: 4 philosophical frameworks (Western Liberal, Development Needs, Ecological Harmony, Indigenous Communitarian) measure outcomes across value systems
- **DUI Reporting & Visualization**: Month-by-month paradigm tracking, terminal-friendly ASCII charts (sparklines, heatmaps), multi-run comparison tools
- **Week 1 Fixes (#4-9)**: Death attribution, trust recovery, governance thresholds, war escalation, AI infrastructure resources, technology diffusion recalibration

**Simulation Statistics (Oct 20, 2025)**:
- **69+ registered phases** executing in deterministic order (was 67)
- **156+ research citations** from peer-reviewed sources (2024-2025) - 36 new from government system
- **9,000+ lines of simulation code** (src/simulation/) + 3,620 lines in government package
- **931 lines** in core engine.ts (phase orchestration)
- **100+ Git commits** since Oct 16, 2025
- **30 real-world governments** modeled with WGI 2024 data
- **42 multi-paradigm indicators** (9 Western, 14 Development, 13 Ecological, 7 Indigenous)
- **20% utopia rate** achieved (N=10 validation, pre-government system)

**Major Implementation (Oct 17-20, 2025):**

**Government Modeling System (Oct 19-20):**
- ✅ 30 real governments with WGI 2024 state capacity data
- ✅ Coalition formation (validated Germany 2021: 100% accurate)
- ✅ Policy response with crisis acceleration (10x faster for existential threats)
- ✅ Election cycles and public opinion dynamics
- ✅ International treaty formation (G20 coordination)
- ✅ Standalone NPM package (@political-science/government-agents)
- ✅ 58/58 tests passing, 36 research citations, 80-90 hours implementation
- ✅ Monte Carlo N=10 validated: 0 crashes, 4.6% performance impact

**Multi-Paradigm Dystopia-Utopia Index (Oct 19-20):**
- ✅ Phase 1-3 complete (research, indicator mapping, implementation design)
- ✅ 4 paradigm frameworks (Western, Development, Ecological, Indigenous)
- ✅ 42 indicators mapped across 4 paradigms
- ✅ Air quality indicator added (WHO 2024: 7M deaths/year)
- ✅ Geometric mean aggregation with zero-handling (min-floor 0.1)
- ✅ Three-tier architecture (simulation foundation, high-confidence paradigms, diagnostic lenses)
- ⚠️ Phase 4-7 pending (data pipeline, Monte Carlo integration, validation)

**Week 1 Post-Recalibration Fixes (Oct 17-19):**
- ✅ Fix #4: Capability-based governance thresholds (scales with AI capability)
- ✅ Fix #5: Flash war escalation prevention (gradual escalation, circuit breakers)
- ✅ Fix #6: AI infrastructure resources (water ~~500-700L/GPU-hour~~ [later corrected to 0.86-6.6 L/GPU-hr, Oct 29], energy tracking)
- ✅ Fix #7: Trust recovery mechanics (enables dystopia escape paths)
- ✅ Fix #8: Death attribution system (proximate vs root causes, multi-factor)
- ✅ Fix #9: Technology diffusion recalibration (AI acceleration 25% max, crisis 10x)

**Phase 1B Hybrid Refinement: Stratified Outcomes & Trauma Modeling (Oct 17):**
- 📊 Stratified outcomes: Humane (<20% mortality) vs Pyrrhic (≥20% mortality) classification
- 💔 Psychological trauma: PsychologicalTraumaPhase (order 23.5) - long-term PTSD effects
- 🌾 Food security degradation: FoodSecurityDegradationPhase (order 34.5) - crisis-accelerated collapse
- 🍞 Famine fixes: Threshold 0.4 → 0.6 (matches historical famines: Holodomor, Bengal, Somalia)
- ✅ Validation: N=10 runs show 70% pyrrhic dystopia, 30% extinction (all "success" involves mass death)

**Contingency & Agency Phases 1-3: Fat-Tailed Distributions + Black/Gray Swans + Critical Junctures**
- 🎲 **Phase 1 - Lévy flights**: Power-law distributions replace Gaussian (8,249 extreme events validated)
- 🌩️ **Phase 2 - Exogenous shocks**: Unknown Unknowns (10 templates, 0.15%/month - ~1 event per 20y run)
- 🦸 **Phase 3 - Critical junctures**: 90/10 structure-agency split (4 escape types, rare hero moments)
- 📊 Outcome variance: Broke 80-90% seed convergence, enabled branching paths
- ✅ Validation: N=100 runs for Phases 2-3, N=50 runs for Phase 1

**Nuclear Command & Control Phase 1B: Circuit Breakers**
- ☢️ Human-in-the-loop: 1-4 veto points, bypass detection
- 🔴 AI kill switches: 70-95% coverage, degradation over time
- ⏳ Time delays: 12-72 hour cooling-off periods
- 🎯 Bug fix: Prevents 0% nuclear war rate (deterrence was TOO effective)

**TIER 0D Critical Bug Fixes (4 bugs eliminated)**
- 🐛 Bug #1: Job Guarantee paradox (unemployment floor logic)
- 🐛 Bug #2: Reinstatement effect missing (AI creates new tasks)
- 🐛 Bug #3: UBI floor broken (only worked at economicStage >= 3)
- 🐛 Bug #4: Orphan AI bug (0 orphan AIs validated) ✅

**P2.4-P2.6: Policy Interventions + Economic Recovery**
- 📊 Systemic inequality: 4 socioeconomic classes (Elite, Middle, Working, Precariat)
- 💼 Teaching-Meaning synergy: Up to 25% meaning crisis reduction
- 🏛️ Economic stage tracking: Recovery from crises, 5 stages modeled
- 🌍 Country expansion: Ireland, Singapore, Australia added

**P2.5: Triggered Events System (Empirical Validation)**
- 🎯 External event injection for testing
- 📝 State tracking: `state.history.exogenousShocks[]`
- ✅ Integration with Monte Carlo validation framework

**Implementation Stats:**
- 75+ commits since Oct 16, ~5,000 lines of production code
- 110+ research citations, 4,500+ lines of documentation
- **First utopias achieved**: 20% rate (2/10 runs) 🌟
- **Philosophy**: "Let the model show what it shows" - realism over balance

**Validation Results:**
- Monte Carlo N=100: Exogenous shocks validated
- Monte Carlo N=50: Lévy flights validated (8,249 events)
- Monte Carlo N=10: **First utopia outcomes** (20% rate)
- Monte Carlo N=120: Policy interventions validated (systemic inequality confirmed)
