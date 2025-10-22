/**
 * Sparkline Component - Far-Future Design System
 *
 * Inline time-series visualization for showing trends at a glance.
 * Pure SVG, minimal, glowing cyan line.
 *
 * Reference: /designs/00_design_system.md
 */

import * as React from "react"

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  className?: string
}

export function Sparkline({
  data,
  width = 100,
  height = 32,
  color = 'var(--color-cyan)',
  className
}: SparklineProps) {
  if (data.length < 2) {
    return <div className={className} style={{ width, height }} />
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1 // Avoid division by zero

  // Generate SVG path
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  })

  const path = `M ${points.join(' L ')}`

  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={`0 0 ${width} ${height}`}
    >
      <path
        d={path}
        className="sparkline-path"
        style={{ stroke: color }}
      />
    </svg>
  )
}
