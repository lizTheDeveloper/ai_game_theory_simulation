/**
 * Tech Tree Helper Functions
 *
 * Compatibility layer for migrating from old breakthroughTech system to new techTree system.
 * Provides simple API for querying tech deployment status.
 */

import { GameState } from '@/types/game';
import { getTechById } from './comprehensiveTechTree';
import { hasTech } from '../utils/simulationIndices';

/**
 * Check if a technology is deployed
 *
 * @param state - Game state
 * @param techId - Technology ID from comprehensiveTechTree.ts
 * @returns Deployment level (0-1), or 0 if not deployed
 */
export function isTechDeployed(state: GameState, techId: string): number {
  const techTreeState = state.techTreeState;

  // If techTreeState not initialized, return 0
  if (!techTreeState) return 0;

  // Check if tech is unlocked (O(n) fallback - no indices in this context)
  if (!hasTech(techId, undefined, techTreeState)) return 0;

  // Get global deployment level
  const globalDeployments = techTreeState.regionalDeployment['global'] || [];
  const deployment = globalDeployments.find((d: any) => d.techId === techId);

  return deployment ? deployment.deploymentLevel : 0;
}

/**
 * Check if a technology is unlocked (available but maybe not deployed)
 *
 * @param state - Game state
 * @param techId - Technology ID
 * @returns true if unlocked, false otherwise
 */
export function isTechUnlocked(state: GameState, techId: string): boolean {
  const techTreeState = state.techTreeState;
  if (!techTreeState) return false;

  return hasTech(techId, undefined, techTreeState);
}

/**
 * OLD SYSTEM MAPPING TO NEW SYSTEM
 *
 * Maps old breakthrough tech property names to new tech IDs.
 * Use this for gradual migration.
 */
const OLD_TO_NEW_TECH_MAPPING: Record<string, string> = {
  // Clean energy technologies
  'cleanEnergy': 'solar_wind_baseline',  // TIER 0 deployed 2025

  // Social technologies
  'mentalHealthAI': 'mental_health_ai',  // TIER 3
  'purposeFrameworks': 'purpose_frameworks',  // TIER 3
  'communityPlatforms': 'community_platforms',  // TIER 3

  // Medical technologies
  'diseaseElimination': 'disease_elimination',  // TIER 3
  'longevityTherapies': 'longevity_extension',  // TIER 3

  // Advanced infrastructure
  'fusionPower': 'fusion_power',  // TIER 3

  // Environmental
  'advancedRecycling': 'circular_manufacturing',  // TIER 1
  'ecosystemManagement': 'ecosystem_management_ai',  // TIER 3
  'carbonCapture': 'direct_air_capture',  // TIER 0 deployed 2025
  'sustainableAgriculture': 'vertical_farming',  // TIER 3

  // Already deployed (TIER 0)
  'advancedRLHF': 'rlhf_basic',
  'mechanisticInterpretability': 'mech_interp_basic',
  'deExtinctionRewilding': 'de_extinction',
  'advancedDirectAirCapture': 'direct_air_capture',
};

/**
 * Get tech deployment using old property name (for backward compatibility)
 *
 * @param state - Game state
 * @param oldPropertyName - Old breakthrough tech property name (e.g. 'cleanEnergy')
 * @returns Deployment level (0-1), or 0 if not found/deployed
 */
export function getTechDeploymentByOldName(state: GameState, oldPropertyName: string): number {
  const newTechId = OLD_TO_NEW_TECH_MAPPING[oldPropertyName];

  // If mapping exists, use it
  if (newTechId) {
    return isTechDeployed(state, newTechId);
  }

  // If no mapping, try the property name as a direct tech ID (backwards compatibility)
  // This allows callers to pass either OLD property names OR NEW tech IDs
  return isTechDeployed(state, oldPropertyName);
}

/**
 * Fallback to old system if new system not available
 *
 * This provides compatibility during migration period.
 * Tries new system first, falls back to old system.
 */
export function getTechDeploymentSafe(state: GameState, oldPropertyName: string): number {
  // Try new system first
  const newDeployment = getTechDeploymentByOldName(state, oldPropertyName);
  if (newDeployment > 0) return newDeployment;

  // Fallback to old system if available
  const oldTech = (state as any).breakthroughTech?.[oldPropertyName];
  if (oldTech) {
    // Old system uses different property names
    if ('deployed' in oldTech) return oldTech.deployed;
    if ('deploymentLevel' in oldTech) return oldTech.deploymentLevel;
    if ('active' in oldTech && oldTech.active) return 1.0;
  }

  return 0;
}

/**
 * Count unlocked technologies (for Scientific Spiral)
 *
 * @param state - Game state
 * @returns Number of unlocked technologies
 */
export function getUnlockedTechCount(state: GameState): number {
  const techTreeState = state.techTreeState;

  // Try new system first
  if (techTreeState?.unlockedTech) {
    return techTreeState.unlockedTech.length;
  }

  // Fallback to old system
  const oldTech = (state as any).breakthroughTech;
  if (oldTech) {
    return Object.values(oldTech).filter((t: any) => t?.unlocked).length;
  }

  return 0;
}

/**
 * Count deployed technologies (deployment level > threshold)
 *
 * @param state - Game state
 * @param threshold - Minimum deployment level (default 0.5)
 * @returns Number of technologies deployed above threshold
 */
export function getDeployedTechCount(state: GameState, threshold: number = 0.5): number {
  const techTreeState = state.techTreeState;

  // Try new system first
  if (techTreeState?.regionalDeployment?.global) {
    const globalDeployments = techTreeState.regionalDeployment.global;
    return globalDeployments.filter((d: any) => d.deploymentLevel > threshold).length;
  }

  // Fallback to old system
  const oldTech = (state as any).breakthroughTech;
  if (oldTech) {
    return Object.values(oldTech)
      .filter((t: any) => t?.deploymentLevel && t.deploymentLevel > threshold).length;
  }

  return 0;
}
