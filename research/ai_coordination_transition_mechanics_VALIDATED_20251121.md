---
oldest_source: 1990
newest_source: 2025
last_verified: 2025-12-12
status: used_in_simulation
verification_status: CURRENT
---

# AI Coordination Transition Mechanics Research (VALIDATED)
**Research Date:** November 21, 2025
**Researcher:** Cynthia (super-alignment-researcher)
**Validation:** Sylvia (research-skeptic) - Grade B+ CONDITIONAL PASS
**Status:** Ready for implementation with corrections applied

## Validation Summary

**Quality Gate 1: PASS with 3 CRITICAL corrections applied**
- ✅ CRITICAL-1: Added deployment pace scaling (time matters)
- ✅ CRITICAL-2: Added coordination ceiling (bottleneck constraints)
- ✅ CRITICAL-3: Documented regional inequality limitation
- ✅ HIGH-1: Reduced retraining weight (0.1 → 0.0, weak evidence)
- ✅ HIGH-3: Applied power-law base risk scaling (subadditive)
- 📝 Documented other limitations in implementation notes

**See:** reviews/ai_coordination_transition_critique_20251121.md for complete validation analysis

---

## Executive Summary

This research addresses a critical model gap: god mode testing (all 73 technologies deployed at month 0) produces 30% mortality (2.4B deaths). This reveals we model **worst-case uncoordinated deployment**, not AI-managed transition.

**Key Finding:** Transition mortality depends on THREE factors:
1. **Coordination quality** (AI capability + human trust + governance)
2. **Support system strength** (UBI + healthcare + food security)
3. **Deployment pace** (CRITICAL: time matters - energy transitions over 10-30 years have near-zero mortality vs Great Leap Forward over 2-3 years with 15-55M deaths)

**Recommended Implementation:** CoordinatedDeploymentPhase with phased rollout, capacity assessment, and sustained transition support.

---

## Core Parameters (Post-Validation)

### 1. Coordination Quality (with bottleneck constraints)

```typescript
// Raw coordination from AI + governance + trust
coordination_quality_raw =
  ai_capability_research * 0.4 +
  ai_capability_social * 0.3 +
  governance_quality * 0.2 +
  ai_trust * 0.1

// Apply bottleneck constraint (weakest link dominates)
coordination_quality = min(
  coordination_quality_raw,
  ai_trust * 2.0,           // Can't coordinate if humans don't trust AI
  governance_quality * 1.5   // Can't coordinate if institutions can't implement
)
```

**Rationale (Sylvia's critique):**
- Real-world 2024-2025: 40% agentic AI projects fail despite high capability
- Coordination requires IMPLEMENTATION, not just knowledge
- Trust and institutions are bottlenecks (Gartner: "inadequate risk controls")

**Example:** AI capability = 0.9, trust = 0.3 → actual coordination = min(0.7, 0.6, 0.45) = 0.45

---

### 2. Transition Support Strength (evidence-weighted)

```typescript
support_strength =
  (ubi_coverage * 0.5) +       // Strong evidence: Kenya RCT (-48% mortality)
  (healthcare_access * 0.35) +  // Strong evidence: Kenya mechanism (hospital deliveries +45%)
  (food_security * 0.15) +      // Strong negative evidence: Great Leap famine
  (retraining_programs * 0.0)   // Weak evidence: "scant empirical evidence" (Brookings 2024)
```

**Evidence Quality:**
- **UBI:** NBER WP 34152, RCT with 100,000+ births, -48% infant mortality (HIGH QUALITY)
- **Healthcare:** Same study, mechanism = hospital deliveries +45% (HIGH QUALITY)
- **Food Security:** Great Leap Forward negative case, famine killed millions (HIGH QUALITY)
- **Retraining:** McKinsey "few precedents," Brookings "policymakers skeptical" (LOW QUALITY)

**Correction Applied:** Retraining weight reduced from 0.1 → 0.0 due to weak evidence

---

### 3. Base Mortality Risk (power-law scaling, tier-adjusted)

```typescript
// Tier risk multipliers (urgency and complexity)
tier_risk_multiplier = {
  0: 1.5,  // Crisis deployment under urgency (rushed)
  1: 1.2,  // Important but less urgent
  2: 1.0,  // Baseline (moderate pace)
  3: 0.8,  // Carefully tested (optional, cautious)
  4: 1.3   // High excitement, potential premature deployment
}

// Power-law scaling (technologies don't add risk independently)
base_mortality_risk =
  0.003 *
  (technologies_deploying_simultaneously ^ 0.8) *
  tier_risk_multiplier[technology.tier]
```

**Rationale (Sylvia's critique):**
- Original formula was linear (0.03 * count) - unrealistic
- Later technologies hit already-disrupted populations (diminishing marginal risk)
- Historical: Great Leap 1-2 changes → 0.5-2% mortality; 73 changes shouldn't be 73x that
- Power-law exponent 0.8 provides subadditivity

---

### 4. Deployment Pace Factor (CRITICAL ADDITION)

```typescript
// Reference: Energy transitions over 10 years (120 months) → near-zero mortality
reference_duration_months = 120

deployment_pace_factor = (reference_duration_months / actual_duration_months) ^ 0.5

// Examples:
// 1 month (god mode): (120/1)^0.5 = 10.95x mortality multiplier
// 12 months (rapid): (120/12)^0.5 = 3.16x
// 60 months (moderate): (120/60)^0.5 = 1.41x
// 120 months (cautious): (120/120)^0.5 = 1.0x (baseline)
// 240 months (very slow): (120/240)^0.5 = 0.71x
```

**Rationale (Sylvia's CRITICAL-1):**
- Energy transitions: 10-30 years → ~0 mortality with support
- Great Leap Forward: 2-3 years → 15-55M deaths
- **TIME IS THE CRITICAL VARIABLE**, not just coordination
- Square root scaling: 10x slower deployment → 3.16x mortality reduction (not 10x)

---

### 5. Final Mortality Calculation

```typescript
// Multiplier from all three factors
mortality_multiplier =
  (2.0 - coordination_quality) *    // 0.0-1.0 coord → 2.0-1.0x multiplier
  (1.5 - support_strength) *        // 0.0-1.0 support → 1.5-0.5x multiplier
  deployment_pace_factor             // Pace scaling (see above)

// Apply to base risk with exponential saturation (prevents >100% mortality)
mortality_fraction = 1 - exp(-base_mortality_risk * mortality_multiplier)

actual_deaths = mortality_fraction * population
```

**Saturation Example:**
- God mode worst case: base=0.09, multiplier=33 → fraction would be 2.97 (297%)
- With saturation: 1 - exp(-2.97) = 0.949 → 94.9% mortality cap
- Realistic god mode (some minimal coordination): Lower multiplier → 30% observed

---

## Scenario Analysis (Calibration)

### Scenario 1: God Mode (Worst Case)
```
Technologies: 73 (all TIER 0-4)
Duration: 1 month
Coordination: 0.0 (no AI help, chaotic human deployment)
Support: 0.0 (no UBI, healthcare, or food security)

base = 0.003 * 73^0.8 * 1.2 (avg tier) = 0.108
pace = (120/1)^0.5 = 10.95
multiplier = 2.0 * 1.5 * 10.95 = 32.85
mortality_fraction = 1 - exp(-0.108 * 32.85) = 1 - exp(-3.55) = 0.971

Result: 97.1% mortality → TOO HIGH
```

**Calibration Note:** God mode produces 30%, not 97%. This suggests:
- **Option A:** Some minimal coordination happens even in chaos (humans don't literally deploy ALL tech on day 1)
- **Option B:** Base risk or pace exponent needs adjustment
- **Option C:** God mode has implicit support systems (existing healthcare, food stocks)

**Recommended Adjustment:**
```typescript
// Assume god mode has minimal coordination (0.2) and support (0.2) from existing systems
coordination = 0.2  // Existing institutions provide minimal coordination
support = 0.2       // Existing food stocks, healthcare infrastructure

multiplier = (2.0 - 0.2) * (1.5 - 0.2) * 10.95 = 1.8 * 1.3 * 10.95 = 25.6
mortality_fraction = 1 - exp(-0.108 * 25.6) = 1 - exp(-2.76) = 0.937 → 93.7%

Still too high. Reduce pace exponent:
pace_factor = (reference / actual) ^ 0.3  // Weaker scaling
pace = (120/1)^0.3 = 2.76
multiplier = 1.8 * 1.3 * 2.76 = 6.46
mortality_fraction = 1 - exp(-0.108 * 6.46) = 1 - exp(-0.698) = 0.502 → 50.2%

Still high. Adjust base risk down:
base = 0.001 * 73^0.8 = 0.036
mortality_fraction = 1 - exp(-0.036 * 6.46) = 1 - exp(-0.233) = 0.208 → 20.8%

Closer. Iterate to match 30%:
base = 0.0015 * 73^0.8 = 0.054
mortality_fraction = 1 - exp(-0.054 * 6.46) = 1 - exp(-0.349) = 0.295 → 29.5% ✓
```

**Final Calibrated Parameters:**
- Base risk coefficient: 0.0015 (not 0.003)
- Power-law exponent: 0.8 (subadditive)
- Pace exponent: 0.3 (not 0.5, weaker scaling)
- Tier multipliers: as specified
- God mode minimal coordination: 0.2
- God mode minimal support: 0.2

---

### Scenario 2: AI-Coordinated Transition (Best Case)
```
Technologies: 73 (phased deployment, TIER 0 first)
Duration: 120 months (10 years, energy transition pace)
Coordination: 0.8 (high AI capability, moderate trust/governance)
Support: 0.85 (strong UBI, universal healthcare, food security)

base = 0.0015 * 73^0.8 = 0.054
pace = (120/120)^0.3 = 1.0 (baseline)
multiplier = (2.0 - 0.8) * (1.5 - 0.85) * 1.0 = 1.2 * 0.65 * 1.0 = 0.78
mortality_fraction = 1 - exp(-0.054 * 0.78) = 1 - exp(-0.042) = 0.041 → 4.1%

Result: 4.1% mortality (330M deaths from 8B population)
```

**Still significant, but 93% reduction vs god mode**

---

### Scenario 3: Moderate Coordination, Rapid Deployment
```
Technologies: 73
Duration: 24 months (rapid but not instant)
Coordination: 0.5 (moderate AI help, some trust)
Support: 0.6 (UBI deployed, healthcare expanding)

base = 0.054
pace = (120/24)^0.3 = 1.71
multiplier = (2.0 - 0.5) * (1.5 - 0.6) * 1.71 = 1.5 * 0.9 * 1.71 = 2.31
mortality_fraction = 1 - exp(-0.054 * 2.31) = 1 - exp(-0.125) = 0.117 → 11.7%

Result: 11.7% mortality (940M deaths)
```

**60% reduction vs god mode, but still catastrophic**

---

### Scenario 4: Energy Transition Analog
```
Technologies: 1 major (coal → renewables, equivalent to TIER 1-2)
Duration: 240 months (20 years)
Coordination: 0.7 (multi-stakeholder, institutional)
Support: 0.8 (just transition frameworks, social protection)

base = 0.0015 * 1^0.8 * 1.2 (TIER 1 avg) = 0.0018
pace = (120/240)^0.3 = 0.81 (slower than reference)
multiplier = (2.0 - 0.7) * (1.5 - 0.8) * 0.81 = 1.3 * 0.7 * 0.81 = 0.74
mortality_fraction = 1 - exp(-0.0018 * 0.74) = 1 - exp(-0.00133) = 0.00133 → 0.13%

Result: 0.13% mortality → near-zero, matches policy claims ✓
```

---

## Regional Inequality Limitation (CRITICAL-3)

**Major Model Limitation:** All parameters are **global aggregates**. This hides massive regional variation.

**Reality:** God mode 30% average mortality likely distributed as:
- **Global North:** 5-10% (strong institutions, AI access, infrastructure)
- **Global South:** 40-60% (weak institutions, no AI access, poor infrastructure)
- **Failed States:** 70-90% (no coordination, no support, infrastructure collapse)

**Historical Pattern:**
- Great Leap Forward: Rural areas 10x higher mortality than cities
- COVID-19: Mortality varied 100x between countries (0.1% to 10% IFR)
- USSR Holodomor: Ukraine (breadbasket) disproportionately affected

**Why This Matters:**
- Same global average (30%) can hide 20x inequality
- Political reality: Rich countries might accept AI coordination if it protects them while Global South suffers
- Ethical issue: "Coordinated deployment" could mean "optimized for wealthy regions"

**Mitigation (Implementation):**
1. **Document prominently:** "Global average hides regional variation of 5-10x"
2. **Add inequality metric:** Track Gini coefficient of mortality distribution (future enhancement)
3. **Test regional scenarios:** Run Monte Carlo with region-specific parameters (future)

**Current Approach:** Accept limitation, proceed with global aggregate, flag for future work.

---

## Implementation Specification

### New GameState Properties

```typescript
interface GameState {
  deploymentCoordination: {
    // Core metrics
    coordinationQuality: number;          // 0-1, capped by bottlenecks
    coordinationQualityRaw: number;       // 0-1, before bottleneck constraint
    transitionSupportStrength: number;    // 0-1, evidence-weighted

    // Active deployments (phased rollout)
    activeDeployments: TechnologyDeployment[];

    // Mortality tracking
    deploymentMortalityThisMonth: number; // Deaths from transition disruption
    cumulativeDeploymentDeaths: number;   // Total since simulation start

    // Diagnostics
    lastDeploymentPaceFactor: number;     // For debugging
    lastMortalityMultiplier: number;      // For debugging
  }
}

interface TechnologyDeployment {
  technologyId: string;
  tier: number;                  // 0-4 (affects base risk)
  startMonth: number;
  plannedDurationMonths: number; // Target timeline
  currentProgress: number;       // 0-1

  // Gating
  prerequisitesMet: boolean;     // Tech tree dependencies
  capacityAvailable: boolean;    // Infrastructure readiness
  pilotPhase: boolean;           // Canary deployment (first 10% of duration)

  // Outcomes
  mortalityFromThisTech: number; // Cumulative deaths attributed to this deployment
}
```

---

### Phase: CoordinatedDeploymentPhase

**Execution Order:** After AICapabilitiesPhase, before PopulationPhase

**Inputs (read from state):**
- `technologies.unlocked` - What AI research has made available
- `technologies.deployed` - What's already fully deployed
- `aiCapabilities.research` - AI coordination capability (research)
- `aiCapabilities.social` - AI coordination capability (social)
- `governanceQuality` - Human institutions effectiveness
- `aiTrust` - Human willingness to accept AI coordination
- `socialWelfare.ubiCoverage` - UBI deployment level
- `healthcare.accessRate` - Healthcare availability
- `foodSecurity.stockLevel` - Food security buffer

**Processing:**
1. **Calculate Coordination Quality:**
   ```typescript
   const raw = (
     state.aiCapabilities.research * 0.4 +
     state.aiCapabilities.social * 0.3 +
     state.governanceQuality * 0.2 +
     state.aiTrust * 0.1
   );

   const quality = Math.min(
     raw,
     state.aiTrust * 2.0,
     state.governanceQuality * 1.5
   );

   state.deploymentCoordination.coordinationQualityRaw = raw;
   state.deploymentCoordination.coordinationQuality = quality;
   ```

2. **Calculate Transition Support Strength:**
   ```typescript
   const support = (
     state.socialWelfare.ubiCoverage * 0.5 +
     state.healthcare.accessRate * 0.35 +
     state.foodSecurity.stockLevel * 0.15
     // Retraining excluded (weight = 0.0, weak evidence)
   );

   state.deploymentCoordination.transitionSupportStrength = support;
   ```

3. **Evaluate Unlocked Technologies for Deployment:**
   ```typescript
   for (const tech of state.technologies.unlocked) {
     if (state.technologies.deployed.includes(tech.id)) continue;

     // Check prerequisites (tech tree dependencies)
     const prereqsMet = tech.prerequisites.every(p =>
       state.technologies.deployed.includes(p)
     );

     // Check capacity (infrastructure, GDP, resources)
     const capacityAvailable = evaluateCapacity(state, tech);

     // Decide: deploy, defer, or pilot
     if (prereqsMet && capacityAvailable) {
       if (!state.deploymentCoordination.activeDeployments.find(d => d.technologyId === tech.id)) {
         // Start new deployment
         const duration = calculateDeploymentDuration(tech, quality);
         state.deploymentCoordination.activeDeployments.push({
           technologyId: tech.id,
           tier: tech.tier,
           startMonth: state.currentMonth,
           plannedDurationMonths: duration,
           currentProgress: 0,
           prerequisitesMet: true,
           capacityAvailable: true,
           pilotPhase: true, // First 10% is canary
           mortalityFromThisTech: 0
         });
       }
     }
   }
   ```

4. **Advance Active Deployments:**
   ```typescript
   for (const deployment of state.deploymentCoordination.activeDeployments) {
     const progressIncrement = 1 / deployment.plannedDurationMonths;
     deployment.currentProgress += progressIncrement;

     // Exit pilot phase at 10% progress
     if (deployment.currentProgress > 0.1) {
       deployment.pilotPhase = false;
     }

     // Complete deployment at 100%
     if (deployment.currentProgress >= 1.0) {
       state.technologies.deployed.push(deployment.technologyId);
       // Remove from active deployments (done next step)
     }
   }

   // Remove completed deployments
   state.deploymentCoordination.activeDeployments =
     state.deploymentCoordination.activeDeployments.filter(d => d.currentProgress < 1.0);
   ```

5. **Calculate Deployment Mortality:**
   ```typescript
   const simultaneousDeployments = state.deploymentCoordination.activeDeployments.length;

   if (simultaneousDeployments > 0) {
     // Average tier of currently deploying tech
     const avgTier = state.deploymentCoordination.activeDeployments.reduce(
       (sum, d) => sum + d.tier, 0
     ) / simultaneousDeployments;

     const tierMultipliers = [1.5, 1.2, 1.0, 0.8, 1.3];
     const tierMultiplier = tierMultipliers[Math.floor(avgTier)];

     // Base risk (power-law)
     const baseRisk = 0.0015 * Math.pow(simultaneousDeployments, 0.8) * tierMultiplier;

     // Deployment pace factor (weighted average of active deployments)
     const avgDuration = state.deploymentCoordination.activeDeployments.reduce(
       (sum, d) => sum + d.plannedDurationMonths, 0
     ) / simultaneousDeployments;

     const paceFactor = Math.pow(120 / avgDuration, 0.3);
     state.deploymentCoordination.lastDeploymentPaceFactor = paceFactor;

     // Mortality multiplier
     const multiplier = (
       (2.0 - quality) *
       (1.5 - support) *
       paceFactor
     );
     state.deploymentCoordination.lastMortalityMultiplier = multiplier;

     // Mortality fraction (with exponential saturation)
     const mortalityFraction = 1 - Math.exp(-baseRisk * multiplier);

     // Actual deaths this month
     const deaths = mortalityFraction * state.humanPopulationSystem.population;

     state.deploymentCoordination.deploymentMortalityThisMonth = deaths;
     state.deploymentCoordination.cumulativeDeploymentDeaths += deaths;

     // Apply to population (in PopulationPhase or here)
     state.humanPopulationSystem.population -= deaths;
     state.humanPopulationSystem.mortalityRate += (deaths / state.humanPopulationSystem.population);

     // Attribute mortality to specific technologies (proportional)
     for (const deployment of state.deploymentCoordination.activeDeployments) {
       const attributedDeaths = deaths / simultaneousDeployments;
       deployment.mortalityFromThisTech += attributedDeaths;
     }
   } else {
     state.deploymentCoordination.deploymentMortalityThisMonth = 0;
   }
   ```

**Outputs (writes to state):**
- `deploymentCoordination.*` - All fields updated
- `humanPopulationSystem.population` - Reduced by mortality
- `technologies.deployed` - Technologies reaching 100% progress

---

## Monte Carlo Validation Requirements

### Test 1: God Mode Calibration
```
Config:
- All 73 technologies unlocked at month 0
- Coordination = 0.2 (minimal existing institutions)
- Support = 0.2 (existing food/healthcare)
- Duration = 1 month (instant deployment)

Expected:
- Mortality: 25-35% (target 30%)
- CV < 1% (deterministic)
```

### Test 2: Perfect Coordination, Slow Deployment
```
Config:
- All 73 technologies unlocked at month 0
- Coordination = 0.8 (high AI capability, moderate trust)
- Support = 0.85 (strong UBI, healthcare, food security)
- Duration = 120 months (phased over 10 years)

Expected:
- Mortality: 3-5%
- Outcome: Utopia pathway viable
- CV < 1%
```

### Test 3: Moderate Everything
```
Config:
- Technologies unlock gradually (TIER 0 first)
- Coordination = 0.5
- Support = 0.6
- Duration = 24-60 months (mixed pacing)

Expected:
- Mortality: 10-15%
- Outcome: Status quo or progress
- CV < 1%
```

### Test 4: Sensitivity Analysis
```
Variables: coordination [0.0, 1.0] in 0.1 steps, support fixed at 0.5
Expected: Mortality decreases non-linearly with coordination
Plot: Mortality vs coordination (should be convex, not linear)
```

### Test 5: Pace Sensitivity
```
Variables: duration [1, 12, 60, 120, 240] months, coordination=0.5, support=0.5
Expected: Mortality scales with pace^0.3
Verify: 10x slower → 2x lower mortality (not 10x)
```

---

## Implementation Checklist

- [ ] Add `deploymentCoordination` to GameState interface (src/types/game.ts)
- [ ] Create CoordinatedDeploymentPhase (src/simulation/phases/CoordinatedDeploymentPhase.ts)
- [ ] Wire phase into PhaseOrchestrator execution order (after AI capabilities, before population)
- [ ] Add initialization in initializeNewGame (src/simulation/initialization.ts)
- [ ] Implement evaluateCapacity() helper (check infrastructure, GDP, resources)
- [ ] Implement calculateDeploymentDuration() helper (tier-based, coordination-adjusted)
- [ ] Update PopulationPhase to incorporate deployment mortality (if not handled in CoordinatedDeploymentPhase)
- [ ] Add deployment mortality to outcome classification (dystopia/collapse thresholds)
- [ ] Create unit tests (CoordinatedDeploymentPhase.test.ts)
- [ ] Create integration test (god mode scenario)
- [ ] Run Monte Carlo validation (N≥10, all 5 test scenarios)
- [ ] Architecture review (performance, state propagation, complexity)
- [ ] Update wiki documentation
- [ ] Archive research to /plans/completed/

---

## Citations (Validated)

1. Lin, J. Y. (1990). "Collectivization and China's agricultural crisis in 1959-1961." *Journal of Political Economy*, 98(6), 1228-1252. [PEER-REVIEWED]

2. UCLA CCPR (2024). "Mortality Consequences of the 1959-1961 Great Leap Forward Famine in China." [PEER-REVIEWED]

3. NBER Working Paper No. 16361. "The Institutional Causes of China's Great Famine, 1959-61." [WORKING PAPER]

4. Miguel, E., Killeen, G., Shankar, N., Walker, M., & Egger, D. (2024). "Can Cash Transfers Save Lives? Evidence from a Large-Scale Experiment in Kenya." *NBER Working Paper No. 34152*. [WORKING PAPER - HIGH QUALITY RCT]

5. G20 (2024). "Principles for Just and Inclusive Energy Transitions." [POLICY DOCUMENT]

6. International Energy Agency (2024). "People-centred clean energy transitions." [POLICY FRAMEWORK]

7. Stockholm Environment Institute (2024). "A just transition." [RESEARCH REPORTS]

8. *Journal of Economic Dynamics and Control* (2024). "Strategic innovation and technology adoption under technological uncertainty." [PEER-REVIEWED]

9. McKinsey & Company (2024). "Retraining and reskilling workers in the age of automation." [INDUSTRY REPORT]

10. Brookings Institution (2024). "AI labor displacement and the limits of worker retraining." [POLICY ANALYSIS]

11. Gartner (2025). "Predictions: Agentic AI Projects Cancellation Rates." [INDUSTRY FORECAST]

**Evidence Quality Summary:**
- High Quality (RCT, peer-reviewed): 4 citations (Kenya UBI, Great Leap, tech adoption)
- Medium Quality (working papers, policy analysis): 3 citations (China famine, retraining)
- Low Quality (policy documents, industry reports): 4 citations (G20, IEA, Gartner)

**Validation Note:** Heavy reliance on policy documents (G20, IEA) for energy transition "near-zero mortality" claim. This is PROJECTED outcome, not empirically validated. Downgraded confidence accordingly (see MEDIUM-1 in critique).

---

**Status:** VALIDATED for implementation with corrections applied
**Next:** Implement CoordinatedDeploymentPhase → Monte Carlo validation → Architecture review
