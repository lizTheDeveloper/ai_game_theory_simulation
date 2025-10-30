/**
 * Parameter Sweep Comparison
 *
 * Side-by-side comparison of outcome distributions for different parameter values.
 * Enables sensitivity analysis and parameter optimization.
 */

'use client'

import { type ParameterSweepGroup } from '@/lib/MonteCarloManager'
import { Panel } from '@/components/core/Panel'
import { useState } from 'react'

interface ParameterSweepComparisonProps {
  sweepGroups: ParameterSweepGroup[]
  runResults: Map<string, { outcome: string }>
}

export function ParameterSweepComparison({ sweepGroups, runResults }: ParameterSweepComparisonProps) {
  const [selectedParameter, setSelectedParameter] = useState<string | null>(null)

  // Group sweep groups by parameter name
  const groupedByParameter = sweepGroups.reduce((acc, group) => {
    if (!acc[group.parameterName]) {
      acc[group.parameterName] = []
    }
    acc[group.parameterName].push(group)
    return acc
  }, {} as Record<string, ParameterSweepGroup[]>)

  // Calculate outcome distribution for a group
  const getOutcomeDistribution = (group: ParameterSweepGroup) => {
    const outcomes: Record<string, number> = {
      utopia: 0,
      postScarcity: 0,
      sustainable: 0,
      bottleneck: 0,
      collapse: 0,
      extinction: 0,
      terminal: 0
    }

    group.simulationIds.forEach(simId => {
      const result = runResults.get(simId)
      if (result?.outcome) {
        const outcome = result.outcome.toLowerCase()
        if (outcome in outcomes) {
          outcomes[outcome]++
        }
      }
    })

    const total = group.simulationIds.length
    return Object.entries(outcomes).map(([key, count]) => ({
      outcome: key,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }))
  }

  // Get color for outcome
  const getOutcomeColor = (outcome: string) => {
    const colors: Record<string, { color: string; glow: string }> = {
      utopia: { color: '#00FF88', glow: 'rgba(0, 255, 136, 0.6)' },
      postScarcity: { color: '#00CCFF', glow: 'rgba(0, 204, 255, 0.6)' },
      sustainable: { color: '#00AAAA', glow: 'rgba(0, 170, 170, 0.6)' },
      bottleneck: { color: '#FFAA00', glow: 'rgba(255, 170, 0, 0.6)' },
      collapse: { color: '#FF6600', glow: 'rgba(255, 102, 0, 0.6)' },
      extinction: { color: '#FF0040', glow: 'rgba(255, 0, 64, 0.6)' },
      terminal: { color: '#AA00FF', glow: 'rgba(170, 0, 255, 0.6)' }
    }
    return colors[outcome] || { color: '#FFFFFF', glow: 'rgba(255, 255, 255, 0.6)' }
  }

  const parameterNames = Object.keys(groupedByParameter)
  const activeParameter = selectedParameter || parameterNames[0]
  const activeGroups = groupedByParameter[activeParameter] || []

  return (
    <Panel title="Parameter Sweep Comparison" glow="purple">
      <div className="space-y-6">
        {/* Parameter Selector */}
        {parameterNames.length > 1 && (
          <div className="flex gap-2 pb-4 border-b border-white/10">
            {parameterNames.map(param => (
              <button
                key={param}
                onClick={() => setSelectedParameter(param)}
                className={`px-4 py-2 text-sm rounded transition-all duration-300 ${
                  activeParameter === param
                    ? 'bg-purple-500/20 border border-purple-400/60 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                    : 'bg-white/5 border border-white/20 text-white/60 hover:bg-white/10'
                }`}
              >
                {param}
              </button>
            ))}
          </div>
        )}

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeGroups.map((group, index) => {
            const distribution = getOutcomeDistribution(group)
            const completedRuns = group.simulationIds.filter(id => runResults.has(id)).length
            const completionRate = (completedRuns / group.simulationIds.length) * 100

            return (
              <div
                key={`${group.parameterName}-${group.parameterValue}`}
                className="space-y-4 p-4 bg-black border border-purple-400/30 rounded"
                style={{
                  boxShadow: '0 0 20px rgba(168, 85, 247, 0.2)'
                }}
              >
                {/* Header */}
                <div className="text-center">
                  <div className="text-lg font-medium text-purple-400">
                    {group.parameterValue}
                  </div>
                  <div className="text-xs text-white/40 mt-1">
                    {completedRuns} / {group.simulationIds.length} runs
                  </div>
                  <div className="h-1 bg-white/10 rounded mt-2 overflow-hidden">
                    <div
                      className="h-full bg-purple-500/50 transition-all duration-500"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>

                {/* Outcome Bars */}
                <div className="space-y-2">
                  {distribution.map(({ outcome, count, percentage }) => {
                    const colors = getOutcomeColor(outcome)
                    if (percentage === 0) return null

                    return (
                      <div key={outcome} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span style={{ color: colors.color }}>
                            {outcome.charAt(0).toUpperCase() + outcome.slice(1)}
                          </span>
                          <span className="text-white/60">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-6 bg-white/5 rounded overflow-hidden">
                          <div
                            className="h-full transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: colors.color,
                              boxShadow: `inset 0 0 10px ${colors.glow}`
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Key Metrics */}
                <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-white/40">Survival:</span>
                    <div className="text-green-400">
                      {(100 - distribution.find(d => d.outcome === 'extinction')?.percentage || 0).toFixed(0)}%
                    </div>
                  </div>
                  <div>
                    <span className="text-white/40">Utopia:</span>
                    <div className="text-cyan-400">
                      {distribution.find(d => d.outcome === 'utopia')?.percentage.toFixed(0) || 0}%
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Sensitivity Analysis */}
        <div className="p-4 bg-purple-500/10 border border-purple-400/30 rounded">
          <div className="text-sm text-purple-400 mb-3">Sensitivity Analysis</div>

          {activeGroups.length >= 2 && (
            <div className="space-y-2 text-xs text-white/60">
              {/* Calculate variance in outcomes */}
              {(() => {
                const utopiaRates = activeGroups.map(g =>
                  getOutcomeDistribution(g).find(d => d.outcome === 'utopia')?.percentage || 0
                )
                const extinctionRates = activeGroups.map(g =>
                  getOutcomeDistribution(g).find(d => d.outcome === 'extinction')?.percentage || 0
                )

                const utopiaVariance = Math.max(...utopiaRates) - Math.min(...utopiaRates)
                const extinctionVariance = Math.max(...extinctionRates) - Math.min(...extinctionRates)

                return (
                  <>
                    <p>
                      <span className="text-cyan-400">Utopia variance:</span> {utopiaVariance.toFixed(1)}%
                      {utopiaVariance > 20 && ' (High sensitivity!)'}
                    </p>
                    <p>
                      <span className="text-red-400">Extinction variance:</span> {extinctionVariance.toFixed(1)}%
                      {extinctionVariance > 30 && ' (Critical parameter!)'}
                    </p>
                    {utopiaVariance < 5 && extinctionVariance < 5 && (
                      <p className="text-white/40">Low sensitivity - parameter has minimal impact</p>
                    )}
                  </>
                )
              })()}
            </div>
          )}

          {/* Optimal value identification */}
          {activeGroups.length >= 3 && (
            <div className="mt-3 pt-3 border-t border-white/10 text-xs">
              <div className="text-white/80 mb-1">Optimal Value:</div>
              {(() => {
                const bestGroup = activeGroups.reduce((best, group) => {
                  const dist = getOutcomeDistribution(group)
                  const score = (dist.find(d => d.outcome === 'utopia')?.percentage || 0) -
                               (dist.find(d => d.outcome === 'extinction')?.percentage || 0)
                  const bestScore = getOutcomeDistribution(best).find(d => d.outcome === 'utopia')?.percentage || 0 -
                                   getOutcomeDistribution(best).find(d => d.outcome === 'extinction')?.percentage || 0
                  return score > bestScore ? group : best
                })

                return (
                  <div className="text-green-400">
                    {activeParameter} = {bestGroup.parameterValue}
                    <span className="text-white/40 ml-2">
                      (Maximizes utopia - extinction differential)
                    </span>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      </div>
    </Panel>
  )
}