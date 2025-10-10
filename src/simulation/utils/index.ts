/**
 * Simulation utilities barrel export
 *
 * Centralized exports for common utility functions.
 * Phase 1 refactoring - extracted from duplicated code across 8+ files.
 */

// Math utilities
export {
  clamp,
  lerp,
  inverseLerp,
  mapRange,
  weightedAverage
} from './math';

// AI calculation utilities
export {
  getAverageAICapability,
  getAverageAlignment,
  getTotalAICapability,
  getActiveAIs,
  getAlignedAIs,
  getMisalignedAIs,
  calculateAverageCapability,
  calculateAverageAlignment
} from './ai';
