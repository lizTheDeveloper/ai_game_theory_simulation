'use client';

import React, { useCallback, useState, useRef } from 'react';
import styles from './ResearchTree.module.css';

/**
 * Priority node type - represents an item in the research queue
 */
export type LoopNodeType = 'crisis' | 'research' | 'tech';

/**
 * A single node in the active research loop
 */
export interface LoopNode {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Node type for styling */
  type: LoopNodeType;
  /** Display emoji */
  emoji: string;
  /** Additional details (e.g., "Death toll: 847/day") */
  details?: string;
  /** Estimated time in months to complete */
  timeEstimate: number;
  /** Priority order (1 = highest) */
  priority: number;
}

/**
 * Delayed tech item (not in active queue)
 */
export interface DelayedTech {
  id: string;
  name: string;
  /** Delay in months compared to prioritized path */
  delayMonths: number;
}

/**
 * Props for the ActiveLoop component
 */
export interface ActiveLoopProps {
  /** Nodes in the priority queue */
  nodes: LoopNode[];
  /** Items not currently prioritized */
  delayedTechs?: DelayedTech[];
  /** Total techs unlocked vs available */
  unlockProgress?: { unlocked: number; total: number };
  /** Whether reorder mode is active */
  isReordering?: boolean;
  /** Callback when node priority changes via drag-drop */
  onReorder?: (fromIndex: number, toIndex: number) => void;
  /** Callback when defer button clicked */
  onDefer?: (nodeId: string) => void;
  /** Callback when accelerate button clicked */
  onAccelerate?: (nodeId: string) => void;
  /** Callback when reorder mode toggled */
  onToggleReorder?: () => void;
  /** Callback when AI optimize clicked */
  onOptimize?: () => void;
  /** Callback when execute loop clicked */
  onExecute?: () => void;
  /** Callback when delayed tech is clicked */
  onDelayedTechClick?: (techId: string) => void;
  /** Callback when node is clicked */
  onNodeClick?: (nodeId: string) => void;
}

/**
 * Calculate total time estimate from nodes
 */
function calculateTotalTime(nodes: LoopNode[]): number {
  return nodes.reduce((sum, node) => sum + node.timeEstimate, 0);
}

/**
 * ActiveLoop - Priority queue panel for research management
 *
 * Displays the current research priority queue with:
 * - Drag-drop reordering
 * - Time estimates between nodes
 * - Defer/Accelerate buttons on hover
 * - AI optimization button
 * - Execute loop action
 *
 * Positioned in top-right of research tree (per V4 mockup)
 */
export function ActiveLoop({
  nodes,
  delayedTechs = [],
  unlockProgress,
  isReordering = false,
  onReorder,
  onDefer,
  onAccelerate,
  onToggleReorder,
  onOptimize,
  onExecute,
  onDelayedTechClick,
  onNodeClick,
}: ActiveLoopProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const dragNodeRef = useRef<HTMLDivElement | null>(null);

  const totalTime = calculateTotalTime(nodes);

  // Drag handlers
  const handleDragStart = useCallback(
    (index: number, e: React.DragEvent<HTMLDivElement>) => {
      setDraggedIndex(index);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(index));
      dragNodeRef.current = e.currentTarget;
    },
    []
  );

  const handleDragOver = useCallback(
    (index: number, e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (draggedIndex !== null && draggedIndex !== index) {
        setDragOverIndex(index);
      }
    },
    [draggedIndex]
  );

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback(
    (targetIndex: number, e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (draggedIndex !== null && draggedIndex !== targetIndex && onReorder) {
        onReorder(draggedIndex, targetIndex);
      }
      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    [draggedIndex, onReorder]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  // Action handlers
  const handleOptimize = useCallback(() => {
    if (onOptimize) {
      setIsOptimizing(true);
      onOptimize();
      // Reset after animation
      setTimeout(() => setIsOptimizing(false), 1500);
    }
  }, [onOptimize]);

  const handleExecute = useCallback(() => {
    if (onExecute) {
      setIsExecuting(true);
      onExecute();
      // Reset after animation
      setTimeout(() => setIsExecuting(false), 2000);
    }
  }, [onExecute]);

  // Get node style classes based on type
  const getNodeClasses = (node: LoopNode, index: number): string => {
    const classes = [styles.loopNode];
    if (node.type === 'crisis') classes.push(styles.loopNodeCrisis);
    if (node.type === 'tech') classes.push(styles.loopNodeSuccess);
    if (draggedIndex === index) classes.push(styles.loopNodeDragging);
    return classes.filter(Boolean).join(' ');
  };

  const getNameClasses = (node: LoopNode): string => {
    const classes = [styles.loopNodeName];
    if (node.type === 'crisis') classes.push(styles.loopNodeNameCrisis);
    if (node.type === 'tech') classes.push(styles.loopNodeNameSuccess);
    return classes.filter(Boolean).join(' ');
  };

  return (
    <div className={styles.activeLoopPanel}>
      {/* Header */}
      <div className={styles.loopHeader}>
        <div className={styles.loopTitle}>Active Loop</div>
        <div className={styles.timeEstimate}>
          Est. {totalTime} months to completion
        </div>
      </div>

      {/* Priority Nodes */}
      <div className={styles.loopNodes}>
        {nodes.map((node, index) => (
          <React.Fragment key={node.id}>
            {/* Node */}
            <div
              className={getNodeClasses(node, index)}
              draggable={isReordering}
              onDragStart={(e) => handleDragStart(index, e)}
              onDragOver={(e) => handleDragOver(index, e)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(index, e)}
              onDragEnd={handleDragEnd}
              onClick={() => onNodeClick?.(node.id)}
              style={
                dragOverIndex === index
                  ? {
                      background: 'rgba(0, 240, 255, 0.08)',
                      borderColor: '#00F0FF',
                      boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
                    }
                  : undefined
              }
              role="listitem"
              aria-label={`Priority ${node.priority}: ${node.name}`}
            >
              <span className={styles.loopNodeIcon}>{node.emoji}</span>
              <div className={styles.loopNodeContent}>
                <div className={getNameClasses(node)}>{node.name}</div>
                {node.details && (
                  <div className={styles.loopNodeDetails}>{node.details}</div>
                )}
              </div>
              <div className={styles.priorityBadge}>P{node.priority}</div>

              {/* Action buttons (visible on hover) */}
              <div className={styles.nodeActions}>
                {onDefer && (
                  <button
                    className={`${styles.actionIcon} ${styles.actionIconDefer}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDefer(node.id);
                    }}
                    title="Defer"
                    aria-label={`Defer ${node.name}`}
                  >
                    ||
                  </button>
                )}
                {onAccelerate && (
                  <button
                    className={`${styles.actionIcon} ${styles.actionIconAccelerate}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAccelerate(node.id);
                    }}
                    title="Accelerate"
                    aria-label={`Accelerate ${node.name}`}
                  >
                    &gt;&gt;
                  </button>
                )}
              </div>
            </div>

            {/* Time connector between nodes */}
            {index < nodes.length - 1 && (
              <div className={styles.timeConnector}>
                <span style={{ userSelect: 'none' }}>&#8595;</span>
                <div className={styles.timeDelay}>
                  {node.timeEstimate}mo delay
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Action Buttons */}
      <div className={styles.loopActions}>
        <button
          className={`${styles.reorderBtn} ${isReordering ? styles.reorderBtnActive : ''}`}
          onClick={onToggleReorder}
          aria-pressed={isReordering}
        >
          Reorder
        </button>
        <button
          className={styles.optimizeBtn}
          onClick={handleOptimize}
          disabled={isOptimizing}
        >
          {isOptimizing ? 'Optimizing...' : 'AI Optimize'}
        </button>
      </div>

      {/* Execute Button */}
      <button
        className={styles.executeBtn}
        onClick={handleExecute}
        disabled={isExecuting}
        style={
          isExecuting
            ? {
                background: 'rgba(0, 255, 136, 0.2)',
                borderColor: '#00FF88',
              }
            : undefined
        }
      >
        {isExecuting ? 'Executing...' : 'Execute Loop'}
        {unlockProgress && (
          <span className={styles.unlockStatus}>
            {unlockProgress.unlocked} of {unlockProgress.total} unlocked
          </span>
        )}
      </button>

      {/* Delayed Items Section */}
      {delayedTechs.length > 0 && (
        <div className={styles.delayedSection}>
          <div className={styles.delayedTitle}>Not Prioritized (Delayed)</div>
          <div className={styles.delayedItems}>
            {delayedTechs.slice(0, 3).map((tech) => (
              <span
                key={tech.id}
                className={styles.delayedTech}
                onClick={() => onDelayedTechClick?.(tech.id)}
                role="button"
                tabIndex={0}
                aria-label={`${tech.name}, delayed by ${tech.delayMonths} months`}
              >
                {tech.name} (+{tech.delayMonths}mo)
              </span>
            ))}
            {delayedTechs.length > 3 && (
              <span className={styles.delayedTech}>
                +{delayedTechs.length - 3} others...
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
