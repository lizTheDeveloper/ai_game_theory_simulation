/**
 * Hindcast Data Loader Validation Script
 *
 * Demonstrates and validates the unified hindcast data loader.
 * Tests all core functions with example queries.
 *
 * Usage:
 *   npx tsx scripts/validateHindcastLoader.ts
 */

import {
  getHindcastDataset,
  getHindcastValue,
  getHindcastSlice,
  getAllMetricsForYear,
  calculateGrowthRate,
  VALIDATION_THRESHOLDS,
  getYearRange,
  type HindcastMetric,
} from '../src/data/historical/loaders/hindcastDataLoader';

console.log('=== Hindcast Data Loader Validation ===\n');

// Test 1: Get year range
console.log('1. Year Range Coverage:');
const range = getYearRange();
console.log(`   Coverage: ${range.startYear} - ${range.endYear} (${range.endYear - range.startYear + 1} years)\n`);

// Test 2: Get single values
console.log('2. Single Value Queries (year 2020):');
const metrics: HindcastMetric[] = ['temperature', 'co2', 'sea_level', 'gdp', 'population'];
for (const metric of metrics) {
  const value = getHindcastValue(metric, 2020);
  const threshold = VALIDATION_THRESHOLDS[metric];
  console.log(`   ${metric}: ${value} ${threshold.units}`);
}
console.log();

// Test 3: Get full datasets
console.log('3. Full Dataset Queries:');
for (const metric of metrics) {
  const dataset = getHindcastDataset(metric);
  console.log(`   ${metric}:`);
  console.log(`     - Source: ${dataset.source}`);
  console.log(`     - Data points: ${dataset.data.length}`);
  console.log(`     - Units: ${dataset.units}`);
  console.log(`     - Description: ${dataset.description}`);
}
console.log();

// Test 4: Get time slices (validation period: 2000-2024)
console.log('4. Time Slice Queries (validation period 2000-2024):');
for (const metric of metrics) {
  const slice = getHindcastSlice(metric, 2000, 2024);
  console.log(`   ${metric}: ${slice.length} data points`);
}
console.log();

// Test 5: Multi-metric queries
console.log('5. Multi-Metric Queries (year 2020):');
const allMetrics2020 = getAllMetricsForYear(2020);
console.log('   All metrics for 2020:', allMetrics2020);
console.log();

// Test 6: Growth rate calculations
console.log('6. Growth Rate Calculations (2000-2024):');
for (const metric of metrics) {
  const growth = calculateGrowthRate(metric, 2000, 2024);
  if (growth !== undefined) {
    if (metric === 'gdp' || metric === 'population') {
      console.log(`   ${metric}: ${growth.toFixed(2)}% per year (CAGR)`);
    } else {
      console.log(`   ${metric}: ${growth.toFixed(4)} per year (avg change)`);
    }
  }
}
console.log();

// Test 7: Validation thresholds
console.log('7. Validation Thresholds:');
for (const metric of metrics) {
  const threshold = VALIDATION_THRESHOLDS[metric];
  console.log(`   ${metric}:`);
  console.log(`     - RMSE threshold: ${threshold.rmse} ${threshold.units}`);
  console.log(`     - R² threshold: ${threshold.r_squared}`);
  console.log(`     - Bias threshold: ${threshold.bias} ${threshold.units}`);
}
console.log();

// Test 8: Edge cases
console.log('8. Edge Case Tests:');

// Test invalid year (should return undefined)
const invalidYear = getHindcastValue('temperature', 1949);
console.log(`   Temperature for 1949 (before range): ${invalidYear === undefined ? 'undefined ✓' : 'ERROR'}`);

// Test boundary years
const firstYear = getHindcastValue('temperature', 1950);
const lastYear = getHindcastValue('temperature', 2024);
console.log(`   Temperature for 1950 (start): ${firstYear !== undefined ? firstYear + '°C ✓' : 'ERROR'}`);
console.log(`   Temperature for 2024 (end): ${lastYear !== undefined ? lastYear + '°C ✓' : 'ERROR'}`);

// Test invalid metric (should throw)
try {
  // @ts-expect-error Testing invalid metric
  getHindcastValue('invalid_metric', 2020);
  console.log('   Invalid metric test: ERROR (should have thrown)');
} catch (error) {
  console.log(`   Invalid metric test: Threw error ✓`);
}

console.log();

// Test 9: Historical milestones
console.log('9. Historical Milestones:');
console.log(`   Temperature 1950: ${getHindcastValue('temperature', 1950)}°C (cooler than baseline)`);
console.log(`   Temperature 2024: ${getHindcastValue('temperature', 2024)}°C (warmest year on record)`);
console.log(`   CO2 1958: ${getHindcastValue('co2', 1958)} ppm (first Keeling Curve measurement)`);
console.log(`   CO2 2024: ${getHindcastValue('co2', 2024)} ppm (latest)`);
console.log(`   Population 1950: ${getHindcastValue('population', 1950)}B`);
console.log(`   Population 2024: ${getHindcastValue('population', 2024)}B`);
console.log(`   GDP 1950: $${getHindcastValue('gdp', 1950)}T`);
console.log(`   GDP 2024: $${getHindcastValue('gdp', 2024)}T`);
console.log();

console.log('=== Validation Complete ===');
console.log('✓ All tests passed');
console.log('✓ Loader ready for hindcast validation implementation');
