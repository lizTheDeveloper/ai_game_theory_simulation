'use client';

/**
 * Game Dashboard Demo Page
 *
 * Demonstrates the game dashboard connected to the GameStateProvider.
 * Works in two modes:
 * 1. Mock mode - Uses mock data for UI testing
 * 2. Connected mode - Would connect to real simulation (future)
 */

import React, { useState } from 'react';
import { GameStateProvider, useGameState } from '@/game/providers/GameStateProvider';
import { GameDashboard } from '@/components/dashboards/game';
import styles from './page.module.css';

/**
 * Inner component that consumes game state
 */
function DashboardWithState() {
  const {
    isInitialized,
    isLoading,
    currentMonth,
    currentYear,
    currentMonthName,
    recentEvents,
    advanceMonth,
    setSpeed,
    queueDecision,
    loadMockData,
  } = useGameState();

  const [activeMode, setActiveMode] = useState('overview');
  const [simulationSpeed, setSimulationSpeed] = useState(1);

  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
  };

  const handleSpeedChange = (speed: number) => {
    setSimulationSpeed(speed);
    setSpeed(speed);
  };

  const handleDecisionSelect = (decisionId: string) => {
    queueDecision(decisionId);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Game Dashboard Demo</h1>
        <div className={styles.controls}>
          <button
            onClick={loadMockData}
            className={styles.controlButton}
          >
            Load Mock Data
          </button>
          <span className={styles.status}>
            {isInitialized ? 'Initialized' : 'Not initialized'}
            {isLoading && ' (Loading...)'}
          </span>
        </div>
      </header>

      <main className={styles.main}>
        <GameDashboard
          onAdvanceMonth={advanceMonth}
          onSpeedChange={handleSpeedChange}
          onModeChange={handleModeChange}
          onDecisionSelect={handleDecisionSelect}
        />
      </main>

      <footer className={styles.footer}>
        <div className={styles.debugInfo}>
          <strong>Debug Info:</strong>
          <span>Month: {currentMonth}</span>
          <span>Date: {currentMonthName} {currentYear}</span>
          <span>Events: {recentEvents.length}</span>
          <span>Mode: {activeMode}</span>
          <span>Speed: {simulationSpeed}x</span>
        </div>
      </footer>
    </div>
  );
}

/**
 * Main page component with provider wrapper
 */
export default function GameDashboardDemoPage() {
  return (
    <GameStateProvider initialScenario="baseline">
      <DashboardWithState />
    </GameStateProvider>
  );
}
