/**
 * Global Map Component Exports
 *
 * Far-future aesthetic global systems map for the Super-Alignment to Utopia game.
 * Displays world regions with health status, crisis indicators, and cascade flows.
 */

// Main component
export { GlobalMap } from './GlobalMap';
export { default as GlobalMapDefault } from './GlobalMap';

// Sub-components
export { LayerSwitcher } from './LayerSwitcher';
export { RegionOverlay } from './RegionOverlay';
export { CrisisIndicator } from './CrisisIndicator';
export { CascadeFlow, CascadeFlowGroup } from './CascadeFlow';
export { TimelineScrubber } from './TimelineScrubber';
export { RegionDetailPanel } from './RegionDetailPanel';

// Types
export type {
  // Layer types
  LayerType,
  LayerConfig,
  // Region types
  RegionId,
  RegionHealthStatus,
  RegionMetrics,
  RegionData,
  // Crisis types
  CrisisType,
  CrisisSeverity,
  CrisisData,
  CrisisMenuAction,
  // Flow types
  FlowType,
  FlowData,
  // Timeline types
  TimelineEventType,
  TimelineEvent,
  TickMark,
  // AI marker types
  AIMarker,
  // Cross-panel event types
  MapCrossPanelEvent,
  // Component props
  GlobalMapProps,
  LayerSwitcherProps,
  RegionOverlayProps,
  CrisisIndicatorProps,
  CascadeFlowProps,
  TimelineScrubberProps,
  RegionDetailPanelProps,
} from './types';

// Constants
export {
  DEFAULT_LAYERS,
  HEALTH_STATUS_COLORS,
  CRISIS_SEVERITY_COLORS,
  CRISIS_TYPE_ICONS,
  FLOW_TYPE_STYLES,
} from './types';
