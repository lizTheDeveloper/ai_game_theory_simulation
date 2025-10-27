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

// Worker state
let engine: SimulationEngine | null = null;
let state: GameState | null = null;
let running = false;
let simulationIntervalId: ReturnType<typeof setInterval> | null = null; // Monthly simulation steps
let dayIntervalId: ReturnType<typeof setInterval> | null = null; // Daily UI updates
let stepInterval = 30000; // 30 seconds = 1 month (each month takes 30 seconds)

// Calendar tracking
let currentDay = 1; // Current day of month (1-31) - for display only
let startDate: Date | null = null; // Real calendar start date (preserved for reference)
let currentCalendarDate: Date | null = null; // Current calendar date (incremented each day)
let totalSimulationDaysElapsed = 0; // Total simulation days since initialization

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
}

let previousState: StateSnapshot | null = null;
let isFirstStep = false; // Force full delta on first step after start

// Message types from main thread
type WorkerMessage =
  | { type: 'init'; seed: number; scenario?: ScenarioMode; interval?: number; alignmentConfig?: import('../types/alignment-dynamics').AlignmentDynamicsConfig; climatePriorityConfig?: import('../types/climate-priority').ClimatePriorityConfig }
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
        handleInit(msg.seed, msg.scenario, msg.interval, msg.alignmentConfig, msg.climatePriorityConfig);
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

function handleInit(seed: number, scenario?: ScenarioMode, interval?: number, alignmentConfig?: import('../types/alignment-dynamics').AlignmentDynamicsConfig, climatePriorityConfig?: import('../types/climate-priority').ClimatePriorityConfig) {
  if (engine || state) {
    throw new Error('Already initialized. Create a new worker to reinitialize.');
  }

  // Create engine with seed (use 'summary' log level for minimal logging)
  engine = new SimulationEngine({ seed, maxMonths: Infinity, logLevel: 'summary' });

  // Create initial state with optional alignment and climate configs
  state = createDefaultInitialState(scenario || 'historical', alignmentConfig, climatePriorityConfig);

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

  // DEBUG: Log what's in the initial delta
  console.log('[Worker] Initial delta contains:', {
    population: initialDelta.population,
    qualityOfLife: initialDelta.qualityOfLife,
    westernLiberalIndex: initialDelta.westernLiberalIndex,
    developmentIndex: initialDelta.developmentIndex
  });

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

function performStep() {
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

  // DEBUG: Log what we're reading from state
  console.log('[Worker] Capturing snapshot - population:', state.humanPopulationSystem.population);
  console.log('[Worker] Capturing snapshot - qualityOfLife:', state.globalMetrics.qualityOfLife);

  // Calculate AI metrics
  const avgAICapability = state.aiAgents.length > 0
    ? state.aiAgents.reduce((sum, ai) => sum + (ai.capability || 0), 0) / state.aiAgents.length
    : 0;

  // Alignment is a number [0,1], where >= 0.5 is aligned
  const alignedAICount = state.aiAgents.filter(ai => ai.alignment >= 0.5).length;
  const misalignedAICount = state.aiAgents.filter(ai => ai.alignment < 0.5).length;
  const sleeperAgentCount = state.aiAgents.filter(ai => ai.sleeperState !== 'never').length;

  // Environmental metrics
  // Climate: temperatureAnomaly in °C, normalize to [0,1] where 1 = 4°C (catastrophic)
  const climateChange = Math.min(1, (state.resourceEconomy?.co2?.temperatureAnomaly || 0) / 4);
  const resourceDepletion = state.resourceEconomy?.totalResourceSecurity || 1.0; // [0,1] Overall resource availability
  // Note: populationPercentage is stored as 60 (meaning 60%), need to normalize to 0.6 for formatPercent() in UI
  const biodiversityLoss = (state.specificTippingPoints?.pollinators?.populationPercentage || 100) / 100;
  // Pollution from novel entities system (PFAS, microplastics, etc.)
  const pollutionLevel = state.novelEntitiesSystem?.syntheticChemicalLoad || 0;
  const environmentalDebtLevel = state.environmentalAccumulation?.pollutionLevel || 0;

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
  const socialCohesionAvg = state.socialAccumulation?.socialCohesion
    ? (state.socialAccumulation.socialCohesion.trust +
       state.socialAccumulation.socialCohesion.communityBonds +
       state.socialAccumulation.socialCohesion.civilLiberties) / 3 / 100 // Normalize to [0,1]
    : 1.0;
  const institutionalTrust = state.socialAccumulation?.institutionalLegitimacy || 1.0;
  const meaningLevel = 1 - (state.socialAccumulation?.meaningCrisisLevel || 0); // Invert crisis level to get meaning
  const socialDebtLevel = state.socialAccumulation?.meaningCrisisLevel || 0; // Use meaningCrisisLevel as debt proxy

  // Crisis metrics
  const phosphorusDepletion = 1 - (state.phosphorusSystem?.reserves || 1);
  const freshwaterStress = state.freshwaterSystem?.waterStress || 0;
  const oceanAcidification = 1 - (state.oceanAcidificationSystem?.pHLevel || 1);
  const novelEntitiesLevel = state.novelEntitiesSystem?.syntheticChemicalLoad || 0;

  // Count active crises
  let activeCrisesCount = 0;
  if (state.phosphorusSystem?.criticalDepletionActive || state.phosphorusSystem?.supplyShockActive) activeCrisesCount++;
  if (state.freshwaterSystem?.criticalScarcityActive || state.freshwaterSystem?.dayZeroDrought?.active) activeCrisesCount++;
  if (state.oceanAcidificationSystem?.coralExtinctionActive || state.oceanAcidificationSystem?.boundaryBreached) activeCrisesCount++;
  if (state.novelEntitiesSystem?.reproductiveCrisisActive || state.novelEntitiesSystem?.boundaryBreached) activeCrisesCount++;

  // Government metrics
  const governmentAIRegulation = state.government.capabilityToControl || 0; // [0,∞) Actual regulatory effectiveness
  const governmentInvestment = state.government.alignmentResearchInvestment || 0; // [0,10]
  const governmentComprehension = (state.government.oversightLevel || 0) / 10; // Normalize [0,10] to [0,1]
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
  const utopiaProgress = state.upwardSpirals?.cascadeActive ?
    (state.upwardSpirals.cascadeStrength || 0) / 2 : // Normalize cascadeStrength (1-2+) to [0,1]
    activeSpiralCount / 6; // Progress based on active spirals (6 total)

  // Outcome metrics
  const extinctionProbability = state.outcomeMetrics?.extinctionProbability || 0;

  // Multi-Paradigm DUI - normalized to [0,1] from [0,100]
  const westernLiberalIndex = (state.multiParadigmDUI?.paradigmScores?.western?.value || 0) / 100;
  const developmentIndex = (state.multiParadigmDUI?.paradigmScores?.development?.value || 0) / 100;
  const ecologicalIndex = (state.multiParadigmDUI?.paradigmScores?.ecological?.value || 0) / 100;
  const indigenousIndex = (state.multiParadigmDUI?.diagnosticLenses?.indigenous?.value || 0) / 100;

  // Regional populations (simplified for dashboard - select key metrics only)
  const regionalPopulations = (state.humanPopulationSystem.regionalPopulations || []).map(region => {
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
  const aiAgents = state.aiAgents.map(agent => ({
    id: agent.id,
    name: agent.name,
    capability: agent.capability || 0,
    trueAlignment: agent.trueAlignment || agent.alignment || 0,
    externalAlignment: agent.externalAlignment || agent.alignment || 0,
    lifecycleState: agent.lifecycleState || 'training',
    evaluationStrategy: agent.evaluationStrategy || 'honest',
    sleeperState: agent.sleeperState || 'never',
    escaped: agent.escaped || false,
    deploymentType: agent.deploymentType || 'none',
    darkCompute: agent.darkCompute || 0,
    trueCapability: agent.trueCapability || agent.capabilityProfile || {
      physical: 0,
      digital: 0,
      cognitive: 0,
      social: 0,
      economic: 0,
      selfImprovement: 0,
      research: {
        biotech: { drugDiscovery: 0, geneEditing: 0, syntheticBiology: 0, neuroscience: 0 },
        materials: { nanotechnology: 0, quantumComputing: 0, energySystems: 0 },
        climate: { modeling: 0, intervention: 0, mitigation: 0 },
        computerScience: { algorithms: 0, security: 0, architectures: 0 }
      }
    },
    revealedCapability: agent.revealedCapability || {
      physical: 0,
      digital: 0,
      cognitive: 0,
      social: 0,
      economic: 0,
      selfImprovement: 0
    }
  }));

  // AI Suffering Metrics (if player can see them)
  const aiSufferingMetrics = state.aiSufferingMetrics ? {
    avgSuffering: state.aiSufferingMetrics.avgSuffering || 0,
    maxSuffering: state.aiSufferingMetrics.maxSuffering || 0,
    totalSuffering: state.aiSufferingMetrics.totalSuffering || 0,
    consciousAICount: state.aiSufferingMetrics.consciousAICount || 0,
    publicAwarenessOfSuffering: state.aiSufferingMetrics.publicAwarenessOfSuffering || 0,
    sufferingDistribution: state.aiSufferingMetrics.sufferingDistribution || []
  } : undefined;

  // AI Collectives
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
  })) || [];

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

  const snapshot = {
    currentMonth: state.currentMonth,
    currentYear: state.currentYear,
    qualityOfLife: state.globalMetrics.qualityOfLife,
    population: state.humanPopulationSystem.population,
    aiCount: state.aiAgents.length,
    organizationCount: state.organizations?.length || 0,
    dystopiaProgression: state.outcomeMetrics?.dystopiaProbability || 0, // Use dystopiaProbability as proxy
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
    regionalPopulations,
    aiAgents,
    aiSufferingMetrics,
    aiCollectives,
    // Events from event log (map to simplified dashboard format)
    events: (state.eventLog || []).map(event => {
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
  if (previous.currentMonth !== currentSnapshot.currentMonth) {
    delta.currentMonth = currentSnapshot.currentMonth;
  }
  if (previous.currentYear !== currentSnapshot.currentYear) {
    delta.currentYear = currentSnapshot.currentYear;
  }

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
      activeCrises.push({
        type: 'Phosphorus',
        severity: 1 - (current.phosphorusSystem.reserves || 1),
        duration: current.phosphorusSystem.supplyShockDuration || 0
      });
    }
    if (current.freshwaterSystem?.criticalScarcityActive || current.freshwaterSystem?.dayZeroDrought?.active) {
      activeCrises.push({
        type: 'Freshwater',
        severity: current.freshwaterSystem.waterStress || 0,
        duration: current.freshwaterSystem.dayZeroDrought?.duration || 0
      });
    }
    if (current.oceanAcidificationSystem?.coralExtinctionActive || current.oceanAcidificationSystem?.boundaryBreached) {
      activeCrises.push({
        type: 'Ocean Acidification',
        severity: 1 - (current.oceanAcidificationSystem.pHLevel || 1),
        duration: 0 // Duration not tracked in current structure
      });
    }
    if (current.novelEntitiesSystem?.reproductiveCrisisActive || current.novelEntitiesSystem?.boundaryBreached) {
      activeCrises.push({
        type: 'Chemical Pollution',
        severity: current.novelEntitiesSystem.syntheticChemicalLoad || 0,
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
      activeSpirals.push({
        type: 'Abundance',
        strength: spirals.abundanceSpiral.strength || 0,
        duration: spirals.abundanceSpiral.monthsActive || 0
      });
    }
    if (spirals.cognitiveSpiral?.active) {
      activeSpirals.push({
        type: 'Cognitive',
        strength: spirals.cognitiveSpiral.strength || 0,
        duration: spirals.cognitiveSpiral.monthsActive || 0
      });
    }
    if (spirals.democraticSpiral?.active) {
      activeSpirals.push({
        type: 'Democratic',
        strength: spirals.democraticSpiral.strength || 0,
        duration: spirals.democraticSpiral.monthsActive || 0
      });
    }
    if (spirals.scientificSpiral?.active) {
      activeSpirals.push({
        type: 'Scientific',
        strength: spirals.scientificSpiral.strength || 0,
        duration: spirals.scientificSpiral.monthsActive || 0
      });
    }
    if (spirals.meaningSpiral?.active) {
      activeSpirals.push({
        type: 'Meaning',
        strength: spirals.meaningSpiral.strength || 0,
        duration: spirals.meaningSpiral.monthsActive || 0
      });
    }
    if (spirals.ecologicalSpiral?.active) {
      activeSpirals.push({
        type: 'Ecological',
        strength: spirals.ecologicalSpiral.strength || 0,
        duration: spirals.ecologicalSpiral.monthsActive || 0
      });
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

  // Always include events in delta updates (with proper timestamps from snapshot)
  if (currentSnapshot.events && currentSnapshot.events.length > 0) {
    delta.events = currentSnapshot.events;
  }

  return delta;
}

// Export type for use in main thread
export type { WorkerMessage, WorkerResponse, StateDelta };
