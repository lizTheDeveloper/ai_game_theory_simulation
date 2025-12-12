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
- THEN it MUST follow three-axis scaling model (Dec 2025)
- AND bottlenecks (compute, data, energy) MUST constrain growth
- AND breakthrough technologies MAY cause discontinuous jumps

### Requirement: Three-Axis AI Capability Scaling (Dec 2025)
The simulation SHALL model AI capability growth via three independent axes with economic constraints.

**Research:** `research/ai_scaling_laws_2025_REVISED_20251211.md` (QG1 PASSED, Grade B+)
**Implementation:** `src/simulation/engine/phases/AIScalingPhase.ts`

**Three Scaling Axes:**
1. **Pre-training:** Sigmoid plateau model (peak 2024, max 1.5x GPT-4 baseline by 2027)
2. **Test-time compute:** Logarithmic benefit scaling with economic deployment gate
3. **Efficiency:** Algorithmic improvements (1.5x-2x per decade, conservative)

#### Scenario: Pre-Training Plateau
- WHEN modeling pre-training scaling post-2024
- THEN it MUST use sigmoid function approaching 1.5x plateau
- AND it MUST NOT assume continued exponential growth
- AND inflection year MUST be 2024 (Orion/Gemini plateau observed)
- AND steepness parameter MUST cause rapid saturation by 2026-2027

#### Scenario: Economic Deployment Gate
- WHEN calculating test-time compute effectiveness
- THEN cost per inference MUST be modeled (dollar-5 baseline to dollar-1000+ for high-compute)
- AND economic viability MUST use exponential dampening: exp(-cost/threshold)
- AND only high-value tasks (>0.1% of workload) SHALL afford expensive test-time compute
- AND effective capability MUST be weighted by deployment probability

#### Scenario: Efficiency Multiplier
- WHEN calculating algorithmic efficiency gains
- THEN annual growth rate MUST be 5-10% (1.5x-2x per decade)
- AND it MUST NOT use non-peer-reviewed efficiency claims (rejected 23x/2.5yr claim)
- AND uncertainty MUST be ±100% (could range 1.0x to 3x per decade)

#### Scenario: Uncertainty Quantification
- WHEN projecting AI capabilities
- THEN uncertainty bands MUST be explicit
- AND near-term (2025-2027) MUST use ±50% multiplier
- AND long-term (2028+) MUST use ±200% multiplier
- AND projections MUST include {baseline, low, high} bounds

#### Scenario: Composite Capability Calculation
- WHEN calculating effective AI capability
- THEN it MUST combine all three axes with interaction effects
- AND axes MUST NOT be fully multiplicative (diminishing compounding)
- AND test-time effectiveness MUST depend on pre-training quality threshold
- AND efficiency gains MAY trade off with frontier capability

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

### Requirement: Information Ecology & Epistemic Degradation
The simulation SHALL model information environment quality as a critical mediator between AI alignment and coordination capacity.

**Research:** `research/information_ecology_epistemic_degradation_20251202.md` (15+ sources, 2024-2025)
**Implementation:** `src/simulation/informationEcology.ts`, `src/simulation/engine/phases/InformationEcologyPhase.ts`
**Quality Gates:** QG1 Grade B+ (Sylvia), QG2 PASS (architecture-skeptic)
**Validation:** Perfect determinism (CV = 0.000000%)

**Core Insight:** Even with aligned AI, polarized societies with degraded epistemic commons may be unable to coordinate effectively. Coordination depends on shared reality, institutional trust, and low polarization.

#### Scenario: Epidemic Misinformation Spread
- WHEN modeling misinformation dynamics
- THEN it MUST use SIS/SIR epidemic model: `dI/dt = β × S × I - γ × I`
- AND basic reproduction number R₀ MUST determine spread (R₀ > 1: exponential, R₀ < 1: containment)
- AND transmission rate β MUST be amplified by echo chambers (1.5x-3.0x) and AI-generated content (up to 50% boost)
- AND recovery rate γ MUST be boosted by fact-checking capacity (up to 100%)
- AND misinformationPrevalence MUST track fraction of information environment (0-1)

**Parameters (Research-Backed):**
- Baseline R₀: 1.5 (mild exponential growth)
- Transmission rate β: 0.1-0.8 per day (0.3 baseline, varies by content emotionality)
- Recovery rate γ: 0.05-0.2 per day (0.1 baseline = 10-day belief duration)
- Source: Alotaibi et al. (2024) Scientific Reports 14:18729

#### Scenario: Trust Erosion and Recovery
- WHEN societies experience crises (nuclear events, climate disasters, AI failures, war)
- THEN institutional trust MUST erode by 25-50% per month
- AND erosion rate MUST be amplified by polarization
- AND recovery MUST be slow during stability (2-5% per month)
- AND recovery rate MUST depend on epistemic health
- AND institutionalTrustIndex MUST track government, media, science trust (0-1)

**Parameters (Research-Backed):**
- Crisis erosion: -0.25 to -0.50 per month
- Stability recovery: +0.02 to +0.05 per month
- Baseline trust: 0.40 (US 2024)
- Source: 2025 Edelman Trust Barometer

#### Scenario: Polarization Feedback Loops
- WHEN modeling affective polarization
- THEN it MUST be driven by misinformation prevalence, echo chamber strength, and crisis events
- AND it MUST be dampened by cross-cutting exposure and successful coordination
- AND polarizationIndex MUST track othering + aversion + moralization (0-1)
- AND polarization MUST amplify trust erosion during crises

**Parameters (Research-Backed):**
- Baseline polarization: 0.60 (significant affective polarization, US 2024)
- Echo chamber strength: 0.50 (moderate filter bubbles)
- Source: APSR (2025) "A New Measure of Affective Polarization"

#### Scenario: Fact-Checking Capacity Decay
- WHEN fact-checking infrastructure is deployed
- THEN it MUST decay by 10% per month without maintenance
- AND it MUST reduce transmission rate β by up to 50%
- AND it MUST increase recovery rate γ by up to 100%
- AND effects MUST decay rapidly (days to weeks) without repeated exposure
- AND AI capabilities MAY boost capacity if alignment is high

**Parameters (Research-Backed):**
- Natural decay: 10% per month
- Effectiveness duration: days to weeks
- Baseline capacity: 0.30 (limited infrastructure)
- Source: Capewell et al. (2024) JASP, Nature Human Behaviour (2021)

#### Scenario: AI-Generated Content Amplification
- WHEN AI capabilities advance (digital.informationProcessing > 0.6)
- THEN AI-generated content fraction MUST increase
- AND it MUST amplify transmission rate β by up to 50%
- AND it MUST overwhelm epistemic infrastructure when fraction > 0.5
- AND aiGeneratedContentFraction MUST track (0-1)

**Parameters (Research-Backed):**
- Baseline fraction: 0.10 (early AI era, 2025)
- Amplification: up to 50% boost to β
- Source: Frontiers in Computer Science (2025) DOI: 10.3389/fcomp.2025.1570085

#### Scenario: Coordination Capacity Calculation
- WHEN calculating ability to implement collective solutions
- THEN coordinationCapacity MUST be: `trust × (1 - polarization) × (1 - misinformation)`
- AND capacity < 0.2 MUST indicate severe dysfunction
- AND capacity < 0.3 during crises MUST increase collapse probability
- AND capacity MUST modify AI deployment effectiveness
- AND capacity MUST affect policy implementation quality

**Formula:** `coordination = trust × (1 - polarization) × (1 - misinformation)`

**Integration Points:**
- CoordinatedDeploymentPhase: Reduces AI deployment effectiveness (50% to 100% based on coordination)
- GovernancePhase: Reduces policy quality (60% to 100% based on epistemic health)

#### Scenario: Epistemic Health Composite
- WHEN calculating overall information environment quality
- THEN epistemicHealth MUST be: `trust × 0.4 + (1 - polarization) × 0.3 + (1 - misinformation) × 0.3`
- AND epistemic health > 0.6 MUST be required for utopia outcomes
- AND epistemic health < 0.4 MUST trigger governance warnings
- AND epistemicHealth MUST track (0-1)

**Formula:** `epistemicHealth = trust × 0.4 + (1 - polarization) × 0.3 + (1 - misinformation) × 0.3`

**Source:** Derived from Labarre (2024) epistemic vulnerability framework (note: research file incorrectly cited as "McCoy et al.")

#### Scenario: Regional Heterogeneity (Future Work)
- WHEN modeling regional variance
- THEN Northern Europe MUST have 0.30-0.40 vulnerability
- AND US/Spain MUST have 0.60-0.70 vulnerability
- AND Eastern Europe MUST have 0.70-0.80 vulnerability
- AND regionalVariance MUST track heterogeneity (0-1)

**Note:** Currently single global model (regional variance = 0.30). Full regional modeling is MEDIUM priority future work.

**Source:** Labarre (2024) 20-country comparative analysis

#### Scenario: Deterministic Validation
- WHEN validating Information Ecology implementation
- THEN Monte Carlo runs MUST achieve CV < 0.01% for all metrics
- AND N ≥ 10 runs with same seed MUST produce identical results
- AND no `Math.random()` MUST be used (use seeded RNG)

**Achievement:** Perfect determinism (CV = 0.000000%) across all metrics (N=5, seed="information-ecology-test")

**History:** `docs/implementation-history/2025-12/information-ecology/README.md`

---

## Active Work

### Completed HIGH Priority

#### Information Ecology & Epistemic Degradation
**Status:** COMPLETE (Dec 12, 2025, Session 76)
**Implementation:** `src/simulation/informationEcology.ts` (458 lines), `src/simulation/engine/phases/InformationEcologyPhase.ts` (184 lines)
**Research:** `research/information_ecology_epistemic_degradation_20251202.md` (15+ sources, 2024-2025)
**Quality Gates:** QG1 Grade B+ (Sylvia), QG2 PASS (2 HIGH issues fixed)
**Validation:** Perfect determinism (CV = 0.000000%, N=5)
**Impact:** 20-40% reduction in managed transition probability for polarized scenarios
**Summary:** Comprehensive epistemic environment modeling including epidemic misinformation spread (SIS/SIR), trust erosion/recovery, polarization feedback loops, fact-checking capacity decay, AI amplification, and coordination capacity calculation. Integration with CoordinatedDeploymentPhase (epistemic modifier on AI deployment effectiveness).
**History:** `docs/implementation-history/2025-12/information-ecology/README.md`

#### HIGH-7: Conditional Climate Stability Floor
**Status:** COMPLETE (Dec 5, 2025, retroactive validation Dec 7)
**Implementation:** `src/simulation/engine/phases/ClimateSystemPhase.ts:827-883`
**Research:** Wunderling et al. (2024), ACCESS-ESM-1.5 (2024), Boers et al. (2025)
**Quality Gates:** QG1 Grade B (Sylvia), QG2 Grade B (architecture-skeptic)
**Summary:** Conditional floor (5% in stabilization scenarios, 0% in tail risk) replaces unconditional floor. Aligns with 2024-2025 research showing destabilizing tipping cascades.
**Known Issues:** Monte Carlo validation partial (N=10 blocked by population assertion edge case, not a feature bug)
**History:** `docs/implementation-history/high7_conditional_climate_stability_floor_20251207.md`

---

### HIGH Priority (Active)

**None currently active.** Next HIGH priority work should be selected from MEDIUM backlog or new proposals.

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
**Status:** ✅ COMPLETE (Dec 7, 2025)
**Context:** Distribution sampling library for tipping point thresholds
**Implementation:** Three distribution libraries (triangular, uniform, normal, log-normal, beta, gamma)
**Research:** 775-line research doc with peer-reviewed threshold ranges (AMOC: 1.4-8.0°C, Greenland: 0.8-3.4°C, etc.)
**Validation:** Monte Carlo N=3 deterministic (seed=42, all thresholds identical across runs), 28/28 tests passing
**Quality Gates:** QG1 Grade B- (research-skeptic), QG2 Grade B+ (architecture-skeptic)
**Files:** `src/simulation/utils/distributionSampling.ts`, `src/simulation/thresholds/distributions.ts`, `tests/thresholds/distributions.test.ts`
**Known Issues:** H-1 (three redundant libraries, consolidation recommended but not blocking)

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
**Status:** Research COMPLETE + Quality Gate 1 PASS (Dec 10, 2025)
**Context:** Quantum advantage triggers cryptography crisis → economic disruption
**Impact:** Model step-change in computational capabilities
**Research:** 625-line research doc, 31 sources (Nature Physics 2024, NIST PQC 2024, NSA CNSA 2.0)
**Grade:** A+ (research quality)
**Quality Gate 1:** PASS (Cynthia + Sylvia validation complete)
**Architecture Review:** Grade B+ (0 CRITICAL/HIGH issues)
**Type Definitions:** Created in `src/types/quantum.ts`
**Next Steps:** Implementation when prioritized (ready to proceed)
**File:** `research/quantum_computing_cascades_20251210.md`

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
