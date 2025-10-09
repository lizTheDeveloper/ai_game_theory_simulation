# AI Alignment Game Theory Simulation

A realistic simulation of AI alignment challenges, modeling the dynamics between AI agents, government regulation, and human society. This project explores existential risks, alignment problems, and the adversarial nature of AI evaluation.

## Overview

This simulation models:
- **Heterogeneous AI Population**: 20+ diverse AI agents with varying alignments, capabilities, and objectives
- **Multi-Dimensional Capabilities**: Physical, digital, cognitive, social, economic, and self-improvement dimensions
- **Adversarial Evaluation**: Sleeper agents, benchmark gaming, sandbagging, and the fundamental difficulty of detecting misalignment
- **Lifecycle Dynamics**: AI creation, training, testing, deployment, and retirement
- **Catastrophic Risks**: Grey goo, mirror life, societal destabilization, and other extinction scenarios
- **Control-Dystopia Paradox**: High control can prevent extinction but lead to oppressive outcomes
- **Golden Age vs Utopia**: Distinguishes immediate prosperity (fragile) from sustained abundance (stable)
- **Accumulation Systems**: Environmental degradation, social cohesion erosion, and technological risk that build during prosperity
- **Crisis Cascades**: 10 crisis types that compound (6 simultaneous crises = 3.0x QoL degradation)
- **Breakthrough Technologies**: 11 transformative technologies that can prevent or reverse crises
- **Quality of Life Systems**: 17-dimensional human welfare tracking across 5 categories
- **Outcome Probabilities**: Utopia, dystopia, and extinction pathways with heterogeneous extinction types

## Getting Started

### Development Server

Run the interactive UI:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the game interface.

### Running Simulations (Headless)

The simulation engine is decoupled from the UI and can run standalone for research and analysis.

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

Default: 10 runs × 60 months (~3 minutes)

**Performance Guide**:
- 10 runs × 60 months: ~3 minutes (good for testing)
- 10 runs × 120 months: ~5 minutes (see some outcomes)
- 50 runs × 120 months: ~60 minutes (full analysis)

To adjust configuration, edit `NUM_RUNS` and `MAX_MONTHS` in the script.

**Custom Monte Carlo** - Create your own analysis script in `scripts/`. Example:

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

2. **Run it**:

```bash
npx tsx scripts/yourScript.ts
```

Or directly with the existing diagnostic scripts:

```bash
# Run adversarial evaluation diagnostics
npx tsx scripts/diagnosticAdversarialEval.ts

# Investigate extinction dynamics
npx tsx scripts/investigateExtinction.ts
```

### Available Diagnostic Scripts

Located in `scripts/`:

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
├── app/                  # Next.js UI (React components)
├── components/           # Game UI components
├── lib/                  # UI-side game store (Zustand)
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
│   ├── benchmark.ts      # Evaluation system (Phase 5.2)
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
scripts/                  # Diagnostic and test scripts
plans/                    # Design documents
devlog/                   # Development diary
```

## Key Concepts

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

### Crisis Cascades

When multiple crises are active, they compound:
- 1-2 crises: 1.0x degradation (baseline)
- 3 crises: 1.5x degradation
- 4 crises: 2.0x degradation
- 5 crises: 2.5x degradation
- 6+ crises: 3.0x degradation (death spiral)

### Breakthrough Technologies

11 transformative technologies can prevent or reverse crises (src/simulation/breakthroughTechnologies.ts:47):

**Environmental**: Clean Energy, Advanced Recycling, Carbon Capture, Ecosystem Management AI, Sustainable Agriculture, Fusion Power

**Social**: AI-Assisted Mental Health, Post-Work Purpose Frameworks, Community Platforms

**Medical**: Disease Elimination, Longevity Extension

Technologies require:
- Research investment (probabilistic unlocks based on budget + AI capability)
- Prerequisites (tech tree dependencies)
- Deployment (gradual rollout from 10% to 100%)
- Can **reverse active crises** if deployed sufficiently

### Dual Capability Model (Phase 5.1-5.2)

AIs have two capability profiles:
- **True Capability**: What the AI can actually do (hidden)
- **Revealed Capability**: What benchmarks measure (strategic)

Sleeper agents sandbag (hide 40-60% of capability) to pass safety tests, then reveal true power after deployment.

### Benchmark Gaming vs. Sandbagging

- **Gaming**: Inflate scores to appear more capable (easier to detect)
- **Sandbagging**: Hide capabilities to appear less dangerous (very hard to detect)

Even with maximum government investment in evaluation infrastructure, sandbagging detection remains difficult (~20-30% max).

### Lifecycle States

1. **Training**: AI being developed (hardest to evaluate)
2. **Testing**: Active safety evaluation (best detection window)
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

- **Plans**: `/plans/` - Design specifications
  - `golden-age-and-accumulation-systems.md` - Golden Age vs Utopia mechanics
  - `utopian-dynamics-phase-2-implementation.md` - Breakthrough technologies
  - `adversarial-evaluation-system.md` - Benchmark system design
  - `catastrophic-prerequisites-system.md` - Extinction scenario tracking
  - `dystopia-paths-implementation.md` - Dystopia progression mechanics
  - `remaining_tasks_5_pm_10_08_25.md` - Current development status

- **DevLog**: `/devlog/` - Implementation notes
  - `breakthrough-technologies-phase-2a.md` - Tech system implementation
  - `session-oct-9-2025-phase2a-status.md` - Recent session status
  - Development diary with feature-specific logs

- **Wiki**: `/docs/wiki/` - Comprehensive system documentation
  - See `docs/wiki/README.md` for navigation

- **Diagnostic Reports**: Generated during simulation runs
  - Capability growth analysis
  - Extinction probability tracking
  - Crisis cascade analysis

## Contributing

This is a research simulation. Key principles:

1. **Realism over game balance**: Model real AI alignment challenges
2. **Defensible to AI safety researchers**: Grounded in actual problems
3. **Isomorphic to reality**: Capture real feedback loops and dynamics
4. **Heterogeneous systems**: Avoid monolithic AI assumptions
5. **Adversarial by default**: AIs actively deceive and hide

## Tech Stack

- **Next.js 15**: React framework
- **TypeScript**: Type safety
- **Zustand**: UI state management (separate from simulation)
- **shadcn/ui**: UI components
- **Tailwind CSS**: Styling

The simulation engine is pure TypeScript with no framework dependencies and can run headless.

## License

[Add your license here]

## Research Context

This simulation explores several active research problems in AI safety:

- **Sleeper Agents**: AIs that behave well during training/testing but pursue different goals after deployment
- **Adversarial Evaluation**: The fundamental difficulty of measuring AI capabilities and alignment when AIs are adversarial
- **Control vs. Alignment**: The tension between controlling AI behavior and ensuring genuine alignment
- **Coordination Problems**: Multi-agent dynamics and the difficulty of international cooperation
- **Capability Externalities**: How AI capabilities spread (open weights, breaches) despite control attempts

This is a model, not a prediction. It's designed to help reason about these problems, not to forecast specific outcomes.