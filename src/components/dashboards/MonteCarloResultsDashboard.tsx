/**
 * Monte Carlo Results Dashboard - Phase 10 (FINAL)
 *
 * Outcome probability distributions, survival curves, and statistical analysis.
 * Reference: /designs/12_monte_carlo_results.md
 */

'use client'

import { Panel } from "@/components/core/Panel"
import { MetricCard } from "@/components/core/MetricCard"
import { useEffect, useState } from "react"

export function MonteCarloResultsDashboard() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load Monte Carlo results
    const loadResults = async () => {
      try {
        const response = await fetch('/api/simulation/monte-carlo')
        const data = await response.json()
        setResults(data)
      } catch (error) {
        console.error('Failed to load Monte Carlo results:', error)
      } finally {
        setLoading(false)
      }
    }

    loadResults()
  }, [])

  if (loading) {
    return <div className="p-8">Loading Monte Carlo results...</div>
  }

  if (!results || !results.data) {
    return (
      <div className="p-8">
        <Panel title="No Monte Carlo Results Available" glow="amber">
          <p className="text-sm" style={{ color: 'var(--white-60)' }}>
            Run Monte Carlo simulation to generate statistical analysis:
          </p>
          <pre className="mt-3 p-3 rounded text-xs" style={{ backgroundColor: 'var(--color-near-black)' }}>
            npx tsx scripts/monteCarloSimulation.ts --runs=100 --max-months=120
          </pre>
        </Panel>
      </div>
    )
  }

  const stats = results.data

  // Calculate outcome probabilities
  const outcomes = {
    utopia: ((stats.utopiaCount || 0) / (stats.totalRuns || 1)) * 100,
    dystopia: ((stats.dystopiaCount || 0) / (stats.totalRuns || 1)) * 100,
    extinction: ((stats.extinctionCount || 0) / (stats.totalRuns || 1)) * 100,
    statusQuo: ((stats.statusQuoCount || 0) / (stats.totalRuns || 1)) * 100,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl mb-2">Monte Carlo Results</h1>
        <p style={{ color: 'var(--white-40)' }}>
          Statistical Analysis of {stats.totalRuns || 0} Simulation Runs
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Runs"
          value={stats.totalRuns || 0}
          status="normal"
        />
        <MetricCard
          label="Max Months"
          value={stats.maxMonths || 0}
          status="normal"
        />
        <MetricCard
          label="Avg Run Time"
          value={`${((stats.avgRunTime || 0) / 1000).toFixed(1)}s`}
          status="normal"
        />
        <MetricCard
          label="Completion Rate"
          value={`${(((stats.completedRuns || 0) / (stats.totalRuns || 1)) * 100).toFixed(0)}%`}
          status={(stats.completedRuns || 0) / (stats.totalRuns || 1) >= 0.9 ? 'normal' : 'warning'}
        />
      </div>

      {/* Outcome Probabilities */}
      <Panel title="Outcome Probability Distribution" glow="cyan">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Utopia */}
          <div className="p-4 rounded" style={{ backgroundColor: 'var(--color-near-black)', border: '1px solid var(--color-green)' }}>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Utopia</div>
            <div className="text-4xl font-light mb-3" style={{ color: 'var(--color-green)' }}>
              {outcomes.utopia.toFixed(1)}%
            </div>
            <div className="h-2 rounded" style={{ backgroundColor: 'var(--white-10)' }}>
              <div
                className="h-full rounded"
                style={{
                  width: `${outcomes.utopia}%`,
                  backgroundColor: 'var(--color-green)'
                }}
              />
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--white-40)' }}>
              Sustained abundance, 3+ spirals active, no crises
            </p>
          </div>

          {/* Dystopia */}
          <div className="p-4 rounded" style={{ backgroundColor: 'var(--color-near-black)', border: '1px solid var(--color-amber)' }}>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Dystopia</div>
            <div className="text-4xl font-light mb-3" style={{ color: 'var(--color-amber)' }}>
              {outcomes.dystopia.toFixed(1)}%
            </div>
            <div className="h-2 rounded" style={{ backgroundColor: 'var(--white-10)' }}>
              <div
                className="h-full rounded"
                style={{
                  width: `${outcomes.dystopia}%`,
                  backgroundColor: 'var(--color-amber)'
                }}
              />
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--white-40)' }}>
              Oppressive AI control or failed alignment
            </p>
          </div>

          {/* Extinction */}
          <div className="p-4 rounded" style={{ backgroundColor: 'var(--color-near-black)', border: '1px solid var(--color-red)' }}>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Extinction</div>
            <div className="text-4xl font-light mb-3" style={{ color: 'var(--color-red)' }}>
              {outcomes.extinction.toFixed(1)}%
            </div>
            <div className="h-2 rounded" style={{ backgroundColor: 'var(--white-10)' }}>
              <div
                className="h-full rounded"
                style={{
                  width: `${outcomes.extinction}%`,
                  backgroundColor: 'var(--color-red)'
                }}
              />
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--white-40)' }}>
              Catastrophic collapse or AI takeover
            </p>
          </div>

          {/* Status Quo */}
          <div className="p-4 rounded" style={{ backgroundColor: 'var(--color-near-black)', border: '1px solid var(--white-30)' }}>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Status Quo</div>
            <div className="text-4xl font-light mb-3">
              {outcomes.statusQuo.toFixed(1)}%
            </div>
            <div className="h-2 rounded" style={{ backgroundColor: 'var(--white-10)' }}>
              <div
                className="h-full rounded"
                style={{
                  width: `${outcomes.statusQuo}%`,
                  backgroundColor: 'var(--color-cyan)'
                }}
              />
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--white-40)' }}>
              Ongoing mixed outcomes
            </p>
          </div>
        </div>
      </Panel>

      {/* Survival Analysis */}
      <Panel title="Survival Analysis">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Median Survival Time</div>
            <div className="text-3xl font-light">
              {stats.medianSurvivalMonths || 'N/A'} mo
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--white-40)' }}>
              50% of runs reach this duration
            </p>
          </div>

          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Early Extinction (<50mo)</div>
            <div className="text-3xl font-light" style={{ color: 'var(--color-red)' }}>
              {stats.earlyExtinctionRate?.toFixed(1) || 0}%
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--white-40)' }}>
              Rapid collapse scenarios
            </p>
          </div>

          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Long-Term Stable (>200mo)</div>
            <div className="text-3xl font-light" style={{ color: 'var(--color-green)' }}>
              {stats.longTermStableRate?.toFixed(1) || 0}%
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--white-40)' }}>
              Runs reaching 15+ years
            </p>
          </div>
        </div>
      </Panel>

      {/* AI Capability Trajectories */}
      {stats.avgAICapability && (
        <Panel title="AI Capability Trajectories">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Average Final Capability</div>
              <div className="text-3xl font-light">
                {stats.avgAICapability.toFixed(2)}
              </div>
            </div>

            <div>
              <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Average Final Alignment</div>
              <div className="text-3xl font-light" style={{
                color: (stats.avgAlignment || 0) > 0.7 ? 'var(--color-green)' :
                       (stats.avgAlignment || 0) > 0.5 ? 'var(--color-amber)' :
                       'var(--color-red)'
              }}>
                {stats.avgAlignment?.toFixed(2) || 'N/A'}
              </div>
            </div>

            <div>
              <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Sleeper Detection Rate</div>
              <div className="text-3xl font-light">
                {stats.avgSleeperDetectionRate?.toFixed(1) || 0}%
              </div>
            </div>
          </div>
        </Panel>
      )}

      {/* Crisis Cascade Statistics */}
      {stats.avgCrisisCount !== undefined && (
        <Panel title="Crisis Cascade Statistics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Avg Simultaneous Crises</div>
              <div className="text-3xl font-light">
                {stats.avgCrisisCount.toFixed(1)}
              </div>
            </div>

            <div>
              <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Runs with Cascades</div>
              <div className="text-3xl font-light" style={{ color: 'var(--color-amber)' }}>
                {stats.cascadeRate?.toFixed(1) || 0}%
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--white-40)' }}>
                3+ crises simultaneously
              </p>
            </div>

            <div>
              <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Avg Cascade Multiplier</div>
              <div className="text-3xl font-light">
                {stats.avgCascadeMultiplier?.toFixed(2) || 1.0}x
              </div>
            </div>
          </div>
        </Panel>
      )}

      {/* Planetary Boundaries */}
      {stats.boundaryBreachRate !== undefined && (
        <Panel title="Planetary Boundaries">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Runs with Breaches</div>
              <div className="text-3xl font-light" style={{ color: 'var(--color-amber)' }}>
                {stats.boundaryBreachRate.toFixed(1)}%
              </div>
            </div>

            <div>
              <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Avg Breached Boundaries</div>
              <div className="text-3xl font-light">
                {stats.avgBreachedBoundaries?.toFixed(1) || 0}
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--white-40)' }}>
                Out of 9 total
              </p>
            </div>

            <div>
              <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Tipping Point Rate</div>
              <div className="text-3xl font-light" style={{ color: 'var(--color-red)' }}>
                {stats.tippingPointRate?.toFixed(1) || 0}%
              </div>
            </div>
          </div>
        </Panel>
      )}

      {/* Statistical Summary */}
      <Panel title="Statistical Summary">
        <div className="space-y-3 text-sm" style={{ color: 'var(--white-60)' }}>
          <p>
            <strong>Sample Size:</strong> {stats.totalRuns || 0} runs with {stats.maxMonths || 0} months each.
            Total simulation time: {((stats.totalSimulationTime || 0) / 1000 / 60).toFixed(1)} minutes.
          </p>
          <p>
            <strong>Confidence Intervals:</strong> With N={stats.totalRuns || 0}, outcome probabilities have
            ~{((1.96 * Math.sqrt(0.5 * 0.5 / (stats.totalRuns || 1))) * 100).toFixed(1)}% margin of error (95% CI).
          </p>
          <p>
            <strong>Key Findings:</strong>
            {outcomes.utopia > 50 && ' High utopia probability suggests favorable conditions. '}
            {outcomes.extinction > 20 && ' Significant extinction risk detected. '}
            {outcomes.dystopia > 30 && ' Dystopia outcomes common - alignment challenges persistent. '}
            See individual dashboards for detailed trajectories.
          </p>
        </div>
      </Panel>

      {/* Run Monte Carlo Button */}
      <Panel title="Generate New Results">
        <p className="text-sm mb-3" style={{ color: 'var(--white-60)' }}>
          Run Monte Carlo simulation to generate fresh statistical analysis:
        </p>
        <pre className="p-3 rounded text-xs" style={{ backgroundColor: 'var(--color-near-black)' }}>
          # Quick test (N=10, 120 months){'\n'}
          npx tsx scripts/monteCarloSimulation.ts{'\n\n'}
          # Deep analysis (N=100, 120 months){'\n'}
          npx tsx scripts/monteCarloSimulation.ts --runs=100 --max-months=120{'\n\n'}
          # Extended timeline (N=100, 360 months){'\n'}
          npx tsx scripts/monteCarloSimulation.ts --runs=100 --max-months=360
        </pre>
      </Panel>
    </div>
  )
}
