'use client';

import React, { useCallback, useState } from 'react';
import styles from './ARIAChat.module.css';
import type { Suggestion, SuggestionContext, SuggestionPanelProps } from './types';

/**
 * SuggestionPanel - Quick action suggestions panel for ARIA Chat
 *
 * Displays context-aware suggestions that help users take action.
 * Clicking a suggestion can trigger cross-panel events or populate
 * the chat input.
 *
 * Features:
 * - Context awareness indicator (what the suggestions are based on)
 * - Severity-based styling (normal, warning, urgent)
 * - Click feedback animation
 */
export function SuggestionPanel({
  suggestions,
  context,
  onSuggestionClick,
}: SuggestionPanelProps) {
  // Track which suggestion was just clicked for animation
  const [clickedId, setClickedId] = useState<string | null>(null);

  const handleSuggestionClick = useCallback(
    (suggestion: Suggestion) => {
      // Set clicked state for animation
      setClickedId(suggestion.id);

      // Clear animation after delay
      setTimeout(() => {
        setClickedId(null);
      }, 500);

      // Trigger callback
      onSuggestionClick?.(suggestion);
    },
    [onSuggestionClick]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, suggestion: Suggestion) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSuggestionClick(suggestion);
      }
    },
    [handleSuggestionClick]
  );

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className={styles.suggestionsPanel}>
      <div className={styles.suggestionsHeader}>
        <span className={styles.suggestionsTitle}>
          If I were you, I&apos;d check:
        </span>
        {context?.isContextual && (
          <span className={styles.suggestionsContext}>
            Based on: {context.basedOn}
          </span>
        )}
      </div>

      {suggestions.map((suggestion) => {
        // Determine subtext styling based on severity
        const subtextClass = suggestion.severity === 'urgent'
          ? styles.suggestionSubtextUrgent
          : suggestion.severity === 'warning'
            ? styles.suggestionSubtextWarning
            : undefined;

        return (
          <div
            key={suggestion.id}
            className={styles.suggestion}
            onClick={() => handleSuggestionClick(suggestion)}
            onKeyDown={(e) => handleKeyDown(e, suggestion)}
            role="button"
            tabIndex={0}
            aria-label={suggestion.text}
            style={
              clickedId === suggestion.id
                ? {
                    background: 'rgba(0, 240, 255, 0.05)',
                    borderColor: '#00F0FF',
                  }
                : undefined
            }
          >
            <span className={styles.suggestionIcon}>{suggestion.icon}</span>
            <div className={styles.suggestionContent}>
              <div className={styles.suggestionText}>{suggestion.text}</div>
              {suggestion.subtext && (
                <div className={`${styles.suggestionSubtext} ${subtextClass || ''}`}>
                  {suggestion.severity === 'warning' && '\u26A0\uFE0F '}
                  {suggestion.subtext}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Default suggestions for common scenarios
 */
export const DEFAULT_SUGGESTIONS: Suggestion[] = [
  {
    id: 'priority-review',
    icon: '\uD83D\uDD2C', // Microscope
    text: 'Review current research priorities',
    subtext: 'Optimize your Active Loop for maximum impact',
    severity: 'normal',
  },
  {
    id: 'crisis-status',
    icon: '\uD83D\uDCC8', // Chart
    text: 'What are the most urgent crises?',
    subtext: 'Get a breakdown of crisis severity levels',
    severity: 'normal',
  },
  {
    id: 'ai-optimization',
    icon: '\uD83C\uDFAF', // Target
    text: 'Run AI optimization on my strategy',
    subtext: 'Could save 3-5 months based on cascade patterns',
    severity: 'normal',
  },
];
