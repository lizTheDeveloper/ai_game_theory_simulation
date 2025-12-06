# OpenSpec Translation Guide
## Mapping Superalignment→Utopia Roadmap System to OpenSpec

**Created:** December 6, 2025
**Purpose:** Define how our hierarchical roadmap system translates to OpenSpec's spec-driven development framework

---

## TL;DR - Quick Mapping

| Our System | OpenSpec Equivalent |
|-----------|-------------------|
| `MASTER_IMPLEMENTATION_ROADMAP.md` | `openspec/specs/project/spec.md` (meta-spec) |
| `SIMULATION_ROADMAP.md` | `openspec/specs/simulation/spec.md` |
| `FRONTEND_ROADMAP.md` | `openspec/specs/frontend/spec.md` |
| `proposed_*.md` files | `openspec/changes/[feature-name]/` |
| `plans/completed/` | Merged deltas (archived in git history) |
| CRITICAL/HIGH/MEDIUM/LOW | Requirement priority metadata |

---

## 1. Understanding OpenSpec Structure

### Core Concepts

**OpenSpec separates:**
1. **Living truth** (`openspec/specs/`) - Current system specifications
2. **Proposed changes** (`openspec/changes/`) - Feature branches with deltas
3. **Delta format** - ADDED/MODIFIED/REMOVED requirements

**Key principles:**
- Specs use SHALL/MUST language for requirements
- Each requirement has scenario blocks (WHEN/THEN)
- Changes are deltas showing modifications, not full replacements
- Multiple domains can be updated in a single change proposal

### Directory Layout

```
openspec/
├── specs/                          # Source of truth (like our roadmaps)
│   ├── project/
│   │   └── spec.md                 # Meta-spec (like MASTER roadmap)
│   ├── simulation/
│   │   └── spec.md                 # Simulation engine specs
│   └── frontend/
│       └── spec.md                 # Dashboard/UI specs
├── changes/                        # Proposed work (like proposed_*.md)
│   └── [feature-name]/
│       ├── proposal.md             # Why/what
│       ├── tasks.md                # Implementation checklist
│       ├── design.md               # Technical decisions (optional)
│       └── specs/
│           ├── simulation/
│           │   └── spec.md         # Delta for simulation
│           └── frontend/
│               └── spec.md         # Delta for frontend
├── project.md                      # Conventions (like CLAUDE.md)
└── AGENTS.md                       # AI workflow (like .claude/agents/)
```

---

## 2. Translating Our Hierarchical Roadmaps

### 2.1 Master Roadmap → Meta-Spec

**Current:** `MASTER_IMPLEMENTATION_ROADMAP.md`
- Hub linking to specialized roadmaps
- Priority-based tracking (CRITICAL → HIGH → MEDIUM → LOW)
- Progress summary, session milestones
- Overall project status

**OpenSpec:** `openspec/specs/project/spec.md`

```markdown
# Project Specification

## Purpose
AI Alignment Game Theory Simulation - Research-backed modeling of pathways from
super-alignment to sustainable flourishing.

## Requirements

### Requirement: Research-Backed Realism
The project SHALL ground all mechanics in peer-reviewed sources (2024-2025 preferred).

#### Scenario: Parameter Justification
- WHEN implementing a new mechanic
- THEN it MUST have 2+ peer-reviewed sources
- AND parameter values MUST be justified from research data
- AND mechanism description MUST explain interaction with existing systems

### Requirement: Hierarchical Roadmap Organization
The project SHALL maintain domain-specific roadmaps for simulation and frontend work.

#### Scenario: Feature Routing
- WHEN a new feature is proposed
- THEN it MUST be assigned to simulation OR frontend domain
- AND cross-domain features MUST specify deltas for both domains

### Requirement: Priority-Based Execution
The project SHALL prioritize work using CRITICAL > HIGH > MEDIUM > LOW tiers.

#### Scenario: Token Conservation Mode
- WHEN in token conservation mode
- THEN only CRITICAL and HIGH priority work SHALL be executed
- AND MEDIUM/LOW work SHALL be deferred

### Requirement: Quality Gates
The project SHALL enforce research validation and architecture review gates.

#### Scenario: Feature Implementation Workflow
- WHEN implementing a complex feature
- THEN research validation MUST pass (Quality Gate 1)
- AND architecture review MUST pass (Quality Gate 2)
- AND Monte Carlo validation MUST show N≥10 deterministic runs

## Related Specifications
- [Simulation Roadmap](../simulation/spec.md)
- [Frontend Roadmap](../frontend/spec.md)
```

### 2.2 Simulation Roadmap → Simulation Spec

**Current:** `SIMULATION_ROADMAP.md`
- Core engine & mechanics
- Research-backed features
- Monte Carlo validation requirements
- Phase-based architecture work

**OpenSpec:** `openspec/specs/simulation/spec.md`

```markdown
# Simulation Specification

## Purpose
Core simulation engine implementing research-backed climate, social, AI, and technological
systems for modeling alignment→flourishing pathways.

## Requirements

### Requirement: Deterministic Simulation
The simulation SHALL be reproducible with RNG seeds for Monte Carlo analysis.

#### Scenario: Monte Carlo Validation
- WHEN running N≥10 simulations with the same seed
- THEN all runs MUST produce identical outputs
- AND coefficient of variation MUST be < 0.01%

### Requirement: Phase-Based Architecture
The simulation SHALL execute ~37 composable phases per simulation step.

#### Scenario: Phase Registration
- WHEN creating a new phase
- THEN it MUST be registered in PhaseOrchestrator
- AND it MUST declare dependencies on other phases
- AND it MUST use assertion utilities (no silent fallbacks)

### Requirement: NaN-Free State
The simulation SHALL fail loudly on NaN/Infinity/undefined values in calculations.

#### Scenario: Defensive Assertions
- WHEN a calculation produces a numeric value
- THEN it MUST be validated with assertFinite/assertProbability/assertStateProperty
- AND fallback values SHALL NOT be used (fail loudly instead)

### Requirement: Planetary Boundaries Modeling
The simulation SHALL model 9 planetary boundaries per Richardson et al. (2023).

#### Scenario: Boundary Transgression
- WHEN a boundary exceeds safe operating space
- THEN it MUST trigger cascade risk calculations
- AND it MUST update environmental debt
- AND recovery SHALL follow research-backed timescales (decades to millennia)

### Requirement: Multi-Paradigm DUI
The simulation SHALL track 4 simultaneous paradigm perspectives on well-being.

#### Scenario: Paradigm Divergence
- WHEN paradigms diverge by >20 points
- THEN it MUST trigger social conflict mechanics
- AND policy effectiveness SHALL be reduced

## Active Work

### CRITICAL Priority
- None (system in maintenance mode)

### HIGH Priority
- HIGH-7: Conditional climate stability floor (research debate finding)

### MEDIUM Priority
- M-5: Threshold uncertainty modeling (distribution sampling library)
- M-6: Enhanced radiation modeling (acute vs chronic, tissue sensitivity)

### LOW Priority
- L-2: Enhanced biodiversity modeling (food web collapse)
- L-3: Quantum computing breakthrough cascades
```

### 2.3 Frontend Roadmap → Frontend Spec

**Current:** `FRONTEND_ROADMAP.md`
- Next.js dashboard implementation
- Data visualization requirements
- God Mode UI system

**OpenSpec:** `openspec/specs/frontend/spec.md`

```markdown
# Frontend Specification

## Purpose
Next.js dashboard for visualizing simulation state with far-future aesthetics
(Elysium-inspired, high-contrast, glowing accents).

## Requirements

### Requirement: Real-Time Simulation Updates
The dashboard SHALL update in real-time as the simulation progresses.

#### Scenario: Web Worker Integration
- WHEN the simulation runs in a Web Worker
- THEN the dashboard MUST receive incremental state updates
- AND it MUST render deltas (not full state re-renders)

### Requirement: Multi-Paradigm Visualization
The dashboard SHALL display all 4 paradigm perspectives simultaneously.

#### Scenario: Paradigm Card Drill-Down
- WHEN a user clicks a paradigm card
- THEN it MUST show detailed indicator breakdowns
- AND it MUST show 12-month sparkline history

### Requirement: God Mode Manual Control
The dashboard SHALL expose ALL automated simulation decisions as manual controls.

#### Scenario: Policy Override
- WHEN a user enables God Mode
- THEN they MUST be able to override government policy decisions
- AND control individual AI agent actions
- AND set society priorities and responses
- AND intervene in any phase's automated logic

### Requirement: Far-Future Aesthetics
The dashboard SHALL use Elysium-inspired design language.

#### Scenario: Visual Design
- WHEN rendering UI components
- THEN they MUST use high-contrast black/white/glowing aesthetic
- AND they MUST avoid cluttered information density
- AND they MUST use clean geometric layouts

## Active Work

### CRITICAL Priority
- CRITICAL-1: Game UI State Integration (dashboard not consuming simulation state)

### HIGH Priority
- None

### MEDIUM Priority
- M-7: Coverage report dashboard
- M-8: Monte Carlo outcome analysis dashboard
```

### 2.4 Sub-Specs and Hierarchical Organization

**Current structure:**
- MASTER → SIMULATION → God Mode UI plan → specific components
- MASTER → FRONTEND → Game Design plans → dashboard elements
- Plans within plans, 3-4 levels deep

**Example hierarchy:**
```
MASTER_IMPLEMENTATION_ROADMAP.md
├── SIMULATION_ROADMAP.md
│   ├── god-mode-ui-master-plan.md
│   │   ├── god-mode-ui-architecture.md
│   │   ├── god-mode-decision-inventory.md
│   │   └── god-mode-implementation-phases.md
│   └── PHASE3_RESEARCH_SCENARIOS_EXECUTION_PLAN.md
└── FRONTEND_ROADMAP.md
    └── game-design/
        ├── GAME_DESIGN_DOCUMENT.md
        └── DASHBOARD_ELEMENTS_REVIEW_V2.md
```

**OpenSpec approach:**
- Each domain can have sub-domains
- Specs can reference other specs
- Use hierarchical folder structure

**Translation:**
```
openspec/specs/
├── project/
│   └── spec.md                     # Meta-spec (MASTER)
├── simulation/
│   ├── spec.md                     # Core simulation
│   ├── god-mode/
│   │   ├── spec.md                 # God mode system
│   │   ├── architecture.md         # Technical design
│   │   └── decisions.md            # Decision inventory
│   └── research-scenarios/
│       └── spec.md                 # Phase 3 scenarios
└── frontend/
    ├── spec.md                     # Core dashboard
    └── game-design/
        ├── spec.md                 # Game design principles
        └── dashboard-elements.md   # Dashboard components
```

**Example sub-spec:**

**File: `openspec/specs/simulation/god-mode/spec.md`**
```markdown
# God Mode Specification

## Purpose
Comprehensive manual control interface exposing ALL automated simulation decisions.

**Parent Spec:** [Simulation](../spec.md)

## Requirements

### Requirement: Policy Override Control
The system SHALL allow manual override of all government policy decisions.

#### Scenario: Climate Policy Override
- WHEN user enables God Mode
- THEN they MUST see all automated climate policy decisions
- AND they MUST be able to override each decision
- AND overrides MUST persist for simulation duration

### Requirement: AI Agent Control
The system SHALL allow manual control of individual AI agent actions.

#### Scenario: Agent Decision Override
- WHEN an AI agent makes a decision
- THEN user MUST see the decision in God Mode panel
- AND user MUST be able to override it
- AND simulation MUST use overridden value

## Related Specifications
- [Parent: Simulation](../spec.md)
- [Architecture Design](./architecture.md)
- [Decision Inventory](./decisions.md)
- [Frontend Dashboard](../../frontend/spec.md#god-mode-ui)
```

**Cross-referencing:**

**File: `openspec/specs/simulation/spec.md`**
```markdown
## Requirements

### Requirement: God Mode System
The simulation SHALL support manual override of all automated decisions.

See: [God Mode Specification](./god-mode/spec.md)
```

**File: `openspec/specs/frontend/spec.md`**
```markdown
### Requirement: God Mode UI
The dashboard SHALL provide UI for manual simulation control.

See: [God Mode Specification](../simulation/god-mode/spec.md)
```

---

## 3. Special Queues and Tracking

### 3.1 Research Verification Queue

**Current structure:**
- Lives in SIMULATION_ROADMAP.md under "RESEARCH VERIFICATION QUEUE"
- Tracks papers needing verification
- Has CRITICAL/HIGH priority items
- Links to verification reports in `research/verification_*.md`

**Example from our roadmap:**
```markdown
## ⚠️ RESEARCH VERIFICATION QUEUE

- **Hindcast Food Security Calibration** - CRITICAL BLOCKER
  - Verification: research/verification_hindcast_food_security_20251124.md
  - Finding: 50-150% underestimation of 1990 hunger
  - Status: ✅ VERIFIED - Ready for implementation

- **Climate Stability Self-Limiting Mechanisms** - ❌ GRADE D FAILED
  - Verification: research/verification_dc1d6ac_20251125.md
  - Finding: Citations contradict claims (cherry-picking detected)
  - Status: ✅ RESEARCH CORRECTED
```

**OpenSpec translation:**

**Option 1: Separate verification spec**
```
openspec/specs/research/
├── spec.md                         # Research standards
└── verification-queue.md           # Active verifications
```

**File: `openspec/specs/research/verification-queue.md`**
```markdown
# Research Verification Queue

## Purpose
Track research citations requiring verification before implementation.

**Parent Spec:** [Research Standards](./spec.md)

## Requirements

### Requirement: Citation Verification
All research citations SHALL be verified against actual paper content.

#### Scenario: Implementation Blocker
- WHEN a citation supports a critical parameter
- THEN it MUST be verified before implementation proceeds
- AND verification MUST produce a Grade (A/B/C/D/F)

## Active Verifications

### CRITICAL Priority

#### Hindcast Food Security Calibration
**Status:** ✅ VERIFIED - Ready for implementation
**Verification Report:** `research/verification_hindcast_food_security_20251124.md`
**Finding:** Code underestimates 1990 hunger by 50-150%
**Impact:** Blocks Phase 1-3 hindcast validation
**Next Steps:** Apply corrections → Monte Carlo N≥10 → Validate famine frequency

### HIGH Priority

#### Climate Stability Self-Limiting Mechanisms
**Status:** ❌ GRADE D FAILED → ✅ CORRECTED
**Verification Report:** `research/verification_dc1d6ac_20251125.md`
**Finding:** 60% of citations contradict claims (cherry-picking)
**Impact:** Must document 5% floor as implementation choice, not research-backed
**Resolution:** Citations removed/qualified, comments added
```

**Option 2: Inline in simulation spec**
```markdown
# Simulation Specification

## Requirements

### Requirement: Research-Backed Parameters
All simulation parameters SHALL be justified by verified research.

#### Scenario: Verification Queue Check
- WHEN implementing a parameter from research
- THEN it MUST pass verification (Grade B or higher)
- AND failing verifications (Grade D/F) MUST block implementation

## Active Verifications
[Same content as Option 1]
```

**Recommendation:** Use Option 1 (separate spec) - keeps verification concerns modular, easier to track queue status.

### 3.2 Critical Bug Queue

**Current structure:**
- Tracked in roadmaps under CRITICAL priority
- Has session tracking, fix verification
- Links to bug reports and fix commits

**OpenSpec translation:**

**File: `openspec/specs/bugs/critical-queue.md`**
```markdown
# Critical Bug Queue

## Purpose
Track CRITICAL bugs blocking production readiness.

## Requirements

### Requirement: Zero CRITICAL Bugs in Production
The system SHALL have zero CRITICAL bugs before production deployment.

#### Scenario: Bug Discovery
- WHEN a CRITICAL bug is discovered
- THEN it MUST be added to this queue
- AND it MUST block all non-bug work until fixed
- AND fix MUST be validated with Monte Carlo N≥10

## Active Bugs

### None (System in maintenance mode - Dec 6, 2025)

## Recently Resolved

### CRITICAL-1: NaN in Ecology Phase (Oct 2025)
**Discovered:** Session 12
**Root Cause:** Silent `?? 50` fallback masked division by zero
**Fix:** Replaced with `assertFinite()`, added MIN_FLOOR to geometric mean
**Validation:** N=10 Monte Carlo runs, all passing
**Commit:** `abc123`
**Resolution Date:** Oct 28, 2025

### CRITICAL-2: Monthly Mortality >100% (Oct 2025)
**Discovered:** Session 15
**Root Cause:** Mortality accumulation not capped
**Fix:** Added `Math.min(1.0, totalMortality)` cap
**Validation:** N=10 Monte Carlo runs, max mortality 12%
**Commit:** `def456`
**Resolution Date:** Oct 29, 2025
```

### 3.3 Quality Gate Tracking

**Current structure:**
- Research Validation (Quality Gate 1) - Grade A/B/C/D/F
- Architecture Review (Quality Gate 2) - Grade A/B/C/D/F
- Session reports in `research/` and `reviews/`

**OpenSpec translation:**

**File: `openspec/specs/quality-gates/spec.md`**
```markdown
# Quality Gates Specification

## Purpose
Enforce research validation and architecture review for all features.

## Requirements

### Requirement: Quality Gate 1 - Research Validation
All features SHALL pass research validation before implementation.

#### Scenario: Feature Proposal
- WHEN a new feature is proposed
- THEN research validation MUST occur
- AND it MUST achieve Grade B or higher
- AND Grade D/F MUST block implementation

### Requirement: Quality Gate 2 - Architecture Review
All implemented features SHALL pass architecture review before merge.

#### Scenario: Post-Implementation Review
- WHEN a feature is implemented
- THEN architecture review MUST occur
- AND CRITICAL/HIGH issues MUST be addressed
- AND Grade C or lower MUST block merge

## Recent Reviews

### Research Validation - Session 51 (Dec 3, 2025)
**Grade:** A- (68.8% sources from 2024-2025)
**Report:** `research/research_validation_session_51_20251203.md`
**Key Finding:** Climate stability floor contradicted by Wunderling 2024
**Action:** Added HIGH-7 to roadmap

### Architecture Review - Session 51 (Dec 3, 2025)
**Grade:** A- (0 CRITICAL/HIGH blockers)
**Report:** `reviews/architecture_integration_review_session51_20251203.md`
**Status:** 16 consecutive maintenance sessions (34-51)
**Test Coverage:** 82.34% (462+ tests passing)
```

### 3.4 Session Milestone Tracking

**Current structure:**
- Embedded in MASTER roadmap header
- Tracks sessions 1-55, recent work, token usage
- Provides historical continuity

**OpenSpec translation:**

**File: `openspec/sessions.md`** (not a spec, metadata file)
```markdown
# Session History

## Current Session: 56 (Dec 6, 2025)
**Token Budget:** 200k
**Token Usage:** Conservation mode active (target 50% normal usage)
**Status:** Maintenance mode (17 consecutive sessions)

## Recent Sessions

### Session 55 (Dec 5, 2025)
**Work:** Fallback workflows (early exit, maintenance mode sustained)
**Token Usage:** ~10k (minimal - extreme efficiency)
**Status:** Production-ready, all tests passing

### Session 54 (Dec 5, 2025)
**Work:** M-4 COMPLETE - Abrupt Sea Level Rise
**Implementation:** AbruptSeaLevelRisePhase.ts (411 lines + 280 tests)
**Quality Gates:** QG1 CONDITIONAL PASS, QG2 PASSED (Grade B+)
**Token Usage:** ~15k
**Archive:** `plans/completed/m4_abrupt_sea_level_rise_20251205.md`

### Session 51 (Dec 3, 2025)
**Work:** Validation cycle (research + architecture)
**Research Grade:** A- (68.8% recent sources)
**Architecture Grade:** A- (0 CRITICAL/HIGH blockers)
**Token Usage:** ~8k
**New Items:** HIGH-7 added
```

**Alternative:** Keep in `docs/sessions.md` outside OpenSpec structure (metadata, not specs).

---

## 3. Translating Proposed Work

### 3.1 Proposed Files → Change Proposals

**Current structure:**
- `proposed_[feature]_[date].md` - single file with description + tasks

**OpenSpec structure:**
- `openspec/changes/[feature-name]/` - directory with multiple files

**Example translation:**

**Current:** `proposed_biodiversity_test_coverage_20251202.md`

**Becomes:** `openspec/changes/biodiversity-test-coverage/`

```
biodiversity-test-coverage/
├── proposal.md                     # Why we need this
├── tasks.md                        # Implementation checklist
└── specs/
    └── simulation/
        └── spec.md                 # Delta (ADDED requirements)
```

**File: `proposal.md`**
```markdown
# Proposal: Biodiversity Test Coverage

**Created:** December 2, 2025
**Domain:** Simulation
**Priority:** MEDIUM

## Rationale
Current biodiversity modeling (BiosphereHealthPhase, ExtinctionPhase) has insufficient
test coverage. Need comprehensive unit + integration tests to prevent regressions.

## Scope
- Unit tests for extinction rate calculations
- Integration tests for ecosystem collapse cascades
- Monte Carlo validation of biodiversity recovery pathways

## Success Criteria
- Test coverage >80% for biodiversity modules
- All tests passing
- N≥10 Monte Carlo runs show expected extinction patterns
```

**File: `tasks.md`**
```markdown
# Implementation Tasks

- [ ] Write unit tests for extinction rate calculations
- [ ] Write integration tests for ecosystem collapse
- [ ] Add Monte Carlo validation for biodiversity recovery
- [ ] Verify test coverage >80%
- [ ] Run N≥10 Monte Carlo validation
```

**File: `specs/simulation/spec.md` (delta)**
```markdown
# Delta for Simulation Specification

## ADDED Requirements

### Requirement: Biodiversity Test Coverage
The simulation SHALL maintain >80% test coverage for biodiversity modeling.

#### Scenario: Extinction Rate Validation
- WHEN calculating extinction rates
- THEN unit tests MUST verify calculations against research data
- AND integration tests MUST verify cascade propagation

#### Scenario: Recovery Pathway Validation
- WHEN modeling biodiversity recovery
- THEN Monte Carlo tests (N≥10) MUST show expected patterns
- AND recovery timescales MUST match research (decades to millennia)
```

### 3.2 Multiple Domains in One Change

**Some features touch both simulation + frontend.**

**Example:** Nuclear winter visualization

**Current approach:**
- Update simulation code (add nuclear winter phase)
- Update frontend (add visualization dashboard)
- Track in both roadmaps

**OpenSpec approach:**
- Single change folder with deltas for both domains

```
openspec/changes/nuclear-winter-visualization/
├── proposal.md
├── tasks.md
├── design.md
└── specs/
    ├── simulation/
    │   └── spec.md          # Delta: ADDED nuclear winter mechanics
    └── frontend/
        └── spec.md          # Delta: ADDED nuclear winter dashboard
```

**File: `specs/simulation/spec.md`**
```markdown
# Delta for Simulation Specification

## ADDED Requirements

### Requirement: Nuclear Winter Modeling
The simulation SHALL model temperature drops and agricultural collapse from nuclear events.

#### Scenario: Nuclear Detonation Cascade
- WHEN nuclear detonations exceed 50 warheads
- THEN global temperature MUST drop 1-8°C (scaled by warhead count)
- AND agricultural output MUST decrease 10-90% (scaled by temp drop)
- AND famine cascades MUST trigger for populations with <2000 kcal/day
```

**File: `specs/frontend/spec.md`**
```markdown
# Delta for Frontend Specification

## ADDED Requirements

### Requirement: Nuclear Winter Dashboard
The dashboard SHALL visualize nuclear winter effects on climate and agriculture.

#### Scenario: Temperature Delta Visualization
- WHEN nuclear winter is active
- THEN dashboard MUST show temperature delta (°C drop)
- AND agricultural impact (% output reduction)
- AND displaced population estimates
```

---

## 4. Handling Completed Work

### 4.1 Archival Process

**Current:** Move to `plans/completed/[feature]_[date].md`

**OpenSpec:** Merge deltas back into source specs, track in git history

**Workflow:**
1. Feature implemented and tested
2. Merge `openspec/changes/[feature]/specs/[domain]/spec.md` deltas into `openspec/specs/[domain]/spec.md`
3. Delete change folder (history preserved in git)
4. Update project spec's "Recent Completions" section

**Example merge:**

**Before:** `openspec/specs/simulation/spec.md`
```markdown
## Requirements

### Requirement: Planetary Boundaries Modeling
[existing requirement]
```

**Change delta:** `openspec/changes/nuclear-winter/specs/simulation/spec.md`
```markdown
## ADDED Requirements

### Requirement: Nuclear Winter Modeling
[new requirement]
```

**After merge:** `openspec/specs/simulation/spec.md`
```markdown
## Requirements

### Requirement: Planetary Boundaries Modeling
[existing requirement]

### Requirement: Nuclear Winter Modeling
[newly merged requirement]
```

### 4.2 History Tracking

**Current approach:**
- `plans/completed/` directory with 117+ archived plans
- Detailed implementation notes, research findings, validation results
- Preserved indefinitely

**OpenSpec approach:**
- Git history shows when deltas were merged
- Can preserve detailed notes in commit messages
- Can optionally keep `docs/completed/` for rich implementation histories

**Hybrid recommendation:**
- Use OpenSpec for specs/changes
- Keep `docs/implementation-history/` for detailed archives (research notes, validation reports)

---

## 5. Priority System Translation

### 5.1 Priority Levels → Requirement Metadata

**Our system:**
- CRITICAL (blockers, must fix immediately)
- HIGH (important, next sprint)
- MEDIUM (planned, 1-2 months)
- LOW (backlog, 3+ months)

**OpenSpec:**
- Requirements can have custom metadata
- Priority encoded in requirement heading or tags

**Option 1: Inline priority tags**
```markdown
### Requirement: Nuclear Winter Modeling [CRITICAL]
```

**Option 2: Metadata blocks**
```markdown
### Requirement: Nuclear Winter Modeling

**Priority:** CRITICAL
**Domain:** Simulation
**Estimated Effort:** 2-3 sessions
**Dependencies:** Planetary boundaries modeling
```

**Option 3: Separate priority section**
```markdown
## Active Work

### CRITICAL Priority
- Nuclear Winter Modeling
- Game UI State Integration

### HIGH Priority
- Conditional Climate Stability Floor
```

### 5.2 Status Tracking

**Our system:**
- Active/Completed/Deferred markers
- Session milestones
- Token conservation mode flags

**OpenSpec:**
- Changes in `openspec/changes/` = active
- Merged into specs = completed
- Can add status tags to change proposals

**Example:**
```markdown
# Proposal: Biodiversity Test Coverage

**Status:** IN_PROGRESS
**Started:** December 2, 2025
**Updated:** December 6, 2025
**Session:** 55
**Token Budget:** 200k (conservation mode active)
```

---

## 6. Complete Example Translation

### Before (Our System)

**Files:**
- `MASTER_IMPLEMENTATION_ROADMAP.md` (226KB, tracks everything)
- `SIMULATION_ROADMAP.md` (142KB, simulation work)
- `FRONTEND_ROADMAP.md` (37KB, frontend work)
- `proposed_nuclear_winter_visualization_20251206.md` (5KB, proposed work)

**Structure:**
```
plans/
├── MASTER_IMPLEMENTATION_ROADMAP.md
├── SIMULATION_ROADMAP.md
├── FRONTEND_ROADMAP.md
├── proposed_nuclear_winter_visualization_20251206.md
└── completed/
    └── [117+ archived plans]
```

### After (OpenSpec)

**Files:**
- `openspec/specs/project/spec.md` (meta-spec, links to domains)
- `openspec/specs/simulation/spec.md` (simulation requirements)
- `openspec/specs/frontend/spec.md` (frontend requirements)
- `openspec/changes/nuclear-winter-visualization/` (active work)

**Structure:**
```
openspec/
├── specs/
│   ├── project/
│   │   └── spec.md                     # Meta-spec (master roadmap)
│   ├── simulation/
│   │   ├── spec.md                     # Core simulation requirements
│   │   ├── god-mode/
│   │   │   ├── spec.md                 # God mode system
│   │   │   ├── architecture.md         # Technical design
│   │   │   └── decisions.md            # Decision inventory
│   │   └── research-scenarios/
│   │       └── spec.md                 # Phase 3 scenarios
│   ├── frontend/
│   │   ├── spec.md                     # Dashboard requirements
│   │   └── game-design/
│   │       ├── spec.md                 # Game design principles
│   │       └── dashboard-elements.md   # Component specs
│   ├── research/
│   │   ├── spec.md                     # Research standards
│   │   └── verification-queue.md       # Active verifications
│   ├── quality-gates/
│   │   └── spec.md                     # QG1/QG2 requirements
│   └── bugs/
│       └── critical-queue.md           # CRITICAL bug tracking
├── changes/
│   ├── nuclear-winter-visualization/
│   │   ├── proposal.md
│   │   ├── tasks.md
│   │   └── specs/
│   │       ├── simulation/
│   │       │   └── spec.md             # Delta: ADDED nuclear winter
│   │       └── frontend/
│   │           └── spec.md             # Delta: ADDED dashboard
│   ├── biodiversity-test-coverage/
│   │   ├── proposal.md
│   │   ├── tasks.md
│   │   └── specs/
│   │       └── simulation/
│   │           └── spec.md
│   └── [15 proposed features...]
├── project.md                          # Conventions (like CLAUDE.md)
├── sessions.md                         # Session milestones (optional)
└── AGENTS.md                           # AI workflow

docs/
└── implementation-history/             # Rich archives (research notes)
    └── [117+ completed features]
```

---

## 7. Migration Strategy

### 7.1 Phased Migration

**Phase 1: Create OpenSpec structure**
- Create `openspec/specs/` directory
- Convert MASTER → `project/spec.md`
- Convert SIMULATION → `simulation/spec.md`
- Convert FRONTEND → `frontend/spec.md`

**Phase 2: Migrate proposed work**
- Convert `proposed_*.md` → `openspec/changes/[feature]/`
- Extract deltas (ADDED requirements)
- Create proposal.md and tasks.md for each

**Phase 3: Set up workflows**
- Create `project.md` (project conventions)
- Create `AGENTS.md` (AI workflow instructions)
- Update CLAUDE.md to reference OpenSpec

**Phase 4: Dual-track operation**
- Maintain both systems temporarily
- New features use OpenSpec
- Old roadmaps frozen as "legacy reference"

**Phase 5: Full migration**
- Archive old roadmaps to `docs/legacy/`
- All work flows through OpenSpec
- Update all agent prompts

### 7.2 Tooling Needs

**Scripts to create:**
- `scripts/openspec/convert-roadmap.ts` - Convert roadmap → spec
- `scripts/openspec/create-change.ts` - Scaffold new change folder
- `scripts/openspec/merge-delta.ts` - Merge approved change into spec
- `scripts/openspec/validate-spec.ts` - Validate spec format

**CI/CD integration:**
- Pre-commit hook: Validate all specs parse correctly
- PR checks: Ensure deltas reference existing requirements
- Auto-archive: When change merged, move to git history

---

## 8. Benefits of Migration

### 8.1 What We Gain

**Cleaner separation of concerns:**
- Specs = current truth
- Changes = proposed work
- No mixing of completed/active/proposed in one file

**Better change tracking:**
- Each feature is self-contained folder
- Deltas show exactly what changed
- Git history shows when merged

**AI-friendly workflow:**
- Explicit agreements before implementation
- Deterministic outputs from specs
- No vague chat history dependencies

**Cross-domain changes:**
- Single change folder for simulation + frontend updates
- Clear dependencies between domains
- Easier to track multi-system features

### 8.2 What We Lose (and mitigations)

**Rich historical context:**
- **Lost:** 117+ detailed implementation archives
- **Mitigation:** Keep `docs/implementation-history/` for research notes

**Single-file overview:**
- **Lost:** MASTER_IMPLEMENTATION_ROADMAP.md shows everything at once
- **Mitigation:** `openspec/specs/project/spec.md` links to all domains

**Session milestones:**
- **Lost:** Detailed session-by-session progress tracking
- **Mitigation:** Add "Recent Sessions" section to project spec

**Token conservation tracking:**
- **Lost:** Token budget warnings in roadmap header
- **Mitigation:** Add to `project.md` conventions

---

## 9. Recommended Approach

### 9.1 Hybrid System (Recommended)

**Use OpenSpec for:**
- Requirement specifications (what to build)
- Change proposals (deltas, tasks)
- Cross-domain features

**Keep current system for:**
- Rich implementation histories (`docs/implementation-history/`)
- Session milestones and token tracking (`docs/sessions.md`)
- Research validation reports (`research/`)

**Workflow:**
1. Create change proposal in OpenSpec format
2. Implement feature (track in tasks.md)
3. Validate with research + architecture reviews (save reports to `research/` and `reviews/`)
4. Merge delta into spec
5. Archive rich notes to `docs/implementation-history/`

### 9.2 Key Files

```
openspec/
├── specs/                          # Living truth (current requirements)
│   ├── project/spec.md
│   ├── simulation/spec.md
│   └── frontend/spec.md
├── changes/                        # Active work (deltas)
│   └── [feature-name]/
│       ├── proposal.md
│       ├── tasks.md
│       └── specs/
├── project.md                      # Conventions
└── AGENTS.md                       # AI workflow

docs/
├── implementation-history/         # Rich archives (research, validation)
├── sessions.md                     # Session milestones, token tracking
└── legacy/                         # Old roadmaps (frozen reference)
```

---

## 10. Summary: Handling Hierarchies and Special Tracking

### 10.1 Multiple Roadmaps with Sub-Specs

**Your question:** "We have multiple roadmaps with sub-specs on them, right?"

**Answer:** Yes! OpenSpec handles this elegantly through nested folder structures:

```
openspec/specs/
├── project/spec.md              # Hub (like MASTER roadmap)
├── simulation/
│   ├── spec.md                  # Domain roadmap (like SIMULATION roadmap)
│   ├── god-mode/spec.md         # Sub-spec level 1
│   │   ├── architecture.md      # Sub-spec level 2
│   │   └── decisions.md         # Sub-spec level 2
│   └── research-scenarios/
│       └── spec.md
└── frontend/
    ├── spec.md                  # Domain roadmap (like FRONTEND roadmap)
    └── game-design/
        ├── spec.md
        └── dashboard-elements.md
```

**Key points:**
- **Hub pattern preserved:** `project/spec.md` links to domain specs (just like MASTER links to SIMULATION + FRONTEND)
- **Arbitrary nesting:** Sub-specs can be nested as deep as needed
- **Cross-references:** Specs can reference related specs with markdown links
- **Delta propagation:** A single change can update multiple sub-specs across domains

**Example cross-reference:**
```markdown
# God Mode UI (Frontend)
See: [God Mode System](../simulation/god-mode/spec.md) for simulation requirements
```

### 10.2 Critical Bug Queue, Research Verification, etc.

**Your question:** "There's also like the critical bug queue or the research verification and that kind of stuff."

**Answer:** These become their own specs in dedicated domains:

```
openspec/specs/
├── research/
│   ├── spec.md                  # Research standards (how to cite, verify)
│   └── verification-queue.md    # Active verifications (CRITICAL blockers)
├── quality-gates/
│   └── spec.md                  # QG1 (research) + QG2 (architecture)
└── bugs/
    └── critical-queue.md        # CRITICAL bugs blocking production
```

**These specs are special because:**
- **Dynamic content:** They track active work (not static requirements)
- **Queue semantics:** Items move from "Active" → "Resolved"
- **Blocking behavior:** Items in these queues can block other work
- **Cross-references:** Link to detailed reports in `research/` and `reviews/`

**Example: Research Verification Queue**
```markdown
# Research Verification Queue

## Active Verifications

### CRITICAL Priority
#### Hindcast Food Security Calibration
**Status:** ✅ VERIFIED - Ready for implementation
**Verification Report:** `research/verification_hindcast_food_security_20251124.md`
**Finding:** Code underestimates 1990 hunger by 50-150%
**Impact:** Blocks Phase 1-3 hindcast validation
```

**When a change proposal needs research verification:**
1. Add item to `openspec/specs/research/verification-queue.md`
2. Run verification (super-alignment-researcher + research-skeptic)
3. Update queue status: ❌ PENDING → ✅ VERIFIED or ❌ FAILED
4. If VERIFIED, proceed with implementation
5. If FAILED, block implementation until research corrected

**Session tracking:**
- Can live in `openspec/sessions.md` (metadata, not a spec)
- Or in `docs/sessions.md` (outside OpenSpec structure)
- Provides historical continuity across sessions

### 10.3 How Changes Interact with Queues

**Scenario:** Implementing a new feature that requires research validation

**Step 1:** Create change proposal
```
openspec/changes/nuclear-winter/
├── proposal.md
├── tasks.md
└── specs/simulation/spec.md (delta)
```

**Step 2:** Add to research verification queue
```
openspec/specs/research/verification-queue.md

## Active Verifications
### HIGH Priority
#### Nuclear Winter Parameters
**Status:** ❌ PENDING
**Change:** nuclear-winter
**Parameters to verify:**
- Temperature drop (1-8°C for 50+ warheads)
- Agricultural collapse (10-90% reduction)
- Famine threshold (2000 kcal/day)
```

**Step 3:** Run verification (Quality Gate 1)
- Research-skeptic validates sources
- Updates queue: ❌ PENDING → ✅ VERIFIED (Grade B)

**Step 4:** Implement feature
- Feature-implementer uses verified parameters
- Creates tests, validates with Monte Carlo

**Step 5:** Architecture review (Quality Gate 2)
- Architecture-skeptic reviews implementation
- If CRITICAL/HIGH issues, add to `bugs/critical-queue.md`
- If PASSED, proceed to merge

**Step 6:** Merge delta into spec
- Move `changes/nuclear-winter/specs/simulation/spec.md` → `specs/simulation/spec.md`
- Delete change folder
- Archive rich notes to `docs/implementation-history/`

---

## 11. Next Steps

### 11.1 Immediate Actions

1. **Review this guide** - Does this translation make sense?
2. **Decide on approach** - Full migration vs hybrid?
3. **Create pilot** - Convert one feature to OpenSpec format
4. **Test workflow** - Does it work with our multi-agent system?
5. **Iterate** - Refine based on real usage

### 11.2 Questions to Resolve

- **Do we want full OpenSpec migration or hybrid?**
- **How do we preserve rich implementation histories?**
- **How do we handle session milestones and token tracking?**
- **Should we keep legacy roadmaps as frozen reference?**
- **Do we need custom tooling for migration?**

---

## Appendix A: OpenSpec vs Current System

| Feature | Current System | OpenSpec | Winner |
|---------|---------------|----------|--------|
| Requirement specs | Embedded in roadmaps | Separate spec files | OpenSpec |
| Change tracking | `proposed_*.md` | `changes/[feature]/` | OpenSpec |
| Cross-domain | Update 2+ roadmaps | Single change folder | OpenSpec |
| Deltas | Implicit (edit roadmap) | Explicit (ADDED/MODIFIED/REMOVED) | OpenSpec |
| History | `completed/` directory | Git history | Tie |
| Rich archives | Detailed `.md` files | Git commits | Current |
| Single-file overview | MASTER roadmap | Must navigate folders | Current |
| AI integration | CLAUDE.md | AGENTS.md | Tie |
| Priority tracking | CRITICAL/HIGH/MEDIUM/LOW | Requirement metadata | Tie |

---

## Appendix B: Example Spec Files

### B.1 Project Meta-Spec

See Section 2.1 for complete example of `openspec/specs/project/spec.md`

### B.2 Simulation Spec

See Section 2.2 for complete example of `openspec/specs/simulation/spec.md`

### B.3 Frontend Spec

See Section 2.3 for complete example of `openspec/specs/frontend/spec.md`

### B.4 Change Proposal

See Section 3.1 for complete example of a change folder structure

---

**End of guide. Questions?**
