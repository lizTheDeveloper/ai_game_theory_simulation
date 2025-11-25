'use client';

import React, { useCallback, useMemo, useState } from 'react';
import styles from './GlobalMap.module.css';
import { LayerSwitcher } from './LayerSwitcher';
import { RegionOverlay } from './RegionOverlay';
import { CrisisIndicator } from './CrisisIndicator';
import { CascadeFlow, CascadeFlowGroup } from './CascadeFlow';
import { TimelineScrubber } from './TimelineScrubber';
import { RegionDetailPanel } from './RegionDetailPanel';
import type {
  GlobalMapProps,
  RegionData,
  RegionId,
  LayerType,
  CrisisData,
  FlowData,
  AIMarker,
  CrisisMenuAction,
  MapCrossPanelEvent,
  DEFAULT_LAYERS,
} from './types';

// ============================================================================
// Constants
// ============================================================================

/**
 * Default layer configurations
 */
const LAYER_CONFIGS = [
  {
    id: 'composite' as LayerType,
    label: 'Composite',
    shortLabel: 'All',
    description: 'All systems combined - Overall health status',
    colorScale: { low: '#00FF88', mid: '#FFB000', high: '#FF0040' },
    unit: 'index',
  },
  {
    id: 'temperature' as LayerType,
    label: 'Temperature',
    shortLabel: 'Temp',
    description: 'Temperature anomalies from baseline',
    colorScale: { low: '#00F0FF', mid: '#FFB000', high: '#FF0040' },
    unit: 'C',
  },
  {
    id: 'foodSecurity' as LayerType,
    label: 'Food Security',
    shortLabel: 'Food',
    description: 'Food security index and availability',
    colorScale: { low: '#FF0040', mid: '#FFB000', high: '#00FF88' },
    unit: '%',
  },
  {
    id: 'populationHealth' as LayerType,
    label: 'Health',
    shortLabel: 'Health',
    description: 'Population health indicators',
    colorScale: { low: '#FF0040', mid: '#FFB000', high: '#00FF88' },
    unit: 'index',
  },
  {
    id: 'economic' as LayerType,
    label: 'Economic',
    shortLabel: 'Econ',
    description: 'GDP growth and employment',
    colorScale: { low: '#FF0040', mid: '#FFB000', high: '#00FF88' },
    unit: '%',
  },
  {
    id: 'aiDevelopment' as LayerType,
    label: 'AI Development',
    shortLabel: 'AI',
    description: 'AI capability and deployment density',
    colorScale: { low: '#333333', mid: '#0080FF', high: '#00F0FF' },
    unit: 'cap',
  },
];

// ============================================================================
// Component
// ============================================================================

/**
 * GlobalMap - Main global systems map component
 *
 * Displays an interactive world map with:
 * - 10-12 regional polygons (SVG paths)
 * - 6 data layers (switchable)
 * - Crisis indicators with action menus
 * - Cascade/migration flows (animated)
 * - AI presence markers
 * - Timeline scrubber
 * - Region detail panel
 *
 * Far-future Elysium aesthetic (black background, white outlines, cyan accents).
 * Supports cross-panel coordination with ResearchTree and ARIAChat.
 */
export function GlobalMap({
  regions,
  flows = [],
  aiMarkers = [],
  currentMonth,
  totalMonths,
  timelineEvents = [],
  selectedRegionId,
  activeLayer = 'composite',
  isPlaying = false,
  playbackSpeed = 1,
  onRegionSelect,
  onCrisisClick,
  onLayerChange,
  onTimelineChange,
  onPlayToggle,
  onSpeedChange,
  onCrossPanelEvent,
  className,
}: GlobalMapProps) {
  // State
  const [hoveredRegionId, setHoveredRegionId] = useState<RegionId | null>(null);
  const [openCrisisId, setOpenCrisisId] = useState<string | null>(null);
  const [localActiveLayer, setLocalActiveLayer] = useState<LayerType>(activeLayer);

  // Get selected region for detail panel
  const selectedRegion = useMemo(
    () => regions.find((r) => r.id === selectedRegionId) || null,
    [regions, selectedRegionId]
  );

  // Handlers
  const handleRegionClick = useCallback(
    (regionId: RegionId) => {
      onRegionSelect?.(regionId);
      onCrossPanelEvent?.({
        type: 'region_selected',
        payload: {
          regionId,
          regionName: regions.find((r) => r.id === regionId)?.name,
        },
      });
    },
    [onRegionSelect, onCrossPanelEvent, regions]
  );

  const handleRegionHover = useCallback((regionId: RegionId | null) => {
    setHoveredRegionId(regionId);
  }, []);

  const handleCrisisClick = useCallback(
    (crisis: CrisisData) => {
      setOpenCrisisId((current) => (current === crisis.id ? null : crisis.id));
      onCrisisClick?.(crisis, crisis.id as unknown as RegionId);
      onCrossPanelEvent?.({
        type: 'crisis_clicked',
        payload: {
          crisisId: crisis.id,
          crisisType: crisis.type,
        },
      });
    },
    [onCrisisClick, onCrossPanelEvent]
  );

  const handleCrisisMenuAction = useCallback(
    (action: CrisisMenuAction, crisis: CrisisData) => {
      onCrossPanelEvent?.(action.event);
      setOpenCrisisId(null);
    },
    [onCrossPanelEvent]
  );

  const handleCrisisMenuClose = useCallback(() => {
    setOpenCrisisId(null);
  }, []);

  const handleLayerChange = useCallback(
    (layer: LayerType) => {
      setLocalActiveLayer(layer);
      onLayerChange?.(layer);
      onCrossPanelEvent?.({
        type: 'layer_changed',
        payload: { layer },
      });
    },
    [onLayerChange, onCrossPanelEvent]
  );

  const handleTimelineChange = useCallback(
    (month: number) => {
      onTimelineChange?.(month);
      onCrossPanelEvent?.({
        type: 'timeline_changed',
        payload: { month },
      });
    },
    [onTimelineChange, onCrossPanelEvent]
  );

  const handleDetailPanelClose = useCallback(() => {
    onRegionSelect?.(undefined as unknown as RegionId);
  }, [onRegionSelect]);

  const handleDetailPanelCrisisClick = useCallback(
    (crisis: CrisisData) => {
      handleCrisisClick(crisis);
    },
    [handleCrisisClick]
  );

  // Collect all crises from all regions with their positions
  const allCrises = useMemo(() => {
    const crisesList: Array<{
      crisis: CrisisData;
      regionId: RegionId;
      position: { x: number; y: number };
    }> = [];

    regions.forEach((region) => {
      region.crises.forEach((crisis) => {
        crisesList.push({
          crisis,
          regionId: region.id,
          position: {
            x: region.center.x + crisis.position.x,
            y: region.center.y + crisis.position.y,
          },
        });
      });
    });

    return crisesList;
  }, [regions]);

  // Determine effective layer
  const effectiveLayer = onLayerChange ? activeLayer : localActiveLayer;

  return (
    <div className={`${styles.globalMap} ${className || ''}`}>
      {/* Header */}
      <div className={styles.mapHeader}>
        <h1 className={styles.mapTitle}>Global Systems Map</h1>
        <LayerSwitcher
          activeLayer={effectiveLayer}
          layers={LAYER_CONFIGS}
          onLayerChange={handleLayerChange}
        />
      </div>

      {/* Map Container */}
      <div className={styles.mapContainer}>
        <div className={styles.worldMap}>
          {/* World Map SVG */}
          <svg className={styles.mapSvg} viewBox="0 0 1000 500">
            {/* Region Overlays */}
            {regions.map((region) => (
              <RegionOverlay
                key={region.id}
                region={region}
                activeLayer={effectiveLayer}
                isSelected={selectedRegionId === region.id}
                isHighlightedForCrisis={hoveredRegionId === region.id}
                onClick={handleRegionClick}
                onHover={handleRegionHover}
              />
            ))}

            {/* Flow Arrows */}
            <CascadeFlowGroup>
              {flows.map((flow) => (
                <CascadeFlow
                  key={flow.id}
                  flow={flow}
                  isAnimating={flow.isActive}
                />
              ))}
            </CascadeFlowGroup>
          </svg>

          {/* Crisis Indicators (positioned absolutely over SVG) */}
          {allCrises.map(({ crisis, regionId, position }) => (
            <CrisisIndicator
              key={crisis.id}
              crisis={crisis}
              regionId={regionId}
              position={position}
              isMenuOpen={openCrisisId === crisis.id}
              onClick={handleCrisisClick}
              onMenuAction={handleCrisisMenuAction}
              onMenuClose={handleCrisisMenuClose}
            />
          ))}

          {/* AI Presence Markers */}
          {aiMarkers.map((marker) => (
            <div
              key={marker.id}
              className={styles.aiMarker}
              style={{
                left: `${marker.position.x}px`,
                top: `${marker.position.y}px`,
                '--capability-level': marker.capabilityLevel / 10,
              } as React.CSSProperties}
              title={marker.name}
            />
          ))}
        </div>

        {/* Region Detail Panel */}
        <RegionDetailPanel
          region={selectedRegion}
          isVisible={!!selectedRegionId}
          onClose={handleDetailPanelClose}
          onCrisisClick={handleDetailPanelCrisisClick}
        />

        {/* Legend */}
        <div className={styles.legend}>
          <div className={styles.legendTitle}>Region Health</div>
          <div className={styles.legendItem}>
            <div
              className={styles.legendColor}
              style={{ background: '#00FF88' }}
            />
            <span>Stable</span>
          </div>
          <div className={styles.legendItem}>
            <div
              className={styles.legendColor}
              style={{ background: '#FFB000' }}
            />
            <span>Stressed</span>
          </div>
          <div className={styles.legendItem}>
            <div
              className={styles.legendColor}
              style={{ background: '#FF6B00' }}
            />
            <span>Crisis</span>
          </div>
          <div className={styles.legendItem}>
            <div
              className={styles.legendColor}
              style={{ background: '#FF0040' }}
            />
            <span>Collapse</span>
          </div>
        </div>
      </div>

      {/* Timeline Scrubber */}
      <TimelineScrubber
        currentMonth={currentMonth}
        totalMonths={totalMonths}
        events={timelineEvents}
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        onPositionChange={handleTimelineChange}
        onPlayToggle={onPlayToggle}
        onSpeedChange={onSpeedChange}
      />
    </div>
  );
}

export default GlobalMap;
