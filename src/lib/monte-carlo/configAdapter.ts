/**
 * Monte Carlo Configuration Adapter
 *
 * Converts between Enhanced UI configuration format and MonteCarloContext format.
 * Handles the translation of arbitrary parameters to sweep configurations.
 */

import type { ScenarioMode } from '@/types/game'
import type { EnhancedSweepConfig } from '@/components/monte-carlo/EnhancedParameterConfig'

// MonteCarloContext's expected format
export interface MonteCarloSweepConfig {
  // Seed configuration
  startSeed: number
  seedCount: number

  // Sweep parameters (checkboxes)
  sweepThresholdScenarios: boolean
  selectedThresholdScenarios: Array<'doom' | 'cautious' | 'baseline' | 'progressive' | 'utopia'>

  sweepScenarioModes: boolean
  selectedScenarioModes: ScenarioMode[]

  sweepMaxMonths: boolean
  selectedMaxMonths: number[]

  sweepNestedMC: boolean

  // Fixed parameters (used when not sweeping)
  fixedScenarioMode: ScenarioMode
  fixedMaxMonths: number
  fixedThresholdScenario?: 'doom' | 'cautious' | 'baseline' | 'progressive' | 'utopia'

  // Extended parameters for custom sweeps
  customParameterSweeps?: {
    [paramName: string]: (string | number | boolean)[]
  }
}

/**
 * Convert EnhancedSweepConfig (from UI) to MonteCarloSweepConfig (for context)
 */
export function convertEnhancedToContextConfig(
  enhanced: EnhancedSweepConfig
): MonteCarloSweepConfig {
  const config: MonteCarloSweepConfig = {
    // Direct seed mapping
    startSeed: enhanced.startSeed,
    seedCount: enhanced.seedCount,

    // Initialize all sweep flags as false
    sweepThresholdScenarios: false,
    selectedThresholdScenarios: ['baseline'],
    sweepScenarioModes: false,
    selectedScenarioModes: ['historical'],
    sweepMaxMonths: false,
    selectedMaxMonths: [120],
    sweepNestedMC: false,

    // Default fixed parameters
    fixedScenarioMode: 'historical',
    fixedMaxMonths: 120,
    fixedThresholdScenario: 'baseline',

    // Initialize custom parameters
    customParameterSweeps: {}
  }

  // Process each enabled parameter
  Object.entries(enhanced.parameters).forEach(([paramId, param]) => {
    if (!param.enabled || param.values.length === 0) return

    // Map known parameters to their context fields
    switch (paramId) {
      case 'thresholdScenario':
        config.sweepThresholdScenarios = true
        config.selectedThresholdScenarios = param.values as typeof config.selectedThresholdScenarios
        break

      case 'scenarioMode':
        config.sweepScenarioModes = true
        config.selectedScenarioModes = param.values as ScenarioMode[]
        break

      case 'maxMonths':
        config.sweepMaxMonths = true
        config.selectedMaxMonths = param.values as number[]
        break

      case 'nestedMC':
        config.sweepNestedMC = param.values.includes(true)
        break

      default:
        // All other parameters go into custom sweeps
        if (!config.customParameterSweeps) {
          config.customParameterSweeps = {}
        }
        config.customParameterSweeps[paramId] = param.values
    }
  })

  return config
}

/**
 * Convert MonteCarloSweepConfig (from context) to EnhancedSweepConfig (for UI)
 * This enables bidirectional sync between UI and context
 */
export function convertContextToEnhancedConfig(
  context: MonteCarloSweepConfig
): EnhancedSweepConfig {
  const enhanced: EnhancedSweepConfig = {
    startSeed: context.startSeed,
    seedCount: context.seedCount,
    parameters: {}
  }

  // Map threshold scenarios
  if (context.sweepThresholdScenarios && context.selectedThresholdScenarios.length > 0) {
    enhanced.parameters.thresholdScenario = {
      enabled: true,
      values: context.selectedThresholdScenarios
    }
  }

  // Map scenario modes
  if (context.sweepScenarioModes && context.selectedScenarioModes.length > 0) {
    enhanced.parameters.scenarioMode = {
      enabled: true,
      values: context.selectedScenarioModes
    }
  }

  // Map max months
  if (context.sweepMaxMonths && context.selectedMaxMonths.length > 0) {
    enhanced.parameters.maxMonths = {
      enabled: true,
      values: context.selectedMaxMonths
    }
  }

  // Map nested MC
  if (context.sweepNestedMC) {
    enhanced.parameters.nestedMC = {
      enabled: true,
      values: [true, false]
    }
  }

  // Map custom parameters
  if (context.customParameterSweeps) {
    Object.entries(context.customParameterSweeps).forEach(([paramId, values]) => {
      enhanced.parameters[paramId] = {
        enabled: true,
        values
      }
    })
  }

  return enhanced
}

/**
 * Calculate total simulation count from enhanced config
 * This duplicates logic from EnhancedParameterConfig but provides
 * a centralized calculation for consistency
 */
export function calculateEnhancedSimulationCount(config: EnhancedSweepConfig): number {
  let total = config.seedCount

  Object.values(config.parameters).forEach(param => {
    if (param.enabled && param.values.length > 0) {
      total *= param.values.length
    }
  })

  return total
}

/**
 * Validate that the enhanced config will produce a reasonable sweep
 * Returns null if valid, or an error message if not
 */
export function validateEnhancedConfig(config: EnhancedSweepConfig): string | null {
  const total = calculateEnhancedSimulationCount(config)

  if (total <= 0) {
    return 'Invalid configuration: no simulations would be run'
  }

  if (total > 5000) {
    return `Too many simulations (${total.toLocaleString()}). Maximum is 5000. Reduce parameters or seeds.`
  }

  if (config.seedCount <= 0) {
    return 'Seed count must be at least 1'
  }

  // Check for at least one enabled parameter with values
  const hasEnabledParams = Object.values(config.parameters).some(
    p => p.enabled && p.values.length > 0
  )

  // It's OK to run without parameters (seed-only sweep)
  // But warn if they explicitly enabled a parameter with no values
  const hasEmptyEnabledParams = Object.values(config.parameters).some(
    p => p.enabled && p.values.length === 0
  )

  if (hasEmptyEnabledParams) {
    return 'Some enabled parameters have no values selected. Please select values for each enabled parameter.'
  }

  return null
}

/**
 * Generate a human-readable description of the sweep configuration
 */
export function describeSweepConfig(config: EnhancedSweepConfig): string {
  const totalSims = calculateEnhancedSimulationCount(config)
  const enabledParams = Object.entries(config.parameters)
    .filter(([_, p]) => p.enabled && p.values.length > 0)

  if (enabledParams.length === 0) {
    return `Seed-only sweep: ${config.seedCount} seeds starting from ${config.startSeed}`
  }

  const paramDescriptions = enabledParams.map(([id, param]) => {
    return `${id}: ${param.values.length} values`
  }).join(', ')

  return `${totalSims} simulations across ${config.seedCount} seeds and ${enabledParams.length} parameters (${paramDescriptions})`
}