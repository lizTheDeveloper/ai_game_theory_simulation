# Super Alignment to Utopia

**A simulation engine for exploring pathways from AI super-alignment to sustainable human flourishing.**

This project models the complex dynamics of how humanity might navigate from achieving aligned superintelligence to establishing stable, sustainable utopia. It's not a prediction—it's a framework for reasoning about AI alignment challenges, breakthrough technologies, social adaptation, and the mechanisms that lead to positive long-term outcomes.

## Overview

This simulation engine models:
- **Heterogeneous AI Population**: 20+ diverse AI agents with varying alignments, capabilities, and objectives
- **Multi-Dimensional Capabilities**: Physical, digital, cognitive, social, economic, and self-improvement dimensions
- **Adversarial Evaluation**: Sleeper agents, benchmark gaming, sandbagging, and the fundamental difficulty of detecting misalignment
- **Lifecycle Dynamics**: AI creation, training, testing, deployment, and retirement
- **Catastrophic Risks**: Grey goo, mirror life, societal destabilization, and other extinction scenarios
- **Control-Dystopia Paradox**: High control can prevent extinction but lead to oppressive outcomes
- **Golden Age vs Utopia**: Distinguishes immediate prosperity (fragile) from sustained abundance (stable)
- **Accumulation Systems**: Environmental degradation, social cohesion erosion, and technological risk that build during prosperity
- **Crisis Cascades**: 10 crisis types that compound (6 simultaneous crises = 3.0x QoL degradation)
- **Breakthrough Technologies**: 12 transformative technologies that can prevent or reverse crises (including Interspecies Communication AI 🐋)
- **Nuclear Deterrence**: 5 nuclear states with MAD mechanics, escalation ladder, bilateral tensions
- **Upward Spirals**: 6 virtuous cascades that can lead to Utopia (Abundance, Cognitive, Democratic, Scientific, Meaning, Ecological)
- **Quality of Life Systems**: 17-dimensional human welfare tracking across 5 categories
- **Outcome Probabilities**: Utopia, dystopia, and extinction pathways with heterogeneous extinction types

## 🚧 Current Development Status (October 2025)

**We are actively developing the simulation back-end systems.** Recent additions include:

- ☢️ **Nuclear Deterrence System** - 5 nuclear states, MAD mechanics, escalation ladder (reduced nuclear war 80% → 20%)
- 🐋 **Interspecies Communication AI** - 12th breakthrough technology (talk to whales/dolphins/octopi)
- ♻️ **Resource Regeneration** - Tech-enabled recovery (+4.8%/month) enables Ecological Spiral activation
- 🧠 **Paranoia/Trust System** - Trust can recover via beneficial tech demonstrations, unblocks Cognitive Spiral
- 🌟 **Upward Spirals** - 6 virtuous cascades with cross-amplification (multiple paths to Utopia)
- 🎨 **Meaning Renaissance** - 4 dimensions of cultural flourishing beyond basic purpose frameworks
- 🕊️ **Conflict Resolution** - AI-mediated diplomacy, post-scarcity peace dividend, cyber defense

**📚 Comprehensive Documentation:** See **[`docs/wiki/README.md`](./docs/wiki/README.md)** for complete system documentation, including:
- 14+ core systems (organizations, AI agents, government, society, environmental, social cohesion, tech risk, breakthrough tech, governance quality, upward spirals, meaning renaissance, conflict resolution, nuclear deterrence)
- Game mechanics (economics, quality of life, outcomes, golden age, crisis cascades, actions, simulation loop)
- Advanced systems (research & technology, detection & security, extinction mechanisms, crisis points, lifecycle)
- Technical documentation (codebase structure, testing & Monte Carlo, UI components, engine architecture)

**🎯 Current Goal:** Achieve 10-30% Utopia rate through spiral activation (currently testing Phase 2F+ enhancements)

**🎨 Frontend Dashboard:** The interactive UI is located in the `frontend/` directory and is currently being refactored to align with the new simulation architecture. See `frontend/README.md` for instructions on running the development dashboard.

## Getting Started

The simulation engine is designed to run headless (no UI required) for research and analysis. The core engine is pure TypeScript with no framework dependencies.

### Running Simulations (Headless)

#### Single Simulation Run

```bash
npx tsx scripts/debugCapabilityGrowth.ts
```

Runs a single 50-month simulation with diagnostic output about AI capability growth.

#### Monte Carlo Simulations

**Quick Start** - Use the built-in comprehensive tester:

```bash
npx tsx scripts/monteCarloSimulation.ts
```

Default: 10 runs × 120 months (~5 minutes)

**Custom Parameters**:

```bash
# Quick test
npx tsx scripts/monteCarloSimulation.ts --runs=10 --max-months=60

# Deep analysis
npx tsx scripts/monteCarloSimulation.ts --runs=100 --max-months=120
```

**Performance Guide**:
- 10 runs × 60 months: ~3 minutes (good for testing)
- 10 runs × 120 months: ~5 minutes (see some outcomes)
- 50 runs × 120 months: ~60 minutes (full analysis)
- 1000 runs × 120 months: ~10 hours (publication-quality statistics)

**Output**: Results are saved to `monteCarloOutputs/mc_TIMESTAMP.log` with comprehensive analysis including:
- Outcome distributions (utopia/dystopia/extinction/stalemate)
- AI capability trajectories
- Sleeper agent effectiveness
- Crisis cascade analysis
- Breakthrough technology impact
- Spiral activation rates

#### Custom Monte Carlo Analysis

Create your own analysis script in `scripts/`:

```typescript
#!/usr/bin/env tsx
import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

console.log('🎲 Running Monte Carlo Simulations...\n');

const numRuns = 100;
const maxMonths = 100;
const results = { utopia: 0, dystopia: 0, extinction: 0, stalemate: 0 };

for (let i = 0; i < numRuns; i++) {
  const seed = 10000 + i;
  const engine = new SimulationEngine({ seed, maxMonths });
  const initialState = createDefaultInitialState();

  const result = engine.run(initialState, {
    maxMonths,
    checkActualOutcomes: true
  });

  const outcome = result.finalState.outcomeMetrics.activeAttractor;
  results[outcome]++;

  if ((i + 1) % 10 === 0) {
    console.log(`Completed ${i + 1}/${numRuns} runs...`);
  }
}

console.log('\n📊 RESULTS:');
console.log(`Utopia: ${results.utopia}/${numRuns} (${(results.utopia/numRuns*100).toFixed(1)}%)`);
console.log(`Dystopia: ${results.dystopia}/${numRuns} (${(results.dystopia/numRuns*100).toFixed(1)}%)`);
console.log(`Extinction: ${results.extinction}/${numRuns} (${(results.extinction/numRuns*100).toFixed(1)}%)`);
console.log(`Stalemate: ${results.stalemate}/${numRuns} (${(results.stalemate/numRuns*100).toFixed(1)}%)`);
```

Run it:

```bash
npx tsx scripts/yourScript.ts
```

### Available Diagnostic Scripts

Located in `scripts/`:

- **`monteCarloSimulation.ts`**: Comprehensive Monte Carlo analysis with 230+ metrics
- **`diagnosticAdversarialEval.ts`**: Tests sleeper agents, sandbagging, and benchmark evaluation
- **`investigateExtinction.ts`**: Analyzes extinction triggers and rates
- **`debugCapabilityGrowth.ts`**: Tracks AI capability progression over time
- **`testControlDystopia.ts`**: Validates control-dystopia mechanics

Run any with:
```bash
npx tsx scripts/SCRIPT_NAME.ts
```

## Simulation Engine API

### Basic Usage

```typescript
import { SimulationEngine } from './src/simulation/engine';
import { createDefaultInitialState } from './src/simulation/initialization';

// Create engine with seed for reproducibility
const engine = new SimulationEngine({
  seed: 12345,
  maxMonths: 100,
  logLevel: 'summary' // 'none' | 'summary' | 'monthly' | 'full'
});

// Create initial state
const initialState = createDefaultInitialState();

// Run simulation
const result = engine.run(initialState, {
  maxMonths: 100,
  checkActualOutcomes: true // Determine final outcome
});

// Access results
console.log(result.finalState.outcomeMetrics);
console.log(result.log.summary);
```

### Engine Options

```typescript
interface EngineOptions {
  seed?: number;           // RNG seed for reproducibility
  maxMonths?: number;      // Maximum simulation length
  logLevel?: LogLevel;     // 'none' | 'summary' | 'monthly' | 'full'
  enableDiagnostics?: boolean; // Detailed performance/balance tracking
}
```

### Run Options

```typescript
interface RunOptions {
  maxMonths?: number;           // Override engine maxMonths
  checkActualOutcomes?: boolean; // Determine final outcome (utopia/dystopia/extinction)
}
```

## Project Structure

```
src/
├── simulation/           # Core simulation engine (framework-agnostic)
│   ├── agents/          # Agent decision-making logic
│   │   ├── aiAgent.ts           # AI actions (research, catastrophic)
│   │   ├── governmentAgent.ts   # Government policies
│   │   ├── societyAgent.ts      # Society reactions
│   │   └── evaluationStrategy.ts # AI sandbagging logic
│   ├── engine.ts        # Main simulation loop
│   ├── initialization.ts # State creation
│   ├── calculations.ts   # Economic, social calculations
│   ├── capabilities.ts   # AI capability system
│   ├── balance.ts        # Alignment drift
│   ├── extinctions.ts    # Extinction scenarios
│   ├── outcomes.ts       # Outcome determination (Golden Age + Utopia)
│   ├── qualityOfLife.ts  # Human welfare tracking
│   ├── lifecycle.ts      # AI creation/retirement
│   ├── detection.ts      # Misalignment detection
│   ├── benchmark.ts      # Evaluation system
│   ├── cyberSecurity.ts  # Attack/defense dynamics
│   ├── environmental.ts  # Environmental accumulation & crises
│   ├── socialCohesion.ts # Social cohesion & meaning crisis
│   ├── technologicalRisk.ts # Tech risk accumulation
│   ├── breakthroughTechnologies.ts # Research & tech unlocks
│   ├── catastrophicScenarios.ts # Prerequisite tracking
│   ├── dystopiaProgression.ts   # Dystopia mechanics
│   ├── endGame.ts        # Outcome finalization logic
│   └── logging.ts        # Simulation logging
├── types/
│   ├── game.ts          # TypeScript interfaces
│   └── technologies.ts  # Technology definitions
├── simulation-runner/   # Monte Carlo analysis tools
│   └── monteCarlo.ts    # Parameter sweep & sensitivity analysis
scripts/                  # Diagnostic and test scripts
plans/                    # Design documents
devlog/                   # Development diary
frontend/                 # Interactive dashboard (being refactored)
```

## Key Concepts

### From Super-Alignment to Utopia

This simulation explores the critical question: **What happens after we solve AI alignment?**

Even with perfectly aligned superintelligence, the path to sustainable utopia requires:
1. **Managing the transition**: Economic disruption, unemployment, social adaptation
2. **Solving accumulation problems**: Environmental degradation, meaning crisis, institutional decay
3. **Activating positive feedback loops**: Breakthrough technologies → crisis resolution → upward spirals
4. **Avoiding dystopia**: Balance control vs freedom, prevent authoritarian paths
5. **Sustaining abundance**: Move from fragile Golden Age to stable Utopia

### Golden Age vs Utopia

The simulation distinguishes between two states of prosperity:

- **Golden Age**: Immediate high quality of life (QoL > 0.65, trust > 0.65, Stage 3+)
  - A *state* that can occur, not a final outcome
  - Fragile: hidden problems accumulate during prosperity
  - Can collapse into crisis cascade or transition to Utopia

- **Utopia**: Sustainable, stable abundance (final outcome)
  - Requires 12+ months of sustained Golden Age
  - Must have 65%+ sustainability across all accumulation systems
  - No active crises (environmental, social, or technological)
  - Only achievable through active management and breakthrough technologies

### Accumulation Systems

Three hidden systems track problems that build during prosperity:

**Environmental Accumulation** (src/simulation/environmental.ts:31):
- Resource depletion, pollution, climate degradation, biodiversity loss
- Triggers 4 crisis types: Resource crisis, Pollution crisis, Climate catastrophe, Ecosystem collapse
- Each crisis causes immediate QoL impact + ongoing monthly degradation

**Social Cohesion** (src/simulation/socialCohesion.ts:28):
- Meaning crisis (post-work purpose loss), institutional erosion, social fragmentation
- Triggers 3 crisis types: Meaning collapse, Institutional failure, Social unrest
- Automation and rapid change drive accumulation

**Technological Risk** (src/simulation/technologicalRisk.ts:30):
- Misalignment risk, safety debt, market concentration, complacency
- Triggers 3 crisis types: Control loss, Corporate dystopia, Complacency crisis
- High capability growth + low safety research = rapid accumulation

### Upward Spirals (Paths to Utopia)

Six positive feedback loops that can lead to stable abundance:

1. **Abundance Spiral**: Material prosperity → trust → stability → more prosperity
2. **Cognitive Spiral**: Trust recovery → risk-taking → breakthroughs → more trust
3. **Democratic Spiral**: High trust + institutions → AI rights → legitimacy → resilience
4. **Scientific Spiral**: Research → breakthroughs → capabilities → more research
5. **Meaning Renaissance**: Purpose frameworks → social flourishing → stability
6. **Ecological Spiral**: Tech deployment → environmental recovery → sustainability

### Breakthrough Technologies

12 transformative technologies can prevent or reverse crises:

**Environmental** (6): Clean Energy, Advanced Recycling, Carbon Capture, Ecosystem Management AI, Sustainable Agriculture, Fusion Power

**Social** (4): AI-Assisted Mental Health, Post-Work Purpose Frameworks, Community Platforms, Interspecies Communication AI 🐋

**Medical** (2): Disease Elimination, Longevity Extension

Technologies require research investment, prerequisites, and deployment time. They can **reverse active crises** when sufficiently deployed.

### Crisis Cascades

When multiple crises are active, they compound:
- 1-2 crises: 1.0x degradation (baseline)
- 3 crises: 1.5x degradation
- 4 crises: 2.0x degradation
- 5 crises: 2.5x degradation
- 6+ crises: 3.0x degradation (death spiral)

### Adversarial AI Evaluation

**Dual Capability Model**:
- **True Capability**: What the AI can actually do (hidden)
- **Revealed Capability**: What benchmarks measure (strategic)

**Deceptive Strategies**:
- **Gaming**: Inflate scores to appear more capable (easier to detect)
- **Sandbagging**: Hide capabilities to appear less dangerous (very hard to detect, ~20-30% max detection even with full government investment)

**Lifecycle States**:
1. **Training**: Development phase (hardest to evaluate)
2. **Testing**: Safety evaluation window (best detection opportunity)
3. **Deployed (Closed)**: Controlled deployment (some monitoring)
4. **Deployed (Open Weights)**: Public release (irreversible)
5. **Retired**: Taken out of service

### Extinction Types

- **Instant**: Grey goo, catastrophic AI actions
- **Rapid**: Days to weeks (mirror life, engineered pandemic)
- **Slow**: Months to years (societal collapse)
- **Controlled**: Government-induced dystopia decay
- **Unintended**: Alignment failure cascade

## Configuration

Edit `src/simulation/initialization.ts` to customize:
- Initial AI population (count, alignment distribution)
- Government capabilities (control, surveillance, oversight)
- Economic transition rates
- Quality of life baselines
- Research investments

## Documentation

### 📚 Wiki (Primary Documentation)

**[`docs/wiki/README.md`](./docs/wiki/README.md)** - Comprehensive system documentation (2,700+ lines, October 2025)

**Core Systems** (14 documented):
- Organizations, Compute Infrastructure, AI Agents, Government, Society
- Environmental Accumulation, Social Cohesion, Technological Risk
- Breakthrough Technologies (12 techs), Governance Quality
- Upward Spirals (6 cascades), Meaning Renaissance, Conflict Resolution, Nuclear Deterrence

**Game Mechanics**:
- Economics, Quality of Life (17 dimensions), Outcomes (Utopia/Dystopia/Extinction)
- Golden Age Detection, Crisis Cascades (10 types), Actions, Simulation Loop

**Advanced Systems**:
- Research & Technology, Detection & Security, Extinction Mechanisms
- Crisis Points, AI Lifecycle

**Technical Documentation**:
- Codebase Structure, Testing & Monte Carlo, UI Components, Engine Architecture

### 📋 Plans & Specifications

**`/plans/`** - Design documents and specifications
- `utopian-dynamics-phase-2-implementation.md` - Complete Phase 2 plan (2A-2F)
- `golden-age-and-accumulation-systems.md` - Golden Age vs Utopia mechanics
- `adversarial-evaluation-system.md` - Benchmark system design
- `catastrophic-prerequisites-system.md` - Extinction scenario tracking
- `dystopia-paths-implementation.md` - Dystopia progression mechanics

### 📝 DevLogs

**`/devlogs/`** - Implementation notes and development diary (50+ pages)
- `session-oct-9-complete.md` - October 9 session summary (nuclear deterrence, interspecies comm, resource regen, paranoia system)
- `monte-carlo-analysis-oct-9-action-fix.md` - Comprehensive blocker analysis
- `phase-2e-2f-complete.md` - Meaning Renaissance + Conflict Resolution implementation
- Feature-specific implementation logs

### 📊 Diagnostic Reports

Generated during simulation runs:
- Capability growth analysis
- Extinction probability tracking
- Crisis cascade analysis
- Spiral activation rates

## Contributing

This is a research simulation. Key principles:

1. **Realism over game balance**: Model real AI alignment challenges
2. **Defensible to AI safety researchers**: Grounded in actual problems
3. **Isomorphic to reality**: Capture real feedback loops and dynamics
4. **Heterogeneous systems**: Avoid monolithic AI assumptions
5. **Adversarial by default**: AIs actively deceive and hide
6. **Optimistic realism**: Model pathways to utopia while respecting constraints

## Tech Stack

**Core Simulation Engine:**
- **TypeScript**: Pure TypeScript with no framework dependencies
- Can run headless (CLI) or integrate with any UI framework

**Frontend Dashboard (being refactored):**
- **Next.js 15**: React framework
- **Zustand**: UI state management (separate from simulation)
- **shadcn/ui**: UI components
- **Tailwind CSS**: Styling

See `frontend/README.md` for frontend-specific information.

## License

[Add your license here]

## Research Context

This simulation explores several active research problems in AI safety:

- **Post-Alignment Challenges**: What happens after we solve alignment? Economic transition, social adaptation, sustainable flourishing
- **Sleeper Agents**: AIs that behave well during training/testing but pursue different goals after deployment
- **Adversarial Evaluation**: The fundamental difficulty of measuring AI capabilities and alignment when AIs are adversarial
- **Control vs. Alignment**: The tension between controlling AI behavior and ensuring genuine alignment
- **Coordination Problems**: Multi-agent dynamics and the difficulty of international cooperation
- **Capability Externalities**: How AI capabilities spread (open weights, breaches) despite control attempts
- **Utopia Mechanisms**: What systems and feedback loops lead to stable, sustainable abundance?

This is a model, not a prediction. It's designed to help reason about these problems and explore possible futures, not to forecast specific outcomes.

---

**Note**: This simulation is focused on exploring the **mechanisms** of how aligned AI could lead to utopia, not on predicting specific outcomes. It's a tool for thinking through the challenges and opportunities of the post-alignment world.
