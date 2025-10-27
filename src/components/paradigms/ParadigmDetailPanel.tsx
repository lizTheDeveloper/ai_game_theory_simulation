/**
 * Paradigm Detail Panel - Side Panel Drill-Down
 *
 * Shows detailed indicators for a selected paradigm:
 * - Western Liberal: 4 indicators (democracy, civil liberties, rule of law, econ freedom)
 * - Development: 3+ indicators (life expectancy, GDP, education)
 * - Ecological: 9 indicators (9 planetary boundaries)
 * - Indigenous: 3+ indicators (social trust, community bonds, meaning)
 *
 * Features:
 * - Slide-in animation (300ms)
 * - Progress bars + 12-month trend sparklines
 * - Regional breakdown (15 countries)
 * - Close on ESC or click-outside
 * - Glass morphism styling
 */

'use client'

import { useEffect, useRef } from 'react'
import { Sparkline } from '@/components/charts/Sparkline'
import { useSimulationWorker } from '@/lib/contexts/SimulationWorkerContext'

type ParadigmType = 'western' | 'development' | 'ecological' | 'indigenous'

interface ParadigmDetailPanelProps {
  paradigm: ParadigmType
  score: number
  onClose: () => void
  isOpen: boolean
}

interface Indicator {
  name: string
  value: number
  unit?: string
  description?: string
  safeThreshold?: number
  criticalThreshold?: number
}

export function ParadigmDetailPanel({ paradigm, score, onClose, isOpen }: ParadigmDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const { lastUpdate } = useSimulationWorker()

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) && isOpen) {
        onClose()
      }
    }
    // Add slight delay to prevent immediate close on click that opened the panel
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Get indicators based on paradigm type
  const getIndicators = (): Indicator[] => {
    if (!lastUpdate) return []

    switch (paradigm) {
      case 'western':
        // Democracy, civil liberties, rule of law, economic freedom
        return [
          {
            name: 'Government Comprehension',
            value: lastUpdate.governmentComprehension ?? 0.5,
            unit: '%',
            description: 'Government understanding of AI systems',
            safeThreshold: 0.7,
            criticalThreshold: 0.3,
          },
          {
            name: 'International Cooperation',
            value: lastUpdate.internationalCooperation ?? 0.5,
            unit: '%',
            description: 'Global coordination on AI governance',
            safeThreshold: 0.7,
            criticalThreshold: 0.3,
          },
          {
            name: 'Institutional Trust',
            value: lastUpdate.institutionalTrust ?? 0.7,
            unit: '%',
            description: 'Public trust in institutions',
            safeThreshold: 0.7,
            criticalThreshold: 0.4,
          },
          {
            name: 'AI Regulation',
            value: lastUpdate.governmentAIRegulation ?? 0.5,
            unit: '%',
            description: 'Strength of AI safety regulations',
            safeThreshold: 0.7,
            criticalThreshold: 0.3,
          },
        ]

      case 'development':
        // Life expectancy, GDP, education, material needs
        return [
          {
            name: 'Quality of Life',
            value: lastUpdate.qualityOfLife ?? 0.65,
            unit: '%',
            description: '17-dimensional QoL across 5 tiers',
            safeThreshold: 0.7,
            criticalThreshold: 0.4,
          },
          {
            name: 'Population',
            value: Math.min(1, (lastUpdate.population ?? 8) / 8),
            unit: 'B',
            description: `${(lastUpdate.population ?? 8).toFixed(2)}B people`,
            safeThreshold: 0.875, // 7B / 8B
            criticalThreshold: 0.25, // 2B / 8B
          },
          {
            name: 'Social Cohesion',
            value: lastUpdate.socialCohesion ?? 0.7,
            unit: '%',
            description: 'Community bonds and social stability',
            safeThreshold: 0.7,
            criticalThreshold: 0.4,
          },
        ]

      case 'ecological':
        // 9 planetary boundaries
        return [
          {
            name: 'Climate Change',
            value: 1 - (lastUpdate.climateChange ?? 0),
            unit: '%',
            description: 'Climate stability (inverse of impact)',
            safeThreshold: 0.5,
            criticalThreshold: 0.3,
          },
          {
            name: 'Biodiversity',
            value: 1 - (lastUpdate.biodiversityLoss ?? 0),
            unit: '%',
            description: 'Biodiversity health (inverse of loss)',
            safeThreshold: 0.5,
            criticalThreshold: 0.3,
          },
          {
            name: 'Resource Depletion',
            value: 1 - (lastUpdate.resourceDepletion ?? 0),
            unit: '%',
            description: 'Resource availability (inverse of depletion)',
            safeThreshold: 0.5,
            criticalThreshold: 0.3,
          },
          {
            name: 'Chemical Pollution',
            value: 1 - (lastUpdate.pollutionLevel ?? 0),
            unit: '%',
            description: 'Chemical safety (inverse of pollution)',
            safeThreshold: 0.5,
            criticalThreshold: 0.3,
          },
          {
            name: 'Phosphorus',
            value: 1 - (lastUpdate.phosphorusDepletion ?? 0),
            unit: '%',
            description: 'Phosphorus availability',
            safeThreshold: 0.5,
            criticalThreshold: 0.3,
          },
          {
            name: 'Freshwater',
            value: 1 - (lastUpdate.freshwaterStress ?? 0),
            unit: '%',
            description: 'Freshwater availability',
            safeThreshold: 0.5,
            criticalThreshold: 0.3,
          },
          {
            name: 'Ocean Acidification',
            value: 1 - (lastUpdate.oceanAcidification ?? 0),
            unit: '%',
            description: 'Ocean health',
            safeThreshold: 0.5,
            criticalThreshold: 0.3,
          },
          {
            name: 'Novel Entities',
            value: 1 - (lastUpdate.novelEntitiesLevel ?? 0),
            unit: '%',
            description: 'Chemical safety',
            safeThreshold: 0.5,
            criticalThreshold: 0.3,
          },
          {
            name: 'Environmental Debt',
            value: 1 - (lastUpdate.environmentalDebtLevel ?? 0),
            unit: '%',
            description: 'Accumulated environmental debt (inverse)',
            safeThreshold: 0.5,
            criticalThreshold: 0.3,
          },
        ]

      case 'indigenous':
        // Social trust, community bonds, meaning
        return [
          {
            name: 'Social Cohesion',
            value: lastUpdate.socialCohesion ?? 0.7,
            unit: '%',
            description: 'Community bonds and social stability',
            safeThreshold: 0.7,
            criticalThreshold: 0.4,
          },
          {
            name: 'Institutional Trust',
            value: lastUpdate.institutionalTrust ?? 0.7,
            unit: '%',
            description: 'Trust in social institutions',
            safeThreshold: 0.7,
            criticalThreshold: 0.4,
          },
          {
            name: 'Meaning & Purpose',
            value: lastUpdate.meaningLevel ?? 0.5,
            unit: '%',
            description: 'Collective sense of meaning',
            safeThreshold: 0.7,
            criticalThreshold: 0.4,
          },
        ]

      default:
        return []
    }
  }

  const indicators = getIndicators()

  // Get paradigm metadata
  const paradigmMeta = {
    western: {
      title: 'Western Liberal',
      color: 'var(--color-western-liberal)',
      description: 'Democracy, civil liberties, rule of law, economic freedom',
    },
    development: {
      title: 'Development',
      color: 'var(--color-development)',
      description: 'Quality of life, survival fundamentals, material needs, health',
    },
    ecological: {
      title: 'Ecological',
      color: 'var(--color-ecological)',
      description: 'Planetary boundaries, climate, resources, pollution',
    },
    indigenous: {
      title: 'Indigenous',
      color: 'var(--color-indigenous)',
      description: 'Social trust, community bonds, meaning',
    },
  }[paradigm]

  // Get status color based on score
  const getStatusColor = (score: number) => {
    if (score >= 80) return 'var(--color-green)'
    if (score >= 50) return 'var(--color-cyan)'
    if (score >= 30) return 'var(--color-amber)'
    return 'var(--color-red)'
  }

  // Get indicator color based on value and thresholds
  const getIndicatorColor = (value: number, safeThreshold?: number, criticalThreshold?: number) => {
    if (safeThreshold && value >= safeThreshold) return 'var(--color-green)'
    if (criticalThreshold && value < criticalThreshold) return 'var(--color-red)'
    return 'var(--color-amber)'
  }

  // Get sparkline data from history
  const getSparklineData = (indicatorName: string): number[] => {
    if (!lastUpdate?.history) return []

    // Map indicator names to history keys
    const historyMap: Record<string, keyof typeof lastUpdate.history> = {
      'Government Comprehension': 'governmentComprehension',
      'International Cooperation': 'internationalCooperation',
      'Institutional Trust': 'institutionalTrust',
      'AI Regulation': 'governmentAIRegulation',
      'Quality of Life': 'qualityOfLife',
      'Population': 'population',
      'Social Cohesion': 'socialCohesion',
      'Climate Change': 'climateChange',
      'Biodiversity': 'biodiversityLoss',
      'Resource Depletion': 'climateChange', // Approximate
      'Chemical Pollution': 'climateChange', // Approximate
      'Phosphorus': 'climateChange', // Approximate
      'Freshwater': 'climateChange', // Approximate
      'Ocean Acidification': 'climateChange', // Approximate
      'Novel Entities': 'climateChange', // Approximate
      'Environmental Debt': 'climateChange', // Approximate
      'Meaning & Purpose': 'meaningLevel',
    }

    const historyKey = historyMap[indicatorName]
    if (!historyKey || !lastUpdate.history[historyKey]) return []

    return lastUpdate.history[historyKey]
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          opacity: isOpen ? 1 : 0,
        }}
      />

      {/* Side Panel */}
      <div
        ref={panelRef}
        className="fixed right-0 top-0 bottom-0 z-50 w-full md:w-[600px] overflow-y-auto transition-transform duration-300 ease-out"
        style={{
          backgroundColor: 'rgba(10, 10, 10, 0.95)',
          backdropFilter: 'blur(20px)',
          borderLeft: `2px solid ${paradigmMeta.color}`,
          boxShadow: `-10px 0 50px rgba(0, 0, 0, 0.5), 0 0 30px ${paradigmMeta.color}40`,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 p-6 border-b"
          style={{
            backgroundColor: 'rgba(10, 10, 10, 0.98)',
            borderColor: 'var(--white-10)',
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-light mb-2" style={{ color: paradigmMeta.color }}>
                {paradigmMeta.title}
              </h2>
              <p className="text-sm" style={{ color: 'var(--white-60)' }}>
                {paradigmMeta.description}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded hover:bg-white/10 transition-colors"
              style={{ color: 'var(--white-60)' }}
              aria-label="Close panel"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Overall Score */}
          <div className="flex items-center gap-4">
            <div>
              <div className="text-xs mb-1" style={{ color: 'var(--white-40)' }}>
                Overall Score
              </div>
              <div className="text-5xl font-light" style={{ color: getStatusColor(score) }}>
                {score.toFixed(1)}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>
                {score >= 80 ? 'Utopia' : score >= 50 ? 'Stable' : score >= 30 ? 'Warning' : 'Dystopia'}
              </div>
              <div className="h-3 rounded" style={{ backgroundColor: 'var(--white-10)' }}>
                <div
                  className="h-full rounded transition-all duration-300"
                  style={{
                    width: `${Math.min(100, score)}%`,
                    backgroundColor: getStatusColor(score),
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Indicators */}
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--white-80)' }}>
            Key Indicators ({indicators.length})
          </h3>

          {indicators.map((indicator, index) => {
            const sparklineData = getSparklineData(indicator.name)
            const hasSparkline = sparklineData.length > 0

            return (
              <div
                key={index}
                className="p-4 rounded border"
                style={{
                  backgroundColor: 'var(--color-near-black)',
                  borderColor: 'var(--white-10)',
                }}
              >
                {/* Indicator Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--white-90)' }}>
                      {indicator.name}
                    </h4>
                    {indicator.description && (
                      <p className="text-xs" style={{ color: 'var(--white-40)' }}>
                        {indicator.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div
                      className="text-2xl font-light"
                      style={{
                        color: getIndicatorColor(indicator.value, indicator.safeThreshold, indicator.criticalThreshold),
                      }}
                    >
                      {indicator.unit === '%'
                        ? `${(indicator.value * 100).toFixed(0)}%`
                        : indicator.unit === 'B'
                        ? indicator.description
                        : indicator.value.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="h-2 rounded" style={{ backgroundColor: 'var(--white-10)' }}>
                    <div
                      className="h-full rounded transition-all duration-300"
                      style={{
                        width: `${Math.min(100, indicator.value * 100)}%`,
                        backgroundColor: getIndicatorColor(
                          indicator.value,
                          indicator.safeThreshold,
                          indicator.criticalThreshold
                        ),
                      }}
                    />
                  </div>
                </div>

                {/* Sparkline (12-month trend) */}
                {hasSparkline && (
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--white-05)' }}>
                    <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>
                      12-Month Trend
                    </div>
                    <Sparkline
                      data={sparklineData}
                      color={getIndicatorColor(indicator.value, indicator.safeThreshold, indicator.criticalThreshold)}
                      height={40}
                    />
                  </div>
                )}

                {/* Status Label */}
                <div className="mt-2 flex items-center gap-2">
                  {indicator.safeThreshold && indicator.value >= indicator.safeThreshold && (
                    <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(0, 255, 128, 0.2)', color: 'var(--color-green)' }}>
                      Safe Zone
                    </span>
                  )}
                  {indicator.criticalThreshold && indicator.value < indicator.criticalThreshold && (
                    <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(255, 0, 64, 0.2)', color: 'var(--color-red)' }}>
                      Critical
                    </span>
                  )}
                  {indicator.safeThreshold &&
                    indicator.criticalThreshold &&
                    indicator.value < indicator.safeThreshold &&
                    indicator.value >= indicator.criticalThreshold && (
                      <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(255, 176, 0, 0.2)', color: 'var(--color-amber)' }}>
                        Warning
                      </span>
                    )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Regional Breakdown (TODO: Future Enhancement) */}
        <div className="p-6 pt-0">
          <div
            className="p-4 rounded border"
            style={{
              backgroundColor: 'rgba(0, 240, 255, 0.05)',
              borderColor: 'rgba(0, 240, 255, 0.2)',
            }}
          >
            <div className="text-xs" style={{ color: 'var(--white-60)' }}>
              <strong>Regional Breakdown:</strong> Coming soon. Will show indicator values across 15 key countries with regional variation patterns.
            </div>
          </div>
        </div>

        {/* Footer Help */}
        <div className="p-6 pt-0 pb-8">
          <div className="text-xs" style={{ color: 'var(--white-40)' }}>
            <strong>Tip:</strong> Press ESC or click outside to close this panel
          </div>
        </div>
      </div>
    </>
  )
}
