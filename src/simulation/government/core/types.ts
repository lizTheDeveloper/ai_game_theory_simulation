/**
 * Types for government actions and decision-making
 */

import { GameAction } from '@/simulation/agents/types';

/**
 * Categories for organizing government actions
 */
export type GovernmentActionCategory =
  | 'economic'      // UBI, job guarantee, redistribution
  | 'regulation'    // AI regulation, compute governance
  | 'research'      // Alignment research, safety investments
  | 'safety'        // Evaluation, testing, oversight
  | 'security'      // Cyber defense, national compute
  | 'crisis'        // Emergency responses (environmental, nuclear)
  | 'international' // Cooperation, trade, espionage
  | 'rights'        // AI rights, data control
  | 'technology';   // Tech deployment, infrastructure

/**
 * Government action with category metadata
 */
export interface CategorizedGovernmentAction extends GameAction {
  category: GovernmentActionCategory;
  agentType: 'government'; // Always government
}

/**
 * Action registry for organizing and looking up government actions
 */
export interface GovernmentActionRegistry {
  /**
   * Get all government actions
   */
  getAllActions(): CategorizedGovernmentAction[];

  /**
   * Get actions by category
   */
  getActionsByCategory(category: GovernmentActionCategory): CategorizedGovernmentAction[];

  /**
   * Get action by ID
   */
  getActionById(id: string): CategorizedGovernmentAction | undefined;

  /**
   * Register an action
   */
  registerAction(action: CategorizedGovernmentAction): void;

  /**
   * Register multiple actions
   */
  registerActions(actions: CategorizedGovernmentAction[]): void;
}
