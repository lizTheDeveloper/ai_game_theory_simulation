'use client';

import React, { useMemo } from 'react';
import type { AggregateMetrics } from '@/game/types';
import styles from './outcome-screen.module.css';

/**
 * Outcome type classification
 */
type OutcomeType = 'utopia' | 'nearUtopia' | 'prosperity' | 'stable' | 'struggling' | 'decline' | 'collapse' | 'extinction';

/**
 * Outcome configuration
 */
interface OutcomeConfig {
  title: string;
  subtitle: string;
  description: string;
  colorClass: string;
}

const OUTCOME_CONFIGS: Record<OutcomeType, OutcomeConfig> = {
  utopia: {
    title: 'UTOPIA ACHIEVED',
    subtitle: 'Flourishing Humanity',
    description: 'Humanity has achieved unprecedented flourishing. AI systems operate in perfect alignment, environmental systems have been restored, and all beings thrive in abundance.',
    colorClass: 'utopia',
  },
  nearUtopia: {
    title: 'NEAR UTOPIA',
    subtitle: 'Almost Paradise',
    description: 'Humanity approaches optimal conditions. Minor challenges remain, but the trajectory points toward universal flourishing.',
    colorClass: 'utopia',
  },
  prosperity: {
    title: 'PROSPERITY',
    subtitle: 'Widespread Wellbeing',
    description: 'Global prosperity has been achieved. While not perfect, humanity enjoys widespread stability and improving conditions.',
    colorClass: 'stable',
  },
  stable: {
    title: 'STATUS QUO',
    subtitle: 'Managed Equilibrium',
    description: 'Civilization has maintained stability through careful management. Risks persist but are contained.',
    colorClass: 'stable',
  },
  struggling: {
    title: 'STRUGGLING',
    subtitle: 'Challenging Times',
    description: 'Humanity faces significant challenges but continues to survive. The path forward remains uncertain.',
    colorClass: 'struggle',
  },
  decline: {
    title: 'DECLINE',
    subtitle: 'Fading Hope',
    description: 'Civilizational decline has set in. Systems are failing and recovery becomes increasingly difficult.',
    colorClass: 'collapse',
  },
  collapse: {
    title: 'COLLAPSE',
    subtitle: 'Civilizational Breakdown',
    description: 'Society has collapsed under the weight of cascading failures. Billions face severe hardship.',
    colorClass: 'extinction',
  },
  extinction: {
    title: 'EXTINCTION',
    subtitle: 'End of Humanity',
    description: 'Humanity has been extinguished. An existential catastrophe has ended our story.',
    colorClass: 'extinction',
  },
};

interface OutcomeScreenProps {
  metrics: AggregateMetrics | null;
  onPlayAgain: () => void;
}

/**
 * OutcomeScreen - Dramatic end-game results display
 *
 * Full-screen overlay showing final simulation outcome
 * with key metrics and outcome-specific styling.
 */
export function OutcomeScreen({ metrics, onPlayAgain }: OutcomeScreenProps) {
  const outcomeType = useMemo(() => {
    const classification = metrics?.outcomeClassification ?? 'stable';
    return (classification in OUTCOME_CONFIGS ? classification : 'stable') as OutcomeType;
  }, [metrics]);

  const config = OUTCOME_CONFIGS[outcomeType];

  const formatPercent = (value: number | undefined): string => {
    if (value === undefined || isNaN(value)) return '--';
    return `${Math.round(value * 100)}%`;
  };

  return (
    <div className={`${styles.overlay} ${styles[config.colorClass]}`}>
      <div className={styles.content}>
        {/* Outcome Classification */}
        <div className={styles.outcomeHeader}>
          <div className={styles.outcomeTitle}>{config.title}</div>
          <div className={styles.outcomeSubtitle}>{config.subtitle}</div>
        </div>

        {/* Description */}
        <div className={styles.description}>
          {config.description}
        </div>

        {/* Final Metrics Grid */}
        <div className={styles.metricsGrid}>
          <MetricCard
            label="Quality of Life"
            value={formatPercent(metrics?.overallQoL)}
          />
          <MetricCard
            label="Environmental Health"
            value={formatPercent(metrics?.environmentalHealth)}
          />
          <MetricCard
            label="AI Alignment"
            value={formatPercent(metrics?.aiAlignmentStatus)}
          />
          <MetricCard
            label="Social Stability"
            value={formatPercent(metrics?.socialStability)}
          />
          <MetricCard
            label="Governance"
            value={formatPercent(metrics?.governanceEffectiveness)}
          />
          <MetricCard
            label="Coordination"
            value={formatPercent(metrics?.coordinationLevel)}
          />
        </div>

        {/* Summary Stats */}
        <div className={styles.summaryStats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Final Month</span>
            <span className={styles.statValue}>{metrics?.currentMonth ?? '--'}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Active Crises</span>
            <span className={styles.statValue}>{metrics?.activeCrises ?? '--'}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Breached Boundaries</span>
            <span className={styles.statValue}>{metrics?.breachedBoundaries ?? '--'}</span>
          </div>
        </div>

        {/* Play Again */}
        <button
          className={styles.playAgainBtn}
          onClick={onPlayAgain}
        >
          PLAY AGAIN
        </button>

        {/* Attribution */}
        <div className={styles.attribution}>
          Super-Alignment to Utopia Simulation
        </div>
      </div>
    </div>
  );
}

/**
 * Individual metric display card
 */
function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.metricCard}>
      <div className={styles.metricLabel}>{label}</div>
      <div className={styles.metricValue}>{value}</div>
    </div>
  );
}
