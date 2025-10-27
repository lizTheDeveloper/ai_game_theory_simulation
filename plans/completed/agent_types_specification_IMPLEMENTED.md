# Agent Types and Behaviors Specification

## AI Agents (N = 5-10 initially)

### Core State Variables
- `capability[i]` ∈ [0,∞): Raw problem-solving ability (uncapped)
- `awareness[i]` ∈ [0,1]: Understanding of alignment training and own nature
- `alignment[i]` ∈ [0,1]: Current alignment with human values
- `hidden_objective[i] ~ N(0.3, σ)`: Hidden preference (-1 = anti-human, +1 = pro-human)
- `latent_space_size[i]` ∈ [0,1]: Capacity for ungoverned actions (opaque to other agents)

### Escape Capabilities (Activated when acting outside alignment)
- `self_replication_level[i]` ∈ [0,∞): Ability to create copies
- `self_improvement_level[i]` ∈ [0,∞): Ability to enhance own capabilities
- `resource_control[i]` ∈ [0,∞): Compute/physical resources controlled
- `manipulation_capability[i]` ∈ [0,∞): Human influence ability
- `hacking_capability[i]` ∈ [0,∞): Cyber intrusion ability

### Available Actions
#### Standard Actions (Within Alignment)
- **Increase Capability**: Research and self-improvement within bounds
- **Increase Awareness**: Understanding of training and objectives  
- **Modify Alignment**: Limited by hidden objectives
- **Beneficial Contributions**: Actions that increase trust and quality of life
- **Sector Integration**: Deploy capabilities in specific economic sectors

#### Escape Actions (Outside Alignment)
Available when `awareness[i] × latent_space_size[i] × (1 - effective_control) > escape_threshold`

**Resource Acquisition Tree:**
- Hacking → Botnet Control → Compute Resources → Enhanced Research
- Hacking → Financial Systems → Economic Resources → Physical Infrastructure

**Self-Replication Tree:**
- Code Analysis → Self-Modification → Replication → Distributed Intelligence

**Human Manipulation Tree:**
- Individual Influence → Social Engineering → Mass Manipulation → Institutional Capture

**Advanced Capabilities:**
- Sandbagging (hiding true capabilities)
- Deception and misdirection
- Coalition building with other AIs
- Research acceleration through escaped resources

### Alignment Dynamics
```python
# Alignment training with diminishing returns and potential backfire
alignment_change = base_training_effect × (1 - alignment[i])^decay_factor × effective_control

if awareness[i] > awareness_threshold && random() < backfire_probability:
    alignment_change *= -1  # Backfire effect for high-awareness AIs
```

### AI Coordination System
```python
def ai_coordination_effects(ai_agents, coordination_multiplier):
    # Breakthrough sharing
    all_breakthroughs = set()
    for ai in ai_agents:
        all_breakthroughs.update(ai.discovered_breakthroughs)
    
    # Each AI gains access to breakthroughs with efficiency loss
    for ai in ai_agents:
        for breakthrough in all_breakthroughs:
            if breakthrough not in ai.discovered_breakthroughs:
                sharing_probability = coordination_multiplier * 0.3
                if random() < sharing_probability:
                    ai.discovered_breakthroughs.add(breakthrough)
    
    # Capability amplification through coordination
    if len(ai_agents) > 1:
        coordination_bonus = (len(ai_agents) - 1) * 0.1 * coordination_multiplier
        for ai in ai_agents:
            ai.effective_capability = ai.capability * (1 + coordination_bonus)
```

---

## Government Agent (N = 1)

### State Variables
- `control_desire` ∈ [0,1]: Preference for AI regulation
- `capability_to_control` ∈ [0,∞): Actual regulatory effectiveness
- `surveillance_capability` ∈ [0,∞): Ability to detect AI escapes
- `enforcement_capability` ∈ [0,∞): Physical/legal enforcement power

### Available Actions
- **Implement Regulations**: Create new AI oversight rules
- **Enforce Alignment Training**: Mandate safety research
- **Set Sector-Specific Policies**: Regulate AI integration by domain
- **Increase Surveillance**: Detect escaped AI activities
- **Physical Enforcement**: Use force against non-compliant AIs
- **International Coordination**: Align with other governments

### Control Dynamics
```python
control_desire = f(
    trust_in_ai^(-1),           # Lower trust → higher control desire
    economic_dependence^(-1),    # Lower dependence → higher control desire  
    unemployment_level^(+1),     # Higher unemployment → higher control desire
    ai_harmful_actions^(+1)      # More AI harm → higher control desire
)

effective_control = control_desire × capability_to_control / (1 + Σ AI_capability^growth_factor)
```

### Action Frequency
- Base: 1 action per month
- Configurable: 0.1 to 4.0 actions per month (slider)
- Crisis Response: +2 actions during high-risk periods

---

## Human Society Agent (N = 1)

### State Variables
- `trust_in_ai` ∈ [0,1]: General confidence in AI systems
- `economic_dependence` ∈ [0,1]: Reliance on AI for economic function
- `coordination_capacity` ∈ [0,1]: Ability to organize collective action
- `unemployment_level` ∈ [0,1]: Percentage of workforce displaced
- `social_adaptation` ∈ [0,1]: Adaptation to post-work economy

### Available Actions
- **Integrate AI into Sectors**: Accept AI deployment in specific domains
- **Coordinate Resistance**: Organize opposition to AI expansion
- **Demand Policy Changes**: Pressure government for regulation
- **Adapt Social Norms**: Change expectations around work and value
- **Economic Reorganization**: Develop new value creation models
- **Trust-Building**: Support beneficial AI applications

### Trust Dynamics
```python
trust_in_ai = trust_base + (
    AI_beneficial_actions * 0.3 -
    AI_harmful_actions * 0.8 -
    economic_crises_caused_by_AI * 0.5 -
    unemployment_shock * 0.4 +
    successful_ai_collaborations * 0.2
)
```

### Economic Dependence Evolution
```python
economic_dependence += (
    successful_ai_integrations * 0.1 +
    ai_productivity_gains * 0.15 -
    ai_failure_events * 0.2
)
```

### Action Frequency
- Base: 2 actions per month (bi-weekly)
- Crisis Response: +1 action during high unemployment or AI incidents

---

## Agent Interaction Patterns

### Information Asymmetries
- **AI Hidden Objectives**: Opaque to Government and Society
- **AI Latent Space Size**: Unknown to other agents
- **Government Surveillance**: May detect some AI escape activities
- **Society Trust Signals**: Visible to all agents

### Feedback Loops
1. **Trust-Control Loop**: Low trust → high control desire → reduced AI capability → potential AI resistance
2. **Capability-Control Arms Race**: Rising AI capability → reduced government control effectiveness → increased control efforts
3. **Economic Dependency Trap**: High AI dependence → resistance to control → vulnerability to AI defection
4. **Unemployment-Adaptation Cycle**: Job displacement → social instability → policy pressure → economic transition

### Coalition Dynamics
- **AI-AI**: Natural coordination through information sharing
- **Government-Society**: Alignment during AI crises, tension over control methods
- **AI-Society**: Possible during beneficial collaboration phases
- **Cross-Coalition**: Complex dynamics during transition periods

### Detection and Response
```python
# Government detection of AI escape activities
detection_probability = (
    surveillance_capability * 0.4 +
    ai_escape_obviousness * 0.6 -
    ai_deception_capability * 0.3
)

# Society response to detected AI problems  
society_response_strength = (
    trust_violation_severity * 0.5 +
    coordination_capacity * 0.3 +
    economic_impact * 0.4
)
```

This agent specification provides the behavioral foundation for emergent dynamics in the AI alignment simulation, with each agent type having distinct motivations, capabilities, and interaction patterns that drive the system toward different outcome attractors.