/**
 * Historical Data Loaders
 *
 * Unified interfaces for accessing historical datasets (1950-2024).
 * Primary loader: hindcastDataLoader (unified access to all 5 metrics).
 *
 * @module data/historical/loaders
 */

export {
  // Core types
  type HindcastMetric,
  type HindcastDataPoint,
  type HindcastDataset,
  // Core functions
  getHindcastDataset,
  getHindcastValue,
  getHindcastSlice,
  getAllMetricsForYear,
  calculateGrowthRate,
  // Validation utilities
  VALIDATION_THRESHOLDS,
  isValidYear,
  getYearRange,
} from './hindcastDataLoader';
