/**
 * Phase 6: Organization Management & Data Center Construction
 * 
 * Organizations can:
 * - Build new data centers (24-72 month timelines)
 * - Manage construction projects
 * - Make strategic decisions about capacity expansion
 */

import { GameState, Organization, OrganizationProject, DataCenter } from '@/types/game';

/**
 * Calculate compute utilization for an organization
 */
export function calculateComputeUtilization(org: Organization, state: GameState): number {
  const ownedCompute = state.computeInfrastructure.dataCenters
    .filter(dc => org.ownedDataCenters.includes(dc.id) && dc.operational)
    .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0);
  
  if (ownedCompute === 0) return 0;
  
  const allocatedCompute = state.aiAgents
    .filter(ai => org.ownedAIModels.includes(ai.id) && ai.lifecycleState !== 'retired')
    .reduce((sum, ai) => sum + ai.allocatedCompute, 0);
  
  return allocatedCompute / ownedCompute;
}

/**
 * Task 6.1: Decision logic for building data centers
 */
export function shouldBuildDataCenter(
  org: Organization, 
  state: GameState,
  random: () => number = Math.random
): boolean {
  // Government and academic orgs build differently (handled in Phase 9)
  if (org.type === 'government' || org.type === 'academic') {
    return false;
  }
  
  // Check if already building
  const alreadyBuilding = org.currentProjects.some(p => p.type === 'datacenter_construction');
  if (alreadyBuilding) return false;
  
  // Utilization check - only build if running out of capacity
  const utilization = calculateComputeUtilization(org, state);
  
  // Capital check (50x monthly revenue)
  const cost = 50 * org.monthlyRevenue;
  const canAfford = org.capital > cost * 1.5; // Need 1.5x buffer
  
  // Market demand - only after economic transition starts
  const marketDemand = state.globalMetrics.economicTransitionStage >= 1;
  
  // Competitive pressure - if others are building, we should too
  const competitorBuilding = state.organizations
    .filter(o => o.id !== org.id && o.type === 'private')
    .some(o => o.currentProjects.some(p => p.type === 'datacenter_construction'));
  
  // Strategic priorities
  const hasCapabilityRacePriority = org.priorities.capabilityRace > 0.5;
  const hasMarketSharePriority = org.priorities.marketShare > 0.6;
  
  // Build if:
  // 1. Running out of capacity (>80% utilization)
  // 2. OR competitor is building AND we have capability race priority
  // 3. AND we can afford it
  // 4. AND market demand exists
  const highUtilization = utilization > 0.8;
  const competitivePressure = competitorBuilding && hasCapabilityRacePriority;
  const marketExpansion = hasMarketSharePriority && utilization > 0.6;
  
  const shouldBuild = canAfford && 
                     marketDemand && 
                     (highUtilization || competitivePressure || marketExpansion);
  
  // Add randomness (10% base chance if all conditions met, to avoid determinism)
  if (shouldBuild && random() < 0.1) {
    return true;
  }
  
  return shouldBuild && random() < 0.3; // 30% chance per month if conditions met
}

/**
 * Task 6.2: Start data center construction project
 */
export function startDataCenterConstruction(
  org: Organization, 
  state: GameState,
  random: () => number = Math.random
): void {
  // Capacity: 100-200 PF for private orgs
  const baseCapacity = org.priorities.capabilityRace > 0.7 ? 150 : 100;
  const capacity = baseCapacity + random() * 100;
  
  // Construction time: 24-72 months
  // Larger DCs take longer
  const baseTime = 24;
  const sizeMultiplier = (capacity / 100) * 12; // +12 months per 100 PF
  const constructionTime = Math.floor(baseTime + sizeMultiplier + random() * 24);
  
  // Cost: 50x monthly revenue
  const cost = 50 * org.monthlyRevenue;
  
  const project: OrganizationProject = {
    id: `dc_${org.id}_${state.currentMonth}`,
    type: 'datacenter_construction',
    startMonth: state.currentMonth,
    completionMonth: state.currentMonth + constructionTime,
    progress: 0,
    capitalInvested: cost,
    computeReserved: 0,
    expectedDataCenterCapacity: capacity,
    canBeCanceled: true,
    cancellationPenalty: 0.5 // Lose 50% if canceled
  };
  
  org.currentProjects.push(project);
  
  // Pay 30% upfront
  org.capital -= cost * 0.3;
  
  console.log(`📍 [Month ${state.currentMonth}] ${org.name} started building DC (${capacity.toFixed(0)} PF, ${constructionTime} months, $${cost.toFixed(1)}M)`);
}

/**
 * Task 6.3: Update all organization projects monthly
 */
export function updateProjects(org: Organization, state: GameState): void {
  const completedProjects: OrganizationProject[] = [];
  
  org.currentProjects.forEach(project => {
    const elapsed = state.currentMonth - project.startMonth;
    const duration = project.completionMonth - project.startMonth;
    project.progress = Math.min(1.0, elapsed / duration);
    
    // Pay monthly costs (remaining 70% spread over construction period)
    if (project.type === 'datacenter_construction') {
      const monthlyCost = (project.capitalInvested * 0.7) / duration;
      org.capital -= monthlyCost;
    }
    
    // Check if completed
    if (state.currentMonth >= project.completionMonth) {
      completedProjects.push(project);
    }
  });
  
  // Complete projects
  completedProjects.forEach(project => {
    completeProject(org, project, state);
  });
  
  // Remove completed projects
  org.currentProjects = org.currentProjects.filter(
    p => state.currentMonth < p.completionMonth
  );
}

/**
 * Task 6.4: Complete a project
 */
export function completeProject(
  org: Organization, 
  project: OrganizationProject, 
  state: GameState
): void {
  if (project.type === 'datacenter_construction') {
    const newDC: DataCenter = {
      id: `${org.id}_dc_${state.currentMonth}`,
      name: `${org.name} Data Center ${org.ownedDataCenters.length + 1}`,
      organizationId: org.id,
      capacity: project.expectedDataCenterCapacity!,
      efficiency: org.type === 'private' ? 1.1 : 
                  org.type === 'government' ? 0.9 : 
                  0.95,
      constructionMonth: project.startMonth,
      completionMonth: state.currentMonth,
      operational: true,
      operationalCost: project.expectedDataCenterCapacity! * 0.015, // 1.5% of capacity per month
      restrictedAccess: org.type !== 'academic',
      allowedAIs: [],
      region: 'domestic'
    };
    
    state.computeInfrastructure.dataCenters.push(newDC);
    org.ownedDataCenters.push(newDC.id);
    
    console.log(`✅ [Month ${state.currentMonth}] ${org.name} completed DC: ${newDC.capacity.toFixed(0)} PF (${state.currentMonth - project.startMonth} months)`);
  }
}

/**
 * Simplified revenue collection (Phase 8 will expand this)
 */
export function collectRevenue(org: Organization, state: GameState): void {
  org.capital += org.monthlyRevenue;
}

/**
 * Simplified expense payment (Phase 8 will expand this)
 */
export function payExpenses(org: Organization, state: GameState): void {
  // Pay base expenses
  org.capital -= org.monthlyExpenses;
  
  // Pay data center operational costs
  const dcCosts = state.computeInfrastructure.dataCenters
    .filter(dc => org.ownedDataCenters.includes(dc.id) && dc.operational)
    .reduce((sum, dc) => sum + dc.operationalCost, 0);
  
  org.capital -= dcCosts;
}

/**
 * Task 6.5: Process organization turn (called monthly)
 */
export function processOrganizationTurn(
  org: Organization, 
  state: GameState,
  random: () => number = Math.random
): void {
  // 1. Update existing projects
  updateProjects(org, state);
  
  // 2. Collect revenue
  collectRevenue(org, state);
  
  // 3. Pay expenses
  payExpenses(org, state);
  
  // 4. Make strategic decisions
  if (shouldBuildDataCenter(org, state, random)) {
    startDataCenterConstruction(org, state, random);
  }
  
  // 5. Check bankruptcy (Phase 8 will handle this fully)
  if (org.capital < -50 && org.type === 'private') {
    console.warn(`⚠️  [Month ${state.currentMonth}] ${org.name} is in financial distress (capital: $${org.capital.toFixed(1)}M)`);
  }
}

/**
 * Task 6.6: Process all organizations (to be called from engine)
 */
export function processAllOrganizations(
  state: GameState,
  random: () => number = Math.random
): void {
  state.organizations.forEach(org => {
    processOrganizationTurn(org, state, random);
  });
}
