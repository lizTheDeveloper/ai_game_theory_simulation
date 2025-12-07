'use client';

import React, { useState, useCallback, useMemo } from 'react';
import type { AdvocacyAction, InfluenceDomain } from '@/game/types';
import { ADVOCACY_ACTIONS } from '@/game/data/advocacyActions';
import { INFLUENCE_BOUNDS } from '@/game/types';
import styles from './action-panel.module.css';

/**
 * Player resources for display
 */
export interface PlayerResources {
  reputation: number;
  politicalCapital: number;
  funding: number;
}

/**
 * Cooldown tracking
 */
export interface ActiveCooldowns {
  [actionId: string]: number; // month when cooldown ends
}

/**
 * ActionPanel props
 */
export interface ActionPanelProps {
  /** Player resources */
  resources: PlayerResources;
  /** Current simulation month */
  currentMonth: number;
  /** Active cooldowns map */
  activeCooldowns: ActiveCooldowns;
  /** Influence spent by domain */
  influenceByDomain: Record<InfluenceDomain, number>;
  /** Total influence spent */
  totalInfluenceSpent: number;
  // Note: gameState prop removed for now - will be added when prerequisite checking is implemented
  /** Callback when action is queued */
  onQueueAction: (actionId: string) => void;
  /** Whether panel is collapsed */
  collapsed?: boolean;
  /** Toggle collapse callback */
  onToggleCollapse?: () => void;
}

/**
 * Format percentage range for display (show uncertainty)
 * e.g., 0.025 -> "~2-3%"
 */
function formatEffectRange(baseEffect: number): string {
  const percent = baseEffect * 100;
  const low = Math.max(0, percent - 0.5);
  const high = percent + 0.5;
  return `~${low.toFixed(0)}-${high.toFixed(0)}%`;
}

/**
 * Get domain display name
 */
function getDomainLabel(domain: InfluenceDomain): string {
  const labels: Record<InfluenceDomain, string> = {
    ai_policy: 'AI Policy',
    climate_action: 'Climate',
    social_cohesion: 'Social',
    international_cooperation: 'Intl. Coop',
    research_direction: 'Research',
  };
  return labels[domain];
}

/**
 * Get domain icon
 */
function getDomainIcon(domain: InfluenceDomain): string {
  const icons: Record<InfluenceDomain, string> = {
    ai_policy: '01',
    climate_action: '02',
    social_cohesion: '03',
    international_cooperation: '04',
    research_direction: '05',
  };
  return icons[domain];
}

/**
 * ActionPanel - Display available advocacy actions with resources and cooldowns
 *
 * Far-future Elysium-inspired aesthetic:
 * - Black background with cyan/blue glowing accents
 * - Clean typography, generous spacing
 * - Progress bars for resources with subtle glow
 * - Cards with hover glow effects
 */
export function ActionPanel({
  resources,
  currentMonth,
  activeCooldowns,
  influenceByDomain,
  totalInfluenceSpent,
  onQueueAction,
  collapsed = false,
  onToggleCollapse,
}: ActionPanelProps) {
  const [selectedDomain, setSelectedDomain] = useState<InfluenceDomain | 'all'>('all');
  const [expandedAction, setExpandedAction] = useState<string | null>(null);

  // Get available actions based on game state
  const allActions = useMemo(() => {
    return Object.values(ADVOCACY_ACTIONS);
  }, []);

  // Filter by domain
  const filteredActions = useMemo(() => {
    if (selectedDomain === 'all') return allActions;
    return allActions.filter(a => a.domain === selectedDomain);
  }, [allActions, selectedDomain]);

  // Calculate remaining influence
  const remainingInfluence = INFLUENCE_BOUNDS.MAX_CUMULATIVE_EFFECT - totalInfluenceSpent;

  // Check if action can be executed
  const canExecuteAction = useCallback((action: AdvocacyAction): {
    canExecute: boolean;
    reason?: string
  } => {
    // Check cooldown
    const cooldownEnd = activeCooldowns[action.id];
    if (cooldownEnd !== undefined && currentMonth < cooldownEnd) {
      const remaining = cooldownEnd - currentMonth;
      return { canExecute: false, reason: `Cooldown: ${remaining} months` };
    }

    // Check resources
    if ((action.costs?.reputation ?? 0) > resources.reputation) {
      return { canExecute: false, reason: `Need ${action.costs?.reputation} reputation` };
    }
    if ((action.costs?.politicalCapital ?? 0) > resources.politicalCapital) {
      return { canExecute: false, reason: `Need ${action.costs?.politicalCapital} political capital` };
    }
    if ((action.costs?.funding ?? 0) > resources.funding) {
      return { canExecute: false, reason: `Need ${action.costs?.funding} funding` };
    }

    // Check influence bounds
    const domainInfluence = influenceByDomain[action.domain] || 0;
    const domainLimit = INFLUENCE_BOUNDS.MAX_DOMAIN_EFFECT[action.domain];
    if (domainInfluence + action.baseEffect > domainLimit) {
      return { canExecute: false, reason: `Domain limit reached` };
    }
    if (totalInfluenceSpent + action.baseEffect > INFLUENCE_BOUNDS.MAX_CUMULATIVE_EFFECT) {
      return { canExecute: false, reason: `Total influence limit reached` };
    }

    return { canExecute: true };
  }, [activeCooldowns, currentMonth, resources, influenceByDomain, totalInfluenceSpent]);

  // Handle action click
  const handleActionClick = useCallback((actionId: string) => {
    const action = ADVOCACY_ACTIONS[actionId as keyof typeof ADVOCACY_ACTIONS];
    if (!action) return;

    const { canExecute } = canExecuteAction(action);
    if (canExecute) {
      onQueueAction(actionId);
    }
  }, [canExecuteAction, onQueueAction]);

  // Toggle expanded action details
  const toggleExpanded = useCallback((actionId: string) => {
    setExpandedAction(prev => prev === actionId ? null : actionId);
  }, []);

  if (collapsed) {
    return (
      <div className={styles.panelCollapsed} onClick={onToggleCollapse}>
        <span className={styles.collapseIcon}>+</span>
        <span className={styles.collapseLabel}>Actions</span>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Player Actions</h2>
        {onToggleCollapse && (
          <button className={styles.collapseBtn} onClick={onToggleCollapse}>
            -
          </button>
        )}
      </div>

      {/* Resources Section */}
      <div className={styles.resourcesSection}>
        <h3 className={styles.sectionTitle}>Resources</h3>

        {/* Reputation */}
        <div className={styles.resourceItem}>
          <div className={styles.resourceHeader}>
            <span className={styles.resourceName}>Reputation</span>
            <span className={styles.resourceValue}>{Math.floor(resources.reputation)}/100</span>
          </div>
          <div className={styles.resourceBar}>
            <div
              className={styles.resourceBarFill}
              style={{ width: `${resources.reputation}%` }}
            />
          </div>
        </div>

        {/* Political Capital */}
        <div className={styles.resourceItem}>
          <div className={styles.resourceHeader}>
            <span className={styles.resourceName}>Political Capital</span>
            <span className={styles.resourceValue}>{Math.floor(resources.politicalCapital)}/100</span>
          </div>
          <div className={styles.resourceBar}>
            <div
              className={`${styles.resourceBarFill} ${styles.resourcePolitical}`}
              style={{ width: `${resources.politicalCapital}%` }}
            />
          </div>
        </div>

        {/* Funding */}
        <div className={styles.resourceItem}>
          <div className={styles.resourceHeader}>
            <span className={styles.resourceName}>Funding</span>
            <span className={styles.resourceValue}>${resources.funding.toFixed(1)}B</span>
          </div>
          <div className={styles.resourceBar}>
            <div
              className={`${styles.resourceBarFill} ${styles.resourceFunding}`}
              style={{ width: `${Math.min(100, resources.funding)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Influence Budget */}
      <div className={styles.influenceSection}>
        <h3 className={styles.sectionTitle}>Influence Budget</h3>
        <div className={styles.influenceTotal}>
          <span className={styles.influenceLabel}>Total Used</span>
          <span className={styles.influenceValue}>
            {(totalInfluenceSpent * 100).toFixed(1)}% / {(INFLUENCE_BOUNDS.MAX_CUMULATIVE_EFFECT * 100).toFixed(0)}%
          </span>
        </div>
        <div className={styles.influenceBar}>
          <div
            className={styles.influenceBarFill}
            style={{ width: `${(totalInfluenceSpent / INFLUENCE_BOUNDS.MAX_CUMULATIVE_EFFECT) * 100}%` }}
          />
        </div>
        <div className={styles.influenceRemaining}>
          {(remainingInfluence * 100).toFixed(1)}% remaining
        </div>
      </div>

      {/* Domain Filter */}
      <div className={styles.domainFilter}>
        <button
          className={`${styles.domainBtn} ${selectedDomain === 'all' ? styles.active : ''}`}
          onClick={() => setSelectedDomain('all')}
        >
          All
        </button>
        {(Object.keys(INFLUENCE_BOUNDS.MAX_DOMAIN_EFFECT) as InfluenceDomain[]).map(domain => (
          <button
            key={domain}
            className={`${styles.domainBtn} ${selectedDomain === domain ? styles.active : ''}`}
            onClick={() => setSelectedDomain(domain)}
            title={getDomainLabel(domain)}
          >
            {getDomainIcon(domain)}
          </button>
        ))}
      </div>

      {/* Actions List */}
      <div className={styles.actionsList}>
        {filteredActions.map(action => {
          const { canExecute, reason } = canExecuteAction(action);
          const isExpanded = expandedAction === action.id;
          const cooldownEnd = activeCooldowns[action.id];
          const isOnCooldown = cooldownEnd !== undefined && currentMonth < cooldownEnd;
          const cooldownRemaining = isOnCooldown ? cooldownEnd - currentMonth : 0;

          return (
            <div
              key={action.id}
              className={`${styles.actionCard} ${!canExecute ? styles.disabled : ''} ${isExpanded ? styles.expanded : ''}`}
            >
              <div className={styles.actionMain} onClick={() => toggleExpanded(action.id)}>
                <div className={styles.actionHeader}>
                  <span className={styles.actionDomain}>{getDomainLabel(action.domain)}</span>
                  {isOnCooldown && (
                    <span className={styles.cooldownBadge}>{cooldownRemaining}mo</span>
                  )}
                </div>
                <h4 className={styles.actionName}>{action.name}</h4>
                <div className={styles.actionEffect}>
                  {formatEffectRange(action.baseEffect)} effect over {action.duration} months
                </div>
                <div className={styles.actionCosts}>
                  {action.costs?.reputation && action.costs?.reputation > 0 && (
                    <span className={styles.cost}>R:{action.costs?.reputation}</span>
                  )}
                  {action.costs?.politicalCapital && action.costs?.politicalCapital > 0 && (
                    <span className={styles.cost}>PC:{action.costs?.politicalCapital}</span>
                  )}
                  {action.costs?.funding && action.costs?.funding > 0 && (
                    <span className={styles.cost}>${action.costs?.funding}B</span>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className={styles.actionDetails}>
                  <p className={styles.actionDescription}>{action.description}</p>
                  <div className={styles.actionMeta}>
                    <span>Cooldown: {action.cooldown} months</span>
                    <span>Max cumulative: {(action.maxCumulativeEffect * 100).toFixed(0)}%</span>
                  </div>
                  {action.researchSources && action.researchSources.length > 0 && (
                    <div className={styles.actionSources}>
                      <span className={styles.sourcesLabel}>Sources:</span>
                      <ul className={styles.sourcesList}>
                        {action.researchSources?.slice(0, 2).map((source, i) => (
                          <li key={i} className={styles.sourceItem}>{source}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Queue Button */}
              <button
                className={`${styles.queueBtn} ${!canExecute ? styles.disabled : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleActionClick(action.id);
                }}
                disabled={!canExecute}
                title={reason}
              >
                {canExecute ? 'Queue' : reason}
              </button>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredActions.length === 0 && (
        <div className={styles.emptyState}>
          No actions available for this domain
        </div>
      )}
    </div>
  );
}

export default ActionPanel;
