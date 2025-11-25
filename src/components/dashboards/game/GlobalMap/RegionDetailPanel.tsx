'use client';

import React, { useCallback, useMemo } from 'react';
import styles from './GlobalMap.module.css';
import type {
  RegionDetailPanelProps,
  RegionData,
  CrisisData,
  RegionHealthStatus,
} from './types';

/**
 * Get fill class based on value threshold
 */
function getFillClass(value: number, thresholds: { good: number; warning: number }): string {
  if (value >= thresholds.good) return styles.fillGood;
  if (value >= thresholds.warning) return styles.fillWarning;
  return styles.fillDanger;
}

/**
 * Get fill class inverted (lower is better)
 */
function getFillClassInverted(
  value: number,
  thresholds: { good: number; warning: number }
): string {
  if (value <= thresholds.good) return styles.fillGood;
  if (value <= thresholds.warning) return styles.fillWarning;
  return styles.fillDanger;
}

/**
 * Get crisis badge color based on severity
 */
function getCrisisBadgeColor(severity: string): string {
  switch (severity) {
    case 'catastrophic':
      return 'rgba(255, 0, 64, 0.3)';
    case 'critical':
      return 'rgba(255, 107, 0, 0.3)';
    case 'warning':
    default:
      return 'rgba(255, 176, 0, 0.3)';
  }
}

function getCrisisBorderColor(severity: string): string {
  switch (severity) {
    case 'catastrophic':
      return 'rgba(255, 0, 64, 0.5)';
    case 'critical':
      return 'rgba(255, 107, 0, 0.5)';
    case 'warning':
    default:
      return 'rgba(255, 176, 0, 0.5)';
  }
}

/**
 * RegionDetailPanel - Slide-in panel showing region metrics
 *
 * Displays detailed information for a selected region:
 * - Quality of Life (progress bar)
 * - Planetary Boundaries breached
 * - AI Capabilities
 * - Social Stability
 * - Population
 * - Active crises list
 *
 * Far-future aesthetic with glowing progress bars.
 */
export function RegionDetailPanel({
  region,
  isVisible,
  onClose,
  onCrisisClick,
}: RegionDetailPanelProps) {
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const handleCrisisClick = useCallback(
    (crisis: CrisisData) => {
      onCrisisClick?.(crisis);
    },
    [onCrisisClick]
  );

  // Don't render if not visible or no region
  if (!isVisible || !region) {
    return null;
  }

  const { metrics, crises, name } = region;

  return (
    <div className={`${styles.detailPanel} ${isVisible ? styles.detailPanelActive : ''}`}>
      {/* Header */}
      <div className={styles.panelHeader}>
        <div className={styles.regionName}>{name}</div>
        <button
          className={styles.closePanel}
          onClick={handleClose}
          aria-label="Close panel"
        >
          x
        </button>
      </div>

      {/* Metrics */}
      <div className={styles.metricRow}>
        <span className={styles.metricLabel}>Quality of Life</span>
        <div className={styles.metricBar}>
          <div
            className={`${styles.metricFill} ${getFillClass(metrics.qualityOfLife * 100, { good: 70, warning: 40 })}`}
            style={{ width: `${metrics.qualityOfLife * 100}%` }}
          />
        </div>
        <span className={styles.metricValue}>{metrics.qualityOfLife.toFixed(2)}</span>
      </div>

      <div className={styles.metricRow}>
        <span className={styles.metricLabel}>Planetary Boundaries</span>
        <div className={styles.metricBar}>
          <div
            className={`${styles.metricFill} ${getFillClassInverted(metrics.boundariesBreached, { good: 2, warning: 5 })}`}
            style={{ width: `${(metrics.boundariesBreached / 9) * 100}%` }}
          />
        </div>
        <span className={styles.metricValue}>
          {metrics.boundariesBreached}/9 {metrics.boundariesBreached >= 6 ? '!' : ''}
        </span>
      </div>

      <div className={styles.metricRow}>
        <span className={styles.metricLabel}>AI Capabilities</span>
        <div className={styles.metricBar}>
          <div
            className={`${styles.metricFill} ${styles.fillAI}`}
            style={{ width: `${(metrics.aiCapability / 10) * 100}%` }}
          />
        </div>
        <span className={styles.metricValue}>{metrics.aiCapability.toFixed(1)}</span>
      </div>

      <div className={styles.metricRow}>
        <span className={styles.metricLabel}>Social Stability</span>
        <div className={styles.metricBar}>
          <div
            className={`${styles.metricFill} ${getFillClass(metrics.socialStability * 100, { good: 70, warning: 40 })}`}
            style={{ width: `${metrics.socialStability * 100}%` }}
          />
        </div>
        <span className={styles.metricValue}>{metrics.socialStability.toFixed(2)}</span>
      </div>

      <div className={styles.metricRow}>
        <span className={styles.metricLabel}>Population</span>
        <span className={styles.metricValue}>{metrics.population.toFixed(1)}B</span>
      </div>

      {/* Active Crises */}
      {crises.length > 0 && (
        <>
          <div className={styles.metricRowDivider}>
            <span className={styles.metricLabel}>Active Crises:</span>
          </div>
          <div className={styles.crisisBadges}>
            {crises.map((crisis) => (
              <button
                key={crisis.id}
                className={styles.crisisBadge}
                style={{
                  background: getCrisisBadgeColor(crisis.severity),
                  borderColor: getCrisisBorderColor(crisis.severity),
                }}
                onClick={() => handleCrisisClick(crisis)}
                aria-label={`${crisis.name} crisis - ${crisis.severity}`}
              >
                {crisis.icon} {crisis.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default RegionDetailPanel;
