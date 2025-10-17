/**
 * AI-Assisted Skills & Intelligence Augmentation System
 *
 * **Unified API for the refactored AI-assisted skills system**
 *
 * This module provides a clean, organized interface to the AI-assisted skills system,
 * replacing the monolithic bionicSkills.ts (1,883 lines) with focused, maintainable modules.
 *
 * **Module Structure:**
 * - types.ts: Type definitions and interfaces
 * - skillAmplification.ts: Core AI skill enhancement logic
 * - laborDistribution.ts: Labor-capital distribution and productivity-wage decoupling
 * - policyEffects.ts: Policy interventions (retraining, teaching support, job guarantees)
 * - inequalityTracking.ts: Crisis detection (competence crisis, wage inequality)
 * - aggregateMetrics.ts: Population-level aggregate calculations
 *
 * **Technology Readiness Level: 8-9** (Fully deployed at scale, peer-reviewed evidence)
 *
 * @see Full research foundation: reviews/bionic-skills-hopeful-research-foundation-20251016.md
 * @see Research summary: reviews/bionic-skills-research-summary-20251016.md
 * @see Implementation phases: plans/bionic-skills-research-grounding.md
 */

// === Type Exports ===
export type {
  AIAccessBarriers,
  AutomationPhase,
  LaborCapitalDistribution,
  AIAssistedSkillsMetrics,
  SkillProfile,
} from './types';

// === Skill Amplification ===
export {
  initializeSegmentSkills,
  calculateAIAssistedSkill,
  calculateAIAccess,
  updateAIAssistedSkills,
  calculateProductivityMultiplierFromAIAssistedSkills,
} from './skillAmplification';

// === Labor-Capital Distribution ===
export {
  initializeLaborCapitalDistribution,
  updateLaborCapitalDistribution,
} from './laborDistribution';

// === Policy Effects ===
export {
  calculateRetrainingEffect,
  applyTeachingSupport,
  calculateUnemploymentFloor,
  applyPolicyInterventions,
} from './policyEffects';

// === Inequality Tracking ===
export {
  checkCompetenceCrisis,
  checkWageInequality,
} from './inequalityTracking';

// === Aggregate Metrics ===
export {
  initializeAIAssistedSkillsMetrics,
  calculateAIAssistedSkillsAggregateMetrics,
} from './aggregateMetrics';
