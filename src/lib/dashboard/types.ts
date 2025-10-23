/**
 * Aggregated data types for dashboard API responses
 *
 * These types represent pre-computed summaries from the full GameState,
 * designed to be consumed by dashboard UI components without loading
 * the entire simulation state into the browser.
 */

// Re-export all aggregation types
export type {
  TimeWindow,
} from './aggregation/time';

export type {
  RegionalSummary,
} from './aggregation/regional';

export type {
  AgentDistribution,
  CapabilityMatrix,
} from './aggregation/agents';

export type {
  PlanetaryBoundaryData,
} from './aggregation/environment';

export type {
  QoLDistribution,
} from './aggregation/qualityOfLife';

export type {
  GovernmentSummary,
  CountryGovernmentDetail,
} from './aggregation/government';

export type {
  CrisisSummary,
} from './aggregation/crises';

export type {
  TechnologyTreeSummary,
  TechnologyDetail,
} from './aggregation/technology';
