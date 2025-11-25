'use client';

import React, { useCallback, useMemo } from 'react';
import styles from './GlobalMap.module.css';
import type {
  RegionOverlayProps,
  RegionData,
  LayerType,
  RegionHealthStatus,
  HEALTH_STATUS_COLORS,
} from './types';

/**
 * Get color for region based on active layer and metrics
 */
function getRegionColor(
  region: RegionData,
  activeLayer: LayerType,
  healthStatusColors: Record<RegionHealthStatus, string>
): string {
  const { metrics, healthStatus } = region;

  switch (activeLayer) {
    case 'composite':
      return healthStatusColors[healthStatus];

    case 'temperature': {
      // Map temperature anomaly to color (blue to red)
      const temp = Math.max(0, Math.min(5, metrics.temperature));
      const ratio = temp / 5;
      if (ratio < 0.3) return '#00F0FF';
      if (ratio < 0.6) return '#FFB000';
      return '#FF0040';
    }

    case 'foodSecurity': {
      // Map food security to color (red to green)
      const food = Math.max(0, Math.min(100, metrics.foodSecurity));
      const ratio = food / 100;
      if (ratio > 0.7) return '#00FF88';
      if (ratio > 0.4) return '#FFB000';
      return '#FF0040';
    }

    case 'populationHealth': {
      // Map health index to color (red to green)
      const health = Math.max(0, Math.min(100, metrics.healthIndex));
      const ratio = health / 100;
      if (ratio > 0.7) return '#00FF88';
      if (ratio > 0.4) return '#FFB000';
      return '#FF0040';
    }

    case 'economic': {
      // Map GDP growth to color
      const gdp = metrics.gdpGrowth;
      if (gdp > 2) return '#00FF88';
      if (gdp > 0) return '#FFB000';
      return '#FF0040';
    }

    case 'aiDevelopment': {
      // Map AI capability to color (dark to cyan)
      const ai = Math.max(0, Math.min(10, metrics.aiCapability));
      const ratio = ai / 10;
      if (ratio > 0.7) return '#00F0FF';
      if (ratio > 0.4) return '#0080FF';
      return '#333333';
    }

    case 'migration': {
      // Map migration pressure to color (green to orange)
      const migration = Math.max(0, Math.min(100, metrics.migrationPressure));
      const ratio = migration / 100;
      if (ratio < 0.3) return '#00FF88';
      if (ratio < 0.6) return '#FFB000';
      return '#FF6B00';
    }

    default:
      return healthStatusColors[healthStatus];
  }
}

/**
 * RegionOverlay - Individual region SVG path with health status styling
 *
 * Renders a single region as an SVG path with:
 * - Color based on active layer and metrics
 * - Hover effects (border highlight, brightness)
 * - Selection state
 * - Crisis highlight pulse
 *
 * Far-future aesthetic with glowing borders on interaction.
 */
export function RegionOverlay({
  region,
  activeLayer,
  isSelected,
  isHighlightedForCrisis,
  onClick,
  onHover,
}: RegionOverlayProps) {
  // Health status color mapping
  const healthStatusColors: Record<RegionHealthStatus, string> = useMemo(
    () => ({
      stable: '#00FF88',
      stressed: '#FFB000',
      crisis: '#FF6B00',
      collapse: '#FF0040',
    }),
    []
  );

  // Calculate fill color based on layer
  const fillColor = useMemo(
    () => getRegionColor(region, activeLayer, healthStatusColors),
    [region, activeLayer, healthStatusColors]
  );

  // Event handlers
  const handleClick = useCallback(() => {
    if (region.isInteractive && onClick) {
      onClick(region.id);
    }
  }, [region.id, region.isInteractive, onClick]);

  const handleMouseEnter = useCallback(() => {
    if (region.isInteractive && onHover) {
      onHover(region.id);
    }
  }, [region.id, region.isInteractive, onHover]);

  const handleMouseLeave = useCallback(() => {
    if (onHover) {
      onHover(null);
    }
  }, [onHover]);

  // Build class list
  const classNames = [
    styles.region,
    styles[`health${region.healthStatus.charAt(0).toUpperCase()}${region.healthStatus.slice(1)}`],
    isSelected ? styles.regionSelected : '',
    isHighlightedForCrisis ? styles.regionCrisisHighlight : '',
    !region.isInteractive ? styles.regionNonInteractive : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <path
      className={classNames}
      d={region.svgPath}
      fill={fillColor}
      data-region={region.name}
      data-region-id={region.id}
      data-preview={region.previewText}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={region.isInteractive ? 0 : -1}
      aria-label={`${region.name} - ${region.healthStatus}`}
      aria-pressed={isSelected}
    />
  );
}

export default RegionOverlay;
