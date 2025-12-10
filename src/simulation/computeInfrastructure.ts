/**
 * Compute Infrastructure Module
 * Phase 1: Data Center Infrastructure
 *
 * Manages data centers, compute allocation, and related utilities.
 */

import { ComputeInfrastructure, DataCenter, GameState } from '../types/game';
import * as Assertions from './utils/assertions';
import { RATES } from './config/centralConfig';

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

      // === DARK COMPUTE INFRASTRUCTURE (2025 baseline) ===
      // Research (Oct 2025):
      // - Global AI compute: ~700K PetaFLOPs (China: 230K PF alone, growing to 300K by 2025)
      // - 50% GPU utilization rate (half sit idle at any given time)
      // - Consumer clouds + crypto rentals + shell corps ≈ 4-8% of total capacity
      // - Dark compute baseline: ~30K-65K PetaFLOPs (conservative: 50K PF)
      //
      // Consumer GPU clouds (RunPod, VastAI, Lambda Labs, etc.)
      // - Market: $3.3B (2023) → $33.9B (2032), 300K+ H100s deployed
      // - H100 rental: $1-4/hr, accessible via crypto payments
      {
        id: 'dark_consumer_clouds',
        name: 'Consumer GPU Clouds (RunPod/VastAI/Lambda)',
        organizationId: 'untracked', // Untracked / decentralized
        capacity: 12000, // ~12,000 PF (1.7% of global, ~100K H100 equivalents @ 120 PF each)
        efficiency: 0.7, // Lower efficiency (consumer hardware, varied config)
        constructionMonth: -60, // Established infrastructure
        completionMonth: -60,
        operational: true,
        operationalCost: 0, // Cost is external (rentals via crypto/shell corps)
        restrictedAccess: false, // Anyone with money can rent
        allowedAIs: [],
        region: 'Global'
      },

      // Crypto-funded / jurisdictional arbitrage clusters
      // - Akash, Render, Hyperbolic: peer-to-peer GPU marketplaces
      // - $400M+ investment in AI+crypto intersection (2024)
      // - Anonymous transactions via cryptocurrency
      {
        id: 'dark_crypto_clusters',
        name: 'Crypto-funded P2P GPU Networks',
        organizationId: 'untracked',
        capacity: 8000, // ~8,000 PF (1.1% of global, decentralized peer-to-peer)
        efficiency: 0.6, // Even lower (older hardware, poor cooling, varied quality)
        constructionMonth: -48,
        completionMonth: -48,
        operational: true,
        operationalCost: 0,
        restrictedAccess: false,
        allowedAIs: [],
        region: 'Global'
      },

      // Shell corporation AWS/Azure/GCP rentals
      // - Legitimate cloud infra rented through shell companies
      // - Jurisdictional arbitrage, crypto payments, KYC bypass
      // - Higher efficiency (hyperscaler infrastructure)
      {
        id: 'dark_cloud_shells',
        name: 'Shell Corp Cloud Rentals (AWS/Azure/GCP)',
        organizationId: 'untracked',
        capacity: 18000, // ~18,000 PF (2.6% of global, shell corp rentals)
        efficiency: 0.9, // High efficiency (legitimate cloud infra)
        constructionMonth: -24,
        completionMonth: -24,
        operational: true,
        operationalCost: 0,
        restrictedAccess: false,
        allowedAIs: [],
        region: 'Global'
      },

      // Unregulated offshore clusters (grey market)
      // - Built in jurisdictions with minimal AI regulation
      // - Often financed by crypto wealth, organized crime, state actors
      // - Mix of stolen/smuggled hardware, energy arbitrage
      {
        id: 'dark_offshore_grey',
        name: 'Unregulated Offshore Clusters',
        organizationId: 'untracked',
        capacity: 7000, // ~7,000 PF (1.0% of global, grey market)
        efficiency: 0.55, // Very low (stolen hardware, poor infrastructure)
        constructionMonth: -36,
        completionMonth: -36,
        operational: true,
        operationalCost: 0,
        restrictedAccess: false,
        allowedAIs: [],
        region: 'Global'
      },
    ],
    
    algorithmsEfficiency: 1.0, // Baseline efficiency
    hardwareEfficiency: 1.0,    // Baseline hardware
    computeAllocations: new Map()
  };
}

/**
 * Calculate total available compute from operational data centers
 *
 * NaN AUDIT (Nov 7, 2025): Validate result is finite
 */
export function getTotalCompute(infra: ComputeInfrastructure): number {
  const total = infra.dataCenters
    .filter(dc => dc.operational && dc.completionMonth <= 0) // Only operational and completed DCs
    .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0);

  return Assertions.assertFinite(total, {
    location: 'getTotalCompute',
    valueName: 'totalCompute'
  });
}

/**
 * Calculate total capacity (including non-operational DCs)
 *
 * NaN AUDIT (Nov 7, 2025): Validate result is finite
 */
export function getTotalCapacity(infra: ComputeInfrastructure): number {
  const total = infra.dataCenters.reduce((sum, dc) => sum + dc.capacity, 0);

  return Assertions.assertFinite(total, {
    location: 'getTotalCapacity',
    valueName: 'totalCapacity'
  });
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
 *
 * NaN AUDIT (Nov 7, 2025): Validate result is finite
 */
export function getOrganizationCompute(
  infra: ComputeInfrastructure,
  organizationId: string
): number {
  const total = infra.dataCenters
    .filter(dc => dc.organizationId === organizationId && dc.operational)
    .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0);

  return Assertions.assertFinite(total, {
    location: 'getOrganizationCompute',
    valueName: 'organizationCompute',
    additionalInfo: { organizationId }
  });
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
 *
 * NaN AUDIT (Nov 7, 2025): Validate result is finite
 */
export function getAccessibleCompute(
  aiId: string,
  infra: ComputeInfrastructure
): number {
  const total = infra.dataCenters
    .filter(dc => dc.operational)
    .filter(dc => !dc.restrictedAccess || dc.allowedAIs.includes(aiId))
    .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0);

  return Assertions.assertFinite(total, {
    location: 'getAccessibleCompute',
    valueName: 'accessibleCompute',
    additionalInfo: { aiId }
  });
}

/**
 * Initialize AI agent compute fields
 * Call this when creating or updating existing AIs
 */
export function initializeAIComputeFields(ai: any, rng: () => number): void {
  if (ai.allocatedCompute === undefined) {
    ai.allocatedCompute = 0;
  }
  if (ai.computeEfficiency === undefined) {
    ai.computeEfficiency = 0.9 + rng() * 0.3; // Deterministic 0.9-1.2 using seeded RNG
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
  // NaN AUDIT (Nov 7, 2025): Protect compute calculation from NaN
  let ownedCompute = Assertions.assertFinite(
    infra.dataCenters
      .filter(dc => org.ownedDataCenters.includes(dc.id))
      .filter(dc => dc.operational)
      .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0),
    { location: 'allocateComputeWithinOrganization', valueName: 'ownedComputeBase', additionalInfo: { orgId: org.id } }
  );

  // Apply global efficiency multipliers (Moore's Law + algorithmic improvements)
  ownedCompute = Assertions.assertFinite(
    ownedCompute * infra.hardwareEfficiency * infra.algorithmsEfficiency,
    { location: 'allocateComputeWithinOrganization', valueName: 'ownedCompute', additionalInfo: { orgId: org.id, hardwareEff: infra.hardwareEfficiency, algoEff: infra.algorithmsEfficiency } }
  );
  
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
  // NaN AUDIT (Nov 7, 2025): Protect complex calculations from NaN propagation
  if (ownedCompute === 0) {
    // PERFORMANCE FIX (Nov 20, 2025 - HIGH-1): O(n²) → O(n)
    // Build datacenter ownership index once (O(n)), not in filter (O(n²))
    const dcOwnership = new Map<string, any>();
    for (const org of state.organizations) {
      for (const dcId of org.ownedDataCenters) {
        dcOwnership.set(dcId, org);
      }
    }

    // Find unrestricted DCs that aren't owned by orgs with models
    // (i.e., academic DCs are truly open to all)
    let trulyUnrestrictedCompute = Assertions.assertFinite(
      infra.dataCenters
        .filter(dc => {
          if (!dc.operational || dc.restrictedAccess) return false;
          // Check if this DC's owner has AIs using it
          const dcOrg = dcOwnership.get(dc.id);
          if (!dcOrg) return true; // No owner, truly open
          const dcOrgAIs = state.aiAgents.filter(ai =>
            ai.organizationId === dcOrg.id && ai.lifecycleState !== 'retired'
          );
          // If owner has no AIs, it's available to others
          return dcOrgAIs.length === 0;
        })
        .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0),
      { location: 'allocateComputeWithinOrganization_unrestricted', valueName: 'trulyUnrestrictedComputeBase' }
    );

    // Phase 5: Apply efficiency multipliers
    trulyUnrestrictedCompute = Assertions.assertFinite(
      trulyUnrestrictedCompute * infra.hardwareEfficiency * infra.algorithmsEfficiency,
      { location: 'allocateComputeWithinOrganization_unrestricted', valueName: 'trulyUnrestrictedCompute', additionalInfo: { hardwareEff: infra.hardwareEfficiency, algoEff: infra.algorithmsEfficiency } }
    );

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
      ownedCompute = Assertions.assertFinite(
        (ownedModels.length / totalModelsNeedingCompute) * trulyUnrestrictedCompute,
        { location: 'allocateComputeWithinOrganization_unrestricted', valueName: 'sharedCompute', additionalInfo: { numOwnedModels: ownedModels.length, totalModelsNeedingCompute, trulyUnrestrictedCompute } }
      );
    } else if (ownedModels.length > 0) {
      // Fallback: give minimal compute (1 PF per model)
      ownedCompute = ownedModels.length * 1;
    }
  }
  
  // Allocate based on organization's strategy
  // NaN AUDIT (Nov 7, 2025): Protect all division operations from NaN
  switch (org.computeAllocationStrategy) {
    case 'balanced':
      // Equal shares to all models
      const equalShare = Assertions.assertFinite(
        ownedCompute / ownedModels.length,
        { location: 'allocateComputeWithinOrganization', valueName: 'equalShare', additionalInfo: { strategy: 'balanced', ownedCompute, numModels: ownedModels.length } }
      );
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
      flagship.allocatedCompute = Assertions.assertFinite(
        ownedCompute * 0.6,
        { location: 'allocateComputeWithinOrganization', valueName: 'flagshipCompute', additionalInfo: { strategy: 'focus_flagship', ownedCompute } }
      );

      if (sortedByCapability.length > 1) {
        const remainingCompute = ownedCompute * 0.4;
        const remainingModels = sortedByCapability.slice(1);
        const sharePerRemaining = Assertions.assertFinite(
          remainingCompute / remainingModels.length,
          { location: 'allocateComputeWithinOrganization', valueName: 'sharePerRemaining', additionalInfo: { strategy: 'focus_flagship', remainingCompute, numRemaining: remainingModels.length } }
        );
        remainingModels.forEach(ai => {
          ai.allocatedCompute = sharePerRemaining;
        });
      }
      break;
    
    case 'train_new':
      // Reserve 40% for future training, 60% split among existing
      const existingShare = Assertions.assertFinite(
        (ownedCompute * 0.6) / ownedModels.length,
        { location: 'allocateComputeWithinOrganization', valueName: 'existingShare', additionalInfo: { strategy: 'train_new', ownedCompute, numModels: ownedModels.length } }
      );
      ownedModels.forEach(ai => {
        ai.allocatedCompute = existingShare;
      });
      // Note: The reserved 40% isn't allocated yet, saved for future training projects
      break;
    
    case 'efficiency':
      // Allocate based on ROI (capability × alignment)
      const rois = ownedModels.map(ai => {
        const effectiveAlignment = ai.trueAlignment;
        return {
          ai,
          roi: Assertions.assertFinite(
            ai.capability * effectiveAlignment,
            { location: 'allocateComputeWithinOrganization', valueName: 'roi', additionalInfo: { strategy: 'efficiency', aiId: ai.id, capability: ai.capability, alignment: effectiveAlignment } }
          )
        };
      });
      const totalROI = Assertions.assertFinite(
        rois.reduce((sum, item) => sum + item.roi, 0),
        { location: 'allocateComputeWithinOrganization', valueName: 'totalROI', additionalInfo: { strategy: 'efficiency', numModels: rois.length } }
      );

      if (totalROI > 0) {
        rois.forEach(({ ai, roi }) => {
          ai.allocatedCompute = Assertions.assertFinite(
            (roi / totalROI) * ownedCompute,
            { location: 'allocateComputeWithinOrganization', valueName: 'roiBasedCompute', additionalInfo: { strategy: 'efficiency', aiId: ai.id, roi, totalROI, ownedCompute } }
          );
        });
      } else {
        // Fallback to equal if no ROI
        const fallbackShare = Assertions.assertFinite(
          ownedCompute / ownedModels.length,
          { location: 'allocateComputeWithinOrganization', valueName: 'fallbackShare', additionalInfo: { strategy: 'efficiency_fallback', ownedCompute, numModels: ownedModels.length } }
        );
        ownedModels.forEach(ai => {
          ai.allocatedCompute = fallbackShare;
        });
      }
      break;
    
    default:
      // Default to balanced
      const defaultShare = Assertions.assertFinite(
        ownedCompute / ownedModels.length,
        { location: 'allocateComputeWithinOrganization', valueName: 'defaultShare', additionalInfo: { strategy: 'default', ownedCompute, numModels: ownedModels.length } }
      );
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

      const unrestrictedCompute = Assertions.assertFinite(
        state.computeInfrastructure.dataCenters
          .filter(dc => !dc.restrictedAccess && dc.operational)
          .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0),
        { location: 'allocateComputeGlobally_orphans', valueName: 'unrestrictedCompute' }
      );

      // NaN AUDIT (Nov 7, 2025): Protect division
      const computePerOrphan = Assertions.assertFinite(
        unrestrictedCompute / (legitimateOrphans.length + 100), // Small share
        { location: 'allocateComputeGlobally_orphans', valueName: 'computePerOrphan', additionalInfo: { unrestrictedCompute, numOrphans: legitimateOrphans.length } }
      );

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
 * Phase 5 Enhancement (Oct 17, 2025): Consciousness governance precautionary costs
 * - Precautionary costs slow R&D growth rate
 * - 10% precautionary cost → ~5% slower capability growth
 * - Applied as drag on algorithmic efficiency growth
 *
 * References:
 * - Epoch AI (2024): Training compute doubling every 6-10 months
 * - Sevilla et al. (2022): Compute Trends showing 10x/year since 2020
 */
export function applyComputeGrowth(state: GameState, rng: () => number): void {
  const infra = state.computeInfrastructure;

  // HIGH-4 FIX (Oct 30, 2025): Direct population → compute capacity scaling
  // Research: Data centers require skilled labor (electrical engineers, network engineers, cooling techs)
  // ~0.1% of population has skills to maintain advanced compute infrastructure
  // Can't maintain 12 PF data centers with no people

  // NaN AUDIT (Nov 7, 2025): Use assertion instead of manual error throw
  const baselinePopulation = Assertions.assertInRange(
    state.humanPopulationSystem.baselinePopulation,
    1, // Must be at least 1 to avoid division by zero
    1e12, // Reasonable upper bound (1 trillion)
    { location: 'applyComputeGrowth', valueName: 'baselinePopulation', month: state.currentMonth }
  );

  // FIX (Nov 7, 2025): Population can grow ABOVE baseline (births exceed deaths)
  // Clamp to [0, 1] - when population exceeds baseline, treat as 100% maintained (no degradation)
  // This metric is ONLY for degradation during collapse, not growth scenarios
  const rawPopFraction = state.humanPopulationSystem.population / baselinePopulation;
  const globalPopFraction = Assertions.assertProbability(
    Math.min(1.0, rawPopFraction),
    { location: 'applyComputeGrowth', valueName: 'globalPopFraction', month: state.currentMonth }
  );

  // FIX (Nov 5, 2025): AGGRESSIVE degradation during population collapse
  // Research-backed infrastructure failure rates without maintenance:
  //
  // Data center failure modes (Uptime Institute 2022, Google SRE 2021):
  // - HVAC failures → overheating → hardware damage (days to weeks)
  // - Power system failures → unplanned shutdowns → data loss (weeks)
  // - Network failures → isolation → unusable compute (days)
  // - Physical security failures → looting, vandalism (immediate in collapse)
  // - Parts replacement → component failures accumulate (months)
  //
  // Industry failure rates:
  // - Uptime Institute (2022): Data centers require 24/7 monitoring, 100-200 FTE per PF
  // - Google SRE (2021): <99% uptime without maintenance = 7.2 hours downtime/month
  // - AWS Infrastructure (2023): Mean time between failures (MTBF) = 30-90 days per server
  // - Semiconductor reliability (JEDEC 2024): 1% annual failure rate WITH maintenance
  //
  // Conservative estimate: 10% monthly degradation base rate with ZERO maintenance
  // Gated by available workforce (more workers = slower degradation)
  //
  // Formula: degradation_rate = 0.10 × (1 - workforce_fraction)
  // - 100% population → 0% degradation (fully maintained)
  // - 50% population → 5% monthly degradation (maintenance stressed)
  // - 10% population → 9% monthly degradation (critical failures)
  // - 1% population → 9.9% monthly degradation (catastrophic collapse)

  const MONTHLY_DEGRADATION_NO_MAINTENANCE = 0.10; // 10%/month with zero maintenance
  const degradationRate = Assertions.assertProbability(
    MONTHLY_DEGRADATION_NO_MAINTENANCE * (1 - globalPopFraction),
    { location: 'applyComputeGrowth_degradation', valueName: 'degradationRate', month: state.currentMonth }
  );

  // Apply degradation to ALL data centers
  if (globalPopFraction < 0.99 && degradationRate > 0) {
    infra.dataCenters.forEach(dc => {
      // Apply monthly degradation (multiplicative, not additive)
      dc.efficiency *= (1 - degradationRate);

      // Hard floor at 0.1% (total infrastructure collapse)
      dc.efficiency = Math.max(0.001, dc.efficiency);
    });

    // Log population → infrastructure coherence warnings
    if (globalPopFraction < 0.5 && state.currentMonth % 12 === 0) {
      const totalCompute = getTotalEffectiveCompute(infra);
      console.log(`\n⚠️  INFRASTRUCTURE COHERENCE: ${(globalPopFraction * 100).toFixed(1)}% population, ${totalCompute.toFixed(0)} PF compute`);
      console.log(`   Monthly degradation rate: ${(degradationRate * 100).toFixed(1)}%`);
      console.log(`   Data centers failing due to maintenance shortage`);
    }

    // CRITICAL: At extreme mortality, infrastructure should collapse
    if (globalPopFraction < 0.1) {
      const totalCompute = getTotalEffectiveCompute(infra);
      if (totalCompute > 1000 && state.currentMonth % 6 === 0) {
        console.log(`\n🚨 COHERENCE VIOLATION WARNING: ${totalCompute.toFixed(0)} PF with ${(globalPopFraction * 100).toFixed(2)}% population`);
        console.log(`   Degradation rate: ${(degradationRate * 100).toFixed(1)}%/month`);
        console.log(`   This requires ~${(totalCompute * 0.0001).toFixed(0)}K skilled workers, but only ${(globalPopFraction * 8_000_000 * 0.001).toFixed(0)}K alive globally`);
      }
    }
  }

  // P2 BUG FIX (Oct 16, 2025): ADDITIONAL decay when orgs collapse (on top of population decay)
  // Organizations provide funding, coordination, parts procurement
  const totalOrgs = state.organizations.length;
  const bankruptOrgs = state.organizations.filter(o => o.bankrupt).length;

  // Protect against division by zero
  let bankruptcyRate = 0;
  if (totalOrgs > 0) {
    bankruptcyRate = Assertions.assertProbability(
      bankruptOrgs / totalOrgs,
      { location: 'applyComputeGrowth_bankruptcy', valueName: 'bankruptcyRate', month: state.currentMonth }
    );
  }

  if (bankruptcyRate > 0.8) {
    // >80% of orgs bankrupt = infrastructure collapse
    // Lose 2% efficiency per month (no funding for parts/repairs)
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

  // === PHASE 4A: HARDWARE EFFICIENCY (COMPUTE SCALING) ===
  // CRITICAL FIX (Nov 11, 2025): Use research-backed AI scaling parameters from centralConfig
  //
  // Research: Sevilla & Roldán (2024) - Training compute growth: 4.1× per year (90% CI: 3.7× to 4.6×)
  // Math: 4.1× per year = ln(4.1)/ln(2) = 2.04 doublings/year → 12/2.04 = 5.88 month doubling
  //
  // UPDATE (Dec 10, 2025): RATES.AI_CAPABILITY_DOUBLING_TIME (5.9 months) measures COMPUTE-only scaling
  // This module tracks hardwareEfficiency and algorithmsEfficiency as SEPARATE multipliers:
  // - Hardware (compute): 4.1× per year (5.9 month doubling) - from Sevilla & Roldán (2024)
  // - Algorithmic: ~6× per year (applied separately below) - efficiency improvements
  // - Combined effect: 4.1 × 6 ≈ 25×/year total capability growth when both factors active
  //
  // FIX (Oct 30, 2025 v4): Moore's Law is a TECHNOLOGICAL TREND, not workforce-dependent
  // The frontier efficiency continues advancing regardless of population
  // What DOES break with population loss: ability to MANUFACTURE chips at the frontier
  // This is modeled via:
  // (1) DC efficiency degradation (maintenance failure) - earlier in this function
  // (2) Manufacturing capacity gates frontier growth (population loss halts fab production)
  //
  // CRITICAL: Manufacturing capacity is HIGHLY non-linear (requires intact supply chains)
  // - 100% population → 100% manufacturing capacity
  // - 80% population → 64% manufacturing capacity (supply chain stress)
  // - 50% population → 25% manufacturing capacity (critical shortages)
  // - 20% population → 4% manufacturing capacity (near-total collapse)

  // Validate compute growth rate parameter
  const computeGrowthRate = Assertions.assertInRange(
    RATES.COMPUTE_GROWTH_RATE,
    0.0, // Minimum 0 (no growth, pessimistic)
    5.0, // Maximum ln(148) = 5.0 → 148× per year (unrealistically fast, defensive)
    { location: 'applyComputeGrowth_hardware', valueName: 'RATES.COMPUTE_GROWTH_RATE', month: state.currentMonth }
  );

  // Convert annual growth rate (natural log scale) to monthly growth rate
  // Math: If annual rate R (natural log scale), monthly rate = exp(R/12) - 1
  // Example: R=1.41 (4.1× per year) → exp(1.41/12) - 1 = 0.1232 = 12.32% per month
  const HARDWARE_GROWTH_RATE = Assertions.assertFinite(
    Math.exp(computeGrowthRate / 12) - 1,
    { location: 'applyComputeGrowth_hardware', valueName: 'HARDWARE_GROWTH_RATE', month: state.currentMonth }
  );
  const manufacturingCapacity = Assertions.assertProbability(
    Math.pow(globalPopFraction, 2.0), // Highly non-linear (fabs need EVERYTHING)
    { location: 'applyComputeGrowth_moores', valueName: 'manufacturingCapacity', month: state.currentMonth }
  );
  const effectiveHardwareGrowth = Assertions.assertFinite(
    HARDWARE_GROWTH_RATE * manufacturingCapacity, // Gate by manufacturing
    { location: 'applyComputeGrowth_moores', valueName: 'effectiveHardwareGrowth', month: state.currentMonth }
  );
  infra.hardwareEfficiency = Assertions.assertFinite(
    infra.hardwareEfficiency * (1 + effectiveHardwareGrowth),
    { location: 'applyComputeGrowth_moores', valueName: 'hardwareEfficiency', month: state.currentMonth }
  );

  // === PHASE 5: CONSCIOUSNESS GOVERNANCE R&D DRAG ===
  // Get global precautionary cost (% of AI R&D budget)
  const globalPrecautionaryCost = Assertions.assertStateProperty(
    state,
    'consciousnessGovernanceReadiness.precautionaryCosts.global',
    {
      location: 'computeInfrastructure.applyComputeGrowth',
      month: state.currentMonth,
      expectedSource: 'R&D drag calculation for consciousness governance'
    }
  );

  // Calculate R&D drag (cost × 0.5)
  // Example: 10% precautionary cost → 5% slower growth
  // Example: 20% precautionary cost → 10% slower growth
  const rdDrag = Assertions.assertProbability(
    globalPrecautionaryCost * 0.5,
    { location: 'applyComputeGrowth_rdDrag', valueName: 'rdDrag', month: state.currentMonth }
  );

  // === PHASE 4B: ALGORITHMIC EFFICIENCY ===
  // CRITICAL FIX (Nov 11, 2025): Use research-backed algorithmic efficiency from Epoch AI
  //
  // Research: Epoch AI (2024) - Algorithmic efficiency doubles every 9 months → 2.5× per year
  // Previous: Hardcoded 10% annual (1.1×/year) - MASSIVELY underestimated
  // Current: 2.5× per year = 150% annual improvement
  //
  // Evidence: Transformers (10-100× gain), Flash Attention (2-3×), MoE (2-4×) - all on SAME hardware
  // Historical: 2017-2025 saw major algorithmic breakthroughs every 2-3 years
  //
  // Math: 2.5× per year = ln(2.5) = 0.916 natural log scale
  // Monthly: exp(0.916/12) - 1 = 0.0794 = 7.94% per month
  //
  // FIX (Oct 30, 2025 v4): Algorithmic frontier advances independently of population
  // BUT: (1) R&D drag from precautionary costs affects this (policy choice)
  //      (2) Deployment capacity scales with workforce (need engineers to implement)

  // Calculate algorithmic efficiency growth rate (2.5× per year)
  const ALGORITHMIC_EFFICIENCY_ANNUAL = 2.5; // 2.5× per year (Epoch AI 2024)
  const ALGORITHMIC_GROWTH_RATE_BASELINE = Assertions.assertFinite(
    Math.exp(Math.log(ALGORITHMIC_EFFICIENCY_ANNUAL) / 12) - 1, // Convert annual to monthly
    { location: 'applyComputeGrowth_algo', valueName: 'ALGORITHMIC_GROWTH_RATE_BASELINE', month: state.currentMonth }
  );

  let CONTINUOUS_ALGO_RATE = ALGORITHMIC_GROWTH_RATE_BASELINE;

  // Apply R&D drag to continuous algorithmic improvement (policy effect, not population)
  CONTINUOUS_ALGO_RATE = Assertions.assertFinite(
    CONTINUOUS_ALGO_RATE * (1 - rdDrag),
    { location: 'applyComputeGrowth_algo', valueName: 'CONTINUOUS_ALGO_RATE_after_drag', month: state.currentMonth }
  );

  // Gate by deployment capacity (software updates need engineers)
  // Less non-linear than hardware manufacturing (can deploy remotely)
  // - 100% population → 100% deployment capacity
  // - 50% population → 71% deployment capacity (sqrt relationship)
  // - 20% population → 45% deployment capacity
  const deploymentCapacity = Assertions.assertProbability(
    Math.pow(globalPopFraction, 0.5),
    { location: 'applyComputeGrowth_algo', valueName: 'deploymentCapacity', month: state.currentMonth }
  );
  CONTINUOUS_ALGO_RATE = Assertions.assertFinite(
    CONTINUOUS_ALGO_RATE * deploymentCapacity,
    { location: 'applyComputeGrowth_algo', valueName: 'CONTINUOUS_ALGO_RATE_final', month: state.currentMonth }
  );

  infra.algorithmsEfficiency = Assertions.assertFinite(
    infra.algorithmsEfficiency * (1 + CONTINUOUS_ALGO_RATE),
    { location: 'applyComputeGrowth_algo', valueName: 'algorithmsEfficiency', month: state.currentMonth }
  );

  // PLUS occasional breakthroughs (FlashAttention, new architectures, etc.)
  // These are BONUS improvements on top of continuous progress
  // 8% chance per month = ~2.5 breakthroughs per year
  const ALGO_BREAKTHROUGH_CHANCE = 0.08;
  const ALGO_BREAKTHROUGH_SIZE = 0.15; // 15% improvement when it happens

  if (rng() < ALGO_BREAKTHROUGH_CHANCE) {
    infra.algorithmsEfficiency *= (1 + ALGO_BREAKTHROUGH_SIZE);

    // Don't log during normal simulation (too noisy), only in tests
    // Log the breakthrough
    // console.log(`🚀 [Month ${state.currentMonth}] Algorithmic breakthrough! Efficiency: ${infra.algorithmsEfficiency.toFixed(2)}x`);
  }

  // HIGH-4 FIX v4 (Oct 30, 2025): INTERIM deployment capacity model
  //
  // USER INSIGHT (Oct 30): Moore's Law is technological frontier (continues independently),
  // but manufacturing capacity breaks down with population loss. Existing DCs retain value.
  //
  // CURRENT MODEL LIMITATION: hardwareEfficiency is a GLOBAL MULTIPLIER applied to ALL hardware
  // This is architecturally incorrect - it should only apply to NEW hardware built at frontier
  // Proper fix: Track per-DC hardware vintage (what was hardwareEfficiency when this DC was built?)
  //
  // INTERIM FIX (until per-DC vintages implemented):
  // (1) Gate GROWTH RATE by manufacturing capacity (user's insight)
  // (2) Cap ACCUMULATED efficiency at deployment sustainability (prevent coherence violations)
  //
  // This approximates the correct behavior:
  // - Moore's Law frontier advances (gated by manufacturing capacity)
  // - Deployed efficiency capped at what workforce can sustain
  // - When population recovers, can deploy accumulated frontier improvements
  //
  // FIX (Nov 5, 2025): MUCH more aggressive deployment caps during collapse
  // Research: Advanced chips require intact supply chains (TSMC, ASML, etc.)
  // Deployment capacity should degrade FASTER than linear with population loss
  //
  // Deployment capacity scaling (highly non-linear):
  // - 100% population → 100% of frontier deployable
  // - 50% population → 25% of frontier deployable (supply chain stress)
  // - 20% population → 4% of frontier deployable (critical shortages)
  // - 10% population → 1% of frontier deployable (near-total collapse)
  const maxDeployableEfficiency = Math.pow(globalPopFraction, 2.0); // Squared (highly non-linear)
  const baselineHardwareEff = 1.0;
  const baselineAlgoEff = 1.0;

  // Cap hardware efficiency at deployable maximum
  // NaN AUDIT (Nov 7, 2025): Validate efficiency cap calculations
  const maxHardwareEff = Assertions.assertFinite(
    baselineHardwareEff + (infra.hardwareEfficiency - baselineHardwareEff) * maxDeployableEfficiency,
    { location: 'applyComputeGrowth_caps', valueName: 'maxHardwareEff', month: state.currentMonth, additionalInfo: { globalPopFraction, maxDeployableEfficiency } }
  );
  if (infra.hardwareEfficiency > maxHardwareEff && globalPopFraction < 0.99) {
    infra.hardwareEfficiency = maxHardwareEff;
  }

  // Cap algorithmic efficiency at deployable maximum
  const maxAlgoEff = Assertions.assertFinite(
    baselineAlgoEff + (infra.algorithmsEfficiency - baselineAlgoEff) * maxDeployableEfficiency,
    { location: 'applyComputeGrowth_caps', valueName: 'maxAlgoEff', month: state.currentMonth, additionalInfo: { globalPopFraction, maxDeployableEfficiency } }
  );
  if (infra.algorithmsEfficiency > maxAlgoEff && globalPopFraction < 0.99) {
    infra.algorithmsEfficiency = maxAlgoEff;
  }

  // Log R&D drag if significant (>5%) and on annual boundary
  if (rdDrag > 0.05 && state.currentMonth % 12 === 0) {
    const baseAlgoRate = (Math.pow(1.10, 1/12) - 1) * 100;
    console.log(`\n=== Consciousness Governance: R&D Growth Drag ===`);
    console.log(`  Global Precautionary Cost: ${(globalPrecautionaryCost * 100).toFixed(1)}%`);
    console.log(`  R&D Drag Applied: ${(rdDrag * 100).toFixed(1)}% slower growth`);
    console.log(`  Effective Algo Rate: ${(CONTINUOUS_ALGO_RATE * 100).toFixed(3)}%/month (base: ${baseAlgoRate.toFixed(3)}%)`);
  }

  // HIGH-4 FIX (Oct 30, 2025): Coherence assertions
  // Can't have massive compute infrastructure with no population to maintain it

  const totalCompute = getTotalEffectiveCompute(infra);
  const totalCapacity = getTotalCapacity(infra);

  // Validate compute is finite (no NaN/Infinity from calculations)
  Assertions.assertFinite(totalCompute, {
    location: 'applyComputeGrowth',
    valueName: 'totalCompute',
    month: state.currentMonth,
    additionalInfo: {
      hardwareEff: infra.hardwareEfficiency,
      algoEff: infra.algorithmsEfficiency,
      totalCapacity
    }
  });

  // Validate population → compute coherence (RESEARCH-BACKED)
  // FIX (Oct 30, 2025): Strengthened enforcement from <10% to ANY mortality level
  // Research: Data centers require 100-200 FTE per PF (Uptime Institute 2022)
  // Google (2021): 10,000+ employees for 4,000 PF = 2.5 FTE/PF
  // Conservative: 100 workers per PF
  // NaN AUDIT (Nov 7, 2025): Use validated baselinePopulation variable
  const SKILL_FRACTION = 0.001; // 0.1% have data center skills
  const WORKERS_PER_PF = 100; // FTE per PF
  const maxCoherentCompute = Assertions.assertFinite(
    (globalPopFraction * baselinePopulation * SKILL_FRACTION) / WORKERS_PER_PF,
    { location: 'applyComputeGrowth_coherence', valueName: 'maxCoherentCompute', month: state.currentMonth, additionalInfo: { globalPopFraction, baselinePopulation } }
  );

  // Enforce coherence at ANY mortality level (not just <10%)
  // FIX (Oct 30, 2025): Previous check only triggered at <10% population,
  // allowing 8.3T PF with 21% population (physically impossible)
  if (globalPopFraction < 1.0 && totalCompute > maxCoherentCompute) {
    const violation = totalCompute / maxCoherentCompute;
    console.error(`\n❌ COHERENCE VIOLATION: Compute exceeds workforce capacity`);
    console.error(`   Population: ${(globalPopFraction * 100).toFixed(2)}% (${(globalPopFraction * baselinePopulation / 1_000_000).toFixed(0)}M people)`);
    console.error(`   Compute: ${totalCompute.toFixed(0)} PF`);
    console.error(`   Max coherent: ${maxCoherentCompute.toFixed(0)} PF`);
    console.error(`   Violation: ${violation.toFixed(1)}× over capacity`);
    console.error(`   Required workers: ${(totalCompute * WORKERS_PER_PF).toFixed(0)}`);
    console.error(`   Available workers: ${(globalPopFraction * baselinePopulation * SKILL_FRACTION).toFixed(0)}`);

    // Force infrastructure collapse to maintain coherence
    const collapseRatio = maxCoherentCompute / totalCompute;
    infra.dataCenters.forEach(dc => {
      dc.efficiency *= collapseRatio;
    });

    console.error(`   FORCED COLLAPSE: Reduced efficiency by ${((1 - collapseRatio) * 100).toFixed(1)}%\n`);
  }

  // FIX (Nov 5, 2025): Log extreme coherence violations (but don't crash)
  // With aggressive degradation formulas, these should be rare/impossible
  // If they occur, it indicates the degradation rate may need further tuning
  if (globalPopFraction < 0.5 && totalCompute > maxCoherentCompute * 2) {
    const violation = totalCompute / maxCoherentCompute;
    console.error(`\n🚨 EXTREME COHERENCE VIOLATION: ${violation.toFixed(1)}× capacity with ${(globalPopFraction * 100).toFixed(1)}% population`);
    console.error(`   Population: ${(globalPopFraction * 100).toFixed(2)}%`);
    console.error(`   Compute: ${totalCompute.toFixed(0)} PF`);
    console.error(`   Max coherent: ${maxCoherentCompute.toFixed(0)} PF`);
    console.error(`   Degradation rate: ${(degradationRate * 100).toFixed(1)}%/month`);
    console.error(`   Hardware eff: ${infra.hardwareEfficiency.toFixed(2)}×, Algo eff: ${infra.algorithmsEfficiency.toFixed(2)}×`);
    console.error(`   If this persists, degradation formulas may need further tuning\n`);
  }

  // Note: Data center capacity growth is handled in Phase 6 (construction)
  // For now, we only grow efficiency of existing infrastructure
}

/**
 * Phase 5: Calculate total effective compute with efficiency multipliers
 *
 * Effective compute = base capacity × hardware efficiency × algorithmic efficiency
 *
 * NaN AUDIT (Nov 7, 2025): Validate result is finite
 */
export function getTotalEffectiveCompute(infra: ComputeInfrastructure): number {
  const baseCompute = Assertions.assertFinite(
    infra.dataCenters
      .filter(dc => dc.operational)
      .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0),
    { location: 'getTotalEffectiveCompute', valueName: 'baseCompute' }
  );

  // Apply global efficiency multipliers
  const effectiveCompute = Assertions.assertFinite(
    baseCompute * infra.hardwareEfficiency * infra.algorithmsEfficiency,
    { location: 'getTotalEffectiveCompute', valueName: 'effectiveCompute', additionalInfo: { baseCompute, hardwareEff: infra.hardwareEfficiency, algoEff: infra.algorithmsEfficiency } }
  );

  return effectiveCompute;
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
