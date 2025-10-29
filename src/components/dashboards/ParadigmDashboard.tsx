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
import { useSimulationWorker } from "@/lib/contexts/SimulationWorkerContext"
import { ParadigmDetailPanel } from "@/components/paradigms/ParadigmDetailPanel"

type ParadigmType = 'western' | 'development' | 'ecological' | 'indigenous' | null

export function ParadigmDashboard() {
  const { lastUpdate, initialized } = useSimulationWorker()
  const [selectedParadigm, setSelectedParadigm] = useState<ParadigmType>(null)

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
  const scores = [
    lastUpdate.westernLiberalIndex,
    lastUpdate.developmentIndex,
    lastUpdate.ecologicalIndex,
    lastUpdate.indigenousIndex
  ]

  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
  const divergence = Math.sqrt(scores.reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / scores.length)

  // Detect contested outcome (simultaneous utopia + dystopia)
  const utopiaCount = scores.filter(s => s >= 80).length
  const dystopiaCount = scores.filter(s => s < 30).length
  const isContested = utopiaCount > 0 && dystopiaCount > 0

  // Note: Sparklines removed - trajectory not available in StateDelta
  // Would need to implement history tracking in Web Worker if needed
  const getSparkline = (_paradigm: 'western' | 'development' | 'ecological' | 'indigenous') => {
    return [] // Placeholder - trajectory tracking not yet implemented
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

      {/* 4 Paradigm Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Western Liberal */}
        <Panel
          title="Western Liberal"
          glow={scores[0] < 30 ? 'red' : 'none'}
        >
          <button
            onClick={() => setSelectedParadigm('western')}
            className="w-full text-left transition-opacity hover:opacity-80 cursor-pointer"
            aria-label="View Western Liberal details"
          >
            <div className="mb-4">
              <div className="text-4xl font-light mb-2" style={{ color: 'var(--color-western-liberal)' }}>
                {scores[0].toFixed(1)}
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
        </Panel>

        {/* Development */}
        <Panel
          title="Development"
          glow={scores[1] >= 80 ? 'cyan' : 'none'}
        >
          <button
            onClick={() => setSelectedParadigm('development')}
            className="w-full text-left transition-opacity hover:opacity-80 cursor-pointer"
            aria-label="View Development details"
          >
            <div className="mb-4">
              <div className="text-4xl font-light mb-2" style={{ color: 'var(--color-development)' }}>
                {scores[1].toFixed(1)}
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
        </Panel>

        {/* Ecological */}
        <Panel
          title="Ecological"
          glow={scores[2] < 20 ? 'red' : 'none'}
        >
          <button
            onClick={() => setSelectedParadigm('ecological')}
            className="w-full text-left transition-opacity hover:opacity-80 cursor-pointer"
            aria-label="View Ecological details"
          >
            <div className="mb-4">
              <div className="text-4xl font-light mb-2" style={{
                color: scores[2] < 20 ? 'var(--color-red)' : 'var(--color-ecological)'
              }}>
                {scores[2].toFixed(1)}
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
        </Panel>

        {/* Indigenous */}
        <Panel title="Indigenous">
          <button
            onClick={() => setSelectedParadigm('indigenous')}
            className="w-full text-left transition-opacity hover:opacity-80 cursor-pointer"
            aria-label="View Indigenous details"
          >
            <div className="mb-4">
              <div className="text-4xl font-light mb-2" style={{ color: 'var(--color-indigenous)' }}>
                {scores[3].toFixed(1)}
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
        </Panel>
      </div>

      {/* Paradigm Detail Panel */}
      {selectedParadigm && (
        <ParadigmDetailPanel
          paradigm={selectedParadigm}
          score={scores[['western', 'development', 'ecological', 'indigenous'].indexOf(selectedParadigm)]}
          isOpen={selectedParadigm !== null}
          onClose={() => setSelectedParadigm(null)}
        />
      )}

      {/* Pattern Detection */}
      <Panel title="Historical Patterns">
        <div className="space-y-3">
          {/* Singapore Pattern */}
          {scores[1] >= 80 && scores[0] < 50 && (
            <div className="p-3" style={{ backgroundColor: 'var(--color-near-black)', borderLeft: '3px solid var(--color-development)' }}>
              <div className="font-semibold mb-1">Singapore Pattern Detected</div>
              <div className="text-sm" style={{ color: 'var(--white-60)' }}>
                Development utopia + Western hybrid (high GDP, limited democracy)
              </div>
            </div>
          )}

          {/* Norway Pattern */}
          {scores[1] >= 80 && scores[0] >= 70 && scores[2] < 30 && (
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
    </div>
  )
}
