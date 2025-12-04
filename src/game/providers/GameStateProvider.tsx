'use client';

/**
 * GameStateProvider - React context for game state management
 *
 * Bridges the simulation engine with React components by:
 * 1. Wrapping GameSession for state management
 * 2. Using SimulationObserver for event subscriptions
 * 3. Using MetricsCollector for UI-ready metrics
 * 4. Providing callbacks for player actions
 *
 * CRITICAL: This is a read-only observer of simulation state.
 * All mutations go through queued PlayerDecisions.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';

import type {
  GameStateSnapshot,
  GameLayerEvent,
  AggregateMetrics,
  ResearchScenarioId,
} from '../types';

import { GameSession, type GameSessionConfig } from '../core/GameSession';
import { SimulationObserver } from '../observers/SimulationObserver';
import { MetricsCollector, type MetricWithTrend, type TrendDirection } from '../observers/MetricsCollector';
import { SimulationRunner } from '../core/SimulationRunner';

/**
 * Currency data for UI display
 */
export interface CurrencyData {
  name: string;
  value: number;
  max: number;
  trend: number;
  trendDirection: TrendDirection;
}

/**
 * Outcome probability distribution for UI
 */
export interface OutcomeDistribution {
  utopia: number;
  alignment: number;
  struggle: number;
  collapse: number;
  extinction: number;
  changeFromLastMonth: number;
}

/**
 * Pending decision for UI
 */
export interface PendingDecision {
  id: string;
  name: string;
  urgency: 'critical' | 'important' | 'standard';
  daysRemaining: number;
  impact: string;
}

/**
 * Game event for UI display
 */
export interface GameEventDisplay {
  id: string;
  text: string;
  severity: 'info' | 'success' | 'warning' | 'critical';
}

/**
 * Game context value
 */
export interface GameContextValue {
  // State
  gameState: GameStateSnapshot | null;
  isInitialized: boolean;
  isLoading: boolean;
  currentMonth: number;
  currentYear: number;
  currentMonthName: string;
  isGameOver: boolean;

  // Metrics for UI
  currencies: CurrencyData[];
  outcomes: OutcomeDistribution;
  aggregateMetrics: AggregateMetrics | null;
  recentEvents: GameEventDisplay[];
  pendingDecisions: PendingDecision[];

  // Actions
  advanceMonth: () => void;
  setSpeed: (speed: number) => void;
  queueDecision: (decisionId: string) => void;
  queueAdvocacyAction: (actionId: string) => void;

  // Session management
  startNewGame: (scenario: ResearchScenarioId, seed?: number) => void;
  loadMockData: () => void;
}

// Default context value
const defaultContextValue: GameContextValue = {
  gameState: null,
  isInitialized: false,
  isLoading: false,
  currentMonth: 0,
  currentYear: 2025,
  currentMonthName: 'January',
  isGameOver: false,
  currencies: [],
  outcomes: {
    utopia: 0.1,
    alignment: 0.3,
    struggle: 0.3,
    collapse: 0.2,
    extinction: 0.1,
    changeFromLastMonth: 0,
  },
  aggregateMetrics: null,
  recentEvents: [],
  pendingDecisions: [],
  advanceMonth: () => {},
  setSpeed: () => {},
  queueDecision: () => {},
  queueAdvocacyAction: () => {},
  startNewGame: () => {},
  loadMockData: () => {},
};

// Create context
const GameContext = createContext<GameContextValue>(defaultContextValue);

/**
 * Hook to access game context
 */
export function useGameState(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
}

/**
 * Month names for display
 */
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Convert month index to display values
 */
function getMonthDisplay(monthIndex: number): { year: number; monthName: string } {
  const year = 2025 + Math.floor(monthIndex / 12);
  const monthName = MONTH_NAMES[monthIndex % 12];
  return { year, monthName };
}

/**
 * Provider props
 */
interface GameStateProviderProps {
  children: ReactNode;
  /** Initial scenario (defaults to baseline) */
  initialScenario?: ResearchScenarioId;
  /** Initial seed for determinism */
  initialSeed?: number;
  /** Callback when simulation step is requested */
  onSimulationStep?: () => GameStateSnapshot | null;
  /** External state updates (for integration with real simulation) */
  externalState?: GameStateSnapshot;
  /** Max months for demo mode (default: 12) */
  maxMonths?: number;
}

/**
 * GameStateProvider component
 *
 * Wraps children with game state context.
 * Can work with mock data or real simulation.
 */
export function GameStateProvider({
  children,
  initialScenario = 'baseline',
  initialSeed,
  onSimulationStep,
  externalState,
  maxMonths = 12,
}: GameStateProviderProps) {
  // Core game objects (refs to avoid re-renders)
  const sessionRef = useRef<GameSession | null>(null);
  const observerRef = useRef<SimulationObserver | null>(null);
  const metricsRef = useRef<MetricsCollector | null>(null);
  const simulationRef = useRef<SimulationRunner | null>(null);

  // State
  const [gameState, setGameState] = useState<GameStateSnapshot | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [recentEvents, setRecentEvents] = useState<GameEventDisplay[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);

  // Initialize session and observers
  useEffect(() => {
    const seed = initialSeed ?? Math.floor(Math.random() * 0x100000000);

    const session = new GameSession({
      scenario: initialScenario,
      seed,
    });
    const observer = new SimulationObserver();
    const metrics = new MetricsCollector();
    const simulation = new SimulationRunner({
      seed,
      label: `game_${initialScenario}`,
    });

    sessionRef.current = session;
    observerRef.current = observer;
    metricsRef.current = metrics;
    simulationRef.current = simulation;

    // Set initial state from simulation
    const initialState = simulation.getState();
    session.updateSimulationState(initialState);
    observer.updateState(initialState);
    metrics.recordMetrics(initialState);
    setGameState(initialState);
    setCurrentMonth(initialState.currentMonth ?? 0);

    // Subscribe to events
    const unsubs = [
      observer.onCrisisDetected((event) => {
        addEvent({
          id: event.id,
          text: event.title,
          severity: event.severity === 'critical' ? 'critical' : 'warning',
        });
      }),
      observer.onTechnologyUnlocked((event) => {
        addEvent({
          id: event.id,
          text: event.title,
          severity: 'success',
        });
      }),
      observer.onOutcomeShift((event) => {
        addEvent({
          id: event.id,
          text: event.description,
          severity: event.direction === 'worsening' ? 'warning' : 'info',
        });
      }),
    ];

    setIsInitialized(true);

    return () => {
      unsubs.forEach((unsub) => unsub.unsubscribe());
    };
  }, [initialScenario, initialSeed]);

  // Handle external state updates
  useEffect(() => {
    if (externalState && observerRef.current && metricsRef.current && sessionRef.current) {
      sessionRef.current.updateSimulationState(externalState);
      observerRef.current.updateState(externalState);
      metricsRef.current.recordMetrics(externalState);
      setGameState(externalState);
      setCurrentMonth(externalState.currentMonth ?? 0);
    }
  }, [externalState]);

  // Add event to recent events (max 10)
  const addEvent = useCallback((event: GameEventDisplay) => {
    setRecentEvents((prev) => [event, ...prev].slice(0, 10));
  }, []);

  // Advance simulation by one month
  const advanceMonth = useCallback(() => {
    if (!sessionRef.current || !observerRef.current || !metricsRef.current || !simulationRef.current) {
      return;
    }

    if (isGameOver) {
      addEvent({
        id: `game_over_${Date.now()}`,
        text: 'Game over - demo limit reached',
        severity: 'warning',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Run simulation for 1 month
      const result = simulationRef.current.runMonth();

      // Update all observers
      sessionRef.current.updateSimulationState(result.state);
      observerRef.current.updateState(result.state);
      metricsRef.current.recordMetrics(result.state);
      setGameState(result.state);
      const newMonth = result.state.currentMonth ?? 0;
      setCurrentMonth(newMonth);

      // Add events from simulation
      result.events.forEach((event) => {
        addEvent({
          id: `sim_${Date.now()}_${Math.random()}`,
          text: event.description,
          severity: (event.severity as 'info' | 'success' | 'warning' | 'critical') ?? 'info',
        });
      });

      // Check game over
      if (result.gameOver || newMonth >= maxMonths) {
        setIsGameOver(true);
        addEvent({
          id: `demo_complete_${Date.now()}`,
          text: `Demo complete: ${newMonth} months simulated`,
          severity: 'success',
        });
      }
    } catch (error) {
      console.error('Simulation error:', error);
      addEvent({
        id: `error_${Date.now()}`,
        text: `Simulation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'critical',
      });
    }

    setIsLoading(false);
  }, [addEvent, isGameOver, maxMonths]);

  // Queue a player decision
  const queueDecision = useCallback((decisionId: string) => {
    addEvent({
      id: `decision_${Date.now()}`,
      text: `Decision queued: ${decisionId}`,
      severity: 'info',
    });
    // Legacy decision queueing - use queueAdvocacyAction instead
  }, [addEvent]);

  // Queue an advocacy action
  const queueAdvocacyAction = useCallback((actionId: string) => {
    if (!sessionRef.current) {
      addEvent({
        id: `error_${Date.now()}`,
        text: 'Cannot queue action - session not initialized',
        severity: 'critical',
      });
      return;
    }

    if (isGameOver) {
      addEvent({
        id: `error_${Date.now()}`,
        text: 'Cannot queue action - game is over',
        severity: 'warning',
      });
      return;
    }

    const result = sessionRef.current.queueAdvocacyAction(actionId);

    if (result.success) {
      addEvent({
        id: `action_${Date.now()}`,
        text: `Action queued: ${actionId}`,
        severity: 'success',
      });
    } else {
      addEvent({
        id: `action_rejected_${Date.now()}`,
        text: `Action rejected: ${result.rejectionReason ?? 'Unknown reason'}`,
        severity: 'warning',
      });
    }
  }, [addEvent, isGameOver]);

  // Start new game
  const startNewGame = useCallback((scenario: ResearchScenarioId, seed?: number) => {
    if (!sessionRef.current || !simulationRef.current) return;

    setIsLoading(true);

    // Restart simulation with new seed
    const newSeed = seed ?? Math.floor(Math.random() * 0x100000000);
    const newSimulation = new SimulationRunner({
      seed: newSeed,
      label: `game_${scenario}`,
    });
    simulationRef.current = newSimulation;

    // Reset session
    sessionRef.current.startNewGame(scenario, newSeed);

    // Set initial state
    const initialState = newSimulation.getState();
    sessionRef.current.updateSimulationState(initialState);
    if (observerRef.current) {
      observerRef.current.updateState(initialState);
    }
    if (metricsRef.current) {
      metricsRef.current.recordMetrics(initialState);
    }

    setGameState(initialState);
    setCurrentMonth(0);
    setRecentEvents([]);
    setIsGameOver(false);
    setIsLoading(false);

    addEvent({
      id: `new_game_${Date.now()}`,
      text: `Started new game: ${scenario}`,
      severity: 'success',
    });
  }, [addEvent]);

  // Load mock data for demo/testing
  const loadMockData = useCallback(() => {
    const mockEvents: GameEventDisplay[] = [
      { id: 'mock-1', text: 'Breakthrough: Enhanced Solar Efficiency', severity: 'success' },
      { id: 'mock-2', text: 'AGI-7 capabilities expanded to logistics', severity: 'info' },
      { id: 'mock-3', text: 'Social cohesion declining in Region 3', severity: 'warning' },
      { id: 'mock-4', text: 'Research collaboration established', severity: 'info' },
      { id: 'mock-5', text: 'Ocean pH dropped below 7.9', severity: 'critical' },
    ];
    setRecentEvents(mockEvents);
    setCurrentMonth(3);

    addEvent({
      id: `mock_loaded_${Date.now()}`,
      text: 'Mock data loaded',
      severity: 'info',
    });
  }, [addEvent]);

  // Compute derived values
  const { year: currentYear, monthName: currentMonthName } = getMonthDisplay(currentMonth);

  // Get aggregate metrics
  const aggregateMetrics = sessionRef.current?.getAggregateMetrics() ?? null;

  // Build currencies from metrics
  const currencies: CurrencyData[] = useCurrencies(metricsRef.current, aggregateMetrics);

  // Build outcome distribution
  const outcomes: OutcomeDistribution = useOutcomes(aggregateMetrics);

  // Build pending decisions (mock for now)
  const pendingDecisions: PendingDecision[] = usePendingDecisions();

  // Context value
  const value: GameContextValue = {
    gameState,
    isInitialized,
    isLoading,
    currentMonth,
    currentYear,
    currentMonthName,
    isGameOver,
    currencies,
    outcomes,
    aggregateMetrics,
    recentEvents,
    pendingDecisions,
    advanceMonth,
    setSpeed,
    queueDecision,
    queueAdvocacyAction,
    startNewGame,
    loadMockData,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

/**
 * Hook to build currency data from metrics
 */
function useCurrencies(
  metricsCollector: MetricsCollector | null,
  aggregateMetrics: AggregateMetrics | null
): CurrencyData[] {
  // For now, return mock currencies that could be populated from real metrics
  return [
    {
      name: 'Research',
      value: Math.round((aggregateMetrics?.aiAlignmentStatus ?? 0.5) * 240),
      max: 240,
      trend: 12,
      trendDirection: 'up' as TrendDirection,
    },
    {
      name: 'Influence',
      value: Math.round((aggregateMetrics?.influenceRemaining ?? 0.15) * 100 / 0.15),
      max: 100,
      trend: -5,
      trendDirection: 'down' as TrendDirection,
    },
    {
      name: 'Resources',
      value: Math.round((aggregateMetrics?.environmentalHealth ?? 0.5) * 100),
      max: 100,
      trend: 2,
      trendDirection: 'stable' as TrendDirection,
    },
    {
      name: 'AI Trust',
      value: Math.round((aggregateMetrics?.governanceEffectiveness ?? 0.5) * 100),
      max: 100,
      trend: 8,
      trendDirection: 'up' as TrendDirection,
    },
  ];
}

/**
 * Hook to build outcome distribution from metrics
 */
function useOutcomes(aggregateMetrics: AggregateMetrics | null): OutcomeDistribution {
  // Map outcome classification to probabilities
  const classification = aggregateMetrics?.outcomeClassification ?? 'unknown';

  // Base distribution (would come from Monte Carlo in real implementation)
  const distributions: Record<string, OutcomeDistribution> = {
    utopia: { utopia: 0.7, alignment: 0.2, struggle: 0.08, collapse: 0.015, extinction: 0.005, changeFromLastMonth: 0.05 },
    nearUtopia: { utopia: 0.4, alignment: 0.4, struggle: 0.15, collapse: 0.04, extinction: 0.01, changeFromLastMonth: 0.03 },
    prosperity: { utopia: 0.15, alignment: 0.45, struggle: 0.3, collapse: 0.08, extinction: 0.02, changeFromLastMonth: 0.02 },
    stable: { utopia: 0.1, alignment: 0.3, struggle: 0.35, collapse: 0.18, extinction: 0.07, changeFromLastMonth: 0 },
    struggling: { utopia: 0.05, alignment: 0.15, struggle: 0.4, collapse: 0.3, extinction: 0.1, changeFromLastMonth: -0.02 },
    decline: { utopia: 0.02, alignment: 0.08, struggle: 0.3, collapse: 0.4, extinction: 0.2, changeFromLastMonth: -0.03 },
    collapse: { utopia: 0.01, alignment: 0.04, struggle: 0.15, collapse: 0.5, extinction: 0.3, changeFromLastMonth: -0.05 },
    extinction: { utopia: 0, alignment: 0.01, struggle: 0.04, collapse: 0.25, extinction: 0.7, changeFromLastMonth: -0.1 },
    unknown: { utopia: 0.12, alignment: 0.34, struggle: 0.28, collapse: 0.18, extinction: 0.08, changeFromLastMonth: 0 },
  };

  return distributions[classification] ?? distributions.unknown;
}

/**
 * Hook to get pending decisions (mock for now)
 */
function usePendingDecisions(): PendingDecision[] {
  // In real implementation, would query simulation for pending junctures
  return [
    {
      id: 'decision-1',
      name: 'AI Capability Assessment Protocol',
      urgency: 'critical',
      daysRemaining: 2,
      impact: 'Will affect global AI trust and research speed',
    },
    {
      id: 'decision-2',
      name: 'Climate Emergency Response',
      urgency: 'important',
      daysRemaining: 5,
      impact: 'Impacts 3 planetary boundaries',
    },
    {
      id: 'decision-3',
      name: 'Research Priority Allocation',
      urgency: 'standard',
      daysRemaining: 10,
      impact: '+15% efficiency to chosen path',
    },
  ];
}

// Export context for testing
export { GameContext };
