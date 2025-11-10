# Spiral Activation Failure Investigation
**Date:** November 10, 2025
**Context:** Governance-first god mode scenario shows 0 active spirals despite high governance quality + all tech deployed

## Executive Summary

Governance-first scenario set to boost governance quality to 0.8, deploy all tech immediately, yet produces:
- **0 active upward spirals** (out of 6)
- **No virtuous cascade** (requires 4+)
- **0 trust cascades** (cooperative spirals)
- **Overall QoL: 62.4%** (below expectations for god mode + governance boost)

## Initial Findings

### Scenario Configuration (from `src/types/scenarios.ts`)
```typescript
'governance-first': {
  startingConditions: {
    governanceQuality: 0.8,           // Target
    institutionalCapacity: 0.8,       // Target
    physicalSafety: 0.8,              // Target
    informationIntegrity: 0.8,        // Target
    collectiveActionWillingness: 0.7, // Target
  },
  techDeployment: { mode: 'immediate' }
}
```

### Application Method (from `scripts/scenarioRunner.ts` lines 62-104)
**CRITICAL ISSUE IDENTIFIED:** Scenario applies governance boosts to **country-level `vDemIndicators`**, NOT to `state.government.governanceQuality`:

```typescript
// Lines 62-89: Modifies country.vDemIndicators
for (const country of Object.values(countries)) {
  if ((country as any).vDemIndicators) {
    (country as any).vDemIndicators.v2x_polyarchy = Math.max(..., conditions.governanceQuality);
    (country as any).vDemIndicators.v2x_liberal = Math.max(..., conditions.governanceQuality);
    // ... etc
  }
}
```

**The spirals check `state.government.governanceQuality` fields directly** (lines 186-214 of `upwardSpirals.ts`), NOT country-level V-Dem indicators.

### Spiral Threshold Requirements

#### SPIRAL 3: Democratic (most likely to activate with governance boost)
```typescript
// Lines 186-214 upwardSpirals.ts
const qualityGovernance = gov.decisionQuality > 0.7 && gov.institutionalCapacity > 0.7;
const democraticEngagement = gov.participationRate > 0.6 && gov.transparency > 0.7;
const notAuthoritarian = state.government.governmentType !== 'authoritarian';
```

**Problem:** Scenario sets `country.vDemIndicators.v2x_polyarchy = 0.8` but spiral checks `state.government.governanceQuality.decisionQuality`.

#### SPIRAL 1: Abundance
```typescript
// Lines 106-135 upwardSpirals.ts
const materialAbundant = qol.materialAbundance > 1.5;
const energyAbundant = qol.energyAvailability > 1.5;
const timeLiberated = state.society.unemploymentLevel > 0.6 &&
                      state.globalMetrics.economicTransitionStage >= 3;
```

**Problem:** God mode doesn't set economic transition stage or unemployment level. Tech deployment alone may not reach stage 3 (UBI/post-work) in 24 months.

#### SPIRAL 2: Cognitive
```typescript
// Lines 145-179 upwardSpirals.ts
const mentalHealthy = qol.diseasesBurden < 0.3 && qol.healthcareQuality > 0.8;
const purposeful = social.meaningCrisisLevel < 0.3;
const cognitiveEnhanced = demonstratedBenefits && comprehensiveTrust > TRUST_THRESHOLD_ACCEPTANCE;
```

**Observed:** Health tier only 38.3% in results (diseasesBurden likely high). Meaning crisis unknown.

#### SPIRAL 4: Scientific
```typescript
// Lines 226-293 upwardSpirals.ts
const deployedCheck = deployedCount >= deploymentThreshold;  // 3 if AI > 4.0, else 4
spiral.active = deployedCheck && researchIntensive && aiAccelerated && workflowAdapted;
```

**Critical dependency:** Requires `workflowAdaptation >= 0.25`. God mode doesn't set this.

#### SPIRAL 5: Meaning
```typescript
// Lines 304-364 upwardSpirals.ts
const meaningFulfilled = social.meaningCrisisLevel < 0.2;
const strongCommunity = avgCohesion > 0.7;
const culturallyAdapted = social.culturalAdaptation > 0.7;
const autonomous = qol.autonomy > 0.7 && qol.culturalVitality > 0.7;
```

**Observed:** Social tier only 55.6% (community/cultural adaptation likely low).

#### SPIRAL 6: Ecological
```typescript
// Lines 371-407 upwardSpirals.ts
const ecosystemHealthy = qol.ecosystemHealth > 0.7;
const climateStable = env.climateStability > 0.7;
const biodiverseHealthy = env.biodiversityIndex > 0.7;
const clean = env.pollutionLevel < 0.3;
const sustainable = env.resourceReserves > 0.7;
```

**Observed:** Environmental tier 54.7% (below all thresholds). Log shows ecosystem collapse events + gene drive failures.

## Root Cause Hypotheses

### Hypothesis 1: State Location Mismatch (HIGH CONFIDENCE)
**Scenario sets:** `country.vDemIndicators.v2x_polyarchy = 0.8`
**Spiral checks:** `state.government.governanceQuality.decisionQuality > 0.7`

**These are different locations.** If `governanceQuality` fields aren't derived from V-Dem indicators, the boost never reaches the spiral checks.

### Hypothesis 2: Missing Mechanics (HIGH CONFIDENCE)
God mode + governance boost doesn't set:
- `state.society.workflowAdaptation` (required for scientific spiral)
- `state.society.culturalAdaptation` (required for meaning spiral)
- `state.globalMetrics.economicTransitionStage` (required for abundance spiral)
- `state.society.unemploymentLevel` (required for abundance spiral)

### Hypothesis 3: Environmental Lag (MEDIUM CONFIDENCE)
24 months may be too short for environmental recovery even with all tech deployed:
- Climate tech takes time to reduce CO2 (decades)
- Ecosystem restoration is slow (years to decades)
- Biodiversity recovery is multi-decadal

### Hypothesis 4: Thresholds Too Stringent (LOW CONFIDENCE)
Thresholds seem reasonable based on research (0.7 = "high quality"), but need validation against literature:
- Is 70% governance quality realistic for spiral activation?
- Is 150% material/energy abundance achievable?
- Is 25% workflow adaptation the correct threshold (Rogers diffusion)?

## QoL Tier Analysis (from scenario results)

| Tier | Average | Assessment |
|------|---------|------------|
| Survival | 73.6% | Below 90% threshold - food/water/shelter gaps |
| Basic Needs | 79.8% | Reasonable but material < 150% for abundance spiral |
| Psychological | 72.3% | Indicates meaning crisis likely > 30% |
| Social | 55.6% | **CRITICAL** - Community/cultural adaptation below 70% |
| Health | 38.3% | **CRITICAL** - Diseases burden likely > 30%, healthcare < 80% |
| Environmental | 54.7% | **CRITICAL** - All environmental thresholds likely failing |

**Pattern:** Even with all tech deployed, basic needs improve moderately but social/health/environmental remain low.

## Investigation Plan

### Phase 1: Code Trace (simulation-maintainer)
1. **Verify state location mapping**
   - Does `country.vDemIndicators` propagate to `state.government.governanceQuality`?
   - Where is `governanceQuality` calculated from V-Dem indicators?
   - Is there a synchronization phase that runs before upward spirals?

2. **Check missing field initialization**
   - Is `workflowAdaptation` initialized in `initialization.ts`?
   - Is `culturalAdaptation` initialized?
   - Is `economicTransitionStage` initialized?
   - What are default values if not set by scenario?

3. **Environmental recovery timeline**
   - How long does climate tech take to improve `climateStability`?
   - How long does ecosystem restoration take?
   - Are 24 months sufficient for environmental spiral activation?

### Phase 2: Research Validation (super-alignment-researcher + research-skeptic)
1. **Governance quality thresholds**
   - Is 70% decision quality a realistic threshold for positive spirals?
   - What does political science literature say about democratic flourishing thresholds?
   - Are V-Dem indicators appropriate proxies?

2. **Economic transition stages**
   - What are realistic timelines for UBI/post-work society (stage 3)?
   - Can 24 months achieve this with AI productivity gains?

3. **Workflow adaptation rates**
   - Is 25% the correct threshold (Rogers diffusion critical mass)?
   - How long does organizational adaptation take?

4. **Environmental recovery**
   - What are realistic timelines for:
     - Climate stabilization after tech deployment?
     - Ecosystem health recovery?
     - Biodiversity restoration?

### Phase 3: Quantitative Analysis (Priya)
1. **Parse governance-first log for exact final state values**
   - Extract all spiral-relevant metrics at month 24
   - Compare actual values to thresholds
   - Identify closest-to-activating spirals

2. **Multi-scenario comparison**
   - Compare governance-first to baseline god mode
   - Does governance boost produce ANY improvement in spiral metrics?
   - Statistical significance of governance effect on spiral-relevant variables

3. **Time series analysis**
   - When do spiral metrics peak in 24-month window?
   - Are any spirals briefly activating then deactivating?
   - What causes deactivation?

### Phase 4: Synthesis & Recommendations
Based on findings from phases 1-3:
1. **If state location mismatch:** Fix scenario application to set correct fields
2. **If missing mechanics:** Add initialization for required fields (workflow/cultural adaptation)
3. **If thresholds too stringent:** Adjust based on research validation (but ONLY if research supports)
4. **If environmental lag:** Either extend simulation time OR adjust tech effectiveness timeline

## Next Steps

**Immediate:** Spawn simulation-maintainer to trace state locations (Phase 1)
**Parallel:** Spawn Priya for quantitative log analysis (Phase 3.1)
**Sequential:** Research validation after code trace identifies specific thresholds to validate

## Expected Timeline

- Phase 1 (Code trace): 30-45 minutes
- Phase 2 (Research): 45-60 minutes (after Phase 1 identifies specific questions)
- Phase 3 (Quantitative): 30-45 minutes (parallel with Phase 1)
- Phase 4 (Synthesis): 20-30 minutes

**Total: 2-3 hours**

---

**Status:** Investigation initiated, orchestrator spawning specialized agents
**Priority:** CRITICAL - blocks proper god mode testing and utopia pathway validation
