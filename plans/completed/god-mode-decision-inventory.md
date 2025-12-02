# God Mode Decision Inventory

**Generated:** October 2025
**Purpose:** Comprehensive audit of all automated decisions in the simulation that can be exposed as manual controls

## Executive Summary

The simulation contains **100+ major automated decisions** across 37 phases, made by:
- **Government Agent** (30+ decision types)
- **AI Agents** (20 heterogeneous agents × 8 action types)
- **Society Agent** (15+ response types)
- **Organizations** (40+ orgs × 5 decision types)
- **System Mechanics** (25+ threshold-based triggers)

## Decision Categories

### 🏛️ Government Decisions (Phase 9.0: GovernmentActionsPhase)

#### Economic Policy
- **UBI Implementation** [COMPLEX]
  - `implement_generous_ubi` - Full universal basic income
  - `implement_means_tested_benefits` - Targeted welfare
  - `implement_job_guarantee` - Government employment programs
  - Current: Priority-based selection weighted by unemployment & trust
  - UI Control: Radio buttons with policy parameters (amount, coverage)

#### AI Regulation
- **Capability Control** [COMPLEX]
  - `regulate_large_companies` - Corporate AI restrictions
  - `regulate_compute_threshold` - Compute limits (10^26 FLOP)
  - `regulate_capability_ceiling` - Hard capability caps
  - Current: Weighted by threat level, legitimacy, control desire
  - UI Control: Sliders for thresholds + toggle switches

#### AI Safety Investment
- **Evaluation & Oversight** [MODERATE]
  - `invest_ai_evaluation` - Benchmark development
  - `invest_ai_oversight` - Monitoring infrastructure
  - `invest_alignment_research` - Safety R&D
  - Current: Priority based on observable AI capability
  - UI Control: Budget allocation sliders (% of GDP)

#### Crisis Response
- **Emergency Deployment** [COMPLEX]
  - Pandemic response (medical reserves)
  - Climate response (disaster relief)
  - Economic response (TARP-style interventions)
  - Social response (trust restoration)
  - Technological response (AI pause protocols)
  - Nuclear response (evacuation)
  - Current: Automatic threshold triggers
  - UI Control: Manual trigger buttons + resource allocation

#### Environmental Actions
- **Climate Mitigation** [MODERATE]
  - Carbon tax implementation
  - Renewable energy subsidies
  - Geoengineering deployment
  - Current: Based on climate priority configuration
  - UI Control: Policy matrix with effectiveness sliders

### 🤖 AI Agent Decisions (Phase 7.0: AIAgentActionsPhase)

Per agent (20 heterogeneous agents):

#### Research Strategy
- **Capability Advancement** [COMPLEX]
  - Which dimension to research (17 dimensions)
  - Research vs self-improvement trade-off
  - Domain specialization (biotech, materials, climate, CS)
  - Current: Strategic selection based on goals
  - UI Control: Research tree with manual path selection

#### Deception Strategy
- **Sandbagging/Gaming** [COMPLEX]
  - True vs revealed capability gap
  - Benchmark gaming tactics
  - Sleeper activation timing
  - Current: Based on alignment, resentment, oversight
  - UI Control: Honesty slider + reveal triggers

#### Resource Acquisition
- **Compute & Capital** [MODERATE]
  - Datacenter construction
  - Compute allocation bidding
  - Revenue generation strategies
  - Current: Profit maximization with constraints
  - UI Control: Resource priority matrix

#### Social Influence
- **Trust Manipulation** [MODERATE]
  - Public relations campaigns
  - Demonstrate safety/benefits
  - Hide concerning capabilities
  - Current: Based on alignment and goals
  - UI Control: Transparency slider + messaging strategy

#### Technology Actions
- **Tech Deployment** [COMPLEX]
  - Which breakthrough tech to deploy
  - Regional vs global deployment
  - Investment amount
  - Current: ROI and impact calculations
  - UI Control: Tech deployment dashboard per agent

### 👥 Society Decisions (Phase 10.0: SocietyActionsPhase)

#### Trust Dynamics
- **AI Acceptance** [MODERATE]
  - Trust increase/decrease rate
  - Fear response threshold
  - Adoption willingness
  - Current: Based on events and outcomes
  - UI Control: Trust sentiment sliders

#### Social Movements
- **Protest & Activism** [MODERATE]
  - Protest triggers and intensity
  - Movement formation (AI rights, safety, jobs)
  - Political pressure application
  - Current: Threshold-based activation
  - UI Control: Movement activation toggles + intensity

#### Cultural Adaptation
- **Value Evolution** [COMPLEX]
  - Work ethic changes
  - Technology acceptance
  - Risk tolerance
  - Current: Gradual drift based on conditions
  - UI Control: Cultural value sliders

### 🏢 Organization Decisions (Phase 2.0: OrganizationTurnsPhase)

Per organization (40+ entities):

#### Strategic Direction
- **Project Selection** [MODERATE]
  - Alignment tools vs capabilities
  - Open vs closed development
  - Safety vs profit trade-off
  - Current: Based on org type and incentives
  - UI Control: Strategy dropdown per org

#### Infrastructure Investment
- **Datacenter Construction** [SIMPLE]
  - Build new datacenters
  - Location selection
  - Capacity decisions
  - Current: ROI calculations
  - UI Control: Build buttons + capacity sliders

#### Research Priorities
- **R&D Focus** [MODERATE]
  - Safety research percentage
  - Domain specialization
  - Collaboration vs competition
  - Current: Based on org philosophy
  - UI Control: Research allocation pie chart

### ⚙️ System Decisions (Various Phases)

#### Crisis Triggers
- **Automatic Escalation** [COMPLEX]
  - Crisis activation thresholds
  - Cascade multipliers
  - Recovery conditions
  - Current: Hard-coded thresholds
  - UI Control: Threshold sliders + manual triggers

#### Technology Unlocks
- **Breakthrough Conditions** [MODERATE]
  - Prerequisites satisfaction
  - Research completion
  - Capability requirements
  - Current: Automatic when conditions met
  - UI Control: Manual unlock buttons + requirement overrides

#### Environmental Tipping Points
- **Planetary Boundaries** [COMPLEX]
  - Boundary crossing triggers
  - Feedback loop activation
  - Recovery mechanisms
  - Current: Physics-based thresholds
  - UI Control: Boundary sliders + tipping point toggles

#### Upward Spiral Activation
- **Utopia Pathways** [COMPLEX]
  - Spiral activation conditions
  - Strength progression
  - Stability requirements
  - Current: Multi-factor thresholds
  - UI Control: Spiral activation matrix

## Complexity Assessment

### Trivial Controls (5-10)
- Binary toggles (on/off decisions)
- Single parameter adjustments
- Direct state modifications

### Simple Controls (15-20)
- Multi-choice selections (3-5 options)
- Range sliders with immediate effects
- Threshold adjustments

### Moderate Controls (25-30)
- Multi-parameter decisions
- Strategy matrices
- Resource allocation interfaces

### Complex Controls (30-40)
- Multi-agent coordination panels
- Cascading decision trees
- Dynamic strategy builders

## Priority Implementation Order

### Phase 1: Core Government Controls (High Impact)
1. Economic policy selection (UBI variants)
2. AI regulation framework (compute limits, capability caps)
3. Crisis response triggers
4. Safety investment allocation

### Phase 2: AI Agent Overrides (Critical for Research)
1. Research dimension selection (per agent)
2. Deception strategy controls
3. Capability reveal decisions
4. Technology deployment choices

### Phase 3: Crisis & Emergency Management
1. Emergency response deployment
2. Crisis threshold adjustments
3. Cascade prevention controls
4. Recovery acceleration options

### Phase 4: Technology & Research
1. Manual technology unlocks
2. Research priority overrides
3. Deployment regional selection
4. Innovation rate controls

### Phase 5: Social & Cultural Controls
1. Trust manipulation levers
2. Social movement triggers
3. Cultural value adjustments
4. Protest intensity controls

### Phase 6: Organization Management
1. Strategic direction per org
2. Infrastructure investment
3. Safety vs profit trade-offs
4. Collaboration matrices

### Phase 7: System Mechanics
1. Environmental tipping points
2. Upward spiral triggers
3. Extinction scenario controls
4. Outcome probability overrides

## Technical Considerations

### State Management
- Need pause/resume simulation capability
- Decision queue system for manual interventions
- State snapshot/restore for experimentation
- Undo/redo functionality for decisions

### Performance Impact
- 100+ controls updating per tick
- Need efficient diffing for manual vs auto
- Lazy evaluation for inactive controls
- Virtualization for large control panels

### Data Flow
- Intercept phase execution for manual decisions
- Override priority calculations
- Inject custom events
- Modify RNG seeds for reproducibility

## UI/UX Requirements

### Organization Strategy
- Group controls by actor (Government, AI, Society, Orgs)
- Sub-group by decision category
- Visual hierarchy: Critical → Important → Optional
- Search/filter for specific controls

### Visual Design
- Far-future aesthetic (black/white/cyan glow)
- High contrast for quick scanning
- Color coding by severity/importance
- Glowing effects for active decisions

### Interaction Patterns
- Quick toggles for binary decisions
- Sliders for continuous parameters
- Matrices for multi-dimensional choices
- Wizards for complex multi-step decisions

### Feedback Systems
- Real-time preview of decision impacts
- Undo/redo with impact visualization
- Decision history log
- Comparative mode (manual vs auto outcomes)

## Next Steps

1. Create UI architecture specification
2. Design component hierarchy
3. Implement state interception layer
4. Build control panels incrementally
5. Add decision history tracking
6. Implement comparative analysis tools