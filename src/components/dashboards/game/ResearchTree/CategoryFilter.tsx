'use client';

import React, { useCallback } from 'react';
import styles from './ResearchTree.module.css';

/**
 * Technology categories matching comprehensiveTechTree.ts
 * These map to the game's 6 main research domains
 */
export type TechCategory =
  | 'all'
  | 'alignment'
  | 'social'
  | 'medical'
  | 'energy'
  | 'climate'
  | 'ocean'
  | 'freshwater'
  | 'agriculture'
  | 'pollution';

/**
 * Category display configuration
 */
export interface CategoryConfig {
  id: TechCategory;
  label: string;
  /** Optional count of techs in this category */
  count?: number;
}

/**
 * Default categories for the research tree
 * Grouped into 6 main display categories for the grid
 */
export const DEFAULT_CATEGORIES: CategoryConfig[] = [
  { id: 'all', label: 'All Categories' },
  { id: 'alignment', label: 'AI Alignment' },
  { id: 'social', label: 'Society' },
  { id: 'medical', label: 'Medical' },
  { id: 'energy', label: 'Energy' },
  { id: 'climate', label: 'Climate' },
  { id: 'ocean', label: 'Ocean' },
  { id: 'freshwater', label: 'Freshwater' },
  { id: 'agriculture', label: 'Agriculture' },
  { id: 'pollution', label: 'Pollution' },
];

/**
 * Simplified 6-category view for main grid display
 * Maps the detailed categories to the V4 mockup's 6-row layout
 */
export const GRID_CATEGORIES: CategoryConfig[] = [
  { id: 'alignment', label: 'AI Systems' },
  { id: 'social', label: 'Governance' },
  { id: 'climate', label: 'Climate' },
  { id: 'energy', label: 'Energy' },
  { id: 'agriculture', label: 'Biosphere' },
  { id: 'pollution', label: 'Economic' },
];

/**
 * Props for the CategoryFilter component
 */
export interface CategoryFilterProps {
  /** Currently selected category */
  selectedCategory: TechCategory;
  /** Available categories to display */
  categories?: CategoryConfig[];
  /** Callback when category is selected */
  onCategoryChange: (category: TechCategory) => void;
  /** Optional: Count of techs per category for badges */
  categoryCounts?: Record<TechCategory, number>;
}

/**
 * CategoryFilter - Filter buttons for research tree categories
 *
 * Allows users to filter the tech tree display by category.
 * Active category is highlighted with cyan glow.
 */
export function CategoryFilter({
  selectedCategory,
  categories = DEFAULT_CATEGORIES,
  onCategoryChange,
  categoryCounts,
}: CategoryFilterProps) {
  const handleCategoryClick = useCallback(
    (category: TechCategory) => {
      onCategoryChange(category);
    },
    [onCategoryChange]
  );

  return (
    <div className={styles.categoryFilter} role="tablist" aria-label="Filter by category">
      {categories.map((cat) => {
        const isActive = selectedCategory === cat.id;
        const count = categoryCounts?.[cat.id];

        const buttonClasses = [
          styles.filterBtn,
          isActive && styles.filterBtnActive,
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <button
            key={cat.id}
            className={buttonClasses}
            onClick={() => handleCategoryClick(cat.id)}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tech-grid-${cat.id}`}
          >
            {cat.label}
            {count !== undefined && count > 0 && (
              <span
                style={{
                  marginLeft: '6px',
                  opacity: 0.6,
                  fontSize: '10px',
                }}
              >
                ({count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Helper function to map detailed categories to grid categories
 */
export function mapToGridCategory(
  detailedCategory: TechCategory
): TechCategory {
  const mapping: Record<TechCategory, TechCategory> = {
    all: 'all',
    alignment: 'alignment',
    social: 'social',
    medical: 'social', // Medical goes under Society
    energy: 'energy',
    climate: 'climate',
    ocean: 'climate', // Ocean goes under Climate
    freshwater: 'agriculture', // Freshwater goes under Biosphere
    agriculture: 'agriculture',
    pollution: 'pollution',
  };
  return mapping[detailedCategory] || detailedCategory;
}
