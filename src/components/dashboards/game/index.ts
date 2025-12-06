/**
 * Game Dashboard Components
 *
 * Far-future aesthetic dashboard for the Super-Alignment to Utopia game
 */

export { GameDashboard } from './GameDashboard';
export type { GameDashboardProps } from './GameDashboard';

export { GameDashboardHeader } from './GameDashboardHeader';
export type { GameDashboardHeaderProps } from './GameDashboardHeader';

export { CurrencyPanel } from './CurrencyPanel';
export type { CurrencyPanelProps, Currency, Outcomes } from './CurrencyPanel';

export { PendingDecisions } from './PendingDecisions';
export type { PendingDecisionsProps, Decision } from './PendingDecisions';

export { WorldVisualization } from './WorldVisualization';
export type { WorldVisualizationProps } from './WorldVisualization';

export { EventStream } from './EventStream';
export type { EventStreamProps, Event } from './EventStream';

export { ActionBar } from './ActionBar';
export type { ActionBarProps } from './ActionBar';

export { OutcomeScreen } from './OutcomeScreen';

// Research Tree (V4 Production-Ready)
export {
  ResearchTree,
  TechCard,
  CategoryFilter,
  ActiveLoop,
  DEFAULT_CATEGORIES,
  GRID_CATEGORIES,
  mapToGridCategory,
} from './ResearchTree';
export type {
  ResearchTreeProps,
  TechDisplayData,
  ResearchStats,
  CrossPanelEvent,
  TechTier,
  TechCardProps,
  TechStatus,
  CrisisRelevance,
  CategoryFilterProps,
  CategoryConfig,
  TechCategory,
  ActiveLoopProps,
  LoopNode,
  DelayedTech,
  LoopNodeType,
} from './ResearchTree';

// ARIA Chat (V4 Production-Ready)
export {
  ARIAChat,
  ChatMessage,
  SuggestionPanel,
  CitationTooltip,
  TypingIndicator,
  createUserMessage,
  createARIAMessage,
  DEFAULT_SUGGESTIONS,
  StandaloneCitationTooltip,
} from './ARIAChat';
export type {
  ARIAChatProps,
  ChatMessageType,
  ChatMessageProps,
  MessageSender,
  Citation,
  CitationRef,
  InterventionOption,
  ContextAwareness,
  ActionButton,
  Suggestion,
  SuggestionContext,
  ARIACrossPanelEvent,
  PauseState,
  SuggestionPanelProps,
  CitationTooltipProps,
} from './ARIAChat';

// Global Map (V4 Production-Ready)
export {
  GlobalMap,
  LayerSwitcher,
  RegionOverlay,
  CrisisIndicator,
  CascadeFlow,
  CascadeFlowGroup,
  TimelineScrubber,
  RegionDetailPanel,
  DEFAULT_LAYERS,
  HEALTH_STATUS_COLORS,
  CRISIS_SEVERITY_COLORS,
  CRISIS_TYPE_ICONS,
  FLOW_TYPE_STYLES,
} from './GlobalMap';
export type {
  GlobalMapProps,
  LayerType,
  LayerConfig,
  RegionId,
  RegionHealthStatus,
  RegionMetrics,
  RegionData,
  CrisisType,
  CrisisSeverity,
  CrisisData,
  CrisisMenuAction,
  FlowType,
  FlowData,
  TimelineEventType,
  TimelineEvent,
  TickMark,
  AIMarker,
  MapCrossPanelEvent,
  LayerSwitcherProps,
  RegionOverlayProps,
  CrisisIndicatorProps,
  CascadeFlowProps,
  TimelineScrubberProps,
  RegionDetailPanelProps,
} from './GlobalMap';

// Scenario Setup Wizard (V4 Production-Ready)
export { ScenarioSetup } from './ScenarioSetup';
export type {
  ScenarioSetupProps,
  ScenarioConfig,
  BeliefCalibration,
  ScenarioType,
  ScreenType,
  ScenarioOption,
} from './ScenarioSetup';

// Action Panel (V4 - Player Advocacy Actions)
export { ActionPanel } from './ActionPanel';
export type {
  ActionPanelProps,
  PlayerResources,
  ActiveCooldowns,
} from './ActionPanel';

// Scenario Picker (V4 - In-Game Scenario Selection)
export { ScenarioPicker } from './ScenarioPicker';
export type {
  ScenarioPickerProps,
  ScenarioDisplay,
  OutcomeDistribution,
} from './ScenarioPicker';