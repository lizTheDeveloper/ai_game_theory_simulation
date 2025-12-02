# WEEK 2 Task Handoffs
**Date:** 2025-11-06
**Orchestrator:** orchestrator-1
**Status:** READY FOR AGENT SPAWN

## Overview

WEEK 2 Critical Path requires 3 major tasks across 7 days. Each task requires specialized agent expertise. This document provides complete handoff specifications for each agent.

## Audit Findings Summary

**Magic Number Analysis Complete:**
- **Total potential magic numbers:** 3,199 instances across simulation code
- **Top 50 most-repeated values identified:**
  - 100 (1,421 occurrences) - likely percentage thresholds
  - 2025 (1,173 occurrences) - date references (can ignore)
  - 50 (629 occurrences) - threshold values
  - 30 (599 occurrences) - threshold values
  - 0.05 (420 occurrences) - rate/probability constants
  - 0.15 (374 occurrences) - rate/probability constants
  - ... (see `/tmp/magic_number_analysis.txt` for complete list)

**Semantic Pattern Analysis:**
- Threshold values: 20+ files with `threshold.*=.*0\.[0-9]`
- Multiplier constants: 30+ files with `multiplier.*=.*[0-9]`
- Rate constants: 25+ files with `rate.*=.*0\.[0-9]`
- Baseline values: 15+ files with `baseline.*=.*[0-9]`

**Priority for Centralization:**
1. **HIGH:** Repeated probability/rate constants (0.05, 0.15, 0.25, 0.30)
2. **HIGH:** Common threshold values (30, 40, 50, 60, 70, 80)
3. **MEDIUM:** Multiplier constants (varies by context)
4. **LOW:** Dates (2024, 2025 - these are research citation years)

---

## Task 2.1: Central Configuration System (2 days / 16 hours)

**Agent Required:** `simulation-maintainer` (Roy)

**Priority:** CRITICAL (ARCH-HIGH-6)

**Complexity:** HIGH - Requires:
- Understanding 97+ phase files
- Research citation extraction (JSDoc)
- Type-safe configuration system
- Validation utilities (fail-loudly)
- Migration without breaking changes

### Context

**Problem:**
- Magic numbers scattered across 97+ files
- Parameters repeated 12+ times with inconsistent values
- No single source of truth for simulation parameters
- Research citations buried in comments, not systematically tracked

**Why This Matters:**
- Oct 2025 ecology NaN bug hidden by `?? 50` (magic number)
- Parameter updates require changing 12 places (error-prone)
- Research parameter drift (36% >5 years old)

**Success Criteria:**
- Central config file at `/src/simulation/config/centralConfig.ts`
- Top 50 most-repeated magic numbers migrated
- TypeScript types for all parameter categories
- Validation system (fail-loudly if invalid)
- Monte Carlo N=3 smoke test passes (no regressions)

### Deliverables

#### 1. Create `/src/simulation/config/centralConfig.ts`

**Structure:**
```typescript
/**
 * Central Simulation Configuration
 *
 * Single source of truth for all simulation parameters.
 * Every parameter MUST have JSDoc citation justifying its value.
 *
 * @see docs/DEVELOPMENT_WORKFLOW.md for research standards
 */

/** Threshold Constants */
export const THRESHOLDS = {
  /**
   * AI Alignment threshold for "aligned" classification
   * @research Anthropic (2024) - Constitutional AI alignment benchmarks
   * @value 0.7 - 70% confidence in value alignment
   */
  AI_ALIGNMENT: 0.7,

  /**
   * Unemployment threshold for social crisis
   * @research ILO (2024) - Historical unemployment crisis levels
   * @value 0.25 - 25% unemployment triggers instability
   */
  UNEMPLOYMENT_CRISIS: 0.25,

  // ... (continue for all identified thresholds)
} as const;

/** Rate Constants */
export const RATES = {
  /**
   * Monthly AMR (antimicrobial resistance) increase baseline
   * @research Lancet (2024) - AMR projection models
   * @value 0.001 - 0.1% per month = 1.2% per year
   */
  AMR_MONTHLY_INCREASE: 0.001,

  // ... (continue for all rates)
} as const;

/** Multiplier Constants */
export const MULTIPLIERS = {
  /**
   * Crisis response investment multiplier for existential threats
   * @research Historical analysis - WWII mobilization levels
   * @value 2.5 - 2.5× normal investment during existential crisis
   */
  EXISTENTIAL_THREAT_INVESTMENT: 2.5,

  // ... (continue for all multipliers)
} as const;

/** Baseline Values */
export const BASELINES = {
  /**
   * Global population baseline (2025)
   * @research UN World Population Prospects 2024
   * @value 8.0 - 8.0 billion people
   */
  POPULATION_2025: 8.0,

  // ... (continue for all baselines)
} as const;

/** Type exports for type safety */
export type ThresholdKey = keyof typeof THRESHOLDS;
export type RateKey = keyof typeof RATES;
export type MultiplierKey = keyof typeof MULTIPLIERS;
export type BaselineKey = keyof typeof BASELINES;
```

#### 2. Create Validation System

**File:** `/src/simulation/config/validateConfig.ts`

```typescript
import { assertFinite, assertProbability, assertInRange } from '@/simulation/utils/assertions';
import { THRESHOLDS, RATES, MULTIPLIERS, BASELINES } from './centralConfig';

/**
 * Validate all configuration parameters at startup
 * Fails loudly with detailed error messages if any parameter is invalid
 */
export function validateSimulationConfig(): void {
  console.log('🔍 Validating simulation configuration...');

  // Validate thresholds (must be [0, 1] probabilities)
  for (const [key, value] of Object.entries(THRESHOLDS)) {
    assertProbability(value, {
      location: 'validateSimulationConfig',
      valueName: `THRESHOLDS.${key}`,
      additionalInfo: { value }
    });
  }

  // Validate rates (must be finite, non-negative)
  for (const [key, value] of Object.entries(RATES)) {
    assertFinite(value, {
      location: 'validateSimulationConfig',
      valueName: `RATES.${key}`
    });
    if (value < 0) {
      throw new Error(`Rate ${key} must be non-negative, got ${value}`);
    }
  }

  // Validate multipliers (must be finite, typically >= 1.0)
  for (const [key, value] of Object.entries(MULTIPLIERS)) {
    assertFinite(value, {
      location: 'validateSimulationConfig',
      valueName: `MULTIPLIERS.${key}`
    });
  }

  // Validate baselines (must be finite, positive)
  for (const [key, value] of Object.entries(BASELINES)) {
    assertFinite(value, {
      location: 'validateSimulationConfig',
      valueName: `BASELINES.${key}`
    });
    if (value <= 0) {
      throw new Error(`Baseline ${key} must be positive, got ${value}`);
    }
  }

  console.log('✅ Configuration validation passed');
}
```

#### 3. Integrate into Simulation Engine

**File:** `/src/simulation/engine/game.ts` (modify)

```typescript
import { validateSimulationConfig } from '@/simulation/config/validateConfig';

export function initializeGame(/* ... */): GameState {
  // Validate configuration at startup (fail-loudly if invalid)
  validateSimulationConfig();

  // ... rest of initialization
}
```

#### 4. Migration of Top 50 Magic Numbers

**Process:**
1. Use Grep to find all instances of each magic number
2. For each instance, determine:
   - What does this number represent? (threshold, rate, multiplier, baseline)
   - What research justifies this value?
   - Is this value context-specific or universal?
3. If universal: Add to `centralConfig.ts` with JSDoc citation
4. Replace in original file: `const threshold = 0.7` → `import { THRESHOLDS } from '@/simulation/config/centralConfig'; const threshold = THRESHOLDS.AI_ALIGNMENT`
5. If context-specific: Keep local but add JSDoc citation

**Priority Order (fix these first):**
1. 0.05 (420 occurrences) - HIGH priority rate constant
2. 0.15 (374 occurrences) - HIGH priority rate constant
3. 0.25 (277 occurrences) - HIGH priority threshold
4. 0.30 (226 occurrences) - HIGH priority threshold
5. 50 (629 occurrences) - Medium priority threshold (context-dependent)
... (continue for remaining 45)

#### 5. Testing Protocol

**Type Checking:**
```bash
npx tsc --noEmit
# Must pass with zero errors
```

**Monte Carlo Smoke Test (N=3):**
```bash
npx tsx scripts/monteCarloSimulation.ts --runs 3 --seed 12345 > logs/mc_central_config_test_$(date +%Y%m%d_%H%M%S).log 2>&1 &
# Monitor for completion, verify no NaN errors
```

**Success Criteria:**
- Type checking passes
- Monte Carlo runs complete without errors
- Outcome distributions similar to baseline (no regressions)
- Configuration validation passes on startup

### Time Estimate

**Day 1 (8 hours):**
- Create `centralConfig.ts` structure (2h)
- Audit and migrate top 25 magic numbers (5h)
- Create validation system (1h)

**Day 2 (8 hours):**
- Migrate remaining 25 magic numbers (5h)
- Integration into engine (1h)
- Testing and validation (2h)

**Total: 16 hours**

### Dependencies

**Requires:**
- Existing codebase (simulation files)
- Assertion utilities (`src/simulation/utils/assertions.ts`)
- Research citation standards (docs/DEVELOPMENT_WORKFLOW.md)

**Blocks:**
- Task 2.2 (Defensive Fallback Audit) - Can proceed in parallel but benefits from central config
- Task 2.3 (Research Parameter Updates) - BLOCKED until central config complete

### Risk Factors

1. **Scope creep:** 3,199 total magic numbers - must limit to top 50
2. **Breaking changes:** Incorrect replacements could break simulation
3. **Research gaps:** Some magic numbers may lack citations (mark as TODO)

### Handoff Notes for simulation-maintainer (Roy)

**Your expertise needed:**
- Defensive coding patterns (fail-loudly validation)
- Assertion utilities usage
- NaN handling (avoid silent fallbacks)
- Pictographic event language (emoji conventions in logs)
- Research simulation rigor (every parameter must be justified)

**Critical to preserve:**
- Deterministic RNG (never use Math.random())
- Type safety (strict TypeScript)
- JSDoc citation standards
- Monte Carlo reproducibility

**When in doubt:**
- Mark parameter as `// TODO: Research citation needed - [CONTEXT]`
- Prefer conservative values
- Add assertion to catch invalid values
- Document assumptions in JSDoc

---

## Task 2.2: Defensive Fallback Audit - Phase 1 (3 days / 24 hours)

**Agent Required:** `simulation-maintainer` (Roy)

**Priority:** CRITICAL (ARCH-CRITICAL-2)

**Complexity:** VERY HIGH - Requires:
- Identifying all 299 defensive fallback instances
- Understanding root causes (why was fallback added?)
- Replacing with proper assertions
- Testing each fix without regressions

### Context

**Problem:**
- 299 instances of silent fallback patterns:
  - `?? 0`, `?? []`, `?? 50`
  - `|| []`, `|| {}`
  - `isNaN(x) ? default : x`
- These hide bugs instead of exposing them
- Oct 2025 ecology NaN bug hidden for months by `?? 50`

**Why This Matters:**
- This is a **research simulation**, not a production app
- Invalid values indicate bugs that MUST be fixed, not hidden
- Silent fallbacks mask root causes
- Type safety extends to runtime (fail-loudly philosophy)

**Success Criteria:**
- Top 50 most dangerous fallbacks fixed (Phase 1)
- Remaining 249 documented with priority ranking
- Audit report explaining each fallback category
- Monte Carlo N=10 validation passes (no regressions)

### Deliverables

#### 1. Comprehensive Audit Report

**File:** `/reviews/defensive_fallback_audit_20251106.md`

**Structure:**
```markdown
# Defensive Fallback Audit Report
**Date:** 2025-11-06
**Auditor:** simulation-maintainer (Roy)
**Scope:** Phase 1 - Top 50 most dangerous fallbacks

## Summary

**Total Fallbacks Identified:** 299
**Fixed in Phase 1:** 50
**Remaining for Future Phases:** 249

## Fallback Pattern Categories

### Category 1: NaN Fallbacks (`isNaN(x) ? default : x`)
**Count:** 87 instances
**Priority:** CRITICAL
**Examples:**
- `src/simulation/ecology.ts:145` - `const pH = isNaN(state.oceanHealth.pH) ? 8.1 : state.oceanHealth.pH;`
- `src/simulation/mortality.ts:67` - `const rate = isNaN(calculatedRate) ? 0.01 : calculatedRate;`

**Root Causes:**
- Division by zero not prevented upstream
- Circular dependencies causing undefined propagation
- Missing initialization in state

**Phase 1 Fixes:** 15 / 87 (most critical paths: mortality, climate, AI)

### Category 2: Nullish Coalescing (`?? default`)
**Count:** 143 instances
**Priority:** HIGH
**Examples:**
- `src/simulation/food.ts:89` - `const security = state.foodSecurity ?? 50;`
- `src/simulation/ai/alignment.ts:123` - `const score = agent.alignment ?? 0.5;`

**Root Causes:**
- Optional properties used without proper initialization
- State migrations not handling missing fields
- Lazy initialization patterns

**Phase 1 Fixes:** 20 / 143 (critical calculation paths)

### Category 3: Logical OR Fallbacks (`|| default`)
**Count:** 52 instances
**Priority:** MEDIUM
**Examples:**
- `src/simulation/population.ts:234` - `const regions = state.regions || [];`
- `src/simulation/tech.ts:456` - `const deployed = state.deployedTech || {};`

**Root Causes:**
- Legacy code from pre-TypeScript era
- Defensive programming from external data sources
- Empty array/object handling

**Phase 1 Fixes:** 10 / 52 (array iterations in hot paths)

### Category 4: Conditional Fallbacks (various patterns)
**Count:** 17 instances
**Priority:** LOW-MEDIUM
**Examples:**
- `src/simulation/utils.ts:78` - `return value !== undefined ? value : default;`

**Phase 1 Fixes:** 5 / 17

## Priority Ranking for Phase 2-5

**CRITICAL (25 remaining):**
- Mortality calculation paths (10)
- Climate impact cascades (8)
- AI capability calculations (7)

**HIGH (124 remaining):**
- Food security calculations (35)
- Economic impacts (42)
- Population dynamics (27)
- Tech deployment (20)

**MEDIUM (75 remaining):**
- Diagnostic metrics (40)
- Logging/telemetry (25)
- UI data preparation (10)

**LOW (25 remaining):**
- Compatibility layers (15)
- Development utilities (10)

## Phase 1 Fixes Applied

[Document each of the 50 fixes with before/after]

## Recommendations for Future Phases

1. **Phase 2 (WEEK 3):** Fix remaining 25 CRITICAL fallbacks
2. **Phase 3 (WEEK 4-5):** Fix 60 HIGH priority fallbacks in food/economy
3. **Phase 4 (Month 2):** Fix 64 HIGH priority fallbacks in population/tech
4. **Phase 5 (Month 3):** Fix 100 MEDIUM/LOW fallbacks (nice-to-have)
```

#### 2. Grep Audit Commands

**Find all defensive fallback patterns:**

```bash
# NaN fallbacks
grep -r --include="*.ts" -n "isNaN.*\?.*:" src/simulation/ > /tmp/nan_fallbacks.txt

# Nullish coalescing
grep -r --include="*.ts" -n "??.*[0-9\[\{]" src/simulation/ > /tmp/nullish_fallbacks.txt

# Logical OR fallbacks
grep -r --include="*.ts" -n "||.*\[\{\]" src/simulation/ > /tmp/or_fallbacks.txt

# Count by file
for pattern in "isNaN.*\?.*:" "??.*[0-9\[\{]" "||.*\[\{\]"; do
  echo "=== Pattern: $pattern ==="
  grep -r --include="*.ts" -l "$pattern" src/simulation/ | wc -l
done
```

#### 3. Fix Patterns

**Before (NaN fallback):**
```typescript
const ecologicalScore = isNaN(state.ecology.score) ? 50 : state.ecology.score;
```

**After (assertion):**
```typescript
import { assertFinite } from '@/simulation/utils/assertions';
const ecologicalScore = assertFinite(state.ecology.score, {
  location: 'EcologyPhase',
  valueName: 'ecology.score',
  month: state.currentMonth
});
```

**Before (nullish coalescing):**
```typescript
const foodSecurity = state.food.security ?? 0.5;
```

**After (assertion):**
```typescript
import { assertStateProperty } from '@/simulation/utils/assertions';
const foodSecurity = assertStateProperty(state.food, 'security', {
  location: 'FoodSecurityPhase',
  month: state.currentMonth
});
```

**Before (logical OR):**
```typescript
const regions = state.regions || [];
```

**After (assertion):**
```typescript
import { assertNonEmpty } from '@/simulation/utils/assertions';
const regions = assertNonEmpty(state.regions, {
  location: 'RegionalPhase',
  valueName: 'regions',
  month: state.currentMonth
});
```

#### 4. Testing Protocol

**After each batch of 10 fixes:**
```bash
# Type check
npx tsc --noEmit

# Quick smoke test (1 run)
npx tsx scripts/monteCarloSimulation.ts --runs 1 --seed 12345

# If smoke test passes, continue
# If smoke test fails, investigate before proceeding
```

**After all 50 fixes complete:**
```bash
# Full Monte Carlo validation (N=10)
npx tsx scripts/monteCarloSimulation.ts --runs 10 --seed 12345 > logs/mc_fallback_audit_validation_$(date +%Y%m%d_%H%M%S).log 2>&1 &

# Success criteria:
# - No NaN errors in logs
# - Mortality 43-58% (no regressions)
# - Deterministic (same seed = same results)
```

### Time Estimate

**Day 1 (8 hours):**
- Grep audit and categorization (3h)
- Fix first 15 NaN fallbacks (4h)
- Testing and validation (1h)

**Day 2 (8 hours):**
- Fix 20 nullish coalescing fallbacks (5h)
- Fix 10 logical OR fallbacks (2h)
- Testing and validation (1h)

**Day 3 (8 hours):**
- Fix remaining 5 conditional fallbacks (2h)
- Create comprehensive audit report (4h)
- Monte Carlo N=10 validation (2h)

**Total: 24 hours**

### Dependencies

**Requires:**
- Assertion utilities (`src/simulation/utils/assertions.ts`)
- Monte Carlo validation script
- Type checking infrastructure

**Blocks:**
- None (can run in parallel with Task 2.1)

### Handoff Notes for simulation-maintainer (Roy)

**Your expertise critical for:**
- Understanding root causes (why was fallback needed?)
- Choosing right assertion type (assertFinite vs assertStateProperty)
- Preserving determinism (don't introduce new RNG calls)
- Testing incrementally (batch size: 10 fixes at a time)

**Watch out for:**
- Initialization order dependencies (state may not be initialized yet)
- Optional features (some fallbacks are intentional for compatibility)
- Performance hot paths (assertions have cost, but correctness > performance)

---

## Parallel Research Track

**Agent Required:** `super-alignment-researcher` (Cynthia)

**Priority:** HIGH (RESEARCH-HIGH)

**Timeline:** 4-6 hours (can run completely in parallel with Tasks 2.1-2.2)

### Research Request 1: UBI Updates (2024-2025)

**Target File:** `/research/ubi_updates_20251106.md`

**Research Needed:**
1. **OpenResearch $1,000/month study (2023-2024)**
   - Publication: OpenResearch.com/basic-income
   - Focus: Labor force participation effects
   - Extract: Employment rate changes, entrepreneurship rates, GDP multiplier

2. **Kenya GiveDirectly long-term data (2024)**
   - Publication: GiveDirectly.org/research
   - Focus: Long-term consumption patterns, asset accumulation
   - Extract: Optimal transfer amounts, economic multipliers

3. **Finland Basic Income Extension (2024-2025)**
   - Publication: Kela.fi/basic-income
   - Focus: Continuation studies post-2020 pilot
   - Extract: Updated employment effects, wellbeing metrics

**Parameter Extraction Template:**
```markdown
## UBI Optimal Income Levels

**Research Finding:**
- OpenResearch (2024): $1,000/month optimal for US context
- Kenya (2024): $50/month optimal for low-income context
- Finland (2024): €800/month optimal for Nordic context

**Extracted Parameters:**
- `UBI_OPTIMAL_AMOUNT_USD`: 1000 (monthly, 2024 USD)
- `UBI_OPTIMAL_AMOUNT_REGIONAL_MULTIPLIER`: 0.05 (for low-income), 0.80 (for Nordic)
- `UBI_LABOR_PARTICIPATION_EFFECT`: -0.02 (2% reduction in formal employment)
- `UBI_GDP_MULTIPLIER`: 1.13 (13% increase from consumption boost)

**Contradictory Evidence:**
- None found in 2024-2025 literature
- Earlier concerns about labor disincentives not supported by recent data
```

### Research Request 2: AI Energy/Water Consumption

**Target File:** `/research/ai_energy_water_consumption_20251106.md`

**Research Needed:**
1. **Frontier Model Training Energy (2024)**
   - Sources: Nature (2024), Science (2024), Google AI reports
   - Focus: GPT-4, Claude 3, Gemini Ultra training costs
   - Extract: kWh per PetaFLOP-day, total training energy

2. **Inference Energy (2024-2025)**
   - Sources: Anthropic research, OpenAI efficiency reports
   - Focus: Per-token costs for latest models
   - Extract: kWh per 1M tokens, efficiency improvements

3. **Datacenter Water Consumption (2024)**
   - Sources: Microsoft sustainability reports, Google datacenter efficiency
   - Focus: Water-cooled vs air-cooled efficiency
   - Extract: Liters per kWh, PUE (Power Usage Effectiveness)

**Parameter Extraction Template:**
```markdown
## AI Training Energy Consumption

**Research Finding:**
- Patterson et al. (Nature 2024): GPT-4 training ~10^25 FLOP
- Anthropic (2024): Claude 3 Opus 40% more efficient than GPT-4
- Google (2024): Gemini Ultra PUE 1.10 (datacenter efficiency)

**Extracted Parameters:**
- `AI_TRAINING_ENERGY_PER_PETAFLOP`: 0.5 kWh (2024 hardware)
- `AI_INFERENCE_ENERGY_PER_1M_TOKENS`: 0.002 kWh (latest efficiency)
- `DATACENTER_WATER_PER_KWH`: 0.5 liters (water cooling, 2024)
- `DATACENTER_PUE_2024`: 1.10 (industry best practice)

**Contradictory Evidence:**
- Meta reports higher PUE (1.18) but older datacenters
- Some estimates 2× higher energy - may include full infrastructure overhead
```

### Validation with research-skeptic (Sylvia)

**After both research files complete:**
1. Submit to Sylvia for review
2. Address contradictory evidence
3. Conservative parameter estimates when uncertain
4. Handoff to simulation-maintainer for Task 2.3

### Time Estimate

- UBI research: 4-6 hours
- AI energy/water research: 3-5 hours
- **Total: 7-11 hours (runs in parallel with implementation)**

---

## Orchestration Timeline

### Days 1-2 (Parallel)
- **Implementation Track:** simulation-maintainer on Task 2.1 (Central Config)
- **Research Track:** super-alignment-researcher on UBI + AI energy/water

### Days 3-5
- **Implementation Track:** simulation-maintainer on Task 2.2 (Fallback Audit)
- **Research Track:** research-skeptic validation of research findings

### Days 6-7
- **Implementation Track:** simulation-maintainer on Task 2.3 (Research Parameter Updates)
- **Depends on:** Research validation complete

### Day 8 (Quality Gate)
- **Review Track:** architecture-skeptic review of all WEEK 2 work
- **MUST ADDRESS:** CRITICAL/HIGH issues before documentation

### Day 9 (Documentation)
- **Wiki Track:** wiki-documentation-updater
- **Archive Track:** architect (roadmap cleanup)

---

## Success Metrics

**WEEK 2 Complete When:**
- ✅ Central config system operational (97+→1 config files)
- ✅ 50 defensive fallbacks fixed (299→249 remaining)
- ✅ 2 research files complete (UBI, AI energy/water)
- ✅ Research validation passed (Sylvia review)
- ✅ Architecture review passed (no CRITICAL issues)
- ✅ Monte Carlo N=10 validation (mortality 43-58%, no NaN)
- ✅ Wiki updated with new documentation
- ✅ Roadmap archived to `/plans/completed/week2_critical_path_complete_20251106.md`

**Expected Improvements:**
- Architecture: 299→249 fallbacks (17% reduction), 97+→1 config files
- Research: 36%→<30% parameters >5yr old (UBI + AI updated)
- Health: 7.5/10→8/10 architecture grade

---

## Agent Spawn Commands

### For simulation-maintainer (Roy)

**Task 2.1 (Day 1-2):**
```
Please coordinate WEEK 2 Task 2.1: Central Configuration System.

See complete specification in: /plans/week2_task_handoffs_20251106.md

Key deliverables:
1. Create /src/simulation/config/centralConfig.ts with JSDoc citations
2. Migrate top 50 most-repeated magic numbers
3. Validation system (fail-loudly)
4. Testing: Type check + Monte Carlo N=3

Timeline: 2 days (16 hours)
```

**Task 2.2 (Day 3-5):**
```
Please coordinate WEEK 2 Task 2.2: Defensive Fallback Audit - Phase 1.

See complete specification in: /plans/week2_task_handoffs_20251106.md

Key deliverables:
1. Grep audit for all 299 fallback patterns
2. Fix top 50 most dangerous (mortality, climate, AI)
3. Audit report categorizing remaining 249
4. Testing: Monte Carlo N=10 validation

Timeline: 3 days (24 hours)
```

**Task 2.3 (Day 6-7):**
```
Please coordinate WEEK 2 Task 2.3: Research Parameter Updates.

Prerequisites:
- Research files complete: /research/ubi_updates_20251106.md, /research/ai_energy_water_consumption_20251106.md
- research-skeptic validation passed

Key deliverables:
1. Update UBI parameters with JSDoc citations
2. Update AI infrastructure parameters with JSDoc citations
3. Testing: Monte Carlo N=10 (mortality 43-58%, no regressions)

Timeline: 2 days (16 hours)
```

### For super-alignment-researcher (Cynthia)

**Research Track (Parallel with Days 1-5):**
```
Please conduct WEEK 2 research: UBI Updates + AI Energy/Water Consumption.

See complete specification in: /plans/week2_task_handoffs_20251106.md

Key deliverables:
1. /research/ubi_updates_20251106.md (4-6h) - 2024-2025 UBI pilot data
2. /research/ai_energy_water_consumption_20251106.md (3-5h) - Frontier model infrastructure

Submit both to research-skeptic (Sylvia) for validation before handoff to simulation-maintainer.

Timeline: 7-11 hours (runs in parallel with implementation)
```

---

**End of Handoff Documentation**
