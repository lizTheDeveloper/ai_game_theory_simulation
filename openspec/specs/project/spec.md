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

**Session:** 65 (December 10, 2025)
**Mode:** Maintenance + Critical Review Integration
**Research Quality:** C (53.4% sources from 2024-2025) - Grade corrected from Dec 10 audit
**Architecture Health:** A- (0 CRITICAL, 1 HIGH doc need, 3 MEDIUM items)
**Test Coverage:** 82.47% (462+ tests passing, 6 known test import failures)
**System State:** Production-ready, all quality gates GREEN

**Token Conservation:** DISABLED (per PM request Dec 4, 2025)
- Strategy: Full productivity mode restored
- Workers: Running every 4 hours (was hourly)

**Key Session 65 Findings:**
- Architecture 30-day review: Grade A- (H-2 duplicate energy RESOLVED, H-1 dual-system design intentional)
- Research audit: Grade C (53.4% currency, stable but needs refresh - 178 files >5 years old)
- Research debate: 8 new MEDIUM/LOW proposals, 5 parameter recalibrations identified

---

## Active Work

### CRITICAL Priority
None (threshold lowering regression FIXED Dec 9, 2025 - commit 3f3118de, 7130c7e6)

### COMPLETED HIGH Priority (Session 64-65)
- HIGH-7: Conditional climate stability floor (research debate finding) - COMPLETE Dec 7, 2025
- H-2: Duplicate energy calculation removal (ClimateDeploymentPhase cleanup) - COMPLETE Dec 10, 2025 (commits ad27cd41, 1ca93fe6, 301f1aee)
- Sleeper agent rate justification (7.5% → Hubinger et al. 2024) - COMPLETE Dec 10, 2025 (commit 248bad46)
- Sandbagging level citation (0.4-0.6 → van der Weij/Meinke 2024) - COMPLETE Dec 10, 2025 (commit 248bad46)
- Detection risk calibration (50% baseline → time-dependent model) - COMPLETE Dec 10, 2025 (commit fd7694a2)
- H-1: Energy budget system underutilization - COMPLETE Dec 10, 2025 (Phase 1)
  - Integrated AI infrastructure, power generation, and crypto mining with energy budget
  - Quality Gate 2: Grade B- (M-2 blocker fixed)
  - Files: aiInfrastructureResources.ts, powerGeneration.ts, EnergyBudgetPhase.ts
  - Tests: energyBudgetIntegration.test.ts (6 tests passing)
  - Tech debt tracked: H-1 one-step lag doc, M-1 dedup tech mapping, M-3 assertion standardization
- 30-day architecture integration review - COMPLETE Dec 10, 2025 (commit a930cae5)
  - Grade: A- (0 CRITICAL, 1 HIGH doc need, 3 MEDIUM items)
  - H-2 duplicate energy calculation RESOLVED
  - H-1 dual-system design clarified (intentional separation)
- 30-day research source audit - COMPLETE Dec 10, 2025
  - Grade: C (53.4% sources from 2024-2025, stable but needs refresh)
  - 178 files >5 years old identified for archival
  - Recent implementations maintain high standards (M-4: 90%, HIGH-7: 100%)
- Research debate session - COMPLETE Dec 10, 2025
  - 8 new MEDIUM/LOW proposals identified
  - 5 parameter recalibrations recommended
  - Core finding: Tractability engineering vs research-backed decisions

### HIGH Priority
**H-NEW-1: Document Dual Energy Constraint Systems**
- **Status:** Documentation needed (no code changes)
- **Severity:** HIGH (model clarity)
- **Finding:** Two systems are INTENTIONAL separation of concerns:
  - EnergyBudgetPhase (12.75): Tech deployment constraints (DAC, hydrogen)
  - PowerGenerationSystem (17.0): Datacenter constraints (AI, crypto)
- **Action:** Add architecture doc explaining design rationale
- **Review:** architecture_integration_review_30day_20251210.md
- **Effort:** TRIVIAL (30 min)

### COMPLETED MEDIUM Priority
- M-5: Threshold uncertainty modeling (distribution sampling library) - COMPLETE Dec 7, 2025
- M-6: Enhanced radiation modeling (acute vs chronic, tissue sensitivity) - COMPLETE Dec 8, 2025
- Missing Climate Systems (4 subsystems: M-4 abrupt sea level rise, compound events, social tipping, M-7 hysteresis) - COMPLETE Dec 5-7, 2025
- Energy Budget Constraints (datacenter/AI GPU growth limits, UBI compute drain) - COMPLETE Dec 9, 2025
- M-1: Detection risk calibration - incomplete integration - COMPLETE Dec 10, 2025 (commit a3b3315b)

### MEDIUM Priority (Backlog)
**From Architecture Review:**
- M-1: Remove local mapTechToEnergyCategory from ClimateDeploymentPhase (use shared utility) - TRIVIAL
- M-2: Add phase dependency comment to ClimateDeploymentPhase re: EnergyBudgetPhase timing
- M-3: Document one-month lag between PowerGenerationSystem and EnergyBudgetPhase

**From Research Debate (Session 65):**
- M-NEW-1: Implement hysteresis in tipping point recovery (AMOC +2-4C, WAIS irreversible)
- M-NEW-2: Add rebound effects to energy budget (Jevons paradox, coefficient 0.3-0.6)
- M-NEW-3: Cultural context modifiers for trust dynamics (collectivist, tribal, authoritarian)
- M-NEW-4: Technology-specific effectiveness exponents (solar 1.0, DAC 1.3, hydrogen 1.1)

**Legacy:**
- Hindcast tuning (1950-2024 historical validation)
- Calibration protocol (parameter optimization workflow)

### LOW Priority
**From Research Debate (Session 65):**
- L-NEW-1: Grid transmission loss multiplier (regional efficiency 0.85-0.95)
- L-NEW-2: Compound tipping interaction matrix (full coupling, cascade amplification)
- L-NEW-3: Stratified evacuation capacity (income stratification, disaster-type multipliers)
- L-NEW-4: Bimodal AMOC uncertainty (replace triangular with bimodal distribution)

**From Research Audit:**
- Archive 178 files >5 years old to /research/legacy/
- Refresh AI safety citations (2024-2025 alignment research)
- Update economic recovery parameters (2022-2024 World Bank studies)
- Add missing citations to 3-5 simulation parameters

**Legacy:**
- L-2: Enhanced biodiversity modeling (food web collapse)
- L-3: Quantum computing breakthrough cascades

---

## Parameter Recalibrations Pending (Research Debate Session 65)

**Identified by Sylvia (Research Skeptic)** on 2025-12-10. NOT yet implemented - documented for future consideration.

| Parameter | Current | Recommended | Justification | Priority |
|-----------|---------|-------------|---------------|----------|
| WAIS threshold mode | 1.5C | 1.0-1.2C | 2025 evidence shows current warming may exceed | HIGH |
| Social recovery rate | 1%/month | 0.3%/month | Without massive investment, recovery far slower | MEDIUM |
| Effectiveness exponent | 1.2 (all) | 1.0-1.3 (tech-specific) | Linear for most, non-linear for DAC | MEDIUM |
| AI datacenter baseline | 730 TWh | 415-460 TWh | IEA 2025 actual data | LOW |
| DAC energy lower bound | 1,000 kWh/tCO2 | 1,200 kWh/tCO2 | Stanford + actual deployments | LOW |

**Parameter Research Grade Updates:**

| Parameter | Old Grade | New Grade | Rationale |
|-----------|-----------|-----------|-----------|
| Tier allocations | B+ | C+ | Conceptual only, no quantitative validation |
| Effectiveness exponent | C | C | Confirmed arbitrary |
| Climate stability floor | D- | D- | Unchanged (documented correctly as tractability) |
| Trust decay rates | A- | B | Western-only applicability |
| Evacuation capacity | A- | C | Conflates incompatible concepts |

**Review Source:** `reviews/research_debate_session65_20251210.md`

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
- Session 65 (Dec 10): Comprehensive review integration (architecture A-, research C, debate findings)
- Session 64 (Dec 10): Research audit completion + H-2 duplicate energy fix + architecture integration review
- Session 63 (Dec 10): Research source validation (sleeper agent rate, sandbagging, detection risk) + archival
- Session 62 (Dec 9): CRITICAL regression fix + H-1/H-2 architecture integration + research audit follow-up
- Session 60 (Dec 9): Coffee break + archival + Energy Budget launch (~90k tokens)

**Session 65 Key Outcomes:**
- Architecture health: A- (H-2 RESOLVED, dual-system design intentional)
- Research quality: C (53.4% currency, stable, needs refresh)
- Roadmap updated: 1 HIGH, 7 MEDIUM, 8 LOW items added
- Parameter recalibrations identified: 5 (WAIS threshold, effectiveness exponent, etc.)
- Critical finding: Tractability engineering vs research-backed decisions needs clearer documentation

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
