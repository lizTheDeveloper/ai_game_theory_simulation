# Post-Recalibration Fixes Implementation Plan

**Date Created:** October 18, 2025
**Date Completed:** October 19, 2025 (Fixes #1-5, #7, #8)
**Status:** COMPLETE - Fixes #1-5, #7, #8 implemented and validated
**Priority:** CRITICAL (Week 1-4)
**Source:** Architecture review + research findings after AI capability recalibration v3

## Executive Summary

AI capability baseline recalibration v3 (0.25 → 3.10, 12.4x increase) exposed systemic issues causing 99% dystopia rate. Architecture-skeptic identified 9 issues; super-alignment-researcher provided evidence-based solutions from 26 peer-reviewed sources (2024-2025).

**Expected Impact:** Dystopia rate 99% → 60-70%, Utopia rate 0% → 5-15%, Water crisis 83% → 40-50%

**Source Documents:**
- Architecture Review: `/reviews/post-recalibration-architecture_20251017.md`
- Research Solutions: `/research/post-recalibration-solutions_20251018.md`
- Monte Carlo Validation: `/logs/mc_n100_240mo_20251017.log`

---

## Critical Issues (Week 1: 5 days effort)

### 1. War Death Multiplier Cap (1 day, Complexity: 2 systems)

**Issue:** Uncapped war multiplier compounds to 3.5x+ with 10+ conflicts (92.3% of deaths from war)
**Location:** `/src/simulation/populationDynamics.ts:277`

**Current Code:**
```typescript
const warMultiplier = activeConflicts > 0 ? 1.5 + (activeConflicts * 0.2) : 1.0;
```

**Research Foundation:**
- ECFR (2024): Force multiplication plateaus, not unlimited
- CSET Georgetown (2024): Autonomous weapons as force multipliers
- UN consensus: Flash war risk from speed, not simple lethality

**Fix Implementation:**
```typescript
const BASE_WAR_MULTIPLIER = 1.5;
const WAR_MULTIPLIER_PER_CONFLICT = 0.15;  // Reduced from 0.2
const MAX_WAR_MULTIPLIER = 2.0;  // HARD CAP

const uncappedMultiplier = activeConflicts > 0
  ? BASE_WAR_MULTIPLIER + (activeConflicts * WAR_MULTIPLIER_PER_CONFLICT)
  : 1.0;
const warMultiplier = Math.min(uncappedMultiplier, MAX_WAR_MULTIPLIER);
```

**Expected Impact:** War deaths 92% → 30-40% of total deaths (-50% dystopia rate)

**Validation:** Monte Carlo N=10, 120 months - check war death percentage < 50%

---

### 2. Decouple Trust from AI Capability (2-3 days, Complexity: 5 systems)

**Issue:** Trust collapses when AI capability > 2.0, but baseline is 3.10 (breaks utopia pathways)
**Location:** `/src/simulation/socialCohesion.ts` (trust calculation), `/src/simulation/upwardSpirals.ts:151-153`

**Current Code:**
```typescript
// Cognitive spiral requires capability > 1.5 AND trust > 0.6
const cognitiveEnhanced = avgAICapability > 1.5 && trustInAI > 0.6;
// But trust calculation penalizes capability > 2.0
```

**Research Foundation:**
- University of Melbourne + KPMG (2025): 46% trust AI, trust based on benefits NOT capability
- Siala & Wang (2024): Trust threshold 0.6 = acceptance (3.0 on 5-point scale)
- Edelman (2024): High-trust companies 2.6x more likely successful AI adoption
- DORA (2024): Trust correlates with productivity benefits, not absolute capability

**Fix Implementation:**

**1. Update trust calculation** (socialCohesion.ts):
```typescript
// OLD: trust = f(absolute_capability) with penalty > 2.0
// NEW: trust = f(alignment_quality, demonstrated_benefits, explainability, safety_record)

function calculateTrustInAI(state: GameState): number {
  const alignmentQuality = calculateAlignmentQuality(state);  // 0-1 based on misalignment rate
  const demonstratedBenefits = state.globalMetrics.qualityOfLife > 0.5 ? 0.2 : 0;  // Has AI helped?
  const explainability = state.aiTransparency?.level || 0.5;  // Transparency systems
  const safetyRecord = calculateSafetyRecord(state);  // No incidents = higher trust
  const capabilityFear = calculateCapabilityFear(state);  // Only fear rapid changes

  const baseTrust = (alignmentQuality * 0.4) + (demonstratedBenefits * 0.2)
                  + (explainability * 0.2) + (safetyRecord * 0.2);

  return Math.max(0, Math.min(1, baseTrust - capabilityFear));
}

function calculateCapabilityFear(state: GameState): number {
  // Fear only on rapid capability changes (>0.5/month), not absolute level
  const capabilityChangeRate = state.aiMetrics.capabilityChangeRate || 0;
  if (capabilityChangeRate > 0.5) {
    return Math.min(0.3, capabilityChangeRate * 0.2);  // Max 30% fear penalty
  }
  return 0;
}
```

**2. Add trust thresholds** (new file: `/src/simulation/trustThresholds.ts`):
```typescript
export const TRUST_THRESHOLD_ACCEPTANCE = 0.6;   // 60% on 0-1 scale
export const TRUST_THRESHOLD_REJECTION = 0.3;    // Active resistance
export const TRUST_THRESHOLD_EMBRACE = 0.75;     // Enthusiastic adoption
```

**3. Update spiral conditions** (upwardSpirals.ts):
```typescript
// OLD: avgAICapability > 1.5 && trustInAI > 0.6
// NEW: demonstratedBenefits && trustInAI > 0.6 && explainability > 0.5

const cognitiveSpiral =
  state.globalMetrics.qualityOfLife > 0.5 &&  // Benefits demonstrated
  state.society.trustInAI > TRUST_THRESHOLD_ACCEPTANCE &&
  (state.aiTransparency?.level || 0) > 0.5;  // Sufficient explainability
```

**Expected Impact:** Enables utopia pathways, -30-40% dystopia rate

**Validation:** Monte Carlo N=10, 120 months - check utopia rate > 0%, trust stays > 0.4

---

### 3. AI Infrastructure Resource Consumption (2 days, Complexity: 4 systems)

**Issue:** AI infrastructure water/energy not modeled (causes 83% water crisis frequency)
**Location:** `/src/simulation/planetaryBoundaries.ts` (freshwater calculations)

**Research Foundation:**
- UC Riverside + UT Austin (2024): GPT-3 training = 700K liters, GPT-4 = 5.4M liters
- US DOE (2024): H100 GPU = 700W (10.2 kW per 8-GPU server)
- RAND (2024): AI data centers 200 MW average (vs 30 MW traditional)
- Microsoft (2024): WUE improving 5%/year (0.49 → 0.30 in 3 years)

**Fix Implementation:**

**1. Create AI resource consumption module** (new file: `/src/simulation/aiInfrastructureResources.ts`):
```typescript
// Water consumption per AI capability point per month
const WATER_BASE_CONSUMPTION = 100;  // Million liters/month base
const WATER_PER_CAPABILITY_POINT = 50;  // +50M liters per aggregate capability point
const WATER_TRAINING_SPIKE = 5000;  // 5B liters for frontier model training

// Energy consumption (correlates with water via WUE)
const ENERGY_BASE_CONSUMPTION = 500;  // MW for all AI infrastructure
const ENERGY_PER_CAPABILITY_POINT = 200;  // +200 MW per aggregate capability point

// Water Usage Effectiveness (improves over time)
let WUE = 1.8;  // Liters per kWh (industry average 2024)
const WUE_IMPROVEMENT_RATE = 0.05;  // 5% improvement per year
const WUE_FLOOR = 0.3;  // Microsoft's 2024 achievement

export function calculateAIResourceConsumption(state: GameState): {
  waterConsumption: number;
  energyConsumption: number;
} {
  const totalCapability = state.aiMetrics.averageCapability * state.aiAgents.length;

  // Training water spikes when new frontier models trained
  const trainingWater = state.aiMetrics.newFrontierModelThisMonth ? WATER_TRAINING_SPIKE : 0;

  // Inference water (continuous based on capability)
  const inferenceWater = WATER_BASE_CONSUMPTION + (totalCapability * WATER_PER_CAPABILITY_POINT);

  const totalWater = trainingWater + inferenceWater;

  // Energy consumption
  const totalEnergy = ENERGY_BASE_CONSUMPTION + (totalCapability * ENERGY_PER_CAPABILITY_POINT);

  // Improve WUE over time
  WUE = Math.max(WUE_FLOOR, WUE * (1 - WUE_IMPROVEMENT_RATE / 12));

  return {
    waterConsumption: totalWater,
    energyConsumption: totalEnergy
  };
}
```

**2. Integrate with planetary boundaries** (planetaryBoundaries.ts):
```typescript
import { calculateAIResourceConsumption } from './aiInfrastructureResources';

function updateFreshwaterBoundary(state: GameState) {
  const aiResources = calculateAIResourceConsumption(state);

  // Add AI water consumption to total withdrawal
  const totalWithdrawal = state.planetaryBoundaries.freshwaterWithdrawal
                        + (aiResources.waterConsumption / 1000);  // Convert to same units

  // Water stress threshold
  const WATER_STRESS_THRESHOLD = 500;  // M liters/month sustainable

  if (totalWithdrawal > WATER_STRESS_THRESHOLD) {
    // Trigger water insecurity crisis
    state.crises.waterInsecurity = true;
  }
}
```

**3. Add capability constraint** (aiCapabilityGrowth.ts):
```typescript
// Higher capability requires more resources - constraint relationship
if (totalAICapability > 5.0 && state.resources.waterAvailability < WATER_STRESS_THRESHOLD) {
  // 50% slower growth if water-constrained
  capabilityGrowth *= 0.5;
}
```

**Expected Impact:** Water crisis 83% → 40-50%, realistic resource constraints (-15-20% crisis cascades)

**Validation:** Monte Carlo N=10, 120 months - check water crisis < 60%, capability growth slows when constrained

---

## High Priority Fixes (Week 2: 9 days effort)

### 4. Fix Upward Spiral Trust Thresholds (2 days, Complexity: 3 systems)

**Issue:** Spiral activation requires capability + trust thresholds assuming gradual progress
**Location:** `/src/simulation/upwardSpirals.ts:233` (scientific spiral)

**Research Foundation:**
- McKinsey + IBM (2024): Enterprise AI adoption 55% → 78% in 1 year
- Frontiers Psychology (2024): Feedback loops +49% quality, +52% privacy understanding
- MDPI (2024): Only 21% redesigned workflows, strong correlation with benefits

**Fix Implementation:**

**1. Update scientific spiral** (upwardSpirals.ts):
```typescript
// OLD: Requires 4+ breakthroughs deployed > 50%
// NEW: Scale deployment requirement with AI capability

const deployedBreakthroughs = state.breakthroughTechnologies.filter(
  tech => tech.deploymentLevel > 0.5 && tech.impactLevel > 0.3
).length;

const deploymentThreshold = state.aiMetrics.averageCapability > 4.0 ? 3 : 4;  // Lower if high capability

const scientificSpiral = deployedBreakthroughs >= deploymentThreshold;
```

**2. Add workflow adaptation tracking** (new state in game.ts):
```typescript
interface Society {
  // ... existing fields
  workflowAdaptation: number;  // 0-1, starts at 0.21 (21% baseline)
}
```

**3. Update benefits calculation** (qualityOfLife.ts):
```typescript
// Benefits require workflow redesign, not just deployment
const workflowMultiplier = state.society.workflowAdaptation > 0.5 ? 1.0 : 0.3;  // Only 30% benefits without redesign
const aiBenefits = baseAIBenefits * workflowMultiplier;
```

**Expected Impact:** Enables scientific spiral activation, +2-5% utopia rate

**Validation:** Monte Carlo N=10, 120 months - check scientific spiral activates when breakthroughs deployed

---

### 5. Flash War Escalation Mechanics (3 days, Complexity: 5 systems)

**Issue:** Missing speed risk from AI weapons (only death multiplier modeled)
**Location:** `/src/simulation/geopolitics.ts` (conflict mechanics)

**Research Foundation:**
- ECFR (2024): Flash wars = autonomous systems escalate at machine speed
- Penn CERL (2024): Circuit breaker solutions (parallel to financial markets)
- UN resolution (2024): 166-3 consensus on AWS acceleration risk
- Current deployment: Ukraine drones, Israel "Lavender" system

**Fix Implementation:**

**1. Create flash war module** (new file: `/src/simulation/flashWarEscalation.ts`):
```typescript
const FLASH_WAR_THRESHOLD_CAPABILITY = 4.0;  // Above this, escalation speed risk
const FLASH_WAR_ESCALATION_CHANCE = 0.05;   // 5% per conflict/month to spiral
const FLASH_WAR_MULTIPLIER = 2.5;           // 2.5x casualties if flash war occurs
const CIRCUIT_BREAKER_DELAY = 3;            // 3 months to implement safeguards

export function checkFlashWarRisk(state: GameState, rng: RNGFunction): boolean {
  const avgCapability = state.aiMetrics.averageCapability;
  const activeConflicts = state.geopolitics.conflicts.filter(c => c.active).length;

  if (avgCapability < FLASH_WAR_THRESHOLD_CAPABILITY || activeConflicts === 0) {
    return false;
  }

  // Each active conflict has chance to escalate to flash war
  for (let i = 0; i < activeConflicts; i++) {
    if (rng() < FLASH_WAR_ESCALATION_CHANCE) {
      return true;
    }
  }

  return false;
}

export function applyFlashWarEffects(state: GameState): void {
  // Flash war causes 2.5x casualties before circuit breakers engage
  state.currentMonthDeaths.war *= FLASH_WAR_MULTIPLIER;

  // Trigger emergency circuit breaker development
  state.flashWarCircuitBreakerActive = true;
  state.flashWarCircuitBreakerMonthsRemaining = CIRCUIT_BREAKER_DELAY;

  // Event logging
  state.events.push({
    type: 'FlashWar',
    description: 'Autonomous weapon systems escalated conflict at machine speed',
    severity: 'CRITICAL',
    month: state.currentMonth
  });
}
```

**2. Add AI-mediated de-escalation** (same file):
```typescript
const DEESCALATION_CAPABILITY_THRESHOLD = 3.5;
const DEESCALATION_ALIGNMENT_THRESHOLD = 0.7;
const DEESCALATION_SUCCESS_RATE = 0.3;       // 30% chance to prevent escalation
const DEESCALATION_REDUCES_DEATHS = 0.4;     // 40% reduction if successful

export function attemptAIDeEscalation(state: GameState, rng: RNGFunction): boolean {
  const alignedAIs = state.aiAgents.filter(
    ai => ai.alignment > DEESCALATION_ALIGNMENT_THRESHOLD
       && ai.totalCapability > DEESCALATION_CAPABILITY_THRESHOLD
  );

  if (alignedAIs.length === 0) {
    return false;
  }

  if (rng() < DEESCALATION_SUCCESS_RATE) {
    // AI mediation successful
    state.currentMonthDeaths.war *= (1 - DEESCALATION_REDUCES_DEATHS);
    return true;
  }

  return false;
}
```

**Expected Impact:** Captures AI weapons risk accurately, adds circuit breaker potential (+3-7% catastrophe avoidance)

**Validation:** Monte Carlo N=10, 120 months - check flash wars occur when capability > 4.0, de-escalation works

---

### 6. Scale Water/Energy with Capability (2 days, Complexity: 3 systems)

**Issue:** Resource thresholds assume baseline consumption
**Location:** Multiple files (covered in #3 above)

**Implementation:** Integrated into fix #3 (AI Infrastructure Resource Consumption)

---

### 7. Trust Recovery Mechanics (2-3 days, Complexity: 4 systems)

**Issue:** No trust recovery pathway once collapsed
**Location:** `/src/simulation/socialCohesion.ts`

**Research Foundation:**
- Edelman (2024): Recovery via education, demonstrated benefits, visible impact
- Frontiers Psychology (2024): +49% output quality, +52% privacy with feedback loops
- DORA (2024): Continuous feedback critical for sustained trust

**Fix Implementation:**

**1. Add trust recovery system** (socialCohesion.ts):
```typescript
const TRUST_RECOVERY_FROM_EDUCATION = 0.01;           // +1%/month if education
const TRUST_RECOVERY_FROM_DEMONSTRATED_BENEFITS = 0.02;  // +2%/month if QoL improving
const TRUST_RECOVERY_FROM_SAFETY_RECORD = 0.015;      // +1.5%/month if no incidents
const TRUST_RECOVERY_FROM_EXPLAINABILITY = 0.01;      // +1%/month if transparency high
const TRUST_RECOVERY_CAP = 0.05;                      // Max +5%/month total

// Counterbalance: trust decay from negative events
const TRUST_DECAY_FROM_INCIDENT = 0.1;                // -10% per safety incident
const TRUST_DECAY_FROM_MISALIGNMENT = 0.05;           // -5% per detected misalignment
const TRUST_DECAY_FROM_MISTAKES = 0.01;               // -1%/month if errors common

export function updateTrustRecovery(state: GameState): void {
  let trustChange = 0;

  // Recovery factors
  if (state.policies.aiEducationCampaigns?.active) {
    trustChange += TRUST_RECOVERY_FROM_EDUCATION;
  }

  if (state.globalMetrics.qualityOfLifeTrend > 0) {
    trustChange += TRUST_RECOVERY_FROM_DEMONSTRATED_BENEFITS;
  }

  const safetyIncidents = state.events.filter(e =>
    e.type === 'AISafetyIncident' && e.month === state.currentMonth
  ).length;

  if (safetyIncidents === 0 && state.aiMetrics.monthsSinceLastIncident > 6) {
    trustChange += TRUST_RECOVERY_FROM_SAFETY_RECORD;
  }

  if ((state.aiTransparency?.level || 0) > 0.7) {
    trustChange += TRUST_RECOVERY_FROM_EXPLAINABILITY;
  }

  // Decay factors
  trustChange -= safetyIncidents * TRUST_DECAY_FROM_INCIDENT;
  trustChange -= state.aiMetrics.misalignmentsDetectedThisMonth * TRUST_DECAY_FROM_MISALIGNMENT;

  if (state.society.aiRelianceWithoutValidation > 0.66) {  // 66% don't validate AI
    trustChange -= TRUST_DECAY_FROM_MISTAKES;
  }

  // Apply capped change
  trustChange = Math.max(-0.1, Math.min(TRUST_RECOVERY_CAP, trustChange));

  state.society.trustInAI = Math.max(0, Math.min(1, state.society.trustInAI + trustChange));
}
```

**2. Add education campaign policy** (new state in game.ts):
```typescript
interface Policies {
  // ... existing fields
  aiEducationCampaigns?: {
    active: boolean;
    monthsActive: number;
    effectiveness: number;
  };
}
```

**Expected Impact:** Enables escape from dystopia traps, adds path dependence (+2-5% humane utopia rate)

**Validation:** Monte Carlo N=10, 120 months - check trust can recover from < 0.3 → > 0.6 if conditions met

---

## Medium Priority Fixes (Week 3-4: 9 days effort)

### 8. Capability-Based Governance Thresholds (2 days, Complexity: 3 systems)

**Issue:** All AIs flagged "dangerous" from day 1 (thresholds assume capability < 2.0)
**Location:** `/src/simulation/organizationManagement.ts` (government acquisition logic)

**Research Foundation:**
- Carnegie Endowment (2025): 10^26 FLOPs threshold = regulatory trigger
- Epoch AI (2024): 90% CI frontier models surpass 10^26 in Nov 2025
- Nature HSS (2024): Regulatory lag 12-24 months detection → enforcement
- IAPP (2024): Only 32% have AI governance programs (maturity gap)

**Fix Implementation:**

**1. Update danger thresholds** (organizationManagement.ts):
```typescript
// Map to capability values (10^26 FLOPs ≈ capability 4.0-5.0)
const CAPABILITY_REQUIRES_REPORTING = 4.0;  // ~10^26 FLOPs (US threshold)
const CAPABILITY_SYSTEMIC_RISK = 3.5;       // ~10^25 FLOPs (EU threshold)
const CAPABILITY_CONCERNING = 3.0;          // Government starts monitoring
const CAPABILITY_DANGEROUS = 5.0;           // Major intervention required
const CAPABILITY_CRITICAL = 6.0;            // Emergency measures

function classifyAIThreatLevel(ai: AIAgent): 'safe' | 'concerning' | 'dangerous' | 'critical' {
  const capability = ai.totalCapability;

  if (capability >= CAPABILITY_CRITICAL) return 'critical';
  if (capability >= CAPABILITY_DANGEROUS) return 'dangerous';
  if (capability >= CAPABILITY_CONCERNING) return 'concerning';
  return 'safe';
}
```

**2. Add regulatory lag** (governmentAgent.ts):
```typescript
const REGULATORY_LAG_MONTHS = 12;          // 1 year average detection → enforcement
const EMERGENCY_RESPONSE_MONTHS = 3;       // Expedited if critical danger

// Detection delay
const detectionDelay = threatLevel === 'critical'
  ? EMERGENCY_RESPONSE_MONTHS
  : REGULATORY_LAG_MONTHS;

// Schedule intervention
state.government.scheduledInterventions.push({
  aiId: ai.id,
  actionDate: state.currentMonth + detectionDelay,
  actionType: 'regulatory_response'
});
```

**3. Add detection difficulty scaling** (detection.ts):
```typescript
function getDetectionDifficulty(capability: number): number {
  // Higher capability = easier to hide (more sophisticated deception)
  if (capability < 3.0) return 0.8;  // 80% detection rate
  if (capability < 4.0) return 0.6;  // 60%
  if (capability < 5.0) return 0.4;  // 40%
  return 0.2;  // 20% - sandbagging, password-locking
}
```

**Expected Impact:** Realistic government response, reduces over-control resentment (-5-10% dystopia rate)

**Validation:** Monte Carlo N=10, 120 months - check government response timing realistic, not all AIs flagged dangerous

---

### 9. Technology Diffusion Recalibration (3 days, Complexity: 6 systems)

**Issue:** Deployment speed doesn't scale with AI capability
**Location:** `/src/simulation/breakthroughTechnologies.ts`

**Research Foundation:**
- McKinsey (2024): AI accelerates R&D timelines 30-50%
- Foundation Capital (2024): Scaling continues but with diminishing returns

**Fix Implementation:**

**1. Add capability-scaled deployment** (breakthroughTechnologies.ts):
```typescript
function calculateDeploymentSpeed(tech: Technology, state: GameState): number {
  const baseSpeed = tech.baseDeploymentSpeed || 0.05;  // 5% per month baseline

  const capabilityMultiplier = state.aiMetrics.averageCapability > 4.0
    ? 1.5  // 50% faster with superhuman AI
    : 1.0;

  return baseSpeed * capabilityMultiplier;
}
```

**Expected Impact:** Faster tech deployment with high AI capability (+2-5% humane utopia via prevention)

**Validation:** Monte Carlo N=10, 120 months - check deployment speed increases when capability > 4.0

---

### 10. Organizational Transformation Modeling (2 days, Complexity: 3 systems)

**Issue:** Workflow adaptation static at 21% baseline
**Location:** New module needed

**Research Foundation:**
- MDPI (2024): Only 21% redesigned workflows, correlated with benefits
- McKinsey (2024): Workflow redesign essential for AI value

**Fix Implementation:**

**1. Add workflow adaptation dynamics** (new file: `/src/simulation/workflowAdaptation.ts`):
```typescript
const WORKFLOW_ADAPTATION_GROWTH = 0.05;  // +5%/month if leadership invests
const WORKFLOW_ADAPTATION_ENABLES_BENEFITS = 0.7;  // 70% benefits require redesign

export function updateWorkflowAdaptation(state: GameState): void {
  if (state.policies.organizationalTransformation?.active) {
    state.society.workflowAdaptation = Math.min(1,
      state.society.workflowAdaptation + WORKFLOW_ADAPTATION_GROWTH
    );
  }

  // Apply to benefits calculation
  const benefitsMultiplier = state.society.workflowAdaptation > 0.5
    ? 1.0
    : (0.3 + (state.society.workflowAdaptation * WORKFLOW_ADAPTATION_ENABLES_BENEFITS));

  // Integrate with QoL
  state.globalMetrics.aiBenefitMultiplier = benefitsMultiplier;
}
```

**Expected Impact:** Models organizational capacity, +2-5% benefits from AI when workflows redesigned

**Validation:** Monte Carlo N=10, 120 months - check benefits increase when workflow adaptation > 0.5

---

### 11. AI-Mediated Conflict De-Escalation (2 days, Complexity: 4 systems)

**Issue:** Missing AI peacekeeping potential
**Location:** Integrated into fix #5 (Flash War Escalation Mechanics)

**Implementation:** Covered in fix #5 above

---

## Implementation Sequence

### Week 1 (CRITICAL): 5 days
1. **Day 1:** War multiplier cap (fix #1)
2. **Day 2-3:** Trust decoupling (fix #2) - COMPLEX, multi-system
3. **Day 4-5:** AI resource consumption (fix #3)

**Validation Gate:** Monte Carlo N=10, 120 months
- **Success Criteria:**
  - War deaths < 50% of total
  - Utopia rate > 0%
  - Water crisis < 60%
  - Trust stays > 0.4 in majority of runs

### Week 2 (HIGH): 9 days
4. **Day 1-2:** Upward spiral trust thresholds (fix #4)
5. **Day 3-5:** Flash war mechanics (fix #5) - COMPLEX
6. **Day 6-7:** Trust recovery mechanics (fix #7)

**Validation Gate:** Monte Carlo N=10, 120 months
- **Success Criteria:**
  - Scientific spiral activates in > 20% runs
  - Flash wars occur when capability > 4.0
  - Trust can recover from < 0.3 to > 0.6

### Week 3-4 (MEDIUM): 9 days
7. **Day 1-2:** Governance thresholds (fix #8)
8. **Day 3-5:** Technology diffusion (fix #9)
9. **Day 6-7:** Organizational transformation (fix #10)

**Validation Gate:** Monte Carlo N=100, 240 months (FULL)
- **Success Criteria:**
  - Dystopia rate < 70%
  - Utopia rate 5-15%
  - Water crisis 40-50%
  - War deaths 30-40% of total

---

## Expected Outcomes After All Fixes

**Outcome Distribution:**
- Dystopia: 99% → 60-70% (challenging but not impossible)
- Utopia: 0% → 5-15% (achievable with aligned AI + good governance)
- Extinction: 1% → <5% (reduced risk)

**System Metrics:**
- Water crisis: 83% → 40-50% (realistic stress, manageable)
- War deaths: 92% → 30-40% of total (significant but not dominant)
- Trust trajectories: Recovery pathways enabled
- Memory usage: 158MB → <50MB (caching fixes)

---

## Validation Strategy

**After Each Week:**
1. Monte Carlo N=10, 120 months (quick check)
2. Log review for errors/warnings
3. Outcome distribution analysis
4. Regression check (compare to baseline)

**Final Validation:**
1. Monte Carlo N=100, 240 months
2. Compare to pre-recalibration baseline
3. Compare to post-recalibration broken state
4. Verify all success criteria met
5. Document parameter changes with citations

---

## Research Confidence Levels

**HIGH (implement as-is):**
- Trust dynamics (48K-person survey)
- Water consumption (empirical measurements)
- Compute thresholds (official policy)
- War multiplier cap (UN consensus)

**MEDIUM (implement with sensitivity analysis):**
- Flash war probabilities (theoretical + deployment data)
- Detection limits (lab studies, not production)
- Trust recovery rates (feedback loop evidence)

**Documented Assumptions:**
- Force multiplier plateaus at 2.0x (conservative estimate based on ECFR analysis)
- Trust recovery +5%/month max (based on enterprise adoption rates)
- WUE improvement 5%/year (Microsoft 3-year trend)

---

## Files Modified

**Core Systems:**
1. `/src/simulation/populationDynamics.ts` - War multiplier cap
2. `/src/simulation/socialCohesion.ts` - Trust calculation, recovery mechanics
3. `/src/simulation/upwardSpirals.ts` - Spiral conditions
4. `/src/simulation/planetaryBoundaries.ts` - Resource integration
5. `/src/simulation/organizationManagement.ts` - Governance thresholds
6. `/src/simulation/breakthroughTechnologies.ts` - Deployment speed
7. `/src/simulation/geopolitics.ts` - Flash war integration

**New Files:**
1. `/src/simulation/aiInfrastructureResources.ts` - Resource consumption
2. `/src/simulation/flashWarEscalation.ts` - Flash war mechanics
3. `/src/simulation/trustThresholds.ts` - Constants/thresholds
4. `/src/simulation/workflowAdaptation.ts` - Organizational transformation

**Types:**
1. `/src/types/game.ts` - Add new state fields (workflowAdaptation, aiEducationCampaigns, flashWar state)

**Phases:**
1. New phase: `FlashWarDetectionPhase.ts` (order ~28, after conflicts)
2. New phase: `TrustRecoveryPhase.ts` (order ~24, after social cohesion)

---

## Documentation Requirements

**For Each Fix:**
1. Inline code comments with research citations
2. Parameter justification (why this value?)
3. Expected behavior description
4. Integration points documented
5. Test validation results

**Devlog Entry:**
- `/devlogs/post-recalibration-fixes_20251018.md`
- Summary of all 11 fixes
- Validation results
- Before/after comparison

**Wiki Updates:**
- `/docs/wiki/README.md` - Update trust mechanics, resource consumption, conflict escalation sections

---

## Risk Mitigation

**If Dystopia Rate Doesn't Improve:**
1. Check trust recovery actually working (log trust values)
2. Verify war multiplier cap applied (check war death %)
3. Validate AI resource consumption integrated (check water crisis %)
4. Run sensitivity analysis (±50% on key parameters)

**If New Issues Emerge:**
1. Architecture-skeptic review after Week 1 fixes
2. Research-skeptic validation of parameter choices
3. Regression tests (compare to working baseline)

**Rollback Plan:**
- Git branch: `post-recalibration-fixes`
- Commit after each week's fixes
- Can revert to Week 1 if Week 2 breaks things

---

**Date:** October 18, 2025
**Plan Status:** READY FOR IMPLEMENTATION
**Next Step:** Begin Week 1 Critical Fixes (Day 1: War Multiplier Cap)
**Estimated Completion:** 4 weeks (23 days effort)
