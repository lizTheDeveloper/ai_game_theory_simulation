/**
 * Simulation Systems - Phase 2
 *
 * Centralized exports for system abstractions and implementations
 */

// Core interfaces
export type {
  SimulationSystem,
  AccumulationSystem,
  SpiralSystem,
  QualitySystem
} from './interfaces';

// System registry
export { SystemRegistry } from './SystemRegistry';

// Concrete implementations
export { EnvironmentalSystem } from './EnvironmentalSystem';
