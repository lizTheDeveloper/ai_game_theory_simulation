# Project Conventions
## Superalignment→Utopia Simulation

**Created:** December 6, 2025
**Purpose:** Define project-wide conventions for using OpenSpec

---

## Project Overview

Research simulation engine modeling pathways from AI super-alignment to sustainable human flourishing.

**Philosophy:** Research-backed realism over balance tuning. Every mechanic grounded in peer-reviewed research (2024-2025 preferred).

**Architecture:** Pure TypeScript simulation engine (~37 phases) + Next.js dashboard for visualization.

---

## File Organization

```
openspec/
├── specs/                          # Living truth (current specifications)
│   ├── project/spec.md             # Meta-spec (master roadmap)
│   ├── simulation/spec.md          # Simulation engine requirements
│   ├── frontend/spec.md            # Dashboard requirements
│   ├── research/
│   │   ├── spec.md                 # Research standards
│   │   └── verification-queue.md   # Active verifications
│   ├── quality-gates/spec.md       # QG1/QG2 requirements
│   └── bugs/critical-queue.md      # CRITICAL bug tracking
├── changes/                        # Proposed work (feature branches)
│   └── [feature-name]/
│       ├── proposal.md             # Why/what
│       ├── tasks.md                # Implementation checklist
│       ├── design.md               # Technical decisions (optional)
│       └── specs/
│           ├── simulation/spec.md  # Delta for simulation
│           └── frontend/spec.md    # Delta for frontend
├── project.md                      # This file (conventions)
└── AGENTS.md                       # AI workflow instructions

docs/
├── implementation-history/         # Rich archives (research notes)
│   └── [feature]_[date].md
└── sessions.md                     # Session milestones, token tracking

plans/
├── MASTER_IMPLEMENTATION_ROADMAP.md  # LEGACY (frozen reference)
├── SIMULATION_ROADMAP.md             # LEGACY (frozen reference)
└── FRONTEND_ROADMAP.md               # LEGACY (frozen reference)
```

---

## Delta Format

Changes use structured sections:

```markdown
# Delta for [Domain] Specification

## ADDED Requirements

### Requirement: [New Capability]
[Complete requirement text with scenarios]

#### Scenario: [Use Case]
- WHEN [condition]
- THEN [outcome]
- AND [additional constraint]

## MODIFIED Requirements

### Requirement: [Changed Capability]
[Full updated text, not just differences]

## REMOVED Requirements

### Requirement: [Deprecated Capability]
[Why it was removed]
```

---

## Priority System

**Four-tier priority system:**
- **CRITICAL:** Blockers, must fix immediately (block all other work)
- **HIGH:** Important, next sprint (1-2 weeks)
- **MEDIUM:** Planned, 1-2 months
- **LOW:** Backlog, 3+ months

**Token Conservation Mode:**
- When active, only CRITICAL/HIGH work proceeds
- MEDIUM/LOW deferred until token budget restored
- Extreme efficiency: grep first, skip docs, exit early

---

## Requirement Language

**Mandatory language:**
- **SHALL / MUST:** Absolute requirement (non-negotiable)
- **SHOULD:** Strong recommendation (can be negotiated)
- **MAY:** Optional (implementation choice)

**Scenario structure:**
- **WHEN:** Triggering condition
- **THEN:** Expected outcome
- **AND:** Additional constraints (chained)

---

## Quality Gates

**Quality Gate 1: Research Validation**
- Super-alignment-researcher + research-skeptic review
- Must achieve Grade B or higher
- Grade D/F blocks implementation

**Quality Gate 2: Architecture Review**
- Architecture-skeptic post-implementation review
- CRITICAL/HIGH issues MUST be addressed before merge
- Grade C or lower blocks merge

**Monte Carlo Validation:**
- All features MUST be validated with N≥10 runs
- Coefficient of variation MUST be < 0.01% (determinism check)
- Outcome distributions MUST be checked for realism

---

## Workflow

### Creating a Change Proposal

1. Create change folder: `openspec/changes/[feature-name]/`
2. Write `proposal.md`:
   - Rationale (why)
   - Scope (what)
   - Success criteria
3. Write `tasks.md`:
   - Implementation checklist
   - Phased approach
4. Write deltas in `specs/[domain]/spec.md`:
   - ADDED/MODIFIED/REMOVED sections
   - Complete requirements with scenarios
5. (Optional) Write `design.md` for technical decisions

### Implementing a Change

1. Research validation (Quality Gate 1)
   - If Grade D/F, block and find new research
2. Implementation via specialized agents
3. Architecture review (Quality Gate 2)
   - Address CRITICAL/HIGH issues before merge
4. Monte Carlo validation (N≥10)
5. Merge delta into source spec
6. Archive rich notes to `docs/implementation-history/`
7. Delete change folder (preserved in git history)

### Updating Verification Queue

1. Add item to `openspec/specs/research/verification-queue.md`
2. Include: sources, key claims, affected files
3. Invoke super-alignment-researcher + research-skeptic
4. Update queue status after verification

---

## Agent Routing

**Complex features:** Route to `orchestrator` agent (coordinates full workflow)

**Simulation code:** Route to `simulation-maintainer` agent

**Frontend/dashboard:** Route to `far-future-ux-designer` agent

**Research:** Route to `super-alignment-researcher` + `research-skeptic` agents

**Monte Carlo:** Route to `priya` agent

**End of session:** Route to `architect` agent (roadmap cleanup)

See: `openspec/AGENTS.md` for complete agent workflow instructions

---

## Research Standards

**Minimum requirements:**
- 2+ peer-reviewed sources per mechanic
- 2024-2025 sources preferred (recency)
- arXiv preprints allowed if peer-reviewed alternatives unavailable

**Citation verification:**
- Layer 1: Paper existence (DOI, journal, authors)
- Layer 2: Claim accuracy (does paper support parameter?)
- Grading: A (full support) / B (partial) / C (weak) / D (contradicts) / F (fabricated)

**Blocking behavior:**
- Grade D/F blocks implementation
- Must adjust parameters or find new research

---

## Code Conventions

**Deterministic RNG:**
- NEVER use `Math.random()` directly
- Always use RNG function parameter
- RNG MUST be required (not optional with fallback)

**Defensive Programming:**
- Use assertion utilities (no silent fallbacks)
- Fail loudly on NaN/Infinity/undefined
- Silent fallbacks (`?? defaultValue`, `|| 0`) ONLY for initialization/UI

**Emoji Conventions:**
- ONE canonical emoji per concept
- All emojis MUST be registered in `docs/EMOJI_EVENT_MAP.txt`
- ✅ Success / ❌ Error (all errors) / ⚠️ Warning / 🚨 Critical alert

**Logging:**
- Save logs to `/logs/` (NEVER `/tmp/`, which gets cleared)
- Use structured format with emoji prefixes
- Include phase names and relevant context

---

## Git Workflow

**Commits:**
- Only create commits when user explicitly asks
- Never skip hooks (--no-verify, etc.) unless requested
- Never force push to main/master
- Check authorship before `git commit --amend`

**Pull Requests:**
- Run coverage report on every PR
- Post coverage delta as comment
- Fail CI if coverage drops >1%
- Architecture review required for non-trivial changes

---

## Session Management

**Session tracking:** See `docs/sessions.md`

**End of session:**
- ALWAYS invoke `architect` agent for roadmap cleanup
- Archive completed work to `docs/implementation-history/`
- Update session milestones
- Commit changes with descriptive message

---

## Historical Context

**Legacy roadmaps:**
- `plans/MASTER_IMPLEMENTATION_ROADMAP.md` - Frozen reference (226KB)
- `plans/SIMULATION_ROADMAP.md` - Frozen reference (142KB)
- `plans/FRONTEND_ROADMAP.md` - Frozen reference (37KB)
- `plans/completed/` - 117+ archived implementation histories

**Migration date:** December 6, 2025

**Why OpenSpec:**
- Cleaner separation (current truth vs proposed work)
- Better deltas (explicit ADDED/MODIFIED/REMOVED)
- Cross-domain changes (single change folder)
- AI-friendly (explicit agreements before implementation)

---

## Contributing

**New contributors:**
1. Read `CLAUDE.md` (agent routing, project philosophy)
2. Review `openspec/specs/project/spec.md` (requirements)
3. Check active work in `openspec/changes/`
4. Check verification queue: `openspec/specs/research/verification-queue.md`
5. Create change proposal for new work

**Updating specs:**
1. Propose changes via `openspec/changes/[feature]/`
2. Get approval (Quality Gate 1 + 2)
3. Merge delta into source spec
4. Delete change folder

**Research validation:**
1. Always cite 2+ peer-reviewed sources
2. Verify citations (two-layer: existence + accuracy)
3. Block on Grade D/F
4. Save research to `research/[topic]_YYYYMMDD.md`
