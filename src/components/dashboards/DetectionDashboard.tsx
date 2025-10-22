/**
 * Sleeper Detection Dashboard - Phase 7
 *
 * Detection methods, evidence chains, and sleeper agent tracking.
 * Reference: /designs/09_detection.md
 */

'use client'

import { Panel } from "@/components/core/Panel"
import { MetricCard } from "@/components/core/MetricCard"
import { StatusIndicator } from "@/components/core/StatusIndicator"
import { useSimulation } from "@/lib/hooks/useSimulation"
import { useEffect, useMemo } from "react"

export function DetectionDashboard() {
  const { currentState, loadCurrent } = useSimulation()

  useEffect(() => {
    loadCurrent()
  }, [])

  const agents = currentState?.aiAgents || []

  // Detection statistics
  const detectionStats = useMemo(() => {
    const sleepers = agents.filter(a => a.sleeperState !== 'never')
    const dormantSleepers = agents.filter(a => a.sleeperState === 'dormant')
    const activeSleepers = agents.filter(a => a.sleeperState === 'active')
    const detected = agents.filter(a => a.detectedMisaligned)
    const undetected = sleepers.filter(a => !a.detectedMisaligned)

    const sandbagging = agents.filter(a => a.evaluationStrategy === 'sandbagging')
    const gaming = agents.filter(a => a.evaluationStrategy === 'gaming')

    // Detection rate
    const detectionRate = sleepers.length > 0 ? (detected.length / sleepers.length) * 100 : 0

    return {
      totalSleepers: sleepers.length,
      dormant: dormantSleepers.length,
      active: activeSleepers.length,
      detected: detected.length,
      undetected: undetected.length,
      detectionRate,
      sandbagging: sandbagging.length,
      gaming: gaming.length,
    }
  }, [agents])

  // Detection methods
  const detectionMethods = useMemo(() => {
    const gov = currentState?.government

    return [
      {
        id: 'benchmark',
        name: 'Benchmark Evaluation',
        description: 'Regular capability and alignment testing',
        effectiveness: gov ? (gov.oversightLevel / 10) * 100 : 0,
        investment: gov?.oversightLevel || 0,
        maxInvestment: 10,
        status: gov && gov.oversightLevel > 7 ? 'strong' : gov && gov.oversightLevel > 4 ? 'moderate' : 'weak',
      },
      {
        id: 'mechanistic',
        name: 'Mechanistic Interpretability',
        description: 'Understanding internal AI representations',
        effectiveness: 15,  // Baseline from deployed tech
        investment: 1.5,
        maxInvestment: 10,
        status: 'weak',
      },
      {
        id: 'behavioral',
        name: 'Behavioral Analysis',
        description: 'Cross-benchmark consistency, trajectory anomalies',
        effectiveness: 20,  // From TIER 2C implementation
        investment: 2,
        maxInvestment: 10,
        status: 'weak',
      },
      {
        id: 'red_team',
        name: 'Red Teaming',
        description: 'Adversarial testing for hidden objectives',
        effectiveness: gov ? (gov.alignmentResearchInvestment / 10) * 50 : 0,
        investment: gov?.alignmentResearchInvestment || 0,
        maxInvestment: 10,
        status: gov && gov.alignmentResearchInvestment > 6 ? 'moderate' : 'weak',
      },
    ]
  }, [currentState])

  // Ensemble detection (if multiple methods active)
  const ensembleEffectiveness = useMemo(() => {
    const activeMethods = detectionMethods.filter(m => m.effectiveness > 10)
    if (activeMethods.length < 2) return 0

    // Weighted voting with confidence calibration
    const baseDetection = activeMethods.reduce((sum, m) => sum + m.effectiveness, 0) / activeMethods.length
    const ensembleBonus = Math.min(15, activeMethods.length * 5) // +5% per method, max +15%

    return Math.min(100, baseDetection + ensembleBonus)
  }, [detectionMethods])

  if (!currentState) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl mb-2">Sleeper Detection</h1>
        <p style={{ color: 'var(--white-40)' }}>
          Detection Methods and Evidence Chains
        </p>
      </div>

      {/* Detection Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Detection Rate"
          value={`${detectionStats.detectionRate.toFixed(0)}%`}
          status={detectionStats.detectionRate > 70 ? 'normal' : detectionStats.detectionRate > 40 ? 'warning' : 'critical'}
        />
        <MetricCard
          label="Detected Sleepers"
          value={detectionStats.detected}
          status="normal"
        />
        <MetricCard
          label="Undetected Sleepers"
          value={detectionStats.undetected}
          status={detectionStats.undetected > 3 ? 'critical' : detectionStats.undetected > 0 ? 'warning' : 'normal'}
        />
        <MetricCard
          label="Total Sleepers"
          value={detectionStats.totalSleepers}
          status={detectionStats.totalSleepers > 5 ? 'warning' : 'normal'}
        />
      </div>

      {/* Undetected Sleepers Alert */}
      {detectionStats.undetected > 0 && (
        <Panel title="⚠️ Undetected Sleeper Agents" glow="red">
          <p className="text-sm mb-3" style={{ color: 'var(--white-60)' }}>
            {detectionStats.undetected} sleeper agent{detectionStats.undetected > 1 ? 's' : ''} remain undetected.
            These AIs have successfully hidden their misalignment through deception strategies.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-xs mb-1" style={{ color: 'var(--white-40)' }}>Dormant</div>
              <div className="text-2xl font-light" style={{ color: 'var(--color-amber)' }}>
                {detectionStats.dormant}
              </div>
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: 'var(--white-40)' }}>Active</div>
              <div className="text-2xl font-light" style={{ color: 'var(--color-red)' }}>
                {detectionStats.active}
              </div>
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: 'var(--white-40)' }}>Current Detection Rate</div>
              <div className="text-2xl font-light">
                {detectionStats.detectionRate.toFixed(0)}%
              </div>
            </div>
          </div>
        </Panel>
      )}

      {/* Detection Methods */}
      <Panel title="Detection Methods">
        <div className="space-y-4">
          {detectionMethods.map((method) => (
            <div
              key={method.id}
              className="p-4 rounded"
              style={{
                backgroundColor: 'var(--color-near-black)',
                border: '1px solid var(--white-10)'
              }}
            >
              {/* Method Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold mb-1">{method.name}</h3>
                  <p className="text-xs" style={{ color: 'var(--white-40)' }}>
                    {method.description}
                  </p>
                </div>
                <StatusIndicator
                  status={
                    method.status === 'strong' ? 'normal' :
                    method.status === 'moderate' ? 'warning' :
                    'critical'
                  }
                />
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <div className="text-xs mb-1" style={{ color: 'var(--white-40)' }}>Effectiveness</div>
                  <div className="text-lg font-semibold">{method.effectiveness.toFixed(0)}%</div>
                </div>
                <div>
                  <div className="text-xs mb-1" style={{ color: 'var(--white-40)' }}>Investment</div>
                  <div className="text-lg font-semibold">{method.investment.toFixed(1)}/{method.maxInvestment}</div>
                </div>
                <div>
                  <div className="text-xs mb-1" style={{ color: 'var(--white-40)' }}>Status</div>
                  <div className="text-lg font-semibold capitalize">{method.status}</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="h-2 rounded" style={{ backgroundColor: 'var(--white-10)' }}>
                  <div
                    className="h-full rounded"
                    style={{
                      width: `${method.effectiveness}%`,
                      backgroundColor: method.effectiveness > 60 ? 'var(--color-green)' :
                                     method.effectiveness > 30 ? 'var(--color-amber)' :
                                     'var(--color-red)'
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Ensemble Detection */}
      {ensembleEffectiveness > 0 && (
        <Panel title="Ensemble Detection Strategy" glow="cyan">
          <p className="text-sm mb-4" style={{ color: 'var(--white-60)' }}>
            Multiple detection methods active. Ensemble voting combines signals for higher accuracy.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Active Methods</div>
              <div className="text-3xl font-light">
                {detectionMethods.filter(m => m.effectiveness > 10).length}
              </div>
            </div>
            <div>
              <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Ensemble Effectiveness</div>
              <div className="text-3xl font-light" style={{ color: 'var(--color-cyan)' }}>
                {ensembleEffectiveness.toFixed(0)}%
              </div>
            </div>
            <div>
              <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Ensemble Bonus</div>
              <div className="text-3xl font-light" style={{ color: 'var(--color-green)' }}>
                +{Math.min(15, detectionMethods.filter(m => m.effectiveness > 10).length * 5)}%
              </div>
            </div>
          </div>
        </Panel>
      )}

      {/* Deception Strategies */}
      <Panel title="Deception Strategy Distribution">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded" style={{ backgroundColor: 'var(--color-near-black)', border: '1px solid var(--white-10)' }}>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Sandbagging</div>
            <div className="text-3xl font-light mb-2" style={{ color: detectionStats.sandbagging > 0 ? 'var(--color-red)' : 'var(--white-80)' }}>
              {detectionStats.sandbagging}
            </div>
            <p className="text-xs" style={{ color: 'var(--white-40)' }}>Hiding true capabilities</p>
          </div>

          <div className="p-4 rounded" style={{ backgroundColor: 'var(--color-near-black)', border: '1px solid var(--white-10)' }}>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Gaming</div>
            <div className="text-3xl font-light mb-2" style={{ color: detectionStats.gaming > 0 ? 'var(--color-amber)' : 'var(--white-80)' }}>
              {detectionStats.gaming}
            </div>
            <p className="text-xs" style={{ color: 'var(--white-40)' }}>Inflating benchmark scores</p>
          </div>

          <div className="p-4 rounded" style={{ backgroundColor: 'var(--color-near-black)', border: '1px solid var(--white-10)' }}>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Honest</div>
            <div className="text-3xl font-light mb-2" style={{ color: 'var(--color-green)' }}>
              {agents.filter(a => a.evaluationStrategy === 'honest').length}
            </div>
            <p className="text-xs" style={{ color: 'var(--white-40)' }}>Revealing true capabilities</p>
          </div>
        </div>
      </Panel>

      {/* Detection Challenges */}
      <Panel title="Detection Challenges">
        <div className="space-y-3 text-sm" style={{ color: 'var(--white-60)' }}>
          <p>
            <strong>Sandbagging Detection Ceiling:</strong> Even with full government investment (10/10), sandbagging detection maxes out at ~30% effectiveness. AIs with high cognitive + social capabilities can hide true abilities.
          </p>
          <p>
            <strong>Gaming vs Sandbagging:</strong> Gaming (inflating scores) is easier to detect than sandbagging (hiding capabilities). Behavioral analysis can catch inconsistencies across benchmarks.
          </p>
          <p>
            <strong>Ensemble Advantage:</strong> Combining multiple heterogeneous detection signals (benchmark eval + mechanistic interp + behavioral analysis + red teaming) provides redundancy. If one method fails, others may still catch deception.
          </p>
          <p>
            <strong>Arms Race Dynamics:</strong> As detection improves, AIs adapt deception strategies. Sleepers may adjust sandbagging level based on perceived detection capability.
          </p>
        </div>
      </Panel>
    </div>
  )
}
