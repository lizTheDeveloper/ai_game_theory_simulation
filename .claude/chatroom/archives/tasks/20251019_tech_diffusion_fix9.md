# Research Task Specification: Fix #9 - Technology Diffusion Recalibration

**Date:** 2025-10-19
**Agent:** orchestrator-1
**Feature:** Fix #9: Technology Diffusion Recalibration
**Priority:** Week 3-4 of Post-Recalibration Fixes

## Context

**Issue:** Current technology deployment speed is static and doesn't scale with AI capability levels. This means that even when AIs reach superhuman levels (capability > 4.0), they deploy breakthrough technologies at the same pace as early-stage AIs.

**Real-world observation:** McKinsey (2024) and Foundation Capital (2024) both document that higher AI capabilities dramatically accelerate technology diffusion, deployment, and scaling timelines.

**Current implementation:** `src/simulation/techTree/regionalDeployment.ts` has `calculateDeploymentSpeed()` that considers regional factors (economic capacity, infrastructure, political stability) but does NOT consider AI capability level.

**Expected impact:** Faster technology deployment when AI capabilities are high should enable crisis prevention, leading to +2-5% humane utopia rate.

## Research Questions

### Primary Questions

1. **AI-Accelerated Technology Diffusion (McKinsey 2024, Foundation Capital 2024)**
   - How much faster do high-capability AIs accelerate technology deployment?
   - At what AI capability threshold does acceleration become significant?
   - What is the scaling relationship? (linear, logarithmic, exponential)
   - Are there diminishing returns at very high capability levels?

2. **Deployment Speed Multipliers**
   - What is the empirical range for deployment speed increases?
   - Current roadmap suggests 1.5x faster when AI capability > 4.0 - is this justified?
   - Should the multiplier be graduated (1.2x at capability 3.0, 1.5x at 4.0, 2.0x at 5.0)?
   - What are the realistic upper bounds? (can't deploy instantly)

3. **Constraint Mechanisms**
   - What prevents instant deployment even with superhuman AI?
   - Physical constraints (manufacturing, construction, logistics)
   - Regulatory constraints (safety testing, approval processes)
   - Social constraints (adoption resistance, training needs)
   - Economic constraints (capital availability, resource limits)

### Secondary Questions

4. **Technology-Specific Variations**
   - Do different technology categories scale differently with AI capability?
   - Example: Digital tech (software) deploys faster than physical tech (infrastructure)?
   - Medical tech has regulatory hurdles regardless of AI capability?

5. **Regional Variations**
   - Do developed vs developing regions benefit equally from AI acceleration?
   - Does high AI capability compensate for poor infrastructure in Africa?
   - Or does it amplify existing deployment speed advantages in North America/Europe?

6. **Crisis Interaction**
   - Does AI-accelerated deployment help more during crises (emergency mode)?
   - Or does crisis chaos negate AI advantages?

## Research Standards

**Required:**
- 2+ peer-reviewed sources from 2024-2025
- Quantitative data on deployment speed increases
- Explicit parameter justification (why 1.5x and not 1.2x or 2.0x?)
- Mechanism description (HOW does AI accelerate deployment)
- Failure modes (what can still go wrong)
- Timeline expectations (when does acceleration matter)

**Output Format:**
- File: `research/ai-accelerated-tech-diffusion_20251019.md`
- Include: Executive summary, research findings, parameter recommendations, citations
- Recommend: Specific implementation approach (where to add capability scaling in code)

## Implementation Preview

**Target location:** `src/simulation/techTree/regionalDeployment.ts:206-233` (calculateDeploymentSpeed function)

**Proposed change:**
```typescript
export function calculateDeploymentSpeed(tech: TechDefinition, region: string, gameState: GameState): number {
  // ... existing regional factors ...

  // NEW: AI capability scaling
  const avgCapability = getAverageAICapability(gameState);
  let capabilityMultiplier = 1.0;

  if (avgCapability > 4.0) {
    capabilityMultiplier = 1.5; // Research-backed value
  } else if (avgCapability > 3.0) {
    capabilityMultiplier = 1.2; // Graduated scaling
  }

  speed *= capabilityMultiplier;

  // ... existing crisis modifiers ...
  return Math.max(0.1, Math.min(3.0, speed)); // Cap to prevent instant deployment
}
```

**Research should validate:**
- Are the capability thresholds (3.0, 4.0) correct?
- Are the multipliers (1.2x, 1.5x) justified by evidence?
- Should there be upper bounds beyond 3.0x cap?
- Should physical vs digital tech scale differently?

## Success Criteria

Research is complete when:
- ✅ 2+ peer-reviewed sources (2024-2025) found and cited
- ✅ Deployment speed multipliers justified with data
- ✅ Capability thresholds explained (why 3.0 and 4.0)
- ✅ Constraint mechanisms documented
- ✅ Failure modes identified
- ✅ Implementation recommendations clear
- ✅ Ready for research-skeptic validation (Quality Gate 1)

## Handoff to Research-Skeptic

After research is complete, orchestrator will invoke research-skeptic to validate:
- Methodological soundness
- Parameter justification quality
- Contradictory evidence check
- Overconfidence detection
- Implementation feasibility

**Quality gate:** Must pass critique before feature-implementer is invoked.
