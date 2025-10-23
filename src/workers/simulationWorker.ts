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
console.log = () => {}; // Suppress simulation logs
console.warn = () => {}; // Suppress warnings
// Keep console.error for critical issues
self.addEventListener('error', (e) => {
  originalLog('[Worker Error]', e.message, e.filename, e.lineno);
});

import { SimulationEngine } from '../simulation/engine';
import { createDefaultInitialState } from '../simulation/initialization';
import type { GameState } from '../types/game';
import type { ScenarioMode } from '../types/game';

// Worker state
let engine: SimulationEngine | null = null;
let state: GameState | null = null;
let running = false;
let simulationIntervalId: ReturnType<typeof setInterval> | null = null; // Monthly simulation steps
let dayIntervalId: ReturnType<typeof setInterval> | null = null; // Daily UI updates
let stepInterval = 30000; // 30 seconds = 1 month (each month takes 30 seconds)

// Calendar tracking
let currentDay = 1; // Current day of month (1-31)
let startDate: Date | null = null; // Real calendar start date

// Previous state snapshot for delta calculation (expanded)
interface StateSnapshot {
  currentMonth: number;
  qualityOfLife: number;
  population: number;
  aiCount: number;
  dystopiaProgression: number;
  avgAICapability: number;
  deployedTechCount: number;

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
}

let previousState: StateSnapshot | null = null;
let isFirstStep = false; // Force full delta on first step after start

// Message types from main thread
type WorkerMessage =
  | { type: 'init'; seed: number; scenario?: ScenarioMode; interval?: number }
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
  | { type: 'error'; error: string };

// Minimal initial state snapshot (not full state)
interface InitialStateSnapshot {
  currentMonth: number;
  qualityOfLife: number;
  population: number;
  aiCount: number;
  scenario: ScenarioMode;
}

// Delta contains only changed fields (expanded for comprehensive dashboard)
interface StateDelta {
  // Core metrics
  currentMonth?: number;
  qualityOfLife?: number;
  population?: number;
  aiCount?: number;

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
        handleInit(msg.seed, msg.scenario, msg.interval);
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

function handleInit(seed: number, scenario?: ScenarioMode, interval?: number) {
  if (engine || state) {
    throw new Error('Already initialized. Create a new worker to reinitialize.');
  }

  // Create engine with seed (use 'summary' log level for minimal logging)
  engine = new SimulationEngine({ seed, maxMonths: Infinity, logLevel: 'summary' });

  // Create initial state
  state = createDefaultInitialState(scenario || 'historical');

  // Set speed if provided
  if (interval !== undefined) {
    stepInterval = interval;
  }

  // Initialize calendar to today's date
  startDate = new Date();
  currentDay = 1;

  // Create initial snapshot
  const snapshot: InitialStateSnapshot = {
    currentMonth: state.currentMonth,
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
  if (!engine || !state) {
    throw new Error('Not initialized');
  }

  performStep();
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

  // Player decision injection (Phase 3 - future work)
  // For now, just log
  console.log('[Worker] Player decision received:', decision);

  // TODO: Inject into state before next step
  // This would go into a PlayerDecisionPhase (order 8.5)
}

function startSimulationLoop() {
  // Clear any existing intervals
  if (simulationIntervalId !== null) {
    clearInterval(simulationIntervalId);
  }
  if (dayIntervalId !== null) {
    clearInterval(dayIntervalId);
  }

  // Reset day counter to 1 at start of new month
  currentDay = 1;

  // Calculate days in current month (approximate to 30 for now)
  const daysInMonth = 30;

  // Start day counter (updates every second)
  dayIntervalId = setInterval(() => {
    if (!running || !startDate) {
      if (dayIntervalId !== null) {
        clearInterval(dayIntervalId);
        dayIntervalId = null;
      }
      return;
    }

    // Increment day
    currentDay++;
    if (currentDay > daysInMonth) {
      currentDay = daysInMonth; // Cap at end of month
    }

    // Calculate actual calendar date
    const monthsElapsed = state?.currentMonth || 0;
    const calendarDate = new Date(startDate);
    calendarDate.setMonth(calendarDate.getMonth() + monthsElapsed);
    calendarDate.setDate(currentDay);

    // Send day update to UI
    self.postMessage({
      type: 'dayUpdate',
      day: currentDay,
      calendarDate: calendarDate.toISOString()
    } as WorkerResponse);
  }, 1000); // Update every second

  // Start simulation step interval (runs actual simulation)
  simulationIntervalId = setInterval(() => {
    if (!running || !engine || !state) {
      if (simulationIntervalId !== null) {
        clearInterval(simulationIntervalId);
        simulationIntervalId = null;
      }
      return;
    }

    // Reset day to 1 for new month
    currentDay = 1;

    // Perform simulation step
    performStep();
  }, stepInterval); // Default 30 seconds = 1 month
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

  // Calculate calendar date
  const monthsElapsed = state.currentMonth;
  const calendarDate = new Date(startDate!);
  calendarDate.setMonth(calendarDate.getMonth() + monthsElapsed);
  calendarDate.setDate(currentDay);

  // Send update to main thread
  self.postMessage({
    type: 'update',
    delta,
    month: state.currentMonth,
    day: currentDay,
    calendarDate: calendarDate.toISOString(),
    timestamp: Date.now()
  } as WorkerResponse);
}

function captureStateSnapshot(state: GameState): StateSnapshot {
  // Capture only fields we need for delta calculation
  // Don't deep clone entire 1.78MB state (too expensive)

  // Calculate AI metrics
  const avgAICapability = state.aiAgents.length > 0
    ? state.aiAgents.reduce((sum, ai) => sum + (ai.capability || 0), 0) / state.aiAgents.length
    : 0;

  // Alignment is a number [0,1], where >= 0.5 is aligned
  const alignedAICount = state.aiAgents.filter(ai => ai.alignment >= 0.5).length;
  const misalignedAICount = state.aiAgents.filter(ai => ai.alignment < 0.5).length;
  const sleeperAgentCount = state.aiAgents.filter(ai => ai.sleeperAgent).length;

  // Environmental metrics
  // Climate: temperatureAnomaly in °C, normalize to [0,1] where 1 = 4°C (catastrophic)
  const climateChange = Math.min(1, (state.resourceEconomy?.co2?.temperatureAnomaly || 0) / 4);
  const resourceDepletion = state.resourceEconomy?.totalResourceSecurity || 1.0; // [0,1] Overall resource availability
  // Note: populationPercentage is stored as 60 (meaning 60%), need to normalize to 0.6 for formatPercent() in UI
  const biodiversityLoss = (state.specificTippingPoints?.pollinators?.populationPercentage || 100) / 100;
  // Pollution from novel entities system (PFAS, microplastics, etc.)
  const pollutionLevel = state.novelEntitiesSystem?.pollutionLevel || 0;
  const environmentalDebtLevel = state.environmentalAccumulation?.totalDebt || 0;

  // Count planetary boundaries crossed (using correct boundary names from types)
  let planetaryBoundariesCrossed = 0;
  if (state.planetaryBoundariesSystem?.boundaries) {
    const boundaries = state.planetaryBoundariesSystem.boundaries;
    const isCrossed = (status: string) => status === 'beyond_boundary' || status === 'high_risk';

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
  const socialCohesion = state.socialAccumulation?.socialCohesion || 1.0;
  const institutionalTrust = state.socialAccumulation?.institutionalLegitimacy || 1.0;
  const meaningLevel = state.socialAccumulation?.meaningAlignment || 1.0;
  const socialDebtLevel = state.socialAccumulation?.totalDebt || 0;

  // Crisis metrics
  const phosphorusDepletion = state.phosphorusSystem?.depletionLevel || 0;
  const freshwaterStress = state.freshwaterSystem?.stressLevel || 0;
  const oceanAcidification = state.oceanAcidificationSystem?.phLevel || 8.2;
  const novelEntitiesLevel = state.novelEntitiesSystem?.pollutionLevel || 0;

  // Count active crises
  let activeCrisesCount = 0;
  if (state.phosphorusSystem?.crisis) activeCrisesCount++;
  if (state.freshwaterSystem?.crisis) activeCrisesCount++;
  if (state.oceanAcidificationSystem?.crisis) activeCrisesCount++;
  if (state.novelEntitiesSystem?.crisis) activeCrisesCount++;

  // Government metrics
  const governmentAIRegulation = (state.government.capabilityToControl || 0) / 10; // Normalize [0,10] to [0,1]
  const governmentInvestment = state.government.alignmentResearchInvestment || 0; // [0,10]
  const governmentComprehension = (state.government.oversightLevel || 0) / 10; // Normalize [0,10] to [0,1]
  const internationalCooperation = state.government.structuralChoices?.internationalCoordination ? 1 : 0;

  // Technology metrics
  const deployedTechCount = state.techTreeState?.techDeployedCount || 0;
  const techRiskLevel = state.technologicalRisk?.totalRisk || 0;

  // Upward spiral metrics
  const activeSpiralCount = state.upwardSpirals ?
    Object.values(state.upwardSpirals).filter((spiral: any) => spiral.active).length : 0;
  const utopiaProgress = state.upwardSpirals?.overallProgress || 0;

  // Outcome metrics
  const extinctionProbability = state.outcomeMetrics?.extinctionProbability || 0;

  // Multi-Paradigm DUI
  const westernLiberalIndex = state.multiParadigmDUI?.westernLiberal?.index || 0;
  const developmentIndex = state.multiParadigmDUI?.development?.index || 0;
  const ecologicalIndex = state.multiParadigmDUI?.ecological?.index || 0;
  const indigenousIndex = state.multiParadigmDUI?.indigenous?.index || 0;

  return {
    currentMonth: state.currentMonth,
    qualityOfLife: state.globalMetrics.qualityOfLife,
    population: state.humanPopulationSystem.population,
    aiCount: state.aiAgents.length,
    dystopiaProgression: state.globalMetrics.dystopiaProgression,
    avgAICapability,
    deployedTechCount,
    alignedAICount,
    misalignedAICount,
    sleeperAgentCount,
    climateChange,
    resourceDepletion,
    biodiversityLoss,
    pollutionLevel,
    planetaryBoundariesCrossed,
    environmentalDebtLevel,
    socialCohesion,
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
    indigenousIndex
  };
}

function calculateDelta(previous: StateSnapshot, current: GameState): StateDelta {
  const delta: StateDelta = {};

  // Capture current state snapshot for comparison
  const currentSnapshot = captureStateSnapshot(current);

  // On first step, force-send all metrics regardless of change
  if (isFirstStep) {
    return { ...currentSnapshot } as StateDelta;
  }

  // Core metrics - always include month
  if (previous.currentMonth !== currentSnapshot.currentMonth) {
    delta.currentMonth = currentSnapshot.currentMonth;
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
    const activeCrises = [];
    if (current.phosphorusSystem?.crisis) {
      activeCrises.push({
        type: 'Phosphorus',
        severity: current.phosphorusSystem.depletionLevel || 0,
        duration: current.phosphorusSystem.crisisDuration || 0
      });
    }
    if (current.freshwaterSystem?.crisis) {
      activeCrises.push({
        type: 'Freshwater',
        severity: current.freshwaterSystem.stressLevel || 0,
        duration: current.freshwaterSystem.crisisDuration || 0
      });
    }
    if (current.oceanAcidificationSystem?.crisis) {
      activeCrises.push({
        type: 'Ocean Acidification',
        severity: 8.2 - (current.oceanAcidificationSystem.phLevel || 8.2),
        duration: current.oceanAcidificationSystem.crisisDuration || 0
      });
    }
    if (current.novelEntitiesSystem?.crisis) {
      activeCrises.push({
        type: 'Chemical Pollution',
        severity: current.novelEntitiesSystem.pollutionLevel || 0,
        duration: current.novelEntitiesSystem.crisisDuration || 0
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
    const activeSpirals = [];
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

  // Determine outcome type
  if (current.outcomeMetrics) {
    delta.outcomeType = current.outcomeMetrics.finalOutcome || 'In Progress';
  }

  return delta;
}

// Export type for use in main thread
export type { WorkerMessage, WorkerResponse, StateDelta };
