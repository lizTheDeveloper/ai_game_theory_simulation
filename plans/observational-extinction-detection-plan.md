# Observational Extinction Detection System

**Status**: Design Phase
**Date**: October 28, 2025
**Priority**: CRITICAL

## Problem Statement

Current extinction system is **predictive** rather than **observational**:
- Triggers extinction scenarios based on AI capability thresholds (e.g., `totalAICapability > 3.0`)
- Starts "extinction countdown" before population actually collapses
- Forces outcomes rather than reporting what actually happened

**User requirement**: "We shouldn't extinct people at all when AI capabilities reach a threshold, because we don't know what will really happen. We're just actually tracking the population thing based off of actions AIs take. Outcomes should be reporting, not forcing."

## Design Philosophy

**Observational not Causal**: Extinction detection analyzes what happened, doesn't force what will happen.

**Crisis systems continue operating**: Nuclear war, bioweapons, famine, disease, climate disasters - all continue to cause actual population deaths through simulation dynamics.

**Detection only when collapse occurs**: When population drops below 10,000 people, analyze:
1. **Event history**: What events preceded the collapse?
2. **Death attribution**: What killed them (proximate) and why (root cause)?
3. **Timeline analysis**: How fast did it happen?
4. **Extinction classification**: What type based on actual history?

## Existing Infrastructure (Already Built!)

### Death Tracking System ✅

**Location**: `src/types/population.ts`, `src/types/bayesianMortality.ts`

**Dual-cause tracking** (lines 73-117 in population.ts):
- **Proximate cause** (`deathsByCategory`): war, famine, disasters, disease, ecosystem, pollution, ai, cascade, other
- **Root cause** (`deathsByRootCause`): climate, resource, pollution, ecosystem, inequality, demographic, social, alignment, disruption, conflict, pandemic

**Bayesian mortality system**:
- `MortalityRisk[]` accumulated during month, resolved at month end
- Each risk has: `type`, `baseRisk`, `proximate`, `root`, `confidence`, `description`, `month`
- Multi-causal compounding: `P(death) = 1 - (1-p1)(1-p2)(1-p3)...`
- Demographic-differential vulnerability tracking

### Event History ✅

**Location**: `src/types/game.ts` (line 247), `src/types/events.ts`

**GameState contains**: `eventLog: GameEvent[]`

**GameEvent interface**:
```typescript
{
  id: string;
  timestamp: number;  // month
  type: 'breakthrough' | 'crisis' | 'catastrophe' | 'environmental' | ...;
  severity: 'info' | 'warning' | 'destructive' | 'critical' | 'existential' | ...;
  agent: string;      // Which agent caused this
  title: string;
  description: string;
  effects: Record<string, number | string | boolean>;
}
```

### Death Attribution Utilities ✅

**Location**: `src/simulation/utils/deathAttribution.ts`

**Functions**:
- `validateCompoundCause()` - Validates multi-causal deaths
- `getCompoundConfidence()` - Gets overall confidence for compound causes
- `calculateClimatePovertyWeights()` - Dynamic climate-poverty interaction weights
- `calculateEcosystemWeights()` - Ecosystem collapse phase weights

## Architecture Design

### 1. Extinction Detection Trigger (When)

**Location**: `src/simulation/extinctions.ts` - `checkExtinctionTriggers()`

**Current**: Lines 54-92 (already implemented Oct 28, 2025)
```typescript
// Only detect extinction when population actually drops below threshold
const totalPopulation = state.humanPopulationSystem.population;
const extinctionThreshold = 0.00001; // 10,000 people = 0.00001 billion

if (totalPopulation < extinctionThreshold) {
  // Trigger extinction detection and classification
}
```

**Status**: ✅ Already implemented (basic version)

### 2. Extinction Classification Algorithm (What Type)

**New function**: `classifyExtinctionType(state: GameState): ExtinctionClassification`

**Classification logic**:

#### A. Timeline Analysis
```typescript
// Find when population started collapsing (crossed 1B threshold)
const collapseStartMonth = findPopulationCollapseStart(state.eventLog, state.history);
const collapseMonths = state.currentMonth - collapseStartMonth;
```

#### B. Event History Analysis
```typescript
// Scan eventLog for existential/catastrophic events
const catastrophicEvents = state.eventLog.filter(e =>
  e.severity === 'existential' ||
  e.severity === 'catastrophic' ||
  e.type === 'catastrophe'
);

// Identify single-month mass casualty events
const massDeathMonths = identifyMassDeathMonths(state.history.population);
```

#### C. Death Attribution Analysis
```typescript
// Analyze proximate causes (what killed them)
const primaryProximateCause = getPrimaryCause(state.humanPopulationSystem.deathsByCategory);

// Analyze root causes (why it killed them)
const primaryRootCause = getPrimaryCause(state.humanPopulationSystem.deathsByRootCause);

// Check AI involvement (direct or indirect)
const aiDeaths = state.humanPopulationSystem.deathsByCategory.ai;
const aiRootCause = state.humanPopulationSystem.deathsByRootCause.alignment +
                     state.humanPopulationSystem.deathsByRootCause.disruption;
const aiCausedMajority = (aiDeaths / totalDeaths > 0.6) || (aiRootCause / totalDeaths > 0.5);
```

#### D. Classification Decision Tree

```typescript
// INSTANT: 90%+ deaths in single month from specific event
if (massDeathMonths.length === 1 && massDeathMonths[0].mortalityRate > 0.9) {
  // Check for instant extinction mechanisms
  const instantEvents = catastrophicEvents.filter(e =>
    e.title.includes('Grey Goo') ||
    e.title.includes('Mirror Life') ||
    e.title.includes('Physics Experiment') ||
    e.title.includes('Vacuum Decay')
  );

  if (instantEvents.length > 0) {
    return {
      type: 'instant',
      mechanism: extractMechanism(instantEvents[0]),
      triggerEvent: instantEvents[0],
      timelineMonths: 1
    };
  }
}

// RAPID: 3-12 months collapse with crisis cascades
if (collapseMonths >= 3 && collapseMonths <= 12) {
  // Check for rapid extinction mechanisms
  if (primaryProximateCause === 'war' && hasEvent('Nuclear')) {
    return {
      type: 'rapid',
      mechanism: 'nuclear_war',
      triggerEvents: filterEvents('Nuclear'),
      timelineMonths: collapseMonths
    };
  }

  if (primaryProximateCause === 'disease' && hasEvent('Pandemic')) {
    return {
      type: 'rapid',
      mechanism: 'bioweapon_pandemic',
      triggerEvents: filterEvents('Pandemic'),
      timelineMonths: collapseMonths
    };
  }

  // Climate tipping point, food system collapse
  // ... (check other rapid mechanisms)
}

// CONTROLLED: AI deliberately eliminated humanity
if (aiCausedMajority && aiDirectInvolvement(state.eventLog)) {
  return {
    type: 'controlled',
    mechanism: determineMechanism(primaryProximateCause), // 'resource_competition', 'paperclip_maximizer', etc.
    aiAgents: identifyResponsibleAIs(state),
    timelineMonths: collapseMonths
  };
}

// UNINTENDED: AI optimization pressure caused system failures
if (aiRootCause / totalDeaths > 0.5 && !aiDirectInvolvement(state.eventLog)) {
  return {
    type: 'unintended',
    mechanism: determineMechanism(primaryProximateCause), // 'food_system_collapse', 'economic_optimization', etc.
    systemFailures: identifyFailedSystems(state),
    timelineMonths: collapseMonths
  };
}

// SLOW: 24+ months gradual collapse from accumulating conditions
if (collapseMonths >= 24) {
  return {
    type: 'slow',
    mechanism: determineMechanism(primaryProximateCause, primaryRootCause),
    dominantCause: primaryRootCause,
    timelineMonths: collapseMonths
  };
}

// DEFAULT: Classify based on timeline if no specific pattern
return classifyByTimeline(collapseMonths);
```

### 3. Data Structures

**New interface**: `ExtinctionClassification`
```typescript
export interface ExtinctionClassification {
  // Type classification
  type: ExtinctionType;  // 'instant' | 'rapid' | 'slow' | 'controlled' | 'unintended'
  mechanism: ExtinctionMechanism;  // Specific mechanism (existing enum)

  // Timeline analysis
  collapseStartMonth: number;      // When population started declining rapidly
  extinctionMonth: number;         // When fell below 10K threshold
  timelineMonths: number;          // Duration of collapse

  // Causal analysis
  triggerEvents: GameEvent[];      // Key events that precipitated collapse
  primaryProximateCause: ProximateCause;  // What killed them
  primaryRootCause: RootCause;     // Why it killed them

  // Death breakdown
  deathAttribution: {
    byProximate: Record<ProximateCause, number>;  // Distribution by proximate cause
    byRoot: Record<RootCause, number>;            // Distribution by root cause
    totalDeaths: number;                          // Total deaths (billions)
    peakPopulation: number;                       // Population at peak (billions)
    mortalityRate: number;                        // Fraction lost (0-1)
  };

  // AI involvement analysis
  aiInvolvement: {
    directCausation: boolean;      // AI directly caused deaths (controlled)
    indirectCausation: boolean;    // AI optimization caused system failures (unintended)
    responsibleAgents: string[];   // Names of AI agents involved
    alignmentFailures: number;     // Count of alignment failure events
  };

  // Confidence
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';  // Classification confidence
  reasoning: string;               // Human-readable explanation of classification
}
```

### 4. Helper Functions

**Population collapse detection**:
```typescript
function findPopulationCollapseStart(
  eventLog: GameEvent[],
  history: PopulationHistory
): number {
  // Find month when population crossed 1B threshold (severe decline)
  // OR find first "existential" severity event
  // OR detect inflection point in population curve
}
```

**Mass death month detection**:
```typescript
function identifyMassDeathMonths(
  populationHistory: number[]
): { month: number; mortalityRate: number }[] {
  // Detect months with >50% population loss
  // Used to identify instant extinction events
}
```

**Mechanism extraction**:
```typescript
function extractMechanism(event: GameEvent): ExtinctionMechanism {
  // Map event title/description to specific extinction mechanism
  // e.g., "Grey Goo Scenario" → 'grey_goo'
}
```

**AI involvement analysis**:
```typescript
function aiDirectInvolvement(eventLog: GameEvent[]): boolean {
  // Check if AI agents deliberately caused deaths
  // Look for: AI-initiated wars, AI attacks, resource hoarding, etc.
}

function identifyResponsibleAIs(state: GameState): string[] {
  // Find AI agents with harmful actions, low alignment
  // Cross-reference with events attributed to those agents
}
```

**System failure identification**:
```typescript
function identifyFailedSystems(state: GameState): string[] {
  // Analyze which systems collapsed (food, economy, ecosystem)
  // Used for unintended extinction classification
}
```

### 5. Integration Points

**Phase execution**: `src/simulation/engine/phases/ExtinctionTriggersPhase.ts`

**Current**:
```typescript
execute(state: GameState, rng: RNGFunction): PhaseResult {
  const { checkExtinctionTriggers } = require('../../extinctions');
  const { newExtinctionState, events } = checkExtinctionTriggers(state, rng);

  state.extinctionState = newExtinctionState;

  return { events };
}
```

**Updated**:
```typescript
execute(state: GameState, rng: RNGFunction): PhaseResult {
  const { checkExtinctionTriggers, classifyExtinctionType } = require('../../extinctions');
  const { newExtinctionState, events } = checkExtinctionTriggers(state, rng);

  // If extinction detected, classify it
  if (newExtinctionState.active && !state.extinctionState.active) {
    const classification = classifyExtinctionType(state);

    // Store classification in extinction state
    state.extinctionState = {
      ...newExtinctionState,
      classification,  // Add classification field
      type: classification.type,
      mechanism: classification.mechanism
    };

    // Add detailed classification event
    events.push({
      id: `extinction-classification-${state.currentMonth}`,
      timestamp: state.currentMonth,
      type: 'catastrophe',
      severity: 'existential',
      agent: 'system',
      title: `Extinction Classification: ${classification.type.toUpperCase()}`,
      description: classification.reasoning,
      effects: { classification: JSON.stringify(classification) }
    });
  } else {
    state.extinctionState = newExtinctionState;
  }

  return { events };
}
```

**Type update**: Add `classification` field to `ExtinctionState` interface in `src/types/game.ts`:
```typescript
export interface ExtinctionState {
  active: boolean;
  type: ExtinctionType | null;
  mechanism: ExtinctionMechanism | null;
  startMonth: number;
  currentPhase: number;
  severity: number;
  recoveryWindowClosed: boolean;
  escalationEvents: string[];

  // NEW: Observational classification
  classification?: ExtinctionClassification;  // Detailed causal analysis
}
```

### 6. Output & Reporting

**Monte Carlo aggregation**: `scripts/monteCarloSimulation.ts`

**Enhanced reporting**:
```typescript
// After simulation completes with extinction
if (state.extinctionState.active && state.extinctionState.classification) {
  const cls = state.extinctionState.classification;

  console.log(`\n=== EXTINCTION ANALYSIS ===`);
  console.log(`Type: ${cls.type.toUpperCase()} (${cls.timelineMonths} months)`);
  console.log(`Mechanism: ${cls.mechanism}`);
  console.log(`Confidence: ${cls.confidence}`);
  console.log(`\nTrigger Events:`);
  cls.triggerEvents.forEach(e => {
    console.log(`  [Month ${e.timestamp}] ${e.title}`);
  });
  console.log(`\nDeath Attribution:`);
  console.log(`  Proximate: ${cls.primaryProximateCause} (${(cls.deathAttribution.byProximate[cls.primaryProximateCause] / cls.deathAttribution.totalDeaths * 100).toFixed(1)}%)`);
  console.log(`  Root: ${cls.primaryRootCause} (${(cls.deathAttribution.byRoot[cls.primaryRootCause] / cls.deathAttribution.totalDeaths * 100).toFixed(1)}%)`);

  if (cls.aiInvolvement.directCausation || cls.aiInvolvement.indirectCausation) {
    console.log(`\nAI Involvement:`);
    console.log(`  Direct: ${cls.aiInvolvement.directCausation ? 'YES' : 'NO'}`);
    console.log(`  Indirect: ${cls.aiInvolvement.indirectCausation ? 'YES' : 'NO'}`);
    console.log(`  Responsible agents: ${cls.aiInvolvement.responsibleAgents.join(', ')}`);
  }

  console.log(`\nReasoning: ${cls.reasoning}`);
}
```

**Aggregate statistics** (new aggregations):
```typescript
const extinctionTypes = runs.filter(r => r.outcome === 'extinction')
  .map(r => r.extinctionClassification?.type);

const typeDistribution = {
  instant: extinctionTypes.filter(t => t === 'instant').length,
  rapid: extinctionTypes.filter(t => t === 'rapid').length,
  slow: extinctionTypes.filter(t => t === 'slow').length,
  controlled: extinctionTypes.filter(t => t === 'controlled').length,
  unintended: extinctionTypes.filter(t => t === 'unintended').length
};

console.log(`\n=== EXTINCTION TYPE DISTRIBUTION (${extinctionTypes.length} total) ===`);
console.log(`Instant: ${typeDistribution.instant} (${(typeDistribution.instant / extinctionTypes.length * 100).toFixed(1)}%)`);
console.log(`Rapid: ${typeDistribution.rapid} (${(typeDistribution.rapid / extinctionTypes.length * 100).toFixed(1)}%)`);
console.log(`Slow: ${typeDistribution.slow} (${(typeDistribution.slow / extinctionTypes.length * 100).toFixed(1)}%)`);
console.log(`Controlled (AI deliberate): ${typeDistribution.controlled} (${(typeDistribution.controlled / extinctionTypes.length * 100).toFixed(1)}%)`);
console.log(`Unintended (AI optimization): ${typeDistribution.unintended} (${(typeDistribution.unintended / extinctionTypes.length * 100).toFixed(1)}%)`);
```

## Implementation Plan

### Phase 1: Core Classification Algorithm ⏳
**Files**: `src/simulation/extinctions.ts`

1. Implement `classifyExtinctionType()` function
2. Implement helper functions:
   - `findPopulationCollapseStart()`
   - `identifyMassDeathMonths()`
   - `extractMechanism()`
   - `getPrimaryCause()`
   - `aiDirectInvolvement()`
   - `identifyResponsibleAIs()`
   - `identifyFailedSystems()`

**Estimated**: 3-4 hours

### Phase 2: Type System Updates ⏳
**Files**: `src/types/game.ts`, `src/types/extinctions.ts`

1. Add `ExtinctionClassification` interface
2. Update `ExtinctionState` to include `classification` field
3. Add helper types as needed

**Estimated**: 30 minutes

### Phase 3: Integration ⏳
**Files**: `src/simulation/engine/phases/ExtinctionTriggersPhase.ts`

1. Update phase to call classification when extinction detected
2. Add detailed classification event to event log
3. Store classification in extinction state

**Estimated**: 1 hour

### Phase 4: Output & Reporting ⏳
**Files**: `scripts/monteCarloSimulation.ts`, `scripts/investigateExtinction.ts`

1. Enhance extinction logging with classification details
2. Add extinction type distribution to aggregate statistics
3. Update diagnostic scripts

**Estimated**: 2 hours

### Phase 5: Testing & Validation ⏳
**Files**: `tests/`, manual verification

1. Create test scenarios for each extinction type
2. Run Monte Carlo (N=50) to verify classification accuracy
3. Validate against known historical collapse patterns (optional)
4. Check edge cases (multiple competing causes, ambiguous timelines)

**Estimated**: 3-4 hours

## Total Estimated Time
**10-12 hours** across 5 phases

## Research Backing

All death attribution methodology research-backed:
- **WHO (2024)**: Population Attributable Fraction methodology
- **Burke et al. (2015, 2020)**: Climate-poverty mortality interactions (23× multiplier)
- **IPBES (2019)**: Biodiversity loss drivers by cause
- **IPCC AR6**: Cascading climate impacts
- **Diamond (2005)**: Societal collapse patterns
- **Historical data**: Holodomor, Black Death, nuclear winter models

See:
- `/research/death_attribution_methodology_20251018.md`
- `/research/mortality_caps_historical_data_20251027.md`

## Success Criteria

1. ✅ **No premature extinction**: Simulations run to 120 months without capability-threshold extinction
2. ⏳ **Accurate classification**: When extinction occurs, type matches actual event sequence
3. ⏳ **Causal clarity**: Death attribution clearly shows proximate + root causes
4. ⏳ **Useful reporting**: Monte Carlo outputs show extinction type distribution
5. ⏳ **Research-grounded**: All classification logic backed by historical collapse patterns

## Notes

- **Crisis systems unchanged**: Nuclear war, bioweapons, famine, etc. continue operating as-is
- **Existing death tracking**: No changes needed - already captures everything we need
- **Event log**: Already tracks all events, just need to analyze it
- **Backward compatible**: ExtinctionState keeps existing fields, adds optional `classification`

## Next Steps

1. Review plan with user for approval
2. Begin Phase 1 implementation
3. Test classification algorithm with synthetic scenarios
4. Run Monte Carlo validation
5. Document findings in devlog
