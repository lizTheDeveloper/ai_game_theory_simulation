/**
 * Overall Paradigm Radar - High-Level Comparison
 *
 * Shows all 4 paradigm headline scores on a single radar chart.
 * Enables at-a-glance comparison of paradigm balance.
 */

'use client'

import * as React from 'react'
import { RadarChart, RadarDataPoint } from './RadarChart'
import type { StateDelta } from '@/lib/simulationWorkerClient'

interface OverallParadigmRadarProps {
  data: StateDelta
  size?: number
  showPrevious?: boolean
  className?: string
}

export function OverallParadigmRadar({
  data,
  size = 320,
  showPrevious = false,
  className,
}: OverallParadigmRadarProps) {
  // Validate all scores are present
  const hasValidData =
    typeof data.westernLiberalIndex === 'number' &&
    !isNaN(data.westernLiberalIndex) &&
    typeof data.developmentIndex === 'number' &&
    !isNaN(data.developmentIndex) &&
    typeof data.ecologicalIndex === 'number' &&
    !isNaN(data.ecologicalIndex) &&
    typeof data.indigenousIndex === 'number' &&
    !isNaN(data.indigenousIndex)

  if (!hasValidData) {
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
        Waiting for paradigm data...
      </div>
    )
  }

  const radarData: RadarDataPoint[] = [
    {
      axis: 'Western Liberal',
      value: data.westernLiberalIndex ?? 0,
    },
    {
      axis: 'Development',
      value: data.developmentIndex ?? 0,
    },
    {
      axis: 'Ecological',
      value: data.ecologicalIndex ?? 0,
    },
    {
      axis: 'Indigenous',
      value: data.indigenousIndex ?? 0,
    },
  ]

  // Get previous data if available
  let previousRadarData: RadarDataPoint[] | undefined
  if (showPrevious && data.history) {
    const histories = {
      western: data.history.westernLiberalIndex,
      development: data.history.developmentIndex,
      ecological: data.history.ecologicalIndex,
      indigenous: data.history.indigenousIndex,
    }

    // Get last historical value (if exists)
    const hasHistory = Object.values(histories).every((h) => h && h.length > 0)
    if (hasHistory) {
      previousRadarData = [
        {
          axis: 'Western Liberal',
          value: histories.western[histories.western.length - 1],
        },
        {
          axis: 'Development',
          value: histories.development[histories.development.length - 1],
        },
        {
          axis: 'Ecological',
          value: histories.ecological[histories.ecological.length - 1],
        },
        {
          axis: 'Indigenous',
          value: histories.indigenous[histories.indigenous.length - 1],
        },
      ]
    }
  }

  // Calculate balance metrics
  const scores = [
    data.westernLiberalIndex ?? 0,
    data.developmentIndex ?? 0,
    data.ecologicalIndex ?? 0,
    data.indigenousIndex ?? 0,
  ]
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
  const divergence = Math.sqrt(
    scores.reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / scores.length
  )

  // Detect contested outcome
  const utopiaCount = scores.filter((s) => s >= 80).length
  const dystopiaCount = scores.filter((s) => s < 30).length
  const isContested = utopiaCount > 0 && dystopiaCount > 0

  return (
    <div className={className}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        {/* Radar Chart */}
        <RadarChart
          data={radarData}
          previousData={previousRadarData}
          color="var(--color-cyan)"
          size={size}
          showLabels={true}
          fillOpacity={0.2}
          strokeWidth={2.5}
        />

        {/* Balance Metrics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            width: '100%',
            maxWidth: size,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '10px',
                color: 'var(--white-40)',
                marginBottom: '0.25rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Average
            </div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: '300',
                color: avgScore >= 60 ? 'var(--color-cyan)' : 'var(--color-amber)',
              }}
            >
              {avgScore.toFixed(1)}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '10px',
                color: 'var(--white-40)',
                marginBottom: '0.25rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Divergence
            </div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: '300',
                color: divergence > 30 ? 'var(--color-amber)' : 'var(--white-60)',
              }}
            >
              {divergence.toFixed(1)}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '10px',
                color: 'var(--white-40)',
                marginBottom: '0.25rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Contested
            </div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: '300',
                color: isContested ? 'var(--color-red)' : 'var(--color-green)',
              }}
            >
              {isContested ? 'Yes' : 'No'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
