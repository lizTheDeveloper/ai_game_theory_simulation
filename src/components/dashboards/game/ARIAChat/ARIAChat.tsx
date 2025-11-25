'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './ARIAChat.module.css';
import { ChatMessage, TypingIndicator } from './ChatMessage';
import { SuggestionPanel } from './SuggestionPanel';
import type {
  ARIAChatProps,
  ChatMessage as ChatMessageType,
  Suggestion,
  InterventionOption,
  Citation,
  ARIACrossPanelEvent,
} from './types';

/**
 * ARIAChat - Main chat interface for the ARIA AI advisor
 *
 * ARIA (Alignment Research & Initiative Advisor) is the player's AI companion
 * that provides context-aware guidance, research citations, and cross-panel
 * coordination in the Super-Alignment to Utopia game.
 *
 * Features:
 * - Context awareness (knows what panel user is viewing)
 * - Citation tooltips for research-backed claims
 * - Multi-option responses with tradeoff analysis
 * - Quick action suggestions with cross-panel events
 * - Pause state indicator with resume button
 * - Typing indicator when ARIA is "thinking"
 *
 * Far-future aesthetic: black background, white text, #00F0FF accent
 */
export function ARIAChat({
  messages,
  suggestions = [],
  suggestionContext,
  pauseState,
  isTyping = false,
  onSendMessage,
  onSuggestionClick,
  onCrossPanelEvent,
  onResume,
  onMinimize,
  onClose,
  className,
}: ARIAChatProps) {
  // Input state
  const [inputValue, setInputValue] = useState('');

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    },
    []
  );

  // Handle send message
  const handleSendMessage = useCallback(() => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && onSendMessage) {
      onSendMessage(trimmedValue);
      setInputValue('');
    }
  }, [inputValue, onSendMessage]);

  // Handle enter key
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  // Handle suggestion click
  const handleSuggestionClick = useCallback(
    (suggestion: Suggestion) => {
      // Populate input with suggestion text
      setInputValue(suggestion.text);
      inputRef.current?.focus();

      // Emit cross-panel event if defined
      if (suggestion.event && onCrossPanelEvent) {
        onCrossPanelEvent(suggestion.event);
      }

      // Call callback
      onSuggestionClick?.(suggestion);
    },
    [onSuggestionClick, onCrossPanelEvent]
  );

  // Handle citation click
  const handleCitationClick = useCallback(
    (citation: Citation) => {
      // Open URL in new tab if available
      if (citation.url) {
        window.open(citation.url, '_blank', 'noopener,noreferrer');
      }
    },
    []
  );

  // Handle action button click
  const handleActionClick = useCallback(
    (event: ARIACrossPanelEvent) => {
      onCrossPanelEvent?.(event);
    },
    [onCrossPanelEvent]
  );

  // Handle intervention option click
  const handleInterventionClick = useCallback(
    (option: InterventionOption) => {
      // Build cross-panel event based on option
      if (option.techId && onCrossPanelEvent) {
        onCrossPanelEvent({
          type: 'highlight_tech',
          payload: {
            techId: option.techId,
            techName: option.title,
          },
        });
      } else if (option.region && onCrossPanelEvent) {
        onCrossPanelEvent({
          type: 'focus_region',
          payload: {
            region: option.region,
          },
        });
      }
    },
    [onCrossPanelEvent]
  );

  // Handle resume click
  const handleResumeClick = useCallback(() => {
    onResume?.();
    onCrossPanelEvent?.({
      type: 'resume_simulation',
      payload: {},
    });
  }, [onResume, onCrossPanelEvent]);

  return (
    <div className={`${styles.chatPanel} ${className || ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.ariaTitle}>
          <div className={styles.ariaAvatar}>
            <div className={styles.ariaParticles} />
          </div>
          <div className={styles.ariaInfo}>
            <div className={styles.ariaName}>ARIA</div>
            <div className={styles.ariaSubtitle}>
              Alignment Research &amp; Initiative Advisor
            </div>
          </div>
        </div>
        <div className={styles.windowControls}>
          {onMinimize && (
            <button
              className={styles.controlBtn}
              onClick={onMinimize}
              aria-label="Minimize"
            >
              _
            </button>
          )}
          {onClose && (
            <button
              className={styles.controlBtn}
              onClick={onClose}
              aria-label="Close"
            >
              x
            </button>
          )}
        </div>
      </div>

      {/* Pause Indicator */}
      {pauseState?.isPaused && (
        <div className={styles.pauseIndicator}>
          <div className={styles.pauseText}>
            <span className={styles.pauseIcon}>{'\u23F8'}</span>
            <span>
              {pauseState.reason || 'Simulation paused - take your time'}
            </span>
          </div>
          <button className={styles.resumeBtn} onClick={handleResumeClick}>
            {'\u25B6'} Resume
          </button>
        </div>
      )}

      {/* Messages */}
      <div className={styles.messagesContainer}>
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onCitationClick={handleCitationClick}
            onActionClick={handleActionClick}
            onInterventionClick={handleInterventionClick}
          />
        ))}

        {/* Typing Indicator */}
        {isTyping && <TypingIndicator />}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <SuggestionPanel
          suggestions={suggestions}
          context={suggestionContext}
          onSuggestionClick={handleSuggestionClick}
        />
      )}

      {/* Input Area */}
      <div className={styles.inputArea}>
        <input
          ref={inputRef}
          type="text"
          className={styles.inputField}
          placeholder="Type your question..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          aria-label="Message input"
        />
        <button
          className={styles.sendBtn}
          onClick={handleSendMessage}
          disabled={!inputValue.trim()}
          aria-label="Send message"
        >
          Ask
        </button>
      </div>
    </div>
  );
}

/**
 * Helper function to create a user message
 */
export function createUserMessage(content: string): ChatMessageType {
  return {
    id: `user-${Date.now()}`,
    sender: 'user',
    content,
    timestamp: new Date(),
  };
}

/**
 * Helper function to create an ARIA message
 */
export function createARIAMessage(
  content: string,
  options?: Partial<Omit<ChatMessageType, 'id' | 'sender' | 'timestamp'>>
): ChatMessageType {
  return {
    id: `aria-${Date.now()}`,
    sender: 'aria',
    content,
    timestamp: new Date(),
    ...options,
  };
}
