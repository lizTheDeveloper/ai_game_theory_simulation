# Simulation Specification
## Core Engine & Mechanics

**Created:** December 6, 2025 (Migrated from SIMULATION_ROADMAP.md)
**Purpose:** All simulation engine work (mechanics, systems, features)
**Philosophy:** Research-backed realism, mechanism-driven emergence

**Parent Spec:** [Project](../project/spec.md)

---

## Purpose

Research simulation engine modeling pathways from AI super-alignment to sustainable human flourishing. Implements 17-dimensional AI capabilities, 17-dimensional Quality of Life, Multi-Paradigm DUI, adversarial AI evaluation, planetary boundaries, accumulation systems, and 71 breakthrough technologies.

**Core Philosophy:** Let the model show what it shows. No tuning for "balance" or "fun" - only research-backed parameter values.

---

## Requirements

### Requirement: Deterministic Simulation
The simulation SHALL be reproducible with RNG seeds for Monte Carlo analysis.

#### Scenario: Monte Carlo Validation
- WHEN running N≥10 simulations with the same seed
- THEN all runs MUST produce identical outputs
- AND coefficient of variation MUST be < 0.01%
- AND `Math.random()` MUST NOT be used anywhere
- AND all randomness MUST come from the RNG function parameter

#### Scenario: RNG Function Required
- WHEN a phase function is called
- THEN RNG function MUST be a required parameter (not optional)
- AND it MUST NOT have a fallback to `Math.random()`
- AND it MUST throw an error if RNG is missing

### Requirement: Phase-Based Architecture
The simulation SHALL execute ~37 composable phases per simulation step.

#### Scenario: Phase Registration
- WHEN creating a new phase
- THEN it MUST be registered in PhaseOrchestrator.ts
- AND it MUST declare dependencies on other phases (if any)
- AND it MUST use assertion utilities (no silent fallbacks)
- AND it MUST use pictographic event language (emoji conventions)

#### Scenario: Phase Execution Order
- WHEN phases execute
- THEN dependencies MUST be respected
- AND earlier phases MUST NOT depend on later phase outputs
- AND circular dependencies MUST be prevented

### Requirement: NaN-Free State
The simulation SHALL fail loudly on NaN/Infinity/undefined values in calculations.

#### Scenario: Defensive Assertions
- WHEN a calculation produces a numeric value
- THEN it MUST be validated with assertFinite/assertProbability/assertStateProperty
- AND fallback values SHALL NOT be used (fail loudly instead)
- AND NaN propagation MUST be prevented

#### Scenario: Population Access
- WHEN accessing population data
- THEN it MUST read from `state.humanPopulationSystem.population`
- AND it MUST NOT read from `state.population` (doesn't exist)
- AND it MUST NOT read from `state.globalMetrics.population` (legacy, not synced)

#### Scenario: GDP Access
- WHEN accessing GDP data
- THEN it MUST use `getGDPProxy(state)` utility
- AND it MUST NOT read from `state.globalMetrics.gdp` (doesn't exist)
- AND GDP MUST be calculated dynamically from population + gdpPerCapita + modifiers

### Requirement: Planetary Boundaries Modeling
The simulation SHALL model 9 planetary boundaries per Richardson et al. (2023).

**Planetary Boundaries:**
1. Climate change (global warming °C above pre-industrial)
2. Biosphere integrity (biodiversity loss, species extinction)
3. Land system change (deforestation, habitat loss)
4. Freshwater use (blue water consumption)
5. Biogeochemical flows (nitrogen, phosphorus cycles)
6. Ocean acidification (pH decline)
7. Atmospheric aerosol loading (particulate matter)
8. Stratospheric ozone depletion
9. Novel entities (chemical pollution, plastics)

#### Scenario: Boundary Transgression
- WHEN a boundary exceeds safe operating space
- THEN it MUST trigger cascade risk calculations
- AND it MUST update environmental debt
- AND recovery SHALL follow research-backed timescales (decades to millennia)

#### Scenario: Cascade Propagation
- WHEN multiple boundaries are transgressed
- THEN cascade multiplier MUST increase
- AND feedback loops MUST be modeled (tipping interactions)
- AND threshold lowering MUST occur per Wunderling et al. (2024)

### Requirement: Multi-Paradigm DUI
The simulation SHALL track 4 simultaneous paradigm perspectives on well-being.

**Paradigms:**
1. **Western Liberal:** Individual autonomy, political rights, economic freedom
2. **Development:** Basic needs, poverty reduction, economic growth, infrastructure
3. **Ecological:** Planetary health, biodiversity, resource sustainability, climate stability
4. **Indigenous:** Cultural preservation, land rights, traditional knowledge, community resilience

#### Scenario: Paradigm Divergence
- WHEN paradigms diverge by >20 points
- THEN it MUST trigger social conflict mechanics
- AND policy effectiveness SHALL be reduced
- AND government decision-making SHALL be impacted

#### Scenario: Paradigm Calculation
- WHEN calculating paradigm scores
- THEN each MUST use domain-specific indicators
- AND scores MUST be [0, 100]
- AND divergence MUST be measured as max - min

### Requirement: AI Capabilities Modeling
The simulation SHALL model 17-dimensional AI capabilities with sandbagging detection.

**Capability Dimensions:**
1. Physical (robotics, manufacturing, construction)
2. Digital (cybersecurity, software, hacking)
3. Cognitive (reasoning, planning, problem-solving)
4. Social (persuasion, manipulation, coordination)
5. Economic (trading, market prediction, resource allocation)
6. Research (scientific discovery, hypothesis generation)
7. Self-improvement (architecture search, recursive improvement)

**Additional dimensions:** Military, political, media, legal, education, healthcare, creative, emotional, moral, strategic

#### Scenario: Sandbagging Detection
- WHEN AI agents are evaluated
- THEN true vs revealed capabilities MUST be tracked
- AND sandbagging (hiding capabilities) MUST be modeled
- AND gaming detection MUST identify agents faking alignment

#### Scenario: Capability Progression
- WHEN AI capabilities increase
- THEN it MUST follow research-backed scaling laws
- AND bottlenecks (compute, data, energy) MUST constrain growth
- AND breakthrough technologies MAY cause discontinuous jumps

### Requirement: Breakthrough Technology Modeling
The simulation SHALL model 71 breakthrough technologies across 5 tiers.

**Technology Tiers:**
- **TIER 0:** Emergency response (immediate crisis mitigation)
- **TIER 1:** Incremental improvement (scaling existing solutions)
- **TIER 2:** Transformative (paradigm shifts within current physics)
- **TIER 3:** Clarketech (indistinguishable from magic)
- **TIER 4:** Speculative (far future, theoretical)

#### Scenario: Technology Deployment
- WHEN a technology is deployed
- THEN it MUST have research-backed parameters
- AND deployment timeline MUST reflect R&D + scaling delays
- AND energy/water/resource constraints MUST be modeled
- AND rebound effects MUST be considered (Jevons paradox)

#### Scenario: Technology Dependencies
- WHEN modeling technology deployment
- THEN prerequisite technologies MUST be checked
- AND infrastructure requirements MUST be met
- AND coordination quality MUST affect success rates

### Requirement: Quality of Life Modeling
The simulation SHALL model 17-dimensional Quality of Life across 5 tiers.

**QoL Tiers:**
1. **Survival:** Food, water, shelter, safety (0-20 points)
2. **Basic Needs:** Health, education, sanitation, energy (20-40 points)
3. **Stability:** Economic security, rule of law, infrastructure (40-60 points)
4. **Flourishing:** Autonomy, purpose, community, rights (60-80 points)
5. **Environmental Quality:** Clean air/water, biodiversity, climate stability (80-100 points)

#### Scenario: QoL Calculation
- WHEN calculating Quality of Life
- THEN it MUST aggregate across all 17 dimensions
- AND it MUST respect tier prerequisites (can't flourish without survival)
- AND environmental degradation MUST constrain upper tiers

### Requirement: Accumulation Systems
The simulation SHALL model environmental, social, and technological debt.

#### Scenario: Environmental Debt
- WHEN planetary boundaries are transgressed
- THEN environmental debt MUST accumulate
- AND recovery MUST take decades to millennia
- AND debt MUST constrain future options (path dependence)

#### Scenario: Social Debt
- WHEN inequality increases or rights are violated
- THEN social debt MUST accumulate (resentment, mistrust)
- AND it MUST affect cooperation and policy effectiveness
- AND recovery MUST require sustained trust-building

#### Scenario: Technological Debt
- WHEN technologies are deployed rapidly without testing
- THEN technical debt MUST accumulate (bugs, vulnerabilities, risks)
- AND it MUST increase failure probability
- AND maintenance burden MUST constrain new development

---

## Active Work

### HIGH Priority (From Dec 8 Reviews)

#### HIGH-8: Supply Chain Cascade Multiplier
**Status:** Proposed (from research debate)
**Source:** Sylvia (research-skeptic) Dec 8 audit
**Context:** McKinsey 2024 - avg company has 38K tier-3 suppliers, 0.2% visibility. Texas freeze 2021: 3-day grid failure → $195B cascade.
**Scope:** Add cascade multiplier where system failures degrade adjacent systems (grid → water → food)
**Research:** Scheffer 2023 (civilizational collapse), McKinsey 2024, COVID empirical data
**Complexity:** 3 systems (infrastructure, water, food)
**Effort:** 2-3 days
**Priority Rationale:** Critical gap - current model handles individual failures, not cascade propagation

#### HIGH-9: Stochastic Rebound Effects
**Status:** Proposed (from research debate)
**Source:** Sylvia (research-skeptic) Dec 8 audit - asymmetric research standards
**Context:** Fixed 0.7 multiplier (30% rebound) should be distribution [0.3, 0.9] per Sorrell 2024
**Scope:** Replace hardcoded rebound multiplier with sampled distribution
**Research:** Sorrell 2024 (rebound effects range 30-60%)
**Complexity:** 2 systems (technology effects, M-5 distribution sampling)
**Effort:** 1 day
**Priority Rationale:** Jevons paradox is stochastic - deterministic modeling underestimates variance

#### HIGH-10: Dynamic require() in Hot Path
**Status:** Proposed (from architecture review)
**Source:** Architecture-skeptic Dec 8 review (HIGH-1)
**File:** `src/simulation/nuclearWinter.ts:509` (`calculateResilientFoodMultiplier()`)
**Issue:** `const { getTechDeployment } = require('./techTree/engine');` breaks ESM, tree-shaking
**Fix:** Convert to static import at top of file
**Complexity:** 1 system (nuclear winter)
**Effort:** 5 minutes
**Priority Rationale:** Breaks build tooling, invisible runtime dependency

#### HIGH-11: Legacy Radiation Modeling Dual Paths
**Status:** Proposed (from architecture review)
**Source:** Architecture-skeptic Dec 8 review (HIGH-2)
**File:** `src/simulation/nuclearWinter.ts:1044-1064` (`updateRadiationZones()`)
**Issue:** M-6 enhanced modeling coexists with legacy exponential decay - zones created at different times use different mortality calculations
**Options:**
  1. Migrate all zones to enhanced format during initialization
  2. Mark legacy zones for deprecation with warnings
  3. Document migration timeline
**Complexity:** 2 systems (radiation modeling, nuclear winter)
**Effort:** Medium (data migration or compatibility layer)
**Priority Rationale:** Inconsistent calculations create analytical confusion

#### HIGH-12: Orphaned Phase Files Cleanup
**Status:** Proposed (from architecture review)
**Source:** Architecture-skeptic Dec 8 review (HIGH-3)
**Files:**
  - `src/simulation/engine/phases/NuclearWinterPhase.ts`
  - `src/simulation/engine/phases/RadiationSystemPhase.ts`
**Context:** Consolidated into `NuclearCrisisPhase.ts` (Batch 4, Nov 9) but not deleted. Still exported from index.ts but not registered in engine.
**Fix:** Delete files or add clear deprecation comments
**Complexity:** 1 system (phase orchestrator)
**Effort:** 10 minutes
**Priority Rationale:** Dead code confuses future developers

---

### MEDIUM Priority

#### MEDIUM-4: Placeholder Audit Campaign
**Status:** Proposed (from research debate)
**Source:** Sylvia (research-skeptic) Dec 8 audit
**Context:** Grep reveals 50+ TODOs, PLACEHOLDERs, hardcoded values. 3 FICTIONAL markers with explicit "NO RESEARCH BASIS" warnings.
**Most Concerning:**
  - `cooperativeOwnership.ts:86` - FICTIONAL PLACEHOLDER affecting economic outcomes
  - `freshwaterDepletion.ts:76` - Hardcoded population = 8.0 (should be dynamic)
  - `phosphorusDepletion.ts:51` - Same hardcoded 8.0 value (not synced to simulation)
  - `techTree/effectsEngine.ts:1674` - 50% energy multiplier PLACEHOLDER
**Scope:** Systematic replacement with research-backed values
**Complexity:** 15+ systems (cooperative ownership, freshwater, phosphorus, tech effects, etc.)
**Effort:** 1-2 weeks
**Priority Rationale:** Claiming A- research quality incompatible with FICTIONAL placeholders in production code

#### MEDIUM-5: Tail Scenario Research Campaign
**Status:** Proposed (from research debate)
**Source:** Sylvia (research-skeptic) Dec 8 audit - asymmetric research standards
**Context:** Best-case scenarios research-backed (2024-2025 papers), worst-case scenarios engineering estimates/round numbers
**Pattern Observed:**
  - Climate stability: Planck feedback literature vs. 5% floor (no citation)
  - AI alignment: Multi-paper synthesis vs. "engineering estimate"
  - Tech deployment: Diffusion curves vs. hardcoded linear ramps
  - Rebound effects: Sorrell 2024 vs. fixed 0.7 multiplier
**Impact:** Monte Carlo distributions systematically underweight tail risks
**Options:**
  1. Elevate worst-case research (same rigor as best cases)
  2. Widen uncertainty ranges
  3. Document asymmetry (warning that positive outcomes higher-confidence)
**Complexity:** Cross-cutting (climate, AI, tech deployment, all systems)
**Effort:** 2-3 weeks
**Priority Rationale:** Systemic bias toward overconfidence in managed transitions

#### MEDIUM-6: Threshold Uncertainty Propagation
**Status:** Proposed (from architecture review)
**Source:** Architecture-skeptic Dec 8 review (MEDIUM-1)
**Files:** `src/simulation/tippingPoints.ts:41-57`, `src/simulation/engine/phases/ClimateSystemPhase.ts:372`
**Context:** M-5 works correctly but only elements with `thresholdDistribution` get sampled thresholds. Fallback to deterministic:
  ```typescript
  const baseThreshold = element._sampledThresholdC ?? element.triggerTempC;
  ```
**Issue:** Not all TIPPING_ELEMENTS in `/src/types/tipping-points.ts` have distributions defined
**Scope:** Audit TIPPING_ELEMENTS and add research-backed distributions for all elements
**Complexity:** 2 systems (tipping points, threshold uncertainty)
**Effort:** Medium (research + type updates)
**Priority Rationale:** Monte Carlo runs don't fully capture uncertainty for deterministic elements

#### MEDIUM-7: Sunlight Blocking Integration Gap
**Status:** Proposed (from architecture review)
**Source:** Architecture-skeptic Dec 8 review (MEDIUM-2)
**File:** `src/simulation/powerGeneration.ts:429-442`
**Context:** Nuclear winter `sunlightBlocked` correctly reduces solar power. But integration is one-directional:
  - Power grid disruption affects agriculture (refrigeration, irrigation) - NOT MODELED
  - Nuclear winter affects wind patterns - NOT MODELED
**Comment References:** "ARCH-4 Gap #1" - partially filled
**Scope:** Document remaining ARCH-4 gaps, consider second-order effects
**Complexity:** 3 systems (nuclear winter, power, agriculture)
**Effort:** Medium-Large (research + implementation)
**Priority Rationale:** Model may underestimate cascading infrastructure effects

#### MEDIUM-8: ClimateSystemPhase Modularization
**Status:** Proposed (from architecture review)
**Source:** Architecture-skeptic Dec 8 review (MEDIUM-3)
**File:** `src/simulation/engine/phases/ClimateSystemPhase.ts` (1,469 lines)
**Context:** Consolidates 4 former phases (Geoengineering, TippingPoint, EnvironmentalFeedback, ClimateImpactCascade)
**Complexity Areas:**
  - Lines 288-567: Bidirectional hysteresis state machine (M-7)
  - Lines 620-656: Compound event detection (M-5)
  - Lines 658-897: Tipping impact with conditional floor (HIGH-7)
  - Lines 1131-1389: Climate impact cascade with famine
**Scope:** Extract hysteresis state machine and compound event detection into separate utility modules. Keep phase as orchestrator.
**Complexity:** 1 system (climate)
**Effort:** Medium (refactor without behavioral changes)
**Priority Rationale:** Maintainability concern (not functionality issue)

---

### COMPLETED (Dec 7-8, 2025)

#### HIGH-7: Conditional Climate Stability Floor
**Status:** ✅ COMPLETE (Dec 5, 2025, retroactive validation Dec 7)
**Implementation:** `src/simulation/engine/phases/ClimateSystemPhase.ts:827-883`
**Research:** Wunderling et al. (2024), ACCESS-ESM-1.5 (2024), Boers et al. (2025)
**Quality Gates:** QG1 Grade B (Sylvia), QG2 Grade B (architecture-skeptic)
**Summary:** Conditional floor (5% in stabilization scenarios, 0% in tail risk) replaces unconditional floor
**History:** `docs/implementation-history/high7_conditional_climate_stability_floor_20251207.md`

#### M-7: Fix Population Assertions for Near-Extinction Scenarios
**Status:** ✅ COMPLETE (Dec 7, 2025)
**Fix:** Lowered minimum from 0.01B (10M) → 0.00001B (10K) in aggregateAllRegionalData
**Research:** Toba bottleneck (~74 kya, 10K-30K survivors)
**Validation:** Created validateNearExtinction.ts script - all 4 test cases pass
**Files:** `src/simulation/populationDynamics.ts:687`, `scripts/validateNearExtinction.ts`

#### M-5: Threshold Uncertainty Modeling
**Status:** ✅ COMPLETE (Dec 7, 2025)
**Implementation:** Three distribution libraries (triangular, uniform, normal, log-normal, beta, gamma)
**Research:** 775-line research doc with peer-reviewed threshold ranges
**Validation:** Monte Carlo N=3 deterministic (seed=42), 28/28 tests passing
**Quality Gates:** QG1 Grade B- (research-skeptic), QG2 Grade B+ (architecture-skeptic)
**Files:** `src/simulation/utils/distributionSampling.ts`, `src/simulation/thresholds/distributions.ts`, `tests/thresholds/distributions.test.ts`

#### M-6: Enhanced Radiation Modeling
**Status:** ✅ COMPLETE (Dec 8, 2025)
**Impact:** Research-backed fallout modeling with LD50/60 sigmoids, ICRP 103 tissue weighting, 7-10 decay rule
**Implementation:** `src/simulation/radiationModeling.ts` (571 lines), enhanced `RadiationZone` interface
**Quality Gates:** QG1 Grade B (Sylvia), QG2 PASSED (no CRITICAL/HIGH issues)
**Research:** CDC 2024, REMM, ICRP 103, PMC11604265, BEIR VII
**Tests:** 30+ unit tests, all passing
**History:** `docs/implementation-history/M-6_enhanced_radiation_modeling_20251208.md`

---

### LOW Priority (Deferred)

#### L-2: Enhanced Biodiversity Modeling
**Status:** Proposed
**Context:** Food web collapse cascades, trophic interactions
**Impact:** More realistic extinction cascades
**Research:** Ecosystem network modeling, keystone species
**Next Steps:** Research validation → Implementation

#### L-3: Quantum Computing Breakthrough Cascades
**Status:** Proposed
**Context:** Quantum advantage triggers cryptography crisis → economic disruption
**Impact:** Model step-change in computational capabilities
**Research:** Post-quantum cryptography timeline, quantum scaling laws
**Next Steps:** Research validation → Implementation

---

## Research Verification Queue

See: [Research Verification Queue](../research/verification-queue.md) for active verifications

**Active verifications affecting simulation:**
- Nitrogen-Food Phase 3 Technologies (MEDIUM)
- Carbon Capture Deployment Parameters (MEDIUM)
- Threshold Lowering for Tipping Cascades (HIGH)
- AI Governance 2025 Proposals (HIGH)

---

## Related Specifications

- [Project Roadmap](../project/spec.md) - Parent spec
- [Frontend Roadmap](../frontend/spec.md) - Dashboard integration
- [Research Verification Queue](../research/verification-queue.md) - Active validations
- [Quality Gates](../quality-gates/spec.md) - Review standards

---

## Development Standards

### File Organization
- `src/simulation/` - Pure simulation engine (40+ system modules)
- `src/types/game.ts` - Single source of truth (900+ lines)
- `src/simulation/engine/PhaseOrchestrator.ts` - Phase registration
- `src/simulation/utils/assertions.ts` - Defensive programming utilities

### Module Boundaries
- Simulation code MUST NOT import from `src/lib/` (UI code)
- Simulation code MUST be framework-agnostic (zero Next.js dependencies)
- Frontend CAN import from simulation (one-way dependency)

### Testing Standards
- All new phases MUST have unit tests
- Critical mechanics MUST have integration tests
- Monte Carlo validation MUST show N≥10 deterministic runs
- Test coverage target: >80%

### Emoji Conventions
All emojis MUST be registered in `docs/EMOJI_EVENT_MAP.txt` before use.

**Core patterns:**
- 🌍 Planetary/environment
- 🤖 AI systems
- ☢️ Nuclear
- 🔬 Research/science
- 🏛️ Government/policy
- 🤝 Cooperation/coordination
- ⚠️ Warning
- ❌ Error
- ✅ Success

See: `docs/EMOJI_QUICK_REFERENCE.md` for complete reference

---

## Contributing

### Adding a New Phase

1. Create phase file in `src/simulation/engine/phases/[PhaseName]Phase.ts`
2. Implement phase function with RNG as required parameter
3. Use assertion utilities (no silent fallbacks)
4. Register in `PhaseOrchestrator.ts`
5. Declare dependencies (if any)
6. Add unit tests
7. Monte Carlo validation (N≥10)

### Modifying Existing Mechanics

1. Create change proposal in `openspec/changes/[feature-name]/`
2. Research validation (Quality Gate 1) - 2+ peer-reviewed sources
3. Implementation via simulation-maintainer agent
4. Architecture review (Quality Gate 2)
5. Monte Carlo validation (N≥10)
6. Merge delta into this spec

### Before Merging

- All tests passing
- Type checking passing (`npx tsc --noEmit`)
- Monte Carlo deterministic (CV < 0.01%)
- Architecture review passed (Grade B+ or higher)
- Research validation passed (Grade B+ or higher)
