'use client';

import React from 'react';
import styles from './game-dashboard.module.css';

export interface Currency {
  name: string;
  value: number;
  max: number;
  trend: number;
  trendDirection: 'up' | 'down' | 'neutral';
}

export interface Outcomes {
  utopia: number;
  alignment: number;
  struggle: number;
  collapse: number;
  extinction: number;
  changeFromLastMonth: number;
}

export interface CurrencyPanelProps {
  currencies: Currency[];
  outcomes: Outcomes;
}

/**
 * Left panel showing game currencies and outcome probabilities
 */
export function CurrencyPanel({ currencies, outcomes }: CurrencyPanelProps) {
  const getTrendIcon = (direction: Currency['trendDirection']) => {
    switch (direction) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '→';
    }
  };

  const getTrendClass = (direction: Currency['trendDirection']) => {
    switch (direction) {
      case 'up':
        return styles.trendUp;
      case 'down':
        return styles.trendDown;
      default:
        return styles.trendNeutral;
    }
  };

  const formatTrend = (trend: number) => {
    return trend > 0 ? `+${trend}` : `${trend}`;
  };

  const formatPercent = (value: number) => {
    return `${Math.round(value * 100)}%`;
  };

  return (
    <div className={styles.currencyPanel}>
      {currencies.map((currency) => (
        <div key={currency.name} className={styles.currencyItem}>
          <div className={styles.currencyHeader}>
            <div className={styles.currencyName}>{currency.name}</div>
            <div className={`${styles.currencyTrend} ${getTrendClass(currency.trendDirection)}`}>
              <span>{getTrendIcon(currency.trendDirection)}</span>
              <span>{formatTrend(currency.trend)}/mo</span>
            </div>
          </div>
          <div className={styles.currencyValue}>{currency.value}</div>
          <div className={styles.currencyBar}>
            <div
              className={styles.currencyBarFill}
              style={{ width: `${(currency.value / currency.max) * 100}%` }}
            />
          </div>
        </div>
      ))}

      <div className={styles.outcomePanel}>
        <div className={styles.outcomeTitle}>Trajectory Analysis</div>
        <div className={styles.outcomeGrid}>
          <div className={styles.outcomeItem}>
            <span className={styles.outcomeName}>Utopia</span>
            <span className={`${styles.outcomeProb} ${styles.outcomeUtopia}`}>
              {formatPercent(outcomes.utopia)}
            </span>
          </div>
          <div className={styles.outcomeItem}>
            <span className={styles.outcomeName}>Alignment</span>
            <span className={`${styles.outcomeProb} ${styles.outcomeAlignment}`}>
              {formatPercent(outcomes.alignment)}
            </span>
          </div>
          <div className={styles.outcomeItem}>
            <span className={styles.outcomeName}>Struggle</span>
            <span className={`${styles.outcomeProb} ${styles.outcomeStruggle}`}>
              {formatPercent(outcomes.struggle)}
            </span>
          </div>
          <div className={styles.outcomeItem}>
            <span className={styles.outcomeName}>Collapse</span>
            <span className={`${styles.outcomeProb} ${styles.outcomeCollapse}`}>
              {formatPercent(outcomes.collapse)}
            </span>
          </div>
          <div className={styles.outcomeItem}>
            <span className={styles.outcomeName}>Extinction</span>
            <span className={`${styles.outcomeProb} ${styles.outcomeExtinction}`}>
              {formatPercent(outcomes.extinction)}
            </span>
          </div>
          <div className={styles.outcomeItem}>
            <span className={styles.outcomeName} style={{ opacity: 0.5 }}>
              vs Last Month
            </span>
            <span className={`${styles.outcomeProb} ${styles.trendUp}`} style={{ color: '#00FF88' }}>
              {formatTrend(outcomes.changeFromLastMonth * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}