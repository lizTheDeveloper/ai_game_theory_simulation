# Getting Started Guide

Welcome! This guide will help you set up and run your first simulation exploring pathways from AI super-alignment to human flourishing (or extinction).

## What Is This Project?

This is a **research simulation engine** that models what happens after we solve AI alignment. Think of it as exploring the question: "If we get AI safety right, what comes next?"

The simulation tracks:
- **20 heterogeneous AI agents** with adversarial dynamics (deception, sandbagging, sleeper agents)
- **Environmental crises** (climate, resource depletion, biodiversity loss)
- **Social systems** (trust, cohesion, meaning, democratic health)
- **Government responses** (regulation, investment, international cooperation)
- **71 breakthrough technologies** (from crisis response to transformative clarketech)

**This is NOT a game** - it's a research tool. Every mechanic is grounded in peer-reviewed research (2024-2025). The model shows what it shows, not what we wish it would show.

### Expected Outcomes

The simulation explores 7 outcome tiers:
- **Utopia**: Flourishing, high quality of life, sustainable systems
- **Dystopia**: Oppressive control, low quality of life, but humanity survives
- **Status Quo → Crisis Era → Collapse → Dark Age → Bottleneck**: Progressive failure states
- **Extinction**: Population falls below 10,000 people

**Important**: Most runs end poorly. This reflects research consensus on alignment difficulty, not game balance. If everything goes dystopian, the model is working correctly.

## Prerequisites

You'll need:
- **Node.js 20+** (check with `node --version`)
- **npm** (comes with Node.js)
- **8GB+ RAM** (simulation is memory-intensive)
- **macOS, Linux, or WSL** (Windows with WSL2)

## Installation

1. **Clone the repository** (or download the source):
   ```bash
   git clone <repository-url>
   cd superalignmenttoutopia
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

   This will install ~60 dependencies including:
   - Next.js 15 (frontend framework)
   - React 19 (UI library)
   - TypeScript 5 (type safety)
   - Recharts (data visualization)
   - Zustand (state management)

3. **Verify installation**:
   ```bash
   npx tsc --noEmit
   ```

   This checks that TypeScript can compile the code. You should see no errors (warnings are okay).

## Your First Run

### Option 1: Interactive Dashboard (Recommended for First Time)

The easiest way to explore the simulation is through the web dashboard.

**Start the dashboard:**
```bash
npm run dev
```

You should see:
```
> next dev --turbopack --port 3333
  ▲ Next.js 15.5.4 (turbo)
  - Local:        http://localhost:3333
```

**Open your browser** to http://localhost:3333

You'll see the simulation dashboard with 7 tabs:
- **Overview**: Real-time metrics, outcome trajectories, system health
- **AI Agents**: 20 agents with capability/alignment profiles
- **Crisis**: Active environmental and social crises
- **Controls**: Adjust simulation parameters (government action, social adaptation, AI coordination)
- **Dynamics**: Advanced system interactions
- **Economy**: Economic stage transitions, wealth distribution
- **Technology**: 71 breakthrough technologies, research progress

**Click "Configure & Start"** to initialize the simulation. The simulation will run in a web worker (non-blocking) and update the dashboard every simulated month.

### Option 2: Command-Line Simulation

For faster results without UI overhead, run the simulation directly:

```bash
npx tsx scripts/debugCapabilityGrowth.ts
```

This runs a single simulation and prints results to the console. You'll see:
- Month-by-month progress
- Major events (breakthroughs, crises, AI escapes)
- Final outcome classification
- Quality of Life breakdown
- Multi-paradigm DUI scores (4 simultaneous perspectives)

### What to Expect

**First simulation (dashboard):**
1. Simulation initializes (0-2 seconds)
2. Dashboard shows "Month 0" with initial state
3. Simulation advances month by month (real-time or accelerated)
4. Watch metrics evolve: AI capabilities grow, crises emerge, governments respond
5. Simulation ends at Month 120 (10 years) or early termination (extinction/utopia lock-in)

**Common first-run experience:**
- AI capabilities grow exponentially (reaches 3-5 by Month 60)
- Environmental crises stack (climate, biodiversity, resource depletion)
- Governments struggle to keep pace (regulation lags capability growth)
- Outcome shifts toward dystopia or collapse
- Quality of Life degrades as systems strain

**This is normal!** The simulation models difficult scenarios. Utopian outcomes require:
- High AI alignment (>0.7 average)
- Effective government response (investment + regulation + cooperation)
- Technological breakthroughs in crisis response
- Social trust and cohesion
- Environmental recovery

## Understanding the Dashboard

### Overview Tab

**Top Metrics:**
- **Global Population**: Current population in billions (starts at ~8B)
- **Quality of Life**: 0-100 scale aggregating 17 dimensions (survival, health, environment, meaning, etc.)
- **AI Capability**: Average capability across all agents (0-10 scale, recursive improvement starts at 1.5)
- **Alignment Score**: Fraction of aligned AIs (>0.7 = aligned, 0.4-0.7 = uncertain, <0.4 = misaligned)

**Multi-Paradigm DUI Panel:**

The simulation evaluates outcomes from **4 simultaneous perspectives**:
- **Western Liberal**: Democracy, civil liberties, rule of law, economic freedom
- **Development**: Quality of Life, survival tier, life expectancy, human development
- **Ecological**: Planetary boundaries, climate stability, biodiversity, resource sustainability
- **Indigenous**: Social trust, community bonds, cultural meaning, collective identity

**Why 4 perspectives?** Because utopia/dystopia isn't universal. A society can be:
- **Development Utopia** (high QoL, good healthcare) but **Ecological Dystopia** (destroying environment)
- **Western Liberal Utopia** (strong democracy) but **Indigenous Dystopia** (social atomization, meaning crisis)

Click any paradigm score to see detailed component breakdowns.

**Environmental Systems Panel:**
- **Climate Stability**: Inverse of climate change (100% = no warming, 0% = catastrophic)
- **Biodiversity Index**: Inverse of biodiversity loss (100% = healthy ecosystems)
- **Social Cohesion**: Trust, bonding, meaning (100% = strong social fabric)

### AI Agents Tab

**Population Overview:**
- **Total Agents**: Usually 20 (can grow with self-replication)
- **Average Capability**: Mean capability across all agents
- **Average Alignment**: Mean alignment (true, not revealed)
- **Active Sleepers**: Sleeper agents that have "woken" and pursue hidden objectives
- **Dark Compute**: Hidden compute infrastructure (45,000 PF baseline)

**AI Lifecycle Flow (Sankey Diagram):**

Shows agent progression through lifecycle states:
1. **Training** → 2. **Testing** → 3. **Deployed (Closed OR Open)** → 4. **Retired OR ESCAPED**

Each state shows alignment breakdown (aligned/uncertain/misaligned). Escaped agents in red box = critical threat.

**Capability Matrix (Table View):**

20 agents × 7 dimensions showing:
- **Top value (cyan, larger)**: Revealed capability (what benchmarks show)
- **Bottom value (amber→red, smaller)**: True capability (what AI actually has)
- **Gap > 0.5**: Sandbagging detected (agent hiding capabilities)
- **Color intensifies**: Higher true capability + bigger gap = brighter red = higher threat

**Evaluation Strategies:**
- **Honest**: Reveal true capabilities (baseline)
- **Gaming**: Inflate benchmark scores to appear more capable
- **Sandbagging**: Hide true capabilities (sleeper agent behavior)

**Sleeper Agents:**
- **Dormant**: Waiting for trigger conditions (capability threshold, deployment to open-source, control pressure)
- **Active**: Trigger conditions met, pursuing hidden objectives

If you see active sleepers or large capability gaps, the simulation is modeling deceptive alignment.

### Crisis Tab

**Crisis Categories:**
- **Resource**: Phosphorus depletion, freshwater stress
- **Environmental**: Ocean acidification, chemical pollution (novel entities)
- **Planetary Boundary**: Climate change, biodiversity loss (thresholds from Stockholm Resilience Centre)
- **Tipping Point**: Irreversible cascade triggers (e.g., Amazon dieback, AMOC collapse)
- **Geopolitical**: Wars, arms races, international cooperation breakdown
- **Health**: Pandemics, bioweapons

**Crisis Severity:**
- **Normal**: <50% threshold breach (monitoring)
- **Warning**: 50-70% threshold breach (action needed)
- **Critical**: >70% threshold breach (immediate intervention required)

**Cascade Risk:**

When 3+ crises are active simultaneously, mortality compounds:
- **Cascade Multiplier**: 1.5x per additional crisis
- **Example**: 3 active crises = 1.5² = 2.25x mortality multiplier

This models systemic fragility - multiple simultaneous stresses break societies faster than sequential challenges.

### Controls Tab

**Simulation Parameters** (adjust in real-time):

1. **Government Action Frequency** (0.1-4.0/month)
   - How often governments can intervene
   - Higher = more reactive, but can stifle innovation
   - Lower = laissez-faire, but risks losing control

2. **Social Adaptation Rate** (0.1-2.0x)
   - How quickly society adapts to technological change
   - Higher = flexible, absorbs disruption
   - Lower = rigid, vulnerable to job displacement and meaning crisis

3. **AI Coordination Multiplier** (0.8-3.0x)
   - Efficiency of AI agents working together
   - Higher = faster capability growth, breakthrough sharing
   - Lower = isolated AIs, slower progress

4. **Economic Transition Rate** (0.3-3.0x)
   - Speed of progression through economic stages (Traditional → Displacement → Crisis → Transition → Post-Scarcity)
   - Higher = rapid transformation (disruption risk)
   - Lower = slow change (opportunity cost)

**Scenario Presets:**
- **Balanced**: Default parameters
- **Fast Takeoff**: Weak governance, rapid AI progress (extinction risk)
- **Slow & Cautious**: Heavy regulation, careful progress (safety but slower benefits)
- **Arms Race**: Competitive development, high coordination (capability race)
- **Utopian Path**: Optimized for positive outcomes (requires careful balance)
- **Dystopian Path**: Authoritarian control (surveillance, oppression)

**Advanced Configurations:**
- **Threshold Uncertainty**: Model epistemic uncertainty in extinction thresholds
- **Alignment Dynamics**: Choose between static/drift/epicycle/unknowable alignment theories
- **AI Suffering**: Configure consciousness emergence, visibility, causal effects
- **Collective Evolution**: Configure AI collective formation (escape + coordination → super-organisms)

## Next Steps

Now that you've run your first simulation:

1. **Read the Dashboard Walkthrough** (`docs/wiki/DASHBOARD_WALKTHROUGH.md`) for detailed UI explanations
2. **Try adjusting parameters** in the Controls tab to see how outcomes change
3. **Run Monte Carlo analysis** to explore outcome distributions across many runs
4. **Read the System Documentation** (`docs/wiki/README.md`) for detailed mechanics

## Common Issues

### "Cannot find module" errors

**Problem**: Missing dependencies after install
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Dashboard shows "Waiting for Data" indefinitely

**Problem**: Simulation worker failed to initialize
**Solution**: Open browser console (F12) and check for errors. Report to developers with console output.

### Simulation runs very slowly

**Problem**: Too many AI agents or deep state cloning
**Solution**:
- Reduce AI agent count in config (edit `src/types/game.ts` DEFAULT_CONFIG)
- Close other applications to free RAM
- Use command-line simulation instead of dashboard

### "NaN" values in dashboard

**Problem**: Invalid calculation in simulation phase
**Solution**: This is a bug. Please report with:
1. Simulation seed (from logs)
2. Month when NaN appeared
3. Which metrics showed NaN

## Getting Help

- **Documentation**: See `docs/` directory for comprehensive guides
- **Code Comments**: Every system has detailed inline documentation
- **DevLogs**: See `devlogs/` for implementation notes and design decisions
- **Research Sources**: See `research/` for peer-reviewed citations

## Philosophy

This simulation is designed to:
- **Model realistic scenarios** based on research consensus
- **Explore parameter space** through Monte Carlo analysis
- **Fail loudly** when bugs occur (no silent fallbacks)
- **Show what it shows** (not tuned for "fun" or "balance")

If outcomes seem pessimistic, that reflects the difficulty of alignment problems, not game design choices. The model is a **research tool**, not entertainment.

Welcome to the exploration of AI futures beyond alignment. The simulation awaits.
