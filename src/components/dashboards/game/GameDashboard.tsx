'use client';

import React, { useState, useMemo, useCallback } from 'react';
import type { GameStateSnapshot, AggregateMetrics } from '@/game/types';
import { GameDashboardHeader } from './GameDashboardHeader';
import { CurrencyPanel } from './CurrencyPanel';
import { PendingDecisions } from './PendingDecisions';
import { WorldVisualization } from './WorldVisualization';
import { EventStream } from './EventStream';
import { ActionBar } from './ActionBar';
import { OutcomeScreen } from './OutcomeScreen';
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
}

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
}: GameDashboardProps) {
  const [activeMode, setActiveMode] = useState('overview');
  const [simulationSpeed, setSimulationSpeed] = useState(1);

  // Handle play again - reloads page to reset simulation
  const handlePlayAgain = useCallback(() => {
    window.location.reload();
  }, []);

  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
    onModeChange?.(mode);
  };

  const handleSpeedChange = (speed: number) => {
    setSimulationSpeed(speed);
    onSpeedChange?.(speed);
  };

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
        </div>

        <div className={styles.centerContent}>
          <PendingDecisions
            decisions={decisions}
            onDecisionSelect={onDecisionSelect}
          />
          <WorldVisualization />
        </div>

        <div className={styles.rightPanel}>
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