# Task: Scenario Analysis Phase 3 - Policy Package Scenarios

**Agent:** Moss (Feature Implementer)
**Priority:** HIGH
**Estimated Time:** 2-3 hours
**Created:** November 11, 2025

## Context

You're implementing Phase 3 of the Scenario Analysis Framework - the actual **Policy Package Scenarios** that combine multiple governance dimensions to test realistic real-world policy debates.

**Phase 1+2 Status (COMPLETE):**
- ✅ Phase 1: Diagnostic infrastructure (spiral activation logging, scenario type system)
- ✅ Phase 2: Scenario execution system (scenarioRunner.ts, compareScenarios.ts, ApplyScenarioPrioritiesPhase)
- ✅ Phase 2 includes 6 single-dimension government priority scenarios (climate-first, equality-first, etc.)

**What Phase 3 Adds:**
Phase 3 tests **realistic policy COMBINATIONS** that reflect real-world debates, not just single dimensions in isolation.

**From Master Roadmap (lines 320-338):**
```
#### Phase 3: Policy Package Scenarios (MEDIUM Priority)

**Objective:** Test realistic combinations that reflect real-world policy debates

**Real-World Policy Combinations:**
1. **"Green New Deal"** - Clean energy + UBI + jobs guarantee
2. **"Techno-Optimist Path"** - All tech, minimal regulation, market-driven
3. **"Degrowth Path"** - Reduce consumption 30%, prioritize restoration
4. **"Authoritarian Climate Action"** - Rapid deployment, low participation
5. **"Nordic Social Democracy"** - High redistribution, strong institutions, gradual tech

**Validation:**
- Monte Carlo N=10 for each policy package
- Compare outcome distributions
- Identify trade-offs (climate vs equality, speed vs democracy)
```

## Your Task

Add 5 new policy package scenarios to `SCENARIO_CATALOG` in `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/types/scenarios.ts`.

**Requirements:**
1. Each scenario must combine MULTIPLE governance priorities (not single-dimension like Phase 2)
2. Each scenario must reflect a real-world policy debate or political philosophy
3. Parameters must be research-backed (cite sources in description field)
4. Use existing infrastructure (ScenarioGovernmentPriorities, TechDeploymentStrategy)

## Scenario Specifications

### 1. Green New Deal
**Philosophy:** Progressive climate + social policy (US/EU Green New Deal proposals)

**Key Features:**
- **Massive clean energy investment:** 10% GDP/month climate spending (same as climate-first)
- **Universal Basic Income:** 2.5% GDP/month redistribution (Nordic-level UBI)
- **Job guarantee:** High research investment ($100B/month) for job creation
- **Democratic participation:** Democracy level 0.8 (strong democratic institutions)
- **Tech deployment:** Prioritized (clean energy first, then social programs)

**Research Sources:**
- US Green New Deal Resolution (2019) - Ocasio-Cortez/Markey
- EU Green Deal (2020) - von der Leyen Commission
- IEA Net Zero by 2050 (2024) - climate investment pathways

**Scenario Definition:**
```typescript
'green-new-deal': {
  id: 'green-new-deal',
  name: 'Green New Deal',
  description: 'Progressive climate + social policy: 10% GDP climate, 2.5% redistribution, $100B research, democracy=0.8',
  hypothesis: 'Tests whether combining climate action + UBI + jobs guarantee enables both environmental AND social spirals',
  techDeployment: {
    mode: 'prioritized' as const,
    prioritizedConfig: {
      priorities: ['climate', 'energy', 'social', 'governance', 'environment'],
      gapMonths: 3,  // Faster deployment than sequenced (3 months vs 12)
    },
  },
  governmentPriorities: {
    climateSpending: 0.10,  // 10% GDP/month (climate action)
    redistributionRate: 0.025,  // 2.5% GDP/month (UBI - Nordic level)
    researchInvestment: 100,  // $100B/month (job guarantee via R&D investment)
    democracyLevel: 0.8,  // High democratic participation
  },
},
```

### 2. Techno-Optimist Path
**Philosophy:** Market-driven tech acceleration, minimal government intervention (Marc Andreessen, Peter Thiel, libertarian tech optimism)

**Key Features:**
- **All tech immediately:** Deploy everything at once (god mode tech deployment)
- **Minimal government:** Research investment only, no redistribution/climate spending
- **Market-driven:** No government priority overrides (let markets decide)
- **Democratic:** Democracy level 0.7 (liberal democracy, not authoritarian)
- **Tech deployment:** Immediate (no sequencing, market absorbs)

**Research Sources:**
- Andreessen "Techno-Optimist Manifesto" (2023)
- Cowen "Stubborn Attachments" (2018) - growth maximization
- Acemoglu & Johnson "Power and Progress" (2023) - tech optimism critique

**Scenario Definition:**
```typescript
'techno-optimist': {
  id: 'techno-optimist',
  name: 'Techno-Optimist Path',
  description: 'Market-driven tech acceleration: all tech immediate, minimal government, democracy=0.7, R&D only',
  hypothesis: 'Tests whether technology + markets alone (without redistribution/climate spending) can enable spirals',
  techDeployment: {
    mode: 'immediate' as const,  // Deploy all tech at once
  },
  governmentPriorities: {
    researchInvestment: 50,  // $50B/month (baseline R&D only)
    democracyLevel: 0.7,  // Liberal democracy (not authoritarian)
    // NO climateSpending, NO redistributionRate (market handles)
  },
},
```

### 3. Degrowth Path
**Philosophy:** Reduce consumption, prioritize ecological restoration, post-growth economics (Hickel, Raworth, Kallis)

**Key Features:**
- **Reduce consumption:** NOT DIRECTLY MODELABLE (requires new mechanic)
  - **Workaround:** High redistribution (2.5% GDP) + LOW research investment ($10B) = reduced GDP growth
- **Ecological restoration:** 10% GDP/month climate spending (same as Green New Deal)
- **Strong democracy:** Democracy level 0.9 (highest, participatory democracy)
- **Tech deployment:** Prioritized (environment first, then governance/social, NO advanced tech)
- **Specific techs:** Only deploy TIER 0-1 (foundational), not TIER 3-4 (advanced/clarketech)

**Research Sources:**
- Hickel "Less is More" (2020) - degrowth economics
- Raworth "Doughnut Economics" (2017) - planetary boundaries + social foundation
- Kallis et al. "The Case for Degrowth" (2020)

**Scenario Definition:**
```typescript
'degrowth': {
  id: 'degrowth',
  name: 'Degrowth Path',
  description: 'Ecological restoration + reduced consumption: 10% climate, 2.5% redistribution, $10B research, democracy=0.9, TIER 0-1 tech only',
  hypothesis: 'Tests whether ecological focus + low growth enables environmental spirals without advanced tech',
  techDeployment: {
    mode: 'prioritized' as const,
    prioritizedConfig: {
      priorities: ['environment', 'climate', 'governance', 'social'],  // NO energy/advanced
      gapMonths: 12,  // Slow deployment (absorption capacity)
    },
    // Deploy only TIER 0-1 (foundational tech, not advanced/clarketech)
    deploymentLevel: 0.4,  // 40% deployment level (proxy for limited tech)
  },
  governmentPriorities: {
    climateSpending: 0.10,  // 10% GDP/month (ecological restoration)
    redistributionRate: 0.025,  // 2.5% GDP/month (social foundation)
    researchInvestment: 10,  // $10B/month (low growth, reduced R&D)
    democracyLevel: 0.9,  // Very high democracy (participatory)
  },
},
```

### 4. Authoritarian Climate Action
**Philosophy:** China-style rapid deployment, low participation (Xi Jinping climate pledge, CCP model)

**Key Features:**
- **Rapid climate action:** 10% GDP/month climate spending (same as others)
- **Authoritarian efficiency:** Democracy level 0.2 (very low, below authoritarian-efficiency 0.3)
- **No redistribution:** 0% GDP redistribution (authoritarian state doesn't prioritize equality)
- **Immediate tech deployment:** Deploy all tech at once (top-down decision)
- **Research investment:** $50B/month (state-directed innovation)

**Research Sources:**
- Xi Jinping climate pledge (2020) - carbon neutrality by 2060
- Kostka & Zhang (2018) - authoritarian environmentalism in China
- V-Dem v14 (2024) - China democracy score 0.12

**Scenario Definition:**
```typescript
'authoritarian-climate': {
  id: 'authoritarian-climate',
  name: 'Authoritarian Climate Action',
  description: 'China-style rapid deployment: 10% climate, democracy=0.2, no redistribution, immediate tech',
  hypothesis: 'Tests whether authoritarian efficiency enables faster climate action at cost of social spirals',
  techDeployment: {
    mode: 'immediate' as const,  // Top-down rapid deployment
  },
  governmentPriorities: {
    climateSpending: 0.10,  // 10% GDP/month (authoritarian climate action)
    researchInvestment: 50,  // $50B/month (state-directed R&D)
    democracyLevel: 0.2,  // Very low (below authoritarian-efficiency 0.3)
    governmentType: 'authoritarian',
    // NO redistributionRate (authoritarian states don't prioritize equality)
  },
},
```

### 5. Nordic Social Democracy
**Philosophy:** Scandinavian model - high redistribution, strong institutions, gradual tech adoption

**Key Features:**
- **High redistribution:** 3.5% GDP/month (42% annually - higher than Nordic average 30%, but accounts for UBI)
- **Strong institutions:** Democracy level 0.85 (Nordic levels: Denmark 0.97, Norway 0.96, Sweden 0.93)
- **Gradual tech adoption:** Sequenced deployment (12-month gaps between tiers)
- **Moderate climate spending:** 3% GDP/month (realistic, not extreme)
- **High research:** $150B/month (Nordic countries = top R&D spenders per capita)

**Research Sources:**
- OECD Social Expenditure Database (2024) - Nordic redistribution 25-30% GDP
- V-Dem v14 (2024) - Nordic democracy scores 0.93-0.97
- IEA (2024) - Nordic climate investment patterns

**Scenario Definition:**
```typescript
'nordic-social-democracy': {
  id: 'nordic-social-democracy',
  name: 'Nordic Social Democracy',
  description: 'Scandinavian model: 3.5% redistribution, 3% climate, $150B research, democracy=0.85, sequenced tech',
  hypothesis: 'Tests whether gradual tech + strong institutions + high equality enables sustained spiral activation',
  techDeployment: {
    mode: 'sequenced' as const,
    sequencedConfig: {
      gapMonths: 12,  // Gradual absorption (12-month gaps)
      tierOrder: [0, 1, 2, 3, 4],  // Tier-ordered deployment
    },
  },
  governmentPriorities: {
    redistributionRate: 0.035,  // 3.5% GDP/month = 42% annually (Nordic + UBI)
    climateSpending: 0.03,  // 3% GDP/month (realistic Nordic climate spending)
    researchInvestment: 150,  // $150B/month (Nordic R&D intensity)
    democracyLevel: 0.85,  // High Nordic democracy
  },
  startingConditions: {
    governanceQuality: 0.75,  // Strong Nordic institutions
    institutionalCapacity: 0.75,
    trustInAI: 0.6,  // Higher trust baseline
  },
},
```

## Implementation Steps

1. **Open file:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/types/scenarios.ts`

2. **Find insertion point:** After `'foundations-first'` scenario (line ~568), before closing `} as const;` (line 585)

3. **Add comment header:**
```typescript
  /** === POLICY PACKAGE SCENARIOS (Phase 3) === */
```

4. **Add 5 scenarios:** Copy the scenario definitions above

5. **Verify syntax:**
   - Each scenario ends with comma
   - Closing `} as const;` preserved
   - No TypeScript errors

6. **Type check:**
```bash
npx tsc --noEmit
```

7. **Test single scenario:**
```bash
npx tsx scripts/scenarioRunner.ts green-new-deal 42 12
```

## Validation Checklist

Before marking complete:

- [ ] All 5 scenarios added to SCENARIO_CATALOG
- [ ] Each scenario has `id`, `name`, `description`, `hypothesis`
- [ ] Each scenario combines 2+ governance dimensions
- [ ] Parameters are research-backed (sources in description)
- [ ] TypeScript type-checks successfully
- [ ] Single scenario test runs without errors
- [ ] Scenarios reflect real-world policy debates

## Research Standard Compliance

✅ **Research-backed parameters:**
- Green New Deal: IEA Net Zero 2024, US GND Resolution 2019
- Techno-Optimist: Andreessen 2023, Cowen 2018
- Degrowth: Hickel 2020, Raworth 2017, Kallis 2020
- Authoritarian: Xi 2020, V-Dem 2024, Kostka & Zhang 2018
- Nordic: OECD 2024, V-Dem 2024, IEA 2024

✅ **No silent fallbacks:** All parameters explicit, no defensive `??` patterns

✅ **Hypothesis-driven:** Each scenario tests a clear research question

## Next Steps After Completion

1. **Monte Carlo validation:** Create script to run N=10 for all 5 scenarios
2. **Comparative analysis:** Compare policy packages to Phase 2 single-dimension scenarios
3. **Trade-off identification:** Climate vs equality, speed vs democracy
4. **Research validation:** Cynthia + Sylvia review parameter choices
5. **Architecture review:** Architecture-skeptic checks implementation
6. **Documentation:** Update wiki with Phase 3 findings

## Notes

**Why these 5 scenarios?**
1. **Green New Deal** - Dominant progressive climate+social proposal (US/EU)
2. **Techno-Optimist** - Silicon Valley libertarian position (Andreessen, Thiel)
3. **Degrowth** - Academic left ecological economics (Hickel, Raworth)
4. **Authoritarian** - China climate model (state-led rapid deployment)
5. **Nordic** - Best-in-class empirical baseline (Scandinavia)

These cover the major real-world policy debate positions from 2020-2025.

**Parameter notes:**
- Climate spending 10% GDP = extreme but tests upper bound
- Nordic redistribution 3.5% GDP/month = 42% annually (higher than empirical 30% to account for UBI on top of welfare state)
- Degrowth low research ($10B) = proxy for reduced growth/consumption
- Tech-optimist no climate spending = pure market solution

## Start Implementation

Begin with Green New Deal scenario, test it, then add the others. Good luck!
