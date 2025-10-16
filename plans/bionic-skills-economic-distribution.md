# Bionic Skills: Economic Distribution & Productivity-Wage Decoupling

**Plan:** Phase 4 of Bionic Skills Research Grounding
**Effort:** 6 hours over Weeks 7-8
**Priority:** High (Critical for inequality modeling)
**Research TRL:** 9 (Extensively documented historical pattern)

---

## Problem Statement

**Current Model Limitation:**
The existing model assumes **productivity gains flow to workers** in a simple linear relationship. If AI boosts productivity 50%, workers get 50% higher wages. This contradicts 50+ years of labor economics showing:

**Productivity ≠ Wages (Without Policy Intervention)**

Since 1973 in the United States:
- Productivity: +77.5%
- Hourly compensation: +12.4%
- **Gap: 65.1 percentage points**

Without redistributive policy (unions, regulation, ownership structures), capital captures most productivity gains.

---

## Research Foundation

### Primary Research:

**Brookings Institution (2024)** - "AI and the Labor Market"
- Productivity-wage gap well-documented since 1970s
- Without policy intervention, capital captures 70-90% of AI productivity gains
- Labor share of income declined from 67% (1970) → 62% (2024)
- Source: Brookings Economic Studies, labor economics program

**Acemoglu & Restrepo (2018)** - "Automation and New Tasks"
- Journal: Journal of Economic Perspectives
- Automation creates productivity without proportional wage gains
- New tasks can offset this, but require policy/institutional support
- Historical: Industrial Revolution → Great Compression (policy intervention restored labor share)

**Economic Policy Institute (2024)** - "The Productivity-Pay Gap"
- Detailed analysis of 1948-2024 divergence
- Factors: Declining unionization, reduced minimum wage, changing corporate governance
- Evidence: Countries with stronger labor institutions show smaller gaps
- Source: EPI State of Working America reports

### Historical Validation:

**1948-1973: Tight Coupling (Policy Era)**
- Productivity: +96.7%
- Hourly compensation: +91.3%
- Gap: 5.4 percentage points
- Era: Strong unions (35% membership), high minimum wage, regulated corporate governance

**1973-2024: Decoupling (Deregulation Era)**
- Productivity: +77.5%
- Hourly compensation: +12.4%
- Gap: 65.1 percentage points
- Era: Weak unions (10% membership), stagnant minimum wage, shareholder primacy

**Implication:** Policy environment determines whether productivity → wages

---

## Implementation Design

### 1. Add Labor Share Tracking (2 hours)

**Add to GameState:**
```typescript
interface LaborCapitalDistribution {
  // Current distribution
  laborShare: number;              // Fraction of GDP going to labor (0-1)
  capitalShare: number;            // Fraction going to capital (1 - laborShare)

  // Historical baseline (for comparison)
  baselineLaborShare: number;      // Starting value (0.62 for US 2024)

  // Productivity and wages (tracking divergence)
  baselineProductivity: number;    // Productivity at simulation start
  currentProductivity: number;     // Current productivity (from AI amplification)
  productivityGrowth: number;      // % change from baseline

  baselineWages: number;           // Wages at simulation start
  currentWages: number;            // Current wages
  wageGrowth: number;              // % change from baseline

  productivityWageGap: number;     // productivityGrowth - wageGrowth

  // Distribution of productivity gains
  gainsToCapital: number;          // 0-1, fraction of gains captured by capital
  gainsToLabor: number;            // 1 - gainsToCapital

  // Policy effects
  unionStrength: number;           // 0-1, from policy system
  minimumWageLevel: number;        // 0-1, relative to living wage
  workerOwnershipShare: number;    // 0-1, fraction of firms worker-owned
}
```

**Initialize:**
```typescript
function initializeLaborCapitalDistribution(state: GameState): void {
  const gdp = state.economy.gdp;

  state.laborCapitalDistribution = {
    // US 2024 baseline
    laborShare: 0.62,
    capitalShare: 0.38,
    baselineLaborShare: 0.62,

    // Productivity tracking
    baselineProductivity: 1.0,
    currentProductivity: 1.0,
    productivityGrowth: 0,

    // Wage tracking
    baselineWages: gdp * 0.62 / state.humanPopulationSystem.population,
    currentWages: gdp * 0.62 / state.humanPopulationSystem.population,
    wageGrowth: 0,

    productivityWageGap: 0,

    // Default: 70% of gains to capital (matches 1973-2024 pattern)
    gainsToCapital: 0.70,
    gainsToLabor: 0.30,

    // Policy levers (start weak, like current US)
    unionStrength: 0.10,           // 10% unionization
    minimumWageLevel: 0.60,        // 60% of living wage
    workerOwnershipShare: 0.05     // 5% worker-owned firms
  };
}
```

---

### 2. Update Distribution Mechanics (2 hours)

**Monthly Distribution Update:**
```typescript
function updateLaborCapitalDistribution(state: GameState): void {
  const dist = state.laborCapitalDistribution;

  // Calculate current productivity (from bionic skills amplification)
  const productivityMultiplier = calculateProductivityMultiplierFromSkills(state);
  dist.currentProductivity = productivityMultiplier;
  dist.productivityGrowth = (productivityMultiplier - dist.baselineProductivity) / dist.baselineProductivity;

  // Calculate how gains are distributed based on policy environment
  updateGainsDistribution(state);

  // Update wages based on labor's share of productivity gains
  const productivityGainAbsolute = dist.productivityGrowth;
  const wageGainAbsolute = productivityGainAbsolute * dist.gainsToLabor;

  dist.currentWages = dist.baselineWages * (1 + wageGainAbsolute);
  dist.wageGrowth = wageGainAbsolute;

  // Calculate gap
  dist.productivityWageGap = dist.productivityGrowth - dist.wageGrowth;

  // Update labor share of GDP
  // As capital captures gains, labor share declines
  const laborShareDecline = dist.productivityGrowth * dist.gainsToCapital * 0.5;
  // 50% of capital-captured gains translate to labor share decline
  dist.laborShare = Math.max(0.40, dist.baselineLaborShare - laborShareDecline);
  dist.capitalShare = 1 - dist.laborShare;

  // Update economy state
  updateEconomyFromDistribution(state);
}

function updateGainsDistribution(state: GameState): void {
  const dist = state.laborCapitalDistribution;

  // Base distribution: 70% capital, 30% labor (no policy intervention)
  let gainsToLabor = 0.30;

  // Policy effects:

  // 1. Union strength increases labor's share
  gainsToLabor += dist.unionStrength * 0.30;
  // Strong unions (1.0) → +30% to labor (total 60%)

  // 2. Minimum wage increases low-end wages
  const minWageEffect = Math.max(0, dist.minimumWageLevel - 0.60) * 0.20;
  // Above 60% of living wage, each 10% increase → +2% to labor
  gainsToLabor += minWageEffect;

  // 3. Worker ownership directly captures gains
  gainsToLabor += dist.workerOwnershipShare * 0.70;
  // Worker-owned firms: 70% of gains go to workers

  // 4. UBI/redistribution (from policy system)
  const ubiLevel = state.policy?.universalBasicIncome || 0;
  gainsToLabor += ubiLevel * 0.15;
  // Generous UBI → +15% effective transfer to labor

  // Cap at 90% to labor (some return to capital always exists)
  gainsToLabor = Math.min(0.90, gainsToLabor);

  dist.gainsToLabor = gainsToLabor;
  dist.gainsToCapital = 1 - gainsToLabor;
}
```

**Economy Integration:**
```typescript
function updateEconomyFromDistribution(state: GameState): void {
  const dist = state.laborCapitalDistribution;
  const pop = state.humanPopulationSystem.population;
  const gdp = state.economy.gdp;

  // Update per-capita wages in economy state
  state.economy.averageWage = dist.currentWages;

  // Update Gini coefficient (inequality)
  // Lower labor share → higher inequality
  const laborShareEffect = (dist.baselineLaborShare - dist.laborShare) * 2.0;
  // Each 1% labor share decline → 2% Gini increase
  state.society.inequalityGini = Math.min(
    0.70,  // Cap at 0.70 (extreme inequality)
    state.society.inequalityGini + laborShareEffect
  );

  // Update segment-specific wages (unequal distribution)
  state.society.segments?.forEach(segment => {
    if (segment.economicStatus === 'elite') {
      // Elite capture disproportionate share of capital gains
      segment.averageIncome = dist.currentWages * 5.0 * (1 + dist.gainsToCapital);
    } else if (segment.economicStatus === 'precariat') {
      // Precariat get minimal wage gains
      segment.averageIncome = dist.currentWages * 0.5 * (1 + dist.gainsToLabor * 0.5);
    } else {
      // Middle segments
      segment.averageIncome = dist.currentWages * 1.2 * (1 + dist.gainsToLabor * 0.8);
    }
  });
}
```

---

### 3. Policy Intervention Mechanics (2 hours)

**Union Strength:**
```typescript
function updateUnionStrength(state: GameState): void {
  const dist = state.laborCapitalDistribution;

  // Policy: Pro-labor government actions increase unionization
  const laborPolicy = state.policy?.laborProtections || 0;  // 0-1
  const targetUnionStrength = 0.10 + laborPolicy * 0.25;    // 10% → 35%

  // Union strength changes slowly (institutional inertia)
  const changeRate = 0.01;  // 1% per month toward target
  if (dist.unionStrength < targetUnionStrength) {
    dist.unionStrength = Math.min(targetUnionStrength, dist.unionStrength + changeRate);
  } else {
    dist.unionStrength = Math.max(targetUnionStrength, dist.unionStrength - changeRate);
  }
}
```

**Minimum Wage:**
```typescript
function updateMinimumWage(state: GameState): void {
  const dist = state.laborCapitalDistribution;

  // Calculate living wage (cost of living)
  const costOfLiving = calculateCostOfLiving(state);

  // Policy: Government minimum wage setting
  const minWagePolicy = state.policy?.minimumWageLevel || 0.60;  // 60% of living wage baseline

  dist.minimumWageLevel = minWagePolicy;

  // If minimum wage is too low, social instability increases
  if (dist.minimumWageLevel < 0.50) {
    state.society.socialStability = Math.max(
      0,
      state.society.socialStability - 0.01
    );
  }
}
```

**Worker Ownership:**
```typescript
function updateWorkerOwnership(state: GameState): void {
  const dist = state.laborCapitalDistribution;

  // Policy: Tax incentives for worker cooperatives, ESOPs
  const coopPolicy = state.policy?.workerOwnershipIncentives || 0;  // 0-1

  // Ownership transitions slowly (firm conversion takes time)
  const growthRate = coopPolicy * 0.005;  // 0.5% per month at max policy
  dist.workerOwnershipShare = Math.min(0.50, dist.workerOwnershipShare + growthRate);
  // Cap at 50% worker ownership (mixed economy)
}
```

**Redistribution (UBI):**
```typescript
function updateRedistribution(state: GameState): void {
  // UBI transfers income from capital to all citizens
  const ubiLevel = state.policy?.universalBasicIncome || 0;

  if (ubiLevel > 0) {
    const gdp = state.economy.gdp;
    const pop = state.humanPopulationSystem.population;

    // UBI payment per person
    const ubiPayment = (gdp * ubiLevel * 0.10) / pop;
    // 10% of GDP at max UBI level

    // This effectively increases gainsToLabor (calculated in updateGainsDistribution)

    // Update segment incomes
    state.society.segments?.forEach(segment => {
      segment.averageIncome += ubiPayment;
    });

    // Reduce inequality
    const inequalityReduction = ubiLevel * 0.05;  // Up to 5% Gini reduction
    state.society.inequalityGini = Math.max(
      0.25,  // Floor on inequality (some always exists)
      state.society.inequalityGini - inequalityReduction
    );
  }
}
```

---

## Testing & Validation

**Test 1: No Policy → Capital Captures Gains**
```typescript
test('Without policy, capital captures 70%+ of productivity gains', () => {
  const state = initializeGameState();

  // Zero out all policy interventions
  state.policy = {
    laborProtections: 0,
    minimumWageLevel: 0.60,
    workerOwnershipIncentives: 0,
    universalBasicIncome: 0
  };

  // Add high AI productivity
  state.aiAgents[0].capability = 3.0;

  // Run for 60 months
  for (let month = 0; month < 60; month++) {
    updateBionicSkills(state);
    updateLaborCapitalDistribution(state);
  }

  const dist = state.laborCapitalDistribution;

  // Productivity should have grown significantly
  expect(dist.productivityGrowth).toBeGreaterThan(0.30);  // 30%+ growth

  // But wages should lag far behind
  expect(dist.wageGrowth).toBeLessThan(dist.productivityGrowth * 0.40);
  // Less than 40% of productivity gains go to wages

  // Labor share should decline
  expect(dist.laborShare).toBeLessThan(dist.baselineLaborShare);
});
```

**Test 2: Strong Policy → Labor Captures More**
```typescript
test('With strong policy, labor captures 60%+ of productivity gains', () => {
  const state = initializeGameState();

  // Strong policy interventions
  state.policy = {
    laborProtections: 0.80,         // 80% pro-labor
    minimumWageLevel: 0.90,         // 90% of living wage
    workerOwnershipIncentives: 0.70, // 70% incentive level
    universalBasicIncome: 0.50      // 50% UBI level
  };

  // Add high AI productivity
  state.aiAgents[0].capability = 3.0;

  // Run for 60 months
  for (let month = 0; month < 60; month++) {
    updateBionicSkills(state);
    updateUnionStrength(state);
    updateWorkerOwnership(state);
    updateLaborCapitalDistribution(state);
    updateRedistribution(state);
  }

  const dist = state.laborCapitalDistribution;

  // Labor should capture 60%+ of gains
  expect(dist.gainsToLabor).toBeGreaterThan(0.60);

  // Wage growth should track closer to productivity
  expect(dist.wageGrowth).toBeGreaterThan(dist.productivityGrowth * 0.60);

  // Labor share should stay close to baseline or increase
  expect(dist.laborShare).toBeGreaterThan(dist.baselineLaborShare * 0.95);
});
```

**Test 3: Historical Calibration (1973-2024)**
```typescript
test('Simulated decoupling matches historical pattern (1973-2024)', () => {
  const state = initializeGameState();

  // Set policy to match 1973-2024 US (weak labor institutions)
  state.policy = {
    laborProtections: 0.20,         // Weak
    minimumWageLevel: 0.60,         // Stagnant
    workerOwnershipIncentives: 0,   // None
    universalBasicIncome: 0         // None
  };

  // Simulate productivity growth matching historical
  // 1973-2024: 77.5% productivity growth over 51 years
  // = 1.18% annual = 0.098% monthly
  const monthsToSimulate = 51 * 12;  // 51 years

  for (let month = 0; month < monthsToSimulate; month++) {
    // Gradually increase AI capability to drive productivity
    const targetCapability = 1.775;  // 77.5% growth
    state.aiAgents[0].capability = 1.0 + (targetCapability - 1.0) * (month / monthsToSimulate);

    updateBionicSkills(state);
    updateLaborCapitalDistribution(state);
  }

  const dist = state.laborCapitalDistribution;

  // Should match historical: 77.5% productivity, 12.4% wages
  expect(dist.productivityGrowth).toBeCloseTo(0.775, 1);   // ~77.5%
  expect(dist.wageGrowth).toBeCloseTo(0.124, 1);          // ~12.4%
  expect(dist.productivityWageGap).toBeCloseTo(0.651, 1); // ~65.1pp gap
});
```

---

## Integration Points

**Connects to:**
- `calculateProductivityMultiplierFromSkills()` - drives productivity growth
- `updateSocietyAggregates()` - updates segment incomes, inequality
- Phase 2 (displacement) - wage pressure from unemployment affects distribution
- Phase 3 (competence) - workers with low competence have weak wage bargaining
- Policy system - all major redistributive policies

**Adds to GameState:**
- `laborCapitalDistribution: LaborCapitalDistribution`

**Adds to Policy:**
- `laborProtections: number` (0-1, affects union strength)
- `minimumWageLevel: number` (0-1, fraction of living wage)
- `workerOwnershipIncentives: number` (0-1, support for cooperatives)

**Affects:**
- `economy.averageWage`
- `society.inequalityGini`
- `segment.averageIncome` (for each segment)

---

## Parameters Reference

```typescript
const LABOR_CAPITAL_CONFIG = {
  // Historical baseline (US 2024)
  baselineLaborShare: 0.62,
  baselineCapitalShare: 0.38,

  // Default distribution (no policy, matches 1973-2024)
  defaultGainsToCapital: 0.70,
  defaultGainsToLabor: 0.30,

  // Policy effects
  unionEffect: 0.30,              // Strong unions → +30% to labor
  minWageEffect: 0.20,            // High min wage → +20% to labor
  workerOwnershipEffect: 0.70,    // Worker ownership → +70% to labor
  ubiEffect: 0.15,                // Generous UBI → +15% to labor

  // Inequality effects
  laborShareToGini: 2.0,          // 1% labor share loss → 2% Gini increase

  // Institutional change rates
  unionChangeRate: 0.01,          // 1% per month
  ownershipGrowthRate: 0.005      // 0.5% per month at max policy
};
```

---

## Success Criteria

✅ **No policy → capital captures 70%+:**
- gainsToCapital ≥ 0.70
- productivityWageGap > 0.50 after significant productivity growth
- Matches 1973-2024 historical pattern

✅ **Strong policy → labor captures 60%+:**
- gainsToLabor ≥ 0.60 with all interventions active
- productivityWageGap < 0.30
- Matches 1948-1973 tight coupling era

✅ **Historical calibration:**
- Simulation of 1973-2024 produces ~77% productivity, ~12% wages
- 65pp gap matches Economic Policy Institute data

✅ **Policy interventions work:**
- Unions, minimum wage, worker ownership, UBI all increase labor's share
- Effects are additive and realistic
- Without policy, inequality grows with AI productivity

---

## Next Steps After Implementation

1. **Connect to Phase 2** (Displacement)
   - Unemployment reduces labor's bargaining power
   - Wage pressure from displaced workers

2. **Connect to Phase 3** (Competence)
   - Workers with low competence can't command high wages
   - Performance-competence gap reduces wage growth

3. **Add wealth tracking**
   - Capital gains accumulate for owners
   - Wealth inequality grows faster than income inequality

4. **Add political feedback**
   - High inequality → political instability
   - Populist movements demanding redistribution

---

**Effort:** 6 hours
**Priority:** High (critical for inequality realism)
**Research TRL:** 9 (50+ years documented pattern)
**Status:** Ready for implementation
