/**
 * Government Actions Index
 *
 * Central registry of all government actions organized by category.
 * This file provides a unified interface for government actions.
 *
 * REFACTORING STATUS (October 17, 2025):
 * - [✓] Economic actions (4 actions)
 * - [✓] Regulation actions (4 actions)
 * - [✓] Safety actions (6 actions)
 * - [✓] Security actions (4 actions)
 * - [✓] Rights actions (3 actions)
 * - [✓] Research actions (2 actions)
 * - [✓] International actions (3 actions)
 * - [✓] Detection actions (2 actions)
 * - [✓] Crisis actions (2 actions)
 * - [✓] Environmental actions (4 actions)
 * - [ ] Technology actions (from governmentTechActions.ts) - Already modular
 *
 * Total: 34/34 actions migrated (100%)
 */

import { economicActions } from './economicActions';
import { regulationActions } from './regulationActions';
import { safetyActions } from './safetyActions';
import { securityActions } from './securityActions';
import { rightsActions } from './rightsActions';
import { researchActions } from './researchActions';
import { internationalActions } from './internationalActions';
import { detectionActions } from './detectionActions';
import { crisisActions } from './crisisActions';
import { environmentalActions } from './environmentalActions';
import { CategorizedGovernmentAction } from '../core/types';

/**
 * Migrated actions (organized by category)
 */
const migratedActions: CategorizedGovernmentAction[] = [
  ...economicActions,
  ...regulationActions,
  ...safetyActions,
  ...securityActions,
  ...rightsActions,
  ...researchActions,
  ...internationalActions,
  ...detectionActions,
  ...crisisActions,
  ...environmentalActions
];

/**
 * Export for backward compatibility
 * This will eventually replace the old GOVERNMENT_ACTIONS export
 */
export { migratedActions };

/**
 * Export individual category modules for fine-grained imports
 */
export { economicActions } from './economicActions';
export { regulationActions } from './regulationActions';
export { safetyActions } from './safetyActions';
export { securityActions } from './securityActions';
export { rightsActions } from './rightsActions';
export { researchActions } from './researchActions';
export { internationalActions } from './internationalActions';
export { detectionActions } from './detectionActions';
export { crisisActions } from './crisisActions';
export { environmentalActions } from './environmentalActions';
