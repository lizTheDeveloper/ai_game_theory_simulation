'use client';

import React, { useMemo } from 'react';
import styles from './GlobalMap.module.css';
import type { CascadeFlowProps, FlowType } from './types';

/**
 * Get SVG styling for flow type
 */
function getFlowStyle(flowType: FlowType): {
  className: string;
  strokeWidth: number;
  dashArray: string;
} {
  switch (flowType) {
    case 'migration':
      return {
        className: styles.flowMigration,
        strokeWidth: 2,
        dashArray: '5,5',
      };
    case 'trade':
      return {
        className: styles.flowTrade,
        strokeWidth: 2,
        dashArray: '5,5',
      };
    case 'cascade':
      return {
        className: styles.flowCascade,
        strokeWidth: 3,
        dashArray: '5,5',
      };
    case 'ai-cooperation':
    default:
      return {
        className: styles.flowAI,
        strokeWidth: 2,
        dashArray: '5,5',
      };
  }
}

/**
 * CascadeFlow - Animated flow arrow between regions
 *
 * Displays animated dashed arrows showing:
 * - Migration flows (amber/orange)
 * - Trade routes (green)
 * - Crisis cascades (red, pulsing)
 * - AI cooperation (cyan)
 *
 * Far-future aesthetic with glowing animated paths.
 */
export function CascadeFlow({ flow, isAnimating = true }: CascadeFlowProps) {
  const flowStyle = useMemo(() => getFlowStyle(flow.type), [flow.type]);

  // Calculate animation duration based on intensity
  // Higher intensity = faster animation
  const animationDuration = useMemo(() => {
    const baseDuration = 2;
    const speedFactor = 1 + flow.intensity * 0.5;
    return baseDuration / speedFactor;
  }, [flow.intensity]);

  // Build class names
  const classNames = [
    styles.flowArrow,
    flowStyle.className,
    isAnimating && flow.isActive ? styles.flowAnimating : '',
    flow.type === 'cascade' ? styles.flowCascadePulse : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <g className={styles.flowGroup} data-flow-id={flow.id} data-flow-type={flow.type}>
      {/* Main flow path */}
      <path
        className={classNames}
        d={flow.svgPath}
        strokeWidth={flowStyle.strokeWidth * (1 + flow.intensity * 0.3)}
        strokeDasharray={flowStyle.dashArray}
        fill="none"
        style={
          {
            '--animation-duration': `${animationDuration}s`,
          } as React.CSSProperties
        }
        aria-label={flow.description}
      >
        <title>{flow.description}</title>
      </path>

      {/* Glow effect for cascade flows */}
      {flow.type === 'cascade' && flow.isActive && (
        <path
          className={styles.flowGlow}
          d={flow.svgPath}
          strokeWidth={flowStyle.strokeWidth * 2}
          strokeDasharray={flowStyle.dashArray}
          fill="none"
          style={
            {
              '--animation-duration': `${animationDuration}s`,
            } as React.CSSProperties
          }
        />
      )}
    </g>
  );
}

/**
 * CascadeFlowGroup - Container for multiple flow arrows
 *
 * Use this to wrap multiple CascadeFlow components in an SVG group.
 */
export function CascadeFlowGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <g className={`${styles.relationshipFlows} ${className || ''}`}>
      {children}
    </g>
  );
}

export default CascadeFlow;
