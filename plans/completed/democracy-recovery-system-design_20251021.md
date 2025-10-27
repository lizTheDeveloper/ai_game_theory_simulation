# Democracy Recovery System - Design Document
**Date:** October 20, 2025
**Status:** Design Phase
**Goal:** Implement empirically-grounded democratic recovery mechanics

---

## Design Philosophy

**Principle:** Emergency responses can strengthen institutions, but democratic backsliding is often irreversible

**Key Insight:** The current model shows 100% Western Liberal collapse because:
1. **Decay factors overwhelm recovery** (-0.57%/month vs +0.1%/month trust feedback)
2. **No feedback from emergency response** to governance quality
3. **No resilience from institutional learning**

**Implementation:** Three-tier system based on crisis response literature

---

## Empirical Evidence Base

### What Works (Post-Crisis Democratic Strengthening)
1. **South Korea (1997 Asian Financial Crisis):**
   - IMF crisis → institutional reforms
   - Transparency increased, corruption decreased
   - Democracy index improved post-crisis

2. **Post-WWII Reconstruction (1945-1950):**
   - Germany, Japan: Democratic institutions built during reconstruction
   - Marshall Plan tied aid to democratic reforms

3. **COVID-19 Democratic Responses (2020-2023):**
   - Denmark, Norway, Finland: Emergency powers + rapid return to normalcy
   - Democratic legitimacy maintained through transparency
   - Trust in government increased in countries with effective response

### What Doesn't Work (Authoritarian Persistence)
1. **Emergency Powers Become Permanent:**
   - Hungary (Orbán): COVID emergency → permanent powers
   - Philippines (Duterte): Drug war emergency → authoritarian drift
   - Turkey (Erdoğan): Coup attempt emergency → purges

2. **Crisis → Scapegoating → Nationalism:**
   - Economic crisis → blame immigrants/minorities
   - Security crisis → surveillance state
   - Health crisis → biosecurity authoritarianism

3. **Point of No Return (Crossing Rubicon):**
   - Once opposition jailed, media controlled, judiciary captured → very hard to reverse
   - Venezuela: Democratic → authoritarian transition took 10 years, reversal unlikely

---

## Tier 1: Emergency Response → Institutional Strengthening

### Mechanism: Successful Crisis Response Builds State Capacity

**Research Foundation:**
- Fukuyama (2014): "State capacity" = ability to deliver public goods
- Successful emergency response = demonstrated state capacity
- Citizens see government competence → legitimacy increases

```typescript
/**
 * Emergency Response → Governance Quality Feedback
 *
 * When emergency response completes successfully:
 * 1. Institutional capacity increases (demonstrated competence)
 * 2. Transparency increases (crisis communication)
 * 3. Legitimacy increases (public sees government works)
 */

function applyEmergencyResponseInstitutionalFeedback(
  state: GameState,
  response: EmergencyResponse
): void {
  if (!response.completed || response.effectiveness < 0.3) {
    return; // Only successful responses strengthen institutions
  }

  const governanceBoost = response.effectiveness * 0.05; // Max +5% per successful response

  if (state.government.governanceQuality) {
    // Demonstrated state capacity
    state.government.governanceQuality.institutionalCapacity = Math.min(
      0.95,
      state.government.governanceQuality.institutionalCapacity + governanceBoost
    );

    // Crisis communication improves transparency
    state.government.governanceQuality.transparency = Math.min(
      0.95,
      state.government.governanceQuality.transparency + governanceBoost * 0.6
    );
  }

  // Legitimacy boost (people see government works in crisis)
  state.government.legitimacy = Math.min(
    0.95,
    state.government.legitimacy + governanceBoost * 0.8
  );

  // Institutional learning: future responses more effective
  state.emergencyManagement.institutionalLearning =
    (state.emergencyManagement.institutionalLearning ?? 1.0) * 1.05; // 5% improvement
}
```

**Expected Impact:**
- High-effectiveness emergency response (0.8+) → +4% institutional capacity
- After 5 successful responses → +20% governance quality
- Governance quality feeds into democracy recovery (+0.8%/month with quality 0.8)

---

## Tier 2: Strengthen Democracy Recovery Factors

### Current Problem: Recovery Too Weak

**Current Formula (Broken):**
```typescript
let change = -0.002; // Baseline decline
change -= crisisPressure * 0.01; // -1%/month per crisis
change -= aiManipulation * 0.005; // -0.5%/month per AI manipulation
change += governanceQuality * 0.005; // +0.5%/month (TOO WEAK)
change += (publicTrust - 0.5) * 0.002; // ±0.1%/month (TOO WEAK)
```

**Problem:** With crisis pressure 0.5, AI manipulation 0.3:
- Decay: -0.002 - 0.005 - 0.0015 = -0.0085/month
- Recovery: +0.003 (governance 0.6) + 0.0002 (trust 0.6) = +0.0032/month
- **Net: -0.0053/month → -63% over 120 months**

### Proposed Fix: Strengthen Recovery + Add Legitimacy Feedback

```typescript
function calculateDemocracyChange(
  crisisPressure: number,
  aiManipulation: number,
  governanceQuality: number,
  publicTrust: number,
  institutionalLegitimacy: number // NEW
): number {
  let change = -0.002; // Baseline global decline (V-Dem 2024)

  // DECAY FACTORS (unchanged - these are empirically accurate)
  change -= crisisPressure * 0.01;
  change -= aiManipulation * 0.005;

  // RECOVERY FACTORS (strengthened)
  change += governanceQuality * 0.008; // +0.8%/month (was 0.5%)
  change += (publicTrust - 0.5) * 0.005; // ±0.25%/month (was ±0.1%)
  change += (institutionalLegitimacy - 0.5) * 0.003; // ±0.15%/month (NEW)

  // CAP: Democracy can't grow faster than historical precedent
  change = Math.max(-0.02, Math.min(0.01, change)); // Max ±1%/month

  return change;
}
```

**New Balance:**
- **Best case:** Governance 0.8, trust 0.7, legitimacy 0.7
  - Recovery: +0.0064 + 0.001 + 0.0006 = +0.008/month
  - Decay: -0.002 (baseline)
  - **Net: +0.006/month → +72% over 120 months** ✅

- **Crisis case:** Governance 0.6, trust 0.4, legitimacy 0.4, crisis 0.5, AI 0.3
  - Recovery: +0.0048 - 0.0005 - 0.0003 = +0.004/month
  - Decay: -0.002 - 0.005 - 0.0015 = -0.0085/month
  - **Net: -0.0045/month → -54% over 120 months** (better than -63%)

**Rationale:**
- Governance quality effect increased 60% (0.005 → 0.008) - stronger institutions matter more
- Trust feedback increased 150% (0.002 → 0.005) - public support accelerates recovery
- Added legitimacy feedback (0.003) - institutions seen as legitimate → democracy strengthens

**Research Validation:**
- V-Dem data: Democracies with high governance quality (>0.7) are resilient to crisis
- Edelman Trust Barometer: Trust in institutions correlates with democratic stability
- Acemoglu & Robinson: Institutional strength is key variable in democratic persistence

---

## Tier 3: Crisis Pressure Reduction During Emergency Response

### Mechanism: Active Emergency Responses Reduce Authoritarian Pressure

**Current Problem:** Emergency responses repair damage but don't reduce crisis pressure itself

**Proposed Fix:**
```typescript
function calculateCrisisPressure(state: GameState): number {
  let pressure = 0;

  // Economic crisis (unemployment → authoritarian demand)
  pressure += (state.society.unemploymentLevel ?? 0) * 0.3;

  // Environmental crisis (scarcity → conflict)
  pressure += (state.environmentalAccumulation?.resourceDepletion ?? 0) / 100 * 0.2;

  // Nuclear conflict (existential threat → emergency powers)
  if (state.nuclearStates?.atWar) pressure += 0.5;

  // Refugee crisis (displacement → xenophobia → strongman appeal)
  pressure += (state.refugeeCrisisSystem?.activeCrises?.length ?? 0) * 0.05;

  // NEW: Reduce pressure if emergency responses are active and effective
  const activeResponses = state.emergencyManagement?.activeResponses?.filter(
    r => r.completed && r.effectiveness > 0.5
  ) ?? [];

  if (activeResponses.length > 0) {
    // Each effective emergency response reduces pressure
    const avgEffectiveness = activeResponses.reduce((sum, r) => sum + r.effectiveness, 0) / activeResponses.length;
    const pressureReduction = avgEffectiveness * 0.3; // Max 30% reduction

    pressure = Math.max(0, pressure - pressureReduction);

    // Signal that government is handling crisis → less authoritarian drift
  }

  return Math.min(1.0, pressure);
}
```

**Expected Impact:**
- 3 active emergency responses with 0.8 effectiveness → -24% crisis pressure
- Crisis pressure 0.5 → 0.38 after emergency response
- Democracy change: -0.005/month (with emergencies) vs -0.007/month (without)

**Research Validation:**
- Democracies that respond effectively to crises maintain legitimacy
- Failed crisis response → calls for "strong leader"
- Successful crisis response → trust in democratic processes

---

## Tier 4: Point of No Return (Authoritarian Persistence)

### Mechanism: Some Democratic Backsliding Is Irreversible

**Empirical Reality:**
- Once opposition jailed, media captured, judiciary corrupted → very hard to reverse
- Venezuela, Hungary, Turkey: Authoritarian consolidation takes 5-10 years, reversal rare
- Russia, China: Post-authoritarian democracies require external shock (war loss, economic collapse)

```typescript
/**
 * Authoritarian Consolidation Tracker
 *
 * If democracy index falls below 0.2 for extended period, consolidation begins
 * Once consolidated, recovery becomes extremely difficult
 */

export interface AuthoritarianConsolidation {
  consolidating: boolean;      // Democracy < 0.2 for 24+ months
  consolidated: boolean;        // Democracy < 0.2 for 60+ months
  monthsBelowThreshold: number; // Counter
}

function updateAuthoritarianConsolidation(state: GameState): void {
  const democracy = state.government.democracy.electoralDemocracyIndex;
  const threshold = 0.2; // V-Dem: Below 0.2 is "electoral autocracy"

  if (!state.government.authoritarianConsolidation) {
    state.government.authoritarianConsolidation = {
      consolidating: false,
      consolidated: false,
      monthsBelowThreshold: 0
    };
  }

  if (democracy < threshold) {
    state.government.authoritarianConsolidation.monthsBelowThreshold++;

    // Consolidating phase: 24-60 months (2-5 years)
    if (state.government.authoritarianConsolidation.monthsBelowThreshold >= 24) {
      state.government.authoritarianConsolidation.consolidating = true;
    }

    // Consolidated phase: 60+ months (5+ years)
    if (state.government.authoritarianConsolidation.monthsBelowThreshold >= 60) {
      state.government.authoritarianConsolidation.consolidated = true;
    }
  } else {
    // Recovery above threshold - reset counter
    state.government.authoritarianConsolidation.monthsBelowThreshold = 0;
    state.government.authoritarianConsolidation.consolidating = false;
    // Note: consolidated stays true (hard to reverse)
  }
}

function applyConsolidationPenalty(democracyChange: number, state: GameState): number {
  const consolidation = state.government.authoritarianConsolidation;

  if (consolidation.consolidated) {
    // Once consolidated, democracy recovery 75% harder
    if (democracyChange > 0) {
      return democracyChange * 0.25;
    }
  } else if (consolidation.consolidating) {
    // During consolidation, recovery 50% harder
    if (democracyChange > 0) {
      return democracyChange * 0.5;
    }
  }

  return democracyChange; // No penalty if not consolidating
}
```

**Expected Impact:**
- If democracy falls to 0.15 and stays there for 5 years → consolidated authoritarianism
- Recovery becomes 75% harder (requires external shock: war, economic collapse)
- Realistic: Matches empirical patterns (Venezuela, Turkey, Russia)

**Design Decision:** Keep this? Or is it too pessimistic?
- **Pro:** Empirically accurate (authoritarianism hard to reverse)
- **Con:** May doom runs that hit crisis (no redemption arc)
- **Compromise:** Make consolidation reversible with MASSIVE effort (revolution, external intervention)

---

## Civil Liberties Recovery

**Current Problem:** Civil liberties decline -48 points/month (too fast, too extreme)

```typescript
function calculateCivilLibertiesChange(
  crisisPressure: number,
  aiManipulation: number,
  surveillanceLevel: number
): number {
  let change = -0.1; // Baseline global decline (Freedom House 2024)

  // DECAY FACTORS
  change -= crisisPressure * 0.5; // -50/month per unit crisis (TOO HARSH)
  change -= aiManipulation * 0.3; // -30/month per unit manipulation (TOO HARSH)
  change -= surveillanceLevel * 0.2; // -20/month per surveillance

  return change;
}
```

**Problem:** With crisis 0.5, AI 0.3, surveillance 0.2:
- Decay: -0.1 - 0.25 - 0.09 - 0.04 = -0.48/month
- Over 120 months: -57.6 points (starting 50 → -7.6, floored at 0)

### Proposed Fix: Add Recovery Mechanisms + Reduce Extreme Decay

```typescript
function calculateCivilLibertiesChange(
  crisisPressure: number,
  aiManipulation: number,
  surveillanceLevel: number,
  emergencyResponseActive: boolean,
  governanceQuality: number,
  publicTrust: number
): number {
  let change = -0.1; // Baseline global decline

  // DECAY FACTORS (reduced severity)
  change -= crisisPressure * 0.3; // -30/month (was -50)
  change -= aiManipulation * 0.2; // -20/month (was -30)
  change -= surveillanceLevel * 0.15; // -15/month (was -20)

  // RECOVERY FACTORS (NEW)
  if (emergencyResponseActive) {
    // Effective crisis response → can roll back emergency restrictions
    change += 0.2; // +20/month recovery during successful emergency response
  }

  // High governance quality → protects civil liberties
  if (governanceQuality > 0.7) {
    change += (governanceQuality - 0.7) * 0.5; // +0 to +10/month
  }

  // High public trust → demand for liberty restoration
  if (publicTrust > 0.6) {
    change += (publicTrust - 0.6) * 0.3; // +0 to +12/month
  }

  return change;
}
```

**New Balance:**
- **Crisis case:** Crisis 0.5, AI 0.3, surveillance 0.2, governance 0.6, trust 0.4
  - Decay: -0.1 - 0.15 - 0.06 - 0.03 = -0.34/month
  - Recovery: 0 (governance/trust too low)
  - **Net: -0.34/month → -40.8 points over 120 months** (better than -57.6)

- **Emergency response case:** Crisis 0.5, AI 0.3, surveillance 0.2, governance 0.8, trust 0.7, emergency active
  - Decay: -0.1 - 0.15 - 0.06 - 0.03 = -0.34/month
  - Recovery: +0.2 + 0.05 + 0.03 = +0.28/month
  - **Net: -0.06/month → -7.2 points over 120 months** ✅ Survivable

---

## Implementation Plan

### Phase 1: Emergency Response Feedback (File: `EmergencyResponsePhase.ts`)

Add institutional strengthening when social emergencies complete:

```typescript
case 'social':
  // Existing: Repair trust, cohesion, legitimacy
  state.society.trustInAI += socialRecoveryBonus;
  state.socialAccumulation.socialCohesion += socialRecoveryBonus;
  state.socialAccumulation.institutionalLegitimacy += socialRecoveryBonus * 0.6;

  // NEW: Boost governance quality (demonstrated state capacity)
  if (state.government.governanceQuality) {
    const governanceBoost = effectivenessBonus * 0.05;
    state.government.governanceQuality.institutionalCapacity = Math.min(
      0.95,
      state.government.governanceQuality.institutionalCapacity + governanceBoost
    );
    state.government.governanceQuality.transparency = Math.min(
      0.95,
      state.government.governanceQuality.transparency + governanceBoost * 0.6
    );
  }

  // Legitimacy boost
  state.government.legitimacy = Math.min(
    0.95,
    state.government.legitimacy + effectivenessBonus * 0.04
  );
```

### Phase 2: Democracy Dynamics Updates (File: `DemocracyDynamicsPhase.ts`)

**Update democracy change calculation:**
```typescript
const institutionalLegitimacy = state.socialAccumulation?.institutionalLegitimacy ?? 0.5;

const democracyChange = calculateDemocracyChange(
  crisisPressure,
  aiManipulation,
  governanceQuality,
  publicTrust,
  institutionalLegitimacy // NEW parameter
);
```

**Update crisis pressure calculation:**
```typescript
const crisisPressure = calculateCrisisPressure(state);
// Now includes emergency response reduction
```

**Update civil liberties calculation:**
```typescript
const emergencyResponseActive = (state.emergencyManagement?.activeResponses?.filter(
  r => r.completed && r.effectiveness > 0.5
).length ?? 0) > 0;

const libertiesChange = calculateCivilLibertiesChange(
  crisisPressure,
  aiManipulation,
  surveillanceLevel,
  emergencyResponseActive,
  governanceQuality,
  publicTrust
);
```

### Phase 3: Authoritarian Consolidation (Optional)

Add to DemocracyDynamicsPhase:
```typescript
updateAuthoritarianConsolidation(state);

// Apply consolidation penalty to recovery
democracyChange = applyConsolidationPenalty(democracyChange, state);
```

---

## Expected Outcomes

### Baseline (Current System)
- **Western Liberal Score:** 2/100 (all runs)
- **Electoral Democracy:** 0% (collapsed)
- **Civil Liberties:** 0 (collapsed)

### With Recovery System (Realistic)
- **Western Liberal Score:** 20-40/100 (mixed outcomes in 40-60% of runs)
- **Electoral Democracy:** 0.3-0.5 (weak democracy survives in some runs)
- **Civil Liberties:** 30-50 (restricted but not zero)

### Best Case (Heroic Intervention)
- **Western Liberal Score:** 60-75/100 (utopia threshold in 10-20% of runs)
- **Electoral Democracy:** 0.6-0.8 (strong democracy)
- **Civil Liberties:** 60-80 (robust protections)
- **Requirements:**
  - Effective emergency responses (3+ with 0.8+ effectiveness)
  - High governance quality (0.7+)
  - High public trust (0.7+)
  - No authoritarian consolidation

---

## Validation Criteria

### Success Metrics
1. **40-60% of runs** achieve Western Liberal >30 (mixed, not dystopia)
2. **10-20% of runs** achieve Western Liberal >70 (utopia)
3. **Emergency responses strengthen democracy** (observable governance quality increase)
4. **Authoritarian consolidation is rare** (<30% of runs) but possible

### Failure Modes
1. **100% still dystopia:** Recovery too weak
2. **100% utopia:** Recovery too strong (unrealistic)
3. **All runs consolidate:** Consolidation penalty too harsh

---

## Next Steps

1. Implement Tier 1-3 (emergency feedback, stronger recovery, crisis reduction)
2. Decide on Tier 4 (authoritarian consolidation - include or skip?)
3. Run validation (N=20, 120 months)
4. Analyze: Western Liberal + Development dual utopia achievable?
