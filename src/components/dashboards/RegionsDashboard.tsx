/**
 * Population & Regions Dashboard - Phase 8
 *
 * Regional QoL, demographics, inequality metrics.
 * Reference: /designs/10_regions.md
 */

'use client'

import { Panel } from "@/components/core/Panel"
import { MetricCard } from "@/components/core/MetricCard"
import { useSimulation } from "@/lib/hooks/useSimulation"
import { useEffect, useMemo } from "react"

export function RegionsDashboard() {
  const { currentState, loadCurrent } = useSimulation()

  useEffect(() => {
    loadCurrent()
  }, [])

  // Global population stats
  const globalStats = useMemo(() => {
    if (!currentState) return null

    const population = currentState.globalMetrics?.population || 8_000_000_000
    const qol = currentState.globalMetrics?.qualityOfLife || 0
    const survivalTier = currentState.globalMetrics?.survival?.tier || 0

    return {
      population,
      qol,
      survivalTier,
      formatted: {
        population: (population / 1_000_000_000).toFixed(2) + 'B',
        qol: qol.toFixed(2),
        survivalTier: survivalTier.toFixed(1),
      }
    }
  }, [currentState])

  // Regional data (placeholder - would come from regionalPopulations)
  const regions = useMemo(() => {
    return [
      {
        id: 'north_america',
        name: 'North America',
        population: 580_000_000,
        qol: 0.78,
        survivalTier: 4.2,
        inequality: 0.42,
        status: 'stable',
      },
      {
        id: 'europe',
        name: 'Europe',
        population: 740_000_000,
        qol: 0.82,
        survivalTier: 4.5,
        inequality: 0.38,
        status: 'stable',
      },
      {
        id: 'asia',
        name: 'Asia',
        population: 4_700_000_000,
        qol: 0.65,
        survivalTier: 3.8,
        inequality: 0.55,
        status: 'developing',
      },
      {
        id: 'africa',
        name: 'Africa',
        population: 1_400_000_000,
        qol: 0.52,
        survivalTier: 3.2,
        inequality: 0.62,
        status: 'challenged',
      },
      {
        id: 'latin_america',
        name: 'Latin America',
        population: 670_000_000,
        qol: 0.68,
        survivalTier: 3.9,
        inequality: 0.51,
        status: 'stable',
      },
      {
        id: 'oceania',
        name: 'Oceania',
        population: 45_000_000,
        qol: 0.80,
        survivalTier: 4.3,
        inequality: 0.40,
        status: 'stable',
      },
    ]
  }, [])

  // Inequality analysis
  const inequalityStats = useMemo(() => {
    const qolValues = regions.map(r => r.qol)
    const avgQoL = qolValues.reduce((sum, q) => sum + q, 0) / qolValues.length
    const variance = qolValues.reduce((sum, q) => sum + Math.pow(q - avgQoL, 2), 0) / qolValues.length
    const stdDev = Math.sqrt(variance)

    const highest = Math.max(...qolValues)
    const lowest = Math.min(...qolValues)
    const spread = highest - lowest

    // Detect "Elysium" pattern: elite utopia + masses dystopia
    const eliteRegions = regions.filter(r => r.qol >= 0.75).length
    const strugglingRegions = regions.filter(r => r.qol < 0.55).length
    const elysiumPattern = eliteRegions >= 2 && strugglingRegions >= 2

    return {
      avgQoL,
      stdDev,
      spread,
      highest,
      lowest,
      elysiumPattern,
    }
  }, [regions])

  if (!currentState) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl mb-2">Population & Regions</h1>
        <p style={{ color: 'var(--white-40)' }}>
          Regional QoL, Demographics, and Inequality Metrics
        </p>
      </div>

      {/* Global Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Global Population"
          value={globalStats?.formatted.population || 'N/A'}
          status="normal"
        />
        <MetricCard
          label="Average QoL"
          value={inequalityStats.avgQoL.toFixed(2)}
          status={inequalityStats.avgQoL > 0.7 ? 'normal' : inequalityStats.avgQoL > 0.5 ? 'warning' : 'critical'}
        />
        <MetricCard
          label="QoL Spread"
          value={inequalityStats.spread.toFixed(2)}
          status={inequalityStats.spread > 0.3 ? 'warning' : 'normal'}
        />
        <MetricCard
          label="Average Survival Tier"
          value={globalStats?.formatted.survivalTier || 'N/A'}
          status={globalStats && globalStats.survivalTier > 3.5 ? 'normal' : 'warning'}
        />
      </div>

      {/* Elysium Pattern Alert */}
      {inequalityStats.elysiumPattern && (
        <Panel title="⚠️ 'Elysium' Pattern Detected" glow="amber">
          <p className="text-sm" style={{ color: 'var(--white-60)' }}>
            Extreme regional inequality: elite regions experiencing utopia ({inequalityStats.highest.toFixed(2)} QoL)
            while other regions struggle ({inequalityStats.lowest.toFixed(2)} QoL).
            This pattern resembles the "Elysium" scenario where technological abundance is not equally distributed.
          </p>
        </Panel>
      )}

      {/* Regional Comparison */}
      <Panel title="Regional Quality of Life">
        <div className="space-y-3">
          {regions
            .sort((a, b) => b.qol - a.qol)
            .map((region) => (
              <div
                key={region.id}
                className="p-4 rounded"
                style={{
                  backgroundColor: 'var(--color-near-black)',
                  border: `1px solid ${region.qol < 0.55 ? 'var(--color-red)' : 'var(--white-10)'}`,
                  boxShadow: region.qol < 0.55 ? '0 0 10px rgba(255, 0, 64, 0.2)' : 'none'
                }}
              >
                {/* Region Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold mb-1">{region.name}</h3>
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--white-40)' }}>
                      <span>{(region.population / 1_000_000_000).toFixed(2)}B people</span>
                      <span>•</span>
                      <span className="capitalize">{region.status}</span>
                    </div>
                  </div>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: region.qol >= 0.75 ? 'var(--color-green)' :
                                     region.qol >= 0.60 ? 'var(--color-cyan)' :
                                     region.qol >= 0.50 ? 'var(--color-amber)' :
                                     'var(--color-red)'
                    }}
                  />
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div>
                    <div className="text-xs mb-1" style={{ color: 'var(--white-40)' }}>Quality of Life</div>
                    <div className="text-lg font-semibold" style={{
                      color: region.qol >= 0.75 ? 'var(--color-green)' :
                             region.qol >= 0.60 ? 'var(--color-cyan)' :
                             region.qol >= 0.50 ? 'var(--color-amber)' :
                             'var(--color-red)'
                    }}>
                      {region.qol.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs mb-1" style={{ color: 'var(--white-40)' }}>Survival Tier</div>
                    <div className="text-lg font-semibold">{region.survivalTier.toFixed(1)}</div>
                  </div>
                  <div>
                    <div className="text-xs mb-1" style={{ color: 'var(--white-40)' }}>Inequality (Gini)</div>
                    <div className="text-lg font-semibold" style={{
                      color: region.inequality > 0.55 ? 'var(--color-red)' :
                             region.inequality > 0.45 ? 'var(--color-amber)' :
                             'var(--white-80)'
                    }}>
                      {region.inequality.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs mb-1" style={{ color: 'var(--white-40)' }}>Status</div>
                    <div className="text-sm font-semibold capitalize">{region.status}</div>
                  </div>
                </div>

                {/* QoL Bar */}
                <div>
                  <div className="h-2 rounded" style={{ backgroundColor: 'var(--white-10)' }}>
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${region.qol * 100}%`,
                        backgroundColor: region.qol >= 0.75 ? 'var(--color-green)' :
                                       region.qol >= 0.60 ? 'var(--color-cyan)' :
                                       region.qol >= 0.50 ? 'var(--color-amber)' :
                                       'var(--color-red)'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </Panel>

      {/* Inequality Metrics */}
      <Panel title="Global Inequality Analysis">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded" style={{ backgroundColor: 'var(--color-near-black)', border: '1px solid var(--white-10)' }}>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>QoL Standard Deviation</div>
            <div className="text-3xl font-light mb-2">
              {inequalityStats.stdDev.toFixed(3)}
            </div>
            <p className="text-xs" style={{ color: 'var(--white-40)' }}>
              Lower is better (less variation)
            </p>
          </div>

          <div className="p-4 rounded" style={{ backgroundColor: 'var(--color-near-black)', border: '1px solid var(--white-10)' }}>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>QoL Range</div>
            <div className="text-3xl font-light mb-2" style={{
              color: inequalityStats.spread > 0.3 ? 'var(--color-amber)' : 'var(--white-80)'
            }}>
              {inequalityStats.spread.toFixed(2)}
            </div>
            <p className="text-xs" style={{ color: 'var(--white-40)' }}>
              {inequalityStats.lowest.toFixed(2)} to {inequalityStats.highest.toFixed(2)}
            </p>
          </div>

          <div className="p-4 rounded" style={{ backgroundColor: 'var(--color-near-black)', border: '1px solid var(--white-10)' }}>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Elysium Risk</div>
            <div className="text-3xl font-light mb-2" style={{
              color: inequalityStats.elysiumPattern ? 'var(--color-red)' : 'var(--color-green)'
            }}>
              {inequalityStats.elysiumPattern ? 'High' : 'Low'}
            </div>
            <p className="text-xs" style={{ color: 'var(--white-40)' }}>
              Elite utopia + mass struggle
            </p>
          </div>
        </div>
      </Panel>

      {/* Population Distribution */}
      <Panel title="Population Distribution by Region">
        <div className="space-y-2">
          {regions
            .sort((a, b) => b.population - a.population)
            .map((region) => {
              const percentage = (region.population / (globalStats?.population || 8_000_000_000)) * 100

              return (
                <div key={region.id} className="flex items-center gap-3">
                  <div className="w-32 text-sm" style={{ color: 'var(--white-60)' }}>
                    {region.name}
                  </div>
                  <div className="flex-1">
                    <div className="h-6 rounded" style={{ backgroundColor: 'var(--white-10)' }}>
                      <div
                        className="h-full rounded flex items-center justify-end px-2"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: 'var(--color-cyan)'
                        }}
                      >
                        <span className="text-xs font-semibold">{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-24 text-sm text-right" style={{ color: 'var(--white-60)' }}>
                    {(region.population / 1_000_000_000).toFixed(2)}B
                  </div>
                </div>
              )
            })}
        </div>
      </Panel>

      {/* Survival Tier Explanation */}
      <Panel title="Survival Tier Framework">
        <div className="space-y-2 text-sm" style={{ color: 'var(--white-60)' }}>
          <div><strong>Tier 1-2:</strong> Survival fundamentals (food, water, shelter, habitability)</div>
          <div><strong>Tier 3:</strong> Material needs (clothing, household goods, connectivity)</div>
          <div><strong>Tier 4:</strong> Psychological and social needs (meaning, community, belonging)</div>
          <div><strong>Tier 5:</strong> Self-actualization and flourishing (purpose, creativity, growth)</div>
          <p className="mt-3">
            Distribution tracking detects "Elysium" scenarios where elite regions achieve Tier 5 flourishing
            while other regions struggle at Tier 1-2 survival.
          </p>
        </div>
      </Panel>
    </div>
  )
}
