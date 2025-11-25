/**
 * Research Tree Component Exports
 *
 * Far-future research tree dashboard for technology management.
 * Supports 71+ breakthrough technologies across 4 tiers and 6+ categories.
 */

// Main component
export { ResearchTree } from './ResearchTree';
export type {
  ResearchTreeProps,
  TechDisplayData,
  ResearchStats,
  CrossPanelEvent,
  TechTier,
} from './ResearchTree';

// Sub-components
export { TechCard } from './TechCard';
export type {
  TechCardProps,
  TechStatus,
  CrisisRelevance,
} from './TechCard';

export { CategoryFilter, DEFAULT_CATEGORIES, GRID_CATEGORIES, mapToGridCategory } from './CategoryFilter';
export type {
  CategoryFilterProps,
  CategoryConfig,
  TechCategory,
} from './CategoryFilter';

export { ActiveLoop } from './ActiveLoop';
export type {
  ActiveLoopProps,
  LoopNode,
  DelayedTech,
  LoopNodeType,
} from './ActiveLoop';
