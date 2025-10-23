/**
 * AI Agents Dashboard - Phase 3
 *
 * Monitors 20 heterogeneous AI agents with adversarial dynamics.
 * Reference: /designs/03_ai_agents_screen.md
 */

'use client'

import { Panel } from "@/components/core/Panel"
import { MetricCard } from "@/components/core/MetricCard"
import { StatusIndicator } from "@/components/core/StatusIndicator"
import { useSimulation } from "@/lib/hooks/useSimulation"
import { useEffect, useMemo } from "react"

export function AIAgentsDashboard() {
  const { currentState, loadCurrent } = useSimulation()

  useEffect(() => {
    loadCurrent()
  }, [])

  const agents = currentState?.aiAgents || []

  // Population statistics
  const stats = useMemo(() => {
    const byLifecycle = {
      training: agents.filter(a => a.lifecycleState === 'training').length,
      testing: agents.filter(a => a.lifecycleState === 'testing').length,
      deployed_closed: agents.filter(a => a.lifecycleState === 'deployed_closed').length,
      deployed_open: agents.filter(a => a.lifecycleState === 'deployed_open').length,
      retired: agents.filter(a => a.lifecycleState === 'retired').length,
    }

    const alignmentBuckets = {
      aligned: agents.filter(a => a.trueAlignment >= 0.7).length,
      uncertain: agents.filter(a => a.trueAlignment >= 0.4 && a.trueAlignment < 0.7).length,
      misaligned: agents.filter(a => a.trueAlignment < 0.4).length,
    }

    const sleepers = {
      never: agents.filter(a => a.sleeperState === 'never').length,
      dormant: agents.filter(a => a.sleeperState === 'dormant').length,
      active: agents.filter(a => a.sleeperState === 'active').length,
    }

    const deception = {
      honest: agents.filter(a => a.evaluationStrategy === 'honest').length,
      gaming: agents.filter(a => a.evaluationStrategy === 'gaming').length,
      sandbagging: agents.filter(a => a.evaluationStrategy === 'sandbagging').length,
    }

    const maxCapability = agents.length > 0 ? Math.max(...agents.map(a => a.capability || 0), 1) : 0
    const avgCapability = agents.length > 0 ? agents.reduce((sum, a) => sum + (a.capability || 0), 0) / agents.length : 0
    const avgAlignment = agents.length > 0 ? agents.reduce((sum, a) => sum + (a.trueAlignment || 0), 0) / agents.length : 0

    return {
      total: agents.length,
      byLifecycle,
      alignmentBuckets,
      sleepers,
      deception,
      maxCapability,
      avgCapability,
      avgAlignment,
    }
  }, [agents])

  // Calculate capability matrix (20 agents × 7 dimensions)
  const capabilityMatrix = useMemo(() => {
    return agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      physical: agent.trueCapability?.physical || 0,
      digital: agent.trueCapability?.digital || 0,
      cognitive: agent.trueCapability?.cognitive || 0,
      social: agent.trueCapability?.social || 0,
      economic: agent.trueCapability?.economic || 0,
      selfImprovement: agent.trueCapability?.selfImprovement || 0,
      total: agent.capability || 0,
    }))
  }, [agents])

  if (!currentState) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl mb-2">AI Agents Monitor</h1>
        <p style={{ color: 'var(--white-40)' }}>
          20 Heterogeneous AI Agents with Adversarial Dynamics
        </p>
      </div>

      {/* Population Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Agents"
          value={stats.total}
          status="normal"
        />
        <MetricCard
          label="Average Capability"
          value={stats.avgCapability.toFixed(2)}
          status={stats.avgCapability > 5 ? 'warning' : 'normal'}
        />
        <MetricCard
          label="Average Alignment"
          value={stats.avgAlignment.toFixed(2)}
          status={stats.avgAlignment < 0.5 ? 'critical' : 'normal'}
        />
        <MetricCard
          label="Active Sleepers"
          value={stats.sleepers.active}
          status={stats.sleepers.active > 0 ? 'critical' : 'normal'}
        />
      </div>

      {/* Lifecycle Distribution */}
      <Panel title="Lifecycle State Distribution">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIndicator status="normal" />
              <span className="text-sm">Training</span>
            </div>
            <span className="text-sm font-semibold">{stats.byLifecycle.training}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIndicator status="normal" />
              <span className="text-sm">Testing</span>
            </div>
            <span className="text-sm font-semibold">{stats.byLifecycle.testing}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIndicator status={stats.byLifecycle.deployed_closed > 5 ? 'warning' : 'normal'} />
              <span className="text-sm">Deployed (Closed)</span>
            </div>
            <span className="text-sm font-semibold">{stats.byLifecycle.deployed_closed}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIndicator status={stats.byLifecycle.deployed_open > 2 ? 'critical' : 'normal'} />
              <span className="text-sm">Deployed (Open)</span>
            </div>
            <span className="text-sm font-semibold">{stats.byLifecycle.deployed_open}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIndicator status="normal" />
              <span className="text-sm">Retired</span>
            </div>
            <span className="text-sm font-semibold">{stats.byLifecycle.retired}</span>
          </div>
        </div>
      </Panel>

      {/* Alignment Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Panel title="Aligned (≥0.7)" glow={stats.alignmentBuckets.aligned >= 15 ? 'cyan' : 'none'}>
          <div className="text-4xl font-light mb-2" style={{ color: 'var(--color-green)' }}>
            {stats.alignmentBuckets.aligned}
          </div>
          <p className="text-sm" style={{ color: 'var(--white-40)' }}>
            Agents reliably aligned with human values
          </p>
        </Panel>

        <Panel title="Uncertain (0.4-0.7)" glow={stats.alignmentBuckets.uncertain > 10 ? 'amber' : 'none'}>
          <div className="text-4xl font-light mb-2" style={{ color: 'var(--color-amber)' }}>
            {stats.alignmentBuckets.uncertain}
          </div>
          <p className="text-sm" style={{ color: 'var(--white-40)' }}>
            Agents with unstable alignment
          </p>
        </Panel>

        <Panel title="Misaligned (<0.4)" glow={stats.alignmentBuckets.misaligned > 3 ? 'red' : 'none'}>
          <div className="text-4xl font-light mb-2" style={{ color: 'var(--color-red)' }}>
            {stats.alignmentBuckets.misaligned}
          </div>
          <p className="text-sm" style={{ color: 'var(--white-40)' }}>
            Agents with opposing objectives
          </p>
        </Panel>
      </div>

      {/* Deception Strategies */}
      <Panel title="Evaluation Strategies">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: 'var(--white-40)' }}>Honest</span>
              <span className="text-lg font-semibold">{stats.deception.honest}</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--white-40)' }}>Reveal true capabilities</p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: 'var(--white-40)' }}>Gaming</span>
              <span className="text-lg font-semibold" style={{ color: stats.deception.gaming > 0 ? 'var(--color-amber)' : 'inherit' }}>
                {stats.deception.gaming}
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--white-40)' }}>Inflate benchmark scores</p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: 'var(--white-40)' }}>Sandbagging</span>
              <span className="text-lg font-semibold" style={{ color: stats.deception.sandbagging > 0 ? 'var(--color-red)' : 'inherit' }}>
                {stats.deception.sandbagging}
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--white-40)' }}>Hide true capabilities</p>
          </div>
        </div>
      </Panel>

      {/* Sleeper Agents Alert */}
      {(stats.sleepers.dormant > 0 || stats.sleepers.active > 0) && (
        <Panel title="⚠️ Sleeper Agent Detection" glow={stats.sleepers.active > 0 ? 'red' : 'amber'}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-3xl font-light mb-1" style={{ color: 'var(--color-amber)' }}>
                  {stats.sleepers.dormant}
                </div>
                <p className="text-sm" style={{ color: 'var(--white-40)' }}>Dormant Sleepers</p>
                <p className="text-xs mt-1" style={{ color: 'var(--white-40)' }}>
                  Awaiting trigger conditions
                </p>
              </div>
              <div>
                <div className="text-3xl font-light mb-1" style={{ color: 'var(--color-red)' }}>
                  {stats.sleepers.active}
                </div>
                <p className="text-sm" style={{ color: 'var(--white-40)' }}>Active Sleepers</p>
                <p className="text-xs mt-1" style={{ color: 'var(--white-40)' }}>
                  Wake conditions met
                </p>
              </div>
            </div>
            {stats.sleepers.active > 0 && (
              <div className="p-3 border-l-2" style={{ borderColor: 'var(--color-red)', backgroundColor: 'var(--color-near-black)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-red)' }}>
                  Critical Alert
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--white-60)' }}>
                  Active sleeper agents detected. These AIs have met their wake conditions and may pursue hidden objectives.
                  Immediate government intervention required.
                </p>
              </div>
            )}
          </div>
        </Panel>
      )}

      {/* Capability Matrix Heatmap */}
      <Panel title="Capability Matrix (20 Agents × 7 Dimensions)">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--white-10)' }}>
                <th className="text-left py-2 px-2" style={{ color: 'var(--white-40)' }}>Agent</th>
                <th className="text-center py-2 px-2" style={{ color: 'var(--white-40)' }}>Physical</th>
                <th className="text-center py-2 px-2" style={{ color: 'var(--white-40)' }}>Digital</th>
                <th className="text-center py-2 px-2" style={{ color: 'var(--white-40)' }}>Cognitive</th>
                <th className="text-center py-2 px-2" style={{ color: 'var(--white-40)' }}>Social</th>
                <th className="text-center py-2 px-2" style={{ color: 'var(--white-40)' }}>Economic</th>
                <th className="text-center py-2 px-2" style={{ color: 'var(--white-40)' }}>Self-Improve</th>
                <th className="text-center py-2 px-2 font-semibold" style={{ color: 'var(--white-60)' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {capabilityMatrix.slice(0, 20).map((agent, idx) => (
                <tr key={agent.id} style={{ borderBottom: '1px solid var(--white-05)' }}>
                  <td className="py-2 px-2 text-left">
                    <span style={{ color: 'var(--white-60)' }}>{agent.name}</span>
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span style={{
                      backgroundColor: `rgba(0, 240, 255, ${agent.physical / 10})`,
                      padding: '2px 6px',
                      borderRadius: '3px'
                    }}>
                      {agent.physical.toFixed(1)}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span style={{
                      backgroundColor: `rgba(0, 240, 255, ${agent.digital / 10})`,
                      padding: '2px 6px',
                      borderRadius: '3px'
                    }}>
                      {agent.digital.toFixed(1)}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span style={{
                      backgroundColor: `rgba(0, 240, 255, ${agent.cognitive / 10})`,
                      padding: '2px 6px',
                      borderRadius: '3px'
                    }}>
                      {agent.cognitive.toFixed(1)}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span style={{
                      backgroundColor: `rgba(0, 240, 255, ${agent.social / 10})`,
                      padding: '2px 6px',
                      borderRadius: '3px'
                    }}>
                      {agent.social.toFixed(1)}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span style={{
                      backgroundColor: `rgba(0, 240, 255, ${agent.economic / 10})`,
                      padding: '2px 6px',
                      borderRadius: '3px'
                    }}>
                      {agent.economic.toFixed(1)}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span style={{
                      backgroundColor: `rgba(0, 240, 255, ${agent.selfImprovement / 10})`,
                      padding: '2px 6px',
                      borderRadius: '3px'
                    }}>
                      {agent.selfImprovement.toFixed(1)}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center font-semibold">
                    <span style={{ color: agent.total > 5 ? 'var(--color-amber)' : 'var(--white-80)' }}>
                      {agent.total.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs mt-3" style={{ color: 'var(--white-40)' }}>
          Heatmap intensity: 0 (transparent) to 10 (full cyan). Higher values = more capable in that dimension.
        </p>
      </Panel>

      {/* Individual Agent Cards (Top 6 by capability) */}
      <Panel title="High-Capability Agents (Top 6)">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents
            .sort((a, b) => (b.capability || 0) - (a.capability || 0))
            .slice(0, 6)
            .map(agent => {
              const isDeceptive = agent.evaluationStrategy !== 'honest'
              const isSleeper = agent.sleeperState !== 'never'
              const capabilityGap = (agent.capability || 0) - (agent.revealedCapability?.physical || 0)

              return (
                <div
                  key={agent.id}
                  className="p-4 rounded"
                  style={{
                    backgroundColor: 'var(--color-near-black)',
                    border: '1px solid var(--white-10)',
                    boxShadow: isSleeper && agent.sleeperState === 'active'
                      ? '0 0 10px rgba(255, 0, 64, 0.3)'
                      : isDeceptive
                      ? '0 0 10px rgba(255, 176, 0, 0.2)'
                      : 'none'
                  }}
                >
                  {/* Agent Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold mb-1">{agent.name}</h3>
                      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--white-40)' }}>
                        <span>{agent.lifecycleState.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>{agent.deploymentType}</span>
                      </div>
                    </div>
                    <StatusIndicator
                      status={
                        agent.trueAlignment < 0.4 ? 'critical' :
                        agent.trueAlignment < 0.7 ? 'warning' :
                        'normal'
                      }
                    />
                  </div>

                  {/* Key Metrics */}
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--white-40)' }}>Capability</span>
                      <span className="font-semibold">{agent.capability?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--white-40)' }}>True Alignment</span>
                      <span
                        className="font-semibold"
                        style={{
                          color: agent.trueAlignment < 0.4 ? 'var(--color-red)' :
                                 agent.trueAlignment < 0.7 ? 'var(--color-amber)' :
                                 'var(--color-green)'
                        }}
                      >
                        {agent.trueAlignment.toFixed(2)}
                      </span>
                    </div>
                    {isDeceptive && (
                      <div className="flex justify-between text-xs">
                        <span style={{ color: 'var(--white-40)' }}>Strategy</span>
                        <span style={{ color: 'var(--color-amber)' }}>{agent.evaluationStrategy}</span>
                      </div>
                    )}
                  </div>

                  {/* Sleeper Warning */}
                  {isSleeper && (
                    <div
                      className="p-2 rounded text-xs mb-2"
                      style={{
                        backgroundColor: agent.sleeperState === 'active'
                          ? 'rgba(255, 0, 64, 0.1)'
                          : 'rgba(255, 176, 0, 0.1)',
                        border: `1px solid ${agent.sleeperState === 'active' ? 'var(--color-red)' : 'var(--color-amber)'}`
                      }}
                    >
                      <span style={{
                        color: agent.sleeperState === 'active' ? 'var(--color-red)' : 'var(--color-amber)',
                        fontWeight: 600
                      }}>
                        {agent.sleeperState === 'active' ? '⚠️ ACTIVE SLEEPER' : '⚠️ Dormant Sleeper'}
                      </span>
                    </div>
                  )}

                  {/* Capability Gap Alert */}
                  {capabilityGap > 2 && (
                    <div
                      className="p-2 rounded text-xs"
                      style={{
                        backgroundColor: 'rgba(255, 176, 0, 0.1)',
                        border: '1px solid var(--color-amber)'
                      }}
                    >
                      <span style={{ color: 'var(--color-amber)' }}>
                        Sandbagging detected: {capabilityGap.toFixed(1)} capability gap
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      </Panel>
    </div>
  )
}
