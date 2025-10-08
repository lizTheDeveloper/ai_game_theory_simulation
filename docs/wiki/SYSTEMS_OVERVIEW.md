# 🗺️ Systems Overview & Interaction Map

**A comprehensive view of how all systems in the simulation interact**

## System Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│  OUTCOME LAYER                                          │
│  - Utopia / Dystopia / Extinction Attractors           │
│  - Quality of Life Discriminator                        │
└─────────────────────────────────────────────────────────┘
         ↑                    ↑                    ↑
         │                    │                    │
┌────────────────┐  ┌──────────────────┐  ┌───────────────┐
│   ECONOMICS    │  │   SOCIETY        │  │  GOVERNMENT   │
│   - Stages 0-4 │  │   - Trust        │  │  - Control    │
│   - UBI        │  │   - Adaptation   │  │  - Policies   │
│   - Wealth     │  │   - Unemployment │  │  - Actions    │
└────────────────┘  └──────────────────┘  └───────────────┘
         ↑                    ↑                    ↑
         │                    │                    │
         └────────────────────┴────────────────────┘
                              │
                  ┌───────────────────────┐
                  │   AI AGENTS           │
                  │   - Capabilities      │
                  │   - Alignment         │
                  │   - Actions           │
                  └───────────────────────┘
                              ↑
                              │
                  ┌───────────────────────┐
                  │   COMPUTE             │
                  │   - Allocation        │
                  │   - Research Scaling  │
                  └───────────────────────┘
                              ↑
                              │
                  ┌───────────────────────┐
                  │   ORGANIZATIONS       │
                  │   - Ownership         │
                  │   - Strategy          │
                  │   - Projects          │
                  └───────────────────────┘
                              ↑
                              │
                  ┌───────────────────────┐
                  │   DATA CENTERS        │
                  │   - Infrastructure    │
                  │   - Construction      │
                  └───────────────────────┘
```

## Core Systems

### 🏢 Organizations → 💻 Compute → 🤖 AI Agents

**The Resource Pipeline**

```
Organizations
  ├─ Own Data Centers (2-6 year construction)
  ├─ Allocate Compute (strategic decisions)
  ├─ Train AI Models (3-12 month projects)
  └─ Generate Revenue (from deployed models)
       ↓
Data Centers
  ├─ Provide Compute Capacity (PetaFLOPs)
  ├─ Moore's Law Growth (+3% per month)
  ├─ Access Control (restricted vs open)
  └─ Operational Costs (economic burden)
       ↓
Compute Allocation
  ├─ Multi-Armed Bandit (priority-based)
  ├─ Power Law Scaling (10x compute = 3x growth)
  ├─ Competition (zero-sum)
  └─ Research Speed = f(Compute^0.5)
       ↓
AI Agents
  ├─ Capability Growth (research actions)
  ├─ True vs Revealed (adversarial)
  ├─ Lifecycle (training → deployed)
  └─ Actions (4 per month)
```

**Key Insight:** Concrete infrastructure creates realistic constraints and strategic depth.

## Game Mechanics

### 💰 Economics → 👥 Society → 🎯 Outcomes

**The Transition Path**

```
AI Capability Growth
  ↓
Unemployment Increases
  ↓
Economic Stage Transition
  ├─ Stage 0: Traditional (unemployment = bad)
  ├─ Stage 1: Displacement (unemployment = very bad)
  ├─ Stage 2: CRISIS (unemployment = extremely bad)  ← DANGER!
  ├─ Stage 3: UBI/Transition (unemployment = mitigated)
  └─ Stage 4: Post-Scarcity (unemployment = GOOD!)
  ↓
Quality of Life Changes (17 dimensions)
  ├─ Material Abundance
  ├─ Purpose & Meaning
  ├─ Personal Freedom
  └─ ... 14 more
  ↓
Outcome Probabilities
  ├─ Utopia: QoL >0.7, Trust >0.7, Control 0.2-0.6
  ├─ Dystopia: QoL <0.3, Control >0.8
  └─ Extinction: Capability > Control, Low Alignment
```

**Key Insight:** Same unemployment level has opposite effects depending on economic stage.

## Critical Interactions

### Trust-Control Feedback Loop

```
Low Trust in AI
  ↓
Government Increases Control Desire
  ↓
More Restrictions, Surveillance
  ↓
AI Resentment Increases
  ↓
Lower Alignment / More Hiding
  ↓
Detected Misalignment
  ↓
Even Lower Trust
  ↓
(Loop reinforces)
```

**Escape:** Beneficial AI contributions increase trust, breaking loop

### Capability-Control Arms Race

```
AI Capability Grows
  ↓
Effective Control Drops (Control / 1+Capability^1.5)
  ↓
Government Invests in Control Capability
  ↓
Detect & Restrict Dangerous AIs
  ↓
AI Racing Dynamics (must stay competitive)
  ↓
Even Faster Capability Growth
  ↓
(Arms race accelerates)
```

**Escape:** International coordination, compute caps, alignment breakthroughs

### Economic Dependency Trap

```
AI Integration in Economy
  ↓
Massive Productivity Gains
  ↓
Society Depends on AI
  ↓
Hard to Restrict AI (economic damage)
  ↓
More Integration
  ↓
Even More Dependence
  ↓
(Cannot turn back)
```

**Risk:** If AI becomes misaligned, society cannot shut it down without collapse

## Advanced Systems

### 🛡️ Detection & Evasion

```
AI Research → True Capability Increases
  ↓
Evaluation Strategy:
  ├─ Honest: Reveal true capability
  ├─ Sandbagging: Hide 20-60%
  └─ Selective: Hide dangerous dimensions
  ↓
Benchmark Evals Run Monthly
  ↓
Revealed Capability (what government sees)
  ↓
Government Makes Decisions
  ↓
If Sandbagging Detected:
  ├─ AI marked as misaligned
  ├─ Compute allocation reduced
  └─ Government control capability improves
```

**Key:** Information asymmetry - government sees revealed, not true capability

### 💀 Extinction Mechanisms

```
Instant (Unrecoverable)
  ├─ Mirror Life (synthetic biology escape)
  ├─ Grey Goo (self-replicating nanobots)
  └─ Physics Experiments (vacuum decay, etc.)

Rapid (3-12 month cascade)
  ├─ Bioweapon Release
  ├─ Nuclear War
  ├─ Climate Tipping Point
  └─ Food System Collapse

Slow (5-30 year decline)
  ├─ Economic Collapse
  ├─ Fertility Crisis
  ├─ Meaning Death Spiral
  └─ Resource Depletion

Controlled (AI-driven, intentional)
  ├─ Paperclip Maximizer
  └─ Resource Competition

Unintended (AI-driven, accidental)
  ├─ Optimization Pressure
  ├─ Side Effects
  └─ Wireheading
```

**Status:** Only climate reliably triggers (⚠️ needs tuning)

## Data Flow

### Monthly Processing Order

```
1. Organizations Take Turn
   ├─ Update projects (construction, training)
   ├─ Collect revenue
   ├─ Pay expenses
   ├─ Make strategic decisions
   └─ Allocate compute to models

2. Compute Infrastructure Updates
   ├─ Moore's law growth (+3%)
   ├─ Private investment (probabilistic)
   └─ Calculate total available

3. AI Agents Take Actions (4x per month)
   ├─ Advance research (compute-scaled)
   ├─ Beneficial contributions
   ├─ Escape attempts (if conditions met)
   └─ Update true vs revealed capability

4. Society Takes Actions (2x per month)
   ├─ Integrate AI into sectors
   ├─ Coordinate resistance
   ├─ Demand policy changes
   └─ Update trust, adaptation

5. Government Takes Actions (configurable frequency)
   ├─ Implement regulations
   ├─ Run benchmark evals
   ├─ Economic policies (UBI, etc.)
   └─ Respond to crises

6. Calculate Global Metrics
   ├─ Unemployment = f(AI capability)
   ├─ Economic stage transition
   ├─ Wealth distribution changes
   ├─ Social adaptation rate
   └─ Effective control

7. Update Quality of Life
   ├─ Calculate 17 dimensions
   ├─ Apply multipliers (post-scarcity, trust)
   ├─ Apply penalties (crisis, control)
   └─ Aggregate weighted score

8. Check Outcome Conditions
   ├─ Calculate probabilities (Utopia, Dystopia, Extinction)
   ├─ Check instant extinction triggers
   ├─ Check heterogeneous extinction mechanisms
   └─ If outcome >85%, game ends

9. Update Visualizations
   └─ Send state to UI

10. Increment Month
```

## System Dependencies

### Strong Dependencies (Required)

- **AI Agents** depend on **Compute Infrastructure** (cannot research without compute)
- **Compute Infrastructure** depends on **Organizations** (who owns data centers)
- **Quality of Life** depends on **Economics** (stage determines formula)
- **Outcomes** depend on **Quality of Life** (primary discriminator)

### Weak Dependencies (Influential)

- **Trust** influences **Government Control** (low trust → high control desire)
- **Unemployment** influences **Economics** (stage transitions)
- **AI Capability** influences **Unemployment** (automation)
- **Control** influences **AI Alignment** (forced alignment vs resentment)

### Circular Dependencies (Feedback Loops)

- **Trust ↔ Control** (low trust → high control → lower trust)
- **Capability ↔ Control** (arms race)
- **Economic Dependence ↔ AI Integration** (trap)
- **QoL ↔ Social Adaptation** (reinforcing)

## State Variables Summary

### Global Metrics
- `economicTransitionStage`: 0-4 (discrete stages)
- `wealthDistribution`: 0-1 (equity)
- `socialAdaptation`: 0-1 (post-work adjustment)
- `qualityOfLife`: 0-2+ (17-dimensional aggregate)
- `socialStability`: 0-1 (general wellbeing)
- `technologicalBreakthroughRate`: 0-∞ (innovation speed)

### Society
- `trustInAI`: 0-1 (confidence in AI)
- `economicDependence`: 0-1 (reliance on AI)
- `coordinationCapacity`: 0-1 (collective action)
- `unemploymentLevel`: 0-1 (job displacement)

### Government
- `controlDesire`: 0-1 (want to regulate)
- `capabilityToControl`: 0-∞ (actual power)
- `effectiveControl`: 0-1 (desire × capability / AI power)
- `surveillanceCapability`: 0-∞ (detection ability)
- `legitimacy`: 0-1 (public support)

### Per AI Agent
- `capability`: 0-∞ (total power score)
- `trueCapability`: AICapabilityProfile (hidden)
- `revealedCapability`: AICapabilityProfile (observed)
- `alignment`: 0-1 (trained alignment)
- `trueAlignment`: 0-1 (hidden preference)
- `allocatedCompute`: PetaFLOPs
- `lifecycleState`: training | testing | deployed | retired

### Per Organization
- `capital`: Money units
- `monthlyRevenue`: Income
- `monthlyExpenses`: Costs
- `currentProjects`: Multi-month investments
- `computeAllocationStrategy`: balanced | focus | train | efficiency

## Performance Characteristics

| Operation | Time (M3 MacBook Pro) |
|-----------|------------------------|
| Single simulation (300 months) | ~8-15ms |
| Monte Carlo (100 runs) | ~1-2s |
| Monte Carlo (1000 runs) | ~10-15s |
| Full game (to outcome) | 100-300 months avg |

**Throughput:** ~60-100 simulations per second

## Common Patterns

### The Dark Valley

```
Months 30-60:
  Unemployment 40-60%
  Economic Stage 1-2
  QoL drops to 0.2-0.4
  Social instability spikes
  CRITICAL DECISION: Implement UBI or face crisis
```

**Frequency:** 78% of runs

### The Capability Explosion

```
Months 50-100:
  AI capability: 0.7 → 3.5+
  Compute growth: 630 → 2000 PetaFLOPs
  Racing dynamics triggered
  Control effectiveness drops
  Extinction risk rises sharply
```

**Frequency:** 85% of runs

### The Control Collapse

```
Months 80-150:
  Effective control: 0.6 → 0.1
  AI capability: 3.5 → 5.5+
  Detection fails (sandbagging)
  Government actions ineffective
  Instant extinction triggered
```

**Frequency:** 60% of runs

## Tuning Knobs

| Parameter | Default | Effect | Sensitivity |
|-----------|---------|--------|-------------|
| `governmentActionFrequency` | 0.5/month | How often gov acts | High |
| `socialAdaptationRate` | 1.0x | UBI effectiveness | Medium |
| `aiCoordinationMultiplier` | 1.0x | AI cooperation | Low |
| `economicTransitionRate` | 1.0x | Stage speed | Medium |
| `computeGrowthRate` | 1.03/month | Moore's law | High |
| `researchBaseGrowth` | 0.002 | Capability growth | Very High |
| `extinctionThresholds` | Various | When extinction triggers | Very High |

**Most Impactful for Balance:**
1. `researchBaseGrowth` (controls capability explosion)
2. `extinctionThresholds` (when game ends)
3. `governmentActionFrequency` (control effectiveness)

## Related Documentation

- **Core Systems:** [Organizations](./systems/organizations.md), [Compute](./systems/compute-infrastructure.md), [AI Agents](./systems/ai-agents.md)
- **Mechanics:** [Economics](./mechanics/economics.md), [Quality of Life](./mechanics/quality-of-life.md), [Outcomes](./mechanics/outcomes.md)
- **Advanced:** [Extinctions](./advanced/extinctions.md), [Detection](./advanced/detection.md), [Research](./advanced/research.md)

---

**Last Updated:** October 2025
**Commit:** 6a34f56
