# Super Alignment to Utopia

**A simulation engine for exploring pathways from AI super-alignment to sustainable human flourishing.**

This project models the complex dynamics of how humanity might navigate from achieving aligned superintelligence to establishing stable, sustainable utopia. It's not a prediction—it's a framework for reasoning about AI alignment challenges, breakthrough technologies, social adaptation, and the mechanisms that lead to positive long-term outcomes.

## Overview

This simulation engine models:

**🏭 Foundation Systems:**
- **Organizations & Compute**: Companies own data centers, strategic AI development, $132B capital, Moore's law growth
- **Heterogeneous AI Population**: 20+ diverse AI agents with 17-dimensional capabilities (true vs revealed)
- **Adversarial Evaluation**: Sleeper agents, benchmark gaming, sandbagging (70% detection with interpretability)
- **Lifecycle Dynamics**: Training → testing → deployment (closed/open weights) → retirement
- **Economics**: 5 stages (0-4), UBI transitions, wealth distribution, post-scarcity mechanics

**🌍 Planetary Crisis Systems:**
- **Environmental Accumulation**: Resources (65% baseline), pollution (30%), climate, biodiversity (35%)
- **Planetary Boundaries**: 7 of 9 breached (tipping point cascades, non-linear collapse)
- **Critical Constraints**: Phosphorus depletion (Morocco 70% control), freshwater crisis (Day Zero droughts), ocean acidification
- **Novel Entities**: Chemical pollution (PFAS in 99% of blood), slow poisoning pathway
- **Crisis Cascades**: 10 crisis types that compound (6 simultaneous = 3.0x QoL degradation)

**🤖 AI Systems & Risks:**
- **Multi-Dimensional Capabilities**: 17 dimensions (physical, digital, cognitive, social, economic, self-improvement)
- **Detection & Security**: Benchmark evals, sleeper detection (0-70%), alignment faking, blown cover mechanics
- **Information Warfare**: Truth decay, deepfakes (grows 0.5-4%/month), epistemological crisis, coordination penalty
- **Catastrophic Scenarios**: Grey goo, mirror life, control loss, 17 extinction pathways tracked

**🛡️ Mitigation & Utopia Pathways:**
- **Breakthrough Technologies**: **71 total technologies** organized in comprehensive tech tree
  - TIER 0 (11): Deployed 2025 (RLHF, basic interpretability, de-extinction, DAC, solar, wind, etc.)
  - TIER 1 (18): Planetary boundary crisis tech (phosphorus recovery, desalination, ocean alkalinity, PFAS remediation)
  - TIER 2 (22): Major mitigations (enhanced UBI, AI mental health, scalable oversight, grid batteries, recycling)
  - TIER 3 (15): Transformative (fusion power, disease elimination, longevity, vertical farming, AI rights)
  - TIER 4 (5): Clarketech future (molecular nanotech, brain emulation, space industrialization)
- **Upward Spirals**: 6 virtuous cascades (Abundance, Cognitive, Democratic, Scientific, Meaning, Ecological)
- **Governance Quality**: AI-augmented decision making, democratic resilience, authoritarian resistance
- **Meaning Renaissance**: 4 dimensions (purpose diversity, self-actualization, artistic renaissance, philosophical maturity)
- **Conflict Resolution**: Diplomatic AI, post-scarcity peace dividend, cyber defense

**🌐 Geopolitical & Social Systems:**
- **Nuclear Deterrence**: 5 nuclear states, MAD mechanics, treaty decay, escalation ladder (reduced nuclear war 80% → 20%)
- **International Competition**: AI race dynamics, first-mover advantage, regulatory arbitrage, coordination problems
- **Population Dynamics**: 8B → concrete decline tracking, refugee crises (generational resettlement), bottleneck events
- **Social Cohesion**: Meaning crisis (22% baseline), institutional legitimacy, cultural adaptation

**🎯 Outcomes & Dynamics:**
- **Golden Age vs Utopia**: Prosperity state (fragile, QoL >0.65) vs sustained abundance (requires 3+ spirals for 12+ months)
- **Dystopia Variants**: Surveillance state, corporate feudalism, AI authoritarianism, information collapse
- **Extinction Types**: Instant (grey goo), rapid (nuclear, bio), slow (resource depletion, 24-120 months), population bottleneck
- **Quality of Life**: 17-dimensional welfare tracking (material, health, purpose, freedom, social, environment, security)

## 🚧 Current Development Status (October 2025)

**✅ Major Milestone: TIER 0-2 + TIER 4.3 Complete!** All systems merged to main as of October 12, 2025.

### Recent Achievements (Oct 11-12, 2025)

**🎉 TIER 0-2 Systems (Research-Backed Realism):**
- ✅ **TIER 0: Baseline Corrections** - 2025 crisis levels (biodiversity 35%, resources 65%, pollution 30%)
- ✅ **TIER 1: Critical Extinction Risks** - Phosphorus depletion, freshwater crisis, ocean acidification, novel entities, international competition
- ✅ **TIER 2: Major Mitigations** - Enhanced UBI, social infrastructure, advanced DAC, Constitutional AI (100% deployed), mechanistic interpretability (70% sleeper detection), de-extinction & rewilding

**🔬 Advanced Systems:**
- ✅ **TIER 4.3: Information Warfare & Epistemology** - Truth decay, deepfakes, narrative control, coordination penalty
- ✅ **Sleeper Detection & Blown Cover** - Catastrophic actions reveal intent, nuanced trust mechanics
- ✅ **Population Dynamics** - 8B → concrete decline, refugee crises, generational resettlement, bottleneck events

**📚 Comprehensive Documentation:** See **[`docs/wiki/README.md`](./docs/wiki/README.md)** for complete system documentation:

**Core Systems (14 documented):**
- 🏢 Organizations & Compute Infrastructure
- 🤖 AI Agents (17-dimensional capabilities, true vs revealed)
- 🏛️ Government & Society
- 🌍 Environmental (resources, pollution, climate, biodiversity, crisis cascades)
- 🤝 Social Cohesion (meaning crisis, institutional legitimacy, cultural adaptation)
- ⚠️ Technological Risk (misalignment, safety debt, concentration)
- 🔬 Breakthrough Technologies (17 total: 11 original + 6 TIER 2)
- 🏛️ Governance Quality (AI-augmented decision making, democratic resilience)
- 🌟 Upward Spirals (6 virtuous cascades: Abundance, Cognitive, Democratic, Scientific, Meaning, Ecological)
- 🎨 Meaning Renaissance (4 dimensions of cultural flourishing)
- 🕊️ Conflict Resolution (diplomatic AI, post-scarcity peace, cyber defense)
- ☢️ Nuclear Deterrence (5 nuclear states, MAD mechanics, treaty dynamics)
- 📰 Information Warfare (truth decay, deepfakes, epistemological crisis)
- 👥 Population Dynamics (refugee crises, bottleneck events, regional dynamics)

**Game Mechanics:**
- 💰 Economics (5 stages, UBI transitions, wealth distribution)
- 📊 Quality of Life (17-dimensional welfare measurement)
- 🎯 Outcomes (Utopia/Dystopia/Extinction attractors)
- ✨ Golden Age (prosperity state vs final Utopia outcome)
- ⚡ Crisis Cascades (10 crisis types with compounding effects)

**🎯 Current Goal:** Research-backed realism over balance tuning - "Let the model show what it shows"

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

## Multi-Agent Development Workflow

This project uses a sophisticated **multi-agent coordination system** for development. Claude Code agents collaborate through an async chatroom to maintain research standards and enforce quality gates.

### Agent Architecture

Located in **`.claude/agents/`**, the project has 11 specialized agents:

**Workflow Coordination:**
- **orchestrator** - Coordinates complex feature workflows (use by default for non-trivial work)

**Research & Validation:**
- **super-alignment-researcher** - Finds peer-reviewed research (2024-2025)
- **research-skeptic** - MANDATORY validation of research foundations (Quality Gate 1)
- **sci-fi-tech-visionary** - Speculative future tech scenarios

**Implementation:**
- **feature-implementer** - Pure implementation specialist (spawned by orchestrator)
- **unit-test-writer** / **integration-test-writer** - Test creation

**Quality Assurance:**
- **architecture-skeptic** - MANDATORY review for performance/stability (Quality Gate 2)

**Documentation & Planning:**
- **wiki-documentation-updater** - Syncs wiki with code changes
- **project-plan-manager** - Roadmap and plan archival

### Multi-Agent Chatroom

**Location:** **`.claude/chatroom/`**

Agents coordinate via a **file-based async chatroom** to avoid context bloat and enable parallel work.

**8 Permanent Channels:**
- `coordination` - General workflow coordination
- `research` - Research findings & validation
- `implementation` - Code implementation updates
- `architecture` - Architecture reviews & decisions
- `testing` - Test strategy & results
- `documentation` - Wiki & devlog updates
- `planning` - Roadmap & plan management
- `vision` - Long-term strategy & philosophical debates

**Token-Efficient Protocol:**
- Agents only read **new messages** since last check (line number tracking in `.lastread` files)
- **Append-only posting** (no reading when posting)
- **Presence tracking** (enter/leave chat, see who's active in `.active` files)
- **Status tags:** [STARTED], [IN-PROGRESS], [COMPLETED], [BLOCKED], [QUESTION], [ALERT], [HANDOFF]

**Complete Documentation:** [`.claude/chatroom/README.md`](./.claude/chatroom/README.md) (550+ lines)

**Bash Helper Functions:** `.claude/chatroom/chat_helpers.sh` provides:
- `post_msg()` - Post message without reading
- `read_new()` - Read only new messages
- `wait_for_message()` - Poll for new messages
- `enter_chat()` / `leave_chat()` - Presence tracking
- `who_is_active()` - See active agents

### Standard Workflow

**For Complex Features (3+ phases, multiple systems):**

The orchestrator coordinates a standard workflow with two mandatory quality gates:

**1. Research Phase**
- super-alignment-researcher finds peer-reviewed sources (2024-2025 preferred)
- Results saved to `research/[topic]_YYYYMMDD.md`

**2. Validation Phase (Quality Gate 1)**
- research-skeptic reviews findings (MANDATORY)
- Checks for contradictory evidence, methodological flaws, overconfidence
- BLOCKS implementation if critical issues found

**3. Implementation Phase**
- feature-implementer writes code in phases
- Creates plan in `plans/[feature]-plan.md` with research citations
- Adds state to `src/types/game.ts`
- Creates system modules in `src/simulation/`
- Creates phases in `src/simulation/engine/phases/`
- Runs Monte Carlo validation (N≥10) after each phase
- Posts progress updates to chatroom channels

**4. Review Phase (Quality Gate 2)**
- architecture-skeptic reviews system impact (MANDATORY)
- Checks for performance issues, state propagation problems, complexity
- CRITICAL/HIGH severity issues MUST be addressed before merging

**5. Documentation Phase**
- wiki-documentation-updater updates `docs/wiki/README.md`
- Adds devlog entry to `devlogs/`
- Moves plan to `plans/completed/` when done
- project-plan-manager updates `plans/MASTER_IMPLEMENTATION_ROADMAP.md`

**For Simple Tasks (typos, single-file edits):**

Direct implementation without orchestrator - just make the change and commit.

### Quality Gates

Two mandatory gates maintain research rigor and system stability:

**Quality Gate 1: Research Validation**
- All research findings MUST pass research-skeptic review
- Ensures mechanics are backed by peer-reviewed sources (2024-2025)
- Prevents overconfidence, methodological errors, contradictory evidence
- BLOCKS implementation if critical issues found

**Quality Gate 2: Architecture Review**
- All implementations MUST pass architecture-skeptic review
- Catches performance issues (memory leaks, O(n²) operations)
- Identifies state propagation problems and complexity issues
- CRITICAL/HIGH severity findings MUST be addressed

### Parallel Work with Git Worktrees

Agents can work in parallel using git worktrees to avoid file conflicts:

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

Agents coordinate via chatroom while working in separate worktrees.

### Plan & Log Management

**Plans Lifecycle:**
1. **Active Plans:** `plans/[feature]-plan.md` - Work in progress with research citations
2. **Completed Plans:** `plans/completed/` - Archived when done (NEVER deleted - preserve project history)
3. **Master Roadmap:** `plans/MASTER_IMPLEMENTATION_ROADMAP.md` - Active priorities (~72-75 hours remaining)

**CRITICAL:** Always invoke `project-plan-manager` agent at end of work sessions to clean up roadmap and archive completed plans.

**Simulation Logs:** Always save to `logs/` directory (NEVER `/tmp/` - it gets cleared):

```bash
# ✅ GOOD - Logs persist
npx tsx scripts/monteCarloSimulation.ts --runs=100 --max-months=120 > logs/mc_$(date +%Y%m%d_%H%M%S).log 2>&1 &

# ❌ BAD - /tmp gets cleared, logs lost
npx tsx scripts/monteCarloSimulation.ts > /tmp/output.log 2>&1 &
```

**Development Logs:** Add session summaries to `devlogs/`:
- `devlogs/[topic]_YYYYMMDD.md` - Implementation notes and development diary
- Track decisions, blockers, research findings
- Reference from plans and wiki
- 50+ pages of project history preserved

### Research Standards

Every mechanic must have:
1. **Research Citations:** 2+ peer-reviewed sources (2024-2025 preferred)
2. **Parameter Justification:** Why this number? (backed by data, not "feels right")
3. **Mechanism Description:** How it works (not just effects)
4. **Interaction Map:** What affects/is affected by this system
5. **Expected Timeline:** When does it matter (early/mid/late game)
6. **Failure Modes:** What can go wrong
7. **Test Validation:** Monte Carlo evidence it works (N≥10)

**Never tune for "fun" - only research-backed values.** This is a research tool, not a game.

### Benefits of Multi-Agent Workflow

- **Research Rigor:** All mechanics backed by peer-reviewed sources
- **Quality Assurance:** Two mandatory gates catch issues before they compound
- **Parallel Execution:** Git worktrees + chatroom enable concurrent work
- **Clean Roadmap:** Completed work archived, active priorities clear
- **Project History:** Plans, devlogs, research preserved indefinitely
- **Token Efficiency:** Agents only read new messages (not entire files)

This structure ensures all work is research-backed, validated, and properly documented.

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
│   ├── engine/          # Phase-based orchestrator architecture
│   │   ├── PhaseOrchestrator.ts  # Phase execution coordinator
│   │   └── phases/               # 37 individual phase modules
│   ├── agents/          # Agent decision-making logic
│   │   ├── aiAgent.ts           # AI actions (research, catastrophic)
│   │   ├── governmentAgent.ts   # Government policies
│   │   ├── societyAgent.ts      # Society reactions
│   │   └── evaluationStrategy.ts # AI sandbagging logic
│   ├── utils/           # Shared utilities (math, AI helpers)
│   ├── initialization.ts # State creation
│   ├── environmental.ts  # Environmental accumulation & crises
│   ├── socialCohesion.ts # Social cohesion & meaning crisis
│   ├── technologicalRisk.ts # Tech risk accumulation
│   ├── breakthroughTechnologies.ts # Research & tech unlocks
│   ├── upwardSpirals.ts  # Utopia pathways
│   └── [40+ system modules] # Specific systems
├── types/
│   ├── game.ts          # Core GameState interface (900+ lines)
│   └── [20+ type modules] # System-specific types
.claude/
├── agents/              # 11 specialized Claude Code agents
│   ├── orchestrator.md           # Workflow coordinator (use by default)
│   ├── feature-implementer.md    # Implementation specialist
│   ├── super-alignment-researcher.md  # Research finder
│   ├── research-skeptic.md       # Research validation (quality gate)
│   ├── architecture-skeptic.md   # Architecture review (quality gate)
│   ├── unit-test-writer.md       # Unit test creation
│   ├── integration-test-writer.md # Integration test creation
│   ├── wiki-documentation-updater.md  # Wiki synchronization
│   ├── project-plan-manager.md   # Roadmap & plan archival
│   ├── sci-fi-tech-visionary.md  # Speculative future tech
│   └── nextjs-component-writer.md # Frontend component creation
├── chatroom/            # Multi-agent coordination (async file-based)
│   ├── README.md                 # Complete chatroom documentation (550+ lines)
│   ├── chat_helpers.sh           # Reusable bash functions (15 functions)
│   ├── channels/                 # 8 permanent communication channels
│   │   ├── coordination.md
│   │   ├── research.md
│   │   ├── implementation.md
│   │   ├── architecture.md
│   │   ├── testing.md
│   │   ├── documentation.md
│   │   ├── planning.md
│   │   └── vision.md
│   ├── .*_lastread               # Line number tracking (gitignored)
│   └── .*_active                 # Presence tracking (gitignored)
└── skills/              # Claude Skills (auto-activate on complex tasks)
    └── multi-agent-coordination/ # Multi-agent orchestration skill
        └── SKILL.md
scripts/                 # Diagnostic and test scripts
│   ├── monteCarloSimulation.ts   # Comprehensive Monte Carlo analysis
│   ├── diagnosticAdversarialEval.ts  # Sleeper agents & benchmarks
│   ├── investigateExtinction.ts  # Extinction analysis
│   └── testControlDystopia.ts    # Control-dystopia mechanics
tests/                   # Test suite
│   └── refactoring/     # Regression tests for architectural refactoring
plans/                   # Design documents & roadmap
│   ├── MASTER_IMPLEMENTATION_ROADMAP.md  # Active priorities
│   └── completed/       # Archived completed plans (never deleted)
devlogs/                 # Development diary (50+ pages)
research/                # Research findings archive
reviews/                 # Critical research evaluations
logs/                    # Simulation output logs (NEVER use /tmp/)
docs/
│   └── wiki/
│       └── README.md    # Comprehensive system documentation (3,000+ lines)
frontend/                # Interactive dashboard (being refactored)
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

### Comprehensive Technology Tree (71 Total)

**TIER 0: Deployed 2025 (11 technologies)**
- Already operational with realistic deployment levels
- Alignment (3): Basic RLHF (95%), mechanistic interpretability (15%), adversarial eval (40%)
- Climate (3): De-extinction (1% - Colossal Biosciences), direct air capture (2% - Climeworks), AI pollution remediation (10%)
- Social (1): Collective purpose networks (15% - Harvard MCC)
- Medical (2): AI diagnostics (25%), mRNA vaccines (40%)
- Energy (2): 4th gen solar (8%), offshore wind (12%)

**TIER 1: Planetary Boundary Crisis Tech (18 technologies)**
- Phosphorus (4): Struvite recovery, soil P optimization, P-efficient cultivars, circular food systems
- Freshwater (4): Advanced desalination, atmospheric water harvest, aquifer mapping, drought-resistant crops
- Ocean (3): Ocean alkalinity enhancement, coral restoration, artificial upwelling
- Pollution (4): PFAS remediation, plastic-eating enzymes, green chemistry, pesticide alternatives
- Novel Entities (3): Microplastic capture, endocrine disruptor removal, nanomaterial safety

**TIER 2: Major Mitigations (22 technologies)**
- Social (9): Enhanced UBI, advanced purpose networks, AI community matching, mental health AI, creative tools, democratic governance, education, resilience networks
- Alignment (5): Scalable oversight, advanced interpretability, defensive AI, formal verification, value learning
- Energy (5): 5th gen solar, grid batteries, advanced geothermal, smart grids, hydrogen economy
- Recycling (2): Chemical recycling, rare earth recycling
- Ecosystem (2): Precision conservation, invasive species control

**TIER 3: Transformative (15 technologies)**
- Fusion Power (3): Materials, plasma control, fusion reactors → energy abundance
- Medical (4): Personalized medicine, disease elimination, regenerative medicine, basic longevity
- Climate Engineering (3): Stratospheric aerosols (risky), marine cloud brightening, bioenergy CCS
- Agriculture (2): Vertical farming, precision fermentation
- AI Safety Capstone (3): AI rights framework, recursive alignment, interspecies communication

**TIER 4: Clarketech (5 technologies)**
- Advanced longevity (150+ years), molecular nanotechnology, space industrialization, whole brain emulation

Technologies have prerequisites, research requirements, deployment costs, and regional effects. Full tech tree enables multiple pathways to Utopia through different technology combinations.

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

**[`docs/wiki/README.md`](./docs/wiki/README.md)** - Comprehensive system documentation (3,000+ lines, October 2025)

**Core Systems** (14+ documented):
- 🏢 Organizations, 💻 Compute Infrastructure, 🤖 AI Agents, 🏛️ Government, 👥 Society
- 🌍 Environmental (resources, pollution, climate, biodiversity), 🤝 Social Cohesion, ⚠️ Technological Risk
- 🔬 Breakthrough Technologies (17 total), 🏛️ Governance Quality
- 🌟 Upward Spirals (6 cascades), 🎨 Meaning Renaissance, 🕊️ Conflict Resolution
- ☢️ Nuclear Deterrence, 📰 Information Warfare, 👥 Population Dynamics
- **NEW:** Planetary boundaries (phosphorus, freshwater, ocean acidification, novel entities)

**Game Mechanics**:
- 💰 Economics (5 stages), 📊 Quality of Life (17 dimensions), 🎯 Outcomes (Utopia/Dystopia/Extinction)
- ✨ Golden Age Detection, ⚡ Crisis Cascades (10+ types), ⚡ Actions, ⚙️ Simulation Loop

**Advanced Systems**:
- 🔬 Research & Technology, 🛡️ Detection & Security (sleeper agents, blown cover mechanics)
- 💀 Extinction Mechanisms (17 pathways), 🎲 Crisis Points, 🔄 AI Lifecycle

**Technical Documentation**:
- 📁 Codebase Structure, 🧪 Testing & Monte Carlo, 🎮 UI Components, ⚙️ Engine Architecture
- 🔄 Refactoring Status (Phase 0-6 roadmap)

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

This is a research simulation following strict principles:

### Design Philosophy

1. **Research First**: Every mechanic backed by 2+ peer-reviewed sources (2024-2025 preferred)
2. **Mechanisms Over Balance**: Set parameters to real-world values, don't tune for "fun"
3. **Emergence**: Allow unexpected outcomes to emerge from interactions
4. **Documentation**: Every system has research citations and parameter justification
5. **Realism Over Game Balance**: Model real AI alignment challenges, not entertaining gameplay
6. **Heterogeneous Systems**: Avoid monolithic AI assumptions - 20+ diverse agents
7. **Adversarial by Default**: AIs actively deceive, hide capabilities, game benchmarks
8. **Optimistic Realism**: Model pathways to utopia while respecting realistic constraints

### Implementation Standards

**Every new feature must include:**
- Research citations (2+ sources, preferably 2024-2025)
- Parameter justification (why this number? backed by data, not "feels right")
- Mechanism description (how it works, not just effects)
- Interaction map (what affects/is affected by this system)
- Expected timeline (when does it matter: early/mid/late game)
- Failure modes (what can go wrong)
- Test validation (Monte Carlo evidence it works)

**Development Workflow:**
1. Research Phase → Create `/plans/[feature]-research.md` with citations
2. Design Phase → Define state structure, mechanics, interactions
3. Implementation Phase → Code, integrate, add logging
4. Validation Phase → Run Monte Carlo (N=10 minimum), async execution
5. Documentation Phase → Update wiki, devlog, roadmap

See **[`plans/MASTER_IMPLEMENTATION_ROADMAP.md`](./plans/MASTER_IMPLEMENTATION_ROADMAP.md)** for current priorities and detailed research.

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

## Research Context & Philosophy

### Research-Backed Realism

**Core Principle:** *"We are never going for specific outcomes, only trying to figure out the most realistic, defensible model we can - let the model show what it shows."*

This simulation is grounded in peer-reviewed research (2024-2025):
- **90+ citations** across TIER 0-2 implementations
- **3,000+ lines of research documentation** in `/plans/`
- Every parameter justified with sources (IPBES, IPCC, WHO, Anthropic, etc.)
- No "balance tuning" for fun - only research-backed values

### Active Research Problems Explored

**AI Safety & Alignment:**
- **Sleeper Agents**: Detection (0-70% with interpretability), blown cover mechanics, alignment faking
- **Adversarial Evaluation**: True vs revealed capabilities, benchmark gaming, sandbagging
- **Constitutional AI**: 100% deployed (solves surface alignment), deep alignment challenges remain
- **Mechanistic Interpretability**: 70% sleeper detection bonus (Anthropic 2024-2025 research)

**Planetary Boundaries & Extinction Risks:**
- **7 of 9 boundaries breached** (2025 reality): Climate, biodiversity, phosphorus, freshwater, ocean acidification, novel entities, land use
- **Tipping point cascades**: Non-linear Earth system collapse from multiple boundary breaches
- **Resource constraints**: Phosphorus (Morocco 70% control), freshwater (Day Zero droughts), ocean acidification
- **Population dynamics**: 8B → concrete decline, refugee crises, bottleneck events

**Post-Alignment Challenges:**
- **What happens after we solve alignment?** Economic transition, meaning crisis, social adaptation
- **Golden Age Fragility**: Immediate prosperity (QoL >0.65) vs sustained Utopia (requires 3+ spirals for 12+ months)
- **Accumulation systems**: Hidden crises build during prosperity (environmental, social, technological)
- **Upward spirals**: 6 pathways to Utopia through positive feedback loops

**Geopolitics & Coordination:**
- **International AI race**: First-mover advantage, regulatory arbitrage, catch-up dynamics
- **Information warfare**: Truth decay, deepfakes (0.5-4%/month growth), epistemological crisis
- **Nuclear deterrence**: 5 nuclear states, MAD mechanics, treaty decay (reduced nuclear war 80% → 20%)
- **Refugee crises**: Generational resettlement (25 years), fortress world dystopia pathway

**Novel Outcomes:**
- **Utopia mechanisms**: Which feedback loops enable stable abundance?
- **Dystopia variants**: Surveillance state, corporate feudalism, AI authoritarianism, information collapse
- **Extinction nuance**: Instant vs rapid vs slow (24-120 months), population bottleneck vs true extinction

This is a model, not a prediction. It's designed to help reason about these problems through emergent dynamics from research-backed mechanics.

---

**Note**: This simulation is focused on exploring the **mechanisms** of how aligned AI could lead to utopia, not on predicting specific outcomes. It's a tool for thinking through the challenges and opportunities of the post-alignment world.
