/**
 * Multi-Paradigm DUI Dashboard - Phase 2
 *
 * Visualizes 4 simultaneous paradigm perspectives.
 * Reference: /designs/02_paradigm_view.md
 */

'use client'

import { useState } from 'react'
import { Panel } from "@/components/core/Panel"
import { MetricCard } from "@/components/core/MetricCard"
import { Sparkline } from "@/components/charts/Sparkline"
import { ParadigmRadarChart } from "@/components/charts/ParadigmRadarChart"
import { OverallParadigmRadar } from "@/components/charts/OverallParadigmRadar"
import { useSimulationWorker } from "@/lib/contexts/SimulationWorkerContext"
import { ParadigmDetailPanel } from "@/components/paradigms/ParadigmDetailPanel"
import { HelpButton } from "@/components/docs/HelpButton"

type ParadigmType = 'western' | 'development' | 'ecological' | 'indigenous' | null
type ViewMode = 'list' | 'radar' | 'both'

export function ParadigmDashboard() {
  const { lastUpdate, initialized } = useSimulationWorker()
  const [selectedParadigm, setSelectedParadigm] = useState<ParadigmType>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [expandedComponents, setExpandedComponents] = useState<{
    western: boolean;
    development: boolean;
    ecological: boolean;
    indigenous: boolean;
  }>({
    western: false,
    development: false,
    ecological: false,
    indigenous: false,
  })

  const toggleComponents = (paradigm: 'western' | 'development' | 'ecological' | 'indigenous') => {
    setExpandedComponents(prev => ({
      ...prev,
      [paradigm]: !prev[paradigm],
    }))
  }

  if (!initialized) {
    return (
      <div className="p-8">
        <Panel title="Not Initialized">
          Click "Configure & Start" to initialize the simulation
        </Panel>
      </div>
    )
  }

  // Check if we have valid data
  const hasValidData = lastUpdate &&
    typeof lastUpdate.westernLiberalIndex === 'number' && !isNaN(lastUpdate.westernLiberalIndex) &&
    typeof lastUpdate.developmentIndex === 'number' && !isNaN(lastUpdate.developmentIndex) &&
    typeof lastUpdate.ecologicalIndex === 'number' && !isNaN(lastUpdate.ecologicalIndex) &&
    typeof lastUpdate.indigenousIndex === 'number' && !isNaN(lastUpdate.indigenousIndex)

  if (!hasValidData) {
    return (
      <div className="p-8">
        <Panel title="Loading Paradigm Data">
          <p style={{ color: 'var(--white-40)' }}>
            Waiting for complete paradigm indices from simulation...
          </p>
        </Panel>
      </div>
    )
  }

  // Get scores from StateDelta - data is validated above
  // Non-null assertions are safe here because we validated these exist in hasValidData check above
  const scores = [
    lastUpdate.westernLiberalIndex!,
    lastUpdate.developmentIndex!,
    lastUpdate.ecologicalIndex!,
    lastUpdate.indigenousIndex!
  ]

  const avgScore = scores.reduce((a: number, b) => a + (b ?? 0), 0) / scores.length
  const divergence = Math.sqrt(scores.reduce((sum: number, s) => sum + Math.pow((s ?? 0) - avgScore, 2), 0) / scores.length)

  // Detect contested outcome (simultaneous utopia + dystopia)
  const utopiaCount = scores.filter(s => (s ?? 0) >= 80).length
  const dystopiaCount = scores.filter(s => (s ?? 0) < 30).length
  const isContested = utopiaCount > 0 && dystopiaCount > 0

  // Get 12-month sparkline history from state
  const getSparkline = (paradigm: 'western' | 'development' | 'ecological' | 'indigenous'): number[] => {
    if (!lastUpdate?.history) return []

    const historyMap = {
      western: lastUpdate.history.westernLiberalIndex,
      development: lastUpdate.history.developmentIndex,
      ecological: lastUpdate.history.ecologicalIndex,
      indigenous: lastUpdate.history.indigenousIndex,
    }

    return historyMap[paradigm] || []
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl mb-2">Multi-Paradigm DUI</h1>
        <p style={{ color: 'var(--white-40)' }}>
          Four Simultaneous Perspectives on Human Flourishing
        </p>
      </div>

      {/* Divergence Alert */}
      {isContested && (
        <Panel title="⚠️ Contested Outcome Detected" glow="amber">
          <p>
            Simultaneous <span style={{ color: 'var(--color-green)' }}>utopia</span> and{' '}
            <span style={{ color: 'var(--color-red)' }}>dystopia</span> across paradigms.
            What counts as success depends fundamentally on values.
          </p>
        </Panel>
      )}

      {/* Paradigm Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Average Score"
          value={avgScore.toFixed(1)}
          trend={avgScore > 60 ? 'up' : 'down'}
        />
        <MetricCard
          label="Divergence"
          value={divergence.toFixed(1)}
          status={divergence > 30 ? 'warning' : 'normal'}
        />
        <MetricCard
          label="Paradigm Conflicts"
          value={isContested ? 'Yes' : 'No'}
          status={isContested ? 'critical' : 'normal'}
        />
      </div>

      {/* Overall Paradigm Radar - High-Level Comparison */}
      <Panel title="Paradigm Balance Overview">
        <div className="flex flex-col items-center">
          <OverallParadigmRadar data={lastUpdate} size={340} showPrevious={false} />
          <p className="text-xs mt-4" style={{ color: 'var(--white-40)', textAlign: 'center', maxWidth: '400px' }}>
            Radial view shows all four paradigm perspectives simultaneously.
            Balanced futures form symmetrical shapes; contested outcomes show stark asymmetries.
          </p>
        </div>
      </Panel>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--white-40)' }}>
          Component View:
        </span>
        <div className="flex gap-1" style={{ borderRadius: '2px', border: '1px solid var(--white-20)', overflow: 'hidden' }}>
          {(['list', 'radar', 'both'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className="px-3 py-1.5 text-xs uppercase tracking-wider transition-all duration-200"
              style={{
                backgroundColor: viewMode === mode ? 'var(--color-cyan)' : 'transparent',
                color: viewMode === mode ? 'var(--color-black)' : 'var(--white-60)',
                borderRight: mode !== 'both' ? '1px solid var(--white-20)' : 'none',
                fontWeight: viewMode === mode ? '500' : '400',
              }}
              aria-label={`Switch to ${mode} view`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Paradigm Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Western Liberal */}
        <Panel
          title="Western Liberal"
          glow={(scores[0] ?? 50) < 30 ? 'red' : 'none'}
        >
          <div>
            <button
              onClick={() => setSelectedParadigm('western')}
              className="w-full text-left transition-opacity hover:opacity-80 cursor-pointer"
              aria-label="View Western Liberal details"
            >
              <div className="mb-4">
                <div className="text-4xl font-light mb-2" style={{ color: 'var(--color-western-liberal)' }}>
                  {(scores[0] ?? 0).toFixed(1)}
                </div>
                <Sparkline data={getSparkline('western')} color="var(--color-western-liberal)" />
              </div>
              <div className="text-sm" style={{ color: 'var(--white-60)' }}>
                Democracy, civil liberties, rule of law, economic freedom
              </div>
              <div className="text-xs mt-2" style={{ color: 'var(--color-cyan)' }}>
                Click for detailed breakdown →
              </div>
            </button>

            {/* Component Breakdown - Radar or List View */}
            {lastUpdate?.westernLiberalComponents && (
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--white-10)' }}>
                {/* Radar View */}
                {(viewMode === 'radar' || viewMode === 'both') && (
                  <div className="flex justify-center mb-4">
                    <ParadigmRadarChart
                      paradigm="western"
                      data={lastUpdate}
                      size={220}
                      showLabels={true}
                    />
                  </div>
                )}

                {/* List View */}
                {(viewMode === 'list' || viewMode === 'both') && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleComponents('western')
                      }}
                      className="w-full flex items-center justify-between text-xs transition-opacity hover:opacity-80"
                      style={{ color: 'var(--white-60)' }}
                      aria-label="Toggle component breakdown"
                    >
                      <span>Component Breakdown</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ transform: expandedComponents.western ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}
                      >
                        <path d="M4 6l4 4 4-4" />
                      </svg>
                    </button>

                    {expandedComponents.western && (
                      <div className="mt-3 space-y-2">
                        {[
                          { label: 'Electoral Democracy', value: lastUpdate.westernLiberalComponents.electoralDemocracy },
                          { label: 'Civil Liberties', value: lastUpdate.westernLiberalComponents.civilLiberties },
                          { label: 'Rule of Law', value: lastUpdate.westernLiberalComponents.ruleOfLaw },
                          { label: 'Economic Freedom', value: lastUpdate.westernLiberalComponents.economicFreedom },
                          { label: 'Privacy', value: lastUpdate.westernLiberalComponents.privacyFreedom },
                        ].map((component) => (
                          <div key={component.label} className="flex items-center justify-between text-xs">
                            <span style={{ color: 'var(--white-60)' }}>{component.label}</span>
                            <div className="flex items-center gap-2 flex-1 ml-4">
                              <div className="flex-1 h-1.5 rounded" style={{ backgroundColor: 'var(--white-10)' }}>
                                <div
                                  className="h-full rounded"
                                  style={{
                                    width: `${component.value}%`,
                                    backgroundColor: component.value >= 70 ? 'var(--color-green)' : component.value >= 40 ? 'var(--color-amber)' : 'var(--color-red)',
                                  }}
                                />
                              </div>
                              <span
                                className="text-xs font-mono w-10 text-right"
                                style={{
                                  color: component.value >= 70 ? 'var(--color-green)' : component.value >= 40 ? 'var(--color-amber)' : 'var(--color-red)',
                                }}
                              >
                                {component.value.toFixed(0)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </Panel>

        {/* Development */}
        <Panel
          title="Development"
          glow={(scores[1] ?? 0) >= 80 ? 'cyan' : 'none'}
        >
          <div>
            <button
              onClick={() => setSelectedParadigm('development')}
              className="w-full text-left transition-opacity hover:opacity-80 cursor-pointer"
              aria-label="View Development details"
            >
              <div className="mb-4">
                <div className="text-4xl font-light mb-2" style={{ color: 'var(--color-development)' }}>
                  {(scores[1] ?? 0).toFixed(1)}
                </div>
                <Sparkline data={getSparkline('development')} color="var(--color-development)" />
              </div>
              <div className="text-sm" style={{ color: 'var(--white-60)' }}>
                Quality of life, survival fundamentals, material needs, health
              </div>
              <div className="text-xs mt-2" style={{ color: 'var(--color-cyan)' }}>
                Click for detailed breakdown →
              </div>
            </button>

            {/* Component Breakdown - Radar or List View */}
            {lastUpdate?.developmentComponents && (
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--white-10)' }}>
                {/* Radar View */}
                {(viewMode === 'radar' || viewMode === 'both') && (
                  <div className="flex justify-center mb-4">
                    <ParadigmRadarChart
                      paradigm="development"
                      data={lastUpdate}
                      size={220}
                      showLabels={true}
                    />
                  </div>
                )}

                {/* List View */}
                {(viewMode === 'list' || viewMode === 'both') && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleComponents('development')
                      }}
                      className="w-full flex items-center justify-between text-xs transition-opacity hover:opacity-80"
                      style={{ color: 'var(--white-60)' }}
                      aria-label="Toggle component breakdown"
                    >
                      <span>Component Breakdown</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ transform: expandedComponents.development ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}
                      >
                        <path d="M4 6l4 4 4-4" />
                      </svg>
                    </button>

                    {expandedComponents.development && (
                      <div className="mt-3 space-y-2">
                        {[
                          { label: 'GDP per Capita', value: lastUpdate.developmentComponents.gdpPerCapita },
                          { label: 'Infrastructure Access', value: lastUpdate.developmentComponents.infrastructureAccess },
                          { label: 'Technology Adoption', value: lastUpdate.developmentComponents.technologyAdoption },
                          { label: 'Urbanization', value: lastUpdate.developmentComponents.urbanization },
                          { label: 'Education Quality', value: lastUpdate.developmentComponents.educationQuality },
                        ].map((component) => (
                          <div key={component.label} className="flex items-center justify-between text-xs">
                            <span style={{ color: 'var(--white-60)' }}>{component.label}</span>
                            <div className="flex items-center gap-2 flex-1 ml-4">
                              <div className="flex-1 h-1.5 rounded" style={{ backgroundColor: 'var(--white-10)' }}>
                                <div
                                  className="h-full rounded"
                                  style={{
                                    width: `${component.value}%`,
                                    backgroundColor: component.value >= 70 ? 'var(--color-green)' : component.value >= 40 ? 'var(--color-amber)' : 'var(--color-red)',
                                  }}
                                />
                              </div>
                              <span
                                className="text-xs font-mono w-10 text-right"
                                style={{
                                  color: component.value >= 70 ? 'var(--color-green)' : component.value >= 40 ? 'var(--color-amber)' : 'var(--color-red)',
                                }}
                              >
                                {component.value.toFixed(0)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </Panel>

        {/* Ecological */}
        <Panel
          title="Ecological"
          glow={(scores[2] ?? 50) < 20 ? 'red' : 'none'}
        >
          <div>
            <button
              onClick={() => setSelectedParadigm('ecological')}
              className="w-full text-left transition-opacity hover:opacity-80 cursor-pointer"
              aria-label="View Ecological details"
            >
              <div className="mb-4">
                <div className="text-4xl font-light mb-2" style={{
                  color: (scores[2] ?? 50) < 20 ? 'var(--color-red)' : 'var(--color-ecological)'
                }}>
                  {(scores[2] ?? 0).toFixed(1)}
                </div>
                <Sparkline data={getSparkline('ecological')} color="var(--color-ecological)" />
              </div>
              <div className="text-sm" style={{ color: 'var(--white-60)' }}>
                Climate: {typeof lastUpdate.climateChange === 'number' && !isNaN(lastUpdate.climateChange)
                  ? `${((1 - lastUpdate.climateChange) * 100).toFixed(0)}%`
                  : 'N/A'},
                Biodiversity: {typeof lastUpdate.biodiversityLoss === 'number' && !isNaN(lastUpdate.biodiversityLoss)
                  ? `${((1 - lastUpdate.biodiversityLoss) * 100).toFixed(0)}%`
                  : 'N/A'}
              </div>
              <div className="text-xs mt-2" style={{ color: 'var(--color-cyan)' }}>
                Click for detailed breakdown →
              </div>
            </button>

            {/* Component Breakdown - Radar or List View */}
            {lastUpdate?.ecologicalComponents && (
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--white-10)' }}>
                {/* Radar View */}
                {(viewMode === 'radar' || viewMode === 'both') && (
                  <div className="flex justify-center mb-4">
                    <ParadigmRadarChart
                      paradigm="ecological"
                      data={lastUpdate}
                      size={220}
                      showLabels={true}
                    />
                  </div>
                )}

                {/* List View */}
                {(viewMode === 'list' || viewMode === 'both') && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleComponents('ecological')
                      }}
                      className="w-full flex items-center justify-between text-xs transition-opacity hover:opacity-80"
                      style={{ color: 'var(--white-60)' }}
                      aria-label="Toggle component breakdown"
                    >
                      <span>Planetary Boundaries</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ transform: expandedComponents.ecological ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}
                      >
                        <path d="M4 6l4 4 4-4" />
                      </svg>
                    </button>

                    {expandedComponents.ecological && (
                      <div className="mt-3 space-y-2">
                        {[
                          { label: 'Climate Stability', value: lastUpdate.ecologicalComponents.climate },
                          { label: 'Biodiversity', value: lastUpdate.ecologicalComponents.biodiversity },
                          { label: 'Nitrogen Cycle', value: lastUpdate.ecologicalComponents.nitrogen },
                          { label: 'Phosphorus', value: lastUpdate.ecologicalComponents.phosphorus },
                          { label: 'Freshwater', value: lastUpdate.ecologicalComponents.freshwater },
                          { label: 'Land Use', value: lastUpdate.ecologicalComponents.landUse },
                          { label: 'Ocean Health', value: lastUpdate.ecologicalComponents.oceanAcid },
                        ].map((component) => (
                          <div key={component.label} className="flex items-center justify-between text-xs">
                            <span style={{ color: 'var(--white-60)' }}>{component.label}</span>
                            <div className="flex items-center gap-2 flex-1 ml-4">
                              <div className="flex-1 h-1.5 rounded" style={{ backgroundColor: 'var(--white-10)' }}>
                                <div
                                  className="h-full rounded"
                                  style={{
                                    width: `${component.value}%`,
                                    backgroundColor: component.value >= 70 ? 'var(--color-green)' : component.value >= 40 ? 'var(--color-amber)' : 'var(--color-red)',
                                  }}
                                />
                              </div>
                              <span
                                className="text-xs font-mono w-10 text-right"
                                style={{
                                  color: component.value >= 70 ? 'var(--color-green)' : component.value >= 40 ? 'var(--color-amber)' : 'var(--color-red)',
                                }}
                              >
                                {component.value.toFixed(0)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </Panel>

        {/* Indigenous */}
        <Panel title="Indigenous">
          <div>
            <button
              onClick={() => setSelectedParadigm('indigenous')}
              className="w-full text-left transition-opacity hover:opacity-80 cursor-pointer"
              aria-label="View Indigenous details"
            >
              <div className="mb-4">
                <div className="text-4xl font-light mb-2" style={{ color: 'var(--color-indigenous)' }}>
                  {(scores[3] ?? 0).toFixed(1)}
                </div>
                <Sparkline data={getSparkline('indigenous')} color="var(--color-indigenous)" />
              </div>
              <div className="text-sm" style={{ color: 'var(--white-60)' }}>
                Social cohesion: {typeof lastUpdate.socialCohesion === 'number' && !isNaN(lastUpdate.socialCohesion)
                  ? `${(lastUpdate.socialCohesion * 100).toFixed(0)}%`
                  : 'N/A'},
                Meaning: {typeof lastUpdate.meaningLevel === 'number' && !isNaN(lastUpdate.meaningLevel)
                  ? `${(lastUpdate.meaningLevel * 100).toFixed(0)}%`
                  : 'N/A'}
              </div>
              <div className="text-xs mt-2" style={{ color: 'var(--color-cyan)' }}>
                Click for detailed breakdown →
              </div>
            </button>

            {/* Component Breakdown - Radar or List View */}
            {lastUpdate?.indigenousComponents && (
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--white-10)' }}>
                {/* Radar View */}
                {(viewMode === 'radar' || viewMode === 'both') && (
                  <div className="flex justify-center mb-4">
                    <ParadigmRadarChart
                      paradigm="indigenous"
                      data={lastUpdate}
                      size={220}
                      showLabels={true}
                    />
                  </div>
                )}

                {/* List View */}
                {(viewMode === 'list' || viewMode === 'both') && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleComponents('indigenous')
                      }}
                      className="w-full flex items-center justify-between text-xs transition-opacity hover:opacity-80"
                      style={{ color: 'var(--white-60)' }}
                      aria-label="Toggle component breakdown"
                    >
                      <span>Component Breakdown</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ transform: expandedComponents.indigenous ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}
                      >
                        <path d="M4 6l4 4 4-4" />
                      </svg>
                    </button>

                    {expandedComponents.indigenous && (
                      <div className="mt-3 space-y-2">
                        {[
                          { label: 'Local Autonomy', value: lastUpdate.indigenousComponents.localAutonomy },
                          { label: 'Cultural Vitality', value: lastUpdate.indigenousComponents.culturalVitality },
                          { label: 'Land Stewardship', value: lastUpdate.indigenousComponents.landStewardship },
                          { label: 'Collective Wellbeing', value: lastUpdate.indigenousComponents.collectiveWellbeing },
                          { label: 'Spiritual Connection', value: lastUpdate.indigenousComponents.spiritualConnection },
                        ].map((component) => (
                          <div key={component.label} className="flex items-center justify-between text-xs">
                            <span style={{ color: 'var(--white-60)' }}>{component.label}</span>
                            <div className="flex items-center gap-2 flex-1 ml-4">
                              <div className="flex-1 h-1.5 rounded" style={{ backgroundColor: 'var(--white-10)' }}>
                                <div
                                  className="h-full rounded"
                                  style={{
                                    width: `${component.value}%`,
                                    backgroundColor: component.value >= 70 ? 'var(--color-green)' : component.value >= 40 ? 'var(--color-amber)' : 'var(--color-red)',
                                  }}
                                />
                              </div>
                              <span
                                className="text-xs font-mono w-10 text-right"
                                style={{
                                  color: component.value >= 70 ? 'var(--color-green)' : component.value >= 40 ? 'var(--color-amber)' : 'var(--color-red)',
                                }}
                              >
                                {component.value.toFixed(0)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </Panel>
      </div>

      {/* Paradigm Detail Panel */}
      {selectedParadigm && (
        <ParadigmDetailPanel
          paradigm={selectedParadigm}
          score={scores[['western', 'development', 'ecological', 'indigenous'].indexOf(selectedParadigm)] ?? 0}
          isOpen={selectedParadigm !== null}
          onClose={() => setSelectedParadigm(null)}
        />
      )}

      {/* Pattern Detection */}
      <Panel title="Historical Patterns">
        <div className="space-y-3">
          {/* Singapore Pattern */}
          {(scores[1] ?? 0) >= 80 && (scores[0] ?? 0) < 50 && (
            <div className="p-3" style={{ backgroundColor: 'var(--color-near-black)', borderLeft: '3px solid var(--color-development)' }}>
              <div className="font-semibold mb-1">Singapore Pattern Detected</div>
              <div className="text-sm" style={{ color: 'var(--white-60)' }}>
                Development utopia + Western hybrid (high GDP, limited democracy)
              </div>
            </div>
          )}

          {/* Norway Pattern */}
          {(scores[1] ?? 0) >= 80 && (scores[0] ?? 0) >= 70 && (scores[2] ?? 0) < 30 && (
            <div className="p-3" style={{ backgroundColor: 'var(--color-near-black)', borderLeft: '3px solid var(--color-development)' }}>
              <div className="font-semibold mb-1">Norway Pattern Detected</div>
              <div className="text-sm" style={{ color: 'var(--white-60)' }}>
                Western/Development utopias + Ecological dystopia (high living standards, high emissions)
              </div>
            </div>
          )}

          {!isContested && (
            <div className="text-sm" style={{ color: 'var(--white-40)' }}>
              No distinctive historical patterns detected
            </div>
          )}
        </div>
      </Panel>

      {/* Contextual Help */}
      <HelpButton
        content={{
          title: "Multi-Paradigm DUI",
          description: "This dashboard shows four simultaneous perspectives on human flourishing. Each paradigm represents a different cultural/philosophical framework for measuring progress.",
          metrics: [
            {
              name: "Western Liberal",
              meaning: "Democracy, civil liberties, rule of law, economic freedom, privacy",
              interpretation: "High scores (>80): Strong institutions, human rights. Low scores (<30): Authoritarianism, repression."
            },
            {
              name: "Development",
              meaning: "Quality of Life, population sustainability, social cohesion",
              interpretation: "High scores (>80): Thriving population, strong communities. Low scores (<30): Crisis, social collapse."
            },
            {
              name: "Ecological",
              meaning: "All 9 planetary boundaries (climate, biodiversity, ocean health, etc.)",
              interpretation: "High scores (>80): Environmental sustainability. Low scores (<30): Ecological crisis, tipping points crossed."
            },
            {
              name: "Indigenous",
              meaning: "Social cohesion, institutional trust, meaning & purpose",
              interpretation: "High scores (>80): Strong community bonds, shared meaning. Low scores (<30): Anomie, distrust, disconnection."
            }
          ],
          docsLink: "/docs/dashboard-guide#paradigms"
        }}
        position="top-right"
      />
    </div>
  )
}
