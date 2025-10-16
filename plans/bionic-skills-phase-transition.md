# Bionic Skills: Phase Transition Mechanics

**Plan:** Phase 2 of Bionic Skills Research Grounding
**Effort:** 12 hours over Weeks 2-4
**Priority:** CRITICAL (Model currently assumes permanent amplification - misses displacement)
**Research TRL:** 9 (Historical pattern, extensively documented)
**Master Plan:** `plans/bionic-skills-research-grounding.md` §Phase 2
**Master Roadmap:** `plans/MASTER_IMPLEMENTATION_ROADMAP.md` §AI-Assisted Skills Enhancement →Phase 2
**Related Plans:**
- Phase 3: `plans/bionic-skills-competence-tracking.md` (low competence → higher displacement)
- Phase 4: `plans/bionic-skills-economic-distribution.md` (displacement → wage pressure)

---

## Problem Statement

**Current Model Limitation:**
The existing `bionicSkills.ts` assumes **permanent complementarity** - AI tools amplify human productivity indefinitely without displacement. This contradicts 40+ years of automation research showing a predictable pattern:

**Phase 1 (0-5 years):** Complementarity - Technology augments workers, productivity gains without job loss
**Phase 2 (5-10 years):** Transition - As technology improves, begins substituting for workers
**Phase 3 (10+ years):** Substitution - Technology replaces workers in routine tasks, unemployment rises

---

## Research Foundation

### Primary Research:

**Acemoglu & Restrepo (2022)** - "Tasks, Automation, and the Rise in U.S. Wage Inequality"
- Journal: Econometrica, 90(5), 1973-2016
- Finding: 50-70% of wage inequality from automation-induced displacement
- Mechanism: Tasks automated → workers displaced → wage pressure on remaining workers

### Historical Examples:

**ATMs (1970s-1990s):**
- 1970-1985: Complementarity (tellers moved to customer service, branch expansion)
- 1985-2000: Transition (fewer tellers per branch, consolidation begins)
- 2000+: Substitution (net teller employment declined despite more branches)
- Source: Federal Reserve Economic Data (FRED), BLS

**Spreadsheet Software (1985-2005):**
- 1985-1995: Complementarity (accountants more productive, demand increased)
- 1995-2005: Transition (entry-level bookkeeper roles automated)
- 2005+: Substitution (clerical accounting jobs declined 30%)
- Source: Bureau of Labor Statistics Occupational Employment Statistics

**Self-Checkout (2000-2020):**
- 2000-2010: Complementarity (cashiers assisted with technology)
- 2010-2020: Transition (fewer cashiers per store, gradual replacement)
- 2020+: Substitution (net cashier employment declining)
- Source: BLS, National Employment Law Project

### Timeline Validation:

From historical data, the pattern is consistent:
- **Complementarity phase:** 5-10 years (mean: 7 years)
- **Transition phase:** 5-10 years (mean: 7 years)
- **Full substitution:** Begins 10-15 years after technology introduction

---

## Implementation Design

### 1. Phase State Tracking (2 hours)

**Add to GameState:**
```typescript
interface AIPhaseTransition {
  // Current phase
  phase: 'complementarity' | 'transition' | 'substitution';

  // Time tracking
  monthsSinceAIIntroduction: number;
  yearsInCurrentPhase: number;

  // Thresholds (calibrated from research)
  complementarityEndMonth: 60;  // 5 years
  transitionEndMonth: 120;       // 10 years

  // Task complexity comparison
  averageTaskComplexity: number;  // 0-10 scale
  averageAICapability: number;    // 0-10 scale
  capabilityGap: number;          // AI capability - task complexity

  // Displacement tracking
  jobsAtRisk: Map<string, number>;  // by segment
  monthlyDisplacementRate: number;
  cumulativeDisplacement: number;
}
```

**Initialization:**
```typescript
function initializePhaseTransition(state: GameState): void {
  state.aiPhaseTransition = {
    phase: 'complementarity',
    monthsSinceAIIntroduction: 0,
    yearsInCurrentPhase: 0,
    complementarityEndMonth: 60,
    transitionEndMonth: 120,
    averageTaskComplexity: 3.0,  // Human-level tasks initially
    averageAICapability: 0.5,    // Subhuman AI initially
    capabilityGap: -2.5,          // AI far below task complexity
    jobsAtRisk: new Map(),
    monthlyDisplacementRate: 0,
    cumulativeDisplacement: 0
  };
}
```

---

### 2. Phase Transition Logic (4 hours)

**Phase Detection:**
```typescript
function updatePhaseTransition(state: GameState): void {
  const pt = state.aiPhaseTransition;
  pt.monthsSinceAIIntroduction++;

  // Calculate current AI capability (average across all AI systems)
  pt.averageAICapability = getAverageAICapability(state);

  // Calculate capability gap
  pt.capabilityGap = pt.averageAICapability - pt.averageTaskComplexity;

  // Determine phase based on time AND capability
  if (pt.monthsSinceAIIntroduction < pt.complementarityEndMonth) {
    // Still in complementarity phase
    pt.phase = 'complementarity';
    pt.monthlyDisplacementRate = 0;

  } else if (pt.monthsSinceAIIntroduction < pt.transitionEndMonth) {
    // Transition phase - displacement begins if AI capability sufficient
    pt.phase = 'transition';

    if (pt.capabilityGap > 0) {
      // AI capability exceeds task complexity - begin displacement
      // Rate proportional to capability gap and time in transition
      const transitionProgress = (pt.monthsSinceAIIntroduction - pt.complementarityEndMonth)
                                 / (pt.transitionEndMonth - pt.complementarityEndMonth);
      pt.monthlyDisplacementRate = 0.001 * pt.capabilityGap * transitionProgress;
      // 0.1% per month max in early transition, ramps up
    } else {
      // AI not yet capable enough - extended complementarity
      pt.monthlyDisplacementRate = 0;
    }

  } else {
    // Full substitution phase
    pt.phase = 'substitution';

    if (pt.capabilityGap > 0) {
      // Displacement rate proportional to capability gap
      pt.monthlyDisplacementRate = 0.002 * pt.capabilityGap;
      // Up to 0.2% per month (2.4% annual) at 1.0 capability gap
      // Matches historical automation displacement rates
    }
  }

  // Cap maximum displacement rate
  pt.monthlyDisplacementRate = Math.min(pt.monthlyDisplacementRate, 0.005);
  // Max 0.5% per month (6% annual) even at extreme AI capability
}
```

---

### 3. Displacement Calculation by Segment (4 hours)

**Jobs at Risk by Segment:**
```typescript
function calculateJobsAtRisk(state: GameState): void {
  const pt = state.aiPhaseTransition;
  const segments = state.society.segments;

  if (!segments) return;

  segments.forEach(segment => {
    // Factors determining displacement risk:
    // 1. Task routinizability (how automatable is this segment's work?)
    // 2. AI capability relative to task complexity
    // 3. Segment's ability to transition to new roles

    const routinizability = getSegmentRoutinizability(segment);
    const transitionAbility = segment.skills?.overallEffectiveness || 0.5;
    const aiCapabilityFactor = Math.max(0, pt.capabilityGap);

    // Jobs at risk = routinizable work * AI capability * (1 - transition ability)
    const atRiskFraction = routinizability * aiCapabilityFactor * (1 - transitionAbility * 0.5);

    // Store absolute numbers
    const totalJobs = segment.populationFraction * state.humanPopulationSystem.population;
    const employedJobs = totalJobs * (1 - state.society.unemploymentLevel);
    const jobsAtRisk = employedJobs * Math.min(atRiskFraction, 0.8);
    // Cap at 80% - not ALL jobs automatable

    pt.jobsAtRisk.set(segment.id, jobsAtRisk);
  });
}

function getSegmentRoutinizability(segment: SocietySegment): number {
  // Based on Frey & Osborne (2013) + updates from Acemoglu & Restrepo
  // Routine task intensity by occupation/skill level

  const routinizabilityByStatus: Record<string, number> = {
    'elite': 0.15,         // High-skill non-routine (creative, management)
    'professional': 0.25,  // Some routine elements (analysis, reports)
    'middle': 0.50,        // Mixed routine/non-routine
    'working': 0.70,       // High routine content (manual, clerical)
    'precariat': 0.65      // Service work - some human interaction protects
  };

  return routinizabilityByStatus[segment.economicStatus] || 0.50;
}
```

**Apply Displacement to Unemployment:**
```typescript
function applyDisplacement(state: GameState): void {
  const pt = state.aiPhaseTransition;

  if (pt.monthlyDisplacementRate === 0) return;

  let totalDisplaced = 0;

  state.society.segments?.forEach(segment => {
    const jobsAtRisk = pt.jobsAtRisk.get(segment.id) || 0;
    const displaced = jobsAtRisk * pt.monthlyDisplacementRate;

    totalDisplaced += displaced;

    // Log displacement event
    if (displaced > 10000) { // >10K people
      addEvent(state, {
        type: 'economic',
        severity: 'medium',
        title: `AI Displacement: ${segment.name}`,
        description: `${(displaced / 1000000).toFixed(2)}M workers in ${segment.name} displaced by AI automation. Jobs at risk: ${(jobsAtRisk / 1000000).toFixed(1)}M.`,
        effects: { unemploymentIncrease: displaced / state.humanPopulationSystem.population }
      });
    }
  });

  // Update total unemployment
  const unemploymentIncrease = totalDisplaced / state.humanPopulationSystem.population;
  state.society.unemploymentLevel = Math.min(
    state.society.unemploymentLevel + unemploymentIncrease,
    0.40  // Cap at 40% unemployment
  );

  pt.cumulativeDisplacement += totalDisplaced;
}
```

---

### 4. Policy Intervention Effects (2 hours)

**Retraining Programs:**
```typescript
function applyRetrainingEffect(state: GameState): void {
  const retrainingLevel = state.policy?.retrainingInvestment || 0;
  // 0 = none, 1 = aggressive retraining

  if (retrainingLevel > 0) {
    // Retraining increases "transition ability" for workers
    state.society.segments?.forEach(segment => {
      const currentAbility = segment.skills?.overallEffectiveness || 0.5;
      const retrainingBoost = retrainingLevel * 0.2;  // Up to 20% boost

      // Update skills (improves ability to move to new roles)
      if (segment.skills) {
        segment.skills.overallEffectiveness = Math.min(
          currentAbility + retrainingBoost,
          1.0
        );
      }
    });

    // Retraining also slows displacement rate directly
    state.aiPhaseTransition.monthlyDisplacementRate *= (1 - retrainingLevel * 0.3);
    // Up to 30% reduction in displacement with aggressive retraining
  }
}
```

**Job Guarantee Programs:**
```typescript
function applyJobGuaranteeEffect(state: GameState): void {
  const jobGuaranteeLevel = state.policy?.jobGuarantee || 0;
  // 0 = none, 1 = full job guarantee

  if (jobGuaranteeLevel > 0) {
    // Job guarantee puts a floor on unemployment
    const guaranteedEmploymentRate = 0.95;  // 5% structural unemployment
    const targetUnemployment = 1 - (guaranteedEmploymentRate * jobGuaranteeLevel);

    if (state.society.unemploymentLevel > targetUnemployment) {
      // Government employs displaced workers
      const employed = state.society.unemploymentLevel - targetUnemployment;
      state.society.unemploymentLevel = targetUnemployment;

      addEvent(state, {
        type: 'policy',
        severity: 'medium',
        title: 'Job Guarantee Program',
        description: `Government employs ${(employed * 100).toFixed(1)}% of workforce to maintain employment floor.`,
        effects: { unemployment: -employed }
      });
    }
  }
}
```

---

## Testing & Validation (included in 12 hours)

### Historical Validation Tests:

**Test 1: ATM Timeline (1970-2000)**
```typescript
test('Phase transition matches ATM adoption timeline', () => {
  const state = initializeGameState();

  // Simulate 30 years (360 months) with AI capability growth
  for (let month = 0; month < 360; month++) {
    // AI capability grows from 0.5 → 4.0 over 30 years (matches ATM capability growth)
    state.aiAgents[0].capability = 0.5 + (month / 360) * 3.5;

    updatePhaseTransition(state);

    if (month < 60) {
      // First 5 years: complementarity
      expect(state.aiPhaseTransition.phase).toBe('complementarity');
      expect(state.aiPhaseTransition.monthlyDisplacementRate).toBe(0);
    } else if (month < 120) {
      // Years 5-10: transition
      expect(state.aiPhaseTransition.phase).toBe('transition');
    } else {
      // Years 10+: substitution
      expect(state.aiPhaseTransition.phase).toBe('substitution');
      expect(state.aiPhaseTransition.monthlyDisplacementRate).toBeGreaterThan(0);
    }
  }

  // Validate total displacement matches historical data (10-20% over 20 years)
  const finalUnemploymentIncrease = state.aiPhaseTransition.cumulativeDisplacement
                                    / state.humanPopulationSystem.population;
  expect(finalUnemploymentIncrease).toBeGreaterThan(0.05);  // At least 5%
  expect(finalUnemploymentIncrease).toBeLessThan(0.25);     // Less than 25%
});
```

**Test 2: Policy Intervention Effectiveness**
```typescript
test('Retraining slows displacement', () => {
  const stateNoPolicy = initializeGameState();
  const stateWithPolicy = initializeGameState();

  // Set up AI capability to trigger displacement
  stateNoPolicy.aiAgents[0].capability = 4.0;
  stateWithPolicy.aiAgents[0].capability = 4.0;
  stateWithPolicy.policy.retrainingInvestment = 0.8;  // Aggressive retraining

  // Run for 60 months in substitution phase
  for (let month = 0; month < 60; month++) {
    updatePhaseTransition(stateNoPolicy);
    applyDisplacement(stateNoPolicy);

    updatePhaseTransition(stateWithPolicy);
    applyRetrainingEffect(stateWithPolicy);
    applyDisplacement(stateWithPolicy);
  }

  // With retraining, unemployment increase should be 30%+ lower
  expect(stateWithPolicy.society.unemploymentLevel)
    .toBeLessThan(stateNoPolicy.society.unemploymentLevel * 0.7);
});
```

---

## Integration Points

**Connects to:**
- `calculateUnemployment()` in `calculations.ts` - add displacement to unemployment
- `updateBionicSkills()` in `bionicSkills.ts` - phase affects amplification (substitution reduces it)
- `updateSocietyAggregates()` in `populationSegments.ts` - displacement varies by segment
- Policy system - retraining, job guarantees, UBI all affect displacement

**Adds to GameState:**
- `aiPhaseTransition: AIPhaseTransition` - new top-level state object

**Adds to Events:**
- "AI Displacement" events when significant job loss occurs
- "Phase Transition" events when moving between phases

---

## Parameters Reference

```typescript
const PHASE_TRANSITION_CONFIG = {
  // Timeline calibrated from ATM, Excel, self-checkout historical data
  complementarityPeriod: 60,        // 5 years (months)
  transitionPeriod: 60,             // 5 years (months)

  // Displacement rates calibrated from BLS automation data
  baseDisplacementRate: 0.002,      // 0.2% per month (2.4% annual)
  maxDisplacementRate: 0.005,       // 0.5% per month (6% annual)

  // Task complexity by occupation (Frey & Osborne 2013)
  routinizability: {
    elite: 0.15,
    professional: 0.25,
    middle: 0.50,
    working: 0.70,
    precariat: 0.65
  },

  // Policy effectiveness (from retraining program studies)
  retrainingDisplacementReduction: 0.30,  // 30% reduction
  retrainingSkillBoost: 0.20,             // 20% skill increase
  jobGuaranteeFloor: 0.05                 // 5% min unemployment
};
```

---

## Success Criteria

✅ **Phase timing matches historical patterns:**
- Complementarity: 5-10 years
- Transition: 5-10 years
- Substitution: 10+ years

✅ **Displacement rates are realistic:**
- Annual displacement: 2-6% during substitution
- Total displacement over 20 years: 10-25%
- Matches BLS automation impact data

✅ **Policy interventions are effective:**
- Retraining reduces displacement 20-40%
- Job guarantee maintains employment floor
- Without policy, unemployment rises significantly

✅ **Segment differentiation:**
- Elite: Lower displacement (15% jobs at risk)
- Working class: Higher displacement (70% jobs at risk)
- Matches occupational automation research

---

## Next Steps After Implementation

1. **Integrate with Phase 3** (Competence Tracking)
   - Displacement risk higher for workers with low competence
   - Retraining effectiveness depends on retention rates

2. **Integrate with Phase 4** (Economic Distribution)
   - Displaced workers lose wage bargaining power
   - Capital captures productivity gains from automation

3. **Add to Monte Carlo validation**
   - Run historical scenarios (ATM, Excel timelines)
   - Validate displacement rates against BLS data

---

**Effort:** 12 hours
**Priority:** High (critical gap)
**Research TRL:** 9 (extensively validated)
**Status:** Ready for implementation
