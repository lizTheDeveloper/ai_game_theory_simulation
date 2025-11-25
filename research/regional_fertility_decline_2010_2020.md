# Regional Fertility Decline Analysis (2010-2020)

**Purpose:** Identify regional demographic transition speeds to fix 2010-2020 hindcast overshoot.

## Problem

Hindcast validation shows 6-10% population overshoot in 2010-2020 period.
- 2010: +6.86% deviation (simulated 7.39B vs actual 6.92B)
- 2020: +10.30% deviation (simulated 8.64B vs actual 7.84B)

## Hypothesis

Current implementation uses **global average** CBR scaling, but regions had very different fertility decline rates:
- East Asia/Europe: Steep decline (aging populations, urbanization)
- Sub-Saharan Africa: Slow decline (early in demographic transition)
- South Asia: Moderate decline (mixed development levels)

Using a single global multiplier fails to capture regional heterogeneity.

## Regional Fertility Data (UN WPP 2024)

### Total Fertility Rate (TFR) - Children per Woman

| Region | 2010 TFR | 2020 TFR | Change | % Decline |
|--------|----------|----------|--------|-----------|
| **Sub-Saharan Africa** | 5.45 | 4.60 | -0.85 | -15.6% |
| **East Asia** | 1.54 | 1.27 | -0.27 | -17.5% |
| **South Asia** | 2.82 | 2.28 | -0.54 | -19.1% |
| **Europe** | 1.57 | 1.53 | -0.04 | -2.5% |
| **North America** | 2.04 | 1.64 | -0.40 | -19.6% |
| **Latin America** | 2.23 | 1.91 | -0.32 | -14.3% |
| **MENA** | 3.17 | 2.88 | -0.29 | -9.1% |
| **GLOBAL** | 2.60 | 2.31 | -0.29 | -11.2% |

**Source:** UN World Population Prospects 2024 (28th edition, July 2024)
- Data extracted from: https://population.un.org/wpp/Download/Standard/Fertility/
- Medium variant projections for 2010-2020

## Key Insights

### 1. Heterogeneous Decline Rates

Fertility decline varied by 7x across regions (2.5% in Europe vs 19.6% in North America).

**Fast decline (>15% drop):**
- East Asia: -17.5% (1.54 → 1.27) - One-child policy effects, urbanization
- South Asia: -19.1% (2.82 → 2.28) - India's rapid development
- North America: -19.6% (2.04 → 1.64) - Great Recession effects, delayed childbearing
- Sub-Saharan Africa: -15.6% (5.45 → 4.60) - Education expansion, family planning access

**Slow decline (<10% drop):**
- Europe: -2.5% (1.57 → 1.53) - Already at low fertility floor
- MENA: -9.1% (3.17 → 2.88) - Cultural/religious resistance to decline
- Latin America: -14.3% (2.23 → 1.91) - Moderate pace

### 2. Global Average Masks Regional Variation

The global TFR decline of 11.2% is a **weighted average** that:
- Undercounts fast-declining regions (East/South Asia, North America)
- Overcounts slow-declining regions (Europe, MENA)

Using a single global multiplier will:
- **Overestimate births** in East/South Asia (apply 11% decline when actual was 18-19%)
- **Underestimate births** in Europe/MENA (apply 11% decline when actual was 2-9%)

Net effect: Since East/South Asia contain 50% of global population, overestimating their births dominates the global total → population overshoot.

### 3. Economic Development Correlation

Fertility decline correlates with economic development stage:
- **Stage 3.5+ (East Asia, Europe):** Already near replacement level, minimal further decline possible
- **Stage 2.0-3.0 (South Asia, Latin America):** Rapid decline as urbanization accelerates
- **Stage 1.0-2.0 (Sub-Saharan Africa):** Early decline from high baseline, large absolute drops

## Proposed Fix

### Option 1: Region-Specific Historical CBR Curves (PREFERRED)

Replace global `getHistoricalCrudeBirthRate(year)` with:
```typescript
function getRegionalHistoricalBirthRate(region: string, year: number): number {
  const REGIONAL_CBR = {
    'East Asia': {
      2010: 10.5, // Derived from TFR 1.54 * age structure
      2020: 8.8,  // Derived from TFR 1.27 * age structure
    },
    'South Asia': {
      2010: 21.5, // Derived from TFR 2.82
      2020: 17.2, // Derived from TFR 2.28
    },
    // ... etc for all regions
  };
  // Interpolate between known years
}
```

**Pros:**
- Captures true regional heterogeneity
- Research-backed (UN WPP 2024)
- Fixes overshoot by reducing births in high-population Asia

**Cons:**
- Requires CBR conversion from TFR (need age structure data)
- More complex implementation (7 curves vs 1)

### Option 2: Apply Regional TFR Decline Multipliers

Keep global CBR scaling, but add regional adjustment:
```typescript
const globalHistoricalScale = historicalCBR / baseline2025CBR; // 1.161 for 2010
const regionalDeclineRate = getRegionalFertilityDecline(region.name, year); // -17.5% for East Asia
const regionalScale = globalHistoricalScale * (1 + regionalDeclineRate);
region.adjustedBirthRate *= regionalScale;
```

**Pros:**
- Simpler implementation (7 decline rates vs 7 full curves)
- Still captures heterogeneity
- Less data dependency (TFR easier to find than CBR)

**Cons:**
- Less precise (compounds two approximations)
- Requires validation that multiplicative approach works

### Option 3: Dynamic Development-Based Scaling (MODEL-BASED)

Use existing `region.economicStage` to predict fertility decline:
```typescript
// Higher economic stage → faster fertility decline
const developmentAccelerationFactor = region.economicStage >= 3.0
  ? 1.2  // Fast decline in advanced economies
  : region.economicStage >= 2.0
  ? 1.0  // Medium decline in middle-income
  : 0.8; // Slow decline in developing

region.adjustedBirthRate *= globalHistoricalScale * developmentAccelerationFactor;
```

**Pros:**
- No hard-coded regional data (generalizes to future scenarios)
- Captures development-fertility link mechanistically

**Cons:**
- Less precise for hindcast validation (model vs data)
- Requires validation that economic stage predicts fertility decline accurately

## Recommendation

**Implement Option 1 (Region-Specific CBR Curves)** with fallback to Option 2 for missing data.

**Rationale:**
- Hindcast validation requires data-driven precision (not model-based approximation)
- UN WPP 2024 provides authoritative regional CBR data
- Fixing East/South Asia birth rates (50% of population) will eliminate most of the overshoot

## Implementation Plan

1. **Extract regional CBR data from UN WPP 2024** (5-year intervals: 1990, 1995, 2000, 2005, 2010, 2015, 2020)
2. **Create `getRegionalHistoricalBirthRate(region, year)` function** in BaselineMortalityPhase.ts
3. **Modify regionalPopulations.ts** to use region-specific curves instead of global curve
4. **Validate** with hindcast run (target: <5% deviation in 2010-2020)
5. **Document** with citations to UN WPP 2024

## Next Steps

Roy to implement Option 1 with proper defensive coding (no silent fallbacks, assertion utilities).
