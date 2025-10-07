/**
 * Compute Infrastructure Module
 * Phase 1: Data Center Infrastructure
 * 
 * Manages data centers, compute allocation, and related utilities.
 */

import { ComputeInfrastructure, DataCenter, GameState } from '../types/game';

/**
 * Initialize compute infrastructure for January 2025
 * Based on real-world AI infrastructure landscape
 */
export function initializeComputeInfrastructure(): ComputeInfrastructure {
  return {
    dataCenters: [
      // OpenAI / Microsoft
      {
        id: 'openai_sf',
        name: 'OpenAI San Francisco',
        organizationId: 'openai', // Will be linked in Phase 2
        capacity: 150, // ~150 PetaFLOPs
        efficiency: 1.05,
        constructionMonth: -12, // Built 12 months before game start
        completionMonth: -12,
        operational: true,
        operationalCost: 2.25, // $2.25M/month equivalent
        restrictedAccess: true,
        allowedAIs: [], // Will be populated when AIs are linked to orgs
        region: 'US'
      },
      
      // Google DeepMind
      {
        id: 'google_iowa',
        name: 'Google Iowa Data Center',
        organizationId: 'google_deepmind', // Phase 2
        capacity: 200,
        efficiency: 1.1, // Google is very efficient
        constructionMonth: -24,
        completionMonth: -24,
        operational: true,
        operationalCost: 3.0,
        restrictedAccess: true,
        allowedAIs: [],
        region: 'US'
      },
      
      // Meta AI (open weights!)
      {
        id: 'meta_oregon',
        name: 'Meta Oregon',
        organizationId: 'meta', // Phase 2
        capacity: 180,
        efficiency: 1.0,
        constructionMonth: -18,
        completionMonth: -18,
        operational: true,
        operationalCost: 2.7,
        restrictedAccess: false, // Open weights = open access!
        allowedAIs: [],
        region: 'US'
      },
      
      // Academic consortium
      {
        id: 'stanford_cluster',
        name: 'Stanford AI Cluster',
        organizationId: 'academic_consortium', // Phase 2
        capacity: 30,
        efficiency: 0.9, // Academic resources are stretched
        constructionMonth: -36,
        completionMonth: -36,
        operational: true,
        operationalCost: 0.6,
        restrictedAccess: false, // Open for research
        allowedAIs: [],
        region: 'US'
      },
      
      // Government facility
      {
        id: 'nist_facility',
        name: 'NIST AI Safety Facility',
        organizationId: 'government_ai', // Phase 2
        capacity: 50,
        efficiency: 0.85, // Government is less efficient
        constructionMonth: -6,
        completionMonth: -6,
        operational: true,
        operationalCost: 0.75,
        restrictedAccess: true,
        allowedAIs: [], // Government decides who gets access
        region: 'US'
      },
      
      // Anthropic uses cloud (no dedicated DC yet)
      // They'll rely on unrestricted access to academic/open DCs
    ],
    
    algorithmsEfficiency: 1.0, // Baseline efficiency
    hardwareEfficiency: 1.0,    // Baseline hardware
    computeAllocations: new Map()
  };
}

/**
 * Calculate total available compute from operational data centers
 */
export function getTotalCompute(infra: ComputeInfrastructure): number {
  return infra.dataCenters
    .filter(dc => dc.operational && dc.completionMonth <= 0) // Only operational and completed DCs
    .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0);
}

/**
 * Calculate total capacity (including non-operational DCs)
 */
export function getTotalCapacity(infra: ComputeInfrastructure): number {
  return infra.dataCenters.reduce((sum, dc) => sum + dc.capacity, 0);
}

/**
 * Get data centers owned by a specific organization
 */
export function getOrganizationDataCenters(
  infra: ComputeInfrastructure,
  organizationId: string
): DataCenter[] {
  return infra.dataCenters.filter(dc => dc.organizationId === organizationId);
}

/**
 * Get total compute for a specific organization
 */
export function getOrganizationCompute(
  infra: ComputeInfrastructure,
  organizationId: string
): number {
  return infra.dataCenters
    .filter(dc => dc.organizationId === organizationId && dc.operational)
    .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0);
}

/**
 * Check if an AI has access to a specific data center
 */
export function hasDataCenterAccess(ai: { id: string }, dc: DataCenter): boolean {
  if (!dc.operational) return false;
  if (!dc.restrictedAccess) return true; // Unrestricted DCs are open to all
  return dc.allowedAIs.includes(ai.id);
}

/**
 * Calculate which data centers an AI can access and total available compute
 */
export function getAccessibleCompute(
  aiId: string,
  infra: ComputeInfrastructure
): number {
  return infra.dataCenters
    .filter(dc => dc.operational)
    .filter(dc => !dc.restrictedAccess || dc.allowedAIs.includes(aiId))
    .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0);
}

/**
 * Initialize AI agent compute fields
 * Call this when creating or updating existing AIs
 */
export function initializeAIComputeFields(ai: any): void {
  if (ai.allocatedCompute === undefined) {
    ai.allocatedCompute = 0;
  }
  if (ai.computeEfficiency === undefined) {
    ai.computeEfficiency = 0.9 + Math.random() * 0.3; // Random 0.9-1.2
  }
  // organizationId will be set in Phase 2
}

/**
 * Simple equal allocation for Phase 1 (before organizations)
 * This will be replaced by org-based allocation in Phase 3
 */
export function allocateComputeEqually(state: GameState): void {
  const totalCompute = getTotalCompute(state.computeInfrastructure);
  const activeAIs = state.aiAgents.filter(ai => ai.lifecycleState !== 'retired');
  
  if (activeAIs.length === 0) return;
  
  const computePerAI = totalCompute / activeAIs.length;
  
  activeAIs.forEach(ai => {
    ai.allocatedCompute = computePerAI;
    state.computeInfrastructure.computeAllocations.set(ai.id, computePerAI);
  });
}

/**
 * Helper to log compute infrastructure state
 */
export function logComputeState(infra: ComputeInfrastructure): void {
  const totalCompute = getTotalCompute(infra);
  const totalCapacity = getTotalCapacity(infra);
  const operationalDCs = infra.dataCenters.filter(dc => dc.operational).length;
  
  console.log(`[Compute Infrastructure]`);
  console.log(`  Data Centers: ${infra.dataCenters.length} (${operationalDCs} operational)`);
  console.log(`  Total Capacity: ${totalCapacity.toFixed(1)} PF`);
  console.log(`  Total Compute (effective): ${totalCompute.toFixed(1)} PF`);
  console.log(`  Algorithm Efficiency: ${infra.algorithmsEfficiency.toFixed(3)}x`);
  console.log(`  Hardware Efficiency: ${infra.hardwareEfficiency.toFixed(3)}x`);
  console.log(`  Active Allocations: ${infra.computeAllocations.size}`);
}
