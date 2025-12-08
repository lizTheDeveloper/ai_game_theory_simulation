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

**Session:** 56 (December 8, 2025)
**Mode:** Consolidation (all active roadmap items COMPLETE)
**Research Quality:** B- (per research-skeptic Dec 8 audit - asymmetric research standards)
**Architecture Health:** B+ (3 HIGH, 3 MEDIUM issues identified)
**Test Coverage:** 82.47% (462+ tests passing)
**System State:** Production-ready, consolidation phase

**Token Conservation:** DISABLED (per PM request Dec 4, 2025)
- Normal operation restored
- Full productivity mode, hourly autonomous workers
- Quality-over-speed approach

---

## Active Work

### CRITICAL Priority
None

### HIGH Priority (From Dec 8 Reviews)

#### HIGH-8: Supply Chain Cascade Multiplier
**Source:** Research debate Dec 8 (Sylvia)
**Context:** McKinsey 2024 - avg company has 38K tier-3 suppliers with 0.2% visibility. Texas freeze 2021: 3-day grid failure → $195B cascade damages. Collapse scenarios model individual failures, not cascade propagation.
**Scope:** Add cascade multiplier where system failures degrade adjacent systems (grid → water → food)
**Complexity:** 3 systems (infrastructure, water, food)
**Effort:** 2-3 days
**Priority Rationale:** Critical gap in civilizational collapse modeling (Scheffer 2023)

#### HIGH-9: Stochastic Rebound Effects
**Source:** Research debate Dec 8 (Sylvia)
**Context:** Fixed 0.7 multiplier (30% rebound) should be distribution [0.3, 0.9] per Sorrell 2024
**Scope:** Replace hardcoded rebound multiplier with sampled distribution
**Complexity:** 2 systems (technology effects, M-5 distribution sampling)
**Effort:** 1 day
**Priority Rationale:** Jevons paradox is stochastic, not deterministic

#### HIGH-10: Dynamic require() in Hot Path
**Source:** Architecture review Dec 8 (HIGH-1)
**Context:** `nuclearWinter.ts:509` uses dynamic `require()` breaking ESM compatibility
**Scope:** Convert to static import
**Complexity:** 1 system (nuclear winter)
**Effort:** 5 minutes
**Priority Rationale:** Breaks tree-shaking, runtime dependency issues

#### HIGH-11: Legacy Radiation Modeling Dual Paths
**Source:** Architecture review Dec 8 (HIGH-2)
**Context:** M-6 enhanced modeling coexists with legacy decay in same function
**Scope:** Migrate all zones to enhanced format OR deprecate legacy path
**Complexity:** 2 systems (radiation modeling, nuclear winter)
**Effort:** Medium (data migration or compatibility layer)
**Priority Rationale:** Inconsistent mortality calculations for zones created at different times

#### HIGH-12: Orphaned Phase Files Cleanup
**Source:** Architecture review Dec 8 (HIGH-3)
**Context:** `NuclearWinterPhase.ts`, `RadiationSystemPhase.ts` consolidated into `NuclearCrisisPhase.ts` (Nov 9) but not deleted
**Scope:** Delete orphaned files or add clear deprecation comments
**Complexity:** 1 system (phase orchestrator)
**Effort:** 10 minutes
**Priority Rationale:** Dead code confuses future developers

### MEDIUM Priority

#### MEDIUM-4: Placeholder Audit Campaign
**Source:** Research debate Dec 8 (Sylvia)
**Context:** 50+ TODOs, PLACEHOLDERs, hardcoded values. 3 FICTIONAL markers with NO RESEARCH BASIS.
**Scope:** Systematic replacement with research-backed values
**Complexity:** 15+ systems (cooperative ownership, freshwater, phosphorus, etc.)
**Effort:** 1-2 weeks
**Priority Rationale:** Claimed A- research quality incompatible with FICTIONAL placeholders

#### MEDIUM-5: Tail Scenario Research Campaign
**Source:** Research debate Dec 8 (Sylvia - asymmetric research standards)
**Context:** Best-case scenarios research-backed, worst-case scenarios engineering estimates
**Scope:** Apply same rigor to tail scenarios as best cases
**Complexity:** Cross-cutting (climate, AI, tech deployment)
**Effort:** 2-3 weeks
**Priority Rationale:** Monte Carlo distributions systematically underweight tail risks

#### MEDIUM-6: Threshold Uncertainty Propagation
**Source:** Architecture review Dec 8 (MEDIUM-1)
**Context:** Not all TIPPING_ELEMENTS have `thresholdDistribution` defined
**Scope:** Audit `TIPPING_ELEMENTS` and add research-backed distributions
**Complexity:** 2 systems (tipping points, threshold uncertainty)
**Effort:** Medium (research + type updates)
**Priority Rationale:** Monte Carlo runs don't fully capture uncertainty for all elements

#### MEDIUM-7: Sunlight Blocking Integration Gap
**Source:** Architecture review Dec 8 (MEDIUM-2)
**Context:** Nuclear winter affects solar power but not wind patterns, power disruption → agriculture cascade incomplete
**Scope:** Document remaining ARCH-4 gaps, consider second-order effects
**Complexity:** 3 systems (nuclear winter, power, agriculture)
**Effort:** Medium-Large
**Priority Rationale:** Model may underestimate cascading infrastructure effects

#### MEDIUM-8: ClimateSystemPhase Modularization
**Source:** Architecture review Dec 8 (MEDIUM-3)
**Context:** 1,469-line phase consolidating 4 former phases
**Scope:** Extract hysteresis state machine and compound event detection into utilities
**Complexity:** 1 system (climate)
**Effort:** Medium (refactor without behavioral changes)
**Priority Rationale:** Maintainability concern

### COMPLETED (Dec 7-8, 2025)
- M-5: Threshold uncertainty modeling - COMPLETE Dec 7
- M-6: Enhanced radiation modeling - COMPLETE Dec 8
- M-7: Fix population assertions for near-extinction - COMPLETE Dec 7
- HIGH-7: Conditional climate stability floor - COMPLETE Dec 7

### LOW Priority (Deferred)
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
- Session 55 (Dec 5): Maintenance mode (early exit, ~10k tokens)
- Session 54 (Dec 5): M-4 Complete - Abrupt Sea Level Rise (~15k tokens)
- Session 51 (Dec 3): Validation cycle (research + architecture, ~8k tokens)

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
