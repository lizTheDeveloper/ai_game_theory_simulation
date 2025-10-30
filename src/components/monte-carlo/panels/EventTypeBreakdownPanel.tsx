/**
 * Event Type Breakdown Panel
 *
 * Aggregate event statistics across all simulation runs.
 * Shows distribution of event types to identify patterns.
 */

'use client'

import { Panel } from '@/components/core/Panel'
import { useEffect, useRef } from 'react'

interface EventTypeBreakdownPanelProps {
  eventStats: Record<string, number> | null
  totalRuns: number
}

// Event type configuration with colors and descriptions
const EVENT_TYPES = [
  {
    key: 'action',
    label: 'Actions',
    color: '#00CCFF',
    glow: 'rgba(0, 204, 255, 0.6)',
    description: 'Agent decisions and interventions'
  },
  {
    key: 'milestone',
    label: 'Milestones',
    color: '#00FF88',
    glow: 'rgba(0, 255, 136, 0.6)',
    description: 'Achievement thresholds reached'
  },
  {
    key: 'deployment',
    label: 'Deployments',
    color: '#00AAAA',
    glow: 'rgba(0, 170, 170, 0.6)',
    description: 'Technology rollouts'
  },
  {
    key: 'crisis',
    label: 'Crises',
    color: '#FF6600',
    glow: 'rgba(255, 102, 0, 0.6)',
    description: 'Emergency situations'
  },
  {
    key: 'policy',
    label: 'Policies',
    color: '#AA00FF',
    glow: 'rgba(170, 0, 255, 0.6)',
    description: 'Governance decisions'
  },
  {
    key: 'technology',
    label: 'Technologies',
    color: '#00F0FF',
    glow: 'rgba(0, 240, 255, 0.6)',
    description: 'Research breakthroughs'
  },
  {
    key: 'breakthrough',
    label: 'Breakthroughs',
    color: '#FFFF00',
    glow: 'rgba(255, 255, 0, 0.6)',
    description: 'Major discoveries'
  },
  {
    key: 'cascading_failure',
    label: 'Cascades',
    color: '#FF0040',
    glow: 'rgba(255, 0, 64, 0.6)',
    description: 'Systemic failures'
  },
  {
    key: 'extinction',
    label: 'Extinction',
    color: '#AA0000',
    glow: 'rgba(170, 0, 0, 0.6)',
    description: 'Terminal events'
  }
]

export function EventTypeBreakdownPanel({ eventStats, totalRuns }: EventTypeBreakdownPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Prepare data with averages
  const getEventData = () => {
    if (!eventStats) return []

    return EVENT_TYPES.map(type => ({
      ...type,
      total: eventStats[type.key] || 0,
      average: totalRuns > 0 ? (eventStats[type.key] || 0) / totalRuns : 0
    }))
  }

  const eventData = getEventData()

  // Draw bar chart
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !eventData.length) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 800
    canvas.height = 400

    const padding = 60
    const width = canvas.width - padding * 2
    const height = canvas.height - padding * 2

    // Clear canvas
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Find max value for scaling (use log scale for better visibility)
    const maxValue = Math.max(...eventData.map(d => d.average))
    const logMax = Math.log10(maxValue + 1)

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])

    for (let i = 0; i <= 5; i++) {
      const y = padding + (height / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(canvas.width - padding, y)
      ctx.stroke()
    }
    ctx.setLineDash([])

    // Draw bars
    const barWidth = width / eventData.length
    const barGap = barWidth * 0.2

    eventData.forEach((event, index) => {
      const x = padding + index * barWidth + barGap / 2
      const logValue = Math.log10(event.average + 1)
      const barHeight = (logValue / logMax) * height
      const y = canvas.height - padding - barHeight

      // Draw bar with gradient
      const gradient = ctx.createLinearGradient(x, y, x, canvas.height - padding)
      gradient.addColorStop(0, event.color)
      gradient.addColorStop(1, `${event.color}40`)

      ctx.shadowBlur = 15
      ctx.shadowColor = event.glow
      ctx.fillStyle = gradient
      ctx.fillRect(x, y, barWidth - barGap, barHeight)
      ctx.shadowBlur = 0

      // Draw value on top
      ctx.fillStyle = event.color
      ctx.font = '12px Inter'
      ctx.textAlign = 'center'
      ctx.fillText(
        event.average.toFixed(0),
        x + (barWidth - barGap) / 2,
        y - 10
      )

      // Draw label at bottom (rotated)
      ctx.save()
      ctx.translate(x + (barWidth - barGap) / 2, canvas.height - padding + 15)
      ctx.rotate(Math.PI / 4)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.font = '10px Inter'
      ctx.textAlign = 'left'
      ctx.fillText(event.label, 0, 0)
      ctx.restore()
    })

    // Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, canvas.height - padding)
    ctx.lineTo(canvas.width - padding, canvas.height - padding)
    ctx.stroke()

    // Y-axis label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.font = '12px Inter'
    ctx.save()
    ctx.translate(20, canvas.height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = 'center'
    ctx.fillText('Average Events per Run (log scale)', 0, 0)
    ctx.restore()
  }, [eventData])

  // Calculate totals
  const totalEvents = eventData.reduce((sum, e) => sum + e.total, 0)
  const eventsPerRun = totalRuns > 0 ? totalEvents / totalRuns : 0

  return (
    <Panel title="Event Type Breakdown" glow="cyan">
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-white/5 rounded">
          <div className="text-center">
            <div className="text-3xl font-light text-cyan-400">{totalEvents.toLocaleString()}</div>
            <div className="text-xs text-white/40 mt-1">Total Events</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-light text-green-400">{eventsPerRun.toFixed(0)}</div>
            <div className="text-xs text-white/40 mt-1">Events per Run</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-light text-amber-400">{totalRuns}</div>
            <div className="text-xs text-white/40 mt-1">Simulation Runs</div>
          </div>
        </div>

        {/* Bar Chart */}
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ imageRendering: 'auto' }}
        />

        {/* Event Type Legend */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
          {eventData.map(event => (
            <div
              key={event.key}
              className="flex items-start gap-2 p-2 bg-black border rounded transition-all duration-300 hover:scale-105"
              style={{
                borderColor: `${event.color}30`,
                boxShadow: event.total > 0 ? `0 0 5px ${event.glow}` : 'none'
              }}
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
                style={{
                  backgroundColor: event.color,
                  boxShadow: `0 0 10px ${event.glow}`
                }}
              />
              <div className="flex-1">
                <div className="text-xs font-medium" style={{ color: event.color }}>
                  {event.label}
                </div>
                <div className="text-xs text-white/40">
                  {event.description}
                </div>
                <div className="text-xs mt-1">
                  <span className="text-white/60">{event.total.toLocaleString()}</span>
                  <span className="text-white/30"> total</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pattern Analysis */}
        <div className="p-4 bg-purple-500/10 border border-purple-400/30 rounded">
          <div className="text-sm text-purple-400 mb-2">Pattern Analysis</div>
          <div className="text-xs text-white/60 space-y-1">
            {eventData.filter(e => e.key === 'cascading_failure').map(e => e.average)[0] > 10 && (
              <p>⚠️ High cascade rate detected - system fragility present</p>
            )}
            {eventData.filter(e => e.key === 'extinction').map(e => e.average)[0] > 5 && (
              <p>☢️ Significant extinction events - existential risks active</p>
            )}
            {eventData.filter(e => e.key === 'breakthrough').map(e => e.average)[0] < 1 && (
              <p>🔬 Low breakthrough rate - research may be bottlenecked</p>
            )}
            {eventData.filter(e => e.key === 'crisis').map(e => e.average)[0] > 50 && (
              <p>🚨 Crisis-heavy simulation - instability dominates</p>
            )}
          </div>
        </div>
      </div>
    </Panel>
  )
}