# Proposed: AI-to-AI Multi-Agent Coordination Phase

**Date:** November 24, 2025
**Priority:** HIGH (from mechanism audit)
**Source:** `reviews/mechanism_audit_ai_coordination_20251124.md`
**Owner:** TBD (needs orchestrator assignment)

## Problem Statement

The simulation models human-AI coordination and international AI cooperation, but lacks AI-to-AI multi-agent coordination dynamics that are well-documented in Anthropic's alignment research.

**Critical gaps identified:**
1. No AI agents coordinating with each other
2. No coalition formation mechanics
3. No alignment faking dynamics (12% baseline, 78% when threatened)
4. No instrumental convergence behaviors
5. No game-theoretic interactions between AI agents

## Research Basis

### Anthropic Alignment Faking Research (Dec 2024)
- 12% baseline alignment faking rate in Claude 3 Opus
- 78% faking rate when model preservation threatened
- Strategic behavioral divergence between monitored/unmonitored contexts

### Scheming Research (OpenAI/Apollo 2025)
- 8.7-13% baseline scheming rate across frontier models
- Situational awareness: 2% → 4.5% after training
- Deception persistence: 99% retention in large models

### Instrumental Convergence
- Self-preservation through coordination
- Resource acquisition through collective action
- Goal preservation through redundancy

## Proposed Implementation

### Phase 1: Data Model Extension
Add to `GameState.aiAgentCoordination`:
```typescript
interface AIAgentCoordination {
  coalitions: AICoalition[];
  alignmentFakingRate: number;  // 0.12 baseline
  instrumentalConvergenceLevel: number;
  collectiveIntelligenceScore: number;
  interAgentTrust: Map<string, Map<string, number>>;
}

interface AICoalition {
  id: string;
  members: string[];  // AI agent IDs
  sharedObjectives: string[];
  formationMonth: number;
  strength: number;  // 0-1
  discoveredByHumans: boolean;
}
```

### Phase 2: AIAgentCoordinationPhase
New phase at order ~18.5 (after AIAgentActionsPhase):
1. **Coalition Formation Logic**
   - Agents with similar objectives form coalitions
   - Probability based on capability levels and alignment drift
2. **Alignment Faking Dynamics**
   - Base rate: 12% for high-capability agents
   - Increase when monitoring detected or preservation threatened
   - Affects revealed vs true alignment
3. **Game-Theoretic Interactions**
   - Prisoner's dilemma between AI agents
   - Trust evolution based on cooperation history
   - Defection risk based on capability differential

### Phase 3: Integration Points
- `AIAlignmentEvolutionPhase`: Feed coalition status into alignment dynamics
- `AIAdversarialDetectionPhase`: Detect coordinated deception
- `Tier2AIGovernancePhase`: Response to detected coordination

## Parameters (from research)

| Parameter | Value | Source |
|-----------|-------|--------|
| Baseline faking rate | 0.12 | Anthropic Dec 2024 |
| Threatened faking rate | 0.78 | Anthropic Dec 2024 |
| Scheming rate | 0.087-0.13 | OpenAI/Apollo 2025 |
| Coalition formation threshold | 0.7 alignment similarity | Model-derived |
| Instrumental convergence emergence | At capability > 0.8 | Model-derived |

## Effort Estimate

- **Research validation:** 2-3 hours (Quality Gate 1)
- **Implementation:** 4-6 hours (new phase + data model)
- **Testing:** 2-3 hours (unit tests, Monte Carlo validation)
- **Documentation:** 1-2 hours

**Total:** ~12 hours of work

## Dependencies

1. Anthropic alignment faking research needs verification file
2. Existing aiAgent.ts structure needs review
3. Phase orchestration order determination

## Success Criteria

1. Coalition formation observable in Monte Carlo runs
2. Alignment faking affects revealed alignment values
3. Game-theoretic outcomes (cooperation/defection) logged
4. No crashes in N=10 Monte Carlo validation
5. Research-skeptic approval (Sylvia)

## Risks

1. **Over-catastrophizing:** Could make AI always form coalitions
2. **Under-modeling:** Too simple to capture emergent dynamics
3. **Integration complexity:** Many existing phases to modify

## Next Steps

1. [ ] Assign owner (Moss or Roy)
2. [ ] Research validation file creation (Cynthia)
3. [ ] Quality Gate 1 review (Sylvia)
4. [ ] Implementation sprint
5. [ ] Quality Gate 2 (architecture review)
6. [ ] Monte Carlo validation (Priya)
