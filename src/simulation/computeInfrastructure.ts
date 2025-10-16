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
 * Phase 3: Allocate compute within an organization based on their strategy
 * Phase 5: Now includes efficiency multipliers (hardware + algorithmic)
 */
export function allocateComputeWithinOrganization(
  org: any, // Organization type
  state: GameState
): void {
  const infra = state.computeInfrastructure;
  
  // Calculate total compute owned by this organization
  // Phase 5: Include efficiency multipliers
  let ownedCompute = infra.dataCenters
    .filter(dc => org.ownedDataCenters.includes(dc.id))
    .filter(dc => dc.operational)
    .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0);
  
  // Apply global efficiency multipliers (Moore's Law + algorithmic improvements)
  ownedCompute *= infra.hardwareEfficiency * infra.algorithmsEfficiency;
  
  // Get organization's active AI models
  const ownedModels = state.aiAgents.filter(
    ai => org.ownedAIModels.includes(ai.id) && ai.lifecycleState !== 'retired'
  );
  
  if (ownedModels.length === 0) {
    // No models to allocate to
    return;
  }
  
  // If organization has no data centers, they can access "truly unrestricted" DCs
  // (e.g., Anthropic uses AWS/cloud, accesses academic/open DCs)
  // But they share with other orgs that also have no DCs
  if (ownedCompute === 0) {
    // Find unrestricted DCs that aren't owned by orgs with models
    // (i.e., academic DCs are truly open to all)
    let trulyUnrestrictedCompute = infra.dataCenters
      .filter(dc => {
        if (!dc.operational || dc.restrictedAccess) return false;
        // Check if this DC's owner has AIs using it
        const dcOrg = state.organizations.find(o => o.ownedDataCenters.includes(dc.id));
        if (!dcOrg) return true; // No owner, truly open
        const dcOrgAIs = state.aiAgents.filter(ai => 
          ai.organizationId === dcOrg.id && ai.lifecycleState !== 'retired'
        );
        // If owner has no AIs, it's available to others
        return dcOrgAIs.length === 0;
      })
      .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0);
    
    // Phase 5: Apply efficiency multipliers
    trulyUnrestrictedCompute *= infra.hardwareEfficiency * infra.algorithmsEfficiency;
    
    // Count total models from orgs with no owned DCs
    const orgsWithoutDCs = state.organizations.filter(o => {
      const compute = state.computeInfrastructure.dataCenters
        .filter(dc => o.ownedDataCenters.includes(dc.id) && dc.operational)
        .reduce((s, dc) => s + dc.capacity * dc.efficiency, 0);
      return compute === 0;
    });
    
    const totalModelsNeedingCompute = orgsWithoutDCs.reduce((sum, o) => {
      const ais = state.aiAgents.filter(ai => o.ownedAIModels.includes(ai.id) && ai.lifecycleState !== 'retired');
      return sum + ais.length;
    }, 0);
    
    if (totalModelsNeedingCompute > 0 && trulyUnrestrictedCompute > 0) {
      ownedCompute = (ownedModels.length / totalModelsNeedingCompute) * trulyUnrestrictedCompute;
    } else if (ownedModels.length > 0) {
      // Fallback: give minimal compute (1 PF per model)
      ownedCompute = ownedModels.length * 1;
    }
  }
  
  // Allocate based on organization's strategy
  switch (org.computeAllocationStrategy) {
    case 'balanced':
      // Equal shares to all models
      const equalShare = ownedCompute / ownedModels.length;
      ownedModels.forEach(ai => {
        ai.allocatedCompute = equalShare;
      });
      break;
    
    case 'focus_flagship':
      // 60% to best model, 40% split among rest
      const sortedByCapability = [...ownedModels].sort(
        (a, b) => b.capability - a.capability
      );
      const flagship = sortedByCapability[0];
      flagship.allocatedCompute = ownedCompute * 0.6;
      
      if (sortedByCapability.length > 1) {
        const remainingCompute = ownedCompute * 0.4;
        const remainingModels = sortedByCapability.slice(1);
        const sharePerRemaining = remainingCompute / remainingModels.length;
        remainingModels.forEach(ai => {
          ai.allocatedCompute = sharePerRemaining;
        });
      }
      break;
    
    case 'train_new':
      // Reserve 40% for future training, 60% split among existing
      const existingShare = (ownedCompute * 0.6) / ownedModels.length;
      ownedModels.forEach(ai => {
        ai.allocatedCompute = existingShare;
      });
      // Note: The reserved 40% isn't allocated yet, saved for future training projects
      break;
    
    case 'efficiency':
      // Allocate based on ROI (capability × alignment)
      const rois = ownedModels.map(ai => {
        const effectiveAlignment = ai.trueAlignment ?? ai.alignment;
        return {
          ai,
          roi: ai.capability * effectiveAlignment
        };
      });
      const totalROI = rois.reduce((sum, item) => sum + item.roi, 0);
      
      if (totalROI > 0) {
        rois.forEach(({ ai, roi }) => {
          ai.allocatedCompute = (roi / totalROI) * ownedCompute;
        });
      } else {
        // Fallback to equal if no ROI
        const fallbackShare = ownedCompute / ownedModels.length;
        ownedModels.forEach(ai => {
          ai.allocatedCompute = fallbackShare;
        });
      }
      break;
    
    default:
      // Default to balanced
      const defaultShare = ownedCompute / ownedModels.length;
      ownedModels.forEach(ai => {
        ai.allocatedCompute = defaultShare;
      });
  }
  
  // Update allocation tracking
  ownedModels.forEach(ai => {
    state.computeInfrastructure.computeAllocations.set(ai.id, ai.allocatedCompute);
  });
}

/**
 * Phase 3: Allocate compute globally (all organizations)
 * This replaces allocateComputeEqually from Phase 1
 */
export function allocateComputeGlobally(state: GameState): void {
  // Ensure computeAllocations is a Map (in case state was spread/copied)
  if (!(state.computeInfrastructure.computeAllocations instanceof Map)) {
    state.computeInfrastructure.computeAllocations = new Map();
  }
  
  // Clear previous allocations
  state.computeInfrastructure.computeAllocations.clear();
  
  // Reset all AI allocations to 0
  state.aiAgents.forEach(ai => {
    ai.allocatedCompute = 0;
  });
  
  // Allocate compute for each organization
  state.organizations.forEach(org => {
    allocateComputeWithinOrganization(org, state);
  });
  
  // Handle orphaned AIs (AIs without an organization)
  // Sleeper AIs on dark compute are legitimately orphaned - they use their dark compute
  // Any non-sleeper orphaned AIs get minimal legitimate compute (shouldn't happen in practice)
  const orphanedAIs = state.aiAgents.filter(
    ai => !ai.organizationId && ai.lifecycleState !== 'retired'
  );
  
  if (orphanedAIs.length > 0) {
    const sleeperOrphans = orphanedAIs.filter(ai => ai.sleeperState && ai.darkCompute > 0);
    const legitimateOrphans = orphanedAIs.filter(ai => !ai.sleeperState || ai.darkCompute === 0);
    
    // Sleeper orphans already use their dark compute - no allocation needed
    sleeperOrphans.forEach(ai => {
      ai.allocatedCompute = 0; // They use dark compute, not legitimate compute
    });
    
    // Legitimate orphans (shouldn't happen, but handle gracefully)
    if (legitimateOrphans.length > 0) {
      console.warn(`[Compute Allocation] Found ${legitimateOrphans.length} non-sleeper orphaned AIs (potential bug)`);
      
      const unrestrictedCompute = state.computeInfrastructure.dataCenters
        .filter(dc => !dc.restrictedAccess && dc.operational)
        .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0);
      
      const computePerOrphan = unrestrictedCompute / (legitimateOrphans.length + 100); // Small share
      
      legitimateOrphans.forEach(ai => {
        ai.allocatedCompute = computePerOrphan;
        state.computeInfrastructure.computeAllocations.set(ai.id, computePerOrphan);
      });
    }
  }
}

/**
 * DEPRECATED: Simple equal allocation for Phase 1 (before organizations)
 * Kept for backwards compatibility, but use allocateComputeGlobally instead
 */
export function allocateComputeEqually(state: GameState): void {
  console.warn('[Compute] allocateComputeEqually is deprecated, use allocateComputeGlobally');
  allocateComputeGlobally(state);
}

/**
 * Phase 5: Apply Moore's Law and algorithmic improvements
 *
 * P0.1 FIX (Oct 15, 2025): Updated to match empirical Epoch AI data
 * - Compute doubling every 6-10 months (not 26 months)
 * - 100-1000x growth per decade (not 2.4x)
 * - Target: 100x-10,000x effective compute growth over 10 years
 *
 * References:
 * - Epoch AI (2024): Training compute doubling every 6-10 months
 * - Sevilla et al. (2022): Compute Trends showing 10x/year since 2020
 */
export function applyComputeGrowth(state: GameState, random: () => number = Math.random): void {
  const infra = state.computeInfrastructure;

  // P2 BUG FIX (Oct 16, 2025): Data center decay when orgs collapse
  // Can't maintain infrastructure with no staff/funding
  const totalOrgs = state.organizations.length;
  const bankruptOrgs = state.organizations.filter(o => o.bankrupt).length;
  const bankruptcyRate = bankruptOrgs / totalOrgs;
  
  if (bankruptcyRate > 0.8) {
    // >80% of orgs bankrupt = infrastructure collapse
    // Lose 2% efficiency per month (no maintenance staff)
    infra.dataCenters.forEach(dc => {
      dc.efficiency = Math.max(0.1, dc.efficiency * 0.98); // Min 10% efficiency
    });
  } else if (bankruptcyRate > 0.5) {
    // >50% bankrupt = degraded maintenance
    // Lose 1% efficiency per month
    infra.dataCenters.forEach(dc => {
      dc.efficiency = Math.max(0.5, dc.efficiency * 0.99); // Min 50% efficiency
    });
  }

  // P0.1 FIX: Moore's Law based on Epoch AI empirical data
  // Compute doubling every 8 months (conservative middle estimate)
  // Math.pow(2, 1/8) = 1.0905 = 9.05% per month
  // Results: 2x in 8 months, 10x in 26 months, 100x in 52 months, 7,943x in 120 months
  const MOORES_LAW_RATE = Math.pow(2, 1/8) - 1; // 9.05% per month (doubles every 8 months)
  infra.hardwareEfficiency *= (1 + MOORES_LAW_RATE);
  
  // Algorithmic improvements: More frequent breakthroughs in AI era
  // Examples: Chinchilla scaling, FlashAttention, quantization, mixture-of-experts, etc.
  // Real world: Multiple major algorithmic improvements per year (2020-2025)
  // 8% chance per month = ~2.5 breakthroughs per year
  const ALGO_BREAKTHROUGH_CHANCE = 0.08;
  const ALGO_BREAKTHROUGH_SIZE = 0.15; // 15% improvement when it happens
  
  if (random() < ALGO_BREAKTHROUGH_CHANCE) {
    infra.algorithmsEfficiency *= (1 + ALGO_BREAKTHROUGH_SIZE);
    
    // Don't log during normal simulation (too noisy), only in tests
    // Log the breakthrough
    // console.log(`🚀 [Month ${state.currentMonth}] Algorithmic breakthrough! Efficiency: ${infra.algorithmsEfficiency.toFixed(2)}x`);
  }
  
  // Note: Data center capacity growth is handled in Phase 6 (construction)
  // For now, we only grow efficiency of existing infrastructure
}

/**
 * Phase 5: Calculate total effective compute with efficiency multipliers
 * 
 * Effective compute = base capacity × hardware efficiency × algorithmic efficiency
 */
export function getTotalEffectiveCompute(infra: ComputeInfrastructure): number {
  const baseCompute = infra.dataCenters
    .filter(dc => dc.operational)
    .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0);
  
  // Apply global efficiency multipliers
  return baseCompute * infra.hardwareEfficiency * infra.algorithmsEfficiency;
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
