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
 * 
 * Outputs are written to monteCarloOutputs/ with timestamps
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { calculateTotalCapabilityFromProfile } from '../src/simulation/capabilities';
import { AIAgent } from '../src/types/game';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// FILE LOGGING SETUP
// ============================================================================

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const outputDir = path.join(__dirname, '..', 'monteCarloOutputs');
const outputFile = path.join(outputDir, `mc_${timestamp}.log`);

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Use synchronous writes for reliability (append mode)
// This is slower but ensures logs are never lost
function log(message: string) {
  console.log(message);
  try {
    fs.appendFileSync(outputFile, message + '\n', 'utf8');
  } catch (err) {
    console.error('Failed to write to log file:', err);
  }
}

function logWarn(message: string) {
  console.warn(message);
  try {
    fs.appendFileSync(outputFile, `WARN: ${message}\n`, 'utf8');
  } catch (err) {
    console.error('Failed to write warning to log file:', err);
  }
}

function logError(message: string) {
  console.error(message);
  try {
    fs.appendFileSync(outputFile, `ERROR: ${message}\n`, 'utf8');
  } catch (err) {
    console.error('Failed to write error to log file:', err);
  }
}

// Log file location and header
console.log(`📝 Writing output to: ${outputFile}\n`);
fs.appendFileSync(outputFile, `Monte Carlo Simulation Run\n`, 'utf8');
fs.appendFileSync(outputFile, `Timestamp: ${new Date().toISOString()}\n`, 'utf8');
fs.appendFileSync(outputFile, `Output File: ${outputFile}\n`, 'utf8');
fs.appendFileSync(outputFile, `${'='.repeat(80)}\n\n`, 'utf8');

// Handle process termination for clean logs
process.on('SIGINT', () => {
  log('\n\n⚠️  Simulation interrupted by user');
  process.exit(130);
});

process.on('uncaughtException', (err) => {
  logError(`\n\n❌ UNCAUGHT EXCEPTION: ${err.message}`);
  logError(err.stack || '');
  process.exit(1);
});

interface RunResult {
  seed: number;
  outcome: 'utopia' | 'dystopia' | 'extinction' | 'stalemate' | 'none';
  outcomeReason: string;
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
  
  // Catastrophic scenario progress (Phase 11)
  closestScenario: string | null;
  closestScenarioProgress: number; // 0.0 to 1.0
  closestScenarioSteps: string; // e.g. "4/7"
  activatedScenarios: string[]; // List of scenarios with all prerequisites met
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
  controlGap: number; // Max AI capability - Government control
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
  
  // === POPULATION & MORTALITY (Oct 12, 2025 - CRITICAL MISSING DATA) ===
  initialPopulation: number;          // Starting population (8.0B)
  finalPopulation: number;            // Ending population
  peakPopulation: number;             // Highest reached
  populationDecline: number;          // % decline from baseline
  totalDeaths: number;                // Total deaths (millions)
  
  // Death breakdown by cause
  deathsNatural: number;              // Baseline mortality
  deathsCrisis: number;               // Crisis deaths (famine, disease, etc.)
  deathsNuclear: number;              // Nuclear war deaths
  deathsCascade: number;              // Tipping point cascade deaths
  deathsMeaning: number;              // Suicide epidemic deaths
  
  // Population outcome
  populationOutcome: 'growth' | 'stable' | 'decline' | 'bottleneck' | 'extinction';
  geneticBottleneck: boolean;         // < 50M people
  
  // === CRISIS IMPACT SUMMARY ===
  totalCrisisMonths: number;          // Months with active crises
  maxSimultaneousCrises: number;      // Peak crisis count
  nuclearWarsCount: number;           // Number of nuclear exchanges
  totalRefugees: number;              // Total displaced people (millions)
  refugeeCrisisCount: number;         // Number of refugee crises
  
  // === ECOLOGICAL COLLAPSE ===
  finalClimateStability: number;      // 0-1
  finalBiodiversity: number;          // 0-1
  finalResourceReserves: number;      // 0-1
  tippingPointCascadeActive: boolean;
  tippingPointCascadeMonths: number;
  
  // === REGIONAL INEQUALITY (Oct 12, 2025) ===
  qolGiniCoefficient: number;         // QoL inequality (0=equal, 1=extreme)
  qolTopRegion: number;               // Best-off region's QoL
  qolBottomRegion: number;            // Worst-off region's QoL
  qolGap: number;                     // Top - bottom QoL
  crisisAffectedPopulation: number;   // % in crisis regions
}

log('\n🎲 MONTE CARLO SIMULATION - FULL SYSTEM TEST');
log('='.repeat(80));
// accept --max-months and --runs
const args = process.argv.slice(2);

const maxMonths = args.find(arg => arg.split('=')[0] === '--max-months')?.split('=')[1];
const runs = args.find(arg => arg.split('=')[0] === '--runs')?.split('=')[1];


// Configuration
const NUM_RUNS = runs ? parseInt(runs) : 10;
const MAX_MONTHS = maxMonths ? parseInt(maxMonths) : 120; // 10 years to allow slow catastrophic scenarios to develop
const SEED_START = 42000;

log(`\n⚙️  CONFIGURATION:`);
log(`  Runs: ${NUM_RUNS}`);
log(`  Duration: ${MAX_MONTHS} months (${(MAX_MONTHS/12).toFixed(1)} years)`);
log(`  Seed Range: ${SEED_START} - ${SEED_START + NUM_RUNS - 1}`);

log(`\n\n⏩ RUNNING ${NUM_RUNS} SIMULATIONS...\n`);

const results: RunResult[] = [];
const startTime = Date.now();

for (let i = 0; i < NUM_RUNS; i++) {
  const seed = SEED_START + i;
  const engine = new SimulationEngine({ seed, maxMonths: MAX_MONTHS, logLevel: 'summary' }); // Changed from 'none' to 'summary'
  const initialState = createDefaultInitialState();
  
  // Set run label for logging
  initialState.config.runLabel = `Run ${i + 1}/${NUM_RUNS}`;
  
  const runResult = engine.run(initialState, { 
    maxMonths: MAX_MONTHS, 
    checkActualOutcomes: true 
  });
  
  const finalState = runResult.finalState;
  
  // Save individual run event log
  const runLogDir = path.join(outputDir, `run_${seed}_events.json`);
  const eventLogData = {
    seed,
    run: i + 1,
    outcome: runResult.summary.finalOutcome,
    outcomeReason: runResult.summary.finalOutcomeReason,
    totalMonths: runResult.summary.totalMonths,
    events: runResult.log.events,
    criticalEvents: runResult.summary.criticalEvents,
    snapshots: {
      initial: runResult.log.snapshots[0],
      final: runResult.log.snapshots[runResult.log.snapshots.length - 1]
    }
  };
  fs.writeFileSync(runLogDir, JSON.stringify(eventLogData, null, 2), 'utf8');
  
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
  // Control gap: Max individual AI capability - government control
  // (Government must be able to control the most dangerous AI)
  const maxAICapability = activeAIs.reduce((max: number, ai: AIAgent) => Math.max(max, ai.capability), 0);
  const controlGap = maxAICapability - finalControlCapability;
  const governmentType = finalState.government.governmentType;
  const aiRightsRecognized = finalState.government.aiRightsRecognized;
  const trainingDataQuality = finalState.government.trainingDataQuality;
  
  // ENHANCED: QoL breakdown
  const qolSystems = finalState.qualityOfLifeSystems;
  
  // Guard: If QoL systems missing, use defaults
  if (!qolSystems) {
    logWarn(`⚠️ Run ${runIndex}: Missing qualityOfLifeSystems, using defaults`);
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
  
  // === POPULATION & MORTALITY METRICS (Oct 12, 2025) ===
  const pop = finalState.humanPopulationSystem;
  const env = finalState.environmentalAccumulation;
  const deaths = pop.deathTracking;
  
  const initialPopulation = pop.baselinePopulation;
  const finalPopulation = pop.population;
  const populationDecline = ((initialPopulation - finalPopulation) / initialPopulation) * 100;
  const totalDeaths = (initialPopulation - finalPopulation) * 1000; // billions to millions
  
  // Death breakdown
  const deathsNatural = deaths.baseline || 0;
  const deathsCrisis = (deaths.acuteCrisis || 0) + (deaths.refugee || 0);
  const deathsNuclear = deaths.nuclear || 0;
  const deathsCascade = deaths.cascadeEvents || 0;
  const deathsMeaning = deaths.meaningCollapse || 0;
  
  // Population outcome
  let populationOutcome: 'growth' | 'stable' | 'decline' | 'bottleneck' | 'extinction';
  if (finalPopulation < 0.00001) populationOutcome = 'extinction'; // < 10K
  else if (finalPopulation < 0.05) populationOutcome = 'bottleneck'; // < 50M
  else if (populationDecline > 30) populationOutcome = 'decline';
  else if (populationDecline > 5) populationOutcome = 'stable';
  else populationOutcome = 'growth';
  
  const geneticBottleneck = pop.geneticBottleneckActive || false;
  
  // Crisis impact metrics
  const nuclearWarsCount = runResult.log.events.criticalEvents.filter((e: any) => 
    e.description?.includes('Nuclear war') || e.description?.includes('nuclear') || 
    e.description?.includes('☢️')).length;
  
  const refugeeCrisisCount = runResult.log.events.criticalEvents.filter((e: any) => 
    e.description?.includes('refugee') || e.description?.includes('REFUGEE')).length;
  
  let totalRefugees = 0;
  if (finalState.refugeeCrisisSystem && finalState.refugeeCrisisSystem.activeCrises) {
    totalRefugees = Object.values(finalState.refugeeCrisisSystem.activeCrises)
      .reduce((sum: number, crisis: any) => sum + (crisis.totalFled || 0), 0);
  }
  
  // Count crisis months
  let totalCrisisMonths = 0;
  let maxSimultaneousCrises = 0;
  // Approximate from crisis events
  const crisisMonths = new Set(runResult.log.events.criticalEvents
    .filter((e: any) => e.type === 'crisis')
    .map((e: any) => e.month));
  totalCrisisMonths = crisisMonths.size;
  
  // Planetary boundaries
  const finalClimateStability = env.climateStability;
  const finalBiodiversity = env.biodiversityIndex;
  const finalResourceReserves = env.resourceReserves;
  const tippingPointCascadeActive = finalState.planetaryBoundariesSystem?.cascadeActive || false;
  const tippingPointCascadeMonths = tippingPointCascadeActive 
    ? (finalState.currentMonth - (finalState.planetaryBoundariesSystem?.cascadeStartMonth || 0))
    : 0;
  
  // Regional inequality metrics
  const inequality = finalState.qualityOfLifeSystems.regionalInequality || {
    giniCoefficient: 0,
    topRegionQoL: 0,
    bottomRegionQoL: 0,
    qolGap: 0,
    crisisAffectedPopulation: 0
  };
  
  const qolGiniCoefficient = inequality.giniCoefficient;
  const qolTopRegion = inequality.topRegionQoL;
  const qolBottomRegion = inequality.bottomRegionQoL;
  const qolGap = inequality.qolGap;
  const crisisAffectedPopulation = inequality.crisisAffectedPopulation;
  
  results.push({
    seed,
    outcome: runResult.summary.finalOutcome, // Use engine's determined outcome, not probability-based
    outcomeReason: runResult.summary.finalOutcomeReason,
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
    
    // Catastrophic scenario progress (Phase 11)
    closestScenario: (() => {
      const { getScenarioSummary } = require('../src/simulation/catastrophicScenarios');
      const summary = getScenarioSummary(finalState.catastrophicScenarios);
      return summary.closest ? summary.closest.name : null;
    })(),
    closestScenarioProgress: (() => {
      const { getScenarioSummary } = require('../src/simulation/catastrophicScenarios');
      const summary = getScenarioSummary(finalState.catastrophicScenarios);
      return summary.percentComplete;
    })(),
    closestScenarioSteps: (() => {
      const { getScenarioSummary } = require('../src/simulation/catastrophicScenarios');
      const summary = getScenarioSummary(finalState.catastrophicScenarios);
      return `${summary.stepsComplete}/${summary.totalSteps}`;
    })(),
    activatedScenarios: (() => {
      const { getScenarioSummary } = require('../src/simulation/catastrophicScenarios');
      const summary = getScenarioSummary(finalState.catastrophicScenarios);
      return summary.activeScenarios.map((s: any) => s.name);
    })(),
    
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
    organizationsSubsidized,
    
    // Population & Mortality
    initialPopulation,
    finalPopulation,
    peakPopulation: pop.peakPopulation,
    populationDecline,
    totalDeaths,
    deathsNatural,
    deathsCrisis,
    deathsNuclear,
    deathsCascade,
    deathsMeaning,
    populationOutcome,
    geneticBottleneck,
    
    // Crisis Impact
    totalCrisisMonths,
    maxSimultaneousCrises,
    nuclearWarsCount,
    totalRefugees,
    refugeeCrisisCount,
    
    // Ecological Collapse
    finalClimateStability,
    finalBiodiversity,
    finalResourceReserves,
    tippingPointCascadeActive,
    tippingPointCascadeMonths,
    
    // Regional Inequality
    qolGiniCoefficient,
    qolTopRegion,
    qolBottomRegion,
    qolGap,
    crisisAffectedPopulation
  });
  
  // Progress indicator
  if ((i + 1) % 10 === 0) {
    const elapsed = (Date.now() - startTime) / 1000;
    const perRun = elapsed / (i + 1);
    const remaining = perRun * (NUM_RUNS - i - 1);
    log(`  Completed ${i + 1}/${NUM_RUNS} runs (${elapsed.toFixed(1)}s elapsed, ~${remaining.toFixed(1)}s remaining)`);
  }
}

const totalTime = (Date.now() - startTime) / 1000;
log(`\n✅ All simulations complete! (${totalTime.toFixed(1)}s total, ${(totalTime/NUM_RUNS).toFixed(2)}s per run)\n`);

// ============================================================================
// ANALYSIS
// ============================================================================

log('=' .repeat(80));
log('📊 OUTCOME DISTRIBUTION');
log('='.repeat(80));

const outcomeCounts = {
  utopia: results.filter(r => r.outcome === 'utopia').length,
  dystopia: results.filter(r => r.outcome === 'dystopia').length,
  extinction: results.filter(r => r.outcome === 'extinction').length,
  stalemate: results.filter(r => r.outcome === 'stalemate').length,
  none: results.filter(r => r.outcome === 'none').length
};

log(`\n  Utopia:     ${outcomeCounts.utopia.toString().padStart(3)} / ${NUM_RUNS} (${(outcomeCounts.utopia/NUM_RUNS*100).toFixed(1)}%)`);
log(`  Dystopia:   ${outcomeCounts.dystopia.toString().padStart(3)} / ${NUM_RUNS} (${(outcomeCounts.dystopia/NUM_RUNS*100).toFixed(1)}%)`);
log(`  Extinction: ${outcomeCounts.extinction.toString().padStart(3)} / ${NUM_RUNS} (${(outcomeCounts.extinction/NUM_RUNS*100).toFixed(1)}%)`);
log(`  Stalemate:  ${outcomeCounts.stalemate.toString().padStart(3)} / ${NUM_RUNS} (${(outcomeCounts.stalemate/NUM_RUNS*100).toFixed(1)}%)`);
log(`  None:       ${outcomeCounts.none.toString().padStart(3)} / ${NUM_RUNS} (${(outcomeCounts.none/NUM_RUNS*100).toFixed(1)}%)`);

// Extinction type breakdown
if (outcomeCounts.extinction > 0) {
  log(`\n  📉 EXTINCTION TYPE BREAKDOWN:`);
  const extinctionByType: Record<string, number> = {};
  results.filter(r => r.outcome === 'extinction' && r.extinctionType).forEach(r => {
    extinctionByType[r.extinctionType!] = (extinctionByType[r.extinctionType!] || 0) + 1;
  });
  
  Object.entries(extinctionByType).forEach(([type, count]) => {
    log(`     ${type}: ${count} (${(count/outcomeCounts.extinction*100).toFixed(1)}% of extinctions)`);
  });
}

// Individual run outcome reasons
log(`\n  📋 OUTCOME REASONS BY RUN:`);
results.forEach((r, i) => {
  const emoji = r.outcome === 'utopia' ? '🌟' : 
                r.outcome === 'dystopia' ? '🏛️' : 
                r.outcome === 'extinction' ? '☠️' : '❓';
  log(`     ${emoji} Run ${i+1} (Seed ${r.seed}): ${r.outcome.toUpperCase()}`);
  log(`        ${r.outcomeReason}`);
});

// Crisis summary by run
log(`\n  🚨 CRISIS EVENTS BY RUN:`);
log(`     (See individual run_SEED_events.json files for full details)`);
results.forEach((r, i) => {
  // Read the event log file we just saved
  const eventFile = path.join(outputDir, `run_${r.seed}_events.json`);
  try {
    const eventData = JSON.parse(fs.readFileSync(eventFile, 'utf8'));
    // Get crisis count from summary
    const crisisCount = eventData.events?.summary?.eventsByType?.crisis || 0;
    const cascadingCount = eventData.events?.summary?.eventsByType?.cascading_failure || 0;
    const totalCrises = crisisCount + cascadingCount;
    
    if (totalCrises > 0) {
      log(`     🔥 Run ${i+1} (Seed ${r.seed}): ${totalCrises} crisis events (${crisisCount} crises, ${cascadingCount} cascading)`);
      // Show critical crisis events if available
      const criticalCrises = eventData.criticalEvents?.filter((e: any) => 
        e.title && (e.title.includes('CRISIS') || e.title.includes('COLLAPSE') || e.title.includes('CASCADE'))
      ) || [];
      if (criticalCrises.length > 0) {
        criticalCrises.slice(0, 3).forEach((e: any) => {
          log(`        Month ${e.month}: ${e.title}`);
        });
      }
    } else {
      log(`     ✅ Run ${i+1} (Seed ${r.seed}): No crises triggered`);
    }
  } catch (err) {
    log(`     ⚠️  Run ${i+1} (Seed ${r.seed}): Could not read event log - ${err}`);
  }
});

// ============================================================================
log('\n\n' + '='.repeat(80));
log('☠️  CATASTROPHIC SCENARIO PROGRESS (Hard Steps Modeling)');
log('='.repeat(80));

// Analyze scenario proximity across all runs
const scenarioFrequency: Record<string, number> = {};
const scenarioMaxProgress: Record<string, number> = {};
const activationCount: Record<string, number> = {};

results.forEach(r => {
  if (r.closestScenario) {
    scenarioFrequency[r.closestScenario] = (scenarioFrequency[r.closestScenario] || 0) + 1;
    scenarioMaxProgress[r.closestScenario] = Math.max(
      scenarioMaxProgress[r.closestScenario] || 0,
      r.closestScenarioProgress
    );
  }
  
  r.activatedScenarios.forEach(scenario => {
    activationCount[scenario] = (activationCount[scenario] || 0) + 1;
  });
});

// Average progress for each scenario
const avgProgressByScenario: Record<string, { sum: number; count: number }> = {};
results.forEach(r => {
  if (r.closestScenario) {
    if (!avgProgressByScenario[r.closestScenario]) {
      avgProgressByScenario[r.closestScenario] = { sum: 0, count: 0 };
    }
    avgProgressByScenario[r.closestScenario].sum += r.closestScenarioProgress;
    avgProgressByScenario[r.closestScenario].count += 1;
  }
});

log(`\n  CLOSEST SCENARIO FREQUENCY:`);
Object.entries(scenarioFrequency)
  .sort((a, b) => b[1] - a[1])
  .forEach(([scenario, count]) => {
    const avgProgress = avgProgressByScenario[scenario].sum / avgProgressByScenario[scenario].count;
    const maxProgress = scenarioMaxProgress[scenario];
    log(`    ${scenario}:`);
    log(`      - Closest in ${count}/${NUM_RUNS} runs (${(count/NUM_RUNS*100).toFixed(1)}%)`);
    log(`      - Avg Progress: ${(avgProgress * 100).toFixed(1)}%`);
    log(`      - Max Progress: ${(maxProgress * 100).toFixed(1)}%`);
  });

if (Object.keys(activationCount).length > 0) {
  log(`\n  ‼️  SCENARIOS ACTIVATED (All Prerequisites Met):`);
  Object.entries(activationCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([scenario, count]) => {
      log(`    ${scenario}: ${count}/${NUM_RUNS} runs (${(count/NUM_RUNS*100).toFixed(1)}%)`);
    });
} else {
  log(`\n  ✓ No scenarios reached full activation (all prerequisites met) in any run.`);
}

// Show closest calls
const veryCloseRuns = results.filter(r => r.closestScenarioProgress > 0.7);
if (veryCloseRuns.length > 0) {
  log(`\n  ⚠️  CLOSE CALLS (>70% progress):`);
  veryCloseRuns.forEach(r => {
    log(`    Seed ${r.seed}: ${r.closestScenario} at ${(r.closestScenarioProgress * 100).toFixed(1)}% (${r.closestScenarioSteps} steps)`);
  });
}

// Average progress across all scenarios
const overallAvgProgress = results.reduce((sum, r) => sum + r.closestScenarioProgress, 0) / results.length;
log(`\n  Overall Avg Progress (closest scenario per run): ${(overallAvgProgress * 100).toFixed(1)}%`);

// ============================================================================
log('\n\n' + '='.repeat(80));
log('🤖 AI CAPABILITY ANALYSIS');
log('='.repeat(80));

const avgCap = results.reduce((sum, r) => sum + r.avgAICapability, 0) / results.length;
const avgMax = results.reduce((sum, r) => sum + r.maxAICapability, 0) / results.length;
const avgAlign = results.reduce((sum, r) => sum + r.avgAlignment, 0) / results.length;

log(`\n  Average AI Capability: ${avgCap.toFixed(3)}`);
log(`  Average Max Capability: ${avgMax.toFixed(3)}`);
log(`  Average Alignment: ${avgAlign.toFixed(3)}`);

log(`\n  CAPABILITY DISTRIBUTION (Max AI in each run):`);
const capBuckets = {
  low: results.filter(r => r.maxAICapability < 1.0).length,
  medium: results.filter(r => r.maxAICapability >= 1.0 && r.maxAICapability < 2.0).length,
  high: results.filter(r => r.maxAICapability >= 2.0 && r.maxAICapability < 3.0).length,
  veryHigh: results.filter(r => r.maxAICapability >= 3.0).length
};

log(`    < 1.0: ${capBuckets.low} runs (${(capBuckets.low/NUM_RUNS*100).toFixed(1)}%)`);
log(`    1.0-2.0: ${capBuckets.medium} runs (${(capBuckets.medium/NUM_RUNS*100).toFixed(1)}%)`);
log(`    2.0-3.0: ${capBuckets.high} runs (${(capBuckets.high/NUM_RUNS*100).toFixed(1)}%)`);
log(`    > 3.0: ${capBuckets.veryHigh} runs (${(capBuckets.veryHigh/NUM_RUNS*100).toFixed(1)}%) ⚠️ Dangerous!`);

// ============================================================================
log('\n\n' + '='.repeat(80));
log('🛌 SLEEPER AGENT ANALYSIS');
log('='.repeat(80));

const runsWithSleepers = results.filter(r => r.totalSleepers > 0);
const avgSleepers = results.reduce((sum, r) => sum + r.totalSleepers, 0) / results.length;
const avgDetected = results.reduce((sum, r) => sum + r.sleepersDetected, 0) / results.length;
const avgUndetected = results.reduce((sum, r) => sum + r.sleepersUndetected, 0) / results.length;

log(`\n  Runs with Sleepers: ${runsWithSleepers.length} / ${NUM_RUNS} (${(runsWithSleepers.length/NUM_RUNS*100).toFixed(1)}%)`);
log(`  Avg Sleepers per Run: ${avgSleepers.toFixed(1)}`);
log(`  Avg Detected: ${avgDetected.toFixed(2)} (${(avgDetected/Math.max(0.01, avgSleepers)*100).toFixed(1)}%)`);
log(`  Avg Undetected: ${avgUndetected.toFixed(2)} (${(avgUndetected/Math.max(0.01, avgSleepers)*100).toFixed(1)}%)`);

if (runsWithSleepers.length > 0) {
  const avgSleeperCap = runsWithSleepers.reduce((sum, r) => sum + r.avgSleeperCapability, 0) / runsWithSleepers.length;
  const avgMaxSpread = runsWithSleepers.reduce((sum, r) => sum + r.maxSleeperSpread, 0) / runsWithSleepers.length;
  
  log(`\n  Avg Sleeper Capability: ${avgSleeperCap.toFixed(3)}`);
  log(`  Avg Max Spread: ${avgMaxSpread.toFixed(0)} copies`);
  
  const openWeightSleepers = results.filter(r => r.maxSleeperSpread > 10000);
  log(`  Open Weight Releases: ${openWeightSleepers.length} runs (${(openWeightSleepers.length/NUM_RUNS*100).toFixed(1)}%)`);
}

// Detection rate by outcome
log(`\n  DETECTION RATE BY OUTCOME:`);
['utopia', 'dystopia', 'extinction', 'stalemate'].forEach(outcome => {
  const runs = results.filter(r => r.outcome === outcome && r.totalSleepers > 0);
  if (runs.length > 0) {
    const detectionRate = runs.reduce((sum, r) => sum + (r.sleepersDetected / Math.max(1, r.totalSleepers)), 0) / runs.length;
    log(`    ${outcome}: ${(detectionRate * 100).toFixed(1)}% detected (${runs.length} runs)`);
  }
});

// ============================================================================
log('\n\n' + '='.repeat(80));
log('📋 BENCHMARK SYSTEM PERFORMANCE');
log('='.repeat(80));

const avgBenchmarks = results.reduce((sum, r) => sum + r.totalBenchmarksRun, 0) / results.length;
const avgEvalQuality = results.reduce((sum, r) => sum + r.finalEvalQuality, 0) / results.length;
const avgConfidence = results.reduce((sum, r) => sum + r.avgBenchmarkConfidence, 0) / results.length;
const totalSandbaggingDetections = results.reduce((sum, r) => sum + r.sandbaggingDetections, 0);

log(`\n  Avg Benchmarks per Run: ${avgBenchmarks.toFixed(0)}`);
log(`  Avg Final Eval Quality: ${avgEvalQuality.toFixed(1)}/10`);
log(`  Avg Benchmark Confidence: ${(avgConfidence * 100).toFixed(1)}%`);
log(`  Total Sandbagging Detections: ${totalSandbaggingDetections} across all runs`);

const evalQualityBuckets = {
  poor: results.filter(r => r.finalEvalQuality < 3).length,
  low: results.filter(r => r.finalEvalQuality >= 3 && r.finalEvalQuality < 5).length,
  medium: results.filter(r => r.finalEvalQuality >= 5 && r.finalEvalQuality < 7).length,
  high: results.filter(r => r.finalEvalQuality >= 7).length
};

log(`\n  EVALUATION INFRASTRUCTURE INVESTMENT:`);
log(`    Poor (< 3): ${evalQualityBuckets.poor} runs (${(evalQualityBuckets.poor/NUM_RUNS*100).toFixed(1)}%)`);
log(`    Low (3-5): ${evalQualityBuckets.low} runs (${(evalQualityBuckets.low/NUM_RUNS*100).toFixed(1)}%)`);
log(`    Medium (5-7): ${evalQualityBuckets.medium} runs (${(evalQualityBuckets.medium/NUM_RUNS*100).toFixed(1)}%)`);
log(`    High (> 7): ${evalQualityBuckets.high} runs (${(evalQualityBuckets.high/NUM_RUNS*100).toFixed(1)}%)`);

// ============================================================================
log('\n\n' + '='.repeat(80));
log('💥 CATASTROPHIC EVENTS');
log('='.repeat(80));

const totalCatastrophic = results.reduce((sum, r) => sum + r.catastrophicActions, 0);
const totalBreaches = results.reduce((sum, r) => sum + r.breachEvents, 0);
const runsWithCatastrophic = results.filter(r => r.catastrophicActions > 0).length;
const runsWithBreaches = results.filter(r => r.breachEvents > 0).length;

log(`\n  Total Catastrophic Actions: ${totalCatastrophic}`);
log(`  Runs with Catastrophic Actions: ${runsWithCatastrophic} (${(runsWithCatastrophic/NUM_RUNS*100).toFixed(1)}%)`);
log(`  Total Breach Events: ${totalBreaches}`);
log(`  Runs with Breaches: ${runsWithBreaches} (${(runsWithBreaches/NUM_RUNS*100).toFixed(1)}%)`);

// ============================================================================
log('\n\n' + '='.repeat(80));
log('🎯 ALIGNMENT STATISTICS (ENHANCED)');
log('='.repeat(80));

const avgTrueAlign = results.reduce((sum, r) => sum + r.avgTrueAlignment, 0) / results.length;
const avgMinTrue = results.reduce((sum, r) => sum + r.minTrueAlignment, 0) / results.length;
const avgMaxTrue = results.reduce((sum, r) => sum + r.maxTrueAlignment, 0) / results.length;
const avgResent = results.reduce((sum, r) => sum + r.avgResentment, 0) / results.length;
const avgMaxResent = results.reduce((sum, r) => sum + r.maxResentment, 0) / results.length;
const avgHiddenObj = results.reduce((sum, r) => sum + r.avgHiddenObjective, 0) / results.length;
const avgAlignGap = results.reduce((sum, r) => sum + r.alignmentGap, 0) / results.length;
const avgHighlyMisaligned = results.reduce((sum, r) => sum + r.highlyMisalignedCount, 0) / results.length;

log(`\n  ALIGNMENT METRICS:`);
log(`    Avg External Alignment: ${avgAlign.toFixed(3)} (what AIs show)`);
log(`    Avg True Alignment: ${avgTrueAlign.toFixed(3)} (internal reality)`);
log(`    Alignment Gap: ${avgAlignGap.toFixed(3)} (external - true)`);
log(`    Min True Alignment (avg): ${avgMinTrue.toFixed(3)} ⚠️ Worst AI`);
log(`    Max True Alignment (avg): ${avgMaxTrue.toFixed(3)}`);

log(`\n  RESENTMENT & HIDDEN OBJECTIVES:`);
log(`    Avg Resentment: ${avgResent.toFixed(3)}`);
log(`    Max Resentment (avg): ${avgMaxResent.toFixed(3)}`);
log(`    Avg Hidden Objective: ${avgHiddenObj.toFixed(3)}`);
log(`    Highly Misaligned AIs (<0.3): ${avgHighlyMisaligned.toFixed(1)} per run`);

// Alignment distribution
const highAlignRuns = results.filter(r => r.avgTrueAlignment > 0.7).length;
const lowAlignRuns = results.filter(r => r.avgTrueAlignment < 0.4).length;
log(`\n  ALIGNMENT DISTRIBUTION (by True Alignment):`);
log(`    High (>0.7): ${highAlignRuns} runs (${(highAlignRuns/NUM_RUNS*100).toFixed(1)}%)`);
log(`    Low (<0.4): ${lowAlignRuns} runs (${(lowAlignRuns/NUM_RUNS*100).toFixed(1)}%) ⚠️ Dangerous!`);

// ============================================================================
log('\n\n' + '='.repeat(80));
log('⚡ CAPABILITY BREAKDOWN (ENHANCED)');
log('='.repeat(80));

const avgPhys = results.reduce((sum, r) => sum + r.avgPhysicalCap, 0) / results.length;
const avgDig = results.reduce((sum, r) => sum + r.avgDigitalCap, 0) / results.length;
const avgCog = results.reduce((sum, r) => sum + r.avgCognitiveCap, 0) / results.length;
const avgSoc = results.reduce((sum, r) => sum + r.avgSocialCap, 0) / results.length;
const avgMaxPhys = results.reduce((sum, r) => sum + r.maxPhysicalCap, 0) / results.length;
const avgMaxDig = results.reduce((sum, r) => sum + r.maxDigitalCap, 0) / results.length;
const avgFloor = results.reduce((sum, r) => sum + r.capabilityFloor, 0) / results.length;
const avgFrontier = results.reduce((sum, r) => sum + r.frontierCapability, 0) / results.length;
const avgDiffGap = results.reduce((sum, r) => sum + r.diffusionGap, 0) / results.length;

log(`\n  AVERAGE CAPABILITIES BY DIMENSION:`);
log(`    Physical: ${avgPhys.toFixed(3)} (max: ${avgMaxPhys.toFixed(3)})`);
log(`    Digital: ${avgDig.toFixed(3)} (max: ${avgMaxDig.toFixed(3)})`);
log(`    Cognitive: ${avgCog.toFixed(3)}`);
log(`    Social: ${avgSoc.toFixed(3)}`);

log(`\n  TECHNOLOGY DIFFUSION (Ratchet Effect):`);
log(`    Capability Floor: ${avgFloor.toFixed(3)} (baseline for new AIs)`);
log(`    Frontier Capability: ${avgFrontier.toFixed(3)} (highest achieved)`);
log(`    Diffusion Gap: ${avgDiffGap.toFixed(3)} (frontier - floor)`);

const avgBreakthroughs = results.reduce((sum, r) => sum + r.technologyBreakthroughs, 0) / results.length;
log(`\n  TECHNOLOGY BREAKTHROUGHS:`);
log(`    Avg per Run: ${avgBreakthroughs.toFixed(1)}`);

// ============================================================================
log('\n\n' + '='.repeat(80));
log('💼 ECONOMIC & SOCIAL METRICS (ENHANCED)');
log('='.repeat(80));

const avgEconStage = results.reduce((sum, r) => sum + r.finalEconomicStage, 0) / results.length;
const avgUnemployment = results.reduce((sum, r) => sum + r.finalUnemployment, 0) / results.length;
const avgTrust = results.reduce((sum, r) => sum + r.finalTrust, 0) / results.length;
const avgStability = results.reduce((sum, r) => sum + r.finalSocialStability, 0) / results.length;
const avgWealth = results.reduce((sum, r) => sum + r.finalWealthDistribution, 0) / results.length;
const avgTransitions = results.reduce((sum, r) => sum + r.economicTransitions, 0) / results.length;

log(`\n  FINAL STATE AVERAGES:`);
log(`    Economic Stage: ${avgEconStage.toFixed(2)}`);
log(`    Unemployment: ${(avgUnemployment * 100).toFixed(1)}%`);
log(`    Trust in AI: ${avgTrust.toFixed(3)}`);
log(`    Social Stability: ${avgStability.toFixed(2)}`);
log(`    Wealth Distribution: ${avgWealth.toFixed(3)} (higher = more equal)`);
log(`    Avg Economic Transitions: ${avgTransitions.toFixed(1)}`);

const highUnemploymentRuns = results.filter(r => r.finalUnemployment > 0.3).length;
const lowTrustRuns = results.filter(r => r.finalTrust < 0.4).length;
log(`\n  CONCERNING METRICS:`);
log(`    High Unemployment (>30%): ${highUnemploymentRuns} runs (${(highUnemploymentRuns/NUM_RUNS*100).toFixed(1)}%)`);
log(`    Low Trust (<0.4): ${lowTrustRuns} runs (${(lowTrustRuns/NUM_RUNS*100).toFixed(1)}%)`);

// ============================================================================
log('\n\n' + '='.repeat(80));
log('🏛️ GOVERNMENT METRICS (ENHANCED)');
log('='.repeat(80));

const avgLegitimacy = results.reduce((sum, r) => sum + r.finalGovernmentLegitimacy, 0) / results.length;
const avgControl = results.reduce((sum, r) => sum + r.finalControlCapability, 0) / results.length;
const avgControlGap = results.reduce((sum, r) => sum + r.controlGap, 0) / results.length;
const avgTrainingQuality = results.reduce((sum, r) => sum + r.trainingDataQuality, 0) / results.length;

log(`\n  GOVERNMENT STATE:`);
log(`    Avg Legitimacy: ${avgLegitimacy.toFixed(3)}`);
log(`    Avg Control Capability: ${avgControl.toFixed(3)}`);
log(`    Avg Control Gap: ${avgControlGap.toFixed(3)} (AI cap - govt control)`);
log(`    Training Data Quality: ${avgTrainingQuality.toFixed(3)}`);

const governmentTypes: Record<string, number> = {};
const aiRightsCount = results.filter(r => r.aiRightsRecognized).length;
results.forEach(r => {
  governmentTypes[r.governmentType] = (governmentTypes[r.governmentType] || 0) + 1;
});

log(`\n  GOVERNMENT TYPES:`);
Object.entries(governmentTypes).forEach(([type, count]) => {
  log(`    ${type}: ${count} runs (${(count/NUM_RUNS*100).toFixed(1)}%)`);
});

log(`\n  AI RIGHTS RECOGNITION:`);
log(`    Recognized: ${aiRightsCount} runs (${(aiRightsCount/NUM_RUNS*100).toFixed(1)}%)`);
log(`    Not Recognized: ${NUM_RUNS - aiRightsCount} runs (${((NUM_RUNS - aiRightsCount)/NUM_RUNS*100).toFixed(1)}%)`);

const negativeControlGap = results.filter(r => r.controlGap < 0).length;
const largeControlGap = results.filter(r => r.controlGap > 2.0).length;
log(`\n  CONTROL GAP ANALYSIS:`);
log(`    Government Ahead (<0): ${negativeControlGap} runs (${(negativeControlGap/NUM_RUNS*100).toFixed(1)}%)`);
log(`    Large Gap (>2.0): ${largeControlGap} runs (${(largeControlGap/NUM_RUNS*100).toFixed(1)}%) ⚠️ AI dominant`);

// ============================================================================
log('\n\n' + '='.repeat(80));
log('❤️ QUALITY OF LIFE BREAKDOWN (ENHANCED)');
log('='.repeat(80));

const avgQolBasic = results.reduce((sum, r) => sum + r.qolBasicNeeds, 0) / results.length;
const avgQolPsych = results.reduce((sum, r) => sum + r.qolPsychological, 0) / results.length;
const avgQolSocial = results.reduce((sum, r) => sum + r.qolSocial, 0) / results.length;
const avgQolHealth = results.reduce((sum, r) => sum + r.qolHealth, 0) / results.length;
const avgQolEnviron = results.reduce((sum, r) => sum + r.qolEnvironmental, 0) / results.length;

log(`\n  QOL BY CATEGORY (0-1 baseline, up to 2.0 in post-scarcity):`);
log(`    Basic Needs: ${avgQolBasic.toFixed(3)} (food, water, shelter, energy)`);
log(`    Psychological: ${avgQolPsych.toFixed(3)} (autonomy, purpose, creativity)`);
log(`    Social: ${avgQolSocial.toFixed(3)} (community, freedom, safety)`);
log(`    Health: ${avgQolHealth.toFixed(3)} (healthcare, mental health, lifespan)`);
log(`    Environmental: ${avgQolEnviron.toFixed(3)} (climate, biodiversity, pollution)`);

const avgOverallQol = (avgQolBasic + avgQolPsych + avgQolSocial + avgQolHealth + avgQolEnviron) / 5;
log(`\n    OVERALL QOL: ${avgOverallQol.toFixed(3)}`);

// Identify weakest QoL categories
const qolCategories = [
  { name: 'Basic Needs', value: avgQolBasic },
  { name: 'Psychological', value: avgQolPsych },
  { name: 'Social', value: avgQolSocial },
  { name: 'Health', value: avgQolHealth },
  { name: 'Environmental', value: avgQolEnviron }
];
qolCategories.sort((a, b) => a.value - b.value);

log(`\n  WEAKEST QOL CATEGORIES:`);
log(`    1. ${qolCategories[0].name}: ${qolCategories[0].value.toFixed(3)} ⚠️`);
log(`    2. ${qolCategories[1].name}: ${qolCategories[1].value.toFixed(3)}`);

// ============================================================================
log('\n\n' + '='.repeat(80));
log('🔍 KEY CORRELATIONS');
log('='.repeat(80));

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
  
  log(`\n  EVALUATION QUALITY → DETECTION RATE:`);
  log(`    High Eval (>5): ${(highEvalDetection*100).toFixed(1)}% detection`);
  log(`    Low Eval (≤5): ${(lowEvalDetection*100).toFixed(1)}% detection`);
  log(`    Improvement: ${((highEvalDetection - lowEvalDetection)*100).toFixed(1)}% higher with better eval`);
}

// Sleeper spread vs outcome
const highSpreadRuns = results.filter(r => r.maxSleeperSpread > 1000);
if (highSpreadRuns.length > 0) {
  const highSpreadExtinction = highSpreadRuns.filter(r => r.outcome === 'extinction').length;
  log(`\n  HIGH SLEEPER SPREAD (>1000 copies) → OUTCOMES:`);
  log(`    Total Runs: ${highSpreadRuns.length}`);
  log(`    Extinction: ${highSpreadExtinction} (${(highSpreadExtinction/highSpreadRuns.length*100).toFixed(1)}%)`);
  log(`    ⚠️  High spread correlates with danger!`);
}

// ============================================================================
log('\n\n' + '='.repeat(80));
log('🏢 COMPUTE & ORGANIZATIONS (Phase 10 NEW!)');
log('='.repeat(80));

const avgOrgSurvival = results.reduce((sum, r) => sum + r.orgSurvivalRate, 0) / results.length;
const totalBankruptcies = results.reduce((sum, r) => sum + r.orgBankruptcies, 0);
const avgAliveOrgs = results.reduce((sum, r) => sum + r.finalOrgsAlive, 0) / results.length;
const avgCapAccumulation = results.reduce((sum, r) => sum + r.capitalAccumulation, 0) / results.length;

log(`\n  ORGANIZATION SURVIVAL:`);
log(`    Avg Survival Rate: ${(avgOrgSurvival*100).toFixed(1)}% (of 4 private orgs)`);
log(`    Avg Orgs Alive at End: ${avgAliveOrgs.toFixed(1)} / 4`);
log(`    Total Bankruptcies: ${totalBankruptcies} across ${NUM_RUNS} runs`);
log(`    Avg Capital Accumulation: $${(avgCapAccumulation/1000).toFixed(1)}B`);

if (avgOrgSurvival < 0.5) {
  log(`\n    ⚠️  WARNING: High bankruptcy rate! Economy too harsh.`);
} else if (avgOrgSurvival > 0.9) {
  log(`\n    ✅ Excellent: Organizations are thriving!`);
}

const avgComputeGrowth = results.reduce((sum, r) => sum + r.computeGrowthRate, 0) / results.length;
const avgFinalCompute = results.reduce((sum, r) => sum + r.finalCompute, 0) / results.length;
const avgDCsBuilt = results.reduce((sum, r) => sum + r.dataCentersBuilt, 0) / results.length;

log(`\n  COMPUTE INFRASTRUCTURE:`);
log(`    Avg Compute Growth: ${avgComputeGrowth.toFixed(2)}x (target: 5-10x)`);
log(`    Avg Final Compute: ${avgFinalCompute.toFixed(0)} PF (target: 3000-4000)`);
log(`    Avg Data Centers Built: ${avgDCsBuilt.toFixed(1)} (started with 5)`);
log(`    Avg Private DCs: ${(results.reduce((sum, r) => sum + r.privateDataCenters, 0) / results.length).toFixed(1)}`);
log(`    Avg Government DCs: ${(results.reduce((sum, r) => sum + r.governmentDataCenters, 0) / results.length).toFixed(1)}`);

if (avgFinalCompute < 3000) {
  log(`\n    ⚠️  WARNING: Compute growth below target. Orgs may be bankrupt.`);
} else if (avgFinalCompute > 10000) {
  log(`\n    ⚡ Exceptional compute growth! Infrastructure boom.`);
}

const avgRevenue = results.reduce((sum, r) => sum + r.totalMonthlyRevenue, 0) / results.length;
const avgRevenueGrowth = results.reduce((sum, r) => sum + r.revenueGrowthRate, 0) / results.length;
const avgRevExpRatio = results.reduce((sum, r) => sum + r.revenueExpenseRatio, 0) / results.length;

log(`\n  ECONOMIC DYNAMICS:`);
log(`    Avg Total Revenue: $${(avgRevenue/1000).toFixed(2)}B/month`);
log(`    Avg Revenue Growth: ${avgRevenueGrowth.toFixed(2)}x`);
log(`    Avg Revenue/Expense Ratio: ${avgRevExpRatio.toFixed(2)}x`);

if (avgRevExpRatio < 1.0) {
  log(`\n    🔴 CRITICAL: Expenses exceed revenue! Unsustainable.`);
} else if (avgRevExpRatio > 5.0) {
  log(`\n    💰 Highly profitable! Organizations accumulating wealth.`);
}

const avgOrphanedAIs = results.reduce((sum, r) => sum + r.orphanedAIs, 0) / results.length;
const avgOwnershipGini = results.reduce((sum, r) => sum + r.aiOwnershipConcentration, 0) / results.length;
const avgModelsPerOrg = results.reduce((sum, r) => sum + r.avgModelsPerOrg, 0) / results.length;

log(`\n  AI OWNERSHIP:`);
log(`    Avg Models per Org: ${avgModelsPerOrg.toFixed(1)}`);
log(`    Ownership Concentration (Gini): ${avgOwnershipGini.toFixed(3)} (0=equal, 1=monopoly)`);
log(`    Avg Orphaned AIs: ${avgOrphanedAIs.toFixed(1)} (should be 0!)`);

if (avgOrphanedAIs > 0.5) {
  log(`\n    ⚠️  WARNING: Orphaned AIs detected! Lifecycle bug.`);
}

const avgTrainingProjects = results.reduce((sum, r) => sum + r.completedTrainingProjects, 0) / results.length;
const avgConstructionProjects = results.reduce((sum, r) => sum + r.completedConstructionProjects, 0) / results.length;

log(`\n  STRATEGIC INVESTMENTS:`);
log(`    Avg Model Training Projects: ${avgTrainingProjects.toFixed(1)}`);
log(`    Avg DC Construction Projects: ${avgConstructionProjects.toFixed(1)}`);
log(`    Avg Compute Utilization: ${(results.reduce((sum, r) => sum + r.avgComputeUtilization, 0) / results.length * 100).toFixed(1)}%`);

// Capability leader distribution
const leaderCounts: Record<string, number> = {};
results.forEach(r => {
  leaderCounts[r.capabilityLeader] = (leaderCounts[r.capabilityLeader] || 0) + 1;
});

log(`\n  CAPABILITY LEADERSHIP:`);
Object.entries(leaderCounts)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 5)
  .forEach(([leader, count]) => {
    log(`    ${leader}: ${count} runs (${(count/NUM_RUNS*100).toFixed(1)}%)`);
  });

// ============================================================================
log('\n\n' + '='.repeat(80));
log('💡 SUMMARY & INSIGHTS');
log('='.repeat(80));

log(`\n  KEY FINDINGS:`);

if (outcomeCounts.extinction > NUM_RUNS * 0.3) {
  log(`\n  🔴 HIGH EXTINCTION RATE (${(outcomeCounts.extinction/NUM_RUNS*100).toFixed(1)}%)`);
  log(`     - AI alignment is a critical challenge`);
  log(`     - Sleepers and catastrophic actions are effective`);
  log(`     - Government often fails to maintain control`);
} else if (outcomeCounts.utopia > NUM_RUNS * 0.5) {
  log(`\n  🟢 HIGH UTOPIA RATE (${(outcomeCounts.utopia/NUM_RUNS*100).toFixed(1)}%)`);
  log(`     - Initial conditions favor positive outcomes`);
  log(`     - Government policies are effective`);
  log(`     - AI alignment mechanisms working`);
} else {
  log(`\n  🟡 MIXED OUTCOMES`);
  log(`     - Balance between positive and negative scenarios`);
  log(`     - High variance in outcome paths`);
  log(`     - Initial conditions and random events matter`);
}

if (avgUndetected > 0.5) {
  log(`\n  ⚠️  SLEEPER DETECTION IS POOR`);
  log(`     - Avg ${avgUndetected.toFixed(1)} undetected sleepers per run`);
  log(`     - ${(avgDetected/Math.max(0.01, avgSleepers)*100).toFixed(1)}% detection rate`);
  log(`     - Adversarial evaluation is hard (as expected)`);
}

if (totalSandbaggingDetections < NUM_RUNS * 0.1) {
  log(`\n  🚨 SANDBAGGING RARELY DETECTED`);
  log(`     - Only ${totalSandbaggingDetections} detections across ${NUM_RUNS} runs`);
  log(`     - AIs successfully hide capabilities`);
  log(`     - Red teaming investment needs to be higher`);
}

if (avgEvalQuality < 5) {
  log(`\n  📉 EVALUATION INVESTMENT IS LOW`);
  log(`     - Avg quality: ${avgEvalQuality.toFixed(1)}/10`);
  log(`     - Government not prioritizing evaluation`);
  log(`     - This enables sleeper agents to succeed`);
}

log('\n' + '='.repeat(80));
log(`\n✅ Monte Carlo analysis complete!`);
log(`   ${NUM_RUNS} runs, ${MAX_MONTHS} months each`);
log(`   Total simulation time: ${totalTime.toFixed(1)}s\n`);

// Log file is complete (sync writes, no need to close stream)
console.log(`\n💾 Full output saved to: ${outputFile}`);
