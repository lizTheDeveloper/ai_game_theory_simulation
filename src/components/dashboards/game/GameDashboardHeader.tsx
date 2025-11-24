'use client';

import React from 'react';
import styles from './game-dashboard.module.css';

export interface GameDashboardHeaderProps {
  gameTitle: string;
  currentMonth: string;
  elapsedMonths: number;
  activeMode: string;
  onModeChange: (mode: string) => void;
}

const modes = [
  'Overview',
  'Advocacy',
  'Research',
  'Diplomacy',
  'Emergency',
];

/**
 * Header component for the game dashboard
 * Shows title, time display, and action mode selector
 */
export function GameDashboardHeader({
  gameTitle,
  currentMonth,
  elapsedMonths,
  activeMode,
  onModeChange,
}: GameDashboardHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.gameTitle}>{gameTitle}</div>

      <div className={styles.timeDisplay}>
        <div className={styles.currentMonth}>{currentMonth}</div>
        <div className={styles.elapsedTime}>
          {elapsedMonths} month{elapsedMonths !== 1 ? 's' : ''} elapsed
        </div>
      </div>

      <div className={styles.actionModes}>
        {modes.map((mode) => (
          <button
            key={mode}
            className={`${styles.modeBtn} ${
              activeMode.toLowerCase() === mode.toLowerCase()
                ? styles.active
                : ''
            }`}
            onClick={() => onModeChange(mode.toLowerCase())}
          >
            {mode}
          </button>
        ))}
      </div>
    </header>
  );
}