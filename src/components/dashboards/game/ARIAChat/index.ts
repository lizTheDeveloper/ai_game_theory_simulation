/**
 * ARIA Chat Component Exports
 *
 * ARIA (Alignment Research & Initiative Advisor) is the player's AI companion
 * that provides context-aware guidance in the Super-Alignment to Utopia game.
 */

// Main component
export { ARIAChat, createUserMessage, createARIAMessage } from './ARIAChat';

// Sub-components
export { ChatMessage, TypingIndicator } from './ChatMessage';
export { SuggestionPanel, DEFAULT_SUGGESTIONS } from './SuggestionPanel';
export { CitationTooltip, StandaloneCitationTooltip } from './CitationTooltip';

// Types
export type {
  // Message types
  ChatMessage as ChatMessageType,
  MessageSender,
  Citation,
  CitationRef,
  InterventionOption,
  ContextAwareness,
  ActionButton,
  // Suggestion types
  Suggestion,
  SuggestionContext,
  // Event types
  ARIACrossPanelEvent,
  // Component props
  PauseState,
  ARIAChatProps,
  ChatMessageProps,
  SuggestionPanelProps,
  CitationTooltipProps,
} from './types';
