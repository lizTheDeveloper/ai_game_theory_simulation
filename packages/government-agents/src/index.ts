/**
 * @political-science/government-agents
 *
 * Government modeling framework for political science research.
 *
 * Research Foundation:
 * - V-Dem v14 (Varieties of Democracy): 531 indicators, 202 countries
 * - WGI 2024 (Worldwide Governance Indicators): State capacity metrics
 * - Laver (2020): Agent-based modeling in political decision making
 * - Manifesto Project Database: Party policy positions
 *
 * @module @political-science/government-agents
 * @version 0.1.0
 * @license MIT
 */

// Core exports (will be implemented in Phase 1)
export * from './core';

// Coalition exports (will be implemented in Phase 2)
export * from './coalition';

// Policy exports (will be implemented in Phase 3)
export * from './policy';

// Election exports (will be implemented in Phase 4)
export * from './elections';

// Data exports
export * from './data';

/**
 * Package version
 */
export const VERSION = '0.1.0';

/**
 * Research citations used throughout this package
 */
export const RESEARCH_CITATIONS = {
  vdem: 'V-Dem [Country-Year/Country-Date] Dataset v14, Coppedge et al. 2024',
  wgi: 'Worldwide Governance Indicators 2024, World Bank',
  laver: 'Laver, M. (2020). Agent-based Modeling in Political Decision Making, Oxford Handbook',
  manifesto: 'Manifesto Project Database, Lehmann et al. 2024',
  ipu: 'IPU Parline Database, Inter-Parliamentary Union 2024'
};
