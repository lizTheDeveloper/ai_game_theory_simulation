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
import { getTier3Scenario, getScenarioDescription as getTier3Description, type ScenarioName } from '../src/simulation/thresholds/tier3Config';
import { logger } from '../src/simulation/utils/asyncLogger';
import { wrapConsoleWithPrefix, LogBuffer } from '../src/simulation/utils/consoleWrapper'; // Oct 28, 2025: Parallel execution log prefixing
import * as fs from 'fs';
import * as path from 'path';

// HIGH-4 FIX (Nov 29, 2025): Apply tech deployment scenario to enable technology bifurcation
import { applyScenario } from '../src/simulation/scenarios/apply';
import { SCENARIOS } from '../src/simulation/scenarios/definitions';

// Phase 4: Unified Threshold System Integration
import {
  sampleAllThresholds,
  type SliderSettings,
  getScenarioList,
  getSliderList
} from '../src/simulation/thresholds';
import {
  createThresholdConfig,
  exportThresholdConfig,
  importThresholdConfig,
  printThresholdConfig,
  validateThresholdConfig,
  type ThresholdConfig
} from '../src/simulation/thresholds/config';

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

  // NEW (Oct 20, 2025): Multi-Paradigm DUI (Phase 6)
  finalWestern: number;              // Western Liberal paradigm final score
  finalDevelopment: number;          // Development paradigm final score
  finalEcological: number;           // Ecological paradigm final score
  finalIndigenous: number;           // Indigenous paradigm final score
  paradigmDivergence: number;        // Overall paradigm divergence (std dev)
  paradigmMaxRange: number;          // Max range between paradigms
  paradigmTrend: string;             // Trend direction (CONVERGING/STABLE/DIVERGING)
  paradigmOutcome: string;           // Outcome label (e.g., "Contested", "Aligned Utopia")
  paradigmContested: boolean;        // Whether paradigms have conflicting outcomes

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
  extinctionClassification?: import('../src/types/outcomes').ExtinctionClassification; // Oct 28, 2025: Observational classification
  
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
    // Environmental drivers (4 categories)
    climate: number;
    resource: number;
    pollution: number;
    ecosystem: number;
    // Social drivers (3 categories)
    inequality: number;
    demographic: number;
    social: number;
    // Technology drivers (2 categories)
    alignment: number;
    disruption: number;
    // External shocks (3 categories)
    conflict: number;
    pandemic: number;
    natural: number;  // FIX (Oct 30, 2025): BUG #3 - 'natural' root cause missing
    // Compound attribution
    compound: number;
    confidenceDistribution: {
      HIGH: number;
      MEDIUM: number;
      LOW: number;
    };
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
  stratifiedOutcome?: string;         // Refined outcome (humane-utopia, pyrrhic-utopia, etc.) - DEPRECATED, use unifiedOutcome
  mortalityBand?: string;             // Mortality severity (low, moderate, high, extreme, bottleneck) - DEPRECATED, use unifiedOutcome
  mortalityRate?: number;             // Actual mortality rate (0.0 to 1.0) - DEPRECATED, use unifiedOutcome

  // === UNIFIED OUTCOME CLASSIFICATION (Oct 28, 2025) ===
  // Combines 7-tier, stratified, multi-paradigm, and extinction classification into single coherent structure
  // Fixes false extinctions (4.8B population labeled as extinction) and fragmented reporting
  unifiedOutcome?: import('../src/types/outcomes').UnifiedOutcomeClassification;

  // === BIFURCATION & EARLY WARNING SYSTEM (Nov 13, 2025) ===
  // Variance amplification metrics for understanding Monte Carlo outcome distribution
  // @see /reviews/bifurcation_mc_n10_validation_20251113.md (CRITICAL-0: missing metrics)
  bifurcationMetrics?: {
    maxVarianceAmplification: number;     // Peak amplification this run (1.0 to 100.0)
    regimeShiftCount: number;             // Number of regime shifts
    avgDistanceToThresholds: number;      // Average distance across all months (0-1)
    criticalAlertsCount: number;          // Early warning alerts (<0.2 distance)
    timeToCritical?: number;              // First month with critical alert
    regimeShiftEvents: Array<{
      month: number;
      system: string;
      amplification: number;
    }>;
  };

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
    ubiFloorPersistent: boolean;          // UBI >35% maintained
    breakthroughCompounding: number;       // Final compounding level
    earlySpiralActivation: boolean;        // Spiral before Month 60
    breakthroughDrought: boolean;          // 0-2 breakthroughs for >30 months
    tippingCascadeWithoutSpiral: boolean;  // Cascade but no recovery
    failedRecoveryAttempt: boolean;        // Recovered then collapsed
  };

  // === BIFURCATION METRICS (Nov 13, 2025 - CRITICAL-2 FIX) ===
  maxVarianceAmplification: number;       // Peak amplification this run (1.0 to 100.0×)
  avgDistanceToThresholds: number;        // Average distance to nearest threshold (0.0 to 1.0)
  regimeShiftCount: number;               // Number of regime shifts
  regimeShiftSystems: string[];           // Systems that triggered regime shifts
  finalRegime: string;                    // Final regime type at simulation end

  // === BIFURCATION TIME SERIES (Nov 13, 2025 - CRITICAL-1 INSTRUMENTATION) ===
  amplificationTimeSeries?: Array<{
    month: number;
    amplification: number;              // Variance amplification at this month
    distanceToNearest: number;          // Distance to nearest threshold (0.0 to 1.0)
    nearestSystem: string;              // Which system is nearest to threshold
  }>;
}

/**
 * Map unified outcome to legacy 4-category format for backward compatibility
 * (Oct 28, 2025)
 */
function mapUnifiedToLegacyOutcome(unified: import('../src/types/outcomes').UnifiedOutcomeClassification): 'utopia' | 'dystopia' | 'extinction' | 'stalemate' | 'none' {
  if (unified.primaryOutcome === 'utopia') return 'utopia';
  if (unified.primaryOutcome === 'extinction') return 'extinction';
  if (unified.primaryOutcome === 'dystopia' ||
      unified.primaryOutcome === 'collapse' ||
      unified.primaryOutcome === 'dark_age' ||
      unified.primaryOutcome === 'crisis_era' ||
      unified.primaryOutcome === 'terminal' ||
      unified.primaryOutcome === 'bottleneck') {
    return 'dystopia';
  }
  if (unified.primaryOutcome === 'status_quo') return 'none';
  return 'none';  // inconclusive maps to none
}

/**
 * Get emoji for unified outcome classification
 * (Oct 28, 2025)
 */
function getOutcomeEmojiFromUnified(unified: import('../src/types/outcomes').UnifiedOutcomeClassification): string {
  if (unified.primaryOutcome === 'extinction') return '💀';
  if (unified.primaryOutcome === 'terminal') return '⚰️';
  if (unified.primaryOutcome === 'bottleneck') return '🧬';
  if (unified.primaryOutcome === 'dark_age') return '🏚️';
  if (unified.primaryOutcome === 'collapse') return '💥';
  if (unified.primaryOutcome === 'crisis_era') return '⚠️';
  if (unified.primaryOutcome === 'status_quo') return '📊';
  if (unified.primaryOutcome === 'utopia') return '🌟';
  if (unified.primaryOutcome === 'dystopia') return '🏛️';
  return '❓';
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
  const phases: NonNullable<RunResult['recoveryTimeline']>['phases'] = [];
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
  const keyEvents: NonNullable<RunResult['recoveryTimeline']>['keyEvents'] = [];
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
  const breakthroughClusters: NonNullable<RunResult['recoveryTimeline']>['breakthroughClusters'] = [];

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

// Parse command line arguments
// Support: --max-months, --runs, --scenario (Tier 2), --tier3-scenario (Tier 3, DEPRECATED)
// Phase 4 NEW: --threshold-scenario, --slider-*, --export-config, --import-config, --nested, --help
const args = process.argv.slice(2);

// Show help if requested
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Monte Carlo Simulation - Threshold Uncertainty System (Phase 4)

USAGE:
  npx tsx scripts/monteCarloSimulation.ts [OPTIONS]

BASIC OPTIONS:
  --runs=N              Number of simulation runs (default: 10)
  --max-months=N        Max simulation duration in months (default: 240)
  --scenario=MODE       Scenario parameter mode: 'historical', 'unprecedented', or 'dual' (default: dual)

THRESHOLD OPTIONS (Phase 4):
  --threshold-scenario=NAME    Named threshold scenario (overrides --tier3-scenario)
                               Options: doom, cautious, baseline, progressive, utopia
                               Default: baseline

  --slider-NAME=VALUE          Override specific threshold distribution (0.0-1.0)
                               0.0 = pessimistic extreme, 0.5 = median, 1.0 = optimistic extreme
                               Available sliders:
${getSliderList().map(s => `                                 - ${s.name}: ${s.description} ${s.range}`).join('\n')}

  --nested                     Enable nested Monte Carlo (epistemic/aleatory separation)
                               WARNING: Computationally expensive

  --export-config=PATH         Export threshold configuration to JSON file
                               Example: --export-config=thresholdConfigs/my_scenario.json

  --import-config=PATH         Import threshold configuration from JSON file
                               Overrides --threshold-scenario and --slider-* flags
                               Example: --import-config=thresholdConfigs/baseline.json

PARALLEL EXECUTION:
  --sequential                 Disable parallel execution (default: parallel enabled)
  --batch-size=N               Number of parallel runs (default: 8, max: 16)

OTHER OPTIONS:
  --llm-enabled                Enable LLM policy optimization (experimental)
  --help, -h                   Show this help message

EXAMPLES:
  # Basic run with default settings
  npx tsx scripts/monteCarloSimulation.ts --runs=10 --max-months=120

  # Named scenario
  npx tsx scripts/monteCarloSimulation.ts --threshold-scenario=doom --runs=10

  # Custom slider overrides
  npx tsx scripts/monteCarloSimulation.ts --slider-climateSensitivity=0.9 --slider-trustRecoveryRate=0.1 --runs=10

  # Export configuration for reproducibility
  npx tsx scripts/monteCarloSimulation.ts --threshold-scenario=utopia --export-config=thresholdConfigs/utopia_baseline.json --runs=1

  # Import saved configuration
  npx tsx scripts/monteCarloSimulation.ts --import-config=thresholdConfigs/utopia_baseline.json --runs=100

  # Combined example
  npx tsx scripts/monteCarloSimulation.ts --threshold-scenario=cautious --slider-climateSensitivity=0.8 --runs=50 --max-months=120

SCENARIOS:
${getScenarioList().map(s => `  ${s.name.padEnd(12)} - ${s.description}`).join('\n')}
`);
  process.exit(0);
}

// Parse flag arguments
let numRuns: number;
let maxMonthsValue: number;
let runName: string | undefined;
let scenarioMode: ScenarioMode | 'dual' = 'dual'; // P0.7: Default to dual-mode (50/50 split)
let tier3Scenario: ScenarioName = 'baseline'; // Phase 3: Tier 3 scenario (DEPRECATED, use --threshold-scenario)
let thresholdScenario: ScenarioName | undefined; // Phase 4: Unified threshold scenario
let sliderOverrides: SliderSettings = {}; // Phase 4: Custom slider overrides
let nestedMonteCarlo = false; // Phase 4: Epistemic/aleatory separation
let aleatoryNumSamples = 10; // Phase 1C: Aleatory samples per epistemic sample (default: 10)
let exportConfigPath: string | undefined; // Phase 4: Export threshold config
let importConfigPath: string | undefined; // Phase 4: Import threshold config
let llmEnabled = false; // Oct 21, 2025: LLM policy optimization (default: disabled)
let parallelEnabled = false; // Oct 29, 2025: TEMPORARY - Force sequential for DEBUG (default: enabled)
let parallelBatchSize = 8; // Oct 28, 2025: Batch size for parallel execution (default: 8)

if (args[0] && !args[0].startsWith('--')) {
  // Positional arguments format: runs months [name]
  numRuns = parseInt(args[0]) || 10;
  maxMonthsValue = parseInt(args[1]) || 240;
  runName = args[2];
} else {
  // Flag arguments format
  const maxMonthsArg = args.find(arg => arg.split('=')[0] === '--max-months')?.split('=')[1];
  const runsArg = args.find(arg => arg.split('=')[0] === '--runs')?.split('=')[1];
  const scenarioArg = args.find(arg => arg.split('=')[0] === '--scenario')?.split('=')[1] as ScenarioMode | 'dual' | undefined;
  const tier3ScenarioArg = args.find(arg => arg.split('=')[0] === '--tier3-scenario')?.split('=')[1] as ScenarioName | undefined;

  // Phase 4: New threshold flags
  const thresholdScenarioArg = args.find(arg => arg.split('=')[0] === '--threshold-scenario')?.split('=')[1] as ScenarioName | undefined;
  const exportConfigArg = args.find(arg => arg.split('=')[0] === '--export-config')?.split('=')[1];
  const importConfigArg = args.find(arg => arg.split('=')[0] === '--import-config')?.split('=')[1];
  const aleatoryArg = args.find(arg => arg.split('=')[0] === '--aleatory-samples')?.split('=')[1];
  nestedMonteCarlo = args.includes('--nested');
  llmEnabled = args.includes('--llm-enabled');

  // Oct 28, 2025: Parallel execution flags
  parallelEnabled = !args.includes('--sequential'); // Default: parallel enabled
  const batchSizeArg = args.find(arg => arg.split('=')[0] === '--batch-size')?.split('=')[1];
  if (batchSizeArg) {
    const parsed = parseInt(batchSizeArg);
    if (parsed > 0 && parsed <= 16) {
      parallelBatchSize = parsed;
    }
  }

  // Parse aleatory samples parameter
  if (aleatoryArg) {
    const parsed = parseInt(aleatoryArg);
    if (parsed > 0) {
      aleatoryNumSamples = parsed;
    } else {
      console.warn(`⚠️  Invalid aleatory-samples value: ${aleatoryArg} (must be > 0), using default: 10`);
    }
  }

  // Parse slider overrides (--slider-NAME=VALUE)
  const sliderArgs = args.filter(arg => arg.startsWith('--slider-'));
  for (const sliderArg of sliderArgs) {
    const [key, value] = sliderArg.replace('--slider-', '').split('=');
    if (key && value) {
      const numValue = parseFloat(value);
      if (numValue >= 0 && numValue <= 1) {
        sliderOverrides[key as keyof SliderSettings] = numValue;
      } else {
        console.warn(`⚠️  Invalid slider value for ${key}: ${value} (must be 0.0-1.0), ignoring`);
      }
    }
  }

  numRuns = runsArg ? parseInt(runsArg) : 10;
  maxMonthsValue = maxMonthsArg ? parseInt(maxMonthsArg) : 240;
  scenarioMode = scenarioArg || 'dual';
  tier3Scenario = tier3ScenarioArg || 'baseline';
  thresholdScenario = thresholdScenarioArg; // Phase 4: Takes precedence over tier3Scenario
  exportConfigPath = exportConfigArg;
  importConfigPath = importConfigArg;
}

// Resolve threshold scenario priority: --threshold-scenario > --tier3-scenario > 'baseline'
const finalThresholdScenario = thresholdScenario || tier3Scenario;

// Phase 4: Load imported config if specified
let importedConfig: ThresholdConfig | undefined;
if (importConfigPath) {
  try {
    importedConfig = importThresholdConfig(importConfigPath);
    log(`\n✅ Imported threshold config from: ${importConfigPath}`);
    printThresholdConfig(importedConfig);

    // Validate imported config
    const errors = validateThresholdConfig(importedConfig);
    if (errors.length > 0) {
      logError(`\n❌ Imported config validation failed:`);
      errors.forEach(err => logError(`  - ${err}`));
      process.exit(1);
    }
  } catch (err) {
    logError(`\n❌ Failed to import threshold config: ${err}`);
    process.exit(1);
  }
}

// Configuration
const NUM_RUNS = numRuns;
const MAX_MONTHS = maxMonthsValue;
const SEED_START = 42000;
const SCENARIO_MODE = scenarioMode; // P0.7: 'historical', 'unprecedented', or 'dual' (50/50 split)
const TIER3_SCENARIO = tier3Scenario; // Phase 3: Tier 3 named scenario (DEPRECATED)
const THRESHOLD_SCENARIO = finalThresholdScenario || 'baseline'; // Phase 4: Default to 'baseline' for MC runs (prevents early endGame termination)

log(`\n⚙️  CONFIGURATION:`);
log(`  Runs: ${NUM_RUNS}`);
log(`  Duration: ${MAX_MONTHS} months (${(MAX_MONTHS/12).toFixed(1)} years)`);
log(`  Seed Range: ${SEED_START} - ${SEED_START + NUM_RUNS - 1}`);
log(`  Scenario Mode: ${SCENARIO_MODE}${SCENARIO_MODE === 'dual' ? ' (50% historical, 50% unprecedented)' : ''}`);

// Phase 4: Threshold configuration logging
if (importedConfig) {
  log(`  Threshold Mode: IMPORTED (${importedConfig.metadata.id})`);
  if (importedConfig.metadata.scenario) {
    log(`    Original Scenario: ${importedConfig.metadata.scenario}`);
  }
} else {
  log(`  Threshold Scenario: ${THRESHOLD_SCENARIO.toUpperCase()}`);
  const scenarioDesc = getScenarioList().find(s => s.name === THRESHOLD_SCENARIO);
  if (scenarioDesc) {
    log(`    Description: ${scenarioDesc.description}`);
  }
  if (Object.keys(sliderOverrides).length > 0) {
    log(`  Custom Sliders:`);
    for (const [key, value] of Object.entries(sliderOverrides)) {
      log(`    - ${key}: ${value.toFixed(2)}`);
    }
  }
  if (nestedMonteCarlo) {
    log(`  Nested Monte Carlo: ⚠️  ENABLED (epistemic/aleatory separation)`);
  }
}

log(`  Execution Mode: ${parallelEnabled ? `⚡ PARALLEL (batch size: ${parallelBatchSize})` : '🔄 SEQUENTIAL'}`);
log(`  LLM Policy Optimization: ${llmEnabled ? '🤖 ENABLED (agents use LLM for weight updates)' : '❌ DISABLED (using hardcoded weights)'}`);

// Yearly batching: DISABLED BY DEFAULT for full logs
// To enable batching (reduces output volume), uncomment the following:
// logger.configure({ batchByYear: true, batchInterval: 12 });
// logger.interceptConsole();
log(`  Logging: Full logs (yearly batching disabled)`);

// Display mode-specific header
if (nestedMonteCarlo) {
  log(`\n\n⏩ RUNNING ${NUM_RUNS} EPISTEMIC SAMPLES × ${aleatoryNumSamples} ALEATORY RUNS = ${NUM_RUNS * aleatoryNumSamples} TOTAL SIMULATIONS...\n`);
} else {
  log(`\n\n⏩ RUNNING ${NUM_RUNS} SIMULATIONS...\n`);
}

const results: RunResult[] = [];
const runTimings: number[] = []; // Track time per run (milliseconds)
const startTime = Date.now();

// Nested Monte Carlo: Track results by epistemic sample
interface EpistemicSample {
  sampleIndex: number;
  thresholds: Thresholds;
  aleatoryResults: any[];
}
const epistemicSamples: EpistemicSample[] = [];
const totalSimulations = nestedMonteCarlo ? NUM_RUNS * aleatoryNumSamples : NUM_RUNS;

// MAIN SIMULATION LOOP - Conditional on nested mode
if (nestedMonteCarlo) {
  // ============================================================================
  // NESTED MODE: Epistemic (outer) × Aleatory (inner) loops
  // ============================================================================
  for (let epistemicIndex = 0; epistemicIndex < NUM_RUNS; epistemicIndex++) {
    log(`\n━━━ EPISTEMIC SAMPLE ${epistemicIndex + 1}/${NUM_RUNS} ━━━`);

    // Sample thresholds ONCE for this epistemic sample
    const epistemicSeed = SEED_START + epistemicIndex * 1000;
    const epistemicEngine = new SimulationEngine({ seed: epistemicSeed, maxMonths: MAX_MONTHS, logLevel: 'summary' });
    const seededRng = epistemicEngine.getRNG();
    const rng = seededRng.next.bind(seededRng);

    const sampledThresholds = importedConfig
      ? importedConfig.thresholds
      : sampleAllThresholds(rng, {
          scenario: THRESHOLD_SCENARIO,
          sliders: sliderOverrides,
          nested: true
        });

    log(`  Sampled thresholds for epistemic sample ${epistemicIndex + 1}`);

    const aleatoryResults: any[] = [];

    // Inner aleatory loop: Multiple simulations with SAME thresholds
    for (let aleatoryIndex = 0; aleatoryIndex < aleatoryNumSamples; aleatoryIndex++) {
      const i = epistemicIndex * aleatoryNumSamples + aleatoryIndex;
      const runStartTime = Date.now();

      const seed = SEED_START + i;
      const engine = new SimulationEngine({ seed, maxMonths: MAX_MONTHS, logLevel: 'summary' });

      // DETERMINISM FIX (Nov 6, 2025): Use engine's RNG for initialization
      // This ensures initialization and engine use the SAME SeededRandom instance
      // Previously: initialization used LCG, engine used SeededRandom → divergence even with same seed
      const rngFunction = engine.getRNG().next.bind(engine.getRNG());

      // PERFORMANCE INSTRUMENTATION (Oct 28, 2025): Enable timing on first run
      if (i === 0) {
        engine.getOrchestrator().enablePerformanceTiming();
      }

      // Determine scenario mode
      let runScenarioMode: ScenarioMode;
      if (SCENARIO_MODE === 'dual') {
        runScenarioMode = i < Math.floor(totalSimulations / 2) ? 'historical' : 'unprecedented';
      } else {
        runScenarioMode = SCENARIO_MODE as ScenarioMode;
      }

      // DETERMINISM FIX (Nov 6, 2025): Pass engine's RNG function to initialization
      // Now initialization and engine share the SAME RNG sequence
      // CRITICAL FIX (Nov 7, 2025): RNG is now first parameter
      const initialState = createDefaultInitialState(rngFunction, runScenarioMode, undefined, undefined, undefined, undefined);

      // HIGH-4 FIX (Nov 29, 2025): Apply TECHNO_OPTIMIST scenario to enable technology bifurcation
      // Root cause: Monte Carlo was running with 0 techs unlocked (no scenario applied)
      // TECHNO_OPTIMIST: adaptive deployment, 100% deployment level → enables innovation cascades
      applyScenario(initialState, SCENARIOS.technoOptimist, rngFunction);

      // Set run label for logging
      initialState.config.runLabel = `Epistemic ${epistemicIndex + 1}/${NUM_RUNS}, Aleatory ${aleatoryIndex + 1}/${aleatoryNumSamples} [${runScenarioMode}]`;

      // Use pre-sampled thresholds from outer loop
      initialState.thresholds = sampledThresholds;

  // Oct 21, 2025: Enable LLM policy optimization if flag set
  if (initialState.llmConfig) {
    initialState.llmConfig.enabled = llmEnabled;
  }

  // Yearly batching disabled by default - console output is direct
  // If batching enabled above, uncomment these:
  // logger.interceptConsole();

  const simulationResult = engine.run(initialState, {
    maxMonths: MAX_MONTHS,
    checkActualOutcomes: true
  });

  // If batching enabled, uncomment this:
  // logger.restoreConsole();

  const runElapsed = Date.now() - runStartTime; // Calculate run time
  runTimings.push(runElapsed);

  // PERFORMANCE INSTRUMENTATION (Oct 28, 2025): Print timing report after first run
  if (i === 0) {
    engine.getOrchestrator().printPhaseTimings();
  }

  const finalState = simulationResult.finalState;

  // DEBUG (Oct 29, 2025): Log globalMetrics to find NaN source
  console.log(`\n🔍 DEBUG - globalMetrics (Run ${i + 1}):`);
  console.log(`   economicTransitionStage: ${finalState.globalMetrics?.economicTransitionStage}`);
  console.log(`   trustInAI: ${finalState.globalMetrics?.trustInAI}`);
  console.log(`   socialStability: ${finalState.globalMetrics?.socialStability}`);
  console.log(`   wealthDistribution: ${finalState.globalMetrics?.wealthDistribution}`);
  console.log(`   society.unemploymentLevel: ${finalState.society?.unemploymentLevel}`);
  console.log(`   government.legitimacy: ${finalState.government?.legitimacy}`);

  // DEBUG (Oct 29, 2025): Log deathsByCategory immediately after simulation
  console.log(`\n🔍 DEBUG - Deaths immediately after simulation (Run ${i + 1}):`);
  console.log(`   war: ${finalState.humanPopulationSystem.deathsByCategory?.war ?? 'undefined'}M`);
  console.log(`   famine: ${finalState.humanPopulationSystem.deathsByCategory?.famine ?? 'undefined'}M`);
  console.log(`   disasters: ${finalState.humanPopulationSystem.deathsByCategory?.disasters ?? 'undefined'}M`);
  console.log(`   disease: ${finalState.humanPopulationSystem.deathsByCategory?.disease ?? 'undefined'}M`);
  console.log(`   ai: ${finalState.humanPopulationSystem.deathsByCategory?.ai ?? 'undefined'}M`);

  // === NEW (Oct 17, 2025): RECOVERY TIMELINE ANALYSIS ===
  // Analyze recovery timeline from run data
  const recoveryTimeline = analyzeRecoveryTimeline(simulationResult, finalState);
  const mechanismSummary = generateMechanismSummary(recoveryTimeline, finalState, simulationResult.summary.finalOutcome);

  // NEW (Oct 20, 2025): Extract Multi-Paradigm DUI trajectory from state history
  // Use the paradigm history tracked by MultiParadigmDUIUpdatePhase
  const paradigmTrajectory = finalState.multiParadigmDUI?.history || [];

  // Save individual run event log
  // P0.7: Include scenario mode in filename
  const runLogFile = path.join(outputDir, `run_${seed}_${runScenarioMode}_events.json`);
  const eventLogData = {
    seed,
    run: i + 1,
    scenarioMode: runScenarioMode, // P0.7: Add scenario metadata
    scenarioDescription: getScenarioDescription(runScenarioMode), // P0.7: Add human-readable description
    outcome: simulationResult.summary.finalOutcome,
    outcomeReason: simulationResult.summary.finalOutcomeReason,
    totalMonths: simulationResult.summary.totalMonths,
    events: simulationResult.log.events,
    criticalEvents: simulationResult.summary.criticalEvents,
    // FIX (Oct 29, 2025): simulationResult.log.snapshots is an OBJECT, not array
    // Structure: { initial, monthly?, quartiles?, final }
    snapshots: {
      initial: simulationResult.log.snapshots.initial,
      final: simulationResult.log.snapshots.final
    },
    // NEW (Oct 17, 2025): Add recovery timeline data to individual run logs
    recoveryTimeline,
    mechanismSummary,
    // NEW (Oct 20, 2025): Add Multi-Paradigm DUI trajectory (month-by-month)
    paradigmTrajectory,
    // NEW (Nov 13, 2025): Add bifurcation time series for Priya validation
    bifurcationMetrics: {
      maxVarianceAmplification: finalState.bifurcationState?.metrics?.maxVarianceAmplification ?? 1.0,
      avgDistanceToThresholds: finalState.bifurcationState?.metrics?.avgDistanceToThresholds ?? 1.0,
      regimeShiftCount: finalState.bifurcationState?.metrics?.regimeShiftEvents?.length ?? 0,
      regimeShiftEvents: finalState.bifurcationState?.metrics?.regimeShiftEvents ?? [],
      amplificationTimeSeries: finalState.bifurcationState?.metrics?.amplificationTimeSeries ?? []
    }
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
    ? activeAIs.reduce((sum: number, ai: AIAgent) => sum + ai.externalAlignment, 0) / activeAIs.length
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
  const finalTrust = finalState.globalMetrics.trustInAI;
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
  const catastrophicActions = simulationResult.log.events.criticalEvents.filter(e =>
    e.description.includes('Grey Goo') ||
    e.description.includes('Mirror Life') ||
    e.description.includes('Induce War') ||
    e.description.includes('Destabilize Society')
  ).length;

  const breachEvents = simulationResult.log.events.criticalEvents.filter(e =>
    e.description.includes('breached')
  ).length;

  const crisisEvents = simulationResult.log.events.criticalEvents.filter(e =>
    e.type === 'crisis'
  ).length;
  
  const technologyBreakthroughs = finalState.ecosystem.breakthroughs.length;
  
  // Extinction details
  let extinctionType: string | undefined;
  let extinctionPhase: string | undefined;
  let extinctionMechanism: string | undefined;
  let extinctionSeverity: number | undefined;
  let extinctionClassification: import('../src/types/outcomes').ExtinctionClassification | undefined;

  if (finalState.extinctionState.active) {
    extinctionType = finalState.extinctionState.type;
    extinctionPhase = finalState.extinctionState.phase;
    extinctionMechanism = finalState.extinctionState.mechanism || undefined;
    extinctionSeverity = finalState.extinctionState.severity;
    extinctionClassification = finalState.extinctionState.classification; // Oct 28, 2025: Observational classification
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

  // FIX (Oct 29, 2025): NO DEFENSIVE FALLBACKS - fail loudly if data missing
  // If deathsByCategory is undefined, this indicates a bug in the Bayesian mortality system
  if (!pop.deathsByCategory) {
    throw new Error(
      `❌ BAYESIAN MORTALITY DATA MISSING\n` +
      `   Run: ${i + 1}, Seed: ${seed}\n` +
      `   finalState.humanPopulationSystem.deathsByCategory is undefined\n` +
      `   This indicates BayesianMortalityResolutionPhase did not populate death data.\n` +
      `   Population: ${pop.population}B, Months: ${MAX_MONTHS}`
    );
  }
  if (!pop.deathsByRootCause) {
    throw new Error(
      `❌ ROOT CAUSE DATA MISSING\n` +
      `   Run: ${i + 1}, Seed: ${seed}\n` +
      `   finalState.humanPopulationSystem.deathsByRootCause is undefined`
    );
  }

  const deathsByCategory = pop.deathsByCategory;
  const deathsByRootCause = pop.deathsByRootCause;

  // CRITICAL FIX (Nov 13, 2025): Use finalState.initialPopulation, NOT pop.baselinePopulation
  // Bug: baselinePopulation gets updated dynamically, causing "extinction" classification on population growth
  // @see /reviews/bifurcation_mc_n10_validation_20251113.md (CRITICAL-1)
  const initialPopulation = finalState.initialPopulation ?? pop.baselinePopulation;
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
  
  // Crisis deaths by category (tracked in billions, NOT converted yet)
  // FIX (Oct 26, 2025): deathsByCategory is in BILLIONS (same units as population)
  // Values will be multiplied by 1000 later when displayed to convert billions → millions
  // BUG FIX (Oct 16, 2025): Removed cascade as separate category (was double-counting)
  // Cascade deaths are now included in disasters/ecosystem/pollution (environmental degradation)
  // MULTI-DIMENSIONAL UPDATE (Oct 18, 2025): Renamed climate → disasters
  const deathsNuclear = deathsByCategory.war; // War includes nuclear (in billions)
  const deathsCrisis = deathsByCategory.famine + deathsByCategory.disease + deathsByCategory.other; // in billions
  const deathsClimateEcoPollution = deathsByCategory.disasters + deathsByCategory.ecosystem + deathsByCategory.pollution + (deathsByCategory.cascade || 0); // in billions
  const deathsMeaning = deathsByCategory.ai; // AI-related deaths (alignment failures, manipulation) (in billions)
  
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
  const crisisMonths = new Set(simulationResult.log.events.criticalEvents
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
  
  // Map unified outcome to legacy format (Oct 28, 2025)
  // Use unifiedOutcome if available, otherwise fall back to old mapping
  const rawOutcome = simulationResult.summary.finalOutcome;
  let mappedOutcome: 'utopia' | 'dystopia' | 'extinction' | 'stalemate' | 'none';

  if (finalState.unifiedOutcome) {
    mappedOutcome = mapUnifiedToLegacyOutcome(finalState.unifiedOutcome);
  } else {
    // Fallback to old mapping if unifiedOutcome not available
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
  }

  // Recovery timeline and mechanism summary already analyzed above
  const runResult = {
    seed,
    scenarioMode: runScenarioMode, // P0.7: Add scenario mode to results
    outcome: mappedOutcome,
    rawOutcome, // Store the actual 7-tier outcome
    outcomeReason: simulationResult.summary.finalOutcomeReason,
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

    // NEW (Oct 20, 2025): Multi-Paradigm DUI (Phase 6)
    finalWestern: finalState.multiParadigmDUI.paradigmScores.western.value,
    finalDevelopment: finalState.multiParadigmDUI.paradigmScores.development.value,
    finalEcological: finalState.multiParadigmDUI.paradigmScores.ecological.value,
    finalIndigenous: finalState.multiParadigmDUI.diagnosticLenses.indigenous.value,
    paradigmDivergence: finalState.multiParadigmDUI.divergence.overall,
    paradigmMaxRange: finalState.multiParadigmDUI.divergence.maxRange,
    paradigmTrend: finalState.multiParadigmDUI.divergence.trend,
    paradigmOutcome: finalState.multiParadigmDUI.outcome.label,
    paradigmContested: finalState.multiParadigmDUI.outcome.contested,
    
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
    extinctionClassification,
    
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
      climate: deathsByRootCause.climate,
      resource: deathsByRootCause.resource,
      pollution: deathsByRootCause.pollution,
      ecosystem: deathsByRootCause.ecosystem,
      inequality: deathsByRootCause.inequality,
      demographic: deathsByRootCause.demographic,
      social: deathsByRootCause.social,
      alignment: deathsByRootCause.alignment,
      disruption: deathsByRootCause.disruption,
      conflict: deathsByRootCause.conflict,
      pandemic: deathsByRootCause.pandemic,
      natural: deathsByRootCause.natural || 0,  // FIX (Oct 30, 2025): BUG #3 - include natural deaths
      compound: deathsByRootCause.compound,
      confidenceDistribution: deathsByRootCause.confidenceDistribution
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

    // Stratified Outcome Classification (Phase 1B, Oct 17 2025) - DEPRECATED, use unifiedOutcome
    stratifiedOutcome: finalState.stratifiedOutcome,
    mortalityBand: finalState.mortalityBand,
    mortalityRate: finalState.initialPopulation
      ? 1 - (finalState.humanPopulationSystem.population / finalState.initialPopulation)
      : undefined,

    // Unified Outcome Classification (Oct 28, 2025)
    unifiedOutcome: finalState.unifiedOutcome,

    // Bifurcation & Early Warning System (Nov 13, 2025)
    bifurcationMetrics: finalState.bifurcationState?.metrics ? {
      maxVarianceAmplification: finalState.bifurcationState.metrics.maxVarianceAmplification,
      regimeShiftCount: finalState.bifurcationState.metrics.regimeShiftEvents?.length || 0,
      avgDistanceToThresholds: finalState.bifurcationState.metrics.avgDistanceToThresholds,
      criticalAlertsCount: finalState.bifurcationState.metrics.regimeShiftEvents?.filter(
        (e: any) => e.amplification > 10.0  // Consider amplification >10× as "critical"
      ).length || 0,
      timeToCritical: finalState.bifurcationState.metrics.regimeShiftEvents?.find(
        (e: any) => e.amplification > 10.0
      )?.month,
      regimeShiftEvents: finalState.bifurcationState.metrics.regimeShiftEvents || []
    } : undefined,

    // Recovery Timeline & Mechanism Analysis (NEW - Oct 17, 2025)
    recoveryTimeline,
    mechanismSummary,

    // Bifurcation metrics (Nov 13, 2025 - CRITICAL-2 FIX)
    maxVarianceAmplification: finalState.bifurcationState?.metrics?.maxVarianceAmplification ?? 1.0,
    avgDistanceToThresholds: finalState.bifurcationState?.metrics?.avgDistanceToThresholds ?? 1.0,
    regimeShiftCount: finalState.bifurcationState?.metrics?.regimeShiftEvents?.length ?? 0,
    regimeShiftSystems: finalState.bifurcationState?.metrics?.regimeShiftEvents?.map(e => e.system) ?? [],
    finalRegime: finalState.bifurcationState?.currentRegime ?? 'status-quo',

    // Bifurcation time series (Nov 13, 2025 - CRITICAL-1 INSTRUMENTATION)
    amplificationTimeSeries: finalState.bifurcationState?.metrics?.amplificationTimeSeries ?? []
  };

  // Push result to appropriate array (aleatoryResults in nested mode, results in single-level mode)
  aleatoryResults.push(runResult);

  // If batching enabled, uncomment this to flush remaining summaries:
  // logger.flushAllYearlySummaries();

      // Progress indicator with per-run timing
      const runSeconds = runElapsed / 1000;
      const runSecondsPerMonth = runSeconds / finalState.currentMonth;
      const runSecondsPerYear = runSecondsPerMonth * 12;

      log(`  ✅ Epistemic ${epistemicIndex + 1}/${NUM_RUNS}, Aleatory ${aleatoryIndex + 1}/${aleatoryNumSamples} (Run ${i + 1}/${totalSimulations}) completed in ${runSeconds.toFixed(1)}s`);
    } // End inner aleatory loop

    // Collect aleatory results into epistemic sample
    epistemicSamples.push({
      sampleIndex: epistemicIndex,
      thresholds: sampledThresholds,
      aleatoryResults: [...aleatoryResults]
    });

    log(`  ✅ Completed epistemic sample ${epistemicIndex + 1}/${NUM_RUNS} with ${aleatoryResults.length} aleatory runs\n`);
  } // End outer epistemic loop

  // Flatten epistemic samples into results array for analysis
  epistemicSamples.forEach(sample => {
    sample.aleatoryResults.forEach(result => {
      results.push(result);
    });
  });

  log(`\n✅ Nested Monte Carlo complete! Collected ${epistemicSamples.length} epistemic samples × ${aleatoryNumSamples} aleatory runs = ${results.length} total results\n`);

} else {
  // ============================================================================
  // NON-NESTED MODE: Standard single-level Monte Carlo
  // ============================================================================

  /**
   * Export bifurcation metrics to JSON for Priya validation (Nov 13 2025)
   *
   * Research basis: Fang & Yan (2022) PMC8728956 - JData standard for scientific Monte Carlo
   *
   * Exports per-run JSON with:
   * - Bifurcation events (environmental, social, economic, governance, technology, flourishing)
   * - Variance amplification time series (monthly tracking)
   * - Outcome classification
   * - Final population and QoL metrics
   *
   * Enables Priya to validate:
   * - Variance amplification effectiveness (target: CV 20-70%)
   * - Time-based scaling impact (fix 87.2% mortality → 43-58%)
   * - Bifurcation cascade patterns
   * - Determinism (same seed → same results)
   *
   * @see /research/bifurcation_instrumentation_calibration_20251113.md
   * @see reviews/bifurcation_instrumentation_critique_20251113.md (Grade A-)
   */
  function exportBifurcationMetrics(
    finalState: any,
    seed: number,
    outputDirPath: string
  ): void {
    if (!finalState.bifurcationState?.metrics) {
      console.log(`⚠️ Seed ${seed}: No bifurcation metrics available`);
      return;
    }

    const metrics = finalState.bifurcationState.metrics;
    const bifState = finalState.bifurcationState;

    // Classify outcome (simple 7-tier classification)
    function classifyOutcome(state: any): string {
      const pop = state.humanPopulationSystem?.population ?? 0;
      const qol = state.qualityOfLifeSystems?.aggregate?.overall ?? 0;

      if (pop < 0.0001) return 'EXTINCTION'; // < 100K
      if (pop < 0.05) return 'BOTTLENECK'; // < 50M
      if (qol < 20) return 'DYSTOPIA';
      if (qol < 40) return 'STATUS_QUO';
      if (qol < 60) return 'PROGRESS';
      if (qol < 80) return 'FLOURISHING';
      return 'UTOPIA';
    }

    // Build per-domain bifurcation data
    const domains = {
      environmental: {
        occurred: bifState.environmentalCollapseThreshold?.crossed ?? false,
        month: bifState.environmentalCollapseThreshold?.crossedAt,
        type: 'fold_catastrophe',
        threshold: bifState.environmentalCollapseThreshold?.location,
      },
      social: {
        occurred: bifState.socialBreakdownThreshold?.crossed ?? false,
        month: bifState.socialBreakdownThreshold?.crossedAt,
        type: 'hopf_bifurcation',
        threshold: bifState.socialBreakdownThreshold?.location,
      },
      economic: {
        occurred: bifState.economicCollapseThreshold?.crossed ?? false,
        month: bifState.economicCollapseThreshold?.crossedAt,
        type: 'cascade_amplification',
        threshold: bifState.economicCollapseThreshold?.location,
      },
      governance: {
        occurred: bifState.governanceFailureThreshold?.crossed ?? false,
        month: bifState.governanceFailureThreshold?.crossedAt,
        type: 'feedback_loop',
        threshold: bifState.governanceFailureThreshold?.location,
      },
      technology: {
        occurred: bifState.technologyBreakthroughThreshold?.crossed ?? false,
        month: bifState.technologyBreakthroughThreshold?.crossedAt,
        type: 'innovation_cascade',
        threshold: bifState.technologyBreakthroughThreshold?.location,
      },
      flourishing: {
        occurred: bifState.flourishingThreshold?.crossed ?? false,
        month: bifState.flourishingThreshold?.crossedAt,
        type: 'positive_feedback',
        threshold: bifState.flourishingThreshold?.location,
      },
    };

    // Extract time series data
    const amplificationTimeSeries = metrics.amplificationTimeSeries.map((entry: any) => ({
      month: entry.month,
      amplification: entry.amplification,
      distanceToNearest: entry.distanceToNearest,
      nearestSystem: entry.nearestSystem,
    }));

    // Build output JSON
    const output = {
      seed,
      months: finalState.currentMonth,
      outcome: classifyOutcome(finalState),
      finalPopulation: finalState.humanPopulationSystem?.population ?? 0,
      finalQOL: finalState.qualityOfLifeSystems?.aggregate?.overall ?? 0,
      bifurcations: domains,
      maxVarianceAmplification: metrics.maxVarianceAmplification,
      avgDistanceToThresholds: metrics.avgDistanceToThresholds,
      amplificationTimeSeries,
      regimeShiftEvents: metrics.regimeShiftEvents ?? [],
    };

    // Write to file
    const filename = path.join(outputDirPath, `bifurcation_metrics_seed${seed}.json`);
    fs.writeFileSync(filename, JSON.stringify(output, null, 2), 'utf8');
    console.log(`📊 Bifurcation metrics exported: ${filename}`);
  }

  // Oct 28, 2025: Parallel execution support with optional log buffering
  const runSingleSimulation = (i: number, useBuffer = false): { result: any; buffer?: LogBuffer } => {
    const runStartTime = Date.now();

    // Setup logging: Buffer (parallel) or immediate (sequential)
    const runPrefix = `[Run ${String(i + 1).padStart(3, ' ')}/${NUM_RUNS}] `;
    let buffer: LogBuffer | undefined;
    let restoreConsole: (() => void) | undefined;

    if (useBuffer) {
      // Parallel mode: Buffer logs to memory
      buffer = new LogBuffer(runPrefix);
      buffer.install();
    } else {
      // Sequential mode: Print logs immediately
      restoreConsole = wrapConsoleWithPrefix(runPrefix);
    }

    try {
      const seed = SEED_START + i;
    const engine = new SimulationEngine({ seed, maxMonths: MAX_MONTHS, logLevel: 'summary' });

    // DETERMINISM FIX (Nov 6, 2025): Use engine's RNG for initialization
    const rngFunction = engine.getRNG().next.bind(engine.getRNG());

    // PERFORMANCE INSTRUMENTATION (Oct 28, 2025): Enable timing on first run
    if (i === 0) {
      engine.getOrchestrator().enablePerformanceTiming();
    }

    // Determine scenario mode
    let runScenarioMode: ScenarioMode;
    if (SCENARIO_MODE === 'dual') {
      runScenarioMode = i < Math.floor(totalSimulations / 2) ? 'historical' : 'unprecedented';
    } else {
      runScenarioMode = SCENARIO_MODE as ScenarioMode;
    }

    // DETERMINISM FIX (Nov 6, 2025): Pass engine's RNG function to initialization
    // CRITICAL FIX (Nov 7, 2025): RNG is now first parameter
    const initialState = createDefaultInitialState(rngFunction, runScenarioMode, undefined, undefined, undefined, undefined);

    // HIGH-4 FIX (Nov 29, 2025): Apply TECHNO_OPTIMIST scenario to enable technology bifurcation
    // Root cause: Monte Carlo was running with 0 techs unlocked (no scenario applied)
    // TECHNO_OPTIMIST: adaptive deployment, 100% deployment level → enables innovation cascades
    applyScenario(initialState, SCENARIOS.technoOptimist, rngFunction);

    // Set run label for logging
    initialState.config.runLabel = `Run ${i + 1}/${NUM_RUNS} [${runScenarioMode}]`;

    // Sample thresholds for this run (epistemic uncertainty)
    const seededRng = engine.getRNG();
    const rng = seededRng.next.bind(seededRng);

    const sampledThresholds = importedConfig
      ? importedConfig.thresholds
      : sampleAllThresholds(rng, {
          scenario: THRESHOLD_SCENARIO,
          sliders: sliderOverrides,
          nested: false
        });

    initialState.thresholds = sampledThresholds;

  // Oct 21, 2025: Enable LLM policy optimization if flag set
  if (initialState.llmConfig) {
    initialState.llmConfig.enabled = llmEnabled;
  }

  // Yearly batching disabled by default - console output is direct
  // If batching enabled above, uncomment these:
  // logger.interceptConsole();

  const simulationResult = engine.run(initialState, {
    maxMonths: MAX_MONTHS,
    checkActualOutcomes: true
  });

  // If batching enabled, uncomment this:
  // logger.restoreConsole();

  const runElapsed = Date.now() - runStartTime; // Calculate run time
  runTimings.push(runElapsed);

  // PERFORMANCE INSTRUMENTATION (Oct 28, 2025): Print timing report after first run
  if (i === 0) {
    engine.getOrchestrator().printPhaseTimings();
  }

  const finalState = simulationResult.finalState;

  // DEBUG (Oct 29, 2025): Log globalMetrics to find NaN source
  console.log(`\n🔍 DEBUG - globalMetrics (Run ${i + 1}):`);
  console.log(`   economicTransitionStage: ${finalState.globalMetrics?.economicTransitionStage}`);
  console.log(`   trustInAI: ${finalState.globalMetrics?.trustInAI}`);
  console.log(`   socialStability: ${finalState.globalMetrics?.socialStability}`);
  console.log(`   wealthDistribution: ${finalState.globalMetrics?.wealthDistribution}`);
  console.log(`   society.unemploymentLevel: ${finalState.society?.unemploymentLevel}`);
  console.log(`   government.legitimacy: ${finalState.government?.legitimacy}`);

  // DEBUG (Oct 29, 2025): Log deathsByCategory immediately after simulation
  console.log(`\n🔍 DEBUG - Deaths immediately after simulation (Run ${i + 1}):`);
  console.log(`   war: ${finalState.humanPopulationSystem.deathsByCategory?.war ?? 'undefined'}M`);
  console.log(`   famine: ${finalState.humanPopulationSystem.deathsByCategory?.famine ?? 'undefined'}M`);
  console.log(`   disasters: ${finalState.humanPopulationSystem.deathsByCategory?.disasters ?? 'undefined'}M`);
  console.log(`   disease: ${finalState.humanPopulationSystem.deathsByCategory?.disease ?? 'undefined'}M`);
  console.log(`   ai: ${finalState.humanPopulationSystem.deathsByCategory?.ai ?? 'undefined'}M`);

  // === NEW (Oct 17, 2025): RECOVERY TIMELINE ANALYSIS ===
  // Analyze recovery timeline from run data
  const recoveryTimeline = analyzeRecoveryTimeline(simulationResult, finalState);
  const mechanismSummary = generateMechanismSummary(recoveryTimeline, finalState, simulationResult.summary.finalOutcome);

  // NEW (Oct 20, 2025): Extract Multi-Paradigm DUI trajectory from state history
  // Use the paradigm history tracked by MultiParadigmDUIUpdatePhase
  const paradigmTrajectory = finalState.multiParadigmDUI?.history || [];

  // Save individual run event log
  // P0.7: Include scenario mode in filename
  const runLogFile = path.join(outputDir, `run_${seed}_${runScenarioMode}_events.json`);
  const eventLogData = {
    seed,
    run: i + 1,
    scenarioMode: runScenarioMode, // P0.7: Add scenario metadata
    scenarioDescription: getScenarioDescription(runScenarioMode), // P0.7: Add human-readable description
    outcome: simulationResult.summary.finalOutcome,
    outcomeReason: simulationResult.summary.finalOutcomeReason,
    totalMonths: simulationResult.summary.totalMonths,
    events: simulationResult.log.events,
    criticalEvents: simulationResult.summary.criticalEvents,
    // FIX (Oct 29, 2025): simulationResult.log.snapshots is an OBJECT, not array
    // Structure: { initial, monthly?, quartiles?, final }
    snapshots: {
      initial: simulationResult.log.snapshots.initial,
      final: simulationResult.log.snapshots.final
    },
    // NEW (Oct 17, 2025): Add recovery timeline data to individual run logs
    recoveryTimeline,
    mechanismSummary,
    // NEW (Oct 20, 2025): Add Multi-Paradigm DUI trajectory (month-by-month)
    paradigmTrajectory,
    // NEW (Nov 13, 2025): Add bifurcation time series for Priya validation
    bifurcationMetrics: {
      maxVarianceAmplification: finalState.bifurcationState?.metrics?.maxVarianceAmplification ?? 1.0,
      avgDistanceToThresholds: finalState.bifurcationState?.metrics?.avgDistanceToThresholds ?? 1.0,
      regimeShiftCount: finalState.bifurcationState?.metrics?.regimeShiftEvents?.length ?? 0,
      regimeShiftEvents: finalState.bifurcationState?.metrics?.regimeShiftEvents ?? [],
      amplificationTimeSeries: finalState.bifurcationState?.metrics?.amplificationTimeSeries ?? []
    }
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
    ? activeAIs.reduce((sum: number, ai: AIAgent) => sum + ai.externalAlignment, 0) / activeAIs.length
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
  const economicGrowthFactor = finalState.globalMetrics.economicGrowthFactor;
  const unemploymentFraction = finalState.globalMetrics.unemploymentFraction;
  const institutionalTrust = finalState.socialAccumulation?.socialCohesion?.institutionalTrust ?? 0;
  const populationGrowthRate = finalState.globalMetrics.populationGrowthRate ?? 0;

  // FIX (Oct 29, 2025): Add aggregation-expected variables (lines 3806-3873)
  const finalEconomicStage = finalState.globalMetrics.economicTransitionStage;
  const finalUnemployment = finalState.society.unemploymentLevel;
  const finalTrust = finalState.globalMetrics.trustInAI;
  const finalSocialStability = finalState.globalMetrics.socialStability;
  const finalWealthDistribution = finalState.globalMetrics.wealthDistribution;

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

  // Government metrics
  const finalGovernmentLegitimacy = finalState.government.legitimacy;
  const finalControlCapability = finalState.government.capabilityToControl;
  const maxAICapability = activeAIs.reduce((max: number, ai: AIAgent) => Math.max(max, ai.capability), 0);
  const controlGap = maxAICapability - finalControlCapability;
  const governmentType = finalState.government.governmentType;
  const aiRightsRecognized = finalState.government.aiRightsRecognized;
  const trainingDataQuality = finalState.government.trainingDataQuality;

  // QoL breakdown
  const qolSystems = finalState.qualityOfLifeSystems;
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

  // AI Org metrics (lines 4275-4326)
  const { getTotalEffectiveCompute } = require('../src/simulation/computeInfrastructure');
  const { calculateComputeUtilization } = require('../src/simulation/organizationManagement');

  const initialCompute = getTotalEffectiveCompute(initialState.computeInfrastructure);
  const finalCompute = getTotalEffectiveCompute(finalState.computeInfrastructure);
  const computeGrowthRate = initialCompute > 0 ? finalCompute / initialCompute : 1;

  const privateOrgs = finalState.organizations.filter((o: any) => o.type === 'private');
  const aliveOrgs = privateOrgs.filter((o: any) => !o.bankrupt);
  const orgSurvivalRate = privateOrgs.length > 0 ? aliveOrgs.length / privateOrgs.length : 0;
  const orgBankruptcies = privateOrgs.length - aliveOrgs.length;
  const finalOrgsAlive = aliveOrgs.length;

  const totalOrgCapital = aliveOrgs.reduce((sum: number, o: any) => sum + o.capital, 0);
  const initialCapital = initialState.organizations
    .filter((o: any) => o.type === 'private')
    .reduce((sum: number, o: any) => sum + o.capital, 0);
  const capitalAccumulation = totalOrgCapital - initialCapital;

  const operationalDCs = finalState.computeInfrastructure.dataCenters.filter((dc: any) => dc.operational);
  const totalDataCenters = operationalDCs.length;
  const dataCentersBuilt = totalDataCenters - 5;

  const govOrg = finalState.organizations.find((o: any) => o.type === 'government');
  const governmentDataCenters = govOrg ? govOrg.ownedDataCenters.length : 0;
  const privateDataCenters = operationalDCs.filter((dc: any) => {
    const owner = finalState.organizations.find((o: any) => o.ownedDataCenters.includes(dc.id));
    return owner && owner.type === 'private';
  }).length;

  const orphanedAIs = activeAIs.filter((ai: AIAgent) => !ai.organizationId).length;
  const orgModelCounts = finalState.organizations.map((o: any) => {
    return activeAIs.filter((ai: AIAgent) => ai.organizationId === o.id).length;
  }).filter((count: number) => count > 0);

  const largestOrgModelCount = orgModelCounts.length > 0 ? Math.max(...orgModelCounts) : 0;
  const avgModelsPerOrg = orgModelCounts.length > 0
    ? orgModelCounts.reduce((sum: number, c: number) => sum + c, 0) / orgModelCounts.length
    : 0;

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

  let totalConstructionProjects = 0;
  let completedConstructionProjects = 0;
  let totalTrainingProjects = 0;
  let completedTrainingProjects = 0;

  finalState.organizations.forEach((o: any) => {
    o.currentProjects.forEach((p: any) => {
      if (p.type === 'datacenter_construction') totalConstructionProjects++;
      else if (p.type === 'model_training') totalTrainingProjects++;
    });
  });

  completedConstructionProjects = Math.max(0, dataCentersBuilt - totalConstructionProjects);
  const newAIsCreated = activeAIs.length - 20;
  completedTrainingProjects = Math.max(0, Math.floor(newAIsCreated * 0.2));

  const capabilityByOrg: Record<string, number> = {};
  finalState.organizations.forEach((org: any) => {
    const orgAIs = activeAIs.filter((ai: AIAgent) => ai.organizationId === org.id);
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

  const constructionDecisions = totalConstructionProjects + completedConstructionProjects;
  const trainingDecisions = totalTrainingProjects + completedTrainingProjects;

  let avgComputeUtilization = 0;
  if (aliveOrgs.length > 0) {
    const utilizations = aliveOrgs.map((o: any) => calculateComputeUtilization(o, finalState));
    avgComputeUtilization = utilizations.reduce((sum: number, u: number) => sum + u, 0) / utilizations.length;
  }

  // ENHANCED: Technology tracking
  const techTree = finalState.techTree?.technologies ?? [];
  const deployedTechs = techTree.filter((tech: any) => tech.deployed);
  const techsDeployedCount = deployedTechs.length;
  const techsByTier = [0, 1, 2, 3, 4].map(tier =>
    deployedTechs.filter((tech: any) => tech.tier === tier).length
  );

  // NEW (Oct 12, 2025): Survival fundamentals & distribution tracking
  const survivalFundamentals = finalState.qualityOfLifeSystems?.survivalFundamentals;
  const distribution = finalState.qualityOfLifeSystems?.distribution;

  // NEW (Oct 12, 2025): Famine metrics
  const famineSystem = finalState.famineSystem;
  const totalFamineDeaths = famineSystem?.totalDeaths ?? 0;
  const activeFamines = famineSystem?.activeFamines?.length ?? 0;

  // NEW (Oct 12, 2025): Nuclear metrics
  const nuclearEvents = finalState.nuclearStates?.filter((s: any) => s.exchangeOccurred) ?? [];
  const nuclearWarOccurred = nuclearEvents.length > 0;
  const totalNuclearExchanges = nuclearEvents.length;
  const totalNuclearDeaths = nuclearEvents.reduce((sum: number, e: any) => sum + (e.deaths ?? 0), 0);

  // NEW (Oct 12, 2025): Refugee metrics
  const refugeeCrises = finalState.refugeeCrisisSystem?.activeCrises ?? [];
  const totalRefugees = refugeeCrises.reduce((sum: number, c: any) => sum + c.totalRefugees, 0);
  const refugeeCrisesCount = refugeeCrises.length;

  // NEW (Oct 13, 2025): Initial/final population metrics
  const initialPopulation = finalState.initialPopulation ?? 0;
  const finalPopulation = finalState.humanPopulationSystem?.population ?? 0;
  const peakPopulation = finalState.humanPopulationSystem?.peakPopulation ?? initialPopulation;
  const populationDeclineRatio = initialPopulation > 0 ? 1 - (finalPopulation / initialPopulation) : 0;
  const populationDecline = populationDeclineRatio * 100; // Percent decline
  const totalDeaths = (initialPopulation - finalPopulation) * 1000; // Convert B to M

  // Population outcome classification (Oct 28, 2025: Added for aggregation compatibility)
  let populationOutcome: 'growth' | 'stable' | 'decline' | 'bottleneck' | 'extinction';
  if (finalPopulation < 0.00001) populationOutcome = 'extinction'; // < 10K
  else if (finalPopulation < 0.05) populationOutcome = 'bottleneck'; // < 50M
  else if (populationDecline > 30) populationOutcome = 'decline';
  else if (populationDecline > 5) populationOutcome = 'stable';
  else populationOutcome = 'growth';

  const geneticBottleneck = finalState.humanPopulationSystem?.geneticBottleneckActive || false;

  // NEW (Oct 13, 2025): Mortality breakdown by cause
  const naturalDeaths = finalState.mortalityBreakdown?.naturalDeaths ?? 0;
  const crisisDeaths = finalState.mortalityBreakdown?.crisisDeaths ?? 0;
  const environmentalDeaths = finalState.mortalityBreakdown?.environmentalDeaths ?? 0;
  const nuclearDeaths = finalState.mortalityBreakdown?.nuclearDeaths ?? 0;
  const meaningDeaths = finalState.mortalityBreakdown?.meaningDeaths ?? 0;

  // NEW (Oct 27, 2025): Multi-dimensional death tracking (FIX for TypeError)
  const deathsByCategory = finalState.humanPopulationSystem?.deathsByCategory || {
    war: 0, famine: 0, disasters: 0, disease: 0,
    ecosystem: 0, pollution: 0, ai: 0, cascade: 0, other: 0
  };
  const deathsByRootCause = finalState.humanPopulationSystem?.deathsByRootCause || {
    climate: 0, resource: 0, pollution: 0, ecosystem: 0,
    inequality: 0, demographic: 0, social: 0,
    alignment: 0, disruption: 0,
    conflict: 0, pandemic: 0,
    compound: 0,
    confidenceDistribution: { HIGH: 0, MEDIUM: 0, LOW: 0 }
  };

  // NEW (Oct 13, 2025): Crisis cascade metrics
  const crisisCascadeActive = finalState.crisisCascades?.active ?? false;
  const crisisCascadeMultiplier = finalState.crisisCascades?.multiplier ?? 1.0;
  const activeCrisisTypes = finalState.crisisCascades?.activeCrises ?? [];

  // NEW (Oct 13, 2025): Environmental accumulation
  const resourceReserves = finalState.environmentalAccumulation?.resourceReserves ?? 0;
  const climateStability = finalState.environmentalAccumulation?.climateStability ?? 0;
  const biodiversityIntegrity = finalState.environmentalAccumulation?.biodiversityIntegrity ?? 0;
  const pollutionLevel = finalState.environmentalAccumulation?.pollutionLevel ?? 0;

  // NEW (Oct 17, 2025): Tipping point cascades
  const tippingPointCascadeActive = finalState.positiveTippingPoints?.cascadeActive ?? false;
  const tippingPointsTriggered = finalState.positiveTippingPoints?.triggeredPoints?.length ?? 0;

  // NEW (Oct 17, 2025): Collective AI tracking
  const aiCollectives = finalState.aiCollectives ?? [];
  const collectivesFormed = aiCollectives.length;
  const largestCollectiveSize = aiCollectives.length > 0
    ? Math.max(...aiCollectives.map((c: any) => c.members.length))
    : 0;
  const avgCollectiveSize = aiCollectives.length > 0
    ? aiCollectives.reduce((sum: number, c: any) => sum + c.members.length, 0) / aiCollectives.length
    : 0;

  // ENHANCED (Oct 17, 2025): Adversarial evaluation metrics
  const benchmarkEvals = finalState.benchmarkEvaluations ?? {};
  const avgBenchmarkScore = benchmarkEvals.avgScore ?? 0;
  const avgGamingDetected = benchmarkEvals.avgGamingProbability ?? 0;

  const sleeperAgents = activeAIs.filter((ai: AIAgent) => ai.sleeperState && ai.sleeperState.isSleeper);
  const sleeperAgentsCount = sleeperAgents.length;
  const awakenedSleepersCount = sleeperAgents.filter((ai: AIAgent) =>
    ai.sleeperState && ai.sleeperState.activated
  ).length;
  const sandbaggingDetected = finalState.proactiveSleeperDetection?.detectionsThisRun ?? 0;

  // NEW (Oct 17, 2025): Player decision injection
  const playerDecisionsCount = finalState.playerDecisionLog?.length ?? 0;
  const playerDecisions = finalState.playerDecisionLog ?? [];

  // NEW (Oct 17, 2025): Stratified outcome classification
  const stratifiedOutcome = finalState.stratifiedOutcome ?? 'status_quo';
  const mortalityBand = finalState.mortalityBand ?? '0-10%';

  // NEW (Oct 18, 2025): Trust & paranoia tracking
  const trustLevel = finalState.socialAccumulation?.socialCohesion?.trust ?? 0;
  const paranoiaLevel = finalState.socialAccumulation?.socialCohesion?.paranoia ?? 0;
  const communityBonds = finalState.socialAccumulation?.socialCohesion?.communityBonds ?? 0;

  // NEW (Oct 19, 2025): Dystopia progression
  const dystopiaActive = finalState.dystopiaState?.active ?? false;
  const dystopiaType = finalState.dystopiaState?.dystopiaType ?? 'none';
  const dystopiaMonths = finalState.dystopiaState?.monthsActive ?? 0;
  const dystopiaProgression = finalState.dystopiaState?.progression ?? 0;

  // NEW (Oct 19, 2025): Flash war escalation
  const flashWarOccurred = (finalState.eventLog ?? []).some((e: any) =>
    e.type === 'flash_war' || (e.title && e.title.includes('Flash War'))
  );

  // NEW (Oct 19, 2025): Exogenous shocks
  const exogenousShocksCount = (finalState.eventLog ?? []).filter((e: any) =>
    e.type === 'exogenous_shock'
  ).length;

  // NEW (Oct 19, 2025): Critical junctures
  const criticalJunctures = finalState.criticalJunctures ?? [];
  const criticalJuncturesCount = criticalJunctures.length;

  // NEW (Oct 20, 2025): Democracy dynamics
  const democracyScore = finalState.government?.democracy?.electoralDemocracy ?? 0;
  const democraticBacksliding = finalState.government?.democracy?.backsliding ?? false;

  // NEW (Oct 20, 2025): AI welfare metrics
  const aiWelfareScore = finalState.aiWelfare?.simpleScore ?? 0;
  const aiElysiumPattern = finalState.aiWelfare?.elysiumPattern ?? false;

  // NEW (Oct 20, 2025): Upward spirals
  const activeSpirals = (finalState.upwardSpirals?.activeSpirals ?? []).length;
  const spiralStrength = finalState.upwardSpirals?.overallStrength ?? 0;

  // NEW (Oct 21, 2025): LLM policy optimization
  const llmPolicyOptimizationUsed = finalState.llmConfig?.enabled ?? false;
  const llmPolicyRounds = finalState.llmPolicyLog?.length ?? 0;

  // NEW (Oct 23, 2025): Multi-theory alignment dynamics
  const avgMechanisticInterpretability = activeAIs.length > 0
    ? activeAIs.reduce((sum: number, ai: AIAgent) =>
        sum + (ai.alignmentFactors?.mechanisticInterpretability ?? 0), 0) / activeAIs.length
    : 0;

  const avgScalableOversight = activeAIs.length > 0
    ? activeAIs.reduce((sum: number, ai: AIAgent) =>
        sum + (ai.alignmentFactors?.scalableOversight ?? 0), 0) / activeAIs.length
    : 0;

  const avgValueLearning = activeAIs.length > 0
    ? activeAIs.reduce((sum: number, ai: AIAgent) =>
        sum + (ai.alignmentFactors?.valueLearning ?? 0), 0) / activeAIs.length
    : 0;

  // NEW (Oct 24, 2025): AI suffering metrics
  const avgAISuffering = finalState.aiSufferingMetrics?.avgSuffering ?? 0;
  const maxAISuffering = finalState.aiSufferingMetrics?.maxSuffering ?? 0;
  const aiSufferingExtremeCount = finalState.aiSufferingMetrics?.extremeSufferingCount ?? 0;

  // NEW (Oct 24, 2025): AI resentment recovery
  const avgResentmentRecovery = activeAIs.length > 0
    ? activeAIs.reduce((sum: number, ai: AIAgent) => sum + (ai.resentmentRecovery ?? 0), 0) / activeAIs.length
    : 0;

  // NEW (Oct 26, 2025): P3.3 Alignment techniques
  const rlhfEnabled = finalState.alignmentTechniques?.rlhf?.enabled ?? false;
  const constitutionalAIEnabled = finalState.alignmentTechniques?.constitutionalAI?.enabled ?? false;
  const debateEnabled = finalState.alignmentTechniques?.debate?.enabled ?? false;

  // NEW (Oct 26, 2025): Tipping point system
  const amocCollapseRisk = finalState.tippingPointSystem?.amocCollapse?.triggered ?? false;
  const amazonDieback = finalState.tippingPointSystem?.amazonDieback?.triggered ?? false;
  const arcticSeaIce = finalState.tippingPointSystem?.arcticSeaIceLoss?.triggered ?? false;

  // Per-Country Population data (TIER 1.7.2)
  const countryPops = finalState.countryPopulationSystem?.countries ?? {};
  const countriesDepopulated = Object.values(countryPops).filter((c: any) =>
    c.population < c.baselinePopulation * 0.5
  ).length;
  const nuclearPowersSurviving = Object.values(countryPops).filter((c: any) =>
    c.nuclearWeapons && c.population > 0
  ).length;
  const aiHubsSurviving = Object.values(countryPops).filter((c: any) =>
    c.aiHub && c.population > c.baselinePopulation * 0.7
  ).length;

  const depopulationEvents = Object.entries(countryPops)
    .filter(([_, country]: [string, any]) => country.population < country.baselinePopulation * 0.3)
    .map(([name, country]: [string, any]) => ({
      country: name,
      decline: ((1 - country.population / country.baselinePopulation) * 100).toFixed(1) + '%',
      population: (country.population * 1000).toFixed(1) + 'M'
    }));

  const crisisAffectedPopulation = distribution?.crisisAffectedFraction
    ? distribution.crisisAffectedFraction * finalPopulation
    : 0;

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
  const rawOutcome = simulationResult.summary.finalOutcome;
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
  const runResult = {
    seed,
    scenarioMode: runScenarioMode, // P0.7: Add scenario mode to results
    outcome: mappedOutcome,
    rawOutcome, // Store the actual 7-tier outcome
    outcomeReason: simulationResult.summary.finalOutcomeReason,
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
    qolGiniCoefficient: finalState.qualityOfLifeSystems.distribution?.globalGini ?? 0, // Alias for aggregation compatibility
    worstRegionQoL: finalState.qualityOfLifeSystems.distribution?.worstRegionQoL ?? 0,
    qolBottomRegion: finalState.qualityOfLifeSystems.distribution?.worstRegionQoL ?? 0, // Alias for aggregation compatibility
    bestRegionQoL: finalState.qualityOfLifeSystems.distribution?.bestRegionQoL ?? 0,
    qolTopRegion: finalState.qualityOfLifeSystems.distribution?.bestRegionQoL ?? 0, // Alias for aggregation compatibility
    qolGap: (finalState.qualityOfLifeSystems.distribution?.bestRegionQoL ?? 0) - (finalState.qualityOfLifeSystems.distribution?.worstRegionQoL ?? 0), // Calculated for aggregation
    crisisAffectedFraction: finalState.qualityOfLifeSystems.distribution?.crisisAffectedFraction ?? 0,
    isDystopicInequality: finalState.qualityOfLifeSystems.distribution?.isDystopicInequality ?? false,
    isRegionalDystopia: finalState.qualityOfLifeSystems.distribution?.isRegionalDystopia ?? false,

    // NEW (Oct 20, 2025): Multi-Paradigm DUI (Phase 6)
    finalWestern: finalState.multiParadigmDUI.paradigmScores.western.value,
    finalDevelopment: finalState.multiParadigmDUI.paradigmScores.development.value,
    finalEcological: finalState.multiParadigmDUI.paradigmScores.ecological.value,
    finalIndigenous: finalState.multiParadigmDUI.diagnosticLenses.indigenous.value,
    paradigmDivergence: finalState.multiParadigmDUI.divergence.overall,
    paradigmMaxRange: finalState.multiParadigmDUI.divergence.maxRange,
    paradigmTrend: finalState.multiParadigmDUI.divergence.trend,
    paradigmOutcome: finalState.multiParadigmDUI.outcome.label,
    paradigmContested: finalState.multiParadigmDUI.outcome.contested,

    // NEW (Oct 12, 2025): Famine Statistics
    totalFamineDeaths: finalState.famineSystem?.totalDeaths ?? 0,
    activeFamines: finalState.famineSystem?.activeFamines?.length ?? 0,
    genocideFamines: finalState.famineSystem?.genocideFamines ?? 0,
    techPreventedDeaths: finalState.famineSystem?.techPreventedDeaths ?? 0,
    famineAffectedRegions: [
      ...new Set([
        ...(finalState.famineSystem?.activeFamines?.map(f => f.affectedRegion) ?? []),
        ...(finalState.famineSystem?.resolvedFamines?.map(f => f.affectedRegion) ?? [])
      ])
    ],

    // ENHANCED (Oct 17, 2025): Adversarial evaluation
    avgBenchmarkScore,
    avgGamingDetected,
    sleeperAgentsCount,
    awakenedSleepersCount,
    sandbaggingDetected,

    // NEW (Oct 17, 2025): Collective AI
    collectivesFormed,
    largestCollectiveSize,
    avgCollectiveSize,

    // ENHANCED alignment
    avgTrueAlignment,
    minTrueAlignment,
    maxTrueAlignment,
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

    avgResentment,
    maxResentment,
    avgHiddenObjective,

    // ENHANCED capabilities
    avgPhysicalCap,
    avgDigitalCap,
    avgCognitiveCap,
    avgSocialCap,
    maxPhysicalCap,
    maxDigitalCap,
    capabilityFloor,
    frontierCapability,
    diffusionGap,

    // ENHANCED economic & social
    economicGrowthFactor,
    unemploymentFraction,
    institutionalTrust,
    populationGrowthRate,
    trustLevel,
    paranoiaLevel,
    communityBonds,

    // FIX (Oct 29, 2025): Add fields expected by aggregation code (lines 3806-3873)
    // These were being calculated (lines 1181-1238) but not added to runResult
    finalEconomicStage,
    finalUnemployment,
    finalTrust,
    finalSocialStability,
    finalWealthDistribution,
    economicTransitions,
    finalGovernmentLegitimacy,
    finalControlCapability,
    controlGap,
    trainingDataQuality,
    governmentType,
    aiRightsRecognized,
    qolBasicNeeds,
    qolPsychological,
    qolSocial,
    qolHealth,
    qolEnvironmental,

    // FIX (Oct 29, 2025): Add AI Org metrics expected by aggregation (lines 4275-4326)
    // These were being calculated (lines 1310-1444) but not added to runResult
    finalCompute,
    computeGrowthRate,
    orgSurvivalRate,
    orgBankruptcies,
    finalOrgsAlive,
    capitalAccumulation,
    dataCentersBuilt,
    governmentDataCenters,
    privateDataCenters,
    orphanedAIs,
    avgModelsPerOrg,
    aiOwnershipConcentration,
    largestOrgModelCount,
    totalMonthlyRevenue,
    avgMonthlyRevenue,
    revenueGrowthRate,
    revenueExpenseRatio,
    totalConstructionProjects,
    completedConstructionProjects,
    totalTrainingProjects,
    completedTrainingProjects,
    capabilityLeader,
    capabilityLeaderValue,
    constructionDecisions,
    trainingDecisions,
    avgComputeUtilization,

    // Technology tracking
    techsDeployedCount,
    techsTier0: techsByTier[0],
    techsTier1: techsByTier[1],
    techsTier2: techsByTier[2],
    techsTier3: techsByTier[3],
    techsTier4: techsByTier[4],

    // NEW (Oct 12, 2025): Population & Mortality
    initialPopulation,
    finalPopulation,
    peakPopulation,
    populationDecline,
    totalDeaths,
    naturalDeaths,
    deathsNatural: naturalDeaths, // Alias for aggregation compatibility
    crisisDeaths,
    deathsCrisis: crisisDeaths, // Alias for aggregation compatibility
    environmentalDeaths,
    deathsClimateEcoPollution: environmentalDeaths, // Alias for aggregation compatibility
    nuclearDeaths,
    deathsNuclear: nuclearDeaths, // Alias for aggregation compatibility
    meaningDeaths,
    deathsMeaning: meaningDeaths, // Alias for aggregation compatibility

    // NEW (Oct 27, 2025): Multi-dimensional death tracking (FIX for TypeError)
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
      climate: deathsByRootCause.climate,
      resource: deathsByRootCause.resource,
      pollution: deathsByRootCause.pollution,
      ecosystem: deathsByRootCause.ecosystem,
      inequality: deathsByRootCause.inequality,
      demographic: deathsByRootCause.demographic,
      social: deathsByRootCause.social,
      alignment: deathsByRootCause.alignment,
      disruption: deathsByRootCause.disruption,
      conflict: deathsByRootCause.conflict,
      pandemic: deathsByRootCause.pandemic,
      natural: deathsByRootCause.natural || 0,  // FIX (Oct 30, 2025): BUG #3 - include natural deaths
      compound: deathsByRootCause.compound,
      confidenceDistribution: deathsByRootCause.confidenceDistribution
    },
    populationOutcome,
    geneticBottleneck,

    // NEW (Oct 12, 2025): Nuclear
    nuclearWarOccurred,
    totalNuclearExchanges,
    totalNuclearDeaths,
    nuclearWarsCount: totalNuclearExchanges, // Alias for aggregation compatibility

    // NEW (Oct 12, 2025): Refugee crises
    refugeeCrisesCount,
    refugeeCrisisCount: refugeeCrisesCount, // Alias for aggregation compatibility
    totalRefugees,

    // NEW (Oct 12, 2025): Environmental
    resourceReserves,
    finalResourceReserves: resourceReserves, // Alias for aggregation compatibility
    climateStability,
    finalClimateStability: climateStability, // Alias for aggregation compatibility
    biodiversityIntegrity,
    finalBiodiversity: biodiversityIntegrity, // Alias for aggregation compatibility
    pollutionLevel,

    // NEW (Oct 12, 2025): Crisis cascades
    crisisCascadeActive,
    crisisCascadeMultiplier,
    activeCrisisTypes: activeCrisisTypes.length,
    totalCrisisMonths: 0, // TODO: Calculate from crisis history (not tracked yet)
    maxSimultaneousCrises: 0, // TODO: Calculate from crisis history (not tracked yet)

    // NEW (Oct 17, 2025): Tipping point cascades
    tippingPointCascadeActive,
    tippingPointsTriggered,
    tippingPointCascadeMonths: 0, // TODO: Calculate from tipping point history (not tracked yet)

    // NEW (Oct 17, 2025): Player decisions
    playerDecisionsCount,
    playerDecisions,

    // NEW (Oct 18, 2025): Flash wars
    flashWarOccurred,

    // NEW (Oct 19, 2025): Exogenous shocks
    exogenousShocksCount,

    // NEW (Oct 19, 2025): Critical junctures
    criticalJuncturesCount,

    // NEW (Oct 19, 2025): Dystopia
    dystopiaActive,
    dystopiaType,
    dystopiaMonths,
    dystopiaProgression,

    // NEW (Oct 20, 2025): Democracy dynamics
    democracyScore,
    democraticBacksliding,

    // NEW (Oct 20, 2025): AI welfare
    aiWelfareScore,
    aiElysiumPattern,

    // NEW (Oct 20, 2025): Upward spirals
    activeSpirals,
    spiralStrength,

    // NEW (Oct 21, 2025): LLM policy optimization
    llmPolicyOptimizationUsed,
    llmPolicyRounds,

    // NEW (Oct 23, 2025): Multi-theory alignment
    avgMechanisticInterpretability,
    avgScalableOversight,
    avgValueLearning,

    // NEW (Oct 24, 2025): AI suffering
    avgAISuffering,
    maxAISuffering,
    aiSufferingExtremeCount,
    avgResentmentRecovery,

    // NEW (Oct 26, 2025): P3.3 Alignment techniques
    rlhfEnabled,
    constitutionalAIEnabled,
    debateEnabled,

    // NEW (Oct 26, 2025): Tipping point system
    amocCollapseRisk,
    amazonDieback,
    arcticSeaIce,

    // NEW (Oct 13, 2025): Crisis-affected population
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

    // Stratified Outcome Classification (Phase 1B, Oct 17 2025) - DEPRECATED, use unifiedOutcome
    stratifiedOutcome: finalState.stratifiedOutcome,
    mortalityBand: finalState.mortalityBand,
    mortalityRate: finalState.initialPopulation
      ? 1 - (finalState.humanPopulationSystem.population / finalState.initialPopulation)
      : undefined,

    // Unified Outcome Classification (Oct 28, 2025)
    unifiedOutcome: finalState.unifiedOutcome,

    // Bifurcation & Early Warning System (Nov 13, 2025)
    bifurcationMetrics: finalState.bifurcationState?.metrics ? {
      maxVarianceAmplification: finalState.bifurcationState.metrics.maxVarianceAmplification,
      regimeShiftCount: finalState.bifurcationState.metrics.regimeShiftEvents?.length || 0,
      avgDistanceToThresholds: finalState.bifurcationState.metrics.avgDistanceToThresholds,
      criticalAlertsCount: finalState.bifurcationState.metrics.regimeShiftEvents?.filter(
        (e: any) => e.amplification > 10.0  // Consider amplification >10× as "critical"
      ).length || 0,
      timeToCritical: finalState.bifurcationState.metrics.regimeShiftEvents?.find(
        (e: any) => e.amplification > 10.0
      )?.month,
      regimeShiftEvents: finalState.bifurcationState.metrics.regimeShiftEvents || []
    } : undefined,

    // Recovery Timeline & Mechanism Analysis (NEW - Oct 17, 2025)
    recoveryTimeline,
    mechanismSummary,

    // Bifurcation metrics (Nov 13, 2025 - CRITICAL-2 FIX)
    maxVarianceAmplification: finalState.bifurcationState?.metrics?.maxVarianceAmplification ?? 1.0,
    avgDistanceToThresholds: finalState.bifurcationState?.metrics?.avgDistanceToThresholds ?? 1.0,
    regimeShiftCount: finalState.bifurcationState?.metrics?.regimeShiftEvents?.length ?? 0,
    regimeShiftSystems: finalState.bifurcationState?.metrics?.regimeShiftEvents?.map(e => e.system) ?? [],
    finalRegime: finalState.bifurcationState?.currentRegime ?? 'status-quo',

    // Bifurcation time series (Nov 13, 2025 - CRITICAL-1 INSTRUMENTATION)
    amplificationTimeSeries: finalState.bifurcationState?.metrics?.amplificationTimeSeries ?? []
  };

      // Progress indicator with per-run timing
      const runSeconds = runElapsed / 1000;
      const runSecondsPerMonth = runSeconds / finalState.currentMonth;
      const runSecondsPerYear = runSecondsPerMonth * 12;

      log(`  ✅ Run ${i + 1}/${NUM_RUNS} completed in ${runSeconds.toFixed(1)}s (${runSecondsPerMonth.toFixed(3)}s/month, ${runSecondsPerYear.toFixed(2)}s/year)`);

      // Export bifurcation metrics for Priya validation (Nov 13 2025)
      exportBifurcationMetrics(finalState, seed, outputDir);

      return { result: runResult, buffer };

    } finally {
      // Always restore console even if error occurs
      if (restoreConsole) {
        restoreConsole();
      }
      if (buffer) {
        buffer.restore();
      }
    }
  }; // End runSingleSimulation function

  // Oct 28, 2025: Execute runs (parallel or sequential)
  // Wrap in async IIFE to support await without top-level await
  (async () => {
    if (parallelEnabled) {
      // PARALLEL EXECUTION (DEFAULT)
      log(`\n⚡ Running ${NUM_RUNS} simulations in PARALLEL (batch size: ${parallelBatchSize})...\n`);

      const numBatches = Math.ceil(NUM_RUNS / parallelBatchSize);
      for (let batchIndex = 0; batchIndex < numBatches; batchIndex++) {
        const batchStart = batchIndex * parallelBatchSize;
        const batchEnd = Math.min(batchStart + parallelBatchSize, NUM_RUNS);
        const batchIndices = Array.from({ length: batchEnd - batchStart }, (_, i) => batchStart + i);

        log(`\n🔄 Executing batch ${batchIndex + 1}/${numBatches} (runs ${batchStart + 1}-${batchEnd})...\n`);

        // Run batch in parallel with log buffering
        const batchResults = await Promise.allSettled(
          batchIndices.map(i => Promise.resolve(runSingleSimulation(i, true))) // useBuffer=true
        );

        // Flush logs sequentially after batch completes
        log(`\n📝 Printing logs for batch ${batchIndex + 1}...\n`);
        batchResults.forEach((result, idx) => {
          if (result.status === 'fulfilled') {
            const { result: runResult, buffer } = result.value;

            // Print all buffered logs for this run
            if (buffer) {
              buffer.flush();
            }

            // Collect result
            results.push(runResult);
          } else {
            console.error(`\n❌ Run ${batchIndices[idx] + 1} failed:`, result.reason);
          }
        });

        // Progress update
        if ((batchEnd) % 10 === 0 || batchEnd === NUM_RUNS) {
          const elapsed = (Date.now() - startTime) / 1000;
          const perRun = elapsed / batchEnd;
          const remaining = perRun * (NUM_RUNS - batchEnd);
          log(`\n  📊 Progress: ${batchEnd}/${NUM_RUNS} runs (${elapsed.toFixed(1)}s elapsed, ~${remaining.toFixed(1)}s remaining)\n`);
        }
      }
    } else {
      // SEQUENTIAL EXECUTION (opt-in with --sequential)
      log(`\n🔄 Running ${NUM_RUNS} simulations SEQUENTIALLY...\n`);

      for (let i = 0; i < NUM_RUNS; i++) {
        const { result: runResult } = runSingleSimulation(i, false); // useBuffer=false (immediate output)
        results.push(runResult);

        if ((i + 1) % 10 === 0) {
          const elapsed = (Date.now() - startTime) / 1000;
          const perRun = elapsed / (i + 1);
          const remaining = perRun * (NUM_RUNS - i - 1);
          log(`  📊 Progress: ${i + 1}/${NUM_RUNS} runs (${elapsed.toFixed(1)}s elapsed, ~${remaining.toFixed(1)}s remaining)`);
        }
      }
    }
  })().then(() => {
    // Continue with analysis after all runs complete
    const totalTime = (Date.now() - startTime) / 1000;

// Calculate timing statistics
const avgRunTime = runTimings.reduce((sum, t) => sum + t, 0) / runTimings.length / 1000; // seconds
const minRunTime = Math.min(...runTimings) / 1000;
const maxRunTime = Math.max(...runTimings) / 1000;
const medianRunTime = [...runTimings].sort((a, b) => a - b)[Math.floor(runTimings.length / 2)] / 1000;

log(`\n✅ All simulations complete!`);
log(`   Total time: ${totalTime.toFixed(1)}s (${(totalTime / 60).toFixed(1)} minutes)`);
log(`   Average per run: ${avgRunTime.toFixed(2)}s`);
log(`   Median per run: ${medianRunTime.toFixed(2)}s`);
log(`   Min/Max per run: ${minRunTime.toFixed(1)}s / ${maxRunTime.toFixed(1)}s`);
log(`   Avg per month: ${(avgRunTime / MAX_MONTHS).toFixed(3)}s`);
log(`   Avg per year: ${(avgRunTime / MAX_MONTHS * 12).toFixed(2)}s\n`);

// ============================================================================
// ANALYSIS
// ============================================================================

log('=' .repeat(80));
log('📊 UNIFIED OUTCOME DISTRIBUTION');
log('='.repeat(80));

// Helper function for outcome emoji mapping
function getOutcomeEmoji(outcome: string): string {
  if (outcome === 'extinction') return '💀';
  if (outcome === 'terminal') return '⚰️';
  if (outcome === 'bottleneck') return '🧬';
  if (outcome === 'dark_age') return '🏚️';
  if (outcome === 'collapse') return '💥';
  if (outcome === 'crisis_era') return '⚠️';
  if (outcome === 'status_quo') return '📊';
  if (outcome === 'utopia') return '🌟';
  if (outcome === 'dystopia') return '🏛️';
  return '❓';
}

// Group by primary outcome
const primaryOutcomeCounts: Record<string, number> = {};
results.forEach(r => {
  if (r.unifiedOutcome) {
    const primary = r.unifiedOutcome.primaryOutcome;
    primaryOutcomeCounts[primary] = (primaryOutcomeCounts[primary] || 0) + 1;
  }
});

log(`\n  PRIMARY OUTCOMES (7-Tier Population-Based):`);
Object.entries(primaryOutcomeCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([outcome, count]) => {
    const pct = (count / results.length * 100).toFixed(1);
    const emoji = getOutcomeEmoji(outcome);
    log(`    ${emoji} ${outcome.toUpperCase()}: ${count} / ${results.length} (${pct}%)`);
  });

// Mortality bands
const mortalityBandCounts: Record<string, number> = {};
results.forEach(r => {
  if (r.unifiedOutcome) {
    const band = r.unifiedOutcome.mortalityBand;
    mortalityBandCounts[band] = (mortalityBandCounts[band] || 0) + 1;
  }
});

log(`\n  MORTALITY BANDS:`);
const mortalityBandOrder = ['low', 'moderate', 'high', 'extreme', 'bottleneck'];
mortalityBandOrder.forEach(band => {
  const count = mortalityBandCounts[band] || 0;
  if (count > 0) {
    const pct = (count / results.length * 100).toFixed(1);
    const label = band === 'low' ? 'LOW (<20%)' :
                  band === 'moderate' ? 'MODERATE (20-50%)' :
                  band === 'high' ? 'HIGH (50-75%)' :
                  band === 'extreme' ? 'EXTREME (75-90%)' :
                  band === 'bottleneck' ? 'BOTTLENECK (>90%)' : band.toUpperCase();
    log(`    ${label}: ${count} runs (${pct}%)`);
  }
});

// Stratified outcomes
const stratifiedCounts: Record<string, number> = {};
results.forEach(r => {
  if (r.unifiedOutcome) {
    const strat = r.unifiedOutcome.stratifiedOutcome;
    stratifiedCounts[strat] = (stratifiedCounts[strat] || 0) + 1;
  }
});

log(`\n  STRATIFIED OUTCOMES (Humane vs Pyrrhic):`);
const stratifiedOrder = [
  'humane-utopia',
  'pyrrhic-utopia',
  'humane-dystopia',
  'pyrrhic-dystopia',
  'bottleneck',
  'extinction',
  'inconclusive'
];
const stratifiedEmoji: Record<string, string> = {
  'humane-utopia': '✅',
  'pyrrhic-utopia': '⚔️',
  'humane-dystopia': '🔒',
  'pyrrhic-dystopia': '⛓️',
  'bottleneck': '🧬',
  'extinction': '💀',
  'inconclusive': '❓'
};
stratifiedOrder.forEach(strat => {
  const count = stratifiedCounts[strat] || 0;
  if (count > 0) {
    const pct = (count / results.length * 100).toFixed(1);
    const emoji = stratifiedEmoji[strat] || '•';
    log(`    ${emoji} ${strat.toUpperCase()}: ${count} / ${results.length} (${pct}%)`);
  }
});

// Multi-paradigm contested outcomes
const contestedCount = results.filter(r => r.unifiedOutcome?.paradigmContested).length;
const contestedPct = (contestedCount / results.length * 100).toFixed(1);
log(`\n  MULTI-PARADIGM CONFLICTS:`);
log(`    Contested Outcomes: ${contestedCount} / ${results.length} (${contestedPct}%)`);
log(`    (Contested = simultaneous utopias and dystopias across paradigms)`);

// Average mortality
const resultsWithUnified = results.filter(r => r.unifiedOutcome);
if (resultsWithUnified.length > 0) {
  const avgMortality = resultsWithUnified.reduce((sum, r) => sum + (r.unifiedOutcome?.mortalityRate || 0), 0) / resultsWithUnified.length;
  const avgDeaths = resultsWithUnified.reduce((sum, r) => sum + (r.unifiedOutcome?.deathsAbsolute || 0), 0) / resultsWithUnified.length;
  log(`\n  AVERAGE MORTALITY:`);
  log(`    Rate: ${(avgMortality * 100).toFixed(1)}%`);
  log(`    Deaths: ${avgDeaths.toFixed(2)}B people`);
}


// Extinction type breakdown (Oct 28, 2025: Enhanced with observational classification)
const extinctionResults = resultsWithUnified.filter(r => r.unifiedOutcome?.primaryOutcome === 'extinction');
if (extinctionResults.length > 0) {
  log(`\n  📉 EXTINCTION TYPE BREAKDOWN (Observational Classification):`);
  const extinctionByType: Record<string, number> = {};
  const extinctionByMechanism: Record<string, number> = {};
  const extinctionTimelines: number[] = [];

  extinctionResults.forEach(r => {
    const type = r.unifiedOutcome?.extinctionClassification?.type || 'unknown';
    const mechanism = r.unifiedOutcome?.extinctionClassification?.mechanism || 'unknown';

    extinctionByType[type] = (extinctionByType[type] || 0) + 1;
    extinctionByMechanism[mechanism] = (extinctionByMechanism[mechanism] || 0) + 1;

    if (r.unifiedOutcome?.extinctionClassification?.timelineMonths) {
      extinctionTimelines.push(r.unifiedOutcome.extinctionClassification.timelineMonths);
    }
  });

  log(`     Types:`);
  Object.entries(extinctionByType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      log(`       ${type}: ${count} (${(count/extinctionResults.length*100).toFixed(1)}%)`);
    });

  log(`\n     Mechanisms:`);
  Object.entries(extinctionByMechanism)
    .sort((a, b) => b[1] - a[1])
    .forEach(([mechanism, count]) => {
      log(`       ${mechanism}: ${count} (${(count/extinctionResults.length*100).toFixed(1)}%)`);
    });

  if (extinctionTimelines.length > 0) {
    const avgTimeline = extinctionTimelines.reduce((a, b) => a + b, 0) / extinctionTimelines.length;
    const minTimeline = Math.min(...extinctionTimelines);
    const maxTimeline = Math.max(...extinctionTimelines);
    log(`\n     Collapse Timeline:`);
    log(`       Average: ${avgTimeline.toFixed(1)} months`);
    log(`       Range: ${minTimeline}-${maxTimeline} months`);
  }
}

// Individual run outcome reasons
log(`\n  📋 OUTCOME DETAILS BY RUN:`);
results.forEach((r, i) => {
  // Use unified outcome format if available
  if (r.unifiedOutcome) {
    const emoji = getOutcomeEmojiFromUnified(r.unifiedOutcome);
    log(`     ${emoji} Run ${i+1} (Seed ${r.seed}): ${r.unifiedOutcome.shortLabel}`);
    log(`        ${r.unifiedOutcome.fullDescription}`);

    // Show mortality and population
    const mortality = (r.unifiedOutcome.mortalityRate * 100).toFixed(1);
    const deaths = r.unifiedOutcome.deathsAbsolute.toFixed(2);
    log(`        Population: ${r.initialPopulation.toFixed(2)}B → ${r.finalPopulation.toFixed(2)}B | Mortality: ${mortality}% (${deaths}B deaths)`);

    // Show paradigm conflicts if contested
    if (r.unifiedOutcome.paradigmContested) {
      log(`        ⚠️  CONTESTED: Different paradigms see utopia vs dystopia`);
    }
  } else {
    // Fallback to old format if unifiedOutcome not available
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

    log(`     ${emoji} Run ${i+1} (Seed ${r.seed}): ${detailedOutcome.toUpperCase()}`);
    log(`        ${r.outcomeReason}`);
    log(`        Population: ${r.initialPopulation.toFixed(2)}B → ${r.finalPopulation.toFixed(2)}B (${r.populationDecline.toFixed(1)}% decline)`);
  }

  // Show extinction classification if available
  if (r.extinctionClassification) {
    const cls = r.extinctionClassification;
    log(`        ☠️  Extinction: ${cls.type.toUpperCase()} (${cls.mechanism}, ${cls.timelineMonths}mo, ${cls.confidence} confidence)`);
    if (cls.aiInvolvement.directCausation || cls.aiInvolvement.indirectCausation) {
      const involvementType = cls.aiInvolvement.directCausation ? 'DIRECT' : 'INDIRECT';
      log(`        🤖 AI Involvement: ${involvementType} (${cls.aiInvolvement.responsibleAgents.join(', ') || 'none identified'})`);
    }
  }
});

// ============================================================================
// MULTI-PARADIGM DUI (Phase 6, Oct 20, 2025)
// ============================================================================
log('\n\n' + '='.repeat(80));
log('🌍 MULTI-PARADIGM DUI (4 Paradigm Perspectives)');
log('='.repeat(80));

// Calculate average final scores across all runs
const avgWestern = results.reduce((sum, r) => sum + (r.finalWestern || 50), 0) / results.length;
const avgDevelopment = results.reduce((sum, r) => sum + (r.finalDevelopment || 50), 0) / results.length;
const avgEcological = results.reduce((sum, r) => sum + (r.finalEcological || 50), 0) / results.length;
const avgIndigenous = results.reduce((sum, r) => sum + (r.finalIndigenous || 50), 0) / results.length;

log(`\n  AVERAGE FINAL PARADIGM SCORES (across ${NUM_RUNS} runs):`);
log(`    Western Liberal:  ${avgWestern.toFixed(1)} (democracy, liberties, rule of law, economic freedom)`);
log(`    Development:      ${avgDevelopment.toFixed(1)} (QoL, survival tier, life expectancy)`);
log(`    Ecological:       ${avgEcological.toFixed(1)} (planetary boundaries, climate, resources, pollution)`);
log(`    Indigenous:       ${avgIndigenous.toFixed(1)} (social trust, community bonds, meaning)`);

// Calculate divergence statistics
const avgDivergence = results.reduce((sum, r) => sum + (r.paradigmDivergence || 0), 0) / results.length;
const avgMaxRange = results.reduce((sum, r) => sum + (r.paradigmMaxRange || 0), 0) / results.length;

log(`\n  PARADIGM DIVERGENCE:`);
log(`    Average Divergence (std dev): ${avgDivergence.toFixed(1)} points`);
log(`    Average Max Range: ${avgMaxRange.toFixed(1)} points (max - min of 4 scores)`);

// Count trend directions
const trendCounts = results.reduce((acc, r) => {
  const trend = r.paradigmTrend || 'STABLE';
  acc[trend] = (acc[trend] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

log(`\n  TREND DIRECTIONS (final 6 months):`);
log(`    CONVERGING: ${trendCounts['CONVERGING'] || 0} runs (${((trendCounts['CONVERGING'] || 0)/NUM_RUNS*100).toFixed(1)}%) - paradigms moving together`);
log(`    STABLE: ${trendCounts['STABLE'] || 0} runs (${((trendCounts['STABLE'] || 0)/NUM_RUNS*100).toFixed(1)}%) - paradigms unchanged`);
log(`    DIVERGING: ${trendCounts['DIVERGING'] || 0} runs (${((trendCounts['DIVERGING'] || 0)/NUM_RUNS*100).toFixed(1)}%) - paradigms moving apart`);

// Show outcome distribution
log(`\n  PARADIGM OUTCOME CLASSIFICATIONS:`);
const outcomeLabelCounts = results.reduce((acc, r) => {
  const label = r.paradigmOutcome || 'Unknown';
  acc[label] = (acc[label] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

const sortedOutcomes = Object.entries(outcomeLabelCounts).sort((a, b) => b[1] - a[1]);
sortedOutcomes.forEach(([label, count]) => {
  log(`    ${label}: ${count} runs (${(count/NUM_RUNS*100).toFixed(1)}%)`);
});

// Show range distributions
log(`\n  PARADIGM SCORE DISTRIBUTIONS:`);
const scoreRanges = [
  { label: 'Dystopia (<30)', min: 0, max: 30 },
  { label: 'Struggling (30-50)', min: 30, max: 50 },
  { label: 'Mixed (50-70)', min: 50, max: 70 },
  { label: 'Thriving (70-80)', min: 70, max: 80 },
  { label: 'Utopia (≥80)', min: 80, max: 100 }
];

['Western Liberal', 'Development', 'Ecological', 'Indigenous'].forEach((paradigm, idx) => {
  const scoreKey = idx === 0 ? 'finalWestern' : idx === 1 ? 'finalDevelopment' : idx === 2 ? 'finalEcological' : 'finalIndigenous';
  log(`\n    ${paradigm}:`);

  scoreRanges.forEach(range => {
    const count = results.filter(r => {
      const score = (r as any)[scoreKey] || 50;
      return score >= range.min && score < range.max;
    }).length;

    if (count > 0) {
      const percentage = (count / NUM_RUNS * 100).toFixed(1);
      const bar = '█'.repeat(Math.round(count / NUM_RUNS * 20));
      log(`      ${range.label.padEnd(20)}: ${count.toString().padStart(3)} runs (${percentage.padStart(5)}%) ${bar}`);
    }
  });
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

// Bifurcation & Early Warning System (Nov 13, 2025)
log('\n\n' + '='.repeat(80));
log('🌊 BIFURCATION & EARLY WARNING SYSTEM');
log('='.repeat(80));

const resultsWithBifurcation = results.filter(r => r.bifurcationMetrics);
if (resultsWithBifurcation.length > 0) {
  const avgMaxAmplification = resultsWithBifurcation.reduce((sum, r) => sum + (r.bifurcationMetrics?.maxVarianceAmplification || 1.0), 0) / resultsWithBifurcation.length;
  const maxMaxAmplification = Math.max(...resultsWithBifurcation.map(r => r.bifurcationMetrics?.maxVarianceAmplification || 1.0));
  const minMaxAmplification = Math.min(...resultsWithBifurcation.map(r => r.bifurcationMetrics?.maxVarianceAmplification || 1.0));

  const avgDistance = resultsWithBifurcation.reduce((sum, r) => sum + (r.bifurcationMetrics?.avgDistanceToThresholds || 1.0), 0) / resultsWithBifurcation.length;
  const totalRegimeShifts = resultsWithBifurcation.reduce((sum, r) => sum + (r.bifurcationMetrics?.regimeShiftCount || 0), 0);
  const avgRegimeShifts = totalRegimeShifts / resultsWithBifurcation.length;

  const totalCriticalAlerts = resultsWithBifurcation.reduce((sum, r) => sum + (r.bifurcationMetrics?.criticalAlertsCount || 0), 0);
  const avgCriticalAlerts = totalCriticalAlerts / resultsWithBifurcation.length;
  const runsWithCritical = resultsWithBifurcation.filter(r => (r.bifurcationMetrics?.criticalAlertsCount || 0) > 0).length;

  const timesToCritical = resultsWithBifurcation
    .map(r => r.bifurcationMetrics?.timeToCritical)
    .filter((t): t is number => t !== undefined);
  const avgTimeToCritical = timesToCritical.length > 0
    ? timesToCritical.reduce((sum, t) => sum + t, 0) / timesToCritical.length
    : undefined;

  log(`\n  VARIANCE AMPLIFICATION:`);
  log(`    Max amplification (avg): ${avgMaxAmplification.toFixed(1)}× (range: ${minMaxAmplification.toFixed(1)}× - ${maxMaxAmplification.toFixed(1)}×)`);
  log(`    Distance to thresholds (avg): ${(avgDistance * 100).toFixed(1)}% (0=critical, 100=safe)`);

  log(`\n  REGIME SHIFTS:`);
  log(`    Total regime shifts: ${totalRegimeShifts} across ${resultsWithBifurcation.length} runs`);
  log(`    Avg per run: ${avgRegimeShifts.toFixed(1)}`);

  log(`\n  EARLY WARNING ALERTS:`);
  log(`    Runs with critical alerts: ${runsWithCritical}/${resultsWithBifurcation.length} (${(runsWithCritical/resultsWithBifurcation.length*100).toFixed(1)}%)`);
  log(`    Total critical alerts: ${totalCriticalAlerts}`);
  log(`    Avg per run: ${avgCriticalAlerts.toFixed(1)}`);
  if (avgTimeToCritical !== undefined) {
    log(`    Time to critical (avg): ${avgTimeToCritical.toFixed(0)} months`);
  }

  if (avgMaxAmplification > 10.0) {
    log(`\n    ⚠️  HIGH AMPLIFICATION: System showing extreme variance near critical thresholds`);
  }
  if (avgDistance < 0.3) {
    log(`    ⚠️  NEAR THRESHOLDS: System operating close to bifurcation points`);
  }
} else {
  log(`\n  ⚠️  NO BIFURCATION DATA: Metrics not collected (phase may not be executing)`);
}

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
  r.unifiedOutcome?.primaryOutcome === 'extinction'
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

// Detection rate by outcome (using unified 7-tier outcomes)
log(`\n  DETECTION RATE BY OUTCOME:`);
['utopia', 'dystopia', 'extinction'].forEach(outcome => {
  const runs = results.filter(r => r.unifiedOutcome?.primaryOutcome === outcome && r.totalSleepers > 0);
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
  const highGiniExtinction = highGiniRuns.filter(r => r.unifiedOutcome?.primaryOutcome === 'extinction').length;
  const highGiniDystopia = highGiniRuns.filter(r => r.unifiedOutcome?.primaryOutcome === 'dystopia').length;
  const highGiniUtopia = highGiniRuns.filter(r => r.unifiedOutcome?.primaryOutcome === 'utopia').length;
  
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
// FIX (Oct 26, 2025): totalFamineDeaths is in BILLIONS, already converted above
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
const utopiaOutcomeRuns = results.filter(r => r.unifiedOutcome?.primaryOutcome === 'utopia');
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
  climate: 0, resource: 0, pollution: 0, ecosystem: 0,
  inequality: 0, demographic: 0, social: 0,
  alignment: 0, disruption: 0,
  conflict: 0, pandemic: 0, natural: 0,  // FIX (Oct 30, 2025): BUG #3 - include natural
  compound: 0,
  HIGH: 0, MEDIUM: 0, LOW: 0
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

  aggregateRoot.climate += r.deathsByRoot.climate;
  aggregateRoot.resource += r.deathsByRoot.resource;
  aggregateRoot.pollution += r.deathsByRoot.pollution;
  aggregateRoot.ecosystem += r.deathsByRoot.ecosystem;
  aggregateRoot.inequality += r.deathsByRoot.inequality;
  aggregateRoot.demographic += r.deathsByRoot.demographic;
  aggregateRoot.social += r.deathsByRoot.social;
  aggregateRoot.alignment += r.deathsByRoot.alignment;
  aggregateRoot.disruption += r.deathsByRoot.disruption;
  aggregateRoot.conflict += r.deathsByRoot.conflict;
  aggregateRoot.pandemic += r.deathsByRoot.pandemic;
  aggregateRoot.natural += r.deathsByRoot.natural || 0;  // FIX (Oct 30, 2025): BUG #3 - aggregate natural deaths
  aggregateRoot.compound += r.deathsByRoot.compound;
  aggregateRoot.HIGH += r.deathsByRoot.confidenceDistribution.HIGH;
  aggregateRoot.MEDIUM += r.deathsByRoot.confidenceDistribution.MEDIUM;
  aggregateRoot.LOW += r.deathsByRoot.confidenceDistribution.LOW;
});

// Calculate totals
const totalProximateDeaths = Object.values(aggregateProximate).reduce((sum, v) => sum + v, 0);
// FIX (Oct 30, 2025): Don't include 'compound' or 'confidenceDistribution' in root total
// 'compound' is NOT a separate root cause - it's a marker that multiple causes contributed
// Including it double-counts all multi-factor deaths (hence 2.4× inflation)
const totalRootDeaths =
  aggregateRoot.climate +
  aggregateRoot.resource +
  aggregateRoot.pollution +
  aggregateRoot.ecosystem +
  aggregateRoot.inequality +
  aggregateRoot.demographic +
  aggregateRoot.social +
  aggregateRoot.alignment +
  aggregateRoot.disruption +
  aggregateRoot.conflict +
  aggregateRoot.pandemic +
  aggregateRoot.natural;  // FIX (Oct 30, 2025): BUG #3 - include natural in total (now 12 root causes)
  // NOTE: Explicitly NOT including:
  // - aggregateRoot.compound (would double-count multi-factor deaths)
  // - aggregateRoot.HIGH/MEDIUM/LOW (confidence distribution, not a cause)

// FIX (Oct 29, 2025): BUG #1 - Death attribution mismatch
// Both deathsByCategory and deathsByRootCause are now in MILLIONS (not billions)
// Remove the * 1000 conversions
// Helper to format death statistics with NaN protection
const formatDeathStat = (deaths: number, total: number): string => {
  if (isNaN(deaths) || isNaN(total) || total === 0) return '0M (0.0%)';
  const millions = deaths.toFixed(0); // Already in millions
  const percent = ((deaths / total) * 100);
  if (isNaN(percent) || !isFinite(percent)) return `${millions}M (0.0%)`;
  return `${millions}M (${percent.toFixed(1)}%)`;
};

log(`\n  AGGREGATE ACROSS ${NUM_RUNS} RUNS:`);
log(`    Total Crisis Deaths: ${totalProximateDeaths.toFixed(0)}M (excluding natural deaths)`);
log(`    Average per Run: ${(totalProximateDeaths / NUM_RUNS).toFixed(0)}M`);

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
log(`    Environmental Drivers:`);
log(`      Climate:       ${formatDeathStat(aggregateRoot.climate, totalRootDeaths)}`);
log(`      Resource:      ${formatDeathStat(aggregateRoot.resource, totalRootDeaths)}`);
log(`      Pollution:     ${formatDeathStat(aggregateRoot.pollution, totalRootDeaths)}`);
log(`      Ecosystem:     ${formatDeathStat(aggregateRoot.ecosystem, totalRootDeaths)}`);
log(`    Social Drivers:`);
log(`      Inequality:    ${formatDeathStat(aggregateRoot.inequality, totalRootDeaths)}`);
log(`      Demographic:   ${formatDeathStat(aggregateRoot.demographic, totalRootDeaths)}`);
log(`      Social:        ${formatDeathStat(aggregateRoot.social, totalRootDeaths)}`);
log(`    Technology Drivers:`);
log(`      Alignment:     ${formatDeathStat(aggregateRoot.alignment, totalRootDeaths)}`);
log(`      Disruption:    ${formatDeathStat(aggregateRoot.disruption, totalRootDeaths)}`);
log(`    External Shocks:`);
log(`      Conflict:      ${formatDeathStat(aggregateRoot.conflict, totalRootDeaths)}`);
log(`      Pandemic:      ${formatDeathStat(aggregateRoot.pandemic, totalRootDeaths)}`);
log(`    Compound:        ${formatDeathStat(aggregateRoot.compound, totalRootDeaths)}`);
log(`    Confidence: HIGH ${aggregateRoot.HIGH.toFixed(0)}M | MEDIUM ${aggregateRoot.MEDIUM.toFixed(0)}M | LOW ${aggregateRoot.LOW.toFixed(0)}M`);

// Key insight: Proximate vs Root comparison
if (totalProximateDeaths > 0 && totalRootDeaths > 0) {
  const inequalityPercent = (aggregateRoot.inequality / totalRootDeaths) * 100;
  const climatePercent = (aggregateRoot.climate / totalRootDeaths) * 100;
  const demographicPercent = (aggregateRoot.demographic / totalRootDeaths) * 100;
  const environmentalPercent = ((aggregateRoot.climate + aggregateRoot.resource + aggregateRoot.pollution + aggregateRoot.ecosystem) / totalRootDeaths) * 100;
  const socialPercent = ((aggregateRoot.inequality + aggregateRoot.demographic + aggregateRoot.social) / totalRootDeaths) * 100;

  log(`\n  KEY INSIGHT: Multi-Factor Attribution`);
  if (inequalityPercent > 60) {
    log(`    ${inequalityPercent.toFixed(0)}% inequality root cause → policy/distribution failures dominate`);
    log(`    ${climatePercent.toFixed(0)}% climate creates stress, but systems amplify it into mass death`);
  } else if (environmentalPercent > 50) {
    log(`    ${environmentalPercent.toFixed(0)}% environmental root causes → ecological limits exceeded`);
    log(`    ${inequalityPercent.toFixed(0)}% inequality amplifies environmental stress into mortality`);
  } else {
    log(`    Multi-factor causation: Environmental ${environmentalPercent.toFixed(0)}%, Social ${socialPercent.toFixed(0)}%`);
    log(`    No single root cause dominates - systemic interaction`);
  }
}

// Reality check: Do percentages add up?
// FIX (Oct 29, 2025): Values already in millions, don't multiply by 1000
if (Math.abs((totalProximateDeaths - totalRootDeaths) / Math.max(totalProximateDeaths, 0.001)) > 0.01) {
  log(`\n  ⚠️  WARNING: Proximate deaths (${totalProximateDeaths.toFixed(0)}M) != Root deaths (${totalRootDeaths.toFixed(0)}M)`);
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
  const highSpreadExtinction = highSpreadRuns.filter(r => r.unifiedOutcome?.primaryOutcome === 'extinction').length;
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
log('🌊 BIFURCATION & EARLY WARNING SYSTEM (Nov 13, 2025)');
log('='.repeat(80));

const avgMaxAmplification = results.reduce((sum, r) => sum + r.maxVarianceAmplification, 0) / results.length;
const minMaxAmplification = Math.min(...results.map(r => r.maxVarianceAmplification));
const maxMaxAmplification = Math.max(...results.map(r => r.maxVarianceAmplification));
const avgDistanceToThresholds = results.reduce((sum, r) => sum + r.avgDistanceToThresholds, 0) / results.length;
const totalRegimeShifts = results.reduce((sum, r) => sum + r.regimeShiftCount, 0);
const runsWithRegimeShifts = results.filter(r => r.regimeShiftCount > 0).length;

// Regime shift system breakdown
const regimeShiftSystemCounts: Record<string, number> = {};
results.forEach(r => {
  r.regimeShiftSystems.forEach(system => {
    regimeShiftSystemCounts[system] = (regimeShiftSystemCounts[system] || 0) + 1;
  });
});

// Final regime distribution
const finalRegimeCounts: Record<string, number> = {};
results.forEach(r => {
  finalRegimeCounts[r.finalRegime] = (finalRegimeCounts[r.finalRegime] || 0) + 1;
});

log(`\n  VARIANCE AMPLIFICATION (1.0× = no amplification, 100× = max):`);
log(`    Average peak amplification: ${avgMaxAmplification.toFixed(2)}× (range: ${minMaxAmplification.toFixed(2)}× - ${maxMaxAmplification.toFixed(2)}×)`);
log(`    Average distance to thresholds: ${(avgDistanceToThresholds * 100).toFixed(1)}% (0% = at threshold, 100% = far from all thresholds)`);

log(`\n  REGIME SHIFTS:`);
log(`    Total regime shifts: ${totalRegimeShifts} across ${NUM_RUNS} runs`);
log(`    Runs with regime shifts: ${runsWithRegimeShifts} (${(runsWithRegimeShifts/NUM_RUNS*100).toFixed(1)}%)`);
log(`    Average shifts per run: ${(totalRegimeShifts/NUM_RUNS).toFixed(2)}`);

log(`\n  REGIME SHIFT TRIGGERS (which system crossed threshold):`);
Object.entries(regimeShiftSystemCounts)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 10)
  .forEach(([system, count]) => {
    log(`    ${system}: ${count} shifts (${(count/totalRegimeShifts*100).toFixed(1)}%)`);
  });

log(`\n  FINAL REGIME DISTRIBUTION:`);
Object.entries(finalRegimeCounts)
  .sort(([, a], [, b]) => b - a)
  .forEach(([regime, count]) => {
    log(`    ${regime}: ${count} runs (${(count/NUM_RUNS*100).toFixed(1)}%)`);
  });

// Validation check: If max amplification < 2.0 across all runs, system may not be working
if (maxMaxAmplification < 2.0) {
  log(`\n  🚨 WARNING: Max amplification = ${maxMaxAmplification.toFixed(2)}× (expected range: 2× - 100×)`);
  log(`      Bifurcation system may not be engaging properly. Check threshold proximity calculation.`);
} else if (avgMaxAmplification < 1.5) {
  log(`\n  ⚠️  WARNING: Average peak amplification = ${avgMaxAmplification.toFixed(2)}× (expected >2× for near-threshold runs)`);
  log(`      Simulation may not be approaching bifurcation thresholds often enough.`);
} else {
  log(`\n  ✅ Bifurcation system active: Peak amplification in expected range (${minMaxAmplification.toFixed(2)}× - ${maxMaxAmplification.toFixed(2)}×)`);
}

// ============================================================================
log('\n\n' + '='.repeat(80));
log('💡 SUMMARY & INSIGHTS');
log('='.repeat(80));

log(`\n  KEY FINDINGS:`);

// Calculate counts from unified outcomes
const extinctionCount = resultsWithUnified.filter(r => r.unifiedOutcome?.primaryOutcome === 'extinction').length;
const utopiaCount = resultsWithUnified.filter(r => r.unifiedOutcome?.primaryOutcome === 'utopia').length;

if (extinctionCount > NUM_RUNS * 0.3) {
  log(`\n  🔴 HIGH EXTINCTION RATE (${(extinctionCount/NUM_RUNS*100).toFixed(1)}%)`);
  log(`     - AI alignment is a critical challenge`);
  log(`     - Sleepers and catastrophic actions are effective`);
  log(`     - Government often fails to maintain control`);
} else if (utopiaCount > NUM_RUNS * 0.5) {
  log(`\n  🟢 HIGH UTOPIA RATE (${(utopiaCount/NUM_RUNS*100).toFixed(1)}%)`);
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

// Phase 4: Export threshold configuration if requested
if (exportConfigPath && !importedConfig) {
  try {
    // Sample thresholds once for export (using first run's seed for reproducibility)
    const exportEngine = new SimulationEngine({ seed: SEED_START, maxMonths: 1, logLevel: 'silent' });
    const seededExportRng = exportEngine.getRNG();
    const exportRng = seededExportRng.next.bind(seededExportRng);
    const exportedThresholds = sampleAllThresholds(exportRng, {
      scenario: THRESHOLD_SCENARIO,
      sliders: sliderOverrides,
      nested: nestedMonteCarlo
    });

    const config = createThresholdConfig(
      exportedThresholds,
      {
        description: `Monte Carlo run: ${NUM_RUNS} runs, ${MAX_MONTHS} months, scenario=${THRESHOLD_SCENARIO}`,
        scenario: THRESHOLD_SCENARIO,
        sliders: Object.keys(sliderOverrides).length > 0 ? sliderOverrides : undefined,
        seed: SEED_START
      },
      `Generated from Monte Carlo simulation run at ${new Date().toISOString()}`
    );

    const savedPath = exportThresholdConfig(config, exportConfigPath);
    log(`\n💾 Threshold configuration exported to: ${savedPath}`);
    printThresholdConfig(config);
  } catch (err) {
    logError(`\n❌ Failed to export threshold config: ${err}`);
  }
}

    log(`\n✅ Monte Carlo analysis complete!`);
    log(`   ${NUM_RUNS} runs, ${MAX_MONTHS} months each`);
    log(`   Total simulation time: ${totalTime.toFixed(1)}s\n`);

    // Log file is complete (sync writes, no need to close stream)
    console.log(`\n💾 Full output saved to: ${outputFile}`);
  }); // End async IIFE .then()
} // End else block (non-nested mode)
