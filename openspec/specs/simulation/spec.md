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

### HIGH Priority

#### H-1: Distribution Library Consolidation
**Status:** Proposed (Dec 8, 2025)
**Context:** Three redundant distribution libraries (1,077 total lines) implementing identical algorithms
**Files:** `src/simulation/utils/distributionSampling.ts`, `src/simulation/utils/distributions.ts`, `src/simulation/thresholds/distributions.ts`
**Impact:** Maintenance burden, parameter naming inconsistency, bug propagation risk
**Plan:** `openspec/changes/h1-distribution-consolidation/proposal.md` (created Dec 8)
**Priority Rationale:** Architecture review identified as HIGH (carried over from M-5 review)
**Next Steps:** Implementation → consolidate to single canonical library

---

### MEDIUM Priority

#### M-6: Enhanced Radiation Modeling
**Status:** Research Complete - Awaiting QG1 Validation
**Context:** Acute vs chronic radiation exposure, tissue sensitivity, dose-rate dependency
**Research:** `research/radiation_health_effects_20251208.md` (515 lines, ICRP standards + medical evidence)
**Plan:** `openspec/changes/enhanced-radiation-modeling/tasks.md`
**Progress:**
- T1.1: ✅ Research complete (Dec 8) - ICRP tissue weighting, LD50 thresholds, Hiroshima LSS data
- T1.2: ⏳ BLOCKED - Awaiting research-skeptic validation (Quality Gate 1)
**Impact:** More realistic nuclear winter health effects (immediate casualties vs long-term cancer risk)
**Next Steps:** QG1 validation → Implementation → Testing

---

### COMPLETED Work

#### HIGH-7: Conditional Climate Stability Floor
**Status:** ✅ COMPLETE (Dec 5, 2025, retroactive validation Dec 7)
**Implementation:** `src/simulation/engine/phases/ClimateSystemPhase.ts:827-883`
**Research:** Wunderling et al. (2024), ACCESS-ESM-1.5 (2024), Boers et al. (2025)
**Quality Gates:** QG1 Grade B (Sylvia), QG2 Grade B (architecture-skeptic)
**Summary:** Conditional floor (5% in stabilization scenarios, 0% in tail risk) replaces unconditional floor. Aligns with 2024-2025 research showing destabilizing tipping cascades.
**History:** `docs/implementation-history/high7_conditional_climate_stability_floor_20251207.md`

#### M-7: Fix Population Assertions for Near-Extinction Scenarios
**Status:** ✅ COMPLETE (Dec 7, 2025)
**Context:** Monte Carlo validation blocked by overly restrictive population assertions
**Fix:** Lowered minimum from 0.01B (10M) → 0.00001B (10K) in aggregateAllRegionalData
**Research:** Toba bottleneck (~74 kya, 10K-30K survivors) - allows realistic near-extinction scenarios
**Validation:** Created validateNearExtinction.ts script - all 4 test cases pass (10K, 100K, 1M, 10M)
**Files:** `src/simulation/populationDynamics.ts:687`, `scripts/validateNearExtinction.ts`

#### M-5: Threshold Uncertainty Modeling
**Status:** ✅ COMPLETE (Dec 7, 2025) - Awaiting Documentation + Archival
**Context:** Distribution sampling library for tipping point thresholds
**Implementation:** Three distribution libraries (triangular, uniform, normal, log-normal, beta, gamma)
**Research:** 775-line research doc with peer-reviewed threshold ranges (AMOC: 1.4-8.0°C, Greenland: 0.8-3.4°C, etc.)
**Validation:** Monte Carlo N=3 deterministic (seed=42, all thresholds identical across runs), 28/28 tests passing
**Quality Gates:** QG1 Grade B- (research-skeptic), QG2 Grade B+ (architecture-skeptic)
**Files:** `src/simulation/utils/distributionSampling.ts`, `src/simulation/thresholds/distributions.ts`, `tests/thresholds/distributions.test.ts`
**Known Issues:** H-1 (three redundant libraries, consolidation recommended but not blocking)
**Next:** Wiki documentation + archival to implementation-history

---

### LOW Priority

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
