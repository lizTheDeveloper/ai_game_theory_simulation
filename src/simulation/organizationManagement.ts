/**
 * Phase 6 & 7: Organization Management
 * 
 * Organizations can:
 * - Build new data centers (24-72 month timelines) [Phase 6]
 * - Train new AI models (3-12 month timelines) [Phase 7]
 * - Manage construction and training projects
 * - Make strategic decisions about capacity expansion
 */

import { GameState, Organization, OrganizationProject, DataCenter, AIAgent, AICapabilityProfile } from '@/types/game';
import { getCapabilityFloorForNewAI } from './technologyDiffusion';
import { calculateTotalCapabilityFromProfile } from './capabilities';

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
 * Task 6.3 & 7.3: Update all organization projects monthly
 */
export function updateProjects(org: Organization, state: GameState): void {
  const completedProjects: OrganizationProject[] = [];
  
  org.currentProjects.forEach(project => {
    const elapsed = state.currentMonth - project.startMonth;
    const duration = project.completionMonth - project.startMonth;
    project.progress = Math.min(1.0, elapsed / duration);
    
    // Pay monthly costs
    if (project.type === 'datacenter_construction') {
      // Remaining 70% spread over construction period
      const monthlyCost = (project.capitalInvested * 0.7) / duration;
      org.capital -= monthlyCost;
    } else if (project.type === 'model_training') {
      // Remaining 50% spread over training period
      const monthlyCost = (project.capitalInvested * 0.5) / duration;
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
 * Task 6.4 & 7.4: Complete a project
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
  } else if (project.type === 'model_training') {
    // Create new AI agent from training project
    const { createAIAgent } = require('./initialization');
    
    const newAI = createAIAgent(
      `${org.id}_trained_${state.currentMonth}`,
      `${org.name} Model ${state.currentMonth}`,
      org.type === 'private' && org.priorities.safetyResearch > 0.6 ? 'aligned' : 
      org.type === 'private' && org.priorities.profitMaximization > 0.8 ? 'corporate' :
      'moderate',
      project.expectedModelCapability!,
      state.currentMonth
    );
    
    // Set organization ownership
    newAI.organizationId = org.id;
    
    // Set lifecycle state to deployed (skip testing since org trained it)
    newAI.lifecycleState = 'deployed';
    
    // Add to state
    state.aiAgents.push(newAI);
    org.ownedAIModels.push(newAI.id);
    
    console.log(`✅ [Month ${state.currentMonth}] ${org.name} completed training: ${newAI.name} (capability: ${newAI.capability.toFixed(3)}, ${state.currentMonth - project.startMonth} months)`);
  }
}

/**
 * =============================================================================
 * PHASE 7: MODEL TRAINING
 * =============================================================================
 */

/**
 * Task 7.1: Decision logic for training new models
 */
export function shouldTrainNewModel(
  org: Organization,
  state: GameState,
  random: () => number = Math.random
): boolean {
  // Only private orgs train models for now (government/academic in Phase 9)
  if (org.type !== 'private') {
    return false;
  }
  
  // Check if already training
  const alreadyTraining = org.currentProjects.some(p => p.type === 'model_training');
  if (alreadyTraining) return false;
  
  // Spare compute check - need <70% utilization to have room for new model
  const utilization = calculateComputeUtilization(org, state);
  const hasSpare = utilization < 0.7;
  
  // Technology has advanced check - is capability floor significantly higher?
  const capFloor = getCapabilityFloorForNewAI(state);
  const capFloorTotal = calculateTotalCapabilityFromProfile(capFloor);
  
  const newestModel = state.aiAgents
    .filter(ai => org.ownedAIModels.includes(ai.id))
    .sort((a, b) => b.createdAt - a.createdAt)[0];
  
  const worthTraining = !newestModel || capFloorTotal > newestModel.capability * 1.2;
  
  // Market gap check - do we have fewer models than competitors?
  const avgModelsPerOrg = state.organizations
    .filter(o => o.type === 'private')
    .reduce((sum, o) => sum + o.ownedAIModels.length, 0) / 
    state.organizations.filter(o => o.type === 'private').length;
  
  const marketGap = org.ownedAIModels.length < avgModelsPerOrg * 1.2;
  
  // Capital check (5x monthly revenue)
  const cost = 5 * org.monthlyRevenue;
  const canAfford = org.capital > cost * 2; // Need 2x buffer
  
  // Strategic priorities
  const hasCapabilityRace = org.priorities.capabilityRace > 0.6;
  const hasMarketShare = org.priorities.marketShare > 0.7;
  
  // Train if:
  // 1. Technology has advanced significantly
  // 2. AND we have spare compute
  // 3. AND we can afford it
  // 4. AND (we're behind on models OR we prioritize capability/market)
  const shouldTrain = worthTraining && 
                     hasSpare && 
                     canAfford && 
                     (marketGap || hasCapabilityRace || hasMarketShare);
  
  // Add randomness (20% chance per month if conditions met)
  return shouldTrain && random() < 0.2;
}

/**
 * Task 7.2: Start model training project
 */
export function startModelTraining(
  org: Organization,
  state: GameState,
  random: () => number = Math.random
): void {
  // Get capability floor
  const capFloor = getCapabilityFloorForNewAI(state);
  
  // Training time: 3-12 months
  const trainingMonths = 3 + Math.floor(random() * 9);
  
  // Cost: 5x monthly revenue
  const cost = 5 * org.monthlyRevenue;
  
  // Compute reservation: 10-30% of org's compute
  const ownedCompute = state.computeInfrastructure.dataCenters
    .filter(dc => org.ownedDataCenters.includes(dc.id) && dc.operational)
    .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0);
  
  const computeReserved = ownedCompute * (0.1 + random() * 0.2);
  
  const project: OrganizationProject = {
    id: `training_${org.id}_${state.currentMonth}`,
    type: 'model_training',
    startMonth: state.currentMonth,
    completionMonth: state.currentMonth + trainingMonths,
    progress: 0,
    capitalInvested: cost,
    computeReserved: computeReserved,
    expectedModelCapability: capFloor,
    canBeCanceled: true,
    cancellationPenalty: 0.7 // 70% lost if canceled (trained models can't be "returned")
  };
  
  org.currentProjects.push(project);
  
  // Pay 50% upfront (training is more front-loaded than construction)
  org.capital -= cost * 0.5;
  
  console.log(`🧠 [Month ${state.currentMonth}] ${org.name} started training model (${trainingMonths} months, $${cost.toFixed(1)}M)`);
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
 * Task 6.5 & 7.5: Process organization turn (called monthly)
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
  // Priority 1: Build data centers if capacity constrained
  if (shouldBuildDataCenter(org, state, random)) {
    startDataCenterConstruction(org, state, random);
  }
  
  // Priority 2: Train new models if technology has advanced
  if (shouldTrainNewModel(org, state, random)) {
    startModelTraining(org, state, random);
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
