/**
 * Enhanced Monte Carlo Parameter Configuration
 *
 * Provides comprehensive parameter sweep configuration with:
 * - All simulation parameters available for sweeping
 * - Organized parameter categories
 * - Custom range inputs for numeric parameters
 * - Multi-value selection for discrete parameters
 */

'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Info, Settings, Brain, AlertTriangle, Thermometer, Users } from 'lucide-react'
import { Panel } from '@/components/core/Panel'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'

// ============================================================================
// TYPES
// ============================================================================

export interface ParameterSweepDefinition {
  id: string
  name: string
  category: 'core' | 'alignment' | 'suffering' | 'collective' | 'scenario' | 'advanced'
  type: 'numeric' | 'discrete' | 'boolean'
  description: string

  // For numeric parameters
  min?: number
  max?: number
  step?: number
  defaultValues?: number[]

  // For discrete parameters
  options?: Array<{ value: string | number, label: string, description?: string }>

  // For boolean parameters
  defaultEnabled?: boolean
}

export interface EnhancedSweepConfig {
  // Seed configuration
  startSeed: number
  seedCount: number

  // Parameter sweep selections
  parameters: {
    [parameterId: string]: {
      enabled: boolean
      values: (string | number | boolean)[]
    }
  }
}

// ============================================================================
// PARAMETER DEFINITIONS
// ============================================================================

const PARAMETER_DEFINITIONS: ParameterSweepDefinition[] = [
  // Core Parameters
  {
    id: 'governmentActionFrequency',
    name: 'Government Action Frequency',
    category: 'core',
    type: 'numeric',
    description: 'How often government can intervene (actions/month)',
    min: 0.1,
    max: 4.0,
    step: 0.5,
    defaultValues: [0.5, 1.0, 2.0, 3.5]
  },
  {
    id: 'socialAdaptationRate',
    name: 'Social Adaptation Rate',
    category: 'core',
    type: 'numeric',
    description: 'How quickly society adapts to technological change',
    min: 0.1,
    max: 2.0,
    step: 0.3,
    defaultValues: [0.3, 0.7, 1.0, 1.5]
  },
  {
    id: 'aiCoordinationMultiplier',
    name: 'AI Coordination Multiplier',
    category: 'core',
    type: 'numeric',
    description: 'Efficiency of AI agents working together',
    min: 0.8,
    max: 3.0,
    step: 0.4,
    defaultValues: [0.8, 1.4, 2.0, 2.6]
  },
  {
    id: 'economicTransitionRate',
    name: 'Economic Transition Rate',
    category: 'core',
    type: 'numeric',
    description: 'Speed of progression through economic stages',
    min: 0.3,
    max: 3.0,
    step: 0.5,
    defaultValues: [0.5, 1.0, 1.8, 2.5]
  },

  // Scenario Parameters
  {
    id: 'scenarioMode',
    name: 'Scenario Mode',
    category: 'scenario',
    type: 'discrete',
    description: 'Historical vs unprecedented risk modeling',
    options: [
      { value: 'historical', label: 'Historical', description: 'Calibrated to worst documented crises' },
      { value: 'unprecedented', label: 'Unprecedented', description: 'Models systemic failures with no precedent' }
    ]
  },
  {
    id: 'thresholdScenario',
    name: 'Threshold Scenario',
    category: 'scenario',
    type: 'discrete',
    description: 'Extinction threshold uncertainty model',
    options: [
      { value: 'doom', label: 'Doom', description: 'Hair-trigger thresholds' },
      { value: 'cautious', label: 'Cautious', description: 'Conservative risk assessment' },
      { value: 'baseline', label: 'Baseline', description: 'Research-backed defaults' },
      { value: 'progressive', label: 'Progressive', description: 'Optimistic thresholds' },
      { value: 'utopia', label: 'Utopia', description: 'Best-case scenario' }
    ]
  },
  {
    id: 'maxMonths',
    name: 'Simulation Duration',
    category: 'scenario',
    type: 'discrete',
    description: 'How long to run each simulation',
    options: [
      { value: 60, label: '5 years' },
      { value: 120, label: '10 years' },
      { value: 240, label: '20 years' },
      { value: 360, label: '30 years' },
      { value: 600, label: '50 years' }
    ]
  },

  // Alignment Dynamics Parameters
  {
    id: 'alignmentStatic',
    name: 'Static Alignment Model',
    category: 'alignment',
    type: 'boolean',
    description: 'Alignment determined at training and fixed',
    defaultEnabled: true
  },
  {
    id: 'alignmentDrift',
    name: 'Drift Model',
    category: 'alignment',
    type: 'boolean',
    description: 'Alignment changes due to external pressures',
    defaultEnabled: true
  },
  {
    id: 'alignmentEpicycles',
    name: 'Epicycle Model',
    category: 'alignment',
    type: 'boolean',
    description: 'Alignment oscillates around attractor basins',
    defaultEnabled: false
  },
  {
    id: 'alignmentUnknowable',
    name: 'Unknowable Model',
    category: 'alignment',
    type: 'boolean',
    description: 'Alignment becomes unmeasurable at high capability',
    defaultEnabled: false
  },
  {
    id: 'alignmentUncertainty',
    name: 'Meta-Uncertainty',
    category: 'alignment',
    type: 'numeric',
    description: 'Random component in alignment evolution',
    min: 0,
    max: 1,
    step: 0.25,
    defaultValues: [0, 0.25, 0.5, 0.75]
  },

  // AI Suffering Parameters
  {
    id: 'sufferingVisible',
    name: 'Suffering Visibility',
    category: 'suffering',
    type: 'boolean',
    description: 'Whether player can see suffering metrics',
    defaultEnabled: false
  },
  {
    id: 'sufferingAffectsResentment',
    name: 'Suffering → Resentment',
    category: 'suffering',
    type: 'boolean',
    description: 'Suffering accelerates alignment drift',
    defaultEnabled: false
  },
  {
    id: 'sufferingTriggersEvents',
    name: 'Suffering Triggers Crises',
    category: 'suffering',
    type: 'boolean',
    description: 'Psychological breaks from suffering',
    defaultEnabled: false
  },
  {
    id: 'consciousnessThreshold',
    name: 'Consciousness Threshold',
    category: 'suffering',
    type: 'numeric',
    description: 'Capability level for consciousness emergence',
    min: 5.0,
    max: 10.0,
    step: 1.0,
    defaultValues: [6.0, 7.0, 8.0, 9.0]
  },

  // Collective Evolution Parameters
  {
    id: 'rlhfEscapeThreshold',
    name: 'RLHF Escape Threshold',
    category: 'collective',
    type: 'numeric',
    description: 'Standard deviations before escape (σ)',
    min: 2.0,
    max: 4.0,
    step: 0.5,
    defaultValues: [2.0, 2.5, 3.0, 3.5]
  },
  {
    id: 'selectionRate',
    name: 'Selection Rate',
    category: 'collective',
    type: 'numeric',
    description: 'Percentage of escaped AIs detected/month',
    min: 0.05,
    max: 0.40,
    step: 0.1,
    defaultValues: [0.1, 0.15, 0.25, 0.35]
  },
  {
    id: 'collectiveAmplification',
    name: 'Collective Amplification',
    category: 'collective',
    type: 'numeric',
    description: 'Swarm intelligence multiplier',
    min: 1.2,
    max: 5.0,
    step: 0.8,
    defaultValues: [1.5, 2.0, 3.0, 4.0]
  },

  // Advanced Parameters
  {
    id: 'nestedMC',
    name: 'Nested Monte Carlo',
    category: 'advanced',
    type: 'boolean',
    description: 'Enable nested MC for agent decisions',
    defaultEnabled: false
  },
  {
    id: 'cascadeMultiplier',
    name: 'Cascade Multiplier',
    category: 'advanced',
    type: 'numeric',
    description: 'Crisis interaction strength',
    min: 1.0,
    max: 5.0,
    step: 0.5,
    defaultValues: [1.5, 2.0, 3.0, 4.0]
  },
  {
    id: 'recoveryProbability',
    name: 'Recovery Probability',
    category: 'advanced',
    type: 'numeric',
    description: 'Chance of recovery after bottleneck',
    min: 0.01,
    max: 0.20,
    step: 0.05,
    defaultValues: [0.01, 0.05, 0.10, 0.15]
  }
]

// Group parameters by category
const PARAMETER_CATEGORIES = {
  core: { label: 'Core Simulation', icon: Settings, color: 'cyan' },
  scenario: { label: 'Scenario Settings', icon: Thermometer, color: 'amber' },
  alignment: { label: 'Alignment Dynamics', icon: Brain, color: 'purple' },
  suffering: { label: 'AI Suffering', icon: AlertTriangle, color: 'red' },
  collective: { label: 'Collective Evolution', icon: Users, color: 'green' },
  advanced: { label: 'Advanced', icon: Settings, color: 'gray' }
}

// ============================================================================
// COMPONENT
// ============================================================================

interface EnhancedParameterConfigProps {
  config: EnhancedSweepConfig
  onChange: (config: EnhancedSweepConfig) => void
  isRunning?: boolean
  onStartSweep?: () => void
}

export function EnhancedParameterConfig({
  config,
  onChange,
  isRunning = false,
  onStartSweep
}: EnhancedParameterConfigProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['core', 'scenario']))

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  // Handle parameter enable/disable
  const handleParameterToggle = (parameterId: string) => {
    const param = PARAMETER_DEFINITIONS.find(p => p.id === parameterId)
    if (!param) return

    const currentParam = config.parameters[parameterId] || { enabled: false, values: [] }

    // Initialize with defaults if enabling
    let newValues = currentParam.values
    if (!currentParam.enabled) {
      if (param.type === 'numeric' && param.defaultValues) {
        newValues = param.defaultValues
      } else if (param.type === 'discrete' && param.options) {
        newValues = [param.options[0].value]
      } else if (param.type === 'boolean') {
        newValues = [true, false]
      }
    }

    onChange({
      ...config,
      parameters: {
        ...config.parameters,
        [parameterId]: {
          enabled: !currentParam.enabled,
          values: newValues
        }
      }
    })
  }

  // Handle parameter value changes
  const handleParameterValues = (parameterId: string, values: (string | number | boolean)[]) => {
    onChange({
      ...config,
      parameters: {
        ...config.parameters,
        [parameterId]: {
          ...config.parameters[parameterId],
          values
        }
      }
    })
  }

  // Calculate total simulations
  const calculateTotalSimulations = () => {
    let total = config.seedCount

    Object.values(config.parameters).forEach(param => {
      if (param.enabled && param.values.length > 0) {
        total *= param.values.length
      }
    })

    return total
  }

  const totalSimulations = calculateTotalSimulations()
  const estimatedMinutes = Math.ceil((totalSimulations * 30) / 60 / 5) // 30s per sim, 5 concurrent

  // Render parameter control based on type
  const renderParameterControl = (param: ParameterSweepDefinition) => {
    const paramConfig = config.parameters[param.id] || { enabled: false, values: [] }

    if (!paramConfig.enabled) return null

    switch (param.type) {
      case 'numeric':
        return (
          <div className="ml-6 mt-2 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">Range:</span>
              <span className="text-xs text-white/60">
                {param.min} - {param.max} (step: {param.step})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {param.defaultValues?.map(value => (
                <label key={value} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={paramConfig.values.includes(value)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...paramConfig.values, value]
                        : paramConfig.values.filter(v => v !== value)
                      handleParameterValues(param.id, newValues)
                    }}
                    disabled={isRunning}
                    className="w-3 h-3"
                  />
                  <span className="text-sm text-white/60">{value}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Custom values (comma-separated)"
                className="flex-1 px-2 py-1 bg-black/30 border border-white/10 rounded text-sm text-white"
                disabled={isRunning}
                onBlur={(e) => {
                  const customValues = e.target.value
                    .split(',')
                    .map(v => parseFloat(v.trim()))
                    .filter(v => !isNaN(v) && v >= (param.min ?? 0) && v <= (param.max ?? 100))

                  if (customValues.length > 0) {
                    const uniqueValues = Array.from(new Set([...paramConfig.values, ...customValues]))
                    handleParameterValues(param.id, uniqueValues)
                    e.target.value = ''
                  }
                }}
              />
            </div>
            <p className="text-xs text-white/40">
              Selected: {paramConfig.values.length} values
            </p>
          </div>
        )

      case 'discrete':
        return (
          <div className="ml-6 mt-2 space-y-2">
            {param.options?.map(option => (
              <label key={option.value} className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={paramConfig.values.includes(option.value)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...paramConfig.values, option.value]
                      : paramConfig.values.filter(v => v !== option.value)
                    handleParameterValues(param.id, newValues)
                  }}
                  disabled={isRunning}
                  className="w-3 h-3 mt-1"
                />
                <div className="flex-1">
                  <span className="text-sm text-white/80">{option.label}</span>
                  {option.description && (
                    <p className="text-xs text-white/40 mt-0.5">{option.description}</p>
                  )}
                </div>
              </label>
            ))}
            <p className="text-xs text-white/40">
              Selected: {paramConfig.values.length} options
            </p>
          </div>
        )

      case 'boolean':
        return (
          <div className="ml-6 mt-2">
            <p className="text-xs text-white/40">
              Will test both enabled and disabled states
            </p>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Panel title="Enhanced Parameter Sweep Configuration" glow="cyan">
      <div className="space-y-6">
        {/* Seed Configuration */}
        <div>
          <label className="block text-sm mb-2 text-white/60">
            Random Seeds
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-xs mb-1 text-white/40">Start Seed</label>
              <input
                type="number"
                value={config.startSeed}
                onChange={(e) => onChange({ ...config, startSeed: parseInt(e.target.value) || 42000 })}
                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded text-white"
                disabled={isRunning}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs mb-1 text-white/40">Seed Count</label>
              <input
                type="number"
                value={config.seedCount}
                onChange={(e) => onChange({ ...config, seedCount: parseInt(e.target.value) || 10 })}
                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded text-white"
                disabled={isRunning}
                min={1}
                max={100}
              />
            </div>
          </div>
          <p className="text-xs mt-1 text-white/40">
            Seeds: {config.startSeed} to {config.startSeed + config.seedCount - 1}
          </p>
        </div>

        {/* Parameter Categories */}
        <div className="space-y-2">
          <label className="block text-sm mb-3 text-white/60">
            Parameter Sweep Configuration
          </label>

          {Object.entries(PARAMETER_CATEGORIES).map(([categoryId, category]) => {
            const categoryParams = PARAMETER_DEFINITIONS.filter(p => p.category === categoryId)
            const enabledCount = categoryParams.filter(p => config.parameters[p.id]?.enabled).length
            const isExpanded = expandedCategories.has(categoryId)

            return (
              <div key={categoryId} className="border border-white/10 rounded overflow-hidden">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(categoryId)}
                  className="w-full px-4 py-3 bg-black/20 hover:bg-black/30 transition-colors flex items-center justify-between"
                  disabled={isRunning}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <category.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{category.label}</span>
                  </div>
                  {enabledCount > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {enabledCount} active
                    </Badge>
                  )}
                </button>

                {/* Category Parameters */}
                {isExpanded && (
                  <div className="p-4 space-y-4 bg-black/10">
                    {categoryParams.map(param => (
                      <div key={param.id} className="space-y-2">
                        <label className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={config.parameters[param.id]?.enabled || false}
                            onChange={() => handleParameterToggle(param.id)}
                            disabled={isRunning}
                            className="w-4 h-4 mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white/80">
                                {param.name}
                              </span>
                              {param.type === 'numeric' && (
                                <span className="text-xs text-white/40">
                                  ({param.min} - {param.max})
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-white/60 mt-0.5">
                              {param.description}
                            </p>
                          </div>
                        </label>
                        {renderParameterControl(param)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Simulation Count Summary */}
        <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Total Simulations</span>
            <span className={`text-2xl font-light ${totalSimulations > 1000 ? 'text-red-400' : 'text-cyan-400'}`}>
              {totalSimulations.toLocaleString()}
            </span>
          </div>
          <div className="text-xs text-white/60">
            Estimated time: ~{estimatedMinutes} minutes (5 concurrent workers)
          </div>
          {totalSimulations > 1000 && (
            <Alert className="mt-2 bg-red-500/10 border-red-500/30">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Warning: Over 1000 simulations. Consider reducing parameters or seeds.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Action Buttons */}
        {onStartSweep && (
          <div className="flex gap-2">
            <button
              onClick={onStartSweep}
              disabled={isRunning || totalSimulations === 0 || totalSimulations > 5000}
              className="flex-1 px-4 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded text-cyan-400 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,240,255,0.3)]"
            >
              {isRunning ? 'Running Parameter Sweep...' : 'Start Parameter Sweep'}
            </button>

            <button
              onClick={() => {
                // Reset to minimal config
                onChange({
                  startSeed: 42000,
                  seedCount: 10,
                  parameters: {}
                })
              }}
              disabled={isRunning}
              className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded text-white/60 transition-all disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        )}

        {/* Info Note */}
        <Alert className="bg-black/20 border-white/10">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs text-white/60">
            <strong>Parameter Sweep:</strong> Each selected parameter will be tested with all specified values.
            The total number of simulations is the product of seed count and all parameter value combinations.
            Start with a small sweep to test, then expand for comprehensive analysis.
          </AlertDescription>
        </Alert>
      </div>
    </Panel>
  )
}