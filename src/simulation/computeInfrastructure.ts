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
        const effectiveAlignment = ai.trueAlignment;
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
 * Phase 5 Enhancement (Oct 17, 2025): Consciousness governance precautionary costs
 * - Precautionary costs slow R&D growth rate
 * - 10% precautionary cost → ~5% slower capability growth
 * - Applied as drag on algorithmic efficiency growth
 *
 * References:
 * - Epoch AI (2024): Training compute doubling every 6-10 months
 * - Sevilla et al. (2022): Compute Trends showing 10x/year since 2020
 */
export function applyComputeGrowth(state: GameState, random: () => number = Math.random): void {
  const infra = state.computeInfrastructure;

  // HIGH-4 FIX (Oct 30, 2025): Direct population → compute capacity scaling
  // Research: Data centers require skilled labor (electrical engineers, network engineers, cooling techs)
  // ~0.1% of population has skills to maintain advanced compute infrastructure
  // Can't maintain 12 PF data centers with no people
  const globalPopFraction = state.humanPopulationSystem.population /
                            state.humanPopulationSystem.baselinePopulation;

  // Compute capacity scales with skilled labor pool availability
  // Formula: capacity ∝ population^0.8 (sub-linear - some operational redundancy)
  // - 100% population → 100% capacity
  // - 50% population → 57% capacity (skilled labor bottleneck)
  // - 10% population → 16% capacity (critical infrastructure threshold)
  // - 1% population → 2.5% capacity (minimal survivable infrastructure)
  const skilledLaborMultiplier = Math.pow(globalPopFraction, 0.8);

  // Apply population scaling to ALL data centers (CAP at workforce capacity)
  // This is SEPARATE from org bankruptcy - you need PEOPLE to maintain infrastructure
  // FIX (Oct 30, 2025): CAP efficiency at workforce capacity (not compound monthly)
  // Old formula compounded monthly, allowing Moore's Law to dominate
  // Data centers need continuous maintenance, efficiency can't exceed workforce
  if (globalPopFraction < 0.99) {
    // Only apply if there's been mortality (avoid floating point drift at 100%)
    infra.dataCenters.forEach(dc => {
      // CAP efficiency at workforce capacity (can't maintain more than workforce allows)
      // Research: Data centers require 100-200 FTE per PF (Uptime Institute 2022)
      // At 50% population: max 57.4% efficiency (pop^0.8)
      // At 10% population: max 15.8% efficiency
      dc.efficiency = Math.min(dc.efficiency, skilledLaborMultiplier);
      dc.efficiency = Math.max(0.01, dc.efficiency); // Min 1% efficiency
    });

    // Log population → infrastructure coherence warnings
    if (globalPopFraction < 0.5 && state.currentMonth % 12 === 0) {
      const totalCompute = getTotalEffectiveCompute(infra);
      console.log(`\n⚠️  INFRASTRUCTURE COHERENCE: ${(globalPopFraction * 100).toFixed(1)}% population, ${totalCompute.toFixed(0)} PF compute`);
      console.log(`   Skilled labor pool: ${(skilledLaborMultiplier * 100).toFixed(1)}% of baseline`);
      console.log(`   Data centers degrading due to maintenance shortage`);
    }

    // CRITICAL: At extreme mortality, infrastructure should collapse
    if (globalPopFraction < 0.1) {
      const totalCompute = getTotalEffectiveCompute(infra);
      if (totalCompute > 1000 && state.currentMonth % 6 === 0) {
        console.log(`\n🚨 COHERENCE VIOLATION WARNING: ${totalCompute.toFixed(0)} PF with ${(globalPopFraction * 100).toFixed(2)}% population`);
        console.log(`   This requires ~${(totalCompute * 0.0001).toFixed(0)}K skilled workers, but only ${(globalPopFraction * 8_000_000 * 0.001).toFixed(0)}K alive globally`);
      }
    }
  }

  // P2 BUG FIX (Oct 16, 2025): ADDITIONAL decay when orgs collapse (on top of population decay)
  // Organizations provide funding, coordination, parts procurement
  const totalOrgs = state.organizations.length;
  const bankruptOrgs = state.organizations.filter(o => o.bankrupt).length;
  const bankruptcyRate = bankruptOrgs / totalOrgs;

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

  // P0.1 FIX: Moore's Law based on Epoch AI empirical data
  // Compute doubling every 8 months (conservative middle estimate)
  // Math.pow(2, 1/8) = 1.0905 = 9.05% per month
  // Results: 2x in 8 months, 10x in 26 months, 100x in 52 months, 7,943x in 120 months
  // FIX (Oct 30, 2025): Scale Moore's Law by population (need engineers to develop hardware)
  // At 50% population: Moore's Law slows to ~4.5%/month (half the engineers)
  // At 10% population: Moore's Law nearly halts (~0.9%/month)
  const MOORES_LAW_RATE = Math.pow(2, 1/8) - 1; // 9.05% per month (doubles every 8 months)
  const populationScaledMooresLaw = MOORES_LAW_RATE * globalPopFraction; // Scale by workforce
  infra.hardwareEfficiency *= (1 + populationScaledMooresLaw);

  // === PHASE 5: CONSCIOUSNESS GOVERNANCE R&D DRAG ===
  // Get global precautionary cost (% of AI R&D budget)
  const globalPrecautionaryCost = state.consciousnessGovernanceReadiness?.precautionaryCosts?.global ?? 0;

  // Calculate R&D drag (cost × 0.5)
  // Example: 10% precautionary cost → 5% slower growth
  // Example: 20% precautionary cost → 10% slower growth
  const rdDrag = globalPrecautionaryCost * 0.5;

  // AI Capability Baseline Recalibration (Oct 17, 2025)
  // Research skeptic 2025 reality check: Add CONTINUOUS algorithmic improvement (not just random breakthroughs)
  // Evidence: Transformers (10-100x gain), Flash Attention (2-3x), MoE (2-4x) - all on SAME hardware
  // Historical: 2017-2025 saw major algorithmic breakthroughs every 2-3 years
  // Conservative estimate: 10% annual continuous improvement (separate from compute scaling)
  // Math.pow(1.10, 1/12) = 1.00797 = 0.797% per month
  // FIX (Oct 30, 2025): Scale by population (need AI researchers to develop algorithms)
  let CONTINUOUS_ALGO_RATE = Math.pow(1.10, 1/12) - 1; // 10% annual → 0.797% monthly

  // Apply R&D drag to continuous algorithmic improvement
  CONTINUOUS_ALGO_RATE = CONTINUOUS_ALGO_RATE * (1 - rdDrag);

  // Apply population scaling (need researchers to develop algorithms)
  CONTINUOUS_ALGO_RATE = CONTINUOUS_ALGO_RATE * globalPopFraction;

  infra.algorithmsEfficiency *= (1 + CONTINUOUS_ALGO_RATE);

  // PLUS occasional breakthroughs (FlashAttention, new architectures, etc.)
  // These are BONUS improvements on top of continuous progress
  // 8% chance per month = ~2.5 breakthroughs per year
  const ALGO_BREAKTHROUGH_CHANCE = 0.08;
  const ALGO_BREAKTHROUGH_SIZE = 0.15; // 15% improvement when it happens

  if (random() < ALGO_BREAKTHROUGH_CHANCE) {
    infra.algorithmsEfficiency *= (1 + ALGO_BREAKTHROUGH_SIZE);

    // Don't log during normal simulation (too noisy), only in tests
    // Log the breakthrough
    // console.log(`🚀 [Month ${state.currentMonth}] Algorithmic breakthrough! Efficiency: ${infra.algorithmsEfficiency.toFixed(2)}x`);
  }

  // HIGH-4 FIX v3 (Oct 30, 2025): CAP accumulated global multipliers at physically coherent maximums
  // Problem: Scaling growth RATE by population still allows past accumulated growth to persist
  // Example: At month 78 with 50% population, hardwareEfficiency might be 1,100× from past growth
  // Even with 50% slower growth, the 1,100× persists and compounds further
  //
  // Solution: Cap the ACCUMULATED multipliers based on what's sustainable with current workforce
  // Research basis: Moore's Law and algorithmic improvements require continuous R&D workforce
  // If workforce drops 50%, can't maintain improvements designed for 100% workforce
  //
  // Conservative cap: Allow multipliers to scale with population^0.5 (sub-linear)
  // - 100% population → 100% of accumulated improvements sustainable
  // - 50% population → 70.7% of accumulated improvements sustainable
  // - 10% population → 31.6% of accumulated improvements sustainable
  //
  // This models: Smaller workforce can't maintain all the complexity of systems designed by larger workforce
  const maxSustainableMultiplier = Math.pow(globalPopFraction, 0.5);
  const baselineHardwareEff = 1.0; // Baseline is 1.0× (no improvements)
  const baselineAlgoEff = 1.0;

  // Cap hardware efficiency at sustainable maximum
  // Example: If hardwareEfficiency = 1,100× but only 70.7% sustainable → cap at 778×
  const maxHardwareEff = baselineHardwareEff + (infra.hardwareEfficiency - baselineHardwareEff) * maxSustainableMultiplier;
  if (infra.hardwareEfficiency > maxHardwareEff && globalPopFraction < 0.99) {
    const reduction = ((infra.hardwareEfficiency - maxHardwareEff) / infra.hardwareEfficiency * 100).toFixed(1);
    if (state.currentMonth % 12 === 0) {
      console.log(`\n⚠️  HARDWARE EFFICIENCY CAP: Reduced ${reduction}% due to workforce shortage`);
      console.log(`   Population: ${(globalPopFraction * 100).toFixed(1)}%`);
      console.log(`   Previous: ${infra.hardwareEfficiency.toFixed(1)}×, Capped: ${maxHardwareEff.toFixed(1)}×`);
    }
    infra.hardwareEfficiency = maxHardwareEff;
  }

  // Cap algorithmic efficiency at sustainable maximum
  const maxAlgoEff = baselineAlgoEff + (infra.algorithmsEfficiency - baselineAlgoEff) * maxSustainableMultiplier;
  if (infra.algorithmsEfficiency > maxAlgoEff && globalPopFraction < 0.99) {
    const reduction = ((infra.algorithmsEfficiency - maxAlgoEff) / infra.algorithmsEfficiency * 100).toFixed(1);
    if (state.currentMonth % 12 === 0) {
      console.log(`\n⚠️  ALGORITHM EFFICIENCY CAP: Reduced ${reduction}% due to workforce shortage`);
      console.log(`   Population: ${(globalPopFraction * 100).toFixed(1)}%`);
      console.log(`   Previous: ${infra.algorithmsEfficiency.toFixed(1)}×, Capped: ${maxAlgoEff.toFixed(1)}×`);
    }
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
  const { assertFinite, assertInRange } = require('./utils/assertions');

  const totalCompute = getTotalEffectiveCompute(infra);
  const totalCapacity = getTotalCapacity(infra);

  // Validate compute is finite (no NaN/Infinity from calculations)
  assertFinite(totalCompute, {
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
  const BASELINE_POPULATION = 8_000_000_000; // 8B people
  const SKILL_FRACTION = 0.001; // 0.1% have data center skills
  const WORKERS_PER_PF = 100; // FTE per PF
  const maxCoherentCompute = (globalPopFraction * BASELINE_POPULATION * SKILL_FRACTION) / WORKERS_PER_PF;

  // Enforce coherence at ANY mortality level (not just <10%)
  // FIX (Oct 30, 2025): Previous check only triggered at <10% population,
  // allowing 8.3T PF with 21% population (physically impossible)
  if (globalPopFraction < 1.0 && totalCompute > maxCoherentCompute) {
    const violation = totalCompute / maxCoherentCompute;
    console.error(`\n❌ COHERENCE VIOLATION: Compute exceeds workforce capacity`);
    console.error(`   Population: ${(globalPopFraction * 100).toFixed(2)}% (${(globalPopFraction * BASELINE_POPULATION / 1_000_000).toFixed(0)}M people)`);
    console.error(`   Compute: ${totalCompute.toFixed(0)} PF`);
    console.error(`   Max coherent: ${maxCoherentCompute.toFixed(0)} PF`);
    console.error(`   Violation: ${violation.toFixed(1)}× over capacity`);
    console.error(`   Required workers: ${(totalCompute * WORKERS_PER_PF).toFixed(0)}`);
    console.error(`   Available workers: ${(globalPopFraction * BASELINE_POPULATION * SKILL_FRACTION).toFixed(0)}`);

    // Force infrastructure collapse to maintain coherence
    const collapseRatio = maxCoherentCompute / totalCompute;
    infra.dataCenters.forEach(dc => {
      dc.efficiency *= collapseRatio;
    });

    console.error(`   FORCED COLLAPSE: Reduced efficiency by ${((1 - collapseRatio) * 100).toFixed(1)}%\n`);
  }

  // CRITICAL: Extreme coherence violations (>2× with <50% population) = simulation bug
  // These should NEVER happen with correct formulas, so fail loudly if they do
  if (globalPopFraction < 0.5 && totalCompute > maxCoherentCompute * 2) {
    const violation = totalCompute / maxCoherentCompute;
    console.error(`\n🚨 CRITICAL COHERENCE VIOLATION: ${violation.toFixed(1)}× capacity with ${(globalPopFraction * 100).toFixed(1)}% population`);
    console.error(`   This indicates a BUG in infrastructure degradation formulas`);
    console.error(`   Population: ${(globalPopFraction * 100).toFixed(2)}%`);
    console.error(`   Compute: ${totalCompute.toFixed(0)} PF`);
    console.error(`   Max coherent: ${maxCoherentCompute.toFixed(0)} PF`);

    // Use assertion utility to fail loudly with full context
    assertFinite(NaN, {
      location: 'applyComputeGrowth',
      valueName: 'CRITICAL_COHERENCE_VIOLATION',
      month: state.currentMonth,
      additionalInfo: {
        population: globalPopFraction,
        compute: totalCompute,
        maxCoherent: maxCoherentCompute,
        violation: violation,
        message: 'Infrastructure degradation formulas are broken - compute exceeds workforce capacity by >2× with <50% population'
      }
    });
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
