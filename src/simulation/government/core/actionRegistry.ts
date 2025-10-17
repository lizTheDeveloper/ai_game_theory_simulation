/**
 * Action registry for managing government actions
 *
 * Provides centralized registration and lookup of government actions
 * organized by category for better maintainability.
 */

import {
  GovernmentActionCategory,
  CategorizedGovernmentAction,
  GovernmentActionRegistry
} from './types';

class GovernmentActionRegistryImpl implements GovernmentActionRegistry {
  private actions: Map<string, CategorizedGovernmentAction> = new Map();
  private actionsByCategory: Map<GovernmentActionCategory, CategorizedGovernmentAction[]> = new Map();

  getAllActions(): CategorizedGovernmentAction[] {
    return Array.from(this.actions.values());
  }

  getActionsByCategory(category: GovernmentActionCategory): CategorizedGovernmentAction[] {
    return this.actionsByCategory.get(category) || [];
  }

  getActionById(id: string): CategorizedGovernmentAction | undefined {
    return this.actions.get(id);
  }

  registerAction(action: CategorizedGovernmentAction): void {
    // Register in main map
    this.actions.set(action.id, action);

    // Register in category map
    const categoryActions = this.actionsByCategory.get(action.category) || [];
    categoryActions.push(action);
    this.actionsByCategory.set(action.category, categoryActions);
  }

  registerActions(actions: CategorizedGovernmentAction[]): void {
    actions.forEach(action => this.registerAction(action));
  }

  /**
   * Clear all actions (primarily for testing)
   */
  clear(): void {
    this.actions.clear();
    this.actionsByCategory.clear();
  }
}

// Singleton instance
export const governmentActionRegistry = new GovernmentActionRegistryImpl();
