/**
 * Global Map Types
 *
 * Type definitions for the Global Systems Map component, including regions,
 * layers, crises, flows, and cross-panel events.
 */

// ============================================================================
// Layer Types
// ============================================================================

/**
 * Available data layers for the global map
 */
export type LayerType =
  | 'composite'
  | 'temperature'
  | 'foodSecurity'
  | 'populationHealth'
  | 'economic'
  | 'aiDevelopment'
  | 'migration';

/**
 * Layer configuration for display
 */
export interface LayerConfig {
  /** Layer identifier */
  id: LayerType;
  /** Display label */
  label: string;
  /** Short label for buttons */
  shortLabel: string;
  /** Description for tooltip */
  description: string;
  /** Color scale for this layer */
  colorScale: {
    low: string;
    mid: string;
    high: string;
  };
  /** Unit for display */
  unit: string;
}

// ============================================================================
// Region Types
// ============================================================================

/**
 * Region identifiers for the 10-12 major world regions
 */
export type RegionId =
  | 'north-america'
  | 'south-america'
  | 'europe'
  | 'mena'
  | 'sub-saharan-africa'
  | 'south-asia'
  | 'east-asia'
  | 'southeast-asia'
  | 'central-asia'
  | 'oceania'
  | 'arctic'
  | 'antarctica';

/**
 * Health status classification for regions
 */
export type RegionHealthStatus = 'stable' | 'stressed' | 'crisis' | 'collapse';

/**
 * Metrics for a single region
 */
export interface RegionMetrics {
  /** Temperature anomaly in degrees C */
  temperature: number;
  /** Food security index (0-100) */
  foodSecurity: number;
  /** Population health index (0-100) */
  healthIndex: number;
  /** GDP growth percentage */
  gdpGrowth: number;
  /** AI capability index (0-10) */
  aiCapability: number;
  /** Migration pressure index (0-100) */
  migrationPressure: number;
  /** Quality of Life composite (0-1) */
  qualityOfLife: number;
  /** Planetary boundaries breached (0-9) */
  boundariesBreached: number;
  /** Social stability index (0-1) */
  socialStability: number;
  /** Population in billions */
  population: number;
}

/**
 * Region data with SVG path and metrics
 */
export interface RegionData {
  /** Unique region identifier */
  id: RegionId;
  /** Display name */
  name: string;
  /** SVG path data for region shape */
  svgPath: string;
  /** Current metrics */
  metrics: RegionMetrics;
  /** Active crises in this region */
  crises: CrisisData[];
  /** Health status classification */
  healthStatus: RegionHealthStatus;
  /** Center point for label/marker placement */
  center: { x: number; y: number };
  /** Whether region is interactive */
  isInteractive: boolean;
  /** Preview text for timeline hover */
  previewText?: string;
}

// ============================================================================
// Crisis Types
// ============================================================================

/**
 * Crisis type classification
 */
export type CrisisType =
  | 'heat'
  | 'flood'
  | 'drought'
  | 'food'
  | 'pandemic'
  | 'conflict'
  | 'economic'
  | 'political'
  | 'water'
  | 'migration';

/**
 * Crisis severity levels
 */
export type CrisisSeverity = 'warning' | 'critical' | 'catastrophic';

/**
 * Crisis data for display on map
 */
export interface CrisisData {
  /** Unique crisis identifier */
  id: string;
  /** Crisis type */
  type: CrisisType;
  /** Display name */
  name: string;
  /** Severity level */
  severity: CrisisSeverity;
  /** Position relative to region center */
  position: { x: number; y: number };
  /** Description text */
  description: string;
  /** Whether this crisis cascades to other regions */
  isCascading: boolean;
  /** Related technology IDs that could help */
  relatedTechIds?: string[];
  /** Icon emoji for display */
  icon: string;
}

/**
 * Crisis menu action item
 */
export interface CrisisMenuAction {
  /** Action identifier */
  id: string;
  /** Icon emoji */
  icon: string;
  /** Action label */
  label: string;
  /** Cross-panel event to emit */
  event: MapCrossPanelEvent;
}

// ============================================================================
// Flow Types
// ============================================================================

/**
 * Flow type classification
 */
export type FlowType = 'migration' | 'trade' | 'cascade' | 'ai-cooperation';

/**
 * Animated flow data between regions
 */
export interface FlowData {
  /** Unique flow identifier */
  id: string;
  /** Flow type */
  type: FlowType;
  /** Source region */
  sourceRegion: RegionId;
  /** Target region */
  targetRegion: RegionId;
  /** SVG path for flow curve */
  svgPath: string;
  /** Flow intensity (affects animation speed/width) */
  intensity: number;
  /** Description for tooltip */
  description: string;
  /** Whether flow is currently active */
  isActive: boolean;
}

// ============================================================================
// Timeline Types
// ============================================================================

/**
 * Timeline event marker type
 */
export type TimelineEventType = 'normal' | 'crisis' | 'breakthrough';

/**
 * Timeline event marker data
 */
export interface TimelineEvent {
  /** Month number (0-120) */
  month: number;
  /** Event type for styling */
  type: TimelineEventType;
  /** Brief description */
  description?: string;
}

/**
 * Tick mark configuration
 */
export interface TickMark {
  /** Month number */
  month: number;
  /** Whether this is a major tick (shows label) */
  isMajor: boolean;
  /** Label to display (for major ticks) */
  label?: string;
}

// ============================================================================
// AI Marker Types
// ============================================================================

/**
 * AI presence marker on the map
 */
export interface AIMarker {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Position on map */
  position: { x: number; y: number };
  /** Region this AI is associated with */
  region: RegionId;
  /** Capability level (affects glow intensity) */
  capabilityLevel: number;
}

// ============================================================================
// Cross-Panel Event Types
// ============================================================================

/**
 * Cross-panel event types for Global Map
 * Compatible with ResearchTree and ARIAChat events
 */
export interface MapCrossPanelEvent {
  type:
    | 'region_selected'
    | 'region_focused'
    | 'crisis_clicked'
    | 'crisis_analyze'
    | 'highlight_tech'
    | 'layer_changed'
    | 'timeline_changed'
    | 'aria_ask'
    | 'tech_selected';
  payload: {
    regionId?: RegionId;
    regionName?: string;
    crisisId?: string;
    crisisType?: CrisisType;
    techId?: string;
    techName?: string;
    layer?: LayerType;
    month?: number;
    question?: string;
    panel?: string;
  };
}

// ============================================================================
// Component Props
// ============================================================================

/**
 * Props for the GlobalMap component
 */
export interface GlobalMapProps {
  /** Region data to display */
  regions: RegionData[];
  /** Flow data for animated connections */
  flows?: FlowData[];
  /** AI presence markers */
  aiMarkers?: AIMarker[];
  /** Current timeline month */
  currentMonth: number;
  /** Total months in simulation */
  totalMonths: number;
  /** Timeline events for scrubber */
  timelineEvents?: TimelineEvent[];
  /** Selected region ID */
  selectedRegionId?: RegionId;
  /** Active data layer */
  activeLayer?: LayerType;
  /** Whether simulation is playing */
  isPlaying?: boolean;
  /** Playback speed multiplier */
  playbackSpeed?: number;
  /** Callback when region is selected */
  onRegionSelect?: (regionId: RegionId) => void;
  /** Callback when crisis is clicked */
  onCrisisClick?: (crisis: CrisisData, regionId: RegionId) => void;
  /** Callback when layer is changed */
  onLayerChange?: (layer: LayerType) => void;
  /** Callback when timeline position changes */
  onTimelineChange?: (month: number) => void;
  /** Callback when play/pause is toggled */
  onPlayToggle?: () => void;
  /** Callback when playback speed changes */
  onSpeedChange?: (speed: number) => void;
  /** Callback for cross-panel events */
  onCrossPanelEvent?: (event: MapCrossPanelEvent) => void;
  /** Optional className for custom styling */
  className?: string;
}

/**
 * Props for LayerSwitcher component
 */
export interface LayerSwitcherProps {
  /** Currently active layer */
  activeLayer: LayerType;
  /** Available layers */
  layers: LayerConfig[];
  /** Callback when layer is selected */
  onLayerChange: (layer: LayerType) => void;
}

/**
 * Props for RegionOverlay component
 */
export interface RegionOverlayProps {
  /** Region data */
  region: RegionData;
  /** Active layer for coloring */
  activeLayer: LayerType;
  /** Whether region is selected */
  isSelected: boolean;
  /** Whether region is highlighted for crisis */
  isHighlightedForCrisis?: boolean;
  /** Callback when region is clicked */
  onClick?: (regionId: RegionId) => void;
  /** Callback when region is hovered */
  onHover?: (regionId: RegionId | null) => void;
}

/**
 * Props for CrisisIndicator component
 */
export interface CrisisIndicatorProps {
  /** Crisis data */
  crisis: CrisisData;
  /** Region this crisis is in */
  regionId: RegionId;
  /** Position offset from region center */
  position: { x: number; y: number };
  /** Whether crisis menu is open */
  isMenuOpen?: boolean;
  /** Callback when indicator is clicked */
  onClick?: (crisis: CrisisData) => void;
  /** Callback when menu action is selected */
  onMenuAction?: (action: CrisisMenuAction, crisis: CrisisData) => void;
  /** Callback to close menu */
  onMenuClose?: () => void;
}

/**
 * Props for CascadeFlow component
 */
export interface CascadeFlowProps {
  /** Flow data */
  flow: FlowData;
  /** Whether flow animation is active */
  isAnimating?: boolean;
}

/**
 * Props for TimelineScrubber component
 */
export interface TimelineScrubberProps {
  /** Current month position */
  currentMonth: number;
  /** Total months in simulation */
  totalMonths: number;
  /** Timeline events to display */
  events?: TimelineEvent[];
  /** Tick marks configuration */
  tickMarks?: TickMark[];
  /** Whether simulation is playing */
  isPlaying?: boolean;
  /** Playback speed multiplier */
  playbackSpeed?: number;
  /** Callback when position changes (drag) */
  onPositionChange?: (month: number) => void;
  /** Callback when play/pause is toggled */
  onPlayToggle?: () => void;
  /** Callback when speed changes */
  onSpeedChange?: (speed: number) => void;
  /** Callback when compare mode is activated */
  onCompare?: () => void;
}

/**
 * Props for RegionDetailPanel component
 */
export interface RegionDetailPanelProps {
  /** Region data to display */
  region: RegionData | null;
  /** Whether panel is visible */
  isVisible: boolean;
  /** Callback to close panel */
  onClose?: () => void;
  /** Callback when crisis is clicked */
  onCrisisClick?: (crisis: CrisisData) => void;
}

// ============================================================================
// Defaults & Constants
// ============================================================================

/**
 * Default layer configurations
 */
export const DEFAULT_LAYERS: LayerConfig[] = [
  {
    id: 'composite',
    label: 'Composite',
    shortLabel: 'All',
    description: 'All systems combined - Overall health status',
    colorScale: { low: '#00FF88', mid: '#FFB000', high: '#FF0040' },
    unit: 'index',
  },
  {
    id: 'temperature',
    label: 'Temperature Anomaly',
    shortLabel: 'Temp',
    description: 'Temperature anomalies from baseline',
    colorScale: { low: '#00F0FF', mid: '#FFB000', high: '#FF0040' },
    unit: 'C',
  },
  {
    id: 'foodSecurity',
    label: 'Food Security',
    shortLabel: 'Food',
    description: 'Food security index and availability',
    colorScale: { low: '#FF0040', mid: '#FFB000', high: '#00FF88' },
    unit: '%',
  },
  {
    id: 'populationHealth',
    label: 'Population Health',
    shortLabel: 'Health',
    description: 'Population health indicators',
    colorScale: { low: '#FF0040', mid: '#FFB000', high: '#00FF88' },
    unit: 'index',
  },
  {
    id: 'economic',
    label: 'Economic Activity',
    shortLabel: 'Econ',
    description: 'GDP growth and employment',
    colorScale: { low: '#FF0040', mid: '#FFB000', high: '#00FF88' },
    unit: '%',
  },
  {
    id: 'aiDevelopment',
    label: 'AI Development',
    shortLabel: 'AI',
    description: 'AI capability and deployment density',
    colorScale: { low: '#333333', mid: '#0080FF', high: '#00F0FF' },
    unit: 'cap',
  },
];

/**
 * Health status to color mapping
 */
export const HEALTH_STATUS_COLORS: Record<RegionHealthStatus, string> = {
  stable: '#00FF88',
  stressed: '#FFB000',
  crisis: '#FF6B00',
  collapse: '#FF0040',
};

/**
 * Crisis severity to color mapping
 */
export const CRISIS_SEVERITY_COLORS: Record<CrisisSeverity, string> = {
  warning: '#FFB000',
  critical: '#FF6B00',
  catastrophic: '#FF0040',
};

/**
 * Crisis type to icon mapping
 */
export const CRISIS_TYPE_ICONS: Record<CrisisType, string> = {
  heat: '???',
  flood: '???',
  drought: '????',
  food: '????',
  pandemic: '????',
  conflict: '???',
  economic: '????',
  political: '????',
  water: '????',
  migration: '????',
};

/**
 * Flow type styling
 */
export const FLOW_TYPE_STYLES: Record<
  FlowType,
  { color: string; dashArray: string; width: number }
> = {
  migration: { color: 'rgba(255, 176, 0, 0.6)', dashArray: '5,5', width: 2 },
  trade: { color: 'rgba(0, 255, 136, 0.4)', dashArray: '5,5', width: 2 },
  cascade: { color: 'rgba(255, 0, 64, 0.5)', dashArray: '5,5', width: 3 },
  'ai-cooperation': { color: 'rgba(0, 240, 255, 0.4)', dashArray: '5,5', width: 2 },
};
