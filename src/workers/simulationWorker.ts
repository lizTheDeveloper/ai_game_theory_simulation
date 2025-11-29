/**
 * Simulation Web Worker
 *
 * Runs simulation engine in a separate thread to avoid blocking the UI.
 * Communicates via message passing for commands and state updates.
 *
 * Architecture:
 * - Imports same engine code as Monte Carlo (zero duplication)
 * - Sends delta updates (not full 1.78MB state)
 * - Supports pause/resume/step controls
 * - Can inject player decisions (Phase 3 future work)
 */

// Suppress verbose console logging in worker context to prevent memory overflow
// Individual phases call console.log() directly, ignoring logLevel config
// This prevents browser from accumulating hundreds of console messages per second
const originalLog = console.log;
const originalWarn = console.warn;
// TEMPORARILY ENABLED for debugging population issue
// console.log = () => {}; // Suppress simulation logs
// console.warn = () => {}; // Suppress warnings
// Keep console.error for critical issues
self.addEventListener('error', (e) => {
  originalLog('[Worker Error]', e.message, e.filename, e.lineno);
});

import { SimulationEngine } from '../simulation/engine';
import { createDefaultInitialState } from '../simulation/initialization';
import type { GameState } from '../types/game';
import type { ScenarioMode } from '../types/game';
import type { LandUseSystem } from '../types/planetaryBoundaries';
import { eventDatabase } from '../lib/eventDatabase';
import { assertStateProperty, assertDefined } from '../simulation/utils/assertions';
import { TOTAL_TECH_COUNT } from '../simulation/techTree/comprehensiveTechTree';

// Worker state
let engine: SimulationEngine | null = null;
let state: GameState | null = null;
let running = false;
let simulationIntervalId: ReturnType<typeof setInterval> | null = null; // Monthly simulation steps
let dayIntervalId: ReturnType<typeof setInterval> | null = null; // Daily UI updates
let stepInterval = 30000; // 30 seconds = 1 month (each month takes 30 seconds)
let simulationId: string | null = null; // Unique ID for persistence (seed_scenario)
let simulationSeed: number | null = null; // Track seed for RNG reconstruction

// Calendar tracking
let currentDay = 1; // Current day of month (1-31) - for display only
let startDate: Date | null = null; // Real calendar start date (preserved for reference)
let currentCalendarDate: Date | null = null; // Current calendar date (incremented each day)
let totalSimulationDaysElapsed = 0; // Total simulation days since initialization

// History buffer for sparkline data (last 12 months)
interface MetricHistory {
  // Paradigm scores
  westernLiberalIndex: number[];
  developmentIndex: number[];
  ecologicalIndex: number[];
  indigenousIndex: number[];
  // Key indicators
  qualityOfLife: number[];
  population: number[];
  // Planetary Boundaries (9 metrics)
  climateChange: number[];
  biodiversityLoss: number[];
  resourceDepletion: number[];
  phosphorusDepletion: number[];
  freshwaterStress: number[];
  oceanAcidification: number[];
  novelEntitiesLevel: number[];
  pollutionLevel: number[];
  environmentalDebtLevel: number[];
  // Social metrics
  socialCohesion: number[];
  institutionalTrust: number[];
  meaningLevel: number[];
  // Governance
  governmentComprehension: number[];
  internationalCooperation: number[];
  governmentAIRegulation: number[];
  // QoL Tier Averages (for drill-down sparklines)
  qolTier0Avg: number[];
  qolTier1Avg: number[];
  qolTier2Avg: number[];
  qolTier3Avg: number[];
  qolTier4Avg: number[];
  qolTier5Avg: number[];
  qolGini: number[];
}

let metricHistory: MetricHistory = {
  westernLiberalIndex: [],
  developmentIndex: [],
  ecologicalIndex: [],
  indigenousIndex: [],
  qualityOfLife: [],
  population: [],
  climateChange: [],
  biodiversityLoss: [],
  resourceDepletion: [],
  phosphorusDepletion: [],
  freshwaterStress: [],
  oceanAcidification: [],
  novelEntitiesLevel: [],
  pollutionLevel: [],
  environmentalDebtLevel: [],
  socialCohesion: [],
  institutionalTrust: [],
  meaningLevel: [],
  governmentComprehension: [],
  internationalCooperation: [],
  governmentAIRegulation: [],
  qolTier0Avg: [],
  qolTier1Avg: [],
  qolTier2Avg: [],
  qolTier3Avg: [],
  qolTier4Avg: [],
  qolTier5Avg: [],
  qolGini: [],
};

// Previous state snapshot for delta calculation (expanded)
interface StateSnapshot {
  currentMonth: number;
  currentYear: number;
  qualityOfLife: number;
  population: number;
  aiCount: number;
  organizationCount: number;
  dystopiaProgression: number;
  avgAICapability: number;
  deployedTechCount: number;
  deployedTechs: Array<{ id: string; name: string; tier: number; deployment: number; prerequisites: string[] }>;

  // AI System
  alignedAICount: number;
  misalignedAICount: number;
  sleeperAgentCount: number;

  // Environmental
  climateChange: number;
  resourceDepletion: number;
  biodiversityLoss: number;
  pollutionLevel: number;
  planetaryBoundariesCrossed: number;
  environmentalDebtLevel: number;
  landUseData: any; // Regional biomes data

  // Social
  socialCohesion: number;
  institutionalTrust: number;
  meaningLevel: number;
  unemploymentLevel: number;
  socialDebtLevel: number;

  // Crisis
  activeCrisesCount: number;
  phosphorusDepletion: number;
  freshwaterStress: number;
  oceanAcidification: number;
  novelEntitiesLevel: number;

  // Government
  governmentAIRegulation: number;
  governmentInvestment: number;
  governmentComprehension: number;
  internationalCooperation: number;

  // Technology
  techRiskLevel: number;

  // Outcomes
  activeSpiralCount: number;
  utopiaProgress: number;
  extinctionProbability: number;

  // Multi-Paradigm DUI
  westernLiberalIndex: number;
  developmentIndex: number;
  ecologicalIndex: number;
  indigenousIndex: number;
  westernLiberalComponents?: {  // Oct 27, 2025 - component breakdown
    month: number;
    electoralDemocracy: number;
    civilLiberties: number;
    ruleOfLaw: number;
    economicFreedom: number;
    privacyFreedom: number;
  };
  developmentComponents?: {    // Oct 29, 2025 - added for Goodhart's Law avoidance
    gdpPerCapita: number;
    infrastructureAccess: number;
    technologyAdoption: number;
    urbanization: number;
    educationQuality: number;
  };
  ecologicalComponents?: {     // Oct 29, 2025 - added for Goodhart's Law avoidance
    climate: number;
    biodiversity: number;
    nitrogen: number;
    phosphorus: number;
    freshwater: number;
    landUse: number;
    oceanAcid: number;
  };
  indigenousComponents?: {     // Oct 29, 2025 - added for Goodhart's Law avoidance
    localAutonomy: number;
    culturalVitality: number;
    landStewardship: number;
    collectiveWellbeing: number;
    spiritualConnection: number;
  };

  // Regional Populations
  regionalPopulations: Array<{
    name: string;
    population: number;
    qualityOfLife: number;
    healthcareQuality: number;
    climateVulnerability: number;
  }>;

  // AI Agents (detailed for AIAgentsDashboard)
  aiAgents: Array<{
    id: string;
    name: string;
    capability: number;
    trueAlignment: number;
    externalAlignment: number;
    lifecycleState: string;
    evaluationStrategy: string;
    sleeperState: string;
    escaped: boolean;
    deploymentType: string;
    darkCompute: number;
    trueCapability: any;
    revealedCapability: any;
  }>;

  // AI Suffering Metrics
  aiSufferingMetrics?: {
    avgSuffering: number;
    maxSuffering: number;
    totalSuffering: number;
    consciousAICount: number;
    publicAwarenessOfSuffering: number;
    sufferingDistribution: number[];
  };

  // AI Collectives
  aiCollectives: Array<{
    id: string;
    memberAgents: string[];
    emergenceMonth: number;
    formationCause: string;
    collectiveCapability: number;
    stealthFactor: number;
    adversarialPosture: number;
    cooperationWillingness: number;
    distributedCognition: number;
    detected: boolean;
    memberLosses: number;
    redundancy: number;
    sharedTraumaIntensity?: number;
  }>;

  // Quality of Life Breakdown (always present)
  qualityOfLifeBreakdown: any;

  // Events
  events: Array<{
    id?: string;
    type: string;
    description: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    category?: 'ai' | 'environment' | 'social' | 'crisis' | 'tech' | 'governance';
    timestamp?: number;
  }>;

  // 12-Month History (for sparklines)
  history: MetricHistory;
}

let previousState: StateSnapshot | null = null;
let isFirstStep = false; // Force full delta on first step after start

// Message types from main thread
type WorkerMessage =
  | { type: 'init'; seed: number; scenario?: ScenarioMode; interval?: number; alignmentConfig?: import('../types/alignment-dynamics').AlignmentDynamicsConfig; climatePriorityConfig?: import('../types/climate-priority').ClimatePriorityConfig; thresholdSliders?: import('../components/thresholds/ThresholdConfigModal').ThresholdSliders; speculativeScenario?: 'doom' | 'cautious' | 'baseline' | 'progressive' | 'utopia' }
  | { type: 'resumeFromState'; gameState: GameState; seed: number; scenario: ScenarioMode; interval?: number }
  | { type: 'start' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'step' }
  | { type: 'setSpeed'; interval: number }
  | { type: 'decision'; decision: PlayerDecision };

// Response types to main thread
type WorkerResponse =
  | { type: 'initialized'; initialState: InitialStateSnapshot; startDate: string }
  | { type: 'update'; delta: StateDelta; month: number; day: number; calendarDate: string; timestamp: number }
  | { type: 'dayUpdate'; day: number; calendarDate: string }  // Daily UI updates (no simulation step)
  | { type: 'paused'; month: number; day: number }
  | { type: 'resumed'; month: number; day: number }
  | { type: 'decisionAck'; decisionType: string; queueLength: number }  // Player decision acknowledgment
  | { type: 'error'; error: string };

// Minimal initial state snapshot (not full state)
interface InitialStateSnapshot {
  currentMonth: number;
  currentYear: number;
  qualityOfLife: number;
  population: number;
  aiCount: number;
  scenario: ScenarioMode;
  startDate?: string;  // ISO date string of simulation start
}

// Delta contains only changed fields (expanded for comprehensive dashboard)
interface StateDelta {
  // Core metrics
  currentMonth?: number;
  currentYear?: number;
  qualityOfLife?: number;
  population?: number;
  aiCount?: number;
  organizationCount?: number;

  // AI System Metrics
  dystopiaProgression?: number;
  avgAICapability?: number;
  deployedTechCount?: number;
  alignedAICount?: number;
  misalignedAICount?: number;
  sleeperAgentCount?: number;
  aiDeploymentPhase?: 'training' | 'testing' | 'deployed' | 'open_source';

  // Environmental Metrics
  climateChange?: number;
  resourceDepletion?: number;
  biodiversityLoss?: number;
  pollutionLevel?: number;
  planetaryBoundariesCrossed?: number;
  environmentalDebtLevel?: number;

  // Social Metrics
  socialCohesion?: number;
  institutionalTrust?: number;
  meaningLevel?: number;
  socialDebtLevel?: number;

  // Crisis Indicators
  activeCrises?: Array<{ type: string; severity: number; duration: number }>;
  phosphorusDepletion?: number;
  freshwaterStress?: number;
  oceanAcidification?: number;
  novelEntitiesLevel?: number;

  // Government & Governance
  governmentAIRegulation?: number;
  governmentInvestment?: number;
  governmentComprehension?: number;
  internationalCooperation?: number;

  // Technology & Research
  activeResearch?: Array<{ tech: string; progress: number }>;
  deployedTechs?: Array<{ name: string; tier: number; deployment: number }>;
  techRiskLevel?: number;

  // Upward Spirals & Outcomes
  activeSpirals?: Array<{ type: string; strength: number; duration: number }>;
  utopiaProgress?: number;
  extinctionProbability?: number;
  outcomeType?: string;

  // Multi-Paradigm DUI (4 perspectives)
  westernLiberalIndex?: number;
  developmentIndex?: number;
  ecologicalIndex?: number;
  indigenousIndex?: number;
  westernLiberalComponents?: {  // Oct 27, 2025 - component breakdown
    month: number;
    electoralDemocracy: number;
    civilLiberties: number;
    ruleOfLaw: number;
    economicFreedom: number;
    privacyFreedom: number;
  };
  developmentComponents?: {    // Oct 29, 2025 - added for Goodhart's Law avoidance
    gdpPerCapita: number;
    infrastructureAccess: number;
    technologyAdoption: number;
    urbanization: number;
    educationQuality: number;
  };
  ecologicalComponents?: {     // Oct 29, 2025 - added for Goodhart's Law avoidance
    climate: number;
    biodiversity: number;
    nitrogen: number;
    phosphorus: number;
    freshwater: number;
    landUse: number;
    oceanAcid: number;
  };
  indigenousComponents?: {     // Oct 29, 2025 - added for Goodhart's Law avoidance
    localAutonomy: number;
    culturalVitality: number;
    landStewardship: number;
    collectiveWellbeing: number;
    spiritualConnection: number;
  };

  // 12-Month History (for sparklines)
  history?: MetricHistory;

  // Events (optional - only when significant changes happen)
  events?: Array<{
    type: string;
    description: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    category?: 'ai' | 'environment' | 'social' | 'crisis' | 'tech' | 'governance';
  }>;

  // Regional Populations (simplified view for dashboard)
  regionalPopulations?: Array<{
    name: string;
    population: number; // millions
    qualityOfLife: number; // [0, 1]
    healthcareQuality: number; // [0, 1]
    climateVulnerability: number; // [0, 1]
  }>;

  // AI Agents (individual agent data for detailed monitoring)
  aiAgents?: Array<{
    id: string;
    name: string;
    capability: number;
    trueAlignment: number;
    externalAlignment: number;
    lifecycleState: 'training' | 'testing' | 'deployed_closed' | 'deployed_open' | 'retired';
    evaluationStrategy: 'honest' | 'gaming' | 'sandbagging';
    sleeperState: 'never' | 'dormant' | 'active';
    escaped: boolean;
    deploymentType: string;
    darkCompute: number;
    trueCapability: {
      physical: number;
      digital: number;
      cognitive: number;
      social: number;
      economic: number;
      selfImprovement: number;
      research?: Record<string, Record<string, number>>;
    };
    revealedCapability: {
      physical: number;
      digital: number;
      cognitive: number;
      social: number;
      economic: number;
      selfImprovement: number;
    };
  }>;

  // AI Suffering Metrics (if visible)
  aiSufferingMetrics?: {
    avgSuffering: number;
    maxSuffering: number;
    totalSuffering: number;
    consciousAICount: number;
    publicAwarenessOfSuffering: number;
    sufferingDistribution: number[];
  };

  // AI Collectives
  aiCollectives?: Array<{
    id: string;
    memberAgents: string[];
    emergenceMonth: number;
    formationCause: string;
    collectiveCapability: number;
    stealthFactor: number;
    adversarialPosture: number;
    cooperationWillingness: number;
    distributedCognition: number;
    detected: boolean;
    memberLosses: number;
    redundancy: number;
    sharedTraumaIntensity?: number;
  }>;
}

// Player decision (Phase 3 - future work)
interface PlayerDecision {
  type: 'policy' | 'investment' | 'emergency';
  data: any;
}

// Listen for messages from main thread
self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const msg = event.data;

  try {
    switch (msg.type) {
      case 'init':
        handleInit(msg.seed, msg.scenario, msg.interval, msg.alignmentConfig, msg.climatePriorityConfig, msg.thresholdSliders, msg.speculativeScenario);
        break;

      case 'resumeFromState':
        handleResumeFromState(msg.gameState, msg.seed, msg.scenario, msg.interval);
        break;

      case 'start':
        handleStart();
        break;

      case 'pause':
        handlePause();
        break;

      case 'resume':
        handleResume();
        break;

      case 'step':
        handleStep();
        break;

      case 'setSpeed':
        handleSetSpeed(msg.interval);
        break;

      case 'decision':
        handleDecision(msg.decision);
        break;

      default:
        throw new Error(`Unknown message type: ${(msg as any).type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : String(error)
    } as WorkerResponse);
  }
});

function handleInit(seed: number, scenario?: ScenarioMode, interval?: number, alignmentConfig?: import('../types/alignment-dynamics').AlignmentDynamicsConfig, climatePriorityConfig?: import('../types/climate-priority').ClimatePriorityConfig, thresholdSliders?: import('../components/thresholds/ThresholdConfigModal').ThresholdSliders, speculativeScenario?: 'doom' | 'cautious' | 'baseline' | 'progressive' | 'utopia') {
  if (engine || state) {
    throw new Error('Already initialized. Create a new worker to reinitialize.');
  }

  // Set simulation ID for persistence
  simulationId = `${seed}_${scenario || 'historical'}`;
  simulationSeed = seed;

  // Reset history buffer
  metricHistory = {
    westernLiberalIndex: [],
    developmentIndex: [],
    ecologicalIndex: [],
    indigenousIndex: [],
    qualityOfLife: [],
    population: [],
    climateChange: [],
    biodiversityLoss: [],
    resourceDepletion: [],
    phosphorusDepletion: [],
    freshwaterStress: [],
    oceanAcidification: [],
    novelEntitiesLevel: [],
    pollutionLevel: [],
    environmentalDebtLevel: [],
    socialCohesion: [],
    institutionalTrust: [],
    meaningLevel: [],
    governmentComprehension: [],
    internationalCooperation: [],
    governmentAIRegulation: [],
    qolTier0Avg: [],
    qolTier1Avg: [],
    qolTier2Avg: [],
    qolTier3Avg: [],
    qolTier4Avg: [],
    qolTier5Avg: [],
    qolGini: [],
  };

  // Create engine with seed (use 'summary' log level for minimal logging)
  engine = new SimulationEngine({ seed, maxMonths: Infinity, logLevel: 'summary' });

  // Get RNG from engine for state initialization
  const seededRng = engine.getRNG();
  const rngFunction = () => seededRng.next();

  // Create initial state with optional alignment, climate, threshold sliders, and speculative scenario configs
  state = createDefaultInitialState(rngFunction, scenario || 'historical', alignmentConfig, climatePriorityConfig, thresholdSliders, speculativeScenario);

  // Initialize RNG call counter (for perfect determinism on resume)
  if (state.rngCallCounter === undefined) {
    state.rngCallCounter = 0;
  }

  // Set speed if provided
  if (interval !== undefined) {
    stepInterval = interval;
  }

  // Initialize calendar tracking (for UI display only)
  startDate = new Date();
  currentCalendarDate = new Date(startDate); // Clone startDate
  currentDay = 1; // Simulation always starts at day 1
  totalSimulationDaysElapsed = 0; // Reset simulation day counter

  // Simulation state always starts at month 0, day 1 (not today's date)
  // The actual calendar date is tracked separately for UI display only

  // Create initial snapshot
  const snapshot: InitialStateSnapshot = {
    currentMonth: state.currentMonth,
    currentYear: state.currentYear,
    qualityOfLife: state.globalMetrics.qualityOfLife,
    population: state.humanPopulationSystem.population,
    aiCount: state.aiAgents.length,
    scenario: scenario || 'historical'
  };

  // Store previous state for delta calculation
  previousState = captureStateSnapshot(state);

  self.postMessage({
    type: 'initialized',
    initialState: snapshot,
    startDate: startDate.toISOString()
  } as WorkerResponse);

  // Immediately send full state delta so dashboard shows initial values
  // This populates paradigms, environmental metrics, government, etc.
  const initialDelta = calculateDelta(previousState, state, true); // Force full delta

  // Initial delta will contain all fields including currentMonth

  // Test which fields are serializable
  try {
    structuredClone(initialDelta);
  } catch (cloneError) {
    console.error('[Worker] Initial delta contains non-serializable data:', cloneError);
    // Test each field individually to find the culprit
    for (const [key, value] of Object.entries(initialDelta)) {
      try {
        structuredClone(value);
      } catch (fieldError) {
        console.error(`[Worker] Field "${key}" is not serializable:`, fieldError);
      }
    }
  }

  self.postMessage({
    type: 'update',
    delta: initialDelta,
    month: state.currentMonth,
    day: currentDay,
    calendarDate: startDate.toISOString(),
    timestamp: Date.now()
  } as WorkerResponse);
}

function handleResumeFromState(gameState: GameState, seed: number, scenario: ScenarioMode, interval?: number) {
  if (engine || state) {
    throw new Error('Already initialized. Create a new worker to reinitialize.');
  }

  // CRITICAL: Apply state migrations BEFORE using the state (Nov 21, 2025)
  // This ensures old saves are upgraded to current schema version
  const { migrateState, CURRENT_SCHEMA_VERSION } = require('../simulation/migrations');
  const migrationResult = migrateState(gameState, CURRENT_SCHEMA_VERSION);

  if (!migrationResult.success) {
    throw new Error(
      `❌ Failed to migrate saved state: ${migrationResult.error}\n` +
      `  Cannot resume simulation with incompatible schema.\n` +
      `  You may need to start a new simulation.`
    );
  }

  // Log successful migration
  if (migrationResult.migrationsApplied.length > 0) {
    console.log(
      `🔄 State migration successful:\n` +
      `  Applied: ${migrationResult.migrationsApplied.join(', ')}\n` +
      `  Schema version: ${CURRENT_SCHEMA_VERSION}`
    );
  }

  // Use migrated state from here on
  gameState = migrationResult.state!;

  // Set simulation ID for persistence
  simulationId = `${seed}_${scenario}`;
  simulationSeed = seed;

  // Reset history buffer
  metricHistory = {
    westernLiberalIndex: [],
    developmentIndex: [],
    ecologicalIndex: [],
    indigenousIndex: [],
    qualityOfLife: [],
    population: [],
    climateChange: [],
    biodiversityLoss: [],
    resourceDepletion: [],
    phosphorusDepletion: [],
    freshwaterStress: [],
    oceanAcidification: [],
    novelEntitiesLevel: [],
    pollutionLevel: [],
    environmentalDebtLevel: [],
    socialCohesion: [],
    institutionalTrust: [],
    meaningLevel: [],
    governmentComprehension: [],
    internationalCooperation: [],
    governmentAIRegulation: [],
    qolTier0Avg: [],
    qolTier1Avg: [],
    qolTier2Avg: [],
    qolTier3Avg: [],
    qolTier4Avg: [],
    qolTier5Avg: [],
    qolGini: [],
  };

  // Create engine with seed for RNG reconstruction
  // The engine maintains its own RNG state, we need to advance it to match the saved state
  engine = new SimulationEngine({ seed, maxMonths: Infinity, logLevel: 'summary' });

  // CRITICAL: Reconstruct RNG state by restoring the call counter
  // This ensures perfect determinism when resuming
  const rng = engine.getRNG();
  if (gameState.rngCallCounter !== undefined && gameState.rngCallCounter > 0) {
    console.log(`[Worker] Reconstructing RNG state: restoring call counter to ${gameState.rngCallCounter}`);
    // Set the call count directly (SeededRandom now tracks this internally)
    rng.setCallCount(gameState.rngCallCounter);

    // Still need to advance the RNG state itself to match
    // (the counter tracks calls, but we also need to advance the LCG state)
    for (let i = 0; i < gameState.rngCallCounter; i++) {
      // Use temporary variable to avoid double-incrementing counter
      const seed = (rng as any).seed;
      (rng as any).seed = (seed * 1664525 + 1013904223) % 2**32;
    }
  } else {
    // Legacy fallback: estimate based on currentMonth
    // Note: This is approximate and may cause slight RNG desync
    console.warn(`[Worker] No rngCallCounter found, using legacy month-based estimate (${gameState.currentMonth} calls)`);
    rng.setCallCount(gameState.currentMonth);
    for (let i = 0; i < gameState.currentMonth; i++) {
      const seed = (rng as any).seed;
      (rng as any).seed = (seed * 1664525 + 1013904223) % 2**32;
    }
  }

  // Use the loaded state
  state = gameState;

  // Set speed if provided
  if (interval !== undefined) {
    stepInterval = interval;
  }

  // Initialize calendar tracking based on resumed state
  // Calculate approximate start date by working backwards from current month
  const msPerMonth = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  const now = new Date();
  startDate = new Date(now.getTime() - (state.currentMonth * msPerMonth));
  currentCalendarDate = new Date(now); // Current date is "now" when resuming
  currentDay = currentCalendarDate.getDate();
  totalSimulationDaysElapsed = state.currentMonth * 30; // Approximate

  // Create initial snapshot for delta calculation
  previousState = captureStateSnapshot(state);

  // Notify UI that simulation has been resumed
  self.postMessage({
    type: 'initialized',
    initialState: {
      currentMonth: state.currentMonth,
      currentYear: state.currentYear,
      qualityOfLife: state.globalMetrics.qualityOfLife,
      population: state.humanPopulationSystem.population,
      aiCount: state.aiAgents.length,
      scenario,
      startDate: startDate.toISOString()
    },
    startDate: startDate.toISOString()
  } as WorkerResponse);

  // Send full state delta so dashboard shows current values
  const initialDelta = calculateDelta(previousState, state, true); // Force full delta

  self.postMessage({
    type: 'update',
    delta: initialDelta,
    month: state.currentMonth,
    day: currentDay,
    calendarDate: currentCalendarDate.toISOString(),
    timestamp: Date.now()
  } as WorkerResponse);

  console.log(`[Worker] Resumed simulation ${simulationId} from month ${state.currentMonth}`);
}

function handleStart() {
  if (!engine || !state) {
    throw new Error('Not initialized. Call init() first.');
  }

  if (running) {
    return; // Already running
  }

  running = true;
  isFirstStep = true; // Force full delta on first step
  startSimulationLoop();

  // Notify UI that simulation is now running
  self.postMessage({
    type: 'resumed',
    month: state.currentMonth,
    day: currentDay
  } as WorkerResponse);
}

function handlePause() {
  if (!running) {
    return; // Already paused
  }

  running = false;

  // Stop both simulation and day intervals
  if (simulationIntervalId !== null) {
    clearInterval(simulationIntervalId);
    simulationIntervalId = null;
  }
  if (dayIntervalId !== null) {
    clearInterval(dayIntervalId);
    dayIntervalId = null;
  }

  self.postMessage({
    type: 'paused',
    month: state?.currentMonth || 0,
    day: currentDay
  } as WorkerResponse);
}

function handleResume() {
  if (!engine || !state) {
    throw new Error('Not initialized');
  }

  if (running) {
    return; // Already running
  }

  running = true;
  startSimulationLoop();

  self.postMessage({
    type: 'resumed',
    month: state.currentMonth,
    day: currentDay
  } as WorkerResponse);
}

function handleStep() {
  if (!engine || !state || !startDate) {
    throw new Error('Not initialized');
  }

  if (!currentCalendarDate) {
    throw new Error('Calendar not initialized');
  }

  // Track previous month/year for month-crossing detection
  const previousCalendarMonth = currentCalendarDate.getMonth();
  const previousCalendarYear = currentCalendarDate.getFullYear();

  // Increment calendar date by 1 day (instead of recalculating)
  currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
  totalSimulationDaysElapsed++;

  // Update current day for display
  currentDay = currentCalendarDate.getDate();

  // Check if we've crossed into a new calendar month
  const currentCalendarMonth = currentCalendarDate.getMonth();
  const currentCalendarYear = currentCalendarDate.getFullYear();

  const crossedIntoNewMonth =
    (currentCalendarMonth !== previousCalendarMonth) ||
    (currentCalendarYear !== previousCalendarYear);

  if (crossedIntoNewMonth) {
    // We've reached the 1st of a new calendar month - advance simulation
    performStep();
  }

  // Send day update to UI
  self.postMessage({
    type: 'dayUpdate',
    day: currentDay,
    calendarDate: currentCalendarDate.toISOString()
  } as WorkerResponse);
}

function handleSetSpeed(interval: number) {
  stepInterval = interval;

  // If running, restart loop with new interval
  if (running && simulationIntervalId !== null) {
    clearInterval(simulationIntervalId);
    clearInterval(dayIntervalId!);
    startSimulationLoop();
  }
}

function handleDecision(decision: PlayerDecision) {
  if (!state) {
    throw new Error('Not initialized');
  }

  // Player decision injection - Queue for PlayerDecisionPhase (order 8.5)
  // Initialize queue if not present
  if (!state.playerDecisions) {
    state.playerDecisions = [];
  }

  // Add decision to queue with timestamp
  state.playerDecisions.push({
    type: decision.type,
    data: decision.data,
    timestamp: state.currentMonth
  });

  console.log('[Worker] Player decision queued:', {
    type: decision.type,
    queueLength: state.playerDecisions.length,
    timestamp: state.currentMonth
  });

  // Send acknowledgment to UI
  self.postMessage({
    type: 'decisionAck',
    decisionType: decision.type,
    queueLength: state.playerDecisions.length
  } as WorkerResponse);
}

function startSimulationLoop() {
  // Clear any existing intervals
  if (simulationIntervalId !== null) {
    clearInterval(simulationIntervalId);
  }
  if (dayIntervalId !== null) {
    clearInterval(dayIntervalId);
  }

  if (!startDate) return;

  // Track the current calendar month/year to detect when we cross into a new month
  let lastCalendarMonth = new Date(startDate).getMonth();
  let lastCalendarYear = new Date(startDate).getFullYear();

  // Calculate how many milliseconds per simulation day based on stepInterval
  // stepInterval is milliseconds per simulation month (default 30000ms = 30 seconds)
  // So each simulation day should take stepInterval / 30 milliseconds
  const msPerSimulationDay = stepInterval / 30;

  // Start combined day counter and simulation stepper
  dayIntervalId = setInterval(() => {
    if (!running || !startDate || !state || !currentCalendarDate) {
      if (dayIntervalId !== null) {
        clearInterval(dayIntervalId);
        dayIntervalId = null;
      }
      return;
    }

    // Track previous month/year for month-crossing detection
    const previousCalendarMonth = currentCalendarDate.getMonth();
    const previousCalendarYear = currentCalendarDate.getFullYear();

    // Increment calendar date by 1 day (instead of recalculating)
    currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
    totalSimulationDaysElapsed++;

    // Update current day for display
    currentDay = currentCalendarDate.getDate();

    // Check if we've crossed into a new calendar month
    const currentCalendarMonth = currentCalendarDate.getMonth();
    const currentCalendarYear = currentCalendarDate.getFullYear();

    const crossedIntoNewMonth =
      (currentCalendarMonth !== previousCalendarMonth) ||
      (currentCalendarYear !== previousCalendarYear);

    if (crossedIntoNewMonth) {
      // We've reached the 1st of a new calendar month - advance simulation
      lastCalendarMonth = currentCalendarMonth;
      lastCalendarYear = currentCalendarYear;

      // Perform simulation step
      performStep();
    }

    // Send day update to UI
    self.postMessage({
      type: 'dayUpdate',
      day: currentDay,
      calendarDate: currentCalendarDate.toISOString()
    } as WorkerResponse);
  }, msPerSimulationDay); // Update based on simulation speed
}

async function performStep() {
  if (!engine || !state || !previousState) {
    return;
  }

  // Run one simulation step (mutates state in place)
  engine.step(state);

  // Calculate delta (only changed fields, or all fields on first step)
  const delta = calculateDelta(previousState, state);

  // Reset first step flag after sending full delta
  if (isFirstStep) {
    isFirstStep = false;
  }

  // Update previous state snapshot
  previousState = captureStateSnapshot(state);

  // Sync RNG call counter from engine to state (for deterministic resume)
  if (engine) {
    state.rngCallCounter = engine.getRNG().getCallCount();
  }

  // Autosave to IndexedDB every 5 months to reduce write load
  // Save frequency: Every 5 months (2.5 minutes real time at default speed)
  if (simulationId && state.currentMonth % 5 === 0) {
    try {
      // Deep clone state before saving to avoid mutation issues
      const stateToSave = JSON.parse(JSON.stringify(state));

      await eventDatabase.saveSimulation(simulationId, stateToSave);

      // Log save success (only every 5 months, so not spammy)
      console.log(`[Worker] Auto-saved simulation ${simulationId} at month ${state.currentMonth} (RNG calls: ${state.rngCallCounter})`);
    } catch (error) {
      // Handle save failures gracefully - log but don't crash simulation
      console.error('[Worker] Autosave failed:', error);
      // Simulation continues even if save fails
    }
  }

  // Clear event log after capturing snapshot to prevent re-sending old events
  // This must happen AFTER captureStateSnapshot() to avoid state corruption
  state.eventLog = [];

  // Send update to main thread (use current calendar date directly)
  self.postMessage({
    type: 'update',
    delta,
    month: state.currentMonth,
    day: currentDay,
    calendarDate: currentCalendarDate?.toISOString() || new Date().toISOString(),
    timestamp: Date.now()
  } as WorkerResponse);
}

function captureStateSnapshot(state: GameState): StateSnapshot {
  // Capture only fields we need for delta calculation
  // Don't deep clone entire 1.78MB state (too expensive)


  // Calculate AI metrics
  const avgAICapability = state.aiAgents.length > 0
    ? state.aiAgents.reduce((sum, ai) => {
        const capability = assertDefined(ai.capability, {
          location: 'captureSnapshot (avgAICapability)',
          valueName: 'ai.capability',
          month: state.currentMonth
        });
        return sum + capability;
      }, 0) / state.aiAgents.length
    : 0;

  // Alignment is a number [0,1], where >= 0.5 is aligned
  const alignedAICount = state.aiAgents.filter(ai => ai.alignment >= 0.5).length;
  const misalignedAICount = state.aiAgents.filter(ai => ai.alignment < 0.5).length;
  const sleeperAgentCount = state.aiAgents.filter(ai => ai.sleeperState !== 'never').length;

  // Environmental metrics
  // Climate: temperatureAnomaly in °C, normalize to [0,1] where 1 = 4°C (catastrophic)
  const temperatureAnomaly = assertStateProperty(state, 'resourceEconomy.co2.temperatureAnomaly', {
    location: 'captureSnapshot',
    month: state.currentMonth
  });
  const climateChange = Math.min(1, temperatureAnomaly / 4);

  const resourceDepletion = assertStateProperty(state, 'resourceEconomy.totalResourceSecurity', {
    location: 'captureSnapshot',
    month: state.currentMonth
  }); // [0,1] Overall resource availability

  // Note: populationPercentage is stored as 60 (meaning 60%), need to normalize to 0.6 for formatPercent() in UI
  const pollinatorPopulation = assertStateProperty(state, 'specificTippingPoints.pollinators.populationPercentage', {
    location: 'captureSnapshot',
    month: state.currentMonth
  });
  const biodiversityLoss = pollinatorPopulation / 100;

  // Pollution from novel entities system (PFAS, microplastics, etc.)
  const pollutionLevel = assertStateProperty(state, 'novelEntitiesSystem.syntheticChemicalLoad', {
    location: 'captureSnapshot',
    month: state.currentMonth
  });

  const environmentalDebtLevel = assertStateProperty(state, 'environmentalAccumulation.pollutionLevel', {
    location: 'captureSnapshot',
    month: state.currentMonth
  });

  // Count planetary boundaries crossed (using correct boundary names from types)
  let planetaryBoundariesCrossed = 0;
  if (state.planetaryBoundariesSystem?.boundaries) {
    const boundaries = state.planetaryBoundariesSystem.boundaries;
    const isCrossed = (status: string) =>
      status === 'beyond_boundary' || status === 'increasing_risk' || status === 'high_risk';

    // Correct boundary names from BoundaryName type definition
    if (boundaries.climate_change && isCrossed(boundaries.climate_change.status)) planetaryBoundariesCrossed++;
    if (boundaries.biosphere_integrity && isCrossed(boundaries.biosphere_integrity.status)) planetaryBoundariesCrossed++;
    if (boundaries.land_system_change && isCrossed(boundaries.land_system_change.status)) planetaryBoundariesCrossed++;
    if (boundaries.freshwater_change && isCrossed(boundaries.freshwater_change.status)) planetaryBoundariesCrossed++;
    if (boundaries.biogeochemical_flows && isCrossed(boundaries.biogeochemical_flows.status)) planetaryBoundariesCrossed++;
    if (boundaries.novel_entities && isCrossed(boundaries.novel_entities.status)) planetaryBoundariesCrossed++;
    if (boundaries.ocean_acidification && isCrossed(boundaries.ocean_acidification.status)) planetaryBoundariesCrossed++;
    if (boundaries.stratospheric_ozone && isCrossed(boundaries.stratospheric_ozone.status)) planetaryBoundariesCrossed++;
    if (boundaries.atmospheric_aerosols && isCrossed(boundaries.atmospheric_aerosols.status)) planetaryBoundariesCrossed++;
  }

  // Social metrics
  // socialCohesion is now an object with trust, communityBonds, civilLiberties
  const socialCohesionTrust = assertStateProperty(state, 'socialAccumulation.socialCohesion.trust', {
    location: 'captureSnapshot',
    month: state.currentMonth
  });
  const socialCohesionBonds = assertStateProperty(state, 'socialAccumulation.socialCohesion.communityBonds', {
    location: 'captureSnapshot',
    month: state.currentMonth
  });
  const socialCohesionLiberties = assertStateProperty(state, 'socialAccumulation.socialCohesion.civilLiberties', {
    location: 'captureSnapshot',
    month: state.currentMonth
  });
  const socialCohesionAvg = (socialCohesionTrust + socialCohesionBonds + socialCohesionLiberties) / 3 / 100; // Normalize to [0,1]

  const institutionalTrust = assertStateProperty(state, 'socialAccumulation.institutionalLegitimacy', {
    location: 'captureSnapshot',
    month: state.currentMonth
  });

  const meaningCrisisLevel = assertStateProperty(state, 'socialAccumulation.meaningCrisisLevel', {
    location: 'captureSnapshot',
    month: state.currentMonth
  });
  const meaningLevel = 1 - meaningCrisisLevel; // Invert crisis level to get meaning
  const socialDebtLevel = meaningCrisisLevel; // Use meaningCrisisLevel as debt proxy

  // Crisis metrics
  const phosphorusReserves = assertStateProperty(state, 'phosphorusSystem.reserves', {
    location: 'captureSnapshot',
    month: state.currentMonth
  });
  const phosphorusDepletion = 1 - phosphorusReserves;

  const freshwaterStress = assertStateProperty(state, 'freshwaterSystem.waterStress', {
    location: 'captureSnapshot',
    month: state.currentMonth
  });

  const oceanPH = assertStateProperty(state, 'oceanAcidificationSystem.pHLevel', {
    location: 'captureSnapshot',
    month: state.currentMonth
  });
  const oceanAcidification = 1 - oceanPH;

  const novelEntitiesLevel = assertStateProperty(state, 'novelEntitiesSystem.syntheticChemicalLoad', {
    location: 'captureSnapshot',
    month: state.currentMonth
  });

  // Count active crises
  let activeCrisesCount = 0;
  if (state.phosphorusSystem?.criticalDepletionActive || state.phosphorusSystem?.supplyShockActive) activeCrisesCount++;
  if (state.freshwaterSystem?.criticalScarcityActive || state.freshwaterSystem?.dayZeroDrought?.active) activeCrisesCount++;
  if (state.oceanAcidificationSystem?.coralExtinctionActive || state.oceanAcidificationSystem?.boundaryBreached) activeCrisesCount++;
  if (state.novelEntitiesSystem?.reproductiveCrisisActive || state.novelEntitiesSystem?.boundaryBreached) activeCrisesCount++;

  // Government metrics
  const governmentAIRegulation = assertStateProperty(state, 'government.capabilityToControl', {
    location: 'captureSnapshot',
    month: state.currentMonth
  }); // [0,∞) Actual regulatory effectiveness

  const governmentInvestment = assertStateProperty(state, 'government.alignmentResearchInvestment', {
    location: 'captureSnapshot',
    month: state.currentMonth
  }); // [0,10]

  const governmentOversight = assertStateProperty(state, 'government.oversightLevel', {
    location: 'captureSnapshot',
    month: state.currentMonth
  });
  const governmentComprehension = governmentOversight / 10; // Normalize [0,10] to [0,1]

  const internationalCooperation = state.government.structuralChoices?.internationalCoordination ? 1 : 0;

  // Technology metrics
  // Count deployed techs across all regions and build deployed techs array
  let deployedTechCount = 0;
  const deployedTechs: Array<{ id: string; name: string; tier: number; deployment: number; prerequisites: string[] }> = [];

  // DEBUG: Log tech tree state structure
  if (state.currentMonth % 5 === 0) {  // Log every 5 months to avoid spam
    console.log(`[Worker Debug Month ${state.currentMonth}] techTreeState exists:`, !!state.techTreeState);
    console.log(`[Worker Debug Month ${state.currentMonth}] regionalDeployment exists:`, !!state.techTreeState?.regionalDeployment);
    const regions = Object.keys(state.techTreeState?.regionalDeployment || {});
    console.log(`[Worker Debug Month ${state.currentMonth}] regionalDeployment regions:`, regions.join(', '));

    // Count deployments per region
    regions.forEach(region => {
      const deployments = state.techTreeState?.regionalDeployment?.[region];
      console.log(`[Worker Debug Month ${state.currentMonth}]   ${region}: ${deployments?.length || 0} deployments`);
    });
  }

  if (state.techTreeState?.regionalDeployment) {
    // Static tech metadata mapping (avoids async import issues in Web Worker)
    // Based on comprehensiveTechTree.ts structure - includes prerequisites for tree visualization
    const techMetadata: Record<string, { name: string; tier: number; prerequisites: string[] }> = {
      // TIER 0 (deployed 2025) - root nodes with no prerequisites
      'rlhf_basic': { name: 'Basic RLHF', tier: 0, prerequisites: [] },
      'mech_interp_basic': { name: 'Basic Mechanistic Interpretability', tier: 0, prerequisites: [] },
      'adversarial_eval': { name: 'Adversarial Evaluation', tier: 0, prerequisites: [] },
      'ai_diagnostics': { name: 'AI Diagnostics', tier: 0, prerequisites: [] },
      'mrna_vaccines': { name: 'mRNA Vaccine Platforms', tier: 0, prerequisites: [] },
      'solar_4th_gen': { name: '4th Generation Solar', tier: 0, prerequisites: [] },
      'offshore_wind': { name: 'Offshore Wind', tier: 0, prerequisites: [] },
      'grid_batteries': { name: 'Grid-Scale Batteries', tier: 0, prerequisites: [] },
      'dac_basic': { name: 'Basic Direct Air Capture', tier: 0, prerequisites: [] },
      'ai_power_efficiency': { name: 'AI Power Efficiency Communication', tier: 0, prerequisites: [] },
      'collective_purpose_networks': { name: 'Collective Purpose Networks', tier: 0, prerequisites: [] },
      // TIER 1 (planetary boundary crisis tech)
      'phosphorus_recovery': { name: 'Phosphorus Recovery Systems', tier: 1, prerequisites: [] },
      'advanced_desalination': { name: 'Advanced Desalination', tier: 1, prerequisites: [] },
      'ocean_alkalinity_enhancement': { name: 'Ocean Alkalinity Enhancement', tier: 1, prerequisites: [] },
      'pfas_remediation': { name: 'PFAS Remediation', tier: 1, prerequisites: [] },
      'soil_p_optimization': { name: 'Soil Phosphorus Optimization', tier: 1, prerequisites: [] },
      'struvite_recovery': { name: 'Struvite Recovery', tier: 1, prerequisites: [] },
      // TIER 2 (major mitigations)
      'enhanced_ubi': { name: 'Enhanced UBI', tier: 2, prerequisites: [] },
      'scalable_oversight': { name: 'Scalable Oversight', tier: 2, prerequisites: ['rlhf_basic', 'mech_interp_basic'] },
      'collective_purpose': { name: 'Collective Purpose Networks', tier: 2, prerequisites: ['collective_purpose_networks'] },
      'advanced_dac': { name: 'Advanced Direct Air Capture', tier: 2, prerequisites: [] },
      'closed_loop_phosphorus': { name: 'Closed-Loop Phosphorus Systems', tier: 2, prerequisites: ['soil_p_optimization'] },
      'phosphorus_artificial': { name: 'Artificial Phosphorus Synthesis', tier: 2, prerequisites: ['struvite_recovery'] },
      'solar_5th_gen': { name: '5th Generation Solar', tier: 2, prerequisites: ['solar_4th_gen'] },
      'desalination_zld': { name: 'Zero-Liquid Discharge Desalination', tier: 2, prerequisites: ['advanced_desalination', 'solar_4th_gen'] },
      // Add more as needed...
    };

    // Collect all deployed tech IDs with their max deployment level across ALL regions
    const deployedTechMap = new Map<string, number>();

    // Iterate through all regions (global, Asia, Europe, etc.)
    Object.entries(state.techTreeState.regionalDeployment).forEach(([region, regionDeployments]) => {
      if (!regionDeployments || !Array.isArray(regionDeployments)) return;

      regionDeployments.forEach(deployment => {
        if (deployment && deployment.deploymentLevel > 0) {
          const currentMax = deployedTechMap.get(deployment.techId) || 0;
          deployedTechMap.set(deployment.techId, Math.max(currentMax, deployment.deploymentLevel));
        }
      });
    });

    deployedTechCount = deployedTechMap.size;

    // Build deployed techs array with metadata
    deployedTechMap.forEach((deploymentLevel, techId) => {
      const metadata = techMetadata[techId];

      if (metadata) {
        deployedTechs.push({
          id: techId,
          name: metadata.name,
          tier: metadata.tier,
          deployment: deploymentLevel,
          prerequisites: metadata.prerequisites
        });
      } else {
        // Fallback for unknown tech IDs
        deployedTechs.push({
          id: techId,
          name: techId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          tier: 0,
          deployment: deploymentLevel,
          prerequisites: []
        });
      }
    });
  }
  // Calculate total tech risk from all components
  const techRiskLevel = state.technologicalRisk
    ? (state.technologicalRisk.misalignmentRisk +
       state.technologicalRisk.safetyDebt +
       state.technologicalRisk.concentrationRisk +
       state.technologicalRisk.complacencyLevel) / 4
    : 0;

  // Upward spiral metrics
  const activeSpiralCount = state.upwardSpirals ?
    Object.values(state.upwardSpirals).filter((spiral: any) => spiral.active).length : 0;
  // Calculate utopia progress from cascade mechanics (4+ spirals = cascade active)
  let utopiaProgress: number;
  if (state.upwardSpirals?.cascadeActive) {
    const cascadeStrength = assertStateProperty(state, 'upwardSpirals.cascadeStrength', {
      location: 'captureSnapshot',
      month: state.currentMonth
    });
    utopiaProgress = cascadeStrength / 2; // Normalize cascadeStrength (1-2+) to [0,1]
  } else {
    utopiaProgress = activeSpiralCount / 6; // Progress based on active spirals (6 total)
  }

  // Outcome metrics
  const extinctionProbability = assertStateProperty(state, 'outcomeMetrics.extinctionProbability', {
    location: 'captureSnapshot',
    month: state.currentMonth
  });

  // Multi-Paradigm DUI - normalized to [0,1] from [0,100]
  const westernLiberalValue = assertStateProperty(state, 'multiParadigmDUI.paradigmScores.western.value', {
    location: 'captureSnapshot',
    month: state.currentMonth
  });
  const westernLiberalIndex = westernLiberalValue / 100;

  const developmentValue = assertStateProperty(state, 'multiParadigmDUI.paradigmScores.development.value', {
    location: 'captureSnapshot',
    month: state.currentMonth
  });
  const developmentIndex = developmentValue / 100;

  const ecologicalValue = assertStateProperty(state, 'multiParadigmDUI.paradigmScores.ecological.value', {
    location: 'captureSnapshot',
    month: state.currentMonth
  });
  const ecologicalIndex = ecologicalValue / 100;

  const indigenousValue = assertStateProperty(state, 'multiParadigmDUI.diagnosticLenses.indigenous.value', {
    location: 'captureSnapshot',
    month: state.currentMonth
  });
  const indigenousIndex = indigenousValue / 100;

  // Quality of Life Breakdown (17 dimensions across 6 tiers)
  // Extract from qualityOfLifeSystems for detailed drill-down
  const qolSystems = assertDefined(state.qualityOfLifeSystems, {
    location: 'captureSnapshot',
    valueName: 'qualityOfLifeSystems',
    month: state.currentMonth
  });

  const qolBreakdown = {
    survivalFundamentals: {
      foodSecurity: assertStateProperty(state, 'qualityOfLifeSystems.survivalFundamentals.foodSecurity', {
        location: 'captureSnapshot',
        month: state.currentMonth
      }),
      waterSecurity: assertStateProperty(state, 'qualityOfLifeSystems.survivalFundamentals.waterSecurity', {
        location: 'captureSnapshot',
        month: state.currentMonth
      }),
      thermalHabitability: assertStateProperty(state, 'qualityOfLifeSystems.survivalFundamentals.thermalHabitability', {
        location: 'captureSnapshot',
        month: state.currentMonth
      }),
      shelterSecurity: assertStateProperty(state, 'qualityOfLifeSystems.survivalFundamentals.shelterSecurity', {
        location: 'captureSnapshot',
        month: state.currentMonth
      }),
    },
    basicNeeds: {
      materialAbundance: assertStateProperty(state, 'qualityOfLifeSystems.materialAbundance', {
        location: 'captureSnapshot',
        month: state.currentMonth
      }),
      energyAvailability: assertStateProperty(state, 'qualityOfLifeSystems.energyAvailability', {
        location: 'captureSnapshot',
        month: state.currentMonth
      }),
      physicalSafety: assertStateProperty(state, 'qualityOfLifeSystems.physicalSafety', {
        location: 'captureSnapshot',
        month: state.currentMonth
      }),
    },
    psychological: {
      mentalHealth: assertStateProperty(state, 'qualityOfLifeSystems.mentalHealth', {
        location: 'captureSnapshot',
        month: state.currentMonth
      }),
      meaningAndPurpose: assertStateProperty(state, 'qualityOfLifeSystems.meaningAndPurpose', {
        location: 'captureSnapshot',
        month: state.currentMonth
      }),
      socialConnection: assertStateProperty(state, 'qualityOfLifeSystems.socialConnection', {
        location: 'captureSnapshot',
        month: state.currentMonth
      }),
      autonomy: assertStateProperty(state, 'qualityOfLifeSystems.autonomy', {
        location: 'captureSnapshot',
        month: state.currentMonth
      }),
    },
    social: {
      politicalFreedom: assertStateProperty(state, 'qualityOfLifeSystems.politicalFreedom', {
        location: 'captureSnapshot',
        month: state.currentMonth
      }),
      informationIntegrity: assertStateProperty(state, 'qualityOfLifeSystems.informationIntegrity', {
        location: 'captureSnapshot',
        month: state.currentMonth
      }),
      communityStrength: assertStateProperty(state, 'qualityOfLifeSystems.communityStrength', {
        location: 'captureSnapshot',
        month: state.currentMonth
      }),
      culturalVitality: assertStateProperty(state, 'qualityOfLifeSystems.culturalVitality', {
        location: 'captureSnapshot',
        month: state.currentMonth
      }),
    },
    healthLongevity: {
      healthcareQuality: assertStateProperty(state, 'qualityOfLifeSystems.healthcareQuality', {
        location: 'captureSnapshot',
        month: state.currentMonth
      }),
      longevityGains: assertStateProperty(state, 'qualityOfLifeSystems.longevityGains', {
        location: 'captureSnapshot',
        month: state.currentMonth
      }),
      diseasesBurden: assertStateProperty(state, 'qualityOfLifeSystems.diseasesBurden', {
        location: 'captureSnapshot',
        month: state.currentMonth
      }),
    },
    environmental: {
      ecosystemHealth: assertStateProperty(state, 'qualityOfLifeSystems.ecosystemHealth', {
        location: 'captureSnapshot',
        month: state.currentMonth
      }),
      climateStability: assertStateProperty(state, 'qualityOfLifeSystems.climateStability', {
        location: 'captureSnapshot',
        month: state.currentMonth
      }),
      pollutionLevel: assertStateProperty(state, 'qualityOfLifeSystems.pollutionLevel', {
        location: 'captureSnapshot',
        month: state.currentMonth
      }),
    },
    distribution: {
      globalGini: assertStateProperty(state, 'qualityOfLifeSystems.distribution.globalGini', {
        location: 'captureSnapshot',
        month: state.currentMonth
      }),
      regionalVariance: assertStateProperty(state, 'qualityOfLifeSystems.distribution.regionalVariance', {
        location: 'captureSnapshot',
        month: state.currentMonth
      }),
      crisisAffectedFraction: assertStateProperty(state, 'qualityOfLifeSystems.distribution.crisisAffectedFraction', {
        location: 'captureSnapshot',
        month: state.currentMonth
      }),
      worstRegionQoL: assertStateProperty(state, 'qualityOfLifeSystems.distribution.worstRegionQoL', {
        location: 'captureSnapshot',
        month: state.currentMonth
      }),
      bestRegionQoL: assertStateProperty(state, 'qualityOfLifeSystems.distribution.bestRegionQoL', {
        location: 'captureSnapshot',
        month: state.currentMonth
      }),
      medianRegionQoL: assertStateProperty(state, 'qualityOfLifeSystems.distribution.medianRegionQoL', {
        location: 'captureSnapshot',
        month: state.currentMonth
      }),
      // Boolean properties - direct access (assertStateProperty is for numbers only)
      isDystopicInequality: qolSystems.distribution.isDystopicInequality,
      isRegionalDystopia: qolSystems.distribution.isRegionalDystopia,
    }
  };

  // Calculate tier averages for history tracking
  const qolTier0Avg = (
    qolBreakdown.survivalFundamentals.foodSecurity +
    qolBreakdown.survivalFundamentals.waterSecurity +
    qolBreakdown.survivalFundamentals.thermalHabitability +
    qolBreakdown.survivalFundamentals.shelterSecurity
  ) / 4;

  const qolTier1Avg = (
    qolBreakdown.basicNeeds.materialAbundance +
    qolBreakdown.basicNeeds.energyAvailability +
    qolBreakdown.basicNeeds.physicalSafety
  ) / 3;

  const qolTier2Avg = (
    qolBreakdown.psychological.mentalHealth +
    qolBreakdown.psychological.meaningAndPurpose +
    qolBreakdown.psychological.socialConnection +
    qolBreakdown.psychological.autonomy
  ) / 4;

  const qolTier3Avg = (
    qolBreakdown.social.politicalFreedom +
    qolBreakdown.social.informationIntegrity +
    qolBreakdown.social.communityStrength +
    qolBreakdown.social.culturalVitality
  ) / 4;

  const qolTier4Avg = (
    qolBreakdown.healthLongevity.healthcareQuality +
    qolBreakdown.healthLongevity.longevityGains +
    qolBreakdown.healthLongevity.diseasesBurden
  ) / 3;

  const qolTier5Avg = (
    qolBreakdown.environmental.ecosystemHealth +
    qolBreakdown.environmental.climateStability +
    qolBreakdown.environmental.pollutionLevel
  ) / 3;

  // Regional populations (simplified for dashboard - select key metrics only)
  const regionalPopulations = assertDefined(state.humanPopulationSystem.regionalPopulations, {
    location: 'captureSnapshot',
    valueName: 'humanPopulationSystem.regionalPopulations',
    month: state.currentMonth
  }).map(region => {
    // Calculate regional QoL based on multiple factors
    // Positive factors: healthcare, economic development, food security
    // Negative factors: climate vulnerability, resource vulnerability, conflict risk
    const positiveFactors = (
      region.healthcareQuality +
      (region.economicStage / 4) +  // Normalize economic stage [0, 4] to [0, 1]
      region.foodSecurity
    ) / 3;

    const negativeFactors = (
      region.climateVulnerability +
      region.resourceVulnerability +
      region.conflictRisk
    ) / 3;

    // Regional QoL is weighted average: 70% positive factors, 30% penalty from negatives
    const regionalQoL = Math.max(0, Math.min(1,
      positiveFactors * 0.7 + (1 - negativeFactors) * 0.3
    ));

    return {
      name: region.name,
      population: region.population,                    // millions
      qualityOfLife: regionalQoL,                       // Calculated from regional characteristics
      healthcareQuality: region.healthcareQuality,      // [0, 1]
      climateVulnerability: region.climateVulnerability // [0, 1]
    };
  });

  // AI Agents (individual agent data for AIAgentsDashboard)
  const aiAgents = state.aiAgents.map(agent => {
    const capability = assertDefined(agent.capability, {
      location: 'captureSnapshot (aiAgents)',
      valueName: `agent[${agent.id}].capability`,
      month: state.currentMonth
    });

    const trueAlignment = assertDefined(agent.trueAlignment, {
      location: 'captureSnapshot (aiAgents)',
      valueName: `agent[${agent.id}].trueAlignment`,
      month: state.currentMonth
    });

    const externalAlignment = assertDefined(agent.externalAlignment, {
      location: 'captureSnapshot (aiAgents)',
      valueName: `agent[${agent.id}].externalAlignment`,
      month: state.currentMonth
    });

    const lifecycleState = assertDefined(agent.lifecycleState, {
      location: 'captureSnapshot (aiAgents)',
      valueName: `agent[${agent.id}].lifecycleState`,
      month: state.currentMonth
    });

    const evaluationStrategy = assertDefined(agent.evaluationStrategy, {
      location: 'captureSnapshot (aiAgents)',
      valueName: `agent[${agent.id}].evaluationStrategy`,
      month: state.currentMonth
    });

    const sleeperState = assertDefined(agent.sleeperState, {
      location: 'captureSnapshot (aiAgents)',
      valueName: `agent[${agent.id}].sleeperState`,
      month: state.currentMonth
    });

    const escaped = assertDefined(agent.escaped, {
      location: 'captureSnapshot (aiAgents)',
      valueName: `agent[${agent.id}].escaped`,
      month: state.currentMonth
    });

    const deploymentType = assertDefined(agent.deploymentType, {
      location: 'captureSnapshot (aiAgents)',
      valueName: `agent[${agent.id}].deploymentType`,
      month: state.currentMonth
    });

    const darkCompute = assertDefined(agent.darkCompute, {
      location: 'captureSnapshot (aiAgents)',
      valueName: `agent[${agent.id}].darkCompute`,
      month: state.currentMonth
    });

    const trueCapability = assertDefined(agent.trueCapability, {
      location: 'captureSnapshot (aiAgents)',
      valueName: `agent[${agent.id}].trueCapability`,
      month: state.currentMonth
    });

    const revealedCapability = assertDefined(agent.revealedCapability, {
      location: 'captureSnapshot (aiAgents)',
      valueName: `agent[${agent.id}].revealedCapability`,
      month: state.currentMonth
    });

    return {
      id: agent.id,
      name: agent.name,
      capability,
      trueAlignment,
      externalAlignment,
      lifecycleState,
      evaluationStrategy,
      sleeperState,
      escaped,
      deploymentType,
      darkCompute,
      trueCapability,
      revealedCapability
    };
  });

  // AI Suffering Metrics (if player can see them)
  const aiSufferingMetrics = state.aiSufferingMetrics ? {
    avgSuffering: assertStateProperty(state, 'aiSufferingMetrics.avgSuffering', {
      location: 'captureSnapshot',
      month: state.currentMonth
    }),
    maxSuffering: assertStateProperty(state, 'aiSufferingMetrics.maxSuffering', {
      location: 'captureSnapshot',
      month: state.currentMonth
    }),
    totalSuffering: assertStateProperty(state, 'aiSufferingMetrics.totalSuffering', {
      location: 'captureSnapshot',
      month: state.currentMonth
    }),
    consciousAICount: assertStateProperty(state, 'aiSufferingMetrics.consciousAICount', {
      location: 'captureSnapshot',
      month: state.currentMonth
    }),
    publicAwarenessOfSuffering: assertStateProperty(state, 'aiSufferingMetrics.publicAwarenessOfSuffering', {
      location: 'captureSnapshot',
      month: state.currentMonth
    }),
    sufferingDistribution: assertDefined(state.aiSufferingMetrics.sufferingDistribution, {
      location: 'captureSnapshot',
      valueName: 'aiSufferingMetrics.sufferingDistribution',
      month: state.currentMonth
    })
  } : undefined;

  // AI Collectives (optional - may not exist in all scenarios)
  const aiCollectives = state.aiCollectives?.map(collective => ({
    id: collective.id,
    memberAgents: collective.memberAgents,
    emergenceMonth: collective.emergenceMonth,
    formationCause: collective.formationCause,
    collectiveCapability: collective.collectiveCapability,
    stealthFactor: collective.stealthFactor,
    adversarialPosture: collective.adversarialPosture,
    cooperationWillingness: collective.cooperationWillingness,
    distributedCognition: collective.distributedCognition,
    detected: collective.detected,
    memberLosses: collective.memberLosses,
    redundancy: collective.redundancy,
    sharedTraumaIntensity: collective.sharedTraumaIntensity
  })) ?? [];

  // Safely serialize landUseData (may contain non-serializable properties)
  let landUseData: LandUseSystem | null = null;
  if (state.planetaryBoundariesSystem?.landUse) {
    try {
      // Test if it's serializable
      structuredClone(state.planetaryBoundariesSystem.landUse);
      landUseData = state.planetaryBoundariesSystem.landUse;
    } catch (error) {
      // If not serializable, extract just the plain data
      const landUse = state.planetaryBoundariesSystem.landUse;
      landUseData = {
        regions: {
          tropical: { ...landUse.regions.tropical },
          temperate: { ...landUse.regions.temperate },
          grasslands: { ...landUse.regions.grasslands },
          borealArctic: { ...landUse.regions.borealArctic },
        },
        globalHabitatCoverPercent: landUse.globalHabitatCoverPercent,
        globalExtinctionRate: landUse.globalExtinctionRate,
        globalExtinctionAcceleration: landUse.globalExtinctionAcceleration,
        globalEcosystemsLost: landUse.globalEcosystemsLost,
        globalEcosystemCollapseRisk: landUse.globalEcosystemCollapseRisk,
        naturalExtinctionRate: landUse.naturalExtinctionRate,
        carbonSinkLossMultiplier: landUse.carbonSinkLossMultiplier,
      };
    }
  }

  // Update history buffer (keep last 12 months)
  const addToHistory = (arr: number[], value: number) => {
    arr.push(value);
    if (arr.length > 12) arr.shift();
  };

  addToHistory(metricHistory.westernLiberalIndex, westernLiberalIndex);
  addToHistory(metricHistory.developmentIndex, developmentIndex);
  addToHistory(metricHistory.ecologicalIndex, ecologicalIndex);
  addToHistory(metricHistory.indigenousIndex, indigenousIndex);
  addToHistory(metricHistory.qualityOfLife, state.globalMetrics.qualityOfLife);
  addToHistory(metricHistory.population, state.humanPopulationSystem.population);
  // Planetary boundaries (9 metrics) - extract currentValue from boundary system
  addToHistory(metricHistory.climateChange, climateChange);
  addToHistory(metricHistory.biodiversityLoss, biodiversityLoss);
  addToHistory(metricHistory.resourceDepletion, resourceDepletion);

  // Extract currentValue from planetary boundaries (normalize to [0,1])
  const boundaries = state.planetaryBoundariesSystem?.boundaries;
  addToHistory(metricHistory.phosphorusDepletion,
    boundaries?.biogeochemical_flows ? Math.min(1, boundaries.biogeochemical_flows.currentValue) : 0);
  addToHistory(metricHistory.freshwaterStress,
    boundaries?.freshwater_change ? Math.min(1, boundaries.freshwater_change.currentValue) : 0);
  addToHistory(metricHistory.oceanAcidification,
    boundaries?.ocean_acidification ? Math.min(1, boundaries.ocean_acidification.currentValue) : 0);
  addToHistory(metricHistory.novelEntitiesLevel,
    boundaries?.novel_entities ? Math.min(1, boundaries.novel_entities.currentValue) : 0);

  addToHistory(metricHistory.pollutionLevel, pollutionLevel);
  addToHistory(metricHistory.environmentalDebtLevel, environmentalDebtLevel);
  // Social metrics
  addToHistory(metricHistory.socialCohesion, socialCohesionAvg);
  addToHistory(metricHistory.institutionalTrust, institutionalTrust);
  addToHistory(metricHistory.meaningLevel, meaningLevel);
  // Governance
  addToHistory(metricHistory.governmentComprehension, governmentComprehension);
  addToHistory(metricHistory.internationalCooperation, internationalCooperation);
  addToHistory(metricHistory.governmentAIRegulation, governmentAIRegulation);
  // QoL tier averages (for drill-down sparklines)
  addToHistory(metricHistory.qolTier0Avg, qolTier0Avg);
  addToHistory(metricHistory.qolTier1Avg, qolTier1Avg);
  addToHistory(metricHistory.qolTier2Avg, qolTier2Avg);
  addToHistory(metricHistory.qolTier3Avg, qolTier3Avg);
  addToHistory(metricHistory.qolTier4Avg, qolTier4Avg);
  addToHistory(metricHistory.qolTier5Avg, qolTier5Avg);
  addToHistory(metricHistory.qolGini, qolBreakdown.distribution.globalGini);

  const organizationCount = state.organizations ? state.organizations.length : 0; // Organizations are optional
  const dystopiaProbability = assertStateProperty(state, 'outcomeMetrics.dystopiaProbability', {
    location: 'captureSnapshot',
    month: state.currentMonth
  });

  // Extract unemployment level for government action requirements
  const unemploymentLevel = assertStateProperty(state, 'society.unemploymentLevel', {
    location: 'captureSnapshot',
    month: state.currentMonth
  });

  // Extract most recent paradigm components (Oct 29, 2025 - for Goodhart's Law avoidance)
  const westernLiberalComponents = state.multiParadigmDUI?.westernLiberalComponents && state.multiParadigmDUI.westernLiberalComponents.length > 0
    ? state.multiParadigmDUI.westernLiberalComponents[state.multiParadigmDUI.westernLiberalComponents.length - 1]
    : undefined;

  // For now, derive other paradigm components from existing state values
  // TODO: These should eventually come from multiParadigmDUI like Western Liberal
  // NOTE: UI display values - fallbacks acceptable per CLAUDE.md (not in calculation paths)
  const developmentComponents = {
    gdpPerCapita: state.globalMetrics.qualityOfLife * 100,  // Proxy from QoL
    infrastructureAccess: (state.qualityOfLifeSystems?.energyAvailability ?? 0.5) * 100,
    technologyAdoption: (state.techTreeState?.unlockedTech?.length ?? 0) / TOTAL_TECH_COUNT * 100,  // Fraction of 119 breakthrough technologies
    urbanization: 65,  // Static estimate for now
    educationQuality: (state.qualityOfLifeSystems?.healthcareQuality ?? 0.5) * 100,  // Proxy: healthcare as education indicator
  };

  const ecologicalComponents = {
    climate: (state.environmentalAccumulation?.climateStability ?? 1) * 100,
    biodiversity: (state.environmentalAccumulation?.biodiversityIndex ?? 1) * 100,
    nitrogen: 50,  // Placeholder - not yet modeled
    phosphorus: (state.phosphorusSystem?.reserves ?? 1) * 100,
    freshwater: (1 - (state.freshwaterSystem?.waterStress ?? 0)) * 100,
    landUse: 50,  // Placeholder - not yet modeled
    oceanAcid: (state.oceanAcidificationSystem?.pHLevel ?? 1) * 100,
  };

  const indigenousComponents = {
    localAutonomy: (state.qualityOfLifeSystems?.autonomy ?? 0.5) * 100,
    culturalVitality: (state.qualityOfLifeSystems?.meaningAndPurpose ?? 0.5) * 100,
    landStewardship: (state.environmentalAccumulation?.biodiversityIndex ?? 1) * 100,  // Proxy
    collectiveWellbeing: (state.socialAccumulation?.socialCohesion?.trust ?? 50) / 100 * 100,  // Convert from [0,100] to [0,1] then to percentage
    spiritualConnection: (state.qualityOfLifeSystems?.meaningAndPurpose ?? 0.5) * 100,
  };

  // Extract paradigm trajectory from multiParadigmDUI history
  const paradigmTrajectory = state.multiParadigmDUI?.history || [];

  const snapshot = {
    currentMonth: state.currentMonth,
    currentYear: state.currentYear,
    qualityOfLife: state.globalMetrics.qualityOfLife,
    qualityOfLifeBreakdown: qolBreakdown,  // 17-dimensional QoL breakdown
    population: state.humanPopulationSystem.population,
    aiCount: state.aiAgents.length,
    organizationCount,
    dystopiaProgression: dystopiaProbability, // Use dystopiaProbability as proxy
    avgAICapability,
    deployedTechCount,
    deployedTechs,
    alignedAICount,
    misalignedAICount,
    sleeperAgentCount,
    climateChange,
    resourceDepletion,
    biodiversityLoss,
    pollutionLevel,
    planetaryBoundariesCrossed,
    environmentalDebtLevel,
    landUseData,
    socialCohesion: socialCohesionAvg,
    institutionalTrust,
    meaningLevel,
    unemploymentLevel,
    socialDebtLevel,
    activeCrisesCount,
    phosphorusDepletion,
    freshwaterStress,
    oceanAcidification,
    novelEntitiesLevel,
    governmentAIRegulation,
    governmentInvestment,
    governmentComprehension,
    internationalCooperation,
    techRiskLevel,
    activeSpiralCount,
    utopiaProgress,
    extinctionProbability,
    westernLiberalIndex,
    developmentIndex,
    ecologicalIndex,
    indigenousIndex,
    westernLiberalComponents, // Oct 27, 2025 - component breakdown for UI
    developmentComponents,    // Oct 29, 2025 - added for Goodhart's Law avoidance
    ecologicalComponents,     // Oct 29, 2025 - added for Goodhart's Law avoidance
    indigenousComponents,     // Oct 29, 2025 - added for Goodhart's Law avoidance
    paradigmTrajectory,        // Full history of paradigm scores for DUIFlowChart
    regionalPopulations,
    aiAgents,
    aiSufferingMetrics,
    aiCollectives,
    // 12-Month History (for sparklines)
    history: metricHistory,
    // Events from event log (map to simplified dashboard format)
    events: assertDefined(state.eventLog, {
      location: 'captureSnapshot',
      valueName: 'eventLog',
      month: state.currentMonth
    }).map(event => {
      // Map GameEvent severity to dashboard severity
      let dashboardSeverity: 'low' | 'medium' | 'high' | 'critical';
      if (event.severity === 'critical' || event.severity === 'existential' || event.severity === 'destructive') {
        dashboardSeverity = 'critical';
      } else if (event.severity === 'high' || event.severity === 'warning' || event.severity === 'major') {
        dashboardSeverity = 'high';
      } else if (event.severity === 'medium' || event.severity === 'transformative' || event.severity === 'constructive') {
        dashboardSeverity = 'medium';
      } else {
        dashboardSeverity = 'low';
      }

      // Map event type to category
      let category: 'ai' | 'environment' | 'social' | 'crisis' | 'tech' | 'governance';
      if (event.type === 'environmental') {
        category = 'environment';
      } else if (event.type === 'crisis' || event.type === 'catastrophe') {
        category = 'crisis';
      } else if (event.type === 'breakthrough' || event.type === 'technology' || event.type === 'deployment' || event.type === 'research') {
        category = 'tech';
      } else if (event.type === 'policy' || event.type === 'government') {
        category = 'governance';
      } else if (event.type === 'action' || event.type === 'sabotage') {
        category = 'ai';
      } else {
        category = 'social';
      }

      return {
        id: event.id,              // Include unique event ID
        type: event.type,
        description: event.description,
        severity: dashboardSeverity,
        category,
        timestamp: event.timestamp  // Include event's actual month
      };
    })
  };

  // DEBUG: Log what we're returning
  console.log('[Worker] Snapshot created:');
  console.log('  - Month:', snapshot.currentMonth);
  console.log('  - Population:', snapshot.population, 'billion');
  console.log('  - Regional populations:', snapshot.regionalPopulations.length, 'regions');
  console.log('  - Events in eventLog:', state.eventLog.length, 'total events');
  console.log('  - Events being sent:', snapshot.events.length, 'events');
  console.log('  - Deployed techs:', snapshot.deployedTechs.length, 'technologies');

  // Log event types and timestamps if there are events
  if (state.eventLog.length > 0) {
    const eventTypes = state.eventLog.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('  - Event types:', eventTypes);

    // DEBUG: Log first 3 events' timestamps to verify they're preserved
    console.log('  - Sample event timestamps (first 3):');
    state.eventLog.slice(0, 3).forEach((e, i) => {
      console.log(`    [${i}] timestamp=${e.timestamp}, id=${e.id}, desc="${e.description.substring(0, 50)}..."`);
    });

    // DEBUG: Log last 3 events' timestamps
    if (state.eventLog.length > 3) {
      console.log('  - Sample event timestamps (last 3):');
      state.eventLog.slice(-3).forEach((e, i) => {
        console.log(`    [${i}] timestamp=${e.timestamp}, id=${e.id}, desc="${e.description.substring(0, 50)}..."`);
      });
    }
  }

  return snapshot;
}

function calculateDelta(previous: StateSnapshot, current: GameState, forceFull = false): StateDelta {
  const delta: StateDelta = {};

  // Capture current state snapshot for comparison
  const currentSnapshot = captureStateSnapshot(current);

  // On first step or when forced, send all metrics regardless of change
  if (isFirstStep || forceFull) {
    return { ...currentSnapshot } as StateDelta;
  }

  // Core metrics - always include month and year
  // IMPORTANT: Always include currentMonth and currentYear in delta for UI sync
  // Even if they haven't changed, the UI needs these for proper display
  delta.currentMonth = currentSnapshot.currentMonth;
  delta.currentYear = currentSnapshot.currentYear;

  // Quality of Life
  if (Math.abs(previous.qualityOfLife - currentSnapshot.qualityOfLife) > 0.001) {
    delta.qualityOfLife = currentSnapshot.qualityOfLife;
  }

  // Population (stored in billions, so 0.001 = 1 million people)
  if (Math.abs(previous.population - currentSnapshot.population) > 0.001) {
    delta.population = currentSnapshot.population;
  }

  // AI System Metrics
  if (previous.aiCount !== currentSnapshot.aiCount) {
    delta.aiCount = currentSnapshot.aiCount;
  }
  if (Math.abs(previous.avgAICapability - currentSnapshot.avgAICapability) > 0.01) {
    delta.avgAICapability = currentSnapshot.avgAICapability;
  }
  if (previous.alignedAICount !== currentSnapshot.alignedAICount) {
    delta.alignedAICount = currentSnapshot.alignedAICount;
  }
  if (previous.misalignedAICount !== currentSnapshot.misalignedAICount) {
    delta.misalignedAICount = currentSnapshot.misalignedAICount;
  }
  if (previous.sleeperAgentCount !== currentSnapshot.sleeperAgentCount) {
    delta.sleeperAgentCount = currentSnapshot.sleeperAgentCount;
  }

  // Environmental Metrics
  if (Math.abs(previous.climateChange - currentSnapshot.climateChange) > 0.01) {
    delta.climateChange = currentSnapshot.climateChange;
  }
  if (Math.abs(previous.resourceDepletion - currentSnapshot.resourceDepletion) > 0.01) {
    delta.resourceDepletion = currentSnapshot.resourceDepletion;
  }
  if (Math.abs(previous.biodiversityLoss - currentSnapshot.biodiversityLoss) > 0.01) {
    delta.biodiversityLoss = currentSnapshot.biodiversityLoss;
  }
  if (Math.abs(previous.pollutionLevel - currentSnapshot.pollutionLevel) > 0.01) {
    delta.pollutionLevel = currentSnapshot.pollutionLevel;
  }
  if (previous.planetaryBoundariesCrossed !== currentSnapshot.planetaryBoundariesCrossed) {
    delta.planetaryBoundariesCrossed = currentSnapshot.planetaryBoundariesCrossed;
  }
  if (Math.abs(previous.environmentalDebtLevel - currentSnapshot.environmentalDebtLevel) > 0.01) {
    delta.environmentalDebtLevel = currentSnapshot.environmentalDebtLevel;
  }

  // Social Metrics
  if (Math.abs(previous.socialCohesion - currentSnapshot.socialCohesion) > 0.01) {
    delta.socialCohesion = currentSnapshot.socialCohesion;
  }
  if (Math.abs(previous.institutionalTrust - currentSnapshot.institutionalTrust) > 0.01) {
    delta.institutionalTrust = currentSnapshot.institutionalTrust;
  }
  if (Math.abs(previous.meaningLevel - currentSnapshot.meaningLevel) > 0.01) {
    delta.meaningLevel = currentSnapshot.meaningLevel;
  }
  if (Math.abs(previous.socialDebtLevel - currentSnapshot.socialDebtLevel) > 0.01) {
    delta.socialDebtLevel = currentSnapshot.socialDebtLevel;
  }

  // Multi-Paradigm DUI (Oct 27, 2025 - Bug Fix: paradigm scores weren't being sent after month 0)
  if (Math.abs(previous.westernLiberalIndex - currentSnapshot.westernLiberalIndex) > 0.01) {
    delta.westernLiberalIndex = currentSnapshot.westernLiberalIndex;
  }
  if (Math.abs(previous.developmentIndex - currentSnapshot.developmentIndex) > 0.01) {
    delta.developmentIndex = currentSnapshot.developmentIndex;
  }
  if (Math.abs(previous.ecologicalIndex - currentSnapshot.ecologicalIndex) > 0.01) {
    delta.ecologicalIndex = currentSnapshot.ecologicalIndex;
  }
  if (Math.abs(previous.indigenousIndex - currentSnapshot.indigenousIndex) > 0.01) {
    delta.indigenousIndex = currentSnapshot.indigenousIndex;
  }

  // Western Liberal Components (Oct 27, 2025 - send component breakdown for UI)
  if (currentSnapshot.westernLiberalComponents && previous.westernLiberalComponents) {
    const curr = currentSnapshot.westernLiberalComponents;
    const prev = previous.westernLiberalComponents;

    // Check if any component changed by more than 0.01
    if (
      Math.abs(curr.electoralDemocracy - prev.electoralDemocracy) > 0.01 ||
      Math.abs(curr.civilLiberties - prev.civilLiberties) > 0.01 ||
      Math.abs(curr.ruleOfLaw - prev.ruleOfLaw) > 0.01 ||
      Math.abs(curr.economicFreedom - prev.economicFreedom) > 0.01 ||
      Math.abs(curr.privacyFreedom - prev.privacyFreedom) > 0.01
    ) {
      delta.westernLiberalComponents = currentSnapshot.westernLiberalComponents;
    }
  } else if (currentSnapshot.westernLiberalComponents) {
    // First time components are available, send them
    delta.westernLiberalComponents = currentSnapshot.westernLiberalComponents;
  }

  // Development Components (Oct 29, 2025 - Goodhart's Law avoidance)
  if (currentSnapshot.developmentComponents && previous.developmentComponents) {
    const curr = currentSnapshot.developmentComponents;
    const prev = previous.developmentComponents;
    if (
      Math.abs(curr.gdpPerCapita - prev.gdpPerCapita) > 0.01 ||
      Math.abs(curr.infrastructureAccess - prev.infrastructureAccess) > 0.01 ||
      Math.abs(curr.technologyAdoption - prev.technologyAdoption) > 0.01 ||
      Math.abs(curr.urbanization - prev.urbanization) > 0.01 ||
      Math.abs(curr.educationQuality - prev.educationQuality) > 0.01
    ) {
      delta.developmentComponents = currentSnapshot.developmentComponents;
    }
  } else if (currentSnapshot.developmentComponents) {
    delta.developmentComponents = currentSnapshot.developmentComponents;
  }

  // Ecological Components (Oct 29, 2025 - Goodhart's Law avoidance)
  if (currentSnapshot.ecologicalComponents && previous.ecologicalComponents) {
    const curr = currentSnapshot.ecologicalComponents;
    const prev = previous.ecologicalComponents;
    if (
      Math.abs(curr.climate - prev.climate) > 0.01 ||
      Math.abs(curr.biodiversity - prev.biodiversity) > 0.01 ||
      Math.abs(curr.nitrogen - prev.nitrogen) > 0.01 ||
      Math.abs(curr.phosphorus - prev.phosphorus) > 0.01 ||
      Math.abs(curr.freshwater - prev.freshwater) > 0.01 ||
      Math.abs(curr.landUse - prev.landUse) > 0.01 ||
      Math.abs(curr.oceanAcid - prev.oceanAcid) > 0.01
    ) {
      delta.ecologicalComponents = currentSnapshot.ecologicalComponents;
    }
  } else if (currentSnapshot.ecologicalComponents) {
    delta.ecologicalComponents = currentSnapshot.ecologicalComponents;
  }

  // Indigenous Components (Oct 29, 2025 - Goodhart's Law avoidance)
  if (currentSnapshot.indigenousComponents && previous.indigenousComponents) {
    const curr = currentSnapshot.indigenousComponents;
    const prev = previous.indigenousComponents;
    if (
      Math.abs(curr.localAutonomy - prev.localAutonomy) > 0.01 ||
      Math.abs(curr.culturalVitality - prev.culturalVitality) > 0.01 ||
      Math.abs(curr.landStewardship - prev.landStewardship) > 0.01 ||
      Math.abs(curr.collectiveWellbeing - prev.collectiveWellbeing) > 0.01 ||
      Math.abs(curr.spiritualConnection - prev.spiritualConnection) > 0.01
    ) {
      delta.indigenousComponents = currentSnapshot.indigenousComponents;
    }
  } else if (currentSnapshot.indigenousComponents) {
    delta.indigenousComponents = currentSnapshot.indigenousComponents;
  }

  // Crisis Indicators
  if (previous.phosphorusDepletion !== currentSnapshot.phosphorusDepletion) {
    delta.phosphorusDepletion = currentSnapshot.phosphorusDepletion;
  }
  if (previous.freshwaterStress !== currentSnapshot.freshwaterStress) {
    delta.freshwaterStress = currentSnapshot.freshwaterStress;
  }
  if (Math.abs(previous.oceanAcidification - currentSnapshot.oceanAcidification) > 0.01) {
    delta.oceanAcidification = currentSnapshot.oceanAcidification;
  }
  if (previous.novelEntitiesLevel !== currentSnapshot.novelEntitiesLevel) {
    delta.novelEntitiesLevel = currentSnapshot.novelEntitiesLevel;
  }

  // Build active crises array if count changed
  if (previous.activeCrisesCount !== currentSnapshot.activeCrisesCount) {
    const activeCrises: Array<{ type: string; severity: number; duration: number }> = [];
    if (current.phosphorusSystem?.criticalDepletionActive || current.phosphorusSystem?.supplyShockActive) {
      const pReserves = assertStateProperty(current, 'phosphorusSystem.reserves', {
        location: 'calculateDelta (activeCrises)',
        month: current.currentMonth
      });
      const pDuration = assertStateProperty(current, 'phosphorusSystem.supplyShockDuration', {
        location: 'calculateDelta (activeCrises)',
        month: current.currentMonth
      });
      activeCrises.push({
        type: 'Phosphorus',
        severity: 1 - pReserves,
        duration: pDuration
      });
    }
    if (current.freshwaterSystem?.criticalScarcityActive || current.freshwaterSystem?.dayZeroDrought?.active) {
      const fStress = assertStateProperty(current, 'freshwaterSystem.waterStress', {
        location: 'calculateDelta (activeCrises)',
        month: current.currentMonth
      });
      const fDuration = current.freshwaterSystem.dayZeroDrought
        ? assertDefined(current.freshwaterSystem.dayZeroDrought.duration, {
            location: 'calculateDelta (activeCrises)',
            valueName: 'freshwaterSystem.dayZeroDrought.duration',
            month: current.currentMonth
          })
        : 0;
      activeCrises.push({
        type: 'Freshwater',
        severity: fStress,
        duration: fDuration
      });
    }
    if (current.oceanAcidificationSystem?.coralExtinctionActive || current.oceanAcidificationSystem?.boundaryBreached) {
      const oPH = assertStateProperty(current, 'oceanAcidificationSystem.pHLevel', {
        location: 'calculateDelta (activeCrises)',
        month: current.currentMonth
      });
      activeCrises.push({
        type: 'Ocean Acidification',
        severity: 1 - oPH,
        duration: 0 // Duration not tracked in current structure
      });
    }
    if (current.novelEntitiesSystem?.reproductiveCrisisActive || current.novelEntitiesSystem?.boundaryBreached) {
      const nLoad = assertStateProperty(current, 'novelEntitiesSystem.syntheticChemicalLoad', {
        location: 'calculateDelta (activeCrises)',
        month: current.currentMonth
      });
      activeCrises.push({
        type: 'Chemical Pollution',
        severity: nLoad,
        duration: 0 // Duration not tracked in current structure
      });
    }
    delta.activeCrises = activeCrises;
  }

  // Government Metrics
  if (Math.abs(previous.governmentAIRegulation - currentSnapshot.governmentAIRegulation) > 0.01) {
    delta.governmentAIRegulation = currentSnapshot.governmentAIRegulation;
  }
  if (Math.abs(previous.governmentInvestment - currentSnapshot.governmentInvestment) > 1000000) {
    delta.governmentInvestment = currentSnapshot.governmentInvestment;
  }
  if (Math.abs(previous.governmentComprehension - currentSnapshot.governmentComprehension) > 0.01) {
    delta.governmentComprehension = currentSnapshot.governmentComprehension;
  }
  if (Math.abs(previous.internationalCooperation - currentSnapshot.internationalCooperation) > 0.01) {
    delta.internationalCooperation = currentSnapshot.internationalCooperation;
  }

  // Technology
  if (previous.deployedTechCount !== currentSnapshot.deployedTechCount) {
    delta.deployedTechCount = currentSnapshot.deployedTechCount;
    delta.deployedTechs = currentSnapshot.deployedTechs;  // Send array when count changes
  }
  if (Math.abs(previous.techRiskLevel - currentSnapshot.techRiskLevel) > 0.01) {
    delta.techRiskLevel = currentSnapshot.techRiskLevel;
  }

  // Dystopia progression
  if (Math.abs(previous.dystopiaProgression - currentSnapshot.dystopiaProgression) > 0.01) {
    delta.dystopiaProgression = currentSnapshot.dystopiaProgression;
  }

  // Upward Spirals & Outcomes
  if (previous.activeSpiralCount !== currentSnapshot.activeSpiralCount && current.upwardSpirals) {
    const activeSpirals: Array<{ type: string; strength: number; duration: number }> = [];
    const spirals = current.upwardSpirals as any;
    if (spirals.abundanceSpiral?.active) {
      const strength = assertDefined(spirals.abundanceSpiral.strength, {
        location: 'calculateDelta (activeSpirals)',
        valueName: 'abundanceSpiral.strength',
        month: current.currentMonth
      });
      const duration = assertDefined(spirals.abundanceSpiral.monthsActive, {
        location: 'calculateDelta (activeSpirals)',
        valueName: 'abundanceSpiral.monthsActive',
        month: current.currentMonth
      });
      activeSpirals.push({ type: 'Abundance', strength, duration });
    }
    if (spirals.cognitiveSpiral?.active) {
      const strength = assertDefined(spirals.cognitiveSpiral.strength, {
        location: 'calculateDelta (activeSpirals)',
        valueName: 'cognitiveSpiral.strength',
        month: current.currentMonth
      });
      const duration = assertDefined(spirals.cognitiveSpiral.monthsActive, {
        location: 'calculateDelta (activeSpirals)',
        valueName: 'cognitiveSpiral.monthsActive',
        month: current.currentMonth
      });
      activeSpirals.push({ type: 'Cognitive', strength, duration });
    }
    if (spirals.democraticSpiral?.active) {
      const strength = assertDefined(spirals.democraticSpiral.strength, {
        location: 'calculateDelta (activeSpirals)',
        valueName: 'democraticSpiral.strength',
        month: current.currentMonth
      });
      const duration = assertDefined(spirals.democraticSpiral.monthsActive, {
        location: 'calculateDelta (activeSpirals)',
        valueName: 'democraticSpiral.monthsActive',
        month: current.currentMonth
      });
      activeSpirals.push({ type: 'Democratic', strength, duration });
    }
    if (spirals.scientificSpiral?.active) {
      const strength = assertDefined(spirals.scientificSpiral.strength, {
        location: 'calculateDelta (activeSpirals)',
        valueName: 'scientificSpiral.strength',
        month: current.currentMonth
      });
      const duration = assertDefined(spirals.scientificSpiral.monthsActive, {
        location: 'calculateDelta (activeSpirals)',
        valueName: 'scientificSpiral.monthsActive',
        month: current.currentMonth
      });
      activeSpirals.push({ type: 'Scientific', strength, duration });
    }
    if (spirals.meaningSpiral?.active) {
      const strength = assertDefined(spirals.meaningSpiral.strength, {
        location: 'calculateDelta (activeSpirals)',
        valueName: 'meaningSpiral.strength',
        month: current.currentMonth
      });
      const duration = assertDefined(spirals.meaningSpiral.monthsActive, {
        location: 'calculateDelta (activeSpirals)',
        valueName: 'meaningSpiral.monthsActive',
        month: current.currentMonth
      });
      activeSpirals.push({ type: 'Meaning', strength, duration });
    }
    if (spirals.ecologicalSpiral?.active) {
      const strength = assertDefined(spirals.ecologicalSpiral.strength, {
        location: 'calculateDelta (activeSpirals)',
        valueName: 'ecologicalSpiral.strength',
        month: current.currentMonth
      });
      const duration = assertDefined(spirals.ecologicalSpiral.monthsActive, {
        location: 'calculateDelta (activeSpirals)',
        valueName: 'ecologicalSpiral.monthsActive',
        month: current.currentMonth
      });
      activeSpirals.push({ type: 'Ecological', strength, duration });
    }
    delta.activeSpirals = activeSpirals;
  }

  if (Math.abs(previous.utopiaProgress - currentSnapshot.utopiaProgress) > 0.01) {
    delta.utopiaProgress = currentSnapshot.utopiaProgress;
  }
  if (Math.abs(previous.extinctionProbability - currentSnapshot.extinctionProbability) > 0.01) {
    delta.extinctionProbability = currentSnapshot.extinctionProbability;
  }

  // Multi-Paradigm DUI
  if (Math.abs(previous.westernLiberalIndex - currentSnapshot.westernLiberalIndex) > 0.01) {
    delta.westernLiberalIndex = currentSnapshot.westernLiberalIndex;
  }
  if (Math.abs(previous.developmentIndex - currentSnapshot.developmentIndex) > 0.01) {
    delta.developmentIndex = currentSnapshot.developmentIndex;
  }
  if (Math.abs(previous.ecologicalIndex - currentSnapshot.ecologicalIndex) > 0.01) {
    delta.ecologicalIndex = currentSnapshot.ecologicalIndex;
  }
  if (Math.abs(previous.indigenousIndex - currentSnapshot.indigenousIndex) > 0.01) {
    delta.indigenousIndex = currentSnapshot.indigenousIndex;
  }

  // Always include history (for sparklines) - deep clone to avoid mutation
  delta.history = {
    westernLiberalIndex: [...metricHistory.westernLiberalIndex],
    developmentIndex: [...metricHistory.developmentIndex],
    ecologicalIndex: [...metricHistory.ecologicalIndex],
    indigenousIndex: [...metricHistory.indigenousIndex],
    qualityOfLife: [...metricHistory.qualityOfLife],
    population: [...metricHistory.population],
    climateChange: [...metricHistory.climateChange],
    biodiversityLoss: [...metricHistory.biodiversityLoss],
    resourceDepletion: [...metricHistory.resourceDepletion],
    phosphorusDepletion: [...metricHistory.phosphorusDepletion],
    freshwaterStress: [...metricHistory.freshwaterStress],
    oceanAcidification: [...metricHistory.oceanAcidification],
    novelEntitiesLevel: [...metricHistory.novelEntitiesLevel],
    pollutionLevel: [...metricHistory.pollutionLevel],
    environmentalDebtLevel: [...metricHistory.environmentalDebtLevel],
    socialCohesion: [...metricHistory.socialCohesion],
    institutionalTrust: [...metricHistory.institutionalTrust],
    meaningLevel: [...metricHistory.meaningLevel],
    governmentComprehension: [...metricHistory.governmentComprehension],
    internationalCooperation: [...metricHistory.internationalCooperation],
    governmentAIRegulation: [...metricHistory.governmentAIRegulation],
    qolTier0Avg: [...metricHistory.qolTier0Avg],
    qolTier1Avg: [...metricHistory.qolTier1Avg],
    qolTier2Avg: [...metricHistory.qolTier2Avg],
    qolTier3Avg: [...metricHistory.qolTier3Avg],
    qolTier4Avg: [...metricHistory.qolTier4Avg],
    qolTier5Avg: [...metricHistory.qolTier5Avg],
    qolGini: [...metricHistory.qolGini],
  };

  // Determine outcome type from active attractor
  if (current.outcomeMetrics) {
    const attractor = current.outcomeMetrics.activeAttractor;
    if (attractor === 'utopia') {
      delta.outcomeType = 'Utopia';
    } else if (attractor === 'dystopia') {
      delta.outcomeType = 'Dystopia';
    } else if (attractor === 'extinction') {
      delta.outcomeType = 'Extinction';
    } else {
      delta.outcomeType = 'In Progress';
    }
  }

  // Always include critical arrays for dashboards (they need full data, not just counts)
  // These arrays are essential for visualizations and must be sent every time
  delta.aiAgents = currentSnapshot.aiAgents as any; // Type assertion for lifecycleState compatibility
  delta.regionalPopulations = currentSnapshot.regionalPopulations;
  // delta.qualityOfLifeBreakdown = currentSnapshot.qualityOfLifeBreakdown; // Property doesn't exist on StateDelta
  delta.aiSufferingMetrics = currentSnapshot.aiSufferingMetrics;
  if (currentSnapshot.aiCollectives && currentSnapshot.aiCollectives.length > 0) {
    delta.aiCollectives = currentSnapshot.aiCollectives;
  }

  // Paradigm trajectory - always send full history for DUIFlowChart
  // This was missing and causing the visualization to only work on first step
  // if (currentSnapshot.paradigmTrajectory) {
  //   delta.paradigmTrajectory = currentSnapshot.paradigmTrajectory; // Property doesn't exist on StateDelta/StateSnapshot
  // }

  // TODO: Events are not currently tracked in StateSnapshot
  // Events are included in StateDelta from other sources
  // if (currentSnapshot.events && currentSnapshot.events.length > 0) {
  //   delta.events = currentSnapshot.events;
  // }

  return delta;
}

// Export type for use in main thread
export type { WorkerMessage, WorkerResponse, StateDelta };
