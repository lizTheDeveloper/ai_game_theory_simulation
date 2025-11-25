/**
 * ARIA Chat Types
 *
 * Type definitions for the ARIA Chat interface, including messages,
 * citations, suggestions, and cross-panel events.
 */

// ============================================================================
// Message Types
// ============================================================================

/**
 * Message sender type
 */
export type MessageSender = 'user' | 'aria';

/**
 * Citation information for research-backed claims
 */
export interface Citation {
  /** Unique identifier for the citation */
  id: string;
  /** Short label (e.g., "Rockstrom et al. 2023") */
  label: string;
  /** Full citation or abstract */
  fullText: string;
  /** Optional URL to paper/source */
  url?: string;
  /** Year of publication */
  year?: number;
}

/**
 * Inline citation reference in message text
 */
export interface CitationRef {
  /** Citation ID to link to */
  citationId: string;
  /** Text that is cited */
  citedText: string;
  /** Start position in message text */
  startIndex: number;
  /** End position in message text */
  endIndex: number;
}

/**
 * Intervention option presented by ARIA
 */
export interface InterventionOption {
  /** Unique identifier */
  id: string;
  /** Option label (e.g., "A) IMMEDIATE") */
  label: string;
  /** Option title */
  title: string;
  /** List of requirements */
  requirements: string[];
  /** Expected effects */
  effects: string[];
  /** Tradeoffs to consider */
  tradeoffs: string[];
  /** Success probability (0-1) */
  successProbability?: number;
  /** Timeline description */
  timeline?: string;
  /** Color variant for styling */
  variant: 'immediate' | 'medium' | 'systemic';
  /** Technology ID to highlight when clicked */
  techId?: string;
  /** Region to highlight when clicked */
  region?: string;
}

/**
 * Context awareness indicator (what panel user has open)
 */
export interface ContextAwareness {
  /** Panel type user is viewing */
  panelType: 'research-tree' | 'global-map' | 'event-stream' | 'currency' | null;
  /** Specific item being viewed (e.g., tech ID, region name) */
  focusItem?: string;
  /** Human-readable description */
  description: string;
}

/**
 * Individual chat message
 */
export interface ChatMessage {
  /** Unique message identifier */
  id: string;
  /** Who sent the message */
  sender: MessageSender;
  /** Message content (can include markdown-like formatting) */
  content: string;
  /** Timestamp of message */
  timestamp: Date;
  /** Citations referenced in this message */
  citations?: Citation[];
  /** Citation references mapping text to citations */
  citationRefs?: CitationRef[];
  /** Intervention options (for ARIA multi-option responses) */
  interventionOptions?: InterventionOption[];
  /** Context awareness (what panel user has open) */
  contextAwareness?: ContextAwareness;
  /** Action buttons to show with message */
  actionButtons?: ActionButton[];
  /** Whether this is a faded/historical message */
  isFaded?: boolean;
}

/**
 * Action button that triggers cross-panel events
 */
export interface ActionButton {
  /** Unique identifier */
  id: string;
  /** Button label */
  label: string;
  /** Icon emoji */
  icon: string;
  /** Cross-panel event to emit when clicked */
  event: ARIACrossPanelEvent;
}

// ============================================================================
// Suggestion Types
// ============================================================================

/**
 * Quick action suggestion in the suggestion panel
 */
export interface Suggestion {
  /** Unique identifier */
  id: string;
  /** Icon emoji */
  icon: string;
  /** Main suggestion text */
  text: string;
  /** Secondary explanation text */
  subtext?: string;
  /** Severity/urgency level */
  severity?: 'normal' | 'warning' | 'urgent';
  /** Cross-panel event to emit when clicked */
  event?: ARIACrossPanelEvent;
}

/**
 * Suggestion panel context (what the suggestions are based on)
 */
export interface SuggestionContext {
  /** What panel/data the suggestions are based on */
  basedOn: string;
  /** Whether suggestions are context-aware */
  isContextual: boolean;
}

// ============================================================================
// Cross-Panel Event Types
// ============================================================================

/**
 * Extended cross-panel event type for ARIA Chat
 * Compatible with ResearchTree's CrossPanelEvent
 */
export interface ARIACrossPanelEvent {
  type:
    | 'tech_selected'
    | 'tech_recommended'
    | 'crisis_clicked'
    | 'highlight_tech'
    | 'focus_region'
    | 'show_probabilities'
    | 'trigger_optimization'
    | 'resume_simulation'
    | 'aria_suggest'
    | 'aria_context';
  payload: {
    techId?: string;
    techName?: string;
    crisisId?: string;
    region?: string;
    panel?: string;
    topic?: string;
  };
}

// ============================================================================
// Component Props
// ============================================================================

/**
 * Simulation pause state
 */
export interface PauseState {
  /** Whether simulation is paused */
  isPaused: boolean;
  /** Reason for pause (if any) */
  reason?: string;
}

/**
 * Props for the ARIAChat component
 */
export interface ARIAChatProps {
  /** Chat messages to display */
  messages: ChatMessage[];
  /** Quick action suggestions */
  suggestions?: Suggestion[];
  /** Suggestion context info */
  suggestionContext?: SuggestionContext;
  /** Current pause state */
  pauseState?: PauseState;
  /** Whether ARIA is "typing" (generating response) */
  isTyping?: boolean;
  /** Callback when user sends a message */
  onSendMessage?: (message: string) => void;
  /** Callback when suggestion is clicked */
  onSuggestionClick?: (suggestion: Suggestion) => void;
  /** Callback for cross-panel events */
  onCrossPanelEvent?: (event: ARIACrossPanelEvent) => void;
  /** Callback when resume is clicked */
  onResume?: () => void;
  /** Callback when minimize is clicked */
  onMinimize?: () => void;
  /** Callback when close is clicked */
  onClose?: () => void;
  /** Optional className for custom styling */
  className?: string;
}

/**
 * Props for ChatMessage component
 */
export interface ChatMessageProps {
  /** The message to display */
  message: ChatMessage;
  /** Callback when citation is clicked */
  onCitationClick?: (citation: Citation) => void;
  /** Callback when action button is clicked */
  onActionClick?: (event: ARIACrossPanelEvent) => void;
  /** Callback when intervention option is clicked */
  onInterventionClick?: (option: InterventionOption) => void;
}

/**
 * Props for SuggestionPanel component
 */
export interface SuggestionPanelProps {
  /** Suggestions to display */
  suggestions: Suggestion[];
  /** Context information */
  context?: SuggestionContext;
  /** Callback when suggestion is clicked */
  onSuggestionClick?: (suggestion: Suggestion) => void;
}

/**
 * Props for CitationTooltip component
 */
export interface CitationTooltipProps {
  /** Citation to display */
  citation: Citation;
  /** Whether tooltip is visible */
  isVisible: boolean;
  /** Position relative to trigger element */
  position?: 'top' | 'bottom';
  /** Callback when tooltip link is clicked */
  onLinkClick?: (url: string) => void;
}
