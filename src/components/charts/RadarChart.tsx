/**
 * Radar Chart Component - Far-Future Design System
 *
 * Radial/spider chart for multi-dimensional data visualization.
 * Pure SVG with glowing lines on black background.
 *
 * Design: Elysium-inspired, minimalist, high-contrast
 */

'use client'

import * as React from "react"

export interface RadarDataPoint {
  axis: string
  value: number // 0-100
  fullMark?: number // Max value (default 100)
}

interface RadarChartProps {
  data: RadarDataPoint[]
  color?: string
  fillOpacity?: number
  strokeWidth?: number
  size?: number
  className?: string
  showAxes?: boolean
  showLabels?: boolean
  showGrid?: boolean
  gridLevels?: number
  previousData?: RadarDataPoint[] // For historical overlay
  previousColor?: string
}

export function RadarChart({
  data,
  color = 'var(--color-cyan)',
  fillOpacity = 0.15,
  strokeWidth = 2,
  size = 300,
  className,
  showAxes = true,
  showLabels = true,
  showGrid = true,
  gridLevels = 5,
  previousData,
  previousColor = 'var(--white-20)',
}: RadarChartProps) {
  if (data.length < 3) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--white-40)',
          fontSize: '12px',
        }}
      >
        Need at least 3 dimensions
      </div>
    )
  }

  const center = size / 2
  const radius = (size * 0.35) // Leave room for labels
  const angleStep = (2 * Math.PI) / data.length

  // Calculate point coordinates from center
  const polarToCartesian = (angle: number, distance: number) => {
    // Start from top (12 o'clock) and go clockwise
    const adjustedAngle = angle - Math.PI / 2
    return {
      x: center + distance * Math.cos(adjustedAngle),
      y: center + distance * Math.sin(adjustedAngle),
    }
  }

  // Generate polygon points for data
  const generatePolygonPoints = (dataPoints: RadarDataPoint[]): string => {
    return dataPoints
      .map((point, index) => {
        const angle = index * angleStep
        const fullMark = point.fullMark || 100
        const normalizedValue = Math.max(0, Math.min(100, point.value))
        const distance = (normalizedValue / fullMark) * radius
        const { x, y } = polarToCartesian(angle, distance)
        return `${x},${y}`
      })
      .join(' ')
  }

  // Grid circles
  const gridCircles = Array.from({ length: gridLevels }, (_, i) => {
    const level = ((i + 1) / gridLevels) * 100
    const r = (radius * (i + 1)) / gridLevels
    return (
      <circle
        key={`grid-${i}`}
        cx={center}
        cy={center}
        r={r}
        fill="none"
        stroke="var(--white-10)"
        strokeWidth="0.5"
      />
    )
  })

  // Axis lines
  const axisLines = data.map((point, index) => {
    const angle = index * angleStep
    const { x, y } = polarToCartesian(angle, radius)
    return (
      <line
        key={`axis-${index}`}
        x1={center}
        y1={center}
        x2={x}
        y2={y}
        stroke="var(--white-10)"
        strokeWidth="0.5"
      />
    )
  })

  // Labels
  const labels = data.map((point, index) => {
    const angle = index * angleStep
    const labelDistance = radius + 25
    const { x, y } = polarToCartesian(angle, labelDistance)

    // Calculate text anchor based on position
    let textAnchor: 'start' | 'middle' | 'end' = 'middle'
    const adjustedAngle = angle - Math.PI / 2
    const cosAngle = Math.cos(adjustedAngle)
    if (cosAngle > 0.1) textAnchor = 'start'
    else if (cosAngle < -0.1) textAnchor = 'end'

    return (
      <text
        key={`label-${index}`}
        x={x}
        y={y}
        textAnchor={textAnchor}
        dominantBaseline="middle"
        fill="var(--white-60)"
        fontSize="10"
        fontWeight="400"
      >
        {point.axis}
      </text>
    )
  })

  // Value labels (on data points)
  const valueLabels = data.map((point, index) => {
    const angle = index * angleStep
    const fullMark = point.fullMark || 100
    const normalizedValue = Math.max(0, Math.min(100, point.value))
    const distance = (normalizedValue / fullMark) * radius
    const { x, y } = polarToCartesian(angle, distance + 8)

    return (
      <text
        key={`value-${index}`}
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontSize="9"
        fontWeight="500"
        style={{ filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.8))' }}
      >
        {normalizedValue.toFixed(0)}
      </text>
    )
  })

  const polygonPoints = generatePolygonPoints(data)
  const previousPolygonPoints = previousData ? generatePolygonPoints(previousData) : null

  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox={`0 0 ${size} ${size}`}
    >
      {/* Grid circles */}
      {showGrid && gridCircles}

      {/* Axis lines */}
      {showAxes && axisLines}

      {/* Previous data (faded overlay) */}
      {previousPolygonPoints && (
        <>
          <polygon
            points={previousPolygonPoints}
            fill={previousColor}
            fillOpacity={fillOpacity * 0.5}
            stroke={previousColor}
            strokeWidth={strokeWidth * 0.5}
            strokeOpacity={0.3}
          />
        </>
      )}

      {/* Current data polygon */}
      <polygon
        points={polygonPoints}
        fill={color}
        fillOpacity={fillOpacity}
        stroke={color}
        strokeWidth={strokeWidth}
        style={{
          filter: `drop-shadow(0 0 8px ${color})`,
        }}
      />

      {/* Data point dots */}
      {data.map((point, index) => {
        const angle = index * angleStep
        const fullMark = point.fullMark || 100
        const normalizedValue = Math.max(0, Math.min(100, point.value))
        const distance = (normalizedValue / fullMark) * radius
        const { x, y } = polarToCartesian(angle, distance)

        return (
          <circle
            key={`dot-${index}`}
            cx={x}
            cy={y}
            r="3"
            fill={color}
            stroke="var(--color-black)"
            strokeWidth="1"
            style={{
              filter: `drop-shadow(0 0 4px ${color})`,
            }}
          />
        )
      })}

      {/* Axis labels */}
      {showLabels && labels}

      {/* Value labels on hover */}
      {showLabels && valueLabels}
    </svg>
  )
}
