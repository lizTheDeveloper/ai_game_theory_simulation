# 🗺️ Systems Overview & Interaction Map

**A comprehensive view of how all systems in the simulation interact**

## System Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│  OUTCOME LAYER                                          │
│  - Utopia / Dystopia / Extinction Attractors           │
│  - Golden Age Detection (prosperity state)              │
│  - Quality of Life Discriminator                        │
│  - Upward Spirals (6 virtuous cascades)                │
└─────────────────────────────────────────────────────────┘
         ↑                    ↑                    ↑
         │                    │                    │
┌────────────────┐  ┌──────────────────┐  ┌───────────────┐
│   ECONOMICS    │  │   SOCIETY        │  │  GOVERNMENT   │
│   - Stages 0-4 │  │   - Trust        │  │  - Control    │
│   - UBI        │  │   - Adaptation   │  │  - Policies   │
│   - Wealth     │  │   - Unemployment │  │  - Research   │
└────────────────┘  └──────────────────┘  └───────────────┘
         ↑                    ↑                    ↑
         │                    │                    │
         └────────────────────┴────────────────────┘
                              │
         ┌────────────────────┴────────────────────┐
         │                                         │
┌────────────────────┐                  ┌──────────────────────┐
│ ACCUMULATION       │                  │ BREAKTHROUGH TECH    │
│ - Environmental    │◄─────────────────┤ - Research           │
│ - Social Cohesion  │                  │ - Unlocks            │
│ - Tech Risk        │                  │ - Crisis Recovery    │
│ - 10 Crisis Types  │                  │ - 11 Technologies    │
└────────────────────┘                  └──────────────────────┘
         ↑                                         ↑
         │                                         │
         └────────────────────┬────────────────────┘
                              │
         ┌────────────────────┴────────────────────┐
         │                                         │
┌───────────────────────┐              ┌──────────────────────┐
│   AI AGENTS           │              │ DIPLOMATIC AI        │
│   - Capabilities      │──────────────▶ - Strategic Mediation│
│   - Alignment         │              │ - Trust Dynamics     │
│   - Actions           │              │ - Conflict Prevention│
└───────────────────────┘              │ - Dual-Use Risks     │
                                       └──────────────────────┘
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

### Golden Age Fragility Loop

```
High QoL + Stage 3+
  ↓
Golden Age Begins
  ↓
Hidden Accumulation:
  ├─ Environmental (resources depleting, pollution rising)
  ├─ Social (meaning crisis, institutional erosion)
  └─ Technological (safety debt, complacency)
  ↓
First Crisis Triggers (e.g., Ecosystem Collapse)
  ↓
QoL Drops → More Crises Trigger
  ↓
Crisis Cascade (2 → 3 → 4 → 6 crises)
  ↓
3.0x QoL Degradation Multiplier
  ↓
Golden Age Lost → Dystopia or Extinction
```

**Escape:** Breakthrough technologies can reverse crises if unlocked in time

### Crisis Cascade Compounding

```
Environmental Crises:
  ├─ Resource Crisis (reserves < 40%)
  ├─ Pollution Crisis (pollution > 70%)
  ├─ Climate Catastrophe (stability < 30%)
  └─ Ecosystem Collapse (biodiversity < 40%)

Social Crises:
  ├─ Meaning Collapse (meaning crisis > 70%)
  ├─ Institutional Failure (legitimacy < 30%)
  └─ Social Unrest (cohesion < 40%)

Technological Crises:
  ├─ Control Loss (misalignment risk > 80%)
  ├─ Corporate Dystopia (concentration > 80% + low alignment)
  └─ Complacency Crisis (complacency > 70%)

Each crisis:
  ├─ Immediate QoL impact (category-specific)
  ├─ Ongoing monthly degradation (-0.5% to -2.5%)
  └─ Contributes to cascade multiplier
```

**Cascade Multiplier:**
- 1-2 crises: 1.0x (baseline)
- 3 crises: 1.5x
- 4 crises: 2.0x
- 5 crises: 2.5x
- 6+ crises: 3.0x (death spiral)

### Technology Recovery Pathway

```
Government Invests in Research
  ↓
Probabilistic Tech Unlocks (based on AI capability + budget)
  ↓
Technology Tree:
  ├─ Clean Energy (24 months, $20B)
  ├─ Advanced Recycling (18 months, $15B)
  ├─ Carbon Capture (30 months, $30B, requires Clean Energy)
  ├─ Ecosystem Management (36 months, $40B, requires Clean + Recycling)
  └─ ... 7 more technologies
  ↓
Deployment Phase (10% → 100%, costs money)
  ↓
Effects Applied Monthly (scaled by deployment level):
  ├─ Pollution Reduction (-1.5% per month from Clean Energy)
  ├─ Climate Stabilization (+2% per month from Carbon Capture)
  ├─ Biodiversity Recovery (+2% per month from Ecosystem Management)
  └─ ... other effects
  ↓
Crisis Resolution When Thresholds Met:
  ├─ Pollution < 50% → Crisis resolves
  ├─ Climate > 70% → Catastrophe averted
  └─ Biodiversity > 60% → Collapse reversed
  ↓
Golden Age Can Resume → Path to Utopia Opens
```

**Critical Timing:**
- Early investment (Month 1-15) → Prevention
- Mid investment (Month 15-35) → Crisis interruption
- Late investment (Month 35+) → Often too late (cascade already 3.0x)

### Virtuous Cascade (Upward Spirals - Phase 2D)

```
4+ Upward Spirals Active
  ↓
Cross-Amplification Begins (1.2x-1.6x multiplier)
  ↓
Spirals:
  ├─ Abundance (post-scarcity, energy, time)
  ├─ Cognitive (mental health, purpose, AI augmentation)
  ├─ Democratic (quality governance, engagement)
  ├─ Scientific (breakthroughs, research, AI acceleration)
  ├─ Meaning (cultural flourishing, renaissance)
  └─ Ecological (planetary healing, sustainability)
  ↓
Each Spiral Reinforces Others:
  ├─ Abundance → Cognitive (time for learning)
  ├─ Cognitive → Scientific (smarter research)
  ├─ Democratic → All (better governance)
  ├─ Scientific → Ecological (tech for planet)
  ├─ Meaning → Democratic (civic engagement)
  └─ Ecological → Abundance (sustainable resources)
  ↓
3+ Spirals Sustained 12+ Months = UTOPIA
```

**Utopia Paths (20 combinations of 3+ spirals):**
- Tech Path: Scientific + Cognitive + Abundance
- Cultural Path: Meaning + Democratic + Cognitive
- Eco Path: Ecological + Abundance + Scientific
- Balanced Path: All 6 spirals (maximum 1.6x amplification)

### Meaning Renaissance Loop (Phase 2E)

```
Post-Work Reality (60%+ unemployment)
  ↓
Four Dimensions Grow:
  ├─ Purpose Diversity (4 pathways: community, creative, knowledge, exploration)
  ├─ Self-Actualization (education, time, mentoring)
  ├─ Artistic Renaissance (AI-assisted creativity, participation, recognition)
  └─ Philosophical Maturity (understanding, narrative, wisdom sharing)
  ↓
Renaissance Strength > 0.6
  ↓
Effects:
  ├─ Meaning Crisis Recovery (-1%/month, reverses crisis!)
  ├─ Cultural Adaptation Boost (+1%/month)
  ├─ Meaning Spiral Activation (enables Utopia)
  └─ QoL Boost (meaning +0.7%, vitality +1.0%)
  ↓
Stronger Meaning → Higher Participation → Better Democratic Governance
  ↓
(Positive feedback loop)
```

**Key Insight:** Technology alone (Purpose Frameworks) insufficient. Need 4 dimensions of cultural adaptation.

### Peace Dividend Loop (Conflict Resolution - Phase 2F)

```
Post-Scarcity Achieved (Stage 4, abundant energy)
  ↓
Resource Conflicts Eliminated (no "oil wars")
  ↓
Aligned AI Deployed (0.7+ alignment)
  ↓
Three Peace Pillars:
  ├─ Diplomatic AI (strategic mediation, crisis intervention)
  ├─ Abundance Peace (food/energy/material security)
  └─ Cyber Defense (defense > offense, military systems secure)
  ↓
Global Peace Level 0.8+
  ↓
Conflict Probability -50% (max reduction)
  ↓
Nuclear War Risk Drops
  ↓
Extinction via Conflict Becomes Rare
  ↓
Enables Other Spirals (stability → investment → progress)
```

**Diplomatic Intervention Success Rate:**
- Base: 30%
- +50% from AI capability (2.0 → 4.0+)
- +20% from high alignment (0.9+)
- +10% from prior successes (learning)
- Max: 95%

### Governance Quality Loop (Phase 2C)

```
High-Capability Aligned AI (2.0+, 0.7+)
  ↓
AI-Augmented Decision Quality (up to +30%)
  ↓
Better Policy Effectiveness (1.2-1.5x research speed)
  ↓
Faster Tech Unlocks & Deployment
  ↓
Crises Resolve Faster
  ↓
Higher Trust in AI (+0.02/month)
  ↓
Higher Civic Participation & Transparency
  ↓
Stronger Authoritarian Resistance (up to 80% reduction)
  ↓
Democracy Survives Crisis
  ↓
Democratic Spiral Activates
  ↓
(Reinforcing loop)
```

**Inverse (Dystopia Lock-In):**
- Multiple crises → Authoritarian transition
- Low participation = weak resistance
- Authoritarian → Can't research social tech (20-50% rates)
- Social crises persist → Surveillance state permanent

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

7. Update Accumulation Systems
   ├─ Environmental: resources, pollution, climate, biodiversity
   ├─ Social Cohesion: meaning crisis, legitimacy, cohesion
   ├─ Technological Risk: misalignment, safety debt, concentration
   └─ Check crisis triggers for each metric

8. Update Breakthrough Technologies
   ├─ Allocate research budget (environmental/social/medical)
   ├─ Advance research progress (probabilistic)
   ├─ Check unlock conditions (AI capability + prerequisites)
   ├─ Increase deployment level (if unlocked + budget)
   └─ Apply technology effects (scaled by deployment)

9. Check Crisis Resolution
   ├─ Pollution crisis: check if < 50% (from tech effects)
   ├─ Climate catastrophe: check if > 70%
   ├─ Ecosystem collapse: check if > 60%
   ├─ Meaning collapse: check if < 50%
   └─ Deactivate resolved crises

10. Update Diplomatic AI (Phase 2F+)
    ├─ Calculate capabilities (strategic reasoning, communication, information integrity)
    ├─ Check deployment conditions (capability ≥2.0, alignment ≥0.7, democratic gov)
    ├─ Update trust dynamics (success increases, failure/misalignment decreases)
    ├─ Track dual-use risks (manipulation, dependency capture, mission creep)
    ├─ Attempt interventions if geopolitical crisis active (2+ systemic crises)
    └─ Calculate success probability (crisis type × capability × trust × alignment)

11. Update Upward Spirals (Phase 2D)
    ├─ Check 6 spiral conditions (Abundance, Cognitive, Democratic, Scientific, Meaning, Ecological)
    ├─ Track spiral activation & duration
    ├─ Apply virtuous cascade effects
    └─ Update Utopia eligibility (requires 3+ sustained spirals for 12+ months)

12. Update Meaning Renaissance (Phase 2E)
    ├─ Track purpose diversity & self-actualization
    ├─ Monitor artistic renaissance & philosophical maturity
    └─ Apply positive feedback loops (counters meaning crisis)

13. Update Conflict Resolution (Phase 2F)
    ├─ Post-scarcity peace dividends (abundance reduces conflict)
    ├─ Cyber defense improvements (protects critical infrastructure)
    └─ Integrate with diplomatic AI interventions

14. Update Quality of Life
    ├─ Calculate 17 dimensions
    ├─ Apply multipliers (post-scarcity, trust)
    ├─ Apply penalties (control)
    ├─ Apply crisis degradation (immediate + ongoing)
    ├─ Apply cascade multiplier (1.0x to 3.0x)
    ├─ Apply technology boosts (from deployed tech)
    └─ Aggregate weighted score

15. Check Outcome Conditions
    ├─ Check Golden Age conditions (QoL, trust, stage)
    ├─ Track Golden Age duration
    ├─ Calculate sustainability (environmental + social + tech)
    ├─ Check Utopia conditions (sustained Golden Age + sustainability)
    ├─ Calculate probabilities (Utopia, Dystopia, Extinction)
    ├─ Check instant extinction triggers
    ├─ Check heterogeneous extinction mechanisms
    └─ If outcome >85%, game ends

12. Update Visualizations
    └─ Send state to UI

13. Increment Month
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
- **Utopian Systems:** [Breakthrough Technologies](./systems/breakthrough-technologies.md), [Upward Spirals](./systems/upward-spirals.md), [Governance Quality](./systems/governance-quality.md), [Meaning Renaissance](./systems/meaning-renaissance.md), [Conflict Resolution](./systems/conflict-resolution.md)
- **Mechanics:** [Economics](./mechanics/economics.md), [Quality of Life](./mechanics/quality-of-life.md), [Outcomes](./mechanics/outcomes.md)
- **Advanced:** [Extinctions](./advanced/extinctions.md), [Detection](./advanced/detection.md), [Research](./advanced/research.md)

---

**Last Updated:** October 9, 2025
**Version:** 2.1 (Phase 2B-F Complete: Dystopia Lock-In, Governance Quality, Upward Spirals, Meaning Renaissance, Conflict Resolution)
