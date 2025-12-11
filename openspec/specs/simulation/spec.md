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

### Requirement: Probabilistic Tipping Thresholds
The simulation SHALL model tipping point thresholds as probability distributions reflecting scientific uncertainty.

#### Scenario: Threshold Sampling at Initialization
- WHEN a new simulation is initialized
- THEN each tipping element with defined uncertainty distribution MUST sample a threshold value
- AND sampled values MUST be stored in `state.sampledTippingThresholds`
- AND sampling MUST use the RNG function (deterministic, no Math.random)
- AND sampled values MUST remain constant throughout the run

#### Scenario: Threshold Activation
- WHEN evaluating tipping point activation
- THEN the system MUST use sampled threshold (if available)
- AND fall back to baseline threshold only if distribution not defined
- AND threshold comparison MUST be deterministic (no re-sampling)

#### Scenario: Distribution Types
- WHEN defining tipping element uncertainty
- THEN distribution type MUST be one of: normal, log-normal, uniform, triangular, beta
- AND distribution parameters MUST be research-backed (2+ peer-reviewed sources)
- AND central estimate SHOULD match Armstrong McKay et al. 2022 best estimates
- AND uncertainty ranges SHOULD match IPCC AR6 WG1 consensus

#### Scenario: Monte Carlo Variance
- WHEN running Monte Carlo simulations with different seeds
- THEN tipping activation timing MUST vary realistically (not identical)
- AND variance MUST be within research-backed uncertainty ranges
- AND identical seeds MUST produce identical sampled thresholds (CV < 0.01%)

#### Scenario: Distribution Sampling Utilities
- WHEN sampling from probability distributions
- THEN utilities MUST be available for: normal, log-normal, uniform, triangular, beta
- AND all sampling functions MUST accept (parameters..., rng) with RNG as REQUIRED parameter
- AND all sampling functions MUST validate inputs with assertions (no silent fallbacks)
- AND all outputs MUST be validated with assertFinite

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

#### Scenario: Tipping Element Thresholds
- WHEN defining tipping element thresholds
- THEN central estimate MUST match literature consensus (Armstrong McKay et al. 2022)
- AND uncertainty distribution SHOULD be defined (type + parameters)
- AND distribution parameters MUST be justified by peer-reviewed sources
- AND fallback to deterministic threshold IS ALLOWED for backward compatibility

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

### HIGH Priority

#### HIGH-7: Conditional Climate Stability Floor
**Status:** COMPLETE (Dec 5, 2025, retroactive validation Dec 7)
**Implementation:** `src/simulation/engine/phases/ClimateSystemPhase.ts:827-883`
**Research:** Wunderling et al. (2024), ACCESS-ESM-1.5 (2024), Boers et al. (2025)
**Quality Gates:** QG1 Grade B (Sylvia), QG2 Grade B (architecture-skeptic)
**Summary:** Conditional floor (5% in stabilization scenarios, 0% in tail risk) replaces unconditional floor. Aligns with 2024-2025 research showing destabilizing tipping cascades.
**Known Issues:** Monte Carlo validation partial (N=10 blocked by population assertion edge case, not a feature bug)
**History:** `docs/implementation-history/high7_conditional_climate_stability_floor_20251207.md`
**Status:** COMPLETED (December 5-6, 2025, Sessions 52-56)
**Context:** Climate stability 5% floor contradicted by Wunderling 2024
**Impact:** Conditional floor applied only in stabilization scenarios, removed in tail risk
**Delivered:**
- Conditional logic: floor applies when Paris success OR low cascade risk
- Tail risk scenarios (3+ tipping elements + 2C+ warming): floor removed (0.0)
- Documentation as implementation choice (769-821 code comments)
- Research validation: Grade B- (conditional approach aligns with Wunderling 2024)
- Logging when floor removed in tail scenarios
**Implementation:** `src/simulation/engine/phases/ClimateSystemPhase.ts` (lines 827-873)
**Research:** `research/climate_stability_self_limiting_critique_20251126.md`
**Archive:** `plans/completed/HIGH_7_conditional_climate_stability_floor_20251205.md`
>>>>>>> origin/auto/worker-20251207_140001

---

### MEDIUM Priority

#### M-7: Fix Population Assertions for Near-Extinction Scenarios
**Status:** ✅ COMPLETE (Dec 7, 2025)
**Context:** Monte Carlo validation blocked by overly restrictive population assertions
**Fix:** Lowered minimum from 0.01B (10M) → 0.00001B (10K) in aggregateAllRegionalData
**Research:** Toba bottleneck (~74 kya, 10K-30K survivors) - allows realistic near-extinction scenarios
**Validation:** Created validateNearExtinction.ts script - all 4 test cases pass (10K, 100K, 1M, 10M)
**Files:** `src/simulation/populationDynamics.ts:687`, `scripts/validateNearExtinction.ts`
**Impact:** Monte Carlo validation now unblocked for tail-risk scenarios

#### M-5: Threshold Uncertainty Modeling
**Status:** COMPLETED (December 7, 2025)
**Context:** Distribution sampling library for tipping point thresholds
**Impact:** Moved from deterministic thresholds to probability distributions
**Research:** Armstrong McKay et al. 2022 + 2024-2025 climate tipping literature
**Delivered:**
- Beta distribution for AMOC (epistemic uncertainty: 1.4-8.0°C)
- Triangular distributions for GrIS, WAIS, Amazon, Boreal
- Coral reefs marked as crossed (Oct 2025 validation)
- 18/18 unit tests passing
- Monte Carlo validated (N=10, CV < 0.01%)
- Quality Gate 1: PASSED (research-skeptic)
- Quality Gate 2: PASSED (architecture-skeptic, fixes applied)
- Wiki documented (261 lines)
**Archive:** `docs/implementation-history/threshold-uncertainty/`
>>>>>>> origin/auto/worker-20251207_140001
**Status:** Complete (2025-12-07)
**Context:** Distribution sampling library for tipping point thresholds
**Impact:** Moved from deterministic thresholds to probability distributions (Beta, Triangular)
**Research:** Armstrong McKay et al. 2022, IPCC AR6 WG1 - uncertainty ranges validated
**Archive:** `docs/implementation-history/threshold-uncertainty/`
>>>>>>> origin/auto/worker-20251207_150002

#### M-6: Enhanced Radiation Modeling
**Status:** ✅ COMPLETE (Dec 8, 2025)
**Context:** Acute vs chronic radiation exposure, tissue sensitivity, dose-response curves
**Impact:** Research-backed fallout modeling with LD50/60 sigmoids, ICRP 103 tissue weighting, 7-10 decay rule
**Implementation:** `src/simulation/radiationModeling.ts` (571 lines), enhanced `RadiationZone` interface
**Quality Gates:** QG1: Grade B (Sylvia), QG2: PASSED (no CRITICAL/HIGH issues)
**Research:** CDC 2024, REMM, ICRP 103, PMC11604265, BEIR VII (LNT controversy documented)
**Tests:** 30+ unit tests, deterministic, all passing
**History:** `docs/implementation-history/M-6_enhanced_radiation_modeling_20251208.md`

---

### LOW Priority

#### L-2: Enhanced Biodiversity Modeling
**Status:** Proposed
**Context:** Food web collapse cascades, trophic interactions
**Impact:** More realistic extinction cascades
**Research:** Ecosystem network modeling, keystone species
**Next Steps:** Research validation → Implementation

#### L-3: Quantum Computing Breakthrough Cascades
**Status:** DEFERRED (Dec 10, 2025) - GitHub Issue #770
**Context:** Quantum advantage triggers cryptography crisis → economic disruption
**Impact:** Model step-change in computational capabilities
**Research:** COMPLETE - 683 lines, 31 sources (Nature Physics 2024, NIST PQC 2024, NSA CNSA 2.0)
**Quality Gate 1:** ✅ PASSED - Orchestrator Grade A, Sylvia Grade B+
**Deferral Reason:** Requires GameState schema extensions (quantumSystem, cryptoSecurity fields)
**Implementation Estimate:** 6-8 hours (with proper schema foundation)
**Artifacts:**
- Research: `research/quantum_computing_cascades_20251210.md`
- QG1 Reviews: `reviews/quantum_cascades_qg1_orchestrator_assessment_20251210.md`, `reviews/quantum_cascades_sylvia_validation_20251210.md`
- Implementation Design: `devlogs/quantum_cascades_implementation_20251210.md`
- Status Document: `reviews/quantum_cascades_implementation_status_20251210.md`
- Archival: `docs/implementation-history/l3_quantum_cascades_deferral_20251210.md`
- GitHub Issue: #770
**Next Steps:** Future focused session to design GameState schema → Implementation → QG2

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
