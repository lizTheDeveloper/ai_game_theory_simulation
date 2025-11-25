'use client';

import React, { useCallback } from 'react';
import styles from './GlobalMap.module.css';
import type { LayerSwitcherProps, LayerType, LayerConfig } from './types';

/**
 * LayerSwitcher - Data layer selection buttons
 *
 * Provides 6 toggle buttons for switching between map data layers:
 * - Composite (all systems)
 * - Temperature Anomaly
 * - Food Security
 * - Population Health
 * - Economic Activity
 * - AI Development
 *
 * Far-future aesthetic with glowing active states.
 */
export function LayerSwitcher({
  activeLayer,
  layers,
  onLayerChange,
}: LayerSwitcherProps) {
  const handleLayerClick = useCallback(
    (layerId: LayerType) => {
      onLayerChange(layerId);
    },
    [onLayerChange]
  );

  return (
    <div className={styles.layerSwitcher}>
      <span className={styles.layerLabel}>Layer:</span>
      <div className={styles.layerButtons}>
        {layers.map((layer: LayerConfig) => (
          <button
            key={layer.id}
            className={`${styles.layerBtn} ${
              activeLayer === layer.id ? styles.layerBtnActive : ''
            }`}
            onClick={() => handleLayerClick(layer.id)}
            title={layer.description}
            aria-pressed={activeLayer === layer.id}
          >
            {layer.shortLabel}
          </button>
        ))}
      </div>
    </div>
  );
}

export default LayerSwitcher;
