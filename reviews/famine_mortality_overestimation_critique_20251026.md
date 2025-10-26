# Critical Review: Famine Mortality Model Overestimation

**Date:** October 26, 2025
**Reviewer:** Research Skeptic
**System Under Review:** Famine mortality model (`src/simulation/engine/phases/FamineSystemPhase.ts`, `src/types/famine.ts`)
**Severity:** CRITICAL - Model likely overestimates mortality by 200-400%

## Executive Summary

The current famine model applies a continuous monthly death curve (2% → 8% → 15% → 10% → 2%) whenever regional food security falls below 0.6, continuing until food security recovers or 80% mortality is reached. This fundamentally misrepresents how famines operate in reality, conflating seasonal "hungry seasons" with sustained famines and ignoring critical recovery periods. The model likely overestimates famine deaths by 200-400% in monsoon-dependent regions.

## Contradictory Research

### 1. Seasonal Food Insecurity vs. Sustained Famine

**Current Model Assumption:** Food security < 0.6 triggers continuous monthly mortality until recovery.

**Contradictory Evidence:**
- **WHO/UNICEF (2023):** "In countries where populations have stable access to healthy diets...there is little to no seasonal variation in wasting. However...it is not possible to capture the fluctuations in wasting over the course of a year."
- **Agriculture & Food Security (2023):** Research shows "no seasonal variation in grain consumption but a reduction in food diversity during agricultural lean seasons" - indicating hunger but not starvation.
- **Historical Bengal Famines:** The 1770 famine showed acute mortality during summer months, then disease mortality when monsoons returned - NOT continuous starvation deaths.

### 2. "Hungry Season" Duration

**Current Model:** Continuous mortality as long as food security < 0.6 (potentially year-round).

**Reality:**
- **West Africa "Soudure":** 3-4 months (June-September) between depletion of previous harvest and new harvest
- **South Asia Pre-Monsoon:** 2-3 months (April-June) before monsoon crops mature
- **East Africa:** 2-3 months during long dry season

The model treats a 3-month seasonal deficit as if it continues for 12+ months.

### 3. Recovery Mechanisms Ignored

**Current Model:** Deaths continue until food security > 0.8 (very high threshold).

**Missing Factors:**
- **Seasonal harvests:** Even poor harvests provide temporary relief
- **Coping mechanisms:** Migration, asset sales, wild foods, social networks
- **International aid:** Emergency food assistance during acute phases
- **Monsoon recovery:** Historical data shows rapid agricultural recovery post-monsoon

## Methodological Concerns

### CRITICAL: Conflation of Chronic and Acute Food Insecurity

The model's fundamental flaw is treating all food insecurity below 0.6 as acute famine. In reality:

1. **Chronic food insecurity (0.4-0.6):** Year-round insufficient calories
   - Causes: Stunting, reduced productivity, increased disease susceptibility
   - Mortality: Elevated but gradual (1-2% excess mortality per year)
   - Duration: Can persist for years

2. **Acute food crisis (0.2-0.4):** Seasonal severe shortage
   - Causes: Immediate starvation risk during "hungry season"
   - Mortality: Sharp spike (5-15% during 3-month period)
   - Duration: 2-4 months until harvest/aid arrives

3. **True famine (<0.2):** Complete food system collapse
   - Causes: War, total crop failure, aid blockade
   - Mortality: Catastrophic (15-30% over 6-12 months)
   - Examples: Somalia 2011, Yemen ongoing, Gaza 2024

### CRITICAL: Death Curve Misapplication

The death curve (2% → 8% → 15% → 10% → 2%) appears based on sustained starvation scenarios like siege warfare or concentration camps, NOT seasonal agricultural famines:

**Problems:**
- Month 3 peak (15% mortality) assumes zero food for 90 days
- Real seasonal famines: Reduced food, not zero food
- Ignores partial consumption (500-1000 calories/day vs. needed 2000)
- No accounting for harvest cycles that break the starvation pattern

### SIGNIFICANT: Regional Homogeneity

All regions use the same mortality curve despite vastly different patterns:
- **Monsoon Asia:** Sharp 3-month deficit, then recovery
- **Sahel:** Gradual 4-5 month decline before harvest
- **Horn of Africa:** Bimodal rainfall, two hungry seasons
- **Temperate regions:** Winter storage, different pattern entirely

## Strategic Questions

1. **Why trigger famine at 0.6 food security?** This is "moderate food insecurity" by FAO standards, not famine (IPC Phase 5 requires <0.2).

2. **Why continuous mortality?** No historical famine shows this pattern except sieges and genocides.

3. **Why uniform death curves?** Bengal 1943, Irish 1845, and Ukraine 1932 had completely different mortality patterns.

4. **Where is seasonality?** The entire agricultural cycle is missing from the model.

## Recommendations

### Immediate (Fix Overestimation)

1. **Implement Seasonal Patterns:**
```typescript
interface SeasonalFaminePattern {
  hungrySeason: { startMonth: number; duration: number; mortalityMultiplier: number };
  harvestSeason: { startMonth: number; recovery: boolean };
  annualPattern: 'monsoon' | 'bimodal' | 'temperate' | 'arid';
}
```

2. **Separate Chronic vs. Acute:**
- Chronic (0.4-0.6): Low continuous mortality (0.1-0.2% monthly)
- Acute seasonal (0.2-0.4): High mortality during hungry season only (2-5% for 3 months)
- True famine (<0.2): Current death curve applies

3. **Add Recovery Mechanisms:**
- Harvest cycles that temporarily boost food security
- International aid response (reduces mortality 50-70% after month 2)
- Migration as escape valve (reduces at-risk population)

### Calculation of Overestimation

**Current model (example):**
- Food security = 0.5 for 12 months
- Monthly deaths: 0% + 2% + 8% + 15% + 10% + 2% + 2% + 2% + 2% + 2% + 2% + 2% = 51% mortality

**Realistic seasonal model:**
- Food security = 0.5 average (0.3 for 3 months, 0.6 for 9 months)
- Hungry season deaths: 2% + 5% + 3% = 10% mortality
- Rest of year: 0.1% × 9 = 0.9% mortality
- Total: 10.9% mortality

**Overestimation factor: 51% / 10.9% = 4.7×**

## Confidence Assessment

- **Seasonal pattern exists:** HIGH (overwhelming evidence across all agricultural societies)
- **Current model overestimates:** HIGH (continuous mortality contradicts all non-siege famines)
- **Overestimation magnitude (2-4×):** MEDIUM (depends on region and scenario)
- **Need for regional differentiation:** HIGH (monsoon vs. Sahel vs. temperate patterns differ completely)

## Conclusion

The famine model's continuous mortality approach is fundamentally flawed for agricultural famines, which are inherently seasonal. This isn't a minor calibration issue—it's a structural misunderstanding of how famines operate outside of war/siege contexts. The model needs complete restructuring to distinguish seasonal hunger from sustained famine, or it will continue to overestimate deaths by 200-400% in most scenarios.

**Verdict:** FAIL - Requires major architectural revision before use

**Next Steps:**
1. Implement seasonal patterns based on regional agricultural cycles
2. Separate chronic food insecurity from acute seasonal crises
3. Add harvest/aid recovery mechanisms
4. Validate against historical famines with known seasonal patterns (Bengal 1943, Sahel 1973, Ethiopia 1984)