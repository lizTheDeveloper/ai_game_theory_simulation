# God Mode Specification
## Manual Simulation Control System

**Created:** December 6, 2025 (Migrated from game-design plans)
**Purpose:** Comprehensive manual control interface exposing ALL automated simulation decisions
**Status:** Planning Phase

**Parent Spec:** [Simulation](../spec.md)

---

## Purpose

God Mode UI provides comprehensive manual control over ALL automated simulation decisions. Allows users to:
- Override government policy decisions
- Control individual AI agent actions
- Set society priorities and responses
- Adjust organizational strategies
- Intervene in any phase's automated logic
- See what each actor is prioritizing
- Make real-time decisions during simulation

**Design Philosophy:** Total transparency and control - no automated decision should be hidden from user intervention.

---

## Requirements

### Requirement: Policy Override Control
The system SHALL allow manual override of all government policy decisions.

#### Scenario: Climate Policy Override
- WHEN user enables God Mode
- THEN they MUST see all automated climate policy decisions
- AND they MUST be able to override each decision
- AND overrides MUST persist for simulation duration
- AND simulation MUST use overridden values instead of automated decisions

### Requirement: AI Agent Control
The system SHALL allow manual control of individual AI agent actions.

#### Scenario: Agent Decision Override
- WHEN an AI agent makes a decision
- THEN user MUST see the decision in God Mode panel
- AND user MUST be able to override it
- AND simulation MUST use overridden value
- AND agent's future decisions MUST account for override

### Requirement: Society Priority Control
The system SHALL allow manual setting of society priorities.

#### Scenario: Resource Allocation Override
- WHEN society allocates resources automatically
- THEN user MUST see allocation breakdown
- AND user MUST be able to redirect resources
- AND changes MUST propagate to affected systems

### Requirement: Phase Intervention
The system SHALL allow intervention in any phase's automated logic.

#### Scenario: Per-Phase Control Panels
- WHEN simulation executes a phase
- THEN God Mode MUST show phase decisions
- AND user MUST be able to intervene before phase completes
- AND intervention MUST override phase's automated logic

### Requirement: Actor Visibility
The system SHALL show what each actor is prioritizing.

#### Scenario: Decision Transparency
- WHEN actors make decisions
- THEN God Mode MUST display their priorities
- AND reasoning (if available)
- AND confidence levels
- AND alternative options considered

### Requirement: Real-Time Decision Making
The system SHALL allow real-time decisions during simulation.

#### Scenario: Pause and Intervene
- WHEN critical decision point occurs
- THEN simulation MAY pause automatically (user configurable)
- AND user MUST be able to make decision manually
- AND simulation MUST resume with user's choice

---

## Architecture

### God Mode State

```typescript
interface GodModeState {
  enabled: boolean;
  interventions: {
    government: PolicyOverride[];
    aiAgents: AgentOverride[];
    society: SocietyOverride[];
    organizations: OrgOverride[];
  };
  pauseOnDecisions: boolean;
  pendingDecisions: PendingDecision[];
}
```

### Override Types

```typescript
interface PolicyOverride {
  phase: string;
  decision: string;
  automated: any;
  manual: any;
  timestamp: number;
}

interface AgentOverride {
  agentId: string;
  decision: string;
  automated: any;
  manual: any;
  reasoning?: string;
}
```

---

## Integration

### Simulation Integration

**Phase modification:**
```typescript
function executePhase(state: GameState, rng: () => number, godMode: GodModeState) {
  // Check for overrides
  if (godMode.enabled) {
    const override = findOverride(godMode, phaseName);
    if (override) {
      return applyOverride(state, override);
    }
  }

  // Normal automated logic
  return automatedPhaseLogic(state, rng);
}
```

### Frontend Integration

**Dashboard location:** Accessible from main dashboard with per-phase control panels

**UI Components:**
- GodModeToggle - Enable/disable God Mode
- PhaseControlPanel - Per-phase intervention controls
- ActorPriorityView - Show actor decision-making
- OverrideHistory - Track manual interventions
- DecisionQueue - Pending decisions awaiting user input

---

## Implementation Phases

### Phase 1: Core Infrastructure
- [ ] GodModeState interface
- [ ] Override storage and retrieval
- [ ] Phase integration hooks
- [ ] Basic UI toggle

### Phase 2: Government Control
- [ ] Policy decision overrides
- [ ] Climate policy panel
- [ ] Economic policy panel
- [ ] Social policy panel

### Phase 3: AI Agent Control
- [ ] Agent decision visibility
- [ ] Per-agent override controls
- [ ] Agent priority visualization
- [ ] Collective agent orchestration

### Phase 4: Society & Organization Control
- [ ] Society priority overrides
- [ ] Resource allocation controls
- [ ] Organizational strategy overrides
- [ ] Coordination quality adjustment

### Phase 5: Real-Time Decision System
- [ ] Pause-on-decision mechanism
- [ ] Decision queue system
- [ ] Multi-option selection UI
- [ ] Fast-forward/skip system

---

## Design References

**Archived design docs:**
- `plans/archive/game-design/GOD_MODE_UI_DESIGN.md` - Detailed UI mockups
- `plans/archive/game-design/GAME_DESIGN_DOCUMENT.md` - Overall game design context
- `plans/archive/game-design/SCENARIO_SETUP_DESIGN.md` - Scenario configuration

**Related specs:**
- [Frontend Dashboard](../../frontend/spec.md) - Dashboard integration
- [Simulation Architecture](../spec.md) - Phase-based execution

---

## Success Criteria

**Functional:**
- Every automated decision is visible in God Mode
- Every automated decision can be overridden
- Overrides persist for simulation duration
- Simulation respects all manual interventions

**Usability:**
- God Mode toggle accessible from main dashboard
- Per-phase controls clearly organized
- Decision queue shows pending items
- Override history tracks manual changes

**Performance:**
- God Mode UI renders in <16ms (60fps)
- Override checks don't slow simulation (<1ms overhead)
- Decision queue handles 100+ pending items

---

## Open Questions

1. **Granularity:** How fine-grained should control be? (per-phase vs per-decision vs per-calculation)
2. **Automation:** Can users create rules for repeated interventions?
3. **Scenarios:** How does God Mode interact with scenario presets?
4. **Multiplayer:** How would God Mode work in multiplayer scenarios?
5. **AI Assistance:** Should God Mode suggest alternatives based on research?

---

## Related Specifications

- [Parent: Simulation](../spec.md)
- [Frontend Dashboard](../../frontend/spec.md)
- [Quality of Life Metrics](../spec.md#requirement-quality-of-life-modeling)
- [AI Capabilities](../spec.md#requirement-ai-capabilities-modeling)

---

## Contributing

**To add God Mode controls:**
1. Create change proposal in `openspec/changes/god-mode-[feature]/`
2. Specify which automated decisions become manual
3. Design UI for intervention
4. Implement override mechanism
5. Test that simulation respects overrides
6. Merge delta into this spec
