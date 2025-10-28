# Unified Outcome Classification System

**Status:** Designed, Ready for Implementation
**Priority:** HIGH (fixes confusion in Monte Carlo reporting)
**Estimated Time:** 3-4 hours
**Created:** October 28, 2025

## Problem Statement

Currently, outcome classification is **fragmented across 5 different systems** with inconsistent reporting:

1. **7-tier population outcome** (extinction → terminal → bottleneck → dark_age → collapse → crisis_era → status_quo)
2. **Stratified outcome** (humane vs pyrrhic variants)
3. **Multi-Paradigm DUI** (4 simultaneous paradigm perspectives)
4. **Legacy 4-category** (utopia/dystopia/extinction/stalemate - DEPRECATED)
5. **Mortality bands** (low/moderate/high/extreme/bottleneck)

This causes:
- **Misleading labels**: 7 runs in N=100 sweep labeled "extinction" with 4.8B population (40% mortality)
- **Fragmented reporting**: Multiple contradictory sections in Monte Carlo output
- **Analysis confusion**: Users must mentally combine 5 different classifications

## Solution: UnifiedOutcomeClassification Interface

### Type Definition (COMPLETE)

**Location:** `src/types/outcomes.ts` (lines 160-205)

```typescript
interface UnifiedOutcomeClassification {
  // PRIMARY: 7-tier population-based outcome
  primaryOutcome: OutcomeType;

  // MORTALITY CONTEXT
  mortalityRate: number;           // [0-1] Fraction of population lost
  mortalityBand: MortalityBand;    // low/moderate/high/extreme/bottleneck
  deathsAbsolute: number;          // Billions of deaths

  // STRATIFIED CONTEXT (humane vs pyrrhic)
  stratifiedOutcome: StratifiedOutcomeType;

  // MULTI-PARADIGM DUI (4 simultaneous perspectives)
  paradigmScores: {
    western: number;      // 0-100
    development: number;  // 0-100
    ecological: number;   // 0-100
    indigenous: number;   // 0-100
  };
  paradigmOutcomes: {
    western: 'utopia' | 'hybrid' | 'dystopia';
    development: 'utopia' | 'hybrid' | 'dystopia';
    ecological: 'utopia' | 'hybrid' | 'dystopia';
    indigenous: 'utopia' | 'hybrid' | 'dystopia';
  };
  paradigmLabel: string;           // "Development Utopia, Ecological Dystopia"
  paradigmContested: boolean;      // Simultaneous utopias and dystopias

  // POPULATION STATE
  initialPopulation: number;       // Billions at start
  finalPopulation: number;         // Billions at end
  finalPopulationPeople: number;   // Exact count

  // EXTINCTION CLASSIFICATION (if extinction occurred)
  extinctionClassification?: ExtinctionClassification;

  // CONFIDENCE & REASONING
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  reasoning: string;               // Human-readable explanation

  // OUTCOME DESCRIPTION
  shortLabel: string;              // "PYRRHIC DYSTOPIA (COLLAPSE)"
  fullDescription: string;         // Full narrative
}
```

### Classification Function (COMPLETE)

**Location:** `src/data/aggregators/outcomeClassifier.ts` (lines 152-289)

Function: `createUnifiedOutcomeClassification(params)`

**Features:**
- Calculates all mortality metrics
- Determines stratified outcome based on mortality + primary outcome
- Integrates multi-paradigm DUI classification
- Generates human-readable labels and descriptions
- Assigns confidence levels based on ambiguity

## Implementation Plan

### Phase 1: Integration into Simulation Engine (1.5 hours)

**File:** `src/simulation/engine.ts`

1. **Add to GameState** (if not present)
   ```typescript
   // Around line 900-1050 where outcomes are determined
   unifiedOutcome?: UnifiedOutcomeClassification;
   ```

2. **Generate unified classification** (around line 1027)
   ```typescript
   import { createUnifiedOutcomeClassification } from '@/data/aggregators/outcomeClassifier';

   // After determining finalOutcome and stratifiedOutcome
   const paradigmScores = {
     western: state.multiParadigmDUI?.paradigmScores.western.value ?? 50,
     development: state.multiParadigmDUI?.paradigmScores.development.value ?? 50,
     ecological: state.multiParadigmDUI?.paradigmScores.ecological.value ?? 50,
     indigenous: state.multiParadigmDUI?.diagnosticLenses?.indigenous?.value ?? 50
   };

   state.unifiedOutcome = createUnifiedOutcomeClassification({
     primaryOutcome: finalOutcome,
     initialPopulation,
     finalPopulation,
     paradigmScores,
     extinctionClassification: state.extinctionState.classification
   });
   ```

3. **Replace fragmented logging** (lines 1036-1072)
   - Remove separate logs for stratified outcome, mortality band, paradigm scores
   - Replace with single unified outcome log:
   ```typescript
   console.log(`\n📊 UNIFIED OUTCOME CLASSIFICATION:`);
   console.log(`   ${state.unifiedOutcome.shortLabel}`);
   console.log(`   Population: ${state.unifiedOutcome.initialPopulation.toFixed(2)}B → ${state.unifiedOutcome.finalPopulation.toFixed(2)}B`);
   console.log(`   Mortality: ${(state.unifiedOutcome.mortalityRate * 100).toFixed(1)}% (${state.unifiedOutcome.deathsAbsolute.toFixed(1)}B deaths)`);
   console.log(`   Mortality Band: ${state.unifiedOutcome.mortalityBand.toUpperCase()}`);
   console.log(`   Confidence: ${state.unifiedOutcome.confidence}`);
   console.log(`\n   Multi-Paradigm Classification:`);
   console.log(`      ${state.unifiedOutcome.paradigmLabel}`);
   Object.entries(state.unifiedOutcome.paradigmOutcomes).forEach(([paradigm, outcome]) => {
     const score = state.unifiedOutcome!.paradigmScores[paradigm as keyof typeof state.unifiedOutcome.paradigmScores];
     const emoji = outcome === 'utopia' ? '✓' : outcome === 'dystopia' ? '✗' : '~';
     console.log(`      ${paradigm}: ${score.toFixed(1)}/100 [${outcome.toUpperCase()}] ${emoji}`);
   });
   if (state.unifiedOutcome.extinctionClassification) {
     console.log(`\n   Extinction Details:`);
     console.log(`      Type: ${state.unifiedOutcome.extinctionClassification.type.toUpperCase()}`);
     console.log(`      Mechanism: ${state.unifiedOutcome.extinctionClassification.mechanism}`);
     console.log(`      Timeline: ${state.unifiedOutcome.extinctionClassification.timelineMonths} months`);
   }
   console.log(`\n   ${state.unifiedOutcome.fullDescription}\n`);
   ```

### Phase 2: Update Monte Carlo Reporting (1.5 hours)

**File:** `scripts/monteCarloSimulation.ts`

1. **Update RunResult interface** (around line 108)
   ```typescript
   interface RunResult {
     // ... existing fields
     unifiedOutcome: UnifiedOutcomeClassification;

     // DEPRECATED (keep for backward compatibility):
     outcome: 'utopia' | 'dystopia' | 'extinction' | 'stalemate' | 'none';
     rawOutcome?: OutcomeType;
     stratifiedOutcome?: StratifiedOutcomeType;
     mortalityBand?: MortalityBand;
   }
   ```

2. **Capture unified outcome** (around line 1025, 1535)
   ```typescript
   unifiedOutcome: simulationResult.state.unifiedOutcome!,

   // Map to legacy format for backward compatibility
   outcome: mapUnifiedToLegacyOutcome(simulationResult.state.unifiedOutcome!),
   ```

3. **Replace fragmented outcome reporting** (lines 2790-2950)
   - Remove separate sections for:
     - 7-tier outcome distribution
     - Stratified outcome classification
     - Mortality band distribution
     - Legacy 4-category

   - Replace with single unified section:
   ```typescript
   log(`\n📊 UNIFIED OUTCOME DISTRIBUTION`);
   log('='.repeat(80));

   // Group by primary outcome
   const primaryOutcomeCounts: Record<string, number> = {};
   results.forEach(r => {
     const primary = r.unifiedOutcome.primaryOutcome;
     primaryOutcomeCounts[primary] = (primaryOutcomeCounts[primary] || 0) + 1;
   });

   log(`\n  PRIMARY OUTCOMES (7-Tier Population-Based):`);
   Object.entries(primaryOutcomeCounts)
     .sort((a, b) => b[1] - a[1])
     .forEach(([outcome, count]) => {
       const pct = (count / results.length * 100).toFixed(1);
       const emoji = getOutcomeEmoji(outcome);
       log(`    ${emoji} ${outcome.toUpperCase()}: ${count} / ${results.length} (${pct}%)`);
     });

   // Mortality bands
   const mortalityBandCounts: Record<string, number> = {};
   results.forEach(r => {
     const band = r.unifiedOutcome.mortalityBand;
     mortalityBandCounts[band] = (mortalityBandCounts[band] || 0) + 1;
   });

   log(`\n  MORTALITY BANDS:`);
   Object.entries(mortalityBandCounts)
     .sort((a, b) => b[1] - a[1])
     .forEach(([band, count]) => {
       const pct = (count / results.length * 100).toFixed(1);
       log(`    ${band.toUpperCase()}: ${count} runs (${pct}%)`);
     });

   // Stratified outcomes
   const stratifiedCounts: Record<string, number> = {};
   results.forEach(r => {
     const strat = r.unifiedOutcome.stratifiedOutcome;
     stratifiedCounts[strat] = (stratifiedCounts[strat] || 0) + 1;
   });

   log(`\n  STRATIFIED OUTCOMES (Humane vs Pyrrhic):`);
   Object.entries(stratifiedCounts)
     .sort((a, b) => b[1] - a[1])
     .forEach(([strat, count]) => {
       const pct = (count / results.length * 100).toFixed(1);
       log(`    ${strat.toUpperCase()}: ${count} / ${results.length} (${pct}%)`);
     });

   // Multi-paradigm contested outcomes
   const contestedCount = results.filter(r => r.unifiedOutcome.paradigmContested).length;
   const contestedPct = (contestedCount / results.length * 100).toFixed(1);
   log(`\n  MULTI-PARADIGM CONFLICTS:`);
   log(`    Contested Outcomes: ${contestedCount} / ${results.length} (${contestedPct}%)`);
   log(`    (Contested = simultaneous utopias and dystopias across paradigms)`);

   // Average mortality
   const avgMortality = results.reduce((sum, r) => sum + r.unifiedOutcome.mortalityRate, 0) / results.length;
   const avgDeaths = results.reduce((sum, r) => sum + r.unifiedOutcome.deathsAbsolute, 0) / results.length;
   log(`\n  AVERAGE MORTALITY:`);
   log(`    Rate: ${(avgMortality * 100).toFixed(1)}%`);
   log(`    Deaths: ${avgDeaths.toFixed(2)}B people`);
   ```

4. **Update per-run reporting** (around line 2877)
   ```typescript
   // Replace fragmented per-run logs with unified format
   const emoji = getOutcomeEmojiFromUnified(r.unifiedOutcome);
   log(`     ${emoji} Run ${r.seed}: ${r.unifiedOutcome.shortLabel}`);
   log(`        ${r.unifiedOutcome.fullDescription}`);
   ```

### Phase 3: Add Helper Functions

**Location:** `scripts/monteCarloSimulation.ts`

```typescript
// Map unified outcome to legacy format for backward compatibility
function mapUnifiedToLegacyOutcome(unified: UnifiedOutcomeClassification): 'utopia' | 'dystopia' | 'extinction' | 'stalemate' | 'none' {
  if (unified.primaryOutcome === 'utopia') return 'utopia';
  if (unified.primaryOutcome === 'extinction') return 'extinction';
  if (unified.primaryOutcome === 'dystopia' ||
      unified.primaryOutcome === 'collapse' ||
      unified.primaryOutcome === 'dark_age' ||
      unified.primaryOutcome === 'crisis_era' ||
      unified.primaryOutcome === 'terminal' ||
      unified.primaryOutcome === 'bottleneck') {
    return 'dystopia';
  }
  if (unified.primaryOutcome === 'status_quo') return 'none';
  return 'none';  // inconclusive maps to none
}

function getOutcomeEmojiFromUnified(unified: UnifiedOutcomeClassification): string {
  if (unified.primaryOutcome === 'extinction') return '💀';
  if (unified.primaryOutcome === 'terminal') return '⚰️';
  if (unified.primaryOutcome === 'bottleneck') return '🧬';
  if (unified.primaryOutcome === 'dark_age') return '🏚️';
  if (unified.primaryOutcome === 'collapse') return '💥';
  if (unified.primaryOutcome === 'crisis_era') return '⚠️';
  if (unified.primaryOutcome === 'status_quo') return '📊';
  if (unified.primaryOutcome === 'utopia') return '✅';
  if (unified.primaryOutcome === 'dystopia') return '🏛️';
  return '❓';
}
```

### Phase 4: Testing & Validation (30 min)

1. **Run N=10 test** to verify classification works
   ```bash
   npx tsx scripts/monteCarloSimulation.ts --runs=10 --max-months=120 > logs/unified_test.log 2>&1
   ```

2. **Check output** for:
   - ✅ Single unified section (not 4 separate sections)
   - ✅ 7 "extinction" runs now labeled as COLLAPSE
   - ✅ Mortality bands match primary outcomes
   - ✅ Paradigm conflicts highlighted

3. **Verify backward compatibility**:
   - Legacy `outcome` field still populated
   - Existing analysis scripts still work

## Expected Results

### Before (Current):
```
📊 OUTCOME DISTRIBUTION
  DYSTOPIA: 93 / 100 (93.0%)
  EXTINCTION: 7 / 100 (7.0%)  ← WRONG! Population is 4.8B

📉 EXTINCTION TYPE BREAKDOWN:
  unknown: 7 (100.0%)  ← No classification because not really extinct

STRATIFIED OUTCOME:
  pyrrhic-dystopia: 91 / 100 (91.0%)
  extinction: 7 / 100 (7.0%)  ← Contradictory!
```

### After (With Unified Classification):
```
📊 UNIFIED OUTCOME DISTRIBUTION

  PRIMARY OUTCOMES (7-Tier):
    💥 COLLAPSE: 7 / 100 (7.0%)  ← CORRECT!
    🏛️ DYSTOPIA: 93 / 100 (93.0%)

  MORTALITY BANDS:
    MODERATE (20-50%): 7 runs (7.0%)  ← Matches collapse
    HIGH (50-75%): 90 runs (90.0%)

  STRATIFIED OUTCOMES:
    PYRRHIC-DYSTOPIA: 100 / 100 (100.0%)  ← Consistent!

  MULTI-PARADIGM CONFLICTS:
    Contested: 7 runs (7.0%)
    (e.g., "Development Utopia, Ecological Dystopia")
```

## Files Modified

- ✅ `src/types/outcomes.ts` - UnifiedOutcomeClassification interface (COMPLETE)
- ✅ `src/data/aggregators/outcomeClassifier.ts` - createUnifiedOutcomeClassification() (COMPLETE)
- ⏳ `src/types/game.ts` - Add unifiedOutcome to GameState
- ⏳ `src/simulation/engine.ts` - Generate and store unified classification
- ⏳ `scripts/monteCarloSimulation.ts` - Update reporting to use unified format

## Research Backing

- **7-tier system**: Based on historical mortality precedents (Black Death 30-60%, Spanish Flu 3-5%, WWII 3%)
- **Stratified outcomes**: Wilkinson & Pickett (2009) - extreme disruption >20% mortality causes decades of trauma
- **Multi-paradigm**: Preserves value conflicts (Singapore vs Norway patterns)
- **Observational extinction**: Only reports when population < 10K, not predictions

## Dependencies

- Observational extinction detection (COMPLETE - Oct 28, 2025)
- Multi-Paradigm DUI system (COMPLETE - Oct 20, 2025)
- Stratified outcome classification (COMPLETE - Oct 17, 2025)
- 7-tier population outcome system (COMPLETE - Oct 13, 2025)

## Success Criteria

1. ✅ **No false extinctions**: Runs with 4.8B population labeled as COLLAPSE, not extinction
2. ✅ **Single unified section**: All classification dimensions visible in one place
3. ✅ **Consistent labels**: No contradictions between primary/stratified/mortality classifications
4. ✅ **Contested outcomes highlighted**: Multi-paradigm conflicts clearly visible
5. ✅ **Backward compatible**: Legacy outcome field still populated for existing tools

## Time Estimates

- Phase 1 (Engine integration): 1.5 hours
- Phase 2 (Monte Carlo reporting): 1.5 hours
- Phase 3 (Helper functions): 30 minutes
- Phase 4 (Testing): 30 minutes
- **Total: 4 hours**
