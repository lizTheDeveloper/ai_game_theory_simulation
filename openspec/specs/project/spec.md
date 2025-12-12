# Project Specification
## AI Alignment Game Theory Simulation

**Created:** December 6, 2025 (Migrated from MASTER_IMPLEMENTATION_ROADMAP.md)
**Purpose:** Central hub defining project-wide requirements and standards

---

## Purpose

Model pathways from AI super-alignment to sustainable human flourishing through research-backed simulation. The system explores: **What happens after we solve AI alignment?**

**Philosophy:** Research-backed realism over balance tuning. Every mechanic grounded in peer-reviewed research (2024-2025 preferred). This is a research tool, not a game.

---

## Requirements

### Requirement: Research-Backed Realism
The project SHALL ground all mechanics in peer-reviewed sources.

#### Scenario: Parameter Justification
- WHEN implementing a new mechanic
- THEN it MUST have 2+ peer-reviewed sources (2024-2025 preferred)
- AND parameter values MUST be justified from research data
- AND mechanism description MUST explain interactions with existing systems
- AND expected timeline MUST be defined (early/mid/late game relevance)
- AND failure modes MUST be documented

#### Scenario: Monte Carlo Validation
- WHEN a mechanic is implemented
- THEN it MUST be validated with N≥10 Monte Carlo runs
- AND outcome distributions MUST be checked for realism
- AND runs MUST be deterministic (same seed = same results)

### Requirement: Hierarchical Roadmap Organization
The project SHALL maintain domain-specific roadmaps for simulation and frontend work.

#### Scenario: Feature Routing
- WHEN a new feature is proposed
- THEN it MUST be assigned to simulation OR frontend domain
- AND cross-domain features MUST specify deltas for both domains
- AND features MUST link to parent roadmap

### Requirement: Priority-Based Execution
The project SHALL prioritize work using four-tier system.

**Priority Tiers:**
- **CRITICAL:** Blockers, must fix immediately (block all other work)
- **HIGH:** Important, next sprint (1-2 weeks)
- **MEDIUM:** Planned, 1-2 months
- **LOW:** Backlog, 3+ months

#### Scenario: Token Conservation Mode
- WHEN in token conservation mode
- THEN only CRITICAL and HIGH priority work SHALL be executed
- AND MEDIUM/LOW work SHALL be deferred
- AND agents SHALL use extreme efficiency (grep first, skip docs, exit early)

### Requirement: Quality Gates
The project SHALL enforce two mandatory quality gates for all features.

**Quality Gate 1: Research Validation**
- Super-alignment-researcher + research-skeptic review
- Must achieve Grade B or higher
- Grade D/F blocks implementation

**Quality Gate 2: Architecture Review**
- Architecture-skeptic post-implementation review
- CRITICAL/HIGH issues MUST be addressed before merge
- Grade C or lower blocks merge

#### Scenario: Feature Implementation Workflow
- WHEN implementing a complex feature
- THEN orchestrator agent SHALL coordinate workflow
- AND research validation MUST pass (Quality Gate 1)
- AND implementation MUST follow established patterns
- AND architecture review MUST pass (Quality Gate 2)
- AND Monte Carlo validation MUST show N≥10 deterministic runs

### Requirement: Deterministic Simulation
The project SHALL maintain reproducibility through deterministic RNG.

#### Scenario: Monte Carlo Reproducibility
- WHEN running N≥10 simulations with the same seed
- THEN all runs MUST produce identical outputs
- AND coefficient of variation MUST be < 0.01%
- AND `Math.random()` MUST NOT be used (use RNG function)

### Requirement: Defensive Programming
The project SHALL fail loudly on invalid values (no silent fallbacks).

#### Scenario: NaN Detection
- WHEN a calculation produces a numeric value
- THEN it MUST be validated with assertion utilities
- AND fallback values SHALL NOT be used in simulation calculations
- AND initialization/UI display MAY use fallbacks (with explicit justification)

#### Scenario: Missing Required Values
- WHEN a required parameter is missing
- THEN the system MUST throw a clear error
- AND workflows MUST fail (not continue with defaults)
- AND silent fallbacks (like `|| 0`, `?? defaultValue`) MUST NOT be used

### Requirement: Multi-Agent Coordination
The project SHALL route complex work to specialized agents.

**Primary Agents:**
- **orchestrator** - Complex features, multi-system changes
- **simulation-maintainer** - Simulation code (src/simulation/, phases)
- **far-future-ux-designer** - Frontend/dashboard work
- **super-alignment-researcher** - Research literature, parameter extraction
- **research-skeptic** - Validation, contradictory evidence
- **architecture-skeptic** - Post-implementation review
- **priya** - Monte Carlo validation, statistical analysis
- **architect** - Roadmap maintenance, plan archival (end of sessions)
- **devops** - Infrastructure, CI/CD, multi-worker setup

#### Scenario: Feature Implementation
- WHEN a complex feature is requested
- THEN the main context SHALL route to orchestrator agent
- AND orchestrator SHALL spawn specialists as needed
- AND architect SHALL be invoked at end of session for roadmap cleanup

### Requirement: Historical Preservation
The project SHALL preserve implementation histories and research context.

#### Scenario: Feature Completion
- WHEN a feature is completed
- THEN detailed implementation notes MUST be archived
- AND research findings MUST be preserved
- AND validation reports MUST be linked
- AND git history MUST be maintained

---

## Current Status

**Session:** 75 (December 12, 2025) - IN PROGRESS
**Mode:** Maintenance + priority assessment (fallback workflows)
**Research Quality:** A (94.2% validated sources, B+ recent implementations)
**Architecture Health:** A- (0 CRITICAL, 0 HIGH active, 5 MEDIUM identified)
**Test Coverage:** 82.47% (462+ tests passing, 6 known test import failures)
**System State:** Production-ready, ready for next HIGH priority implementation

**Token Conservation:** DISABLED (per PM request Dec 4, 2025)
- Strategy: Full productivity mode restored
- Workers: Running every 4 hours (was hourly)

**Session 70-74 Summary (COMPLETE):**
- Session 70: 30-day Architecture Integration Review COMPLETE, Research audit COMPLETE (Grade A, 94.2%)
- Session 71: Maintenance mode - architecture review + roadmap updates
- Session 72: Hindcast validation protocol research
- Session 73: Rebound effects (Jevons Paradox) IMPLEMENTED (commit 1f6f2a68), citation corrections
- Session 74: Supply Chain Cascade Propagation COMPLETE (QG1 B, QG2 B+, Monte Carlo passed)
- System health: A- (0 CRITICAL, 0 HIGH issues)

**Session 75 Summary (IN PROGRESS):**
- Coffee break: Status review COMPLETE
- Architecture integration review: Session 74 work validated, 0 CRITICAL/HIGH issues
- Research validation audit: Grade B+ (very good), 7,462 references identified for age update
- Research debate: Information Ecology promoted to HIGH priority
  - Rationale: 20-40% impact on managed transition probabilities
  - Research comprehensive (Grade A, 15+ sources)
  - Design specified, ready for implementation
- Roadmap updates: HIGH priority queue now has 1 item (Information Ecology)
- Next: Architect cleanup + commit changes

---

## Active Work

### CRITICAL Priority
None (threshold lowering regression FIXED Dec 9, 2025 - commit 3f3118de, 7130c7e6)

### COMPLETED HIGH Priority (Sessions 64-70)
- HIGH-7: Conditional climate stability floor (research debate finding) - COMPLETE Dec 7, 2025
- H-2 (Energy): Duplicate energy calculation removal (ClimateDeploymentPhase cleanup) - COMPLETE Dec 10, 2025 (commits ad27cd41, 1ca93fe6)
  - VERIFIED: Architecture review confirmed removal of 7-step duplicate logic
  - Single source of truth: EnergyBudgetPhase (order 12.75)
- Sleeper agent rate justification (7.5% → Hubinger et al. 2024) - COMPLETE Dec 10, 2025 (commit 248bad46)
- Sandbagging level citation (0.4-0.6 → van der Weij/Meinke 2024) - COMPLETE Dec 10, 2025 (commit 248bad46)
- Detection risk calibration (50% baseline → time-dependent model) - COMPLETE Dec 10, 2025 (commit fd7694a2)
  - VERIFIED: Time-dependent model implemented (25% early → 80% late, sleeperEconomy.ts:339-355)
- H-1 (Energy): Energy budget system underutilization - COMPLETE Dec 10, 2025 (Phase 1)
  - VERIFIED: ClimateDeploymentPhase consumes effectivenessMultiplier from state.energyBudget.allocations
  - Quality Gate 2: Grade B+ (0 CRITICAL/HIGH issues)
  - Files: aiInfrastructureResources.ts, powerGeneration.ts, EnergyBudgetPhase.ts
  - Tests: energyBudgetIntegration.test.ts (6 tests passing)
- **Issue #747:** AI capability doubling time parameter mismatch - COMPLETE Dec 10, 2025 (commit 451a127f)
  - Fixed: 8mo → 5.9mo (Epoch AI research-verified)
  - Location: aiCapabilities.ts
- **Issue #749:** EnergyBudgetPhase order documentation mismatch - COMPLETE Dec 10, 2025 (commit 0f6c0ab6)
  - Fixed: Comment now matches code (12.75)
- **H-1 (Architecture):** ClimateDeploymentPhase missing energy budget dependency - COMPLETE Dec 12, 2025 (commit 3303f984)
  - Added 'energy-budget' to dependencies array
  - Makes implicit dependency explicit (reads effectiveness multipliers)
- **H-2 (Architecture):** Optional RNG in initialization functions - COMPLETE Dec 12, 2025 (commit 3303f984)
  - oceanAcidification.ts: Made RNG required (was optional with fallback)
  - Added fail-loudly assertion (prevents silent non-determinism)
  - Impact: Consistent Monte Carlo initialization

### COMPLETED HIGH Priority (Session 74)
- **Supply Chain Cascade Propagation** - COMPLETE Dec 12, 2025
  - QG1: Grade B (research validation passed)
  - QG2: Grade B+ (architecture review passed, H-1 defensive fallbacks fixed)
  - Monte Carlo: PASSED (N=10, CV < 0.01%, perfect determinism)
  - Implementation: supplyChainCascades.ts + SupplyChainCascadesPhase.ts (order: 16.5)
  - Impact: Collapse scenarios now 2-5x faster (research-consistent cascade propagation)
  - Evidence: McKinsey 2024, Texas 2021, Scheffer 2023, Ivanov & Dolgui 2020
  - Archive: `docs/implementation-history/2025-12/supply-chain-cascades/`

### HIGH Priority

**Information Ecology** - PROMOTED from Research Debate (Session 75, Dec 12, 2025)
- **Status:** Ready for implementation (research Grade A, design specified)
- **Impact:** Could shift managed transition probabilities by 20-40%
- **Effort:** 3-5 days implementation
- **What's missing:** Misinformation propagation, institutional trust erosion, echo chambers, AI-generated content flooding, epistemic capacity degradation
- **Evidence:** Vosoughi et al. 2018 (falsehoods spread 6x faster), Bail et al. 2018 (polarization feedback), 15+ peer-reviewed sources
- **Research:** `research/information_ecology_epistemic_dynamics_YYYYMMDD.md` (exists, Grade A)
- **Next steps:** Create change proposal in `openspec/changes/information-ecology/`, coordinate implementation via orchestrator
- **Rationale:** Simulation assumes aligned AI recommendations are accepted and societies can coordinate - both assumptions contradicted by peer-reviewed research. Without modeling epistemic degradation, we may be 20-40% too optimistic about managed transitions. Session 75 debate concluded this is the most critical structural gap.

### COMPLETED MEDIUM Priority
- M-5: Threshold uncertainty modeling (distribution sampling library) - COMPLETE Dec 7, 2025
- M-6: Enhanced radiation modeling (acute vs chronic, tissue sensitivity) - COMPLETE Dec 8, 2025
- Missing Climate Systems (4 subsystems: M-4 abrupt sea level rise, compound events, social tipping, M-7 hysteresis) - COMPLETE Dec 5-7, 2025
- Energy Budget Constraints (datacenter/AI GPU growth limits, UBI compute drain) - COMPLETE Dec 9, 2025
- M-1: Detection risk calibration - incomplete integration - COMPLETE Dec 10, 2025 (commit a3b3315b)

### Research-Identified Priorities (Session 70 Debate)

**Context:** Research audit identified five systemic blind spots that could bias simulation toward optimistic outcomes.

**PROMOTED TO HIGH: Information Ecology** - See HIGH Priority section above (Session 75, Dec 12, 2025)
- Research debate (Session 75) confirmed this is the most critical structural gap
- 20-40% impact on managed transition probabilities
- Research comprehensive (Grade A), design specified

**COMPLETED: Supply Chain Cascade Propagation** - Session 74 (Dec 12, 2025)
- See COMPLETED HIGH Priority section above

**COMPLETED: Rebound Effects (Jevons Paradox)** - COMPLETE Session 73 (Dec 12, 2025, commit 1f6f2a68)
- **Implementation:** AIScalingPhase + EnergyBudgetPhase + CoordinatedDeploymentPhase
- **AI productivity:** 60% rebound coefficient (productivity gains → scope creep)
- **Climate tech:** 30% rebound coefficient (efficiency gains → consumption increase)
- **Evidence:** Sorrell et al. 2024 (30-60% rebound), Jevons 1865 (coal efficiency paradox)
- **Files:** AIScalingPhase.ts:33 (PRODUCTIVITY_REBOUND_COEFFICIENT), EnergyBudgetPhase.ts (CLIMATE_TECH_REBOUND), CoordinatedDeploymentPhase.ts (reboundEffectiveness)

**MEDIUM Gap: AI Capability Measurement Validity**
- **Impact:** 8-month doubling time may be optimistic (based on 2010-2024 data, pre-training plateau)
- **Effort:** Parameter uncertainty bands
- **Confidence:** MEDIUM
- **Evidence:** Epoch AI 2025 (diminishing returns), arXiv 2501.02156 (efficiency-aware scaling)
- **Recommendation:** Add uncertainty bounds [12, 8, 6] months

**See:** `reviews/research_debate_simulation_priorities_20251212.md` for complete analysis

### COMPLETED MEDIUM Priority
- **M-1: Dual energy constraint systems** - COMPLETE Dec 10, 2025 (commits 2a06d8f9, 204d6f39, bf94d165)
  - PowerGenerationSystem now integrates with EnergyBudgetPhase
  - AI datacenter usage subtracted from available capacity before climate tech allocation
  - Cross-system communication prevents double-counting
  - Validation script confirms correct integration
  - Architecture review upgrade: B+ → A-
  - Related: Math.random() determinism violation FIXED (nuclearWinter.ts:597)
  - History: docs/implementation-history/m1_energy_integration_20251210.md
- **M-3: Duplicate energy category mapping** - COMPLETE (prior session, verified Session 70)
  - Shared utility correctly used in ClimateDeploymentPhase
  - No duplicate local method exists
  - TypeScript compiles cleanly
- **M-4: AIScalingPhase missing dependencies declaration** - COMPLETE Session 70
  - Added explicit `dependencies: []` with documentation comment
  - Consistent with other no-dependency phases
  - Makes design explicit for phase orchestrator validation

### COMPLETED MEDIUM Priority
- **AI Scaling Paradigm Update** - COMPLETE Dec 11, 2025
  - Conservative three-axis model (pre-training + test-time + efficiency)
  - QG1: Grade B+ (Revised research addresses all critical concerns)
  - QG2: CONDITIONAL PASS (HIGH priority division-by-zero fixed)
  - AI capabilities grow ~2.2x by 2035 baseline (0.66x-7.4x uncertainty band)
  - Pre-training plateau (sigmoid 1.5x by 2027), efficiency 1.5-2x/decade (conservative), economic gating ($1,000/task = 0.15% deployment)
  - Research: `research/ai_scaling_laws_2025_REVISED_20251211.md` (QG1 B+)
  - Implementation: `src/simulation/engine/phases/AIScalingPhase.ts`
  - History: `docs/implementation-history/ai_scaling_three_axis_model_20251211.md` (comprehensive archive)

### COMPLETED MEDIUM Priority
- **Trust Restoration Re-Research** - COMPLETE Dec 11, 2025
  - Replaced Mayer 1995 citation (didn't cover restoration)
  - Research file: `research/institutional_trust_restoration_20251211.md`
  - QG1: Grade B+ (9 peer-reviewed sources 2023-2025)
  - Critique: `reviews/institutional_trust_restoration_critique_20251211.md`
  - Key findings: Trust erosion 25-50%/month, restoration 24-36+ months, procedural changes most effective
  - Implementation requirements: Institutional type modifiers, separate attention vs deep trust, LOW confidence flags

### COMPLETED MEDIUM Priority
- **M-5 (Architecture):** Phase execution order documentation gap (12.x range) - COMPLETE Dec 12, 2025 (commit 12cb6e7c)
  - Created comprehensive documentation: `docs/phase-order-12x-range.md`
  - Documents 7 phases in 12.x range with dependency graph
  - Provides insertion guidelines for future phases
  - Status: Complete (180-line documentation)

### MEDIUM Priority (Backlog)
- Hindcast tuning (1950-2024 historical validation) - HIGH value for model validation
- Calibration protocol (parameter optimization workflow)
- **M-6 (Architecture):** Defensive fallback patterns in remaining files (~50 instances) - MONITORING (2-3 days effort, non-urgent, mostly valid patterns)

### COMPLETED LOW Priority
- **L-1: Duplicate tech category mapping cleanup** - COMPLETE Dec 10, 2025
  - Removed mapTechToEnergyCategory from EnergyBudgetPhase.ts (commit c17a3e4f)
  - Extracted to shared utility (commit 301f1aee)

### LOW Priority
- L-2: Enhanced biodiversity modeling (food web collapse)
- **L-3: Quantum computing breakthrough cascades** - DEFERRED Dec 10, 2025
  - Reason: Incomplete implementation broken TypeScript compilation
  - Required GameState changes documented
  - Phases disabled: QuantumComputingPhase, CryptographySecurityPhase, PostQuantumTransitionPhase
  - Implementation plan needed before re-enabling
  - History: `docs/implementation-history/l3_quantum_cascades_deferral_20251210.md`

---

## Related Specifications

- [Simulation Roadmap](../simulation/spec.md) - Core engine & mechanics
- [Frontend Roadmap](../frontend/spec.md) - Dashboard & visualization
- [Research Standards](../research/spec.md) - Citation verification, peer review requirements
- [Quality Gates](../quality-gates/spec.md) - QG1 (research) + QG2 (architecture)

---

## Development Standards

### Phase-Based Architecture
~37 composable phases per simulation step. See [Simulation Spec](../simulation/spec.md).

### Emoji Conventions
ONE canonical emoji per concept. All emojis MUST be registered in `docs/EMOJI_EVENT_MAP.txt`.
- ✅ Success
- ❌ Error (all errors use this, not 💀🔥)
- ⚠️ Warning
- 🚨 Critical alert
- 🌍 Planetary/environment
- 🤖 AI systems
- ☢️ Nuclear
- 🔬 Research/science

See: `docs/EMOJI_QUICK_REFERENCE.md` (one-page cheat sheet)

### Logging
- Always save logs to `/logs/` (NEVER `/tmp/`, which gets cleared)
- Use structured format with emoji prefixes
- Include phase names and relevant context

### Git Workflow
- Never run force push to main/master
- Always verify authorship before `git commit --amend`
- Never skip hooks unless explicitly requested
- Create commits only when user explicitly asks

---

## Session History

See: `docs/sessions.md` for complete session milestone tracking

**Recent Sessions:**
- Session 70 (Dec 12): 30-day Architecture Review COMPLETE (A-), M-3/M-4 bugs RESOLVED, Research audit COMPLETE (A, 94.2% validated), Research debate identified 5 systemic blind spots, roadmap maintenance, archival complete
- Session 69 (Dec 11 Night): Research foundation EXCELLENT (A grade, 94.2% validated sources)
- Session 68 (Dec 11 Night): Trust Restoration Re-Research COMPLETE (B+), Research Source Validation Audit (A, 613 files), Architecture Review (A-), research foundation solid
- Session 67 (Dec 11): AI Scaling implementation COMPLETE (Grade B+ QG1 revised, Grade B- QG2), conservative three-axis model, technical debt tracked
- Session 66 (Dec 10 Night): CRITICAL TypeScript fix (quantum removal), fallback workflow execution, roadmap maintenance
- Session 65 (Dec 10): M-1 dual energy integration COMPLETE, Math.random() fix COMPLETE, Architecture A-, all HIGH/MEDIUM complete
- Session 64 (Dec 10): Research audit completion + H-2 duplicate energy fix + architecture integration review
- Session 63 (Dec 10): Research source validation (sleeper agent rate, sandbagging, detection risk) + archival
- Session 62 (Dec 9): CRITICAL regression fix + H-1/H-2 architecture integration + research audit follow-up
- Session 60 (Dec 9): Coffee break + archival + Energy Budget launch (~90k tokens)

---

## Contributing

### Before Starting Work
1. Check active work in this spec
2. Check specialized roadmaps ([Simulation](../simulation/spec.md), [Frontend](../frontend/spec.md))
3. Review `CLAUDE.md` for agent routing guidance
4. Use TodoWrite tool to track tasks

### Implementation Workflow
1. Create change proposal in `openspec/changes/[feature-name]/`
2. Research validation (Quality Gate 1)
3. Implementation via specialized agents
4. Architecture review (Quality Gate 2)
5. Monte Carlo validation (N≥10)
6. Merge delta into specs
7. Archive to `docs/implementation-history/`

### End of Session
**ALWAYS invoke architect agent** to clean up roadmap and archive completed work.
