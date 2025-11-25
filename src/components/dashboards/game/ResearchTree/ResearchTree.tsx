'use client';

import React, { useCallback, useMemo, useState } from 'react';
import styles from './ResearchTree.module.css';
import { TechCard, TechStatus, CrisisRelevance } from './TechCard';
import {
  CategoryFilter,
  TechCategory,
  GRID_CATEGORIES,
  DEFAULT_CATEGORIES,
} from './CategoryFilter';
import { ActiveLoop, LoopNode, DelayedTech } from './ActiveLoop';

// ============================================================================
// Types
// ============================================================================

/**
 * Technology tier (0-4) matching comprehensiveTechTree.ts
 */
export type TechTier = 0 | 1 | 2 | 3 | 4;

/**
 * Technology data for display
 */
export interface TechDisplayData {
  id: string;
  name: string;
  category: TechCategory;
  tier: TechTier;
  status: TechStatus;
  researchProgress?: number;
  deploymentLevel?: number;
  deployedYear?: number;
  crisisRelevance?: CrisisRelevance;
  /** Minimum AI capability required */
  minAICapability?: number;
  /** Research cost in $M */
  researchCost?: number;
  /** Time to research in months */
  researchMonths?: number;
}

/**
 * Research tree statistics
 */
export interface ResearchStats {
  unlockedCount: number;
  totalCount: number;
  researchFunding: string;
  aiCapability: number;
}

/**
 * Cross-panel event for coordination
 */
export interface CrossPanelEvent {
  type: 'tech_selected' | 'crisis_clicked' | 'tech_recommended';
  payload: {
    techId?: string;
    crisisId?: string;
    region?: string;
  };
}

/**
 * Props for the ResearchTree component
 */
export interface ResearchTreeProps {
  /** All technologies to display */
  technologies: TechDisplayData[];
  /** Research statistics for header */
  stats?: ResearchStats;
  /** Priority queue nodes for active loop */
  activeLoopNodes?: LoopNode[];
  /** Technologies not currently prioritized */
  delayedTechs?: DelayedTech[];
  /** ID of tech currently highlighted for crisis */
  highlightedTechId?: string;
  /** Callback when technology is selected */
  onTechSelect?: (techId: string) => void;
  /** Callback when technology is recommended */
  onTechRecommend?: (techId: string) => void;
  /** Callback for cross-panel coordination */
  onCrossPanelEvent?: (event: CrossPanelEvent) => void;
  /** Callback when active loop is reordered */
  onLoopReorder?: (fromIndex: number, toIndex: number) => void;
  /** Callback when node is deferred */
  onLoopDefer?: (nodeId: string) => void;
  /** Callback when node is accelerated */
  onLoopAccelerate?: (nodeId: string) => void;
  /** Callback when AI optimize is clicked */
  onLoopOptimize?: () => void;
  /** Callback when execute loop is clicked */
  onLoopExecute?: () => void;
  /** Count of available techs needing attention */
  notificationCount?: number;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Tier configuration for display
 */
const TIER_CONFIG: Array<{
  tier: TechTier;
  name: string;
  requirement: string;
}> = [
  { tier: 0, name: 'Tier 0', requirement: 'AI Cap: 0.0-0.5' },
  { tier: 1, name: 'Tier 1', requirement: 'AI Cap: 0.5-1.0' },
  { tier: 2, name: 'Tier 2', requirement: 'AI Cap: 1.0-3.0' },
  { tier: 3, name: 'Tier 3', requirement: 'AI Cap: 3.0+' },
];

/**
 * Category display mapping for grid rows
 */
const CATEGORY_DISPLAY_ORDER: TechCategory[] = [
  'alignment',
  'social',
  'medical',
  'energy',
  'climate',
  'agriculture',
];

// ============================================================================
// Component
// ============================================================================

/**
 * ResearchTree - Main research tree dashboard component
 *
 * Displays all technologies in a tier x category grid with:
 * - Category filtering
 * - Tech cards with status-based styling
 * - Active Loop priority queue panel
 * - Cross-panel coordination support
 *
 * Layout: 6-category rows x 4-tier columns
 * Far-future Elysium aesthetic (black, white, #00F0FF)
 */
export function ResearchTree({
  technologies,
  stats = {
    unlockedCount: 0,
    totalCount: 71,
    researchFunding: '$0',
    aiCapability: 0,
  },
  activeLoopNodes = [],
  delayedTechs = [],
  highlightedTechId,
  onTechSelect,
  onTechRecommend,
  onCrossPanelEvent,
  onLoopReorder,
  onLoopDefer,
  onLoopAccelerate,
  onLoopOptimize,
  onLoopExecute,
  notificationCount = 0,
}: ResearchTreeProps) {
  // State
  const [selectedCategory, setSelectedCategory] = useState<TechCategory>('all');
  const [isReordering, setIsReordering] = useState(false);
  const [draggedTechId, setDraggedTechId] = useState<string | null>(null);
  const [dragOverTechId, setDragOverTechId] = useState<string | null>(null);

  // Filter technologies by category
  const filteredTechs = useMemo(() => {
    if (selectedCategory === 'all') {
      return technologies;
    }
    return technologies.filter((tech) => tech.category === selectedCategory);
  }, [technologies, selectedCategory]);

  // Group technologies by category and tier for grid display
  const techGrid = useMemo(() => {
    const grid: Record<TechCategory, Record<TechTier, TechDisplayData[]>> =
      {} as Record<TechCategory, Record<TechTier, TechDisplayData[]>>;

    // Initialize grid
    CATEGORY_DISPLAY_ORDER.forEach((cat) => {
      grid[cat] = { 0: [], 1: [], 2: [], 3: [], 4: [] };
    });

    // Populate grid
    filteredTechs.forEach((tech) => {
      const category = tech.category as TechCategory;
      if (grid[category] && grid[category][tech.tier]) {
        grid[category][tech.tier].push(tech);
      }
    });

    return grid;
  }, [filteredTechs]);

  // Calculate category counts for filter badges
  const categoryCounts = useMemo(() => {
    const counts: Record<TechCategory, number> = {
      all: technologies.length,
      alignment: 0,
      social: 0,
      medical: 0,
      energy: 0,
      climate: 0,
      ocean: 0,
      freshwater: 0,
      agriculture: 0,
      pollution: 0,
    };

    technologies.forEach((tech) => {
      if (counts[tech.category] !== undefined) {
        counts[tech.category]++;
      }
    });

    return counts;
  }, [technologies]);

  // Handlers
  const handleCategoryChange = useCallback((category: TechCategory) => {
    setSelectedCategory(category);
  }, []);

  const handleTechSelect = useCallback(
    (techId: string) => {
      onTechSelect?.(techId);
      onCrossPanelEvent?.({
        type: 'tech_selected',
        payload: { techId },
      });
    },
    [onTechSelect, onCrossPanelEvent]
  );

  const handleTechRecommend = useCallback(
    (techId: string) => {
      onTechRecommend?.(techId);
      onCrossPanelEvent?.({
        type: 'tech_recommended',
        payload: { techId },
      });
    },
    [onTechRecommend, onCrossPanelEvent]
  );

  const handleCrisisBadgeClick = useCallback(
    (techId: string, crisisId: string) => {
      onCrossPanelEvent?.({
        type: 'crisis_clicked',
        payload: { techId, crisisId },
      });
    },
    [onCrossPanelEvent]
  );

  const handleToggleReorder = useCallback(() => {
    setIsReordering((prev) => !prev);
  }, []);

  // Tech card drag handlers (for available techs)
  const handleTechDragStart = useCallback((techId: string) => {
    setDraggedTechId(techId);
  }, []);

  const handleTechDragEnd = useCallback(() => {
    setDraggedTechId(null);
    setDragOverTechId(null);
  }, []);

  const handleTechDragOver = useCallback((techId: string) => {
    if (draggedTechId && draggedTechId !== techId) {
      setDragOverTechId(techId);
    }
  }, [draggedTechId]);

  const handleTechDragLeave = useCallback(() => {
    setDragOverTechId(null);
  }, []);

  // Get display label for category
  const getCategoryLabel = (category: TechCategory): string => {
    const config = GRID_CATEGORIES.find((c) => c.id === category);
    return config?.label || category;
  };

  return (
    <div className={styles.researchTree}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <div className={styles.title}>Research Tree</div>
          {notificationCount > 0 && (
            <span className={styles.notificationBadge}>{notificationCount}</span>
          )}
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Unlocked</div>
            <div className={styles.statValue}>
              {stats.unlockedCount}/{stats.totalCount}
            </div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Research Funding</div>
            <div className={styles.statValue}>{stats.researchFunding}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>AI Capability</div>
            <div className={styles.statValue}>
              {stats.aiCapability.toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        categories={DEFAULT_CATEGORIES}
        onCategoryChange={handleCategoryChange}
        categoryCounts={categoryCounts}
      />

      {/* Main Container (Grid + Active Loop) */}
      <div className={styles.mainContainer}>
        {/* Tech Grid */}
        <div className={styles.techGridContainer}>
          <div className={styles.techGrid}>
            {/* Header Row - Tier Headers */}
            <div className={styles.tierCorner} />
            {TIER_CONFIG.map((tier) => (
              <div key={tier.tier} className={styles.tierHeader}>
                <div className={styles.tierName}>{tier.name}</div>
                <div className={styles.tierRequirement}>{tier.requirement}</div>
              </div>
            ))}

            {/* Category Rows */}
            {CATEGORY_DISPLAY_ORDER.map((category) => {
              // Skip categories not in filter
              if (
                selectedCategory !== 'all' &&
                selectedCategory !== category
              ) {
                return null;
              }

              return (
                <React.Fragment key={category}>
                  {/* Category Label */}
                  <div className={styles.categoryLabel}>
                    {getCategoryLabel(category)}
                  </div>

                  {/* Tech Cards for each tier */}
                  {TIER_CONFIG.map((tierConfig) => {
                    const techsInCell =
                      techGrid[category]?.[tierConfig.tier] || [];

                    // Show first tech in cell (or empty cell)
                    const tech = techsInCell[0];

                    if (!tech) {
                      return (
                        <div
                          key={`${category}-${tierConfig.tier}`}
                          className={styles.emptyCell}
                        />
                      );
                    }

                    return (
                      <TechCard
                        key={tech.id}
                        id={tech.id}
                        name={tech.name}
                        status={tech.status}
                        researchProgress={tech.researchProgress}
                        deploymentLevel={tech.deploymentLevel}
                        deployedYear={tech.deployedYear}
                        crisisRelevance={tech.crisisRelevance}
                        isHighlightedForCrisis={highlightedTechId === tech.id}
                        isDragging={draggedTechId === tech.id}
                        isDragOver={dragOverTechId === tech.id}
                        onSelect={handleTechSelect}
                        onRecommend={handleTechRecommend}
                        onCrisisBadgeClick={handleCrisisBadgeClick}
                        onDragStart={handleTechDragStart}
                        onDragEnd={handleTechDragEnd}
                        onDragOver={handleTechDragOver}
                        onDragLeave={handleTechDragLeave}
                      />
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Active Loop Panel */}
        <ActiveLoop
          nodes={activeLoopNodes}
          delayedTechs={delayedTechs}
          unlockProgress={{
            unlocked: stats.unlockedCount,
            total: stats.totalCount,
          }}
          isReordering={isReordering}
          onReorder={onLoopReorder}
          onDefer={onLoopDefer}
          onAccelerate={onLoopAccelerate}
          onToggleReorder={handleToggleReorder}
          onOptimize={onLoopOptimize}
          onExecute={onLoopExecute}
          onDelayedTechClick={(techId) => handleTechSelect(techId)}
          onNodeClick={(nodeId) => handleTechSelect(nodeId)}
        />
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendTitle}>Legend</div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.legendLocked}`} />
          <div className={styles.legendLabel}>Locked - Requirements not met</div>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.legendAvailable}`} />
          <div className={styles.legendLabel}>Available - Can begin research</div>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.legendResearching}`} />
          <div className={styles.legendLabel}>Researching - In progress</div>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.legendDeployed}`} />
          <div className={styles.legendLabel}>Deployed - Ready to use</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Exports
// ============================================================================

export type { TechCardProps, CrisisRelevance } from './TechCard';
export type { CategoryFilterProps, CategoryConfig } from './CategoryFilter';
export type { ActiveLoopProps, LoopNode, DelayedTech, LoopNodeType } from './ActiveLoop';
