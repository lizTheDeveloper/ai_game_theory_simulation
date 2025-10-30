/**
 * Timeline Analysis Panel
 *
 * Survival curves, outcome timing distributions, and temporal patterns.
 * Shows when outcomes occur and how many simulations survive to each month.
 */

'use client'

import { type MonteCarloAggregateStats } from '@/lib/MonteCarloManager'
import { Panel } from '@/components/core/Panel'
import { useEffect, useRef, useState } from 'react'

interface TimelineAnalysisPanelProps {
  stats: MonteCarloAggregateStats
  runResults: Array<{
    outcome: string
    totalMonths: number
  }>
}

export function TimelineAnalysisPanel({ stats, runResults }: TimelineAnalysisPanelProps) {
  const survivalCanvasRef = useRef<HTMLCanvasElement>(null)
  const histogramCanvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null)

  // Calculate survival curve data
  const getSurvivalData = () => {
    if (!runResults.length) return []

    const maxMonth = Math.max(...runResults.map(r => r.totalMonths))
    const survivalByMonth: number[] = []

    for (let month = 0; month <= maxMonth; month++) {
      const surviving = runResults.filter(r => r.totalMonths >= month).length
      survivalByMonth[month] = surviving
    }

    return survivalByMonth
  }

  // Calculate outcome timing histogram
  const getOutcomeHistogram = () => {
    if (!runResults.length) return { bins: [], labels: [] }

    const maxMonth = Math.max(...runResults.map(r => r.totalMonths))
    const binSize = Math.ceil(maxMonth / 20) // 20 bins max
    const bins: number[] = []
    const labels: string[] = []

    for (let i = 0; i < 20; i++) {
      const start = i * binSize
      const end = (i + 1) * binSize
      const count = runResults.filter(r => r.totalMonths >= start && r.totalMonths < end).length

      bins.push(count)
      labels.push(`${start}-${end}`)
    }

    return { bins, labels }
  }

  const survivalData = getSurvivalData()
  const histogramData = getOutcomeHistogram()

  // Draw survival curve
  useEffect(() => {
    const canvas = survivalCanvasRef.current
    if (!canvas || !survivalData.length) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 600
    canvas.height = 300

    const padding = 40
    const width = canvas.width - padding * 2
    const height = canvas.height - padding * 2

    // Clear canvas
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (height / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(canvas.width - padding, y)
      ctx.stroke()
    }

    // Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, canvas.height - padding)
    ctx.lineTo(canvas.width - padding, canvas.height - padding)
    ctx.stroke()

    // Draw survival curve
    ctx.strokeStyle = '#00F0FF'
    ctx.lineWidth = 2
    ctx.shadowBlur = 10
    ctx.shadowColor = 'rgba(0, 240, 255, 0.6)'

    ctx.beginPath()
    survivalData.forEach((count, month) => {
      const x = padding + (month / survivalData.length) * width
      const y = canvas.height - padding - (count / runResults.length) * height

      if (month === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Fill area under curve
    ctx.shadowBlur = 0
    ctx.fillStyle = 'rgba(0, 240, 255, 0.1)'
    ctx.beginPath()
    survivalData.forEach((count, month) => {
      const x = padding + (month / survivalData.length) * width
      const y = canvas.height - padding - (count / runResults.length) * height

      if (month === 0) {
        ctx.moveTo(x, canvas.height - padding)
        ctx.lineTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.lineTo(canvas.width - padding, canvas.height - padding)
    ctx.closePath()
    ctx.fill()

    // Draw labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.font = '10px Inter'
    ctx.textAlign = 'center'

    // X-axis labels (months)
    for (let i = 0; i <= 5; i++) {
      const month = Math.floor((survivalData.length / 5) * i)
      const x = padding + (i / 5) * width
      ctx.fillText(month.toString(), x, canvas.height - padding + 20)
    }

    // Y-axis labels (percentage)
    ctx.textAlign = 'right'
    for (let i = 0; i <= 5; i++) {
      const percent = (100 - i * 20)
      const y = padding + (i / 5) * height
      ctx.fillText(`${percent}%`, padding - 10, y + 4)
    }

    // Axis titles
    ctx.font = '12px Inter'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.textAlign = 'center'
    ctx.fillText('Months', canvas.width / 2, canvas.height - 5)

    ctx.save()
    ctx.translate(15, canvas.height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Survival Rate', 0, 0)
    ctx.restore()
  }, [survivalData, runResults.length])

  // Draw outcome timing histogram
  useEffect(() => {
    const canvas = histogramCanvasRef.current
    if (!canvas || !histogramData.bins.length) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 600
    canvas.height = 200

    const padding = 40
    const width = canvas.width - padding * 2
    const height = canvas.height - padding * 2

    // Clear canvas
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Find max value for scaling
    const maxCount = Math.max(...histogramData.bins)

    // Draw bars
    const barWidth = width / histogramData.bins.length
    const barGap = 2

    histogramData.bins.forEach((count, index) => {
      const x = padding + index * barWidth + barGap
      const barHeight = (count / maxCount) * height
      const y = canvas.height - padding - barHeight

      // Determine color based on timing
      let color = '#00F0FF' // Default cyan
      let glow = 'rgba(0, 240, 255, 0.6)'

      if (index < 3) {
        // Early outcomes (red)
        color = '#FF0040'
        glow = 'rgba(255, 0, 64, 0.6)'
      } else if (index < 8) {
        // Mid-term (amber)
        color = '#FFAA00'
        glow = 'rgba(255, 170, 0, 0.6)'
      } else {
        // Long-term (green)
        color = '#00FF88'
        glow = 'rgba(0, 255, 136, 0.6)'
      }

      // Draw bar with glow
      ctx.shadowBlur = 10
      ctx.shadowColor = glow
      ctx.fillStyle = color
      ctx.fillRect(x, y, barWidth - barGap * 2, barHeight)
      ctx.shadowBlur = 0

      // Draw count label on top
      if (count > 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.font = '10px Inter'
        ctx.textAlign = 'center'
        ctx.fillText(count.toString(), x + (barWidth - barGap * 2) / 2, y - 5)
      }
    })

    // Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, canvas.height - padding)
    ctx.lineTo(canvas.width - padding, canvas.height - padding)
    ctx.stroke()

    // X-axis labels (selected bins)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.font = '9px Inter'
    ctx.textAlign = 'center'

    for (let i = 0; i < histogramData.labels.length; i += 4) {
      const x = padding + i * barWidth + barWidth / 2
      ctx.fillText(histogramData.labels[i], x, canvas.height - padding + 15)
    }
  }, [histogramData])

  // Calculate key metrics
  const medianSurvival = stats.timeline?.medianMonthsToOutcome || 0
  const earlyFailureRate = runResults.filter(r => r.totalMonths < 50).length / runResults.length * 100
  const longTermRate = runResults.filter(r => r.totalMonths > 200).length / runResults.length * 100

  return (
    <div className="space-y-6">
      {/* Survival Curve */}
      <Panel title="Survival Curve" glow="cyan">
        <div className="space-y-4">
          <canvas
            ref={survivalCanvasRef}
            className="w-full"
            style={{ imageRendering: 'auto' }}
          />

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div className="text-center p-3 bg-purple-500/10 border border-purple-400/30 rounded">
              <div className="text-2xl font-light text-purple-400">
                {medianSurvival} mo
              </div>
              <div className="text-xs text-white/40 mt-1">Median Survival</div>
              <p className="text-xs text-white/30 mt-2">
                50% of runs last this long
              </p>
            </div>

            <div className="text-center p-3 bg-red-500/10 border border-red-400/30 rounded">
              <div className="text-2xl font-light text-red-400">
                {earlyFailureRate.toFixed(1)}%
              </div>
              <div className="text-xs text-white/40 mt-1">Early Failures</div>
              <p className="text-xs text-white/30 mt-2">
                Collapse within 50 months
              </p>
            </div>

            <div className="text-center p-3 bg-green-500/10 border border-green-400/30 rounded">
              <div className="text-2xl font-light text-green-400">
                {longTermRate.toFixed(1)}%
              </div>
              <div className="text-xs text-white/40 mt-1">Long-Term Stable</div>
              <p className="text-xs text-white/30 mt-2">
                Survive beyond 200 months
              </p>
            </div>
          </div>
        </div>
      </Panel>

      {/* Outcome Timing Distribution */}
      <Panel title="Outcome Timing Distribution" glow="amber">
        <div className="space-y-4">
          <p className="text-sm text-white/60">
            When do simulations reach their final outcomes? Early failures indicate fragility,
            while late outcomes suggest resilient systems.
          </p>

          <canvas
            ref={histogramCanvasRef}
            className="w-full"
            style={{ imageRendering: 'auto' }}
          />

          {/* Timeline Stats */}
          <div className="grid grid-cols-4 gap-4 pt-4 border-t border-white/10">
            <div>
              <div className="text-xs text-white/40">Earliest</div>
              <div className="text-xl font-light text-red-400">
                {stats.timeline?.minMonthsToOutcome || 0} mo
              </div>
            </div>
            <div>
              <div className="text-xs text-white/40">Average</div>
              <div className="text-xl font-light text-amber-400">
                {stats.timeline?.avgMonthsToOutcome.toFixed(1) || 0} mo
              </div>
            </div>
            <div>
              <div className="text-xs text-white/40">Median</div>
              <div className="text-xl font-light text-cyan-400">
                {stats.timeline?.medianMonthsToOutcome || 0} mo
              </div>
            </div>
            <div>
              <div className="text-xs text-white/40">Latest</div>
              <div className="text-xl font-light text-green-400">
                {stats.timeline?.maxMonthsToOutcome || 0} mo
              </div>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  )
}