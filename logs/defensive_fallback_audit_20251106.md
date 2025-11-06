# Defensive Fallback Audit - November 6, 2025

## Executive Summary

**Total Instances Found:** 430 (significantly higher than estimated 299)

**Breakdown by Pattern:**
- Nullish coalescing (`??`): 122 instances
- Logical OR zero (`|| 0`): 160 instances
- Logical OR array (`|| []`): 19 instances
- Logical OR object (`|| {}`): 7 instances
- NaN checks (`isNaN`): 122 instances

**Status:** Phase 1 - Comprehensive audit and prioritization in progress

## Danger Level Classification

### CRITICAL (Mortality/Existential Risk)
Lines that directly affect population, mortality rates, or existential outcomes. If these produce NaN, people die silently.

### HIGH (Climate/AI/Food Security)
Lines that affect planetary boundaries, AI alignment, or food systems. Silent failures cascade into CRITICAL systems.

### MEDIUM (Economic/Social/Infrastructure)
Lines that affect QoL, economy, or social systems. Less immediate impact but can accumulate.

### LOW (UI/Logging/Display)
Lines that only affect display or logging. No simulation impact.

---

## Priority 1: CRITICAL - Mortality Paths

### src/simulation/qualityOfLife/mortality.ts

| Line | Pattern | Code | Danger | Fix Required |
|------|---------|------|--------|--------------|
| 98 | `\|\| 0` | `const waterSecurity = state.qualityOfLifeSystems.survivalFundamentals?.waterSecurity \|\| 0.7;` | CRITICAL | Replace with assertStateProperty or assertInRange(0,1) |
| 123 | `\|\| 0` | `const climateStability = env.climateStability \|\| 0.75;` | CRITICAL | Replace with assertStateProperty - climate affects mortality directly |
| 159 | `\|\| 0` | `const biodiversity = env.biodiversityIndex \|\| 0.35;` | HIGH | Replace with assertStateProperty |
| 256 | `??` | `const baseProb = scenarioParams?.environmentalShockProbability ?? 0.02;` | MEDIUM | Legitimate initialization - move to config |
| 258 | `??` | `const baseMag = scenarioParams?.environmentalShockMagnitude ?? 2.0;` | MEDIUM | Legitimate initialization - move to config |
| 324 | `\|\| 0` | `return proportions[regionName] \|\| 0.10;` | MEDIUM | Could be assertDefined but regionName may be dynamic |

**CRITICAL FINDING:** Lines 98, 123 are hiding potential state corruption in mortality calculation. If waterSecurity or climateStability is undefined/NaN, we're silently using fallbacks that may be wildly incorrect.

### src/simulation/planetaryBoundaries.ts

| Line | Pattern | Code | Danger | Fix Required |
|------|---------|------|--------|--------------|
| 897 | `\|\| 0` | `const monthsSinceCascade = state.currentMonth - (system.cascadeStartMonth \|\| 0);` | HIGH | If cascadeStartMonth is undefined, calculation is wrong |
| 969 | `??` | `const baseMortalityRate = state.config.scenarioParameters?.cascadeMortalityRate ?? 0.005;` | CRITICAL | This is THE Oct 2025 bug pattern! |
| 1639 | `\|\| 0` | `month: state.currentMonth \|\| 0` | LOW | Logging only, but should never be undefined |

**CRITICAL FINDING:** Line 969 is EXACTLY the pattern that caused the Oct 2025 ecology NaN bug. If cascadeMortalityRate is NaN, we silently use 0.005 and hide the corruption.

### src/simulation/extinctions.ts

| Line | Pattern | Code | Danger | Fix Required |
|------|---------|------|--------|--------------|
| 367 | `??` | `const states = state.nuclearStates ?? [];` | MEDIUM | Legitimate array initialization, but should be in init code |

---

## Priority 2: HIGH - Climate Paths

### src/simulation/environmental.ts

| Line | Pattern | Code | Danger | Fix Required |
|------|---------|------|--------|--------------|
| 157 | `isNaN` | `if (isNaN(env.resourceReserves)) {` | HIGH | DETECTION not CORRECTION - add assertFinite before this |
| 209 | `isNaN` | `if (isNaN(env.pollutionLevel)) {` | HIGH | DETECTION not CORRECTION - add assertFinite before this |
| 220 | `isNaN` | `if (isNaN(env.pollutionLevel)) {` | HIGH | Duplicate check - consolidate |
| 259 | `isNaN` | `if (isNaN(env.climateStability)) {` | HIGH | DETECTION not CORRECTION - add assertFinite before this |
| 299 | `isNaN` | `if (isNaN(env.biodiversityIndex)) {` | HIGH | DETECTION not CORRECTION - add assertFinite before this |

**PATTERN DETECTED:** All isNaN checks in environmental.ts are DETECTION not CORRECTION. They log errors but don't prevent the NaN from propagating. Need to add assertFinite() at the CALCULATION site, not just detection.

### src/simulation/powerGeneration.ts

| Line | Pattern | Code | Danger | Fix Required |
|------|---------|------|--------|--------------|
| 294 | `\|\| 0` | `const tempAnomaly = env.globalTemperatureAnomaly \|\| 0;` | HIGH | Climate calculation hiding undefined state |

---

## Priority 3: HIGH - AI Alignment Paths

### src/simulation/ensembleDetection.ts

| Line | Pattern | Code | Danger | Fix Required |
|------|---------|------|--------|--------------|
| 136 | `\|\| 0` | `const noiseInv = (inv.noiseInjection \|\| 0) / 10;` | HIGH | AI safety investment hiding undefined state |
| 137 | `\|\| 0` | `const interpInv = (inv.interpretability \|\| 0) / 10;` | HIGH | AI safety investment hiding undefined state |
| 138 | `\|\| 0` | `const redTeamInv = (inv.redTeaming \|\| 0) / 10;` | HIGH | AI safety investment hiding undefined state |
| 186 | `\|\| 0` | `const detectionRate = state.gamingDetection.detectionRate \|\| 0.55;` | HIGH | Detection rate fallback hides corruption |

### src/simulation/gamingDetection.ts

| Line | Pattern | Code | Danger | Fix Required |
|------|---------|------|--------|--------------|
| 218 | `\|\| 0` | `const baseCapability = capabilities[0] \|\| 0.01;` | HIGH | AI capability hiding undefined state |

### src/simulation/behavioralDetection.ts

| Line | Pattern | Code | Danger | Fix Required |
|------|---------|------|--------|--------------|
| 157 | `\|\| 0` | `const trueVal = trueDimensions[i] \|\| 0;` | HIGH | AI dimension hiding undefined state |

### src/simulation/research.ts

| Line | Pattern | Code | Danger | Fix Required |
|------|---------|------|--------|--------------|
| 203 | `\|\| 0` | `Math.max(max, ai.capability \|\| 0), 0);` | HIGH | AI capability hiding undefined state |
| 294 | `\|\| 0` | `const baseGrowth = (growthRates[domain]?.[subfield] \|\| 0.02) *` | MEDIUM | Research growth rate - could be config |
| 535 | `\|\| 0` | `const govResearchInvestment = govInvestment[domain]?.[subfield] \|\| 0;` | MEDIUM | Gov investment - legitimate zero if not invested |

---

## Priority 4: MEDIUM - QoL/Economic Paths

### src/simulation/qualityOfLife/core.ts

| Line | Pattern | Code | Danger | Fix Required |
|------|---------|------|--------|--------------|
| 63 | `isNaN` | `if (isNaN(totalAICapability)) {` | MEDIUM | DETECTION not CORRECTION - add assertFinite at calculation |
| 69 | `isNaN` | `if (isNaN(economicStage)) {` | MEDIUM | DETECTION not CORRECTION - add assertFinite at calculation |
| 131 | `isNaN` | `if (isNaN(energyAvailability)) {` | MEDIUM | DETECTION not CORRECTION - add assertFinite at calculation |

### src/simulation/qualityOfLife/dimensions.ts

| Line | Pattern | Code | Danger | Fix Required |
|------|---------|------|--------|--------------|
| 41 | `isNaN` | `if (isNaN(rawShelterSecurity)) {` | MEDIUM | DETECTION not CORRECTION - add assertFinite at calculation |

### src/simulation/qualityOfLife/aggregation.ts

| Line | Pattern | Code | Danger | Fix Required |
|------|---------|------|--------|--------------|
| 41 | `isNaN` | `if (typeof value === 'number' && (isNaN(value) \|\| !isFinite(value))) {` | LOW | Good validation pattern - keep |
| 92 | `isNaN` | `if (isNaN(result) \|\| !isFinite(result)) {` | LOW | Good validation pattern - keep |
| 193 | `isNaN` | `return values.every(v => isFinite(v) && !isNaN(v));` | LOW | Good validation pattern - keep |

**GOOD PATTERN FOUND:** aggregation.ts lines 41, 92, 193 show CORRECT pattern - validate AND throw with context. These should be the MODEL for other files.

### src/simulation/upwardSpirals.ts

| Line | Pattern | Code | Danger | Fix Required |
|------|---------|------|--------|--------------|
| 234 | `\|\| 0` | `const totalResearch = Object.values(researchInvestments).reduce((sum, val) => sum + (Number(val) \|\| 0), 0);` | MEDIUM | Research investment - could use assertFinite on val |
| 251 | `\|\| 0` | `const workflowAdaptation = state.society.workflowAdaptation \|\| 0.21;` | MEDIUM | Society property - should be assertStateProperty |
| 265 | `\|\| 0` | `Math.min(1.0, (totalResearch \|\| 0) / 100) * 0.2 +` | MEDIUM | Redundant - totalResearch already has fallback on line 234 |
| 740 | `\|\| 0` | `const totalResearch = Object.values(state.government.researchInvestments).reduce((sum, val) => sum + (Number(val) \|\| 0), 0);` | MEDIUM | Duplicate of line 234 pattern |
| 746 | `\|\| 0` | `// console.error(\`   Research Investment: $${Number(totalResearch \|\| 0).toFixed(1)}B/month` | LOW | Commented logging code |

---

## Priority 5: LOW - Engine/Config Initialization

### src/simulation/engine.ts

| Line | Pattern | Code | Danger | Fix Required |
|------|---------|------|--------|--------------|
| 461 | `??` | `seed: config.seed ?? Date.now(),` | LOW | Legitimate config initialization |
| 462 | `??` | `maxMonths: config.maxMonths ?? 1000,` | LOW | Legitimate config initialization |
| 463 | `??` | `governmentActionFrequency: config.governmentActionFrequency ?? 0.5,` | LOW | Legitimate config initialization |
| 464 | `??` | `socialAdaptationRate: config.socialAdaptationRate ?? 1.0,` | LOW | Legitimate config initialization |
| 465 | `??` | `aiCoordinationMultiplier: config.aiCoordinationMultiplier ?? 1.0,` | LOW | Legitimate config initialization |
| 466 | `??` | `economicTransitionRate: config.economicTransitionRate ?? 1.0,` | LOW | Legitimate config initialization |
| 467 | `??` | `snapshotInterval: config.snapshotInterval ?? 12` | LOW | Legitimate config initialization |
| 643 | `isNaN` | `if (isNaN(newState.humanPopulationSystem.population)) {` | CRITICAL | DETECTION not CORRECTION - add assertFinite at calculation! |
| 736 | `??` | `const maxMonths = stopConditions?.maxMonths ?? this.config.maxMonths!;` | LOW | Legitimate config override |
| 737 | `??` | `const checkActualOutcomes = stopConditions?.checkActualOutcomes ?? true;` | LOW | Legitimate config override |
| 738 | `??` | `const logLevel = this.config.logLevel ?? 'quartile';` | LOW | Legitimate config override |
| 770 | `??` | `const snapshotInterval = this.config.snapshotInterval ?? 12;` | LOW | Legitimate config override |
| 1066-1069 | `??` | MultiParadigmDUI score fallbacks | MEDIUM | Should be assertStateProperty - scores should always be defined |

**CRITICAL FINDING:** Line 643 is CRITICAL - population NaN check is DETECTION not CORRECTION. Need to find where population calculation happens and add assertFinite there.

### src/simulation/llm/integration.ts

| Line | Pattern | Code | Danger | Fix Required |
|------|---------|------|--------|--------------|
| 82 | `??` | `capability: agent.previousCapability ?? agent.capability,` | MEDIUM | LLM context building - should be assertDefined |
| 83 | `??` | `alignment: agent.previousAlignment ?? agent.trueAlignment` | MEDIUM | LLM context building - should be assertDefined |
| 89 | `??` | `agent.thresholds ?? {},` | LOW | Empty object fallback for optional thresholds - OK |

### src/simulation/logging.ts

| Line | Pattern | Code | Danger | Fix Required |
|------|---------|------|--------|--------------|
| 289 | `\|\| 0` | `eventsByType[event.type] = (eventsByType[event.type] \|\| 0) + 1;` | LOW | Counter initialization - legitimate pattern |
| 364 | `\|\| 0` | `outcomes[log.metadata.outcome] = (outcomes[log.metadata.outcome] \|\| 0) + 1;` | LOW | Counter initialization - legitimate pattern |
| 373 | `\|\| 0` | `eventFrequencies[type] = (eventFrequencies[type] \|\| 0) + count;` | LOW | Counter initialization - legitimate pattern |

---

## Priority 6: Remaining Files (To Be Audited)

**Phase directories not yet audited:**
- `src/simulation/engine/phases/` (37 phase files)
- `src/simulation/agents/`
- `src/simulation/climate/` (multiple files)
- `src/simulation/food/`
- `src/simulation/nuclear/`
- `src/simulation/adversarial/`
- `src/simulation/utils/`

**Estimated remaining instances:** ~200-250 additional fallbacks

---

## Key Findings

### Pattern 1: Detection vs. Correction
**CRITICAL ISSUE:** Many `isNaN()` checks are DETECTION not CORRECTION. They log errors but don't prevent NaN propagation.

**Example (environmental.ts:157):**
```typescript
if (isNaN(env.resourceReserves)) {
  console.error(`❌ resourceReserves is NaN at month ${state.currentMonth}`);
}
// But env.resourceReserves is STILL NaN after this check!
```

**Fix:** Add assertFinite() at the CALCULATION site, not just detection:
```typescript
env.resourceReserves = assertFinite(
  calculatedValue,
  { location: 'updateResourceReserves', valueName: 'resourceReserves', month: state.currentMonth }
);
```

### Pattern 2: The Oct 2025 Bug Pattern
**CRITICAL ISSUE:** `state.config.scenarioParameters?.property ?? defaultValue` in mortality/cascade calculations.

**Example (planetaryBoundaries.ts:969):**
```typescript
const baseMortalityRate = state.config.scenarioParameters?.cascadeMortalityRate ?? 0.005;
```

**Why dangerous:** If cascadeMortalityRate is NaN (corrupted state), we silently use 0.005 and hide the bug for MONTHS.

**Fix:** Replace with assertFinite:
```typescript
const baseMortalityRate = assertFinite(
  state.config.scenarioParameters?.cascadeMortalityRate,
  { location: 'calculateCascadeMortality', valueName: 'cascadeMortalityRate', month: state.currentMonth }
);
```

### Pattern 3: Counter Initialization (Legitimate)
**OK PATTERN:** Using `|| 0` for counter accumulation in logging/aggregation.

**Example (logging.ts:289):**
```typescript
eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
```

**Assessment:** This is legitimate - counters start at 0. Not a bug-hiding fallback.

### Pattern 4: Config Initialization (Mostly Legitimate)
**OK PATTERN:** Using `??` for optional config parameters in engine initialization.

**Example (engine.ts:461):**
```typescript
seed: config.seed ?? Date.now(),
```

**Assessment:** Legitimate default for optional config. Should be moved to centralConfig but not a bug.

---

## Top 50 Most Dangerous Fallbacks (To Fix in Phase 2)

### CRITICAL (Fix Immediately)
1. `mortality.ts:98` - waterSecurity fallback in mortality calculation
2. `mortality.ts:123` - climateStability fallback in mortality calculation
3. `planetaryBoundaries.ts:969` - cascadeMortalityRate (THE Oct 2025 bug pattern)
4. `engine.ts:643` - population NaN detection without correction
5. `engine.ts:1066-1069` - MultiParadigmDUI score fallbacks

### HIGH (Fix in Phase 2)
6. `mortality.ts:159` - biodiversity fallback
7. `planetaryBoundaries.ts:897` - cascadeStartMonth calculation
8. `powerGeneration.ts:294` - tempAnomaly fallback
9. `ensembleDetection.ts:136` - noiseInjection investment
10. `ensembleDetection.ts:137` - interpretability investment
11. `ensembleDetection.ts:138` - redTeaming investment
12. `ensembleDetection.ts:186` - detectionRate fallback
13. `gamingDetection.ts:218` - baseCapability fallback
14. `behavioralDetection.ts:157` - trueDimensions fallback
15. `research.ts:203` - ai.capability fallback
16. `environmental.ts:157` - resourceReserves NaN detection (need correction)
17. `environmental.ts:209` - pollutionLevel NaN detection (need correction)
18. `environmental.ts:259` - climateStability NaN detection (need correction)
19. `environmental.ts:299` - biodiversityIndex NaN detection (need correction)
20. `upwardSpirals.ts:251` - workflowAdaptation fallback
21. `llm/integration.ts:82` - previousCapability fallback
22. `llm/integration.ts:83` - previousAlignment fallback

### MEDIUM (Fix if time allows)
23-50. To be determined after phase directory audit completes

---

## Next Steps

### Immediate Actions (Next 2 Hours)
1. Read and analyze mortality.ts lines 98, 123 in detail
2. Read and analyze planetaryBoundaries.ts line 969 in detail
3. Create fix branches for top 5 CRITICAL fallbacks
4. Begin systematic replacement with assertion utilities

### Phase 2 Plan (12 hours)
1. Fix all CRITICAL fallbacks (5 instances)
2. Fix all HIGH fallbacks (17 instances)
3. Audit remaining phase directories
4. Identify 28 more HIGH/MEDIUM fallbacks to reach 50 total
5. Run type checking after each batch of fixes
6. Run Monte Carlo validation after all fixes

### Phase 3 Plan (6 hours)
1. Monte Carlo N=10 full validation
2. Document remaining 380 fallbacks
3. Create recommendations for future work
4. Write final audit report

---

## Metrics

**Audited:** 15 files, 430 instances found
**Remaining:** ~30 files, estimated 200-250 instances
**Fixed:** 0 (audit phase)
**Target:** 50 most dangerous fallbacks fixed by end of Phase 2

**Status:** ON TRACK for 3-day timeline
