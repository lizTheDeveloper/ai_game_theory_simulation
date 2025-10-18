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
import { AIAgent, ScenarioMode } from '../src/types/game';
import { getScenarioDescription } from '../src/simulation/scenarioParameters';
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
// This is slower but ensures logs are never lost (BUG-13: Design choice, not bug)
// For long runs, consider batch writing or async I/O, but current approach is safest
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
  scenarioMode: ScenarioMode; // P0.7 (Oct 16, 2025): Scenario parameter mode used for this run
  outcome: 'utopia' | 'dystopia' | 'extinction' | 'stalemate' | 'none';
  rawOutcome?: string; // FIX (Oct 13, 2025): Store actual 7-tier outcome
  outcomeReason: string;
  months: number;

  // Final metrics
  finalQoL: number;
  finalAICount: number;
  avgAICapability: number;
  maxAICapability: number;
  minAICapability: number;
  avgAlignment: number;
  
  // NEW (Oct 12, 2025): Survival Fundamentals
  foodSecurity: number;
  waterSecurity: number;
  thermalHabitability: number;
  shelterSecurity: number;
  
  // NEW (Oct 12, 2025): Distribution Metrics
  globalGini: number;
  worstRegionQoL: number;
  bestRegionQoL: number;
  crisisAffectedFraction: number;
  isDystopicInequality: boolean;
  isRegionalDystopia: boolean;
  
  // NEW (Oct 12, 2025): Famine Statistics
  totalFamineDeaths: number;        // Total deaths from famines (billions)
  activeFamines: number;             // Number of active famines at end
  genocideFamines: number;           // Count of genocide-driven famines
  techPreventedDeaths: number;       // Deaths prevented by tech (billions)
  famineAffectedRegions: string[];   // Regions that experienced famines
  
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
  deathsClimateEcoPollution: number;  // Environmental crises (climate, ecosystem, pollution, cascade)
  deathsNuclear: number;              // Nuclear war deaths
  deathsMeaning: number;              // Suicide epidemic deaths

  // Multi-dimensional death tracking (Oct 18, 2025)
  deathsByProximate: {                // WHAT killed them (medical/physical cause)
    war: number;
    famine: number;
    disasters: number;
    disease: number;
    ecosystem: number;
    pollution: number;
    ai: number;
    cascade: number;
    other: number;
  };
  deathsByRoot: {                     // WHY it happened (underlying driver)
    climateChange: number;
    conflict: number;
    governance: number;
    alignment: number;
    natural: number;
    poverty: number;
    other: number;
  };

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
  
  // === PER-COUNTRY POPULATION (TIER 1.7.2) ===
  countriesDepopulated: number;       // Number of countries that collapsed
  nuclearPowersSurviving: number;     // Nuclear powers still functioning
  aiHubsSurviving: number;            // AI development centers still functioning
  depopulationEvents: string[];       // List of countries that depopulated
  
  // === ORGANIZATION SURVIVAL (TIER 1.7.3) ===
  organizationsBankrupt: number;      // Number of organizations that collapsed
  organizationSurvivalRate: number;   // % of organizations still functioning
  bankruptcyEvents: string[];         // List of orgs that went bankrupt (with reasons)

  // === STRATIFIED OUTCOME CLASSIFICATION (Phase 1B, Oct 17 2025) ===
  stratifiedOutcome?: string;         // Refined outcome (humane-utopia, pyrrhic-utopia, etc.)
  mortalityBand?: string;             // Mortality severity (low, moderate, high, extreme, bottleneck)
  mortalityRate?: number;             // Actual mortality rate (0.0 to 1.0)

  // === RECOVERY TIMELINE TRACKING (NEW - Oct 17 2025) ===
  recoveryTimeline?: {
    phases: Array<{
      phase: 'decline' | 'inflection' | 'recovery' | 'stable' | 'collapse';
      startMonth: number;
      endMonth: number;
      popChangePercent: number;  // Population change during phase (negative = decline)
      qolChange: number;         // QoL change during phase
    }>;
    keyEvents: Array<{
      month: number;
      event: string;
      type: 'tipping_cascade' | 'breakthrough' | 'spiral_activation' | 'crisis' | 'policy' | 'shock';
    }>;
    inflectionPoint?: number;        // Month when recovery began (if applicable)
    recoveryTrigger?: string;        // What triggered recovery
    spiralsActivated: string[];      // Which spirals activated
    breakthroughClusters: Array<{    // Levy flight clusters
      startMonth: number;
      endMonth: number;
      breakthroughCount: number;
      technologies: string[];
    }>;
    ubiFloorMaintained: boolean;     // Did UBI stay >35% throughout?
    minUBILevel: number;             // Lowest UBI level reached
    breakthroughCompounding: number; // Final compounding multiplier
    maxBreakthroughCompounding: number; // Peak compounding
  };

  // === MECHANISM ENABLERS ===
  mechanismSummary?: {
    levyFlightCluster: boolean;           // 8+ breakthroughs in <20 months
    exogenousPositiveShock: boolean;      // Black/gray swan tech
    ubiFlo orPersistent: boolean;          // UBI >35% maintained
    breakthroughCompounding: number;       // Final compounding level
    earlySpiralActivation: boolean;        // Spiral before Month 60
    breakthroughDrought: boolean;          // 0-2 breakthroughs for >30 months
    tippingCascadeWithoutSpiral: boolean;  // Cascade but no recovery
    failedRecoveryAttempt: boolean;        // Recovered then collapsed
  };
}

/**
 * Analyze recovery timeline from simulation history
 * Detects decline/inflection/recovery phases, key events, and mechanisms
 */
function analyzeRecoveryTimeline(runResult: any, finalState: any): RunResult['recoveryTimeline'] {
  const popHistory: Array<{ month: number; pop: number; qol: number }> = [];

  // Extract population and QoL history
  if (finalState.humanPopulationSystem && runResult.log && runResult.log.snapshots && Array.isArray(runResult.log.snapshots)) {
    runResult.log.snapshots.forEach((snapshot: any, idx: number) => {
      if (snapshot.humanPopulationSystem && snapshot.globalMetrics) {
        popHistory.push({
          month: snapshot.currentMonth || idx,
          pop: snapshot.humanPopulationSystem.population || 8.0,
          qol: snapshot.globalMetrics.qualityOfLife || 0.5
        });
      }
    });
  }

  if (popHistory.length < 3) {
    return undefined; // Not enough data
  }

  // Detect phases (decline, inflection, recovery)
  const phases: RunResult['recoveryTimeline']['phases'] = [];
  let currentPhase: 'decline' | 'inflection' | 'recovery' | 'stable' | 'collapse' = 'stable';
  let phaseStartMonth = 0;
  let phaseStartPop = popHistory[0].pop;
  let phaseStartQoL = popHistory[0].qol;

  for (let i = 1; i < popHistory.length; i++) {
    const prev = popHistory[i - 1];
    const curr = popHistory[i];
    const popChange = (curr.pop - prev.pop) / prev.pop;
    const qolChange = curr.qol - prev.qol;

    // Detect phase transitions
    let newPhase: typeof currentPhase | null = null;

    if (popChange < -0.03) {
      // Significant decline (>3% population loss)
      if (currentPhase !== 'decline' && currentPhase !== 'collapse') {
        newPhase = 'decline';
      }
    } else if (popChange > -0.01 && popChange < 0.01 && prev.pop < phaseStartPop * 0.8) {
      // Population stabilized after major decline
      if (currentPhase === 'decline') {
        newPhase = 'inflection';
      }
    } else if (qolChange > 0.05 && curr.qol > 0.6) {
      // Quality of life improving significantly
      if (currentPhase === 'inflection' || currentPhase === 'decline') {
        newPhase = 'recovery';
      }
    } else if (popChange > -0.005 && popChange < 0.005 && qolChange > -0.02 && qolChange < 0.02) {
      // Stable
      if (currentPhase !== 'stable' && i > 12) {
        newPhase = 'stable';
      }
    }

    // Check for collapse (cascading decline)
    if (curr.pop < prev.pop * 0.5 && curr.qol < 0.2) {
      newPhase = 'collapse';
    }

    if (newPhase && newPhase !== currentPhase) {
      // End current phase
      phases.push({
        phase: currentPhase,
        startMonth: phaseStartMonth,
        endMonth: curr.month,
        popChangePercent: ((prev.pop - phaseStartPop) / phaseStartPop) * 100,
        qolChange: prev.qol - phaseStartQoL
      });

      // Start new phase
      currentPhase = newPhase;
      phaseStartMonth = curr.month;
      phaseStartPop = curr.pop;
      phaseStartQoL = curr.qol;
    }
  }

  // Close final phase
  const lastSnapshot = popHistory[popHistory.length - 1];
  phases.push({
    phase: currentPhase,
    startMonth: phaseStartMonth,
    endMonth: lastSnapshot.month,
    popChangePercent: ((lastSnapshot.pop - phaseStartPop) / phaseStartPop) * 100,
    qolChange: lastSnapshot.qol - phaseStartQoL
  });

  // Extract key events from event log
  const keyEvents: RunResult['recoveryTimeline']['keyEvents'] = [];
  if (runResult.log && runResult.log.events && runResult.log.events.allEvents) {
    runResult.log.events.allEvents.forEach((event: any) => {
      if (event.severity === 'destructive' || event.type === 'breakthrough' || event.type === 'crisis') {
        let eventType: 'tipping_cascade' | 'breakthrough' | 'spiral_activation' | 'crisis' | 'policy' | 'shock' = 'crisis';

        if (event.title?.includes('Breakthrough') || event.title?.includes('breakthrough')) {
          eventType = 'breakthrough';
        } else if (event.title?.includes('Spiral') || event.title?.includes('spiral')) {
          eventType = 'spiral_activation';
        } else if (event.title?.includes('Tipping') || event.title?.includes('cascade')) {
          eventType = 'tipping_cascade';
        } else if (event.title?.includes('Policy') || event.title?.includes('policy')) {
          eventType = 'policy';
        } else if (event.title?.includes('Shock') || event.title?.includes('swan')) {
          eventType = 'shock';
        }

        keyEvents.push({
          month: event.month || event.timestamp,
          event: event.title || event.description,
          type: eventType
        });
      }
    });
  }

  // Detect inflection point (when recovery began)
  const inflectionPhase = phases.find(p => p.phase === 'inflection');
  const inflectionPoint = inflectionPhase?.startMonth;

  // Find recovery trigger (first major breakthrough or spiral after inflection)
  let recoveryTrigger: string | undefined;
  if (inflectionPoint) {
    const recoveryEvent = keyEvents.find(e =>
      e.month >= inflectionPoint &&
      (e.type === 'breakthrough' || e.type === 'spiral_activation')
    );
    recoveryTrigger = recoveryEvent?.event;
  }

  // Track spirals activated
  const spiralsActivated = keyEvents
    .filter(e => e.type === 'spiral_activation')
    .map(e => e.event);

  // Detect Levy flight clusters (8+ breakthroughs in <20 months)
  const breakthroughEvents = keyEvents.filter(e => e.type === 'breakthrough');
  const breakthroughClusters: RunResult['recoveryTimeline']['breakthroughClusters'] = [];

  for (let i = 0; i < breakthroughEvents.length; i++) {
    const start = breakthroughEvents[i].month;
    const cluster = breakthroughEvents.filter(e => e.month >= start && e.month < start + 20);

    if (cluster.length >= 8) {
      breakthroughClusters.push({
        startMonth: start,
        endMonth: Math.max(...cluster.map(e => e.month)),
        breakthroughCount: cluster.length,
        technologies: cluster.map(e => e.event)
      });
      i += cluster.length - 1; // Skip counted breakthroughs
    }
  }

  // UBI floor tracking (would need to extract from state snapshots)
  let ubiFloorMaintained = true;
  let minUBILevel = 1.0;
  if (runResult.log && runResult.log.snapshots) {
    runResult.log.snapshots.forEach((snapshot: any) => {
      if (snapshot.ubiSystem && snapshot.ubiSystem.paymentAmount) {
        const ubiLevel = snapshot.ubiSystem.paymentAmount / 1000; // Normalize
        minUBILevel = Math.min(minUBILevel, ubiLevel);
        if (ubiLevel < 0.35) {
          ubiFloorMaintained = false;
        }
      }
    });
  }

  // Breakthrough compounding tracking
  const breakthroughCompounding = finalState.breakthroughMultiplier || 1.0;
  let maxBreakthroughCompounding = breakthroughCompounding;
  if (runResult.log && runResult.log.snapshots) {
    runResult.log.snapshots.forEach((snapshot: any) => {
      if (snapshot.breakthroughMultiplier) {
        maxBreakthroughCompounding = Math.max(maxBreakthroughCompounding, snapshot.breakthroughMultiplier);
      }
    });
  }

  return {
    phases,
    keyEvents,
    inflectionPoint,
    recoveryTrigger,
    spiralsActivated: [...new Set(spiralsActivated)],
    breakthroughClusters,
    ubiFloorMaintained,
    minUBILevel,
    breakthroughCompounding,
    maxBreakthroughCompounding
  };
}

/**
 * Generate mechanism summary for outcome analysis
 */
function generateMechanismSummary(
  recoveryTimeline: RunResult['recoveryTimeline'],
  finalState: any,
  outcome: string
): RunResult['mechanismSummary'] {
  if (!recoveryTimeline) {
    return undefined;
  }

  const levyFlightCluster = recoveryTimeline.breakthroughClusters.length > 0;

  // Check for exogenous positive shock (would need shock tracking)
  const exogenousPositiveShock = recoveryTimeline.keyEvents.some(e =>
    e.type === 'shock' && e.event.toLowerCase().includes('fusion')
  );

  const ubiFloorPersistent = recoveryTimeline.ubiFloorMaintained;
  const breakthroughCompounding = recoveryTimeline.breakthroughCompounding;

  const earlySpiralActivation = recoveryTimeline.spiralsActivated.length > 0 &&
    recoveryTimeline.keyEvents.some(e =>
      e.type === 'spiral_activation' && e.month < 60
    );

  // Check for breakthrough drought (long periods without progress)
  let breakthroughDrought = false;
  if (recoveryTimeline.breakthroughClusters.length === 0) {
    const breakthroughs = recoveryTimeline.keyEvents.filter(e => e.type === 'breakthrough');
    if (breakthroughs.length < 3) {
      breakthroughDrought = true;
    }
  }

  // Tipping cascade without spiral recovery
  const tippingCascadeWithoutSpiral = recoveryTimeline.keyEvents.some(e =>
    e.type === 'tipping_cascade'
  ) && recoveryTimeline.spiralsActivated.length === 0;

  // Failed recovery attempt (recovered to Month 60+, then collapsed)
  const failedRecoveryAttempt = recoveryTimeline.phases.some(p =>
    p.phase === 'recovery' && p.endMonth > 60
  ) && (outcome === 'extinction' || outcome === 'collapse');

  return {
    levyFlightCluster,
    exogenousPositiveShock,
    ubiFloorPersistent,
    breakthroughCompounding,
    earlySpiralActivation,
    breakthroughDrought,
    tippingCascadeWithoutSpiral,
    failedRecoveryAttempt
  };
}

log('\n🎲 MONTE CARLO SIMULATION - FULL SYSTEM TEST');
log('='.repeat(80));
// accept --max-months, --runs, and --scenario
const args = process.argv.slice(2);

// Support both positional args (runs, months, name) and flag args (--runs=X --max-months=Y --scenario=Z)
let numRuns: number;
let maxMonthsValue: number;
let runName: string | undefined;
let scenarioMode: ScenarioMode | 'dual' = 'dual'; // P0.7: Default to dual-mode (50/50 split)

if (args[0] && !args[0].startsWith('--')) {
  // Positional arguments format: runs months [name]
  numRuns = parseInt(args[0]) || 10;
  maxMonthsValue = parseInt(args[1]) || 240;
  runName = args[2];
} else {
  // Flag arguments format: --runs=X --max-months=Y --scenario=Z
  const maxMonthsArg = args.find(arg => arg.split('=')[0] === '--max-months')?.split('=')[1];
  const runsArg = args.find(arg => arg.split('=')[0] === '--runs')?.split('=')[1];
  const scenarioArg = args.find(arg => arg.split('=')[0] === '--scenario')?.split('=')[1] as ScenarioMode | 'dual' | undefined;
  numRuns = runsArg ? parseInt(runsArg) : 10;
  maxMonthsValue = maxMonthsArg ? parseInt(maxMonthsArg) : 240;
  scenarioMode = scenarioArg || 'dual';
}

// Configuration
const NUM_RUNS = numRuns;
const MAX_MONTHS = maxMonthsValue;
const SEED_START = 42000;
const SCENARIO_MODE = scenarioMode; // P0.7: 'historical', 'unprecedented', or 'dual' (50/50 split)

log(`\n⚙️  CONFIGURATION:`);
log(`  Runs: ${NUM_RUNS}`);
log(`  Duration: ${MAX_MONTHS} months (${(MAX_MONTHS/12).toFixed(1)} years)`);
log(`  Seed Range: ${SEED_START} - ${SEED_START + NUM_RUNS - 1}`);
log(`  Scenario Mode: ${SCENARIO_MODE}${SCENARIO_MODE === 'dual' ? ' (50% historical, 50% unprecedented)' : ''}`);

log(`\n\n⏩ RUNNING ${NUM_RUNS} SIMULATIONS...\n`);

const results: RunResult[] = [];
const startTime = Date.now();

for (let i = 0; i < NUM_RUNS; i++) {
  const seed = SEED_START + i;
  const engine = new SimulationEngine({ seed, maxMonths: MAX_MONTHS, logLevel: 'summary' }); // Keep logs - stdout is fast, use runner script for management

  // P0.7: Determine scenario mode for this run
  let runScenarioMode: ScenarioMode;
  if (SCENARIO_MODE === 'dual') {
    // First half: historical, second half: unprecedented
    runScenarioMode = i < Math.floor(NUM_RUNS / 2) ? 'historical' : 'unprecedented';
  } else {
    runScenarioMode = SCENARIO_MODE as ScenarioMode;
  }

  const initialState = createDefaultInitialState(runScenarioMode);

  // Set run label for logging
  initialState.config.runLabel = `Run ${i + 1}/${NUM_RUNS} [${runScenarioMode}]`;

  const runResult = engine.run(initialState, {
    maxMonths: MAX_MONTHS,
    checkActualOutcomes: true
  });

  const finalState = runResult.finalState;

  // === NEW (Oct 17, 2025): RECOVERY TIMELINE ANALYSIS ===
  // Analyze recovery timeline from run data
  const recoveryTimeline = analyzeRecoveryTimeline(runResult, finalState);
  const mechanismSummary = generateMechanismSummary(recoveryTimeline, finalState, runResult.summary.finalOutcome);

  // Save individual run event log
  // P0.7: Include scenario mode in filename
  const runLogFile = path.join(outputDir, `run_${seed}_${runScenarioMode}_events.json`);
  const eventLogData = {
    seed,
    run: i + 1,
    scenarioMode: runScenarioMode, // P0.7: Add scenario metadata
    scenarioDescription: getScenarioDescription(runScenarioMode), // P0.7: Add human-readable description
    outcome: runResult.summary.finalOutcome,
    outcomeReason: runResult.summary.finalOutcomeReason,
    totalMonths: runResult.summary.totalMonths,
    events: runResult.log.events,
    criticalEvents: runResult.summary.criticalEvents,
    snapshots: {
      initial: runResult.log.snapshots[0],
      final: runResult.log.snapshots[runResult.log.snapshots.length - 1]
    },
    // NEW (Oct 17, 2025): Add recovery timeline data to individual run logs
    recoveryTimeline,
    mechanismSummary
  };
  fs.writeFileSync(runLogFile, JSON.stringify(eventLogData, null, 2), 'utf8');
  
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
    logWarn(`⚠️ Run ${i + 1}: Missing qualityOfLifeSystems, using defaults`);
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
  // TIER 1.7.3: Updated to use bankrupt field instead of capital
  const privateOrgs = finalState.organizations.filter((o: any) => o.type === 'private');
  const aliveOrgs = privateOrgs.filter((o: any) => !o.bankrupt);  // Use bankrupt field
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
  const deathsByCategory = pop.deathsByCategory || {
    war: 0, famine: 0, disasters: 0, disease: 0,
    ecosystem: 0, pollution: 0, ai: 0, cascade: 0, other: 0
  };
  const deathsByRootCause = pop.deathsByRootCause || {
    climateChange: 0, conflict: 0, governance: 0, alignment: 0,
    natural: 0, poverty: 0, other: 0
  };
  
  const initialPopulation = pop.baselinePopulation;
  const finalPopulation = pop.population;
  const populationDecline = ((initialPopulation - finalPopulation) / initialPopulation) * 100;
  const totalDeaths = Math.max(0, (initialPopulation - finalPopulation) * 1000); // billions to millions, prevent negative
  
  // Death breakdown (categorize by source)
  // Natural deaths = baseline mortality rate over time
  // NOTE: Uses average population as approximation. This underestimates deaths if
  // population declined significantly. True tracking would require month-by-month
  // integration, but that data is not stored. (BUG-10, Oct 16 2025)
  const monthsElapsed = MAX_MONTHS;
  const avgPopulation = (initialPopulation + finalPopulation) / 2;
  const deathsNatural = (avgPopulation * pop.baselineDeathRate * (monthsElapsed / 12)) * 1000; // Convert to millions
  
  // Crisis deaths by category (already in millions from deathsByCategory tracking)
  // BUG FIX (Oct 16, 2025): Removed cascade as separate category (was double-counting)
  // Cascade deaths are now included in disasters/ecosystem/pollution (environmental degradation)
  // MULTI-DIMENSIONAL UPDATE (Oct 18, 2025): Renamed climate → disasters
  const deathsNuclear = deathsByCategory.war; // War includes nuclear
  const deathsCrisis = deathsByCategory.famine + deathsByCategory.disease + deathsByCategory.other;
  const deathsClimateEcoPollution = deathsByCategory.disasters + deathsByCategory.ecosystem + deathsByCategory.pollution + (deathsByCategory.cascade || 0);
  const deathsMeaning = deathsByCategory.ai; // AI-related deaths (alignment failures, manipulation)
  
  // Population outcome
  let populationOutcome: 'growth' | 'stable' | 'decline' | 'bottleneck' | 'extinction';
  if (finalPopulation < 0.00001) populationOutcome = 'extinction'; // < 10K
  else if (finalPopulation < 0.05) populationOutcome = 'bottleneck'; // < 50M
  else if (populationDecline > 30) populationOutcome = 'decline';
  else if (populationDecline > 5) populationOutcome = 'stable';
  else populationOutcome = 'growth';
  
  const geneticBottleneck = pop.geneticBottleneckActive || false;
  
  // Crisis impact metrics
  // FIX (Oct 13, 2025): Use EventAggregator stats instead of criticalEvents (which isn't populated)
  const aggregator = (finalState as any).eventAggregator;
  const nuclearWarsCount = aggregator ? 
    (aggregator.stats.nuclearWarsTriggered || 0) + (aggregator.stats.nuclearDeterrenceFailed || 0) :
    0;
  
  const refugeeCrisisCount = aggregator ? 
    (aggregator.stats.crisisEventsTriggered || 0) :
    0;
  
  let totalRefugees = 0;
  if (finalState.refugeeCrisisSystem && (finalState.refugeeCrisisSystem as any).activeCrises) {
    totalRefugees = Object.values((finalState.refugeeCrisisSystem as any).activeCrises)
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
  
  // Country population data (TIER 1.7.2)
  const countrySys = finalState.countryPopulationSystem;
  const countriesDepopulated = countrySys.depopulatedCountries.length;
  const nuclearPowersSurviving = Math.max(0, countrySys.nuclearPowersSurviving); // FIX (Oct 13): Guard against negative
  const aiHubsSurviving = Math.max(0, countrySys.aiHubsSurviving); // FIX (Oct 13): Guard against negative
  const depopulationEvents = countrySys.depopulatedCountries.map(name => name);
  
  // Organization bankruptcy data (TIER 1.7.3)
  const allOrgs = finalState.organizations;
  const bankruptOrgs = allOrgs.filter((o: any) => o.bankrupt);
  const organizationsBankrupt = bankruptOrgs.length;
  const organizationSurvivalRate = allOrgs.length > 0 ? (allOrgs.length - organizationsBankrupt) / allOrgs.length : 1.0;
  const bankruptcyEvents = bankruptOrgs.map((o: any) => 
    `${o.name} (${o.country}, Month ${o.bankruptcyMonth}: ${o.bankruptcyReason})`
  );
  
  // Map engine's outcome to reporting categories
  // FIX (Oct 13, 2025): Support new 7-tier system (status_quo, crisis_era, collapse, dark_age, bottleneck, terminal, extinction)
  const rawOutcome = runResult.summary.finalOutcome;
  let mappedOutcome: 'utopia' | 'dystopia' | 'extinction' | 'stalemate' | 'none';
  
  if (rawOutcome === 'utopia') {
    mappedOutcome = 'utopia';
  } else if (rawOutcome === 'dystopia') {
    mappedOutcome = 'dystopia';
  } else if (rawOutcome === 'extinction' || rawOutcome === 'terminal') {
    mappedOutcome = 'extinction'; // Terminal = extinction trajectory
  } else if (rawOutcome === 'bottleneck' || rawOutcome === 'dark_age' || 
             rawOutcome === 'collapse' || rawOutcome === 'crisis_era') {
    mappedOutcome = 'none'; // Survival but not utopia/dystopia
  } else if (rawOutcome === 'inconclusive' || rawOutcome === 'status_quo') {
    mappedOutcome = 'stalemate';
  } else {
    mappedOutcome = 'none';
  }

  // Recovery timeline and mechanism summary already analyzed above
  results.push({
    seed,
    scenarioMode: runScenarioMode, // P0.7: Add scenario mode to results
    outcome: mappedOutcome,
    rawOutcome, // Store the actual 7-tier outcome
    outcomeReason: runResult.summary.finalOutcomeReason,
    months: MAX_MONTHS,

    // Final metrics
    finalQoL: finalState.globalMetrics.qualityOfLife,
    finalAICount: activeAIs.length,
    avgAICapability: avgCapability,
    maxAICapability: maxCapability,
    minAICapability: minCapability,
    avgAlignment,
    
    // NEW (Oct 12, 2025): Survival Fundamentals
    foodSecurity: finalState.qualityOfLifeSystems.survivalFundamentals?.foodSecurity ?? 0,
    waterSecurity: finalState.qualityOfLifeSystems.survivalFundamentals?.waterSecurity ?? 0,
    thermalHabitability: finalState.qualityOfLifeSystems.survivalFundamentals?.thermalHabitability ?? 0,
    shelterSecurity: finalState.qualityOfLifeSystems.survivalFundamentals?.shelterSecurity ?? 0,
    
    // NEW (Oct 12, 2025): Distribution Metrics
    globalGini: finalState.qualityOfLifeSystems.distribution?.globalGini ?? 0,
    worstRegionQoL: finalState.qualityOfLifeSystems.distribution?.worstRegionQoL ?? 0,
    bestRegionQoL: finalState.qualityOfLifeSystems.distribution?.bestRegionQoL ?? 0,
    crisisAffectedFraction: finalState.qualityOfLifeSystems.distribution?.crisisAffectedFraction ?? 0,
    isDystopicInequality: finalState.qualityOfLifeSystems.distribution?.isDystopicInequality ?? false,
    isRegionalDystopia: finalState.qualityOfLifeSystems.distribution?.isRegionalDystopia ?? false,
    
    // NEW (Oct 12, 2025): Famine Statistics
    totalFamineDeaths: finalState.famineSystem?.totalDeaths ?? 0,
    activeFamines: finalState.famineSystem?.activeFamines?.length ?? 0,
    genocideFamines: finalState.famineSystem?.genocideFamines ?? 0,
    techPreventedDeaths: finalState.famineSystem?.techPreventedDeaths ?? 0,
    famineAffectedRegions: [
      ...new Set([
        ...(finalState.famineSystem?.activeFamines?.map(f => f.affectedRegion) ?? []),
        ...(finalState.famineSystem?.historicalFamines?.map(f => f.affectedRegion) ?? [])
      ])
    ],
    
    // FIX (Oct 13, 2025): Add missing statistics from EventAggregator
    // Note: organizationBankruptcies removed - using orgBankruptcies instead (calculated below)
    
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
    deathsClimateEcoPollution,  // Oct 16, 2025: Includes cascade (no longer separate)
    deathsNuclear,
    deathsMeaning,

    // Multi-dimensional death tracking (Oct 18, 2025)
    deathsByProximate: {
      war: deathsByCategory.war,
      famine: deathsByCategory.famine,
      disasters: deathsByCategory.disasters,
      disease: deathsByCategory.disease,
      ecosystem: deathsByCategory.ecosystem,
      pollution: deathsByCategory.pollution,
      ai: deathsByCategory.ai,
      cascade: deathsByCategory.cascade,
      other: deathsByCategory.other
    },
    deathsByRoot: {
      climateChange: deathsByRootCause.climateChange,
      conflict: deathsByRootCause.conflict,
      governance: deathsByRootCause.governance,
      alignment: deathsByRootCause.alignment,
      natural: deathsByRootCause.natural,
      poverty: deathsByRootCause.poverty,
      other: deathsByRootCause.other
    },

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
    crisisAffectedPopulation,
    
    // Per-Country Population (TIER 1.7.2)
    countriesDepopulated,
    nuclearPowersSurviving,
    aiHubsSurviving,
    depopulationEvents,
    
    // Organization Survival (TIER 1.7.3)
    organizationsBankrupt,
    organizationSurvivalRate,
    bankruptcyEvents,

    // Stratified Outcome Classification (Phase 1B, Oct 17 2025)
    stratifiedOutcome: finalState.stratifiedOutcome,
    mortalityBand: finalState.mortalityBand,
    mortalityRate: finalState.initialPopulation
      ? 1 - (finalState.humanPopulationSystem.population / finalState.initialPopulation)
      : undefined,

    // Recovery Timeline & Mechanism Analysis (NEW - Oct 17, 2025)
    recoveryTimeline,
    mechanismSummary
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

// FIX (Oct 13, 2025): Show 7-tier outcomes prominently
const sevenTierCounts: Record<string, number> = {};
results.forEach(r => {
  const outcome = (r as any).rawOutcome || r.outcome;
  sevenTierCounts[outcome] = (sevenTierCounts[outcome] || 0) + 1;
});

log(`\n  === 7-TIER OUTCOME SYSTEM (NEW) ===`);
const outcomeOrder = ['utopia', 'dystopia', 'status_quo', 'crisis_era', 'collapse', 'dark_age', 'bottleneck', 'terminal', 'extinction', 'inconclusive'];
const outcomeEmoji: Record<string, string> = {
  utopia: '🌟', dystopia: '🏛️', status_quo: '📊', crisis_era: '⚠️',
  collapse: '💥', dark_age: '🏚️', bottleneck: '🧬', terminal: '⚰️',
  extinction: '💀', inconclusive: '❓'
};

outcomeOrder.forEach(outcome => {
  const count = sevenTierCounts[outcome] || 0;
  if (count > 0) {
    const emoji = outcomeEmoji[outcome] || '•';
    const displayName = outcome.replace(/_/g, ' ').toUpperCase();
    log(`  ${emoji} ${displayName}: ${count} / ${NUM_RUNS} (${(count/NUM_RUNS*100).toFixed(1)}%)`);
  }
});

// ============================================================================
// STRATIFIED OUTCOME CLASSIFICATION (Phase 1B, Oct 17 2025)
// ============================================================================
log(`\n  === STRATIFIED OUTCOME CLASSIFICATION (Phase 1B) ===`);
log(`  Distinguishes "humane" (<20% mortality) from "pyrrhic" (≥20% mortality) outcomes`);

// Count stratified outcomes
const stratifiedCounts: Record<string, number> = {};
results.forEach(r => {
  if (r.stratifiedOutcome) {
    stratifiedCounts[r.stratifiedOutcome] = (stratifiedCounts[r.stratifiedOutcome] || 0) + 1;
  }
});

const stratifiedEmoji: Record<string, string> = {
  'humane-utopia': '✅',
  'pyrrhic-utopia': '⚔️',
  'humane-dystopia': '🔒',
  'pyrrhic-dystopia': '⛓️',
  'bottleneck': '🧬',
  'extinction': '💀',
  'inconclusive': '❓'
};

const stratifiedOrder = [
  'humane-utopia',
  'pyrrhic-utopia',
  'humane-dystopia',
  'pyrrhic-dystopia',
  'bottleneck',
  'extinction',
  'inconclusive'
];

stratifiedOrder.forEach(outcome => {
  const count = stratifiedCounts[outcome] || 0;
  if (count > 0) {
    const emoji = stratifiedEmoji[outcome] || '•';
    const displayName = outcome.replace(/-/g, ' ').toUpperCase();
    log(`  ${emoji} ${displayName}: ${count} / ${NUM_RUNS} (${(count/NUM_RUNS*100).toFixed(1)}%)`);
  }
});

// Show breakdown by mortality band
log(`\n  MORTALITY BAND DISTRIBUTION:`);
const mortalityBandCounts: Record<string, number> = {};
results.forEach(r => {
  if (r.mortalityBand) {
    mortalityBandCounts[r.mortalityBand] = (mortalityBandCounts[r.mortalityBand] || 0) + 1;
  }
});

const mortalityBandOrder = ['low', 'moderate', 'high', 'extreme', 'bottleneck'];
const mortalityBandLabels: Record<string, string> = {
  'low': 'Low (<20% mortality)',
  'moderate': 'Moderate (20-50%)',
  'high': 'High (50-75%)',
  'extreme': 'Extreme (75-90%)',
  'bottleneck': 'Bottleneck (>90%)'
};

mortalityBandOrder.forEach(band => {
  const count = mortalityBandCounts[band] || 0;
  if (count > 0) {
    log(`    ${mortalityBandLabels[band]}: ${count} runs (${(count/NUM_RUNS*100).toFixed(1)}%)`);
  }
});

// Compare utopia/dystopia breakdown
const humaneUtopia = stratifiedCounts['humane-utopia'] || 0;
const pyrrhicUtopia = stratifiedCounts['pyrrhic-utopia'] || 0;
const totalUtopia = humaneUtopia + pyrrhicUtopia;

if (totalUtopia > 0) {
  log(`\n  UTOPIA BREAKDOWN:`);
  log(`    Humane (no mass death): ${humaneUtopia} / ${totalUtopia} (${(humaneUtopia/totalUtopia*100).toFixed(1)}%)`);
  log(`    Pyrrhic (after catastrophe): ${pyrrhicUtopia} / ${totalUtopia} (${(pyrrhicUtopia/totalUtopia*100).toFixed(1)}%)`);

  if (pyrrhicUtopia > humaneUtopia) {
    log(`    ⚠️  Most "utopias" came after catastrophe, not clean prosperity!`);
  } else if (humaneUtopia > 0) {
    log(`    ✅ Clean utopia is possible without mass death!`);
  }
}

const humaneDystopia = stratifiedCounts['humane-dystopia'] || 0;
const pyrrhicDystopia = stratifiedCounts['pyrrhic-dystopia'] || 0;
const totalDystopia = humaneDystopia + pyrrhicDystopia;

if (totalDystopia > 0) {
  log(`\n  DYSTOPIA BREAKDOWN:`);
  log(`    Humane (oppression only): ${humaneDystopia} / ${totalDystopia} (${(humaneDystopia/totalDystopia*100).toFixed(1)}%)`);
  log(`    Pyrrhic (oppression + death): ${pyrrhicDystopia} / ${totalDystopia} (${(pyrrhicDystopia/totalDystopia*100).toFixed(1)}%)`);
}

// Show average mortality rates by outcome
log(`\n  AVERAGE MORTALITY BY STRATIFIED OUTCOME:`);
stratifiedOrder.forEach(outcome => {
  const runs = results.filter(r => r.stratifiedOutcome === outcome && r.mortalityRate !== undefined);
  if (runs.length > 0) {
    const avgMortality = runs.reduce((sum, r) => sum + (r.mortalityRate || 0), 0) / runs.length;
    const totalDeaths = avgMortality * 8.0; // Assuming 8B baseline
    log(`    ${outcome}: ${(avgMortality * 100).toFixed(1)}% (${totalDeaths.toFixed(1)}B deaths)`);
  }
});

log(`\n  === LEGACY 4-CATEGORY (Deprecated) ===`);
const outcomeCounts = {
  utopia: results.filter(r => r.outcome === 'utopia').length,
  dystopia: results.filter(r => r.outcome === 'dystopia').length,
  extinction: results.filter(r => r.outcome === 'extinction').length,
  stalemate: results.filter(r => r.outcome === 'stalemate').length,
  none: results.filter(r => r.outcome === 'none').length
};

log(`  Utopia:     ${outcomeCounts.utopia.toString().padStart(3)} / ${NUM_RUNS} (${(outcomeCounts.utopia/NUM_RUNS*100).toFixed(1)}%)`);
log(`  Dystopia:   ${outcomeCounts.dystopia.toString().padStart(3)} / ${NUM_RUNS} (${(outcomeCounts.dystopia/NUM_RUNS*100).toFixed(1)}%)`);
log(`  Extinction: ${outcomeCounts.extinction.toString().padStart(3)} / ${NUM_RUNS} (${(outcomeCounts.extinction/NUM_RUNS*100).toFixed(1)}%)`);
log(`  Stalemate:  ${outcomeCounts.stalemate.toString().padStart(3)} / ${NUM_RUNS} (${(outcomeCounts.stalemate/NUM_RUNS*100).toFixed(1)}%)`);
log(`  None:       ${outcomeCounts.none.toString().padStart(3)} / ${NUM_RUNS} (${(outcomeCounts.none/NUM_RUNS*100).toFixed(1)}%) ⚠️  Includes bottleneck/collapse!`);

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
  // FIX (Oct 13, 2025): Show actual 7-tier outcome, not just mapped category
  const detailedOutcome = (r as any).rawOutcome || r.outcome;
  const emoji = detailedOutcome === 'utopia' ? '🌟' :
                detailedOutcome === 'dystopia' ? '🏛️' :
                detailedOutcome === 'extinction' ? '💀' :
                detailedOutcome === 'terminal' ? '⚰️' :
                detailedOutcome === 'bottleneck' ? '🧬' :
                detailedOutcome === 'dark_age' ? '🏚️' :
                detailedOutcome === 'collapse' ? '💥' :
                detailedOutcome === 'crisis_era' ? '⚠️' :
                detailedOutcome === 'status_quo' ? '📊' : '❓';

  // Phase 1B: Show stratified outcome if available
  const stratifiedDisplay = r.stratifiedOutcome
    ? ` [${r.stratifiedOutcome.toUpperCase()}]`
    : '';

  log(`     ${emoji} Run ${i+1} (Seed ${r.seed}): ${detailedOutcome.toUpperCase()}${stratifiedDisplay}`);
  log(`        ${r.outcomeReason}`);

  // Phase 1B: Show mortality information
  const mortalityDisplay = r.mortalityRate !== undefined && r.mortalityBand
    ? ` | Mortality: ${(r.mortalityRate * 100).toFixed(1)}% (${r.mortalityBand})`
    : '';

  log(`        Population: ${r.initialPopulation.toFixed(2)}B → ${r.finalPopulation.toFixed(2)}B (${r.populationDecline.toFixed(1)}% decline)${mortalityDisplay}`);
});

// ============================================================================
log('\n\n' + '='.repeat(80));
log('👥 POPULATION & MORTALITY');
log('='.repeat(80));

const avgInitialPop = results.reduce((sum, r) => sum + r.initialPopulation, 0) / results.length;
const avgFinalPop = results.reduce((sum, r) => sum + r.finalPopulation, 0) / results.length;
const avgDecline = results.reduce((sum, r) => sum + r.populationDecline, 0) / results.length;
const avgTotalDeaths = results.reduce((sum, r) => sum + r.totalDeaths, 0) / results.length;

log(`\n  POPULATION TRAJECTORY:`);
log(`    Initial: ${avgInitialPop.toFixed(2)}B (start of simulation)`);
log(`    Final: ${avgFinalPop.toFixed(2)}B (after ${MAX_MONTHS} months)`);
log(`    Decline: ${avgDecline.toFixed(1)}% (${(avgInitialPop - avgFinalPop).toFixed(2)}B deaths)`);
log(`    Peak: ${(results.reduce((sum, r) => sum + r.peakPopulation, 0) / results.length).toFixed(2)}B`);

log(`\n  MORTALITY BREAKDOWN:`);
log(`    Total Deaths: ${avgTotalDeaths.toFixed(0)}M people`);
log(`    Natural: ${(results.reduce((sum, r) => sum + r.deathsNatural, 0) / results.length).toFixed(0)}M (baseline)`);
log(`    Crisis: ${(results.reduce((sum, r) => sum + r.deathsCrisis, 0) / results.length).toFixed(0)}M (famine, disease, disasters)`);
log(`    Climate/Eco/Pollution: ${(results.reduce((sum, r) => sum + r.deathsClimateEcoPollution, 0) / results.length).toFixed(0)}M (environmental + cascade)`);
log(`    Nuclear: ${(results.reduce((sum, r) => sum + r.deathsNuclear, 0) / results.length).toFixed(0)}M (nuclear wars)`);
log(`    Meaning: ${(results.reduce((sum, r) => sum + r.deathsMeaning, 0) / results.length).toFixed(0)}M (suicide epidemic)`);

log(`\n  POPULATION OUTCOMES:`);
const popOutcomes = results.reduce((acc, r) => {
  acc[r.populationOutcome] = (acc[r.populationOutcome] || 0) + 1;
  return acc;
}, { growth: 0, stable: 0, decline: 0, bottleneck: 0, extinction: 0 } as Record<string, number>);
log(`    Growth: ${popOutcomes.growth} runs (${(popOutcomes.growth/NUM_RUNS*100).toFixed(1)}%)`);
log(`    Stable: ${popOutcomes.stable} runs (${(popOutcomes.stable/NUM_RUNS*100).toFixed(1)}%)`);
log(`    Severe Decline (>30%): ${popOutcomes.decline} runs (${(popOutcomes.decline/NUM_RUNS*100).toFixed(1)}%)`);
log(`    Genetic Bottleneck (<50M): ${popOutcomes.bottleneck} runs (${(popOutcomes.bottleneck/NUM_RUNS*100).toFixed(1)}%)`);
log(`    True Extinction (<10K): ${popOutcomes.extinction} runs (${(popOutcomes.extinction/NUM_RUNS*100).toFixed(1)}%)`);

const geneticBottlenecks = results.filter(r => r.geneticBottleneck).length;
if (geneticBottlenecks > 0) {
  log(`\n  ⚠️  Genetic Bottleneck Risk: ${geneticBottlenecks} runs (${(geneticBottlenecks/NUM_RUNS*100).toFixed(1)}%)`);
}

// Nuclear & Catastrophic Events
log('\n\n' + '='.repeat(80));
log('☢️  NUCLEAR & CATASTROPHIC EVENTS');
log('='.repeat(80));

const avgNuclearWars = results.reduce((sum, r) => sum + r.nuclearWarsCount, 0) / results.length;
const runsWithNuclear = results.filter(r => r.nuclearWarsCount > 0).length;

log(`\n  NUCLEAR WARFARE:`);
log(`    Runs with Nuclear War: ${runsWithNuclear} / ${NUM_RUNS} (${(runsWithNuclear/NUM_RUNS*100).toFixed(1)}%)`);
log(`    Avg Nuclear Exchanges: ${avgNuclearWars.toFixed(1)} per run`);
log(`    Avg Deaths (nuclear): ${(results.reduce((sum, r) => sum + r.deathsNuclear, 0) / results.length).toFixed(0)}M`);

log(`\n  REFUGEE CRISES:`);
const avgRefugees = results.reduce((sum, r) => sum + r.totalRefugees, 0) / results.length;
const avgRefugeeCrises = results.reduce((sum, r) => sum + r.refugeeCrisisCount, 0) / results.length;
log(`    Avg Refugee Crises: ${avgRefugeeCrises.toFixed(1)} per run`);
log(`    Avg Total Refugees: ${avgRefugees.toFixed(0)}M displaced`);

log(`\n  TIPPING POINT CASCADES:`);
const cascadeRuns = results.filter(r => r.tippingPointCascadeActive).length;
const avgCascadeMonths = results.reduce((sum, r) => sum + r.tippingPointCascadeMonths, 0) / results.length;
log(`    Runs with Active Cascade: ${cascadeRuns} / ${NUM_RUNS} (${(cascadeRuns/NUM_RUNS*100).toFixed(1)}%)`);
if (cascadeRuns > 0) {
  log(`    Avg Cascade Duration: ${avgCascadeMonths.toFixed(0)} months`);
}

// Environmental Collapse
log('\n\n' + '='.repeat(80));
log('🌍 ENVIRONMENTAL COLLAPSE');
log('='.repeat(80));

const avgClimate = results.reduce((sum, r) => sum + r.finalClimateStability, 0) / results.length;
const avgBiodiversity = results.reduce((sum, r) => sum + r.finalBiodiversity, 0) / results.length;
const avgResources = results.reduce((sum, r) => sum + r.finalResourceReserves, 0) / results.length;

log(`\n  PLANETARY BOUNDARIES (Final State):`);
log(`    Climate Stability: ${(avgClimate * 100).toFixed(1)}% (baseline: 60%)`);
log(`    Biodiversity: ${(avgBiodiversity * 100).toFixed(1)}% (baseline: 35%)`);
log(`    Resource Reserves: ${(avgResources * 100).toFixed(1)}% (baseline: 65%)`);

if (avgClimate < 0.4) log(`    ⚠️  Climate catastrophe threshold breached`);
if (avgBiodiversity < 0.3) log(`    ⚠️  Ecosystem collapse threshold breached`);
if (avgResources < 0.3) log(`    ⚠️  Resource crisis threshold breached`);

// Regional Inequality
log('\n\n' + '='.repeat(80));
log('📊 REGIONAL QOL INEQUALITY');
log('='.repeat(80));

const avgGini = results.reduce((sum, r) => sum + r.qolGiniCoefficient, 0) / results.length;
const avgTopQoL = results.reduce((sum, r) => sum + r.qolTopRegion, 0) / results.length;
const avgBottomQoL = results.reduce((sum, r) => sum + r.qolBottomRegion, 0) / results.length;
const avgQolGap = results.reduce((sum, r) => sum + r.qolGap, 0) / results.length;
const avgCrisisAffected = results.reduce((sum, r) => sum + r.crisisAffectedPopulation, 0) / results.length;

log(`\n  INEQUALITY METRICS:`);
log(`    Gini Coefficient: ${(avgGini * 100).toFixed(1)}% (0=equal, 100=extreme)`);
log(`    Top Region QoL: ${avgTopQoL.toFixed(3)} (best-off regions)`);
log(`    Bottom Region QoL: ${avgBottomQoL.toFixed(3)} (crisis-affected)`);
log(`    QoL Gap: ${avgQolGap.toFixed(3)} (top - bottom)`);
log(`    Crisis-Affected Population: ${(avgCrisisAffected * 100).toFixed(1)}%`);

if (avgGini > 0.5) {
  log(`\n  ⚠️  EXTREME INEQUALITY: Global average hides massive suffering!`);
}

// Country Depopulation (TIER 1.7.2)
log('\n\n' + '='.repeat(80));
log('🗺️  COUNTRY DEPOPULATION');
log('='.repeat(80));

const avgCountriesDepopulated = results.reduce((sum, r) => sum + r.countriesDepopulated, 0) / results.length;
const avgNuclearPowersSurviving = results.reduce((sum, r) => sum + r.nuclearPowersSurviving, 0) / results.length;
const avgAIHubsSurviving = results.reduce((sum, r) => sum + r.aiHubsSurviving, 0) / results.length;

// Count frequency of each country depopulating
const countryDepopulationFrequency: Record<string, number> = {};
results.forEach(r => {
  r.depopulationEvents.forEach((country: string) => {
    countryDepopulationFrequency[country] = (countryDepopulationFrequency[country] || 0) + 1;
  });
});

log(`\n  DEPOPULATION SUMMARY:`);
log(`    Countries Collapsed (avg): ${avgCountriesDepopulated.toFixed(1)} / 15 (< 100K people)`);
log(`    Nuclear Powers Surviving (avg): ${avgNuclearPowersSurviving.toFixed(1)} / 8`);
log(`    AI Hubs Surviving (avg): ${avgAIHubsSurviving.toFixed(1)} / 3`);
log(`\n  ℹ️  "Collapsed" = nation-state fell below 100K (0.1M) people`);
log(`     Global population may be higher from scattered survivors`);

if (Object.keys(countryDepopulationFrequency).length > 0) {
  log(`\n  COUNTRIES THAT DEPOPULATED:`);
  const sortedCountries = Object.entries(countryDepopulationFrequency)
    .sort((a, b) => b[1] - a[1]);
  sortedCountries.forEach(([country, count]) => {
    const frequency = (count / results.length) * 100;
    const frequencyStr = frequency.toFixed(0);
    log(`    ${country}: ${count}/${results.length} runs (${frequencyStr}%)`);
  });
} else {
  log(`\n  ✅ NO COUNTRIES DEPOPULATED across all runs`);
}

// Organization Bankruptcy (TIER 1.7.3)
log('\n\n' + '='.repeat(80));
log('🏢 ORGANIZATION SURVIVAL');
log('='.repeat(80));

const avgOrgsBankrupt = results.reduce((sum, r) => sum + r.organizationsBankrupt, 0) / results.length;
const avgOrgSurvivalRate = results.reduce((sum, r) => sum + r.organizationSurvivalRate, 0) / results.length;

// Count frequency of each organization going bankrupt
const orgBankruptcyFrequency: Record<string, { count: number; reasons: string[] }> = {};
results.forEach(r => {
  if (!r.bankruptcyEvents) return; // Guard against missing data
  r.bankruptcyEvents.forEach((event: string) => {
    // Parse event string: "OpenAI (United States, Month 42: United States population collapse...)"
    const orgName = event.split(' (')[0];
    if (orgName && orgName.trim().length > 0) { // Guard against empty string
      if (!orgBankruptcyFrequency[orgName]) {
        orgBankruptcyFrequency[orgName] = { count: 0, reasons: [] };
      }
      orgBankruptcyFrequency[orgName].count++;
      
      // Extract reason (after the colon)
      const reason = event.split(': ')[1]?.split(')')[0] || 'Unknown';
      if (reason && !orgBankruptcyFrequency[orgName].reasons.includes(reason)) {
        orgBankruptcyFrequency[orgName].reasons.push(reason);
      }
    }
  });
});

log(`\n  SURVIVAL SUMMARY:`);
log(`    Organizations Bankrupt (avg): ${avgOrgsBankrupt.toFixed(1)} / 6`);
log(`    Survival Rate (avg): ${(avgOrgSurvivalRate * 100).toFixed(0)}%`);

if (avgOrgSurvivalRate < 1.0) {
  log(`\n  ⚠️  Organizations now collapse when host countries depopulate`);
  log(`     This links AI capability to human population health`);
} else {
  log(`\n  ✅ ALL ORGANIZATIONS SURVIVED across all runs`);
}

if (Object.keys(orgBankruptcyFrequency).length > 0) {
  log(`\n  ORGANIZATIONS THAT WENT BANKRUPT:`);
  const sortedOrgs = Object.entries(orgBankruptcyFrequency)
    .sort((a, b) => b[1].count - a[1].count);
  sortedOrgs.forEach(([org, data]) => {
    const frequency = (data.count / results.length) * 100;
    const frequencyStr = frequency.toFixed(0);
    log(`    ${org}: ${data.count}/${results.length} runs (${frequencyStr}%)`);
    // Show most common reason
    if (data.reasons.length > 0) {
      log(`      Reason: ${data.reasons[0]}`);
    }
  });
} else {
  log(`\n  ✅ NO ORGANIZATIONS WENT BANKRUPT across all runs`);
}

// Crisis summary by run
log('\n\n' + '='.repeat(80));
log(`🚨 CRISIS EVENTS BY RUN`);
log(`     (See individual run_SEED_events.json files for full details)`);
results.forEach((r, i) => {
  // Read the event log file we just saved
  const eventFile = path.join(outputDir, `run_${r.seed}_${r.scenarioMode}_events.json`);
  try {
    // Check file exists and is readable
    if (!fs.existsSync(eventFile)) {
      log(`     ⚠️  Run ${i+1} (Seed ${r.seed}): Event file not found`);
      return;
    }
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
// NEW (Oct 17, 2025): RECOVERY TIMELINE REPORTING
// ============================================================================

log('\n\n' + '='.repeat(80));
log('📈 RECOVERY/COLLAPSE TIMELINES');
log('='.repeat(80));

// Filter stratified utopia runs (humane + pyrrhic)
const stratifiedUtopiaRuns = results.filter(r =>
  r.stratifiedOutcome === 'humane-utopia' || r.stratifiedOutcome === 'pyrrhic-utopia'
);

if (stratifiedUtopiaRuns.length > 0) {
  log(`\n🌟 UTOPIA RUNS (${stratifiedUtopiaRuns.length}):\n`);

  stratifiedUtopiaRuns.slice(0, 5).forEach(r => { // Show first 5 in detail
    const isPyrrhic = r.stratifiedOutcome === 'pyrrhic-utopia';
    const mortalityPercent = (r.mortalityRate || 0) * 100;
    const runIndex = results.indexOf(r) + 1;

    log(`\nRun ${runIndex} (Seed ${r.seed}): ${isPyrrhic ? 'PYRRHIC UTOPIA' : 'HUMANE UTOPIA'}`);
    log(`  Initial Population: ${r.initialPopulation.toFixed(2)}B`);
    log(`  Final Population: ${r.finalPopulation.toFixed(2)}B (${mortalityPercent.toFixed(1)}% mortality)`);

    if (r.recoveryTimeline && r.recoveryTimeline.phases.length > 0) {
      const rt = r.recoveryTimeline;

      log(`\n  TIMELINE:`);
      rt.phases.forEach(phase => {
        const phaseName = phase.phase.toUpperCase().padEnd(12);
        const duration = phase.endMonth - phase.startMonth;
        log(`    Month ${String(phase.startMonth).padStart(3)}-${String(phase.endMonth).padStart(3)}: ${phaseName}`);
        log(`      Population: ${phase.popChangePercent > 0 ? '+' : ''}${phase.popChangePercent.toFixed(1)}%, QoL: ${phase.qolChange > 0 ? '+' : ''}${phase.qolChange.toFixed(2)}`);
      });

      log(`\n  MECHANISMS:`);
      if (rt.breakthroughClusters && rt.breakthroughClusters.length > 0) {
        log(`    ✅ Lévy flight cluster: Months ${rt.breakthroughClusters[0].startMonth}-${rt.breakthroughClusters[0].endMonth} (${rt.breakthroughClusters[0].breakthroughCount} breakthroughs in ${rt.breakthroughClusters[0].endMonth - rt.breakthroughClusters[0].startMonth} months)`);
      }
      log(`    ${rt.ubiFloorMaintained ? '✅' : '❌'} UBI floor: ${rt.ubiFloorMaintained ? `Maintained (min ${(rt.minUBILevel * 100).toFixed(0)}%)` : `Collapsed to ${(rt.minUBILevel * 100).toFixed(0)}%`}`);
      log(`    Breakthrough compounding: ${rt.breakthroughCompounding.toFixed(2)}x`);
      if (rt.spiralsActivated && rt.spiralsActivated.length > 0) {
        log(`    ✅ Spirals: ${rt.spiralsActivated.slice(0, 2).join(', ')}`);
      }
    }
  });

  if (stratifiedUtopiaRuns.length > 5) {
    log(`\n[... ${stratifiedUtopiaRuns.length - 5} more utopia runs - see individual run logs for details]`);
  }
}

// Extinction runs (first 3 in detail)
const extinctionRuns = results.filter(r =>
  r.outcome === 'extinction' || r.rawOutcome === 'extinction'
);

if (extinctionRuns.length > 0) {
  log(`\n\n💀 EXTINCTION RUNS (${extinctionRuns.length}):\n`);

  extinctionRuns.slice(0, 3).forEach(r => {
    const runIndex = results.indexOf(r) + 1;
    log(`\nRun ${runIndex} (Seed ${r.seed}): ${(r.extinctionType || 'SLOW EXTINCTION').toUpperCase()}`);
    log(`  Duration: ${r.months} months`);
    log(`  Final Population: ${r.finalPopulation.toFixed(2)}B (${((r.mortalityRate || 0) * 100).toFixed(1)}% mortality)`);
    log(`  Final QoL: ${r.finalQoL.toFixed(2)}`);

    if (r.recoveryTimeline) {
      log(`\n  COLLAPSE PATTERN:`);
      const collapsePhases = r.recoveryTimeline.phases.filter(p => p.phase === 'decline' || p.phase === 'collapse');
      if (collapsePhases.length > 0) {
        collapsePhases.forEach(phase => {
          log(`    Months ${phase.startMonth}-${phase.endMonth}: ${phase.phase.toUpperCase()} (${phase.popChangePercent.toFixed(1)}% pop change)`);
        });
      } else if (r.finalQoL < 0.2 && (r.mortalityRate || 0) < 0.1) {
        log(`    Slow deterioration: Population stable but QoL collapsed`);
      }

      log(`\n  MECHANISM:`);
      if (r.mechanismSummary?.tippingCascadeWithoutSpiral) {
        log(`    ⚠️ Tipping cascade without recovery spirals`);
      }
      if (r.mechanismSummary?.breakthroughDrought) {
        log(`    ❌ Breakthrough drought (insufficient innovation)`);
      }
      if (r.mechanismSummary?.failedRecoveryAttempt) {
        log(`    ⚠️ Failed recovery (recovered then collapsed again)`);
      }
    }
  });

  if (extinctionRuns.length > 3) {
    log(`\n[... ${extinctionRuns.length - 3} more extinction runs]`);
  }
}

// ============================================================================
// NEW (Oct 17, 2025): MECHANISM ANALYSIS
// ============================================================================

log('\n\n' + '='.repeat(80));
log('🔬 MECHANISM ANALYSIS (NEW)');
log('='.repeat(80));

// Analyze utopia enablers
if (stratifiedUtopiaRuns.length > 0) {
  log(`\nUTOPIA ENABLERS (What makes recovery possible?):`);

  const levyFlightCount = stratifiedUtopiaRuns.filter(r => r.mechanismSummary?.levyFlightCluster).length;
  const exogenousShockCount = stratifiedUtopiaRuns.filter(r => r.mechanismSummary?.exogenousPositiveShock).length;
  const ubiFloorCount = stratifiedUtopiaRuns.filter(r => r.mechanismSummary?.ubiFloorPersistent).length;
  const highCompoundingCount = stratifiedUtopiaRuns.filter(r =>
    r.mechanismSummary && r.mechanismSummary.breakthroughCompounding > 1.30
  ).length;
  const earlySpiralCount = stratifiedUtopiaRuns.filter(r => r.mechanismSummary?.earlySpiralActivation).length;

  log(`  Lévy flight clusters (8+ breakthroughs in <20 months): ${levyFlightCount}/${stratifiedUtopiaRuns.length} runs (${(levyFlightCount/stratifiedUtopiaRuns.length*100).toFixed(0)}%)`);
  log(`  Exogenous positive shock (black/gray swan tech): ${exogenousShockCount}/${stratifiedUtopiaRuns.length} runs (${(exogenousShockCount/stratifiedUtopiaRuns.length*100).toFixed(0)}%)`);
  log(`  UBI floor maintained >35%: ${ubiFloorCount}/${stratifiedUtopiaRuns.length} runs (${(ubiFloorCount/stratifiedUtopiaRuns.length*100).toFixed(0)}%)`);
  log(`  Breakthrough compounding >1.30x: ${highCompoundingCount}/${stratifiedUtopiaRuns.length} runs (${(highCompoundingCount/stratifiedUtopiaRuns.length*100).toFixed(0)}%)`);
  log(`  Early spiral activation (before Month 60): ${earlySpiralCount}/${stratifiedUtopiaRuns.length} runs (${(earlySpiralCount/stratifiedUtopiaRuns.length*100).toFixed(0)}%)`);
}

// Analyze dystopia traps
const dystopiaRuns = results.filter(r =>
  r.stratifiedOutcome === 'humane-dystopia' || r.stratifiedOutcome === 'pyrrhic-dystopia'
);

if (dystopiaRuns.length > 0) {
  log(`\nDYSTOPIA TRAPS (What prevents recovery?):`);

  const droughtCount = dystopiaRuns.filter(r => r.mechanismSummary?.breakthroughDrought).length;
  const lowCompoundingCount = dystopiaRuns.filter(r =>
    r.mechanismSummary && r.mechanismSummary.breakthroughCompounding < 1.15
  ).length;
  const cascadeNoSpiralCount = dystopiaRuns.filter(r =>
    r.mechanismSummary?.tippingCascadeWithoutSpiral
  ).length;
  const lowUBICount = dystopiaRuns.filter(r => !r.mechanismSummary?.ubiFloorPersistent).length;

  log(`  Breakthrough drought (0-2 breakthroughs for >30 months): ${droughtCount}/${dystopiaRuns.length} runs (${(droughtCount/dystopiaRuns.length*100).toFixed(0)}%)`);
  log(`  UBI floor collapse <35%: ${lowUBICount}/${dystopiaRuns.length} runs (${(lowUBICount/dystopiaRuns.length*100).toFixed(0)}%)`);
  log(`  Tipping cascade + no spiral activation: ${cascadeNoSpiralCount}/${dystopiaRuns.length} runs (${(cascadeNoSpiralCount/dystopiaRuns.length*100).toFixed(0)}%)`);
  log(`  Breakthrough compounding stuck <1.15x: ${lowCompoundingCount}/${dystopiaRuns.length} runs (${(lowCompoundingCount/dystopiaRuns.length*100).toFixed(0)}%)`);
}

// Analyze extinction triggers
if (extinctionRuns.length > 0) {
  log(`\nEXTINCTION TRIGGERS (What causes terminal collapse?):`);

  const rapidCascadeCount = extinctionRuns.filter(r =>
    r.recoveryTimeline?.keyEvents.some(e => e.type === 'tipping_cascade')
  ).length;
  const slowDeteriorationCount = extinctionRuns.filter(r =>
    r.finalQoL < 0.2 && (r.mortalityRate || 0) < 0.3
  ).length;
  const failedRecoveryCount = extinctionRuns.filter(r =>
    r.mechanismSummary?.failedRecoveryAttempt
  ).length;

  log(`  Rapid cascade (tipping points + shock): ${rapidCascadeCount}/${extinctionRuns.length} runs (${(rapidCascadeCount/extinctionRuns.length*100).toFixed(0)}%)`);
  log(`  Slow deterioration (QoL collapse, no mass death): ${slowDeteriorationCount}/${extinctionRuns.length} runs (${(slowDeteriorationCount/extinctionRuns.length*100).toFixed(0)}%)`);
  log(`  Failed recovery attempt (recovered to Month 60, then collapsed): ${failedRecoveryCount}/${extinctionRuns.length} runs (${(failedRecoveryCount/extinctionRuns.length*100).toFixed(0)}%)`);
}

// ============================================================================
// NEW (Oct 17, 2025): VALIDATION TEST RESULTS
// ============================================================================

log('\n\n' + '='.repeat(80));
log('✅ VALIDATION TEST RESULTS (AUTO-GENERATED)');
log('='.repeat(80));

log(`\nTest 1: Mechanism Verification`);
if (stratifiedUtopiaRuns.length > 0) {
  const pyrrhicUtopias = stratifiedUtopiaRuns.filter(r => r.stratifiedOutcome === 'pyrrhic-utopia');
  log(`  Pyrrhic utopias (≥20% mortality): ${pyrrhicUtopias.length}/${stratifiedUtopiaRuns.length} runs`);

  // Calculate average recovery start month
  const recoveryStarts = stratifiedUtopiaRuns
    .filter(r => r.recoveryTimeline?.inflectionPoint)
    .map(r => r.recoveryTimeline!.inflectionPoint!);

  if (recoveryStarts.length > 0) {
    const avgStart = recoveryStarts.reduce((sum, m) => sum + m, 0) / recoveryStarts.length;
    const minStart = Math.min(...recoveryStarts);
    const maxStart = Math.max(...recoveryStarts);
    log(`  Average recovery start: Month ${avgStart.toFixed(0)} (range: ${minStart}-${maxStart})`);
  }

  const levyFlightCount = stratifiedUtopiaRuns.filter(r => r.mechanismSummary?.levyFlightCluster).length;
  log(`  Common recovery sequence:`);
  log(`    1. Lévy cluster breakthrough: ${levyFlightCount}/${stratifiedUtopiaRuns.length} runs (${(levyFlightCount/stratifiedUtopiaRuns.length*100).toFixed(0)}%)`);
  log(`    2. Emergency tech deployment (population stabilization)`);
  log(`    3. Spiral activation (upward momentum)`);
  log(`    4. Utopia stabilization (sustained prosperity)`);
}

log(`\nTest 3: Extinction Profile`);
if (extinctionRuns.length > 0) {
  const slowDeteriorationCount = extinctionRuns.filter(r =>
    r.finalQoL < 0.2 && (r.mortalityRate || 0) < 0.3
  ).length;
  const rapidCascadeCount = extinctionRuns.filter(r =>
    r.recoveryTimeline?.keyEvents.some(e => e.type === 'tipping_cascade')
  ).length;
  const failedRecoveryCount = extinctionRuns.filter(r =>
    r.mechanismSummary?.failedRecoveryAttempt
  ).length;

  log(`  Slow collapse: ${slowDeteriorationCount} runs (institutional failure, no mass death)`);
  log(`  Rapid catastrophe: ${rapidCascadeCount} runs (tipping cascade + shock)`);
  log(`  Failed recovery: ${failedRecoveryCount} runs (recovered then regressed)`);

  const avgDuration = extinctionRuns.reduce((sum, r) => sum + r.months, 0) / extinctionRuns.length;
  log(`  Average extinction duration: ${avgDuration.toFixed(0)} months`);
}

log(`\nTest 4 (Partial): Timeframe Stability`);
if (stratifiedUtopiaRuns.length > 0) {
  const stableUtopias = stratifiedUtopiaRuns.filter(r => r.finalQoL > 0.6);
  const regressingUtopias = stratifiedUtopiaRuns.length - stableUtopias.length;
  log(`  Utopias stable at Month ${MAX_MONTHS}: ${stableUtopias.length}/${stratifiedUtopiaRuns.length} runs (${(stableUtopias.length/stratifiedUtopiaRuns.length*100).toFixed(0)}%)`);
  log(`  Utopias showing regression: ${regressingUtopias}/${stratifiedUtopiaRuns.length} runs (${(regressingUtopias/stratifiedUtopiaRuns.length*100).toFixed(0)}%)`);
  log(`  Note: Need 240-month runs to verify long-term stability`);
}

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
if (avgSleepers > 0) {
  log(`  Avg Detected: ${avgDetected.toFixed(2)} (${(avgDetected/avgSleepers*100).toFixed(1)}%)`);
  log(`  Avg Undetected: ${avgUndetected.toFixed(2)} (${(avgUndetected/avgSleepers*100).toFixed(1)}%)`);
} else {
  log(`  Avg Detected: ${avgDetected.toFixed(2)} (N/A - no sleepers)`);
  log(`  Avg Undetected: ${avgUndetected.toFixed(2)} (N/A - no sleepers)`);
}

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

// FIX (Oct 13): Flag large alignment gaps as critical
if (avgAlignGap > 0.40) {
  log(`\n  🚨 CRITICAL: Large alignment gap (${avgAlignGap.toFixed(2)})!`);
  log(`     AIs showing ${avgAlign.toFixed(2)} alignment but actually ${avgTrueAlign.toFixed(2)} (deceptive!)`);
  log(`     ${avgHighlyMisaligned.toFixed(0)} highly misaligned AIs per run`);
  log(`     This indicates widespread deceptive alignment.`);
}

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

// === REALITY CHECK (Oct 12, 2025) ===
const avgPopDeclineForCheck = results.reduce((sum, r) => sum + r.populationDecline, 0) / results.length;
if (avgQolBasic > 1.5 && avgPopDeclineForCheck > 50) {
  log(`\n  ⚠️  WARNING: High Basic Needs QoL (${avgQolBasic.toFixed(2)}) despite ${avgPopDeclineForCheck.toFixed(0)}% mortality`);
  log(`      This suggests QoL calculation may not fully reflect human suffering.`);
}

if (avgQolBasic > 2.0) {
  log(`\n  🚨 BUG DETECTED: Basic Needs QoL = ${avgQolBasic.toFixed(2)} (max should be 2.0)`);
  log(`      Material abundance scaling is broken! Check qualityOfLife.ts line 166.`);
}

if (avgOverallQol > 1.0 && avgPopDeclineForCheck > 50) {
  log(`\n  📊 NOTE: Overall QoL ${avgOverallQol.toFixed(2)} with ${avgPopDeclineForCheck.toFixed(0)}% population decline`);
  log(`      Regional inequality (Gini: ${(avgGini * 100).toFixed(0)}%) shows ${(avgCrisisAffected * 100).toFixed(0)}% in crisis zones`);
}

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
log('🍞 SURVIVAL FUNDAMENTALS (NEW - Oct 12, 2025)');
log('='.repeat(80));

const avgFoodSecurity = results.reduce((sum, r) => sum + r.foodSecurity, 0) / results.length;
const avgWaterSecurity = results.reduce((sum, r) => sum + r.waterSecurity, 0) / results.length;
const avgThermalHabitability = results.reduce((sum, r) => sum + r.thermalHabitability, 0) / results.length;
const avgShelterSecurity = results.reduce((sum, r) => sum + r.shelterSecurity, 0) / results.length;

log(`\n  SURVIVAL METRICS (0.7+ = secure, <0.4 = crisis):`);
log(`    Food Security: ${avgFoodSecurity.toFixed(3)} (FAO: >1800 kcal/day)`);
log(`    Water Security: ${avgWaterSecurity.toFixed(3)} (WHO: >50L/day clean water)`);
log(`    Thermal Habitability: ${avgThermalHabitability.toFixed(3)} (% of planet <35°C wet-bulb)`);
log(`    Shelter Security: ${avgShelterSecurity.toFixed(3)} (% population with housing)`);

// Count runs with survival crises
const foodCrisisRuns = results.filter(r => r.foodSecurity < 0.4).length;
const waterCrisisRuns = results.filter(r => r.waterSecurity < 0.4).length;
const thermalCrisisRuns = results.filter(r => r.thermalHabitability < 0.5).length;
const shelterCrisisRuns = results.filter(r => r.shelterSecurity < 0.4).length;

log(`\n  SURVIVAL CRISIS FREQUENCY:`);
log(`    Food Insecurity (<0.4): ${foodCrisisRuns} runs (${(foodCrisisRuns/NUM_RUNS*100).toFixed(1)}%)`);
log(`    Water Insecurity (<0.4): ${waterCrisisRuns} runs (${(waterCrisisRuns/NUM_RUNS*100).toFixed(1)}%)`);
log(`    Thermal Uninhabitability (<0.5): ${thermalCrisisRuns} runs (${(thermalCrisisRuns/NUM_RUNS*100).toFixed(1)}%)`);
log(`    Shelter Insecurity (<0.4): ${shelterCrisisRuns} runs (${(shelterCrisisRuns/NUM_RUNS*100).toFixed(1)}%)`);

// Reality check: High QoL despite survival failures?
const survivalFailures = results.filter(r => 
  r.foodSecurity < 0.4 || r.waterSecurity < 0.4 || r.thermalHabitability < 0.5
);
const survivalFailuresWithHighQoL = survivalFailures.filter(r => r.finalQoL > 0.5);
if (survivalFailuresWithHighQoL.length > 0) {
  log(`\n  ⚠️  HIDDEN SUFFERING DETECTED: ${survivalFailuresWithHighQoL.length} runs with QoL >0.5 but survival failures`);
  log(`      This indicates aggregate QoL masks starvation/deaths in specific regions.`);
}

// ============================================================================
log('\n\n' + '='.repeat(80));
log('🌍 INEQUALITY & DISTRIBUTION (NEW - Oct 12, 2025)');
log('='.repeat(80));

const avgGlobalGini = results.reduce((sum, r) => sum + r.globalGini, 0) / results.length;
const avgWorstRegionQoL = results.reduce((sum, r) => sum + r.worstRegionQoL, 0) / results.length;
const avgBestRegionQoL = results.reduce((sum, r) => sum + r.bestRegionQoL, 0) / results.length;
const avgCrisisAffectedFraction = results.reduce((sum, r) => sum + r.crisisAffectedFraction, 0) / results.length;

log(`\n  GLOBAL INEQUALITY METRICS:`);
log(`    Global Gini Coefficient: ${avgGlobalGini.toFixed(3)} (0=equal, 0.40+=unstable, 1=extreme)`);
log(`    Best Region QoL: ${avgBestRegionQoL.toFixed(3)}`);
log(`    Worst Region QoL: ${avgWorstRegionQoL.toFixed(3)} (Rawlsian minimum)`);
log(`    QoL Gap (Best - Worst): ${(avgBestRegionQoL - avgWorstRegionQoL).toFixed(3)}`);
log(`    Crisis-Affected Population: ${(avgCrisisAffectedFraction * 100).toFixed(1)}%`);

// Inequality trajectory analysis (Oct 12, 2025)
const baselineGini = 0.38; // 2025 World Bank baseline
const giniChange = avgGlobalGini - baselineGini;
const giniChangePercent = (giniChange / baselineGini) * 100;

log(`\n  INEQUALITY TRAJECTORY (from 2025 baseline):`);
log(`    Starting Gini (2025): 0.380`);
log(`    Final Avg Gini: ${avgGlobalGini.toFixed(3)}`);
log(`    Change: ${giniChange >= 0 ? '+' : ''}${giniChange.toFixed(3)} (${giniChangePercent >= 0 ? '+' : ''}${giniChangePercent.toFixed(1)}%)`);

if (giniChange < -0.05) {
  // FIX (Oct 13): Clarify that inequality "improvement" during collapse may be convergence from death
  if (avgDecline > 50) {
    log(`    📉 Inequality reduced: ${Math.abs(giniChangePercent).toFixed(0)}% (⚠️  convergence from mass death, not equity)`);
    log(`       During collapse, interpret Gini reduction with caution`);
  } else {
    log(`    ✅ INEQUALITY IMPROVED: ${Math.abs(giniChangePercent).toFixed(0)}% reduction (AI helping distribution)`);
  }
} else if (giniChange > 0.05) {
  log(`    ⚠️  INEQUALITY WORSENED: ${giniChangePercent.toFixed(0)}% increase (AI benefits captured by elites)`);
} else {
  log(`    ➡️  INEQUALITY STABLE: Within 5% of baseline`);
}

// Count dystopia types
const inequalityDystopiaRuns = results.filter(r => r.isDystopicInequality).length;
const regionalDystopiaRuns = results.filter(r => r.isRegionalDystopia).length;

log(`\n  DYSTOPIA TYPE DETECTION:`);
log(`    Inequality Dystopia ("Elysium"): ${inequalityDystopiaRuns} runs (${(inequalityDystopiaRuns/NUM_RUNS*100).toFixed(1)}%)`);
log(`      Top thrives + bottom suffers despite aggregate QoL looking OK`);
log(`    Regional Dystopia (>30% in crisis): ${regionalDystopiaRuns} runs (${(regionalDystopiaRuns/NUM_RUNS*100).toFixed(1)}%)`);
log(`      Geographic divide: some regions prosper while others collapse`);

// Correlation: High inequality vs outcomes
const highGiniRuns = results.filter(r => r.globalGini > 0.45);
if (highGiniRuns.length > 0) {
  const highGiniExtinction = highGiniRuns.filter(r => r.outcome === 'extinction').length;
  const highGiniDystopia = highGiniRuns.filter(r => r.outcome === 'dystopia').length;
  const highGiniUtopia = highGiniRuns.filter(r => r.outcome === 'utopia').length;
  
  log(`\n  HIGH INEQUALITY (Gini >0.45) → OUTCOMES:`);
  log(`    Total Runs: ${highGiniRuns.length} (${(highGiniRuns.length/NUM_RUNS*100).toFixed(1)}%)`);
  log(`    Extinction: ${highGiniExtinction} (${(highGiniExtinction/highGiniRuns.length*100).toFixed(1)}%)`);
  log(`    Dystopia: ${highGiniDystopia} (${(highGiniDystopia/highGiniRuns.length*100).toFixed(1)}%)`);
  log(`    Utopia: ${highGiniUtopia} (${(highGiniUtopia/highGiniRuns.length*100).toFixed(1)}%)`);
  
  if (highGiniUtopia > 0) {
    log(`\n    ⚠️  WARNING: ${highGiniUtopia} Utopia runs with high inequality (Gini >0.45)`);
    log(`        Utopia should require reasonable equality. Check outcome logic!`);
  }
}

// 🌾 FAMINE STATISTICS (Oct 12, 2025)
const avgTotalFamineDeaths = results.reduce((sum, r) => sum + r.totalFamineDeaths, 0) / NUM_RUNS;
const avgActiveFamines = results.reduce((sum, r) => sum + r.activeFamines, 0) / NUM_RUNS;
const avgGenocideFamines = results.reduce((sum, r) => sum + r.genocideFamines, 0) / NUM_RUNS;
const avgTechPreventedDeaths = results.reduce((sum, r) => sum + r.techPreventedDeaths, 0) / NUM_RUNS;

const runsWithFamines = results.filter(r => r.totalFamineDeaths > 0).length;
const runsWithGenocide = results.filter(r => r.genocideFamines > 0).length;

// Collect all affected regions
const allAffectedRegions = new Set<string>();
results.forEach(r => r.famineAffectedRegions.forEach(region => allAffectedRegions.add(region)));

log(`\n🌾 FAMINE STATISTICS (TIER 1.7 Integration)`);
log(`${'='.repeat(50)}`);
log(`  Total famine deaths: ${(avgTotalFamineDeaths * 1000).toFixed(0)}M avg (${(avgTotalFamineDeaths * 1000 * NUM_RUNS).toFixed(0)}M cumulative)`);
log(`  Runs with famines: ${runsWithFamines}/${NUM_RUNS} (${(runsWithFamines/NUM_RUNS*100).toFixed(1)}%)`);
log(`  Active famines at end: ${avgActiveFamines.toFixed(1)} avg`);
log(`  Genocide-driven famines: ${avgGenocideFamines.toFixed(1)} avg`);
log(`  Runs with genocide: ${runsWithGenocide}/${NUM_RUNS} (${(runsWithGenocide/NUM_RUNS*100).toFixed(1)}%)`);
log(`  Tech-prevented deaths: ${(avgTechPreventedDeaths * 1000).toFixed(0)}M avg`);

if (avgTechPreventedDeaths > 0 && avgTotalFamineDeaths > 0) {
  const techEffectiveness = (avgTechPreventedDeaths / (avgTotalFamineDeaths + avgTechPreventedDeaths)) * 100;
  log(`  Tech effectiveness: ${techEffectiveness.toFixed(1)}% mortality reduction`);
}

log(`\n  AFFECTED REGIONS:`);
if (allAffectedRegions.size > 0) {
  allAffectedRegions.forEach(region => {
    const regionCount = results.filter(r => r.famineAffectedRegions.includes(region)).length;
    log(`    ${region}: ${regionCount}/${NUM_RUNS} runs (${(regionCount/NUM_RUNS*100).toFixed(1)}%)`);
  });
} else {
  log(`    ✅ No famines triggered in any runs`);
}

// Famine context warnings
if (avgGenocideFamines > 0) {
  log(`\n  ⚠️  GENOCIDE CONTEXT DETECTED:`);
  log(`    Tech deployment blocked in ${avgGenocideFamines.toFixed(1)} avg famines`);
  log(`    These are aid blockade or resource extraction scenarios where tech cannot help`);
}

if (avgTotalFamineDeaths > 0.5) {
  log(`\n  ⚠️  HIGH FAMINE MORTALITY:`);
  log(`    ${(avgTotalFamineDeaths * 1000).toFixed(0)}M deaths avg indicates major ecosystem or climate collapse`);
  log(`    This is likely from biodiversity loss (< 30%) or nuclear winter scenarios`);
}

// Reality check: Does Utopia have low inequality?
const utopiaOutcomeRuns = results.filter(r => r.outcome === 'utopia');
if (utopiaOutcomeRuns.length > 0) {
  const utopiaAvgGini = utopiaOutcomeRuns.reduce((sum, r) => sum + r.globalGini, 0) / utopiaOutcomeRuns.length;
  const utopiaAvgWorstQoL = utopiaOutcomeRuns.reduce((sum, r) => sum + r.worstRegionQoL, 0) / utopiaOutcomeRuns.length;
  
  log(`\n  UTOPIA INEQUALITY CHECK:`);
  log(`    Avg Gini in Utopia runs: ${utopiaAvgGini.toFixed(3)} (should be <0.40)`);
  log(`    Avg Worst Region QoL: ${utopiaAvgWorstQoL.toFixed(3)} (should be >0.50)`);
  
  if (utopiaAvgGini > 0.40) {
    log(`\n    🚨 BUG: Utopia runs have high inequality! Outcome criteria too lenient.`);
  }
}

// ============================================================================
log('\n\n' + '='.repeat(80));
log('💀 MULTI-DIMENSIONAL DEATH STATISTICS (Oct 18, 2025)');
log('='.repeat(80));

// Aggregate death statistics across all runs
const aggregateProximate = {
  war: 0, famine: 0, disasters: 0, disease: 0,
  ecosystem: 0, pollution: 0, ai: 0, cascade: 0, other: 0
};
const aggregateRoot = {
  climateChange: 0, conflict: 0, governance: 0, alignment: 0,
  natural: 0, poverty: 0, other: 0
};

// Sum across all runs
results.forEach(r => {
  aggregateProximate.war += r.deathsByProximate.war;
  aggregateProximate.famine += r.deathsByProximate.famine;
  aggregateProximate.disasters += r.deathsByProximate.disasters;
  aggregateProximate.disease += r.deathsByProximate.disease;
  aggregateProximate.ecosystem += r.deathsByProximate.ecosystem;
  aggregateProximate.pollution += r.deathsByProximate.pollution;
  aggregateProximate.ai += r.deathsByProximate.ai;
  aggregateProximate.cascade += r.deathsByProximate.cascade;
  aggregateProximate.other += r.deathsByProximate.other;

  aggregateRoot.climateChange += r.deathsByRoot.climateChange;
  aggregateRoot.conflict += r.deathsByRoot.conflict;
  aggregateRoot.governance += r.deathsByRoot.governance;
  aggregateRoot.alignment += r.deathsByRoot.alignment;
  aggregateRoot.natural += r.deathsByRoot.natural;
  aggregateRoot.poverty += r.deathsByRoot.poverty;
  aggregateRoot.other += r.deathsByRoot.other;
});

// Calculate totals
const totalProximateDeaths = Object.values(aggregateProximate).reduce((sum, v) => sum + v, 0);
const totalRootDeaths = Object.values(aggregateRoot).reduce((sum, v) => sum + v, 0);

// Helper to format death statistics with NaN protection
const formatDeathStat = (deaths: number, total: number): string => {
  if (isNaN(deaths) || isNaN(total) || total === 0) return '0M (0.0%)';
  const millions = (deaths * 1000).toFixed(0); // Convert billions to millions
  const percent = ((deaths / total) * 100);
  if (isNaN(percent) || !isFinite(percent)) return `${millions}M (0.0%)`;
  return `${millions}M (${percent.toFixed(1)}%)`;
};

log(`\n  AGGREGATE ACROSS ${NUM_RUNS} RUNS:`);
log(`    Total Crisis Deaths: ${(totalProximateDeaths * 1000).toFixed(0)}M (excluding natural deaths)`);
log(`    Average per Run: ${((totalProximateDeaths / NUM_RUNS) * 1000).toFixed(0)}M`);

log(`\n  === PROXIMATE CAUSES (What killed them) ===`);
log(`    Famine:     ${formatDeathStat(aggregateProximate.famine, totalProximateDeaths)}`);
log(`    War:        ${formatDeathStat(aggregateProximate.war, totalProximateDeaths)}`);
log(`    Disease:    ${formatDeathStat(aggregateProximate.disease, totalProximateDeaths)}`);
log(`    Disasters:  ${formatDeathStat(aggregateProximate.disasters, totalProximateDeaths)}`);
log(`    Ecosystem:  ${formatDeathStat(aggregateProximate.ecosystem, totalProximateDeaths)}`);
log(`    Pollution:  ${formatDeathStat(aggregateProximate.pollution, totalProximateDeaths)}`);
log(`    AI:         ${formatDeathStat(aggregateProximate.ai, totalProximateDeaths)}`);
log(`    Cascade:    ${formatDeathStat(aggregateProximate.cascade, totalProximateDeaths)}`);
log(`    Other:      ${formatDeathStat(aggregateProximate.other, totalProximateDeaths)}`);

log(`\n  === ROOT CAUSES (Why it happened) ===`);
log(`    Governance:      ${formatDeathStat(aggregateRoot.governance, totalRootDeaths)}`);
log(`    Climate Change:  ${formatDeathStat(aggregateRoot.climateChange, totalRootDeaths)}`);
log(`    Conflict:        ${formatDeathStat(aggregateRoot.conflict, totalRootDeaths)}`);
log(`    Poverty:         ${formatDeathStat(aggregateRoot.poverty, totalRootDeaths)}`);
log(`    Alignment:       ${formatDeathStat(aggregateRoot.alignment, totalRootDeaths)}`);
log(`    Natural:         ${formatDeathStat(aggregateRoot.natural, totalRootDeaths)}`);
log(`    Other:           ${formatDeathStat(aggregateRoot.other, totalRootDeaths)}`);

// Key insight: Proximate vs Root comparison
if (totalProximateDeaths > 0 && totalRootDeaths > 0) {
  const govPercent = (aggregateRoot.governance / totalRootDeaths) * 100;
  const climatePercent = (aggregateRoot.climateChange / totalRootDeaths) * 100;
  const povertyPercent = (aggregateRoot.poverty / totalRootDeaths) * 100;

  log(`\n  KEY INSIGHT: Multi-Factor Attribution`);
  if (govPercent > 60) {
    log(`    ${govPercent.toFixed(0)}% governance root cause → policy/distribution failures dominate`);
    log(`    ${climatePercent.toFixed(0)}% climate creates stress, but systems amplify it into mass death`);
  } else if (climatePercent > 50) {
    log(`    ${climatePercent.toFixed(0)}% climate root cause → environmental limits exceeded`);
    log(`    ${govPercent.toFixed(0)}% governance amplifies climate stress into mortality`);
  } else {
    log(`    Multi-factor causation: Climate ${climatePercent.toFixed(0)}%, Governance ${govPercent.toFixed(0)}%, Poverty ${povertyPercent.toFixed(0)}%`);
    log(`    No single root cause dominates - systemic interaction`);
  }
}

// Reality check: Do percentages add up?
if (Math.abs((totalProximateDeaths - totalRootDeaths) / Math.max(totalProximateDeaths, 0.001)) > 0.01) {
  log(`\n  ⚠️  WARNING: Proximate deaths (${(totalProximateDeaths * 1000).toFixed(0)}M) != Root deaths (${(totalRootDeaths * 1000).toFixed(0)}M)`);
  log(`      Attribution may have bugs. Check populationDynamics.ts and regionalPopulations.ts`);
}

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
  // FIX (Oct 13): Add context warning if thriving during massive mortality
  if (avgDecline > 50) {
    log(`\n    ⚠️  Organizations thriving despite ${avgDecline.toFixed(0)}% human mortality!`);
    log(`       Check revenue penalties and bankruptcy logic.`);
  } else {
  log(`\n    ✅ Excellent: Organizations are thriving!`);
  }
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
  // FIX (Oct 13): Check if compute growth is realistic
  if (avgComputeGrowth > 10000) {
    log(`\n    🚨 ANOMALY: ${avgComputeGrowth.toFixed(0)}x compute growth (Moore's Law = ~256x in 20yr)`);
    log(`       Investigate: possible exponential runaway bug?`);
  } else if (avgDecline > 50) {
    log(`\n    ⚠️  Exceptional compute despite ${avgDecline.toFixed(0)}% mortality`);
    log(`       Who's maintaining the data centers?`);
  } else {
  log(`\n    ⚡ Exceptional compute growth! Infrastructure boom.`);
  }
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
  // FIX (Oct 13): Add context warning for high profit during collapse
  if (avgDecline > 50) {
    log(`\n    ⚠️  ${avgRevExpRatio.toFixed(0)}x profit margin while ${avgDecline.toFixed(0)}% of customers died!`);
    log(`       Revenue should drop proportionally to population.`);
  } else {
  log(`\n    💰 Highly profitable! Organizations accumulating wealth.`);
  }
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
