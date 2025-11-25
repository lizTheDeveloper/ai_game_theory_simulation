'use client';

import React, { useCallback, useRef, useEffect, useState } from 'react';
import styles from './GlobalMap.module.css';
import type {
  CrisisIndicatorProps,
  CrisisData,
  CrisisMenuAction,
  CrisisSeverity,
  MapCrossPanelEvent,
  RegionId,
} from './types';

/**
 * Get pulse animation class based on severity
 */
function getPulseClass(severity: CrisisSeverity): string {
  switch (severity) {
    case 'catastrophic':
      return styles.crisisPulseFast;
    case 'critical':
      return styles.crisisPulseMedium;
    case 'warning':
    default:
      return styles.crisisPulse;
  }
}

/**
 * Build default crisis menu actions
 */
function getDefaultMenuActions(
  crisis: CrisisData,
  regionId: RegionId
): CrisisMenuAction[] {
  return [
    {
      id: 'ask-aria',
      icon: '????',
      label: 'Ask ARIA why this is happening',
      event: {
        type: 'aria_ask',
        payload: {
          crisisId: crisis.id,
          crisisType: crisis.type,
          question: `Why is the ${crisis.name} crisis happening in this region?`,
        },
      },
    },
    {
      id: 'view-tech',
      icon: '????',
      label: `View relevant research (${crisis.relatedTechIds?.length || 0} techs)`,
      event: {
        type: 'highlight_tech',
        payload: {
          techId: crisis.relatedTechIds?.[0],
          crisisId: crisis.id,
        },
      },
    },
    {
      id: 'propose-intervention',
      icon: '????',
      label: 'Propose intervention',
      event: {
        type: 'crisis_analyze',
        payload: {
          crisisId: crisis.id,
          crisisType: crisis.type,
          regionId,
        },
      },
    },
    {
      id: 'compare',
      icon: '????',
      label: 'Compare to other regions',
      event: {
        type: 'region_focused',
        payload: {
          crisisId: crisis.id,
          crisisType: crisis.type,
        },
      },
    },
  ];
}

/**
 * CrisisIndicator - Crisis point marker with pulse animation
 *
 * Displays a crisis indicator on the map with:
 * - Severity-based pulse animation (faster for critical)
 * - Click to open action menu
 * - Ripple effects for cascading crises
 * - ARIA integration for context-aware queries
 *
 * Far-future aesthetic with glowing pulse effects.
 */
export function CrisisIndicator({
  crisis,
  regionId,
  position,
  isMenuOpen,
  onClick,
  onMenuAction,
  onMenuClose,
}: CrisisIndicatorProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<{ left: number; top: number }>({
    left: 0,
    top: 0,
  });

  // Handle click outside to close menu
  useEffect(() => {
    if (!isMenuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        indicatorRef.current &&
        !indicatorRef.current.contains(event.target as Node)
      ) {
        onMenuClose?.();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen, onMenuClose]);

  // Calculate menu position when opening
  useEffect(() => {
    if (isMenuOpen && indicatorRef.current) {
      const rect = indicatorRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const menuWidth = 220;
      const menuHeight = 160;

      let left = rect.right + 10;
      let top = rect.top;

      // Check right edge overflow
      if (left + menuWidth > viewportWidth - 20) {
        left = rect.left - menuWidth - 10;
      }

      // Check bottom edge overflow
      if (top + menuHeight > viewportHeight - 100) {
        top = rect.top - menuHeight + 30;
      }

      setMenuPosition({ left, top });
    }
  }, [isMenuOpen]);

  const handleIndicatorClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onClick?.(crisis);
    },
    [crisis, onClick]
  );

  const handleMenuItemClick = useCallback(
    (action: CrisisMenuAction) => {
      onMenuAction?.(action, crisis);
      onMenuClose?.();
    },
    [crisis, onMenuAction, onMenuClose]
  );

  // Build menu actions
  const menuActions = getDefaultMenuActions(crisis, regionId);

  // Severity color
  const severityColor =
    crisis.severity === 'catastrophic'
      ? '#FF0040'
      : crisis.severity === 'critical'
        ? '#FF6B00'
        : '#FFB000';

  return (
    <>
      {/* Crisis Indicator */}
      <div
        ref={indicatorRef}
        className={`${styles.crisisIndicator} ${getPulseClass(crisis.severity)}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          '--severity-color': severityColor,
        } as React.CSSProperties}
        onClick={handleIndicatorClick}
        title={`${crisis.name} - ${crisis.severity}`}
        role="button"
        tabIndex={0}
        aria-label={`${crisis.severity} crisis: ${crisis.name}`}
        aria-expanded={isMenuOpen}
        data-cascade={crisis.isCascading}
      >
        {crisis.icon}
      </div>

      {/* Cascade Ripple Effects */}
      {crisis.isCascading && (
        <>
          <div
            className={styles.cascadeRipple}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              '--severity-color': severityColor,
            } as React.CSSProperties}
          />
          <div
            className={styles.cascadeRipple}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              '--severity-color': severityColor,
              animationDelay: '0.7s',
            } as React.CSSProperties}
          />
        </>
      )}

      {/* Crisis Action Menu */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className={styles.crisisMenu}
          style={{
            left: `${menuPosition.left}px`,
            top: `${menuPosition.top}px`,
          }}
          role="menu"
          aria-label={`Actions for ${crisis.name} crisis`}
        >
          <div className={styles.crisisMenuHeader}>
            <span className={styles.crisisMenuIcon}>{crisis.icon}</span>
            <span className={styles.crisisMenuTitle}>{crisis.name}</span>
            <span
              className={styles.crisisMenuSeverity}
              style={{ color: severityColor }}
            >
              {crisis.severity.toUpperCase()}
            </span>
          </div>
          <div className={styles.crisisMenuDivider} />
          {menuActions.map((action) => (
            <div
              key={action.id}
              className={styles.crisisMenuItem}
              onClick={() => handleMenuItemClick(action)}
              role="menuitem"
              tabIndex={0}
            >
              <span className={styles.crisisMenuItemIcon}>{action.icon}</span>
              <span className={styles.crisisMenuItemLabel}>{action.label}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default CrisisIndicator;
