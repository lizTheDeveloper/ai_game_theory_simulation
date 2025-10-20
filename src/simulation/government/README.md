# Government System Integration

This directory contains the **adapter layer** that connects the standalone `@political-science/government-agents` package to the main simulation.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│         Main Simulation (src/simulation/)           │
│  - AI agents, environmental systems, tech tree      │
└───────────────┬─────────────────────────────────────┘
                │
                ├─> AI Capability Events
                ├─> Environmental Crises
                ├─> Policy Needs
                │
┌───────────────▼─────────────────────────────────────┐
│         Government System Adapter                   │
│  - Translates simulation → government package       │
│  - Translates government → simulation               │
│  - Manages 30 government agents                     │
└───────────────┬─────────────────────────────────────┘
                │
                ├─> Policy Stimuli
                ├─> Coalition Events
                ├─> Election Cycles
                │
┌───────────────▼─────────────────────────────────────┐
│    @political-science/government-agents Package     │
│  - Pure TypeScript, standalone                      │
│  - Coalition formation, policy response, elections  │
└─────────────────────────────────────────────────────┘
```

## Integration Points

### 1. AI Events → Government Response

```typescript
// AI capability breakthrough detected
const aiEvent: AICapabilityEvent = {
  capability: 'AGI',
  alignment: 0.7,
  publicVisibility: 0.8,
};

// Translate to policy stimulus
const stimulus = aiEventToStimulus(aiEvent);

// Government responds (uses comprehension lag)
const response = government.respondToPolicy(stimulus);

// Apply response to simulation
applyPolicyResponse(state, response);
```

### 2. Environmental Crises → Government Action

```typescript
// Climate crisis threshold crossed
const crisis: EnvironmentalCrisis = {
  type: 'CLIMATE',
  severity: 0.9,
};

// Governments respond (based on state capacity)
for (const gov of governments) {
  const response = gov.respondToCrisis(crisis);
  applyEnvironmentalPolicy(state, gov, response);
}
```

### 3. Government Policies → Tech Deployment

```typescript
// Government passes AI regulation
const policy: GovernmentPolicy = {
  domain: 'TECHNOLOGY',
  strength: 0.8,
  effectiveness: 0.7,
};

// Affect tech tree deployment speed
state.techTree.deploymentSpeed *= policy.effectiveness;
state.aiRisk.regulationLevel = policy.strength;
```

### 4. International Treaties → Global Coordination

```typescript
// Attempt AI safety treaty
const treaty = attemptTreaty(governments, {
  topic: 'AI_SAFETY',
  requiredSupport: 0.67, // 2/3 majority
});

if (treaty.passed) {
  // Apply global regulation
  state.aiRisk.globalRegulation = treaty.strength;
}
```

## Files

### Core Integration

- **`GovernmentSystemAdapter.ts`**: Main adapter connecting simulation to package
- **`PolicyTranslator.ts`**: Translates events between simulation and package
- **`InternationalCoordination.ts`**: Multi-government treaty formation

### Phases

The government system is integrated into the simulation phase architecture:

- **`GovernmentResponsePhase.ts`**: Governments respond to policy stimuli
- **`ElectionPhase.ts`**: Handle election cycles
- **`CoalitionFormationPhase.ts`**: Form/update coalitions
- **`InternationalTreatyPhase.ts`**: Coordinate international agreements

Register these phases in `src/simulation/engine/PhaseOrchestrator.ts`.

## Testing

Integration tests verify:

1. AI events trigger government responses
2. Government policies affect simulation state
3. International treaties can form and be enforced
4. Election cycles work correctly
5. Coalition changes affect policy responsiveness

## Performance

The government system adds minimal overhead:

- Coalition formation: O(n²) for n parties (max 10 parties = 100 checks)
- Policy response: O(1) calculations
- Elections: O(n) for n parties
- **Target**: <5% total simulation runtime increase

## Future Extensions

When open-sourcing the package:

1. **Remove simulation dependencies** from package (already done)
2. **Publish to npm**: `@political-science/government-agents`
3. **Write research paper**: Validate against 2020-2024 coalition data
4. **Create demo site**: Interactive coalition formation tool
