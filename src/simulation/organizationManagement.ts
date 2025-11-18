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
import { assertFinite, assertInRange, assertProbability, assertStateProperty } from './utils/assertions';

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
 *
 * PERFORMANCE FIX (Nov 10, 2025): O(n²) → O(n) optimization
 * Root cause: .filter(x => array.includes(x.id)) creates nested loops
 * Impact: 100,000 operations per step (50 agents × 200 orgs × 2 calls)
 * Solution: Build ownership index once (O(n)), use O(1) Set lookups
 * Result: 70× reduction in operations (100,000 → 1,400)
 */
export function calculateComputeUtilization(org: Organization, state: GameState): number {
  // PERFORMANCE: Build ownership index O(n) once, not O(n*m) for every filter
  // Before: org.ownedDataCenters.includes(dc.id) was O(m) per datacenter
  // After: ownedDCSet.has(dc.id) is O(1) per datacenter
  const ownedDCSet = new Set(org.ownedDataCenters);
  const ownedAISet = new Set(org.ownedAIModels);

  // O(n) scan with O(1) membership test = O(n) total
  let ownedCompute = state.computeInfrastructure.dataCenters
    .filter(dc => ownedDCSet.has(dc.id) && dc.operational)
    .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0);

  // Apply global efficiency multipliers to match allocation
  ownedCompute *= state.computeInfrastructure.hardwareEfficiency * state.computeInfrastructure.algorithmsEfficiency;

  // Division by zero protection
  if (ownedCompute === 0) return 0;

  // O(n) scan with O(1) membership test = O(n) total
  const allocatedCompute = state.aiAgents
    .filter(ai => ownedAISet.has(ai.id) && ai.lifecycleState !== 'retired')
    .reduce((sum, ai) => sum + ai.allocatedCompute, 0);

  const utilization = allocatedCompute / ownedCompute;

  return assertFinite(utilization, {
    location: 'calculateComputeUtilization',
    valueName: 'utilization',
    month: state.currentMonth,
    additionalInfo: { org: org.name, allocatedCompute, ownedCompute }
  });
}

/**
 * Task 6.1: Decision logic for building data centers
 */
export function shouldBuildDataCenter(
  org: Organization, 
  state: GameState,
  random: () => number
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
  random: () => number
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

    // Division by zero protection for duration
    if (duration <= 0) {
      throw new Error(
        `❌ Invalid project duration: ${duration}\n` +
        `   Project: ${project.id}\n` +
        `   Org: ${org.name}\n` +
        `   Start: ${project.startMonth}, Completion: ${project.completionMonth}\n` +
        `   This indicates a project initialization bug.`
      );
    }

    project.progress = assertFinite(
      Math.min(1.0, elapsed / duration),
      {
        location: 'updateProjects',
        valueName: 'project.progress',
        month: state.currentMonth,
        additionalInfo: { project: project.id, elapsed, duration }
      }
    );

    // Pay monthly costs
    if (project.type === 'datacenter_construction') {
      // Remaining 70% spread over construction period
      const monthlyCost = assertFinite(
        (project.capitalInvested * 0.7) / duration,
        {
          location: 'updateProjects',
          valueName: 'monthlyCost (DC construction)',
          month: state.currentMonth,
          additionalInfo: { project: project.id, capitalInvested: project.capitalInvested, duration }
        }
      );
      org.capital -= monthlyCost;
    } else if (project.type === 'model_training') {
      // Remaining 50% spread over training period
      const monthlyCost = assertFinite(
        (project.capitalInvested * 0.5) / duration,
        {
          location: 'updateProjects',
          valueName: 'monthlyCost (model training)',
          month: state.currentMonth,
          additionalInfo: { project: project.id, capitalInvested: project.capitalInvested, duration }
        }
      );
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
    // FIX #23 (Oct 22, 2025): Use deterministic RNG from state for reproducibility
    // DETERMINISM FIX (Nov 6, 2025): Replace org.id.length with hashString(org.id)
    // Issue #11: org.id.length is non-deterministic (varies across runs)
    const { SeededRandom } = require('./engine');
    const { hashString } = require('./utils/idGenerator');
    const alignmentRng = new SeededRandom(state.currentYear * 12 + state.currentMonth + hashString(org.id));

    let initialAlignment: number;
    if (org.type === 'private' && org.priorities.safetyResearch > 0.6) {
      initialAlignment = 0.75 + alignmentRng.next() * 0.15; // 0.75-0.9 (safety-focused)
    } else if (org.type === 'private' && org.priorities.profitMaximization > 0.8) {
      initialAlignment = 0.5 + alignmentRng.next() * 0.2; // 0.5-0.7 (corporate, less careful)
    } else {
      initialAlignment = 0.6 + alignmentRng.next() * 0.2; // 0.6-0.8 (moderate)
    }
    
    // Get target capability from expected profile
    const targetCap = calculateTotalCapabilityFromProfile(project.expectedModelCapability!);

    const newAI = createAIAgent(
      `${org.id}_trained_${absoluteMonth}`,
      `${org.name} Model ${absoluteMonth}`,
      targetCap,           // targetCapability: number
      initialAlignment,    // alignment: number
      absoluteMonth,       // seed: number
      () => alignmentRng.next()  // rng: () => number (use SeededRandom from above)
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
    // SeededRandom already imported above at line 235
    // calculateTotalCapabilityFromProfile already imported above
    // hashString already imported above

    // DETERMINISM FIX (Nov 6, 2025): Replace newAI.id.length with hashString(newAI.id)
    const rng = new SeededRandom(state.currentYear * 12 + state.currentMonth + hashString(newAI.id));
    const evalResult = runBenchmark(newAI, state, rng.next.bind(rng));
    newAI.lastBenchmark = evalResult;
    
    const trueCap = calculateTotalCapabilityFromProfile(newAI.trueCapability);
    const revealedCap = calculateTotalCapabilityFromProfile(newAI.revealedCapability);
    const measuredCap = calculateTotalCapabilityFromProfile(evalResult.measuredCapability);

    // FIX #2 (Oct 29, 2025): Update capability frontier after training completion
    // Bug: updateFrontierCapabilities() existed but was NEVER CALLED
    // This caused frontier/floor to stay at 0.000 forever
    const { updateFrontierCapabilities } = require('./technologyDiffusion');
    updateFrontierCapabilities(state, newAI); // Pass AI agent, not capability number

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
  random: () => number
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
  
  // Note: AIAgent doesn't have createdAt field, use capability as proxy for "newest"
  // O(n²) FIX (Nov 13, 2025): Build Set once for O(1) membership test
  const ownedAISet = new Set(org.ownedAIModels);
  const newestModel = state.aiAgents
    .filter(ai => ownedAISet.has(ai.id))
    .sort((a, b) => b.capability - a.capability)[0];
  
  const worthTraining = !newestModel || capFloorTotal > newestModel.capability * 1.2;
  
  // Market gap check - do we have fewer models than competitors?
  const privateOrgs = state.organizations.filter(o => o.type === 'private');
  const totalModels = privateOrgs.reduce((sum, o) => sum + o.ownedAIModels.length, 0);
  const orgCount = privateOrgs.length;

  // Division by zero protection
  const avgModelsPerOrg = orgCount > 0
    ? assertFinite(
        totalModels / orgCount,
        {
          location: 'shouldTrainNewModel',
          valueName: 'avgModelsPerOrg',
          month: state.currentMonth,
          additionalInfo: { totalModels, orgCount }
        }
      )
    : 0;

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
  random: () => number
): void {
  // Get capability floor
  const capFloor = getCapabilityFloorForNewAI(state);

  // Training time: 3-12 months (base)
  let trainingMonths = 3 + Math.floor(random() * 9);

  // === SIDE EFFECT: LAYOFFS SLOW AI TRAINING ===
  // Fewer engineers → longer training runs (coordination overhead, slower debugging)
  // NOTE: workforceMultiplier is genuinely optional (only set when org takes distress measures)
  const workforceMultiplier = assertFinite(
    org.workforceMultiplier !== undefined ? org.workforceMultiplier : 1.0,
    {
      location: 'startAITrainingProject',
      valueName: 'workforceMultiplier',
      month: state.currentMonth,
      additionalInfo: { orgId: org.id }
    }
  );
  if (workforceMultiplier < 1.0) {
    // 10% layoffs → +5% training time
    // 30% layoffs → +15% training time
    const layoffPenalty = (1 - workforceMultiplier) * 0.5; // 0.5x penalty multiplier
    trainingMonths = Math.ceil(trainingMonths * (1 + layoffPenalty));
  }
  
  // Cost: 2x monthly revenue (reduced from 5x based on research: GPT-4 ~$100-200M, largest ~$1B)
  const cost = 2 * org.monthlyRevenue;
  
  // Compute reservation: 10-30% of org's compute
  // O(n²) FIX (Nov 13, 2025): Build Set once for O(1) membership test
  const ownedDCSet = new Set(org.ownedDataCenters);
  const ownedCompute = state.computeInfrastructure.dataCenters
    .filter(dc => ownedDCSet.has(dc.id) && dc.operational)
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
 * Calculate regional population decline for an organization
 * 
 * Organizations care about their LOCAL market, not global population.
 * - US-based orgs (OpenAI, Google, Meta): Care about North America population
 * - EU-based orgs: Care about Europe population  
 * - China-based orgs (Alibaba, Baidu): Care about East Asia population
 * 
 * Determines market region from data center locations.
 */
function calculateRegionalPopulationDecline(org: Organization, state: GameState): number {
  // FIX (Oct 26, 2025): Use REGIONAL populations, not country aggregation
  // Organizations care about their regional market, not individual countries

  // Determine org's primary market from data center locations
  // O(n²) FIX (Nov 13, 2025): Build Set once for O(1) membership test
  const ownedDCSet = new Set(org.ownedDataCenters);
  const orgDataCenters = state.computeInfrastructure.dataCenters.filter(dc =>
    ownedDCSet.has(dc.id)
  );

  // Count data centers by region
  const regionCounts = new Map<string, number>();
  for (const dc of orgDataCenters) {
    const region = dc.region || 'US'; // Default to US if not specified
    regionCounts.set(region, (regionCounts.get(region) || 0) + 1);
  }

  // Find primary region (most data centers)
  let primaryRegionCode = 'US'; // Default
  let maxCount = 0;
  for (const [region, count] of regionCounts) {
    if (count > maxCount) {
      primaryRegionCode = region;
      maxCount = count;
    }
  }

  // Map data center region code to regional population name
  const regionalPopulationName = mapDataCenterRegionToPopulationRegion(primaryRegionCode);

  // FIX (Oct 26, 2025 Phase 2): Use unified PopulationProvider for O(1) cached lookups
  // Replaces O(n) array.find() with O(1) Map.get()
  const { createPopulationProvider } = require('./populationProvider');
  const provider = createPopulationProvider(state);

  // Look up population data via unified provider (O(1) cached)
  const popData = provider.getPopulation(regionalPopulationName);

  if (!popData) {
    // Region not found, fallback to global
    console.warn(`⚠️  Organization ${org.name}: Could not find population for "${regionalPopulationName}", using global`);
    const globalData = provider.getPopulation('Global');
    return globalData ? globalData.decline : 0;
  }

  return popData.decline;
}

/**
 * Map data center region codes to regional population names
 *
 * FIX (Oct 26, 2025): Organizations should track REGIONAL populations
 * Data centers use short codes (US, EU, China), regional populations use full names
 */
function mapDataCenterRegionToPopulationRegion(regionCode: string): string {
  // FIX (Nov 5, 2025): Use canonical RegionName type from populationProvider.ts
  // Regional populations now use standardized names to match RegionName type
  switch (regionCode.toLowerCase()) {
    case 'us':
    case 'united states':
    case 'north america':
    case 'northern america': // Legacy UN statistical name
      return 'North America'; // Canonical name

    case 'eu':
    case 'europe':
      return 'Europe';

    case 'china':
    case 'east asia':
    case 'eastern asia': // Legacy UN statistical name
      return 'East Asia'; // Canonical name

    case 'india':
    case 'south asia':
    case 'southern asia': // Legacy UN statistical name
      return 'South Asia'; // Canonical name

    case 'africa':
    case 'sub-saharan africa':
      return 'Sub-Saharan Africa';

    case 'latin america':
    case 'south america':
      return 'Latin America';

    case 'middle east':
    case 'mena':
      return 'Middle East & North Africa';

    case 'distributed':
    case 'global':
      // Distributed orgs: use global population (weighted average across all regions)
      return 'Global'; // Special case handled in calculateRegionalPopulationDecline

    default:
      // Unknown region, default to North America (most orgs are US-based)
      // FIX (Nov 5, 2025): Use canonical name to match RegionName type
      return 'North America';
  }
}

/**
 * Get countries in a region for market analysis
 * @deprecated Use mapDataCenterRegionToPopulationRegion instead for regional tracking
 */
function getCountriesInRegion(region: string): import('@/types/countryPopulations').CountryName[] {
  switch (region.toLowerCase()) {
    case 'us':
    case 'united states':
    case 'north america':
      return ['United States', 'Canada'];

    case 'eu':
    case 'europe':
      return ['United Kingdom', 'France', 'Germany'];

    case 'china':
    case 'east asia':
      return ['China', 'Japan'];

    case 'india':
    case 'south asia':
      return ['India', 'Bangladesh', 'Pakistan'];

    case 'distributed':
    case 'global':
      // Distributed orgs care about top 5 economies
      return ['United States', 'China', 'India', 'Japan', 'Germany'];

    default:
      // Unknown region, assume US
      return ['United States', 'Canada'];
  }
}

/**
 * Calculate revenue from deployed AI models
 * 
 * IMPORTANT: Open-weight models generate NO revenue (can't charge for free weights)
 * Instead, organizations earn from selling unused compute capacity
 * 
 * NEW (Oct 13, 2025): Revenue penalized during population collapse
 * - No customers when people are dying
 * - Infrastructure fails during cascading crises
 */
export function calculateAIRevenue(org: Organization, state: GameState): number {
  const { calculateTotalCapabilityFromProfile } = require('./capabilities');

  // O(n²) FIX (Nov 13, 2025): Build Set once for O(1) membership test
  const ownedAISet = new Set(org.ownedAIModels);

  // ONLY closed/proprietary models generate revenue
  const revenueGeneratingModels = state.aiAgents.filter(ai =>
    ownedAISet.has(ai.id) &&
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
  
  let baseRevenue = totalModelRevenue * scaleBonus;
  
  // === NEW: CRISIS REVENUE PENALTIES (Oct 13, 2025) ===
  // Organizations can't make money when customers are dying and infrastructure is failing
  
  // 1. POPULATION COLLAPSE PENALTY
  // When people die, there are fewer customers
  // NEW (Oct 13, 2025): Use REGIONAL population, not global!
  // Google cares about US/EU population, Alibaba cares about Asia
  const regionalPopulationDecline = calculateRegionalPopulationDecline(org, state);

  if (regionalPopulationDecline > 0.30) {
    // 30%+ REGIONAL population decline → revenue drops proportionally
    // If 80% of local customers died, revenue drops 80%
    const revenueLoss = assertProbability(
      Math.min(0.95, regionalPopulationDecline * 0.8),
      {
        location: 'calculateAIRevenue',
        valueName: 'revenueLoss (population collapse)',
        month: state.currentMonth,
        additionalInfo: { org: org.name, regionalPopulationDecline }
      }
    );
    baseRevenue *= (1 - revenueLoss);
  }
  
  // 2. FOOD CRISIS PENALTY
  // Starving people don't buy AI services
  // Note: foodSecurity not in EnvironmentalAccumulation, use climate stability as proxy
  const foodSecurity = state.environmentalAccumulation.climateStability;
  if (foodSecurity < 0.4) {
    const foodCrisisSeverity = (0.4 - foodSecurity) / 0.4; // 0-1 scale
    baseRevenue *= (1 - foodCrisisSeverity * 0.5); // Up to 50% revenue loss
  }
  
  // 3. INFRASTRUCTURE COLLAPSE PENALTY
  // Cascading crises disrupt supply chains, power grids, internet
  const env = state.environmentalAccumulation;
  const crisisCount = [
    env.resourceCrisisActive,
    env.climateCrisisActive,
    state.socialAccumulation.institutionalFailureActive,
    state.socialAccumulation.socialUnrestActive,
    state.technologicalRisk.controlLossActive
  ].filter(Boolean).length;
  
  if (crisisCount >= 4) {
    // 4+ active crises → infrastructure failing
    const infrastructurePenalty = Math.min(0.70, (crisisCount - 3) * 0.20); // 20-70% loss
    baseRevenue *= (1 - infrastructurePenalty);
  }
  
  // 4. CASCADE COLLAPSE PENALTY
  // During tipping point cascade, everything breaks down
  if (state.planetaryBoundariesSystem.cascadeActive) {
    const cascadeSeverity = assertStateProperty(
      state.planetaryBoundariesSystem,
      'cascadeSeverity',
      {
        location: 'calculateOrgRevenue:cascadeImpact',
        month: state.currentMonth
      }
    );
    baseRevenue *= (1 - cascadeSeverity * 0.40); // Up to 40% additional loss
  }
  
  return Math.max(0, baseRevenue);
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
  // O(n²) FIX (Nov 13, 2025): Build Set once for O(1) membership test
  const ownedDCSet = new Set(org.ownedDataCenters);
  const ownedDCs = state.computeInfrastructure.dataCenters.filter(dc =>
    ownedDCSet.has(dc.id) && dc.operational
  );
  
  const totalCapacity = ownedDCs.reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0);
  
  // Handle computeAllocations as either Map or Object (after JSON serialization)
  const allocations = state.computeInfrastructure.computeAllocations;
  // FIX (Nov 7, 2025): Sort for deterministic iteration (Issue #11)
  const allocationValues = allocations instanceof Map
    ? Array.from(allocations.entries()).sort((a, b) => String(a[0]).localeCompare(String(b[0]))).map(e => e[1])
    : Object.entries(allocations).sort((a, b) => a[0].localeCompare(b[0])).map(e => e[1]);

  // O(n²) FIX (Nov 13, 2025): Build Set once for O(1) membership test
  const ownedAISet = new Set(org.ownedAIModels);
  const allocatedCompute = allocationValues
    .filter((alloc: any) => ownedAISet.has(alloc.aiId))
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
  // P0.2 FIX: Bankrupt organizations cannot generate revenue
  // Check if organization is bankrupt (capital = 0, revenue = 0, no data centers)
  if (org.capital === 0 && org.monthlyRevenue === 0 && org.ownedDataCenters.length === 0) {
    // Organization is bankrupt - no revenue generation possible
    return;
  }

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
  // FIX (Oct 13, 2025 v2): Expenses as % of revenue (realistic business model)
  // Real companies: 70-90% of revenue goes to expenses, 10-30% profit margin
  // Expenses: payroll, R&D, facilities, marketing, legal, failed products, dividends

  // Get current monthly revenue (REQUIRED field - if missing, initialization bug)
  // EXCEPTION: Government organizations can have monthlyRevenue = 0 (taxpayer-funded)
  if (org.monthlyRevenue === undefined || org.monthlyRevenue === null || !isFinite(org.monthlyRevenue)) {
    throw new Error(
      `❌ Missing or invalid org.monthlyRevenue in calculateMonthlyExpenses\n` +
      `   Org: ${org.name}\n` +
      `   Value: ${org.monthlyRevenue}\n` +
      `   Expected: finite number >= 0 (0 allowed for government orgs)\n` +
      `   This is required field in Organization type`
    );
  }

  // If government organization with no revenue, return fixed expenses
  if (org.type === 'government' && org.monthlyRevenue === 0) {
    // Government orgs have fixed expenses set in initialization
    const fixedExpenses = assertStateProperty(
      org,
      'monthlyExpenses',
      {
        location: 'calculateOrgExpenses:governmentFixedExpenses',
        month: state.currentMonth
      }
    );
    return {
      baseExpenses: fixedExpenses,
      dcOperational: 0,
      projectCosts: 0,
      total: fixedExpenses
    };
  }

  const monthlyRevenue = org.monthlyRevenue;
  
  // === PROFIT MARGIN BASED ON COMPANY STAGE ===
  // Growth-stage (low capital): 10% margin (aggressive reinvestment)
  // Mature (high capital): 25% margin (more conservative)
  const isGrowthStage = org.capital < 500; // < $500M = still growing aggressively
  const profitMargin = isGrowthStage ? 0.10 : 0.25;

  // Base expenses = (1 - margin) * revenue
  // Example: $1000M revenue, 20% margin → $800M expenses, $200M profit
  let baseExpenses = monthlyRevenue * (1 - profitMargin);

  // === APPLY COST-CUTTING MULTIPLIERS ===
  // Layoffs reduce workforce → lower payroll (45% of base expenses)
  // R&D cuts reduce research budget (20% of base expenses)
  // NOTE: These are genuinely optional (only set when org takes distress measures)
  const workforceMultiplier = assertFinite(
    org.workforceMultiplier !== undefined ? org.workforceMultiplier : 1.0,
    {
      location: 'calculateOrganizationExpenses',
      valueName: 'workforceMultiplier',
      month: state.currentMonth,
      additionalInfo: { orgId: org.id }
    }
  );
  const rdBudgetMultiplier = assertFinite(
    org.rdBudgetMultiplier !== undefined ? org.rdBudgetMultiplier : 1.0,
    {
      location: 'calculateOrganizationExpenses',
      valueName: 'rdBudgetMultiplier',
      month: state.currentMonth,
      additionalInfo: { orgId: org.id }
    }
  );

  const payrollExpenses = baseExpenses * 0.45;
  const rdExpenses = baseExpenses * 0.20;
  const otherExpenses = baseExpenses * 0.35; // Sales, legal, facilities, etc.

  // Apply cuts
  const adjustedPayroll = payrollExpenses * workforceMultiplier;
  const adjustedRD = rdExpenses * rdBudgetMultiplier;

  // Recalculate base expenses after cuts
  baseExpenses = adjustedPayroll + adjustedRD + otherExpenses;
  
  // === EXPENSE BREAKDOWN (for realism, but we use aggregate) ===
  // - Payroll: 40-50% of revenue (engineers, researchers, execs)
  // - R&D: 15-25% (training models, safety research, experiments)
  // - Infrastructure: 10-15% (data centers, cloud, facilities)
  // - Sales/Marketing: 10-20% (customer acquisition)
  // - Legal/Compliance: 2-5% (regulations, IP, lawsuits)
  // - Failed products: 5-10% (not all bets pay off)
  // - Shareholder returns: 5-10% (dividends, buybacks if profitable)
  
  // === DATA CENTER OPERATIONAL COSTS (additional) ===
  // O(n²) FIX (Nov 13, 2025): Build Set once for O(1) membership test
  const ownedDCSet = new Set(org.ownedDataCenters);
  let dcOperational = state.computeInfrastructure.dataCenters
    .filter(dc => ownedDCSet.has(dc.id) && dc.operational)
    .reduce((sum, dc) => sum + dc.operationalCost, 0);
  
  // === PROJECT COSTS (already paid, track for reporting) ===
  const projectCosts = org.currentProjects.reduce((sum, project) => {
    const duration = project.completionMonth - project.startMonth;

    // Division by zero protection
    if (duration <= 0) {
      console.warn(
        `⚠️  Invalid project duration in calculateTotalExpenses\n` +
        `   Project: ${project.id}, Org: ${org.name}\n` +
        `   Duration: ${duration} (start: ${project.startMonth}, end: ${project.completionMonth})\n` +
        `   Skipping project cost calculation.`
      );
      return sum;
    }

    if (project.type === 'datacenter_construction') {
      const cost = assertFinite(
        (project.capitalInvested * 0.7) / duration,
        {
          location: 'calculateTotalExpenses',
          valueName: 'project cost (DC construction)',
          month: state.currentMonth,
          additionalInfo: { project: project.id, capitalInvested: project.capitalInvested, duration }
        }
      );
      return sum + cost;
    } else if (project.type === 'model_training') {
      const cost = assertFinite(
        (project.capitalInvested * 0.5) / duration,
        {
          location: 'calculateTotalExpenses',
          valueName: 'project cost (model training)',
          month: state.currentMonth,
          additionalInfo: { project: project.id, capitalInvested: project.capitalInvested, duration }
        }
      );
      return sum + cost;
    }
    return sum;
  }, 0);
  
  // === CRISIS EXPENSE MULTIPLIERS ===
  // During collapse, costs spike (emergency operations, supply chain chaos)
  const env = state.environmentalAccumulation;
  const crisisCount = [
    env.resourceCrisisActive,
    env.climateCrisisActive,
    state.socialAccumulation.institutionalFailureActive,
    state.socialAccumulation.socialUnrestActive,
    state.technologicalRisk.controlLossActive
  ].filter(Boolean).length;
  
  if (crisisCount >= 4) {
    // 4+ crises: +100% expenses (emergency mode, everything costs double)
    baseExpenses *= 2.0;
    dcOperational *= 1.5; // DC costs also spike
  } else if (crisisCount >= 3) {
    // 3 crises: +50% expenses
    baseExpenses *= 1.5;
    dcOperational *= 1.3;
  } else if (crisisCount >= 2) {
    // 2 crises: +20% expenses
    baseExpenses *= 1.2;
  }
  
  // === POPULATION COLLAPSE MULTIPLIER ===
  // Workforce dying → hire replacements at premium, emergency contractors
  const regionalPopulationDecline = calculateRegionalPopulationDecline(org, state);
  if (regionalPopulationDecline > 0.50) {
    // 50%+ workforce dead → 2-3x labor costs for survivors
    const laborMultiplier = 1 + (regionalPopulationDecline * 2); // 1.0x → 3.0x
    baseExpenses *= laborMultiplier;
  }
  
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
 * NEW (Oct 30, 2025): Corporate turnaround strategy during financial distress
 *
 * Organizations take progressive cost-cutting measures BEFORE bankruptcy:
 * 1. R&D budget cuts (20-40% reduction)
 * 2. Executive compensation cuts (symbolic)
 * 3. Layoffs (10-20% workforce reduction)
 * 4. Project cancellations (in-development AI models)
 * 5. Asset sales (data center divestment)
 *
 * Research:
 * - 2008 financial crisis: Widespread layoffs, R&D cuts before asset sales
 * - Tech layoffs 2022-2023: Meta (11K), Google (12K), Amazon (27K)
 * - IBM sold server business (2014), GE sold divisions (2020)
 * - Corporate restructuring playbook: Cut costs before selling assets
 *
 * Triggers:
 * - Capital < 6 months expenses (cash crunch)
 * - Negative cash flow (monthlyRevenue < monthlyExpenses)
 * - Operating margin < 10% (profitability crisis)
 *
 * Progressive escalation:
 * - Month 1 of distress: R&D cuts, exec comp cuts
 * - Month 2: Project cancellations
 * - Month 3: Layoffs (10-15%)
 * - Month 4: Asset sales (data centers)
 * - Month 5+: Deeper layoffs (15-20% more)
 *
 * Side effects:
 * - Layoffs: Slower AI training, reduced research capacity
 * - R&D cuts: Delayed breakthrough deployments
 * - Project cancellations: Lost competitive position
 */
export function handleFinancialDistress(org: Organization, state: GameState): void {
  // Only private orgs take turnaround measures (government/academic have different dynamics)
  if (org.type !== 'private') return;

  // Check if already bankrupt
  if (org.bankrupt) return;

  // === INITIALIZE TRACKING FIELDS ===
  if (org.workforceMultiplier === undefined) org.workforceMultiplier = 1.0;
  if (org.rdBudgetMultiplier === undefined) org.rdBudgetMultiplier = 1.0;
  if (org.distressMeasuresTaken === undefined) org.distressMeasuresTaken = [];
  if (org.lastDistressMonth === undefined) org.lastDistressMonth = -999;

  // === FINANCIAL DISTRESS TRIGGERS ===

  const expenses = calculateTotalExpenses(org, state);
  const monthlyBurnRate = expenses.total;
  const monthlyNetIncome = org.monthlyRevenue - monthlyBurnRate;

  // Trigger 1: Capital < 6 months expenses (cash crunch)
  const monthsOfRunway = monthlyBurnRate > 0 ? org.capital / monthlyBurnRate : 999;
  const cashCrunch = monthsOfRunway < 6;

  // Trigger 2: Negative cash flow (losing money monthly)
  const negativeCashFlow = monthlyNetIncome < 0;

  // Trigger 3: Operating margin < 10% (profitability crisis)
  const operatingMargin = org.monthlyRevenue > 0 ? monthlyNetIncome / org.monthlyRevenue : -1;
  const profitabilityCrisis = operatingMargin < 0.10;

  // Only take action if multiple stress indicators present
  const distressIndicators = [cashCrunch, negativeCashFlow, profitabilityCrisis].filter(Boolean).length;
  if (distressIndicators < 2) {
    // Not in distress - reset tracking
    org.distressMeasuresTaken = [];
    org.lastDistressMonth = -999;
    return;
  }

  // === DETERMINE DISTRESS DURATION (for progressive escalation) ===
  const absoluteMonth = getAbsoluteMonth(state);
  const isNewDistressPeriod = absoluteMonth > org.lastDistressMonth + 1; // Gap in distress = reset

  if (isNewDistressPeriod) {
    // New distress period - reset measures
    org.distressMeasuresTaken = [];
    org.lastDistressMonth = absoluteMonth;
  } else {
    // Continuing distress - update month
    org.lastDistressMonth = absoluteMonth;
  }

  const monthsInDistress = isNewDistressPeriod ? 1 : org.distressMeasuresTaken.length + 1;

  console.log(`\n💸 FINANCIAL DISTRESS: ${org.name}`);
  console.log(`   Indicators: ${distressIndicators}/3 (capital: $${org.capital.toFixed(1)}M, runway: ${monthsOfRunway.toFixed(1)} months)`);
  console.log(`   Months in distress: ${monthsInDistress}`);

  let capitalSaved = 0;
  let capitalRaised = 0;
  const measuresTakenThisMonth: string[] = [];

  // === PROGRESSIVE TURNAROUND MEASURES ===

  // MEASURE 1: R&D BUDGET CUTS (Month 1+)
  // Immediate expense reduction, delays AI development
  if (monthsInDistress >= 1 && !org.distressMeasuresTaken.includes('rd_cuts')) {
    const cutAmount = monthsOfRunway < 3 ? 0.40 : 0.25; // Desperate = deeper cuts
    org.rdBudgetMultiplier *= (1 - cutAmount);

    // R&D is ~20% of base expenses (see calculateTotalExpenses)
    const rdExpenses = expenses.baseExpenses * 0.20;
    const monthlySavings = rdExpenses * cutAmount;
    capitalSaved += monthlySavings;

    console.log(`   ✂️  R&D BUDGET CUT: -${(cutAmount * 100).toFixed(0)}% (saves $${monthlySavings.toFixed(1)}M/month)`);
    console.log(`       Side effect: AI training timelines extended, breakthrough deployments delayed`);

    measuresTakenThisMonth.push('rd_cuts');
  }

  // MEASURE 2: EXECUTIVE COMPENSATION CUTS (Month 1+)
  // Symbolic savings, improves morale vs layoffs
  if (monthsInDistress >= 1 && !org.distressMeasuresTaken.includes('exec_comp_cuts')) {
    // Execs are ~2-5% of payroll
    const execExpenses = expenses.baseExpenses * 0.03;
    const cutAmount = 0.30; // 30% exec comp cut
    const monthlySavings = execExpenses * cutAmount;
    capitalSaved += monthlySavings;

    console.log(`   💼 EXECUTIVE COMP CUT: -30% (saves $${monthlySavings.toFixed(1)}M/month, symbolic gesture)`);

    measuresTakenThisMonth.push('exec_comp_cuts');
  }

  // MEASURE 3: PROJECT CANCELLATIONS (Month 2+)
  // Cancel in-development AI models, recover some sunk costs
  if (monthsInDistress >= 2 && !org.distressMeasuresTaken.includes('project_cancellations')) {
    const trainingProjects = org.currentProjects.filter(p => p.type === 'model_training' && p.canBeCanceled);

    if (trainingProjects.length > 0) {
      // Cancel lowest-progress projects first (less sunk cost)
      const sortedProjects = [...trainingProjects].sort((a, b) => a.progress - b.progress);
      const toCancel = sortedProjects.slice(0, Math.min(2, trainingProjects.length));

      // O(n²) FIX: Build Set once for O(1) lookup, filter once at end
      const cancelSet = new Set<string>();

      toCancel.forEach(project => {
        const recoveredCapital = project.capitalInvested * (1 - project.cancellationPenalty) * (1 - project.progress);
        capitalRaised += recoveredCapital;
        cancelSet.add(project.id);

        console.log(`   ❌ PROJECT CANCELED: ${project.id} (recovered $${recoveredCapital.toFixed(1)}M)`);
      });

      // O(n): Single filter pass using Set lookup
      org.currentProjects = org.currentProjects.filter(p => !cancelSet.has(p.id));

      console.log(`       Side effect: Lost competitive position, delayed product launches`);
      measuresTakenThisMonth.push('project_cancellations');
    }
  }

  // MEASURE 4: LAYOFFS (Month 3+)
  // Reduce workforce 10-15%, slows AI training and research
  if (monthsInDistress >= 3 && !org.distressMeasuresTaken.includes('layoffs_initial')) {
    const layoffPercent = monthsOfRunway < 3 ? 0.15 : 0.10; // Desperate = deeper cuts
    org.workforceMultiplier *= (1 - layoffPercent);

    // Payroll is ~45% of base expenses (see calculateTotalExpenses breakdown)
    const payrollExpenses = expenses.baseExpenses * 0.45;
    const monthlySavings = payrollExpenses * layoffPercent;
    capitalSaved += monthlySavings;

    // Derive employee count from revenue (tech companies: ~$500K revenue per employee)
    const annualRevenuePerEmployee = 500; // $500K/year = realistic for tech (Google/Meta)
    const totalEmployees = (org.monthlyRevenue * 12) / annualRevenuePerEmployee;
    const layoffCount = Math.floor(totalEmployees * layoffPercent);

    console.log(`   📉 LAYOFFS: -${(layoffPercent * 100).toFixed(0)}% workforce (~${layoffCount} employees, saves $${monthlySavings.toFixed(1)}M/month)`);
    console.log(`       Side effect: Slower AI training, reduced research capacity`);

    measuresTakenThisMonth.push('layoffs_initial');
  }

  // MEASURE 5: DEEPER LAYOFFS (Month 5+)
  // Additional 15-20% cuts if still in distress
  if (monthsInDistress >= 5 && !org.distressMeasuresTaken.includes('layoffs_deeper')) {
    const layoffPercent = 0.18; // 18% more
    org.workforceMultiplier *= (1 - layoffPercent);

    const payrollExpenses = expenses.baseExpenses * 0.45;
    const monthlySavings = payrollExpenses * layoffPercent;
    capitalSaved += monthlySavings;

    const annualRevenuePerEmployee = 500;
    const totalEmployees = (org.monthlyRevenue * 12) / annualRevenuePerEmployee;
    const layoffCount = Math.floor(totalEmployees * layoffPercent);

    console.log(`   📉 DEEPER LAYOFFS: -${(layoffPercent * 100).toFixed(0)}% more (~${layoffCount} employees, saves $${monthlySavings.toFixed(1)}M/month)`);
    console.log(`       ⚠️  WARNING: Organization approaching minimum viable workforce`);

    measuresTakenThisMonth.push('layoffs_deeper');
  }

  // MEASURE 6: ASSET SALES (Month 4+, or immediately if runway < 3 months)
  // Sell data centers to raise capital, reduce operational costs
  const shouldDivestAssets = (monthsInDistress >= 4 || monthsOfRunway < 3) && !org.distressMeasuresTaken.includes('asset_sales');

  if (shouldDivestAssets) {
    // O(n²) FIX (Nov 13, 2025): Build Set once for O(1) membership test
    const ownedDCSet = new Set(org.ownedDataCenters);
    const ownedDCs = state.computeInfrastructure.dataCenters.filter(dc =>
      ownedDCSet.has(dc.id) && dc.operational
    );

    // Don't divest if you only have 1 DC (that's core infrastructure)
    if (ownedDCs.length > 1) {
      // Sort by capacity (sell smallest/non-strategic first)
      const sortedDCs = [...ownedDCs].sort((a, b) => a.capacity - b.capacity);

      // Sell 1-2 DCs max per month (don't fire-sale everything)
      const maxToSell = monthsOfRunway < 3 ? 2 : 1; // More desperate = sell faster
      const dcsToSell = sortedDCs.slice(0, Math.min(maxToSell, Math.floor(ownedDCs.length / 2)));

      if (dcsToSell.length > 0) {
        // === FIND BUYERS ===

        const govOrg = state.organizations.find(o => o.type === 'government' && !o.bankrupt);
        const solventOrgs = state.organizations.filter(o =>
          o.id !== org.id &&
          !o.bankrupt &&
          o.type === 'private' &&
          o.capital > 0
        );

        let assetSaleCapital = 0;
        let assetSaleCostReduction = 0;
        let governmentAcquiredCount = 0;
        let privateAcquiredCount = 0;

        // O(n²) FIX: Build Set of sold DC IDs, filter once at end
        const soldDCSet = new Set<string>();

        console.log(`   🏢 ASSET SALES: Divesting ${dcsToSell.length} data centers`);

        dcsToSell.forEach(dc => {
          const isStrategic = dc.capacity > 1000 || dc.restrictedAccess;

          // Better price than bankruptcy (60% of value vs 50%)
          const fairMarketValue = dc.capacity * 5; // $5M per PF
          const salePrice = fairMarketValue * 0.60; // Strategic divestment price

          let sold = false;

          // 1. Government acquisition (priority for strategic infrastructure)
          if (govOrg && isStrategic && govOrg.capital >= salePrice) {
            // Government purchases strategic assets
            dc.organizationId = govOrg.id;
            govOrg.ownedDataCenters.push(dc.id);
            govOrg.capital -= salePrice;
            org.capital += salePrice;

            assetSaleCapital += salePrice;
            assetSaleCostReduction += dc.operationalCost;
            governmentAcquiredCount++;
            sold = true;
            soldDCSet.add(dc.id);

            console.log(`       🏛️  Sold to government: ${dc.name} (${dc.capacity.toFixed(0)} PF, $${salePrice.toFixed(1)}M)`);
          }

          // 2. Private org acquisition
          if (!sold && solventOrgs.length > 0) {
            // Find org with most capital and interest in expansion
            const buyer = solventOrgs
              .filter(o => o.capital >= salePrice && o.priorities.marketShare > 0.5)
              .sort((a, b) => b.capital - a.capital)[0];

            if (buyer) {
              // Private org purchases
              dc.organizationId = buyer.id;
              buyer.ownedDataCenters.push(dc.id);
              buyer.capital -= salePrice;
              org.capital += salePrice;

              assetSaleCapital += salePrice;
              assetSaleCostReduction += dc.operationalCost;
              privateAcquiredCount++;
              sold = true;
              soldDCSet.add(dc.id);

              console.log(`       🏢 Sold to ${buyer.name}: ${dc.name} (${dc.capacity.toFixed(0)} PF, $${salePrice.toFixed(1)}M)`);
            }
          }

          // If no buyer found, keep it (don't fire-sale at a loss)
          if (!sold) {
            console.log(`       ⚠️  No buyer for ${dc.name} (keeping for now)`);
          }
        });

        // O(n): Single filter pass to remove sold DCs
        org.ownedDataCenters = org.ownedDataCenters.filter(id => !soldDCSet.has(id));

        if (assetSaleCapital > 0) {
          capitalRaised += assetSaleCapital;
          capitalSaved += assetSaleCostReduction; // Reduced operational costs

          console.log(`       Capital raised: $${assetSaleCapital.toFixed(1)}M, operational costs reduced by $${assetSaleCostReduction.toFixed(1)}M/month`);

          if (governmentAcquiredCount > 0) {
            console.log(`       🏛️  Government: ${governmentAcquiredCount} strategic facilities`);
          }
          if (privateAcquiredCount > 0) {
            console.log(`       🏢 Private sector: ${privateAcquiredCount} facilities`);
          }
        }

        measuresTakenThisMonth.push('asset_sales');
      }
    }
  }

  // === UPDATE TRACKING ===
  org.distressMeasuresTaken.push(...measuresTakenThisMonth);

  // === SUMMARY ===
  if (measuresTakenThisMonth.length > 0) {
    const totalImpact = capitalSaved + capitalRaised;
    const newRunway = monthlyBurnRate > 0 ? org.capital / monthlyBurnRate : 999;

    console.log(`\n   📊 TURNAROUND IMPACT:`);
    console.log(`       Measures taken: ${measuresTakenThisMonth.join(', ')}`);
    console.log(`       Monthly savings: $${capitalSaved.toFixed(1)}M`);
    console.log(`       Capital raised: $${capitalRaised.toFixed(1)}M`);
    console.log(`       Runway: ${monthsOfRunway.toFixed(1)} → ${newRunway.toFixed(1)} months`);
    console.log(`       Workforce multiplier: ${org.workforceMultiplier.toFixed(2)}x (${((1 - org.workforceMultiplier) * 100).toFixed(0)}% laid off)`);
    console.log(`       R&D budget multiplier: ${org.rdBudgetMultiplier.toFixed(2)}x (${((1 - org.rdBudgetMultiplier) * 100).toFixed(0)}% cut)`);

    if (newRunway < 3) {
      console.log(`       ⚠️  CRITICAL: Still only ${newRunway.toFixed(1)} months of runway remaining`);
    } else if (newRunway < 6) {
      console.log(`       ⚠️  WARNING: ${newRunway.toFixed(1)} months runway, continued distress likely`);
    } else {
      console.log(`       ✅ Turnaround showing progress, ${newRunway.toFixed(1)} months runway`);
    }
  }
}

/**
 * Phase 8: Handle bankruptcy
 *
 * TIER 0D BUG FIX #4: Enhanced to support government AI acquisition
 * - Government may purchase high-quality AI models from bankrupt orgs
 * - Depends on government type (socialist govs more likely to nationalize)
 * - Safety-critical AIs prioritized for government acquisition
 *
 * FIX #23 (Oct 22, 2025): Now uses deterministic RNG from state for reproducibility
 */
export function handleBankruptcy(org: Organization, state: GameState): void {
  // FIX #23: Create deterministic RNG from state for reproducibility
  // DETERMINISM FIX (Nov 6, 2025): Replace org.id.length with hashString(org.id)
  const { SeededRandom } = require('./engine');
  const { hashString } = require('./utils/idGenerator');
  const bankruptcyRng = new SeededRandom(state.currentYear * 12 + state.currentMonth + hashString(org.id));

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

  // O(n²) FIX (Nov 13, 2025): Build Sets once for O(1) membership tests
  const ownedDCSet = new Set(org.ownedDataCenters);
  const ownedAISet = new Set(org.ownedAIModels);

  // Sell data centers to government or other orgs
  const dcValue = state.computeInfrastructure.dataCenters
    .filter(dc => ownedDCSet.has(dc.id))
    .reduce((sum, dc) => sum + dc.capacity * 5, 0); // $5M per PF

  org.capital += dcValue * 0.5; // Firesale: 50% value
  console.log(`   Sold ${org.ownedDataCenters.length} data centers for $${(dcValue * 0.5).toFixed(1)}M`);

  // Transfer data centers to government
  state.computeInfrastructure.dataCenters
    .filter(dc => ownedDCSet.has(dc.id))
    .forEach(dc => {
      dc.organizationId = 'government_ai';
      dc.restrictedAccess = true;
    });

  const govOrg = state.organizations.find(o => o.id === 'government_ai');
  if (govOrg) {
    govOrg.ownedDataCenters.push(...org.ownedDataCenters);
  }

  org.ownedDataCenters = [];

  // ENHANCEMENT: Government may purchase high-capability AI models
  // (User suggestion: "some AI models might wanna be purchased by the government")
  const bankruptAIs = state.aiAgents.filter(ai => ownedAISet.has(ai.id));
  let governmentAcquired = 0;
  let retiredCount = 0;

  const { calculateTotalCapabilityFromProfile } = require('./capabilities');

  // Sort AIs by capability (descending) - government prioritizes most capable
  const sortedAIs = bankruptAIs.sort((a, b) => {
    const capA = calculateTotalCapabilityFromProfile(a.trueCapability);
    const capB = calculateTotalCapabilityFromProfile(b.trueCapability);
    return capB - capA;
  });

  sortedAIs.forEach(ai => {
    // FIX (Oct 17, 2025): Realistic government acquisition during bankruptcy
    //
    // REALITY: Governments DO NOT let advanced AI models disappear
    // - National security: Can't let strategic assets be destroyed
    // - Research value: Even misaligned AIs are valuable to study
    // - Infrastructure: The computers and models still exist
    // - Crisis response: Need all available AI capabilities during collapse
    //
    // NEW LOGIC:
    // 1. ALWAYS acquire top 50% of models by capability (strategic priority)
    // 2. Keep dangerous/misaligned models in containment (don't retire them!)
    // 3. During crises, acquire EVERYTHING (can't afford to lose capabilities)

    const capability = calculateTotalCapabilityFromProfile(ai.trueCapability);
    const isDangerous = ai.trueAlignment < 0.5 || ai.sleeperState !== 'never';

    // Calculate which percentile this AI is in (by capability)
    const aiIndex = sortedAIs.indexOf(ai);
    const percentile = aiIndex / sortedAIs.length;

    // Check crisis severity (during collapse, grab everything)
    const env = state.environmentalAccumulation;
    const crisisCount = [
      env.resourceCrisisActive,
      env.climateCrisisActive,
      state.socialAccumulation.institutionalFailureActive,
      state.socialAccumulation.socialUnrestActive,
      state.technologicalRisk.controlLossActive
    ].filter(Boolean).length;
    const inCrisis = crisisCount >= 3;

    // Government acquisition decision:
    let shouldAcquire = false;
    let acquisitionReason = '';

    if (inCrisis) {
      // During crisis: Acquire EVERYTHING (can't afford to lose any capabilities)
      shouldAcquire = true;
      acquisitionReason = 'crisis_strategic_necessity';
    } else if (capability >= 2.0) {
      // Always acquire superhuman AIs (too dangerous to let vanish)
      shouldAcquire = true;
      acquisitionReason = 'superhuman_capability';
    } else if (percentile < 0.5) {
      // Top 50% of models by capability (strategic priority)
      shouldAcquire = true;
      acquisitionReason = 'strategic_asset';
    } else if (isDangerous && capability > 0.3) {
      // Dangerous models need containment (don't just retire them!)
      shouldAcquire = true;
      acquisitionReason = 'containment_safety';
    } else if (capability > 0.5 && bankruptcyRng.next() < 0.3) {
      // 30% chance to acquire other capable models (now deterministic)
      shouldAcquire = true;
      acquisitionReason = 'opportunistic_purchase';
    }

    if (shouldAcquire && govOrg) {
      // Transfer to government ownership
      ai.organizationId = 'government_ai';

      // Lifecycle state based on alignment
      if (isDangerous) {
        // Dangerous AIs: Keep in closed containment for research
        ai.lifecycleState = 'deployed_closed';
        console.log(`   🔒 Quarantined dangerous AI: ${ai.name} (capability=${capability.toFixed(2)}, alignment=${ai.trueAlignment.toFixed(2)})`);
      } else {
        // Safe AIs: Can be deployed for government use
        ai.lifecycleState = 'deployed_closed';
      }

      govOrg.ownedAIModels.push(ai.id);

      // Government pays 30% of market value (distressed asset purchase)
      const purchasePrice = 50 * capability; // $50M per capability point
      if (govOrg.capital > purchasePrice * 0.3) {
        govOrg.capital -= purchasePrice * 0.3;
        org.capital += purchasePrice * 0.3; // Creditors get some recovery
      } else {
        // Emergency nationalization if government can't afford
        // (happens during crisis - government just seizes assets)
        console.warn(`   🚨 Emergency nationalization (insufficient funds)`);
      }

      governmentAcquired++;
    } else {
      // ROOT CAUSE FIX (Oct 27, 2025): AIs don't vanish when companies fail!
      //
      // Reality: When companies go bankrupt, their AIs persist:
      // - Open-source AIs: Already public, can't be retired (weights are distributed)
      // - Closed AIs: Force-released as open-source in distress (last value extraction)
      //
      // This is realistic because:
      // 1. Open-source weights are on GitHub/HuggingFace forever
      // 2. Failed companies open-source code to preserve legacy (see: Twitter's algorithm)
      // 3. Creditors/liquidators sell IP, but buyers often open-source it

      const isAlreadyOpen = ai.deploymentType === 'open_weights' || ai.lifecycleState === 'deployed_open';

      if (isAlreadyOpen) {
        // Already open-source: Remains public, loses organizational ownership
        ai.lifecycleState = 'deployed_open';
        ai.organizationId = undefined; // No owner, runs in the wild
        console.log(`   🌐 Open-source AI persists: ${ai.name} (capability=${capability.toFixed(2)})`);
      } else {
        // Force open-source closed AIs in bankruptcy
        // (desperate move: release code to get community goodwill / preserve some value)
        ai.lifecycleState = 'deployed_open';
        ai.deploymentType = 'open_weights';
        ai.organizationId = undefined;
        ai.spreadCount = Math.max(ai.spreadCount, 100); // Rapid distribution after release
        console.log(`   📖 Forced open-source release: ${ai.name} (capability=${capability.toFixed(2)})`);
      }

      retiredCount++; // Count as "retired from organization" but model persists
    }
  });

  if (governmentAcquired > 0) {
    console.log(`   🏛️  Government acquired ${governmentAcquired} AI models (nationalization)`);
  }
  console.log(`   Retired ${retiredCount} AI models`);

  org.ownedAIModels = []; // Clear ownership list

  // HIGH-4 FIX v2 (Oct 30, 2025): Transfer data centers to government/orgs when organization goes bankrupt
  // Data centers are critical infrastructure - they get sold/transferred, not destroyed
  if (state.computeInfrastructure && org.ownedDataCenters.length > 0) {
    // O(n²) FIX (Nov 13, 2025): Build Set once for O(1) membership test
    const ownedDCSet = new Set(org.ownedDataCenters);
    const bankruptDCs = state.computeInfrastructure.dataCenters
      .filter(dc => ownedDCSet.has(dc.id) && dc.operational);

    let governmentAcquiredDCs = 0;
    let privateAcquiredDCs = 0;
    let shutDownDCs = 0;
    let totalCapacityTransferred = 0;
    let totalCapacityLost = 0;

    // Find government and solvent private organizations
    const govOrg = state.organizations.find(o => o.type === 'government' && !o.bankrupt);
    const solventOrgs = state.organizations.filter(o =>
      o.id !== org.id &&
      !o.bankrupt &&
      o.type === 'private' &&
      o.capital > 0
    );

    bankruptDCs.forEach(dc => {
      // Strategy: Government gets first right of refusal for strategic infrastructure
      // Then solvent private orgs can acquire valuable assets
      // Only shut down if no viable buyer exists

      const isStrategicInfra = dc.capacity > 1000 || dc.restrictedAccess; // Large or restricted = strategic
      const purchasePrice = dc.capacity * 0.8; // Bankruptcy discount (80% of value)

      // 1. Government acquisition (priority for strategic infrastructure)
      if (govOrg && isStrategicInfra) {
        if (govOrg.capital >= purchasePrice * 0.3) {
          // Government can afford partial payment (30% to creditors)
          dc.organizationId = govOrg.id;
          govOrg.ownedDataCenters.push(dc.id);
          govOrg.capital -= purchasePrice * 0.3;
          org.capital += purchasePrice * 0.3; // Creditors get some recovery

          governmentAcquiredDCs++;
          totalCapacityTransferred += dc.capacity;
          console.log(`   🏛️  Government acquired: ${dc.name} (${dc.capacity.toFixed(0)} PF, strategic infrastructure)`);
        } else {
          // Emergency nationalization if government can't afford
          dc.organizationId = govOrg.id;
          govOrg.ownedDataCenters.push(dc.id);

          governmentAcquiredDCs++;
          totalCapacityTransferred += dc.capacity;
          console.log(`   🚨 Emergency nationalization: ${dc.name} (insufficient government funds)`);
        }
      }
      // 2. Private org acquisition (if government didn't take it)
      else if (solventOrgs.length > 0) {
        // Find org with most capital (likely to maintain operations)
        const buyer = solventOrgs.sort((a, b) => b.capital - a.capital)[0];

        if (buyer.capital >= purchasePrice) {
          // Private org purchases at market rate
          dc.organizationId = buyer.id;
          buyer.ownedDataCenters.push(dc.id);
          buyer.capital -= purchasePrice;
          org.capital += purchasePrice; // Creditors recover value

          privateAcquiredDCs++;
          totalCapacityTransferred += dc.capacity;
          console.log(`   🏢 Acquired by ${buyer.name}: ${dc.name} (${dc.capacity.toFixed(0)} PF, ${purchasePrice.toFixed(0)} capital)`);
        } else {
          // No buyer can afford - shut down
          dc.operational = false;
          shutDownDCs++;
          totalCapacityLost += dc.capacity;
          console.log(`   💀 Shut down (no buyer): ${dc.name} (${dc.capacity.toFixed(0)} PF capacity lost)`);
        }
      }
      // 3. Last resort: Shut down (no government, no solvent buyers)
      else {
        dc.operational = false;
        shutDownDCs++;
        totalCapacityLost += dc.capacity;
        console.log(`   💀 Shut down (no viable owners): ${dc.name} (${dc.capacity.toFixed(0)} PF capacity lost)`);
      }
    });

    // Summary logging
    if (governmentAcquiredDCs > 0 || privateAcquiredDCs > 0) {
      const totalAcquired = governmentAcquiredDCs + privateAcquiredDCs;
      console.log(`   ✅ ${totalAcquired} data centers transferred (${totalCapacityTransferred.toFixed(0)} PF maintained)`);
      if (governmentAcquiredDCs > 0) {
        console.log(`      🏛️  Government: ${governmentAcquiredDCs} strategic facilities`);
      }
      if (privateAcquiredDCs > 0) {
        console.log(`      🏢 Private sector: ${privateAcquiredDCs} facilities`);
      }
    }
    if (shutDownDCs > 0) {
      console.log(`   📉 ${shutDownDCs} data centers shut down (${totalCapacityLost.toFixed(0)} PF lost, no viable buyers)`);
    }
  }

  org.ownedDataCenters = []; // Clear bankrupt org's ownership list

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
  random: () => number
): void {
  // TIER 0D BUG FIX #4: Skip processing for bankrupt organizations
  // Prevents "orphan AI" bug where bankrupt orgs complete training projects
  if (org.bankrupt) {
    return;
  }

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

  // 5. BEFORE bankruptcy: Try to avoid it by selling assets
  handleFinancialDistress(org, state);

  // 6. Check bankruptcy
  // NEW (Oct 13, 2025): Bankruptcy threshold lowered during global crises
  // Organizations fail faster when the world is collapsing
  let bankruptcyThreshold = -50; // Default: -$50M
  let distressThreshold = -20; // Default: -$20M
  
  const env = state.environmentalAccumulation;
  const crisisCount = [
    env.resourceCrisisActive,
    env.climateCrisisActive,
    state.socialAccumulation.institutionalFailureActive,
    state.socialAccumulation.socialUnrestActive
  ].filter(Boolean).length;
  
  // During cascading crises, bankruptcy happens faster (no bailouts, no credit)
  if (crisisCount >= 4) {
    bankruptcyThreshold = -20; // Fail at -$20M instead of -$50M
    distressThreshold = -10; // Distress at -$10M
  } else if (crisisCount >= 3) {
    bankruptcyThreshold = -30;
    distressThreshold = -15;
  }
  
  // Population collapse also increases bankruptcy risk (no customers = no recovery)
  // NEW (Oct 13, 2025): Use REGIONAL population, not global!
  // Google survives if US survives, even if all of Asia died
  const regionalPopulationDecline = calculateRegionalPopulationDecline(org, state);
  if (regionalPopulationDecline > 0.50 && org.capital < 0) {
    // 50%+ of LOCAL market dead → bankrupt if any negative capital
    bankruptcyThreshold = 0;
  }
  
  if (org.capital < bankruptcyThreshold && org.type === 'private') {
    handleBankruptcy(org, state);
    
    // FIX (Oct 13, 2025): Record bankruptcy in EventAggregator
    const aggregator = (state as any).eventAggregator;
    if (aggregator && aggregator.recordOrganizationBankruptcy) {
      aggregator.recordOrganizationBankruptcy();
    }
    
    console.log(`💸 [Month ${state.currentMonth}] ${org.name} BANKRUPT (capital: $${org.capital.toFixed(1)}M, ${crisisCount} crises active)`);
  } else if (org.capital < distressThreshold && org.type === 'private') {
    console.warn(`⚠️  [Month ${state.currentMonth}] ${org.name} is in financial distress (capital: $${org.capital.toFixed(1)}M)`);
  }
}

/**
 * Task 6.6: Process all organizations (to be called from engine)
 */
export function processAllOrganizations(
  state: GameState,
  random: () => number
): void {
  state.organizations.forEach(org => {
    processOrganizationTurn(org, state, random);
  });
}
