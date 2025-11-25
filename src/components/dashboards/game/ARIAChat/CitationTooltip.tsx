'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import styles from './ARIAChat.module.css';
import type { Citation } from './types';

/**
 * Props for CitationTooltip component
 */
export interface CitationTooltipProps {
  /** The citation to display */
  citation: Citation;
  /** The text that triggers the tooltip */
  children: React.ReactNode;
  /** Callback when citation link is clicked */
  onLinkClick?: (url: string) => void;
}

/**
 * CitationTooltip - Hoverable citation reference with tooltip
 *
 * Displays a citation link that shows a tooltip with full citation
 * information on hover. Supports optional URL linking to the source.
 *
 * Far-future aesthetic with glowing cyan accents.
 */
export function CitationTooltip({
  citation,
  children,
  onLinkClick,
}: CitationTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle mouse enter with small delay for better UX
  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 100);
  }, []);

  // Handle mouse leave with delay to allow moving to tooltip
  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 150);
  }, []);

  // Handle click on citation
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (citation.url && onLinkClick) {
        onLinkClick(citation.url);
      }
    },
    [citation.url, onLinkClick]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <span
      ref={triggerRef}
      className={styles.citationLink}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Citation: ${citation.label}`}
      aria-describedby={isVisible ? `citation-tooltip-${citation.id}` : undefined}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (citation.url && onLinkClick) {
            onLinkClick(citation.url);
          }
        }
      }}
    >
      {children || citation.label}

      <div
        ref={tooltipRef}
        id={`citation-tooltip-${citation.id}`}
        className={styles.citationTooltip}
        role="tooltip"
        aria-hidden={!isVisible}
        style={{
          opacity: isVisible ? 1 : 0,
          visibility: isVisible ? 'visible' : 'hidden',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={styles.citationHeader}>{citation.label}</div>
        <div className={styles.citationText}>{citation.fullText}</div>
        {citation.url && (
          <span className={styles.citationUrl}>{citation.url}</span>
        )}
      </div>
    </span>
  );
}

/**
 * Standalone tooltip component for manual positioning
 */
export interface StandaloneCitationTooltipProps {
  /** The citation to display */
  citation: Citation;
  /** Whether the tooltip is visible */
  isVisible: boolean;
  /** Position in viewport */
  position?: { x: number; y: number };
  /** Callback when link is clicked */
  onLinkClick?: (url: string) => void;
}

export function StandaloneCitationTooltip({
  citation,
  isVisible,
  position,
  onLinkClick,
}: StandaloneCitationTooltipProps) {
  const handleLinkClick = useCallback(() => {
    if (citation.url && onLinkClick) {
      onLinkClick(citation.url);
    }
  }, [citation.url, onLinkClick]);

  if (!isVisible) return null;

  return (
    <div
      className={styles.citationTooltip}
      role="tooltip"
      style={{
        position: 'fixed',
        left: position?.x ?? 0,
        top: position?.y ?? 0,
        transform: 'translateX(-50%) translateY(-100%)',
        opacity: 1,
        visibility: 'visible',
        pointerEvents: 'auto',
      }}
    >
      <div className={styles.citationHeader}>{citation.label}</div>
      <div className={styles.citationText}>{citation.fullText}</div>
      {citation.url && (
        <button
          className={styles.citationUrl}
          onClick={handleLinkClick}
          style={{ cursor: 'pointer', background: 'none', border: 'none' }}
        >
          {citation.url}
        </button>
      )}
    </div>
  );
}
