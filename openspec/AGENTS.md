# AI Agent Workflow
## Multi-Agent Spec-Driven Development

**Created:** December 6, 2025
**Purpose:** Define how AI agents interact with OpenSpec system

---

## Overview

This project uses **specialized agents** with deep domain knowledge to implement features through a spec-driven workflow. All work flows through OpenSpec change proposals → implementation → validation → merge.

**Core principle:** Explicit agreements (specs) before implementation.

---

## Agent Routing

### When to Use Which Agent

| Task Type | Agent | Why |
|-----------|-------|-----|
| Complex multi-step features | `orchestrator` | Coordinates full workflow (research → validation → implementation → review) |
| Simulation code changes | `simulation-maintainer` | Deep domain knowledge of phase-based architecture, defensive coding, emoji conventions |
| Frontend/dashboard work | `far-future-ux-designer` | Far-future aesthetics, data visualization, React patterns |
| Need research sources | `super-alignment-researcher` | Academic literature search, parameter extraction |
| Validate research | `research-skeptic` | Find contradictory evidence, methodological critique |
| Monte Carlo validation | `priya` | Statistical analysis, CV validation, determinism debugging |
| Post-implementation review | `architecture-skeptic` | Performance bottlenecks, state propagation, complexity creep |
| End of session | `architect` | Roadmap cleanup, plan archival, progress tracking |

---

## Standard Workflow

### Phase 1: Create Change Proposal

**Who:** User or main AI context
**Where:** `openspec/changes/[feature-name]/`

**Steps:**
1. Create change folder structure
2. Write `proposal.md` (rationale, scope, success criteria)
3. Write `tasks.md` (implementation checklist)
4. Write deltas in `specs/[domain]/spec.md` (ADDED/MODIFIED/REMOVED)
5. (Optional) Write `design.md` (technical decisions)

**Example:**
```bash
openspec/changes/nuclear-winter-visualization/
├── proposal.md
├── tasks.md
└── specs/
    ├── simulation/spec.md
    └── frontend/spec.md
```

---

### Phase 2: Research Validation (Quality Gate 1)

**Agents:** `super-alignment-researcher` + `research-skeptic`
**When:** Before implementation begins

**Steps:**
1. Add item to `openspec/specs/research/verification-queue.md`
2. Invoke `super-alignment-researcher` (find papers, extract parameters)
3. Invoke `research-skeptic` (validate claims, find contradictions)
4. Wait for verification report
5. Grade: A/B/C/D/F
6. If D/F: BLOCK implementation, adjust parameters, find new research
7. If A/B/C: Proceed to implementation

**Output:** Verification report in `research/verification_[commit]_[date].md`

---

### Phase 3: Implementation

**Agent:** Depends on domain
- Simulation: `simulation-maintainer`
- Frontend: `far-future-ux-designer` or `nextjs-component-writer`
- Testing: `unit-test-writer` or `integration-test-writer`

**Steps:**
1. Agent reads change proposal
2. Agent implements feature following spec
3. Agent writes tests
4. Agent validates with Monte Carlo (if simulation)
5. Agent updates tasks.md (mark completed)

**Output:** Working implementation, passing tests

---

### Phase 4: Architecture Review (Quality Gate 2)

**Agent:** `architecture-skeptic`
**When:** After implementation completes

**Steps:**
1. Invoke `architecture-skeptic` with implementation details
2. Wait for review report
3. Grade: A/B/C/D/F with CRITICAL/HIGH/MEDIUM/LOW issues
4. Address CRITICAL/HIGH issues before merge
5. If Grade C or lower: BLOCK merge until fixed

**Output:** Review report in `reviews/architecture_[feature]_[date].md`

---

### Phase 5: Monte Carlo Validation

**Agent:** `priya`
**When:** After implementation (simulation features only)

**Steps:**
1. Invoke `priya` with feature details
2. Run N≥10 Monte Carlo simulations
3. Validate determinism (CV < 0.01%)
4. Check outcome distributions for realism
5. Identify anomalies or regressions

**Output:** Monte Carlo validation report

---

### Phase 6: Merge Delta

**Who:** `architect` or main AI context
**When:** After all quality gates pass

**Steps:**
1. Merge `openspec/changes/[feature]/specs/[domain]/spec.md` into `openspec/specs/[domain]/spec.md`
2. Delete change folder (preserved in git history)
3. Archive rich implementation notes to `docs/implementation-history/[feature]_[date].md`
4. Update `docs/sessions.md` with milestone

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

---

## Agent-Specific Instructions

### orchestrator

**When to use:** Complex features requiring full workflow coordination

**How to invoke:**
```typescript
Task({
  subagent_type: "orchestrator",
  description: "Implement nuclear winter cascades",
  prompt: "Feature from roadmap: model temperature drops, agricultural collapse, famine cascades. Coordinate full workflow: research → validation → implementation → review → documentation."
})
```

**What it does:**
- Spawns super-alignment-researcher for research
- Spawns research-skeptic for validation
- Spawns feature-implementer for implementation
- Spawns architecture-skeptic for review
- Spawns wiki-documentation-updater for docs
- Ensures all quality gates pass

---

### simulation-maintainer

**When to use:** Any simulation code changes (src/simulation/, phases, src/types/game.ts)

**How to invoke:**
```typescript
Task({
  subagent_type: "simulation-maintainer",
  description: "Fix NaN bug in ecology phase",
  prompt: "The ecology phase is producing NaN for ecologicalScore at line 145. Investigate root cause and fix using proper assertion utilities (no silent fallbacks)."
})
```

**What it knows:**
- Phase-based architecture (~37 phases)
- Assertion utilities (assertFinite, assertProbability, assertStateProperty)
- Defensive coding (no silent fallbacks)
- Pictographic event language (emoji conventions)
- Deterministic RNG (never Math.random())
- Monte Carlo validation requirements

---

### far-future-ux-designer

**When to use:** Frontend/dashboard work, data visualization

**How to invoke:**
```typescript
Task({
  subagent_type: "far-future-ux-designer",
  description: "Add nuclear winter visualization to dashboard",
  prompt: "Create dashboard widget showing temperature delta and agricultural impact from nuclear winter events. Use far-future aesthetics (high-contrast, glowing accents)."
})
```

**What it knows:**
- Elysium-inspired far-future aesthetic
- High-contrast black/white/glowing design
- Data visualization patterns
- React/Next.js patterns
- Delta propagation (not full state dumps)
- Web Worker integration

---

### super-alignment-researcher

**When to use:** Need peer-reviewed sources, parameter justification

**How to invoke:**
```typescript
Task({
  subagent_type: "super-alignment-researcher",
  description: "Find research for nuclear winter parameters",
  prompt: "Find peer-reviewed sources (2024-2025 preferred) for nuclear winter modeling: temperature drop (1-8°C for 50+ warheads), agricultural collapse (10-90% reduction), famine threshold (2000 kcal/day). Extract specific parameter values."
})
```

**What it does:**
- Searches Google Scholar, Semantic Scholar, PubMed
- Prefers 2024-2025 sources
- Extracts specific parameter values
- Documents mechanisms and interactions
- Saves to `research/[topic]_YYYYMMDD.md`

---

### research-skeptic

**When to use:** Validate research findings before implementation

**How to invoke:**
```typescript
Task({
  subagent_type: "research-skeptic",
  description: "Validate nuclear winter citations",
  prompt: "Verify citations in commit abc123. Check layer 1 (paper exists) and layer 2 (claims accurate). Find contradictory evidence. Grade A/B/C/D/F."
})
```

**What it does:**
- Layer 1: Verify paper existence (DOI, journal, authors)
- Layer 2: Verify claim accuracy (does paper support parameter?)
- Find contradictory evidence
- Detect cherry-picking
- Grade: A (full support) / B (partial) / C (weak) / D (contradicts) / F (fabricated)
- Save to `research/verification_[commit]_[date].md`

---

### priya

**When to use:** Monte Carlo validation, statistical analysis, determinism debugging

**How to invoke:**
```typescript
Task({
  subagent_type: "priya",
  description: "Validate nuclear winter implementation",
  prompt: "Run N≥10 Monte Carlo simulations with nuclear winter enabled. Validate determinism (CV < 0.01%). Check temperature delta distribution. Identify anomalies."
})
```

**What it does:**
- Runs N≥10 (often N=50-100) Monte Carlo simulations
- Validates determinism (coefficient of variation < 0.01%)
- Checks outcome distributions for realism
- Identifies statistical anomalies
- Measures effectiveness: (initial - final) / initial
- Debugs non-determinism (traces RNG usage)

---

### architecture-skeptic

**When to use:** After implementation, before merge

**How to invoke:**
```typescript
Task({
  subagent_type: "architecture-skeptic",
  description: "Review nuclear winter implementation",
  prompt: "Review NuclearWinterPhase.ts implementation. Check for: performance bottlenecks (O(n²), deep cloning), state propagation issues, complexity creep. Grade with CRITICAL/HIGH issues."
})
```

**What it looks for:**
- Performance bottlenecks (O(n²) loops, deep cloning)
- State propagation issues
- Complexity creep
- Missing assertions
- Circular dependencies
- Grades: A/B/C/D/F with issue severity (CRITICAL/HIGH/MEDIUM/LOW)
- Saves to `reviews/architecture_[feature]_[date].md`

---

### architect

**When to use:** End of work sessions (ALWAYS)

**How to invoke:**
```typescript
Task({
  subagent_type: "architect",
  description: "Clean up roadmap",
  prompt: "Archive completed work from today's session. Move finished features from openspec/changes/ to docs/implementation-history/. Update session milestones in docs/sessions.md. Update progress summary."
})
```

**What it does:**
- Archives completed work to `docs/implementation-history/`
- Updates session milestones in `docs/sessions.md`
- Cleans up merged change folders
- Updates progress summary
- Maintains historical continuity

---

## Example Workflows

### Simple Feature (Simulation)

1. **User:** "Add nuclear winter mechanic"
2. **Main context:** Creates change proposal in `openspec/changes/nuclear-winter/`
3. **Main context:** Adds to research verification queue
4. **Main context:** Invokes `super-alignment-researcher` (find papers)
5. **Main context:** Invokes `research-skeptic` (validate)
6. **If verified:** Invokes `simulation-maintainer` (implement)
7. **After implementation:** Invokes `architecture-skeptic` (review)
8. **After review:** Invokes `priya` (Monte Carlo N≥10)
9. **After validation:** Merges delta into `openspec/specs/simulation/spec.md`
10. **Archives notes** to `docs/implementation-history/nuclear_winter_20251206.md`
11. **Deletes** `openspec/changes/nuclear-winter/`

---

### Complex Feature (Cross-Domain)

1. **User:** "Add nuclear winter with dashboard visualization"
2. **Main context:** Invokes `orchestrator` (coordinates everything)
3. **Orchestrator:** Spawns `super-alignment-researcher` (research)
4. **Orchestrator:** Spawns `research-skeptic` (validation)
5. **Orchestrator:** Spawns `simulation-maintainer` (simulation code)
6. **Orchestrator:** Spawns `far-future-ux-designer` (dashboard)
7. **Orchestrator:** Spawns `architecture-skeptic` (review)
8. **Orchestrator:** Spawns `priya` (Monte Carlo)
9. **Orchestrator:** Merges deltas into both simulation + frontend specs
10. **Orchestrator:** Archives to `docs/implementation-history/`

---

### Bug Fix

1. **User:** "Fix NaN in ecology phase"
2. **Main context:** Adds to `openspec/specs/bugs/critical-queue.md`
3. **Main context:** Invokes `simulation-maintainer` (fix with assertions)
4. **After fix:** Invokes `priya` (validate no regression, N≥10)
5. **After validation:** Updates bug queue (move to "Recently Resolved")
6. **Commits** fix with descriptive message

---

## Quality Gate Matrix

| Gate | Agent(s) | Grade | Blocking | Output |
|------|----------|-------|----------|--------|
| QG1: Research | super-alignment-researcher + research-skeptic | A/B/C/D/F | D/F blocks | `research/verification_*.md` |
| QG2: Architecture | architecture-skeptic | A/B/C/D/F | C/D/F blocks | `reviews/architecture_*.md` |
| Monte Carlo | priya | PASS/FAIL | FAIL blocks | Statistical validation report |

---

## Agent Memory System

Agents have **persistent memory** across sessions. Memory organized in three layers:

**Recent memory (working):**
- Tasks completed this session
- Learnings from recent work
- Conversation summaries

**Long-term memory (accumulated):**
- Major insights (preserved permanently)
- Project milestones
- Patterns learned over time

**Core memory (personality-defining):**
- Formative moments that changed approach
- Critical lessons learned from failures
- Working relationship dynamics

**Agent IDs:** sylvia (Research Skeptic), roy (Simulation Maintainer), cynthia (Super-Alignment Researcher), moss (Feature Implementer), tessa (UX Designer), historian (Wiki Updater), architect (Roadmap Manager), ray (Sci-Fi Visionary), priya (Quantitative Validator)

**Memory tools:**
- `mcp__agent-memory__recall_context({agent_id})` - Load context on spawn
- `mcp__agent-memory__add_recent_task({agent_id, task})` - Save task
- `mcp__agent-memory__add_recent_learning({agent_id, learning})` - Save insight
- `mcp__agent-memory__add_core_memory({agent_id, key, value})` - Save formative moment (RARE)

---

## Contributing

**New AI assistants:**
1. Read this file first
2. Understand agent routing table
3. Always create change proposals before implementing
4. Invoke appropriate specialists (don't do everything yourself)
5. Ensure quality gates pass
6. Archive rich notes for historical context

**Updating workflow:**
1. Propose changes via `openspec/changes/[improvement]/`
2. Get approval from project maintainer
3. Update this file
4. Update `openspec/project.md` if conventions change
