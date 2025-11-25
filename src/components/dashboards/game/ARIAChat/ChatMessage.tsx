'use client';

import React, { useCallback, useState } from 'react';
import styles from './ARIAChat.module.css';
import { CitationTooltip } from './CitationTooltip';
import type {
  ChatMessage as ChatMessageType,
  ChatMessageProps,
  InterventionOption,
  ActionButton,
  Citation,
  ARIACrossPanelEvent,
} from './types';

/**
 * Get variant class for intervention option
 */
function getInterventionClass(variant: InterventionOption['variant']): string {
  switch (variant) {
    case 'immediate':
      return styles.interventionImmediate;
    case 'medium':
      return styles.interventionMedium;
    case 'systemic':
      return styles.interventionSystemic;
  }
}

/**
 * ChatMessage - Individual message component for ARIA Chat
 *
 * Renders a single chat message with support for:
 * - User messages (right-aligned, subtle styling)
 * - ARIA messages (left-aligned, cyan glow styling)
 * - Context awareness banners
 * - Citation tooltips
 * - Intervention options with click actions
 * - Action buttons for cross-panel coordination
 *
 * Far-future aesthetic with glowing accents.
 */
export function ChatMessage({
  message,
  onCitationClick,
  onActionClick,
  onInterventionClick,
}: ChatMessageProps) {
  // Track clicked action buttons for feedback
  const [clickedActionId, setClickedActionId] = useState<string | null>(null);

  const isUser = message.sender === 'user';

  // Handle action button click
  const handleActionClick = useCallback(
    (action: ActionButton) => {
      setClickedActionId(action.id);

      // Reset after animation
      setTimeout(() => {
        setClickedActionId(null);
      }, 2000);

      onActionClick?.(action.event);
    },
    [onActionClick]
  );

  // Handle intervention option click
  const handleInterventionClick = useCallback(
    (option: InterventionOption) => {
      onInterventionClick?.(option);
    },
    [onInterventionClick]
  );

  // Handle citation click
  const handleCitationClick = useCallback(
    (citation: Citation) => {
      onCitationClick?.(citation);
    },
    [onCitationClick]
  );

  // Build message classes
  const messageClasses = [
    styles.message,
    isUser ? styles.messageUser : styles.messageAria,
    message.isFaded && styles.messageFaded,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={messageClasses}>
      <div className={styles.messageBubble}>
        {/* Context Awareness Banner (ARIA only) */}
        {!isUser && message.contextAwareness && (
          <div className={styles.contextBanner}>
            <span className={styles.contextIcon}>{'\uD83D\uDCCD'}</span>
            <span>Context: {message.contextAwareness.description}</span>
          </div>
        )}

        {/* Message Content */}
        <MessageContent
          content={message.content}
          citations={message.citations}
          onCitationClick={handleCitationClick}
        />

        {/* Intervention Options */}
        {message.interventionOptions && message.interventionOptions.length > 0 && (
          <div>
            {message.interventionOptions.map((option) => (
              <InterventionOptionCard
                key={option.id}
                option={option}
                onClick={handleInterventionClick}
              />
            ))}

            {/* Uncertainty footer */}
            <div className={styles.uncertaintyFooter}>
              Each pathway shifts probability distributions differently.
              No option is guaranteed. What matters most to you?
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {message.actionButtons && message.actionButtons.length > 0 && (
          <div className={styles.actionButtons}>
            {message.actionButtons.map((action) => (
              <button
                key={action.id}
                className={`${styles.actionBtn} ${
                  clickedActionId === action.id ? styles.actionBtnClicked : ''
                }`}
                onClick={() => handleActionClick(action)}
              >
                <span>{action.icon}</span>
                <span>
                  {clickedActionId === action.id
                    ? '\u2713 Done'
                    : action.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * MessageContent - Renders message text with inline citations
 */
interface MessageContentProps {
  content: string;
  citations?: Citation[];
  onCitationClick?: (citation: Citation) => void;
}

function MessageContent({
  content,
  citations,
  onCitationClick,
}: MessageContentProps) {
  // If no citations, render plain content
  if (!citations || citations.length === 0) {
    return <div dangerouslySetInnerHTML={{ __html: formatMessageContent(content) }} />;
  }

  // Build citation map for quick lookup
  const citationMap = new Map(citations.map((c) => [c.id, c]));

  // Parse content for citation markers [citation:id]
  const parts = parseContentWithCitations(content);

  return (
    <div>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return (
            <span
              key={index}
              dangerouslySetInnerHTML={{ __html: formatMessageContent(part.content) }}
            />
          );
        }

        // Citation reference
        const citation = citationMap.get(part.citationId);
        if (!citation) {
          return <span key={index}>[{part.citationId}]</span>;
        }

        return (
          <CitationTooltip
            key={index}
            citation={citation}
            onLinkClick={(url) => onCitationClick?.(citation)}
          >
            {citation.label}
          </CitationTooltip>
        );
      })}
    </div>
  );
}

/**
 * Parse content for citation markers
 */
type ContentPart =
  | { type: 'text'; content: string }
  | { type: 'citation'; citationId: string };

function parseContentWithCitations(content: string): ContentPart[] {
  const parts: ContentPart[] = [];
  const citationRegex = /\[citation:([^\]]+)\]/g;

  let lastIndex = 0;
  let match;

  while ((match = citationRegex.exec(content)) !== null) {
    // Add text before citation
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex, match.index),
      });
    }

    // Add citation
    parts.push({
      type: 'citation',
      citationId: match[1],
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.slice(lastIndex),
    });
  }

  return parts;
}

/**
 * Format message content with basic HTML styling
 */
function formatMessageContent(content: string): string {
  // Convert markdown-like syntax to HTML
  let formatted = content;

  // Bold: **text** or __text__
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // Highlight: {{text}}
  formatted = formatted.replace(
    /\{\{([^}]+)\}\}/g,
    '<span class="' + styles.highlight + '">$1</span>'
  );

  // Metric: `text`
  formatted = formatted.replace(
    /`([^`]+)`/g,
    '<span class="' + styles.metric + '">$1</span>'
  );

  // Warning: !!text!!
  formatted = formatted.replace(
    /!!([^!]+)!!/g,
    '<span class="' + styles.warningText + '">$1</span>'
  );

  // Line breaks
  formatted = formatted.replace(/\n/g, '<br />');

  return formatted;
}

/**
 * InterventionOptionCard - Clickable intervention option
 */
interface InterventionOptionCardProps {
  option: InterventionOption;
  onClick?: (option: InterventionOption) => void;
}

function InterventionOptionCard({
  option,
  onClick,
}: InterventionOptionCardProps) {
  const variantClass = getInterventionClass(option.variant);

  const handleClick = useCallback(() => {
    onClick?.(option);
  }, [option, onClick]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.(option);
      }
    },
    [option, onClick]
  );

  return (
    <div
      className={`${styles.interventionOption} ${variantClass}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${option.label}: ${option.title}`}
    >
      <div className={styles.interventionTitle}>
        {option.label}: {option.title}
      </div>
      <ul className={styles.interventionList}>
        {option.requirements.map((req, i) => (
          <li key={`req-${i}`}>Requires: {req}</li>
        ))}
        {option.timeline && <li>Timeline: {option.timeline}</li>}
        {option.effects.map((effect, i) => (
          <li key={`effect-${i}`}>Effect: {effect}</li>
        ))}
        {option.tradeoffs.map((tradeoff, i) => (
          <li key={`tradeoff-${i}`}>Tradeoff: {tradeoff}</li>
        ))}
        {option.successProbability !== undefined && (
          <li>
            Probability of success:{' '}
            <span className={styles.metric}>
              {Math.round(option.successProbability * 100)}%
            </span>
          </li>
        )}
      </ul>
    </div>
  );
}

/**
 * TypingIndicator - Shows when ARIA is generating a response
 */
export function TypingIndicator() {
  return (
    <div className={styles.typingIndicator}>
      <span>ARIA is analyzing</span>
      <div className={styles.typingDots}>
        <div className={styles.typingDot} />
        <div className={styles.typingDot} />
        <div className={styles.typingDot} />
      </div>
    </div>
  );
}
