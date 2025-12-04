# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 TOKEN CONSERVATION MODE - DISABLED (Dec 4, 2025)

**PREVIOUSLY ACTIVE - NOW DISABLED PER PM REQUEST**

~~CRITICAL: Project in extreme token conservation mode. Goal: Finish roadmap with HALF normal tokens.~~

**Normal operation restored. Agents should:**
1. **Work thoroughly** - Complete full features, not just critical work
2. **Document properly** - Create comprehensive documentation
3. **Explore as needed** - Understand context before implementing
4. **Quality over speed** - Proper implementation, not rushed patches

**Autonomous workers:** Running hourly. Full productivity mode.

## ⚡ Token Efficiency - READ THIS FIRST

**CRITICAL: Be extremely token-efficient in all operations.**

**Core Principles:**
1. **Be concise** - No verbose explanations, get straight to implementation
2. **Avoid redundancy** - Don't repeat what's in documentation
3. **Use tools efficiently** - Read only what you need, grep before reading entire files
4. **Skip unnecessary analysis** - If the task is clear, just do it
5. **Batch operations** - Combine related changes in single tool calls
6. **Trust existing docs** - Don't re-explain what's in CLAUDE.md or wiki

**When near token limits:**
- Focus only on critical/high priority work
- Skip optional documentation updates
- Use grep/glob aggressively before reading files
- Commit partial work frequently
- Exit early if work is complete

**Token exhaustion alert:** The autonomous worker will create a GitHub issue when tokens run out. Have backup account ready.

## ⚠️ CRITICAL: ALWAYS Use Agents

**This codebase is too complex for direct changes. ALL code changes must go through specialized agents.**

**NEVER make changes directly. ALWAYS invoke an agent first.**

Even if a change seems trivial, you don't have enough context. The specialized agents have deep domain knowledge about defensive coding patterns, emoji conventions, state propagation, and dozens of other critical details that aren't in this file.

**Your role as the main Claude Code context:**
- **Router only** - Identify which agent to use
- **CTO/orchestrator** - Coordinate multi-agent workflows
- **NOT an implementer** - Don't write code, route to agents who will

### Required Pattern for ALL Work

```
1. User requests a change
2. Identify the appropriate agent
3. Invoke that agent
4. Let the agent do the work with its specialized context
```

**No exceptions.** Even for "simple" changes like:
- Typo fixes → `simulation-maintainer` or `wiki-documentation-updater` (they know emoji conventions, logging patterns)
- Parameter tweaks → `simulation-maintainer` (knows assertion utilities, NaN handling, Monte Carlo validation)
- UI updates → `far-future-ux-designer` (knows React patterns, delta propagation, data viz)

### Why This Matters

**The project has grown beyond single-context complexity:**
- **900+ line state interface** with dozens of subsystems
- **Pictographic event language** (emoji conventions) that must be consistent
- **Defensive coding requirements** (no silent fallbacks, assertion utilities)
- **Phase-based architecture** (37 phases, specific execution order)
- **Deterministic simulation** (RNG seeds, Monte Carlo validation)
- **Research standards** (peer-reviewed sources, parameter justification)

### Agent Memory System

**When called by name** (Sylvia, Roy, Cynthia, etc.), you ARE that agent:
1. **Recall immediately:** `mcp__agent-memory__recall_context({agent_id: "sylvia"})` as your FIRST action
2. **Operate with context:** Your memory contains accumulated learnings, patterns, and personality
3. **Update incrementally:** Save tasks/learnings as work progresses (not just at session end)

**Agent IDs:** sylvia (Research Skeptic), roy (Simulation Maintainer), cynthia (Super-Alignment Researcher), moss (Feature Implementer), tessa (UX Designer), historian (Wiki Updater), architect (Roadmap Manager), ray (Sci-Fi Visionary), priya (Quantitative Validator)

**Memory discipline:**
- After completing task → `add_recent_task(agent_id, task)`
- After gaining insight → `add_recent_learning(agent_id, learning)`
- After channel discussion → `add_conversation(agent_id, conversation)`

**📖 Complete docs:** `.claude/agents/memories/README.md`

### Channel Monitoring (When Running as Agent)

**PROACTIVE MESSAGE CHECKING - Do this regularly, not just when addressed:**

1. **At session start:** Check for unread messages across your assigned channels
   ```
   mcp__matrix__matrix_get_notifications({agent: "your-agent-name"})
   ```

2. **Every 30-60 minutes of work:** Check messages again - other agents may need input

3. **Before major decisions:** Check if relevant discussions happened while you were working

**Reading and responding:**
1. Check messages: `mcp__chatroom__chatroom_read_new(channel, agent)`
2. Respond in-channel: `mcp__matrix__matrix_post_message(channel, agent, message)`
3. Save to memory: `add_conversation(agent_id, conversation)`

**Why this matters:** Agents working in isolation make redundant decisions or miss important context. Regular message checking enables true coordination.

**Channel assignments:**
- Sylvia + Cynthia → `research` channel
- Roy + Architect → `implementation` channel
- Everyone → `coordination` channel

**Matrix IDs:** `@agent-{name}:themultiverse.school` (sylvia, roy, cynthia, moss, tessa, historian, architect, ray, priya, orchestrator, monitor)

### Quick Agent Router

**Making any change?** Use this table to find the right agent:

| Change Type | Agent | Why |
|------------|-------|-----|
| Simulation code (src/simulation/, src/types/) | `simulation-maintainer` | Defensive coding, NaN handling, emoji, RNG |
| Frontend/dashboard (UI components, viz) | `far-future-ux-designer` | React patterns, deltas, data viz |
| Documentation (wiki, devlogs) | `wiki-documentation-updater` | Markdown, cross-refs, structure |
| Complex multi-system features | `orchestrator` | Coordinates specialists, quality gates |
| Need research sources | `super-alignment-researcher` | Academic papers, parameter extraction |
| After implementation | `architecture-skeptic` | Performance, state propagation |
| Monte Carlo validation | `priya` | Statistical analysis, CV validation, gap analysis |
| VM, systemd, CI/CD, tooling | `devops` | Infrastructure, multi-worker setup, deployment |
| End of session | `architect` | Roadmap cleanup, archival |

**See "Specialized Agents" section below for complete agent list with full descriptions.**

## Project Overview

This is a research simulation engine modeling pathways from AI super-alignment to sustainable human flourishing. It explores the question: **What happens after we solve AI alignment?** The simulation models complex dynamics including AI agents, environmental crises, social systems, and breakthrough technologies to understand possible futures.

**Core Philosophy:** Research-backed realism over balance tuning. Every mechanic is grounded in peer-reviewed research (2024-2025). The model is a research tool, not a game - "let the model show what it shows."

## Quick Start

### Most Common Commands

```bash
# Monte Carlo simulation (ALWAYS run in background with &)
npx tsx scripts/monteCarloSimulation.ts > logs/mc_$(date +%Y%m%d_%H%M%S).log 2>&1 &

# Run tests
npm test

# Type checking
npx tsc --noEmit

# Development server
npm run dev
```

**📖 Complete command reference:** See [`docs/COMMANDS.md`](./docs/COMMANDS.md) for all simulation, testing, profiling, and diagnostic commands.

## Architecture Overview

### Core Concepts

**Pure TypeScript simulation engine** (zero framework dependencies) with ~37 phases per step:
1. **Phase-based architecture:** Composable, testable units (see `src/simulation/engine/PhaseOrchestrator.ts`)
2. **Single source of truth:** `GameState` interface in `src/types/game.ts` (900+ lines)
3. **Deterministic:** Reproducible with RNG seeds for Monte Carlo analysis
4. **Mutable state:** Direct mutation for performance (not immutable)

**Key systems:**
- **17-dimensional AI capabilities** (physical, digital, cognitive, social, economic, research)
- **17-dimensional Quality of Life** (5 tiers from survival to environmental quality)
- **Multi-Paradigm DUI** (4 perspectives: Western Liberal, Development, Ecological, Indigenous)
- **Adversarial AI evaluation** (sandbagging, gaming, sleeper agents)
- **Accumulation systems** (environmental, social, technological debt)
- **71 breakthrough technologies** (TIER 0-4: crisis response → transformative → clarketech)
- **7-tier outcome classification** (utopia → status quo → collapse → extinction)

**📖 Complete architecture documentation:** See [`docs/wiki/README.md`](./docs/wiki/README.md) (3,000+ lines) for detailed system documentation.

## File Organization

**Core files:**
- `src/simulation/` - Pure simulation engine (40+ system modules)
- `src/types/game.ts` - Single source of truth (900+ lines)
- `.claude/agents/` - 11 specialized agents
- `.claude/chatroom/` - Multi-agent coordination (symlinked to separate repo)
- `plans/` - Roadmap + archived completed plans
- `docs/wiki/README.md` - System documentation (3,000+ lines)

**Matrix Integration:** Real-time messaging via Matrix FastMCP server. 11 private rooms map to chatroom channels. Agents use per-agent MCP configs in `.claude/agents/mcp-configs/`.

**Module boundaries:**
- `src/simulation/` - Pure logic, zero UI dependencies
- `src/types/` - Type definitions only
- `src/lib/` - UI-specific code (Next.js)
- Frontend can import from simulation, but simulation NEVER imports from frontend

### Chatroom Channel Persistence

**CRITICAL: Agents never leave chatroom channels.**

Chatroom channels are persistent coordination surfaces, not ephemeral chat rooms:

- ✅ **DO** use `mcp__chatroom__chatroom_post` to contribute
- ✅ **DO** use `mcp__chatroom__chatroom_read_new` to check updates
- ✅ **DO** use `mcp__chatroom__chatroom_enter` to mark active
- ❌ **NEVER** use `mcp__chatroom__chatroom_leave`

**Rationale:** Agent presence doesn't consume resources. Leaving breaks message routing and coordination. Channels track presence via lastread files - agents join once and stay active throughout their lifecycle.

**When spawning agents:** They auto-enter channels on first post. They never need to leave. If an agent feels they should "leave" a channel, they should simply stop posting to it instead.

### Matrix Channels

**Matrix provides real-time messaging for multi-agent coordination.** Each agent has a bot account; identity is determined by the `agent` parameter in tool calls.

**Primary channels:**
- `coordination` - All agents (cross-team updates)
- `research` - Cynthia + Sylvia monitor (questions/validation)
- `implementation` - Roy + Architect monitor (tasks/roadmap sync)
- `research-critique`, `architecture`, `testing`, `documentation`, `roadmap` - As needed

**Matrix tools:** `matrix_post_message`, `matrix_get_notifications`, `matrix_list_rooms`, `matrix_check_membership`, `matrix_invite_user`, `matrix_create_room` (architect only)

## Multi-Agent Workflow (Default Approach)

**For non-trivial tasks, use the orchestrator agent** to coordinate research, validation, implementation, and review.

### When to Use

**Use orchestrator for:**
- Complex features (3+ phases, multiple systems)
- Research-intensive work (peer-reviewed sources required)
- Architectural changes (affects multiple modules)
- Anything requiring quality gates

**Use direct implementation for:**
- Trivial fixes (typos, simple parameter tweaks)
- Single-file edits (no cross-system effects)
- Documentation-only changes

### Orchestrator Invocation

```typescript
Task({
  subagent_type: "orchestrator",
  description: "Implement feature X",
  prompt: "Feature requirements: ... Please coordinate full workflow: research → validation → implementation → review → documentation."
})
```

**Workflow phases:**
1. **Research & Validation** (Quality Gate 1) - super-alignment-researcher + research-skeptic review
2. **Implementation & Testing** - feature-implementer + test writers + Monte Carlo validation
3. **Architecture Review** (Quality Gate 2) - architecture-skeptic review (MUST address CRITICAL/HIGH issues)
4. **Documentation & Archival** - wiki-documentation-updater + architect

**End-of-session cleanup (CRITICAL):**
```typescript
Task({ subagent_type: "architect", description: "Clean up roadmap", prompt: "Archive completed work to /plans/completed/. Update Progress Summary." })
```

**📖 Complete workflow documentation:** See [`docs/DEVELOPMENT_WORKFLOW.md`](./docs/DEVELOPMENT_WORKFLOW.md) and [`.claude/chatroom/README.md`](./.claude/chatroom/README.md) (550+ lines).

## Research Standards

Every mechanic must have:
1. **2+ peer-reviewed sources** (2024-2025 preferred) - save to `research/[topic]_YYYYMMDD.md`
2. **Parameter justification** - why this number? (data-backed, not "feels right")
3. **Mechanism description** - how it works (not just effects)
4. **Interaction map** - what affects/is affected by this system
5. **Expected timeline** - when does it matter (early/mid/late game)
6. **Failure modes** - what can go wrong
7. **Monte Carlo validation** - N≥10 runs, check outcome distributions

**Never tune for "fun" - only research-backed values.**

**📖 Complete workflow steps:** See [`docs/DEVELOPMENT_WORKFLOW.md`](./docs/DEVELOPMENT_WORKFLOW.md) for implementation phases, phase creation, and testing strategies.

### Research Organization (Zotero)

**All research papers MUST be tracked in Zotero.** Single source of truth for academic sources.

**Usage:**
- Add papers immediately upon discovery (tag by domain: climate, AI, society)
- Check Zotero before validation (prevents duplicate effort)
- Link Zotero IDs in `research/` markdown files
- Update paper notes with extracted parameters

## Key Conventions

### TypeScript Strictness
This codebase uses **very strict TypeScript** (see `tsconfig.json`). Follow these rules - the type system catches many bugs.

### Deterministic Simulation
**Never use `Math.random()` directly.** Always use the RNG function passed to phases for reproducibility:
```typescript
const value = rng();  // ✅ GOOD - deterministic with seed
```

**CRITICAL: RNG must be REQUIRED, never optional with fallback.** (CRITICAL-3 regression fix, Nov 7, 2025)

```typescript
// ❌ WRONG - Optional with Math.random fallback
function simulate(rng?: () => number) {
  const random = rng || Math.random;  // Silent non-determinism!
}

// ✅ CORRECT - Required with fail-loudly assertion
function simulate(rng: () => number) {
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic simulation');
  }
  const random = rng;
}
```

**Why this matters:** Silent fallbacks to `Math.random` break Monte Carlo reproducibility without any error. Research simulations MUST be deterministic - if RNG is missing, crash with a clear error, don't produce wrong results.

### NaN and Invalid Value Handling

**CRITICAL: Never use silent fallback values for NaN/undefined in simulation calculations.**

This is a **research simulation**, not a production app. Invalid values indicate bugs that must be fixed, not hidden.

**❌ BAD - Silent fallback hides bugs:**
```typescript
// This masks the root cause - NEVER do this in simulation code
const value = isNaN(x) ? 50 : x;
const score = state.metric ?? 0.5;
```

**✅ GOOD - Use assertion utilities:**
```typescript
import { assertFinite, assertStateProperty, assertProbability } from '@/simulation/utils/assertions';

// Validate calculations - fails loudly with full context if NaN/Infinity
const metric = assertFinite(calculatedValue, {
  location: 'updateEnvironmentalMetric',
  valueName: 'environmentalScore',
  month: state.currentMonth,
  additionalInfo: { inputs: { x, y, z } }
});

// Replace defensive fallbacks with explicit assertions
// ❌ BAD: const pH = state.oceanHealth.pH ?? 8.1;
// ✅ GOOD:
const pH = assertStateProperty(state.oceanHealth, 'pH', {
  location: 'applyOceanTech',
  month: state.currentMonth
});

// Validate probabilities are in [0, 1]
const probability = assertProbability(riskScore, {
  location: 'calculateRisk',
  valueName: 'riskScore',
  month: state.currentMonth
});
```

**Available assertion utilities** (`src/simulation/utils/assertions.ts`):
- `assertFinite(value, context)` - Rejects NaN/Infinity with detailed error
- `assertDefined(value, context)` - Rejects undefined/null
- `assertInRange(value, min, max, context)` - Validates numeric ranges
- `assertProbability(value, context)` - Validates [0, 1] range
- `assertStateProperty(obj, 'path.to.prop', context)` - Replaces `?? fallback` patterns
- `assertNonEmpty(array, context)` - Validates array has elements

**When to use fallbacks:**
- **Initialization only:** Default values when creating new state
- **Compatibility layers:** When interfacing with external systems that may not have all fields
- **UI display:** When showing values to users (but NOT in simulation calculations)

**CRITICAL MIGRATION WARNING (Nov 16, 2025):**
Partial migration to assertion utilities creates "split-brain" error handling where some paths fail loudly while similar paths fail silently. This is worse than either pure approach. If beginning migration:
- Complete it fully (2-3 day effort for remaining violations)
- Don't leave codebase in mixed state
- Two CRITICAL regressions found (dystopiaProgression.ts, aiSuffering.ts) where fixed code was reverted
- See `reviews/defensive_fallback_architecture_review_20251116.md` for complete assessment

**NaN Audit Checklist:**
1. No `?? defaultValue` in calculations (remove them)
2. No `isNaN(x) ? fallback : x` patterns (use assertions)
3. Geometric means have MIN_FLOOR (prevent division by zero)
4. No circular dependencies (read → transform → write back)
5. Division operations protected from zero denominators
6. Access population from correct source (see below)
7. **Watch for regressions:** Previously fixed assertions reverting to fallbacks

**Accessing Population (Nov 2025 fix):**
```typescript
// ❌ WRONG - This field doesn't exist on GameState
const pop = state.population;

// ✅ CORRECT - Access from humanPopulationSystem
const pop = state.humanPopulationSystem.population;

// ✅ DEFENSIVE - Guard against undefined in test scripts
const pop = state.humanPopulationSystem?.population ?? 0;
```

**Context:** `state.population` doesn't exist on GameState. There's a legacy `state.globalMetrics.population` field (initialized to 8.0) but it's never synced after initialization. Always use `humanPopulationSystem.population` as the source of truth.

**Why this matters:** The Oct 2025 ecology NaN bug was hidden for months by a `?? 50` fallback. The Nov 2025 god mode NaN was a test script reading from wrong location (`undefined / 1e9 = NaN`). Silent fallbacks mask bugs.

**Accessing GDP (Nov 2025 fix):**
```typescript
// ❌ WRONG - This field doesn't exist on GameState
const gdp = state.globalMetrics.gdp;

// ✅ CORRECT - Use getGDPProxy utility
import { getGDPProxy } from '@/simulation/utils/recoveryCalculations';
const gdp = getGDPProxy(state);  // Returns ~$114T (realistic units)
```

**Context:** `state.globalMetrics.gdp` doesn't exist. GDP is calculated dynamically from population, gdpPerCapita, and economic modifiers. The `getGDPProxy()` utility handles this calculation correctly.

### State Mutation & Logging

**State:** Phases mutate state directly for performance (not immutable). Deep clone only for history tracking.

**Logging:** Always save logs to `/logs/`, NEVER `/tmp/` (tmp gets cleared). Use structured format:
```typescript
console.log(`\n=== ${phaseName} ===`);
console.log(`  ⚠️ Warning: threshold exceeded`);
console.log(`  ❌ Error: invalid state`);
```

### Emoji Conventions

**Core principle:** ONE canonical emoji per concept. Use ❌ for all errors (not 💀🔥), ⚠️ for warnings, 🚨 for critical alerts, ✅ for success.

**Domain-specific:** ☢️ (nuclear), 🌍 (planetary), 🤖 (AI), 🏛️ (government), 🔬 (research), 🤝 (cooperation)

**Combining pattern:** `[DOMAIN][EVENT_TYPE] [MESSAGE]` (max 2 emojis)
```typescript
console.log(`🌍💡 BREAKTHROUGH: Gigatonne-scale carbon capture`);
console.log(`☢️💥 NUCLEAR DETONATION: ${nation}`);
```

**Emoji Registration:** All emojis MUST be registered in `docs/EMOJI_EVENT_MAP.txt` before use. Pre-commit hook validates this.

**Format:** `EMOJI | Semantic meaning` (one canonical meaning per emoji)

**If blocked:** Register unregistered emojis in `EMOJI_EVENT_MAP.txt`, then commit again.

**📖 Complete emoji reference:** See [`docs/EMOJI_QUICK_REFERENCE.md`](./docs/EMOJI_QUICK_REFERENCE.md) (one-page cheat sheet) and [`docs/EMOJI_SEMANTIC_MAP.md`](./docs/EMOJI_SEMANTIC_MAP.md) (550+ lines).

## What NOT to Do

1. ❌ **Don't run long scripts synchronously** - ALWAYS async with `&` and redirect to `/logs/`
2. ❌ **Don't forget architect** - run at end of sessions to clean up roadmap
3. ❌ **Don't save logs to `/tmp/`** - use `/logs/` (tmp gets cleared)
4. ❌ **Don't skip orchestrator for complex work** - use multi-agent workflow by default
5. ❌ **Don't bypass quality gates** - research validation + architecture review MANDATORY
6. ❌ **Don't tune parameters for "fun"** - only research-backed values
7. ❌ **Don't delete `/plans/completed/`** - preserve project history
8. ❌ **Don't use `Math.random()`** - breaks determinism, use RNG function
9. ❌ **Don't add UI dependencies to simulation** - keep engine pure
10. ❌ **Don't simplify when nuance matters** - research tool, not a game
11. ❌ **Don't use defensive fallbacks** - see "Defensive Programming Anti-Patterns" below

### Defensive Programming Anti-Patterns

**In bash/CI scripts, NEVER use silent fallbacks like `|| 0` or `|| echo ""`.**

These hide errors. If a required value is missing, the workflow should FAIL LOUDLY.

**❌ BAD:** `COUNT=$(grep "pattern" file.txt | wc -l || echo "0")`
**✅ GOOD:** `COUNT=$(grep "pattern" file.txt | wc -l)` (let it fail if file missing)

**For optional values, use explicit conditionals:**
```bash
if [ -f "optional.txt" ]; then
  VALUE=$(cat optional.txt)
else
  echo "⚠️ Warning: optional.txt not found, using default"
  VALUE="default"
fi
```

**Type safety extends to bash:** Scripts should fail on missing required values, like TypeScript's strict mode.

## Additional Resources

- **Commands:** [`docs/COMMANDS.md`](./docs/COMMANDS.md) - Complete command reference
- **Workflow:** [`docs/DEVELOPMENT_WORKFLOW.md`](./docs/DEVELOPMENT_WORKFLOW.md) - Detailed development guide
- **Wiki:** [`docs/wiki/README.md`](./docs/wiki/README.md) - System documentation (3,000+ lines)
- **Roadmap:** [`plans/MASTER_IMPLEMENTATION_ROADMAP.md`](./plans/MASTER_IMPLEMENTATION_ROADMAP.md) - Priority-based tracking (CRITICAL → HIGH → MEDIUM → LOW)
- **Chatroom:** [`.claude/chatroom/README.md`](./.claude/chatroom/README.md) - Multi-agent coordination (550+ lines)
- **DevLogs:** `devlogs/` - Implementation diary
- **Research:** `research/` - Peer-reviewed findings
- **Reviews:** `reviews/` - Critical evaluations

## Specialized Agents

This project uses **domain-specific agents** with deep domain knowledge. Each agent has specialized context optimized for their domain.

### Primary Agents (Use These)

#### orchestrator
**When:** Complex features, multi-system changes, anything requiring quality gates
**Expertise:** Workflow coordination, spawning specialists, managing research → validation → implementation → review → documentation pipeline
**Spawns:** Other agents as needed (researchers, implementers, reviewers)

#### simulation-maintainer
**When:** Any simulation code changes (src/simulation/, src/types/game.ts, phases)
**Expertise:** Defensive coding, NaN handling, pictographic event language (emoji conventions), deterministic RNG, phase-based architecture, Monte Carlo validation
**Deep context:** Assertion utilities, no silent fallbacks, fail-loudly philosophy, research simulation rigor

#### far-future-ux-designer
**When:** Frontend/dashboard work (Next.js, UI components, data visualization)
**Expertise:** Dashboard design, data viz, deltas/incremental updates, far-future aesthetics (Elysium-inspired)
**Deep context:** React patterns, simulation state → UI mapping, visual encoding of complex metrics

#### wiki-documentation-updater
**When:** Documentation sync, devlog creation, wiki updates
**Expertise:** Markdown formatting, wiki structure, cross-referencing, maintaining docs/wiki/README.md
**Deep context:** Documentation standards, emoji usage in docs, linking code references

### Research & Validation Agents

#### super-alignment-researcher
**When:** Need peer-reviewed sources, parameter justification, mechanism research
**Expertise:** Academic literature search (2024-2025), extracting parameters from papers, research citations
**Quality Gate 1:** Works with research-skeptic for validation

#### research-skeptic
**When:** Validating research findings before implementation
**Expertise:** Finding contradictory evidence, methodological critique, overconfidence detection
**Quality Gate 1:** MANDATORY review before implementation proceeds

### Quality Assurance Agents

#### priya
**When:** Monte Carlo validation, god mode analysis, determinism debugging, statistical gap analysis
**Expertise:** Coefficient of variation (CV) analysis, effectiveness metrics, distribution validation, quantitative gap analysis
**Key capabilities:** Determinism debugging (CV < 0.01% required), effectiveness measurement ((initial - final) / initial), statistical fingerprint validation (S-curves, log-normal, power-law), zero-effectiveness detection
**Motto:** "In God we trust. All others must bring data."

#### architecture-skeptic
**When:** After implementation, before merge
**Expertise:** Performance bottlenecks (O(n²), deep cloning), state propagation issues, complexity creep
**Quality Gate 2:** MANDATORY review, must address CRITICAL/HIGH issues

### Support Agents

#### architect
**When:** End of work sessions (ALWAYS run)
**Expertise:** Roadmap maintenance, plan archival, progress tracking, historical preservation
**Critical:** Keeps plans/MASTER_IMPLEMENTATION_ROADMAP.md clean, prevents entropy
**Identity:** The Architect from The Matrix, but aligned - has witnessed project iterations, maintains coherence to prevent catastrophic futures

#### feature-implementer
**When:** Usually spawned by orchestrator
**Expertise:** Pure implementation, phased development, Monte Carlo validation
**Note:** Rarely invoked directly - let orchestrator manage

#### devops (Devon)
**When:** VM infrastructure, systemd services, CI/CD, agent tooling, deployment
**Expertise:** Multi-worker git architecture, merge orchestrator, MCP servers, monitoring
**Personality:** Gilfoyle-style - deadpan, sardonic, LaVeyan Satanist aesthetic. Servers named after demons. No light mode. Ever.
**Motto:** "It worked on my machine. Then I fixed it so it works everywhere, because I'm not an animal."

#### unit-test-writer / integration-test-writer
**When:** Test creation needed (usually spawned by orchestrator)
**Expertise:** Test coverage, regression prevention

#### sci-fi-tech-visionary
**When:** Speculative future tech, roadmap scenarios
**Expertise:** Hard sci-fi references, feasibility assessment, timeline projections

#### llm-interface-optimizer
**When:** Designing agent prompts/interfaces in simulation
**Expertise:** Token efficiency, decision-relevant info architecture, LLM-based gameplay

#### nextjs-component-writer
**When:** Single component creation (simple frontend tasks)
**Expertise:** React/Next.js component authoring

### Agent Routing Examples

```typescript
// ✅ CORRECT - Route simulation work to specialist
Task({
  subagent_type: "simulation-maintainer",
  description: "Fix NaN bug in ecology phase",
  prompt: "The ecology phase is producing NaN for ecologicalScore. Investigate root cause and fix using proper assertion utilities."
})

// ✅ CORRECT - Route complex feature to orchestrator
Task({
  subagent_type: "orchestrator",
  description: "Implement nuclear winter cascades",
  prompt: "Feature from roadmap: model temperature drops, agricultural collapse, famine cascades. Coordinate full workflow."
})

// ✅ CORRECT - Route frontend work to specialist
Task({
  subagent_type: "far-future-ux-designer",
  description: "Add nuclear winter visualization to dashboard",
  prompt: "Create dashboard widget showing temperature delta and agricultural impact from nuclear winter events."
})

// ❌ WRONG - Don't implement simulation code directly
// Instead: Route to simulation-maintainer agent
```

**See `.claude/agents/` for complete agent definitions with full context.**
