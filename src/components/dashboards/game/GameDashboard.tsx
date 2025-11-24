'use client';

import React, { useState } from 'react';
import type { GameStateSnapshot } from '@/game/types';
import { GameDashboardHeader } from './GameDashboardHeader';
import { CurrencyPanel } from './CurrencyPanel';
import { PendingDecisions } from './PendingDecisions';
import { WorldVisualization } from './WorldVisualization';
import { EventStream } from './EventStream';
import { ActionBar } from './ActionBar';
import styles from './game-dashboard.module.css';

export interface GameDashboardProps {
  gameState?: GameStateSnapshot;
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
  onAdvanceMonth,
  onSpeedChange,
  onModeChange,
  onDecisionSelect,
}: GameDashboardProps) {
  const [activeMode, setActiveMode] = useState('overview');
  const [simulationSpeed, setSimulationSpeed] = useState(1);

  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
    onModeChange?.(mode);
  };

  const handleSpeedChange = (speed: number) => {
    setSimulationSpeed(speed);
    onSpeedChange?.(speed);
  };

  // Mock data for now - will be replaced with actual game state
  const mockCurrencies = [
    {
      name: 'Research',
      value: 156,
      max: 240,
      trend: 12,
      trendDirection: 'up' as const,
    },
    {
      name: 'Influence',
      value: 42,
      max: 100,
      trend: -5,
      trendDirection: 'down' as const,
    },
    {
      name: 'Resources',
      value: 88,
      max: 100,
      trend: 2,
      trendDirection: 'neutral' as const,
    },
    {
      name: 'AI Trust',
      value: 71,
      max: 100,
      trend: 8,
      trendDirection: 'up' as const,
    },
  ];

  const mockOutcomes = {
    utopia: 0.12,
    alignment: 0.34,
    struggle: 0.28,
    collapse: 0.18,
    extinction: 0.08,
    changeFromLastMonth: 0.03,
  };

  const mockDecisions = [
    {
      id: 'decision-1',
      name: 'AI Capability Assessment Protocol',
      urgency: 'critical' as const,
      daysRemaining: 2,
      impact: 'Will affect global AI trust and research speed',
    },
    {
      id: 'decision-2',
      name: 'Climate Emergency Response',
      urgency: 'important' as const,
      daysRemaining: 5,
      impact: 'Impacts 3 planetary boundaries',
    },
    {
      id: 'decision-3',
      name: 'Research Priority Allocation',
      urgency: 'standard' as const,
      daysRemaining: 10,
      impact: '+15% efficiency to chosen path',
    },
  ];

  const mockEvents = [
    {
      id: 'event-1',
      text: 'Breakthrough: Enhanced Solar Efficiency',
      severity: 'success' as const,
    },
    {
      id: 'event-2',
      text: 'AGI-7 capabilities expanded to logistics',
      severity: 'info' as const,
    },
    {
      id: 'event-3',
      text: 'Social cohesion declining in Region 3',
      severity: 'warning' as const,
    },
    {
      id: 'event-4',
      text: 'Research collaboration established',
      severity: 'info' as const,
    },
    {
      id: 'event-5',
      text: 'Ocean pH dropped below 7.9',
      severity: 'critical' as const,
    },
  ];

  const mockNextMonth = [
    'UN Climate Summit decision window opens',
    'First quantum computing milestone expected',
    'Phosphorus crisis may trigger',
  ];

  return (
    <div className={styles.dashboard}>
      <GameDashboardHeader
        gameTitle="Super-Alignment to Utopia"
        currentMonth="March 2025"
        elapsedMonths={3}
        activeMode={activeMode}
        onModeChange={handleModeChange}
      />

      <div className={styles.mainContent}>
        <div className={styles.leftPanel}>
          <CurrencyPanel
            currencies={mockCurrencies}
            outcomes={mockOutcomes}
          />
        </div>

        <div className={styles.centerContent}>
          <PendingDecisions
            decisions={mockDecisions}
            onDecisionSelect={onDecisionSelect}
          />
          <WorldVisualization />
        </div>

        <div className={styles.rightPanel}>
          <EventStream
            events={mockEvents}
            nextMonthPreview={mockNextMonth}
          />
        </div>
      </div>

      <ActionBar
        simulationSpeed={simulationSpeed}
        onSpeedChange={handleSpeedChange}
        onAdvanceMonth={onAdvanceMonth}
      />
    </div>
  );
}