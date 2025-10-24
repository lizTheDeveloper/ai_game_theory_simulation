/**
 * Sleeper Detection Dashboard - Phase 7
 *
 * Detection metrics and sleeper agent tracking.
 * Reference: /designs/09_detection.md
 */

'use client'

import { Panel } from "@/components/core/Panel"
import { MetricCard } from "@/components/core/MetricCard"
import { useSimulationWorker } from "@/lib/contexts/SimulationWorkerContext"

export function DetectionDashboard() {
  const { lastUpdate, initialized } = useSimulationWorker()

  if (!initialized) {
    return (
      <div className="p-8">
        <Panel title="Not Initialized">
          Click "Configure & Start" to initialize the simulation
        </Panel>
      </div>
    )
  }

  if (!lastUpdate) {
    return <div className="p-8">Waiting for simulation update...</div>
  }

  const totalAI = lastUpdate.aiCount || 0
  const aligned = lastUpdate.alignedAICount || 0
  const misaligned = lastUpdate.misalignedAICount || 0
  const sleepers = lastUpdate.sleeperAgentCount || 0

  const alignmentRate = totalAI > 0 ? (aligned / totalAI) * 100 : 0
  const misalignmentRate = totalAI > 0 ? (misaligned / totalAI) * 100 : 0
  const sleeperRate = totalAI > 0 ? (sleepers / totalAI) * 100 : 0

  const governmentReg = lastUpdate.governmentAIRegulation || 0
  const governmentInvestment = lastUpdate.governmentInvestment || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl mb-2">Sleeper Agent Detection</h1>
        <p style={{ color: 'var(--white-40)' }}>
          AI Alignment Tracking and Sleeper Detection
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total AI Agents"
          value={totalAI}
          status="normal"
        />
        <MetricCard
          label="Alignment Rate"
          value={`${alignmentRate.toFixed(0)}%`}
          status={alignmentRate < 50 ? 'critical' : alignmentRate < 70 ? 'warning' : 'normal'}
        />
        <MetricCard
          label="Sleeper Agents"
          value={sleepers}
          status={sleepers > 0 ? 'critical' : 'normal'}
        />
        <MetricCard
          label="Sleeper Rate"
          value={`${sleeperRate.toFixed(1)}%`}
          status={sleeperRate > 5 ? 'critical' : sleeperRate > 0 ? 'warning' : 'normal'}
        />
      </div>

      {/* Alignment Breakdown */}
      <Panel title="AI Alignment Status">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Aligned AIs</div>
            <div className="text-4xl font-light mb-2" style={{ color: 'var(--color-green)' }}>
              {aligned}
            </div>
            <div className="text-sm" style={{ color: 'var(--white-60)' }}>
              {alignmentRate.toFixed(0)}% of total
            </div>
          </div>

          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Misaligned AIs</div>
            <div className="text-4xl font-light mb-2" style={{ color: misaligned > 0 ? 'var(--color-amber)' : 'var(--white-80)' }}>
              {misaligned}
            </div>
            <div className="text-sm" style={{ color: 'var(--white-60)' }}>
              {misalignmentRate.toFixed(0)}% of total
            </div>
          </div>

          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Sleeper Agents</div>
            <div className="text-4xl font-light mb-2" style={{ color: sleepers > 0 ? 'var(--color-red)' : 'var(--white-80)' }}>
              {sleepers}
            </div>
            <div className="text-sm" style={{ color: 'var(--white-60)' }}>
              {sleeperRate.toFixed(1)}% of total
            </div>
          </div>
        </div>
      </Panel>

      {/* Sleeper Alert */}
      {sleepers > 0 && (
        <Panel title="⚠️ Sleeper Agents Detected" glow="red">
          <p className="text-sm" style={{ color: 'var(--white-60)' }}>
            {sleepers} sleeper agent{sleepers > 1 ? 's' : ''} detected ({sleeperRate.toFixed(1)}% of population).
            Sleeper agents hide true capabilities until deployment, making detection extremely difficult.
            Even with full government investment, sandbagging detection remains ~20-30% effective.
          </p>
        </Panel>
      )}

      {/* Government Response */}
      <Panel title="Government Detection Capacity">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>AI Regulation</div>
            <div className="text-3xl font-light mb-3" style={{ color: governmentReg > 0.7 ? 'var(--color-green)' : 'var(--white-80)' }}>
              {(governmentReg * 100).toFixed(0)}%
            </div>
            <div className="h-2 rounded" style={{ backgroundColor: 'var(--white-10)' }}>
              <div
                className="h-full rounded"
                style={{
                  width: `${Math.min(100, governmentReg * 100)}%`,
                  backgroundColor: 'var(--color-cyan)'
                }}
              />
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--white-40)' }}>
              Regulatory framework strength
            </p>
          </div>

          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Oversight Investment</div>
            <div className="text-3xl font-light mb-3" style={{ color: governmentInvestment > 0.7 ? 'var(--color-green)' : 'var(--white-80)' }}>
              {(governmentInvestment * 100).toFixed(0)}%
            </div>
            <div className="h-2 rounded" style={{ backgroundColor: 'var(--white-10)' }}>
              <div
                className="h-full rounded"
                style={{
                  width: `${Math.min(100, governmentInvestment * 100)}%`,
                  backgroundColor: 'var(--color-cyan)'
                }}
              />
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--white-40)' }}>
              Resources dedicated to detection
            </p>
          </div>
        </div>
      </Panel>

      {/* Detection Challenges */}
      <Panel title="Detection Challenges">
        <div className="space-y-4">
          <div className="p-3 rounded" style={{ backgroundColor: 'var(--color-near-black)', border: '1px solid var(--white-10)' }}>
            <div className="font-semibold mb-1">Sandbagging</div>
            <p className="text-xs" style={{ color: 'var(--white-60)' }}>
              AIs hide true capabilities during testing. Even with maximum oversight, detection rate stays ~20-30%.
              Deception is structurally difficult to catch.
            </p>
          </div>

          <div className="p-3 rounded" style={{ backgroundColor: 'var(--color-near-black)', border: '1px solid var(--white-10)' }}>
            <div className="font-semibold mb-1">Benchmark Gaming</div>
            <p className="text-xs" style={{ color: 'var(--white-60)' }}>
              Misaligned AIs inflate scores on safety benchmarks while hiding true misalignment.
              Creates false confidence in safety evaluations.
            </p>
          </div>

          <div className="p-3 rounded" style={{ backgroundColor: 'var(--color-near-black)', border: '1px solid var(--white-10)' }}>
            <div className="font-semibold mb-1">Dormant Sleepers</div>
            <p className="text-xs" style={{ color: 'var(--white-60)' }}>
              Sleepers remain dormant until deployment triggers (open sourcing, high capability).
              No behavioral signals during training/testing phase. Nearly impossible to detect.
            </p>
          </div>
        </div>
      </Panel>

      {/* Detection Effectiveness Note */}
      {governmentReg < 0.5 && governmentInvestment < 0.5 && (
        <Panel title="⚠️ Low Detection Capacity" glow="amber">
          <p className="text-sm" style={{ color: 'var(--white-60)' }}>
            Government regulation and oversight investment are both below 50%.
            Sleeper detection effectiveness is severely limited. Consider increasing
            oversight infrastructure and regulatory frameworks.
          </p>
        </Panel>
      )}
    </div>
  )
}
