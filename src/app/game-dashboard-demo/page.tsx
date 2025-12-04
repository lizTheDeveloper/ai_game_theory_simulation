'use client';

/**
 * Game Dashboard Demo Page
 *
 * Demonstrates the game dashboard connected to the GameStateProvider.
 * Features scenario selection before game starts.
 */

import React, { useState } from 'react';
import { GameStateProvider, useGameState } from '@/game/providers/GameStateProvider';
import { GameDashboard } from '@/components/dashboards/game';
import type { ResearchScenarioId } from '@/game/types';
import styles from './page.module.css';

/**
 * Scenario option for selection UI
 */
interface ScenarioOption {
  id: ResearchScenarioId;
  title: string;
  description: string;
  icon: string;
}

const SCENARIO_OPTIONS: ScenarioOption[] = [
  {
    id: 'baseline',
    title: 'Baseline',
    description: 'Consensus trajectory. Median forecasts across validated research parameters.',
    icon: 'globe',
  },
  {
    id: 'optimistic',
    title: 'Optimistic',
    description: 'Best case the evidence supports. Favorable but research-grounded assumptions.',
    icon: 'sun',
  },
  {
    id: 'pessimistic',
    title: 'Pessimistic',
    description: 'Realistic worst case. Unfavorable edges of legitimate scientific uncertainty.',
    icon: 'alert',
  },
];

/**
 * Scenario Selection Screen
 * Far-future Elysium aesthetic: black, white, glowing cyan accents
 */
function ScenarioSelector({
  onSelect,
}: {
  onSelect: (scenario: ResearchScenarioId) => void;
}) {
  const [selected, setSelected] = useState<ResearchScenarioId>('baseline');
  const [isHovering, setIsHovering] = useState<ResearchScenarioId | null>(null);

  return (
    <div className={styles.scenarioContainer}>
      <div className={styles.scenarioContent}>
        {/* Header */}
        <div className={styles.scenarioHeader}>
          <h1 className={styles.scenarioTitle}>SELECT SCENARIO</h1>
          <p className={styles.scenarioSubtitle}>
            Choose initial conditions for the simulation. These represent different edges of
            scientific uncertainty, not difficulty levels.
          </p>
        </div>

        {/* Scenario Cards */}
        <div className={styles.scenarioGrid}>
          {SCENARIO_OPTIONS.map((option) => {
            const isSelected = selected === option.id;
            const isHovered = isHovering === option.id;

            return (
              <button
                key={option.id}
                className={`${styles.scenarioCard} ${isSelected ? styles.scenarioCardSelected : ''}`}
                onClick={() => setSelected(option.id)}
                onMouseEnter={() => setIsHovering(option.id)}
                onMouseLeave={() => setIsHovering(null)}
                aria-pressed={isSelected}
              >
                {/* Icon */}
                <div className={`${styles.scenarioIcon} ${isSelected || isHovered ? styles.scenarioIconActive : ''}`}>
                  {option.icon === 'globe' && (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  )}
                  {option.icon === 'sun' && (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                  )}
                  {option.icon === 'alert' && (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  )}
                </div>

                {/* Text */}
                <h3 className={styles.scenarioCardTitle}>{option.title}</h3>
                <p className={styles.scenarioCardDesc}>{option.description}</p>

                {/* Selection indicator */}
                {isSelected && (
                  <div className={styles.scenarioSelectedIndicator}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Start Button */}
        <div className={styles.scenarioActions}>
          <button
            className={styles.startButton}
            onClick={() => onSelect(selected)}
          >
            <span className={styles.startButtonText}>BEGIN SIMULATION</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

        {/* Research note */}
        <p className={styles.scenarioNote}>
          All scenarios validated against peer-reviewed research (2024-2025).
          Outcomes emerge from model dynamics, not scripted events.
        </p>
      </div>
    </div>
  );
}

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
    isGameOver,
    aggregateMetrics,
    recentEvents,
    advanceMonth,
    setSpeed,
    queueDecision,
    queueAdvocacyAction,
    loadMockData,
  } = useGameState();

  const [activeMode, setActiveMode] = useState('overview');
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const maxMonths = 12;

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
          <div className={styles.monthCounter}>
            <span className={styles.monthLabel}>
              Month {currentMonth}/{maxMonths}
            </span>
            {isGameOver && (
              <span className={styles.gameOverBadge}>DEMO COMPLETE</span>
            )}
          </div>
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
          isGameOver={isGameOver}
          aggregateMetrics={aggregateMetrics}
          onAdvanceMonth={advanceMonth}
          onSpeedChange={handleSpeedChange}
          onModeChange={handleModeChange}
          onDecisionSelect={handleDecisionSelect}
        />
      </main>

      <footer className={styles.footer}>
        <div className={styles.debugInfo}>
          <strong>Debug Info:</strong>
          <span>Month: {currentMonth}/{maxMonths}</span>
          <span>Date: {currentMonthName} {currentYear}</span>
          <span>Events: {recentEvents.length}</span>
          <span>Mode: {activeMode}</span>
          <span>Speed: {simulationSpeed}x</span>
          {isGameOver && <span className={styles.gameOverText}>GAME OVER</span>}
        </div>
      </footer>
    </div>
  );
}

/**
 * Main page component with scenario selection flow
 */
export default function GameDashboardDemoPage() {
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<ResearchScenarioId>('baseline');

  const handleScenarioSelect = (scenario: ResearchScenarioId) => {
    setSelectedScenario(scenario);
    setGameStarted(true);
  };

  // Show scenario selector before game starts
  if (!gameStarted) {
    return <ScenarioSelector onSelect={handleScenarioSelect} />;
  }

  // Game started - render with selected scenario
  return (
    <GameStateProvider initialScenario={selectedScenario}>
      <DashboardWithState />
    </GameStateProvider>
  );
}
