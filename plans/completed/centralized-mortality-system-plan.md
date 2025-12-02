# Centralized Mortality Provider System

**Status**: Planning
**Date**: October 27, 2025
**Motivation**: Death tracking is currently scattered across 30+ files with inconsistent accounting, leading to bugs like 8 trillion person peak populations and double-counted deaths.

## Current Problems

1. **Scattered Death Application**: Deaths applied in ~15 different places without unified tracking
2. **Inconsistent Units**: Some code uses billions, some millions, conversions break
3. **No Demographic Tracking**: Can't see which populations are hit hardest
4. **No Event Logging**: Deaths happen silently without clear attribution
5. **Peak Population Corruption**: `peakPopulation` becoming 8 trillion instead of 8 billion
6. **Double Counting**: Fixed Bug #19, but architecture enables more bugs

## Solution: Mortality Provider

**Core Idea**: Make death an imperative action that MUST go through a central provider. No direct `pop.population -= deaths` anywhere.

### API Design

```typescript
/**
 * Centralized mortality tracking provider
 * ALL deaths must go through this system
 */
export class MortalityProvider {
  /**
   * Apply deaths to a population segment
   *
   * @param population - Target population (global or regional)
   * @param deaths - Number of deaths (in same units as population)
   * @param cause - Death attribution (proximate + root causes)
   * @param metadata - Additional tracking info (region, demographics, etc.)
   * @returns Actual deaths applied (may be capped at 20% monthly max)
   */
  applyDeaths(
    population: HumanPopulationSystem | RegionalPopulation,
    deaths: number,
    cause: DeathCause,
    metadata?: DeathMetadata
  ): DeathResult;

  /**
   * Apply deaths by mortality rate (percentage of population)
   *
   * @param population - Target population
   * @param mortalityRate - Death rate as fraction (0.01 = 1% die)
   * @param cause - Death attribution
   * @param metadata - Additional tracking
   * @returns Actual deaths applied
   */
  applyMortalityRate(
    population: HumanPopulationSystem | RegionalPopulation,
    mortalityRate: number,
    cause: DeathCause,
    metadata?: DeathMetadata
  ): DeathResult;

  /**
   * Get complete death summary for a simulation run
   */
  getDeathSummary(): DeathSummary;

  /**
   * Reset monthly tracking (call at start of each month)
   */
  resetMonthlyTracking(): void;
}
```

### Type Definitions

```typescript
/**
 * Death cause attribution (multi-dimensional)
 */
export interface DeathCause {
  // PROXIMATE CAUSE: What killed them (medical/physical)
  proximate: ProximateCause;

  // ROOT CAUSE: Why it happened (systemic driver)
  root: RootCause | CompoundRootCause;

  // CONFIDENCE: How certain is this attribution
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';

  // Optional: Specific event that caused deaths
  event?: string;
}

export type ProximateCause =
  | 'war'
  | 'famine'
  | 'disasters'  // Climate disasters (heat, floods, storms)
  | 'disease'    // Pandemics, epidemics
  | 'ecosystem'  // Ecosystem collapse (fisheries, pollinators)
  | 'pollution'  // Toxic pollution, PFAS, microplastics
  | 'ai'         // AI-caused deaths (rogue systems, accidents)
  | 'cascade'    // Multi-crisis cascade deaths
  | 'other';     // Miscellaneous

export type RootCause =
  // Environmental drivers
  | 'climate'      // Climate change
  | 'resource'     // Resource depletion (water, food, phosphorus)
  | 'pollution'    // Pollution accumulation
  | 'ecosystem'    // Ecosystem degradation

  // Social drivers
  | 'inequality'   // Economic inequality
  | 'demographic'  // Demographic collapse (aging, birth rate)
  | 'social'       // Social cohesion breakdown

  // Technology drivers
  | 'alignment'    // AI misalignment
  | 'disruption'   // Economic/labor disruption

  // External shocks
  | 'conflict'     // Wars, geopolitical conflict
  | 'pandemic';    // Natural pandemics

/**
 * Additional metadata for death tracking
 */
export interface DeathMetadata {
  // Geographic scope
  region?: string;           // Which region (if regional death)
  exposedFraction?: number;  // What fraction of population exposed (0-1)
  scope?: 'GLOBAL' | 'SEMI-GLOBAL' | 'REGIONAL';

  // Demographic targeting (which segments hit hardest)
  demographicImpact?: {
    segment: string;         // 'Elite', 'Professional', 'Working', 'Precariat', 'Informal'
    mortality: number;       // Mortality rate for this segment
  }[];

  // Temporal info
  month: number;             // Current simulation month
  isAcute?: boolean;         // True = acute crisis, false = gradual/demographic

  // Optional description for logging
  description?: string;
}

/**
 * Result of applying deaths
 */
export interface DeathResult {
  // Deaths actually applied (may be less than requested due to 20% cap)
  appliedDeaths: number;

  // Deaths requested
  requestedDeaths: number;

  // Was the 20% monthly cap reached?
  capped: boolean;

  // Remaining population after deaths
  remainingPopulation: number;

  // Event log entry (for user-visible logging)
  logEntry: string;
}

/**
 * Complete death summary for end-of-simulation reporting
 */
export interface DeathSummary {
  // Total deaths
  totalDeaths: number;        // Total crisis deaths (billions)
  populationDecline: number;  // Peak - current (billions)
  mortalityRate: number;      // Fraction of peak population lost

  // By proximate cause
  byProximate: Record<ProximateCause, number>;

  // By root cause
  byRoot: Record<RootCause, number>;

  // By confidence level
  byConfidence: {
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };

  // By region (if regional tracking enabled)
  byRegion?: Record<string, number>;

  // By time period
  byMonth: Array<{
    month: number;
    deaths: number;
    causes: Array<{ proximate: ProximateCause; root: RootCause; count: number }>;
  }>;

  // Demographic impact
  demographicImpact: {
    segment: string;
    totalDeaths: number;
    mortalityRate: number;  // Average mortality rate for this segment
  }[];
}
```

## Implementation Plan

### Phase 1: Create Mortality Provider (2 hours)
- [ ] Create `src/simulation/providers/MortalityProvider.ts`
- [ ] Implement core API (`applyDeaths`, `applyMortalityRate`)
- [ ] Add 20% monthly death cap enforcement
- [ ] Implement event logging (console output for each death event)
- [ ] Add demographic tracking
- [ ] Create summary generation

### Phase 2: Refactor Population Dynamics (3 hours)
- [ ] Replace all direct `pop.population -= deaths` with `mortalityProvider.applyDeaths()`
- [ ] Remove `applyDeathsWithCap` function (superseded by provider)
- [ ] Remove `applyImmediateDeaths` function (superseded by provider)
- [ ] Update `deathsByCategory` and `deathsByRootCause` to be READ-ONLY (computed from provider)
- [ ] Fix `peakPopulation` corruption bug (track separately from deaths)

### Phase 3: Refactor Crisis Systems (4 hours)
- [ ] Update famine system to use provider
- [ ] Update disaster systems to use provider
- [ ] Update war/conflict systems to use provider
- [ ] Update disease/pandemic systems to use provider
- [ ] Update ecosystem collapse to use provider
- [ ] Update pollution deaths to use provider

### Phase 4: Regional Death Tracking (2 hours)
- [ ] Enable regional death tracking in provider
- [ ] Update regional population systems
- [ ] Add regional mortality summaries

### Phase 5: Testing & Validation (2 hours)
- [ ] Run Monte Carlo (N=10) to verify no regressions
- [ ] Verify death summaries match expected values
- [ ] Check that demographic targeting works
- [ ] Validate peakPopulation stays sane (~8B)

**Total Estimated Time**: 13 hours

## Benefits

1. **Unified Tracking**: All deaths go through one system
2. **Better Debugging**: Every death logged with full context
3. **Demographic Visibility**: See which populations suffer most
4. **Consistent Units**: Provider enforces unit consistency
5. **No More Double Counting**: One source of truth
6. **Event Attribution**: Clear cause → effect chain
7. **Status Effect Support**: Can add monthly mortality status effects easily
8. **Peak Population Fix**: Separate tracking prevents corruption

## Migration Strategy

**Backwards Compatibility**: During Phase 2, keep old death tracking active but mark as deprecated. Compare provider results with old results to catch regressions.

**Gradual Rollout**: Migrate one system at a time (population dynamics first, then crisis systems).

## Research Backing

- **20% Monthly Death Cap**: Based on Black Death (25% over years, not months)
- **Demographic Impact**: Historical famines show 2-3× higher mortality in poor vs rich
- **Attribution Confidence**: WHO methodology for cause-of-death attribution

## Next Steps

1. Get user approval on API design
2. Implement Phase 1 (create provider)
3. Start Phase 2 migration (population dynamics)

---

**Questions for User**:
1. Should we track deaths at individual country level, or just by UN regions?
2. Do we want monthly death "status effects" (e.g., "Famine: -2% population/month")?
3. Should the provider emit GameEvents automatically, or leave that to callers?
