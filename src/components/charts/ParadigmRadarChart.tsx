/**
 * Paradigm Radar Chart - Component-Level Breakdown
 *
 * Displays component breakdown for individual paradigms as radar charts.
 * Each paradigm has 5-7 components visualized radially.
 */

'use client'

import * as React from 'react'
import { RadarChart, RadarDataPoint } from './RadarChart'
import type { StateDelta } from '@/lib/simulationWorkerClient'

interface ParadigmRadarProps {
  paradigm: 'western' | 'development' | 'ecological' | 'indigenous'
  data: StateDelta
  size?: number
  showLabels?: boolean
}

export function ParadigmRadarChart({
  paradigm,
  data,
  size = 240,
  showLabels = true,
}: ParadigmRadarProps) {
  // Get component data and color based on paradigm
  const getRadarData = (): { data: RadarDataPoint[]; color: string } | null => {
    switch (paradigm) {
      case 'western':
        if (!data.westernLiberalComponents) return null
        return {
          data: [
            {
              axis: 'Democracy',
              value: data.westernLiberalComponents.electoralDemocracy,
            },
            {
              axis: 'Liberties',
              value: data.westernLiberalComponents.civilLiberties,
            },
            {
              axis: 'Rule of Law',
              value: data.westernLiberalComponents.ruleOfLaw,
            },
            {
              axis: 'Econ Freedom',
              value: data.westernLiberalComponents.economicFreedom,
            },
            {
              axis: 'Privacy',
              value: data.westernLiberalComponents.privacyFreedom,
            },
          ],
          color: 'var(--color-western-liberal)',
        }

      case 'development':
        if (!data.developmentComponents) return null
        return {
          data: [
            {
              axis: 'GDP',
              value: data.developmentComponents.gdpPerCapita,
            },
            {
              axis: 'Infrastructure',
              value: data.developmentComponents.infrastructureAccess,
            },
            {
              axis: 'Tech',
              value: data.developmentComponents.technologyAdoption,
            },
            {
              axis: 'Urban',
              value: data.developmentComponents.urbanization,
            },
            {
              axis: 'Education',
              value: data.developmentComponents.educationQuality,
            },
          ],
          color: 'var(--color-development)',
        }

      case 'ecological':
        if (!data.ecologicalComponents) return null
        return {
          data: [
            {
              axis: 'Climate',
              value: data.ecologicalComponents.climate,
            },
            {
              axis: 'Bio',
              value: data.ecologicalComponents.biodiversity,
            },
            {
              axis: 'Nitrogen',
              value: data.ecologicalComponents.nitrogen,
            },
            {
              axis: 'Phosphorus',
              value: data.ecologicalComponents.phosphorus,
            },
            {
              axis: 'Water',
              value: data.ecologicalComponents.freshwater,
            },
            {
              axis: 'Land',
              value: data.ecologicalComponents.landUse,
            },
            {
              axis: 'Ocean',
              value: data.ecologicalComponents.oceanAcid,
            },
          ],
          color: 'var(--color-ecological)',
        }

      case 'indigenous':
        if (!data.indigenousComponents) return null
        return {
          data: [
            {
              axis: 'Autonomy',
              value: data.indigenousComponents.localAutonomy,
            },
            {
              axis: 'Culture',
              value: data.indigenousComponents.culturalVitality,
            },
            {
              axis: 'Land',
              value: data.indigenousComponents.landStewardship,
            },
            {
              axis: 'Wellbeing',
              value: data.indigenousComponents.collectiveWellbeing,
            },
            {
              axis: 'Spiritual',
              value: data.indigenousComponents.spiritualConnection,
            },
          ],
          color: 'var(--color-indigenous)',
        }

      default:
        return null
    }
  }

  const radarConfig = getRadarData()

  if (!radarConfig) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--white-40)',
          fontSize: '11px',
        }}
      >
        No component data
      </div>
    )
  }

  return (
    <RadarChart
      data={radarConfig.data}
      color={radarConfig.color}
      size={size}
      showLabels={showLabels}
      fillOpacity={0.2}
      strokeWidth={2}
    />
  )
}
