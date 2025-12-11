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

**Session:** 65 (December 10, 2025) - COMPLETE
**Mode:** Archival complete
**Research Quality:** B- (64.9% sources <3yr old, 30.7% >5yr backlog)
**Architecture Health:** A- (0 CRITICAL, 0 HIGH, 0 MEDIUM)
**Test Coverage:** 82.15% (462+ tests passing, 6 known test import failures)
**System State:** Production-ready, all quality gates GREEN

**Token Conservation:** DISABLED (per PM request Dec 4, 2025)
- Strategy: Full productivity mode restored
- Workers: Running every 4 hours (was hourly)
**Session:** 59+ (December 7, 2025)
**Mode:** Maintenance (ongoing)
**Session:** 56 (December 7, 2025)
**Mode:** Maintenance (18 consecutive maintenance sessions: 34-56)
>>>>>>> origin/auto/worker-20251207_150002
**Research Quality:** A- (68.8% sources from 2024-2025)
**Architecture Health:** A- (0 CRITICAL, 0 HIGH blockers)
**Test Coverage:** 82.47% (462+ tests passing)
**System State:** Production-ready, all quality gates GREEN

**Token Conservation:** DISABLED (Dec 4, 2025 - normal operation restored)
- Strategy: Full productivity mode, hourly workers
- All priority levels: Active
>>>>>>> origin/auto/worker-20251207_150002

---

## Active Work

### CRITICAL Priority
None - All CRITICAL work complete

**Recent CRITICAL Fixes:**
- Threshold lowering regression (Dec 10, 2025 - commit 4259d54a)
  - Context: Fixes reverted in merge, AMOC→Amazon interaction removal re-applied
  - Verification: Research audit detected regression, simulation-maintainer executed fix
  - Status: COMPLETE

### COMPLETED HIGH Priority (Session 64-65)

**Quality Gate Achievements:**
- Architecture Integration Review (Dec 10) - Grade A- (0 CRITICAL/HIGH issues)
- Research Source Validation Audit (Dec 10) - Grade B- (64.9% sources <3yr)

**Completed Items:**
- HIGH-7: Conditional climate stability floor (research debate finding) - COMPLETE Dec 7, 2025
- H-2: Duplicate energy calculation removal (ClimateDeploymentPhase cleanup) - COMPLETE Dec 10, 2025 (commits ad27cd41, 1ca93fe6)
  - VERIFIED: Architecture review confirmed removal of 7-step duplicate logic
  - Single source of truth: EnergyBudgetPhase (order 12.75)
- Sleeper agent rate justification (7.5% → Hubinger et al. 2024) - COMPLETE Dec 10, 2025 (commit 248bad46)
- Sandbagging level citation (0.4-0.6 → van der Weij/Meinke 2024) - COMPLETE Dec 10, 2025 (commit 248bad46)
- Detection risk calibration (50% baseline → time-dependent model) - COMPLETE Dec 10, 2025 (commit fd7694a2)
  - VERIFIED: Time-dependent model implemented (25% early → 80% late, sleeperEconomy.ts:339-355)
- H-1: Energy budget system underutilization - COMPLETE Dec 10, 2025 (Phase 1)
  - VERIFIED: ClimateDeploymentPhase consumes effectivenessMultiplier from state.energyBudget.allocations
  - Quality Gate 2: Grade B+ (0 CRITICAL/HIGH issues)
  - Files: aiInfrastructureResources.ts, powerGeneration.ts, EnergyBudgetPhase.ts
  - Tests: energyBudgetIntegration.test.ts (6 tests passing)
- **Issue #747:** AI capability doubling time parameter mismatch - COMPLETE Dec 10, 2025 (commit 451a127f)
  - Fixed: 8mo → 5.9mo (Epoch AI research-verified)
  - Location: aiCapabilities.ts
- **Issue #749:** EnergyBudgetPhase order documentation mismatch - COMPLETE Dec 10, 2025 (commit 0f6c0ab6)
  - Fixed: Comment now matches code (12.75)

### HIGH Priority
None (all HIGH items verified complete)
None (system in maintenance mode)

**Recently Completed:**
- HIGH-7: Conditional Climate Stability Floor (Session 56)
>>>>>>> origin/auto/worker-20251207_170001

### MEDIUM Priority
>>>>>>> origin/auto/worker-20251207_150002
- M-6: Enhanced radiation modeling (acute vs chronic, tissue sensitivity)
>>>>>>> origin/auto/worker-20251207_140001

### LOW Priority
- L-2: Enhanced biodiversity modeling (food web collapse)
- L-3: Quantum computing breakthrough cascades

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
- Session 56 (Dec 7): Verification cycle - HIGH-7, M-5 confirmed complete from previous sessions
- Session 55 (Dec 5): Maintenance mode (early exit, ~10k tokens)
- Session 54 (Dec 5): M-4 Complete - Abrupt Sea Level Rise (~15k tokens)
>>>>>>> origin/auto/worker-20251207_150002

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
