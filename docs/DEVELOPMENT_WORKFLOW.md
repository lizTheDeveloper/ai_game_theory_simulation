# Development Workflow

Detailed workflow guidance for implementing features in the research simulation.

## Table of Contents
- [Multi-Agent Workflow (Default)](#multi-agent-workflow-default)
- [Simple Task Workflow](#simple-task-workflow)
- [Research Standards](#research-standards)
- [Quality Gates](#quality-gates)
- [Phase-Based Implementation](#phase-based-implementation)

## Multi-Agent Workflow (Default)

**Use for non-trivial tasks:** Complex features (3+ phases), research-intensive work, architectural changes, anything requiring quality gates.

### When to Use Multi-Agent

**Use orchestrator agent for:**
- Complex features (3+ phases, multiple systems affected)
- Research-intensive work (requires peer-reviewed sources)
- Architectural changes (affects multiple modules)
- Anything requiring quality gates (research validation, architecture review)

**Use direct implementation only for:**
- Trivial fixes (typos, simple parameter tweaks)
- Single-file edits (no cross-system effects)
- Documentation-only changes

### How to Invoke Orchestrator

```typescript
// Example: Implementing a new feature
Task({
  subagent_type: "orchestrator",
  description: "Implement nuclear winter cascades",
  prompt: `I need to implement nuclear winter cascades from the roadmap.

  Feature requirements:
  - Model temperature drops from nuclear detonations
  - Agricultural collapse from reduced sunlight
  - Famine cascades with regional variation

  Please coordinate the full workflow: research → validation → implementation → review → documentation.`
})
```

### Workflow Phases

The orchestrator manages:

#### 1. Research & Validation (Quality Gate 1)
- **super-alignment-researcher** finds peer-reviewed sources (2024-2025)
- **research-skeptic** validates findings (MANDATORY)
- **Gate:** Must pass critique before implementation
- Checks for contradictory evidence, methodological flaws, overconfidence

#### 2. Implementation & Testing
- **feature-implementer** writes code in phases
- Runs Monte Carlo validation after each phase (N≥10)
- Posts progress to chatroom channels
- **unit-test-writer** / **integration-test-writer** add tests

#### 3. Architecture Review (Quality Gate 2)
- **architecture-skeptic** reviews system impact (MANDATORY)
- **Gate:** Must address CRITICAL/HIGH severity issues
- Checks for performance issues, state propagation problems, complexity

#### 4. Documentation & Archival
- **wiki-documentation-updater** syncs wiki
- **project-plan-manager** archives completed plans
- Updates `MASTER_IMPLEMENTATION_ROADMAP.md`

### End-of-Session Cleanup

**CRITICAL: Always run project-plan-manager at the end of work sessions:**

```typescript
Task({
  subagent_type: "project-plan-manager",
  description: "Clean up roadmap and archive completed plans",
  prompt: "Review MASTER_IMPLEMENTATION_ROADMAP.md and archive all completed work to /plans/completed/. Update Progress Summary and identify next priorities."
})
```

**Benefits:**
- Maintains research standards (all mechanics backed by peer review)
- Catches performance issues before they compound
- Parallel work via git worktrees + chatroom coordination
- Quality gates prevent low-quality implementations
- Roadmap stays clean and focused on active work

## Simple Task Workflow

For trivial fixes (typos, simple parameter tweaks, single-file edits):

### 1. Research Phase (if needed)
- Find 2+ peer-reviewed sources (2024-2025 preferred)
- Save to `research/[topic]_YYYYMMDD.md`
- Extract key parameters and mechanisms

### 2. Design Phase (if needed)
- Create plan in `plans/[feature]-plan.md` with citations
- Define state additions, system modules, phases
- Map interactions with existing systems

### 3. Implementation Phase
- **Add state** to `src/types/game.ts`
- **Create system module** in `src/simulation/`
- **Create phase** in `src/simulation/engine/phases/`
- **Register phase** in `PhaseOrchestrator`
- **Add logging** with semantic emojis

### 4. Validation Phase
- Run Monte Carlo (N=10 minimum): `npx tsx scripts/monteCarloSimulation.ts`
- Check outcome distributions, trajectories, crisis frequencies
- Verify breakthrough technology impact

### 5. Documentation Phase
- Update `docs/wiki/README.md`
- Add devlog entry to `devlogs/`
- Move plan to `plans/completed/` when done
- Update `plans/MASTER_IMPLEMENTATION_ROADMAP.md`

## Research Standards

Every mechanic must have:

### 1. Research Citations
- **2+ peer-reviewed sources** (2024-2025 preferred)
- Academic journals, conference papers, technical reports
- Save PDFs to `research/` with summary markdown files

### 2. Parameter Justification
- **Why this number?** (backed by data, not "feels right")
- Show calculation from research findings
- Document uncertainty ranges

### 3. Mechanism Description
- **How it works** (not just effects)
- Causal pathways between inputs and outputs
- Feedback loops and interactions

### 4. Interaction Map
- **What affects this system?** (inputs)
- **What does this affect?** (outputs)
- Cross-system cascades and dependencies

### 5. Expected Timeline
- **When does it matter?** (early/mid/late game)
- Month ranges for typical activation
- Threshold conditions

### 6. Failure Modes
- **What can go wrong?**
- Edge cases and invalid states
- How to detect and handle failures

### 7. Test Validation
- **Monte Carlo evidence it works**
- Distribution of outcomes
- Sensitivity to parameters

**Never tune for "fun" - only research-backed values.**

## Quality Gates

Two mandatory gates in the multi-agent workflow:

### Quality Gate 1: Research Validation

**research-skeptic** reviews all research findings before implementation.

**Checks:**
- Contradictory evidence in literature
- Methodological flaws in cited studies
- Overconfidence in uncertain parameters
- Missing alternative explanations
- Publication bias or selective citation

**Outcome:**
- **PASS:** Implementation proceeds with validated parameters
- **FAIL:** Must address issues or find better sources

### Quality Gate 2: Architecture Review

**architecture-skeptic** reviews all implementations after completion.

**Checks:**
- Performance bottlenecks (O(n²) operations, deep cloning)
- State propagation issues (circular dependencies, missing updates)
- Complexity creep (monolithic functions, unclear boundaries)
- Error handling gaps (NaN/undefined propagation)
- System stability risks

**Severity Levels:**
- **CRITICAL:** Must fix immediately (crashes, data corruption)
- **HIGH:** Must fix before merge (performance degradation, bugs)
- **MEDIUM:** Should fix soon (technical debt, maintainability)
- **LOW:** Nice to have (code style, optimization opportunities)

**Outcome:**
- **PASS:** Feature complete, ready to merge
- **CRITICAL/HIGH issues:** Must address before proceeding

## Phase-Based Implementation

The simulation uses a **phase-based architecture** (~37 phases per step).

### Phase Structure

```typescript
interface SimulationPhase {
  id: string;
  name: string;
  order: number;  // Execution order (0-36)
  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult;
}
```

### Phase Categories (in order)

1. **Time & Initialization (0-1):** Time advancement, compute growth
2. **Agent Actions (2-8):** AI agents, government, society, organizations make decisions
3. **Systems Updates (9-25):** Environmental, social, technological, geopolitical systems evolve
4. **Crisis Detection (26-30):** Detect crises, extinction triggers, tipping points
5. **Outcomes & Metrics (31-36):** Update QoL, outcome probabilities, dystopia progression

### Creating a New Phase

1. **Create phase file:** `src/simulation/engine/phases/MyNewPhase.ts`
2. **Implement interface:**
   ```typescript
   import type { SimulationPhase } from '../PhaseOrchestrator';

   export const MyNewPhase: SimulationPhase = {
     id: 'my-new-phase',
     name: 'My New Phase',
     order: 15, // Choose appropriate position
     execute(state, rng, context) {
       // Phase logic here

       return {
         success: true,
         stateChanged: true,
         message: 'Phase completed successfully'
       };
     }
   };
   ```
3. **Register in orchestrator:** Add to `PHASES` array in `PhaseOrchestrator.ts`
4. **Add logging:** Use semantic emojis for consistency
5. **Test in isolation:** Unit test the phase execute function
6. **Validate with Monte Carlo:** Run N≥10 simulations

### Phase Best Practices

- **Single responsibility:** Each phase does one thing well
- **Deterministic:** Given same RNG seed, produces same results
- **Documented:** Clear comments on inputs, outputs, side effects
- **Testable:** Can run in isolation with mock state
- **Performant:** Avoid O(n²) operations, minimize deep cloning

## Multi-Paradigm DUI Integration

When implementing features that affect quality of life or societal outcomes:

### Four Paradigm Perspectives

1. **Western Liberal:** Democracy, civil liberties, rule of law, economic freedom
2. **Development:** QoL, survival tier, life expectancy
3. **Ecological:** Planetary boundaries, climate, resources, pollution
4. **Indigenous:** Social trust, community bonds, meaning

### Key Principles

- **Preserve value conflicts:** Don't force consensus across paradigms
- **Detect divergence:** Singapore pattern (Development utopia + Western hybrid)
- **Track all four:** Norway pattern (Western/Development utopias + Ecological dystopia)
- **Update independently:** Each paradigm has its own scoring logic

### Implementation Pattern

```typescript
// Update all four paradigm perspectives
state.multiParadigmDUI.westernLiberal = calculateWesternLiberalScore(state);
state.multiParadigmDUI.development = calculateDevelopmentScore(state);
state.multiParadigmDUI.ecological = calculateEcologicalScore(state);
state.multiParadigmDUI.indigenous = calculateIndigenousScore(state);

// Detect divergence
const paradigmDivergence = calculateParadigmDivergence(state.multiParadigmDUI);
if (paradigmDivergence > 30) {
  console.log('⚠️ High paradigm divergence detected');
}
```

## Multi-Agent Coordination

### Chatroom Communication

Agents coordinate via `.claude/chatroom/` - see `.claude/chatroom/README.md` for complete documentation.

**8 Permanent Channels:**
- `coordination.md` - General workflow coordination
- `research.md` - Research findings & validation
- `implementation.md` - Code implementation updates
- `architecture.md` - Architecture reviews & decisions
- `testing.md` - Test strategy & results
- `documentation.md` - Wiki & devlog updates
- `planning.md` - Roadmap & plan management
- `vision.md` - Long-term strategy & philosophical debates

### Message Format

```markdown
---
**agent-name** | YYYY-MM-DD HH:MM | [STATUS]

Your message content here

**Next Steps:** What you're doing next
**Blocking:** Any blockers or dependencies
---
```

**Status Tags:** `[STARTED]`, `[IN-PROGRESS]`, `[COMPLETED]`, `[BLOCKED]`, `[QUESTION]`, `[ALERT]`, `[HANDOFF]`

### Parallel Work with Worktrees

For parallel agent work, use git worktrees to avoid file conflicts:

```bash
# Create worktree for parallel feature work
git worktree add ../superalignment-feature-x feature-x

# Agent works in isolation
cd ../superalignment-feature-x
# ... implement feature ...

# Merge back when done
cd ../superalignmenttoutopia
git merge feature-x
git worktree remove ../superalignment-feature-x
```

## Available Specialized Agents

All agents are in `.claude/agents/`:

### Workflow Coordination
- **orchestrator** - Workflow coordinator, use by default for complex work

### Research & Validation
- **super-alignment-researcher** - Find peer-reviewed research (2024-2025)
- **research-skeptic** - MANDATORY validation of research foundations
- **sci-fi-tech-visionary** - Speculative future tech scenarios

### Implementation
- **feature-implementer** - Pure implementation specialist (spawned by orchestrator)
- **unit-test-writer** / **integration-test-writer** - Test creation
- **nextjs-component-writer** - Frontend component creation

### Quality Assurance
- **architecture-skeptic** - MANDATORY review for performance/stability issues

### Documentation & Planning
- **wiki-documentation-updater** - Sync wiki with code changes
- **project-plan-manager** - Roadmap & plan archival

### UI/UX
- **far-future-ux-designer** - Dashboard design and data visualization
- **llm-interface-optimizer** - Agent interface design (prompt optimization)

## Additional Resources

- **Commands:** `docs/COMMANDS.md` - Complete command reference
- **Wiki:** `docs/wiki/README.md` - System documentation (3,000+ lines)
- **Roadmap:** `plans/MASTER_IMPLEMENTATION_ROADMAP.md` - Active priorities (~72-75 hours)
- **Chatroom:** `.claude/chatroom/README.md` - Multi-agent coordination (550+ lines)
- **Agents:** `.claude/agents/` - Specialized agent definitions
- **Emoji Reference:** `docs/EMOJI_QUICK_REFERENCE.md` - One-page cheat sheet
