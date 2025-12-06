'use client';

import React, { useState, useMemo, useCallback } from 'react';
import type { GameStateSnapshot, AggregateMetrics, ResearchScenarioId, InfluenceDomain } from '@/game/types';
import { GameDashboardHeader } from './GameDashboardHeader';
import { CurrencyPanel } from './CurrencyPanel';
import { PendingDecisions } from './PendingDecisions';
import { WorldVisualization } from './WorldVisualization';
import { EventStream } from './EventStream';
import { ActionBar } from './ActionBar';
import { OutcomeScreen } from './OutcomeScreen';
import { ActionPanel, type PlayerResources, type ActiveCooldowns } from './ActionPanel';
import { ScenarioPicker } from './ScenarioPicker';
import {
  mapCurrencies,
  mapOutcomes,
  mapEvents,
  mapNextMonthPreview,
  mapPendingDecisions,
  formatCurrentMonth,
  getElapsedMonths,
} from './stateMappers';
import styles from './game-dashboard.module.css';

export interface GameDashboardProps {
  gameState?: GameStateSnapshot;
  aggregateMetrics?: AggregateMetrics | null;
  isGameOver?: boolean;
  onAdvanceMonth?: () => void;
  onSpeedChange?: (speed: number) => void;
  onModeChange?: (mode: string) => void;
  onDecisionSelect?: (decisionId: string) => void;
  /** Callback when advocacy action is queued */
  onQueueAction?: (actionId: string) => void;
  /** Callback when scenario is changed */
  onScenarioChange?: (scenario: ResearchScenarioId) => void;
  /** Current player resources */
  playerResources?: PlayerResources;
  /** Active cooldowns */
  activeCooldowns?: ActiveCooldowns;
  /** Influence spent by domain */
  influenceByDomain?: Record<InfluenceDomain, number>;
  /** Total influence spent */
  totalInfluenceSpent?: number;
  /** Current scenario */
  currentScenario?: ResearchScenarioId;
}

/**
 * Default player resources
 */
const DEFAULT_RESOURCES: PlayerResources = {
  reputation: 100,
  politicalCapital: 100,
  funding: 0,
};

/**
 * Default influence by domain
 */
const DEFAULT_INFLUENCE: Record<InfluenceDomain, number> = {
  ai_policy: 0,
  climate_action: 0,
  social_cohesion: 0,
  international_cooperation: 0,
  research_direction: 0,
};

/**
 * Main game dashboard component
 * Far-future aesthetic inspired by Elysium/Arrival
 */
export function GameDashboard({
  gameState,
  aggregateMetrics,
  isGameOver = false,
  onAdvanceMonth,
  onSpeedChange,
  onModeChange,
  onDecisionSelect,
  onQueueAction,
  onScenarioChange,
  playerResources = DEFAULT_RESOURCES,
  activeCooldowns = {},
  influenceByDomain = DEFAULT_INFLUENCE,
  totalInfluenceSpent = 0,
  currentScenario = 'baseline',
}: GameDashboardProps) {
  const [activeMode, setActiveMode] = useState('overview');
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [showActionPanel, setShowActionPanel] = useState(true);
  const [showScenarioPicker, setShowScenarioPicker] = useState(false);

  // Handle play again - reloads page to reset simulation
  const handlePlayAgain = useCallback(() => {
    window.location.reload();
  }, []);

  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
    onModeChange?.(mode);
    // Show scenario picker in 'scenarios' mode
    if (mode === 'scenarios') {
      setShowScenarioPicker(true);
    } else {
      setShowScenarioPicker(false);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setSimulationSpeed(speed);
    onSpeedChange?.(speed);
  };

  // Handle action queueing
  const handleQueueAction = useCallback((actionId: string) => {
    onQueueAction?.(actionId);
  }, [onQueueAction]);

  // Handle scenario change
  const handleScenarioChange = useCallback((scenario: ResearchScenarioId) => {
    onScenarioChange?.(scenario);
  }, [onScenarioChange]);

  // Get current month for cooldown calculations
  const currentMonth = gameState?.currentMonth ?? 0;

  // Map game state to UI display formats using memoization for performance
  // Falls back to sensible defaults when gameState is undefined
  const currencies = useMemo(() => mapCurrencies(gameState), [gameState]);
  const outcomes = useMemo(() => mapOutcomes(gameState), [gameState]);
  const decisions = useMemo(() => mapPendingDecisions(gameState), [gameState]);
  const events = useMemo(() => mapEvents(gameState, 10), [gameState]);
  const nextMonthPreview = useMemo(() => mapNextMonthPreview(gameState), [gameState]);

  // Header data
  const currentMonthDisplay = useMemo(() => formatCurrentMonth(gameState), [gameState]);
  const elapsedMonths = useMemo(() => getElapsedMonths(gameState), [gameState]);

  return (
    <div className={styles.dashboard}>
      <GameDashboardHeader
        gameTitle="Super-Alignment to Utopia"
        currentMonth={currentMonthDisplay}
        elapsedMonths={elapsedMonths}
        activeMode={activeMode}
        onModeChange={handleModeChange}
      />

      <div className={styles.mainContent}>
        <div className={styles.leftPanel}>
          <CurrencyPanel
            currencies={currencies}
            outcomes={outcomes}
          />
          {/* Compact scenario indicator */}
          <ScenarioPicker
            selectedScenario={currentScenario}
            onScenarioChange={handleScenarioChange}
            compact={true}
            canChange={currentMonth === 0}
          />
        </div>

        <div className={styles.centerContent}>
          {/* Scenario picker modal */}
          {showScenarioPicker && (
            <div className={styles.scenarioModal}>
              <ScenarioPicker
                selectedScenario={currentScenario}
                onScenarioChange={handleScenarioChange}
                canChange={currentMonth === 0}
              />
            </div>
          )}
          <PendingDecisions
            decisions={decisions}
            onDecisionSelect={onDecisionSelect}
          />
          <WorldVisualization />
        </div>

        <div className={styles.rightPanel}>
          {/* Action Panel - Player Advocacy Actions */}
          {showActionPanel && onQueueAction && (
            <ActionPanel
              resources={playerResources}
              currentMonth={currentMonth}
              activeCooldowns={activeCooldowns}
              influenceByDomain={influenceByDomain}
              totalInfluenceSpent={totalInfluenceSpent}
              onQueueAction={handleQueueAction}
              collapsed={false}
              onToggleCollapse={() => setShowActionPanel(!showActionPanel)}
            />
          )}
          {/* Collapsed action panel toggle */}
          {!showActionPanel && onQueueAction && (
            <button
              className={styles.actionPanelToggle}
              onClick={() => setShowActionPanel(true)}
            >
              + Actions
            </button>
          )}
          <EventStream
            events={events}
            nextMonthPreview={nextMonthPreview}
          />
        </div>
      </div>

      <ActionBar
        simulationSpeed={simulationSpeed}
        onSpeedChange={handleSpeedChange}
        onAdvanceMonth={onAdvanceMonth}
      />

      {/* Outcome screen overlay when game is over */}
      {isGameOver && (
        <OutcomeScreen
          metrics={aggregateMetrics ?? null}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}