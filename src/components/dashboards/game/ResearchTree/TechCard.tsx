'use client';

import React, { useCallback, useState } from 'react';
import styles from './ResearchTree.module.css';

/**
 * Technology status for display purposes
 */
export type TechStatus = 'locked' | 'available' | 'researching' | 'deployed';

/**
 * Crisis relevance information for a technology
 */
export interface CrisisRelevance {
  /** Crisis identifier (e.g., 'heat', 'ocean', 'nuclear') */
  crisisId: string;
  /** Display emoji for the crisis */
  emoji: string;
  /** Impact description (e.g., '40% coal reduction', 'pH+0.04 buffer') */
  impact: string;
}

/**
 * Props for the TechCard component
 */
export interface TechCardProps {
  /** Unique identifier for the technology */
  id: string;
  /** Technology display name */
  name: string;
  /** Current status of the technology */
  status: TechStatus;
  /** Research progress (0-1) when status is 'researching' */
  researchProgress?: number;
  /** Deployment level (0-1) when status is 'deployed' */
  deploymentLevel?: number;
  /** Year deployed (for deployed techs) */
  deployedYear?: number;
  /** Crisis this tech can address */
  crisisRelevance?: CrisisRelevance;
  /** Whether this tech is currently highlighted for crisis relevance */
  isHighlightedForCrisis?: boolean;
  /** Whether this card is being dragged */
  isDragging?: boolean;
  /** Whether another card is being dragged over this one */
  isDragOver?: boolean;
  /** Callback when tech card is clicked */
  onSelect?: (techId: string) => void;
  /** Callback when recommend button is clicked */
  onRecommend?: (techId: string) => void;
  /** Callback when crisis badge is clicked */
  onCrisisBadgeClick?: (techId: string, crisisId: string) => void;
  /** Callback when drag starts */
  onDragStart?: (techId: string, event: React.DragEvent) => void;
  /** Callback when drag ends */
  onDragEnd?: (techId: string, event: React.DragEvent) => void;
  /** Callback when dragged over */
  onDragOver?: (techId: string, event: React.DragEvent) => void;
  /** Callback when drag leaves */
  onDragLeave?: (techId: string, event: React.DragEvent) => void;
  /** Callback when dropped */
  onDrop?: (techId: string, event: React.DragEvent) => void;
}

/**
 * Get status display text based on tech status
 */
function getStatusText(
  status: TechStatus,
  researchProgress?: number,
  deployedYear?: number
): string {
  switch (status) {
    case 'locked':
      return 'Locked';
    case 'available':
      return 'Available';
    case 'researching':
      return `Researching ${Math.round((researchProgress ?? 0) * 100)}%`;
    case 'deployed':
      return deployedYear ? `Deployed ${deployedYear}` : 'Deployed';
  }
}

/**
 * TechCard - Individual technology card in the research tree
 *
 * Displays a single technology with its current status and allows
 * user interactions like selection, recommendation, and drag-drop.
 *
 * States:
 * - Locked: Striped background, dimmed, not interactive
 * - Available: Subtle highlight, can recommend
 * - Researching: Amber glow, pulse animation, shows progress
 * - Deployed: Green glow, full progress bar
 */
export function TechCard({
  id,
  name,
  status,
  researchProgress = 0,
  deploymentLevel = 1,
  deployedYear,
  crisisRelevance,
  isHighlightedForCrisis = false,
  isDragging = false,
  isDragOver = false,
  onSelect,
  onRecommend,
  onCrisisBadgeClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: TechCardProps) {
  const [isRecommending, setIsRecommending] = useState(false);

  // Build class names based on state
  const cardClasses = [
    styles.techCard,
    status === 'locked' && styles.techCardLocked,
    status === 'available' && styles.techCardAvailable,
    status === 'researching' && styles.techCardResearching,
    status === 'deployed' && styles.techCardDeployed,
    isHighlightedForCrisis && styles.techCardCrisisRelevant,
    isDragging && styles.techCardDragging,
    isDragOver && styles.techCardDragOver,
  ]
    .filter(Boolean)
    .join(' ');

  // Progress bar classes
  const progressBarClasses = [
    styles.techProgressBar,
    status === 'deployed' && styles.techProgressBarDeployed,
  ]
    .filter(Boolean)
    .join(' ');

  // Calculate progress width
  const progressWidth =
    status === 'deployed'
      ? deploymentLevel * 100
      : status === 'researching'
        ? researchProgress * 100
        : 0;

  // Handlers
  const handleClick = useCallback(() => {
    if (status !== 'locked' && onSelect) {
      onSelect(id);
    }
  }, [id, status, onSelect]);

  const handleRecommendClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onRecommend) {
        setIsRecommending(true);
        onRecommend(id);
        // Reset after animation
        setTimeout(() => setIsRecommending(false), 2000);
      }
    },
    [id, onRecommend]
  );

  const handleCrisisBadgeClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (crisisRelevance && onCrisisBadgeClick) {
        onCrisisBadgeClick(id, crisisRelevance.crisisId);
      }
    },
    [id, crisisRelevance, onCrisisBadgeClick]
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      if (status === 'available' && onDragStart) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
        e.dataTransfer.setData('techName', name);
        onDragStart(id, e);
      }
    },
    [id, name, status, onDragStart]
  );

  const handleDragEnd = useCallback(
    (e: React.DragEvent) => {
      if (onDragEnd) {
        onDragEnd(id, e);
      }
    },
    [id, onDragEnd]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (onDragOver) {
        onDragOver(id, e);
      }
    },
    [id, onDragOver]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      if (onDragLeave) {
        onDragLeave(id, e);
      }
    },
    [id, onDragLeave]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (onDrop) {
        onDrop(id, e);
      }
    },
    [id, onDrop]
  );

  // Determine if draggable
  const isDraggable = status === 'available';

  return (
    <div
      className={cardClasses}
      onClick={handleClick}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="button"
      tabIndex={status !== 'locked' ? 0 : -1}
      aria-label={`${name} - ${getStatusText(status, researchProgress, deployedYear)}`}
      aria-disabled={status === 'locked'}
    >
      {/* Crisis Badge */}
      {crisisRelevance && (
        <button
          className={styles.crisisBadge}
          onClick={handleCrisisBadgeClick}
          title="Click to view crisis details"
          aria-label={`Crisis relevance: ${crisisRelevance.impact}`}
        >
          <span>{crisisRelevance.emoji}</span>
          <span className={styles.crisisImpact}>{crisisRelevance.impact}</span>
        </button>
      )}

      {/* Tech Name */}
      <div className={styles.techName}>{name}</div>

      {/* Status Text */}
      <div className={styles.techStatus}>
        {getStatusText(status, researchProgress, deployedYear)}
      </div>

      {/* Progress Bar (for researching/deployed) */}
      {(status === 'researching' || status === 'deployed') && (
        <div className={styles.techProgress}>
          <div
            className={progressBarClasses}
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      )}

      {/* Recommend Button (for available techs) */}
      {status === 'available' && onRecommend && (
        <button
          className={styles.recommendBtn}
          onClick={handleRecommendClick}
          aria-label={`Recommend ${name} for research`}
          style={
            isRecommending
              ? {
                  background: 'rgba(0, 255, 136, 0.2)',
                  borderColor: '#00FF88',
                  color: '#00FF88',
                }
              : undefined
          }
        >
          {isRecommending ? 'Recommended' : 'Recommend'}
        </button>
      )}
    </div>
  );
}
