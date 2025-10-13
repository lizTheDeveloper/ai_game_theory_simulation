# Realistic Timeline Recalibration Plan

## Goal
Adjust simulation from "collapse in 8 months" to "tipping points 2030-2035, severe collapse 2040-2070"

## Success Criteria
- ✅ No ecosystem collapse before Month 60 (Year 5, ~2030)
- ✅ Tipping point cascade 2030-2040 (Months 60-180)
- ✅ Severe impacts 2040-2070 (Months 180-540)
- ✅ Monte Carlo run: 600 months (50 years) to show full timeline

---

## Phase 1: Biodiversity System Recalibration (2 hours)

### File: `src/simulation/planetaryBoundaries.ts`

**1.1 Slow Down Baseline Degradation**
```typescript
// CURRENT:
const baselineDegradation = -0.3; // Way too fast

// NEW:
const baselineDegradation = -0.04; // -0.5%/year realistic
```

**1.2 Lower Collapse Threshold**
```typescript
// CURRENT:
const ECOSYSTEM_COLLAPSE_THRESHOLD = 0.30; // 30%

// NEW:
const ECOSYSTEM_COLLAPSE_THRESHOLD = 0.20; // 20% (point of no return)
```

**1.3 Add Time Lag System**
```typescript
interface BiodiversityState {
  currentLevel: number;
  collapsedAt: number; // Month when threshold crossed, or -1
  monthsSinceCollapse: number;
  collapsePhase: 'stable' | 'declining' | 'crisis' | 'collapse';
}

// Phase transitions over time:
// 0-24 months after threshold: declining (1x mortality)
// 24-60 months: crisis (5x mortality)
// 60+ months: collapse (10x mortality)
```

**1.4 Gradual Death Rates**
```typescript
// CURRENT:
const mortality = 0.02; // 2% per month instantly

// NEW:
function calculateEcosystemMortality(state: BiodiversityState): number {
  if (state.collapsePhase === 'stable') return 0;
  if (state.collapsePhase === 'declining') return 0.0001; // 0.01%
  if (state.collapsePhase === 'crisis') return 0.001; // 0.1%
  if (state.collapsePhase === 'collapse') return 0.01; // 1%
  // Escalates over 5-10 years, not instantly
}
```

**Testing:**
- Run 10-year sim, verify no collapse before Year 5
- Check degradation rate: 35% → ~32% after 5 years
- Verify threshold crossed ~2030 (Month 60)

---

## Phase 2: Tipping Point Cascade System (2 hours)

### File: `src/simulation/planetaryBoundaries.ts`

**2.1 Add Cascade Timing**
```typescript
// CURRENT:
if (biodiversity < threshold) {
  triggerCascade(); // Immediate
}

// NEW:
interface TippingPointCascade {
  triggered: boolean;
  triggeredAt: number; // Month
  monthsSinceTrigger: number;
  phase: 'initial' | 'accelerating' | 'runaway';
  mortalityMultiplier: number;
}

function updateCascade(cascade: TippingPointCascade, currentMonth: number) {
  if (!cascade.triggered) return;
  
  cascade.monthsSinceTrigger = currentMonth - cascade.triggeredAt;
  
  // 0-24 months: initial crisis (2% mortality)
  if (cascade.monthsSinceTrigger < 24) {
    cascade.phase = 'initial';
    cascade.mortalityMultiplier = 2.0;
  }
  // 24-60 months: accelerating (5% mortality)
  else if (cascade.monthsSinceTrigger < 60) {
    cascade.phase = 'accelerating';
    cascade.mortalityMultiplier = 5.0;
  }
  // 60+ months: runaway collapse (10% mortality)
  else {
    cascade.phase = 'runaway';
    cascade.mortalityMultiplier = 10.0;
  }
}
```

**2.2 Adjust Cascade Mortality**
```typescript
// CURRENT:
const cascadeMortality = 0.02; // 2% immediately

// NEW:
const baseMortality = 0.001; // 0.1% baseline in crisis
const mortality = baseMortality * cascade.mortalityMultiplier;
// Starts at 0.2%, escalates to 1% over 5 years
```

**Testing:**
- Trigger cascade at Month 60
- Verify deaths: Low first 2 years, high by Year 10
- Check mortality curve matches research

---

## Phase 3: Specific Tipping Points (3 hours)

### File: `src/simulation/specificTippingPoints.ts` (NEW)

**3.1 Amazon Rainforest**
```typescript
interface AmazonTippingPoint {
  deforestation: number; // 0-100%
  tippingThreshold: 25; // 25% deforested
  triggered: boolean;
  triggeredAt: number;
  transitionProgress: number; // 0-100%, takes 50 years
  carbonReleased: number; // Up to 200Gt
}

function updateAmazon(amazon: AmazonTippingPoint, currentMonth: number) {
  // Deforestation rate: ~0.5%/year currently
  amazon.deforestation += 0.04; // 0.5%/year = 0.04%/month
  
  if (amazon.deforestation >= amazon.tippingThreshold && !amazon.triggered) {
    amazon.triggered = true;
    amazon.triggeredAt = currentMonth;
    console.log(`🌲 AMAZON TIPPING POINT: Transition to savanna begins (Month ${currentMonth})`);
  }
  
  if (amazon.triggered) {
    const monthsSince = currentMonth - amazon.triggeredAt;
    // 50-year transition = 600 months
    amazon.transitionProgress = Math.min(100, (monthsSince / 600) * 100);
    
    // Carbon release accelerates
    const carbonReleaseRate = (amazon.transitionProgress / 100) * 0.33; // 200Gt over 50 years
    amazon.carbonReleased += carbonReleaseRate;
    
    // Accelerates climate change
    state.planetaryBoundaries.climateStability -= carbonReleaseRate * 0.01;
  }
}
```

**3.2 Coral Reef Collapse**
```typescript
interface CoralReefSystem {
  healthPercentage: number; // 0-100%
  tippingThreshold: 30; // When mass bleaching becomes regular
  triggered: boolean;
  triggeredAt: number;
  collapseProgress: number; // 15-year collapse after trigger
}

function updateCoralReefs(coral: CoralReefSystem, currentMonth: number) {
  // Bleaching from ocean acidification
  const aragonite = state.planetaryBoundaries.aragoniteSaturation;
  if (aragonite < 3.5) {
    coral.healthPercentage -= 0.1; // Decline from acidification
  }
  
  if (coral.healthPercentage < coral.tippingThreshold && !coral.triggered) {
    coral.triggered = true;
    coral.triggeredAt = currentMonth;
    console.log(`🪸 CORAL TIPPING POINT: Mass die-off begins (Month ${currentMonth})`);
  }
  
  if (coral.triggered) {
    const monthsSince = currentMonth - coral.triggeredAt;
    // 15-year collapse = 180 months
    coral.collapseProgress = Math.min(100, (monthsSince / 180) * 100);
    coral.healthPercentage = 100 - coral.collapseProgress;
    
    // Impacts ocean biodiversity
    state.planetaryBoundaries.oceanHealth = coral.healthPercentage / 2; // Corals support 25% marine life
  }
}
```

**3.3 Insect Pollinator Decline**
```typescript
interface PollinatorSystem {
  populationPercentage: number; // Current: 60% (40% decline)
  criticalThreshold: 35; // 65% decline = food crisis
  triggered: boolean;
  triggeredAt: number;
}

function updatePollinators(pollinators: PollinatorSystem) {
  // Decline rate: ~1-2%/year
  const declineRate = -0.1; // 1.2%/year = 0.1%/month
  pollinators.populationPercentage += declineRate;
  
  if (pollinators.populationPercentage < pollinators.criticalThreshold && !pollinators.triggered) {
    pollinators.triggered = true;
    pollinators.triggeredAt = state.currentMonth;
    console.log(`🦋 POLLINATOR COLLAPSE: Agricultural crisis begins (Month ${state.currentMonth})`);
  }
  
  if (pollinators.triggered) {
    // 35% of food production depends on pollinators
    const foodProductionLoss = (65 - pollinators.populationPercentage) / 65 * 0.35;
    state.resourceAvailability.food -= foodProductionLoss * 0.01; // Gradual impact
  }
}
```

**Testing:**
- Amazon triggers ~Month 60-120 (5-10 years)
- Coral triggers ~Month 180-240 (15-20 years)
- Pollinators trigger ~Month 60-120
- Each has realistic timeline

---

## Phase 4: Freshwater System Adjustment (1 hour)

### File: `src/simulation/freshwater.ts`

**4.1 Slower Depletion**
```typescript
// CURRENT:
Peak groundwater at Month 14 (too fast)

// NEW:
function updateGroundwater(state: GameState) {
  const depletionRate = 0.2; // 2.4%/year = 0.2%/month
  state.planetaryBoundaries.freshwater -= depletionRate;
  
  // Day Zero events start appearing ~2030 (Month 60)
  if (state.currentMonth > 60 && state.planetaryBoundaries.freshwater < 50) {
    const eventProbability = (50 - state.planetaryBoundaries.freshwater) / 50 * 0.1;
    if (Math.random() < eventProbability) {
      triggerDayZeroEvent(state);
    }
  }
}
```

**Testing:**
- Groundwater 65% → 50% by Month 60
- Day Zero events rare before 2030, common after
- Peak crisis 2035-2045

---

## Phase 5: Climate Tipping Points (2 hours)

### File: `src/simulation/climateTippingPoints.ts` (NEW)

**5.1 Permafrost Thaw**
```typescript
interface PermafrostSystem {
  carbonStored: 1400; // Gigatons
  carbonReleased: 0;
  thawRate: 0; // Accelerates with temperature
  triggered: boolean;
}

function updatePermafrost(permafrost: PermafrostSystem, globalTemp: number) {
  // Thaw accelerates with temperature
  // Major release 2050-2100 (Months 300-900)
  if (state.currentMonth > 300) {
    const tempAboveBaseline = globalTemp - 1.5;
    permafrost.thawRate = tempAboveBaseline * 0.05; // Faster with more warming
    
    permafrost.carbonReleased += permafrost.thawRate;
    
    // Feedback loop: released carbon → more warming
    const additionalWarming = permafrost.carbonReleased / 1400 * 0.3; // Up to 0.3C
    state.planetaryBoundaries.climateStability -= additionalWarming * 0.1;
  }
}
```

**5.2 AMOC Weakening**
```typescript
interface AMOCSystem {
  strength: 85; // Currently 15% weaker than 1970
  collapseThreshold: 60; // 24-39% additional weakening
  triggered: boolean;
  triggeredAt: number;
}

function updateAMOC(amoc: AMOCSystem) {
  // Gradual weakening, collapse ~2100 earliest (Month 900)
  if (state.currentMonth < 900) {
    amoc.strength -= 0.03; // ~0.35%/year weakening
  } else {
    // After Month 900, risk of collapse
    if (amoc.strength < amoc.collapseThreshold && !amoc.triggered) {
      amoc.triggered = true;
      amoc.triggeredAt = state.currentMonth;
      console.log(`🌊 AMOC COLLAPSE: Ocean circulation failure (Month ${state.currentMonth})`);
      // Catastrophic weather disruption globally
    }
  }
}
```

**Testing:**
- Permafrost effects post-2050 (Month 300+)
- AMOC collapse risk post-2100 (Month 900+)
- Long-term simulation captures these

---

## Phase 6: Update Game State Types (1 hour)

### File: `src/types/game.ts`

**6.1 Add New State Fields**
```typescript
interface PlanetaryBoundaries {
  // Existing fields...
  
  // NEW: Tipping point tracking
  biodiversityCollapse: {
    triggered: boolean;
    triggeredAt: number;
    monthsSinceTrigger: number;
    phase: 'stable' | 'declining' | 'crisis' | 'collapse';
  };
  
  tippingPointCascade: {
    triggered: boolean;
    triggeredAt: number;
    monthsSinceTrigger: number;
    phase: 'initial' | 'accelerating' | 'runaway';
    mortalityMultiplier: number;
  };
  
  amazonRainforest: AmazonTippingPoint;
  coralReefs: CoralReefSystem;
  pollinators: PollinatorSystem;
  permafrost: PermafrostSystem;
  amoc: AMOCSystem;
}
```

**6.2 Initialization**
```typescript
function initializePlanetaryBoundaries(): PlanetaryBoundaries {
  return {
    // ... existing
    
    biodiversityCollapse: {
      triggered: false,
      triggeredAt: -1,
      monthsSinceTrigger: 0,
      phase: 'stable',
    },
    
    tippingPointCascade: {
      triggered: false,
      triggeredAt: -1,
      monthsSinceTrigger: 0,
      phase: 'initial',
      mortalityMultiplier: 1.0,
    },
    
    amazonRainforest: {
      deforestation: 20, // Current real-world level
      tippingThreshold: 25,
      triggered: false,
      triggeredAt: -1,
      transitionProgress: 0,
      carbonReleased: 0,
    },
    
    coralReefs: {
      healthPercentage: 70, // Already degraded
      tippingThreshold: 30,
      triggered: false,
      triggeredAt: -1,
      collapseProgress: 0,
    },
    
    pollinators: {
      populationPercentage: 60, // 40% decline already
      criticalThreshold: 35,
      triggered: false,
      triggeredAt: -1,
    },
    
    permafrost: {
      carbonStored: 1400,
      carbonReleased: 0,
      thawRate: 0,
      triggered: false,
    },
    
    amoc: {
      strength: 85, // 15% weaker than 1970
      collapseThreshold: 60,
      triggered: false,
      triggeredAt: -1,
    },
  };
}
```

---

## Phase 7: Update Death Calculation (1 hour)

### File: `src/simulation/population.ts`

**7.1 Multi-Factor Death Rate**
```typescript
function calculateMonthlyDeaths(state: GameState): number {
  let totalMortalityRate = 0;
  
  // 1. Biodiversity collapse (gradual escalation)
  if (state.planetaryBoundaries.biodiversityCollapse.triggered) {
    const phase = state.planetaryBoundaries.biodiversityCollapse.phase;
    if (phase === 'declining') totalMortalityRate += 0.0001; // 0.01%
    if (phase === 'crisis') totalMortalityRate += 0.001; // 0.1%
    if (phase === 'collapse') totalMortalityRate += 0.01; // 1%
  }
  
  // 2. Tipping point cascade (multiplier)
  if (state.planetaryBoundaries.tippingPointCascade.triggered) {
    const multiplier = state.planetaryBoundaries.tippingPointCascade.mortalityMultiplier;
    totalMortalityRate *= multiplier;
  }
  
  // 3. Specific tipping points
  if (state.planetaryBoundaries.amazonRainforest.triggered) {
    const progress = state.planetaryBoundaries.amazonRainforest.transitionProgress / 100;
    totalMortalityRate += progress * 0.002; // Up to 0.2% as Amazon collapses
  }
  
  if (state.planetaryBoundaries.pollinators.triggered) {
    totalMortalityRate += 0.003; // 0.3% from food production loss
  }
  
  // 4. Regional crises (freshwater, etc.)
  // ... existing systems
  
  // Cap at 2% per month (extreme scenario)
  totalMortalityRate = Math.min(0.02, totalMortalityRate);
  
  return state.population * totalMortalityRate;
}
```

**Testing:**
- Early game (Months 0-60): <1M deaths/month
- Mid game (Months 60-180): 5-20M deaths/month
- Late game (Months 180+): 50-200M deaths/month
- Realistic escalation curve

---

## Phase 8: Logging & Diagnostics (1 hour)

### File: `src/simulation/planetaryBoundaries.ts`

**8.1 Enhanced Logging**
```typescript
function logTippingPointStatus(state: GameState, currentMonth: number) {
  if (currentMonth % 12 === 0) { // Annual report
    console.log(`\n📊 TIPPING POINT STATUS (Year ${Math.floor(currentMonth / 12)})`);
    console.log(`  Biodiversity: ${state.planetaryBoundaries.biodiversityIndex.toFixed(1)}%`);
    
    if (state.planetaryBoundaries.biodiversityCollapse.triggered) {
      const months = state.planetaryBoundaries.biodiversityCollapse.monthsSinceTrigger;
      const years = (months / 12).toFixed(1);
      console.log(`  🚨 Collapse triggered ${years} years ago (Phase: ${state.planetaryBoundaries.biodiversityCollapse.phase})`);
    }
    
    console.log(`  Amazon deforestation: ${state.planetaryBoundaries.amazonRainforest.deforestation.toFixed(1)}%`);
    if (state.planetaryBoundaries.amazonRainforest.triggered) {
      console.log(`  🌲 Amazon transition: ${state.planetaryBoundaries.amazonRainforest.transitionProgress.toFixed(1)}% complete`);
    }
    
    console.log(`  Coral health: ${state.planetaryBoundaries.coralReefs.healthPercentage.toFixed(1)}%`);
    console.log(`  Pollinators: ${state.planetaryBoundaries.pollinators.populationPercentage.toFixed(1)}%`);
    console.log(`  Population: ${(state.population / 1e9).toFixed(2)}B`);
  }
}
```

---

## Phase 9: Monte Carlo Configuration (30 min)

### File: `scripts/monteCarloSimulation.ts`

**9.1 Extend Duration**
```typescript
// CURRENT:
const SIMULATION_DURATION = 240; // 20 years

// NEW:
const SIMULATION_DURATION = 600; // 50 years (to show full cascade)
```

**9.2 Add Timeline Markers**
```typescript
const TIMELINE_MARKERS = {
  5: 'Year 5 (2030): Expected tipping point window opens',
  10: 'Year 10 (2035): Tipping points likely crossed',
  20: 'Year 20 (2045): Crisis phase',
  30: 'Year 30 (2055): Severe impacts',
  40: 'Year 40 (2065): Post-collapse stabilization?',
  50: 'Year 50 (2075): Long-term outcome visible',
};
```

**9.3 Results Analysis**
```typescript
function analyzeResults(results: SimulationResult[]) {
  console.log('\n📊 TIMELINE ANALYSIS:');
  
  for (const [year, description] of Object.entries(TIMELINE_MARKERS)) {
    const month = parseInt(year) * 12;
    const extinctByThen = results.filter(r => 
      r.outcome === 'extinction' && r.extinctionMonth <= month
    ).length;
    
    console.log(`\n${description}`);
    console.log(`  Extinct by then: ${extinctByThen}/${results.length} runs`);
  }
}
```

---

## Implementation Order

### Session 1: Core Recalibration (3-4 hours)
1. ✅ Phase 1: Biodiversity system (slow degradation, lower threshold, time lags)
2. ✅ Phase 2: Tipping point cascade (gradual escalation)
3. ✅ Phase 6: Update types
4. ✅ Phase 7: Death calculation
5. ✅ Test: 10-year run, verify no collapse before Year 5

### Session 2: Specific Tipping Points (3 hours)
6. ✅ Phase 3: Amazon, coral, pollinators
7. ✅ Phase 4: Freshwater adjustment
8. ✅ Phase 8: Enhanced logging
9. ✅ Test: 20-year run, verify realistic timeline

### Session 3: Long-Term Dynamics (2 hours)
10. ✅ Phase 5: Permafrost, AMOC (post-2050 effects)
11. ✅ Test: 50-year run single sim

### Session 4: Monte Carlo Run (1 hour setup, 30min-2hr runtime)
12. ✅ Phase 9: Configure 50-year Monte Carlo
13. ✅ Run: 10 simulations x 600 months
14. ✅ Analyze: Timeline distribution of collapses

---

## Testing Checkpoints

### Checkpoint 1: After Phase 1-2 (Biodiversity)
**Expected:**
- Year 1-5: Biodiversity 35% → 32%, no collapse
- Year 5-10: Cross threshold (~20%), start declining phase
- Year 10-15: Crisis phase, deaths escalating
- No instant apocalypse

**Command:**
```bash
cd /Users/annhoward/src/ai_game_theory_simulation && \
npx tsx scripts/testRealisticTimeline.ts > logs/realistic_timeline_test_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

### Checkpoint 2: After Phase 3-4 (Tipping Points)
**Expected:**
- Amazon triggers Year 5-10
- Coral triggers Year 15-20
- Pollinators trigger Year 5-10
- Each has independent timeline

### Checkpoint 3: After Phase 5 (Long-term)
**Expected:**
- Permafrost kicks in Year 25+
- AMOC risk Year 75+
- 50-year simulation runs without crash

### Checkpoint 4: Final Monte Carlo
**Expected:**
- 0% extinction before Year 5
- 10-30% extinction Year 10-20 (early tipping points)
- 50-80% extinction Year 20-40 (cascade phase)
- Clear timeline distribution showing realistic collapse timing

---

## Success Metrics

### Before (Current State)
- Ecosystem collapse: Month 6 (April 2026)
- Mass deaths: Month 8 (June 2026)
- Near extinction: Month 20 (June 2027)
- Timeline: **Unrealistically fast**

### After (Realistic State)
- Tipping points: Months 60-120 (2030-2035)
- Crisis phase: Months 120-300 (2035-2050)
- Severe collapse: Months 300-600 (2050-2075)
- Timeline: **Matches scientific consensus**

### Validation
- ✅ No collapse before 2030 in any run
- ✅ Tipping points crossed 2030-2040
- ✅ Death rates escalate gradually (years, not months)
- ✅ 50-year simulation shows full arc
- ✅ Window for intervention visible (2025-2035)

---

## Files to Modify

**Core Systems:**
1. `src/simulation/planetaryBoundaries.ts` - Main recalibration
2. `src/types/game.ts` - New state fields
3. `src/simulation/population.ts` - Death calculation
4. `src/simulation/initialization.ts` - New defaults

**New Systems:**
5. `src/simulation/specificTippingPoints.ts` - Amazon, coral, pollinators, etc.
6. `src/simulation/climateTippingPoints.ts` - Permafrost, AMOC
7. `src/simulation/freshwater.ts` - Adjust depletion rate

**Testing:**
8. `scripts/testRealisticTimeline.ts` - Test harness
9. `scripts/monteCarloSimulation.ts` - Extend to 600 months

**Total:** ~9 files, ~1500-2000 lines of changes

---

## Risk Mitigation

**Risk 1: Break existing systems**
- Mitigation: Test after each phase, commit frequently
- Rollback: Git branch, easy revert

**Risk 2: Still too fast or too slow**
- Mitigation: Checkpoint testing, tune parameters
- Easy fix: Adjust rates (0.04 → 0.03 or 0.05)

**Risk 3: Long simulation crashes**
- Mitigation: Test 50-year single run first
- NaN guards: Already in place from previous work

**Risk 4: Monte Carlo takes too long**
- Mitigation: Start with 5 runs, expand to 10 if time permits
- Can run overnight if needed

---

## Timeline Estimate

- **Phase 1-2**: 3-4 hours (core biodiversity)
- **Phase 3-4**: 3 hours (specific tipping points)
- **Phase 5**: 2 hours (long-term climate)
- **Phase 6-8**: 2 hours (types, logging)
- **Phase 9**: 1 hour (Monte Carlo setup)
- **Testing**: 1-2 hours (spread throughout)
- **Monte Carlo run**: 30min-2hr (background)

**Total**: 12-14 hours implementation + runtime

**Recommendation**: Do in 2-3 sessions, checkpoint after each phase

---

## Ready to Begin?

**Start with Phase 1: Biodiversity Recalibration**

This is the foundation - slow down degradation, lower threshold, add time lags. Once this works, everything else builds on it.

Shall I proceed?

