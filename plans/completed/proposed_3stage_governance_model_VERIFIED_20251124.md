# 3-Stage Governance Model Implementation Plan

**Date:** November 24, 2025
**Priority:** HIGH
**Complexity:** 4 systems (government, crisis response, mortality, deployment curves)
**Owner:** Moss (feature-implementer)
**Research:** `research/ai_coordination_transition_management_20251121.md`

## Overview

Implement a 3-stage governance response model for AI-coordinated crisis management:
- **Stage 1 (Recognition):** Detection of crisis (0-6 months)
- **Stage 2 (Decision):** Policy formation (6-18 months)
- **Stage 3 (Implementation):** Deployment at scale (18-36 months)

### Key Parameters (from research)

- **Coordination effectiveness:** 32-37% excess mortality reduction
- **Deployment pacing:** S-curve adoption (innovators → early adopters → early majority)

## Current State Analysis

### What Already Exists

1. **CoordinatedDeploymentPhase** (order 10.5) - `src/simulation/engine/phases/CoordinatedDeploymentPhase.ts`
   - Coordination quality assessment
   - Support system effectiveness (UBI, healthcare, food security)
   - Deployment pace factor with time scaling
   - Regional heterogeneity
   - Power-law mortality scaling

2. **EmergencyResponsePhase** - Fast crisis response
   - Emergency tech deployment acceleration
   - Crisis detection mechanisms

3. **Government capability thresholds** - `src/simulation/government/capabilityThresholds.ts`
   - `REGULATORY_LAG_MONTHS = 12`
   - `EMERGENCY_RESPONSE_MONTHS = 3`

### What Needs to Be Added

The explicit 3-stage governance pipeline with:
1. Stage tracking state
2. Stage transition logic
3. Effectiveness modifiers per stage
4. S-curve deployment pacing

## Implementation Specification

### 1. Type Definitions

Add to `src/types/transitionManagement.ts`:

```typescript
export interface GovernanceStage {
  name: 'recognition' | 'decision' | 'implementation';
  startMonth: number;
  duration: {
    minimum: number;  // months
    maximum: number;  // months
    actual: number;   // resolved duration
  };
  effectivenessMultiplier: number;  // 0-1, lower early, higher later
}

export interface GovernanceResponsePipeline {
  currentStage: 'dormant' | 'recognition' | 'decision' | 'implementation' | 'active';
  crisisDetectedMonth?: number;
  stages: {
    recognition: GovernanceStage;
    decision: GovernanceStage;
    implementation: GovernanceStage;
  };
  totalDelayMonths: number;  // Sum of all stage durations
  coordinationEffectivenessAtScale: number;  // 0.32-0.37 target
}

// S-curve adoption parameters
export interface DeploymentPacingCurve {
  model: 'logistic' | 'bass-diffusion';
  innovatorsShare: number;      // ~2.5%
  earlyAdoptersShare: number;   // ~13.5%
  earlyMajorityShare: number;   // ~34%
  saturationTime: number;       // months to reach 84% adoption
}
```

### 2. State Initialization

Add to `src/simulation/initialization.ts`:

```typescript
transitionManagementSystem: {
  // ... existing fields ...
  governanceResponse: {
    currentStage: 'dormant',
    stages: {
      recognition: {
        name: 'recognition',
        startMonth: 0,
        duration: { minimum: 0, maximum: 6, actual: 0 },
        effectivenessMultiplier: 0.1  // Limited coordination during detection
      },
      decision: {
        name: 'decision',
        startMonth: 0,
        duration: { minimum: 6, maximum: 18, actual: 0 },
        effectivenessMultiplier: 0.4  // Policy formation ongoing
      },
      implementation: {
        name: 'implementation',
        startMonth: 0,
        duration: { minimum: 18, maximum: 36, actual: 0 },
        effectivenessMultiplier: 0.8  // Deployment at scale
      }
    },
    totalDelayMonths: 0,
    coordinationEffectivenessAtScale: 0.345  // Midpoint of 32-37%
  },
  deploymentPacing: {
    model: 'bass-diffusion',
    innovatorsShare: 0.025,
    earlyAdoptersShare: 0.135,
    earlyMajorityShare: 0.34,
    saturationTime: 60  // 5 years to 84%
  }
}
```

### 3. Stage Transition Logic

Add method to `CoordinatedDeploymentPhase`:

```typescript
private updateGovernanceStage(state: GameState, crisis: CrisisType): void {
  const pipeline = state.transitionManagementSystem.governanceResponse;

  // Trigger recognition on crisis detection
  if (pipeline.currentStage === 'dormant' && this.detectsCrisis(state, crisis)) {
    pipeline.currentStage = 'recognition';
    pipeline.crisisDetectedMonth = state.currentMonth;
    pipeline.stages.recognition.startMonth = state.currentMonth;
    console.log(`🔍 CRISIS RECOGNIZED (Month ${state.currentMonth}): Governance response initiated`);
  }

  // Progress through stages based on duration
  const monthsInStage = state.currentMonth - pipeline.stages[pipeline.currentStage]?.startMonth;

  if (pipeline.currentStage === 'recognition' && monthsInStage >= 6) {
    this.transitionToDecision(state);
  } else if (pipeline.currentStage === 'decision' && monthsInStage >= 12) {
    this.transitionToImplementation(state);
  } else if (pipeline.currentStage === 'implementation' && monthsInStage >= 18) {
    pipeline.currentStage = 'active';
    console.log(`✅ GOVERNANCE RESPONSE ACTIVE (Month ${state.currentMonth}): Full coordination effectiveness`);
  }
}
```

### 4. S-Curve Deployment Pacing

Add utility function:

```typescript
/**
 * Bass diffusion model for technology adoption S-curve
 *
 * f(t) = ((p + q)^2 / p) × e^(-(p+q)t) / (1 + (q/p)e^(-(p+q)t))^2
 *
 * Where:
 * - p = innovation coefficient (external influence) ~0.03
 * - q = imitation coefficient (internal influence) ~0.38
 *
 * @param monthsSinceStart - Months since deployment began
 * @param saturationTime - Months to reach market saturation
 * @returns Adoption rate [0, 1]
 */
export function calculateAdoptionRate(
  monthsSinceStart: number,
  saturationTime: number = 60,
  p: number = 0.03,
  q: number = 0.38
): number {
  const t = monthsSinceStart / saturationTime;
  const pqSum = p + q;
  const expTerm = Math.exp(-pqSum * t);
  const denominator = 1 + (q / p) * expTerm;
  return 1 - (1 / denominator);  // Cumulative adoption
}
```

### 5. Integration Points

1. **Crisis Detection:** Connect to `EmergencyResponsePhase` crisis triggers
2. **Mortality Reduction:** Multiply existing coordination effectiveness by stage multiplier
3. **Deployment Speed:** Apply S-curve pacing to technology rollout
4. **Logging:** Add stage transition events to game log

### 6. Research Validation

The 32-37% mortality reduction effectiveness should be validated against:
- Sullivan & von Wachter (2009): +50-100% mortality year 1 without coordination
- China coordinated approach: 65% child mortality reduction
- Finkelstein et al. (2025): Recession mortality patterns

## Testing Strategy

1. **Unit Tests:**
   - Stage transition timing (0-6, 6-18, 18-36 month boundaries)
   - S-curve adoption curve shape validation
   - Effectiveness multiplier calculation

2. **Integration Tests:**
   - Full pipeline from crisis → recognition → decision → implementation → active
   - Mortality reduction matches 32-37% target
   - Regional heterogeneity preserved

3. **Monte Carlo Validation:**
   - N=10 runs comparing with/without 3-stage model
   - Verify outcome distribution changes appropriately

## Files to Modify

1. `src/types/transitionManagement.ts` - Add type definitions
2. `src/simulation/initialization.ts` - Add state initialization
3. `src/simulation/engine/phases/CoordinatedDeploymentPhase.ts` - Add stage logic
4. `src/simulation/utils/deploymentCurves.ts` (NEW) - S-curve utility functions

## Estimated Effort

- Type definitions: 30 min
- State initialization: 30 min
- Stage transition logic: 2 hours
- S-curve implementation: 1 hour
- Integration/testing: 2 hours
- Documentation: 30 min

**Total: ~6-7 hours**

## Success Criteria

1. Stage transitions occur at correct timing boundaries
2. Coordination effectiveness scales with stage (0.1 → 0.4 → 0.8 → 1.0)
3. S-curve deployment pacing applied to technology rollout
4. 32-37% mortality reduction achieved in coordinated scenarios
5. Monte Carlo validates improved outcomes vs baseline
