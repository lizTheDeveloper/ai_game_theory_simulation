# Game Development Roadmap

**Version:** 1.0
**Created:** Current Session
**Status:** Active

---

## Research Integrity Authority

### Sylvia (Research Skeptic) - FINAL AUTHORITY ON RESEARCH INTEGRITY

**This section is non-negotiable. All team members must acknowledge and comply.**

#### Veto Power

Sylvia has **VETO POWER** over any design decision, implementation choice, or gameplay mechanic that could affect research accuracy. This includes but is not limited to:

- Parameter values used in any game mode
- Player agency boundaries (what players can/cannot influence)
- Outcome classification criteria
- Tutorial simplifications that might create misconceptions
- Difficulty/scenario design that deviates from research baselines
- UI presentations that obscure uncertainty or indirect causation
- Any "gameplay feel" adjustments to research-backed values

#### Approval Requirements

**No implementation can proceed without Sylvia's explicit approval** for:

1. **Architecture changes** affecting simulation/game separation
2. **New player actions** that influence system dynamics
3. **Scenario definitions** with modified starting conditions
4. **Tutorial content** that simplifies research concepts
5. **UI elements** that display research-derived values
6. **"Balance" adjustments** claimed to improve gameplay

#### Halt Authority

**Sylvia can halt work at any phase** if research integrity concerns emerge, including:

- Discovery of parameter drift from validated baselines
- Implementation that allows player control over red-line parameters
- UI designs that misrepresent causation or certainty
- Scenario outcomes exceeding 15% deviation from baseline
- Any mechanic that could compromise the simulation's research validity

#### Escalation Process

If Maya (Game Designer) and Sylvia disagree on a design decision:

1. **Both parties document their positions** in writing
2. **Evidence must be provided:**
   - Maya: Gameplay rationale with player experience justification
   - Sylvia: Research integrity concerns with specific risks
3. **User decides** - The human operator has final authority
4. **Decision is documented** in the relevant design file with rationale

**Default:** If no user decision is made, Sylvia's position holds. Research integrity takes precedence over gameplay preferences.

---

## Quality Gates with Sylvia Approval

### Phase 1: Architecture Foundation

**Quality Gate 1: Architecture Separation**

| Checkpoint | Requirement | Sylvia Approval |
|------------|-------------|-----------------|
| Simulation isolation | Game layer cannot modify research parameters | REQUIRED |
| Data flow | One-way from simulation to game presentation | REQUIRED |
| Parameter protection | Red-line values inaccessible to game code | REQUIRED |
| Logging separation | Research logs distinct from game events | REQUIRED |

**Sylvia Sign-off Required Before Proceeding to Phase 2**

---

### Phase 2: Tutorial & Onboarding

**Quality Gate 2: Tutorial Simplifications**

| Checkpoint | Requirement | Sylvia Approval |
|------------|-------------|-----------------|
| Simplification audit | No tutorial text creates research misconceptions | REQUIRED |
| Complexity hiding | Hidden complexity is acknowledged, not denied | REQUIRED |
| Uncertainty framing | All presented outcomes include uncertainty language | REQUIRED |
| Indirect agency | Player role as influence, not control, is clear | REQUIRED |
| Causal language | No false causation ("you caused X" vs "X became more likely") | REQUIRED |

**Sylvia Sign-off Required Before Proceeding to Phase 3**

---

### Phase 3: Research Scenarios (Difficulty)

**Quality Gate 3: Scenario Validation**

| Checkpoint | Requirement | Sylvia Approval |
|------------|-------------|-----------------|
| Baseline accuracy | Consensus trajectory matches research literature | REQUIRED |
| Optimistic bounds | Upper bounds from peer-reviewed uncertainty ranges | REQUIRED |
| Pessimistic bounds | Lower bounds from peer-reviewed uncertainty ranges | REQUIRED |
| Custom validation | Custom scenarios require N=100 Monte Carlo | REQUIRED |
| 15% deviation limit | All scenarios within 15% of baseline distributions | REQUIRED |
| No balance tuning | Zero "gameplay feel" adjustments to validated values | REQUIRED |

**Sylvia Sign-off Required Before Proceeding to Phase 4**

---

### Phase 4: Final Validation

**Quality Gate 4: Monte Carlo Comparison**

| Checkpoint | Requirement | Sylvia Approval |
|------------|-------------|-----------------|
| N >= 100 runs | All scenarios validated with sufficient sample | REQUIRED |
| Distribution matching | Outcome distributions match research expectations | REQUIRED |
| Player agency bounds | No single choice shifts outcomes > 20% | REQUIRED |
| Determinism check | CV < 0.01% for same-seed runs | REQUIRED |
| Citation completeness | All displayed values link to sources | REQUIRED |
| Counterfactual logging | Baseline comparison always available | REQUIRED |

**Sylvia Final Sign-off Required Before Release**

---

## Development Phases

### Phase 1: Core Architecture (Weeks 1-4)

**Objective:** Establish clean separation between research simulation and game presentation layer.

#### Tasks

- [ ] Define simulation/game interface boundary
- [ ] Implement read-only game state wrapper
- [ ] Create parameter protection layer for red-line values
- [ ] Set up separate logging streams (research vs game events)
- [ ] Document architecture in wiki

#### Deliverables

- Architecture diagram showing separation
- Protected parameter registry
- Interface specification document

#### Sylvia Checkpoint

- [ ] **Sylvia approves architecture separation** before proceeding

---

### Phase 2: Player Agency System (Weeks 5-8)

**Objective:** Implement indirect influence mechanics that respect research integrity.

#### Tasks

- [ ] Define advocacy action catalog with bounded effects
- [ ] Implement coalition-building mechanics
- [ ] Create probability distribution visualization
- [ ] Build intervention proposal system for critical junctures
- [ ] Tutorial content development

#### Deliverables

- Advocacy system specification
- Effect magnitude documentation (with research justification)
- Tutorial script with simplification audit

#### Sylvia Checkpoint

- [ ] **Sylvia approves all tutorial simplifications** - verifies no misconceptions introduced

---

### Phase 3: Research Scenarios (Weeks 9-12)

**Objective:** Implement validated research scenarios as alternative starting conditions.

#### Tasks

- [ ] Baseline scenario: Parameter extraction from research literature
- [ ] Optimistic scenario: Upper-bound uncertainty values
- [ ] Pessimistic scenario: Lower-bound uncertainty values
- [ ] Custom scenario framework with validation requirements
- [ ] Monte Carlo validation pipeline

#### Deliverables

- Three validated scenarios with documentation
- Parameter source citations for all variations
- Validation results (N >= 100 each)

#### Sylvia Checkpoint

- [ ] **Sylvia approves all difficulty scenarios** - within 15% of baseline

---

### Phase 4: Integration & Polish (Weeks 13-16)

**Objective:** Final integration, validation, and research integrity audit.

#### Tasks

- [ ] Full Monte Carlo comparison across scenarios
- [ ] Player agency bounds verification
- [ ] Citation integration in UI
- [ ] Uncertainty visualization implementation
- [ ] Academic export functionality

#### Deliverables

- Final validation report
- Citation-linked interface
- Export tools for researchers

#### Sylvia Checkpoint

- [ ] **Sylvia signs off on final validation** - Monte Carlo comparison passed

---

## Team Roles & Responsibilities

### Maya (Game Designer)
- Player experience design
- Tutorial flow
- Engagement mechanics
- **Subject to Sylvia's research integrity veto**

### Tessa (UX Designer)
- Interface design
- Data visualization
- Accessibility
- **Must consult Sylvia on uncertainty representation**

### Roy (Simulation Maintainer)
- Technical implementation
- Performance optimization
- Architecture execution
- **Must maintain simulation/game separation**

### Ray (Narrative Designer)
- Framing and language
- Event text
- Endpoint descriptions
- **Must avoid false causation language**

### Sylvia (Research Skeptic)
- **FINAL AUTHORITY on research integrity**
- Parameter validation
- Scenario approval
- Misconception prevention

---

## Risk Register

| Risk | Impact | Mitigation | Owner |
|------|--------|------------|-------|
| Parameter drift during "balancing" | Research validity compromised | Sylvia veto on all balance changes | Sylvia |
| Tutorial oversimplification | Player misconceptions | Sylvia review of all educational content | Sylvia |
| UI obscures uncertainty | False precision impression | Sylvia review of all data displays | Sylvia + Tessa |
| Gameplay pressure overrides research | Simulation becomes invalid | Escalation to user, research default | Sylvia |
| Scenario deviation exceeds bounds | Results not comparable to research | Mandatory Monte Carlo validation | Sylvia + Roy |

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Current Session | Initial creation with Research Integrity Authority formalization |

---

## Approvals

| Role | Agent | Status | Date |
|------|-------|--------|------|
| Research Integrity Authority | Sylvia | ESTABLISHED | Current Session |
| Game Design Lead | Maya | Pending Acknowledgment | - |
| UX Lead | Tessa | Pending Acknowledgment | - |
| Technical Lead | Roy | Pending Acknowledgment | - |
| Narrative Lead | Ray | Pending Acknowledgment | - |
