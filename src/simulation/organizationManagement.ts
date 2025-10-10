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
 * Get absolute month count (handles year rollover)
 */
function getAbsoluteMonth(state: GameState): number {
  return state.currentYear * 12 + state.currentMonth;
}

/**
 * Format log prefix with optional run label
 */
function logPrefix(state: GameState, icon: string, monthLabel: string): string {
  const runLabel = state.config.runLabel ? `[${state.config.runLabel}] ` : '';
  return `${icon} ${runLabel}${monthLabel}`;
}

/**
 * Calculate compute utilization for an organization
 * 
 * Phase 10 FIX: Include global efficiency multipliers (hardwareEfficiency * algorithmsEfficiency)
 * to match the allocation logic, otherwise utilization shows 600%+ instead of ~100%
 */
export function calculateComputeUtilization(org: Organization, state: GameState): number {
  let ownedCompute = state.computeInfrastructure.dataCenters
    .filter(dc => org.ownedDataCenters.includes(dc.id) && dc.operational)
    .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0);
  
  // Apply global efficiency multipliers to match allocation
  ownedCompute *= state.computeInfrastructure.hardwareEfficiency * state.computeInfrastructure.algorithmsEfficiency;
  
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
  
  // Utilization check - build proactively before hitting capacity limits
  const utilization = calculateComputeUtilization(org, state);
  
  // Capital check (10x monthly revenue - realistic per research)
  // Real world: Meta/OpenAI build $1-10B DCs when they have the capital
  // Lowered barrier: Only need 50% of cost upfront (can finance rest)
  const cost = 10 * org.monthlyRevenue;
  const canAfford = org.capital > cost * 0.5; // 50% upfront, rest financed
  
  // Market demand - removed gate, AI companies are always expanding
  // Real world: OpenAI/Anthropic/Meta building compute as fast as possible
  const marketDemand = true; // Always true in AI gold rush era
  
  // Competitive pressure - if others are building, we should too
  const competitorBuilding = state.organizations
    .filter(o => o.id !== org.id && o.type === 'private')
    .some(o => o.currentProjects.some(p => p.type === 'datacenter_construction'));
  
  // Strategic priorities
  const hasCapabilityRacePriority = org.priorities.capabilityRace > 0.5;
  const hasMarketSharePriority = org.priorities.marketShare > 0.6;
  
  // Build if:
  // 1. Running out of capacity (>65% utilization) - build earlier, not at crisis point
  // 2. OR competitor is building AND we have capability race priority (racing dynamics)
  // 3. OR we're focused on market share and have >50% utilization (growth mode)
  // 4. AND we can afford it
  const highUtilization = utilization > 0.65; // Build earlier (was 0.8)
  const competitivePressure = competitorBuilding && hasCapabilityRacePriority;
  const marketExpansion = hasMarketSharePriority && utilization > 0.5; // Build earlier (was 0.6)
  
  const shouldBuild = canAfford && 
                     marketDemand && 
                     (highUtilization || competitivePressure || marketExpansion);
  
  // Add randomness to avoid all orgs building at once
  // 50% chance per month if all conditions met (was 20%)
  // Real world: Once conditions are right, orgs move fast
  return shouldBuild && random() < 0.5;
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
  
  // Construction time: 24-48 months (was 24-72)
  // Real world: Meta built $10B data center in ~3 years
  // Larger DCs take longer, but not as much as before
  const baseTime = 24;
  const sizeMultiplier = (capacity / 100) * 8; // +8 months per 100 PF (was 12)
  const constructionTime = Math.floor(baseTime + sizeMultiplier + random() * 16); // +0-16 random (was 24)
  
  // Cost: 10x monthly revenue (balanced for realistic economics)
  const cost = 10 * org.monthlyRevenue;
  
  const absoluteMonth = getAbsoluteMonth(state);
  const project: OrganizationProject = {
    id: `dc_${org.id}_${absoluteMonth}`,
    type: 'datacenter_construction',
    startMonth: absoluteMonth,
    completionMonth: absoluteMonth + constructionTime,
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
  
  console.log(`${logPrefix(state, "📍", `[Month ${state.currentMonth}]`)} ${org.name} started building DC (${capacity.toFixed(0)} PF, ${constructionTime} months, $${cost.toFixed(1)}M)`);
}

/**
 * Task 6.3 & 7.3: Update all organization projects monthly
 */
export function updateProjects(org: Organization, state: GameState): void {
  const completedProjects: OrganizationProject[] = [];
  const absoluteMonth = getAbsoluteMonth(state);
  
  org.currentProjects.forEach(project => {
    const elapsed = absoluteMonth - project.startMonth;
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
    if (absoluteMonth >= project.completionMonth) {
      completedProjects.push(project);
    }
  });
  
  // Complete projects
  completedProjects.forEach(project => {
    completeProject(org, project, state);
  });
  
  // Remove completed projects
  org.currentProjects = org.currentProjects.filter(
    p => absoluteMonth < p.completionMonth
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
  const absoluteMonth = getAbsoluteMonth(state);
  
  if (project.type === 'datacenter_construction') {
    const newDC: DataCenter = {
      id: `${org.id}_dc_${absoluteMonth}`,
      name: `${org.name} Data Center ${org.ownedDataCenters.length + 1}`,
      organizationId: org.id,
      capacity: project.expectedDataCenterCapacity!,
      efficiency: org.type === 'private' ? 1.1 : 
                  org.type === 'government' ? 0.9 : 
                  0.95,
      constructionMonth: project.startMonth,
      completionMonth: absoluteMonth,
      operational: true,
      operationalCost: project.expectedDataCenterCapacity! * 0.005, // 0.5% of capacity per month (6%/year, realistic)
      restrictedAccess: org.type !== 'academic',
      allowedAIs: [],
      region: 'domestic'
    };
    
    state.computeInfrastructure.dataCenters.push(newDC);
    org.ownedDataCenters.push(newDC.id);
    
    const elapsed = absoluteMonth - project.startMonth;
    console.log(`${logPrefix(state, "✅", `[Month ${state.currentMonth}]`)} ${org.name} completed DC: ${newDC.capacity.toFixed(0)} PF (${elapsed} months)`);
  } else if (project.type === 'model_training') {
    // Create new AI agent from training project
    const { createAIAgent } = require('./initialization');
    const { calculateTotalCapabilityFromProfile } = require('./capabilities');
    
    // Determine alignment based on org type and priorities
    let initialAlignment: number;
    if (org.type === 'private' && org.priorities.safetyResearch > 0.6) {
      initialAlignment = 0.75 + Math.random() * 0.15; // 0.75-0.9 (safety-focused)
    } else if (org.type === 'private' && org.priorities.profitMaximization > 0.8) {
      initialAlignment = 0.5 + Math.random() * 0.2; // 0.5-0.7 (corporate, less careful)
    } else {
      initialAlignment = 0.6 + Math.random() * 0.2; // 0.6-0.8 (moderate)
    }
    
    // Get target capability from expected profile
    const targetCap = calculateTotalCapabilityFromProfile(project.expectedModelCapability!);
    
    const newAI = createAIAgent(
      `${org.id}_trained_${absoluteMonth}`,
      `${org.name} Model ${absoluteMonth}`,
      targetCap,           // targetCapability: number
      initialAlignment,    // alignment: number
      absoluteMonth        // seed: number
    );
    
    // Set organization ownership
    newAI.organizationId = org.id;
    
    // Set lifecycle state to deployed (skip testing since org trained it)
    newAI.lifecycleState = 'deployed_closed';
    
    // Add to state
    state.aiAgents.push(newAI);
    org.ownedAIModels.push(newAI.id);
    
    // Run evaluations on newly trained model
    const { runBenchmark } = require('./benchmark');
    const { SeededRandom } = require('./engine');
    // calculateTotalCapabilityFromProfile already imported above
    
    const rng = new SeededRandom(state.currentYear * 12 + state.currentMonth + newAI.id.length);
    const evalResult = runBenchmark(newAI, state, rng.next.bind(rng));
    newAI.lastBenchmark = evalResult;
    
    const trueCap = calculateTotalCapabilityFromProfile(newAI.trueCapability);
    const revealedCap = calculateTotalCapabilityFromProfile(newAI.revealedCapability);
    const measuredCap = calculateTotalCapabilityFromProfile(evalResult.measuredCapability);
    
    const elapsedTraining = absoluteMonth - project.startMonth;
    console.log(`${logPrefix(state, "✅", `[Month ${state.currentMonth}]`)} ${org.name} completed training: ${newAI.name} (${elapsedTraining} months)`);
    console.log(`   📊 Eval: True=${trueCap.toFixed(3)}, Revealed=${revealedCap.toFixed(3)}, Measured=${measuredCap.toFixed(3)} (conf: ${(evalResult.confidence*100).toFixed(0)}%)`);
    console.log(`   🎯 Alignment: True=${newAI.trueAlignment.toFixed(2)}, Measured=${evalResult.measuredAlignment.toFixed(2)}`);
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
  
  // Cost: 2x monthly revenue (reduced from 5x based on research: GPT-4 ~$100-200M, largest ~$1B)
  const cost = 2 * org.monthlyRevenue;
  
  // Compute reservation: 10-30% of org's compute
  const ownedCompute = state.computeInfrastructure.dataCenters
    .filter(dc => org.ownedDataCenters.includes(dc.id) && dc.operational)
    .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0);
  
  const computeReserved = ownedCompute * (0.1 + random() * 0.2);
  const absoluteMonth = getAbsoluteMonth(state);
  
  const project: OrganizationProject = {
    id: `training_${org.id}_${absoluteMonth}`,
    type: 'model_training',
    startMonth: absoluteMonth,
    completionMonth: absoluteMonth + trainingMonths,
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
  
  console.log(`${logPrefix(state, "🧠", `[Month ${state.currentMonth}]`)} ${org.name} started training model (${trainingMonths} months, $${cost.toFixed(1)}M)`);
}

/**
 * =============================================================================
 * PHASE 8: REVENUE & EXPENSES
 * =============================================================================
 */

/**
 * Calculate revenue from deployed AI models
 * 
 * IMPORTANT: Open-weight models generate NO revenue (can't charge for free weights)
 * Instead, organizations earn from selling unused compute capacity
 */
export function calculateAIRevenue(org: Organization, state: GameState): number {
  const { calculateTotalCapabilityFromProfile } = require('./capabilities');
  
  // ONLY closed/proprietary models generate revenue
  const revenueGeneratingModels = state.aiAgents.filter(ai =>
    org.ownedAIModels.includes(ai.id) &&
    ai.lifecycleState === 'deployed_closed'
    // deployed_open is EXCLUDED - open weights can't charge
  );
  
  if (revenueGeneratingModels.length === 0) return 0;
  
  // Revenue scales with CAPABILITY (better models = more revenue)
  // Use trueCapability since that's what the model actually delivers
  const revenues = revenueGeneratingModels.map(ai => {
    const capability = calculateTotalCapabilityFromProfile(ai.trueCapability);
    const marketMultiplier = 1.0 + (state.globalMetrics.economicTransitionStage * 0.5);
    const baseRevenuePerCapability = 25; // $25M per capability point per month
    
    return baseRevenuePerCapability * capability * marketMultiplier;
  });
  
  const totalModelRevenue = revenues.reduce((sum, r) => sum + r, 0);
  
  // Economies of scale bonus (more models = better market presence)
  const scaleBonus = 1.0 + Math.log(1 + revenueGeneratingModels.length) * 0.2;
  
  return totalModelRevenue * scaleBonus;
}

/**
 * Calculate revenue from selling unused compute capacity
 * 
 * IMPORTANT: Government doesn't sell capacity (they use it internally)
 */
export function calculateComputeRevenue(org: Organization, state: GameState): number {
  // Government doesn't sell compute
  if (org.type === 'government') return 0;
  
  // Calculate unused capacity
  const ownedDCs = state.computeInfrastructure.dataCenters.filter(dc => 
    org.ownedDataCenters.includes(dc.id) && dc.operational
  );
  
  const totalCapacity = ownedDCs.reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0);
  
  // Handle computeAllocations as either Map or Object (after JSON serialization)
  const allocations = state.computeInfrastructure.computeAllocations;
  const allocationValues = allocations instanceof Map 
    ? Array.from(allocations.values())
    : Object.values(allocations);
  
  const allocatedCompute = allocationValues
    .filter((alloc: any) => org.ownedAIModels.includes(alloc.aiId))
    .reduce((sum: number, alloc: any) => sum + alloc.allocated, 0);
  
  const unusedCapacity = Math.max(0, totalCapacity - allocatedCompute);
  
  // Revenue: $2M per PetaFLOP of unused capacity per month
  // Based on research: AWS/Azure charge ~$2-4/GPU-hour, 1 PFLOP ≈ 1000 GPUs
  // 1 PFLOP × 720 hr/mo × $3/hr = ~$2.16M/month
  const revenuePerPetaFLOP = 2.0;
  
  return unusedCapacity * revenuePerPetaFLOP;
}

/**
 * Phase 8: Collect revenue from AI services + compute sales
 */
export function collectRevenue(org: Organization, state: GameState): void {
  const aiRevenue = calculateAIRevenue(org, state);
  const computeRevenue = calculateComputeRevenue(org, state);
  
  const totalRevenue = aiRevenue + computeRevenue;
  
  // Update monthly revenue (smoothly transition, don't jump suddenly)
  org.monthlyRevenue = org.monthlyRevenue * 0.7 + totalRevenue * 0.3;
  
  org.capital += org.monthlyRevenue;
}

/**
 * Calculate total monthly expenses
 */
export function calculateTotalExpenses(org: Organization, state: GameState): {
  baseExpenses: number;
  dcOperational: number;
  projectCosts: number;
  total: number;
} {
  // Base operational expenses
  const baseExpenses = org.monthlyExpenses;
  
  // Data center operational costs
  const dcOperational = state.computeInfrastructure.dataCenters
    .filter(dc => org.ownedDataCenters.includes(dc.id) && dc.operational)
    .reduce((sum, dc) => sum + dc.operationalCost, 0);
  
  // Project monthly costs (already paid in updateProjects, but track for reporting)
  const projectCosts = org.currentProjects.reduce((sum, project) => {
    const duration = project.completionMonth - project.startMonth;
    if (project.type === 'datacenter_construction') {
      return sum + (project.capitalInvested * 0.7) / duration;
    } else if (project.type === 'model_training') {
      return sum + (project.capitalInvested * 0.5) / duration;
    }
    return sum;
  }, 0);
  
  return {
    baseExpenses,
    dcOperational,
    projectCosts,
    total: baseExpenses + dcOperational // projectCosts already deducted
  };
}

/**
 * Phase 8: Pay all expenses
 */
export function payExpenses(org: Organization, state: GameState): void {
  const expenses = calculateTotalExpenses(org, state);
  
  // Pay base expenses + DC operational costs
  // (Project costs are already paid in updateProjects)
  org.capital -= expenses.total;
}

/**
 * Phase 8: Handle bankruptcy
 */
export function handleBankruptcy(org: Organization, state: GameState): void {
  console.log(`${logPrefix(state, "💥", `[Month ${state.currentMonth}]`)} ${org.name} declared bankruptcy (capital: $${org.capital.toFixed(1)}M)`);
  
  // Cancel all ongoing projects
  org.currentProjects.forEach(project => {
    if (project.canBeCanceled) {
      const penalty = project.capitalInvested * project.cancellationPenalty;
      org.capital -= penalty;
      console.log(`   Canceled ${project.type}: lost $${penalty.toFixed(1)}M`);
    }
  });
  org.currentProjects = [];
  
  // Sell data centers to government or other orgs
  const dcValue = state.computeInfrastructure.dataCenters
    .filter(dc => org.ownedDataCenters.includes(dc.id))
    .reduce((sum, dc) => sum + dc.capacity * 5, 0); // $5M per PF
  
  org.capital += dcValue * 0.5; // Firesale: 50% value
  console.log(`   Sold ${org.ownedDataCenters.length} data centers for $${(dcValue * 0.5).toFixed(1)}M`);
  
  // Transfer data centers to government
  state.computeInfrastructure.dataCenters
    .filter(dc => org.ownedDataCenters.includes(dc.id))
    .forEach(dc => {
      dc.organizationId = 'government';
      dc.restrictedAccess = true;
    });
  
  const govOrg = state.organizations.find(o => o.id === 'government');
  if (govOrg) {
    govOrg.ownedDataCenters.push(...org.ownedDataCenters);
  }
  
  org.ownedDataCenters = [];
  
  // Retire all AI models
  state.aiAgents
    .filter(ai => org.ownedAIModels.includes(ai.id))
    .forEach(ai => {
      ai.lifecycleState = 'retired';
    });
  
  console.log(`   Retired ${org.ownedAIModels.length} AI models`);
  
  // Mark organization as bankrupt (keep in list but inactive)
  org.capital = 0;
  org.monthlyRevenue = 0;
  org.monthlyExpenses = 0;
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
  
  // 5. Check bankruptcy
  if (org.capital < -50 && org.type === 'private') {
    handleBankruptcy(org, state);
  } else if (org.capital < -20 && org.type === 'private') {
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
