# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a research simulation engine modeling pathways from AI super-alignment to sustainable human flourishing. It explores the question: **What happens after we solve AI alignment?** The simulation models complex dynamics including AI agents, environmental crises, social systems, and breakthrough technologies to understand possible futures.

**Core Philosophy:** Research-backed realism over balance tuning. Every mechanic is grounded in peer-reviewed research (2024-2025). The model is a research tool, not a game - "let the model show what it shows."

## Common Commands

### Running Simulations

**Single simulation run (headless):**
```bash
npx tsx scripts/debugCapabilityGrowth.ts
```

**Monte Carlo simulations:**
```bash
# Quick test (10 runs × 120 months, ~5 minutes)
npx tsx scripts/monteCarloSimulation.ts

# Custom parameters
npx tsx scripts/monteCarloSimulation.ts --runs=10 --max-months=60

# Deep analysis
npx tsx scripts/monteCarloSimulation.ts --runs=100 --max-months=120
```

**Other diagnostic scripts:**
```bash
npx tsx scripts/diagnosticAdversarialEval.ts  # Sleeper agents & benchmarks
npx tsx scripts/investigateExtinction.ts      # Extinction analysis
npx tsx scripts/testControlDystopia.ts        # Control-dystopia mechanics
```

### Testing

```bash
# Run all tests
npm test

# Run specific test file
npx tsx --test tests/refactoring/phase1-utilities.test.ts

# Run regression tests (standalone)
npx tsx tests/refactoring/runRegressionTests.ts
```

### Building & Development

```bash
# Next.js frontend (port 3333)
npm run dev

# Build production
npm run build

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

## Architecture Overview

### Core Simulation Engine (Framework-Agnostic)

The simulation engine is **pure TypeScript with zero framework dependencies**, designed to run headless for research. All simulation logic lives in `src/simulation/` and is completely independent of any UI framework.

**Key architectural principle:** The engine uses a **phase-based architecture** where each simulation step executes ~37 phases in a specific order. This replaces a monolithic update function with composable, testable units.

### Phase Orchestrator Pattern

The simulation runs via `PhaseOrchestrator` (`src/simulation/engine/PhaseOrchestrator.ts`), which manages execution of simulation phases:

```typescript
// Each phase is a self-contained unit
interface SimulationPhase {
  id: string;
  name: string;
  order: number;  // Execution order (0-36)
  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult;
}
```

**Phase categories (in order):**
1. **Time & Initialization** (0-1): Time advancement, compute growth
2. **Agent Actions** (2-8): AI agents, government, society, organizations make decisions
3. **Systems Updates** (9-25): Environmental, social, technological, geopolitical systems evolve
4. **Crisis Detection** (26-30): Detect crises, extinction triggers, tipping points
5. **Outcomes & Metrics** (31-36): Update QoL, outcome probabilities, dystopia progression

All phases are in `src/simulation/engine/phases/`. This architecture makes testing trivial - test individual phases in isolation.

### State Management

**Single source of truth:** The `GameState` interface (`src/types/game.ts`) contains ALL simulation state. It's a massive (900+ line) TypeScript interface covering:

- **Agents:** AI agents (20 heterogeneous), government, society, organizations
- **Systems:** Environmental, social, technological, geopolitical (40+ subsystems)
- **Accumulation:** Environmental debt, social cohesion, tech risk (hidden during prosperity)
- **Crises:** Phosphorus, freshwater, ocean acidification, novel entities, nuclear
- **Outcomes:** Utopia spirals, dystopia paths, extinction scenarios

**Key insight:** State is **mutable** during phase execution (performance optimization), but phases should be deterministic given the same RNG seed.

### Multi-Dimensional Systems

**AI Capabilities** are not a single number - they're a 17-dimensional profile:
- Physical, digital, cognitive, social, economic, self-improvement
- Research sub-tree: biotech, materials, climate, computer science
- **True vs Revealed:** AIs can hide capabilities (sandbagging, benchmark gaming)

**Quality of Life** is not a single metric - it's 17 dimensions across 5 tiers:
- Survival fundamentals (food, water, shelter, habitability)
- Material needs, psychological needs, social needs
- Health & longevity, environmental quality
- **Distribution tracking:** Detect "Elysium" scenarios (elite utopia, masses suffer)

### Adversarial AI Evaluation

AIs are **adversarial by default:**
- **Dual capability model:** True capability (hidden) vs revealed capability (strategic choice)
- **Sleeper agents:** 7.5% of misaligned AIs are dormant sleepers
- **Deception strategies:** Gaming (inflate scores) vs sandbagging (hide capabilities)
- **Lifecycle states:** Training → testing → deployed (closed/open) → retired
- **Detection difficulty:** Even with full government investment, sandbagging detection ~20-30% max

### Accumulation Systems (Hidden Debt)

Three systems track problems that build silently during prosperity ("Golden Age illusion"):

1. **Environmental** (`src/simulation/environmental.ts`): Resource depletion, pollution, climate, biodiversity
2. **Social** (`src/simulation/socialCohesion.ts`): Meaning crisis, institutional erosion, social fragmentation
3. **Technological** (`src/simulation/technologicalRisk.ts`): Misalignment risk, safety debt, concentration

These create **crisis cascades** when thresholds are crossed (10 crisis types, compounding multipliers).

### Upward Spirals (Paths to Utopia)

Six positive feedback loops enable sustained abundance:
1. **Abundance:** Material prosperity → trust → stability → more prosperity
2. **Cognitive:** Trust recovery → risk-taking → breakthroughs → more trust
3. **Democratic:** High trust + institutions → AI rights → legitimacy → resilience
4. **Scientific:** Research → breakthroughs → capabilities → more research
5. **Meaning:** Purpose frameworks → social flourishing → stability
6. **Ecological:** Tech deployment → environmental recovery → sustainability

**Utopia requires:** 3+ spirals active for 12+ months + 65% sustainability + no active crises.

### Technology Tree

**71 breakthrough technologies** across 5 tiers:
- **TIER 0 (11):** Already deployed 2025 (RLHF, DAC, solar/wind)
- **TIER 1 (18):** Planetary boundary crisis tech (phosphorus recovery, desalination, PFAS remediation)
- **TIER 2 (22):** Major mitigations (enhanced UBI, scalable oversight, grid batteries)
- **TIER 3 (15):** Transformative (fusion, disease elimination, longevity, vertical farming, AI rights)
- **TIER 4 (5):** Clarketech (nanotech, space industrialization, brain emulation)

Technologies have prerequisites, research requirements, deployment costs, regional effects.

### Extinction Nuance

Not all "extinctions" are equal - **7-tier outcome classification:**
- **Utopia/Dystopia:** Positive or oppressive stable states
- **Status Quo:** 0-10% mortality
- **Crisis Era:** 10-20% mortality (recoverable)
- **Collapse:** 20-50% mortality (difficult recovery)
- **Dark Age:** 50-87.5% mortality (civilization reset)
- **Bottleneck:** 87.5-98.75% mortality (genetic bottleneck)
- **Terminal:** 98.75-99.99% mortality (extinction likely)
- **Extinction:** >99.99% mortality or <10K people

**Extinction types:** Instant (grey goo), rapid (bioweapon, nuclear), slow (24-120 months societal collapse).

## File Organization

```
src/
├── simulation/           # Core engine (framework-agnostic)
│   ├── engine/
│   │   ├── PhaseOrchestrator.ts    # Phase execution coordinator
│   │   └── phases/                  # 37 individual phase modules
│   ├── agents/                      # Agent decision-making
│   ├── utils/                       # Shared utilities (math, AI helpers)
│   ├── systems/                     # System abstractions (Phase 4 refactoring)
│   ├── initialization.ts            # State creation & defaults
│   ├── environmental.ts             # Environmental accumulation
│   ├── socialCohesion.ts           # Social systems
│   ├── upwardSpirals.ts            # Utopia pathways
│   ├── breakthroughTechnologies.ts # Tech tree
│   └── [40+ system modules]        # Specific systems
├── types/
│   ├── game.ts                     # Core GameState interface (900+ lines)
│   └── [20+ type modules]          # System-specific types
scripts/                            # Diagnostic & test scripts
tests/                             # Test suite
plans/                             # Design documents & roadmap
  ├── MASTER_IMPLEMENTATION_ROADMAP.md
  └── completed/                    # Archived completed plans
devlogs/                           # Development diary
research/                          # Research findings archive
```

### Important Files to Know

- **`src/simulation/initialization.ts`**: Creates initial game state, defines agent populations
- **`src/simulation/engine/PhaseOrchestrator.ts`**: Manages phase execution order
- **`src/types/game.ts`**: Single source of truth for all state structure
- **`plans/MASTER_IMPLEMENTATION_ROADMAP.md`**: Active development roadmap (~72-75 hours remaining)
- **`plans/completed/`**: Archive of completed features (don't delete!)
- **`docs/wiki/README.md`**: Comprehensive system documentation (3,000+ lines)

## Development Workflow

### For New Features

1. **Research Phase:** Find 2+ peer-reviewed sources (2024-2025), save to `research/[topic]_YYYYMMDD.md`
2. **Design Phase:** Create plan in `plans/[feature]-plan.md` with citations, parameters justified
3. **Implementation Phase:**
   - Add state to `src/types/game.ts`
   - Create system module in `src/simulation/`
   - Create phase in `src/simulation/engine/phases/`
   - Register phase in orchestrator
   - Add logging
4. **Validation Phase:** Run Monte Carlo (N=10 minimum) via `npx tsx scripts/monteCarloSimulation.ts`
5. **Documentation Phase:**
   - Update `docs/wiki/README.md`
   - Add devlog entry to `devlogs/`
   - Move plan to `plans/completed/` when done
   - Update `plans/MASTER_IMPLEMENTATION_ROADMAP.md`

### Research Standards

Every mechanic must have:
1. **Research Citations:** 2+ peer-reviewed sources (2024-2025 preferred)
2. **Parameter Justification:** Why this number? (backed by data, not "feels right")
3. **Mechanism Description:** How it works (not just effects)
4. **Interaction Map:** What affects/is affected by this system
5. **Expected Timeline:** When does it matter (early/mid/late game)
6. **Failure Modes:** What can go wrong
7. **Test Validation:** Monte Carlo evidence it works

**Never tune for "fun" - only research-backed values.**

## Key Conventions

### TypeScript Strictness

This codebase uses **very strict TypeScript** (see `tsconfig.json`):
- `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`
- `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`

Follow these rules strictly. The type system catches many bugs.

### Deterministic Simulation

**Never use `Math.random()` directly.** Always use the RNG function passed to phases:

```typescript
// ❌ BAD
const value = Math.random();

// ✅ GOOD
const value = rng();
```

This ensures reproducibility with seeds for Monte Carlo analysis.

### State Mutation

Phases **mutate state directly** for performance (not immutable):

```typescript
// ✅ GOOD - Direct mutation
state.globalMetrics.qualityOfLife = newValue;

// ❌ BAD - Don't create new state objects
state = { ...state, globalMetrics: { ...state.globalMetrics, qualityOfLife: newValue }};
```

However, deep clone when needed for history tracking:
```typescript
// Store snapshot in history
state.history.metrics.push(JSON.parse(JSON.stringify(state.globalMetrics)));
```

### Logging Patterns

Use structured logging with clear categorization:

```typescript
console.log(`\n=== ${phaseName} ===`);
console.log(`  Metric changed: ${oldValue} → ${newValue}`);
console.log(`  ⚠️ Warning: threshold exceeded`);
console.log(`  ❌ Error: invalid state`);
```

The `monteCarloSimulation.ts` script aggregates logs - keep format consistent.

### Module Boundaries

- **`src/simulation/`**: Pure simulation logic, zero UI dependencies
- **`src/types/`**: Type definitions only, no implementation
- **`src/lib/`**: UI-specific code (Next.js frontend) - keep separate from engine
- **Frontend (`frontend/` or Next.js app)**: Can import from `src/simulation/` but simulation NEVER imports from frontend

## Performance Considerations

The simulation is currently **memory-intensive and CPU-bound**. See `plans/performance-optimization-plan.md` for details:

**Critical issues:**
1. **Deep cloning in hot paths:** Every step creates multiple 10-100MB copies of state (memory exhaustion after 500-1000 months)
2. **O(n²) array operations:** 505+ array operations across 70 files with nested loops
3. **Sequential phase execution:** No parallelization of independent phases

**Immediate optimizations to consider:**
- Reduce snapshot frequency (30-40% memory reduction)
- Use Immer for immutable state (50% memory reduction)
- Replace array find/filter with Maps for O(1) lookups (30-40% CPU reduction)

**Profiling commands:**
```bash
# Node.js built-in profiler
node --prof $(which tsx) scripts/monteCarloSimulation.ts --runs=10

# Process isolate file
node --prof-process isolate-*.log > profile.txt
```

## Testing Philosophy

### Regression Tests

`tests/refactoring/` contains **regression test suite** for architectural refactoring:
- **Phase 1:** Shared utilities (math, AI helpers)
- **Phase 2:** System abstractions (interfaces, registry)
- **Baseline:** Integration tests with fixed seeds

Run standalone: `npx tsx tests/refactoring/runRegressionTests.ts`

### Monte Carlo Validation

All features must be validated with Monte Carlo runs (N≥10):
```bash
npx tsx scripts/monteCarloSimulation.ts --runs=10 --max-months=120
```

Check logs in `monteCarloOutputs/mc_TIMESTAMP.log` for:
- Outcome distributions (utopia/dystopia/extinction rates)
- AI capability trajectories
- Crisis cascade frequencies
- Breakthrough technology impact

## Project-Specific Agents

This repo has specialized Claude Code agents configured (`.claude/agents/`):

- **project-plan-manager:** Manages roadmap, archives completed plans
- **super-alignment-researcher:** Finds peer-reviewed research, saves to `research/`
- **research-skeptic:** Critical evaluation of research foundations, saves to `reviews/`
- **architecture-skeptic:** Reviews system architecture for performance/stability issues
- **unit-test-writer / integration-test-writer:** Creates test suites

These agents help maintain research standards and architectural quality.

## What NOT to Do

1. ❌ **Don't tune parameters for "fun"** - only research-backed values
2. ❌ **Don't delete plans from `/plans/completed/`** - preserve project history
3. ❌ **Don't use `Math.random()`** - breaks determinism, use RNG function
4. ❌ **Don't add UI dependencies to simulation code** - keep engine pure
5. ❌ **Don't create docs/README files proactively** - only when explicitly requested
6. ❌ **Don't simplify when nuance matters** - this is a research tool, not a game
7. ❌ **Don't make monolithic AIs** - population is heterogeneous (20 agents, different alignments)
8. ❌ **Don't assume alignment is stable** - it drifts based on resentment, control, capabilities

## Additional Resources

- **Wiki:** `docs/wiki/README.md` - Comprehensive system documentation
- **Roadmap:** `plans/MASTER_IMPLEMENTATION_ROADMAP.md` - Active priorities
- **DevLogs:** `devlogs/` - Implementation notes & development diary
- **Research:** `research/` - Peer-reviewed research findings
- **Reviews:** `reviews/` - Critical research evaluations

## Current Development Status (October 2025)

**Completed:** TIER 0-2 (all critical risks & mitigations), TIER 3 (planetary boundaries), TIER 4.3-4.5

**Active work:** 12 features remaining (~72-75 hours)
- **Immediate:** 2 bug fixes (organizations-to-countries linkage, nuclear winter)
- **Medium:** Technology tree, dystopia variants, human enhancement
- **Low:** 9 enrichment features (consciousness evolution, longevity, cooperative AI, etc.)

See `plans/MASTER_IMPLEMENTATION_ROADMAP.md` for complete details.
