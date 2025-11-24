'use client';

import React from 'react';
import styles from './game-dashboard.module.css';

export interface ActionBarProps {
  simulationSpeed: number;
  onSpeedChange: (speed: number) => void;
  onAdvanceMonth?: () => void;
  onReviewDecisions?: () => void;
  onOpenResearch?: () => void;
}

/**
 * Bottom action bar with simulation controls
 */
export function ActionBar({
  simulationSpeed,
  onSpeedChange,
  onAdvanceMonth,
  onReviewDecisions,
  onOpenResearch,
}: ActionBarProps) {
  const speeds = [
    { value: 0, label: '||', name: 'Paused' },
    { value: 1, label: '▶', name: 'Normal' },
    { value: 2, label: '▶▶', name: 'Fast' },
    { value: 3, label: '▶▶▶', name: 'Very Fast' },
  ];

  return (
    <div className={styles.actionBar}>
      <div className={styles.speedControls}>
        <span className={styles.speedLabel}>Speed</span>
        {speeds.map((speed) => (
          <button
            key={speed.value}
            className={`${styles.speedBtn} ${
              simulationSpeed === speed.value ? styles.active : ''
            }`}
            onClick={() => onSpeedChange(speed.value)}
            title={speed.name}
          >
            {speed.label}
          </button>
        ))}
      </div>

      <div className={styles.mainActions}>
        <button
          className={styles.actionBtn}
          onClick={onReviewDecisions}
        >
          Review Decisions
        </button>
        <button
          className={styles.actionBtn}
          onClick={onOpenResearch}
        >
          Open Research
        </button>
        <button
          className={`${styles.actionBtn} ${styles.primary}`}
          onClick={onAdvanceMonth}
        >
          Advance Month
        </button>
      </div>
    </div>
  );
}