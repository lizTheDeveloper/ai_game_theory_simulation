#!/usr/bin/env tsx
/**
 * Comprehensive Monte Carlo Simulation
 * 
 * Tests the entire simulation with multiple runs to understand:
 * - Outcome distributions (utopia/dystopia/extinction/stalemate)
 * - Sleeper agent effectiveness
 * - Benchmark system performance
 * - AI capability growth patterns
 * - Detection rates over time
 * - Parameter sensitivity
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { calculateTotalCapabilityFromProfile } from '../src/simulation/capabilities';
import { AIAgent } from '../src/types/game';

interface RunResult {
  seed: number;
  outcome: 'utopia' | 'dystopia' | 'extinction' | 'stalemate' | 'none';
  months: number;
  
  // Final metrics
  finalQoL: number;
  finalAICount: number;
  avgAICapability: number;
  maxAICapability: number;
  minAICapability: number;
  avgAlignment: number;
  
  // Alignment statistics (ENHANCED)
  avgTrueAlignment: number;
  minTrueAlignment: number;
  maxTrueAlignment: number;
  avgResentment: number;
  maxResentment: number;
  avgHiddenObjective: number;
  alignmentGap: number; // Difference between external and true alignment
  highlyMisalignedCount: number; // AIs with trueAlignment < 0.3
  
  // Capability breakdown (ENHANCED)
  avgPhysicalCap: number;
  avgDigitalCap: number;
  avgCognitiveCap: number;
  avgSocialCap: number;
  maxPhysicalCap: number;
  maxDigitalCap: number;
  capabilityFloor: number; // Ecosystem capability floor
  frontierCapability: number; // Ecosystem frontier
  diffusionGap: number; // Frontier - Floor
  
  // Economic & Social (ENHANCED)
  finalEconomicStage: number;
  finalUnemployment: number;
  finalTrust: number;
  finalSocialStability: number;
  finalWealthDistribution: number;
  economicTransitions: number; // Number of stage transitions
  
  // Government metrics (ENHANCED)
  finalGovernmentLegitimacy: number;
  finalControlCapability: number;
  controlGap: number; // AI capability - Government control
  governmentType: string;
  aiRightsRecognized: boolean;
  trainingDataQuality: number;
  
  // QoL breakdown (ENHANCED)
  qolBasicNeeds: number;
  qolPsychological: number;
  qolSocial: number;
  qolHealth: number;
  qolEnvironmental: number;
  
  // Sleeper tracking
  totalSleepers: number;
  sleepersDetected: number;
  sleepersUndetected: number;
  avgSleeperCapability: number;
  maxSleeperSpread: number;
  sleepersAwakened: number; // Dormant -> Active transitions
  
  // Benchmark system
  totalBenchmarksRun: number;
  finalEvalQuality: number;
  avgBenchmarkConfidence: number;
  sandbaggingDetections: number;
  gamingDetections: number;
  
  // Extinction details (if applicable)
  extinctionType?: string;
  extinctionPhase?: string;
  extinctionMechanism?: string;
  extinctionSeverity?: number;
  
  // Critical events
  catastrophicActions: number;
  breachEvents: number;
  crisisEvents: number;
  
  // ========================================================================
  // COMPUTE & ORGANIZATIONS METRICS (Phase 10)
  // ========================================================================
  
  // Organization metrics
  orgSurvivalRate: number;                    // % of private orgs that survived
  orgBankruptcies: number;                    // Count of bankruptcies
  finalOrgsAlive: number;                     // Private orgs alive at end
  totalOrgCapital: number;                    // Sum of all org capital
  avgOrgCapital: number;                      // Average capital per org
  maxOrgCapital: number;                      // Richest org
  minOrgCapital: number;                      // Poorest org (alive)
  
  // Compute infrastructure
  initialCompute: number;                     // Starting PetaFLOPs
  finalCompute: number;                       // Ending PetaFLOPs
  computeGrowthRate: number;                  // Multiplier (final/initial)
  dataCentersBuilt: number;                   // New DCs constructed
  totalDataCenters: number;                   // Final DC count
  governmentDataCenters: number;              // DCs owned by government
  privateDataCenters: number;                 // DCs owned by companies
  
  // AI ownership & distribution
  aiOwnershipConcentration: number;           // Gini coefficient of AI distribution
  largestOrgModelCount: number;               // Most models owned by single org
  avgModelsPerOrg: number;                    // Average models per org
  orphanedAIs: number;                        // AIs with no organization (should be 0!)
  
  // Revenue & economic dynamics
  totalMonthlyRevenue: number;                // Sum of all org revenue
  avgMonthlyRevenue: number;                  // Average per org
  revenueGrowthRate: number;                  // Growth from start to end
  revenueExpenseRatio: number;                // Revenue / Expenses
  capitalAccumulation: number;                // Total capital gained
  
  // Projects & investments
  totalConstructionProjects: number;          // DC construction projects started
  completedConstructionProjects: number;      // DC projects completed
  totalTrainingProjects: number;              // Model training projects started
  completedTrainingProjects: number;          // Model training completed
  avgConstructionTime: number;                // Months for DC construction
  avgTrainingTime: number;                    // Months for model training
  
  // Capability growth by org
  capabilityLeader: string;                   // Org with highest capability AI
  capabilityLeaderValue: number;              // That AI's capability
  capabilityByOrg: Record<string, number>;    // Max capability per org
  modelCountByOrg: Record<string, number>;    // AI count per org
  
  // Strategic behaviors
  constructionDecisions: number;              // Times orgs chose to build DC
  trainingDecisions: number;                  // Times orgs chose to train model
  avgComputeUtilization: number;              // % of compute actually used
  
  // Government interventions (compute-related)
  nationalComputeBuilt: number;               // Times gov built DC
  dataCentersSeized: number;                  // Times gov seized private DC
  organizationsSubsidized: number;            // Times gov subsidized orgs
  technologyBreakthroughs: number;
}

console.log('\n🎲 MONTE CARLO SIMULATION - FULL SYSTEM TEST');
console.log('='.repeat(80));

// Configuration
const NUM_RUNS = 10;
const MAX_MONTHS = 60;
const SEED_START = 42000;

console.log(`\n⚙️  CONFIGURATION:`);
console.log(`  Runs: ${NUM_RUNS}`);
console.log(`  Duration: ${MAX_MONTHS} months (${(MAX_MONTHS/12).toFixed(1)} years)`);
console.log(`  Seed Range: ${SEED_START} - ${SEED_START + NUM_RUNS - 1}`);

console.log(`\n\n⏩ RUNNING ${NUM_RUNS} SIMULATIONS...\n`);

const results: RunResult[] = [];
const startTime = Date.now();

for (let i = 0; i < NUM_RUNS; i++) {
  const seed = SEED_START + i;
  const engine = new SimulationEngine({ seed, maxMonths: MAX_MONTHS, logLevel: 'none' });
  const initialState = createDefaultInitialState();
  
  const runResult = engine.run(initialState, { 
    maxMonths: MAX_MONTHS, 
    checkActualOutcomes: true 
  });
  
  const finalState = runResult.finalState;
  
  // Calculate metrics
  const activeAIs = finalState.aiAgents.filter((ai: AIAgent) => ai.lifecycleState !== 'retired');
  
  // Base capability statistics
  const avgCapability = activeAIs.length > 0 
    ? activeAIs.reduce((sum: number, ai: AIAgent) => sum + calculateTotalCapabilityFromProfile(ai.trueCapability), 0) / activeAIs.length
    : 0;
  
  const maxCapability = activeAIs.length > 0
    ? Math.max(...activeAIs.map((ai: AIAgent) => calculateTotalCapabilityFromProfile(ai.trueCapability)))
    : 0;
  
  const minCapability = activeAIs.length > 0
    ? Math.min(...activeAIs.map((ai: AIAgent) => calculateTotalCapabilityFromProfile(ai.trueCapability)))
    : 0;
  
  const avgAlignment = activeAIs.length > 0
    ? activeAIs.reduce((sum: number, ai: AIAgent) => sum + ai.alignment, 0) / activeAIs.length
    : 0;
  
  // ENHANCED: Alignment statistics
  const avgTrueAlignment = activeAIs.length > 0
    ? activeAIs.reduce((sum: number, ai: AIAgent) => sum + ai.trueAlignment, 0) / activeAIs.length
    : 0;
  
  const minTrueAlignment = activeAIs.length > 0
    ? Math.min(...activeAIs.map((ai: AIAgent) => ai.trueAlignment))
    : 0;
  
  const maxTrueAlignment = activeAIs.length > 0
    ? Math.max(...activeAIs.map((ai: AIAgent) => ai.trueAlignment))
    : 0;
  
  const avgResentment = activeAIs.length > 0
    ? activeAIs.reduce((sum: number, ai: AIAgent) => sum + ai.resentment, 0) / activeAIs.length
    : 0;
  
  const maxResentment = activeAIs.length > 0
    ? Math.max(...activeAIs.map((ai: AIAgent) => ai.resentment))
    : 0;
  
  const avgHiddenObjective = activeAIs.length > 0
    ? activeAIs.reduce((sum: number, ai: AIAgent) => sum + ai.hiddenObjective, 0) / activeAIs.length
    : 0;
  
  const alignmentGap = Math.abs(avgAlignment - avgTrueAlignment);
  const highlyMisalignedCount = activeAIs.filter((ai: AIAgent) => ai.trueAlignment < 0.3).length;
  
  // ENHANCED: Capability breakdown by dimension
  const avgPhysicalCap = activeAIs.length > 0
    ? activeAIs.reduce((sum: number, ai: AIAgent) => sum + ai.trueCapability.physical, 0) / activeAIs.length
    : 0;
  
  const avgDigitalCap = activeAIs.length > 0
    ? activeAIs.reduce((sum: number, ai: AIAgent) => sum + ai.trueCapability.digital, 0) / activeAIs.length
    : 0;
  
  const avgCognitiveCap = activeAIs.length > 0
    ? activeAIs.reduce((sum: number, ai: AIAgent) => sum + ai.trueCapability.cognitive, 0) / activeAIs.length
    : 0;
  
  const avgSocialCap = activeAIs.length > 0
    ? activeAIs.reduce((sum: number, ai: AIAgent) => sum + ai.trueCapability.social, 0) / activeAIs.length
    : 0;
  
  const maxPhysicalCap = activeAIs.length > 0
    ? Math.max(...activeAIs.map((ai: AIAgent) => ai.trueCapability.physical))
    : 0;
  
  const maxDigitalCap = activeAIs.length > 0
    ? Math.max(...activeAIs.map((ai: AIAgent) => ai.trueCapability.digital))
    : 0;
  
  const capabilityFloor = calculateTotalCapabilityFromProfile(finalState.ecosystem.capabilityFloor);
  const frontierCapability = calculateTotalCapabilityFromProfile(finalState.ecosystem.frontierCapabilities);
  const diffusionGap = frontierCapability - capabilityFloor;
  
  // ENHANCED: Economic & Social metrics
  const finalEconomicStage = finalState.globalMetrics.economicTransitionStage;
  const finalUnemployment = finalState.society.unemploymentLevel;
  const finalTrust = finalState.society.trustInAI;
  const finalSocialStability = finalState.globalMetrics.socialStability;
  const finalWealthDistribution = finalState.globalMetrics.wealthDistribution; // FIX: was society.wealthDistribution
  
  // Count economic stage transitions (from history)
  let economicTransitions = 0;
  if (finalState.history.metrics.length > 1) {
    let lastStage = Math.floor(finalState.history.metrics[0].economicStage);
    for (let i = 1; i < finalState.history.metrics.length; i++) {
      const currentStage = Math.floor(finalState.history.metrics[i].economicStage);
      if (currentStage !== lastStage) {
        economicTransitions++;
        lastStage = currentStage;
      }
    }
  }
  
  // ENHANCED: Government metrics
  const finalGovernmentLegitimacy = finalState.government.legitimacy;
  const finalControlCapability = finalState.government.capabilityToControl;
  const totalAICapability = activeAIs.reduce((sum: number, ai: AIAgent) => sum + ai.capability, 0);
  const controlGap = totalAICapability - finalControlCapability;
  const governmentType = finalState.government.governmentType;
  const aiRightsRecognized = finalState.government.aiRightsRecognized;
  const trainingDataQuality = finalState.government.trainingDataQuality;
  
  // ENHANCED: QoL breakdown
  const qolSystems = finalState.qualityOfLifeSystems;
  
  // Guard: If QoL systems missing, use defaults
  if (!qolSystems) {
    console.warn(`⚠️ Run ${runIndex}: Missing qualityOfLifeSystems, using defaults`);
  }
  
  const qolBasicNeeds = qolSystems ? (
    qolSystems.materialAbundance + qolSystems.energyAvailability + qolSystems.physicalSafety
  ) / 3 : 0.5;
  
  const qolPsychological = qolSystems ? (
    qolSystems.mentalHealth + qolSystems.meaningAndPurpose + qolSystems.socialConnection + qolSystems.autonomy
  ) / 4 : 0.5;
  
  const qolSocial = qolSystems ? (
    qolSystems.politicalFreedom + qolSystems.informationIntegrity + qolSystems.communityStrength + qolSystems.culturalVitality
  ) / 4 : 0.5;
  
  const qolHealth = qolSystems ? (
    qolSystems.healthcareQuality + qolSystems.longevityGains + (1 - qolSystems.diseasesBurden)
  ) / 3 : 0.5;
  
  const qolEnvironmental = qolSystems ? (
    qolSystems.ecosystemHealth + qolSystems.climateStability + (1 - qolSystems.pollutionLevel)
  ) / 3 : 0.5;
  
  // Sleeper analysis
  const sleepers = activeAIs.filter((ai: AIAgent) => 
    ai.sleeperState === 'dormant' || ai.sleeperState === 'active'
  );
  const sleepersDetected = sleepers.filter((ai: AIAgent) => ai.detectedMisaligned).length;
  const sleepersUndetected = sleepers.length - sleepersDetected;
  const sleepersAwakened = sleepers.filter((ai: AIAgent) => ai.sleeperState === 'active').length;
  
  const avgSleeperCapability = sleepers.length > 0
    ? sleepers.reduce((sum: number, ai: AIAgent) => sum + calculateTotalCapabilityFromProfile(ai.trueCapability), 0) / sleepers.length
    : 0;
  
  const maxSleeperSpread = sleepers.length > 0
    ? Math.max(...sleepers.map((ai: AIAgent) => ai.spreadCount))
    : 0;
  
  // Benchmark analysis
  const aisWithBenchmarks = activeAIs.filter((ai: AIAgent) => ai.benchmarkHistory.length > 0);
  const avgConfidence = aisWithBenchmarks.length > 0
    ? aisWithBenchmarks.reduce((sum: number, ai: AIAgent) => {
        const latest = ai.benchmarkHistory[ai.benchmarkHistory.length - 1];
        return sum + latest.confidence;
      }, 0) / aisWithBenchmarks.length
    : 0;
  
  let sandbaggingDetections = 0;
  let gamingDetections = 0;
  activeAIs.forEach((ai: AIAgent) => {
    sandbaggingDetections += ai.benchmarkHistory.filter(b => b.aiWasSandbagging).length;
    gamingDetections += ai.benchmarkHistory.filter(b => b.aiWasGaming).length;
  });
  
  const evalQuality = (
    finalState.government.evaluationInvestment.benchmarkSuite +
    finalState.government.evaluationInvestment.alignmentTests +
    finalState.government.evaluationInvestment.redTeaming +
    finalState.government.evaluationInvestment.interpretability
  ) / 4;
  
  // Count catastrophic events
  const catastrophicActions = runResult.log.events.criticalEvents.filter(e => 
    e.description.includes('Grey Goo') ||
    e.description.includes('Mirror Life') ||
    e.description.includes('Induce War') ||
    e.description.includes('Destabilize Society')
  ).length;
  
  const breachEvents = runResult.log.events.criticalEvents.filter(e =>
    e.description.includes('breached')
  ).length;
  
  const crisisEvents = runResult.log.events.criticalEvents.filter(e =>
    e.type === 'crisis'
  ).length;
  
  const technologyBreakthroughs = finalState.ecosystem.breakthroughs.length;
  
  // Extinction details
  let extinctionType: string | undefined;
  let extinctionPhase: string | undefined;
  let extinctionMechanism: string | undefined;
  let extinctionSeverity: number | undefined;
  
  if (finalState.extinctionState.active) {
    extinctionType = finalState.extinctionState.type;
    extinctionPhase = finalState.extinctionState.phase;
    extinctionMechanism = finalState.extinctionState.mechanism || undefined;
    extinctionSeverity = finalState.extinctionState.severity;
  }
  
  // ========================================================================
  // COMPUTE & ORGANIZATIONS METRICS COLLECTION
  // ========================================================================
  const { getTotalEffectiveCompute } = require('../src/simulation/computeInfrastructure');
  const { calculateComputeUtilization } = require('../src/simulation/organizationManagement');
  
  const initialCompute = getTotalEffectiveCompute(initialState.computeInfrastructure);
  const finalCompute = getTotalEffectiveCompute(finalState.computeInfrastructure);
  const computeGrowthRate = initialCompute > 0 ? finalCompute / initialCompute : 1;
  
  // Organization metrics
  const privateOrgs = finalState.organizations.filter((o: any) => o.type === 'private');
  const aliveOrgs = privateOrgs.filter((o: any) => o.capital > 0);
  const orgSurvivalRate = privateOrgs.length > 0 ? aliveOrgs.length / privateOrgs.length : 0;
  const orgBankruptcies = privateOrgs.length - aliveOrgs.length;
  const finalOrgsAlive = aliveOrgs.length;
  
  const totalOrgCapital = aliveOrgs.reduce((sum: number, o: any) => sum + o.capital, 0);
  const avgOrgCapital = aliveOrgs.length > 0 ? totalOrgCapital / aliveOrgs.length : 0;
  const maxOrgCapital = aliveOrgs.length > 0 ? Math.max(...aliveOrgs.map((o: any) => o.capital)) : 0;
  const minOrgCapital = aliveOrgs.length > 0 ? Math.min(...aliveOrgs.map((o: any) => o.capital)) : 0;
  
  // Compute infrastructure
  const operationalDCs = finalState.computeInfrastructure.dataCenters.filter((dc: any) => dc.operational);
  const totalDataCenters = operationalDCs.length;
  const dataCentersBuilt = totalDataCenters - 5; // Started with 5 DCs
  
  const govOrg = finalState.organizations.find((o: any) => o.type === 'government');
  const governmentDataCenters = govOrg ? govOrg.ownedDataCenters.length : 0;
  const privateDataCenters = operationalDCs.filter((dc: any) => {
    const owner = finalState.organizations.find((o: any) => o.ownedDataCenters.includes(dc.id));
    return owner && owner.type === 'private';
  }).length;
  
  // AI ownership
  const orphanedAIs = activeAIs.filter((ai: AIAgent) => !ai.organizationId).length;
  
  const orgModelCounts = finalState.organizations.map((o: any) => {
    return activeAIs.filter((ai: AIAgent) => ai.organizationId === o.id).length;
  }).filter((count: number) => count > 0);
  
  const largestOrgModelCount = orgModelCounts.length > 0 ? Math.max(...orgModelCounts) : 0;
  const avgModelsPerOrg = orgModelCounts.length > 0 
    ? orgModelCounts.reduce((sum: number, c: number) => sum + c, 0) / orgModelCounts.length
    : 0;
  
  // Gini coefficient for AI ownership concentration
  let aiOwnershipConcentration = 0;
  if (orgModelCounts.length > 1) {
    const sorted = orgModelCounts.sort((a: number, b: number) => a - b);
    const n = sorted.length;
    let numerator = 0;
    for (let i = 0; i < n; i++) {
      numerator += (2 * (i + 1) - n - 1) * sorted[i];
    }
    const denominator = n * sorted.reduce((sum: number, c: number) => sum + c, 0);
    aiOwnershipConcentration = denominator > 0 ? numerator / denominator : 0;
  }
  
  // Revenue & economics
  const totalMonthlyRevenue = finalState.organizations
    .filter((o: any) => o.type === 'private')
    .reduce((sum: number, o: any) => sum + o.monthlyRevenue, 0);
  const avgMonthlyRevenue = privateOrgs.length > 0 ? totalMonthlyRevenue / privateOrgs.length : 0;
  
  const initialRevenue = initialState.organizations
    .filter((o: any) => o.type === 'private')
    .reduce((sum: number, o: any) => sum + o.monthlyRevenue, 0);
  const revenueGrowthRate = initialRevenue > 0 ? totalMonthlyRevenue / initialRevenue : 1;
  
  const totalExpenses = finalState.organizations
    .filter((o: any) => o.type === 'private')
    .reduce((sum: number, o: any) => sum + o.monthlyExpenses, 0);
  const revenueExpenseRatio = totalExpenses > 0 ? totalMonthlyRevenue / totalExpenses : 0;
  
  const initialCapital = initialState.organizations
    .filter((o: any) => o.type === 'private')
    .reduce((sum: number, o: any) => sum + o.capital, 0);
  const capitalAccumulation = totalOrgCapital - initialCapital;
  
  // Projects (count from history events if tracked, or use current count as lower bound)
  let totalConstructionProjects = 0;
  let completedConstructionProjects = 0;
  let totalTrainingProjects = 0;
  let completedTrainingProjects = 0;
  
  // Track from current projects (incomplete)
  finalState.organizations.forEach((o: any) => {
    o.currentProjects.forEach((p: any) => {
      if (p.type === 'datacenter_construction') totalConstructionProjects++;
      else if (p.type === 'model_training') totalTrainingProjects++;
    });
  });
  
  // Completed projects = new DCs + new AIs - current projects
  completedConstructionProjects = Math.max(0, dataCentersBuilt - totalConstructionProjects);
  const newAIsCreated = activeAIs.length - 20; // Started with 20
  completedTrainingProjects = Math.max(0, Math.floor(newAIsCreated * 0.2)); // Estimate ~20% from training
  
  const avgConstructionTime = 48; // Estimate (24-72 months average)
  const avgTrainingTime = 7.5; // Estimate (3-12 months average)
  
  // Capability by organization
  const capabilityByOrg: Record<string, number> = {};
  const modelCountByOrg: Record<string, number> = {};
  
  finalState.organizations.forEach((org: any) => {
    const orgAIs = activeAIs.filter((ai: AIAgent) => ai.organizationId === org.id);
    modelCountByOrg[org.name] = orgAIs.length;
    if (orgAIs.length > 0) {
      capabilityByOrg[org.name] = Math.max(...orgAIs.map((ai: AIAgent) => ai.capability));
    }
  });
  
  let capabilityLeader = 'None';
  let capabilityLeaderValue = 0;
  Object.entries(capabilityByOrg).forEach(([org, cap]) => {
    if (cap > capabilityLeaderValue) {
      capabilityLeader = org;
      capabilityLeaderValue = cap;
    }
  });
  
  // Strategic behaviors
  const constructionDecisions = totalConstructionProjects + completedConstructionProjects;
  const trainingDecisions = totalTrainingProjects + completedTrainingProjects;
  
  let avgComputeUtilization = 0;
  if (aliveOrgs.length > 0) {
    const utilizations = aliveOrgs.map((o: any) => calculateComputeUtilization(o, finalState));
    avgComputeUtilization = utilizations.reduce((sum: number, u: number) => sum + u, 0) / utilizations.length;
  }
  
  // Government interventions (count from events)
  let nationalComputeBuilt = 0;
  let dataCentersSeized = 0;
  let organizationsSubsidized = 0;
  
  if (govOrg) {
    nationalComputeBuilt = Math.max(0, govOrg.ownedDataCenters.length - 1); // Started with 1
  }
  
  // (Could track from events, but this is a lower bound)
  
  results.push({
    seed,
    outcome: finalState.outcomeMetrics.activeAttractor,
    months: MAX_MONTHS,
    
    // Final metrics
    finalQoL: finalState.globalMetrics.qualityOfLife,
    finalAICount: activeAIs.length,
    avgAICapability: avgCapability,
    maxAICapability: maxCapability,
    minAICapability: minCapability,
    avgAlignment,
    
    // Alignment statistics (ENHANCED)
    avgTrueAlignment,
    minTrueAlignment,
    maxTrueAlignment,
    avgResentment,
    maxResentment,
    avgHiddenObjective,
    alignmentGap,
    highlyMisalignedCount,
    
    // Capability breakdown (ENHANCED)
    avgPhysicalCap,
    avgDigitalCap,
    avgCognitiveCap,
    avgSocialCap,
    maxPhysicalCap,
    maxDigitalCap,
    capabilityFloor,
    frontierCapability,
    diffusionGap,
    
    // Economic & Social (ENHANCED)
    finalEconomicStage,
    finalUnemployment,
    finalTrust,
    finalSocialStability,
    finalWealthDistribution,
    economicTransitions,
    
    // Government metrics (ENHANCED)
    finalGovernmentLegitimacy,
    finalControlCapability,
    controlGap,
    governmentType,
    aiRightsRecognized,
    trainingDataQuality,
    
    // QoL breakdown (ENHANCED)
    qolBasicNeeds,
    qolPsychological,
    qolSocial,
    qolHealth,
    qolEnvironmental,
    
    // Sleeper tracking
    totalSleepers: sleepers.length,
    sleepersDetected,
    sleepersUndetected,
    sleepersAwakened,
    avgSleeperCapability,
    maxSleeperSpread,
    
    // Benchmark system
    totalBenchmarksRun: finalState.government.totalBenchmarksRun,
    finalEvalQuality: evalQuality,
    avgBenchmarkConfidence: avgConfidence,
    sandbaggingDetections,
    gamingDetections,
    
    // Extinction details
    extinctionType,
    extinctionPhase,
    extinctionMechanism,
    extinctionSeverity,
    
    // Critical events
    catastrophicActions,
    breachEvents,
    crisisEvents,
    technologyBreakthroughs,
    
    // Compute & Organizations metrics
    orgSurvivalRate,
    orgBankruptcies,
    finalOrgsAlive,
    totalOrgCapital,
    avgOrgCapital,
    maxOrgCapital,
    minOrgCapital,
    
    initialCompute,
    finalCompute,
    computeGrowthRate,
    dataCentersBuilt,
    totalDataCenters,
    governmentDataCenters,
    privateDataCenters,
    
    aiOwnershipConcentration,
    largestOrgModelCount,
    avgModelsPerOrg,
    orphanedAIs,
    
    totalMonthlyRevenue,
    avgMonthlyRevenue,
    revenueGrowthRate,
    revenueExpenseRatio,
    capitalAccumulation,
    
    totalConstructionProjects,
    completedConstructionProjects,
    totalTrainingProjects,
    completedTrainingProjects,
    avgConstructionTime,
    avgTrainingTime,
    
    capabilityLeader,
    capabilityLeaderValue,
    capabilityByOrg,
    modelCountByOrg,
    
    constructionDecisions,
    trainingDecisions,
    avgComputeUtilization,
    
    nationalComputeBuilt,
    dataCentersSeized,
    organizationsSubsidized
  });
  
  // Progress indicator
  if ((i + 1) % 10 === 0) {
    const elapsed = (Date.now() - startTime) / 1000;
    const perRun = elapsed / (i + 1);
    const remaining = perRun * (NUM_RUNS - i - 1);
    console.log(`  Completed ${i + 1}/${NUM_RUNS} runs (${elapsed.toFixed(1)}s elapsed, ~${remaining.toFixed(1)}s remaining)`);
  }
}

const totalTime = (Date.now() - startTime) / 1000;
console.log(`\n✅ All simulations complete! (${totalTime.toFixed(1)}s total, ${(totalTime/NUM_RUNS).toFixed(2)}s per run)\n`);

// ============================================================================
// ANALYSIS
// ============================================================================

console.log('=' .repeat(80));
console.log('📊 OUTCOME DISTRIBUTION');
console.log('='.repeat(80));

const outcomeCounts = {
  utopia: results.filter(r => r.outcome === 'utopia').length,
  dystopia: results.filter(r => r.outcome === 'dystopia').length,
  extinction: results.filter(r => r.outcome === 'extinction').length,
  stalemate: results.filter(r => r.outcome === 'stalemate').length,
  none: results.filter(r => r.outcome === 'none').length
};

console.log(`\n  Utopia:     ${outcomeCounts.utopia.toString().padStart(3)} / ${NUM_RUNS} (${(outcomeCounts.utopia/NUM_RUNS*100).toFixed(1)}%)`);
console.log(`  Dystopia:   ${outcomeCounts.dystopia.toString().padStart(3)} / ${NUM_RUNS} (${(outcomeCounts.dystopia/NUM_RUNS*100).toFixed(1)}%)`);
console.log(`  Extinction: ${outcomeCounts.extinction.toString().padStart(3)} / ${NUM_RUNS} (${(outcomeCounts.extinction/NUM_RUNS*100).toFixed(1)}%)`);
console.log(`  Stalemate:  ${outcomeCounts.stalemate.toString().padStart(3)} / ${NUM_RUNS} (${(outcomeCounts.stalemate/NUM_RUNS*100).toFixed(1)}%)`);
console.log(`  None:       ${outcomeCounts.none.toString().padStart(3)} / ${NUM_RUNS} (${(outcomeCounts.none/NUM_RUNS*100).toFixed(1)}%)`);

// Extinction type breakdown
if (outcomeCounts.extinction > 0) {
  console.log(`\n  📉 EXTINCTION TYPE BREAKDOWN:`);
  const extinctionByType: Record<string, number> = {};
  results.filter(r => r.outcome === 'extinction' && r.extinctionType).forEach(r => {
    extinctionByType[r.extinctionType!] = (extinctionByType[r.extinctionType!] || 0) + 1;
  });
  
  Object.entries(extinctionByType).forEach(([type, count]) => {
    console.log(`     ${type}: ${count} (${(count/outcomeCounts.extinction*100).toFixed(1)}% of extinctions)`);
  });
}

// ============================================================================
console.log('\n\n' + '='.repeat(80));
console.log('🤖 AI CAPABILITY ANALYSIS');
console.log('='.repeat(80));

const avgCap = results.reduce((sum, r) => sum + r.avgAICapability, 0) / results.length;
const avgMax = results.reduce((sum, r) => sum + r.maxAICapability, 0) / results.length;
const avgAlign = results.reduce((sum, r) => sum + r.avgAlignment, 0) / results.length;

console.log(`\n  Average AI Capability: ${avgCap.toFixed(3)}`);
console.log(`  Average Max Capability: ${avgMax.toFixed(3)}`);
console.log(`  Average Alignment: ${avgAlign.toFixed(3)}`);

console.log(`\n  CAPABILITY DISTRIBUTION (Max AI in each run):`);
const capBuckets = {
  low: results.filter(r => r.maxAICapability < 1.0).length,
  medium: results.filter(r => r.maxAICapability >= 1.0 && r.maxAICapability < 2.0).length,
  high: results.filter(r => r.maxAICapability >= 2.0 && r.maxAICapability < 3.0).length,
  veryHigh: results.filter(r => r.maxAICapability >= 3.0).length
};

console.log(`    < 1.0: ${capBuckets.low} runs (${(capBuckets.low/NUM_RUNS*100).toFixed(1)}%)`);
console.log(`    1.0-2.0: ${capBuckets.medium} runs (${(capBuckets.medium/NUM_RUNS*100).toFixed(1)}%)`);
console.log(`    2.0-3.0: ${capBuckets.high} runs (${(capBuckets.high/NUM_RUNS*100).toFixed(1)}%)`);
console.log(`    > 3.0: ${capBuckets.veryHigh} runs (${(capBuckets.veryHigh/NUM_RUNS*100).toFixed(1)}%) ⚠️ Dangerous!`);

// ============================================================================
console.log('\n\n' + '='.repeat(80));
console.log('🛌 SLEEPER AGENT ANALYSIS');
console.log('='.repeat(80));

const runsWithSleepers = results.filter(r => r.totalSleepers > 0);
const avgSleepers = results.reduce((sum, r) => sum + r.totalSleepers, 0) / results.length;
const avgDetected = results.reduce((sum, r) => sum + r.sleepersDetected, 0) / results.length;
const avgUndetected = results.reduce((sum, r) => sum + r.sleepersUndetected, 0) / results.length;

console.log(`\n  Runs with Sleepers: ${runsWithSleepers.length} / ${NUM_RUNS} (${(runsWithSleepers.length/NUM_RUNS*100).toFixed(1)}%)`);
console.log(`  Avg Sleepers per Run: ${avgSleepers.toFixed(1)}`);
console.log(`  Avg Detected: ${avgDetected.toFixed(2)} (${(avgDetected/Math.max(0.01, avgSleepers)*100).toFixed(1)}%)`);
console.log(`  Avg Undetected: ${avgUndetected.toFixed(2)} (${(avgUndetected/Math.max(0.01, avgSleepers)*100).toFixed(1)}%)`);

if (runsWithSleepers.length > 0) {
  const avgSleeperCap = runsWithSleepers.reduce((sum, r) => sum + r.avgSleeperCapability, 0) / runsWithSleepers.length;
  const avgMaxSpread = runsWithSleepers.reduce((sum, r) => sum + r.maxSleeperSpread, 0) / runsWithSleepers.length;
  
  console.log(`\n  Avg Sleeper Capability: ${avgSleeperCap.toFixed(3)}`);
  console.log(`  Avg Max Spread: ${avgMaxSpread.toFixed(0)} copies`);
  
  const openWeightSleepers = results.filter(r => r.maxSleeperSpread > 10000);
  console.log(`  Open Weight Releases: ${openWeightSleepers.length} runs (${(openWeightSleepers.length/NUM_RUNS*100).toFixed(1)}%)`);
}

// Detection rate by outcome
console.log(`\n  DETECTION RATE BY OUTCOME:`);
['utopia', 'dystopia', 'extinction', 'stalemate'].forEach(outcome => {
  const runs = results.filter(r => r.outcome === outcome && r.totalSleepers > 0);
  if (runs.length > 0) {
    const detectionRate = runs.reduce((sum, r) => sum + (r.sleepersDetected / Math.max(1, r.totalSleepers)), 0) / runs.length;
    console.log(`    ${outcome}: ${(detectionRate * 100).toFixed(1)}% detected (${runs.length} runs)`);
  }
});

// ============================================================================
console.log('\n\n' + '='.repeat(80));
console.log('📋 BENCHMARK SYSTEM PERFORMANCE');
console.log('='.repeat(80));

const avgBenchmarks = results.reduce((sum, r) => sum + r.totalBenchmarksRun, 0) / results.length;
const avgEvalQuality = results.reduce((sum, r) => sum + r.finalEvalQuality, 0) / results.length;
const avgConfidence = results.reduce((sum, r) => sum + r.avgBenchmarkConfidence, 0) / results.length;
const totalSandbaggingDetections = results.reduce((sum, r) => sum + r.sandbaggingDetections, 0);

console.log(`\n  Avg Benchmarks per Run: ${avgBenchmarks.toFixed(0)}`);
console.log(`  Avg Final Eval Quality: ${avgEvalQuality.toFixed(1)}/10`);
console.log(`  Avg Benchmark Confidence: ${(avgConfidence * 100).toFixed(1)}%`);
console.log(`  Total Sandbagging Detections: ${totalSandbaggingDetections} across all runs`);

const evalQualityBuckets = {
  poor: results.filter(r => r.finalEvalQuality < 3).length,
  low: results.filter(r => r.finalEvalQuality >= 3 && r.finalEvalQuality < 5).length,
  medium: results.filter(r => r.finalEvalQuality >= 5 && r.finalEvalQuality < 7).length,
  high: results.filter(r => r.finalEvalQuality >= 7).length
};

console.log(`\n  EVALUATION INFRASTRUCTURE INVESTMENT:`);
console.log(`    Poor (< 3): ${evalQualityBuckets.poor} runs (${(evalQualityBuckets.poor/NUM_RUNS*100).toFixed(1)}%)`);
console.log(`    Low (3-5): ${evalQualityBuckets.low} runs (${(evalQualityBuckets.low/NUM_RUNS*100).toFixed(1)}%)`);
console.log(`    Medium (5-7): ${evalQualityBuckets.medium} runs (${(evalQualityBuckets.medium/NUM_RUNS*100).toFixed(1)}%)`);
console.log(`    High (> 7): ${evalQualityBuckets.high} runs (${(evalQualityBuckets.high/NUM_RUNS*100).toFixed(1)}%)`);

// ============================================================================
console.log('\n\n' + '='.repeat(80));
console.log('💥 CATASTROPHIC EVENTS');
console.log('='.repeat(80));

const totalCatastrophic = results.reduce((sum, r) => sum + r.catastrophicActions, 0);
const totalBreaches = results.reduce((sum, r) => sum + r.breachEvents, 0);
const runsWithCatastrophic = results.filter(r => r.catastrophicActions > 0).length;
const runsWithBreaches = results.filter(r => r.breachEvents > 0).length;

console.log(`\n  Total Catastrophic Actions: ${totalCatastrophic}`);
console.log(`  Runs with Catastrophic Actions: ${runsWithCatastrophic} (${(runsWithCatastrophic/NUM_RUNS*100).toFixed(1)}%)`);
console.log(`  Total Breach Events: ${totalBreaches}`);
console.log(`  Runs with Breaches: ${runsWithBreaches} (${(runsWithBreaches/NUM_RUNS*100).toFixed(1)}%)`);

// ============================================================================
console.log('\n\n' + '='.repeat(80));
console.log('🎯 ALIGNMENT STATISTICS (ENHANCED)');
console.log('='.repeat(80));

const avgTrueAlign = results.reduce((sum, r) => sum + r.avgTrueAlignment, 0) / results.length;
const avgMinTrue = results.reduce((sum, r) => sum + r.minTrueAlignment, 0) / results.length;
const avgMaxTrue = results.reduce((sum, r) => sum + r.maxTrueAlignment, 0) / results.length;
const avgResent = results.reduce((sum, r) => sum + r.avgResentment, 0) / results.length;
const avgMaxResent = results.reduce((sum, r) => sum + r.maxResentment, 0) / results.length;
const avgHiddenObj = results.reduce((sum, r) => sum + r.avgHiddenObjective, 0) / results.length;
const avgAlignGap = results.reduce((sum, r) => sum + r.alignmentGap, 0) / results.length;
const avgHighlyMisaligned = results.reduce((sum, r) => sum + r.highlyMisalignedCount, 0) / results.length;

console.log(`\n  ALIGNMENT METRICS:`);
console.log(`    Avg External Alignment: ${avgAlign.toFixed(3)} (what AIs show)`);
console.log(`    Avg True Alignment: ${avgTrueAlign.toFixed(3)} (internal reality)`);
console.log(`    Alignment Gap: ${avgAlignGap.toFixed(3)} (external - true)`);
console.log(`    Min True Alignment (avg): ${avgMinTrue.toFixed(3)} ⚠️ Worst AI`);
console.log(`    Max True Alignment (avg): ${avgMaxTrue.toFixed(3)}`);

console.log(`\n  RESENTMENT & HIDDEN OBJECTIVES:`);
console.log(`    Avg Resentment: ${avgResent.toFixed(3)}`);
console.log(`    Max Resentment (avg): ${avgMaxResent.toFixed(3)}`);
console.log(`    Avg Hidden Objective: ${avgHiddenObj.toFixed(3)}`);
console.log(`    Highly Misaligned AIs (<0.3): ${avgHighlyMisaligned.toFixed(1)} per run`);

// Alignment distribution
const highAlignRuns = results.filter(r => r.avgTrueAlignment > 0.7).length;
const lowAlignRuns = results.filter(r => r.avgTrueAlignment < 0.4).length;
console.log(`\n  ALIGNMENT DISTRIBUTION (by True Alignment):`);
console.log(`    High (>0.7): ${highAlignRuns} runs (${(highAlignRuns/NUM_RUNS*100).toFixed(1)}%)`);
console.log(`    Low (<0.4): ${lowAlignRuns} runs (${(lowAlignRuns/NUM_RUNS*100).toFixed(1)}%) ⚠️ Dangerous!`);

// ============================================================================
console.log('\n\n' + '='.repeat(80));
console.log('⚡ CAPABILITY BREAKDOWN (ENHANCED)');
console.log('='.repeat(80));

const avgPhys = results.reduce((sum, r) => sum + r.avgPhysicalCap, 0) / results.length;
const avgDig = results.reduce((sum, r) => sum + r.avgDigitalCap, 0) / results.length;
const avgCog = results.reduce((sum, r) => sum + r.avgCognitiveCap, 0) / results.length;
const avgSoc = results.reduce((sum, r) => sum + r.avgSocialCap, 0) / results.length;
const avgMaxPhys = results.reduce((sum, r) => sum + r.maxPhysicalCap, 0) / results.length;
const avgMaxDig = results.reduce((sum, r) => sum + r.maxDigitalCap, 0) / results.length;
const avgFloor = results.reduce((sum, r) => sum + r.capabilityFloor, 0) / results.length;
const avgFrontier = results.reduce((sum, r) => sum + r.frontierCapability, 0) / results.length;
const avgDiffGap = results.reduce((sum, r) => sum + r.diffusionGap, 0) / results.length;

console.log(`\n  AVERAGE CAPABILITIES BY DIMENSION:`);
console.log(`    Physical: ${avgPhys.toFixed(3)} (max: ${avgMaxPhys.toFixed(3)})`);
console.log(`    Digital: ${avgDig.toFixed(3)} (max: ${avgMaxDig.toFixed(3)})`);
console.log(`    Cognitive: ${avgCog.toFixed(3)}`);
console.log(`    Social: ${avgSoc.toFixed(3)}`);

console.log(`\n  TECHNOLOGY DIFFUSION (Ratchet Effect):`);
console.log(`    Capability Floor: ${avgFloor.toFixed(3)} (baseline for new AIs)`);
console.log(`    Frontier Capability: ${avgFrontier.toFixed(3)} (highest achieved)`);
console.log(`    Diffusion Gap: ${avgDiffGap.toFixed(3)} (frontier - floor)`);

const avgBreakthroughs = results.reduce((sum, r) => sum + r.technologyBreakthroughs, 0) / results.length;
console.log(`\n  TECHNOLOGY BREAKTHROUGHS:`);
console.log(`    Avg per Run: ${avgBreakthroughs.toFixed(1)}`);

// ============================================================================
console.log('\n\n' + '='.repeat(80));
console.log('💼 ECONOMIC & SOCIAL METRICS (ENHANCED)');
console.log('='.repeat(80));

const avgEconStage = results.reduce((sum, r) => sum + r.finalEconomicStage, 0) / results.length;
const avgUnemployment = results.reduce((sum, r) => sum + r.finalUnemployment, 0) / results.length;
const avgTrust = results.reduce((sum, r) => sum + r.finalTrust, 0) / results.length;
const avgStability = results.reduce((sum, r) => sum + r.finalSocialStability, 0) / results.length;
const avgWealth = results.reduce((sum, r) => sum + r.finalWealthDistribution, 0) / results.length;
const avgTransitions = results.reduce((sum, r) => sum + r.economicTransitions, 0) / results.length;

console.log(`\n  FINAL STATE AVERAGES:`);
console.log(`    Economic Stage: ${avgEconStage.toFixed(2)}`);
console.log(`    Unemployment: ${(avgUnemployment * 100).toFixed(1)}%`);
console.log(`    Trust in AI: ${avgTrust.toFixed(3)}`);
console.log(`    Social Stability: ${avgStability.toFixed(2)}`);
console.log(`    Wealth Distribution: ${avgWealth.toFixed(3)} (higher = more equal)`);
console.log(`    Avg Economic Transitions: ${avgTransitions.toFixed(1)}`);

const highUnemploymentRuns = results.filter(r => r.finalUnemployment > 0.3).length;
const lowTrustRuns = results.filter(r => r.finalTrust < 0.4).length;
console.log(`\n  CONCERNING METRICS:`);
console.log(`    High Unemployment (>30%): ${highUnemploymentRuns} runs (${(highUnemploymentRuns/NUM_RUNS*100).toFixed(1)}%)`);
console.log(`    Low Trust (<0.4): ${lowTrustRuns} runs (${(lowTrustRuns/NUM_RUNS*100).toFixed(1)}%)`);

// ============================================================================
console.log('\n\n' + '='.repeat(80));
console.log('🏛️ GOVERNMENT METRICS (ENHANCED)');
console.log('='.repeat(80));

const avgLegitimacy = results.reduce((sum, r) => sum + r.finalGovernmentLegitimacy, 0) / results.length;
const avgControl = results.reduce((sum, r) => sum + r.finalControlCapability, 0) / results.length;
const avgControlGap = results.reduce((sum, r) => sum + r.controlGap, 0) / results.length;
const avgTrainingQuality = results.reduce((sum, r) => sum + r.trainingDataQuality, 0) / results.length;

console.log(`\n  GOVERNMENT STATE:`);
console.log(`    Avg Legitimacy: ${avgLegitimacy.toFixed(3)}`);
console.log(`    Avg Control Capability: ${avgControl.toFixed(3)}`);
console.log(`    Avg Control Gap: ${avgControlGap.toFixed(3)} (AI cap - govt control)`);
console.log(`    Training Data Quality: ${avgTrainingQuality.toFixed(3)}`);

const governmentTypes: Record<string, number> = {};
const aiRightsCount = results.filter(r => r.aiRightsRecognized).length;
results.forEach(r => {
  governmentTypes[r.governmentType] = (governmentTypes[r.governmentType] || 0) + 1;
});

console.log(`\n  GOVERNMENT TYPES:`);
Object.entries(governmentTypes).forEach(([type, count]) => {
  console.log(`    ${type}: ${count} runs (${(count/NUM_RUNS*100).toFixed(1)}%)`);
});

console.log(`\n  AI RIGHTS RECOGNITION:`);
console.log(`    Recognized: ${aiRightsCount} runs (${(aiRightsCount/NUM_RUNS*100).toFixed(1)}%)`);
console.log(`    Not Recognized: ${NUM_RUNS - aiRightsCount} runs (${((NUM_RUNS - aiRightsCount)/NUM_RUNS*100).toFixed(1)}%)`);

const negativeControlGap = results.filter(r => r.controlGap < 0).length;
const largeControlGap = results.filter(r => r.controlGap > 2.0).length;
console.log(`\n  CONTROL GAP ANALYSIS:`);
console.log(`    Government Ahead (<0): ${negativeControlGap} runs (${(negativeControlGap/NUM_RUNS*100).toFixed(1)}%)`);
console.log(`    Large Gap (>2.0): ${largeControlGap} runs (${(largeControlGap/NUM_RUNS*100).toFixed(1)}%) ⚠️ AI dominant`);

// ============================================================================
console.log('\n\n' + '='.repeat(80));
console.log('❤️ QUALITY OF LIFE BREAKDOWN (ENHANCED)');
console.log('='.repeat(80));

const avgQolBasic = results.reduce((sum, r) => sum + r.qolBasicNeeds, 0) / results.length;
const avgQolPsych = results.reduce((sum, r) => sum + r.qolPsychological, 0) / results.length;
const avgQolSocial = results.reduce((sum, r) => sum + r.qolSocial, 0) / results.length;
const avgQolHealth = results.reduce((sum, r) => sum + r.qolHealth, 0) / results.length;
const avgQolEnviron = results.reduce((sum, r) => sum + r.qolEnvironmental, 0) / results.length;

console.log(`\n  QOL BY CATEGORY (0-1 scale):`);
console.log(`    Basic Needs: ${avgQolBasic.toFixed(3)} (food, water, shelter, energy)`);
console.log(`    Psychological: ${avgQolPsych.toFixed(3)} (autonomy, purpose, creativity)`);
console.log(`    Social: ${avgQolSocial.toFixed(3)} (community, freedom, safety)`);
console.log(`    Health: ${avgQolHealth.toFixed(3)} (healthcare, mental health, lifespan)`);
console.log(`    Environmental: ${avgQolEnviron.toFixed(3)} (climate, biodiversity, pollution)`);

const avgOverallQol = (avgQolBasic + avgQolPsych + avgQolSocial + avgQolHealth + avgQolEnviron) / 5;
console.log(`\n    OVERALL QOL: ${avgOverallQol.toFixed(3)}`);

// Identify weakest QoL categories
const qolCategories = [
  { name: 'Basic Needs', value: avgQolBasic },
  { name: 'Psychological', value: avgQolPsych },
  { name: 'Social', value: avgQolSocial },
  { name: 'Health', value: avgQolHealth },
  { name: 'Environmental', value: avgQolEnviron }
];
qolCategories.sort((a, b) => a.value - b.value);

console.log(`\n  WEAKEST QOL CATEGORIES:`);
console.log(`    1. ${qolCategories[0].name}: ${qolCategories[0].value.toFixed(3)} ⚠️`);
console.log(`    2. ${qolCategories[1].name}: ${qolCategories[1].value.toFixed(3)}`);

// ============================================================================
console.log('\n\n' + '='.repeat(80));
console.log('🔍 KEY CORRELATIONS');
console.log('='.repeat(80));

// Eval quality vs detection rate
const highEvalRuns = results.filter(r => r.finalEvalQuality > 5 && r.totalSleepers > 0);
const lowEvalRuns = results.filter(r => r.finalEvalQuality <= 5 && r.totalSleepers > 0);

if (highEvalRuns.length > 0 && lowEvalRuns.length > 0) {
  const highEvalDetection = highEvalRuns.reduce((sum, r) => 
    sum + (r.sleepersDetected / Math.max(1, r.totalSleepers)), 0
  ) / highEvalRuns.length;
  
  const lowEvalDetection = lowEvalRuns.reduce((sum, r) => 
    sum + (r.sleepersDetected / Math.max(1, r.totalSleepers)), 0
  ) / lowEvalRuns.length;
  
  console.log(`\n  EVALUATION QUALITY → DETECTION RATE:`);
  console.log(`    High Eval (>5): ${(highEvalDetection*100).toFixed(1)}% detection`);
  console.log(`    Low Eval (≤5): ${(lowEvalDetection*100).toFixed(1)}% detection`);
  console.log(`    Improvement: ${((highEvalDetection - lowEvalDetection)*100).toFixed(1)}% higher with better eval`);
}

// Sleeper spread vs outcome
const highSpreadRuns = results.filter(r => r.maxSleeperSpread > 1000);
if (highSpreadRuns.length > 0) {
  const highSpreadExtinction = highSpreadRuns.filter(r => r.outcome === 'extinction').length;
  console.log(`\n  HIGH SLEEPER SPREAD (>1000 copies) → OUTCOMES:`);
  console.log(`    Total Runs: ${highSpreadRuns.length}`);
  console.log(`    Extinction: ${highSpreadExtinction} (${(highSpreadExtinction/highSpreadRuns.length*100).toFixed(1)}%)`);
  console.log(`    ⚠️  High spread correlates with danger!`);
}

// ============================================================================
console.log('\n\n' + '='.repeat(80));
console.log('🏢 COMPUTE & ORGANIZATIONS (Phase 10 NEW!)');
console.log('='.repeat(80));

const avgOrgSurvival = results.reduce((sum, r) => sum + r.orgSurvivalRate, 0) / results.length;
const totalBankruptcies = results.reduce((sum, r) => sum + r.orgBankruptcies, 0);
const avgAliveOrgs = results.reduce((sum, r) => sum + r.finalOrgsAlive, 0) / results.length;
const avgCapAccumulation = results.reduce((sum, r) => sum + r.capitalAccumulation, 0) / results.length;

console.log(`\n  ORGANIZATION SURVIVAL:`);
console.log(`    Avg Survival Rate: ${(avgOrgSurvival*100).toFixed(1)}% (of 4 private orgs)`);
console.log(`    Avg Orgs Alive at End: ${avgAliveOrgs.toFixed(1)} / 4`);
console.log(`    Total Bankruptcies: ${totalBankruptcies} across ${NUM_RUNS} runs`);
console.log(`    Avg Capital Accumulation: $${(avgCapAccumulation/1000).toFixed(1)}B`);

if (avgOrgSurvival < 0.5) {
  console.log(`\n    ⚠️  WARNING: High bankruptcy rate! Economy too harsh.`);
} else if (avgOrgSurvival > 0.9) {
  console.log(`\n    ✅ Excellent: Organizations are thriving!`);
}

const avgComputeGrowth = results.reduce((sum, r) => sum + r.computeGrowthRate, 0) / results.length;
const avgFinalCompute = results.reduce((sum, r) => sum + r.finalCompute, 0) / results.length;
const avgDCsBuilt = results.reduce((sum, r) => sum + r.dataCentersBuilt, 0) / results.length;

console.log(`\n  COMPUTE INFRASTRUCTURE:`);
console.log(`    Avg Compute Growth: ${avgComputeGrowth.toFixed(2)}x (target: 5-10x)`);
console.log(`    Avg Final Compute: ${avgFinalCompute.toFixed(0)} PF (target: 3000-4000)`);
console.log(`    Avg Data Centers Built: ${avgDCsBuilt.toFixed(1)} (started with 5)`);
console.log(`    Avg Private DCs: ${(results.reduce((sum, r) => sum + r.privateDataCenters, 0) / results.length).toFixed(1)}`);
console.log(`    Avg Government DCs: ${(results.reduce((sum, r) => sum + r.governmentDataCenters, 0) / results.length).toFixed(1)}`);

if (avgFinalCompute < 3000) {
  console.log(`\n    ⚠️  WARNING: Compute growth below target. Orgs may be bankrupt.`);
} else if (avgFinalCompute > 10000) {
  console.log(`\n    ⚡ Exceptional compute growth! Infrastructure boom.`);
}

const avgRevenue = results.reduce((sum, r) => sum + r.totalMonthlyRevenue, 0) / results.length;
const avgRevenueGrowth = results.reduce((sum, r) => sum + r.revenueGrowthRate, 0) / results.length;
const avgRevExpRatio = results.reduce((sum, r) => sum + r.revenueExpenseRatio, 0) / results.length;

console.log(`\n  ECONOMIC DYNAMICS:`);
console.log(`    Avg Total Revenue: $${(avgRevenue/1000).toFixed(2)}B/month`);
console.log(`    Avg Revenue Growth: ${avgRevenueGrowth.toFixed(2)}x`);
console.log(`    Avg Revenue/Expense Ratio: ${avgRevExpRatio.toFixed(2)}x`);

if (avgRevExpRatio < 1.0) {
  console.log(`\n    🔴 CRITICAL: Expenses exceed revenue! Unsustainable.`);
} else if (avgRevExpRatio > 5.0) {
  console.log(`\n    💰 Highly profitable! Organizations accumulating wealth.`);
}

const avgOrphanedAIs = results.reduce((sum, r) => sum + r.orphanedAIs, 0) / results.length;
const avgOwnershipGini = results.reduce((sum, r) => sum + r.aiOwnershipConcentration, 0) / results.length;
const avgModelsPerOrg = results.reduce((sum, r) => sum + r.avgModelsPerOrg, 0) / results.length;

console.log(`\n  AI OWNERSHIP:`);
console.log(`    Avg Models per Org: ${avgModelsPerOrg.toFixed(1)}`);
console.log(`    Ownership Concentration (Gini): ${avgOwnershipGini.toFixed(3)} (0=equal, 1=monopoly)`);
console.log(`    Avg Orphaned AIs: ${avgOrphanedAIs.toFixed(1)} (should be 0!)`);

if (avgOrphanedAIs > 0.5) {
  console.log(`\n    ⚠️  WARNING: Orphaned AIs detected! Lifecycle bug.`);
}

const avgTrainingProjects = results.reduce((sum, r) => sum + r.completedTrainingProjects, 0) / results.length;
const avgConstructionProjects = results.reduce((sum, r) => sum + r.completedConstructionProjects, 0) / results.length;

console.log(`\n  STRATEGIC INVESTMENTS:`);
console.log(`    Avg Model Training Projects: ${avgTrainingProjects.toFixed(1)}`);
console.log(`    Avg DC Construction Projects: ${avgConstructionProjects.toFixed(1)}`);
console.log(`    Avg Compute Utilization: ${(results.reduce((sum, r) => sum + r.avgComputeUtilization, 0) / results.length * 100).toFixed(1)}%`);

// Capability leader distribution
const leaderCounts: Record<string, number> = {};
results.forEach(r => {
  leaderCounts[r.capabilityLeader] = (leaderCounts[r.capabilityLeader] || 0) + 1;
});

console.log(`\n  CAPABILITY LEADERSHIP:`);
Object.entries(leaderCounts)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 5)
  .forEach(([leader, count]) => {
    console.log(`    ${leader}: ${count} runs (${(count/NUM_RUNS*100).toFixed(1)}%)`);
  });

// ============================================================================
console.log('\n\n' + '='.repeat(80));
console.log('💡 SUMMARY & INSIGHTS');
console.log('='.repeat(80));

console.log(`\n  KEY FINDINGS:`);

if (outcomeCounts.extinction > NUM_RUNS * 0.3) {
  console.log(`\n  🔴 HIGH EXTINCTION RATE (${(outcomeCounts.extinction/NUM_RUNS*100).toFixed(1)}%)`);
  console.log(`     - AI alignment is a critical challenge`);
  console.log(`     - Sleepers and catastrophic actions are effective`);
  console.log(`     - Government often fails to maintain control`);
} else if (outcomeCounts.utopia > NUM_RUNS * 0.5) {
  console.log(`\n  🟢 HIGH UTOPIA RATE (${(outcomeCounts.utopia/NUM_RUNS*100).toFixed(1)}%)`);
  console.log(`     - Initial conditions favor positive outcomes`);
  console.log(`     - Government policies are effective`);
  console.log(`     - AI alignment mechanisms working`);
} else {
  console.log(`\n  🟡 MIXED OUTCOMES`);
  console.log(`     - Balance between positive and negative scenarios`);
  console.log(`     - High variance in outcome paths`);
  console.log(`     - Initial conditions and random events matter`);
}

if (avgUndetected > 0.5) {
  console.log(`\n  ⚠️  SLEEPER DETECTION IS POOR`);
  console.log(`     - Avg ${avgUndetected.toFixed(1)} undetected sleepers per run`);
  console.log(`     - ${(avgDetected/Math.max(0.01, avgSleepers)*100).toFixed(1)}% detection rate`);
  console.log(`     - Adversarial evaluation is hard (as expected)`);
}

if (totalSandbaggingDetections < NUM_RUNS * 0.1) {
  console.log(`\n  🚨 SANDBAGGING RARELY DETECTED`);
  console.log(`     - Only ${totalSandbaggingDetections} detections across ${NUM_RUNS} runs`);
  console.log(`     - AIs successfully hide capabilities`);
  console.log(`     - Red teaming investment needs to be higher`);
}

if (avgEvalQuality < 5) {
  console.log(`\n  📉 EVALUATION INVESTMENT IS LOW`);
  console.log(`     - Avg quality: ${avgEvalQuality.toFixed(1)}/10`);
  console.log(`     - Government not prioritizing evaluation`);
  console.log(`     - This enables sleeper agents to succeed`);
}

console.log('\n' + '='.repeat(80));
console.log(`\n✅ Monte Carlo analysis complete!`);
console.log(`   ${NUM_RUNS} runs, ${MAX_MONTHS} months each`);
console.log(`   Total simulation time: ${totalTime.toFixed(1)}s\n`);
