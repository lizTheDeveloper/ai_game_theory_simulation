/**
 * Outcome Distribution Panel
 *
 * Visualizes the 7-tier outcome classification across all simulation runs.
 * Shows both percentage distributions and raw counts with visual severity encoding.
 */

'use client'

import { type MonteCarloAggregateStats } from '@/lib/MonteCarloManager'
import { Panel } from '@/components/core/Panel'
import { useEffect, useRef } from 'react'

interface OutcomeDistributionPanelProps {
  stats: MonteCarloAggregateStats
  outcomeBreakdown: Record<string, number> | null
}

// 7-tier outcome classification with colors and descriptions
const OUTCOME_TIERS = [
  {
    key: 'utopia',
    label: 'Utopia',
    color: '#00FF88', // Bright green
    glow: 'rgba(0, 255, 136, 0.6)',
    description: 'Post-scarcity abundance, flourishing civilization'
  },
  {
    key: 'postScarcity',
    label: 'Post-Scarcity',
    color: '#00CCFF', // Cyan
    glow: 'rgba(0, 204, 255, 0.6)',
    description: 'Material abundance, most problems solved'
  },
  {
    key: 'sustainable',
    label: 'Sustainable',
    color: '#00AAAA', // Teal
    glow: 'rgba(0, 170, 170, 0.6)',
    description: 'Stable equilibrium, manageable challenges'
  },
  {
    key: 'bottleneck',
    label: 'Bottleneck',
    color: '#FFAA00', // Amber
    glow: 'rgba(255, 170, 0, 0.6)',
    description: 'Struggling but surviving, narrow path forward'
  },
  {
    key: 'collapse',
    label: 'Collapse',
    color: '#FF6600', // Orange
    glow: 'rgba(255, 102, 0, 0.6)',
    description: 'Civilization breakdown, major regression'
  },
  {
    key: 'extinction',
    label: 'Extinction',
    color: '#FF0040', // Red
    glow: 'rgba(255, 0, 64, 0.6)',
    description: 'Human extinction or near-extinction'
  },
  {
    key: 'terminal',
    label: 'Terminal',
    color: '#AA00FF', // Purple
    glow: 'rgba(170, 0, 255, 0.6)',
    description: 'Permanent dystopia, no recovery possible'
  }
]

export function OutcomeDistributionPanel({ stats, outcomeBreakdown }: OutcomeDistributionPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Calculate percentages and prepare data
  const getOutcomeData = () => {
    if (outcomeBreakdown) {
      // Use detailed 7-tier breakdown if available
      const total = Object.values(outcomeBreakdown).reduce((a, b) => a + b, 0) || 1
      return OUTCOME_TIERS.map(tier => ({
        ...tier,
        count: outcomeBreakdown[tier.key] || 0,
        percentage: ((outcomeBreakdown[tier.key] || 0) / total) * 100
      }))
    }

    // Fall back to 4-category legacy data if available
    if (stats.outcomeDistribution) {
      const total = stats.completedRuns || 1
      const legacyMapping: Record<string, string[]> = {
        utopia: ['utopia', 'postScarcity'],
        dystopia: ['terminal', 'collapse'],
        extinction: ['extinction', 'bottleneck'],
        stalemate: ['sustainable']
      }

      const mapped: Record<string, number> = {}
      Object.entries(stats.outcomeDistribution).forEach(([key, value]) => {
        const targets = legacyMapping[key] || []
        targets.forEach(target => {
          mapped[target] = (mapped[target] || 0) + value / targets.length
        })
      })

      return OUTCOME_TIERS.map(tier => ({
        ...tier,
        count: Math.floor(mapped[tier.key] || 0),
        percentage: ((mapped[tier.key] || 0) / total) * 100
      }))
    }

    return OUTCOME_TIERS.map(tier => ({ ...tier, count: 0, percentage: 0 }))
  }

  const outcomeData = getOutcomeData()

  // Draw circular pie chart with glowing effects
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 400
    canvas.height = 400

    const centerX = 200
    const centerY = 200
    const radius = 150
    const innerRadius = 80

    // Clear canvas
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw segments
    let currentAngle = -Math.PI / 2 // Start at top

    outcomeData.forEach(outcome => {
      if (outcome.percentage === 0) return

      const angle = (outcome.percentage / 100) * Math.PI * 2

      // Draw glow effect
      ctx.shadowBlur = 20
      ctx.shadowColor = outcome.glow

      // Draw segment
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + angle, false)
      ctx.arc(centerX, centerY, innerRadius, currentAngle + angle, currentAngle, true)
      ctx.closePath()

      ctx.fillStyle = outcome.color
      ctx.fill()

      // Reset shadow for next segment
      ctx.shadowBlur = 0

      currentAngle += angle
    })

    // Draw center text
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '24px Inter'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(stats.completedRuns.toString(), centerX, centerY - 10)

    ctx.font = '12px Inter'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.fillText('Total Runs', centerX, centerY + 10)
  }, [outcomeData, stats.completedRuns])

  return (
    <Panel title="Outcome Distribution" glow="cyan">
      <div className="grid grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="max-w-full"
            style={{ imageRendering: 'crisp-edges' }}
          />
        </div>

        {/* Legend and Stats */}
        <div className="space-y-3">
          {outcomeData.map((outcome, index) => (
            <div
              key={outcome.key}
              className="p-3 bg-black border rounded transition-all duration-300 hover:scale-105"
              style={{
                borderColor: `${outcome.color}40`,
                boxShadow: outcome.count > 0 ? `0 0 10px ${outcome.glow}` : 'none'
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: outcome.color,
                      boxShadow: `0 0 10px ${outcome.glow}`
                    }}
                  />
                  <span className="text-sm font-medium" style={{ color: outcome.color }}>
                    {outcome.label}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-light" style={{ color: outcome.color }}>
                    {outcome.percentage.toFixed(1)}%
                  </div>
                  <div className="text-xs text-white/40">
                    {outcome.count} runs
                  </div>
                </div>
              </div>

              <p className="text-xs text-white/40 mt-2">
                {outcome.description}
              </p>

              {/* Progress bar */}
              <div className="h-1 bg-white/10 rounded mt-2 overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${outcome.percentage}%`,
                    backgroundColor: outcome.color,
                    boxShadow: `inset 0 0 10px ${outcome.glow}`
                  }}
                />
              </div>
            </div>
          ))}

          {/* Summary Stats */}
          <div className="pt-4 mt-4 border-t border-white/10">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/40">Survival Rate:</span>
                <div className="text-xl font-light text-green-400">
                  {(100 - (outcomeData.find(o => o.key === 'extinction')?.percentage || 0)).toFixed(1)}%
                </div>
              </div>
              <div>
                <span className="text-white/40">Positive Outcomes:</span>
                <div className="text-xl font-light text-cyan-400">
                  {(
                    (outcomeData.find(o => o.key === 'utopia')?.percentage || 0) +
                    (outcomeData.find(o => o.key === 'postScarcity')?.percentage || 0) +
                    (outcomeData.find(o => o.key === 'sustainable')?.percentage || 0)
                  ).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  )
}