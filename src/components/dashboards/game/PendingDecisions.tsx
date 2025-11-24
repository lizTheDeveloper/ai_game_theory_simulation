'use client';

import React from 'react';
import styles from './game-dashboard.module.css';

export interface Decision {
  id: string;
  name: string;
  urgency: 'critical' | 'important' | 'standard';
  daysRemaining: number;
  impact: string;
}

export interface PendingDecisionsProps {
  decisions: Decision[];
  onDecisionSelect?: (decisionId: string) => void;
}

/**
 * Component showing pending decisions that need player input
 */
export function PendingDecisions({
  decisions,
  onDecisionSelect,
}: PendingDecisionsProps) {
  const getUrgencyColor = (urgency: Decision['urgency']) => {
    switch (urgency) {
      case 'critical':
        return '#FF0040';
      case 'important':
        return '#FFB000';
      default:
        return undefined;
    }
  };

  const getUrgencyText = (urgency: Decision['urgency'], daysRemaining: number) => {
    const capitalizedUrgency = urgency.charAt(0).toUpperCase() + urgency.slice(1);
    return `${capitalizedUrgency} - ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`;
  };

  return (
    <div className={styles.pendingDecisions}>
      <div className={styles.pendingHeader}>
        <div className={styles.pendingTitle}>Pending Decisions</div>
        <div className={styles.pendingCount}>{decisions.length}</div>
      </div>
      <div className={styles.decisionList}>
        {decisions.map((decision) => (
          <div
            key={decision.id}
            className={styles.decisionItem}
            onClick={() => onDecisionSelect?.(decision.id)}
          >
            <div
              className={styles.decisionUrgency}
              style={{ color: getUrgencyColor(decision.urgency) }}
            >
              {getUrgencyText(decision.urgency, decision.daysRemaining)}
            </div>
            <div className={styles.decisionName}>{decision.name}</div>
            <div className={styles.decisionImpact}>{decision.impact}</div>
          </div>
        ))}
      </div>
    </div>
  );
}