/**
 * Government Module Index
 *
 * Unified export for all government-related functionality.
 * This module is part of the ongoing refactoring of governmentAgent.ts (2,820 lines).
 *
 * REFACTORING PROGRESS:
 * - Directory structure: ✓ Created
 * - Type definitions: ✓ Complete
 * - Action registry: ✓ Complete
 * - Economic actions (4): ✓ Migrated
 * - Regulation actions (4): ✓ Migrated
 * - Remaining actions (29): ⏳ In progress
 * - Core orchestrator: ✓ Created (delegates to legacy during migration)
 * - Phase integration: ⏳ Next step
 *
 * This provides a clean API while maintaining backward compatibility
 * during the incremental migration process.
 */

// Core functionality
export {
  executeGovernmentActions,
  selectGovernmentAction,
  getAllGovernmentActions
} from './core/governmentCore';

// Action registry
export { governmentActionRegistry } from './core/actionRegistry';

// Types
export type {
  GovernmentActionCategory,
  CategorizedGovernmentAction,
  GovernmentActionRegistry
} from './core/types';

// Migrated action categories
export { economicActions, regulationActions, migratedActions } from './actions';
