/**
 * Metric Validation Utilities
 *
 * Validates that expected metrics are present in StateDelta updates.
 * Logs warnings when expected metrics are missing (indicates simulation bugs).
 */

import type { StateDelta } from '@/lib/simulationWorkerClient'

export interface MetricExpectation {
  name: string
  path: keyof StateDelta
  required: boolean // true = must always be present, false = may be absent in some scenarios
  reason?: string // why this metric might be missing (for optional metrics)
}

export interface ValidationResult {
  missing: MetricExpectation[]
  present: string[]
  hasErrors: boolean
}

/**
 * Validates that expected metrics are present in a StateDelta update.
 * Logs warnings to console when required metrics are missing.
 *
 * @param delta - The StateDelta to validate
 * @param expectations - Array of expected metrics for this dashboard
 * @param componentName - Name of component for logging context
 * @returns Validation result with missing metrics
 */
export function validateMetrics(
  delta: StateDelta | null,
  expectations: MetricExpectation[],
  componentName: string
): ValidationResult {
  if (!delta) {
    console.warn(`[${componentName}] No delta received`)
    return {
      missing: expectations,
      present: [],
      hasErrors: true
    }
  }

  const missing: MetricExpectation[] = []
  const present: string[] = []

  for (const expectation of expectations) {
    const value = delta[expectation.path]
    const isPresent = value !== undefined && value !== null && (typeof value !== 'number' || !isNaN(value as number))

    if (isPresent) {
      present.push(expectation.name)
    } else {
      missing.push(expectation)

      // Log warning for required metrics
      if (expectation.required) {
        console.error(
          `❌ [${componentName}] Required metric missing: ${expectation.name} (${String(expectation.path)})`,
          `\n   Month: ${delta.currentMonth || 'unknown'}`,
          `\n   This indicates a simulation bug - the phase should be setting this value.`
        )
      } else if (process.env.NODE_ENV === 'development') {
        console.warn(
          `⚠️ [${componentName}] Optional metric absent: ${expectation.name} (${String(expectation.path)})`,
          expectation.reason ? `\n   Reason: ${expectation.reason}` : '',
          `\n   Month: ${delta.currentMonth || 'unknown'}`
        )
      }
    }
  }

  return {
    missing,
    present,
    hasErrors: missing.some(m => m.required)
  }
}

/**
 * Dashboard metric expectations registry
 */
export const DASHBOARD_EXPECTATIONS = {
  environmental: [
    { name: 'Climate Change', path: 'climateChange' as const, required: true },
    { name: 'Biodiversity Loss', path: 'biodiversityLoss' as const, required: true },
    { name: 'Planetary Boundaries Crossed', path: 'planetaryBoundariesCrossed' as const, required: true },
    { name: 'Environmental Debt', path: 'environmentalDebtLevel' as const, required: true },
    { name: 'Resource Depletion', path: 'resourceDepletion' as const, required: false, reason: 'May not be calculated until resource systems activate' },
    { name: 'Pollution Level', path: 'pollutionLevel' as const, required: false, reason: 'May not be calculated until pollution tracking starts' },
    { name: 'Phosphorus Depletion', path: 'phosphorusDepletion' as const, required: false, reason: 'Only present when phosphorus crisis is active' },
    { name: 'Freshwater Stress', path: 'freshwaterStress' as const, required: false, reason: 'Only present when freshwater crisis is active' },
    { name: 'Ocean Acidification', path: 'oceanAcidification' as const, required: false, reason: 'Only present when ocean systems are modeled' },
    { name: 'Novel Entities', path: 'novelEntitiesLevel' as const, required: false, reason: 'Only present when novel entities tracking is active' },
  ] as MetricExpectation[],

  overview: [
    { name: 'Population', path: 'population' as const, required: true },
    { name: 'Quality of Life', path: 'qualityOfLife' as const, required: true },
    { name: 'AI Capability', path: 'avgAICapability' as const, required: true },
    { name: 'Western Liberal Index', path: 'westernLiberalIndex' as const, required: true },
    { name: 'Development Index', path: 'developmentIndex' as const, required: true },
    { name: 'Ecological Index', path: 'ecologicalIndex' as const, required: true },
    { name: 'Indigenous Index', path: 'indigenousIndex' as const, required: true },
  ] as MetricExpectation[],

  regions: [
    { name: 'Population', path: 'population' as const, required: true },
    { name: 'Quality of Life', path: 'qualityOfLife' as const, required: true },
    { name: 'Social Cohesion', path: 'socialCohesion' as const, required: true },
    { name: 'Institutional Trust', path: 'institutionalTrust' as const, required: true },
  ] as MetricExpectation[],

  paradigm: [
    { name: 'Western Liberal Index', path: 'westernLiberalIndex' as const, required: true },
    { name: 'Development Index', path: 'developmentIndex' as const, required: true },
    { name: 'Ecological Index', path: 'ecologicalIndex' as const, required: true },
    { name: 'Indigenous Index', path: 'indigenousIndex' as const, required: true },
  ] as MetricExpectation[],
} as const
