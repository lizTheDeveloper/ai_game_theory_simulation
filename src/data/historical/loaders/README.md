# Hindcast Data Loaders

Unified interface for accessing historical datasets (1950-2024) used in hindcast validation.

## Quick Start

```typescript
import {
  getHindcastValue,
  getHindcastDataset,
  getHindcastSlice,
  getAllMetricsForYear,
  calculateGrowthRate,
  VALIDATION_THRESHOLDS,
} from '@/data/historical/loaders';

// Get single value
const temp2020 = getHindcastValue('temperature', 2020);
// => 1.01 (°C above 1951-1980 baseline)

// Get full dataset
const tempData = getHindcastDataset('temperature');
// => { metric: 'temperature', data: [...75 points...], units: '°C', ... }

// Get time slice for validation
const validationData = getHindcastSlice('temperature', 2000, 2024);
// => [...25 points from 2000-2024...]

// Multi-metric query
const metrics2020 = getAllMetricsForYear(2020);
// => { temperature: 1.01, co2: 414.21, sea_level: 99, gdp: 145.3, population: 7.888 }

// Calculate growth rates
const tempGrowth = calculateGrowthRate('temperature', 2000, 2024);
// => 0.0371 (°C per year)

const popGrowth = calculateGrowthRate('population', 2000, 2024);
// => 1.15 (% per year CAGR)
```

## Available Metrics

| Metric | Units | Source | Coverage |
|--------|-------|--------|----------|
| `temperature` | °C (anomaly vs 1951-1980) | NASA GISS GISTEMP v4 | 1950-2024 |
| `co2` | ppm | NOAA Mauna Loa (Keeling Curve) | 1950-2024 |
| `sea_level` | mm (above 1990.5 baseline) | CSIRO + NOAA satellite | 1950-2024 |
| `gdp` | trillion 2021 int$ (PPP) | Maddison Project + World Bank | 1950-2024 |
| `population` | billions | UN World Population Prospects | 1950-2024 |

## Core Functions

### `getHindcastValue(metric, year)`

Get single value for a specific year.

**Parameters:**
- `metric: HindcastMetric` - Metric identifier
- `year: number` - Calendar year (1950-2024)

**Returns:** `number | undefined` - Value, or undefined if year not in dataset

**Example:**
```typescript
const temp2020 = getHindcastValue('temperature', 2020);
if (temp2020 !== undefined) {
  console.log(`Temperature in 2020: ${temp2020}°C`);
}
```

### `getHindcastDataset(metric)`

Get full dataset for a metric with metadata.

**Parameters:**
- `metric: HindcastMetric` - Metric identifier

**Returns:** `HindcastDataset` - Complete time series with metadata

**Example:**
```typescript
const dataset = getHindcastDataset('temperature');
console.log(`Coverage: ${dataset.startYear}-${dataset.endYear}`);
console.log(`Source: ${dataset.source}`);
console.log(`Data points: ${dataset.data.length}`);
```

### `getHindcastSlice(metric, startYear, endYear)`

Get time series slice for calibration/validation.

**Parameters:**
- `metric: HindcastMetric` - Metric identifier
- `startYear: number` - First year (inclusive)
- `endYear: number` - Last year (inclusive)

**Returns:** `HindcastDataPoint[]` - Array of data points in range

**Throws:** Error if years are out of range [1950, 2024]

**Example:**
```typescript
// Calibration period
const calibrationData = getHindcastSlice('temperature', 1950, 1999);

// Validation period
const validationData = getHindcastSlice('temperature', 2000, 2024);
```

### `getAllMetricsForYear(year)`

Get all metrics for a specific year (for multi-metric validation).

**Parameters:**
- `year: number` - Calendar year (1950-2024)

**Returns:** `Record<HindcastMetric, number | undefined>` - All metric values

**Example:**
```typescript
const metrics2020 = getAllMetricsForYear(2020);
console.log(`Temperature: ${metrics2020.temperature}°C`);
console.log(`CO2: ${metrics2020.co2} ppm`);
console.log(`Population: ${metrics2020.population}B`);
```

### `calculateGrowthRate(metric, startYear, endYear)`

Calculate growth rate between two years.

**Parameters:**
- `metric: HindcastMetric` - Metric identifier
- `startYear: number` - Starting year
- `endYear: number` - Ending year

**Returns:** `number | undefined` - Growth rate
  - For `gdp` and `population`: CAGR (% per year)
  - For others: Average annual change

**Example:**
```typescript
// Population CAGR 2000-2024
const popGrowth = calculateGrowthRate('population', 2000, 2024);
console.log(`Population grew ${popGrowth.toFixed(2)}% per year`);

// Temperature change per year
const tempGrowth = calculateGrowthRate('temperature', 2000, 2024);
console.log(`Temperature increased ${tempGrowth.toFixed(3)}°C per year`);
```

## Validation Thresholds

Research-backed thresholds for model validation (2000-2024 period).

```typescript
import { VALIDATION_THRESHOLDS } from '@/data/historical/loaders';

// Check if model meets validation thresholds
const rmse = calculateRMSE(predictions, actuals);
const threshold = VALIDATION_THRESHOLDS.temperature;

if (rmse < threshold.rmse) {
  console.log(`✓ RMSE ${rmse}°C < ${threshold.rmse}°C threshold`);
}
```

**Thresholds by metric:**

| Metric | RMSE | R² | Bias | Units |
|--------|------|-----|------|-------|
| temperature | 0.15 | 0.90 | 0.05 | °C |
| co2 | 5 | 0.98 | 2 | ppm |
| sea_level | 10 | 0.95 | 5 | mm |
| gdp | 5 | 0.95 | 2 | % |
| population | 50 | 0.99 | 1 | million |

**Sources:**
- Climate metrics: IPCC AR6 WG1 Chapter 3 (model evaluation standards)
- Economic metrics: World Bank/IMF forecasting accuracy benchmarks

## TypeScript Types

### `HindcastMetric`

```typescript
type HindcastMetric = 'temperature' | 'co2' | 'sea_level' | 'gdp' | 'population';
```

### `HindcastDataPoint`

```typescript
interface HindcastDataPoint {
  year: number;              // Calendar year
  value: number;             // Metric value
  uncertainty?: number;      // Uncertainty (if available)
  source: string;            // Data source identifier
}
```

### `HindcastDataset`

```typescript
interface HindcastDataset {
  metric: HindcastMetric;    // Metric identifier
  startYear: number;         // First year of data coverage
  endYear: number;           // Last year of data coverage
  data: HindcastDataPoint[]; // Annual data points
  units: string;             // Units of measurement
  source: string;            // Primary data source
  description: string;       // Human-readable description
}
```

## Typical Usage Patterns

### Pattern 1: Calibration and Validation

```typescript
// Split data into calibration (1950-1999) and validation (2000-2024) periods
const calibrationData = getHindcastSlice('temperature', 1950, 1999);
const validationData = getHindcastSlice('temperature', 2000, 2024);

// Run simulation on calibration period
const predictions = runSimulation(calibrationData);

// Validate on held-out period
const rmse = calculateRMSE(predictions, validationData);
const threshold = VALIDATION_THRESHOLDS.temperature;

if (rmse < threshold.rmse) {
  console.log('✓ Model passes validation');
}
```

### Pattern 2: Multi-Metric Analysis

```typescript
// Analyze correlations between metrics
const years = [2000, 2005, 2010, 2015, 2020, 2024];
const data = years.map(year => getAllMetricsForYear(year));

// Calculate correlations
const tempCO2Correlation = calculateCorrelation(
  data.map(d => d.temperature!),
  data.map(d => d.co2!)
);
```

### Pattern 3: Growth Rate Analysis

```typescript
// Compare growth rates across different periods
const earlyGrowth = calculateGrowthRate('gdp', 1950, 1975);
const recentGrowth = calculateGrowthRate('gdp', 2000, 2024);

console.log(`GDP growth (1950-1975): ${earlyGrowth?.toFixed(2)}%/year`);
console.log(`GDP growth (2000-2024): ${recentGrowth?.toFixed(2)}%/year`);
```

### Pattern 4: Historical Milestone Detection

```typescript
// Find years where temperature crossed thresholds
const dataset = getHindcastDataset('temperature');
const milestone1C = dataset.data.find(d => d.value >= 1.0);
const milestone1_5C = dataset.data.find(d => d.value >= 1.5);

console.log(`First year above 1.0°C: ${milestone1C?.year}`);
console.log(`First year above 1.5°C: ${milestone1_5C?.year ?? 'Not yet reached'}`);
```

## Error Handling

### Invalid Year Range

```typescript
// Returns undefined (no throw)
const value = getHindcastValue('temperature', 1949);
// => undefined

// Throws error
const slice = getHindcastSlice('temperature', 1949, 2024);
// => Error: startYear 1949 out of range [1950, 2024]
```

### Invalid Metric

```typescript
// Throws error
const value = getHindcastValue('invalid_metric', 2020);
// => Error: Invalid hindcast metric: "invalid_metric"
```

### Invalid Year Range

```typescript
// Throws error
const slice = getHindcastSlice('temperature', 2024, 2000);
// => Error: startYear 2024 cannot be greater than endYear 2000
```

## Performance Characteristics

- **Year lookups:** O(n) linear search (75 data points per metric)
  - Fast enough for validation scripts (< 1ms per query)
  - For hot paths, cache results in a Map<number, number>
- **Dataset queries:** O(1) constant time (just wraps existing arrays)
- **Slice queries:** O(n) filter operation
- **Memory:** ~5KB per metric (75 data points × 3-4 fields × 8 bytes)

## Testing

Run the validation script to verify all functions:

```bash
npx tsx scripts/validateHindcastLoader.ts
```

Expected output:
- ✓ All year range queries return correct values
- ✓ All dataset queries return complete metadata
- ✓ Time slices return correct number of points
- ✓ Multi-metric queries return all values
- ✓ Growth rate calculations match expected ranges
- ✓ Edge cases (invalid years, invalid metrics) handle correctly

## Next Steps

This loader is Phase 2 of the hindcast validation implementation:

1. ✓ **Phase 1:** Historical datasets (temperature, CO2, sea level, GDP, population)
2. ✓ **Phase 2:** Unified data loader (this module)
3. **Phase 3:** Hindcast runner (initialize at 1950, run to 2024, compare predictions)
4. **Phase 4:** Validation metrics (RMSE, R², bias, trend analysis)
5. **Phase 5:** Automated validation reports (markdown reports with charts)

See `openspec/changes/hindcast-validation/` for complete implementation plan.
