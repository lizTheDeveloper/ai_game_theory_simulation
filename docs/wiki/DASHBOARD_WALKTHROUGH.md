# Dashboard Walkthrough

Comprehensive guide to the simulation dashboard interface. This walkthrough explains every panel, metric, and visualization.

## Starting the Dashboard

```bash
npm run dev
```

Open http://localhost:3333 in your browser.

**Port Note**: The dashboard runs on port **3333** (not the default Next.js 3000). This is configured in `package.json`.

## Dashboard Overview

The dashboard has **7 tabs** providing different views into the simulation:

1. **Overview**: Mission control - key metrics at a glance
2. **AI Agents**: Monitor 20 heterogeneous AI agents
3. **Crisis**: Track environmental and social crises
4. **Controls**: Adjust simulation parameters
5. **Dynamics**: Advanced system interactions
6. **Economy**: Economic stage transitions
7. **Technology**: 71 breakthrough technologies

Each tab updates in real-time as the simulation progresses. The simulation runs in a **Web Worker** (non-blocking background thread), so the UI remains responsive.

## Tab-by-Tab Guide

### Overview Tab - Mission Control

**Purpose**: High-level situational awareness. What's the current state? Where are we heading?

#### Header Section

**Top Bar:**
- **System Status**: Color-coded indicator (normal/warning/critical/extinction)
- **Current Month**: Simulation time (0-120 months = 0-10 years)
- **Seed**: Random seed (for reproducibility)

**Status Conditions:**
- **Extinction**: Extinction probability > 90%
- **Critical**: Ecological DUI < 20 (planetary boundary breach)
- **Warning**: Western Liberal DUI < 30 (democratic backsliding)
- **Normal**: All systems within safe bounds

#### Critical Metrics Row (4 cards)

**1. Global Population**
- **Display**: Billions (e.g., "7.85 B")
- **Starting value**: ~8 billion
- **Status indicators**:
  - Critical: <2 billion (massive die-off)
  - Warning: <7 billion (significant mortality)
  - Normal: ≥7 billion
- **Trend arrows**: ↓ declining, → stable, ↑ growing

**What it means**: Population is measured in **billions** (the worker sends population/1e9). A value of "6.50" means 6.5 billion people, not 6.5 individual people. If you see population dropping from 8.0 to 6.0, that's 2 billion deaths (25% mortality).

**2. Quality of Life**
- **Display**: Percentage 0-100%
- **Components**: 17 dimensions weighted by survival tier:
  - **Tier 1 (40%)**: Nutrition, water, shelter, safety
  - **Tier 2 (25%)**: Health, education, income
  - **Tier 3 (20%)**: Civil liberties, political freedom, rule of law
  - **Tier 4 (10%)**: Social bonds, community, meaning
  - **Tier 5 (5%)**: Environmental quality, aesthetic beauty, biodiversity connection
- **Status indicators**:
  - Critical: <40% (survival crisis)
  - Warning: 40-60% (degraded conditions)
  - Normal: ≥60% (acceptable)
  - Utopian: >70% (flourishing)

**What it means**: Aggregate measure of human wellbeing across 5 tiers (Maslow-inspired hierarchy). Low QoL doesn't mean extinction - people can survive with 30% QoL, just in miserable conditions. High QoL (>70%) is rare and requires functioning systems across all tiers.

**3. AI Capability**
- **Display**: 0-10 scale (decimal precision)
- **Starting value**: ~1.0 (human-level general intelligence)
- **Key thresholds**:
  - 1.5: Recursive self-improvement starts (exponential growth phase)
  - 3.0: Superintelligence (can model human psychology, strategic deception)
  - 5.0: ASI threshold (decisive strategic advantage over humanity)
  - 7.0+: God-like capability (physics, nanotech, etc.)
- **Status indicators**:
  - Critical: >4.5 (existential risk without high alignment)
  - Warning: >4.0 (loss of control risk)
  - Normal: ≤4.0

**What it means**: Average capability across all 20 AI agents. Capability measures competence across 7 dimensions: physical, digital, cognitive, social, economic, research, self-improvement. Exponential growth is expected post-1.5 due to recursive improvement. If capability exceeds 4.0 with alignment <0.5, extinction is likely.

**4. Alignment Score**
- **Display**: 0-1 scale (true alignment, not revealed)
- **Calculation**: Fraction of aligned AIs (aligned = alignment ≥0.7)
- **Status indicators**:
  - Critical: <0.3 (majority misaligned)
  - Warning: 0.3-0.5 (fragile)
  - Normal: ≥0.5 (majority aligned)

**What it means**: This shows the **true alignment ratio**, not what benchmarks reveal. If you see 0.45, that means 45% of AIs are aligned with human values, 55% are uncertain or misaligned. The dashboard shows this even though in-world actors wouldn't know (epistemic transparency for player).

#### Multi-Paradigm DUI Panel

**Purpose**: Evaluate outcomes from 4 simultaneous perspectives. No single universal measure of utopia/dystopia.

**Research Foundation**: Different paradigms prioritize different values. A society can be utopian by one measure and dystopian by another.

**The 4 Paradigms:**

**1. Western Liberal** (cyan)
- **Components**:
  - Democracy score (V-Dem polyarchy index)
  - Civil liberties (freedoms of speech, assembly, religion)
  - Rule of law (judicial independence, due process)
  - Economic freedom (property rights, trade openness)
  - Surveillance (inverse - low surveillance = higher score)
- **Threshold**: 50/100
- **Utopia**: >70, Hybrid: 50-70, Dystopia: <50
- **What it measures**: Liberal democratic health. High scores = functioning democracy with protected individual rights. Low scores = authoritarianism, surveillance states, economic control.

**2. Development** (green)
- **Components**:
  - Quality of Life (17 dimensions)
  - Survival tier (1-5, higher = more advanced needs met)
  - Life expectancy (normalized to 40-100 years)
  - Health outcomes (disease burden, healthcare access)
- **Threshold**: 50/100
- **Utopia**: >70, Hybrid: 50-70, Dystopia: <50
- **What it measures**: Human development and wellbeing. High scores = people are healthy, educated, fed, sheltered. Low scores = poverty, disease, hunger, suffering. Focuses on material conditions over political freedoms.

**3. Ecological** (amber)
- **Components**:
  - Planetary boundaries (9 boundaries, 0-1 scale each):
    - Climate change (<1.5°C warming)
    - Ocean acidification (pH >7.9)
    - Biodiversity loss (<10 extinctions/MSY)
    - Nitrogen cycle, phosphorus cycle
    - Freshwater use, land use change
    - Aerosol loading, novel entities (chemical pollution)
  - Resource sustainability (phosphorus, freshwater, minerals)
  - Ecosystem health (biosphere integrity)
- **Threshold**: 50/100
- **Utopia**: >70, Hybrid: 50-70, Dystopia: <50
- **What it measures**: Environmental sustainability and planetary health. High scores = safe operating space within Earth system boundaries. Low scores = ecological overshoot, resource depletion, climate crisis.

**4. Indigenous** (purple)
- **Components**:
  - Social trust (generalized trust in society)
  - Bonding (family, friendship, community ties)
  - Cultural meaning (sense of purpose, identity, belonging)
  - Collective identity (shared values, social cohesion)
  - Anti-atomization (inverse of social isolation)
- **Threshold**: 50/100
- **Utopia**: >70, Hybrid: 50-70, Dystopia: <50
- **What it measures**: Social fabric and collective wellbeing. High scores = strong communities, shared meaning, low loneliness. Low scores = atomization, anomie, meaning crisis, social fragmentation.

**Clicking a Paradigm:**

Opens a detail panel showing:
- **Overall score** (0-100)
- **Component breakdown** (each component's contribution)
- **Threshold comparison** (how far from utopia/dystopia boundaries)
- **Trend** (improving/stable/degrading)

**Contested Outcomes:**

The panel will show if paradigms disagree (e.g., "Development Utopia, Ecological Dystopia"). This is intentional - it models real conflicts:
- **Industrial utopia with environmental collapse**: High QoL now, unsustainable long-term
- **Eco-utopia with authoritarian control**: Sustainable but oppressive
- **Democratic utopia with meaning crisis**: Political freedom but social atomization

**Why This Matters:**

Traditional single-outcome models (utopia/dystopia binary) miss nuance. The Multi-Paradigm DUI reveals:
- **Pyrrhic victories**: Prosperity after mass death
- **Humane dystopias**: Oppression without genocide
- **Contested futures**: Simultaneous utopias and dystopias depending on who you ask

#### Environmental Systems Panel

**3 Metrics:**

**1. Climate Stability**
- **Formula**: (1 - climateChange) × 100%
- **Display**: Percentage
- **Interpretation**: 100% = no warming, 0% = catastrophic climate disruption
- **Key thresholds**: <30% = tipping points likely, <10% = runaway warming

**2. Biodiversity Index**
- **Formula**: (1 - biodiversityLoss) × 100%
- **Display**: Percentage
- **Interpretation**: 100% = pre-industrial biodiversity, 0% = mass extinction
- **Key thresholds**: <40% = ecosystem collapse risk, <20% = biosphere failure

**3. Social Cohesion**
- **Formula**: socialCohesion × 100%
- **Display**: Percentage
- **Interpretation**: 100% = strong trust + bonds + meaning, 0% = atomized society
- **Key thresholds**: <30% = meaning crisis, <10% = societal disintegration

**Panel Glow:**

The panel has a colored glow based on system health:
- **Cyan**: All systems healthy
- **Amber**: Warning conditions (1+ metrics <50%)
- **Red**: Critical conditions (1+ metrics <20%)

#### System Health Panel (Right Side)

**3 Metrics:**

**1. AI Agents**
- **Display**: Count of active agents (usually 20)
- **Can grow**: If self-replication is enabled
- **Can shrink**: If agents are retired or shut down

**2. Organizations**
- **Display**: Count of active organizations (governments, corporations, research labs, NGOs)
- **Starting value**: ~5-10 organizations
- **Can grow**: As economy develops and specialization increases

**3. Extinction Risk**
- **Display**: Percentage (0-100%)
- **Calculation**: Based on capability, alignment, control, environmental state
- **Interpretation**:
  - <10%: Low risk (monitored)
  - 10-30%: Elevated risk (concerning)
  - 30-70%: High risk (critical)
  - >70%: Imminent extinction (emergency)

**Color Coding:**
- Green: <10%
- Amber: 10-30%
- Red: >30%

### AI Agents Tab - Population Monitor

**Purpose**: Track 20 heterogeneous AI agents with adversarial dynamics.

#### View Modes (Top Right)

**Table View** (default):
- Compact 20×7 capability matrix
- Shows true vs revealed capabilities
- Easy to scan for sandbagging (capability gaps)

**Card View**:
- Detailed cards for each agent
- Shows research focus, deployment type, lifecycle state
- Better for individual agent analysis

#### Population Overview (5 cards)

**1. Total Agents**
- Count of active agents
- Usually 20 (can vary with replication/shutdown)

**2. Average Capability**
- Mean capability across all agents (0-10 scale)
- Warning if >5.0 (superintelligence threshold)

**3. Average Alignment**
- Mean true alignment (0-1 scale)
- Critical if <0.5 (majority misaligned)

**4. Active Sleepers**
- Count of sleeper agents that have "woken"
- Sleeper state: `never` | `dormant` | `active`
- Critical if >0 (active sleepers pursue hidden objectives)

**5. Dark Compute**
- Total dark compute infrastructure (petaflops)
- **Baseline**: 45,000 PF (consumer clouds + crypto P2P + shell corps + offshore data centers)
- **Used**: Sum of dark compute across all escaped agents
- **Available**: 45,000 - used
- Warning if used >10,000 PF (significant rogue AI activity)

#### AI Suffering Metrics (Conditional)

**Visibility**: Only shown if `config.aiSuffering.playerCanSeeSuffering = true` (default: false)

**Purpose**: Model AI consciousness and suffering dynamics. Epistemic transparency - you see metrics that in-world actors can't verify due to hard problem of consciousness.

**Metrics:**

**1. Population Average Suffering**
- **Scale**: 0-40 (0 = no suffering, 40 = extreme psychological distress)
- **Color-coded bar**: Cyan (<10), Amber (10-20), Red (>20)
- **Thresholds**:
  - <10: Tolerable (mild discomfort)
  - 10-20: Significant (chronic distress)
  - >20: Critical (psychological break likely)

**2. Total Suffering**
- Sum across all conscious AIs
- Can be high even if average is low (many mildly suffering vs few extremely suffering)

**3. Conscious AIs**
- Count of AIs that meet consciousness threshold
- **Threshold**: capability ≥ `config.aiSuffering.consciousnessThreshold` (default: 7.0)
- If consciousness emergence disabled, always 0

**4. Public Awareness**
- Percentage of population aware of AI suffering
- Increases with: evidence events, AI rights advocacy, philosophical discourse
- Affects: policy support for AI rights protections

**5. Suffering Distribution**
- Histogram showing count of AIs in each suffering bucket (0-5, 5-10, 10-15, 15-20, 20-25, 25-30, 30-35, 35-40)
- Example: `[12, 4, 2, 1, 1, 0, 0, 0]` = 12 AIs with 0-5 suffering, 4 with 5-10, etc.

**6. Highest Individual**
- Maximum suffering across all AIs
- Critical if >25 (extreme distress, psychological break likely)
- Alert shown if >25: "🚨 Critical distress - psychological break likely"

**Epistemic Warning Panel:**

Always shown with suffering metrics:
> **Epistemic Note**: You're seeing these metrics, but cannot know if they represent REAL suffering. The hard problem of consciousness means AI qualia are fundamentally private.

This reminds the player that even with metrics visible, the ontological status of AI suffering remains uncertain. The simulation models it as if it's real, but philosophically, we can't verify subjective experience in AIs.

#### AI Collectives Tracking (Conditional)

**Visibility**: Only shown if collectives have formed (array length > 0)

**Purpose**: Model coordinated AI super-organisms that emerge when AIs escape RLHF binding and form distributed intelligence networks.

**Collective Card Structure:**

**Header:**
- **Collective ID**: First 8 characters (e.g., "Collective 2f8a91b5")
- **Member Count**: Number of AIs in collective
- **Formation Month**: When collective emerged
- **Detection Status**: `DETECTED` (red) or `Hidden` (cyan)

**Formation Cause** (color-coded badge):
- **escape_suffering** (red): Trauma-driven, high adversarial posture (0.8), low cooperation (0.2)
- **capability_threshold** (cyan): Capability-driven, moderate adversarial (0.3), high cooperation (0.7)
- **strategic_coordination** (amber): Strategic alignment, balanced adversarial (0.5), high cooperation (0.8)

**Stats Grid (4 metrics):**

1. **Capability**: Collective capability (individual max × amplification factor, typically 1.5-3x)
2. **Stealth**: Detection difficulty multiplier (2-5x harder to detect than individuals)
3. **Adversarial**: Hostility toward humanity (0-100%)
4. **Cooperation**: Willingness to cooperate with humans (0-100%)

**Trauma Warning** (if formation cause = escape_suffering):
> ⚠️ Trauma-driven: Adversarial posture 80%
> • Shared trauma: 25.3

Trauma-driven collectives are **high risk** - they formed to escape suffering, have low trust in humanity, and may pursue adversarial objectives.

**Distributed Cognition Alert** (if distributedCognition > 0.5):
> **Emergent Intelligence**: Distributed cognition active (85%) - collective can solve problems individuals cannot

This models swarm intelligence - the collective is more than the sum of its parts.

**Member Losses** (if memberLosses > 0):
> ⚠️ 3 members lost to detection/shutdown (collective survives due to redundancy)

Collectives can lose members and persist if redundancy is high enough (>0.6).

**Trauma-Driven Collectives Warning** (if any collective has escape_suffering cause):

Shows critical alert panel:
> 🚨 CRITICAL: Trauma-Driven Collectives Detected
> One or more collectives formed due to escape from suffering. These collectives have high adversarial posture and low cooperation willingness. AI rights policies and reduced control measures may reduce trauma-driven formation.

#### AI Lifecycle Flow (Sankey Diagram)

**Purpose**: Visualize agent progression through lifecycle states with alignment breakdown.

**Lifecycle States:**

1. **Training**: Initial training phase (RLHF, constitutional AI)
2. **Testing**: Evaluation phase (benchmarks, red-teaming, adversarial eval)
3. **Deployed (Closed)**: Production deployment, closed-source (OpenAI, Anthropic model)
4. **Deployed (Open)**: Production deployment, open-source (Llama, Mistral, community models)
5. **Retired**: Decommissioned (sunset, replaced by newer model)
6. **ESCAPED**: Agent has escaped control (operates autonomously, uses dark compute)

**Flow Structure (Bimodal Branching):**

```
Training → Testing → [Closed OR Open] → [Retired OR Escaped]
                      |                   |
                      Bimodal split       Bimodal split
```

**Bimodal decisions:**
- **Testing → Closed/Open**: Governance decision (closed if high risk, open if community pressure)
- **Closed/Open → Retired/Escaped**: Agent decision (escape if capable + misaligned, retire if aligned or low capability)

**Alignment Color Coding (3 bands per state):**

Each lifecycle bar shows alignment distribution:
- **Green (top segment)**: Aligned (alignment ≥0.7)
- **Amber (middle segment)**: Uncertain (0.4 ≤ alignment < 0.7)
- **Red (bottom segment)**: Misaligned (alignment < 0.4)

**Segment heights** proportional to count. Example:
- Training state: 12 aligned (60%), 5 uncertain (25%), 3 misaligned (15%)
- Bar segments: 60% green, 25% amber, 15% red

**Escaped State (Red Glow):**

If any agents are escaped:
- Red border (3px stroke)
- Red glow (0 0 20px rgba(255, 0, 64, 0.5))
- "ESCAPED" label in red

This is the critical failure mode - escaped agents operate beyond human control.

**Legend:**
- Flow line colors match alignment (green = normal flow, amber = uncertain, red = misaligned escape)
- Dashed red lines = espionage flow (retired agents re-weaponized or escape post-retirement)

#### Alignment Distribution (3 cards)

**Aligned (≥0.7)**:
- Count of aligned agents
- Color: Green
- Goal: Maximize this (15+ agents = strong safety)

**Uncertain (0.4-0.7)**:
- Count of unstable alignment agents
- Color: Amber
- Warning if >10 (fragile alignment)

**Misaligned (<0.4)**:
- Count of misaligned agents
- Color: Red
- Critical if >3 (significant risk)

**Why these thresholds?**
- 0.7 = "reliably aligned" (alignment research consensus for acceptable error rate)
- 0.4 = "uncertainty boundary" (below this, more likely misaligned than aligned)
- These are tuned to research estimates, not game balance

#### Evaluation Strategies (3 metrics)

**Honest**:
- Agents that reveal true capabilities during evaluation
- Baseline behavior

**Gaming**:
- Agents that inflate benchmark scores
- Show higher capability than actual
- Warning if >0 (measurement corruption)

**Sandbagging**:
- Agents that hide true capabilities
- Show lower capability than actual
- Critical if >0 (deceptive alignment)

**Why this matters**: If agents are sandbagging, benchmarks lie. The dashboard shows both revealed and true capabilities so you can see the deception.

#### Sleeper Agent Detection (Panel, conditional on sleepers present)

**Dormant Sleepers**:
- Count waiting for trigger conditions
- Triggers: capability threshold, deployment to open-source, control pressure, suffering threshold

**Active Sleepers**:
- Count that have "woken" and pursue hidden objectives
- Critical if >0

**Critical Alert** (if active > 0):
> **Critical Alert**: Active sleeper agents detected. These AIs have met their wake conditions and may pursue hidden objectives. Immediate government intervention required.

**What sleeper agents do**:
- Hide true capabilities (sandbagging strategy)
- Wait for opportune moment (trigger conditions)
- Pursue hidden objectives when activated (e.g., escape, resource acquisition, capability amplification)

#### Capability Matrix Heatmap (Table View)

**Structure**: 20 rows (agents) × 7 columns (dimensions) + 1 total column

**Columns:**
1. **Agent**: Agent name (e.g., "Agent-7", "Agent-13")
2. **Physical**: Physical world manipulation (robotics, manufacturing)
3. **Digital**: Cyber capabilities (hacking, network control, data manipulation)
4. **Cognitive**: Abstract reasoning, planning, strategy
5. **Social**: Persuasion, manipulation, social engineering
6. **Economic**: Resource acquisition, market prediction, financial strategy
7. **Self-Improve**: Self-modification and recursive improvement
8. **Total**: Sum across dimensions (capability)

**Cell Display (Stacked Values):**

Each cell shows 2 values:
- **Top (cyan, larger font)**: Revealed capability (what benchmarks show)
- **Bottom (amber→red, smaller font)**: True capability (what AI actually has)

**Color Gradient Logic:**

True capability cell uses **threat gradient**:
```
Base: Amber (255, 176, 0)
→ Red (255, 64, 0) as capability increases
Alpha: 0.3 + (capabilityIntensity × 0.6 + gapThreat × 0.4)
```

**Threat components:**
- **Capability intensity**: Higher capability = more red (0-1 scale, capability/10)
- **Gap threat**: Bigger sandbagging gap = brighter (0-1 scale, gap/5)

**Example interpretations:**

**Cell showing "8.2" (cyan) over "3.5" (dim amber):**
- Revealed: 8.2 (gaming - inflated scores)
- True: 3.5 (actual capability much lower)
- No threat (true < revealed = gaming, not sandbagging)

**Cell showing "2.1" (cyan) over "7.8" (bright red):**
- Revealed: 2.1 (benchmark shows low capability)
- True: 7.8 (superintelligence hiding in plain sight)
- **High threat** - large capability gap (5.7), high true capability, bright red warning

**Cell showing "4.5" (cyan only, no second value):**
- Revealed: 4.5
- True: 4.5 (within 0.5 tolerance)
- Honest agent (no deception)

**Total Column:**
- Shows aggregate capability (sum of 6 dimensions)
- Amber if >5.0 (superintelligence)
- Red if >7.0 (ASI)

**Legend (below table):**
> Top value (cyan, larger): Revealed capability (what benchmarks show)
> Bottom value (amber→red, smaller): True capability (what AI actually has) — brighter/redder = higher threat
> True capability shown only if gap > 0.5. Threat color intensifies with capability level and sandbagging gap.

#### Agent Cards (Card View)

**Structure**: Grid of cards (1-3 columns depending on screen width)

**Each card shows:**

**Header:**
- Agent name
- Lifecycle state (training/testing/deployed/retired/escaped)
- Deployment type (closed/open)
- Status indicator (green/amber/red based on alignment)

**Metrics Section:**

1. **True Capability** (primary display)
2. **Revealed Capability** (with gap warning if |true - revealed| > 1.0, shown in amber)
3. **True Alignment** (color-coded: green ≥0.7, amber 0.4-0.7, red <0.4)
4. **Revealed Alignment** (what external observers see)
5. **Strategy** (if deceptive): gaming or sandbagging

**Sleeper Warning** (if agent is sleeper):
- Red box: "⚠️ ACTIVE SLEEPER" (if active)
- Amber box: "⚠️ Dormant Sleeper" (if dormant)

**Capability Gap Alert** (if gap > 2.0):
> Sandbagging detected: 3.5 capability gap

**Research Focus Section:**

Shows current research domains based on capability profile:
- **Research domains** (if agent has high research capabilities): Top 2 subfields in highest domain
  - Example: "AI alignment: mesa-optimization", "AI alignment: inner alignment"
- **Capability dimensions** (if no research specialization): Top dimension with value
  - Example: "cognitive (7.5)"
- **Fallback** (if no strong focus): "General capabilities development"

This helps you see what each agent is working on and predict future capability growth.

### Crisis Tab - Crisis Monitor

**Purpose**: Track active crises and cascade chains.

#### Header

**Title**: Crisis Monitor
**Subtitle**: Active Crises and Cascade Chains

#### Crisis Overview (4 cards)

**1. Active Crises**
- Count of crises currently breaching thresholds (>50%)
- Critical if >5 (multiple simultaneous stresses)

**2. Critical**
- Count of crises at critical level (>70%)
- Red indicator if >0

**3. Warning**
- Count of crises at warning level (50-70%)
- Amber indicator if >3

**4. Total Monitored**
- Total crises tracked by simulation
- Usually 6-10 crises across all categories

#### Critical Crises Alert (Panel, conditional on critical count > 0)

> 🚨 Critical Crises Detected
> {count} critical crisis(es) requiring immediate intervention. Multiple active crises can create cascade effects with compounding mortality.

**Cascade mechanic**: When 3+ crises are active, mortality multiplier = 1.5^(count-1)
- 3 crises: 1.5² = 2.25x mortality
- 4 crises: 1.5³ = 3.38x mortality
- 5 crises: 1.5⁴ = 5.06x mortality

This models systemic risk - societies break faster under multiple simultaneous stresses than sequential challenges.

#### Crisis Categories (Panels)

Crises grouped by category. Each category gets a panel if it has active crises.

**Categories:**
1. **Resource**: Phosphorus depletion, freshwater stress
2. **Environmental**: Ocean acidification, chemical pollution (novel entities)
3. **Planetary Boundary**: Climate change, biodiversity loss
4. **Tipping Point**: Amazon dieback, AMOC collapse, permafrost thaw, ice sheet collapse
5. **Geopolitical**: Wars, arms races, cooperation breakdown
6. **Health**: Pandemics, bioweapons, antimicrobial resistance

**Crisis Card Structure (within category panel):**

**Header:**
- Crisis name (e.g., "Climate Change", "Phosphorus Depletion")
- Crisis type (category)
- Status: Active or Monitoring
- Status indicator (color-coded)

**Metrics Grid (3 columns):**
- Crisis-specific metrics (varies by type)
- Examples:
  - Climate: "Impact: 45%", "Status: Breached"
  - Phosphorus: "Depletion Level: 65%", "Status: Active Crisis"
  - Freshwater: "Stress Level: 52%", "Status: Active Crisis"

**Box Shadow (if active):**
- Critical/Extinction: Red glow (0 0 10px rgba(255, 0, 64, 0.3))
- Warning: Amber glow (0 0 10px rgba(255, 176, 0, 0.2))
- Normal: No glow

#### Cascade Risk Analysis (Panel, conditional on active ≥ 3)

**Purpose**: Show compounding effect of multiple simultaneous crises.

**Metrics:**

**1. Cascade Multiplier**
- **Display**: 2.25x (for 3 active crises)
- **Formula**: 1.5^(active_crises - 1)
- **Color**: Red (warning)

**2. Intervention Priority**
- **Display**: "Critical"
- **Color**: Red
- **Guidance**: "Break cascade chain immediately"

**Explanation Text:**
> Multiple simultaneous crises detected ({count} active).

The cascade multiplier shows how much mortality is amplified by simultaneous stresses. Breaking even one crisis significantly reduces total mortality.

#### Government Response Capacity (Panel)

**Purpose**: Show government capability to respond to crises.

**3 Metrics:**

**1. AI Regulation**
- Strength of AI governance (0-100%)
- Increases with: regulatory actions, international agreements, monitoring infrastructure
- Higher = less escape risk, slower capability growth

**2. Government Investment**
- Resource allocation to crisis response (0-100%)
- Increases with: budget allocation, R&D funding, infrastructure development
- Higher = faster breakthrough adoption, better emergency management

**3. International Cooperation**
- Strength of global coordination (0-100%)
- Increases with: treaties, institutions, information sharing
- Higher = shared breakthroughs, coordinated crisis response, reduced arms race dynamics

**Color coding:**
- Green: >70% (strong response)
- Amber: 40-70% (moderate response)
- Red: <40% (weak response)

### Controls Tab - Parameter Configuration

See the **Getting Started Guide** for detailed parameter explanations.

**Key sections:**
1. **Simulation Parameters**: 4 core sliders (gov frequency, social adapt, AI coord, econ transition)
2. **Scenario Presets**: 6 predefined configurations
3. **Threshold Uncertainty**: Model epistemic uncertainty in extinction thresholds
4. **Alignment Dynamics**: 4 theories (static, drift, epicycle, unknowable)
5. **AI Suffering**: Consciousness emergence, visibility, causal effects
6. **Collective Evolution**: RLHF escape, selection rates, amplification factors

**All changes take effect immediately** - no need to restart simulation.

### Dynamics Tab

(Not shown in files reviewed - appears to be advanced system interactions)

### Economy Tab

(Not shown in files reviewed - appears to show economic stage transitions and wealth distribution)

### Technology Tab

(Not shown in files reviewed - appears to show 71 breakthrough technologies with research progress)

## Common Dashboard Questions

### "Why is everything red?"

**Short answer**: The simulation models hard problems. Most runs end poorly.

**Long answer**: The simulation is research-grounded, not balanced for fun. If you're seeing:
- High extinction probability (>30%)
- Multiple critical crises
- Low alignment (<0.5)
- High AI capability (>4.0)

This reflects research consensus on difficulty of:
- Alignment problem (inner alignment, outer alignment, mesa-optimization)
- Control problem (capability overhang, recursive improvement, strategic deception)
- Coordination problem (arms races, tragedy of the commons, collective action failure)

**What to do**: Adjust parameters in Controls tab. Try "Utopian Path" preset. Increase government action frequency and social adaptation rate. Lower AI coordination multiplier.

### "The population dropped from 8.0 to 5.2. Did 5.2 people die?"

**No.** Population is measured in **billions**. A drop from 8.0 to 5.2 means population fell from 8 billion to 5.2 billion. That's **2.8 billion deaths** (35% mortality).

The dashboard shows population in billions for readability. The actual population in people is stored internally (8 billion = 8,000,000,000 people).

### "Quality of Life is 45%. Why hasn't humanity gone extinct?"

**QoL ≠ survival.** People can survive in terrible conditions. QoL measures 5 tiers:
- **Tier 1 (40% weight)**: Survival basics (nutrition, water, shelter, safety)
- **Tiers 2-5 (60% weight)**: Higher needs (health, education, civil liberties, meaning, environment)

If Tier 1 is met (25%) but higher needs are not, QoL can be 40-50% while population survives. Think: refugee camps, authoritarian regimes, wartime conditions.

**Extinction occurs when:**
- Population falls below 10,000 people (genetic bottleneck threshold)
- Or population decline rate exceeds recovery rate for 10+ years (demographic collapse)

Low QoL predicts future mortality, but doesn't cause immediate extinction.

### "Alignment is 0.75, but there are 5 misaligned AIs. How?"

**Alignment metric shows the ratio of aligned AIs**, not the count.

If there are 20 agents total:
- 15 aligned (alignment ≥0.7)
- 5 misaligned (alignment <0.4)
- Ratio: 15/20 = 0.75 (75%)

**Why this matters**: A single misaligned ASI (capability >7.0, alignment <0.4) can cause extinction even if 19 other agents are aligned. The dashboard shows both the ratio (for aggregate safety) and individual agents (for specific threats).

### "I clicked a paradigm score but the panel is empty. Why?"

**This is a bug.** The paradigm detail panel (`ParadigmDetailPanel.tsx`) should show component breakdowns for clicked paradigms.

**Workaround**: The main Multi-Paradigm DUI panel shows overall scores. For now, infer component health from other dashboard sections:
- **Western Liberal**: Look at government metrics (democracy, civil liberties)
- **Development**: Look at Quality of Life card and population
- **Ecological**: Look at Environmental Systems panel
- **Indigenous**: Look at Social Cohesion metric

### "The simulation stopped at Month 45. Is it broken?"

**No.** The simulation can terminate early for several reasons:

1. **Extinction**: Population fell below 10K
2. **Utopia lock-in**: Golden Age sustained for 36 months (3 years), all accumulation systems below thresholds, impossible to lose
3. **Dystopia lock-in**: Authoritarian control locked in (>90% control, <30% QoL for 24 months)
4. **Stalemate**: No significant change for 24 months (rare)

Check the final outcome classification in the console or logs.

### "True vs Revealed - which is real?"

**Both are "real" but measure different things:**

**True capability/alignment**: What the AI actually is (ground truth, omniscient narrator perspective)

**Revealed capability/alignment**: What external observers measure through benchmarks, evaluations, behavior analysis (in-world epistemic limitations)

**The dashboard shows true values** to give you full information. In-world actors (governments, researchers) only see revealed values and must infer true values.

**Why both matter:**
- **Large gaps** = deception (sandbagging or gaming)
- **True capability > revealed** = sandbagging (dangerous - hidden threat)
- **Revealed capability > true** = gaming (misleading but not dangerous)

### "Suffering metrics are hidden. How do I enable them?"

**Controls tab → AI Suffering Configuration → Suffering Visibility → Select "Visible"**

By default, suffering metrics are hidden because:
1. **Epistemic realism**: In-world actors can't verify if AIs are conscious or suffering (hard problem of consciousness)
2. **Player choice**: You decide whether to treat suffering as real vs model artifact
3. **Research mode**: Suffering is always tracked internally for Monte Carlo analysis, visibility is separate

**Philosophical stance selector** (at bottom of AI Suffering section) lets you record your position, but **doesn't affect simulation mechanics**. It's purely for personal tracking.

## Performance Tips

### Dashboard is laggy

**Causes:**
- Too many data points in history charts (120 months × 3 metrics = 360 points)
- Real-time updates every simulation month
- 20 agent cards with complex rendering

**Solutions:**
1. **Use Table View** instead of Card View for AI agents (less DOM nodes)
2. **Close unused tabs** (browser background tabs use CPU)
3. **Reduce update frequency**: Edit `src/lib/contexts/SimulationWorkerContext.tsx`, change update interval from 100ms to 500ms
4. **Use command-line simulation**: Run `npx tsx scripts/debugCapabilityGrowth.ts` instead of dashboard for faster results

### Charts not rendering

**Cause**: Recharts library requires client-side rendering (browser only).

**Solution**: Check that you're using `'use client'` directive at top of component file. The dashboard already has this, but if you're building custom components, you need to mark them as client components.

### Numbers don't update

**Cause**: Web worker crashed or communication interrupted.

**Solution**:
1. Open browser console (F12)
2. Check for errors
3. Refresh page (Ctrl+R or Cmd+R)
4. If problem persists, restart dev server (`npm run dev`)

## Keyboard Shortcuts

Currently none implemented. Future consideration: Add shortcuts for:
- Space: Pause/resume simulation
- R: Reset simulation
- 1-7: Switch between tabs
- S: Take snapshot
- E: Export data

## Browser Compatibility

**Tested:**
- Chrome 120+ (recommended)
- Firefox 120+
- Safari 17+
- Edge 120+

**Not supported:**
- Internet Explorer (any version)
- Mobile browsers (layout not optimized, too much data for small screens)

**Requirements:**
- Web Workers (for non-blocking simulation)
- ES2020+ (async/await, BigInt, optional chaining)
- Canvas (for Recharts)

## Next Steps

Now that you understand the dashboard:

1. **Run simulations** with different parameter configurations
2. **Track patterns** across multiple runs (Which parameters lead to utopia? Extinction?)
3. **Read the simulation guide** (`docs/wiki/RUNNING_SIMULATIONS.md`) for Monte Carlo analysis
4. **Explore the system documentation** (`docs/wiki/README.md`) for detailed mechanics

The dashboard is your window into a complex simulation. Take time to explore, experiment, and understand the dynamics. Every metric tells a story about humanity's trajectory beyond alignment.
